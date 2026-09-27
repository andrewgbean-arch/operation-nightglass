// ---------------------------------------------------------------------------
// Chapter Two paint — Karvograd in the snow. The night train, the station,
// its buffet, platform nine and the mail van. Same method as chapter one:
// shapes and light, then the painterly brush pass.
// ---------------------------------------------------------------------------

// Shared: a snowy mountain range and pine forest, used through train windows
// and behind the title.
function paintMountains(ctx, seed, baseY, h, color, snowCol, x0 = 0, x1 = W) {
  const r = rng(seed);
  const pts = [];
  for (let x = x0 - 100; x <= x1 + 100; x += 60 + r() * 80) pts.push([x, baseY - h * (0.35 + r() * 0.65)]);
  const ridge = () => { ctx.beginPath(); ctx.moveTo(x0 - 100, baseY + 4); for (const [x, y] of pts) ctx.lineTo(x, y); ctx.lineTo(x1 + 100, baseY + 4); ctx.closePath(); };
  ridge(); ctx.fillStyle = color; ctx.fill();
  // snowfields: lighter near the peaks, fading down the slopes, with streaks
  ctx.save(); ridge(); ctx.clip();
  for (const [x, y] of pts) {
    // a snowfield draped over each peak
    const d = h * (0.25 + r() * 0.2);
    ctx.fillStyle = linGrad(ctx, 0, y, 0, y + d, [[0, snowCol], [1, 'rgba(0,0,0,0)']]);
    ctx.beginPath(); ctx.moveTo(x, y - 2); ctx.lineTo(x + d * 0.9, y + d); ctx.lineTo(x + d * 0.3, y + d * 0.8); ctx.lineTo(x, y + d * 1.1); ctx.lineTo(x - d * 0.4, y + d * 0.75); ctx.lineTo(x - d * 0.9, y + d); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function paintPines(ctx, seed, baseY, h, color, x0 = 0, x1 = W, density = 1) {
  const r = rng(seed);
  ctx.fillStyle = color;
  for (let x = x0 - 40; x < x1 + 40; x += (14 + r() * 26) / density) {
    const th = h * (0.5 + r() * 0.6), tw = th * 0.28;
    ctx.beginPath(); ctx.moveTo(x, baseY - th);
    for (let k = 1; k <= 4; k++) { ctx.lineTo(x + tw * k / 4, baseY - th + th * k / 4.2); ctx.lineTo(x + tw * k / 8, baseY - th + th * k / 4.2); }
    ctx.lineTo(x + 3, baseY); ctx.lineTo(x - 3, baseY);
    for (let k = 4; k >= 1; k--) { ctx.lineTo(x - tw * k / 8, baseY - th + th * k / 4.2); ctx.lineTo(x - tw * k / 4, baseY - th + th * k / 4.2); }
    ctx.closePath(); ctx.fill();
  }
  ctx.fillRect(x0 - 40, baseY - 2, x1 - x0 + 80, 6);
}

// Onion-domed church and a factory chimney: the Karvograd skyline.
function paintOnion(ctx, cx, baseY, s, color) {
  ctx.fillStyle = color;
  ctx.fillRect(cx - 40 * s, baseY - 150 * s, 80 * s, 150 * s);
  ctx.fillRect(cx - 16 * s, baseY - 190 * s, 32 * s, 40 * s);
  ctx.beginPath(); ctx.moveTo(cx, baseY - 300 * s);
  ctx.bezierCurveTo(cx + 10 * s, baseY - 270 * s, cx + 46 * s, baseY - 250 * s, cx + 34 * s, baseY - 205 * s);
  ctx.quadraticCurveTo(cx + 26 * s, baseY - 188 * s, cx, baseY - 186 * s);
  ctx.quadraticCurveTo(cx - 26 * s, baseY - 188 * s, cx - 34 * s, baseY - 205 * s);
  ctx.bezierCurveTo(cx - 46 * s, baseY - 250 * s, cx - 10 * s, baseY - 270 * s, cx, baseY - 300 * s); ctx.fill();
  ctx.fillRect(cx - 2 * s, baseY - 340 * s, 4 * s, 44 * s);
  ctx.fillRect(cx - 12 * s, baseY - 326 * s, 24 * s, 4 * s);
}
function paintKarvogradSkyline(ctx, baseY, color, winAlpha, seed = 5) {
  paintSkyline(ctx, seed, baseY, 170, color, winAlpha, { noDomes: true });
  paintOnion(ctx, 380, baseY - 100, 0.9, color);
  paintOnion(ctx, 470, baseY - 120, 0.6, color);
  paintOnion(ctx, 1470, baseY - 110, 0.75, color);
  // factory chimneys with a red warning light
  for (const [x, h] of [[1100, 320], [1170, 260], [1780, 300]]) {
    ctx.fillStyle = color; poly(ctx, [x - 16, baseY, x + 16, baseY, x + 9, baseY - h, x - 9, baseY - h], color);
    glow(ctx, x, baseY - h - 4, 26, 'rgba(255,60,50,0.8)', 0.8);
  }
  // a red star on a pole over the rooftops
  ctx.save(); ctx.translate(820, baseY - 330);
  ctx.fillStyle = color; ctx.fillRect(-3, 0, 6, 180);
  ctx.fillStyle = '#c21f2e'; ctx.beginPath();
  for (let k = 0; k < 10; k++) { const rr = k % 2 ? 12 : 30, a = -Math.PI / 2 + k / 10 * Math.PI * 2; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.fill(); ctx.restore();
  glow(ctx, 820, baseY - 330, 90, 'rgba(255,60,60,0.45)');
}

// Snow lying on a ledge or roof edge.
function snowLedge(ctx, x, y, w, h = 10) {
  ctx.fillStyle = '#e4e9ee';
  ctx.beginPath(); ctx.moveTo(x - 4, y + 2);
  const r = rng((x * 3 + y) | 0);
  for (let k = 0; k <= 10; k++) ctx.lineTo(x + w * k / 10, y - h * (0.5 + r() * 0.5));
  ctx.lineTo(x + w + 4, y + 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(150,170,200,0.4)'; ctx.fillRect(x, y, w, 2);
}

// ===========================================================================
// ILSE'S FLAT, the morning after — a door on the left wall for Franz
// ===========================================================================
function paintSafehouseDoor(ctx) {
  paintDoor(ctx, 150, 360, 190, 400, '#5a3a22', '#2a1a0e', '#c9a13b', false);
  ctx.fillStyle = 'rgba(255,220,160,0.12)'; ctx.fillRect(150, 360, 6, 400); // light from the landing
  // the chair with Ilse's handbag
  ctx.fillStyle = '#2a1608';
  ctx.fillRect(1440, 700, 110, 12); ctx.fillRect(1448, 712, 10, 70); ctx.fillRect(1534, 712, 10, 70);
  ctx.fillRect(1534, 560, 12, 150);
  ctx.fillStyle = '#6a1422'; rrect(ctx, 1452, 652, 80, 50, 10); ctx.fill();
  ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(1492, 652, 26, Math.PI, 0); ctx.stroke();
  ellipse(ctx, 1492, 668, 5, 4, '#c9a13b');
}

// ===========================================================================
// THE DANUBE ARROW — a sleeping compartment, seen from the corridor
// ===========================================================================
function paintCompartment(ctx) {
  // walnut veneer back wall
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 780, [[0, '#1e120a'], [0.5, '#4a2c16'], [1, '#2a180c']]);
  ctx.fillRect(0, 0, W, 780);
  texture(ctx, 0, 0, W, 780, '#140a04', 1800, 60, 21, 0.18, Math.PI / 2);
  for (let x = 40; x < W; x += 300) {
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 4; ctx.strokeRect(x, 110, 260, 560);
    ctx.strokeStyle = 'rgba(255,210,150,0.08)'; ctx.lineWidth = 2; ctx.strokeRect(x + 6, 116, 248, 548);
  }
  // brass trim rails
  for (const y of [100, 676]) { ctx.fillStyle = linGrad(ctx, 0, y, 0, y + 10, [[0, '#e0b868'], [1, '#6a4a1a']]); ctx.fillRect(0, y, W, 10); }
  // ceiling with a frosted dome lamp and a blue night light
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 100, [[0, '#0e0906'], [1, '#2a1a10']]); ctx.fillRect(0, 0, W, 100);
  ellipse(ctx, 960, 52, 120, 26, '#e8dcc0'); glow(ctx, 960, 60, 360, 'rgba(255,220,160,0.35)');
  ellipse(ctx, 960, 52, 70, 12, '#fff4dc');
  // window: dark here, the landscape is drawn live behind the frame
  const wx = 700, wy = 180, ww = 520, wh = 420;
  ctx.fillStyle = '#05080e'; rrect(ctx, wx, wy, ww, wh, 34); ctx.fill();
  ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 18; rrect(ctx, wx, wy, ww, wh, 34); ctx.stroke();
  ctx.strokeStyle = '#d8b878'; ctx.lineWidth = 3; rrect(ctx, wx - 8, wy - 8, ww + 16, wh + 16, 40); ctx.stroke();
  // half-drawn blind
  ctx.fillStyle = linGrad(ctx, 0, wy, 0, wy + 70, [[0, '#c8b890'], [1, '#a89468']]);
  ctx.fillRect(wx + 8, wy + 8, ww - 16, 64);
  ctx.fillStyle = '#6a5a3a'; ctx.fillRect(wx + 8, wy + 70, ww - 16, 6);
  ellipse(ctx, wx + ww / 2, wy + 86, 8, 8, '#c9a13b');
  // velvet curtains
  for (const [cx, d] of [[wx - 30, 1], [wx + ww + 30, -1]]) {
    ctx.fillStyle = linGrad(ctx, cx - 70, 0, cx + 70, 0, [[0, '#3a0a10'], [0.5, '#8a1a24'], [1, '#3a0a10']]);
    ctx.beginPath(); ctx.moveTo(cx - 60, wy - 30); ctx.lineTo(cx + 60, wy - 30);
    ctx.quadraticCurveTo(cx + 30 + d * 30, wy + 200, cx + 50 * d, wy + wh + 60); ctx.lineTo(cx - 50 * d, wy + wh + 60);
    ctx.quadraticCurveTo(cx - 20, wy + 200, cx - 60, wy - 30); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 3;
    for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(cx + k * 18, wy - 20); ctx.quadraticCurveTo(cx + k * 10, wy + 200, cx + k * 14 + d * 20, wy + wh + 50); ctx.stroke(); }
    ellipse(ctx, cx + d * 10, wy + 250, 22, 12, '#c9a13b'); // tie-back
  }
  // fold-down table under the window with tea glasses and a lamp
  ctx.fillStyle = '#3a220e'; ctx.fillRect(760, 624, 400, 18);
  ctx.fillStyle = '#e8dcc0'; ctx.fillRect(760, 620, 400, 5);
  ctx.fillStyle = '#2a180a'; poly(ctx, [940, 642, 980, 642, 972, 720, 948, 720], '#2a180a');
  for (const tx of [850, 1060]) {
    ctx.fillStyle = 'rgba(150,60,20,0.85)'; ctx.fillRect(tx - 12, 574, 24, 44);
    ctx.fillStyle = '#a8aeb4'; ctx.fillRect(tx - 14, 596, 28, 22); ctx.fillRect(tx - 14, 596, 28, 3);
    ctx.strokeStyle = '#a8aeb4'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(tx + 16, 604, 9, -1.4, 1.4); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(tx - 8, 578, 3, 18);
  }
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(955, 560, 10, 60); poly(ctx, [930, 560, 990, 560, 976, 520, 944, 520], '#e8d8b0');
  glow(ctx, 960, 548, 120, 'rgba(255,210,140,0.5)');
  // heater grille
  ctx.fillStyle = '#24160c'; ctx.fillRect(780, 700, 360, 60);
  ctx.fillStyle = '#6a5a4a'; for (let k = 0; k < 18; k++) ctx.fillRect(790 + k * 20, 708, 8, 44);
  // benches in profile: left faces right, right faces left
  for (const [x0, x1, back] of [[110, 610, 110], [1310, 1790, 1720]]) {
    const up = linGrad(ctx, 0, 380, 0, 780, [[0, '#2a3a5a'], [1, '#141c2c']]);
    ctx.fillStyle = up;
    rrect(ctx, back, 360, 70, 360, 18); ctx.fill();                       // backrest
    rrect(ctx, x0, 680, x1 - x0, 64, 16); ctx.fill();                   // seat
    ctx.fillStyle = '#1a120a'; ctx.fillRect(x0 + 10, 744, x1 - x0 - 20, 60); // base
    ctx.strokeStyle = 'rgba(160,190,230,0.15)'; ctx.lineWidth = 2;
    for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(back + 10 + k * 10, 372); ctx.lineTo(back + 10 + k * 10, 712); ctx.stroke(); }
    ctx.fillStyle = '#e8e0d0'; rrect(ctx, back + 6, 380, 58, 70, 10); ctx.fill();     // antimacassar
    // folded upper berth and a ladder
    ctx.fillStyle = '#3a220e'; ctx.fillRect(x0, 300, x1 - x0, 26); ctx.fillStyle = '#6a4a28'; ctx.fillRect(x0, 300, x1 - x0, 4);
  }
  // luggage racks with bags
  for (const [x0, x1] of [[100, 640], [1280, 1800]]) {
    ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, 250); ctx.lineTo(x1, 250); ctx.moveTo(x0, 270); ctx.lineTo(x1, 270); ctx.stroke();
    ctx.strokeStyle = 'rgba(201,161,59,0.4)'; ctx.lineWidth = 1.5;
    for (let x = x0; x < x1; x += 14) { ctx.beginPath(); ctx.moveTo(x, 250); ctx.lineTo(x + 7, 270); ctx.lineTo(x + 14, 250); ctx.stroke(); }
  }
  // Jack's suitcase (left) and Novak's hatbox + trunk (right)
  ctx.fillStyle = '#6a4222'; rrect(ctx, 200, 170, 260, 80, 10); ctx.fill();
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(250, 196, 14, 20); ctx.fillRect(396, 196, 14, 20); ctx.fillRect(310, 160, 40, 10);
  ctx.strokeStyle = '#3a220e'; ctx.lineWidth = 3; ctx.strokeRect(210, 180, 240, 60);
  ctx.fillStyle = '#e8dcc8'; ellipse(ctx, 1420, 205, 90, 44, '#d8c0d0'); ellipse(ctx, 1420, 172, 90, 18, '#e8d8e4');
  ctx.strokeStyle = '#6a1a4a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(1420, 205, 90, 44, 0, 0.2, Math.PI - 0.2); ctx.stroke();
  ctx.fillStyle = '#4a2a1a'; rrect(ctx, 1540, 150, 230, 100, 8); ctx.fill();
  ctx.fillStyle = '#c9a13b'; for (const bx of [1560, 1740]) ctx.fillRect(bx, 150, 10, 100);
  // sliding door to the corridor, frosted glass lit from outside
  ctx.fillStyle = '#2a180a'; ctx.fillRect(1800, 120, 130, 690);
  ctx.fillStyle = linGrad(ctx, 0, 180, 0, 600, [[0, 'rgba(255,230,180,0.55)'], [1, 'rgba(200,170,120,0.35)']]);
  ctx.fillRect(1826, 180, 94, 420);
  ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 4; ctx.strokeRect(1826, 180, 94, 420);
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(1812, 460, 10, 60);
  ctx.fillStyle = 'rgba(60,40,20,0.8)'; ctx.font = `600 26px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('4', 1873, 170);
  // carpet
  ctx.fillStyle = linGrad(ctx, 0, 780, 0, H, [[0, '#3a0e14'], [1, '#12040a']]); ctx.fillRect(0, 780, W, H - 780);
  ctx.fillStyle = '#2a0a0e'; ctx.fillRect(0, 780, W, 20);
  const r = rng(31);
  for (let row = 0; row < 7; row++) {
    const y = 820 + row * 38 + row * row * 3;
    for (let x = (row % 2) * 60; x < W; x += 120) { ctx.globalAlpha = 0.25; poly(ctx, [x, y, x + 20, y - 10, x + 40, y, x + 20, y + 10], '#c9a13b'); }
  }
  ctx.globalAlpha = 1;
  texture(ctx, 0, 800, W, 280, '#000', 1500, 12, 32, 0.2);
  // a small framed railway map and a mirror above the window
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(820, 118, 280, 50);
  ctx.fillStyle = '#e8e0c8'; ctx.fillRect(826, 124, 268, 38);
  ctx.strokeStyle = '#9e1f28'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(840, 150); ctx.lineTo(900, 136); ctx.lineTo(960, 146); ctx.lineTo(1030, 132); ctx.lineTo(1080, 140); ctx.stroke();
  for (const px of [840, 960, 1080]) ellipse(ctx, px, px === 960 ? 146 : px === 840 ? 150 : 140, 5, 5, '#1a1a1a');
  // Madame Novak's opera programme and fur stole on the seat
  ctx.save(); ctx.translate(1600, 668); ctx.rotate(-0.12);
  ctx.fillStyle = '#efe6d2'; ctx.fillRect(-50, -12, 100, 20); ctx.fillStyle = '#8a1a24'; ctx.fillRect(-50, -12, 100, 5);
  ctx.restore();
}

// ===========================================================================
// KARVOGRAD CENTRAL — the Stalinist station hall
// ===========================================================================
function paintStation(ctx) {
  // stone walls, cream going to smoke-grey
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 820, [[0, '#1e1c1a'], [0.35, '#5a5448'], [1, '#34302a']]);
  ctx.fillRect(0, 0, W, 820);
  texture(ctx, 0, 0, W, 820, '#1a1612', 2000, 50, 41, 0.12);
  // coffered barrel ceiling band
  ctx.fillStyle = '#16140f'; ctx.fillRect(0, 0, W, 70);
  for (let x = 0; x < W; x += 120) { ctx.fillStyle = 'rgba(255,220,160,0.06)'; ctx.fillRect(x + 8, 10, 104, 50); }
  // the great arched window, snow and the city beyond
  const ax = 560, aw = 800, ay = 90, ah = 520;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(ax, ay + ah); ctx.lineTo(ax, ay + aw / 2); ctx.arc(ax + aw / 2, ay + aw / 2, aw / 2, Math.PI, 0); ctx.lineTo(ax + aw, ay + ah); ctx.closePath();
  ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, ay, 0, ay + ah, [[0, '#070d1a'], [0.7, '#1a2a44'], [1, '#3a3a4a']]); ctx.fillRect(ax, ay, aw, ah);
  paintKarvogradSkyline(ctx, ay + ah - 10, '#0d1420', 0.8);
  fog(ctx, ay + ah - 160, ay + ah, 'rgba(200,210,230,0.18)', 1);
  ctx.restore();
  // mullions
  ctx.strokeStyle = '#1a1814'; ctx.lineWidth = 12;
  for (let k = 1; k < 6; k++) { const x = ax + aw * k / 6; ctx.beginPath(); ctx.moveTo(x, ay + ah); ctx.lineTo(x, ay + 60); ctx.stroke(); }
  for (const y of [ay + ah - 170, ay + ah - 340]) { ctx.beginPath(); ctx.moveTo(ax, y); ctx.lineTo(ax + aw, y); ctx.stroke(); }
  ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(ax + aw / 2, ay + aw / 2, aw / 2 - 5, Math.PI, 0); ctx.stroke();
  snowLedge(ctx, ax, ay + ah - 170, aw, 8); snowLedge(ctx, ax, ay + ah, aw, 12);
  ctx.strokeStyle = '#6a6254'; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(ax - 13, ay + ah + 20); ctx.lineTo(ax - 13, ay + aw / 2); ctx.arc(ax + aw / 2, ay + aw / 2, aw / 2 + 13, Math.PI, 0); ctx.lineTo(ax + aw + 13, ay + ah + 20); ctx.stroke();
  // red banner across the arch
  ctx.fillStyle = linGrad(ctx, 0, 520, 0, 586, [[0, '#9e1f28'], [1, '#6a1018']]);
  ctx.beginPath(); ctx.moveTo(560, 520); ctx.lineTo(1360, 520); ctx.lineTo(1360, 574); ctx.quadraticCurveTo(960, 596, 560, 574); ctx.fill();
  ctx.fillStyle = '#f0d890'; ctx.font = `700 30px ${FONT_UI}`; ctx.textAlign = 'center';
  ctx.fillText('GLORY TO THE RAILWAYMEN OF KARVONIA', 960, 558);
  // pilasters
  for (const x of [470, 1420]) {
    ctx.fillStyle = linGrad(ctx, x, 0, x + 60, 0, [[0, '#3a342a'], [0.5, '#8a8270'], [1, '#3a342a']]);
    ctx.fillRect(x, 70, 60, 750);
    ctx.fillStyle = '#6a6254'; ctx.fillRect(x - 10, 70, 80, 24); ctx.fillRect(x - 10, 790, 80, 30);
  }
  // hanging globe lamps
  for (const x of [240, 960, 1680]) {
    ctx.strokeStyle = '#0c0a08'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, 70); ctx.lineTo(x, x === 960 ? 90 : 200); ctx.stroke();
    if (x !== 960) { ellipse(ctx, x, 230, 34, 34, '#f4e4c0'); glow(ctx, x, 230, 380, 'rgba(255,210,140,0.4)'); }
  }
  // ticket windows under the arch, shuttered
  for (let k = 0; k < 3; k++) {
    const x = 640 + k * 230;
    ctx.fillStyle = '#2a241c'; ctx.fillRect(x, 700, 180, 120);
    ctx.fillStyle = '#8a8270'; ctx.beginPath(); ctx.moveTo(x - 10, 700); ctx.arc(x + 90, 700, 100, Math.PI, 0); ctx.lineTo(x + 190, 700); ctx.fill();
    ctx.fillStyle = '#1a1612'; ctx.beginPath(); ctx.arc(x + 90, 700, 84, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#4a4438'; for (let s = 0; s < 8; s++) ctx.fillRect(x + 12, 704 + s * 12, 156, 8);
    ctx.fillStyle = '#d8c8a0'; ctx.fillRect(x + 30, 640, 120, 30);
    ctx.fillStyle = '#2a1a0a'; ctx.font = `700 20px ${FONT_UI}`; ctx.fillText(k === 1 ? 'CLOSED' : 'TICKETS', x + 90, 662);
  }
  // left: the buffet with its neon sign and steamy windows
  ctx.fillStyle = '#1a120c'; ctx.fillRect(60, 420, 280, 400);
  ctx.fillStyle = linGrad(ctx, 0, 460, 0, 800, [[0, 'rgba(255,200,120,0.55)'], [1, 'rgba(200,130,60,0.4)']]);
  ctx.fillRect(84, 470, 100, 330); ctx.fillRect(216, 470, 100, 330);
  texture(ctx, 84, 470, 232, 330, '#fff', 500, 8, 44, 0.12);
  ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 8; ctx.strokeRect(84, 470, 100, 330); ctx.strokeRect(216, 470, 100, 330);
  glow(ctx, 200, 640, 260, 'rgba(255,190,110,0.35)');
  ctx.save(); ctx.font = `700 64px ${FONT_UI}`; ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(255,60,60,0.9)'; ctx.shadowBlur = 30; ctx.fillStyle = '#ff6a5a';
  ctx.fillText('BUFET', 200, 400); ctx.restore();
  glow(ctx, 200, 380, 200, 'rgba(255,60,60,0.3)');
  // left-luggage lockers
  for (let c = 0; c < 2; c++) for (let rr = 0; rr < 4; rr++) {
    const x = 364 + c * 50, y = 560 + rr * 62;
    ctx.fillStyle = '#4a5048'; ctx.fillRect(x, y, 46, 58);
    ctx.strokeStyle = '#2a2e28'; ctx.lineWidth = 2; ctx.strokeRect(x, y, 46, 58);
    ellipse(ctx, x + 36, y + 30, 3, 3, '#c9c0a0');
    ctx.fillStyle = '#d8d0b0'; ctx.fillRect(x + 8, y + 8, 14, 8);
  }
  // bronze bust of Vasko on a marble plinth, with a wreath
  const bx = 560;
  ctx.fillStyle = linGrad(ctx, bx - 90, 0, bx + 90, 0, [[0, '#4a4640'], [0.5, '#c8c0b0'], [1, '#4a4640']]);
  ctx.fillRect(bx - 84, 600, 168, 220); ctx.fillRect(bx - 96, 588, 192, 16); ctx.fillRect(bx - 100, 800, 200, 20);
  ctx.fillStyle = '#2a2620'; ctx.textAlign = 'center';
  ctx.font = `700 15px ${FONT_UI}`; ctx.fillText('COL. DRAGAN VASKO', bx, 632);
  ctx.font = `600 13px ${FONT_UI}`; ctx.fillText('HERO OF KARVOGRAD', bx, 652);
  ctx.font = `600 14px ${FONT_TYPE}`; ctx.fillText('BORN 14 · XI · 1946', bx, 676);
  const bronze = (x0, x1) => linGrad(ctx, x0, 0, x1, 0, [[0, '#2a1a0a'], [0.45, '#9a6a30'], [0.62, '#d8a060'], [1, '#2a1a0a']]);
  // shoulders with epaulettes, chest of medals
  ctx.fillStyle = bronze(bx - 95, bx + 95);
  ctx.beginPath(); ctx.moveTo(bx - 92, 588); ctx.quadraticCurveTo(bx - 90, 530, bx - 40, 516); ctx.lineTo(bx + 40, 516); ctx.quadraticCurveTo(bx + 90, 530, bx + 92, 588); ctx.fill();
  ellipse(ctx, bx - 66, 526, 26, 9, '#b08040'); ellipse(ctx, bx + 66, 526, 26, 9, '#b08040');
  for (let k = 0; k < 5; k++) ellipse(ctx, bx - 40 + k * 16, 560, 5, 7, '#e8b870');
  // neck and head
  ctx.fillStyle = bronze(bx - 20, bx + 20); ctx.fillRect(bx - 18, 490, 36, 30);
  ctx.fillStyle = bronze(bx - 34, bx + 34); ctx.beginPath(); ctx.ellipse(bx, 460, 30, 38, 0, 0, 7); ctx.fill();
  poly(ctx, [bx - 36, 438, bx + 36, 438, bx + 42, 410, bx - 30, 402], '#4a2e12'); // cap
  poly(ctx, [bx - 34, 440, bx + 44, 440, bx + 32, 450, bx - 28, 448], '#1a1008'); // peak
  ellipse(ctx, bx + 4, 420, 5, 5, '#e8b870');
  ctx.fillStyle = '#1a1008'; ctx.beginPath(); ctx.moveTo(bx - 20, 476); ctx.quadraticCurveTo(bx, 468, bx + 20, 476); ctx.quadraticCurveTo(bx, 482, bx - 20, 476); ctx.fill(); // moustache
  glow(ctx, bx + 12, 452, 70, 'rgba(255,200,140,0.3)');
  ctx.strokeStyle = '#2a4a2a'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(bx, 736, 40, 0, 7); ctx.stroke();
  ctx.fillStyle = '#9e1f28'; poly(ctx, [bx - 10, 772, bx + 10, 772, bx + 14, 820, bx - 14, 820], '#9e1f28');
  // the station clock on a bracket
  ctx.fillStyle = '#0c0a08'; ctx.fillRect(1180, 110, 10, 40);
  ellipse(ctx, 1185, 200, 62, 62, '#1a1612'); ellipse(ctx, 1185, 200, 54, 54, '#f0e8d4');
  ctx.strokeStyle = '#1a1612'; ctx.lineWidth = 3;
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(1185 + Math.sin(a) * 44, 200 - Math.cos(a) * 44); ctx.lineTo(1185 + Math.sin(a) * 50, 200 - Math.cos(a) * 50); ctx.stroke(); }
  ctx.lineCap = 'round';
  for (const [a, l, w] of [[(10 + 51 / 60) / 12 * Math.PI * 2, 26, 6], [51 / 60 * Math.PI * 2, 40, 4]]) { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(1185, 200); ctx.lineTo(1185 + Math.sin(a) * l, 200 - Math.cos(a) * l); ctx.stroke(); }
  ellipse(ctx, 1185, 200, 5, 5, '#9e1f28');
  // right: departure board frame (flaps are drawn live) and the platform gate
  ctx.fillStyle = '#0a0a0a'; ctx.fillRect(1490, 150, 410, 290);
  ctx.strokeStyle = '#6a6254'; ctx.lineWidth = 10; ctx.strokeRect(1490, 150, 410, 290);
  ctx.fillStyle = '#d8c8a0'; ctx.fillRect(1490, 110, 410, 36);
  ctx.fillStyle = '#1a1a1a'; ctx.font = `700 24px ${FONT_UI}`; ctx.fillText('DEPARTURES  ·  ODJEZDY', 1695, 136);
  // platform gate: iron bars, a lit platform beyond
  ctx.fillStyle = linGrad(ctx, 0, 480, 0, 820, [[0, '#2a2c34'], [1, '#6a5a44']]); ctx.fillRect(1560, 480, 340, 340);
  glow(ctx, 1730, 560, 260, 'rgba(255,170,80,0.4)');
  ctx.fillStyle = 'rgba(230,236,244,0.6)'; ctx.fillRect(1560, 760, 340, 60);
  ctx.fillStyle = '#0a0a0a';
  for (let x = 1566; x < 1900; x += 22) { ctx.fillRect(x, 480, 6, 340); poly(ctx, [x - 4, 484, x + 10, 484, x + 3, 468], '#0a0a0a'); }
  ctx.fillRect(1560, 540, 340, 8); ctx.fillRect(1560, 720, 340, 8);
  ctx.fillStyle = '#e8e0cc'; ctx.fillRect(1590, 576, 280, 78);
  ctx.fillStyle = '#9e1f28'; ctx.font = `700 26px ${FONT_UI}`; ctx.fillText('PLATFORMS 7 · 8 · 9', 1730, 606);
  ctx.fillStyle = '#1a1a1a'; ctx.font = `600 19px ${FONT_UI}`; ctx.fillText('CLOSED · MILITARY TRANSPORT', 1730, 636);
  // benches with dozing travellers in silhouette
  for (const x of [1250, 1380]) {
    ctx.fillStyle = '#2a1e14'; ctx.fillRect(x - 70, 760, 140, 14); ctx.fillRect(x - 64, 774, 8, 40); ctx.fillRect(x + 56, 774, 8, 40);
    ctx.fillRect(x - 70, 700, 140, 12);
  }
  ctx.fillStyle = 'rgba(8,8,10,0.85)';
  ellipse(ctx, 1225, 690, 16, 20, 'rgba(12,12,14,0.9)'); poly(ctx, [1200, 760, 1250, 760, 1244, 700, 1206, 700], 'rgba(12,12,14,0.9)');
  poly(ctx, [1196, 640, 1254, 640, 1240, 624, 1210, 624], 'rgba(12,12,14,0.9)'); // hat
  ellipse(ctx, 1400, 700, 15, 18, 'rgba(12,12,14,0.9)'); poly(ctx, [1376, 762, 1424, 762, 1420, 712, 1380, 712], 'rgba(12,12,14,0.9)');
  poly(ctx, [1330, 764, 1368, 764, 1364, 730, 1334, 730], 'rgba(60,40,24,0.95)'); // a suitcase
  // polished stone floor
  ctx.fillStyle = linGrad(ctx, 0, 820, 0, H, [[0, '#4a4438'], [1, '#14120e']]); ctx.fillRect(0, 820, W, H - 820);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
  for (let i = 0; i < 9; i++) { const y = 820 + Math.pow(i / 9, 1.6) * 260; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  for (let i = -12; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(960 + i * 90, 820); ctx.lineTo(960 + i * 260, H); ctx.stroke(); }
  reflection(ctx, 240, 830, 120, 200, 'rgba(255,210,150,0.35)', 0.5);
  reflection(ctx, 1680, 830, 120, 200, 'rgba(255,210,150,0.35)', 0.5);
  reflection(ctx, 960, 830, 600, 160, 'rgba(150,170,210,0.25)', 0.4);
  reflection(ctx, 200, 830, 80, 120, 'rgba(255,80,80,0.3)', 0.4);
  // snow trodden in from the street
  // wet footprints and slush trodden in from the street
  const r = rng(71); for (let i = 0; i < 70; i++) { const y = 840 + r() * 240, k = (y - 820) / 260; ellipse(ctx, r() * W, y, (4 + r() * 6) * (1 + k * 2), (1.5 + r() * 2) * (1 + k), 'rgba(200,210,220,0.12)', 0.2); }
}

// ===========================================================================
// THE BUFFET — "The Golden Locomotive"
// ===========================================================================
function paintBuffet(ctx) {
  // tiled lower walls, nicotine-yellow plaster above
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 480, [[0, '#2a2412'], [1, '#8a7a4a']]); ctx.fillRect(0, 0, W, 480);
  texture(ctx, 0, 0, W, 480, '#3a2a10', 1400, 40, 81, 0.12);
  ctx.fillStyle = '#4a6a5a'; ctx.fillRect(0, 480, W, 330);
  for (let y = 480; y < 810; y += 30) for (let x = (y / 30 % 2) * 30; x < W; x += 60) {
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x + 2, y + 2, 56, 26);
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2;
  for (let y = 480; y <= 810; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.fillStyle = '#2a3a30'; ctx.fillRect(0, 470, W, 14);
  // pendant lamps
  for (const x of [380, 960, 1500]) {
    ctx.strokeStyle = '#0c0a08'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 130); ctx.stroke();
    poly(ctx, [x - 60, 170, x + 60, 170, x + 24, 128, x - 24, 128], '#1e3a2a');
    ellipse(ctx, x, 172, 24, 8, '#fff0c8');
    lightCone(ctx, x, 172, 100, 700, 700, 'rgba(255,220,150,0.5)', 0.3);
    glow(ctx, x, 180, 300, 'rgba(255,210,140,0.35)');
  }
  // steamed-up window onto the snowy square
  const wx = 110, wy = 180, ww = 440, wh = 380;
  ctx.fillStyle = linGrad(ctx, 0, wy, 0, wy + wh, [[0, '#0a1222'], [1, '#2a3444']]); ctx.fillRect(wx, wy, ww, wh);
  ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
  paintSkyline(ctx, 91, wy + wh, 180, '#141c2a', 0.6, { x0: wx - 40, x1: wx + ww + 40, noDomes: true });
  paintOnion(ctx, wx + 300, wy + wh - 90, 0.6, '#141c2a');
  ctx.fillStyle = 'rgba(230,236,244,0.9)'; ctx.fillRect(wx, wy + wh - 40, ww, 40);
  ctx.fillStyle = 'rgba(220,230,240,0.35)'; ctx.fillRect(wx, wy, ww, wh); // condensation
  texture(ctx, wx, wy, ww, wh, '#fff', 400, 14, 55, 0.2, Math.PI / 2);
  ctx.restore();
  ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 14; ctx.strokeRect(wx, wy, ww, wh);
  ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.stroke();
  ctx.fillStyle = '#e8e0cc'; ctx.fillRect(wx - 20, wy + wh, ww + 40, 14);
  // someone drew a heart in the steam
  ctx.strokeStyle = 'rgba(20,30,50,0.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(430, 300); ctx.bezierCurveTo(400, 270, 380, 310, 430, 340); ctx.bezierCurveTo(480, 310, 460, 270, 430, 300); ctx.stroke();
  // shelves behind the counter
  for (const y of [290, 390]) {
    ctx.fillStyle = '#3a220e'; ctx.fillRect(900, y, 820, 14);
    const r = rng(y);
    for (let x = 920; x < 1700; x += 30 + r() * 20) {
      const kind = r();
      if (kind < 0.45) { const c = pick3(r, ['#3a5a2a', '#6a2a1a', '#d8c890', '#2a3a5a']); ctx.fillStyle = c; ctx.fillRect(x, y - 70, 18, 70); ctx.fillRect(x + 6, y - 90, 6, 20); }
      else if (kind < 0.75) { ctx.fillStyle = 'rgba(210,220,230,0.5)'; ctx.fillRect(x, y - 40, 20, 40); ctx.fillStyle = '#a8aeb4'; ctx.fillRect(x - 2, y - 18, 24, 18); }
      else { ctx.fillStyle = pick3(r, ['#c86a2a', '#e8c040', '#9e1f28']); ctx.fillRect(x, y - 50, 26, 50); ctx.fillStyle = '#e8e0cc'; ctx.fillRect(x + 3, y - 34, 20, 14); }
    }
  }
  // the Marshal's portrait over the shelves
  paintFrame(ctx, 1210, 60, 200, 160, c => {
    c.fillStyle = radGrad(c, 1310, 120, 10, 160, [[0, '#5a4a3a'], [1, '#1a120a']]); c.fillRect(1210, 60, 200, 160);
    c.fillStyle = '#2a3440'; poly(c, [1226, 220, 1394, 220, 1370, 180, 1250, 180], '#2a3440');
    c.fillStyle = '#c9a13b'; c.fillRect(1256, 186, 30, 8); c.fillRect(1334, 186, 30, 8);
    ellipse(c, 1310, 128, 36, 46, '#c89a7a');
    c.fillStyle = 'rgba(0,0,0,0.2)'; c.beginPath(); c.ellipse(1296, 130, 20, 44, 0, 0, 7); c.fill();
    c.fillStyle = '#e8e4dc'; c.beginPath(); c.ellipse(1310, 88, 38, 14, 0, Math.PI, 0); c.fill(); // white hair
    c.fillStyle = '#1a120a'; c.fillRect(1292, 120, 10, 4); c.fillRect(1318, 120, 10, 4); // eyes
    c.fillStyle = '#e8e4dc'; c.beginPath(); c.moveTo(1284, 146); c.quadraticCurveTo(1310, 136, 1336, 146); c.lineTo(1330, 176); c.quadraticCurveTo(1310, 186, 1290, 176); c.fill(); // beard
  });
  // radio on the shelf
  ctx.fillStyle = '#5a3a1a'; rrect(ctx, 1560, 316, 120, 70, 10); ctx.fill();
  ctx.fillStyle = '#d8c08a'; ctx.fillRect(1572, 328, 60, 18); ellipse(ctx, 1656, 356, 12, 12, '#2a1a0a');
  ctx.fillStyle = '#1a120a'; for (let k = 0; k < 5; k++) ctx.fillRect(1574, 352 + k * 6, 56, 3);
  // the samovar on the counter
  const sx = 1010, sy = 600;
  ctx.fillStyle = linGrad(ctx, sx - 60, 0, sx + 60, 0, [[0, '#5a3a10'], [0.4, '#f0c060'], [0.55, '#ffe8a0'], [1, '#5a3a10']]);
  ctx.beginPath(); ctx.moveTo(sx - 30, sy); ctx.lineTo(sx - 50, sy - 30); ctx.quadraticCurveTo(sx - 70, sy - 120, sx - 40, sy - 170); ctx.lineTo(sx + 40, sy - 170);
  ctx.quadraticCurveTo(sx + 70, sy - 120, sx + 50, sy - 30); ctx.lineTo(sx + 30, sy); ctx.fill();
  ctx.fillRect(sx - 20, sy - 200, 40, 32); ellipse(ctx, sx, sy - 206, 26, 8, '#c89040');
  ctx.fillStyle = '#e8e0cc'; ctx.fillRect(sx - 12, sy - 236, 24, 30); ctx.fillStyle = '#6a2a10'; ctx.fillRect(sx - 12, sy - 230, 24, 6); // teapot on top
  ctx.strokeStyle = '#6a4a1a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(sx - 62, sy - 110, 16, 1.2, 5); ctx.stroke(); ctx.beginPath(); ctx.arc(sx + 62, sy - 110, 16, -1.8, 1.9); ctx.stroke();
  ctx.fillStyle = '#6a4a1a'; ctx.fillRect(sx + 40, sy - 58, 30, 8); ctx.fillRect(sx + 64, sy - 58, 8, 20);
  glow(ctx, sx - 10, sy - 110, 90, 'rgba(255,220,150,0.35)');
  // sandwich cabinet
  ctx.fillStyle = 'rgba(200,220,230,0.25)'; ctx.fillRect(1120, 520, 260, 80);
  ctx.strokeStyle = '#8a8e92'; ctx.lineWidth = 4; ctx.strokeRect(1120, 520, 260, 80);
  for (let k = 0; k < 5; k++) { poly(ctx, [1136 + k * 48, 596, 1176 + k * 48, 596, 1156 + k * 48, 566], '#d8b880'); ctx.fillStyle = '#6a8a3a'; ctx.fillRect(1140 + k * 48, 586, 32, 4); }
  // cash register
  ctx.fillStyle = '#6a6e72'; poly(ctx, [1440, 600, 1560, 600, 1548, 530, 1452, 530], '#6a6e72');
  ctx.fillStyle = '#2a2e32'; ctx.fillRect(1460, 540, 80, 20); ctx.fillStyle = '#e8e0cc'; ctx.fillRect(1480, 510, 40, 20);
  // coat rack by the door with a railway greatcoat and cap (drawn as a prop)
  ctx.fillStyle = '#2a1a0a'; ctx.fillRect(776, 340, 10, 470); ctx.fillRect(740, 800, 82, 10);
  for (const d of [-1, 1]) { ctx.save(); ctx.translate(781, 356); ctx.rotate(d * 0.7); ctx.fillRect(-3, -26, 6, 26); ctx.restore(); }
  // tables with red-checked oilcloth
  for (const [x, y] of [[300, 760], [620, 780]]) {
    ctx.fillStyle = '#e8e0d0'; poly(ctx, [x - 130, y - 40, x + 130, y - 40, x + 150, y, x - 150, y], '#e8e0d0');
    ctx.save(); ctx.beginPath(); poly(ctx, [x - 130, y - 40, x + 130, y - 40, x + 150, y, x - 150, y]); ctx.clip();
    ctx.fillStyle = 'rgba(180,30,40,0.6)'; for (let k = -8; k < 8; k++) ctx.fillRect(x + k * 20, y - 40, 10, 40); ctx.fillRect(x - 150, y - 30, 300, 10);
    ctx.restore();
    ctx.fillStyle = '#2a1a0a'; ctx.fillRect(x - 6, y, 12, 70); ctx.fillRect(x - 50, y + 66, 100, 8);
  }
  // Pavel's goulash and a bottle
  ellipse(ctx, 560, 748, 36, 10, '#e8e0d0'); ellipse(ctx, 560, 746, 26, 6, '#8a3a1a');
  ctx.fillStyle = '#3a5a2a'; ctx.fillRect(660, 700, 16, 44); ctx.fillRect(664, 686, 8, 14);
  // door back to the hall, left
  ctx.fillStyle = '#1a120a'; ctx.fillRect(0, 300, 90, 510);
  ctx.fillStyle = 'rgba(255,220,160,0.18)'; ctx.fillRect(10, 320, 70, 470);
  // floor: black-and-cream tiles
  ctx.fillStyle = '#1a1612'; ctx.fillRect(0, 810, W, H - 810);
  for (let row = 0; row < 10; row++) {
    const y0 = 810 + Math.pow(row / 10, 1.5) * 270, y1 = 810 + Math.pow((row + 1) / 10, 1.5) * 270;
    const n = 24;
    for (let c = 0; c < n; c++) {
      if ((row + c) % 2) continue;
      const xa = (c - n / 2) * (60 + row * 12) + 960, xb = xa + 60 + row * 12;
      const xa2 = (c - n / 2) * (60 + (row + 1) * 12) + 960, xb2 = xa2 + 60 + (row + 1) * 12;
      poly(ctx, [xa, y0, xb, y0, xb2, y1, xa2, y1], '#b8ae98');
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 810, W, H - 810);
  reflection(ctx, 960, 820, 500, 150, 'rgba(255,210,140,0.2)', 0.4);
}
// The long counter, drawn in front of Auntie Zora.
function paintBuffetCounter(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 600, 0, 820, [[0, '#6a3a1a'], [1, '#2a160a']]);
  ctx.fillRect(880, 600, 860, 220);
  ctx.fillStyle = '#c8b890'; ctx.fillRect(870, 594, 880, 14);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 3;
  for (let x = 900; x < 1740; x += 140) ctx.strokeRect(x, 626, 120, 170);
  ctx.fillStyle = '#c9a13b'; ctx.fillRect(880, 800, 860, 6);
}

// ===========================================================================
// PLATFORM NINE — the Iron Arrow waits in the snow
// ===========================================================================
function paintPlatform(ctx) {
  // night sky beyond the canopy
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 500, [[0, '#04070e'], [1, '#14202e']]); ctx.fillRect(0, 0, W, 520);
  paintKarvogradSkyline(ctx, 470, '#0a1018', 0.6, 9);
  ctx.fillStyle = linGrad(ctx, 0, 460, 0, 800, [[0, '#0a1018'], [1, '#05070a']]); ctx.fillRect(0, 466, W, 340);
  for (let x = -20; x < W; x += 70) { ctx.fillStyle = 'rgba(200,210,230,0.12)'; ctx.fillRect(x, 520, 40, 3); } // far platform edge
  fog(ctx, 300, 560, 'rgba(160,180,210,0.2)', 1);
  // iron canopy: trusses and hanging lamps
  ctx.fillStyle = '#0a0c10'; ctx.fillRect(0, 0, W, 60);
  ctx.strokeStyle = '#0a0c10'; ctx.lineWidth = 6;
  for (let x = 0; x < W; x += 160) { ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x + 80, 130); ctx.lineTo(x + 160, 60); ctx.stroke(); }
  ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, 130); ctx.lineTo(W, 130); ctx.stroke();
  snowLedge(ctx, 0, 60, W, 14);
  for (const x of [300, 900, 1500]) {
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 130); ctx.lineTo(x, 190); ctx.stroke();
    poly(ctx, [x - 36, 214, x + 36, 214, x + 14, 188, x - 14, 188], '#14161a');
    ellipse(ctx, x, 216, 16, 6, '#ffd08a');
    lightCone(ctx, x, 216, 60, 520, 640, 'rgba(255,190,110,0.6)', 0.25);
    glow(ctx, x, 222, 240, 'rgba(255,180,90,0.45)');
  }
  // platform clock hanging from the canopy
  ctx.fillStyle = '#0a0c10'; ctx.fillRect(1196, 130, 8, 40);
  ellipse(ctx, 1200, 210, 44, 44, '#0a0c10'); ellipse(ctx, 1200, 210, 38, 38, '#ece4d0');
  ctx.strokeStyle = '#111'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(1200, 210); ctx.lineTo(1200 + Math.sin(-0.55) * 20, 210 - Math.cos(-0.55) * 20); ctx.stroke(); // hour ~11
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(1200, 210); ctx.lineTo(1200 + Math.sin(2.3) * 30, 210 - Math.cos(2.3) * 30); ctx.stroke(); // 22 past
  // the Iron Arrow: carriages along the back of the platform
  const ty = 420, tb = 770;
  const car = (x0, x1, lit, color) => {
    ctx.fillStyle = linGrad(ctx, 0, ty, 0, tb, [[0, shadeColor(color, 0.15)], [0.5, color], [1, shadeColor(color, -0.45)]]);
    rrect(ctx, x0, ty, x1 - x0, tb - ty - 30, 18); ctx.fill();
    ctx.fillStyle = shadeColor(color, -0.5); ctx.fillRect(x0, ty - 10, x1 - x0, 18); // roof
    snowLedge(ctx, x0, ty - 8, x1 - x0, 16);
    ctx.fillStyle = '#d8c89a'; ctx.fillRect(x0, ty + 190, x1 - x0, 12); // cream stripe
    if (lit) for (let x = x0 + 30; x < x1 - 80; x += 110) {
      ctx.fillStyle = 'rgba(255,200,130,0.85)'; rrect(ctx, x, ty + 50, 80, 110, 10); ctx.fill();
      ctx.fillStyle = 'rgba(120,40,30,0.7)'; ctx.fillRect(x, ty + 50, 18, 110); ctx.fillRect(x + 62, ty + 50, 18, 110);
      glow(ctx, x + 40, ty + 105, 90, 'rgba(255,190,110,0.35)');
    }
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(x0 + 20, tb - 30, x1 - x0 - 40, 30); // bogies
    for (const wx of [x0 + 70, x0 + 150, x1 - 150, x1 - 70]) { ellipse(ctx, wx, tb - 8, 30, 30, '#121212'); ellipse(ctx, wx, tb - 8, 10, 10, '#4a4a4a'); }
  };
  car(-60, 250, true, '#1e3a2a');
  // the mail van: no windows, a sliding door, a red star
  const mv0 = 290, mv1 = 980;
  car(mv0, mv1, false, '#2a2e26');
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3;
  for (let x = mv0 + 30; x < mv1; x += 40) { ctx.beginPath(); ctx.moveTo(x, ty + 10); ctx.lineTo(x, tb - 40); ctx.stroke(); }
  ctx.fillStyle = '#1a1c18'; ctx.fillRect(560, ty + 60, 190, 290);       // door
  ctx.strokeStyle = '#4a4e44'; ctx.lineWidth = 6; ctx.strokeRect(560, ty + 60, 190, 290);
  ctx.fillStyle = '#6a6e64'; ctx.fillRect(552, ty + 50, 206, 10); ctx.fillRect(552, ty + 348, 206, 8);
  ctx.fillStyle = '#9aa0a6'; ctx.fillRect(734, ty + 190, 26, 36); ellipse(ctx, 747, ty + 236, 14, 14, '#7a8086'); // hasp and padlock
  ctx.fillStyle = '#b31c2e'; ctx.fillRect(742, ty + 244, 10, 16); // lead seal on a red ribbon
  ctx.save(); ctx.translate(430, ty + 130); ctx.fillStyle = '#b31c2e'; ctx.beginPath();
  for (let k = 0; k < 10; k++) { const rr = k % 2 ? 16 : 40, a = -Math.PI / 2 + k / 10 * Math.PI * 2; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.fill(); ctx.restore();
  ctx.fillStyle = '#d8c89a'; ctx.font = `700 40px ${FONT_UI}`; ctx.textAlign = 'center';
  ctx.fillText('POŠTA', 860, ty + 150); ctx.font = `600 22px ${FONT_UI}`; ctx.fillText('MAIL · KARVOGRAD–MOSKVA', 860, ty + 180);
  car(1020, 1680, true, '#1e3a2a');
  ctx.fillStyle = '#d8c89a'; ctx.font = `700 26px ${FONT_UI}`; ctx.fillText('IRON ARROW · ŽELEZNÁ STRELA', 1350, ty + 230);
  // the locomotive's tender and cab, steam everywhere
  ctx.fillStyle = linGrad(ctx, 0, 330, 0, tb, [[0, '#2a2a2a'], [1, '#050505']]);
  ctx.fillRect(1700, 380, 240, tb - 380);
  ctx.fillStyle = '#b31c2e'; ctx.fillRect(1700, 600, 240, 14);
  ctx.fillStyle = '#0a0a0a'; ctx.fillRect(1700, 330, 240, 50);
  ctx.fillStyle = 'rgba(255,170,80,0.8)'; ctx.fillRect(1760, 420, 60, 70); glow(ctx, 1790, 455, 120, 'rgba(255,140,60,0.6)'); // firebox glow in the cab
  for (const wx of [1750, 1880]) { ellipse(ctx, wx, tb - 20, 48, 48, '#101010'); ctx.strokeStyle = '#b31c2e'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(wx, tb - 20, 40, 0, 7); ctx.stroke(); }
  // platform edge and surface
  ctx.fillStyle = '#d8d0b8'; ctx.fillRect(0, 780, W, 16);   // yellow-white safety line
  ctx.fillStyle = '#e8c040'; ctx.fillRect(0, 796, W, 6);
  // snow lying on the platform, trampled into a grey path along the train
  ctx.fillStyle = linGrad(ctx, 0, 800, 0, H, [[0, '#b8c2cc'], [1, '#6a7480']]); ctx.fillRect(0, 802, W, H - 802);
  ctx.fillStyle = linGrad(ctx, 0, 830, 0, 1000, [[0, 'rgba(60,66,76,0)'], [0.5, 'rgba(60,66,76,0.45)'], [1, 'rgba(60,66,76,0)']]); ctx.fillRect(0, 830, W, 170);
  const r = rng(91);
  for (let i = 0; i < 90; i++) { const y = 810 + r() * 270, k = (y - 800) / 280; ellipse(ctx, r() * W, y, (30 + r() * 90) * (0.6 + k), (3 + r() * 6) * (0.6 + k), `rgba(236,240,246,${0.08 + r() * 0.12})`); }
  ctx.strokeStyle = 'rgba(40,46,60,0.3)'; ctx.lineWidth = 4;
  for (let i = 0; i < 60; i++) { const y = 850 + r() * 200, x = r() * W, k = (y - 800) / 280; ctx.beginPath(); ctx.ellipse(x, y, 5 + k * 6, 2 + k * 2, 0.15, 0, 7); ctx.stroke(); } // footprints
  // left: archway back to the hall with a big 9
  ctx.fillStyle = '#2a261e'; ctx.fillRect(0, 330, 160, 480);
  ctx.fillStyle = linGrad(ctx, 0, 380, 0, 800, [[0, 'rgba(255,200,130,0.5)'], [1, 'rgba(200,140,80,0.3)']]); ctx.fillRect(30, 400, 100, 400);
  ctx.fillStyle = '#e8e0cc'; ellipse(ctx, 80, 300, 56, 56, '#e8e0cc'); ctx.fillStyle = '#1a1a1a'; ctx.font = `700 76px ${FONT_UI}`; ctx.fillText('9', 80, 326);
  // lamp posts along the platform
  for (const x of [230, 1560]) {
    ctx.fillStyle = '#0c0e12'; ctx.fillRect(x - 6, 470, 12, 330); ctx.fillRect(x - 14, 780, 28, 20);
    ctx.fillRect(x - 6, 470, 60, 8); ellipse(ctx, x + 50, 488, 14, 18, '#ffcf87'); glow(ctx, x + 50, 488, 160, 'rgba(255,190,110,0.6)');
    snowLedge(ctx, x - 6, 470, 64, 8);
  }
  // field telephone box on a pillar
  ctx.fillStyle = '#3a4a34'; ctx.fillRect(170, 560, 60, 80); ctx.fillStyle = '#1a1e18'; ctx.fillRect(180, 572, 40, 30);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(230, 590); ctx.quadraticCurveTo(250, 620, 236, 640); ctx.stroke();
  snowLedge(ctx, 168, 560, 64, 8);
  reflection(ctx, 300, 810, 300, 200, 'rgba(255,190,110,0.3)', 0.4);
  reflection(ctx, 1500, 810, 300, 200, 'rgba(255,190,110,0.3)', 0.4);
}
// The brazier the soldiers huddle round; flames are animated separately.
function paintBrazier(ctx, x, y) {
  ctx.fillStyle = linGrad(ctx, x - 40, 0, x + 40, 0, [[0, '#1a120c'], [0.5, '#5a3a24'], [1, '#1a120c']]);
  ctx.fillRect(x - 38, y - 90, 76, 90);
  ctx.fillStyle = 'rgba(255,120,40,0.9)'; for (let k = 0; k < 4; k++) ellipse(ctx, x - 24 + k * 16, y - 50, 4, 9, 'rgba(255,140,50,0.9)');
  ctx.strokeStyle = '#0a0806'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 38, y - 60); ctx.lineTo(x + 38, y - 60); ctx.moveTo(x - 38, y - 30); ctx.lineTo(x + 38, y - 30); ctx.stroke();
}

// ===========================================================================
// THE MAIL VAN — crates, mailbags, geese, and a very large portrait
// ===========================================================================
function paintVan(ctx) {
  // plank walls and ribs, lit by one lantern
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 820, [[0, '#120a04'], [0.5, '#3a2412'], [1, '#1e1208']]);
  ctx.fillRect(0, 0, W, 820);
  for (let y = 60; y < 820; y += 44) { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, y, W, 3); ctx.fillStyle = 'rgba(255,200,140,0.05)'; ctx.fillRect(0, y + 3, W, 2); }
  texture(ctx, 0, 0, W, 820, '#0a0602', 2400, 80, 101, 0.2);
  for (let x = 100; x < W; x += 300) { ctx.fillStyle = linGrad(ctx, x, 0, x + 40, 0, [[0, '#1a0e06'], [0.5, '#4a2e16'], [1, '#1a0e06']]); ctx.fillRect(x, 0, 40, 820); for (let y = 40; y < 800; y += 120) ellipse(ctx, x + 20, y, 4, 4, '#6a6e72'); }
  // curved roof with the hatch
  ctx.fillStyle = '#0a0602'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 50); ctx.quadraticCurveTo(960, 110, 0, 50); ctx.fill();
  ctx.fillStyle = '#2a2e32'; ctx.fillRect(860, 40, 200, 50); ctx.strokeStyle = '#6a6e72'; ctx.lineWidth = 5; ctx.strokeRect(860, 40, 200, 50);
  ctx.fillStyle = '#8a8e92'; ctx.fillRect(1030, 56, 22, 12); // bolt
  // lantern light pool (the lantern itself swings, drawn live)
  glow(ctx, 700, 260, 700, 'rgba(255,180,90,0.35)');
  // sliding door on the right, platform light leaking round the edges
  ctx.fillStyle = '#24180c'; ctx.fillRect(1700, 220, 190, 590);
  ctx.strokeStyle = '#4a3a24'; ctx.lineWidth = 8; ctx.strokeRect(1700, 220, 190, 590);
  ctx.fillStyle = 'rgba(255,190,110,0.6)'; ctx.fillRect(1694, 220, 5, 590); ctx.fillRect(1700, 214, 190, 5);
  glow(ctx, 1700, 500, 160, 'rgba(255,180,100,0.3)');
  // the strongbox, chained to the wall, stencilled TOP SECRET
  ctx.fillStyle = linGrad(ctx, 300, 0, 520, 0, [[0, '#3a4046'], [0.5, '#7a848c'], [1, '#2a3036']]);
  ctx.fillRect(300, 560, 220, 180);
  ctx.strokeStyle = '#1a1e22'; ctx.lineWidth = 6; ctx.strokeRect(300, 560, 220, 180);
  ctx.fillStyle = '#b31c2e'; ctx.font = `700 26px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('STRENG GEHEIM', 410, 610); ctx.fillText('TOP SECRET', 410, 640);
  ctx.fillStyle = '#0a1008'; ctx.fillRect(360, 660, 100, 60); ctx.fillStyle = '#3aff9a'; ctx.fillRect(372, 670, 76, 12);
  for (let k = 0; k < 9; k++) ctx.fillRect(372 + (k % 3) * 26, 688 + Math.floor(k / 3) * 10, 20, 7);
  ctx.strokeStyle = '#8a8e92'; ctx.lineWidth = 6;
  for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.ellipse(290 - k * 14, 600 - k * 30, 10, 6, 0.8, 0, 7); ctx.stroke(); }
  // crates of plum brandy, stacked
  const crate = (x, y, w, h, label, sub) => {
    ctx.fillStyle = linGrad(ctx, x, y, x + w, y + h, [[0, '#8a6a3a'], [1, '#5a3e1e']]); ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h);
    for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x, y + h * k / 4); ctx.lineTo(x + w, y + h * k / 4); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y + h); ctx.stroke();
    ctx.fillStyle = 'rgba(20,10,4,0.8)'; ctx.font = `700 ${Math.min(26, w / 8)}px ${FONT_TYPE}`; ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + h * 0.42); if (sub) { ctx.font = `600 16px ${FONT_TYPE}`; ctx.fillText(sub, x + w / 2, y + h * 0.42 + 24); }
  };
  crate(560, 640, 300, 160, 'SLIVOVICE', 'FRAGILE · KŘEHKÉ');
  crate(590, 500, 240, 140, 'SLIVOVICE', 'TO THE WORKERS OF MOSCOW');
  crate(900, 620, 220, 180, 'TRACTOR', 'SPARE PARTS · T-25');
  // mailbags heaped by the door
  const r = rng(111);
  for (let k = 0; k < 7; k++) {
    const x = 1520 + (k % 4) * 44 + r() * 10, y = 800 - Math.floor(k / 4) * 60;
    ctx.fillStyle = pick3(r, ['#8a7a5a', '#6a5a3a', '#9a8a6a']);
    ctx.beginPath(); ctx.ellipse(x, y - 40, 44, 50, r() - 0.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#3a2a1a'; ctx.fillRect(x - 8, y - 94, 16, 12);
    ctx.fillStyle = '#b31c2e'; ctx.fillRect(x - 20, y - 50, 40, 8);
  }
  // hook for the crowbar
  ctx.fillStyle = '#6a6e72'; ctx.fillRect(1600, 360, 30, 8);
  // straw and floor planks
  ctx.fillStyle = linGrad(ctx, 0, 800, 0, H, [[0, '#3a2412'], [1, '#120a04']]); ctx.fillRect(0, 800, W, H - 800);
  for (let i = 0; i < 10; i++) { const y = 800 + Math.pow(i / 10, 1.5) * 280; ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, y, W, 3); }
  ctx.strokeStyle = 'rgba(220,180,90,0.5)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 400; i++) { const x = r() * W, y = 800 + r() * 280, a = r() * 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 20, y + Math.sin(a) * 6); ctx.stroke(); }
}
// The tall flat crate holding Vasko's portrait; opened once Jack uses the crowbar.
function paintPortraitCrate(ctx, open) {
  const x = 1180, y = 170, w = 320, h = 630;
  if (!open) {
    ctx.fillStyle = linGrad(ctx, x, 0, x + w, 0, [[0, '#6a4a22'], [0.5, '#9a7a4a'], [1, '#5a3a1a']]); ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 6; ctx.strokeRect(x, y, w, h);
    for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.moveTo(x, y + h * k / 6); ctx.lineTo(x + w, y + h * k / 6); ctx.stroke(); }
    ctx.fillStyle = 'rgba(20,10,4,0.85)'; ctx.textAlign = 'center';
    ctx.font = `700 30px ${FONT_TYPE}`; ctx.fillText('PORTRAIT', x + w / 2, y + 150);
    ctx.font = `600 20px ${FONT_TYPE}`;
    ['COL. D. VASKO', 'HERO OF KARVOGRAD', 'A GIFT TO THE', 'SOVIET PEOPLE'].forEach((l, i) => ctx.fillText(l, x + w / 2, y + 190 + i * 28));
    ctx.fillStyle = '#b31c2e'; ctx.font = `700 26px ${FONT_UI}`; ctx.fillText('↑ THIS WAY UP ↑', x + w / 2, y + 420);
    ctx.fillText('FRAGILE', x + w / 2, y + 460);
    return;
  }
  // lid prised off and leaning aside, the painting revealed
  ctx.fillStyle = '#5a3a1a'; ctx.save(); ctx.translate(x + w + 10, y + 40); ctx.rotate(0.12); ctx.fillRect(0, 0, 40, h); ctx.restore();
  ctx.fillStyle = '#3a2410'; ctx.fillRect(x - 10, y - 10, w + 20, h + 20);
  paintFrame(ctx, x + 20, y + 20, w - 40, h - 40, c => {
    // Vasko on a rearing white horse against a blazing sunset
    c.fillStyle = linGrad(c, 0, y, 0, y + h, [[0, '#3a1a3a'], [0.45, '#e86a2a'], [0.7, '#ffc060'], [1, '#3a2a1a']]); c.fillRect(x, y, w, h);
    const hx = x + w / 2 - 10, hy = y + h * 0.64;
    // a rearing white charger: barrel body, arched neck, long head, flowing tail
    c.fillStyle = '#f0ece4'; c.strokeStyle = '#f0ece4'; c.lineCap = 'round';
    c.save(); c.translate(hx, hy); c.rotate(-0.45);
    c.beginPath(); c.ellipse(0, 0, 78, 38, 0, 0, 7); c.fill();
    c.beginPath(); c.moveTo(50, -20); c.quadraticCurveTo(80, -70, 70, -110); c.lineTo(100, -110); c.quadraticCurveTo(110, -60, 76, 10); c.fill(); // neck
    c.beginPath(); c.moveTo(66, -108); c.lineTo(126, -96); c.quadraticCurveTo(134, -86, 122, -80); c.lineTo(84, -84); c.fill(); // head
    poly(c, [70, -114, 76, -130, 82, -112], '#f0ece4'); // ear
    c.lineWidth = 14;
    c.beginPath(); c.moveTo(56, 20); c.quadraticCurveTo(84, 30, 96, 4); c.moveTo(40, 26); c.quadraticCurveTo(64, 50, 84, 34); c.stroke(); // forelegs tucked
    c.beginPath(); c.moveTo(-54, 20); c.lineTo(-40, 96); c.moveTo(-70, 12); c.lineTo(-74, 96); c.stroke(); // hind legs
    c.fillStyle = '#2a2420'; ellipse(c, -40, 100, 9, 5, '#2a2420'); ellipse(c, -74, 100, 9, 5, '#2a2420');
    c.fillStyle = '#d8d0c0'; c.beginPath(); c.moveTo(-76, -10); c.quadraticCurveTo(-130, 0, -120, 70); c.quadraticCurveTo(-100, 20, -72, 8); c.fill(); // tail
    c.beginPath(); c.moveTo(68, -110); c.quadraticCurveTo(40, -80, 44, -30); c.lineTo(56, -30); c.quadraticCurveTo(58, -80, 80, -104); c.fill(); // mane
    ellipse(c, 108, -98, 3, 2, '#1a1410');
    c.restore();
    // the Colonel, sabre raised
    c.fillStyle = '#9e1f28'; poly(c, [hx - 40, hy - 60, hx + 30, hy - 70, hx + 26, hy - 30, hx - 36, hy - 20], '#9e1f28'); // saddle cloth
    c.fillStyle = '#2d3440'; poly(c, [hx - 30, hy - 40, hx + 20, hy - 40, hx + 14, hy - 130, hx - 24, hy - 130], '#2d3440');
    ellipse(c, hx - 4, hy - 150, 20, 24, '#c8906f');
    poly(c, [hx - 26, hy - 164, hx + 20, hy - 164, hx + 24, hy - 184, hx - 22, hy - 188], '#2a2f38');
    c.fillStyle = '#1a0f0a'; c.fillRect(hx - 14, hy - 142, 24, 5);
    c.strokeStyle = '#e8e8f0'; c.lineWidth = 5; c.beginPath(); c.moveTo(hx + 14, hy - 120); c.lineTo(hx + 90, hy - 250); c.stroke();
    glow(c, hx + 90, hy - 250, 40, 'rgba(255,255,255,0.8)');
    c.fillStyle = '#c9a13b'; for (let k = 0; k < 4; k++) ellipse(c, hx - 16 + k * 8, hy - 100, 3, 4, '#d9b35c');
  });
}

// ---------- the train window: a moving landscape -----------------------------------
function drawTrainWindow(ctx, t, x, y, w, h, speed) {
  ctx.save();
  rrect(ctx, x + 9, y + 9, w - 18, h - 18, 28); ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, y, 0, y + h, [[0, '#050a18'], [0.6, '#15233c'], [1, '#2a3650']]); ctx.fillRect(x, y, w, h);
  ellipse(ctx, x + w * 0.7, y + 120, 26, 26, '#eef2f6'); glow(ctx, x + w * 0.7, y + 120, 140, 'rgba(190,210,255,0.3)');
  const layer = (canvasKey, painter, rate, yy) => {
    if (!drawTrainWindow[canvasKey]) { const c = makeCanvas(1200, 400), cx = c.getContext('2d'); painter(cx); drawTrainWindow[canvasKey] = c; }
    const img = drawTrainWindow[canvasKey], off = (t * rate * speed) % 1200;
    for (let k = -1; k < 2; k++) ctx.drawImage(img, x - off + k * 1200, y + yy);
  };
  layer('_far', c => paintMountains(c, 3, 300, 220, '#1c2a44', 'rgba(210,225,245,0.55)', 0, 1200), 20, 20);
  layer('_mid', c => { paintMountains(c, 9, 330, 120, '#141e30', 'rgba(200,215,240,0.4)', 0, 1200); paintPines(c, 4, 360, 120, '#0a1220', 0, 1200, 0.8); }, 80, 40);
  layer('_near', c => { c.fillStyle = '#dfe6ee'; c.fillRect(0, 330, 1200, 70); paintPines(c, 8, 340, 190, '#060a12', 0, 1200, 0.5); }, 420, 80);
  // telegraph poles flicking past
  const pp = (t * 900 * speed) % 700;
  ctx.fillStyle = '#05070c'; ctx.fillRect(x + w - pp, y, 10, h);
  ctx.strokeStyle = 'rgba(10,14,20,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + 60 + Math.sin(t * 3) * 6); ctx.lineTo(x + w, y + 60 + Math.sin(t * 3 + 1) * 6); ctx.stroke();
  // snow streaking past the glass
  ctx.fillStyle = 'rgba(240,244,250,0.8)';
  for (let k = 0; k < 40; k++) { const sx = x + w - ((t * 700 * speed + k * 131) % (w + 60)), sy = y + ((k * 97 + t * 60) % h); ctx.fillRect(sx, sy, 8, 2); }
  // reflection of the lamp in the glass
  ctx.globalAlpha = 0.1; ctx.fillStyle = linGrad(ctx, x, y, x + w, y + h, [[0, 'rgba(255,232,192,0)'], [0.45, 'rgba(255,232,192,1)'], [0.55, 'rgba(255,232,192,0)']]); ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// Snow falling beyond a window (the station hall and the buffet).
function drawSnowInWindow(ctx, t, x, y, w, h, arch) {
  ctx.save();
  ctx.beginPath();
  if (arch) { ctx.moveTo(x, y + h); ctx.lineTo(x, y + w / 2); ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + h); }
  else ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = 'rgba(235,240,248,0.75)';
  for (let k = 0; k < 90; k++) {
    const sx = x + ((k * 53 + Math.sin(t * 0.7 + k) * 30 + t * 20) % w), sy = y + ((k * 71 + t * (40 + (k % 5) * 12)) % h);
    ctx.beginPath(); ctx.arc(sx, sy, 1.2 + (k % 3), 0, 7); ctx.fill();
  }
  ctx.restore();
}


// Three geese in a slatted crate, bobbing and peering out.
function drawGeese(ctx, t) {
  const x = 120, y = 640;
  ctx.fillStyle = '#6a4a22'; ctx.fillRect(x, y, 160, 160);
  for (let k = 0; k < 3; k++) {
    const hx = x + 30 + k * 50, bob = Math.sin(t * (2 + k * 0.7) + k) * 6, up = Math.sin(t * 0.7 + k * 2) > 0.7 ? -30 : 0;
    ellipse(ctx, hx, y + 70, 24, 16, '#f0ece4');
    ctx.strokeStyle = '#f0ece4'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hx, y + 64); ctx.quadraticCurveTo(hx + 6, y + 30 + up / 2, hx + 2 + bob, y + 10 + up); ctx.stroke();
    ellipse(ctx, hx + 2 + bob, y + 6 + up, 9, 8, '#f0ece4');
    poly(ctx, [hx + 9 + bob, y + 4 + up, hx + 22 + bob, y + 8 + up, hx + 9 + bob, y + 11 + up], '#e8902a');
    ellipse(ctx, hx + 5 + bob, y + 3 + up, 1.6, 1.6, '#111');
  }
  ctx.fillStyle = '#8a6a3a';
  for (let k = 0; k < 6; k++) ctx.fillRect(x + k * 30, y, 12, 160);
  ctx.fillRect(x, y + 60, 160, 12); ctx.fillRect(x, y + 148, 160, 12);
}

