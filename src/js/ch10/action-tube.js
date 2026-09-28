// ---------------------------------------------------------------------------
// The Underground — the action sequence. Control's grey men chase Jack along
// the platform at Lambeth North, through the rush hour, and down the length of
// a Bakerloo train. Jump the suitcases and the mop buckets, duck the signs and
// the newspapers. Every stumble lets the grey men gain; if they catch him, it's
// back to the last platform.
// ---------------------------------------------------------------------------
const TR = {
  SPEED: 640,        // pixels a second the world goes by
  JX: 640, GROUND: 930,
  GRAV: 3400, JUMP: 1350,
  DUCK: 0.62,        // seconds a duck lasts
  LEAD: 3,           // how many stumbles the grey men need to catch up
};

// The course: what's in the way, and where. The first half is the platform,
// the second half the train.
function tubeCourse() {
  const r = rng(1101), out = [];
  const plat = [['case', 'jump'], ['bucket', 'jump'], ['guitar', 'jump'], ['sign', 'duck'], ['plank', 'duck']];
  const train = [['holdall', 'jump'], ['briefcase', 'jump'], ['dog', 'jump'], ['paper', 'duck'], ['brolly', 'duck']];
  let x = 1400;
  for (let i = 0; i < 40; i++) {
    const set = i < 20 ? plat : train, [what, kind] = set[Math.floor(r() * set.length)];
    out.push({ x, what, kind, done: false, hit: false });
    x += 560 + r() * 260 + (i === 19 ? 900 : 0);
  }
  return { list: out, half: out[20].x - 700, end: x + 400 };
}

const TubeRun = {
  layers: null,
  buildLayers() {
    if (this.layers) return;
    // the platform: a curved tunnel of cream tiles, posters, name boards
    const a = makeCanvas(W, H), x = a.getContext('2d');
    x.fillStyle = '#0a0c10'; x.fillRect(0, 0, W, H);
    x.fillStyle = linGrad(x, 0, 60, 0, 760, [[0, '#b8ae94'], [1, '#e8dcbc']]); x.beginPath(); x.moveTo(0, 760); x.lineTo(0, 200); x.quadraticCurveTo(W / 2, -60, W, 200); x.lineTo(W, 760); x.fill();
    x.strokeStyle = 'rgba(120,110,90,0.3)'; x.lineWidth = 2; for (let yy = 220; yy < 760; yy += 30) { x.beginPath(); x.moveTo(0, yy); x.lineTo(W, yy); x.stroke(); } for (let xx = 0; xx < W; xx += 60) { x.beginPath(); x.moveTo(xx, 200); x.lineTo(xx, 760); x.stroke(); }
    x.fillStyle = '#2a4a8a'; x.fillRect(0, 600, W, 24); x.fillRect(0, 300, W, 14);
    for (const [px, col, t1] of [[120, '#c82a2a', 'MIND THE GAP'], [760, '#2a6a3a', 'VISIT KEW'], [1400, '#e8a020', 'DRINK MORE MILK']]) {
      x.fillStyle = '#e8e2d0'; x.fillRect(px - 8, 352, 376, 216); x.fillStyle = col; x.fillRect(px, 360, 360, 200);
      x.fillStyle = '#f4f0e0'; x.font = `700 40px ${FONT_UI}`; x.textAlign = 'center'; x.fillText(t1, px + 180, 470);
    }
    x.fillStyle = '#1a2a5a'; x.fillRect(560, 250, 520, 44); x.fillStyle = '#f4f0e8'; x.font = `700 30px ${FONT_UI}`; x.fillText('LAMBETH NORTH', 820, 283);
    x.fillStyle = '#6a6a6a'; x.fillRect(0, 760, W, 170); x.fillStyle = '#e8c830'; x.fillRect(0, 930, W, 14); x.fillStyle = '#3a3a3a'; x.fillRect(0, 944, W, 136);
    texture(x, 0, 760, W, 170, '#3a3a3a', 400, 12, 1102, 0.25);
    painterly(a, { strokes: 14000 });
    // the train: moquette seats, windows onto the black tunnel, yellow poles
    const b = makeCanvas(W, H), y = b.getContext('2d');
    y.fillStyle = '#e8e4d8'; y.fillRect(0, 0, W, 930); y.fillStyle = '#c8c4b8'; y.fillRect(0, 0, W, 110);
    for (let k = 0; k < 4; k++) { const wx = 60 + k * 480; y.fillStyle = '#0a0c10'; rrect(y, wx, 200, 380, 250, 24); y.fill(); y.strokeStyle = '#8a8e94'; y.lineWidth = 8; y.stroke(); }
    for (let k = 0; k < 4; k++) { const sx = 40 + k * 480; y.fillStyle = '#8a1a2a'; y.fillRect(sx, 560, 420, 140); y.fillStyle = '#6a1020'; y.fillRect(sx, 700, 420, 60); for (let j = 0; j < 30; j++) { y.fillStyle = j % 2 ? '#c8a020' : '#2a4a8a'; y.fillRect(sx + 10 + (j * 37) % 400, 580 + ((j * 53) % 110), 8, 8); } }
    for (let k = 0; k < 8; k++) { y.fillStyle = '#e8c020'; y.fillRect(k * 240 + 20, 110, 12, 820); }
    y.fillStyle = '#6a6a70'; y.fillRect(0, 930, W, 150); texture(y, 0, 930, W, 150, '#3a3a40', 400, 10, 1103, 0.3);
    y.fillStyle = '#c8c4b8'; for (let k = 0; k < 20; k++) y.fillRect(k * 96 + 30, 116, 4, 40);
    painterly(b, { strokes: 14000 });
    this.layers = { platform: a, train: b };
  },

  start() {
    this.buildLayers();
    G.mode = 'action'; G.action = this; G.paused = false; G.speech = []; G.overlay = null; G.choices = null;
    G.sceneId = 'tube';
    const c = tubeCourse();
    this.course = c.list; this.half = c.half; this.end = c.end;
    this.checkpoint = 0; this.lines = {}; this.introT = 0; this.stumbles = 0; this.caught = 0;
    this.jack = makeFigure('jackFish', TR.JX, TR.GROUND, { id: 'jack', facing: 1, scale: 2, walking: true });
    this.men = [0, 1].map(i => makeFigure('greyMan', 0, TR.GROUND, { id: 'grey' + i, facing: 1, scale: 1.95 - i * 0.05, walking: true, seed: 110 + i }));
    this.reset();
    Sound.playMusic('tube');
    Sound.setAmbience(['tube']);
    Sound.setMusicFilter(18000);
    G.fadeTo = 0;
  },
  reset() {
    this.pos = this.checkpoint; this.t = 0; this.jy = 0; this.vy = 0; this.duckT = 0; this.stumble = 0; this.lead = TR.LEAD; this.flash = null; this.done = false;
    for (const o of this.course) if (o.x > this.checkpoint) { o.done = false; o.hit = false; }
  },
  line(key, who, text) {
    if (this.lines[key] || G.speech.length) return;
    this.lines[key] = true;
    say(who, text, { pos: [W / 2, 120] });
  },

  // ---- input -----------------------------------------------------------------------
  jump() { if (this.done || this.jy < 0) return; this.vy = -TR.JUMP; this.jy = -0.01; this.duckT = 0; Sound.sfx('jump'); },
  duck() { if (this.done || this.jy < 0) return; this.duckT = TR.DUCK; Sound.sfx('cloth'); },
  key(k, down) {
    if (!down) return;
    if (k === 'ArrowUp' || k === 'w' || k === 'W' || k === ' ') this.jump();
    if (k === 'ArrowDown' || k === 's' || k === 'S') this.duck();
  },
  touchStart(x, y) { if (y < H / 2) this.jump(); else this.duck(); },
  click(x, y) { if (y < H / 2) this.jump(); else this.duck(); },

  update(dt) {
    if (this.done) return;
    this.t += dt; this.introT += dt;
    if (this.flash && (this.flash.t -= dt) <= 0) this.flash = null;
    this.stumble = Math.max(0, this.stumble - dt);
    this.duckT = Math.max(0, this.duckT - dt);
    const speed = TR.SPEED * (this.stumble > 0 ? 0.45 : 1) * (this.introT < 1.2 ? this.introT / 1.2 : 1);
    this.pos += speed * dt;
    if (this.jy < 0 || this.vy < 0) { this.vy += TR.GRAV * dt; this.jy += this.vy * dt; if (this.jy >= 0) { this.jy = 0; this.vy = 0; Sound.sfx('land'); } }
    // the grey men gain on a stumble, and fall back slowly otherwise
    this.lead = Math.min(TR.LEAD, this.lead + dt * 0.08);
    // test autopilot: jump or duck in good time, and never both
    if (this.autopilot) {
      const o = this.course.find(o => !o.done && o.x - this.pos > -20);
      if (o && o.x - this.pos < 170 && o.x - this.pos > 40) { if (o.kind === 'jump') this.jump(); else if (!this.duckT) this.duck(); }
    }
    for (const o of this.course) {
      if (o.done) continue;
      const d = o.x - this.pos;
      if (d < -60) { o.done = true; continue; }
      if (Math.abs(d) < 44 && !o.hit) {
        const clear = o.kind === 'jump' ? this.jy < -80 : this.duckT > 0;
        if (!clear) { o.hit = true; this.hitBy(o); }
      }
    }
    if (this.pos >= this.half && this.checkpoint < this.half) { this.checkpoint = this.half; this.flash = { text: 'Onto the train!', t: 1.4 }; Sound.sfx('tubeDoors'); }
    if (this.t > 1.5) this.line('start', 'control', 'Stop that man! He is a traitor! And he smells of FISH!');
    if (this.pos > this.half * 0.45) this.line('gap', 'jack', 'Mind the gap. Mind the gap. Mind the gap.');
    if (this.pos > this.half + 2400) this.line('sorry', 'jack', 'Sorry. Sorry. Terribly sorry. Excuse me. Sorry.');
    if (this.pos > this.end - 3000) this.line('doors', 'tannoy', 'Stand clear of the closing doors, please.');
    if (this.pos >= this.end) this.finish();
  },
  hitBy(o) {
    this.stumble = 0.7; this.lead -= 1; this.stumbles++;
    this.flash = { text: o.kind === 'jump' ? 'Jump!' : 'Duck!', t: 0.8, bad: true };
    Sound.sfx(o.what === 'dog' ? 'bark' : 'thud');
    if (this.lead <= 0) this.caughtUp();
  },
  async caughtUp() {
    this.caught++;
    this.done = true;
    this.flash = { text: 'Caught!', t: 1.6, bad: true };
    Sound.sfx('sting');
    G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
    notify(this.checkpoint ? 'They caught you on the train. Try again from the doors.' : 'The grey men caught you. Try again.');
    this.reset();
    G.fadeTo = 0;
  },
  async finish() {
    if (this.done) return;
    this.done = true;
    Sound.sfx('tubeDoors');
    await wait(1.2);
    G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
    G.speech = [];
    await TextScreen.play(TEA_PAGES, 'tea');
    startPlay();
    G.sceneId = null; G.fade = 1;
    await gotoScene('tearoom', 160, 960, 1, { instant: true });
  },

  // ---- drawing ------------------------------------------------------------------------
  draw(ctx) {
    const t = G.t, onTrain = this.pos >= this.half;
    const layer = onTrain ? this.layers.train : this.layers.platform;
    const off = (this.pos * (onTrain ? 1 : 0.9)) % W;
    ctx.drawImage(layer, -off, 0); ctx.drawImage(layer, W - off, 0);
    if (onTrain) {
      // lights flicking past the windows in the tunnel
      ctx.save(); ctx.globalAlpha = 0.5;
      for (let k = 0; k < 4; k++) { const lx = ((k * 480 + 60) - off + W) % W; for (let j = 0; j < 3; j++) { const fx = lx + ((t * 1600 + j * 140) % 380); ctx.fillStyle = '#ffe8a0'; ctx.fillRect(fx, 320, 30, 6); } }
      ctx.restore();
    }
    // the end of the line: the train's doors, closing
    const endX = TR.JX + (this.end - this.pos);
    if (endX < W + 300) {
      const close = clamp((this.pos - (this.end - 1200)) / 1200, 0, 1);
      ctx.fillStyle = '#c82a2a'; ctx.fillRect(endX - 20, 150, 420, 780);
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(endX + 20, 200, 340, 730);
      ctx.fillStyle = '#b8bcc2'; ctx.fillRect(endX + 20, 200, 170 * close, 730); ctx.fillRect(endX + 360 - 170 * close, 200, 170 * close, 730);
    }
    for (const o of this.course) { const ox = TR.JX + (o.x - this.pos); if (ox > -200 && ox < W + 200) this.drawObstacle(ctx, o, ox, t); }
    // the grey men, behind
    this.men.forEach((m, i) => {
      m.x = TR.JX - 230 - this.lead * 130 - i * 110; m.y = TR.GROUND;
      m.walkPhase = t * 13 + i * 1.3; m.arm = i === 0 ? 'point' : 'rest';
      if (m.x > -150) drawFigure(ctx, m, t, { ambient: 'rgba(20,20,30,0.15)', key: 'rgba(255,240,200,0.25)', keyX: W });
    });
    // Jack: running, jumping, ducking
    const j = this.jack;
    j.walkPhase = t * 14; j.y = TR.GROUND + this.jy; j.airborne = this.jy < -2; j.crouch = this.duckT > 0 ? 1 : 0;
    j.arm = this.stumble > 0 ? 'panic' : 'rest';
    drawFigure(ctx, j, t, { ambient: 'rgba(20,20,30,0.1)', key: 'rgba(255,240,200,0.3)', keyX: W });
    drawVignette(ctx, 0.5);
    drawGrain(ctx, 0.04);
    this.drawHud(ctx);
  },
  drawObstacle(ctx, o, x, t) {
    const g = TR.GROUND;
    // a workman with a plank on his shoulder, a gent reading The Times, a City man shouldering his umbrella
    const holder = { plank: ['jackCleaner', 175], paper: ['minister', 70], brolly: ['brunner', 100] }[o.what];
    if (holder) {
      if (!o.fig) o.fig = makeFigure(holder[0], 0, g, { facing: -1, arm: 'hold', scale: 1.9, seed: o.x % 97 });
      o.fig.x = x + holder[1]; o.fig.y = g;
      drawFigure(ctx, o.fig, t, { ambient: 'rgba(20,20,30,0.15)', key: 'rgba(255,240,200,0.25)', keyX: W });
    }
    ctx.save();
    switch (o.what) {
      case 'case': ctx.fillStyle = '#6a3a1a'; rrect(ctx, x - 50, g - 70, 100, 70, 6); ctx.fill(); ctx.fillStyle = '#c9a13b'; ctx.fillRect(x - 12, g - 80, 24, 10); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x - 50, g - 40, 100, 4); break;
      case 'bucket': ctx.fillStyle = '#e8c830'; poly(ctx, [x - 40, g - 60, x + 40, g - 60, x + 30, g, x - 30, g], '#e8c830'); ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + 20, g - 60); ctx.lineTo(x + 50, g - 180); ctx.stroke(); ctx.fillStyle = '#f4f0e0'; poly(ctx, [x - 70, g, x - 50, g - 90, x - 30, g], '#f0d020'); break;
      case 'guitar': ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.ellipse(x, g - 18, 70, 22, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#8a1a2a'; ctx.beginPath(); ctx.ellipse(x, g - 20, 60, 16, 0, 0, 7); ctx.fill(); for (let k = 0; k < 5; k++) ellipse(ctx, x - 30 + k * 14, g - 22, 5, 4, '#c9a13b'); break;
      case 'sign': ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x - 3, 0, 6, 460); ctx.fillStyle = '#1a2a5a'; ctx.fillRect(x - 90, 460, 180, 120); ctx.fillStyle = '#f4f0e8'; ctx.font = `700 30px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('WAY OUT', x, 530); break;
      case 'plank': ctx.fillStyle = '#b8905a'; ctx.fillRect(x - 160, 588, 380, 32); ctx.fillStyle = '#8a6a3a'; ctx.fillRect(x - 160, 616, 380, 6); ctx.fillStyle = '#c82a2a'; ctx.fillRect(x - 160, 588, 20, 32); break;
      case 'holdall': ctx.fillStyle = '#2a4a6a'; rrect(ctx, x - 60, g - 62, 120, 62, 18); ctx.fill(); ctx.fillStyle = '#1a2a3a'; ctx.fillRect(x - 60, g - 34, 120, 5); ctx.strokeStyle = '#1a2a3a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, g - 62, 22, Math.PI, 0); ctx.stroke(); break;
      case 'briefcase': ctx.fillStyle = '#3a2210'; rrect(ctx, x - 44, g - 64, 88, 64, 6); ctx.fill(); ctx.strokeStyle = '#3a2210'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, g - 64, 14, Math.PI, 0); ctx.stroke(); break;
      case 'dog': ellipse(ctx, x, g - 36, 44, 22, '#c8a060'); ellipse(ctx, x + 44, g - 56, 18, 15, '#c8a060'); ctx.fillStyle = '#c8a060'; for (const d of [-30, -10, 14, 30]) ctx.fillRect(x + d, g - 20, 7, 20); ellipse(ctx, x + 56, g - 58, 3, 3, '#111'); ctx.strokeStyle = '#c8a060'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - 42, g - 40); ctx.lineTo(x - 62, g - 64 + Math.sin(t * 20) * 8); ctx.stroke(); break;
      case 'paper': ctx.fillStyle = '#e8e4d8'; ctx.save(); ctx.translate(x - 20, 556); ctx.rotate(Math.sin(t * 3) * 0.03); ctx.fillRect(-110, -70, 220, 140); ctx.fillStyle = '#3a3a3a'; ctx.font = `700 22px ${FONT_DISPLAY}`; ctx.textAlign = 'center'; ctx.fillText('THE TIMES', 0, -40); for (let k = 0; k < 5; k++) ctx.fillRect(-90, -20 + k * 16, 180, 4); ctx.restore(); break;
      case 'brolly': ctx.fillStyle = '#141414'; ctx.beginPath(); ctx.moveTo(x - 150, 604); ctx.lineTo(x - 30, 592); ctx.lineTo(x + 70, 596); ctx.lineTo(x + 70, 616); ctx.lineTo(x - 30, 620); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#c8ccd0'; ctx.fillRect(x - 164, 602, 16, 6); ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x + 70, 606); ctx.lineTo(x + 100, 606); ctx.arc(x + 100, 624, 18, -Math.PI / 2, Math.PI / 2); ctx.stroke(); break;
    }
    ctx.restore();
  },
  drawHud(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(6,10,14,0.75)'; rrect(ctx, 40, 30, 560, 150, 14); ctx.fill();
    ctx.textAlign = 'left'; ctx.fillStyle = '#f0b35b'; ctx.font = `600 22px ${FONT_UI}`; ctx.fillText('THE UNDERGROUND', 64, 70);
    ctx.fillStyle = '#f0e4c8'; ctx.font = `600 28px ${FONT_UI}`; ctx.fillText(this.pos < this.half ? 'Along the platform' : 'Through the train', 64, 110);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(64, 132, 500, 12);
    ctx.fillStyle = '#f0b35b'; ctx.fillRect(64, 132, 500 * clamp(this.pos / this.end, 0, 1), 12);
    ctx.fillStyle = '#ff8a6a'; ctx.fillRect(64 + 500 * clamp(this.half / this.end, 0, 1) - 2, 126, 4, 24);
    // how close the grey men are
    ctx.textAlign = 'right'; ctx.fillStyle = '#c8d0dc'; ctx.font = `600 ${G.touch ? 26 : 20}px ${FONT_UI}`; ctx.fillText('Grey men: ' + '■'.repeat(Math.max(0, Math.ceil(this.lead))) + '□'.repeat(Math.max(0, TR.LEAD - Math.ceil(this.lead))), 564, 70);
    if (this.flash) { ctx.textAlign = 'center'; ctx.fillStyle = this.flash.bad ? '#ff8a6a' : '#9ae07a'; ctx.font = `700 ${G.touch ? 50 : 42}px ${FONT_UI}`; ctx.fillText(this.flash.text, W / 2, 260); }
    if (G.touch) {
      ctx.globalAlpha = 0.5; ctx.textAlign = 'center'; ctx.fillStyle = '#f0e4c8'; ctx.font = `700 34px ${FONT_UI}`;
      ctx.fillText('▲ JUMP', W - 160, 320); ctx.fillText('▼ DUCK', W - 160, H - 180);
      ctx.globalAlpha = 1;
    }
    if (this.introT < 8) {
      const a = clamp(Math.min(this.introT, 8 - this.introT), 0, 1);
      ctx.globalAlpha = a; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(6,10,14,0.8)'; rrect(ctx, W / 2 - 560, 300, 1120, 140, 14); ctx.fill();
      ctx.fillStyle = '#f0e4c8'; ctx.font = `500 30px ${FONT_UI}`;
      ctx.fillText(G.touch ? 'Tap the top of the screen to jump, the bottom to duck' : 'UP (or W, or SPACE) to jump, DOWN (or S) to duck', W / 2, 356);
      ctx.fillText('Every stumble lets the grey men catch up', W / 2, 402);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  },
};

const TEA_PAGES = [
  { kicker: 'THE BAKERLOO LINE  ·  08:15', amb: ['tube'], text: 'The doors close on the grey men. The train pulls out. I ride it to the end of the line, and back, and to the end again, until four o\'clock. Nobody on the Underground looks at anybody. It\'s the safest place in London.' },
  { kicker: 'THE WELLINGTON, PICCADILLY  ·  15:58', amb: ['rain', 'traffic'], text: 'A white coat, a flat cap, a Guards tie in my pocket and one kipper, for luck. Across the road a blue van pulls up, and something white gets out of it.' },
];
