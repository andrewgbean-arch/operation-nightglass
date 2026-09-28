// ---------------------------------------------------------------------------
// Chapter Eight: All In — items, scenes, hotspots, dialogue, puzzles.
// Monte Carlo on Grand Prix weekend. Vasko needs forty million francs by
// Monday to pay the engineers finishing his fleet, and he means to win it at
// baccarat with a system. Madame Novak's yacht in the harbour; the Salle
// Blanche of the Casino; and the harbour again at dawn.
// ---------------------------------------------------------------------------

const ITEMS = {
  pearls: {
    name: 'The Novak Pearls',
    desc: 'Three strands of pearls, a present from the Shah of Persia in 1958, or the Aga Khan in 1961. Madame Novak says it depends who is asking.',
    icon(c) {
      for (let s = 0; s < 3; s++) for (let k = 0; k < 13; k++) { const a = Math.PI * 0.15 + k / 12 * Math.PI * 0.7; ellipse(c, Math.cos(a) * (20 + s * 7), Math.sin(a) * (18 + s * 7) - 14, 3.2, 3.2, '#f4f0e8'); }
      ellipse(c, 0, 16, 5, 5, '#c9a13b');
    },
  },
  plaques: {
    name: 'Casino Plaques',
    desc: 'Rectangular plaques from the cage, one hundred thousand francs\' worth, against the Novak Pearls. Enough to sit at Vasko\'s table. Not enough to lose.',
    icon(c) {
      for (let k = 0; k < 3; k++) { c.fillStyle = ['#c9a13b', '#2a6ad8', '#d82a2a'][k]; rrect(c, -24 + k * 6, -18 + k * 10, 40, 22, 4); c.fill(); c.strokeStyle = '#f4f0e8'; c.lineWidth = 2; c.stroke(); }
    },
  },
  shoe: {
    name: 'Sealed Card Shoe',
    desc: 'A fresh shoe of eight decks, still in the Casino\'s red seal. Honest cards. Colonel Vasko has probably never met any.',
    icon(c) {
      c.fillStyle = '#1a3a2a'; rrect(c, -28, -18, 56, 36, 5); c.fill();
      c.fillStyle = '#d82a2a'; c.fillRect(-28, -4, 56, 8); c.fillStyle = '#f0ece4'; c.fillRect(18, -14, 8, 12);
    },
  },
  cheque: {
    name: 'A Casino Cheque',
    desc: 'Société des Bains de Mer, Monte-Carlo. Pay Mr J. Harrow: forty-one million francs. Signed by a very pale cashier.',
    icon(c) {
      c.rotate(-0.08);
      c.fillStyle = '#e8e0c8'; c.fillRect(-34, -16, 68, 32); c.strokeStyle = '#c9a13b'; c.lineWidth = 2; c.strokeRect(-31, -13, 62, 26);
      c.fillStyle = '#2a4a3a'; c.font = `700 9px ${FONT_UI}`; c.textAlign = 'center'; c.fillText('41.000.000 F', 0, 4);
    },
  },
};

async function lookItemStory(id) {
  // the pearls get a proper close-up
  if (id === 'pearls') {
    G.photo = { id: 'pearls', t: 0, label: ITEMS.pearls.name };
    try { return await say(G.jack, ITEMS[id].desc); } finally { G.photo = null; }
  }
  await say(G.jack, ITEMS[id].desc);
}

const LIGHT = {
  yacht: { ambient: 'rgba(40,30,60,0.2)', key: 'rgba(255,190,140,0.4)', keyX: 1400 },
  casino: { ambient: 'rgba(40,24,10,0.15)', key: 'rgba(255,220,160,0.35)', keyX: 1000 },
  dawn: { ambient: 'rgba(60,40,60,0.08)', key: 'rgba(255,210,170,0.45)', keyX: 1600 },
};

const SCENES = {};

// ===========================================================================
// THE YACHT — Port Hercule, dusk
// ===========================================================================
SCENES.yacht = {
  title: 'La Diva · Port Hercule · Monte Carlo · 20:00',
  music: 'riviera', ambience: ['water', 'gulls', 'f1'], floor: 'Wood',
  paint: paintYacht,
  walk: [60, 1045, 1880, 1045, 1880, 872, 60, 872],
  depth: [872, 1.58, 1045, 1.9],
  light: LIGHT.yacht,
  portraitBg: '#3a2a4a',
  actors() {
    return [
      makeFigure('novak', 668, 934, { id: 'novak', facing: 1, pose: 'sit', seed: 5, scale: 1.62, fixedScale: true }),
      makeFigure('franz', 250, 890, { id: 'franz', facing: 1, arm: 'hold', seed: 2, depthScale: true }),
    ];
  },
  async enter() {
    if (flag('yachtIntro')) return;
    await yachtOpening();
  },
  hotspots: [
    { name: 'Monte Carlo', rect: [0, 140, 1600, 380],
      look: () => say(G.jack, 'Monte Carlo: a thousand balconies stacked up the hill, and on top, the Casino, lit up like a wedding cake. Somewhere in there Vasko is losing somebody else\'s money. Or winning it.') },
    { name: 'Grandstand', rect: [80, 440, 940, 90],
      look: () => say(G.jack, 'The Grand Prix grandstands and the barriers along the harbour. On Sunday, cars will scream past here at two hundred miles an hour. Tonight it\'s mostly Bentleys looking for somewhere to park.') },
    { name: 'The Bar', rect: [40, 620, 380, 200],
      look: () => say(G.jack, 'A cocktail bar on a yacht. Franz has found the one job in Monaco he was born to do.') },
    { name: 'Saloon Door', rect: [1680, 480, 150, 340], at: [1640, 960], face: 1,
      look: () => say(G.jack, 'The door to the saloon: velvet sofas, a piano, and a wardrobe full of Madame Novak\'s husbands\' clothes.'),
      useVerb: 'Go into',
      async use() {
        if (flag('tux')) return say(G.jack, 'I\'ve already borrowed a husband.');
        if (!flag('yachtBriefed')) return think('Not now. Madame Novak wants a word first.');
        return borrowTux();
      } },
    { name: 'The Gangway', rect: [0, 700, 60, 300], at: [100, 960], exitLabel: 'Ashore, to the Casino',
      async exit() {
        if (!flag('tux')) return say(actor('novak'), 'Darling, you cannot go to the Salle Blanche in that. They would not let you in to sweep it.');
        if (!has('pearls')) return say(actor('novak'), 'And with what will you play, darling? Your charm? That is worth nothing at a baccarat table. I have tried.');
        return goToCasino();
      } },
    { name: 'Madame Novak', actor: 'novak', at: [840, 960], face: -1,
      look: () => say(G.jack, 'Madame Novak in a deck chair, in white silk and sunglasses, although the sun set an hour ago. She says the sunglasses are for the photographers. There are no photographers.'),
      talk: () => talkNovak() },
    { name: 'Franz', actor: 'franz', at: [440, 960], face: -1,
      look: () => say(G.jack, 'Franz, behind the bar with a cloth over his arm. Fourteen years in a Vienna café, and he still polishes a glass as if it owes him money.'),
      async talk() {
        const f = actor('franz');
        await say(f, 'Something to drink, Herr Harrow? A martini?');
        const c = await choose([
          { text: '"Shaken, not stirred."', value: 'shaken' },
          { text: '"Just a tea, please."', value: 'tea' },
          { text: '"Nothing, thanks. I need a clear head."', value: 'none' },
        ]);
        if (c === 'shaken') { await say(G.jack, 'Shaken, not stirred.'); await say(f, 'Shaken? Herr Harrow, a martini is not a cocktail shaker in an earthquake. I will stir it. Gently. Like a Christian.'); }
        if (c === 'tea') { await say(G.jack, 'Just a tea, please.'); await say(f, 'Please do not ask for tea, Herr Harrow. It reminds me of Control. He stirs very loudly.'); }
        if (c === 'none') { await say(G.jack, 'Nothing, thanks. I need a clear head.'); await say(f, 'Very wise. The last man who drank before playing baccarat with Vasko lost a castle in Bavaria. With the ghosts.'); }
        if (flag('yachtBriefed')) await say(f, 'I will have the car at the Casino door at midnight. Please come out of it at a walk, not a run. They notice running in Monaco.');
      } },
  ],
};

async function yachtOpening() {
  flag('yachtIntro', true);
  G.busy = true;
  const n = actor('novak'), j = G.jack;
  await wait(0.6);
  await say(n, 'Darling! You look like something the tide brought in. And you smell of Berlin.');
  await say(j, 'Madame Novak. Thank you for the yacht.');
  await say(n, 'It is not mine, darling, it is my fourth husband\'s. He is in Brazil, with a dancer. He does not need it.');
  await say(n, 'Now listen. Vasko is here, at the Casino, tonight. He owes forty million francs to the engineers finishing his aeroplanes in Switzerland, and they want paying by Monday.');
  await say(n, 'Control has not paid him yet, because of you. So Vasko is going to win it. At baccarat. He says he has a system.');
  await say(j, 'Nobody has a system at baccarat.');
  await say(n, 'Vasko does. He has won every night this week. If he loses tonight, darling, the engineers go home, and the aeroplanes stay on the ground.');
  await say(j, 'Then I\'ll have to beat him.');
  await say(n, 'At his own table. In a dinner jacket. With money. You have none of these things.');
  Sound.sfx('honk');
  flag('yachtBriefed', true);
  setObjective('Get a dinner jacket and a stake');
  save();
  G.busy = false;
}

async function talkNovak() {
  const n = actor('novak');
  if (has('pearls') || flag('pawned')) return say(n, 'Go, darling. Win. And bring me back my pearls, or I shall haunt you. I have haunted better men.');
  if (!flag('tux')) return say(n, 'First a dinner jacket, darling. My third husband\'s is in the saloon. He was about your size, before the soufflé.');
  G.busy = true;
  await say(G.jack, 'I\'ve got a dinner jacket. I still need something to play with.');
  await say(n, 'I do not carry money, darling. Money is for people who cannot sing.');
  await wait(0.4);
  Sound.sfx('clink');
  await say(n, 'But I have these. The Novak Pearls. Take them to the cage at the Casino. They will give you a hundred thousand francs against them, and then look at me very sadly.');
  addItem('pearls');
  await say(G.jack, 'I\'ll bring them back.');
  await say(n, 'You will, darling. Or the goose sleeps in your bed.');
  setObjective('Go ashore to the Casino');
  save();
  G.busy = false;
}

async function borrowTux() {
  G.busy = true;
  await walkTo(1640, 950);
  Sound.sfx('door');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  flag('tux', true); G.jack.look = LOOKS.jackTux;
  Sound.sfx('cloth');
  await wait(0.6);
  G.fadeTo = 0; await waitUntil(() => G.fade < 0.05);
  await say(G.jack, 'Madame Novak\'s third husband: a perfect fit. Except for a soufflé stain on the lapel, and a telephone number on a matchbook in the pocket.');
  await say(actor('novak'), 'Bellissimo! Very handsome. He never looked so good in it. He never looked so good in anything.');
  setObjective(has('pearls') ? 'Go ashore to the Casino' : 'Ask Madame Novak for a stake');
  save();
  G.busy = false;
}

async function goToCasino() {
  G.busy = true;
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  await TextScreen.play(CASINO_PAGES, 'riviera');
  startPlay();
  G.sceneId = null; G.fade = 1;
  await gotoScene('casino', 1780, 960, -1, { instant: true });
  G.busy = false;
}
const CASINO_PAGES = [
  { kicker: 'PLACE DU CASINO  ·  22:00', amb: ['f1', 'crowd'], text: 'Ferraris parked like shopping trolleys. A doorman who looks at the dinner jacket, at the soufflé stain, and at the man inside it, and decides not to ask. The goose stays on the yacht, sulking, with Franz and a bowl of olives.' },
];

// ===========================================================================
// THE CASINO — the Salle Blanche
// ===========================================================================
SCENES.casino = {
  title: 'Casino de Monte-Carlo · The Salle Blanche · 22:15',
  music: 'casino', ambience: ['partyMurmur'], floor: 'Carpet',
  paint: paintCasino,
  walk: [80, 1045, 1880, 1045, 1880, 920, 80, 920],
  depth: [920, 1.66, 1045, 1.9],
  light: LIGHT.casino,
  portraitBg: '#4a2a1a',
  actors() {
    return [
      makeFigure('croupier', 1000, 770, { id: 'croupier', facing: -1, arm: 'rest', seed: 81, scale: 1.45, fixedScale: true }),
      makeFigure('vasko', 780, 800, { id: 'vasko', facing: 1, pose: 'sit', seed: 18, scale: 1.5, fixedScale: true }),
      makeFigure('kolar', 620, 790, { id: 'kolar', facing: 1, arm: 'behind', seed: 17, scale: 1.45, fixedScale: true }),
      makeFigure('hollis', 1230, 800, { id: 'hollis', facing: -1, pose: 'sit', seed: 59, scale: 1.5, fixedScale: true }),
      makeFigure('pitboss', 380, 930, { id: 'pitboss', facing: 1, arm: 'behind', seed: 82, depthScale: true }),
    ];
  },
  back(ctx, t) { drawChandelier(ctx, 600, 200, t); drawChandelier(ctx, 1400, 200, t); },
  props: [{ y: 830, draw: (ctx, t) => paintBaccarat(ctx, t, !!flag('swapped')) }],
  update(dt, t) {
    // the croupier's tell: a scratch of the left ear, then Vasko wins
    const c = actor('croupier');
    if (c && !G.busy && !flag('swapped')) c.arm = Math.sin(t * 0.9) > 0.85 ? 'phone' : 'rest';
  },
  async enter() {
    if (flag('casinoIntro')) return;
    flag('casinoIntro', true);
    await casinoArrival();
  },
  hotspots: [
    { name: 'Windows', rect: [140, 250, 1500, 400],
      look: () => say(G.jack, 'Monte Carlo by night through the windows, and the sea beyond. Nobody at the tables has looked at the view since 1878.') },
    { name: 'The Cage', rect: [1660, 420, 260, 420], at: [1660, 960], face: 1,
      look: () => say(G.jack, 'The cage: the cashier\'s window, behind brass bars. Money goes in, plaques come out, and very occasionally the other way round.'),
      async use() {
        if (flag('won')) return say('cashier', 'Your cheque, monsieur, and madame\'s pearls, with our compliments. Please do not come back for a while.', { pos: [1790, 520] });
        return say('cashier', 'Cash, or something of value, monsieur. The Casino does not accept charm. We have enough of our own.', { pos: [1790, 520] });
      },
      async item(id) {
        if (id !== 'pearls') return false;
        return pawnPearls();
      } },
    { name: 'Card Shoe', rect: [960, 750, 90, 50], at: [1000, 960], photo: 'baccarat',
      look: async () => {
        await say(G.jack, flag('swapped') ? 'The Casino\'s own shoe, straight from the seal. Honest cards. The croupier is looking at them as if they might bite.' : 'The shoe: eight decks of cards in a box, dealt one at a time by the croupier. Vasko\'s croupier. If those cards are marked, the system is the shoe.');
        if (flag('tell') && !flag('swapped')) { flag('needShoe', true); setObjective('Swap the shoe for a fresh one'); save(); }
      },
      async take() {
        if (flag('swapped')) return say(G.jack, 'I\'ve done my swapping for tonight.');
        return say(actor('croupier'), 'Monsieur! The shoe is for the croupier only. Hands on the table, if you please.');
      },
      async item(id) {
        if (id !== 'shoe') return false;
        return swapShoe();
      } },
    { name: 'Trolley', rect: [110, 640, 200, 190], at: [300, 960], face: -1,
      look: () => say(G.jack, 'A trolley of fresh card shoes, still in the Casino\'s red seals, guarded by Monsieur Blanc, the pit boss, as if they were the crown jewels. In Monaco, they probably are.'),
      async take() {
        if (has('shoe') || flag('swapped')) return say(G.jack, 'One is plenty.');
        if (!flag('ruckus')) return say(actor('pitboss'), 'Non, non, non, monsieur. Those are the house\'s cards. Monsieur may look. Monsieur may not touch. Monsieur may not even think about touching.');
        addItem('shoe');
        Sound.sfx('pickup');
        await say(G.jack, 'One sealed shoe, slipped under a dinner jacket. The soufflé stain hides everything.');
        save();
      } },
    { name: 'Your Seat', rect: [880, 860, 240, 60], at: [1000, 960], useVerb: 'Sit at',
      look: () => say(G.jack, 'An empty chair at Vasko\'s table. Baccarat: the player and the bank each get two or three cards, and whoever is nearest to nine wins. Nothing to decide, everything to lose.'),
      async use() {
        if (!has('plaques')) return say(actor('croupier'), 'Monsieur needs plaques to sit, monsieur. The cage is behind you.');
        if (!flag('swapped')) return think('Not while Vasko\'s croupier deals from his own shoe. I\'d be feeding him my stake.');
        return theGame();
      } },
    { name: 'Colonel Vasko', actor: 'vasko', at: [800, 960], face: 1,
      look: () => say(G.jack, 'Vasko, in a white dinner jacket with every medal he owns pinned to it. In front of him, a tower of plaques. Behind him, Kolar. Beside him, nobody: nobody sits next to a man who wins every hand.'),
      async talk() {
        const v = actor('vasko');
        await say(v, 'Harrow. You are persistent, like a cold. Sit down, lose your money, and go home. Oh, you cannot go home. London wants to arrest you. Ha!');
        if (!has('plaques')) await say(v, 'Come back when you have something to lose.');
      } },
    { name: 'Captain Kolar', actor: 'kolar', at: [640, 960], face: 1,
      look: () => say(G.jack, 'Kolar, in a dinner jacket at least one size too small. The bulge under his arm is not a handkerchief.'),
      talk: () => say(actor('kolar'), 'No shooting in the Casino, the Colonel says. They fine you. So I will wait outside, Harrow. Outside they do not fine you.') },
    { name: 'Mr Hollis', actor: 'hollis', at: [1250, 960], face: -1,
      look: () => say(G.jack, flag('ruckus') ? 'Mr Hollis, on his feet and making a noise like a stampede.' : 'Mr Hollis of Houston: the white hat, the red face, and a pile of plaques getting smaller every time Vasko wins.'),
      talk: () => talkHollis() },
    { name: 'The Croupier', actor: 'croupier', at: [1100, 960], face: -1,
      look: async () => {
        await say(G.jack, flag('swapped') ? 'The croupier, dealing from an honest shoe, sweating like a man at a wedding he wasn\'t invited to.' : 'The croupier: pencil moustache, white gloves, and a habit of scratching his left ear just before every deal. Vasko watches the ear, not the cards.');
        if (!flag('swapped')) { flag('sawEar', true); save(); }
      },
      talk: () => say(actor('croupier'), 'Faites vos jeux, monsieur. Place your bets. Or kindly do not stand so near the shoe.') },
    { name: 'Monsieur Blanc', actor: 'pitboss', at: [520, 960], face: -1,
      look: () => say(G.jack, 'Monsieur Blanc, the pit boss: bald, spectacled, and in charge of making sure the Casino always wins. He\'s had a very bad week.'),
      talk: () => say(actor('pitboss'), 'The Colonel wins every hand, monsieur. Every hand! We have checked the cards, the table, the chandeliers. I have not slept. I think I am going mad.') },
    { name: 'The Door', rect: [1880, 250, 40, 600], at: [1840, 960],
      look: () => say(G.jack, 'The way out. Not yet.') },
  ],
};

async function casinoArrival() {
  G.busy = true;
  const v = actor('vasko'), k = actor('kolar');
  await wait(0.5);
  await say(k, 'Colonel. The waiter. The baker. The gondolier. He is here.');
  await say(v, 'Harrow. In a dinner jacket! With a stain on it. Sit down, sit down, I am in a good mood. Kolar, no shooting in the Casino. They fine you.');
  await say(actor('hollis'), 'Well, if it ain\'t Frenchy! You look different without the moustache. Watch out, son. This fella don\'t lose.');
  setObjective('Find out how Vasko wins every hand');
  save();
  G.busy = false;
}

async function pawnPearls() {
  G.busy = true;
  removeItem('pearls');
  await walkTo(1660, 960);
  await say('cashier', 'The Novak Pearls! Monsieur, we have seen these before. In 1962, in 1968, and in 1975. Madame always comes back for them.', { pos: [1790, 520] });
  Sound.sfx('coin');
  await say('cashier', 'One hundred thousand francs, monsieur. Bonne chance. You will need it at that table.', { pos: [1790, 520] });
  addItem('plaques');
  flag('pawned', true);
  save();
  G.busy = false;
}

async function talkHollis() {
  const h = actor('hollis');
  if (flag('ruckus')) return say(h, 'I\'m busy, son! I\'m being a distraction! This table\'s crooked as a dog\'s hind leg!');
  if (flag('swapped')) return say(h, 'New cards, huh? About time. Now go take that Colonel for everything he\'s got. I\'ll watch. I\'m out of money anyway.');
  if (!flag('tell')) {
    G.busy = true;
    await say(h, 'Son, I\'ve lost two oil wells and a racehorse at this table. And I\'ll tell you something for nothing.');
    await say(h, 'Every time that croupier scratches his ear, the Colonel bets big. And every time the Colonel bets big, he wins. Now in Texas we call that a coincidence. Right before we call the sheriff.');
    flag('tell', true);
    setObjective('Find out what the croupier\'s ear has to do with the cards');
    save();
    G.busy = false;
    return;
  }
  if (!flag('needShoe')) return say(h, 'Ear, bet, win. Ear, bet, win. It ain\'t the cards on the table, son. Look at where they come from.');
  G.busy = true;
  await say(G.jack, 'Mr Hollis. I need everybody at this table looking somewhere else for one minute.');
  await say(h, 'A distraction? Son, I\'m from Texas. I was born a distraction.');
  await ruckus();
  G.busy = false;
}

async function ruckus() {
  const h = actor('hollis'), pb = actor('pitboss'), c = actor('croupier');
  h.pose = 'stand'; h.y = 800; h.arm = 'panic';
  Sound.sfx('shriek');
  await say(h, 'YEEEE-HAW! This table\'s crooked as a dog\'s hind leg! I want my oil wells back! I want my racehorse back! I want my MOMMA!');
  flag('ruckus', true);
  walkTo(1400, 900, pb, 1.4);
  c.facing = 1;
  await say(pb, 'Monsieur! Monsieur, please! This is the Salle Blanche! Calm, monsieur, calm!');
  await say(actor('vasko'), 'Hmph. Americans.');
  setObjective('Swap the shoe while they\'re busy');
  save();
}

async function swapShoe() {
  if (!flag('ruckus')) return say(actor('croupier'), 'Monsieur! Keep your hands away from the shoe, please.');
  G.busy = true;
  removeItem('shoe');
  await walkTo(1000, 930);
  G.jack.arm = 'reach';
  Sound.sfx('clink'); await wait(0.5);
  flag('swapped', true);
  G.jack.arm = 'rest';
  await say(G.jack, 'Vasko\'s shoe out, the Casino\'s shoe in. Let\'s see how good his system is with honest cards.');
  // the fuss dies down
  const h = actor('hollis'), pb = actor('pitboss'), c = actor('croupier');
  h.arm = 'rest'; h.pose = 'sit';
  await say(h, 'Well... I guess I feel better now. Carry on, fellas.');
  flag('ruckus', false);
  walkTo(380, 930, pb, 1.2);
  c.facing = -1;
  await say(pb, 'Thank you, monsieur. Thank you. Mon Dieu.');
  setObjective('Sit down at Vasko\'s table');
  save();
  G.busy = false;
}

async function theGame() {
  G.busy = true;
  const v = actor('vasko'), c = actor('croupier'), k = actor('kolar'), h = actor('hollis'), j = G.jack;
  await walkTo(1000, 930);
  j.facing = -1;
  await say(c, 'Messieurs, faites vos jeux.');
  await say(v, 'Harrow at my table. How nice. I bet fifty thousand. On the bank.');
  c.arm = 'phone'; await wait(0.6); c.arm = 'rest';
  await think('He scratched the ear. Vasko thinks the bank wins. But these aren\'t his cards any more.');
  const c1 = await choose([
    { text: '"Fifty thousand on the player."', value: 'punto' },
    { text: '"Fifty thousand on whatever the goose would choose."', value: 'goose' },
    { text: '"Everything. On the player."', value: 'all' },
  ]);
  if (c1 === 'punto') await say(j, 'Fifty thousand on the player.');
  if (c1 === 'goose') { await say(j, 'Fifty thousand on whatever the goose would choose.'); await say(c, 'The... goose, monsieur? The goose would choose the player. They always do.'); }
  if (c1 === 'all') { await say(j, 'Everything. On the player.'); await say(c, 'Monsieur is... enthusiastic.'); }
  Sound.sfx('paper'); await wait(0.6); Sound.sfx('paper');
  await say(c, 'The bank... has three. The player has nine. The player wins.');
  Sound.sfx('coin');
  await say(v, 'What? Three? The bank never has three.');
  await say(c, 'Pardon, mon Colonel. The cards, they are... not the cards.');
  await say(v, 'Again. One hundred thousand on the bank.');
  c.arm = 'phone'; await wait(0.5); c.arm = 'rest'; await wait(0.3); c.arm = 'phone'; await wait(0.5); c.arm = 'rest';
  await think('Now he\'s scratching both ears. That\'s not a signal, that\'s a panic.');
  const c2 = await choose([
    { text: '"The player. Again."', value: 'punto' },
    { text: '"Is that ear bothering you? I know a good doctor."', value: 'ear' },
  ]);
  if (c2 === 'ear') { await say(j, 'Is that ear bothering you? I know a good doctor.'); await say(c, 'It is nothing, monsieur! A mosquito! In December!'); await say(j, 'The player. Again.'); }
  else await say(j, 'The player. Again.');
  Sound.sfx('paper'); await wait(0.6);
  await say(c, 'The bank has... nothing. Baccarat. The player has eight.');
  Sound.sfx('coin');
  await say(h, 'Hot dog! Now that\'s what I call a system!');
  await say(v, 'Kolar. The croupier is fired. The Casino is fired. Everybody is fired.');
  await say(v, 'Everything, Harrow. Every franc on this table. Forty million. One hand. Unless you are afraid.');
  const c3 = await choose([
    { text: '(Push every plaque into the middle.) "All in."', value: 'allin' },
    { text: '"Forty million? I was hoping for a challenge."', value: 'cheek' },
  ]);
  if (c3 === 'allin') await say(j, 'All in.');
  else { await say(j, 'Forty million? I was hoping for a challenge.'); await say(v, 'Ha! Ha. Deal, you idiot. Deal!'); }
  Sound.sfx('paper'); await wait(0.8); Sound.sfx('paper'); await wait(0.8);
  await say(c, 'The bank has seven. The player has... eight.');
  await wait(0.6);
  await say(c, 'The player wins.');
  Sound.sfx('applause');
  await wait(0.8);
  flag('won', true);
  removeItem('plaques');
  addItem('cheque');
  await say(actor('pitboss'), 'The Colonel has lost! Mon Dieu! Somebody fetch the cashier! Somebody fetch a doctor! Somebody fetch me a brandy!');
  await say(v, '...');
  await say(v, 'Kolar. Mr Harrow is leaving. Make sure he leaves with nothing. Outside, where they do not fine you.');
  await say(k, 'With pleasure, Colonel.');
  await think('Franz said midnight, at the door. It\'s five to twelve. Walk, don\'t run.');
  Sound.sfx('door');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  await TextScreen.play(ESCAPE_PAGES, 'tension');
  G.busy = false;
  CircuitRun.start();
}
const ESCAPE_PAGES = [
  { kicker: 'PLACE DU CASINO  ·  23:58', amb: ['f1'], text: 'Jack walked out. Kolar ran out. Franz was at the door with the Mercedes, and moved into the passenger seat. "My back, Herr Harrow. You drive."' },
  { kicker: 'THE CIRCUIT  ·  00:01', amb: ['f1'], text: 'Every road to the harbour is closed for the Grand Prix, except one: the circuit itself. The wrong way round. Down past the Casino, through the hairpin, into the tunnel and out along the harbour, against the traffic, with Kolar behind.' },
];

// ===========================================================================
// THE HARBOUR — dawn
// ===========================================================================
SCENES.dawn = {
  title: 'La Diva · Port Hercule · 06:30',
  music: 'dawn', ambience: ['water', 'gulls'], floor: 'Wood',
  paint: paintYachtDawn,
  walk: [60, 1045, 1880, 1045, 1880, 872, 60, 872],
  depth: [872, 1.58, 1045, 1.9],
  light: LIGHT.dawn,
  portraitBg: '#8a6a7a',
  actors() {
    return [
      makeFigure('novak', 900, 910, { id: 'novak', facing: -1, arm: 'rest', seed: 5, depthScale: true }),
      makeFigure('franz', 250, 890, { id: 'franz', facing: 1, arm: 'hold', seed: 2, depthScale: true }),
    ];
  },
  async enter() {
    if (flag('dawnIntro')) return;
    flag('dawnIntro', true);
    G.busy = true;
    await wait(0.6);
    await say(actor('novak'), 'Darling! You won! The whole of Monte Carlo is talking about it. And you have dented my fourth husband\'s Mercedes in eleven places.');
    await say(actor('franz'), 'Twelve. One is on the roof. I still do not know how.');
    setObjective('Give Madame Novak the good news');
    save();
    G.busy = false;
  },
  hotspots: [
    { name: 'Monte Carlo', rect: [0, 140, 1600, 380],
      look: () => say(G.jack, 'Monte Carlo at dawn, pink and gold and very quiet, apart from a man hosing down the harbour front. There are tyre marks on it going the wrong way. They\'re mine.') },
    { name: 'Madame Novak', actor: 'novak', at: [720, 960], face: 1,
      look: () => say(G.jack, 'Madame Novak, in a silk dressing gown and her sunglasses, reading about me in the morning paper.'),
      talk: () => say(actor('novak'), 'Well, darling? Where are my pearls? And do not tell me the goose ate them.'),
      async item(id) {
        if (id !== 'cheque') return false;
        return theLaugh();
      } },
    { name: 'Franz', actor: 'franz', at: [440, 960], face: -1,
      look: () => say(G.jack, 'Franz, back behind the bar, making coffee for a man who has driven round the Grand Prix circuit backwards. He hasn\'t stopped smiling.'),
      talk: () => say(actor('franz'), 'London will want receipts, Herr Harrow. For the Mercedes, the barriers, the tyres, and the flower stall in the tunnel.') },
  ],
};

async function theLaugh() {
  G.busy = true;
  const n = actor('novak'), f = actor('franz'), j = G.jack;
  removeItem('cheque');
  await say(j, 'Forty-one million francs, made out to me. And the Casino sent your pearls back with it.');
  await say(n, 'My pearls! And forty-one million! Darling, now we can buy the goose a yacht.');
  await wait(0.4);
  Sound.sfx('stepWood');
  const v = makeFigure('vasko', -80, 930, { id: 'vasko', facing: 1, arm: 'behind', seed: 18, depthScale: true });
  const k = makeFigure('kolar', -200, 930, { id: 'kolar', facing: 1, arm: 'behind', seed: 17, depthScale: true });
  for (const a of [v, k]) { a.scale = depthScale(930); G.actors.push(a); }
  walkTo(120, 930, k, 0.9); await walkTo(300, 930, v, 0.9);
  await say(v, 'Good morning, Harrow. Madame. I have come to congratulate you.');
  await say(j, 'You\'ve come for the money.');
  await wait(0.6);
  await say(v, 'Ha! Ha ha! HA HA HA HA!');
  await say(v, 'Keep it, Harrow! Frame it! Hang it in your cell in London! I do not need the money now.');
  await say(j, 'Your engineers want paying by Monday.');
  await say(v, 'My engineers finished on Friday. While you were playing cards with me, Harrow, my aeroplanes took off. All twelve of them.');
  await say(v, 'Forty million francs was for the champagne.');
  await wait(0.4);
  Sound.sfx('jet'); await wait(0.6); Sound.sfx('jet');
  await say(n, 'Darling... those are not seagulls.');
  Sound.sfx('honk');
  await say(v, 'Au revoir, Harrow. I will see you in the mountains. Dress warmly.');
  v.facing = -1; k.facing = -1;
  walkTo(-200, 930, k, 1); await walkTo(-80, 930, v, 1);
  removeActor('vasko'); removeActor('kolar');
  await say(j, 'The mountains?');
  await say(f, 'Switzerland, Herr Harrow. He means Switzerland. They always mean Switzerland.');
  await wait(1);
  G.fade = 1; G.fadeTo = 1;
  Sound.stopMusic(); Sound.setAmbience(['water']);
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
    return ['yacht', 'dawn'].includes(G.sceneId) && (G.sceneId !== 'yacht' || flag('yachtIntro'));
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
  if (sc === 'yacht') {
    if (!flag('tux')) return think('A dinner jacket first. Madame Novak said her third husband\'s is in the saloon.');
    if (!has('pearls') && !flag('pawned')) return think('I need a stake. Madame Novak might have something worth pawning.');
    return think('Down the gangway, and up the hill to the Casino.');
  }
  if (sc === 'casino') {
    if (!has('plaques') && !flag('won')) return think('Nobody plays without plaques. The cage takes pearls.');
    if (!flag('tell')) return think('Vasko wins every hand. Mr Hollis has been losing to him all night; he might have noticed something.');
    if (!flag('needShoe')) return think('The croupier\'s ear, and Vasko\'s bets. The cards come from the shoe. Take a look at it.');
    if (!flag('swapped') && !has('shoe')) return think(flag('ruckus') ? 'Everyone is looking at Mr Hollis. The trolley of fresh shoes, now.' : 'A fresh shoe from the trolley, if Monsieur Blanc would only look away. Mr Hollis could make him.');
    if (!flag('swapped')) return think('The fresh shoe goes in place of Vasko\'s, while everyone\'s watching Mr Hollis.');
    return think('Honest cards. Sit down at the table.');
  }
  if (sc === 'dawn') return think('Madame Novak will want to see that cheque.');
}
