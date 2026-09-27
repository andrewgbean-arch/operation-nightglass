const { chromium, devices } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  for (const [name, vp] of [['portrait', { width: 390, height: 844 }], ['landscape', { width: 844, height: 390 }]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    p.on('pageerror', e => console.log('PAGEERROR:', e.message));
    await p.goto('file://' + path.resolve('dist/chapter1.html'));
    await p.waitForTimeout(5000);
    // tap "New Mission" through the real coordinate mapping
    const tapLogical = async (lx, ly) => {
      const pt = await p.evaluate(([lx, ly]) => { const r = canvas.getBoundingClientRect(); return ROTATED ? [r.right - ly / H * r.width, r.top + lx / W * r.height] : [r.left + lx / W * r.width, r.top + ly / H * r.height]; }, [lx, ly]);
      await p.touchscreen.tap(pt[0], pt[1]);
    };
    await p.screenshot({ path: `test/m_${name}_title.png` });
    const items = await p.evaluate(() => Title.items().map(i => [i.text, i.x + 100, i.y + 30]));
    const nm = items.find(i => i[0] === 'New Mission');
    await tapLogical(1500, 200); await p.waitForTimeout(300);
    await tapLogical(nm[1], nm[2]); await p.waitForTimeout(800);
    for (let i = 0; i < 14 && await p.evaluate(() => G.mode === "text"); i++) { await tapLogical(960, 540); await p.waitForTimeout(250); }
    await p.waitForFunction(() => G.mode === 'play', null, { timeout: 20000 });
    await p.waitForTimeout(2500);
    // tap the bag button, then press-and-hold the window to examine it
    await tapLogical(1920 - 235, 47);
    await p.waitForTimeout(600);
    await p.screenshot({ path: `test/m_${name}_play.png` });
    console.log(name, await p.evaluate(() => JSON.stringify({ rotated: ROTATED, mode: G.mode, invPinned: !!G.invPinned, touch: G.touch })));
    await ctx.close();
  }
  await b.close();
})();
