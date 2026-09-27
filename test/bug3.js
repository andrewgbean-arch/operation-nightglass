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
  await p.mouse.click(1500, 200); // enables audio
  await p.waitForTimeout(300);
  console.log('audio', await p.evaluate(() => Sound.ctx && Sound.ctx.state));
  const shot = async n => { await p.waitForTimeout(300); await p.screenshot({ path: `test/s_${n}.png` }); };
  // auto-skip speech, log lines
  await p.evaluate(() => {
    window.LOG = [];
    setInterval(() => {
      const s = G.speech[0];
      if (s && !s._logged) { s._logged = 1; LOG.push((s.id) + ': ' + s.text); }
      if (G.mode === 'text') TextScreen.skip();
    }, 30);
  });
  const idle = async () => { for (let k = 0; k < 400; k++) { const sp = await p.evaluate(() => G.speech.length && G.speech[0].t > 0.3); if (sp) await p.mouse.click(960, 540); else if (await p.evaluate(() => G.choices || G.overlay || G.mode !== 'play' || (!G.busy && !G.speech.length && G.fade < 0.05 && !G.jack.walking))) break; await p.waitForTimeout(60); } try { await p.waitForFunction(() => !G.busy && !G.speech.length && !G.choices && G.fade < 0.05 && (!G.jack || !G.jack.walking), null, { timeout: 15000 }); } catch (e) { console.log('STATE', await p.evaluate(() => JSON.stringify({busy:G.busy, sp:G.speech.length, ch:!!G.choices, fade:G.fade, fadeTo:G.fadeTo, walking:G.jack.walking, x:G.jack.x, y:G.jack.y, target:G.jack.target, scene:G.sceneId, mode:G.mode}))); console.log(errors); throw e; } };
  const idleLoop = async () => {
    for (let k = 0; k < 600; k++) {
      const st = await p.evaluate(() => ({ sp: G.speech.length && G.speech[0].t > 0.3, done: G.choices || G.overlay || G.mode !== 'play' || (!G.busy && !G.speech.length && G.fade < 0.05 && !G.jack.walking) }));
      if (st.done) return; if (st.sp) await p.mouse.click(960, 540); await p.waitForTimeout(60);
    }
    throw new Error('idle timeout');
  };
  const act = async (name, mode = 'default', item) => {
    await idle();
    const pt = await p.evaluate(([name]) => {
      const h = G.scene.hotspots.find(h => h.name === name);
      if (!h) return null;
      if (h.rect) return [h.rect[0] + h.rect[2] / 2, h.rect[1] + h.rect[3] / 2];
      const a = actor(h.actor), bx = figureBox(a); return [bx.x + bx.w / 2, bx.y + bx.h / 2];
    }, [name]);
    if (!pt) { console.log('NO HOTSPOT', name); return; }
    await p.mouse.move(pt[0], pt[1]); await p.waitForTimeout(120);
    const label = await p.evaluate(() => G.mouse.over && G.mouse.over.name);
    if (label !== name) console.log('HOVER MISMATCH at', name, '->', label, await p.evaluate(() => JSON.stringify({busy: G.busy, sp: G.speech.length})));
    await p.mouse.click(pt[0], pt[1], { button: mode === 'look' ? 'right' : 'left' });
    await p.waitForTimeout(150);
    try { await idleLoop(); }
    catch (e) { console.log('STUCK after', name, await p.evaluate(() => JSON.stringify({busy:G.busy, sp:G.speech.length, fade:G.fade, walking:G.jack.walking, scene:G.sceneId}))); throw e; }
  };
  const choose = async value => {
    for (let k = 0; k < 300 && !(await p.evaluate(() => !!G.choices)); k++) { if (await p.evaluate(() => G.speech.length && G.speech[0].t > 0.3)) await p.mouse.click(960, 540); await p.waitForTimeout(60); }
    const pt = await p.evaluate(v => { const r = Choices.rows().find(r => r.o.value === v); return r && [r.x + 200, r.y + r.h / 2]; }, value);
    await p.mouse.click(pt[0], pt[1]);
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
  // show the invitation from the inventory instead of talking
  await p.mouse.move(960, 1060); await p.waitForTimeout(400);
  const slot = await p.evaluate(() => { const i = G.inv.indexOf('invitation'); const r = invSlotRect(i); return [r[0] + 50, r[1] + 50]; });
  await p.mouse.click(slot[0], slot[1]); await p.waitForTimeout(200);
  console.log('selected', await p.evaluate(() => G.sel));
  await act('Guard', 'default'); await idle();
  console.log('after guard', await p.evaluate(() => JSON.stringify({sel: G.sel, inv: G.inv, busy: G.busy})));
  await act('Square'); await p.waitForFunction(() => G.sceneId === 'street'); await idle();
  await act('Hotel Imperial'); await p.waitForFunction(() => G.sceneId === 'hotel'); await idle();
  await act('Wardrobe'); await idle();
  // reload and continue, like closing the browser and coming back
  await p.reload(); await p.waitForTimeout(4500); await p.mouse.click(1500, 200); await p.waitForTimeout(300);
  const items = await p.evaluate(() => Title.items().map(i => i.text + '@' + (i.y + 30)));
  console.log('title items', items);
  await p.mouse.click(250, +items[0].split('@')[1]);
  await p.waitForFunction(() => G.mode === 'play' && G.sceneId); await p.waitForTimeout(800);
  console.log('continued in', await p.evaluate(() => JSON.stringify({scene: G.sceneId, x: G.jack.x, flags: G.flags})));
  await p.evaluate(() => { window.LOG = window.LOG || []; });
  await act('Hallway'); await p.waitForTimeout(3000);
  console.log('after exit', await p.evaluate(() => JSON.stringify({scene: G.sceneId, x: G.jack.x, y: G.jack.y, busy: G.busy, fade: G.fade})));

  console.log('flags', await p.evaluate(() => JSON.stringify(G.flags)));
  console.log('ERRORS', errors.length);
  await b.close();
})();
