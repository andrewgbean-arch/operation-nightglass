// ---------------------------------------------------------------------------
// Chapter Six paint — Venice in December: a fondamenta in the fog at dusk,
// a glass furnace on Murano, the Countess's ballroom on the Grand Canal, and
// the Rialto at dawn. Plus the canal facades the gondola chase rows past.
// ---------------------------------------------------------------------------

// A Venetian palazzo facade: pastel plaster, ogee windows, a water door.
function paintPalazzo(ctx, x, baseY, w, h, col, seed, lit = 0.6) {
  const r = rng(seed);
  ctx.fillStyle = col; ctx.fillRect(x, baseY - h, w, h);
  texture(ctx, x, baseY - h, w, h, shadeColor(col, -0.3), Math.floor(w * h / 400), 30, seed, 0.18);
  ctx.fillStyle = shadeColor(col, -0.25); ctx.fillRect(x - 6, baseY - h - 14, w + 12, 16);
  const cols = Math.max(2, Math.floor(w / 90)), rows = Math.max(2, Math.floor((h - 80) / 110));
  for (let row = 0; row < rows; row++) for (let c = 0; c < cols; c++) {
    const wx = x + 30 + c * ((w - 60) / cols) + 6, wy = baseY - h + 40 + row * 110, ww = (w - 60) / cols - 20, wh = 70;
    ctx.fillStyle = r() < lit ? `rgba(255,${190 + Math.floor(r() * 40)},120,0.9)` : '#1a1a24';
    ctx.beginPath(); ctx.moveTo(wx, wy + wh); ctx.lineTo(wx, wy + 18); ctx.quadraticCurveTo(wx, wy, wx + ww / 2, wy - 10); ctx.quadraticCurveTo(wx + ww, wy, wx + ww, wy + 18); ctx.lineTo(wx + ww, wy + wh); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e8e2d6'; ctx.lineWidth = 3; ctx.stroke();
  }
  // a water door with steps, and mooring poles striped like barbers' poles
  ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.moveTo(x + w / 2 - 34, baseY); ctx.lineTo(x + w / 2 - 34, baseY - 70); ctx.quadraticCurveTo(x + w / 2, baseY - 110, x + w / 2 + 34, baseY - 70); ctx.lineTo(x + w / 2 + 34, baseY); ctx.fill();
}
// A campanile: a square brick tower, an open belfry, a green pyramid spire.
function paintCampanile(ctx, x, baseY, h, col) {
  ctx.fillStyle = col; ctx.fillRect(x - 40, baseY - h, 80, h);
  ctx.fillRect(x - 48, baseY - h - 10, 96, 12);
  ctx.fillStyle = 'rgba(20,20,30,0.5)'; for (const dx of [-24, 0, 24]) ctx.fillRect(x + dx - 7, baseY - h + 14, 14, 44);
  ctx.fillStyle = col; ctx.fillRect(x - 44, baseY - h + 60, 88, 10);
  poly(ctx, [x - 40, baseY - h - 10, x + 40, baseY - h - 10, x, baseY - h - 110], col);
}
function paintMooringPole(ctx, x, top, bottom, c1, c2) {
  for (let y = top; y < bottom; y += 18) { ctx.fillStyle = ((y - top) / 18) % 2 ? c1 : c2; ctx.fillRect(x - 6, y, 12, 18); }
  ellipse(ctx, x, top, 8, 4, c2);
}
// Canal water with rippling reflections of the lights above.
function paintCanal(ctx, y0, y1, top, bottom, seed) {
  ctx.fillStyle = linGrad(ctx, 0, y0, 0, y1, [[0, top], [1, bottom]]); ctx.fillRect(0, y0, W, y1 - y0);
  const r = rng(seed);
  for (let i = 0; i < 220; i++) { const y = y0 + r() * (y1 - y0), x = r() * W; ctx.fillStyle = `rgba(255,210,140,${0.05 + r() * 0.2})`; ctx.fillRect(x, y, 10 + r() * 60, 2); }
}
// A gondola side-on: long, black, with its steel ferro at the prow.
function paintGondola(ctx, x, y, s, dir = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  ctx.fillStyle = '#08080a';
  ctx.beginPath(); ctx.moveTo(-300, -40); ctx.quadraticCurveTo(-200, 10, 0, 10); ctx.quadraticCurveTo(200, 10, 290, -50); ctx.lineTo(300, -60); ctx.quadraticCurveTo(200, -10, 0, -12); ctx.quadraticCurveTo(-200, -12, -300, -40); ctx.fill();
  // the ferro: a comb of six teeth
  ctx.fillStyle = '#c8ccd0'; poly(ctx, [286, -52, 310, -100, 318, -96, 300, -48], '#c8ccd0');
  for (let k = 0; k < 6; k++) ctx.fillRect(290 - k * 2, -88 + k * 7, 16, 3);
  ctx.fillStyle = '#9e1f28'; ctx.fillRect(-40, -26, 110, 16); // a red velvet seat
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(-44, -30, 118, 4);
  ctx.restore();
}

// ===========================================================================
// THE FONDAMENTA — dusk and fog
// ===========================================================================
function paintRiva(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 640, [[0, '#2a3048'], [0.6, '#6a5a70'], [1, '#b89088']]); ctx.fillRect(0, 0, W, 660);
  // a bell tower far off in the fog, behind the palazzi
  paintCampanile(ctx, 1470, 640, 520, 'rgba(90,86,110,0.75)');
  // palazzi across the canal, lights coming on
  paintPalazzo(ctx, 120, 640, 380, 460, '#c8906a', 101, 0.5);
  paintPalazzo(ctx, 520, 640, 320, 400, '#d8c0a0', 102, 0.6);
  paintPalazzo(ctx, 860, 640, 420, 500, '#a86a5a', 103, 0.5);
  paintPalazzo(ctx, 1300, 640, 340, 430, '#e0cfa8', 104, 0.7);
  paintPalazzo(ctx, 1660, 640, 300, 480, '#b88a6a', 105, 0.4);
  fog(ctx, 300, 700, 'rgba(210,200,210,0.6)', 1);
  paintCanal(ctx, 640, 800, '#3a3a50', '#141820', 106);
  for (const x of [300, 700, 1480]) paintMooringPole(ctx, x, 560, 780, '#e8e0cc', '#2a4a8a');
  // the stone quay in front, with a lamp, a bench and the mask shop
  ctx.fillStyle = linGrad(ctx, 0, 790, 0, H, [[0, '#8a8278'], [1, '#3a3630']]); ctx.fillRect(0, 790, W, H - 790);
  ctx.fillStyle = '#d8d0c0'; ctx.fillRect(0, 790, W, 12);
  for (let x = 0; x < W; x += 110) { ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 802); ctx.lineTo(x - 60, H); ctx.stroke(); }
  paintLampPost(ctx, 1080, 830, 560, '#141414'); glow(ctx, 1080, 578, 160, 'rgba(255,210,140,0.6)');
  // the mask shop window, on the right, glowing with faces
  ctx.fillStyle = '#3a1a14'; ctx.fillRect(1560, 380, 360, 420);
  ctx.fillStyle = 'rgba(255,210,150,0.85)'; ctx.fillRect(1590, 420, 300, 260); glow(ctx, 1740, 550, 240, 'rgba(255,200,130,0.4)');
  const r = rng(107);
  for (let k = 0; k < 9; k++) {
    const mx = 1630 + (k % 3) * 100, my = 470 + Math.floor(k / 3) * 80, c = pick3(r, ['#f0ece4', '#c9a13b', '#9e1f28', '#1a1a1a', '#2a4a8a']);
    ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(mx, my, 30, 22, 0, 0, 7); ctx.fill();
    ellipse(ctx, mx - 11, my - 3, 6, 4, '#2a1a10'); ellipse(ctx, mx + 11, my - 3, 6, 4, '#2a1a10');
    if (k % 3 === 1) poly(ctx, [mx - 4, my + 4, mx + 4, my + 4, mx + 30, my + 40], c);
  }
  ctx.fillStyle = '#e8e0cc'; ctx.fillRect(1600, 700, 280, 40); ctx.fillStyle = '#6a1a1a'; ctx.font = `italic 700 26px ${FONT_DISPLAY}`; ctx.textAlign = 'center'; ctx.fillText('Maschere · Ca\' Rosa', 1740, 728);
}
// The bench on the quay, drawn as a prop so Madame Novak can sit on it.
function paintBench6(ctx) {
  ctx.fillStyle = '#3a2a1a'; ctx.fillRect(360, 806, 260, 16); ctx.fillRect(372, 822, 12, 118); ctx.fillRect(596, 822, 12, 118);
  ctx.fillRect(360, 736, 260, 12); ctx.fillRect(368, 736, 10, 72); ctx.fillRect(602, 736, 10, 72);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(490, 942, 150, 12, 0, 0, 7); ctx.fill();
}
// A crate of Murano glass, waiting for a boat, with a gondolier asleep on it.
function paintCrate6(ctx) {
  ctx.fillStyle = '#8a6a3a'; ctx.fillRect(760, 772, 130, 128); ctx.strokeStyle = '#5a4020'; ctx.lineWidth = 4; ctx.strokeRect(762, 774, 126, 124);
  ctx.beginPath(); ctx.moveTo(762, 774); ctx.lineTo(888, 898); ctx.stroke();
  ctx.fillStyle = '#2a1a0a'; ctx.font = `700 16px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('VETRO', 825, 830); ctx.fillText('FRAGILE', 825, 852);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(825, 902, 80, 10, 0, 0, 7); ctx.fill();
}

// ===========================================================================
// MURANO — Maestro Bepi's furnace
// ===========================================================================
function paintMurano(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 820, [[0, '#1a0e08'], [1, '#3a2014']]); ctx.fillRect(0, 0, W, 820);
  // brick walls and a timber roof
  for (let y = 0; y < 820; y += 30) for (let x = (y / 30) % 2 * 40; x < W; x += 80) { ctx.fillStyle = `rgba(${100 + (x * y) % 40},${40 + (x + y) % 20},20,0.35)`; ctx.fillRect(x + 2, y + 2, 76, 26); }
  for (let x = 0; x < W; x += 260) { ctx.fillStyle = '#1a0e06'; ctx.fillRect(x, 0, 40, 120); }
  ctx.fillStyle = '#140a04'; ctx.fillRect(0, 0, W, 40);
  // the furnace: a brick dome with a white-hot glory hole
  const fx = 700;
  ctx.fillStyle = '#5a2a18'; ctx.beginPath(); ctx.moveTo(fx - 260, 820); ctx.lineTo(fx - 260, 480); ctx.quadraticCurveTo(fx, 240, fx + 260, 480); ctx.lineTo(fx + 260, 820); ctx.closePath(); ctx.fill();
  for (let k = 0; k < 8; k++) { ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(fx - 260, 500 + k * 40); ctx.lineTo(fx + 260, 500 + k * 40); ctx.stroke(); }
  glow(ctx, fx, 580, 380, 'rgba(255,150,40,0.45)');
  ellipse(ctx, fx, 580, 80, 70, '#ffb040'); ellipse(ctx, fx, 580, 56, 48, '#fff0c0'); glow(ctx, fx, 580, 160, 'rgba(255,230,160,0.8)');
  ctx.fillStyle = '#2a1208'; ctx.fillRect(fx - 180, 700, 80, 120); ctx.fillRect(fx + 100, 700, 80, 120);
  // shelves of finished glass on the right, catching the fire
  ctx.fillStyle = '#3a2412'; for (const y of [300, 460, 620]) ctx.fillRect(1260, y, 560, 14);
  const r = rng(111);
  for (const y of [300, 460, 620]) for (let x = 1280; x < 1800; x += 58) {
    const c = pick3(r, ['rgba(40,120,220,0.85)', 'rgba(220,40,60,0.85)', 'rgba(40,180,90,0.85)', 'rgba(240,180,40,0.85)', 'rgba(160,60,200,0.85)']);
    const h = 60 + r() * 60;
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - 12, y - h * 0.5, x + 8, y - h); ctx.lineTo(x + 26, y - h); ctx.quadraticCurveTo(x + 46, y - h * 0.5, x + 34, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(x + 8, y - h * 0.8, 4, h * 0.5);
  }
  // Bepi's glass swans: a row of three, the last one lopsided
  for (const [x, lop] of [[1330, 0], [1450, 0], [1570, 0.4]]) drawGlassSwan(ctx, x, 780, 0.6, lop);
  ctx.fillStyle = '#3a2412'; ctx.fillRect(1260, 780, 440, 14);
  // the marver (a steel table) and the bench with its long rails
  ctx.fillStyle = '#8a8e92'; ctx.fillRect(160, 740, 200, 20); ctx.fillStyle = '#3a3e42'; ctx.fillRect(170, 760, 14, 70); ctx.fillRect(336, 760, 14, 70);
  ctx.fillStyle = '#4a2c16'; ctx.fillRect(1000, 740, 200, 24); ctx.fillRect(1000, 700, 12, 60); ctx.fillRect(1188, 700, 12, 60);
  // blowpipes leaning in a rack
  for (let k = 0; k < 6; k++) { ctx.strokeStyle = '#6a6e72'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(60 + k * 14, 820); ctx.lineTo(90 + k * 14, 400); ctx.stroke(); }
  // a sign: FORNACE BEPI · DAL 1921
  ctx.fillStyle = '#e8dcc0'; ctx.fillRect(500, 150, 420, 50); ctx.fillStyle = '#6a2a1a'; ctx.font = `700 26px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('FORNACE BEPI · DAL 1921', 710, 184);
  // the door to the quay
  paintDoor(ctx, 1830, 300, 90, 520, '#5a3a20', '#2a180a', '#8a8a8a', false);
  ctx.fillStyle = linGrad(ctx, 0, 820, 0, H, [[0, '#4a3a2a'], [1, '#1e160e']]); ctx.fillRect(0, 820, W, H - 820);
  texture(ctx, 0, 820, W, H - 820, '#0e0a06', 1200, 30, 112, 0.25);
  lightCone(ctx, fx, 560, 160, 900, 520, 'rgba(255,160,60,0.6)', 0.18);
}
// A Murano glass swan. `lop` makes it lopsided, and more goose than swan.
function drawGlassSwan(ctx, x, y, s, lop = 0, tint = 'rgba(200,230,255,0.75)') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = tint;
  ctx.beginPath(); ctx.ellipse(0, -40, 70, 38, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-60, -50); ctx.quadraticCurveTo(-110, -70, -80, -20); ctx.quadraticCurveTo(-60, -30, -40, -40); ctx.fill(); // tail feathers
  ctx.strokeStyle = tint; ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(40, -60); ctx.quadraticCurveTo(80 + lop * 60, -110 + lop * 30, 50 + lop * 40, -170 + lop * 60); ctx.stroke();
  ellipse(ctx, 56 + lop * 40, -176 + lop * 60, 16, 12, tint);
  poly(ctx, [66 + lop * 40, -180 + lop * 60, 96 + lop * 40, -172 + lop * 60, 66 + lop * 40, -168 + lop * 60], 'rgba(255,140,40,0.9)');
  ellipse(ctx, 60 + lop * 40, -180 + lop * 60, 3, 3, 'rgba(200,20,40,0.95)'); // a ruby eye
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(-30, -66, 40, 6); ctx.fillRect(44, -140 + lop * 40, 4, 40);
  ctx.restore();
}

// ===========================================================================
// THE PALAZZO — the Countess's ballroom on the Grand Canal
// ===========================================================================
function paintBallroom6(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 820, [[0, '#3a1a2a'], [1, '#6a3a3a']]); ctx.fillRect(0, 0, W, 820);
  // pink Verona marble panels
  for (let x = 0; x < W; x += 240) { ctx.fillStyle = 'rgba(255,200,200,0.08)'; ctx.fillRect(x + 20, 140, 200, 620); ctx.strokeStyle = 'rgba(201,161,59,0.5)'; ctx.lineWidth = 4; ctx.strokeRect(x + 20, 140, 200, 620); }
  // a painted ceiling: clouds, a sky, somebody's ancestor on a cloud
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 120, [[0, '#6a8ab8'], [1, '#c8b8a8']]); ctx.fillRect(0, 0, W, 120);
  const r = rng(121); for (let i = 0; i < 20; i++) ellipse(ctx, r() * W, 40 + r() * 60, 60 + r() * 80, 20 + r() * 20, 'rgba(255,245,235,0.6)');
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(0, 118, W, 16);
  // three great gothic windows onto the Grand Canal at night
  for (const wx of [440, 860, 1280]) {
    ctx.fillStyle = '#1a0e0a'; ctx.fillRect(wx - 14, 180, 228, 520);
    ctx.save(); ctx.beginPath(); ctx.moveTo(wx, 690); ctx.lineTo(wx, 280); ctx.quadraticCurveTo(wx, 200, wx + 100, 170); ctx.quadraticCurveTo(wx + 200, 200, wx + 200, 280); ctx.lineTo(wx + 200, 690); ctx.closePath(); ctx.clip();
    ctx.fillStyle = linGrad(ctx, 0, 170, 0, 690, [[0, '#050a18'], [0.6, '#141e3a'], [1, '#0a0e1a']]); ctx.fillRect(wx, 170, 200, 520);
    paintPalazzo(ctx, wx - 80, 560, 200, 260, '#3a2a30', 122 + wx, 0.7); paintPalazzo(ctx, wx + 110, 560, 180, 220, '#2a2230', 123 + wx, 0.7);
    paintCanal(ctx, 560, 690, '#141e3a', '#050810', 124 + wx);
    ctx.restore();
    ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(wx, 690); ctx.lineTo(wx, 280); ctx.quadraticCurveTo(wx, 200, wx + 100, 170); ctx.quadraticCurveTo(wx + 200, 200, wx + 200, 280); ctx.lineTo(wx + 200, 690); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(wx + 100, 170); ctx.lineTo(wx + 100, 690); ctx.stroke();
  }
  // the orchestra's corner on the left
  ctx.fillStyle = '#2a1410'; ctx.fillRect(40, 560, 300, 40);
  for (const [x, h] of [[90, 120], [170, 80], [250, 100]]) { ctx.fillStyle = '#6a3a14'; ctx.beginPath(); ctx.ellipse(x, 560 - h / 2, 22, h / 2, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#1a0a04'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 560 - h); ctx.lineTo(x, 520 - h); ctx.stroke(); }
  // the tea table on the right: silver urn, cups, and a lone teapot
  ctx.fillStyle = '#f0ece4'; ctx.fillRect(1560, 660, 300, 20); ctx.fillStyle = '#e0dcd4'; ctx.fillRect(1570, 680, 280, 120);
  ctx.fillStyle = '#c8ccd0'; ctx.fillRect(1600, 590, 50, 70); ellipse(ctx, 1625, 590, 25, 10, '#c8ccd0');
  for (let k = 0; k < 6; k++) { ellipse(ctx, 1690 + k * 26, 654, 10, 4, '#f4f0e8'); ctx.fillStyle = '#f4f0e8'; ctx.fillRect(1682 + k * 26, 640, 16, 14); }
  ctx.fillStyle = '#e8e0cc'; ctx.fillRect(1600, 700, 220, 36); ctx.fillStyle = '#6a2a1a'; ctx.font = `italic 700 22px ${FONT_DISPLAY}`; ctx.textAlign = 'center'; ctx.fillText('Prosecco · Tè', 1710, 725);
  // a marble floor like a chessboard
  ctx.fillStyle = '#2a2020'; ctx.fillRect(0, 820, W, H - 820);
  for (let row = 0; row < 8; row++) {
    const y0 = 820 + row * 34 + row * row * 1.5, y1 = y0 + 34 + row * 3;
    for (let k = -4; k < 26; k++) {
      const x0 = W / 2 + (k - 11) * (100 + row * 14), x1 = x0 + 100 + row * 14;
      if ((k + row) % 2) { ctx.fillStyle = '#e8e0d4'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); }
    }
  }
}
// The swan on its plinth under a glass dome, drawn in front.
function paintSwanPlinth(ctx, t, swapped) {
  const x = 1100, y = 800;
  ctx.fillStyle = linGrad(ctx, x - 60, 0, x + 60, 0, [[0, '#b8b0a8'], [0.5, '#f0ece4'], [1, '#a8a098']]); ctx.fillRect(x - 60, y - 160, 120, 160);
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(x - 70, y - 170, 140, 14); ctx.fillRect(x - 70, y - 10, 140, 14);
  drawGlassSwan(ctx, x, y - 170, 0.55, swapped ? 0.4 : 0);
  ctx.fillStyle = 'rgba(200,220,255,0.12)'; ctx.beginPath(); ctx.moveTo(x - 64, y - 170); ctx.lineTo(x - 64, y - 290); ctx.quadraticCurveTo(x, y - 340, x + 64, y - 290); ctx.lineTo(x + 64, y - 170); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.stroke();
  glow(ctx, x, y - 230, 120, 'rgba(200,230,255,0.25)', 0.8 + 0.2 * Math.sin(t * 2));
}
// Masked dancers turning in the background.
function drawMaskedDancers(ctx, t) {
  const pairs = [[620, 0], [900, 1.4], [1380, 2.7]];
  for (const [cx, ph] of pairs) {
    const a = t * 0.9 + ph, dx = Math.cos(a) * 90, z = Math.sin(a);
    const x = cx + dx, s = 0.9 + z * 0.06;
    ctx.save(); ctx.globalAlpha = 0.85; ctx.translate(x, 800); ctx.scale(s, s);
    // two figures in silhouette, a gown and a tailcoat, masks catching the light
    poly(ctx, [-50, 0, -10, 0, -18, -150, -40, -150], '#2a0e1e');
    ellipse(ctx, -29, -170, 14, 16, '#e8c8a8'); ctx.fillStyle = '#c9a13b'; ctx.fillRect(-40, -176, 22, 7);
    ctx.fillStyle = '#10101a'; ctx.fillRect(4, -150, 30, 150); ellipse(ctx, 19, -172, 14, 16, '#e8c8a8'); ctx.fillStyle = '#f0ece4'; ctx.fillRect(8, -180, 22, 12);
    ctx.restore();
  }
}

// ===========================================================================
// THE RIALTO — dawn
// ===========================================================================
function paintRialto(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 640, [[0, '#6a7aa8'], [0.5, '#e8a8a0'], [1, '#ffd8a8']]); ctx.fillRect(0, 0, W, 660);
  ellipse(ctx, 1500, 560, 60, 60, '#fff4d8'); glow(ctx, 1500, 560, 380, 'rgba(255,220,170,0.6)');
  paintPalazzo(ctx, -40, 640, 420, 480, '#d8a888', 131, 0.1);
  paintPalazzo(ctx, 1520, 640, 440, 460, '#c89878', 132, 0.1);
  // the Rialto bridge: a single stone arch, with a row of shops climbing
  // each ramp to the portico at the top
  const bx = 960, archY = (x, top) => 660 - (1 - ((x - bx) / 520) ** 2) * (660 - top) / 2;
  for (let k = -6; k <= 6; k++) {
    if (!k) continue;
    const x = bx + k * 64, y = archY(x, 150) + 6;
    ctx.fillStyle = '#c8b8a0'; ctx.fillRect(x - 30, y - 64, 60, 64); ctx.fillStyle = '#b8a890'; ctx.fillRect(x - 34, y - 70, 68, 8);
    ctx.fillStyle = '#6a4a3a'; ctx.beginPath(); ctx.moveTo(x - 18, y); ctx.lineTo(x - 18, y - 36); ctx.quadraticCurveTo(x, y - 52, x + 18, y - 36); ctx.lineTo(x + 18, y); ctx.fill();
  }
  ctx.fillStyle = '#e8dcc8'; ctx.fillRect(bx - 60, 330, 120, 90); poly(ctx, [bx - 76, 332, bx + 76, 332, bx, 282], '#e8dcc8');
  ctx.fillStyle = '#6a4a3a'; ctx.beginPath(); ctx.moveTo(bx - 30, 420); ctx.lineTo(bx - 30, 370); ctx.quadraticCurveTo(bx, 344, bx + 30, 370); ctx.lineTo(bx + 30, 420); ctx.fill();
  // the arch itself, and its balustrade
  ctx.fillStyle = '#e8dcc8';
  ctx.beginPath(); ctx.moveTo(bx - 520, 660); ctx.quadraticCurveTo(bx, 150, bx + 520, 660); ctx.lineTo(bx + 440, 660); ctx.quadraticCurveTo(bx, 340, bx - 440, 660); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#b8a890'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(bx - 520, 660); ctx.quadraticCurveTo(bx, 150, bx + 520, 660); ctx.stroke();
  fog(ctx, 520, 720, 'rgba(255,230,220,0.4)', 1);
  paintCanal(ctx, 660, 800, '#e0a898', '#6a5a70', 133);
  for (const x of [420, 1500]) paintMooringPole(ctx, x, 600, 790, '#f0ece4', '#9e1f28');
  // the empty market quay: crates, a fishmonger's awning, pigeons
  ctx.fillStyle = linGrad(ctx, 0, 790, 0, H, [[0, '#9a8e80'], [1, '#4a4238']]); ctx.fillRect(0, 790, W, H - 790);
  ctx.fillStyle = '#e8e0d0'; ctx.fillRect(0, 790, W, 12);
  ctx.fillStyle = '#2a6a4a'; ctx.fillRect(1560, 640, 340, 20); for (let k = 0; k < 8; k++) { ctx.fillStyle = k % 2 ? '#e8e0cc' : '#2a6a4a'; ctx.fillRect(1560 + k * 42, 660, 42, 30); }
  for (let k = 0; k < 4; k++) { ctx.fillStyle = '#8a6a3a'; ctx.fillRect(1600 + k * 70, 740, 60, 50); }
}

// ===========================================================================
// TITLE — the Grand Canal by moonlight, and a gondola
// ===========================================================================
function paintTitle6(x) {
  x.fillStyle = linGrad(x, 0, 0, 0, 700, [[0, '#040614'], [0.6, '#141e3a'], [1, '#2a2a48']]); x.fillRect(0, 0, W, 720);
  const r = rng(141); for (let i = 0; i < 200; i++) ellipse(x, r() * W, r() * 400, r() * 1.3 + 0.3, r() * 1.3 + 0.3, `rgba(255,255,255,${0.3 + r() * 0.6})`);
  ellipse(x, 1480, 200, 56, 56, '#eef2f6'); glow(x, 1480, 200, 340, 'rgba(180,200,255,0.3)');
  // the dome of the Salute across the water
  x.fillStyle = '#0c1020';
  x.beginPath(); x.ellipse(1300, 520, 170, 150, 0, Math.PI, 0); x.fill(); x.fillRect(1120, 520, 360, 200);
  x.fillRect(1290, 330, 20, 60); x.beginPath(); x.ellipse(1300, 390, 40, 36, 0, Math.PI, 0); x.fill();
  x.beginPath(); x.ellipse(1520, 580, 70, 60, 0, Math.PI, 0); x.fill(); x.fillRect(1450, 580, 140, 140);
  paintCampanile(x, 1010, 720, 420, '#0c1020');
  for (const vx of [1150, 1450]) { x.beginPath(); x.arc(vx, 540, 30, Math.PI, 0); x.fill(); } // the great volutes
  paintPalazzo(x, 1640, 720, 300, 360, '#101428', 142, 0.6);
  paintPalazzo(x, 0, 720, 300, 380, '#101428', 143, 0.5);
  paintCanal(x, 720, H, '#1a2240', '#04060c', 144);
  paintGondola(x, 960, 960, 2, 1);
  x.fillStyle = linGrad(x, 0, 0, 1200, 0, [[0, 'rgba(2,4,10,0.8)'], [0.6, 'rgba(2,4,10,0.45)'], [1, 'rgba(2,4,10,0)']]); x.fillRect(0, 0, 1200, H);
}
