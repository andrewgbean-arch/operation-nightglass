// ---------------------------------------------------------------------------
// Chapter Three: The Iron Arrow — title card, story pages and the ending.
// ---------------------------------------------------------------------------
const CHAPTER = {
  number: 'THREE', place: 'THE IRON ARROW', saveKey: 'nightglass3_save',
  tagline: 'The Iron Arrow, 1987. One train. One waiter. Three geese.',
  textAmbience: ['trainRumble', 'snowWind'],
  jackLook: () => flag('waiter') ? 'jackWaiter' : 'jackCoat',
  onScene() { Geese.reset(); },
  update() { if (geeseWithJack()) Geese.update(); },
  drawOver(ctx, t) {
    if (geeseWithJack()) Geese.draw(ctx, t);
    // after the bread hits the carpet: geese everywhere in first class
    if (G.sceneId === 'first' && flag('geeseLoose')) {
      for (let k = 0; k < 3; k++) {
        const p = t * (0.35 + k * 0.1) + k * 2;
        const x = 900 + Math.sin(p) * (260 + k * 60), y = 930 + Math.cos(p * 1.7) * 50;
        drawGoose(ctx, x, y, depthScale(y) * 0.42, t * 1.6 + k, Math.cos(p) > 0 ? 1 : -1);
      }
    }
  },
  paintTitle: paintTitle3,
  title: {
    look: 'jackCoat', jackX: 700, jackY: 990,
    ambience: ['snowWind', 'trainRumble'],
    light: { ambient: 'rgba(0,0,0,0.72)', key: 'rgba(200,215,255,0.4)', keyX: 1500 },
    weather: () => new Snow(360, { wind: 90, speed: 100 }),
    fx(ctx, t) {
      // smoke from the locomotive streaming back along the viaduct
      for (let k = 0; k < 10; k++) {
        const p = (t * 0.06 + k / 10) % 1;
        ctx.save(); ctx.globalAlpha = (1 - p) * 0.07;
        ellipse(ctx, 1860 - p * 1500, 380 - p * 120 + Math.sin(k * 2) * 30, 60 + p * 220, 40 + p * 90, '#b8c2d0');
        ctx.restore();
      }
      glow(ctx, 1905, 500, 90, 'rgba(255,240,210,0.6)', 0.85 + 0.15 * Math.sin(t * 7));
    },
  },
};

// In the Iron Arrow's kitchen, Franz wears the chef's whites.
Object.assign(FACES.franz, { hairStyle: 'chef', outfit: 'waiter', coat: '#f2eee6', collar: '#f2eee6', tie: '#9e1f28' });

function geeseWithJack() {
  return flag('geeseFollowing') && !flag('geeseLoose') && ['van3', 'corridor', 'dining', 'first'].includes(G.sceneId);
}

const INTRO = [
  { kicker: 'PREVIOUSLY', amb: ['trainRumble', 'snowWind'], text: 'Jack Harrow stole Colonel Vasko\'s portrait, and the Nightglass plans hidden inside it, and fought his way along the roof of the Iron Arrow.' },
  { kicker: 'THE IRON ARROW  ·  00:40', amb: ['trainRumble'], text: 'He hid the plans under a mattress. Then the door opened, and there stood Vasko, Kolar, and Ilse.' },
];
const CLIFFHANGER = [
  { kicker: 'END OF CHAPTER THREE', text: 'It is already flying.', big: true, amb: ['snowWind'] },
  { kicker: 'MEANWHILE, IN FIRST CLASS', text: 'Aunt Olga has been standing on an armchair for four hours. The geese have not moved.', amb: ['trainRumble', 'geese'] },
  { kicker: 'ARRIVING SOON', text: 'Chapter Four: Nightglass.', big: true },
];

const Ending = {
  async cliffhanger() {
    await TextScreen.play(CLIFFHANGER, 'tension');
    Title.show();
  },
};

async function newGame() {
  G.flags = {}; G.inv = []; G.sel = null; G.objective = '';
  store.del(CHAPTER.saveKey);
  TrainBrake.checkpoint = 0;
  G.fade = 1;
  await TextScreen.play(INTRO, 'tension');
  startPlay();
  G.sceneId = null;
  G.fade = 1;
  await gotoScene('cell', 520, 910, 1, { instant: true });
}
