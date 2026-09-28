// The circuit on a phone: hold a finger where you want the car to go.
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('dist/chapter8.html')); await p.waitForTimeout(4000);
  await p.touchscreen.tap(700, 100); await p.waitForTimeout(300);
  await p.evaluate(() => { G.flags = {}; startPlay(); CircuitRun.start(); });
  await p.waitForTimeout(1200);
  const before = await p.evaluate(() => CircuitRun.off.toFixed(0));
  const cdp = await p.context().newCDPSession(p);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 700, y: 300 }] });
  await p.waitForTimeout(700);
  const after = await p.evaluate(() => CircuitRun.off.toFixed(0));
  console.log('touches', await p.evaluate(() => JSON.stringify(G.touches)), 'steer', await p.evaluate(() => CircuitRun.steer()), 'spin', await p.evaluate(() => CircuitRun.spin), 'auto', await p.evaluate(() => CircuitRun.autoSteer));
  await p.screenshot({ path: 'test/c8_mobile.png' });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  console.log('steered right with a finger:', before, '->', after);
  await b.close(); })();
