// Boot: load the cast and the night sky, show the title over the living street,
// then play. Pointer and keyboard input, hover labels, and the render loop.
import * as THREE from 'three';
import { Renderer, QUALITY } from './core/renderer.js';
import { environment } from './core/assets.js';
import { loadCast, Actor } from './core/actors.js';
import { Audio } from './core/audio.js';
import { G, gotoScene, run, interact, verbFor, walkJack, skipSpeech, renderInv, loadSave, clearSave, save } from './core/game.js';
import * as CH from './story/ch1.js';
import VOICES from './gen/voices1.js';
import nightHDR from '../assets/hdr/night.hdr.jpg';
import rainOut from '../assets/audio/amb_rainOut.mp3';
import rainGlass from '../assets/audio/amb_rainGlass.mp3';
import gutter from '../assets/audio/amb_gutter.mp3';
import hall from '../assets/audio/amb_hall.mp3';
import sirens from '../assets/audio/amb_sirens.mp3';
import musicStreet from '../assets/music/street.mp3';

const $ = id => document.getElementById(id);
const progress = (f, text) => { $('ldFill').style.width = Math.round(f * 100) + '%'; if (text) $('ldText').textContent = text; };

let quality = 'high';
try { quality = localStorage.getItem('nightglass_r_quality') || (matchMedia('(pointer:coarse)').matches ? 'medium' : 'high'); } catch (e) {}

async function boot() {
  G.voices = VOICES; G.names = CH.NAMES; G.items = CH.ITEMS; G.scenes = CH.SCENES;
  G.audio = { rainOut, rainGlass, gutter, hall, sirens, music: { street: musicStreet } };
  progress(0.1, 'Waking the renderer…');
  G.renderer = new Renderer($('gl'), quality);
  progress(0.25, 'Hanging the night sky…');
  try { const e = await environment(G.renderer.gl, nightHDR); G.env = e.env; } catch (e) { console.warn('sky', e); }
  progress(0.5, 'Dressing the cast…');
  await loadCast();
  G.jack = new Actor('jack', CH.LOOKS.jack);
  progress(0.8, 'Painting Vienna in the rain…');
  await gotoScene('street', [-1.5, 1.2], 0.4, { instant: true });
  G.mode = 'title';
  progress(1, 'Ready');
  $('ldStart').hidden = false;
  $('ldStart').onclick = () => { Audio.init(); $('loading').classList.add('out'); setTimeout(() => ($('loading').hidden = true), 1000); showTitle(); };
  requestAnimationFrame(loop);
}

function showTitle() {
  G.mode = 'title';
  $('title').hidden = false; $('hud').hidden = true; $('inv').hidden = true;
  $('tResume').hidden = !loadSave();
  $('tQualityVal').textContent = QUALITY[quality].label;
  // re-enter the scene so ambience starts now that sound is allowed
  Audio.stopLoops(); (G.world.ambience || []).forEach((a, i) => Audio.loop('amb' + i, a.url, { gain: a.gain ?? 1 }));
  if (G.world.music) Audio.loop('music', G.world.music, { bus: 'music', fade: 3 });
}
async function startPlay(fromSave) {
  Audio.init();
  $('title').hidden = true; $('hud').hidden = false; $('inv').hidden = false;
  G.mode = 'play';
  let at;
  if (fromSave) { const s = loadSave(); G.flags = s.flags; G.inv = s.inv; G.objective = ''; at = { scene: s.scene, at: s.at, facing: 0 }; if (s.objective) { $('objText').textContent = s.objective; $('obj').hidden = false; G.objective = s.objective; } }
  else { clearSave(); at = CH.newGame(); $('obj').hidden = true; }
  renderInv();
  await run(() => gotoScene(at.scene, at.at, at.facing));
}

// ---------- the loop --------------------------------------------------------------
const clock = new THREE.Clock();
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, clock.getDelta()); G.t += dt;
  if (G.world) {
    G.world.update(dt, G.t);
    for (const a of G.actors.values()) { a.speaking = a === G.talker; a.update(dt, { onStep: a === G.jack ? stepSound : null }); }
    if (G.talker) G.talker.talkLevel = G.talker.talkLevel * 0.5 + Audio.voiceLevel() * 0.9;
    updateHotspotBoxes();
    G.renderer.render(G.t);
  }
}
function stepSound(a) {
  const p = a.position.clone().project(G.world.camera);
  Audio.sfx(G.world.step || 'step_stone', { pan: p.x * 0.7, gain: a.running ? 0.55 : 0.4 });
}

// ---------- hotspots: invisible boxes, ray-cast under the pointer ----------------------
const ray = new THREE.Raycaster(), groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
let pickables = [], pickScene = null;
function buildPickables() {
  pickScene = G.world.scene; pickables = [];
  for (const h of G.def.hotspots || []) {
    const geo = h.actor ? new THREE.BoxGeometry(0.7, 1.9, 0.6) : new THREE.BoxGeometry(h.box[3], h.box[4], h.box[5]);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ visible: false }));
    if (!h.actor) m.position.set(h.box[0], h.box[1], h.box[2]);
    m.userData.h = h; G.world.scene.add(m); pickables.push(m);
  }
}
function updateHotspotBoxes() {
  if (pickScene !== G.world.scene) buildPickables();
  for (const m of pickables) { const h = m.userData.h; if (h.actor) { const a = G.actors.get(h.actor); m.visible = !!a; if (a) m.position.set(a.position.x, 0.95, a.position.z); } }
}
function pick(clientX, clientY) {
  const r = $('gl').getBoundingClientRect();
  G.mouse.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(G.mouse, G.world.camera);
  const hits = ray.intersectObjects(pickables.filter(m => { const h = m.userData.h; return m.visible && (!h.when || h.when()); }), false);
  // prefer people and small things over big ones
  hits.sort((a, b) => (a.object.userData.h.actor ? -1 : 0) - (b.object.userData.h.actor ? -1 : 0) || a.distance - b.distance);
  const h = hits[0] ? hits[0].object.userData.h : null;
  const p = new THREE.Vector3(); const onGround = ray.ray.intersectPlane(groundPlane, p);
  return { h, ground: onGround ? p : null };
}

const canvas = $('gl');
let lastClick = 0, holdT = null;
canvas.addEventListener('pointermove', e => {
  if (G.mode !== 'play' || G.busy) { $('tip').hidden = true; return; }
  const { h } = pick(e.clientX, e.clientY); G.hover = h;
  const tip = $('tip');
  if (h) { tip.innerHTML = verbFor(h); tip.hidden = false; tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; canvas.style.cursor = 'pointer'; }
  else { tip.hidden = true; canvas.style.cursor = G.sel ? 'crosshair' : 'default'; }
});
canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('pointerdown', e => {
  Audio.init();
  if (G.mode !== 'play') return;
  if (!$('sub').hidden && !G.choosing) { skipSpeech(); return; }
  if (G.busy) return;
  const mode = e.button === 2 ? 'look' : 'default';
  if (e.pointerType === 'touch') { clearTimeout(holdT); holdT = setTimeout(() => { holdT = 'fired'; const { h } = pick(e.clientX, e.clientY); if (h) run(() => interact(h, 'look')); }, 480); }
  const { h, ground } = pick(e.clientX, e.clientY);
  const now = performance.now(), dbl = now - lastClick < 320; lastClick = now;
  if (e.pointerType === 'touch') { canvas._pending = { h, ground, dbl }; return; }
  act(h, ground, mode, dbl);
});
canvas.addEventListener('pointerup', e => {
  if (e.pointerType !== 'touch') return;
  if (holdT === 'fired') { holdT = null; return; }
  clearTimeout(holdT); holdT = null;
  const p = canvas._pending; canvas._pending = null; if (p && !G.busy) act(p.h, p.ground, 'default', p.dbl);
});
function act(h, ground, mode, dbl) {
  if (h) return run(() => interact(h, mode));
  if (ground && !G.sel) walkJack(ground.x, ground.z, { run: dbl });
  if (G.sel && !h) { G.sel = null; renderInv(); }
}
addEventListener('keydown', e => {
  if (e.key === 'f' || e.key === 'F') toggleFs();
  if ((e.key === ' ' || e.key === 'Enter') && !$('sub').hidden) skipSpeech();
  if (e.key === 'Escape' && G.mode === 'play') toggleMenu();
  if (G.choosing && /^[1-9]$/.test(e.key)) { const b = $('choices').children[+e.key - 1]; if (b) b.click(); }
});

// ---------- menus -------------------------------------------------------------------
function toggleFs() { const el = document.documentElement; if (!document.fullscreenElement) (el.requestFullscreen || el.webkitRequestFullscreen || (() => {})).call(el); else document.exitFullscreen(); }
function toggleMenu() { const m = $('menu'); m.hidden = !m.hidden; }
$('btnFs').onclick = toggleFs; $('tFs').onclick = toggleFs;
$('btnMenu').onclick = toggleMenu; $('mResume').onclick = toggleMenu;
$('mTitle').onclick = () => { save(); $('menu').hidden = true; showTitle(); };
$('tPlay').onclick = () => startPlay(false);
$('tResume').onclick = () => startPlay(true);
$('tQuality').onclick = () => {
  const order = ['low', 'medium', 'high', 'ultra']; quality = order[(order.indexOf(quality) + 1) % order.length];
  try { localStorage.setItem('nightglass_r_quality', quality); } catch (e) {}
  $('tQualityVal').textContent = QUALITY[quality].label;
  G.renderer.setQuality(quality);
  const at = [G.jack.position.x, G.jack.position.z]; gotoScene(G.sceneId, at, G.jack.facing, { instant: true }).then(() => { G.mode = 'title'; });
};
$('btnHint').onclick = () => { if (G.def && G.def.hint) run(G.def.hint); else run(() => import('./core/game.js').then(m => m.think(G.objective ? 'Right: ' + G.objective.toLowerCase() + '.' : 'Look around. Talk to people.'))); };
for (const [id, k] of [['sMusic', 'music'], ['sVoice', 'voice'], ['sSfx', 'sfx']]) { const el = $(id); el.value = Audio.vol[k]; el.oninput = () => { Audio.vol[k] = +el.value; Audio.applyVolumes(); }; }
$('sSubs').onchange = e => { G.subs = e.target.checked; };
$('sub').onclick = () => skipSpeech();

window.G = G;
boot().catch(e => { console.error(e); $('ldText').textContent = 'Something went wrong: ' + e.message; });
