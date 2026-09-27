// ---------------------------------------------------------------------------
// Chapter Four paint — Zlatá Hora: the Golden Rooster inn, the village square
// in the snow, and inside the mountain above it: the hangar, Vasko's office
// and the runway cut into the rock. Plus the Nightglass jet itself, side-on.
// Mountains, pines and snow ledges come from chapter two.
// ---------------------------------------------------------------------------

// Rough timber beams and whitewashed plaster: a mountain inn.
function innWall(ctx, y0, y1) {
  ctx.fillStyle = linGrad(ctx, 0, y0, 0, y1, [[0, '#d8cbb0'], [1, '#b8a888']]); ctx.fillRect(0, y0, W, y1 - y0);
  texture(ctx, 0, y0, W, y1 - y0, '#8a7a5a', 2400, 16, 41, 0.18);
  const beam = (x, y, w, h) => { ctx.fillStyle = linGrad(ctx, x, y, x + w, y + h, [[0, '#3a2414'], [0.5, '#5a3a20'], [1, '#2a180c']]); ctx.fillRect(x, y, w, h); texture(ctx, x, y, w, h, '#1a0e06', Math.max(20, (w * h) / 300), 40, x + y, 0.3, w > h ? 0 : Math.PI / 2); };
  beam(0, y0, W, 70);
  for (const x of [0, 380, 760, 1160, 1540, 1860]) beam(x, y0, 60, y1 - y0);
  beam(0, y1 - 60, W, 60);
  for (const x of [60, 440, 820, 1220, 1600]) { ctx.save(); ctx.translate(x, y0 + 70); ctx.rotate(0.6); ctx.fillStyle = '#3a2414'; ctx.fillRect(0, -14, 150, 28); ctx.restore(); } // corner braces
}

// ===========================================================================
// THE GOLDEN ROOSTER — the inn at Zlatá Hora
// ===========================================================================
function paintInn(ctx) {
  innWall(ctx, 0, 820);
  // low beamed ceiling
  ctx.fillStyle = '#2a180c'; ctx.fillRect(0, 0, W, 60);
  for (let x = 30; x < W; x += 170) { ctx.fillStyle = '#3a2414'; ctx.fillRect(x, 0, 44, 90); }
  // two small deep windows with snow outside, and the afternoon light
  for (const wx of [470, 1000]) {
    ctx.fillStyle = '#4a3020'; ctx.fillRect(wx - 16, 180, 262, 262);
    ctx.fillStyle = linGrad(ctx, 0, 196, 0, 426, [[0, '#9ab0cc'], [0.6, '#dfe6f0'], [1, '#f4f6fa']]); ctx.fillRect(wx, 196, 230, 230);
    ctx.save(); ctx.beginPath(); ctx.rect(wx, 196, 230, 230); ctx.clip();
    paintMountains(ctx, wx, 380, 150, '#7a8aa6', 'rgba(255,255,255,0.8)', wx, wx + 230);
    ctx.fillStyle = '#f2f4f8'; ctx.fillRect(wx, 390, 230, 36);
    ctx.restore();
    ctx.fillStyle = '#4a3020'; ctx.fillRect(wx + 108, 196, 14, 230); ctx.fillRect(wx, 304, 230, 12);
    snowLedge(ctx, wx - 16, 430, 262, 14);
    ctx.fillStyle = '#9e1f28'; ctx.fillRect(wx - 30, 170, 30, 290); ctx.fillRect(wx + 230, 170, 30, 290); // red curtains
    for (let k = 0; k < 4; k++) { ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(wx - 26 + k * 7, 170, 2, 290); ctx.fillRect(wx + 234 + k * 7, 170, 2, 290); }
    lightCone(ctx, wx + 115, 430, 230, 520, 400, 'rgba(220,230,255,0.5)', 0.25);
  }
  // a green tiled stove in the corner, warm and glowing
  const sx = 120;
  ctx.fillStyle = linGrad(ctx, sx, 0, sx + 220, 0, [[0, '#1e3a2a'], [0.5, '#3a6a4a'], [1, '#1e3a2a']]); rrect(ctx, sx, 360, 220, 460, 12); ctx.fill();
  for (let y = 380; y < 800; y += 46) for (let x = sx + 10; x < sx + 210; x += 50) { ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2; ctx.strokeRect(x, y, 46, 42); ellipse(ctx, x + 23, y + 21, 10, 8, 'rgba(255,255,255,0.08)'); }
  ctx.fillStyle = '#1a1008'; ctx.fillRect(sx + 70, 660, 80, 70); glow(ctx, sx + 110, 700, 120, 'rgba(255,140,50,0.6)');
  ctx.fillStyle = 'rgba(255,150,60,0.8)'; ctx.fillRect(sx + 80, 670, 60, 50);
  // antlers and the rooster clock
  const antlers = (x, y) => { ctx.strokeStyle = '#d8c8a8'; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + d * 30, y - 40, x + d * 70, y - 60); ctx.moveTo(x + d * 30, y - 30); ctx.lineTo(x + d * 40, y - 70); ctx.moveTo(x + d * 50, y - 50); ctx.lineTo(x + d * 75, y - 85); ctx.stroke(); } ellipse(ctx, x, y + 10, 22, 26, '#5a3a20'); };
  antlers(880, 560); antlers(1360, 560);
  ctx.fillStyle = '#5a3a20'; rrect(ctx, 700, 230, 100, 150, 12); ctx.fill(); ellipse(ctx, 750, 280, 38, 38, '#f0e8d4'); ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(750, 280); ctx.lineTo(750, 254); ctx.moveTo(750, 280); ctx.lineTo(768, 290); ctx.stroke();
  poly(ctx, [730, 232, 750, 200, 760, 222, 772, 206, 770, 232], '#c9a13b'); // the golden rooster on top
  // Vasko, hung a little crooked
  ctx.save(); ctx.translate(1300, 300); ctx.rotate(-0.06); paintVaskoPortrait(ctx, -60, -80, 120, 160); ctx.restore();
  // the bar on the right: shelves, bottles, beer taps
  ctx.fillStyle = '#2a180c'; ctx.fillRect(1480, 240, 440, 12); ctx.fillRect(1480, 360, 440, 12);
  const r = rng(8);
  for (const y of [240, 360]) for (let x = 1500; x < 1900; x += 26) { const h = 50 + r() * 40; ctx.fillStyle = pick3(r, ['#2a5a2a', '#6a2a1a', '#d8c8a0', '#3a3a6a', '#8a6a2a']); rrect(ctx, x, y - h, 18, h, 4); ctx.fill(); ctx.fillRect(x + 6, y - h - 14, 6, 14); }
  ctx.fillStyle = '#4a2c16'; ctx.fillRect(1560, 420, 280, 120); ctx.fillStyle = '#e8e0d0'; ctx.font = `italic 700 34px ${FONT_DISPLAY}`; ctx.textAlign = 'center'; ctx.fillText('U Zlatého Kohouta', 1700, 470); ctx.font = `600 18px ${FONT_UI}`; ctx.fillText('PIVO  ·  SLIVOVICE  ·  KNEDLÍKY', 1700, 508);
  // the door out to the square, on the left
  paintDoor(ctx, 0, 250, 110, 560, '#5a3a20', '#2a180c', '#8a8a8a', false);
  // floorboards
  ctx.fillStyle = linGrad(ctx, 0, 820, 0, H, [[0, '#4a3020'], [1, '#1e120a']]); ctx.fillRect(0, 820, W, H - 820);
  for (let y = 830, k = 0; y < H; y += 20 + k * 6, k++) { ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  texture(ctx, 0, 820, W, H - 820, '#140a04', 1600, 50, 43, 0.25);
}
// The bar counter, in front of Marta.
function paintInnBar(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 620, 0, 830, [[0, '#6a4424'], [1, '#2a180c']]); ctx.fillRect(1500, 640, 420, 190);
  ctx.fillStyle = '#8a5a30'; ctx.fillRect(1480, 620, 440, 28);
  texture(ctx, 1500, 648, 420, 180, '#1a0e06', 300, 60, 44, 0.3);
  for (const x of [1590, 1650]) { ctx.fillStyle = '#c9a13b'; ctx.fillRect(x, 560, 14, 62); ellipse(ctx, x + 7, 556, 14, 8, '#1a1a1a'); ctx.fillStyle = '#e8e0d0'; ctx.fillRect(x - 4, 548, 22, 8); }
  for (const x of [1720, 1770]) { ctx.fillStyle = 'rgba(230,180,60,0.85)'; ctx.fillRect(x, 580, 30, 40); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(x, 572, 30, 10); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.strokeRect(x, 572, 30, 48); }
}
// A heavy table with benches; beer mugs optional.
function paintInnTable(ctx, x, y, mugs) {
  ctx.fillStyle = '#3a2414'; ctx.fillRect(x - 170, y - 90, 340, 22);
  ctx.fillStyle = '#2a180c'; ctx.fillRect(x - 150, y - 68, 16, 68); ctx.fillRect(x + 134, y - 68, 16, 68);
  ctx.fillStyle = '#5a3a20'; ctx.fillRect(x - 170, y - 96, 340, 8);
  for (let k = 0; k < mugs; k++) { const mx = x - 110 + k * 70; ctx.fillStyle = 'rgba(230,180,60,0.85)'; ctx.fillRect(mx, y - 140, 32, 44); ctx.fillStyle = '#f4f0e8'; ctx.fillRect(mx, y - 148, 32, 10); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 3; ctx.strokeRect(mx, y - 148, 32, 52); ctx.beginPath(); ctx.arc(mx + 38, y - 120, 10, -1.4, 1.4); ctx.stroke(); }
}

// ===========================================================================
// THE VILLAGE SQUARE — late afternoon snow
// ===========================================================================
function paintSquare(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 700, [[0, '#3a4a70'], [0.5, '#a8889a'], [1, '#e8b890']]); ctx.fillRect(0, 0, W, 720);
  paintMountains(ctx, 61, 560, 520, '#6a7090', 'rgba(250,245,255,0.9)');
  // the mountain above the village: a radar dome on the peak and lit slits in the rock
  poly(ctx, [700, 560, 1000, 90, 1120, 60, 1500, 560], '#565a78');
  poly(ctx, [960, 140, 1000, 90, 1120, 60, 1180, 150, 1080, 130], 'rgba(255,255,255,0.85)');
  ellipse(ctx, 1080, 64, 30, 22, '#e8ecf4'); ctx.fillStyle = '#9aa0b0'; ctx.fillRect(1076, 40, 8, 20);
  for (const [x, y] of [[1040, 300], [1110, 330], [1180, 290]]) { ctx.fillStyle = 'rgba(255,220,150,0.9)'; ctx.fillRect(x, y, 26, 6); glow(ctx, x + 13, y + 3, 30, 'rgba(255,200,120,0.5)'); }
  fog(ctx, 420, 640, 'rgba(240,220,230,0.5)', 1);
  paintPines(ctx, 17, 640, 140, '#2a3048', 0, W, 0.8);
  // houses: pastel, steep roofs, snow
  const house = (x, w, h, col, roof) => {
    const base = 760;
    ctx.fillStyle = col; ctx.fillRect(x, base - h, w, h);
    poly(ctx, [x - 20, base - h, x + w + 20, base - h, x + w / 2, base - h - w * 0.55], roof);
    poly(ctx, [x - 20, base - h, x + w / 2, base - h - w * 0.55, x + w / 2 + 12, base - h - w * 0.55 + 10, x - 6, base - h + 6], 'rgba(255,255,255,0.9)');
    for (let wy = base - h + 40; wy < base - 60; wy += 90) for (let wx = x + 30; wx < x + w - 40; wx += 80) { ctx.fillStyle = 'rgba(255,210,140,0.85)'; ctx.fillRect(wx, wy, 34, 44); ctx.fillStyle = '#3a2a1a'; ctx.fillRect(wx + 15, wy, 4, 44); snowLedge(ctx, wx - 4, wy + 44, 42, 6); }
  };
  house(0, 280, 330, '#c8a060', '#5a2a1a');       // the inn
  house(560, 230, 260, '#9ab0a0', '#4a3030');
  house(1560, 360, 300, '#d8b8b0', '#3a2a3a');     // the bakery
  // the church, with a baroque onion tower
  ctx.fillStyle = '#ece4d4'; ctx.fillRect(820, 420, 240, 340); ctx.fillRect(880, 250, 120, 180);
  paintOnion(ctx, 940, 250, 0.55, '#3a4a3a');
  ellipse(ctx, 940, 320, 34, 34, '#f4f0e8'); ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(940, 320); ctx.lineTo(940, 296); ctx.moveTo(940, 320); ctx.lineTo(958, 328); ctx.stroke();
  ctx.fillStyle = '#5a3a20'; rrect(ctx, 900, 620, 80, 140, 40); ctx.fill();
  snowLedge(ctx, 820, 420, 240, 12);
  // the inn sign with its golden rooster
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(280, 480, 90, 6); ctx.fillStyle = '#c9a13b'; poly(ctx, [300, 490, 340, 450, 356, 480, 372, 462, 368, 520, 310, 520], '#c9a13b');
  // bakery sign and steamy window
  ctx.fillStyle = '#e8e0cc'; ctx.fillRect(1620, 480, 240, 50); ctx.fillStyle = '#6a2a1a'; ctx.font = `700 34px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('PEKÁRNA', 1740, 518);
  ctx.fillStyle = 'rgba(255,220,160,0.9)'; ctx.fillRect(1600, 560, 180, 150); glow(ctx, 1690, 630, 160, 'rgba(255,200,120,0.5)');
  for (let k = 0; k < 6; k++) ellipse(ctx, 1620 + k * 28, 690, 16, 10, '#b87a3a');
  ctx.fillStyle = '#3a2418'; ctx.fillRect(1800, 560, 90, 200);
  // the telephone box
  ctx.fillStyle = '#c8b04a'; ctx.fillRect(420, 560, 110, 220); ctx.fillStyle = 'rgba(200,220,240,0.6)'; ctx.fillRect(432, 590, 86, 150);
  ctx.fillStyle = '#2a2a2a'; ctx.fillRect(470, 640, 20, 40); ctx.fillStyle = '#e8e0cc'; ctx.fillRect(420, 566, 110, 22); ctx.fillStyle = '#1a1a1a'; ctx.font = `700 16px ${FONT_UI}`; ctx.fillText('TELEFON', 475, 583);
  snowLedge(ctx, 416, 556, 118, 10);
  // lamp posts
  paintLampPost(ctx, 760, 800, 560); glow(ctx, 760, 578, 120, 'rgba(255,210,140,0.55)');
  paintLampPost(ctx, 1480, 800, 560); glow(ctx, 1480, 578, 120, 'rgba(255,210,140,0.55)');
  // snowy ground, trodden paths
  ctx.fillStyle = linGrad(ctx, 0, 760, 0, H, [[0, '#dcd4dc'], [1, '#a8a0b8']]); ctx.fillRect(0, 760, W, H - 760);
  const rr = rng(33); for (let i = 0; i < 50; i++) ellipse(ctx, rr() * W, 790 + rr() * 280, 60 + rr() * 160, 5 + rr() * 10, `rgba(255,255,255,${0.2 + rr() * 0.25})`);
  for (let i = 0; i < 40; i++) ellipse(ctx, 200 + i * 42 + rr() * 10, 900 + Math.sin(i) * 40, 8, 4, 'rgba(120,110,140,0.3)'); // footprints
  // the road climbing away on the right
  poly(ctx, [1900, 760, 1920, 760, 1920, 640, 1860, 640], 'rgba(140,130,160,0.4)');
}
// Vlasta's little bread van, drawn in front so people can stand behind it.
function paintBreadVan(ctx, x, y, doorsOpen) {
  ctx.fillStyle = linGrad(ctx, 0, y - 250, 0, y, [[0, '#e8e0cc'], [1, '#b8ae98']]);
  rrect(ctx, x, y - 250, 420, 210, 22); ctx.fill();
  ctx.fillStyle = linGrad(ctx, 0, y - 190, 0, y, [[0, '#d8ceb8'], [1, '#a89e88']]);
  ctx.beginPath(); ctx.moveTo(x + 420, y - 40); ctx.lineTo(x + 420, y - 200); ctx.quadraticCurveTo(x + 520, y - 200, x + 540, y - 110); ctx.lineTo(x + 560, y - 40); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(160,190,220,0.8)'; poly(ctx, [x + 440, y - 190, x + 500, y - 190, x + 530, y - 120, x + 440, y - 120], 'rgba(160,190,220,0.8)');
  snowLedge(ctx, x + 10, y - 252, 400, 14);
  ctx.fillStyle = '#6a2a1a'; ctx.font = `italic 700 44px ${FONT_DISPLAY}`; ctx.textAlign = 'center'; ctx.fillText('Pekárna Vlasta', x + 210, y - 150);
  ctx.font = `600 20px ${FONT_UI}`; ctx.fillText('CHLÉB  ·  ROHLÍKY  ·  KOLÁČE', x + 210, y - 116);
  poly(ctx, [x + 60, y - 100, x + 100, y - 100, x + 80, y - 76], '#b87a3a'); // a painted loaf
  ellipse(ctx, x + 80, y - 92, 26, 14, '#b87a3a');
  if (doorsOpen) { ctx.fillStyle = '#2a1e14'; ctx.fillRect(x - 6, y - 240, 30, 190); ctx.fillStyle = '#d8ceb8'; ctx.fillRect(x - 70, y - 244, 64, 196); }
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x + 10, y - 44, 540, 14);
  for (const wx of [x + 90, x + 450]) { ellipse(ctx, wx, y - 24, 38, 38, '#121212'); ellipse(ctx, wx, y - 24, 14, 14, '#8a8a8a'); }
  glow(ctx, x + 555, y - 80, 50, 'rgba(255,240,200,0.8)');
}

// ===========================================================================
// THE HANGAR — inside the mountain
// ===========================================================================
function rockWall(ctx, x, y, w, h, seed, col = '#3a3a42') {
  const r = rng(seed);
  ctx.fillStyle = linGrad(ctx, 0, y, 0, y + h, [[0, shadeColor(col, -0.3)], [1, col]]); ctx.fillRect(x, y, w, h);
  for (let i = 0; i < 140; i++) {
    const px = x + r() * w, py = y + r() * h, s = 30 + r() * 90;
    poly(ctx, [px, py, px + s, py + s * 0.2 * (r() - 0.5), px + s * 0.7, py + s * 0.6, px - s * 0.2, py + s * 0.5], `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},${0.04 + r() * 0.06})`);
  }
}
function paintHangar(ctx) {
  rockWall(ctx, 0, 0, W, 820, 51);
  // arched steel ribs holding up the cavern roof
  for (const x of [120, 560, 1000, 1440, 1860]) {
    ctx.strokeStyle = '#1a1e24'; ctx.lineWidth = 26;
    ctx.beginPath(); ctx.moveTo(x - 60, 820); ctx.lineTo(x - 60, 300); ctx.quadraticCurveTo(x - 40, 60, x + 160, 20); ctx.stroke();
    ctx.strokeStyle = 'rgba(160,170,180,0.18)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 70, 820); ctx.lineTo(x - 70, 300); ctx.stroke();
  }
  ctx.fillStyle = '#15181c'; ctx.fillRect(0, 0, W, 34);
  // gantry crane rail across the top, with the crane and its hook
  ctx.fillStyle = '#2a2e34'; ctx.fillRect(0, 110, W, 24); ctx.fillStyle = '#c9a13b'; for (let x = 0; x < W; x += 80) poly(ctx, [x, 110, x + 40, 110, x + 20, 134], 'rgba(201,161,59,0.6)');
  ctx.fillStyle = '#3a3e44'; ctx.fillRect(1180, 134, 120, 40); ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(1240, 174); ctx.lineTo(1240, 360); ctx.stroke();
  poly(ctx, [1226, 360, 1254, 360, 1250, 392, 1236, 400, 1230, 386], '#c9a13b');
  // a red star and a banner: "THE SKY BELONGS TO THE PEOPLE"
  ctx.save(); ctx.translate(960, 220); ctx.fillStyle = '#b31c2e'; ctx.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? 26 : 64, a = -Math.PI / 2 + k / 10 * Math.PI * 2; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.fill(); ctx.restore();
  ctx.fillStyle = '#9e1f28'; ctx.fillRect(560, 300, 800, 56); ctx.fillStyle = '#f0e4c8'; ctx.font = `700 30px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('NEBE PATŘÍ LIDU  ·  THE SKY BELONGS TO THE PEOPLE', 960, 338);
  // the office up on the right: a lit window on a steel mezzanine, and stairs
  ctx.fillStyle = '#20242a'; ctx.fillRect(1500, 250, 420, 250);
  ctx.fillStyle = 'rgba(255,220,150,0.8)'; ctx.fillRect(1530, 280, 360, 150); glow(ctx, 1710, 360, 260, 'rgba(255,200,120,0.3)');
  ctx.strokeStyle = '#20242a'; ctx.lineWidth = 8; for (const x of [1650, 1770]) { ctx.beginPath(); ctx.moveTo(x, 280); ctx.lineTo(x, 430); ctx.stroke(); }
  ctx.fillStyle = '#2a2e34'; ctx.fillRect(1480, 500, 440, 18);
  ctx.strokeStyle = '#5a6068'; ctx.lineWidth = 4; for (let x = 1490; x < 1920; x += 40) { ctx.beginPath(); ctx.moveTo(x, 500); ctx.lineTo(x, 460); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(1480, 460); ctx.lineTo(1920, 460); ctx.stroke();
  for (let k = 0; k < 10; k++) { ctx.fillStyle = '#3a3e44'; ctx.fillRect(1480 - k * 26, 518 + k * 30, 60, 8); }
  ctx.strokeStyle = '#5a6068'; ctx.beginPath(); ctx.moveTo(1500, 480); ctx.lineTo(1240, 780); ctx.stroke();
  ctx.fillStyle = '#3a3e44'; ctx.fillRect(1590, 520, 16, 300); ctx.fillRect(1820, 520, 16, 300);
  // the delivery door on the left, still open: daylight and snow beyond
  ctx.fillStyle = '#1a1c20'; ctx.fillRect(0, 420, 170, 400);
  ctx.fillStyle = linGrad(ctx, 0, 440, 0, 820, [[0, '#8898b8'], [1, '#d8dce8']]); ctx.fillRect(14, 440, 140, 380);
  ctx.fillStyle = '#e8c83a'; for (let y = 430; y < 820; y += 40) ctx.fillRect(154, y, 16, 20);
  // the lighting panel, the drawing board, fuel drums
  ctx.fillStyle = '#4a5240'; ctx.fillRect(210, 470, 110, 150); ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3; ctx.strokeRect(210, 470, 110, 150);
  for (let k = 0; k < 4; k++) { ctx.fillStyle = '#1a1a1a'; ctx.fillRect(230 + k * 22, 510, 12, 30); ctx.fillStyle = k === 3 ? '#b31c2e' : '#c8c8c8'; ctx.fillRect(230 + k * 22, 512, 12, 12); }
  ctx.fillStyle = '#e8c83a'; ctx.fillRect(218, 480, 94, 18); ctx.fillStyle = '#1a1a1a'; ctx.font = `700 12px ${FONT_UI}`; ctx.fillText('SVĚTLA · LIGHTS', 265, 493);
  // hazard stripes and painted markings on the concrete floor
  ctx.fillStyle = linGrad(ctx, 0, 820, 0, H, [[0, '#6a6e72'], [1, '#2a2c30']]); ctx.fillRect(0, 820, W, H - 820);
  texture(ctx, 0, 820, W, H - 820, '#1a1a1a', 1600, 30, 52, 0.2);
  ctx.fillStyle = 'rgba(232,200,58,0.7)'; ctx.fillRect(0, 832, W, 8);
  ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#e8e0cc';
  for (let x = 200; x < W; x += 220) { ctx.beginPath(); ctx.moveTo(x, 960); ctx.lineTo(x + 120, 960); ctx.lineTo(x + 100, 976); ctx.lineTo(x - 20, 976); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  for (const x of [1400, 1450]) { ctx.fillStyle = linGrad(ctx, x - 24, 0, x + 24, 0, [[0, '#2a4a2a'], [0.5, '#4a7a4a'], [1, '#2a4a2a']]); ctx.fillRect(x - 24, 740, 48, 90); ctx.fillStyle = '#1a2a1a'; ctx.fillRect(x - 24, 760, 48, 6); ctx.fillRect(x - 24, 800, 48, 6); }
  // sodium lamps hanging from the roof
  for (const x of [300, 760, 1200, 1660]) { ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 34); ctx.lineTo(x, 180); ctx.stroke(); poly(ctx, [x - 40, 200, x + 40, 200, x + 16, 176, x - 16, 176], '#2a2e34'); ellipse(ctx, x, 202, 30, 8, '#ffd08a'); }
}
// The lighting in the hangar changes when the floodlights go on.
function hangarLight(ctx, on) {
  for (const x of [300, 760, 1200, 1660]) lightCone(ctx, x, 202, 60, on ? 700 : 420, on ? 660 : 500, on ? 'rgba(255,240,210,0.6)' : 'rgba(255,190,110,0.5)', on ? 0.35 : 0.22);
}
// Hana's drawing board.
function paintDrawingBoard(ctx) {
  ctx.save(); ctx.translate(430, 830); ctx.scale(0.85, 0.85);
  ctx.strokeStyle = '#2a2e34'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(0, -190); ctx.lineTo(60, 0); ctx.stroke();
  ctx.rotate(-0.5); ctx.fillStyle = '#e8ecf0'; ctx.fillRect(-120, -290, 240, 160);
  ctx.strokeStyle = 'rgba(30,60,140,0.8)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-100, -210); ctx.lineTo(60, -240); ctx.lineTo(100, -210); ctx.lineTo(60, -180); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-20, -210); ctx.lineTo(40, -270); ctx.moveTo(-20, -210); ctx.lineTo(40, -150); ctx.stroke();
  ctx.fillStyle = '#9e1f28'; ctx.font = `700 14px ${FONT_UI}`; ctx.fillText('NIGHTGLASS · Č.7', -40, -140);
  ctx.restore();
}

// ---- the aircraft itself, side-on: faceted, black, and very sharp ---------------
function paintJetSide(ctx, x, y, s, opts = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // landing gear
  ctx.fillStyle = '#2a2e34';
  for (const [gx, h] of [[-300, 90], [80, 90], [160, 90]]) { ctx.fillRect(gx - 6, -h, 12, h - 20); ellipse(ctx, gx, -26, 26, 26, '#111'); ellipse(ctx, gx, -26, 9, 9, '#5a5e64'); }
  if (opts.tarp) {
    // a vast grey-green tarpaulin roped down over everything
    ctx.fillStyle = linGrad(ctx, 0, -300, 0, -60, [[0, '#5a6450'], [1, '#2a3024']]);
    ctx.beginPath(); ctx.moveTo(-480, -60); ctx.quadraticCurveTo(-470, -160, -300, -190); ctx.lineTo(-60, -230); ctx.quadraticCurveTo(80, -330, 260, -310); ctx.lineTo(420, -300); ctx.lineTo(470, -60); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 4;
    for (let k = 0; k < 9; k++) { const fx = -420 + k * 100; ctx.beginPath(); ctx.moveTo(fx, -60); ctx.quadraticCurveTo(fx + 20, -150, fx + 10, -200 - (k > 3 ? 60 : 0)); ctx.stroke(); }
    ctx.strokeStyle = '#c8b890'; ctx.lineWidth = 3; for (const fx of [-360, -60, 260]) { ctx.beginPath(); ctx.moveTo(fx, -60); ctx.lineTo(fx + 40, 0); ctx.stroke(); }
    ctx.fillStyle = '#e8e0cc'; ctx.font = `700 34px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('NEDOTÝKAT SE', 0, -130);
    ctx.restore(); return;
  }
  // fuselage: a long faceted wedge
  const body = '#0c0f14', lit = '#1c222c', edge = 'rgba(160,180,210,0.25)';
  poly(ctx, [-470, -110, -300, -150, -120, -190, 200, -190, 440, -150, 450, -100, 300, -80, -300, -80], body);
  poly(ctx, [-470, -110, -300, -150, -120, -190, 0, -180, -300, -120], lit);
  // the cockpit canopy, angular panes
  poly(ctx, [-260, -155, -170, -215, -60, -222, -40, -190, -180, -168], '#1a2a3a');
  ctx.strokeStyle = 'rgba(200,220,255,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-170, -215); ctx.lineTo(-150, -170); ctx.moveTo(-100, -220); ctx.lineTo(-95, -180); ctx.stroke();
  // wing root and V-tails raked back
  poly(ctx, [-60, -130, 260, -120, 360, -95, -20, -95], '#080a0e');
  poly(ctx, [240, -190, 330, -330, 380, -330, 360, -190], body);
  poly(ctx, [290, -180, 420, -300, 450, -290, 400, -170], lit);
  // intakes, panel lines, the tail exhaust slot
  poly(ctx, [-60, -150, 60, -150, 50, -125, -50, -125], '#040506');
  ctx.strokeStyle = edge; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-470, -110); ctx.lineTo(-300, -150); ctx.lineTo(-120, -190); ctx.lineTo(200, -190); ctx.lineTo(440, -150); ctx.stroke();
  for (const px of [-200, 0, 150, 300]) { ctx.beginPath(); ctx.moveTo(px, -186); ctx.lineTo(px + 20, -84); ctx.stroke(); }
  ctx.fillStyle = '#050608'; ctx.fillRect(420, -135, 36, 30);
  if (opts.glow) glow(ctx, 470, -120, 70, 'rgba(255,140,60,0.8)', opts.glow);
  // the equipment bay under the belly, open or shut
  if (opts.bayOpen) {
    ctx.fillStyle = '#020203'; ctx.fillRect(-160, -84, 150, 40);
    poly(ctx, [-160, -84, -170, -30, -150, -30, -140, -84], '#1a1e24');
    glow(ctx, -85, -70, 40, 'rgba(255,60,40,0.35)');
  } else { ctx.strokeStyle = edge; ctx.strokeRect(-160, -86, 150, 6); }
  // a red star, very small, and a number: 7
  ctx.fillStyle = '#6a1a1a'; ctx.font = `700 28px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('07', 120, -140);
  glow(ctx, 330, -320, 12, 'rgba(255,60,60,0.9)', Math.sin((G.t || 0) * 6) > 0 ? 1 : 0.15);
  ctx.restore();
}

// ===========================================================================
// VASKO'S OFFICE — on the mezzanine, looking down into the hangar
// ===========================================================================
function paintOffice4(ctx) {
  // panelled walls, very Colonel
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 820, [[0, '#2a1a12'], [1, '#4a2c1a']]); ctx.fillRect(0, 0, W, 820);
  texture(ctx, 0, 0, W, 820, '#140a06', 2000, 80, 61, 0.2, Math.PI / 2);
  for (let x = 0; x < W; x += 240) { ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 4; ctx.strokeRect(x + 20, 120, 200, 560); }
  // the great window over the hangar: the tarpaulined jet far below, and lamps
  ctx.fillStyle = '#0c0e12'; ctx.fillRect(520, 110, 880, 460);
  ctx.save(); ctx.beginPath(); ctx.rect(540, 130, 840, 420); ctx.clip();
  rockWall(ctx, 540, 130, 840, 420, 71, '#2a2a32');
  for (const x of [640, 960, 1280]) { lightCone(ctx, x, 150, 30, 260, 400, 'rgba(255,200,120,0.5)', 0.25); ellipse(ctx, x, 152, 14, 4, '#ffd08a'); }
  ctx.fillStyle = '#4a4e52'; ctx.fillRect(540, 470, 840, 80);
  ctx.save(); ctx.translate(960, 500); ctx.scale(0.42, 0.42); paintJetSide(ctx, 0, 0, 1, { tarp: true }); ctx.restore();
  ctx.fillStyle = 'rgba(160,190,230,0.1)'; ctx.fillRect(540, 130, 840, 420);
  ctx.restore();
  ctx.strokeStyle = '#1a1c20'; ctx.lineWidth = 12; for (const x of [820, 1100]) { ctx.beginPath(); ctx.moveTo(x, 130); ctx.lineTo(x, 550); ctx.stroke(); }
  // map of Europe with pins, Istanbul ringed in red
  ctx.fillStyle = '#e8dcc0'; ctx.fillRect(90, 160, 360, 260); ctx.strokeStyle = '#5a3a20'; ctx.lineWidth = 8; ctx.strokeRect(90, 160, 360, 260);
  ctx.fillStyle = '#9ab0c0'; ctx.fillRect(98, 168, 344, 244);
  ctx.fillStyle = '#c8b890';
  poly(ctx, [120, 200, 220, 180, 300, 200, 380, 190, 430, 230, 420, 300, 360, 320, 330, 380, 280, 350, 250, 400, 200, 360, 160, 330, 130, 280], '#c8b890');
  poly(ctx, [300, 350, 330, 380, 360, 360, 400, 380, 420, 360, 380, 340], '#c8b890');
  for (const [px, py] of [[240, 270], [270, 240], [300, 300], [210, 300]]) ellipse(ctx, px, py, 5, 5, '#b31c2e');
  ctx.strokeStyle = '#b31c2e'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(385, 372, 20, 0, 7); ctx.stroke();
  ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(270, 270); ctx.quadraticCurveTo(340, 280, 380, 360); ctx.stroke(); ctx.setLineDash([]);
  // the wall calendar with a date circled
  ctx.fillStyle = '#f0ece0'; ctx.fillRect(1480, 150, 200, 260); ctx.fillStyle = '#9e1f28'; ctx.fillRect(1480, 150, 200, 50);
  ctx.fillStyle = '#f0ece0'; ctx.font = `700 22px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('PROSINEC 1987', 1580, 184);
  ctx.fillStyle = '#2a2a2a'; ctx.font = `500 14px ${FONT_UI}`;
  for (let d = 1; d <= 31; d++) { const c = (d + 0) % 7, rr = Math.floor((d + 0) / 7); ctx.fillText(String(d), 1500 + c * 27, 230 + rr * 34); }
  ctx.strokeStyle = '#b31c2e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(1500 + 3 * 27, 230 - 5, 13, 0, 7); ctx.stroke();
  // the safe, with a keypad
  ctx.fillStyle = linGrad(ctx, 1740, 0, 1900, 0, [[0, '#3a3e44'], [0.5, '#5a5e64'], [1, '#2a2e34']]); rrect(ctx, 1740, 470, 160, 200, 8); ctx.fill();
  ctx.fillStyle = '#1a1c20'; ctx.fillRect(1780, 520, 80, 100);
  for (let k = 0; k < 12; k++) { ctx.fillStyle = '#c8c8c8'; ctx.fillRect(1788 + (k % 3) * 24, 530 + Math.floor(k / 3) * 22, 16, 14); }
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(1760, 480, 120, 20); ctx.fillStyle = '#1a1a1a'; ctx.font = `700 12px ${FONT_UI}`; ctx.fillText('TREZOR', 1820, 494);
  // a medal cabinet, and yet another Vasko
  ctx.fillStyle = '#3a2414'; ctx.fillRect(1480, 460, 200, 240); ctx.fillStyle = 'rgba(160,190,230,0.15)'; ctx.fillRect(1490, 470, 180, 220);
  for (let k = 0; k < 12; k++) { ellipse(ctx, 1510 + (k % 4) * 44, 500 + Math.floor(k / 4) * 70, 12, 12, '#c9a13b'); ctx.fillStyle = ['#b31c2e', '#2a4a8a', '#e8e0cc'][k % 3]; ctx.fillRect(1504 + (k % 4) * 44, 470 + Math.floor(k / 4) * 70, 12, 18); }
  paintVaskoPortrait(ctx, 170, 470, 130, 170);
  // the door back to the stairs
  paintDoor(ctx, 10, 230, 60, 580, '#3a2414', '#1a0e06', '#c9a13b', false);
  // the floor: a red carpet, obviously
  ctx.fillStyle = linGrad(ctx, 0, 820, 0, H, [[0, '#6a1a1e'], [1, '#2a0a0c']]); ctx.fillRect(0, 820, W, H - 820);
  ctx.fillStyle = 'rgba(201,161,59,0.4)'; ctx.fillRect(0, 846, W, 6); ctx.fillRect(0, 1050, W, 6);
  texture(ctx, 0, 820, W, H - 820, '#000', 1200, 12, 62, 0.2);
}
// Vasko's desk, drawn in front: a lamp, a telephone and a model of the jet.
function paintVaskoDesk(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 690, 0, 850, [[0, '#5a3418'], [1, '#2a180a']]); ctx.fillRect(820, 700, 520, 150);
  ctx.fillStyle = '#6a4424'; ctx.fillRect(800, 680, 560, 26);
  ctx.fillStyle = '#1e5a2e'; ctx.fillRect(900, 670, 240, 12);
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(1180, 600, 8, 80); poly(ctx, [1150, 600, 1220, 600, 1200, 570, 1170, 570], '#1e5a2e'); glow(ctx, 1184, 620, 120, 'rgba(255,220,150,0.5)');
  ctx.fillStyle = '#1a1a1a'; rrect(ctx, 850, 640, 70, 40, 8); ctx.fill(); ctx.fillRect(856, 628, 58, 14);
  ctx.save(); ctx.translate(1040, 660); ctx.scale(0.12, 0.12); paintJetSide(ctx, 0, 0, 1); ctx.restore();
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(1030, 660, 20, 12);
}

// ===========================================================================
// THE RUNWAY — a strip blasted out of the mountainside, at night
// ===========================================================================
function paintRunway(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 700, [[0, '#02040a'], [0.7, '#0c1428'], [1, '#1a2238']]); ctx.fillRect(0, 0, W, 720);
  const r = rng(71); for (let i = 0; i < 220; i++) ellipse(ctx, r() * W, r() * 480, r() * 1.4 + 0.3, r() * 1.4 + 0.3, `rgba(255,255,255,${0.3 + r() * 0.6})`);
  paintMountains(ctx, 73, 700, 380, '#0e1830', 'rgba(210,225,245,0.45)');
  ctx.fillStyle = linGrad(ctx, 0, 690, 0, 800, [[0, '#141c30'], [1, '#0a0e18']]); ctx.fillRect(0, 690, W, 110);
  fog(ctx, 560, 760, 'rgba(150,170,200,0.2)', 1);
  // far below: the lights of the village
  for (let i = 0; i < 30; i++) ellipse(ctx, 1200 + r() * 600, 690 + r() * 30, 2, 2, 'rgba(255,210,140,0.9)');
  // the hangar mouth on the left, glowing
  rockWall(ctx, 0, 0, 520, 820, 75, '#2a2a32');
  ctx.fillStyle = '#ffd08a'; ctx.beginPath(); ctx.moveTo(60, 820); ctx.lineTo(60, 420); ctx.quadraticCurveTo(250, 300, 440, 420); ctx.lineTo(440, 820); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(160,110,50,0.6)'; ctx.fillRect(60, 700, 380, 120);
  glow(ctx, 250, 600, 400, 'rgba(255,200,120,0.35)');
  // the concrete strip with edge lights running off towards the drop
  ctx.fillStyle = linGrad(ctx, 0, 800, 0, H, [[0, '#4a4e56'], [1, '#1a1c22']]); ctx.fillRect(0, 800, W, H - 800);
  snowLedge(ctx, 0, 800, W, 10);
  for (let x = 480; x < W; x += 150) { ellipse(ctx, x, 830, 6, 4, '#8ad0ff'); glow(ctx, x, 830, 30, 'rgba(120,200,255,0.6)'); ellipse(ctx, x + 40, 1050, 8, 5, '#8ad0ff'); }
  ctx.fillStyle = 'rgba(232,224,204,0.35)'; for (let x = 500; x < W; x += 260) ctx.fillRect(x, 930, 140, 10);
}

// ===========================================================================
// TITLE — the mountain at night, the hangar open, the jet on the runway
// ===========================================================================
function paintTitle4(x) {
  x.fillStyle = linGrad(x, 0, 0, 0, H, [[0, '#02040a'], [0.6, '#0e1a30'], [1, '#1a2438']]); x.fillRect(0, 0, W, H);
  const r = rng(9); for (let i = 0; i < 240; i++) ellipse(x, r() * W, r() * 520, r() * 1.4 + 0.3, r() * 1.4 + 0.3, `rgba(255,255,255,${0.3 + r() * 0.6})`);
  ellipse(x, 1560, 190, 54, 54, '#eef2f6'); glow(x, 1560, 190, 340, 'rgba(180,200,255,0.3)');
  paintMountains(x, 81, 760, 560, '#101c32', 'rgba(210,225,245,0.55)');
  // the great peak with a glowing slot cut in its side
  poly(x, [900, 900, 1300, 220, 1420, 180, 1920, 900], '#141e34');
  poly(x, [1240, 320, 1300, 220, 1420, 180, 1480, 300, 1380, 270], 'rgba(230,240,255,0.7)');
  x.fillStyle = '#ffd08a'; x.fillRect(1180, 560, 300, 60); glow(x, 1330, 590, 300, 'rgba(255,200,120,0.4)');
  x.save(); x.translate(1330, 612); x.scale(0.2, 0.2); paintJetSide(x, 0, 0, 1); x.restore();
  fog(x, 640, 860, 'rgba(150,170,200,0.25)', 1);
  paintPines(x, 23, 900, 200, '#060b16', 0, W, 0.9);
  x.fillStyle = linGrad(x, 0, 900, 0, H, [[0, '#6a7890'], [1, '#2a3040']]); x.fillRect(0, 900, W, H - 900);
  // the village below, a few warm windows
  for (let i = 0; i < 16; i++) { x.fillStyle = 'rgba(255,210,140,0.9)'; x.fillRect(200 + r() * 700, 860 + r() * 30, 8, 10); }
  x.fillStyle = linGrad(x, 0, 0, 1200, 0, [[0, 'rgba(2,4,10,0.8)'], [0.6, 'rgba(2,4,10,0.55)'], [1, 'rgba(2,4,10,0)']]); x.fillRect(0, 0, 1200, H);
}
