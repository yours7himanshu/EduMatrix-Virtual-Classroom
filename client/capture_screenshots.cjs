const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const targetPhase = process.argv[2] || 'before';
const outDir = path.join(__dirname, '..', 'screenshots', targetPhase);

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generates an unsigned mock token dynamically for local screenshot testing without hardcoding JWT strings
function createMockAdminToken() {
  if (process.env.ADMIN_MOCK_TOKEN) {
    return process.env.ADMIN_MOCK_TOKEN;
  }
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ role: 'admin', name: 'Admin User', id: 'mock-admin' })).toString('base64url');
  return `${header}.${payload}.mock_sig`;
}

const clientPages = [
  { name: 'client_home', path: '/' },
  { name: 'client_about', path: '/aboutUs' },
  { name: 'client_contact', path: '/contact' },
  { name: 'client_courses', path: '/courses' },
  { name: 'client_notes', path: '/notes' },
  { name: 'client_mainlogin', path: '/MainLogin' },
  { name: 'client_login', path: '/login' },
  { name: 'client_signup', path: '/signup' },
  { name: 'client_student_dashboard', path: '/StudentDashboard/dashboard', auth: true },
  { name: 'client_student_library', path: '/StudentDashboard/library', auth: true },
  { name: 'client_student_quiz', path: '/StudentDashboard/quiz', auth: true },
  { name: 'client_student_assignment', path: '/StudentDashboard/assignment', auth: true },
  { name: 'client_student_ai', path: '/ai', auth: true }
];

const adminPages = [
  { name: 'admin_login', path: '/' },
  { name: 'admin_signup', path: '/sign-up' },
  { name: 'admin_dashboard', path: '/dashboard', auth: true },
  { name: 'admin_teachers', path: '/teachers', auth: true },
  { name: 'admin_add_teacher', path: '/add-teachers', auth: true },
  { name: 'admin_students', path: '/enroll-students', auth: true },
  { name: 'admin_announcement', path: '/announcement', auth: true },
  { name: 'admin_timetable', path: '/timetable', auth: true },
  { name: 'admin_library', path: '/MainLayout', auth: true },
  { name: 'admin_question_generator', path: '/question-generator' }
];

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const viewports = [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'desktop', width: 1280, height: 800 }
  ];

  try {
    const page = await browser.newPage();

    // 1. Client pages (port 5174)
    console.log('--- Capturing Client Pages (http://localhost:5174) ---');
    for (const p of clientPages) {
      for (const vp of viewports) {
        await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.name === 'mobile' });
        const url = `http://localhost:5174${p.path}`;
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
          if (p.auth) {
            await page.evaluate(() => {
              localStorage.setItem('token', 'mock-token-123');
              localStorage.setItem('email', 'student@edumatrix.edu');
            });
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
          }
          await new Promise(r => setTimeout(r, 1200));
          const filename = `${p.name}_${vp.name}.png`;
          await page.screenshot({ path: path.join(outDir, filename), fullPage: false });
          console.log(`Saved: ${filename}`);
        } catch (err) {
          console.error(`Failed ${p.name} ${vp.name}:`, err.message);
        }
      }
    }

    // 2. Admin pages (port 5173)
    console.log('--- Capturing Admin Pages (http://localhost:5173) ---');
    for (const p of adminPages) {
      for (const vp of viewports) {
        await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.name === 'mobile' });
        const url = `http://localhost:5173${p.path}`;
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
          if (p.auth) {
            const adminToken = createMockAdminToken();
            await page.evaluate((token) => {
              localStorage.setItem('token', token);
              localStorage.setItem('user', JSON.stringify({ role: 'admin', name: 'Admin User' }));
            }, adminToken);
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
          }
          // Admin has a 2000ms loader! Let's wait 3000ms
          await new Promise(r => setTimeout(r, 3000));
          const filename = `${p.name}_${vp.name}.png`;
          await page.screenshot({ path: path.join(outDir, filename), fullPage: false });
          console.log(`Saved: ${filename}`);
        } catch (err) {
          console.error(`Failed ${p.name} ${vp.name}:`, err.message);
        }
      }
    }
  } finally {
    await browser.close();
    console.log(`All captures completed for phase: ${targetPhase}`);
  }
}

capture().catch(console.error);
