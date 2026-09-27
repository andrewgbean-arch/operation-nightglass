// ---------------------------------------------------------------------------
// Chapter Seven paint — East Berlin in December 1987: a tenement courtyard in
// the snow with a Trabant that won't start, a punk club in a cellar, the Stasi
// archive at night, and West Berlin at dawn on the far side of the Wall.
// ---------------------------------------------------------------------------

// A Berlin tenement wall: grey plaster falling off to show the brick, rows of windows.
function paintTenement(ctx, x, top, w, bottom, col, seed, lit = 0.3) {
  const r = rng(seed);
  ctx.fillStyle = col; ctx.fillRect(x, top, w, bottom - top);
  texture(ctx, x, top, w, bottom - top, shadeColor(col, -0.25), Math.floor(w * (bottom - top) / 350), 30, seed, 0.2);
  // bare brick where the plaster has come away
  for (let k = 0; k < 6; k++) {
    const bx = x + r() * (w - 160), by = top + r() * (bottom - top - 120), bw = 60 + r() * 120, bh = 40 + r() * 70;
    ctx.fillStyle = '#6a3a2a'; ctx.beginPath(); ctx.ellipse(bx + bw / 2, by + bh / 2, bw / 2, bh / 2, r(), 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(30,14,8,0.5)'; ctx.lineWidth = 1.5;
    for (let yy = by + 8; yy < by + bh - 4; yy += 10) { ctx.beginPath(); ctx.moveTo(bx + 10, yy); ctx.lineTo(bx + bw - 10, yy); ctx.stroke(); }
  }
  // windows, a few lit, some with a candle or a plant on the sill
  const cols = Math.floor(w / 150);
  for (let row = 0; row * 150 + top + 50 < bottom - 180; row++) for (let c = 0; c < cols; c++) {
    const wx = x + 40 + c * (w - 80) / cols, wy = top + 50 + row * 150, ww = 70, wh = 100;
    ctx.fillStyle = shadeColor(col, 0.15); ctx.fillRect(wx - 8, wy - 8, ww + 16, wh + 16);
    ctx.fillStyle = r() < lit ? `rgba(255,${200 + Math.floor(r() * 30)},130,0.9)` : '#1c2028';
    ctx.fillRect(wx, wy, ww, wh);
    ctx.fillStyle = shadeColor(col, -0.35); ctx.fillRect(wx + ww / 2 - 2, wy, 4, wh); ctx.fillRect(wx, wy + wh * 0.4, ww, 4);
    ctx.fillStyle = '#e8ecf0'; ctx.fillRect(wx - 10, wy + wh + 6, ww + 20, 6); // snow on the sill
  }
}

// A Trabant 601 side-on: a little two-stroke box, duroplast body, white roof.
function paintTrabant(ctx, x, y, s, { bonnetUp = false, col = '#8ab0c8', smoke = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 4, 190, 16, 0, 0, 7); ctx.fill();
  // body
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(-180, -20); ctx.lineTo(-178, -62); ctx.lineTo(-120, -70); ctx.lineTo(-80, -130); ctx.lineTo(70, -132); ctx.lineTo(110, -74); ctx.lineTo(176, -66); ctx.lineTo(182, -24); ctx.quadraticCurveTo(182, -10, 170, -10); ctx.lineTo(-170, -10); ctx.quadraticCurveTo(-182, -10, -180, -20); ctx.fill();
  ctx.fillStyle = '#f0ece4'; ctx.beginPath(); ctx.moveTo(-84, -126); ctx.lineTo(68, -128); ctx.lineTo(72, -136); ctx.lineTo(-80, -134); ctx.fill(); // white roof
  // windows
  ctx.fillStyle = '#2a3440';
  poly(ctx, [-70, -122, -14, -122, -14, -76, -104, -74], '#2a3440');
  poly(ctx, [-4, -122, 62, -122, 96, -76, -4, -76], '#2a3440');
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; poly(ctx, [-60, -118, -40, -118, -70, -80, -90, -80], 'rgba(255,255,255,0.12)');
  // doors, trim and handle
  ctx.strokeStyle = shadeColor(col, -0.3); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-10, -76); ctx.lineTo(-12, -14); ctx.moveTo(-110, -70); ctx.lineTo(-112, -14); ctx.stroke();
  ctx.fillStyle = '#c8ccd0'; ctx.fillRect(-176, -36, 356, 5); ctx.fillRect(-30, -64, 14, 4);
  // wheels
  for (const wx of [-118, 118]) { ellipse(ctx, wx, -12, 30, 30, '#141414'); ellipse(ctx, wx, -12, 14, 14, '#c8ccd0'); ellipse(ctx, wx, -12, 5, 5, '#6a6e72'); }
  // headlight and bumper
  ellipse(ctx, 174, -50, 8, 10, '#f0ece4'); ctx.fillStyle = '#c8ccd0'; ctx.fillRect(170, -28, 16, 8); ctx.fillRect(-186, -28, 14, 8);
  if (bonnetUp) {
    ctx.fillStyle = shadeColor(col, -0.08); poly(ctx, [110, -74, 176, -66, 150, -180, 112, -190], shadeColor(col, -0.08));
    ctx.fillStyle = '#1a1a1a'; poly(ctx, [112, -72, 176, -64, 176, -40, 110, -40], '#1a1a1a');
  }
  // two-stroke smoke from the exhaust
  if (smoke) for (let k = 0; k < 6; k++) { ctx.globalAlpha = 0.25 * smoke * (1 - k / 6); ellipse(ctx, -200 - k * 30, -18 - k * 10, 20 + k * 8, 14 + k * 6, '#b8bcc4'); }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ===========================================================================
// THE COURTYARD — Prenzlauer Berg, dusk, snow
// ===========================================================================
function paintHof(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 200, [[0, '#3a4252'], [1, '#6a7080']]); ctx.fillRect(0, 0, W, 200);
  paintTenement(ctx, -20, 60, 820, 840, '#8a8478', 201, 0.35);
  paintTenement(ctx, 800, 20, 1140, 840, '#7a766c', 202, 0.3);
  // the archway through to the street, with a lamp and falling snow beyond
  ctx.fillStyle = '#16181c'; ctx.beginPath(); ctx.moveTo(1620, 840); ctx.lineTo(1620, 520); ctx.quadraticCurveTo(1740, 420, 1860, 520); ctx.lineTo(1860, 840); ctx.fill();
  ctx.fillStyle = linGrad(ctx, 0, 560, 0, 840, [[0, '#2a3040'], [1, '#4a5060']]); ctx.fillRect(1700, 600, 100, 240);
  glow(ctx, 1750, 640, 90, 'rgba(255,220,150,0.5)');
  // the cellar steps down to the club, and its graffiti
  ctx.fillStyle = '#2a2622'; ctx.fillRect(740, 700, 200, 140); ctx.fillStyle = '#141210'; ctx.fillRect(770, 720, 140, 120);
  for (let k = 0; k < 4; k++) { ctx.fillStyle = `rgba(90,86,80,${0.9 - k * 0.2})`; ctx.fillRect(770, 800 - k * 22, 140, 6); }
  ctx.fillStyle = '#e8408a'; ctx.font = `700 30px ${FONT_DISPLAY}`; ctx.textAlign = 'center'; ctx.save(); ctx.translate(840, 680); ctx.rotate(-0.06); ctx.fillText('KELLER', 0, 0); ctx.restore();
  ctx.strokeStyle = '#e8408a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(660, 740, 30, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(640, 770); ctx.lineTo(660, 705); ctx.lineTo(680, 770); ctx.moveTo(645, 748); ctx.lineTo(676, 748); ctx.stroke(); // an anarchy A
  // the stairwell door
  paintDoor(ctx, 120, 560, 140, 280, '#4a3a2a', '#2a2018', '#8a8a8a', false);
  // a washing line with frozen laundry
  ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(300, 420); ctx.quadraticCurveTo(700, 470, 1100, 410); ctx.stroke();
  for (const [lx, c] of [[380, '#e8e4dc'], [470, '#6a8ab0'], [560, '#e8e4dc'], [880, '#b04a4a'], [980, '#e8e4dc']]) { const ly = 430 + Math.sin((lx - 300) / 800 * Math.PI) * 36; ctx.fillStyle = c; ctx.fillRect(lx, ly, 60, 70); ctx.fillStyle = '#f4f6f8'; ctx.fillRect(lx, ly, 60, 6); }
  // coal briquettes piled by the wall
  const r = rng(203);
  for (let k = 0; k < 80; k++) { const bx = 300 + r() * 260, by = 800 + r() * 40 - (k / 80) * 60; ctx.fillStyle = r() < 0.5 ? '#1a1816' : '#2a2622'; rrect(ctx, bx, by, 26, 14, 3); ctx.fill(); }
  // snow on the ground, trodden into paths
  ctx.fillStyle = linGrad(ctx, 0, 840, 0, H, [[0, '#dce2ea'], [1, '#a8b0bc']]); ctx.fillRect(0, 840, W, H - 840);
  ctx.fillStyle = 'rgba(80,90,110,0.18)'; ctx.beginPath(); ctx.ellipse(900, 950, 700, 50, 0, 0, 7); ctx.fill();
  texture(ctx, 0, 840, W, H - 840, '#8a94a4', 900, 20, 204, 0.18);
}

// ===========================================================================
// THE CLUB — a punk cellar, "Zum Letzten Groschen"
// ===========================================================================
function paintClub(ctx) {
  ctx.fillStyle = '#1a1210'; ctx.fillRect(0, 0, W, 860);
  // brick vaults
  for (let y = 0; y < 860; y += 26) for (let x = (y / 26) % 2 * 36; x < W; x += 72) { ctx.fillStyle = `rgba(${90 + (x * 7 + y) % 30},${40 + (x + y) % 16},30,0.5)`; ctx.fillRect(x + 2, y + 2, 68, 22); }
  for (const ax of [0, 640, 1280]) { ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.moveTo(ax, 0); ctx.quadraticCurveTo(ax + 320, 260, ax + 640, 0); ctx.lineTo(ax + 640, 0); ctx.fill(); }
  // graffiti
  ctx.save(); ctx.font = `700 64px ${FONT_DISPLAY}`; ctx.textAlign = 'center';
  ctx.fillStyle = '#e8408a'; ctx.translate(840, 300); ctx.rotate(-0.08); ctx.fillText('KEINE ZUKUNFT', 0, 0); ctx.restore();
  ctx.save(); ctx.font = `700 40px ${FONT_UI}`; ctx.fillStyle = '#9ae07a'; ctx.translate(780, 400); ctx.rotate(0.05); ctx.fillText('ZUM LETZTEN GROSCHEN', 0, 0); ctx.restore();
  ctx.strokeStyle = '#f0e4c8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(1000, 540, 50, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(970, 590); ctx.lineTo(1000, 490); ctx.lineTo(1030, 590); ctx.moveTo(975, 560); ctx.lineTo(1025, 560); ctx.stroke();
  // the bar on the left, with a row of bottles and a portrait turned to the wall
  ctx.fillStyle = '#3a2618'; ctx.fillRect(0, 640, 560, 30); ctx.fillStyle = '#2a1a10'; ctx.fillRect(0, 670, 540, 190);
  ctx.fillStyle = '#2a1a10'; ctx.fillRect(40, 440, 420, 12);
  const r = rng(211);
  for (let k = 0; k < 11; k++) { const bx = 60 + k * 36, h = 60 + r() * 30; ctx.fillStyle = pick3(r, ['#3a5a2a', '#6a3a1a', '#2a3a5a', '#c8c8b8']); ctx.fillRect(bx, 440 - h, 18, h); ctx.fillRect(bx + 5, 440 - h - 16, 8, 16); }
  ctx.fillStyle = '#5a4a3a'; ctx.fillRect(160, 230, 120, 150); ctx.fillStyle = '#3a2a1a'; ctx.fillRect(170, 240, 100, 130); // a picture frame, facing the wall
  // the stage: a platform of pallets, amps, a mic stand and an empty drum kit
  ctx.fillStyle = '#2a2018'; ctx.fillRect(1100, 760, 820, 100); ctx.fillStyle = '#3a2c20'; ctx.fillRect(1100, 752, 820, 12);
  for (let k = 0; k < 6; k++) { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(1110 + k * 136, 772, 120, 6); }
  for (const [ax, ah] of [[1150, 220], [1760, 260]]) { ctx.fillStyle = '#141414'; ctx.fillRect(ax, 752 - ah, 130, ah); ctx.fillStyle = '#2a2a2a'; for (let k = 0; k < 2; k++) { ellipse(ctx, ax + 65, 752 - ah + 60 + k * 100, 44, 44, '#202020'); ellipse(ctx, ax + 65, 752 - ah + 60 + k * 100, 16, 16, '#3a3a3a'); } }
  // drums
  ellipse(ctx, 1540, 700, 70, 50, '#8a1a1a'); ellipse(ctx, 1540, 700, 56, 40, '#e8e2d6');
  ellipse(ctx, 1450, 660, 34, 14, '#c8ccd0'); ellipse(ctx, 1630, 650, 34, 14, '#c8ccd0');
  ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1450, 660); ctx.lineTo(1450, 752); ctx.moveTo(1630, 650); ctx.lineTo(1630, 752); ctx.stroke();
  ctx.fillStyle = '#c8ccd0'; rrect(ctx, 1600, 660, 60, 40, 6); ctx.fill();
  // a hand-painted sign: DRUMMER WANTED (OURS IS IN PRISON)
  ctx.fillStyle = '#e8e2d6'; ctx.save(); ctx.translate(1540, 540); ctx.rotate(0.04); ctx.fillRect(-150, -34, 300, 68);
  ctx.fillStyle = '#1a1a1a'; ctx.font = `700 24px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('SCHLAGZEUGER GESUCHT', 0, -6); ctx.font = `600 18px ${FONT_UI}`; ctx.fillText('(unserer sitzt)', 0, 20); ctx.restore();
  // the mic stand
  ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1340, 752); ctx.lineTo(1340, 600); ctx.lineTo(1320, 580); ctx.stroke(); ellipse(ctx, 1316, 576, 8, 10, '#2a2a2a');
  // a bare bulb and coloured lamps
  ctx.strokeStyle = '#141414'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(700, 0); ctx.lineTo(700, 140); ctx.stroke(); ellipse(ctx, 700, 150, 12, 16, '#fff2c8'); glow(ctx, 700, 150, 200, 'rgba(255,230,160,0.35)');
  lightCone(ctx, 1340, 0, 40, 260, 760, 'rgba(232,64,138,0.6)', 0.22);
  lightCone(ctx, 1600, 0, 40, 220, 760, 'rgba(90,160,255,0.6)', 0.18);
  // the floor: concrete, beer, cigarette ends
  ctx.fillStyle = linGrad(ctx, 0, 860, 0, H, [[0, '#3a322c'], [1, '#1a1612']]); ctx.fillRect(0, 860, W, H - 860);
  texture(ctx, 0, 860, W, H - 860, '#0e0a08', 1000, 30, 212, 0.3);
}
// The crowd, pogoing in silhouette in front of the stage.
function drawPogo(ctx, t, wild = 0) {
  const r = rng(213);
  for (let k = 0; k < 5; k++) {
    const x = 640 + k * 100 + r() * 30, ph = r() * 7, jump = Math.max(0, Math.sin(t * (6 + wild * 4) + ph)) * (14 + wild * 24);
    const y = 850 - jump, hair = r() < 0.4;
    ctx.save(); ctx.translate(x, y); ctx.scale(1.5, 1.5); ctx.translate(-x, -y);
    ctx.fillStyle = '#0a0808';
    ctx.fillRect(x - 16, y - 120, 32, 90); ellipse(ctx, x, y - 134, 15, 17, '#0a0808'); ctx.fillRect(x - 12, y - 30, 10, 30); ctx.fillRect(x + 2, y - 30, 10, 30);
    if (hair) { ctx.fillStyle = pick3(r, ['#e8408a', '#9ae07a', '#f0b35b']); for (let s = 0; s < 5; s++) poly(ctx, [x - 10 + s * 5, y - 146, x - 6 + s * 5, y - 146, x - 8 + s * 5, y - 170], ctx.fillStyle); }
    const arm = Math.sin(t * 5 + ph) > 0.3;
    ctx.fillStyle = '#0a0808'; if (arm) ctx.fillRect(x + 14, y - 190, 8, 76);
    ctx.restore();
  }
}

// ===========================================================================
// THE ARCHIVE — Normannenstraße, at night
// ===========================================================================
function paintArchive(ctx) {
  ctx.fillStyle = '#c8c4b0'; ctx.fillRect(0, 0, W, 840);
  ctx.fillStyle = '#b0ac98'; ctx.fillRect(0, 0, W, 120);
  // strip lights
  for (const lx of [300, 900, 1500]) { ctx.fillStyle = '#f4f8f0'; ctx.fillRect(lx - 120, 40, 240, 14); glow(ctx, lx, 60, 220, 'rgba(230,255,230,0.3)'); }
  // the corridor of filing cabinets running back into the dark
  const vx = 1180, vy = 430;
  ctx.fillStyle = linGrad(ctx, vx - 220, 0, vx + 220, 0, [[0, '#8a8a78'], [0.5, '#3a3a30'], [1, '#8a8a78']]);
  ctx.beginPath(); ctx.moveTo(900, 120); ctx.lineTo(vx - 40, vy - 60); ctx.lineTo(vx + 40, vy - 60); ctx.lineTo(1460, 120); ctx.lineTo(1460, 840); ctx.lineTo(vx + 40, vy + 60); ctx.lineTo(vx - 40, vy + 60); ctx.lineTo(900, 840); ctx.fill();
  ctx.fillStyle = '#2a2a24'; ctx.fillRect(vx - 40, vy - 60, 80, 120);
  poly(ctx, [900, 840, vx - 40, vy + 60, vx + 40, vy + 60, 1460, 840], '#7a6a4c');
  poly(ctx, [900, 120, vx - 40, vy - 60, vx + 40, vy - 60, 1460, 120], '#a8a490');
  for (const side of [-1, 1]) for (let k = 0; k < 9; k++) {
    const t0 = k / 9, t1 = (k + 0.85) / 9, x0 = side < 0 ? 900 + (vx - 40 - 900) * t0 : 1460 - (1460 - vx - 40) * t0, x1 = side < 0 ? 900 + (vx - 40 - 900) * t1 : 1460 - (1460 - vx - 40) * t1;
    const top0 = 120 + (vy - 60 - 120) * t0, top1 = 120 + (vy - 60 - 120) * t1, bot0 = 840 - (840 - vy - 60) * t0, bot1 = 840 - (840 - vy - 60) * t1;
    ctx.fillStyle = k % 2 ? '#6a7a6a' : '#5e6e5e'; poly(ctx, [x0, top0 + 20, x1, top1 + 14, x1, bot1, x0, bot0], ctx.fillStyle);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1; for (let d = 1; d < 5; d++) { ctx.beginPath(); ctx.moveTo(x0, top0 + 20 + (bot0 - top0 - 20) * d / 5); ctx.lineTo(x1, top1 + 14 + (bot1 - top1 - 14) * d / 5); ctx.stroke(); }
  }
  // Kessler's desk: a lamp, a radio, a knitting basket, the key board on the wall
  ctx.fillStyle = '#6a5a3a'; ctx.fillRect(160, 700, 460, 24); ctx.fillStyle = '#4a3e28'; ctx.fillRect(180, 724, 20, 116); ctx.fillRect(580, 724, 20, 116); ctx.fillRect(420, 724, 180, 110);
  ctx.fillStyle = '#2a2a2a'; ctx.fillRect(470, 640, 90, 60); ellipse(ctx, 500, 668, 18, 18, '#6a6a6a'); ctx.fillRect(540, 600, 3, 40); // radio and aerial
  ctx.strokeStyle = '#1a3a1a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(240, 700); ctx.lineTo(260, 630); ctx.lineTo(300, 640); ctx.stroke(); ellipse(ctx, 300, 640, 26, 14, '#1a3a1a', 0.4); glow(ctx, 300, 660, 120, 'rgba(255,240,180,0.4)');
  ctx.fillStyle = '#8a6a3a'; ctx.fillRect(350, 670, 70, 30); ellipse(ctx, 370, 668, 16, 12, '#b04a4a'); ellipse(ctx, 396, 670, 14, 11, '#e8e2d6');
  ctx.fillStyle = '#5a4a2a'; ctx.fillRect(220, 420, 200, 140);
  for (let k = 0; k < 12; k++) { const kx = 240 + (k % 6) * 30, ky = 450 + Math.floor(k / 6) * 60; ctx.fillStyle = '#c9a13b'; ctx.fillRect(kx, ky, 3, 10); ctx.fillStyle = '#d8d4c8'; ctx.fillRect(kx - 6, ky + 12, 14, 18); }
  // the card index: a wall of little drawers
  ctx.fillStyle = '#7a6a4a'; ctx.fillRect(660, 440, 220, 400);
  for (let row = 0; row < 12; row++) for (let c = 0; c < 4; c++) { ctx.fillStyle = '#8a7a5a'; ctx.fillRect(668 + c * 53, 448 + row * 32, 48, 28); ctx.fillStyle = '#e8e2d6'; ctx.fillRect(684 + c * 53, 456 + row * 32, 16, 8); ctx.fillStyle = '#c9a13b'; ctx.fillRect(688 + c * 53, 468 + row * 32, 8, 3); }
  ctx.fillStyle = '#2a2a2a'; ctx.font = `700 20px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('KARTEI', 770, 430);
  // Schrank 7: a steel cabinet with a padlock
  ctx.fillStyle = '#5a6a5a'; ctx.fillRect(1520, 380, 220, 460); ctx.strokeStyle = '#3a463a'; ctx.lineWidth = 4; ctx.strokeRect(1524, 384, 212, 452); ctx.beginPath(); ctx.moveTo(1630, 384); ctx.lineTo(1630, 836); ctx.stroke();
  ctx.fillStyle = '#e8e2d6'; ctx.fillRect(1560, 420, 140, 50); ctx.fillStyle = '#1a1a1a'; ctx.font = `700 34px ${FONT_UI}`; ctx.fillText('7', 1630, 458);
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(1616, 600, 28, 34); ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(1630, 600, 10, Math.PI, 0); ctx.stroke();
  // a portrait of the Chairman, a slogan, and a door to the kitchen
  ctx.fillStyle = '#6a4a2a'; ctx.fillRect(1260, 150, 140, 180); ctx.fillStyle = '#b8a888'; ctx.fillRect(1272, 162, 116, 156); ellipse(ctx, 1330, 220, 30, 38, '#d8b898'); ctx.fillStyle = '#3a3a3a'; ctx.fillRect(1296, 258, 68, 60);
  ctx.fillStyle = '#9e1f28'; ctx.fillRect(160, 180, 560, 60); ctx.fillStyle = '#f0e4c8'; ctx.font = `700 26px ${FONT_UI}`; ctx.fillText('WACHSAMKEIT IST UNSERE WAFFE', 440, 220);
  paintDoor(ctx, 1800, 400, 110, 440, '#6a6a5a', '#4a4a3e', '#c8c8c8', false);
  // linoleum
  ctx.fillStyle = linGrad(ctx, 0, 840, 0, H, [[0, '#8a7a5a'], [1, '#5a4a32']]); ctx.fillRect(0, 840, W, H - 840);
  for (let k = 0; k < 12; k++) { ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(k * 180, 840); ctx.lineTo(k * 180 - 200, H); ctx.stroke(); }
}

// ===========================================================================
// WEST BERLIN — dawn, the painted side of the Wall
// ===========================================================================
function paintWall(ctx, x0, x1, top, bottom, seed) {
  ctx.fillStyle = '#d8d4c8'; ctx.fillRect(x0, top, x1 - x0, bottom - top);
  ctx.fillStyle = '#e8e4d8'; for (let x = x0; x < x1; x += 120) { ctx.fillRect(x, top - 30, 120, 34); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(x + 118, top, 3, bottom - top); ctx.fillStyle = '#e8e4d8'; }
  ctx.fillStyle = '#e8e4d8'; ctx.beginPath(); ctx.ellipse((x0 + x1) / 2, top - 30, (x1 - x0) / 2, 22, 0, Math.PI, 0); ctx.fill(); // the round pipe on top
  const r = rng(seed);
  const tags = ['FREIHEIT', 'NO WAR', 'BERLIN', 'LOVE', 'WHY?', 'TEAR IT DOWN', 'ANARCHY', 'KREUZBERG'];
  for (let k = 0; k < 14; k++) {
    const x = x0 + r() * (x1 - x0 - 200), y = top + 40 + r() * (bottom - top - 80), c = pick3(r, ['#e8408a', '#2a6ad8', '#f0b35b', '#2aa84a', '#d82a2a', '#8a2ad8', '#e8408a']);
    if (r() < 0.5) { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x + 60, y, 50 + r() * 60, 30 + r() * 40, r(), 0, 7); ctx.fill(); }
    ctx.save(); ctx.translate(x, y); ctx.rotate((r() - 0.5) * 0.3); ctx.fillStyle = pick3(r, ['#1a1a1a', '#f0f0f0', '#e8408a', '#2a6ad8']);
    ctx.font = `700 ${28 + Math.floor(r() * 30)}px ${FONT_DISPLAY}`; ctx.textAlign = 'left'; ctx.fillText(pick3(r, tags), 0, 0); ctx.restore();
  }
  // a face, the kind everybody paints on the Wall
  ellipse(ctx, x0 + (x1 - x0) * 0.62, top + 150, 70, 90, '#f0b35b'); ellipse(ctx, x0 + (x1 - x0) * 0.62 - 24, top + 130, 10, 14, '#1a1a1a'); ellipse(ctx, x0 + (x1 - x0) * 0.62 + 24, top + 130, 10, 14, '#1a1a1a');
  ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x0 + (x1 - x0) * 0.62, top + 170, 34, 0.2, Math.PI - 0.2); ctx.stroke();
}
// A black Mercedes saloon, side-on.
function paintSaloon(ctx, x, y, s, col = '#101216') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 4, 250, 16, 0, 0, 7); ctx.fill();
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(-240, -20); ctx.lineTo(-236, -60); ctx.lineTo(-150, -72); ctx.lineTo(-90, -130); ctx.lineTo(70, -132); ctx.lineTo(130, -76); ctx.lineTo(236, -66); ctx.lineTo(244, -22); ctx.quadraticCurveTo(244, -10, 230, -10); ctx.lineTo(-230, -10); ctx.quadraticCurveTo(-242, -10, -240, -20); ctx.fill();
  poly(ctx, [-80, -124, -10, -124, -10, -78, -130, -76], '#3a4450'); poly(ctx, [0, -124, 64, -124, 112, -78, 0, -78], '#3a4450');
  ctx.fillStyle = '#c8ccd0'; ctx.fillRect(-236, -30, 480, 6); ctx.fillRect(228, -60, 14, 30);
  for (const wx of [-150, 150]) { ellipse(ctx, wx, -12, 34, 34, '#0a0a0a'); ellipse(ctx, wx, -12, 18, 18, '#c8ccd0'); }
  ellipse(ctx, 240, -80, 5, 5, '#c8ccd0'); ctx.fillStyle = '#c8ccd0'; ctx.fillRect(238, -92, 4, 12); // the star on the bonnet
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(-200, -60, 400, 3);
  ctx.restore();
}
function paintKreuzberg(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 640, [[0, '#4a5a80'], [0.6, '#c89aa0'], [1, '#f0c8a0']]); ctx.fillRect(0, 0, W, 660);
  // the East beyond the Wall: a watchtower and the Fernsehturm in the haze
  ctx.fillStyle = 'rgba(80,80,110,0.55)'; ctx.fillRect(1370, 120, 16, 420); ellipse(ctx, 1378, 240, 38, 38, 'rgba(80,80,110,0.55)'); ctx.fillRect(1374, 40, 8, 90);
  ctx.fillStyle = 'rgba(70,70,90,0.7)'; ctx.fillRect(460, 330, 70, 200); ctx.fillRect(440, 300, 110, 40);
  paintTenement(ctx, 1540, 160, 420, 830, '#b08a70', 221, 0.2);
  paintWall(ctx, -40, 1560, 420, 800, 222);
  // a viewing platform, an Imbiss stand, a lamp
  ctx.fillStyle = '#5a4a3a'; ctx.fillRect(1560, 520, 20, 300); ctx.fillRect(1700, 520, 20, 300); ctx.fillRect(1550, 520, 180, 16); for (let k = 0; k < 8; k++) ctx.fillRect(1570, 540 + k * 36, 140, 6);
  ctx.fillStyle = '#e8e2d6'; ctx.fillRect(90, 640, 300, 180); ctx.fillStyle = '#d82a2a'; ctx.fillRect(80, 606, 320, 44); ctx.fillStyle = '#f0e4c8'; ctx.font = `700 28px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('IMBISS · CURRYWURST', 240, 638);
  ctx.fillStyle = 'rgba(40,30,20,0.7)'; ctx.fillRect(110, 670, 260, 70);
  paintLampPost(ctx, 1040, 850, 560, '#1a1a1a');
  // the bakery's cellar hatch, where the tunnel comes up
  ctx.fillStyle = '#4a3a2a'; poly(ctx, [360, 860, 560, 860, 540, 820, 380, 820], '#4a3a2a'); ctx.fillStyle = '#1a1410'; poly(ctx, [380, 856, 540, 856, 526, 826, 394, 826], '#1a1410');
  // pavement and snow
  ctx.fillStyle = linGrad(ctx, 0, 820, 0, H, [[0, '#a8a8b0'], [1, '#6a6a72']]); ctx.fillRect(0, 820, W, H - 820);
  texture(ctx, 0, 820, W, H - 820, '#e8ecf0', 700, 16, 223, 0.35);
}

// ===========================================================================
// TITLE — the Wall at night, the death strip and a watchtower
// ===========================================================================
function paintTitle7(x) {
  x.fillStyle = linGrad(x, 0, 0, 0, 760, [[0, '#04060c'], [0.7, '#141a28'], [1, '#2a2e3a']]); x.fillRect(0, 0, W, 780);
  const r = rng(231); for (let i = 0; i < 160; i++) ellipse(x, r() * W, r() * 420, r() + 0.3, r() + 0.3, `rgba(255,255,255,${0.2 + r() * 0.5})`);
  // the far wall, the strip lamps, the tower
  x.fillStyle = '#6a6a70'; x.fillRect(0, 600, W, 90); x.fillStyle = '#8a8a90'; x.fillRect(0, 590, W, 14);
  for (let k = 0; k < 9; k++) { const lx = 60 + k * 230; x.fillStyle = '#1a1a1a'; x.fillRect(lx, 480, 6, 120); x.fillRect(lx - 30, 478, 36, 6); glow(x, lx - 26, 486, 90, 'rgba(255,230,170,0.45)'); }
  x.fillStyle = '#2a2c32'; x.fillRect(1380, 300, 70, 300); x.fillStyle = '#3a3c44'; x.fillRect(1350, 240, 130, 70); x.fillStyle = '#ffe8a0'; x.fillRect(1362, 256, 106, 30); x.fillStyle = '#2a2c32'; x.fillRect(1340, 226, 150, 18);
  // the death strip: raked sand, tank traps, the near wall in shadow
  x.fillStyle = linGrad(x, 0, 690, 0, H, [[0, '#c8c4b8'], [1, '#8a8678']]); x.fillRect(0, 690, W, H - 690);
  for (let k = 0; k < 30; k++) { x.strokeStyle = 'rgba(0,0,0,0.12)'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, 700 + k * 13); x.lineTo(W, 700 + k * 13); x.stroke(); }
  for (const hx of [260, 700, 1120, 1600]) { x.strokeStyle = '#1a1a1a'; x.lineWidth = 10; x.beginPath(); x.moveTo(hx - 50, 850); x.lineTo(hx + 50, 760); x.moveTo(hx + 50, 850); x.lineTo(hx - 50, 760); x.moveTo(hx, 740); x.lineTo(hx, 860); x.stroke(); }
  // the searchlight, sweeping the strip
  x.save(); x.globalCompositeOperation = 'lighter';
  x.fillStyle = linGrad(x, 1415, 270, 900, 820, [[0, 'rgba(255,245,210,0.55)'], [1, 'rgba(255,245,210,0.04)']]);
  x.beginPath(); x.moveTo(1400, 270); x.lineTo(1430, 270); x.lineTo(1080, 880); x.lineTo(760, 880); x.closePath(); x.fill();
  x.fillStyle = 'rgba(255,245,210,0.18)'; x.beginPath(); x.ellipse(920, 860, 180, 40, 0, 0, 7); x.fill(); x.restore();
  x.fillStyle = linGrad(x, 1200, 0, 0, 0, [[0, 'rgba(2,4,10,0)'], [1, 'rgba(2,4,10,0.8)']]); x.fillRect(0, 0, 1200, H);
}
