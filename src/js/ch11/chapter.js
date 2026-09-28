// ---------------------------------------------------------------------------
// Chapter Eleven: White Out — title card, story pages and the ending.
// ---------------------------------------------------------------------------
const CHAPTER = {
  number: 'ELEVEN', place: 'WHITE OUT', saveKey: 'nightglass11_save',
  tagline: 'Svalbard, 1988. The top of the world, a sun that won\'t set, twelve aircraft in woolly jumpers, and a very large knitting machine.',
  textAmbience: ['snowWind'],
  jackLook: () => flag('woolly') ? 'jackWool' : 'jackParka',
  onScene() { Goose.reset(); },
  update() { if (Goose.visible()) Goose.update(); },
  drawOver(ctx, t) { if (Goose.visible()) Goose.draw(ctx, t); },
  paintTitle: paintTitle11,
  title: {
    look: 'jackParka', jackX: 560, jackY: 1000,
    ambience: ['snowWind', 'huskies'],
    light: { ambient: 'rgba(30,20,60,0.3)', key: 'rgba(255,200,160,0.45)', keyX: 1520 },
    weather: () => new Snow(160, { wind: 90, speed: 70 }),
    fx() {},
  },
};

const INTRO = [
  { kicker: 'PREVIOUSLY', amb: ['rain'], text: 'In London, Control signed the bill "Jack Harrow" at tea, and was arrested. He was only the middleman. The buyer never needed to buy anything, because Colonel Vasko has a sister: Aunt Olga.' },
  { kicker: 'LONDON  ·  APRIL 1988', amb: ['clock'], text: 'The Minister gives Jack his job back, and a medal he isn\'t allowed to wear. American satellites have photographed twelve shapes on the ice at Svalbard, under something white and woolly. On May Day, Olga\'s fleet flies to Moscow.' },
  { kicker: 'KAPP NORD RESEARCH STATION  ·  SVALBARD  ·  29 APRIL 1988  ·  02:00', amb: ['snowWind', 'huskies'], text: 'This far north in April, the sun doesn\'t set. It just goes round and round, like a dog looking for somewhere to lie down. Across the fjord, a column of steam rises from something that isn\'t a weather station.' },
];
const CLIFFHANGER = [
  { kicker: 'OVER THE BARENTS SEA  ·  11:40', amb: ['jetIdle'], text: 'Twelve black aircraft in close formation, every one of them in a woolly cover with geese on it, and behind them a transport called Babushka, carrying a knitting machine, a goose, a spy in a new jumper, and Aunt Olga, who has cut him a very large slice of cake.' },
  { kicker: 'MOSCOW  ·  THE KREMLIN', amb: ['wind'], text: 'Tomorrow is May Day. Red Square is swept, the flags are up, and the General Secretary is practising his wave.' },
  { kicker: 'END OF CHAPTER ELEVEN', text: 'Knit one, purl one.', big: true, amb: ['jetIdle'] },
  { kicker: 'ARRIVING SOON', text: 'Chapter Twelve: Last Light.', big: true },
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
  await gotoScene('station', 300, 960, 1, { instant: true });
}
