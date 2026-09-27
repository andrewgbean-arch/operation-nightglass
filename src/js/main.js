// ---------------------------------------------------------------------------
// Main — title screen, story text screens, new game / continue, boot.
// ---------------------------------------------------------------------------

let TITLE_BG = null;
function titleBg() {
  if (!TITLE_BG) {
    const c = makeCanvas(W, H), x = c.getContext('2d');
    CHAPTER.paintTitle(x);
    painterly(c, { strokes: 80000 });
    canvasWeave(x);
    TITLE_BG = c;
  }
  return TITLE_BG;
}

const Title = {
  t: 0,
  show() {
    G.mode = 'title'; G.fade = 1; G.fadeTo = 0; G.paused = false;
    G.overlay = null; G.choices = null; G.speech = [];
    this.t = 0;
    const T = CHAPTER.title;
    this.weather = this.weather || T.weather();
    this.jack = makeFigure(T.look, T.jackX || 720, T.jackY || 902, { scale: 1.9, facing: 1, seed: 1 });
    Sound.setAmbience(T.ambience);
    Sound.setMusicFilter(18000);
    Sound.playMusic('title');
  },
  items() {
    const list = [{ text: 'New Mission', act: () => newGame() }];
    if (hasSave()) list.unshift({ text: 'Continue Mission', act: () => loadGame() });
    if (EMBEDDED) list.push({ text: 'Exit to FlipPilot', act: () => exitToApp() });
    else list.push({ text: document.fullscreenElement ? 'Exit Full Screen' : 'Play Full Screen', act: () => toggleFullscreen() });
    return list.map((it, i) => ({ ...it, x: 120, y: 670 + i * fontPx(72), w: 620, h: fontPx(62) }));
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
    if (CHAPTER.title.fx) CHAPTER.title.fx(ctx, this.t, dt);
    // our man, silhouetted
    this.jack.crouch = 0;
    drawFigure(ctx, this.jack, this.t, CHAPTER.title.light);
    this.weather.update(dt); this.weather.draw(ctx);
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
    ctx.font = `500 ${fontPx(30)}px ${FONT_UI}`; ctx.fillStyle = '#cfc6b4';
    ctx.fillText(CHAPTER.tagline, 124, 540);
    ctx.font = `600 ${fontPx(22)}px ${FONT_UI}`; ctx.fillStyle = 'rgba(207,198,180,0.7)';
    ctx.fillText(`CHAPTER ${CHAPTER.number}  ·  ${CHAPTER.place}`, 124, 540 + fontPx(42));
    // menu
    ctx.font = `600 ${fontPx(44)}px ${FONT_UI}`;
    for (const r of this.items()) {
      const hov = G.mouse.x > r.x && G.mouse.x < r.x + r.w && G.mouse.y > r.y && G.mouse.y < r.y + r.h;
      ctx.fillStyle = hov ? '#f0b35b' : '#e6dcc6';
      ctx.fillText((hov ? '—  ' : '') + r.text, 124, r.y + r.h * 0.75);
    }
    ctx.font = `500 ${fontPx(22)}px ${FONT_UI}`; ctx.fillStyle = 'rgba(207,198,180,0.55)';
    ctx.fillText(Sound.ctx ? 'Fully voiced  ·  Headphones recommended  ·  F for full screen  ·  M to mute' : (G.touch ? 'Tap anywhere to switch on sound' : 'Click anywhere to switch on sound  ·  F for full screen'), 124, H - 60);
    ctx.textAlign = 'right';
    ctx.fillText('A tribute to the Delphine spy adventures of 1990', W - 64, H - 60);
    ctx.restore();
  },
};

// Typewritten story pages over the city.
const TextScreen = {
  pages: [], i: 0, chars: 0, t: 0, resolve: null,
  play(pages, music) {
    return new Promise(resolve => {
      this.pages = pages; this.i = 0; this.chars = 0; this.t = 0; this.resolve = resolve;
      G.mode = 'text'; G.fadeTo = 0;
      if (music) Sound.playMusic(music);
      Sound.setMusicFilter(18000);
      Sound.setAmbience(pages[0].amb || CHAPTER.textAmbience || ['rain']);
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
    const x = 200;
    if (p.kicker) {
      ctx.font = `600 28px ${FONT_UI}`; ctx.fillStyle = '#f0b35b';
      ctx.fillText(p.kicker.split('').join(String.fromCharCode(8202)), x, 360);
      ctx.fillStyle = 'rgba(240,179,91,0.7)'; ctx.fillRect(x, 378, 70, 2);
    }
    ctx.font = p.big ? `italic 700 96px ${FONT_DISPLAY}` : `400 ${fontPx(44)}px ${FONT_TYPE}`;
    ctx.fillStyle = '#ece2cc';
    const lines = wrapText(ctx, p.text, 1520);
    let left = Math.floor(this.chars);
    lines.forEach((l, k) => {
      const show = l.slice(0, Math.max(0, left));
      left -= l.length + 1;
      ctx.fillText(show, x, 460 + k * (p.big ? 110 : fontPx(62)));
    });
    if (this.chars >= p.text.length && Math.sin(this.t * 4) > 0) {
      ctx.font = `600 ${fontPx(24)}px ${FONT_UI}`; ctx.fillStyle = 'rgba(207,198,180,0.75)';
      ctx.fillText(this.i < this.pages.length - 1 ? 'CLICK TO CONTINUE' : 'CLICK TO BEGIN', x, H - 140);
    }
    ctx.restore();
  },
};

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
