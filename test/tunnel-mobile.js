// The tunnel on a phone: hold a finger to crawl, lift it to freeze.
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('dist/chapter7.html')); await p.waitForTimeout(4000);
  await p.touchscreen.tap(700, 100); await p.waitForTimeout(300);
  await p.evaluate(() => { G.flags = {}; startPlay(); TunnelCrawl.start(); });
  await p.waitForTimeout(1500);
  // hold a finger down for two seconds (synthetic touch events), then lift it
  const cdp = await p.context().newCDPSession(p);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 400, y: 200 }] });
  await p.waitForTimeout(2000);
  const moved = await p.evaluate(() => TunnelCrawl.pos.toFixed(1));
  await p.screenshot({ path: 'test/c7_mobile.png' });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(800);
  console.log('crawled while held:', moved, 'm; still after lifting:', await p.evaluate(() => [TunnelCrawl.pos.toFixed(1), TunnelCrawl.moving]));
  await b.close(); })();
