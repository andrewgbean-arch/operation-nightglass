// ---------------------------------------------------------------------------
// Engine — loop, input, scenes, walking, speech, inventory and scripting.
// Story code is written as async functions that await these primitives.
// ---------------------------------------------------------------------------
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = W; canvas.height = H;

const FONT_UI = '"Barlow Condensed", "Arial Narrow", "Helvetica Neue", sans-serif';
const FONT_DISPLAY = '"Bodoni Moda", "Didot", "Bodoni 72", Georgia, serif';
const FONT_TYPE = '"Special Elite", "Courier New", monospace';

const COLORS = {
  jack: '#f2e6cf', ilse: '#ff8f8f', franz: '#f3c46b', vendor: '#b9d58c', guard: '#9ec3e6',
  waiter: '#e3d6f5', baron: '#ffb37a', control: '#7fe0d0', vasko: '#ff6b6b', guard2: '#9ec3e6',
};

const G = {
  mode: 'boot', t: 0, flags: {}, inv: [], sel: null, sceneId: null, scene: null,
  actors: [], jack: null, busy: false, speech: [], choices: null, overlay: null,
  mouse: { x: W / 2, y: H / 2, over: null, down: false }, fade: 1, fadeTo: 0, fadeSpeed: 2,
  objective: '', objT: 0, invOpen: 0, paused: false, notice: null, bgCache: {}, hoverInv: -1,
  pickupFlash: null, skip: false,
};

// ---------- canvas fit + fullscreen ------------------------------------------
// On an upright phone the game lays itself sideways to fill the screen, so it
// plays in landscape even inside apps that are locked to portrait.
let ROTATED = false;
function fit() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const coarse = ('ontouchstart' in window) || (window.matchMedia && matchMedia('(pointer: coarse)').matches);
  ROTATED = coarse && vh > vw * 1.1;
  const s = ROTATED ? Math.min(vh / W, vw / H) : Math.min(vw / W, vh / H);
  canvas.style.width = (W * s) + 'px';
  canvas.style.height = (H * s) + 'px';
  canvas.style.transform = ROTATED ? 'rotate(90deg)' : '';
  canvas.style.maxWidth = ROTATED ? 'none' : '';
}
window.addEventListener('orientationchange', () => setTimeout(fit, 250));
window.addEventListener('resize', fit);
fit();
// Inside the FlipPilot app the game runs in a WebView; this hands control back.
const EMBEDDED = typeof window !== 'undefined' && !!window.ReactNativeWebView;
function exitToApp() {
  try { Voice.stop(); Sound.stopMusic(); Sound.setAmbience([]); } catch (e) { /* audio may not be running */ }
  try { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'exit' })); } catch (e) { /* not embedded */ }
}
function toggleFullscreen() {
  const el = document.documentElement;
  try {
    if (!document.fullscreenElement) {
      const r = el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen && el.webkitRequestFullscreen();
      if (r && r.catch) r.catch(() => {});
    } else if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
  } catch (e) { /* fullscreen not available here */ }
}

// ---------- input -----------------------------------------------------------
function toLogical(e) {
  const r = canvas.getBoundingClientRect();
  if (ROTATED) return [(e.clientY - r.top) / r.height * W, (r.right - e.clientX) / r.width * H];
  return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H];
}
canvas.addEventListener('mousemove', e => { [G.mouse.x, G.mouse.y] = toLogical(e); });
canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('mousedown', e => {
  [G.mouse.x, G.mouse.y] = toLogical(e);
  Sound.init();
  G.mouse.down = true;
  onClick(e.button === 2 ? 'right' : 'left');
});
canvas.addEventListener('mouseup', () => { G.mouse.down = false; Sound.init(); });
// Touch: tap = act, press and hold = examine. Every finger is tracked so the
// action sequences can run and jump at the same time.
G.touch = ('ontouchstart' in window) || (window.matchMedia && matchMedia('(pointer: coarse)').matches);
G.touches = {};
const HOLD_MS = 450;
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  G.touch = true;
  Sound.init();
  for (const t of e.changedTouches) {
    const [x, y] = toLogical(t);
    G.touches[t.identifier] = { x, y, x0: x, y0: y, t0: performance.now(), fired: false };
    [G.mouse.x, G.mouse.y] = [x, y];
    G.mouse.down = true;
    if (G.mode === 'action') { G.action.touchStart && G.action.touchStart(x, y); continue; }
    const tt = G.touches[t.identifier];
    tt.timer = setTimeout(() => { if (!tt.fired && G.touches[t.identifier] === tt) { tt.fired = true; onClick('right'); } }, HOLD_MS);
  }
}, { passive: false });
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  for (const t of e.changedTouches) {
    const tt = G.touches[t.identifier]; if (!tt) continue;
    [tt.x, tt.y] = toLogical(t);
    [G.mouse.x, G.mouse.y] = [tt.x, tt.y];
    if (Math.hypot(tt.x - tt.x0, tt.y - tt.y0) > 40) clearTimeout(tt.timer);
  }
}, { passive: false });
const touchEnd = e => {
  e.preventDefault();
  Sound.init();
  for (const t of e.changedTouches) {
    const tt = G.touches[t.identifier]; if (!tt) continue;
    clearTimeout(tt.timer);
    delete G.touches[t.identifier];
    if (G.mode !== 'action' && !tt.fired && e.type === 'touchend') { [G.mouse.x, G.mouse.y] = [tt.x0, tt.y0]; onClick('left'); }
  }
  G.mouse.down = Object.keys(G.touches).length > 0;
};
canvas.addEventListener('touchend', touchEnd, { passive: false });
canvas.addEventListener('touchcancel', touchEnd, { passive: false });
const KEYS = {};
window.addEventListener('keydown', e => {
  KEYS[e.key] = true;
  if (e.key === 'Tab') e.preventDefault();
  Sound.init();
  if (e.key === 'f' || e.key === 'F') toggleFullscreen();
  if (e.key === 'm' || e.key === 'M') { Sound.toggleMute(); if (Sound.muted) Voice.stop(); }
  if (G.overlay && G.overlay.key) { G.overlay.key(e.key); return; }
  if (G.mode === 'action') { G.action.key && G.action.key(e.key, true); }
  if (e.key === 'Escape') {
    if (G.mode === 'play' || G.mode === 'action') G.paused = !G.paused;
  }
  if ((e.key === ' ' || e.key === 'Enter' || e.key === '.') && G.speech.length) skipSpeech();
  if (G.mode === 'text' && (e.key === ' ' || e.key === 'Enter')) TextScreen.skip();
});
window.addEventListener('keyup', e => { KEYS[e.key] = false; });

function onClick(button) {
  const { x, y } = G.mouse;
  G.idleT = 0;
  if (G.mode === 'title') return Title.click(x, y);
  if (G.mode === 'text') return TextScreen.skip();
  if (G.paused) return Pause.click(x, y);
  if (G.mode === 'action' && y < 100 && x > W - 190) return x > W - 100 ? (G.paused = true) : toggleFullscreen();
  if (G.mode === 'action') return G.action.click && G.action.click(x, y, button);
  if (G.mode !== 'play') return;
  // Corner buttons work at any time, even mid-conversation.
  if (y < 100 && x > W - 380) {
    Sound.sfx('click');
    if (x > W - 100) return (G.paused = true);
    if (x > W - 190) return toggleFullscreen();
    if (x > W - 280) return (G.invPinned = !G.invPinned);
    G.revealUntil = G.t + 4; return;
  }
  if (G.overlay) return G.overlay.click && G.overlay.click(x, y, button);
  if (G.choices) return Choices.click(x, y);
  if (G.speech.length) return skipSpeech();
  // Top-right buttons
  if (G.busy) return;

  // Inventory bar
  if (G.invOpen > 0.5 && y > H - INV.h) {
    const i = invSlotAt(x, y);
    if (i >= 0 && G.inv[i]) {
      const id = G.inv[i];
      if (button === 'right') return run(() => lookItemStory(id));
      if (G.sel && G.sel !== id) return run(() => combineItems(G.sel, id));
      G.sel = G.sel === id ? null : id;
      Sound.sfx('click');
    }
    return;
  }
  if (button === 'right' && G.sel) { G.sel = null; return; }

  const hs = hotspotAt(x, y);
  if (hs) {
    Sound.sfx('click');
    const item = G.sel;
    G.sel = null;
    return run(() => interact(hs, button === 'right' ? 'look' : item ? 'item' : 'default', item));
  }
  if (button === 'left') {
    G.sel = null;
    const [tx, ty] = nearestInPoly(x, y, G.scene.walk);
    run(() => walkTo(tx, ty), true);
  }
}

// ---------- scripting --------------------------------------------------------
let runToken = 0;
// Run a story script. Walk-only scripts are interruptible by a new click.
async function run(fn, interruptible) {
  const token = ++runToken;
  G.busy = !interruptible;
  G.cancelWalk = false;
  try { await fn(token); }
  catch (e) { if (e !== 'cancel') console.error(e); }
  if (token === runToken) G.busy = false;
}
const wait = s => new Promise(r => {
  const end = G.t + s;
  const tick = () => (G.t >= end || G.skipWait) ? r() : requestAnimationFrame(tick);
  tick();
});
function waitUntil(pred) {
  return new Promise(r => { const tick = () => pred() ? r() : requestAnimationFrame(tick); tick(); });
}

// ---------- flags / items ----------------------------------------------------
const flag = (k, v) => (v === undefined ? G.flags[k] : (G.flags[k] = v));
const has = id => G.inv.includes(id);
function addItem(id) {
  if (!has(id)) G.inv.push(id);
  G.pickupFlash = { id, t: 0 };
  Sound.sfx('pickup');
}
function removeItem(id) { G.inv = G.inv.filter(i => i !== id); if (G.sel === id) G.sel = null; }
function setObjective(text) { G.objective = text; G.objT = 0; }
function notify(text, dur = 3) { G.notice = { text, t: 0, dur }; }

// ---------- scenes -----------------------------------------------------------
function sceneBg(id) {
  if (!G.bgCache[id]) {
    const c = makeCanvas(W, H), cx = c.getContext('2d');
    SCENES[id].paint(cx);
    if (SCENES[id].painterly !== false) painterly(c, SCENES[id].painterly || {});
    if (SCENES[id].paintAfter) SCENES[id].paintAfter(cx);
    canvasWeave(cx);
    G.bgCache[id] = c;
  }
  return G.bgCache[id];
}
function depthScale(y) {
  const [y0, s0, y1, s1] = G.scene.depth;
  return lerp(s0, s1, clamp((y - y0) / (y1 - y0), 0, 1));
}
async function gotoScene(id, x, y, facing, opts = {}) {
  if (G.sceneId && !opts.instant) { G.fadeTo = 1; await waitUntil(() => G.fade >= 0.99); }
  Sound.sfx(opts.sfx || 'door');
  const sc = SCENES[id];
  sceneBg(id);
  G.sceneId = id; G.scene = sc; G.sel = null;
  G.jack.x = x; G.jack.y = y; G.jack.facing = facing || 1; G.jack.walking = false;
  G.jack.look = LOOKS[jackLook()];
  G.actors = [G.jack, ...(sc.actors ? sc.actors() : [])];
  G.jack.scale = depthScale(y);
  for (const a of G.actors) if (a !== G.jack && a.depthScale !== false && !a.fixedScale) a.scale = depthScale(a.y) * (a.scaleMul || 1);
  if (sc.rain) sc._rain = new Rain(sc.rain.n, sc.rain);
  Sound.playMusic(sc.music);
  Sound.setAmbience(sc.ambience || []);
  Sound.setMusicFilter(sc.musicFilter || 18000);
  save();
  G.fadeTo = 0;
  G.title = { text: sc.title, t: 0 };
  if (sc.enter) await sc.enter();
}
// Which outfit Jack is wearing; a chapter can override this.
function jackLook() { return CHAPTER.jackLook ? CHAPTER.jackLook() : flag('tux') ? 'jackTux' : 'jack'; }
function actor(id) { return G.actors.find(a => a.id === id); }
function removeActor(id) { G.actors = G.actors.filter(a => a.id !== id); }

// ---------- walking ---------------------------------------------------------
function walkTo(tx, ty, fig = G.jack, speedMul = 1) {
  return new Promise(resolve => {
    fig.target = [tx, ty];
    fig.walking = true;
    fig.speedMul = speedMul;
    fig.onArrive = resolve;
  });
}
function faceTo(x, fig = G.jack) { fig.facing = x < fig.x ? -1 : 1; }
function updateWalker(f, dt) {
  if (!f.walking || !f.target) return;
  const [tx, ty] = f.target;
  const dx = tx - f.x, dy = ty - f.y, d = Math.hypot(dx, dy);
  const sc = f.scale;
  const speed = (f.running ? 520 : 250) * (sc / 1.9) * (f.speedMul || 1);
  const step = speed * dt;
  if (Math.abs(dx) > 2) f.facing = dx < 0 ? -1 : 1;
  const before = Math.floor(f.walkPhase / Math.PI);
  f.walkPhase += step / (44 * sc) * Math.PI * 0.95;
  if (Math.floor(f.walkPhase / Math.PI) !== before && (f === G.jack || f.steps)) Sound.sfxAt('step' + ((G.scene && G.scene.floor) || ''), f.x);
  if (d <= step) {
    f.x = tx; f.y = ty; f.walking = false; f.target = null;
    const cb = f.onArrive; f.onArrive = null; cb && cb();
  } else {
    f.x += dx / d * step; f.y += dy / d * step;
  }
  if (f === G.jack || f.depthScale) f.scale = depthScale(f.y) * (f.scaleMul || 1);
}

// ---------- speech ----------------------------------------------------------
// who: a figure, or a string id for off-screen voices ('control').
function say(who, text, opts = {}) {
  return new Promise(resolve => {
    const fig = typeof who === 'string' ? (actor(who) || null) : who;
    const id = typeof who === 'string' ? who : (who.id || 'jack');
    const dur = opts.dur || Math.max(1.8, 0.9 + text.length * 0.055);
    const s = { fig, id, text, t: 0, dur, resolve, color: COLORS[id] || COLORS[fig && fig.id] || '#eee', pos: opts.pos, thought: opts.thought };
    G.speech = [s];
    if (fig && !opts.thought) fig.talking = true;
    s.voiced = Voice.speak(id, text, ok => {
      if (!ok) { s.voiced = false; return; } // fall back to the reading timer
      s.voiceDone = true; s.doneAt = s.t;
      if (s.fig) s.fig.talking = false;
    }, { thought: opts.thought });
  });
}
// Jack's inner voice: a thought bubble, spoken softly.
function think(text, who = G.jack) { return say(who, text, { thought: true }); }
function skipSpeech() {
  const s = G.speech[0];
  if (!s) return;
  if (s.t < 0.25) return; // swallow accidental double-clicks
  Voice.stop();
  endSpeech(s);
}
function endSpeech(s) {
  if (s.fig) s.fig.talking = false;
  G.speech = [];
  s.resolve();
}
function drawSpeech(ctx) {
  const s = G.speech[0];
  if (!s) return;
  ctx.save();
  ctx.font = `600 44px ${FONT_UI}`;
  ctx.textAlign = 'center';
  const lines = wrapText(ctx, s.text, 900);
  let x, y;
  if (s.pos) [x, y] = s.pos;
  else if (s.fig) { const b = figureBox(s.fig); x = s.fig.x; y = b.headY - (s.thought ? 110 : 40); }
  else { x = W / 2; y = 150; }
  const lh = 50;
  y -= (lines.length - 1) * lh;
  y = Math.max(s.thought ? 110 : 70, y);
  const maxW = Math.max(...lines.map(l => ctx.measureText(l).width));
  x = clamp(x, maxW / 2 + 40, W - maxW / 2 - 40);
  const appear = clamp(s.t * 6, 0, 1);
  ctx.globalAlpha = appear;
  if (s.thought) {
    // a cloud of soft circles around the text, with bubbles trailing to the head
    const bw = maxW + 90, bh = lines.length * lh + 50;
    const bx = x - bw / 2, by = y - 52;
    const wob = Math.sin(G.t * 2) * 2;
    ctx.fillStyle = 'rgba(236,230,214,0.94)';
    ctx.strokeStyle = 'rgba(40,34,26,0.55)'; ctx.lineWidth = 3;
    const puffs = [];
    const nx = Math.max(3, Math.round(bw / 95));
    for (let i = 0; i <= nx; i++) {
      const r1 = 36 + ((i * 37) % 17), r2 = 34 + ((i * 53) % 19);
      puffs.push([bx + (bw * i) / nx, by + wob - (i % 2) * 8, r1]);
      puffs.push([bx + (bw * i) / nx + 20, by + bh - wob + (i % 2) * 6, r2]);
    }
    for (const yy of [by + bh * 0.33, by + bh * 0.66]) { puffs.push([bx - 8, yy, 34]); puffs.push([bx + bw + 8, yy, 34]); }
    ctx.beginPath(); for (const [px, py, r] of puffs) { ctx.moveTo(px + r, py); ctx.arc(px, py, r, 0, Math.PI * 2); } ctx.stroke();
    ctx.beginPath(); for (const [px, py, r] of puffs) { ctx.moveTo(px + r, py); ctx.arc(px, py, r, 0, Math.PI * 2); } ctx.fill();
    ctx.fillRect(bx, by, bw, bh);
    if (s.fig) {
      const b = figureBox(s.fig);
      const hx = s.fig.x + s.fig.facing * 10, hy = b.headY + 30;
      [[0.25, 16], [0.55, 11], [0.8, 7]].forEach(([k, r]) => {
        const cx = lerp(x, hx, k), cy = lerp(by + bh, hy, k);
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); ctx.stroke();
      });
    }
    ctx.font = `italic 500 40px ${FONT_UI}`;
    ctx.fillStyle = '#2a241c';
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
    ctx.restore();
    return;
  }
  ctx.lineJoin = 'round';
  ctx.lineWidth = 9;
  ctx.strokeStyle = 'rgba(5,8,12,0.92)';
  if (!s.fig) {
    ctx.font = `italic 600 44px ${FONT_UI}`;
  }
  lines.forEach((l, i) => {
    ctx.strokeText(l, x, y + i * lh);
    ctx.fillStyle = s.color;
    ctx.fillText(l, x, y + i * lh);
  });
  ctx.restore();
}

// ---------- choices ----------------------------------------------------------
function choose(options) {
  return new Promise(resolve => {
    G.choices = { options: options.filter(Boolean), resolve, hover: -1, t: 0 };
  });
}
const Choices = {
  rows() {
    const opts = G.choices.options, lh = 64;
    const top = H - 40 - opts.length * lh;
    return opts.map((o, i) => ({ o, i, x: 120, y: top + i * lh, w: W - 240, h: lh }));
  },
  click(x, y) {
    const r = this.rows().find(r => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h);
    if (!r) return;
    Sound.sfx('click');
    const c = G.choices; G.choices = null;
    c.resolve(r.o.value !== undefined ? r.o.value : r.i);
  },
  draw(ctx) {
    const c = G.choices; if (!c) return;
    const rows = this.rows();
    const top = rows[0].y - 30;
    ctx.save();
    ctx.fillStyle = linGrad(ctx, 0, top - 80, 0, H, [[0, 'rgba(4,8,12,0)'], [0.25, 'rgba(4,8,12,0.88)'], [1, 'rgba(4,8,12,0.95)']]);
    ctx.fillRect(0, top - 80, W, H - top + 80);
    ctx.font = `500 40px ${FONT_UI}`;
    ctx.textBaseline = 'middle';
    c.hover = -1;
    rows.forEach(r => {
      const hov = G.mouse.x > r.x && G.mouse.x < r.x + r.w && G.mouse.y > r.y && G.mouse.y < r.y + r.h;
      if (hov) c.hover = r.i;
      ctx.fillStyle = hov ? '#f0b35b' : '#cfc6b4';
      ctx.fillText((hov ? '›  ' : '    ') + r.o.text, r.x, r.y + r.h / 2);
    });
    ctx.restore();
  },
};

// ---------- hotspots --------------------------------------------------------
function hsContains(h, x, y) {
  if (h.when && !h.when()) return false;
  if (h.rect) { const [rx, ry, rw, rh] = h.rect; return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh; }
  if (h.poly) return inPoly(x, y, h.poly);
  if (h.actor) { const a = actor(h.actor); if (!a) return false; const b = figureBox(a); return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h; }
  return false;
}
function hotspotAt(x, y) {
  const list = (G.scene && G.scene.hotspots) || [];
  // Actors and smaller hotspots win: search in reverse declaration order.
  for (let i = list.length - 1; i >= 0; i--) if (hsContains(list[i], x, y)) return list[i];
  return null;
}
function verbLabel(h) {
  const n = typeof h.name === 'function' ? h.name() : h.name;
  if (G.sel) return `Use ${ITEMS[G.sel].name} with ${n}`;
  if (h.exit) return h.exitLabel || `Go to ${n}`;
  if (h.talk) return `Talk to ${n}`;
  if (h.take) return `Pick up ${n}`;
  if (h.use) return `${h.useVerb || 'Use'} ${n}`;
  return `Look at ${n}`;
}
async function approach(h) {
  if (h.at) {
    const [ax, ay] = h.at;
    const [tx, ty] = nearestInPoly(ax, ay, G.scene.walk);
    if (dist(tx, ty, G.jack.x, G.jack.y) > 6) await walkTo(tx, ty);
  }
  if (h.face !== undefined) G.jack.facing = h.face;
  else if (h.rect) faceTo(h.rect[0] + h.rect[2] / 2);
  else if (h.actor && actor(h.actor)) faceTo(actor(h.actor).x);
}
// A photographic close-up that appears while an object is being discussed.
const PHOTOS = {};
if (typeof PHOTO_DATA !== 'undefined') for (const [k, v] of Object.entries(PHOTO_DATA)) { const im = new Image(); im.src = v; PHOTOS[k] = im; }
function drawPhoto(ctx, dt) {
  const p = G.photo;
  if (!p) return;
  p.t += dt;
  const im = PHOTOS[p.id];
  if (!im || !im.complete) return;
  const a = ease(clamp(p.t * 3, 0, 1));
  const size = 560, pad = 26;
  const left = G.jack && G.jack.x > W * 0.55; // opposite side to the speaker portrait
  const cx = left ? 120 + size / 2 : W - 120 - size / 2, cy = 110 + (size + pad * 2 + 60) / 2;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(cx, cy + (1 - a) * 40);
  ctx.rotate((left ? -1 : 1) * 0.035);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#efe9dc';
  ctx.fillRect(-size / 2 - pad, -size / 2 - pad, size + pad * 2, size + pad * 2 + 60);
  ctx.shadowColor = 'transparent';
  ctx.drawImage(im, -size / 2, -size / 2, size, size);
  // a little vignette and warmth, like a print
  ctx.fillStyle = radGrad(ctx, 0, 0, size * 0.3, size * 0.75, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(20,10,0,0.35)']]);
  ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.font = `500 26px ${FONT_TYPE}`; ctx.fillStyle = '#3a3226'; ctx.textAlign = 'center';
  ctx.fillText(p.label, 0, size / 2 + 46);
  ctx.restore();
}

async function interact(h, mode, item) {
  if (h.photo && mode !== 'item' && !h.exit) {
    G.photo = { id: h.photo, t: 0, label: typeof h.name === 'function' ? h.name() : h.name };
    try { return await interactInner(h, mode, item); }
    finally { G.photo = null; }
  }
  return interactInner(h, mode, item);
}
async function interactInner(h, mode, item) {
  if (mode === 'look') {
    faceToHotspot(h);
    return h.look ? h.look() : say(G.jack, 'Nothing special.');
  }
  await approach(h);
  if (mode === 'item' && h.exit && !h.item) return h.exit();
  if (mode === 'item') {
    if (h.item) { const r = await h.item(item); if (r !== false) return; }
    return say(G.jack, pick(['That won\'t work.', 'I don\'t think so.', 'Not a chance.', 'That doesn\'t help here.']));
  }
  if (h.exit) return h.exit();
  if (h.talk) return h.talk();
  if (h.take) return h.take();
  if (h.use) return h.use();
  return h.look ? h.look() : null;
}
function faceToHotspot(h) {
  if (h.rect) faceTo(h.rect[0] + h.rect[2] / 2);
  else if (h.actor && actor(h.actor)) faceTo(actor(h.actor).x);
  else if (h.at) faceTo(h.at[0]);
}
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// ---------- inventory ---------------------------------------------------------
const INV = { h: 150, slot: 116, gap: 18 };
function invSlotRect(i) {
  const n = Math.max(8, G.inv.length);
  const total = n * INV.slot + (n - 1) * INV.gap;
  const x0 = (W - total) / 2;
  const y = H - INV.h + 16 + (1 - G.invOpen) * INV.h;
  return [x0 + i * (INV.slot + INV.gap), y, INV.slot, INV.slot];
}
function invSlotAt(x, y) {
  for (let i = 0; i < Math.max(8, G.inv.length); i++) {
    const [rx, ry, rw, rh] = invSlotRect(i);
    if (x >= rx && x <= rx + rw && y >= ry && y <= ry + rh) return i;
  }
  return -1;
}
async function lookItem(id) { await say(G.jack, ITEMS[id].desc); }
async function combineItems(a, b) {
  G.sel = null;
  await say(G.jack, 'Those two don\'t go together.');
}
function drawInventory(ctx) {
  const want = (G.mode === 'play' && !G.busy && !G.choices && !G.overlay && (G.invPinned || (!G.touch && G.mouse.y > H - INV.h - 10) || G.sel)) ? 1 : 0;
  G.invOpen += (want - G.invOpen) * 0.2;
  // Always-visible hint tab.
  ctx.save();
  if (G.mode === 'play' && G.invOpen < 0.5 && !G.choices && !G.busy) {
    ctx.globalAlpha = 0.7;
    ctx.font = `600 22px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(8,12,16,0.6)';
    rrect(ctx, W / 2 - 90, H - 34, 180, 40, 8); ctx.fill();
    ctx.fillStyle = '#d9cdb5';
    ctx.fillText(G.touch ? `BAG BUTTON, TOP RIGHT  (${G.inv.length})` : `INVENTORY  (${G.inv.length})`, W / 2, H - 8);
  }
  ctx.restore();
  if (G.invOpen < 0.02) return;
  ctx.save();
  const y0 = H - INV.h + (1 - G.invOpen) * INV.h;
  ctx.fillStyle = linGrad(ctx, 0, y0 - 40, 0, H, [[0, 'rgba(6,10,14,0)'], [0.3, 'rgba(6,10,14,0.85)'], [1, 'rgba(6,10,14,0.95)']]);
  ctx.fillRect(0, y0 - 40, W, H - y0 + 40);
  G.hoverInv = invSlotAt(G.mouse.x, G.mouse.y);
  for (let i = 0; i < Math.max(8, G.inv.length); i++) {
    const [x, y, w, h] = invSlotRect(i);
    const id = G.inv[i];
    ctx.fillStyle = G.sel && G.sel === id ? 'rgba(240,179,91,0.25)' : 'rgba(255,255,255,0.05)';
    rrect(ctx, x, y, w, h, 10); ctx.fill();
    ctx.strokeStyle = G.hoverInv === i && id ? '#f0b35b' : 'rgba(217,205,181,0.18)';
    ctx.lineWidth = 2; ctx.stroke();
    if (id) {
      ctx.save(); ctx.translate(x + w / 2, y + h / 2); ITEMS[id].icon(ctx, 1); ctx.restore();
    }
  }
  if (G.hoverInv >= 0 && G.inv[G.hoverInv]) {
    const id = G.inv[G.hoverInv];
    const label = G.sel && G.sel !== id ? `Use ${ITEMS[G.sel].name} with ${ITEMS[id].name}` : ITEMS[id].name + '   ·   click to select, right-click to examine';
    drawLabel(ctx, label, W / 2, y0 - 22);
  }
  ctx.restore();
}

// ---------- HUD ---------------------------------------------------------------
function drawLabel(ctx, text, x, y) {
  ctx.save();
  ctx.font = `600 34px ${FONT_UI}`;
  ctx.textAlign = 'center';
  ctx.lineWidth = 7; ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(5,8,12,0.9)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = '#f0e4c8';
  ctx.fillText(text, x, y);
  ctx.restore();
}
function drawCursor(ctx) {
  const { x, y } = G.mouse;
  if (G.touch && !(G.sel && G.mode === 'play')) return; // fingers need no cursor
  ctx.save();
  if (G.sel && G.mode === 'play') {
    ctx.translate(x + 30, y + 30); ctx.scale(0.6, 0.6); ITEMS[G.sel].icon(ctx, 1);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  const hot = G.mouse.over;
  if (hot && hot.exit && !G.sel) {
    // Exits get an arrow cursor pointing the way out.
    const dir = exitDir(hot);
    ctx.translate(x, y); ctx.rotate({ right: 0, left: Math.PI, up: -Math.PI / 2 }[dir]);
    ctx.fillStyle = '#f0b35b'; ctx.strokeStyle = 'rgba(5,8,12,0.9)'; ctx.lineWidth = 4; ctx.lineJoin = 'round';
    const k = 1 + Math.sin(G.t * 8) * 0.08;
    ctx.scale(k, k);
    ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(-2, -20); ctx.lineTo(-2, -9); ctx.lineTo(-22, -9); ctx.lineTo(-22, 9); ctx.lineTo(-2, 9); ctx.lineTo(-2, 20); ctx.closePath();
    ctx.stroke(); ctx.fill();
    ctx.restore();
    return;
  }
  const r = hot ? 16 + Math.sin(G.t * 8) * 2 : 11;
  ctx.strokeStyle = hot ? '#f0b35b' : 'rgba(240,228,200,0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { ctx.moveTo(x + dx * (r + 4), y + dy * (r + 4)); ctx.lineTo(x + dx * (r + 12), y + dy * (r + 12)); }
  ctx.stroke();
  ctx.fillStyle = hot ? '#f0b35b' : '#f0e4c8';
  ctx.beginPath(); ctx.arc(x, y, 2.5, 0, 7); ctx.fill();
  ctx.restore();
}
function exitDir(h) {
  if (h.exitDir) return h.exitDir;
  const cx = h.rect ? h.rect[0] + h.rect[2] / 2 : W / 2;
  return cx < 330 ? 'left' : cx > W - 330 ? 'right' : 'up';
}
// Soft glowing chevrons on every way out, and (while Tab is held) a marker on
// everything you can interact with.
function drawSignposts(ctx) {
  if (G.mode !== 'play' || G.choices || G.overlay) return;
  const list = (G.scene && G.scene.hotspots) || [];
  const reveal = KEYS.Tab || (G.revealUntil && G.t < G.revealUntil);
  ctx.save();
  for (const h of list) {
    if (h.when && !h.when()) continue;
    let cx, cy;
    if (h.rect) { cx = h.rect[0] + h.rect[2] / 2; cy = h.rect[1] + h.rect[3] / 2; }
    else if (h.actor && actor(h.actor)) { const b = figureBox(actor(h.actor)); cx = b.x + b.w / 2; cy = b.y + b.h * 0.3; }
    else continue;
    if (h.exit) {
      const dir = exitDir(h), pulse = 0.55 + 0.35 * Math.sin(G.t * 3), hov = G.mouse.over === h;
      const ax = clamp(cx, 70, W - 70), ay = h.rect ? h.rect[1] + h.rect[3] * 0.62 : cy;
      ctx.save(); ctx.translate(ax, ay); ctx.rotate({ right: 0, left: Math.PI, up: -Math.PI / 2 }[dir]);
      ctx.globalAlpha = hov ? 1 : pulse * 0.8;
      ctx.shadowColor = 'rgba(240,179,91,0.9)'; ctx.shadowBlur = 18;
      ctx.strokeStyle = '#f0b35b'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const off = Math.sin(G.t * 3) * 5;
      for (const d of [0, 18]) { ctx.beginPath(); ctx.moveTo(-10 + d + off, -14); ctx.lineTo(4 + d + off, 0); ctx.lineTo(-10 + d + off, 14); ctx.stroke(); }
      ctx.restore();
    }
    if (reveal) {
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = '#f0b35b'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 7); ctx.stroke();
      ctx.fillStyle = '#f0b35b'; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 7); ctx.fill();
      ctx.font = `600 24px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(5,8,12,0.9)';
      const n = typeof h.name === 'function' ? h.name() : h.name;
      ctx.strokeText(n, cx, cy - 24); ctx.fillStyle = '#f0e4c8'; ctx.fillText(n, cx, cy - 24);
    }
  }
  ctx.restore();
}
function drawHud(ctx, dt) {
  // hover label
  if (G.mode === 'play' && !G.busy && !G.choices && !G.overlay && !G.speech.length) {
    const inInv = G.invOpen > 0.5 && G.mouse.y > H - INV.h;
    const h = inInv ? null : hotspotAt(G.mouse.x, G.mouse.y);
    if (h !== G.mouse.over && h) Sound.sfx('hover');
    G.mouse.over = h;
    if (h) drawLabel(ctx, verbLabel(h), clamp(G.mouse.x, 300, W - 300), Math.max(60, G.mouse.y - 46));
    else if (G.sel && !inInv) drawLabel(ctx, `Use ${ITEMS[G.sel].name} with …`, clamp(G.mouse.x, 300, W - 300), Math.max(60, G.mouse.y - 46));
  } else G.mouse.over = null;

  // scene title card
  if (G.title) {
    G.title.t += dt;
    const a = clamp(Math.min(G.title.t - 0.4, 3.6 - G.title.t), 0, 1);
    if (a > 0) {
      ctx.save(); ctx.globalAlpha = a;
      ctx.font = `600 26px ${FONT_UI}`; ctx.fillStyle = '#f0b35b'; ctx.textAlign = 'left';
      const ty = G.objT < 6 ? 170 : 70;
      ctx.fillText(G.title.text.toUpperCase().split('').join(String.fromCharCode(8202)), 64, ty);
      ctx.fillStyle = 'rgba(240,179,91,0.7)'; ctx.fillRect(64, ty + 12, 60, 2);
      ctx.restore();
    }
  }
  // objective toast
  if (G.objective && G.objT < 6) {
    G.objT += dt;
    const a = clamp(Math.min(G.objT, 6 - G.objT), 0, 1);
    ctx.save(); ctx.globalAlpha = a;
    ctx.font = `600 22px ${FONT_UI}`; ctx.fillStyle = '#f0b35b'; ctx.fillText('NEW OBJECTIVE', 64, 70);
    ctx.font = `500 34px ${FONT_UI}`; ctx.fillStyle = '#f0e4c8'; ctx.fillText(G.objective, 64, 110);
    ctx.restore();
  }
  // item pickup flash
  if (G.pickupFlash) {
    const p = G.pickupFlash; p.t += dt;
    const a = clamp(Math.min(p.t * 3, 2.6 - p.t), 0, 1);
    if (p.t > 2.6) G.pickupFlash = null;
    else {
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(6,10,14,0.8)'; rrect(ctx, W / 2 - 260, 60, 520, 110, 14); ctx.fill();
      ctx.strokeStyle = 'rgba(240,179,91,0.5)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.translate(W / 2 - 190, 115); ctx.scale(0.75, 0.75); ITEMS[p.id].icon(ctx, 1); ctx.restore();
      ctx.textAlign = 'left';
      ctx.font = `600 20px ${FONT_UI}`; ctx.fillStyle = '#f0b35b'; ctx.fillText('ADDED TO INVENTORY', W / 2 - 120, 102);
      ctx.font = `600 36px ${FONT_UI}`; ctx.fillStyle = '#f0e4c8'; ctx.fillText(ITEMS[p.id].name, W / 2 - 120, 142);
      ctx.restore();
    }
  }
  if (G.notice) {
    const n = G.notice; n.t += dt;
    const a = clamp(Math.min(n.t * 3, n.dur - n.t), 0, 1);
    if (n.t > n.dur) G.notice = null;
    else { ctx.save(); ctx.globalAlpha = a; drawLabel(ctx, n.text, W / 2, 200); ctx.restore(); }
  }
  // corner buttons: show hotspots, inventory, fullscreen, menu
  if (G.mode === 'play' || G.mode === 'action') {
    ctx.save();
    ctx.globalAlpha = G.touch ? 0.8 : (G.mouse.y < 100 && G.mouse.x > W - 380 ? 0.95 : 0.45);
    ctx.strokeStyle = '#f0e4c8'; ctx.lineWidth = 3;
    if (G.touch) {
      ctx.fillStyle = 'rgba(6,10,14,0.45)';
      for (const bx of [W - 370, W - 280, W - 190, W - 100]) { rrect(ctx, bx + 6, 8, 78, 78, 16); ctx.fill(); }
    }
    if (G.mode === 'play') {
      // eye: reveal everything you can use
      const ex = W - 325, ey = 47;
      ctx.beginPath(); ctx.moveTo(ex - 24, ey); ctx.quadraticCurveTo(ex, ey - 22, ex + 24, ey); ctx.quadraticCurveTo(ex, ey + 22, ex - 24, ey); ctx.stroke();
      ctx.beginPath(); ctx.arc(ex, ey, 8, 0, 7); ctx.fillStyle = '#f0e4c8'; ctx.fill();
      // bag: inventory
      const bx = W - 235, by = 47;
      ctx.strokeStyle = G.invPinned ? '#f0b35b' : '#f0e4c8';
      rrect(ctx, bx - 22, by - 12, 44, 32, 6); ctx.stroke();
      ctx.beginPath(); ctx.arc(bx, by - 12, 11, Math.PI, 0); ctx.stroke();
      ctx.strokeStyle = '#f0e4c8';
    }
    // fullscreen glyph
    const fx = W - 163, fy = 29;
    ctx.beginPath();
    ctx.moveTo(fx, fy + 10); ctx.lineTo(fx, fy); ctx.lineTo(fx + 10, fy);
    ctx.moveTo(fx + 26, fy); ctx.lineTo(fx + 36, fy); ctx.lineTo(fx + 36, fy + 10);
    ctx.moveTo(fx + 36, fy + 26); ctx.lineTo(fx + 36, fy + 36); ctx.lineTo(fx + 26, fy + 36);
    ctx.moveTo(fx + 10, fy + 36); ctx.lineTo(fx, fy + 36); ctx.lineTo(fx, fy + 26);
    ctx.stroke();
    // menu glyph
    for (let i = 0; i < 3; i++) ctx.fillStyle = '#f0e4c8', ctx.fillRect(W - 79, 34 + i * 13, 36, 4);
    ctx.restore();
  }
}

// ---------- pause menu ---------------------------------------------------------
const Pause = {
  items() {
    return [
      { text: 'Resume', act: () => { G.paused = false; } },
      { text: document.fullscreenElement ? 'Exit full screen' : 'Full screen', act: () => toggleFullscreen() },
      { text: Sound.muted ? 'Sound: off' : 'Sound: on', act: () => Sound.toggleMute() },
      { text: Voice.enabled ? 'Spoken dialogue: on' : 'Spoken dialogue: off', act: () => Voice.toggle() },
      { text: 'Restart this scene', act: () => { G.paused = false; restartScene(); } },
      { text: 'Quit to title', act: () => { G.paused = false; Title.show(); } },
      EMBEDDED && { text: 'Exit to FlipPilot', act: () => { G.paused = false; save(); exitToApp(); } },
    ].filter(Boolean);
  },
  rows() { return this.items().map((it, i) => ({ ...it, x: W / 2 - 250, y: 440 + i * 76, w: 500, h: 64 })); },
  click(x, y) {
    const r = this.rows().find(r => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h);
    if (r) { Sound.sfx('click'); r.act(); }
  },
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(4,7,10,0.84)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.font = `italic 700 76px ${FONT_DISPLAY}`; ctx.fillStyle = '#f0e4c8';
    ctx.fillText('Paused', W / 2, 250);
    if (G.objective && G.mode === 'play') {
      ctx.font = `600 22px ${FONT_UI}`; ctx.fillStyle = '#f0b35b'; ctx.fillText('CURRENT OBJECTIVE', W / 2, 330);
      ctx.font = `500 34px ${FONT_UI}`; ctx.fillStyle = '#d9cdb5'; ctx.fillText(G.objective, W / 2, 374);
    }
    ctx.font = `600 40px ${FONT_UI}`;
    for (const r of this.rows()) {
      const hov = G.mouse.x > r.x && G.mouse.x < r.x + r.w && G.mouse.y > r.y && G.mouse.y < r.y + r.h;
      ctx.fillStyle = hov ? '#f0b35b' : '#cfc6b4';
      ctx.fillText(r.text, W / 2, r.y + 44);
    }
    ctx.font = `500 24px ${FONT_UI}`; ctx.fillStyle = 'rgba(207,198,180,0.6)';
    ctx.fillText(G.touch ? 'Tap: walk / act   ·   Press and hold: examine   ·   Eye button: show hotspots   ·   Bag button: inventory' : 'Left-click: walk / act   ·   Right-click: examine   ·   Hold Tab: show hotspots   ·   F: full screen   ·   M: mute', W / 2, H - 70);
    ctx.restore();
  },
};

// ---------- save/load -----------------------------------------------------------
function save() {
  if (G.mode !== 'play' || !SCENES[G.sceneId]) return;
  store.set(CHAPTER.saveKey, { flags: G.flags, inv: G.inv, scene: G.sceneId, x: G.jack.x, y: G.jack.y, facing: G.jack.facing, objective: G.objective });
}
function hasSave() { return !!store.get(CHAPTER.saveKey); }
async function loadGame() {
  const s = store.get(CHAPTER.saveKey);
  if (!s) return newGame();
  G.flags = s.flags || {}; G.inv = s.inv || []; G.objective = s.objective || '';
  G.objT = 99;
  startPlay();
  G.sceneId = null;
  await gotoScene(s.scene, s.x, s.y, s.facing, { instant: true });
}
function restartScene() {
  const s = store.get(CHAPTER.saveKey);
  if (G.mode === 'action') { G.action.start(); return; }
  if (s) loadGame();
}
function startPlay() {
  G.mode = 'play'; G.paused = false; G.speech = []; G.choices = null; G.overlay = null; G.sel = null;
  G.busy = false;
  G.jack = makeFigure('jack', 400, 900, { id: 'jack', scale: 2, seed: 1 });
}

// ---------- main loop ------------------------------------------------------------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  G.t += dt;
  G.fade += clamp(G.fadeTo - G.fade, -dt * G.fadeSpeed, dt * G.fadeSpeed);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (G.mode === 'title') Title.draw(ctx, dt);
  else if (G.mode === 'text') TextScreen.draw(ctx, dt);
  else if (G.mode === 'action') { if (!G.paused) G.action.update(dt); G.action.draw(ctx, dt); drawSpeech(ctx); drawHud(ctx, dt); }
  else if (G.mode === 'play') { if (!G.paused) update(dt); draw(ctx, dt); }
  if (G.fade > 0.001) { ctx.fillStyle = `rgba(0,0,0,${G.fade})`; ctx.fillRect(0, 0, W, H); }
  if (G.paused) Pause.draw(ctx);
  drawCursor(ctx);
  requestAnimationFrame(frame);
}

function update(dt) {
  const sc = G.scene;
  const idle = G.busy && !G.speech.length && !G.choices && !G.overlay && G.fade < 0.02 && !G.actors.some(a => a.walking);
  G.stuckT = idle ? (G.stuckT || 0) + dt : 0;
  // If the player seems stuck, Jack thinks out loud about what to do next.
  G.idleT = (!G.busy && !G.speech.length && !G.choices && !G.overlay && !G.paused) ? (G.idleT || 0) + dt : 0;
  if (G.idleT > 30 && typeof hintThought === 'function') { G.idleT = -30; run(() => hintThought()); }
  if (G.stuckT > 8) { G.busy = false; G.stuckT = 0; runToken++; }
  for (const a of G.actors) updateWalker(a, dt);
  for (const s of G.speech) {
    s.t += dt;
    // Voiced lines end shortly after the voice does; silent ones on a reading timer.
    const done = s.voiced ? (s.voiceDone && s.t > s.doneAt + 0.35) : s.t > s.dur;
    if (done || s.t > s.dur * 2.5 + 3) endSpeech(s);
  }
  if (sc._rain) sc._rain.update(dt, sc.rain.ground);
  if (sc.update) sc.update(dt, G.t);
}
function draw(ctx, dt) {
  const sc = G.scene, t = G.t;
  ctx.drawImage(sceneBg(G.sceneId), 0, 0);
  if (sc.back) sc.back(ctx, t);
  // Actors and props sorted by depth.
  const items = G.actors.filter(a => !a.hidden).map(a => ({ y: a.y, a }));
  if (sc.props) for (const p of sc.props) if (!p.when || p.when()) items.push({ y: p.y, p });
  items.sort((a, b) => a.y - b.y);
  for (const it of items) {
    if (it.a) it.a.mouthOpen = speakingMouth(it.a);
    if (it.a) drawFigure(ctx, it.a, t, it.a.light || sc.light);
    else it.p.draw(ctx, t);
  }
  if (sc.front) sc.front(ctx, t);
  if (sc._rain) sc._rain.draw(ctx);
  drawVignette(ctx, sc.vignette ?? 0.7);
  drawGrain(ctx, 0.06);
  if (G.overlay) G.overlay.draw(ctx, dt);
  drawSignposts(ctx);
  drawSpeakerPortrait(ctx, dt);
  drawPhoto(ctx, dt);
  drawSpeech(ctx);
  Choices.draw(ctx);
  drawInventory(ctx);
  drawHud(ctx, dt);
  if (DEBUG.on) DEBUG.draw(ctx);
}

const DEBUG = {
  on: /debug/.test(location.hash),
  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = 'lime'; ctx.lineWidth = 2;
    const p = G.scene.walk; ctx.beginPath(); ctx.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
    ctx.closePath(); ctx.stroke();
    ctx.strokeStyle = 'magenta';
    for (const h of G.scene.hotspots || []) {
      if (h.rect) ctx.strokeRect(...h.rect);
      if (h.at) { ctx.fillStyle = 'magenta'; ctx.fillRect(h.at[0] - 4, h.at[1] - 4, 8, 8); }
    }
    ctx.fillStyle = 'lime'; ctx.font = '20px monospace';
    ctx.fillText(`${G.mouse.x | 0}, ${G.mouse.y | 0}`, G.mouse.x + 20, G.mouse.y);
    ctx.restore();
  },
};
