const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('dist/chapter2.html')); await p.waitForTimeout(3000);
  await p.mouse.click(1500, 200);
  await p.evaluate(() => { G.flags = {}; startPlay(); TrainRoof.start(); TrainRoof.introT = 20; });
  await p.waitForFunction(() => TrainRoof.gantries.length, null, { timeout: 20000 });
  let shot = false;
  for (let i = 0; i < 80; i++) { await p.waitForTimeout(100); const st = await p.evaluate(() => { const g = TrainRoof.gantries[0]; return { d: g ? g.x - TrainRoof.j.x : null, dead: TrainRoof.dead, cr: TrainRoof.j.crouch }; }); if (!shot && st.d !== null && st.d < 500) { shot = true; await p.screenshot({ path: 'test/c2_gantry.png' }); } if (st.dead) { console.log('DEAD', st); break; } }
  console.log(await p.evaluate(() => JSON.stringify({ dead: TrainRoof.dead, g: TrainRoof.gantries.map(g => g.passed) })));
  // now run into the next one
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(6000); await p.keyboard.up('ArrowRight');
  console.log('running', await p.evaluate(() => JSON.stringify({ dead: TrainRoof.dead, x: TrainRoof.j.x, fail: TrainRoof.failText })));
  await b.close(); })();
