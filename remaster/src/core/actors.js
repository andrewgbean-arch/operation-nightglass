// Characters: realistic people with photo textures, motion-captured idles, walks, runs and
// talking gestures, a face that blinks and shapes its mouth to the recorded voice, and a hat
// where the story calls for one. Files are made by tools/fbx2glb (see assets/cast/).
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { parseGLB, texture } from './assets.js';
import { CAST, ANIMS } from '../../assets/cast/index.js';

// The main cast: realistic scanned-style people (Microsoft Rocketbox, MIT licence) sharing one
// skeleton, so one set of motion-captured clips (idle, walk, run, talk, ...) drives them all.
const RB = { models: {}, clips: {} };

export async function loadCast() {
  const [rbAnim, ...models] = await Promise.all([parseGLB(ANIMS.m), ...Object.values(CAST).map(c => parseGLB(c.glb))]);
  for (const c of rbAnim.animations) {
    // keep the body's own proportions: rotations for every bone, position for the pelvis only
    c.tracks = c.tracks.filter(t => !/MotionExtraction/.test(t.name) && (t.name.endsWith('.quaternion') || /Pelvis\.position$/.test(t.name)));
    RB.clips[c.name] = c;
  }
  Object.keys(CAST).forEach((id, i) => { RB.models[id] = { scene: models[i].scene, tex: CAST[id].tex, mats: null }; });
}

// Photo textures for a cast member: colour, surface detail and shine for the head and body,
// and the see-through hair and lashes.
const hidden = new THREE.MeshBasicMaterial({ visible: false });
function castMaterials(id) {
  const m = RB.models[id]; if (m.mats) return m.mats;
  const t = m.tex, tx = (k, srgb = false) => (t[k] ? texture(t[k], { srgb, flipY: true, aniso: 4 }) : null);
  const part = p => new THREE.MeshStandardMaterial({
    map: tx(p + '_color', true), normalMap: tx(p + '_normal'), roughnessMap: tx(p + '_rough'), roughness: 1, metalness: 0,
    normalScale: new THREE.Vector2(1, 1),
  });
  m.mats = {
    head: part('head'), body: part('body'),
    opacity: new THREE.MeshStandardMaterial({ map: tx('opacity_color', true), alphaTest: 0.45, transparent: false, side: THREE.DoubleSide, roughness: 0.7 }),
  };
  m.mats.head.envMapIntensity = 0.6; m.mats.body.envMapIntensity = 0.8;
  return m.mats;
}


// Simple hats built in code, sized for a head 0.24 m across.
function fedora(color = 0x24262c, band = 0x111216) {
  const g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color, roughness: 0.75, side: THREE.DoubleSide });
  const crown = new THREE.Mesh(new THREE.LatheGeometry([[0, 0.14], [0.075, 0.135], [0.106, 0.115], [0.12, 0.06], [0.125, 0.0]].map(p => new THREE.Vector2(p[0], p[1])), 32), mat);
  crown.scale.set(1, 1, 1.18);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.008, 40), mat); brim.scale.set(1, 1, 1.15);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.127, 0.127, 0.03, 32, 1, true), new THREE.MeshStandardMaterial({ color: band, roughness: 0.5, side: THREE.DoubleSide })); b.position.y = 0.02; b.scale.set(1, 1, 1.18);
  g.add(crown, brim, b);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
function flatcap(color = 0x4a4438) {
  const g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color, roughness: 0.95, side: THREE.DoubleSide });
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat); top.scale.set(1.05, 0.72, 1.22); top.position.z = 0.015;
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
    this.buildCast(RB.models[look.model] ? look : { ...look, model: 'jack' });
  }
  buildCast(look) {
    const src = RB.models[look.model], mats = castMaterials(look.model);
    this.cast = true;
    this.root = new THREE.Group();
    this.body = SkeletonUtils.clone(src.scene);
    this.root.add(this.body);
    this.faces = [];
    this.body.traverse(o => {
      if (!o.isMesh) return;
      o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false;
      const pick = mm => mats[/head/.test(mm.name) ? 'head' : /opacity/.test(mm.name) ? 'opacity' : 'body'];
      o.material = Array.isArray(o.material) ? o.material.map(pick) : pick(o.material);
      if (o.material === mats.opacity || (Array.isArray(o.material) && o.material.includes(mats.opacity))) o.castShadow = false;
      if (o.morphTargetDictionary) this.faces.push(o);
    });
    if (look.height) this.body.scale.multiplyScalar(look.height);
    this.root.updateMatrixWorld(true);
    this.head = null; this.body.traverse(o => { if (!this.head && /Head$/.test(o.name)) this.head = o; });
    this.eyes = []; this.body.traverse(o => { if (/[LR]Eye$/.test(o.name)) this.eyes.push(o); });
    // a hat, placed level on top of the head in the bind pose, then carried by the head bone
    if (look.hat && this.head) {
      const top = new THREE.Box3().setFromObject(this.body).max.y;
      const hp = this.head.getWorldPosition(new THREE.Vector3());
      const hat = HATS[look.hat.kind](look.hat.color, look.hat.band);
      const want = new THREE.Matrix4().compose(
        new THREE.Vector3(hp.x, top - (look.hat.y ?? 0.1), hp.z + (look.hat.z ?? 0.015)),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(look.hat.tilt ?? -0.06, 0, 0)),
        new THREE.Vector3().setScalar(look.hat.scale ?? 1.0));
      hat.matrixAutoUpdate = false;
      hat.matrix.copy(this.head.matrixWorld.clone().invert().multiply(want));
      this.head.add(hat); this.hat = hat;
      // the loose hair strands would poke through the crown; the painted hair is enough under a hat
      this.body.traverse(o => { if (o.isMesh && Array.isArray(o.material)) o.material = o.material.map(m => (m === mats.opacity ? hidden : m)); });
    }
    this.mixer = new THREE.AnimationMixer(this.body);
    this.actions = {};
    for (const [k, clip] of Object.entries(RB.clips)) this.actions[k] = this.mixer.clipAction(clip);
    if (this.actions.walk) this.actions.walk.timeScale = 1.1;
    this.idleClip = look.idle || 'idle';
    this.state = null; this.play(this.idleClip, 0);
    if (this.actions[this.idleClip]) this.actions[this.idleClip].time = Math.random() * 3;
    this.target = null; this.speed = 1.3; this.running = false; this.facing = 0; this.talkLevel = 0;
    this.blinkT = 1 + Math.random() * 3; this.blink = 0; this.vis = { aa: 0, O: 0, E: 0, U: 0 }; this.visT = 0; this.visPick = 'aa';
  }
  // the face: blinks, and mouth shapes that follow the loudness of the voice
  updateFace(dt) {
    this.blinkT -= dt;
    if (this.blinkT < 0) { this.blink = 1; this.blinkT = 2 + Math.random() * 4; }
    const b = this.blink > 0 ? Math.sin(Math.min(1, 1 - this.blink) * Math.PI) : 0; this.blink = Math.max(0, this.blink - dt * 7);
    this.visT -= dt;
    if (this.visT < 0) { this.visT = 0.07 + Math.random() * 0.09; this.visPick = ['aa', 'aa', 'O', 'E', 'U', 'aa', 'E'][Math.floor(Math.random() * 7)]; }
    const lvl = Math.min(1, this.talkLevel * 1.3);
    for (const k of Object.keys(this.vis)) this.vis[k] += ((k === this.visPick ? lvl : 0) - this.vis[k]) * Math.min(1, dt * 18);
    for (const m of this.faces) {
      const d = m.morphTargetDictionary, w = m.morphTargetInfluences, set = (n, v) => { if (d[n] != null) w[d[n]] = v; };
      set('AK_09_EyeBlinkLeft', b); set('AK_10_EyeBlinkRight', b);
      set('AA_VI_10_aa', this.vis.aa * 0.8); set('AA_VI_13_O', this.vis.O * 0.8); set('AA_VI_11_E', this.vis.E * 0.7); set('AA_VI_14_U', this.vis.U * 0.6);
      set('AK_25_JawOpen', lvl * 0.25);
      set('AK_44_MouthSmileLeft', this.look.smile || 0); set('AK_45_MouthSmileRight', this.look.smile || 0);
    }
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
        p.x = this.target.x; p.z = this.target.z; this.target = null; this.play(this.idleClip || 'idle');
        if (this.onArrive) { const f = this.onArrive; this.onArrive = null; f(); }
      } else {
        d.normalize(); p.addScaledVector(d, sp); this.facing = Math.atan2(d.x, d.z);
        this.play(this.running ? 'run' : 'walk');
        const ph = this.actions[this.state].time / this.actions[this.state].getClip().duration;
        const step = Math.floor(ph * 2);
        if (step !== this.lastStep) { this.lastStep = step; onStep && onStep(this); }
      }
    }
    else this.play(this.speaking && this.actions.talk ? 'talk' : this.idleClip, 0.45);
    // turn smoothly towards the facing angle
    let a = this.facing - this.root.rotation.y; a = Math.atan2(Math.sin(a), Math.cos(a));
    this.root.rotation.y += a * Math.min(1, dt * 10);
    this.mixer.update(dt);
    this.updateFace(dt);
  }
}
