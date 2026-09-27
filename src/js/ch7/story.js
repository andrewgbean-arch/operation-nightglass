// ---------------------------------------------------------------------------
// Chapter Seven: The Wall — items, scenes, hotspots, dialogue, puzzles.
// Burned by London, Jack goes where nobody would look for him: East Berlin.
// A courtyard in Prenzlauer Berg with a Trabant that won't start; a punk club
// in the cellar; the Stasi archive at night; and, after a tunnel under the
// death strip, West Berlin at dawn, where Franz is waiting with a car.
// ---------------------------------------------------------------------------

const ITEMS = {
  fishnets: {
    name: 'Fishnet Tights',
    desc: 'Nina\'s fishnet tights, more hole than tights. In the West they would be fashion. In the East they are a political statement. In a Trabant they are a fan belt.',
    icon(c) {
      c.strokeStyle = '#1a1a1a'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(-10, -30); c.quadraticCurveTo(-20, 0, -14, 30); c.moveTo(10, -30); c.quadraticCurveTo(20, 0, 14, 30); c.stroke();
      for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(-20, k * 8); c.lineTo(20, k * 8 + 8); c.moveTo(-20, k * 8 + 8); c.lineTo(20, k * 8); c.stroke(); }
      c.fillStyle = '#e8408a'; c.fillRect(-14, -34, 28, 6);
    },
  },
  pass: {
    name: 'Cleaner\'s Pass',
    desc: 'Horst Brandt, night cleaner, Ministry for State Security, Normannenstraße. The photograph could be anybody in a flat cap. Tonight it\'s me.',
    icon(c) {
      c.rotate(-0.1);
      c.fillStyle = '#8a9a7a'; c.fillRect(-30, -20, 60, 40); c.fillStyle = '#e8e2d6'; c.fillRect(-24, -14, 18, 24);
      ellipse(c, -15, -6, 5, 6, '#b89a7a'); c.fillStyle = '#4a4a44'; c.fillRect(-21, -14, 12, 4);
      c.fillStyle = '#2a2a2a'; for (let k = 0; k < 3; k++) c.fillRect(0, -10 + k * 8, 22 - k * 4, 2);
      c.fillStyle = '#9e1f28'; c.beginPath(); c.arc(18, 12, 6, 0, 7); c.fill();
    },
  },
  coffee: {
    name: 'Western Coffee',
    desc: 'A vacuum pack of real Western coffee from Uwe\'s aunt in Hamburg. In East Berlin this is worth more than the Trabant. Possibly more than Uwe.',
    icon(c) {
      c.fillStyle = '#9e1f28'; rrect(c, -22, -30, 44, 60, 6); c.fill();
      c.fillStyle = '#c9a13b'; c.fillRect(-22, -8, 44, 14);
      c.fillStyle = '#f0e4c8'; c.font = `700 9px ${FONT_UI}`; c.textAlign = 'center'; c.fillText('KAFFEE', 0, 2);
      ellipse(c, 0, -20, 8, 5, '#6a3a1a');
    },
  },
  key7: {
    name: 'Key to Cabinet 7',
    desc: 'A brass key with a cardboard tag: SCHRANK 7. NUR MIT GENEHMIGUNG. Only with permission. I\'m giving myself permission.',
    icon(c) {
      c.rotate(0.6);
      c.strokeStyle = '#c9a13b'; c.lineWidth = 5; c.beginPath(); c.arc(-16, 0, 9, 0, 7); c.stroke();
      c.fillStyle = '#c9a13b'; c.fillRect(-7, -2.5, 30, 5); c.fillRect(16, 2, 4, 7); c.fillRect(8, 2, 4, 5);
      c.fillStyle = '#e8e2d6'; c.fillRect(-30, 6, 16, 12);
    },
  },
  file: {
    name: 'Stasi File: TEEKANNE',
    desc: 'Operative file TEEKANNE, the Teapot: a British contact who arranged every payment between Colonel Vasko and London. Photographs, bank transfers, and a signature I know very well.',
    icon(c) {
      c.rotate(-0.08);
      c.fillStyle = '#c8b888'; c.fillRect(-28, -34, 56, 68); c.fillStyle = '#b8a878'; c.fillRect(-28, -34, 56, 10);
      c.fillStyle = '#9e1f28'; c.fillRect(-20, -12, 40, 10);
      c.fillStyle = '#1a1a1a'; c.font = `700 8px ${FONT_UI}`; c.textAlign = 'center'; c.fillText('TEEKANNE', 0, 14);
      c.fillStyle = '#2a2a2a'; c.fillRect(-16, 20, 32, 2);
    },
  },
};

async function lookItemStory(id) {
  // the file gets a proper close-up
  if (id === 'file') {
    G.photo = { id: 'akte', t: 0, label: ITEMS.file.name };
    try { return await say(G.jack, ITEMS[id].desc); } finally { G.photo = null; }
  }
  await say(G.jack, ITEMS[id].desc);
}

const LIGHT = {
  hof: { ambient: 'rgba(40,50,70,0.22)', key: 'rgba(255,215,160,0.3)', keyX: 1750 },
  club: { ambient: 'rgba(40,10,20,0.25)', key: 'rgba(232,64,138,0.4)', keyX: 1340 },
  archive: { ambient: 'rgba(40,50,30,0.08)', key: 'rgba(230,255,230,0.25)', keyX: 900 },
  west: { ambient: 'rgba(60,40,60,0.12)', key: 'rgba(255,200,160,0.4)', keyX: 1500 },
};

const SCENES = {};

// ===========================================================================
// THE COURTYARD — Prenzlauer Berg, a Trabant with its bonnet up
// ===========================================================================
SCENES.hof = {
  title: 'A Courtyard in Prenzlauer Berg · East Berlin · 16:00',
  music: 'grey', ambience: ['wind', 'tram'], floor: 'Snow',
  paint: paintHof,
  walk: [60, 1045, 1880, 1045, 1880, 872, 60, 872],
  depth: [872, 1.58, 1045, 1.9],
  light: LIGHT.hof,
  portraitBg: '#4a5060',
  actors() {
    return [
      makeFigure('ilse', 460, 900, { id: 'ilse', facing: 1, arm: 'rest', seed: 3, depthScale: true }),
      makeFigure('uwe', 1530, 910, { id: 'uwe', facing: -1, arm: flag('trabiFixed') ? 'rest' : 'reach', seed: 71, depthScale: true }),
    ];
  },
  props: [
    { y: 905, draw: (ctx, t) => paintTrabant(ctx, 1250, 905, 1.3, { bonnetUp: !flag('trabiFixed'), smoke: flag('trabiFixed') ? 0.6 + 0.4 * Math.sin(t * 3) : 0 }) },
  ],
  front(ctx, t) {
    // snow falling across the courtyard
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let k = 0; k < 90; k++) {
      const x = (k * 211 + t * (20 + (k % 5) * 8) + Math.sin(t + k) * 20) % W, y = (k * 97 + t * (40 + (k % 7) * 10)) % H;
      ctx.fillRect(x, y, 3, 3);
    }
  },
  async enter() {
    if (flag('hofIntro')) return;
    await hofOpening();
  },
  hotspots: [
    { name: 'Tenements', rect: [0, 40, 1600, 560],
      look: () => say(G.jack, 'Five storeys of grey plaster, falling off in slabs to show the brick underneath. Every window has a curtain, and behind every curtain, somebody is watching the man with the goose.') },
    { name: 'Washing Line', rect: [300, 410, 800, 110],
      look: () => say(G.jack, 'Somebody\'s washing, frozen solid. That shirt could stand up and walk to work by itself.') },
    { name: 'Coal', rect: [290, 740, 290, 110],
      look: () => say(G.jack, 'Brown-coal briquettes. The whole of East Berlin smells of them in winter: sulphur, smoke and faint despair.'),
      take: () => say(G.jack, 'Every briquette in this pile is counted. Probably by two different ministries.') },
    { name: 'Stairwell Door', rect: [120, 560, 140, 280], at: [260, 930], face: -1,
      look: () => say(G.jack, 'The door to Ilse\'s stairwell. Her flat is on the fourth floor, with a view of the bins and a microphone in the light fitting.'),
      use: () => say(actor('ilse'), 'Not upstairs, Jack. The neighbour on the second floor writes down everyone who uses the stairs. She has written down me forty times.') },
    { name: 'The Trabant', rect: [1010, 700, 480, 210], at: [1060, 950], face: 1,
      look: () => say(G.jack, flag('trabiFixed') ? 'The Trabant, running, and smoking like a steam engine. A fishnet fan belt. Somewhere in Zwickau an engineer is weeping.' : 'A Trabant 601: a two-stroke engine, a body made of cotton waste and resin, and a waiting list of twelve years. Its bonnet is up and Uwe\'s head is in it.'),
      useVerb: 'Get in',
      async use() {
        if (!flag('trabiFixed')) return say(actor('uwe'), 'Get in? And go where? Without a fan belt it goes nowhere. It does not even go "brrm".');
        return driveToArchive();
      },
      async item(id) {
        if (id === 'fishnets') return fixTrabant();
        return false;
      } },
    { name: 'The Cellar', rect: [740, 640, 200, 200], at: [840, 900], exitLabel: 'Down to the club',
      exit: () => gotoScene('club', 200, 960, 1, { sfx: 'door' }) },
    { name: 'Archway', rect: [1620, 440, 260, 400], at: [1780, 930],
      look: () => say(G.jack, 'The archway out to the street. A Volkspolizei van has been parked across the road for an hour. Nobody has got in or out of it.') },
    { name: 'Ilse', actor: 'ilse', at: [640, 950], face: -1,
      look: () => say(G.jack, 'Ilse, in her red coat, the only bright colour in Prenzlauer Berg. She says she grew up three streets from here. She says a lot of things.'),
      talk: () => talkIlse(),
      async item(id) {
        if (id === 'fishnets') return say(actor('ilse'), 'Thank you, Jack, but they are not my size. And they are not for me, they are for the car.');
        return false;
      } },
    { name: 'Uwe', actor: 'uwe', at: [1650, 950], face: -1,
      look: () => say(G.jack, flag('trabiFixed') ? 'Uwe, wiping his hands and looking at his Trabant the way other men look at a new baby.' : 'Uwe, the mechanic of the courtyard, head and shoulders inside the Trabant, swearing at it in Saxon.'),
      talk: () => talkUwe(),
      async item(id) {
        if (id === 'fishnets') return fixTrabant();
        return false;
      } },
  ],
};

async function hofOpening() {
  flag('hofIntro', true);
  G.busy = true;
  const i = actor('ilse'), j = G.jack;
  await wait(0.6);
  await say(i, 'Welcome to the workers\' paradise, Jack. Mind the ice, it has been here since 1983.');
  await say(j, 'Ilse. Thank you for the telegram. Nobody else will speak to me. Every British embassy in Europe is waiting to arrest me.');
  await say(i, 'Which is why you came to the one place in Europe with no British embassy. You are learning.');
  await say(i, 'Listen. Every payment between Vasko and London went through East Berlin. The Stasi watched every one, and the Stasi file everything. Somewhere in the archive at Normannenstraße there is a file on Control\'s deal.');
  await say(j, 'Proof. Proof that he\'s the traitor, not me.');
  await say(i, 'Uwe will drive us. It is the only car in the building. Well, it is a car.');
  Sound.sfx('clank');
  await say(actor('uwe'), 'Scheibenkleister! The fan belt! Gone! Twelve years I waited for this car, and now I wait fifteen years for a fan belt!');
  Sound.sfx('honk');
  setObjective('Help Uwe get the Trabant running');
  save();
  G.busy = false;
}

async function talkIlse() {
  const i = actor('ilse');
  if (flag('trabiFixed')) return say(i, 'Into the car, Jack. And bring your goose. The Stasi archive does not allow geese, so she will wait with me.');
  if (flag('needBelt') && !has('fishnets')) {
    await say(i, 'Don\'t look at my legs, Jack. These are the only Western tights in Prenzlauer Berg, and they are staying on.');
    await say(i, 'Try the club downstairs. The singer wears nothing but holes. Some of them are held together with tights.');
    return;
  }
  await say(i, 'Normannenstraße. The Ministry for State Security. Ninety thousand people who do nothing but watch the other sixteen million. And one filing cabinet with Control\'s name in it.');
}

async function talkUwe() {
  const u = actor('uwe');
  if (flag('trabiFixed')) return say(u, 'Hear her? Like a sewing machine full of gravel. Beautiful. Get in, get in.');
  if (!flag('needBelt')) {
    flag('needBelt', true);
    await say(u, 'You want to go somewhere? Everybody wants to go somewhere. This car wants to go somewhere. But the fan belt is broken, and in the whole Republic there is not one fan belt until 1994.');
    await say(G.jack, 'Can\'t you use something else?');
    await say(u, 'In the West, they say, you can use a lady\'s nylon stocking. In the West, ladies have nylon stockings. Here, a lady with nylons would sooner give you a kidney.');
    setObjective('Find something to use as a fan belt');
    save();
    return;
  }
  await say(u, 'A stocking, a belt, a bootlace, anything that goes round and round. And not your scarf, I tried a scarf in 1981. It went round and round and then it went up in smoke.');
}

async function fixTrabant() {
  const u = actor('uwe');
  G.busy = true;
  removeItem('fishnets');
  await say(G.jack, 'Uwe. Would these do?');
  await say(u, 'Fishnets! From Nina! Ha! She wore these when she sang at the Party youth festival. They had to stop the festival.');
  await walkTo(1400, 920, u, 1.1);
  u.arm = 'reach';
  Sound.sfx('clank'); await wait(0.4); Sound.sfx('clank');
  await say(u, 'Round the crankshaft... round the dynamo... tie a knot...');
  u.arm = 'rest';
  Sound.sfx('carStart');
  flag('trabiFixed', true);
  await wait(1.2);
  await say(u, 'She lives! Listen to her! Rrrrang-ang-ang-ang!');
  await say(u, 'For you, Englishman. From my aunt in Hamburg. Real Western coffee. Keep it for an emergency. In this country everything is an emergency.');
  addItem('coffee');
  setObjective('Drive to the Stasi archive');
  save();
  G.busy = false;
}

async function driveToArchive() {
  G.busy = true;
  if (!has('pass')) { G.busy = false; return say(actor('ilse'), 'And when we get there, Jack? You walk up to the Stasi and ask nicely? You need a way in. Nina\'s father works there, I think.'); }
  Sound.sfx('carDoor');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  await TextScreen.play(DRIVE_PAGES, 'grey');
  flag('cleaner', true);
  startPlay();
  G.sceneId = null; G.fade = 1;
  await gotoScene('archive', 1760, 960, -1, { instant: true });
  G.busy = false;
}
const DRIVE_PAGES = [
  { kicker: 'LICHTENBERG  ·  22:40', amb: ['trabant'], text: 'The Trabant does sixty downhill, forty on the flat, and fills Frankfurter Allee with blue smoke. Nobody looks twice. Every car in East Berlin fills Frankfurter Allee with blue smoke.' },
  { kicker: 'NORMANNENSTRASSE  ·  23:00', amb: ['wind'], text: 'The Ministry for State Security: a whole city block of grey windows, lit all night. At the side door a guard looks at a pass, at a flat cap, at a mop and bucket, and yawns. Horst Brandt, night cleaner, reporting for work.' },
];

// ===========================================================================
// THE CLUB — "Zum Letzten Groschen", a punk cellar
// ===========================================================================
SCENES.club = {
  title: 'Zum Letzten Groschen · A Cellar Club · 19:00',
  music: 'punk', ambience: ['crowd'], floor: 'Stone',
  paint: paintClub,
  walk: [80, 1045, 1860, 1045, 1860, 880, 80, 880],
  depth: [880, 1.62, 1045, 1.9],
  light: LIGHT.club,
  portraitBg: '#3a1020',
  actors() {
    return [
      makeFigure('nina', 1320, 900, { id: 'nina', facing: -1, arm: 'rest', seed: 72, depthScale: true }),
      makeFigure('kalle', 360, 900, { id: 'kalle', facing: 1, arm: 'rest', seed: 73, depthScale: true }),
    ];
  },
  back(ctx, t) { drawPogo(ctx, t, flag('sang') ? 1 : 0); },
  async enter() {
    if (flag('clubIntro')) return;
    flag('clubIntro', true);
    G.busy = true;
    await wait(0.5);
    const n = actor('nina');
    await say(n, 'Hey! Who let the Wessi in?');
    await say(G.jack, 'I\'m not from the West. I\'m from London.');
    await say(n, 'Worse.');
    Sound.sfx('honk');
    await think('The Colonel has found the pogo. The Colonel is pogoing.');
    G.busy = false;
  },
  hotspots: [
    { name: 'Graffiti', rect: [560, 220, 780, 400],
      look: () => say(G.jack, '"Keine Zukunft": no future. In East Berlin that counts as optimism.') },
    { name: 'Stage', rect: [1100, 480, 820, 380], at: [1200, 950], face: 1,
      look: () => say(G.jack, 'A stage made of pallets, two amplifiers built from radio parts, and a drum kit with nobody behind it. The sign says DRUMMER WANTED. OURS IS IN PRISON.') },
    { name: 'Picture Frame', rect: [150, 220, 140, 170],
      look: () => say(G.jack, 'A portrait of the General Secretary, hung facing the wall. It\'s the most dangerous thing in the room, and they know it.') },
    { name: 'Nina', actor: 'nina', at: [1150, 950], face: 1,
      look: () => say(G.jack, 'Nina: pink mohawk, leather jacket held together with safety pins, fishnet tights, and the voice of a very angry kettle.'),
      talk: () => talkNina() },
    { name: 'Kalle', actor: 'kalle', at: [540, 950], face: -1,
      look: () => say(G.jack, flag('sang') ? 'Kalle the barman, writing in his notebook so fast the pencil is smoking.' : 'Kalle the barman. He has a hearing aid with an aerial on it and a notebook he calls his "beer orders". Nobody orders that much beer.'),
      async talk() {
        const k = actor('kalle');
        if (flag('sang')) return say(k, 'God Save the Queen. With a goose. Very interesting. I mean, very nice. What was your name again? For the... beer orders.');
        await say(k, 'Beer? We have one kind of beer. It is called beer.');
        await say(G.jack, 'Just a water, thanks.');
        await say(k, 'Water. The Englishman drinks water. I will make a note. For the beer orders.');
      } },
    { name: 'Steps Up', rect: [0, 250, 80, 610], at: [120, 950], exitLabel: 'Up to the courtyard',
      exit: () => gotoScene('hof', 840, 920, 1, { sfx: 'door' }) },
  ],
};

async function talkNina() {
  const n = actor('nina');
  if (flag('sang')) return say(n, 'Go on, Englishman. Take Papa\'s pass, fix Uwe\'s car, and don\'t get caught. And come back and play the drums. The goose can sing.');
  if (!flag('needBelt')) {
    await say(n, 'What do you want, London? A photograph? We only pose for the Stasi, and they never send us copies.');
    return;
  }
  G.busy = true;
  await say(G.jack, 'I need your tights.');
  await say(n, 'Excuse me?');
  await say(G.jack, 'For a Trabant. It\'s a long story.');
  await say(n, 'It is always a long story with a Trabant. OK, London. Our drummer is in prison for his haircut, and I have no voice left. You get up there and sing something the Stasi will hate, and the tights are yours.');
  const c = await choose([
    { text: '(Sing "God Save the Queen". The punk one.)', value: 'queen' },
    { text: '(Sing "Ninety-Nine Red Balloons".)', value: 'balloons' },
    { text: '(Sing the East German national anthem, but faster.)', value: 'anthem' },
  ]);
  await walkTo(1400, 880);
  G.jack.facing = -1; G.jack.arm = 'point';
  if (c === 'queen') {
    await say(G.jack, 'God save the Queen! The fascist regime!');
    Sound.sfx('applause');
    await say(n, 'Ha! The British anthem AND an insult to the State! Kalle is writing so fast his pencil is on fire!');
  }
  if (c === 'balloons') {
    await say(G.jack, 'Ninety-nine red balloons, go by...');
    Sound.sfx('applause');
    await say(n, 'A West German hit! In our cellar! They will close us for a month! Beautiful!');
  }
  if (c === 'anthem') {
    await say(G.jack, 'Risen from the ruins, and facing the future!');
    Sound.sfx('applause');
    await say(n, 'The national anthem, as a punk song! That is not even illegal, they just have no idea what to do! Look at Kalle, his face!');
  }
  Sound.sfx('honk');
  flag('sang', true);
  G.jack.arm = 'rest';
  await walkTo(1150, 950);
  await say(n, 'OK, London. You earned them. Take the tights. I have forty pairs. My mother works in a tights factory. It is the only thing the Five Year Plan ever got right.');
  addItem('fishnets');
  await say(n, 'And one more thing, since you are so interested in the Stasi. My Papa, Horst, is a night cleaner at Normannenstraße. He has flu. Take his coat and his pass.');
  addItem('pass');
  await say(n, 'Papa says the only person in the Stasi that nobody watches is the cleaner.');
  setObjective('Fix the Trabant with the tights');
  save();
  G.busy = false;
}

// ===========================================================================
// THE ARCHIVE — Normannenstraße, the night shift
// ===========================================================================
SCENES.archive = {
  title: 'Ministry for State Security · The Archive · 23:10',
  music: 'archive', ambience: ['hum', 'clock'], floor: 'Wood',
  paint: paintArchive,
  walk: [80, 1045, 1880, 1045, 1880, 860, 80, 860],
  depth: [860, 1.58, 1045, 1.9],
  light: LIGHT.archive,
  portraitBg: '#6a6a5a',
  actors() {
    if (flag('kesslerAway') && !flag('alarm')) return [];
    return [makeFigure('kessler', 520, 900, { id: 'kessler', facing: 1, arm: 'knit', seed: 74, depthScale: true })];
  },
  props: [
    { y: 700, when: () => !flag('gotKey'), draw: ctx => { ctx.save(); ctx.translate(390, 520); ctx.scale(0.6, 0.6); ITEMS.key7.icon(ctx); ctx.restore(); } },
  ],
  async enter() {
    if (flag('archiveIntro')) return;
    flag('archiveIntro', true);
    await archiveArrival();
  },
  hotspots: [
    { name: 'Filing Cabinets', rect: [900, 120, 560, 720], at: [1180, 960],
      look: () => say(G.jack, 'Filing cabinets, all the way into the dark. A hundred kilometres of files, they say: who you met, what you said, what you ate, and whether you enjoyed it.'),
      use: () => say(G.jack, 'There are more files here than there are people in Birmingham. I need to know where to look first.') },
    { name: 'Slogan', rect: [160, 180, 560, 60],
      look: () => say(G.jack, '"Wachsamkeit ist unsere Waffe." Vigilance is our weapon. Frau Kessler\'s weapon is a pair of knitting needles.') },
    { name: 'Portrait', rect: [1260, 150, 140, 180],
      look: () => say(G.jack, 'The Minister, watching the watchers. His eyes follow you round the room. They\'ve probably been fitted with microphones too.') },
    { name: 'Card Index', rect: [660, 420, 220, 420], at: [770, 960], face: -1, photo: 'kartei',
      look: () => say(G.jack, 'The Kartei: an index card for every file in the building. Tiny drawers, hundreds of them, each one labelled in Frau Kessler\'s perfect handwriting.'),
      async use() {
        if (!flag('kesslerAway')) return say(actor('kessler'), 'Hands off my Kartei, Horst! Cleaners clean. They do not read.');
        return searchIndex();
      } },
    { name: 'Key Board', rect: [220, 420, 200, 140], at: [360, 960], face: -1, when: () => !flag('gotKey'),
      look: () => say(G.jack, 'Keys on hooks, every one with a cardboard tag. One says SCHRANK 7.'),
      async take() {
        if (!flag('kesslerAway')) return say(actor('kessler'), 'Horst! Keys are not for cleaners! Cleaners have mops!');
        flag('gotKey', true); addItem('key7');
        Sound.sfx('pickup');
        await say(G.jack, 'Schrank 7. Only with permission. Permission granted.');
        save();
      } },
    { name: 'Cabinet 7', rect: [1520, 380, 220, 460], at: [1500, 960], face: 1,
      look: () => say(G.jack, flag('gotFile') ? 'Cabinet 7, open, one folder lighter.' : 'A steel cabinet with a big brass padlock. Number 7.'),
      async use() {
        if (!has('key7')) return say(G.jack, 'Locked, with a padlock the size of a fist.');
        return openCabinet();
      },
      async item(id) {
        if (id === 'key7') return openCabinet();
        return false;
      } },
    { name: 'Kitchen Door', rect: [1800, 400, 110, 440], at: [1780, 960],
      look: () => say(G.jack, flag('kesslerAway') ? 'The kitchen. I can hear a kettle, and Frau Kessler singing to it.' : 'The staff kitchen, according to the sign. The only room in the building without a filing cabinet.'),
      use: () => say(G.jack, flag('kesslerAway') ? 'Frau Kessler is in there with her coffee. I\'m not disturbing that.' : 'That\'s Frau Kessler\'s kitchen. I\'m a cleaner, not a suicide.') },
    { name: 'Frau Kessler', actor: 'kessler', at: [700, 960], face: -1,
      look: () => say(G.jack, 'Frau Kessler, head archivist of the night shift: cardigan, spectacles, and a scarf she has been knitting since the building went up. She sees everything.'),
      async talk() {
        const k = actor('kessler');
        await say(k, 'Mop, Horst. The corridor will not clean itself. Although in this building, I would not be surprised if it reported itself.');
      },
      async item(id) {
        if (id === 'coffee') return coffeeBreak();
        if (id === 'pass') return say(actor('kessler'), 'Yes, yes, Horst Brandt, I have seen it. Twenty-two years I have seen it.');
        return false;
      } },
  ],
};

async function archiveArrival() {
  G.busy = true;
  const k = actor('kessler'), j = G.jack;
  await wait(0.5);
  await say(k, 'Horst? You are late, Horst. Horst, you are taller.');
  await say(j, 'Horst has flu, Frau Kessler. I\'m his nephew. Jochen. From Leipzig.');
  await say(k, 'Leipzig! Then you know my sister Gisela.');
  const c = await choose([
    { text: '"Of course! Lovely Gisela."', value: 'yes' },
    { text: '"Leipzig is a very big city."', value: 'big' },
    { text: '"Gisela... with the goats?"', value: 'goats' },
  ]);
  if (c === 'yes') { await say(j, 'Of course! Lovely Gisela.'); await say(k, 'Lovely? Gisela? Hmm. You must be very polite in Leipzig.'); }
  if (c === 'big') { await say(j, 'Leipzig is a very big city.'); await say(k, 'Not so big. Everybody in Leipzig knows Gisela. Gisela makes sure of it.'); }
  if (c === 'goats') { await say(j, 'Gisela... with the goats?'); await say(k, 'Ha! Yes! The goats! So you do know her. Poor boy.'); }
  await say(k, 'Now: the mop, the bucket, the corridor. And do not touch my Kartei. Nobody touches my Kartei.');
  setObjective('Find Control\'s file');
  save();
  G.busy = false;
}

async function coffeeBreak() {
  const k = actor('kessler');
  G.busy = true;
  removeItem('coffee');
  await say(G.jack, 'Frau Kessler. A present from my uncle. For the night shift.');
  await say(k, 'Is that... Western coffee? Real coffee? Not Kaffee-Mix, with the peas in it?');
  await say(k, 'I have not smelled real coffee since 1961. Horst, you are a good man. Your nephew is a good man. Everybody from Leipzig is a good man.');
  await say(k, 'I make one pot. Just one. It takes twenty minutes. You mop. Mop!');
  await walkTo(1900, 960, k, 0.8);
  Sound.sfx('door');
  removeActor('kessler');
  flag('kesslerAway', true);
  await think('Twenty minutes, and a building full of secrets. Start with the card index.');
  save();
  G.busy = false;
}

async function searchIndex() {
  G.busy = true;
  for (;;) {
    const c = await choose([
      { text: 'H, for Harrow.', value: 'h' },
      { text: 'G, for goose.', value: 'g' },
      { text: 'L, for London.', value: 'l' },
      !flag('readCard') ? { text: 'T, for... tea?', value: 't' } : { text: 'Close the drawer.', value: 'done' },
    ].filter(Boolean));
    if (c === 'done') break;
    Sound.sfx('drawer');
    if (c === 'h') await say(G.jack, '"HARROW, J. British agent. Weakness: takes his coffee black. Weakness: accompanied by a goose." Two weaknesses. They were thorough.');
    if (c === 'g') await say(G.jack, '"GANS, WEISS. A white goose, answers to Colonel. Politically unreliable. Has bitten two officers of the Border Troops." Good girl.');
    if (c === 'l') await say(G.jack, '"LONDON, British contact in the Vasko affair: see TEEKANNE." Teekanne. The Teapot.');
    if (c === 't') {
      await say(G.jack, '"TEEKANNE: the Teapot. British contact, Vasko affair. Stirs his tea very loudly. Operative file in Schrank 7."');
      await think('Even the Stasi noticed the tea.');
      flag('readCard', true);
      setObjective('Open Cabinet 7');
      save();
      break;
    }
  }
  G.busy = false;
}

async function openCabinet() {
  if (flag('gotFile')) return say(G.jack, 'I have what I came for. Time to leave, before Frau Kessler finishes her coffee.');
  if (!flag('readCard')) return think('Cabinet 7 holds a thousand files. I need a name first.');
  G.busy = true;
  await walkTo(1500, 960);
  G.jack.facing = 1; G.jack.arm = 'reach';
  Sound.sfx('unlock'); await wait(0.5); Sound.sfx('drawer'); await wait(0.4);
  G.jack.arm = 'rest';
  removeItem('key7');
  addItem('file');
  flag('gotFile', true);
  await say(G.jack, 'TEEKANNE. Photographs of Control with Vasko. Bank transfers from Zurich. And Control\'s own signature, on every page. That\'s him.');
  await wait(0.4);
  Sound.sfx('alarm');
  flag('alarm', true);
  await think('The Stasi put an alarm on their own filing cabinet. Of course they did.');
  const k = makeFigure('kessler', 1980, 960, { id: 'kessler', facing: -1, arm: 'point', seed: 74, depthScale: true });
  k.scale = depthScale(960); G.actors.push(k);
  await walkTo(1800, 960, k, 1.2);
  await say(k, 'Horst! That is not the mop! That is Schrank 7! You are not Horst, you are not the nephew, you are not even from Leipzig!');
  await say(G.jack, 'I am sorry about the coffee, Frau Kessler. Enjoy it anyway.');
  await say(k, 'Wache! Guards! Guards! Also, thank you for the coffee! Guards!');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  await TextScreen.play(ESCAPE_PAGES, 'tension');
  G.busy = false;
  TunnelCrawl.start();
}
const ESCAPE_PAGES = [
  { kicker: 'NORMANNENSTRASSE  ·  23:40', amb: ['alarmBell'], text: 'Down the back stairs with a mop in one hand and a Stasi file in the other. Out through the bins. Into a Trabant with its engine running, a goose in the back and Ilse at the wheel.' },
  { kicker: 'BERNAUER STRASSE  ·  01:10', amb: ['wind'], text: 'A bakery on the wrong side of the Wall, with a tunnel under the floor that has not been used since 1964. Ilse knows it. Ilse knows everything. "Crawl when the dog walks," she says. "Freeze when the dog listens."' },
];

// ===========================================================================
// WEST BERLIN — Kreuzberg, dawn
// ===========================================================================
SCENES.west = {
  title: 'Kreuzberg · West Berlin · 06:10',
  music: 'dawn', ambience: ['wind', 'tram'], floor: 'Stone',
  paint: paintKreuzberg,
  walk: [60, 1045, 1880, 1045, 1880, 850, 60, 850],
  depth: [850, 1.55, 1045, 1.9],
  light: LIGHT.west,
  portraitBg: '#8a6a7a',
  actors() {
    return [
      makeFigure('ilse', 640, 920, { id: 'ilse', facing: 1, arm: 'rest', seed: 3, depthScale: true }),
      makeFigure('franz', 1060, 910, { id: 'franz', facing: -1, arm: 'rest', seed: 2, depthScale: true, look: LOOKS.franzCoat }),
    ];
  },
  props: [{ y: 915, draw: ctx => paintSaloon(ctx, 1380, 915, 1.2) }],
  async enter() {
    if (flag('westIntro')) return;
    flag('westIntro', true);
    await westArrival();
  },
  hotspots: [
    { name: 'The Wall', rect: [0, 380, 1560, 440],
      look: () => say(G.jack, 'The Wall from the western side: every inch painted, sprayed and signed. From the East it\'s grey. From the West it\'s the biggest noticeboard in the world.') },
    { name: 'Imbiss', rect: [80, 600, 320, 220],
      look: () => say(G.jack, 'A currywurst stand, closed. Currywurst: a sausage, cut up, drowned in ketchup and curry powder. Berlin\'s great gift to civilisation.') },
    { name: 'Mercedes', rect: [1090, 760, 540, 160],
      look: () => say(G.jack, 'A black Mercedes with diplomatic plates. Franz always did like a nice car. On a barman\'s wages.') },
    { name: 'Ilse', actor: 'ilse', at: [460, 950], face: 1,
      look: () => say(G.jack, 'Ilse, covered in sand from head to foot and still somehow elegant.'),
      talk: () => say(actor('ilse'), 'Show him the file, Jack. And keep one hand on your wallet. Last time I saw Franz, he was pointing a gun at me.') },
    { name: 'Franz', actor: 'franz', at: [900, 950], face: 1,
      look: () => say(G.jack, 'Franz: barman, chef, London\'s man in Vienna, and now apparently chauffeur. He looks as if he hasn\'t slept either.'),
      talk: () => say(actor('franz'), 'You have something for me, Herr Harrow? London sent me to fetch you home. Show me what you have, and we will see what London thinks of it.'),
      async item(id) {
        if (id !== 'file') return false;
        return theVerdict();
      } },
  ],
};

async function westArrival() {
  G.busy = true;
  const f = actor('franz'), i = actor('ilse'), j = G.jack;
  await wait(0.6);
  await say(f, 'Guten Morgen, Herr Harrow. Fräulein. And the Colonel. You are all very sandy.');
  await say(j, 'Franz? How did you know where we\'d come up?');
  await say(f, 'There is only one tunnel under Bernauer Strasse that still works, and only one lady in Berlin who knows where it is.');
  await say(i, 'Hello, Franz. You look older.');
  await say(f, 'I am older, Fräulein. You look armed.');
  await say(i, 'I am.');
  setObjective('Show Franz the file');
  save();
  G.busy = false;
}

async function theVerdict() {
  G.busy = true;
  const f = actor('franz'), i = actor('ilse'), j = G.jack;
  removeItem('file');
  await say(j, 'Operative file TEEKANNE. From the Stasi archive. Control and Vasko, together, with signatures. It proves he sold Nightglass. It proves it wasn\'t me.');
  Sound.sfx('paper');
  f.arm = 'hold';
  await wait(1.2);
  await say(f, 'Hm. Hm. Hmmm.');
  await wait(0.8);
  await say(f, 'It is a fake, Herr Harrow.');
  await say(j, 'What?');
  await say(f, 'Look at this photograph. Control and Vasko in Moscow, March 1985. In March 1985 Control was in hospital having his appendix out. I sent him grapes.');
  await say(f, 'And the paper. Western paper, from a London stationer. The Stasi never had paper this good. Somebody in London typed this file, and put it in Cabinet 7, where a clever man would find it.');
  await say(i, 'Control wanted you to steal it.');
  await say(f, 'Of course. A traitor, running into the West with forged Stasi papers. It is very convincing, Herr Harrow. For the prosecution.');
  await wait(0.6);
  Sound.sfx('paper'); Sound.sfx('honk');
  await say(f, 'Also, your goose is eating it.');
  await wait(0.6);
  await say(i, 'Well. At least somebody enjoyed it.');
  await wait(1);
  G.fade = 1; G.fadeTo = 1;
  Sound.stopMusic(); Sound.setAmbience(['wind']);
  await wait(1.5);
  store.del(CHAPTER.saveKey);
  G.busy = false;
  await Ending.cliffhanger();
}

// ---------- the goose ---------------------------------------------------------------
const Goose = {
  trail: [],
  reset() { this.trail = []; },
  visible() {
    if (G.mode !== 'play') return false;
    const sc = G.sceneId;
    if (sc === 'hof') return flag('hofIntro');
    return ['club', 'west'].includes(sc);
  },
  update() {
    const j = G.jack;
    if (!j) return;
    const last = this.trail[this.trail.length - 1];
    if (!last || Math.hypot(last[0] - j.x, last[1] - j.y) > 10) this.trail.push([j.x, j.y]);
    if (this.trail.length > 120) this.trail.shift();
  },
  draw(ctx, t) {
    const j = G.jack, idx = this.trail.length - 10;
    const [x, y] = idx >= 0 ? this.trail[idx] : [j.x - j.facing * 80, j.y + 6];
    // in the club, the Colonel pogos
    const hop = G.sceneId === 'club' ? Math.max(0, Math.sin(t * 8)) * (flag('sang') ? 30 : 14) : 0;
    drawGoose(ctx, x, y + 8 - hop, depthScale(y) * 0.42, t, j.x > x ? 1 : -1);
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
  if (sc === 'hof') {
    if (!flag('needBelt')) return think('Uwe has his head in the Trabant. Ask him what\'s wrong.');
    if (!has('fishnets') && !flag('trabiFixed')) return think('A stocking would do for a fan belt. Ilse won\'t part with hers. The singer in the club downstairs, perhaps.');
    if (!flag('trabiFixed')) return think('Give the tights to Uwe, or put them on the Trabant myself.');
    if (!has('pass')) return think('I need a way into the archive. Nina said something about her father.');
    return think('The Trabant is running. Get in.');
  }
  if (sc === 'club') {
    if (!flag('needBelt')) return think('Nothing to do here yet. Uwe needs help upstairs.');
    if (!flag('sang')) return think('Nina\'s fishnets. She\'ll want something for them. Ask her.');
    return think('Back up the steps to the Trabant.');
  }
  if (sc === 'archive') {
    if (!flag('kesslerAway')) return think('Frau Kessler never takes her eyes off the Kartei. Something to take her mind off it: Uwe\'s coffee.');
    if (!flag('readCard')) return think('The card index will tell me which file, and where.');
    if (!flag('gotKey')) return think('Cabinet 7 is locked. The keys are on the board by the desk.');
    return think('Cabinet 7. Now.');
  }
  if (sc === 'west') return think('Show Franz the file.');
}
