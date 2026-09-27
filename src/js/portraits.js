// ---------------------------------------------------------------------------
// Portraits — close-up faces shown while a character speaks. Lips follow the
// loudness of the recorded voice, eyes blink and drift, brows react.
// Drawn in a 400×460 unit box, face centred at (200, 210), looking slightly
// to the right; mirrored for characters on the right of the screen.
// ---------------------------------------------------------------------------
const FACES = {
  jack: {
    skin: '#d9a47f', skinDark: '#a8704f', hair: '#2a1d16', hairHi: '#6b4a34', hairStyle: 'slick', eye: '#4a6a7a',
    brow: 10, jaw: 1.0, cheek: 0.9, nose: 'straight', lip: '#b06a5a', stubble: 0.18, age: 0.2,
    outfit: 'tux', collar: '#f1ede4', coat: '#16171b', tie: '#0a0a0a', trenchCoat: '#b39a73',
  },
  control: null, narrator: null,
  ilse: {
    skin: '#ecc7ad', skinDark: '#c08f74', hair: '#efe2bb', hairHi: '#fff6da', hairStyle: 'bob', eye: '#5b7f6a',
    brow: 6, jaw: 0.86, cheek: 1.1, nose: 'small', lip: '#a3182a', female: true, blush: 0.35, age: 0.1,
    outfit: 'redcoat', coat: '#9c1f2e', fur: '#e8dfd0', earrings: true, beauty: true,
  },
  franz: {
    skin: '#d49c78', skinDark: '#a06a4c', hair: '#5a5550', hairHi: '#8a847c', hairStyle: 'bald', eye: '#3a2a20',
    brow: 12, jaw: 1.15, cheek: 1.2, nose: 'round', lip: '#a0604e', mustache: '#3a3632', mustacheStyle: 'walrus', age: 0.6,
    outfit: 'vest', coat: '#2b2522', collar: '#ebe5d8', tie: '#1a1a1a',
  },
  vendor: {
    skin: '#c99372', skinDark: '#94624a', hair: '#9a9892', hairHi: '#c8c6c0', hairStyle: 'flatcap', cap: '#4a4238', eye: '#4a5a4a',
    brow: 12, jaw: 1.05, cheek: 1.0, nose: 'long', lip: '#9a5c4a', stubble: 0.5, age: 0.95,
    outfit: 'jacket', coat: '#4f5446', collar: '#9c8f7a', scarf: '#7a2a24',
  },
  guard: {
    skin: '#d09c7a', skinDark: '#9c6a4e', hair: '#2a2622', hairHi: '#4a4540', hairStyle: 'cap', cap: '#3d4436', capBand: '#8e1c24', eye: '#3a3a3a',
    brow: 14, jaw: 1.25, cheek: 0.9, nose: 'broad', lip: '#9c5e4c', stubble: 0.35, age: 0.35,
    outfit: 'uniform', coat: '#4a5240', trim: '#9e1f28',
  },
  waiter: {
    skin: '#dcac8a', skinDark: '#a8785a', hair: '#1c1612', hairHi: '#4a3a2a', hairStyle: 'slick', eye: '#3a2a1a',
    brow: 8, jaw: 0.95, cheek: 0.9, nose: 'straight', lip: '#b27060', mustache: '#1c1612', mustacheStyle: 'pencil', age: 0.3,
    outfit: 'waiter', coat: '#ece6da', collar: '#f4f0e8', tie: '#0a0a0a',
  },
  baron: {
    skin: '#e6a58f', skinDark: '#b0705c', hair: '#dad6ce', hairHi: '#ffffff', hairStyle: 'bald', eye: '#5a7a9a',
    brow: 13, jaw: 1.2, cheek: 1.35, nose: 'bulb', lip: '#b0605a', mustache: '#e8e4dc', mustacheStyle: 'handlebar', age: 0.85, flushed: 0.6,
    outfit: 'tails', coat: '#1e1f26', collar: '#f1ede4', tie: '#f1ede4', sash: '#8a1a2c', monocle: true,
  },
};
FACES.gateGuard = FACES.stairGuard = FACES.guard;
FACES.officeGuard = { ...FACES.guard, jaw: 1.15, nose: 'straight', stubble: 0.2, eye: '#5a4a3a' };

function drawPortrait(ctx, id, px, py, size, mouth, t, opts = {}) {
  const F = FACES[id];
  if (!F) return;
  const s = size / 400;
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(s * (opts.mirror ? -1 : 1), s);
  if (opts.mirror) ctx.translate(-400, 0);

  // Card background with a soft key light.
  ctx.save();
  rrect(ctx, 0, 0, 400, 460, 18); ctx.clip();
  ctx.fillStyle = radGrad(ctx, 150, 170, 20, 420, [[0, opts.bgHi || '#3a3026'], [1, opts.bg || '#07090c']]);
  ctx.fillRect(0, 0, 400, 460);

  const blink = ((t * 0.9 + (opts.seed || 0)) % 4) < 0.12;
  const look = Math.sin(t * 0.6 + (opts.seed || 0)) * 3;
  const nod = Math.sin(t * 1.3) * 1.5 + mouth * 2;
  ctx.translate(0, nod);

  drawBust(ctx, F);
  // neck
  ctx.fillStyle = linGrad(ctx, 150, 0, 250, 0, [[0, F.skinDark], [0.6, F.skin], [1, F.skinDark]]);
  ctx.beginPath(); ctx.moveTo(160, 290); ctx.lineTo(240, 290); ctx.lineTo(248, 360); ctx.lineTo(152, 360); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(152, 300, 96, 22);
  if (F.outfit !== 'redcoat' && F.outfit !== 'jacket') drawCollar(ctx, F);

  drawHairBack(ctx, F);
  drawFace(ctx, F, mouth, blink, look, t);
  drawHairFront(ctx, F, t);
  if (F.outfit === 'redcoat' || F.outfit === 'jacket') drawCollar(ctx, F);

  // rim light from the scene's key light
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = linGrad(ctx, 280, 0, 400, 0, [[0, 'rgba(0,0,0,0)'], [1, opts.rim || 'rgba(255,190,120,0.18)']]);
  ctx.fillRect(0, 0, 400, 460);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();

  // frame
  ctx.strokeStyle = 'rgba(240,179,91,0.55)'; ctx.lineWidth = 3;
  rrect(ctx, 0, 0, 400, 460, 18); ctx.stroke();
  ctx.restore();
}

function drawBust(ctx, F) {
  const c = F.coat;
  // shoulders
  ctx.fillStyle = linGrad(ctx, 0, 0, 400, 0, [[0, shadeColor(c, -0.35)], [0.55, c], [1, shadeColor(c, -0.15)]]);
  ctx.beginPath(); ctx.moveTo(20, 470); ctx.bezierCurveTo(30, 360, 110, 330, 170, 322); ctx.lineTo(230, 322);
  ctx.bezierCurveTo(290, 330, 370, 360, 380, 470); ctx.fill();
  // fabric folds
  ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(90, 380); ctx.quadraticCurveTo(110, 420, 100, 470); ctx.moveTo(310, 380); ctx.quadraticCurveTo(292, 420, 300, 470); ctx.stroke();
  if (F.outfit === 'tux' || F.outfit === 'tails' || F.outfit === 'waiter') {
    // shirt front, lapels, buttons, pocket square
    ctx.fillStyle = F.collar; ctx.beginPath(); ctx.moveTo(165, 330); ctx.lineTo(235, 330); ctx.lineTo(215, 470); ctx.lineTo(185, 470); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(190 + i * 5, 350); ctx.lineTo(192 + i * 4, 470); ctx.stroke(); } // pleats
    for (let i = 0; i < 3; i++) ellipse(ctx, 200, 372 + i * 32, 4, 4, F.outfit === 'waiter' ? '#d9d2c4' : '#1a1a1a'); // studs
    const lap = F.outfit === 'waiter' ? shadeColor(c, -0.12) : shadeColor(c, 0.12);
    ctx.fillStyle = lap;
    ctx.beginPath(); ctx.moveTo(165, 328); ctx.lineTo(120, 350); ctx.lineTo(172, 470); ctx.lineTo(190, 470); ctx.fill();
    ctx.beginPath(); ctx.moveTo(235, 328); ctx.lineTo(280, 350); ctx.lineTo(228, 470); ctx.lineTo(210, 470); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.moveTo(122, 352); ctx.lineTo(172, 468); ctx.moveTo(278, 352); ctx.lineTo(228, 468); ctx.stroke();
    if (F.outfit === 'tux') { ctx.fillStyle = '#f4f0e8'; ctx.beginPath(); ctx.moveTo(290, 412); ctx.lineTo(330, 406); ctx.lineTo(318, 424); ctx.lineTo(296, 426); ctx.fill(); } // pocket square
    if (F.outfit === 'waiter') for (let i = 0; i < 2; i++) ellipse(ctx, 160 + i * 80, 440, 6, 6, '#c9a13b');
  }
  if (F.outfit === 'vest') {
    ctx.fillStyle = F.collar; ctx.beginPath(); ctx.moveTo(90, 470); ctx.bezierCurveTo(100, 360, 150, 335, 200, 335); ctx.bezierCurveTo(250, 335, 300, 360, 310, 470); ctx.fill();
    ctx.fillStyle = F.coat;
    ctx.beginPath(); ctx.moveTo(120, 470); ctx.lineTo(140, 360); ctx.lineTo(196, 440); ctx.lineTo(196, 470); ctx.fill();
    ctx.beginPath(); ctx.moveTo(280, 470); ctx.lineTo(260, 360); ctx.lineTo(204, 440); ctx.lineTo(204, 470); ctx.fill();
    for (let i = 0; i < 2; i++) ellipse(ctx, 200, 448 + i * 16, 4, 4, '#c9a13b');
    ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(150, 452); ctx.quadraticCurveTo(170, 462, 196, 452); ctx.stroke(); // watch chain
  }
  if (F.outfit === 'uniform') {
    // collar tabs, shoulder boards, medals, buttons
    ctx.fillStyle = F.trim;
    ctx.beginPath(); ctx.moveTo(158, 322); ctx.lineTo(200, 350); ctx.lineTo(242, 322); ctx.lineTo(250, 345); ctx.lineTo(200, 380); ctx.lineTo(150, 345); ctx.fill();
    ctx.fillStyle = '#c9a13b'; ctx.fillRect(70, 350, 70, 16); ctx.fillRect(260, 350, 70, 16);
    ctx.fillStyle = '#9e8a3a'; for (let i = 0; i < 3; i++) ctx.fillRect(78 + i * 20, 352, 12, 12);
    for (let i = 0; i < 3; i++) ellipse(ctx, 200, 400 + i * 28, 6, 6, '#c9a13b');
    const rib = ['#9e1f28', '#1f4a9e', '#e8c040', '#2a7a3a'];
    rib.forEach((r, i) => { ctx.fillStyle = r; ctx.fillRect(250 + (i % 2) * 22, 400 + Math.floor(i / 2) * 12, 20, 10); });
  }
  if (F.outfit === 'tails' && F.sash) {
    ctx.fillStyle = F.sash; ctx.beginPath(); ctx.moveTo(80, 380); ctx.lineTo(110, 360); ctx.lineTo(330, 470); ctx.lineTo(280, 470); ctx.fill();
    // order star
    ctx.save(); ctx.translate(120, 420); ctx.fillStyle = '#e8d08a';
    ctx.beginPath(); for (let k = 0; k < 16; k++) { const r = k % 2 ? 8 : 24, a = k / 16 * Math.PI * 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.fill();
    ellipse(ctx, 0, 0, 8, 8, '#9e1f28'); ctx.restore();
  }
  if (F.outfit === 'redcoat') {
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(200, 360); ctx.lineTo(210, 470); ctx.stroke();
    for (let i = 0; i < 2; i++) ellipse(ctx, 222, 400 + i * 40, 7, 7, '#2a0a0e');
  }
  if (F.outfit === 'jacket') {
    ctx.fillStyle = shadeColor(c, 0.08); ctx.beginPath(); ctx.moveTo(160, 330); ctx.lineTo(120, 360); ctx.lineTo(190, 470); ctx.lineTo(200, 380); ctx.fill();
    ctx.beginPath(); ctx.moveTo(240, 330); ctx.lineTo(280, 360); ctx.lineTo(210, 470); ctx.lineTo(200, 380); ctx.fill();
    for (let i = 0; i < 20; i++) { ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(40 + i * 17, 380, 2, 90); } // tweed
  }
}

function drawCollar(ctx, F) {
  if (F.outfit === 'tux' || F.outfit === 'tails' || F.outfit === 'waiter' || F.outfit === 'vest') {
    ctx.fillStyle = F.collar;
    ctx.beginPath(); ctx.moveTo(158, 312); ctx.lineTo(200, 336); ctx.lineTo(186, 350); ctx.lineTo(152, 330); ctx.fill();
    ctx.beginPath(); ctx.moveTo(242, 312); ctx.lineTo(200, 336); ctx.lineTo(214, 350); ctx.lineTo(248, 330); ctx.fill();
    // bow tie
    ctx.fillStyle = F.tie;
    ctx.beginPath(); ctx.moveTo(200, 338); ctx.lineTo(170, 326); ctx.lineTo(172, 354); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(200, 338); ctx.lineTo(230, 326); ctx.lineTo(228, 354); ctx.closePath(); ctx.fill();
    ellipse(ctx, 200, 340, 7, 8, shadeColor(F.tie === '#f1ede4' ? '#d8d2c6' : '#1a1a1a', 0.1));
  }
  if (F.outfit === 'redcoat') {
    // fur collar
    for (let i = 0; i < 26; i++) {
      const a = Math.PI * (0.05 + i / 26 * 0.9), r = 108;
      ellipse(ctx, 200 - Math.cos(a) * r, 350 - Math.sin(a) * 26, 24, 20, i % 2 ? F.fur : shadeColor(F.fur, -0.08));
    }
  }
  if (F.outfit === 'jacket' && F.scarf) {
    ctx.fillStyle = F.scarf; ctx.beginPath(); ctx.ellipse(200, 332, 70, 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 2; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(140 + i * 28, 320); ctx.lineTo(146 + i * 28, 346); ctx.stroke(); }
  }
}

function drawHairBack(ctx, F) {
  if (F.hairStyle === 'bob') {
    ctx.fillStyle = linGrad(ctx, 90, 0, 320, 0, [[0, shadeColor(F.hair, -0.3)], [0.5, F.hair], [1, shadeColor(F.hair, -0.2)]]);
    ctx.beginPath(); ctx.moveTo(96, 300); ctx.bezierCurveTo(70, 180, 110, 70, 200, 66); ctx.bezierCurveTo(290, 70, 330, 180, 304, 300);
    ctx.quadraticCurveTo(200, 318, 96, 300); ctx.fill();
  }
}

function drawFace(ctx, F, mouth, blink, look, t) {
  const jw = F.jaw, ch = F.cheek;
  // ears
  for (const d of [-1, 1]) {
    ctx.fillStyle = F.skinDark;
    ctx.beginPath(); ctx.ellipse(200 + d * 88 * (0.95 + ch * 0.05), 200, 16, 28, d * 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(200 + d * 88, 202, 7, 16, 0, 0, Math.PI * 2); ctx.fill();
    if (F.earrings && d === 1) { ellipse(ctx, 200 + d * 92, 236, 7, 7, '#f4efe4'); glow(ctx, 200 + d * 92, 234, 12, 'rgba(255,255,255,0.8)'); }
    if (F.earrings && d === -1) ellipse(ctx, 200 + d * 92, 236, 6, 6, '#e8e2d6');
  }
  // head shape
  const g = linGrad(ctx, 110, 0, 300, 0, [[0, F.skinDark], [0.35, F.skin], [0.7, shadeColor(F.skin, 0.06)], [1, F.skinDark]]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(200, 70);
  ctx.bezierCurveTo(262, 70, 292, 118, 292, 180);
  ctx.bezierCurveTo(292, 232 + jw * 10, 262 * (0.98 + jw * 0.02), 280 + jw * 6, 200, 300 + jw * 4);
  ctx.bezierCurveTo(138 * (1.02 - jw * 0.02), 280 + jw * 6, 108, 232 + jw * 10, 108, 180);
  ctx.bezierCurveTo(108, 118, 138, 70, 200, 70);
  ctx.fill();
  // cheek & jaw shading, blush
  ctx.fillStyle = 'rgba(80,30,20,0.12)';
  ctx.beginPath(); ctx.ellipse(132, 222, 22, 42, 0.2, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(200, 292 + jw * 4, 60, 12, 0, 0, 7); ctx.fill();
  if (F.blush || F.flushed) {
    const a = (F.blush || 0) + (F.flushed || 0) * (0.8 + 0.2 * Math.sin(t));
    glow(ctx, 150, 222, 36, `rgba(220,80,80,${0.3 * a})`); glow(ctx, 252, 222, 36, `rgba(220,80,80,${0.3 * a})`);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (F.stubble) {
    const r = rng(9); ctx.fillStyle = `rgba(40,25,15,${F.stubble * 0.5})`;
    for (let i = 0; i < 380; i++) { const a = r() * Math.PI, rr = 60 + r() * 30; const x = 200 + Math.cos(a) * rr * 0.95, y = 228 + Math.sin(a) * rr * 0.8; ctx.fillRect(x, y, 1.6, 1.6); }
  }
  // age lines
  if (F.age > 0.5) {
    ctx.strokeStyle = `rgba(90,50,35,${(F.age - 0.4) * 0.6})`; ctx.lineWidth = 2;
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(200 + d * 34, 238); ctx.quadraticCurveTo(200 + d * 48, 262, 200 + d * 40, 280); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(165, 118); ctx.lineTo(235, 116); ctx.moveTo(172, 128); ctx.lineTo(228, 127); ctx.stroke();
  }

  // eyes
  for (const d of [-1, 1]) {
    const ex = 200 + d * 38, ey = 182;
    ctx.save();
    ctx.beginPath(); ctx.moveTo(ex - 22, ey); ctx.quadraticCurveTo(ex, ey - (blink ? 0 : 14), ex + 22, ey); ctx.quadraticCurveTo(ex, ey + (blink ? 0 : 10), ex - 22, ey); ctx.closePath();
    ctx.fillStyle = '#f2ece4'; ctx.fill(); ctx.clip();
    if (!blink) {
      ellipse(ctx, ex + look, ey + 1, 10, 10, F.eye);
      ellipse(ctx, ex + look, ey + 1, 5, 5, '#0a0806');
      ellipse(ctx, ex + look + 3, ey - 3, 2.5, 2.5, 'rgba(255,255,255,0.9)');
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(ex - 24, ey - 16, 48, 8); // lid shadow
    }
    ctx.restore();
    // lids and lashes
    ctx.strokeStyle = F.female ? '#1a0e0a' : 'rgba(40,20,12,0.85)'; ctx.lineWidth = F.female ? 4 : 2.5;
    ctx.beginPath(); ctx.moveTo(ex - 23, ey + 1); ctx.quadraticCurveTo(ex, ey - (blink ? 0 : 15), ex + 23, ey + 1); ctx.stroke();
    if (F.female && !blink) { for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(ex + d * (10 + k * 4), ey - 11 + k * 2); ctx.lineTo(ex + d * (14 + k * 5), ey - 17 + k * 2); ctx.stroke(); } }
    ctx.strokeStyle = 'rgba(80,40,30,0.25)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ex - 18, ey + 12); ctx.quadraticCurveTo(ex, ey + 18, ex + 18, ey + 12); ctx.stroke();
    // brows (lift slightly while talking)
    const lift = mouth * 5 + (F.female ? 3 : 0);
    ctx.strokeStyle = shadeColor(F.hairStyle === 'bob' ? '#a88a5a' : F.hair, -0.15); ctx.lineWidth = F.brow; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ex - d * 24, ey - 22 - lift * 0.4); ctx.quadraticCurveTo(ex, ey - 32 - lift, ex + d * 26, ey - 24 - lift * 0.6); ctx.stroke();
  }
  if (F.monocle) {
    ctx.strokeStyle = '#d9c27a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(238, 183, 26, 0, 7); ctx.stroke();
    ctx.fillStyle = 'rgba(200,220,240,0.15)'; ctx.fill();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(262, 192); ctx.quadraticCurveTo(290, 260, 270, 330); ctx.stroke();
  }

  // nose
  ctx.fillStyle = 'rgba(90,45,30,0.22)';
  const nw = { small: 14, straight: 18, round: 24, long: 18, broad: 26, bulb: 28 }[F.nose] || 18;
  const nl = { long: 76, small: 58 }[F.nose] || 66;
  ctx.beginPath(); ctx.moveTo(192, 190); ctx.quadraticCurveTo(184, 190 + nl * 0.7, 200 - nw, 190 + nl); ctx.lineTo(200 - nw * 0.4, 190 + nl + 4); ctx.lineTo(196, 196); ctx.fill();
  ctx.fillStyle = F.nose === 'bulb' ? shadeColor(F.skin, -0.05) : shadeColor(F.skin, 0.05);
  ctx.beginPath(); ctx.ellipse(202, 190 + nl - 4, nw * 0.75, 12, 0, 0, 7); ctx.fill();
  if (F.flushed) glow(ctx, 202, 190 + nl - 6, 20, `rgba(230,70,60,${0.3 * F.flushed})`);
  ctx.fillStyle = 'rgba(40,15,10,0.55)';
  ellipse(ctx, 200 - nw * 0.45, 190 + nl + 2, 5, 3, 'rgba(40,15,10,0.55)');
  ellipse(ctx, 200 + nw * 0.55, 190 + nl + 2, 5, 3, 'rgba(40,15,10,0.55)');
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(203, 200, 4, nl - 16);

  // mouth: open amount follows the voice
  const my = 190 + nl + 34, mw = F.female ? 30 : 34;
  const open = clamp(mouth, 0, 1), wide = 1 + Math.sin(t * 17) * 0.08 * open;
  if (open > 0.05) {
    ctx.fillStyle = '#2a0c0a';
    ctx.beginPath(); ctx.ellipse(200, my + open * 6, mw * wide * 0.85, 3 + open * 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#efe8dc'; ctx.fillRect(200 - mw * 0.55, my - 1, mw * 1.1, Math.min(6, open * 10)); // teeth
    if (open > 0.5) ellipse(ctx, 200, my + open * 14, mw * 0.4, 5, '#a0404a'); // tongue
  }
  // lips
  ctx.fillStyle = F.lip;
  ctx.beginPath(); ctx.moveTo(200 - mw, my); ctx.quadraticCurveTo(200 - mw * 0.4, my - 10 - (F.female ? 3 : 0), 200, my - 5);
  ctx.quadraticCurveTo(200 + mw * 0.4, my - 10 - (F.female ? 3 : 0), 200 + mw, my);
  ctx.quadraticCurveTo(200, my - 1, 200 - mw, my); ctx.fill();
  ctx.beginPath(); ctx.moveTo(200 - mw * 0.9, my + open * 12); ctx.quadraticCurveTo(200, my + 14 + open * 22 + (F.female ? 4 : 0), 200 + mw * 0.9, my + open * 12);
  ctx.quadraticCurveTo(200, my + 2 + open * 12, 200 - mw * 0.9, my + open * 12); ctx.fill();
  if (F.female) { ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(192, my + 6 + open * 14, 14, 3); }
  // mustache
  if (F.mustache) {
    ctx.fillStyle = F.mustache;
    if (F.mustacheStyle === 'pencil') { ctx.fillRect(200 - mw * 0.9, my - 13, mw * 1.8, 4); }
    else if (F.mustacheStyle === 'handlebar') {
      ctx.beginPath(); ctx.moveTo(200, my - 14); ctx.bezierCurveTo(240, my - 26, 262, my, 280, my - 22); ctx.bezierCurveTo(262, my + 6, 230, my - 2, 200, my - 2);
      ctx.bezierCurveTo(170, my - 2, 138, my + 6, 120, my - 22); ctx.bezierCurveTo(138, my, 160, my - 26, 200, my - 14); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(200, my - 18); ctx.bezierCurveTo(236, my - 26, 250, my - 4, 244, my + 12); ctx.bezierCurveTo(226, my, 214, my - 4, 200, my - 4);
      ctx.bezierCurveTo(186, my - 4, 174, my, 156, my + 12); ctx.bezierCurveTo(150, my - 4, 164, my - 26, 200, my - 18); ctx.fill();
    }
  }
  // chin highlight
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.ellipse(206, 286, 22, 8, 0, 0, 7); ctx.fill();
}

function drawHairFront(ctx, F, t) {
  const h = F.hair, hi = F.hairHi;
  if (F.hairStyle === 'slick') {
    ctx.fillStyle = linGrad(ctx, 100, 60, 300, 140, [[0, shadeColor(h, -0.2)], [0.5, h], [1, shadeColor(h, -0.25)]]);
    ctx.beginPath(); ctx.moveTo(104, 196); ctx.bezierCurveTo(90, 90, 150, 48, 214, 52); ctx.bezierCurveTo(276, 56, 304, 100, 296, 190);
    ctx.bezierCurveTo(290, 150, 280, 118, 250, 108); ctx.bezierCurveTo(210, 96, 170, 116, 150, 100); ctx.bezierCurveTo(130, 120, 118, 150, 116, 196); ctx.fill();
    ctx.strokeStyle = hi; ctx.globalAlpha = 0.5; ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(140 + i * 14, 70 + Math.abs(i - 4) * 3); ctx.quadraticCurveTo(190 + i * 8, 60, 250 + i * 5, 84 + i * 3); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = shadeColor(h, -0.4); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(160, 64); ctx.quadraticCurveTo(152, 84, 150, 100); ctx.stroke(); // parting
  } else if (F.hairStyle === 'bob') {
    ctx.fillStyle = linGrad(ctx, 100, 0, 300, 0, [[0, shadeColor(h, -0.15)], [0.5, h], [1, shadeColor(h, -0.1)]]);
    ctx.beginPath(); ctx.moveTo(98, 250); ctx.bezierCurveTo(84, 140, 120, 56, 206, 56); ctx.bezierCurveTo(292, 58, 318, 140, 302, 250);
    ctx.bezierCurveTo(296, 200, 290, 150, 262, 126); ctx.bezierCurveTo(230, 106, 190, 132, 150, 104); ctx.bezierCurveTo(124, 150, 112, 200, 98, 250); ctx.fill();
    ctx.strokeStyle = hi; ctx.globalAlpha = 0.6; ctx.lineWidth = 3;
    // sheen along the fall of the hair on both sides, clear of the face
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(150 - i * 10, 76 + i * 6); ctx.quadraticCurveTo(108 + i * 3, 150, 104 + i * 6, 240); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(250 + i * 10, 76 + i * 6); ctx.quadraticCurveTo(292 - i * 3, 150, 296 - i * 6, 240); ctx.stroke();
    }
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(170 + i * 14, 64); ctx.quadraticCurveTo(190 + i * 10, 76, 214 + i * 8, 92); ctx.stroke(); }
    ctx.globalAlpha = 1;
    // finger wave
    ctx.strokeStyle = shadeColor(h, -0.25); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(150, 104); ctx.bezierCurveTo(170, 90, 190, 120, 214, 104); ctx.bezierCurveTo(236, 92, 250, 112, 262, 126); ctx.stroke();
  } else if (F.hairStyle === 'bald') {
    for (const d of [-1, 1]) {
      ctx.fillStyle = h; ctx.beginPath(); ctx.moveTo(200 + d * 90, 214); ctx.bezierCurveTo(200 + d * 100, 170, 200 + d * 94, 136, 200 + d * 78, 116); ctx.lineTo(200 + d * 70, 170); ctx.lineTo(200 + d * 80, 214); ctx.fill();
    }
    glow(ctx, 230, 96, 40, 'rgba(255,255,255,0.25)');
  } else if (F.hairStyle === 'cap') {
    ctx.fillStyle = h; for (const d of [-1, 1]) ctx.fillRect(200 + d * 86 - 8, 130, 16, 70);
    ctx.fillStyle = linGrad(ctx, 90, 0, 310, 0, [[0, shadeColor(F.cap, -0.3)], [0.5, F.cap], [1, shadeColor(F.cap, -0.2)]]);
    ctx.beginPath(); ctx.moveTo(96, 132); ctx.bezierCurveTo(90, 60, 130, 28, 200, 26); ctx.bezierCurveTo(290, 28, 330, 56, 318, 110); ctx.lineTo(304, 136); ctx.closePath(); ctx.fill();
    ctx.fillStyle = F.capBand; ctx.fillRect(98, 110, 208, 26);
    ctx.fillStyle = '#0c0c0c'; ctx.beginPath(); ctx.moveTo(100, 134); ctx.quadraticCurveTo(200, 128, 310, 134); ctx.quadraticCurveTo(220, 176, 110, 156); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(140, 146, 120, 3);
    ctx.save(); ctx.translate(200, 88); ctx.fillStyle = '#d9b35c';
    ctx.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 7 : 16, a = -Math.PI / 2 + k / 10 * Math.PI * 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.fill(); ctx.restore();
  } else if (F.hairStyle === 'flatcap') {
    ctx.fillStyle = h; for (const d of [-1, 1]) ctx.fillRect(200 + d * 86 - 8, 130, 16, 60);
    ctx.fillStyle = linGrad(ctx, 90, 0, 320, 0, [[0, shadeColor(F.cap, -0.3)], [0.6, F.cap], [1, shadeColor(F.cap, -0.1)]]);
    ctx.beginPath(); ctx.moveTo(92, 138); ctx.bezierCurveTo(90, 70, 150, 50, 220, 52); ctx.bezierCurveTo(300, 56, 330, 100, 330, 126); ctx.lineTo(318, 144); ctx.quadraticCurveTo(200, 128, 92, 138); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 2; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(100 + i * 18, 60); ctx.lineTo(96 + i * 18, 138); ctx.stroke(); }
  }
}

// --- the speaker panel ------------------------------------------------------------
const Portrait = { alpha: 0, id: null, side: 'left', mouth: 0 };
function drawSpeakerPortrait(ctx, dt) {
  const s = G.speech[0];
  const id = s && !s.thought && FACES[s.id] ? s.id : null;
  if (id) { Portrait.id = id; Portrait.side = s.fig && s.fig.x > W * 0.55 ? 'right' : 'left'; }
  Portrait.alpha = clamp(Portrait.alpha + (id ? dt * 5 : -dt * 4), 0, 1);
  if (Portrait.alpha <= 0 || !Portrait.id) return;
  // mouth follows the recorded voice; unvoiced lines flap gently
  const target = id && s.voiced ? Voice.level() * 3.2 : id && !s.voiceDone ? (Math.sin(G.t * 18) * 0.5 + 0.5) * 0.6 : 0;
  Portrait.mouth += (clamp(target, 0, 1) - Portrait.mouth) * 0.45;
  const size = 300, pad = 40;
  const x = Portrait.side === 'left' ? pad : W - pad - size, y = H - size * 1.15 - 170;
  const a = ease(Portrait.alpha);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate((Portrait.side === 'left' ? -1 : 1) * (1 - a) * 40, 0);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30;
  const light = G.scene && G.scene.light;
  drawPortrait(ctx, Portrait.id, x, y, size, Portrait.mouth, G.t, { mirror: Portrait.side === 'right', seed: Portrait.id.length, rim: light && light.key, bgHi: G.scene && G.scene.portraitBg });
  ctx.shadowBlur = 0;
  ctx.font = `600 22px ${FONT_UI}`; ctx.textAlign = Portrait.side === 'left' ? 'left' : 'right';
  ctx.fillStyle = '#f0b35b';
  const names = { jack: 'JACK HARROW', ilse: 'ILSE', franz: 'FRANZ', vendor: 'NEWSPAPER VENDOR', gateGuard: 'GATE GUARD', stairGuard: 'GUARD', officeGuard: 'GUARD', waiter: 'WAITER', baron: 'BARON VON KATZ' };
  ctx.fillText(names[Portrait.id] || '', Portrait.side === 'left' ? x + 8 : x + size - 8, y + size * 1.15 + 32);
  ctx.restore();
}
// Mouth openness for the in-scene figure that is speaking.
function speakingMouth(f) {
  const s = G.speech[0];
  if (!s || s.fig !== f || !f.talking) return 0;
  return s.voiced ? clamp(Voice.level() * 3.2, 0, 1) : (Math.sin(G.t * 18) * 0.5 + 0.5) * 0.6;
}
