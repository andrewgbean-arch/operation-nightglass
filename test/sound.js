const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('dist/chapter1.html'));
  await p.waitForTimeout(3500);
  console.log('before tap:', await p.evaluate(() => Sound.ctx ? Sound.ctx.state : 'no audio yet'));
  await p.touchscreen.tap(200, 400); await p.waitForTimeout(400);
  console.log('after tap:', await p.evaluate(() => Sound.ctx.state + ', silent-switch element ' + (Sound._silent ? 'playing' : 'missing')));
  await p.evaluate(() => NightglassAudio.pause()); await p.waitForTimeout(300);
  console.log('app backgrounded:', await p.evaluate(() => Sound.ctx.state));
  await p.evaluate(() => NightglassAudio.resume()); await p.waitForTimeout(300);
  console.log('app back:', await p.evaluate(() => Sound.ctx.state));
  await b.close();
})();
