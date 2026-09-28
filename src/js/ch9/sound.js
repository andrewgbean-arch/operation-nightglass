// ---------------------------------------------------------------------------
// Chapter Nine sound: the Swiss Alps. Wind off the glacier, cowbells and church
// bells, a shop full of ticking clocks, the hum of a vault inside a mountain,
// and one cuckoo that is only a cuckoo.
// ---------------------------------------------------------------------------
Object.assign(Sound.moods, {
  title:  { bpm: 72, chords: [[48, 55, 60, 64], [43, 50, 55, 59], [45, 52, 57, 60], [41, 48, 53, 57]], scale: [67, 69, 71, 72, 74, 76, 79], lead: 0.45, waltz: true },
  alpine: { bpm: 96, chords: [[48, 55, 60, 64], [43, 50, 55, 59], [48, 55, 60, 64], [41, 48, 53, 57]], scale: [67, 72, 74, 76, 79, 84], lead: 0.7, waltz: true },
  clocks: { bpm: 80, chords: [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]], scale: [72, 74, 76, 79, 81, 84], lead: 0.5 },
  vault:  { bpm: 66, chords: [[45, 48, 52, 55], [44, 48, 51, 55], [45, 48, 52, 55], [41, 45, 48, 52]], scale: [69, 70, 72, 75, 76], lead: 0.25 },
});

Object.assign(Sound, {
  // Cowbells on the slopes, far away.
  amb_cowbells() {
    return this.eventLoop(2, 6, (out, t) => { const pan = Math.random() * 1.4 - 0.7; for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) this.bell(this.verb, t + i * 0.3, 520 + Math.random() * 120, 0.012, 0.8, pan); }, 1, 1);
  },

  // A cuckoo: two soft notes, a major third apart, falling.
  sfx_cuckoo(t) {
    for (const [d, f] of [[0, 784], [0.32, 622]]) { this.osc(this.sfxBus, t + d, 'sine', f, f * 0.99, 0.26, 0.3, 0.02); this.osc(this.sfxBus, t + d, 'triangle', f * 2, f * 2, 0.2, 0.04, 0.02); }
  },
  sfx_scrape(t) { this.nz(this.sfxBus, t, 'bandpass', 1800 + Math.random() * 800, 3, 0.2, 0.08, 0.02); },
});
