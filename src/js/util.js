// ---------------------------------------------------------------------------
// Operation Nightglass — shared helpers: math, colour, painting primitives.
// ---------------------------------------------------------------------------
const W = 1920, H = 1080;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

// Deterministic RNG so painted scenes look identical on every load.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// --- gradients -------------------------------------------------------------
function linGrad(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}
function radGrad(ctx, x, y, r0, r1, stops) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}

// --- shapes ----------------------------------------------------------------
function poly(ctx, pts, fill, stroke, lw) {
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
}
function rect(ctx, x, y, w, h, fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function ellipse(ctx, x, y, rx, ry, fill, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2);
  ctx.fillStyle = fill; ctx.fill();
}

// Additive soft light.
function glow(ctx, x, y, r, color, alpha = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = alpha;
  ctx.fillStyle = radGrad(ctx, x, y, 0, r, [[0, color], [1, 'rgba(0,0,0,0)']]);
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

// A cone of light falling from (x,y) downward, spreading to width w at height h.
function lightCone(ctx, x, y, topW, w, h, color, alpha = 0.35) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(x - topW / 2, y);
  ctx.lineTo(x + topW / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.lineTo(x - w / 2, y + h);
  ctx.closePath();
  ctx.fillStyle = linGrad(ctx, 0, y, 0, y + h, [[0, color], [1, 'rgba(0,0,0,0)']]);
  ctx.fill();
  ctx.restore();
}

// Hazy vertical fog band.
function fog(ctx, y0, y1, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = linGrad(ctx, 0, y0, 0, y1, [[0, 'rgba(0,0,0,0)'], [0.5, color], [1, 'rgba(0,0,0,0)']]);
  ctx.fillRect(0, y0, W, y1 - y0);
  ctx.restore();
}

// Scatter of short strokes for texture (wood grain, plaster, fabric).
function texture(ctx, x, y, w, h, color, n, len, seed, alpha = 0.15, angle = 0) {
  const r = rng(seed);
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const px = x + r() * w, py = y + r() * h, a = angle + (r() - 0.5) * 0.3, l = len * (0.4 + r());
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l);
  }
  ctx.stroke();
  ctx.restore();
}

// --- painterly pass ----------------------------------------------------------
// Re-lays the image as thousands of small directional brush dabs sampled from
// itself. Softens hard vector edges into something that reads as paint.
function painterly(canvas, opts = {}) {
  const { strokes = 90000, min = 2, max = 7, alpha = 0.55, seed = 7 } = opts;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const src = ctx.getImageData(0, 0, w, h).data;
  const r = rng(seed);
  for (let i = 0; i < strokes; i++) {
    const x = (r() * w) | 0, y = (r() * h) | 0;
    const k = (y * w + x) * 4;
    if (src[k + 3] < 250) continue; // leave transparent areas untouched
    // Stroke direction follows a slow flow field.
    const a = Math.sin(x * 0.004 + y * 0.002) * 1.2 + Math.cos(y * 0.006) * 0.6;
    const len = min + r() * (max - min);
    ctx.setTransform(Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), x, y);
    ctx.fillStyle = `rgba(${src[k]},${src[k + 1]},${src[k + 2]},${alpha})`;
    ctx.fillRect(-len, -len * 0.28, len * 2, len * 0.56);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// Canvas-texture grain baked into the painting (static).
function canvasWeave(ctx, seed = 3, alpha = 0.05) {
  const r = rng(seed);
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let i = 0; i < 26000; i++) {
    ctx.fillStyle = r() > 0.5 ? '#fff' : '#000';
    ctx.fillRect(r() * W, r() * H, 1 + r() * 2, 1);
  }
  ctx.restore();
}

// --- post effects (per frame) ------------------------------------------------
let _grain = null;
function grainCanvas() {
  if (_grain) return _grain;
  _grain = makeCanvas(256, 256);
  const g = _grain.getContext('2d');
  const d = g.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = Math.random() * 255;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  return _grain;
}
function drawGrain(ctx, alpha = 0.05) {
  const g = grainCanvas();
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'overlay';
  const ox = (Math.random() * 256) | 0, oy = (Math.random() * 256) | 0;
  ctx.translate(-ox, -oy);
  ctx.fillStyle = ctx.createPattern(g, 'repeat');
  ctx.fillRect(0, 0, W + 256, H + 256);
  ctx.restore();
}
let _vig = null;
function drawVignette(ctx, strength = 0.75) {
  if (!_vig) {
    _vig = makeCanvas(W, H);
    const v = _vig.getContext('2d');
    v.fillStyle = radGrad(v, W / 2, H * 0.48, H * 0.35, H * 1.05, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,1)']]);
    v.fillRect(0, 0, W, H);
  }
  ctx.save(); ctx.globalAlpha = strength; ctx.drawImage(_vig, 0, 0); ctx.restore();
}

// Rain: a pool of falling streaks, re-used per scene.
class Rain {
  constructor(n, opts = {}) {
    this.opts = Object.assign({ angle: 0.18, speed: 1900, color: 'rgba(190,215,230,0.35)', len: 38, x0: 0, x1: W, y0: 0, y1: H }, opts);
    this.drops = [];
    for (let i = 0; i < n; i++) this.drops.push(this.spawn(true));
    this.splashes = [];
  }
  spawn(anywhere) {
    const o = this.opts;
    const z = 0.4 + Math.random() * 0.6; // depth
    return { x: o.x0 + Math.random() * (o.x1 - o.x0 + 200) - 100, y: anywhere ? o.y0 + Math.random() * (o.y1 - o.y0) : o.y0 - Math.random() * 200, z };
  }
  update(dt, groundY) {
    const o = this.opts;
    for (const d of this.drops) {
      d.y += o.speed * d.z * dt;
      d.x += o.speed * d.z * dt * o.angle;
      if (d.y > (groundY ? groundY - 60 + d.z * 140 : o.y1)) {
        if (groundY && Math.random() < 0.35) this.splashes.push({ x: d.x, y: d.y, t: 0 });
        Object.assign(d, this.spawn(false));
      }
    }
    for (const s of this.splashes) s.t += dt;
    this.splashes = this.splashes.filter(s => s.t < 0.25);
  }
  draw(ctx) {
    const o = this.opts;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = o.color;
    ctx.lineCap = 'round';
    for (const layer of [0, 1]) {
      ctx.lineWidth = layer ? 2 : 1;
      ctx.beginPath();
      for (const d of this.drops) {
        if ((d.z > 0.75) !== !!layer) continue;
        const l = o.len * d.z;
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - l * o.angle, d.y - l);
      }
      ctx.stroke();
    }
    ctx.lineWidth = 1.2;
    for (const s of this.splashes) {
      ctx.globalAlpha = 1 - s.t / 0.25;
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, 4 + s.t * 40, 1 + s.t * 6, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// Point-in-polygon + nearest point, for walk areas.
function inPoly(x, y, p) {
  let inside = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    const xi = p[i], yi = p[i + 1], xj = p[j], yj = p[j + 1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function nearestInPoly(x, y, p) {
  if (inPoly(x, y, p)) return [x, y];
  let best = null, bd = Infinity;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    const ax = p[j], ay = p[j + 1], bx = p[i], by = p[i + 1];
    const dx = bx - ax, dy = by - ay;
    const t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1);
    const cx = ax + dx * t, cy = ay + dy * t, d = dist(x, y, cx, cy);
    if (d < bd) { bd = d; best = [cx, cy]; }
  }
  // Nudge inward toward the polygon's centroid so we're strictly inside.
  let mx = 0, my = 0;
  for (let i = 0; i < p.length; i += 2) { mx += p[i]; my += p[i + 1]; }
  mx /= p.length / 2; my /= p.length / 2;
  return [best[0] + (mx - best[0]) * 0.01, best[1] + (my - best[1]) * 0.01];
}

function wrapText(ctx, text, maxW) {
  const words = text.split(' '), lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* storage unavailable */ } },
};
