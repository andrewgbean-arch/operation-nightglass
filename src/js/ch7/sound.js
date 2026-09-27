// ---------------------------------------------------------------------------
// Chapter Seven sound: East Berlin. Wind in the courtyards, the trams, a
// Trabant's two-stroke rattle, a punk band through a cellar wall, the hum of
// strip lights in the archive, and the dogs on the death strip.
// ---------------------------------------------------------------------------
Object.assign(Sound.moods, {
  title:   { bpm: 58, chords: [[45, 52, 57, 60], [43, 50, 55, 58], [41, 48, 53, 57], [40, 47, 52, 56]], scale: [64, 65, 67, 69, 72, 74], lead: 0.35 },
  grey:    { bpm: 64, chords: [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 55]], scale: [64, 67, 69, 72, 74, 76], lead: 0.35 },
  punk:    { bpm: 176, chords: [[40, 47, 52, 55], [40, 47, 52, 55], [45, 52, 57, 60], [43, 50, 55, 59]], scale: [64, 67, 69, 71, 74, 76], lead: 0.8, drive: true },
  archive: { bpm: 70, chords: [[45, 48, 52, 55], [44, 48, 51, 55], [45, 48, 52, 55], [41, 45, 48, 52]], scale: [69, 70, 72, 75, 76], lead: 0.2 },
  tunnel:  { bpm: 84, chords: [[40, 43, 47, 50], [40, 43, 46, 50], [39, 43, 46, 50], [40, 43, 47, 50]], scale: [64, 65, 67, 70, 71], lead: 0.2 },
  dawn:    { bpm: 60, chords: [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]], scale: [67, 69, 72, 74, 76, 79], lead: 0.4 },
});

Object.assign(Sound, {
  // A Trabant from the inside: a two-stroke buzz, and everything rattling.
  amb_trabant() {
    const c = this.ctx, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = 'square'; o.frequency.value = 58; f.type = 'lowpass'; f.frequency.value = 420; g.gain.value = 0.05;
    o.connect(f).connect(g).connect(this.ambBus); o.start();
    const rattle = this.eventLoop(0.1, 0.4, (out, t) => this.nz(out, t, 'bandpass', 1800 + Math.random() * 1200, 6, 0.04, 0.05, 0.002, Math.random() - 0.5), 1, 0);
    const stop = rattle.stop; rattle.stop = () => { stop(); o.stop(); };
    return rattle;
  },
  // Strip lights humming in an empty building.
  amb_hum() {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.value = 100; g.gain.value = 0.012;
    o.connect(g).connect(this.ambBus); o.start();
    const tick = this.eventLoop(4, 12, (out, t) => this.nz(out, t, 'highpass', 3000, 2, 0.05, 0.1, 0.001, 0.4), 1, 3);
    const stop = tick.stop; tick.stop = () => { stop(); o.stop(); };
    return tick;
  },
  // An alarm bell ringing somewhere in a stairwell.
  amb_alarmBell() {
    return this.eventLoop(0.9, 1.1, (out, t) => { for (let i = 0; i < 10; i++) this.osc(this.verb, t + i * 0.06, 'square', 1400, 1400, 0.04, 0.03, 0.001); }, 1, 0);
  },
  // Dogs barking far off across the strip.
  amb_dogs() {
    return this.eventLoop(3, 9, (out, t) => {
      const pan = Math.random() * 1.4 - 0.7;
      for (let i = 0; i < 1 + Math.floor(Math.random() * 3); i++) { this.osc(this.verb, t + i * 0.28, 'sawtooth', 420, 260, 0.14, 0.03, 0.005, pan); this.nz(this.verb, t + i * 0.28, 'bandpass', 900, 3, 0.1, 0.04, 0.003, pan); }
    }, 1, 2);
  },
  // Sand trickling down in a tunnel.
  amb_trickle() {
    return this.eventLoop(0.5, 2, (out, t) => this.nz(out, t, 'bandpass', 3000 + Math.random() * 2000, 3, 0.4 + Math.random() * 0.6, 0.03, 0.1, Math.random() - 0.5), 1, 0);
  },

  sfx_carStart(t) {
    for (let i = 0; i < 3; i++) this.nz(this.sfxBus, t + i * 0.22, 'lowpass', 500, 2, 0.16, 0.3, 0.01);
    for (let i = 0; i < 16; i++) this.osc(this.sfxBus, t + 0.7 + i * 0.07, 'square', 70 + i * 4, 60 + i * 4, 0.06, 0.08, 0.002);
  },
  sfx_drawer(t) { this.nz(this.sfxBus, t, 'bandpass', 900, 2, 0.25, 0.25, 0.01); this.nz(this.sfxBus, t + 0.24, 'lowpass', 700, 2, 0.06, 0.4, 0.001); },
  sfx_bark(t) { for (let i = 0; i < 2; i++) { this.osc(this.sfxBus, t + i * 0.22, 'sawtooth', 460, 240, 0.13, 0.25, 0.004); this.nz(this.sfxBus, t + i * 0.22, 'bandpass', 1000, 3, 0.1, 0.25, 0.003); } },
  sfx_sniff(t) { for (let i = 0; i < 3; i++) this.nz(this.sfxBus, t + i * 0.12, 'bandpass', 2400, 4, 0.07, 0.12, 0.01); },
  sfx_scrape(t) { this.nz(this.sfxBus, t, 'bandpass', 1200 + Math.random() * 600, 2, 0.18, 0.06, 0.02); },
});
