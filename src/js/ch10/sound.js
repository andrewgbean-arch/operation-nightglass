// ---------------------------------------------------------------------------
// Chapter Ten sound: London in the rain. A music-hall shuffle in the chip shop
// with the fryers spitting, grey Whitehall strings at Headquarters, a driving
// chase on the Underground, and a genteel waltz for tea at the Wellington.
// ---------------------------------------------------------------------------
Object.assign(Sound.moods, {
  title:     { bpm: 66, chords: [[45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 53, 58], [40, 47, 52, 56]], scale: [64, 67, 69, 71, 72, 74, 76], lead: 0.45 },
  chippy:    { bpm: 112, chords: [[48, 55, 60, 64], [45, 52, 57, 60], [50, 57, 60, 65], [43, 50, 55, 59]], scale: [67, 69, 72, 74, 76, 79], lead: 0.75, swing: true },
  whitehall: { bpm: 70, chords: [[45, 48, 52, 57], [41, 45, 48, 53], [43, 47, 50, 55], [40, 44, 47, 52]], scale: [69, 71, 72, 74, 76], lead: 0.3 },
  tube:      { bpm: 152, chords: [[45, 52, 57, 60], [43, 50, 55, 59], [41, 48, 53, 57], [40, 47, 52, 56]], scale: [69, 72, 74, 76, 79, 81], lead: 0.6, drive: true },
  tea:       { bpm: 88, chords: [[48, 55, 60, 64], [53, 57, 60, 65], [43, 50, 55, 59], [48, 55, 60, 64]], scale: [67, 69, 71, 72, 74, 76, 79], lead: 0.55, waltz: true },
});

Object.assign(Sound, {
  // The fryers: a hiss of hot fat, and the odd spit and crackle.
  amb_fryer() {
    const hiss = this.noiseLoop('highpass', 5200, 0.4, 0.08);
    const spits = this.eventLoop(0.05, 0.4, (out, t) => {
      this.nz(out, t, 'bandpass', 3000 + Math.random() * 4000, 4, 0.02 + Math.random() * 0.03, 0.04 + Math.random() * 0.08, 0.001, 0.3 + Math.random() * 0.4);
    }, 0.8, 0);
    return this.group([hiss, spits]);
  },
  // Deep under London: the rumble of the tunnels and, now and then, a train.
  amb_tube() {
    const rumble = this.noiseLoop('lowpass', 140, 0.8, 0.3);
    const trains = this.eventLoop(7, 14, (out, t) => {
      this.nz(out, t, 'lowpass', 400, 1, 4, 0.25, 1.2);
      this.osc(out, t + 1, 'sawtooth', 70, 110, 3, 0.03, 0.8);
      this.osc(out, t + 2.5, 'sine', 2200, 1800, 1.2, 0.01, 0.3, 0.5);
    }, 0.8, 2);
    return this.group([rumble, trains]);
  },
  // Two snooker balls meeting, somewhere in Sheffield.
  sfx_snooker(t) {
    for (const d of [0, 0.42]) { this.osc(this.sfxBus, t + d, 'sine', 2600, 2400, 0.05, 0.2, 0.001); this.nz(this.sfxBus, t + d, 'bandpass', 4000, 6, 0.02, 0.15, 0.001); }
  },
  // A kipper, going somewhere it shouldn't.
  sfx_squelch(t) {
    this.nz(this.sfxBus, t, 'lowpass', 700, 2, 0.25, 0.3, 0.01);
    this.osc(this.sfxBus, t, 'sine', 220, 90, 0.2, 0.15, 0.01);
    this.nz(this.sfxBus, t + 0.18, 'bandpass', 1200, 3, 0.12, 0.12, 0.01);
  },
  // Tube doors: the warning beeps, then the hiss and thump.
  sfx_tubeDoors(t) {
    for (const d of [0, 0.3, 0.6]) this.osc(this.sfxBus, t + d, 'square', 1480, 1480, 0.16, 0.05, 0.005);
    this.nz(this.sfxBus, t + 0.9, 'highpass', 2000, 0.6, 0.5, 0.2, 0.02);
    this.nz(this.sfxBus, t + 1.35, 'lowpass', 300, 1, 0.12, 0.4, 0.002);
  },
});
