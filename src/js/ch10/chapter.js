// ---------------------------------------------------------------------------
// Chapter Ten: Burn Notice — title card, story pages and the ending.
// ---------------------------------------------------------------------------
const CHAPTER = {
  number: 'TEN', place: 'BURN NOTICE', saveKey: 'nightglass10_save',
  tagline: 'London, 1987. Wanted by his own side, hunted through his own city, and down to his last kipper.',
  textAmbience: ['rain'],
  jackLook: () => flag('tieOn') ? 'jackFishTie' : flag('fishCoat') ? 'jackFish' : 'jackCoat',
  onScene() { Goose.reset(); },
  update() { if (Goose.visible()) Goose.update(); },
  drawOver(ctx, t) { if (Goose.visible()) Goose.draw(ctx, t); },
  paintTitle: paintTitle10,
  title: {
    look: 'jackCoat', jackX: 560, jackY: 1000,
    ambience: ['rain', 'traffic'],
    light: { ambient: 'rgba(0,4,20,0.5)', key: 'rgba(255,120,110,0.35)', keyX: 1400 },
    weather: () => new Rain(420, { color: 'rgba(190,210,235,0.3)' }),
    fx() {},
  },
};

const INTRO = [
  { kicker: 'PREVIOUSLY', amb: ['snowWind'], text: 'In the Swiss Alps, Jack stopped a cuckoo clock from opening Colonel Vasko\'s hangar, and found the account that paid for the Nightglass fleet. The name on the account was his own.' },
  { kicker: 'DOVER  ·  THREE DAYS LATER', amb: ['water'], text: 'Franz drove through the night. A fishing boat did the rest. Jack comes ashore with no passport, no money and a goose, and at every station his face is on the front of the Evening Post: TRAITOR. Underneath, smaller: AND GOOSE.' },
  { kicker: 'LAMBETH  ·  16 DECEMBER 1987  ·  21:40', amb: ['rain', 'traffic'], text: 'A chip shop called The Plaice to Be, which for thirty years has been the Service\'s safe house south of the river. And tonight, a policeman eating chips at the counter.' },
];
const CLIFFHANGER = [
  { kicker: 'SVALBARD  ·  THE SAME AFTERNOON', amb: ['snowWind'], text: 'Twelve black aircraft on the ice, in a row, under the northern lights. In a hut at the end of the runway, Aunt Olga is knitting something enormous.' },
  { kicker: 'THE WELLINGTON  ·  16:40', amb: ['cups'], text: 'The Minister has cleared Jack\'s name, paid the bill himself, and apologised to the goose. The goose has not accepted.' },
  { kicker: 'END OF CHAPTER TEN', text: 'Aunt Olga.', big: true, amb: ['rain'] },
  { kicker: 'ARRIVING SOON', text: 'Chapter Eleven: White Out.', big: true },
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
  await gotoScene('chippy', 700, 960, 1, { instant: true });
}
