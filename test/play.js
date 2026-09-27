const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  p.on('console', m => { if (m.type() === 'error' && !/CERT/.test(m.text())) { errors.push(m.text()); console.log('console:', m.text()); } });
  p.on('pageerror', e => { errors.push(e.message); console.log('PAGEERROR:', e.message); });
  await p.goto('file://' + path.resolve('dist/index.html'));
  await p.waitForTimeout(4500);
  await p.screenshot({ path: 'test/s_title.png' });
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
  await p.waitForTimeout(500);
  await idle();
  await shot('hotel');
  await dump('hotel intro');
  await act('Telephone');
  await dump('phone');
  await act('Briefcase'); await act('Desk Drawer'); await act('Wardrobe');
  await dump('hotel items');
  await shot('hotel_tux');
  await act('Hallway');
  await p.waitForFunction(() => G.sceneId === 'street'); await idle();
  await shot('street');
  await act('Newspaper Vendor');
  await choose('news'); await choose('buy'); await choose('bye');
  await idle();
  await dump('vendor');
  await p.evaluate(() => { run(() => lookItemStory('newspaper')); });
  await p.waitForTimeout(800);
  await shot('newspaper');
  await p.evaluate(() => G.overlay.click(0, 0));
  await idle();
  await act('Café Adler');
  await p.waitForFunction(() => G.sceneId === 'cafe'); await idle();
  await shot('cafe');
  await act('Franz the Barman'); await choose('party'); await choose('bye');
  await act('Woman in Red'); await choose('code');
  await idle();
  await dump('cafe');
  await shot('cafe_after');
  await act('Street');
  await p.waitForFunction(() => G.sceneId === 'street'); await idle();
  await act('Karvonian Consulate');
  await p.waitForFunction(() => G.sceneId === 'gate'); await idle();
  await shot('gate');
  await act('Guard');
  await p.waitForFunction(() => G.sceneId === 'ballroom', null, { timeout: 30000 }); await idle();
  await dump('gate');
  await shot('ballroom');
  await act('Grand Staircase');
  await act('Waiter'); await choose('yes');
  await act('Baron von Katz'); await choose('party'); await choose('bye');
  await act('Baron von Katz', 'item', 'champagne');
  await dump('ballroom');
  await shot('ballroom_after');
  await act('Grand Staircase');
  await p.waitForFunction(() => G.sceneId === 'office', null, { timeout: 30000 }); await idle();
  await shot('office');
  await act('Desk');
  await act('Wall Safe');
  await p.waitForFunction(() => G.overlay);
  await p.evaluate(() => { for (const k of '141146') G.overlay.key(k); });
  await p.waitForTimeout(600);
  await shot('keypad');
  await p.waitForFunction(() => flag('standoff'), null, { timeout: 20000 });
  await p.waitForTimeout(400);
  await shot('standoff');
  await act('Guard', 'item', 'pen');
  await dump('office');
  await shot('office_after');
  await act('Window');
  await p.waitForFunction(() => G.mode === 'rooftop', null, { timeout: 20000 });
  await p.waitForTimeout(1500);
  await shot('rooftop');
  // cheat through rooftop to check the finish
  await p.evaluate(() => { Rooftop.j.x = Rooftop.zipX - 200; });
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(1200); await p.keyboard.up('ArrowRight');
  await p.waitForTimeout(1200);
  await shot('zip');
  await p.waitForFunction(() => G.mode === 'title', null, { timeout: 40000 });
  await dump('end');
  console.log('flags', await p.evaluate(() => JSON.stringify(G.flags)));
  console.log('ERRORS', errors.length);
  await b.close();
})();
