// ---------------------------------------------------------------------------
// Chapter Six sound: Venice. Water against stone, bells across the lagoon in
// the fog, the roar of a glass furnace, a waltz, an outboard motor. The music
// is a barcarolle: a gondolier's song, rocking in three.
// ---------------------------------------------------------------------------
Object.assign(Sound.moods, {
  title:   { bpm: 56, chords: [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 56]], scale: [64, 65, 67, 69, 71, 72, 74, 76], lead: 0.5, waltz: true },
  dusk:    { bpm: 60, chords: [[45, 52, 57, 60], [50, 57, 62, 65], [43, 50, 55, 59], [45, 52, 57, 60]], scale: [64, 67, 69, 71, 72, 76], lead: 0.4, waltz: true },
  furnace: { bpm: 70, chords: [[40, 47, 52, 55], [41, 48, 53, 57], [40, 47, 52, 55], [38, 45, 50, 53]], scale: [64, 65, 67, 69, 71, 72], lead: 0.45 },
  ball:    { bpm: 90, chords: [[48, 55, 60, 64], [45, 52, 57, 60], [50, 57, 62, 65], [43, 50, 55, 59]], scale: [67, 69, 71, 72, 74, 76, 77, 79], lead: 0.7, waltz: true },
  chase:   { bpm: 148, chords: [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 56]], scale: [64, 65, 67, 69, 71, 72, 74, 76], lead: 0.65, drive: true },
  dawn:    { bpm: 58, chords: [[48, 55, 60, 64], [53, 60, 65, 69], [45, 52, 57, 60], [43, 50, 55, 59]], scale: [67, 69, 72, 74, 76, 79], lead: 0.35 },
});

Object.assign(Sound, {
  // Church bells across the lagoon, muffled by fog.
  amb_bells() {
    return this.eventLoop(9, 20, (out, t) => {
      const f = [392, 330, 294, 262][Math.floor(Math.random() * 4)], pan = Math.random() * 1.2 - 0.6;
      for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) this.bell(this.verb, t + i * 1.4, f, 0.02, 3, pan);
    }, 1, 4);
  },
  // The furnace: a deep roar with a flutter in it.
  amb_furnace() {
    const roar = this.noiseLoop('lowpass', 260, 0.8, 0.22);
    const flutter = this.eventLoop(0.2, 0.6, (out, t) => this.nz(out, t, 'bandpass', 180 + Math.random() * 200, 2, 0.3, 0.05, 0.1, Math.random() - 0.5), 1, 0);
    return this.group([roar, flutter]);
  },
  // An outboard motor, somewhere behind.
  amb_launch() {
    const c = this.ctx, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.value = 62; f.type = 'lowpass'; f.frequency.value = 520; g.gain.value = 0.05;
    o.connect(f).connect(g).connect(this.ambBus); o.start();
    const wash = this.noiseLoop('bandpass', 900, 0.8, 0.08);
    const stop = wash.stop; wash.stop = () => { stop(); o.stop(); };
    return wash;
  },

  sfx_splash(t) { this.nz(this.sfxBus, t, 'lowpass', 1400, 1, 0.5, 0.35, 0.02); this.nz(this.sfxBus, t + 0.05, 'bandpass', 3000, 2, 0.3, 0.12, 0.02); },
  sfx_row(t) { this.nz(this.sfxBus, t, 'bandpass', 700, 1.5, 0.35, 0.22, 0.05); this.osc(this.sfxBus, t, 'sine', 140, 90, 0.2, 0.08, 0.01); },
  sfx_ting(t) { for (const f of [2637, 3520]) this.osc(this.verb, t, 'sine', f, f, 1.4, 0.05, 0.002); },
});
