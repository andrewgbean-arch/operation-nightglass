const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('dist/index.html'));
  await p.waitForTimeout(4000);
  await p.mouse.click(1500, 200);
  console.log('lines embedded:', await p.evaluate(() => Object.keys(VOICE_LINES).length));
  // Narrated intro: first page should be voiced
  await p.evaluate(() => { newGame(); });
  await p.waitForTimeout(1500);
  console.log('narrating:', await p.evaluate(() => !!Voice.src));
  await p.evaluate(() => { for (let i = 0; i < 4; i++) { TextScreen.chars = 9999; TextScreen.skip(); } });
  await p.waitForFunction(() => G.sceneId === 'hotel' && G.speech.length, null, { timeout: 20000 });
  // Let the first two voiced lines play out naturally and time them.
  const res = await p.evaluate(() => new Promise(done => {
    const log = []; let last = null, t0 = performance.now();
    const iv = setInterval(() => {
      const s = G.speech[0];
      const k = s ? s.text : null;
      if (k !== last) { log.push({ text: last, ms: Math.round(performance.now() - t0), voiced: last && G._lastVoiced }); last = k; t0 = performance.now(); G._lastVoiced = s && s.voiced; }
      if (log.length > 3) { clearInterval(iv); done(log.slice(1)); }
    }, 20);
  }));
  console.log(JSON.stringify(res, null, 1));
  await b.close();
})();
