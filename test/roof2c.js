const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('dist/chapter2.html')); await p.waitForTimeout(3000);
  await p.mouse.click(1500, 200);
  await p.evaluate(() => { G.flags = {}; startPlay(); TrainRoof.start(); });
  await p.waitForTimeout(500);
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(900); await p.keyboard.up('ArrowRight');
  for (let i = 0; i < 16; i++) { await p.waitForTimeout(250); console.log(await p.evaluate(() => { const j = TrainRoof.j; return JSON.stringify({ x: Math.round(j.x), cr: j.crouch.toFixed(2), vx: TrainRoof.vx, st: TrainRoof.still.toFixed(2), og: TrainRoof.onGround, dead: TrainRoof.dead, g: TrainRoof.gantries.map(g => Math.round(g.x)), keys: KEYS.ArrowRight }); })); }
  await b.close(); })();
