// Close-up check of the cast: Jack walks to the newspaper seller, then the conversation camera.
const { chromium } = require('playwright'); const path = require('path');
const out = process.argv[2] || 'test/cast';
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +(process.env.W || 1280), height: +(process.env.H || 720) } });
  await p.addInitScript(q => { try { localStorage.setItem('nightglass_r_quality', q); } catch (e) {} }, process.env.Q || 'medium');
  let errs = 0;
  p.on('pageerror', e => { errs++; console.log('PAGEERROR', e.message); });
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('console.' + m.type(), m.text().slice(0, 200)); });
  await p.goto(process.env.URL || 'file://' + path.resolve('dist/remaster1.html'));
  await p.waitForFunction(() => !document.getElementById('ldStart').hidden || /wrong/.test(document.getElementById('ldText').textContent), null, { timeout: 240000 });
  console.log('loading text:', await p.evaluate(() => document.getElementById('ldText').textContent));
  await p.click('#ldStart'); await p.waitForTimeout(1500); await p.click('#tPlay'); await p.waitForTimeout(3000);
  // put Jack in front of the kiosk and frame the two of them
  await p.evaluate(() => {
    const v = G.actors.get('vendor'); G.jack.position.set(v.position.x - 0.9, 0, v.position.z + 1.3);
    G.jack.face(v.position.x, v.position.z); G.jack.root.rotation.y = G.jack.facing;
    G.convoFocus = v.position.clone().add(G.jack.position).multiplyScalar(0.5); G.convoUntil = G.t + 999;
    G.talker = v; window.__talk = setInterval(() => { v.talkLevel = 0.3 + Math.random() * 0.6; }, 90);
  });
  await p.waitForTimeout(9000);
  await p.screenshot({ path: out + '_convo.png' });
  // a tight portrait of each
  for (const id of ['jack', 'vendor']) {
    await p.evaluate(id => {
      const a = id === 'jack' ? G.jack : G.actors.get(id), c = G.world.camera, h = a.position.clone(); h.y = 1.62 * (a.look.height || 1);
      const f = new (h.constructor)(Math.sin(a.root.rotation.y), 0, Math.cos(a.root.rotation.y));
      G.world.update = () => { c.position.copy(h).addScaledVector(f, 0.95); c.position.y += 0.02; c.lookAt(h); };
    }, id);
    await p.waitForTimeout(3000);
    await p.screenshot({ path: `${out}_${id}.png` });
  }
  console.log('errors', errs);
  await b.close();
})();
