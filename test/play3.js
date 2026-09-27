// Full playthrough of Chapter Three, logging every line and screenshotting each scene.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  p.on('console', m => { if (m.type() === 'error' && !/CERT|fonts/.test(m.text())) { errors.push(m.text()); console.log('console:', m.text()); } });
  p.on('pageerror', e => { errors.push(e.message); console.log('PAGEERROR:', e.message); });
  await p.goto('file://' + path.resolve('dist/chapter3.html'));
  await p.waitForTimeout(4500);
  await p.screenshot({ path: 'test/c3_title.png' });
  await p.mouse.click(1500, 200);
  await p.waitForTimeout(300);
  const shot = async n => { await p.waitForTimeout(400); await p.screenshot({ path: `test/c3_${n}.png` }); };
  await p.evaluate(() => {
    window.LOG = []; window.ALL = [];
    setInterval(() => {
      const s = G.speech[0];
      if (s && s.t > 0.05) { LOG.push(s.id + ': ' + s.text); ALL.push(s.id + '|' + s.text); endSpeech(s); }
      if (G.mode === 'text') TextScreen.skip();
    }, 30);
  });
  const state = () => p.evaluate(() => JSON.stringify({ busy: G.busy, sp: G.speech.length, ch: !!G.choices, ov: !!G.overlay, fade: G.fade, walking: G.jack && G.jack.walking, x: G.jack && G.jack.x, y: G.jack && G.jack.y, scene: G.sceneId, mode: G.mode, obj: G.objective }));
  const idle = async () => { try { await p.waitForFunction(() => G.mode === 'play' && !G.busy && !G.speech.length && !G.choices && G.fade < 0.05 && (!G.jack || !G.jack.walking), null, { timeout: 45000 }); } catch (e) { console.log('STATE', await state()); console.log(errors); await p.screenshot({ path: 'test/c3_stuck.png' }); throw e; } };
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
    catch (e) { console.log('STATE', await state()); await p.screenshot({ path: 'test/c3_stuck.png' }); throw e; }
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
  await scene('cell');
  await shot('cell');
  await dump('cell intro');
  await act('Handcuffs');
  await act('Ilse\'s Glove');
  await p.evaluate(() => run(() => lookItemStory('glove')));
  await idle();
  await act('Handcuffs', 'item', 'nailfile');
  await act('Lower Berth');
  await act('Corridor Door');
  await act('Call Button');
  await shot('cell_conductor');
  await dump('cell');
  await act('Corridor Door');
  await scene('corridor');
  await shot('corridor');
  await act('Door to the Dining Car');
  await act('Linen Cupboard');
  await shot('corridor_waiter');
  await act('Door to the Dining Car');
  await scene('dining');
  await shot('dining');
  await act('Ilse');
  await act('Chef'); await choose('champ'); await choose('borscht'); await choose('bye');
  await act('Colonel Vasko', 'item', 'champagne');
  await act('Ilse');
  await act('Chef'); await choose('bread'); await choose('bye');
  await dump('dining');
  await act('Back to the Sleeping Car');
  await scene('corridor');
  await act('Door to the Mail Van');
  await scene('van3');
  await shot('van3');
  await act('Crowbar');
  await act('Geese', 'item', 'bread');
  await act('Gangway Door');
  await scene('corridor');
  await act('Door to the Dining Car');
  await scene('dining');
  await shot('dining_geese');
  await act('To First Class');
  await scene('first');
  await shot('first');
  await act('Aunt Olga');
  await act('Anička');
  await act('Carpet', 'item', 'bread');
  await scene('van3');
  await shot('van3_reunion');
  await dump('first + van');
  await act('Coupling', 'item', 'crowbar');
  await p.waitForFunction(() => G.mode === 'action', null, { timeout: 60000 });
  await dump('uncouple');
  await p.waitForTimeout(3000);
  await shot('runaway');
  // an autopilot on the brake: hold it whenever we are too fast for what is coming
  await p.evaluate(() => {
    window.AUTO = setInterval(() => {
      const T = TrainBrake, b = T.bendAhead();
      const limit = b ? (b.at - T.dist < 140 ? b.limit - 6 : 70) : (TB_END - T.dist < 250 ? 14 : 70);
      KEYS[' '] = T.v > limit && T.heat < 92;
    }, 30);
  });
  await p.waitForFunction(() => TrainBrake.passed >= 2, null, { timeout: 90000 });
  await shot('runaway_bend');
  await p.waitForFunction(() => TrainBrake.inTunnel(), null, { timeout: 60000 });
  await shot('runaway_tunnel');
  console.log('brake', await p.evaluate(() => JSON.stringify({ d: TrainBrake.dist, v: TrainBrake.v, heat: TrainBrake.heat, passed: TrainBrake.passed })));
  await p.waitForFunction(() => TB_END - TrainBrake.dist < 150, null, { timeout: 120000 });
  await shot('runaway_halt');
  await p.waitForFunction(() => G.sceneId === 'halt' && G.mode === 'play' && G.fade < 0.05, null, { timeout: 60000 });
  await p.evaluate(() => clearInterval(AUTO));
  await p.waitForTimeout(1500);
  await dump('runaway');
  await shot('halt');
  await p.waitForFunction(() => flag('carArrived'), null, { timeout: 120000 });
  await p.waitForTimeout(3000);
  await shot('novak');
  await p.waitForFunction(() => G.jetT, null, { timeout: 120000 });
  await p.waitForTimeout(1200);
  await shot('jet');
  await p.waitForFunction(() => G.mode === 'title', null, { timeout: 120000 });
  await dump('ending');
  console.log('fails', await p.evaluate(() => JSON.stringify(TrainBrake.fails || 0)));
  console.log('flags', await p.evaluate(() => JSON.stringify(G.flags)));
  console.log('UNVOICED', await p.evaluate(() => JSON.stringify(ALL.filter(k => !VOICE_LINES[k]))));
  console.log('ERRORS', errors.length);
  await b.close();
})();
