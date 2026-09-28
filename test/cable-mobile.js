// The cable on a phone: tap the left and right halves of the screen in turn.
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('dist/chapter9.html')); await p.waitForTimeout(4000);
  await p.touchscreen.tap(420, 100); await p.waitForTimeout(300);
  await p.evaluate(() => { G.flags = {}; startPlay(); CableClimb.start(); CableClimb.nextGust = 99; });
  await p.waitForTimeout(1000);
  for (let i = 0; i < 8; i++) { await p.touchscreen.tap(i % 2 ? 640 : 200, 250); await p.waitForTimeout(200); }
  console.log('climbed', await p.evaluate(() => CableClimb.pos.toFixed(1)), 'm with 8 taps');
  await p.screenshot({ path: 'test/c9_mobile.png' });
  await b.close(); })();
