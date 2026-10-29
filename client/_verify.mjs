import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://127.0.0.1:5173';
const OUT = 'C:\\Users\\dinka\\AppData\\Local\\Temp\\opencode\\edushots';
fs.mkdirSync(OUT, { recursive: true });
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const report = { checks: [], sweep: [], pdfs: [], screenshots: [], errors: [] };
let failures = 0;

function expect(name, condition, detail = '') {
  const ok = Boolean(condition);
  report.checks.push({ name, ok, detail });
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}

const PUBLIC_ROUTES = [
  ['home', '/'], ['about', '/aboutUs'], ['contact', '/contact'], ['courses', '/courses'],
  ['notes', '/notes'], ['syllabus', '/syllabus'], ['main-login', '/MainLogin'],
  ['login', '/login'], ['not-found', '/definitely-not-a-page'],
];
const AUTH_ROUTES = [
  ['dashboard', '/StudentDashboard/dashboard'], ['announcements', '/StudentDashboard/announcement'],
  ['assignments', '/StudentDashboard/assignment'], ['quizzes', '/StudentDashboard/quiz'],
  ['library', '/StudentDashboard/library'], ['ai', '/ai'], ['pdf-summarizer', '/StudentDashboard/notes'],
  ['teachers-notes', '/StudentDashboard/teachersNotes'], ['pay-fees', '/StudentDashboard/payfees'],
  ['live-class', '/live-class'],
];
const EXPECTED_CONSOLE = [
  /ERR_CONNECTION_REFUSED/i, /Failed to fetch/i, /Network Error/i, /AxiosError/i,
  /Failed to load resource/i, /fetch quizzes/i, /Ledger fetch error/i, /load fee ledger/i,
  /socket/i, /WebSocket/i,
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-first-run', '--no-default-browser-check', '--disable-features=Translate', '--hide-scrollbars'],
});

async function makePage(viewport, authenticated) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport(viewport);
  await page.evaluateOnNewDocument((auth) => {
    localStorage.clear();
    if (auth) {
      localStorage.setItem('token', 'audit-token');
      localStorage.setItem('email', 'aarav.sharma@college.edu');
    }
  }, authenticated);
  const state = { errors: [] };
  page.on('pageerror', (e) => state.errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') state.errors.push(`${m.type()}: ${m.text()}`);
  });
  return { context, page, state };
}

function unexpected(errors) {
  return errors.filter((message) => !EXPECTED_CONSOLE.some((rx) => rx.test(message)));
}

// ── 1. Layout/overflow/error sweep at narrow phone + tablet ──────────────────
const sweepViewports = [
  { name: '320', width: 320, height: 720, isMobile: true, hasTouch: true },
  { name: '768', width: 768, height: 1024, isMobile: true, hasTouch: true },
];
for (const vp of sweepViewports) {
  for (const [group, routes, authenticated] of [['public', PUBLIC_ROUTES, false], ['auth', AUTH_ROUTES, true]]) {
    const { context, page, state } = await makePage(vp, authenticated);
    for (const [name, route] of routes) {
      state.errors.length = 0;
      try {
        await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await delay(850);
        const metrics = await page.evaluate(() => {
          const doc = document.documentElement;
          const vw = doc.clientWidth;
          const outside = [];
          for (const el of document.querySelectorAll('body *')) {
            const r = el.getBoundingClientRect();
            if (r.width < 2 || r.height < 2) continue;
            if (r.right <= vw + 1 && r.left >= -1) continue;
            const style = getComputedStyle(el);
            if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) continue;
            if (el.closest('[aria-hidden="true"], .animate-marquee, .no-scrollbar, .table-scroll, [class*="overflow-x-auto"], [class*="overflow-x-scroll"]')) continue;
            outside.push({
              tag: el.tagName.toLowerCase(),
              cls: typeof el.className === 'string' ? el.className.slice(0, 70) : '',
              left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width),
            });
          }
          return {
            title: document.title,
            path: location.pathname,
            scrollWidth: doc.scrollWidth,
            clientWidth: vw,
            h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim().replace(/\s+/g, ' ').slice(0, 80)),
            outside: outside.slice(0, 8),
            bodyLocked: document.body.style.overflow === 'hidden',
          };
        });
        const bad = unexpected(state.errors);
        report.sweep.push({ vp: vp.name, group, name, route, ...metrics, errors: bad });
        if (metrics.scrollWidth > metrics.clientWidth + 1) {
          failures += 1;
          console.log(`FAIL  ${vp.name}px ${name}: document overflow ${metrics.scrollWidth - metrics.clientWidth}px`);
        }
        if (bad.length) {
          failures += 1;
          console.log(`FAIL  ${vp.name}px ${name}: console — ${bad.slice(0, 2).join(' | ')}`);
        }
        if (vp.name === '320' && ['home', 'courses', 'notes', 'dashboard', 'main-login', 'not-found'].includes(name)) {
          const shot = path.join(OUT, `verify-${vp.name}-${name}.png`);
          await page.screenshot({ path: shot, fullPage: true });
          report.screenshots.push(shot);
        }
      } catch (e) {
        failures += 1;
        report.sweep.push({ vp: vp.name, group, name, route, fatal: String(e).slice(0, 300) });
        console.log(`FAIL  ${vp.name}px ${name}: ${String(e).slice(0, 160)}`);
      }
    }
    await context.close();
  }
}

// ── 2. Fresh unauthenticated access screen ───────────────────────────────────
{
  const { context, page, state } = await makePage({ width: 390, height: 844, isMobile: true, hasTouch: true }, false);
  await page.goto(BASE + '/StudentDashboard/dashboard', { waitUntil: 'domcontentloaded' });
  await delay(700);
  const info = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent.trim().replace(/\s+/g, ' '),
    hasLogin: !!document.querySelector('a[href="/login"]'),
    hasMain: !!document.querySelector('main#main-content'),
    bodyText: document.body.innerText.slice(0, 500),
  }));
  expect('fresh protected route shows access screen', info.h1?.includes('classroom needs a') && info.hasLogin, JSON.stringify(info.h1));
  expect('access screen has main landmark', info.hasMain);
  expect('access screen has no unexpected console errors', unexpected(state.errors).length === 0, unexpected(state.errors).join(' | '));
  await page.screenshot({ path: path.join(OUT, 'verify-access-390.png'), fullPage: true });
  report.screenshots.push(path.join(OUT, 'verify-access-390.png'));
  await context.close();
}
{
  const { context, page } = await makePage({ width: 1440, height: 900 }, false);
  await page.goto(BASE + '/StudentDashboard/dashboard', { waitUntil: 'domcontentloaded' });
  await delay(700);
  await page.screenshot({ path: path.join(OUT, 'verify-access-1440.png'), fullPage: true });
  report.screenshots.push(path.join(OUT, 'verify-access-1440.png'));
  await context.close();
}

// ── 3. Mobile menu lock, Escape, route close ─────────────────────────────────
{
  const { context, page } = await makePage({ width: 390, height: 844, isMobile: true, hasTouch: true }, false);
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await delay(600);
  const trigger = 'button[aria-controls="mobile-navigation"]';
  expect('mobile menu trigger exists', await page.$(trigger));
  await page.click(trigger);
  await delay(250);
  const opened = await page.evaluate(() => ({
    expanded: document.querySelector('button[aria-controls="mobile-navigation"]')?.getAttribute('aria-expanded'),
    nav: !!document.querySelector('#mobile-navigation'),
    overflow: document.body.style.overflow,
  }));
  expect('mobile menu opens with aria-expanded=true', opened.expanded === 'true' && opened.nav);
  expect('mobile menu locks body scroll', opened.overflow === 'hidden', opened.overflow);
  await page.screenshot({ path: path.join(OUT, 'verify-mobile-menu.png'), fullPage: false });
  report.screenshots.push(path.join(OUT, 'verify-mobile-menu.png'));
  await page.keyboard.press('Escape');
  await delay(350);
  const closed = await page.evaluate(() => ({
    expanded: document.querySelector('button[aria-controls="mobile-navigation"]')?.getAttribute('aria-expanded'),
    nav: !!document.querySelector('#mobile-navigation'),
    overflow: document.body.style.overflow,
  }));
  expect('Escape closes mobile menu', closed.expanded === 'false' && !closed.nav);
  expect('Escape restores body scroll', closed.overflow !== 'hidden', JSON.stringify(closed.overflow));
  await page.click(trigger);
  await delay(200);
  await page.click('#mobile-navigation a[href="/courses"]');
  await delay(650);
  const routeClosed = await page.evaluate(() => ({
    path: location.pathname,
    nav: !!document.querySelector('#mobile-navigation'),
    overflow: document.body.style.overflow,
  }));
  expect('mobile menu closes on route change', routeClosed.path === '/courses' && !routeClosed.nav, JSON.stringify(routeClosed));
  await context.close();
}

// ── 4. Contact FAQ interaction ──────────────────────────────────────────────
{
  const { context, page } = await makePage({ width: 390, height: 844, isMobile: true, hasTouch: true }, false);
  await page.goto(BASE + '/contact', { waitUntil: 'domcontentloaded' });
  await delay(700);
  await page.$eval('#faq-button-0', (el) => el.scrollIntoView({ block: 'center' }));
  await delay(250);
  const before = await page.$eval('#faq-button-0', (el) => el.getAttribute('aria-expanded'));
  await page.click('#faq-button-0');
  await delay(450);
  const after = await page.evaluate(() => ({
    expanded: document.querySelector('#faq-button-0')?.getAttribute('aria-expanded'),
    hidden: document.querySelector('#faq-panel-0')?.getAttribute('aria-hidden'),
    height: document.querySelector('#faq-panel-0')?.getBoundingClientRect().height,
  }));
  expect('FAQ starts collapsed', before === 'false', before);
  expect('FAQ expands on click', after.expanded === 'true' && after.hidden === 'false' && after.height > 10, JSON.stringify(after));
  await page.screenshot({ path: path.join(OUT, 'verify-contact-faq.png'), fullPage: false });
  report.screenshots.push(path.join(OUT, 'verify-contact-faq.png'));
  await context.close();
}

// ── 5. Notes search + clear ─────────────────────────────────────────────────
{
  const { context, page } = await makePage({ width: 390, height: 844, isMobile: true, hasTouch: true }, false);
  await page.goto(BASE + '/notes', { waitUntil: 'domcontentloaded' });
  await delay(650);
  const initial = await page.$$eval('section a[href$=".pdf"]', (els) => els.length);
  await page.type('#notes-search', 'machine');
  await delay(350);
  const filtered = await page.$$eval('section a[href$=".pdf"]', (els) => els.length);
  const countText = await page.$eval('[aria-live="polite"]', (el) => el.textContent.trim().replace(/\s+/g, ' '));
  expect('notes search filters cards', initial === 6 && filtered === 1, `${initial} -> ${filtered}`);
  expect('notes result count updates', countText.includes('1 of 6'), countText);
  await page.click('button[aria-label="Clear search"]');
  await delay(300);
  const cleared = await page.$$eval('section a[href$=".pdf"]', (els) => els.length);
  expect('notes clear search restores cards', cleared === 6, String(cleared));
  await page.type('#notes-search', 'zzzz-no-match');
  await delay(300);
  const empty = await page.evaluate(() => document.body.innerText.includes('No notes found'));
  expect('notes empty state is shown', empty);
  await context.close();
}

// ── 6. Login password visibility ────────────────────────────────────────────
{
  const { context, page } = await makePage({ width: 390, height: 844, isMobile: true, hasTouch: true }, false);
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  await delay(500);
  await page.type('#login-password', 'sample-password');
  const typeBefore = await page.$eval('#login-password', (el) => el.type);
  await page.click('button[aria-label="Show password"]');
  const typeAfter = await page.$eval('#login-password', (el) => el.type);
  const labelAfter = await page.$eval('button[aria-pressed="true"]', (el) => el.getAttribute('aria-label'));
  expect('password is hidden by default', typeBefore === 'password', typeBefore);
  expect('password visibility toggle works', typeAfter === 'text' && labelAfter === 'Hide password', `${typeAfter}/${labelAfter}`);
  await context.close();
}

// ── 7. Skip link ────────────────────────────────────────────────────────────
{
  const { context, page } = await makePage({ width: 1440, height: 900 }, false);
  await page.goto(BASE + '/aboutUs', { waitUntil: 'domcontentloaded' });
  await delay(500);
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => ({
    text: document.activeElement?.textContent?.trim(),
    tag: document.activeElement?.tagName,
    href: document.activeElement?.getAttribute('href'),
  }));
  expect('skip link is first focus target', focused.text === 'Skip to content' && focused.href === '#main-content', JSON.stringify(focused));
  await page.keyboard.press('Enter');
  await delay(400);
  const mainFocus = await page.evaluate(() => ({ id: document.activeElement?.id, tag: document.activeElement?.tagName }));
  expect('skip link moves focus to main content', mainFocus.id === 'main-content', JSON.stringify(mainFocus));
  await context.close();
}

// ── 8. PDFs linked across notes + syllabus ──────────────────────────────────
{
  const { context, page } = await makePage({ width: 1280, height: 900 }, false);
  const urls = new Set();
  for (const route of ['/notes', '/syllabus']) {
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
    await delay(500);
    const found = await page.$$eval('a[href$=".pdf"]', (els) => els.map((a) => a.getAttribute('href')));
    found.forEach((href) => urls.add(href));
  }
  await context.close();
  for (const url of urls) {
    try {
      const res = await fetch(BASE + url);
      const body = await res.arrayBuffer();
      const type = res.headers.get('content-type') || '';
      const entry = { url, status: res.status, type, bytes: body.byteLength };
      report.pdfs.push(entry);
      expect(`PDF ${url}`, res.ok && type.includes('application/pdf') && body.byteLength > 1000, JSON.stringify(entry));
    } catch (e) {
      report.pdfs.push({ url, fatal: String(e) });
      expect(`PDF ${url}`, false, String(e));
    }
  }
}

// ── 9. Fresh branded screenshots at desktop & phone ─────────────────────────
const SCREENSHOT_ROUTES = [
  ['home', '/', false], ['courses', '/courses', false], ['notes', '/notes', false],
  ['syllabus', '/syllabus', false], ['contact', '/contact', false], ['main-login', '/MainLogin', false],
  ['not-found', '/definitely-not-a-page', false], ['dashboard', '/StudentDashboard/dashboard', true],
  ['live-class', '/live-class', true],
];
for (const [vpName, viewport] of [['1440', { width: 1440, height: 900 }], ['390', { width: 390, height: 844, isMobile: true, hasTouch: true }]]) {
  for (const authenticated of [false, true]) {
    const routes = SCREENSHOT_ROUTES.filter(([, , auth]) => auth === authenticated);
    if (!routes.length) continue;
    const { context, page } = await makePage(viewport, authenticated);
    for (const [name, route] of routes) {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
      await delay(900);
      if (vpName === '390') {
        const shot = path.join(OUT, `verify-${vpName}-${name}-full.png`);
        await page.screenshot({ path: shot, fullPage: true });
        report.screenshots.push(shot);
      }
      const shot = path.join(OUT, `verify-${vpName}-${name}.png`);
      await page.screenshot({ path: shot, fullPage: false });
      report.screenshots.push(shot);
    }
    await context.close();
  }
}

// ── 10. Report ──────────────────────────────────────────────────────────────
report.summary = {
  checks: report.checks.length,
  passed: report.checks.filter((c) => c.ok).length,
  failed: report.checks.filter((c) => !c.ok).length,
  pageVisits: report.sweep.length,
  pageOverflowFailures: report.sweep.filter((s) => s.scrollWidth > s.clientWidth + 1).length,
  consoleFailures: report.sweep.filter((s) => s.errors?.length).length,
  pdfCount: report.pdfs.length,
};
fs.writeFileSync(path.join(OUT, 'verify-report.json'), JSON.stringify(report, null, 2));
console.log('\nSUMMARY', JSON.stringify(report.summary, null, 2));
console.log('Sweep console/overflow details:');
for (const s of report.sweep) {
  if (s.errors?.length || s.scrollWidth > s.clientWidth + 1 || s.fatal) {
    console.log(JSON.stringify({ vp: s.vp, name: s.name, overflow: s.scrollWidth - s.clientWidth, errors: s.errors, fatal: s.fatal, outside: s.outside }, null, 2));
  }
}
await browser.close();
if (failures) process.exitCode = 1;
