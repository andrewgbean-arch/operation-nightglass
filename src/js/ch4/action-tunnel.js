// ---------------------------------------------------------------------------
// The service tunnel — the action sequence. Jack drives an aircraft tug flat
// out through the tunnel under the mountain, seen from behind. Switch lanes to
// dodge crates, fuel drums and oncoming trucks. Whatever you do, do not run
// over the goose.
// ---------------------------------------------------------------------------
const TN_F = 700, TN_VX = W / 2, TN_VY = 470, TN_CAMH = 1.6;
const TN_LANES = [-1.8, 0, 1.8];
const TN_END = 900;
const TN_TUG_Z = 2.6;

// The course, by distance along the tunnel: [metres, type, lanes blocked]
const TN_COURSE = (() => {
  const c = [], r = rng(44);
  const pattern = [[0], [2], [1], [0, 1], [1, 2], [0, 2], [1], [0], [2]];
  let s = 60;
  while (s < TN_END - 60) {
    const lanes = pattern[Math.floor(r() * pattern.length)];
    const type = lanes.length === 2 && r() < 0.35 ? 'barrier' : r() < 0.2 ? 'truck' : r() < 0.55 ? 'crates' : 'drums';
    if (type === 'barrier') c.push([s, 'barrier', lanes]);
    else for (const l of lanes) c.push([s, type, [l]]);
    s += 34 + r() * 16;
  }
  c.push([TN_END - 120, 'goose', [1]]);
  return c;
})();

const TunnelRun = {
  start() {
    G.mode = 'action'; G.action = this; G.paused = false; G.speech = []; G.overlay = null; G.choices = null;
    G.sceneId = 'tunnel';
    this.checkpoint = this.retry ? this.checkpoint : 0;
    this.retry = false;
    this.lines = {};
    this.introT = 0;
    this.reset();
    Sound.playMusic('tunnel');
    Sound.setAmbience(['tugMotor', 'klaxon']);
    Sound.setMusicFilter(18000);
    G.fadeTo = 0;
  },
  reset() {
    this.dist = this.checkpoint; this.v = 16; this.lane = 1; this.x = 0; this.camX = 0;
    this.dead = false; this.done = false; this.crash = 0; this.t = 0; this.failText = null;
    this.obs = TN_COURSE.filter(o => o[0] > this.dist + 25).map(([s, type, lanes]) => ({ s, type, lanes, hit: false, dx: 0 }));
  },
  line(key, who, text) {
    if (this.lines[key] || G.speech.length) return;
    this.lines[key] = true;
    say(who, text, { pos: [W / 2, 250] });
  },
  steer(d) {
    if (this.dead || this.done) return;
    const n = clamp(this.lane + d, 0, 2);
    if (n !== this.lane) { this.lane = n; Sound.sfx('skid'); }
  },
  key(k, down) {
    if (!down) return;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') this.steer(-1);
    if (k === 'ArrowRight' || k === 'd' || k === 'D') this.steer(1);
  },
  touchStart(x) { this.steer(x < W / 2 ? -1 : 1); },
  click(x) { this.steer(x < W / 2 ? -1 : 1); },

  update(dt) {
    if (this.done) return;
    this.t += dt; this.introT += dt;
    if (this.dead) { this.crash += dt; return; }
    this.v = Math.min(21, this.v + dt * 0.12);
    this.dist += this.v * dt;
    this.x += (TN_LANES[this.lane] - this.x) * Math.min(1, dt * 10);
    this.camX += (this.x * 0.55 - this.camX) * Math.min(1, dt * 4);
    // checkpoints every quarter of the way
    const cp = Math.floor(this.dist / (TN_END / 4)) * (TN_END / 4);
    if (cp > this.checkpoint) this.checkpoint = cp;
    for (const o of this.obs) {
      if (o.type === 'truck') o.s -= 9 * dt; // oncoming
      if (o.type === 'goose') o.dx = Math.sin(this.t * 2) * 0.3;
      const z = o.s - this.dist;
      if (o.hit || z > TN_TUG_Z + 0.9 || z < TN_TUG_Z - 0.6) continue;
      const blocked = o.lanes.some(l => Math.abs(TN_LANES[l] + o.dx - this.x) < 1.0);
      if (blocked) { o.hit = true; return this.fail(o.type); }
    }
    this.obs = this.obs.filter(o => o.s - this.dist > 0.5);
    if (this.t > 1.5) this.line('pig', 'jack', 'She\'s right. It steers like a pig.');
    if (this.dist > TN_END - 170) this.line('goose', 'jack', 'Colonel?! Get out of the road!');
    if (this.dist >= TN_END) this.finish();
  },
  async fail(type) {
    if (this.dead) return;
    this.dead = true; this.crash = 0;
    this.fails = (this.fails || 0) + 1;
    if (type === 'goose') { Sound.sfx('honk'); this.failText = 'You cannot run over the Colonel! Steer round her.'; }
    else { Sound.sfx('thud'); Sound.sfx('clank'); this.failText = type === 'truck' ? 'Head on into a truck! Watch for headlights, and change lanes early.' : 'Crashed! Use ← and → (or tap left and right) to change lanes.'; }
    await wait(1.8);
    G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
    G.speech = [];
    this.reset();
    G.fadeTo = 0;
  },
  async finish() {
    if (this.done) return;
    this.done = true;
    Sound.sfx('skid');
    G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
    G.mode = 'play'; G.paused = false; G.speech = []; G.choices = null; G.overlay = null;
    G.sceneId = null; G.fade = 1;
    await gotoScene('runway', 560, 960, 1, { instant: true });
  },

  // ---- drawing -------------------------------------------------------------------
  proj(x, y, z) { const p = TN_F / z; return [TN_VX + (x - this.camX) * p, TN_VY + (TN_CAMH - y) * p, p]; },
  draw(ctx) {
    const t = G.t, shake = this.dead ? Math.max(0, 1 - this.crash * 2) * 14 : Math.sin(t * 40) * 1.5;
    ctx.save(); ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    ctx.fillStyle = '#07080a'; ctx.fillRect(-20, -20, W + 40, H + 40);
    const remaining = TN_END - this.dist;
    // the light at the end of the tunnel
    if (remaining < 200) {
      const [x0, y0] = this.proj(-3.6, 4.2, Math.max(3, remaining)), [x1, y1] = this.proj(3.6, 0, Math.max(3, remaining));
      ctx.fillStyle = '#1a2440'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      glow(ctx, (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0), 'rgba(150,190,255,0.4)');
    }
    // road, walls and ceiling as a far-to-near stack of slices
    const step = 6, off = this.dist % step;
    for (let z = 120 - off; z > 1.2; z -= step) {
      const zn = Math.max(1.2, z - step);
      const shade = clamp(1 - z / 120, 0, 1);
      const far = [this.proj(-3.6, 0, z), this.proj(3.6, 0, z), this.proj(3.6, 4.2, z), this.proj(-3.6, 4.2, z)];
      const near = [this.proj(-3.6, 0, zn), this.proj(3.6, 0, zn), this.proj(3.6, 4.2, zn), this.proj(-3.6, 4.2, zn)];
      const quad = (a, b, c, d, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill(); };
      const k = Math.round(z / step) % 2;
      quad(far[0], far[1], near[1], near[0], `rgba(${60 + k * 8},${62 + k * 8},${68 + k * 8},${shade})`); // road
      quad(far[0], far[3], near[3], near[0], `rgba(${44 + k * 6},${42 + k * 6},${46 + k * 6},${shade})`); // left wall
      quad(far[1], far[2], near[2], near[1], `rgba(${44 + k * 6},${42 + k * 6},${46 + k * 6},${shade})`); // right wall
      quad(far[3], far[2], near[2], near[3], `rgba(${24 + k * 4},${24 + k * 4},${28 + k * 4},${shade})`); // ceiling
      // lane dashes and hazard stripes along the walls
      if (k) for (const lx of [-0.9, 0.9]) { const zz = Math.max(1.2, z - step * 0.5); quad(this.proj(lx - 0.06, 0, z), this.proj(lx + 0.06, 0, z), this.proj(lx + 0.06, 0, zz), this.proj(lx - 0.06, 0, zz), `rgba(232,224,204,${shade * 0.6})`); }
      if (k) { const a = this.proj(-3.6, 0.6, z), b = this.proj(-3.6, 0.9, z); ctx.fillStyle = `rgba(232,200,58,${shade * 0.6})`; ctx.fillRect(a[0] - 2, b[1], 6, a[1] - b[1]); const c = this.proj(3.6, 0.6, z), d = this.proj(3.6, 0.9, z); ctx.fillRect(c[0] - 2, d[1], 6, c[1] - d[1]); }
      // ceiling lamps
      if (k) { const [lx, ly, p] = this.proj(0, 4.1, z); ellipse(ctx, lx, ly, 0.5 * p, 0.12 * p, `rgba(255,210,140,${shade})`); glow(ctx, lx, ly + 0.4 * p, 1.6 * p, `rgba(255,190,110,${shade * 0.25})`); }
      // red alarm beacons on the walls
      if (Math.round(z / step) % 5 === 0) { const [bx, by, p] = this.proj(-3.5, 3.2, z); const on = Math.sin(t * 8) > 0; glow(ctx, bx, by, 0.8 * p, `rgba(255,40,30,${shade * (on ? 0.7 : 0.15)})`); }
    }
    // obstacles, far to near
    const vis = this.obs.map(o => ({ o, z: o.s - this.dist })).filter(v => v.z > 1.2 && v.z < 120).sort((a, b) => b.z - a.z);
    for (const { o, z } of vis) this.drawObstacle(ctx, o, z, t);
    this.drawTug(ctx, t);
    ctx.restore();
    if (this.dead) { ctx.save(); ctx.globalAlpha = clamp(0.7 - this.crash, 0, 0.7); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    drawVignette(ctx, 0.85);
    drawGrain(ctx, 0.06);
    this.drawHud(ctx);
  },
  drawObstacle(ctx, o, z, t) {
    const shade = clamp(1.15 - z / 90, 0.15, 1);
    ctx.save(); ctx.globalAlpha = shade;
    for (const l of o.lanes) {
      const x = TN_LANES[l] + o.dx;
      if (o.type === 'crates') {
        for (const [cx, cy, s] of [[-0.45, 0, 0.8], [0.4, 0, 0.8], [0, 0.8, 0.8]]) {
          const [x0, y0] = this.proj(x + cx - s / 2, cy + s, z), [x1, y1] = this.proj(x + cx + s / 2, cy, z);
          ctx.fillStyle = '#8a6a3a'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
          ctx.strokeStyle = '#4a3418'; ctx.lineWidth = Math.max(1, (x1 - x0) * 0.06); ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.moveTo(x1, y0); ctx.lineTo(x0, y1); ctx.stroke();
        }
      }
      if (o.type === 'drums') {
        for (const dx of [-0.4, 0.4]) {
          const [x0, y0] = this.proj(x + dx - 0.32, 1.0, z), [x1, y1] = this.proj(x + dx + 0.32, 0, z);
          ctx.fillStyle = linGrad(ctx, x0, 0, x1, 0, [[0, '#6a1414'], [0.5, '#c82a2a'], [1, '#6a1414']]); ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
          ctx.fillStyle = 'rgba(0,0,0,0.3)'; for (const f of [0.3, 0.7]) ctx.fillRect(x0, y0 + (y1 - y0) * f, x1 - x0, Math.max(1, (y1 - y0) * 0.05));
          ctx.fillStyle = '#e8c83a'; ctx.fillRect(x0 + (x1 - x0) * 0.3, y0 + (y1 - y0) * 0.42, (x1 - x0) * 0.4, (y1 - y0) * 0.16);
        }
      }
      if (o.type === 'truck') {
        const [x0, y0, p] = this.proj(x - 1.1, 2.6, z), [x1, y1] = this.proj(x + 1.1, 0.2, z);
        ctx.fillStyle = '#3a4430'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
        ctx.fillStyle = '#2a3222'; ctx.fillRect(x0, y0 + (y1 - y0) * 0.55, x1 - x0, (y1 - y0) * 0.45);
        ctx.fillStyle = 'rgba(150,180,210,0.6)'; ctx.fillRect(x0 + (x1 - x0) * 0.1, y0 + (y1 - y0) * 0.12, (x1 - x0) * 0.8, (y1 - y0) * 0.3);
        ctx.fillStyle = '#b31c2e'; ctx.fillRect(x0 + (x1 - x0) * 0.45, y0 + (y1 - y0) * 0.62, (x1 - x0) * 0.1, (y1 - y0) * 0.1);
        for (const f of [0.15, 0.85]) { const hx = x0 + (x1 - x0) * f, hy = y0 + (y1 - y0) * 0.75; ellipse(ctx, hx, hy, 0.16 * p, 0.16 * p, '#fff8e0'); ctx.globalAlpha = 1; glow(ctx, hx, hy, 0.9 * p, 'rgba(255,245,210,0.7)'); ctx.globalAlpha = shade; }
        const [wx0, wy] = this.proj(x - 1.0, 0, z), [wx1] = this.proj(x + 1.0, 0, z);
        ellipse(ctx, wx0 + 0.25 * p, wy - 0.25 * p, 0.25 * p, 0.25 * p, '#0a0a0a'); ellipse(ctx, wx1 - 0.25 * p, wy - 0.25 * p, 0.25 * p, 0.25 * p, '#0a0a0a');
      }
      if (o.type === 'goose') {
        const [gx, gy, p] = this.proj(x, 0, z);
        ctx.globalAlpha = 1;
        drawGoose(ctx, gx, gy, p / 170, t * 2, Math.sin(this.t * 2) > 0 ? 1 : -1);
      }
    }
    if (o.type === 'barrier') {
      const xs = o.lanes.map(l => TN_LANES[l]);
      const [x0, y0, p] = this.proj(Math.min(...xs) - 0.9, 1.2, z), [x1, y1] = this.proj(Math.max(...xs) + 0.9, 0.9, z);
      const n = 10, w = (x1 - x0) / n;
      for (let k = 0; k < n; k++) { ctx.fillStyle = k % 2 ? '#f0ece4' : '#c82a2a'; ctx.fillRect(x0 + k * w, y0, w + 1, y1 - y0); }
      for (const px of [x0, x1]) { const [, gy] = this.proj(0, 0, z); ctx.fillStyle = '#2a2a2a'; ctx.fillRect(px - 0.06 * p, y0, 0.12 * p, gy - y0); }
      glow(ctx, x0, y0, 0.4 * p, `rgba(255,60,40,${Math.sin(t * 8) > 0 ? 0.8 : 0.2})`);
    }
    ctx.restore();
  },
  drawTug(ctx, t) {
    // the tug from behind: a low yellow tractor, Jack in his floury smock at the wheel
    const [cx, cy, p] = this.proj(this.x, 0, TN_TUG_Z);
    const lean = (TN_LANES[this.lane] - this.x) * 0.08;
    const bob = Math.sin(t * 22) * 2;
    ctx.save(); ctx.translate(cx, cy + bob + 40); ctx.rotate(lean); ctx.scale(p / 470, p / 470);
    ellipse(ctx, 0, 6, 330, 26, 'rgba(0,0,0,0.5)');
    for (const wx of [-240, 240]) { ctx.fillStyle = '#111'; rrect(ctx, wx - 60, -150, 120, 150, 30); ctx.fill(); ctx.fillStyle = '#2a2a2a'; ctx.fillRect(wx - 50, -120, 100, 8); ctx.fillRect(wx - 50, -60, 100, 8); }
    ctx.fillStyle = linGrad(ctx, 0, -260, 0, -60, [[0, '#f0c83a'], [1, '#a8841a']]); rrect(ctx, -250, -260, 500, 190, 20); ctx.fill();
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-250, -120, 500, 20);
    for (let k = 0; k < 8; k++) { ctx.fillStyle = k % 2 ? '#1a1a1a' : '#f0c83a'; ctx.fillRect(-240 + k * 60, -96, 60, 26); }
    for (const lx of [-210, 210]) { ellipse(ctx, lx, -200, 18, 14, '#ff3a2a'); glow(ctx, lx, -200, 50, 'rgba(255,40,30,0.6)'); }
    ctx.fillStyle = '#3a3a3a'; ctx.fillRect(-12, -330, 24, 80); // seat post
    // Jack: back, shoulders, the cap
    ctx.fillStyle = '#ece6da'; rrect(ctx, -120, -520, 240, 250, 60); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(-4, -510, 8, 230);
    const arm = Math.sin(t * 3) * 10 + (this.lane - 1) * 20;
    ctx.fillStyle = '#e0d8c8'; rrect(ctx, -180, -470 + arm, 70, 150, 30); ctx.fill(); rrect(ctx, 110, -470 - arm, 70, 150, 30); ctx.fill();
    ellipse(ctx, 0, -560, 62, 70, '#2a1d16');
    ellipse(ctx, 0, -590, 78, 34, '#ece6da'); ctx.fillStyle = '#ece6da'; ctx.fillRect(-60, -610, 120, 40);
    ctx.restore();
  },
  drawHud(ctx) {
    ctx.save();
    const p = clamp(this.dist / TN_END, 0, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(64, H - 60, 300, 4);
    ctx.fillStyle = '#f0b35b'; ctx.fillRect(64, H - 60, 300 * p, 4);
    ctx.font = `600 18px ${FONT_UI}`; ctx.fillStyle = '#cfc6b4'; ctx.textAlign = 'left'; ctx.fillText('SERVICE TUNNEL TO THE RUNWAY', 64, H - 72);
    ctx.fillStyle = 'rgba(6,10,14,0.7)'; rrect(ctx, 50, 170, 280, 120, 16); ctx.fill();
    ctx.fillStyle = '#cfc6b4'; ctx.font = `600 22px ${FONT_UI}`; ctx.fillText('SPEED', 76, 206);
    ctx.fillStyle = '#f0e4c8'; ctx.font = `800 64px ${FONT_UI}`; ctx.fillText(Math.round(this.v * 3.6), 72, 270);
    ctx.fillStyle = '#cfc6b4'; ctx.font = `600 24px ${FONT_UI}`; ctx.fillText('km/h', 200, 270);
    if (this.introT < 8) {
      const a = clamp(Math.min(this.introT, 8 - this.introT), 0, 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(6,10,14,0.75)'; rrect(ctx, W / 2 - 540, H - 330, 1080, 150, 14); ctx.fill();
      ctx.textAlign = 'center'; ctx.fillStyle = '#f0b35b'; ctx.font = `600 24px ${FONT_UI}`;
      ctx.fillText('FLAT OUT THROUGH THE SERVICE TUNNEL', W / 2, H - 288);
      ctx.fillStyle = '#f0e4c8'; ctx.font = `500 30px ${FONT_UI}`;
      ctx.fillText(G.touch ? 'Tap the left or right side of the screen to change lanes' : '← / → (or A / D, or click left and right) to change lanes', W / 2, H - 244);
      ctx.fillText('Dodge the crates, the drums and the trucks. And mind the goose.', W / 2, H - 204);
      ctx.globalAlpha = 1;
    }
    if (this.failText) drawLabel(ctx, this.failText, W / 2, H / 2);
    if (G.touch) {
      ctx.globalAlpha = 0.35; ctx.fillStyle = '#f0e4c8';
      for (const d of [-1, 1]) { const cx = d < 0 ? 150 : W - 150, cy = H - 180; ctx.beginPath(); ctx.moveTo(cx + d * 40, cy); ctx.lineTo(cx - d * 26, cy - 44); ctx.lineTo(cx - d * 26, cy + 44); ctx.closePath(); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  },
};
