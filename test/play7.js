// Full playthrough of Chapter Five, logging every line and screenshotting each scene.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  p.on('console', m => { if (m.type() === 'error' && !/CERT|fonts/.test(m.text())) { errors.push(m.text()); console.log('console:', m.text()); } });
  p.on('pageerror', e => { errors.push(e.message); console.log('PAGEERROR:', e.message); });
  await p.goto('file://' + path.resolve('dist/chapter7.html')); 
  await p.waitForTimeout(4500);
  await p.screenshot({ path: 'test/c7_title.png' });
  await p.mouse.click(1500, 200);
  await p.waitForTimeout(300);
  const shot = async n => { await p.waitForTimeout(400); await p.screenshot({ path: `test/c7_${n}.png` }); };
  await p.evaluate(() => {
    window.LOG = []; window.ALL = [];
    setInterval(() => {
      const s = G.speech[0];
      if (s && s.t > 0.05) { LOG.push(s.id + ': ' + s.text); ALL.push(s.id + '|' + s.text); endSpeech(s); }
      if (G.mode === 'text') TextScreen.skip();
    }, 30);
  });
  const state = () => p.evaluate(() => JSON.stringify({ busy: G.busy, sp: G.speech.length, ch: !!G.choices, ov: !!G.overlay, fade: G.fade, walking: G.jack && G.jack.walking, x: G.jack && G.jack.x, y: G.jack && G.jack.y, scene: G.sceneId, mode: G.mode, obj: G.objective }));
  const idle = async () => { try { await p.waitForFunction(() => G.mode === 'play' && !G.busy && !G.speech.length && !G.choices && G.fade < 0.05 && (!G.jack || !G.jack.walking), null, { timeout: 45000 }); } catch (e) { console.log('STATE', await state()); console.log(errors); await p.screenshot({ path: 'test/c7_stuck.png' }); throw e; } };
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
    catch (e) { console.log('STATE', await state()); await p.screenshot({ path: 'test/c7_stuck.png' }); throw e; }
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
  await scene('hof');
  await shot('hof');
  await dump('hof intro');
  await act('Ilse');
  await act('The Trabant');
  await act('Uwe');
  await act('Ilse');
  await act('The Cellar');
  await scene('club');
  await shot('club');
  await act('Kalle');
  await act('Nina');
  await choose('queen');
  await idle();
  await shot('club_sang');
  await act('Kalle');
  await dump('club');
  await act('Steps Up');
  await scene('hof');
  await act('Uwe', 'item', 'fishnets');
  await shot('hof_fixed');
  await act('The Trabant');
  await p.waitForFunction(() => G.sceneId === 'archive' && G.choices, null, { timeout: 90000 });
  await choose('goats');
  await idle();
  await shot('archive');
  await act('Card Index');
  await act('Key Board');
  await act('Frau Kessler', 'item', 'coffee');
  await act('Cabinet 7');
  await act('Card Index');
  await choose('h');
  await choose('g');
  await choose('t');
  await idle();
  await act('Key Board');
  await dump('archive');
  await act('Cabinet 7', 'item', 'key7');
  await p.waitForFunction(() => G.mode === 'action', null, { timeout: 90000 });
  await dump('alarm');
  await p.waitForTimeout(3000);
  await shot('tunnel');
  await p.evaluate(() => { TunnelCrawl.autopilot = true; });
  await p.waitForFunction(() => TunnelCrawl.dog.state === 'listen', null, { timeout: 60000 });
  await p.screenshot({ path: 'test/c7_tunnel_listen.png' });
  await p.waitForFunction(() => G.sceneId === 'west', null, { timeout: 240000 });
  console.log('tunnel fails', await p.evaluate(() => TunnelCrawl.fails || 0), 'time', await p.evaluate(() => TunnelCrawl.t.toFixed(1)));
  await scene('west');
  await shot('west');
  await act('Ilse');
  await act('Franz');
  await act('Franz', 'item', 'file');
  await p.waitForFunction(() => G.speech.length === 0 && G.fade > 0.9, null, { timeout: 120000 });
  await p.waitForFunction(() => G.mode === 'title', null, { timeout: 120000 });
  await dump('west + ending');
  console.log('UNVOICED', await p.evaluate(() => JSON.stringify(ALL.filter(k => !VOICE_LINES[k]).length)));
  console.log('flags', await p.evaluate(() => JSON.stringify(G.flags)));
  console.log('ERRORS', errors.length);
  await b.close();
})();
