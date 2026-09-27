// ---------------------------------------------------------------------------
// The tunnel — the action sequence, a cross-section of the death strip. Above:
// raked sand, tank traps, a watchtower and a guard dog on its running wire.
// Below: a tunnel dug in 1964, a hundred and forty-five metres to the West.
// Hold to crawl, let go to freeze. When the dog stops and listens, anyone
// moving underneath it is heard. The goose comes too.
// ---------------------------------------------------------------------------
const TC = {
  LEN: 145,             // metres, East cellar to West cellar
  PX: 22,               // pixels per metre
  JX: 760,              // Jack's place on screen
  GROUND: 470,          // the surface of the strip
  TOP: 770, BOT: 900,   // the tunnel's roof and floor
  SPEED: 2.6,           // crawling, metres a second
  EAR: 12,              // how far a listening dog can hear, in metres
  PROPS: [30, 60, 90, 120], // pit props: checkpoints to start again from
};

const TunnelCrawl = {
  layer: null,

  buildLayer() {
    if (this.layer) return;
    const cv = makeCanvas(TC.LEN * TC.PX + W * 2, H), x = cv.getContext('2d');
    const w = cv.width, x0 = W;   // the strip starts one screen in
    // night sky, the East and the West at either end
    x.fillStyle = linGrad(x, 0, 0, 0, TC.GROUND, [[0, '#04060c'], [1, '#1a2030']]); x.fillRect(0, 0, w, TC.GROUND);
    const r = rng(241); for (let i = 0; i < 400; i++) ellipse(x, r() * w, r() * 300, r() + 0.3, r() + 0.3, `rgba(255,255,255,${0.2 + r() * 0.5})`);
    for (let k = 0; k < 6; k++) paintTenement(x, x0 - 900 + k * 150, 160 + (k % 3) * 40, 150, TC.GROUND, '#3a3c44', 242 + k, 0.15);
    paintTenement(x, x0 + TC.LEN * TC.PX + 60, 140, 900, TC.GROUND, '#4a4038', 250, 0.5);
    // the inner wall (East) and the outer Wall (West), painted on its western face
    x.fillStyle = '#6a6a70'; x.fillRect(x0 - 20, TC.GROUND - 200, 30, 200);
    x.fillStyle = '#d8d4c8'; x.fillRect(x0 + TC.LEN * TC.PX - 20, TC.GROUND - 240, 40, 240); ellipse(x, x0 + TC.LEN * TC.PX, TC.GROUND - 240, 26, 14, '#e8e4d8');
    // lamps along the strip, a watchtower in the middle
    for (let m = 8; m < TC.LEN; m += 22) { const lx = x0 + m * TC.PX; x.fillStyle = '#1a1a1a'; x.fillRect(lx, TC.GROUND - 170, 6, 170); x.fillRect(lx - 28, TC.GROUND - 172, 34, 6); glow(x, lx - 24, TC.GROUND - 162, 110, 'rgba(255,230,170,0.35)'); }
    const tx = x0 + 70 * TC.PX;
    x.fillStyle = '#2a2c32'; x.fillRect(tx - 30, TC.GROUND - 300, 60, 300); x.fillStyle = '#3a3c44'; x.fillRect(tx - 60, TC.GROUND - 360, 120, 64); x.fillStyle = '#ffe8a0'; x.fillRect(tx - 50, TC.GROUND - 346, 100, 26); x.fillStyle = '#2a2c32'; x.fillRect(tx - 70, TC.GROUND - 374, 140, 16);
    // the strip itself: raked sand, tank traps, the dog's running wire
    x.fillStyle = '#c8c4b8'; x.fillRect(x0, TC.GROUND - 8, TC.LEN * TC.PX, 8);
    for (let m = 14; m < TC.LEN - 6; m += 19) { const hx = x0 + m * TC.PX; x.strokeStyle = '#1a1a1a'; x.lineWidth = 7; x.beginPath(); x.moveTo(hx - 30, TC.GROUND); x.lineTo(hx + 30, TC.GROUND - 56); x.moveTo(hx + 30, TC.GROUND); x.lineTo(hx - 30, TC.GROUND - 56); x.moveTo(hx, TC.GROUND - 66); x.lineTo(hx, TC.GROUND); x.stroke(); }
    x.strokeStyle = '#6a6a6a'; x.lineWidth = 2; x.beginPath(); x.moveTo(x0 + 18 * TC.PX, TC.GROUND - 90); x.lineTo(x0 + 128 * TC.PX, TC.GROUND - 90); x.stroke();
    for (const m of [18, 128]) { x.fillStyle = '#3a3a3a'; x.fillRect(x0 + m * TC.PX - 3, TC.GROUND - 96, 6, 96); }
    // the earth in section: sandy Berlin soil, stones, a water main
    x.fillStyle = linGrad(x, 0, TC.GROUND, 0, H, [[0, '#8a7458'], [0.5, '#6a5238'], [1, '#3a2c1e']]); x.fillRect(0, TC.GROUND, w, H - TC.GROUND);
    texture(x, 0, TC.GROUND, w, H - TC.GROUND, '#2a1e12', 6000, 24, 243, 0.3);
    for (let i = 0; i < 300; i++) ellipse(x, r() * w, TC.GROUND + 20 + r() * (H - TC.GROUND - 20), 4 + r() * 10, 3 + r() * 6, pick3(r, ['#9a8a70', '#5a4a38', '#b8a888']));
    x.fillStyle = '#3a3a3a'; x.fillRect(0, TC.GROUND + 110, w, 26); x.fillStyle = 'rgba(255,255,255,0.1)'; x.fillRect(0, TC.GROUND + 112, w, 4);
    // the tunnel: a dark tube, boarded roof, pit props
    x.fillStyle = '#1a120c'; x.fillRect(x0 - 200, TC.TOP, TC.LEN * TC.PX + 400, TC.BOT - TC.TOP);
    x.fillStyle = '#4a3420'; for (let px = x0 - 200; px < x0 + TC.LEN * TC.PX + 200; px += 40) x.fillRect(px, TC.TOP - 10, 36, 12);
    for (let m = 0; m <= TC.LEN; m += 10) { const px = x0 + m * TC.PX; x.fillStyle = '#5a4028'; x.fillRect(px - 5, TC.TOP, 10, TC.BOT - TC.TOP); }
    // the cellars at either end
    x.fillStyle = '#2a2018'; x.fillRect(x0 - 500, TC.GROUND + 20, 300, TC.BOT - TC.GROUND - 20); x.fillRect(x0 + TC.LEN * TC.PX + 200, TC.GROUND + 20, 300, TC.BOT - TC.GROUND - 20);
    x.fillStyle = '#f0b35b'; x.font = `700 36px ${FONT_UI}`; x.textAlign = 'center'; x.fillText('WEST', x0 + TC.LEN * TC.PX + 350, TC.GROUND + 90);
    painterly(cv, { strokes: 40000 });
    this.layer = cv;
  },

  start() {
    this.buildLayer();
    G.mode = 'action'; G.action = this; G.paused = false; G.speech = []; G.overlay = null; G.choices = null;
    G.sceneId = 'tunnel';
    this.lines = {};
    this.introT = 0;
    this.checkpoint = 0;
    this.reset();
    Sound.playMusic('tunnel');
    Sound.setAmbience(['trickle', 'dogs', 'wind']);
    Sound.setMusicFilter(1800);
    G.fadeTo = 0;
  },
  reset() {
    this.pos = this.checkpoint; this.t = 0; this.moving = false; this.anim = 0;
    // the dog starts well away from wherever Jack is
    this.dog = { m: this.pos > 70 ? 25 : 110, dir: this.pos > 70 ? 1 : -1, state: 'walk', timer: 2 + Math.random() * 2 };
    this.dead = false; this.done = false; this.failText = null;
  },
  line(key, who, text) {
    if (this.lines[key] || G.speech.length) return;
    this.lines[key] = true;
    say(who, text, { pos: [W / 2, 120] });
  },

  holding() {
    if (this.auto !== undefined) return this.auto;
    return !!(KEYS.ArrowRight || KEYS.d || KEYS.D || KEYS[' '] || G.mouse.down || Object.keys(G.touches || {}).length);
  },
  key() {},
  touchStart() {},
  click() {},

  update(dt) {
    if (this.done) return;
    this.t += dt; this.introT += dt;
    if (this.dead) return;
    // the dog: trots along its wire, and every so often stops, sniffs, and listens
    const d = this.dog;
    d.timer -= dt;
    if (d.state === 'walk') {
      d.m += d.dir * 2.4 * dt;
      if (d.m < 20) { d.m = 20; d.dir = 1; } if (d.m > 126) { d.m = 126; d.dir = -1; }
      if (Math.random() < dt * 0.25) d.dir *= -1;
      if (d.timer <= 0) { d.state = 'warn'; d.timer = 0.7; Sound.sfx('sniff'); }
    } else if (d.state === 'warn') {
      if (d.timer <= 0) { d.state = 'listen'; d.timer = 1.6 + Math.random() * 1.2; }
    } else if (d.timer <= 0) { d.state = 'walk'; d.timer = 2.2 + Math.random() * 3; }
    // test autopilot: crawl, but freeze whenever the dog is close enough to hear
    if (this.autopilot) this.auto = !((d.state === 'warn' || d.state === 'listen') && Math.abs(d.m - this.pos) < TC.EAR + 2);
    this.moving = this.holding();
    if (this.moving) {
      this.pos = Math.min(TC.LEN, this.pos + TC.SPEED * dt);
      this.anim += dt;
      if (Math.random() < dt * 2) Sound.sfx('scrape');
      for (const p of TC.PROPS) if (this.pos >= p && this.checkpoint < p) this.checkpoint = p;
    }
    if (d.state === 'listen' && this.moving && Math.abs(d.m - this.pos) < TC.EAR) return this.fail();
    if (this.t > 1) this.line('slow', 'ilse', 'Slowly, Jack. Those dogs can hear a mouse breathe.');
    if (this.t > 5) this.line('goose', 'jack', 'What about a goose?');
    if (this.t > 8) this.line('never', 'ilse', 'Nobody has ever tried it.');
    if (this.pos > 100) this.line('nearly', 'ilse', 'Nearly there. Smell that? Currywurst. The West.');
    if (this.pos >= TC.LEN) this.finish();
  },
  async fail() {
    if (this.dead) return;
    this.dead = true;
    this.fails = (this.fails || 0) + 1;
    Sound.sfx('bark');
    this.failText = this.fails % 2 ? 'The dog heard you! Let go and freeze when its ears go up.' : 'Heard again! Watch the dog: when it stops and sniffs, stop crawling.';
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
    await TextScreen.play(WEST_PAGES, 'dawn');
    startPlay();
    G.sceneId = null; G.fade = 1;
    await gotoScene('west', 460, 960, 1, { instant: true });
  },

  // ---- drawing -------------------------------------------------------------------------
  sx(m) { return TC.JX + (m - this.pos) * TC.PX; },
  drawCrawler(ctx, x, y, t, col, cap, moving) {
    const k = moving ? Math.sin(t * 10) : 0;
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -26, 52, 18, 0, 0, 7); ctx.fill();          // body, flat on the floor
    ellipse(ctx, 60, -34, 15, 16, '#d9a883'); ctx.fillStyle = cap; ctx.beginPath(); ctx.ellipse(62, -44, 17, 8, 0.1, 0, 7); ctx.fill(); // head
    ctx.strokeStyle = col; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(34, -22); ctx.lineTo(62 + k * 14, -6); ctx.moveTo(30, -22); ctx.lineTo(52 - k * 14, -6); ctx.stroke(); // arms
    ctx.strokeStyle = shadeColor(col, -0.3);
    ctx.beginPath(); ctx.moveTo(-44, -22); ctx.lineTo(-90 - k * 12, -10); ctx.moveTo(-40, -26); ctx.lineTo(-86 + k * 12, -18); ctx.stroke(); // legs
    ctx.restore();
  },
  drawDog(ctx, x, t) {
    const d = this.dog, y = TC.GROUND - 8, walk = d.state === 'walk', dir = d.dir;
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    const step = walk ? Math.sin(t * 12) * 8 : 0;
    ctx.strokeStyle = '#2a1e14'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-26, -34); ctx.lineTo(-30 + step, 0); ctx.moveTo(-14, -34); ctx.lineTo(-10 - step, 0); ctx.moveTo(18, -34); ctx.lineTo(22 + step, 0); ctx.moveTo(28, -34); ctx.lineTo(24 - step, 0); ctx.stroke();
    ctx.fillStyle = '#3a2a1a'; ctx.beginPath(); ctx.ellipse(0, -44, 40, 16, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#6a4a2a'; ctx.beginPath(); ctx.ellipse(4, -40, 26, 9, 0, 0, 7); ctx.fill();
    const headDown = d.state === 'warn' ? 16 : 0;
    ellipse(ctx, 40, -60 + headDown, 14, 12, '#3a2a1a'); poly(ctx, [48, -64 + headDown, 70, -56 + headDown, 50, -50 + headDown], '#3a2a1a');
    const ears = d.state === 'listen' ? -18 : -8;
    poly(ctx, [32, -70 + headDown, 38, -70 + ears + headDown, 42, -68 + headDown], '#2a1a0e'); poly(ctx, [40, -70 + headDown, 46, -70 + ears + headDown, 50, -68 + headDown], '#2a1a0e');
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-38, -48); ctx.quadraticCurveTo(-54, -60 - (walk ? Math.sin(t * 16) * 6 : 0), -58, -70); ctx.stroke();
    ctx.restore();
    // the lead running along the wire
    ctx.strokeStyle = 'rgba(120,120,120,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, TC.GROUND - 90); ctx.lineTo(x - dir * 10, TC.GROUND - 50); ctx.stroke();
    if (d.state !== 'walk') {
      ctx.fillStyle = d.state === 'listen' ? '#ff5a4a' : '#f0b35b'; ctx.font = `700 60px ${FONT_UI}`; ctx.textAlign = 'center';
      ctx.fillText(d.state === 'listen' ? '!' : '?', x + dir * 40, TC.GROUND - 110 + Math.sin(t * 8) * 4);
    }
  },
  draw(ctx) {
    const t = G.t;
    const off = W + this.pos * TC.PX - TC.JX;
    ctx.drawImage(this.layer, -off, 0);
    // the searchlight from the tower, sweeping the strip
    const tx = this.sx(70), sweep = Math.sin(t * 0.5) * 520;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = linGrad(ctx, tx, TC.GROUND - 330, tx + sweep, TC.GROUND, [[0, 'rgba(255,245,210,0.4)'], [1, 'rgba(255,245,210,0.05)']]);
    ctx.beginPath(); ctx.moveTo(tx - 10, TC.GROUND - 330); ctx.lineTo(tx + 10, TC.GROUND - 330); ctx.lineTo(tx + sweep + 140, TC.GROUND); ctx.lineTo(tx + sweep - 140, TC.GROUND); ctx.closePath(); ctx.fill();
    ctx.restore();
    // the dog, and its hearing, shown as a faint circle under the strip when it listens
    const dx = this.sx(this.dog.m);
    if (this.dog.state !== 'walk') {
      ctx.save(); ctx.globalAlpha = this.dog.state === 'listen' ? 0.22 : 0.1; ctx.fillStyle = this.dog.state === 'listen' ? '#ff5a4a' : '#f0b35b';
      ctx.beginPath(); ctx.ellipse(dx, TC.GROUND, TC.EAR * TC.PX, TC.BOT - TC.GROUND + 30, 0, 0, Math.PI); ctx.fill(); ctx.restore();
    }
    this.drawDog(ctx, dx, t);
    // Ilse ahead, Jack, and the goose behind
    const floor = TC.BOT - 8;
    this.drawCrawler(ctx, TC.JX + 150, floor, t + 0.5, '#9c1f2e', '#e9dcb4', this.moving);
    this.drawCrawler(ctx, TC.JX, floor, t, '#7a7a70', '#5a5a54', this.moving);
    drawGoose(ctx, TC.JX - 150, floor, 0.4, this.moving ? t : 0, 1);
    // a torch glow in the tunnel
    glow(ctx, TC.JX + 60, TC.TOP + 60, 260, 'rgba(255,200,120,0.18)');
    drawVignette(ctx, 0.55);
    drawGrain(ctx, 0.05);
    this.drawHud(ctx);
  },
  drawHud(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(6,10,14,0.75)'; rrect(ctx, 40, 30, 560, 150, 14); ctx.fill();
    ctx.textAlign = 'left'; ctx.fillStyle = '#f0b35b'; ctx.font = `600 22px ${FONT_UI}`; ctx.fillText('UNDER THE DEATH STRIP', 64, 70);
    ctx.fillStyle = '#f0e4c8'; ctx.font = `600 28px ${FONT_UI}`; ctx.fillText('Crawl to the West', 64, 110);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(64, 132, 500, 12);
    ctx.fillStyle = '#f0b35b'; ctx.fillRect(64, 132, 500 * clamp(this.pos / TC.LEN, 0, 1), 12);
    ctx.textAlign = 'right'; ctx.fillStyle = '#c8d0dc'; ctx.font = `600 ${G.touch ? 26 : 20}px ${FONT_UI}`; ctx.fillText(`${Math.max(0, Math.round(TC.LEN - this.pos))} m to go`, 564, 70);
    // what to do right now, in big letters
    const d = this.dog, near = Math.abs(d.m - this.pos) < TC.EAR + 4;
    const cue = d.state === 'listen' && near ? 'FREEZE!' : d.state === 'warn' && near ? 'The dog is sniffing...' : this.moving ? 'Crawling...' : (G.touch ? 'Hold anywhere to crawl' : 'Hold SPACE or RIGHT to crawl');
    ctx.textAlign = 'center'; ctx.fillStyle = cue === 'FREEZE!' ? '#ff5a4a' : '#f0e4c8'; ctx.font = `700 ${G.touch ? 44 : 34}px ${FONT_UI}`;
    ctx.fillText(cue, W / 2, H - 60);
    if (this.introT < 8) {
      const a = clamp(Math.min(this.introT, 8 - this.introT), 0, 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(6,10,14,0.8)'; rrect(ctx, W / 2 - 560, 540, 1120, 140, 14); ctx.fill();
      ctx.fillStyle = '#f0e4c8'; ctx.font = `500 30px ${FONT_UI}`;
      ctx.fillText(G.touch ? 'Hold your finger on the screen to crawl, lift it to freeze' : 'Hold SPACE (or the RIGHT arrow, or the mouse) to crawl, let go to freeze', W / 2, 596);
      ctx.fillText('When the dog stops and its ears go up, don\'t move', W / 2, 642);
      ctx.globalAlpha = 1;
    }
    if (this.failText) drawLabel(ctx, this.failText, W / 2, H / 2 - 100);
    ctx.restore();
  },
};

const WEST_PAGES = [
  { kicker: 'BERNAUER STRASSE  ·  05:50', amb: ['wind'], text: 'A hundred and forty-five metres of sand, on elbows and knees, with a goose. At the far end a ladder, a cellar full of flour sacks, and a baker who says "Morgen" as if people climb out of his floor every day.' },
];
