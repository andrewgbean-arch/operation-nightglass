// ---------------------------------------------------------------------------
// Chapter Eight sound: Monte Carlo. Swing on the yacht, a lounge waltz in the
// Casino, racing engines screaming somewhere up the hill, and a Mercedes
// going the wrong way round the circuit.
// ---------------------------------------------------------------------------
Object.assign(Sound.moods, {
  title:   { bpm: 92, chords: [[50, 57, 60, 65], [55, 59, 62, 65], [48, 55, 60, 64], [45, 52, 57, 60]], scale: [62, 64, 65, 67, 69, 72, 74], lead: 0.6, swing: true },
  riviera: { bpm: 104, chords: [[48, 55, 60, 64], [45, 52, 57, 60], [50, 57, 60, 65], [43, 50, 55, 59]], scale: [67, 69, 72, 74, 76, 79], lead: 0.7, swing: true },
  casino:  { bpm: 84, chords: [[50, 57, 60, 65], [43, 50, 55, 59], [48, 55, 60, 64], [45, 52, 57, 61]], scale: [62, 64, 65, 67, 69, 71, 72, 74], lead: 0.55, waltz: true },
  chase:   { bpm: 160, chords: [[45, 52, 57, 60], [48, 55, 60, 64], [43, 50, 55, 59], [40, 47, 52, 56]], scale: [64, 67, 69, 71, 72, 76], lead: 0.7, drive: true },
  dawn:    { bpm: 60, chords: [[48, 55, 60, 64], [53, 60, 65, 69], [45, 52, 57, 60], [43, 50, 55, 59]], scale: [67, 69, 72, 74, 76, 79], lead: 0.4 },
});

Object.assign(Sound, {
  // A racing car somewhere up the hill: a scream that rises and falls away.
  amb_f1() {
    return this.eventLoop(6, 14, (out, t) => {
      const pan = Math.random() * 1.6 - 0.8;
      for (const g of [0, 0.4, 0.8]) this.osc(this.verb, t + g, 'sawtooth', 700 + g * 300, 1100 + g * 200, 0.5, 0.012, 0.1, pan);
      this.osc(this.verb, t + 1.3, 'sawtooth', 1200, 500, 1.2, 0.01, 0.05, -pan);
    }, 1, 3);
  },
  // Our own engine, from inside the Mercedes.
  amb_engine() {
    const c = this.ctx, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.value = 72; f.type = 'lowpass'; f.frequency.value = 380; g.gain.value = 0.07;
    o.connect(f).connect(g).connect(this.ambBus); o.start();
    const wind = this.noiseLoop('bandpass', 700, 0.5, 0.06);
    const stop = wind.stop; wind.stop = () => { stop(); o.stop(); };
    return wind;
  },

  sfx_crash(t) {
    this.nz(this.sfxBus, t, 'lowpass', 900, 1, 0.4, 0.5, 0.002);
    for (let i = 0; i < 6; i++) this.nz(this.sfxBus, t + 0.05 + i * 0.05, 'bandpass', 2500 + Math.random() * 2000, 6, 0.08, 0.2, 0.001, Math.random() - 0.5);
    this.osc(this.sfxBus, t, 'sine', 90, 40, 0.3, 0.4, 0.002);
  },
  sfx_scrape(t) { this.nz(this.sfxBus, t, 'bandpass', 1800 + Math.random() * 800, 3, 0.2, 0.08, 0.02); },
});
