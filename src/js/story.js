// ---------------------------------------------------------------------------
// Story — items, scenes, hotspots, dialogue and puzzles for the demo mission.
// ---------------------------------------------------------------------------

// ---------- items -------------------------------------------------------------
const ITEMS = {
  coins: {
    name: 'Schillings',
    desc: 'A few Austrian schillings. Enough for a newspaper, not enough for a bribe.',
    icon(c) {
      for (const [x, y, r] of [[-14, 8, 20], [12, 4, 18], [0, -12, 16]]) {
        c.fillStyle = radGrad(c, x - 5, y - 5, 2, r, [[0, '#f4e2a0'], [1, '#9a7a2a']]);
        c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
        c.strokeStyle = 'rgba(80,60,20,0.6)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r - 4, 0, 7); c.stroke();
      }
    },
  },
  pen: {
    name: 'Fountain Pen',
    desc: 'Technical Section\'s finest. Twist the cap and it fires one sleeping dart. Effective range: about four metres.',
    icon(c) {
      c.rotate(-0.7);
      c.fillStyle = linGrad(c, 0, -7, 0, 7, [[0, '#3a3a40'], [0.5, '#111'], [1, '#2a2a30']]);
      rrect(c, -38, -7, 70, 14, 6); c.fill();
      c.fillStyle = '#c9a13b'; c.fillRect(-10, -7, 4, 14); c.fillRect(10, -8, 22, 3);
      poly(c, [32, -5, 44, 0, 32, 5], '#d9c27a');
    },
  },
  newspaper: {
    name: 'Evening Paper',
    desc: 'Wiener Abendpost, evening edition. Colonel Vasko is on the front page, naturally.',
    read: true,
    icon(c) {
      c.rotate(-0.12);
      c.fillStyle = '#e8e0cc'; c.fillRect(-36, -30, 72, 60);
      c.fillStyle = '#1a1a1a'; c.fillRect(-30, -24, 60, 8);
      c.fillStyle = '#6b6b6b'; for (let i = 0; i < 5; i++) c.fillRect(-30, -10 + i * 7, i === 0 ? 28 : 60, 3);
      c.fillStyle = '#4a4a4a'; c.fillRect(4, -10, 26, 22);
    },
  },
  invitation: {
    name: 'Gala Invitation',
    desc: '"The Consul of the People\'s Republic of Karvonia requests the pleasure of Mr J. Harrow, British Trade Council." Gold-edged. Very official.',
    icon(c) {
      c.rotate(0.1);
      c.fillStyle = '#f2ead6'; c.fillRect(-38, -26, 76, 52);
      c.strokeStyle = '#c9a13b'; c.lineWidth = 3; c.strokeRect(-33, -21, 66, 42);
      c.fillStyle = '#9e1f28'; c.beginPath(); c.arc(0, -6, 7, 0, 7); c.fill();
      c.fillStyle = '#8a7a5a'; c.fillRect(-20, 6, 40, 3); c.fillRect(-14, 12, 28, 3);
    },
  },
  champagne: {
    name: 'Glass of Champagne',
    desc: 'Dom Pérignon, 1978. The workers of Karvonia are very generous tonight.',
    icon(c) { c.scale(2.2, 2.2); c.translate(0, 18); drawFlute(c, 0, 0); },
  },
  microfilm: {
    name: 'Microfilm',
    desc: 'A steel canister stamped NIGHTGLASS · STRENG GEHEIM. This is what I came for.',
    icon(c) {
      c.fillStyle = linGrad(c, -24, 0, 24, 0, [[0, '#5a6670'], [0.5, '#c8d0d6'], [1, '#4a545c']]);
      c.fillRect(-24, -26, 48, 52);
      c.fillStyle = '#2a3036'; c.fillRect(-26, -30, 52, 8); c.fillRect(-26, 22, 52, 8);
      c.fillStyle = '#9e1f28'; c.fillRect(-18, -6, 36, 12);
      c.fillStyle = '#f2ead6'; c.font = `700 9px ${FONT_UI}`; c.textAlign = 'center'; c.fillText('NIGHTGLASS', 0, 3);
    },
  },
};

async function lookItemStory(id) {
  if (id === 'newspaper') return readNewspaper();
  await say(G.jack, ITEMS[id].desc);
}

// ---------- scene lighting presets -------------------------------------------------
const LIGHT = {
  hotel: { ambient: 'rgba(12,30,48,0.3)', key: 'rgba(255,175,100,0.32)', keyX: 470 },
  street: { ambient: 'rgba(10,22,40,0.36)', key: 'rgba(255,180,100,0.28)', keyX: 850 },
  cafe: { ambient: 'rgba(40,20,5,0.22)', key: 'rgba(255,190,110,0.3)', keyX: 780, top: 'rgba(255,200,130,0.12)' },
  gate: { ambient: 'rgba(8,18,36,0.38)', key: 'rgba(255,180,90,0.34)', keyX: 1350 },
  ballroom: { ambient: 'rgba(40,24,6,0.18)', key: 'rgba(255,210,140,0.28)', keyX: 900, top: 'rgba(255,220,150,0.12)' },
  office: { ambient: 'rgba(6,16,30,0.42)', key: 'rgba(160,200,255,0.3)', keyX: 1700 },
};

// ===========================================================================
// SCENES
// ===========================================================================
const SCENES = {};

// ---------------------------------------------------------------- HOTEL ----
SCENES.hotel = {
  title: 'Hotel Imperial · Suite 412',
  music: 'hotel', ambience: ['room', 'rainWindow', 'clock', 'sirens'], floor: 'Carpet',
  paint: ctx => { paintHotel(ctx); paintHotelExtras(ctx); },
  walk: [60, 1045, 1880, 1045, 1850, 812, 90, 812],
  depth: [812, 1.72, 1045, 2.12],
  light: LIGHT.hotel,
  back(ctx, t) {
    // rain running down the window glass
    ctx.save();
    ctx.beginPath(); ctx.rect(790, 140, 300, 495); ctx.clip();
    ctx.strokeStyle = 'rgba(180,210,235,0.35)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 40; i++) {
      const x = 790 + ((i * 97) % 300), sp = 40 + (i * 37) % 80, y = 140 + ((t * sp + i * 131) % 520);
      ctx.moveTo(x, y); ctx.lineTo(x + 1, y + 14 + (i % 3) * 6);
    }
    ctx.stroke();
    // distant searchlight sweeping the sky
    const a = Math.sin(t * 0.35) * 0.5;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = linGrad(ctx, 0, 640, 0, 100, [[0, 'rgba(200,220,255,0.18)'], [1, 'rgba(0,0,0,0)']]);
    ctx.beginPath(); ctx.moveTo(1000, 640); ctx.lineTo(1000 + Math.sin(a - 0.06) * 700, 640 - Math.cos(a - 0.06) * 700); ctx.lineTo(1000 + Math.sin(a + 0.06) * 700, 640 - Math.cos(a + 0.06) * 700); ctx.fill();
    ctx.restore();
    // lamp flicker
    glow(ctx, 470, 500, 200, 'rgba(255,170,80,0.08)', 0.5 + 0.5 * Math.sin(t * 13) * Math.sin(t * 7.3));
    // phone ringing: vibrating strokes
    if (flag('phoneRinging') && Math.sin(t * 10) > 0) {
      ctx.save(); ctx.strokeStyle = 'rgba(255,230,180,0.8)'; ctx.lineWidth = 3;
      for (const d of [-1, 1]) for (let k = 0; k < 2; k++) {
        ctx.beginPath(); ctx.arc(1641, 620, 50 + k * 16, d > 0 ? -0.6 : Math.PI - 0.1, d > 0 ? 0.1 : Math.PI + 0.6); ctx.stroke();
      }
      ctx.restore();
    }
  },
  update(dt, t) {
    // occasional lightning
    if (!this._next) this._next = t + 9;
    if (t > this._next) { this._flash = 1; this._next = t + 12 + Math.random() * 14; setTimeout(() => Sound.sfx('thunder'), 900 + Math.random() * 1200); }
    if (this._flash) this._flash = Math.max(0, this._flash - dt * 2.5);
    if (flag('phoneRinging')) {
      this._ring = (this._ring || 0) - dt;
      if (this._ring <= 0) { Sound.sfx('ring'); this._ring = 2.6; }
    }
  },
  front(ctx) {
    if (this._flash) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(170,200,255,${this._flash * 0.25})`; ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  },
  async enter() {
    if (flag('introDone')) return;
    flag('introDone', true);
    G.busy = true;
    notify('Left-click to walk and act  ·  Right-click to examine  ·  Hold Tab to see everything you can use', 10);
    await wait(1.4);
    await think('Vienna in November. Rain, coffee and spies.');
    await wait(0.6);
    flag('phoneRinging', true);
    this._ring = 0;
    await wait(1.2);
    await say(G.jack, 'That will be London.');
    setObjective('Answer the telephone');
    G.busy = false;
  },
  hotspots: [
    { name: 'Window', rect: [780, 130, 320, 510],
      look: () => say(G.jack, 'Somewhere out there, the Nightglass plans are waiting for a diplomatic bag. They leave at midnight.') },
    { name: 'Painting', rect: [424, 214, 252, 192],
      look: () => say(G.jack, 'An Alpine landscape. Hotel art: pleasant and forgettable. Like me, professionally speaking.') },
    { name: 'Wardrobe', rect: [80, 195, 250, 580], at: [300, 870], useVerb: 'Open',
      look: () => say(G.jack, 'A walnut wardrobe. My evening clothes are hanging inside.'),
      async use() {
        if (flag('tux')) return say(G.jack, 'Just my trench coat and a few hangers now.');
        Sound.sfx('door');
        G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
        flag('tux', true); G.jack.look = LOOKS.jackTux;
        await wait(0.4);
        G.fadeTo = 0; await waitUntil(() => G.fade < 0.05);
        await say(G.jack, 'Dinner jacket, bow tie, cufflinks. The Karvonians will think I\'m a banker.');
        save();
      } },
    { name: 'Desk Lamp', rect: [428, 455, 90, 150],
      look: () => say(G.jack, 'A brass reading lamp. Warm light for a cold job.') },
    { name: 'Desk Drawer', rect: [555, 628, 140, 44], at: [610, 870], useVerb: 'Open',
      look: () => say(G.jack, 'The writing desk has a single drawer.'),
      async use() {
        if (has('coins') || flag('gotCoins')) return say(G.jack, 'Hotel stationery and a Gideon Bible. Nothing I need.');
        Sound.sfx('paper');
        flag('gotCoins', true); addItem('coins');
        await say(G.jack, 'A handful of schillings. Emergency funds, courtesy of Her Majesty\'s Treasury.');
      } },
    { name: 'Briefcase', rect: [515, 560, 175, 52], at: [610, 870], useVerb: 'Open',
      look: () => say(G.jack, 'My briefcase. The locks are keyed to my thumbprint. Very 1987.'),
      async use() {
        if (flag('gotPen')) return say(G.jack, 'Spare shirts, a shaving kit and a paperback. The fun gadget is in my pocket.');
        Sound.sfx('briefcase');
        await wait(0.4);
        flag('gotPen', true); addItem('pen');
        await say(G.jack, 'Standard issue from Technical Section: one fountain pen.');
        await say(G.jack, 'Twist the cap and it fires a single sleeping dart. One shot, so I\'d better make it count.');
      } },
    { name: 'Bed', rect: [1160, 420, 410, 370], at: [1360, 870], useVerb: 'Lie on',
      look: () => say(G.jack, 'Turned down, with a chocolate on the pillow. Tempting.'),
      use: () => say(G.jack, 'No time. The microfilm leaves Vienna at midnight.') },
    { name: 'Cassette Player', rect: [1414, 618, 124, 40], at: [1450, 870], useVerb: 'Play',
      look: () => say(G.jack, 'A portable cassette player. The mixtape inside is labelled "Songs to Defect To".'),
      use: () => think('Later. A little synth-pop never cracked a safe.') },
    { name: 'Mozart Chocolates', rect: [1222, 594, 66, 34], at: [1260, 870], take: async () => {
        if (flag('ateChoc')) return say(G.jack, 'I already had one. Discipline, Harrow.');
        flag('ateChoc', true); Sound.sfx('paper');
        await say(G.jack, 'Marzipan, nougat and dark chocolate. The best thing about this hotel.');
      },
      look: () => say(G.jack, 'Mozart chocolates on the pillow. Marzipan, nougat and dark chocolate.') },
    { name: 'Spy Camera', rect: [1012, 612, 60, 32], at: [1040, 870], take: () => say(G.jack, 'I\'ll leave it. The Karvonians search guests at the door, and a camera that size raises questions.'),
      look: () => say(G.jack, 'A subminiature camera, small enough to hide in a cigarette packet. Every spy\'s best friend.') },
    { name: 'Telephone', rect: [1595, 598, 95, 62], at: [1590, 870], useVerb: 'Answer',
      look: () => say(G.jack, flag('phoneRinging') ? 'It\'s ringing. Nobody calls a hotel room at this hour for good news.' : 'A black rotary telephone. Almost certainly bugged.'),
      async use() {
        if (!flag('phoneRinging')) return say(G.jack, 'Control said radio silence from here on. No more calls.');
        await phoneCall();
      } },
    { name: 'Hallway', rect: [1720, 190, 180, 600], at: [1800, 870], exitLabel: 'Leave the suite',
      look: () => say(G.jack, 'The door to the hallway.'),
      async exit() {
        if (flag('phoneRinging')) return say(G.jack, 'Not with the phone ringing. It could be London.');
        await gotoScene('street', 210, 850, 1);
      } },
  ],
};

async function phoneCall() {
  flag('phoneRinging', false);
  Sound.sfx('phoneUp');
  G.jack.facing = 1;
  G.jack.arm = 'phone';
  await wait(0.5);
  await say(G.jack, 'Harrow.');
  await say('control', 'Control here. The microfilm is inside the Karvonian Consulate, as we feared.');
  await say('control', 'Colonel Vasko is hosting a reception there tonight. You\'re going to be his guest.');
  await say(G.jack, 'Without an invitation, I suppose.');
  await say('control', 'Our contact has one for you. She\'ll be at Café Adler, across the square.');
  await say('control', 'The recognition phrase is: "Does the Danube look blue to you tonight?"');
  await say('control', 'She answers: "Only when it rains."');
  await say(G.jack, 'And if she doesn\'t?');
  await say('control', 'Then you\'ve asked a stranger about the colour of a river. Good luck, Harrow. This call never happened.');
  Sound.sfx('phoneUp');
  G.jack.arm = 'rest';
  flag('called', true);
  setObjective('Meet the contact at Café Adler');
  save();
}

// ---------------------------------------------------------------- STREET ----
SCENES.street = {
  title: 'Michaelerplatz · 21:40',
  music: 'street', ambience: ['rain', 'traffic', 'sirens', 'churchBell', 'tram'], floor: 'Cobble',
  paint: ctx => { paintStreet(ctx); paintStreetExtras(ctx); },
  walk: [0, 1045, 1920, 1045, 1920, 820, 0, 820],
  depth: [820, 1.62, 1045, 2.05],
  light: LIGHT.street,
  rain: { n: 420, ground: 1100, color: 'rgba(190,215,235,0.32)' },
  actors: () => [makeFigure('vendor', 1268, 796, { id: 'vendor', facing: -1, scale: 1.42, fixedScale: true, seed: 4, light: { ambient: 'rgba(40,20,5,0.15)', key: 'rgba(255,190,110,0.35)', keyX: 1265 } })],
  props: [{ y: 800, draw: ctx => paintKioskCounter(ctx) }],
  back(ctx, t) {
    // flickering lamps + passing headlights far down the avenue
    glow(ctx, 440, 318, 90, 'rgba(255,210,140,0.2)', 0.6 + 0.4 * Math.sin(t * 9) * Math.sin(t * 3.1));
    const car = (t * 0.09) % 1;
    if (car < 0.25) {
      const p = car / 0.25, x = 1760 - p * 260, y = 560 + p * 220, s = 0.3 + p * 1.1;
      glow(ctx, x, y, 60 * s, 'rgba(255,240,200,0.8)', 1 - p * 0.3);
      glow(ctx, x + 30 * s, y, 60 * s, 'rgba(255,240,200,0.8)', 1 - p * 0.3);
    }
  },
  hotspots: [
    { name: 'Karlskirche', rect: [1080, 150, 280, 240],
      look: () => say(G.jack, 'The dome of the Karlskirche. Baroque, beautiful, and bugged by at least three embassies.') },
    { name: 'Street Lamp', rect: [410, 280, 60, 530],
      look: () => say(G.jack, 'In this rain, the whole square looks like an oil painting. A gloomy one.') },
    { name: 'Advertising Column', rect: [1024, 450, 86, 350], at: [1066, 850],
      look: () => say(G.jack, 'Posters for Die Fledermaus at the State Opera, and a pop concert at the Stadthalle. Vienna does both with a straight face.') },
    { name: 'Little Yellow Car', rect: [1560, 680, 220, 120], at: [1660, 860],
      look: () => say(G.jack, 'A little yellow car with Munich plates. Someone\'s West German cousin is visiting.'),
      use: () => think('Stealing a car is loud. Walking is quiet.'), useVerb: 'Borrow' },
    { name: 'Café Window', rect: [720, 470, 270, 230],
      look: () => say(G.jack, 'Warm light, strong coffee, Viennese gossip. Half the spies in Europe drink here.') },
    { name: 'Hotel Imperial', rect: [100, 460, 220, 340], at: [210, 850], exitLabel: 'Enter the Hotel Imperial',
      look: () => say(G.jack, 'My hotel. Five stars, and a doorman who works for the Russians.'),
      exit: () => gotoScene('hotel', 1560, 900, -1) },
    { name: 'Café Adler', rect: [560, 465, 135, 335], at: [625, 850], exitLabel: 'Enter Café Adler',
      look: () => say(G.jack, 'Café Adler. The contact should be inside.'),
      exit: () => gotoScene('cafe', 200, 900, 1) },
    { name: 'Newspapers', rect: [1150, 505, 230, 50], at: [1200, 850],
      look: () => say(G.jack, 'Tonight\'s Abendpost. Colonel Vasko\'s moustache takes up half the front page.'),
      take: () => buyPaper() },
    { name: 'Newspaper Vendor', actor: 'vendor', at: [1200, 850],
      look: () => say(G.jack, 'An old man in a flat cap. He\'s probably sold papers here since the Habsburgs.'),
      talk: () => talkVendor(),
      async item(id) {
        if (id === 'coins') return buyPaper();
        return false;
      } },
    { name: 'Karvonian Consulate', rect: [1790, 380, 130, 460], at: [1900, 900], exitLabel: 'Walk to the Karvonian Consulate',
      look: () => say(G.jack, 'At the end of the avenue: red flags and floodlights. The Karvonian Consulate.'),
      exit: () => gotoScene('gate', 60, 905, 1) },
  ],
};

async function buyPaper() {
  const v = actor('vendor');
  if (has('newspaper') || flag('boughtPaper')) return say(v, 'You already have the last copy, sir!');
  if (!has('coins')) {
    await say(G.jack, 'I\'ll take a paper... ah. My money is back in the hotel room.');
    return say(v, 'Then the news will have to wait for you, mein Herr.');
  }
  removeItem('coins');
  Sound.sfx('coin');
  await say(v, 'Four schillings. The last evening edition. Danke schön!');
  flag('boughtPaper', true);
  addItem('newspaper');
  await say(G.jack, 'I should read this. Right-click it in my inventory.');
}

async function talkVendor() {
  const v = actor('vendor');
  await say(v, 'Evening paper, sir? Hot off the press and wet from the rain.');
  for (;;) {
    const c = await choose([
      !flag('boughtPaper') && { text: 'I\'ll take a paper.', value: 'buy' },
      { text: 'Anything interesting in the news?', value: 'news' },
      { text: 'What do you know about the Karvonian Consulate?', value: 'consulate' },
      { text: 'Goodbye.', value: 'bye' },
    ]);
    if (c === 'buy') { await say(G.jack, 'I\'ll take a paper.'); await buyPaper(); }
    if (c === 'news') {
      await say(G.jack, 'Anything interesting in the news?');
      await say(v, 'The Karvonians are throwing a party. Their Colonel is on page one again.');
      await say(v, 'Vain as a peacock, that one. They say he has his own face on his cufflinks.');
    }
    if (c === 'consulate') {
      await say(G.jack, 'What do you know about the Karvonian Consulate?');
      await say(v, 'Big black cars. Big men with no necks. And tonight, champagne by the crate.');
      await say(v, 'Back home, the Colonel\'s birthday is practically a national holiday.');
    }
    if (c === 'bye') { await say(G.jack, 'Goodbye.'); return say(v, 'Servus! Mind the puddles.'); }
  }
}

// ---------------------------------------------------------------- CAFE ----
SCENES.cafe = {
  title: 'Café Adler',
  music: 'cafe', ambience: ['room', 'babble', 'cups', 'espresso', 'vinyl'], floor: 'Marble', musicFilter: 2800,
  paint: ctx => { paintCafe(ctx); paintCafeExtras(ctx); },
  walk: [30, 1045, 1890, 1045, 1840, 838, 90, 838],
  depth: [838, 1.72, 1045, 2.05],
  light: LIGHT.cafe,
  actors: () => [
    makeFigure('franz', 645, 800, { id: 'franz', facing: 1, scale: 1.72, fixedScale: true, seed: 2 }),
    makeFigure('ilse', 1650, 862, { id: 'ilse', facing: -1, pose: 'sit', arm: 'cig', scale: 1.82, fixedScale: true, seed: 3 }),
  ],
  props: [
    { y: 805, draw: ctx => paintBarFront(ctx) },
    { y: 850, draw: ctx => paintChair(ctx, 1690, 866, 1.15, -1) },
    { y: 873, draw: ctx => paintIlseTable(ctx) },
  ],
  back(ctx, t) {
    // cigarette smoke curling from Ilse's corner
    ctx.save();
    for (let i = 0; i < 12; i++) {
      const p = ((t * 0.12 + i / 12) % 1);
      const x = 1605 + Math.sin(p * 9 + i) * 26 * p, y = 640 - p * 360;
      ctx.globalAlpha = (1 - p) * 0.12;
      ellipse(ctx, x, y, 14 + p * 60, 10 + p * 34, '#d8d0c4');
    }
    ctx.restore();
  },
  update(dt) {
    // Franz keeps an eye on the stranger.
    const f = actor('franz');
    if (f && !f.talking) f.facing = G.jack.x < f.x ? -1 : 1;
  },
  hotspots: [
    { name: 'Bottles', rect: [390, 200, 520, 280],
      look: () => say(G.jack, 'Slivovitz, Obstler, Williams pear. The Austrian answer to central heating.') },
    { name: 'Sachertorte', rect: [440, 540, 100, 50], at: [500, 880],
      look: () => say(G.jack, 'Sachertorte. Chocolate, apricot jam, and a century of lawsuits over who owns the recipe.'),
      take: () => say(G.jack, 'Franz would notice. Franz notices everything.') },
    { name: 'Newspapers', rect: [1050, 640, 120, 60], at: [1110, 880],
      look: () => say(G.jack, 'Newspapers on wooden holders, the Viennese way. Moscow, Paris and London side by side. Something for every spy in the room.') },
    { name: 'Espresso Machine', rect: [765, 440, 110, 165],
      look: () => say(G.jack, 'A brass espresso machine older than I am, and better maintained.') },
    { name: 'Windows', rect: [1010, 200, 400, 360],
      look: () => say(G.jack, 'Rain on the glass and the square beyond. Nobody followed me. I think.') },
    { name: 'Mirrors', rect: [1425, 215, 390, 280],
      look: () => say(G.jack, 'My reflection looks tired. Occupational hazard.') },
    { name: 'Gramophone', rect: [1740, 420, 170, 340], useVerb: 'Play',
      look: () => say(G.jack, 'A gramophone playing a slightly warped Glenn Miller record.'),
      use: () => say(G.jack, 'Better not touch it. The contact might think it\'s a signal.') },
    { name: 'Coat Rack', rect: [228, 330, 100, 400],
      look: () => say(G.jack, 'A grey homburg and somebody\'s umbrella. Nobody in Vienna trusts the weather.') },
    { name: 'Street', rect: [30, 250, 190, 490], at: [150, 900], exitLabel: 'Leave the café',
      exit: () => gotoScene('street', 625, 850, 1) },
    { name: 'Franz the Barman', actor: 'franz', at: [640, 880], face: 1,
      look: () => say(G.jack, 'The barman. A moustache like a boot brush and eyes that miss nothing.'),
      talk: () => talkFranz() },
    { name: 'Woman in Red', actor: 'ilse', at: [1400, 905], face: 1,
      look: () => say(G.jack, 'Platinum hair, red coat, and a cigarette she isn\'t really smoking. That\'s my contact, or my funeral.'),
      talk: () => talkIlse(),
      item: async id => {
        if (id === 'champagne') return say(actor('ilse'), 'I don\'t drink on duty, Mr. Harrow.');
        return false;
      } },
  ],
};

function paintChair(ctx, x, y, s, dir) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  ctx.strokeStyle = '#2a1408'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-30, 0); ctx.lineTo(-24, -54); ctx.moveTo(30, 0); ctx.lineTo(24, -54);
  ctx.moveTo(26, -54); ctx.quadraticCurveTo(40, -110, 26, -150); ctx.quadraticCurveTo(10, -160, 12, -120);
  ctx.stroke();
  ellipse(ctx, 0, -56, 36, 7, '#3a1e0c');
  ctx.restore();
}

async function talkFranz() {
  const f = actor('franz');
  f.facing = -1;
  await say(f, 'Grüß Gott. What can I get you, mein Herr?');
  for (;;) {
    const c = await choose([
      { text: 'A Melange, please.', value: 'coffee' },
      { text: 'Who is the lady in red?', value: 'lady' },
      { text: 'Heard anything about the Karvonian party?', value: 'party' },
      { text: 'Nothing, thanks.', value: 'bye' },
    ]);
    if (c === 'coffee') {
      await say(G.jack, 'A Melange, please.');
      Sound.sfx('clink');
      await say(f, 'Bitte sehr. On the house, for a gentleman who says please.');
      await say(G.jack, 'Perfect. Now I can face the Cold War.');
    }
    if (c === 'lady') {
      await say(G.jack, 'Who is the lady in red?');
      await say(f, 'Fräulein Ilse. Every evening she orders one coffee, smokes ten cigarettes and speaks to nobody.');
      await say(f, 'Perhaps you will be the exception.');
    }
    if (c === 'party') {
      await say(G.jack, 'Heard anything about the Karvonian party?');
      await say(f, 'Their waiters came here for ice this afternoon. Forty bottles of champagne, for eighty guests.');
      await say(f, 'And the old Baron von Katz is invited. Somebody will get very drunk. Probably him.');
    }
    if (c === 'bye') { await say(G.jack, 'Nothing, thanks.'); return say(f, 'Bitte. I am here if you need me.'); }
  }
}

async function talkIlse() {
  const i = actor('ilse');
  if (flag('ilseDone')) {
    await say(i, 'Why are you still here? Vasko\'s safe won\'t open itself.');
    await say(i, 'Remember, Jack: that man is in love with himself. Every detail of his life is about him.');
    return;
  }
  await say(i, 'This table is taken.');
  for (;;) {
    const c = await choose([
      flag('called') && { text: 'Does the Danube look blue to you tonight?', value: 'code' },
      { text: 'Lovely evening, isn\'t it?', value: 'weather' },
      { text: 'Can I buy you a drink?', value: 'drink' },
      { text: 'Sorry to bother you.', value: 'bye' },
    ]);
    if (c === 'weather') { await say(G.jack, 'Lovely evening, isn\'t it?'); await say(i, 'It is raining, and you are boring me.'); }
    if (c === 'drink') { await say(G.jack, 'Can I buy you a drink?'); await say(i, 'I have a coffee. And standards.'); }
    if (c === 'bye') { await say(G.jack, 'Sorry to bother you.'); return; }
    if (c === 'code') { await ilseBriefing(i); return; }
  }
}

async function ilseBriefing(i) {
  await say(G.jack, 'Does the Danube look blue to you tonight?');
  i.arm = 'rest';
  await wait(0.8);
  await say(i, '...Only when it rains.');
  await say(i, 'You are late, Mr. Harrow. Don\'t sit down. Just listen.');
  await say(i, 'Vasko keeps the microfilm in a wall safe in his private office, upstairs in the consulate.');
  await say(i, 'Here is your invitation. Guests only, black tie. Try not to embarrass me.');
  addItem('invitation');
  await say(G.jack, 'And the combination for the safe?');
  await say(i, 'Nobody knows it but Vasko. But he is the vainest man in Vienna. Everything he owns is about himself.');
  await say(i, 'Tonight the whole consulate is celebrating his birthday. Think about that.');
  await say(G.jack, 'And if there are guards on the stairs?');
  await say(i, 'Karvonian soldiers never leave their posts... unless there is a scandal. They hate a scandal.');
  i.arm = 'cig';
  flag('ilseDone', true);
  setObjective(flag('tux') ? 'Get into the consulate reception' : 'Get into the reception (black tie required)');
  save();
}

// ---------------------------------------------------------------- GATE ----
SCENES.gate = {
  title: 'Consulate of the People\'s Republic of Karvonia',
  music: 'tension', ambience: ['rain', 'wind', 'traffic', 'engineIdle', 'flags'], floor: 'Cobble',
  paint: paintGate,
  walk: [0, 1045, 1920, 1045, 1920, 828, 0, 828],
  depth: [828, 1.62, 1045, 2.02],
  light: LIGHT.gate,
  rain: { n: 420, ground: 1100, color: 'rgba(190,215,235,0.32)' },
  actors: () => [makeFigure('guard', flag('passedGate') ? 1150 : 1215, 862, { id: 'gateGuard', facing: -1, arm: 'behind', seed: 6, depthScale: true })],
  back(ctx, t) {
    // Karvonian flags rippling in the wind
    for (const [fx, fy] of [[930, 180], [1780, 180]]) {
      ctx.fillStyle = '#c9a13b'; ctx.fillRect(fx - 3, fy, 6, 190);
      ctx.beginPath(); ctx.moveTo(fx + 3, fy + 6);
      for (let k = 0; k <= 10; k++) ctx.lineTo(fx + 3 + k * 12, fy + 6 + Math.sin(t * 4 + k * 0.7) * (k * 0.9));
      for (let k = 10; k >= 0; k--) ctx.lineTo(fx + 3 + k * 12, fy + 76 + Math.sin(t * 4 + k * 0.7) * (k * 0.9));
      ctx.closePath();
      ctx.fillStyle = linGrad(ctx, fx, 0, fx + 120, 0, [[0, '#7a1020'], [0.5, '#b31c2e'], [1, '#6a0c18']]); ctx.fill();
      ellipse(ctx, fx + 40, fy + 40 + Math.sin(t * 4 + 2) * 3, 10, 10, '#d9b35c');
    }
  },
  hotspots: [
    { name: 'Consulate', rect: [660, 150, 1260, 380],
      look: () => say(G.jack, 'Neoclassical columns, floodlights, and a lot of men with rifles. Karvonian taste.') },
    { name: 'Limousine', rect: [90, 640, 560, 170],
      look: () => say(G.jack, 'A Tatra 613 with diplomatic plates. The chauffeur is pretending to read a newspaper upside down.') },
    { name: 'Sentry Box', rect: [1510, 520, 120, 280],
      look: () => say(G.jack, 'A striped sentry box. Empty. Everyone is at the front door tonight.') },
    { name: 'Square', rect: [0, 360, 90, 460], at: [40, 905], exitLabel: 'Back to the square',
      exit: () => gotoScene('street', 1860, 905, -1) },
    { name: 'Consulate Entrance', rect: [1265, 490, 175, 310], at: [1350, 845], exitLabel: 'Enter the consulate',
      look: () => say(G.jack, 'Warm light, red carpet, and a string quartet playing inside.'),
      async exit() {
        if (flag('passedGate')) return enterConsulate();
        const g = actor('gateGuard');
        return say(g, 'Halt! Guests only. Invitation, please.');
      } },
    { name: 'Guard', actor: 'gateGuard', at: [1080, 880], face: 1,
      look: () => say(G.jack, 'A Karvonian soldier. He looks like he was carved out of the same stone as the building.'),
      talk: () => talkGateGuard(),
      async item(id) {
        if (id === 'invitation') return showInvitation();
        if (id === 'pen') return say(G.jack, 'Put him to sleep in front of twenty others? I\'d be the next one on the floor.');
        if (id === 'coins') return say(actor('gateGuard'), 'Are you trying to bribe a soldier of Karvonia? With FOUR schillings?');
        return false;
      } },
  ],
};

async function talkGateGuard() {
  const g = actor('gateGuard');
  if (flag('passedGate')) return say(g, 'Please go inside, sir. The Colonel does not like empty rooms.');
  await say(G.jack, 'Good evening.');
  if (!flag('tux')) {
    await say(g, 'Halt. This is a private reception. Black tie only.');
    await say(g, 'You look like the detective from a cheap film.');
    await say(G.jack, 'Everyone\'s a critic. My dinner jacket is back at the hotel.');
    setObjective('Change into black tie at the hotel');
    return;
  }
  if (!has('invitation')) {
    await say(g, 'Good evening, sir. Your invitation, please.');
    await say(G.jack, 'It must be in my other jacket.');
    await say(g, 'Then you and your other jacket may wait outside.');
    return;
  }
  await say(g, 'Good evening, sir. Your invitation, please.');
  await showInvitation();
}

async function showInvitation() {
  const g = actor('gateGuard');
  if (!flag('tux')) {
    await say(g, 'An invitation is not enough, sir. Black tie only. You are dressed for a funeral in the rain.');
    await say(G.jack, 'My dinner jacket is back at the hotel.');
    setObjective('Change into black tie at the hotel');
    return;
  }
  removeItem('invitation');
  Sound.sfx('paper');
  await say(g, 'Mr. J. Harrow, British Trade Council. Welcome to Karvonia, sir.');
  await say(g, 'Enjoy the celebration of the Colonel\'s birthday.');
  flag('passedGate', true);
  g.facing = 1;
  await walkTo(1150, 862, g);
  g.facing = -1;
  setObjective('Find a way upstairs to Vasko\'s office');
  await enterConsulate();
}
async function enterConsulate() {
  await walkTo(1350, 832);
  await gotoScene('ballroom', 150, 900, 1);
}

// ---------------------------------------------------------------- BALLROOM ----
SCENES.ballroom = {
  title: 'The Colonel\'s Birthday Gala',
  music: 'gala', ambience: ['crowd', 'babble', 'glasses'], floor: 'Wood',
  paint: ctx => { paintBallroom(ctx); paintBallroomExtras(ctx); },
  walk: [30, 1045, 1890, 1045, 1830, 838, 90, 838],
  depth: [838, 1.66, 1045, 2.02],
  light: LIGHT.ballroom,
  actors() {
    const list = [makeFigure('waiter', 480, 872, { id: 'waiter', facing: 1, arm: 'tray', seed: 7, depthScale: true, trayGlasses: 3 })];
    if (!flag('stairsClear')) {
      list.push(makeFigure('baron', 1010, 905, { id: 'baron', facing: 1, arm: 'drunk', seed: 8, depthScale: true }));
      list.push(makeFigure('guard', 1510, 858, { id: 'stairGuard', facing: -1, arm: 'behind', seed: 9, depthScale: true }));
    }
    return list;
  },
  back(ctx, t) {
    drawChandelier(ctx, 640, 210, t);
    drawChandelier(ctx, 1180, 210, t);
    drawDancers(ctx, t);
  },
  hotspots: [
    { name: 'Colonel Vasko\'s Portrait', rect: [584, 234, 222, 282],
      look: () => say(G.jack, 'Colonel Dragan Vasko, painted as a war hero. The only battle he ever won was against good taste.') },
    { name: 'Grand Piano', rect: [556, 550, 260, 230], at: [680, 880], useVerb: 'Play',
      look: () => say(G.jack, 'A Viennese concert grand, black as a hearse. Nobody has touched it all night.'),
      use: () => think('Chopsticks, in front of eighty diplomats? That would be one way to get noticed.') },
    { name: 'Champagne Tower', rect: [200, 600, 330, 190], at: [360, 870],
      look: () => say(G.jack, 'A champagne tower. One wrong move and it\'s the most expensive domino rally in Vienna.'),
      take: () => say(G.jack, 'I\'d bring the whole tower down. The waiter has glasses on his tray.') },
    { name: 'Dancers', rect: [640, 640, 640, 150],
      look: () => say(G.jack, 'Diplomats, generals and their wives, waltzing like nothing is wrong. Maybe for them, nothing is.') },
    { name: 'Entrance Hall', rect: [30, 340, 160, 450], at: [150, 900], exitLabel: 'Leave the reception',
      exit: () => gotoScene('gate', 1350, 845, 1) },
    { name: 'Grand Staircase', rect: [1560, 330, 360, 470], at: [1600, 860], exitLabel: 'Climb the stairs',
      look: () => say(G.jack, flag('stairsClear') ? 'The staircase is unguarded now. Vasko\'s office is up there.' : 'The staircase to the private floor. And one very large guard.'),
      async exit() {
        if (!flag('stairsClear')) {
          await say(actor('stairGuard'), 'Sir! The upper floor is private. Please return to the reception.');
          return;
        }
        await walkTo(1640, 850);
        G.jack.depthLock = true;
        await climbStairs();
      } },
    { name: 'Waiter', actor: 'waiter', at: [620, 890], face: -1,
      look: () => say(G.jack, 'A waiter with a silver tray and a smile he gets paid for.'),
      talk: () => talkWaiter() },
    { name: 'Baron von Katz', actor: 'baron', at: [880, 915], face: 1,
      look: () => say(G.jack, 'A red-faced aristocrat with a monocle and an empty glass. The glass seems to offend him deeply.'),
      talk: () => talkBaron(),
      async item(id) {
        if (id === 'champagne') return baronScandal();
        if (id === 'pen') return say(G.jack, 'Tempting. But a sleeping baron is a lot less useful than a noisy one.');
        return false;
      } },
    { name: 'Guard', actor: 'stairGuard', at: [1380, 870], face: 1,
      look: () => say(G.jack, 'He\'s guarding the stairs like his pension depends on it. It probably does.'),
      talk: async () => {
        const g = actor('stairGuard');
        await say(G.jack, 'Lovely party.');
        await say(g, 'The upper floor is private, sir. Please enjoy the reception.');
      },
      async item(id) {
        if (id === 'pen') return say(G.jack, 'Shoot a soldier in the middle of a crowded ballroom? Subtle, Harrow. Very subtle.');
        if (id === 'champagne') return say(actor('stairGuard'), 'Not on duty, sir.');
        return false;
      } },
  ],
};

function drawDancers(ctx, t) {
  // Silhouetted couples waltzing behind the action.
  ctx.save();
  const couples = [[760, 0], [980, 2.1], [1220, 4.2]];
  for (const [cx, ph] of couples) {
    const a = t * 0.8 + ph;
    const x = cx + Math.cos(a) * 60, y = 800 + Math.sin(a) * 10, s = 0.85 + Math.sin(a) * 0.05;
    for (const side of [-1, 1]) {
      const dx = x + side * 12 * Math.cos(a * 2) * s;
      ctx.globalAlpha = 0.55;
      if (side < 0) { // gown
        poly(ctx, [dx - 10 * s, y - 110 * s, dx + 10 * s, y - 110 * s, dx + 34 * s, y, dx - 34 * s, y], '#4a1020');
        ctx.fillRect(dx - 9 * s, y - 150 * s, 18 * s, 44 * s);
      } else {
        ctx.fillStyle = '#0d0e12'; ctx.fillRect(dx - 11 * s, y - 150 * s, 22 * s, 150 * s);
      }
      ellipse(ctx, dx, y - 164 * s, 10 * s, 12 * s, side < 0 ? '#3a2410' : '#1a120c');
    }
  }
  ctx.restore();
}

async function talkWaiter() {
  const w = actor('waiter');
  if (has('champagne')) return say(w, 'You still have a full glass, sir. Enjoy.');
  await say(w, 'Champagne, sir?');
  const c = await choose([
    { text: 'Yes, thank you.', value: 'yes' },
    { text: 'Who is the gentleman with the monocle?', value: 'baron' },
    { text: 'No, thank you.', value: 'no' },
  ]);
  if (c === 'yes') {
    await say(G.jack, 'Yes, thank you.');
    Sound.sfx('clink');
    w.trayGlasses = Math.max(0, (w.trayGlasses ?? 3) - 1);
    addItem('champagne');
    return say(w, 'Dom Pérignon, seventy-eight. Compliments of the Colonel.');
  }
  if (c === 'baron') {
    await say(G.jack, 'Who is the gentleman with the monocle?');
    await say(w, 'Baron von Katz. He has asked me for champagne eleven times. I am instructed to stop at ten.');
    return say(w, 'Between us, sir, he becomes... very loud.');
  }
  return say(G.jack, 'No, thank you.');
}

async function talkBaron() {
  const b = actor('baron');
  await say(b, 'Ah! Another Englishman! Or Swiss? You all look the same in black.');
  for (;;) {
    const c = await choose([
      { text: 'Who are you?', value: 'who' },
      { text: 'Enjoying the party?', value: 'party' },
      { text: 'What do you think of Colonel Vasko?', value: 'vasko' },
      { text: 'Excuse me.', value: 'bye' },
    ]);
    if (c === 'who') {
      await say(G.jack, 'And you are?');
      await say(b, 'Baron Friedrich von Katz. Eleventh of my name. Last of my fortune.');
    }
    if (c === 'party') {
      await say(G.jack, 'Enjoying the party?');
      await say(b, 'I would be, if these barbarians refilled my glass! A Baron, left DRY! It is a scandal!');
      await say(G.jack, 'A scandal. How interesting.');
    }
    if (c === 'vasko') {
      await say(G.jack, 'What do you think of Colonel Vasko?');
      await say(b, 'Dreadful bore. He makes us toast his portrait every hour. "Happy birthday, dear Dragan..."');
      await say(b, 'Forty-one years old and still no taste in wine.');
    }
    if (c === 'bye') { await say(G.jack, 'Excuse me.'); return say(b, 'Go, go. And send me a waiter!'); }
  }
}

async function baronScandal() {
  const b = actor('baron'), g = actor('stairGuard');
  removeItem('champagne');
  await say(G.jack, 'Baron. Allow me.');
  b.holding = 'glass';
  await say(b, 'At last! A man of culture!');
  Sound.sfx('drink');
  await wait(0.8);
  b.arm = 'toast';
  await say(b, 'LADIES AND GENTLEMEN! A TOAST!');
  Sound.stopMusic();
  b.facing = 1;
  await walkTo(1300, 880, b, 0.8);
  await say(b, 'TO COLONEL VASKO... AND HIS MAGNIFICENT, RIDICULOUS MOUSTACHE!');
  Sound.sfx('clink');
  await say(b, 'Happy birthday to yoooou... in a dictatorship toooo...');
  g.arm = 'rest'; g.facing = -1;
  await walkTo(1400, 872, g);
  await say(g, 'Sir! You are making a scene!');
  await say(b, 'A scene? My dear boy, I AM the scene!');
  await say(g, 'Please come with me, sir. Some fresh air.');
  Sound.playMusic('gala');
  b.arm = 'drunk'; b.facing = -1;
  g.facing = -1;
  const pb = walkTo(150, 890, b, 0.9);
  await wait(0.35);
  const pg = walkTo(210, 875, g, 0.9);
  await Promise.all([pb, pg]);
  removeActor('baron'); removeActor('stairGuard');
  Sound.sfx('door');
  flag('stairsClear', true);
  await think('Karvonians hate a scandal. Ilse was right.');
  setObjective('Climb the stairs to Vasko\'s office');
  save();
}

async function climbStairs() {
  // Up the red carpet to the private floor.
  const j = G.jack;
  const steps = [[1720, 760], [1800, 650], [1860, 540]];
  for (const [x, y] of steps) {
    j.scaleMul = 1;
    await walkToFree(x, y, 1.65 - (850 - y) * 0.0012);
  }
  j.depthLock = false;
  await gotoScene('office', 200, 890, 1);
}
// Walk without depth scaling (used on stairs).
function walkToFree(x, y, scale) {
  const j = G.jack;
  const sx = j.x, sy = j.y, ss = j.scale, d = dist(sx, sy, x, y);
  return new Promise(res => {
    let p = 0;
    j.walking = true;
    j.facing = x < sx ? -1 : 1;
    const speed = 260;
    let lastT = G.t;
    const tick = () => {
      const dt = G.t - lastT; lastT = G.t;
      p = Math.min(1, p + speed * dt / d);
      j.x = lerp(sx, x, p); j.y = lerp(sy, y, p); j.scale = lerp(ss, scale, p);
      j.walkPhase += speed * dt / (44 * j.scale) * Math.PI;
      if (p >= 1) { j.walking = false; res(); } else requestAnimationFrame(tick);
    };
    j.target = null;
    tick();
  });
}

// ---------------------------------------------------------------- OFFICE ----
SCENES.office = {
  title: 'Private Office · Upper Floor',
  music: 'tension', ambience: ['room', 'rainWindow', 'clock', 'sirens'], floor: 'Wood',
  paint: ctx => { paintOffice(ctx); paintOfficeExtras(ctx); },
  walk: [50, 1045, 1880, 1045, 1840, 836, 110, 836],
  depth: [836, 1.72, 1045, 2.06],
  light: LIGHT.office,
  actors() {
    if (!flag('guardDown')) return [];
    return [makeFigure('guard', 420, 910, { id: 'officeGuard', facing: 1, slump: true, seed: 10, depthScale: true })];
  },
  back(ctx, t) {
    // searchlights raking the sky outside the window
    ctx.save();
    ctx.beginPath(); ctx.rect(1548, 158, 274, 524); ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    for (const [x0, sp, ph] of [[1620, 0.5, 0], [1760, 0.37, 2]]) {
      const a = Math.sin(t * sp + ph) * 0.45;
      ctx.fillStyle = linGrad(ctx, 0, 700, 0, 150, [[0, 'rgba(210,225,255,0.3)'], [1, 'rgba(0,0,0,0)']]);
      ctx.beginPath(); ctx.moveTo(x0, 700); ctx.lineTo(x0 + Math.sin(a - 0.07) * 700, 700 - Math.cos(a - 0.07) * 700); ctx.lineTo(x0 + Math.sin(a + 0.07) * 700, 700 - Math.cos(a + 0.07) * 700); ctx.fill();
    }
    ctx.restore();
    glow(ctx, 933, 580, 150, 'rgba(255,210,130,0.1)', 0.6 + 0.4 * Math.sin(t * 11) * Math.sin(t * 4.3));
  },
  update(dt) {
    if (flag('standoff') && !flag('guardDown')) {
      G.standoffT -= dt;
      if (G.standoffT <= 0 && !G.busy && !G.speech.length && !G.choices) run(() => caughtInOffice());
    }
  },
  front(ctx, t) {
    if (flag('standoff') && !flag('guardDown')) {
      const s = Math.max(0, G.standoffT);
      ctx.save();
      ctx.fillStyle = `rgba(160,10,20,${0.12 + 0.08 * Math.sin(t * 8)})`; ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.font = `600 24px ${FONT_UI}`; ctx.fillStyle = '#ffb0b0';
      ctx.fillText('ACT NOW · SOMETHING IN YOUR POCKETS COULD HELP', W / 2, 150);
      ctx.font = `700 72px ${FONT_UI}`; ctx.fillStyle = '#fff';
      ctx.fillText('00:' + String(Math.ceil(s)).padStart(2, '0'), W / 2, 225);
      ctx.restore();
    }
  },
  async enter() {
    if (flag('officeSeen')) return;
    flag('officeSeen', true);
    G.busy = true;
    await wait(0.8);
    await think('Vasko\'s office. Portrait, flag, safe. The man decorated a room around his own face.');
    setObjective('Open the wall safe');
    G.busy = false;
  },
  hotspots: [
    { name: 'Portrait of Vasko', rect: [284, 134, 292, 372],
      look: () => say(G.jack, 'An even bigger portrait of Vasko. Two in one building. That tells you everything about the man.') },
    { name: 'Brass Plaque', rect: [365, 512, 130, 36],
      look: () => say(G.jack, '"COL. D. VASKO." In case he forgets his own face.') },
    { name: 'Bookcase', rect: [1290, 160, 210, 600],
      look: () => say(G.jack, 'The Collected Speeches of Colonel Vasko, volumes one to nine. The spines have never been cracked.') },
    { name: 'Flag', rect: [1225, 240, 70, 250],
      look: () => say(G.jack, 'The flag of the People\'s Republic of Karvonia. Red, for reasons nobody will say out loud.') },
    { name: 'Desk', rect: [826, 600, 448, 180], at: [1000, 880], useVerb: 'Search',
      look: () => say(G.jack, 'A desk the size of a small country. Karvonia, for example.'),
      async use() {
        Sound.sfx('paper');
        await say(G.jack, 'Invoices, a signed photograph of himself... and a birthday card.');
        await say(G.jack, '"To my little Dragan, forty-one today! Love, Mama." A desk calendar has today circled in red: the 14th of November, 1987.');
        flag('sawCard', true);
      } },
    { name: 'Typewriter', rect: [1030, 536, 92, 66], at: [1060, 880],
      async look() {
        await say(G.jack, 'A typewriter with a fresh ribbon. The last letter is still on the roller.');
        await say(G.jack, '"Shipment confirmed. Friday. Karvograd, platform nine." Interesting.');
        flag('sawTypewriter', true);
      } },
    { name: 'Tape Recorder', rect: [255, 572, 140, 80], at: [330, 880],
      look: () => say(G.jack, 'A reel-to-reel recorder, wired into the telephone line. Vasko bugs his own calls.'),
      use: () => think('Tempting, but there\'s no time to listen to eight hours of Vasko.'), useVerb: 'Play' },
    { name: 'Globe', rect: [690, 660, 110, 130], at: [745, 880], useVerb: 'Open',
      look: () => say(G.jack, 'A globe that opens into a drinks cabinet. Karvonia is painted twice its real size.'),
      use: () => say(G.jack, 'Plum brandy and a bottle of French cognac. No microfilm. Worth a look, though.') },
    { name: 'Green Lamp', rect: [880, 520, 110, 90],
      look: () => say(G.jack, 'A banker\'s lamp. The only green thing in Karvonia.') },
    { name: 'Wall Safe', rect: [640, 320, 160, 170], at: [720, 880], face: -1, useVerb: 'Open',
      look: () => say(G.jack, 'A wall safe with a six-digit electronic keypad. West German, very expensive.'),
      async use() {
        if (flag('safeOpen')) return say(G.jack, 'Empty now, apart from a spare jar of moustache wax.');
        const ok = await openKeypad();
        if (ok) await safeOpened();
      } },
    { name: 'Guard', actor: 'officeGuard', at: [560, 900], face: -1,
      look: () => say(G.jack, flag('guardDown') ? 'Snoring like a tractor. He\'ll wake up with a headache and no idea what happened.' : 'A Karvonian guard with a pistol pointed at my chest.'),
      talk: async () => {
        if (flag('guardDown')) return say(G.jack, 'Sweet dreams, soldier.');
        await say(G.jack, 'Easy, soldier. I\'m just here to fix the plumbing.');
        await say(actor('officeGuard'), 'In a dinner jacket? Hands UP!');
      },
      async item(id) {
        if (flag('guardDown')) return say(G.jack, 'He\'s had enough for one night.');
        if (id === 'pen') return fireDart();
        if (id === 'champagne') return say(actor('officeGuard'), 'I do not drink with thieves!');
        return false;
      } },
    { name: 'Door', rect: [50, 260, 170, 530], at: [170, 890], exitLabel: 'Go back downstairs',
      async exit() {
        if (flag('standoff') && !flag('guardDown')) return say(G.jack, 'Not with a pistol in my back.');
        if (has('microfilm')) return say(G.jack, 'Back down the stairs? Every guard in the building is on his way up.');
        return gotoScene('ballroom', 1600, 860, -1);
      } },
    { name: 'Window', rect: [1540, 150, 290, 540], at: [1690, 880], exitLabel: 'Climb out of the window',
      look: () => say(G.jack, 'A window onto the rooftops. Searchlights are sweeping the sky out there.'),
      async exit() {
        if (!has('microfilm')) return say(G.jack, 'Not until I have what I came for.');
        if (!flag('guardDown')) return say(G.jack, 'He\'d shoot me before I got the latch open.');
        await say(G.jack, 'The rooftops it is. Ilse said she\'d have a car waiting on the Ring.');
        G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
        Rooftop.start();
      } },
  ],
};

async function safeOpened() {
  flag('safeOpen', true);
  Sound.sfx('unlock');
  await wait(0.6);
  addItem('microfilm');
  await say(G.jack, 'A steel canister, stamped NIGHTGLASS. Got you.');
  save();
  await startStandoff(true);
}
async function startStandoff(first) {
  Sound.playMusic('action');
  Sound.sfx('step'); await wait(0.3); Sound.sfx('step'); await wait(0.3); Sound.sfx('step');
  await wait(0.4);
  Sound.sfx('door');
  const g = makeFigure('guard', 180, 900, { id: 'officeGuard', facing: 1, arm: 'point', seed: 10, depthScale: true });
  g.scale = depthScale(900);
  G.actors.push(g);
  G.jack.facing = -1;
  flag('standoff', true);
  G.standoffT = 10;
  G.pickupFlash = null;
  Sound.sfx('sting');
  await say(g, first ? 'STOP! Hands where I can see them!' : 'You again! HANDS UP!');
  setObjective('Deal with the guard, fast');
}
async function fireDart() {
  const g = actor('officeGuard');
  faceTo(g.x);
  G.jack.arm = 'point';
  await wait(0.35);
  Sound.sfx('dart');
  await wait(0.2);
  flag('guardDown', true);
  flag('standoff', false);
  removeItem('pen');
  await say(g, 'What th...', { dur: 1.1 });
  Sound.sfx('thud');
  g.slump = true; g.arm = 'rest';
  G.jack.arm = 'rest';
  Sound.playMusic('tension');
  await wait(0.6);
  await say(G.jack, 'Ten seconds to lights-out, just as Technical Section promised.');
  setObjective('Escape through the window');
  save();
}
async function caughtInOffice() {
  const g = actor('officeGuard');
  Sound.sfx('alarm');
  await say(g, 'Too slow, English. GUARDS! UP HERE!');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  removeActor('officeGuard');
  flag('standoff', false);
  G.jack.x = 720; G.jack.y = 880; G.jack.facing = -1;
  notify('Caught! The guard got the drop on you. Try again.');
  await wait(0.6);
  G.fadeTo = 0; await waitUntil(() => G.fade < 0.05);
  await startStandoff(false);
}

// ---------- newspaper overlay ----------------------------------------------------
function readNewspaper() {
  return new Promise(resolve => {
    Sound.sfx('paper');
    flag('readPaper', true);
    G.overlay = {
      t: 0,
      draw(ctx, dt) {
        this.t += dt;
        const a = clamp(this.t * 4, 0, 1);
        ctx.save();
        ctx.fillStyle = `rgba(0,0,0,${0.7 * a})`; ctx.fillRect(0, 0, W, H);
        ctx.translate(W / 2, H / 2); ctx.rotate(-0.025); ctx.scale(0.9 + a * 0.1, 0.9 + a * 0.1); ctx.globalAlpha = a;
        const pw = 1000, ph = 900;
        ctx.fillStyle = '#e9e1cc'; ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
        ctx.fillStyle = 'rgba(120,100,60,0.12)'; for (let i = 0; i < 20; i++) ctx.fillRect(-pw / 2, -ph / 2 + i * 45, pw, 1);
        ctx.fillStyle = '#141414'; ctx.textAlign = 'center';
        ctx.font = `700 76px ${FONT_DISPLAY}`; ctx.fillText('Wiener Abendpost', 0, -ph / 2 + 100);
        ctx.fillRect(-pw / 2 + 40, -ph / 2 + 122, pw - 80, 3);
        ctx.font = `500 22px ${FONT_TYPE}`;
        ctx.fillText('ABENDAUSGABE  ·  SAMSTAG, 14. NOVEMBER 1987  ·  PREIS 4 SCHILLING', 0, -ph / 2 + 156);
        ctx.fillRect(-pw / 2 + 40, -ph / 2 + 170, pw - 80, 1);
        ctx.font = `700 50px ${FONT_DISPLAY}`;
        ctx.fillText('Karvonian Colonel Turns 41', 0, -ph / 2 + 240);
        ctx.font = `italic 500 30px ${FONT_DISPLAY}`;
        ctx.fillText('Lavish gala at the consulate tonight', 0, -ph / 2 + 284);
        // photo
        ctx.save(); ctx.translate(-pw / 2 + 60, -ph / 2 + 320);
        ctx.fillStyle = '#3a3a3a'; ctx.fillRect(0, 0, 380, 440);
        ctx.filter = 'grayscale(1) contrast(1.2)';
        paintVaskoPortrait(ctx, 30, 30, 320, 380);
        ctx.filter = 'none';
        ctx.restore();
        ctx.textAlign = 'left'; ctx.fillStyle = '#1a1a1a';
        ctx.font = `500 22px ${FONT_TYPE}`;
        const body = 'VIENNA — Colonel Dragan Vasko, military attaché of the People\'s Republic of Karvonia, celebrates his birthday tonight with a gala for eighty guests. Born in Karvograd on 14 November 1946, the Colonel is known for his medals, his moustache and his modesty, according to his own press office. The consulate has ordered forty bottles of French champagne for the occasion. Police have closed the Rennweg until midnight.';
        wrapText(ctx, body, 470).forEach((l, i) => ctx.fillText(l, -pw / 2 + 470, -ph / 2 + 345 + i * 31));
        ctx.font = `italic 500 20px ${FONT_TYPE}`;
        ctx.fillText('Col. Vasko, in a portrait he commissioned himself.', -pw / 2 + 60, ph / 2 - 40);
        ctx.restore();
        ctx.save(); ctx.globalAlpha = a * 0.8;
        ctx.textAlign = 'center'; ctx.font = `600 26px ${FONT_UI}`; ctx.fillStyle = '#f0e4c8';
        ctx.fillText('Click to put the paper away', W / 2, H - 30);
        ctx.restore();
      },
      click() {
        if (this.t < 0.3) return;
        G.overlay = null;
        resolve();
        run(async () => { await think('Born on the 14th of November, 1946. Everything about him is about him. Worth remembering.'); });
      },
      key(k) { if (k === 'Escape' || k === ' ' || k === 'Enter') this.click(); },
    };
  });
}

// ---------- safe keypad overlay ----------------------------------------------------
function openKeypad() {
  return new Promise(resolve => {
    const code = '141146';
    const pad = {
      t: 0, entry: '', state: 'idle', stT: 0, tries: 0,
      keys() {
        const out = [], x0 = W / 2 - 170, y0 = 400;
        const labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'];
        labels.forEach((l, i) => out.push({ l, x: x0 + (i % 3) * 120, y: y0 + Math.floor(i / 3) * 110, w: 100, h: 90 }));
        return out;
      },
      press(l) {
        if (this.state !== 'idle') return;
        Sound.sfx('beep');
        if (l === 'C') this.entry = '';
        else if (l === 'OK') this.submit();
        else if (this.entry.length < 6) { this.entry += l; if (this.entry.length === 6) setTimeout(() => this.submit(), 250); }
      },
      submit() {
        if (this.state !== 'idle') return;
        if (this.entry === code) { this.state = 'ok'; this.stT = 0; Sound.sfx('unlock'); }
        else { this.state = 'bad'; this.stT = 0; this.tries++; Sound.sfx('error'); }
      },
      close(ok) {
        G.overlay = null;
        resolve(ok);
        if (!ok && this.tries >= 2) {
          run(async () => {
            if (flag('readPaper') || flag('sawCard')) await say(G.jack, 'Six digits. Ilse said everything Vasko owns is about himself... Day, month, year?');
            else await say(G.jack, 'Six digits. I need to know more about the Colonel. Something personal. His desk, or the evening paper, might help.');
          });
        }
      },
      draw(ctx, dt) {
        this.t += dt; this.stT += dt;
        if (this.state === 'bad' && this.stT > 0.9) { this.state = 'idle'; this.entry = ''; }
        if (this.state === 'ok' && this.stT > 1.0) return this.close(true);
        const a = clamp(this.t * 5, 0, 1);
        ctx.save(); ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(0, 0, W, H);
        // steel panel
        const px = W / 2 - 230, py = 150, pw = 460, ph = 820;
        ctx.fillStyle = linGrad(ctx, px, py, px + pw, py + ph, [[0, '#6b7880'], [0.5, '#3a444a'], [1, '#22282c']]);
        rrect(ctx, px, py, pw, ph, 16); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#9aa6ae'; ctx.font = `600 20px ${FONT_UI}`; ctx.textAlign = 'center';
        ctx.fillText('TRESORBAU KÖLN  ·  MODELL 6', W / 2, py + 50);
        // display
        ctx.fillStyle = '#061008'; rrect(ctx, px + 40, py + 80, pw - 80, 120, 8); ctx.fill();
        const col = this.state === 'bad' ? '#ff4a4a' : this.state === 'ok' ? '#6bff9a' : '#3aff9a';
        ctx.fillStyle = col; ctx.font = `700 72px ${FONT_TYPE}`;
        const txt = this.state === 'bad' ? 'ERROR' : this.state === 'ok' ? 'OPEN' : (this.entry + '______').slice(0, 6).split('').join(' ');
        ctx.fillText(txt, W / 2, py + 165);
        glow(ctx, W / 2, py + 140, 160, col === '#ff4a4a' ? 'rgba(255,60,60,0.2)' : 'rgba(60,255,150,0.15)');
        for (const k of this.keys()) {
          const hov = G.mouse.x > k.x && G.mouse.x < k.x + k.w && G.mouse.y > k.y && G.mouse.y < k.y + k.h;
          ctx.fillStyle = hov ? '#c8d0d6' : '#9aa6ae';
          rrect(ctx, k.x, k.y, k.w, k.h, 10); ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(k.x, k.y + k.h - 8, k.w, 8);
          ctx.fillStyle = '#1a2024'; ctx.font = `700 40px ${FONT_UI}`;
          ctx.fillText(k.l, k.x + k.w / 2, k.y + 58);
        }
        ctx.fillStyle = 'rgba(240,228,200,0.8)'; ctx.font = `500 26px ${FONT_UI}`;
        ctx.fillText('Type or click the code  ·  Esc or click outside to step away', W / 2, H - 40);
        ctx.restore();
      },
      click(x, y) {
        const k = this.keys().find(k => x > k.x && x < k.x + k.w && y > k.y && y < k.y + k.h);
        if (k) return this.press(k.l);
        if (x < W / 2 - 230 || x > W / 2 + 230 || y < 150 || y > 970) this.close(false);
      },
      key(k) {
        if (k === 'Escape') return this.close(false);
        if (/^[0-9]$/.test(k)) this.press(k);
        if (k === 'Backspace') this.entry = this.entry.slice(0, -1);
        if (k === 'Enter') this.press('OK');
      },
    };
    G.overlay = pad;
  });
}

// ---------- hint thoughts ------------------------------------------------------------
// When the player goes quiet for a while, Jack thinks about the next step.
async function hintThought() {
  const sc = G.sceneId;
  if (flag('phoneRinging')) return think('That phone won\'t answer itself.');
  if (!flag('ilseDone')) {
    if (!has('pen') && sc === 'hotel') return think('I should check my briefcase before I go anywhere.');
    return think('The contact is at Café Adler, across the square. A woman who likes rain, apparently.');
  }
  if (!flag('tux')) return think('Black tie tonight, and my dinner jacket is still in the hotel wardrobe.');
  if (!flag('passedGate')) return think('Dinner jacket, invitation. Time to charm the man at the consulate gate.');
  if (!flag('stairsClear')) {
    if (!has('champagne')) return think('That Baron is desperate for a drink, and the waiter has a full tray.');
    return think('A scandal would pull that guard off the stairs. A thirsty Baron with a full glass, perhaps.');
  }
  if (!flag('safeOpen')) {
    if (sc !== 'office') return think('The stairs are clear. Vasko\'s office is waiting upstairs.');
    if (!flag('readPaper') && !flag('sawCard')) return think('Six digits, and all about Vasko. His desk might tell me something personal.');
    return think('He\'s vain enough to use his own birthday. Day, month, year: fourteen, eleven, forty-six.');
  }
  if (flag('guardDown')) return think('Out through the window. Over the rooftops to the car.');
}

// ---------------------------------------------------------------- SAFE HOUSE ----
// The chapter's last scene: dawn, the microfilm, and a betrayal.
SCENES.safehouse = {
  title: 'Ilse\'s Flat · 06:10',
  music: 'end', ambience: ['birds', 'traffic', 'clock'], floor: 'Wood',
  paint: paintSafehouse,
  walk: [60, 1045, 1880, 1045, 1820, 832, 120, 832],
  depth: [832, 1.72, 1045, 2.06],
  light: { ambient: 'rgba(40,20,10,0.12)', key: 'rgba(255,190,120,0.42)', keyX: 1240 },
  portraitBg: '#4a3020',
  actors: () => [makeFigure('ilse', 1350, 862, { id: 'ilse', facing: -1, arm: 'rest', seed: 3, depthScale: true })],
  back(ctx, t) {
    // dust motes drifting in the sunbeam
    ctx.save();
    for (let i = 0; i < 40; i++) {
      const x = 700 + ((i * 137 + t * 12) % 700), y = 300 + ((i * 89 + t * 6 * (i % 3 + 1)) % 500);
      ctx.globalAlpha = 0.25 + 0.25 * Math.sin(t + i);
      ellipse(ctx, x, y, 1.6, 1.6, '#ffe8c0');
    }
    ctx.restore();
    if (!G.projFrame) return;
    // projector beam onto the wall
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = linGrad(ctx, 578, 0, 80, 0, [[0, 'rgba(220,230,255,0.35)'], [1, 'rgba(220,230,255,0.06)']]);
    ctx.beginPath(); ctx.moveTo(578, 592); ctx.lineTo(90, 340); ctx.lineTo(90, 620); ctx.lineTo(578, 610); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = 'rgba(210,225,245,0.82)'; ctx.fillRect(90, 340, 360, 280);
    ctx.strokeStyle = '#1a3a6a'; ctx.fillStyle = '#1a3a6a'; ctx.lineWidth = 2;
    const flick = 0.85 + Math.random() * 0.15;
    ctx.globalAlpha = flick;
    if (G.projFrame === 1) {
      // top view of the stealth fighter, faceted
      ctx.beginPath(); ctx.moveTo(270, 370); ctx.lineTo(410, 560); ctx.lineTo(300, 540); ctx.lineTo(270, 590); ctx.lineTo(240, 540); ctx.lineTo(130, 560); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(270, 370); ctx.lineTo(270, 590); ctx.moveTo(200, 470); ctx.lineTo(340, 470); ctx.stroke();
      ctx.font = `600 16px ${FONT_TYPE}`; ctx.fillText('NIGHTGLASS · PLANFORM · SHEET 1/14', 110, 610);
      for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(110, 380 + k * 24); ctx.lineTo(180, 380 + k * 24); ctx.stroke(); }
    } else if (G.projFrame === 2) {
      ctx.beginPath(); ctx.moveTo(110, 520); ctx.lineTo(200, 440); ctx.lineTo(360, 430); ctx.lineTo(430, 500); ctx.lineTo(380, 540); ctx.lineTo(140, 545); ctx.closePath(); ctx.stroke();
      for (let k = 0; k < 8; k++) { ctx.beginPath(); ctx.moveTo(150 + k * 32, 540); ctx.lineTo(170 + k * 30, 445); ctx.stroke(); }
      ctx.font = `600 16px ${FONT_TYPE}`; ctx.fillText('RADAR-ABSORBENT PANEL · SECTION B', 110, 610);
    } else if (G.projFrame === 3) {
      ctx.fillStyle = '#2a1a10'; ctx.font = `italic 500 26px ${FONT_DISPLAY}`;
      ['Too slow, Mr. Harrow.', 'The real plans left for', 'Karvonia yesterday.', 'Happy birthday to me.', '              — V.'].forEach((l, i) => ctx.fillText(l, 120, 400 + i * 40));
    }
    ctx.restore();
  },
  async enter() {
    if (flag('safehouseSeen')) return;
    flag('safehouseSeen', true);
    G.busy = true;
    await wait(1);
    await think('Dawn. Birdsong. Somewhere a baker is opening up. I\'m alive.');
    await say(actor('ilse'), 'Coffee is on the table. Now, let\'s see what we nearly died for.');
    setObjective('Put the microfilm in the viewer');
    G.busy = false;
  },
  hotspots: [
    { name: 'Window', rect: [980, 150, 520, 470],
      look: () => think('Sunrise over the cathedral. Vienna looks innocent at this hour.') },
    { name: 'Radio', rect: [1636, 296, 160, 70], at: [1700, 880], useVerb: 'Turn on',
      look: () => say(G.jack, 'An old valve radio, tuned to the morning news.'),
      async use() {
        Sound.sfx('click');
        await say(G.jack, 'The news says there was a gas leak at the Karvonian Consulate. No injuries. One very embarrassed Baron.');
      } },
    { name: 'Coffee', rect: [812, 570, 150, 70], at: [880, 890], take: () => say(G.jack, 'Strong, black and Viennese. Just what I needed.'),
      look: () => say(G.jack, 'A pot of coffee and two cups. She was expecting me to make it back.') },
    { name: 'Bookshelf', rect: [1600, 380, 240, 380],
      look: () => say(G.jack, 'Poetry in four languages and a train timetable for the whole Eastern Bloc.') },
    { name: 'Microfilm Viewer', rect: [570, 550, 160, 90], at: [700, 900], face: -1, useVerb: 'Use',
      look: () => say(G.jack, 'A microfilm viewer that doubles as a projector. It throws the image onto the wall.'),
      use: () => has('microfilm') ? viewFilm() : say(G.jack, 'I need to put the microfilm in first.'),
      async item(id) { if (id === 'microfilm') return viewFilm(); return false; } },
    { name: 'Ilse', actor: 'ilse', at: [1180, 880], face: 1,
      look: () => say(G.jack, 'Ilse, looking out at the sunrise. She hasn\'t said a word about the car chase.'),
      talk: async () => {
        await say(G.jack, 'You drive like a getaway pilot.');
        await say(actor('ilse'), 'And you talk like a man who hasn\'t checked his microfilm yet.');
      } },
  ],
};

async function viewFilm() {
  const j = G.jack, i = actor('ilse');
  removeItem('microfilm');
  j.facing = -1; j.arm = 'reach';
  Sound.sfx('click'); await wait(0.4); Sound.sfx('whoosh');
  G.projFrame = 1; j.arm = 'rest';
  await say(j, 'Wing sections. Radar-absorbent panels. The whole aircraft.');
  G.projFrame = 2; Sound.sfx('click');
  await say(j, 'Engine intakes, cockpit, weapons bay... Wait. There\'s one more frame.');
  G.projFrame = 3; Sound.sfx('click');
  await wait(1.2);
  await say(j, 'A note. "Too slow, Mr. Harrow. The real plans left for Karvonia yesterday."');
  await think('A decoy. Vasko let me steal it. The real Nightglass is already behind the Iron Curtain.');
  // Ilse moves in behind him while he stares at the wall.
  Sound.stopMusic();
  await walkTo(j.x + 300, 900, i, 0.6);
  await say(i, 'I know.');
  Sound.sfx('cock');
  await wait(0.5);
  i.arm = 'point'; i.facing = -1;
  j.facing = 1;
  Sound.sfx('sting');
  Sound.playMusic('tension');
  await say(j, 'Ilse?');
  await say(i, 'I\'m sorry, Jack. Vasko pays better than London, and he never sends his people out in the rain.');
  await say(j, 'You set me up.');
  await say(i, 'Someone had to steal the decoy. Now London believes the plans are safe, and nobody goes looking for the real ones.');
  await say(j, 'And me?');
  await say(i, 'You were never here, Mr. Harrow. Remember?');
  await wait(0.7);
  // Hard cut to black. One shot.
  G.fade = 1; G.fadeTo = 1;
  Sound.stopMusic(); Sound.setAmbience([]);
  Sound.sfx('gunshot');
  await wait(3);
  G.projFrame = 0;
  store.del('nightglass_save');
  await Ending.cliffhanger();
}
