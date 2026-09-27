// The gondola chase on a phone: touch controls, the DUCK button, a tap to row.
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('dist/chapter6.html')); await p.waitForTimeout(4000);
  await p.touchscreen.tap(700, 100); await p.waitForTimeout(300);
  await p.evaluate(() => { G.flags = { gondolier: true }; startPlay(); GondolaRun.start(); });
  await p.waitForTimeout(2500);
  for (let i = 0; i < 6; i++) { await p.touchscreen.tap(420, 200); await p.waitForTimeout(600); }
  console.log('speed after taps', await p.evaluate(() => GondolaRun.v.toFixed(2)));
  await p.screenshot({ path: 'test/c6_mobile.png' });
  await b.close(); })();
