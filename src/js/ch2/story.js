// ---------------------------------------------------------------------------
// Chapter Two: Karvograd — items, scenes, hotspots, dialogue and puzzles.
// ---------------------------------------------------------------------------

// ---------- items -------------------------------------------------------------
const ITEMS = {
  passport: {
    name: 'Austrian Passport',
    desc: 'Johann Harwig, refrigerator salesman from Graz. The photograph looks nothing like me, which Technical Section says is the whole point.',
    icon(c) {
      c.rotate(-0.1);
      c.fillStyle = '#7a1a22'; rrect(c, -30, -40, 60, 80, 6); c.fill();
      c.strokeStyle = '#d9b35c'; c.lineWidth = 2; c.strokeRect(-24, -34, 48, 68);
      c.fillStyle = '#d9b35c'; c.beginPath(); c.arc(0, -6, 12, 0, 7); c.fill();
      c.fillStyle = '#7a1a22'; c.fillRect(-6, -10, 12, 8);
      c.fillStyle = '#d9b35c'; c.fillRect(-16, 18, 32, 3); c.fillRect(-12, 25, 24, 3);
    },
  },
  ticket: {
    name: 'Sleeper Ticket',
    desc: 'The Danube Arrow, Vienna to Karvograd, sleeping car four. Punched, stamped and slightly damp.',
    icon(c) {
      c.rotate(0.15);
      c.fillStyle = '#e8d8a8'; c.fillRect(-38, -20, 76, 40);
      c.fillStyle = '#9e1f28'; c.fillRect(-38, -20, 76, 10);
      c.fillStyle = '#5a4a2a'; c.fillRect(-30, -2, 40, 3); c.fillRect(-30, 6, 30, 3);
      c.fillStyle = '#2a2014'; c.beginPath(); c.arc(24, 6, 5, 0, 7); c.fill();
    },
  },
  sugar: {
    name: 'Sugar Lumps',
    desc: 'A tin of sugar lumps from Technical Section. Two in a pot of tea, and a bear sleeps until spring.',
    icon(c) {
      c.fillStyle = linGrad(c, -26, 0, 26, 0, [[0, '#6a7278'], [0.5, '#d8dee2'], [1, '#5a6268']]);
      rrect(c, -26, -18, 52, 40, 6); c.fill();
      c.fillStyle = '#2a4a8a'; c.fillRect(-26, -6, 52, 14);
      c.fillStyle = '#f4f0e8'; c.font = `700 10px ${FONT_UI}`; c.textAlign = 'center'; c.fillText('CUKR', 0, 5);
      for (const [x, y] of [[-14, -30], [2, -32], [16, -28]]) { c.fillStyle = '#f8f6f0'; c.fillRect(x - 6, y - 6, 12, 12); c.strokeStyle = 'rgba(0,0,0,0.15)'; c.strokeRect(x - 6, y - 6, 12, 12); }
    },
  },
  cake: {
    name: 'Sachertorte',
    desc: 'A whole Sachertorte from Café Adler in a wooden box. Franz swears it opens more doors than a pistol.',
    icon(c) {
      c.fillStyle = '#c8a878'; c.fillRect(-36, -8, 72, 34);
      c.strokeStyle = '#8a6a3a'; c.lineWidth = 2; c.strokeRect(-36, -8, 72, 34);
      c.fillStyle = '#2a1208'; c.beginPath(); c.ellipse(0, -8, 30, 10, 0, 0, 7); c.fill();
      c.fillRect(-30, -8, 60, 14);
      c.fillStyle = '#6a3a1a'; c.fillRect(-30, 0, 60, 3);
      c.fillStyle = '#f0e8d8'; c.font = `italic 700 10px ${FONT_DISPLAY}`; c.textAlign = 'center'; c.fillText('Sacher', 0, -8);
    },
  },
  chocolates: {
    name: 'Mozart Chocolates',
    desc: 'Mozart chocolates in gold and red foil. Marzipan in the middle and diplomacy all the way through.',
    icon(c) {
      c.fillStyle = '#6a1a22'; rrect(c, -36, -22, 72, 44, 6); c.fill();
      for (let i = 0; i < 6; i++) {
        const x = -22 + (i % 3) * 22, y = -9 + Math.floor(i / 3) * 18;
        c.fillStyle = radGrad(c, x - 3, y - 3, 1, 10, [[0, i % 2 ? '#ffe8a0' : '#ff8a8a'], [1, i % 2 ? '#a07a2a' : '#8a1a22']]);
        c.beginPath(); c.arc(x, y, 8, 0, 7); c.fill();
      }
    },
  },
  photo: {
    name: 'Photograph',
    desc: 'Ilse and a little girl in a snowy park, both laughing. On the back, in pencil: Anička, Karvograd, 1986.',
    icon(c) {
      c.rotate(-0.08);
      c.fillStyle = '#f2ecdc'; c.fillRect(-32, -36, 64, 72);
      c.fillStyle = '#7a8a9a'; c.fillRect(-26, -30, 52, 48);
      c.fillStyle = '#e8eef4'; c.fillRect(-26, 8, 52, 10);
      c.fillStyle = '#9c1f2e'; c.fillRect(-14, -12, 10, 22); c.fillStyle = '#e9dcb4'; c.beginPath(); c.arc(-9, -16, 5, 0, 7); c.fill();
      c.fillStyle = '#2a4a8a'; c.fillRect(6, -2, 8, 12); c.fillStyle = '#6a3a1a'; c.beginPath(); c.arc(10, -5, 4, 0, 7); c.fill();
    },
  },
  hairpin: {
    name: 'Hairpin',
    desc: 'One of Ilse\'s hairpins. Steel, strong, and just the thing for a man who left his lock picks in London.',
    icon(c) {
      c.rotate(-0.6);
      c.strokeStyle = '#2a2a2e'; c.lineWidth = 4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-36, -4); c.lineTo(30, -4); c.quadraticCurveTo(38, 0, 30, 4); c.lineTo(-30, 4); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-30, -5); c.lineTo(26, -5); c.stroke();
    },
  },
  crowbar: {
    name: 'Crowbar',
    desc: 'A railway crowbar. Heavy, honest and very persuasive.',
    icon(c) {
      c.rotate(-0.7);
      c.strokeStyle = '#9e1f28'; c.lineWidth = 7; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-40, 0); c.lineTo(30, 0); c.quadraticCurveTo(42, 0, 40, -12); c.stroke();
      c.strokeStyle = '#4a4e52'; c.lineWidth = 7; c.beginPath(); c.moveTo(-40, 0); c.lineTo(-48, 6); c.stroke();
    },
  },
  blueprints: {
    name: 'Nightglass Blueprints',
    desc: 'Forty sheets of blueprint, rolled tight and stamped NIGHTGLASS. The real thing, at last.',
    icon(c) {
      c.rotate(-0.4);
      c.fillStyle = linGrad(c, 0, -14, 0, 14, [[0, '#1a3a7a'], [0.5, '#3a6ac0'], [1, '#12306a']]);
      c.fillRect(-40, -14, 80, 28);
      c.fillStyle = '#e8eef8'; c.beginPath(); c.ellipse(-40, 0, 6, 14, 0, 0, 7); c.fill();
      c.strokeStyle = 'rgba(220,235,255,0.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-30, -6); c.lineTo(20, -6); c.moveTo(-26, 4); c.lineTo(30, 4); c.stroke();
      c.fillStyle = '#9e1f28'; c.fillRect(-4, -16, 8, 32);
    },
  },
};

async function lookItemStory(id) {
  await say(G.jack, ITEMS[id].desc);
}

// ---------- scene lighting presets ------------------------------------------------
const LIGHT = {
  flat: { ambient: 'rgba(40,20,10,0.12)', key: 'rgba(255,190,120,0.42)', keyX: 1240 },
  compartment: { ambient: 'rgba(40,20,8,0.2)', key: 'rgba(255,200,130,0.3)', keyX: 960, top: 'rgba(255,220,160,0.1)' },
  sleeper: { ambient: 'rgba(8,14,30,0.42)', key: 'rgba(150,180,230,0.3)', keyX: 960 },
  station: { ambient: 'rgba(20,18,14,0.28)', key: 'rgba(255,200,130,0.3)', keyX: 240 },
  buffet: { ambient: 'rgba(40,30,8,0.18)', key: 'rgba(255,210,140,0.32)', keyX: 960, top: 'rgba(255,220,150,0.12)' },
  platform: { ambient: 'rgba(8,14,28,0.36)', key: 'rgba(255,180,100,0.34)', keyX: 900 },
  van: { ambient: 'rgba(30,16,4,0.32)', key: 'rgba(255,180,90,0.36)', keyX: 700 },
};

const SCENES = {};

// ===========================================================================
// ILSE'S FLAT, VIENNA — one second after the gunshot
// ===========================================================================
SCENES.flat = {
  title: 'Ilse\'s Flat · Vienna · 06:14',
  music: 'tension', ambience: ['birds', 'traffic', 'clock'], floor: 'Wood',
  paint: ctx => { paintSafehouse(ctx); paintSafehouseDoor(ctx); },
  walk: [60, 1045, 1880, 1045, 1820, 832, 120, 832],
  depth: [832, 1.72, 1045, 2.06],
  light: LIGHT.flat,
  portraitBg: '#4a3020',
  actors() {
    const list = [makeFigure('franz', 340, 858, { id: 'franz', facing: 1, arm: flag('franzHolstered') ? 'rest' : 'point', seed: 2, depthScale: true })];
    if (!flag('ilseFled')) list.push(makeFigure('ilse', 1230, 858, { id: 'ilse', facing: -1, arm: 'wrist', seed: 3, depthScale: true }));
    return list;
  },
  props: [
    { y: 905, when: () => !flag('gunTaken'), draw: ctx => { ctx.save(); ctx.translate(1010, 905); ctx.rotate(0.3); rect(ctx, -22, -5, 36, 9, '#1a1a1c'); rect(ctx, 6, -2, 10, 16, '#1a1a1c'); rect(ctx, -20, -4, 30, 2, 'rgba(255,255,255,0.2)'); ctx.restore(); } },
  ],
  back(ctx, t) {
    ctx.save();
    for (let i = 0; i < 40; i++) {
      const x = 700 + ((i * 137 + t * 12) % 700), y = 300 + ((i * 89 + t * 6 * (i % 3 + 1)) % 500);
      ctx.globalAlpha = 0.25 + 0.25 * Math.sin(t + i);
      ellipse(ctx, x, y, 1.6, 1.6, '#ffe8c0');
    }
    ctx.restore();
    // a wisp of smoke still curling from Franz's pistol
    if (!flag('franzHolstered')) {
      const f = actor('franz');
      if (f) for (let k = 0; k < 6; k++) { const p = (t * 0.4 + k / 6) % 1; ctx.save(); ctx.globalAlpha = (1 - p) * 0.2; ellipse(ctx, f.x + 120 + Math.sin(p * 8) * 8, f.y - 250 - p * 120, 6 + p * 16, 4 + p * 8, '#e8e0d8'); ctx.restore(); }
    }
  },
  async enter() {
    if (flag('flatIntro')) return;
    flag('flatIntro', true);
    G.busy = true;
    const f = actor('franz'), i = actor('ilse');
    await wait(1.2);
    await think('I\'m still standing, so somebody else pulled that trigger.');
    await say(f, 'Guten Morgen, Herr Harrow. I believe the lady was just leaving.');
    await say(i, 'Franz? The barman from Café Adler?');
    await say(f, 'Fourteen years behind that bar, Fräulein. London likes a man who listens more than he talks.');
    await say(G.jack, 'Franz, you have excellent timing and a very steady hand.');
    await say(i, 'You should have stayed behind your bar, old man.');
    i.arm = 'rest';
    await walkTo(1390, 850, i, 1.4);
    Sound.sfx('window');
    await say(i, 'Goodbye, Jack. Next time, check your microfilm before you celebrate.');
    await say(G.jack, 'Ilse, wait!');
    Sound.sfx('whoosh');
    removeActor('ilse');
    flag('ilseFled', true);
    await wait(0.6);
    f.arm = 'rest'; flag('franzHolstered', true);
    await say(f, 'Let her run. A wounded fox always runs home, and her home is Karvograd.');
    setObjective('Talk to Franz');
    save();
    G.busy = false;
  },
  hotspots: [
    { name: 'Window', rect: [980, 150, 520, 470],
      look: () => flag('ilseFled') ? think('Down the drainpipe and over the rooftops, like a cat. She\'s done that before.') : say(G.jack, 'Sunrise over Vienna.') },
    { name: 'Radio', rect: [1636, 296, 160, 70], at: [1700, 880], useVerb: 'Turn on',
      look: () => say(G.jack, 'An old valve radio, tuned to the morning news.'),
      async use() {
        Sound.sfx('click');
        await say(G.jack, 'The morning news says there was a gas leak at the Karvonian Consulate last night. No injuries, and one very embarrassed Baron.');
      } },
    { name: 'Coffee', rect: [812, 570, 150, 70], at: [880, 890],
      look: () => say(G.jack, 'Two cups. She poured one for me, then pointed a gun at me. Viennese hospitality.'),
      take: () => say(G.jack, 'Cold now. Like the lady.') },
    { name: 'Bookshelf', rect: [1600, 380, 240, 380],
      look: () => say(G.jack, 'Poetry in four languages and a railway timetable for the whole Eastern Bloc. She was always planning a journey.') },
    { name: 'Microfilm Viewer', rect: [570, 550, 160, 90], at: [700, 900], face: -1,
      look: () => say(G.jack, 'Vasko\'s decoy film is still in the viewer. He must have laughed all the way to his birthday cake.') },
    { name: 'Ilse\'s Pistol', rect: [975, 880, 70, 40], at: [900, 910], when: () => !flag('gunTaken'),
      look: () => say(G.jack, 'A little Walther, Ilse\'s. Franz shot it clean out of her hand.'),
      async take() {
        const f = actor('franz');
        await say(f, 'I will keep that, Herr Harrow. Evidence, and London likes its paperwork.');
        flag('gunTaken', true);
        Sound.sfx('pickup');
      } },
    { name: 'Ilse\'s Handbag', rect: [1440, 630, 110, 80], at: [1400, 880], useVerb: 'Search', photo: 'handbag',
      look: () => say(G.jack, 'Ilse left her handbag on the chair. A spy should always check the handbag.'),
      async use() {
        if (flag('searchedBag')) return say(G.jack, 'A lipstick, a powder compact and a bus ticket. Nothing else I need.');
        Sound.sfx('paper');
        flag('searchedBag', true);
        await say(G.jack, 'Lipstick, a powder compact, and a photograph.');
        addItem('photo');
        await say(G.jack, 'Ilse and a little girl in a snowy park. On the back it says: Anička, Karvograd, 1986.');
        await think('So that\'s what Vasko has over you, Ilse.');
        await say(G.jack, 'And a hairpin. Steel, and sprung like a watch. That could open a lot of doors.');
        addItem('hairpin');
        save();
      } },
    { name: 'Door', rect: [150, 360, 190, 400], at: [300, 880], exitLabel: 'Leave for Karvograd',
      async exit() {
        if (!flag('briefed')) return say(G.jack, 'Not before I know where I\'m going, and Franz seems to know more than he pours.');
        if (!flag('searchedBag')) return think('Ilse left her handbag on the chair. A spy should always check the handbag.');
        await leaveVienna();
      } },
    { name: 'Franz', actor: 'franz', at: [560, 900], face: -1,
      look: () => say(G.jack, 'Franz the barman, with a pistol in his pocket and a moustache like a boot brush. London\'s man in Vienna, apparently.'),
      talk: () => talkFranz(),
      async item(id) {
        const f = actor('franz');
        if (id === 'photo') { await say(f, 'A child. So Vasko has a hold on her after all.'); return say(f, 'Keep it safe, Herr Harrow. Photographs can be heavier than pistols.'); }
        if (id === 'hairpin') return say(f, 'I prefer a key. But in Karvonia you take what you can get.');
        return false;
      } },
  ],
};

async function talkFranz() {
  const f = actor('franz');
  await say(f, 'So, Herr Harrow. You are alive, and the plans are not in Vienna.');
  for (;;) {
    const c = await choose([
      { text: 'Who are you, really?', value: 'who' },
      !flag('briefed') && { text: 'The film was a decoy. Where are the real plans?', value: 'plans' },
      flag('briefed') && { text: 'Tell me about the Iron Arrow again.', value: 'again' },
      { text: 'Time I was going.', value: 'bye' },
    ]);
    if (c === 'who') {
      await say(G.jack, 'Who are you, really?');
      await say(f, 'Just a barman who keeps an eye on London\'s guests. Control never sends a man into Vienna without a babysitter.');
      await say(G.jack, 'And the moustache?');
      await say(f, 'The moustache is real, Herr Harrow. The moustache is always real.');
    }
    if (c === 'plans') await franzBriefing(f);
    if (c === 'again') {
      await say(G.jack, 'Tell me about the Iron Arrow again.');
      await say(f, 'The midnight express from Karvograd to Moscow, every Friday, platform nine. Once those plans cross into Russia, they are gone for good.');
      await say(f, 'And remember: in Karvonia, a Viennese sweet opens more doors than a pistol.');
    }
    if (c === 'bye') {
      await say(G.jack, 'Time I was going.');
      if (!flag('briefed')) return say(f, 'Going where, Herr Harrow? You do not even know where the plans are.');
      return say(f, 'Gute Reise. And check the handbag, a lady\'s bag is a spy\'s best friend.');
    }
  }
}

async function franzBriefing(f) {
  await say(G.jack, 'The film was a decoy. The real Nightglass plans left for Karvonia before I even opened the safe.');
  await say(f, 'Then you know where you are going.');
  await say(G.jack, 'Vasko\'s typewriter had a letter on the roller: shipment confirmed, Friday, Karvograd, platform nine.');
  await say(f, 'Platform nine is the Iron Arrow, the midnight express from Karvograd to Moscow.');
  await say(f, 'Once those plans cross into Russia, London will never see them again.');
  await say(G.jack, 'Then I\'ll be on that platform on Friday night.');
  await say(f, 'Control thought you might say that. He sent you a few things.');
  Sound.sfx('paper');
  addItem('passport'); await wait(0.4); addItem('ticket');
  await say(f, 'A passport, and a sleeper ticket for the Danube Arrow. You are Johann Harwig, a refrigerator salesman from Graz.');
  await say(G.jack, 'Refrigerators. To Karvonia. In November.');
  await say(f, 'Nobody ever asks a refrigerator salesman a second question. And a present from Technical Section.');
  addItem('sugar');
  await say(f, 'Sugar lumps. Two of these in a pot of tea and a bear sleeps until spring.');
  await say(f, 'And from me, for the journey: a Sachertorte from the café, and a box of Mozart chocolates.');
  addItem('cake'); await wait(0.4); addItem('chocolates');
  await say(G.jack, 'Very kind. Am I going to Karvonia or to a birthday party?');
  await say(f, 'Believe me, Herr Harrow. Behind the Iron Curtain, a Viennese sweet opens more doors than a pistol.');
  flag('briefed', true);
  setObjective(flag('searchedBag') ? 'Leave for Karvograd' : 'Search the flat, then leave for Karvograd');
  save();
}

async function leaveVienna() {
  G.busy = true;
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  await TextScreen.play(TRAIN_PAGES, 'train');
  G.mode = 'play'; G.paused = false; G.speech = []; G.choices = null; G.overlay = null;
  G.sceneId = null; G.fade = 1;
  await gotoScene('compartment', 900, 900, 1, { instant: true });
}

// ===========================================================================
// THE DANUBE ARROW — the border crossing
// ===========================================================================
SCENES.compartment = {
  title: 'The Danube Arrow · Sleeping Car 4',
  music: 'train', ambience: ['trainRumble', 'snowWind'], floor: 'Carpet',
  paint: ctx => paintCompartment(ctx),
  walk: [220, 1045, 1700, 1045, 1640, 836, 280, 836],
  depth: [836, 1.62, 1045, 1.95],
  light: LIGHT.compartment,
  portraitBg: '#3a2410',
  actors: () => flag('borderDone') ? [] : [makeFigure('novak', 1540, 800, { id: 'novak', facing: -1, pose: 'sit', seed: 5, scale: 1.72, fixedScale: true })],
  back(ctx, t) { drawTrainWindow(ctx, t, 700, 180, 520, 420, 1); },
  front(ctx, t) {
    // the carriage sways gently on the rails
    const sway = Math.sin(t * 1.7) * 0.6 + Math.sin(t * 5.3) * 0.25;
    ctx.save(); ctx.globalAlpha = 0.06 + 0.04 * Math.abs(sway); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
  },
  async enter() {
    if (flag('trainIntro')) return;
    flag('trainIntro', true);
    G.busy = true;
    const n = actor('novak');
    await wait(1);
    await think('The Karvonian border in ten minutes. Franz\'s passport had better be as good as his aim.');
    await say(n, 'Must you stand there like a lamp post? Sit down, or go away.');
    await wait(0.4);
    Sound.sfx('brakes');
    await wait(1.2);
    await say('borderGuard', 'Border control! Passports, everybody, passports!', { pos: [1600, 260] });
    await say('borderGuard', 'Harwig, Johann, Austrian. If anybody sees this man, you call me at once.', { pos: [1600, 260] });
    await think('Harwig. That\'s me. Ilse knew every cover name London has ever given me.');
    setObjective('Get past the border guard without showing your passport');
    save();
    G.busy = false;
  },
  hotspots: [
    { name: 'Window', rect: [700, 180, 520, 420],
      look: () => say(G.jack, 'Snow, pine forest and a moon like a searchlight. Somewhere out there is the border.') },
    { name: 'Tea Glasses', photo: 'teaglass', rect: [826, 568, 60, 56], at: [880, 880],
      look: () => say(G.jack, 'Tea in glasses with metal holders. The Eastern Bloc\'s finest invention: you burn your fingers and your tongue at the same time.'),
      take: () => say(G.jack, 'Stone cold. Madame has a point about this train.') },
    { name: 'Heater', rect: [780, 700, 360, 60], at: [960, 870], useVerb: 'Kick',
      look: () => say(G.jack, 'The heater is broken. It\'s colder in here than a Karvonian welcome.'),
      async use() { Sound.sfx('thud'); await say(G.jack, 'Nothing. Not even a rattle.'); } },
    { name: 'Suitcase', rect: [200, 160, 270, 100], at: [400, 880], useVerb: 'Open',
      look: () => say(G.jack, 'My suitcase, up on the rack.'),
      use: () => say(G.jack, 'Shirts, a razor and a catalogue of Austrian refrigerators. My cover story, in glossy colour.') },
    { name: 'Hatbox and Trunk', rect: [1320, 150, 460, 110],
      look: () => say(G.jack, 'A hatbox with a satin ribbon and a steamer trunk covered in stickers: Milan, Paris, Vienna, Karvograd. Somebody has sung everywhere.') },
    { name: 'Opera Programme', rect: [1540, 640, 120, 50], at: [1400, 880], photo: 'programme',
      async look() {
        flag('sawProgramme', true);
        await say(G.jack, 'A programme from the Vienna State Opera. Die Fledermaus, starring Zdenka Novak as Rosalinde.');
        await say(G.jack, 'There\'s a lipstick kiss on the cover, and the signature is the lady\'s own.');
      },
      async take() {
        flag('sawProgramme', true);
        await say(actor('novak') || G.jack, 'That is mine, darling. Look with your eyes.');
        await say(G.jack, 'Die Fledermaus, at the Vienna State Opera. Starring Zdenka Novak as Rosalinde.');
      } },
    { name: 'Corridor Door', rect: [1800, 120, 130, 690], at: [1690, 880], exitLabel: 'Open the corridor door',
      exit: () => openCorridorDoor() },
    { name: 'Madame Novak', actor: 'novak', at: [1320, 900], face: 1,
      look: () => say(G.jack, 'A grand lady in a fur coat and a hat like a sleeping cat. Everything about her says opera, and everything about her face says don\'t.'),
      talk: () => talkNovak(),
      async item(id) {
        const n = actor('novak');
        if (id === 'chocolates') return giveChocolates();
        if (id === 'cake') return say(n, 'Cake? At my age, darling, I must think of my waistline and my top C.');
        if (id === 'passport') return say(n, 'Harwig? A refrigerator salesman? How very dull.');
        if (id === 'sugar') return say(n, 'I take my tea without sugar and my men without excuses.');
        if (id === 'photo') return say(n, 'A pretty child. Karvograd is full of pretty children and sad mothers.');
        return false;
      } },
  ],
};

async function talkNovak() {
  const n = actor('novak');
  if (flag('novakAlly')) return say(n, 'Hush, darling. When the guard comes, you are my accompanist and you say nothing.');
  await say(G.jack, 'Good evening, madame.');
  await say(n, 'Is it? The heating is broken, the tea is cold, and nobody on this train knows who I am.');
  for (;;) {
    const c = await choose([
      !flag('novakName') && { text: 'And who are you, madame?', value: 'who' },
      flag('sawProgramme') && !flag('novakCharmed') && { text: 'I saw your Rosalinde in Vienna last week.', value: 'rosalinde' },
      flag('novakCharmed') && { text: 'Madame, I need a small favour.', value: 'favour' },
      { text: 'Cold night for it.', value: 'cold' },
      { text: 'Sorry to disturb you.', value: 'bye' },
    ]);
    if (c === 'who') {
      await say(G.jack, 'And who are you, madame?');
      await say(n, 'Who am I? Young man, I am Zdenka Novak, the Nightingale of Karvograd!');
      await say(n, 'Forty years I have sung for kings, commissars and the Marshal himself. And they ask me for my passport like a tractor driver.');
      flag('novakName', true);
    }
    if (c === 'rosalinde') {
      await say(G.jack, 'Madame, I saw you sing Rosalinde in Die Fledermaus at the State Opera last week. You were magnificent.');
      await say(n, 'You did? A man of culture, on this train!');
      await say(n, 'The critics said I was too old for Rosalinde. The critics are idiots, darling. Sit, sit.');
      flag('novakCharmed', true);
    }
    if (c === 'favour') {
      await say(G.jack, 'Madame, there is a border guard in that corridor who would very much like to arrest me.');
      await say(n, 'And why should the Nightingale of Karvograd help a criminal?');
      await say(n, 'Convince me, darling. I have not eaten a thing since Vienna.');
      return;
    }
    if (c === 'cold') {
      await say(G.jack, 'Cold night for it.');
      await say(n, 'In Karvonia, darling, every night is cold. That is why we sing so loudly.');
    }
    if (c === 'bye') { await say(G.jack, 'Sorry to disturb you.'); return say(n, 'You are forgiven. Barely.'); }
  }
}

async function giveChocolates() {
  const n = actor('novak');
  if (!flag('novakCharmed')) {
    await say(n, 'Chocolates from a strange man on a night train? What do you take me for?');
    return say(n, 'I am an artiste. First, a little respect. Then, perhaps, chocolates.');
  }
  removeItem('chocolates');
  Sound.sfx('paper');
  await say(G.jack, 'Mozart chocolates, madame, from Vienna. For the finest Rosalinde of the decade.');
  await say(n, 'Mozartkugeln! Oh, you wicked, wonderful man.');
  n.arm = 'hold';
  await wait(0.6);
  await say(n, 'Very well. When that guard comes in, you are my accompanist, and you will say nothing at all.');
  await say(n, 'Can you play the piano?');
  await say(G.jack, 'Only Chopsticks.');
  await say(n, 'Then you are perfect for Karvonian radio.');
  n.arm = 'rest';
  flag('novakAlly', true);
  save();
  await wait(0.6);
  await borderInspection();
}

async function openCorridorDoor() {
  if (flag('novakAlly')) return borderInspection();
  Sound.sfx('slidingDoor');
  const g = makeFigure('borderGuard', 1880, 880, { id: 'borderGuard', facing: -1, seed: 11, depthScale: true });
  g.scale = depthScale(880);
  G.actors.push(g);
  await walkTo(1740, 880, g);
  await say(g, 'Ah, sleeping car four. Passport, please.');
  const c = await choose([
    { text: 'Hand over the passport.', value: 'hand' },
    { text: 'Slide the door shut again.', value: 'shut' },
  ]);
  if (c === 'shut') {
    await say(G.jack, 'Terribly sorry, I\'m not dressed. One moment.');
    Sound.sfx('slidingDoor');
    await say(g, 'One minute, mister! Then I come in!');
    removeActor('borderGuard');
    return think('That bought me a minute. I need somebody in here that border guard won\'t argue with.');
  }
  await say(G.jack, 'Of course. Here you are.');
  Sound.sfx('paper');
  await say(g, 'Harwig, Johann, refrigerators... Harwig!');
  await say(g, 'You are coming with me, Herr Harwig. Somebody in Karvograd very much wants to meet you.');
  Sound.sfx('alarm');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  removeActor('borderGuard');
  G.jack.x = 900; G.jack.y = 900; G.jack.facing = 1; G.jack.scale = depthScale(900);
  notify('Arrested at the border. Try another way past the guard.', 4);
  await wait(0.6);
  G.fadeTo = 0; await waitUntil(() => G.fade < 0.05);
  await think('Showing him that passport was a mistake I only get to make once. I need an ally in this compartment.');
}

async function borderInspection() {
  const n = actor('novak');
  G.busy = true;
  Sound.sfx('knock');
  await wait(0.8);
  Sound.sfx('slidingDoor');
  const g = makeFigure('borderGuard', 1880, 880, { id: 'borderGuard', facing: -1, seed: 11, depthScale: true });
  g.scale = depthScale(880);
  G.actors.push(g);
  await walkTo(1680, 880, g);
  await say(g, 'Border control. Passports!');
  await say(n, 'Sergeant, do you know who I am?');
  await say(g, 'No, madame. Passport, please.');
  await say(n, 'I am Zdenka Novak! The Nightingale of Karvograd! I sang for the Marshal on his sixtieth birthday!');
  await say(g, 'Madame Novak? My mother has all your records!');
  await say(n, 'Of course she does, darling. And this is my accompanist. He is very shy and very Austrian.');
  await say(g, 'And his passport, madame?');
  await say(n, 'Sergeant, pianists do not carry passports. They carry music.');
  await say(g, 'Of course, madame. Forgive me. Could you, perhaps, sign something for my mother?');
  n.arm = 'sign';
  Sound.sfx('paper');
  await say(n, 'To Mama, with love from the Nightingale. There.');
  n.arm = 'rest';
  await say(g, 'Thank you, madame! Welcome home. Welcome to Karvonia, sir.');
  Sound.sfx('stamp');
  g.facing = 1;
  await walkTo(1900, 880, g);
  removeActor('borderGuard');
  Sound.sfx('slidingDoor');
  await say(G.jack, 'Madame, you were magnificent.');
  await say(n, 'I always am, darling. Now go away, I need my beauty sleep.');
  flag('borderDone', true);
  await think('Karvonia. Home of the Nightingale, the Colonel and, if I\'m lucky, the Nightglass plans.');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  await TextScreen.play(ARRIVAL_PAGES, 'karvograd');
  G.mode = 'play'; G.paused = false; G.speech = []; G.choices = null; G.overlay = null;
  G.sceneId = null; G.fade = 1;
  await gotoScene('station', 800, 900, 1, { instant: true });
}

// ===========================================================================
// KARVOGRAD CENTRAL — the station hall
// ===========================================================================
SCENES.station = {
  title: 'Karvograd Central · 22:51',
  music: 'karvograd', ambience: ['stationHall', 'snowWind'], floor: 'Stone',
  paint: paintStation,
  walk: [0, 1045, 1920, 1045, 1920, 838, 0, 838],
  depth: [838, 1.6, 1045, 2.0],
  light: LIGHT.station,
  portraitBg: '#3a3428',
  actors: () => [makeFigure('militia', 1640, 860, { id: 'militia', facing: -1, arm: 'behind', seed: 12, depthScale: true })],
  back(ctx, t) {
    drawSnowInWindow(ctx, t, 560, 90, 800, 520, true);
    drawDepartures(ctx, t);
  },
  async enter() {
    if (flag('stationIntro')) return;
    flag('stationIntro', true);
    G.busy = true;
    await wait(1);
    Sound.sfx('tannoy');
    await wait(1.2);
    await say('tannoy', 'Attention, please. The Iron Arrow to Moscow will depart from platform nine at twenty three fifty nine. Platforms seven to nine are closed to the public.', { pos: [960, 150] });
    await think('Platform nine. Vasko\'s typewriter was telling the truth, for once.');
    setObjective('Get onto platform nine before midnight');
    save();
    G.busy = false;
  },
  hotspots: [
    { name: 'Great Window', rect: [560, 90, 800, 420],
      look: () => say(G.jack, 'Karvograd by night: onion domes, factory chimneys and a red star over everything. The snow makes it almost pretty.') },
    { name: 'Banner', rect: [560, 516, 800, 70],
      look: () => say(G.jack, 'Glory to the railwaymen of Karvonia. The railwaymen look like they\'d rather have a pay rise.') },
    { name: 'Station Clock', rect: [1120, 136, 130, 130],
      look: () => say(G.jack, 'Nine minutes to eleven. An hour to find those plans, and a train that won\'t wait.') },
    { name: 'Departure Board', rect: [1490, 110, 410, 330],
      look: () => say(G.jack, 'The Iron Arrow, Moscow, 23:59, platform nine. Every other train tonight is cancelled, which in Karvonia counts as a timetable.') },
    { name: 'Bust of Vasko', rect: [470, 400, 190, 420], at: [560, 870],
      async look() {
        flag('sawBust', true);
        await say(G.jack, 'A bronze bust of Colonel Dragan Vasko, Hero of Karvograd. "Born the fourteenth of November, 1946."');
        await think('Of course he\'s got a statue in his home town. He probably unveiled it himself.');
      } },
    { name: 'Lockers', rect: [360, 556, 104, 250], at: [410, 870], useVerb: 'Open',
      look: () => say(G.jack, 'Left-luggage lockers. Half of them are jammed and the other half are watched.'),
      use: () => say(G.jack, 'Locked. And the militiaman is watching me watch them.') },
    { name: 'Ticket Windows', rect: [630, 600, 700, 220], at: [960, 870],
      look: () => say(G.jack, 'Tickets, tickets, closed. The shutters are down and the sign says technical reasons. The dust says since about 1979.') },
    { name: 'Travellers', rect: [1180, 620, 290, 200],
      look: () => say(G.jack, 'Tired people with suitcases, waiting for trains that were cancelled hours ago. Nobody complains. Complaining is a kind of travel too, and it needs a permit.') },
    { name: 'Buffet', rect: [60, 420, 280, 400], at: [200, 880], exitLabel: 'Enter the station buffet',
      look: () => say(G.jack, 'The station buffet. Warm light behind steamed-up glass.'),
      exit: () => gotoScene('buffet', 170, 910, 1) },
    { name: 'Platform Gate', rect: [1560, 470, 340, 350], at: [1540, 880], exitLabel: 'Go through to platform nine',
      look: () => say(G.jack, 'The gate to platforms seven, eight and nine. Closed, military transport, and one militiaman to make sure.'),
      exit: () => platformGate() },
    { name: 'Militiaman', actor: 'militia', at: [1480, 880], face: 1,
      look: () => say(G.jack, 'A militiaman with a moustache like a yard broom. He has the look of a man whose feet have been cold since 1968.'),
      talk: () => talkMilitia(),
      async item(id) {
        const m = actor('militia');
        if (id === 'passport') { Sound.sfx('paper'); await say(m, 'Harwig, Austrian. Papers in order.'); return say(m, 'Platform nine is still closed, Herr Harwig.'); }
        if (id === 'cake' || id === 'chocolates') return say(m, 'Are you trying to bribe the People\'s Militia? With sweets?');
        if (id === 'photo') return say(m, 'I have not seen her. And if I had, I would not say.');
        return false;
      } },
  ],
};

async function talkMilitia() {
  const m = actor('militia');
  await say(G.jack, 'Good evening.');
  await say(m, 'Is it? Papers in order? Good. Then move along.');
  for (;;) {
    const c = await choose([
      { text: 'What\'s happening on platform nine?', value: 'nine' },
      { text: 'Who is allowed through that gate?', value: 'who' },
      { text: 'Cold night.', value: 'cold' },
      { text: 'Goodbye.', value: 'bye' },
    ]);
    if (c === 'nine') {
      await say(G.jack, 'What\'s happening on platform nine?');
      await say(m, 'Military business. Not your business.');
    }
    if (c === 'who') {
      await say(G.jack, 'Who is allowed through that gate?');
      await say(m, 'Railway staff, in uniform. And Auntie Zora from the buffet, with the tea for the soldiers, God bless her.');
      await say(m, 'Every night at quarter past eleven, she pushes that trolley all the way to the end of platform nine. With her knees.');
      flag('knowsTea', true);
      setObjective('Find a way through the gate: railway staff and the tea lady only');
    }
    if (c === 'cold') { await say(G.jack, 'Cold night.'); await say(m, 'In Karvograd, this is summer.'); }
    if (c === 'bye') { await say(G.jack, 'Goodbye.'); return say(m, 'Move along.'); }
  }
}

async function platformGate() {
  const m = actor('militia');
  if (flag('trolley')) {
    await say(m, 'Tea! At last. Where is Auntie Zora?');
    await say(G.jack, 'Her knees.');
    await say(m, 'Ah, her knees. Go on, go on, before the soldiers freeze.');
    Sound.sfx('gate');
    return gotoScene('platform', 200, 900, 1, { sfx: 'gate' });
  }
  if (flag('railCoat')) {
    await say(m, 'Railwayman? Where is your trolley, your lamp, your anything? Nobody goes to platform nine empty-handed.');
    return;
  }
  await say(m, 'Stop! Platforms seven to nine are closed. Military train.');
  if (!flag('knowsTea')) await think('No way past him like this. Maybe I should find out who he does let through.');
}

// ===========================================================================
// THE BUFFET — "The Golden Locomotive"
// ===========================================================================
SCENES.buffet = {
  title: 'Station Buffet · The Golden Locomotive',
  music: 'buffet', ambience: ['room', 'samovar', 'radioFolk', 'cups'], floor: 'Marble', musicFilter: 3200,
  paint: paintBuffet,
  walk: [100, 1045, 1880, 1045, 1800, 842, 120, 842],
  depth: [842, 1.66, 1045, 2.02],
  light: LIGHT.buffet,
  portraitBg: '#4a3a1a',
  actors: () => [
    makeFigure('zora', 1290, 812, { id: 'zora', facing: -1, seed: 13, scale: 2.05, fixedScale: true }),
    makeFigure('pavel', 470, 812, { id: 'pavel', facing: 1, pose: 'sit', doze: true, seed: 14, scale: 1.7, fixedScale: true }),
  ],
  props: [
    { y: 820, draw: ctx => paintBuffetCounter(ctx) },
    { y: 811, draw: ctx => drawBuffetChair(ctx, 440, 818) },
    { y: 805, draw: ctx => { // the table in front of Pavel
      ctx.fillStyle = '#e8e0d0'; poly(ctx, [470, 740, 780, 740, 800, 780, 450, 780], '#e8e0d0');
      ctx.fillStyle = 'rgba(180,30,40,0.6)'; for (let k = 0; k < 17; k++) ctx.fillRect(452 + k * 20, 744, 10, 36);
      ctx.fillStyle = '#2a1a0a'; ctx.fillRect(614, 780, 12, 70); ctx.fillRect(570, 846, 100, 8);
      ellipse(ctx, 560, 748, 36, 10, '#e8e0d0'); ellipse(ctx, 560, 746, 26, 6, '#8a3a1a');
      ctx.fillStyle = '#3a5a2a'; ctx.fillRect(700, 700, 16, 44); ctx.fillRect(704, 686, 8, 14);
    } },
    { y: 800, when: () => !flag('railCoat'), draw: ctx => drawHangingCoat(ctx, 781, 360) },
    { y: 860, when: () => !flag('trolley'), draw: ctx => { ctx.save(); ctx.translate(1700, 860); ctx.scale(1.8, 1.8); drawTrolley(ctx, {}); ctx.restore(); } },
  ],
  back(ctx, t) {
    // steam from the samovar, snow past the window
    for (let k = 0; k < 5; k++) { const p = (t * 0.25 + k / 5) % 1; ctx.save(); ctx.globalAlpha = (1 - p) * 0.2; ellipse(ctx, 1010 + Math.sin(p * 6 + k) * 10, 360 - p * 160, 10 + p * 30, 6 + p * 14, '#f4f0e8'); ctx.restore(); }
    drawSnowInWindow(ctx, t, 110, 180, 440, 380, false);
  },
  async enter() {
    if (flag('buffetIntro')) return;
    flag('buffetIntro', true);
    G.busy = true;
    await wait(0.8);
    await think('Warm at last. It smells of tea, cabbage and forty years of cigarettes.');
    await say(actor('zora'), 'Sit anywhere, darling. Everywhere is terrible.');
    G.busy = false;
  },
  hotspots: [
    { name: 'Window', rect: [110, 180, 440, 380],
      look: () => say(G.jack, 'Snow on the square outside, and somebody has drawn a heart in the steam. Even in Karvograd, somebody is in love.') },
    { name: 'The Marshal', rect: [1194, 44, 232, 192],
      look: () => say(G.jack, 'The Marshal, Father of the Nation. He looks like he disapproves of the sandwiches too.') },
    { name: 'Shelves', rect: [900, 200, 640, 210],
      look: () => say(G.jack, 'Plum brandy, pickled cucumbers, tins of something called Meat. Karvonian luxury.') },
    { name: 'Radio', rect: [1560, 316, 120, 70], useVerb: 'Retune',
      look: () => say(G.jack, 'Karvonian State Radio. A folk song about a tractor that loves its village.'),
      use: () => say(actor('zora'), 'Leave my radio! It is the only man in Karvograd who sings to me.') },
    { name: 'Samovar', photo: 'samovar', rect: [930, 390, 160, 212], at: [1000, 880],
      look: () => say(G.jack, 'A brass samovar the size of a church bell. It has been boiling since the revolution.'),
      async item(id) {
        if (id === 'sugar') return say(G.jack, 'Not the whole samovar. Auntie Zora drinks from this, and she\'s the only friend I have in Karvograd.');
        return false;
      } },
    { name: 'Sandwiches', rect: [1120, 516, 260, 90], at: [1250, 880],
      look: () => say(G.jack, 'Sandwiches under glass, curling at the edges like old photographs.'),
      take: () => say(G.jack, 'I survived Vasko\'s guards. I\'m not risking the sandwiches.') },
    { name: 'Railway Coat', rect: [730, 340, 110, 400], at: [760, 880], when: () => !flag('railCoat'),
      look: () => say(G.jack, 'A railwayman\'s greatcoat and cap on the coat rack. Brass buttons, and a badge with a winged wheel.'),
      async take() {
        if (!flag('zoraOk')) return say(G.jack, 'With Auntie Zora watching me like a hawk? Not a chance.');
        Sound.sfx('cloth');
        G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
        flag('railCoat', true); G.jack.look = LOOKS.jackRail;
        await wait(0.4);
        G.fadeTo = 0; await waitUntil(() => G.fade < 0.05);
        await say(G.jack, 'A railwayman\'s greatcoat and cap. Nobody in the Eastern Bloc looks twice at a man in a uniform.');
        setObjective('Take the tea trolley to platform nine');
        save();
      } },
    { name: 'Tea Trolley', rect: [1740, 640, 190, 230], at: [1640, 900], when: () => !flag('trolley'), useVerb: 'Push',
      look: () => say(G.jack, 'A tea trolley with a dented urn and a dozen glasses. The most dangerous vehicle in Karvonia.'),
      async use() {
        if (!flag('zoraOk')) return say(actor('zora'), 'Hands off my trolley, darling. That is state property, and so am I.');
        if (!flag('railCoat')) return think('In this coat? The soldiers would shoot me before I poured. I need to look like a railwayman.');
        flag('trolley', true);
        G.jack.pushing = true; G.jack.arm = 'push'; G.jack.facing = -1;
        Sound.sfx('trolley');
        await say(actor('zora'), 'Go, go! Quarter past eleven, the end of platform nine. And bring back my glasses!');
        setObjective('Push the tea trolley to platform nine');
        save();
      },
      async item(id) {
        if (id === 'sugar') return spikeTea();
        return false;
      } },
    { name: 'Door to the Hall', rect: [0, 300, 90, 510], at: [120, 900], exitLabel: 'Back to the station hall',
      exit: () => gotoScene('station', 200, 880, 1) },
    { name: 'Old Pavel', actor: 'pavel', at: [860, 900], face: -1,
      look: () => say(G.jack, 'Old Pavel, according to the name stitched inside his cap. He\'s fast asleep with his nose an inch from a plate of goulash.'),
      async talk() {
        const p = actor('pavel');
        await say(G.jack, 'Excuse me, sir?');
        await say(p, 'Mmm... five more minutes, Mama. The trains can wait.');
        await say(actor('zora'), 'Let him sleep. Forty years he drove the Iron Arrow. Now he drives only the goulash.');
      },
      async item(id) {
        if (id === 'sugar') return say(G.jack, 'He\'s asleep already. Technical Section would call that a waste of good sugar.');
        return false;
      } },
    { name: 'Auntie Zora', actor: 'zora', at: [1300, 890], face: 1,
      look: () => say(G.jack, 'The lady who runs the buffet: a headscarf, a flowered apron and forearms like a stoker. I like her already.'),
      talk: () => talkZora(),
      async item(id) {
        const z = actor('zora');
        if (id === 'cake') return giveCake();
        if (id === 'chocolates') return say(z, 'Chocolates? Keep them for a lady who still has all her teeth.');
        if (id === 'sugar') return say(z, 'Sugar I have. What I do not have is a reason to trust you.');
        if (id === 'passport') return say(z, 'Harwig? You do not look like a Harwig. You look like trouble in a good coat.');
        if (id === 'photo') {
          await say(z, 'Anička! Little Anna, from the flats by the river. She comes in for lemonade with her grandmother.');
          await say(z, 'Her mama went to the West years ago. She sends postcards. The little one keeps them all under her pillow.');
          return think('Ilse\'s daughter, in Karvograd. Vasko keeps the child close, and the mother does what she\'s told.');
        }
        return false;
      } },
  ],
};

function drawBuffetChair(ctx, x, y) {
  ctx.strokeStyle = '#2a160a'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 50, y); ctx.lineTo(x - 44, y - 80); ctx.moveTo(x + 40, y); ctx.lineTo(x + 36, y - 80);
  ctx.moveTo(x - 46, y - 80); ctx.lineTo(x - 60, y - 200); ctx.stroke();
  ctx.fillStyle = '#4a2a14'; ctx.fillRect(x - 60, y - 92, 110, 16);
  ctx.fillRect(x - 70, y - 210, 22, 90);
}

function drawHangingCoat(ctx, x, y) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = linGrad(ctx, -50, 0, 50, 0, [[0, '#1f242d'], [0.5, '#39414f'], [1, '#1f242d']]);
  ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.lineTo(56, 60); ctx.lineTo(64, 330); ctx.lineTo(-64, 330); ctx.lineTo(-56, 60); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2a303c'; poly(ctx, [-20, 0, 20, 0, 12, 60, -12, 60], '#2a303c');
  for (let k = 0; k < 4; k++) { ellipse(ctx, -12, 90 + k * 50, 4, 4, '#c9a13b'); ellipse(ctx, 12, 90 + k * 50, 4, 4, '#c9a13b'); }
  // cap on the peg
  ctx.fillStyle = '#232a38'; ctx.beginPath(); ctx.ellipse(0, -18, 40, 16, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(-40, -18, 80, 10);
  ctx.fillStyle = '#0a0a0a'; ctx.beginPath(); ctx.ellipse(12, -8, 34, 6, 0, 0, Math.PI); ctx.fill();
  ellipse(ctx, 0, -22, 6, 6, '#c9a13b');
  ctx.restore();
}

async function talkZora() {
  const z = actor('zora');
  if (flag('zoraOk')) {
    if (!flag('railCoat')) return say(z, 'The coat, darling, the coat on the rack! Nobody looks at a railwayman.');
    if (!flag('trolley')) return say(z, 'The trolley is by the counter. Quarter past eleven, platform nine.');
    return say(z, 'Why are you still here? The soldiers will freeze and it will be my fault.');
  }
  await say(z, 'What will it be, darling? Tea? Tea? Or tea?');
  for (;;) {
    const c = await choose([
      { text: 'A glass of tea, please.', value: 'tea' },
      !flag('zoraKnees') && { text: 'You look tired.', value: 'tired' },
      flag('zoraKnees') && { text: 'Let me take the tea to platform nine for you.', value: 'offer' },
      { text: 'Goodbye.', value: 'bye' },
    ]);
    if (c === 'tea') {
      await say(G.jack, 'A glass of tea, please.');
      Sound.sfx('pour');
      await say(z, 'Tea we have. Lemon we had in 1984.');
      await say(G.jack, 'Delicious.');
      await say(z, 'Liar. But a polite one. I like you.');
    }
    if (c === 'tired') {
      await say(G.jack, 'You look tired.');
      await say(z, 'Tired? At quarter past eleven I must push that trolley to the end of platform nine, in the snow, with these knees, for soldiers who never say thank you.');
      await say(z, 'Life is hard, darling. Only once was it sweet: Vienna, 1956. I ate a Sachertorte at the Hotel Sacher, and I have dreamt about it every night since.');
      flag('zoraKnees', true);
    }
    if (c === 'offer') {
      await say(G.jack, 'Let me take the tea to platform nine for you.');
      await say(z, 'You? A stranger in a fancy coat? They would shoot you before you said tea.');
      await say(z, 'And why should Zora trust a man like you, eh? Give me one good reason. A sweet one.');
    }
    if (c === 'bye') { await say(G.jack, 'Goodbye.'); return say(z, 'Go with God, and mind the ice.'); }
  }
}

async function giveCake() {
  const z = actor('zora');
  removeItem('cake');
  await say(G.jack, 'For you, madame. A Sachertorte, from the best café in Vienna.');
  await say(z, 'A Sachertorte? A real one, from Vienna?');
  Sound.sfx('paper');
  z.arm = 'hold';
  await wait(1);
  await say(z, 'Oh. Oh, my goodness. Thirty one years, and it tastes exactly as I remember.');
  z.arm = 'rest';
  await say(z, 'You are a good man, whoever you are. What does a good man want from Zora?');
  await say(G.jack, 'Only to save your knees. Let me take the tea trolley to platform nine tonight.');
  await say(z, 'Take it, take it! And put on the railway coat from the rack. The soldiers never look twice at a railway coat.');
  await say(z, 'It belongs to Pavel. He will not miss it before spring.');
  flag('zoraOk', true);
  setObjective('Put on the railway coat and take the tea trolley');
  save();
}

async function spikeTea() {
  if (flag('spiked')) return say(G.jack, 'Any more sugar in that urn and the tea will stand up by itself.');
  removeItem('sugar');
  flag('spiked', true);
  Sound.sfx('pour');
  await say(G.jack, 'Two lumps of Technical Section\'s finest in the urn. Make that six. They\'re big soldiers.');
  save();
}

// ===========================================================================
// PLATFORM NINE — the Iron Arrow
// ===========================================================================
SCENES.platform = {
  title: 'Platform Nine · 23:22',
  music: 'platform', ambience: ['snowWind', 'steam', 'brazier', 'stationFar'], floor: 'Snow',
  paint: paintPlatform,
  walk: [170, 1045, 1920, 1045, 1920, 848, 170, 848],
  depth: [848, 1.6, 1045, 1.98],
  light: LIGHT.platform,
  portraitBg: '#1a2638',
  snow: { n: 300, ground: 1080, wind: 90 },
  actors() {
    const asleep = flag('soldiersAsleep');
    const list = [
      makeFigure('soldier', 1070, 880, { id: 'soldier1', facing: 1, arm: asleep ? 'rest' : 'warm', slump: asleep, seed: 15, depthScale: true }),
      makeFigure('soldier', 1225, 884, { id: 'soldier2', facing: -1, arm: asleep ? 'rest' : 'warm', slump: asleep, seed: 16, depthScale: true, look: LOOKS.soldier }),
    ];
    if (!flag('kolarGone')) list.push(makeFigure('kolar', 800, 870, { id: 'kolar', facing: -1, arm: 'behind', seed: 17, depthScale: true }));
    return list;
  },
  props: [
    { y: 872, draw: ctx => paintBrazier(ctx, 1150, 872) },
    { y: 890, when: () => flag('trolleyParked'), draw: ctx => { ctx.save(); ctx.translate(430, 890); ctx.scale(1.7, 1.7); drawTrolley(ctx, { steam: false }); ctx.restore(); } },
  ],
  back(ctx, t) {
    // steam rolling out of the locomotive
    for (let k = 0; k < 10; k++) {
      const p = (t * 0.12 + k / 10) % 1;
      ctx.save(); ctx.globalAlpha = (1 - p) * 0.14;
      ellipse(ctx, 1820 - p * 700 + Math.sin(p * 5 + k) * 30, 330 - p * 180 + Math.sin(k) * 40, 60 + p * 200, 40 + p * 90, '#dfe4ea');
      ctx.restore();
    }
  },
  front(ctx, t) {
    // brazier flames and sparks
    const x = 1150, y = 872 - 92;
    for (let k = 0; k < 7; k++) {
      const h = 34 + Math.sin(t * 9 + k * 1.7) * 12, xx = x - 28 + k * 9;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = linGrad(ctx, 0, y, 0, y - h, [[0, 'rgba(255,170,60,0.9)'], [1, 'rgba(255,60,20,0)']]);
      ctx.beginPath(); ctx.moveTo(xx - 7, y); ctx.quadraticCurveTo(xx, y - h * 1.2, xx + 7, y); ctx.fill(); ctx.restore();
    }
    glow(ctx, x, y - 10, 180, 'rgba(255,140,50,0.35)', 0.8 + 0.2 * Math.sin(t * 11));
    for (let k = 0; k < 6; k++) { const p = (t * 0.6 + k / 6) % 1; ellipse(ctx, x - 20 + ((k * 37) % 40) + Math.sin(p * 9) * 8, y - p * 160, 1.6, 1.6, `rgba(255,190,90,${1 - p})`); }
  },
  update(dt, t) {
    // Captain Kolar paces in front of the mail van.
    const k = actor('kolar');
    if (k && !G.busy && !k.walking && !k.talking) {
      this._pace = (this._pace || 0) - dt;
      if (this._pace <= 0) { this._pace = 5 + Math.random() * 4; walkTo(k.x < 780 ? 900 : 660, 870, k, 0.6).then(() => { k.facing = -1; }); }
    }
    if (G.jack.pushing && !G.jack.walking) G.jack.arm = 'push';
  },
  async enter() {
    if (flag('platformIntro')) return;
    flag('platformIntro', true);
    G.busy = true;
    await wait(0.8);
    await think('Two soldiers, one officer, and a mail van with a padlock the size of my fist. That van is where I\'d put something precious.');
    await say(actor('kolar'), 'You! Tea man! Over here with that trolley, the men are freezing.');
    setObjective('Serve the soldiers their tea');
    save();
    G.busy = false;
  },
  hotspots: [
    { name: 'The Iron Arrow', rect: [1020, 410, 660, 330],
      look: () => say(G.jack, 'The Iron Arrow. Green carriages, frosted windows, and first-class sleepers for men who don\'t pay for their tickets.') },
    { name: 'Locomotive', rect: [1700, 330, 220, 440],
      look: () => say(G.jack, 'A big black locomotive breathing steam like a dragon with a cold. It leaves at midnight, with or without me.') },
    { name: 'Platform Clock', rect: [1150, 160, 100, 100],
      look: () => say(G.jack, 'Twenty two minutes past eleven. Thirty seven minutes until Moscow.') },
    { name: 'Field Telephone', rect: [160, 550, 80, 100], at: [260, 880], useVerb: 'Crank',
      look: () => say(G.jack, 'A field telephone, wired to the station master\'s office.'),
      async use() {
        Sound.sfx('fieldPhone');
        await wait(0.6);
        await say(G.jack, 'Dead. Snow on the line, probably. Nobody in this station is phoning anybody tonight.');
      } },
    { name: 'Brazier', rect: [1100, 770, 100, 110],
      look: () => say(G.jack, 'A brazier made from an oil drum. The soldiers are warming their hands and their opinions.') },
    { name: 'Mail Van', rect: [290, 410, 690, 360], at: [520, 880],
      look: () => say(G.jack, 'The mail van. No windows, one door, a red star and a lead seal. "Karvograd to Moscow." Nobody guards the Christmas post this carefully.') },
    { name: 'Mail Van Door', rect: [556, 476, 204, 300], at: [660, 880], exitLabel: 'Open the mail van', exitDir: 'up', photo: 'padlock',
      look: () => say(G.jack, 'A heavy padlock through the hasp, and a lead seal stamped with the Karvonian star.'),
      async exit() {
        if (!flag('kolarGone')) return say(actor('kolar'), 'Away from the van, tea man! Tea over there, van over here. Simple.');
        if (!flag('vanUnlocked')) return say(G.jack, 'Locked. I need something thin and strong for a padlock like that.');
        return enterVan();
      },
      async item(id) {
        if (id !== 'hairpin') return false;
        if (!flag('kolarGone')) return say(actor('kolar'), 'Away from the van, tea man!');
        Sound.sfx('lockpick');
        await wait(1.2);
        Sound.sfx('unlock');
        flag('vanUnlocked', true);
        await say(G.jack, 'Ilse\'s hairpin. I\'ll have to thank her, next time she isn\'t pointing a gun at me.');
        save();
        return enterVan();
      } },
    { name: 'Archway', rect: [0, 330, 160, 480], at: [200, 900], exitLabel: 'Back to the station hall',
      async exit() {
        if (G.jack.pushing) return say(G.jack, 'Not with a full urn of tea. The soldiers would never forgive me.');
        await gotoScene('station', 1540, 880, -1, { sfx: 'gate' });
      } },
    { name: 'Soldier', actor: 'soldier1', at: [930, 900], face: 1,
      look: () => say(G.jack, flag('soldiersAsleep') ? 'Snoring like a sawmill. Technical Section\'s sugar works.' : 'A young soldier in a fur hat, stamping his feet by the fire. He looks about nineteen.'),
      talk: () => serveTea(),
      async item(id) { if (id === 'sugar') return serveTea(true); return false; } },
    { name: 'Soldier', actor: 'soldier2', at: [1380, 900], face: -1,
      look: () => say(G.jack, flag('soldiersAsleep') ? 'Dead to the world, and dreaming of Auntie Zora\'s tea.' : 'A bigger soldier with frost in his eyebrows. He is watching the van and the fire, mostly the fire.'),
      talk: () => serveTea(),
      async item(id) { if (id === 'sugar') return serveTea(true); return false; } },
    { name: 'Captain Kolar', actor: 'kolar', at: [620, 900], face: 1,
      look: () => say(G.jack, 'A Karvonian captain with a face like a closed door. The kind of officer who counts the tea glasses.'),
      talk: () => talkKolar(),
      async item(id) {
        const k = actor('kolar');
        if (id === 'sugar') return say(k, 'Sugar? I do not drink tea on duty, tea man. I do not drink anything on duty.');
        if (id === 'photo') return say(k, 'Where did you get this? Put it away, before you get us both shot.');
        if (id === 'passport') return say(k, 'I do not care who you are. I care that you are over there.');
        return false;
      } },
  ],
};

async function talkKolar() {
  const k = actor('kolar');
  await say(G.jack, 'Tea, Captain?');
  await say(k, 'Tea is for grandmothers. A Karvonian officer drinks nothing on duty.');
  for (;;) {
    const c = await choose([
      { text: 'What\'s in the van?', value: 'van' },
      { text: 'Who are you, Captain?', value: 'who' },
      { text: 'I\'ll leave you to it.', value: 'bye' },
    ]);
    if (c === 'van') {
      await say(G.jack, 'What\'s in the van?');
      await say(k, 'Mail. Very important mail. Presents for our friends in Moscow.');
      await say(k, 'And one present, tea man, that the Colonel packed himself.');
    }
    if (c === 'who') {
      await say(G.jack, 'Who are you, Captain?');
      await say(k, 'Captain Kolar, personal escort to Colonel Vasko. I answer to the Colonel and to nobody else, tea man.');
    }
    if (c === 'bye') { await say(G.jack, 'I\'ll leave you to it.'); return say(k, 'Tea. Soldiers. Go.'); }
  }
}

async function serveTea(withSugar) {
  const s1 = actor('soldier1'), s2 = actor('soldier2');
  if (flag('soldiersAsleep')) return say(G.jack, 'Sweet dreams, comrades.');
  if (!flag('trolley')) return say(s1, 'Tea man? Where is the tea, tea man?');
  if (withSugar) {
    if (!flag('spiked')) {
      removeItem('sugar'); flag('spiked', true);
      await say(G.jack, 'Another glass, comrades? With sugar this time, the Viennese way.');
    }
  } else {
    await say(G.jack, 'Tea, comrades?');
    await say(s1, 'At last! Where is Auntie Zora?');
    await say(G.jack, 'Her knees.');
    await say(s2, 'Ah, her knees.');
  }
  Sound.sfx('pour');
  s1.arm = 'hold'; s2.arm = 'hold';
  await wait(0.6);
  Sound.sfx('drink');
  await wait(0.8);
  if (!flag('spiked')) {
    await say(s2, 'Ah, that is better. Hot, at least. Now go away, tea man.');
    s1.arm = 'warm'; s2.arm = 'warm';
    return think('They drink it, and they\'re wider awake than ever. That tea needs something a lot more relaxing in it.');
  }
  await say(s1, 'Very sweet tonight, this tea. Very... sweet.');
  await say(s2, 'I feel like a... little sit down.');
  Sound.sfx('yawn');
  await wait(0.8);
  s1.slump = true; s2.slump = true; s1.arm = 'rest'; s2.arm = 'rest';
  Sound.sfx('thud');
  flag('soldiersAsleep', true);
  await wait(1);
  await kolarLeaves();
}

async function kolarLeaves() {
  const k = actor('kolar');
  if (!k) return;
  k.arm = 'rest';
  await walkTo(980, 880, k, 1.2);
  await say(k, 'What is this? Asleep! On duty, on the Colonel\'s train!');
  await say(k, 'Somebody gave them slivovitz. I will have them both shot. Then I will have them woken up and shot again.');
  await walkTo(280, 880, k, 1.2);
  Sound.sfx('fieldPhone');
  await say(k, 'Hello? Station master? Hello! Dead. Snow on the line, again!');
  k.facing = 1;
  await say(k, 'You, tea man! Watch them. Nobody touches that van. I am fetching the guard from the hall.');
  await walkTo(60, 900, k, 1.3);
  removeActor('kolar');
  Sound.sfx('gate');
  flag('kolarGone', true);
  // the trolley stays by the van
  G.jack.pushing = false; G.jack.arm = 'rest'; flag('trolleyParked', true);
  await think('A padlock and about five minutes before he comes back with friends. Plenty.');
  setObjective('Get into the mail van before Kolar comes back');
  save();
}

async function enterVan() {
  G.jack.pushing = false; G.jack.arm = 'rest'; flag('trolleyParked', true);
  Sound.sfx('slidingDoor');
  await gotoScene('van', 1640, 900, -1, { sfx: 'slidingDoor' });
}

// ===========================================================================
// THE MAIL VAN
// ===========================================================================
SCENES.van = {
  title: 'The Mail Van',
  music: 'tension', ambience: ['vanCreak', 'geese', 'snowWind'], floor: 'Wood',
  paint: paintVan,
  walk: [60, 1045, 1860, 1045, 1800, 832, 100, 832],
  depth: [832, 1.7, 1045, 2.05],
  light: LIGHT.van,
  portraitBg: '#3a2410',
  props: [
    { y: 800, draw: ctx => paintPortraitCrate(ctx, flag('crateOpen')) },
    { y: 805, draw: (ctx, t) => drawGeese(ctx, t) },
    { y: 560, when: () => !has('crowbar') && !flag('gotCrowbar'), draw: ctx => { ctx.save(); ctx.translate(1612, 370); ctx.rotate(0.08); ctx.fillStyle = '#9e1f28'; ctx.fillRect(-5, 0, 10, 190); ctx.fillStyle = '#4a4e52'; ctx.fillRect(-5, 186, 10, 16); ctx.beginPath(); ctx.arc(-6, 0, 10, Math.PI, 0); ctx.lineWidth = 8; ctx.strokeStyle = '#9e1f28'; ctx.stroke(); ctx.restore(); } },
  ],
  back(ctx, t) {
    // the lantern swings, harder once the train is moving
    const moving = flag('moving');
    const a = Math.sin(t * (moving ? 2.4 : 0.8)) * (moving ? 0.22 : 0.05);
    ctx.save(); ctx.translate(700, 80); ctx.rotate(a);
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 110); ctx.stroke();
    ctx.fillStyle = '#2a2a2a'; ctx.fillRect(-18, 110, 36, 8); ctx.fillRect(-14, 160, 28, 8);
    ctx.fillStyle = 'rgba(255,200,110,0.9)'; ctx.fillRect(-14, 118, 28, 42);
    glow(ctx, 0, 140, 90, 'rgba(255,190,100,0.7)');
    ctx.restore();
    if (moving) {
      // light from passing lamps flickers through the door cracks
      const f = (Math.sin(t * 7) > 0.6) ? 0.5 : 0.1;
      ctx.save(); ctx.globalAlpha = f; ctx.fillStyle = 'rgba(255,220,180,0.8)'; ctx.fillRect(1694, 220, 5, 590); ctx.restore();
    }
  },
  front(ctx, t) {
    if (!flag('moving')) return;
    const j = Math.sin(t * 13) * 0.5 + Math.sin(t * 3.1);
    ctx.save(); ctx.globalAlpha = 0.05 + 0.03 * Math.abs(j); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
  },
  async enter() {
    if (flag('moving')) { Sound.setAmbience(['trainRumble', 'vanCreak', 'geese', 'snowWind']); Sound.playMusic('action'); }
    if (flag('vanIntro')) return;
    flag('vanIntro', true);
    G.busy = true;
    await wait(0.8);
    Sound.sfx('honk');
    await think('Mailbags, crates of brandy, and... geese. The Karvonian post is more varied than I expected.');
    setObjective('Find the Nightglass plans');
    save();
    G.busy = false;
  },
  hotspots: [
    { name: 'Strongbox', rect: [296, 556, 230, 190], at: [420, 890], useVerb: 'Open',
      look: () => say(G.jack, flag('strongboxOpen') ? 'A decoy canister and a very smug birthday card.' : 'A steel strongbox chained to the wall and stencilled TOP SECRET in two languages. Subtle as a brass band.'),
      async use() {
        if (flag('strongboxOpen')) return say(G.jack, 'A decoy canister and a very smug birthday card. I\'ll leave them for the next spy.');
        const ok = await openKeypad('141146', {
          brand: 'TRESORBAU KÖLN  ·  MODELL 6',
          onGiveUp: () => run(async () => {
            if (flag('sawBust')) await think('Six digits, and it\'s Vasko\'s box. The bust in the hall said he was born on the fourteenth of November, 1946. He wouldn\'t use his birthday twice... would he?');
            else await think('Six digits, and it\'s Vasko\'s box. Everything that man owns is about himself. That statue of him in the station hall might have something useful on it.');
          }),
        });
        if (ok) await strongboxOpened();
      } },
    { name: 'Plum Brandy', rect: [560, 500, 300, 300], at: [700, 880],
      look: () => say(G.jack, 'Forty bottles of plum brandy, a gift from the workers of Karvonia to the workers of Moscow. The workers of Moscow will be very happy.'),
      take: () => say(G.jack, 'Tempting. But I need both hands and a clear head.') },
    { name: 'Tractor Parts', rect: [900, 620, 220, 180], at: [1000, 880],
      look: () => say(G.jack, 'Spare parts for a T-25 tractor. A thoughtful gift for a country with no roads.') },
    { name: 'Geese', rect: [110, 620, 180, 180], at: [300, 890], useVerb: 'Calm',
      look: () => say(G.jack, 'Three geese in a slatted crate, on their way to Moscow. They look more worried than I am.'),
      async use() { Sound.sfx('honk'); await say(G.jack, 'Quiet, ladies. We\'re all fugitives in here.'); } },
    { name: 'Mailbags', rect: [1470, 640, 220, 170], at: [1500, 890],
      look: () => say(G.jack, 'Sacks of letters to Moscow. Somewhere in there is a postcard from somebody\'s grandmother that will arrive in about 1989.') },
    { name: 'Crowbar', photo: 'crowbar', rect: [1590, 350, 50, 220], at: [1600, 880], when: () => !flag('gotCrowbar'),
      look: () => say(G.jack, 'A crowbar hanging on a hook by the door. Railway issue, painted red.'),
      async take() { flag('gotCrowbar', true); addItem('crowbar'); await say(G.jack, 'A railway crowbar. Heavy, honest, and very persuasive.'); save(); } },
    { name: () => flag('crateOpen') ? 'Vasko\'s Portrait' : 'Portrait Crate', rect: [1180, 170, 320, 630], at: [1340, 880], useVerb: () => flag('crateOpen') ? 'Search' : 'Open',
      async look() {
        if (flag('gotPlans')) return say(G.jack, 'Vasko on his horse, with a hole where his backing board used to be. He\'ll take that personally.');
        if (flag('crateOpen')) return say(G.jack, 'Colonel Vasko, three metres tall, on a rearing white horse with a sabre in the sunset. The horse looks embarrassed.');
        await say(G.jack, 'A flat crate, taller than me. "Portrait of Colonel D. Vasko, Hero of Karvograd. A gift to the Soviet people."');
        await think('Of course. Who would think of looking behind the man\'s own face?');
      },
      async use() {
        if (flag('gotPlans')) return say(G.jack, 'I\'ve got what I came for.');
        if (!flag('crateOpen')) {
          if (!has('crowbar')) return say(G.jack, 'Nailed shut, with Karvonian nails. Built to outlast the state. I need something to lever it open.');
          return openCrate();
        }
        return searchPortrait();
      },
      async item(id) {
        if (id !== 'crowbar') return false;
        if (!flag('crateOpen')) return openCrate();
        return searchPortrait();
      } },
    { name: 'Roof Hatch', rect: [860, 36, 200, 60], at: [960, 870], exitLabel: 'Climb through the roof hatch', exitDir: 'up',
      look: () => say(G.jack, 'A hatch in the roof, bolted on the inside. The bolt is rusted solid.'),
      async exit() {
        if (!flag('moving')) return say(G.jack, 'Up on the roof in the middle of Karvograd station? Every soldier on platform nine would see me.');
        if (!has('crowbar')) return say(G.jack, 'The bolt is rusted solid. I need some leverage.');
        await climbOut();
      },
      async item(id) {
        if (id !== 'crowbar') return false;
        if (!flag('moving')) return say(G.jack, 'Not yet. Up there, every soldier on the platform would see me.');
        await climbOut();
      } },
    { name: 'Van Door', rect: [1700, 220, 190, 590], at: [1650, 890], exitLabel: 'Back to the platform',
      async exit() {
        if (flag('moving')) return say(G.jack, 'Locked from the outside. Kolar knows his job, I\'ll give him that.');
        await gotoScene('platform', 660, 880, 1, { sfx: 'slidingDoor' });
      } },
  ],
};

function drawGeese(ctx, t) {
  const x = 120, y = 640;
  ctx.fillStyle = '#6a4a22'; ctx.fillRect(x, y, 160, 160);
  for (let k = 0; k < 3; k++) {
    const hx = x + 30 + k * 50, bob = Math.sin(t * (2 + k * 0.7) + k) * 6, up = Math.sin(t * 0.7 + k * 2) > 0.7 ? -30 : 0;
    ellipse(ctx, hx, y + 70, 24, 16, '#f0ece4');
    ctx.strokeStyle = '#f0ece4'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hx, y + 64); ctx.quadraticCurveTo(hx + 6, y + 30 + up / 2, hx + 2 + bob, y + 10 + up); ctx.stroke();
    ellipse(ctx, hx + 2 + bob, y + 6 + up, 9, 8, '#f0ece4');
    poly(ctx, [hx + 9 + bob, y + 4 + up, hx + 22 + bob, y + 8 + up, hx + 9 + bob, y + 11 + up], '#e8902a');
    ellipse(ctx, hx + 5 + bob, y + 3 + up, 1.6, 1.6, '#111');
  }
  ctx.fillStyle = '#8a6a3a';
  for (let k = 0; k < 6; k++) ctx.fillRect(x + k * 30, y, 12, 160);
  ctx.fillRect(x, y + 60, 160, 12); ctx.fillRect(x, y + 148, 160, 12);
}

async function strongboxOpened() {
  flag('strongboxOpen', true);
  Sound.sfx('unlock');
  await wait(0.6);
  await say(G.jack, 'A steel canister stamped NIGHTGLASS, and a birthday card.');
  await say(G.jack, '"Nice try, Mr Harrow. Happy birthday to me. V."');
  await say(G.jack, 'Twice in one week. He really does think I\'m an idiot.');
  await think('The real plans won\'t be in a box that says TOP SECRET. Where would Vasko hide the thing he loves most in the world? Behind his own face.');
  save();
}

async function openCrate() {
  Sound.sfx('crowbar');
  await wait(0.9);
  Sound.sfx('crowbar');
  flag('crateOpen', true);
  await wait(0.5);
  await say(G.jack, 'Colonel Vasko, three metres tall, on a rearing white horse in the sunset. The horse looks embarrassed.');
  await think('And the backing board is twice as thick as it needs to be.');
  save();
}

async function searchPortrait() {
  if (!has('crowbar')) return say(G.jack, 'The backing board is thick and nailed tight. I need something to lever it off.');
  Sound.sfx('crowbar');
  await wait(0.8);
  Sound.sfx('paper');
  await say(G.jack, 'Behind the canvas, forty sheets of blueprint, rolled up tight.');
  addItem('blueprints');
  flag('gotPlans', true);
  await say(G.jack, 'NIGHTGLASS. Top secret. The real thing at last.');
  await think('Vasko hid the West\'s most secret aircraft behind his own face. Of course he did.');
  save();
  await departure();
}

async function departure() {
  G.busy = true;
  await wait(0.6);
  await say('kolar', 'Seal the van! Wake those two idiots! We leave now!', { pos: [1560, 240] });
  Sound.sfx('slidingDoor'); await wait(0.3); Sound.sfx('door');
  await wait(0.4); Sound.sfx('lock');
  await wait(0.8);
  Sound.sfx('whistle');
  await wait(1.4);
  Sound.sfx('clank');
  flag('moving', true);
  Sound.setAmbience(['trainRumble', 'vanCreak', 'geese', 'snowWind']);
  Sound.playMusic('action');
  G.jack.x -= 30;
  await wait(0.8);
  await say(G.jack, 'Ah.');
  await think('Locked in a mail van on the midnight express to Moscow, with Vasko\'s crown jewels under my arm. Control will be thrilled.');
  setObjective('Get out of the moving van');
  save();
  G.busy = false;
}

async function climbOut() {
  G.busy = true;
  Sound.sfx('crowbar'); await wait(0.6);
  Sound.sfx('clank');
  await say(G.jack, 'The bolt gives. Freezing wind, and a whole train of roofs between me and the sleeping cars.');
  G.fadeTo = 1; await waitUntil(() => G.fade > 0.98);
  TrainRoof.start();
}

// ===========================================================================
// THE IRON ARROW — a sleeping compartment, after midnight
// ===========================================================================
SCENES.sleeper = {
  title: 'The Iron Arrow · Sleeping Car 2',
  music: 'train', ambience: ['trainRumble', 'snowWind'], floor: 'Carpet',
  paint: ctx => paintCompartment(ctx),
  walk: [220, 1045, 1700, 1045, 1640, 836, 280, 836],
  depth: [836, 1.62, 1045, 1.95],
  light: LIGHT.sleeper,
  portraitBg: '#1a2030',
  paintAfter(ctx) {
    // night: the lamp is off, only the blue night light and the moon
    ctx.save(); ctx.fillStyle = 'rgba(6,12,30,0.5)'; ctx.fillRect(0, 0, W, H); ctx.restore();
    glow(ctx, 960, 60, 300, 'rgba(120,150,255,0.25)');
  },
  back(ctx, t) { drawTrainWindow(ctx, t, 700, 180, 520, 420, 1.6); },
  front(ctx, t) {
    const sway = Math.sin(t * 2.1) * 0.6 + Math.sin(t * 6.3) * 0.3;
    ctx.save(); ctx.globalAlpha = 0.05 + 0.04 * Math.abs(sway); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
  },
  async enter() {
    if (flag('sleeperIntro')) return;
    flag('sleeperIntro', true);
    G.busy = true;
    await wait(1);
    await think('Warm, dark and empty. Somebody\'s luck is running out tonight, and for once it isn\'t mine.');
    await say(G.jack, 'Next stop, anywhere but Moscow.');
    setObjective('Hide the blueprints');
    save();
    G.busy = false;
  },
  hotspots: [
    { name: 'Window', rect: [700, 180, 520, 420],
      look: () => say(G.jack, 'Mountains, moonlight and a long drop into the snow. I\'ve seen enough of the outside of this train for one night.') },
    { name: 'Tea Glasses', rect: [826, 568, 260, 56],
      look: () => say(G.jack, 'Two glasses of tea, still warm. Somebody was expecting company.') },
    { name: 'Lower Berth', rect: [1310, 600, 480, 170], at: [1250, 900], useVerb: 'Lift the mattress on',
      look: () => say(G.jack, 'A lower berth, made up with crisp sheets and the lumpiest mattress in Karvonia.'),
      use: () => has('blueprints') ? hidePlans() : say(G.jack, 'Nothing under there but springs.'),
      async item(id) { if (id === 'blueprints') return hidePlans(); return false; } },
    { name: 'Corridor Door', rect: [1800, 120, 130, 690], at: [1690, 880], exitLabel: 'Look out into the corridor',
      exit: () => say(G.jack, 'The corridor is full of Karvonian uniforms. I\'ll stay in here, thank you.') },
  ],
};

async function hidePlans() {
  G.busy = true;
  removeItem('blueprints');
  Sound.sfx('cloth');
  await say(G.jack, 'Under the mattress. The West\'s greatest secret, and Karvonian State Railways\' worst bed.');
  await wait(1);
  await cliffhangerScene();
}

async function cliffhangerScene() {
  Sound.stopMusic();
  await wait(0.8);
  Sound.sfx('knock');
  await wait(1.2);
  G.jack.facing = 1;
  Sound.sfx('slidingDoor');
  const v = makeFigure('vasko', 1900, 880, { id: 'vasko', facing: -1, arm: 'behind', seed: 18, depthScale: true });
  v.scale = depthScale(880);
  G.actors.push(v);
  Sound.sfx('sting');
  Sound.playMusic('tension');
  await walkTo(1560, 880, v, 0.7);
  await say(v, 'Good evening, Mr Harrow. Tickets, please.');
  await say(G.jack, 'Colonel Vasko. Many happy returns.');
  await say(v, 'Thank you. It has been a wonderful birthday week, and you, Mr Harrow, have been my favourite present.');
  const k = makeFigure('kolar', 1920, 890, { id: 'kolar', facing: -1, arm: 'point', seed: 17, depthScale: true });
  k.scale = depthScale(890);
  G.actors.push(k);
  await walkTo(1760, 890, k);
  await say(k, 'Colonel, the mail van is open, and the portrait has been... damaged.');
  await say(v, 'My portrait?');
  await say(v, 'Mr Harrow, you may steal my secrets. But you do not touch my face.');
  const i = makeFigure('ilse', 1920, 870, { id: 'ilse', facing: -1, arm: 'rest', seed: 3, depthScale: true });
  i.scale = depthScale(870);
  G.actors.push(i);
  await walkTo(1840, 870, i, 0.8);
  await say(v, 'And I believe you already know my travelling companion.');
  await say(i, 'Hello, Jack.');
  await wait(0.8);
  G.fade = 1; G.fadeTo = 1;
  Sound.stopMusic(); Sound.setAmbience(['trainRumble']);
  Sound.sfx('whistle');
  await wait(2.6);
  store.del(CHAPTER.saveKey);
  await Ending.cliffhanger();
}

// ---------- the train window: a moving landscape -----------------------------------
function drawTrainWindow(ctx, t, x, y, w, h, speed) {
  ctx.save();
  rrect(ctx, x + 9, y + 9, w - 18, h - 18, 28); ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, y, 0, y + h, [[0, '#050a18'], [0.6, '#15233c'], [1, '#2a3650']]); ctx.fillRect(x, y, w, h);
  ellipse(ctx, x + w * 0.7, y + 120, 26, 26, '#eef2f6'); glow(ctx, x + w * 0.7, y + 120, 140, 'rgba(190,210,255,0.3)');
  const layer = (canvasKey, painter, rate, yy) => {
    if (!drawTrainWindow[canvasKey]) { const c = makeCanvas(1200, 400), cx = c.getContext('2d'); painter(cx); drawTrainWindow[canvasKey] = c; }
    const img = drawTrainWindow[canvasKey], off = (t * rate * speed) % 1200;
    for (let k = -1; k < 2; k++) ctx.drawImage(img, x - off + k * 1200, y + yy);
  };
  layer('_far', c => paintMountains(c, 3, 300, 220, '#1c2a44', 'rgba(210,225,245,0.55)', 0, 1200), 20, 20);
  layer('_mid', c => { paintMountains(c, 9, 330, 120, '#141e30', 'rgba(200,215,240,0.4)', 0, 1200); paintPines(c, 4, 360, 120, '#0a1220', 0, 1200, 0.8); }, 80, 40);
  layer('_near', c => { c.fillStyle = '#dfe6ee'; c.fillRect(0, 330, 1200, 70); paintPines(c, 8, 340, 190, '#060a12', 0, 1200, 0.5); }, 420, 80);
  // telegraph poles flicking past
  const pp = (t * 900 * speed) % 700;
  ctx.fillStyle = '#05070c'; ctx.fillRect(x + w - pp, y, 10, h);
  ctx.strokeStyle = 'rgba(10,14,20,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + 60 + Math.sin(t * 3) * 6); ctx.lineTo(x + w, y + 60 + Math.sin(t * 3 + 1) * 6); ctx.stroke();
  // snow streaking past the glass
  ctx.fillStyle = 'rgba(240,244,250,0.8)';
  for (let k = 0; k < 40; k++) { const sx = x + w - ((t * 700 * speed + k * 131) % (w + 60)), sy = y + ((k * 97 + t * 60) % h); ctx.fillRect(sx, sy, 8, 2); }
  // reflection of the lamp in the glass
  ctx.globalAlpha = 0.1; ctx.fillStyle = linGrad(ctx, x, y, x + w, y + h, [[0, 'rgba(255,232,192,0)'], [0.45, 'rgba(255,232,192,1)'], [0.55, 'rgba(255,232,192,0)']]); ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// Snow falling beyond a window (the station hall and the buffet).
function drawSnowInWindow(ctx, t, x, y, w, h, arch) {
  ctx.save();
  ctx.beginPath();
  if (arch) { ctx.moveTo(x, y + h); ctx.lineTo(x, y + w / 2); ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + h); }
  else ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = 'rgba(235,240,248,0.75)';
  for (let k = 0; k < 90; k++) {
    const sx = x + ((k * 53 + Math.sin(t * 0.7 + k) * 30 + t * 20) % w), sy = y + ((k * 71 + t * (40 + (k % 5) * 12)) % h);
    ctx.beginPath(); ctx.arc(sx, sy, 1.2 + (k % 3), 0, 7); ctx.fill();
  }
  ctx.restore();
}

// The split-flap departure board.
function drawDepartures(ctx, t) {
  const rows = [
    ['23:59', 'IRON ARROW · MOSKVA', '9', 'ON TIME'],
    ['00:10', 'DUNAJ · WIEN', '4', 'CANCELLED'],
    ['00:45', 'BALTIK · WARSZAWA', '2', 'CANCELLED'],
    ['01:30', 'KARVOGRAD SEVER', '1', 'CANCELLED'],
    ['05:05', 'ZLATÁ STRELA · PRAHA', '3', 'DELAYED'],
  ];
  ctx.save();
  ctx.font = `600 22px ${FONT_TYPE}`; ctx.textAlign = 'left';
  rows.forEach((r, i) => {
    const y = 190 + i * 50;
    ctx.fillStyle = '#141414'; ctx.fillRect(1506, y - 26, 378, 40);
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(1506, y - 7, 378, 1);
    const flip = i === 0 && (t % 9) < 0.5;
    ctx.fillStyle = i === 0 ? '#ffd35a' : '#e8e0c8';
    ctx.fillText(flip ? '▒▒:▒▒' : r[0], 1512, y);
    ctx.fillText(r[1].slice(0, 17), 1596, y);
    ctx.fillText(r[2], 1862, y);
    ctx.font = `600 13px ${FONT_UI}`; ctx.fillStyle = r[3] === 'ON TIME' ? '#7aff9a' : '#ff8a7a';
    ctx.fillText(r[3], 1596, y + 12);
    ctx.font = `600 22px ${FONT_TYPE}`;
  });
  ctx.restore();
}

// ---------- hint thoughts ------------------------------------------------------------
async function hintThought() {
  const sc = G.sceneId;
  if (sc === 'flat') {
    if (!flag('briefed')) return think('Franz knows where the real plans went. Time for a proper chat with the barman.');
    if (!flag('searchedBag')) return think('Ilse left her handbag on the chair. A spy should always check the handbag.');
    return think('Karvograd, then. The door is on the left.');
  }
  if (sc === 'compartment') {
    if (!flag('novakCharmed')) {
      if (!flag('sawProgramme')) return think('Madame Novak wants to be recognised. Something on her seat might tell me who she is.');
      return think('She sang Rosalinde in Vienna. Every diva likes to hear she was magnificent.');
    }
    return think('She hasn\'t eaten since Vienna, and Franz packed Mozart chocolates for exactly this kind of lady.');
  }
  if (sc === 'station') {
    if (!flag('knowsTea')) return think('That militiaman must let somebody through that gate. I should ask him who.');
    if (!flag('zoraOk')) return think('The tea lady from the buffet goes through every night. Perhaps she\'d like a night off.');
    if (!flag('railCoat') || !flag('trolley')) return think('A railway coat and Auntie Zora\'s trolley, both waiting in the buffet.');
    return think('Tea for platform nine. The gate is on the right.');
  }
  if (sc === 'buffet') {
    if (!flag('zoraKnees')) return think('Auntie Zora looks like she has troubles. Maybe I should ask about them.');
    if (!flag('zoraOk')) return think('She has dreamt of a Sachertorte since 1956, and I just happen to have one.');
    if (!flag('railCoat')) return think('Pavel\'s railway coat is on the rack. Zora said the soldiers never look twice at a railway coat.');
    if (!flag('trolley')) return think('The tea trolley is by the counter. Time to go and pour.');
    if (!flag('spiked')) return think('Those soldiers need very sweet dreams. Technical Section\'s sugar belongs in that urn.');
    return think('Tea for platform nine. The station hall is through the door on the left.');
  }
  if (sc === 'platform') {
    if (!flag('soldiersAsleep')) return think(flag('spiked') ? 'The tea is ready. Time to serve the soldiers.' : 'Two soldiers and a lot of tea. Technical Section\'s sugar lumps would make it a lot more relaxing.');
    if (!flag('vanUnlocked')) return think('A padlock, and Ilse\'s hairpin in my pocket. Every spy knows that trick.');
    return think('The mail van is open. In I go.');
  }
  if (sc === 'van') {
    if (flag('moving')) return think('The door is locked from outside. The roof hatch is my way out, and the crowbar can shift that bolt.');
    if (!has('crowbar') && !flag('gotCrowbar')) return think('That crowbar by the door could open a lot of crates.');
    if (!flag('strongboxOpen') && !flag('crateOpen')) return think('A box marked TOP SECRET, or a portrait of the vainest man in Europe. Which would Vasko really trust?');
    return think('Vasko would hide the thing he loves most behind his own face. That portrait crate.');
  }
  if (sc === 'sleeper') return think('Somewhere safe for the blueprints. That berth has a very thick mattress.');
}
