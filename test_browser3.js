const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle0', timeout: 5000 }).catch(e => console.log('TIMEOUT:', e.message));
  const html = await page.content();
  console.log('ROOT INNERHTML:', await page.$eval('#root', el => el.innerHTML));
  await browser.close();
})();
