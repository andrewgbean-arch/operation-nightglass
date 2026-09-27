// ---------------------------------------------------------------------------
// Chapter Five: The Golden Horn — title card, story pages and the ending.
// ---------------------------------------------------------------------------
const CHAPTER = {
  number: 'FIVE', place: 'THE GOLDEN HORN', saveKey: 'nightglass5_save',
  tagline: 'Istanbul, 1987. One auction. One false moustache. One goose too many.',
  textAmbience: ['gulls', 'water'],
  jackLook: () => flag('dupont') ? 'jackDupont' : flag('towel') ? 'jackTowel' : 'jackBaker',
  onScene() { Goose.reset(); },
  update() { if (Goose.visible() && !Goose.running) Goose.update(); },
  drawOver(ctx, t) { if (Goose.visible()) Goose.draw(ctx, t); },
  paintTitle: paintTitle5,
  title: {
    look: 'jackDupont', jackX: 640, jackY: 1000,
    ambience: ['gulls', 'water'],
    light: { ambient: 'rgba(0,0,0,0.7)', key: 'rgba(255,190,120,0.45)', keyX: 1340 },
    weather: () => ({ update() {}, draw() {} }),
    fx(ctx, t) {
      // gulls wheeling over the water
      for (let k = 0; k < 6; k++) {
        const x = (k * 330 + t * (30 + k * 6)) % (W + 200) - 100, y = 300 + k * 40 + Math.sin(t * 1.5 + k) * 20;
        ctx.strokeStyle = '#1a0e1a'; ctx.lineWidth = 3; const f = Math.sin(t * 6 + k) * 8;
        ctx.beginPath(); ctx.moveTo(x - 16, y - f); ctx.quadraticCurveTo(x - 6, y - 10, x, y); ctx.quadraticCurveTo(x + 6, y - 10, x + 16, y - f); ctx.stroke();
      }
    },
  },
};

const INTRO = [
  { kicker: 'PREVIOUSLY', amb: ['jetIdle'], text: 'Disguised as the village baker\'s boy, Jack photographed Nightglass inside the mountain, found Vasko\'s flight plan, and hid in the aircraft\'s equipment bay a moment before it took off for Istanbul.' },
  { kicker: 'SOMEWHERE OVER THE BLACK SEA', amb: ['jetIdle'], text: 'Five hours in a freezing, roaring, pitch-black box, with a goose. Neither of them enjoyed it.' },
  { kicker: 'ISTANBUL  ·  3 DECEMBER 1987  ·  06:10', amb: ['gulls', 'water'], text: 'Dawn on the Asian shore. Tonight Colonel Vasko sells Nightglass to the highest bidder.' },
];
const CLIFFHANGER = [
  { kicker: 'VIENNA  ·  THE SAME MOMENT', amb: ['clock'], text: 'In a flat above the Graben, Madame Novak takes off her headphones, very slowly, and puts down her cup of tea.' },
  { kicker: 'END OF CHAPTER FIVE', text: 'Going, going, gone.', big: true, amb: ['water'] },
  { kicker: 'ARRIVING SOON', text: 'Chapter Six: Masquerade.', big: true },
];

const Ending = {
  async cliffhanger() {
    await TextScreen.play(CLIFFHANGER, 'tension');
    Title.show();
  },
};

async function newGame() {
  G.flags = {}; G.inv = ['minox']; G.sel = null; G.objective = '';
  store.del(CHAPTER.saveKey);
  G.fade = 1;
  await TextScreen.play(INTRO, 'tension');
  startPlay();
  G.sceneId = null;
  G.fade = 1;
  await gotoScene('strip', 640, 900, 1, { instant: true });
}
