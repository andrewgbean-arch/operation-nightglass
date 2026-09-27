// ---------------------------------------------------------------------------
// The gondola chase — the action sequence, seen side-on. Jack rows Toni's
// gondola down the canals to the Rialto with Kolar's motor launch behind him.
// Row in rhythm (a stroke when the marker is in the gold), duck under the low
// bridges, and don't let the launch catch up. The goose rides in the bow.
// ---------------------------------------------------------------------------
const GR = {
  PX: 60,              // pixels per metre along the canal
  LEN: 480,            // metres to the Rialto
  BRIDGES: [90, 185, 270, 345, 415],
  JX: 900, WATER: 812, // Jack's place on screen, and the waterline
  PERIOD: 1.2,         // seconds for one full swing of the stroke marker
  ZONE: 0.75,          // the marker is in the gold beyond this
  PULL: 3.2, DRAG: 0.284, VMAX: 12,
};

const GondolaRun = {
  layer: null,

  buildLayer() {
    if (this.layer) return;
    // one long strip of palazzi at night, tiled as the canal slides past
    const cv = makeCanvas(W * 2, 820), x = cv.getContext('2d');
    x.fillStyle = linGrad(x, 0, 0, 0, 820, [[0, '#040614'], [0.7, '#141e3a'], [1, '#1e2440']]); x.fillRect(0, 0, W * 2, 820);
    const r = rng(161);
    for (let i = 0; i < 160; i++) ellipse(x, r() * W * 2, r() * 260, r() + 0.4, r() + 0.4, `rgba(255,255,255,${0.3 + r() * 0.5})`);
    const cols = ['#3a2a30', '#2a2230', '#3a3040', '#302628', '#282a38'];
    let px = -20, k = 0;
    while (px < W * 2) {
      const w = 260 + r() * 220, h = 380 + r() * 260;
      paintPalazzo(x, px, 820, w, h, cols[k % cols.length], 170 + k, 0.45);
      px += w + 6 + r() * 30; k++;
    }
    paintCampanile(x, 1500, 820, 620, '#1a1a2a');
    painterly(cv, { strokes: 26000 });
    this.layer = cv;
  },

  start() {
    this.buildLayer();
    G.mode = 'action'; G.action = this; G.paused = false; G.speech = []; G.overlay = null; G.choices = null;
    G.sceneId = 'gondola';
    this.lines = {};
    this.introT = 0;
    this.reset();
    Sound.playMusic('chase');
    Sound.setAmbience(['water', 'launch']);
    Sound.setMusicFilter(18000);
    G.fadeTo = 0;
  },
  reset() {
    this.dist = 0; this.v = 0; this.t = 0;
    this.gap = 45; this.launchWait = 3;
    this.stun = 0; this.duck = 0; this.inZone = false; this.stroked = false; this.cool = 0;
    this.bonked = {}; this.flash = null; this.oar = 0;
    this.dead = false; this.done = false; this.failText = null;
    this.jack = makeFigure('jackGondolier', GR.JX, GR.WATER - 10, { id: 'jack', scale: 0.8, facing: 1, seed: 1, arm: 'push' });
    this.kolar = makeFigure('kolar', 0, 0, { id: 'kolar', scale: 0.8, facing: 1, seed: 17, arm: 'point', mask: 'domino', maskColor: '#1a1a1a' });
    this.driver = makeFigure('soldier', 0, 0, { id: 'soldier1', scale: 0.8, facing: 1, seed: 19, arm: 'wheel', pose: 'sit' });
  },
  line(key, who, text) {
    if (this.lines[key] || G.speech.length) return;
    this.lines[key] = true;
    say(who, text, { pos: [W / 2, 120] });
  },

  // ---- input -------------------------------------------------------------------------
  marker() { return 0.5 - 0.5 * Math.cos(this.t * Math.PI * 2 / GR.PERIOD); },
  ducking() {
    if (KEYS.ArrowDown || KEYS.s || KEYS.S || this.autoDuck) return true;
    return Object.values(G.touches || {}).some(t => this.onDuckBtn(t.x, t.y));
  },
  duckBtn() { return { x: W - 250, y: H - 250, r: 110 }; },
  onDuckBtn(x, y) { const b = this.duckBtn(); return Math.hypot(x - b.x, y - b.y) < b.r + 20; },
  stroke() {
    if (this.dead || this.done || this.stun > 0 || this.duck > 0.5 || this.cool > 0) return;
    this.cool = 0.25;
    if (this.inZone && !this.stroked) {
      this.stroked = true;
      this.v = Math.min(GR.VMAX, this.v + GR.PULL);
      this.oar = 1;
      this.flash = { text: 'Good stroke!', t: 0.5, good: true };
      Sound.sfx('row');
    } else {
      this.v = Math.min(GR.VMAX, this.v + 0.4);
      this.oar = 0.5;
      this.flash = { text: 'Splash!', t: 0.5, good: false };
      Sound.sfx('splash');
    }
  },
  key(k, down) {
    if (!down) return;
    if (k === ' ' || k === 'Enter' || k === 'ArrowUp' || k === 'w' || k === 'W') this.stroke();
  },
  touchStart(x, y) { if (!this.onDuckBtn(x, y)) this.stroke(); },
  click(x, y) { this.stroke(); },

  // ---- the chase ---------------------------------------------------------------------
  update(dt) {
    if (this.done) return;
    this.t += dt; this.introT += dt;
    if (this.flash && (this.flash.t -= dt) <= 0) this.flash = null;
    if (this.dead) return;
    this.cool = Math.max(0, this.cool - dt);
    this.oar = Math.max(0, this.oar - dt * 2);
    const m = this.marker(), was = this.inZone;
    this.inZone = m > GR.ZONE;
    if (!this.inZone && was) this.stroked = false;
    // test autopilot: row on the beat and duck for every bridge
    if (this.auto) {
      const next = GR.BRIDGES.find(b => b - this.dist > -2.5);
      this.autoDuck = next !== undefined && next - this.dist < 5;
      if (this.inZone && !this.stroked && m > 0.9) this.stroke();
    }
    this.duck = clamp(this.duck + (this.ducking() ? dt * 6 : -dt * 5), 0, 1);
    this.jack.crouch = this.duck;
    if (this.stun > 0) this.stun -= dt;
    this.v *= Math.exp(-GR.DRAG * dt);
    this.dist += this.v * dt;
    // the launch: slower than a good gondolier, faster than a bad one, and getting faster
    if ((this.launchWait -= dt) <= 0) this.gap -= (5.6 + Math.min(1.2, this.t * 0.015)) * dt;
    this.gap += this.v * dt;
    // low bridges
    for (const b of GR.BRIDGES) {
      if (this.bonked[b]) continue;
      if (Math.abs(b - this.dist) < 1.4 && this.duck < 0.6) {
        this.bonked[b] = true;
        this.v = 0; this.stun = 1;
        Sound.sfx('thud');
        Sound.sfx('honk');
        this.flash = { text: 'Bonk! Duck under the bridges!', t: 1.2, good: false };
        this.line('bonk' + b, 'jack', 'Ow! Who puts a bridge there?');
      }
    }
    if (this.gap <= 0) return this.fail();
    if (this.t > 1) this.line('toni', 'jack', 'Sorry, Toni! I\'ll bring her back!');
    if (this.t > 5) this.line('after', 'kolar', 'After him! He is only a gondolier!');
    if (this.dist > 150) this.line('mind', 'jack', 'Mind your heads! Gondola coming through!');
    if (this.dist > 300) this.line('fast', 'kolar', 'How is a gondolier so fast?');
    if (this.dist > 330) this.line('fear', 'jack', 'Fear, mostly!');
    if (this.dist >= GR.LEN) this.finish();
  },
  async fail() {
    if (this.dead) return;
    this.dead = true;
    this.fails = (this.fails || 0) + 1;
    Sound.sfx('thud');
    this.failText = 'Caught by Kolar! Row when the marker is in the gold, and duck under the bridges.';
    await wait(1.8);
    G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
    G.speech = [];
    this.reset();
    this.introT = 8;
    G.fadeTo = 0;
  },
  async finish() {
    if (this.done) return;
    this.done = true;
    G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
    G.speech = [];
    await TextScreen.play(DAWN_PAGES, 'dawn');
    startPlay();
    G.sceneId = null; G.fade = 1;
    await gotoScene('rialto', 300, 960, 1, { instant: true });
  },

  // ---- drawing -------------------------------------------------------------------------
  sx(m) { return GR.JX + (m - this.dist) * GR.PX; },
  draw(ctx) {
    const t = G.t;
    // the palazzi slide past at half speed
    const off = (this.dist * GR.PX * 0.5) % (W * 2);
    ctx.drawImage(this.layer, -off, 0); ctx.drawImage(this.layer, W * 2 - off, 0);
    // water
    ctx.fillStyle = linGrad(ctx, 0, 780, 0, H, [[0, '#1a2240'], [1, '#04060c']]); ctx.fillRect(0, 780, W, H - 780);
    const r = rng(9);
    for (let i = 0; i < 90; i++) {
      const y = 790 + r() * 290, sp = 0.4 + (y - 790) / 290;
      const x = ((r() * W * 2 - this.dist * GR.PX * sp) % (W * 1.2) + W * 1.2) % (W * 1.2) - 100;
      ctx.fillStyle = `rgba(255,210,140,${0.06 + r() * 0.18})`; ctx.fillRect(x, y, 20 + r() * 70, 2);
    }
    // Kolar's launch, behind
    const lx = GR.JX - 300 - this.gap * GR.PX * 0.3;
    if (lx > -500) this.drawLaunch(ctx, lx, t);
    // the gondola, Jack at the stern, the goose in the bow
    const bob = Math.sin(t * 2.2) * 3;
    paintGondola(ctx, GR.JX + 250, GR.WATER + 4 + bob, 1, 1);
    drawGoose(ctx, GR.JX + 470, GR.WATER - 30 + bob, 0.34, this.v > 1 ? 0 : t, 1);
    this.jack.y = GR.WATER - 12 + bob;
    drawFigure(ctx, this.jack, t, { ambient: 'rgba(6,10,30,0.35)', key: 'rgba(255,210,150,0.3)', keyX: W });
    // the oar, sweeping back on each stroke
    const sweep = this.oar * 60, hx = GR.JX + 26, hy = GR.WATER - 100 * (1 - this.duck * 0.4) + bob;
    ctx.strokeStyle = '#2a1a0e'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hx + 30, hy - 40); ctx.lineTo(hx - 70 - sweep, GR.WATER + 40); ctx.stroke();
    // bridges, in front
    for (const b of GR.BRIDGES) { const x = this.sx(b); if (x > -300 && x < W + 300) this.drawBridge(ctx, x, b); }
    // the Rialto, at the finish
    const fx = this.sx(GR.LEN + 6);
    if (fx < W + 700) this.drawRialtoEnd(ctx, fx);
    drawVignette(ctx, 0.6);
    drawGrain(ctx, 0.05);
    this.drawHud(ctx);
  },
  drawLaunch(ctx, x, t) {
    const y = GR.WATER + Math.sin(t * 3) * 2;
    ctx.fillStyle = '#6a4a2a'; ctx.beginPath(); ctx.moveTo(x - 200, y - 50); ctx.lineTo(x + 180, y - 50); ctx.quadraticCurveTo(x + 230, y - 40, x + 220, y - 10); ctx.lineTo(x - 190, y + 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f0ece4'; ctx.fillRect(x - 196, y - 56, 390, 8);
    ctx.fillStyle = '#9e1f28'; ctx.fillRect(x - 200, y - 30, 380, 6);
    // a bow wave and a wake
    for (let k = 0; k < 6; k++) ellipse(ctx, x + 210 - k * 12, y + 2, 18 - k * 2, 6, 'rgba(240,245,255,0.35)');
    for (let k = 0; k < 8; k++) ellipse(ctx, x - 220 - k * 40 + Math.sin(t * 8 + k) * 6, y + 4, 30, 5, 'rgba(240,245,255,0.18)');
    this.driver.x = x - 110; this.driver.y = y - 40; this.driver.facing = 1;
    this.kolar.x = x + 60; this.kolar.y = y - 46; this.kolar.facing = 1;
    const light = { ambient: 'rgba(6,10,30,0.35)', key: 'rgba(255,210,150,0.25)', keyX: W };
    drawFigure(ctx, this.driver, t, light);
    drawFigure(ctx, this.kolar, t, light);
    // a searchlight on the bow
    glow(ctx, x + 200, y - 70, 90, 'rgba(255,250,210,0.5)');
  },
  drawBridge(ctx, x, b) {
    // a little stone bridge: one arch over the water, steps up and over, and an
    // opening just too low for a standing gondolier
    const under = 690, top = 560;
    ctx.fillStyle = '#6a5a50';
    ctx.beginPath(); ctx.moveTo(x - 240, 800); ctx.quadraticCurveTo(x - 200, top, x, top); ctx.quadraticCurveTo(x + 200, top, x + 240, 800);
    ctx.lineTo(x + 150, 800); ctx.quadraticCurveTo(x + 150, under, x, under); ctx.quadraticCurveTo(x - 150, under, x - 150, 800); ctx.closePath(); ctx.fill();
    texture(ctx, x - 240, top, 480, 240, '#3a302a', 80, 18, b, 0.3);
    // voussoirs round the arch, and the steps in silhouette on top
    ctx.strokeStyle = '#8a7a6c'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - 150, 800); ctx.quadraticCurveTo(x - 150, under, x, under); ctx.quadraticCurveTo(x + 150, under, x + 150, 800); ctx.stroke();
    ctx.fillStyle = '#8a7a6c';
    for (let k = -5; k <= 5; k++) { const sx = x + k * 38, sy = top - 8 + Math.pow(Math.abs(k) / 5, 2) * 150; ctx.fillRect(sx - 19, sy, 38, 10); }
    // a lamp on the crown
    ctx.fillStyle = '#141414'; ctx.fillRect(x - 4, top - 110, 8, 104); glow(ctx, x, top - 116, 70, 'rgba(255,210,140,0.5)'); ellipse(ctx, x, top - 116, 10, 12, '#ffd890');
  },
  drawRialtoEnd(ctx, x) {
    ctx.fillStyle = '#d8ccb8';
    ctx.beginPath(); ctx.moveTo(x - 420, 800); ctx.quadraticCurveTo(x, 330, x + 420, 800); ctx.lineTo(x + 340, 800); ctx.quadraticCurveTo(x, 520, x - 340, 800); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8dcc8'; ctx.fillRect(x - 60, 470, 120, 90); poly(ctx, [x - 76, 472, x + 76, 472, x, 420], '#e8dcc8');
    ctx.fillStyle = '#f0b35b'; ctx.font = `700 28px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('RIALTO', x, 400);
  },
  drawHud(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(6,10,14,0.75)'; rrect(ctx, 40, 30, 560, 150, 14); ctx.fill();
    ctx.textAlign = 'left'; ctx.fillStyle = '#f0b35b'; ctx.font = `600 22px ${FONT_UI}`; ctx.fillText('THE GRAND CANAL', 64, 70);
    ctx.fillStyle = '#f0e4c8'; ctx.font = `600 28px ${FONT_UI}`; ctx.fillText('Row for the Rialto!', 64, 110);
    // progress to the Rialto, and how close the launch is
    const p = clamp(this.dist / GR.LEN, 0, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(64, 132, 500, 12);
    ctx.fillStyle = '#f0b35b'; ctx.fillRect(64, 132, 500 * p, 12);
    const g = Math.max(0, Math.round(this.gap));
    ctx.fillStyle = g < 15 ? '#ff6a5a' : '#c8d0dc'; ctx.font = `600 ${G.touch ? 26 : 20}px ${FONT_UI}`; ctx.textAlign = 'right';
    ctx.fillText(`Kolar: ${g} m behind`, 564, 70);
    // the stroke meter
    const big = G.touch ? 1.4 : 1, bw = 640 * big, bh = 34 * big, bx = W / 2 - bw / 2, by = H - 80 - bh;
    ctx.fillStyle = 'rgba(6,10,14,0.75)'; rrect(ctx, bx - 20, by - 50, bw + 40, bh + 76, 14); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = this.inZone && !this.stroked ? '#ffd060' : 'rgba(201,161,59,0.7)'; ctx.fillRect(bx + bw * GR.ZONE, by, bw * (1 - GR.ZONE), bh);
    const mx = bx + bw * this.marker();
    ctx.fillStyle = '#f0ece4'; ctx.fillRect(mx - 5, by - 8, 10, bh + 16);
    ctx.fillStyle = '#f0e4c8'; ctx.font = `600 ${Math.round(22 * big)}px ${FONT_UI}`; ctx.textAlign = 'center';
    ctx.fillText(G.touch ? 'TAP TO ROW' : 'SPACE TO ROW', W / 2, by - 16);
    if (this.flash) { ctx.fillStyle = this.flash.good ? '#9ae07a' : '#ff8a6a'; ctx.font = `700 34px ${FONT_UI}`; ctx.fillText(this.flash.text, W / 2, by - 70); }
    // the duck button, for touch screens
    if (G.touch) {
      const b = this.duckBtn();
      ctx.fillStyle = this.duck > 0.5 ? 'rgba(240,179,91,0.8)' : 'rgba(6,10,14,0.6)'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill();
      ctx.strokeStyle = '#f0b35b'; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = '#f0e4c8'; ctx.font = `700 34px ${FONT_UI}`; ctx.fillText('DUCK', b.x, b.y + 12);
    }
    if (this.introT < 8) {
      const a = clamp(Math.min(this.introT, 8 - this.introT), 0, 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(6,10,14,0.8)'; rrect(ctx, W / 2 - 560, 200, 1120, 140, 14); ctx.fill();
      ctx.fillStyle = '#f0e4c8'; ctx.font = `500 30px ${FONT_UI}`;
      ctx.fillText(G.touch ? 'Tap when the marker is in the gold to row' : 'Press SPACE when the marker is in the gold to row', W / 2, 256);
      ctx.fillText(G.touch ? 'Hold DUCK under the low bridges' : 'Hold the DOWN arrow under the low bridges', W / 2, 302);
      ctx.globalAlpha = 1;
    }
    if (this.failText) drawLabel(ctx, this.failText, W / 2, H / 2);
    ctx.restore();
  },
};

const DAWN_PAGES = [
  { kicker: 'THE GRAND CANAL  ·  00:40', amb: ['water'], text: 'Under the Rialto, Kolar\'s launch meets a barge full of cabbages coming the other way. The cabbages win.' },
  { kicker: 'THE RIALTO  ·  06:40', amb: ['water', 'gulls'], text: 'Jack spends the rest of the night under a tarpaulin in the fish market, with a glass swan and a goose. At dawn he goes to meet Madame Novak.' },
];
