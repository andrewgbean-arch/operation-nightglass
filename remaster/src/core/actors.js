// Characters: two rigged base models (a man and a woman) share one set of idle,
// walk and run animations, retargeted to each skeleton. Every character in the
// story is one of the two, re-dressed: outfits recoloured, hats and moustaches
// added, the beard shown or hidden. Mouths open and close with the recorded voice.
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { parseGLB } from './assets.js';
import manGLB from '../../assets/models/man.glb';
import womanGLB from '../../assets/models/woman.glb';
import animGLB from '../../assets/models/anim.glb';

const strip = n => n.replace(/^mixamorig:?/, '');
const findSkinned = root => { let m = null; root.traverse(o => { if (!m && o.isSkinnedMesh) m = o; }); return m; };
const BASES = {};

export async function loadCast() {
  const [man, woman, anim] = await Promise.all([parseGLB(manGLB), parseGLB(womanGLB), parseGLB(animGLB)]);
  const src = findSkinned(anim.scene);
  // the source clips carry a few tracks for bones its own skeleton lacks; drop them
  const srcBones = new Set(src.skeleton.bones.map(b => b.name));
  const clips = {}; for (const c of anim.animations) { c.tracks = c.tracks.filter(tr => srcBones.has(tr.name.split('.')[0])); clips[c.name.toLowerCase()] = c; }
  for (const [kind, g, hip] of [['man', man, 'Hips'], ['woman', woman, 'mixamorigHips']]) {
    const body = SkeletonUtils.clone(g.scene), target = findSkinned(body);
    const out = {};
    for (const name of ['idle', 'walk', 'run']) {
      if (!clips[name]) continue;
      const clip = SkeletonUtils.retargetClip(target, src, clips[name], {
        hip, useFirstFramePosition: true,
        getBoneName: b => { const n = strip(b.name); const s = src.skeleton.bones.find(x => strip(x.name) === n); return s ? s.name : undefined; },
      });
      clip.name = name;
      // drop tracks for bones this body doesn't have (finger tips), so the mixer stays quiet
      const has = new Set(target.skeleton.bones.map(b => b.name));
      clip.tracks = clip.tracks.filter(tr => has.has(tr.name.split('.')[0]));
      // walk in place: the game moves the character, not the clip
      for (const tr of clip.tracks) if (tr.name.endsWith('.position') && /hips/i.test(tr.name)) {
        const v = tr.values; for (let i = 0; i < v.length; i += 3) { v[i] = v[0]; v[i + 2] = v[2]; }
      }
      out[name] = clip;
    }
    BASES[kind] = { scene: g.scene, clips: out };
  }
}

// Greyscale copies of the base textures, so an outfit can be tinted any colour and keep its weave.
const greyCache = new WeakMap();
function grey(tex) {
  if (!tex || !tex.image) return tex;
  if (greyCache.has(tex)) return greyCache.get(tex);
  const img = tex.image, c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
  let sum = 0; for (let i = 0; i < p.length; i += 4) sum += 0.3 * p[i] + 0.59 * p[i + 1] + 0.11 * p[i + 2];
  const mean = sum / (p.length / 4) || 1, k = 200 / mean;   // normalise brightness so tints read true
  for (let i = 0; i < p.length; i += 4) { const l = Math.min(255, (0.3 * p[i] + 0.59 * p[i + 1] + 0.11 * p[i + 2]) * k); p[i] = p[i + 1] = p[i + 2] = l; }
  x.putImageData(d, 0, 0);
  const t = new THREE.CanvasTexture(c); t.flipY = tex.flipY; t.colorSpace = THREE.SRGBColorSpace; t.wrapS = tex.wrapS; t.wrapT = tex.wrapT;
  greyCache.set(tex, t); return t;
}

// Simple hats built in code, sized for a head 0.24 m across.
function fedora(color = 0x24262c, band = 0x111216) {
  const g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color, roughness: 0.75 });
  const crown = new THREE.Mesh(new THREE.LatheGeometry([[0, 0.135], [0.07, 0.13], [0.095, 0.11], [0.105, 0.06], [0.11, 0.0]].map(p => new THREE.Vector2(p[0], p[1])), 32), mat);
  crown.scale.set(1, 1, 1.18);
  const dent = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.16), mat); dent.position.y = 0.128;
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.008, 40), mat); brim.scale.set(1, 1, 1.15);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.112, 0.112, 0.03, 32, 1, true), new THREE.MeshStandardMaterial({ color: band, roughness: 0.5, side: THREE.DoubleSide })); b.position.y = 0.02; b.scale.set(1, 1, 1.18);
  g.add(crown, dent, brim, b);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
function flatcap(color = 0x4a4438) {
  const g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color, roughness: 0.95 });
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat); top.scale.set(1, 0.45, 1.25); top.position.z = 0.02;
  const peak = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.01, 24, 1, false, -Math.PI / 2, Math.PI), mat); peak.position.set(0, 0.0, 0.1); peak.scale.set(1, 1, 0.7);
  g.add(top, peak); g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
function peakedcap(color = 0x3d4436, band = 0x8e1c24) {
  const g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.115, 0.07, 32), mat); crown.position.y = 0.06; crown.scale.set(1, 1, 1.12);
  const bandM = new THREE.Mesh(new THREE.CylinderGeometry(0.117, 0.115, 0.035, 32), new THREE.MeshStandardMaterial({ color: band, roughness: 0.6 })); bandM.position.y = 0.025; bandM.scale.set(1, 1, 1.12);
  const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.008, 24, 1, false, -Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.2, metalness: 0.2 })); visor.position.set(0, 0.012, 0.09); visor.rotation.x = 0.25;
  const badge = new THREE.Mesh(new THREE.CircleGeometry(0.018, 16), new THREE.MeshStandardMaterial({ color: 0xd9b35c, metalness: 0.9, roughness: 0.3 })); badge.position.set(0, 0.06, 0.155);
  g.add(crown, bandM, visor, badge); g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
const HATS = { fedora, flatcap, peakedcap };

let nextId = 1;
export class Actor {
  // look: { base: 'man'|'woman', top, bottom, shoes, skin, hair, hat: {kind, color, band}, beard: bool, height }
  constructor(id, look) {
    this.id = id || 'actor' + nextId++;
    this.look = look;
    const base = BASES[look.base || 'man'];
    this.root = new THREE.Group();
    this.body = SkeletonUtils.clone(base.scene);
    this.root.add(this.body);
    this.mouths = [];
    this.body.traverse(o => {
      if (!o.isMesh) return;
      o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false;
      o.material = o.material.clone();
      const n = o.material.name || '';
      const tint = (hex, rough) => { o.material.map = grey(o.material.map); o.material.color = new THREE.Color(hex); if (rough != null) o.material.roughness = rough; };
      if (/Headwear/.test(n)) o.visible = false;
      if (/Beard/.test(n)) o.visible = !!look.beard;
      if (/Outfit_Top/.test(n) && look.top != null) tint(look.top, look.topRough);
      if (/Outfit_Bottom/.test(n) && look.bottom != null) tint(look.bottom);
      if (/Footwear/.test(n) && look.shoes != null) tint(look.shoes, 0.35);
      if (/Hair/.test(n) && look.hair != null) tint(look.hair);
      if (/Skin|Body/.test(n) && look.skin != null) o.material.color = new THREE.Color(look.skin);
      if (look.base === 'woman' && look.tint != null) o.material.color = new THREE.Color(look.tint);
      if (o.morphTargetDictionary && o.morphTargetDictionary.mouthOpen != null) this.mouths.push(o);
    });
    const s = (look.height || 1.0); this.body.scale.setScalar(s);
    this.head = null; this.body.traverse(o => { if (o.isBone && /Head$/.test(o.name) && !this.head) this.head = o; });
    if (look.hat && this.head) {
      const hat = HATS[look.hat.kind](look.hat.color, look.hat.band);
      const s0 = 1 / (this.head.getWorldScale(new THREE.Vector3()).x || 1);
      hat.scale.setScalar(s0 * (look.hat.scale || 1));
      hat.position.set(0, (look.hat.y ?? 0.155) * s0, (look.hat.z ?? 0.01) * s0);
      hat.rotation.x = look.hat.tilt ?? -0.08;
      this.head.add(hat);
    }
    if (look.mustache && this.head) {
      const s0 = 1 / (this.head.getWorldScale(new THREE.Vector3()).x || 1);
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.05, 4, 8), new THREE.MeshStandardMaterial({ color: look.mustache, roughness: 0.9 }));
      m.rotation.z = Math.PI / 2; m.scale.setScalar(s0); m.position.set(0, 0.035 * s0, 0.105 * s0); this.head.add(m);
    }
    this.mixer = new THREE.AnimationMixer(findSkinned(this.body));
    this.actions = {};
    for (const [k, clip] of Object.entries(base.clips)) this.actions[k] = this.mixer.clipAction(clip);
    this.state = null; this.play('idle', 0);
    this.target = null; this.speed = 1.35; this.running = false; this.facing = 0; this.talkLevel = 0;
  }
  get position() { return this.root.position; }
  play(name, fade = 0.25) {
    if (this.state === name || !this.actions[name]) return;
    const next = this.actions[name]; next.reset().setEffectiveWeight(1).fadeIn(fade).play();
    if (this.state && this.actions[this.state]) this.actions[this.state].fadeOut(fade);
    this.state = name;
  }
  face(x, z) { this.facing = Math.atan2(x - this.root.position.x, z - this.root.position.z); }
  faceAngle(a) { this.facing = a; }
  walkTo(x, z, { run = false } = {}) {
    return new Promise(res => {
      if (this.onArrive) this.onArrive();
      this.target = new THREE.Vector3(x, 0, z); this.running = run; this.onArrive = res;
    });
  }
  stop() { this.target = null; if (this.onArrive) { const f = this.onArrive; this.onArrive = null; f(); } }
  update(dt, { onStep } = {}) {
    const p = this.root.position;
    if (this.target) {
      const d = this.target.clone().sub(p); d.y = 0;
      const dist = d.length(), sp = (this.running ? 3.4 : this.speed) * dt;
      if (dist < 0.04 || dist < sp) {
        p.x = this.target.x; p.z = this.target.z; this.target = null; this.play('idle');
        if (this.onArrive) { const f = this.onArrive; this.onArrive = null; f(); }
      } else {
        d.normalize(); p.addScaledVector(d, sp); this.facing = Math.atan2(d.x, d.z);
        this.play(this.running ? 'run' : 'walk');
        const ph = this.actions[this.state].time / this.actions[this.state].getClip().duration;
        const step = Math.floor(ph * 2);
        if (step !== this.lastStep) { this.lastStep = step; onStep && onStep(this); }
      }
    }
    // turn smoothly towards the facing angle
    let a = this.facing - this.root.rotation.y; a = Math.atan2(Math.sin(a), Math.cos(a));
    this.root.rotation.y += a * Math.min(1, dt * 10);
    this.mixer.update(dt);
    for (const m of this.mouths) m.morphTargetInfluences[m.morphTargetDictionary.mouthOpen] = this.talkLevel;
  }
}
