// ---------------------------------------------------------------------------
// Voice — spoken dialogue through the voices built into the player's browser
// and operating system. Each character gets its own voice, pitch and pace.
// Falls back silently to subtitles when no voices are available.
// ---------------------------------------------------------------------------
const Voice = {
  enabled: true, voices: [], chosen: {}, current: null,
  FEMALE: /female|hazel|susan|sonia|libby|maisie|bella|serena|kate|stephanie|martha|katja|amala|anna|hedda|petra|zira|aria|jenny|samantha|karen|moira|tessa|fiona|victoria|google deutsch|ingrid|seraphina|louisa|elke|gisela|milena|svetlana|dariya|ekaterina|irina|emma|olivia|natasha|clara|ava|allison|joanna|amy|salli|kimberly|nicole|zuzana|agnieszka|paulina/i,

  // Preferred voice names, best first. Natural/neural voices score higher.
  profiles: {
    jack:     { lang: 'en-GB', female: false, prefer: [/ryan/i, /thomas/i, /daniel/i, /arthur/i, /george/i, /uk english male/i, /oliver/i], pitch: 0.95, rate: 1.02 },
    narrator: { lang: 'en-GB', female: false, prefer: [/thomas/i, /george/i, /arthur/i, /daniel/i, /ryan/i, /uk english male/i], pitch: 0.82, rate: 0.93 },
    control:  { lang: 'en-GB', female: false, prefer: [/thomas/i, /elliot/i, /alfie/i, /oliver/i, /george/i, /arthur/i, /daniel/i, /uk english male/i], pitch: 0.72, rate: 0.95 },
    ilse:     { lang: 'en-GB', female: true, prefer: [/seraphina.*multi/i, /sonia/i, /libby/i, /maisie/i, /hazel/i, /serena/i, /kate/i, /uk english female/i, /martha/i], pitch: 0.92, rate: 0.93 },
    franz:    { lang: 'en', female: false, prefer: [/florian.*multi/i, /conrad/i, /killian/i, /guy/i, /christopher/i, /eric/i, /davis/i, /david/i, /mark/i], pitch: 0.82, rate: 0.98 },
    vendor:   { lang: 'en', female: false, prefer: [/fred/i, /ralph/i, /mark/i, /david/i, /roger/i, /eric/i], pitch: 0.68, rate: 0.9 },
    gateGuard:{ lang: 'en', female: false, prefer: [/dmitry/i, /pavel/i, /christopher/i, /eric/i, /mark/i, /david/i], pitch: 0.6, rate: 0.9 },
    stairGuard:{ lang: 'en', female: false, prefer: [/dmitry/i, /pavel/i, /eric/i, /christopher/i, /mark/i], pitch: 0.55, rate: 0.92 },
    officeGuard:{ lang: 'en', female: false, prefer: [/dmitry/i, /pavel/i, /christopher/i, /eric/i, /mark/i], pitch: 0.58, rate: 1.05 },
    waiter:   { lang: 'en', female: false, prefer: [/henri/i, /remy/i, /liam/i, /andrew/i, /brian/i, /eric/i, /mark/i], pitch: 1.08, rate: 1.02 },
    baron:    { lang: 'en-GB', female: false, prefer: [/arthur/i, /george/i, /daniel/i, /rishi/i, /uk english male/i], pitch: 0.55, rate: 0.88 },
  },

  init() {
    if (!('speechSynthesis' in window)) return;
    const load = () => { try { this.voices = speechSynthesis.getVoices() || []; this.chosen = {}; } catch (e) { this.voices = []; } };
    load();
    try { speechSynthesis.addEventListener('voiceschanged', load); } catch (e) { speechSynthesis.onvoiceschanged = load; }
    const saved = store.get('nightglass_voices');
    if (saved === false) this.enabled = false;
  },
  available() { return this.enabled && 'speechSynthesis' in window && this.voices.length > 0; },
  toggle() { this.enabled = !this.enabled; store.set('nightglass_voices', this.enabled); if (!this.enabled) this.stop(); return this.enabled; },

  pick(id) {
    if (this.chosen[id] !== undefined) return this.chosen[id];
    const prof = this.profiles[id];
    if (!prof) return null;
    const used = new Set(Object.entries(this.chosen).filter(([k]) => k !== 'narrator').map(([, v]) => v && v.name));
    let best = null, bestScore = -Infinity;
    for (const v of this.voices) {
      if (!/^en/i.test(v.lang) && !/multilingual/i.test(v.name)) continue;
      const isFemale = this.FEMALE.test(v.name);
      if (isFemale !== prof.female) continue;
      let score = 0;
      const i = prof.prefer.findIndex(re => re.test(v.name));
      if (i >= 0) score += 100 - i * 8;
      if (/natural|neural|online|premium|enhanced/i.test(v.name)) score += 40;
      if (v.lang.replace('_', '-').toLowerCase().startsWith(prof.lang.toLowerCase())) score += 15;
      if (used.has(v.name)) score -= 30; // keep characters distinct where possible
      if (v.localService === false) score += 5;
      if (score > bestScore) { bestScore = score; best = v; }
    }
    this.chosen[id] = best;
    return best;
  },

  // Speak a line. Resolves when finished (or immediately if voices are off).
  speak(id, text, onEnd) {
    if (!this.available()) return false;
    const prof = this.profiles[id] || this.profiles.jack;
    const v = this.pick(this.profiles[id] ? id : 'jack');
    const clean = text.replace(/[“”"]/g, '').replace(/\.\.\./g, ', ').replace(/—/g, ', ');
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      if (v) { u.voice = v; u.lang = v.lang; }
      u.pitch = prof.pitch; u.rate = prof.rate; u.volume = Sound.muted ? 0 : 1;
      let done = false;
      const finish = () => { if (done) return; done = true; if (this.current === u) this.current = null; onEnd && onEnd(); };
      u.onend = finish; u.onerror = finish;
      this.current = u;
      speechSynthesis.speak(u);
      // Chrome occasionally never fires onend; the caller also has a timeout.
      return true;
    } catch (e) { return false; }
  },
  stop() { try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) { /* ignore */ } this.current = null; },
};
Voice.init();
