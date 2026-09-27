const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.addInitScript(() => { window.__msgs = []; window.ReactNativeWebView = { postMessage: m => window.__msgs.push(m) }; });
  await p.goto('file://' + path.resolve('dist/index.html'));
  await p.waitForTimeout(3500);
  console.log('title items', await p.evaluate(() => Title.items().map(i => i.text).join(' | ')));
  await p.evaluate(() => Title.items().find(i => i.text === 'Exit to FlipPilot').act());
  console.log('messages', await p.evaluate(() => window.__msgs));
  await b.close();
})();
