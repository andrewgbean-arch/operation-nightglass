// Bundles the remastered chapter into one self-contained HTML page (assets inlined),
// so it can be downloaded into the app and played offline like the original chapters.
//   node build.mjs            -> dist/remaster1.html
//   node build.mjs split      -> dist/split/index.html + assets/ (a page with its files beside it)
//   node build.mjs split page -> the same, but index.html is a page fragment for a host that adds its own <head>
import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const root = path.dirname(new URL(import.meta.url).pathname);
const gen = path.join(root, 'src/gen');
fs.mkdirSync(gen, { recursive: true });

// The original chapter's recorded voices (Kokoro, Apache-2.0) are reused as they are.
const voiceSrc = fs.readFileSync(path.join(root, '../src/js/ch1/voicelines.js'), 'utf8');
fs.writeFileSync(path.join(gen, 'voices1.js'), voiceSrc + '\nexport default VOICE_LINES;\n');

const split = process.argv.includes('split');
const outDir = path.join(root, split ? 'dist/split' : 'dist');
if (split) fs.rmSync(outDir, { recursive: true, force: true });
const result = await esbuild.build({
  entryPoints: [path.join(root, 'src/main.js')],
  bundle: true, minify: true, format: 'iife', write: false, target: 'es2020',
  loader: split ? { '.glb': 'file', '.jpg': 'file', '.png': 'file', '.mp3': 'file' }
                : { '.glb': 'binary', '.jpg': 'dataurl', '.png': 'dataurl', '.mp3': 'dataurl' },
  outdir: outDir, assetNames: 'assets/[name]-[hash]', publicPath: split ? './' : undefined,
  legalComments: 'none',
});
let js = '';
const asText = process.argv.includes('page');   // hosts that won't serve .glb get the models as base64 text
for (const f of result.outputFiles) {
  if (f.path.endsWith('.js')) { js = f.text; continue; }
  fs.mkdirSync(path.dirname(f.path), { recursive: true });
  if (asText && f.path.endsWith('.glb')) fs.writeFileSync(f.path + '.b64.txt', Buffer.from(f.contents).toString('base64'));
  else fs.writeFileSync(f.path, f.contents);
}
if (asText) js = js.replace(/(assets\/[\w.-]+?\.glb)(?=["'`])/g, '$1.b64.txt');
const css = fs.readFileSync(path.join(root, 'src/style.css'), 'utf8');
const body = fs.readFileSync(path.join(root, 'src/body.html'), 'utf8');
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Operation Nightglass: Chapter One (Remastered)</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,600;0,800;1,600&family=Barlow+Condensed:wght@400;500;600;700&family=Special+Elite&display=swap">
<style>${css}</style></head>
<body>${body}<script>${js.replace(/<\/script/gi, '<\\/script')}</script></body></html>
`;
const fragment = `<title>Nightglass Remastered</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,600;0,800;1,600&family=Barlow+Condensed:wght@400;500;600;700&family=Special+Elite&display=swap">
<style>${css}</style>
${body}<script>${js.replace(/<\/script/gi, '<\\/script')}</script>
`;
fs.mkdirSync(outDir, { recursive: true });
if (process.argv.includes('page')) { fs.writeFileSync(path.join(outDir, 'index.html'), fragment); console.log('index.html (fragment)', (fragment.length / 1048576).toFixed(1) + ' MB'); process.exit(0); }
const page = split ? 'index.html' : 'remaster1.html';
fs.writeFileSync(path.join(outDir, page), html);
console.log(page, (html.length / 1048576).toFixed(1) + ' MB');
