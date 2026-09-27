// ---------------------------------------------------------------------------
// Chapter Seven: The Wall — title card, story pages and the ending.
// ---------------------------------------------------------------------------
const CHAPTER = {
  number: 'SEVEN', place: 'THE WALL', saveKey: 'nightglass7_save',
  tagline: 'East Berlin, 1987. Wanted by both sides. Armed with a goose and a pair of fishnet tights.',
  textAmbience: ['wind', 'tram'],
  jackLook: () => flag('cleaner') ? 'jackCleaner' : 'jackCoat',
  onScene() { Goose.reset(); },
  update() { if (Goose.visible()) Goose.update(); },
  drawOver(ctx, t) { if (Goose.visible()) Goose.draw(ctx, t); },
  paintTitle: paintTitle7,
  title: {
    look: 'jackCoat', jackX: 520, jackY: 960,
    ambience: ['wind', 'dogs'],
    light: { ambient: 'rgba(0,4,20,0.55)', key: 'rgba(255,245,210,0.4)', keyX: 1400 },
    weather: () => new Snow(160, { wind: 40, speed: 70 }),
    fx() {},
  },
};

const INTRO = [
  { kicker: 'PREVIOUSLY', amb: ['water'], text: 'In Venice, the London buyer took off his mask: Control, Madame Novak\'s son. At dawn a telex went to every British embassy in Europe. Jack Harrow: traitor. Detain on sight.' },
  { kicker: 'A WEEK LATER', amb: ['wind'], text: 'Every road West is watched. So Jack goes where no British agent would ever go, and no British embassy can reach him: East Berlin. Ilse sent a telegram. It said only: "Come. Bring the goose."' },
  { kicker: 'EAST BERLIN  ·  12 DECEMBER 1987  ·  16:00', amb: ['wind', 'tram'], text: 'Prenzlauer Berg: coal smoke, grey snow, and a courtyard where a man is shouting at a Trabant.' },
];
const CLIFFHANGER = [
  { kicker: 'LONDON  ·  THE SAME MORNING', amb: ['clock'], text: 'In an office above Whitehall a telex arrives: HARROW CROSSED TO WEST BERLIN 06:10. CARRYING STASI FILE, AS EXPECTED. Control reads it twice, and stirs his tea. Loudly.' },
  { kicker: 'END OF CHAPTER SEVEN', text: 'Fake.', big: true, amb: ['wind'] },
  { kicker: 'ARRIVING SOON', text: 'Chapter Eight: All In.', big: true },
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
  await gotoScene('hof', 200, 960, 1, { instant: true });
}
