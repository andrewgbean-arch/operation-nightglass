// ---------------------------------------------------------------------------
// Chapter Four sound: a village polka in the inn, a cold hum inside the
// mountain, the alarm, a camera shutter and a jet on the runway. Rail, snow
// and goose noises are borrowed from chapters two and three.
// ---------------------------------------------------------------------------
Object.assign(Sound.moods, {
  title:   { bpm: 58, chords: [[45, 52, 57, 60], [41, 48, 53, 57], [38, 45, 50, 53], [40, 47, 52, 56]], scale: [64, 65, 67, 69, 71, 72, 76], lead: 0.45 },
  inn:     { bpm: 116, chords: [[48, 55, 60, 64], [43, 50, 55, 59], [48, 55, 60, 64], [43, 50, 55, 59], [41, 48, 53, 57], [48, 55, 60, 64], [43, 50, 55, 59], [48, 55, 60, 64]], scale: [72, 74, 76, 77, 79, 81, 84], lead: 0.85, waltz: true },
  village: { bpm: 66, chords: [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]], scale: [67, 69, 71, 72, 74, 76, 79], lead: 0.4 },
  hangar:  { bpm: 60, chords: [[40, 47, 50, 55], [40, 46, 50, 55], [41, 48, 51, 56], [40, 47, 50, 55]], scale: [64, 65, 67, 70, 71], lead: 0.2 },
  reveal:  { bpm: 54, chords: [[38, 45, 50, 53], [34, 41, 46, 50], [36, 43, 48, 51], [37, 44, 49, 52]], scale: [62, 65, 67, 68, 70, 74], lead: 0.35 },
  tunnel:  { bpm: 146, chords: [[40, 47, 52, 55], [40, 47, 52, 55], [36, 43, 48, 52], [38, 45, 50, 54]], scale: [64, 66, 67, 69, 71, 72, 74, 76], lead: 0.6, drive: true },
});

Object.assign(Sound, {
  // A full inn: talk, laughter, glasses on wood.
  amb_innChatter() {
    const murmur = this.eventLoop(0.15, 0.4, (out, t) => this.nz(out, t, 'bandpass', 260 + Math.random() * 380, 5, 0.2, 0.03, 0.04, Math.random() * 1.4 - 0.7), 0.8, 0);
    const laugh = this.eventLoop(6, 14, (out, t) => {
      const pan = Math.random() * 1.2 - 0.6;
      for (let i = 0; i < 5; i++) this.nz(out, t + i * 0.13, 'bandpass', 700 + Math.random() * 200, 6, 0.08, 0.05, 0.01, pan);
    }, 0.8, 3);
    const clonk = this.eventLoop(2, 6, (out, t) => { this.nz(out, t, 'lowpass', 500, 2, 0.06, 0.2, 0.001, Math.random() - 0.5); this.osc(out, t, 'sine', 1800, 1800, 0.12, 0.02, 0.001); }, 0.8, 1);
    return this.group([murmur, laugh, clonk]);
  },
  // Inside the mountain: a deep ventilation hum, drips, the odd distant clang.
  amb_hangarHum() {
    const hum = this.noiseLoop('lowpass', 90, 1.2, 0.5);
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = 50; g.gain.value = 0.03; o.connect(g).connect(this.ambBus); o.start();
    const clang = this.eventLoop(5, 12, (out, t) => { this.bell(this.verb, t, 120 + Math.random() * 80, 0.02, 2, Math.random() * 1.6 - 0.8); }, 1, 2);
    const drip = this.eventLoop(1.5, 4, (out, t) => this.osc(this.verb, t, 'sine', 1400 + Math.random() * 600, 700, 0.05, 0.02, 0.001, Math.random() - 0.5), 1, 1);
    const hiss = this.eventLoop(8, 16, (out, t) => this.nz(out, t, 'highpass', 3000, 0.7, 1.2, 0.05, 0.2, 0.6), 1, 4);
    const stop = hum.stop; hum.stop = () => { stop(); o.stop(); };
    return this.group([hum, clang, drip, hiss]);
  },
  // A two-tone alarm klaxon, echoing through rock.
  amb_klaxon() {
    return this.eventLoop(1.6, 1.6, (out, t) => {
      for (const [f, d] of [[440, 0], [370, 0.4]]) { this.osc(out, t + d, 'square', f, f, 0.38, 0.015, 0.02); this.osc(this.verb, t + d, 'square', f, f, 0.38, 0.01, 0.02); }
    }, 0.8, 0.1);
  },
  // Jet engines idling on the runway: a whine over a roar.
  amb_jetIdle() {
    const roar = this.noiseLoop('lowpass', 220, 0.7, 0.35);
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.value = 1900; g.gain.value = 0.008; o.connect(g).connect(this.ambBus); o.start();
    const stop = roar.stop; roar.stop = () => { stop(); o.stop(); };
    return roar;
  },
  // The tug: a two-stroke engine buzzing flat out, and the rush of the tunnel.
  amb_tugMotor() {
    const c = this.ctx, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.value = 62; f.type = 'lowpass'; f.frequency.value = 700; g.gain.value = 0.05;
    o.connect(f).connect(g).connect(this.ambBus); o.start();
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 7; lg.gain.value = 6; lfo.connect(lg).connect(o.frequency); lfo.start();
    const rush = this.noiseLoop('bandpass', 700, 0.5, 0.2);
    const stop = rush.stop; rush.stop = () => { stop(); o.stop(); lfo.stop(); };
    return rush;
  },

  sfx_shutter(t) { this.nz(this.sfxBus, t, 'bandpass', 3000, 3, 0.02, 0.4, 0.001); this.nz(this.sfxBus, t + 0.06, 'bandpass', 2200, 3, 0.03, 0.3, 0.001); this.nz(this.sfxBus, t + 0.12, 'highpass', 2000, 1, 0.2, 0.05, 0.02); },
  sfx_lightsOn(t) { for (let i = 0; i < 3; i++) { this.nz(this.sfxBus, t + i * 0.35, 'lowpass', 300, 2, 0.12, 0.5, 0.001); this.osc(this.sfxBus, t + i * 0.35 + 0.05, 'sawtooth', 100, 100, 0.8, 0.008, 0.2); } },
  sfx_crane(t) { this.osc(this.sfxBus, t, 'sawtooth', 70, 90, 1.4, 0.02, 0.2); this.nz(this.sfxBus, t, 'bandpass', 1400, 8, 1.2, 0.04, 0.2); },
  sfx_skid(t) { const n = this.nz(this.sfxBus, t, 'bandpass', 1800, 4, 0.35, 0.12, 0.01); n.f.frequency.linearRampToValueAtTime(1200, t + 0.35); },
});
