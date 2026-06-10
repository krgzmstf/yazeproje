const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto('http://localhost:1000/dashboard', { waitUntil: 'networkidle', timeout: 20000 });
  await new Promise(r => setTimeout(r, 1500));
  try { await page.click('button:has-text("Kabul")'); await new Promise(r => setTimeout(r, 400)); } catch(e) {}
  await page.fill('input[type="email"]', 'krgzmstf@gmail.com');
  await page.fill('input[type="password"]', 'Test1234!');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 4000));
  // Yedek butonunu bul ve tıkla
  try {
    const btns = await page.$$eval('button, a', els => els.map(e => e.textContent?.trim()).filter(t => t));
    console.log('butonlar:', btns.slice(0,20).join(', '));
    const yedekBtn = page.locator('text=Yedek').first();
    await yedekBtn.click({ timeout: 5000 });
    await new Promise(r => setTimeout(r, 1500));
  } catch(e) { console.log('yedek btn yok:', e.message.slice(0,80)); }
  await page.screenshot({ path: './public/images/test-backup.png' });
  await browser.close();
  console.log('ok');
})().catch(e => console.log('hata:', e.message));
