// ---------------------------------------------------------------------------
// Chapter Five: The Golden Horn — items, scenes, hotspots, dialogue, puzzles.
// A private airstrip at dawn; the Grand Bazaar; the Çemberlitaş hammam; and
// Bay Selim's yalı on the Bosphorus, where Nightglass is sold to the highest
// bidder.
// ---------------------------------------------------------------------------

const ITEMS = {
  minox: {
    name: 'Minox Camera',
    desc: 'Madame Novak\'s Minox, with thirty-six photographs of Nightglass inside. And a slip of paper taped to the back.',
    icon(c) {
      c.rotate(-0.25);
      c.fillStyle = linGrad(c, 0, -12, 0, 12, [[0, '#d8dce2'], [0.5, '#9aa0a8'], [1, '#6a7078']]); rrect(c, -40, -12, 80, 24, 6); c.fill();
      c.fillStyle = '#1a1a1a'; c.fillRect(-20, -8, 26, 16); ellipse(c, 24, 0, 7, 7, '#2a3a5a');
      c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(-36, -9, 70, 3);
    },
  },
  catalogue: {
    name: 'Auction Catalogue',
    desc: 'LOT ONE: NIGHTGLASS. Buyers: Herr Brunner of Zürich. Mr Hollis of Houston. Monsieur Dupont of Marseille, "who is never seen". And a telephone line to London. Buyers are the guests of the Çemberlitaş hammam before the sale.',
    icon(c) {
      c.rotate(-0.12);
      c.fillStyle = '#1a1a2a'; c.fillRect(-26, -34, 52, 68);
      c.fillStyle = '#c9a13b'; c.font = `700 9px ${FONT_UI}`; c.textAlign = 'center'; c.fillText('LOT 1', 0, -18);
      c.fillStyle = '#0a0a0e'; poly(c, [-18, 4, 12, -2, 18, 4, 12, 8], '#0a0a0e');
      c.strokeStyle = '#c9a13b'; c.lineWidth = 2; c.strokeRect(-22, -30, 44, 60);
    },
  },
  tray: {
    name: 'Tray of Tea',
    desc: 'A brass tray with six tulip glasses of tea. In Istanbul, a man carrying tea can walk through any door in the city.',
    icon(c) {
      c.fillStyle = '#c9a13b'; c.beginPath(); c.ellipse(0, 14, 40, 12, 0, 0, 7); c.fill();
      c.strokeStyle = '#c9a13b'; c.lineWidth = 3; c.beginPath(); c.moveTo(-26, 10); c.quadraticCurveTo(0, -40, 26, 10); c.stroke();
      for (const x of [-22, -8, 6, 20]) { c.fillStyle = 'rgba(200,90,30,0.85)'; c.beginPath(); c.moveTo(x - 5, -4); c.quadraticCurveTo(x - 7, 4, x - 4, 10); c.lineTo(x + 4, 10); c.quadraticCurveTo(x + 7, 4, x + 5, -4); c.fill(); }
    },
  },
  lokum: {
    name: 'Rose Lokum',
    desc: 'A box of rose-flavoured Turkish delight, dusted with sugar. Mustafa the masseur would do anything for it, says Rıza.',
    icon(c) {
      c.fillStyle = '#e8dcc0'; c.fillRect(-30, -12, 60, 30); c.fillStyle = '#9e1f28'; c.fillRect(-30, -12, 60, 7);
      for (let k = 0; k < 6; k++) { ellipse(c, -20 + (k % 3) * 20, 2 + Math.floor(k / 3) * 10, 8, 5, '#e87a9a'); ellipse(c, -22 + (k % 3) * 20, 0 + Math.floor(k / 3) * 10, 2, 1, 'rgba(255,255,255,0.8)'); }
    },
  },
  tulip: {
    name: 'Tulip Brooch',
    desc: 'An enamel tulip with a very small microphone in it. Madame Novak\'s. Put it near their telephone, and she can trace the call.',
    icon(c) {
      c.strokeStyle = '#2a6a3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 30); c.lineTo(0, 0); c.stroke();
      ellipse(c, -8, 18, 8, 4, '#2a6a3a', -0.6);
      c.fillStyle = '#c82a3a'; c.beginPath(); c.moveTo(-14, -2); c.quadraticCurveTo(-16, -24, -8, -30); c.lineTo(-4, -18); c.lineTo(0, -32); c.lineTo(4, -18); c.lineTo(8, -30); c.quadraticCurveTo(16, -24, 14, -2); c.quadraticCurveTo(0, 6, -14, -2); c.fill();
      c.strokeStyle = '#c9a13b'; c.lineWidth = 2; c.stroke();
    },
  },
  token: {
    name: 'Locker Token No. 7',
    desc: 'A brass token on a rubber band. Number seven: Monsieur Dupont\'s locker.',
    icon(c) {
      c.strokeStyle = '#2a2a2a'; c.lineWidth = 4; c.beginPath(); c.arc(0, -16, 14, 0, 7); c.stroke();
      ellipse(c, 0, 12, 18, 18, '#c9a13b'); c.fillStyle = '#2a1a0a'; c.font = `700 20px ${FONT_UI}`; c.textAlign = 'center'; c.fillText('7', 0, 19);
    },
  },
  invitation: {
    name: 'Invitation',
    desc: 'Bay Selim requests the pleasure of Monsieur J. Dupont at the Yalı Selim, Kandilli, at nine o\'clock. Black tie. No cameras. No geese.',
    icon(c) {
      c.rotate(0.1);
      c.fillStyle = '#f4f0e4'; c.fillRect(-32, -22, 64, 44); c.strokeStyle = '#c9a13b'; c.lineWidth = 2; c.strokeRect(-28, -18, 56, 36);
      c.fillStyle = '#6a2a1a'; c.font = `italic 700 10px ${FONT_DISPLAY}`; c.textAlign = 'center'; c.fillText('Yalı Selim', 0, -2); c.fillStyle = '#3a3a3a'; c.fillRect(-18, 6, 36, 2); c.fillRect(-12, 11, 24, 2);
    },
  },
};

async function lookItemStory(id) {
  if (id === 'minox' && !flag('readNote')) {
    flag('readNote', true);
    Sound.sfx('paper');
    await say(G.jack, 'Taped to the back of the Minox, in Madame Novak\'s handwriting: "In trouble in Istanbul, darling? Rıza, carpets, the Grand Bazaar. Show him this camera. Z."');
    await think('She thinks of everything. She probably knew I\'d end up in Istanbul before I did.');
    if (!flag('metRiza')) setObjective(flag('guardTea') ? 'Find Rıza, the carpet dealer, in the Grand Bazaar' : 'Get out of the airstrip, and find Rıza in the Grand Bazaar');
    return;
  }
  await say(G.jack, ITEMS[id].desc);
}

const LIGHT = {
  strip: { ambient: 'rgba(40,30,50,0.2)', key: 'rgba(255,200,150,0.4)', keyX: 1500 },
  bazaar: { ambient: 'rgba(40,20,8,0.18)', key: 'rgba(255,190,110,0.35)', keyX: 960 },
  hammam: { ambient: 'rgba(120,120,130,0.05)', key: 'rgba(255,250,235,0.25)', keyX: 960 },
  salon: { ambient: 'rgba(30,14,6,0.2)', key: 'rgba(255,210,150,0.35)', keyX: 1000 },
  terrace: { ambient: 'rgba(6,10,24,0.4)', key: 'rgba(255,210,140,0.35)', keyX: 1500 },
};

const SCENES = {};

// ===========================================================================
// THE AIRSTRIP — dawn, on the Asian shore
// ===========================================================================
SCENES.strip = {
  title: 'A Private Airstrip · Istanbul · 06:10',
  music: 'dawn', ambience: ['gulls', 'jetIdle'], floor: 'Stone',
  paint: paintStrip,
  walk: [60, 1045, 1860, 1045, 1860, 852, 60, 852],
  depth: [852, 1.55, 1045, 1.9],
  light: LIGHT.strip,
  portraitBg: '#5a3a5a',
  actors() {
    return [
      makeFigure('cayci', 386, 852, { id: 'cayci', facing: -1, pose: 'sit', headTilt: 0.25, seed: 51, scale: 1.55, fixedScale: true }),
      makeFigure('airGuard', 1620, 880, { id: 'airGuard', facing: -1, arm: 'behind', seed: 52, depthScale: true }),
    ];
  },
  props: [
    { y: 848, draw: ctx => paintJetSide(ctx, 700, 845, 0.85, { bayOpen: true }) },
    { y: 790, draw: ctx => { ctx.fillStyle = '#6a4a2a'; ctx.fillRect(360, 722, 100, 16); ctx.fillStyle = '#4a3018'; for (const x of [366, 444]) ctx.fillRect(x, 736, 10, 116); } },
    { y: 872, when: () => !flag('gotTray'), draw: ctx => { ctx.save(); ctx.translate(470, 830); ITEMS.tray.icon(ctx); ctx.restore(); } },
    { y: 900, when: () => !flag('gotCatalogue') && flag('stripIntro'), draw: ctx => { ctx.save(); ctx.translate(1000, 900); ctx.rotate(0.3); ITEMS.catalogue.icon(ctx); ctx.restore(); } },
  ],
  async enter() {
    if (flag('stripIntro')) return;
    await stripOpening();
  },
  hotspots: [
    { name: 'Nightglass', rect: [300, 560, 800, 290], at: [700, 960],
      look: () => say(G.jack, 'Nightglass Seven, ticking as it cools. Five hours in its equipment bay with a goose. I will never fly again. I may never eat again.') },
    { name: 'Tea Boy', actor: 'cayci', at: [470, 930], face: -1,
      look: () => say(G.jack, 'The tea boy, fast asleep on his stool. In Istanbul, tea boys are everywhere, carry tea to everyone, and see everything. This one is seeing the inside of his eyelids.'),
      talk: () => say('cayci', 'Çay... çay... two sugars... zzz...') },
    { name: 'Tray of Tea', photo: 'cay', rect: [430, 800, 90, 60], at: [470, 930], when: () => !flag('gotTray'),
      look: () => say(G.jack, 'A brass tray with six glasses of tea, still hot. Nobody in Istanbul ever questions a man carrying tea.'),
      async take() {
        flag('gotTray', true); addItem('tray');
        Sound.sfx('clink');
        await say(G.jack, 'I\'ll bring it back. Probably.');
        save();
      } },
    { name: 'Tea Stove', rect: [120, 520, 230, 300], at: [300, 930], face: -1,
      look: () => say(G.jack, 'A kettle on a kettle, the Turkish way. Somewhere there is always tea brewing, even in a secret hangar at six in the morning.') },
    { name: 'Sign', rect: [420, 300, 260, 70],
      look: () => say(G.jack, 'GİRİLMEZ: no entry. PRIVATE HANGAR. I\'m not so much entering as leaving.') },
    { name: 'Auction Catalogue', rect: [960, 870, 90, 60], at: [1000, 940], when: () => flag('stripIntro') && !flag('gotCatalogue'),
      look: () => say(G.jack, 'Vasko threw the catalogue on the floor. He\'s read it. He\'s in it. It\'s excellent.'),
      async take() {
        flag('gotCatalogue', true); addItem('catalogue');
        Sound.sfx('paper');
        await say(G.jack, 'LOT ONE: NIGHTGLASS. Tonight at nine, at Bay Selim\'s yalı. Three buyers and a telephone. One of them is a Monsieur Dupont of Marseille, "who is never seen".');
        await think('A buyer nobody has ever seen. Now there\'s a man I could be.');
        save();
      } },
    { name: 'Guard', actor: 'airGuard', at: [1480, 900], face: 1,
      look: () => say(G.jack, 'An airfield guard with a moustache like a yard brush and the expression of a man who has been awake since four.'),
      async talk() {
        if (flag('guardTea')) return say(actor('airGuard'), 'Go, go! And tell the kitchen: more sugar next time.');
        await say(actor('airGuard'), 'Dur! Stop! Papers! This is a private airfield. Nobody leaves without a pass. Nobody arrives without a pass. Nobody even has a pass.');
        await think('He\'s been standing there since four in the morning. And there\'s a tea boy asleep right behind me.');
      },
      async item(id) {
        if (id !== 'tray') return false;
        return guardTea();
      } },
    { name: 'The Gate', rect: [1500, 560, 420, 290], at: [1700, 900], exitLabel: 'Out through the gate',
      async exit() {
        if (!flag('guardTea')) return say(actor('airGuard'), 'Dur! Where are you going, baker? Papers!');
        await gotoScene('bazaar', 120, 920, 1, { sfx: 'car' });
      } },
  ],
};

async function stripOpening() {
  flag('stripIntro', true);
  G.busy = true;
  const j = G.jack;
  j.facing = 1; j.hidden = true;
  const v = makeFigure('vasko', 1300, 900, { id: 'vasko', facing: -1, arm: 'behind', seed: 18, depthScale: true });
  const k = makeFigure('kolar', 1420, 900, { id: 'kolar', facing: -1, seed: 17, depthScale: true });
  const s = makeFigure('selim', 1180, 910, { id: 'selim', facing: 1, arm: 'rest', seed: 53, depthScale: true });
  for (const a of [v, k, s]) { a.scale = depthScale(a.y); G.actors.push(a); }
  await wait(1);
  await say(s, 'Colonel Vasko! Welcome to Istanbul. Your aircraft arrived without a sound. Only a strange honking.');
  await say(v, 'The engines. They will be adjusted. Bay Selim, the buyers?');
  await say(s, 'Three, Colonel. A banker from Zürich, an oil man from Houston, and Monsieur Dupont of Marseille, whom nobody has ever seen. And the telephone line to London, as you asked.');
  await say(v, 'Excellent. Tonight at nine, at your yalı. Captain Kolar will stand at the door.');
  await say(s, 'The catalogue, Colonel.');
  await say(v, 'I have read it. I am in it. It is excellent.');
  Sound.sfx('paper');
  v.facing = 1; walkTo(1950, 900, v, 1.1); walkTo(1960, 910, s, 1.1);
  k.facing = 1; await walkTo(1950, 900, k, 1.1);
  for (const id of ['vasko', 'kolar', 'selim']) removeActor(id);
  Sound.sfx('carDoor'); await wait(0.5); Sound.sfx('car');
  await wait(1.2);
  Sound.sfx('clank');
  j.hidden = false; j.x = 640; j.y = 900;
  await wait(0.4);
  Sound.sfx('honk');
  await think('Five hours in the equipment bay of a supersonic aircraft, with a goose. Istanbul. I think. Everything is still spinning.');
  await say(j, 'Colonel, if you are ever sick on me again, it\'s the oven.');
  Sound.sfx('honk');
  setObjective('Get out of the airstrip');
  save();
  G.busy = false;
}

async function guardTea() {
  const g = actor('airGuard');
  G.busy = true;
  removeItem('tray');
  await say(G.jack, 'Çay, abi. Tea, sir. With the compliments of the kitchen.');
  await say(g, 'Tea! At last! Four hours I stand here, and nobody brings tea!');
  g.arm = 'hold';
  Sound.sfx('pour'); await wait(0.6); Sound.sfx('drink');
  await say(g, 'Ahh. Two sugars. Perfect. Go, go, tea boy. Tell the kitchen I love them.');
  await think('A man carrying tea can walk through any door in Istanbul. I must write that down for Technical Section.');
  flag('guardTea', true);
  setObjective(flag('readNote') ? 'Find Rıza, the carpet dealer, in the Grand Bazaar' : 'Find somewhere to lie low in the city');
  save();
  G.busy = false;
}

// ===========================================================================
// THE GRAND BAZAAR
// ===========================================================================
SCENES.bazaar = {
  title: 'The Grand Bazaar · 11:30',
  music: 'bazaar', ambience: ['bazaarCrowd'], floor: 'Stone',
  paint: paintBazaar,
  walk: [0, 1045, 1920, 1045, 1920, 850, 0, 850],
  depth: [850, 1.55, 1045, 1.9],
  light: LIGHT.bazaar,
  portraitBg: '#4a2a14',
  actors() { return [makeFigure('riza', 560, 880, { id: 'riza', facing: 1, arm: 'rest', seed: 54, depthScale: true })]; },
  async enter() {
    if (flag('bazaarIntro')) return;
    flag('bazaarIntro', true);
    G.busy = true; await wait(0.6);
    await think('The Grand Bazaar. Four thousand shops, sixty-one streets, and every one of them has a man who wants to sell me a carpet.');
    G.busy = false;
  },
  hotspots: [
    { name: 'Carpets', rect: [80, 300, 530, 330], at: [380, 900],
      look: () => say(G.jack, 'Kilims from Konya, silk from Hereke. Every carpet here has a story, and Rıza will tell it to you for three hours.') },
    { name: 'Lamps', photo: 'lamp', rect: [690, 290, 540, 420], at: [960, 900],
      look: () => say(G.jack, 'A whole wall of glass lanterns, glowing like boiled sweets. Somewhere, a man is trying to sell one to a German tourist for a thousand marks. He will succeed.') },
    { name: 'Spices', rect: [1320, 500, 520, 320], at: [1580, 900],
      look: () => say(G.jack, 'Saffron, sumac, pul biber and something labelled "Sultan\'s Aphrodisiac". I\'ll pass.') },
    { name: 'Turkish Delight', photo: 'lokum', rect: [1350, 390, 460, 60], at: [1580, 900],
      look: () => say(G.jack, 'Lokum: rose, lemon, pistachio. Soft as a pillow and sweet enough to stop your heart.'),
      take: () => say(G.jack, 'The man behind the counter is watching me with the eyes of a hawk. A hawk who has had things stolen before.') },
    { name: 'Rıza', actor: 'riza', at: [700, 900], face: -1,
      look: () => say(G.jack, 'A carpet dealer in a waistcoat, glasses on the end of his nose, and the patient smile of a man who has never once sold a carpet for the first price he said.'),
      talk: () => talkRiza(),
      async item(id) {
        if (id === 'minox') return rizaTrusts();
        if (id === 'catalogue') return flag('metRiza') ? say(actor('riza'), 'Selim\'s catalogue. Beautiful paper. Terrible business.') : say(actor('riza'), 'I do not read the catalogues of strangers, effendi.');
        return false;
      } },
    { name: 'The Lane to the Hammam', rect: [1850, 150, 70, 700], at: [1860, 900], exitLabel: 'Down the lane to the hammam',
      async exit() {
        if (!flag('rizaHelped')) return think('I don\'t even know where I\'m going yet. Rıza is the man to ask.');
        return kolarSpotsJack();
      } },
    { name: 'The Way Out', rect: [0, 150, 60, 700], at: [80, 900],
      look: () => say(G.jack, 'The Beyazıt Gate, back out into the city. Not yet.') },
  ],
};

async function talkRiza() {
  const r = actor('riza');
  if (flag('rizaHelped')) return say(r, 'The hammam is down the lane, past the goldsmiths. Give Mustafa the lokum, and go with God, effendi. And with the goose.');
  if (!flag('metRiza')) {
    flag('metRiza', true);
    await say(r, 'Hoş geldiniz! Welcome! You need a carpet. Everybody needs a carpet. You, effendi, need two carpets and a very long bath.');
    await say(G.jack, 'I\'m looking for Rıza.');
    await say(r, 'Many men are looking for Rıza. Most of them want money back. What does a baker\'s boy with a goose want?');
    if (!flag('readNote')) await think('Madame Novak must have known him. Maybe there\'s something about him on her camera.');
    else await think('"Show him this camera," she wrote.');
    return;
  }
  await say(r, 'Still here, baker? Buy a carpet or show me something interesting.');
}

async function rizaTrusts() {
  const r = actor('riza');
  G.busy = true;
  await say(G.jack, 'A friend lent me this camera. She said you\'d know it.');
  await say(r, 'Zdenka\'s Minox! Allah allah. She photographed my wedding. And then my divorce. Same photographer, much better pictures.');
  await say(r, 'Any friend of Zdenka is a friend of Rıza. What do you need, effendi?');
  await say(G.jack, 'I need to get into Bay Selim\'s yalı tonight. There\'s an auction.');
  await say(r, 'Selim\'s auctions! Only buyers with invitations. And the buyers spend the afternoon at the Çemberlitaş hammam, because a man in a towel cannot hide a microphone.');
  if (has('catalogue')) {
    await say(G.jack, 'One of the buyers is a Monsieur Dupont, of Marseille. Whom nobody has ever seen.');
    await say(r, 'Dupont! Every sale, three hours on the marble, face down, with a cloth over his head. Mustafa the masseur says his back is magnificent. Nobody knows his face.');
  }
  await say(r, 'Mustafa is my cousin. He will do anything for rose lokum. Take this box.');
  addItem('lokum');
  await say(r, 'And Zdenka left this for you, in case you came. A tulip, with a very small ear in it. Put it by their telephone, and she can trace who is on the other end.');
  addItem('tulip');
  await say(G.jack, 'Rıza, how can I ever repay you?');
  await say(r, 'Buy a carpet. Not today. One day. A big one.');
  flag('rizaHelped', true);
  setObjective('Get to the hammam');
  save();
  G.busy = false;
}

async function kolarSpotsJack() {
  G.busy = true;
  const k = makeFigure('kolar', -80, 900, { id: 'kolar', facing: 1, arm: 'rest', seed: 17, depthScale: true });
  k.scale = depthScale(900); G.actors.push(k);
  await walkTo(180, 900, k, 1.2);
  await say(k, 'Bay Selim wants six carpets for the auction room, and they must be red, and...');
  G.jack.facing = -1;
  k.arm = 'point';
  await say(k, 'YOU! The baker\'s boy! From the mountain! HARROW!');
  await say(G.jack, 'Rıza! Which way to the hammam?');
  await say(actor('riza'), 'Left, right, left, past the goldsmiths! Run, effendi!');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  removeActor('kolar');
  G.busy = false;
  BazaarChase.start();
}

// ===========================================================================
// THE HAMMAM
// ===========================================================================
SCENES.hammam = {
  title: 'The Çemberlitaş Hammam · 14:00',
  music: 'hammam', ambience: ['bathSteam', 'drips'], floor: 'Marble',
  paint: paintHammam,
  paintAfter(ctx) { for (const x of [560, 840, 1120, 1400]) lightCone(ctx, x, 80, 20, 180, 820, 'rgba(255,250,230,0.6)', 0.18); },
  walk: [300, 1045, 1860, 1045, 1860, 958, 300, 958],
  depth: [958, 1.78, 1045, 1.95],
  light: LIGHT.hammam,
  portraitBg: '#8a8a90',
  actors() {
    return [
      makeFigure('nuri', 330, 972, { id: 'nuri', facing: 1, arm: 'rest', seed: 55, depthScale: true }),
      makeFigure('mustafa', 1260, 870, { id: 'mustafa', facing: -1, arm: flag('dupontOut') ? 'rest' : 'push', seed: 56, scale: 1.75, fixedScale: true }),
    ];
  },
  props: [
    { y: 900, draw: ctx => paintGobekTasi(ctx) },
    { y: 901, draw: (ctx, t) => drawDupont(ctx, t, !!flag('dupontOut')) },
  ],
  front(ctx, t) {
    // steam drifting through the light
    for (let k = 0; k < 10; k++) {
      const p = (t * 0.03 + k / 10) % 1;
      ctx.save(); ctx.globalAlpha = 0.08 * Math.sin(p * Math.PI);
      ellipse(ctx, (k * 223) % W, 900 - p * 700, 220 + p * 200, 90 + p * 60, '#ffffff');
      ctx.restore();
    }
  },
  async enter() {
    if (flag('hammamIntro')) return;
    flag('hammamIntro', true);
    await hammamArrival();
  },
  hotspots: [
    { name: 'Skylights', rect: [240, 40, 1440, 180],
      look: () => say(G.jack, 'Star-shaped holes in the dome, letting in columns of light through the steam. Four hundred years old. Better ventilation than MI6.') },
    { name: 'Marble Basins', rect: [310, 380, 1540, 430],
      look: () => say(G.jack, 'Marble basins, brass taps, and little brass bowls for pouring hot water over your head. And then cold water. And then screaming.') },
    { name: 'Lockers', rect: [0, 300, 250, 520], at: [360, 1000], face: -1,
      look: () => say(G.jack, flag('dupont') ? 'Locker seven, empty now, and locker twelve, with a baker\'s smock in it that I hope never to see again.' : 'Numbered lockers. Twelve is mine, with a floury smock in it. Seven belongs to Monsieur Dupont.') },
    { name: 'Nuri', actor: 'nuri', at: [470, 1000], face: -1,
      look: () => say(G.jack, 'Nuri, keeper of the lockers. He has worked here for sixty years and remembers every towel.'),
      talk: () => talkNuri(),
      async item(id) {
        if (id === 'token') return dupontLocker();
        return false;
      } },
    { name: 'Monsieur Dupont', rect: [720, 790, 460, 100], at: [960, 1000],
      look: () => say(G.jack, flag('dupontOut') ? 'Monsieur Dupont, pummelled into a coma of relaxation, snoring into the marble.' : 'A man lying face down on the hot marble, a red towel round his middle and a cloth over his head. Monsieur Dupont of Marseille, whom nobody has ever seen. Including me, so far.'),
      async talk() {
        if (flag('dupontOut')) return say('dupont', 'Zzz... oui... encore... zzz...', { pos: [760, 700] });
        await say(G.jack, 'Monsieur Dupont?');
        await say('dupont', 'Non. Go away. I am relaxing. Nobody has seen my face since 1971, and I am not starting again for a baker in a towel.', { pos: [760, 700] });
      } },
    { name: 'Locker Token', rect: [820, 850, 60, 60], at: [860, 1000], when: () => flag('dupontOut') && !flag('gotToken'),
      look: () => say(G.jack, 'Dupont\'s locker token, dangling off the marble on its rubber band.'),
      async take() {
        flag('gotToken', true); addItem('token');
        Sound.sfx('pickup');
        await say(G.jack, 'Number seven. Pardon, monsieur. I\'ll bring it back when I\'ve finished being you.');
        save();
      } },
    { name: 'Mustafa', actor: 'mustafa', at: [1440, 1000], face: -1,
      look: () => say(G.jack, 'Mustafa the masseur: seven feet of muscle and moustache. He is kneading Dupont like a man making bread for a hundred people.'),
      async talk() {
        const m = actor('mustafa');
        if (flag('dupontOut')) return say(m, 'The Sultan\'s Special. Very strong. He will wake up tomorrow, very happy, very flat.');
        await say(m, 'Massage? Later, friend. First Monsieur Dupont. He pays by the hour, and he has booked three.');
        await say(G.jack, 'What would it take to finish him off early?');
        await say(m, 'The Sultan\'s Special. Very strong. Very good. Very painful. But I only do it for a very good reason. Rose lokum is a very good reason.');
      },
      async item(id) {
        if (id !== 'lokum') return false;
        return sultansSpecial();
      } },
    { name: 'Door to the Street', rect: [1870, 300, 50, 600], at: [1840, 1000], exitLabel: 'Out, to the yalı',
      async exit() {
        if (!flag('dupont')) return think('Not like this. I need an invitation, and a better outfit than a towel.');
        return ferryToYali();
      } },
  ],
};

async function hammamArrival() {
  G.busy = true;
  const n = actor('nuri');
  await wait(0.5);
  await say(G.jack, 'I think I lost him at the goldsmiths. Or he lost me. Either way, I\'m in a bathhouse.');
  await say(n, 'Welcome, welcome! But not like that. Nobody goes into the hot room dressed like a bakery. Clothes off, towel on.');
  await say(n, 'And the goose?');
  await say(G.jack, 'She\'s with me.');
  await say(n, 'Geese bathe for free on Tuesdays. Today is Tuesday. She is lucky.');
  Sound.sfx('cloth');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  flag('towel', true); G.jack.look = LOOKS.jackTowel;
  await wait(0.4);
  G.fadeTo = 0; await waitUntil(() => G.fade < 0.05);
  await say(G.jack, 'A red checked towel and nothing else. If Control could see me now, I\'d be demoted to Accounts.');
  setObjective('Get into the auction: become Monsieur Dupont');
  save();
  G.busy = false;
}

async function talkNuri() {
  const n = actor('nuri');
  if (flag('dupont')) return say(n, 'Goodbye, Monsieur Dupont. You look taller than you did this morning.');
  await say(n, 'You want your locker, twelve? The smock is quite safe. I have folded it. It was not easy.');
  await say(G.jack, 'What about locker seven?');
  await say(n, 'Seven is Monsieur Dupont\'s. Only the man with the token opens seven. Sixty years, nobody opens a locker without a token. Not even me. Especially not me.');
}

async function sultansSpecial() {
  const m = actor('mustafa');
  G.busy = true;
  removeItem('lokum');
  await say(G.jack, 'Rose lokum, from your cousin Rıza. And a very good reason.');
  await say(m, 'Rıza\'s lokum! The best in Istanbul! For this, Monsieur Dupont gets the Sultan\'s Special. On the house.');
  m.arm = 'panic';
  for (let k = 0; k < 4; k++) { Sound.sfx('thud'); await wait(0.35); }
  await say('dupont', 'Oh là là! Oh là là là là!', { pos: [760, 700] });
  Sound.sfx('crack'); await wait(0.6);
  await say('dupont', 'Oh... that is... magnifique... zzz.', { pos: [760, 700] });
  m.arm = 'rest';
  flag('dupontOut', true);
  await say(m, 'Finished. He will wake tomorrow. Very happy. Very flat.');
  await think('And his locker token is dangling off the edge of the marble.');
  save();
  G.busy = false;
}

async function dupontLocker() {
  const n = actor('nuri');
  G.busy = true;
  removeItem('token');
  await say(n, 'Seven. Monsieur Dupont. Hm. You look taller when you are standing up.');
  await say(G.jack, 'It\'s the steam.');
  Sound.sfx('lock'); await wait(0.4); Sound.sfx('cloth');
  await say(G.jack, 'A dinner jacket, an invitation to the Yalı Selim, and, in a little velvet box, a false moustache. For when he has to meet people.');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  flag('dupont', true); G.jack.look = LOOKS.jackDupont;
  addItem('invitation');
  await wait(0.5);
  G.fadeTo = 0; await waitUntil(() => G.fade < 0.05);
  await say(G.jack, 'Bonsoir. I am Monsieur Dupont of Marseille. Nobody has ever seen me, and tonight nobody will see me again.');
  await say(n, 'Very handsome. The moustache is a little crooked.');
  setObjective('Get to Bay Selim\'s yalı by nine');
  save();
  G.busy = false;
}

async function ferryToYali() {
  G.busy = true;
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  await TextScreen.play(FERRY_PAGES, 'dusk');
  startPlay();
  G.sceneId = null; G.fade = 1;
  await gotoScene('salon', 1780, 900, -1, { instant: true });
  G.busy = false;
}
const FERRY_PAGES = [
  { kicker: 'THE BOSPHORUS  ·  20:15', amb: ['gulls', 'ferry'], text: 'The evening ferry to Kandilli. A man in a dinner jacket and a false moustache stands at the rail, sharing a sesame simit with a goose, and fighting off the seagulls.' },
  { kicker: 'THE YALI SELIM  ·  20:58', amb: ['water'], text: 'A wooden palace on the water, every window lit. Captain Kolar at the door, checking invitations. And a footman, who takes one look at the goose and points at the terrace.' },
];

// ===========================================================================
// THE YALI — the auction salon
// ===========================================================================
SCENES.salon = {
  title: 'The Yalı Selim · The Salon · 21:00',
  music: 'salon', ambience: ['partyMurmur', 'water'], floor: 'Wood',
  paint: paintSalon,
  walk: [100, 1045, 1860, 1045, 1860, 868, 100, 868],
  depth: [868, 1.62, 1045, 1.95],
  light: LIGHT.salon,
  portraitBg: '#3a1a12',
  actors() {
    const leylaOnChair = flag('chaos') && !flag('planted');
    return [
      makeFigure('leyla', 300, leylaOnChair ? 830 : 880, { id: 'leyla', facing: 1, arm: leylaOnChair ? 'panic' : 'phone', seed: 57, scale: 1.72, fixedScale: true }),
      makeFigure('selim', 1600, 880, { id: 'selim', facing: -1, arm: 'rest', seed: 53, depthScale: true }),
      makeFigure('vasko', 1450, 890, { id: 'vasko', facing: -1, arm: 'behind', seed: 18, depthScale: true }),
      makeFigure('brunner', 860, 862, { id: 'brunner', facing: 1, pose: 'sit', seed: 58, scale: 1.7, fixedScale: true }),
      makeFigure('hollis', 1080, 862, { id: 'hollis', facing: 1, pose: 'sit', seed: 59, scale: 1.7, fixedScale: true }),
      makeFigure('kolar', 1820, 900, { id: 'kolar', facing: -1, arm: 'behind', seed: 17, depthScale: true }),
    ];
  },
  props: [{ y: 850, draw: ctx => paintGiltChairs(ctx) }],
  back(ctx, t) { drawChandelier(ctx, 700, 200, t); drawChandelier(ctx, 1300, 200, t); },
  update(dt, t) {
    const l = actor('leyla');
    if (l && flag('chaos') && !flag('planted')) l.arm = 'panic';
  },
  async enter() {
    if (!flag('salonIntro')) { flag('salonIntro', true); return salonArrival(); }
    if (flag('gooseFetched') && !flag('chaos')) return gooseChaos();
  },
  hotspots: [
    { name: 'Windows', rect: [340, 150, 1240, 520],
      look: () => say(G.jack, 'The Bosphorus at night: the bridge lit up like a necklace, Europe on one side and Asia on the other. And me in the middle, in somebody else\'s moustache.') },
    { name: 'Lot One', rect: [1640, 380, 220, 200], at: [1520, 930], face: 1,
      look: () => say(G.jack, 'A photograph of Nightglass on an easel, lit like a film star. LOT ONE. No reserve.') },
    { name: 'Leyla', actor: 'leyla', at: [480, 930], face: -1,
      look: () => say(G.jack, flag('chaos') && !flag('planted') ? 'Leyla, standing on a chair, screaming at a goose.' : 'Leyla, Bay Selim\'s secretary, sitting by the telephone like a hen on an egg. The line to London is open.'),
      async talk() {
        const l = actor('leyla');
        if (flag('chaos') && !flag('planted')) return say(l, 'Get it away! Get it away from me!');
        await say(l, 'Good evening, Monsieur Dupont. The line to London is for the telephone bidder only. Nobody may touch the telephone. Nobody may even look at it.');
        await say(G.jack, 'Who is the telephone bidder?');
        await say(l, 'I only know his voice, monsieur. Very English. He stirs his tea very loudly.');
      } },
    { name: 'Telephone', photo: 'telephone', rect: [120, 640, 240, 180], at: [440, 930], face: -1,
      look: () => say(G.jack, 'An ivory telephone with a gold dial and a line straight to London. Leyla hasn\'t taken her eyes off it all evening.'),
      async use() {
        if (flag('planted')) return say(G.jack, 'The tulip is in place. Madame Novak is listening.');
        return say(actor('leyla'), 'Monsieur! Please! Do not touch the telephone!');
      },
      async item(id) {
        if (id !== 'tulip') return false;
        if (!flag('chaos')) return say(actor('leyla'), 'Monsieur! A flower? For me? How kind. But please, not near the telephone.');
        return plantTulip();
      } },
    { name: 'Colonel Vasko', actor: 'vasko', at: [1300, 930], face: 1,
      look: () => say(G.jack, 'Vasko, in full dress uniform with every medal he owns. Tonight he becomes a very rich man. He is practising looking modest in the window. It isn\'t working.'),
      async talk() {
        await say(actor('vasko'), 'Monsieur Dupont. At last. Tonight you will see the finest aircraft ever built, and the finest man ever to build it.');
        await say(G.jack, 'Mm. And which one is for sale?');
        await say(actor('vasko'), '...Only the aircraft.');
      } },
    { name: 'Herr Brunner', actor: 'brunner', at: [760, 930], face: 1,
      look: () => say(G.jack, 'Herr Brunner of Zürich, a banker with a face like a closed safe.'),
      talk: () => say(actor('brunner'), 'Good evening. I do not discuss money before an auction. After an auction, I do not discuss anything.') },
    { name: 'Mr Hollis', actor: 'hollis', at: [980, 930], face: 1,
      look: () => say(G.jack, 'Mr Hollis of Houston: a white hat, a red face, and a wallet you could land a plane on.'),
      talk: () => say(actor('hollis'), 'Howdy, Frenchy! I aim to buy me an invisible airplane. Trouble is, I can\'t find the dang thing.') },
    { name: 'Bay Selim', actor: 'selim', at: [1500, 930], face: 1,
      look: () => say(G.jack, 'Bay Selim, host and auctioneer. A white dinner jacket and the smile of a man who takes ten per cent of everything.'),
      async talk() {
        await say(actor('selim'), 'Monsieur Dupont! Please, take your seat. We begin when all our guests are seated.');
        if (!flag('planted')) await think('Not before I\'ve put Madame Novak\'s tulip by that telephone.');
      } },
    { name: 'Captain Kolar', actor: 'kolar', at: [1680, 930], face: 1,
      look: () => say(G.jack, 'Kolar at the door. He keeps looking at me as if he\'s trying to remember where he left his keys.'),
      talk: () => say(actor('kolar'), 'Monsieur Dupont. Have we... no. No. Enjoy the auction, monsieur.') },
    { name: 'Your Seat', rect: [590, 700, 100, 200], at: [640, 940], useVerb: 'Sit in',
      look: () => say(G.jack, 'A gilt chair with a card: M. DUPONT. And a numbered paddle, thirteen. Lucky for somebody.'),
      async use() {
        if (!flag('planted')) return think('Not yet. The tulip goes by the telephone first, or this whole evening is for nothing.');
        return theAuction();
      } },
    { name: 'Door to the Terrace', rect: [0, 250, 90, 560], at: [130, 930], exitLabel: 'Out to the terrace',
      exit: () => gotoScene('terrace', 520, 920, 1, { sfx: 'door' }) },
  ],
};

async function salonArrival() {
  G.busy = true;
  const k = actor('kolar');
  await wait(0.6);
  await say(k, 'Invitation.');
  await say(G.jack, 'Dupont. Of Marseille.');
  await say(k, 'Monsieur Dupont... have we met?');
  await say(G.jack, 'Non. Nobody has met me. It is my whole personality.');
  await say(k, '...Welcome, monsieur.');
  await say(actor('selim'), 'Monsieur Dupont! At last, a face to the name. And such a moustache!');
  await think('The telephone is on the left, with a secretary guarding it. And the goose is out on the terrace, sulking.');
  setObjective('Put Madame Novak\'s tulip by the telephone');
  save();
  G.busy = false;
}

async function gooseChaos() {
  flag('chaos', true);
  G.busy = true;
  Goose.lead = null;
  Goose.running = G.t;
  Sound.sfx('honk'); await wait(0.2); Sound.sfx('honk');
  const l = actor('leyla');
  l.y = 830; l.arm = 'panic';
  Sound.sfx('shriek');
  await say(l, 'A GOOSE! There is a goose in the salon! Get it away from me!');
  await say(actor('hollis'), 'Yee-haw! Now that\'s what I call a floor show!');
  await say(actor('vasko'), 'Captain! Remove that bird!');
  await say(actor('kolar'), 'I know that goose...');
  await think('Leyla\'s on a chair across the room. The telephone is all mine.');
  G.busy = false;
}

async function plantTulip() {
  G.busy = true;
  removeItem('tulip');
  Sound.sfx('click');
  await say(G.jack, 'One enamel tulip, tucked behind the telephone. Madame Novak, you have a line to London.');
  flag('planted', true);
  Goose.running = 0;
  Sound.sfx('honk');
  await say(actor('kolar'), 'Got you! Out you go, bird. Back on the terrace.');
  Sound.sfx('door');
  const l = actor('leyla');
  l.y = 880; l.arm = 'phone';
  await say(l, 'Thank you, Captain. I am quite all right. I am... quite all right.');
  setObjective('Take your seat for the auction');
  save();
  G.busy = false;
}

async function theAuction() {
  G.busy = true;
  const s = actor('selim'), v = actor('vasko'), h = actor('hollis'), b = actor('brunner'), l = actor('leyla');
  const j = G.jack;
  await walkTo(640, 890, j);
  j.pose = 'sit'; j.facing = 1; j.y = 862; j.scale = 1.7;
  await wait(0.6);
  Sound.sfx('gavel');
  await say(s, 'Ladies and gentlemen. Lot One: Nightglass. Invisible to radar, and very nearly to the naked eye. The Colonel will say a few words.');
  await say(v, 'It is magnificent. So am I. We begin at ten million dollars.');
  await say(h, 'Eleven!');
  await say(b, 'Twelve.');
  await say(s, 'Monsieur Dupont?');
  const c1 = await choose([
    { text: 'Fifteen million.', value: 'bid' },
    { text: 'Is that in dollars, or in lira?', value: 'lira' },
    { text: '(Scratch your nose.)', value: 'nose' },
  ]);
  if (c1 === 'bid') { await say(j, 'Fifteen million.'); await say(s, 'Fifteen million, from Monsieur Dupont!'); }
  if (c1 === 'lira') { await say(j, 'Is that in dollars, or in lira?'); await say(s, 'Dollars, monsieur. In lira we would be here until Thursday.'); await say(j, 'Then, fifteen million.'); }
  if (c1 === 'nose') { await think('Nobody bids by scratching their nose. That only happens in films.'); await say(s, 'Twenty million! From Monsieur Dupont!'); await think('Apparently it also happens in Istanbul.'); }
  await say(h, 'Twenty-five! Dang it, twenty-five!');
  await say(b, 'Thirty.');
  await say(s, 'Thirty million, from Herr Brunner. Monsieur Dupont?');
  const c2 = await choose([
    { text: 'Forty million!', value: 'forty' },
    { text: 'Thirty-five million, and a box of Turkish delight.', value: 'lokum' },
    { text: '(Sit very, very still.)', value: 'still' },
  ]);
  if (c2 === 'forty') { await say(j, 'Forty million!'); await think('Dupont\'s deposit is twenty million francs and a spare moustache. I hope nobody checks.'); }
  if (c2 === 'lokum') { await say(j, 'Thirty-five million, and a box of Turkish delight.'); await say(s, 'The Turkish delight is noted. Thirty-five million!'); }
  if (c2 === 'still') { await think('Don\'t move. Don\'t sneeze. Don\'t touch the moustache.'); await say(s, 'I see Monsieur Dupont\'s moustache has twitched. Forty million!'); }
  Sound.sfx('ring');
  l.arm = 'phone';
  await wait(0.8);
  await say(l, 'The telephone bids... fifty million dollars.');
  await wait(0.8);
  await say(h, 'Fifty? Well, shoot. I\'m out. I\'ll buy Texas instead.');
  await say(b, 'I do not bid against telephones. Telephones do not pay their bills.');
  await say(s, 'Fifty million on the telephone. Monsieur Dupont?');
  await think('If I say fifty-one, somebody asks for the money. And all I have is a Minox, a moustache and a goose.');
  await say(j, 'Monsieur Dupont... declines.');
  Sound.sfx('gavel');
  await say(s, 'Going... going... gone! Sold, to the gentleman on the telephone, for fifty million dollars!');
  Sound.sfx('applause');
  await say(v, 'Magnificent. As predicted. By me.');
  await wait(0.6);
  await say(l, 'One moment. The gentleman on the telephone has one more request.');
  await say(l, 'He says he will take the goose as well. The one called Colonel.');
  await wait(0.6);
  Sound.sfx('honk');
  for (const a of [s, v, h, b, l, actor('kolar')]) if (a) a.facing = -1;
  await wait(1.2);
  await think('Nobody in this room knows that goose\'s name. Only Ilse, Anička, Madame Novak...');
  await think('...and whoever Madame Novak tells her secrets to, on the telephone, every Sunday. In London. Stirring his tea very loudly.');
  await wait(1);
  G.fade = 1; G.fadeTo = 1;
  Sound.stopMusic(); Sound.setAmbience(['water']);
  await wait(1.5);
  store.del(CHAPTER.saveKey);
  G.busy = false;
  await Ending.cliffhanger();
}

// ===========================================================================
// THE TERRACE
// ===========================================================================
SCENES.terrace = {
  title: 'The Yalı Selim · The Terrace',
  music: 'dusk', ambience: ['water', 'partyMurmur'], floor: 'Stone',
  paint: paintTerrace,
  walk: [440, 1045, 1860, 1045, 1860, 862, 440, 862],
  depth: [862, 1.55, 1045, 1.9],
  light: LIGHT.terrace,
  portraitBg: '#141e3a',
  props: [{ y: 900, when: () => !flag('gooseFetched') || flag('planted'), draw: (ctx, t) => drawGoose(ctx, 1180, 910, 0.72, Math.floor(t * 0.5) % 3 ? 0 : t, -1) }],
  async enter() {
    if (flag('terraceIntro')) return;
    flag('terraceIntro', true);
    G.busy = true; await wait(0.5);
    await think('The terrace, the Bosphorus, and the Colonel, banished, glaring at the seagulls.');
    G.busy = false;
  },
  hotspots: [
    { name: 'The Bosphorus', rect: [420, 380, 1500, 340],
      look: () => say(G.jack, 'Ships going north to the Black Sea and south to the Mediterranean, and the bridge between two continents. Istanbul does everything twice.') },
    { name: 'Boat', rect: [1560, 730, 360, 110],
      look: () => say(G.jack, 'A fast little motor boat, keys in the ignition. Somebody here is expecting to leave in a hurry. It might be me.') },
    { name: 'The Colonel', rect: [1110, 800, 150, 120], at: [1040, 930], face: 1, when: () => !flag('gooseFetched') || flag('planted'),
      look: () => say(G.jack, flag('planted') ? 'The Colonel, thrown out for the second time tonight. She looks very pleased with herself.' : 'The Colonel, banished to the terrace by the footman. She is sulking magnificently.'),
      async use() {
        if (flag('planted')) return say(G.jack, 'You\'ve done enough, Colonel. Stay here and guard the boat.');
        flag('gooseFetched', true);
        Sound.sfx('honk');
        await say(G.jack, 'Colonel. There\'s a secretary inside who is terrified of birds, and a telephone I need to get near. Are you in?');
        Sound.sfx('honk');
        await think('I\'ll take that as a yes.');
        setObjective('Take the Colonel into the salon');
        save();
      }, useVerb: 'Recruit' },
    { name: 'Door to the Salon', rect: [270, 410, 130, 410], at: [440, 930], exitLabel: 'Back into the salon',
      exit: () => gotoScene('salon', 180, 920, 1, { sfx: 'door' }) },
  ],
};

// ---------- the goose ---------------------------------------------------------------
const Goose = {
  trail: [], lead: null, running: 0,
  reset() { this.trail = []; },
  visible() {
    if (G.mode !== 'play') return false;
    const sc = G.sceneId;
    if (sc === 'salon') return (flag('gooseFetched') && !flag('planted')) || !!this.running;
    if (sc === 'terrace') return flag('gooseFetched') && !flag('planted');
    return ['strip', 'bazaar', 'hammam'].includes(sc) && flag('stripIntro');
  },
  update() {
    const j = G.jack;
    if (!j) return;
    const last = this.trail[this.trail.length - 1];
    if (!last || Math.hypot(last[0] - j.x, last[1] - j.y) > 10) this.trail.push([j.x, j.y]);
    if (this.trail.length > 120) this.trail.shift();
  },
  draw(ctx, t) {
    if (this.running) {
      // loose in the salon, running rings round everybody
      const p = t * 0.9, x = 960 + Math.sin(p) * 520, y = 960 + Math.cos(p * 1.7) * 50;
      return drawGoose(ctx, x, y, depthScale(y) * 0.42, t * 2, Math.cos(p) > 0 ? 1 : -1);
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
  if (sc === 'strip') {
    if (!flag('readNote')) return think('Madame Novak\'s Minox has something taped to the back. I should look at it properly.');
    if (!flag('gotCatalogue')) return think('Vasko threw the auction catalogue on the floor by the jet.');
    if (!flag('guardTea')) return think(has('tray') ? 'That guard has been standing there since four. He looks like a man who needs tea.' : 'The tea boy is asleep, and his tray of tea is sitting right beside him.');
    return think('The gate is open to a tea boy. Off to the Grand Bazaar.');
  }
  if (sc === 'bazaar') {
    if (!flag('rizaHelped')) return think(flag('readNote') ? '"Show him this camera," Madame Novak wrote. Rıza, the carpet dealer.' : 'The carpet dealer might be the man I need. Madame Novak\'s Minox has a note on it.');
    return think('The hammam is down the lane on the right.');
  }
  if (sc === 'hammam') {
    if (!flag('dupontOut')) return think('Mustafa would do anything for rose lokum, Rıza said. Including finishing Dupont off early.');
    if (!flag('gotToken')) return think('Dupont\'s locker token is dangling off the marble.');
    if (!flag('dupont')) return think('Nuri opens a locker for anyone with the right token.');
    return think('Monsieur Dupont has an auction to go to. The door is on the right.');
  }
  if (sc === 'salon') {
    if (!flag('chaos')) return think('Leyla won\'t leave that telephone. She needs something to be more frightened of than Bay Selim. Something with feathers, out on the terrace.');
    if (!flag('planted')) return think('Leyla\'s on a chair. The tulip, by the telephone, now.');
    return think('My seat is waiting. Paddle thirteen.');
  }
  if (sc === 'terrace') {
    if (!flag('gooseFetched')) return think('The Colonel is sulking by the balustrade. Time she earned her keep.');
    return think('Into the salon with the Colonel.');
  }
}
