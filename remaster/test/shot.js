// Loads the remaster in Chromium (software WebGL), presses Enter and New mission, and screenshots.
const { chromium } = require('playwright'); const path = require('path');
const out = process.argv[2] || 'test/r1';
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +(process.env.W || 1280), height: +(process.env.H || 720) } });
  await p.addInitScript(q => { try { localStorage.setItem('nightglass_r_quality', q); } catch (e) {} }, process.env.Q || 'medium');
  const errs = [];
  p.on('pageerror', e => { errs.push(e.message); console.log('PAGEERROR', e.message); });
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('console.' + m.type(), m.text().slice(0, 300)); });
  await p.goto(process.env.URL || 'file://' + path.resolve('dist/remaster1.html'));
  await p.waitForFunction(() => !document.getElementById('ldStart').hidden || /wrong/.test(document.getElementById('ldText').textContent), null, { timeout: 180000 });
  console.log('loading text:', await p.evaluate(() => document.getElementById('ldText').textContent));
  await p.click('#ldStart');
  await p.waitForTimeout(4000);
  await p.screenshot({ path: out + '_title.png' });
  await p.click('#tPlay');
  await p.waitForTimeout(9000);
  await p.screenshot({ path: out + '_play.png' });
  await p.evaluate(() => { G.jack.walkTo(3, -0.3); });
  await p.waitForTimeout(5000);
  await p.screenshot({ path: out + '_walk.png' });
  console.log('fps-ish frames', await p.evaluate(() => G.t.toFixed(1)), 'errors', errs.length);
  await b.close();
})();
