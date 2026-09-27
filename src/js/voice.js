// ---------------------------------------------------------------------------
// Voice — plays the pre-recorded dialogue (see tools/record-voices.js).
// Each line is an embedded MP3 keyed by "speaker|text". While someone talks,
// music and ambience duck slightly so the voice sits on top of the mix.
// ---------------------------------------------------------------------------
const Voice = {
  enabled: true, decoded: {}, src: null, tok: 0, bus: null,

  init() {
    if (store.get('nightglass_voices') === false) this.enabled = false;
  },
  available() { return this.enabled && typeof VOICE_LINES !== 'undefined'; },
  toggle() { this.enabled = !this.enabled; store.set('nightglass_voices', this.enabled); if (!this.enabled) this.stop(); return this.enabled; },

  ensureBus() {
    if (this.bus || !Sound.ctx) return;
    const c = Sound.ctx;
    this.bus = c.createGain(); this.bus.gain.value = 1.15;
    this.bus.connect(Sound.master);
    const send = c.createGain(); send.gain.value = 0.1; // a touch of room
    this.bus.connect(send).connect(Sound.verb);
  },
  lookup(id, text) {
    if (typeof VOICE_LINES === 'undefined') return null;
    return VOICE_LINES[id + '|' + text] ? id + '|' + text : null;
  },
  async decode(key) {
    if (this.decoded[key]) return this.decoded[key];
    const bin = atob(VOICE_LINES[key]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const buf = await Sound.ctx.decodeAudioData(bytes.buffer);
    this.decoded[key] = buf;
    return buf;
  },
  duck(on) {
    if (!Sound.ctx) return;
    const t = Sound.ctx.currentTime;
    Sound.musicBus.gain.setTargetAtTime(on ? 0.26 : 0.42, t, 0.15);
    Sound.ambBus.gain.setTargetAtTime(on ? 0.42 : 0.6, t, 0.15);
  },

  // Speak a line. Returns true if a recording exists and will play;
  // onEnd(ok) fires when it finishes (ok=false if playback failed).
  speak(id, text, onEnd) {
    if (!this.enabled || !Sound.ctx || Sound.muted) return false;
    const key = this.lookup(id, text);
    if (!key) return false;
    this.stop();
    this.ensureBus();
    const token = ++this.tok;
    this.decode(key).then(buf => {
      if (token !== this.tok) return;
      const s = Sound.ctx.createBufferSource();
      s.buffer = buf;
      s.connect(this.bus);
      s.onended = () => { if (token !== this.tok) return; this.src = null; this.duck(false); onEnd && onEnd(true); };
      this.src = s;
      this.duck(true);
      s.start();
    }).catch(() => { if (token === this.tok) onEnd && onEnd(false); });
    return true;
  },
  stop() {
    this.tok++;
    if (this.src) { try { this.src.stop(); } catch (e) { /* already stopped */ } }
    this.src = null;
    this.duck(false);
  },
};
Voice.init();
