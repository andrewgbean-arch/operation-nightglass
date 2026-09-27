// node test/shot-file.js <html> <png>
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message)); p.on('console', m => m.type() === 'error' && console.log(m.text()));
  await p.goto('file://' + path.resolve(process.argv[2])); await p.waitForTimeout(800); await p.screenshot({ path: process.argv[3] }); await b.close(); })();
