// ---------------------------------------------------------------------------
// Chapter Three paint — aboard the Iron Arrow: the sleeping-car corridor, the
// dining car, the first-class saloon, and a snowy halt in the mountains at dawn.
// Chapter two's train pieces (compartment, mail van, moving windows) are reused.
// ---------------------------------------------------------------------------

// Walnut veneer with brass rails: the Iron Arrow's house style.
function trainPanelling(ctx, y0, y1, seed) {
  ctx.fillStyle = linGrad(ctx, 0, y0, 0, y1, [[0, '#1e120a'], [0.5, '#4a2c16'], [1, '#2a180c']]);
  ctx.fillRect(0, y0, W, y1 - y0);
  texture(ctx, 0, y0, W, y1 - y0, '#140a04', 1600, 60, seed, 0.18, Math.PI / 2);
  for (const y of [y0 + 90, y1 - 90]) { ctx.fillStyle = linGrad(ctx, 0, y, 0, y + 10, [[0, '#e0b868'], [1, '#6a4a1a']]); ctx.fillRect(0, y, W, 10); }
}
function trainCeiling(ctx, lamps, tint = 'rgba(255,220,160,0.35)') {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 100, [[0, '#0e0906'], [1, '#2a1a10']]); ctx.fillRect(0, 0, W, 100);
  for (const x of lamps) { ellipse(ctx, x, 60, 60, 14, '#e8dcc0'); glow(ctx, x, 70, 260, tint); }
}
function trainCarpet(ctx, y0, base, pattern) {
  ctx.fillStyle = linGrad(ctx, 0, y0, 0, H, [[0, base], [1, shadeColor(base, -0.6)]]); ctx.fillRect(0, y0, W, H - y0);
  for (let row = 0; row < 7; row++) {
    const y = y0 + 40 + row * 38 + row * row * 3;
    for (let x = (row % 2) * 60; x < W; x += 120) { ctx.globalAlpha = 0.22; poly(ctx, [x, y, x + 20, y - 9, x + 40, y, x + 20, y + 9], pattern); }
  }
  ctx.globalAlpha = 1;
  texture(ctx, 0, y0, W, H - y0, '#000', 1400, 12, 71, 0.2);
}
// A sliding compartment door with a frosted pane and a brass number.
function compartmentDoor(ctx, x, y, w, h, num, lit) {
  ctx.fillStyle = '#2a180a'; ctx.fillRect(x - 8, y - 8, w + 16, h + 8);
  ctx.fillStyle = linGrad(ctx, x, 0, x + w, 0, [[0, '#3a220e'], [0.5, '#5a3818'], [1, '#3a220e']]); ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lit ? 'rgba(255,220,160,0.55)' : 'rgba(150,160,180,0.35)'; ctx.fillRect(x + 22, y + 40, w - 44, h * 0.45);
  ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 3; ctx.strokeRect(x + 22, y + 40, w - 44, h * 0.45);
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(x + w - 26, y + h * 0.55, 8, 50);
  ellipse(ctx, x + w / 2, y + 20, 16, 12, '#c9a13b');
  ctx.fillStyle = '#2a180a'; ctx.font = `700 18px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText(String(num), x + w / 2, y + 27);
}
// An end door between carriages, with the next car glowing through its window.
function endDoor(ctx, x, w, label) {
  ctx.fillStyle = '#1a0e06'; ctx.fillRect(x, 150, w, 660);
  ctx.fillStyle = linGrad(ctx, 0, 220, 0, 480, [[0, 'rgba(255,210,150,0.6)'], [1, 'rgba(200,150,90,0.4)']]); ctx.fillRect(x + 14, 220, w - 28, 260);
  ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 3; ctx.strokeRect(x + 14, 220, w - 28, 260);
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(x + (x < W / 2 ? w - 22 : 10), 520, 10, 70);
  if (label) { ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x + 8, 170, w - 16, 34); ctx.fillStyle = '#2a1a0a'; ctx.font = `700 17px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText(label, x + w / 2, 193); }
}

// ===========================================================================
// THE CORRIDOR — sleeping car 2
// ===========================================================================
function paintCorridor(ctx) {
  trainPanelling(ctx, 0, 800, 31);
  trainCeiling(ctx, [400, 960, 1520]);
  // compartment doors along the corridor
  compartmentDoor(ctx, 250, 200, 200, 560, 1, false);
  compartmentDoor(ctx, 560, 200, 200, 560, 2, true);
  compartmentDoor(ctx, 1080, 200, 200, 560, 3, false);
  // linen cupboard between two doors
  ctx.fillStyle = '#3a220e'; ctx.fillRect(820, 260, 180, 330);
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 3; ctx.strokeRect(830, 270, 160, 310); ctx.beginPath(); ctx.moveTo(910, 270); ctx.lineTo(910, 580); ctx.stroke();
  ellipse(ctx, 898, 430, 5, 5, '#c9a13b'); ellipse(ctx, 922, 430, 5, 5, '#c9a13b');
  ctx.fillStyle = '#e8dcc0'; ctx.fillRect(850, 234, 120, 22); ctx.fillStyle = '#2a1a0a'; ctx.font = `700 15px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('LINEN · PRÁDLO', 910, 250);
  // the emergency brake handle and a fire axe behind glass
  ctx.fillStyle = '#b31c2e'; ctx.fillRect(1340, 280, 60, 40); ctx.fillStyle = '#e8e0cc'; ctx.font = `700 12px ${FONT_UI}`; ctx.fillText('ZÁCHRANNÁ', 1370, 298); ctx.fillText('BRZDA', 1370, 312);
  ctx.strokeStyle = '#b31c2e'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(1370, 320); ctx.lineTo(1370, 380); ctx.lineTo(1400, 380); ctx.stroke();
  ctx.fillStyle = '#2a0e0a'; ctx.fillRect(1330, 430, 90, 190); ctx.fillStyle = 'rgba(200,220,240,0.2)'; ctx.fillRect(1338, 438, 74, 174);
  ctx.strokeStyle = '#6a6e72'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(1375, 450); ctx.lineTo(1375, 600); ctx.stroke();
  poly(ctx, [1375, 452, 1405, 462, 1405, 500, 1375, 492], '#b31c2e');
  // the conductor's cabin: a half-door, a samovar and a ticket punch
  ctx.fillStyle = '#2a180a'; ctx.fillRect(1480, 180, 300, 620);
  ctx.fillStyle = linGrad(ctx, 0, 200, 0, 560, [[0, 'rgba(255,210,150,0.5)'], [1, 'rgba(200,140,80,0.3)']]); ctx.fillRect(1500, 200, 260, 350);
  const sx = 1560, sy = 520;
  ctx.fillStyle = linGrad(ctx, sx - 40, 0, sx + 40, 0, [[0, '#5a3a10'], [0.45, '#f0c060'], [1, '#5a3a10']]);
  ctx.beginPath(); ctx.moveTo(sx - 26, sy); ctx.quadraticCurveTo(sx - 46, sy - 80, sx - 26, sy - 120); ctx.lineTo(sx + 26, sy - 120); ctx.quadraticCurveTo(sx + 46, sy - 80, sx + 26, sy); ctx.fill();
  ctx.fillRect(sx - 12, sy - 142, 24, 22);
  ctx.fillStyle = '#e8dcc0'; ctx.fillRect(1630, 300, 110, 150); ctx.fillStyle = '#1a1a1a';
  ctx.font = `600 12px ${FONT_TYPE}`; ctx.textAlign = 'left'; ['KARVOGRAD 23:59', 'ZLATÁ HORA 02:10', 'BORDER 04:40', 'MOSKVA +1 18:00'].forEach((l, i) => ctx.fillText(l, 1636, 324 + i * 26));
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(1650, 470, 70, 50); ctx.fillStyle = '#2a1a0a'; ctx.font = `700 11px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('CONDUCTOR', 1685, 492); ctx.fillText('OF THE YEAR', 1685, 508);
  ctx.fillStyle = '#3a220e'; ctx.fillRect(1480, 560, 300, 240); // half door
  ctx.fillStyle = '#6a4a28'; ctx.fillRect(1480, 556, 300, 10);
  glow(ctx, 1620, 380, 240, 'rgba(255,200,130,0.3)');
  // end doors: left to the mail van, right to the dining car
  endDoor(ctx, 0, 150, 'MAIL VAN');
  endDoor(ctx, 1790, 130, 'DINING CAR');
  trainCarpet(ctx, 800, '#3a0e14', '#c9a13b');
  // a long red runner down the middle
  ctx.fillStyle = 'rgba(120,20,30,0.5)'; poly(ctx, [0, 880, W, 880, W, 1000, 0, 1000], 'rgba(120,20,30,0.45)');
  ctx.strokeStyle = 'rgba(201,161,59,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 884); ctx.lineTo(W, 884); ctx.moveTo(0, 996); ctx.lineTo(W, 996); ctx.stroke();
}

// ===========================================================================
// THE DINING CAR
// ===========================================================================
function paintDiningCar(ctx) {
  trainPanelling(ctx, 0, 800, 41);
  trainCeiling(ctx, [300, 960, 1620], 'rgba(255,190,170,0.3)');
  // three big windows, dark here: the landscape is drawn live
  for (const x of [560, 960, 1360]) {
    ctx.fillStyle = '#05080e'; rrect(ctx, x - 170, 170, 340, 360, 24); ctx.fill();
    ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 14; rrect(ctx, x - 170, 170, 340, 360, 24); ctx.stroke();
    // swagged pink curtains
    ctx.fillStyle = '#8a3a4a';
    ctx.beginPath(); ctx.moveTo(x - 180, 160); ctx.quadraticCurveTo(x - 90, 250, x, 170); ctx.quadraticCurveTo(x + 90, 250, x + 180, 160); ctx.lineTo(x + 180, 150); ctx.lineTo(x - 180, 150); ctx.fill();
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + d * 180, 150); ctx.quadraticCurveTo(x + d * 150, 340, x + d * 190, 560); ctx.lineTo(x + d * 205, 560); ctx.lineTo(x + d * 205, 150); ctx.fill(); }
  }
  // the galley hatch on the left, steam and pans behind it
  ctx.fillStyle = '#1a120a'; ctx.fillRect(90, 250, 290, 320);
  ctx.fillStyle = linGrad(ctx, 0, 250, 0, 570, [[0, '#6a6a60'], [1, '#3a3a32']]); ctx.fillRect(104, 264, 262, 290);
  for (let k = 0; k < 5; k++) { ctx.fillStyle = '#8a8e92'; ellipse(ctx, 140 + k * 50, 300, 20, 20, '#8a8e92'); ctx.fillStyle = '#2a2a2a'; ctx.fillRect(130 + k * 50, 298, 20, 4); }
  ctx.fillStyle = '#c86a2a'; ctx.fillRect(130, 470, 60, 40); ctx.fillStyle = '#8a1a1a'; ctx.fillRect(250, 480, 70, 30);
  glow(ctx, 230, 420, 220, 'rgba(255,160,90,0.35)');
  ctx.fillStyle = '#e8dcc0'; ctx.fillRect(140, 214, 190, 30); ctx.fillStyle = '#2a1a0a'; ctx.font = `700 18px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('KUCHYŇ · KITCHEN', 235, 235);
  // a menu board
  ctx.fillStyle = '#1a1a14'; ctx.fillRect(1640, 230, 150, 200); ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 4; ctx.strokeRect(1640, 230, 150, 200);
  ctx.fillStyle = '#e8e0cc'; ctx.font = `600 18px ${FONT_TYPE}`; ctx.textAlign = 'center';
  ['TONIGHT', '', 'BORSCHT', 'BORSCHT', 'or', 'BORSCHT'].forEach((l, i) => ctx.fillText(l, 1715, 262 + i * 28));
  // tables along the far side (Vasko's table is a prop, drawn in front of him)
  for (const x of [560, 1740]) { ctx.fillStyle = '#f2ece0'; ctx.fillRect(x - 110, 640, 220, 30); ctx.fillStyle = '#d8d0c0'; ctx.fillRect(x - 110, 670, 220, 100); ellipse(ctx, x, 620, 18, 22, '#e89aa8'); glow(ctx, x, 620, 90, 'rgba(255,170,170,0.45)'); }
  // doors: back to the sleeping car, on to first class
  endDoor(ctx, 0, 90, null);
  endDoor(ctx, 1830, 90, null);
  trainCarpet(ctx, 800, '#2a1a34', '#c9a13b');
}
// Vasko's table, with a pink lamp, silver and a bottle.
function paintDiningTable(ctx, x) {
  ctx.fillStyle = '#f2ece0'; ctx.beginPath(); ctx.moveTo(x - 130, 700); ctx.lineTo(x + 130, 700); ctx.lineTo(x + 140, 736); ctx.lineTo(x - 140, 736); ctx.fill();
  ctx.fillStyle = '#e0d8c8'; ctx.fillRect(x - 140, 736, 280, 110);
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 2; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(x - 120 + k * 48, 740); ctx.lineTo(x - 124 + k * 50, 846); ctx.stroke(); }
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(x - 3, 640, 6, 60); ellipse(ctx, x, 634, 26, 20, '#e89aa8'); glow(ctx, x, 640, 120, 'rgba(255,170,170,0.5)');
  for (const d of [-1, 1]) { ellipse(ctx, x + d * 70, 704, 28, 7, '#f8f6f0'); ellipse(ctx, x + d * 70, 703, 18, 4, '#8a1a2a'); ctx.fillStyle = 'rgba(230,220,180,0.7)'; ctx.fillRect(x + d * 36 - 3, 670, 6, 30); }
}
// The galley counter, in front of Franz.
function paintGalleyCounter(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 570, 0, 810, [[0, '#6a4a28'], [1, '#2a180a']]); ctx.fillRect(70, 570, 330, 240);
  ctx.fillStyle = '#c8b890'; ctx.fillRect(60, 562, 350, 14);
  ctx.fillStyle = '#8a1a1a'; ellipse(ctx, 330, 556, 30, 8, '#e8e0d0'); ellipse(ctx, 330, 553, 22, 5, '#8a1a2a'); // a bowl of borscht
}

// ===========================================================================
// FIRST CLASS — the saloon car
// ===========================================================================
function paintFirstClass(ctx) {
  // bottle-green damask walls
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 800, [[0, '#0a1a12'], [0.5, '#1e3a2a'], [1, '#12241a']]); ctx.fillRect(0, 0, W, 800);
  for (let x = 0; x < W; x += 70) for (let y = 120; y < 760; y += 80) { ctx.globalAlpha = 0.07; ellipse(ctx, x + (y / 80 % 2) * 35, y, 14, 22, '#c9e0b0'); }
  ctx.globalAlpha = 1;
  trainCeiling(ctx, [480, 1440], 'rgba(255,220,160,0.3)');
  // two tall windows with velvet drapes
  for (const x of [520, 1340]) {
    ctx.fillStyle = '#05080e'; rrect(ctx, x - 190, 170, 380, 400, 28); ctx.fill();
    ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 10; rrect(ctx, x - 190, 170, 380, 400, 28); ctx.stroke();
    for (const d of [-1, 1]) {
      ctx.fillStyle = linGrad(ctx, x + d * 230 - 50, 0, x + d * 230 + 50, 0, [[0, '#3a0a1a'], [0.5, '#7a1a34'], [1, '#3a0a1a']]);
      ctx.beginPath(); ctx.moveTo(x + d * 180, 140); ctx.lineTo(x + d * 260, 140); ctx.lineTo(x + d * 250, 620); ctx.quadraticCurveTo(x + d * 205, 400, x + d * 180, 140); ctx.fill();
      ellipse(ctx, x + d * 212, 390, 16, 10, '#c9a13b');
    }
    ctx.fillStyle = '#7a1a34'; ctx.beginPath(); ctx.moveTo(x - 260, 130); ctx.quadraticCurveTo(x, 210, x + 260, 130); ctx.lineTo(x + 260, 110); ctx.lineTo(x - 260, 110); ctx.fill();
  }
  // Vasko again, in a gilt frame between the windows
  paintVaskoPortrait(ctx, 860, 190, 200, 250);
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(900, 470, 120, 22); ctx.fillStyle = '#2a1a0a'; ctx.font = `700 13px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('OUR BELOVED COLONEL', 960, 486);
  // brass floor lamp and a chess table
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(1110, 470, 8, 330); poly(ctx, [1070, 480, 1160, 480, 1140, 420, 1090, 420], '#e8c890'); glow(ctx, 1114, 460, 200, 'rgba(255,210,140,0.4)');
  ctx.fillStyle = '#3a220e'; ctx.fillRect(1000, 690, 170, 16); ctx.fillRect(1078, 706, 14, 100);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { ctx.fillStyle = (i + j) % 2 ? '#1a1008' : '#e8dcc0'; ctx.fillRect(1030 + i * 28, 668 + j * 5, 28, 5); }
  ctx.fillStyle = '#f0ece4'; ctx.fillRect(1050, 650, 8, 18); ctx.fillStyle = '#1a1008'; ctx.fillRect(1110, 646, 8, 22);
  // doors: back to the dining car; on to the locomotive, which is out of bounds
  endDoor(ctx, 0, 100, null);
  ctx.fillStyle = '#1a0e06'; ctx.fillRect(1790, 150, 130, 660);
  ctx.fillStyle = '#6a6e72'; ctx.fillRect(1806, 200, 98, 580);
  ctx.fillStyle = '#b31c2e'; ctx.fillRect(1800, 240, 110, 60); ctx.fillStyle = '#fff'; ctx.font = `700 16px ${FONT_UI}`; ctx.fillText('NO ENTRY', 1855, 266); ctx.fillText('LOCOMOTIVE', 1855, 288);
  // thick Turkish carpet
  trainCarpet(ctx, 800, '#4a1a1a', '#e8c040');
}
// An armchair in green velvet, drawn in front of whoever sits in it.
function paintArmchair(ctx, x, y, dir) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  ctx.fillStyle = linGrad(ctx, -90, 0, 90, 0, [[0, '#0e2a1a'], [0.5, '#2a5a3a'], [1, '#0e2a1a']]);
  rrect(ctx, 30, -250, 70, 250, 20); ctx.fill();          // high back
  rrect(ctx, -80, -110, 180, 60, 18); ctx.fill();        // seat
  rrect(ctx, -90, -150, 40, 150, 14); ctx.fill();        // arm
  ctx.fillStyle = '#c9a13b'; for (let k = 0; k < 5; k++) ellipse(ctx, 40 + k * 12, -240, 3, 3, '#c9a13b');
  ctx.fillStyle = '#2a1608'; ctx.fillRect(-80, -50, 10, 50); ctx.fillRect(86, -50, 10, 50);
  ctx.restore();
}

// ===========================================================================
// ZLATÁ HORA HALT — dawn in the mountains
// ===========================================================================
function paintHalt(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 760, [[0, '#2a3a6a'], [0.45, '#c86a7a'], [0.75, '#f4b264'], [1, '#ffe0a8']]); ctx.fillRect(0, 0, W, 780);
  ellipse(ctx, 1420, 660, 70, 70, '#fff4d0'); glow(ctx, 1420, 660, 420, 'rgba(255,210,140,0.6)');
  paintMountains(ctx, 33, 700, 420, '#5a4a6a', 'rgba(255,236,230,0.85)');
  paintMountains(ctx, 37, 760, 220, '#3a3050', 'rgba(255,230,220,0.7)');
  paintPines(ctx, 12, 790, 160, '#1a1a2a', 0, W, 0.6);
  // deep snow in the foreground
  ctx.fillStyle = linGrad(ctx, 0, 780, 0, H, [[0, '#f2e6e0'], [1, '#b8b0c8']]); ctx.fillRect(0, 780, W, H - 780);
  const r = rng(21); for (let i = 0; i < 40; i++) ellipse(ctx, r() * W, 800 + r() * 280, 60 + r() * 160, 6 + r() * 12, `rgba(255,255,255,${0.15 + r() * 0.2})`);
  // the single track curving away
  ctx.strokeStyle = '#3a3040'; ctx.lineWidth = 6;
  for (const off of [-20, 20]) { ctx.beginPath(); ctx.moveTo(-50, 870 + off); ctx.quadraticCurveTo(700, 850 + off * 0.8, 1300, 800 + off * 0.3); ctx.lineTo(1920, 790); ctx.stroke(); }
  // the mail van at rest on the track, cold and quiet, doors open
  const vx = 80, vy = 470;
  ctx.fillStyle = linGrad(ctx, 0, vy, 0, vy + 380, [[0, '#4a4e44'], [1, '#1a1c18']]); rrect(ctx, vx, vy, 640, 360, 18); ctx.fill();
  snowLedge(ctx, vx, vy + 2, 640, 18);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 3; for (let x = vx + 30; x < vx + 640; x += 40) { ctx.beginPath(); ctx.moveTo(x, vy + 20); ctx.lineTo(x, vy + 330); ctx.stroke(); }
  ctx.fillStyle = '#2a1a0a'; ctx.fillRect(vx + 250, vy + 60, 190, 280); ctx.fillStyle = 'rgba(255,190,110,0.5)'; ctx.fillRect(vx + 262, vy + 72, 166, 256); // open door, lantern light
  ctx.save(); ctx.translate(vx + 140, vy + 130); ctx.fillStyle = '#b31c2e'; ctx.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? 14 : 36, a = -Math.PI / 2 + k / 10 * Math.PI * 2; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.fill(); ctx.restore();
  ctx.fillStyle = '#d8c89a'; ctx.font = `700 36px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('POŠTA', vx + 540, vy + 150);
  for (const wx of [vx + 80, vx + 170, vx + 470, vx + 560]) { ellipse(ctx, wx, vy + 370, 34, 34, '#121212'); ellipse(ctx, wx, vy + 370, 11, 11, '#5a5a5a'); }
  // the halt: a wooden hut, a sign, a lamp still lit, a bench under snow
  ctx.fillStyle = '#6a3a1a'; ctx.fillRect(1140, 560, 300, 240);
  poly(ctx, [1120, 560, 1460, 560, 1290, 470], '#3a1a0a'); snowLedge(ctx, 1150, 520, 280, 22);
  ctx.fillStyle = 'rgba(255,210,130,0.85)'; ctx.fillRect(1180, 620, 70, 80); ctx.fillStyle = '#2a1608'; ctx.fillRect(1320, 610, 80, 190);
  ctx.fillStyle = '#e8e0cc'; ctx.fillRect(1100, 440, 380, 60); ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 4; ctx.strokeRect(1100, 440, 380, 60);
  ctx.fillStyle = '#1a1a1a'; ctx.font = `700 30px ${FONT_UI}`; ctx.fillText('ZLATÁ HORA', 1290, 476); ctx.font = `600 16px ${FONT_UI}`; ctx.fillText('ALT. 1 402 m  ·  POP. 3', 1290, 494);
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(1500, 520, 8, 280); ellipse(ctx, 1504, 520, 12, 16, '#ffd08a'); glow(ctx, 1504, 520, 100, 'rgba(255,200,120,0.6)');
  // the road on the right, and a black Tatra with its headlights on
  ctx.fillStyle = 'rgba(120,110,140,0.35)'; poly(ctx, [1560, 1080, 1920, 1080, 1920, 780, 1780, 780], 'rgba(120,110,140,0.35)');
}
// Madame Novak's car, drawn in front so she can step out beside it.
function paintTatra(ctx, x, y) {
  ctx.fillStyle = '#07080a';
  ctx.beginPath(); ctx.moveTo(x, y - 30); ctx.lineTo(x + 10, y - 90); ctx.lineTo(x + 90, y - 100); ctx.lineTo(x + 150, y - 160); ctx.lineTo(x + 330, y - 160); ctx.lineTo(x + 380, y - 100); ctx.lineTo(x + 440, y - 92); ctx.lineTo(x + 450, y - 30); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(120,150,190,0.4)'; poly(ctx, [x + 160, y - 150, x + 240, y - 150, x + 240, y - 104, x + 124, y - 102], 'rgba(120,150,190,0.4)');
  snowLedge(ctx, x + 150, y - 160, 180, 10);
  for (const wx of [x + 100, x + 360]) { ellipse(ctx, wx, y - 26, 36, 36, '#030304'); ellipse(ctx, wx, y - 26, 14, 14, '#6b7078'); }
  glow(ctx, x + 10, y - 70, 60, 'rgba(255,245,210,1)');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35;
  poly(ctx, [x + 10, y - 80, x + 10, y - 60, x - 600, y + 40, x - 600, y - 180], linGrad(ctx, x, 0, x - 600, 0, [[0, 'rgba(255,240,200,0.6)'], [1, 'rgba(255,240,200,0)']])); ctx.restore();
}

// ===========================================================================
// THE MAIL VAN, again — with a gangway door at the front end for the coupling
// ===========================================================================
function paintGangwayDoor(ctx) {
  ctx.fillStyle = '#1a0e06'; ctx.fillRect(0, 200, 110, 610);
  ctx.fillStyle = 'rgba(120,150,190,0.35)'; ctx.fillRect(16, 260, 78, 180);
  ctx.strokeStyle = '#6a6e72'; ctx.lineWidth = 5; ctx.strokeRect(16, 260, 78, 180);
  ctx.fillStyle = '#9aa0a6'; ctx.fillRect(84, 500, 16, 50);
  ctx.fillStyle = '#e8e0cc'; ctx.fillRect(4, 214, 102, 30); ctx.fillStyle = '#b31c2e'; ctx.font = `700 14px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('SPŘÁHLO', 55, 234);
}

// ===========================================================================
// TITLE — the Iron Arrow crossing a stone viaduct under the moon
// ===========================================================================
function paintTitle3(x) {
  x.fillStyle = linGrad(x, 0, 0, 0, H, [[0, '#02050c'], [0.6, '#0e1a30'], [1, '#1a2438']]); x.fillRect(0, 0, W, H);
  const r = rng(5); for (let i = 0; i < 200; i++) ellipse(x, r() * W, r() * 500, r() * 1.4 + 0.3, r() * 1.4 + 0.3, `rgba(255,255,255,${0.3 + r() * 0.6})`);
  ellipse(x, 1500, 200, 60, 60, '#eef2f6'); glow(x, 1500, 200, 360, 'rgba(180,200,255,0.3)');
  paintMountains(x, 51, 760, 460, '#101c32', 'rgba(210,225,245,0.55)');
  fog(x, 560, 820, 'rgba(150,170,200,0.25)', 1);
  // the viaduct: a row of tall stone arches across the valley
  const deck = 560;
  x.fillStyle = '#0a0f18'; x.fillRect(0, deck, W, 34);
  for (let k = 0; k < 9; k++) {
    const ax = 40 + k * 230;
    x.fillStyle = '#0c121c'; x.fillRect(ax - 30, deck + 30, 60, H - deck);
    // spandrel above each arch opening
    x.beginPath(); x.moveTo(ax + 30, deck + 30); x.lineTo(ax + 200, deck + 30); x.lineTo(ax + 200, deck + 230);
    x.bezierCurveTo(ax + 200, deck + 90, ax + 30, deck + 90, ax + 30, deck + 230); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(160,180,210,0.12)'; x.lineWidth = 3; x.beginPath(); x.moveTo(ax + 200, deck + 230); x.bezierCurveTo(ax + 200, deck + 90, ax + 30, deck + 90, ax + 30, deck + 230); x.stroke();
  }
  snowLedge(x, 0, deck, W, 10);
  // the train on the deck, windows lit, locomotive's lamp ahead
  for (let k = 0; k < 7; k++) {
    const cx = 60 + k * 250;
    x.fillStyle = '#081018'; rrect(x, cx, deck - 110, 230, 110, 10); x.fill();
    for (let w = 0; w < 5; w++) { x.fillStyle = 'rgba(255,200,130,0.85)'; x.fillRect(cx + 18 + w * 42, deck - 86, 26, 30); }
  }
  x.fillStyle = '#05080c'; x.fillRect(1810, deck - 150, 110, 150); glow(x, 1905, deck - 60, 160, 'rgba(255,240,200,0.7)');
  // snow on the ground in front
  x.fillStyle = linGrad(x, 0, 900, 0, H, [[0, '#6a7890'], [1, '#2a3040']]); x.fillRect(0, 900, W, H - 900);
  // a shadow on the left, where the title type sits
  x.fillStyle = linGrad(x, 0, 0, 1200, 0, [[0, 'rgba(2,4,10,0.8)'], [0.6, 'rgba(2,4,10,0.55)'], [1, 'rgba(2,4,10,0)']]); x.fillRect(0, 0, 1200, H);
}
