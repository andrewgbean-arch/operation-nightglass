// ---------------------------------------------------------------------------
// Chapter Eleven paint — Svalbard under the midnight sun, April 1988: the Kapp
// Nord research station with its dogs, bins and weather balloon; the Knitting
// Hall at Base Nord with the atomic Knitomatic; Aunt Olga's parlour; the title.
// ---------------------------------------------------------------------------

// The Arctic at two in the morning: a sun that won't set, flat-topped mountains, the fjord full of ice.
function paintArctic(ctx, horizon = 560, steam = true) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, horizon, [[0, '#3a4a78'], [0.55, '#9a8ab0'], [1, '#f2c09a']]); ctx.fillRect(0, 0, W, horizon);
  ellipse(ctx, 1520, horizon - 120, 46, 46, '#fff0d0'); glow(ctx, 1520, horizon - 120, 360, 'rgba(255,210,160,0.4)');
  // mountains: flat on top, streaked with snow
  const ridge = [[0, horizon - 140], [180, horizon - 200], [420, horizon - 190], [560, horizon - 120], [760, horizon - 150], [1040, horizon - 230], [1320, horizon - 220], [1500, horizon - 140], [1720, horizon - 190], [W, horizon - 160]];
  ctx.fillStyle = '#8a92a8'; ctx.beginPath(); ctx.moveTo(0, horizon); for (const [x, y] of ridge) ctx.lineTo(x, y); ctx.lineTo(W, horizon); ctx.fill();
  // snow lying in the gullies under the ridge
  const r = rng(1111);
  const ridgeY = x => { for (let i = 1; i < ridge.length; i++) if (x <= ridge[i][0]) { const [xa, ya] = ridge[i - 1], [xb, yb] = ridge[i]; return ya + (yb - ya) * (x - xa) / (xb - xa); } return ridge[ridge.length - 1][1]; };
  for (let i = 0; i < 46; i++) { const x = r() * W, y0 = ridgeY(x) + 8, w = 10 + r() * 24, h = 30 + r() * (horizon - y0 - 30); poly(ctx, [x - w, y0, x + w, y0, x + w * 0.2, y0 + h, x - w * 0.3, y0 + h * 0.7], 'rgba(240,242,248,0.55)'); }
  ctx.fillStyle = 'rgba(250,245,240,0.8)'; for (let i = 1; i < ridge.length; i++) { const [xa, ya] = ridge[i - 1], [xb, yb] = ridge[i]; poly(ctx, [xa, ya, xb, yb, xb, yb + 14, xa, ya + 14], 'rgba(250,245,240,0.8)'); }
  // the fjord and its ice
  ctx.fillStyle = linGrad(ctx, 0, horizon, 0, horizon + 90, [[0, '#6a7a94'], [1, '#8a9ab0']]); ctx.fillRect(0, horizon, W, 90);
  for (let i = 0; i < 40; i++) ellipse(ctx, r() * W, horizon + 10 + r() * 76, 30 + r() * 80, 5 + r() * 6, 'rgba(240,244,250,0.8)');
  // across the fjord, Base Nord: a hangar, a dome, and steam where there shouldn't be any
  ctx.fillStyle = '#4a5060'; ctx.beginPath(); ctx.ellipse(820, horizon + 4, 90, 40, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(900, horizon - 20, 70, 24); ellipse(ctx, 980, horizon - 6, 22, 20, '#c8a040');
  if (steam) for (let i = 0; i < 14; i++) ellipse(ctx, 984 + Math.sin(i) * 16 + i * 6, horizon - 30 - i * 26, 16 + i * 4, 12 + i * 3, `rgba(250,248,245,${0.55 - i * 0.03})`);
}

// A dog on its chain: a curled-up sleeper or a sitter, ears up.
function drawHusky(ctx, x, y, s, t, awake, seed) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const coat = seed % 2 ? '#8a8e96' : '#5a5e66';
  if (!awake) {
    ellipse(ctx, 0, -18, 44, 20, coat); ellipse(ctx, 0, -12, 36, 12, '#e8e8ec');
    ellipse(ctx, 30, -24, 16, 13, coat); ellipse(ctx, 38, -20, 9, 6, '#e8e8ec');
    ctx.fillStyle = coat; poly(ctx, [24, -34, 30, -48, 34, -34], coat); poly(ctx, [34, -34, 40, -46, 42, -32], coat);
    ctx.strokeStyle = coat; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-40, -20); ctx.quadraticCurveTo(-54, -40, -30, -38); ctx.stroke();
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 1.5 + seed); ctx.fillStyle = '#fff'; ctx.font = `700 16px ${FONT_UI}`; ctx.fillText('z', 50, -44 - (t * 8 + seed * 5) % 16);
  } else {
    ellipse(ctx, 0, -30, 30, 26, coat); ellipse(ctx, 6, -24, 18, 20, '#e8e8ec');
    ctx.fillStyle = coat; ctx.fillRect(-18, -12, 10, 12); ctx.fillRect(6, -12, 10, 12);
    ellipse(ctx, 10, -64, 18, 16, coat); ellipse(ctx, 18, -58, 11, 8, '#e8e8ec'); ellipse(ctx, 28, -60, 4, 3, '#111');
    poly(ctx, [0, -74, 4, -94, 12, -76], coat); poly(ctx, [14, -76, 22, -94, 24, -74], coat);
    ellipse(ctx, 12, -68, 2.2, 2.2, '#6ab0e8'); ellipse(ctx, 20, -68, 2.2, 2.2, '#6ab0e8');
    const wag = Math.sin(t * 12 + seed) * 0.5; ctx.strokeStyle = coat; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-26, -34); ctx.quadraticCurveTo(-46, -60 + wag * 10, -30, -64); ctx.stroke();
  }
  ctx.restore();
}

// Gunnar, the station's regular polar bear, head down in the bins.
function drawBear(ctx, x, y, s, t, dir = 1, running = false) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  const fur = '#f2ecdc', shade = '#d8ceb8';
  const step = running ? Math.sin(t * 14) : Math.sin(t * 2) * 0.2;
  for (const [lx, ph] of [[-60, 0], [-34, Math.PI], [36, Math.PI], [62, 0]]) { const sw = Math.sin(ph) * step * 16; ctx.fillStyle = lx < 0 ? shade : fur; rrect(ctx, lx - 13 + sw, -60, 26, 60, 10); ctx.fill(); ellipse(ctx, lx + sw + 4, -2, 16, 7, '#3a3a3a'); }
  ellipse(ctx, 0, -84, 96, 48, fur); ellipse(ctx, -40, -96, 50, 36, shade);
  const hy = running ? -100 : -60 + Math.sin(t * 3) * 4;
  ellipse(ctx, 88, hy, 30, 24, fur); ellipse(ctx, 110, hy + 6, 16, 12, fur); ellipse(ctx, 124, hy + 4, 5, 4, '#1a1a1a');
  ellipse(ctx, 96, hy - 8, 3, 3, '#1a1a1a'); ellipse(ctx, 76, hy - 22, 8, 7, shade);
  ctx.restore();
}

// ===========================================================================
// THE STATION — Kapp Nord, two in the morning
// ===========================================================================
function paintStation(ctx) {
  paintArctic(ctx, 560, true);
  ctx.fillStyle = linGrad(ctx, 0, 650, 0, 790, [[0, '#d8e0ec'], [1, '#eef2f8']]); ctx.fillRect(0, 650, W, 140);
  // the main hut: red boards on stilts, a sign, a window, steps to the door
  ctx.fillStyle = '#3a2a1a'; for (const x of [70, 200, 330, 440]) ctx.fillRect(x, 740, 14, 90);
  ctx.fillStyle = '#9e2a24'; ctx.fillRect(40, 400, 440, 350); for (let y = 410; y < 750; y += 20) { ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(40, y, 440, 3); }
  ctx.fillStyle = '#2a2a30'; poly(ctx, [20, 410, 500, 410, 460, 330, 60, 330], '#2a2a30'); ctx.fillStyle = '#f4f6f8'; poly(ctx, [20, 404, 500, 404, 490, 390, 30, 390], '#f4f6f8');
  ctx.fillStyle = '#f4f0e8'; ctx.fillRect(110, 420, 220, 44); ctx.fillStyle = '#1a2a4a'; ctx.font = `700 26px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('KAPP NORD', 220, 452);
  ctx.fillStyle = '#f4f0e8'; ctx.fillRect(86, 486, 160, 110); ctx.fillStyle = '#ffe0a0'; ctx.fillRect(96, 496, 140, 90); ctx.fillStyle = '#f4f0e8'; ctx.fillRect(163, 496, 6, 90);
  paintDoor(ctx, 310, 560, 110, 190, '#7a1a14', '#4a0e0a', '#c8c8c8', false);
  ctx.fillStyle = '#5a4a3a'; for (let k = 0; k < 4; k++) ctx.fillRect(290 + k * 8, 750 + k * 22, 150 - k * 16, 12);
  // the radio mast
  ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(560, 800); ctx.lineTo(600, 150); ctx.lineTo(640, 800); ctx.stroke();
  for (let k = 0; k < 10; k++) { const y = 200 + k * 60; ctx.beginPath(); ctx.moveTo(600 - (y - 150) / 16, y); ctx.lineTo(600 + (y - 150) / 16, y + 30); ctx.stroke(); }
  ellipse(ctx, 600, 146, 6, 6, '#e82a2a');
  // POLAR BEAR warning sign
  ctx.fillStyle = '#3a3a3a'; ctx.fillRect(716, 650, 8, 150); poly(ctx, [720, 560, 790, 680, 650, 680], '#e8c030'); poly(ctx, [720, 574, 776, 672, 664, 672], '#f4f0e0');
  ellipse(ctx, 716, 640, 26, 14, '#1a1a1a'); ellipse(ctx, 740, 632, 10, 8, '#1a1a1a'); for (const lx of [698, 712, 726]) ctx.fillRect(lx, 648, 5, 14);
  // the balloon shed, and the helium bottles
  ctx.fillStyle = '#8a8e96'; ctx.fillRect(880, 560, 220, 230); ctx.fillStyle = '#6a6e76'; poly(ctx, [870, 566, 1110, 566, 1090, 520, 890, 520], '#6a6e76');
  ctx.fillStyle = '#2a2e36'; ctx.fillRect(930, 640, 120, 150); ctx.fillStyle = '#f4f0e8'; ctx.fillRect(904, 580, 172, 30); ctx.fillStyle = '#1a2a4a'; ctx.font = `700 18px ${FONT_UI}`; ctx.fillText('METEOROLOGI', 990, 602);
  for (let k = 0; k < 4; k++) { ctx.fillStyle = '#6a7078'; rrect(ctx, 1110 + k * 24, 640 + (k % 2) * 8, 20, 150, 8); ctx.fill(); ctx.fillStyle = '#c8a040'; ctx.fillRect(1114 + k * 24, 636 + (k % 2) * 8, 12, 10); }
  // the bins
  for (let k = 0; k < 2; k++) { ctx.fillStyle = '#2a5a3a'; ctx.fillRect(1230 + k * 90, 700, 80, 100); ctx.fillStyle = '#1e4a2e'; ctx.fillRect(1224 + k * 90, 692, 92, 14); }
  // the dog yard: kennels, a sled, and forty bales of wool for Base Nord
  for (let k = 0; k < 3; k++) { const x = 1440 + k * 150; ctx.fillStyle = '#6a4a2a'; poly(ctx, [x, 790, x + 110, 790, x + 110, 720, x + 55, 680, x, 720], '#6a4a2a'); ctx.fillStyle = '#1a1208'; ellipse(ctx, x + 55, 770, 22, 30, '#1a1208'); ctx.fillStyle = '#f4f6f8'; poly(ctx, [x - 6, 722, x + 55, 676, x + 116, 722, x + 55, 690], '#f4f6f8'); }
  ctx.fillStyle = '#6a4a2a'; ctx.fillRect(1640, 810, 240, 10); ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(1640, 820); ctx.lineTo(1880, 820); ctx.quadraticCurveTo(1910, 820, 1906, 790); ctx.stroke();
  for (const x of [1660, 1860]) ctx.fillRect(x, 770, 6, 44);
  for (let k = 0; k < 7; k++) { const bx = 1700 + (k % 3) * 64, by = 800 - Math.floor(k / 3) * 44; ctx.fillStyle = '#e8e2d2'; rrect(ctx, bx, by - 44, 60, 44, 10); ctx.fill(); ctx.strokeStyle = 'rgba(120,100,70,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx + 30, by - 44); ctx.lineTo(bx + 30, by); ctx.stroke(); }
  ctx.fillStyle = '#3a2a1a'; ctx.font = `700 14px ${FONT_UI}`; ctx.fillText('BASE NORD · ULL', 1790, 830);
  // the snow
  ctx.fillStyle = linGrad(ctx, 0, 780, 0, H, [[0, '#e8ecf4'], [1, '#b8c4d8']]); ctx.fillRect(0, 780, W, H - 780);
  for (let i = 0; i < 30; i++) ellipse(ctx, r2(i) * W, 820 + r2(i + 50) * 240, 80 + r2(i + 90) * 120, 8, 'rgba(150,170,200,0.25)');
  texture(ctx, 0, 780, W, H - 780, '#8a98b0', 400, 18, 1112, 0.15);
}
function r2(i) { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); }
// The weather balloon, tied to its post, or rising away into the sun.
function drawBalloon(ctx, t, launchT) {
  const up = launchT == null ? 0 : Math.min(900, launchT * launchT * 60);
  const x = 1000 + (launchT == null ? Math.sin(t * 0.8) * 8 : launchT * 30), y = 420 - up;
  if (launchT == null) { ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(1000, 560); ctx.lineTo(x, y + 90); ctx.stroke(); }
  else { ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + 90); ctx.lineTo(x, y + 160); ctx.stroke(); ctx.fillStyle = '#e0701a'; ctx.fillRect(x - 10, y + 160, 20, 16); }
  ctx.fillStyle = 'rgba(248,248,250,0.95)'; ctx.beginPath(); ctx.ellipse(x, y, 70, 84, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ellipse(ctx, x - 26, y - 30, 16, 24, 'rgba(255,255,255,0.8)');
  poly(ctx, [x - 10, y + 82, x + 10, y + 82, x, y + 94], '#e8e8ec');
}
// The goose, glaring out of the hut window.
function drawGooseInWindow(ctx, t) {
  ctx.save(); ctx.beginPath(); ctx.rect(96, 496, 140, 90); ctx.clip();
  const x = 160 + Math.sin(t * 0.9) * 20, y = 540;
  ctx.strokeStyle = '#f0ece4'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 20, 600); ctx.quadraticCurveTo(x - 24, 570, x, y); ctx.stroke();
  ellipse(ctx, x + 4, y - 6, 15, 12, '#f0ece4'); poly(ctx, [x + 14, y - 8, x + 36, y - 3, x + 14, y + 2], '#e8902a'); ellipse(ctx, x + 8, y - 10, 2.2, 2.2, '#111');
  ctx.restore();
}

// ===========================================================================
// THE KNITTING HALL — Base Nord
// ===========================================================================
function paintHall(ctx) {
  // a Nissen hut the size of a cathedral: corrugated arch, ribs, strip lights
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 840, [[0, '#4a5048'], [1, '#6a7068']]); ctx.fillRect(0, 0, W, 840);
  for (let x = 0; x < W; x += 24) { ctx.fillStyle = x % 48 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.08)'; ctx.fillRect(x, 0, 12, 840); }
  for (let x = 120; x < W; x += 320) { ctx.fillStyle = '#3a3e38'; ctx.fillRect(x, 0, 16, 840); ctx.fillStyle = '#f4f6e8'; ctx.fillRect(x - 60, 70, 136, 10); glow(ctx, x + 8, 80, 200, 'rgba(240,250,220,0.2)'); }
  // the hangar doors, open onto the ice runway: a black jet under a knitted cover
  ctx.fillStyle = '#2a2e2a'; ctx.fillRect(1440, 180, 480, 660);
  ctx.save(); ctx.beginPath(); ctx.rect(1460, 200, 460, 640); ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, 200, 0, 560, [[0, '#9a8ab0'], [1, '#f2c09a']]); ctx.fillRect(1460, 200, 460, 360);
  ctx.fillStyle = '#e8ecf4'; ctx.fillRect(1460, 560, 460, 280);
  if (typeof paintJetSide === 'function') paintJetSide(ctx, 1700, 720, 0.7, {});
  ctx.fillStyle = '#f0ece2'; ctx.beginPath(); ctx.moveTo(1470, 720); ctx.quadraticCurveTo(1700, 540, 1930, 700); ctx.lineTo(1930, 760); ctx.lineTo(1470, 760); ctx.fill();
  for (let k = 0; k < 18; k++) { ctx.strokeStyle = 'rgba(160,150,130,0.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(1480 + k * 26, 760); ctx.lineTo(1490 + k * 26, 640 + Math.abs(k - 9) * 8); ctx.stroke(); }
  ellipse(ctx, 1700, 690, 40, 40, '#1a2a6a'); ellipse(ctx, 1700, 690, 27, 27, '#f4f0e8'); ellipse(ctx, 1700, 690, 14, 14, '#c81a1a');
  ctx.restore();
  ctx.fillStyle = '#5a5e58'; ctx.fillRect(1420, 180, 30, 660); ctx.fillRect(1440, 160, 480, 24);
  // bales of wool, piled up by the door we came in
  for (let k = 0; k < 9; k++) { const bx = 40 + (k % 3) * 96, by = 840 - Math.floor(k / 3) * 70; ctx.fillStyle = '#e8e2d2'; rrect(ctx, bx, by - 70, 92, 70, 14); ctx.fill(); ctx.strokeStyle = 'rgba(120,100,70,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx + 46, by - 70); ctx.lineTo(bx + 46, by); ctx.stroke(); }
  // the Knitomatic: a reactor on top, gears, spools, and a row of needles as tall as a man
  ctx.fillStyle = '#6a6e74'; ctx.fillRect(420, 340, 640, 500); ctx.fillStyle = '#4a4e54'; ctx.fillRect(420, 340, 640, 24);
  ctx.fillStyle = '#e8c030'; ctx.beginPath(); ctx.ellipse(740, 340, 200, 120, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#c8a020'; ctx.fillRect(540, 330, 400, 14);
  ctx.save(); ctx.translate(740, 270); ctx.fillStyle = '#1a1a1a'; ellipse(ctx, 0, 0, 12, 12, '#1a1a1a');
  for (let k = 0; k < 3; k++) { ctx.save(); ctx.rotate(-Math.PI / 2 + k * Math.PI * 2 / 3); ctx.beginPath(); ctx.moveTo(18, -16); ctx.lineTo(70, -30); ctx.lineTo(70, 30); ctx.lineTo(18, 16); ctx.fill(); ctx.fillStyle = '#c8ccd0'; ctx.fillRect(20, -3, 64, 6); ctx.fillStyle = '#1a1a1a'; ctx.restore(); }
  ctx.restore();
  ctx.fillStyle = '#1a1a1a'; ctx.font = `700 34px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('KNITOMATIC · ATOMNAYA', 740, 410);
  for (const [gx, gy, gr] of [[500, 470, 50], [590, 520, 34], [980, 470, 44]]) { ellipse(ctx, gx, gy, gr, gr, '#8a8e94'); for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; ellipse(ctx, gx + Math.cos(a) * gr, gy + Math.sin(a) * gr, 7, 7, '#8a8e94'); } ellipse(ctx, gx, gy, gr * 0.3, gr * 0.3, '#4a4e54'); }
  for (let k = 0; k < 5; k++) { const sx = 660 + k * 70; ellipse(ctx, sx, 480, 26, 26, '#f4f0e8'); ellipse(ctx, sx, 480, 8, 8, '#8a6a3a'); ctx.strokeStyle = 'rgba(240,236,226,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx, 506); ctx.lineTo(sx + 10, 600); ctx.stroke(); }
  ctx.fillStyle = '#2a2e34'; ctx.fillRect(460, 600, 560, 40);
  // the control panel: the speed dial and the pattern-card reader
  ctx.fillStyle = '#3a3e44'; ctx.fillRect(1060, 520, 150, 220); ctx.fillStyle = '#2a2e34'; ctx.fillRect(1070, 530, 130, 200);
  ctx.fillStyle = '#e8e2d0'; ctx.fillRect(1086, 660, 98, 40); ctx.fillStyle = '#1a1a1a'; ctx.fillRect(1086, 700, 98, 8);
  ctx.fillStyle = '#e8c030'; ctx.font = `700 14px ${FONT_UI}`; ctx.fillText('PATTERN', 1135, 652);
  // Aunt Olga's corner: a rocking-chair rug, a basket of wool, the samovar on a little table
  ctx.fillStyle = '#8a1a2a'; ctx.beginPath(); ctx.ellipse(1300, 850, 160, 20, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#6a4a2a'; ctx.fillRect(1356, 700, 60, 10); ctx.fillRect(1382, 710, 8, 130);
  ctx.fillStyle = '#c9a13b'; rrect(ctx, 1366, 640, 40, 60, 10); ctx.fill(); ctx.fillRect(1378, 620, 16, 20);
  // her rocking chair
  ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(1250, 850); ctx.quadraticCurveTo(1340, 872, 1420, 836); ctx.stroke();
  ctx.fillStyle = '#6a4a2a'; ctx.fillRect(1340, 640, 14, 200); ctx.fillRect(1270, 770, 90, 14); ctx.fillRect(1270, 780, 10, 60);
  for (let k = 0; k < 4; k++) ctx.fillRect(1342, 660 + k * 36, 40, 6);
  // the door to her parlour, and a sign: PRIVAT. NE MESHAT.
  paintDoor(ctx, 1250, 440, 120, 400, '#6a4a2a', '#3a2a14', '#c9a13b', false);
  ctx.fillStyle = '#f4f0e8'; ctx.fillRect(1262, 470, 96, 26); ctx.fillStyle = '#9e1f28'; ctx.font = `700 14px ${FONT_UI}`; ctx.fillText('NE MESHAT', 1310, 489);
  // concrete floor
  ctx.fillStyle = linGrad(ctx, 0, 840, 0, H, [[0, '#7a7e78'], [1, '#4a4e48']]); ctx.fillRect(0, 840, W, H - 840);
  texture(ctx, 0, 840, W, H - 840, '#3a3e38', 700, 16, 1121, 0.25);
}
// The live parts of the Knitomatic: clacking needles, the dial, and the fabric pouring out.
function drawKnitomatic(ctx, t, speed, pattern) {
  const rate = speed === 'slow' ? 1.5 : speed === 'turbo' ? 18 : 6;
  for (let k = 0; k < 14; k++) { const x = 470 + k * 38, y = 620 + Math.sin(t * rate + k * 0.9) * 22; ctx.fillStyle = '#c8ccd0'; ctx.fillRect(x, y - 120, 6, 120); ellipse(ctx, x + 3, y - 124, 6, 6, '#e8e2d0'); }
  // the dial: SLOW, KNIT, TURBO
  const cx = 1135, cy = 590; ellipse(ctx, cx, cy, 40, 40, '#e8e2d0');
  ctx.fillStyle = '#1a1a1a'; ctx.font = `700 11px ${FONT_UI}`; ctx.textAlign = 'center';
  ctx.fillText('SLOW', cx - 26, cy + 26); ctx.fillText('KNIT', cx, cy - 26); ctx.fillText('TURBO', cx + 26, cy + 26);
  const a = speed === 'slow' ? -2.4 : speed === 'turbo' ? -0.7 : -Math.PI / 2;
  ctx.strokeStyle = speed === 'turbo' ? '#e82a2a' : '#1a1a1a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30); ctx.stroke();
  // the card in the reader
  ctx.fillStyle = '#f4f0dc'; ctx.fillRect(1100, 664, 70, 30);
  for (let k = 0; k < 18; k++) ellipse(ctx, 1106 + (k % 9) * 7.5, 672 + Math.floor(k / 9) * 12, 2, 2, '#3a3a3a');
  // the fabric: a white knitted sheet rolling out towards the hangar, with its pattern
  const off = (t * rate * 10) % 160;
  ctx.save(); ctx.beginPath(); ctx.rect(460, 700, 980, 110); ctx.clip();
  ctx.fillStyle = '#f0ece2'; ctx.beginPath(); ctx.moveTo(460, 700); ctx.bezierCurveTo(800, 690, 1100, 720, 1440, 740); ctx.lineTo(1440, 810); ctx.lineTo(460, 810); ctx.fill();
  ctx.strokeStyle = 'rgba(160,150,130,0.35)'; ctx.lineWidth = 2; for (let x = 460 - off; x < 1440; x += 16) { ctx.beginPath(); ctx.moveTo(x, 700); ctx.lineTo(x + 6, 810); ctx.stroke(); }
  for (let x = 520 - off; x < 1440; x += 160) {
    if (pattern === 'goose') { ctx.save(); ctx.translate(x, 760); ctx.scale(0.4, 0.4); ellipse(ctx, 0, 0, 44, 26, '#b8b2a4'); ctx.strokeStyle = '#b8b2a4'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(24, -10); ctx.quadraticCurveTo(40, -40, 34, -64); ctx.stroke(); ellipse(ctx, 36, -68, 12, 10, '#b8b2a4'); poly(ctx, [44, -70, 64, -64, 44, -60], '#e8902a'); ctx.restore(); }
    else { ellipse(ctx, x, 758, 30, 30, '#1a2a6a'); ellipse(ctx, x, 758, 20, 20, '#f4f0e8'); ellipse(ctx, x, 758, 10, 10, '#c81a1a'); }
  }
  ctx.restore();
  if (speed === 'turbo') { ctx.save(); ctx.globalAlpha = 0.5; for (let i = 0; i < 30; i++) ellipse(ctx, 480 + ((t * 300 + i * 97) % 960), 560 - ((t * 200 + i * 53) % 400), 6 + (i % 4) * 3, 5, '#f4f2ec'); ctx.restore(); glow(ctx, 740, 280, 260, `rgba(255,${Math.floor(180 + Math.sin(t * 20) * 60)},80,0.35)`); }
}

// ===========================================================================
// AUNT OLGA'S PARLOUR
// ===========================================================================
function paintParlour(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 840, [[0, '#1e3a2a'], [1, '#2a4a36']]); ctx.fillRect(0, 0, W, 840);
  const r = rng(1131); for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * 520; ctx.fillStyle = 'rgba(200,170,90,0.18)'; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#4a2a14'; ctx.fillRect(0, 540, W, 300); ctx.fillStyle = '#3a200e'; ctx.fillRect(0, 532, W, 14);
  // the door back to the hall
  paintDoor(ctx, 60, 360, 150, 480, '#6a4a2a', '#3a2a14', '#c9a13b', false);
  // family photographs: the Colonel as a boy, in a knitted jumper with a reindeer on it
  paintFrame(ctx, 330, 170, 150, 190, c => { c.fillStyle = '#b8a888'; c.fillRect(330, 170, 150, 190); ellipse(c, 405, 230, 26, 30, '#8a7a6a'); c.fillStyle = '#6a5a4a'; c.fillRect(375, 262, 60, 70); c.fillStyle = '#e8e0d0'; c.fillRect(392, 280, 26, 14); });
  paintFrame(ctx, 540, 200, 130, 150, c => { c.fillStyle = '#a89878'; c.fillRect(540, 200, 130, 150); ellipse(c, 590, 250, 20, 24, '#7a6a5a'); ellipse(c, 630, 256, 18, 22, '#7a6a5a'); });
  // the shelf, and the box of Christmas jumper patterns
  ctx.fillStyle = '#5a3a1a'; ctx.fillRect(760, 380, 360, 16);
  ctx.fillStyle = '#9e1f28'; ctx.fillRect(790, 314, 150, 66); ctx.fillStyle = '#f4f0e8'; ctx.font = `700 14px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('YOLKA · PATTERNS', 865, 352);
  for (let k = 0; k < 5; k++) { ctx.fillStyle = ['#e8c030', '#2a6a3a', '#c8ccd0', '#8a5a2a', '#2a4a8a'][k]; ctx.fillRect(980 + k * 24, 300 + (k % 2) * 10, 20, 80 - (k % 2) * 10); }
  // the stove, glowing
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(1180, 520, 170, 320); ctx.fillRect(1250, 100, 30, 420); ctx.fillStyle = '#ff8a30'; ctx.fillRect(1210, 640, 110, 70); glow(ctx, 1265, 675, 180, 'rgba(255,140,40,0.35)');
  // the radio set on its table
  ctx.fillStyle = '#5a3a1a'; ctx.fillRect(1440, 660, 380, 16); ctx.fillRect(1460, 676, 14, 164); ctx.fillRect(1786, 676, 14, 164);
  ctx.fillStyle = '#3a3e36'; ctx.fillRect(1470, 540, 320, 120); ctx.fillStyle = '#1a1a1a'; ctx.fillRect(1490, 560, 150, 60); ctx.fillStyle = '#e8c870'; ctx.fillRect(1496, 566, 138, 22);
  for (let k = 0; k < 4; k++) ellipse(ctx, 1670 + (k % 2) * 60, 580 + Math.floor(k / 2) * 44, 16, 16, '#8a8e94');
  ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(1760, 540); ctx.lineTo(1800, 380); ctx.stroke();
  ctx.fillStyle = '#1a1a1a'; ellipse(ctx, 1520, 648, 26, 10, '#1a1a1a'); ctx.fillRect(1506, 610, 28, 38);
  // Olga's desk, with the flight plan
  ctx.fillStyle = '#4a2a14'; ctx.fillRect(760, 680, 340, 20); ctx.fillStyle = '#3a200e'; ctx.fillRect(780, 700, 300, 150);
  ctx.save(); ctx.translate(900, 670); ctx.rotate(-0.08); ctx.fillStyle = '#e8e4d0'; ctx.fillRect(-70, -20, 140, 26); ctx.fillStyle = '#9e1f28'; ctx.fillRect(-60, -16, 60, 5); ctx.restore();
  ctx.fillStyle = '#c8a040'; ctx.fillRect(1040, 620, 8, 60); ellipse(ctx, 1044, 614, 30, 12, '#e8d0a0'); glow(ctx, 1044, 640, 120, 'rgba(255,220,150,0.3)');
  // rug and floor
  ctx.fillStyle = '#3a2410'; ctx.fillRect(0, 840, W, H - 840);
  ctx.fillStyle = '#8a1a2a'; poly(ctx, [340, 890, 1580, 890, 1700, 1060, 220, 1060], '#8a1a2a');
  ctx.strokeStyle = '#d8b050'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(360, 902); ctx.lineTo(1560, 902); ctx.lineTo(1670, 1048); ctx.lineTo(250, 1048); ctx.closePath(); ctx.stroke();
}
// Comrade Mittens, Aunt Olga's cat, asleep on the warm radio.
function drawCat(ctx, x, y, t) {
  ellipse(ctx, x, y, 44, 22, '#3a3a3a'); ellipse(ctx, x + 36, y - 10, 18, 15, '#3a3a3a');
  poly(ctx, [x + 26, y - 20, x + 30, y - 38, x + 38, y - 22], '#3a3a3a'); poly(ctx, [x + 40, y - 22, x + 48, y - 36, x + 50, y - 18], '#3a3a3a');
  ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 40, y + 4); ctx.quadraticCurveTo(x - 66, y + 10 + Math.sin(t) * 4, x - 50, y - 10); ctx.stroke();
  ctx.strokeStyle = '#f4f0e8'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + 34, y - 12); ctx.lineTo(x + 42, y - 12); ctx.stroke();
}

// ===========================================================================
// TITLE — the ice under the midnight sun, a sled, the fleet in its jumpers
// ===========================================================================
function paintTitle11(x) {
  paintArctic(x, 620, false);
  x.fillStyle = linGrad(x, 0, 700, 0, H, [[0, '#e8ecf4'], [1, '#9aa8c0']]); x.fillRect(0, 700, W, H - 700);
  for (let k = 0; k < 6; k++) { const px = 1080 + k * 130, py = 690; x.fillStyle = '#f0ece2'; x.beginPath(); x.ellipse(px, py, 60, 18, 0, Math.PI, 0); x.fill(); x.fillStyle = '#1a1a1a'; x.fillRect(px - 60, py, 120, 4); ellipse(x, px, py - 8, 7, 7, '#1a2a6a'); }
  x.fillStyle = '#6a4a2a'; x.fillRect(1300, 940, 260, 10); x.strokeStyle = '#6a4a2a'; x.lineWidth = 6; x.beginPath(); x.moveTo(1300, 950); x.lineTo(1560, 950); x.quadraticCurveTo(1590, 950, 1586, 920); x.stroke();
  x.fillStyle = linGrad(x, 1100, 0, 0, 0, [[0, 'rgba(2,4,10,0)'], [1, 'rgba(2,4,10,0.75)']]); x.fillRect(0, 0, 1100, H);
}

// ===========================================================================
// THE CARGO HOLD — aboard Babushka
// ===========================================================================
function paintCargo(ctx) {
  // a transport's hold: ribbed fuselage, cargo nets, round windows full of sky
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 840, [[0, '#2a2e34'], [1, '#4a4e54']]); ctx.fillRect(0, 0, W, 840);
  ctx.fillStyle = '#1a1c20'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(W / 2, 160, W, 0); ctx.fill();
  for (let x = 40; x < W; x += 170) { ctx.fillStyle = '#3a3e44'; ctx.fillRect(x, 60, 20, 780); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x + 4, 60, 4, 780); }
  for (let k = 0; k < 5; k++) { const x = 180 + k * 340; ellipse(ctx, x, 320, 44, 44, '#1a1c20'); ellipse(ctx, x, 320, 36, 36, '#8ab0e0'); ellipse(ctx, x - 10, 310, 10, 14, 'rgba(255,255,255,0.4)'); }
  ctx.strokeStyle = 'rgba(200,180,120,0.5)'; ctx.lineWidth = 3;
  for (let k = 0; k < 12; k++) { ctx.beginPath(); ctx.moveTo(60 + k * 30, 480); ctx.lineTo(60 + k * 30 + 120, 840); ctx.stroke(); ctx.beginPath(); ctx.moveTo(420 - k * 30, 480); ctx.lineTo(300 - k * 30, 840); ctx.stroke(); }
  // the Knitomatic, strapped down, reactor ticking over
  ctx.fillStyle = '#6a6e74'; ctx.fillRect(560, 480, 420, 360); ctx.fillStyle = '#e8c030'; ctx.beginPath(); ctx.ellipse(770, 480, 130, 80, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#1a1a1a'; ctx.font = `700 26px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('KNITOMATIC', 770, 540);
  ctx.strokeStyle = '#c8a040'; ctx.lineWidth = 8; for (const x of [600, 940]) { ctx.beginPath(); ctx.moveTo(x, 400); ctx.lineTo(x, 840); ctx.stroke(); }
  // Olga's corner: rug, rocking chair, a table with a cake and the samovar
  ctx.fillStyle = '#8a1a2a'; ctx.beginPath(); ctx.ellipse(1400, 860, 220, 26, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(1300, 850); ctx.quadraticCurveTo(1390, 872, 1470, 836); ctx.stroke();
  ctx.fillStyle = '#6a4a2a'; ctx.fillRect(1390, 640, 14, 200); for (let k = 0; k < 4; k++) ctx.fillRect(1392, 660 + k * 36, 40, 6);
  ctx.fillStyle = '#6a4a2a'; ctx.fillRect(1560, 720, 180, 12); ctx.fillRect(1640, 732, 10, 110);
  ctx.fillStyle = '#f4e0c0'; ctx.fillRect(1580, 684, 80, 36); ctx.fillStyle = '#c81a1a'; ctx.fillRect(1580, 684, 80, 8);
  ctx.fillStyle = '#c9a13b'; rrect(ctx, 1680, 660, 40, 60, 10); ctx.fill();
  // the open ramp at the back, a slab of blinding white sky
  ctx.fillStyle = '#e8ecf4'; poly(ctx, [1780, 120, 1920, 60, 1920, 840, 1780, 840], '#e8ecf4');
  ctx.fillStyle = linGrad(ctx, 0, 840, 0, H, [[0, '#5a5e64'], [1, '#2a2e34']]); ctx.fillRect(0, 840, W, H - 840);
  for (let x = 0; x < W; x += 60) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x, 840, 4, H - 840); }
}
