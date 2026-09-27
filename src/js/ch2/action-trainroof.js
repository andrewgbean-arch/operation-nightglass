// ---------------------------------------------------------------------------
// Train roof — the action sequence. The Iron Arrow thunders through the
// mountains at night. Run forward along the carriage roofs, leap the gaps
// between the cars, and stop to crouch as the signal gantries sweep overhead.
// ---------------------------------------------------------------------------
const TR_ROOF = 800;           // roof line on screen
const TR_CAR = 1150, TR_GAP = 120, TR_CARS = 6;
const TR_END = TR_CARS * (TR_CAR + TR_GAP) - TR_GAP - 60;

const TrainRoof = {
  layers: null,

  buildLayers() {
    if (this.layers) return;
    const sky = makeCanvas(W, H), s = sky.getContext('2d');
    s.fillStyle = linGrad(s, 0, 0, 0, H, [[0, '#02050c'], [0.6, '#0c1830'], [1, '#1a2640']]); s.fillRect(0, 0, W, H);
    const r = rng(4); for (let i = 0; i < 260; i++) ellipse(s, r() * W, r() * 600, r() * 1.4 + 0.3, r() * 1.4 + 0.3, `rgba(255,255,255,${0.3 + r() * 0.6})`);
    ellipse(s, 1500, 170, 50, 50, '#eef2f6'); glow(s, 1500, 170, 320, 'rgba(180,200,255,0.3)');
    const far = makeCanvas(2400, H), f = far.getContext('2d');
    paintMountains(f, 11, 760, 420, '#101c32', 'rgba(210,225,245,0.5)', 0, 2400);
    fog(f, 560, 800, 'rgba(150,170,200,0.2)', 1);
    const mid = makeCanvas(2400, H), m = mid.getContext('2d');
    paintMountains(m, 17, 860, 200, '#0a1222', 'rgba(200,215,240,0.3)', 0, 2400);
    paintPines(m, 5, 880, 200, '#060b16', 0, 2400, 0.7);
    m.fillStyle = '#dfe6ee'; m.fillRect(0, 878, 2400, 10);
    painterly(sky, { strokes: 30000 });
    painterly(far, { strokes: 50000 });
    painterly(mid, { strokes: 60000 });
    this.layers = { sky, far, mid };
  },

  start() {
    this.buildLayers();
    G.mode = 'action'; G.action = this; G.paused = false; G.speech = []; G.overlay = null; G.choices = null;
    G.sceneId = 'trainroof';
    this.checkpoint = this.checkpoint && this.retry ? this.checkpoint : 160;
    this.retry = false;
    this.reset();
    this.snow = new Snow(360, { wind: -900, speed: 160, x0: 0, x1: W + 600, size: 0.9 });
    this.introT = 0;
    Sound.playMusic('action');
    Sound.setAmbience(['trainRumble', 'snowWind']);
    Sound.setMusicFilter(18000);
    G.fadeTo = 0;
  },
  reset() {
    this.j = makeFigure(flag('railCoat') ? 'jackRail' : 'jackCoat', this.checkpoint, TR_ROOF, { id: 'jack', scale: 1.5, seed: 1 });
    this.vx = 0; this.vy = 0; this.onGround = true; this.dead = false; this.done = false;
    this.camX = clamp(this.j.x - W * 0.3, 0, TR_END + 400 - W);
    this.still = 0; this.t = 0; this.jumpQueued = false;
    this.gantries = []; this.nextGantry = this.introT > 8 ? 3 : 7;
  },
  onRoof(x) {
    const k = Math.floor(x / (TR_CAR + TR_GAP)), off = x - k * (TR_CAR + TR_GAP);
    return k >= 0 && k < TR_CARS && off <= TR_CAR;
  },
  gapAhead(x, within) {
    for (let k = 0; k < TR_CARS - 1; k++) { const g = k * (TR_CAR + TR_GAP) + TR_CAR; if (g > x - 40 && g < x + within) return true; }
    return false;
  },

  key(k, down) {
    if (!down) return;
    if ((k === ' ' || k === 'w' || k === 'W' || k === 'ArrowUp') && this.onGround && !this.dead) this.jumpQueued = true;
  },
  btn: { left: [40, H - 250, 190, 190], right: [260, H - 250, 190, 190], jump: [W - 250, H - 250, 210, 210] },
  inBtn(name, x, y) { const [bx, by, bw, bh] = this.btn[name]; return x > bx && x < bx + bw && y > by && y < by + bh; },
  touchStart(x, y) { if (this.inBtn('jump', x, y) && this.onGround) this.jumpQueued = true; },
  click(x, y, button) { if (button === 'right' && this.onGround) this.jumpQueued = true; },

  update(dt) {
    if (this.done) return;
    const j = this.j;
    this.t += dt; this.introT += dt;
    this.snow.update(dt);
    if (this.dead) return;

    let dir = 0;
    if (KEYS.ArrowRight || KEYS.d || KEYS.D) dir += 1;
    if (KEYS.ArrowLeft || KEYS.a || KEYS.A) dir -= 1;
    for (const t of Object.values(G.touches || {})) {
      if (this.inBtn('right', t.x, t.y)) dir = 1;
      if (this.inBtn('left', t.x, t.y)) dir = -1;
    }
    if (!dir && G.mouse.down && !G.touch) {
      const sx = j.x - this.camX;
      if (Math.abs(G.mouse.x - sx) > 40) dir = G.mouse.x > sx ? 1 : -1;
    }
    // Running into a freezing headwind: forward is slower than back.
    const speed = dir > 0 ? 400 : 330;
    if (this.onGround) {
      this.vx = dir * speed;
      if (this.jumpQueued) { this.vy = -960; this.onGround = false; Sound.sfx('jump'); if (!dir) this.vx = j.facing * 400; }
    }
    this.jumpQueued = false;
    if (dir) j.facing = dir;

    const before = Math.floor(j.walkPhase / Math.PI);
    j.x = clamp(j.x + this.vx * dt, 40, TR_END + 200);
    if (!this.onGround) {
      this.vy += 2500 * dt;
      j.y += this.vy * dt;
      if (j.y >= TR_ROOF && j.y < TR_ROOF + 40 && this.vy > 0 && this.onRoof(j.x)) { j.y = TR_ROOF; this.onGround = true; this.vy = 0; Sound.sfx('land'); }
      if (j.y > H + 200) return this.fail('fell');
    } else if (!this.onRoof(j.x)) { this.onGround = false; this.vy = 0; }
    j.walking = this.onGround && Math.abs(this.vx) > 0;
    j.running = true;
    j.airborne = !this.onGround;
    if (j.walking) j.walkPhase += Math.abs(this.vx) * dt / (44 * j.scale) * Math.PI * 0.9;
    if (Math.floor(j.walkPhase / Math.PI) !== before && j.walking) Sound.sfx('stepWood');
    this.still = j.walking || !this.onGround ? 0 : this.still + dt;
    j.crouch = lerp(j.crouch, this.still > 0.06 ? 1 : 0, 0.3);

    // checkpoint at the start of each carriage
    const car = Math.floor(j.x / (TR_CAR + TR_GAP));
    const cp = car * (TR_CAR + TR_GAP) + 120;
    if (this.onGround && cp > this.checkpoint && j.x > cp) this.checkpoint = cp;

    // signal gantries sweep back along the train at line speed
    this.nextGantry -= dt;
    if (this.nextGantry <= 0 && !this.gapAhead(j.x, 700)) {
      this.gantries.push({ x: j.x + 1900, warned: false, passed: false });
      this.nextGantry = 3.6 + Math.random() * 2.4;
    }
    for (const g of this.gantries) {
      g.x -= 950 * dt;
      if (!g.warned && g.x - j.x < 1500) { g.warned = true; Sound.sfx('horn'); }
      if (!g.passed && Math.abs(g.x - j.x) < 30) {
        g.passed = true;
        Sound.sfx('gantry');
        const low = this.onGround && j.crouch > 0.6;
        if (!low) return this.fail('gantry');
      }
    }
    this.gantries = this.gantries.filter(g => g.x > this.camX - 400);

    const target = clamp(j.x - W * 0.3, 0, TR_END + 400 - W);
    this.camX += (target - this.camX) * Math.min(1, dt * 5);
    if (j.x >= TR_END && this.onGround) this.finish();
  },

  async fail(why) {
    if (this.dead) return;
    this.dead = true;
    Sound.sfx(why === 'gantry' ? 'thud' : 'whoosh');
    this.failText = why === 'gantry' ? 'Knocked flat by a signal gantry! Stop and crouch as they pass.' : 'You fell between the carriages.';
    await wait(1.6);
    G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
    this.reset();
    this.failText = null;
    G.fadeTo = 0;
  },
  async finish() {
    if (this.done) return;
    this.done = true;
    const j = this.j;
    j.walking = false; j.crouch = 1;
    await wait(0.6);
    // swing down over the edge and in through a window
    const sy = j.y, t0 = G.t;
    await waitUntil(() => { const p = clamp((G.t - t0) / 1.2, 0, 1); j.y = sy + ease(p) * 260; j.airborne = true; return p >= 1; });
    G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
    G.mode = 'play'; G.paused = false; G.speech = []; G.choices = null; G.overlay = null;
    G.sceneId = null; G.fade = 1;
    await gotoScene('sleeper', 1500, 900, -1, { instant: true, sfx: 'window' });
  },

  draw(ctx) {
    const L = this.layers, cam = this.camX, t = G.t;
    ctx.drawImage(L.sky, 0, 0);
    // the landscape rushes backwards: the train itself is moving at speed
    const farOff = (t * 60 + cam * 0.1) % 2400, midOff = (t * 260 + cam * 0.3) % 2400;
    for (let k = 0; k < 2; k++) ctx.drawImage(L.far, -farOff + k * 2400, 0);
    for (let k = 0; k < 2; k++) ctx.drawImage(L.mid, -midOff + k * 2400, 0);
    // smoke from the locomotive streaming back over the train
    for (let k = 0; k < 14; k++) {
      const p = (t * 0.35 + k / 14) % 1;
      ctx.save(); ctx.globalAlpha = (1 - p) * 0.22;
      ellipse(ctx, W + 200 - p * (W + 600), 520 - Math.sin(p * 3) * 80 + Math.sin(k) * 40, 90 + p * 220, 50 + p * 90, '#2a3040');
      ctx.restore();
    }
    this.drawTrain(ctx, cam);
    // gantries behind the figure: posts and the beam
    for (const g of this.gantries) this.drawGantry(ctx, g.x - cam, false);
    const j = this.j;
    drawFigure(ctx, { ...j, x: j.x - cam }, t, { ambient: 'rgba(6,14,30,0.45)', key: 'rgba(170,190,230,0.35)', keyX: W });
    for (const g of this.gantries) this.drawGantry(ctx, g.x - cam, true);
    this.snow.draw(ctx);
    drawVignette(ctx, 0.8);
    drawGrain(ctx, 0.06);
    this.drawHud(ctx);
  },
  drawTrain(ctx, cam) {
    for (let k = 0; k < TR_CARS; k++) {
      const x0 = k * (TR_CAR + TR_GAP) - cam, x1 = x0 + TR_CAR;
      if (x1 < -60 || x0 > W + 60) continue;
      const mail = k === 0, sleeper = k === TR_CARS - 1;
      const body = mail ? '#2a2e26' : '#1e3a2a';
      ctx.fillStyle = linGrad(ctx, 0, TR_ROOF, 0, H, [[0, shadeColor(body, 0.1)], [1, shadeColor(body, -0.5)]]);
      ctx.fillRect(x0, TR_ROOF + 20, TR_CAR, H - TR_ROOF);
      if (!mail) for (let x = x0 + 40; x < x1 - 80; x += 120) { ctx.fillStyle = sleeper ? 'rgba(255,200,130,0.8)' : 'rgba(255,200,130,0.55)'; ctx.fillRect(x, TR_ROOF + 90, 80, 110); }
      ctx.fillStyle = '#d8c89a'; ctx.fillRect(x0, TR_ROOF + 230, TR_CAR, 10);
      // curved roof with ventilators and snow
      ctx.fillStyle = linGrad(ctx, 0, TR_ROOF - 6, 0, TR_ROOF + 40, [[0, '#5a6470'], [0.4, '#2a3038'], [1, '#101418']]);
      rrect(ctx, x0 - 8, TR_ROOF - 6, TR_CAR + 16, 46, 16); ctx.fill();
      snowLedge(ctx, x0, TR_ROOF + 2, TR_CAR, 12);
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
      for (let x = x0 + 60; x < x1; x += 60) { ctx.beginPath(); ctx.moveTo(x, TR_ROOF + 12); ctx.lineTo(x, TR_ROOF + 38); ctx.stroke(); }
      for (let x = x0 + 90; x < x1 - 60; x += 260) { ctx.fillStyle = '#20262c'; ctx.fillRect(x, TR_ROOF - 22, 40, 20); ctx.fillStyle = 'rgba(228,234,240,0.8)'; ctx.fillRect(x, TR_ROOF - 26, 40, 5); }
      if (sleeper) { ctx.fillStyle = '#f0b35b'; ctx.font = `600 22px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('SLEEPING CAR', x0 + TR_CAR / 2, TR_ROOF + 272); }
      // the coupling and the drop between cars
      if (k < TR_CARS - 1) {
        ctx.fillStyle = '#000'; ctx.fillRect(x1, TR_ROOF + 30, TR_GAP, H);
        ctx.fillStyle = '#2a2e32'; ctx.fillRect(x1, TR_ROOF + 200, TR_GAP, 30);
        const sp = (G.t * 2000) % 60; ctx.fillStyle = 'rgba(120,130,140,0.4)'; for (let y = TR_ROOF + 260; y < H; y += 60) ctx.fillRect(x1 + 10, y + sp - 30, TR_GAP - 20, 4); // sleepers rushing below
      }
    }
    // the end of the train and the goal marker
    const gx = TR_END - cam;
    glow(ctx, gx, TR_ROOF - 20, 60, 'rgba(240,179,91,0.6)', 0.5 + 0.5 * Math.sin(G.t * 4));
  },
  drawGantry(ctx, x, front) {
    if (x < -200 || x > W + 200) return;
    const low = TR_ROOF - 235;
    if (!front) {
      // the far post, beyond the train
      ctx.fillStyle = '#1a2230'; ctx.fillRect(x - 8, low - 20, 16, TR_ROOF - low + 40);
      return;
    }
    // the girder seen end-on over the roof, lit by the train's lamps, and the near post
    ctx.fillStyle = linGrad(ctx, 0, low - 40, 0, low + 6, [[0, '#8a96a6'], [0.5, '#4a5462'], [1, '#232a34']]);
    ctx.fillRect(x - 70, low - 40, 140, 46);
    ctx.strokeStyle = '#1a2028'; ctx.lineWidth = 4;
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x - 70 + k * 35, low - 40); ctx.lineTo(x - 35 + k * 35, low + 6); ctx.stroke(); }
    ctx.strokeRect(x - 70, low - 40, 140, 46);
    ctx.fillStyle = 'rgba(230,236,244,0.9)'; ctx.fillRect(x - 70, low - 46, 140, 7); // snow on top
    ctx.fillStyle = linGrad(ctx, x + 60, 0, x + 84, 0, [[0, '#3a4450'], [1, '#161c24']]); ctx.fillRect(x + 60, low - 40, 24, H);
    const on = Math.sin(G.t * 10) > 0;
    glow(ctx, x - 40, low - 60, 40, 'rgba(255,50,40,0.9)', on ? 1 : 0.3); ellipse(ctx, x - 40, low - 60, 8, 8, on ? '#ff6a5a' : '#6a1a14');
    glow(ctx, x + 40, low - 60, 40, 'rgba(255,50,40,0.9)', on ? 0.3 : 1); ellipse(ctx, x + 40, low - 60, 8, 8, on ? '#6a1a14' : '#ff6a5a');
  },
  drawHud(ctx) {
    ctx.save();
    const near = this.gantries.find(g => g.x - this.j.x > 0 && g.x - this.j.x < 1300);
    if (near && !this.dead) {
      const a = 0.6 + 0.4 * Math.sin(G.t * 14);
      ctx.globalAlpha = a; ctx.fillStyle = 'rgba(160,20,20,0.75)'; rrect(ctx, W - 520, 184, 460, 70, 12); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `700 34px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('GANTRY AHEAD · CROUCH!', W - 290, 230);
      ctx.globalAlpha = 1;
    }
    const p = clamp(this.j.x / TR_END, 0, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(64, H - 60, 300, 4);
    ctx.fillStyle = '#f0b35b'; ctx.fillRect(64, H - 60, 300 * p, 4);
    ctx.font = `600 18px ${FONT_UI}`; ctx.fillStyle = '#cfc6b4'; ctx.textAlign = 'left'; ctx.fillText('DISTANCE TO THE SLEEPING CARS', 64, H - 72);
    if (this.introT < 10) {
      const a = clamp(Math.min(this.introT, 10 - this.introT), 0, 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(6,10,14,0.75)'; rrect(ctx, W / 2 - 540, H - 250, 1080, 150, 14); ctx.fill();
      ctx.textAlign = 'center'; ctx.fillStyle = '#f0b35b'; ctx.font = `600 24px ${FONT_UI}`;
      ctx.fillText('RUN FOR THE SLEEPING CARS', W / 2, H - 208);
      ctx.fillStyle = '#f0e4c8'; ctx.font = `500 30px ${FONT_UI}`;
      ctx.fillText(G.touch ? 'Hold the arrow buttons to run   ·   Tap JUMP between the carriages' : 'A / D or ← / → to run   ·   SPACE to jump between the carriages', W / 2, H - 164);
      ctx.fillText('When a gantry comes, stop running: Jack crouches and it passes over him', W / 2, H - 124);
      ctx.globalAlpha = 1;
    }
    if (this.failText) drawLabel(ctx, this.failText, W / 2, H / 2);
    if (G.touch) {
      const held = n => Object.values(G.touches || {}).some(t => this.inBtn(n, t.x, t.y));
      for (const n of ['left', 'right', 'jump']) {
        const [bx, by, bw, bh] = this.btn[n];
        ctx.globalAlpha = held(n) ? 0.75 : 0.4;
        ctx.fillStyle = 'rgba(8,12,18,0.8)'; ctx.beginPath(); ctx.arc(bx + bw / 2, by + bh / 2, bw / 2, 0, 7); ctx.fill();
        ctx.strokeStyle = '#f0e4c8'; ctx.lineWidth = 4; ctx.stroke();
        ctx.fillStyle = '#f0e4c8'; ctx.textAlign = 'center';
        if (n === 'jump') { ctx.font = `700 44px ${FONT_UI}`; ctx.fillText('JUMP', bx + bw / 2, by + bh / 2 + 16); }
        else { const d = n === 'right' ? 1 : -1, cx = bx + bw / 2, cy = by + bh / 2; ctx.beginPath(); ctx.moveTo(cx + d * 34, cy); ctx.lineTo(cx - d * 22, cy - 38); ctx.lineTo(cx - d * 22, cy + 38); ctx.closePath(); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  },
};
