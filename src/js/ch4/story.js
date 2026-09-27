// ---------------------------------------------------------------------------
// Chapter Four: Nightglass — items, scenes, hotspots, dialogue, puzzles.
// Zlatá Hora: the Golden Rooster inn and the village square; then, inside the
// mountain above it, the hangar, Vasko's office and the runway.
// ---------------------------------------------------------------------------

const ITEMS = {
  minox: {
    name: 'Minox Camera',
    desc: 'Madame Novak\'s Minox, small enough to hide in a glove. Loaded, she says, with film that could photograph a black cat in a coal cellar.',
    icon(c) {
      c.rotate(-0.25);
      c.fillStyle = linGrad(c, 0, -12, 0, 12, [[0, '#d8dce2'], [0.5, '#9aa0a8'], [1, '#6a7078']]); rrect(c, -40, -12, 80, 24, 6); c.fill();
      c.fillStyle = '#1a1a1a'; c.fillRect(-20, -8, 26, 16); ellipse(c, 24, 0, 7, 7, '#2a3a5a');
      c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(-36, -9, 70, 3);
    },
  },
  water: {
    name: 'Glass of "Slivovitz"',
    desc: 'Marta\'s special: a glass of water, served to anyone who has had eleven slivovitz. Nobody has ever noticed.',
    icon(c) {
      c.fillStyle = 'rgba(200,225,255,0.5)'; c.beginPath(); c.moveTo(-14, -26); c.lineTo(14, -26); c.lineTo(10, 26); c.lineTo(-10, 26); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 2; c.stroke();
      c.fillStyle = 'rgba(160,200,240,0.6)'; c.fillRect(-11, -6, 22, 30);
    },
  },
  pass: {
    name: 'Hangar Pass',
    desc: 'OBSERVATORY ZLATÁ HORA · MECHANIC · M. DVOŘÁK. The photograph has a moustache. I don\'t. Nobody looks at photographs.',
    icon(c) {
      c.rotate(0.15);
      c.fillStyle = '#e8e0cc'; rrect(c, -30, -20, 60, 40, 4); c.fill();
      c.fillStyle = '#b31c2e'; c.fillRect(-30, -20, 60, 9);
      c.fillStyle = '#6a5a4a'; c.fillRect(-24, -6, 18, 22); c.fillStyle = '#2a1a0a'; c.fillRect(-21, 6, 12, 3);
      c.fillStyle = '#3a3a3a'; for (let k = 0; k < 3; k++) c.fillRect(0, -4 + k * 7, 22, 3);
      c.strokeStyle = '#2a4a8a'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -20); c.lineTo(-4, -38); c.stroke();
    },
  },
  smock: {
    name: 'Pepík\'s Smock',
    desc: 'A baker\'s boy\'s smock and cap, a little small. Pepík is twelve. I am not.',
    icon(c) {
      c.fillStyle = '#ece6da'; c.beginPath(); c.moveTo(-26, -24); c.lineTo(26, -24); c.lineTo(32, 28); c.lineTo(-32, 28); c.closePath(); c.fill();
      c.fillStyle = '#d8d0c0'; c.fillRect(-6, -24, 12, 52);
      c.fillStyle = '#ece6da'; ellipse(c, 0, -32, 22, 8, '#ece6da');
    },
  },
  basket: {
    name: 'Bread Basket (honking)',
    desc: 'Forty rolls and one goose. The rolls are for the soldiers\' supper. The goose is for emergencies.',
    icon(c) {
      c.fillStyle = '#9a6a2a'; c.beginPath(); c.ellipse(0, 10, 36, 20, 0, 0, Math.PI); c.fill(); c.fillRect(-36, 0, 72, 12);
      c.strokeStyle = '#6a4418'; c.lineWidth = 2; for (let k = -30; k <= 30; k += 10) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k * 0.8, 26); c.stroke(); }
      ellipse(c, -14, -2, 14, 8, '#c88a4a'); ellipse(c, 12, -2, 14, 8, '#c88a4a');
      c.strokeStyle = '#f0ece4'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -4); c.quadraticCurveTo(4, -24, -2, -34); c.stroke();
      ellipse(c, -2, -36, 6, 5, '#f0ece4'); poly(c, [-8, -37, -16, -35, -8, -33], '#e8902a');
    },
  },
  flightplan: {
    name: 'Flight Plan',
    desc: 'NIGHTGLASS 07. Zlatá Hora 00:00, Istanbul 03:10, 3 December. "Demonstration for buyers." Pilot: Colonel D. Vasko. He has drawn a small crown next to his own name.',
    icon(c) {
      c.rotate(-0.1);
      c.fillStyle = '#f0ece0'; c.fillRect(-26, -34, 52, 68);
      c.fillStyle = '#b31c2e'; c.fillRect(-26, -34, 52, 10);
      c.fillStyle = '#3a3a3a'; for (let k = 0; k < 6; k++) c.fillRect(-20, -18 + k * 8, 30 + (k % 3) * 6, 3);
      c.strokeStyle = '#2a4a8a'; c.lineWidth = 2; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(-18, 28); c.quadraticCurveTo(0, 10, 18, 26); c.stroke(); c.setLineDash([]);
    },
  },
};

async function lookItemStory(id) {
  if (id === 'pass' && !flag('readPass')) {
    flag('readPass', true);
    await say(G.jack, ITEMS.pass.desc);
    return think('Mirek Dvořák, mechanic, hangar one. Up the mountain, a pass like this opens doors.');
  }
  await say(G.jack, ITEMS[id].desc);
}

const LIGHT = {
  inn: { ambient: 'rgba(40,20,6,0.16)', key: 'rgba(255,190,120,0.3)', keyX: 230 },
  square: { ambient: 'rgba(40,40,80,0.18)', key: 'rgba(255,200,150,0.35)', keyX: 1700 },
  hangar: { ambient: 'rgba(10,12,18,0.35)', key: 'rgba(255,190,110,0.3)', keyX: 760 },
  hangarLit: { ambient: 'rgba(10,12,18,0.12)', key: 'rgba(255,240,210,0.4)', keyX: 960 },
  office: { ambient: 'rgba(30,14,6,0.25)', key: 'rgba(255,210,150,0.35)', keyX: 1184 },
  runway: { ambient: 'rgba(4,8,20,0.45)', key: 'rgba(255,200,120,0.45)', keyX: 250 },
};

const SCENES = {};

// ===========================================================================
// THE GOLDEN ROOSTER
// ===========================================================================
SCENES.inn = {
  title: 'Zlatá Hora · The Golden Rooster · 2 December',
  music: 'inn', ambience: ['innChatter', 'brazier', 'clock'], floor: 'Wood', musicFilter: 5000,
  paint: paintInn,
  walk: [80, 1045, 1860, 1045, 1860, 850, 80, 850],
  depth: [850, 1.62, 1045, 2.0],
  light: LIGHT.inn,
  portraitBg: '#4a2a14',
  actors() {
    return [
      makeFigure('marta', 1720, 812, { id: 'marta', facing: -1, seed: 31, scale: 1.66, fixedScale: true }),
      makeFigure('mirek', 690, 872, { id: 'mirek', facing: 1, pose: 'sit', arm: flag('gotPass') ? 'rest' : 'drunk', seed: 32, depthScale: true, slump: !!flag('gotPass') }),
    ];
  },
  props: [
    { y: 830, draw: ctx => paintInnBar(ctx) },
    { y: 905, draw: ctx => paintInnTable(ctx, 760, 900, flag('gotPass') ? 4 : 3) },
  ],
  update(dt, t) {
    const m = actor('mirek');
    if (m && !flag('gotPass') && !m.talking) m.headTurn = Math.sin(t * 0.9) * 0.15; // swaying gently
  },
  async enter() {
    if (flag('innIntro')) return;
    flag('innIntro', true);
    await innOpening();
  },
  hotspots: [
    { name: 'Stove', rect: [120, 360, 220, 460], at: [380, 900], face: -1,
      look: () => say(G.jack, 'A green tiled stove the size of a wardrobe. Marta says it has not gone out since 1911. Neither, I think, has Marta.') },
    { name: 'Windows', rect: [470, 180, 780, 260],
      look: () => say(G.jack, 'Snow, pine forest, and the mountain the locals call the Observatory. Nobody in Zlatá Hora has ever seen a telescope.') },
    { name: 'Rooster Clock', rect: [700, 200, 100, 180], at: [750, 900],
      look: () => say(G.jack, 'A cuckoo clock with a golden rooster instead of a cuckoo. It crows on the hour. Everyone in the village is very tired.') },
    { name: 'Antlers', rect: [800, 480, 640, 140],
      look: () => say(G.jack, 'Two pairs of antlers. According to Marta, both stags died of old age, laughing at the local hunters.') },
    { name: 'Portrait of Vasko', rect: [1230, 210, 140, 180],
      look: () => say(G.jack, 'Vasko again, hung slightly crooked. I suspect that\'s the only act of rebellion in the village.') },
    { name: 'Marta', actor: 'marta', at: [1450, 880], face: 1,
      look: () => say(G.jack, 'Marta, landlady of the Golden Rooster. Arms like a stevedore, a laugh like a landslide, and a very good memory for who owes her money.'),
      talk: () => talkMarta() },
    { name: 'Mirek', actor: 'mirek', at: [540, 900], face: 1,
      look: () => say(G.jack, flag('gotPass') ? 'Mirek, asleep with his head on the table and a smile on his face. He\'s dreaming of aeroplanes, or slivovitz.' : 'A mechanic in greasy overalls, swaying gently in his seat. A pass on a blue ribbon hangs from his pocket: OBSERVATORY ZLATÁ HORA.'),
      async talk() {
        const m = actor('mirek');
        if (flag('gotPass')) return say(G.jack, 'He\'s snoring. I\'ll let him sleep. He has a long walk up a mountain in the morning.');
        await say(m, 'Friend! Sit! You look like a man who needs a slivovitz. I am a man who needs another one.');
        await say(G.jack, 'You work up at the Observatory?');
        await say(m, 'Shh! There is no Observatory. I look after a big black bird that does not exist. Dr Veselá shouts at me in three languages.');
        await say(m, 'I missed the last bus up. But the bread van goes at five. I will go with the bread. Tomorrow. Maybe.');
        if (!has('water')) await think('He\'s not letting go of that pass while he\'s awake. And Marta isn\'t serving him anything more.');
      },
      async take() {
        if (flag('gotPass')) return;
        await say(G.jack, 'I reach, very casually, for the ribbon...');
        await say(actor('mirek'), 'Hands off! This is my pass! Without it I am nothing. With it, I am also nothing, but in a warm hangar.');
      },
      async item(id) {
        if (id !== 'water') return false;
        return mirekDrinks();
      } },
    { name: 'Mirek\'s Beers', photo: 'beer', rect: [640, 740, 220, 70], at: [560, 920], face: 1,
      look: () => say(G.jack, flag('gotPass') ? 'Four glasses now: three beers and one very strong glass of water.' : 'Three beers, all finished. Mirek has been celebrating something. Possibly Tuesday.') },
    { name: 'Door to the Square', rect: [0, 250, 110, 560], at: [160, 900], exitLabel: 'Out to the square',
      exit: () => gotoScene('square', 260, 900, 1, { sfx: 'door' }) },
  ],
};

async function innOpening() {
  G.busy = true;
  const j = G.jack;
  j.facing = 1;
  const n = makeFigure('novak', 980, 890, { id: 'novak', facing: -1, seed: 5, depthScale: true });
  n.scale = depthScale(890); G.actors.push(n);
  await wait(0.8);
  await say(n, 'Twelve days, darling. Twelve days you have sat in this inn, watching that mountain.');
  await say(j, 'I\'ve learned a lot. The bread van goes up every afternoon at five. The mechanics come down every night at eight. And Marta makes the best dumplings in Central Europe.');
  await say(n, 'You have also gained two kilos.');
  await say(j, 'Cover. A thin man in a village inn is suspicious.');
  await say(n, 'Control wants photographs of the aircraft. Real ones. So you will take this.');
  Sound.sfx('click');
  addItem('minox');
  await say(n, 'My Minox. I have photographed three ministers, two generals and a bishop with it. None of them were wearing trousers.');
  await say(n, 'I am taking Ilse and the child over the border tonight. The goose stays. Anička says she is your bodyguard now.');
  Sound.sfx('honk');
  await say(j, 'Wonderful. My bodyguard is a goose called Colonel.');
  await say(n, 'Be careful, darling. Mothers do not like to lose their best agents. It spoils the Christmas card list.');
  n.facing = -1;
  await walkTo(120, 900, n, 1.1);
  Sound.sfx('door');
  removeActor('novak');
  setObjective('Find a way into the mountain');
  save();
  G.busy = false;
}

async function talkMarta() {
  const m = actor('marta');
  if (!flag('metMarta')) {
    flag('metMarta', true);
    await say(m, 'Harwig! My favourite refrigerator salesman. Twelve days, and you have not sold one refrigerator.');
    await say(G.jack, 'It\'s a difficult market, Marta. Everybody here already has snow.');
  } else await say(m, 'What now, refrigerator man?');
  for (;;) {
    const c = await choose([
      { text: 'What goes on up at the Observatory?', value: 'obs' },
      !flag('askedBread') && { text: 'Who goes up the mountain?', value: 'up' },
      { text: 'Is Mirek all right?', value: 'mirek' },
      flag('askedMirek') && !has('water') && !flag('gotPass') && { text: 'I\'ll have what he\'s having.', value: 'water' },
      { text: 'Nothing, thank you.', value: 'bye' },
    ]);
    if (c === 'obs') {
      await say(G.jack, 'What goes on up at the Observatory?');
      await say(m, 'Stars, officially. But at night the mountain hums, the cows give no milk, and something black flies over the church without a sound.');
      await say(m, 'Father Tomáš says it is the Devil. I say the Devil would stop for a beer.');
    }
    if (c === 'up') {
      flag('askedBread', true);
      await say(G.jack, 'Who goes up the mountain?');
      await say(m, 'Soldiers, in trucks, who do not wave. The mechanics, on the bus. And Vlasta\'s bread van, every day at five. Soldiers do not bake.');
      if (!flag('gotPass')) setObjective('Find a way into the mountain: the bread van?');
    }
    if (c === 'mirek') {
      flag('askedMirek', true);
      await say(G.jack, 'Is Mirek all right?');
      await say(m, 'Mirek has had eleven slivovitz. After eleven, I give him water. He has not noticed for three years.');
    }
    if (c === 'water') {
      await say(G.jack, 'I\'ll have what he\'s having.');
      Sound.sfx('pour');
      await say(m, 'One "slivovitz". On the house. Do not tell anybody it is water, it is my best seller.');
      addItem('water');
    }
    if (c === 'bye') { await say(G.jack, 'Nothing, thank you, Marta.'); return say(m, 'Nothing. The only thing you ever buy.'); }
  }
}

async function mirekDrinks() {
  const m = actor('mirek');
  G.busy = true;
  removeItem('water');
  await say(G.jack, 'One for the road, Mirek?');
  await say(m, 'Friend! Na zdraví!');
  m.arm = 'toast';
  Sound.sfx('drink');
  await wait(1);
  await say(m, 'Ahh. Strong. Very strong. The strongest one yet...');
  m.arm = 'rest'; m.slump = true;
  Sound.sfx('thud');
  await wait(0.8);
  await say(G.jack, 'Out like a light, from a glass of water. The ribbon has slipped out of his pocket.');
  Sound.sfx('pickup');
  flag('gotPass', true); addItem('pass');
  await think('Mirek Dvořák, mechanic. He won\'t need it until the morning. Or, at this rate, next Tuesday.');
  setObjective(flag('baker') ? 'Ride up the mountain in the bread van' : 'Get a ride up the mountain');
  save();
  G.busy = false;
}

// ===========================================================================
// THE VILLAGE SQUARE
// ===========================================================================
SCENES.square = {
  title: 'Zlatá Hora · The Square · 16:40',
  music: 'village', ambience: ['snowWind', 'churchBell', 'birds'], floor: 'Snow',
  paint: paintSquare,
  walk: [0, 1045, 1920, 1045, 1920, 832, 0, 832],
  depth: [832, 1.5, 1045, 1.85],
  light: LIGHT.square,
  portraitBg: '#5a4a6a',
  snow: { n: 140, ground: 1080, wind: 40, speed: 60 },
  actors() {
    return [makeFigure('vlasta', 960, 900, { id: 'vlasta', facing: 1, arm: 'hold', seed: 33, depthScale: true })];
  },
  props: [
    { y: 930, draw: ctx => paintBreadVan(ctx, 1080, 930, true) },
    { y: 840, draw: ctx => { for (const [x, y] of [[1700, 840], [1760, 830], [1820, 846]]) { ctx.fillStyle = '#e8e0cc'; rrect(ctx, x - 34, y - 70, 68, 70, 16); ctx.fill(); ctx.fillStyle = '#6a2a1a'; ctx.font = `700 12px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillText('MOUKA', x, y - 30); } } },
  ],
  async enter() {
    if (flag('squareIntro')) return;
    flag('squareIntro', true);
    G.busy = true; await wait(0.6);
    await think('The square. The bakery, the church, and, on the peak above the village, three little lights where no light should be.');
    G.busy = false;
  },
  hotspots: [
    { name: 'The Mountain', rect: [980, 60, 280, 300],
      look: () => say(G.jack, 'The Observatory. A radar dome on the summit, and slits of light in the rock face. Somebody has hollowed out the whole mountain.') },
    { name: 'Church', rect: [820, 250, 240, 510], at: [940, 880],
      look: () => say(G.jack, 'The Church of St Wenceslas. The clock is eleven minutes slow. Nobody in Zlatá Hora is in a hurry to get anywhere.') },
    { name: 'Telephone Box', rect: [420, 560, 110, 220], at: [480, 880], useVerb: 'Make a call from',
      look: () => say(G.jack, 'A telephone box. One of the few in Karvonia that works, and one of the very many that is listened to.'),
      use: () => callControl() },
    { name: 'Bakery', rect: [1560, 470, 250, 290], at: [1650, 880],
      look: () => say(G.jack, 'Vlasta\'s bakery. The smell of bread could make a strong man weep. I\'ve been in here every day for twelve days. That explains the two kilos.') },
    { name: 'Flour Sacks', rect: [1660, 760, 200, 90], at: [1640, 900], useVerb: 'Dust myself with',
      look: () => say(G.jack, 'Sacks of flour waiting to go in. MOUKA, fifty kilos each.'),
      async use() {
        if (flag('baker')) return say(G.jack, 'Any more flour and they\'ll bake me.');
        if (!has('smock')) return say(G.jack, 'Roll in the flour, in my own coat, in front of the whole village? I need a better reason.');
        return becomeBaker();
      },
      async item(id) {
        if (id !== 'smock') return false;
        return becomeBaker();
      } },
    { name: 'Vlasta', actor: 'vlasta', at: [840, 920], face: 1,
      look: () => say(G.jack, 'Vlasta, the baker. Seventy years old, flour to the elbows, and able to carry four trays of rolls at once without looking.'),
      talk: () => talkVlasta() },
    { name: 'Bread Van', photo: 'bread', rect: [1080, 680, 560, 250], at: [1060, 960], useVerb: 'Climb into',
      look: () => say(G.jack, 'Vlasta\'s bread van. It goes up the mountain every day at five, and the soldiers wave it straight through. Nobody searches the bread.'),
      async use() {
        if (!flag('vlastaAgreed')) return say(actor('vlasta'), 'Oi! Out of my van! That is the soldiers\' supper, not a taxi.');
        if (!flag('baker')) return say(actor('vlasta'), 'Like that? In a coat like a spy in a film? The guards will shoot you, and then they will shoot me.');
        return rideUp();
      } },
    { name: 'Door to the Golden Rooster', rect: [100, 560, 140, 200], at: [220, 880], exitLabel: 'Back into the inn',
      exit: () => gotoScene('inn', 180, 900, 1, { sfx: 'door' }) },
  ],
};

async function callControl() {
  if (flag('calledControl')) return say(G.jack, 'I\'ve had enough of London for one day.');
  flag('calledControl', true);
  G.busy = true;
  Sound.sfx('coin'); await wait(0.6); Sound.sfx('ring'); await wait(1.4);
  const pos = [480, 420];
  await say('control', 'Yes?', { pos });
  await say(G.jack, 'It\'s me. I\'m going up the mountain tonight.');
  await say('control', 'Good. Photographs, Harrow. Nothing else. Don\'t touch the aircraft, don\'t bring it home, and for heaven\'s sake don\'t get on it.', { pos });
  await say(G.jack, 'Your mother sends her love.');
  await say('control', 'My mother is a national treasure and a national security risk. She tells me you have a goose.', { pos });
  await say(G.jack, 'The goose has me, sir.');
  await say('control', 'Photographs, Harrow.', { pos });
  Sound.sfx('phoneUp');
  G.busy = false;
}

async function talkVlasta() {
  const v = actor('vlasta');
  if (flag('vlastaAgreed') && flag('baker')) return say(v, 'Well? In the van, Pepík. The soldiers want their supper.');
  if (flag('vlastaAgreed')) return say(v, 'Put on the smock, and roll in the flour. Pepík is always covered in flour. It is his only talent.');
  await say(v, 'Rohlíky, koláče, bread for the soldiers! Oh, it is you, the refrigerator man. You want another cake? You will not fit in your coat.');
  for (;;) {
    const c = await choose([
      { text: 'Where are you taking all that bread?', value: 'where' },
      flag('askedVan') && { text: 'Let me carry the bread for you.', value: 'offer' },
      { text: 'How is business?', value: 'biz' },
      { text: 'Goodbye, Vlasta.', value: 'bye' },
    ]);
    if (c === 'where') {
      flag('askedVan', true);
      await say(G.jack, 'Where are you taking all that bread?');
      await say(v, 'Up the mountain, to the Observatory kitchen. Forty loaves, a hundred rolls. My boy Pepík carries the baskets, but Pepík has the mumps. He looks like a hamster.');
      await say(v, 'And my back is seventy years old. The rest of me is sixty.');
    }
    if (c === 'offer') {
      await say(G.jack, 'Let me carry the bread for you. I\'m strong, I\'m bored, and I work for cake.');
      await say(v, 'You? The guards know Pepík. Pepík is small, white with flour and not very clever. You are big, clean and far too clever.');
      await say(G.jack, 'I can be very stupid. Ask anyone in London.');
      await say(v, 'Hm. Here. Pepík\'s smock and his cap. Get some flour on you, and keep your mouth shut. Pepík never talks.');
      addItem('smock'); flag('vlastaAgreed', true);
      setObjective('Disguise yourself as Pepík, the baker\'s boy');
      save();
      return;
    }
    if (c === 'biz') {
      await say(G.jack, 'How is business?');
      await say(v, 'Very good. The soldiers eat like wolves, and they pay like wolves too. Which is to say, never.');
    }
    if (c === 'bye') { await say(G.jack, 'Goodbye, Vlasta.'); return say(v, 'Buy some bread next time. You look hungry. Also fat.'); }
  }
}

async function becomeBaker() {
  G.busy = true;
  removeItem('smock');
  Sound.sfx('cloth');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  flag('baker', true); G.jack.look = LOOKS.jackBaker;
  Sound.sfx('whoosh');
  await wait(0.6);
  G.fadeTo = 0; await waitUntil(() => G.fade < 0.05);
  await say(G.jack, 'One smock, one cap, and half a sack of flour. I look like a ghost who works in a bakery.');
  Sound.sfx('honk');
  await think('The Colonel doesn\'t recognise me. Good sign.');
  setObjective(flag('gotPass') ? 'Ride up the mountain in the bread van' : 'Get Mirek\'s pass before you go up');
  save();
  G.busy = false;
}

async function rideUp() {
  const v = actor('vlasta');
  if (!flag('gotPass')) return think('The van will get me past the gate. But once I\'m inside, I\'ll need to open doors. Mirek\'s pass, back in the inn.');
  G.busy = true;
  await say(v, 'Good boy, Pepík. In the back, with the baskets. And the goose?');
  await say(G.jack, 'She comes with me.');
  await say(v, 'Then she goes in a basket. If she eats one roll, you pay for it.');
  Sound.sfx('honk');
  addItem('basket');
  flag('gooseInBasket', true);
  Sound.sfx('carDoor'); await wait(0.4);
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  Sound.sfx('car');
  await TextScreen.play(RIDE_PAGES, 'tension');
  startPlay();
  G.sceneId = null; G.fade = 1;
  await gotoScene('hangar', 260, 900, 1, { instant: true });
  G.busy = false;
}

// ===========================================================================
// THE HANGAR — inside the mountain
// ===========================================================================
SCENES.hangar = {
  title: 'The Observatory · Hangar One · 17:20',
  music: 'hangar', ambience: ['hangarHum'], floor: 'Stone',
  paint: paintHangar,
  walk: [180, 1045, 1860, 1045, 1860, 852, 180, 852],
  depth: [852, 1.55, 1045, 1.9],
  get light() { return flag('lightsOn') ? LIGHT.hangarLit : LIGHT.hangar; },
  portraitBg: '#2a2e36',
  actors() {
    const list = [makeFigure('hana', 590, 884, { id: 'hana', facing: -1, arm: 'rest', seed: 34, depthScale: true })];
    if (!flag('hrubyGone')) list.push(makeFigure('hruby', 1300, 900, { id: 'hruby', facing: -1, arm: 'behind', seed: 35, depthScale: true }));
    return list;
  },
  props: [
    { y: 835, draw: ctx => paintDrawingBoard(ctx) },
    { y: 845, draw: ctx => paintJetSide(ctx, 980, 840, 0.95, { tarp: !flag('unveiled') }) },
  ],
  back(ctx, t) {
    hangarLight(ctx, !!flag('lightsOn'));
    if (flag('alarm')) { const a = 0.5 + 0.5 * Math.sin(t * 8); glow(ctx, 960, 60, 500, 'rgba(255,40,30,0.5)', a); }
  },
  async enter() {
    if (flag('alarm') && !flag('escaping')) { flag('escaping', true); return hanaSendsJack(); }
    if (flag('hangarIntro')) return;
    flag('hangarIntro', true);
    await hangarArrival();
  },
  hotspots: [
    { name: 'The Aircraft', rect: [540, 500, 900, 340], at: [900, 960], face: -1, useVerb: 'Lift the tarpaulin on',
      look: () => say(G.jack, flag('unveiled') ? 'Nightglass. Black as a hole in the night, all flat facets and knife edges. It doesn\'t look built. It looks cut.' : 'Something the size of a bus under a green tarpaulin that says DO NOT TOUCH. I have never wanted to touch anything so much.'),
      async use() {
        if (flag('unveiled')) return say(G.jack, 'I\'d love to sit in it. Control specifically said not to. Control is a very dull man.');
        if (!flag('hrubyGone')) return say(actor('hruby'), 'You! Bread boy! Hands off the tarpaulin, or I bake you.');
        return say(G.jack, 'It weighs a ton. Dr Veselá said she would show me. Let her.');
      },
      async item(id) {
        if (id !== 'minox') return false;
        if (!flag('unveiled')) return say(G.jack, 'A photograph of a tarpaulin. Control would have it framed and fire me.');
        if (!flag('lightsOn')) return say(G.jack, 'Too dark. I\'d get a black shape on a black background. Mind you, that\'s all it looks like anyway.');
        if (flag('photos')) return say(G.jack, 'Thirty-six exposures. Every angle. Even its good side, if it has one.');
        return takePhotos();
      } },
    { name: 'Lighting Panel', rect: [210, 470, 110, 150], at: [300, 900], face: -1, useVerb: 'Switch on',
      look: () => say(G.jack, flag('lightsOn') ? 'The test lights, blazing. It\'s like midday in here, if midday were underground and illegal.' : 'The hangar lights: four switches. Three say NORMAL. The red one says TEST: DO NOT USE WITHOUT AUTHORISATION.'),
      async use() {
        if (flag('lightsOn')) return say(G.jack, 'They\'re on. Any brighter and the jet would get a suntan.');
        if (!flag('hrubyGone')) return say(actor('hruby'), 'Bread boy! What are you doing by the switches? Bread goes to the kitchen!');
        Sound.sfx('clank'); await wait(0.3);
        flag('lightsOn', true);
        Sound.sfx('lightsOn');
        await say(G.jack, 'Clunk, clunk, clunk. Test lights. Now I can see every rivet in the place.');
        if (flag('unveiled')) setObjective('Photograph Nightglass');
        save();
      } },
    { name: 'Drawing Board', rect: [300, 560, 280, 250], at: [460, 900], face: -1,
      look: () => say(G.jack, 'Blueprints, pinned to a board. NIGHTGLASS, No. 7. Somebody has been improving the design. Somebody very good.') },
    { name: 'Dr Hana Veselá', actor: 'hana', at: [760, 920], face: -1,
      look: () => say(G.jack, 'A woman in a white coat with a pencil through her hair, glaring at the blueprints as if they had insulted her mother.'),
      talk: () => talkHana() },
    { name: 'Sergeant Hrubý', actor: 'hruby', at: [1120, 930], face: 1,
      look: () => say(G.jack, 'Sergeant Hrubý: twenty stone of Karvonian army, guarding the tarpaulin as if it might run off.'),
      async talk() {
        const h = actor('hruby');
        await say(h, 'Bread boy. Why are you still here? The kitchen is that way.');
        await say(G.jack, 'Sorry, Sergeant. Lost.');
        await say(h, 'Everybody is lost in this mountain. That is the idea.');
      },
      async item(id) {
        if (id === 'basket') return gooseAttack();
        if (id === 'pass') return say(actor('hruby'), 'You are not Mirek. Mirek has a moustache. Also, Mirek is not a bread boy.');
        return false;
      } },
    { name: 'Fuel Drums', rect: [1376, 740, 100, 90],
      look: () => say(G.jack, 'Jet fuel. Stencilled NO SMOKING in four languages, and, underneath, in pencil, PLEASE.') },
    { name: 'Crane', rect: [1180, 120, 120, 280],
      look: () => say(G.jack, 'An overhead crane with a hook. The tarpaulin is roped to it, ready to be lifted off.') },
    { name: 'Office Stairs', rect: [1240, 460, 680, 360], at: [1420, 900], exitLabel: 'Up to Vasko\'s office',
      async exit() {
        if (!flag('photos')) return think('The office can wait. First, the photographs. That\'s what I\'m here for.');
        if (!flag('officeOpen')) return say(G.jack, 'A steel door at the foot of the stairs. AUTHORISED STAFF. A slot for a pass beside the handle.');
        await gotoScene('office', 150, 920, 1, { sfx: 'door' });
      },
      async item(id) {
        if (id !== 'pass') return false;
        if (!flag('photos')) return think('The office can wait. First, the photographs.');
        Sound.sfx('beep'); await wait(0.4); Sound.sfx('unlock');
        flag('officeOpen', true);
        await say(G.jack, 'Beep, click. Mirek Dvořák, mechanic, is going upstairs.');
        save();
        await gotoScene('office', 150, 920, 1, { sfx: 'door' });
      } },
    { name: 'Delivery Door', rect: [0, 420, 170, 400], at: [230, 900], exitLabel: 'Out to the delivery bay',
      exit: () => say(G.jack, flag('photos') ? 'Vlasta\'s van will be long gone, and the flight plan is upstairs. No going back yet.' : 'Vlasta\'s van leaves in an hour, with me or without me. I haven\'t got what I came for.') },
  ],
};

const RIDE_PAGES = [
  { kicker: 'THE MOUNTAIN ROAD  ·  17:05', amb: ['snowWind'], text: 'The van climbs through the pines in first gear. Forty loaves, a hundred rolls, one baker\'s boy, and one basket that occasionally honks.' },
  { kicker: 'THE OBSERVATORY GATE', amb: ['snowWind'], text: 'The barrier goes up. A soldier looks in the back. "Where is Pepík?" "This is Pepík," says Vlasta. "Pepík is twelve." "He has had a very difficult year."' },
];

async function hangarArrival() {
  G.busy = true;
  const j = G.jack;
  j.facing = 1;
  await wait(0.8);
  await think('Inside the mountain. A cathedral of rock, and in the middle, under a tarpaulin, the thing that everybody is lying about.');
  const h = actor('hruby');
  await say(h, 'You! Bread boy! The kitchen is through the other door. And what is in that basket?');
  Sound.sfx('honk');
  await say(j, 'Bread. It\'s very fresh.');
  await say(h, 'Fresh bread does not honk.');
  await say(j, 'Karvonian bread does. It\'s the yeast.');
  await say(h, '...Carry on.');
  setObjective('Get a look under the tarpaulin');
  save();
  G.busy = false;
}

async function talkHana() {
  const h = actor('hana');
  if (flag('photos')) return say(h, 'The office is at the top of the stairs. The flight plans are in his safe. He changes the code every week, and every week it is something about himself.');
  if (flag('unveiled')) return say(h, 'Well? Take your pictures, bread boy. And switch on the test lights, or you will photograph nothing but shadow.');
  if (flag('hrubyGone')) return hanaUnveils();
  if (!flag('metHana')) {
    flag('metHana', true);
    await say(h, 'You are not Pepík.');
    await say(G.jack, 'I\'ve had a very difficult year.');
    await say(h, 'Pepík is twelve, he has a hamster called Stalin, and he has never once walked past this aircraft without asking me how fast it goes. You have not asked. So you already know.');
    await say(G.jack, 'Mach one point four. And invisible to radar. You built it?');
    await say(h, 'Dr Hana Veselá. Vasko stole the plans. I made them work. He has my mother in Karvograd, in a flat with a view of the gasworks. Every day I do not build, she loses a window.');
  } else await say(h, 'Still here?');
  await say(h, 'Get Sergeant Hrubý away from my aircraft, and I will show you what I have built. He is afraid of nothing on earth.');
  await say(G.jack, 'Nothing?');
  await say(h, 'Well. He was once bitten by a swan. He does not talk about it.');
  await think('A swan. And I have a basket with something very like a swan in it. Only angrier.');
  setObjective('Get Sergeant Hrubý away from the aircraft');
  save();
}

async function gooseAttack() {
  G.busy = true;
  const h = actor('hruby');
  removeItem('basket');
  flag('gooseInBasket', false);
  await say(G.jack, 'Sergeant, the kitchen asked me to give you this basket. Personally.');
  await say(h, 'For me? Bread? Finally, some respect.');
  Sound.sfx('honk'); await wait(0.2); Sound.sfx('honk');
  Goose.release(h);
  h.arm = 'panic';
  await say(h, 'A SWAN! It is a swan! Get it away! Not again! NOT AGAIN!');
  Sound.sfx('shriek');
  walkTo(60, 900, h, 2.4);
  await wait(2.2);
  removeActor('hruby');
  Goose.leave();
  flag('hrubyGone', true);
  Sound.sfx('door');
  await wait(0.6);
  await say(G.jack, 'It\'s a goose, Sergeant. Technically.');
  await say(actor('hana'), 'In four years I have never seen him move so fast. You must tell me how you train them.');
  setObjective('Talk to Dr Veselá');
  save();
  G.busy = false;
}

async function hanaUnveils() {
  const h = actor('hana');
  G.busy = true;
  await say(h, 'Very well, not-Pepík. You have earned a look.');
  await walkTo(1180, 900, h, 1.2);
  h.arm = 'reach';
  Sound.sfx('crane'); await wait(1.2);
  Sound.sfx('whoosh');
  G.fadeTo = 0.9; await waitUntil(() => G.fade > 0.85);
  flag('unveiled', true);
  await wait(0.3);
  G.fadeTo = 0; await waitUntil(() => G.fade < 0.05);
  h.arm = 'rest';
  Sound.playMusic('reveal');
  await say(h, 'Nightglass. Number Seven.');
  await say(G.jack, 'Seven?');
  await say(h, 'The plans you stole in Vienna were for Number One, the prototype. It crashed into a lake. This is Number Seven. There are twelve.');
  await say(G.jack, 'Where are the other eleven?');
  await say(h, 'Ask the Colonel. His flight plans are in the safe in his office. But first, your photographs. Use the test lights, the red switch. Nobody authorises anything here anyway.');
  await walkTo(590, 884, h, 1.2); h.facing = -1;
  setObjective(flag('lightsOn') ? 'Photograph Nightglass' : 'Switch on the test lights and photograph Nightglass');
  save();
  G.busy = false;
}

async function takePhotos() {
  G.busy = true;
  for (let k = 0; k < 4; k++) { Sound.sfx('shutter'); await wait(0.45); }
  G.flash = G.t;
  flag('photos', true);
  await say(G.jack, 'Nose, tail, intakes, undercarriage. Thirty-six exposures of the most secret aircraft in the world, on a camera that has seen a bishop without his trousers.');
  await say(actor('hana'), 'Its good side is the left.');
  await say(G.jack, 'It hasn\'t got a good side. That\'s the point.');
  setObjective('Get into Vasko\'s office and find the flight plans');
  save();
  G.busy = false;
}

async function hanaSendsJack() {
  G.busy = true;
  const h = actor('hana');
  await wait(0.5);
  await say(h, 'Not-Pepík! Vasko is at the main gate with Captain Kolar and half the army. The main tunnel is full of soldiers.');
  await say(G.jack, 'Is there another way out?');
  await say(h, 'The service tunnel. It runs under the mountain to the runway. Take the tug, the little tractor by the door. It goes like the devil and steers like a pig.');
  await say(G.jack, 'Come with me.');
  await say(h, 'And my mother loses the last window? No. Take your pictures to London. Tell them there are twelve. And tell them the name of the woman who made them fly.');
  await say(G.jack, 'Hana Veselá. I won\'t forget.');
  await say(h, 'Everyone forgets engineers. Go!');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  TunnelRun.start();
}

// ===========================================================================
// VASKO'S OFFICE
// ===========================================================================
SCENES.office = {
  title: 'The Observatory · The Colonel\'s Office',
  music: 'tension', ambience: ['hangarHum', 'clock'], floor: 'Carpet', musicFilter: 3000,
  paint: paintOffice4,
  walk: [120, 1045, 1860, 1045, 1860, 860, 120, 860],
  depth: [860, 1.62, 1045, 1.95],
  light: LIGHT.office,
  portraitBg: '#3a1a12',
  props: [{ y: 855, draw: ctx => paintVaskoDesk(ctx) }],
  back(ctx, t) { if (flag('alarm')) { const a = 0.5 + 0.5 * Math.sin(t * 8); glow(ctx, 960, 340, 520, 'rgba(255,40,30,0.4)', a); } },
  async enter() {
    if (flag('officeIntro')) return;
    flag('officeIntro', true);
    G.busy = true; await wait(0.6);
    await think('Colonel Vasko\'s office. Somehow, I knew it would have a red carpet.');
    G.busy = false;
  },
  hotspots: [
    { name: 'Map of Europe', rect: [90, 160, 360, 260], at: [300, 920], face: -1,
      look: () => say(G.jack, 'A map of Europe with pins in it: Karvograd, Vienna, Prague. And a dotted red line to Istanbul, circled twice. Vasko is going on holiday.') },
    { name: 'Portrait of Vasko', rect: [160, 460, 150, 190], at: [260, 920], face: -1,
      look: () => say(G.jack, 'Another portrait. This one hangs in his own office, where he can look at it. I\'ve counted nine so far today.') },
    { name: 'Window', rect: [520, 110, 880, 460], at: [700, 900],
      look: () => say(G.jack, flag('unveiled') ? 'The hangar below, and Nightglass under the test lights. From up here it looks like a hole cut in the floor.' : 'The hangar below, the tarpaulin, and Hrubý guarding it.') },
    { name: 'Model Aircraft', photo: 'jetmodel', rect: [990, 630, 130, 50], at: [1060, 900],
      look: () => say(G.jack, 'A desk model of Nightglass, in gold. On the stand: "To myself, with admiration. D. V."') },
    { name: 'Telephone', rect: [850, 628, 70, 52], at: [880, 900], useVerb: 'Pick up',
      look: () => say(G.jack, 'A black telephone with a red button marked MOSCOW and a white one marked MOTHER.'),
      use: () => say(G.jack, 'Press MOTHER? Tempting. But I have a feeling she\'d recognise my voice.') },
    { name: 'Calendar', rect: [1480, 150, 200, 260], at: [1580, 920], face: 1,
      look: async () => { flag('sawCalendar', true); await say(G.jack, 'December 1987. The third is ringed in red, and underneath he\'s written DEMONSTRATION, with three exclamation marks. Tomorrow.'); } },
    { name: 'Medal Cabinet', rect: [1480, 460, 200, 240], at: [1580, 920], face: 1,
      look: () => say(G.jack, 'Twelve medals. The Order of the Red Banner, the Hero of Karvonia, and one for Best Moustache, Karvograd Regional Finals, 1979.') },
    { name: 'Safe', rect: [1740, 470, 160, 200], at: [1780, 920], face: 1,
      look: () => say(G.jack, flag('safeOpen') ? 'Empty, except for a diary. "Dear Diary. Today I was magnificent." Every page.' : 'A wall safe with a six-digit keypad. Vasko\'s safes always have six digits and always have something to do with Vasko.'),
      async use() {
        if (flag('safeOpen')) return say(G.jack, 'Just the diary. "Dear Diary. Today I was magnificent." I\'ll leave it for the historians.');
        const ok = await openKeypad('031287', {
          brand: 'ZÁMEČNICTVÍ KARVOGRAD  ·  TYP 6',
          onGiveUp: () => run(async () => {
            if (flag('sawCalendar')) await think('Six digits. Something about him, and something that matters this week. The third of December, 1987. Oh-three, twelve, eighty-seven.');
            else await think('Six digits. Last time it was his birthday. This time I bet it\'s a date too. Something he\'s looking forward to.');
          }),
        });
        if (ok) await safeOpened();
      } },
    { name: 'Door to the Hangar', rect: [0, 230, 90, 580], at: [140, 920], exitLabel: 'Down to the hangar',
      async exit() {
        if (!flag('safeOpen')) return think('Not without the flight plans.');
        await gotoScene('hangar', 1420, 900, -1, { sfx: 'door' });
      } },
  ],
};

async function safeOpened() {
  G.busy = true;
  flag('safeOpen', true);
  Sound.sfx('paper');
  addItem('flightplan');
  await say(G.jack, 'A flight plan. NIGHTGLASS 07, Zlatá Hora to Istanbul, tonight at midnight. Pilot: Colonel D. Vasko. He\'s drawn a little crown next to his name.');
  await say(G.jack, 'And a diary. "Dear Diary. Today I was magnificent." That\'s the whole entry. Every day.');
  await wait(0.4);
  flag('alarm', true);
  Sound.setAmbience(['hangarHum', 'klaxon']);
  Sound.playMusic('action');
  await say('kolar', 'Attention! Colonel Vasko is arriving! All personnel to the hangar! Prepare Nightglass Seven for flight!', { pos: [960, 150] });
  await say('kolar', 'And will somebody please catch that goose!', { pos: [960, 150] });
  await think('Time to go. Quickly, and not the way I came.');
  setObjective('Get out of the mountain');
  save();
  G.busy = false;
}

// ===========================================================================
// THE RUNWAY — the ending
// ===========================================================================
SCENES.runway = {
  title: 'The Runway · 23:56',
  music: 'tension', ambience: ['snowWind', 'jetIdle'], floor: 'Stone',
  paint: paintRunway,
  walk: [480, 1045, 1860, 1045, 1860, 862, 480, 862],
  depth: [862, 1.45, 1045, 1.8],
  light: LIGHT.runway,
  portraitBg: '#1a2238',
  snow: { n: 160, ground: 1080, wind: 200, speed: 90 },
  props: [{ y: 895, draw: (ctx, t) => paintJetSide(ctx, 1150, 900, 0.9, { bayOpen: !flag('bayShut'), glow: 0.7 + 0.3 * Math.sin(t * 20) }) }],
  async enter() {
    if (flag('runwayIntro')) return;
    flag('runwayIntro', true);
    await runwayEnding();
  },
  hotspots: [],
};

async function runwayEnding() {
  G.busy = true;
  const j = G.jack;
  j.facing = 1;
  await wait(0.8);
  await think('The service tunnel came out on the runway. The jet is already here, engines turning, with a ladder at the cockpit.');
  const k = makeFigure('kolar', 200, 900, { id: 'kolar', facing: 1, arm: 'point', seed: 17, depthScale: true });
  const s1 = makeFigure('soldier', 120, 940, { id: 'soldier1', facing: 1, seed: 40, depthScale: true });
  const s2 = makeFigure('soldier', 60, 880, { id: 'soldier2', facing: 1, seed: 41, depthScale: true });
  for (const a of [k, s1, s2]) { a.scale = depthScale(a.y); G.actors.push(a); }
  walkTo(420, 900, k, 0.8); walkTo(330, 940, s1, 0.8); walkTo(300, 880, s2, 0.8);
  await say(k, 'Search the runway! He came through the service tunnel on a tug. Nobody drives a tug that badly by accident.');
  j.facing = -1;
  await think('Soldiers behind me, a sheer drop in front of me. And one open hatch, right there, under the belly of the aircraft.');
  j.facing = 1;
  await walkTo(1070, 930, j, 1.3);
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  flag('bayShut', true);
  Sound.sfx('clank');
  await wait(1);
  G.busy = false;
  store.del(CHAPTER.saveKey);
  await Ending.cliffhanger();
}

// ---------- the goose: follows Jack, rides in a basket, chases sergeants ---------------
const Goose = {
  trail: [], lead: null, gone: false,
  reset() { this.trail = []; this.lead = null; },
  visible() {
    if (this.lead) return true;
    return !flag('gooseInBasket') && !flag('hrubyGone') && ['inn', 'square'].includes(G.sceneId) && G.mode === 'play';
  },
  release(fig) { this.lead = fig; this.trail = [[fig.x - 200, fig.y + 20]]; },
  leave() { this.lead = null; },
  update() {
    const f = this.lead || G.jack;
    if (!f) return;
    const last = this.trail[this.trail.length - 1];
    if (!last || Math.hypot(last[0] - f.x, last[1] - f.y) > 10) this.trail.push([f.x, f.y]);
    if (this.trail.length > 120) this.trail.shift();
  },
  draw(ctx, t) {
    const f = this.lead || G.jack;
    const idx = this.trail.length - 1 - (this.lead ? 4 : 9);
    const [x, y] = idx >= 0 ? this.trail[idx] : [f.x - f.facing * 80, f.y + 6];
    drawGoose(ctx, x, y + 8, depthScale(y) * 0.42, t * (this.lead ? 2 : 1), f.x > x ? 1 : -1);
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
  if (sc === 'inn') {
    if (!flag('gotPass')) {
      if (!flag('askedMirek')) return think('That mechanic has a pass for the mountain. Marta will know how to handle him.');
      if (!has('water')) return think('Marta gives Mirek water after his eleventh slivovitz. I could buy him a "drink".');
      return think('One more "slivovitz" for Mirek, and he\'ll be asleep with his pass hanging out.');
    }
    return think(flag('baker') ? 'The bread van is waiting in the square.' : 'The bread van in the square goes up the mountain at five.');
  }
  if (sc === 'square') {
    if (!flag('vlastaAgreed')) return think('Vlasta\'s boy is ill, and she has a lot of bread to carry up that mountain.');
    if (!flag('baker')) return think('Pepík is always covered in flour, Vlasta says. Those sacks by the bakery door...');
    if (!flag('gotPass')) return think('Mirek\'s pass would open doors inside the mountain. He\'s in the Golden Rooster.');
    return think('Into the van, Pepík.');
  }
  if (sc === 'hangar') {
    if (!flag('metHana')) return think('That woman in the white coat looks like she knows every bolt in that aircraft.');
    if (!flag('hrubyGone')) return think('Hrubý was once bitten by a swan. My basket has something very like a swan in it.');
    if (!flag('unveiled')) return think('Hrubý\'s gone. Dr Veselá said she\'d show me what she built.');
    if (!flag('lightsOn')) return think('Too dark for photographs. The red switch on the lighting panel.');
    if (!flag('photos')) return think('Lights, aircraft, camera. The Minox, on Nightglass.');
    return think('The office is up the stairs. Mirek\'s pass should open the door.');
  }
  if (sc === 'office') {
    if (!flag('safeOpen')) return think(flag('sawCalendar') ? 'The third of December, 1987, ringed on his calendar. Six digits.' : 'Six digits, and it will be about Vasko. That calendar looks well used.');
    return think('Out. Now.');
  }
}
