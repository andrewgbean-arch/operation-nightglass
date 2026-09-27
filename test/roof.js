const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('src/index.html'));
  await p.waitForTimeout(3500);
  await p.evaluate(() => { startPlay(); Rooftop.start(); });
  await p.waitForTimeout(2500);
  // Naive bot: hold right, jump at gap edges, count failures.
  const res = await p.evaluate(() => new Promise(done => {
    let fails = 0, maxExp = 0, t0 = performance.now();
    KEYS.ArrowRight = true;
    const orig = Rooftop.fail.bind(Rooftop);
    Rooftop.fail = function (w) { if (!this.dead) fails++; return orig(w); };
    const iv = setInterval(() => {
      const j = Rooftop.j;
      maxExp = Math.max(maxExp, Rooftop.exposure);
      for (const [a, b] of Rooftop.segments) if (j.x > b - 70 && j.x < b && Rooftop.onGround) Rooftop.jumpQueued = true;
      if (Rooftop.done || performance.now() - t0 > 60000) { clearInterval(iv); KEYS.ArrowRight = false; done({ fails, done: Rooftop.done, x: j.x | 0, maxExp }); }
    }, 16);
  }));
  console.log(JSON.stringify(res));
  await p.screenshot({ path: 'test/s_roof2.png' });
  await b.close();
})();
