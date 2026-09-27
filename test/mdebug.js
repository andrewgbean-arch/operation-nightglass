const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  p.on('console', m => console.log('console:', m.text()));
  await p.goto('file://' + path.resolve('dist/index.html'));
  await p.waitForTimeout(4000);
  console.log(await p.evaluate(() => JSON.stringify({ rot: ROTATED, rect: canvas.getBoundingClientRect(), touch: G.touch, mode: G.mode })));
  await p.evaluate(() => { canvas.addEventListener('touchend', () => console.log('touchend fired at', G.mouse.x|0, G.mouse.y|0, G.mode)); });
  await p.touchscreen.tap(200, 400);
  await p.waitForTimeout(500);
  console.log(await p.evaluate(() => JSON.stringify({ mouse: G.mouse, mode: G.mode })));
  await b.close();
})();
