// ---------------------------------------------------------------------------
// Paint — the painted backgrounds. Each scene is composed from gradients,
// shapes and light, then passed through the painterly brush filter.
// ---------------------------------------------------------------------------

// Shared: a night sky with a soft city glow at the horizon.
function paintSky(ctx, y0, y1, top = '#07101c', mid = '#10223a', glowCol = 'rgba(214,132,70,0.35)') {
  ctx.fillStyle = linGrad(ctx, 0, y0, 0, y1, [[0, top], [0.7, mid], [1, '#243a52']]);
  ctx.fillRect(0, y0, W, y1 - y0);
  ctx.save();
  ctx.fillStyle = linGrad(ctx, 0, y1 - 260, 0, y1, [[0, 'rgba(0,0,0,0)'], [1, glowCol]]);
  ctx.fillRect(0, y1 - 260, W, 260);
  ctx.restore();
  // Low rain clouds.
  const r = rng(11);
  ctx.save();
  for (let i = 0; i < 40; i++) {
    ctx.globalAlpha = 0.05 + r() * 0.06;
    ellipse(ctx, r() * W, y0 + r() * (y1 - y0) * 0.6, 200 + r() * 300, 30 + r() * 50, '#5a6f86');
  }
  ctx.restore();
}

// Shared: a band of baroque rooftops with lit windows.
function paintSkyline(ctx, seed, baseY, h, color, winAlpha, opts = {}) {
  const r = rng(seed);
  let x = opts.x0 ?? -40;
  const x1 = opts.x1 ?? W + 40;
  ctx.save();
  while (x < x1) {
    const bw = 90 + r() * 170, bh = h * (0.55 + r() * 0.5);
    const top = baseY - bh;
    ctx.fillStyle = color;
    ctx.fillRect(x, top, bw, bh + 4);
    // mansard / gable roofs
    const roof = r();
    if (roof < 0.4) poly(ctx, [x - 4, top, x + bw + 4, top, x + bw - 14, top - 26, x + 14, top - 26], color);
    else if (roof < 0.6) poly(ctx, [x, top, x + bw, top, x + bw / 2, top - 40 - r() * 30], color);
    else if (roof < 0.68 && !opts.noDomes) {
      ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x + bw / 2, top, bw * 0.3, bw * 0.34, 0, Math.PI, 0); ctx.fill();
      ctx.fillRect(x + bw / 2 - 3, top - bw * 0.34 - 30, 6, 32);
    }
    // chimneys
    if (r() < 0.6) ctx.fillRect(x + r() * bw * 0.8, top - 34, 14, 36);
    // windows
    const cols = Math.floor(bw / 34), rows = Math.floor(bh / 52);
    for (let cx = 0; cx < cols; cx++) for (let ry = 0; ry < rows; ry++) {
      const lit = r();
      if (lit < 0.28) {
        ctx.fillStyle = `rgba(255,${170 + (r() * 50) | 0},${90 + (r() * 60) | 0},${winAlpha * (0.5 + r() * 0.5)})`;
        ctx.fillRect(x + 10 + cx * 34, top + 18 + ry * 52, 14, 24);
      } else if (lit < 0.5) {
        ctx.fillStyle = `rgba(20,30,45,${winAlpha * 0.5})`;
        ctx.fillRect(x + 10 + cx * 34, top + 18 + ry * 52, 14, 24);
      }
    }
    x += bw + (r() < 0.2 ? 10 : 0);
  }
  ctx.restore();
}

// Big baroque dome silhouette (Karlskirche-ish).
function paintDome(ctx, cx, baseY, s, color, lit) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(cx - 120 * s, baseY - 120 * s, 240 * s, 120 * s);
  ctx.fillRect(cx - 70 * s, baseY - 190 * s, 140 * s, 80 * s);
  ctx.beginPath(); ctx.ellipse(cx, baseY - 190 * s, 80 * s, 95 * s, 0, Math.PI, 0); ctx.fill();
  ctx.fillRect(cx - 12 * s, baseY - 320 * s, 24 * s, 50 * s);
  ctx.beginPath(); ctx.ellipse(cx, baseY - 320 * s, 16 * s, 22 * s, 0, Math.PI, 0); ctx.fill();
  ctx.fillRect(cx - 2 * s, baseY - 370 * s, 4 * s, 40 * s);
  // columns flanking
  for (const d of [-1, 1]) {
    ctx.fillRect(cx + d * 170 * s - 18 * s, baseY - 230 * s, 36 * s, 230 * s);
    ctx.fillRect(cx + d * 170 * s - 24 * s, baseY - 240 * s, 48 * s, 14 * s);
  }
  if (lit) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = linGrad(ctx, 0, baseY - 300 * s, 0, baseY, [[0, 'rgba(0,0,0,0)'], [1, lit]]);
    ctx.beginPath(); ctx.ellipse(cx, baseY - 190 * s, 80 * s, 95 * s, 0, Math.PI, 0); ctx.fill();
    ctx.fillRect(cx - 120 * s, baseY - 120 * s, 240 * s, 120 * s);
  }
  ctx.restore();
}

// Wet cobblestones in perspective with light reflections.
function paintCobbles(ctx, y0, base, stone, seed) {
  ctx.fillStyle = linGrad(ctx, 0, y0, 0, H, [[0, base], [1, shadeColor(base, -0.4)]]);
  ctx.fillRect(0, y0, W, H - y0);
  const r = rng(seed);
  for (let row = 0; row < 40; row++) {
    const t = row / 40, y = y0 + Math.pow(t, 1.6) * (H - y0);
    const sh = 3 + t * 16, sw = 10 + t * 40;
    for (let x = -20 + (row % 2) * sw * 0.5; x < W + 20; x += sw * (1.02 + r() * 0.1)) {
      ctx.globalAlpha = 0.35 + r() * 0.35;
      ellipse(ctx, x, y, sw * 0.44, sh * 0.42, r() < 0.5 ? stone : shadeColor(stone, -0.2));
    }
  }
  ctx.globalAlpha = 1;
}

// Vertical streak reflection of a light in a wet surface.
function reflection(ctx, x, y, w, h, color, alpha = 0.5) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = alpha;
  ctx.fillStyle = linGrad(ctx, 0, y, 0, y + h, [[0, color], [1, 'rgba(0,0,0,0)']]);
  const r = rng((x * 7 + y) | 0);
  for (let i = 0; i < 26; i++) {
    const dx = (r() - 0.5) * w, ww = 2 + r() * w * 0.2;
    ctx.fillRect(x + dx - ww / 2, y + r() * 12, ww, h * (0.4 + r() * 0.6));
  }
  ctx.restore();
}

// Viennese ornate lamp post.
function paintLampPost(ctx, x, groundY, topY, color = '#0f1418') {
  ctx.fillStyle = color;
  ctx.fillRect(x - 7, topY + 40, 14, groundY - topY - 40);
  ctx.fillRect(x - 16, groundY - 30, 32, 30);
  ctx.fillRect(x - 11, groundY - 70, 22, 40);
  // lantern
  poly(ctx, [x - 26, topY + 38, x + 26, topY + 38, x + 20, topY, x - 20, topY], color);
  poly(ctx, [x - 22, topY + 34, x + 22, topY + 34, x + 17, topY + 4, x - 17, topY + 4], '#ffcf87');
  poly(ctx, [x - 30, topY, x + 30, topY, x, topY - 26], color);
  ctx.fillRect(x - 2, topY - 42, 4, 18);
}

// Tall panelled door.
function paintDoor(ctx, x, y, w, h, wood, dark, handle = '#c9a13b', double = true) {
  ctx.fillStyle = shadeColor(dark, -0.3);
  ctx.fillRect(x - 16, y - 20, w + 32, h + 20);
  ctx.fillStyle = linGrad(ctx, x, 0, x + w, 0, [[0, dark], [0.5, wood], [1, dark]]);
  ctx.fillRect(x, y, w, h);
  const leaves = double ? 2 : 1, lw = w / leaves;
  for (let l = 0; l < leaves; l++) {
    const lx = x + l * lw;
    ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 3;
    ctx.strokeRect(lx + 2, y + 2, lw - 4, h - 4);
    for (const [py, ph] of [[0.06, 0.4], [0.52, 0.4]]) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(lx + lw * 0.16, y + h * py, lw * 0.68, h * ph);
      ctx.strokeStyle = 'rgba(255,220,170,0.1)';
      ctx.strokeRect(lx + lw * 0.16, y + h * py, lw * 0.68, h * ph);
    }
  }
  ellipse(ctx, x + w / 2 - 12, y + h * 0.5, 5, 5, handle);
  if (double) ellipse(ctx, x + w / 2 + 12, y + h * 0.5, 5, 5, handle);
}

// Gilt picture frame.
function paintFrame(ctx, x, y, w, h, inner) {
  ctx.fillStyle = linGrad(ctx, x, y, x + w, y + h, [[0, '#8a6a2a'], [0.5, '#d9b35c'], [1, '#6b4f1c']]);
  ctx.fillRect(x - 16, y - 16, w + 32, h + 32);
  ctx.fillStyle = '#3a2a10'; ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); inner(ctx); ctx.restore();
}

// A painted portrait of Colonel Vasko, vain and heroic.
function paintVaskoPortrait(ctx, x, y, w, h) {
  paintFrame(ctx, x, y, w, h, c => {
    c.fillStyle = radGrad(c, x + w * 0.5, y + h * 0.35, 10, h, [[0, '#6b3a2a'], [1, '#1a0c08']]);
    c.fillRect(x, y, w, h);
    const cx = x + w / 2, s = w / 260;
    // shoulders + uniform
    poly(c, [cx - 120 * s, y + h, cx - 110 * s, y + h - 150 * s, cx - 40 * s, y + h - 200 * s, cx + 40 * s, y + h - 200 * s, cx + 110 * s, y + h - 150 * s, cx + 120 * s, y + h], '#2d3440');
    // epaulettes, medals, sash
    ellipse(c, cx - 88 * s, y + h - 170 * s, 30 * s, 10 * s, '#c9a13b');
    ellipse(c, cx + 88 * s, y + h - 170 * s, 30 * s, 10 * s, '#c9a13b');
    poly(c, [cx - 80 * s, y + h - 160 * s, cx - 55 * s, y + h - 170 * s, cx + 90 * s, y + h, cx + 55 * s, y + h], '#8a1a2c');
    for (let i = 0; i < 5; i++) ellipse(c, cx - 50 * s + i * 14 * s, y + h - 120 * s, 5 * s, 7 * s, i % 2 ? '#d9b35c' : '#c0c0c0');
    // neck + head
    c.fillStyle = '#b98465'; c.fillRect(cx - 18 * s, y + h - 225 * s, 36 * s, 35 * s);
    ellipse(c, cx, y + h - 270 * s, 44 * s, 56 * s, '#c8906f');
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(cx - 18 * s, y + h - 268 * s, 26 * s, 52 * s, 0, 0, 7); c.fill();
    // cap
    poly(c, [cx - 52 * s, y + h - 300 * s, cx + 52 * s, y + h - 300 * s, cx + 62 * s, y + h - 345 * s, cx - 48 * s, y + h - 352 * s], '#2a2f38');
    c.fillStyle = '#9e1f28'; c.fillRect(cx - 52 * s, y + h - 310 * s, 104 * s, 10 * s);
    poly(c, [cx - 50 * s, y + h - 300 * s, cx + 56 * s, y + h - 300 * s, cx + 40 * s, y + h - 288 * s, cx - 40 * s, y + h - 290 * s], '#111');
    ellipse(c, cx, y + h - 330 * s, 8 * s, 8 * s, '#c9a13b');
    // stern features
    c.fillStyle = '#1a0f0a'; c.fillRect(cx - 24 * s, y + h - 276 * s, 14 * s, 4 * s); c.fillRect(cx + 10 * s, y + h - 276 * s, 14 * s, 4 * s);
    c.fillStyle = '#2a1a12'; c.fillRect(cx - 22 * s, y + h - 250 * s, 44 * s, 8 * s); // moustache
    // painterly highlight
    glow(c, cx + 20 * s, y + h - 290 * s, 60 * s, 'rgba(255,200,150,0.25)');
  });
}

// ===========================================================================
// HOTEL SUITE
// ===========================================================================
function paintHotel(ctx) {
  // wall
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 700, [[0, '#0e2029'], [0.6, '#173440'], [1, '#12262f']]);
  ctx.fillRect(0, 0, W, 700);
  // damask stripes
  for (let x = 0; x < W; x += 64) {
    ctx.fillStyle = 'rgba(255,255,255,0.025)'; ctx.fillRect(x, 90, 30, 430);
    for (let y = 120; y < 510; y += 70) {
      ctx.save(); ctx.globalAlpha = 0.06;
      poly(ctx, [x + 47, y, x + 57, y + 18, x + 47, y + 36, x + 37, y + 18], '#9ec3c6');
      ctx.restore();
    }
  }
  // crown moulding + chair rail + dado panels
  ctx.fillStyle = linGrad(ctx, 0, 40, 0, 95, [[0, '#2b3b3d'], [0.5, '#5a6b66'], [1, '#1b2628']]);
  ctx.fillRect(0, 40, W, 55);
  ctx.fillStyle = '#081116'; ctx.fillRect(0, 0, W, 40);
  ctx.fillStyle = linGrad(ctx, 0, 515, 0, 535, [[0, '#51605c'], [1, '#1d2a2c']]);
  ctx.fillRect(0, 515, W, 20);
  ctx.fillStyle = '#0d1c22'; ctx.fillRect(0, 535, W, 165);
  for (let x = 20; x < W; x += 190) {
    ctx.strokeStyle = 'rgba(160,200,200,0.1)'; ctx.lineWidth = 3;
    ctx.strokeRect(x, 560, 160, 115);
  }
  // baseboard
  ctx.fillStyle = linGrad(ctx, 0, 690, 0, 712, [[0, '#3b4745'], [1, '#0a1114']]);
  ctx.fillRect(0, 688, W, 24);

  // carpet
  ctx.fillStyle = linGrad(ctx, 0, 705, 0, H, [[0, '#2a0b10'], [0.4, '#45121b'], [1, '#1c0609']]);
  ctx.fillRect(0, 705, W, H - 705);
  // carpet border + medallion pattern in perspective
  ctx.save();
  for (let i = 0; i < 9; i++) {
    const t = i / 9, y = 720 + Math.pow(t, 1.5) * 360;
    ctx.strokeStyle = `rgba(212,160,90,${0.05 + t * 0.06})`; ctx.lineWidth = 1 + t * 3;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    for (let x = (i % 2) * 90; x < W; x += 180) {
      ctx.globalAlpha = 0.08 + t * 0.08;
      poly(ctx, [x, y + 8 + t * 18, x + 30 + t * 30, y + 16 + t * 34, x, y + 24 + t * 50, x - 30 - t * 30, y + 16 + t * 34], '#b0703a');
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();

  // --- window with city view -----------------------------------------------
  const wx = 780, wy = 130, ww = 320, wh = 510;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(wx, wy + wh); ctx.lineTo(wx, wy + ww / 2); ctx.arc(wx + ww / 2, wy + ww / 2, ww / 2, Math.PI, 0); ctx.lineTo(wx + ww, wy + wh); ctx.closePath();
  ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, wy, 0, wy + wh, [[0, '#07121f'], [0.6, '#15304b'], [1, '#3a3a45']]);
  ctx.fillRect(wx, wy, ww, wh);
  paintDome(ctx, wx + 190, wy + 430, 0.55, '#0b1522', 'rgba(255,190,120,0.25)');
  paintSkyline(ctx, 5, wy + wh, 150, '#0d1826', 0.9, { x0: wx - 20, x1: wx + ww + 20 });
  glow(ctx, wx + ww / 2, wy + wh, 260, 'rgba(255,150,80,0.25)');
  ctx.restore();
  // frame + mullions
  ctx.strokeStyle = '#c9c1ad'; ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(wx, wy + wh); ctx.lineTo(wx, wy + ww / 2); ctx.arc(wx + ww / 2, wy + ww / 2, ww / 2, Math.PI, 0); ctx.lineTo(wx + ww, wy + wh); ctx.closePath(); ctx.stroke();
  ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh);
  for (const yy of [wy + 200, wy + 340]) { ctx.moveTo(wx, yy); ctx.lineTo(wx + ww, yy); }
  ctx.stroke();
  ctx.fillStyle = '#8f8878'; ctx.fillRect(wx - 30, wy + wh, ww + 60, 18); // sill
  // window light spill on the floor
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.07;
  poly(ctx, [wx, 712, wx + ww, 712, wx + ww + 220, H, wx - 60, H], '#6fa0d8');
  ctx.restore();

  // curtains
  for (const [cx0, dir] of [[690, 1], [1100, -1]]) {
    const cw = 100;
    ctx.fillStyle = linGrad(ctx, cx0, 0, cx0 + cw, 0, [[0, '#0c2a1f'], [0.3, '#1d4a36'], [0.6, '#0d2a1f'], [0.85, '#23553e'], [1, '#0a2019']]);
    ctx.beginPath();
    ctx.moveTo(cx0, 90); ctx.lineTo(cx0 + cw, 90);
    ctx.quadraticCurveTo(cx0 + cw - dir * 20, 400, cx0 + cw + dir * 10, 700);
    ctx.lineTo(cx0 - dir * 5, 700);
    ctx.closePath(); ctx.fill();
    // tie-back
    ctx.fillStyle = '#c9a13b'; ctx.fillRect(cx0 + 20, 430, cw - 30, 10);
  }
  ctx.fillStyle = linGrad(ctx, 0, 88, 0, 140, [[0, '#123a2b'], [1, '#07170f']]);
  ctx.fillRect(670, 88, 560, 50); // pelmet
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(670, 134, 560, 5);

  // --- wardrobe -------------------------------------------------------------
  const wdX = 80, wdY = 220, wdW = 250, wdH = 555;
  ctx.fillStyle = linGrad(ctx, wdX, 0, wdX + wdW, 0, [[0, '#1c0f08'], [0.55, '#4a2a17'], [1, '#2a170c']]);
  ctx.fillRect(wdX, wdY, wdW, wdH);
  poly(ctx, [wdX - 14, wdY, wdX + wdW + 14, wdY, wdX + wdW + 4, wdY - 26, wdX - 4, wdY - 26], '#2e1a0e');
  poly(ctx, [wdX + 60, wdY - 26, wdX + wdW - 60, wdY - 26, wdX + wdW / 2, wdY - 60], '#2e1a0e');
  texture(ctx, wdX, wdY, wdW, wdH, '#0c0603', 300, 60, 21, 0.25, Math.PI / 2);
  for (const dx of [0, wdW / 2]) {
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 3;
    ctx.strokeRect(wdX + dx + 14, wdY + 20, wdW / 2 - 28, wdH - 100);
    ctx.strokeStyle = 'rgba(255,200,140,0.12)';
    ctx.strokeRect(wdX + dx + 26, wdY + 36, wdW / 2 - 52, wdH - 132);
  }
  ellipse(ctx, wdX + wdW / 2 - 12, wdY + 270, 5, 7, '#c9a13b');
  ellipse(ctx, wdX + wdW / 2 + 12, wdY + 270, 5, 7, '#c9a13b');
  ctx.fillStyle = '#1a0d06'; ctx.fillRect(wdX, wdY + wdH - 60, wdW, 60);
  ctx.strokeStyle = 'rgba(255,200,140,0.1)'; ctx.strokeRect(wdX + 20, wdY + wdH - 50, wdW - 40, 40);

  // --- painting above desk ---------------------------------------------------
  paintFrame(ctx, 440, 230, 220, 160, c => {
    c.fillStyle = linGrad(c, 0, 230, 0, 390, [[0, '#2b3b4a'], [1, '#56503a']]);
    c.fillRect(440, 230, 220, 160);
    poly(c, [440, 350, 520, 300, 580, 330, 660, 290, 660, 390, 440, 390], '#27301e');
    ellipse(c, 610, 270, 18, 18, 'rgba(240,220,170,0.7)');
  });

  // --- desk -----------------------------------------------------------------
  ctx.fillStyle = '#1e0f07';
  for (const lx of [420, 675]) { ctx.fillRect(lx, 625, 14, 150); }
  ctx.fillStyle = linGrad(ctx, 400, 0, 710, 0, [[0, '#3a200f'], [0.5, '#6b3d1f'], [1, '#3a200f']]);
  ctx.fillRect(400, 604, 310, 22);
  ctx.fillStyle = '#2b170b'; ctx.fillRect(410, 626, 290, 48);
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2; ctx.strokeRect(560, 634, 130, 32);
  ellipse(ctx, 625, 650, 5, 5, '#c9a13b');
  // lamp
  ctx.fillStyle = '#8a6a2a'; ctx.fillRect(466, 520, 8, 84);
  ellipse(ctx, 470, 602, 22, 6, '#6b4f1c');
  poly(ctx, [430, 520, 510, 520, 492, 462, 448, 462], '#d8a860');
  glow(ctx, 470, 500, 260, 'rgba(255,170,80,0.55)');
  glow(ctx, 470, 610, 140, 'rgba(255,190,110,0.35)');
  // briefcase
  ctx.fillStyle = linGrad(ctx, 0, 572, 0, 606, [[0, '#2a2522'], [1, '#0d0b0a']]);
  rrect(ctx, 522, 572, 160, 34, 5); ctx.fill();
  ctx.strokeStyle = '#3c3632'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(602, 572, 14, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(545, 583, 14, 8); ctx.fillRect(645, 583, 14, 8);
  // ashtray
  ellipse(ctx, 440, 602, 16, 5, 'rgba(200,220,230,0.5)');

  // --- bed ------------------------------------------------------------------
  ctx.fillStyle = linGrad(ctx, 1160, 0, 1200, 0, [[0, '#1d0f07'], [1, '#4a2a17']]);
  ctx.fillRect(1160, 430, 40, 360);
  ctx.beginPath(); ctx.ellipse(1180, 430, 22, 40, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#d9d2c2'; ctx.fillRect(1198, 640, 350, 40);
  ellipse(ctx, 1260, 632, 60, 22, '#e6e0d2');
  ctx.fillStyle = linGrad(ctx, 0, 650, 0, 790, [[0, '#23553e'], [1, '#0c2a1f']]);
  ctx.beginPath(); ctx.moveTo(1300, 652); ctx.lineTo(1550, 650); ctx.lineTo(1556, 780); ctx.quadraticCurveTo(1420, 792, 1290, 784); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(1292, 770); ctx.quadraticCurveTo(1420, 780, 1553, 768); ctx.stroke();
  ctx.fillStyle = '#3a200f'; ctx.fillRect(1545, 600, 26, 190);
  ellipse(ctx, 1558, 600, 16, 14, '#4a2a17');
  // --- nightstand + phone ------------------------------------------------------
  ctx.fillStyle = linGrad(ctx, 1590, 0, 1700, 0, [[0, '#2a170c'], [1, '#4a2a17']]);
  ctx.fillRect(1590, 662, 110, 126);
  ctx.fillStyle = '#5a3520'; ctx.fillRect(1584, 654, 122, 12);
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.strokeRect(1600, 684, 90, 36);
  ellipse(ctx, 1645, 702, 4, 4, '#c9a13b');
  // rotary phone
  poly(ctx, [1606, 654, 1676, 654, 1668, 626, 1614, 626], '#0e0e10');
  ctx.fillStyle = '#18181b'; rrect(ctx, 1600, 608, 82, 16, 7); ctx.fill();
  ellipse(ctx, 1641, 640, 12, 9, '#d9d2c2');
  ellipse(ctx, 1641, 640, 4, 3, '#0e0e10');
  // newspaper on the nightstand? keep clean.
  // wall sconce
  ctx.fillStyle = '#8a6a2a'; ctx.fillRect(1632, 360, 8, 40);
  poly(ctx, [1616, 360, 1656, 360, 1648, 330, 1624, 330], '#e8c080');
  glow(ctx, 1636, 350, 220, 'rgba(255,170,80,0.4)');
  ctx.fillStyle = '#8a6a2a'; ctx.fillRect(560, 150, 6, 0);

  // --- door -----------------------------------------------------------------
  paintDoor(ctx, 1730, 200, 160, 590, '#4a2a17', '#24130a');
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(255,190,110,0.5)'; ctx.fillRect(1730, 786, 160, 4);
  ctx.restore();
  // pool of warm light and shadows grounding furniture
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  for (const [x, w] of [[205, 150], [555, 170], [1360, 230], [1645, 70]]) { ctx.beginPath(); ctx.ellipse(x, 785, w, 12, 0, 0, 7); ctx.fill(); }
  ctx.restore();
  glow(ctx, 520, 820, 520, 'rgba(255,150,70,0.16)');
  fog(ctx, 300, 760, 'rgba(120,160,180,0.06)', 1);
}

// ===========================================================================
// STREET — rainy square outside the hotel
// ===========================================================================
function paintStreet(ctx) {
  paintSky(ctx, 0, 560);
  paintDome(ctx, 1220, 470, 0.9, '#0c1624', 'rgba(255,170,100,0.18)');
  paintSkyline(ctx, 31, 520, 230, '#101b29', 0.8);
  fog(ctx, 360, 620, 'rgba(120,150,180,0.25)', 1);
  paintSkyline(ctx, 47, 560, 180, '#141f2c', 0.9, { noDomes: true });
  // Street-level frontages behind the square.
  ctx.fillStyle = linGrad(ctx, 0, 540, 0, 800, [[0, '#151e29'], [1, '#0d131a']]);
  ctx.fillRect(0, 540, W, 262);
  for (const [sx, sw] of [[1045, 70], [1425, 60]]) {
    ctx.fillStyle = 'rgba(255,180,100,0.35)'; ctx.fillRect(sx, 620, sw, 110);
    ctx.fillStyle = '#0d131a'; ctx.fillRect(sx + sw / 2 - 3, 620, 6, 110);
  }

  // Street receding right toward the consulate.
  ctx.fillStyle = '#1c232c';
  poly(ctx, [1480, 800, 1920, 800, 1920, 560, 1760, 560], '#1a222b');
  // Distant consulate with red flags
  ctx.fillStyle = '#3a3a40'; ctx.fillRect(1700, 470, 170, 95);
  poly(ctx, [1690, 470, 1880, 470, 1785, 430], '#3a3a40');
  for (let i = 0; i < 5; i++) { ctx.fillStyle = 'rgba(255,200,130,0.7)'; ctx.fillRect(1712 + i * 32, 500, 12, 20); }
  glow(ctx, 1785, 540, 140, 'rgba(255,190,120,0.35)');
  for (const fx of [1712, 1858]) { ctx.fillStyle = '#222'; ctx.fillRect(fx, 440, 3, 40); ctx.fillStyle = '#a3182a'; ctx.fillRect(fx + 3, 440, 22, 14); }
  // Right-side tall facade in perspective
  poly(ctx, [1560, 120, 1920, 0, 1920, 820, 1560, 790], '#1b242f');
  for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) {
    const x = 1590 + i * 80, y0 = 170 + j * 120 - i * 25;
    ctx.fillStyle = (i + j) % 3 === 0 ? 'rgba(255,190,110,0.55)' : 'rgba(10,16,24,0.8)';
    poly(ctx, [x, y0, x + 40, y0 - 10, x + 40, y0 + 70, x, y0 + 75], ctx.fillStyle);
  }

  // --- Hotel Imperial facade (left) ------------------------------------------
  ctx.fillStyle = linGrad(ctx, 0, 0, 400, 0, [[0, '#2a2f36'], [1, '#3b4048']]);
  ctx.fillRect(0, 90, 400, 710);
  for (const px of [30, 360]) { ctx.fillStyle = '#4a5058'; ctx.fillRect(px, 90, 26, 710); }
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
    const x = 80 + i * 100, y = 120 + j * 90;
    ctx.fillStyle = (i + j) % 2 ? 'rgba(255,190,110,0.7)' : 'rgba(20,28,38,0.9)';
    ctx.fillRect(x, y, 40, 60);
    ctx.fillStyle = '#4a5058'; ctx.fillRect(x - 6, y - 10, 52, 8);
  }
  // sign
  ctx.fillStyle = '#16120c'; ctx.fillRect(70, 370, 280, 44);
  ctx.font = `600 30px ${FONT_DISPLAY}`; ctx.textAlign = 'center';
  ctx.fillStyle = '#e8c070'; ctx.fillText('HOTEL IMPERIAL', 210, 402);
  // canopy
  poly(ctx, [80, 430, 340, 430, 370, 470, 50, 470], '#173226');
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(50, 468, 320, 6);
  // doors (glass, warm)
  ctx.fillStyle = '#1a140d'; ctx.fillRect(110, 478, 200, 322);
  ctx.fillStyle = linGrad(ctx, 0, 490, 0, 800, [[0, '#f0b060'], [1, '#6b3a18']]);
  ctx.fillRect(122, 490, 80, 305); ctx.fillRect(218, 490, 80, 305);
  ctx.fillStyle = 'rgba(40,20,10,0.5)'; ctx.fillRect(160, 560, 6, 200);
  glow(ctx, 210, 640, 260, 'rgba(255,170,80,0.35)');
  for (const lx of [90, 330]) { ctx.fillStyle = '#111'; ctx.fillRect(lx - 5, 500, 10, 60); glow(ctx, lx, 510, 60, 'rgba(255,200,120,0.8)'); ellipse(ctx, lx, 512, 9, 14, '#ffd89a'); }

  // --- Café Adler -----------------------------------------------------------
  ctx.fillStyle = '#1d1a18'; ctx.fillRect(420, 150, 620, 650);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(255,190,110,0.5)'; ctx.fillRect(470 + i * 140, 190, 60, 90); }
  ctx.fillStyle = '#10261c'; ctx.fillRect(470, 300, 540, 500);
  ctx.fillStyle = '#0a0a0a'; ctx.fillRect(520, 305, 440, 56);
  ctx.font = `italic 700 40px ${FONT_DISPLAY}`; ctx.fillStyle = '#e8c070';
  ctx.fillText('Café Adler', 740, 346);
  // awning stripes
  for (let i = 0; i < 16; i++) {
    const x = 470 + i * 34;
    poly(ctx, [x, 368, x + 34, 368, x + 38, 430, x + 4, 430], i % 2 ? '#e4d8c0' : '#7a1a22');
  }
  for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.arc(474 + i * 34 + 17, 430, 17, 0, Math.PI); ctx.fillStyle = i % 2 ? '#e4d8c0' : '#7a1a22'; ctx.fill(); }
  // door
  ctx.fillStyle = '#0b1a12'; ctx.fillRect(560, 470, 130, 330);
  ctx.fillStyle = linGrad(ctx, 0, 480, 0, 790, [[0, '#f2b566'], [1, '#7a4418']]);
  ctx.fillRect(575, 485, 100, 180);
  ctx.fillStyle = '#0b1a12'; ctx.fillRect(575, 680, 100, 110);
  ellipse(ctx, 665, 690, 5, 5, '#c9a13b');
  // big window with patrons
  ctx.fillStyle = linGrad(ctx, 0, 470, 0, 700, [[0, '#f4bb6a'], [1, '#9a5a22']]);
  ctx.fillRect(720, 470, 270, 230);
  const r = rng(77);
  for (let i = 0; i < 5; i++) {
    const px = 740 + i * 52 + r() * 10, py = 560 + r() * 30;
    ctx.fillStyle = 'rgba(40,20,10,0.75)';
    ellipse(ctx, px, py, 13, 15, ctx.fillStyle);
    ctx.fillRect(px - 20, py + 14, 40, 140);
  }
  ctx.fillStyle = 'rgba(60,30,15,0.7)'; ctx.fillRect(720, 640, 270, 10);
  ctx.strokeStyle = '#0b1a12'; ctx.lineWidth = 8; ctx.strokeRect(720, 470, 270, 230);
  ctx.beginPath(); ctx.moveTo(855, 470); ctx.lineTo(855, 700); ctx.stroke();
  ctx.fillStyle = '#10261c'; ctx.fillRect(710, 700, 290, 100);
  glow(ctx, 850, 600, 360, 'rgba(255,160,70,0.4)');
  glow(ctx, 625, 600, 220, 'rgba(255,160,70,0.3)');

  // --- newsstand kiosk -----------------------------------------------------------
  paintKiosk(ctx);

  // lamp posts
  paintLampPost(ctx, 440, 810, 300);
  paintLampPost(ctx, 1490, 812, 310);

  // --- wet ground --------------------------------------------------------------
  ctx.fillStyle = '#1a1f25'; ctx.fillRect(0, 792, W, 18); // kerb
  paintCobbles(ctx, 810, '#10151b', '#27303a', 5);
  reflection(ctx, 210, 815, 220, 260, 'rgba(255,170,80,0.55)', 0.6);
  reflection(ctx, 850, 815, 280, 260, 'rgba(255,160,70,0.55)', 0.6);
  reflection(ctx, 625, 815, 120, 240, 'rgba(255,170,80,0.45)', 0.5);
  reflection(ctx, 1270, 815, 200, 230, 'rgba(255,190,110,0.45)', 0.5);
  reflection(ctx, 440, 815, 60, 280, 'rgba(255,210,140,0.6)', 0.6);
  reflection(ctx, 1490, 815, 60, 280, 'rgba(255,210,140,0.6)', 0.6);
  reflection(ctx, 1785, 815, 120, 180, 'rgba(255,190,120,0.3)', 0.4);
  lightCone(ctx, 440, 330, 40, 360, 490, 'rgba(255,200,120,0.5)', 0.22);
  lightCone(ctx, 1490, 340, 40, 360, 480, 'rgba(255,200,120,0.5)', 0.22);
  glow(ctx, 440, 318, 120, 'rgba(255,210,140,0.7)');
  glow(ctx, 1490, 328, 120, 'rgba(255,210,140,0.7)');
  fog(ctx, 620, 900, 'rgba(110,140,170,0.14)', 1);
}

function paintKiosk(ctx) {
  const x = 1120, w = 290;
  // body
  ctx.fillStyle = linGrad(ctx, x, 0, x + w, 0, [[0, '#0c1f18'], [0.5, '#1d3d2f'], [1, '#0c1f18']]);
  ctx.fillRect(x, 440, w, 360);
  // roof dome
  poly(ctx, [x - 20, 450, x + w + 20, 450, x + w - 10, 420, x + 10, 420], '#12281f');
  ctx.fillStyle = '#163226'; ctx.beginPath(); ctx.ellipse(x + w / 2, 420, w / 2 - 10, 60, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(x + w / 2 - 3, 330, 6, 34); ellipse(ctx, x + w / 2, 330, 8, 8, '#c9a13b');
  ctx.fillStyle = '#0a0a0a'; ctx.fillRect(x + 30, 452, w - 60, 40);
  ctx.font = `600 28px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillStyle = '#e8c070';
  ctx.fillText('ZEITUNGEN · TABAK', x + w / 2, 482);
  // lit window
  ctx.fillStyle = linGrad(ctx, 0, 510, 0, 650, [[0, '#f3c070'], [1, '#8a5020']]);
  ctx.fillRect(x + 30, 505, w - 60, 150);
  // hanging papers & magazines
  const r = rng(99);
  for (let i = 0; i < 8; i++) {
    const px = x + 38 + i * 28;
    ctx.fillStyle = ['#e8e0cc', '#c94a3a', '#e8e0cc', '#3a5a8a', '#e0c050', '#e8e0cc'][i % 6];
    ctx.fillRect(px, 512, 22, 34 + r() * 6);
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(px + 3, 520, 16, 2); ctx.fillRect(px + 3, 526, 12, 2);
  }
  // side racks with papers
  for (const sx of [x + 8, x + w - 28]) for (let j = 0; j < 5; j++) {
    ctx.fillStyle = j % 2 ? '#d8d0bc' : '#b8b0a0'; ctx.fillRect(sx, 560 + j * 40, 20, 30);
  }
  glow(ctx, x + w / 2, 580, 220, 'rgba(255,170,80,0.35)');
}
// Kiosk counter in front of the vendor (drawn as a depth-sorted prop).
function paintKioskCounter(ctx) {
  const x = 1120, w = 290;
  ctx.fillStyle = linGrad(ctx, x, 0, x + w, 0, [[0, '#0c1f18'], [0.5, '#1d3d2f'], [1, '#0c1f18']]);
  ctx.fillRect(x + 22, 652, w - 44, 148);
  ctx.fillStyle = '#2b4a3a'; ctx.fillRect(x + 14, 646, w - 28, 12);
  // stacked papers on the counter
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#e0d8c4' : '#cfc6b0'; ctx.fillRect(x + 40 + i * 56, 634, 44, 12); }
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  for (let i = 0; i < 4; i++) ctx.fillRect(x + 44 + i * 56, 638, 30, 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 3;
  ctx.strokeRect(x + 40, 680, w - 80, 100);
}

// ===========================================================================
// CAFÉ ADLER — interior
// ===========================================================================
function paintCafe(ctx) {
  // upper walls: warm ochre with soft lamp falloff
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 720, [[0, '#1e140c'], [0.45, '#4a3218'], [1, '#2c1d0f']]);
  ctx.fillRect(0, 0, W, 720);
  // ceiling beams
  ctx.fillStyle = '#140d07'; ctx.fillRect(0, 0, W, 70);
  for (let x = 0; x < W; x += 240) ctx.fillRect(x, 60, 30, 30);
  // back windows onto the rainy street
  for (const wx of [1010, 1230]) {
    ctx.fillStyle = linGrad(ctx, 0, 200, 0, 560, [[0, '#0c1a2c'], [1, '#243a52']]);
    ctx.fillRect(wx, 200, 180, 360);
    paintSkyline(ctx, wx, 560, 150, '#0e1826', 0.8, { x0: wx, x1: wx + 180 });
    ctx.fillStyle = 'rgba(255,190,110,0.5)'; ctx.fillRect(wx + 60, 470, 60, 90);
    ctx.strokeStyle = '#2b1a0c'; ctx.lineWidth = 14; ctx.strokeRect(wx, 200, 180, 360);
    ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(wx + 90, 200); ctx.lineTo(wx + 90, 560); ctx.moveTo(wx, 330); ctx.lineTo(wx + 180, 330); ctx.stroke();
    // lace half-curtain
    ctx.fillStyle = 'rgba(230,220,200,0.35)'; ctx.fillRect(wx + 6, 420, 168, 134);
  }
  // wood panelling
  ctx.fillStyle = linGrad(ctx, 0, 480, 0, 730, [[0, '#3a1f0e'], [1, '#1c0e06']]);
  ctx.fillRect(0, 560, W, 170);
  for (let x = 20; x < W; x += 150) { ctx.strokeStyle = 'rgba(255,190,120,0.12)'; ctx.lineWidth = 3; ctx.strokeRect(x, 585, 120, 120); }
  ctx.fillStyle = '#5a3218'; ctx.fillRect(0, 552, W, 12);
  // mirrors with gilt frames above panelling
  for (const mx of [1440, 1660]) {
    paintFrame(ctx, mx, 230, 150, 250, c => {
      c.fillStyle = linGrad(c, mx, 230, mx + 150, 480, [[0, '#6b5a40'], [0.5, '#2a2216'], [1, '#5a4a32']]);
      c.fillRect(mx, 230, 150, 250);
      glow(c, mx + 50, 280, 80, 'rgba(255,220,160,0.3)');
    });
  }

  // --- door (left) -----------------------------------------------------------
  ctx.fillStyle = '#140b05'; ctx.fillRect(30, 250, 190, 490);
  ctx.fillStyle = linGrad(ctx, 0, 270, 0, 560, [[0, '#15243a'], [1, '#2a3e56']]);
  ctx.fillRect(55, 275, 140, 290);
  ctx.strokeStyle = '#2b1a0c'; ctx.lineWidth = 10; ctx.strokeRect(55, 275, 140, 290);
  ctx.fillStyle = '#2b1a0c'; ctx.fillRect(55, 575, 140, 160);
  ellipse(ctx, 180, 580, 6, 6, '#c9a13b');
  ctx.font = `italic 600 22px ${FONT_DISPLAY}`; ctx.fillStyle = 'rgba(232,192,112,0.8)'; ctx.textAlign = 'center';
  ctx.fillText('Adler', 125, 330);
  // coat rack
  ctx.fillStyle = '#1a0f07'; ctx.fillRect(268, 330, 10, 400); ctx.fillRect(248, 720, 50, 10);
  ellipse(ctx, 250, 380, 28, 12, '#262a2f'); ellipse(ctx, 250, 372, 18, 14, '#262a2f');
  poly(ctx, [284, 350, 318, 360, 322, 520, 286, 530], '#4a3a2a');

  // --- back bar ---------------------------------------------------------------
  ctx.fillStyle = '#1a0e06'; ctx.fillRect(370, 200, 560, 410);
  ctx.fillStyle = linGrad(ctx, 390, 220, 910, 460, [[0, '#4a3a28'], [0.5, '#1f1810'], [1, '#3a2e20']]);
  ctx.fillRect(392, 222, 516, 250); // mirror
  glow(ctx, 520, 300, 160, 'rgba(255,210,150,0.2)');
  const r = rng(12);
  for (const sy of [300, 390, 470]) {
    ctx.fillStyle = '#2b180a'; ctx.fillRect(385, sy, 530, 10);
    for (let x = 400; x < 900; x += 22 + r() * 10) {
      const bh = 40 + r() * 30, col = pick3(r, ['#3f6b3a', '#6b2a1a', '#a8783a', '#2a4a5a', '#d8c090', '#5a1a3a']);
      ctx.fillStyle = col; ctx.fillRect(x, sy - bh, 14, bh);
      ctx.fillRect(x + 4, sy - bh - 14, 6, 14);
      ctx.fillStyle = 'rgba(255,230,190,0.35)'; ctx.fillRect(x + 2, sy - bh + 4, 2, bh - 10);
    }
  }
  // espresso machine
  ctx.fillStyle = linGrad(ctx, 760, 0, 880, 0, [[0, '#6b4a1a'], [0.4, '#e8c070'], [1, '#6b4a1a']]);
  ctx.fillRect(770, 500, 100, 108);
  ctx.beginPath(); ctx.ellipse(820, 500, 50, 40, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(816, 440, 8, 24);
  glow(ctx, 810, 480, 60, 'rgba(255,230,160,0.5)');
  // cake display
  ctx.fillStyle = 'rgba(210,230,240,0.25)'; ctx.fillRect(420, 540, 150, 66);
  for (let i = 0; i < 4; i++) { ellipse(ctx, 445 + i * 34, 590, 14, 8, i % 2 ? '#6b3a1a' : '#e8d8b8'); }

  // --- pendant lamps ---------------------------------------------------------
  for (const lx of [520, 780, 1120, 1420, 1700]) {
    ctx.fillStyle = '#1a0f07'; ctx.fillRect(lx - 1, 70, 2, 160);
    ellipse(ctx, lx, 246, 26, 22, '#f8d8a0');
    glow(ctx, lx, 246, 300, 'rgba(255,170,80,0.3)');
  }

  // --- floor: checkered marble ----------------------------------------------
  ctx.fillStyle = '#1a140e'; ctx.fillRect(0, 730, W, H - 730);
  for (let row = 0; row < 14; row++) {
    const t0 = row / 14, t1 = (row + 1) / 14;
    const y0 = 730 + Math.pow(t0, 1.4) * 350, y1 = 730 + Math.pow(t1, 1.4) * 350;
    const tw = 60 + t0 * 110;
    for (let i = -2; i < W / 60 + 2; i++) {
      if ((i + row) % 2) continue;
      const cx0 = W / 2 + (i - W / 120) * 60, off0 = (cx0 - W / 2) * (1 + t0 * 1.8), off1 = (cx0 - W / 2) * (1 + t1 * 1.8);
      const off0b = (cx0 + 60 - W / 2) * (1 + t0 * 1.8), off1b = (cx0 + 60 - W / 2) * (1 + t1 * 1.8);
      poly(ctx, [W / 2 + off0, y0, W / 2 + off0b, y0, W / 2 + off1b, y1, W / 2 + off1, y1], '#7a6e58');
    }
  }
  ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = linGrad(ctx, 0, 730, 0, H, [[0, '#1a0e06'], [1, '#000']]); ctx.fillRect(0, 730, W, H - 730); ctx.restore();
  glow(ctx, 780, 820, 500, 'rgba(255,160,70,0.18)');
  glow(ctx, 1420, 850, 420, 'rgba(255,160,70,0.16)');

  // --- small table + chairs in the background --------------------------------
  paintCafeTable(ctx, 1110, 760, 0.8);
  // gramophone
  ctx.fillStyle = '#2a170b'; ctx.fillRect(1760, 600, 110, 150);
  ctx.fillStyle = '#3a200f'; ctx.fillRect(1750, 590, 130, 14);
  ctx.fillStyle = linGrad(ctx, 1780, 440, 1880, 540, [[0, '#e8c070'], [1, '#6b4a1a']]);
  ctx.beginPath(); ctx.moveTo(1805, 580); ctx.quadraticCurveTo(1790, 470, 1740, 440); ctx.quadraticCurveTo(1860, 420, 1900, 470); ctx.quadraticCurveTo(1840, 480, 1815, 580); ctx.fill();
  ellipse(ctx, 1815, 586, 36, 6, '#111');
  fog(ctx, 150, 700, 'rgba(255,200,140,0.07)', 1);
}
function pick3(r, arr) { return arr[Math.floor(r() * arr.length)]; }
// Round marble café table.
function paintCafeTable(ctx, x, y, s) {
  ctx.fillStyle = '#111'; ctx.fillRect(x - 5 * s, y - 100 * s, 10 * s, 100 * s);
  ellipse(ctx, x, y, 40 * s, 8 * s, '#111');
  ellipse(ctx, x, y - 100 * s, 72 * s, 16 * s, '#d9d2c4');
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x - 72 * s, y - 100 * s, 144 * s, 5 * s);
}
// Ilse's table, a depth-sorted prop with coffee cup and ashtray.
function paintIlseTable(ctx) {
  paintCafeTable(ctx, 1520, 872, 1.15);
  ellipse(ctx, 1500, 752, 16, 5, '#f0ece2'); ctx.fillStyle = '#f0ece2'; ctx.fillRect(1490, 738, 20, 14);
  ellipse(ctx, 1500, 738, 10, 3, '#3a1f0e');
  ellipse(ctx, 1565, 754, 14, 4, 'rgba(200,220,230,0.6)');
}
function paintBarFront(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 606, 0, 800, [[0, '#5a3218'], [0.2, '#3a1f0e'], [1, '#1a0d05']]);
  ctx.fillRect(360, 606, 570, 196);
  ctx.fillStyle = linGrad(ctx, 0, 598, 0, 620, [[0, '#d9d2c4'], [1, '#8f877a']]);
  ctx.fillRect(350, 598, 590, 18);
  for (let x = 380; x < 910; x += 90) { ctx.strokeStyle = 'rgba(255,190,120,0.14)'; ctx.lineWidth = 3; ctx.strokeRect(x, 640, 70, 130); }
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(360, 776, 570, 6);
  // coffee cup & sugar on the counter
  ellipse(ctx, 700, 598, 18, 5, '#f0ece2'); ctx.fillStyle = '#f0ece2'; ctx.fillRect(690, 582, 20, 16);
  ctx.fillStyle = 'rgba(240,230,210,0.9)'; ctx.fillRect(860, 580, 24, 18);
}

// ===========================================================================
// CONSULATE GATE — exterior
// ===========================================================================
function paintGate(ctx) {
  paintSky(ctx, 0, 620, '#060d18', '#0f1f33');
  paintSkyline(ctx, 61, 600, 220, '#0f1926', 0.7);
  ctx.fillStyle = linGrad(ctx, 0, 580, 0, 800, [[0, '#121b26'], [1, '#0a0f15']]);
  ctx.fillRect(0, 580, 700, 222);
  // bare trees along the avenue
  const tr = rng(8);
  ctx.strokeStyle = '#070b10'; ctx.lineCap = 'round';
  const branch = (x, y, a, len, w, d) => {
    const x2 = x + Math.sin(a) * len, y2 = y - Math.cos(a) * len;
    ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
    if (d > 0) for (let k = 0; k < 2; k++) branch(x2, y2, a + (k ? 1 : -1) * (0.3 + tr() * 0.4), len * 0.72, w * 0.62, d - 1);
  };
  for (const tx of [60, 330, 600]) branch(tx, 800, (tr() - 0.5) * 0.1, 150, 16, 6);
  // consulate building
  const bx = 660;
  ctx.fillStyle = linGrad(ctx, 0, 110, 0, 780, [[0, '#8a8472'], [0.5, '#6b6656'], [1, '#3a372e']]);
  ctx.fillRect(bx, 150, W - bx, 640);
  // floodlit upward wash
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const fx of [820, 1350, 1800]) { ctx.fillStyle = linGrad(ctx, 0, 780, 0, 200, [[0, 'rgba(255,190,120,0.35)'], [1, 'rgba(0,0,0,0)']]); poly(ctx, [fx - 60, 790, fx + 60, 790, fx + 200, 150, fx - 200, 150], ctx.fillStyle); }
  ctx.restore();
  // cornice + windows
  ctx.fillStyle = '#4a4638'; ctx.fillRect(bx - 10, 140, W - bx + 10, 24);
  for (let i = 0; i < 9; i++) {
    const x = bx + 40 + i * 140;
    if (x > 1050 && x < 1620) continue;
    for (const wy of [220, 420]) {
      ctx.fillStyle = (i + wy) % 3 === 0 ? 'rgba(255,200,130,0.85)' : 'rgba(30,34,40,0.9)';
      ctx.fillRect(x, wy, 60, 120);
      ctx.fillStyle = '#4a4638'; poly(ctx, [x - 10, wy, x + 70, wy, x + 30, wy - 22], '#4a4638');
    }
  }
  // portico
  poly(ctx, [1040, 250, 1660, 250, 1350, 150], '#7a7462');
  ctx.strokeStyle = '#4a4638'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(1040, 250); ctx.lineTo(1350, 150); ctx.lineTo(1660, 250); ctx.stroke();
  ctx.fillStyle = '#5a5546'; ctx.fillRect(1040, 250, 620, 26);
  // emblem in pediment
  ellipse(ctx, 1350, 215, 24, 24, '#c9a13b'); ellipse(ctx, 1350, 215, 14, 14, '#9e1f28');
  for (let i = 0; i < 6; i++) {
    const cx = 1070 + i * 112;
    ctx.fillStyle = linGrad(ctx, cx - 20, 0, cx + 20, 0, [[0, '#5a5546'], [0.4, '#b8b09a'], [1, '#6b6656']]);
    ctx.fillRect(cx - 20, 276, 40, 470);
    ctx.fillStyle = '#6b6656'; ctx.fillRect(cx - 28, 276, 56, 14); ctx.fillRect(cx - 28, 736, 56, 14);
  }
  // doors, glowing
  ctx.fillStyle = '#1a120a'; ctx.fillRect(1270, 500, 160, 250);
  ctx.fillStyle = linGrad(ctx, 0, 510, 0, 750, [[0, '#ffd08a'], [1, '#b86a28']]);
  ctx.fillRect(1282, 512, 64, 238); ctx.fillRect(1354, 512, 64, 238);
  glow(ctx, 1350, 640, 330, 'rgba(255,180,90,0.45)');
  // steps + red carpet
  for (let i = 0; i < 4; i++) { ctx.fillStyle = shadeColor('#6b6656', -0.1 * i); ctx.fillRect(1180 - i * 20, 750 + i * 12, 340 + i * 40, 12); }
  poly(ctx, [1300, 750, 1400, 750, 1440, 800, 1260, 800], '#8a1422');
  // wrought-iron fence with open gate
  ctx.fillStyle = '#0a0c0e';
  ctx.fillRect(620, 690, 640, 10); ctx.fillRect(1460, 690, 460, 10); ctx.fillRect(620, 770, 640, 8); ctx.fillRect(1460, 770, 460, 8);
  for (let x = 630; x < W; x += 26) {
    if (x > 1250 && x < 1460) continue;
    ctx.fillRect(x, 600, 5, 200);
    poly(ctx, [x - 4, 604, x + 9, 604, x + 2.5, 586], '#0a0c0e');
  }
  // gate pillars with lanterns
  for (const gx of [1240, 1460]) {
    ctx.fillStyle = linGrad(ctx, gx - 22, 0, gx + 22, 0, [[0, '#4a4638'], [0.5, '#8a8472'], [1, '#3a372e']]);
    ctx.fillRect(gx - 22, 540, 44, 260);
    ctx.fillStyle = '#3a372e'; ctx.fillRect(gx - 28, 530, 56, 14);
    ctx.fillStyle = '#111'; ctx.fillRect(gx - 12, 490, 24, 40);
    ellipse(ctx, gx, 505, 9, 13, '#ffd89a'); glow(ctx, gx, 505, 90, 'rgba(255,200,120,0.8)');
  }
  // open gate leaves, swung inward
  ctx.strokeStyle = '#0a0c0e'; ctx.lineWidth = 4;
  for (const [gx, dir] of [[1262, 1], [1438, -1]]) {
    for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(gx + dir * k * 9, 610 + k * 4); ctx.lineTo(gx + dir * k * 9, 790 - k * 2); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(gx, 640); ctx.lineTo(gx + dir * 45, 660); ctx.moveTo(gx, 760); ctx.lineTo(gx + dir * 45, 770); ctx.stroke();
  }
  // sentry box
  ctx.fillStyle = linGrad(ctx, 1520, 0, 1620, 0, [[0, '#2a2e24'], [1, '#4a5240']]);
  ctx.fillRect(1520, 560, 100, 240);
  poly(ctx, [1510, 562, 1630, 562, 1570, 520], '#1e221a');
  for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#9e1f28' : '#e8e0cc'; ctx.fillRect(1520, 570 + i * 38, 100, 4); }
  ctx.fillStyle = '#0c0e0a'; ctx.fillRect(1540, 600, 60, 200);

  // --- limousine at the kerb, left ------------------------------------------
  const cx = 90, cy = 800;
  ctx.fillStyle = '#07080a';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 30); ctx.lineTo(cx + 10, cy - 80); ctx.lineTo(cx + 120, cy - 92);
  ctx.lineTo(cx + 180, cy - 150); ctx.lineTo(cx + 380, cy - 152); ctx.lineTo(cx + 440, cy - 94);
  ctx.lineTo(cx + 540, cy - 86); ctx.lineTo(cx + 550, cy - 30); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(80,110,140,0.35)';
  poly(ctx, [cx + 190, cy - 140, cx + 280, cy - 142, cx + 280, cy - 98, cx + 150, cy - 96], ctx.fillStyle);
  poly(ctx, [cx + 290, cy - 142, cx + 372, cy - 142, cx + 420, cy - 98, cx + 290, cy - 98], ctx.fillStyle);
  ctx.strokeStyle = 'rgba(200,220,240,0.5)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx + 12, cy - 70); ctx.lineTo(cx + 540, cy - 74); ctx.stroke();
  for (const wx of [cx + 110, cx + 450]) { ellipse(ctx, wx, cy - 28, 40, 40, '#030304'); ellipse(ctx, wx, cy - 28, 18, 18, '#6b7078'); }
  ctx.fillStyle = '#a3182a'; ctx.fillRect(cx + 530, cy - 118, 3, 30); ctx.fillRect(cx + 533, cy - 118, 18, 12);
  glow(ctx, cx + 548, cy - 60, 50, 'rgba(255,240,200,0.6)');
  // chauffeur silhouette
  ellipse(ctx, cx + 330, cy - 118, 12, 14, 'rgba(0,0,0,0.8)');

  // --- ground ------------------------------------------------------------------
  ctx.fillStyle = '#1a1f25'; ctx.fillRect(0, 798, W, 14);
  paintCobbles(ctx, 812, '#0f1318', '#262d36', 9);
  reflection(ctx, 1350, 815, 300, 265, 'rgba(255,180,90,0.6)', 0.7);
  reflection(ctx, 1240, 815, 40, 200, 'rgba(255,210,140,0.5)', 0.6);
  reflection(ctx, 1460, 815, 40, 200, 'rgba(255,210,140,0.5)', 0.6);
  reflection(ctx, 820, 815, 160, 200, 'rgba(255,190,120,0.3)', 0.4);
  reflection(ctx, 340, 815, 460, 90, 'rgba(120,150,190,0.25)', 0.4);
  fog(ctx, 560, 860, 'rgba(120,140,170,0.14)', 1);
}

// ===========================================================================
// BALLROOM — the consulate reception
// ===========================================================================
function paintBallroom(ctx) {
  // cream-and-gold walls
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 780, [[0, '#2a1e12'], [0.4, '#6b5436'], [1, '#3a2c1a']]);
  ctx.fillRect(0, 0, W, 780);
  // pilasters
  for (let x = 230; x < 1500; x += 220) {
    ctx.fillStyle = linGrad(ctx, x, 0, x + 40, 0, [[0, '#5a4628'], [0.5, '#b8985a'], [1, '#5a4628']]);
    ctx.fillRect(x, 90, 40, 690);
    ctx.fillStyle = '#c9a13b'; ctx.fillRect(x - 8, 90, 56, 16); ctx.fillRect(x - 8, 760, 56, 16);
  }
  // cornice
  ctx.fillStyle = linGrad(ctx, 0, 60, 0, 110, [[0, '#3a2a14'], [0.5, '#c9a13b'], [1, '#3a2a14']]);
  ctx.fillRect(0, 70, W, 34);
  ctx.fillStyle = '#1a1208'; ctx.fillRect(0, 0, W, 70);
  // tall windows with crimson drapes
  for (const wx of [300, 960]) {
    ctx.fillStyle = linGrad(ctx, 0, 180, 0, 680, [[0, '#0b1626'], [1, '#1d3048']]);
    ctx.beginPath(); ctx.moveTo(wx, 680); ctx.lineTo(wx, 250); ctx.arc(wx + 80, 250, 80, Math.PI, 0); ctx.lineTo(wx + 160, 680); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#d9c07a'; ctx.lineWidth = 8; ctx.stroke();
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(wx + 80, 170); ctx.lineTo(wx + 80, 680); ctx.moveTo(wx, 420); ctx.lineTo(wx + 160, 420); ctx.stroke();
    for (const [dx, dir] of [[-50, 1], [160, -1]]) {
      ctx.fillStyle = linGrad(ctx, wx + dx, 0, wx + dx + 60, 0, [[0, '#3a0610'], [0.4, '#8a1422'], [1, '#4a0a14']]);
      ctx.beginPath(); ctx.moveTo(wx + dx, 140); ctx.lineTo(wx + dx + 60, 140); ctx.quadraticCurveTo(wx + dx + 30 + dir * 20, 450, wx + dx + 60 + dir * 5, 760); ctx.lineTo(wx + dx - 5, 760); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#6b0e1a'; ctx.fillRect(wx - 70, 130, 300, 30); ctx.fillStyle = '#c9a13b'; ctx.fillRect(wx - 70, 158, 300, 5);
  }
  // Vasko's portrait between the windows (the vain host)
  paintVaskoPortrait(ctx, 600, 250, 190, 250);
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(650, 530, 90, 18);

  // --- grand staircase on the right -------------------------------------------
  ctx.fillStyle = linGrad(ctx, 1450, 0, W, 0, [[0, '#2a1e12'], [1, '#4a3822']]);
  ctx.fillRect(1440, 90, 480, 690);
  // upper landing + doorway
  ctx.fillStyle = '#1a1208'; ctx.fillRect(1740, 200, 150, 250);
  ctx.fillStyle = linGrad(ctx, 0, 210, 0, 450, [[0, '#3a2a18'], [1, '#120c06']]); ctx.fillRect(1752, 212, 126, 238);
  glow(ctx, 1815, 330, 120, 'rgba(255,200,120,0.18)');
  // steps rising from (1470, 800) to (1880, 460)
  const steps = 14;
  for (let i = steps - 1; i >= 0; i--) {
    const t = i / steps;
    const x0 = 1470 + t * 360, y0 = 800 - t * 340;
    ctx.fillStyle = shadeColor('#8a1422', -0.2 + t * 0.1);
    ctx.fillRect(x0, y0 - 24, W - x0, 24);
    ctx.fillStyle = '#c8b894'; ctx.fillRect(x0, y0 - 26, W - x0, 4);
  }
  // balustrade following the stair
  ctx.strokeStyle = '#d9c07a'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(1450, 690); ctx.lineTo(1840, 340); ctx.lineTo(1920, 340); ctx.stroke();
  ctx.lineWidth = 5;
  for (let i = 0; i < 14; i++) {
    const x = 1470 + i * 28, yTop = 690 - (x - 1450) * 0.9, yBot = 800 - (x - 1470) * 0.945;
    ctx.beginPath(); ctx.moveTo(x, yTop); ctx.lineTo(x, yBot - 20); ctx.stroke();
  }
  ctx.fillStyle = '#d9c07a'; ctx.fillRect(1436, 660, 30, 150); ellipse(ctx, 1451, 650, 20, 20, '#e8d08a');

  // --- buffet with champagne tower, left ------------------------------------
  ctx.fillStyle = '#e8e0cc'; ctx.fillRect(200, 690, 330, 20);
  ctx.fillStyle = linGrad(ctx, 0, 700, 0, 790, [[0, '#d8d0bc'], [1, '#8a8474']]); ctx.fillRect(205, 705, 320, 85);
  for (let row = 0; row < 4; row++) for (let k = 0; k <= row; k++) drawFlute(ctx, 365 - row * 8 + k * 16, 690 - (3 - row) * 20);
  glow(ctx, 365, 640, 90, 'rgba(255,220,140,0.35)');
  // door left (back to the entrance)
  paintDoor(ctx, 40, 350, 140, 440, '#6b4a24', '#3a2610', '#e8c070');

  // --- parquet floor -------------------------------------------------------------
  ctx.fillStyle = linGrad(ctx, 0, 780, 0, H, [[0, '#3a2210'], [1, '#1a0e06']]);
  ctx.fillRect(0, 780, W, H - 780);
  for (let row = 0; row < 18; row++) {
    const y = 780 + Math.pow(row / 18, 1.5) * 300;
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1 + row * 0.2;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  for (let i = -30; i < 30; i++) {
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W / 2 + i * 60, 780); ctx.lineTo(W / 2 + i * 200, H); ctx.stroke();
  }
  // chandelier reflections in the polished floor
  reflection(ctx, 620, 790, 200, 280, 'rgba(255,220,150,0.4)', 0.55);
  reflection(ctx, 1180, 790, 200, 280, 'rgba(255,220,150,0.4)', 0.55);
  glow(ctx, 900, 900, 700, 'rgba(255,190,110,0.12)');
  fog(ctx, 400, 800, 'rgba(255,220,170,0.06)', 1);
}
// Crystal chandelier (drawn animated, so it sparkles).
function drawChandelier(ctx, cx, cy, t) {
  ctx.save();
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(cx - 2, 0, 4, cy - 60);
  ctx.strokeStyle = '#d9b35c'; ctx.lineWidth = 4;
  for (const [rx, ry, yy] of [[130, 26, cy], [90, 18, cy - 40], [50, 10, cy - 70]]) {
    ctx.beginPath(); ctx.ellipse(cx, yy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    for (let k = 0; k < 12; k++) {
      const a = k / 12 * Math.PI * 2, x = cx + Math.cos(a) * rx, y = yy + Math.sin(a) * ry;
      ctx.fillStyle = 'rgba(255,240,210,0.9)'; ctx.fillRect(x - 2, y, 4, 16);
      const tw = 0.5 + 0.5 * Math.sin(t * 3 + k * 1.7 + cx);
      glow(ctx, x, y - 4, 14 + tw * 10, 'rgba(255,230,170,0.9)', 0.6 + tw * 0.4);
    }
  }
  glow(ctx, cx, cy - 30, 380, 'rgba(255,200,120,0.28)');
  ctx.restore();
}

// ===========================================================================
// OFFICE — Colonel Vasko's private study
// ===========================================================================
function paintOffice(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 760, [[0, '#070d12'], [0.5, '#132028'], [1, '#0b141a']]);
  ctx.fillRect(0, 0, W, 760);
  // panelling
  for (let x = 0; x < W; x += 170) {
    ctx.strokeStyle = 'rgba(140,170,180,0.08)'; ctx.lineWidth = 3; ctx.strokeRect(x + 14, 120, 140, 400);
    ctx.strokeRect(x + 14, 560, 140, 170);
  }
  ctx.fillStyle = '#1c2a30'; ctx.fillRect(0, 530, W, 14);
  ctx.fillStyle = '#05090c'; ctx.fillRect(0, 0, W, 60);
  // --- window (right) with moonlit city -----------------------------------
  const wx = 1540, wy = 150, ww = 290, wh = 540;
  ctx.fillStyle = linGrad(ctx, 0, wy, 0, wy + wh, [[0, '#0a1a2e'], [1, '#2a4460']]);
  ctx.fillRect(wx, wy, ww, wh);
  ellipse(ctx, wx + 200, wy + 110, 34, 34, '#e8ecf0');
  glow(ctx, wx + 200, wy + 110, 180, 'rgba(180,210,255,0.35)');
  ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
  paintSkyline(ctx, 3, wy + wh, 240, '#0c1622', 0.8, { x0: wx - 20, x1: wx + ww + 20 });
  ctx.restore();
  ctx.strokeStyle = '#1e2c34'; ctx.lineWidth = 16; ctx.strokeRect(wx, wy, ww, wh);
  ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.moveTo(wx, wy + 260); ctx.lineTo(wx + ww, wy + 260); ctx.stroke();
  // moon shafts across the floor
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.1;
  poly(ctx, [wx, wy + wh, wx + ww, wy + wh, wx + ww - 200, H, wx - 700, H], '#8fb4e8');
  ctx.restore();
  // --- portrait (left wall) -------------------------------------------------
  paintVaskoPortrait(ctx, 300, 150, 260, 340);
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(370, 520, 120, 24);
  ctx.font = `600 13px ${FONT_UI}`; ctx.fillStyle = '#2a1a08'; ctx.textAlign = 'center'; ctx.fillText('COL. D. VASKO', 430, 537);
  glow(ctx, 430, 180, 220, 'rgba(255,200,130,0.18)'); // picture light
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(380, 120, 100, 8);
  // --- wall safe ------------------------------------------------------------
  const sx = 650, sy = 330;
  ctx.fillStyle = '#05080a'; ctx.fillRect(sx - 10, sy - 10, 160, 170);
  ctx.fillStyle = linGrad(ctx, sx, sy, sx + 140, sy + 150, [[0, '#5a6670'], [0.5, '#2e363c'], [1, '#1a2024']]);
  ctx.fillRect(sx, sy, 140, 150);
  ctx.strokeStyle = 'rgba(200,220,230,0.3)'; ctx.lineWidth = 2; ctx.strokeRect(sx + 8, sy + 8, 124, 134);
  // keypad
  ctx.fillStyle = '#0b0f10'; ctx.fillRect(sx + 20, sy + 26, 58, 76);
  ctx.fillStyle = '#3aff9a'; ctx.globalAlpha = 0.7; ctx.fillRect(sx + 24, sy + 30, 50, 10); ctx.globalAlpha = 1;
  for (let k = 0; k < 9; k++) { ctx.fillStyle = '#6b7880'; ctx.fillRect(sx + 26 + (k % 3) * 16, sy + 46 + Math.floor(k / 3) * 16, 12, 12); }
  // handle
  ctx.strokeStyle = '#9aa6ae'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(sx + 108, sy + 76, 18, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sx + 108, sy + 50); ctx.lineTo(sx + 108, sy + 102); ctx.moveTo(sx + 82, sy + 76); ctx.lineTo(sx + 134, sy + 76); ctx.stroke();
  // --- bookcase ----------------------------------------------------------------
  ctx.fillStyle = '#1a0f08'; ctx.fillRect(1290, 160, 210, 600);
  const r = rng(41);
  for (let s = 0; s < 5; s++) {
    const y = 200 + s * 110;
    ctx.fillStyle = '#2a170b'; ctx.fillRect(1300, y + 80, 190, 10);
    for (let x = 1306; x < 1480;) {
      const bw = 10 + r() * 14, bh = 50 + r() * 28;
      ctx.fillStyle = pick3(r, ['#3a1a14', '#1a2a3a', '#2a3a1a', '#4a3a1a', '#5a1a1a']);
      ctx.fillRect(x, y + 80 - bh, bw, bh);
      x += bw + 2;
    }
  }
  // flag on a pole
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(1230, 250, 6, 510); ellipse(ctx, 1233, 248, 8, 8, '#c9a13b');
  ctx.fillStyle = linGrad(ctx, 1236, 0, 1290, 0, [[0, '#8a1422'], [1, '#4a0a12']]);
  ctx.beginPath(); ctx.moveTo(1236, 262); ctx.quadraticCurveTo(1270, 300, 1262, 480); ctx.lineTo(1236, 470); ctx.closePath(); ctx.fill();
  ellipse(ctx, 1252, 330, 8, 8, '#c9a13b');
  // --- desk ---------------------------------------------------------------------
  ctx.fillStyle = linGrad(ctx, 0, 600, 0, 780, [[0, '#3a200f'], [1, '#140a04']]);
  ctx.fillRect(840, 620, 420, 160);
  ctx.fillStyle = '#4a2a14'; ctx.fillRect(826, 604, 448, 22);
  ctx.strokeStyle = 'rgba(255,200,140,0.12)'; ctx.lineWidth = 3;
  ctx.strokeRect(860, 640, 170, 120); ctx.strokeRect(1070, 640, 170, 120);
  // green banker's lamp
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(930, 540, 6, 64); ellipse(ctx, 933, 602, 24, 6, '#8a6a2a');
  ctx.fillStyle = '#1f5a3a'; ctx.beginPath(); ctx.ellipse(933, 540, 46, 16, 0, Math.PI, 0); ctx.fill();
  ctx.fillRect(887, 538, 92, 8);
  glow(ctx, 933, 580, 280, 'rgba(255,210,130,0.45)');
  glow(ctx, 933, 560, 80, 'rgba(160,255,190,0.25)');
  // papers, phone, nameplate
  ctx.save(); ctx.translate(1050, 598); ctx.rotate(-0.05); ctx.fillStyle = '#e8e0cc'; ctx.fillRect(-60, -6, 110, 8); ctx.restore();
  poly(ctx, [1160, 604, 1220, 604, 1214, 582, 1166, 582], '#0e0e10');
  ctx.fillStyle = '#18181b'; rrect(ctx, 1156, 570, 68, 12, 5); ctx.fill();
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(1000, 588, 70, 14);
  // chair behind desk
  ctx.fillStyle = '#2a0a0e'; rrect(ctx, 1010, 470, 120, 140, 18); ctx.fill();
  // --- door (left) ---------------------------------------------------------------
  paintDoor(ctx, 60, 270, 150, 520, '#2a1a10', '#140c06', '#c9a13b', false);
  // --- floor: dark wood + rug --------------------------------------------------------
  ctx.fillStyle = linGrad(ctx, 0, 760, 0, H, [[0, '#1c1008'], [1, '#080402']]);
  ctx.fillRect(0, 760, W, H - 760);
  for (let i = 0; i < 12; i++) { const y = 760 + Math.pow(i / 12, 1.5) * 320; ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  poly(ctx, [520, 820, 1500, 820, 1640, 1000, 380, 1000], '#4a0e16');
  ctx.strokeStyle = '#a8783a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(545, 830); ctx.lineTo(1475, 830); ctx.lineTo(1605, 990); ctx.lineTo(415, 990); ctx.closePath(); ctx.stroke();
  ctx.globalAlpha = 0.25; poly(ctx, [1010, 850, 1180, 910, 1010, 970, 840, 910], '#c9a13b'); ctx.globalAlpha = 1;
  fog(ctx, 200, 780, 'rgba(120,150,190,0.05)', 1);
}
