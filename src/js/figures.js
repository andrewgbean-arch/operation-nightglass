// ---------------------------------------------------------------------------
// Figures — procedurally drawn, rotoscope-style characters.
// Every figure is drawn in local units (feet at 0,0; ~180 units tall, facing
// right) into an offscreen buffer, then lit to match the scene it stands in.
// ---------------------------------------------------------------------------

const LOOKS = {
  jack: {
    skin: '#d9a883', hair: '#2a1d16', hairStyle: 'slick', top: 'trench',
    coat: '#b39a73', coatDark: '#7c6546', pants: '#2b2d33', shoes: '#141414', shirt: '#e8e2d6', tie: '#5b1b22',
  },
  jackTux: {
    skin: '#d9a883', hair: '#2a1d16', hairStyle: 'slick', top: 'tux',
    coat: '#1b1d22', coatDark: '#0c0d10', pants: '#16171b', shoes: '#0a0a0a', shirt: '#f1ede4', tie: '#0a0a0a',
  },
  ilse: {
    skin: '#e8c3a8', hair: '#e9dcb4', hairStyle: 'bob', top: 'longcoat', female: true,
    coat: '#9c1f2e', coatDark: '#5e0f19', pants: '#1c1618', shoes: '#1b0d0f', shirt: '#1a1a1a', lips: '#8c1624',
  },
  franz: {
    skin: '#d4a07e', hair: '#5a5550', hairStyle: 'bald', top: 'vest', build: 1.12, belly: 0.4, mustache: true,
    coat: '#2b2522', coatDark: '#15110f', pants: '#1d1b1b', shoes: '#101010', shirt: '#ebe5d8', apron: '#e7e1d2', tie: '#1a1a1a',
  },
  vendor: {
    skin: '#c99774', hair: '#8b8a86', hairStyle: 'flatcap', cap: '#4a4238', top: 'jacket', build: 1.05, stoop: 0.12,
    coat: '#4f5446', coatDark: '#2d3128', pants: '#2c2a26', shoes: '#151310', shirt: '#9c8f7a', scarf: '#7a2a24',
  },
  guard: {
    skin: '#d2a07d', hair: '#2a2622', hairStyle: 'cap', cap: '#3d4436', capBand: '#8e1c24', top: 'uniform', build: 1.1,
    coat: '#4a5240', coatDark: '#2a3024', pants: '#3b4234', shoes: '#0f0f0f', shirt: '#3b4234', trim: '#9e1f28', belt: '#1c1a16',
  },
  waiter: {
    skin: '#dcae8c', hair: '#1c1612', hairStyle: 'slick', top: 'waiter',
    coat: '#ece6da', coatDark: '#b9b1a1', pants: '#15161a', shoes: '#0a0a0a', shirt: '#f4f0e8', tie: '#0a0a0a',
  },
  baron: {
    skin: '#e3a38d', hair: '#d8d4cc', hairStyle: 'bald', top: 'tails', build: 1.2, belly: 1, mustache: true, monocle: true, flushed: true,
    coat: '#1e1f26', coatDark: '#0d0e12', pants: '#1a1b20', shoes: '#0a0a0a', shirt: '#f1ede4', tie: '#f1ede4', sash: '#8a1a2c',
  },
  vasko: {
    skin: '#d6a585', hair: '#1a1a1a', hairStyle: 'cap', cap: '#2a2f38', capBand: '#9e1f28', top: 'uniform', build: 1.08, mustache: true,
    coat: '#2d3440', coatDark: '#181c24', pants: '#2a303b', shoes: '#0a0a0a', shirt: '#2d3440', trim: '#c9a13b', belt: '#111',
  },
};

// Scratch buffer the figure is rendered into before lighting.
const FIG_BUF = makeCanvas(720, 760);
const FIG_CTX = FIG_BUF.getContext('2d');

// Pose resolver: turns a figure's state into joint angles.
function resolvePose(f, t) {
  const p = {
    hipY: -92, lean: (f.look.stoop || 0),
    legs: [{ thigh: 0, knee: 0.04 }, { thigh: 0, knee: 0.04 }],
    arms: [{ upper: 0.08, fore: -0.15 }, { upper: -0.04, fore: -0.1 }],
    bob: 0, headTilt: 0,
  };
  const breathe = Math.sin(t * 1.7 + (f.seed || 0)) * 0.8;
  p.bob = breathe * 0.6;

  if (f.walking) {
    const ph = f.walkPhase;
    for (let i = 0; i < 2; i++) {
      const q = ph + i * Math.PI;
      p.legs[i].thigh = 0.46 * Math.sin(q);
      p.legs[i].knee = 0.06 + 0.75 * Math.max(0, Math.cos(q)) * (Math.sin(q) < 0.6 ? 1 : 0.6);
      p.arms[1 - i].upper = -0.4 * Math.sin(q);
      p.arms[1 - i].fore = 0.2 + 0.35 * Math.max(0, -Math.sin(q));
    }
    p.bob = -Math.abs(Math.cos(ph)) * 4 + 2;
    p.lean += f.running ? 0.18 : 0.03;
  }
  if (f.pose === 'sit') {
    p.hipY = -50;
    p.legs[0] = { thigh: 1.45, knee: 1.45 };
    p.legs[1] = { thigh: 1.35, knee: 1.5 };
  }
  if (f.crouch) {
    const c = f.crouch;
    p.hipY += c * 42;
    p.legs[0].thigh += 1.05 * c; p.legs[0].knee += 2.0 * c;
    p.legs[1].thigh += 0.7 * c; p.legs[1].knee += 1.9 * c;
    p.lean += 0.35 * c;
  }
  if (f.airborne) {
    p.legs[0] = { thigh: 0.9, knee: 1.3 }; p.legs[1] = { thigh: -0.3, knee: 0.9 };
    p.arms[0] = { upper: -1.2, fore: 0.4 }; p.arms[1] = { upper: 1.8, fore: 0.5 };
  }
  // Arm poses (index 1 = near arm, drawn in front).
  const arm = f.arm || 'rest';
  const wob = Math.sin(t * 2.3) * 0.04;
  if (arm === 'tray') p.arms[1] = { upper: 0.2, fore: 1.35 + wob };
  if (arm === 'phone') p.arms[1] = { upper: 0.45, fore: 2.45 };
  if (arm === 'point') p.arms[1] = { upper: 1.5, fore: 0.05 };
  if (arm === 'reach') p.arms[1] = { upper: 0.95, fore: 0.35 };
  if (arm === 'behind') { p.arms[0] = { upper: -0.2, fore: -0.5 }; p.arms[1] = { upper: -0.18, fore: -0.55 }; }
  if (arm === 'toast') p.arms[1] = { upper: 2.5 + wob * 3, fore: 0.35 };
  if (arm === 'hold') p.arms[1] = { upper: 0.4, fore: 1.3 };
  if (arm === 'cig') {
    const up = (Math.sin(t * 0.5 + 1) > 0.55);
    p.arms[1] = up ? { upper: 0.35, fore: 2.35 } : { upper: 0.15, fore: 1.3 };
    f._cigUp = up;
  }
  if (arm === 'drunk') {
    p.arms[1] = { upper: 1.3 + Math.sin(t * 1.3) * 0.5, fore: 0.8 };
    p.lean += Math.sin(t * 0.9) * 0.06;
    p.headTilt = Math.sin(t * 1.1) * 0.12;
  }
  if (f.pose === 'sit' && arm === 'rest') p.arms[1] = { upper: 0.5, fore: 1.1 };
  if (f.slump) {
    p.hipY = -16; p.lean = 1.35; p.headTilt = 0.6;
    p.legs[0] = { thigh: 1.55, knee: 0.1 }; p.legs[1] = { thigh: 1.4, knee: 0.3 };
    p.arms[0] = { upper: 0.2, fore: 0.1 }; p.arms[1] = { upper: 0.8, fore: 0.2 };
  }
  return p;
}

function limb(ctx, x, y, a1, l1, a2, l2, w1, w2, color) {
  // a1/a2 are angles from straight-down, positive = forward.
  const kx = x + Math.sin(a1) * l1, ky = y + Math.cos(a1) * l1;
  const ex = kx + Math.sin(a2) * l2, ey = ky + Math.cos(a2) * l2;
  ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.lineWidth = w1;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(kx, ky); ctx.stroke();
  ctx.lineWidth = w2;
  ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(ex, ey); ctx.stroke();
  return [kx, ky, ex, ey];
}

function drawFigureLocal(ctx, f, t) {
  const L = f.look, p = resolvePose(f, t), b = L.build || 1;
  const hipY = p.hipY + p.bob;

  const drawLeg = (i, shade) => {
    const lg = p.legs[i];
    const hx = (i ? 3 : -3);
    const [, , ax, ay] = limb(ctx, hx, hipY, lg.thigh, 46, lg.thigh - lg.knee, 44, 15 * b, 12 * b, shade ? L.coatDark && L.pants ? shadeColor(L.pants, -0.35) : L.pants : L.pants);
    // shoe
    const fa = f.airborne ? 0.4 : (f.pose === 'sit' ? 0 : Math.max(-0.4, Math.min(0.5, lg.thigh - lg.knee)) * 0.5);
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(-fa);
    ctx.fillStyle = shade ? shadeColor(L.shoes, -0.3) : L.shoes;
    ctx.beginPath(); ctx.moveTo(-6, -5); ctx.quadraticCurveTo(14, -8, 17, 1); ctx.lineTo(17, 4); ctx.lineTo(-6, 4); ctx.closePath(); ctx.fill();
    ctx.restore();
  };

  // Upper body is rotated around the hip by the lean angle.
  const withUpper = fn => {
    ctx.save(); ctx.translate(0, hipY); ctx.rotate(p.lean); ctx.translate(0, -hipY); fn(); ctx.restore();
  };
  const shoulderY = hipY - 56, sx = 2;

  const drawArm = (i, shade) => {
    withUpper(() => {
      const a = p.arms[i];
      const col = shade ? L.coatDark : L.coat;
      const [ex, ey, hx, hy] = limb(ctx, sx + (i ? 2 : -4), shoulderY + 6, a.upper, 30, a.upper + a.fore, 28, 12 * b, 10.5 * b, col);
      // cuff + hand
      ellipse(ctx, hx, hy, 5, 5.5, shade ? shadeColor(L.skin, -0.3) : L.skin);
      if (i === 1 && f.arm === 'tray') {
        ctx.fillStyle = '#c9ccd0'; ctx.fillRect(hx - 26, hy - 8, 52, 4);
        for (let k = 0; k < (f.trayGlasses ?? 3); k++) drawFlute(ctx, hx - 18 + k * 14, hy - 8);
      }
      if (i === 1 && (f.arm === 'toast' || f.holding === 'glass')) drawFlute(ctx, hx, hy - 4);
      if (i === 1 && f.arm === 'phone') { ctx.fillStyle = '#111'; ctx.fillRect(hx - 4, hy - 16, 8, 30); }
      if (i === 1 && f.arm === 'point') { ctx.fillStyle = '#1b1b1b'; ctx.fillRect(hx, hy - 2, 16, 3.5); ctx.fillStyle = '#c9a13b'; ctx.fillRect(hx + 13, hy - 2, 3, 3.5); }
      if (i === 1 && f.arm === 'cig') {
        ctx.fillStyle = '#eee'; ctx.fillRect(hx + 2, hy - 3, 10, 2);
        glow(ctx, hx + 12, hy - 2, 6, 'rgba(255,120,40,0.9)', 0.9);
        f._cigTip = [hx + 12, hy - 2];
      }
      if (i === 1 && f.holding === 'film') { ctx.fillStyle = '#2a2a2a'; ctx.fillRect(hx - 3, hy - 8, 6, 10); }
    });
  };

  // shadow
  if (!f.airborne) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(4, 0, 38 * b, 7, 0, 0, Math.PI * 2); ctx.fill();
  }

  drawArm(0, true);
  drawLeg(0, true);
  const coatLong = L.top === 'trench' || L.top === 'longcoat' || L.top === 'tails';
  if (!coatLong) drawLeg(1, false);

  withUpper(() => {
    const top = hipY - 58, w = 17 * b;
    // Coat skirt (for long coats) swings with the legs.
    if (coatLong) {
      const sw = f.walking ? Math.sin(f.walkPhase) * 6 : 0;
      const hem = L.top === 'tails' ? hipY + 18 : f.pose === 'sit' ? hipY + 8 : hipY + 52 + (L.female ? 6 : 0);
      if (L.top === 'tails') {
        poly(ctx, [-w + 1, hipY - 6, -w - 2 - sw * 0.5, hem + 26, -w + 10, hem + 30, 0, hipY], L.coatDark);
      } else {
        poly(ctx, [-w, hipY - 8, w + 2, hipY - 8, w + 8 + sw, hem, -w - 6 - sw * 0.5, hem + 2], linGrad(ctx, -w, 0, w, 0, [[0, L.coatDark], [0.7, L.coat], [1, shadeColor(L.coat, 0.08)]]));
        // fold line
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(4, hipY); ctx.lineTo(6 + sw, hem); ctx.stroke();
      }
    }
    if (L.apron) poly(ctx, [-w + 3, hipY - 12, w - 1, hipY - 12, w + 2, hipY + 62, -w + 1, hipY + 62], L.apron);
    // Torso
    const torso = [-w + 2, top + 4, -w - 1 * b, top + 30, -w + 3, hipY + 2, w, hipY + 2, w + 3 + (L.belly || 0) * 7, top + 38, w + 1, top + 4];
    poly(ctx, torso, linGrad(ctx, -w, 0, w, 0, [[0, L.coatDark], [0.65, L.coat], [1, shadeColor(L.coat, 0.1)]]));
    if (L.belly) ellipse(ctx, w - 2, top + 38, 10 * L.belly, 17 * L.belly, L.top === 'tails' || L.top === 'vest' ? L.shirt : L.coat);
    // Shirt / lapels
    if (L.top === 'tux' || L.top === 'tails' || L.top === 'trench' || L.top === 'waiter' || L.top === 'vest') {
      poly(ctx, [w - 12, top + 3, w - 1, top + 3, w + 1 + (L.belly || 0) * 5, top + 34, w - 5, top + 34], L.shirt);
      if (L.top !== 'waiter' && L.top !== 'vest') {
        poly(ctx, [w - 14, top + 2, w - 7, top + 2, w - 2, top + 36, w - 8, top + 42], shadeColor(L.coat, L.top === 'trench' ? -0.12 : 0.18));
      }
      // bow tie / tie
      if (L.top === 'tux' || L.top === 'tails' || L.top === 'waiter') {
        poly(ctx, [w - 7, top + 5, w + 1, top + 2, w + 1, top + 10, w - 7, top + 7], L.tie);
      } else if (L.top === 'trench') {
        poly(ctx, [w - 4, top + 4, w, top + 4, w + 1, top + 30, w - 3, top + 32], L.tie);
      }
    }
    if (L.top === 'trench') {
      // belt + collar
      rect(ctx, -w, hipY - 16, w * 2 + 2, 6, L.coatDark);
      poly(ctx, [-w + 2, top - 2, w - 4, top - 4, w - 10, top + 14, -w + 6, top + 10], shadeColor(L.coat, -0.08));
    }
    if (L.top === 'uniform') {
      rect(ctx, -w + 1, hipY - 14, w * 2, 6, L.belt);
      rect(ctx, w - 8, hipY - 13, 6, 4, '#b8a14a');
      for (let k = 0; k < 4; k++) ellipse(ctx, w - 3, top + 10 + k * 11, 1.8, 1.8, '#c9a13b');
      poly(ctx, [-w + 2, top + 2, w, top + 2, w - 4, top - 4, -w + 6, top - 4], L.trim);
      rect(ctx, -w + 2, top + 16, 10, 7, L.trim); // ribbon bar
    }
    if (L.sash) poly(ctx, [-w + 2, top + 6, -w + 12, top + 2, w + 6, hipY - 6, w - 4, hipY], L.sash);
    if (L.scarf) poly(ctx, [-w + 4, top - 2, w + 2, top - 3, w + 1, top + 8, -w + 4, top + 7], L.scarf);
    if (L.female && L.top === 'longcoat') {
      poly(ctx, [-w + 3, top - 4, w - 2, top - 6, w - 7, top + 16, -w + 6, top + 10], shadeColor(L.coat, -0.15));
    }

    // Neck + head
    const hx = 6, hy = top - 16;
    rect(ctx, hx - 5, top - 10, 10, 12, shadeColor(L.skin, -0.18));
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(p.headTilt + (f.headTurn || 0));
    drawHead(ctx, f, L, t);
    ctx.restore();
  });

  if (coatLong) {
    // near leg below the coat hem
    ctx.save();
    drawLeg(1, false);
    ctx.restore();
    // redraw hem over the near thigh for long coats
    withUpper(() => {
      if (L.top === 'tails') return;
      const w = 17 * b, sw = f.walking ? Math.sin(f.walkPhase) * 6 : 0;
      const hem = hipY + 52 + (L.female ? 6 : 0);
      if (f.pose === 'sit' || f.crouch > 0.4) return;
      poly(ctx, [-w, hipY - 8, w + 2, hipY - 8, w + 8 + sw, hem, -w - 6 - sw * 0.5, hem + 2], linGrad(ctx, -w, 0, w, 0, [[0, L.coatDark], [0.7, L.coat], [1, shadeColor(L.coat, 0.08)]]));
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(4, hipY); ctx.lineTo(6 + sw, hem); ctx.stroke();
      if (L.top === 'trench') rect(ctx, -w, hipY - 16, w * 2 + 2, 6, L.coatDark);
    });
  }
  drawArm(1, false);
}

function drawHead(ctx, f, L, t) {
  const skin = L.flushed ? L.skin : L.skin;
  // back of head / hair under
  if (L.hairStyle === 'bob') {
    ellipse(ctx, -3, 2, 15, 17, shadeColor(L.hair, -0.25));
  }
  // face
  ctx.fillStyle = linGrad(ctx, -12, 0, 12, 0, [[0, shadeColor(skin, -0.28)], [0.6, skin], [1, shadeColor(skin, 0.06)]]);
  ctx.beginPath();
  ctx.moveTo(-10, -12);
  ctx.quadraticCurveTo(4, -17, 11, -8);
  ctx.lineTo(12, -1);        // brow
  ctx.lineTo(15, 4);         // nose tip
  ctx.lineTo(11.5, 6);
  ctx.lineTo(12, 9);         // lips
  ctx.quadraticCurveTo(10, 15, 4, 16); // chin
  ctx.quadraticCurveTo(-6, 16, -10, 6);
  ctx.closePath(); ctx.fill();
  if (L.flushed) glow(ctx, 6, 5, 7, 'rgba(200,40,40,0.5)', 0.8);
  // ear
  ellipse(ctx, -3, 2, 3, 4.5, shadeColor(skin, -0.2));
  // eye + brow
  const blink = (Math.sin(t * 0.9 + (f.seed || 0) * 3) > 0.985);
  ctx.fillStyle = '#1a1210';
  if (!blink && !f.slump) ctx.fillRect(7, -2, 3, 2.2); else ctx.fillRect(6, -1, 4, 0.8);
  ctx.fillStyle = shadeColor(L.hair === '#d8d4cc' ? '#9a948a' : L.hair, -0.1);
  ctx.fillRect(5, -5, 7, 1.6);
  if (L.monocle) { ctx.strokeStyle = '#d9c27a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(9, -1, 3.8, 0, 7); ctx.stroke(); }
  // mouth
  const talk = f.talking && Math.sin(t * 22) > -0.2;
  ctx.fillStyle = L.lips || shadeColor(skin, -0.45);
  ctx.fillRect(9, 9, 3.5, talk ? 2.6 : 1.1);
  if (L.mustache) { ctx.fillStyle = shadeColor(L.hair === '#5a5550' ? '#3a3632' : L.hair, -0.1); ctx.fillRect(8, 6.5, 6, 2.5); }
  // hair
  const h = L.hair;
  if (L.hairStyle === 'slick') {
    ctx.fillStyle = h;
    ctx.beginPath(); ctx.moveTo(-11, 4); ctx.quadraticCurveTo(-14, -16, 2, -17); ctx.quadraticCurveTo(12, -17, 12, -7);
    ctx.quadraticCurveTo(4, -12, -4, -8); ctx.quadraticCurveTo(-6, -2, -7, 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-8, -10); ctx.quadraticCurveTo(0, -16, 9, -11); ctx.stroke();
  } else if (L.hairStyle === 'bob') {
    ctx.fillStyle = linGrad(ctx, -14, 0, 12, 0, [[0, shadeColor(h, -0.25)], [1, h]]);
    ctx.beginPath(); ctx.moveTo(-14, 12); ctx.quadraticCurveTo(-18, -18, 2, -18); ctx.quadraticCurveTo(14, -18, 13, -4);
    ctx.quadraticCurveTo(6, -10, 2, -6); ctx.quadraticCurveTo(-1, 4, -2, 13); ctx.closePath(); ctx.fill();
  } else if (L.hairStyle === 'bald') {
    ctx.fillStyle = h;
    ctx.beginPath(); ctx.moveTo(-11, 6); ctx.quadraticCurveTo(-12, -4, -7, -8); ctx.lineTo(-5, 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ellipse(ctx, 0, -13, 6, 2, 'rgba(255,255,255,0.12)');
  } else if (L.hairStyle === 'cap') {
    ctx.fillStyle = h; ctx.fillRect(-10, -8, 6, 12);
    poly(ctx, [-13, -11, 13, -11, 16, -21, -9, -24], L.cap);
    rect(ctx, -12, -13, 26, 4, L.capBand);
    poly(ctx, [6, -10, 20, -8, 20, -6, 6, -7], '#111');
    ellipse(ctx, 4, -19, 2.2, 2.2, '#c9a13b');
  } else if (L.hairStyle === 'flatcap') {
    ctx.fillStyle = h; ctx.fillRect(-11, -6, 7, 10);
    poly(ctx, [-13, -9, 10, -14, 20, -8, 12, -6, -12, -3], L.cap);
  }
}

function drawFlute(ctx, x, y) {
  ctx.fillStyle = 'rgba(230,220,180,0.75)';
  ctx.beginPath(); ctx.moveTo(x - 3, y - 18); ctx.lineTo(x + 3, y - 18); ctx.lineTo(x + 1.5, y - 7); ctx.lineTo(x - 1.5, y - 7); ctx.fill();
  ctx.fillStyle = 'rgba(240,200,90,0.8)'; ctx.fillRect(x - 2.5, y - 15, 5, 7);
  ctx.fillStyle = 'rgba(220,220,220,0.8)'; ctx.fillRect(x - 0.6, y - 7, 1.2, 6); ctx.fillRect(x - 3, y - 1.5, 6, 1.5);
}

function shadeColor(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (amt < 0) { r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; }
  else { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

// Draw a figure into the scene with scene lighting.
// light: { ambient: 'rgba(...)' (multiply tint), key: 'rgba(...)' (rim), keyX }
function drawFigure(ctx, f, t, light) {
  const s = f.scale;
  const bw = FIG_BUF.width, bh = FIG_BUF.height;
  const c = FIG_CTX;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, bw, bh);
  c.globalCompositeOperation = 'source-over';
  // Local render at fixed 3x so thin details survive, then scale into scene.
  const R = 3.4;
  c.setTransform(R * f.facing, 0, 0, R, bw / 2, bh - 30);
  drawFigureLocal(c, f, t);
  c.setTransform(1, 0, 0, 1, 0, 0);
  // Lighting: ambient tint over the figure only.
  if (light) {
    c.globalCompositeOperation = 'source-atop';
    if (light.ambient) { c.fillStyle = light.ambient; c.fillRect(0, 0, bw, bh); }
    if (light.key) {
      const dir = (light.keyX ?? W / 2) < f.x ? -1 : 1;
      c.fillStyle = linGrad(c, bw / 2 - dir * 120, 0, bw / 2 + dir * 120, 0, [[0, 'rgba(0,0,0,0)'], [0.55, 'rgba(0,0,0,0)'], [1, light.key]]);
      c.fillRect(0, 0, bw, bh);
    }
    if (light.top) {
      c.fillStyle = linGrad(c, 0, bh * 0.2, 0, bh, [[0, light.top], [0.6, 'rgba(0,0,0,0)']]);
      c.fillRect(0, 0, bw, bh);
    }
    c.globalCompositeOperation = 'source-over';
  }
  const k = s / R;
  ctx.drawImage(FIG_BUF, f.x - (bw / 2) * k, f.y - (bh - 30) * k, bw * k, bh * k);
}

// Screen-space bounding box of a figure (for hotspots and speech placement).
function figureBox(f) {
  const s = f.scale, h = (f.pose === 'sit' ? 140 : 190) * s;
  return { x: f.x - 34 * s, y: f.y - h, w: 68 * s, h, headY: f.y - h };
}

// Figure factory.
function makeFigure(lookName, x, y, opts = {}) {
  return Object.assign({
    look: LOOKS[lookName], lookName, x, y, scale: 2, facing: 1, walking: false, walkPhase: 0,
    talking: false, arm: 'rest', pose: 'stand', seed: Math.random() * 10, crouch: 0,
  }, opts);
}
