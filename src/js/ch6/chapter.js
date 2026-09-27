// ---------------------------------------------------------------------------
// Chapter Six: Masquerade — title card, story pages and the ending.
// ---------------------------------------------------------------------------
const CHAPTER = {
  number: 'SIX', place: 'MASQUERADE', saveKey: 'nightglass6_save',
  tagline: 'Venice, 1987. One masked ball. Two glass swans. Only one of them is a swan.',
  textAmbience: ['water', 'bells'],
  jackLook: () => flag('gondolier') ? 'jackGondolier' : 'jackCoat',
  onScene() { Goose.reset(); },
  update() { if (Goose.visible()) Goose.update(); },
  drawOver(ctx, t) { if (Goose.visible()) Goose.draw(ctx, t); },
  paintTitle: paintTitle6,
  title: {
    look: 'jackGondolier', jackX: 470, jackY: 926,
    ambience: ['water', 'bells'],
    light: { ambient: 'rgba(0,4,20,0.6)', key: 'rgba(180,200,255,0.4)', keyX: 1480 },
    weather: () => ({ update() {}, draw() {} }),
    fx(ctx, t) {
      // moonlight glittering on the water
      for (let k = 0; k < 40; k++) {
        const x = 1480 + Math.sin(k * 7.3) * (60 + k * 6), y = 740 + k * 8, a = 0.25 + 0.25 * Math.sin(t * 3 + k);
        ctx.fillStyle = `rgba(220,230,255,${a})`; ctx.fillRect(x - 20, y, 40 + (k % 5) * 6, 2);
      }
    },
  },
};

const INTRO = [
  { kicker: 'PREVIOUSLY', amb: ['water'], text: 'In Istanbul, Nightglass was sold for fifty million dollars to a bidder on the telephone, who asked for the goose as well. By name. Madame Novak\'s tulip was listening.' },
  { kicker: 'THE ADRIATIC  ·  TWO DAYS LATER', amb: ['water', 'gulls'], text: 'Jack left Istanbul on a freighter full of hazelnuts, with a goose who ate a great many of them. The freighter was going to Venice. So, it turns out, was the buyer.' },
  { kicker: 'VENICE  ·  5 DECEMBER 1987  ·  17:00', amb: ['water', 'bells'], text: 'Fog on the canals, bells in the fog, and a masked ball tonight at the Palazzo Ca\' Rosa.' },
];
const CLIFFHANGER = [
  { kicker: 'LONDON  ·  07:02', amb: ['clock'], text: 'In a basement in Whitehall a telex machine begins to chatter. The same message goes to every British embassy, consulate and border post in Europe.' },
  { kicker: 'PRIORITY  ·  MOST SECRET', text: 'HARROW, JACK. AGENT. NOW TRAITOR. DETAIN ON SIGHT.  ALSO ONE GOOSE, WHITE, ANSWERS TO "COLONEL". ALSO TRAITOR.' },
  { kicker: 'END OF CHAPTER SIX', text: 'Wanted.', big: true, amb: ['water'] },
  { kicker: 'ARRIVING SOON', text: 'Chapter Seven: The Wall.', big: true },
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
  await gotoScene('riva', 140, 960, 1, { instant: true });
}
