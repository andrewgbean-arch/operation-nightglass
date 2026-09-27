// ---------------------------------------------------------------------------
// Soundscape — layered, event-driven ambience that makes each place feel
// inhabited: individual raindrops, cars hissing past on wet cobbles, distant
// two-tone sirens, church bells, café chatter and cups, clocks, thunder and
// a dawn chorus. Everything is synthesised live.
// ---------------------------------------------------------------------------
Object.assign(Sound, {
  // Where one-shot effects are routed; set a pan with sfxAt().
  out() {
    if (!this._pan) return this.sfxBus;
    const p = this.ctx.createStereoPanner();
    p.pan.value = this._pan;
    p.connect(this.sfxBus);
    return p;
  },
  sfxAt(name, x) {
    this._pan = clamp((x / W) * 2 - 1, -1, 1) * 0.75;
    this.sfx(name);
    this._pan = 0;
  },
  setMusicFilter(freq) {
    if (!this.ctx) return;
    this.musicFilter.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.4);
  },

  // A randomly re-triggered ambience layer. `fire(out, t)` schedules one event.
  eventLoop(minGap, maxGap, fire, vol = 1, firstDelay) {
    const c = this.ctx, g = c.createGain();
    g.gain.value = 0; g.gain.setTargetAtTime(vol, c.currentTime, 0.8);
    g.connect(this.ambBus);
    let alive = true, timer;
    const next = () => {
      if (!alive) return;
      try { fire(g, c.currentTime + 0.03); } catch (e) { /* audio node limits */ }
      timer = setTimeout(next, (minGap + Math.random() * (maxGap - minGap)) * 1000);
    };
    timer = setTimeout(next, (firstDelay ?? Math.random() * maxGap) * 1000);
    return { gain: g, stop: () => { alive = false; clearTimeout(timer); } };
  },
  // Primitive voices that render into any destination.
  nz(out, t, type, freq, q, dur, vol, a = 0.005, pan = 0) {
    const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dur);
    let node = s.connect(f).connect(g);
    if (pan) { const p = c.createStereoPanner(); p.pan.value = pan; node = node.connect(p); }
    node.connect(out);
    s.start(t, Math.random() * 2); s.stop(t + a + dur + 0.05);
    return { f, g };
  },
  osc(out, t, type, f0, f1, dur, vol, a = 0.005, pan = 0) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dur);
    let node = o.connect(g);
    if (pan) { const p = c.createStereoPanner(); p.pan.value = pan; node = node.connect(p); }
    node.connect(out);
    o.start(t); o.stop(t + a + dur + 0.05);
    return { o, g };
  },
  bell(out, t, base, vol, decay, pan = 0) {
    for (const [r, v] of [[0.5, 0.5], [1, 1], [1.19, 0.6], [1.56, 0.4], [2, 0.5], [2.74, 0.25], [3.76, 0.15]]) {
      this.osc(out, t, 'sine', base * r, base * r, decay * (1.2 - r * 0.15), vol * v, 0.004, pan);
    }
  },

  // --- rain ------------------------------------------------------------------
  amb_rain() {
    // bed of hiss + low roar, plus individual drops pattering on stone
    const hiss = this.noiseLoop('highpass', 3500, 0.5, 0.22);
    const roar = this.noiseLoop('lowpass', 500, 0.6, 0.3);
    const drops = this.eventLoop(0.03, 0.09, (out, t) => {
      for (let i = 0; i < 4; i++) {
        this.nz(out, t + Math.random() * 0.06, 'bandpass', 1800 + Math.random() * 5000, 6, 0.012 + Math.random() * 0.02, 0.05 + Math.random() * 0.12, 0.001, Math.random() * 2 - 1);
      }
    }, 0.9, 0);
    // a gutter dripping into a puddle nearby
    const gutter = this.eventLoop(0.35, 0.9, (out, t) => {
      this.osc(out, t, 'sine', 900 + Math.random() * 500, 1700 + Math.random() * 600, 0.05, 0.05, 0.002, -0.6);
    }, 0.8, 0.5);
    return this.group([hiss, roar, drops, gutter]);
  },
  amb_rainWindow() {
    const bed = this.noiseLoop('lowpass', 900, 0.7, 0.3);
    const taps = this.eventLoop(0.05, 0.16, (out, t) => {
      this.nz(out, t, 'bandpass', 2500 + Math.random() * 2500, 8, 0.01, 0.05 + Math.random() * 0.06, 0.001, 0.2 + Math.random() * 0.4);
    }, 0.7, 0);
    return this.group([bed, taps]);
  },

  // --- city ----------------------------------------------------------------------
  // A car hissing past on wet cobbles: engine, tyres and a Doppler sweep, panned.
  carPass(out, t, vol = 0.5, dur = 5) {
    const c = this.ctx;
    const dir = Math.random() < 0.5 ? -1 : 1;
    const pan = c.createStereoPanner();
    pan.pan.setValueAtTime(-dir, t); pan.pan.linearRampToValueAtTime(dir, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(pan).connect(out);
    // tyres on water
    const s = c.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.7;
    f.frequency.setValueAtTime(900, t); f.frequency.linearRampToValueAtTime(2600, t + dur * 0.5); f.frequency.linearRampToValueAtTime(700, t + dur);
    s.connect(f).connect(g); s.start(t); s.stop(t + dur + 0.1);
    // engine hum with Doppler drop
    const o = c.createOscillator(), og = c.createGain(), of = c.createBiquadFilter();
    o.type = 'sawtooth'; of.type = 'lowpass'; of.frequency.value = 260; og.gain.value = 0.35;
    const f0 = 60 + Math.random() * 20;
    o.frequency.setValueAtTime(f0 * 1.08, t); o.frequency.linearRampToValueAtTime(f0 * 1.08, t + dur * 0.45); o.frequency.linearRampToValueAtTime(f0 * 0.9, t + dur * 0.6);
    o.connect(of).connect(og).connect(g); o.start(t); o.stop(t + dur + 0.1);
  },
  amb_traffic() {
    return this.eventLoop(5, 14, (out, t) => {
      this.carPass(out, t, 0.35 + Math.random() * 0.3, 4 + Math.random() * 3);
      // now and then an impatient Viennese horn
      if (Math.random() < 0.12) { this.osc(out, t + 2, 'square', 392, 392, 0.35, 0.03); this.osc(out, t + 2, 'square', 494, 494, 0.35, 0.025); }
    }, 1, 2);
  },
  // European two-tone police siren drifting past in the distance.
  siren(out, t, vol = 0.05) {
    const c = this.ctx, g = c.createGain(), f = c.createBiquadFilter(), pan = c.createStereoPanner();
    const dur = 9, dir = Math.random() < 0.5 ? -1 : 1;
    f.type = 'lowpass'; f.frequency.value = 1400;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    pan.pan.setValueAtTime(-dir * 0.8, t); pan.pan.linearRampToValueAtTime(dir * 0.8, t + dur);
    const o = c.createOscillator(); o.type = 'triangle';
    for (let k = 0; k < dur / 0.55; k++) o.frequency.setValueAtTime(k % 2 ? 587 : 440, t + k * 0.55);
    o.connect(f).connect(g).connect(pan).connect(out); o.start(t); o.stop(t + dur + 0.1);
  },
  amb_sirens() { return this.eventLoop(35, 70, (out, t) => this.siren(out, t), 1, 12); },
  amb_churchBell() {
    return this.eventLoop(50, 90, (out, t) => {
      const n = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) this.bell(out, t + i * 2.4, 196, 0.05, 6, 0.4);
    }, 1, 8);
  },
  amb_tram() {
    return this.eventLoop(30, 60, (out, t) => {
      this.bell(out, t, 1320, 0.025, 1.2, 0.7); this.bell(out, t + 0.3, 1320, 0.025, 1.2, 0.7);
      this.nz(out, t + 0.5, 'bandpass', 300, 2, 3, 0.12, 1.2, 0.7); // wheels on rails
    }, 1, 20);
  },
  amb_engineIdle() {
    // the diplomat's limousine, idling at the kerb
    const c = this.ctx, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain(), pan = c.createStereoPanner();
    o.type = 'sawtooth'; o.frequency.value = 34; f.type = 'lowpass'; f.frequency.value = 140;
    lfo.frequency.value = 7; lg.gain.value = 0.04; lfo.connect(lg).connect(g.gain);
    g.gain.value = 0; g.gain.setTargetAtTime(0.12, c.currentTime, 1);
    pan.pan.value = -0.7;
    o.connect(f).connect(g).connect(pan).connect(this.ambBus); o.start(); lfo.start();
    return { gain: g, stop: () => { o.stop(); lfo.stop(); } };
  },
  amb_flags() {
    return this.eventLoop(0.08, 0.25, (out, t) => {
      this.nz(out, t, 'bandpass', 300 + Math.random() * 200, 1.5, 0.05 + Math.random() * 0.08, 0.05 + Math.random() * 0.07, 0.01, 0.5);
    }, 0.8, 0);
  },

  // --- interiors -------------------------------------------------------------------
  amb_clock() {
    let tick = 0;
    return this.eventLoop(1, 1, (out, t) => {
      tick ^= 1;
      this.nz(out, t, 'bandpass', tick ? 3200 : 2500, 12, 0.02, 0.18, 0.001, -0.4);
    }, 0.6, 0.5);
  },
  amb_babble() {
    // many voices at once: formant-shaped noise syllables at speech rate
    const syll = this.eventLoop(0.05, 0.16, (out, t) => {
      const pan = Math.random() * 1.6 - 0.8, d = 0.08 + Math.random() * 0.2;
      this.nz(out, t, 'bandpass', 300 + Math.random() * 500, 5, d, 0.05 + Math.random() * 0.05, 0.03, pan);
      this.nz(out, t, 'bandpass', 900 + Math.random() * 1400, 7, d, 0.03 + Math.random() * 0.03, 0.03, pan);
    }, 0.9, 0);
    const bed = this.noiseLoop('bandpass', 500, 1.2, 0.12);
    return this.group([syll, bed]);
  },
  amb_cups() {
    return this.eventLoop(1.5, 5, (out, t) => {
      const f = 2400 + Math.random() * 1800, pan = Math.random() * 1.4 - 0.7;
      this.osc(out, t, 'sine', f, f, 0.25, 0.035, 0.001, pan);
      this.osc(out, t, 'sine', f * 1.51, f * 1.51, 0.18, 0.018, 0.001, pan);
      if (Math.random() < 0.5) this.osc(out, t + 0.12, 'sine', f * 0.9, f * 0.9, 0.2, 0.025, 0.001, pan);
    }, 1, 1);
  },
  amb_espresso() {
    return this.eventLoop(20, 40, (out, t) => {
      this.nz(out, t, 'highpass', 2800, 0.7, 2.6, 0.12, 0.25, -0.3);
      this.nz(out, t + 0.2, 'bandpass', 180, 2, 2.2, 0.08, 0.2, -0.3); // grinder rumble
    }, 1, 6);
  },
  amb_vinyl() {
    // gramophone crackle
    return this.eventLoop(0.04, 0.25, (out, t) => {
      this.nz(out, t, 'highpass', 2000 + Math.random() * 3000, 1, 0.004, 0.03 + Math.random() * 0.05, 0.001, 0.8);
    }, 0.8, 0);
  },
  amb_glasses() {
    return this.eventLoop(2, 6, (out, t) => {
      const pan = Math.random() * 1.6 - 0.8;
      for (let i = 0; i < 2; i++) { const f = 3000 + Math.random() * 1500; this.osc(out, t + i * 0.03, 'sine', f, f, 0.6, 0.02, 0.001, pan); }
    }, 1, 1);
  },
  amb_thunder() {
    return this.eventLoop(25, 45, (out, t) => this.thunder(out, t), 1, 20);
  },
  thunder(out, t) {
    const n = this.nz(out, t, 'lowpass', 180, 0.7, 4.5, 0.55, 0.15);
    n.f.frequency.setValueAtTime(400, t); n.f.frequency.exponentialRampToValueAtTime(90, t + 4);
    this.nz(out, t + 0.1, 'lowpass', 900, 0.5, 0.6, 0.18, 0.01);
  },
  amb_gusts() {
    return this.eventLoop(4, 10, (out, t) => {
      const n = this.nz(out, t, 'bandpass', 500, 0.8, 3, 0.25, 1.2, Math.random() * 2 - 1);
      n.f.frequency.setValueAtTime(300, t); n.f.frequency.linearRampToValueAtTime(900, t + 1.5); n.f.frequency.linearRampToValueAtTime(350, t + 4);
    }, 1, 1);
  },
  amb_searchlights() {
    // the electric hum of the big lamps
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = 100; f.type = 'bandpass'; f.frequency.value = 200; f.Q.value = 4;
    g.gain.value = 0; g.gain.setTargetAtTime(0.02, c.currentTime, 1);
    o.connect(f).connect(g).connect(this.ambBus); o.start();
    return { gain: g, stop: () => o.stop() };
  },
  // Dawn chorus: blackbirds, sparrows and a wren, all FM chirps.
  amb_birds() {
    return this.eventLoop(0.6, 2.2, (out, t) => {
      const pan = Math.random() * 1.8 - 0.9, kind = Math.random();
      if (kind < 0.4) { // sparrow chirps
        const n = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < n; i++) { const f = 3800 + Math.random() * 800; this.osc(out, t + i * 0.13, 'sine', f, f * 0.75, 0.06, 0.05, 0.004, pan); }
      } else if (kind < 0.75) { // blackbird phrase: fluting, melodic
        let tt = t;
        for (let i = 0; i < 4 + Math.random() * 4; i++) {
          const f = 1600 + Math.random() * 1400, d = 0.08 + Math.random() * 0.18;
          this.osc(out, tt, 'sine', f, f * (0.85 + Math.random() * 0.4), d, 0.045, 0.01, pan);
          tt += d + 0.03;
        }
      } else { // wren trill
        for (let i = 0; i < 14; i++) { const f = 5200 + (i % 2) * 700; this.osc(out, t + i * 0.045, 'sine', f, f * 0.9, 0.03, 0.03, 0.002, pan); }
      }
    }, 0.9, 0.3);
  },

  group(parts) {
    // Several layers faded and stopped as one ambience.
    return {
      gain: { gain: { setTargetAtTime: (v, t, k) => parts.forEach(p => p.gain.gain.setTargetAtTime(v, t, k)) } },
      stop: () => parts.forEach(p => { try { p.stop(); } catch (e) { /* stopped */ } }),
    };
  },

  // --- surface-aware footsteps -----------------------------------------------------------
  sfx_stepCarpet(t) { this.burst(t, 'lowpass', 220 + Math.random() * 80, 0.8, 0.12, 0.3, 0.01); },
  sfx_stepMarble(t) { this.burst(t, 'bandpass', 2600 + Math.random() * 500, 3, 0.05, 0.22); this.burst(t, 'lowpass', 300, 1, 0.06, 0.12); },
  sfx_stepWood(t) { this.burst(t, 'bandpass', 700 + Math.random() * 200, 2.5, 0.08, 0.3); this.tone(t, 'sine', 180, 120, 0.06, 0.08); },
  sfx_stepCobble(t) { this.burst(t, 'bandpass', 1100 + Math.random() * 400, 1, 0.1, 0.22); this.burst(t + 0.02, 'highpass', 4000, 0.7, 0.12, 0.08); },
  sfx_thunder(t) { this.thunder(this.sfxBus, t); },
});
