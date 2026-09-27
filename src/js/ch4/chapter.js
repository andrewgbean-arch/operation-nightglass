// ---------------------------------------------------------------------------
// Chapter Four: Nightglass — title card, story pages and the ending.
// ---------------------------------------------------------------------------
const CHAPTER = {
  number: 'FOUR', place: 'NIGHTGLASS', saveKey: 'nightglass4_save',
  tagline: 'Zlatá Hora, 1987. One mountain. One baker\'s boy. One very black aircraft.',
  textAmbience: ['snowWind'],
  jackLook: () => flag('baker') ? 'jackBaker' : 'jackCoat',
  onScene() { Goose.reset(); },
  update() { if (Goose.visible()) Goose.update(); },
  drawOver(ctx, t) {
    if (Goose.visible()) Goose.draw(ctx, t);
    // the Minox's flash (strictly, the test lights bouncing off the lens)
    if (G.flash && G.t - G.flash < 0.25) { ctx.save(); ctx.globalAlpha = 0.6 * (1 - (G.t - G.flash) / 0.25); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  },
  paintTitle: paintTitle4,
  title: {
    look: 'jackCoat', jackX: 640, jackY: 990,
    ambience: ['snowWind', 'hangarHum'],
    light: { ambient: 'rgba(0,0,0,0.72)', key: 'rgba(255,210,150,0.4)', keyX: 1330 },
    weather: () => new Snow(320, { wind: 70, speed: 90 }),
    fx(ctx, t) {
      glow(ctx, 1330, 590, 200, 'rgba(255,200,120,0.3)', 0.8 + 0.2 * Math.sin(t * 1.3));
      // a searchlight sweeping the sky above the peak
      const a = -1.9 + Math.sin(t * 0.4) * 0.5;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.12;
      ctx.translate(1380, 200); ctx.rotate(a);
      ctx.fillStyle = linGrad(ctx, 0, 0, 1400, 0, [[0, 'rgba(220,230,255,1)'], [1, 'rgba(220,230,255,0)']]);
      ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(1400, -120); ctx.lineTo(1400, 120); ctx.lineTo(0, 6); ctx.fill();
      ctx.restore();
    },
  },
};

const INTRO = [
  { kicker: 'PREVIOUSLY', amb: ['snowWind'], text: 'Jack rescued Ilse\'s daughter from the Iron Arrow and rode a runaway mail van down the mountain to Zlatá Hora, where Madame Novak revealed she was Control\'s mother.' },
  { kicker: 'AND THEN', amb: ['snowWind'], text: 'Something black flew over the valley without a sound. Colonel Vasko had not stolen the plans to build Nightglass. He had already built it.' },
  { kicker: 'ZLATÁ HORA  ·  2 DECEMBER 1987', amb: ['innChatter', 'brazier'], text: 'Twelve days later. A village inn, a goose called Colonel, and a mountain that hums at night.' },
];
const CLIFFHANGER = [
  { kicker: 'THE EQUIPMENT BAY  ·  23:59', amb: ['jetIdle'], text: 'It is very dark, very cold and very loud. Somewhere above, a voice on the radio: "Nightglass Seven, you are cleared for take-off. Destination Istanbul."' },
  { kicker: 'IN THE DARK', amb: ['jetIdle'], text: 'Jack feels his way along the bay. His hand finds something warm, and feathery. Something says: honk.' },
  { kicker: 'END OF CHAPTER FOUR', text: 'Next stop: Istanbul.', big: true, amb: ['snowWind'] },
  { kicker: 'ARRIVING SOON', text: 'Chapter Five: The Golden Horn.', big: true },
];

const Ending = {
  async cliffhanger() {
    await TextScreen.play(CLIFFHANGER, 'reveal');
    chapterFinished();
    Title.show();
  },
};

async function newGame() {
  G.flags = {}; G.inv = []; G.sel = null; G.objective = '';
  store.del(CHAPTER.saveKey);
  TunnelRun.checkpoint = 0;
  G.fade = 1;
  await TextScreen.play(INTRO, 'tension');
  startPlay();
  G.sceneId = null;
  G.fade = 1;
  await gotoScene('inn', 560, 920, 1, { instant: true });
}
