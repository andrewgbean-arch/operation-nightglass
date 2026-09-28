// ---------------------------------------------------------------------------
// The cable — the action sequence. Kolar has stopped the cable car halfway up
// the glacier. Jack climbs out of the cabin and along the cable to the top
// station, hand over hand, a thousand metres above the valley, with the goose
// on his back. Left, right, left, right: the right hand after the left. When
// the wind gusts, stop and hold on, or it swings you back down the cable.
// ---------------------------------------------------------------------------
const CC = {
  LEN: 60,               // metres of cable to the top station
  STEP: 1.1,             // metres per good pull
  PX: 26,                // pixels per metre along the cable
  ANGLE: -0.32,          // the cable climbs to the right
  JX: 760, JY: 520,      // where Jack's hands are on screen
  PYLON: 30,             // the halfway pylon: a place to start again from
};

const CableClimb = {
  layer: null,
  buildLayer() {
    if (this.layer) return;
    const cv = makeCanvas(W * 2, H), x = cv.getContext('2d');
    paintAlps(x, 200, H, false);
    // mist lying in the valley far below
    x.fillStyle = linGrad(x, 0, 700, 0, H, [[0, 'rgba(180,190,220,0)'], [1, 'rgba(180,190,220,0.6)']]); x.fillRect(0, 700, W * 2, H - 700);
    const r = rng(441); for (let i = 0; i < 40; i++) ellipse(x, r() * W * 2, 820 + r() * 200, 200 + r() * 200, 30 + r() * 30, 'rgba(210,215,235,0.35)');
    for (let i = 0; i < 60; i++) { const px = r() * W * 2, ph = 20 + r() * 40, py = 980 + r() * 80; poly(x, [px - ph * 0.3, py, px + ph * 0.3, py, px, py - ph], '#0e1a14'); }
    painterly(cv, { strokes: 20000 });
    this.layer = cv;
  },

  start() {
    this.buildLayer();
    G.mode = 'action'; G.action = this; G.paused = false; G.speech = []; G.overlay = null; G.choices = null;
    G.sceneId = 'cable';
    this.lines = {}; this.introT = 0; this.checkpoint = 0;
    this.reset();
    Sound.playMusic('tension');
    Sound.setAmbience(['snowWind', 'gusts']);
    Sound.setMusicFilter(2400);
    G.fadeTo = 0;
  },
  reset() {
    this.pos = this.checkpoint; this.t = 0; this.last = null; this.swing = 0; this.reach = 0;
    this.gust = null; this.nextGust = 3.5; this.slip = 0; this.flash = null; this.done = false;
  },
  line(key, who, text) {
    if (this.lines[key] || G.speech.length) return;
    this.lines[key] = true;
    say(who, text, { pos: [W / 2, 120] });
  },

  // ---- input: alternate hands --------------------------------------------------------------
  pull(hand) {
    if (this.done || this.slip > 0) return;
    if (this.gust && this.gust.state === 'blow') {
      // letting go in a gust: the wind swings you back down the cable
      this.pos = Math.max(this.checkpoint, this.pos - 5); this.slip = 1; this.swing = 1.2;
      this.flash = { text: 'Hold on in the gusts!', t: 1.2, bad: true };
      Sound.sfx('whoosh'); Sound.sfx('honk');
      this.slips = (this.slips || 0) + 1;
      return;
    }
    if (hand === this.last) {
      this.pos = Math.max(this.checkpoint, this.pos - 0.4); this.flash = { text: 'Other hand!', t: 0.6, bad: true };
      Sound.sfx('scrape');
      return;
    }
    this.last = hand; this.reach = 1;
    this.pos = Math.min(CC.LEN, this.pos + CC.STEP);
    if (this.pos >= CC.PYLON && this.checkpoint < CC.PYLON) { this.checkpoint = CC.PYLON; this.flash = { text: 'The halfway pylon!', t: 1.2 }; }
    Sound.sfx('clink');
  },
  key(k, down) {
    if (!down) return;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') this.pull('L');
    if (k === 'ArrowRight' || k === 'd' || k === 'D') this.pull('R');
  },
  touchStart(x) { this.pull(x < W / 2 ? 'L' : 'R'); },
  click(x) { this.pull(x < W / 2 ? 'L' : 'R'); },

  update(dt) {
    if (this.done) return;
    this.t += dt; this.introT += dt;
    if (this.flash && (this.flash.t -= dt) <= 0) this.flash = null;
    this.slip = Math.max(0, this.slip - dt);
    this.reach = Math.max(0, this.reach - dt * 4);
    this.swing *= Math.exp(-1.2 * dt);
    // the wind: a warning, then a gust
    if (!this.gust && (this.nextGust -= dt) <= 0) { this.gust = { state: 'warn', t: 1.1 }; Sound.sfx('whoosh'); }
    if (this.gust && (this.gust.t -= dt) <= 0) {
      if (this.gust.state === 'warn') this.gust = { state: 'blow', t: 1.6 + Math.random() * 0.8 };
      else { this.gust = null; this.nextGust = 2.2 + Math.random() * 2.5; }
    }
    if (this.gust && this.gust.state === 'blow') this.swing = Math.max(this.swing, 0.5 + 0.2 * Math.sin(this.t * 6));
    // test autopilot: pull steadily, never in a gust
    if (this.autopilot) {
      this.autoT = (this.autoT || 0) - dt;
      if (this.autoT <= 0 && !this.gust) { this.pull(this.last === 'L' ? 'R' : 'L'); this.autoT = 0.28; }
    }
    if (this.t > 1) this.line('look', 'jack', 'Don\'t look down. Don\'t look down. I looked down.');
    if (this.t > 7) this.line('goose', 'jack', 'Colonel, if you\'re going to hold on to something, hold on to the cable, not my ear.');
    if (this.pos > 40) this.line('kolar', 'kolar', 'Harrow! The cable car is closed! Get off my cable!');
    if (this.pos >= CC.LEN) this.finish();
  },
  async finish() {
    if (this.done) return;
    this.done = true;
    G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
    G.speech = [];
    await TextScreen.play(TOP_PAGES, 'tension');
    startPlay();
    G.sceneId = null; G.fade = 1;
    await gotoScene('vault', 1700, 960, -1, { instant: true });
  },

  // ---- drawing ----------------------------------------------------------------------------------
  // a point on the cable, m metres along it
  at(m) { const d = (m - this.pos) * CC.PX; return [CC.JX + Math.cos(CC.ANGLE) * d, CC.JY + Math.sin(CC.ANGLE) * d]; },
  draw(ctx) {
    const t = G.t;
    const off = (this.pos * CC.PX * 0.3) % (W * 2);
    ctx.drawImage(this.layer, -off, 0); ctx.drawImage(this.layer, W * 2 - off, 0);
    // the cable, the stuck cabin behind, the pylon, the top station ahead
    const [ax, ay] = this.at(-40), [bx, by] = this.at(CC.LEN + 30);
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax, ay + 18); ctx.lineTo(bx, by + 18); ctx.stroke();
    const [cx, cy] = this.at(-6);
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(cx - 4, cy, 8, 50);
    ctx.fillStyle = '#c82a2a'; rrect(ctx, cx - 90, cy + 50, 180, 150, 10); ctx.fill(); ctx.fillStyle = '#2a3040'; ctx.fillRect(cx - 76, cy + 66, 152, 60);
    const [px, py] = this.at(CC.PYLON);
    ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(px - 60, H); ctx.lineTo(px, py + 10); ctx.lineTo(px + 60, H); ctx.stroke();
    ctx.lineWidth = 4; for (let k = 1; k < 8; k++) { const yy = py + (H - py) * k / 8, w = 60 * k / 8; ctx.beginPath(); ctx.moveTo(px - w, yy); ctx.lineTo(px + w, yy); ctx.stroke(); }
    ctx.fillStyle = '#3a3a40'; ctx.fillRect(px - 50, py - 6, 100, 16);
    const [tx, ty] = this.at(CC.LEN);
    ctx.fillStyle = '#5a5e64'; ctx.fillRect(tx - 10, ty - 120, 360, 260); ctx.fillStyle = '#3a3e44'; ctx.fillRect(tx - 20, ty - 130, 380, 20);
    ctx.fillStyle = '#ffe8a0'; ctx.fillRect(tx + 40, ty - 90, 80, 50); ctx.fillStyle = '#e8e2d6'; ctx.fillRect(tx + 150, ty - 80, 170, 34);
    ctx.fillStyle = '#1a1a1a'; ctx.font = `700 20px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('BERGSTATION', tx + 235, ty - 56);
    // Jack, hanging from the cable, swinging in the wind, the goose clinging to his back
    const sw = this.swing * Math.sin(t * 3);
    ctx.save(); ctx.translate(CC.JX, CC.JY); ctx.rotate(sw * 0.4);
    const reach = this.reach * 30;
    ctx.strokeStyle = '#c82a2a'; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(-18 + (this.last === 'L' ? reach : 0), -2); ctx.moveTo(0, 60); ctx.lineTo(18 + (this.last === 'R' ? reach : 0), -8); ctx.stroke(); // arms up to the cable
    ellipse(ctx, -18 + (this.last === 'L' ? reach : 0), -2, 9, 9, '#d9a883'); ellipse(ctx, 18 + (this.last === 'R' ? reach : 0), -8, 9, 9, '#d9a883');
    ctx.fillStyle = '#c82a2a'; rrect(ctx, -26, 56, 52, 90, 12); ctx.fill();                                  // jacket
    ellipse(ctx, 0, 40, 18, 20, '#d9a883'); ctx.fillStyle = '#c82a2a'; ctx.beginPath(); ctx.ellipse(0, 26, 20, 12, 0, Math.PI, 0); ctx.fill(); // head and hat
    ctx.strokeStyle = '#1a1a2a'; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(-10, 140); ctx.lineTo(-18 + sw * 20, 220); ctx.moveTo(10, 140); ctx.lineTo(16 + sw * 26, 216); ctx.stroke();    // legs, dangling
    drawGoose(ctx, -34, 128, 0.42, t, -1);
    ctx.restore();
    // wind streaks in a gust
    if (this.gust) {
      ctx.save(); ctx.globalAlpha = this.gust.state === 'blow' ? 0.5 : 0.2; ctx.strokeStyle = '#f4f6f8'; ctx.lineWidth = 3;
      for (let k = 0; k < 24; k++) { const y = (k * 97 + t * 40) % H, x = (W - ((t * 1400 + k * 311) % (W + 400))); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 160, y + 10); ctx.stroke(); }
      ctx.restore();
    }
    drawVignette(ctx, 0.55);
    drawGrain(ctx, 0.04);
    this.drawHud(ctx);
  },
  drawHud(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(6,10,14,0.75)'; rrect(ctx, 40, 30, 560, 150, 14); ctx.fill();
    ctx.textAlign = 'left'; ctx.fillStyle = '#f0b35b'; ctx.font = `600 22px ${FONT_UI}`; ctx.fillText('A THOUSAND METRES UP', 64, 70);
    ctx.fillStyle = '#f0e4c8'; ctx.font = `600 28px ${FONT_UI}`; ctx.fillText('Climb to the top station', 64, 110);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(64, 132, 500, 12);
    ctx.fillStyle = '#f0b35b'; ctx.fillRect(64, 132, 500 * clamp(this.pos / CC.LEN, 0, 1), 12);
    ctx.textAlign = 'right'; ctx.fillStyle = '#c8d0dc'; ctx.font = `600 ${G.touch ? 26 : 20}px ${FONT_UI}`; ctx.fillText(`${Math.max(0, Math.ceil(CC.LEN - this.pos))} m to go`, 564, 70);
    // the two hands, and which one comes next
    const next = this.last === 'L' ? 'R' : 'L', big = G.touch ? 1.3 : 1;
    for (const [hand, x] of [['L', W / 2 - 170 * big], ['R', W / 2 + 170 * big]]) {
      const on = hand === next && !this.gust;
      ctx.fillStyle = on ? 'rgba(240,179,91,0.85)' : 'rgba(6,10,14,0.6)'; ctx.beginPath(); ctx.arc(x, H - 120, 70 * big, 0, 7); ctx.fill();
      ctx.strokeStyle = '#f0b35b'; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = on ? '#05080d' : '#f0e4c8'; ctx.font = `700 ${Math.round(30 * big)}px ${FONT_UI}`; ctx.textAlign = 'center';
      ctx.fillText(hand === 'L' ? (G.touch ? 'LEFT' : '← LEFT') : (G.touch ? 'RIGHT' : 'RIGHT →'), x, H - 110);
    }
    if (this.gust) { ctx.textAlign = 'center'; ctx.fillStyle = this.gust.state === 'blow' ? '#ff5a4a' : '#f0b35b'; ctx.font = `700 ${G.touch ? 50 : 42}px ${FONT_UI}`; ctx.fillText(this.gust.state === 'blow' ? 'HOLD ON!' : 'Gust coming...', W / 2, H - 250); }
    if (this.flash) { ctx.textAlign = 'center'; ctx.fillStyle = this.flash.bad ? '#ff8a6a' : '#9ae07a'; ctx.font = `700 36px ${FONT_UI}`; ctx.fillText(this.flash.text, W / 2, H - 310); }
    if (this.introT < 8) {
      const a = clamp(Math.min(this.introT, 8 - this.introT), 0, 1);
      ctx.globalAlpha = a; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(6,10,14,0.8)'; rrect(ctx, W / 2 - 560, 230, 1120, 140, 14); ctx.fill();
      ctx.fillStyle = '#f0e4c8'; ctx.font = `500 30px ${FONT_UI}`;
      ctx.fillText(G.touch ? 'Tap the left and right of the screen in turn to climb' : 'LEFT, RIGHT, LEFT, RIGHT (or A and D) to climb hand over hand', W / 2, 286);
      ctx.fillText('When the wind gusts, stop and hold on', W / 2, 332);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  },
};

const TOP_PAGES = [
  { kicker: 'THE BERGSTATION  ·  20:30', amb: ['snowWind'], text: 'Sixty metres, hand over hand, with a goose on his back. At the top, a locked door, a ledge out of the wind, and a long, cold night. The bank opens at half past eleven. Swiss banks are never late, not even inside a mountain.' },
];
