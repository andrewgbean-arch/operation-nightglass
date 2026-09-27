// ---------------------------------------------------------------------------
// Chapter Five paint — Istanbul: a private airstrip on the Asian shore at
// dawn, the Grand Bazaar, a marble hammam, and Bay Selim's yalı on the
// Bosphorus: the auction salon and the waterside terrace.
// The Nightglass jet itself comes from chapter four.
// ---------------------------------------------------------------------------

// A pencil minaret with its balconies.
function paintMinaret(ctx, x, baseY, h, col) {
  ctx.fillStyle = col;
  ctx.fillRect(x - 9, baseY - h, 18, h);
  for (const f of [0.55, 0.78]) { ctx.fillRect(x - 15, baseY - h * f, 30, 6); ctx.fillRect(x - 12, baseY - h * f - 10, 24, 10); }
  poly(ctx, [x - 10, baseY - h, x + 10, baseY - h, x, baseY - h - 60], col);
  ctx.fillRect(x - 1, baseY - h - 76, 2, 18);
}
// A great mosque: a central dome on a drum, semi-domes, and minarets.
function paintMosque(ctx, cx, baseY, s, col, minarets = 4) {
  ctx.fillStyle = col;
  ctx.fillRect(cx - 190 * s, baseY - 110 * s, 380 * s, 110 * s);
  for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + d * 120 * s, baseY - 110 * s, 70 * s, 50 * s, 0, Math.PI, 0); ctx.fill(); }
  ctx.fillRect(cx - 95 * s, baseY - 170 * s, 190 * s, 60 * s);
  ctx.beginPath(); ctx.ellipse(cx, baseY - 170 * s, 100 * s, 90 * s, 0, Math.PI, 0); ctx.fill();
  ctx.fillRect(cx - 2 * s, baseY - 290 * s, 4 * s, 40 * s);
  const xs = minarets === 4 ? [-260, -210, 210, 260] : minarets === 2 ? [-230, 230] : [];
  for (const dx of xs) paintMinaret(ctx, cx + dx * s, baseY, 360 * s, col);
}
// The skyline of the old city across the water, with a few lit windows.
function paintIstanbulSkyline(ctx, baseY, col, seed, lights = 0) {
  const r = rng(seed);
  ctx.fillStyle = col;
  for (let x = 0; x < W; x += 30 + r() * 30) { const h = 20 + r() * 50; ctx.fillRect(x, baseY - h, 40 + r() * 30, h); }
  paintMosque(ctx, 520, baseY - 20, 0.55, col, 4);
  paintMosque(ctx, 1080, baseY - 30, 0.7, col, 4);
  paintMosque(ctx, 1560, baseY - 10, 0.45, col, 2);
  // the Galata tower, off to the right
  ctx.fillRect(1780, baseY - 190, 50, 190); poly(ctx, [1774, baseY - 190, 1836, baseY - 190, 1805, baseY - 250], col);
  ctx.fillRect(0, baseY - 6, W, 30);
  if (lights) for (let i = 0; i < 70; i++) ellipse(ctx, r() * W, baseY - 4 - r() * 40, 2, 2, `rgba(255,210,140,${lights * (0.5 + r() * 0.5)})`);
}
// Water with long reflections.
function paintBosphorus(ctx, y0, y1, top, bottom, seed, glints = 'rgba(255,220,180,0.4)') {
  ctx.fillStyle = linGrad(ctx, 0, y0, 0, y1, [[0, top], [1, bottom]]); ctx.fillRect(0, y0, W, y1 - y0);
  const r = rng(seed);
  for (let i = 0; i < 160; i++) { const y = y0 + Math.pow(r(), 1.4) * (y1 - y0); ctx.fillStyle = glints; ctx.globalAlpha = 0.2 + r() * 0.5; ctx.fillRect(r() * W, y, 20 + r() * 80 * ((y - y0) / (y1 - y0) + 0.3), 2); }
  ctx.globalAlpha = 1;
}

// ===========================================================================
// THE AIRSTRIP — a private hangar on the Asian shore, dawn
// ===========================================================================
function paintStrip(ctx) {
  // the view through the open hangar door: dawn over the Bosphorus and the old city
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 700, [[0, '#3a4a7a'], [0.5, '#d8889a'], [0.8, '#f8c08a'], [1, '#ffe0b0']]); ctx.fillRect(0, 0, W, 760);
  ellipse(ctx, 1500, 640, 60, 60, '#fff0d0'); glow(ctx, 1500, 640, 360, 'rgba(255,210,150,0.6)');
  paintIstanbulSkyline(ctx, 650, '#5a4a6a', 51, 0.4);
  paintBosphorus(ctx, 650, 720, '#e8a88a', '#8a7a9a', 52, 'rgba(255,240,210,0.7)');
  ctx.fillStyle = linGrad(ctx, 0, 716, 0, 820, [[0, '#8a8088'], [1, '#6a6a72']]); ctx.fillRect(0, 716, W, 104);
  for (let x = 1030; x < W; x += 140) { ctx.fillStyle = 'rgba(240,236,228,0.6)'; ctx.fillRect(x, 770, 70, 6); }
  // the hangar: corrugated walls and roof, the great door slid open on the right
  const wall = (x, w) => { ctx.fillStyle = linGrad(ctx, 0, 0, 0, 820, [[0, '#3a3e44'], [1, '#5a5e64']]); ctx.fillRect(x, 0, w, 820); for (let k = x; k < x + w; k += 18) { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(k, 0, 6, 820); } };
  wall(0, 980);
  ctx.fillStyle = '#2a2e34'; ctx.fillRect(0, 0, W, 90);
  for (let x = 40; x < W; x += 220) { ctx.strokeStyle = '#1a1e24'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x, 90); ctx.lineTo(x + 110, 0); ctx.lineTo(x + 220, 90); ctx.stroke(); }
  ctx.fillStyle = '#2a2e34'; ctx.fillRect(980, 90, 40, 730); ctx.fillRect(1880, 90, 40, 730);
  // the sliding door, pushed back against the left wall
  ctx.fillStyle = '#4a4e54'; ctx.fillRect(820, 100, 160, 720); for (let k = 820; k < 980; k += 18) { ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(k, 100, 6, 720); }
  // a tea corner: a little stove, a kettle, a shelf of glasses
  ctx.fillStyle = '#2a1e14'; ctx.fillRect(120, 560, 220, 20); ctx.fillStyle = '#6a4a2a'; ctx.fillRect(140, 580, 16, 240); ctx.fillRect(304, 580, 16, 240);
  for (let k = 0; k < 6; k++) { ctx.fillStyle = 'rgba(200,120,60,0.8)'; ctx.fillRect(140 + k * 32, 530, 18, 28); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(140 + k * 32, 530, 18, 28); }
  ellipse(ctx, 230, 700, 40, 50, '#8a8a90'); ellipse(ctx, 230, 650, 22, 16, '#6a6a70'); glow(ctx, 230, 760, 60, 'rgba(255,120,40,0.5)');
  // a poster: THY, and a sign in Turkish: NO ENTRY
  ctx.fillStyle = '#e8e0cc'; ctx.fillRect(420, 300, 260, 70); ctx.fillStyle = '#b31c2e'; ctx.font = `700 30px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('GİRİLMEZ', 550, 336); ctx.font = `600 16px ${FONT_UI}`; ctx.fillText('ÖZEL HANGAR · PRIVATE', 550, 360);
  // the barrier and guard hut out on the apron
  ctx.fillStyle = '#e8e0cc'; ctx.fillRect(1560, 640, 150, 150); ctx.fillStyle = '#3a4a5a'; poly(ctx, [1550, 640, 1720, 640, 1635, 600], '#3a4a5a');
  ctx.fillStyle = 'rgba(160,190,220,0.7)'; ctx.fillRect(1580, 660, 60, 50);
  ctx.save(); ctx.translate(1710, 740); ctx.rotate(-0.02); for (let k = 0; k < 8; k++) { ctx.fillStyle = k % 2 ? '#f0ece4' : '#c82a2a'; ctx.fillRect(k * 22, 0, 22, 10); } ctx.restore();
  // concrete floor, oil stains, a painted line
  ctx.fillStyle = linGrad(ctx, 0, 820, 0, H, [[0, '#7a7a80'], [1, '#3a3a40']]); ctx.fillRect(0, 820, W, H - 820);
  texture(ctx, 0, 820, W, H - 820, '#2a2a2a', 1400, 30, 53, 0.2);
  for (const [x, y, w] of [[600, 900, 140], [1200, 980, 200], [300, 1000, 120]]) ellipse(ctx, x, y, w, 14, 'rgba(20,20,24,0.35)');
  ctx.fillStyle = 'rgba(232,200,58,0.7)'; ctx.fillRect(0, 836, W, 6);
  // light spilling in through the door
  lightCone(ctx, 1450, 90, 900, 1300, 1000, 'rgba(255,210,160,0.5)', 0.25);
}

// ===========================================================================
// THE GRAND BAZAAR
// ===========================================================================
function paintBazaar(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 820, [[0, '#2a1a12'], [1, '#6a4a2a']]); ctx.fillRect(0, 0, W, 820);
  // the vaulted ceiling: painted arches in red and cream
  for (let k = 0; k < 4; k++) {
    const x0 = k * 640 - 320, x1 = x0 + 640;
    ctx.fillStyle = '#e8dcc0'; ctx.beginPath(); ctx.moveTo(x0, 260); ctx.quadraticCurveTo((x0 + x1) / 2, -60, x1, 260); ctx.lineTo(x1, 0); ctx.lineTo(x0, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#9e1f28'; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(x0, 270); ctx.quadraticCurveTo((x0 + x1) / 2, -50, x1, 270); ctx.stroke();
    ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = 6; ctx.setLineDash([22, 22]); ctx.beginPath(); ctx.moveTo(x0, 270); ctx.quadraticCurveTo((x0 + x1) / 2, -50, x1, 270); ctx.stroke(); ctx.setLineDash([]);
    // painted tulip border on the vault
    for (let j = 0; j < 7; j++) { const t = (j + 1) / 8, x = x0 + t * 640, y = 60 + Math.pow(Math.abs(t - 0.5) * 2, 2) * 150; ellipse(ctx, x, y, 8, 12, '#2a5a9a'); ellipse(ctx, x, y + 14, 4, 6, '#9e1f28'); }
  }
  // three shopfronts under the arches
  const shop = (x, w, col) => { ctx.fillStyle = col; ctx.fillRect(x, 270, w, 550); ctx.fillStyle = '#2a1a0e'; ctx.fillRect(x - 8, 262, w + 16, 16); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x, 278, w, 20); };
  shop(60, 560, '#3a2014'); shop(680, 560, '#1a120c'); shop(1300, 560, '#3a2818');
  // Rıza's carpets hanging in layers
  const r = rng(61);
  const carpet = (x, y, w, h, c1, c2) => {
    ctx.fillStyle = c1; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = c2; ctx.lineWidth = 6; ctx.strokeRect(x + 10, y + 10, w - 20, h - 20);
    ctx.fillStyle = c2; poly(ctx, [x + w / 2, y + 30, x + w - 30, y + h / 2, x + w / 2, y + h - 30, x + 30, y + h / 2], c2);
    ctx.fillStyle = c1; poly(ctx, [x + w / 2, y + 60, x + w - 60, y + h / 2, x + w / 2, y + h - 60, x + 60, y + h / 2], c1);
    ellipse(ctx, x + w / 2, y + h / 2, 12, 12, '#e8dcc0');
    for (let k = 0; k < w; k += 6) { ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x + k, y + h, 2, 12); }
  };
  carpet(80, 300, 170, 300, '#8a1a1e', '#2a3a6a'); carpet(260, 320, 170, 280, '#2a3a6a', '#c9a13b'); carpet(440, 300, 160, 310, '#6a2a1a', '#e8c080');
  ctx.fillStyle = '#e8dcc0'; ctx.fillRect(160, 640, 380, 40); ctx.fillStyle = '#6a2a1a'; ctx.font = `italic 700 30px ${FONT_DISPLAY}`; ctx.textAlign = 'center'; ctx.fillText('Rıza Halı · Carpets', 350, 670);
  // piles of folded carpets on the floor of the shop
  for (let k = 0; k < 5; k++) { ctx.fillStyle = pick3(r, ['#8a1a1e', '#2a3a6a', '#6a2a1a', '#c9a13b']); ctx.fillRect(100, 800 - k * 26, 220, 24); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(100, 820 - k * 26, 220, 4); }
  // the lamp shop: dozens of glass lanterns, glowing
  for (let i = 0; i < 26; i++) {
    const x = 720 + (i % 7) * 76 + (Math.floor(i / 7) % 2) * 36, y = 330 + Math.floor(i / 7) * 110;
    const c = pick3(r, ['rgba(255,80,60,0.9)', 'rgba(80,160,255,0.9)', 'rgba(255,200,60,0.9)', 'rgba(80,220,140,0.9)', 'rgba(220,100,255,0.9)']);
    ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 40); ctx.lineTo(x, y - 20); ctx.stroke();
    ellipse(ctx, x, y, 22, 26, c); glow(ctx, x, y, 60, c.replace('0.9', '0.35'));
    for (let k = 0; k < 6; k++) ellipse(ctx, x - 12 + (k % 3) * 12, y - 8 + Math.floor(k / 3) * 16, 3, 3, 'rgba(255,255,255,0.6)');
    poly(ctx, [x - 10, y + 24, x + 10, y + 24, x, y + 40], '#c9a13b');
  }
  ctx.fillStyle = '#e8dcc0'; ctx.fillRect(820, 700, 280, 40); ctx.fillStyle = '#1a3a6a'; ctx.font = `700 26px ${FONT_UI}`; ctx.fillText('AYDINLATMA · LAMPS', 960, 728);
  // the spice stall: cones of red, yellow and brown, and sacks
  const cone = (x, y, w, h, c) => { poly(ctx, [x - w, y, x + w, y, x, y - h], c); ctx.fillStyle = 'rgba(255,255,255,0.12)'; poly(ctx, [x - w * 0.3, y - h * 0.3, x, y - h, x + w * 0.1, y - h * 0.3], 'rgba(255,255,255,0.12)'); };
  ctx.fillStyle = '#5a3a1e'; ctx.fillRect(1320, 600, 520, 40);
  for (const [x, c] of [[1370, '#b82a14'], [1450, '#e8b020'], [1530, '#7a3a14'], [1610, '#c8601a'], [1690, '#3a6a2a'], [1770, '#a81a3a']]) cone(x, 600, 36, 90, c);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = '#c8a878'; rrect(ctx, 1330 + i * 84, 700, 72, 110, 16); ctx.fill(); ellipse(ctx, 1366 + i * 84, 704, 32, 10, pick3(r, ['#b82a14', '#e8b020', '#7a3a14', '#e8dcc0'])); }
  ctx.fillStyle = '#e8dcc0'; ctx.fillRect(1440, 300, 280, 44); ctx.fillStyle = '#6a2a1a'; ctx.font = `700 28px ${FONT_UI}`; ctx.fillText('BAHARAT · LOKUM', 1580, 332);
  // boxes of Turkish delight on a shelf
  for (let i = 0; i < 6; i++) { ctx.fillStyle = ['#e87a9a', '#f0ece4', '#e8c060'][i % 3]; ctx.fillRect(1360 + i * 76, 400, 60, 44); ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(1360 + i * 76, 400, 60, 8); }
  // hanging lanterns in the lane
  for (const x of [640, 1270]) { ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 150); ctx.lineTo(x, 200); ctx.stroke(); ellipse(ctx, x, 222, 18, 24, 'rgba(255,190,90,0.95)'); glow(ctx, x, 222, 200, 'rgba(255,180,90,0.35)'); }
  // worn stone floor
  ctx.fillStyle = linGrad(ctx, 0, 820, 0, H, [[0, '#8a7a62'], [1, '#4a3e2e']]); ctx.fillRect(0, 820, W, H - 820);
  for (let y = 840, k = 0; y < H; y += 26 + k * 6, k++) { ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); for (let x = (k % 2) * 60; x < W; x += 120 + k * 10) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 26 + k * 6); ctx.stroke(); } }
  texture(ctx, 0, 820, W, H - 820, '#2a1e12', 1200, 20, 62, 0.2);
}

// ===========================================================================
// THE HAMMAM — marble, steam and star-shaped skylights
// ===========================================================================
function paintHammam(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 820, [[0, '#8a8a90'], [0.5, '#c8c4bc'], [1, '#e0dcd4']]); ctx.fillRect(0, 0, W, 820);
  // marble veins
  const r = rng(71);
  ctx.strokeStyle = 'rgba(120,120,130,0.18)'; ctx.lineWidth = 2;
  for (let i = 0; i < 60; i++) { ctx.beginPath(); let x = r() * W, y = 200 + r() * 600; ctx.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.3) * 80; y += (r() - 0.5) * 40; ctx.lineTo(x, y); } ctx.stroke(); }
  // the dome: a shallow arc with star-shaped skylights
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 260, [[0, '#6a6a72'], [1, '#a8a4a0']]);
  ctx.beginPath(); ctx.moveTo(0, 260); ctx.quadraticCurveTo(W / 2, -140, W, 260); ctx.lineTo(W, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 16; i++) {
    const x = 260 + i * 94 + (i % 2) * 20, y = 60 + Math.pow((x - W / 2) / (W / 2), 2) * 140 + (i % 3) * 16;
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#fff8e0'; ctx.beginPath(); for (let k = 0; k < 16; k++) { const rr = k % 2 ? 6 : 14, a = k / 16 * Math.PI * 2; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.fill(); ctx.restore();
  }
  // arches along the wall, each with a marble basin and a brass tap
  for (let k = 0; k < 5; k++) {
    const x = 420 + k * 300;
    ctx.fillStyle = 'rgba(90,90,100,0.35)'; ctx.beginPath(); ctx.moveTo(x - 110, 800); ctx.lineTo(x - 110, 440); ctx.quadraticCurveTo(x, 300, x + 110, 440); ctx.lineTo(x + 110, 800); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - 110, 800); ctx.lineTo(x - 110, 440); ctx.quadraticCurveTo(x, 300, x + 110, 440); ctx.lineTo(x + 110, 800); ctx.stroke();
    ctx.fillStyle = '#e8e4dc'; ctx.beginPath(); ctx.ellipse(x, 700, 60, 20, 0, 0, Math.PI); ctx.fill(); ctx.fillRect(x - 60, 690, 120, 12); ctx.fillStyle = '#d8d4cc'; ctx.fillRect(x - 30, 710, 60, 90);
    ctx.fillStyle = '#c9a13b'; ctx.fillRect(x - 6, 610, 12, 60); ctx.fillRect(x - 20, 660, 40, 10); ellipse(ctx, x, 604, 12, 8, '#c9a13b');
    ctx.fillStyle = '#c9a13b'; ctx.beginPath(); ctx.ellipse(x + 30, 690, 22, 8, 0, 0, Math.PI); ctx.fill(); // a brass bowl
  }
  // the cloakroom on the left: a wooden counter and numbered lockers
  ctx.fillStyle = '#5a3a20'; ctx.fillRect(0, 300, 250, 520);
  for (let k = 0; k < 12; k++) { const x = 16 + (k % 3) * 76, y = 320 + Math.floor(k / 3) * 110; ctx.fillStyle = '#7a5230'; ctx.fillRect(x, y, 66, 96); ctx.fillStyle = '#c9a13b'; ellipse(ctx, x + 54, y + 48, 4, 4, '#c9a13b'); ctx.fillStyle = '#e8dcc0'; ctx.font = `700 16px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText(String(k + 1), x + 33, y + 22); }
  ctx.fillStyle = '#e8e0cc'; ctx.fillRect(20, 250, 210, 40); ctx.fillStyle = '#6a2a1a'; ctx.font = `700 22px ${FONT_UI}`; ctx.fillText('ÇEMBERLİTAŞ HAMAMI', 125, 278);
  // marble floor, wet and shining
  ctx.fillStyle = linGrad(ctx, 0, 820, 0, H, [[0, '#d8d4cc'], [1, '#8a8680']]); ctx.fillRect(0, 820, W, H - 820);
  for (let y = 840, k = 0; y < H; y += 40 + k * 8, k++) { ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  for (let i = 0; i < 30; i++) ellipse(ctx, r() * W, 860 + r() * 200, 40 + r() * 100, 4, 'rgba(255,255,255,0.25)');
}
// The heated marble platform in the middle, drawn in front so people lie on it.
function paintGobekTasi(ctx) {
  ctx.fillStyle = '#ece8e0'; poly(ctx, [640, 900, 1280, 900, 1360, 860, 1320, 820, 600, 820, 560, 860], '#ece8e0');
  ctx.fillStyle = '#c8c4bc'; ctx.fillRect(560, 860, 800, 80);
  poly(ctx, [560, 860, 640, 900, 640, 940, 560, 940], '#b8b4ac'); poly(ctx, [1360, 860, 1280, 900, 1280, 940, 1360, 940], '#b8b4ac');
  ctx.fillStyle = '#d8d4cc'; ctx.fillRect(640, 900, 640, 40);
  for (let x = 680; x < 1260; x += 120) { ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 2; ctx.strokeRect(x, 904, 100, 32); }
}
// Monsieur Dupont, face down under a towel, being pummelled.
function drawDupont(ctx, t, knocked) {
  const bob = knocked ? 0 : Math.abs(Math.sin(t * 5)) * 3;
  ctx.save(); ctx.translate(960, 840 + bob);
  ellipse(ctx, 0, -12, 190, 34, '#e0b494');                   // back and legs
  ellipse(ctx, -210, -16, 38, 32, '#3a2a1e');                  // the back of his head
  ctx.fillStyle = '#f4f0e8'; ctx.fillRect(-190, -24, 120, 34); // a washcloth over the head end
  ctx.fillStyle = '#b31c2e'; rrect(ctx, -40, -44, 160, 50, 12); ctx.fill(); // his peştamal
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; for (let k = 0; k < 6; k++) ctx.fillRect(-36 + k * 26, -44, 6, 50);
  ellipse(ctx, 200, -10, 30, 18, '#e0b494');                   // feet
  // the locker token on a rubber band round his wrist, dangling over the edge
  if (!knocked || !flag('gotToken')) { ellipse(ctx, -120, 20, 10, 10, '#c9a13b'); ctx.fillStyle = '#2a1a0a'; ctx.font = `700 11px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('7', -120, 24); }
  if (knocked) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = `italic 700 30px ${FONT_DISPLAY}`; ctx.fillText('z', -260 + Math.sin(t) * 6, -70 - (t * 20) % 40); ctx.fillText('z', -240, -110 - (t * 20 + 20) % 40); }
  ctx.restore();
}

// ===========================================================================
// THE YALI — the auction salon, at night
// ===========================================================================
function paintSalon(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 820, [[0, '#2a1a12'], [1, '#4a2e1c']]); ctx.fillRect(0, 0, W, 820);
  texture(ctx, 0, 0, W, 820, '#140a06', 1800, 70, 81, 0.2, Math.PI / 2);
  // tall windows onto the Bosphorus at night: the bridge lit up, the moon on the water
  for (const wx of [360, 800, 1240]) {
    ctx.fillStyle = '#1a0e08'; ctx.fillRect(wx - 12, 150, 344, 520);
    ctx.save(); ctx.beginPath(); ctx.rect(wx, 162, 320, 496); ctx.clip();
    ctx.fillStyle = linGrad(ctx, 0, 162, 0, 520, [[0, '#050a18'], [1, '#1a2848']]); ctx.fillRect(wx, 162, 320, 400);
    paintBosphorus(ctx, 520, 660, '#1a2848', '#0a1020', 82 + wx, 'rgba(255,220,160,0.5)');
    ctx.strokeStyle = 'rgba(255,220,160,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(wx - 200, 470); ctx.quadraticCurveTo(wx + 600, 560, wx + 1500, 470); ctx.stroke();
    for (let k = 0; k < 20; k++) ellipse(ctx, wx - 200 + k * 90, 490 + Math.sin(k) * 4, 2, 2, 'rgba(255,230,180,0.9)');
    ctx.fillStyle = '#0a0e18'; ctx.fillRect(wx - 400, 505, 2400, 12);
    ellipse(ctx, 1050 - wx * 0.1, 240, 26, 26, '#eef2f6');
    ctx.restore();
    ctx.strokeStyle = '#1a0e08'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(wx + 160, 162); ctx.lineTo(wx + 160, 658); ctx.moveTo(wx, 400); ctx.lineTo(wx + 320, 400); ctx.stroke();
    ctx.fillStyle = '#7a1a22'; ctx.fillRect(wx - 40, 130, 40, 560); ctx.fillRect(wx + 320, 130, 40, 560);
  }
  // carved cornice
  ctx.fillStyle = '#6a4424'; ctx.fillRect(0, 100, W, 30); for (let x = 0; x < W; x += 40) poly(ctx, [x, 130, x + 40, 130, x + 20, 150], '#5a3418');
  // the auction lectern, and an easel with a photograph of the aircraft
  ctx.fillStyle = '#e8e0cc'; ctx.fillRect(1640, 380, 220, 170); ctx.fillStyle = '#0c0e12'; ctx.fillRect(1650, 390, 200, 150);
  ctx.save(); ctx.translate(1750, 480); ctx.scale(0.2, 0.2); paintJetSide(ctx, 0, 0, 1); ctx.restore();
  ctx.strokeStyle = '#5a3418'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(1680, 800); ctx.lineTo(1750, 380); ctx.lineTo(1820, 800); ctx.stroke();
  ctx.fillStyle = '#c9a13b'; ctx.font = `700 18px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('LOT 1 · NIGHTGLASS', 1750, 574);
  // the telephone table on the left
  ctx.fillStyle = '#5a3418'; ctx.fillRect(120, 700, 220, 16); ctx.fillRect(140, 716, 12, 100); ctx.fillRect(308, 716, 12, 100);
  ctx.fillStyle = '#e8e0cc'; rrect(ctx, 180, 660, 90, 40, 8); ctx.fill(); ctx.fillStyle = '#1a1a1a'; ctx.fillRect(186, 648, 78, 14); ellipse(ctx, 225, 680, 14, 14, '#c9a13b');
  ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(180, 690); ctx.quadraticCurveTo(100, 760, 60, 800); ctx.stroke();
  // the door to the terrace, on the far left
  paintDoor(ctx, 0, 250, 90, 560, '#6a4424', '#2a180a', '#c9a13b', false);
  // Turkish rugs on a polished floor
  ctx.fillStyle = linGrad(ctx, 0, 820, 0, H, [[0, '#5a3418'], [1, '#2a1608']]); ctx.fillRect(0, 820, W, H - 820);
  ctx.fillStyle = '#7a1a22'; ctx.fillRect(300, 860, 1300, 190); ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 6; ctx.strokeRect(320, 875, 1260, 160);
  for (let x = 400; x < 1560; x += 120) poly(ctx, [x, 955, x + 30, 925, x + 60, 955, x + 30, 985], '#2a3a6a');
}
// A row of gilt chairs for the buyers, drawn in front.
function paintGiltChairs(ctx) {
  for (const x of [640, 860, 1080, 1300]) {
    ctx.fillStyle = '#c9a13b'; ctx.fillRect(x - 40, 780, 8, 130); ctx.fillRect(x + 32, 780, 8, 130);
    ctx.fillStyle = '#9e1f28'; rrect(ctx, x - 44, 700, 88, 90, 20); ctx.fill(); ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#9e1f28'; ctx.fillRect(x - 46, 850, 92, 24); ctx.fillStyle = '#c9a13b'; ctx.fillRect(x - 46, 870, 92, 6);
  }
}

// ===========================================================================
// THE TERRACE — on the water
// ===========================================================================
function paintTerrace(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 600, [[0, '#02040c'], [1, '#141e3a']]); ctx.fillRect(0, 0, W, 620);
  const r = rng(91); for (let i = 0; i < 160; i++) ellipse(ctx, r() * W, r() * 400, r() * 1.3 + 0.3, r() * 1.3 + 0.3, `rgba(255,255,255,${0.3 + r() * 0.5})`);
  ellipse(ctx, 1420, 170, 44, 44, '#eef2f6'); glow(ctx, 1420, 170, 260, 'rgba(180,200,255,0.3)');
  // the European shore across the water, lit, and the great bridge
  paintIstanbulSkyline(ctx, 560, '#0c1224', 92, 0.9);
  ctx.strokeStyle = 'rgba(255,220,160,0.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 400); ctx.quadraticCurveTo(700, 520, 1500, 380); ctx.stroke();
  ctx.fillStyle = '#0a0e1a'; ctx.fillRect(0, 440, 1600, 10); ctx.fillRect(360, 300, 20, 260); ctx.fillRect(1260, 290, 20, 270);
  for (let k = 0; k < 30; k++) ellipse(ctx, k * 55, 444, 2, 2, 'rgba(255,230,180,0.9)');
  paintBosphorus(ctx, 560, 820, '#141e3a', '#050810', 93, 'rgba(255,220,160,0.6)');
  reflection(ctx, 1380, 580, 80, 240, 'rgba(220,230,255,0.5)', 0.35);
  // the yalı's wooden wall on the left, lit windows, the door back in
  ctx.fillStyle = '#5a2e1a'; ctx.fillRect(0, 0, 420, 820);
  for (let y = 0; y < 820; y += 22) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, y, 420, 3); }
  for (const [x, y] of [[60, 140], [240, 140]]) { ctx.fillStyle = 'rgba(255,210,140,0.9)'; ctx.fillRect(x, y, 120, 180); ctx.strokeStyle = '#2a140a'; ctx.lineWidth = 8; ctx.strokeRect(x, y, 120, 180); glow(ctx, x + 60, y + 90, 160, 'rgba(255,200,120,0.35)'); }
  paintDoor(ctx, 280, 420, 110, 400, '#7a4424', '#3a1a0a', '#c9a13b', false);
  // the marble balustrade and a lantern
  ctx.fillStyle = '#e8e4dc'; ctx.fillRect(420, 730, 1500, 18); ctx.fillRect(420, 800, 1500, 16);
  for (let x = 440; x < W; x += 40) { ctx.fillStyle = '#d8d4cc'; rrect(ctx, x, 748, 20, 52, 8); ctx.fill(); }
  paintLampPost(ctx, 1500, 820, 560, '#1a1a1a'); glow(ctx, 1500, 578, 140, 'rgba(255,210,140,0.6)');
  // a boat moored at the jetty steps
  ctx.fillStyle = '#e8e0cc'; ctx.beginPath(); ctx.moveTo(1560, 780); ctx.lineTo(1900, 780); ctx.quadraticCurveTo(1880, 830, 1840, 840); ctx.lineTo(1600, 840); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2a4a8a'; ctx.fillRect(1580, 780, 320, 10); ctx.fillStyle = '#6a3a1a'; ctx.fillRect(1700, 740, 90, 40); ctx.fillStyle = 'rgba(160,190,220,0.7)'; ctx.fillRect(1710, 746, 70, 24);
  // flagstones
  ctx.fillStyle = linGrad(ctx, 0, 820, 0, H, [[0, '#7a7068'], [1, '#3a3430']]); ctx.fillRect(0, 820, W, H - 820);
  for (let y = 840, k = 0; y < H; y += 30 + k * 8, k++) { ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
}

// ===========================================================================
// TITLE — Istanbul at sunset, across the Golden Horn
// ===========================================================================
function paintTitle5(x) {
  x.fillStyle = linGrad(x, 0, 0, 0, 760, [[0, '#1a1a3a'], [0.45, '#8a3a5a'], [0.75, '#e8804a'], [1, '#ffd08a']]); x.fillRect(0, 0, W, 780);
  ellipse(x, 1340, 640, 90, 90, '#fff0c8'); glow(x, 1340, 640, 520, 'rgba(255,190,120,0.6)');
  paintIstanbulSkyline(x, 700, '#1a0e1a', 101, 0.6);
  paintBosphorus(x, 700, H, '#c86a4a', '#1a0e1a', 102, 'rgba(255,220,160,0.8)');
  // a ferry crossing, lights on
  x.fillStyle = '#0e0810'; x.fillRect(1500, 820, 260, 40); x.fillRect(1540, 790, 160, 30); x.fillRect(1600, 760, 20, 30);
  for (let k = 0; k < 8; k++) { x.fillStyle = 'rgba(255,210,140,0.9)'; x.fillRect(1550 + k * 18, 800, 8, 8); }
  // the jet, a black splinter high over the city
  x.save(); x.translate(760, 220); x.rotate(-0.06); x.scale(0.3, 0.3); paintJetSide(x, 0, 0, 1, { gearUp: true }); x.restore();
  x.fillStyle = linGrad(x, 0, 0, 1200, 0, [[0, 'rgba(10,4,12,0.78)'], [0.6, 'rgba(10,4,12,0.45)'], [1, 'rgba(10,4,12,0)']]); x.fillRect(0, 0, 1200, H);
}
