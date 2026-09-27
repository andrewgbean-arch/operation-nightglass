// ---------------------------------------------------------------------------
// Chapter Three sound: a waltz in the dining car and a stately tune in first
// class, then the runaway van. Adds cutlery, a champagne cork, a shrieking
// aunt, a car at dawn and the jet. Everything else is borrowed from chapter two.
// ---------------------------------------------------------------------------
Object.assign(Sound.moods, {
  title:      { bpm: 60, chords: [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 56]], scale: [64, 65, 68, 69, 71, 72, 76], lead: 0.45 },
  dining:     { bpm: 108, chords: [[43, 50, 55, 59], [43, 50, 55, 59], [38, 45, 50, 54], [38, 45, 50, 54], [40, 47, 52, 55], [36, 43, 48, 52], [38, 45, 50, 54], [43, 50, 55, 59]], scale: [67, 69, 71, 72, 74, 76, 78, 79], lead: 0.8, waltz: true },
  firstclass: { bpm: 66, chords: [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]], scale: [67, 69, 71, 72, 74, 76, 79], lead: 0.5 },
  brake:      { bpm: 138, chords: [[45, 52, 57, 60], [45, 52, 57, 60], [41, 48, 53, 57], [44, 51, 56, 59]], scale: [69, 71, 72, 74, 76, 77, 80, 81], lead: 0.55, drive: true },
});

Object.assign(Sound, {
  // Knives, forks and a murmur of diners over the rails.
  amb_cutlery() {
    const clink = this.eventLoop(0.6, 2.2, (out, t) => {
      const pan = Math.random() * 1.6 - 0.8, f = 3400 + Math.random() * 2400;
      this.osc(out, t, 'sine', f, f, 0.12, 0.02, 0.001, pan);
      if (Math.random() < 0.4) this.nz(out, t + 0.1, 'bandpass', 5000, 8, 0.03, 0.06, 0.001, pan);
    }, 1, 0.3);
    const murmur = this.eventLoop(0.2, 0.5, (out, t) => {
      this.nz(out, t, 'bandpass', 300 + Math.random() * 350, 5, 0.18, 0.025, 0.04, Math.random() * 1.4 - 0.7);
    }, 0.7, 0);
    return this.group([clink, murmur]);
  },
  // Steel wheels screaming against a locked brake.
  amb_brakeSqueal() {
    return this.eventLoop(0.8, 2, (out, t) => {
      const f = 2200 + Math.random() * 1400;
      this.osc(out, t, 'sawtooth', f, f * (0.94 + Math.random() * 0.1), 0.6 + Math.random() * 0.8, 0.006, 0.08, Math.random() * 1.2 - 0.6);
    }, 1, 0.2);
  },

  sfx_bell(t) { for (let i = 0; i < 2; i++) this.bell(this.sfxBus, t + i * 0.35, 1400, 0.07, 0.8, 0.5); },
  sfx_pop(t) { this.nz(this.sfxBus, t, 'bandpass', 900, 2, 0.06, 0.6, 0.001); this.osc(this.sfxBus, t, 'sine', 600, 200, 0.08, 0.25, 0.001); this.nz(this.sfxBus, t + 0.05, 'highpass', 4000, 0.5, 1.2, 0.06, 0.05); },
  sfx_shriek(t) { this.osc(this.sfxBus, t, 'sawtooth', 900, 1500, 0.3, 0.05, 0.03); this.osc(this.sfxBus, t + 0.3, 'sawtooth', 1500, 1100, 0.9, 0.05, 0.02); this.nz(this.sfxBus, t, 'bandpass', 2000, 4, 1.2, 0.05, 0.05); },
  sfx_squeal(t) { this.osc(this.sfxBus, t, 'sawtooth', 3200, 2600, 1.4, 0.02, 0.05, 0.3); this.nz(this.sfxBus, t, 'bandpass', 3400, 8, 1.4, 0.1, 0.05, 0.3); },
  sfx_car(t) {
    // a Tatra coming up the valley road: engine note rising, gravel, a stop
    const n = this.osc(this.sfxBus, t, 'sawtooth', 55, 90, 2.6, 0.04, 1.2, 0.7);
    this.nz(this.sfxBus, t, 'lowpass', 400, 1, 2.6, 0.12, 1.2, 0.7);
    this.nz(this.sfxBus, t + 2.4, 'bandpass', 1200, 1, 0.5, 0.08, 0.05, 0.6);
    return n;
  },
  sfx_carDoor(t) { this.nz(this.sfxBus, t, 'lowpass', 250, 2, 0.15, 0.5, 0.001, 0.5); this.nz(this.sfxBus, t, 'bandpass', 2400, 6, 0.05, 0.15, 0.001, 0.5); },
  sfx_jet(t) {
    // a roar out of nothing, left to right, with a crack as it passes
    const a = this.nz(this.sfxBus, t, 'lowpass', 300, 0.8, 4, 0.5, 1.4, -0.8);
    a.f.frequency.linearRampToValueAtTime(1800, t + 1.8); a.f.frequency.linearRampToValueAtTime(200, t + 4);
    this.nz(this.sfxBus, t, 'highpass', 3000, 0.5, 3.6, 0.12, 1.2, 0.2);
    this.nz(this.sfxBus, t + 1.6, 'lowpass', 120, 1, 0.8, 0.6, 0.01, 0);
  },
});
