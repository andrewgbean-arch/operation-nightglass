// Jumps straight into the tunnel run and screenshots it.
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('dist/chapter4.html')); await p.waitForTimeout(2500);
  await p.evaluate(() => { G.flags = { baker: true }; TunnelRun.start(); TunnelRun.introT = 20; });
  for (const d of [120, 400, 790]) { await p.evaluate(d => { TunnelRun.dist = d; TunnelRun.reset(); TunnelRun.dist = d; }, d); await p.waitForTimeout(700); await p.screenshot({ path: `test/c4_tn_${d}.png` }); }
  await b.close(); })();
