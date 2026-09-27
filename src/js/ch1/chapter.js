// ---------------------------------------------------------------------------
// Chapter One: Vienna — title card, intro and outro pages, the ending.
// Each chapter ships on its own; the last scene always ends on a cliffhanger.
// ---------------------------------------------------------------------------
const CHAPTER = {
  number: 'ONE', place: 'VIENNA', saveKey: 'nightglass_save',
  tagline: 'Vienna, 1987. One night. One microfilm. No second chances.',
  paintTitle(x) {
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
  },
  title: {
    look: 'jackTux',
    ambience: ['rain', 'wind', 'sirens', 'churchBell'],
    light: { ambient: 'rgba(0,0,0,0.72)', key: 'rgba(160,190,230,0.35)', keyX: 1480 },
    weather: () => new Rain(360, { color: 'rgba(190,215,235,0.28)', angle: 0.22 }),
    fx(ctx, t, dt) {
      // searchlights
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const [sx, sp, ph] of [[1000, 0.33, 0], [1650, 0.27, 2], [420, 0.4, 4]]) {
        const a = Math.sin(t * sp + ph) * 0.55, len = 1300, hw = 0.05;
        ctx.fillStyle = linGrad(ctx, sx, H, sx + Math.sin(a) * len, H - Math.cos(a) * len, [[0, 'rgba(200,220,255,0.2)'], [1, 'rgba(0,0,0,0)']]);
        ctx.beginPath(); ctx.moveTo(sx, H); ctx.lineTo(sx + Math.sin(a - hw) * len, H - Math.cos(a - hw) * len); ctx.lineTo(sx + Math.sin(a + hw) * len, H - Math.cos(a + hw) * len); ctx.fill();
      }
      ctx.restore();
      // the stealth plane passing overhead
      this.planeT = (this.planeT ?? 4) - dt;
      if (this.planeT < 0) {
        const p = -this.planeT / 7;
        if (p > 1) this.planeT = 12 + Math.random() * 6;
        else drawStealth(ctx, W + 200 - p * (W + 500), 200 + p * 60, 1.1 - p * 0.3);
      }
    },
  },
};

const INTRO = [
  { kicker: 'VIENNA  ·  14 NOVEMBER 1987', text: 'Three days ago, the plans for NIGHTGLASS, the West\'s first invisible stealth fighter, vanished from a hangar in the Nevada desert.' },
  { kicker: 'THE TRAIL', text: 'It ends here, at the consulate of the People\'s Republic of Karvonia. Tonight its military attaché, Colonel Dragan Vasko, is throwing himself a birthday gala.' },
  { kicker: 'THE DEADLINE', text: 'At midnight the microfilm leaves Vienna in a diplomatic bag. Nobody can touch a diplomatic bag. So it must never reach one.' },
  { kicker: 'THE AGENT', text: 'Your name is Jack Harrow. Officially, you are not in Austria.' },
];
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
    chapterFinished();
    Title.show();
  },
};

async function newGame() {
  G.flags = {}; G.inv = []; G.sel = null; G.objective = '';
  store.del(CHAPTER.saveKey);
  G.fade = 1;
  await TextScreen.play(INTRO, 'hotel');
  startPlay();
  G.sceneId = null;
  G.fade = 1;
  await gotoScene('hotel', 960, 930, 1, { instant: true });
}

