// The adventure engine: scenes, hotspots, walking, talking, choices, inventory,
// objectives and saving. Story code uses the same small vocabulary as the original
// chapters: say, think, choose, walkTo, flag, has, addItem, setObjective, gotoScene.
import * as THREE from 'three';
import { Audio } from './audio.js';

const $ = id => document.getElementById(id);
const wait = s => new Promise(r => setTimeout(r, s * 1000));

export const G = {
  flags: {}, inv: [], sel: null, objective: '', sceneId: null, scene: null, busy: false,
  actors: new Map(), jack: null, t: 0, voices: {}, names: {}, items: {}, scenes: {}, saveKey: 'nightglass_r1',
  subs: true, hover: null, mouse: new THREE.Vector2(), mode: 'boot',
};
export const flag = (k, v) => (v === undefined ? G.flags[k] : (G.flags[k] = v));
export const has = id => G.inv.includes(id);
export { wait };

// ---------- saving ------------------------------------------------------------------
export function save() {
  if (!G.sceneId || G.mode !== 'play') return;
  try { localStorage.setItem(G.saveKey, JSON.stringify({ flags: G.flags, inv: G.inv, objective: G.objective, scene: G.sceneId, at: [G.jack.position.x, G.jack.position.z] })); } catch (e) {}
}
export function loadSave() { try { return JSON.parse(localStorage.getItem(G.saveKey) || 'null'); } catch (e) { return null; } }
export function clearSave() { try { localStorage.removeItem(G.saveKey); } catch (e) {} }

// ---------- objective, toasts, cards -------------------------------------------------
export function setObjective(text) {
  if (G.objective === text) return;
  G.objective = text; $('objText').textContent = text; $('obj').hidden = !text;
  $('obj').classList.remove('flash'); void $('obj').offsetWidth; $('obj').classList.add('flash');
  Audio.sfx('chime', { gain: 0.25 });
}
export function toast(text, s = 2.6) { const t = $('toast'); t.textContent = text; t.hidden = false; clearTimeout(t._h); t._h = setTimeout(() => (t.hidden = true), s * 1000); }
export async function card(kick, text, s = 5) {
  $('cardKick').textContent = kick; $('cardText').textContent = text; $('cardBox').hidden = false;
  const c = $('cardBox').firstElementChild; c.style.animation = 'none'; void c.offsetWidth; c.style.animation = `cardin ${s}s ease both`;
  await wait(s); $('cardBox').hidden = true;
}

// ---------- speech -------------------------------------------------------------------
let skip = null;
export function skipSpeech() { if (skip) skip(); }
function speakerName(id) { return G.names[id] || id.toUpperCase(); }
export async function say(who, text, { thought = false } = {}) {
  const id = typeof who === 'string' ? who : who.id;
  const actor = G.actors.get(id);
  const sub = $('sub');
  $('subWho').textContent = thought ? speakerName(id) + ' · thinking' : speakerName(id);
  $('subText').textContent = text; sub.classList.toggle('thought', thought); sub.classList.toggle('nosubs', !G.subs);
  sub.hidden = false;
  if (actor && !thought && G.jack && actor !== G.jack) {
    G.jack.face(actor.position.x, actor.position.z); actor.face(G.jack.position.x, G.jack.position.z);
    G.convoFocus = actor.position.clone().add(G.jack.position).multiplyScalar(0.5);
  }
  if (!thought && G.convoFocus) G.convoUntil = G.t + 60;
  const url = G.voices[`${id}|${text}`];
  const done = new Promise(res => { skip = res; });
  G.talker = thought ? null : actor;
  const voiced = Audio.voice(url).then(ok => (ok ? wait(0.25) : wait(Math.max(1.8, 0.9 + text.length * 0.055))));
  await Promise.race([voiced, done]);
  skip = null; Audio.stopVoice(); G.talker = null; if (actor) actor.talkLevel = 0;
  sub.hidden = true;
  if (G.convoFocus) G.convoUntil = G.t + 1.2;
  await wait(0.08);
}
export const think = (text) => say(G.jack, text, { thought: true });

export function choose(options) {
  return new Promise(res => {
    const box = $('choices'); box.innerHTML = '';
    options.filter(Boolean).forEach((o, i) => {
      const b = document.createElement('button'); b.className = 'choice'; b.type = 'button';
      b.innerHTML = `<span>${i + 1}</span>`; b.append(document.createTextNode(o.text));
      b.onclick = e => { e.stopPropagation(); box.hidden = true; G.choosing = null; Audio.sfx('ui', { gain: 0.5 }); res(o.value); };
      box.append(b);
    });
    box.hidden = false; G.choosing = options.filter(Boolean);
  });
}

// ---------- inventory ----------------------------------------------------------------
function iconCanvas(id) {
  const c = document.createElement('canvas'); c.width = c.height = 104;
  const x = c.getContext('2d'); x.translate(52, 52); x.scale(1.25, 1.25);
  try { G.items[id].icon(x); } catch (e) {}
  return c;
}
export function renderInv(newId) {
  const slots = $('slots'); slots.innerHTML = '';
  const n = Math.max(6, G.inv.length);
  for (let i = 0; i < n; i++) {
    const id = G.inv[i], b = document.createElement('button'); b.type = 'button'; b.className = 'slot' + (id ? '' : ' empty') + (id && id === G.sel ? ' sel' : '') + (id && id === newId ? ' new' : '');
    if (id) {
      b.append(iconCanvas(id)); b.title = G.items[id].name;
      b.onclick = e => { e.stopPropagation(); if (G.busy) return; if (G.sel === id) { G.sel = null; renderInv(); run(() => say(G.jack, G.items[id].desc)); } else { G.sel = id; Audio.sfx('pickup', { gain: 0.4 }); renderInv(); } };
      b.oncontextmenu = e => { e.preventDefault(); if (!G.busy) run(() => say(G.jack, G.items[id].desc)); };
    }
    slots.append(b);
  }
  $('selhint').innerHTML = G.sel ? `Use <b>${G.items[G.sel].name}</b> with… <span style="opacity:.6">(tap it again to look)</span>` : '';
}
export function addItem(id) { if (!has(id)) { G.inv.push(id); Audio.sfx('pickup'); renderInv(id); toast('Added to your kit: ' + G.items[id].name); } }
export function removeItem(id) { G.inv = G.inv.filter(x => x !== id); if (G.sel === id) G.sel = null; renderInv(); }

// ---------- running story code -------------------------------------------------------
export async function run(fn) {
  if (G.busy) return;
  G.busy = true; $('tip').hidden = true;
  try { await fn(); } catch (e) { console.error(e); }
  G.busy = false; G.convoFocus = null; save();
}

// ---------- scenes -------------------------------------------------------------------
export function actor(id) { return G.actors.get(id); }
export async function gotoScene(id, at, facing, { instant = false } = {}) {
  const fade = $('fade') || (() => { const d = document.createElement('div'); d.id = 'fade'; Object.assign(d.style, { position: 'absolute', inset: 0, background: '#000', opacity: 0, transition: 'opacity .6s', pointerEvents: 'none', zIndex: 8 }); $('app').append(d); return d; })();
  if (!instant && G.sceneId) { fade.style.opacity = 1; await wait(0.65); }
  if (G.world && G.world.dispose) G.world.dispose();
  const def = G.scenes[id];
  G.sceneId = id; G.def = def;
  for (const a of G.actors.values()) if (a !== G.jack) a.root.removeFromParent();
  G.actors.clear(); G.actors.set('jack', G.jack);
  const world = G.world = def.build(G);
  world.scene.add(G.jack.root);
  G.jack.root.position.set(at[0], 0, at[1]); G.jack.facing = G.jack.root.rotation.y = facing ?? 0; G.jack.stop();
  if (def.jackLook && G.jack.dress) G.jack.dress(def.jackLook());
  for (const a of (def.actors ? def.actors(G) : [])) { G.actors.set(a.id, a); world.scene.add(a.root); }
  G.renderer.build(world.scene, world.camera);
  G.renderer.gl.toneMappingExposure = world.exposure || 1;
  Audio.stopLoops(['music']);
  (world.ambience || []).forEach((a, i) => Audio.loop('amb' + i, a.url, { gain: a.gain ?? 1 }));
  if (world.music !== undefined) Audio.loop('music', world.music, { bus: 'music', fade: 3 });
  $('placeName').textContent = def.title; $('place').classList.remove('fade'); clearTimeout(G._placeT); G._placeT = setTimeout(() => $('place').classList.add('fade'), 6000);
  fade.style.opacity = 0;
  save();
  if (def.enter) await def.enter(G);
}

// Walk Jack to a point inside the scene's walkable area.
export function walkJack(x, z, opts) {
  const [cx, cz] = clampToPoly(x, z, G.world.walk);
  return G.jack.walkTo(cx, cz, opts);
}
export function clampToPoly(x, z, poly) {
  if (inPoly(x, z, poly)) return [x, z];
  let best = null, bd = 1e9;
  for (let i = 0; i < poly.length; i++) {
    const [ax, az] = poly[i], [bx, bz] = poly[(i + 1) % poly.length];
    const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    const px = ax + dx * t, pz = az + dz * t, d = (px - x) ** 2 + (pz - z) ** 2;
    if (d < bd) { bd = d; best = [px, pz]; }
  }
  // nudge just inside
  const c = poly.reduce((s, p) => [s[0] + p[0] / poly.length, s[1] + p[1] / poly.length], [0, 0]);
  return [best[0] + (c[0] - best[0]) * 0.02, best[1] + (c[1] - best[1]) * 0.02];
}
function inPoly(x, z, p) { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > z) !== (p[j][1] > z) && x < (p[j][0] - p[i][0]) * (z - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; return c; }

// ---------- interacting --------------------------------------------------------------
export function verbFor(h) {
  const n = typeof h.name === 'function' ? h.name() : h.name;
  if (G.sel) return `Use <b>${G.items[G.sel].name}</b> with <b>${n}</b>`;
  if (h.exit) return `<b>${h.exitLabel || 'Go to ' + n}</b>`;
  if (h.talk) return `Talk to <b>${n}</b>`;
  if (h.take) return `Pick up <b>${n}</b>`;
  if (h.use) return `${h.useVerb || 'Use'} <b>${n}</b>`;
  return `Look at <b>${n}</b>`;
}
export async function interact(h, mode) {
  const look = () => (h.look ? h.look() : say(G.jack, 'Nothing special.'));
  if (mode === 'look') { faceHotspot(h); return look(); }
  if (h.at) await walkJack(h.at[0], h.at[1]);
  faceHotspot(h);
  if (G.sel) {
    const id = G.sel; G.sel = null; renderInv();
    if (h.item) { const r = await h.item(id); if (r !== false) return; }
    return say(G.jack, ['That won\'t work.', 'I don\'t think so.', 'Not a chance.', 'That doesn\'t help here.'][Math.floor(Math.random() * 4)]);
  }
  if (h.exit) return h.exit();
  if (h.talk) return h.talk();
  if (h.take) return h.take();
  if (h.use) return h.use();
  return look();
}
function faceHotspot(h) {
  if (h.actor && actor(h.actor)) { const a = actor(h.actor).position; G.jack.face(a.x, a.z); return; }
  if (h.faceTo) G.jack.face(h.faceTo[0], h.faceTo[1]);
  else if (h.box) G.jack.face(h.box[0], h.box[2]);
}
