// node tools/fbx2glb/run.js <rocketbox> <out dir>
// Converts the cast and the motion clips listed in cast.json beside this script.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const [RB, OUT] = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(path.join(__dirname, 'cast.json'), 'utf8'));
(async () => {
  require('esbuild').buildSync({ entryPoints: [path.join(__dirname, 'convert.js')], bundle: true, outfile: path.join(__dirname, '.bundle.js'), format: 'iife' });
  const b = await chromium.launch(); const p = await b.newPage();
  p.on('console', m => { if (m.type() === 'error') console.log('page:', m.text().slice(0, 200)); });
  await p.setContent('<html><body></body></html>');
  await p.addScriptTag({ path: path.join(__dirname, '.bundle.js') });
  await p.waitForFunction(() => window.ready);
  const rd = f => fs.readFileSync(f).toString('base64');
  for (const [id, folder] of Object.entries(spec.cast)) {
    const f = path.join(RB, 'Assets/Avatars', folder, 'Export', path.basename(folder) + '_facial.fbx');
    const r = await p.evaluate(([d, k]) => window.avatar(d, k), [rd(f), spec.keepShapes]);
    fs.writeFileSync(path.join(OUT, id + '.glb'), Buffer.from(r.glb, 'base64'));
    console.log(id, JSON.stringify(r.info), (r.glb.length * 0.75 / 1e6).toFixed(2) + ' MB');
  }
  for (const [set, clips] of Object.entries(spec.anims)) {
    const files = Object.entries(clips).map(([n, f]) => { const [file, max] = [].concat(f); return [n, rd(path.join(RB, 'Assets/Animations', file)), max]; });
    const r = await p.evaluate(f => window.clips(f), files);
    fs.writeFileSync(path.join(OUT, 'anim_' + set + '.glb'), Buffer.from(r.glb, 'base64'));
    console.log('anim_' + set, JSON.stringify(r.info), (r.glb.length * 0.75 / 1e6).toFixed(2) + ' MB');
  }
  await b.close();
})();
