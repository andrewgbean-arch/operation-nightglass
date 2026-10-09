// Renders the soundtrack offline, entirely from code: a small orchestra of synthesised
// instruments (piano, upright bass, brushed drums, ride, strings, muted trumpet,
// accordion) through a stereo reverb, mixed and encoded to MP3 with ffmpeg.
//   node tools/render-music.mjs <ffmpeg> [only]
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const SR = 44100;
const FFMPEG = process.argv[2];
const ONLY = process.argv[3];
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), '../assets/music');
fs.mkdirSync(OUT, { recursive: true });

let seed = 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

class Mix {
  constructor(sec) { this.n = Math.ceil(sec * SR); this.L = new Float32Array(this.n); this.R = new Float32Array(this.n); this.vL = new Float32Array(this.n); this.vR = new Float32Array(this.n); }
  add(buf, t0, gain = 1, pan = 0, verb = 0.2) {
    const i0 = Math.floor(t0 * SR), gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
    for (let i = 0; i < buf.length; i++) { const j = (i0 + i) % this.n, v = buf[i]; this.L[j] += v * gl; this.R[j] += v * gr; this.vL[j] += v * gl * verb; this.vR[j] += v * gr * verb; }
  }
}

// ---------- instruments: each returns a mono Float32Array ----------------------------
function piano(m, dur, vel = 0.7) {
  const f = mtof(m), len = Math.floor((dur + 1.6) * SR), b = new Float32Array(len);
  const B = 0.0004, decay = 1.2 + 3.5 * Math.pow(0.97, m - 40);
  for (let h = 1; h <= 12; h++) {
    const fh = f * h * Math.sqrt(1 + B * h * h); if (fh > 16000) break;
    const amp = vel / Math.pow(h, 1.25) * (h === 1 ? 1 : 0.8), dh = decay / (1 + h * 0.35), ph = rnd() * 6.28;
    for (let i = 0; i < len; i++) { const t = i / SR; b[i] += amp * Math.sin(6.2832 * fh * t + ph) * Math.exp(-t / dh) * Math.min(1, t * 400); }
  }
  // damper: release after the note's length
  const rel = Math.floor(dur * SR); for (let i = rel; i < len; i++) b[i] *= Math.exp(-(i - rel) / (SR * 0.12));
  for (let i = 0; i < Math.min(len, 400); i++) b[i] += (rnd() * 2 - 1) * 0.04 * vel * (1 - i / 400); // hammer
  return b;
}
function bass(m, dur, vel = 0.8) {
  const f = mtof(m), len = Math.floor((dur + 0.4) * SR), b = new Float32Array(len);
  let lp = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR, env = Math.exp(-t / 0.9) * Math.min(1, t * 300) * (i > dur * SR ? Math.exp(-(i - dur * SR) / (SR * 0.06)) : 1);
    const s = Math.sin(6.2832 * f * t) + 0.45 * Math.sin(6.2832 * 2 * f * t + 0.3) + 0.18 * Math.sin(6.2832 * 3 * f * t) * Math.exp(-t * 8);
    lp += (s - lp) * 0.35; b[i] = lp * env * vel;
  }
  for (let i = 0; i < 600; i++) b[i] += (rnd() * 2 - 1) * 0.06 * vel * (1 - i / 600); // pluck
  return b;
}
function brush(dur = 0.35, vel = 0.5) {
  const len = Math.floor(dur * SR), b = new Float32Array(len); let lp = 0, hp = 0;
  for (let i = 0; i < len; i++) { const t = i / SR, n = rnd() * 2 - 1; lp += (n - lp) * 0.25; hp = n - lp; const env = Math.sin(Math.min(1, t / dur) * Math.PI) * Math.exp(-t * 3); b[i] = hp * env * vel; }
  return b;
}
function ride(vel = 0.3) {
  const len = Math.floor(1.6 * SR), b = new Float32Array(len), fr = [3150, 4280, 5370, 6620, 7900, 9300];
  for (let i = 0; i < len; i++) { const t = i / SR; let s = 0; for (const f of fr) s += Math.sin(6.2832 * f * t + f) + 0.3 * Math.sin(6.2832 * f * 1.47 * t); b[i] = (s / fr.length * 0.6 + (rnd() * 2 - 1) * 0.4) * Math.exp(-t * 2.4) * Math.min(1, t * 2000) * vel; }
  let hp = 0, prev = 0; for (let i = 0; i < len; i++) { hp = 0.92 * (hp + b[i] - prev); prev = b[i]; b[i] = hp; }
  return b;
}
function kick(vel = 0.6) { const len = Math.floor(0.35 * SR), b = new Float32Array(len); for (let i = 0; i < len; i++) { const t = i / SR; b[i] = Math.sin(6.2832 * (52 * t + 30 * (1 - Math.exp(-t * 30)) / 30)) * Math.exp(-t * 9) * vel; } return b; }
function pad(ms, dur, vel = 0.25, bright = 0.3) {
  const len = Math.floor((dur + 1.5) * SR), b = new Float32Array(len);
  for (const m of ms) for (const det of [-0.08, 0.0, 0.07]) {
    const f = mtof(m + det), ph = rnd() * 6.28; let lp = 0;
    for (let i = 0; i < len; i++) {
      const t = i / SR, env = Math.min(1, t / 0.9) * (i > dur * SR ? Math.exp(-(i - dur * SR) / (SR * 0.6)) : 1);
      const saw = ((f * t + ph) % 1) * 2 - 1; lp += (saw - lp) * (0.04 + bright * 0.12);
      b[i] += lp * env * vel / ms.length;
    }
  }
  return b;
}
function trumpet(m, dur, vel = 0.4) { // muted, breathy, with vibrato
  const f = mtof(m), len = Math.floor((dur + 0.3) * SR), b = new Float32Array(len); let lp = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR, vib = 1 + 0.006 * Math.sin(6.2832 * 5.2 * t) * Math.min(1, t * 2);
    const env = Math.min(1, t / 0.06) * (i > dur * SR ? Math.exp(-(i - dur * SR) / (SR * 0.08)) : 1) * (0.85 + 0.15 * Math.exp(-t * 3));
    let s = 0; for (let h = 1; h < 9; h++) s += Math.sin(6.2832 * f * h * vib * t) / h * (h < 4 ? 1 : 0.6);
    s += (rnd() * 2 - 1) * 0.08; lp += (s - lp) * 0.3; b[i] = lp * env * vel;
  }
  return b;
}
function accordion(ms, dur, vel = 0.25) {
  const len = Math.floor((dur + 0.2) * SR), b = new Float32Array(len);
  for (const m of ms) for (const det of [0, 0.12]) { const f = mtof(m + det); for (let i = 0; i < len; i++) { const t = i / SR, env = Math.min(1, t / 0.05) * (i > dur * SR ? Math.exp(-(i - dur * SR) / (SR * 0.05)) : 1); const sq = Math.sin(6.2832 * f * t) + 0.5 * Math.sin(6.2832 * 2 * f * t) + 0.33 * Math.sin(6.2832 * 3 * f * t); b[i] += sq * env * vel / ms.length; } }
  return b;
}
function strings(ms, dur, vel = 0.25) { return pad(ms, dur, vel, 0.55); }

// ---------- reverb: a small Freeverb ------------------------------------------------
function reverb(inp, room = 0.84, damp = 0.25) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617], aps = [556, 441, 341, 225];
  const out = new Float32Array(inp.length);
  for (const [k, len0] of combs.entries()) {
    const len = len0 + (inp.spread || 0), buf = new Float32Array(len); let idx = 0, f = 0;
    for (let i = 0; i < inp.length; i++) { const y = buf[idx]; f = y * (1 - damp) + f * damp; buf[idx] = inp[i] * 0.015 + f * room; out[i] += y; idx = (idx + 1) % len; }
  }
  for (const len of aps) { const buf = new Float32Array(len); let idx = 0; for (let i = 0; i < out.length; i++) { const bv = buf[idx], x = out[i]; out[i] = -x + bv; buf[idx] = x + bv * 0.5; idx = (idx + 1) % len; } }
  return out;
}

function finish(mix, name, { gain = 0.9, wet = 1 } = {}) {
  const vl = reverb(mix.vL), vrIn = mix.vR; vrIn.spread = 23; const vr = reverb(vrIn);
  const n = mix.n, L = new Float32Array(n), R = new Float32Array(n);
  let peak = 0;
  for (let i = 0; i < n; i++) { L[i] = mix.L[i] + vl[i] * wet; R[i] = mix.R[i] + vr[i] * wet; peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
  const g = gain / (peak || 1);
  const pcm = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) { pcm.writeInt16LE(Math.round(Math.tanh(L[i] * g) * 32000), i * 4); pcm.writeInt16LE(Math.round(Math.tanh(R[i] * g) * 32000), i * 4 + 2); }
  const wav = Buffer.alloc(44); wav.write('RIFF', 0); wav.writeUInt32LE(36 + pcm.length, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22); wav.writeUInt32LE(SR, 24); wav.writeUInt32LE(SR * 4, 28); wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(pcm.length, 40);
  const tmp = path.join(OUT, name + '.wav'); fs.writeFileSync(tmp, Buffer.concat([wav, pcm]));
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', tmp, '-b:a', '128k', path.join(OUT, name + '.mp3')]);
  fs.unlinkSync(tmp);
  console.log('rendered', name, (n / SR).toFixed(1) + 's');
}

// ---------- the pieces ------------------------------------------------------------
// Vienna in the rain: a slow noir ballad in D minor. Brushes, walking bass, piano
// voicings, and a muted trumpet playing the Nightglass theme. Loops seamlessly.
function street() {
  seed = 11; const bpm = 66, beat = 60 / bpm, bars = 16, sec = bars * 4 * beat, mix = new Mix(sec);
  const prog = [[50, [62, 65, 69, 72, 76]], [55, [62, 65, 70, 74, 77]], [46, [62, 65, 69, 70, 74]], [45, [61, 64, 67, 70, 73]]]; // Dm9 Gm9 Bbmaj7 A7b9
  const theme = [[0, 74, 1.5], [1.5, 72, 0.5], [2, 69, 2], [4, 70, 1], [5, 69, 0.5], [5.5, 67, 0.5], [6, 65, 2], [8, 64, 1.5], [9.5, 65, 0.5], [10, 67, 1], [11, 69, 1], [12, 73, 3], [15, 69, 1]];
  for (let bar = 0; bar < bars; bar++) {
    const [root, chord] = prog[bar % 4], t0 = bar * 4 * beat;
    // piano: chord on 1, a softer comp on the "and" of 2
    for (const [b, v] of [[0, 0.55], [1.5, 0.32], [3.5, 0.25]]) chord.forEach((m, k) => mix.add(piano(m - (k === 0 ? 12 : 0), beat * (b === 0 ? 1.4 : 0.6), v * (0.85 + rnd() * 0.3)), t0 + b * beat + k * 0.012, 0.32, -0.25 + k * 0.08, 0.35));
    // walking bass
    const walk = [root, root + 7, root + 12 - (bar % 2 ? 2 : 0), root + (bar % 4 === 3 ? 1 : 4)];
    walk.forEach((m, k) => mix.add(bass(m - 12, beat * 0.9, 0.85), t0 + k * beat, 0.5, 0.05, 0.08));
    // brushes on every beat, a swish across 2 and 4, ride with swing
    for (let k = 0; k < 4; k++) mix.add(brush(beat * (k % 2 ? 0.9 : 0.5), k % 2 ? 0.35 : 0.2), t0 + k * beat, 0.5, 0.3, 0.15);
    for (let k = 0; k < 4; k++) { mix.add(ride(0.16), t0 + k * beat, 0.35, 0.45, 0.2); if (k % 2) mix.add(ride(0.09), t0 + (k + 0.66) * beat, 0.35, 0.45, 0.2); }
    if (bar % 2 === 0) mix.add(kick(0.3), t0, 0.35, 0, 0.05);
    // strings swell under bars 9-16
    if (bar >= 8) mix.add(strings(chord.slice(0, 4).map(m => m - 12), 4 * beat, 0.22), t0, 0.5, -0.1, 0.5);
  }
  // the theme on muted trumpet, twice, the second time an octave down then back up
  for (const rep of [0, 1]) for (const [b, m, d] of theme) mix.add(trumpet(m - (rep && b < 8 ? 12 : 0), d * beat * 0.95, 0.32), (rep * 32 + 0 + b) * beat + 4 * beat * 0, 0.55, 0.15, 0.45);
  finish(mix, 'street', { gain: 0.85 });
}

const PIECES = { street };
for (const [k, fn] of Object.entries(PIECES)) if (!ONLY || ONLY.split(',').includes(k)) fn();
