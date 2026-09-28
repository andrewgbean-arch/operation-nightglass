const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  for (const n of process.argv.slice(2)) { await p.goto('file://' + path.resolve('test/paint9.html') + '#' + n); await p.reload(); await p.waitForTimeout(1500); await p.screenshot({ path: `test/p9_${n}.png` }); }
  await b.close(); })();
