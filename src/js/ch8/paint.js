// ---------------------------------------------------------------------------
// Chapter Eight paint — Monte Carlo on Grand Prix weekend: the deck of Madame
// Novak's yacht in Port Hercule at dusk (and again at dawn), the Salle Blanche
// of the Casino with its baccarat table, and the title card.
// ---------------------------------------------------------------------------

// The town climbing the hill behind the harbour, with the Casino on top.
function paintMonaco(ctx, dawn) {
  const sky = dawn ? [[0, '#6a8ab8'], [0.6, '#f0b8a0'], [1, '#ffe0b0']] : [[0, '#1a2448'], [0.55, '#8a5a7a'], [1, '#f0a070']];
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 560, sky); ctx.fillRect(0, 0, W, 560);
  if (dawn) glow(ctx, 1600, 420, 360, 'rgba(255,230,180,0.6)');
  // the Rock and the hills
  ctx.fillStyle = dawn ? '#8a8a7a' : '#3a3a48';
  ctx.beginPath(); ctx.moveTo(0, 520); ctx.quadraticCurveTo(300, 250, 700, 300); ctx.quadraticCurveTo(1100, 180, 1500, 260); ctx.quadraticCurveTo(1800, 220, W, 300); ctx.lineTo(W, 560); ctx.lineTo(0, 560); ctx.fill();
  // pastel buildings, terraces of them
  const r = rng(301);
  for (let row = 0; row < 4; row++) for (let k = 0; k < 16; k++) {
    const x = k * 124 + r() * 40 - 20, y = 330 + row * 50 + r() * 20, w = 70 + r() * 60, h = 70 + r() * 50;
    const c = pick3(r, ['#f0d0b0', '#e8b8a0', '#f4e4c8', '#d8a888', '#f0c8a8', '#e8e0d0']);
    ctx.fillStyle = dawn ? c : shadeColor(c, -0.45); ctx.fillRect(x, y, w, h);
    ctx.fillStyle = dawn ? '#b8604a' : '#5a2a2a'; ctx.fillRect(x - 4, y - 8, w + 8, 10);
    for (let wy = 0; wy < 2; wy++) for (let wx = 0; wx < 3; wx++) { ctx.fillStyle = !dawn && r() < 0.6 ? '#ffd890' : (dawn ? '#6a7a8a' : '#2a2a3a'); ctx.fillRect(x + 10 + wx * (w - 20) / 3, y + 16 + wy * 28, 10, 16); }
  }
  // the Casino: a copper-green dome between two towers
  const cx = 1180, cy = 330;
  ctx.fillStyle = dawn ? '#f0e4c8' : '#8a8070'; ctx.fillRect(cx - 170, cy - 60, 340, 110);
  for (const tx of [cx - 150, cx + 150]) { ctx.fillStyle = dawn ? '#f0e4c8' : '#8a8070'; ctx.fillRect(tx - 24, cy - 130, 48, 90); ctx.fillStyle = dawn ? '#4a8a7a' : '#2a4a44'; ctx.beginPath(); ctx.moveTo(tx - 28, cy - 130); ctx.quadraticCurveTo(tx, cy - 190, tx + 28, cy - 130); ctx.fill(); }
  ctx.fillStyle = dawn ? '#4a8a7a' : '#2a4a44'; ctx.beginPath(); ctx.ellipse(cx, cy - 60, 70, 60, 0, Math.PI, 0); ctx.fill();
  if (!dawn) { for (let k = 0; k < 7; k++) { ctx.fillStyle = '#ffe0a0'; ctx.fillRect(cx - 150 + k * 48, cy - 30, 20, 50); } glow(ctx, cx, cy, 300, 'rgba(255,220,150,0.35)'); }
}
// A white motor yacht in the background, moored stern-to.
function paintYachtFar(ctx, x, y, s, lit) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#f0ece4'; ctx.beginPath(); ctx.moveTo(-160, 0); ctx.lineTo(160, 0); ctx.lineTo(190, -40); ctx.lineTo(-170, -40); ctx.fill();
  ctx.fillStyle = '#e0dcd4'; ctx.fillRect(-120, -80, 200, 40); ctx.fillRect(-80, -110, 120, 30);
  ctx.fillStyle = lit ? '#ffd890' : '#3a4a5a'; for (let k = 0; k < 6; k++) ctx.fillRect(-110 + k * 32, -70, 20, 12);
  ctx.strokeStyle = '#c8ccd0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-20, -110); ctx.lineTo(-20, -190); ctx.stroke();
  ctx.restore();
}

function paintYachtDeck(ctx, dawn) {
  paintMonaco(ctx, dawn);
  // the harbour: water, moored yachts, the Grand Prix grandstand and tyre walls on the quay
  ctx.fillStyle = linGrad(ctx, 0, 540, 0, 820, dawn ? [[0, '#6a9ab8'], [1, '#2a5a7a']] : [[0, '#2a3a5a'], [1, '#0a1428']]); ctx.fillRect(0, 540, W, 280);
  ctx.fillStyle = '#b8b0a0'; ctx.fillRect(0, 520, W, 22);
  // the grandstand and the barriers
  ctx.fillStyle = dawn ? '#6a6a70' : '#2a2a30'; ctx.fillRect(80, 440, 520, 80);
  for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? (dawn ? '#8a8a90' : '#3a3a40') : (dawn ? '#7a7a80' : '#32323a'); ctx.fillRect(80, 450 + k * 12, 520, 6); }
  for (let x = 0; x < W; x += 40) { ctx.fillStyle = (x / 40) % 2 ? '#d82a2a' : '#f0f0f0'; ctx.fillRect(x, 514, 40, 8); }
  ctx.fillStyle = '#e8e2d6'; ctx.fillRect(660, 470, 360, 36); ctx.fillStyle = '#d82a2a'; ctx.font = `700 26px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('GRAND PRIX DE MONACO', 840, 498);
  for (const [x, s] of [[300, 0.8], [900, 0.6], [1500, 0.9], [1850, 0.7]]) paintYachtFar(ctx, x, 620, s, !dawn);
  const r = rng(302); for (let i = 0; i < 200; i++) { ctx.fillStyle = dawn ? `rgba(255,240,220,${0.1 + r() * 0.2})` : `rgba(255,210,140,${0.05 + r() * 0.2})`; ctx.fillRect(r() * W, 600 + r() * 220, 20 + r() * 60, 2); }
  // our deck: white railings, teak planks, a bar on the left, a door to the saloon on the right
  ctx.fillStyle = '#f4f0e8'; ctx.fillRect(0, 700, W, 14); ctx.fillRect(0, 760, W, 8);
  for (let x = 20; x < W; x += 120) ctx.fillRect(x, 700, 8, 120);
  ctx.fillStyle = '#e8e4dc'; ctx.fillRect(1600, 360, 320, 460);
  ctx.fillStyle = '#c8c0b0'; ctx.fillRect(1610, 370, 300, 10);
  paintDoor(ctx, 1680, 480, 150, 340, '#8a5a30', '#5a3a1a', '#c9a13b', false);
  ctx.fillStyle = '#3a4a5a'; ctx.fillRect(1640, 400, 240, 50); ctx.fillStyle = dawn ? 'rgba(255,240,220,0.5)' : '#ffd890'; ctx.fillRect(1650, 408, 220, 34);
  // the bar
  ctx.fillStyle = '#6a3a1a'; ctx.fillRect(40, 690, 380, 26); ctx.fillStyle = '#4a2a10'; ctx.fillRect(60, 716, 340, 110);
  for (let k = 0; k < 8; k++) { const bx = 80 + k * 40; ctx.fillStyle = pick3(r, ['#2a5a2a', '#8a6a2a', '#c8c8b8', '#6a1a1a']); ctx.fillRect(bx, 640, 16, 50); ctx.fillRect(bx + 5, 624, 6, 16); }
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(40, 686, 380, 4);
  // teak deck
  ctx.fillStyle = linGrad(ctx, 0, 820, 0, H, [[0, '#b0804a'], [1, '#6a4a28']]); ctx.fillRect(0, 820, W, H - 820);
  for (let y = 830; y < H; y += 22) { ctx.fillStyle = 'rgba(40,20,5,0.35)'; ctx.fillRect(0, y, W, 2); }
  texture(ctx, 0, 820, W, H - 820, '#4a2a10', 800, 30, 303, 0.2);
  // a deck chair
  ctx.fillStyle = '#e8e2d6'; ctx.fillRect(560, 800, 16, 90); ctx.fillRect(760, 800, 16, 90);
  ctx.fillStyle = '#2a4a8a'; poly(ctx, [560, 800, 776, 800, 790, 740, 580, 700], '#2a4a8a');
  for (let k = 0; k < 4; k++) { ctx.fillStyle = '#f0ece4'; poly(ctx, [580 + k * 52, 800, 606 + k * 52, 800, 616 + k * 50, 720, 590 + k * 50, 712], '#f0ece4'); }
}
function paintYacht(ctx) { paintYachtDeck(ctx, false); }
function paintYachtDawn(ctx) { paintYachtDeck(ctx, true); }

// ===========================================================================
// THE CASINO — the Salle Blanche
// ===========================================================================
function paintCasino(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 840, [[0, '#4a3a2a'], [1, '#6a5238']]); ctx.fillRect(0, 0, W, 840);
  // gilded pilasters and arched windows onto the night
  for (let k = 0; k < 6; k++) {
    const x = 60 + k * 320;
    ctx.fillStyle = '#c9a13b'; ctx.fillRect(x, 120, 30, 700); ctx.fillStyle = '#e8c870'; ctx.fillRect(x + 6, 120, 6, 700);
    if (k < 5) {
      ctx.fillStyle = '#0a1028'; ctx.beginPath(); ctx.moveTo(x + 80, 640); ctx.lineTo(x + 80, 300); ctx.quadraticCurveTo(x + 175, 200, x + 270, 300); ctx.lineTo(x + 270, 640); ctx.fill();
      const r = rng(310 + k); for (let i = 0; i < 20; i++) ellipse(ctx, x + 90 + r() * 170, 260 + r() * 360, 2, 2, 'rgba(255,220,150,0.8)');
      ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + 80, 640); ctx.lineTo(x + 80, 300); ctx.quadraticCurveTo(x + 175, 200, x + 270, 300); ctx.lineTo(x + 270, 640); ctx.stroke();
      ctx.fillStyle = '#8a1a2a'; ctx.fillRect(x + 60, 280, 30, 380); ctx.fillRect(x + 260, 280, 30, 380); // curtains
    }
  }
  // the painted ceiling and its cornice
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 120, [[0, '#e8d8b0'], [1, '#c8a870']]); ctx.fillRect(0, 0, W, 120);
  const r = rng(311); for (let i = 0; i < 14; i++) ellipse(ctx, r() * W, 30 + r() * 60, 80 + r() * 80, 20 + r() * 16, 'rgba(255,250,240,0.5)');
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(0, 110, W, 18);
  // the cage on the right: the cashier's window, behind brass bars
  ctx.fillStyle = '#3a2a1a'; ctx.fillRect(1660, 420, 260, 420);
  ctx.fillStyle = '#e8d8b0'; ctx.fillRect(1690, 460, 200, 160); ctx.fillStyle = 'rgba(40,30,20,0.6)'; ctx.fillRect(1700, 470, 180, 140);
  ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 5; for (let k = 0; k < 8; k++) { ctx.beginPath(); ctx.moveTo(1700 + k * 26, 460); ctx.lineTo(1700 + k * 26, 620); ctx.stroke(); }
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(1680, 620, 220, 16);
  ctx.fillStyle = '#e8d8b0'; ctx.font = `700 24px ${FONT_DISPLAY}`; ctx.textAlign = 'center'; ctx.fillText('CAISSE', 1790, 446);
  // the pit boss's trolley of sealed card shoes, by the left pilaster
  ctx.fillStyle = '#6a4a2a'; ctx.fillRect(110, 700, 200, 16); ctx.fillStyle = '#4a3018'; ctx.fillRect(120, 716, 12, 110); ctx.fillRect(288, 716, 12, 110); ctx.fillRect(120, 780, 180, 10);
  for (let k = 0; k < 3; k++) { ctx.fillStyle = '#1a3a2a'; rrect(ctx, 130 + k * 58, 650, 50, 50, 5); ctx.fill(); ctx.fillStyle = '#d82a2a'; ctx.fillRect(130 + k * 58, 670, 50, 8); }
  // red carpet
  ctx.fillStyle = linGrad(ctx, 0, 840, 0, H, [[0, '#7a1a22'], [1, '#3a0a10']]); ctx.fillRect(0, 840, W, H - 840);
  for (let k = 0; k < 10; k++) { ctx.strokeStyle = 'rgba(201,161,59,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(W / 2, 960, 200 + k * 100, 40 + k * 14, 0, 0, 7); ctx.stroke(); }
}
// The baccarat table, drawn in front: green baize, a curved rail, the shoe.
function paintBaccarat(ctx, t, swapped) {
  const cx = 1000, cy = 820;
  ctx.fillStyle = '#4a2a14'; ctx.beginPath(); ctx.ellipse(cx, cy, 420, 90, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#1a6a3a'; ctx.beginPath(); ctx.ellipse(cx, cy - 6, 396, 76, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#e8d8b0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, cy - 6, 300, 52, 0, 0, 7); ctx.stroke();
  ctx.fillStyle = '#e8d8b0'; ctx.font = `700 18px ${FONT_DISPLAY}`; ctx.textAlign = 'center'; ctx.fillText('BANCO', cx - 170, cy - 2); ctx.fillText('PUNTO', cx + 170, cy - 2);
  // the legs
  ctx.fillStyle = '#3a2010'; ctx.fillRect(cx - 300, cy + 60, 24, 120); ctx.fillRect(cx + 276, cy + 60, 24, 120);
  // the shoe, and chips in towers
  ctx.fillStyle = swapped ? '#1a3a2a' : '#2a2a2a'; rrect(ctx, cx - 30, cy - 60, 70, 36, 6); ctx.fill(); ctx.fillStyle = '#f0ece4'; ctx.fillRect(cx + 26, cy - 50, 12, 16);
  const r = rng(312);
  for (let k = 0; k < 6; k++) { const px = cx - 250 + k * 90, n = 3 + Math.floor(r() * 5); for (let j = 0; j < n; j++) ellipse(ctx, px, cy - 20 - j * 6, 16, 6, pick3(r, ['#d82a2a', '#2a6ad8', '#f0ece4', '#c9a13b', '#1a1a1a'])); }
}

// ===========================================================================
// TITLE — Monte Carlo at night, from the harbour
// ===========================================================================
function paintTitle8(x) {
  paintMonaco(x, false);
  x.fillStyle = linGrad(x, 0, 540, 0, H, [[0, '#1a2448'], [1, '#04060c']]); x.fillRect(0, 540, W, H - 540);
  x.fillStyle = '#b8b0a0'; x.fillRect(0, 520, W, 22);
  for (let xx = 0; xx < W; xx += 40) { x.fillStyle = (xx / 40) % 2 ? '#d82a2a' : '#f0f0f0'; x.fillRect(xx, 514, 40, 8); }
  for (const [px, s] of [[1400, 1.1], [1800, 0.8], [960, 0.7]]) paintYachtFar(x, px, 640, s, true);
  const r = rng(320); for (let i = 0; i < 200; i++) { x.fillStyle = `rgba(255,210,140,${0.05 + r() * 0.25})`; x.fillRect(r() * W, 560 + r() * 500, 20 + r() * 80, 2); }
  x.fillStyle = linGrad(x, 1200, 0, 0, 0, [[0, 'rgba(2,4,10,0)'], [1, 'rgba(2,4,10,0.8)']]); x.fillRect(0, 0, 1200, H);
}
