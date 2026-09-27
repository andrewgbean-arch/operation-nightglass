// node test/shot-cast.js test/cast4.html out.png
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await p.goto('file://' + path.resolve(process.argv[2])); await p.waitForTimeout(800); await p.screenshot({ path: process.argv[3] }); await b.close(); })();
