// Screenshots of the bigger UI on a phone (upright) and a laptop.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch();
  for (const [name, opts] of [['phone', { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }], ['laptop', { viewport: { width: 1440, height: 810 } }]]) {
    const ctx = await b.newContext(opts); const p = await ctx.newPage();
    p.on('pageerror', e => console.log('PAGEERROR:', e.message));
    await p.goto('file://' + path.resolve('dist/chapter2.html')); await p.waitForTimeout(4000);
    await p.screenshot({ path: `test/ui_${name}_title.png` });
    await p.evaluate(`(async () => { G.touch = ${!!opts.hasTouch}; G.flags = { flatIntro: true, ilseFled: true, franzHolstered: true }; startPlay(); G.sceneId = null; await gotoScene('flat', 780, 990, -1, { instant: true }); G.inv = ['passport', 'ticket', 'sugar', 'cake', 'chocolates']; G.invPinned = true; run(() => say(actor('franz'), 'Platform nine is the Iron Arrow, the midnight express from Karvograd to Moscow.')); })()`);
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `test/ui_${name}_play.png` });
    await p.evaluate(`G.speech = []; G.busy = false; void run(() => choose([{ text: 'Who are you, really?', value: 1 }, { text: 'The film was a decoy. Where are the real plans?', value: 2 }, { text: 'Time I was going.', value: 3 }]))`);
    await p.waitForTimeout(600);
    await p.screenshot({ path: `test/ui_${name}_choices.png` });
    await p.evaluate(`G.choices = null; G.paused = true`);
    await p.waitForTimeout(400);
    await p.screenshot({ path: `test/ui_${name}_pause.png` });
    await ctx.close();
  }
  await b.close();
})();
