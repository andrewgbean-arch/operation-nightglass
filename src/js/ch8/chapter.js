// ---------------------------------------------------------------------------
// Chapter Eight: All In — title card, story pages and the ending.
// ---------------------------------------------------------------------------
const CHAPTER = {
  number: 'EIGHT', place: 'ALL IN', saveKey: 'nightglass8_save',
  tagline: 'Monte Carlo, 1987. One table. Forty million francs. A borrowed dinner jacket with a soufflé stain.',
  textAmbience: ['water', 'gulls'],
  jackLook: () => flag('tux') ? 'jackTux' : 'jackCoat',
  onScene() { Goose.reset(); },
  update() { if (Goose.visible()) Goose.update(); },
  drawOver(ctx, t) { if (Goose.visible()) Goose.draw(ctx, t); },
  paintTitle: paintTitle8,
  title: {
    look: 'jackTux', jackX: 560, jackY: 1000,
    ambience: ['water', 'f1'],
    light: { ambient: 'rgba(0,4,20,0.5)', key: 'rgba(255,210,150,0.4)', keyX: 1180 },
    weather: () => ({ update() {}, draw() {} }),
    fx(ctx, t) {
      // fireworks over the harbour, now and then
      const p = (t % 6) / 6, x = 1500, y = 200;
      if (p < 0.5) for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, r = p * 260; ctx.fillStyle = `rgba(255,${180 + k * 4},120,${1 - p * 2})`; ctx.fillRect(x + Math.cos(a) * r, y + Math.sin(a) * r + p * p * 80, 5, 5); }
    },
  },
};

const INTRO = [
  { kicker: 'PREVIOUSLY', amb: ['wind'], text: 'In East Berlin, Jack stole the Stasi\'s file on Control and crawled under the Wall with it. In the West, Franz read it and called it a fake, planted by Control himself. The goose ate it.' },
  { kicker: 'THE AUTOBAHN, THEN THE AUTOROUTE', amb: ['engine'], text: 'Franz had orders to bring Jack back to London. Instead he drove him south for two days, "to think about it". He is still thinking about it.' },
  { kicker: 'MONTE CARLO  ·  GRAND PRIX WEEKEND  ·  20:00', amb: ['water', 'gulls', 'f1'], text: 'Madame Novak has a yacht in the harbour. She says she can explain the yacht. She cannot explain the yacht.' },
];
const CLIFFHANGER = [
  { kicker: 'OVER THE ALPS  ·  07:10', amb: ['jetIdle'], text: 'Twelve black aircraft in a line, too high to hear, too dark to see, invisible to every radar in Europe. They turn north, towards the snow, and a hangar under a glacier.' },
  { kicker: 'END OF CHAPTER EIGHT', text: 'Twelve.', big: true, amb: ['water'] },
  { kicker: 'ARRIVING SOON', text: 'Chapter Nine: Thin Air.', big: true },
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
  await gotoScene('yacht', 1200, 960, -1, { instant: true });
}
