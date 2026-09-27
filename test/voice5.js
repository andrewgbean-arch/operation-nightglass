const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const p = await b.newPage();
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('dist/chapter5.html')); await p.waitForTimeout(3000);
  await p.mouse.click(500, 300); await p.waitForTimeout(300);
  for (const [id, t] of [['mustafa', 'Finished. He will wake tomorrow. Very happy. Very flat.'], ['hollis', 'Yee-haw! Now that\'s what I call a floor show!'], ['leyla', 'He says he will take the goose as well. The one called Colonel.'], ['riza', 'Buy a carpet. Not today. One day. A big one.']]) {
    const r = await p.evaluate(([id, t]) => new Promise(res => { const ok = Voice.speak(id, t, done => res({ ok, done, dur: Voice.decoded[id + '|' + t] && Voice.decoded[id + '|' + t].duration })); if (!ok) res({ ok }); }), [id, t]);
    console.log(id, JSON.stringify(r));
  }
  await b.close(); })();
