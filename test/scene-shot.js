// Screenshot one scene of a chapter, with the given flags set.
//   node test/scene-shot.js <chapter> <scene> [x] [y] [flagsJSON]
const { chromium } = require('playwright'); const path = require('path');
const [, , ch, sc, x = 900, y = 950, flags = '{}'] = process.argv;
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve(`dist/chapter${ch}.html`)); await p.waitForTimeout(2500);
  await p.evaluate(([sc, x, y, flags]) => { G.flags = JSON.parse(flags); startPlay(); G.sceneId = null; gotoScene(sc, +x, +y, 1, { instant: true }); setInterval(() => { const s = G.speech[0]; if (s) endSpeech(s); }, 50); }, [sc, x, y, flags]);
  await p.waitForTimeout(3000);
  await p.screenshot({ path: `test/s${ch}_${sc}.png` });
  await b.close(); })();
