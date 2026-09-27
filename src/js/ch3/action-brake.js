// ---------------------------------------------------------------------------
// The runaway mail van: the action sequence. Uncoupled at the top of the
// Zlatá pass, the van rolls backwards down the mountain. Hold the brake to
// slow it for each bend, but let it go before the brake blocks overheat.
// At the bottom, stop at Zlatá Hora before the buffers.
// ---------------------------------------------------------------------------
const TB_RAIL = 900;       // rail line on screen
const TB_PX = 36;          // pixels per metre of track
const TB_END = 1500;       // metres to the halt
const TB_BENDS = [
  { at: 260, limit: 45 },
  { at: 520, limit: 40 },
  { at: 760, limit: 45, tunnel: [660, 860] },
  { at: 1020, limit: 35 },
  { at: 1240, limit: 40 },
];
const TB_STOP = 25;        // the most you can hit the halt at without going through the buffers

const TrainBrake = {
  layers: null,

  buildLayers() {
    if (this.layers) return;
    const sky = makeCanvas(W, H), s = sky.getContext('2d');
    s.fillStyle = linGrad(s, 0, 0, 0, H, [[0, '#02050c'], [0.6, '#0e1a32'], [1, '#1c2640']]); s.fillRect(0, 0, W, H);
    const r = rng(9); for (let i = 0; i < 240; i++) ellipse(s, r() * W, r() * 560, r() * 1.4 + 0.3, r() * 1.4 + 0.3, `rgba(255,255,255,${0.3 + r() * 0.6})`);
    ellipse(s, 400, 190, 46, 46, '#eef2f6'); glow(s, 400, 190, 300, 'rgba(180,200,255,0.28)');
    const far = makeCanvas(2400, H), f = far.getContext('2d');
    paintMountains(f, 41, 720, 460, '#131f36', 'rgba(215,228,246,0.55)', 0, 2400);
    fog(f, 560, 780, 'rgba(150,170,200,0.2)', 1);
    const mid = makeCanvas(2400, H), m = mid.getContext('2d');
    paintMountains(m, 43, 860, 260, '#0b1424', 'rgba(200,215,240,0.35)', 0, 2400);
    paintPines(m, 7, 870, 220, '#060b16', 0, 2400, 0.8);
    painterly(sky, { strokes: 30000 });
    painterly(far, { strokes: 50000 });
    painterly(mid, { strokes: 60000 });
    this.layers = { sky, far, mid };
  },

  start() {
    this.buildLayers();
    G.mode = 'action'; G.action = this; G.paused = false; G.speech = []; G.overlay = null; G.choices = null;
    G.sceneId = 'runaway';
    this.checkpoint = this.retry ? this.checkpoint : 0;
    this.retry = false;
    this.lines = {};
    this.reset();
    this.snow = new Snow(260, { wind: 500, speed: 120, x0: -600, x1: W, size: 0.9 });
    this.introT = 0;
    Sound.playMusic('brake');
    Sound.setAmbience(['vanCreak', 'snowWind']);
    Sound.setMusicFilter(18000);
    G.fadeTo = 0;
  },
  reset() {
    this.dist = this.checkpoint; this.v = this.checkpoint ? 34 : 18; this.heat = 0; this.fade = 0;
    this.dead = false; this.done = false; this.braking = false; this.t = 0; this.tilt = 0; this.crash = 0;
    this.jack = makeFigure(flag('waiter') ? 'jackWaiter' : 'jackCoat', 1390, TB_RAIL - 44, { id: 'jack', scale: 1.05, seed: 1, facing: -1 });
    this.ilse = makeFigure('ilse', 850, TB_RAIL - 72, { id: 'ilse', scale: 0.95, seed: 3, facing: 1, arm: 'hug' });
    this.anicka = makeFigure('anicka', 930, TB_RAIL - 72, { id: 'anicka', scale: 0.95 * 0.62, seed: 23, facing: 1, arm: 'rest' });
    this.passed = TB_BENDS.filter(b => b.at <= this.dist).length;
    this.squeal = false;
  },
  bendAhead() { return TB_BENDS[this.passed]; },
  inTunnel(d = this.dist) { return TB_BENDS.some(b => b.tunnel && d > b.tunnel[0] && d < b.tunnel[1]); },

  // One line from the van, once per run: said over the noise, not waited for.
  line(key, who, text) {
    if (this.lines[key] || G.speech.length) return;
    this.lines[key] = true;
    const pos = who === 'jack' ? [1390, 560] : [880, 520];
    say(who, text, { pos });
  },

  key() {},
  btn: { brake: [W - 330, H - 330, 280, 280] },
  inBtn(x, y) { const [bx, by, bw, bh] = this.btn.brake; return x > bx && x < bx + bw && y > by && y < by + bh; },
  held() {
    if (KEYS[' '] || KEYS.ArrowDown || KEYS.s || KEYS.S || KEYS.b || KEYS.B) return true;
    if (G.touch) return Object.values(G.touches || {}).some(t => this.inBtn(t.x, t.y) || t.x > W * 0.45);
    return !!G.mouse.down;
  },

  update(dt) {
    if (this.done) return;
    this.t += dt; this.introT += dt;
    this.snow.update(dt);
    if (this.dead) { this.crash += dt; return; }

    const wasBraking = this.braking;
    this.braking = this.held() && this.fade <= 0;
    if (this.braking && !wasBraking) Sound.sfx('squeal');
    // gravity: steep all the way down, flattening out for the halt
    const grade = this.dist > TB_END - 220 ? 1.5 : 7.5;
    this.v += grade * dt;
    if (this.braking) {
      this.v -= 22 * dt;
      this.heat += 30 * dt;
      if (this.heat >= 100) {
        this.heat = 100; this.fade = 2.4; this.braking = false;
        Sound.sfx('whoosh');
        this.line('fade', 'jack', 'The brake blocks are on fire! Give them a second!');
      }
    } else this.heat = Math.max(0, this.heat - 20 * dt);
    if (this.fade > 0) { this.fade -= dt; if (this.fade <= 0) this.heat = 55; }
    this.v = clamp(this.v, this.dist > TB_END - 220 ? 6 : 0, 140);
    this.dist += this.v / 3.6 * dt;
    this.jack.arm = this.braking ? 'wheel' : 'rest';
    this.anicka.arm = this.v > 70 ? 'panic' : 'rest';
    this.tilt = lerp(this.tilt, this.braking ? 0.004 * this.v / 40 : 0, 0.1);

    // bends: over the limit and the van leaves the rails
    const b = this.bendAhead();
    if (b && this.dist >= b.at) {
      this.passed++;
      if (this.v > b.limit + 3) return this.fail('bend');
      Sound.sfx('clank');
      this.checkpoint = b.at + 20;
      if (this.passed === 1) this.line('b1', 'ilse', 'Jack, how fast are we going?');
      if (this.passed === 2) this.line('b2', 'anicka', 'Again! Again!');
      if (this.passed === 3) this.line('b3', 'jack', 'Ilse, is that a goose on the roof?');
      if (this.passed === 4) this.line('b4', 'ilse', 'Don\'t look at her, Jack. It only encourages her.');
      if (this.passed === 5) this.line('b5', 'ilse', 'I think I left my stomach at the last bend.');
    }
    if (this.v > 75) this.line('fast', 'anicka', 'Faster, Mister Jack!');
    if (this.v > 90) this.line('faster', 'ilse', 'Not faster! Slower! Slower is the good one!');
    if (this.passed === 1 && this.lines.b1 && !G.speech.length) this.line('b1b', 'jack', 'About sixty. Backwards.');

    // the halt: stop before the buffers
    if (this.dist >= TB_END) {
      if (this.v > TB_STOP) return this.fail('buffers');
      return this.finish();
    }
  },

  async fail(why) {
    if (this.dead) return;
    this.dead = true; this.crash = 0; this.why = why; this.fails = (this.fails || 0) + 1;
    Sound.sfx('clank'); Sound.sfx('thud'); Sound.sfx('whoosh');
    this.failText = why === 'bend'
      ? 'Too fast for the bend! Brake before the speed sign, and keep under the limit.'
      : 'Straight through the buffers, the station master\'s hut and his breakfast. Stop at the halt!';
    await wait(2.2);
    G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
    G.speech = [];
    if (why === 'buffers') this.checkpoint = TB_BENDS[TB_BENDS.length - 1].at + 20;
    this.reset();
    this.failText = null;
    G.fadeTo = 0;
  },
  async finish() {
    if (this.done) return;
    this.done = true;
    Sound.sfx('squeal');
    // roll gently to a stop against the buffers
    const v0 = this.v, t0 = G.t;
    await waitUntil(() => { const p = clamp((G.t - t0) / 1.4, 0, 1); this.v = v0 * (1 - p); this.dist += this.v / 3.6 * 0.016; return p >= 1; });
    this.v = 0; this.braking = false; this.jack.arm = 'rest';
    Sound.sfx('clank');
    await wait(0.8);
    G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
    G.mode = 'play'; G.paused = false; G.speech = []; G.choices = null; G.overlay = null;
    G.sceneId = null; G.fade = 1;
    await gotoScene('halt', 760, 960, 1, { instant: true });
  },

  // the world scrolls right to left: the van rolls towards the right of the screen
  draw(ctx) {
    const L = this.layers, t = G.t, d = this.dist;
    const cam = d * TB_PX;
    ctx.drawImage(L.sky, 0, 0);
    // dawn creeps in as we come down the mountain
    const dawn = clamp(d / TB_END, 0, 1);
    ctx.save(); ctx.globalAlpha = dawn * 0.75;
    ctx.fillStyle = linGrad(ctx, 0, 0, 0, H, [[0, 'rgba(60,60,120,0.6)'], [0.55, 'rgba(210,120,130,0.8)'], [0.8, 'rgba(250,190,120,0.9)'], [1, 'rgba(255,220,170,0.9)']]);
    ctx.fillRect(0, 0, W, H); ctx.restore();
    const farOff = (cam * 0.08) % 2400, midOff = (cam * 0.3) % 2400;
    for (let k = 0; k < 2; k++) ctx.drawImage(L.far, farOff - k * 2400 + (W - 2400), 0);
    for (let k = 0; k < 2; k++) ctx.drawImage(L.mid, midOff - k * 2400 + (W - 2400), 0);
    // the embankment and the rails
    ctx.fillStyle = linGrad(ctx, 0, TB_RAIL - 10, 0, H, [[0, '#dfe6ee'], [0.2, '#9aa6b6'], [1, '#2a3040']]);
    ctx.fillRect(0, TB_RAIL - 4, W, H - TB_RAIL + 4);
    const sp = (cam % 60);
    ctx.fillStyle = '#3a3026'; for (let x = -60 + sp; x < W + 60; x += 60) ctx.fillRect(x, TB_RAIL + 4, 34, 12);
    ctx.fillStyle = '#6a7078'; ctx.fillRect(0, TB_RAIL - 2, W, 6);
    // trackside: the van's rear end (leading, on the right) is at x=1480; track ahead is further right
    const sx = m => 1480 + (m - d) * TB_PX;
    for (const b of TB_BENDS) if (b.tunnel) this.drawTunnel(ctx, sx(b.tunnel[0]), sx(b.tunnel[1]), false);
    for (let m = Math.floor((d - 45) / 25) * 25; m < d + 15; m += 25) {
      const x = sx(m); if (x < -40 || x > W + 40 || this.inTunnel(m)) continue;
      ctx.fillStyle = '#10141c'; ctx.fillRect(x, TB_RAIL - 380, 10, 380); ctx.fillRect(x - 30, TB_RAIL - 370, 70, 8);
    }
    for (const b of TB_BENDS) this.drawBendSign(ctx, sx(b.at), b);
    this.drawHalt(ctx, sx(TB_END));
    // the van, and everyone in it
    this.drawVan(ctx, t);
    for (const b of TB_BENDS) if (b.tunnel) this.drawTunnel(ctx, sx(b.tunnel[0]), sx(b.tunnel[1]), true);
    if (!this.inTunnel()) this.snow.draw(ctx);
    // speed blur lines
    ctx.save(); ctx.globalAlpha = clamp((this.v - 40) / 80, 0, 0.35); ctx.strokeStyle = '#e8eef6'; ctx.lineWidth = 2;
    const r = rng(Math.floor(t * 20)); for (let i = 0; i < 12; i++) { const y = 200 + r() * 700, x = r() * W; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 120 - this.v, y); ctx.stroke(); }
    ctx.restore();
    if (this.dead) {
      ctx.save(); ctx.globalAlpha = clamp(1 - this.crash, 0, 0.8); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
    drawVignette(ctx, 0.8);
    drawGrain(ctx, 0.06);
    this.drawHud(ctx);
  },
  drawVan(ctx, t) {
    const shake = this.dead ? 0 : Math.sin(t * 40) * this.v / 60 + (this.braking ? Math.sin(t * 90) * 1.5 : 0);
    const off = this.dead ? { x: this.crash * 500, y: this.crash * this.crash * 600, r: this.crash * 0.5 } : { x: 0, y: 0, r: 0 };
    ctx.save();
    ctx.translate(900 + off.x, TB_RAIL + shake + off.y); ctx.rotate(off.r + this.tilt);
    ctx.translate(-900, -TB_RAIL);
    const x0 = 360, x1 = 1320, top = TB_RAIL - 420, bot = TB_RAIL - 60;
    // body
    ctx.fillStyle = linGrad(ctx, 0, top, 0, bot, [[0, '#4a4e44'], [1, '#1a1c18']]); rrect(ctx, x0, top, x1 - x0, bot - top, 18); ctx.fill();
    snowLedge(ctx, x0, top + 2, x1 - x0, 16);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 3; for (let x = x0 + 30; x < x1; x += 40) { ctx.beginPath(); ctx.moveTo(x, top + 20); ctx.lineTo(x, bot - 20); ctx.stroke(); }
    ctx.fillStyle = '#d8c89a'; ctx.font = `700 40px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('POŠTA', 1150, top + 140);
    ctx.save(); ctx.translate(520, top + 120); ctx.fillStyle = '#b31c2e'; ctx.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? 16 : 40, a = -Math.PI / 2 + k / 10 * Math.PI * 2; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.fill(); ctx.restore();
    // the open side door, lamplight, Ilse and Anička holding on
    const dx = 760, dw = 260;
    ctx.save(); ctx.beginPath(); ctx.rect(dx, top + 40, dw, bot - top - 50); ctx.clip();
    ctx.fillStyle = '#2a1a0a'; ctx.fillRect(dx, top, dw, bot - top);
    glow(ctx, dx + dw / 2, top + 100, 220, 'rgba(255,190,110,0.55)', 0.85 + 0.15 * Math.sin(t * 9));
    const light = { ambient: 'rgba(30,16,4,0.3)', key: 'rgba(255,180,90,0.4)', keyX: dx + dw / 2 };
    drawFigure(ctx, this.anicka, t, light);
    drawFigure(ctx, this.ilse, t, light);
    ctx.restore();
    ctx.strokeStyle = '#6a6e72'; ctx.lineWidth = 6; ctx.strokeRect(dx, top + 40, dw, bot - top - 50);
    // the rear platform with its railing and the brake wheel
    ctx.fillStyle = '#1a1c18'; ctx.fillRect(x1, bot - 20, 160, 22);
    ctx.strokeStyle = '#5a6068'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x1 + 150, bot - 20); ctx.lineTo(x1 + 150, bot - 190); ctx.lineTo(x1, bot - 190); ctx.stroke();
    ctx.fillStyle = '#3a3e44'; ctx.fillRect(x1 + 20, bot - 180, 14, 180);
    ctx.save(); ctx.translate(x1 + 27, bot - 182); ctx.scale(0.35, 1);
    ctx.rotate(this.braking ? t * 6 : 0);
    ctx.strokeStyle = '#9e1f28'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, 56, 0, 7); ctx.stroke();
    ctx.lineWidth = 6; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-56 * Math.cos(k), -56 * Math.sin(k)); ctx.lineTo(56 * Math.cos(k), 56 * Math.sin(k)); ctx.stroke(); }
    ctx.restore();
    drawFigure(ctx, { ...this.jack, x: x1 + 84, y: bot - 2, facing: -1 }, t, { ambient: 'rgba(6,14,30,0.35)', key: 'rgba(170,190,230,0.3)', keyX: W });
    // a stowaway on the roof, facing into the wind
    const flap = this.v > 60 ? Math.sin(t * 30) * 0.08 : 0;
    ctx.save(); ctx.translate(1180, top + 10); ctx.rotate(flap); drawGoose(ctx, 0, 0, 0.9, this.v > 5 ? t * 0.3 : 0, 1); ctx.restore();
    // tail lamp
    glow(ctx, x1 + 150, bot - 210, 50, 'rgba(255,40,30,0.9)', 0.7 + 0.3 * Math.sin(t * 6)); ellipse(ctx, x1 + 150, bot - 210, 10, 10, '#ff5a4a');
    // wheels and bogies, sparks when the brakes bite
    ctx.fillStyle = '#101010'; ctx.fillRect(x0 + 40, bot - 10, x1 - x0 - 80, 20);
    const spin = this.dist * 3;
    for (const wx of [x0 + 110, x0 + 230, x1 - 230, x1 - 110]) {
      ellipse(ctx, wx, TB_RAIL - 34, 36, 36, '#121212'); ellipse(ctx, wx, TB_RAIL - 34, 12, 12, '#5a5a5a');
      ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(wx + Math.cos(spin) * 30, TB_RAIL - 34 + Math.sin(spin) * 30); ctx.lineTo(wx - Math.cos(spin) * 30, TB_RAIL - 34 - Math.sin(spin) * 30); ctx.stroke();
      if (this.braking && !this.dead) {
        for (let k = 0; k < 6; k++) { const a = Math.random() * 1.2, l = 20 + Math.random() * 60; ctx.strokeStyle = `rgba(255,${160 + Math.random() * 80 | 0},60,0.9)`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(wx - 30, TB_RAIL - 4); ctx.lineTo(wx - 30 - Math.cos(a) * l, TB_RAIL - 4 - Math.sin(a) * l); ctx.stroke(); }
        glow(ctx, wx - 30, TB_RAIL - 6, 50, 'rgba(255,170,60,0.7)');
      }
      if (this.heat > 70 || this.fade > 0) { // smoking brake blocks
        for (let k = 0; k < 3; k++) { const p = (t * 0.9 + k / 3 + wx) % 1; ctx.save(); ctx.globalAlpha = (1 - p) * 0.35; ellipse(ctx, wx - 40 - p * 160, TB_RAIL - 40 - p * 120, 20 + p * 50, 14 + p * 30, '#9aa0a8'); ctx.restore(); }
      }
    }
    ctx.restore();
  },
  drawBendSign(ctx, x, b) {
    if (x < -120 || x > W + 120) return;
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x - 5, TB_RAIL - 300, 10, 300);
    ctx.fillStyle = '#f0ece4'; ctx.beginPath(); ctx.arc(x, TB_RAIL - 330, 56, 0, 7); ctx.fill();
    ctx.strokeStyle = '#c0202a'; ctx.lineWidth = 12; ctx.stroke();
    ctx.fillStyle = '#111'; ctx.font = `800 46px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText(b.limit, x, TB_RAIL - 314);
  },
  drawTunnel(ctx, xa, xb, front) {
    if (xb < -200 || xa > W + 200) return;
    const l = Math.max(xa, -10), r = Math.min(xb, W + 10);
    if (!front) {
      // inside the mountain: bare rock and a lamp every so often
      ctx.fillStyle = '#07090e'; ctx.fillRect(l, 0, r - l, TB_RAIL + 20);
      ctx.fillStyle = '#14161c'; ctx.fillRect(l, TB_RAIL - 520, r - l, 520);
      for (let x = xa + 120; x < xb; x += 300) if (x > -60 && x < W + 60) { glow(ctx, x, TB_RAIL - 470, 160, 'rgba(255,190,110,0.35)'); ellipse(ctx, x, TB_RAIL - 470, 10, 10, '#ffd08a'); }
      return;
    }
    // stone portals at each end, the mountain above
    ctx.fillStyle = '#0a0e16'; ctx.fillRect(l, 0, r - l, TB_RAIL - 540);
    for (const x of [xa, xb]) {
      if (x < -200 || x > W + 200) continue;
      ctx.fillStyle = '#3a3a42'; ctx.fillRect(x - 40, TB_RAIL - 560, 80, 560);
      ctx.fillStyle = '#4a4a54'; ctx.fillRect(x - 56, TB_RAIL - 600, 112, 50);
      snowLedge(ctx, x - 56, TB_RAIL - 600, 112, 14);
    }
  },
  drawHalt(ctx, x) {
    if (x < -900 || x > W + 900) return;
    // a low platform, a wooden hut, the sign, and the buffers at the end of the line
    ctx.fillStyle = '#b8b0c0'; ctx.fillRect(x - 800, TB_RAIL - 40, 800, 40);
    ctx.fillStyle = '#6a3a1a'; ctx.fillRect(x - 620, TB_RAIL - 280, 240, 240); poly(ctx, [x - 640, TB_RAIL - 280, x - 360, TB_RAIL - 280, x - 500, TB_RAIL - 360], '#3a1a0a');
    ctx.fillStyle = 'rgba(255,210,130,0.85)'; ctx.fillRect(x - 590, TB_RAIL - 220, 60, 70);
    ctx.fillStyle = '#e8e0cc'; ctx.fillRect(x - 330, TB_RAIL - 330, 300, 56); ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 4; ctx.strokeRect(x - 330, TB_RAIL - 330, 300, 56);
    ctx.fillStyle = '#1a1a1a'; ctx.font = `700 30px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('ZLATÁ HORA', x - 180, TB_RAIL - 292);
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x - 190, TB_RAIL - 274, 8, 234);
    // buffer stop
    ctx.fillStyle = '#b31c2e'; ctx.fillRect(x + 20, TB_RAIL - 150, 60, 150);
    ctx.fillStyle = '#e8e0cc'; ctx.fillRect(x + 20, TB_RAIL - 110, 60, 16);
    ctx.fillStyle = '#2a2a2a'; ellipse(ctx, x + 10, TB_RAIL - 120, 16, 16, '#2a2a2a'); ellipse(ctx, x + 10, TB_RAIL - 60, 16, 16, '#2a2a2a');
  },
  drawHud(ctx) {
    ctx.save();
    const b = this.bendAhead(), dist = b ? b.at - this.dist : Infinity;
    // speedometer
    const over = b && dist < 200 && this.v > b.limit;
    ctx.fillStyle = 'rgba(6,10,14,0.7)'; rrect(ctx, 50, 170, 330, 200, 16); ctx.fill();
    ctx.textAlign = 'left'; ctx.fillStyle = '#cfc6b4'; ctx.font = `600 22px ${FONT_UI}`; ctx.fillText('SPEED', 76, 208);
    ctx.fillStyle = over ? '#ff5a4a' : '#f0e4c8'; ctx.font = `800 96px ${FONT_UI}`; ctx.fillText(Math.round(this.v), 72, 300);
    ctx.fillStyle = '#cfc6b4'; ctx.font = `600 28px ${FONT_UI}`; ctx.fillText('km/h', 250, 300);
    // brake heat
    ctx.fillStyle = '#cfc6b4'; ctx.font = `600 20px ${FONT_UI}`; ctx.fillText(this.fade > 0 ? 'BRAKE OVERHEATED!' : 'BRAKE HEAT', 76, 336);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(76, 346, 280, 12);
    ctx.fillStyle = this.fade > 0 ? (Math.sin(G.t * 20) > 0 ? '#ff3a2a' : '#6a1a14') : this.heat > 70 ? '#ff7a3a' : '#f0b35b';
    ctx.fillRect(76, 346, 280 * this.heat / 100, 12);
    // the next bend
    if (b && dist < 260 && !this.dead) {
      const a = over ? 0.6 + 0.4 * Math.sin(G.t * 14) : 1;
      ctx.globalAlpha = a; ctx.fillStyle = over ? 'rgba(160,20,20,0.8)' : 'rgba(6,10,14,0.7)'; rrect(ctx, W / 2 - 330, 170, 660, 90, 14); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `700 40px ${FONT_UI}`; ctx.textAlign = 'center';
      ctx.fillText(`BEND IN ${Math.max(0, Math.round(dist))} m · LIMIT ${b.limit}`, W / 2, 230);
      ctx.globalAlpha = 1;
    } else if (!b && TB_END - this.dist < 320 && !this.dead && !this.done) {
      const over2 = this.v > TB_STOP;
      ctx.fillStyle = over2 ? 'rgba(160,20,20,0.8)' : 'rgba(6,10,14,0.7)'; rrect(ctx, W / 2 - 380, 170, 760, 90, 14); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `700 40px ${FONT_UI}`; ctx.textAlign = 'center';
      ctx.fillText(`ZLATÁ HORA IN ${Math.max(0, Math.round(TB_END - this.dist))} m · STOP BELOW ${TB_STOP}`, W / 2, 230);
    }
    // progress
    const p = clamp(this.dist / TB_END, 0, 1);
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(64, H - 60, 300, 4);
    ctx.fillStyle = '#f0b35b'; ctx.fillRect(64, H - 60, 300 * p, 4);
    ctx.font = `600 18px ${FONT_UI}`; ctx.fillStyle = '#cfc6b4'; ctx.fillText('DOWN TO ZLATÁ HORA', 64, H - 72);
    if (this.introT < 10) {
      const a = clamp(Math.min(this.introT, 10 - this.introT), 0, 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(6,10,14,0.75)'; rrect(ctx, W / 2 - 560, H - 330, 1120, 150, 14); ctx.fill();
      ctx.textAlign = 'center'; ctx.fillStyle = '#f0b35b'; ctx.font = `600 24px ${FONT_UI}`;
      ctx.fillText('RUNAWAY! BRAKE FOR THE BENDS', W / 2, H - 288);
      ctx.fillStyle = '#f0e4c8'; ctx.font = `500 30px ${FONT_UI}`;
      ctx.fillText(G.touch ? 'Hold BRAKE to slow down, and let go before the brake overheats' : 'Hold SPACE (or the mouse button) to brake, and let go before it overheats', W / 2, H - 244);
      ctx.fillText('Keep under the limit on each bend, and stop at the halt at the bottom', W / 2, H - 204);
      ctx.globalAlpha = 1;
    }
    if (this.failText) drawLabel(ctx, this.failText, W / 2, H / 2);
    if (G.touch) {
      const [bx, by, bw, bh] = this.btn.brake;
      ctx.globalAlpha = this.braking ? 0.8 : 0.45;
      ctx.fillStyle = this.fade > 0 ? 'rgba(80,10,10,0.8)' : 'rgba(8,12,18,0.8)'; ctx.beginPath(); ctx.arc(bx + bw / 2, by + bh / 2, bw / 2, 0, 7); ctx.fill();
      ctx.strokeStyle = '#f0e4c8'; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = '#f0e4c8'; ctx.textAlign = 'center'; ctx.font = `800 54px ${FONT_UI}`; ctx.fillText('BRAKE', bx + bw / 2, by + bh / 2 + 18);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  },
};
