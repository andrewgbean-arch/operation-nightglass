// ---------------------------------------------------------------------------
// Chapter Eleven: White Out — items, scenes, hotspots, dialogue, puzzles.
// Svalbard under the midnight sun. A research station with a polar bear in the
// bins, a weather balloon with a frozen battery, forty-one bales of wool, and
// Aunt Olga's nuclear-powered knitting machine, which is knitting RAF roundels
// onto the covers of twelve aircraft bound for Red Square.
// ---------------------------------------------------------------------------

const ITEMS = {
  key: {
    name: 'Hut Key',
    desc: 'The key to the hut, where Dr Lund has locked up the goose "for the safety of the thermometer". It has a label: GÅS. That\'s Norwegian for trouble.',
    icon(c) { c.strokeStyle = '#8a8e94'; c.lineWidth = 5; c.beginPath(); c.arc(-14, 0, 11, 0, 7); c.stroke(); c.fillStyle = '#8a8e94'; c.fillRect(-4, -3, 34, 6); c.fillRect(22, 3, 4, 9); c.fillRect(28, 3, 3, 6); c.fillStyle = '#e8c030'; c.fillRect(-26, 14, 24, 14); },
  },
  battery: {
    name: 'Frozen Battery',
    desc: 'The battery out of Dr Lund\'s radiosonde, frozen solid. She needs it warm, and there is nothing warm on Svalbard.',
    icon(c) { c.fillStyle = '#6a8ab8'; rrect(c, -16, -26, 32, 52, 5); c.fill(); c.fillStyle = '#c8ccd0'; c.fillRect(-6, -32, 12, 7); c.fillStyle = 'rgba(230,245,255,0.8)'; for (let k = 0; k < 5; k++) c.fillRect(-14 + k * 6, -24 + (k % 2) * 30, 4, 14); },
  },
  warmBattery: {
    name: 'Warm Battery',
    desc: 'The radiosonde battery, toasty warm and smelling faintly of dog.',
    icon(c) { c.fillStyle = '#c86a2a'; rrect(c, -16, -26, 32, 52, 5); c.fill(); c.fillStyle = '#c8ccd0'; c.fillRect(-6, -32, 12, 7); c.strokeStyle = 'rgba(255,200,150,0.8)'; c.lineWidth = 2; for (const x of [-22, 22]) { c.beginPath(); c.moveTo(x, 10); c.quadraticCurveTo(x + 5, 0, x, -10); c.stroke(); } },
  },
  forecast: {
    name: 'Weather Chart',
    desc: 'Dr Lund\'s chart: pressure falling, wind backing north, a white-out at six. And in the corner, in pencil: KAPP NORD, 4625 kHz. "Nobody ever answers. But it\'s nice to have."',
    icon(c) { c.rotate(-0.08); c.fillStyle = '#f4f0e0'; c.fillRect(-28, -22, 56, 44); c.strokeStyle = '#2a4a8a'; c.lineWidth = 1.5; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(-4, 6, 8 + k * 6, Math.PI, 0); c.stroke(); } c.fillStyle = '#c81a1a'; c.fillRect(8, -16, 16, 4); },
  },
  gooseCard: {
    name: 'The Goose Pattern',
    desc: 'A punched pattern card from Aunt Olga\'s Christmas box. GOOSE, for Vasko, who hates geese. It knits a goose, and then another goose, and then another goose.',
    icon(c) { c.rotate(0.1); c.fillStyle = '#f4f0dc'; c.fillRect(-30, -18, 60, 36); c.fillStyle = '#3a3a3a'; for (let k = 0; k < 16; k++) ellipse(c, -24 + (k % 8) * 7, -10 + Math.floor(k / 8) * 8, 1.8, 1.8, '#3a3a3a'); ellipse(c, 12, 8, 9, 5, '#8a8e94'); poly(c, [18, 4, 26, 2, 18, 8], '#e8902a'); },
  },
  roundelCard: {
    name: 'The Roundel Pattern',
    desc: 'The card that was in the Knitomatic: ROUNDEL, RAF, TWO COLOURS. Twelve aircraft over Red Square in Royal Air Force markings. Not any more.',
    icon(c) { c.rotate(-0.1); c.fillStyle = '#f4f0dc'; c.fillRect(-30, -18, 60, 36); c.fillStyle = '#3a3a3a'; for (let k = 0; k < 16; k++) ellipse(c, -24 + (k % 8) * 7, -10 + Math.floor(k / 8) * 8, 1.8, 1.8, '#3a3a3a'); ellipse(c, 16, 8, 8, 8, '#1a2a6a'); ellipse(c, 16, 8, 5, 5, '#f4f0e8'); ellipse(c, 16, 8, 2.5, 2.5, '#c81a1a'); },
  },
};

async function lookItemStory(id) {
  if (id === 'gooseCard' || id === 'roundelCard') {
    G.photo = { id: 'patterncard', t: 0, label: ITEMS[id].name };
    try { return await say(G.jack, ITEMS[id].desc); } finally { G.photo = null; }
  }
  await say(G.jack, ITEMS[id].desc);
}

// In the Arctic, Olga and the Colonel dress for the weather.
FACES.olga = FACES.olgaArctic;
FACES.vasko = FACES.vaskoArctic;
Object.assign(COLORS, { ingrid: '#ffb0b8', nils: '#e8c890', olga: '#b8e0c0' });

const LIGHT = {
  station: { ambient: 'rgba(60,50,90,0.14)', key: 'rgba(255,210,170,0.4)', keyX: 1520 },
  hall: { ambient: 'rgba(30,40,30,0.16)', key: 'rgba(240,250,220,0.3)', keyX: 900, top: 'rgba(240,250,220,0.08)' },
  parlour: { ambient: 'rgba(40,20,10,0.2)', key: 'rgba(255,170,90,0.4)', keyX: 1265 },
  cargo: { ambient: 'rgba(20,24,30,0.22)', key: 'rgba(255,220,160,0.3)', keyX: 1100 },
};

const SCENES = {};

// ===========================================================================
// THE STATION — Kapp Nord, two in the morning
// ===========================================================================
SCENES.station = {
  title: 'Kapp Nord Research Station · Svalbard · 02:00',
  music: 'arctic', ambience: ['snowWind', 'huskies'], floor: 'Snow',
  paint: paintStation,
  walk: [60, 1045, 1880, 1045, 1880, 880, 60, 880],
  depth: [872, 1.58, 1045, 1.9],
  light: LIGHT.station,
  portraitBg: '#6a6a90',
  actors() {
    return [
      makeFigure('ingrid', 820, 910, { id: 'ingrid', facing: -1, arm: 'rest', seed: 121, depthScale: true }),
      makeFigure('nils', 1360, 925, { id: 'nils', facing: -1, arm: 'behind', seed: 122, depthScale: true }),
    ];
  },
  back(ctx, t) {
    if (!flag('balloonUp')) drawBalloon(ctx, t, null);
    else if (G.balloonT != null && G.t - G.balloonT < 12) drawBalloon(ctx, t, G.t - G.balloonT);
    if (!flag('gooseOut')) drawGooseInWindow(ctx, t);
    if (!has('key') && !flag('gooseOut')) { ctx.fillStyle = '#8a8e94'; ctx.fillRect(404, 600, 6, 16); ctx.strokeStyle = '#8a8e94'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(407, 622, 7, 0, 7); ctx.stroke(); ctx.fillStyle = '#e8c030'; ctx.fillRect(400, 630, 14, 8); }
    // the dogs: up and yelling while Gunnar's in the bins, asleep afterwards
    for (let k = 0; k < 5; k++) drawHusky(ctx, 1470 + k * 84, 862, 0.9, t, !flag('bearGone') || k % 2 === 1, k);
    if (G.bearRun != null) { const s = G.t - G.bearRun; if (s < 5) drawBear(ctx, 1300 + s * 520, 800, 0.9, t, 1, true); }
    else if (!flag('bearGone')) drawBear(ctx, 1300, 800, 0.9, t, -1);
  },
  front(ctx, t) {
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    for (let k = 0; k < 50; k++) { const x = (k * 263 + t * (30 + (k % 5) * 8)) % W, y = (k * 131 + t * (26 + (k % 7) * 7)) % H; ctx.fillRect(x, y, 3, 3); }
  },
  async enter() {
    if (flag('stationIntro')) return;
    await stationOpening();
  },
  hotspots: [
    { name: 'Base Nord', rect: [700, 150, 400, 420],
      look: () => say(G.jack, 'Across the fjord, Base Nord: a hangar, a dome, and a column of steam going straight up into the sunshine. Weather stations don\'t steam.') },
    { name: 'Radio Mast', rect: [560, 140, 90, 660],
      look: () => say(G.jack, 'The station\'s radio mast. The only thing on Svalbard taller than Nils.') },
    { name: 'Warning Sign', rect: [650, 560, 145, 240],
      look: () => say(G.jack, 'A warning triangle with a polar bear on it. The bear on the sign looks worried. I\'d have drawn it the other way round.') },
    { name: 'Balloon Shed', rect: [880, 520, 220, 270], at: [990, 930],
      look: () => say(G.jack, 'The balloon shed. Twice a day Dr Lund sends a balloon up to ask the sky what it\'s planning. The sky usually lies.') },
    { name: 'Helium Bottles', rect: [1106, 630, 100, 160], at: [1150, 930],
      look: () => say(G.jack, flag('bearGone') ? 'Helium bottles, slightly dented where Gunnar leaned on them.' : 'Helium bottles. Gunnar has his bottom against them. Nobody is going to ask him to move.') },
    { name: 'The Bins', rect: [1224, 690, 180, 110], at: [1300, 930], when: () => flag('bearGone'),
      look: () => say(G.jack, 'The bins, knocked over, with tooth marks in the lids. Gunnar prefers the Norwegian ones. Better herring.') },
    { name: 'Weather Balloon', rect: [930, 330, 140, 190], when: () => !flag('balloonUp'),
      look: () => say(G.jack, 'Dr Lund\'s weather balloon, straining at its string. Hydrogen, rubber and a little box of instruments that goes up twenty miles and comes down in Russia.'),
      use: () => say(actor('ingrid'), 'Don\'t touch it, please. It knows when it\'s being touched.') },
    { name: 'Hut Key', rect: [392, 590, 34, 52], at: [420, 930], face: -1, when: () => !has('key') && !flag('gooseOut'),
      look: () => say(G.jack, 'A key on a nail by the door, with a label: GÅS.'),
      async take() {
        addItem('key'); Sound.sfx('pickup');
        await say(G.jack, 'GÅS. Goose, in Norwegian. At least they labelled her.');
        save();
      } },
    { name: 'The Hut', rect: [300, 540, 130, 220], at: [420, 930], face: -1,
      look: () => say(G.jack, flag('gooseOut') ? 'The hut, with its door open and a thermometer on the floor, in pieces.' : 'The station hut. Somewhere inside, locked in for the safety of the thermometer, is the goose.'),
      async use() {
        if (flag('gooseOut')) return say(G.jack, 'I\'ll leave the door open. She likes to know she can come and go.');
        if (!has('key')) return say(G.jack, 'Locked. There\'s a key on the nail beside it.');
        return releaseGoose();
      },
      item: id => id === 'key' ? releaseGoose() : false },
    { name: 'The Goose', rect: [96, 496, 140, 90], at: [260, 930], face: -1, when: () => !flag('gooseOut'),
      look: () => say(G.jack, 'The goose, glaring out of the hut window at the bear. If looks could kill, Gunnar would be a rug.') },
    { name: 'Polar Bear', rect: [1170, 690, 250, 130], at: [1060, 950], face: 1, when: () => !flag('bearGone'),
      look: () => say(G.jack, 'Gunnar: four hundred kilos of polar bear with his head in the station bins. Protected by law. Also by being four hundred kilos.'),
      async talk() { await say(G.jack, 'Shoo.'); Sound.sfx('growl'); await think('Gunnar does not shoo.'); },
      item: () => say(G.jack, 'I\'m not getting close enough to hand Gunnar anything. Not even a compliment.') },
    { name: 'Huskies', rect: [1420, 770, 460, 110], at: [1560, 950], face: 1,
      look: () => say(G.jack, flag('bearGone') ? 'Nils\'s dogs, curled up nose to tail. Tor, the lead dog, is the biggest, and the warmest thing on Svalbard.' : 'Nils\'s dogs, up on their chains and yelling at the bear. Nobody is sleeping through that.'),
      item: id => id === 'battery' ? warmBattery() : false },
    { name: 'Wool Bales', rect: [1700, 670, 210, 140], at: [1700, 950], face: 1,
      look: () => say(G.jack, 'Forty bales of wool, stencilled BASE NORD. Every Friday Nils takes them across the fjord, and Aunt Olga knits them into something.'),
      use: () => flag('nilsDeal') ? intoTheBale() : say(G.jack, 'I\'d fit in one. I\'d itch. And Nils isn\'t going anywhere yet.') },
    { name: 'The Sled', rect: [1640, 760, 270, 70], at: [1700, 950],
      look: () => say(G.jack, 'Nils\'s sled: birch, rawhide, and forty years of getting across the ice without being eaten.') },
    { name: 'Dr Ingrid Lund', actor: 'ingrid', at: [660, 950], face: 1,
      look: () => say(G.jack, 'Dr Ingrid Lund, meteorologist: six winters on Svalbard, a red parka, and the calm of somebody who has argued with a polar bear and won on points.'),
      talk: () => talkIngrid(),
      item: id => id === 'warmBattery' ? launchBalloon() : id === 'battery' ? say(actor('ingrid'), 'Warm, Mr Harrow. Not slightly less frozen.') : false },
    { name: 'Nils', actor: 'nils', at: [1200, 950], face: 1,
      look: () => say(G.jack, 'Nils: trapper, musher, and at seventy-eight the oldest man on Svalbard. His beard has its own weather.'),
      talk: () => talkNils() },
  ],
};

async function stationOpening() {
  flag('stationIntro', true);
  G.busy = true;
  const i = actor('ingrid'), n = actor('nils');
  await wait(0.6);
  await say(i, 'You must be the Englishman. The Minister telephoned. He said you\'d be wet.');
  await say(G.jack, 'It\'s minus twenty.');
  await say(i, 'Then you\'ll be wet later.');
  Sound.sfx('growl');
  await say(n, 'Bear. In the bins. Again.');
  await say(i, 'That\'s Gunnar. He comes for the bins every night. The dogs won\'t run while he\'s here, and I can\'t launch my two o\'clock balloon while he\'s leaning on my helium.');
  await think('Twelve aircraft across the fjord, two days to May Day, and a bear in the bins.');
  setObjective('Get rid of the polar bear');
  save();
  G.busy = false;
}

async function talkIngrid() {
  const i = actor('ingrid');
  if (flag('balloonUp')) return say(i, 'White-out at six, from the north. Three hours when nobody sees anything. Not even Nils, and Nils sees everything.');
  if (has('battery')) return say(i, 'Warm, Mr Harrow. It needs to be warm. There is nothing warm on Svalbard, I know. Be inventive.');
  if (flag('bearGone')) {
    G.busy = true;
    await say(i, 'At last. My two o\'clock balloon, at twenty past two. The Institute will never forgive me.');
    Sound.sfx('click');
    await say(i, 'Oh, no. The battery. It\'s frozen solid, the radiosonde won\'t send a thing.');
    await say(i, 'Warm it up for me, would you? Somewhere warm. There is nothing warm on Svalbard, but you\'re a spy, you\'ll think of something.');
    addItem('battery');
    setObjective('Warm up the battery');
    save();
    G.busy = false;
    return;
  }
  G.busy = true;
  const c = await choose([
    { text: '"Can\'t you scare him off?"', value: 'scare' },
    { text: '"Where\'s my goose?"', value: 'goose' },
    { text: '"Tell me about Base Nord."', value: 'base' },
    { text: '"Carry on, Doctor."', value: 'bye' },
  ]);
  if (c === 'scare') {
    await say(G.jack, 'Can\'t you scare him off?');
    await say(i, 'Gunnar is four hundred kilos and he\'s had a long winter. The only thing I\'ve ever seen frighten him was a goose. Nineteen eighty-four. Nobody knows why.');
    await think('A goose.');
  }
  if (c === 'goose') {
    await say(G.jack, 'Where\'s my goose?');
    await say(i, 'In the hut. She attacked my thermometer. Twice. The key\'s on the nail, if you want her. I don\'t.');
  }
  if (c === 'base') {
    await say(G.jack, 'Tell me about Base Nord.');
    await say(i, 'Weather research, they say. They have never once asked me about the weather. They buy an awful lot of wool. And their chimney glows at night. Chimneys shouldn\'t glow.');
  }
  if (c === 'bye') await say(i, 'Mind Gunnar. He\'s very polite, right up until he isn\'t.');
  G.busy = false;
}

async function releaseGoose() {
  if (flag('gooseOut')) return;
  G.busy = true;
  await walkTo(420, 930);
  G.jack.facing = -1;
  Sound.sfx('unlock'); await wait(0.3);
  removeItem('key');
  await say(G.jack, 'Colonel. There\'s a bear eating your breakfast.');
  Sound.sfx('door');
  flag('gooseOut', true);
  Goose.charge = G.t;
  Sound.sfx('honk'); await wait(0.5); Sound.sfx('honk');
  await wait(0.8);
  Sound.sfx('growl');
  G.bearRun = G.t; flag('bearGone', true);
  Sound.sfx('honk');
  await wait(1.6);
  await say(actor('nils'), 'Forty years on Svalbard. I never saw a bear run from a goose.');
  await say(actor('ingrid'), 'Nineteen eighty-four. I told you.');
  await wait(0.6);
  Goose.charge = null;
  setObjective('Help Dr Lund with her balloon');
  save();
  G.busy = false;
}

async function warmBattery() {
  if (!flag('bearGone')) return say(G.jack, 'Not now. They\'re all up and yelling at the bear.');
  G.busy = true;
  removeItem('battery');
  await walkTo(1600, 950);
  G.jack.arm = 'reach';
  await say(G.jack, 'Tor. Big, warm, fast asleep. Budge up, Tor.');
  Sound.sfx('growl');
  G.jack.arm = 'rest';
  await wait(1.2);
  await think('Five minutes under the warmest dog on Svalbard.');
  addItem('warmBattery'); Sound.sfx('pickup');
  await say(G.jack, 'Toasty. And it smells of dog. Science won\'t mind.');
  save();
  G.busy = false;
}

async function launchBalloon() {
  G.busy = true;
  const i = actor('ingrid');
  removeItem('warmBattery');
  await say(i, 'Warm! Where on earth did you... No. Don\'t tell me.');
  Sound.sfx('click'); await wait(0.4);
  Sound.sfx('whoosh');
  flag('balloonUp', true); G.balloonT = G.t;
  await wait(2.5);
  await say(i, 'Pressure falling. Wind backing north. There: a white-out at six o\'clock. Three hours of nothing at all.');
  await say(i, 'Take the chart. The station frequency is in the corner, in case you ever need help. Nobody ever answers, but it\'s nice to have.');
  Sound.sfx('paper');
  addItem('forecast');
  setObjective('Find a way across the fjord to Base Nord');
  save();
  G.busy = false;
}

async function talkNils() {
  const n = actor('nils');
  if (flag('nilsDeal')) return say(n, 'Into the wool, Englishman. Head first. Breathe through your ears.');
  if (!flag('bearGone')) return say(n, 'Dogs don\'t run with a bear in the bins. Dogs aren\'t stupid. Not like Englishmen.');
  G.busy = true;
  if (!flag('nilsTalked')) {
    flag('nilsTalked', true);
    await say(n, 'So. Where do you want to go?');
    await say(G.jack, 'Base Nord.');
    await say(n, 'Nobody goes to Base Nord. I go to Base Nord. Every Friday, forty bales of wool, and Madame Olga pays me in cognac.');
    await say(n, 'But not today. Today they have guards on the roof with binoculars. You\'d need a white-out. And nobody knows when a white-out comes.');
    await think('Nobody except a meteorologist with a weather balloon.');
  }
  if (!has('forecast')) { await say(n, 'Bring me a white-out, and I\'ll take you. Until then I drink coffee.'); G.busy = false; return; }
  await say(G.jack, 'Nils. A white-out at six o\'clock, from the north. Dr Lund\'s balloon says so.');
  await say(n, 'Then we go at six.');
  await say(G.jack, 'Could you deliver forty-one bales, instead of forty?');
  await say(n, 'Forty-one? ...You would itch.');
  await say(G.jack, 'This year I\'ve been a baker, a fishmonger and a ski instructor. I can be a sheep.');
  await say(n, 'Ha! Get in, then.');
  flag('nilsDeal', true);
  setObjective('Climb into a bale of wool');
  save();
  G.busy = false;
}

async function intoTheBale() {
  G.busy = true;
  Sound.sfx('cloth');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  await TextScreen.play(CROSSING_PAGES, 'tension');
  flag('woolly', true);
  G.busy = false;
  startPlay();
  G.sceneId = null; G.fade = 1;
  await gotoScene('hall', 200, 960, 1, { instant: true });
}
const CROSSING_PAGES = [
  { kicker: 'THE FJORD  ·  06:00', amb: ['snowWind'], text: 'The white-out arrives at six exactly, as Dr Lund said it would. Nils drives the dogs across the ice from memory, singing. The goose rides on top of the load, disguised as a goose. I travel as bale forty-one. Wool gets into places wool should never go.' },
  { kicker: 'BASE NORD  ·  06:40', amb: ['snowWind', 'knitting'], text: 'The guards don\'t count the bales. Nobody ever counts the bales. Nils takes his cognac, pats bale forty-one, and goes home. Bale forty-one is carried inside and dropped on a pile, next to something enormous that goes clack.' },
];

// ===========================================================================
// THE KNITTING HALL — Base Nord
// ===========================================================================
SCENES.hall = {
  title: 'Base Nord · The Knitting Hall · 06:40',
  music: 'knit', ambience: ['knitting', 'hum'], floor: 'Stone',
  paint: paintHall,
  walk: [60, 1045, 1880, 1045, 1880, 880, 60, 880],
  depth: [872, 1.58, 1045, 1.9],
  light: LIGHT.hall,
  portraitBg: '#4a5048',
  actors() {
    const list = [makeFigure('olgaArctic', 1310, 850, { id: 'olga', facing: -1, pose: 'sit', arm: flag('olgaAsleep') ? 'rest' : 'knit', seed: 20, scale: 1.72, fixedScale: true, doze: !!flag('olgaAsleep') })];
    if (!flag('vaskoGone')) {
      list.push(makeFigure('vaskoArctic', 820, 930, { id: 'vasko', facing: 1, arm: 'behind', seed: 18, depthScale: true }));
      list.push(makeFigure('kolar', 1020, 925, { id: 'kolar', facing: -1, arm: 'rest', seed: 17, depthScale: true }));
    }
    return list;
  },
  back(ctx, t) { drawKnitomatic(ctx, t, G.knitSpeed || (flag('olgaAsleep') ? 'slow' : 'knit'), flag('swapped') ? 'goose' : 'roundel'); },
  async enter() {
    if (flag('hallIntro')) return;
    await hallOpening();
  },
  hotspots: [
    { name: 'Wool Bales', rect: [40, 560, 300, 280], at: [300, 950], face: -1,
      look: () => say(G.jack, 'Bale forty-one, empty now, and the goose asleep in bale forty-two. She says she\'s keeping watch.') },
    { name: 'Hangar Doors', rect: [1440, 180, 480, 660], at: [1500, 950], face: 1,
      look: () => say(G.jack, flag('swapped') ? 'Outside, the fleet in its woolly covers. The roundels on the first one are still there. The rest will be geese.' : 'Through the doors, the first of the fleet under its knitted cover, with an RAF roundel on the wing the size of a bus.'),
      use: () => say(G.jack, 'Not yet. Out there it\'s Vasko, Kolar and a runway full of guards with binoculars.') },
    { name: 'The Knitomatic', rect: [420, 190, 640, 500], at: [740, 950], face: 1,
      look: () => say(G.jack, 'A knitting machine the size of a church, with a nuclear reactor on top, because of course it has a nuclear reactor on top. It is knitting a cover for a jet fighter, with RAF roundels on.'),
      use: () => flag('olgaAsleep') ? say(G.jack, 'I\'m not touching the reactor. The dial and the pattern card will do.') : say(actor('olga'), 'Pyotr! Don\'t touch my machine.') },
    { name: 'Speed Dial', rect: [1090, 548, 92, 86], at: [1120, 950], face: 1,
      look: () => say(G.jack, 'A big dial: SLOW, KNIT and TURBO. Somebody has written next to TURBO, in Russian: "never again".'),
      use: () => speedDial() },
    { name: 'Pattern Reader', rect: [1082, 646, 108, 64], at: [1120, 950], face: 1,
      look: () => say(G.jack, flag('swapped') ? 'The pattern reader, with Aunt Olga\'s goose card in it. Knit one goose, purl one goose.' : 'The pattern reader. In it, a punched card: ROUNDEL, RAF, TWO COLOURS.'),
      take: () => flag('swapped') ? say(G.jack, 'The goose stays in.') : flag('olgaAsleep') ? say(G.jack, 'If I just pull it out, the machine stops and she wakes up. I need to swap it for another card, in one go.') : say(actor('olga'), 'Pyotr! That is my pattern!'),
      item: id => id === 'gooseCard' ? swapCard() : false },
    { name: 'Samovar', rect: [1360, 616, 50, 90], at: [1420, 950], face: -1, photo: 'samovar',
      look: () => say(G.jack, 'Aunt Olga\'s samovar, bubbling away. Tea with jam in it, strong enough to stand a needle up in.') },
    { name: 'Parlour Door', rect: [1250, 430, 120, 250], at: [1250, 960], face: 1, exitLabel: 'Into Aunt Olga\'s parlour',
      async exit() {
        if (!flag('olgaAsleep')) return say(G.jack, 'Olga\'s rocking chair is right in front of it. I\'d have to climb over Olga, and nobody has ever climbed over Olga.');
        return gotoScene('parlour', 260, 960, 1, { sfx: 'door' });
      } },
    { name: 'Colonel Vasko', actor: 'vasko', when: () => !flag('vaskoGone'),
      look: () => say(G.jack, 'Colonel Vasko, in a fur hat, rehearsing a speech with no audience.') },
    { name: 'Captain Kolar', actor: 'kolar', when: () => !flag('vaskoGone'),
      look: () => say(G.jack, 'Kolar. If he turns round, I\'m a sheep.') },
    { name: 'Aunt Olga', actor: 'olga', at: [1140, 960], face: 1,
      look: () => say(G.jack, flag('olgaAsleep') ? 'Aunt Olga, asleep in her rocking chair, knitting needles still going, very slowly, all by themselves.' : 'Aunt Olga: Vasko\'s big sister, eighty kilos of cardigan and cunning, knitting a scarf with no end. She is very short-sighted. I am very woolly.'),
      talk: () => talkOlga() },
  ],
};

async function hallOpening() {
  flag('hallIntro', true);
  G.busy = true;
  const v = actor('vasko'), o = actor('olga'), k = actor('kolar');
  await wait(0.8);
  await say(v, 'Sister. On May Day, twelve aircraft will fly over Red Square wearing the roundels of the Royal Air Force.');
  await say(o, 'Knit one, purl one.');
  await say(v, 'The Soviets will think it is the British. There will be a terrible fuss. And afterwards, who will be Moscow\'s only friend? Little Karvonia.');
  await say(o, 'And you will be a general, Vasko, and I will have a dacha on the Black Sea with a knitting room. Pass me the green.');
  await say(k, 'Colonel. The last cover is knitting now. Roundels on both wings.');
  await say(v, 'Good. Kolar, the runway. The fleet flies at eleven.');
  await walkTo(1700, 930, v, 1.1);
  await walkTo(1700, 930, k, 1.1);
  removeActor('vasko'); removeActor('kolar');
  flag('vaskoGone', true);
  await wait(0.4);
  faceTo(o.x);
  await say(o, 'Pyotr? Is that you? You are very woolly this morning.');
  await say(G.jack, '...Da.');
  await say(o, 'Good boy. Don\'t touch my machine.');
  await think('RAF roundels on every wing. They\'re going to start a war, and they\'re going to knit it.');
  setObjective('Stop the Knitomatic knitting roundels');
  save();
  G.busy = false;
}

async function talkOlga() {
  const o = actor('olga');
  if (flag('olgaAsleep')) return say(o, 'Zzz... knit one... Vasko, sit up straight... purl one...', { dur: 3 });
  G.busy = true;
  const c = await choose([
    { text: '"Nice machine."', value: 'machine' },
    { text: '"What are you knitting?"', value: 'knit' },
    { text: '"Da."', value: 'da' },
  ]);
  if (c === 'machine') {
    await say(G.jack, 'Nice machine.');
    await say(o, 'Atomic, Pyotr! It knits anything: covers for aircraft, socks for the Colonel, jumpers at Christmas. The Christmas patterns are in my parlour. Don\'t touch those either.');
  }
  if (c === 'knit') {
    await say(G.jack, 'What are you knitting?');
    await say(o, 'A scarf for Vasko. It is three hundred metres long. He is going to be a general, he will need a long scarf.');
    await say(o, 'You know, Pyotr, when the machine goes slowly it sounds like my mother\'s rocking chair. Clack... clack... I could sleep for a week.');
  }
  if (c === 'da') { await say(G.jack, 'Da.'); await say(o, 'Da, da, da. Always da. Go and count the bales, Pyotr.'); }
  G.busy = false;
}

async function speedDial() {
  G.busy = true;
  const c = await choose([
    { text: 'Turn it to SLOW.', value: 'slow' },
    { text: 'Leave it on KNIT.', value: 'knit' },
    { text: 'Turn it to TURBO.', value: 'turbo' },
  ]);
  const o = actor('olga');
  if (c === 'knit') { await think('Leave it.'); G.busy = false; return; }
  if (c === 'slow') {
    if (flag('olgaAsleep')) { await think('It\'s already on SLOW. So is Aunt Olga.'); G.busy = false; return; }
    Sound.sfx('click');
    G.knitSpeed = 'slow';
    await wait(0.8);
    await say(o, 'Clack... clack... like Mama\'s chair... knit one...', { dur: 2.8 });
    await say(o, '...purl...', { dur: 1.6 });
    Sound.sfx('snore');
    o.arm = 'rest'; o.doze = true;
    flag('olgaAsleep', true); G.knitSpeed = null;
    await think('Out like a light. And the roundels are knitting very, very slowly.');
    setObjective('Find another pattern for the Knitomatic');
    save();
    G.busy = false;
    return;
  }
  // TURBO
  if (!flag('olgaAsleep')) { await say(o, 'Pyotr! Not TURBO! The last time, we knitted a tent over the Colonel.'); G.busy = false; return; }
  if (!flag('swapped')) { await think('TURBO with roundels in? That would just finish Olga\'s covers for her.'); G.busy = false; return; }
  if (!flag('calledLondon')) { await think('Before I set this thing off, somebody in London ought to know what\'s coming. Olga has a radio in her parlour.'); G.busy = false; return; }
  G.busy = false;
  return turbo();
}

async function swapCard() {
  if (!flag('olgaAsleep')) return say(actor('olga'), 'Pyotr! That is my pattern!');
  G.busy = true;
  removeItem('gooseCard');
  G.jack.arm = 'reach';
  Sound.sfx('click'); await wait(0.3); Sound.sfx('click');
  G.jack.arm = 'rest';
  addItem('roundelCard');
  flag('swapped', true);
  await say(G.jack, 'Roundel out, goose in, and the Knitomatic never missed a stitch.');
  await think('But every cover already knitted still has roundels. Unless the machine knits them all again, fast, before eleven. TURBO. Never again, it says.');
  setObjective('Knit every cover again, with geese');
  save();
  G.busy = false;
}

async function turbo() {
  G.busy = true;
  const o = actor('olga');
  Sound.sfx('click');
  G.knitSpeed = 'turbo';
  Sound.setAmbience(['knitting', 'hum', 'klaxon']);
  await wait(1);
  await think('TURBO. Twelve covers in about a minute. Every one with geese.');
  await wait(1.5);
  Sound.sfx('sting');
  o.doze = false; o.arm = 'point';
  await say(o, 'Wha...? Pyotr! What have you... You\'re not Pyotr. Pyotr is bald!');
  await say(G.jack, 'Knit one, purl one, Madame.');
  await say(o, 'KOLAR! The Englishman is in my wool!');
  await walkTo(1700, 950, G.jack, 1.6);
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  G.knitSpeed = null;
  await TextScreen.play(RACE_PAGES, 'race');
  G.busy = false;
  SnowRace.start();
}
const RACE_PAGES = [
  { kicker: 'BASE NORD  ·  10:52', amb: ['klaxon', 'snowWind'], text: 'Out through the hangar doors into a blizzard of loose wool, onto the nearest snowmobile, and a goose drops out of the sky onto the seat behind me. The fleet is already rolling towards the ice runway, eight kilometres away. Take-off at eleven.' },
];

// ===========================================================================
// AUNT OLGA'S PARLOUR
// ===========================================================================
SCENES.parlour = {
  title: 'Aunt Olga\'s Parlour · 07:05',
  music: 'parlour', ambience: ['brazier', 'clock'], floor: 'Carpet',
  paint: paintParlour,
  walk: [60, 1045, 1880, 1045, 1880, 880, 60, 880],
  depth: [872, 1.58, 1045, 1.9],
  light: LIGHT.parlour,
  portraitBg: '#1e3a2a',
  back(ctx, t) { drawCat(ctx, 1560, 530, t); },
  async enter() {
    if (flag('parlourIntro')) return;
    flag('parlourIntro', true);
    G.busy = true;
    await wait(0.5);
    await think('Aunt Olga\'s parlour: lace, a stove, a cat, and more photographs of the Colonel than he would like.');
    G.busy = false;
  },
  hotspots: [
    { name: 'The Door', rect: [60, 360, 150, 480], at: [240, 950], face: -1, exitLabel: 'Back to the Knitting Hall',
      exit: () => gotoScene('hall', 1250, 960, -1, { sfx: 'door' }) },
    { name: 'Photographs', rect: [320, 160, 360, 220],
      look: () => say(G.jack, 'Little Vasko, aged six, in a jumper with a reindeer on it, looking exactly as cross as he does now. And Olga and Vasko on a beach, both in knitted swimming costumes.') },
    { name: 'The Stove', rect: [1180, 100, 170, 740], at: [1150, 950], face: 1,
      look: () => say(G.jack, 'A stove, roaring. The warmest room north of Tromsø, and the stuffiest.') },
    { name: 'Pattern Box', rect: [790, 300, 150, 80], at: [860, 950], face: 1, photo: 'patterncard',
      look: () => say(G.jack, has('gooseCard') || flag('swapped') ? 'Olga\'s Christmas patterns: SNOWFLAKE, REINDEER, SQUIRREL. One card missing.' : 'YOLKA: Aunt Olga\'s Christmas patterns. SNOWFLAKE, REINDEER, SQUIRREL, and one card labelled: GOOSE. FOR VASKO, WHO HATES GEESE.'),
      async take() {
        if (has('gooseCard') || flag('swapped')) return say(G.jack, 'One goose is plenty.');
        addItem('gooseCard'); Sound.sfx('pickup');
        await say(G.jack, 'GOOSE: for Vasko, who hates geese. Olga, you\'re a genius, and you don\'t even know it.');
        setObjective('Swap the pattern in the Knitomatic');
        save();
      } },
    { name: 'Flight Plan', rect: [820, 640, 170, 50], at: [900, 950], face: 1,
      async look() {
        await say(G.jack, 'The flight plan. The first of May: depart eleven hundred, Red Square at noon. NIGHTGLASS ONE to TWELVE. And a thirteenth aircraft, a transport called BABUSHKA. One passenger. One knitting machine.');
        flag('sawPlan', true);
      } },
    { name: 'The Radio', rect: [1470, 540, 320, 120], at: [1600, 950], face: 1,
      look: () => say(G.jack, 'Olga\'s radio: valves, dials, and Comrade Mittens asleep on top, where the valves are warm.'),
      use: () => callLondon(),
      item: id => id === 'forecast' ? callLondon() : false },
    { name: 'Comrade Mittens', rect: [1500, 490, 130, 60], at: [1560, 950], face: 1,
      look: () => say(G.jack, 'Comrade Mittens, Aunt Olga\'s cat, asleep on the radio in a tiny knitted jumper. He looks at me the way the goose looks at everybody.') },
  ],
};

async function callLondon() {
  if (flag('calledLondon')) return say(G.jack, 'London knows. Now to give them something to cheer about.');
  if (!has('forecast')) return say(G.jack, 'I could call somebody. I\'d need a frequency where somebody friendly is listening.');
  G.busy = true;
  Sound.sfx('click'); await wait(0.4); Sound.sfx('radio');
  await say(G.jack, 'Four six two five. Kapp Nord, Kapp Nord, this is bale forty-one.');
  await wait(0.8);
  await say('ingrid', 'Harrow? Nobody ever answers this. You sound woolly.', { pos: [1630, 480] });
  await say(G.jack, 'Tell London: twelve aircraft, taking off at eleven, dressed up as the Royal Air Force. Red Square at noon, on May Day.');
  await say('ingrid', 'I\'ll telephone the Minister. He\'ll be having breakfast. Good luck, bale forty-one.', { pos: [1630, 480] });
  flag('calledLondon', true);
  save();
  G.busy = false;
}

// ===========================================================================
// THE CARGO HOLD — aboard BABUSHKA, the wrong plane
// ===========================================================================
SCENES.cargo = {
  title: 'Aboard Babushka · 11:02',
  music: 'parlour', ambience: ['jetIdle'], floor: 'Stone',
  paint: paintCargo,
  walk: [60, 1045, 1880, 1045, 1880, 880, 60, 880],
  depth: [872, 1.58, 1045, 1.9],
  light: LIGHT.cargo,
  portraitBg: '#3a3e44',
  actors() { return [makeFigure('olgaArctic', 1360, 850, { id: 'olga', facing: -1, pose: 'sit', arm: 'knit', seed: 20, scale: 1.72, fixedScale: true })]; },
  async enter() { await theWrongPlane(); },
  hotspots: [],
};

async function theWrongPlane() {
  G.busy = true;
  const o = actor('olga');
  await wait(1);
  await think('Up the ramp of the last aircraft on the runway, snowmobile and all, as the wheels left the ice. The lead jet. Vasko\'s. I\'ll stop it from the inside.');
  await wait(0.6);
  await say(o, 'Mr Harrow. You are on the wrong plane.');
  await say(G.jack, 'I usually am.');
  await say(o, 'This is Babushka. Just me, and my machine, and a very nice cake. Four hours to Moscow. Tea?');
  Sound.sfx('honk');
  await say(o, 'And the goose. Hello, goose. Last time we met, you bit me on the train.');
  Sound.sfx('radio');
  await say('vasko', 'Babushka, this is Nightglass One. Sister. Why do all my aircraft have geese on them?', { pos: [960, 150] });
  await say(o, 'Knit one, purl one, Vasko.');
  await wait(0.6);
  await say(o, 'Now then, Mr Harrow. Sit. I have made you a jumper.');
  await think('It has a goose on it.');
  await wait(1);
  G.fade = 1; G.fadeTo = 1;
  Sound.stopMusic(); Sound.setAmbience(['jetIdle']);
  await wait(1.5);
  store.del(CHAPTER.saveKey);
  G.busy = false;
  await Ending.cliffhanger();
}

// ---------- the goose ---------------------------------------------------------------
// Locked in the hut until the bear needs seeing off, then at Jack's heels on the ice;
// asleep in a bale in the Knitting Hall; and first aboard the wrong plane.
const Goose = {
  trail: [], charge: null,
  reset() { this.trail = []; },
  visible() {
    if (G.mode !== 'play') return false;
    if (G.sceneId === 'station') return !!flag('gooseOut');
    return G.sceneId === 'cargo';
  },
  update() {
    const j = G.jack;
    if (!j) return;
    const last = this.trail[this.trail.length - 1];
    if (!last || Math.hypot(last[0] - j.x, last[1] - j.y) > 10) this.trail.push([j.x, j.y]);
    if (this.trail.length > 120) this.trail.shift();
  },
  draw(ctx, t) {
    if (G.sceneId === 'cargo') return drawGoose(ctx, 1150, 1000, depthScale(1000) * 0.42, t, 1);
    if (this.charge != null) {
      const s = G.t - this.charge, x = s < 1.6 ? 420 + s * 560 : Math.max(420, 1316 - (s - 1.6) * 500);
      return drawGoose(ctx, x, 960, depthScale(960) * 0.42, t, s < 1.6 ? 1 : -1);
    }
    const j = G.jack, idx = this.trail.length - 10;
    const [x, y] = idx >= 0 ? this.trail[idx] : [j.x - j.facing * 80, j.y + 6];
    drawGoose(ctx, x, y + 8, depthScale(y) * 0.42, t, j.x > x ? 1 : -1);
  },
};
function drawGoose(ctx, x, y, s, t, dir) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  const step = Math.sin(t * 9);
  ctx.strokeStyle = '#e8902a'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-6, -20); ctx.lineTo(-6 + step * 6, 0); ctx.moveTo(6, -20); ctx.lineTo(6 - step * 6, 0); ctx.stroke();
  ellipse(ctx, 0, -40, 40, 24, '#f0ece4');
  ctx.strokeStyle = '#f0ece4'; ctx.lineWidth = 14;
  ctx.beginPath(); ctx.moveTo(24, -50); ctx.quadraticCurveTo(38, -80, 32 + Math.sin(t * 3) * 4, -104); ctx.stroke();
  ellipse(ctx, 34 + Math.sin(t * 3) * 4, -108, 12, 10, '#f0ece4');
  poly(ctx, [42, -110, 62, -104, 42, -100], '#e8902a');
  ellipse(ctx, 38, -112, 2, 2, '#111');
  ctx.restore();
}

// ---------- hint thoughts ------------------------------------------------------------
async function hintThought() {
  const sc = G.sceneId;
  if (sc === 'station') {
    if (!flag('bearGone')) return think(has('key') ? 'The goose is in the hut. Gunnar is in the bins. Introduce them.' : 'Dr Lund says only a goose ever frightened Gunnar. My goose is locked in the hut, and the key is on the nail.');
    if (!flag('balloonUp')) {
      if (!has('battery') && !has('warmBattery')) return think('Dr Lund can launch her balloon now.');
      if (has('battery')) return think('Something warm on Svalbard. Something big, furry and fast asleep.');
      return think('Dr Lund\'s battery is warm. Give it back to her.');
    }
    if (!flag('nilsDeal')) return think('A white-out at six. Tell Nils.');
    return think('Forty-one bales. Into the wool.');
  }
  if (sc === 'hall') {
    if (!flag('olgaAsleep')) return think('Aunt Olga says the machine sounds like her mother\'s rocking chair when it goes slowly. The speed dial.');
    if (!has('gooseCard') && !flag('swapped')) return think('Another pattern. Olga keeps her Christmas patterns in the parlour.');
    if (!flag('swapped')) return think('The goose card goes in the pattern reader.');
    if (!flag('calledLondon')) return think('London should know about the fleet. Olga has a radio, and Dr Lund gave me a frequency.');
    return think('TURBO. Never again, it says. Once more, then.');
  }
  if (sc === 'parlour') {
    if (!has('gooseCard') && !flag('swapped')) return think('The box of Christmas patterns on the shelf.');
    if (!flag('calledLondon')) return think('The radio, and Dr Lund\'s frequency.');
    return think('Back to the Knitomatic.');
  }
}
