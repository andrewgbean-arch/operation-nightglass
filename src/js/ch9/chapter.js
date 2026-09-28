// ---------------------------------------------------------------------------
// Chapter Nine: Thin Air — title card, story pages and the ending.
// ---------------------------------------------------------------------------
const CHAPTER = {
  number: 'NINE', place: 'THIN AIR', saveKey: 'nightglass9_save',
  tagline: 'The Swiss Alps, 1987. A hangar under a glacier, a vault inside a mountain, and a ski instructor who can\'t ski.',
  textAmbience: ['snowWind'],
  jackLook: () => flag('instructor') ? 'jackSki' : 'jackCoat',
  onScene() { Goose.reset(); },
  update() { if (Goose.visible()) Goose.update(); },
  drawOver(ctx, t) { if (Goose.visible()) Goose.draw(ctx, t); },
  paintTitle: paintTitle9,
  title: {
    look: 'jackSki', jackX: 560, jackY: 1000,
    ambience: ['snowWind', 'cowbells'],
    light: { ambient: 'rgba(0,4,20,0.5)', key: 'rgba(180,200,255,0.4)', keyX: 1500 },
    weather: () => new Snow(220, { wind: 60, speed: 80 }),
    fx() {},
  },
};

const INTRO = [
  { kicker: 'PREVIOUSLY', amb: ['water'], text: 'In Monte Carlo, Jack beat Colonel Vasko at baccarat and won forty-one million francs. Vasko laughed. While they were playing, all twelve Nightglass aircraft had taken off. "I will see you in the mountains."' },
  { kicker: 'ZÜRICH  ·  TWO DAYS LATER', amb: ['tram'], text: 'Franz has a friend at a bank. The friend has a cousin at another bank. The cousin says the money for Vasko\'s fleet went through Bank Brunner & Cie, whose vault is cut into a mountain above a village called Grindelhorn. Under the same glacier, the cousin says, is something that is not a bank.' },
  { kicker: 'GRINDELHORN  ·  14 DECEMBER 1987  ·  16:30', amb: ['snowWind', 'cowbells'], text: 'Chalets, church bells, a cable car to the glacier, and a banker in a white ski suit shouting at a ski instructor.' },
];
const CLIFFHANGER = [
  { kicker: 'LONDON  ·  THE SAME AFTERNOON', amb: ['clock'], text: 'A telex from Zürich, marked MOST SECRET: ACCOUNT 44-771, HOLDER HARROW J, EIGHTY MILLION FRANCS PAID TO VASKO. Control reads it, stirs his tea, and signs a warrant.' },
  { kicker: 'UNDER THE GLACIER', text: 'Twelve aircraft behind a door of ice that will not open. For now.' },
  { kicker: 'END OF CHAPTER NINE', text: 'Cuckoo.', big: true, amb: ['snowWind'] },
  { kicker: 'ARRIVING SOON', text: 'Chapter Ten: Burn Notice.', big: true },
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
  await gotoScene('village', 300, 960, 1, { instant: true });
}
