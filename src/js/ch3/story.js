// ---------------------------------------------------------------------------
// Chapter Three: The Iron Arrow — items, scenes, hotspots, dialogue, puzzles.
// Train, front to back: locomotive · first class · dining car · sleeping car
// (corridor, Jack's compartment) · mail van.
// ---------------------------------------------------------------------------

const ITEMS = {
  glove: {
    name: 'Ilse\'s Glove',
    desc: 'A black kid glove, still warm, that Ilse dropped at my feet. Ladies don\'t drop gloves by accident. Not this lady.',
    icon(c) {
      c.rotate(-0.3); c.fillStyle = '#1a1416';
      c.beginPath(); c.moveTo(-14, 34); c.lineTo(-18, -2); c.lineTo(-24, -22); c.quadraticCurveTo(-20, -28, -14, -20); c.lineTo(-10, -34); c.quadraticCurveTo(-4, -38, -2, -32); c.lineTo(2, -36); c.quadraticCurveTo(8, -40, 10, -32);
      c.lineTo(14, -30); c.quadraticCurveTo(20, -32, 20, -24); c.lineTo(16, 0); c.lineTo(14, 34); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-10, 10); c.lineTo(10, 10); c.stroke();
    },
  },
  nailfile: {
    name: 'Nail File',
    desc: 'A lady\'s steel nail file, hidden in the glove. Thin enough for a keyhole. Ilse, you\'re a genius.',
    icon(c) {
      c.rotate(-0.7);
      c.fillStyle = linGrad(c, 0, -5, 0, 5, [[0, '#dfe4ea'], [1, '#7a8088']]); c.fillRect(-36, -4, 56, 8);
      c.fillStyle = '#c9a13b'; c.fillRect(20, -5, 18, 10);
      c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1; for (let k = 0; k < 12; k++) { c.beginPath(); c.moveTo(-32 + k * 4, -4); c.lineTo(-30 + k * 4, 4); c.stroke(); }
    },
  },
  blueprints: {
    name: 'Nightglass Blueprints',
    desc: 'Forty sheets of blueprint, rolled tight and stamped NIGHTGLASS. Slightly flatter for a night under a mattress.',
    icon(c) {
      c.rotate(-0.4);
      c.fillStyle = linGrad(c, 0, -14, 0, 14, [[0, '#1a3a7a'], [0.5, '#3a6ac0'], [1, '#12306a']]); c.fillRect(-40, -14, 80, 28);
      c.fillStyle = '#e8eef8'; c.beginPath(); c.ellipse(-40, 0, 6, 14, 0, 0, 7); c.fill();
      c.fillStyle = '#9e1f28'; c.fillRect(-4, -16, 8, 32);
    },
  },
  champagne: {
    name: 'Soviet Champagne',
    desc: 'Sovetskoye Shampanskoye, semi-sweet. Very semi, very sweet. The Colonel will hate it.',
    icon(c) {
      c.rotate(0.2);
      c.fillStyle = '#1a3a22'; c.beginPath(); c.moveTo(-12, 38); c.lineTo(-12, -6); c.quadraticCurveTo(-12, -16, -5, -22); c.lineTo(-5, -36); c.lineTo(5, -36); c.lineTo(5, -22); c.quadraticCurveTo(12, -16, 12, -6); c.lineTo(12, 38); c.closePath(); c.fill();
      c.fillStyle = '#d9b35c'; c.fillRect(-6, -40, 12, 14);
      c.fillStyle = '#e8e0cc'; c.fillRect(-10, 6, 20, 18); c.fillStyle = '#9e1f28'; c.fillRect(-10, 10, 20, 4);
    },
  },
  bread: {
    name: 'Stale Bread',
    desc: 'Bread from Tuesday. Hard enough to stop a bullet. Franz says geese will follow it anywhere.',
    icon(c) {
      c.fillStyle = radGrad(c, -6, -6, 2, 36, [[0, '#d8a060'], [1, '#8a5a24']]);
      c.beginPath(); c.ellipse(0, 0, 34, 20, -0.2, 0, 7); c.fill();
      c.strokeStyle = 'rgba(80,40,10,0.5)'; c.lineWidth = 2; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(k * 10 - 4, -14); c.lineTo(k * 10 + 4, -4); c.stroke(); }
    },
  },
  crowbar: {
    name: 'Crowbar',
    desc: 'The railway crowbar from the mail van. We\'ve been through a lot together.',
    icon(c) {
      c.rotate(-0.7);
      c.strokeStyle = '#9e1f28'; c.lineWidth = 7; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-40, 0); c.lineTo(30, 0); c.quadraticCurveTo(42, 0, 40, -12); c.stroke();
    },
  },
};

async function lookItemStory(id) {
  if (id === 'glove' && !flag('readGlove')) {
    flag('readGlove', true);
    Sound.sfx('paper');
    await say(G.jack, 'A note, rolled up inside a finger. "Dining car, nine o\'clock. Vasko never looks at waiters. I."');
    await say(G.jack, 'And in the thumb, a lady\'s nail file. Thin, steel and very useful.');
    addItem('nailfile');
    setObjective(flag('uncuffed') ? 'Get out of the compartment' : 'Get out of the handcuffs');
    return save();
  }
  await say(G.jack, ITEMS[id].desc);
}

const LIGHT = {
  cell: { ambient: 'rgba(8,14,30,0.4)', key: 'rgba(150,180,230,0.3)', keyX: 960 },
  corridor: { ambient: 'rgba(40,20,8,0.2)', key: 'rgba(255,200,130,0.3)', keyX: 1620, top: 'rgba(255,220,160,0.1)' },
  dining: { ambient: 'rgba(40,16,20,0.18)', key: 'rgba(255,180,170,0.32)', keyX: 1310, top: 'rgba(255,200,180,0.1)' },
  first: { ambient: 'rgba(8,26,16,0.22)', key: 'rgba(255,210,140,0.32)', keyX: 1114 },
  van: { ambient: 'rgba(30,16,4,0.32)', key: 'rgba(255,180,90,0.36)', keyX: 700 },
  halt: { ambient: 'rgba(60,30,50,0.12)', key: 'rgba(255,200,150,0.45)', keyX: 1420 },
};

const SCENES = {};
const CELL_WALK = [220, 1045, 1700, 1045, 1640, 836, 280, 836];

// ===========================================================================
// JACK'S COMPARTMENT — handcuffed to the luggage rack
// ===========================================================================
SCENES.cell = {
  title: 'The Iron Arrow · Sleeping Car 2 · 00:40',
  music: 'tension', ambience: ['trainRumble', 'snowWind'], floor: 'Carpet',
  paint: ctx => paintCompartment(ctx),
  paintAfter(ctx) { ctx.save(); ctx.fillStyle = 'rgba(6,12,30,0.45)'; ctx.fillRect(0, 0, W, H); ctx.restore(); glow(ctx, 960, 60, 300, 'rgba(120,150,255,0.25)'); },
  get walk() { return flag('uncuffed') ? CELL_WALK : [470, 940, 570, 940, 570, 880, 470, 880]; },
  depth: [836, 1.62, 1045, 1.95],
  light: LIGHT.cell,
  portraitBg: '#1a2030',
  props: [
    { y: 915, when: () => flag('gloveOnFloor') && !flag('gotGlove'), draw: ctx => { ctx.save(); ctx.translate(650, 912); ctx.rotate(0.4); ctx.scale(1.2, 1.2); ITEMS.glove.icon(ctx); ctx.restore(); } },
  ],
  back(ctx, t) { drawTrainWindow(ctx, t, 700, 180, 520, 420, 1.6); },
  front(ctx, t) {
    if (flag('cuffed') && !flag('uncuffed')) {
      // the chain from Jack's wrist up to the luggage rail
      const j = G.jack, hx = j.x + 14 * j.scale * j.facing, hy = j.y - 205 * j.scale;
      ctx.strokeStyle = '#9aa0a6'; ctx.lineWidth = 4; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + 10, (hy + 270) / 2, hx + 16, 262); ctx.stroke(); ctx.setLineDash([]);
      ellipse(ctx, hx, hy, 9, 7, '#6a7078');
    }
    const sway = Math.sin(t * 2.1) * 0.6 + Math.sin(t * 6.3) * 0.3;
    ctx.save(); ctx.globalAlpha = 0.05 + 0.04 * Math.abs(sway); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
  },
  async enter() {
    if (flag('cellIntro')) { if (flag('cuffed') && !flag('uncuffed')) G.jack.arm = 'cuffed'; return; }
    flag('cellIntro', true);
    await cellOpening();
  },
  hotspots: [
    { name: 'Window', rect: [700, 180, 520, 420],
      look: () => say(G.jack, 'Mountains, moonlight and a very long way down. The Iron Arrow is climbing towards the Zlatá pass.') },
    { name: 'Tea Glasses', photo: 'teaglass', rect: [826, 568, 260, 56], at: [960, 880],
      look: () => say(G.jack, flag('conductorGone') ? 'Bogdan\'s tea, still steaming. Karvonian railways run on tea and arguments.' : 'Two glasses of tea, stone cold. Nobody has offered me a fresh one. I\'m a prisoner, not a passenger.') },
    { name: 'Handcuffs', photo: 'handcuffs', rect: [470, 240, 150, 360], at: [520, 910], when: () => flag('cuffed') && !flag('uncuffed'),
      look: () => say(G.jack, 'Karvonian handcuffs, heavy and cold, chained to the luggage rail. Kolar has a future in furniture removals.'),
      use: () => say(G.jack, 'I pull. The luggage rail doesn\'t. It was built to carry pianos.'), useVerb: 'Pull',
      async item(id) {
        if (id !== 'nailfile') return false;
        Sound.sfx('lockpick'); await wait(1.2); Sound.sfx('unlock');
        flag('uncuffed', true); removeItem('nailfile');
        G.jack.arm = 'rest';
        await say(G.jack, 'Click. One nail file, one lock, thirty seconds. Technical Section would be proud. Ilse would be prouder.');
        setObjective('Get out of the compartment');
        save();
      } },
    { name: 'Ilse\'s Glove', rect: [600, 880, 110, 60], at: [560, 910], when: () => flag('gloveOnFloor') && !flag('gotGlove'),
      look: () => say(G.jack, 'Ilse dropped a glove at my feet on her way out. Ladies don\'t drop gloves by accident. Not that lady.'),
      async take() {
        await say(G.jack, 'Just out of reach of my hands. Not out of reach of a size ten shoe.');
        flag('gotGlove', true); addItem('glove');
        await think('There\'s something inside it. I should take a closer look.');
      } },
    { name: 'Lower Berth', rect: [1310, 600, 480, 170], at: [1250, 900], useVerb: 'Lift the mattress on',
      look: () => say(G.jack, flag('gotPlans') ? 'Springs, and a very old sandwich. Ilse wasn\'t lying about the sandwich.' : 'The berth where I hid the plans. Ilse lifted this mattress and told Vasko there was nothing under it.'),
      async use() {
        if (!flag('uncuffed')) return say(G.jack, 'I can\'t reach it from here. The chain\'s a foot too short.');
        if (flag('gotPlans')) return say(G.jack, 'Just the sandwich now. I\'ll leave that for Kolar.');
        Sound.sfx('cloth');
        flag('gotPlans', true); addItem('blueprints');
        await say(G.jack, 'Still here. Forty sheets of Nightglass. She saw them, and she said nothing.');
        save();
      } },
    { name: 'Call Button', rect: [1740, 360, 70, 90], at: [1690, 880], useVerb: 'Press',
      look: () => say(G.jack, 'A brass bell push. "Conductor." In Karvonia, even calling for help comes with a form.'),
      async use() {
        if (!flag('uncuffed')) return say(G.jack, 'It\'s by the door, and I\'m chained to the rack. Out of reach.');
        if (flag('conductorGone')) return say(G.jack, 'Bogdan is busy arguing with Kolar. I shouldn\'t interrupt a Karvonian argument. They go on for years.');
        return conductorArrives();
      } },
    { name: 'Corridor Door', rect: [1800, 120, 130, 690], at: [1690, 880], exitLabel: 'Out into the corridor',
      async exit() {
        if (!flag('uncuffed')) return say(G.jack, 'I\'d love to. But I\'m chained to the furniture.');
        if (!flag('conductorGone')) {
          Sound.sfx('knock');
          return say('kolar', 'Quiet in there, Harrow! Or I come in and make you quiet.', { pos: [1640, 240] });
        }
        if (!flag('gotPlans')) return think('Not without the plans. They\'re under that mattress.');
        await gotoScene('corridor', 660, 900, 1, { sfx: 'slidingDoor' });
      } },
  ],
};

async function cellOpening() {
  G.busy = true;
  const j = G.jack;
  j.facing = 1;
  const v = makeFigure('vasko', 1480, 890, { id: 'vasko', facing: -1, arm: 'behind', seed: 18, depthScale: true });
  const k = makeFigure('kolar', 1640, 890, { id: 'kolar', facing: -1, arm: 'point', seed: 17, depthScale: true });
  const i = makeFigure('ilse', 1790, 880, { id: 'ilse', facing: -1, arm: 'rest', seed: 3, depthScale: true });
  for (const a of [v, k, i]) { a.scale = depthScale(a.y); G.actors.push(a); }
  await wait(1);
  await say(v, 'Search him, Captain.');
  await walkTo(640, 900, k, 1.5);
  k.facing = -1; k.arm = 'rest';
  Sound.sfx('cloth');
  await say(k, 'A passport for Herr Harwig, refrigerators. A hairpin. And a photograph.');
  await say(v, 'Anička. Your daughter looks well, Ilse. She is travelling with my sister, in first class. Such a treat for her.');
  await say(i, 'Yes, Colonel.');
  await say(v, 'Search the compartment, Ilse. Mr Harrow was carrying forty sheets of my property.');
  await walkTo(1460, 880, i);
  i.arm = 'reach'; Sound.sfx('cloth'); await wait(1.4); i.arm = 'rest';
  await say(i, 'Nothing, Colonel. Only springs, and a very old sandwich.');
  await think('She saw them. She saw them, and she lied to his face.');
  await say(v, 'Then he threw them into the snow. No matter. In Moscow, Mr Harrow will tell us everything, slowly.');
  j.arm = 'cuffed'; flag('cuffed', true);
  Sound.sfx('lock');
  await say(k, 'Stay, Englishman. Like a good dog.');
  await say(v, 'Dinner is at nine, in the dining car. You, sadly, are not invited.');
  v.facing = 1; walkTo(1900, 890, v, 1.3);
  k.facing = 1; await walkTo(1880, 890, k, 1.8);
  removeActor('vasko'); removeActor('kolar');
  await walkTo(700, 900, i, 1.4);
  i.facing = -1;
  await say(i, 'Goodbye, Jack. Enjoy Moscow.');
  flag('gloveOnFloor', true); Sound.sfx('paper');
  i.facing = 1; await walkTo(1900, 880, i, 1.5);
  removeActor('ilse');
  Sound.sfx('slidingDoor'); await wait(0.4); Sound.sfx('lock');
  await say('kolar', 'I am right outside, Harrow. I do not sleep, and I do not like you.', { pos: [1640, 240] });
  setObjective('Get out of the handcuffs');
  save();
  G.busy = false;
}

async function conductorArrives() {
  G.busy = true;
  Sound.sfx('bell');
  await wait(1);
  await say('bogdan', 'Coming, coming!', { pos: [1640, 240] });
  Sound.sfx('slidingDoor');
  const b = makeFigure('bogdan', 1900, 890, { id: 'bogdan', facing: -1, arm: 'tray', trayGlasses: 2, seed: 21, depthScale: true });
  b.scale = depthScale(890); G.actors.push(b);
  await walkTo(1620, 890, b);
  await say(b, 'You rang, comrade? Tea, blankets, a glass of kefir? And tickets, please.');
  await say(G.jack, 'My ticket is with the gentleman outside. Captain Kolar has all my papers.');
  const k = makeFigure('kolar', 1920, 900, { id: 'kolar', facing: -1, arm: 'behind', seed: 17, depthScale: true });
  k.scale = depthScale(900); G.actors.push(k);
  await walkTo(1790, 900, k);
  b.facing = 1;
  await say(b, 'Captain! This passenger\'s ticket, please. And yours.');
  await say(k, 'Mine? I am military. I travel free.');
  await say(b, 'Nobody travels free on my carriage, Captain. Not the Marshal, not the Pope, and certainly not you.');
  await say(k, 'This is an outrage! We will see the Colonel about this!');
  await say(b, 'We will! And the Colonel will buy a ticket too!');
  b.arm = 'rest';
  k.facing = 1; walkTo(1920, 900, k, 1.2);
  await walkTo(1920, 890, b, 1.2);
  removeActor('kolar'); removeActor('bogdan');
  flag('conductorGone', true);
  await think('Karvonian bureaucracy. The only force on earth more stubborn than the Karvonian army.');
  setObjective(flag('readGlove') ? 'Meet Ilse in the dining car at nine' : 'Get out of the compartment');
  save();
  G.busy = false;
}

// ===========================================================================
// THE CORRIDOR — sleeping car 2
// ===========================================================================
SCENES.corridor = {
  title: 'Sleeping Car 2 · The Corridor',
  music: 'train', ambience: ['trainRumble', 'snowWind'], floor: 'Carpet',
  paint: paintCorridor,
  walk: [0, 1045, 1920, 1045, 1920, 852, 0, 852],
  depth: [852, 1.62, 1045, 2.0],
  light: LIGHT.corridor,
  portraitBg: '#3a2410',
  front(ctx, t) {
    const sway = Math.sin(t * 1.9) * 0.6 + Math.sin(t * 5.7) * 0.3;
    ctx.save(); ctx.globalAlpha = 0.04 + 0.03 * Math.abs(sway); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
  },
  async enter() {
    if (flag('corridorIntro')) return;
    flag('corridorIntro', true);
    G.busy = true; await wait(0.6);
    await think('The dining car is forward, the mail van is behind. And for once, nobody is pointing anything at me.');
    G.busy = false;
  },
  hotspots: [
    { name: 'Compartment 1', rect: [250, 200, 200, 560], at: [350, 900], useVerb: 'Knock on',
      look: () => say(G.jack, 'Compartment one. Somebody inside is snoring like a sawmill in a thunderstorm.'),
      async use() { Sound.sfx('knock'); await wait(0.6); await say(G.jack, 'The snoring stops. Then starts again, louder. That\'s a no.'); } },
    { name: 'Compartment 2', rect: [560, 200, 200, 560], at: [660, 900], exitLabel: 'Back into my compartment',
      exit: () => gotoScene('cell', 1650, 890, -1, { sfx: 'slidingDoor' }) },
    { name: 'Compartment 3', rect: [1080, 200, 200, 560], at: [1180, 900], useVerb: 'Knock on',
      look: () => say(G.jack, 'Compartment three. A sign says "Do not disturb. Delegation of the Karvonian Tractor Institute."'),
      async use() { Sound.sfx('knock'); await wait(0.6); await say(G.jack, 'Someone shouts something about tractors. I don\'t think it\'s an invitation.'); } },
    { name: 'Linen Cupboard', rect: [820, 234, 180, 356], at: [910, 900], useVerb: 'Open',
      look: () => say(G.jack, 'The linen cupboard. Sheets, blankets, and whatever else the Iron Arrow keeps folded.'),
      async use() {
        if (flag('waiter')) return say(G.jack, 'Sheets and blankets. My own coat is folded on the top shelf, next to a very surprised pillow.');
        Sound.sfx('door');
        await say(G.jack, 'Sheets, blankets... and a spare waiter\'s jacket, with a bow tie clipped to the lapel.');
        if (!flag('readGlove')) return think('A waiter\'s jacket. Might come in handy, if I knew what I was walking into.');
        await think('Vasko never looks at waiters, Ilse says. Tonight, he\'s going to be served by one.');
        Sound.sfx('cloth');
        G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
        flag('waiter', true); G.jack.look = LOOKS.jackWaiter;
        await wait(0.4);
        G.fadeTo = 0; await waitUntil(() => G.fade < 0.05);
        await say(G.jack, 'White jacket, black bow tie. Nobody ever looks twice at a waiter. Nobody ever looks once.');
        setObjective('Get into the dining car and find Ilse');
        save();
      } },
    { name: 'Emergency Brake', rect: [1330, 270, 90, 130], at: [1370, 900], useVerb: 'Pull',
      look: () => say(G.jack, 'The emergency brake. "Misuse will be punished with a fine of five hundred roubles." And, I suspect, the Colonel.'),
      use: () => say(G.jack, 'Stop the train here, in the middle of nowhere, with Vasko on board? Not yet. Hold that thought.') },
    { name: 'Fire Axe', rect: [1330, 430, 90, 190],
      look: () => say(G.jack, 'A fire axe behind glass. "In case of fire." Or conductors.') },
    { name: 'Conductor\'s Cabin', rect: [1480, 180, 300, 380], at: [1620, 900], photo: 'samovar',
      look: () => say(G.jack, 'Bogdan\'s cabin: a samovar, a timetable and a certificate. "Conductor of the Year, 1979, 1980, 1981 and 1983." One wonders what happened in 1982.') },
    { name: 'Timetable', rect: [1630, 300, 110, 150], at: [1660, 900],
      look: () => say(G.jack, 'Karvograd twenty three fifty nine, the Zlatá pass at two ten, the border at four forty. Then Moscow, and a very long conversation with Vasko.') },
    { name: 'Door to the Mail Van', rect: [0, 150, 150, 660], at: [120, 900], exitLabel: 'Back to the mail van',
      exit: () => gotoScene('van3', 180, 900, 1, { sfx: 'door' }) },
    { name: 'Door to the Dining Car', rect: [1790, 150, 130, 660], at: [1840, 900], exitLabel: 'Forward to the dining car',
      async exit() {
        if (!flag('waiter')) {
          if (!flag('readGlove')) return think('Vasko is somewhere up there. I shouldn\'t go charging in without a plan.');
          return think('Vasko is in the dining car. I can\'t stroll in wearing my own face. Ilse said he never looks at waiters...');
        }
        await gotoScene('dining', 140, 900, 1, { sfx: 'door' });
      } },
  ],
};

// ===========================================================================
// THE DINING CAR
// ===========================================================================
SCENES.dining = {
  title: 'The Dining Car · 21:04',
  music: 'dining', ambience: ['trainRumble', 'cutlery'], floor: 'Carpet', musicFilter: 5000,
  paint: paintDiningCar,
  walk: [100, 1045, 1830, 1045, 1830, 856, 100, 856],
  depth: [856, 1.62, 1045, 2.0],
  light: LIGHT.dining,
  portraitBg: '#3a1a24',
  actors() {
    return [
      makeFigure('franzChef', 250, 800, { id: 'franz', facing: 1, seed: 2, scale: 1.72, fixedScale: true }),
      makeFigure('vasko', 1200, 832, { id: 'vasko', facing: 1, pose: 'sit', seed: 18, scale: 1.7, fixedScale: true }),
      makeFigure('ilse', 1425, 832, { id: 'ilse', facing: -1, pose: 'sit', seed: 3, scale: 1.7, fixedScale: true }),
      makeFigure('kolar', 1620, 862, { id: 'kolar', facing: 1, arm: 'point', seed: 17, depthScale: true }),
      makeFigure('bogdan', 1730, 866, { id: 'bogdan', facing: -1, seed: 21, depthScale: true }),
    ];
  },
  props: [
    { y: 812, draw: ctx => paintGalleyCounter(ctx) },
    { y: 840, draw: ctx => paintDiningTable(ctx, 1310) },
  ],
  back(ctx, t) {
    for (const x of [560, 960, 1360]) drawTrainWindow(ctx, t, x - 170, 170, 340, 360, 1.6);
    for (let k = 0; k < 6; k++) { const p = (t * 0.3 + k / 6) % 1; ctx.save(); ctx.globalAlpha = (1 - p) * 0.2; ellipse(ctx, 235 + Math.sin(p * 6 + k) * 30, 420 - p * 180, 20 + p * 40, 10 + p * 20, '#f4f0e8'); ctx.restore(); }
  },
  update(dt, t) {
    // Kolar and the conductor are still arguing about tickets, with gestures
    const k = actor('kolar'), b = actor('bogdan');
    if (k && !k.talking) k.arm = Math.sin(t * 1.3) > 0 ? 'point' : 'rest';
    if (b && !b.talking) b.arm = Math.sin(t * 1.1 + 2) > 0.3 ? 'point' : 'rest';
  },
  async enter() {
    if (flag('geeseFollowing') && !flag('vaskoGeese')) {
      flag('vaskoGeese', true);
      G.busy = true; await wait(0.8);
      await say(actor('vasko'), 'Waiter. Why are there geese following you?');
      await say(G.jack, 'Chef\'s special, Colonel.');
      await say(actor('vasko'), 'Excellent. Carry on.');
      G.busy = false;
      return;
    }
    if (flag('diningIntro')) return;
    flag('diningIntro', true);
    G.busy = true; await wait(0.8);
    await think('Vasko, Ilse, Kolar and the conductor. And the waiter is me. Let\'s hope Ilse knows her Colonel.');
    await say(actor('vasko'), 'Waiter! Champagne. And not the Dom Pérignon, I am sick of Dom Pérignon.');
    flag('vaskoOrdered', true);
    setObjective('Bring the Colonel his champagne');
    save();
    G.busy = false;
  },
  hotspots: [
    { name: 'Windows', rect: [390, 170, 1140, 360],
      look: () => say(G.jack, 'Moonlight on the snow, and pine forests rushing past. The Iron Arrow is climbing the Zlatá pass.') },
    { name: 'Menu Board', rect: [1640, 230, 150, 200],
      look: () => say(G.jack, 'Tonight: borscht, borscht, or borscht. I\'ll have the borscht.') },
    { name: 'Kitchen', rect: [90, 210, 290, 360], at: [420, 900],
      look: () => say(G.jack, 'The galley: steam, copper pans and a cook in a very tall hat.') },
    { name: 'Chef', actor: 'franz', at: [470, 900], face: -1,
      look: () => say(G.jack, 'The chef has a moustache like a boot brush and a hat like a wedding cake. I know that moustache.'),
      talk: () => talkChef() },
    { name: 'Colonel Vasko', actor: 'vasko', at: [1060, 900], face: 1,
      look: () => say(G.jack, 'Colonel Vasko at dinner, with a napkin under his chin and his medals dangerously close to the borscht.'),
      async talk() {
        const v = actor('vasko');
        if (flag('served')) return say(v, 'More champagne, waiter. It is revolting. I cannot stop.');
        await say(v, 'Champagne, waiter! Why are you standing there like a lamp post?');
      },
      async item(id) {
        const v = actor('vasko');
        if (id === 'champagne') return serveVasko();
        if (id === 'bread') return say(v, 'Bread? I ordered champagne, you idiot!');
        if (id === 'blueprints') return say(G.jack, 'Show the Colonel his own blueprints? Even Vasko would look at the waiter then.');
        return false;
      } },
    { name: 'Ilse', actor: 'ilse', at: [1560, 900], face: -1,
      look: () => say(G.jack, 'Ilse, in black, with a glove missing. She hasn\'t looked at me once. She\'s very good.'),
      async talk() {
        const i = actor('ilse');
        if (!flag('served')) return say(i, 'Not now, waiter. The Colonel is waiting for his champagne.');
        if (flag('plan')) return say(i, 'Go, Jack. First class. And remember: the Danube looks blue tonight.');
        return ilseWhispers();
      } },
    { name: 'Captain Kolar', actor: 'kolar', at: [1500, 920], face: 1,
      look: () => say(G.jack, 'Kolar, still arguing about his ticket. He hasn\'t looked at the waiter either. Waiters are invisible in Karvonia.'),
      talk: () => say(actor('kolar'), 'Not now, waiter! I am explaining military law to a man in a hat.') },
    { name: 'Conductor Bogdan', actor: 'bogdan', at: [1600, 930], face: 1,
      look: () => say(G.jack, 'Bogdan, Conductor of the Year, refusing to lose an argument in front of the Colonel.'),
      talk: () => say(actor('bogdan'), 'Tickets, please! Oh, you are staff. Carry on, comrade.') },
    { name: 'Back to the Sleeping Car', rect: [0, 150, 90, 660], at: [130, 900], exitLabel: 'Back to the sleeping car',
      exit: () => gotoScene('corridor', 1800, 900, -1, { sfx: 'door' }) },
    { name: 'To First Class', rect: [1830, 150, 90, 660], at: [1800, 900], exitLabel: 'Forward to first class',
      async exit() {
        if (!flag('plan')) return think('First class is forward. I should talk to Ilse before I go wandering.');
        await gotoScene('first', 160, 900, 1, { sfx: 'door' });
      } },
  ],
};

async function talkChef() {
  const f = actor('franz');
  if (!flag('metChef')) {
    flag('metChef', true);
    await say(G.jack, 'Franz?');
    await say(f, 'Shh! On this train I am Chef Frantisek. The real chef had a small accident with a bottle of slivovitz.');
    await say(G.jack, 'What sort of accident?');
    await say(f, 'I gave it to him. He is asleep in the coal tender, very happy.');
    await say(f, 'London sent me after you, Herr Harrow. Also, nobody else on this train can make a borscht.');
  } else await say(f, 'What does the waiter need?');
  for (;;) {
    const c = await choose([
      flag('vaskoOrdered') && !has('champagne') && !flag('served') && { text: 'Champagne for the Colonel.', value: 'champ' },
      flag('plan') && !has('bread') && !flag('geeseFollowing') && { text: 'Have you got any bread? For geese.', value: 'bread' },
      { text: 'How is the borscht?', value: 'borscht' },
      { text: 'Back to work.', value: 'bye' },
    ]);
    if (c === 'champ') {
      await say(G.jack, 'Champagne for the Colonel. Not the Dom Pérignon.');
      Sound.sfx('clink');
      await say(f, 'Soviet champagne, semi-sweet. Very semi, very sweet. He will hate it, and drink the whole bottle.');
      addItem('champagne');
    }
    if (c === 'bread') {
      await say(G.jack, 'Have you got any bread? It\'s for some geese.');
      await say(f, 'Of course it is. Bread from Tuesday, hard enough to stop a bullet. Geese will follow it to the end of the earth.');
      addItem('bread');
    }
    if (c === 'borscht') {
      await say(G.jack, 'How is the borscht?');
      await say(f, 'Red, hot and angry, like the Colonel. But the borscht has more taste.');
    }
    if (c === 'bye') { await say(G.jack, 'Back to work.'); return say(f, 'Mind the soup, Herr Harrow.'); }
  }
}

async function serveVasko() {
  const v = actor('vasko');
  if (flag('served')) return say(v, 'More, waiter. More.');
  removeItem('champagne');
  Sound.sfx('pop'); await wait(0.5); Sound.sfx('pour');
  await say(v, 'Hm. You look familiar, waiter.');
  await say(G.jack, 'All waiters look alike, Colonel.');
  await say(v, 'True. I never look at them.');
  await wait(0.4);
  await say(v, 'Sweet. Revolting. Pour me another.');
  flag('served', true);
  await say(actor('ilse'), 'Waiter, a glass of water, please.');
  setObjective('Talk to Ilse, quietly');
  save();
}

async function ilseWhispers() {
  const i = actor('ilse');
  await say(G.jack, 'Your water, madame.');
  await say(i, 'You found my glove.');
  await say(G.jack, 'And the nail file. Why, Ilse?');
  await say(i, 'Because my daughter is on this train, Jack. In first class, with Vasko\'s sister Olga. He brings Anička everywhere, so that I remember who I belong to.');
  await say(G.jack, 'Then we take her back.');
  await say(i, 'The mail van is the last car. Uncouple it at the top of the pass, and it will roll all the way down to Zlatá Hora.');
  await say(G.jack, 'And Olga?');
  await say(i, 'Olga never lets the child out of her sight. She is afraid of nothing in this world, except birds.');
  await say(G.jack, 'Birds?');
  await say(i, 'She once fainted because of a pigeon. Tell Anička the Danube looks blue tonight, and she will go with you.');
  await say(G.jack, 'Only when it rains.');
  await say(i, 'Go. I will meet you in the mail van.');
  flag('plan', true);
  await think('Birds. And I know exactly where to find three very angry geese.');
  setObjective('Get Anička away from Aunt Olga');
  save();
}

// ===========================================================================
// FIRST CLASS — Aunt Olga and Anička
// ===========================================================================
SCENES.first = {
  title: 'First Class · The Saloon',
  music: 'firstclass', ambience: ['trainRumble', 'clock'], floor: 'Carpet', musicFilter: 6000,
  paint: paintFirstClass,
  walk: [110, 1045, 1780, 1045, 1780, 856, 110, 856],
  depth: [856, 1.62, 1045, 2.0],
  light: LIGHT.first,
  portraitBg: '#123020',
  actors() {
    const list = [];
    if (!flag('anickaSaved')) {
      list.push(makeFigure('olga', 790, 832, { id: 'olga', facing: 1, pose: 'sit', arm: 'knit', seed: 22, scale: 1.72, fixedScale: true }));
      list.push(makeFigure('anicka', 1430, 866, { id: 'anicka', facing: -1, arm: 'hold', seed: 23, depthScale: true, scaleMul: 0.62 }));
    }
    return list;
  },
  props: [{ y: 780, draw: ctx => paintArmchair(ctx, 810, 860, -1) }],
  back(ctx, t) { for (const x of [520, 1340]) drawTrainWindow(ctx, t, x - 190, 170, 380, 400, 1.6); },
  async enter() {
    if (flag('firstIntro')) return;
    flag('firstIntro', true);
    G.busy = true; await wait(0.8);
    await think('Velvet, brass, another portrait of Vasko, and a lady who looks like she could bend railway lines with her knitting needles.');
    await say(actor('olga'), 'A waiter? I ordered nothing. Go away.');
    G.busy = false;
  },
  hotspots: [
    { name: 'Portrait of Vasko', rect: [860, 190, 200, 250],
      look: () => say(G.jack, 'Another Vasko. He\'s everywhere on this train, like damp.') },
    { name: 'Windows', rect: [330, 170, 1200, 400],
      look: () => say(G.jack, 'The pass is close now. Snow, rock, and a very long way down.') },
    { name: 'Chess Table', photo: 'chess', rect: [1000, 640, 170, 80], at: [1080, 900],
      look: () => say(G.jack, 'A game of chess, half played. White is losing badly. White was brave enough to play Olga.') },
    { name: 'Carpet', rect: [300, 870, 1300, 170],
      look: () => say(G.jack, 'A thick Turkish carpet. You could lose a goose in it. Several, in fact.'),
      async item(id) { if (id === 'bread') return geeseAttack(); return false; } },
    { name: 'Locomotive Door', rect: [1790, 150, 130, 660], at: [1740, 900],
      look: () => say(G.jack, 'Locked. "Nobody drives the Iron Arrow but the driver and God," says the sign. God has the night off.') },
    { name: 'Back to the Dining Car', rect: [0, 150, 100, 660], at: [140, 900], exitLabel: 'Back to the dining car',
      exit: () => gotoScene('dining', 1790, 900, -1, { sfx: 'door' }) },
    { name: 'Aunt Olga', actor: 'olga', at: [1000, 900], face: -1,
      look: () => say(G.jack, 'Olga Vasko, the Colonel\'s sister. Spectacles on a chain, knitting needles like bayonets, and the warmth of a Siberian bus stop.'),
      async talk() {
        const o = actor('olga');
        await say(G.jack, 'Tea for the young lady, madame?');
        await say(o, 'The child takes no tea after eight o\'clock. Children who drink tea after eight grow up to be poets.');
        await say(G.jack, 'Heaven forbid.');
        await say(o, 'Exactly. Go away.');
      },
      async item(id) {
        const o = actor('olga');
        if (id === 'bread') {
          if (!flag('geeseFollowing')) return say(o, 'Crumbs? On my carpet? Are you mad?');
          return geeseAttack();
        }
        if (id === 'blueprints') return say(G.jack, 'Show Vasko\'s sister the blueprints? I\'d rather show them to the geese.');
        return false;
      } },
    { name: 'Anička', actor: 'anicka', at: [1300, 900], face: 1,
      look: () => say(G.jack, 'A little girl in a blue coat, with plaits and a rag doll, pressing her nose to the window. She has her mother\'s eyes, and her mother\'s look of someone planning an escape.'),
      async talk() {
        const a = actor('anicka');
        await say(a, 'Aunt Olga says I must not talk to waiters.');
        await say(actor('olga'), 'Anička! Away from the waiter, he is probably a poet.');
        if (flag('plan')) await think('Olga won\'t let her out of her sight. Not unless something truly terrible happens. Something with feathers.');
      } },
  ],
};

async function geeseAttack() {
  const o = actor('olga'), a = actor('anicka');
  G.busy = true;
  removeItem('bread');
  await say(G.jack, 'Oops. Tuesday\'s bread, all over the carpet. Clumsy of me.');
  flag('geeseLoose', true);
  Sound.sfx('honk'); await wait(0.3); Sound.sfx('honk');
  G.geeseChaos = G.t;
  o.arm = 'panic';
  await say(o, 'BIRDS! Birds on my carpet! Get them away from me!');
  o.pose = 'stand'; o.y -= 40; // up on the armchair
  Sound.sfx('shriek');
  await say(a, 'Geese! Aunt Olga, there are geese on the train!');
  await walkTo(1280, 900);
  G.jack.facing = 1;
  await say(G.jack, 'Anička. Your mama says the Danube looks blue tonight.');
  await say(a, 'Only when it rains! Mama taught me that!');
  await say(G.jack, 'Then come with me, quickly. Your mama is waiting.');
  await say(o, 'Guards! Geese! GUARDS!');
  flag('anickaSaved', true);
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  await gotoScene('van3', 240, 900, 1, { instant: true, sfx: 'door' });
  G.busy = false;
}

// ===========================================================================
// THE MAIL VAN — the last car on the train
// ===========================================================================
SCENES.van3 = {
  title: 'The Mail Van · The Last Car',
  music: 'tension', ambience: ['trainRumble', 'vanCreak', 'snowWind'], floor: 'Wood',
  paint: ctx => { paintVan(ctx); paintGangwayDoor(ctx); },
  walk: [130, 1045, 1860, 1045, 1800, 832, 130, 832],
  depth: [832, 1.7, 1045, 2.05],
  light: LIGHT.van,
  portraitBg: '#3a2410',
  actors() {
    if (!flag('anickaSaved')) return [];
    return [
      makeFigure('ilse', 700, 900, { id: 'ilse', facing: -1, arm: 'hug', seed: 3, depthScale: true }),
      makeFigure('anicka', 610, 905, { id: 'anicka', facing: 1, arm: 'hug', seed: 23, depthScale: true, scaleMul: 0.62 }),
    ];
  },
  props: [
    { y: 800, draw: ctx => paintPortraitCrate(ctx, true) },
    { y: 805, draw: (ctx, t) => flag('geeseFollowing') ? drawEmptyGooseCrate(ctx) : drawGeese(ctx, t) },
    { y: 900, when: () => !flag('gotCrowbar'), draw: ctx => { ctx.save(); ctx.translate(980, 900); ctx.rotate(-0.1); ctx.strokeStyle = '#9e1f28'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(70, 0); ctx.quadraticCurveTo(92, 0, 88, -22); ctx.stroke(); ctx.restore(); } },
  ],
  back(ctx, t) {
    const a = Math.sin(t * 2.4) * 0.2;
    ctx.save(); ctx.translate(700, 80); ctx.rotate(a);
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 110); ctx.stroke();
    ctx.fillStyle = '#2a2a2a'; ctx.fillRect(-18, 110, 36, 8); ctx.fillRect(-14, 160, 28, 8);
    ctx.fillStyle = 'rgba(255,200,110,0.9)'; ctx.fillRect(-14, 118, 28, 42); glow(ctx, 0, 140, 90, 'rgba(255,190,100,0.7)');
    ctx.restore();
  },
  front(ctx, t) {
    const j = Math.sin(t * 13) * 0.5 + Math.sin(t * 3.1);
    ctx.save(); ctx.globalAlpha = 0.05 + 0.03 * Math.abs(j); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
  },
  async enter() {
    if (flag('anickaSaved') && !flag('reunion')) {
      flag('reunion', true);
      G.busy = true; await wait(0.8);
      await say(actor('ilse'), 'Anička! My darling, my brave girl.');
      await say(actor('anicka'), 'Mama! A waiter brought me! And there are geese everywhere!');
      await say(actor('ilse'), 'Thank you, Jack. Whatever happens now, thank you.');
      await say(G.jack, 'Thank me at the bottom of the mountain. Hold on to something.');
      setObjective('Uncouple the mail van from the train');
      save();
      G.busy = false;
      return;
    }
    if (flag('van3Intro')) return;
    flag('van3Intro', true);
    G.busy = true; await wait(0.8);
    Sound.sfx('honk');
    await think('The mail van, and my old friends the geese. Somebody has fed them. It wasn\'t Kolar.');
    G.busy = false;
  },
  hotspots: [
    { name: 'Vasko\'s Portrait', rect: [1180, 170, 320, 630],
      look: () => say(G.jack, 'Vasko on his horse, with a hole in his back where the plans used to be. Karvonian art has never looked better.') },
    { name: 'Geese', rect: [110, 620, 180, 180], at: [320, 890], useVerb: 'Open the crate of', when: () => !flag('geeseFollowing'),
      look: () => say(G.jack, 'Three geese in a slatted crate. They look at me like I owe them money.'),
      async use() { Sound.sfx('honk'); await say(G.jack, 'Honk. Not without a very good reason to follow me, apparently.'); },
      async item(id) {
        if (id !== 'bread') return false;
        Sound.sfx('crowbar'); await wait(0.4); Sound.sfx('honk');
        flag('geeseFollowing', true);
        await say(G.jack, 'A crumb of Tuesday\'s bread, and suddenly I\'m the most popular man in Karvonia. Come along, ladies. First class awaits.');
        setObjective('Lead the geese to first class');
        save();
      } },
    { name: 'Crowbar', rect: [880, 870, 220, 50], at: [980, 920], when: () => !flag('gotCrowbar'),
      look: () => say(G.jack, 'My old crowbar, where I dropped it on the way up to the roof.'),
      async take() { flag('gotCrowbar', true); addItem('crowbar'); await say(G.jack, 'We\'ve been through a lot together, you and I.'); save(); } },
    { name: 'Mailbags', rect: [1470, 640, 220, 170],
      look: () => say(G.jack, 'Sacks of letters to Moscow. Some of them will arrive a lot sooner than others.') },
    { name: 'Coupling', rect: [0, 740, 170, 120], at: [180, 900], useVerb: 'Uncouple',
      look: () => say(G.jack, 'Through the gangway door: the coupling to the sleeping car. One pin between us and a very long ride downhill.'),
      async use() {
        if (!flag('anickaSaved')) return think('Not yet. Anička is still up in first class with her aunt.');
        if (!has('crowbar')) return say(G.jack, 'The coupling pin is frozen solid. I need leverage.');
        return uncouple();
      },
      async item(id) {
        if (id !== 'crowbar') return false;
        if (!flag('anickaSaved')) return think('Not yet. Anička is still up in first class with her aunt.');
        return uncouple();
      } },
    { name: 'Gangway Door', rect: [0, 200, 110, 540], at: [150, 900], exitLabel: 'Forward to the sleeping car',
      async exit() {
        if (flag('anickaSaved')) return say(G.jack, 'Back up the train, past a carriage full of furious geese and an aunt on an armchair? No, thank you.');
        await gotoScene('corridor', 150, 900, 1, { sfx: 'door' });
      } },
    { name: 'Van Door', rect: [1700, 220, 190, 590],
      look: () => say(G.jack, 'Still locked from the outside. Kolar is nothing if not consistent.') },
  ],
};

function drawEmptyGooseCrate(ctx) {
  const x = 120, y = 640;
  ctx.fillStyle = '#6a4a22'; ctx.fillRect(x, y + 20, 160, 140);
  ctx.fillStyle = '#8a6a3a'; for (let k = 0; k < 6; k++) ctx.fillRect(x + k * 30, y + 20, 12, 140);
  ctx.save(); ctx.translate(x + 160, y + 20); ctx.rotate(0.9); ctx.fillStyle = '#8a6a3a'; ctx.fillRect(0, -10, 160, 12); ctx.restore(); // lid hanging open
  ctx.fillStyle = '#f0ece4'; for (let k = 0; k < 6; k++) ellipse(ctx, x + 20 + k * 22, y + 150 - (k % 2) * 8, 5, 2, '#f0ece4'); // a few feathers
}

async function uncouple() {
  G.busy = true;
  await walkTo(180, 900);
  G.jack.facing = -1;
  Sound.sfx('crowbar'); await wait(0.8); Sound.sfx('clank');
  await say(G.jack, 'The pin\'s out!');
  Sound.sfx('whistle');
  await wait(1.4);
  await say(actor('ilse'), 'The train is going on without us.');
  await wait(1);
  Sound.setAmbience(['vanCreak', 'snowWind']);
  Sound.stopMusic();
  await say(actor('anicka'), 'Why is it so quiet?');
  await wait(1.2);
  Sound.sfx('clank');
  await say(actor('ilse'), 'Jack... we are rolling backwards.');
  await say(G.jack, 'Downhill, all the way to Zlatá Hora. Somebody find the brake.');
  await say(G.jack, 'Never mind. I\'ve found it.');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  TrainBrake.start();
}

// ===========================================================================
// ZLATÁ HORA HALT — dawn, and the surprise
// ===========================================================================
SCENES.halt = {
  title: 'Zlatá Hora · 06:12',
  music: 'end', ambience: ['snowWind', 'birds'], floor: 'Snow',
  paint: paintHalt,
  walk: [0, 1045, 1920, 1045, 1920, 900, 0, 900],
  depth: [900, 1.5, 1045, 1.85],
  light: LIGHT.halt,
  portraitBg: '#5a3a4a',
  snow: { n: 120, ground: 1080, wind: 30, speed: 50 },
  actors() {
    const list = [
      makeFigure('ilse', 1080, 940, { id: 'ilse', facing: -1, arm: 'hug', seed: 3, depthScale: true }),
      makeFigure('anicka', 990, 950, { id: 'anicka', facing: 1, arm: 'hug', seed: 23, depthScale: true, scaleMul: 0.62 }),
    ];
    return list;
  },
  props: [
    { y: 910, when: () => flag('carArrived'), draw: ctx => paintTatra(ctx, 1480, 920) },
    { y: 480, draw: (ctx, t) => drawGoose(ctx, 560, 478, 0.9, Math.floor(t * 0.5) % 3 ? 0 : t, -1) },
  ],
  back(ctx, t) {
    if (G.jetT) {
      const p = clamp((G.t - G.jetT) / 3.2, 0, 1);
      if (p < 1) {
        const x = -300 + p * (W + 700), y = 380 - Math.sin(p * Math.PI) * 120;
        drawStealth(ctx, x, y, 3.2);
        ctx.save(); ctx.globalAlpha = 0.25 * (1 - p); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore();
      }
    }
  },
  async enter() {
    if (flag('haltIntro')) return;
    flag('haltIntro', true);
    await haltEnding();
  },
  hotspots: [
    { name: 'Halt Sign', rect: [1100, 440, 380, 60],
      look: () => say(G.jack, 'Zlatá Hora. Altitude one thousand four hundred metres. Population three.') },
    { name: 'Goose', rect: [480, 350, 150, 130],
      look: () => say(G.jack, 'The Colonel. She rode the roof all the way down the mountain and she wants a medal for it.') },
    { name: 'Mail Van', rect: [80, 470, 640, 400],
      look: () => say(G.jack, 'The mail van, at rest at last. It will need a very long letter of apology.') },
  ],
};

async function haltEnding() {
  G.busy = true;
  const i = actor('ilse'), a = actor('anicka'), j = G.jack;
  j.facing = 1;
  await wait(1.2);
  await think('Zlatá Hora. Altitude one thousand four hundred metres, population three. Plus one spy, one ex-spy, and a very small girl.');
  await say(j, 'Forty sheets of Nightglass. Real, this time. I checked twice. Then a third time, for luck.');
  await say(a, 'Mama, can we keep one of the geese?');
  await say(i, 'No, darling. The geese are going to Moscow. They have a very important meeting with Aunt Olga.');
  Sound.sfx('honk');
  await wait(0.8);
  for (const f of [j, i, a]) f.facing = -1;
  await say(a, 'Mama! One of them came with us! On the roof!');
  await say(j, 'She rode all the way down. Five bends, one tunnel, and not a feather out of place.');
  await say(i, 'Then she is braver than the Karvonian army. Very well, Anička. She can stay.');
  await say(a, 'I will call her Colonel.');
  await wait(0.6);
  for (const f of [j, i, a]) f.facing = 1;
  Sound.sfx('car'); await wait(1.4);
  flag('carArrived', true);
  Sound.sfx('carDoor');
  const n = makeFigure('novak', 1700, 950, { id: 'novak', facing: -1, seed: 5, depthScale: true });
  n.scale = depthScale(950); G.actors.push(n);
  await walkTo(1420, 950, n, 0.8);
  j.facing = 1;
  await say(n, 'Good morning, darlings!');
  await say(j, 'Madame Novak?');
  await say(n, 'Control sends his regards. He also wants to know why you have stolen a mail van.');
  await say(j, 'You work for London?');
  await say(n, 'Darling, I am Control\'s mother. Who do you think got him the job?');
  await say(j, 'And the chocolates on the train?');
  await say(n, 'Expenses, darling. They were delicious.');
  await say(i, 'You knew about me. All along.');
  await say(n, 'I know about everybody, darling. It is a mother\'s job.');
  await wait(0.8);
  // a roar out of the dawn
  Sound.sfx('jet');
  await wait(0.6);
  G.jetT = G.t;
  for (const f of [j, i, a, n]) f.headTurn = -0.35;
  await wait(3.4);
  G.jetT = 0;
  for (const f of [j, i, a, n]) f.headTurn = 0;
  await say(a, 'Mama, what was that?');
  await say(n, 'That, darling, is the other problem.');
  await say(j, 'That was Nightglass. But the plans are right here, in my pocket.');
  await say(n, 'Vasko did not steal the plans to build it, Jack. He stole them because he had already built it.');
  await wait(1);
  G.fade = 1; G.fadeTo = 1;
  Sound.stopMusic(); Sound.setAmbience(['snowWind']);
  await wait(2);
  store.del(CHAPTER.saveKey);
  await Ending.cliffhanger();
}

// ---------- geese that follow Jack about -------------------------------------------
const Geese = {
  trail: [],
  reset() { this.trail = []; },
  update() {
    const j = G.jack;
    if (!j) return;
    const last = this.trail[this.trail.length - 1];
    if (!last || Math.hypot(last[0] - j.x, last[1] - j.y) > 10) this.trail.push([j.x, j.y]);
    if (this.trail.length > 200) this.trail.shift();
  },
  draw(ctx, t) {
    const j = G.jack;
    for (let k = 0; k < 3; k++) {
      const idx = this.trail.length - 1 - (k + 1) * 9;
      const [x, y] = idx >= 0 ? this.trail[idx] : [j.x - j.facing * (k + 1) * 70, j.y + (k % 2) * 10];
      drawGoose(ctx, x + (k - 1) * 12, y + 6 + (k % 2) * 8, depthScale(y) * 0.42, t + k * 1.3, j.x > x ? 1 : -1);
    }
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
  if (sc === 'cell') {
    if (!flag('uncuffed')) {
      if (!flag('gotGlove')) return think('Ilse dropped her glove at my feet. On purpose, I\'d bet my pension on it.');
      if (!flag('readGlove')) return think('There\'s something inside that glove. I should take a closer look at it.');
      return think('A nail file and a pair of handcuffs. Every schoolboy\'s dream.');
    }
    if (!flag('gotPlans')) return think('The plans are still under the mattress, where Ilse left them.');
    if (!flag('conductorGone')) return think('Kolar is outside that door. I need someone to take him away. Someone with a whistle and a grudge.');
    return think('The door is open. The dining car is forward.');
  }
  if (sc === 'corridor') {
    if (!flag('waiter')) return think(flag('readGlove') ? 'Vasko never looks at waiters. That linen cupboard might have a uniform.' : 'Ilse\'s glove might tell me what she has in mind.');
    if (!flag('plan')) return think('The dining car is forward. Ilse will be there at nine.');
    if (!flag('geeseFollowing')) return think('Geese, for Aunt Olga. They\'re in the mail van at the back of the train.');
    return think('Lead the ladies forward, through the dining car to first class.');
  }
  if (sc === 'dining') {
    if (!flag('served')) return think(has('champagne') ? 'The Colonel is waiting for his champagne.' : 'Vasko wants champagne. The chef will have some, and I know the chef.');
    if (!flag('plan')) return think('Ilse asked the waiter for water. I should see what she really wants.');
    if (!has('bread') && !flag('geeseFollowing')) return think('Geese need a reason to follow a man. Franz might have some bread.');
    if (!flag('geeseFollowing')) return think('Bread in my pocket, geese in the mail van. The mail van is at the back of the train.');
    return think('First class is forward. The ladies are ready.');
  }
  if (sc === 'first') {
    if (!flag('geeseFollowing')) return think('Olga is afraid of nothing but birds. There are three geese in the mail van, and they like bread.');
    return think('A little bread on Olga\'s carpet, and the geese will do the rest.');
  }
  if (sc === 'van3') {
    if (flag('anickaSaved')) return think(has('crowbar') ? 'The coupling, at the front end of the van. One pin, and we\'re free.' : 'That coupling pin is frozen. My old crowbar is lying on the floor.');
    if (!flag('plan')) return think('I need to talk to Ilse before anything else. She\'ll be in the dining car.');
    if (!has('bread')) return think('Geese need a good reason to follow me. Franz\'s kitchen will have one.');
    return think('A little of Tuesday\'s bread for the geese, and they\'ll follow me anywhere.');
  }
}
