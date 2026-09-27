const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  p.on('console', m => { if (m.type() === 'error' && !/CERT/.test(m.text())) { errors.push(m.text()); console.log('console:', m.text()); } });
  p.on('pageerror', e => { errors.push(e.message); console.log('PAGEERROR:', e.message); });
  await p.goto('file://' + path.resolve('dist/chapter1.html'));
  await p.waitForTimeout(4500);
  await p.screenshot({ path: 'test/s_title.png' });
  await p.mouse.click(1500, 200); // enables audio
  await p.waitForTimeout(300);
  console.log('audio', await p.evaluate(() => Sound.ctx && Sound.ctx.state));
  const shot = async n => { await p.waitForTimeout(300); await p.screenshot({ path: `test/s_${n}.png` }); };
  // auto-skip speech, log lines
  await p.evaluate(() => {
    window.LOG = [];
    setInterval(() => {
      const s = G.speech[0];
      if (s && s.t > 0.05) { LOG.push((s.id) + ': ' + s.text); endSpeech(s); }
      if (G.mode === 'text') TextScreen.skip();
    }, 30);
  });
  const idle = async () => { try { await p.waitForFunction(() => !G.busy && !G.speech.length && !G.choices && G.fade < 0.05 && (!G.jack || !G.jack.walking), null, { timeout: 15000 }); } catch (e) { console.log('STATE', await p.evaluate(() => JSON.stringify({busy:G.busy, sp:G.speech.length, ch:!!G.choices, fade:G.fade, fadeTo:G.fadeTo, walking:G.jack.walking, x:G.jack.x, y:G.jack.y, target:G.jack.target, scene:G.sceneId, mode:G.mode}))); console.log(errors); throw e; } };
  const act = async (name, mode = 'default', item) => {
    await idle();
    const ok = await p.evaluate(([name, mode, item]) => {
      const h = G.scene.hotspots.find(h => (typeof h.name === 'function' ? h.name() : h.name) === name);
      if (!h) return 'NO HOTSPOT ' + name;
      run(() => interact(h, mode, item));
      return 'ok';
    }, [name, mode, item]);
    if (ok !== 'ok') console.log(ok);
    await p.waitForTimeout(100);
    try { await p.waitForFunction(() => G.choices || G.overlay || (!G.busy && !G.speech.length && G.fade < 0.05 && !G.jack.walking) || G.mode !== 'play', null, { timeout: 20000 }); }
    catch (e) { console.log('STATE', await p.evaluate(() => JSON.stringify({busy:G.busy, sp:G.speech.length, ch:!!G.choices, fade:G.fade, walking:G.jack.walking, x:G.jack.x, y:G.jack.y, s:G.jack.scale, target:G.jack.target, scene:G.sceneId, mode:G.mode}))); await p.screenshot({path:'test/s_stuck.png'}); throw e; }
  };
  const choose = async value => {
    await p.waitForFunction(() => G.choices, null, { timeout: 20000 });
    await p.evaluate(v => { const c = G.choices; G.choices = null; c.resolve(v); }, value);
    await p.waitForTimeout(50);
  };
  const dump = async label => { const l = await p.evaluate(() => { const x = LOG.slice(); LOG.length = 0; return x; }); console.log('--- ' + label); l.forEach(x => console.log('  ' + x)); };

  await p.evaluate(() => { newGame(); });
  await p.waitForFunction(() => G.mode === 'play' && G.sceneId === 'hotel');
  await p.waitForTimeout(500); await idle();
  await act('Telephone'); await act('Briefcase'); await act('Desk Drawer');
  await act('Hallway'); await p.waitForFunction(() => G.sceneId === 'street'); await idle();
  await act('Café Adler'); await p.waitForFunction(() => G.sceneId === 'cafe'); await idle();
  await act('Woman in Red'); await choose('code'); await idle();
  await act('Street'); await p.waitForFunction(() => G.sceneId === 'street'); await idle();
  await act('Karvonian Consulate'); await p.waitForFunction(() => G.sceneId === 'gate'); await idle();
  await act('Guard'); await idle();
  await act('Square'); await p.waitForFunction(() => G.sceneId === 'street'); await idle();
  await act('Hotel Imperial'); await p.waitForFunction(() => G.sceneId === 'hotel'); await idle();
  await shot('back_in_hotel');
  await act('Wardrobe'); await idle();
  console.log('before exit', await p.evaluate(() => JSON.stringify({x: G.jack.x, y: G.jack.y, busy: G.busy, flags: G.flags})));
  await act('Hallway');
  await p.waitForTimeout(3000);
  console.log('after exit', await p.evaluate(() => JSON.stringify({scene: G.sceneId, x: G.jack.x, y: G.jack.y, busy: G.busy, walking: G.jack.walking, fade: G.fade})));
  await dump('route');
  console.log('flags', await p.evaluate(() => JSON.stringify(G.flags)));
  console.log('ERRORS', errors.length);
  await b.close();
})();
