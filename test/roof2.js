const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('src/index.html'));
  await p.waitForTimeout(3500);
  await p.evaluate(() => { startPlay(); Rooftop.start(); });
  await p.waitForTimeout(1000);
  // Smart bot: waits behind each chimney until a simulated dash to the next cover is safe.
  const res = await p.evaluate(() => new Promise(done => {
    let fails = 0, waits = [], t0 = performance.now();
    const R = Rooftop;
    const orig = R.fail.bind(R);
    const log = []; R.fail = function (w) { if (!this.dead) { fails++; if (log.length < 12) log.push(w + '@' + (this.j.x|0) + ' st=' + state + ' cr=' + this.j.crouch.toFixed(2) + ' hid=' + this.hidden); } return orig(w); };
    const covers = [...R.chimneys, R.zipX + 100];
    const safe = (x0, x1) => {
      let e = R.exposure, t = R.t;
      for (let x = x0; x < x1; x += 470 / 60) {
        t += 1 / 60;
        let lit = false;
        for (const L of R.lights) {
          const a = Math.sin(t * L.speed + L.ph) * L.amp;
          const ang = Math.atan2(x - L.x, (ROOF_Y + 420) - (ROOF_Y - 110));
          if (Math.abs(ang - a) < BEAM_HW) lit = true;
        }
        e = lit ? e + 2.4 / 60 : Math.max(0, e - 0.3 / 60);
        if (e > 0.85) return false;
      }
      return true;
    };
    let state = 'run', waitStart = 0, target = null;
    const iv = setInterval(() => {
      const j = R.j;
      if (R.dead) { KEYS.ArrowRight = false; state = 'run'; return; }
      const next = covers.find(c => c > j.x + 30);
      const cur = R.inCover(j.x);
      if (state === 'run') {
        KEYS.ArrowRight = true;
        if (cur !== undefined && Math.abs(j.x - cur) < 25 && !safe(j.x, next)) { state = 'wait'; waitStart = performance.now(); KEYS.ArrowRight = false; }
      } else if (state === 'wait') {
        KEYS.ArrowRight = false;
        if (safe(j.x, next)) { waits.push(((performance.now() - waitStart) / 1000).toFixed(1)); state = 'go'; KEYS.ArrowRight = true; target = next; }
      } else if (state === 'go') {
        KEYS.ArrowRight = true;
        if (j.x > target - 20) state = 'run';
      }
      for (const [a, b] of R.segments) if (j.x > b - 70 && j.x < b && R.onGround) R.jumpQueued = true;
      if (R.done || performance.now() - t0 > 90000) { clearInterval(iv); KEYS.ArrowRight = false; done({ fails, done: R.done, x: j.x | 0, waits, log }); }
    }, 16);
  }));
  console.log(JSON.stringify(res));
  await b.close();
})();
