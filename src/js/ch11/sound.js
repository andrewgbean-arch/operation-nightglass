// ---------------------------------------------------------------------------
// Chapter Eleven sound: Svalbard. Wind off the ice and the dogs singing, the
// clatter of an atomic knitting machine, a stove and a clock in Aunt Olga's
// parlour, and a snowmobile flat out across the fjord.
// ---------------------------------------------------------------------------
Object.assign(Sound.moods, {
  title:   { bpm: 60, chords: [[45, 52, 57, 60], [43, 50, 55, 59], [41, 48, 53, 57], [40, 47, 52, 55]], scale: [69, 71, 72, 76, 79, 81], lead: 0.35 },
  arctic:  { bpm: 64, chords: [[45, 52, 57, 64], [48, 55, 60, 64], [43, 50, 55, 62], [45, 52, 57, 64]], scale: [69, 71, 72, 74, 76, 79], lead: 0.3 },
  knit:    { bpm: 118, chords: [[45, 48, 52, 57], [44, 48, 52, 56], [45, 48, 52, 57], [40, 44, 47, 52]], scale: [69, 71, 72, 74, 76, 77, 80], lead: 0.6 },
  parlour: { bpm: 84, chords: [[45, 48, 52, 57], [50, 53, 57, 62], [40, 44, 47, 52], [45, 48, 52, 57]], scale: [69, 71, 72, 74, 76, 77, 80, 81], lead: 0.5, waltz: true },
  race:    { bpm: 160, chords: [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 56]], scale: [69, 72, 74, 76, 79, 81], lead: 0.7, drive: true },
});

Object.assign(Sound, {
  // Sled dogs across the yard, now and then all singing at once.
  amb_huskies() {
    return this.eventLoop(3, 9, (out, t) => {
      const n = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) { const f = 500 + Math.random() * 250, d = 1 + Math.random() * 1.5, pan = Math.random() * 1.2 - 0.2; this.osc(out, t + i * 0.3, 'sine', f, f * 1.25, d * 0.4, 0.03, 0.2, pan); this.osc(out, t + i * 0.3 + d * 0.4, 'sine', f * 1.25, f * 0.8, d * 0.6, 0.03, 0.05, pan); }
    }, 0.8, 1);
  },
  // The Knitomatic: needles clacking in rows, and a hum from the reactor.
  amb_knitting() {
    const hum = this.noiseLoop('lowpass', 180, 0.8, 0.12);
    const clack = this.eventLoop(0.12, 0.2, (out, t) => { this.nz(out, t, 'bandpass', 2400 + Math.random() * 800, 8, 0.03, 0.1, 0.001, Math.random() * 0.6 - 0.3); }, 0.7, 0);
    return this.group([hum, clack]);
  },
  sfx_growl(t) { this.nz(this.sfxBus, t, 'lowpass', 260, 2, 1.1, 0.5, 0.1); this.osc(this.sfxBus, t, 'sawtooth', 70, 55, 1.1, 0.08, 0.1); },
  sfx_snore(t) { for (const d of [0, 1.4]) { this.nz(this.sfxBus, t + d, 'lowpass', 300, 3, 0.9, 0.2, 0.3); this.osc(this.sfxBus, t + d, 'sawtooth', 90, 70, 0.9, 0.03, 0.3); } },
  sfx_radio(t) { this.nz(this.sfxBus, t, 'bandpass', 1800, 1.2, 0.6, 0.25, 0.01); this.osc(this.sfxBus, t + 0.1, 'sine', 1000, 1000, 0.15, 0.06, 0.005); },
});
