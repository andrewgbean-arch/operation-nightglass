// Full playthrough of Chapter Five, logging every line and screenshotting each scene.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  p.on('console', m => { if (m.type() === 'error' && !/CERT|fonts/.test(m.text())) { errors.push(m.text()); console.log('console:', m.text()); } });
  p.on('pageerror', e => { errors.push(e.message); console.log('PAGEERROR:', e.message); });
  await p.goto('file://' + path.resolve('dist/chapter6.html')); 
  await p.waitForTimeout(4500);
  await p.screenshot({ path: 'test/c6_title.png' });
  await p.mouse.click(1500, 200);
  await p.waitForTimeout(300);
  const shot = async n => { await p.waitForTimeout(400); await p.screenshot({ path: `test/c6_${n}.png` }); };
  await p.evaluate(() => {
    window.LOG = []; window.ALL = [];
    setInterval(() => {
      const s = G.speech[0];
      if (s && s.t > 0.05) { LOG.push(s.id + ': ' + s.text); ALL.push(s.id + '|' + s.text); endSpeech(s); }
      if (G.mode === 'text') TextScreen.skip();
    }, 30);
  });
  const state = () => p.evaluate(() => JSON.stringify({ busy: G.busy, sp: G.speech.length, ch: !!G.choices, ov: !!G.overlay, fade: G.fade, walking: G.jack && G.jack.walking, x: G.jack && G.jack.x, y: G.jack && G.jack.y, scene: G.sceneId, mode: G.mode, obj: G.objective }));
  const idle = async () => { try { await p.waitForFunction(() => G.mode === 'play' && !G.busy && !G.speech.length && !G.choices && G.fade < 0.05 && (!G.jack || !G.jack.walking), null, { timeout: 45000 }); } catch (e) { console.log('STATE', await state()); console.log(errors); await p.screenshot({ path: 'test/c6_stuck.png' }); throw e; } };
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
    catch (e) { console.log('STATE', await state()); await p.screenshot({ path: 'test/c6_stuck.png' }); throw e; }
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
  await scene('riva');
  await shot('riva');
  await dump('riva intro');
  await act('Toni');
  await act('Gondola');
  await act('Madame Novak');
  await act('Pigeon Corn');
  await act('Toni', 'item', 'corn');
  await act('Gondola');
  await act('Madame Novak');
  await shot('riva_awake');
  await act('Gondola');
  await scene('murano');
  await shot('murano');
  await dump('riva');
  await act('Door to the Quay');
  await act('Maestro Bepi');
  await act('Glass Swans');
  await act('Nail of Bills');
  await p.evaluate(() => { run(() => interact(G.scene.hotspots.find(h => h.name === 'Maestro Bepi'), 'item', 'invoice')); });
  await choose('goose');
  await choose('sneeze');
  await idle();
  await act('Door to the Quay');
  await act('Toni');
  await shot('murano_gondolier');
  await dump('murano');
  await act('Door to the Quay');
  await scene('palazzo').catch(() => {});
  await p.waitForFunction(() => G.choices, null, { timeout: 60000 });
  await choose('queen');
  await idle();
  await shot('palazzo');
  await act('Madame Novak');
  await act('The Swan');
  await act('Madame Novak');
  await shot('palazzo_dance');
  await act('Water Gate');
  await act('Mr Hollis');
  await act('Herr Brunner');
  await act('Contessa Lucrezia');
  await act('The Swan', 'item', 'fakeSwan');
  await act('The Plague Doctor');
  await act('Waiter');
  await act('The Plague Doctor', 'look');
  await dump('palazzo');
  await act('Water Gate');
  await p.waitForFunction(() => G.mode === 'action', null, { timeout: 60000 });
  await dump('midnight');
  await p.waitForTimeout(3000);
  await shot('gondola');
  await p.evaluate(() => { GondolaRun.auto = true; });
  await p.waitForFunction(() => GondolaRun.dist > 88 && GondolaRun.dist < 91, null, { timeout: 60000 });
  await p.screenshot({ path: 'test/c6_bridge.png' });
  await p.waitForFunction(() => G.sceneId === 'rialto', null, { timeout: 180000 });
  console.log('gondola fails', await p.evaluate(() => GondolaRun.fails || 0), 'time', await p.evaluate(() => GondolaRun.t.toFixed(1)));
  await scene('rialto');
  await shot('rialto');
  await act('Madame Novak');
  await act('Madame Novak', 'item', 'realSwan');
  await p.waitForFunction(() => G.speech.length === 0 && G.fade > 0.9, null, { timeout: 120000 });
  await p.waitForFunction(() => G.mode === 'title', null, { timeout: 120000 });
  await dump('rialto + ending');
  console.log('UNVOICED', await p.evaluate(() => JSON.stringify(ALL.filter(k => !VOICE_LINES[k]).length)));
  console.log('flags', await p.evaluate(() => JSON.stringify(G.flags)));
  console.log('ERRORS', errors.length);
  await b.close();
})();
