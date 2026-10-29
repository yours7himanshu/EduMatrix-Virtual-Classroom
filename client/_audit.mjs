import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://127.0.0.1:5173';
const OUT = 'C:\\Users\\dinka\\AppData\\Local\\Temp\\opencode\\edushots';
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  ['home', '/'],
  ['about', '/aboutUs'],
  ['contact', '/contact'],
  ['courses', '/courses'],
  ['notes', '/notes'],
  ['syllabus', '/syllabus'],
  ['main-login', '/MainLogin'],
  ['login', '/login'],
  ['not-found', '/does-not-exist'],
  ['access-restricted', '/StudentDashboard/dashboard'],
  ['dashboard', '/StudentDashboard/dashboard'],
  ['announcements', '/StudentDashboard/announcement'],
  ['assignments', '/StudentDashboard/assignment'],
  ['quizzes', '/StudentDashboard/quiz'],
  ['library', '/StudentDashboard/library'],
  ['ai-assistant', '/ai'],
  ['pdf-summarizer', '/StudentDashboard/notes'],
  ['teachers-notes', '/StudentDashboard/teachersNotes'],
  ['pay-fees', '/StudentDashboard/payfees'],
  ['live-class', '/live-class'],
];

const VIEWPORTS = [
  ['desktop', { width: 1440, height: 900, deviceScaleFactor: 1 }],
  ['mobile', { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true }],
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-first-run', '--no-default-browser-check', '--disable-features=Translate', '--hide-scrollbars'],
});

const report = [];

for (const [vpName, viewport] of VIEWPORTS) {
  for (const [name, route] of PAGES) {
    const page = await browser.newPage();
    await page.setViewport(viewport);
    const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

    // Authenticated shell for dashboard routes; no real API needed for visual audit.
    const auth = ['dashboard','announcements','assignments','quizzes','library','ai-assistant','pdf-summarizer','teachers-notes','pay-fees','live-class'].includes(name);
    if (auth) {
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem('token', 'audit-token');
        localStorage.setItem('email', 'aarav.sharma@college.edu');
      });
    }

    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise((r) => setTimeout(r, 700));

      // Trigger lazy loading + AOS reveals by walking the page.
      await page.evaluate(async () => {
        const step = Math.round(window.innerHeight * 0.75);
        const max = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        for (let y = 0; y < max; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 70));
        }
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise((r) => setTimeout(r, 300));
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 250));
      });
      await new Promise((r) => setTimeout(r, 600));

      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const vw = doc.clientWidth;
        const overflow = [];
        document.querySelectorAll('body *').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width > 1 && (r.right > vw + 2 || r.left < -2)) {
            const style = getComputedStyle(el);
            if (style.position === 'fixed' && style.visibility === 'hidden') return;
            const tag = el.tagName.toLowerCase();
            const cls = typeof el.className === 'string' ? el.className.slice(0, 90) : '';
            // ignore intentional marquee / off-screen visual queues
            if (el.closest('[aria-hidden="true"]') || el.closest('.animate-marquee')) return;
            overflow.push({ tag, cls, left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) });
          }
        });
        return {
          title: document.title,
          url: location.pathname,
          scrollWidth: doc.scrollWidth,
          clientWidth: vw,
          scrollHeight: doc.scrollHeight,
          overflow: overflow.slice(0, 12),
          h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim().slice(0, 90)),
        };
      });

      const safe = `${vpName}-${name}`;
      await page.screenshot({ path: path.join(OUT, `${safe}.png`), fullPage: true });
      // Top viewport crop for quick gut check
      await page.screenshot({ path: path.join(OUT, `${safe}-top.png`), fullPage: false });
      report.push({ vpName, name, ...metrics, errors: errors.slice(0, 6) });
    } catch (e) {
      report.push({ vpName, name, fatal: String(e).slice(0, 300), errors: errors.slice(0, 6) });
    } finally {
      await page.close();
    }
  }
}

fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.map(({ vpName, name, scrollWidth, clientWidth, scrollHeight, overflow, errors, fatal }) => ({
  vpName, name, scrollWidth, clientWidth, scrollHeight,
  overflow: overflow?.length || 0,
  worst: overflow?.slice(0, 3),
  errors: errors?.length ? errors : undefined,
  fatal,
})), null, 2));

await browser.close();
