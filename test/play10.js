// Full playthrough of Chapter Ten, logging every line and screenshotting each scene.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  p.on('console', m => { if (m.type() === 'error' && !/CERT|fonts/.test(m.text())) { errors.push(m.text()); console.log('console:', m.text()); } });
  p.on('pageerror', e => { errors.push(e.message); console.log('PAGEERROR:', e.message); });
  await p.goto('file://' + path.resolve('dist/chapter10.html')); 
  await p.waitForTimeout(4500);
  await p.screenshot({ path: 'test/c10_title.png' });
  await p.mouse.click(1500, 200);
  await p.waitForTimeout(300);
  const shot = async n => { await p.waitForTimeout(400); await p.screenshot({ path: `test/c10_${n}.png` }); };
  await p.evaluate(() => {
    window.LOG = []; window.ALL = [];
    setInterval(() => {
      const s = G.speech[0];
      if (s && s.t > 0.05) { LOG.push(s.id + ': ' + s.text); ALL.push(s.id + '|' + s.text); endSpeech(s); }
      if (G.mode === 'text') TextScreen.skip();
    }, 30);
  });
  const state = () => p.evaluate(() => JSON.stringify({ busy: G.busy, sp: G.speech.length, ch: !!G.choices, ov: !!G.overlay, fade: G.fade, walking: G.jack && G.jack.walking, x: G.jack && G.jack.x, y: G.jack && G.jack.y, scene: G.sceneId, mode: G.mode, obj: G.objective }));
  const idle = async () => { try { await p.waitForFunction(() => G.mode === 'play' && !G.busy && !G.speech.length && !G.choices && G.fade < 0.05 && (!G.jack || !G.jack.walking), null, { timeout: 45000 }); } catch (e) { console.log('STATE', await state()); console.log(errors); await p.screenshot({ path: 'test/c10_stuck.png' }); throw e; } };
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
    catch (e) { console.log('STATE', await state()); await p.screenshot({ path: 'test/c10_stuck.png' }); throw e; }
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
  await scene('chippy');
  await shot('chippy');
  await dump('chippy intro');
  await act('Stan');
  await act('PC Dobbs');
  await act('Police Helmet');
  await act('The Television', 'look');
  await act('The Television');
  await act('Police Helmet');
  await act('Order Spike', 'look');
  await act('Hot Cabinet', 'look');
  await act('The Goose', 'item', 'helmet');
  await shot('chippy_after');
  await act('Stan');
  await choose('old');
  await idle();
  await act('Order Spike');
  await act('Private Door');
  await act('Stan');
  await choose('new');
  await idle();
  await dump('chippy');
  await act('Private Door');
  await scene('yard');
  await shot('yard');
  await act('Goods Lift');
  await act('Sergeant Grimes');
  await act('The Goose');
  await act("Stan\'s Van");
  await act('Sergeant Grimes', 'item', 'note');
  await choose('kevin');
  await choose('which');
  await idle();
  await dump('yard');
  await act('Goods Lift');
  await scene('outer');
  await shot('outer');
  await act("Control\'s Door");
  await act('Miss Penrose');
  await choose('leave');
  await idle();
  await act('Air Vent', 'look');
  await act('Air Vent', 'item', 'crate');
  await act('Miss Penrose');
  await dump('outer');
  await act("Control\'s Door");
  await scene('office');
  await shot('office');
  await act('The Teapot', 'look');
  await act('Desk Drawer', 'item', 'key');
  await act('Wastepaper Basket');
  await p.evaluate(() => { run(() => lookItemStory('pad')); });
  await p.waitForTimeout(300); await shot('sigpad'); await idle();
  await act('Coat Stand');
  await p.waitForFunction(() => G.mode === 'action', null, { timeout: 90000 });
  await p.evaluate(() => { TubeRun.autopilot = true; });
  await dump('office');
  await p.waitForTimeout(3000);
  await shot('tube');
  await p.waitForFunction(() => TubeRun.pos > TubeRun.half + 300, null, { timeout: 120000 });
  await shot('tube_train');
  await p.waitForFunction(() => G.sceneId === 'tearoom', null, { timeout: 240000 });
  console.log('tube stumbles', await p.evaluate(() => TubeRun.stumbles), 'caught', await p.evaluate(() => TubeRun.caught), 'time', await p.evaluate(() => TubeRun.t.toFixed(1)));
  await scene('tearoom');
  await shot('tearoom');
  await act('Velvet Rope');
  await act('Mr Fothergill', 'item', 'tie');
  await act('Madame Novak');
  await act('The Minister');
  await act('Control');
  await act('The Minister', 'item', 'book');
  await act('The Minister', 'item', 'pad');
  await act('Madame Novak');
  await act('Mr Fothergill');
  await choose('bill');
  await idle();
  await shot('tearoom_bill');
  await act('Control', 'item', 'bill');
  await p.waitForFunction(() => G.flags.gooseIn, null, { timeout: 120000 });
  await p.waitForTimeout(1500); await shot('goose');
  await p.waitForFunction(() => G.mode === 'title', null, { timeout: 120000 });
  await dump('tearoom + ending');
  console.log('UNVOICED', await p.evaluate(() => JSON.stringify(ALL.filter(k => !VOICE_LINES[k]).length)));
  console.log('flags', await p.evaluate(() => JSON.stringify(G.flags)));
  console.log('ERRORS', errors.length);
  await b.close();
})();
