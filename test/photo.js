const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('dist/chapter1.html'));
  await p.waitForTimeout(4000);
  await p.mouse.click(1500, 200);
  await p.evaluate(async () => { G.flags = { introDone: true, called: true, tux: true, ilseDone: true, passedGate: true, stairsClear: true, officeSeen: true }; startPlay(); G.sceneId = null; await gotoScene('office', 900, 900, 1, { instant: true });
    const h = G.scene.hotspots.find(h => h.name === 'Typewriter'); run(() => interact(h, 'look')); });
  await p.waitForTimeout(2600);
  await p.screenshot({ path: 'test/s_photo.png' });
  console.log(await p.evaluate(() => JSON.stringify({ photo: G.photo && G.photo.id, loaded: Object.keys(PHOTOS).length })));
  await b.close();
})();
