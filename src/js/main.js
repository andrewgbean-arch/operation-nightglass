// ---------------------------------------------------------------------------
// Main — title screen, story text screens, new game / continue, boot.
// ---------------------------------------------------------------------------

let TITLE_BG = null;
function titleBg() {
  if (TITLE_BG) return TITLE_BG;
  const c = makeCanvas(W, H), x = c.getContext('2d');
  paintSky(x, 0, H, '#040912', '#0c1a2e', 'rgba(210,120,60,0.35)');
  ellipse(x, 1480, 230, 50, 50, '#e6eaee');
  glow(x, 1480, 230, 300, 'rgba(180,210,255,0.3)');
  paintDome(x, 1260, 760, 1.25, '#0b1420', 'rgba(255,170,100,0.14)');
  paintSkyline(x, 71, 800, 280, '#0c1520', 0.7);
  fog(x, 560, 900, 'rgba(110,140,175,0.28)', 1);
  paintSkyline(x, 83, 900, 220, '#0f1822', 0.9, { noDomes: true });
  x.fillStyle = '#0f1822'; x.fillRect(0, 895, W, H - 895);
  // foreground roof with chimney and our man, silhouetted
  x.fillStyle = '#05070a';
  poly(x, [0, H, 0, 930, 820, 900, 1100, 930, 1100, H], '#05070a');
  x.fillRect(180, 760, 90, 160); x.fillRect(170, 750, 110, 16);
  x.fillRect(190, 720, 16, 32); x.fillRect(222, 720, 16, 32); x.fillRect(254, 720, 16, 32);
  painterly(c, { strokes: 80000 });
  canvasWeave(x);
  TITLE_BG = c;
  return c;
}

const Title = {
  t: 0, planeT: 4,
  show() {
    G.mode = 'title'; G.fade = 1; G.fadeTo = 0; G.paused = false;
    G.overlay = null; G.choices = null; G.speech = [];
    this.t = 0;
    this.rain = this.rain || new Rain(360, { color: 'rgba(190,215,235,0.28)', angle: 0.22 });
    this.jack = makeFigure('jackTux', 720, 902, { scale: 1.9, facing: 1, seed: 1 });
    Sound.setAmbience(['rain', 'wind', 'sirens', 'churchBell']);
    Sound.setMusicFilter(18000);
    Sound.playMusic('title');
  },
  items() {
    const list = [{ text: 'New Mission', act: () => newGame() }];
    if (hasSave()) list.unshift({ text: 'Continue Mission', act: () => loadGame() });
    if (EMBEDDED) list.push({ text: 'Exit to FlipPilot', act: () => exitToApp() });
    else list.push({ text: document.fullscreenElement ? 'Exit Full Screen' : 'Play Full Screen', act: () => toggleFullscreen() });
    return list.map((it, i) => ({ ...it, x: 120, y: 690 + i * 74, w: 460, h: 62 }));
  },
  click(x, y) {
    if (this.t < 0.4) return;
    Sound.playMusic('title');
    const r = this.items().find(r => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h);
    if (r) { Sound.sfx('click'); r.act(); }
  },
  draw(ctx, dt) {
    this.t += dt;
    const bg = titleBg();
    const z = 1 + Math.min(this.t, 40) * 0.0015;
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.drawImage(bg, -W / 2, -H / 2); ctx.restore();
    // searchlights
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const [sx, sp, ph] of [[1000, 0.33, 0], [1650, 0.27, 2], [420, 0.4, 4]]) {
      const a = Math.sin(this.t * sp + ph) * 0.55, len = 1300, hw = 0.05;
      ctx.fillStyle = linGrad(ctx, sx, H, sx + Math.sin(a) * len, H - Math.cos(a) * len, [[0, 'rgba(200,220,255,0.2)'], [1, 'rgba(0,0,0,0)']]);
      ctx.beginPath(); ctx.moveTo(sx, H); ctx.lineTo(sx + Math.sin(a - hw) * len, H - Math.cos(a - hw) * len); ctx.lineTo(sx + Math.sin(a + hw) * len, H - Math.cos(a + hw) * len); ctx.fill();
    }
    ctx.restore();
    // the stealth plane passing overhead
    this.planeT -= dt;
    if (this.planeT < 0) {
      const p = -this.planeT / 7;
      if (p > 1) this.planeT = 12 + Math.random() * 6;
      else drawStealth(ctx, W + 200 - p * (W + 500), 200 + p * 60, 1.1 - p * 0.3);
    }
    // our man on the roof
    this.jack.crouch = 0;
    drawFigure(ctx, this.jack, this.t, { ambient: 'rgba(0,0,0,0.72)', key: 'rgba(160,190,230,0.35)', keyX: 1480 });
    this.rain.update(dt); this.rain.draw(ctx);
    drawVignette(ctx, 0.8);
    drawGrain(ctx, 0.07);

    // title type
    const a = clamp((this.t - 0.4) / 1.4, 0, 1);
    ctx.save(); ctx.globalAlpha = a;
    ctx.textAlign = 'left';
    ctx.font = `600 34px ${FONT_UI}`; ctx.fillStyle = '#f0b35b';
    ctx.fillText('O P E R A T I O N', 124, 300);
    ctx.font = `italic 700 168px ${FONT_DISPLAY}`;
    ctx.shadowColor = 'rgba(240,179,91,0.35)'; ctx.shadowBlur = 40;
    ctx.fillStyle = '#efe4cc'; ctx.fillText('Nightglass', 110, 450);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(240,179,91,0.8)'; ctx.fillRect(124, 490, 90, 3);
    ctx.font = `500 30px ${FONT_UI}`; ctx.fillStyle = '#cfc6b4';
    ctx.fillText('Vienna, 1987. One night. One microfilm. No second chances.', 124, 540);
    ctx.font = `600 22px ${FONT_UI}`; ctx.fillStyle = 'rgba(207,198,180,0.7)';
    ctx.fillText(`CHAPTER ${CHAPTER.number}  ·  ${CHAPTER.place}`, 124, 580);
    // menu
    ctx.font = `600 44px ${FONT_UI}`;
    for (const r of this.items()) {
      const hov = G.mouse.x > r.x && G.mouse.x < r.x + r.w && G.mouse.y > r.y && G.mouse.y < r.y + r.h;
      ctx.fillStyle = hov ? '#f0b35b' : '#e6dcc6';
      ctx.fillText((hov ? '—  ' : '') + r.text, 124, r.y + 46);
    }
    ctx.font = `500 22px ${FONT_UI}`; ctx.fillStyle = 'rgba(207,198,180,0.55)';
    ctx.fillText(Sound.ctx ? 'Fully voiced  ·  Headphones recommended  ·  F for full screen  ·  M to mute' : (G.touch ? 'Tap anywhere to switch on sound' : 'Click anywhere to switch on sound  ·  F for full screen'), 124, H - 60);
    ctx.textAlign = 'right';
    ctx.fillText('A tribute to the Delphine spy adventures of 1990', W - 64, H - 60);
    ctx.restore();
  },
};

// F-117-style faceted flying wing.
function drawStealth(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  poly(ctx, [-110, 0, 60, -18, 80, 0, 60, 18], '#05080c');
  poly(ctx, [-30, 0, 40, -70, 60, -62, 30, 0], '#070a0f');
  poly(ctx, [-30, 0, 40, 70, 60, 62, 30, 0], '#070a0f');
  poly(ctx, [50, -8, 80, -28, 86, -24, 64, -4], '#05080c');
  glow(ctx, 40, -66, 10, 'rgba(255,60,60,0.9)', Math.sin(G.t * 6) > 0 ? 1 : 0.1);
  ctx.restore();
}

// Typewritten story pages over the city.
const TextScreen = {
  pages: [], i: 0, chars: 0, t: 0, resolve: null,
  play(pages, music) {
    return new Promise(resolve => {
      this.pages = pages; this.i = 0; this.chars = 0; this.t = 0; this.resolve = resolve;
      G.mode = 'text'; G.fadeTo = 0;
      if (music) Sound.playMusic(music);
      Sound.setMusicFilter(18000);
      Sound.setAmbience(pages[0].amb || ['rain']);
      this.narrate();
    });
  },
  narrate() {
    const p = this.pages[this.i];
    if (p) Voice.speak('narrator', p.text);
  },
  skip() {
    const p = this.pages[this.i];
    if (!p) return;
    const full = p.text.length;
    if (this.chars < full) { this.chars = full; return; }
    Sound.sfx('click');
    this.i++; this.chars = 0; this.t = 0;
    if (this.pages[this.i]) {
      if (this.pages[this.i].amb) Sound.setAmbience(this.pages[this.i].amb);
      this.narrate();
    }
    if (this.i >= this.pages.length) {
      Voice.stop();
      const r = this.resolve; this.resolve = null;
      G.fade = 1;
      r && r();
    }
  },
  draw(ctx, dt) {
    this.t += dt;
    const bg = titleBg();
    const z = 1.1 + this.t * 0.004;
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.drawImage(bg, -W / 2 - 200, -H / 2 + 60); ctx.restore();
    ctx.fillStyle = 'rgba(3,6,10,0.72)'; ctx.fillRect(0, 0, W, H);
    drawGrain(ctx, 0.08);
    drawVignette(ctx, 0.9);
    const p = this.pages[this.i];
    if (!p) return;
    const before = Math.floor(this.chars);
    this.chars = Math.min(p.text.length, this.chars + dt * 42);
    if (Math.floor(this.chars) !== before && p.text[Math.floor(this.chars)] !== ' ' && Math.floor(this.chars) % 2 === 0) Sound.sfx('typewriter');
    ctx.save();
    ctx.textAlign = 'left';
    const x = 300;
    if (p.kicker) {
      ctx.font = `600 28px ${FONT_UI}`; ctx.fillStyle = '#f0b35b';
      ctx.fillText(p.kicker.split('').join(String.fromCharCode(8202)), x, 360);
      ctx.fillStyle = 'rgba(240,179,91,0.7)'; ctx.fillRect(x, 378, 70, 2);
    }
    ctx.font = p.big ? `italic 700 96px ${FONT_DISPLAY}` : `400 44px ${FONT_TYPE}`;
    ctx.fillStyle = '#ece2cc';
    const lines = wrapText(ctx, p.text, 1320);
    let left = Math.floor(this.chars);
    lines.forEach((l, k) => {
      const show = l.slice(0, Math.max(0, left));
      left -= l.length + 1;
      ctx.fillText(show, x, 460 + k * (p.big ? 110 : 66));
    });
    if (this.chars >= p.text.length && Math.sin(this.t * 4) > 0) {
      ctx.font = `600 24px ${FONT_UI}`; ctx.fillStyle = 'rgba(207,198,180,0.75)';
      ctx.fillText(this.i < this.pages.length - 1 ? 'CLICK TO CONTINUE' : 'CLICK TO BEGIN', x, H - 140);
    }
    ctx.restore();
  },
};

const INTRO = [
  { kicker: 'VIENNA  ·  14 NOVEMBER 1987', text: 'Three days ago, the plans for NIGHTGLASS, the West\'s first invisible stealth fighter, vanished from a hangar in the Nevada desert.' },
  { kicker: 'THE TRAIL', text: 'It ends here, at the consulate of the People\'s Republic of Karvonia. Tonight its military attaché, Colonel Dragan Vasko, is throwing himself a birthday gala.' },
  { kicker: 'THE DEADLINE', text: 'At midnight the microfilm leaves Vienna in a diplomatic bag. Nobody can touch a diplomatic bag. So it must never reach one.' },
  { kicker: 'THE AGENT', text: 'Your name is Jack Harrow. Officially, you are not in Austria.' },
];
// Each chapter ships on its own; the last scene always ends on a cliffhanger.
const CHAPTER = { number: 'ONE', place: 'VIENNA', next: 'Chapter Two: Karvograd', nextWhen: 'ARRIVING NEXT MONTH' };
const OUTRO = [
  { kicker: 'THE RINGSTRASSE  ·  23:52', amb: ['rain', 'traffic', 'sirens'], text: 'The car is waiting at the bottom of the cable, engine running. Ilse drives without a word.' },
  { kicker: 'A FLAT ABOVE THE GRABEN  ·  06:10', amb: ['birds', 'traffic'], text: 'Dawn over Vienna. Ilse\'s attic smells of coffee and gun oil. The microfilm is still warm in Jack\'s pocket.' },
];
const CLIFFHANGER = [
  { kicker: 'END OF CHAPTER ONE', text: 'Who pulled the trigger?', big: true, amb: [] },
  { kicker: 'ARRIVING NEXT MONTH', text: 'Chapter Two: Karvograd.', big: true },
];

const Ending = {
  // After the rooftop escape: the drive, then the safe house scene.
  async play() {
    G.fade = 1;
    await TextScreen.play(OUTRO, 'end');
    G.mode = 'play'; G.paused = false; G.speech = []; G.choices = null; G.overlay = null;
    G.sceneId = null;
    G.fade = 1;
    await gotoScene('safehouse', 300, 910, 1, { instant: true });
  },
  async cliffhanger() {
    await TextScreen.play(CLIFFHANGER, 'tension');
    Title.show();
  },
};

async function newGame() {
  G.flags = {}; G.inv = []; G.sel = null; G.objective = '';
  store.del('nightglass_save');
  G.fade = 1;
  await TextScreen.play(INTRO, 'hotel');
  startPlay();
  G.sceneId = null;
  G.fade = 1;
  await gotoScene('hotel', 960, 930, 1, { instant: true });
}

// ---------- boot ------------------------------------------------------------------
async function boot() {
  try { if (document.fonts && document.fonts.ready) await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]); }
  catch (e) { /* fonts optional */ }
  // Pre-paint the title while the loading card shows.
  titleBg();
  const load = document.getElementById('loading');
  if (load) load.hidden = true;
  Title.show();
  requestAnimationFrame(frame);
  // Paint the remaining scenes in idle time so scene changes are instant.
  const queue = Object.keys(SCENES);
  const next = () => {
    const id = queue.shift();
    if (!id) return;
    sceneBg(id);
    setTimeout(next, 60);
  };
  setTimeout(next, 800);
}
boot();
