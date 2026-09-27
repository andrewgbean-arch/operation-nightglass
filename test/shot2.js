const { chromium } = require('playwright');
(async () => {
  const [,, url, out, wait] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('console', m => console.log('console:', m.text()));
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto(url);
  await p.waitForTimeout(+wait || 1500);
  await p.screenshot({ path: out });
  await b.close();
})();
