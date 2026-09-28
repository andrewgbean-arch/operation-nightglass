// ---------------------------------------------------------------------------
// The circuit — the action sequence, seen from above. Jack drives Franz's
// Mercedes the wrong way round the Monaco Grand Prix circuit: down from the
// Casino, round the hairpin, through the tunnel and out along the harbour,
// against the late-night traffic, with Kolar's car behind. Steer round the
// oncoming cars; every crash lets Kolar close in.
// ---------------------------------------------------------------------------
const CR = {
  LEN: 1100,            // metres, the Casino to the yacht
  PXY: 6,               // pixels per metre, up the screen
  CARY: 820,            // where Jack's car sits on screen
  SPEED: 24,            // metres a second
  STEER: 760,           // pixels a second, sideways
  SECTIONS: [[0, 'CASINO SQUARE'], [300, 'THE HAIRPIN'], [520, 'THE TUNNEL'], [820, 'THE HARBOUR']],
};

const CircuitRun = {
  // the road: its centre line and width at a distance along the circuit
  cx(m) {
    if (m < 300) return W / 2 + Math.sin(m / 60) * 160;
    if (m < 520) { const u = (m - 300) / 220; return W / 2 + Math.sin(300 / 60) * 160 * (1 - u) + Math.sin(u * Math.PI) * 420; }
    if (m < 820) return W / 2;
    return W / 2 + Math.sin((m - 820) / 34) * 220;
  },
  width(m) { return m >= 520 && m < 820 ? 470 : 560; },
  section(m) { let s = CR.SECTIONS[0]; for (const x of CR.SECTIONS) if (m >= x[0]) s = x; return s; },

  start() {
    G.mode = 'action'; G.action = this; G.paused = false; G.speech = []; G.overlay = null; G.choices = null;
    G.sceneId = 'circuit';
    this.lines = {};
    this.introT = 0;
    this.checkpoint = 0;
    this.reset();
    Sound.playMusic('chase');
    Sound.setAmbience(['engine', 'f1']);
    Sound.setMusicFilter(18000);
    G.fadeTo = 0;
  },
  reset() {
    this.d = this.checkpoint; this.off = 0; this.t = 0; this.spin = 0; this.v = CR.SPEED;
    this.gap = this.checkpoint ? 50 : 70;
    this.traffic = []; this.spawnAt = this.d + 60;
    this.dead = false; this.done = false; this.failText = null; this.flash = null;
  },
  line(key, who, text) {
    if (this.lines[key] || G.speech.length) return;
    this.lines[key] = true;
    say(who, text, { pos: [W / 2, 120] });
  },

  // ---- traffic: taxis, a Rolls, a coach, a street sweeper, and a flower stall in the tunnel ----
  spawn() {
    const kinds = [
      { col: '#e8c830', w: 84, h: 160, v: 12, name: 'taxi' }, { col: '#3a1a2a', w: 92, h: 190, v: 10, name: 'rolls' },
      { col: '#e8e2d6', w: 110, h: 300, v: 8, name: 'coach' }, { col: '#d82a2a', w: 80, h: 190, v: 16, name: 'racer' },
      { col: '#2a6a3a', w: 96, h: 150, v: 3, name: 'sweeper' },
    ];
    const r = Math.random();
    const k = r < 0.35 ? kinds[0] : r < 0.55 ? kinds[1] : r < 0.7 ? kinds[2] : r < 0.88 ? kinds[3] : kinds[4];
    const lane = Math.random() < 0.5 ? -1 : 1, m = this.spawnAt;
    this.traffic.push({ ...k, m, lane: lane * (this.width(m) / 4) + (Math.random() - 0.5) * 40 });
    if (m > 560 && m < 640 && !this.flowers) { this.flowers = true; this.traffic.push({ col: '#e8408a', w: 120, h: 80, v: 0, name: 'flowers', m: 610, lane: 0 }); }
    this.spawnAt += 42 + Math.random() * 30;
  },

  // ---- input -----------------------------------------------------------------------------
  steer() {
    if (this.autoSteer !== undefined) return this.autoSteer;
    let s = 0;
    if (KEYS.ArrowLeft || KEYS.a || KEYS.A) s -= 1;
    if (KEYS.ArrowRight || KEYS.d || KEYS.D) s += 1;
    const touches = Object.values(G.touches || {});
    const carX = this.cx(this.d) + this.off;
    if (touches.length) { const tx = touches[touches.length - 1].x; s = clamp((tx - carX) / 120, -1, 1); }
    else if (G.mouse.down) s = clamp((G.mouse.x - carX) / 120, -1, 1);
    return s;
  },
  key() {}, touchStart() {}, click() {},

  update(dt) {
    if (this.done) return;
    this.t += dt; this.introT += dt;
    if (this.flash && (this.flash.t -= dt) <= 0) this.flash = null;
    if (this.dead) return;
    // test autopilot: pick the side of the road with the most room ahead
    if (this.autopilot) {
      const ahead = this.traffic.filter(c => c.m - this.d > 0 && c.m - this.d < 70);
      let best = 0, bestScore = -1;
      for (const cand of [-this.width(this.d) / 3, 0, this.width(this.d) / 3]) {
        const clear = Math.min(...ahead.map(c => Math.abs(c.lane - cand) < (c.w + 100) / 2 ? (c.m - this.d) : 999), 999);
        const score = clear - Math.abs(cand - this.off) * 0.02;
        if (score > bestScore) { bestScore = score; best = cand; }
      }
      this.autoSteer = clamp((best - this.off) / 60, -1, 1);
    }
    // driving
    if (this.spin > 0) { this.spin -= dt; this.v = 6; } else this.v = Math.min(CR.SPEED, this.v + 20 * dt);
    this.d += this.v * dt;
    this.off += this.steer() * CR.STEER * dt * (this.spin > 0 ? 0.3 : 1);
    const half = this.width(this.d) / 2 - 50;
    if (Math.abs(this.off) > half) { this.off = Math.sign(this.off) * half; if (this.spin <= 0 && Math.random() < dt * 3) Sound.sfx('scrape'); }
    for (const [m] of CR.SECTIONS) if (this.d >= m && this.checkpoint < m) this.checkpoint = m;
    // the traffic comes the other way
    while (this.spawnAt < this.d + 180) this.spawn();
    for (const c of this.traffic) c.m -= c.v * dt;
    this.traffic = this.traffic.filter(c => c.m > this.d - 40);
    if (this.spin <= 0) for (const c of this.traffic) {
      const dy = Math.abs((c.m - this.d) * CR.PXY), dx = Math.abs(c.lane - this.off);
      if (dy < (c.h + 170) / 2 - 20 && dx < (c.w + 90) / 2 - 10) { this.crash(c); break; }
    }
    // Kolar: a little faster than us, and never crashes
    this.gap += (this.v - (CR.SPEED + 0.5)) * dt;
    if (this.gap <= 0) return this.fail();
    if (this.t > 1) this.line('left', 'franz', 'The traffic comes the other way, Herr Harrow! Keep to the side with nobody on it!');
    if (this.t > 6) this.line('kolar', 'kolar', 'Stop that Mercedes!');
    if (this.d > 320) this.line('hairpin', 'jack', 'Sorry! Wrong way! Sorry!');
    if (this.d > 540) this.line('tunnel', 'franz', 'The tunnel! There is a flower stall in the tunnel! Why is there a flower stall in the tunnel?');
    if (this.d > 840) this.line('harbour', 'franz', 'Nearly there! I see the yacht! I see the goose!');
    if (this.d >= CR.LEN) this.finish();
  },
  crash(c) {
    this.spin = 1; this.gap -= 14;
    this.dents = (this.dents || 0) + 1;
    Sound.sfx('crash');
    c.m -= 3; c.hit = true;
    const says = { taxi: 'A taxi!', rolls: 'Not the Rolls!', coach: 'A coach full of tourists! They\'re waving!', racer: 'A racing car! On its way to bed!', sweeper: 'The street sweeper!', flowers: 'The flower stall! Roses everywhere!' };
    this.flash = { text: says[c.name] || 'Crash!', t: 1.2 };
  },
  async fail() {
    if (this.dead) return;
    this.dead = true;
    this.fails = (this.fails || 0) + 1;
    Sound.sfx('horn');
    this.failText = 'Kolar caught up! Steer for the side of the road with nobody coming.';
    await wait(1.8);
    G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
    G.speech = [];
    this.flowers = false;
    this.reset();
    this.introT = 8;
    G.fadeTo = 0;
  },
  async finish() {
    if (this.done) return;
    this.done = true;
    Sound.sfx('brakes');
    G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
    G.speech = [];
    await TextScreen.play(DAWN_PAGES, 'dawn');
    startPlay();
    G.sceneId = null; G.fade = 1;
    await gotoScene('dawn', 520, 960, 1, { instant: true });
  },

  // ---- drawing -----------------------------------------------------------------------------
  sy(m) { return CR.CARY - (m - this.d) * CR.PXY; },
  drawCar(ctx, x, y, col, w, h, up, t, name) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; rrect(ctx, -w / 2 + 6, -h / 2 + 8, w, h, 16); ctx.fill();
    ctx.fillStyle = col; rrect(ctx, -w / 2, -h / 2, w, h, 16); ctx.fill();
    if (name === 'flowers') {
      for (let k = 0; k < 14; k++) ellipse(ctx, -w / 2 + 10 + (k * 37) % (w - 20), -h / 2 + 12 + Math.floor(k / 4) * 16, 7, 7, ['#e8408a', '#f0e4c8', '#d82a2a', '#f0b35b'][k % 4]);
      ctx.restore(); return;
    }
    const f = up ? -1 : 1;
    ctx.fillStyle = 'rgba(20,30,40,0.85)'; rrect(ctx, -w / 2 + 10, f * h * 0.12 - 18, w - 20, 36, 6); ctx.fill();   // windscreen
    ctx.fillStyle = 'rgba(20,30,40,0.6)'; rrect(ctx, -w / 2 + 12, -f * h * 0.28 - 12, w - 24, 24, 6); ctx.fill();   // rear window
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(-w / 2 + 8, -h / 2 + 10, 6, h - 20);
    // headlights, and their beams
    for (const d of [-1, 1]) ellipse(ctx, d * (w / 2 - 14), f * (h / 2 - 8), 9, 6, '#fff4c8');
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,240,200,0.12)';
    ctx.beginPath(); ctx.moveTo(-w / 2 + 6, f * h / 2); ctx.lineTo(w / 2 - 6, f * h / 2); ctx.lineTo(w, f * (h / 2 + 260)); ctx.lineTo(-w, f * (h / 2 + 260)); ctx.fill(); ctx.restore();
    if (name === 'racer') { ctx.fillStyle = '#f0f0f0'; ctx.fillRect(-6, -h / 2, 12, h); ctx.fillStyle = '#1a1a1a'; for (const d of [-1, 1]) for (const e of [-1, 1]) ctx.fillRect(d * (w / 2 + 2) - 8, e * h * 0.32 - 16, 16, 32); }
    ctx.restore();
  },
  draw(ctx) {
    const t = G.t;
    // the town either side, then the road in strips
    const tunnel = this.d > 500 && this.d < 840;
    const harbour = this.d > 780;
    ctx.fillStyle = tunnel ? '#1a1612' : '#8a7a6a'; ctx.fillRect(0, 0, W, H);
    const step = 12;
    for (let y = -step; y < H + step; y += step) {
      const m = this.d + (CR.CARY - y) / CR.PXY, c = this.cx(m), w = this.width(m);
      const inTunnel = m >= 520 && m < 820;
      // pavements, buildings, the harbour water
      if (!inTunnel) {
        ctx.fillStyle = m >= 820 ? '#1a3a5a' : ((Math.floor(m / 18) % 2) ? '#c8a888' : '#d8b898'); ctx.fillRect(c + w / 2 + 60, y, W, step + 1);
        ctx.fillStyle = (Math.floor(m / 22) % 3) ? '#e8c8a8' : '#b8604a'; ctx.fillRect(0, y, c - w / 2 - 60, step + 1);
        ctx.fillStyle = '#b8b0a0'; ctx.fillRect(c - w / 2 - 60, y, 60, step + 1); ctx.fillRect(c + w / 2, y, 60, step + 1);
      } else { ctx.fillStyle = '#2a241c'; ctx.fillRect(0, y, W, step + 1); }
      ctx.fillStyle = inTunnel ? '#3a3a40' : '#4a4a52'; ctx.fillRect(c - w / 2, y, w, step + 1);
      // red and white kerbs, the centre line
      const kerb = Math.floor(m / 4) % 2 ? '#d82a2a' : '#f0f0f0';
      ctx.fillStyle = kerb; ctx.fillRect(c - w / 2 - 14, y, 14, step + 1); ctx.fillRect(c + w / 2, y, 14, step + 1);
      if (Math.floor(m / 6) % 2) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(c - 4, y, 8, step + 1); }
      if (inTunnel && Math.floor(m / 30) % 2 && Math.floor(m) % 30 < 2) { glow(ctx, c - w / 2 - 20, y, 60, 'rgba(255,200,120,0.5)'); glow(ctx, c + w / 2 + 20, y, 60, 'rgba(255,200,120,0.5)'); }
    }
    // the traffic, and us
    for (const c of this.traffic) { const y = this.sy(c.m); if (y > -300 && y < H + 300) this.drawCar(ctx, this.cx(c.m) + c.lane, y, c.col, c.w, c.h, false, t, c.name); }
    const carX = this.cx(this.d) + this.off;
    ctx.save(); ctx.translate(carX, CR.CARY); ctx.rotate(this.spin > 0 ? Math.sin(this.spin * 18) * 0.4 : this.steer() * 0.08);
    this.drawCar(ctx, 0, 0, '#101216', 90, 170, true, t, 'mercedes');
    ctx.restore();
    // the goose's head out of the back window
    ellipse(ctx, carX + 20, CR.CARY + 60, 10, 10, '#f0ece4'); poly(ctx, [carX + 26, CR.CARY + 56, carX + 40, CR.CARY + 60, carX + 26, CR.CARY + 64], '#e8902a');
    // Kolar, behind
    if (this.gap < 45) this.drawCar(ctx, this.cx(this.d - this.gap) + this.off * 0.5, CR.CARY + this.gap * CR.PXY, '#2a2f38', 92, 180, true, t, 'kolar');
    if (tunnel) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, W, H); glow(ctx, carX, CR.CARY - 200, 260, 'rgba(255,240,200,0.25)'); }
    if (harbour && !tunnel) glow(ctx, W - 200, 200, 400, 'rgba(255,220,170,0.15)');
    drawVignette(ctx, 0.5);
    drawGrain(ctx, 0.04);
    this.drawHud(ctx);
  },
  drawHud(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(6,10,14,0.75)'; rrect(ctx, 40, 30, 560, 150, 14); ctx.fill();
    ctx.textAlign = 'left'; ctx.fillStyle = '#f0b35b'; ctx.font = `600 22px ${FONT_UI}`; ctx.fillText(this.section(this.d)[1], 64, 70);
    ctx.fillStyle = '#f0e4c8'; ctx.font = `600 28px ${FONT_UI}`; ctx.fillText('Get back to the yacht!', 64, 110);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(64, 132, 500, 12);
    ctx.fillStyle = '#f0b35b'; ctx.fillRect(64, 132, 500 * clamp(this.d / CR.LEN, 0, 1), 12);
    const g = Math.max(0, Math.round(this.gap));
    ctx.textAlign = 'right'; ctx.fillStyle = g < 20 ? '#ff6a5a' : '#c8d0dc'; ctx.font = `600 ${G.touch ? 26 : 20}px ${FONT_UI}`; ctx.fillText(`Kolar: ${g} m behind`, 564, 70);
    if (this.flash) { ctx.textAlign = 'center'; ctx.fillStyle = '#ff8a6a'; ctx.font = `700 40px ${FONT_UI}`; ctx.fillText(this.flash.text, W / 2, H - 70); }
    if (this.introT < 8) {
      const a = clamp(Math.min(this.introT, 8 - this.introT), 0, 1);
      ctx.globalAlpha = a; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(6,10,14,0.8)'; rrect(ctx, W / 2 - 560, 230, 1120, 140, 14); ctx.fill();
      ctx.fillStyle = '#f0e4c8'; ctx.font = `500 30px ${FONT_UI}`;
      ctx.fillText(G.touch ? 'Hold your finger where you want the car to go' : 'LEFT and RIGHT (or A and D, or hold the mouse) to steer', W / 2, 286);
      ctx.fillText('Everything is coming the other way. Don\'t hit it.', W / 2, 332);
      ctx.globalAlpha = 1;
    }
    if (this.failText) drawLabel(ctx, this.failText, W / 2, H / 2);
    ctx.restore();
  },
};

const DAWN_PAGES = [
  { kicker: 'PORT HERCULE  ·  00:04', amb: ['water'], text: 'Kolar\'s car met the harbour chicane at speed and chose the harbour. Two fishermen pulled him out. He was still shouting.' },
  { kicker: 'LA DIVA  ·  06:30', amb: ['water', 'gulls'], text: 'Dawn on the Riviera. A cheque from the Casino for forty-one million francs, a dented Mercedes, and a goose asleep on the captain\'s cap.' },
];
