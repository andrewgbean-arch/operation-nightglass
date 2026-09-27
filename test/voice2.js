const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const p = await b.newPage();
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('dist/chapter2.html')); await p.waitForTimeout(3000);
  await p.mouse.click(500, 300); await p.waitForTimeout(300);
  for (const [id, t] of [['vasko', 'Good evening, Mr Harrow. Tickets, please.'], ['zora', 'Tea we have. Lemon we had in 1984.'], ['tannoy', 'Attention, please. The Iron Arrow to Moscow will depart from platform nine at twenty three fifty nine. Platforms seven to nine are closed to the public.']]) {
    const r = await p.evaluate(([id, t]) => new Promise(res => { const ok = Voice.speak(id, t, done => res({ ok, done, dur: Voice.decoded[id + '|' + t] && Voice.decoded[id + '|' + t].duration })); if (!ok) res({ ok }); }), [id, t]);
    console.log(id, JSON.stringify(r));
  }
  await b.close(); })();
