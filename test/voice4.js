const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const p = await b.newPage();
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('dist/chapter4.html')); await p.waitForTimeout(3000);
  await p.mouse.click(500, 300); await p.waitForTimeout(300);
  for (const [id, t] of [['marta', 'Mirek has had eleven slivovitz. After eleven, I give him water. He has not noticed for three years.'], ['hruby', 'A SWAN! It is a swan! Get it away! Not again! NOT AGAIN!'], ['hana', 'Everyone forgets engineers. Go!'], ['vlasta', 'Buy some bread next time. You look hungry. Also fat.'], ['mirek', 'Friend! Na zdraví!']]) {
    const r = await p.evaluate(([id, t]) => new Promise(res => { const ok = Voice.speak(id, t, done => res({ ok, done, dur: Voice.decoded[id + '|' + t] && Voice.decoded[id + '|' + t].duration })); if (!ok) res({ ok }); }), [id, t]);
    console.log(id, JSON.stringify(r));
  }
  await b.close(); })();
