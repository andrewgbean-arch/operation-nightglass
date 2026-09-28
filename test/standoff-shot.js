// Screenshot the Chapter One office standoff (guard in the doorway).
//   node test/standoff-shot.js [out.png]
const { chromium } = require('playwright'); const path = require('path');
const out = process.argv[2] || 'test/s1_standoff.png';
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('dist/chapter1.html')); await p.waitForTimeout(2500);
  await p.evaluate(() => { G.flags = {}; startPlay(); G.standoffT = 10; G.sceneId = null; gotoScene('office', 720, 880, -1, { instant: true });
    setInterval(() => { const s = G.speech[0]; if (s) endSpeech(s); }, 50); });
  await p.waitForTimeout(1500);
  await p.evaluate(() => { const g = makeFigure('guard', 180, 900, { id: 'officeGuard', facing: 1, arm: 'point', seed: 10, depthScale: true }); g.scale = depthScale(900); G.actors.push(g); flag('standoff', true); G.jack.facing = -1; });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: out });
  await b.close(); })();
