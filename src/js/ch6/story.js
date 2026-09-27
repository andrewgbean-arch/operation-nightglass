// ---------------------------------------------------------------------------
// Chapter Six: Masquerade — items, scenes, hotspots, dialogue, puzzles.
// A fondamenta in the fog; Maestro Bepi's furnace on Murano; the Contessa's
// masked ball on the Grand Canal, where the London buyer comes to collect a
// glass swan; and the Rialto at dawn, where he takes off his mask.
// ---------------------------------------------------------------------------

const ITEMS = {
  corn: {
    name: 'Pigeon Corn',
    desc: 'A paper cone of corn, bought by a tourist for the pigeons of Venice and abandoned when the pigeons got too friendly.',
    icon(c) {
      c.fillStyle = '#e8dcc0'; poly(c, [-22, -22, 22, -22, 0, 30], '#e8dcc0');
      c.strokeStyle = '#a8987a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-22, -22); c.lineTo(0, 30); c.lineTo(22, -22); c.stroke();
      for (let k = 0; k < 9; k++) ellipse(c, -16 + (k % 5) * 8, -24 - Math.floor(k / 5) * 6, 4, 3, '#e8b020');
    },
  },
  invoice: {
    name: 'Unpaid Bill',
    desc: 'FORNACE BEPI. To Col. Vasko: one swan, hollow, with a cork in the tail. Three million lire. THIRD REMINDER. The word "third" is underlined four times.',
    icon(c) {
      c.rotate(0.12);
      c.fillStyle = '#f0e8d4'; c.fillRect(-24, -30, 48, 60);
      c.fillStyle = '#6a6a6a'; for (let k = 0; k < 5; k++) c.fillRect(-18, -20 + k * 9, 36 - (k % 2) * 10, 2);
      c.fillStyle = '#b0182a'; c.font = `700 11px ${FONT_UI}`; c.textAlign = 'center'; c.fillText('UNPAID', 0, 24);
      ellipse(c, 0, -26, 3, 3, '#3a3a3a');
    },
  },
  fakeSwan: {
    name: 'Glass Swan (Mostly)',
    desc: 'Maestro Bepi\'s swan, made with my help. Its neck has sagged, its beak has thickened, and it looks at you like it wants your sandwich. It is a goose.',
    icon(c) { drawGlassSwan(c, 0, 30, 0.3, 0.4); },
  },
  realSwan: {
    name: 'Glass Swan',
    desc: 'The real swan: elegant, flawless, and heavier than it looks. There\'s a little cork in its tail.',
    icon(c) { drawGlassSwan(c, 0, 30, 0.3, 0); },
  },
};

async function lookItemStory(id) {
  await say(G.jack, ITEMS[id].desc);
}

const LIGHT = {
  riva: { ambient: 'rgba(30,30,60,0.22)', key: 'rgba(255,200,140,0.4)', keyX: 1080 },
  murano: { ambient: 'rgba(40,14,4,0.2)', key: 'rgba(255,160,70,0.55)', keyX: 700 },
  palazzo: { ambient: 'rgba(30,10,20,0.16)', key: 'rgba(255,210,150,0.35)', keyX: 960 },
  rialto: { ambient: 'rgba(60,40,60,0.1)', key: 'rgba(255,200,160,0.45)', keyX: 1500 },
};

const SCENES = {};

// ===========================================================================
// THE FONDAMENTA — dusk, fog, a sleeping gondolier
// ===========================================================================
SCENES.riva = {
  title: 'Fondamenta Ca\' Rosa · Venice · 17:00',
  music: 'dusk', ambience: ['water', 'bells'], floor: 'Stone',
  paint: paintRiva,
  walk: [60, 1045, 1540, 1045, 1540, 850, 60, 850],
  depth: [850, 1.55, 1045, 1.9],
  light: LIGHT.riva,
  portraitBg: '#3a3a5a',
  actors() {
    return [
      makeFigure('novak', 490, 902, { id: 'novak', facing: 1, pose: 'sit', seed: 5, scale: 1.62, fixedScale: true }),
      makeFigure('toni', 825, 906, { id: 'toni', facing: -1, pose: 'sit', seed: 61, scale: 1.62, fixedScale: true, headTilt: flag('toniAwake') ? 0 : 0.3, arm: 'rest' }),
    ];
  },
  back(ctx, t) { paintGondola(ctx, 800, 745 + Math.sin(t * 1.2) * 4, 0.9, 1); },
  props: [
    { y: 939, draw: ctx => paintBench6(ctx) },
    { y: 905, draw: ctx => paintCrate6(ctx) },
    { y: 980, when: () => !flag('gotCorn'), draw: ctx => { ctx.save(); ctx.translate(1180, 975); ctx.rotate(-1.2); ctx.scale(0.8, 0.8); ITEMS.corn.icon(ctx); ctx.restore(); } },
  ],
  async enter() {
    if (flag('rivaIntro')) return;
    await rivaOpening();
  },
  hotspots: [
    { name: 'Palazzi', rect: [120, 140, 1420, 500],
      look: () => say(G.jack, 'Palaces sinking gracefully into the lagoon, one lit window at a time. Venice in December: fog, bells, and nobody here but the pigeons and the spies.') },
    { name: 'Mask Shop', rect: [1560, 380, 360, 420], at: [1480, 960], face: 1, photo: 'mask',
      look: () => say(G.jack, 'Maschere Ca\' Rosa: masks in the window, gold, black, white, and one long-nosed plague doctor. Tonight, the whole city will be wearing somebody else\'s face.'),
      use: () => say(G.jack, 'Closed. A card in the door: "Back at seven. Or eight. Venice."') },
    { name: 'Lamp', rect: [1050, 520, 70, 320],
      look: () => say(G.jack, 'A lamp coming on in the fog. Very romantic. I\'m in Venice with a goose and a seventy-year-old opera singer. Also very romantic.') },
    { name: 'Gondola', rect: [480, 640, 660, 130], at: [700, 900],
      look: () => say(G.jack, 'A gondola, black as a piano, with a red velvet seat and a steel comb on the prow. The gondolier is asleep on the crate beside it.'),
      useVerb: 'Board',
      async use() {
        if (!flag('toniAwake')) return think('I could row it myself. I could also fall in. Better to wake the gondolier.');
        if (!flag('paid')) return say(actor('toni'), 'Hey! Fifty thousand lire first, signore. Then you get in. That is the Venetian way.');
        return rowToMurano();
      } },
    { name: 'Pigeon Corn', rect: [1130, 940, 110, 70], at: [1180, 1000], when: () => !flag('gotCorn'),
      look: () => say(G.jack, 'A paper cone of corn, dropped on the stones. Somebody fed the pigeons, and the pigeons fed on somebody.'),
      async take() {
        flag('gotCorn', true); addItem('corn');
        Sound.sfx('paper');
        await say(G.jack, 'Corn. Every bird in Venice wants this. I know one in particular.');
        save();
      } },
    { name: 'Madame Novak', actor: 'novak', at: [680, 960], face: -1,
      look: () => say(G.jack, 'Madame Novak, on a bench in the fog in a fur coat, as if Venice had been arranged around her. It probably was.'),
      talk: () => talkNovak(),
      async item(id) {
        if (id === 'corn') return say(actor('novak'), 'I do not feed pigeons, darling. I have seen what they do to statues.');
        return false;
      } },
    { name: 'Toni', actor: 'toni', at: [980, 960], face: -1,
      look: () => say(G.jack, flag('toniAwake') ? 'Toni the gondolier: striped jersey, straw boater, and the outraged look of a man who has just been attacked by a goose.' : 'A gondolier, asleep on a crate of glass with his boater over his eyes. His snores are keeping the fog away.'),
      async talk() {
        const t = actor('toni');
        if (!flag('toniAwake')) {
          await say(G.jack, 'Excuse me? Signore?');
          Sound.sfx('yawn');
          await say(t, 'Zzz... fifty thousand lire... zzz... one more song... zzz...');
          return think('Asleep. Deeply. I\'d need a brass band to wake him. Or something louder.');
        }
        if (flag('paid')) return say(t, 'Murano! Hop in, signore. The goose sits at the front. She is ballast.');
        return say(t, 'Murano? At this time? Fifty thousand lire. For the goose, another fifty. She looks heavy.');
      },
      async item(id) {
        if (id !== 'corn') return false;
        if (flag('toniAwake')) return say(actor('toni'), 'No! No corn! Keep the corn away from me!');
        return wakeToni();
      } },
    { name: 'The Way Back', rect: [0, 150, 60, 700], at: [80, 960],
      look: () => say(G.jack, 'Back into the maze of alleys. Venice has four hundred bridges and I have crossed three hundred of them looking for this bench.') },
  ],
};

async function rivaOpening() {
  flag('rivaIntro', true);
  G.busy = true;
  const n = actor('novak'), j = G.jack;
  await wait(0.6);
  await say(n, 'There you are, darling. I have been sitting on this bench since four. The pigeons have proposed twice.');
  await say(j, 'Madame Novak. You got my telegram.');
  await say(n, 'I got your telegram, your postcard and your goose feathers. And I heard every word of that telephone call through my little tulip. The call to Istanbul did not come from London, darling. It came from here. The Hotel Danieli, room forty-one.');
  await say(j, 'The London buyer is in Venice?');
  await say(n, 'Collecting in person. Vasko is not handing over the aeroplane. He is handing over the launch codes, on microfilm, hidden inside a Murano glass swan.');
  await say(n, 'And the swan is the centrepiece at the Contessa Lucrezia\'s masked ball tonight. At midnight, she gives it as a gift to her guest from London. Very elegant. Very Venetian. Very criminal.');
  await say(j, 'Then we need a swan of our own.');
  await say(n, 'The glassblower who made it is Maestro Bepi, on Murano. Across the lagoon. You will need a boat, darling. And that one comes with a gondolier, although at the moment he is asleep.');
  Sound.sfx('honk');
  setObjective('Get a gondola to Murano');
  save();
  G.busy = false;
}

async function talkNovak() {
  const n = actor('novak');
  if (!flag('toniAwake')) return say(n, 'Every gondolier in Venice is asleep in December, darling. You must wake him up. Gently. Or not.');
  if (!flag('paid')) {
    G.busy = true;
    await say(G.jack, 'He wants fifty thousand lire. I have two Turkish coins and a false moustache.');
    await say(n, 'Leave it to me.');
    Sound.sfx('coin');
    await say(n, 'Signor gondolier. Fifty thousand lire, and fifty for the goose. And fifty to forget our faces.');
    await say(actor('toni'), 'Grazie, signora! What faces?');
    await say(G.jack, 'Madame Novak, I\'ll pay you back.');
    await say(n, 'Nonsense, darling. Expenses. I shall send the bill to my son.');
    await say(n, 'Go to Murano. I shall find us some masks and meet you at the Contessa\'s water gate at nine.');
    flag('paid', true);
    setObjective('Take the gondola to Murano');
    save();
    G.busy = false;
    return;
  }
  return say(n, 'Go, darling. Murano. And don\'t let the Maestro sell you a chandelier.');
}

async function wakeToni() {
  const t = actor('toni');
  G.busy = true;
  removeItem('corn');
  await say(G.jack, 'A little corn on the hat. For luck.');
  Sound.sfx('paper');
  await wait(0.5);
  await think('Come on, Colonel. Dinner is served.');
  Sound.sfx('honk'); await wait(0.25); Sound.sfx('honk');
  t.headTilt = 0; t.arm = 'panic';
  Sound.sfx('shriek');
  await say(t, 'Mamma mia! A goose! A goose is eating my hat!');
  Sound.sfx('honk');
  await say(t, 'Via! Go away! Shoo! I am a gondolier, not a picnic!');
  t.arm = 'rest';
  flag('toniAwake', true);
  await say(G.jack, 'Sorry to wake you. I need to get to Murano.');
  await say(t, 'Murano? At this time? Fifty thousand lire. For the goose, another fifty. She looks heavy.');
  setObjective('Find fifty thousand lire for Toni');
  save();
  G.busy = false;
}

async function rowToMurano() {
  G.busy = true;
  Sound.sfx('splash');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  await TextScreen.play(LAGOON_PAGES, 'dusk');
  startPlay();
  G.sceneId = null; G.fade = 1;
  await gotoScene('murano', 1760, 960, -1, { instant: true });
  G.busy = false;
}
const LAGOON_PAGES = [
  { kicker: 'THE LAGOON  ·  18:10', amb: ['water', 'bells'], text: 'Half an hour across black water in the fog. Toni sings the whole way. The goose sits in the prow like a figurehead, and hisses at every passing vaporetto.' },
];

// ===========================================================================
// MURANO — Maestro Bepi's furnace
// ===========================================================================
SCENES.murano = {
  title: 'Fornace Bepi · Murano · 18:40',
  music: 'furnace', ambience: ['furnace'], floor: 'Stone',
  paint: paintMurano,
  walk: [80, 1045, 1800, 1045, 1800, 860, 80, 860],
  depth: [860, 1.58, 1045, 1.9],
  light: LIGHT.murano,
  portraitBg: '#5a2a14',
  actors() {
    return [
      makeFigure('bepi', 480, 900, { id: 'bepi', facing: 1, arm: 'hold', seed: 62, depthScale: true }),
      makeFigure('toni', 1000, 890, { id: 'toni', facing: -1, arm: flag('gondolier') ? 'rest' : 'warm', seed: 61, depthScale: true, look: flag('gondolier') ? LOOKS.toniVest : LOOKS.toni }),
    ];
  },
  props: [
    { y: 700, when: () => !flag('gotInvoice'), draw: ctx => { ctx.fillStyle = '#6a6e72'; ctx.fillRect(1208, 560, 4, 40); ctx.save(); ctx.translate(1210, 610); ctx.scale(0.8, 0.8); ITEMS.invoice.icon(ctx); ctx.restore(); } },
  ],
  async enter() {
    if (flag('muranoIntro')) return;
    flag('muranoIntro', true);
    G.busy = true;
    await wait(0.5);
    await say(actor('toni'), 'Ahh, the furnace. I warm my hands, signore. Take your time. I am paid by the hour. By the signora.');
    await think('Murano: every glass chandelier in the world was born on this island. It is also the hottest room in Venice in December.');
    setObjective('Get Maestro Bepi to make a second swan');
    save();
    G.busy = false;
  },
  hotspots: [
    { name: 'Furnace', rect: [440, 360, 520, 460], at: [700, 960],
      look: () => say(G.jack, 'The furnace, white-hot at the heart. Twelve hundred degrees. The goose is keeping a respectful distance for once.'),
      use: () => say(actor('bepi'), 'Touch my furnace and you will be a very small glass man.') },
    { name: 'Glass on the Shelves', rect: [1260, 180, 560, 460], at: [1500, 960],
      look: () => say(G.jack, 'Vases, bowls and bottles in every colour of a boiled sweet. One of them is shaped like a Pope. I think by accident.') },
    { name: 'Glass Swans', rect: [1270, 660, 400, 130], at: [1460, 960], photo: 'swan',
      look: () => say(G.jack, 'Three glass swans on a shelf. The first two are perfect. The third one has a slight droop, like a swan on a Monday.'),
      take: () => say(actor('bepi'), 'Put that down! Those are for the Queen of Denmark. Well, one is. The droopy one is for my mother-in-law.') },
    { name: 'Blowpipes', rect: [50, 400, 150, 420],
      look: () => say(G.jack, 'Long iron blowpipes in a rack. You put one end in the fire and the other in your mouth, and hope you don\'t get them mixed up.') },
    { name: 'Sign', rect: [500, 150, 420, 50],
      look: () => say(G.jack, 'Fornace Bepi, since 1921. Maestro Bepi looks as if he has been here since 1921 personally.') },
    { name: 'Nail of Bills', rect: [1180, 560, 70, 110], at: [1210, 960], when: () => !flag('gotInvoice'), photo: 'invoice',
      look: () => say(G.jack, 'Bills, spiked on a nail by the door. The one on top has UNPAID stamped on it in red, three times.'),
      async take() {
        flag('gotInvoice', true); addItem('invoice');
        Sound.sfx('paper');
        await say(G.jack, 'To Colonel Vasko: one swan, hollow, with a cork in the tail. Three million lire. Third reminder.');
        await think('Vasko ordered the swan, and never paid for it. That sounds like Vasko.');
        save();
      } },
    { name: 'Maestro Bepi', actor: 'bepi', at: [660, 960], face: -1,
      look: () => say(G.jack, 'Maestro Bepi: eighty years old, eyebrows singed off in 1950 and never grown back, and arms like a blacksmith.'),
      talk: () => talkBepi(),
      async item(id) {
        if (id === 'invoice') return bepiAgrees();
        if (id === 'fakeSwan') return say(actor('bepi'), 'Take it away. Every time I look at it, it looks back.');
        return false;
      } },
    { name: 'Toni', actor: 'toni', at: [1150, 960], face: -1,
      look: () => say(G.jack, flag('gondolier') ? 'Toni, in his vest, very happy to be missing the Contessa\'s party.' : 'Toni, warming his hands at the furnace and humming O Sole Mio. Badly.'),
      async talk() {
        const t = actor('toni');
        if (flag('gondolier')) return say(t, 'Remember: O Sole Mio. Eleven times. And smile. She tips if you smile.');
        if (!has('fakeSwan')) {
          await say(t, 'Take your time, signore. I am in no hurry. Tonight I must sing at the Contessa\'s ball. I hate the Contessa\'s ball.');
          await say(G.jack, 'Why?');
          return say(t, 'She makes me sing O Sole Mio. Eleven times. It is a song from Naples! I am Venetian! It is like asking a Scotsman to sing in Welsh!');
        }
        return toniSwap();
      } },
    { name: 'Door to the Quay', rect: [1820, 290, 100, 530], at: [1780, 960], exitLabel: 'Back to the gondola',
      async exit() {
        if (!has('fakeSwan')) return think('Not without a swan of my own.');
        if (!flag('gondolier')) return think('I have a swan. Now I need a way into the ball. Toni is supposed to be singing at it.');
        return rowToBall();
      } },
  ],
};

async function talkBepi() {
  const b = actor('bepi');
  if (has('fakeSwan') || flag('swanMade')) return say(b, 'Go. Take your goose. Both of them.');
  if (!flag('metBepi')) {
    flag('metBepi', true);
    await say(b, 'Closed! The shop is closed. The furnace is never closed, but the shop is closed.');
    await say(G.jack, 'Maestro, I need a glass swan. The same as the one you made for the Contessa\'s ball.');
    await say(b, 'The same? The SAME? Bepi does not make the same. Every swan of Bepi is unique. Like a snowflake. Like a fingerprint. Like my mother-in-law.');
    await say(b, 'Besides, that swan was not for the Contessa. A foreign colonel ordered it. Hollow, with a little cork in the tail. What does a man put in a swan? I did not ask.');
    return;
  }
  await say(b, 'No copies. No discounts. No geese in the workshop.');
  Sound.sfx('honk');
  await say(b, '...No geese!');
}

async function bepiAgrees() {
  const b = actor('bepi'), j = G.jack;
  G.busy = true;
  await say(j, 'The foreign colonel who ordered that swan. Did he ever pay you?');
  await say(b, 'Pay? PAY? Three reminders I send! Three! The Colonel says: "It is an honour for you to work for me." An honour does not pay for gas, signore!');
  await say(j, 'What if I told you that swan is going to make him fifty million dollars tonight? Unless somebody swaps it for another one.');
  await wait(0.6);
  await say(b, '...For the Colonel, I make an exception. For the Colonel, I make a swan he will never forget.');
  removeItem('invoice');
  await say(b, 'But my assistant has gone home. He has a cold. You will work the bellows. When I say blow, you blow.');
  Sound.sfx('whoosh');
  await say(b, 'The gather. Now, the body. Blow! Gently!');
  const c1 = await choose([
    { text: '(Blow gently.)', value: 'gentle' },
    { text: '(Blow as hard as you can.)', value: 'hard' },
    { text: '(Let the goose stand on the bellows.)', value: 'goose' },
  ]);
  if (c1 === 'gentle') { Sound.sfx('whoosh'); await say(b, 'Too gently! It is a swan, not a soap bubble!'); }
  if (c1 === 'hard') { Sound.sfx('whoosh'); Sound.sfx('whoosh'); await say(b, 'Too hard! Now it is a swan that has eaten a swan!'); }
  if (c1 === 'goose') { Sound.sfx('honk'); Sound.sfx('whoosh'); await say(b, 'The goose blows better than my assistant. Do not tell him.'); }
  await say(b, 'Now the neck. I pull, you turn the pipe. Slowly, slowly...');
  const c2 = await choose([
    { text: '(Turn it slowly.)', value: 'slow' },
    { text: '(Sneeze.)', value: 'sneeze' },
    { text: '"Is it meant to droop like that?"', value: 'droop' },
  ]);
  if (c2 === 'slow') await say(b, 'Slowly! Not backwards!');
  if (c2 === 'sneeze') { Sound.sfx('pop'); await say(b, 'Bless you. And bless the neck, because now it has a bend in it.'); }
  if (c2 === 'droop') await say(b, 'No. Nothing I make is meant to droop. Except my mother-in-law\'s swan.');
  Sound.sfx('clink');
  await wait(0.8);
  await say(b, 'Finished. Cooled with magic, and a bucket.');
  await say(b, 'It is... a goose. A goose that wishes it were a swan. Like my brother-in-law.');
  Sound.sfx('honk');
  await say(j, 'It\'s perfect. In a dark ballroom, after three glasses of prosecco, nobody will know the difference.');
  await say(b, 'Everybody will know the difference. But the Colonel will be embarrassed, and that, signore, is priceless.');
  addItem('fakeSwan');
  flag('swanMade', true);
  setObjective('Find a way into the Contessa\'s ball');
  save();
  G.busy = false;
}

async function toniSwap() {
  const t = actor('toni'), j = G.jack;
  G.busy = true;
  await say(j, 'Toni. How would you like the night off?');
  await say(t, 'The night off? From the Contessa? From O Sole Mio?');
  await say(j, 'I go to the ball in your place. You row, and you wait at the water gate. I sing.');
  await say(t, 'Signore, you are an angel. An angel with a goose. Take the jersey! Take the hat! Take the song!');
  Sound.sfx('cloth');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  flag('gondolier', true); G.jack.look = LOOKS.jackGondolier;
  t.look = LOOKS.toniVest; t.arm = 'rest';
  await wait(0.4);
  G.fadeTo = 0; await waitUntil(() => G.fade < 0.05);
  await say(t, 'Bellissimo! You look like a real gondolier. Only more nervous.');
  await say(j, 'Anything else I should know?');
  await say(t, 'O Sole Mio. Eleven times. And smile. She tips if you smile.');
  setObjective('Back to the gondola, and on to the ball');
  save();
  G.busy = false;
}

async function rowToBall() {
  G.busy = true;
  Sound.sfx('door');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  await TextScreen.play(BALL_PAGES, 'dusk');
  startPlay();
  G.sceneId = null; G.fade = 1;
  await gotoScene('palazzo', 180, 960, 1, { instant: true });
  G.busy = false;
}
const BALL_PAGES = [
  { kicker: 'THE GRAND CANAL  ·  21:00', amb: ['water', 'partyMurmur'], text: 'Palazzo Ca\' Rosa, every window blazing. Gondolas nose up to the water gate, and masked guests step out in silk and feathers. One gondolier, new to the job, rams the steps.' },
  { kicker: 'THE WATER GATE  ·  21:10', amb: ['water', 'partyMurmur'], text: 'Madame Novak is waiting in a golden mask, with a second mask for the goose. The footman looks at the goose, and at the mask, and says nothing. The goose stays in the gondola with Toni.' },
];

// ===========================================================================
// THE PALAZZO — the Contessa's masked ball
// ===========================================================================
SCENES.palazzo = {
  title: 'Palazzo Ca\' Rosa · The Ballroom · 21:15',
  music: 'ball', ambience: ['partyMurmur'], floor: 'Marble',
  paint: paintBallroom6,
  walk: [100, 1045, 1860, 1045, 1860, 868, 100, 868],
  depth: [868, 1.62, 1045, 1.95],
  light: LIGHT.palazzo,
  portraitBg: '#3a1a2a',
  actors() {
    const dancing = flag('dancing');
    return [
      makeFigure('lucrezia', 420, 900, { id: 'lucrezia', facing: 1, arm: 'rest', seed: 63, depthScale: true }),
      makeFigure('novak', dancing ? 820 : 640, dancing ? 960 : 920, { id: 'novak', facing: 1, arm: dancing ? 'hug' : 'rest', seed: 5, depthScale: true, mask: 'domino', maskColor: '#c9a13b' }),
      makeFigure('kolar', dancing ? 910 : 1260, dancing ? 960 : 900, { id: 'kolar', facing: dancing ? -1 : -1, arm: dancing ? 'hug' : 'behind', seed: 17, depthScale: true, mask: 'domino', maskColor: '#1a1a1a' }),
      makeFigure('waiter', 1460, 900, { id: 'waiter', facing: -1, arm: 'tray', seed: 64, depthScale: true }),
      makeFigure('plague', 1720, 890, { id: 'plague', facing: -1, arm: 'hold', seed: 65, depthScale: true }),
      makeFigure('hollis', 1080, 1000, { id: 'hollis', facing: -1, arm: 'rest', seed: 59, depthScale: true, mask: 'domino', maskColor: '#e8e0cc' }),
      makeFigure('brunner', 210, 910, { id: 'brunner', facing: 1, arm: 'behind', seed: 58, depthScale: true, mask: 'bauta', maskColor: '#f0ece4' }),
    ];
  },
  back(ctx, t) { drawChandelier(ctx, 700, 190, t); drawChandelier(ctx, 1300, 190, t); drawMaskedDancers(ctx, t); },
  props: [{ y: 800, draw: (ctx, t) => paintSwanPlinth(ctx, t, !!flag('swapped')) }],
  update(dt, t) {
    // Novak and Kolar turning in a slow waltz; the plague doctor stirring his tea
    if (flag('dancing') && !G.busy) {
      const n = actor('novak'), k = actor('kolar');
      if (n && k) { const a = t * 0.6; n.x = 860 + Math.cos(a) * 60 - 45; k.x = 860 + Math.cos(a) * 60 + 45; n.facing = 1; k.facing = -1; }
    }
    const p = actor('plague');
    if (p && !G.busy) p.arm = Math.sin(t * 3) > 0 ? 'hold' : 'wrist';
  },
  async enter() {
    if (flag('ballIntro')) return;
    flag('ballIntro', true);
    await ballArrival();
  },
  hotspots: [
    { name: 'Windows', rect: [430, 170, 1070, 530],
      look: () => say(G.jack, 'The Grand Canal at night, through Gothic windows five hundred years old. Out there, Toni and the Colonel are waiting in the gondola. One of them is eating a mask.') },
    { name: 'Orchestra', rect: [40, 420, 310, 180],
      look: () => say(G.jack, 'A string quartet playing a waltz. The cellist has fallen asleep, and the other three are covering for him.') },
    { name: 'The Swan', rect: [1030, 470, 150, 330], at: [1100, 960], photo: 'swan',
      look: async () => {
        flag('sawSwan', true);
        if (flag('swapped')) return say(G.jack, 'My swan, under the dome. It\'s staring at the guests. The guests are staring back. Nobody has said anything yet.');
        await say(G.jack, 'The swan, on a marble plinth under a glass dome, lit like a jewel in a museum. Kolar is standing next to it like a museum guard who has been told there will be no pay rise.');
        if (!flag('dancing')) { flag('swanPlan', true); setObjective('Get Kolar away from the swan'); save(); }
      },
      async take() {
        if (!flag('dancing')) {
          await say(actor('kolar'), 'Step away from the swan, gondolier. Nobody touches the swan until midnight.');
          if (!flag('swanPlan')) { flag('swanPlan', true); setObjective('Get Kolar away from the swan'); save(); }
          return;
        }
        return say(G.jack, 'I can\'t walk out with it under my arm. I need to leave something in its place.');
      },
      async item(id) {
        if (id !== 'fakeSwan') return false;
        if (!flag('dancing')) return say(actor('kolar'), 'Step away from the swan, gondolier. And take your... goose with you.');
        return swapSwans();
      } },
    { name: 'Tea Table', rect: [1560, 580, 300, 220], at: [1560, 960], face: 1,
      look: () => say(G.jack, 'A silver urn, a row of teacups, and a card: Prosecco, Tè. Every guest in the room is drinking prosecco. One cup of tea has been poured.') },
    { name: 'Contessa Lucrezia', actor: 'lucrezia', at: [580, 960], face: -1,
      look: () => say(G.jack, 'Contessa Lucrezia: a gold mask, violet silk, a palazzo on the Grand Canal and a laugh you could hear in Padua.'),
      async talk() {
        const l = actor('lucrezia');
        await say(l, 'Gondolier! You sing again at midnight. And at midnight, I give the swan to my guest from London. A little gift. He has paid for it already.');
        await say(G.jack, 'Which guest is from London, Contessa?');
        await say(l, 'Darling, it is a masked ball. Nobody is from anywhere.');
      } },
    { name: 'Madame Novak', actor: 'novak', at: [480, 960], face: 1,
      look: () => say(G.jack, flag('dancing') ? 'Madame Novak, waltzing with Kolar and leading. He hasn\'t noticed.' : 'Madame Novak in a golden mask. Somehow she is still the most recognisable person in the room.'),
      talk: () => talkNovakBall() },
    { name: 'Captain Kolar', actor: 'kolar', at: [1400, 960], face: -1,
      look: () => say(G.jack, flag('dancing') ? 'Kolar, waltzing, counting under his breath: one two three, one two three.' : 'A tall man in a black mask, standing by the swan with his hands behind his back. The mask doesn\'t help. It\'s Kolar.'),
      async talk() {
        const k = actor('kolar');
        if (flag('dancing')) return say(k, 'One two three, one two three... Not now, gondolier!');
        await say(k, 'Gondolier. Have we met?');
        await say(G.jack, 'Everybody in Venice has met a gondolier, signore.');
        await say(k, '...True.');
      } },
    { name: 'Waiter', actor: 'waiter', at: [1340, 960], face: 1,
      look: () => say(G.jack, 'A waiter with a tray of prosecco, gliding through the crowd like a swan. A real one.'),
      talk: () => talkWaiter() },
    { name: 'The Plague Doctor', actor: 'plague', at: [1580, 960], face: 1,
      look: async () => {
        await say(G.jack, 'A plague doctor: black hat, black cloak, and a long white beak. He is stirring a cup of tea. Very. Loudly.');
        if (flag('teaClue')) { flag('buyerFound', true); await think('The only man in Venice drinking tea at a ball. "Very English," Leyla said. "He stirs his tea very loudly."'); if (flag('swapped')) setObjective('Get the swan out: back to the gondola'); save(); }
      },
      async talk() {
        await say(G.jack, 'Buonasera, dottore.');
        Sound.sfx('clink'); await wait(0.3); Sound.sfx('clink'); await wait(0.3); Sound.sfx('clink');
        await think('He isn\'t going to talk. He\'s going to stir that tea until it confesses.');
      } },
    { name: 'Mr Hollis', actor: 'hollis', at: [1220, 1000], face: -1,
      look: () => say(G.jack, 'A small white mask, a huge white hat, and a Texan accent you could hear from Houston. Mr Hollis, incognito.'),
      talk: () => say(actor('hollis'), 'Howdy, gondola man! Don\'t tell anybody, but I\'m in disguise. Lost out on that invisible airplane, so I\'m buying me a palazzo. Sinks a little, but so does Houston.') },
    { name: 'Herr Brunner', actor: 'brunner', at: [340, 960], face: -1,
      look: () => say(G.jack, 'A white bauta mask with a banker\'s chin underneath it. Herr Brunner of Zürich.'),
      talk: () => say(actor('brunner'), 'I am not here. If you see me, you did not. If I see you, I shall invoice you.') },
    { name: 'Water Gate', rect: [0, 250, 90, 560], at: [140, 960], exitLabel: 'Down to the water gate',
      async exit() {
        if (!flag('swapped')) return think('Not without the swan.');
        if (!flag('buyerFound')) return think('Not yet. I need to know who the London buyer is. Somebody in this room.');
        return midnight();
      } },
  ],
};

async function ballArrival() {
  G.busy = true;
  const l = actor('lucrezia'), j = G.jack;
  await wait(0.5);
  await say(l, 'Gondolier! You are late! Where is Toni?');
  await say(j, 'Toni has a cold, Contessa. I\'m his cousin. Giacomo.');
  await say(l, 'Giacomo. You will sing. Now.');
  const c = await choose([
    { text: '(Sing "O Sole Mio".)', value: 'sole' },
    { text: '(Sing "Volare".)', value: 'volare' },
    { text: '(Sing "God Save the Queen".)', value: 'queen' },
  ]);
  if (c === 'sole') {
    await say(j, 'O sole mio... sta nfronte a te...');
    await say(l, 'Terrible. Wonderful. Toni sings it exactly the same. Again at midnight!');
  }
  if (c === 'volare') {
    await say(j, 'Volare, oh oh... cantare, oh oh oh oh...');
    await say(l, 'That is not O Sole Mio. But the Americans are clapping. Again at midnight! The right one!');
  }
  if (c === 'queen') {
    await say(j, 'God save our gracious Queen...');
    Sound.sfx('clink');
    await say(l, 'What a strange Venetian song. The man in the beak has stopped stirring his tea. Again at midnight!');
  }
  await say(actor('novak'), 'Darling. You were magnificent. Nobody will ever forget it, which is the problem.');
  await think('Somewhere in this room is the swan. And somewhere in this room is the man from London.');
  setObjective('Find the swan, and swap it for Bepi\'s');
  save();
  G.busy = false;
}

async function talkNovakBall() {
  const n = actor('novak');
  if (flag('dancing')) return say(n, 'Not now, darling. The Captain is about to step on my foot for the ninth time.');
  if (!flag('swanPlan')) return say(n, 'Find the swan first, darling. Then tell me who I have to dance with.');
  G.busy = true;
  await say(G.jack, 'Kolar is guarding the swan. I need him somewhere else for five minutes.');
  await say(n, 'Five minutes? Darling, I could keep a man busy for five years. I did, twice.');
  await walkTo(1160, 920, n, 0.9);
  await say(n, 'Captain. You look like a man who waltzes beautifully.');
  await say(actor('kolar'), 'I... I am on duty, madame.');
  await say(n, 'So is the orchestra, and look at them.');
  await say(actor('kolar'), '...One dance.');
  flag('dancing', true);
  const k = actor('kolar');
  walkTo(900, 960, n, 0.9); await walkTo(990, 960, k, 0.9);
  n.arm = 'hug'; k.arm = 'hug';
  setObjective('Swap the swans');
  save();
  G.busy = false;
}

async function talkWaiter() {
  const w = actor('waiter');
  if (flag('teaClue')) return say(w, 'More prosecco, gondolier? No. Gondoliers do not drink on duty. Only on land.');
  await say(w, 'Prosecco, signore? No, you are staff. Look busy, then.');
  await say(G.jack, 'Is anyone here drinking tea?');
  await say(w, 'Tea? At a ball? Only one guest has asked for tea all night. That one, in the beak. Four sugars, and he stirs it like he is angry with it.');
  flag('teaClue', true);
  await think('"Very English. He stirs his tea very loudly." Leyla, in Istanbul, about the man on the telephone.');
  flag('buyerFound', true);
  if (flag('swapped')) setObjective('Get the swan out: back to the gondola');
  save();
}

async function swapSwans() {
  G.busy = true;
  removeItem('fakeSwan');
  await walkTo(1100, 940);
  G.jack.arm = 'reach';
  Sound.sfx('clink'); await wait(0.5);
  Sound.sfx('ting'); await wait(0.4);
  flag('swapped', true);
  addItem('realSwan');
  G.jack.arm = 'rest';
  await say(G.jack, 'One swan out. One goose in.');
  await say(actor('hollis'), 'Say, is that swan lookin\' at me funny?');
  await think('Now: which of these masks is the man from London?');
  setObjective(flag('buyerFound') ? 'Get the swan out: back to the gondola' : 'Find out which guest is the London buyer');
  save();
  G.busy = false;
}

async function midnight() {
  G.busy = true;
  const l = actor('lucrezia'), k = actor('kolar'), n = actor('novak'), p = actor('plague'), h = actor('hollis');
  for (let i = 0; i < 4; i++) { Sound.sfx('bell'); await wait(0.5); }
  await say(l, 'Midnight! Midnight, my darlings! And now, the moment we have all been waiting for!');
  await say(l, 'For my guest from London, a little gift from Venice: a swan of Murano glass!');
  k.arm = 'rest'; n.arm = 'rest'; flag('dancing', false);
  walkTo(1240, 900, k, 1.2);
  await walkTo(1000, 930, l, 1.1);
  await wait(0.4);
  Sound.sfx('clink');
  await say(l, 'Behold!');
  await wait(1);
  await say(h, 'Well, I\'ll be. That ain\'t a swan. That\'s a goose.');
  Sound.sfx('applause');
  await say(l, '...It is modern art!');
  await wait(0.5);
  p.arm = 'point'; p.facing = -1;
  await say(p, 'Captain. The gondolier.');
  k.facing = -1;
  await say(k, 'The gondolier... the baker... the waiter... HARROW!');
  G.jack.facing = -1;
  await say(G.jack, 'Buonanotte, everybody! Same time next year!');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  G.busy = false;
  GondolaRun.start();
}

// ===========================================================================
// THE RIALTO — dawn
// ===========================================================================
SCENES.rialto = {
  title: 'The Rialto · 06:40',
  music: 'dawn', ambience: ['water', 'gulls', 'bells'], floor: 'Stone',
  paint: paintRialto,
  walk: [60, 1045, 1860, 1045, 1860, 850, 60, 850],
  depth: [850, 1.55, 1045, 1.9],
  light: LIGHT.rialto,
  portraitBg: '#8a5a6a',
  actors() { return [makeFigure('novak', 1000, 920, { id: 'novak', facing: -1, arm: 'rest', seed: 5, depthScale: true })]; },
  async enter() {
    if (flag('rialtoIntro')) return;
    flag('rialtoIntro', true);
    G.busy = true;
    const n = actor('novak');
    await wait(0.6);
    await say(n, 'There you are, darling. I took a water taxi. It had a heater.');
    await say(G.jack, 'I rowed across Venice with the Karvonian army behind me.');
    await say(n, 'I know, darling. You woke up the whole city. The Patriarch of Venice has complained.');
    setObjective('Open the swan with Madame Novak');
    save();
    G.busy = false;
  },
  hotspots: [
    { name: 'The Rialto Bridge', rect: [440, 280, 1060, 390],
      look: () => say(G.jack, 'The Rialto at dawn, pink and gold, with the shutters still down on every shop. Four hundred years of people meeting here to do business they shouldn\'t.') },
    { name: 'Market Stall', rect: [1560, 640, 350, 160],
      look: () => say(G.jack, 'The fish market isn\'t open yet. The gulls are already queueing.') },
    { name: 'Madame Novak', actor: 'novak', at: [820, 960], face: 1,
      look: () => say(G.jack, 'Madame Novak, up all night and still looking better than me.'),
      talk: () => say(actor('novak'), 'Well, darling? Let us see what a swan keeps in its tail.'),
      async item(id) {
        if (id !== 'realSwan') return false;
        return theUnmasking();
      } },
  ],
};

async function theUnmasking() {
  G.busy = true;
  const n = actor('novak'), j = G.jack;
  await say(j, 'One swan. With a cork in its tail.');
  Sound.sfx('pop');
  await say(n, 'And inside... a roll of microfilm. Tiny. Clever. Launch codes, darling. For every Nightglass Vasko will ever build.');
  await wait(0.5);
  Sound.sfx('stepStone');
  const p = makeFigure('plague', 1980, 930, { id: 'plague', facing: -1, arm: 'rest', seed: 65, depthScale: true });
  p.scale = depthScale(930); G.actors.push(p);
  await walkTo(1400, 930, p, 0.8);
  await say(p, 'I believe that belongs to me. I did pay for it.');
  j.facing = 1; n.facing = 1;
  Sound.sfx('honk');
  await say(p, 'Good morning, Mother.');
  await wait(0.8);
  Sound.sfx('cloth');
  removeActor('plague');
  const c = makeFigure('control', 1400, 930, { id: 'control', facing: -1, arm: 'rest', seed: 65, depthScale: true });
  c.scale = depthScale(930); G.actors.push(c);
  await wait(0.8);
  await say(n, '...Rupert?');
  await say(j, 'Control.');
  await say(c, 'Hello, Harrow. You\'ve had a busy week. The train, the mountain, Istanbul, and now my swan.');
  await say(n, 'Rupert Novak, what on earth do you think you are doing?');
  await say(c, 'Buying an aeroplane, Mother. Well, the codes for one. Then selling them to the Americans for twice the price. Have you seen what the Service pays in pensions?');
  await say(n, 'I sent you to the best schools in England!');
  await say(c, 'And that, Mother, is where I learned it.');
  n.facing = -1;
  await say(n, 'He was always a difficult boy.');
  n.facing = 1;
  await say(c, 'The film, Harrow.');
  await walkTo(1180, 930, n, 0.8);
  n.arm = 'point';
  await say(n, 'You will have to shoot your mother first, Rupert.');
  await say(c, 'Don\'t be dramatic, Mother.');
  Sound.sfx('honk');
  await wait(0.4);
  await say(c, '...Very well. Keep the film. Keep the swan. Keep the goose. Somebody should.');
  await say(c, 'But you won\'t keep much else, Harrow. I\'m afraid this is where your career ends.');
  c.facing = 1;
  await walkTo(1980, 930, c, 0.9);
  removeActor('control');
  Sound.sfx('car');
  n.arm = 'rest'; n.facing = -1;
  await say(j, 'What did he mean by that?');
  await say(n, 'With Rupert, darling, it always means paperwork.');
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
    const sc = G.sceneId;
    if (sc === 'riva') return flag('rivaIntro');
    return ['murano', 'rialto'].includes(sc);
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
  if (sc === 'riva') {
    if (!flag('toniAwake')) return think(has('corn') ? 'Corn on a sleeping gondolier\'s hat. The Colonel would do the rest.' : 'The gondolier is fast asleep. Something on the quay by the lamp might get a certain bird interested in him.');
    if (!flag('paid')) return think('Fifty thousand lire. Madame Novak has never let me pay for anything.');
    return think('The gondola is waiting. Murano.');
  }
  if (sc === 'murano') {
    if (!has('fakeSwan') && !flag('swanMade')) return think(has('invoice') ? 'Maestro Bepi might change his mind about copies if he saw that unpaid bill again.' : 'Bepi won\'t copy the swan. There are bills on a nail by the door.');
    if (!flag('gondolier')) return think('Toni has to sing at the Contessa\'s ball tonight, and he hates it.');
    return think('Back to the gondola, through the door on the right.');
  }
  if (sc === 'palazzo') {
    if (!flag('swanPlan')) return think('The swan is on the plinth in the middle of the room. I should take a closer look.');
    if (!flag('dancing')) return think('Kolar won\'t leave the swan. But Madame Novak could make any man leave anything.');
    if (!flag('swapped')) return think('Kolar is dancing. Bepi\'s swan goes on the plinth, now.');
    if (!flag('buyerFound')) return think('The London buyer "stirs his tea very loudly". The waiter would know who asked for tea.');
    return think('Out through the water gate, before midnight.');
  }
  if (sc === 'rialto') return think('Madame Novak is waiting. Show her the swan.');
}
