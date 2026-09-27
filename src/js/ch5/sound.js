// ---------------------------------------------------------------------------
// Chapter Five sound: Istanbul. Gulls and water, the roar of the bazaar,
// dripping marble in the hammam, a party on the Bosphorus, a gavel. The music
// leans on the Hicaz mode: that raised second is the sound of the city.
// ---------------------------------------------------------------------------
Object.assign(Sound.moods, {
  // Hicaz on D: D Eb F# G A Bb C
  title:  { bpm: 60, chords: [[50, 57, 62, 66], [51, 58, 63, 67], [50, 57, 62, 66], [48, 55, 60, 63]], scale: [62, 63, 66, 67, 69, 70, 72, 74], lead: 0.55 },
  dawn:   { bpm: 58, chords: [[50, 57, 62, 66], [55, 62, 67, 70], [51, 58, 63, 67], [50, 57, 62, 66]], scale: [62, 63, 66, 67, 69, 70, 74], lead: 0.35 },
  bazaar: { bpm: 104, chords: [[50, 57, 62, 66], [50, 57, 62, 66], [51, 58, 63, 67], [48, 55, 60, 63]], scale: [62, 63, 66, 67, 69, 70, 72, 74, 75], lead: 0.8, swing: true },
  hammam: { bpm: 52, chords: [[45, 52, 57, 61], [46, 53, 58, 62], [45, 52, 57, 61], [43, 50, 55, 58]], scale: [69, 70, 73, 74, 76, 77, 79], lead: 0.3 },
  dusk:   { bpm: 62, chords: [[48, 55, 60, 64], [45, 52, 57, 60], [50, 57, 62, 65], [43, 50, 55, 59]], scale: [67, 69, 71, 72, 74, 76, 79], lead: 0.45 },
  salon:  { bpm: 88, chords: [[50, 57, 62, 65], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 61]], scale: [62, 64, 65, 67, 69, 70, 73, 74], lead: 0.6, waltz: true },
  chase:  { bpm: 152, chords: [[50, 57, 62, 66], [51, 58, 63, 67], [50, 57, 62, 66], [48, 55, 60, 63]], scale: [62, 63, 66, 67, 69, 70, 72, 74], lead: 0.65, drive: true },
});

Object.assign(Sound, {
  // Seagulls over the Bosphorus.
  amb_gulls() {
    return this.eventLoop(2.5, 7, (out, t) => {
      const pan = Math.random() * 1.6 - 0.8, n = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) { const f = 1500 + Math.random() * 500; this.osc(out, t + i * 0.22, 'sawtooth', f, f * 0.7, 0.18, 0.012, 0.02, pan); this.nz(out, t + i * 0.22, 'bandpass', f, 6, 0.15, 0.02, 0.02, pan); }
    }, 1, 1);
  },
  // Water slapping against a quay, and a far ship's horn now and then.
  amb_water() {
    const bed = this.noiseLoop('lowpass', 380, 0.6, 0.15);
    const lap = this.eventLoop(0.8, 2.2, (out, t) => this.nz(out, t, 'bandpass', 500 + Math.random() * 400, 1.2, 0.5, 0.05, 0.15, Math.random() - 0.5), 1, 0.2);
    const horn = this.eventLoop(30, 60, (out, t) => { for (const r of [1, 1.26]) this.osc(this.verb, t, 'sawtooth', 110 * r, 108 * r, 2.4, 0.012, 0.3, 0.4); }, 1, 12);
    return this.group([bed, lap, horn]);
  },
  // The Grand Bazaar: a crowd, footsteps, a copper-beater, a seller calling out.
  amb_bazaarCrowd() {
    const murmur = this.eventLoop(0.08, 0.25, (out, t) => this.nz(this.verb, t, 'bandpass', 250 + Math.random() * 500, 5, 0.18, 0.03, 0.03, Math.random() * 1.6 - 0.8), 0.8, 0);
    const copper = this.eventLoop(3, 8, (out, t) => { for (let i = 0; i < 5; i++) this.bell(this.verb, t + i * 0.2, 700 + Math.random() * 300, 0.012, 0.4, 0.6); }, 1, 2);
    const call = this.eventLoop(5, 12, (out, t) => { const f = 220 + Math.random() * 60, pan = Math.random() - 0.5; this.osc(this.verb, t, 'sawtooth', f, f * 1.2, 0.5, 0.012, 0.05, pan); this.osc(this.verb, t + 0.5, 'sawtooth', f * 1.2, f * 0.9, 0.7, 0.012, 0.05, pan); }, 1, 3);
    return this.group([murmur, copper, call]);
  },
  // The hot room: a steady hiss of steam.
  amb_bathSteam() { return this.noiseLoop('highpass', 2400, 0.4, 0.07); },
  // Water dripping into marble basins, echoing under the dome.
  amb_drips() {
    return this.eventLoop(0.3, 1.4, (out, t) => {
      const f = 900 + Math.random() * 1200;
      this.osc(this.verb, t, 'sine', f, f * 0.5, 0.08, 0.04, 0.001, Math.random() * 1.6 - 0.8);
    }, 1, 0);
  },
  // A party in the next room: voices and glasses.
  amb_partyMurmur() {
    const murmur = this.eventLoop(0.12, 0.3, (out, t) => this.nz(out, t, 'bandpass', 280 + Math.random() * 380, 5, 0.2, 0.025, 0.04, Math.random() * 1.4 - 0.7), 0.8, 0);
    const glass = this.eventLoop(1.5, 5, (out, t) => { const f = 2800 + Math.random() * 1500; this.osc(out, t, 'sine', f, f, 0.4, 0.015, 0.001, Math.random() - 0.5); }, 1, 1);
    return this.group([murmur, glass]);
  },
  // A ferry's diesel, thumping.
  amb_ferry() {
    const c = this.ctx, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.value = 44; f.type = 'lowpass'; f.frequency.value = 220; g.gain.value = 0.06;
    o.connect(f).connect(g).connect(this.ambBus); o.start();
    const wash = this.noiseLoop('lowpass', 600, 0.6, 0.12);
    const stop = wash.stop; wash.stop = () => { stop(); o.stop(); };
    return wash;
  },

  sfx_gavel(t) { for (const d of [0, 0.35]) { this.nz(this.sfxBus, t + d, 'lowpass', 900, 2, 0.08, 0.5, 0.001); this.osc(this.sfxBus, t + d, 'sine', 320, 180, 0.12, 0.2, 0.001); } },
  sfx_applause(t) {
    for (let i = 0; i < 60; i++) this.nz(this.sfxBus, t + Math.random() * 2.4, 'bandpass', 1500 + Math.random() * 1500, 2, 0.03, 0.08 * (1 - i / 80), 0.001, Math.random() * 1.4 - 0.7);
  },
  sfx_crack(t) { for (let i = 0; i < 4; i++) this.nz(this.sfxBus, t + i * 0.07, 'bandpass', 2400 + i * 300, 5, 0.03, 0.3, 0.001); },
});
