// ---------------------------------------------------------------------------
// Rooftop — the action sequence. Run across the rain-soaked roofs of Vienna,
// hide from the searchlights behind chimneys and leap the gaps.
// ---------------------------------------------------------------------------
const ROOF_Y = 800;
const WORLD_W = 6400;
const BEAM_HW = 0.12;

const Rooftop = {
  layers: null,
  segments: [[0, 1300], [1470, 2700], [2890, 4300], [4480, 6400]],
  chimneys: [620, 1080, 1900, 2380, 3200, 3620, 4050, 4900, 5380],
  lights: [
    { x: 820, speed: 0.7, amp: 0.55, ph: 0 },
    { x: 1700, speed: 0.55, amp: 0.6, ph: 1.4 },
    { x: 2350, speed: 0.9, amp: 0.5, ph: 2.2 },
    { x: 3300, speed: 0.65, amp: 0.6, ph: 0.4 },
    { x: 3950, speed: 1.0, amp: 0.5, ph: 3.0 },
    { x: 4800, speed: 0.75, amp: 0.6, ph: 1.0 },
    { x: 5500, speed: 1.1, amp: 0.55, ph: 2.6 },
  ],
  zipX: 6150,

  buildLayers() {
    if (this.layers) return;
    const sky = makeCanvas(W, H), s = sky.getContext('2d');
    paintSky(s, 0, H, '#050b16', '#0e1e34', 'rgba(200,120,70,0.3)');
    ellipse(s, 1500, 200, 46, 46, '#e8ecf0');
    glow(s, 1500, 200, 260, 'rgba(180,210,255,0.3)');
    const far = makeCanvas(W + 1500, H), f = far.getContext('2d');
    paintDome(f, 900, 700, 1.2, '#0c1522', 'rgba(255,170,100,0.12)');
    paintSkyline(f, 17, 760, 260, '#0d1622', 0.7, { x1: W + 1540 });
    f.fillStyle = '#0d1622'; f.fillRect(0, 755, W + 1500, H - 755);
    fog(f, 500, 820, 'rgba(110,140,170,0.25)', 1);
    const mid = makeCanvas(W + 3200, H), m = mid.getContext('2d');
    paintSkyline(m, 23, 860, 300, '#111b27', 0.85, { x1: W + 3240, noDomes: true });
    m.fillStyle = '#111b27'; m.fillRect(0, 855, W + 3200, H - 855);
    painterly(sky, { strokes: 40000 });
    painterly(far, { strokes: 60000 });
    painterly(mid, { strokes: 80000 });
    this.layers = { sky, far, mid };
  },

  start() {
    this.buildLayers();
    G.mode = 'rooftop'; G.paused = false; G.speech = []; G.overlay = null; G.choices = null;
    G.sceneId = 'rooftop';
    this.checkpoint = this.checkpoint && this.retry ? this.checkpoint : 180;
    this.retry = false;
    this.reset();
    this.rain = new Rain(380, { color: 'rgba(190,215,235,0.3)', angle: 0.28 });
    this.introT = 0;
    Sound.playMusic('action');
    Sound.setAmbience(['rain', 'wind', 'gusts', 'sirens', 'searchlights']);
    Sound.setMusicFilter(18000);
    G.fadeTo = 0;
  },
  reset() {
    const j = makeFigure(flag('tux') ? 'jackTux' : 'jack', this.checkpoint, ROOF_Y, { id: 'jack', scale: 1.55, seed: 1 });
    this.j = j;
    this.vx = 0; this.vy = 0; this.onGround = true; this.exposure = 0; this.dead = false; this.done = false;
    this.camX = clamp(j.x - W * 0.35, 0, WORLD_W - W);
    this.still = 0; this.t = 0;
    this.jumpQueued = false;
  },
  groundAt(x) { return this.segments.some(([a, b]) => x >= a && x <= b); },
  inCover(x) { return this.chimneys.find(c => Math.abs(x - c) < 62); },

  key(k, down) {
    if (!down) return;
    if ((k === ' ' || k === 'w' || k === 'W' || k === 'ArrowUp') && this.onGround && !this.dead) this.jumpQueued = true;
  },
  // Touch buttons (logical coordinates).
  btn: { left: [40, H - 250, 190, 190], right: [260, H - 250, 190, 190], jump: [W - 250, H - 250, 210, 210] },
  inBtn(name, x, y) { const [bx, by, bw, bh] = this.btn[name]; return x > bx && x < bx + bw && y > by && y < by + bh; },
  touchStart(x, y) { if (this.inBtn('jump', x, y) && this.onGround) this.jumpQueued = true; },
  click(x, y, button) {
    if (button === 'right' && this.onGround) this.jumpQueued = true;
  },

  update(dt) {
    if (this.done) return;
    const j = this.j;
    this.t += dt; this.introT += dt;
    this.rain.update(dt);
    if (this.dead) return;

    // input: keyboard or holding the mouse on either side of Jack
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
    const speed = 470;
    if (this.onGround) {
      this.vx = dir * speed;
      if (this.jumpQueued) { this.vy = -980; this.onGround = false; Sound.sfx('jump'); if (!dir) this.vx = j.facing * speed; }
    }
    this.jumpQueued = false;
    if (dir) j.facing = dir;

    const before = Math.floor(j.walkPhase / Math.PI);
    j.x = clamp(j.x + this.vx * dt, 40, WORLD_W - 40);
    if (!this.onGround) {
      this.vy += 2500 * dt;
      j.y += this.vy * dt;
      if (j.y >= ROOF_Y && j.y < ROOF_Y + 40 && this.vy > 0 && this.groundAt(j.x)) {
        j.y = ROOF_Y; this.onGround = true; this.vy = 0; Sound.sfx('land');
      }
      if (j.y > H + 200) return this.fail('fell');
    } else if (!this.groundAt(j.x)) {
      this.onGround = false; this.vy = 0;
    }
    j.walking = this.onGround && Math.abs(this.vx) > 0;
    j.running = true;
    j.airborne = !this.onGround;
    if (j.walking) j.walkPhase += Math.abs(this.vx) * dt / (44 * j.scale) * Math.PI * 0.9;
    if (Math.floor(j.walkPhase / Math.PI) !== before && j.walking) Sound.sfx('stepCobble');
    this.still = j.walking || !this.onGround ? 0 : this.still + dt;
    j.crouch = lerp(j.crouch, this.still > 0.08 ? 1 : 0, 0.25);

    // checkpoints at every chimney passed
    for (const c of this.chimneys) if (j.x > c + 70 && c + 20 > this.checkpoint) this.checkpoint = c + 20;

    // searchlight exposure
    // Standing still behind a chimney hides you (the crouch animation catches up).
    const hidden = this.onGround && this.vx === 0 && this.inCover(j.x) !== undefined;
    let lit = false;
    for (const L of this.lights) {
      const a = this.beamAngle(L);
      const tx = j.x, ty = j.y - 110 * (1 - j.crouch * 0.4);
      const ang = Math.atan2(tx - L.x, (ROOF_Y + 420) - ty);
      if (Math.abs(ang - a) < BEAM_HW) lit = true;
    }
    this.lit = lit; this.hidden = hidden;
    if (lit && !hidden) {
      if (this.exposure === 0) Sound.sfx('spotted');
      this.exposure += dt * 2.4;
    } else this.exposure = Math.max(0, this.exposure - dt * 0.3);
    if (this.exposure >= 1) return this.fail('spotted');

    // camera
    const target = clamp(j.x - W * 0.38, 0, WORLD_W - W);
    this.camX += (target - this.camX) * Math.min(1, dt * 5);

    if (j.x >= this.zipX - 30 && this.onGround) this.finish();
  },
  beamAngle(L) { return Math.sin(this.t * L.speed + L.ph) * L.amp; },

  async fail(why) {
    if (this.dead) return;
    this.dead = true;
    Sound.sfx(why === 'spotted' ? 'alarm' : 'whoosh');
    this.failText = why === 'spotted' ? 'SPOTTED! The guards open fire from the courtyard.' : 'You missed the jump.';
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
    j.walking = false; j.crouch = 0; j.arm = 'toast'; j.facing = 1;
    Sound.sfx('zip');
    // slide down the cable into the dark
    const sx = j.x, sy = j.y;
    const t0 = G.t;
    await waitUntil(() => {
      const p = clamp((G.t - t0) / 2.4, 0, 1);
      j.x = sx + ease(p) * 1400; j.y = sy - 170 + ease(p) * 560 + 170 * (1 - Math.min(1, p * 6));
      j.airborne = true;
      this.camX = clamp(this.camX + 4, 0, WORLD_W + 400 - W);
      return p >= 1;
    });
    G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
    await Ending.play();
  },

  draw(ctx) {
    const L = this.layers, cam = this.camX;
    ctx.drawImage(L.sky, 0, 0);
    ctx.drawImage(L.far, -cam * 0.2, 0);
    // beams behind the mid layer too (sky sweep)
    this.drawBeams(ctx, cam, true);
    ctx.drawImage(L.mid, -cam * 0.5, 0);
    this.drawRoofs(ctx, cam);
    // zip line mast + cable
    const zx = this.zipX - cam;
    ctx.fillStyle = '#0a0e12'; ctx.fillRect(zx - 8, ROOF_Y - 300, 16, 300);
    ctx.strokeStyle = 'rgba(180,190,200,0.7)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(zx, ROOF_Y - 290); ctx.lineTo(zx + 1800, ROOF_Y + 400); ctx.stroke();
    glow(ctx, zx, ROOF_Y - 300, 24, 'rgba(255,60,60,0.9)', 0.6 + 0.4 * Math.sin(G.t * 5));
    if (!this.done || true) {
      const j = this.j;
      const draw = { ...j, x: j.x - cam };
      drawFigure(ctx, draw, G.t, { ambient: 'rgba(6,14,28,0.45)', key: this.lit ? 'rgba(230,240,255,0.55)' : 'rgba(150,180,220,0.2)', keyX: this.lit ? draw.x : 0 });
    }
    this.drawBeams(ctx, cam, false);
    this.rain.draw(ctx);
    drawVignette(ctx, 0.75);
    drawGrain(ctx, 0.06);
    this.drawHud(ctx);
  },
  drawBeams(ctx, cam, sky) {
    ctx.save();
    if (!sky) { ctx.beginPath(); ctx.rect(0, 0, W, ROOF_Y + 8); ctx.clip(); }
    ctx.globalCompositeOperation = 'lighter';
    for (const L of this.lights) {
      const x = L.x - cam, y = ROOF_Y + 420;
      if (x < -900 || x > W + 900) continue;
      const a = this.beamAngle(L), len = 1700, hw = BEAM_HW;
      ctx.fillStyle = linGrad(ctx, x, y, x + Math.sin(a) * len, y - Math.cos(a) * len, [[0, sky ? 'rgba(200,220,255,0.12)' : 'rgba(215,230,255,0.28)'], [0.35, sky ? 'rgba(200,220,255,0.06)' : 'rgba(215,230,255,0.16)'], [1, 'rgba(0,0,0,0)']]);
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x + Math.sin(a - hw) * len, y - Math.cos(a - hw) * len);
      ctx.lineTo(x + Math.sin(a + hw) * len, y - Math.cos(a + hw) * len);
      ctx.closePath(); ctx.fill();
      if (!sky) {
        // hot spot where the beam crosses the roof line
        const d = (y - ROOF_Y) / Math.cos(a);
        glow(ctx, x + Math.sin(a) * d, ROOF_Y - 60, 120, 'rgba(220,235,255,0.25)');
      }
    }
    ctx.restore();
  },
  drawRoofs(ctx, cam) {
    for (const [a, b] of this.segments) {
      const x0 = a - cam, x1 = b - cam;
      if (x1 < -50 || x0 > W + 50) continue;
      // building body below the roof
      ctx.fillStyle = linGrad(ctx, 0, ROOF_Y, 0, H, [[0, '#1c232c'], [1, '#07090c']]);
      ctx.fillRect(x0, ROOF_Y, x1 - x0, H - ROOF_Y);
      // windows below
      for (let x = x0 + 40; x < x1 - 40; x += 110) {
        const lit = ((x + cam) * 13 | 0) % 5 === 0;
        ctx.fillStyle = lit ? 'rgba(255,190,110,0.6)' : 'rgba(12,16,22,0.9)';
        ctx.fillRect(x, ROOF_Y + 80, 40, 70);
      }
      // parapet + zinc roof edge
      ctx.fillStyle = '#2e3842'; ctx.fillRect(x0 - 6, ROOF_Y - 8, x1 - x0 + 12, 16);
      ctx.fillStyle = 'rgba(200,215,230,0.35)'; ctx.fillRect(x0 - 6, ROOF_Y - 8, x1 - x0 + 12, 2);
      // gap drop shadow
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x1, ROOF_Y, 12, H - ROOF_Y);
    }
    for (const c of this.chimneys) {
      const x = c - cam;
      if (x < -120 || x > W + 120) continue;
      ctx.fillStyle = linGrad(ctx, x - 50, 0, x + 50, 0, [[0, '#2a1a14'], [0.5, '#5a3426'], [1, '#2a1a14']]);
      ctx.fillRect(x - 50, ROOF_Y - 170, 100, 170);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2;
      for (let y = ROOF_Y - 160; y < ROOF_Y; y += 18) { ctx.beginPath(); ctx.moveTo(x - 50, y); ctx.lineTo(x + 50, y); ctx.stroke(); }
      ctx.fillStyle = '#3a2a22'; ctx.fillRect(x - 58, ROOF_Y - 184, 116, 18);
      for (const px of [-26, 0, 26]) { ctx.fillStyle = '#6b3a24'; ctx.fillRect(x + px - 7, ROOF_Y - 214, 14, 30); }
      // steam
      const st = (G.t * 0.3 + c) % 1;
      ctx.save(); ctx.globalAlpha = (1 - st) * 0.15; ellipse(ctx, x + st * 40, ROOF_Y - 220 - st * 120, 20 + st * 40, 14 + st * 20, '#cfd8e0'); ctx.restore();
    }
  },
  drawHud(ctx) {
    ctx.save();
    // exposure meter
    const x = W / 2 - 200, y = 40;
    ctx.fillStyle = 'rgba(6,10,14,0.7)'; rrect(ctx, x - 20, y - 16, 440, 64, 10); ctx.fill();
    ctx.font = `600 20px ${FONT_UI}`; ctx.textAlign = 'left';
    ctx.fillStyle = this.hidden ? '#8fe0b0' : this.lit ? '#ff9a9a' : '#cfc6b4';
    ctx.fillText(this.hidden ? 'HIDDEN' : this.lit ? 'IN THE LIGHT' : 'EXPOSURE', x, y + 6);
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(x, y + 16, 400, 12);
    ctx.fillStyle = this.exposure > 0.6 ? '#ff4a4a' : '#f0b35b'; ctx.fillRect(x, y + 16, 400 * clamp(this.exposure, 0, 1), 12);
    // progress
    const p = clamp(this.j.x / this.zipX, 0, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(64, H - 60, 300, 4);
    ctx.fillStyle = '#f0b35b'; ctx.fillRect(64, H - 60, 300 * p, 4);
    ctx.font = `600 18px ${FONT_UI}`; ctx.fillStyle = '#cfc6b4'; ctx.fillText('DISTANCE TO THE ZIP LINE', 64, H - 72);
    // instructions
    if (this.introT < 9) {
      const a = clamp(Math.min(this.introT, 9 - this.introT), 0, 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(6,10,14,0.75)'; rrect(ctx, W / 2 - 520, H - 250, 1040, 150, 14); ctx.fill();
      ctx.textAlign = 'center'; ctx.fillStyle = '#f0b35b'; ctx.font = `600 24px ${FONT_UI}`;
      ctx.fillText('ESCAPE ACROSS THE ROOFTOPS', W / 2, H - 208);
      ctx.fillStyle = '#f0e4c8'; ctx.font = `500 30px ${FONT_UI}`;
      ctx.fillText(G.touch ? 'Hold the arrow buttons to run   ·   Tap JUMP to leap the gaps' : 'A / D or ← / → to run   ·   SPACE to jump the gaps', W / 2, H - 164);
      ctx.fillText('Stop behind a chimney to crouch and hide from the searchlights', W / 2, H - 124);
      ctx.globalAlpha = 1;
    }
    if (this.failText) drawLabel(ctx, this.failText, W / 2, H / 2);
    if (G.touch) {
      // on-screen controls
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
