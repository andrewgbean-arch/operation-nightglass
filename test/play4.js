// Full playthrough of Chapter Four, logging every line and screenshotting each scene.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  p.on('console', m => { if (m.type() === 'error' && !/CERT|fonts/.test(m.text())) { errors.push(m.text()); console.log('console:', m.text()); } });
  p.on('pageerror', e => { errors.push(e.message); console.log('PAGEERROR:', e.message); });
  await p.goto('file://' + path.resolve('dist/chapter4.html'));
  await p.waitForTimeout(4500);
  await p.screenshot({ path: 'test/c4_title.png' });
  await p.mouse.click(1500, 200);
  await p.waitForTimeout(300);
  const shot = async n => { await p.waitForTimeout(400); await p.screenshot({ path: `test/c4_${n}.png` }); };
  await p.evaluate(() => {
    window.LOG = []; window.ALL = [];
    setInterval(() => {
      const s = G.speech[0];
      if (s && s.t > 0.05) { LOG.push(s.id + ': ' + s.text); ALL.push(s.id + '|' + s.text); endSpeech(s); }
      if (G.mode === 'text') TextScreen.skip();
    }, 30);
  });
  const state = () => p.evaluate(() => JSON.stringify({ busy: G.busy, sp: G.speech.length, ch: !!G.choices, ov: !!G.overlay, fade: G.fade, walking: G.jack && G.jack.walking, x: G.jack && G.jack.x, y: G.jack && G.jack.y, scene: G.sceneId, mode: G.mode, obj: G.objective }));
  const idle = async () => { try { await p.waitForFunction(() => G.mode === 'play' && !G.busy && !G.speech.length && !G.choices && G.fade < 0.05 && (!G.jack || !G.jack.walking), null, { timeout: 45000 }); } catch (e) { console.log('STATE', await state()); console.log(errors); await p.screenshot({ path: 'test/c4_stuck.png' }); throw e; } };
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
    catch (e) { console.log('STATE', await state()); await p.screenshot({ path: 'test/c4_stuck.png' }); throw e; }
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
  await scene('inn');
  await shot('inn');
  await dump('inn intro');
  await act('Mirek', 'take');
  await act('Marta'); await choose('obs'); await choose('up'); await choose('mirek'); await choose('water'); await choose('bye');
  await act('Mirek');
  await act('Mirek', 'item', 'water');
  await shot('inn_after');
  await act('Door to the Square');
  await scene('square');
  await shot('square');
  await act('Telephone Box');
  await act('Bread Van');
  await act('Vlasta'); await choose('where'); await choose('biz'); await choose('offer');
  await act('Flour Sacks');
  await shot('square_baker');
  await dump('inn + square');
  await act('Bread Van');
  await scene('hangar');
  await shot('hangar');
  await act('The Aircraft');
  await act('Lighting Panel');
  await act('Dr Hana Veselá');
  await act('Sergeant Hrubý', 'item', 'basket');
  await act('Dr Hana Veselá');
  await shot('hangar_unveiled');
  await act('The Aircraft', 'item', 'minox');
  await act('Lighting Panel');
  await act('The Aircraft', 'item', 'minox');
  await shot('hangar_lit');
  await act('Office Stairs', 'item', 'pass');
  await scene('office');
  await shot('office');
  await dump('hangar');
  await act('Calendar', 'look');
  await act('Safe');
  await p.waitForFunction(() => G.overlay);
  await p.evaluate(() => { for (const k of '031287') G.overlay.key(k); });
  await p.waitForFunction(() => flag('safeOpen'), null, { timeout: 20000 });
  await idle();
  await shot('office_alarm');
  await act('Door to the Hangar');
  await p.waitForFunction(() => G.mode === 'action', null, { timeout: 60000 });
  await dump('office + escape');
  await p.waitForTimeout(2500);
  await shot('tunnel');
  // an autopilot: steer into whichever lane is clear for the next stretch
  await p.evaluate(() => {
    window.AUTO = setInterval(() => {
      const T = TunnelRun; if (T.dead || T.done) return;
      const soon = T.obs.filter(o => { const z = o.s - T.dist; return z > TN_TUG_Z - 0.6 && z < 22; });
      const free = l => !soon.some(o => o.lanes.includes(l));
      if (free(T.lane)) return;
      const best = [T.lane - 1, T.lane + 1, T.lane - 2, T.lane + 2].find(l => l >= 0 && l <= 2 && free(l));
      if (best !== undefined) T.steer(Math.sign(best - T.lane));
    }, 40);
  });
  await p.waitForFunction(() => TunnelRun.dist > 300, null, { timeout: 60000 });
  await shot('tunnel2');
  await p.waitForFunction(() => TunnelRun.dist > TN_END - 140, null, { timeout: 90000 });
  await shot('tunnel_goose');
  await p.waitForFunction(() => G.sceneId === 'runway', null, { timeout: 90000 });
  await p.evaluate(() => clearInterval(AUTO));
  await p.waitForTimeout(900);
  await shot('runway');
  await p.waitForFunction(() => G.mode === 'text', null, { timeout: 120000 });
  await p.waitForFunction(() => G.mode === 'title', null, { timeout: 120000 });
  await dump('ending');
  console.log('tunnel fails', await p.evaluate(() => TunnelRun.fails || 0));
  console.log('UNVOICED', await p.evaluate(() => JSON.stringify(ALL.filter(k => !VOICE_LINES[k]).length)));
  console.log('flags', await p.evaluate(() => JSON.stringify(G.flags)));
  console.log('ERRORS', errors.length);
  await b.close();
})();
