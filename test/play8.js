// Full playthrough of Chapter Five, logging every line and screenshotting each scene.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  p.on('console', m => { if (m.type() === 'error' && !/CERT|fonts/.test(m.text())) { errors.push(m.text()); console.log('console:', m.text()); } });
  p.on('pageerror', e => { errors.push(e.message); console.log('PAGEERROR:', e.message); });
  await p.goto('file://' + path.resolve('dist/chapter8.html')); 
  await p.waitForTimeout(4500);
  await p.screenshot({ path: 'test/c8_title.png' });
  await p.mouse.click(1500, 200);
  await p.waitForTimeout(300);
  const shot = async n => { await p.waitForTimeout(400); await p.screenshot({ path: `test/c8_${n}.png` }); };
  await p.evaluate(() => {
    window.LOG = []; window.ALL = [];
    setInterval(() => {
      const s = G.speech[0];
      if (s && s.t > 0.05) { LOG.push(s.id + ': ' + s.text); ALL.push(s.id + '|' + s.text); endSpeech(s); }
      if (G.mode === 'text') TextScreen.skip();
    }, 30);
  });
  const state = () => p.evaluate(() => JSON.stringify({ busy: G.busy, sp: G.speech.length, ch: !!G.choices, ov: !!G.overlay, fade: G.fade, walking: G.jack && G.jack.walking, x: G.jack && G.jack.x, y: G.jack && G.jack.y, scene: G.sceneId, mode: G.mode, obj: G.objective }));
  const idle = async () => { try { await p.waitForFunction(() => G.mode === 'play' && !G.busy && !G.speech.length && !G.choices && G.fade < 0.05 && (!G.jack || !G.jack.walking), null, { timeout: 45000 }); } catch (e) { console.log('STATE', await state()); console.log(errors); await p.screenshot({ path: 'test/c8_stuck.png' }); throw e; } };
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
    catch (e) { console.log('STATE', await state()); await p.screenshot({ path: 'test/c8_stuck.png' }); throw e; }
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
  await scene('yacht');
  await shot('yacht');
  await dump('yacht intro');
  await act('The Gangway');
  await act('Madame Novak');
  await act('Franz');
  await choose('shaken');
  await idle();
  await act('Saloon Door');
  await act('Madame Novak');
  await shot('yacht_tux');
  await dump('yacht');
  await act('The Gangway');
  await scene('casino');
  await shot('casino');
  await act('Your Seat');
  await act('The Cage', 'item', 'pearls');
  await act('Your Seat');
  await act('The Croupier', 'look');
  await act('Mr Hollis');
  await act('Trolley');
  await act('Card Shoe', 'look');
  await act('Mr Hollis');
  await shot('casino_ruckus');
  await act('Trolley');
  await act('Card Shoe', 'item', 'shoe');
  await dump('casino');
  await act('Your Seat');
  await choose('goose');
  await choose('ear');
  await choose('allin');
  await p.waitForFunction(() => G.mode === 'action', null, { timeout: 90000 });
  await dump('the game');
  await p.waitForTimeout(3000);
  await shot('circuit');
  await p.evaluate(() => { CircuitRun.autopilot = true; });
  await p.waitForFunction(() => CircuitRun.d > 600, null, { timeout: 120000 });
  await p.screenshot({ path: 'test/c8_tunnel.png' });
  await p.waitForFunction(() => G.sceneId === 'dawn', null, { timeout: 240000 });
  console.log('circuit fails', await p.evaluate(() => CircuitRun.fails || 0), 'dents', await p.evaluate(() => CircuitRun.dents || 0), 'time', await p.evaluate(() => CircuitRun.t.toFixed(1)));
  await scene('dawn');
  await shot('dawn');
  await act('Franz');
  await act('Madame Novak', 'item', 'cheque');
  await p.waitForFunction(() => G.speech.length === 0 && G.fade > 0.9, null, { timeout: 120000 });
  await p.waitForFunction(() => G.mode === 'title', null, { timeout: 120000 });
  await dump('dawn + ending');
  console.log('UNVOICED', await p.evaluate(() => JSON.stringify(ALL.filter(k => !VOICE_LINES[k]).length)));
  console.log('flags', await p.evaluate(() => JSON.stringify(G.flags)));
  console.log('ERRORS', errors.length);
  await b.close();
})();
