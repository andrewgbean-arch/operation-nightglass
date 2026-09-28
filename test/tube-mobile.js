// The Underground chase on a phone: tap the top half to jump, the bottom half to duck.
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('dist/chapter10.html')); await p.waitForTimeout(4000);
  await p.touchscreen.tap(420, 100); await p.waitForTimeout(300);
  await p.evaluate(() => { G.flags = {}; startPlay(); TubeRun.start(); });
  await p.waitForTimeout(800);
  await p.touchscreen.tap(420, 80); await p.waitForTimeout(120);
  const jumped = await p.evaluate(() => TubeRun.jy < 0);
  await p.waitForTimeout(1200);
  await p.touchscreen.tap(420, 330); await p.waitForTimeout(120);
  const ducked = await p.evaluate(() => TubeRun.duckT > 0);
  console.log('jump on top tap:', jumped, ' duck on bottom tap:', ducked);
  await p.screenshot({ path: 'test/c10_mobile.png' });
  await b.close(); })();
