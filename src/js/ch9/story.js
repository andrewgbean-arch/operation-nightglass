// ---------------------------------------------------------------------------
// Chapter Nine: Thin Air — items, scenes, hotspots, dialogue, puzzles.
// Grindelhorn, in the Swiss Alps. Vasko's fleet waits in a hangar under the
// glacier; the money for it went through Herr Brunner's bank, whose vault is
// cut into the same mountain. Jack becomes a ski instructor, gives the worst
// skier in Switzerland a lesson, swaps a cuckoo, and climbs a cable.
// ---------------------------------------------------------------------------

const ITEMS = {
  keycard: {
    name: 'Brunner\'s Pass',
    desc: 'A steel card on a chain: BANK BRUNNER & CIE, GLETSCHERTRESOR. It opens the private cable car, and the vault at the top. It still has snow in the chain.',
    icon(c) {
      c.rotate(-0.15);
      c.fillStyle = '#b8bcc4'; rrect(c, -30, -18, 60, 36, 5); c.fill(); c.fillStyle = '#2a4a8a'; c.fillRect(-30, -10, 60, 8);
      c.fillStyle = '#1a1a1a'; c.font = `700 8px ${FONT_UI}`; c.textAlign = 'center'; c.fillText('BRUNNER & CIE', 0, 12);
      c.strokeStyle = '#8a8a8a'; c.lineWidth = 2; c.beginPath(); c.arc(-34, -20, 8, 0, 7); c.stroke();
    },
  },
  cuckoo: {
    name: 'A Spare Cuckoo',
    desc: 'A little carved wooden cuckoo on a spring, from Frau Zimmerli\'s tray of forty-seven. It says "cuckoo" and nothing else. An honest bird.',
    icon(c) {
      ellipse(c, 0, 0, 22, 14, '#6a4a2a'); ellipse(c, 16, -10, 10, 9, '#6a4a2a'); poly(c, [24, -12, 36, -9, 24, -6], '#e8902a');
      ellipse(c, 18, -12, 2, 2, '#111'); c.strokeStyle = '#8a8a8a'; c.lineWidth = 2; c.beginPath(); for (let k = 0; k < 5; k++) c.lineTo(-10 + k * 5, 14 + (k % 2) * 6); c.stroke();
    },
  },
  detonator: {
    name: 'Vasko\'s Cuckoo',
    desc: 'Vasko\'s cuckoo: heavy, metal inside, with two wires in its tail. At noon it pops out, closes a circuit, and blows the ice door off Vasko\'s hangar. Now it just sits in my pocket, sulking.',
    icon(c) {
      ellipse(c, 0, 0, 22, 14, '#3a2a1a'); ellipse(c, 16, -10, 10, 9, '#3a2a1a'); poly(c, [24, -12, 36, -9, 24, -6], '#8a8a8a');
      ellipse(c, 18, -12, 2, 2, '#d82a2a'); c.strokeStyle = '#d82a2a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-20, 4); c.lineTo(-34, 16); c.stroke(); c.strokeStyle = '#f0c030'; c.beginPath(); c.moveTo(-20, 0); c.lineTo(-34, 8); c.stroke();
    },
  },
};

async function lookItemStory(id) {
  await say(G.jack, ITEMS[id].desc);
}

const LIGHT = {
  village: { ambient: 'rgba(40,40,70,0.2)', key: 'rgba(255,215,170,0.35)', keyX: 1000 },
  workshop: { ambient: 'rgba(40,20,8,0.18)', key: 'rgba(255,230,180,0.35)', keyX: 1570 },
  vault: { ambient: 'rgba(30,34,40,0.12)', key: 'rgba(255,245,220,0.3)', keyX: 1100 },
};

const SCENES = {};

// ===========================================================================
// THE VILLAGE — Grindelhorn, dusk
// ===========================================================================
SCENES.village = {
  title: 'Grindelhorn · The Swiss Alps · 16:30',
  music: 'alpine', ambience: ['snowWind', 'bells'], floor: 'Snow',
  paint: paintVillage,
  walk: [60, 1045, 1880, 1045, 1880, 872, 60, 872],
  depth: [872, 1.58, 1045, 1.9],
  light: LIGHT.village,
  portraitBg: '#4a5070',
  actors() {
    const list = [makeFigure('sepp', 560, 900, { id: 'sepp', facing: 1, arm: 'rest', seed: 91, depthScale: true })];
    if (!flag('lessonDone')) list.push(makeFigure('brunnerSki', 1240, 920, { id: 'brunnerSki', facing: -1, arm: 'rest', seed: 58, depthScale: true }));
    return list;
  },
  props: [
    { y: 1000, when: () => flag('lessonDone') && !flag('gotCard'), draw: ctx => { ctx.save(); ctx.translate(700, 990); ctx.scale(0.8, 0.8); ITEMS.keycard.icon(ctx); ctx.restore(); ellipse(ctx, 680, 985, 60, 12, 'rgba(255,255,255,0.8)'); } },
    { y: 890, when: () => flag('lessonDone'), draw: ctx => { ctx.fillStyle = '#f4f6f8'; ctx.beginPath(); ctx.ellipse(700, 880, 120, 50, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#b8bcc4'; ctx.fillRect(660, 820, 8, 60); ctx.fillRect(720, 830, 8, 50); } },
  ],
  front(ctx, t) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let k = 0; k < 70; k++) { const x = (k * 263 + t * (18 + (k % 5) * 6)) % W, y = (k * 131 + t * (36 + (k % 7) * 9)) % H; ctx.fillRect(x, y, 3, 3); }
  },
  async enter() {
    if (flag('villageIntro')) return;
    await villageOpening();
  },
  hotspots: [
    { name: 'The Mountains', rect: [0, 40, 1480, 460],
      look: () => say(G.jack, 'The Eisberg, and its glacier, catching the last of the sun. Somewhere under all that ice there\'s a hangar, twelve black aircraft, and a very pleased Colonel.') },
    { name: 'Cable Car', rect: [1180, 230, 90, 90],
      look: () => say(G.jack, 'A red cable car crawling up to a station on the glacier. PRIVATE, says the sign. Bank staff only. Banks in Switzerland keep their vaults inside mountains. Very secure. Very cold.') },
    { name: 'Skis', rect: [460, 640, 150, 200], at: [560, 960],
      look: () => say(G.jack, 'A rack of skis in every colour. The last time I skied I was twelve, and I went through a fence.') },
    { name: 'Clock Shop', rect: [600, 470, 360, 370], at: [860, 900], exitLabel: 'Into the clock shop',
      exit: () => gotoScene('workshop', 200, 960, 1, { sfx: 'door' }) },
    { name: 'Valley Station', rect: [1480, 430, 440, 410], at: [1820, 900], exitLabel: 'Up to the glacier',
      async exit() {
        if (!has('keycard')) return say(G.jack, 'A steel door with a card slot. GLETSCHERBAHN: PRIVATE. Brunner goes up there. I need whatever Brunner opens it with.');
        if (!flag('code')) return think('The card will open the cable car, and the vault. But a Swiss vault will want a number too. Brunner won\'t have written it down. Brunner is the sort who hides it in plain sight.');
        if (!flag('swapped')) return think('Not yet. That clock is still ticking in the shop, and at noon it opens Vasko\'s hangar.');
        return rideUp();
      } },
    { name: 'Sepp', actor: 'sepp', at: [720, 960], face: -1,
      look: () => say(G.jack, 'Sepp, the head of the ski school: seventy years old, the colour of a saddle, and not an ounce of fat on him. He has been skiing since before skis.'),
      talk: () => talkSepp() },
    { name: 'Herr Brunner', actor: 'brunnerSki', at: [1080, 960], face: 1,
      look: () => say(G.jack, 'Herr Brunner of Zürich, in a white ski suit that has never touched snow. Around his neck, on a chain, a steel card. He keeps patting it, like a man checking his heart is still there.'),
      talk: () => talkBrunner() },
    { name: 'Brunner\'s Pass', rect: [650, 960, 110, 60], at: [700, 1000], when: () => flag('lessonDone') && !flag('gotCard'),
      look: () => say(G.jack, 'Something steel, glinting in the snowdrift where Brunner landed.'),
      async take() {
        flag('gotCard', true); addItem('keycard');
        Sound.sfx('pickup');
        await say(G.jack, 'BANK BRUNNER & CIE, GLETSCHERTRESOR. The glacier vault. Herr Brunner dropped his heart in the snow.');
        setObjective(flag('code') ? 'Up to the glacier' : 'Find out the vault\'s number');
        save();
      } },
  ],
};

async function villageOpening() {
  flag('villageIntro', true);
  G.busy = true;
  const b = actor('brunnerSki'), s = actor('sepp');
  await wait(0.6);
  await say(b, 'I have paid for a private lesson! Four hundred francs! Where is my instructor?');
  await say(s, 'Herr Brunner, my instructor Klaus has broken his leg. Twice. On the same day. I am looking for another.');
  await say(b, 'Then find one! I have a meeting on the glacier tomorrow, and I will not arrive on my bottom.');
  await think('Brunner. Herr Brunner of Zürich: the banker from Istanbul, and from the ball in Venice. The money for Nightglass goes through his bank, and his bank\'s vault is up on that glacier.');
  Sound.sfx('honk');
  setObjective('Get close to Herr Brunner');
  save();
  G.busy = false;
}

async function talkSepp() {
  const s = actor('sepp');
  if (flag('instructor')) return say(s, flag('lessonDone') ? 'Hot chocolate for two hours, he says. You are the worst instructor I ever had, Johann. Also the best. He paid double.' : 'Go on, Johann! Herr Brunner is waiting. Knees bent, and do not let him near the church.');
  G.busy = true;
  await say(s, 'Grüezi. You look like a man who needs a job. Can you ski?');
  const c = await choose([
    { text: '"Like a champion."', value: 'champ' },
    { text: '"I\'ve seen it on television."', value: 'tv' },
    { text: '"Honestly? Not really."', value: 'honest' },
  ]);
  if (c === 'champ') { await say(G.jack, 'Like a champion.'); await say(s, 'Everybody says that. Klaus said that. Now Klaus is in two plasters.'); }
  if (c === 'tv') { await say(G.jack, 'I\'ve seen it on television.'); await say(s, 'Good! That is more than Herr Brunner. He thinks skis are for standing on in the bar.'); }
  if (c === 'honest') { await say(G.jack, 'Honestly? Not really.'); await say(s, 'An honest man! In Grindelhorn! You are hired. Herr Brunner does not need a good skier. He needs a patient one.'); }
  await say(s, 'Here. The red jacket. Now you are Johann, of the Skischule Sepp. Smile, and say "Knees!" a lot.');
  Sound.sfx('cloth');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  flag('instructor', true); G.jack.look = LOOKS.jackSki;
  await wait(0.4);
  G.fadeTo = 0; await waitUntil(() => G.fade < 0.05);
  await say(G.jack, 'Johann, ski instructor. Knees!');
  setObjective('Give Herr Brunner his lesson');
  save();
  G.busy = false;
}

async function talkBrunner() {
  const b = actor('brunnerSki');
  if (!flag('instructor')) {
    await say(b, 'Are you the instructor? No? Then please step aside. You are standing in my light, and I am paying for the light.');
    return;
  }
  G.busy = true;
  await say(G.jack, 'Herr Brunner. Johann, from the Skischule Sepp. Shall we begin?');
  await say(b, 'At last. I must be able to stop by tomorrow. Stopping is the only thing a banker needs to know.');
  const c1 = await choose([
    { text: '"Bend your knees."', value: 'knees' },
    { text: '"Point the skis together, like a slice of pizza."', value: 'pizza' },
    { text: '"Lean forward, and trust the mountain."', value: 'trust' },
  ]);
  if (c1 === 'knees') { await say(G.jack, 'Bend your knees.'); await say(b, 'They are bent. They have been bent since 1954.'); }
  if (c1 === 'pizza') { await say(G.jack, 'Point the tips together, like a slice of pizza.'); await say(b, 'I am Swiss. I do not know what a pizza is. I know what a fondue is.'); }
  if (c1 === 'trust') { await say(G.jack, 'Lean forward, and trust the mountain.'); await say(b, 'I trust nothing. I am a banker.'); }
  await say(G.jack, 'Now push off. Gently.');
  b.arm = 'panic';
  Sound.sfx('whoosh');
  await walkTo(1000, 930, b, 1.8);
  await say(b, 'It is moving! Why is it moving? How do I stop? Johann, how do I stop?');
  const c2 = await choose([
    { text: '"Snowplough!"', value: 'plough' },
    { text: '"Fall over!"', value: 'fall' },
    { text: '"Aim for something soft!"', value: 'soft' },
  ]);
  await say(G.jack, c2 === 'plough' ? 'Snowplough!' : c2 === 'fall' ? 'Fall over!' : 'Aim for something soft!');
  await walkTo(720, 900, b, 2.4);
  Sound.sfx('thud');
  removeActor('brunnerSki');
  flag('lessonDone', true);
  await wait(0.6);
  await say('brunnerSki', 'Mmmf. Mmmmmf. I have stopped.', { pos: [700, 780] });
  await wait(0.4);
  await say('brunnerSki', 'That was the most expensive lesson of my life, and I have been to Monte Carlo. I shall have a hot chocolate. For two hours. Put it on my account.', { pos: [700, 780] });
  await think('He crawled out of the snowdrift and went straight to the hotel. He didn\'t notice what he left behind in it.');
  setObjective('See what Brunner left in the snowdrift');
  save();
  G.busy = false;
}

async function rideUp() {
  G.busy = true;
  Sound.sfx('slidingDoor');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  await TextScreen.play(CABLE_PAGES, 'tension');
  G.busy = false;
  CableClimb.start();
}
const CABLE_PAGES = [
  { kicker: 'THE GLETSCHERBAHN  ·  19:40', amb: ['snowWind'], text: 'Brunner\'s pass in the slot, a hum, and a little red cabin swings out over the valley with a ski instructor and a goose inside. A thousand metres of nothing underneath.' },
  { kicker: 'HALFWAY UP', amb: ['snowWind'], text: 'The cabin jerks to a stop. The lights go out. The loudspeaker crackles: "Good evening, ski instructor," says Captain Kolar. "Or should I say, Harrow. The cable car is closed for the night. Enjoy the view." Sixty metres of cable to the top station. It is a very long sixty metres.' },
];

// ===========================================================================
// THE WORKSHOP — Zimmerli, Uhren
// ===========================================================================
SCENES.workshop = {
  title: 'Zimmerli · Uhren · 17:10',
  music: 'clocks', ambience: ['clock'], floor: 'Wood',
  paint: paintWorkshop,
  walk: [80, 1045, 1880, 1045, 1880, 872, 80, 872],
  depth: [872, 1.58, 1045, 1.9],
  light: LIGHT.workshop,
  portraitBg: '#5a3a1a',
  actors() {
    return [makeFigure('zimmerli', flag('showing') ? 1760 : 1420, flag('showing') ? 900 : 910, { id: 'zimmerli', facing: flag('showing') ? 1 : -1, arm: 'hold', seed: 92, depthScale: true })];
  },
  back(ctx, t) { drawPendulums(ctx, t); },
  props: [
    { y: 860, when: () => !flag('clockGone'), draw: (ctx, t) => paintVaskoClock(ctx, t, !!flag('swapped')) },
  ],
  async enter() {
    if (flag('workshopIntro')) return;
    flag('workshopIntro', true);
    G.busy = true;
    await wait(0.5);
    await say(actor('zimmerli'), 'Grüezi! Welcome to Zimmerli Uhren: cuckoo clocks since 1882. And please, the goose stays by the door. The goose and the cuckoos, they will not be friends.');
    Sound.sfx('honk');
    G.busy = false;
  },
  hotspots: [
    { name: 'Cuckoo Clocks', rect: [40, 120, 920, 580], photo: 'cuckooclock',
      look: () => say(G.jack, 'Dozens of cuckoo clocks, all ticking, all slightly out of time with each other. On the hour it must sound like an aviary being attacked.') },
    { name: 'Brunner\'s Clock', rect: [1760, 260, 140, 220], at: [1700, 960], face: 1,
      look: async () => {
        await say(G.jack, 'A clock with BRUNNER painted underneath. Stopped at a quarter to twelve, and the second hand at thirty. Eleven, forty-five, thirty.');
        if (flag('askedBrunner')) { flag('code', true); await think('Eleven, forty-five, thirty. One, one, four, five, three, nought. A banker who never lets anyone change the time on his clock.'); setObjective(has('keycard') ? (flag('swapped') ? 'Up to the glacier' : 'Deal with Vasko\'s clock') : 'Get Brunner\'s pass'); save(); }
        else flag('sawBrunnerClock', true);
      } },
    { name: 'Tray of Cuckoos', rect: [1250, 650, 140, 50], at: [1320, 960], when: () => !has('cuckoo') && !flag('swapped'),
      look: () => say(G.jack, 'A tray of spare cuckoos waiting for their clocks, beaks all pointing the same way, like a very small choir.'),
      async take() {
        if (!flag('showing')) return say(actor('zimmerli'), 'Nein, nein! Those are counted! Forty-seven cuckoos. If one goes missing, I will know. I will always know.');
        addItem('cuckoo');
        Sound.sfx('pickup');
        await say(G.jack, 'Forty-six cuckoos. She\'ll know. Eventually.');
        save();
      } },
    { name: 'Vasko\'s Clock', rect: [940, 440, 240, 420], at: [1060, 960], when: () => !flag('clockGone'),
      look: async () => {
        if (flag('swapped')) return say(G.jack, 'Vasko\'s clock, with an ordinary cuckoo inside. At noon tomorrow it will say "cuckoo", and absolutely nothing else will happen.');
        await say(G.jack, 'A grand clock on a stand, carved with pine leaves. And two wires, red and yellow, running from the cuckoo\'s little door down into the base. That\'s not a clock. That\'s a detonator with a pendulum.');
        if (!flag('sawWires')) { flag('sawWires', true); await say(actor('zimmerli'), 'Ah, the Colonel\'s clock! He brought his own cuckoo. Very heavy cuckoo. He says at noon tomorrow it must sing, "and open a door". A romantic, the Colonel.'); await think('At noon the cuckoo pops out, closes the circuit, and blows the ice door off Vasko\'s hangar. And out fly twelve aircraft.'); setObjective('Swap the Colonel\'s cuckoo for an ordinary one'); save(); }
      },
      async item(id) {
        if (id !== 'cuckoo') return false;
        return swapCuckoo();
      } },
    { name: 'Workbench', rect: [1180, 600, 520, 240], at: [1440, 960],
      look: () => say(G.jack, 'Frau Zimmerli\'s workbench: tiny screwdrivers, springs, gears, and a lamp that has been on since 1946.') },
    { name: 'Frau Zimmerli', actor: 'zimmerli', at: [1240, 960], face: 1,
      look: () => say(G.jack, 'Frau Zimmerli, the clockmaker: spectacles on a chain, sawdust in her hair, and the patience of a woman who has built four thousand cuckoos by hand.'),
      talk: () => talkZimmerli() },
    { name: 'The Door', rect: [0, 300, 80, 540], at: [120, 960], exitLabel: 'Out to the square',
      exit: () => gotoScene('village', 860, 920, 1, { sfx: 'door' }) },
  ],
};

async function talkZimmerli() {
  const z = actor('zimmerli');
  if (flag('showing')) return say(z, 'And this one, the Grand Alpine, has a cow that moos at six. Only one in the world. Look, look!');
  G.busy = true;
  const opts = [
    !flag('askedBrunner') && { text: 'Ask about Brunner\'s clock.', value: 'brunner' },
    flag('sawWires') && !flag('swapped') && !has('cuckoo') && { text: '"Show me your very finest clock."', value: 'finest' },
    { text: '"Just looking, thank you."', value: 'bye' },
  ].filter(Boolean);
  const c = await choose(opts);
  if (c === 'brunner') {
    await say(G.jack, 'The clock on the wall, with Brunner\'s name on it. It\'s stopped.');
    await say(z, 'Herr Brunner\'s! Forty years I have kept it for him, and every year he comes in and says: "Frau Zimmerli, never, never change the time on that clock." Eleven forty-five and thirty seconds.');
    await say(z, 'I think it is the moment his bank was founded. Or the moment he fell in love. With a banker, you cannot tell the difference.');
    flag('askedBrunner', true);
    if (flag('sawBrunnerClock')) { flag('code', true); await think('One, one, four, five, three, nought. Six digits. A Swiss vault takes six digits.'); }
    save();
  }
  if (c === 'finest') {
    await say(G.jack, 'Frau Zimmerli, what\'s the very finest clock in the shop?');
    await say(z, 'Oh! Oh, you must see the Grand Alpine, in the window. Come, come, it has a cow!');
    walkTo(1760, 900, z, 1.1);
    await say(z, 'Look at this. A hundred and twelve parts. A cow that moos at six, a milkmaid at seven, and at eight, a very small avalanche.');
    flag('showing', true);
    z.facing = 1;
    await think('She has her back to the tray of cuckoos. Now.');
    setObjective('Take a spare cuckoo, and swap it into Vasko\'s clock');
    save();
  }
  if (c === 'bye') await say(z, 'Look as long as you like. Everything ticks.');
  G.busy = false;
}

async function swapCuckoo() {
  if (!flag('showing')) return say(actor('zimmerli'), 'Please, do not touch the Colonel\'s clock! He was very particular. He threatened to shoot me. Very politely.');
  G.busy = true;
  removeItem('cuckoo');
  await walkTo(1060, 950);
  G.jack.arm = 'reach';
  Sound.sfx('click'); await wait(0.5); Sound.sfx('click');
  G.jack.arm = 'rest';
  flag('swapped', true);
  addItem('detonator');
  await say(G.jack, 'Vasko\'s heavy metal cuckoo out, Frau Zimmerli\'s wooden one in. At noon tomorrow it will pop out, say "cuckoo", and close nothing at all.');
  const z = actor('zimmerli');
  flag('showing', false);
  await walkTo(1420, 910, z, 1.1);
  z.facing = -1;
  Sound.sfx('door');
  const k = makeFigure('kolar', -80, 930, { id: 'kolar', facing: 1, arm: 'rest', seed: 17, depthScale: true });
  k.scale = depthScale(930); G.actors.push(k);
  await walkTo(700, 930, k, 1.1);
  await say(k, 'The Colonel\'s clock. For the hangar.');
  await say(z, 'All ready, Herr Captain. Wound, oiled, and set for noon.');
  k.facing = 1;
  await say(k, 'You. Ski instructor. Have we met?');
  await say(G.jack, 'Everybody\'s met a ski instructor, Captain. Knees!');
  await say(k, '...Hmph.');
  await walkTo(1060, 950, k, 1);
  flag('clockGone', true);
  await walkTo(-120, 950, k, 1);
  removeActor('kolar');
  Sound.sfx('door');
  setObjective(flag('code') && has('keycard') ? 'Up to the glacier' : !has('keycard') ? 'Get Brunner\'s pass' : 'Find out the vault\'s number');
  save();
  G.busy = false;
}

// ===========================================================================
// THE VAULT — the Gletschertresor, inside the mountain
// ===========================================================================
SCENES.vault = {
  title: 'Bank Brunner & Cie · The Glacier Vault · 11:58',
  music: 'vault', ambience: ['hum', 'drips'], floor: 'Stone',
  paint: paintVaultShut,
  walk: [60, 1045, 1880, 1045, 1880, 872, 60, 872],
  depth: [872, 1.58, 1045, 1.9],
  light: LIGHT.vault,
  portraitBg: '#3a3e44',
  props: [{ y: 700, when: () => flag('vaultOpen'), draw: ctx => paintVaultInside(ctx) }],
  async enter() {
    if (flag('vaultIntro')) return;
    flag('vaultIntro', true);
    G.busy = true;
    await wait(0.6);
    await think('Nine hours on a ledge in the top station, waiting for the bank to open. The goose slept. I didn\'t. Brunner\'s vault, a door to Vasko\'s hangar, and two minutes to noon.');
    setObjective('Open the vault');
    save();
    G.busy = false;
  },
  hotspots: [
    { name: 'Vault Door', rect: [260, 240, 520, 520], at: [640, 960], face: -1, when: () => !flag('vaultOpen'),
      look: () => say(G.jack, 'A vault door two metres across and a metre thick, with a card slot and a keypad beside it. Swiss engineering: nothing gets in, nothing gets out, and it\'s always on time.'),
      async use() {
        if (!flag('cardIn')) return say(G.jack, 'The keypad is dark. It wants a card first.');
        return openVault();
      },
      async item(id) {
        if (id !== 'keycard') return false;
        flag('cardIn', true);
        Sound.sfx('beep');
        await say(G.jack, 'Brunner\'s pass in the slot. The keypad lights up and asks, very politely, for six digits.');
        return openVault();
      } },
    { name: 'Keypad', rect: [820, 440, 90, 130], at: [860, 960], when: () => !flag('vaultOpen'),
      look: () => say(G.jack, 'A keypad and a card slot. Six digits. The Swiss don\'t believe in four.'),
      async use() { if (!flag('cardIn')) return say(G.jack, 'Dark. It wants Brunner\'s card first.'); return openVault(); },
      async item(id) { if (id !== 'keycard') return false; flag('cardIn', true); Sound.sfx('beep'); return openVault(); } },
    { name: 'Account Ledger', rect: [300, 300, 440, 420], at: [640, 960], face: -1, when: () => flag('vaultOpen'),
      look: () => say(G.jack, 'Rows of deposit boxes, and on a lectern in the middle, the ledger of numbered accounts. One of them has been paying for twelve aircraft.'),
      use: () => theNameOnTheAccount(), useVerb: 'Read' },
    { name: 'Hangar Door', rect: [1320, 260, 460, 580], at: [1500, 960], face: 1,
      look: () => say(G.jack, 'A steel door into the hangar, and through its little window, twelve black aircraft in a row under a roof of blue ice. And at the far end, a door of solid ice, waiting for a cuckoo.'),
      use: () => say(G.jack, 'Locked from the other side. I can hear Vasko in there, whistling. Badly.') },
    { name: 'Desk', rect: [900, 640, 300, 200],
      look: () => say(G.jack, 'A steel desk with a lamp and a calendar. Tomorrow is ringed in red. Vasko\'s writing: "NOON. DOOR. CHAMPAGNE."') },
  ],
};

async function openVault() {
  const ok = await openKeypad('114530', {
    brand: 'BRUNNER & CIE  ·  GLETSCHERTRESOR',
    onGiveUp: () => run(async () => {
      if (flag('code')) await think('Six digits. The time on Brunner\'s clock, the one Frau Zimmerli must never change: eleven, forty-five, thirty.');
      else await think('Six digits. Brunner is the sort to hide his number in plain sight. Frau Zimmerli keeps a clock for him in the village.');
    }),
  });
  if (!ok) return;
  G.busy = true;
  Sound.sfx('unlock'); await wait(0.6); Sound.sfx('clank');
  flag('vaultOpen', true);
  await say(G.jack, 'Eleven, forty-five, thirty. Thank you, Herr Brunner, and thank you, Frau Zimmerli.');
  setObjective('Find the account that paid for the fleet');
  save();
  G.busy = false;
}

async function theNameOnTheAccount() {
  G.busy = true;
  const j = G.jack;
  await walkTo(640, 960);
  j.facing = -1;
  Sound.sfx('paper');
  await say(j, 'Numbered account 44-771. Deposits from London, every month for a year. Payments out to a Karvonian engineering company, eighty million francs. And the name of the account holder...');
  await wait(0.6);
  Sound.sfx('bell'); await wait(0.5); Sound.sfx('bell'); await wait(0.5); Sound.sfx('bell');
  await think('Noon.');
  await wait(0.6);
  Sound.sfx('cuckoo');
  await say('cuckoo', 'Cuckoo!', { pos: [1550, 300] });
  await wait(0.8);
  Sound.sfx('cuckoo');
  await say('cuckoo', 'Cuckoo!', { pos: [1550, 300] });
  await wait(1.2);
  await say('vasko', 'Kolar... Why is the door not open?', { pos: [1550, 300] });
  await say('kolar', 'The cuckoo is... a cuckoo, Colonel.', { pos: [1550, 300] });
  await say('vasko', 'WHY IS THE CUCKOO A CUCKOO?', { pos: [1550, 300] });
  Sound.sfx('honk');
  await wait(0.6);
  await say(j, 'The account holder. Name: HARROW, JACK. Signature...');
  await wait(0.8);
  await say(j, '...mine. Well. A very good copy of mine.');
  await think('Every payment for Nightglass, in my name, in a Swiss bank. Control didn\'t just frame me. He made me the buyer.');
  await wait(1);
  G.fade = 1; G.fadeTo = 1;
  Sound.stopMusic(); Sound.setAmbience(['hum']);
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
    if (G.sceneId === 'workshop') return false; // she waits by the door, glaring at the cuckoos
    return ['village', 'vault'].includes(G.sceneId) && (G.sceneId !== 'village' || flag('villageIntro'));
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
  if (sc === 'village') {
    if (!flag('instructor')) return think('Brunner needs an instructor, and Sepp needs a man. I could be a man.');
    if (!flag('lessonDone')) return think('Herr Brunner is waiting for his lesson.');
    if (!has('keycard')) return think('Brunner left something in the snowdrift.');
    if (!flag('code')) return think('The vault will want a number. Brunner\'s the sort to hide it in plain sight. Frau Zimmerli keeps a clock for him.');
    if (!flag('swapped')) return think('Vasko\'s clock is still in the shop, with its heavy metal cuckoo.');
    return think('The valley station, and up to the glacier.');
  }
  if (sc === 'workshop') {
    if (!flag('sawWires')) return think('That grand clock in the middle of the shop: take a closer look.');
    if (!flag('code')) return think(flag('askedBrunner') ? 'Brunner\'s clock, on the wall by the window. What time does it say?' : 'The clock with Brunner\'s name on it. Ask Frau Zimmerli about it.');
    if (!has('cuckoo') && !flag('swapped')) return think('I need a cuckoo from that tray while Frau Zimmerli is looking the other way. She\'s very proud of her clocks.');
    if (!flag('swapped')) return think('The spare cuckoo goes into Vasko\'s clock.');
    return think('Back to the square.');
  }
  if (sc === 'vault') return think(flag('vaultOpen') ? 'The ledger, in the middle of the vault.' : 'Brunner\'s pass in the slot, then the number from his clock.');
}
