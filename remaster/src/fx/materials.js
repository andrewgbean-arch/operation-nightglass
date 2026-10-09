// Materials painted in code: wet cobbles, stuccoed façades with lit windows, posters.
import * as THREE from 'three';
import { canvasTexture } from '../core/assets.js';

const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Cobbles: colour, a height-based normal map, and roughness that's low in the puddles.
export function cobbles({ repeat = [6, 3], seed = 7 } = {}) {
  const S = 512, r = rng(seed), stones = [];
  for (let y = 0; y < S; y += 28) for (let x = (y / 28 % 2) * 16; x < S + 32; x += 32 + r() * 6) stones.push([x + r() * 6, y + r() * 5, 13 + r() * 3, 11 + r() * 3, r()]);
  const paint = (fn) => (x, w, h) => { fn(x, w, h); };
  const col = canvasTexture(S, S, paint((x) => {
    x.fillStyle = '#16171a'; x.fillRect(0, 0, S, S);
    for (const [cx, cy, rx, ry, v] of stones) { const l = 38 + v * 34; x.fillStyle = `rgb(${l + 6},${l + 4},${l})`; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, 7); x.fill();
      const g = x.createRadialGradient(cx - 4, cy - 4, 1, cx, cy, rx); g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(1, 'rgba(0,0,0,0.25)'); x.fillStyle = g; x.fill(); }
  }), { repeat });
  const height = document.createElement('canvas'); height.width = height.height = S; const h = height.getContext('2d');
  h.fillStyle = '#000'; h.fillRect(0, 0, S, S);
  for (const [cx, cy, rx, ry] of stones) { const g = h.createRadialGradient(cx, cy, 1, cx, cy, rx + 1); g.addColorStop(0, '#fff'); g.addColorStop(0.7, '#bbb'); g.addColorStop(1, '#000'); h.fillStyle = g; h.beginPath(); h.ellipse(cx, cy, rx, ry, 0, 0, 7); h.fill(); }
  const hd = h.getImageData(0, 0, S, S).data;
  const nrm = canvasTexture(S, S, (x) => {
    const out = x.createImageData(S, S), o = out.data, H = (i, j) => hd[(((j + S) % S) * S + ((i + S) % S)) * 4] / 255;
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const dx = (H(i - 1, j) - H(i + 1, j)) * 3, dy = (H(i, j - 1) - H(i, j + 1)) * 3, k = (j * S + i) * 4; const l = Math.hypot(dx, dy, 1); o[k] = (dx / l * 0.5 + 0.5) * 255; o[k + 1] = (dy / l * 0.5 + 0.5) * 255; o[k + 2] = (1 / l * 0.5 + 0.5) * 255; o[k + 3] = 255; }
    x.putImageData(out, 0, 0);
  }, { srgb: false, repeat });
  // puddles: big soft blobs where the ground is mirror-smooth
  const rough = canvasTexture(S, S, (x) => {
    x.fillStyle = '#a0a0a0'; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 18; i++) { const cx = r() * S, cy = r() * S, rr = 30 + r() * 90; const g = x.createRadialGradient(cx, cy, 0, cx, cy, rr); g.addColorStop(0, '#0a0a0a'); g.addColorStop(0.7, '#262626'); g.addColorStop(1, 'rgba(160,160,160,0)'); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, rr, 0, 7); x.fill(); }
    for (const [cx, cy, rx, ry] of stones) { x.fillStyle = 'rgba(40,40,40,0.18)'; x.beginPath(); x.ellipse(cx, cy, rx * 0.3, ry * 0.3, 0, 0, 7); x.fill(); }
  }, { srgb: false, repeat });
  return new THREE.MeshStandardMaterial({ map: col, normalMap: nrm, normalScale: new THREE.Vector2(0.9, 0.9), roughnessMap: rough, roughness: 1, metalness: 0.05, envMapIntensity: 1.2 });
}

// A Viennese façade: stucco, cornices, and rows of tall windows, some with a lamp lit behind them.
export function facade({ floors = 4, bays = 5, color = '#c8b9a0', seed = 3, lit = 0.35, w = 1024, h = 1024, shop = null } = {}) {
  const r = rng(seed), litWins = [];
  const paint = (x, W, H, emissive) => {
    x.fillStyle = emissive ? '#000' : color; x.fillRect(0, 0, W, H);
    if (!emissive) { for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},${0.03 + r() * 0.04})`; x.fillRect(r() * W, r() * H, 2 + r() * 6, 2 + r() * 6); }
      x.fillStyle = 'rgba(0,0,0,0.18)'; for (let f = 1; f <= floors; f++) x.fillRect(0, H - f * H / (floors + 0.6) - 8, W, 14); x.fillStyle = 'rgba(255,255,255,0.12)'; for (let f = 1; f <= floors; f++) x.fillRect(0, H - f * H / (floors + 0.6) - 10, W, 3);
      const sh = x.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.35)'); x.fillStyle = sh; x.fillRect(0, 0, W, H); }
    const fh = H / (floors + 0.6), bw = W / bays;
    for (let f = shop ? 1 : 0; f < floors; f++) for (let b = 0; b < bays; b++) {
      const wx = b * bw + bw * 0.28, wy = H - (f + 1) * fh + fh * 0.18, ww = bw * 0.44, wh = fh * 0.62, on = litWins[f * bays + b];
      if (emissive) { if (on) { const g = x.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, '#ffcf7a'); g.addColorStop(1, '#b8682a'); x.fillStyle = g; x.fillRect(wx, wy, ww, wh); x.fillStyle = 'rgba(0,0,0,0.6)'; x.fillRect(wx + ww / 2 - 2, wy, 4, wh); x.fillRect(wx, wy + wh * 0.4, ww, 4); } continue; }
      x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(wx - 10, wy - 16, ww + 20, wh + 26);
      x.fillStyle = shadeHex(color, 0.12); x.fillRect(wx - 12, wy - 22, ww + 24, 12); x.fillRect(wx - 8, wy + wh, ww + 16, 10);
      x.fillStyle = on ? '#3a2a14' : '#0e141c'; x.fillRect(wx, wy, ww, wh);
      x.fillStyle = 'rgba(160,190,220,0.15)'; x.fillRect(wx + 4, wy + 4, ww * 0.3, wh * 0.5);
      x.fillStyle = shadeHex(color, -0.25); x.fillRect(wx + ww / 2 - 2, wy, 4, wh); x.fillRect(wx, wy + wh * 0.4, ww, 4);
    }
  };
  for (let i = 0; i < floors * bays; i++) litWins.push(r() < lit);
  const map = canvasTexture(w, h, (x, W, H) => paint(x, W, H, false));
  const emissiveMap = canvasTexture(w, h, (x, W, H) => paint(x, W, H, true));
  return new THREE.MeshStandardMaterial({ map, emissiveMap, emissive: new THREE.Color(0xffffff), emissiveIntensity: 1.6, roughness: 0.92, metalness: 0 });
}
function shadeHex(hex, k) { const c = new THREE.Color(hex); c.offsetHSL(0, 0, k); return '#' + c.getHexString(); }

// Text painted onto a sign or poster.
export function signTexture(w, h, draw) { return canvasTexture(w, h, draw); }
