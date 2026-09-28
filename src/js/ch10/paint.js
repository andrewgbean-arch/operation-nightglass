// ---------------------------------------------------------------------------
// Chapter Ten paint — London in the rain, December 1987: Stan's chip shop in
// Lambeth, the goods yard of Headquarters with Westminster across the river,
// Miss Penrose's office and Control's, the Palm Court of the Wellington, and
// the title card.
// ---------------------------------------------------------------------------

// Westminster across the river: the clock tower, the long Gothic front, the Victoria Tower.
function paintWestminster(ctx, x0, base, s, col, lit = true) {
  ctx.fillStyle = col;
  ctx.fillRect(x0 + 40 * s, base - 90 * s, 520 * s, 90 * s);
  for (let k = 0; k < 27; k++) { const x = x0 + 44 * s + k * 19.5 * s; ctx.fillRect(x, base - 112 * s, 5 * s, 24 * s); poly(ctx, [x - 1 * s, base - 112 * s, x + 6 * s, base - 112 * s, x + 2.5 * s, base - 126 * s], col); }
  // the Victoria Tower at the far end
  ctx.fillRect(x0 + 480 * s, base - 240 * s, 74 * s, 240 * s);
  for (const d of [0, 1]) { const x = x0 + 478 * s + d * 72 * s; ctx.fillRect(x, base - 262 * s, 6 * s, 30 * s); poly(ctx, [x - 1 * s, base - 262 * s, x + 7 * s, base - 262 * s, x + 3 * s, base - 276 * s], col); }
  // the clock tower at the near end
  const cx = x0;
  ctx.fillRect(cx, base - 300 * s, 46 * s, 300 * s);
  ctx.fillRect(cx - 6 * s, base - 336 * s, 58 * s, 44 * s);
  poly(ctx, [cx - 8 * s, base - 336 * s, cx + 54 * s, base - 336 * s, cx + 46 * s, base - 360 * s, cx, base - 360 * s], col);
  poly(ctx, [cx + 2 * s, base - 360 * s, cx + 44 * s, base - 360 * s, cx + 23 * s, base - 440 * s], col);
  if (lit) { ellipse(ctx, cx + 23 * s, base - 314 * s, 15 * s, 15 * s, '#f0e2a8'); glow(ctx, cx + 23 * s, base - 314 * s, 60 * s, 'rgba(255,230,160,0.35)'); }
  // windows along the front, a few still lit
  if (lit) { const r = rng(1001); for (let k = 0; k < 40; k++) if (r() < 0.4) { ctx.fillStyle = 'rgba(255,220,150,0.7)'; ctx.fillRect(x0 + 50 * s + k * 12.5 * s, base - (70 - (k % 3) * 22) * s, 4 * s, 7 * s); } }
}

// Rain running down a dark pane of glass.
function paintWetGlass(ctx, x, y, w, h, seed, tint = '#0c141e') {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (tint) { ctx.fillStyle = linGrad(ctx, 0, y, 0, y + h, [[0, tint], [1, shadeColor(tint, 0.2)]]); ctx.fillRect(x, y, w, h); }
  const r = rng(seed);
  ctx.strokeStyle = 'rgba(200,220,240,0.22)'; ctx.lineWidth = 2;
  for (let i = 0; i < w * h / 1400; i++) { const px = x + r() * w, py = y + r() * h, l = 10 + r() * 40; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + (r() - 0.5) * 4, py + l); ctx.stroke(); ellipse(ctx, px, py + l, 2.5, 3, 'rgba(210,230,250,0.3)'); }
  ctx.restore();
}

// ===========================================================================
// THE CHIP SHOP — The Plaice to Be, Lambeth, at night
// ===========================================================================
function paintChippy(ctx) {
  // cream wall above a dado of green tiles
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 480, [[0, '#cfc2a2'], [1, '#e8dcbc']]); ctx.fillRect(0, 0, W, 480);
  for (let y = 480; y < 840; y += 40) for (let x = 0; x < W; x += 40) { ctx.fillStyle = ((x + y) / 40) % 2 ? '#2e6a4e' : '#347656'; ctx.fillRect(x, y, 40, 40); }
  ctx.strokeStyle = 'rgba(230,230,210,0.35)'; ctx.lineWidth = 2;
  for (let y = 480; y <= 840; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 480); ctx.lineTo(x, 840); ctx.stroke(); }
  ctx.fillStyle = '#1a3a2a'; ctx.fillRect(0, 470, W, 14);
  // strip lights
  for (const x of [300, 900, 1500]) { ctx.fillStyle = '#f4f6f0'; ctx.fillRect(x, 26, 260, 12); glow(ctx, x + 130, 40, 260, 'rgba(240,250,230,0.25)'); }
  // the shop window: the street outside in the rain, and our name backwards in gold
  ctx.fillStyle = '#2a4a3a'; ctx.fillRect(20, 170, 400, 600);
  paintWetGlass(ctx, 36, 186, 368, 568, 1011, '#0e1622');
  ctx.save(); ctx.beginPath(); ctx.rect(36, 186, 368, 568); ctx.clip();
  paintLampPost(ctx, 250, 700, 380, '#05080c'); glow(ctx, 250, 400, 160, 'rgba(255,210,140,0.45)');
  ctx.fillStyle = '#05080c'; ctx.fillRect(36, 690, 368, 64);
  ctx.translate(220, 260); ctx.scale(-1, 1); ctx.fillStyle = '#d9b35c'; ctx.font = `italic 700 40px ${FONT_DISPLAY}`; ctx.textAlign = 'center'; ctx.fillText('Fish & Chips', 0, 0);
  ctx.restore();
  // the door, with its OPEN sign
  ctx.fillStyle = '#1e3a2c'; ctx.fillRect(430, 290, 160, 550);
  paintWetGlass(ctx, 450, 320, 120, 290, 1012, '#0e1622');
  ctx.fillStyle = '#1e3a2c'; ctx.fillRect(450, 440, 120, 10);
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(562, 640, 14, 40);
  ctx.strokeStyle = '#5a5a5a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(490, 330); ctx.lineTo(510, 360); ctx.lineTo(530, 330); ctx.stroke();
  ctx.fillStyle = '#b01a1a'; rrect(ctx, 470, 360, 80, 34, 4); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `700 22px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('OPEN', 510, 385);
  // the menu board
  ctx.fillStyle = '#5a3a1a'; ctx.fillRect(620, 100, 820, 250); ctx.fillStyle = '#141614'; ctx.fillRect(634, 114, 792, 222);
  ctx.fillStyle = '#d9b35c'; ctx.font = `italic 700 44px ${FONT_DISPLAY}`; ctx.fillText('The Plaice to Be', 1030, 164);
  ctx.font = `600 26px ${FONT_UI}`; ctx.fillStyle = '#f0ece0';
  const menu = [['COD', '1.20'], ['HADDOCK', '1.40'], ['PLAICE', '1.30'], ['SKATE', '1.60'], ['CHIPS', '0.45'], ['MUSHY PEAS', '0.30'], ['PICKLED EGG', '0.20'], ['SAVELOY', '0.55']];
  menu.forEach(([n, p], i) => { const x = i < 4 ? 680 : 1060, y = 210 + (i % 4) * 32; ctx.textAlign = 'left'; ctx.fillText(n, x, y); ctx.textAlign = 'right'; ctx.fillText(p, x + 320, y); });
  ctx.textAlign = 'center';
  // the frying range behind the counter: steel, three pans under a hood, a hot cabinet of fish
  ctx.fillStyle = linGrad(ctx, 0, 380, 0, 470, [[0, '#8a8e94'], [1, '#b8bcc2']]); poly(ctx, [1090, 470, 1480, 470, 1440, 380, 1130, 380], ctx.fillStyle);
  ctx.fillStyle = linGrad(ctx, 0, 470, 0, 640, [[0, '#c8ccd0'], [1, '#8a8e94']]); ctx.fillRect(600, 470, 900, 170);
  for (let k = 0; k < 3; k++) { const x = 1120 + k * 120; ctx.fillStyle = '#5a5e64'; ctx.fillRect(x, 480, 100, 26); ctx.fillStyle = '#2a2a2a'; ctx.fillRect(x + 6, 486, 88, 14); }
  ctx.fillStyle = '#ffe8b0'; ctx.fillRect(630, 480, 440, 110); glow(ctx, 850, 530, 260, 'rgba(255,210,120,0.35)');
  for (let k = 0; k < 6; k++) { const fx = 670 + k * 64; ctx.save(); ctx.translate(fx, 520); ctx.rotate(-0.2 + (k % 2) * 0.3); ellipse(ctx, 0, 0, 28, 12, '#d8942a'); ellipse(ctx, -4, -3, 20, 6, '#e8b04a'); ctx.restore(); }
  const cr = rng(1013); for (let i = 0; i < 90; i++) { ctx.fillStyle = cr() < 0.5 ? '#e8c050' : '#f0d070'; ctx.save(); ctx.translate(660 + cr() * 380, 562 + cr() * 22); ctx.rotate(cr() * 3); ctx.fillRect(-9, -2, 18, 4); ctx.restore(); }
  ctx.strokeStyle = '#8a8e94'; ctx.lineWidth = 6; ctx.strokeRect(630, 480, 440, 110);
  // a framed photograph: Stan and a very large fish
  ctx.fillStyle = '#3a2a1a'; ctx.fillRect(1480, 380, 120, 90); ctx.fillStyle = '#a89a80'; ctx.fillRect(1490, 390, 100, 70); ellipse(ctx, 1520, 420, 12, 14, '#6a5a4a'); ellipse(ctx, 1558, 430, 30, 8, '#7a8a8a', -0.3);
  // the TV on its bracket (the screen is drawn live)
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(1600, 90, 12, 50);
  ctx.fillStyle = '#4a3a2a'; rrect(ctx, 1480, 130, 260, 200, 14); ctx.fill(); ctx.fillStyle = '#2a2a2a'; ctx.fillRect(1500, 146, 190, 168);
  for (let k = 0; k < 3; k++) ellipse(ctx, 1714, 170 + k * 40, 10, 10, '#b8b2a8');
  // the door to the back, and the stairs up
  paintDoor(ctx, 1760, 380, 130, 460, '#6a4a2a', '#3a2614', '#c9a13b', false);
  ctx.fillStyle = '#e8e2d0'; ctx.fillRect(1780, 420, 90, 30); ctx.fillStyle = '#9e1f28'; ctx.font = `700 20px ${FONT_UI}`; ctx.fillText('PRIVATE', 1825, 442);
  // chequered floor
  for (let y = 840; y < H; y += 48) for (let x = 0; x < W; x += 48) { ctx.fillStyle = (x / 48 + (y - 840) / 48) % 2 ? '#e8e4dc' : '#1e1e22'; ctx.fillRect(x, y, 48, 48); }
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 840, W, 30);
}
// The serving counter, drawn in front of Stan.
function paintChippyCounter(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 640, 0, 850, [[0, '#9e1f28'], [1, '#6a1018']]); ctx.fillRect(560, 650, 960, 200);
  for (let x = 580; x < 1500; x += 120) { ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x, 670, 100, 160); }
  ctx.fillStyle = '#d8dce0'; ctx.fillRect(556, 640, 968, 16); ctx.fillRect(556, 836, 968, 10);
  // the till, the spike, vinegar and salt, a jar of pickled eggs
  ctx.fillStyle = '#6a6e74'; ctx.fillRect(1400, 560, 90, 80); ctx.fillStyle = '#3a3e44'; ctx.fillRect(1410, 540, 70, 26); ctx.fillStyle = '#f0e8c0'; ctx.fillRect(1418, 546, 54, 14);
  ctx.fillStyle = '#2a2a2a'; ctx.fillRect(700, 630, 30, 10); ctx.fillStyle = '#8a8e94'; ctx.fillRect(713, 570, 4, 62);
  for (let k = 0; k < 4; k++) { ctx.fillStyle = k === 1 ? '#f4f0e0' : '#e8e2d0'; ctx.save(); ctx.translate(715, 612 - k * 9); ctx.rotate((k - 1.5) * 0.12); ctx.fillRect(-26, -4, 52, 8); ctx.restore(); }
  ctx.fillStyle = '#5a3010'; ctx.fillRect(1010, 580, 22, 60); ctx.fillRect(1016, 566, 10, 16); ctx.fillStyle = '#e8e4dc'; ctx.fillRect(1044, 598, 20, 42); ctx.fillStyle = '#b8b8b8'; ctx.fillRect(1044, 590, 20, 10);
  ctx.fillStyle = 'rgba(220,230,200,0.5)'; ctx.fillRect(860, 570, 70, 70); for (let k = 0; k < 5; k++) ellipse(ctx, 874 + (k % 3) * 20, 626 - Math.floor(k / 3) * 20, 10, 12, '#f0ecd8'); ctx.fillStyle = '#c82a2a'; ctx.fillRect(856, 562, 78, 10);
}
// PC Dobbs's helmet, upturned on the counter while he eats.
function paintHelmetOnCounter(ctx) {
  ctx.fillStyle = '#14182a'; ctx.beginPath(); ctx.moveTo(1188, 640); ctx.bezierCurveTo(1184, 590, 1204, 574, 1224, 574); ctx.bezierCurveTo(1244, 574, 1264, 590, 1260, 640); ctx.fill();
  ctx.fillStyle = '#22283e'; ctx.beginPath(); ctx.ellipse(1224, 640, 42, 7, 0, 0, 7); ctx.fill();
  ellipse(ctx, 1224, 572, 6, 4, '#c8ccd0');
  ctx.fillStyle = '#d8dce0'; ctx.beginPath(); for (let k = 0; k < 16; k++) { const r = k % 2 ? 5 : 11, a = -Math.PI / 2 + k / 16 * Math.PI * 2; ctx.lineTo(1224 + Math.cos(a) * r, 606 + Math.sin(a) * r); } ctx.fill();
}
// The TV: the news (my face, and the goose), snooker, or nothing.
function drawChippyTV(ctx, t, channel) {
  const x = 1500, y = 146, w = 190, h = 168;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (channel === 'news') {
    ctx.fillStyle = '#1a2a4a'; ctx.fillRect(x, y, w, h);
    if (typeof drawPortrait === 'function') drawPortrait(ctx, 'jack', x + 30, y + 4, 120, 0, t, { bg: '#1a2a4a', bgHi: '#3a4a6a' });
    ctx.fillStyle = '#b01a1a'; ctx.fillRect(x, y + h - 44, w, 44);
    ctx.fillStyle = '#fff'; ctx.font = `700 15px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('WANTED: JACK HARROW', x + w / 2, y + h - 25);
    ctx.font = `600 11px ${FONT_UI}`; ctx.fillText('TRAITOR · WITH GOOSE', x + w / 2, y + h - 9);
  } else if (channel === 'snooker') {
    ctx.fillStyle = '#1e6a3a'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 10; ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
    for (const [bx, by, c] of [[60, 60, '#c81a1a'], [72, 70, '#c81a1a'], [66, 82, '#c81a1a'], [120, 50, '#1a1a1a'], [140, 110, '#f0c020'], [40, 120, '#2a60c0']]) ellipse(ctx, x + bx, y + by, 6, 6, c);
    const cx = x + 100 + Math.sin(t * 1.3) * 30; ellipse(ctx, cx, y + 96, 6, 6, '#f4f4f0');
    ctx.strokeStyle = '#c8a060'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx + 10, y + 100); ctx.lineTo(cx + 90, y + 140); ctx.stroke();
  } else { ctx.fillStyle = '#1a1c1e'; ctx.fillRect(x, y, w, h); }
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let yy = y; yy < y + h; yy += 4) ctx.fillRect(x, yy, w, 1);
  ctx.restore();
  if (channel !== 'off') glow(ctx, x + w / 2, y + h / 2, 180, channel === 'news' ? 'rgba(120,150,255,0.18)' : 'rgba(90,200,120,0.18)');
}

// ===========================================================================
// THE GOODS YARD — Headquarters, Lambeth, on a wet morning
// ===========================================================================
function paintYard(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 600, [[0, '#4a525c'], [1, '#8a9098']]); ctx.fillRect(0, 0, W, 600);
  paintWestminster(ctx, 120, 560, 0.95, '#626a72', false);
  // the river, the embankment wall and its lamps
  ctx.fillStyle = linGrad(ctx, 0, 560, 0, 700, [[0, '#5a6660'], [1, '#3a4440']]); ctx.fillRect(0, 560, 900, 140);
  ctx.strokeStyle = 'rgba(200,210,210,0.18)'; ctx.lineWidth = 2; const rr = rng(1021); for (let i = 0; i < 40; i++) { const x = rr() * 900, y = 570 + rr() * 120; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 30 + rr() * 40, y); ctx.stroke(); }
  ctx.fillStyle = '#8a8478'; ctx.fillRect(0, 680, 900, 80); texture(ctx, 0, 680, 900, 80, '#5a5448', 300, 10, 1022, 0.3);
  for (const x of [140, 480, 820]) paintLampPost(ctx, x, 700, 520, '#1a2a24');
  // Headquarters: a grey concrete tower with no name on it
  ctx.fillStyle = linGrad(ctx, 880, 0, 1920, 0, [[0, '#6e706e'], [1, '#9a9c98']]); ctx.fillRect(880, 0, 1040, 840);
  for (let row = 0; row < 6; row++) for (let k = 0; k < 9; k++) {
    const x = 920 + k * 112, y = 30 + row * 76;
    ctx.fillStyle = '#2a3038'; ctx.fillRect(x, y, 84, 50); ctx.fillStyle = 'rgba(160,180,200,0.18)'; ctx.fillRect(x, y, 84, 16);
    if ((row * 9 + k) % 7 === 3) { ctx.fillStyle = 'rgba(255,230,170,0.5)'; ctx.fillRect(x + 4, y + 4, 76, 42); }
  }
  ctx.fillStyle = '#5a5c5a'; for (let row = 0; row <= 6; row++) ctx.fillRect(880, 20 + row * 76, 1040, 6);
  texture(ctx, 880, 0, 1040, 840, '#4a4c4a', 1200, 30, 1023, 0.2, Math.PI / 2);
  // the goods entrance: a roller shutter half up, the goods lift lit inside
  ctx.fillStyle = '#1a1c1e'; ctx.fillRect(1480, 520, 320, 320);
  ctx.fillStyle = '#ffe8b0'; ctx.fillRect(1560, 640, 160, 200); ctx.fillStyle = '#8a8e94'; ctx.fillRect(1566, 646, 72, 194); ctx.fillRect(1642, 646, 72, 194);
  glow(ctx, 1640, 740, 200, 'rgba(255,230,170,0.25)');
  ctx.fillStyle = '#7a7e80'; ctx.fillRect(1480, 520, 320, 110); for (let y = 526; y < 630; y += 10) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(1480, y, 320, 2); }
  ctx.fillStyle = '#e8c830'; ctx.fillRect(1500, 470, 280, 40); ctx.fillStyle = '#1a1a1a'; ctx.font = `700 24px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('GOODS IN · 07.00 – 08.00', 1640, 498);
  // the sentry box, and the barrier
  ctx.fillStyle = '#1a2a4a'; ctx.fillRect(1250, 560, 140, 280); ctx.fillStyle = '#e8e0c0'; ctx.fillRect(1266, 600, 108, 80); ctx.fillStyle = '#0e1a30'; ctx.fillRect(1240, 548, 160, 18);
  glow(ctx, 1320, 640, 90, 'rgba(255,230,170,0.3)');
  ctx.fillStyle = '#2a2a2a'; ctx.fillRect(1220, 640, 24, 200);
  for (let k = 0; k < 8; k++) { ctx.fillStyle = k % 2 ? '#f4f0e8' : '#c81a1a'; ctx.fillRect(1220 - (k + 1) * 36, 700, 36, 16); }
  // the wet yard
  ctx.fillStyle = linGrad(ctx, 0, 760, 0, H, [[0, '#3e4044'], [1, '#26282c']]); ctx.fillRect(0, 760, W, H - 760);
  for (const [x, y, w] of [[260, 960, 240], [900, 1010, 300], [1500, 940, 200]]) { ctx.fillStyle = 'rgba(140,150,160,0.25)'; ctx.beginPath(); ctx.ellipse(x, y, w, 18, 0, 0, 7); ctx.fill(); }
  texture(ctx, 0, 760, W, H - 760, '#1a1c1e', 600, 14, 1024, 0.25);
}
// Stan's van: THE PLAICE TO BE, parked in the yard with the goose in the cab.
function paintStanVan(ctx) {
  ctx.fillStyle = '#1e3a6a'; rrect(ctx, 300, 560, 470, 300, 12); ctx.fill();
  ctx.fillStyle = '#244478'; poly(ctx, [120, 860, 120, 700, 170, 640, 310, 640, 310, 860], '#244478');
  ctx.fillStyle = '#0e1822'; poly(ctx, [140, 740, 176, 664, 290, 664, 290, 740], '#0e1822');
  ctx.fillStyle = '#d9b35c'; ctx.font = `italic 700 44px ${FONT_DISPLAY}`; ctx.textAlign = 'center'; ctx.fillText('The Plaice to Be', 535, 660);
  ctx.fillStyle = '#f4f0e8'; ctx.font = `600 22px ${FONT_UI}`; ctx.fillText('FRESH FISH DAILY · LAMBETH', 535, 700);
  ellipse(ctx, 535, 770, 44, 22, '#e8e4dc'); ellipse(ctx, 575, 770, 12, 18, '#e8e4dc'); ellipse(ctx, 518, 766, 4, 4, '#1a1a1a'); // a painted fish
  ctx.fillStyle = '#16305a'; ctx.fillRect(760, 580, 10, 270); ctx.fillStyle = '#c8ccd0'; ctx.fillRect(740, 700, 16, 30);
  for (const x of [220, 660]) { ellipse(ctx, x, 862, 48, 48, '#141414'); ellipse(ctx, x, 862, 20, 20, '#8a8e94'); }
  ctx.fillStyle = '#e8e4c0'; ctx.fillRect(110, 780, 20, 30);
}
// The goose's head out of the van's window, taking an interest.
function drawGooseInVan(ctx, t) {
  const x = 200 + Math.sin(t * 0.7) * 6, y = 700;
  ctx.strokeStyle = '#f0ece4'; ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + 20, y + 40); ctx.quadraticCurveTo(x, y + 10, x - 10 + Math.sin(t * 2) * 4, y - 20); ctx.stroke();
  ellipse(ctx, x - 12 + Math.sin(t * 2) * 4, y - 26, 14, 11, '#f0ece4');
  poly(ctx, [x - 22 + Math.sin(t * 2) * 4, y - 28, x - 46 + Math.sin(t * 2) * 4, y - 22, x - 22 + Math.sin(t * 2) * 4, y - 18], '#e8902a');
  ellipse(ctx, x - 16 + Math.sin(t * 2) * 4, y - 30, 2.2, 2.2, '#111');
}

// ===========================================================================
// THE OUTER OFFICE — Miss Penrose, fourth floor
// ===========================================================================
function paintOuter(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 560, [[0, '#7a8a6e'], [1, '#98a888']]); ctx.fillRect(0, 0, W, 560);
  ctx.fillStyle = '#4a3020'; ctx.fillRect(0, 560, W, 280); for (let x = 0; x < W; x += 160) { ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x, 570, 4, 270); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3; ctx.strokeRect(x + 20, 590, 120, 220); }
  ctx.fillStyle = '#3a2418'; ctx.fillRect(0, 552, W, 12);
  for (const x of [400, 1100]) { ctx.fillStyle = '#f4f6f0'; ctx.fillRect(x, 24, 300, 12); glow(ctx, x + 150, 40, 260, 'rgba(240,250,230,0.25)'); }
  // the lift
  ctx.fillStyle = '#5a5e64'; ctx.fillRect(50, 330, 220, 510); ctx.fillStyle = linGrad(ctx, 64, 0, 256, 0, [[0, '#8a8e94'], [0.5, '#c8ccd2'], [1, '#8a8e94']]); ctx.fillRect(64, 350, 192, 490);
  ctx.fillStyle = '#3a3e44'; ctx.fillRect(158, 350, 4, 490);
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(110, 290, 100, 30); ctx.fillStyle = '#ffb040'; ctx.font = `700 24px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('4', 160, 314);
  // the notice board
  ctx.fillStyle = '#a07a4a'; ctx.fillRect(320, 250, 240, 190); ctx.fillStyle = '#b89060'; ctx.fillRect(330, 260, 220, 170);
  for (const [x, y, w, h, c, rot] of [[340, 272, 90, 70, '#f4f0e0', -0.05], [440, 280, 96, 60, '#f4e8a0', 0.06], [350, 350, 110, 64, '#f4f0e0', 0.03], [470, 350, 70, 70, '#e8c8c8', -0.08]]) { ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot); ctx.fillStyle = c; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.fillStyle = '#c81a1a'; ellipse(ctx, 0, -h / 2 + 6, 4, 4, '#c81a1a'); ctx.fillStyle = '#3a3a3a'; for (let k = 0; k < 4; k++) ctx.fillRect(-w / 2 + 8, -h / 2 + 18 + k * 10, w - 16 - (k % 2) * 14, 3); ctx.restore(); }
  ctx.fillStyle = '#1a1a1a'; ctx.font = `700 15px ${FONT_UI}`; ctx.fillText('WALLS HAVE EARS', 395, 380);
  // the fire alarm
  ctx.fillStyle = '#c81a1a'; ctx.fillRect(600, 440, 60, 70); ctx.fillStyle = '#f0e8e0'; ctx.fillRect(610, 452, 40, 34); ctx.fillStyle = '#fff'; ctx.font = `700 11px ${FONT_UI}`; ctx.fillText('FIRE', 630, 502);
  // a clock: ten to eight
  ellipse(ctx, 850, 200, 50, 50, '#2a2a2a'); ellipse(ctx, 850, 200, 44, 44, '#f4f0e8');
  ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(850, 200); ctx.lineTo(850 + Math.cos(-Math.PI / 2 + 7.83 / 12 * Math.PI * 2) * 24, 200 + Math.sin(-Math.PI / 2 + 7.83 / 12 * Math.PI * 2) * 24); ctx.moveTo(850, 200); ctx.lineTo(850 + Math.cos(-Math.PI / 2 + 50 / 60 * Math.PI * 2) * 36, 200 + Math.sin(-Math.PI / 2 + 50 / 60 * Math.PI * 2) * 36); ctx.stroke();
  // filing cabinets
  for (let k = 0; k < 2; k++) { const x = 1080 + k * 120; ctx.fillStyle = '#7a7e76'; ctx.fillRect(x, 470, 112, 370); for (let d = 0; d < 4; d++) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 4, 480 + d * 90, 104, 3); ctx.fillStyle = '#c8ccd0'; ctx.fillRect(x + 40, 510 + d * 90, 32, 8); ctx.fillStyle = '#f4f0e0'; ctx.fillRect(x + 44, 494 + d * 90, 24, 12); } }
  // Control's door, with its brass plate and ENGAGED light
  paintDoor(ctx, 1460, 330, 180, 510, '#5a2a18', '#2a1208', '#c9a13b', false);
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(1500, 420, 100, 30); ctx.fillStyle = '#2a1a0a'; ctx.font = `700 18px ${FONT_UI}`; ctx.fillText('CONTROL', 1550, 442);
  ctx.fillStyle = '#2a2a2a'; ctx.fillRect(1520, 280, 60, 26);
  // the air vent, low on the wall
  ctx.fillStyle = '#b8bcb0'; ctx.fillRect(1700, 690, 170, 100); ctx.fillStyle = '#4a4e48';
  for (let k = 0; k < 7; k++) ctx.fillRect(1712, 700 + k * 12, 146, 6);
  // lino floor
  ctx.fillStyle = linGrad(ctx, 0, 840, 0, H, [[0, '#6a5a40'], [1, '#3a3020']]); ctx.fillRect(0, 840, W, H - 840);
  for (let y = 850; y < H; y += 60) for (let x = (y / 60 % 2) * 30; x < W; x += 60) { ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(x, y, 30, 30); }
}
// The ENGAGED light over Control's door: red while he's in.
function drawEngagedLight(ctx, on) {
  ctx.fillStyle = on ? '#ff3a2a' : '#4a1a14'; ctx.fillRect(1526, 284, 48, 18);
  ctx.fillStyle = on ? '#fff' : '#8a6a60'; ctx.font = `700 13px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('ENGAGED', 1550, 298);
  if (on) glow(ctx, 1550, 293, 60, 'rgba(255,60,40,0.35)');
}
// Miss Penrose's desk: typewriter, telephone, a carnation, and a tin of biscuits.
function paintPenroseDesk(ctx) {
  ctx.fillStyle = '#5a3a20'; ctx.fillRect(620, 690, 440, 22); ctx.fillStyle = '#4a2e18'; ctx.fillRect(640, 712, 400, 138);
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(660, 730, 170, 100); ctx.fillRect(850, 730, 170, 100);
  ctx.fillStyle = '#1a1a1a'; rrect(ctx, 650, 660, 70, 30, 6); ctx.fill(); ctx.fillRect(660, 648, 50, 14);
  ctx.fillStyle = '#2a4a8a'; ellipse(ctx, 764, 684, 26, 8, '#2a4a8a'); ctx.fillRect(738, 664, 52, 20); ellipse(ctx, 764, 664, 26, 8, '#3a5a9a');
  ctx.fillStyle = '#3a4a3a'; rrect(ctx, 800, 632, 150, 60, 8); ctx.fill(); ctx.fillStyle = '#1a1a1a'; ctx.fillRect(820, 620, 110, 16); ctx.fillStyle = '#f4f0e8'; ctx.fillRect(835, 580, 80, 44);
  ctx.fillStyle = '#d8d0e8'; ctx.fillRect(1024, 640, 20, 50); ctx.strokeStyle = '#3a6a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(1034, 640); ctx.lineTo(1036, 600); ctx.stroke(); ellipse(ctx, 1036, 596, 10, 8, '#e84a6a');
}

// ===========================================================================
// CONTROL'S OFFICE
// ===========================================================================
function paintControlOffice(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 840, [[0, '#3a2414'], [1, '#5a3a22']]); ctx.fillRect(0, 0, W, 840);
  for (let x = 0; x < W; x += 180) { ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 4; ctx.strokeRect(x + 16, 100, 148, 360); ctx.strokeRect(x + 16, 500, 148, 320); }
  ctx.fillStyle = '#2a180c'; ctx.fillRect(0, 470, W, 16); ctx.fillRect(0, 0, W, 60);
  // the tall window: rain, the river, and the clock tower across the water
  ctx.fillStyle = '#2a180c'; ctx.fillRect(760, 110, 440, 520);
  ctx.save(); ctx.beginPath(); ctx.rect(780, 130, 400, 480); ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, 130, 0, 610, [[0, '#4a525c'], [1, '#8a9098']]); ctx.fillRect(780, 130, 400, 480);
  paintWestminster(ctx, 820, 520, 0.72, '#5a626a', false);
  ctx.fillStyle = '#4a5450'; ctx.fillRect(780, 520, 400, 90);
  ctx.restore();
  paintWetGlass(ctx, 780, 130, 400, 480, 1041, null);
  ctx.fillStyle = '#2a180c'; ctx.fillRect(976, 130, 8, 480); ctx.fillRect(780, 360, 400, 8);
  // a portrait of the first Control, 1909, who also looked disappointed
  paintFrame(ctx, 330, 150, 200, 260, c => { c.fillStyle = '#2a2a24'; c.fillRect(330, 150, 200, 260); ellipse(c, 430, 250, 44, 56, '#c8a888'); c.fillStyle = '#1a1a1a'; c.fillRect(370, 320, 120, 90); ellipse(c, 430, 276, 26, 8, '#6a6a6a'); });
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(380, 430, 100, 18);
  // a map of Karvonia on the wall, with pins in it
  ctx.fillStyle = '#e8dcb8'; ctx.fillRect(1320, 170, 240, 180); ctx.strokeStyle = '#6a5a3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(1340, 300); ctx.bezierCurveTo(1380, 200, 1460, 320, 1540, 200); ctx.stroke();
  for (const [x, y] of [[1380, 240], [1450, 280], [1500, 220], [1420, 200]]) ellipse(ctx, x, y, 5, 5, '#c81a1a');
  ctx.fillStyle = '#3a2a1a'; ctx.font = `700 16px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('KARVONIA', 1440, 336);
  // the door out to Miss Penrose
  paintDoor(ctx, 70, 330, 170, 510, '#5a2a18', '#2a1208', '#c9a13b', false);
  // Control's high-backed chair behind the desk
  ctx.fillStyle = '#3a1a14'; rrect(ctx, 1260, 520, 170, 200, 20); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.06)'; for (let k = 0; k < 4; k++) ellipse(ctx, 1290 + k * 36, 560, 6, 6, '#c9a13b');
  // the coat stand
  ctx.fillStyle = '#2a180c'; ctx.fillRect(1814, 360, 12, 480); ctx.fillRect(1780, 830, 80, 10); ctx.fillRect(1790, 372, 60, 6);
  ctx.fillStyle = '#141414'; ctx.beginPath(); ctx.ellipse(1822, 356, 40, 8, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(1822, 340, 26, 22, 0, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = '#141414'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(1790, 820); ctx.lineTo(1800, 520); ctx.stroke(); ctx.beginPath(); ctx.arc(1810, 520, 10, Math.PI, 0); ctx.stroke();
  // Turkey carpet on the boards
  ctx.fillStyle = linGrad(ctx, 0, 840, 0, H, [[0, '#4a2e18'], [1, '#2a180c']]); ctx.fillRect(0, 840, W, H - 840);
  ctx.fillStyle = '#6a1a1a'; poly(ctx, [300, 880, 1620, 880, 1760, 1060, 160, 1060], '#6a1a1a');
  ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(320, 892); ctx.lineTo(1600, 892); ctx.lineTo(1730, 1048); ctx.lineTo(190, 1048); ctx.closePath(); ctx.stroke();
  texture(ctx, 180, 880, 1560, 180, '#2a0a0a', 500, 10, 1042, 0.3);
}
// The desk, in front of Control's chair: teapot and cosy, lamp, telephone, the drawer.
function paintControlDesk(ctx) {
  ctx.fillStyle = '#4a2410'; ctx.fillRect(1060, 680, 540, 26); ctx.fillStyle = '#2a4a2a'; ctx.fillRect(1080, 682, 500, 10);
  ctx.fillStyle = linGrad(ctx, 1070, 0, 1590, 0, [[0, '#3a1a0a'], [0.5, '#5a2a14'], [1, '#3a1a0a']]); ctx.fillRect(1070, 706, 520, 144);
  for (const x of [1090, 1450]) { ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3; ctx.strokeRect(x, 720, 120, 110); }
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.strokeRect(1260, 720, 150, 50); ctx.fillStyle = '#c9a13b'; ctx.fillRect(1325, 738, 20, 8); ellipse(ctx, 1335, 756, 4, 5, '#1a1a1a');
  // the teapot in its knitted cosy, red, white and blue
  const tx = 1160, ty = 680;
  ctx.fillStyle = '#e8e4dc'; ctx.beginPath(); ctx.ellipse(tx, ty - 34, 44, 38, 0, Math.PI, 0); ctx.fill();
  for (let k = 0; k < 6; k++) { ctx.fillStyle = ['#b01a2a', '#f4f0e8', '#1a2a6a'][k % 3]; ctx.fillRect(tx - 44 + 2, ty - 38 + k * 6.5 - 20, 86, 6.5); }
  ctx.fillStyle = '#b01a2a'; ellipse(ctx, tx, ty - 76, 10, 8, '#b01a2a');
  ctx.fillStyle = '#e8e4dc'; poly(ctx, [tx + 42, ty - 20, tx + 70, ty - 44, tx + 74, ty - 40, tx + 44, ty - 8], '#e8e4dc');
  ctx.fillStyle = '#f4f0e8'; ctx.fillRect(tx + 60, ty - 12, 34, 12); ctx.fillRect(tx + 64, ty - 22, 26, 12);
  // the green lamp, the red telephone, the in-tray
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(1530, 620, 6, 60); ctx.fillStyle = '#1e5a3a'; poly(ctx, [1490, 628, 1576, 628, 1560, 604, 1506, 604], '#1e5a3a'); glow(ctx, 1532, 660, 140, 'rgba(255,230,160,0.35)');
  ctx.fillStyle = '#b01a1a'; rrect(ctx, 1390, 650, 80, 34, 8); ctx.fill(); ctx.fillRect(1398, 638, 64, 14);
  ctx.fillStyle = '#6a4a2a'; ctx.fillRect(1250, 664, 110, 18); ctx.fillStyle = '#f4f0e0'; ctx.fillRect(1256, 654, 98, 12);
}
// The wastepaper basket, and the tie on the coat stand while it's there.
function paintBasket(ctx) {
  ctx.fillStyle = '#8a6a3a'; poly(ctx, [1640, 760, 1740, 760, 1728, 850, 1652, 850], '#8a6a3a');
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(1646 + k * 18, 760); ctx.lineTo(1654 + k * 15, 850); ctx.stroke(); }
  for (const [x, y] of [[1668, 756], [1700, 750], [1720, 758]]) ellipse(ctx, x, y, 14, 11, '#f0ece0');
}
function paintTieOnStand(ctx) {
  ctx.save(); ctx.translate(1846, 380); ctx.rotate(0.05);
  for (let k = 0; k < 10; k++) { ctx.fillStyle = k % 2 ? '#9e1f28' : '#1a2a5a'; ctx.fillRect(-7, k * 18, 14, 18); }
  poly(ctx, [-7, 180, 7, 180, 0, 196], '#1a2a5a');
  ctx.restore();
}

// ===========================================================================
// THE WELLINGTON — the Palm Court, Piccadilly
// ===========================================================================
function paintTearoom(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 840, [[0, '#e8dcc0'], [1, '#d8c8a4']]); ctx.fillRect(0, 0, W, 840);
  // a glass roof, grey with rain
  ctx.fillStyle = '#6a7078'; ctx.fillRect(0, 0, W, 90); for (let x = 0; x < W; x += 80) { ctx.fillStyle = '#c9a13b'; ctx.fillRect(x, 0, 4, 90); }
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(0, 88, W, 10);
  // arches with mirrors, and gilded pilasters
  for (let k = 0; k < 5; k++) {
    const x = 330 + k * 330;
    ctx.fillStyle = '#b89a6a'; ctx.beginPath(); ctx.moveTo(x, 700); ctx.lineTo(x, 300); ctx.arc(x + 110, 300, 110, Math.PI, 0); ctx.lineTo(x + 220, 700); ctx.fill();
    ctx.fillStyle = linGrad(ctx, x, 200, x + 200, 700, [[0, '#a8b0b4'], [0.5, '#e0e4e4'], [1, '#98a0a4']]); ctx.beginPath(); ctx.moveTo(x + 14, 700); ctx.lineTo(x + 14, 300); ctx.arc(x + 110, 300, 96, Math.PI, 0); ctx.lineTo(x + 206, 700); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x + 40, 240, 12, 440);
    ctx.fillStyle = '#c9a13b'; ctx.fillRect(x - 60, 120, 36, 720); ctx.fillRect(x - 70, 120, 56, 20);
  }
  // the entrance: an archway with a revolving door
  ctx.fillStyle = '#5a3a1a'; ctx.fillRect(30, 260, 240, 580); ctx.fillStyle = '#2a1a0a'; ctx.fillRect(50, 290, 200, 550);
  ctx.fillStyle = 'rgba(200,210,220,0.3)'; ctx.fillRect(60, 300, 180, 540); ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(150, 300); ctx.lineTo(150, 840); ctx.moveTo(70, 560); ctx.lineTo(230, 580); ctx.stroke();
  ctx.fillStyle = '#c9a13b'; ctx.font = `italic 700 34px ${FONT_DISPLAY}`; ctx.textAlign = 'center'; ctx.fillText('The Wellington', 150, 246);
  // a string trio on the dais, sawing away at Elgar
  ctx.fillStyle = '#7a5a3a'; ctx.fillRect(700, 640, 360, 30);
  for (const [x, cello] of [[760, false], [880, true], [1000, false]]) {
    ellipse(ctx, x, 520, 18, 22, '#e0c0a0'); ctx.fillStyle = '#141414'; ctx.fillRect(x - 26, 540, 52, 100);
    if (cello) { ellipse(ctx, x + 30, 600, 24, 40, '#8a4a1a'); ctx.fillStyle = '#3a1a0a'; ctx.fillRect(x + 28, 520, 4, 60); }
    else { ellipse(ctx, x + 16, 540, 18, 9, '#8a4a1a', -0.5); }
    ctx.strokeStyle = '#d8d0c0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 10, 560); ctx.lineTo(x + 60, 540); ctx.stroke();
  }
  // palms in brass pots
  for (const x of [560, 1240, 1880]) {
    ctx.fillStyle = '#c9a13b'; poly(ctx, [x - 40, 840, x + 40, 840, x + 50, 760, x - 50, 760], '#b8903a');
    for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (k - 4) * 0.34; ctx.strokeStyle = '#3a5a2a'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x, 760); ctx.quadraticCurveTo(x + Math.cos(a) * 90, 760 + Math.sin(a) * 200, x + Math.cos(a) * 180, 760 + Math.sin(a) * 150 + 60); ctx.stroke(); }
  }
  // tables behind, with their cake stands
  for (const x of [470, 1680]) { ctx.fillStyle = '#f4f0e8'; ctx.beginPath(); ctx.ellipse(x, 760, 110, 26, 0, 0, 7); ctx.fill(); ctx.fillRect(x - 110, 760, 220, 70); ctx.fillStyle = '#c8ccd0'; ctx.fillRect(x - 3, 690, 6, 70); for (const [y, r] of [[700, 30], [724, 40], [750, 50]]) { ctx.beginPath(); ctx.ellipse(x, y, r, 6, 0, 0, 7); ctx.fill(); } }
  // marble floor
  for (let y = 840; y < H; y += 60) for (let x = 0; x < W; x += 60) { ctx.fillStyle = ((x + y) / 60) % 2 ? '#e8dcc8' : '#b88a7a'; ctx.fillRect(x, y, 60, 60); }
  // gilt chairs for Madame Novak, the Minister and the man with the paper
  for (const [cx, dir] of [[1030, -1], [1632, 1], [1852, 1]]) {
    ctx.fillStyle = '#c9a13b'; ctx.fillRect(cx + dir * 10 - 4, 640, 8, 220); ctx.fillRect(cx - dir * 50 - 3, 790, 6, 70);
    ctx.fillStyle = '#8a1a2a'; rrect(ctx, cx + dir * 10 - (dir > 0 ? 6 : 12), 650, 18, 120, 6); ctx.fill();
    ctx.fillStyle = '#8a1a2a'; ctx.fillRect(Math.min(cx + dir * 10, cx - dir * 55), 770, 66, 18); ctx.fillStyle = '#c9a13b'; ctx.fillRect(Math.min(cx + dir * 10, cx - dir * 55), 786, 66, 5);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(0, 840, W, 24);
}
// Madame Novak's table: white cloth, a tiered cake stand, the silver teapot.
function paintNovakTable(ctx) {
  const x = 1330;
  ctx.fillStyle = '#f4f0e8'; ctx.beginPath(); ctx.ellipse(x, 740, 230, 36, 0, 0, 7); ctx.fill(); ctx.fillRect(x - 230, 740, 460, 110);
  ctx.fillStyle = 'rgba(0,0,0,0.06)'; for (let k = 0; k < 8; k++) ctx.fillRect(x - 220 + k * 58, 760, 4, 90);
  ctx.fillStyle = '#c8ccd0'; ctx.fillRect(x - 3, 640, 6, 100);
  for (const [y, r, c] of [[650, 34, '#e8a0a8'], [680, 46, '#f0d8a0'], [712, 58, '#e8e4dc']]) { ctx.fillStyle = '#e8ecf0'; ctx.beginPath(); ctx.ellipse(x, y, r, 7, 0, 0, 7); ctx.fill(); for (let k = 0; k < 4; k++) ellipse(ctx, x - r + 14 + k * (r / 2), y - 6, 9, 6, c); }
  ctx.fillStyle = '#c8ccd0'; ctx.beginPath(); ctx.ellipse(x + 130, 716, 30, 24, 0, 0, 7); ctx.fill(); poly(ctx, [x + 156, 712, x + 184, 694, x + 186, 700, x + 158, 722], '#c8ccd0'); ellipse(ctx, x + 130, 690, 8, 6, '#c8ccd0');
  for (const cx of [x - 140, x + 40]) { ctx.fillStyle = '#f4f0e8'; ctx.beginPath(); ctx.ellipse(cx, 738, 22, 6, 0, 0, 7); ctx.fill(); ctx.fillRect(cx - 12, 722, 24, 16); ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 2; ctx.strokeRect(cx - 12, 722, 24, 16); }
}
// Mr Fothergill's lectern and the velvet rope.
function paintLectern(ctx) {
  ctx.fillStyle = '#4a2a14'; poly(ctx, [330, 850, 410, 850, 400, 700, 340, 700], '#4a2a14'); ctx.fillStyle = '#5a3a1a'; poly(ctx, [320, 704, 420, 704, 430, 680, 310, 680], '#5a3a1a');
  ctx.fillStyle = '#f4f0e0'; poly(ctx, [330, 684, 410, 684, 416, 674, 324, 674], '#f4f0e0');
}
function paintRope(ctx) {
  for (const x of [450, 610]) { ctx.fillStyle = '#c9a13b'; ctx.fillRect(x - 5, 740, 10, 110); ellipse(ctx, x, 738, 10, 10, '#d9b35c'); ctx.fillRect(x - 16, 846, 32, 8); }
  ctx.strokeStyle = '#8a1a2a'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(450, 748); ctx.quadraticCurveTo(530, 800, 610, 748); ctx.stroke();
}

// ===========================================================================
// TITLE — the river at night in the rain, Westminster, a red telephone box
// ===========================================================================
function paintTitle10(x) {
  x.fillStyle = linGrad(x, 0, 0, 0, 700, [[0, '#05080e'], [1, '#1a2230']]); x.fillRect(0, 0, W, 700);
  paintWestminster(x, 1080, 640, 1.25, '#0a0e14', true);
  x.fillStyle = linGrad(x, 0, 640, 0, 820, [[0, '#101820'], [1, '#05080c']]); x.fillRect(0, 640, W, 180);
  for (let i = 0; i < 60; i++) { const px = 1100 + Math.random() * 700, py = 650 + Math.random() * 150; x.fillStyle = `rgba(255,220,150,${0.08 + Math.random() * 0.2})`; x.fillRect(px, py, 20 + Math.random() * 40, 2); }
  x.fillStyle = '#1a1c20'; x.fillRect(0, 800, W, 30);
  for (const px of [260, 940, 1620]) { paintLampPost(x, px, 830, 560, '#05080c'); glow(x, px, 580, 150, 'rgba(255,210,140,0.35)'); }
  // the telephone box, lit
  x.fillStyle = '#b01a1a'; x.fillRect(1320, 540, 150, 300); x.fillStyle = '#8a1010'; x.fillRect(1310, 520, 170, 30); x.beginPath(); x.ellipse(1395, 522, 85, 20, 0, Math.PI, 0); x.fill();
  x.fillStyle = '#ffe8b0'; for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) x.fillRect(1334 + c * 42, 580 + r * 50, 36, 42);
  glow(x, 1395, 680, 200, 'rgba(255,220,150,0.3)');
  x.fillStyle = '#f4f0e8'; x.fillRect(1340, 552, 110, 18); x.fillStyle = '#1a1a1a'; x.font = `700 14px ${FONT_UI}`; x.textAlign = 'center'; x.fillText('TELEPHONE', 1395, 566);
  x.fillStyle = linGrad(x, 0, 830, 0, H, [[0, '#1a1c20'], [1, '#0a0c10']]); x.fillRect(0, 830, W, H - 830);
  x.fillStyle = linGrad(x, 0, 840, 0, 1060, [[0, 'rgba(255,60,50,0.16)'], [1, 'rgba(255,60,50,0)']]); x.fillRect(1320, 840, 150, 220);
  x.fillStyle = linGrad(x, 1100, 0, 0, 0, [[0, 'rgba(2,4,10,0)'], [1, 'rgba(2,4,10,0.8)']]); x.fillRect(0, 0, 1100, H);
}
