const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.log('TIMEOUT:', e.message));
  const html = await page.content();
  if (html.includes('error-overlay')) {
      const text = await page.$eval('#error-overlay', el => el.innerText);
      console.log('ERROR OVERLAY TEXT:', text);
  }
  await browser.close();
})();
