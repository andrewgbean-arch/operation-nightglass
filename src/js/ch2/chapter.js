// ---------------------------------------------------------------------------
// Chapter Two: Karvograd — title card, story pages and the ending.
// ---------------------------------------------------------------------------
const CHAPTER = {
  number: 'TWO', place: 'KARVOGRAD', saveKey: 'nightglass2_save',
  tagline: 'Karvograd, 1987. One train. One portrait. No way back.',
  textAmbience: ['snowWind'],
  jackLook: () => flag('railCoat') ? 'jackRail' : 'jackCoat',
  onScene() {
    G.jack.pushing = !!flag('trolley') && !flag('trolleyParked');
    G.jack.arm = G.jack.pushing ? 'push' : 'rest';
  },
  paintTitle(x) {
    // Karvograd at night in the snow, seen from the end of a platform
    x.fillStyle = linGrad(x, 0, 0, 0, H, [[0, '#03060e'], [0.6, '#101c30'], [1, '#1c2436']]); x.fillRect(0, 0, W, H);
    ellipse(x, 1500, 210, 44, 44, '#e8ecf2'); glow(x, 1500, 210, 280, 'rgba(180,200,255,0.28)');
    paintMountains(x, 21, 700, 260, '#0e182a', 'rgba(200,215,240,0.35)');
    fog(x, 540, 780, 'rgba(150,170,200,0.25)', 1);
    paintKarvogradSkyline(x, 820, '#0a111c', 0.8, 13);
    x.fillStyle = '#0a111c'; x.fillRect(0, 815, W, H - 815);
    // platform canopy and a lamp, silhouetted
    x.fillStyle = '#04060a'; x.fillRect(0, 0, W, 40);
    for (let k = 0; k < 12; k++) { x.fillRect(k * 170, 40, 8, 40); }
    x.fillRect(0, 76, W, 10);
    // the Iron Arrow's locomotive, headlamp blazing, on the right
    x.fillStyle = '#05070a';
    x.fillRect(1380, 560, 540, 320); x.fillRect(1460, 470, 80, 100); x.fillRect(1700, 500, 220, 80);
    x.beginPath(); x.ellipse(1380, 720, 60, 160, 0, 0, 7); x.fill();
    glow(x, 1330, 690, 60, 'rgba(255,240,200,1)');
    glow(x, 1330, 690, 320, 'rgba(255,220,160,0.45)');
    x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.25;
    poly(x, [1330, 680, 1330, 700, 0, 1000, 0, 420], '#ffe8b8'); x.restore();
    x.fillStyle = '#b31c2e'; x.fillRect(1380, 820, 540, 12);
    // snowy platform in the foreground
    x.fillStyle = linGrad(x, 0, 900, 0, H, [[0, '#8a96a6'], [1, '#2a3040']]); x.fillRect(0, 900, W, H - 900);
    x.fillStyle = '#d8d0b8'; x.fillRect(0, 896, 1380, 8);
  },
  title: {
    look: 'jackCoat', jackX: 700, jackY: 960,
    ambience: ['snowWind', 'steam', 'stationFar'],
    light: { ambient: 'rgba(0,0,0,0.7)', key: 'rgba(255,230,180,0.5)', keyX: 1330 },
    weather: () => new Snow(420, { wind: 120, speed: 110 }),
    fx(ctx, t) {
      // steam drifting off the locomotive across the headlamp
      for (let k = 0; k < 8; k++) {
        const p = (t * 0.08 + k / 8) % 1;
        ctx.save(); ctx.globalAlpha = (1 - p) * 0.12;
        ellipse(ctx, 1500 - p * 900, 460 - p * 220 + Math.sin(k * 2) * 40, 80 + p * 260, 50 + p * 110, '#d8e0ea');
        ctx.restore();
      }
      glow(ctx, 1330, 690, 90, 'rgba(255,240,210,0.6)', 0.85 + 0.15 * Math.sin(t * 7));
    },
  },
};

const INTRO = [
  { kicker: 'PREVIOUSLY', amb: ['rain', 'sirens'], text: 'Jack Harrow stole the Nightglass microfilm from Colonel Vasko\'s safe and escaped across the rooftops of Vienna.' },
  { kicker: 'VIENNA  ·  15 NOVEMBER 1987  ·  06:14', amb: ['birds', 'clock'], text: 'But the film was a decoy, his contact Ilse was working for Vasko, and the last thing Jack heard was a gunshot.' },
];
const TRAIN_PAGES = [
  { kicker: 'FIVE DAYS LATER', amb: ['trainRumble', 'snowWind'], text: 'Friday night. The Danube Arrow climbs out of Austria towards the Karvonian border, through snow that has not stopped since Tuesday.' },
];
const ARRIVAL_PAGES = [
  { kicker: 'KARVOGRAD CENTRAL  ·  22:51', amb: ['stationHall', 'snowWind'], text: 'Karvograd. Onion domes, factory chimneys, soldiers on every platform, and Colonel Vasko\'s face on every wall.' },
];
const CLIFFHANGER = [
  { kicker: 'END OF CHAPTER TWO', text: 'Tickets, please.', big: true, amb: ['trainRumble'] },
  { kicker: 'ARRIVING NEXT MONTH', text: 'Chapter Three: The Iron Arrow.', big: true },
];

const Ending = {
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
  await TextScreen.play(INTRO, 'tension');
  startPlay();
  G.sceneId = null;
  G.fade = 1;
  await gotoScene('flat', 780, 990, -1, { instant: true, sfx: 'gunshot' });
}
