// ---------------------------------------------------------------------------
// The snowmobile — the action sequence. Eight kilometres across the frozen
// fjord to the ice runway, where the fleet takes off at eleven. Steer round the
// pressure ridges, the crevasses, the fuel drums and the seals; every crash
// costs seconds, and at eleven o'clock the aircraft go, with or without Jack.
// ---------------------------------------------------------------------------
const SR = {
  DIST: 8000,       // metres to the runway
  SPEED: 150,       // metres a second, flat out
  TIME: 72,         // seconds until eleven o'clock
  HIT: 4,           // seconds lost in a crash
  HORIZON: 430,
  K: 40,            // perspective: how quickly things shrink with distance
};

function snowCourse() {
  const r = rng(1141), out = [];
  const kinds = ['ridge', 'crevasse', 'drum', 'seal', 'ridge', 'drum'];
  for (let z = 400; z < SR.DIST - 300; z += 150 + r() * 120) {
    const kind = z > SR.DIST * 0.62 && z < SR.DIST * 0.66 ? 'bear' : kinds[Math.floor(r() * kinds.length)];
    const x = -0.8 + r() * 1.6;
    out.push({ z, x, kind, w: kind === 'crevasse' ? 0.3 : kind === 'ridge' ? 0.26 : kind === 'bear' ? 0.24 : 0.16, hit: false });
    if (r() < 0.3) { const x2 = x > 0 ? x - 0.9 : x + 0.9; out.push({ z: z + 10, x: x2, kind: 'drum', w: 0.16, hit: false }); }
  }
  return out;
}

const SnowRace = {
  start() {
    G.mode = 'action'; G.action = this; G.paused = false; G.speech = []; G.overlay = null; G.choices = null;
    G.sceneId = 'race';
    this.course = snowCourse();
    this.checkpoint = 0; this.lines = {}; this.introT = 0; this.crashes = 0; this.fails = 0;
    this.reset();
    Sound.playMusic('race');
    Sound.setAmbience(['engine', 'snowWind']);
    G.fadeTo = 0;
  },
  reset() {
    this.pos = this.checkpoint; this.px = 0; this.vx = 0; this.t = 0; this.left = SR.TIME - (this.checkpoint / SR.DIST) * SR.TIME * 0.8;
    this.slow = 0; this.flash = null; this.done = false; this.steer = 0;
    for (const o of this.course) if (o.z > this.checkpoint) o.hit = false;
  },
  line(key, who, text) {
    if (this.lines[key] || G.speech.length) return;
    this.lines[key] = true;
    say(who, text, { pos: [W / 2, 120] });
  },
  key() {},
  touchStart() {},
  click() {},

  update(dt) {
    if (this.done) return;
    this.t += dt; this.introT += dt;
    if (this.flash && (this.flash.t -= dt) <= 0) this.flash = null;
    this.slow = Math.max(0, this.slow - dt);
    // steering: arrow keys, A and D, or holding a finger or the mouse on either side
    let s = 0;
    if (KEYS.ArrowLeft || KEYS.a || KEYS.A) s -= 1;
    if (KEYS.ArrowRight || KEYS.d || KEYS.D) s += 1;
    for (const k in G.touches) { const tt = G.touches[k]; if (tt) s += tt.x < W / 2 ? -1 : 1; }
    if (!G.touch && G.mouse.down) s += G.mouse.x < W / 2 ? -1 : 1;
    if (this.autopilot) s = this.autoSteer();
    this.steer = clamp(s, -1, 1);
    this.px = clamp(this.px + this.steer * 1.7 * dt, -1, 1);
    const speed = SR.SPEED * (this.slow > 0 ? 0.35 : 1) * (this.introT < 1.5 ? this.introT / 1.5 : 1);
    const before = this.pos;
    this.pos += speed * dt;
    this.left -= dt;
    for (const o of this.course) {
      if (o.hit || o.z <= before || o.z > this.pos) continue;
      if (Math.abs(o.x - this.px) < o.w) { o.hit = true; this.crash(o); }
    }
    if (this.pos >= SR.DIST / 2 && this.checkpoint < SR.DIST / 2) { this.checkpoint = SR.DIST / 2; this.flash = { text: 'Halfway across the fjord!', t: 1.4 }; }
    if (this.t > 1.5) this.line('hold', 'jack', 'Hold on, Colonel. And stop biting my ear.');
    if (this.pos > 1800) this.line('kolar', 'kolar', 'Harrow! That is MY snowmobile!');
    if (this.pos > SR.DIST * 0.63) this.line('bear', 'jack', 'Gunnar! Excuse me. Sorry. Lovely to see you again.');
    if (this.pos > SR.DIST * 0.85) this.line('babushka', 'jack', 'The lead jet. It\'s the big one with its ramp down. It must be.');
    if (this.left <= 0) return this.tooLate();
    if (this.pos >= SR.DIST) this.finish();
  },
  autoSteer() {
    // test autopilot: head for whichever line is clearest for the next hundred metres
    let best = this.px, bestScore = -1e9;
    for (let cx = -0.9; cx <= 0.9; cx += 0.15) {
      let score = -Math.abs(cx - this.px) * 30;
      for (const o of this.course) { const d = o.z - this.pos; if (d > 0 && d < 140 && Math.abs(o.x - cx) < o.w + 0.12) score -= 1000 / (d + 10); }
      if (score > bestScore) { bestScore = score; best = cx; }
    }
    return Math.abs(best - this.px) < 0.03 ? 0 : best > this.px ? 1 : -1;
  },
  crash(o) {
    this.slow = 1; this.left -= SR.HIT; this.crashes++;
    this.flash = { text: { ridge: 'Ice ridge!', crevasse: 'Crevasse!', drum: 'Fuel drum!', seal: 'Sorry, seal!', bear: 'GUNNAR!' }[o.kind] + ' −' + SR.HIT + 's', t: 1, bad: true };
    Sound.sfx(o.kind === 'seal' ? 'honk' : 'crash');
  },
  async tooLate() {
    this.done = true; this.fails++;
    this.flash = { text: 'Eleven o\'clock. The fleet is taking off...', t: 2, bad: true };
    Sound.sfx('sting');
    G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
    notify(this.checkpoint ? 'Too slow. Try again from halfway across.' : 'Too slow. Try again.');
    this.reset();
    G.fadeTo = 0;
  },
  async finish() {
    if (this.done) return;
    this.done = true;
    Sound.sfx('jet');
    G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
    G.speech = [];
    startPlay();
    G.sceneId = null; G.fade = 1;
    await gotoScene('cargo', 700, 960, 1, { instant: true, sfx: 'crash' });
  },

  // ---- drawing ------------------------------------------------------------------------
  project(z, x) {
    const d = z - this.pos, k = SR.K / (d + SR.K);
    return { y: SR.HORIZON + (H - SR.HORIZON) * k, x: W / 2 + (x - this.px) * W * 0.9 * k, k, d };
  },
  draw(ctx) {
    const t = G.t;
    // sky, mountains, and the runway coming closer
    ctx.fillStyle = linGrad(ctx, 0, 0, 0, SR.HORIZON, [[0, '#6a7aa0'], [1, '#e8d8d0']]); ctx.fillRect(0, 0, W, SR.HORIZON);
    const shift = -this.px * 120;
    ctx.fillStyle = '#9aa2b8'; ctx.beginPath(); ctx.moveTo(0, SR.HORIZON); for (let x = -200; x <= W + 200; x += 160) ctx.lineTo(x + shift, SR.HORIZON - 60 - ((x * 37) % 90)); ctx.lineTo(W, SR.HORIZON); ctx.fill();
    const near = clamp(this.pos / SR.DIST, 0, 1), rs = 0.3 + near * 1.2;
    for (let k = 0; k < 6; k++) { const jx = W / 2 + shift * 0.5 + (k - 2.5) * 90 * rs + ((t * 30) % 90), jy = SR.HORIZON - 6; ctx.fillStyle = '#1a1c20'; ctx.beginPath(); ctx.moveTo(jx - 26 * rs, jy); ctx.lineTo(jx + 26 * rs, jy); ctx.lineTo(jx, jy - 10 * rs); ctx.fill(); ctx.fillStyle = '#f0ece2'; ctx.beginPath(); ctx.ellipse(jx, jy - 3 * rs, 16 * rs, 4 * rs, 0, Math.PI, 0); ctx.fill(); }
    ctx.fillStyle = '#5a5e64'; ctx.fillRect(W / 2 + shift * 0.5 + 280 * rs, SR.HORIZON - 26 * rs, 90 * rs, 26 * rs);
    // the ice
    ctx.fillStyle = linGrad(ctx, 0, SR.HORIZON, 0, H, [[0, '#dce4f0'], [1, '#f4f6fa']]); ctx.fillRect(0, SR.HORIZON, W, H - SR.HORIZON);
    ctx.strokeStyle = 'rgba(140,160,190,0.35)'; ctx.lineWidth = 2;
    for (let z = Math.ceil(this.pos / 25) * 25; z < this.pos + 600; z += 25) { const p = this.project(z, 0); ctx.beginPath(); ctx.moveTo(0, p.y); ctx.lineTo(W, p.y); ctx.stroke(); }
    for (const lx of [-2, -1, 1, 2]) { const a = this.project(this.pos, lx), b = this.project(this.pos + 2000, lx); ctx.beginPath(); ctx.moveTo(a.x, H); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    // what's in the way, far to near
    const vis = this.course.filter(o => o.z > this.pos - 2 && o.z < this.pos + 700).sort((a, b) => b.z - a.z);
    for (const o of vis) this.drawThing(ctx, o, t);
    this.drawSled(ctx, t);
    // wool still blowing about
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; for (let k = 0; k < 40; k++) { const x = (k * 263 + t * (300 + (k % 5) * 60)) % W, y = (k * 131 + t * 90) % H; ctx.fillRect(W - x, y, 4, 3); }
    drawVignette(ctx, 0.4);
    this.drawHud(ctx);
  },
  drawThing(ctx, o, t) {
    const p = this.project(o.z, o.x), s = p.k * 4;
    if (p.y > H + 200) return;
    ctx.save(); ctx.translate(p.x, p.y);
    switch (o.kind) {
      case 'ridge': ctx.fillStyle = '#b8c8dc'; poly(ctx, [-120 * s, 0, -80 * s, -60 * s, -20 * s, -90 * s, 40 * s, -70 * s, 120 * s, 0], '#c8d8ec'); poly(ctx, [-20 * s, -90 * s, 40 * s, -70 * s, 60 * s, 0, -30 * s, 0], '#a8b8d0'); break;
      case 'crevasse': ctx.fillStyle = '#1a2a4a'; ctx.beginPath(); ctx.ellipse(0, 0, 140 * s, 16 * s, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#4a6a9a'; ctx.beginPath(); ctx.ellipse(0, -4 * s, 120 * s, 8 * s, 0, 0, 7); ctx.fill(); break;
      case 'drum': ctx.fillStyle = '#c82a2a'; rrect(ctx, -34 * s, -90 * s, 68 * s, 90 * s, 8 * s); ctx.fill(); ctx.fillStyle = '#8a1a1a'; ctx.fillRect(-34 * s, -60 * s, 68 * s, 6 * s); ctx.fillRect(-34 * s, -30 * s, 68 * s, 6 * s); break;
      case 'seal': ellipse(ctx, 0, -18 * s, 70 * s, 22 * s, '#6a6e76'); ellipse(ctx, 60 * s, -30 * s, 22 * s, 18 * s, '#6a6e76'); ellipse(ctx, 70 * s, -34 * s, 3 * s, 3 * s, '#111'); break;
      case 'bear': drawBear(ctx, 0, 0, s * 0.8, t, -1); break;
    }
    ctx.restore();
  },
  drawSled(ctx, t) {
    // the snowmobile from behind: Jack in his wool, the goose on the back
    const x = W / 2, y = H - 60, lean = this.steer * 0.12, bump = Math.sin(t * 22) * 3 + (this.slow > 0 ? Math.sin(t * 40) * 8 : 0);
    ctx.save(); ctx.translate(x, y + bump); ctx.rotate(lean);
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-170, -20, 60, 20); ctx.fillRect(110, -20, 60, 20);
    ctx.fillStyle = '#c82a2a'; rrect(ctx, -130, -110, 260, 100, 30); ctx.fill(); ctx.fillStyle = '#8a1a1a'; ctx.fillRect(-130, -50, 260, 10);
    ctx.fillStyle = '#ffe070'; ctx.fillRect(-100, -40, 30, 14); ctx.fillRect(70, -40, 30, 14);
    ctx.fillStyle = '#f0ece2'; ctx.beginPath(); ctx.ellipse(0, -190, 90, 100, 0, 0, 7); ctx.fill();
    ellipse(ctx, 0, -300, 50, 44, '#f4f2ec'); for (const d of [-1, 1]) ellipse(ctx, d * 46, -290, 16, 28, '#e8e4da');
    ctx.strokeStyle = '#f0ece2'; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-70, -220); ctx.lineTo(-150, -130); ctx.moveTo(70, -220); ctx.lineTo(150, -130); ctx.stroke();
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-170, -140, 340, 14);
    drawGoose(ctx, 40, -96, 1.15, t, -1);
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; for (let k = 0; k < 8; k++) ellipse(ctx, x + (k - 4) * 40 + Math.sin(t * 30 + k) * 10, H - 20 + Math.sin(t * 17 + k) * 6, 30, 10, 'rgba(255,255,255,0.6)');
  },
  drawHud(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(6,10,14,0.75)'; rrect(ctx, 40, 30, 560, 150, 14); ctx.fill();
    ctx.textAlign = 'left'; ctx.fillStyle = '#f0b35b'; ctx.font = `600 22px ${FONT_UI}`; ctx.fillText('ACROSS THE FJORD', 64, 70);
    ctx.fillStyle = '#f0e4c8'; ctx.font = `600 28px ${FONT_UI}`; ctx.fillText('Reach the runway before eleven', 64, 110);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(64, 132, 500, 12);
    ctx.fillStyle = '#f0b35b'; ctx.fillRect(64, 132, 500 * clamp(this.pos / SR.DIST, 0, 1), 12);
    ctx.textAlign = 'right'; ctx.fillStyle = this.left < 12 ? '#ff6a5a' : '#c8d0dc'; ctx.font = `700 ${G.touch ? 30 : 24}px ${FONT_UI}`;
    ctx.fillText(`Take-off in ${Math.max(0, Math.ceil(this.left))}s`, 564, 70);
    if (this.flash) { ctx.textAlign = 'center'; ctx.fillStyle = this.flash.bad ? '#ff8a6a' : '#9ae07a'; ctx.font = `700 ${G.touch ? 50 : 42}px ${FONT_UI}`; ctx.fillText(this.flash.text, W / 2, 260); }
    if (G.touch) { ctx.globalAlpha = 0.5; ctx.textAlign = 'center'; ctx.fillStyle = '#f0e4c8'; ctx.font = `700 40px ${FONT_UI}`; ctx.fillText('◀', 120, H - 140); ctx.fillText('▶', W - 120, H - 140); ctx.globalAlpha = 1; }
    if (this.introT < 8) {
      const a = clamp(Math.min(this.introT, 8 - this.introT), 0, 1);
      ctx.globalAlpha = a; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(6,10,14,0.8)'; rrect(ctx, W / 2 - 560, 300, 1120, 140, 14); ctx.fill();
      ctx.fillStyle = '#f0e4c8'; ctx.font = `500 30px ${FONT_UI}`;
      ctx.fillText(G.touch ? 'Hold the left or right of the screen to steer' : 'LEFT and RIGHT (or A and D) to steer', W / 2, 356);
      ctx.fillText('Every crash costs four seconds. The fleet flies at eleven.', W / 2, 402);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  },
};
