const { chromium } = require('playwright');
(async () => {
  const [,, page, out, wait] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('console', m => console.log('console:', m.text()));
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + require('path').resolve(page));
  await p.waitForTimeout(+wait || 800);
  await p.screenshot({ path: out });
  await b.close();
})();
