// Runs in a headless browser page: FBX in, GLB out, with three.js's own loader and exporter so
// every file keeps the original skeleton's bone transforms and the clips fit every character.
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0)).buffer;
const manager = new THREE.LoadingManager();
manager.setURLModifier(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
const fbx = new FBXLoader(manager);
const exporter = new GLTFExporter();
const toB64 = buf => { let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };

// a character: mesh, skeleton and the chosen face shapes; plain named materials (textures come later)
window.avatar = async (data, keep) => {
  const root = fbx.parse(b64(data), '');
  root.animations = [];
  const info = [];
  root.traverse(o => {
    if (!o.isMesh) return;
    const mats = (Array.isArray(o.material) ? o.material : [o.material]).map(m => { const n = new THREE.MeshStandardMaterial({ name: m.name }); return n; });
    o.material = Array.isArray(o.material) ? mats : mats[0];
    const g = o.geometry;
    if (g.morphAttributes.position) {
      const names = Object.keys(o.morphTargetDictionary).sort((a, b) => o.morphTargetDictionary[a] - o.morphTargetDictionary[b]);
      const idx = names.map((n, i) => [n, i]).filter(([n]) => keep.some(k => n.includes(k)));
      g.morphAttributes.position = idx.map(([, i]) => g.morphAttributes.position[i]);
      delete g.morphAttributes.normal;
      o.morphTargetDictionary = Object.fromEntries(idx.map(([n], j) => [n.replace(/^.*\./, ''), j]));
      o.morphTargetInfluences = idx.map(() => 0);
    }
    // the loader gives every triangle its own corners; share them again (positions, normals,
    // UVs, skin weights and face shapes all have to match for two corners to merge)
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv', 'skinIndex', 'skinWeight'].includes(k)) g.deleteAttribute(k);
    o.geometry = mergeVertices(g, 1e-4);
    const g2 = o.geometry;
    // one draw per material: gather each material's triangles together
    if (g2.groups.length > 1 && g2.index) {
      const src = g2.index.array, order = [], groups = [];
      const mats = [...new Set(g2.groups.map(gr => gr.materialIndex))].sort((a, b) => a - b);
      for (const mi of mats) {
        const start = order.length;
        for (const gr of g2.groups) if (gr.materialIndex === mi) for (let i = gr.start; i < gr.start + gr.count; i++) order.push(src[i]);
        groups.push({ start, count: order.length - start, materialIndex: mi });
      }
      g2.setIndex(order); g2.clearGroups(); for (const gr of groups) g2.addGroup(gr.start, gr.count, gr.materialIndex);
    }
    info.push([o.name, g2.attributes.position.count, g2.groups.length, Object.keys(o.morphTargetDictionary || {})]);
  });
  root.scale.setScalar(0.01);
  const glb = await exporter.parseAsync(root, { binary: true, onlyVisible: false });
  return { glb: toB64(glb), info };
};

// motion clips: the first file gives the skeleton; each clip is renamed and keeps rotations,
// plus the pelvis's position (so bodies of any height can share them)
window.clips = async (files) => {
  let root = null; const out = [];
  for (const [name, data, maxSec] of files) {
    const o = fbx.parse(b64(data), '');
    if (!root) root = o;
    let c = o.animations[0];
    if (maxSec && c.duration > maxSec) c = THREE.AnimationUtils.subclip(c, name, 0, Math.round(maxSec * 30), 30);
    c.name = name;
    c.tracks = c.tracks.filter(t => !/Footsteps|^Bip01\./.test(t.name) && (t.name.endsWith('.quaternion') || /Pelvis\.position$/.test(t.name)));
    c.optimize(); out.push(c);
  }
  root.traverse(o => { if (o.isMesh) o.parent.remove(o); });
  root.scale.setScalar(0.01);
  const glb = await exporter.parseAsync(root, { binary: true, animations: out, onlyVisible: false });
  return { glb: toB64(glb), info: out.map(c => [c.name, c.duration.toFixed(2), c.tracks.length, c.tracks.slice(0, 2).map(t => t.name)]) };
};
window.ready = true;
