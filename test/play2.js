// Full playthrough of Chapter Two, logging every line and screenshotting each scene.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  p.on('console', m => { if (m.type() === 'error' && !/CERT|fonts/.test(m.text())) { errors.push(m.text()); console.log('console:', m.text()); } });
  p.on('pageerror', e => { errors.push(e.message); console.log('PAGEERROR:', e.message); });
  await p.goto('file://' + path.resolve('dist/chapter2.html'));
  await p.waitForTimeout(4500);
  await p.screenshot({ path: 'test/c2_title.png' });
  await p.mouse.click(1500, 200);
  await p.waitForTimeout(300);
  const shot = async n => { await p.waitForTimeout(400); await p.screenshot({ path: `test/c2_${n}.png` }); };
  await p.evaluate(() => {
    window.LOG = [];
    setInterval(() => {
      const s = G.speech[0];
      if (s && s.t > 0.05) { LOG.push(s.id + ': ' + s.text); endSpeech(s); }
      if (G.mode === 'text') TextScreen.skip();
    }, 30);
  });
  const state = () => p.evaluate(() => JSON.stringify({ busy: G.busy, sp: G.speech.length, ch: !!G.choices, ov: !!G.overlay, fade: G.fade, walking: G.jack && G.jack.walking, x: G.jack && G.jack.x, y: G.jack && G.jack.y, scene: G.sceneId, mode: G.mode, obj: G.objective }));
  const idle = async () => { try { await p.waitForFunction(() => G.mode === 'play' && !G.busy && !G.speech.length && !G.choices && G.fade < 0.05 && (!G.jack || !G.jack.walking), null, { timeout: 20000 }); } catch (e) { console.log('STATE', await state()); console.log(errors); await p.screenshot({ path: 'test/c2_stuck.png' }); throw e; } };
  const act = async (name, mode = 'default', item) => {
    await idle();
    const ok = await p.evaluate(([name, mode, item]) => {
      const h = G.scene.hotspots.find(h => (typeof h.name === 'function' ? h.name() : h.name) === name && (!h.when || h.when()));
      if (!h) return 'NO HOTSPOT ' + name;
      run(() => interact(h, mode, item));
      return 'ok';
    }, [name, mode, item]);
    if (ok !== 'ok') { console.log(ok); throw new Error(ok); }
    await p.waitForTimeout(100);
    try { await p.waitForFunction(() => G.choices || G.overlay || (!G.busy && !G.speech.length && G.fade < 0.05 && !G.jack.walking) || G.mode !== 'play', null, { timeout: 30000 }); }
    catch (e) { console.log('STATE', await state()); await p.screenshot({ path: 'test/c2_stuck.png' }); throw e; }
  };
  const choose = async value => {
    await p.waitForFunction(() => G.choices, null, { timeout: 20000 });
    const ok = await p.evaluate(v => { const c = G.choices; if (!c.options.some(o => o.value === v)) return 'NO CHOICE ' + v + ' in ' + c.options.map(o => o.value); G.choices = null; c.resolve(v); return 'ok'; }, value);
    if (ok !== 'ok') { console.log(ok); throw new Error(ok); }
    await p.waitForTimeout(50);
  };
  const dump = async label => { const l = await p.evaluate(() => { const x = LOG.slice(); LOG.length = 0; return x; }); console.log('--- ' + label); l.forEach(x => console.log('  ' + x)); };
  const scene = async id => { await p.waitForFunction(id => G.sceneId === id && G.mode === 'play', id, { timeout: 60000 }); await idle(); };

  await p.evaluate(() => { newGame(); });
  await scene('flat');
  await shot('flat');
  await dump('flat intro');
  await act('Door');
  await act('Franz'); await choose('who'); await choose('plans'); await choose('bye');
  await act('Ilse\'s Pistol');
  await act('Ilse\'s Handbag');
  await dump('flat');
  await act('Door');
  await scene('compartment');
  await shot('compartment');
  await dump('train intro');
  await act('Corridor Door'); await choose('hand');
  await idle();
  await dump('arrested');
  await act('Madame Novak', 'item', 'chocolates');
  await act('Opera Programme', 'look');
  await act('Madame Novak'); await choose('who'); await choose('rosalinde'); await choose('favour');
  await idle();
  await shot('novak');
  await act('Madame Novak', 'item', 'chocolates');
  await scene('station');
  await shot('station');
  await dump('border + station intro');
  await act('Platform Gate');
  await act('Militiaman'); await choose('who'); await choose('bye');
  await act('Bust of Vasko', 'look');
  await act('Buffet');
  await scene('buffet');
  await shot('buffet');
  await act('Tea Trolley');
  await act('Auntie Zora'); await choose('tired'); await choose('offer'); await choose('bye');
  await act('Auntie Zora', 'item', 'photo');
  await act('Auntie Zora', 'item', 'cake');
  await act('Railway Coat');
  await act('Tea Trolley');
  await shot('buffet_after');
  await act('Old Pavel');
  await dump('buffet');
  await act('Door to the Hall');
  await scene('station');
  await act('Platform Gate');
  await scene('platform');
  await shot('platform');
  await act('Mail Van Door');
  await act('Soldier');
  await act('Soldier', 'item', 'sugar');
  await p.waitForFunction(() => flag('kolarGone'), null, { timeout: 60000 });
  await idle();
  await shot('platform_after');
  await dump('platform');
  await act('Mail Van Door', 'item', 'hairpin');
  await scene('van');
  await shot('van');
  await act('Portrait Crate');
  await act('Crowbar');
  await act('Strongbox');
  await p.waitForFunction(() => G.overlay);
  await p.evaluate(() => { for (const k of '141146') G.overlay.key(k); });
  await p.waitForFunction(() => flag('strongboxOpen'), null, { timeout: 20000 });
  await idle();
  await act('Portrait Crate', 'item', 'crowbar');
  await shot('van_portrait');
  await act('Vasko\'s Portrait');
  await p.waitForFunction(() => flag('moving'), null, { timeout: 60000 });
  await idle();
  await dump('van');
  await act('Roof Hatch');
  await p.waitForFunction(() => G.mode === 'action', null, { timeout: 20000 });
  await p.waitForTimeout(2500);
  await shot('trainroof');
  // run a little, then stand still so a gantry passes over the crouching Jack
  await p.waitForFunction(() => TrainRoof.gantries.some(g => g.x - TrainRoof.j.x < 400), null, { timeout: 25000 });
  await shot('trainroof2');
  await p.waitForTimeout(1200);
  console.log('roof', await p.evaluate(() => JSON.stringify({ x: TrainRoof.j.x, dead: TrainRoof.dead, g: TrainRoof.gantries.length, cp: TrainRoof.checkpoint })));
  await p.evaluate(() => { TrainRoof.j.x = TR_END - 150; TrainRoof.gantries = []; TrainRoof.nextGantry = 99; });
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(800); await p.keyboard.up('ArrowRight');
  await scene('sleeper');
  await shot('sleeper');
  await act('Lower Berth', 'item', 'blueprints');
  await p.waitForFunction(() => actor('ilse'), null, { timeout: 60000 });
  await p.waitForTimeout(600);
  await shot('cliffhanger');
  await p.waitForFunction(() => G.mode === 'title', null, { timeout: 90000 });
  await dump('ending');
  console.log('flags', await p.evaluate(() => JSON.stringify(G.flags)));
  console.log('ERRORS', errors.length);
  await b.close();
})();
