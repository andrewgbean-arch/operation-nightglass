// Full playthrough of Chapter Eleven, logging every line and screenshotting each scene.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  p.on('console', m => { if (m.type() === 'error' && !/CERT|fonts/.test(m.text())) { errors.push(m.text()); console.log('console:', m.text()); } });
  p.on('pageerror', e => { errors.push(e.message); console.log('PAGEERROR:', e.message); });
  await p.goto('file://' + path.resolve('dist/chapter11.html')); 
  await p.waitForTimeout(4500);
  await p.screenshot({ path: 'test/c11_title.png' });
  await p.mouse.click(1500, 200);
  await p.waitForTimeout(300);
  const shot = async n => { await p.waitForTimeout(400); await p.screenshot({ path: `test/c11_${n}.png` }); };
  await p.evaluate(() => {
    window.LOG = []; window.ALL = [];
    setInterval(() => {
      const s = G.speech[0];
      if (s && s.t > 0.05) { LOG.push(s.id + ': ' + s.text); ALL.push(s.id + '|' + s.text); endSpeech(s); }
      if (G.mode === 'text') TextScreen.skip();
    }, 30);
  });
  const state = () => p.evaluate(() => JSON.stringify({ busy: G.busy, sp: G.speech.length, ch: !!G.choices, ov: !!G.overlay, fade: G.fade, walking: G.jack && G.jack.walking, x: G.jack && G.jack.x, y: G.jack && G.jack.y, scene: G.sceneId, mode: G.mode, obj: G.objective }));
  const idle = async () => { try { await p.waitForFunction(() => G.mode === 'play' && !G.busy && !G.speech.length && !G.choices && G.fade < 0.05 && (!G.jack || !G.jack.walking), null, { timeout: 45000 }); } catch (e) { console.log('STATE', await state()); console.log(errors); await p.screenshot({ path: 'test/c11_stuck.png' }); throw e; } };
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
    catch (e) { console.log('STATE', await state()); await p.screenshot({ path: 'test/c11_stuck.png' }); throw e; }
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
  await scene('station');
  await shot('station');
  await dump('station intro');
  await act('Nils');
  await act('Dr Ingrid Lund');
  await choose('scare');
  await idle();
  await act('Dr Ingrid Lund');
  await choose('goose');
  await idle();
  await act('The Hut');
  await act('Hut Key');
  await act('The Hut', 'item', 'key');
  await shot('station_bear');
  await act('Dr Ingrid Lund');
  await act('Huskies', 'item', 'battery');
  await act('Dr Ingrid Lund', 'item', 'warmBattery');
  await shot('station_balloon');
  await act('Nils');
  await act('Wool Bales');
  await dump('station');
  await scene('hall');
  await shot('hall');
  await act('Parlour Door');
  await act('Aunt Olga');
  await choose('knit');
  await idle();
  await act('Pattern Reader', 'take');
  await act('Speed Dial');
  await choose('slow');
  await idle();
  await shot('hall_asleep');
  await act('Parlour Door');
  await scene('parlour');
  await shot('parlour');
  await act('Flight Plan', 'look');
  await act('Pattern Box');
  await act('The Radio', 'item', 'forecast');
  await act('The Door');
  await scene('hall');
  await act('Pattern Reader', 'item', 'gooseCard');
  await shot('hall_geese');
  await act('Speed Dial');
  await choose('turbo');
  await p.waitForFunction(() => G.mode === 'action', null, { timeout: 90000 });
  await p.evaluate(() => { SnowRace.autopilot = true; });
  await dump('hall');
  await p.waitForTimeout(4000);
  await shot('race');
  await p.waitForFunction(() => SnowRace.pos > SR.DIST * 0.63, null, { timeout: 120000 });
  await shot('race_bear');
  await p.waitForFunction(() => G.sceneId === 'cargo', null, { timeout: 240000 });
  console.log('race crashes', await p.evaluate(() => SnowRace.crashes), 'fails', await p.evaluate(() => SnowRace.fails), 'time left', await p.evaluate(() => SnowRace.left.toFixed(1)));
  await p.waitForTimeout(3000); await shot('cargo');
  await p.waitForFunction(() => G.mode === 'title', null, { timeout: 180000 });
  await dump('cargo + ending');
  console.log('UNVOICED', await p.evaluate(() => JSON.stringify(ALL.filter(k => !VOICE_LINES[k]).length)));
  console.log('flags', await p.evaluate(() => JSON.stringify(G.flags)));
  console.log('ERRORS', errors.length);
  await b.close();
})();
