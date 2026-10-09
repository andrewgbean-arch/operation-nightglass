// Sound: recorded music and ambience loops, a sprite of sound effects, the voices,
// all through a small mixing desk with a reverb send. Ambience and steps are placed
// in the stereo field; the voice's loudness drives the speaker's mouth.
import sfxURL from '../../assets/audio/sfx.mp3';
import sfxMap from '../../assets/audio/sfx.json';
import { bytes } from './assets.js';
// sfxMap is bundled as data either way; sfxURL is a data URL or a file next to the page.

export const Audio = {
  ctx: null, buffers: new Map(), loops: {}, vol: { music: 0.6, voice: 1, sfx: 0.85 },
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const c = this.ctx = new C();
    this.master = c.createGain(); this.master.connect(c.destination);
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3; comp.connect(this.master);
    this.bus = {};
    for (const k of ['music', 'amb', 'sfx', 'voice']) { const g = c.createGain(); g.connect(comp); this.bus[k] = g; }
    this.applyVolumes();
    // a short convolution reverb, generated, for footsteps and doors
    const len = c.sampleRate * 1.6, ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    this.verb = c.createConvolver(); this.verb.buffer = ir; this.verbSend = c.createGain(); this.verbSend.gain.value = 0.25;
    this.verbSend.connect(this.verb); this.verb.connect(this.bus.sfx);
    this.analyser = c.createAnalyser(); this.analyser.fftSize = 512; this.level = new Float32Array(512);
    this.voiceOut = c.createGain(); this.voiceOut.connect(this.analyser); this.voiceOut.connect(this.bus.voice);
    this.load(sfxURL).then(b => (this.sfxBuf = b));
  },
  applyVolumes() {
    if (!this.ctx) return;
    this.bus.music.gain.value = this.vol.music * 0.55; this.bus.voice.gain.value = this.vol.voice;
    this.bus.sfx.gain.value = this.vol.sfx; this.bus.amb.gain.value = this.vol.sfx * 0.9;
  },
  async load(url) {
    if (this.buffers.has(url)) return this.buffers.get(url);
    const p = bytes(url).then(a => this.ctx.decodeAudioData(a));
    this.buffers.set(url, p); return p;
  },
  // a looping bed (music or ambience), crossfaded in
  async loop(slot, url, { gain = 1, fade = 2, bus = 'amb' } = {}) {
    if (!this.ctx) return;
    const cur = this.loops[slot];
    if (cur && cur.url === url) return;
    if (cur) { cur.g.gain.setTargetAtTime(0, this.ctx.currentTime, fade / 3); setTimeout(() => cur.src.stop(), fade * 1000 + 200); }
    if (!url) { delete this.loops[slot]; return; }
    const entry = { url }; this.loops[slot] = entry;
    const buf = await this.load(url);
    if (this.loops[slot] !== entry) return;
    const src = this.ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const g = this.ctx.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(gain, this.ctx.currentTime, fade / 3);
    src.connect(g).connect(this.bus[bus]); src.start();
    entry.src = src; entry.g = g;
  },
  stopLoops(except = []) { for (const k of Object.keys(this.loops)) if (!except.includes(k)) this.loop(k, null); },
  // one sound from the effects sprite: a random variant, slight pitch jitter, panned, with reverb
  sfx(name, { pan = 0, gain = 1, verb = null } = {}) {
    if (!this.ctx || !this.sfxBuf) return;
    const e = sfxMap.sfx[name]; if (!e) return;
    const [off, dur] = e.v[Math.floor(Math.random() * e.v.length)];
    const s = this.ctx.createBufferSource(); s.buffer = this.sfxBuf; s.playbackRate.value = 1 + (Math.random() * 2 - 1) * (e.j || 0);
    const g = this.ctx.createGain(); g.gain.value = gain;
    const p = this.ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan));
    s.connect(g).connect(p).connect(this.bus.sfx);
    const r = this.ctx.createGain(); r.gain.value = verb ?? e.rev ?? 0.2; p.connect(r).connect(this.verbSend);
    s.start(0, off, dur);
  },
  // a recorded line; resolves when it finishes (or false if there's no recording)
  voice(url) {
    return new Promise(async res => {
      if (!this.ctx || !url) return res(false);
      try {
        const buf = await this.load(url);
        if (this.cur) try { this.cur.stop(); } catch (e) {}
        const s = this.ctx.createBufferSource(); s.buffer = buf; s.connect(this.voiceOut);
        this.cur = s; s.onended = () => { if (this.cur === s) this.cur = null; res(true); };
        s.start();
      } catch (e) { res(false); }
    });
  },
  stopVoice() { if (this.cur) try { this.cur.stop(); } catch (e) {} this.cur = null; },
  voiceLevel() {
    if (!this.analyser || !this.cur) return 0;
    this.analyser.getFloatTimeDomainData(this.level);
    let s = 0; for (let i = 0; i < this.level.length; i++) s += this.level[i] * this.level[i];
    return Math.min(1, Math.sqrt(s / this.level.length) * 7);
  },
};
