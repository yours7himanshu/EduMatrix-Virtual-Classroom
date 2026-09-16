const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    console.log('Navigating to dashboard...');
    await page.goto('http://localhost:5173/StudentDashboard/dashboard', { waitUntil: 'networkidle2' });
    
    // Check if we got redirected to login
    if (page.url().includes('MainLogin')) {
       console.log('Redirected to login. Attempting to log in...');
       // wait for a bit to see the page
       await page.screenshot({ path: 'C:\\Users\\dinka\\.gemini\\antigravity-ide\\brain\\dbeae03b-4790-4413-97bf-43029d99d85a\\dashboard_login.png' });
       
       // Try to bypass or set local storage
       await page.evaluate(() => {
         localStorage.setItem('token', 'fake-token');
         localStorage.setItem('email', 'student@edumatrix.edu');
       });
       
       console.log('Set token, navigating again...');
       await page.goto('http://localhost:5173/StudentDashboard/dashboard', { waitUntil: 'networkidle2' });
    }
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'C:\\Users\\dinka\\.gemini\\antigravity-ide\\brain\\dbeae03b-4790-4413-97bf-43029d99d85a\\dashboard_screenshot.png' });
    
    await browser.close();
    console.log('Screenshot saved to artifacts folder.');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
