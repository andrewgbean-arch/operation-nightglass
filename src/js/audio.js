// ---------------------------------------------------------------------------
// Audio — everything is synthesised live with WebAudio, no sound files.
// ---------------------------------------------------------------------------
const Sound = {
  ctx: null, master: null, musicBus: null, sfxBus: null, ambBus: null,
  amb: {}, music: null, muted: false,

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.8;
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
    this.master.connect(comp).connect(this.ctx.destination);
    // Shared reverb makes everything sit in the same space.
    this.verb = this.ctx.createConvolver();
    this.verb.buffer = this.impulse(2.8, 2.2);
    const verbGain = this.ctx.createGain(); verbGain.gain.value = 0.35;
    this.verb.connect(verbGain).connect(this.master);
    for (const name of ['musicBus', 'sfxBus', 'ambBus']) {
      this[name] = this.ctx.createGain();
      this[name].connect(this.master);
      this[name].connect(this.verb);
    }
    this.musicBus.gain.value = 0.42;
    this.musicFilter = this.ctx.createBiquadFilter();
    this.musicFilter.type = 'lowpass'; this.musicFilter.frequency.value = 18000;
    this.musicIn = this.ctx.createGain();
    this.musicIn.connect(this.musicFilter).connect(this.musicBus);
    this.sfxBus.gain.value = 0.8;
    this.ambBus.gain.value = 0.6;
    this.noiseBuf = this.makeNoise(3);
  },

  impulse(sec, decay) {
    const len = this.ctx.sampleRate * sec, b = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  },
  makeNoise(sec) {
    const len = this.ctx.sampleRate * sec, b = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.04 * w) / 1.04; d[i] = w * 0.5 + last * 3; }
    return b;
  },
  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : 0.8, this.ctx.currentTime, 0.1);
    return this.muted;
  },

  // --- ambience loops ---------------------------------------------------------
  setAmbience(list) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (const k of Object.keys(this.amb)) {
      if (!list.includes(k)) {
        const a = this.amb[k];
        a.gain.gain.setTargetAtTime(0, t, 0.6);
        setTimeout(() => { try { a.stop(); } catch (e) { /* already stopped */ } }, 3000);
        delete this.amb[k];
      }
    }
    for (const k of list) if (!this.amb[k]) this.amb[k] = this['amb_' + k]();
  },
  noiseLoop(filterType, freq, q, vol, bus) {
    const src = this.ctx.createBufferSource(); src.buffer = this.noiseBuf; src.loop = true;
    const f = this.ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q;
    const g = this.ctx.createGain(); g.gain.value = 0;
    g.gain.setTargetAtTime(vol, this.ctx.currentTime, 1.2);
    src.connect(f).connect(g).connect(bus || this.ambBus);
    src.start();
    return { gain: g, filter: f, stop: () => src.stop() };
  },
  amb_rain() { return this.noiseLoop('bandpass', 2600, 0.4, 0.5); },
  amb_rainWindow() { return this.noiseLoop('lowpass', 900, 0.7, 0.35); },
  amb_room() { return this.noiseLoop('lowpass', 220, 0.5, 0.25); },
  amb_crowd() {
    // Murmur of a reception: formant-filtered noise with a slow wobble.
    const a = this.noiseLoop('bandpass', 520, 2.2, 0.28);
    const lfo = this.ctx.createOscillator(), lg = this.ctx.createGain();
    lfo.frequency.value = 0.7; lg.gain.value = 160;
    lfo.connect(lg).connect(a.filter.frequency); lfo.start();
    const stop = a.stop; a.stop = () => { stop(); lfo.stop(); };
    return a;
  },
  amb_wind() {
    const a = this.noiseLoop('bandpass', 400, 1.5, 0.45);
    const lfo = this.ctx.createOscillator(), lg = this.ctx.createGain();
    lfo.frequency.value = 0.13; lg.gain.value = 260;
    lfo.connect(lg).connect(a.filter.frequency); lfo.start();
    const stop = a.stop; a.stop = () => { stop(); lfo.stop(); };
    return a;
  },

  // --- music: a slow generative noir score ------------------------------------
  // Each mood is a chord progression; a pad plays the chords, a muted bass
  // walks the roots and a lonely vibraphone-ish voice improvises in the scale.
  moods: {
    title:   { bpm: 64, chords: [[50, 57, 60, 65], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 61]], scale: [62, 65, 67, 69, 70, 72, 74, 77], lead: 0.5 },
    hotel:   { bpm: 58, chords: [[50, 57, 60, 64], [48, 55, 58, 62], [46, 53, 57, 62], [45, 52, 55, 61]], scale: [62, 64, 65, 67, 69, 70, 72, 74], lead: 0.35 },
    street:  { bpm: 62, chords: [[45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 53, 58], [40, 47, 52, 56]], scale: [64, 67, 69, 71, 72, 74, 76], lead: 0.3 },
    cafe:    { bpm: 92, chords: [[50, 53, 57, 60], [43, 53, 55, 59], [48, 52, 55, 59], [45, 52, 55, 61]], scale: [62, 64, 65, 67, 69, 71, 72, 74, 76], lead: 0.8, swing: true },
    gala:    { bpm: 84, chords: [[53, 57, 60, 64], [50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64]], scale: [65, 67, 69, 70, 72, 74, 76, 77], lead: 0.65, waltz: true },
    tension: { bpm: 76, chords: [[45, 48, 52, 55], [45, 48, 51, 56], [44, 47, 51, 54], [45, 48, 52, 55]], scale: [69, 70, 72, 75, 76, 79], lead: 0.25 },
    action:  { bpm: 128, chords: [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 58], [40, 47, 52, 56]], scale: [69, 72, 74, 76, 79, 81], lead: 0.5, drive: true },
    end:     { bpm: 60, chords: [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64], [45, 52, 57, 61]], scale: [62, 65, 67, 69, 72, 74, 77], lead: 0.45 },
  },
  playMusic(mood) {
    if (!this.ctx || (this.music && this.music.mood === mood)) return;
    this.stopMusic();
    const m = this.moods[mood];
    const state = { mood, alive: true, step: 0, next: this.ctx.currentTime + 0.15 };
    this.music = state;
    const beat = 60 / m.bpm;
    const tick = () => {
      if (!state.alive) return;
      while (state.next < this.ctx.currentTime + 0.4) {
        this.musicStep(m, state, state.next, beat);
        state.next += beat / 2;
        state.step++;
      }
      state.timer = setTimeout(tick, 100);
    };
    tick();
  },
  stopMusic() {
    if (this.music) { this.music.alive = false; clearTimeout(this.music.timer); this.music = null; }
  },
  musicStep(m, st, t, beat) {
    const beatsPerBar = m.waltz ? 3 : 4, half = st.step;
    const bar = Math.floor(half / (beatsPerBar * 2));
    const chord = m.chords[bar % m.chords.length];
    const inBar = half % (beatsPerBar * 2);
    if (inBar === 0) chord.forEach((n, i) => this.pad(n + 12, t, beat * beatsPerBar * 1.05, 0.05 - i * 0.004));
    // Bass
    if (m.drive) {
      if (inBar % 1 === 0) this.bass(chord[0] - 12 + (inBar % 4 === 3 ? 7 : 0), t, beat * 0.45, 0.22);
    } else if (m.waltz) {
      if (inBar === 0) this.bass(chord[0] - 12, t, beat, 0.2);
      if (inBar === 2 || inBar === 4) chord.slice(1, 3).forEach(n => this.pluck(n, t, 0.05));
    } else if (inBar % 2 === 0) {
      const walk = [0, 7, 12, 10][(inBar / 2) % 4];
      this.bass(chord[0] - 12 + (m.swing ? walk : (inBar === 0 ? 0 : 7)), t + (m.swing && inBar % 4 === 2 ? beat * 0.08 : 0), beat * 0.9, m.swing ? 0.2 : 0.14);
    }
    // Brushed hat for swing / drive
    if (m.swing && inBar % 2 === 1) this.hat(t + beat * 0.16, 0.05);
    if (m.drive) { this.hat(t, inBar % 2 ? 0.05 : 0.08); if (inBar % 4 === 0) this.kick(t); }
    // Lead improvisation
    if (Math.random() < m.lead * 0.45) {
      const n = m.scale[Math.floor(Math.random() * m.scale.length)];
      this.vibe(n, t + (m.swing && half % 2 ? beat * 0.12 : 0), beat * (0.8 + Math.random() * 1.6), 0.07);
    }
  },
  freq(n) { return 440 * Math.pow(2, (n - 69) / 12); },
  env(g, t, a, peak, dur) {
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  },
  pad(n, t, dur, vol) {
    const c = this.ctx, g = c.createGain(), f = c.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 1100;
    for (const det of [-7, 7]) {
      const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = this.freq(n); o.detune.value = det;
      o.connect(f); o.start(t); o.stop(t + dur + 0.1);
    }
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.35); g.gain.linearRampToValueAtTime(0, t + dur);
    f.connect(g).connect(this.musicIn);
  },
  bass(n, t, dur, vol) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = this.freq(n); f.type = 'lowpass'; f.frequency.value = 500;
    this.env(g, t, 0.01, vol, dur);
    o.connect(f).connect(g).connect(this.musicIn); o.start(t); o.stop(t + dur + 0.05);
  },
  pluck(n, t, vol) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = 'triangle'; o.frequency.value = this.freq(n);
    this.env(g, t, 0.005, vol, 0.5);
    o.connect(g).connect(this.musicIn); o.start(t); o.stop(t + 0.6);
  },
  vibe(n, t, dur, vol) {
    const c = this.ctx, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), trem = c.createOscillator(), tg = c.createGain();
    o.type = 'sine'; o.frequency.value = this.freq(n);
    o2.type = 'sine'; o2.frequency.value = this.freq(n) * 4; const g2 = c.createGain(); g2.gain.value = 0.12;
    trem.frequency.value = 5.5; tg.gain.value = vol * 0.3;
    this.env(g, t, 0.01, vol, dur + 0.6);
    trem.connect(tg).connect(g.gain);
    o.connect(g); o2.connect(g2).connect(g);
    g.connect(this.musicIn);
    [o, o2, trem].forEach(x => { x.start(t); x.stop(t + dur + 0.7); });
  },
  hat(t, vol) {
    const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noiseBuf; f.type = 'highpass'; f.frequency.value = 7000;
    this.env(g, t, 0.002, vol, 0.08);
    s.connect(f).connect(g).connect(this.musicIn); s.start(t, Math.random() * 2); s.stop(t + 0.1);
  },
  kick(t) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    this.env(g, t, 0.003, 0.35, 0.25);
    o.connect(g).connect(this.musicIn); o.start(t); o.stop(t + 0.3);
  },

  // --- one-shot effects -------------------------------------------------------
  sfx(name) {
    if (!this.ctx) return;
    const fn = this['sfx_' + name];
    if (fn) fn.call(this, this.ctx.currentTime);
  },
  burst(t, type, freq, q, dur, vol, a = 0.005) {
    const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q;
    this.env(g, t, a, vol, dur);
    s.connect(f).connect(g).connect(this.out()); s.start(t, Math.random() * 2); s.stop(t + dur + 0.05);
  },
  tone(t, type, f0, f1, dur, vol) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    this.env(g, t, 0.005, vol, dur);
    o.connect(g).connect(this.out()); o.start(t); o.stop(t + dur + 0.05);
  },
  sfx_step(t) { this.burst(t, 'lowpass', 300 + Math.random() * 150, 1, 0.09, 0.22); },
  sfx_stepWet(t) { this.burst(t, 'bandpass', 900 + Math.random() * 300, 0.8, 0.12, 0.2); },
  sfx_click(t) { this.tone(t, 'square', 1800, 1200, 0.03, 0.05); },
  sfx_hover(t) { this.tone(t, 'sine', 1400, 1400, 0.03, 0.02); },
  sfx_pickup(t) { this.tone(t, 'sine', 660, 660, 0.12, 0.12); this.tone(t + 0.09, 'sine', 990, 990, 0.25, 0.1); },
  sfx_ring(t) {
    for (let r = 0; r < 2; r++) for (let i = 0; i < 16; i++) {
      this.tone(t + r * 0.45 + i * 0.025, 'triangle', 1100, 1100, 0.02, 0.07);
      this.tone(t + r * 0.45 + i * 0.025, 'triangle', 1350, 1350, 0.02, 0.05);
    }
  },
  sfx_phoneUp(t) { this.burst(t, 'lowpass', 800, 1, 0.12, 0.3); },
  sfx_door(t) { this.burst(t, 'lowpass', 180, 2, 0.5, 0.4, 0.02); this.tone(t, 'sine', 90, 60, 0.3, 0.15); },
  sfx_briefcase(t) { this.tone(t, 'square', 2400, 1800, 0.02, 0.08); this.tone(t + 0.08, 'square', 2400, 1800, 0.02, 0.08); },
  sfx_paper(t) { this.burst(t, 'highpass', 3000, 0.5, 0.35, 0.12, 0.05); },
  sfx_coin(t) { this.tone(t, 'sine', 2600, 2600, 0.3, 0.06); this.tone(t + 0.07, 'sine', 3200, 3200, 0.25, 0.05); },
  sfx_beep(t) { this.tone(t, 'square', 1500, 1500, 0.07, 0.06); },
  sfx_error(t) { this.tone(t, 'square', 220, 180, 0.3, 0.08); },
  sfx_unlock(t) { this.tone(t, 'square', 800, 800, 0.05, 0.06); this.burst(t + 0.2, 'lowpass', 400, 3, 0.2, 0.4); this.tone(t + 0.3, 'sine', 120, 70, 0.4, 0.2); },
  sfx_clink(t) { this.tone(t, 'sine', 3100, 3100, 0.6, 0.06); this.tone(t, 'sine', 4650, 4650, 0.4, 0.03); },
  sfx_dart(t) { this.burst(t, 'highpass', 2500, 1, 0.12, 0.3); this.tone(t, 'sine', 1800, 400, 0.12, 0.05); },
  sfx_thud(t) { this.tone(t, 'sine', 110, 45, 0.35, 0.4); this.burst(t, 'lowpass', 200, 1, 0.25, 0.4); },
  sfx_jump(t) { this.burst(t, 'bandpass', 700, 1, 0.2, 0.2); },
  sfx_land(t) { this.tone(t, 'sine', 140, 50, 0.2, 0.3); this.burst(t, 'lowpass', 500, 1, 0.15, 0.3); },
  sfx_alarm(t) {
    for (let i = 0; i < 4; i++) this.tone(t + i * 0.7, 'sawtooth', 700, 1100, 0.35, 0.05), this.tone(t + i * 0.7 + 0.35, 'sawtooth', 1100, 700, 0.35, 0.05);
  },
  sfx_spotted(t) { this.tone(t, 'sawtooth', 300, 900, 0.25, 0.08); },
  sfx_whoosh(t) { this.burst(t, 'bandpass', 900, 0.6, 1.2, 0.25, 0.5); },
  sfx_sting(t) { [57, 60, 63, 66].forEach((n, i) => this.tone(t + i * 0.02, 'sawtooth', this.freq(n), this.freq(n), 1.6, 0.03)); },
  sfx_zip(t) { const c = this.ctx; this.tone(t, 'sawtooth', 200, 90, 2.4, 0.04); this.burst(t, 'bandpass', 1800, 4, 2.4, 0.15, 0.1); },
  sfx_drink(t) { for (let i = 0; i < 3; i++) this.burst(t + i * 0.18, 'bandpass', 500, 3, 0.1, 0.15); },
  sfx_typewriter(t) { this.burst(t, 'bandpass', 2400 + Math.random() * 800, 3, 0.04, 0.12); },
};
