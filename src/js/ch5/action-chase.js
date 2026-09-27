// ---------------------------------------------------------------------------
// The bazaar chase — the action sequence, seen from above. Kolar and one of
// Bay Selim's bodyguards chase Jack through the covered lanes of the Grand
// Bazaar. Get to the hammam door without being caught. The goose comes too.
// ---------------------------------------------------------------------------
const BC_MAP = [
  '###################',
  'S....#.....#......#',
  '#.##.#.###.#.####.#',
  '#.#......#......#.#',
  '#.#.####.#.####.#.#',
  '#...#.........#...#',
  '###.#.###.###.#.###',
  '#.......#...#.....E',
  '###################',
];
const BC_CELL = 96, BC_X = 48, BC_Y = 180;
const BC_ROWS = BC_MAP.length, BC_COLS = BC_MAP[0].length;
const BC_DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

const BazaarChase = {
  layer: null,
  open(c, r) { return r >= 0 && r < BC_ROWS && c >= 0 && c < BC_COLS && BC_MAP[r][c] !== '#'; },
  find(ch) { for (let r = 0; r < BC_ROWS; r++) { const c = BC_MAP[r].indexOf(ch); if (c >= 0) return [c, r]; } return [0, 0]; },

  buildLayer() {
    if (this.layer) return;
    const cv = makeCanvas(W, H), x = cv.getContext('2d');
    x.fillStyle = '#1a120c'; x.fillRect(0, 0, W, H);
    const r = rng(77);
    for (let row = 0; row < BC_ROWS; row++) for (let col = 0; col < BC_COLS; col++) {
      const px = BC_X + col * BC_CELL, py = BC_Y + row * BC_CELL;
      if (BC_MAP[row][col] === '#') {
        // a shop seen from above: a striped awning and goods spilling out
        const c1 = pick3(r, ['#9e1f28', '#2a4a8a', '#c9a13b', '#2a6a4a', '#7a3a6a']);
        x.fillStyle = '#3a2618'; x.fillRect(px, py, BC_CELL, BC_CELL);
        x.fillStyle = c1; x.fillRect(px + 4, py + 4, BC_CELL - 8, BC_CELL - 8);
        x.fillStyle = 'rgba(255,255,255,0.35)'; for (let k = 0; k < 4; k++) x.fillRect(px + 8 + k * 22, py + 4, 10, BC_CELL - 8);
        if (r() < 0.5) for (let k = 0; k < 5; k++) ellipse(x, px + 16 + r() * 64, py + 16 + r() * 64, 6, 6, pick3(r, ['#e8b020', '#b82a14', '#e87a9a', '#f0ece4', '#7a3a14']));
        x.strokeStyle = 'rgba(0,0,0,0.35)'; x.lineWidth = 3; x.strokeRect(px + 2, py + 2, BC_CELL - 4, BC_CELL - 4);
      } else {
        x.fillStyle = (row + col) % 2 ? '#a89478' : '#9a8668'; x.fillRect(px, py, BC_CELL, BC_CELL);
        texture(x, px, py, BC_CELL, BC_CELL, '#5a4a36', 30, 14, row * 31 + col, 0.3);
        if (r() < 0.12) { x.fillStyle = pick3(r, ['#8a1a1e', '#2a3a6a', '#6a2a1a']); x.fillRect(px + 14, py + 20, BC_CELL - 28, BC_CELL - 40); x.strokeStyle = '#e8dcc0'; x.lineWidth = 2; x.strokeRect(px + 20, py + 26, BC_CELL - 40, BC_CELL - 52); } // a carpet laid out for sale
      }
    }
    // the start (Rıza's shop) and the goal (the hammam door)
    const [sc, sr] = this.find('S'), [ec, er] = this.find('E');
    x.fillStyle = '#e8dcc0'; x.font = `700 20px ${FONT_UI}`; x.textAlign = 'center';
    x.fillText('RIZA', BC_X + sc * BC_CELL + 48, BC_Y + sr * BC_CELL - 14);
    x.fillStyle = '#f4f0e4'; x.fillRect(BC_X + ec * BC_CELL + 10, BC_Y + er * BC_CELL + 10, BC_CELL - 20, BC_CELL - 20);
    x.fillStyle = '#6a2a1a'; x.fillText('HAMAM', BC_X + ec * BC_CELL + 48, BC_Y + er * BC_CELL + 56);
    // lanterns strung over the lanes
    for (let i = 0; i < 40; i++) { const lx = BC_X + r() * BC_COLS * BC_CELL, ly = BC_Y + r() * BC_ROWS * BC_CELL; glow(x, lx, ly, 60, 'rgba(255,190,90,0.25)'); ellipse(x, lx, ly, 6, 6, '#ffc870'); }
    painterly(cv, { strokes: 30000 });
    this.layer = cv;
  },

  start() {
    this.buildLayer();
    G.mode = 'action'; G.action = this; G.paused = false; G.speech = []; G.overlay = null; G.choices = null;
    G.sceneId = 'chase';
    this.lines = {};
    this.introT = 0;
    this.reset();
    Sound.playMusic('chase');
    Sound.setAmbience(['bazaarCrowd']);
    Sound.setMusicFilter(18000);
    G.fadeTo = 0;
  },
  reset() {
    const [sc, sr] = this.find('S');
    this.j = { x: sc, y: sr, dir: 'right', want: null };
    this.trail = [];
    this.chasers = [
      { name: 'kolar', x: sc, y: sr, dir: 'right', speed: 3.3, wait: 1.6, col: '#2a2f38', band: '#9e1f28' },
      { name: 'guard', x: 12, y: 3, dir: 'left', speed: 2.8, wait: 1.2, col: '#101012', band: '#101012' },
    ];
    this.dead = false; this.done = false; this.t = 0; this.failText = null;
  },
  line(key, who, text) {
    if (this.lines[key] || G.speech.length) return;
    this.lines[key] = true;
    say(who, text, { pos: [W / 2, 120] });
  },

  // ---- input -----------------------------------------------------------------------
  key(k, down) {
    if (!down) return;
    const map = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
    if (map[k]) this.j.want = map[k];
  },
  // tap or click: head towards that spot, along the stronger direction
  aim(px, py) {
    const jx = BC_X + (this.j.x + 0.5) * BC_CELL, jy = BC_Y + (this.j.y + 0.5) * BC_CELL;
    const dx = px - jx, dy = py - jy;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    this.j.want = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  },
  touchStart(x, y) { this.aim(x, y); },
  click(x, y) { this.aim(x, y); },

  // ---- movement: along the lanes, turning at junctions ----------------------------------
  step(m, dt, speed, pick) {
    let left = speed * dt;
    while (left > 0) {
      const cx = Math.round(m.x), cy = Math.round(m.y);
      const atCentre = Math.abs(m.x - cx) < 1e-6 && Math.abs(m.y - cy) < 1e-6;
      if (atCentre) {
        m.x = cx; m.y = cy;
        const d = pick(m, cx, cy);
        if (!d) return;
        m.dir = d;
      }
      const [dx, dy] = BC_DIRS[m.dir];
      // distance to the next cell centre in this direction
      const tx = dx ? (dx > 0 ? Math.floor(m.x) + 1 : Math.ceil(m.x) - 1) : m.x;
      const ty = dy ? (dy > 0 ? Math.floor(m.y) + 1 : Math.ceil(m.y) - 1) : m.y;
      const dist = Math.abs(tx - m.x) + Math.abs(ty - m.y);
      if (!this.open(Math.round(tx), Math.round(ty))) return;
      const mv = Math.min(dist, left);
      m.x += dx * mv; m.y += dy * mv; left -= mv;
      if (mv < dist) return;
      m.x = Math.round(m.x); m.y = Math.round(m.y);
    }
  },
  pickJack(m, cx, cy) {
    if (m.want) { const [dx, dy] = BC_DIRS[m.want]; if (this.open(cx + dx, cy + dy)) { m.dir = m.want; } }
    const [dx, dy] = BC_DIRS[m.dir];
    return this.open(cx + dx, cy + dy) ? m.dir : null;
  },
  // Chasers take the shortest way to their target, never turning straight back unless they must.
  pickChaser(target) {
    return (m, cx, cy) => {
      const dist = this.distances(target);
      const back = { up: 'down', down: 'up', left: 'right', right: 'left' }[m.dir];
      let best = null, bestD = Infinity;
      for (const d of ['up', 'left', 'down', 'right']) {
        const [dx, dy] = BC_DIRS[d];
        if (!this.open(cx + dx, cy + dy)) continue;
        const v = (dist[(cy + dy) * BC_COLS + cx + dx] ?? 999) + (d === back ? 3 : 0);
        if (v < bestD) { bestD = v; best = d; }
      }
      return best;
    };
  },
  distances([tx, ty]) {
    const key = tx + ',' + ty;
    if (this._dk === key) return this._d;
    const d = new Array(BC_ROWS * BC_COLS).fill(undefined), q = [[tx, ty]];
    d[ty * BC_COLS + tx] = 0;
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of Object.values(BC_DIRS)) {
        const nx = x + dx, ny = y + dy;
        if (!this.open(nx, ny) || d[ny * BC_COLS + nx] !== undefined) continue;
        d[ny * BC_COLS + nx] = d[y * BC_COLS + x] + 1; q.push([nx, ny]);
      }
    }
    this._dk = key; this._d = d;
    return d;
  },

  update(dt) {
    if (this.done) return;
    this.t += dt; this.introT += dt;
    if (this.dead) return;
    // held arrows keep steering, as on a keyboard
    for (const [k, d] of [['ArrowUp', 'up'], ['ArrowDown', 'down'], ['ArrowLeft', 'left'], ['ArrowRight', 'right']]) if (KEYS[k]) this.j.want = d;
    for (const t of Object.values(G.touches || {})) this.aim(t.x, t.y);
    // turning straight back is allowed at any moment
    const back = { up: 'down', down: 'up', left: 'right', right: 'left' };
    if (this.j.want === back[this.j.dir]) this.j.dir = this.j.want;
    this.step(this.j, dt, 4.4, (m, cx, cy) => this.pickJack(m, cx, cy));
    const last = this.trail[this.trail.length - 1];
    if (!last || Math.hypot(last[0] - this.j.x, last[1] - this.j.y) > 0.1) this.trail.push([this.j.x, this.j.y]);
    if (this.trail.length > 40) this.trail.shift();
    const jc = [Math.round(this.j.x), Math.round(this.j.y)];
    for (const c of this.chasers) {
      if ((c.wait -= dt) > 0) continue;
      // the bodyguard cuts Jack off when he's close, aiming a couple of lanes ahead of him
      let target = jc;
      if (c.name === 'guard' && Math.hypot(c.x - this.j.x, c.y - this.j.y) < 6) {
        const [dx, dy] = BC_DIRS[this.j.dir];
        for (let k = 2; k > 0; k--) { const tx = jc[0] + dx * k, ty = jc[1] + dy * k; if (this.open(tx, ty)) { target = [tx, ty]; break; } }
      }
      this.step(c, dt, c.speed + Math.min(0.4, this.t * 0.015), this.pickChaser(target));
      if (Math.hypot(c.x - this.j.x, c.y - this.j.y) < 0.55) return this.fail(c.name);
    }
    if (this.t > 1) this.line('run', 'kolar', 'Stop that baker!');
    if (this.t > 9) this.line('sorry', 'jack', 'Excuse me! Sorry! Mind the carpets!');
    const [ec, er] = this.find('E');
    if (Math.hypot(this.j.x - ec, this.j.y - er) < 0.3) this.finish();
  },
  async fail(who) {
    if (this.dead) return;
    this.dead = true;
    this.fails = (this.fails || 0) + 1;
    Sound.sfx('thud');
    this.failText = who === 'kolar' ? 'Caught by Kolar! Keep moving, and use the loops to double back.' : 'Caught by the bodyguard! He tries to cut you off: turn early.';
    await wait(1.6);
    G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
    G.speech = [];
    this.reset();
    G.fadeTo = 0;
  },
  async finish() {
    if (this.done) return;
    this.done = true;
    Sound.sfx('door');
    G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
    G.mode = 'play'; G.paused = false; G.speech = []; G.choices = null; G.overlay = null;
    G.sceneId = null; G.fade = 1;
    await gotoScene('hammam', 360, 1000, 1, { instant: true, sfx: 'door' });
  },

  // ---- drawing ----------------------------------------------------------------------------
  px(v, axis) { return (axis ? BC_Y : BC_X) + (v + 0.5) * BC_CELL; },
  drawPerson(ctx, x, y, dir, body, cap, t, moving) {
    const [dx, dy] = BC_DIRS[dir];
    const bob = moving ? Math.sin(t * 16) * 3 : 0;
    ellipse(ctx, x + 4, y + 8, 30, 20, 'rgba(0,0,0,0.3)');
    ctx.save(); ctx.translate(x, y + bob); ctx.rotate(Math.atan2(dy, dx));
    ellipse(ctx, 0, 0, 20, 28, body);                     // shoulders
    ellipse(ctx, 22 + Math.sin(t * 16) * 4, -14, 7, 7, '#d9a883'); ellipse(ctx, 22 - Math.sin(t * 16) * 4, 14, 7, 7, '#d9a883'); // hands swinging
    ellipse(ctx, 2, 0, 14, 14, cap);                      // head and cap, from above
    ctx.restore();
  },
  draw(ctx) {
    const t = G.t;
    ctx.drawImage(this.layer, 0, 0);
    // the goose, waddling along behind Jack
    const g = this.trail[Math.max(0, this.trail.length - 12)] || [this.j.x, this.j.y];
    ctx.save(); ctx.translate(this.px(g[0], 0), this.px(g[1], 1)); ellipse(ctx, 0, 0, 16, 12, '#f0ece4'); ellipse(ctx, 12, -6, 6, 6, '#f0ece4'); poly(ctx, [16, -8, 26, -6, 16, -3], '#e8902a'); ctx.restore();
    this.drawPerson(ctx, this.px(this.j.x, 0), this.px(this.j.y, 1), this.j.dir, '#ece6da', '#ece6da', t, !this.dead);
    for (const c of this.chasers) this.drawPerson(ctx, this.px(c.x, 0), this.px(c.y, 1), c.dir, c.col, c.band, t, c.wait <= 0);
    drawVignette(ctx, 0.6);
    drawGrain(ctx, 0.05);
    this.drawHud(ctx);
  },
  drawHud(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(6,10,14,0.75)'; rrect(ctx, 40, 30, 520, 110, 14); ctx.fill();
    ctx.textAlign = 'left'; ctx.fillStyle = '#f0b35b'; ctx.font = `600 22px ${FONT_UI}`; ctx.fillText('THE GRAND BAZAAR', 64, 70);
    ctx.fillStyle = '#f0e4c8'; ctx.font = `600 28px ${FONT_UI}`; ctx.fillText('Get to the hammam!', 64, 112);
    if (this.introT < 8) {
      const a = clamp(Math.min(this.introT, 8 - this.introT), 0, 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(6,10,14,0.8)'; rrect(ctx, W / 2 - 520, 30, 1040, 130, 14); ctx.fill();
      ctx.textAlign = 'center'; ctx.fillStyle = '#f0e4c8'; ctx.font = `500 30px ${FONT_UI}`;
      ctx.fillText(G.touch ? 'Tap or hold where you want to run' : 'Arrow keys or W A S D to run, or click where you want to go', W / 2, 84);
      ctx.fillText('Don\'t let Kolar or the bodyguard catch you', W / 2, 128);
      ctx.globalAlpha = 1;
    }
    if (this.failText) drawLabel(ctx, this.failText, W / 2, H / 2);
    ctx.restore();
  },
};
