// ---------------------------------------------------------------------------
// Chapter Two sound — a colder score and the noises of Karvograd: rails,
// snow wind, a cavernous station hall, a bubbling samovar, a folk song on the
// radio, steam, fire, geese and the Iron Arrow's whistle. All synthesised.
// ---------------------------------------------------------------------------
Object.assign(Sound.moods, {
  // D minor with a raised fourth: a little Slavic, a little lonely
  title:     { bpm: 58, chords: [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 63], [45, 52, 57, 61]], scale: [62, 64, 65, 68, 69, 70, 73, 74], lead: 0.5 },
  train:     { bpm: 72, chords: [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 58], [40, 47, 52, 56]], scale: [64, 65, 68, 69, 71, 72, 76], lead: 0.35, swing: true },
  karvograd: { bpm: 60, chords: [[47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 60], [42, 49, 54, 58]], scale: [59, 61, 62, 64, 66, 67, 70, 71], lead: 0.4 },
  buffet:    { bpm: 96, chords: [[45, 52, 57, 60], [45, 52, 57, 60], [40, 47, 52, 56], [45, 52, 57, 60], [50, 57, 62, 65], [45, 52, 57, 60], [40, 47, 52, 56], [45, 52, 57, 60]], scale: [69, 71, 72, 74, 76, 77, 80, 81], lead: 0.75, waltz: true },
  platform:  { bpm: 70, chords: [[43, 46, 50, 53], [43, 46, 49, 54], [42, 45, 49, 52], [43, 46, 50, 53]], scale: [67, 68, 70, 73, 74, 77], lead: 0.25 },
});

Object.assign(Sound, {
  // --- ambience -----------------------------------------------------------------
  // Wheels over rail joints: the da-dum, da-dum of a night train, and its roar.
  amb_trainRumble() {
    const roar = this.noiseLoop('lowpass', 140, 0.8, 0.5);
    const hiss = this.noiseLoop('bandpass', 900, 0.4, 0.06);
    let n = 0;
    const clack = this.eventLoop(0.55, 0.62, (out, t) => {
      n++;
      for (const dt of [0, 0.13]) {
        this.nz(out, t + dt, 'lowpass', 260, 2, 0.08, 0.5, 0.002, -0.2);
        this.nz(out, t + dt, 'bandpass', 1400, 4, 0.03, 0.08, 0.001, 0.2);
      }
      if (n % 9 === 0) this.nz(out, t + 0.3, 'bandpass', 2600, 8, 0.25, 0.04, 0.01, 0.5); // a squeal on a curve
    }, 0.8, 0.2);
    return this.group([roar, hiss, clack]);
  },
  // Snow wind: a hollow howl that rises and falls.
  amb_snowWind() {
    const a = this.noiseLoop('bandpass', 480, 3, 0.3);
    const lfo = this.ctx.createOscillator(), lg = this.ctx.createGain();
    lfo.frequency.value = 0.09; lg.gain.value = 220;
    lfo.connect(lg).connect(a.filter.frequency); lfo.start();
    const b = this.noiseLoop('highpass', 5000, 0.5, 0.05);
    const stop = a.stop; a.stop = () => { stop(); lfo.stop(); };
    return this.group([a, b]);
  },
  // A huge stone hall: distant footsteps echoing, a far-off whistle, murmurs.
  amb_stationHall() {
    const bed = this.noiseLoop('lowpass', 300, 0.6, 0.18);
    const steps = this.eventLoop(0.4, 0.9, (out, t) => {
      const pan = Math.random() * 1.6 - 0.8;
      this.nz(this.verb, t, 'bandpass', 1800 + Math.random() * 600, 3, 0.04, 0.1, 0.001, pan);
      this.nz(out, t, 'bandpass', 1800, 3, 0.04, 0.03, 0.001, pan);
    }, 0.6, 0.5);
    const far = this.eventLoop(25, 50, (out, t) => this.whistle(out, t, 0.03), 1, 10);
    const murmur = this.eventLoop(0.15, 0.4, (out, t) => {
      this.nz(this.verb, t, 'bandpass', 300 + Math.random() * 400, 5, 0.15, 0.03, 0.03, Math.random() * 1.6 - 0.8);
    }, 0.6, 0);
    return this.group([bed, steps, far, murmur]);
  },
  amb_stationFar() {
    return this.eventLoop(18, 40, (out, t) => {
      if (Math.random() < 0.5) this.whistle(out, t, 0.025);
      else { this.nz(out, t, 'lowpass', 200, 1, 2, 0.12, 0.8, 0.6); this.nz(out, t + 0.4, 'bandpass', 1200, 6, 0.08, 0.05, 0.001, 0.6); } // wagons shunting
    }, 1, 5);
  },
  amb_samovar() {
    const bed = this.noiseLoop('bandpass', 700, 1.2, 0.03);
    const bubbles = this.eventLoop(0.06, 0.3, (out, t) => {
      const f = 300 + Math.random() * 500;
      this.osc(out, t, 'sine', f, f * 1.8, 0.06, 0.03, 0.002, 0.1);
    }, 0.7, 0);
    return this.group([bed, bubbles]);
  },
  // Karvonian State Radio: a little accordion folk tune through a tinny speaker.
  amb_radioFolk() {
    const c = this.ctx, radio = c.createBiquadFilter(), g = c.createGain(), pan = c.createStereoPanner();
    radio.type = 'bandpass'; radio.frequency.value = 1300; radio.Q.value = 0.9;
    g.gain.value = 0; g.gain.setTargetAtTime(0.5, c.currentTime, 1);
    pan.pan.value = 0.6;
    radio.connect(g).connect(pan).connect(this.ambBus);
    const tune = [69, 71, 72, 74, 72, 71, 69, 68, 69, 76, 74, 72, 71, 72, 69, 69];
    let i = 0;
    const loop = this.eventLoop(0.34, 0.34, (out, t) => {
      const n = tune[i++ % tune.length];
      for (const det of [0, 7]) {
        const o = c.createOscillator(), og = c.createGain();
        o.type = 'square'; o.frequency.value = this.freq(n); o.detune.value = det;
        og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(0.03, t + 0.03); og.gain.linearRampToValueAtTime(0, t + 0.3);
        o.connect(og).connect(radio); o.start(t); o.stop(t + 0.32);
      }
      if (i % 2) { const o = c.createOscillator(), og = c.createGain(); o.type = 'square'; o.frequency.value = this.freq(tune[0] - 24 + (i % 4 === 1 ? 0 : 7)); og.gain.setValueAtTime(0.025, t); og.gain.linearRampToValueAtTime(0, t + 0.2); o.connect(og).connect(radio); o.start(t); o.stop(t + 0.22); }
    }, 1, 0.5);
    const crackle = this.eventLoop(0.1, 0.5, (out, t) => this.nz(radio, t, 'highpass', 3000, 1, 0.004, 0.2, 0.001), 1, 0);
    return { gain: g, stop: () => { loop.stop(); crackle.stop(); } };
  },
  amb_steam() {
    const hiss = this.eventLoop(3, 8, (out, t) => {
      const n = this.nz(out, t, 'highpass', 1800, 0.6, 1.8 + Math.random(), 0.16, 0.08, 0.7);
      n.f.frequency.setValueAtTime(3000, t); n.f.frequency.linearRampToValueAtTime(1500, t + 2);
    }, 1, 1);
    const pant = this.eventLoop(1.1, 1.3, (out, t) => this.nz(out, t, 'lowpass', 400, 1, 0.4, 0.07, 0.05, 0.7), 1, 0);
    return this.group([hiss, pant]);
  },
  amb_brazier() {
    const roar = this.noiseLoop('lowpass', 500, 0.6, 0.08);
    const crackle = this.eventLoop(0.05, 0.3, (out, t) => this.nz(out, t, 'bandpass', 2000 + Math.random() * 3000, 3, 0.01, 0.06 + Math.random() * 0.08, 0.001, 0.1), 0.8, 0);
    return this.group([roar, crackle]);
  },
  amb_vanCreak() {
    return this.eventLoop(2, 5, (out, t) => {
      const f = 90 + Math.random() * 80;
      this.osc(out, t, 'sawtooth', f, f * (0.8 + Math.random() * 0.4), 0.5 + Math.random() * 0.6, 0.012, 0.1, Math.random() * 1.4 - 0.7);
    }, 1, 1);
  },
  amb_geese() {
    return this.eventLoop(4, 11, (out, t) => {
      const n = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) this.honk(out, t + i * 0.28, 0.05);
    }, 1, 2);
  },

  // --- voices of machines and animals ----------------------------------------------
  whistle(out, t, vol) {
    // a three-note steam chime with breath
    for (const r of [1, 1.26, 1.5]) this.osc(out, t, 'triangle', 520 * r, 505 * r, 1.4, vol, 0.12, 0.4);
    this.nz(out, t, 'bandpass', 1800, 2, 1.4, vol * 1.5, 0.1, 0.4);
  },
  honk(out, t, vol) {
    const c = this.ctx, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(420, t); o.frequency.linearRampToValueAtTime(360, t + 0.2);
    f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 3;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    o.connect(f).connect(g).connect(out); o.start(t); o.stop(t + 0.26);
  },

  // --- one-shot effects -------------------------------------------------------------
  sfx_whistle(t) { this.whistle(this.sfxBus, t, 0.09); this.whistle(this.sfxBus, t + 1.6, 0.07); },
  sfx_honk(t) { this.honk(this.sfxBus, t, 0.12); this.honk(this.sfxBus, t + 0.3, 0.1); },
  sfx_knock(t) { for (let i = 0; i < 3; i++) { this.nz(this.sfxBus, t + i * 0.22, 'lowpass', 400, 2, 0.08, 0.6, 0.001); this.osc(this.sfxBus, t + i * 0.22, 'sine', 180, 90, 0.08, 0.2); } },
  sfx_slidingDoor(t) { const n = this.nz(this.sfxBus, t, 'bandpass', 600, 1.2, 0.6, 0.25, 0.05); n.f.frequency.linearRampToValueAtTime(1400, t + 0.5); this.nz(this.sfxBus, t + 0.55, 'lowpass', 300, 2, 0.12, 0.4, 0.001); },
  sfx_stamp(t) { this.nz(this.sfxBus, t, 'lowpass', 500, 1, 0.08, 0.6, 0.001); this.osc(this.sfxBus, t, 'sine', 140, 60, 0.12, 0.3); },
  sfx_brakes(t) { this.osc(this.sfxBus, t, 'sawtooth', 2400, 2100, 1.6, 0.012, 0.3, 0.3); this.nz(this.sfxBus, t, 'bandpass', 3000, 6, 1.6, 0.05, 0.3, 0.3); },
  sfx_window(t) { this.nz(this.sfxBus, t, 'bandpass', 900, 2, 0.35, 0.2, 0.02, 0.5); this.nz(this.sfxBus, t + 0.35, 'lowpass', 400, 1, 0.1, 0.3, 0.001, 0.5); },
  sfx_tannoy(t) { [[659, 0], [523, 0.45], [392, 0.9]].forEach(([f, d]) => { this.osc(this.verb, t + d, 'sine', f, f, 1.2, 0.08, 0.01); this.osc(this.sfxBus, t + d, 'sine', f, f, 0.9, 0.05, 0.01); }); },
  sfx_gate(t) { this.nz(this.sfxBus, t, 'bandpass', 1500, 6, 0.4, 0.12, 0.02); this.osc(this.sfxBus, t, 'sawtooth', 300, 180, 0.4, 0.02, 0.02); this.nz(this.sfxBus, t + 0.4, 'lowpass', 600, 2, 0.1, 0.4, 0.001); },
  sfx_cloth(t) { this.nz(this.sfxBus, t, 'bandpass', 1200, 0.8, 0.5, 0.15, 0.1); },
  sfx_trolley(t) { for (let i = 0; i < 5; i++) this.osc(this.sfxBus, t + i * 0.05, 'sine', 3000 + i * 300, 3000 + i * 300, 0.15, 0.015, 0.001); this.nz(this.sfxBus, t, 'lowpass', 300, 1, 0.8, 0.12, 0.05); },
  sfx_pour(t) { for (let i = 0; i < 10; i++) { const f = 500 + i * 60 + Math.random() * 80; this.osc(this.sfxBus, t + i * 0.06, 'sine', f, f * 1.4, 0.05, 0.03, 0.002); } this.nz(this.sfxBus, t, 'bandpass', 1200, 1, 0.7, 0.06, 0.05); },
  sfx_fieldPhone(t) { for (let i = 0; i < 8; i++) this.nz(this.sfxBus, t + i * 0.07, 'bandpass', 700, 4, 0.05, 0.25, 0.002); this.osc(this.sfxBus, t + 0.7, 'triangle', 1100, 1100, 0.4, 0.03); },
  sfx_lockpick(t) { for (let i = 0; i < 7; i++) this.nz(this.sfxBus, t + i * 0.15 + Math.random() * 0.05, 'bandpass', 4000 + Math.random() * 2000, 10, 0.015, 0.2, 0.001); },
  sfx_lock(t) { this.nz(this.sfxBus, t, 'bandpass', 2500, 8, 0.04, 0.4, 0.001); this.nz(this.sfxBus, t + 0.1, 'lowpass', 500, 2, 0.1, 0.4, 0.001); },
  sfx_yawn(t) { this.osc(this.sfxBus, t, 'sawtooth', 220, 140, 1.2, 0.02, 0.3); this.nz(this.sfxBus, t, 'bandpass', 700, 3, 1.2, 0.05, 0.3); },
  sfx_crowbar(t) { this.osc(this.sfxBus, t, 'sawtooth', 160, 120, 0.5, 0.03, 0.05); this.nz(this.sfxBus, t + 0.45, 'highpass', 1200, 0.8, 0.12, 0.6, 0.001); this.nz(this.sfxBus, t + 0.45, 'lowpass', 300, 1, 0.2, 0.4, 0.001); },
  sfx_clank(t) { this.nz(this.sfxBus, t, 'bandpass', 900, 3, 0.4, 0.5, 0.001); this.bell(this.sfxBus, t, 180, 0.08, 1); this.osc(this.sfxBus, t, 'sine', 80, 40, 0.5, 0.4); },
  sfx_gantry(t) { this.nz(this.sfxBus, t, 'lowpass', 300, 1, 0.5, 0.6, 0.02); this.nz(this.sfxBus, t, 'highpass', 2000, 0.6, 0.3, 0.3, 0.005); },
  sfx_horn(t) { for (const r of [1, 1.19]) this.osc(this.sfxBus, t, 'sawtooth', 220 * r, 218 * r, 0.9, 0.03, 0.05, 0.5); },

  // --- footsteps --------------------------------------------------------------------
  sfx_stepSnow(t) { for (let i = 0; i < 3; i++) this.burst(t + i * 0.018, 'bandpass', 1400 + Math.random() * 1600, 1.5, 0.05, 0.12); this.burst(t, 'lowpass', 300, 1, 0.1, 0.12); },
  sfx_stepStone(t) { this.burst(t, 'bandpass', 2000 + Math.random() * 400, 3, 0.05, 0.2); this.nz(this.verb, t, 'bandpass', 2000, 3, 0.05, 0.12, 0.001); },
});
