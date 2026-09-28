// ---------------------------------------------------------------------------
// Chapter Ten: Burn Notice — items, scenes, hotspots, dialogue, puzzles.
// London in the rain. Jack is wanted by his own side. A chip shop that is a
// safe house, a fish delivery to Headquarters, a kipper in Control's air vent,
// a chase on the Underground, and tea at the Wellington with the Minister.
// ---------------------------------------------------------------------------

const ITEMS = {
  helmet: {
    name: 'A Police Helmet',
    desc: 'PC Dobbs\'s helmet, still warm, with a chip stuck to the badge. I\'ve stolen a lot of things for my country. This is the first one that\'s a hat.',
    icon(c) {
      c.fillStyle = '#14182a'; c.beginPath(); c.moveTo(-26, 22); c.bezierCurveTo(-28, -18, -12, -34, 0, -34); c.bezierCurveTo(12, -34, 28, -18, 26, 22); c.fill();
      ellipse(c, 0, 22, 34, 7, '#22283e'); ellipse(c, 0, -36, 5, 4, '#c8ccd0');
      c.fillStyle = '#d8dce0'; c.beginPath(); for (let k = 0; k < 16; k++) { const r = k % 2 ? 4 : 9, a = -Math.PI / 2 + k / 16 * Math.PI * 2; c.lineTo(Math.cos(a) * r, -6 + Math.sin(a) * r); } c.fill();
    },
  },
  memo: {
    name: 'A Secret Memo',
    desc: 'HEADQUARTERS · SAFE HOUSES · SECRET. "From 1 March the recognition phrase at Lambeth is: Haddock, no batter, and a side of regret." There\'s a thumbprint of batter over the word SECRET.',
    icon(c) {
      c.rotate(0.1); c.fillStyle = '#f4f0e0'; c.fillRect(-24, -30, 48, 60); c.fillStyle = '#c81a1a'; c.fillRect(-18, -24, 36, 8);
      c.fillStyle = '#3a3a3a'; for (let k = 0; k < 5; k++) c.fillRect(-18, -8 + k * 7, 36 - (k % 2) * 10, 2);
      ellipse(c, 8, 16, 9, 6, 'rgba(210,150,50,0.6)'); c.fillStyle = '#6a6a6a'; c.fillRect(-2, -34, 4, 12);
    },
  },
  note: {
    name: 'Delivery Note',
    desc: 'THE PLAICE TO BE · DELIVERY NOTE. Headquarters canteen: forty kippers (for the Director), one stone of cod. Signed, S. Pike. There\'s a chip stuck to it.',
    icon(c) {
      c.rotate(-0.08); c.fillStyle = '#f0e8d0'; c.fillRect(-28, -22, 56, 44); c.fillStyle = '#2a4a8a'; c.fillRect(-28, -22, 56, 10);
      c.fillStyle = '#3a3a3a'; for (let k = 0; k < 3; k++) c.fillRect(-22, -4 + k * 8, 40, 2); c.fillStyle = '#e8c050'; c.fillRect(10, 12, 16, 4);
    },
  },
  crate: {
    name: 'Crate of Kippers',
    desc: 'Forty kippers for the Director\'s breakfast, and a stone of cod, in a wooden crate marked THE PLAICE TO BE. The kippers are looking at me.',
    icon(c) {
      c.fillStyle = '#b8905a'; c.fillRect(-34, -14, 68, 34); c.fillStyle = '#8a6a3a'; c.fillRect(-34, -14, 68, 4); c.fillRect(-34, 4, 68, 3);
      for (let k = 0; k < 4; k++) { c.save(); c.translate(-22 + k * 15, -18); c.rotate(-0.6); ellipse(c, 0, 0, 12, 5, '#a8702a'); c.restore(); }
    },
  },
  key: {
    name: 'Miss Penrose\'s Spare Key',
    desc: 'The spare key to Control\'s desk, on a ring with a little brass teapot. "He locks himself out twice a week," says Miss Penrose. "It\'s the only time he says please."',
    icon(c) {
      c.strokeStyle = '#c9a13b'; c.lineWidth = 4; c.beginPath(); c.arc(-14, 0, 10, 0, 7); c.stroke();
      c.fillStyle = '#c9a13b'; c.fillRect(-4, -3, 32, 6); c.fillRect(20, 3, 4, 8); c.fillRect(26, 3, 3, 6);
      ellipse(c, -14, 18, 8, 7, '#c9a13b');
    },
  },
  book: {
    name: 'A Paying-in Book',
    desc: 'A paying-in book for numbered account 44-771, in Zürich. Every stub filled in in Control\'s small, tidy hand. Eighty million francs, a little at a time.',
    icon(c) {
      c.rotate(0.1); c.fillStyle = '#2a4a3a'; c.fillRect(-30, -20, 60, 40); c.fillStyle = '#f0ece0'; c.fillRect(-26, -16, 52, 32);
      c.fillStyle = '#2a4a3a'; c.fillRect(-26, -16, 12, 32); c.fillStyle = '#3a3a3a'; for (let k = 0; k < 3; k++) c.fillRect(-10, -8 + k * 9, 30, 2);
    },
  },
  pad: {
    name: 'A Signature Pad',
    desc: 'A notepad from Control\'s wastepaper basket, covered in my signature, forty times. The first ones are terrible. By the bottom of the page, even I\'d sign for them.',
    icon(c) {
      c.rotate(-0.12); c.fillStyle = '#f4f0e0'; c.fillRect(-26, -32, 52, 64); c.fillStyle = '#c8c0a8'; c.fillRect(-26, -32, 52, 6);
      c.strokeStyle = '#1a2a6a'; c.lineWidth = 1.5; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(-20, -18 + k * 9); for (let j = 0; j < 8; j++) c.lineTo(-20 + j * 5, -18 + k * 9 + Math.sin(j * 1.7 + k) * 2.5); c.stroke(); }
    },
  },
  tie: {
    name: 'A Guards Tie',
    desc: 'Control\'s spare tie, in the stripes of the Coldstream Guards. Control was never in the Coldstream Guards. Control was in the Pay Corps.',
    icon(c) {
      c.rotate(0.3); for (let k = 0; k < 7; k++) { c.fillStyle = k % 2 ? '#9e1f28' : '#1a2a5a'; c.fillRect(-7, -36 + k * 9, 14, 9); }
      poly(c, [-7, 27, 7, 27, 0, 36], '#1a2a5a'); poly(c, [-9, -40, 9, -40, 6, -34, -6, -34], '#1a2a5a');
    },
  },
  bill: {
    name: 'The Bill',
    desc: 'The Wellington\'s bill: tea for three, scones, cakes, a pot of Lapsang. Eleven pounds forty. There\'s a space at the bottom for a signature.',
    icon(c) {
      c.rotate(0.06); c.fillStyle = '#fbf8f0'; c.fillRect(-20, -30, 40, 60); c.fillStyle = '#c9a13b'; c.fillRect(-20, -30, 40, 6);
      c.fillStyle = '#3a3a3a'; for (let k = 0; k < 4; k++) c.fillRect(-14, -16 + k * 8, 28 - (k % 2) * 8, 2); c.fillRect(-14, 20, 28, 1);
    },
  },
};

async function lookItemStory(id) {
  if (id === 'pad') {
    G.photo = { id: 'sigpad', t: 0, label: ITEMS.pad.name };
    try { return await say(G.jack, ITEMS[id].desc); } finally { G.photo = null; }
  }
  await say(G.jack, ITEMS[id].desc);
}

// In London, Control wears a suit and is heard in person.
FACES.control = FACES.controlSuit;
Object.assign(COLORS, { stan: '#ffd08a', dobbs: '#9ec3e6', grimes: '#b8c8f0', penrose: '#b8f0c8', minister: '#f0b8a0', fothergill: '#e3d6f5', lumb: '#d8c6a0' });

const LIGHT = {
  chippy: { ambient: 'rgba(30,40,20,0.12)', key: 'rgba(255,240,200,0.3)', keyX: 900, top: 'rgba(240,250,230,0.1)' },
  yard: { ambient: 'rgba(30,40,56,0.24)', key: 'rgba(210,220,235,0.25)', keyX: 1640 },
  outer: { ambient: 'rgba(30,40,20,0.14)', key: 'rgba(240,250,230,0.28)', keyX: 900, top: 'rgba(240,250,230,0.1)' },
  office: { ambient: 'rgba(40,20,8,0.2)', key: 'rgba(255,230,170,0.32)', keyX: 1530 },
  tearoom: { ambient: 'rgba(40,30,10,0.08)', key: 'rgba(255,240,200,0.32)', keyX: 1100, top: 'rgba(255,240,210,0.12)' },
};

const SCENES = {};

// ===========================================================================
// THE CHIP SHOP — The Plaice to Be, Lambeth
// ===========================================================================
SCENES.chippy = {
  title: 'The Plaice to Be · Lambeth · 21:40',
  music: 'chippy', ambience: ['rain', 'fryer'], floor: 'Marble',
  paint: paintChippy,
  walk: [60, 1045, 1880, 1045, 1880, 872, 60, 872],
  depth: [872, 1.58, 1045, 1.9],
  light: LIGHT.chippy,
  portraitBg: '#2e6a4e',
  actors() {
    const list = [makeFigure('stan', 790, 776, { id: 'stan', facing: -1, arm: 'rest', seed: 101, scale: 1.62, fixedScale: true })];
    if (!flag('dobbsGone')) list.push(makeFigure('dobbs', 1300, 905, { id: 'dobbs', facing: 1, arm: 'hold', seed: 102, depthScale: true }));
    return list;
  },
  props: [
    { y: 860, draw: ctx => paintChippyCounter(ctx) },
    { y: 861, when: () => !flag('helmetTaken'), draw: ctx => paintHelmetOnCounter(ctx) },
  ],
  back(ctx, t) {
    drawChippyTV(ctx, t, flag('snooker') ? 'snooker' : 'news');
    // steam off the fryers
    ctx.save(); ctx.globalAlpha = 0.18; for (let k = 0; k < 6; k++) { const y = 470 - ((t * 40 + k * 30) % 90), x = 1170 + (k % 3) * 120 + Math.sin(t + k) * 12; ellipse(ctx, x, y, 30, 18, '#f4f6f8'); } ctx.restore();
    // the goose, at the door, with her beak to the glass
    if (!flag('dobbsGone')) drawGooseAtGlass(ctx, t, flag('gooseHelmet'));
  },
  async enter() {
    if (flag('chippyIntro')) return;
    await chippyOpening();
  },
  hotspots: [
    { name: 'Window', rect: [20, 170, 400, 600],
      look: () => say(G.jack, 'Rain, a street lamp, and the Kennington Road. Somewhere out there, most of the Metropolitan Police.') },
    { name: 'Menu Board', rect: [620, 100, 820, 250],
      look: () => say(G.jack, 'Cod, haddock, plaice, skate, saveloy. No regret. Regret must be off.') },
    { name: 'The Door', rect: [430, 290, 160, 550], at: [520, 930], face: -1,
      look: () => say(G.jack, flag('dobbsGone') ? 'The door, the rain, and somewhere down the Kennington Road, a goose in a police helmet.' : 'The door, and the rain, and the goose. The goose wants chips. The goose always wants chips.'),
      use: () => say(G.jack, 'Out there it\'s raining, and my face is on every newspaper in London. In here there are chips.'),
      item: id => id === 'helmet' && !flag('dobbsGone') ? helmetOnGoose() : false },
    { name: 'Private Door', rect: [1760, 380, 130, 460], at: [1780, 950], face: 1, exitLabel: 'Upstairs',
      async exit() {
        if (!flag('password')) return say(actor('stan'), 'Private, that is. Staff only.');
        return upstairs();
      } },
    { name: 'Hot Cabinet', rect: [630, 478, 440, 116], at: [860, 930], face: 1, photo: 'chips',
      look: () => say(G.jack, 'Cod in batter the size of a canoe, and a hill of chips. I haven\'t eaten since Zürich.'),
      async take() {
        await say(actor('stan'), 'Paying for that, are we?');
        await say(G.jack, 'Do you take Swiss francs?');
        await say(actor('stan'), 'Do I look Swiss?');
      } },
    { name: 'The Television', rect: [1480, 130, 260, 200], at: [1560, 940], face: 1,
      look: () => flag('snooker')
        ? say(G.jack, 'The snooker. Nobody in England has ever been arrested during the snooker.')
        : say(G.jack, 'That\'s me, in the photograph from my pass. WANTED: JACK HARROW. TRAITOR. WITH GOOSE. They\'ve got the goose\'s good side.'),
      use: () => changeChannel() },
    { name: 'Pickled Eggs', rect: [850, 556, 90, 90], at: [880, 930],
      look: () => say(G.jack, 'Pickled eggs, floating in a jar like evidence. Nobody has bought one since 1974. They\'re the same eggs.') },
    { name: 'Order Spike', rect: [680, 560, 70, 84], at: [720, 930], face: 1, when: () => !has('memo') && !flag('password'),
      look: () => say(G.jack, 'A spike of chip orders. And in the middle of them, spiked straight through the word SECRET, a memo from Headquarters.'),
      async take() {
        addItem('memo'); Sound.sfx('paper');
        await say(G.jack, 'Stan has been using the most secret piece of paper south of the river as a chip order.');
        save();
      } },
    { name: 'Police Helmet', rect: [1180, 566, 90, 84], at: [1180, 930], face: 1, when: () => !flag('helmetTaken'),
      look: () => say(G.jack, 'PC Dobbs\'s helmet, upside down on the counter beside his chips, like a collection plate.'),
      async take() {
        if (!flag('snooker')) return say(G.jack, 'Not while he keeps looking my way. He looks at me, then at the television, then at me.');
        flag('helmetTaken', true); addItem('helmet');
        Sound.sfx('pickup');
        await think('He didn\'t even blink. It\'s the final frame.');
        save();
      } },
    { name: 'The Goose', rect: [450, 440, 120, 180], at: [520, 930], face: -1, when: () => !flag('dobbsGone'),
      look: () => say(G.jack, 'The goose, out in the rain, with her beak pressed to the glass, glaring at PC Dobbs\'s chips.'),
      talk: async () => { Sound.sfx('honk'); await say(G.jack, 'Not now, Colonel. Wait there. Look innocent.'); },
      item: id => id === 'helmet' ? helmetOnGoose() : false },
    { name: 'PC Dobbs', actor: 'dobbs', at: [1160, 930], face: 1, when: () => !flag('dobbsGone'),
      look: () => say(G.jack, 'PC Dobbs of Kennington Road: six foot two of Metropolitan Police, eating chips out of the Evening Post. My face is on the front of the Evening Post.'),
      talk: () => talkDobbs() },
    { name: 'Stan', actor: 'stan', at: [800, 920], face: 1,
      look: () => say(G.jack, 'Stan Pike: forty years behind this counter, thirty of them for the Service. Stan never asks questions. Stan never answers them, either.'),
      talk: () => talkStan() },
  ],
};

async function chippyOpening() {
  flag('chippyIntro', true);
  G.busy = true;
  const d = actor('dobbs'), s = actor('stan');
  await wait(0.6);
  await say(d, 'Here, Stan. Turn it up. It\'s that traitor again.');
  await say(s, 'Can\'t reach, can I? Got my hands full of haddock.');
  await think('That\'s me on the television. And that\'s a policeman, three feet from it. I\'d rather they didn\'t meet.');
  setObjective('Keep PC Dobbs from looking at the television');
  save();
  G.busy = false;
}

async function talkDobbs() {
  const d = actor('dobbs');
  if (flag('snooker')) return say(d, 'Shh. He\'s on the pink.');
  G.busy = true;
  await say(d, 'Evening, sir. Shocking weather. Here, don\'t I know you from somewhere?');
  await say(G.jack, 'I\'ve got one of those faces.');
  await say(d, 'No, I\'m sure of it. It\'ll come to me.');
  await think('Not if I can help it.');
  G.busy = false;
}

async function changeChannel() {
  if (flag('snooker')) return say(G.jack, 'I\'ll leave it on the snooker. For everyone\'s sake.');
  G.busy = true;
  G.jack.arm = 'reach';
  Sound.sfx('click');
  await wait(0.3);
  flag('snooker', true);
  G.jack.arm = 'rest';
  const d = actor('dobbs');
  await say(d, 'Oi! I was watching that.');
  await say(G.jack, 'It\'s the final frame, Constable.');
  await say(d, 'Is it? Is it the final frame? Ooh.');
  Sound.sfx('snooker');
  await say(d, 'Look at that. Look at the angle on that.');
  await think('A whole nation, frozen in front of a green table. I could walk off with anything.');
  setObjective('Get rid of PC Dobbs');
  save();
  G.busy = false;
}

async function helmetOnGoose() {
  G.busy = true;
  removeItem('helmet');
  await walkTo(520, 930);
  G.jack.facing = -1; G.jack.arm = 'reach';
  Sound.sfx('door');
  await wait(0.4);
  flag('gooseHelmet', true);
  Sound.sfx('honk');
  G.jack.arm = 'rest';
  await say(G.jack, 'There. Now you look like the law.');
  await wait(0.5);
  const d = actor('dobbs');
  d.facing = -1;
  await say(d, 'Here. That goose has got my helmet.');
  await say(actor('stan'), 'That\'s the goose off the telly, that is.');
  await say(d, 'The traitor\'s goose! OI! You stop right there, in the name of the law!');
  Sound.sfx('honk');
  flag('dobbsGone', true);
  await walkTo(520, 910, d, 2.2);
  Sound.sfx('door');
  await walkTo(-120, 900, d, 2.2);
  removeActor('dobbs');
  await wait(0.4);
  await say(G.jack, 'He\'ll never catch her. She\'s done this before.');
  setObjective('Talk to Stan');
  save();
  G.busy = false;
}

async function talkStan() {
  const s = actor('stan');
  if (flag('password')) return say(s, 'Van leaves at seven sharp. Kip on the sofa upstairs. Mind the cat, he bites.');
  if (!flag('dobbsGone')) return say(s, 'Not now, sunshine. There\'s a copper in the shop, and your face is on the telly behind him.');
  G.busy = true;
  await say(s, 'Evening. What\'ll it be?');
  const c = await choose([
    { text: '"Cod and chips twice, hold the vinegar."', value: 'old' },
    has('memo') && { text: '"Haddock, no batter, and a side of regret."', value: 'new' },
    { text: '"Stan, it\'s me. Jack."', value: 'me' },
    { text: '"Just chips, please."', value: 'chips' },
  ].filter(Boolean));
  if (c === 'old') {
    await say(G.jack, 'Cod and chips twice, hold the vinegar.');
    await say(s, 'That\'s the old one, that is. They changed it in March. Memo went round.');
    if (!has('memo')) await think('A memo. Stan never throws anything away. He just puts it on a spike.');
  }
  if (c === 'me') {
    await say(G.jack, 'Stan, it\'s me. Jack.');
    await say(s, 'Never seen you before in my life, sir. What\'ll it be?');
    await think('Thirty years in the Service. Stan does everything by the book.');
  }
  if (c === 'chips') {
    await say(G.jack, 'Just chips, please.');
    await say(s, 'Forty-five pence.');
    await say(G.jack, 'Do you take Swiss francs?');
    await say(s, 'Do I look Swiss?');
  }
  if (c === 'new') await thePassword();
  G.busy = false;
}

async function thePassword() {
  const s = actor('stan');
  await say(G.jack, 'Haddock, no batter, and a side of regret.');
  await wait(0.4);
  await say(s, 'Right you are, sir. One haddock, no batter, side of regret.');
  removeItem('memo');
  flag('password', true);
  await say(s, 'Hello, Jack. You look terrible.');
  await say(G.jack, 'I\'ve been on a fishing boat for two days with a goose.');
  await say(s, 'Madame Novak was in on Tuesday. Left you this.');
  Sound.sfx('paper');
  await say(G.jack, '"Jack. Rupert is having tea with me and the Minister at the Wellington, four o\'clock on Thursday. The Minister is an old friend, and a fool, but an honest one. Bring him something he can hold. Love, Z. P.S. Feed the goose."');
  await think('Something the Minister can hold. The proof is in Control\'s office, on the fourth floor of Headquarters, where every guard has my photograph.');
  await say(s, 'Every guard\'s got your photograph, sunshine. No guard\'s got a clue. The canteen buys its fish off me: goods yard, half past seven, every morning. Kippers for the Director.');
  await say(s, 'Van leaves at seven. Here\'s my spare coat, and the delivery note. Don\'t lose the note. Grimes on the gate can\'t read, but he likes to hold it.');
  Sound.sfx('cloth');
  addItem('note');
  await say(G.jack, 'Stan, you\'re a genius.');
  await say(s, 'I know. Nobody ever asks.');
  setObjective('Upstairs, and wait for the morning');
  save();
}

async function upstairs() {
  G.busy = true;
  Sound.sfx('door');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  await TextScreen.play(MORNING_PAGES, 'tension');
  flag('fishCoat', true);
  G.busy = false;
  startPlay();
  G.sceneId = null; G.fade = 1;
  await gotoScene('yard', 860, 940, 1, { instant: true });
}
const MORNING_PAGES = [
  { kicker: 'UPSTAIRS  ·  23:00', amb: ['rainWindow'], text: 'A sofa, a gas fire, and a cat called Nelson who sleeps on my chest all night. At midnight the goose comes home without the helmet, and with a saveloy.' },
  { kicker: 'HEADQUARTERS  ·  07:30', amb: ['rain', 'traffic'], text: 'Stan drops me at the goods yard in a white coat and a flat cap, with forty kippers in the back of the van. "Straight in, straight up, straight out," he says. "If anyone asks, you\'re my nephew Kevin." Then he goes off for a fry-up.' },
];

// ===========================================================================
// THE GOODS YARD — Headquarters, on a wet morning
// ===========================================================================
SCENES.yard = {
  title: 'Headquarters · The Goods Yard · 07:30',
  music: 'whitehall', ambience: ['rain', 'traffic'], floor: 'Wet',
  paint: ctx => { paintYard(ctx); paintStanVan(ctx); },
  walk: [60, 1045, 1880, 1045, 1880, 880, 60, 880],
  depth: [872, 1.58, 1045, 1.9],
  light: LIGHT.yard,
  portraitBg: '#4a525c',
  rain: { n: 380, ground: 1100, color: 'rgba(190,210,230,0.3)' },
  actors() { return [makeFigure('grimes', 1180, 905, { id: 'grimes', facing: -1, arm: 'behind', seed: 103, depthScale: true })]; },
  back(ctx, t) { drawGooseInVan(ctx, t); },
  async enter() {
    if (flag('yardIntro')) return;
    flag('yardIntro', true);
    G.busy = true;
    await wait(0.5);
    await say(actor('grimes'), 'Morning! Deliveries this way. Everything through me. That\'s the rules.');
    await think('Sergeant Grimes, on the gate. He\'s been on that gate since the Suez Crisis. He saw me every day for eleven years.');
    setObjective('Deliver the fish to Headquarters');
    save();
    G.busy = false;
  },
  hotspots: [
    { name: 'Westminster', rect: [100, 120, 600, 440],
      look: () => say(G.jack, 'The Houses of Parliament, across the river in the rain. Somewhere in there is a Minister who is about to have a very difficult tea.') },
    { name: 'Headquarters', rect: [880, 0, 1040, 480],
      look: () => say(G.jack, 'Headquarters: twenty storeys of grey concrete with no name on the door, which is how everyone in London knows exactly what it is.') },
    { name: 'The Barrier', rect: [920, 690, 330, 40],
      look: () => say(G.jack, 'A barrier, a sentry box and Sergeant Grimes: the Service\'s first line of defence. Mostly against fish.') },
    { name: 'Stan\'s Van', rect: [300, 560, 480, 300], at: [820, 940], face: -1,
      look: () => say(G.jack, 'Stan\'s van: THE PLAICE TO BE, FRESH FISH DAILY. Forty kippers in the back, and a goose in the front.'),
      async take() {
        if (has('crate') || flag('fishIn')) return say(G.jack, 'Nothing else back there but the smell.');
        Sound.sfx('slidingDoor'); await wait(0.3);
        addItem('crate'); Sound.sfx('pickup');
        await say(G.jack, 'Forty kippers and a stone of cod. The kippers are looking at me.');
        save();
      },
      use() { return this.take(); } },
    { name: 'The Goose', rect: [140, 640, 160, 120], at: [320, 940], face: -1,
      look: () => say(G.jack, 'The goose, in the driver\'s seat, watching Sergeant Grimes the way she watches a sandwich.'),
      async talk() {
        Sound.sfx('honk');
        await say(actor('grimes'), 'Is that a goose in your van?');
        await say(G.jack, 'It\'s a kipper. A big one.');
        await say(actor('grimes'), 'Blimey.');
      } },
    { name: 'Goods Lift', rect: [1480, 520, 320, 320], at: [1640, 930], face: 1, exitLabel: 'Up to the fourth floor',
      async exit() {
        if (!flag('passedGate')) return say(actor('grimes'), 'Oi! Not so fast, sunshine. Deliveries through me. That\'s the rules.');
        return gotoScene('outer', 170, 950, 1, { sfx: 'slidingDoor' });
      } },
    { name: 'Sergeant Grimes', actor: 'grimes', at: [1040, 940], face: 1,
      look: () => say(G.jack, 'Sergeant Grimes: a waxed moustache, a chest full of medals, and a memory like a colander. Every morning for eleven years he said "Morning, Mr Harrow."'),
      talk: () => talkGrimes(),
      item: id => id === 'note' ? showNote() : id === 'crate' ? say(actor('grimes'), 'I don\'t want your fish, son. I want your note. That\'s the rules.') : false },
  ],
};

async function talkGrimes() {
  const g = actor('grimes');
  if (flag('passedGate')) return say(g, 'Goods lift, fourth floor, canteen\'s on the left. Don\'t touch anything, it\'s all secret.');
  if (!has('crate')) return say(g, 'Fish, is it? Where\'s the fish, then? You can\'t deliver fish without fish. That\'s the rules.');
  return say(g, 'Delivery note. No note, no entry. That\'s the rules.');
}

async function showNote() {
  const g = actor('grimes');
  if (!has('crate')) return say(g, 'A note for fish, and no fish? That\'s not the rules.');
  G.busy = true;
  await say(g, 'Let\'s have a look.');
  Sound.sfx('paper');
  await say(g, 'Forty... kippers... for the Director. One stone of cod, canteen. Signed, S. Pike. Where\'s Stan, then?');
  const c1 = await choose([
    { text: '"Stan\'s got his feet up. I\'m his nephew, Kevin."', value: 'kevin' },
    { text: '"Stan\'s at the dentist."', value: 'dentist' },
    { text: '"Stan\'s been arrested for treason."', value: 'treason' },
  ]);
  if (c1 === 'kevin') { await say(G.jack, 'Stan\'s got his feet up. I\'m his nephew, Kevin.'); await say(g, 'Kevin! He never said he had a nephew.'); }
  if (c1 === 'dentist') { await say(G.jack, 'Stan\'s at the dentist.'); await say(g, 'Stan? At the dentist? Stan\'s never been to a dentist in his life. You can tell.'); }
  if (c1 === 'treason') { await say(G.jack, 'Stan\'s been arrested for treason.'); await say(g, 'Stan! Treason! Ha! That\'s a good one.'); }
  await say(g, 'Here. Has anyone ever told you, you look just like that traitor? Off the telly?');
  const c2 = await choose([
    { text: '"I get it all the time. Terrible for business."', value: 'business' },
    { text: '"The traitor\'s much better looking."', value: 'looks' },
    { text: '"Do I? Which traitor?"', value: 'which' },
  ]);
  if (c2 === 'business') { await say(G.jack, 'I get it all the time. Terrible for business.'); await say(g, 'I bet it is. Poor sod.'); }
  if (c2 === 'looks') { await say(G.jack, 'The traitor\'s much better looking.'); await say(g, 'He is, and all. No offence.'); }
  if (c2 === 'which') { await say(G.jack, 'Do I? Which traitor?'); await say(g, 'Good point. We get a lot of them, in this building.'); }
  Sound.sfx('clank');
  flag('passedGate', true);
  await say(g, 'Goods lift, fourth floor, canteen\'s on the left. Don\'t touch anything, it\'s all secret.');
  setObjective('Up to the fourth floor');
  save();
  G.busy = false;
}

// ===========================================================================
// THE OUTER OFFICE — Miss Penrose, fourth floor
// ===========================================================================
SCENES.outer = {
  title: 'Headquarters · Fourth Floor · 07:50',
  music: 'whitehall', ambience: ['rainWindow', 'hum'], floor: 'Wood',
  paint: paintOuter,
  walk: [60, 1045, 1880, 1045, 1880, 872, 60, 872],
  depth: [872, 1.58, 1045, 1.9],
  light: LIGHT.outer,
  portraitBg: '#6a7a5e',
  actors() { return [makeFigure('penrose', 1000, 792, { id: 'penrose', facing: -1, pose: 'sit', arm: 'knit', seed: 104, scale: 1.62, fixedScale: true })]; },
  props: [{ y: 862, draw: ctx => paintPenroseDesk(ctx) }],
  back(ctx) { drawEngagedLight(ctx, !flag('controlOut')); },
  async enter() {
    if (flag('outerIntro')) return;
    flag('outerIntro', true);
    G.busy = true;
    const p = actor('penrose');
    await wait(0.5);
    p.arm = 'rest';
    await say(p, 'Mr Harrow. You smell of haddock.');
    await say(G.jack, 'Kippers, Miss Penrose. Forty of them.');
    await say(p, 'I never believed a word of it, you know. You always brought me back chocolates. Traitors don\'t bring back chocolates.');
    await say(G.jack, 'Is he in?');
    await say(p, 'Since six. He never leaves that office before nine. Not for fire drills, not for the Director, not for the Queen. He had the Queen on hold once.');
    await say('control', 'PENROSE. Where is my tea?', { pos: [1550, 300] });
    await say(p, 'Coming, sir!');
    await say(p, 'He\'s having tea with his mother at four, at the Wellington, with the Minister. Jacket and tie, at the Wellington. They turned away a duke last Christmas for wearing a cravat.');
    p.arm = 'knit';
    setObjective('Get Control out of his office');
    save();
    G.busy = false;
  },
  hotspots: [
    { name: 'Notice Board', rect: [320, 250, 240, 190],
      look: () => say(G.jack, 'WALLS HAVE EARS. CANTEEN: KIPPERS FRIDAY. LOST: ONE UMBRELLA, CONTROL\'S. DO NOT ASK HIM ABOUT IT.') },
    { name: 'Fire Alarm', rect: [600, 440, 60, 70], at: [630, 950],
      look: () => say(G.jack, 'IN CASE OF FIRE, BREAK GLASS. The last time somebody did, Control stayed at his desk and the rest of the building stood in the rain for an hour.'),
      use: () => say(G.jack, 'Tempting. Very tempting. But he\'d just stay at his desk.') },
    { name: 'Filing Cabinets', rect: [1080, 470, 232, 370], at: [1190, 940],
      look: () => say(G.jack, 'Four drawers each, all marked SECRET. The top one is marked BISCUITS.'),
      take: () => say(G.jack, 'Locked. Even the biscuits.') },
    { name: 'The Lift', rect: [50, 330, 220, 510], at: [170, 950], face: -1,
      look: () => say(G.jack, 'The goods lift, back down to Grimes and the rain.'),
      use: () => say(G.jack, 'Not without what I came for.') },
    { name: 'Control\'s Door', rect: [1460, 330, 180, 510], at: [1550, 930], face: 1, exitLabel: 'Into Control\'s office',
      async exit() {
        if (!flag('controlOut')) return say(G.jack, 'He\'s in there. I can hear him stirring his tea. Nobody stirs tea that angrily.');
        return gotoScene('office', 300, 950, 1, { sfx: 'door' });
      } },
    { name: 'Air Vent', rect: [1700, 690, 170, 100], at: [1760, 960], face: 1,
      look: async () => { flag('sawVent', true); await say(G.jack, 'An air vent, low on the wall. It runs straight through into Control\'s office. I can hear him humming Elgar through it.'); },
      use: () => say(G.jack, 'I could put something in it. Something Control would rather not smell.'),
      item: id => id === 'crate' ? kipperInVent() : false },
    { name: 'Miss Penrose', actor: 'penrose', at: [1180, 950], face: -1,
      look: () => say(G.jack, 'Miss Penrose: thirty years outside Control\'s door, a hundred and twenty words a minute, and the only person in this building who has never been fooled by anybody.'),
      talk: () => talkPenrose() },
  ],
};

async function talkPenrose() {
  const p = actor('penrose');
  if (flag('gotKey') || has('book')) return say(p, 'Hurry, Mr Harrow. The Director\'s kettle isn\'t that long.');
  if (flag('controlOut')) {
    G.busy = true;
    p.arm = 'rest';
    await say(p, 'He\'s gone up to the Director, on the ninth floor. He\'ll be twenty minutes. The Director has a very long kettle.');
    await say(G.jack, 'His desk will be locked.');
    await say(p, 'Yes. It will.');
    await wait(0.6);
    await say(p, 'I have a spare key, for when he locks himself out. Which is twice a week. It is in my top drawer, and I am going to powder my nose.');
    Sound.sfx('drawer'); await wait(0.3); Sound.sfx('clink');
    addItem('key'); flag('gotKey', true);
    await say(G.jack, 'Thank you, Miss Penrose.');
    await say(p, 'For what? I\'m powdering my nose.');
    p.arm = 'knit';
    setObjective('Search Control\'s office');
    save();
    G.busy = false;
    return;
  }
  G.busy = true;
  p.arm = 'rest';
  const c = await choose([
    { text: '"Could you get him out of there?"', value: 'out' },
    { text: '"Doesn\'t anything make him leave?"', value: 'leave' },
    { text: '"Carry on, Miss Penrose."', value: 'bye' },
  ]);
  if (c === 'out') { await say(G.jack, 'Could you get him out of there?'); await say(p, 'I can\'t lie to Control, Mr Harrow. I go red. I went red at my own wedding, and I meant every word.'); }
  if (c === 'leave') {
    await say(G.jack, 'Doesn\'t anything make him leave?');
    await say(p, 'Smells. He has a very delicate nose. Last year the canteen boiled a cabbage, and he worked from his club for a week.');
    await think('A delicate nose. And I have forty kippers.');
  }
  if (c === 'bye') await say(p, 'Mind the lift, Mr Harrow. It sticks on three.');
  p.arm = 'knit';
  G.busy = false;
}

async function kipperInVent() {
  if (flag('controlOut')) return say(G.jack, 'Once was enough. For the kipper, anyway.');
  G.busy = true;
  await walkTo(1760, 960);
  G.jack.facing = 1; G.jack.arm = 'reach';
  Sound.sfx('squelch');
  await wait(0.5);
  G.jack.arm = 'rest';
  await say(G.jack, 'One kipper, into the vent. I\'m sorry, kipper. You died for your country, and now you\'re doing it again.');
  await wait(1);
  await say('control', 'Penrose. PENROSE. What is that SMELL?', { pos: [1550, 300] });
  await say(actor('penrose'), 'The fish man is delivering, sir.');
  await say('control', 'It\'s in my office. It\'s in my TEA. I cannot think in this. I shall be with the Director.', { pos: [1550, 300] });
  Sound.sfx('door');
  flag('controlOut', true);
  const c = makeFigure('controlSuit', 1550, 900, { id: 'control', facing: -1, arm: 'rest', seed: 105, depthScale: true });
  c.scale = depthScale(900); G.actors.push(c);
  await walkTo(1300, 920, c, 1.2);
  c.facing = 1;
  await say(c, 'You. Fish man.');
  await say(G.jack, 'Sir.');
  await say(c, 'You smell of fish.');
  await say(G.jack, 'Occupational hazard, sir.');
  await say(c, 'Hm.');
  await say(c, 'Penrose, open every window in my office. And have the fish man shot.');
  await walkTo(170, 940, c, 1.2);
  Sound.sfx('slidingDoor');
  removeActor('control');
  await think('Eleven years he\'s been my boss, and he\'s never once looked at a fishmonger.');
  setObjective('Ask Miss Penrose about Control\'s desk');
  save();
  G.busy = false;
}

// ===========================================================================
// CONTROL'S OFFICE
// ===========================================================================
SCENES.office = {
  title: 'Control\'s Office · 08:02',
  music: 'whitehall', ambience: ['rainWindow', 'clock'], floor: 'Carpet',
  paint: paintControlOffice,
  walk: [60, 1045, 1880, 1045, 1880, 872, 60, 872],
  depth: [872, 1.58, 1045, 1.9],
  light: LIGHT.office,
  portraitBg: '#3a2414',
  props: [
    { y: 862, draw: ctx => paintControlDesk(ctx) },
    { y: 864, draw: ctx => paintBasket(ctx) },
    { y: 700, when: () => !has('tie') && !flag('tieOn'), draw: ctx => paintTieOnStand(ctx) },
  ],
  async enter() {
    // back from a saved game with everything in hand: Control is on his way back
    if (has('book') && has('pad') && has('tie')) return controlReturns();
    if (flag('officeIntro')) return;
    flag('officeIntro', true);
    G.busy = true;
    await wait(0.5);
    await think('Control\'s office. It smells of Lapsang Souchong, old leather and, now, very strongly, of kipper.');
    G.busy = false;
  },
  hotspots: [
    { name: 'The Window', rect: [760, 110, 440, 520],
      look: () => say(G.jack, 'Rain on the river, and Parliament across it. From here Control can watch the Minister arrive for work, and decide how much to tell him.') },
    { name: 'Portrait', rect: [320, 140, 220, 280],
      look: () => say(G.jack, 'The first Control, 1909. He also looks as though somebody has put a kipper in his air vent.') },
    { name: 'Map of Karvonia', rect: [1320, 170, 240, 180],
      look: () => say(G.jack, 'A map of Karvonia with pins in it: Karvograd, the Zlatá pass, the airbase. Every place somebody tried to kill me this year, in red.') },
    { name: 'The Door', rect: [70, 330, 170, 510], at: [240, 950], face: -1, exitLabel: 'Back to Miss Penrose',
      exit: () => gotoScene('outer', 1550, 930, -1, { sfx: 'door' }) },
    { name: 'Coat Stand', rect: [1780, 320, 90, 520], at: [1760, 950], face: 1,
      look: () => say(G.jack, has('tie') ? 'A bowler hat and an umbrella. Control\'s famous lost umbrella. It was here the whole time.' : 'Control\'s coat stand: a bowler, an umbrella, and a spare tie in the stripes of the Coldstream Guards.'),
      async take() {
        if (has('tie') || flag('tieOn')) return say(G.jack, 'I\'ll leave him the umbrella. I\'m not a monster.');
        addItem('tie'); Sound.sfx('cloth');
        await say(G.jack, 'Jacket and tie at the Wellington, Miss Penrose said. I have a jacket. It\'s a fish jacket, but it\'s a jacket.');
        await evidenceCheck();
      } },
    { name: 'The Teapot', rect: [1110, 596, 120, 90], at: [1160, 950], face: 1,
      look: () => say(G.jack, 'Control\'s teapot, in a knitted cosy of red, white and blue. His mother knitted it. It\'s the only thing in London he\'s never lied to.'),
      use: () => say(G.jack, 'Stone cold, stewed black, and now faintly of kipper.') },
    { name: 'Red Telephone', rect: [1390, 636, 80, 50], at: [1400, 950], face: 1,
      look: () => say(G.jack, 'The red telephone, straight through to the Minister. It has rung all week. He never answers it.') },
    { name: 'Desk Drawer', rect: [1260, 718, 150, 56], at: [1335, 950], face: 1,
      look: () => say(G.jack, has('book') ? 'The drawer, empty now apart from a spoon.' : 'A drawer with a brass lock. Control keeps his secrets the way he keeps his tea: locked up, and stewed.'),
      use: () => say(G.jack, has('book') ? 'Empty, apart from a spoon.' : 'Locked.'),
      item: id => id === 'key' ? openDrawer() : false },
    { name: 'Wastepaper Basket', rect: [1636, 736, 116, 116], at: [1660, 950], face: 1, when: () => !has('pad') && !flag('shownPad'),
      look: () => say(G.jack, 'Control\'s wastepaper basket. Screwed-up paper, a teabag and... my name?'),
      async take() {
        addItem('pad'); Sound.sfx('paper');
        G.photo = { id: 'sigpad', t: 0, label: ITEMS.pad.name };
        try { await say(G.jack, 'A notepad, covered in my signature. Forty times. The first ones are terrible. By the bottom of the page, even I\'d sign for them.'); } finally { G.photo = null; }
        await evidenceCheck();
      } },
  ],
};

async function openDrawer() {
  G.busy = true;
  removeItem('key');
  Sound.sfx('unlock'); await wait(0.3); Sound.sfx('drawer');
  addItem('book');
  await say(G.jack, 'A paying-in book for account 44-771, Zürich. Every stub in Control\'s own small, tidy hand. Eighty million francs, a little at a time.');
  G.busy = false;
  await evidenceCheck();
}

async function evidenceCheck() {
  save();
  if (!has('book') || !has('pad')) { setObjective('Find the proof in Control\'s office'); return; }
  if (!has('tie')) {
    await think('Something the Minister can hold, in his own handwriting. Now I just need something to wear to tea.');
    setObjective('Something to wear at the Wellington');
    return;
  }
  await controlReturns();
}

async function controlReturns() {
  G.busy = true;
  await wait(0.4);
  Sound.sfx('door');
  const c = makeFigure('controlSuit', 160, 940, { id: 'control', facing: 1, arm: 'rest', seed: 105, depthScale: true });
  c.scale = depthScale(940); G.actors.push(c);
  await say(c, 'Penrose, I forgot my umbr...');
  faceTo(c.x);
  Sound.sfx('sting');
  await say(c, 'HARROW.');
  await say(G.jack, 'Morning, sir. Kippers.');
  c.arm = 'point';
  await say(c, 'GUARDS! Guards, he\'s in my office! He\'s got my PAYING-IN BOOK! He\'s got my TIE!');
  await say(G.jack, 'Mind your tea, sir.');
  Sound.playMusic('tube');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  removeActor('control');
  await TextScreen.play(CHASE_PAGES, 'tube');
  G.busy = false;
  TubeRun.start();
}
const CHASE_PAGES = [
  { kicker: 'HEADQUARTERS  ·  08:06', amb: ['alarmBell'], text: 'Down nine flights of stairs, past Sergeant Grimes ("Oi! Kevin!"), out through the goods yard and across the road, with two of Control\'s grey men behind me, and Control behind them, shouting about his tie.' },
  { kicker: 'LAMBETH NORTH  ·  THE UNDERGROUND', amb: ['tube'], text: 'Down the escalator three steps at a time. Along the platform, through the rush hour. And a train, just pulling in.' },
];

// ===========================================================================
// THE WELLINGTON — the Palm Court, Piccadilly
// ===========================================================================
const TEA_WALK_OUT = [60, 1045, 440, 1045, 440, 880, 60, 880];
const TEA_WALK_IN = [60, 1045, 1880, 1045, 1880, 880, 60, 880];
SCENES.tearoom = {
  title: 'The Wellington · The Palm Court · 16:00',
  music: 'tea', ambience: ['cups', 'babble', 'rainWindow'], floor: 'Marble',
  paint: paintTearoom,
  get walk() { return flag('admitted') ? TEA_WALK_IN : TEA_WALK_OUT; },
  depth: [872, 1.58, 1045, 1.9],
  light: LIGHT.tearoom,
  portraitBg: '#b89a6a',
  actors() {
    const list = [
      makeFigure('fothergill', 380, 858, { id: 'fothergill', facing: -1, arm: 'rest', seed: 106, depthScale: true }),
      makeFigure('novak', 1060, 852, { id: 'novak', facing: 1, pose: 'sit', seed: 5, scale: 1.72, fixedScale: true }),
      makeFigure('minister', 1600, 852, { id: 'minister', facing: -1, pose: 'sit', seed: 107, scale: 1.72, fixedScale: true }),
      makeFigure('lumb', 1820, 866, { id: 'lumb', facing: -1, pose: 'sit', arm: 'hold', seed: 108, scale: 1.72, fixedScale: true }),
    ];
    if (!flag('arrested')) list.push(makeFigure('controlSuit', 1330, 800, { id: 'control', facing: -1, pose: 'sit', seed: 105, scale: 1.6, fixedScale: true }));
    return list;
  },
  props: [
    { y: 870, draw: ctx => paintNovakTable(ctx) },
    { y: 865, draw: ctx => paintLectern(ctx) },
    { y: 866, when: () => !flag('admitted'), draw: ctx => paintRope(ctx) },
  ],
  back(ctx, t) { drawChandelier(ctx, 1100, 250, t); },
  async enter() {
    if (flag('teaIntro')) return;
    flag('teaIntro', true);
    G.busy = true;
    await wait(0.5);
    const f = actor('fothergill');
    await say(f, 'Good afternoon, sir. Welcome to the Wellington. Have you a reservation?');
    await say(G.jack, 'I\'m with Madame Novak.');
    await say(f, 'Of course you are, sir.');
    await say(f, 'I\'m afraid the Palm Court does require a jacket and tie, sir.');
    await say(G.jack, 'This is a jacket.');
    await say(f, 'It is a fish jacket, sir.');
    setObjective('Get past Mr Fothergill');
    save();
    G.busy = false;
  },
  hotspots: [
    { name: 'String Trio', rect: [700, 480, 360, 190],
      look: () => say(G.jack, 'A string trio, sawing through Elgar. The cellist has been asleep since Pomp and Circumstance.') },
    { name: 'Cake Stand', rect: [1270, 630, 120, 100], at: [1200, 960], when: () => flag('admitted'),
      look: () => say(G.jack, 'Scones, clotted cream, and those little cakes that look like hats.'),
      take: () => say(actor('novak'), 'After the arrest, darling. Scones are for after.') },
    { name: 'Velvet Rope', rect: [440, 730, 180, 120], at: [300, 950], when: () => !flag('admitted'),
      look: () => say(G.jack, 'A velvet rope, and on the far side of it, England.'),
      use: () => say(actor('fothergill'), 'Jacket and tie, sir. It is the rule. We turned away a duke last Christmas.') },
    { name: 'Mr Fothergill', actor: 'fothergill', at: [300, 950], face: 1,
      look: () => say(G.jack, 'Mr Fothergill, the maître d\': tailcoat, carnation, and a face that has been turning people away from tea since the Coronation.'),
      talk: () => talkFothergill(),
      item: id => id === 'tie' ? wearTie() : id === 'crate' ? say(actor('fothergill'), 'We have our own kippers, sir. From Scotland. They are better dressed.') : false },
    { name: 'Madame Novak', actor: 'novak', at: [900, 950], face: 1, when: () => flag('admitted'),
      look: () => say(G.jack, 'Zdenka Novak, in her furs, pouring tea for her son and the Minister as if nobody had ever been framed for treason. It is her favourite kind of tea party.'),
      talk: () => talkNovak() },
    { name: 'Madame Novak', actor: 'novak', when: () => !flag('admitted'),
      look: () => say(G.jack, 'Madame Novak, at the best table, with the Minister and her son. She has seen me. She winked.') },
    { name: 'The Minister', actor: 'minister', at: [1720, 960], face: -1, when: () => flag('admitted'),
      look: () => say(G.jack, 'The Minister: Harrow and Oxford, the Garrick Club, and the jam. He is an honest man, Madame Novak says. A fool, but an honest one. That will have to do.'),
      talk: () => talkMinister(),
      item: id => showEvidence(id) },
    { name: 'The Minister', actor: 'minister', when: () => !flag('admitted'),
      look: () => say(G.jack, 'The Minister, buttering a scone, on the far side of a velvet rope.') },
    { name: 'Control', actor: 'control', at: [1200, 960], face: 1, when: () => flag('admitted') && !flag('arrested'),
      look: () => say(G.jack, 'Control, in his second-best suit, sipping Lapsang and not looking at me. His grey men are outside. He isn\'t worried. That worries me.'),
      talk: () => talkControl(),
      item: id => id === 'bill' ? theBill() : id === 'tie' ? say(actor('control'), 'That is MY tie.') : false },
    { name: 'Control', actor: 'control', when: () => !flag('admitted') && !flag('arrested'),
      look: () => say(G.jack, 'Control, at his mother\'s table. He saw me come in. He\'s smiling. That\'s never good.') },
    { name: 'The Man with the Paper', actor: 'lumb', at: [1720, 960], face: 1, when: () => flag('admitted'),
      look: () => say(G.jack, 'A large man at the next table, reading the racing pages upside down. Special Branch, or a very confused bookmaker.'),
      talk: () => say(actor('lumb'), 'Not now, sir. I\'m reading.') },
  ],
};

async function talkFothergill() {
  const f = actor('fothergill');
  if (!flag('admitted')) return say(f, 'A jacket and tie, sir. I am sure sir has a tie somewhere about his person.');
  if (flag('needClincher') && !has('bill') && !flag('billSigned')) {
    G.busy = true;
    const c = await choose([
      { text: '"The bill for Madame Novak\'s table, please."', value: 'bill' },
      { text: '"Carry on, Mr Fothergill."', value: 'bye' },
    ]);
    if (c === 'bill') {
      await say(G.jack, 'The bill for Madame Novak\'s table, please.');
      await say(f, 'Madame Novak\'s tea is never billed, sir. It is a tradition. Since 1953.');
      await say(G.jack, 'Just this once. For the gentleman in grey.');
      await say(f, '...Very good, sir.');
      Sound.sfx('paper');
      addItem('bill');
      setObjective('Give Control the bill');
      save();
    } else await say(f, 'Enjoy your tea, sir.');
    G.busy = false;
    return;
  }
  return say(f, 'Enjoy your tea, sir. The scones are warm, and the cream is Cornish.');
}

async function wearTie() {
  G.busy = true;
  removeItem('tie');
  Sound.sfx('cloth');
  flag('tieOn', true); G.jack.look = LOOKS.jackFishTie;
  await wait(0.5);
  const f = actor('fothergill');
  await say(f, 'The Coldstream Guards! I do beg your pardon, sir. A Guards tie covers a multitude of fish.');
  flag('admitted', true);
  Sound.sfx('clink');
  await walkTo(700, 900, f, 1);
  f.facing = -1;
  await say(f, 'This way, sir. Madame Novak\'s table.');
  const c = actor('control');
  await say(c, 'That is my tie.');
  await say(G.jack, 'It\'s a Guards tie, Rupert. You were in the Pay Corps.');
  setObjective('Show the Minister the proof');
  save();
  G.busy = false;
}

async function talkNovak() {
  const n = actor('novak');
  if (flag('needClincher')) {
    G.busy = true;
    await say(n, 'Jack. When Rupert was six he took me to tea at the Ritz with his pocket money, and he signed the bill. He has signed every bill since, darling. He cannot bear to let anybody else pay.');
    await say(n, 'It is his only generous quality.');
    await think('He signs every bill. He\'s spent a year practising my signature. I wonder which one his hand remembers.');
    G.busy = false;
    return;
  }
  if (flag('novakHello')) return say(n, 'Show him, Jack. Something he can hold. Ministers like to hold things. It makes them feel they are in charge.');
  flag('novakHello', true);
  G.busy = true;
  await say(n, 'Jack, darling. You smell of the sea. Sit down, have a scone.');
  await say(n, 'Rupert, don\'t make that face. It will stick.');
  await say(actor('control'), 'Mother, he is a traitor, and he is wearing my tie.');
  await say(n, 'He looks much nicer in it than you did.');
  G.busy = false;
}

async function talkControl() {
  const c = actor('control');
  if (flag('needClincher')) return say(c, 'Give it up, Harrow. The Minister believes what I tell him. He always has. It saves him reading.');
  return say(c, 'Hello, Harrow. You\'ve come a very long way to be arrested.');
}

async function talkMinister() {
  const m = actor('minister');
  if (flag('needClincher')) return say(m, 'More proof, Harrow. Something I can hold, in black and white. Pass the cream.');
  if (flag('ministerHello')) return say(m, 'Proof, Harrow. Something I can hold.');
  flag('ministerHello', true);
  G.busy = true;
  await say(m, 'Harrow! Good Lord. Zdenka says you\'re innocent. Rupert says you\'re a traitor. I say, somebody pass the jam.');
  await say(G.jack, 'Minister, I can prove it.');
  await say(m, 'Can you? Splendid. Proof I can hold, mind. I can\'t arrest a man on a feeling. I tried that once, and it was the Archbishop.');
  G.busy = false;
}

async function showEvidence(id) {
  const m = actor('minister'), c = actor('control');
  if (id === 'book') {
    G.busy = true;
    removeItem('book'); flag('shownBook', true);
    Sound.sfx('paper');
    await say(m, 'A paying-in book. Account four four, seven seven one. Rupert, this is your handwriting.');
    await say(c, 'A forgery, Minister. Harrow is an accomplished forger. It is in his file.');
    await say(m, 'Is it? Well. It\'s a jolly good forgery.');
    G.busy = false;
    return clincherCheck();
  }
  if (id === 'pad') {
    G.busy = true;
    removeItem('pad'); flag('shownPad', true);
    Sound.sfx('paper');
    await say(m, 'Harrow\'s signature. Forty times. Rather good by the end.');
    await say(c, 'Harrow, practising his own signature, Minister. Vanity. It is in his file.');
    await say(m, 'Hm. I can\'t arrest a man for a notepad, Zdenka. I\'d have to arrest my wife.');
    G.busy = false;
    return clincherCheck();
  }
  if (id === 'bill') return say(m, 'Good Lord, no. Rupert always pays. Always has.');
  if (id === 'crate') return say(m, 'Kippers? At tea? Harrow, this is the Wellington.');
  return false;
}

async function clincherCheck() {
  save();
  if (!flag('shownBook') || !flag('shownPad') || flag('needClincher')) return;
  flag('needClincher', true);
  await think('It\'s my word against his, and he has the better tie. I need Rupert to sign something, here, in front of the Minister.');
  setObjective('Get Control to sign something');
  save();
}

async function theBill() {
  G.busy = true;
  removeItem('bill');
  flag('billSigned', true);
  const c = actor('control'), m = actor('minister'), n = actor('novak');
  await say(G.jack, 'Your bill, sir.');
  await say(c, 'Give me that. Nobody pays for Mother\'s tea but me.');
  c.arm = 'sign';
  Sound.sfx('paper');
  await wait(1.2);
  c.arm = 'rest';
  await say(c, 'There.');
  await say(m, 'Eleven pounds forty, very reasonable, and signed...');
  await wait(0.8);
  await say(m, '"Jack Harrow."');
  Sound.sfx('sting');
  await wait(1);
  await say(m, 'Rupert. Why have you signed the bill "Jack Harrow"?');
  await wait(0.6);
  await say(c, '...Force of habit.');
  await say(n, 'Oh, Rupert.');
  await say(m, 'Inspector!');
  const l = actor('lumb');
  l.pose = 'stand'; l.fixedScale = false; l.y = 900; l.scale = depthScale(900); l.arm = 'rest';
  await walkTo(1480, 900, l, 1);
  l.facing = -1;
  await say(l, 'Rupert Novak, I am arresting you under the Official Secrets Act. You do not have to say anything.');
  Sound.sfx('clank');
  c.arm = 'cuffed';
  flag('arrested', true);
  await wait(0.6);
  await theMiddleman();
}

async function theMiddleman() {
  const c = actor('control'), n = actor('novak');
  await say(c, 'Ha. Oh, Harrow. Ha ha ha.');
  await say(c, 'You think this is the end? I was only ever the middleman. I moved the money. I signed the cheques. Your cheques.');
  await say(G.jack, 'Then who bought the aircraft?');
  await say(c, 'Nobody bought them, Harrow. The buyer never needed to buy anything. You don\'t pay for aeroplanes when your own brother builds them.');
  await wait(0.8);
  await say(n, 'Colonel Vasko has a sister.');
  await wait(0.6);
  await say(c, 'Aunt Olga sends her regards. May Day in Moscow will be glorious this year. Twelve black aircraft over Red Square.');
  Sound.sfx('door');
  flag('gooseIn', true);
  await wait(1.2);
  Sound.sfx('honk');
  await say(c, 'Not the goose. Mother, keep that goose away from me.');
  Sound.sfx('honk');
  await think('The goose remembers Aunt Olga. And I\'m fairly sure Aunt Olga remembers the goose.');
  await wait(1);
  G.fade = 1; G.fadeTo = 1;
  Sound.stopMusic(); Sound.setAmbience(['rain']);
  await wait(1.5);
  store.del(CHAPTER.saveKey);
  G.busy = false;
  await Ending.cliffhanger();
}

// ---------- the goose ---------------------------------------------------------------
// She spends most of this chapter elsewhere: at the chip shop door, in Stan's van,
// and finally at the Wellington, where she arrives by taxi for the arrest.
const Goose = {
  x: 150,
  reset() { this.x = 150; },
  visible() { return G.mode === 'play' && G.sceneId === 'tearoom' && flag('gooseIn'); },
  update() { this.x = Math.min(900, this.x + 4); },
  draw(ctx, t) { drawGoose(ctx, this.x, 990, depthScale(990) * 0.42, t, 1); },
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
// The goose's head at the chip shop door, beak to the glass (in a helmet, briefly).
function drawGooseAtGlass(ctx, t, helmet) {
  const x = 510 + Math.sin(t * 0.8) * 8, y = 540;
  ctx.save(); ctx.beginPath(); ctx.rect(450, 450, 120, 160); ctx.clip();
  ctx.strokeStyle = '#f0ece4'; ctx.lineWidth = 18; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 10, 620); ctx.quadraticCurveTo(x - 20, 580, x, y); ctx.stroke();
  ellipse(ctx, x + 4, y - 6, 16, 13, '#f0ece4');
  poly(ctx, [x + 16, y - 8, x + 42, y - 2, x + 16, y + 4], '#e8902a');
  ellipse(ctx, x + 8, y - 10, 2.4, 2.4, '#111');
  if (helmet) {
    ctx.fillStyle = '#14182a'; ctx.beginPath(); ctx.moveTo(x - 16, y - 14); ctx.bezierCurveTo(x - 18, y - 50, x - 4, y - 60, x + 4, y - 60); ctx.bezierCurveTo(x + 12, y - 60, x + 26, y - 50, x + 24, y - 14); ctx.fill();
    ctx.fillStyle = '#d8dce0'; ctx.beginPath(); for (let k = 0; k < 16; k++) { const r = k % 2 ? 3 : 7, a = -Math.PI / 2 + k / 16 * Math.PI * 2; ctx.lineTo(x + 6 + Math.cos(a) * r, y - 34 + Math.sin(a) * r); } ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(200,220,240,0.12)'; ctx.fillRect(450, 450, 120, 160);
}

// ---------- hint thoughts ------------------------------------------------------------
async function hintThought() {
  const sc = G.sceneId;
  if (sc === 'chippy') {
    if (!flag('snooker')) return think('PC Dobbs is watching the news, and the news is about me. Something else on that television, quickly.');
    if (!flag('dobbsGone')) return think(has('helmet') ? 'A police helmet, and a goose at the door. The goose has always wanted to be in the police.' : 'He\'s glued to the snooker. And his helmet is sitting on the counter.');
    if (!flag('password')) return think(has('memo') ? 'Stan does everything by the book. Give him the phrase from the memo.' : 'Stan wants the recognition phrase, and they changed it in March. Stan keeps everything on that spike.');
    return think('Upstairs, and some sleep.');
  }
  if (sc === 'yard') {
    if (!has('crate') && !flag('passedGate')) return think('A fish delivery needs fish. They\'re in the back of the van.');
    if (!flag('passedGate')) return think('Grimes wants to hold the delivery note.');
    return think('The goods lift, and up to the fourth floor.');
  }
  if (sc === 'outer') {
    if (!flag('controlOut')) return think(flag('sawVent') ? 'Control has a delicate nose, and that vent goes straight into his office. And I have forty kippers.' : 'Miss Penrose knows Control better than anyone. What makes him leave his office?');
    if (!flag('gotKey') && !has('book')) return think('His desk will be locked. Miss Penrose might know something about that.');
    return think('Control\'s office, while he\'s upstairs with the Director.');
  }
  if (sc === 'office') {
    if (!has('book')) return think('The desk drawer, and Miss Penrose\'s spare key.');
    if (!has('pad')) return think('Control\'s wastepaper basket. Nobody ever empties a spy\'s wastepaper basket properly.');
    return think('Jacket and tie, at the Wellington. Control keeps a spare on his coat stand.');
  }
  if (sc === 'tearoom') {
    if (!flag('admitted')) return think('Jacket and tie, Mr Fothergill says. I have Control\'s spare tie.');
    if (!flag('needClincher')) return think('Show the Minister the paying-in book, and the signature pad.');
    if (!has('bill') && !flag('billSigned')) return think('Control signs every bill, Madame Novak says. Mr Fothergill could bring one.');
    return think('Give Control the bill, and let him sign it.');
  }
}
