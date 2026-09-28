// Screenshots of each kind of obstacle in the Underground chase.
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('dist/chapter10.html')); await p.waitForTimeout(2500);
  await p.evaluate(() => { G.flags = {}; startPlay(); G.sceneId = null; gotoScene('office', 900, 960, 1, { instant: true }); });
  await p.waitForTimeout(800);
  await p.evaluate(() => { TubeRun.start(); TubeRun.introT = 9; TubeRun.update = () => {}; });
  for (const what of ['plank', 'sign', 'paper', 'brolly', 'holdall', 'case']) {
    const ok = await p.evaluate(w => { const o = TubeRun.course.find(o => o.what === w); if (!o) return false; TubeRun.pos = o.x - 250; return true; }, what);
    if (!ok) { console.log('none', what); continue; }
    await p.waitForTimeout(300); await p.screenshot({ path: `test/tube_${what}.png` });
  }
  await p.evaluate(() => { TubeRun.pos = TubeRun.end - 300; }); await p.waitForTimeout(300); await p.screenshot({ path: 'test/tube_end.png' });
  await b.close(); })();
