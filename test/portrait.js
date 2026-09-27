const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve('dist/chapter1.html'));
  await p.waitForTimeout(4000);
  await p.mouse.click(1500, 200);
  await p.evaluate(async () => { G.flags = { introDone: true, called: true, tux: true }; startPlay(); G.sceneId = null; await gotoScene('cafe', 1380, 905, 1, { instant: true }); run(() => say(actor('ilse'), 'Vasko keeps the microfilm in a wall safe in his private office, upstairs in the consulate.')); });
  await p.waitForTimeout(1800);
  await p.screenshot({ path: 'test/s_portrait.png' });
  console.log(await p.evaluate(() => JSON.stringify({ lvl: Voice.level(), mouth: Portrait.mouth, voiced: G.speech[0] && G.speech[0].voiced })));
  await p.evaluate(async () => { G.speech = []; G.choices = null; G.busy = false; run(() => think('Six digits, and all about Vasko. His desk might tell me something personal.')); });
  await p.waitForTimeout(900);
  await p.screenshot({ path: 'test/s_thought.png' });
  await b.close();
})();
