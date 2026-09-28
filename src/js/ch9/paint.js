// ---------------------------------------------------------------------------
// Chapter Nine paint — the Swiss Alps: the village square of Grindelhorn at
// dusk with the cable car climbing to the glacier, Frau Zimmerli's cuckoo
// clock workshop, the bank's vault inside the mountain, and the title card.
// ---------------------------------------------------------------------------

// Snowy peaks against the sky, with the glacier catching the last light.
function paintAlps(ctx, y0, y1, dusk = true) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, y1, dusk ? [[0, '#1a2448'], [0.6, '#6a5a8a'], [1, '#e8a888']] : [[0, '#04060c'], [1, '#1a2238']]); ctx.fillRect(0, 0, W, y1);
  const peaks = [[0, y0 + 160], [220, y0 + 40], [420, y0 + 190], [700, y0 - 60], [980, y0 + 140], [1240, y0 + 20], [1480, y0 + 180], [1720, y0 + 70], [W, y0 + 200]];
  ctx.fillStyle = dusk ? '#6a7090' : '#2a3048';
  ctx.beginPath(); ctx.moveTo(0, y1); for (const [x, y] of peaks) ctx.lineTo(x, y); ctx.lineTo(W, y1); ctx.fill();
  // snowcaps and the glacier
  ctx.fillStyle = dusk ? '#f4e8f0' : '#c8d0e0';
  for (let i = 1; i < peaks.length - 1; i++) {
    const [x, y] = peaks[i], [xa, ya] = peaks[i - 1], [xb, yb] = peaks[i + 1];
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (xa - x) * 0.3, y + (ya - y) * 0.3 + 10); ctx.lineTo(x + (xa - x) * 0.18, y + (ya - y) * 0.18 + 26); ctx.lineTo(x, y + 30); ctx.lineTo(x + (xb - x) * 0.2, y + (yb - y) * 0.2 + 24); ctx.lineTo(x + (xb - x) * 0.32, y + (yb - y) * 0.32 + 8); ctx.fill();
  }
  poly(ctx, [700, y0 - 40, 744, y0 + 70, 730, y0 + 150, 760, y0 + 250, 650, y0 + 250, 676, y0 + 150, 664, y0 + 70], dusk ? 'rgba(210,235,255,0.75)' : 'rgba(150,180,220,0.5)');
  ctx.strokeStyle = dusk ? 'rgba(120,160,200,0.6)' : 'rgba(80,110,150,0.5)'; ctx.lineWidth = 2; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(680 + k * 12, y0 + 40 + k * 20); ctx.lineTo(670 + k * 16, y0 + 240); ctx.stroke(); }
}

// A Swiss chalet: dark wood, white plaster below, a deep roof with snow on it.
function paintChalet(ctx, x, base, w, h, seed, lit = 0.6) {
  const r = rng(seed);
  ctx.fillStyle = '#e8e2d6'; ctx.fillRect(x, base - h * 0.4, w, h * 0.4);
  ctx.fillStyle = '#6a3a1a'; ctx.fillRect(x, base - h, w, h * 0.6);
  for (let k = 0; k < w; k += 14) { ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(x + k, base - h, 2, h * 0.6); }
  ctx.fillStyle = '#3a2010'; ctx.beginPath(); ctx.moveTo(x - 40, base - h + 10); ctx.lineTo(x + w / 2, base - h - w * 0.35); ctx.lineTo(x + w + 40, base - h + 10); ctx.fill();
  ctx.fillStyle = '#f4f6f8'; ctx.beginPath(); ctx.moveTo(x - 40, base - h + 4); ctx.lineTo(x + w / 2, base - h - w * 0.35 - 6); ctx.lineTo(x + w + 40, base - h + 4); ctx.lineTo(x + w + 30, base - h + 14); ctx.lineTo(x + w / 2, base - h - w * 0.35 + 8); ctx.lineTo(x - 30, base - h + 14); ctx.fill();
  // a balcony with carved rails, and windows with red geranium boxes (frozen)
  ctx.fillStyle = '#4a2a10'; ctx.fillRect(x - 10, base - h * 0.62, w + 20, 10); for (let k = 0; k < w + 20; k += 16) ctx.fillRect(x - 10 + k, base - h * 0.62, 6, 30);
  for (let k = 0; k < Math.floor(w / 80); k++) {
    const wx = x + 24 + k * 80, wy = base - h * 0.9;
    ctx.fillStyle = r() < lit ? '#ffd890' : '#2a2a3a'; ctx.fillRect(wx, wy, 44, 50);
    ctx.fillStyle = '#e8e2d6'; ctx.fillRect(wx - 4, wy - 4, 52, 4); ctx.fillStyle = '#9e1f28'; ctx.fillRect(wx - 2, wy + 50, 48, 8);
  }
}

// ===========================================================================
// THE VILLAGE — Grindelhorn, the square at dusk
// ===========================================================================
function paintVillage(ctx) {
  paintAlps(ctx, 120, 560, true);
  // a snowfield and pine forest between the peaks and the village
  ctx.fillStyle = linGrad(ctx, 0, 480, 0, 850, [[0, '#c8d0e0'], [1, '#e8eef4']]); ctx.fillRect(0, 500, W, 350);
  const rr = rng(404);
  for (let i = 0; i < 70; i++) { const px = rr() * W, py = 540 + rr() * 200, ph = 50 + rr() * 90; poly(ctx, [px - ph * 0.3, py, px + ph * 0.3, py, px, py - ph], '#1e3a2e'); poly(ctx, [px - ph * 0.18, py - ph * 0.45, px + ph * 0.18, py - ph * 0.45, px, py - ph], '#e8eef4'); }
  // the cable car climbing to the glacier on the right
  ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(1720, 480); ctx.lineTo(760, 150); ctx.stroke();
  ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(1720, 492); ctx.lineTo(760, 162); ctx.stroke();
  ctx.fillStyle = '#c82a2a'; ctx.fillRect(1196, 264, 50, 40); ctx.fillStyle = '#ffe8a0'; ctx.fillRect(1202, 272, 38, 14); ctx.fillStyle = '#2a2a2a'; ctx.fillRect(1218, 244, 4, 20);
  ctx.fillStyle = '#3a3a44'; ctx.fillRect(740, 130, 40, 40); // the top station, up on the glacier
  // chalets round the square, and the church
  ctx.fillStyle = '#e8e2d6'; ctx.fillRect(900, 280, 80, 300); ctx.fillStyle = '#3a4a3a'; poly(ctx, [890, 280, 990, 280, 940, 170], '#3a4a3a'); ctx.fillStyle = '#c9a13b'; ellipse(ctx, 940, 320, 20, 20, '#c9a13b');
  paintChalet(ctx, 40, 840, 420, 380, 401, 0.6);
  paintChalet(ctx, 1040, 820, 380, 300, 402, 0.7);
  // the valley station of the cable car
  ctx.fillStyle = '#8a8a90'; ctx.fillRect(1480, 440, 440, 400); ctx.fillStyle = '#5a5a60'; ctx.fillRect(1480, 430, 440, 20);
  ctx.fillStyle = '#c82a2a'; ctx.fillRect(1560, 520, 180, 110); ctx.fillStyle = '#ffe8a0'; ctx.fillRect(1572, 532, 156, 40); // a cabin, parked
  ctx.fillStyle = '#e8e2d6'; ctx.fillRect(1520, 460, 360, 40); ctx.fillStyle = '#1a1a1a'; ctx.font = `700 26px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('GLETSCHERBAHN · PRIVAT', 1700, 490);
  paintDoor(ctx, 1770, 620, 110, 220, '#5a5a60', '#3a3a40', '#c8c8c8', false);
  // Frau Zimmerli's shop: a big cuckoo clock over the door
  ctx.fillStyle = '#6a3a1a'; ctx.fillRect(600, 540, 360, 300); ctx.fillStyle = '#e8e2d6'; ctx.fillRect(620, 640, 150, 150); ctx.fillStyle = '#ffd890'; ctx.fillRect(630, 650, 130, 130);
  for (let k = 0; k < 3; k++) for (let j = 0; j < 2; j++) { ctx.fillStyle = '#6a3a1a'; ctx.fillRect(640 + k * 40, 665 + j * 55, 26, 34); ellipse(ctx, 653 + k * 40, 690 + j * 55, 8, 8, '#f4f0e8'); }
  paintDoor(ctx, 800, 620, 130, 220, '#8a5a30', '#5a3a1a', '#c9a13b', false);
  ctx.fillStyle = '#4a2a10'; poly(ctx, [700, 540, 860, 540, 780, 470], '#4a2a10'); ellipse(ctx, 780, 530, 30, 30, '#f4f0e8'); ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(780, 530); ctx.lineTo(780, 510); ctx.moveTo(780, 530); ctx.lineTo(794, 536); ctx.stroke();
  ctx.fillStyle = '#e8e2d6'; ctx.fillRect(606, 566, 200, 44); ctx.fillStyle = '#6a2a1a'; ctx.font = `italic 700 22px ${FONT_DISPLAY}`; ctx.fillText('Zimmerli · Uhren', 706, 596);
  // the ski school hut on the left, skis in a rack
  ctx.fillStyle = '#c82a2a'; ctx.fillRect(40, 900, 0, 0);
  for (let k = 0; k < 8; k++) { ctx.fillStyle = ['#c82a2a', '#2a4a8a', '#f0b35b', '#1a1a1a'][k % 4]; ctx.save(); ctx.translate(470 + k * 16, 840); ctx.rotate(-0.06); ctx.fillRect(0, -200, 10, 200); ctx.restore(); }
  ctx.fillStyle = '#4a2a10'; ctx.fillRect(460, 700, 150, 10);
  ctx.fillStyle = '#e8e2d6'; ctx.fillRect(120, 480, 280, 44); ctx.fillStyle = '#c82a2a'; ctx.font = `700 26px ${FONT_UI}`; ctx.fillText('SKISCHULE SEPP', 260, 512);
  // lamps, and the snow
  paintLampPost(ctx, 1000, 860, 580, '#1a1a1a'); glow(ctx, 1000, 598, 140, 'rgba(255,220,160,0.5)');
  ctx.fillStyle = linGrad(ctx, 0, 840, 0, H, [[0, '#e8eef4'], [1, '#b0bccc']]); ctx.fillRect(0, 840, W, H - 840);
  texture(ctx, 0, 840, W, H - 840, '#8a98ac', 700, 20, 403, 0.18);
}

// ===========================================================================
// THE WORKSHOP — Zimmerli, Uhren
// ===========================================================================
function paintWorkshop(ctx) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 840, [[0, '#4a2e18'], [1, '#6a4428']]); ctx.fillRect(0, 0, W, 840);
  for (let x = 0; x < W; x += 60) { ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x, 0, 3, 840); }
  ctx.fillStyle = '#3a2010'; ctx.fillRect(0, 0, W, 60); for (let x = 30; x < W; x += 260) ctx.fillRect(x, 60, 40, 30);
  // a wall of cuckoo clocks (their pendulums swing in the scene)
  const r = rng(411);
  for (let row = 0; row < 3; row++) for (let k = 0; k < 6; k++) {
    const x = 110 + k * 140 + (row % 2) * 40, y = 170 + row * 180, w = 90 + r() * 20;
    ctx.fillStyle = pick3(r, ['#6a3a1a', '#5a2e14', '#7a4a24']); poly(ctx, [x - w / 2 - 10, y, x + w / 2 + 10, y, x, y - 40], ctx.fillStyle);
    ctx.fillRect(x - w / 2, y, w, 90); ellipse(ctx, x, y + 50, 28, 28, '#f4f0e8');
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + 50); ctx.lineTo(x + Math.cos(r() * 6) * 18, y + 50 + Math.sin(r() * 6) * 18); ctx.moveTo(x, y + 50); ctx.lineTo(x + Math.cos(r() * 6) * 12, y + 50 + Math.sin(r() * 6) * 12); ctx.stroke();
    ctx.fillStyle = '#2a1a0a'; ctx.fillRect(x - 10, y + 6, 20, 14); // the little door
    for (let l = 0; l < 3; l++) { ellipse(ctx, x - 16 + l * 16, y + 100, 4, 12, '#c9a13b'); } // pine-cone weights
  }
  // the workbench with its lamp and tools, and a tray of spare cuckoos
  ctx.fillStyle = '#5a3418'; ctx.fillRect(1180, 700, 520, 24); ctx.fillStyle = '#3a2010'; ctx.fillRect(1200, 724, 20, 116); ctx.fillRect(1660, 724, 20, 116);
  ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(1640, 700); ctx.lineTo(1620, 620); ctx.lineTo(1580, 630); ctx.stroke(); ellipse(ctx, 1578, 632, 24, 12, '#2a3a2a', 0.4); glow(ctx, 1570, 660, 140, 'rgba(255,240,190,0.4)');
  ctx.fillStyle = '#8a6a3a'; ctx.fillRect(1260, 670, 120, 30);
  for (let k = 0; k < 4; k++) { const bx = 1276 + k * 26; ellipse(ctx, bx, 668, 10, 7, '#6a4a2a'); poly(ctx, [bx + 8, 666, bx + 16, 668, bx + 8, 670], '#e8902a'); }
  for (let k = 0; k < 5; k++) { ctx.fillStyle = '#8a8e92'; ctx.fillRect(1420 + k * 22, 684, 4, 16); }
  // Brunner's clock, on the wall by the window: stopped, always, at a quarter to twelve
  ctx.fillStyle = '#3a2010'; poly(ctx, [1760, 320, 1900, 320, 1830, 260], '#3a2010'); ctx.fillRect(1770, 320, 120, 130); ellipse(ctx, 1830, 385, 44, 44, '#f4f0e8');
  ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1830, 385); ctx.lineTo(1830, 353); ctx.moveTo(1830, 385); ctx.lineTo(1804, 385); ctx.stroke();
  ctx.strokeStyle = '#9e1f28'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(1830, 385); ctx.lineTo(1830 + Math.cos(-Math.PI / 2 + Math.PI) * 38, 385 + Math.sin(-Math.PI / 2 + Math.PI) * 38); ctx.stroke();
  ctx.fillStyle = '#c9a13b'; ctx.font = `700 14px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('BRUNNER', 1830, 470);
  // the window, snow falling outside
  ctx.fillStyle = '#1a2238'; ctx.fillRect(1740, 520, 150, 180); ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 8; ctx.strokeRect(1740, 520, 150, 180); ctx.beginPath(); ctx.moveTo(1815, 520); ctx.lineTo(1815, 700); ctx.stroke();
  // plank floor
  ctx.fillStyle = linGrad(ctx, 0, 840, 0, H, [[0, '#7a5230'], [1, '#4a3018']]); ctx.fillRect(0, 840, W, H - 840);
  for (let y = 850; y < H; y += 26) { ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(0, y, W, 2); }
}
// Vasko's clock: a grand one on a stand, with a cuckoo that is not a cuckoo.
function paintVaskoClock(ctx, t, swapped) {
  const x = 1060, y = 520;
  ctx.fillStyle = '#2a1a0a'; ctx.fillRect(x - 12, y + 150, 24, 180); ctx.fillRect(x - 70, y + 320, 140, 20);
  ctx.fillStyle = '#4a2a12'; poly(ctx, [x - 110, y, x + 110, y, x, y - 80], '#4a2a12'); ctx.fillRect(x - 100, y, 200, 160);
  for (let k = 0; k < 7; k++) { ctx.fillStyle = '#3a2010'; poly(ctx, [x - 96 + k * 32, y - 4, x - 80 + k * 32, y - 4, x - 88 + k * 32, y - 30 + (k % 2) * 12], '#3a2010'); } // carved leaves
  ellipse(ctx, x, y + 90, 50, 50, '#f4f0e8');
  ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y + 90); ctx.lineTo(x, y + 52); ctx.moveTo(x, y + 90); ctx.lineTo(x + 2, y + 62); ctx.stroke(); // nearly noon
  // the little door, and the red and yellow wires nobody is supposed to notice
  ctx.fillStyle = '#1a0a00'; ctx.fillRect(x - 16, y + 12, 32, 24);
  if (!swapped) { ctx.strokeStyle = '#d82a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 16, y + 30); ctx.quadraticCurveTo(x + 60, y + 50, x + 90, y + 150); ctx.stroke(); ctx.strokeStyle = '#f0c030'; ctx.beginPath(); ctx.moveTo(x + 16, y + 34); ctx.quadraticCurveTo(x + 50, y + 70, x + 70, y + 158); ctx.stroke(); }
  // pendulum and pine-cone weights
  const sw = Math.sin(t * 3) * 0.3;
  ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + 160); ctx.lineTo(x + Math.sin(sw) * 110, y + 160 + Math.cos(sw) * 110); ctx.stroke(); ellipse(ctx, x + Math.sin(sw) * 110, y + 160 + Math.cos(sw) * 110, 14, 14, '#c9a13b');
  for (const dx of [-40, 40]) { ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + dx, y + 160); ctx.lineTo(x + dx, y + 250); ctx.stroke(); ellipse(ctx, x + dx, y + 262, 10, 20, '#c9a13b'); }
}
// Pendulums swinging on the wall of clocks.
function drawPendulums(ctx, t) {
  const r = rng(411);
  for (let row = 0; row < 3; row++) for (let k = 0; k < 6; k++) {
    const x = 110 + k * 140 + (row % 2) * 40, y = 170 + row * 180; r(); r(); r(); r();
    const sw = Math.sin(t * 2.4 + k + row) * 0.35;
    ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + 90); ctx.lineTo(x + Math.sin(sw) * 50, y + 90 + Math.cos(sw) * 50); ctx.stroke();
    ellipse(ctx, x + Math.sin(sw) * 50, y + 90 + Math.cos(sw) * 50, 7, 7, '#c9a13b');
  }
}

// ===========================================================================
// THE VAULT — inside the mountain, beside the hangar
// ===========================================================================
function paintVault(ctx, open) {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, 840, [[0, '#3a3e44'], [1, '#5a5e64']]); ctx.fillRect(0, 0, W, 840);
  texture(ctx, 0, 0, W, 840, '#1a1e24', 3000, 40, 421, 0.35); // raw rock
  // the tunnel's steel ribs and lights
  for (let x = 60; x < W; x += 300) { ctx.fillStyle = '#6a6e74'; ctx.fillRect(x, 0, 24, 840); ctx.fillStyle = '#fff4d8'; ctx.fillRect(x + 4, 80, 16, 30); glow(ctx, x + 12, 95, 120, 'rgba(255,240,200,0.3)'); }
  // the great round vault door
  const cx = 520, cy = 500;
  if (open) paintVaultInside(ctx);
  else {
    ctx.fillStyle = '#9a9ea4'; ctx.beginPath(); ctx.arc(cx, cy, 260, 0, 7); ctx.fill();
    ctx.fillStyle = '#7a7e84'; ctx.beginPath(); ctx.arc(cx, cy, 220, 0, 7); ctx.fill();
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; ellipse(ctx, cx + Math.cos(a) * 240, cy + Math.sin(a) * 240, 10, 10, '#5a5e64'); }
    ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 12; for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + 0.4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 120, cy + Math.sin(a) * 120); ctx.stroke(); }
    ellipse(ctx, cx, cy, 44, 44, '#c9a13b');
  }
  // the keypad and the key slot
  ctx.fillStyle = '#2a2a2e'; ctx.fillRect(820, 440, 90, 130); for (let k = 0; k < 12; k++) { ctx.fillStyle = '#c8ccd0'; ctx.fillRect(832 + (k % 3) * 26, 470 + Math.floor(k / 3) * 24, 18, 16); }
  ctx.fillStyle = '#6aff8a'; ctx.fillRect(830, 450, 70, 12);
  // the steel door to the hangar, with a window onto something black and enormous
  ctx.fillStyle = '#5a5e64'; ctx.fillRect(1320, 260, 460, 580); ctx.strokeStyle = '#3a3e44'; ctx.lineWidth = 8; ctx.strokeRect(1324, 264, 452, 572);
  ctx.fillStyle = '#e8c830'; for (let k = 0; k < 10; k++) poly(ctx, [1324 + k * 46, 836, 1348 + k * 46, 836, 1370 + k * 46, 800, 1346 + k * 46, 800], '#e8c830');
  ctx.fillStyle = '#0a0c10'; ctx.fillRect(1400, 340, 300, 180);
  if (typeof paintJetSide === 'function') { ctx.save(); ctx.beginPath(); ctx.rect(1400, 340, 300, 180); ctx.clip(); paintJetSide(ctx, 1560, 500, 0.35, {}); ctx.restore(); }
  ctx.fillStyle = 'rgba(160,200,255,0.1)'; ctx.fillRect(1400, 340, 300, 180);
  ctx.fillStyle = '#e8e2d6'; ctx.fillRect(1420, 560, 260, 44); ctx.fillStyle = '#d82a2a'; ctx.font = `700 24px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('HANGAR · ZUTRITT VERBOTEN', 1550, 590);
  // a steel desk with the ledger lamp
  ctx.fillStyle = '#6a6e74'; ctx.fillRect(900, 700, 300, 20); ctx.fillStyle = '#4a4e54'; ctx.fillRect(920, 720, 16, 120); ctx.fillRect(1164, 720, 16, 120);
  ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1150, 700); ctx.lineTo(1130, 640); ctx.lineTo(1100, 646); ctx.stroke(); ellipse(ctx, 1098, 648, 20, 10, '#2a3a2a', 0.4); glow(ctx, 1090, 670, 120, 'rgba(255,240,190,0.35)');
  // concrete floor
  ctx.fillStyle = linGrad(ctx, 0, 840, 0, H, [[0, '#6a6e74'], [1, '#3a3e44']]); ctx.fillRect(0, 840, W, H - 840);
  texture(ctx, 0, 840, W, H - 840, '#2a2e34', 800, 20, 422, 0.25);
}
function paintVaultShut(ctx) { paintVault(ctx, false); }
// The vault standing open: deposit boxes, the ledger on its lectern, the door swung back.
function paintVaultInside(ctx) {
  const cx = 520, cy = 500;
  ctx.fillStyle = '#1a1c20'; ctx.beginPath(); ctx.arc(cx, cy, 250, 0, 7); ctx.fill();
  for (let row = 0; row < 5; row++) for (let k = 0; k < 6; k++) { ctx.fillStyle = '#8a8e94'; ctx.fillRect(cx - 190 + k * 64, cy - 170 + row * 70, 58, 62); ellipse(ctx, cx - 161 + k * 64, cy - 139 + row * 70, 5, 5, '#c9a13b'); }
  ctx.fillStyle = '#4a3a2a'; ctx.fillRect(cx - 40, cy + 60, 80, 130); ctx.fillStyle = '#e8e0c8'; poly(ctx, [cx - 70, cy + 60, cx + 70, cy + 60, cx + 60, cy + 30, cx - 60, cy + 30], '#e8e0c8');
  ctx.strokeStyle = '#6a6a6a'; ctx.lineWidth = 1; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(cx - 50, cy + 38 + k * 5); ctx.lineTo(cx + 50, cy + 38 + k * 5); ctx.stroke(); }
  glow(ctx, cx, cy + 40, 140, 'rgba(255,240,200,0.25)');
  ctx.save(); ctx.translate(cx + 250, cy); ctx.scale(0.35, 1);
  ctx.fillStyle = '#9a9ea4'; ctx.beginPath(); ctx.arc(0, 0, 260, 0, 7); ctx.fill(); ctx.fillStyle = '#7a7e84'; ctx.beginPath(); ctx.arc(0, 0, 220, 0, 7); ctx.fill(); ctx.restore();
}

// ===========================================================================
// TITLE — the Alps by moonlight, a cable car hanging over the valley
// ===========================================================================
function paintTitle9(x) {
  paintAlps(x, 200, 820, false);
  ellipse(x, 1500, 180, 50, 50, '#eef2f6'); glow(x, 1500, 180, 320, 'rgba(180,200,255,0.3)');
  x.strokeStyle = '#1a1a1a'; x.lineWidth = 3; x.beginPath(); x.moveTo(-20, 700); x.lineTo(W + 20, 260); x.stroke(); x.lineWidth = 2; x.beginPath(); x.moveTo(-20, 712); x.lineTo(W + 20, 272); x.stroke();
  x.fillStyle = '#c82a2a'; x.fillRect(1180, 460, 110, 90); x.fillStyle = '#ffe8a0'; x.fillRect(1192, 474, 86, 34); x.fillStyle = '#1a1a1a'; x.fillRect(1230, 420, 8, 40);
  x.fillStyle = linGrad(x, 0, 820, 0, H, [[0, '#c8d4e4'], [1, '#6a7a90']]); x.fillRect(0, 820, W, H - 820);
  const r = rng(431); for (let i = 0; i < 18; i++) { const px = r() * W, ph = 60 + r() * 120; x.fillStyle = '#0e1a14'; poly(x, [px - 30, 860, px + 30, 860, px, 860 - ph], '#0e1a14'); }
  x.fillStyle = linGrad(x, 1200, 0, 0, 0, [[0, 'rgba(2,4,10,0)'], [1, 'rgba(2,4,10,0.8)']]); x.fillRect(0, 0, 1200, H);
}
