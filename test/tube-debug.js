// Runs the Underground chase on autopilot and reports every stumble.
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('dist/chapter10.html')); await p.waitForTimeout(2500);
  await p.evaluate(() => { G.flags = {}; startPlay(); G.sceneId = null; gotoScene('office', 900, 960, 1, { instant: true }); });
  await p.waitForTimeout(800);
  await p.evaluate(() => { window.HITS = []; const orig = TubeRun.hitBy.bind(TubeRun); TubeRun.hitBy = o => { HITS.push([o.what, (o.x - TubeRun.pos).toFixed(0), TubeRun.jy.toFixed(0), TubeRun.duckT.toFixed(2), TubeRun.stumble.toFixed(2)]); orig(o); }; TubeRun.start(); TubeRun.autopilot = true; setInterval(() => { const s = G.speech[0]; if (s) endSpeech(s); }, 50); });
  await p.waitForFunction(() => TubeRun.done || TubeRun.pos >= TubeRun.end, null, { timeout: 120000 });
  console.log(JSON.stringify(await p.evaluate(() => HITS)), 'time', await p.evaluate(() => TubeRun.t.toFixed(1)));
  await b.close(); })();
