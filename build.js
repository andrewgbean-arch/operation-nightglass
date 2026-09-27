// Bundles src/ into one single-file page per chapter:
//   dist/chapter<N>.html            standalone page (double-click to play)
//   dist/chapter<N>.artifact.html   body-only variant for hosting inside a document skeleton
//   node build.js          builds every chapter
//   node build.js 2        builds chapter two only
const fs = require('fs');
const path = require('path');

// Shared engine files wrap around each chapter's own story, art, voices and photos.
const CHAPTERS = {
  1: { loading: 'Painting Vienna…' },
  2: { loading: 'Painting Karvograd…' },
  // Chapter Three is set on the same train, so it borrows chapter two's art and sounds.
  3: { loading: 'Boarding the Iron Arrow…', borrow: ['ch2/sound.js', 'ch2/paint.js'] },
  4: { loading: 'Climbing to Zlatá Hora…', borrow: ['ch2/sound.js', 'ch3/sound.js', 'ch2/paint.js'] },
};
function scripts(n) {
  const c = `ch${n}/`;
  const own = f => fs.existsSync(path.join(__dirname, 'src/js', c, f)) ? [c + f] : [];
  const borrowed = f => (CHAPTERS[n].borrow || []).filter(b => b.endsWith('/' + f));
  return [
    'util.js', 'audio.js', 'soundscape.js', ...borrowed('sound.js'), ...own('sound.js'),
    c + 'voicelines.js', 'voice.js', c + 'photos.js', 'figures.js', 'portraits.js', 'engine.js', 'paint.js', ...borrowed('paint.js'),
    ...fs.readdirSync(path.join(__dirname, 'src/js', c)).filter(f => /^(paint|story|action|chapter)[\w-]*\.js$/.test(f))
      .sort((a, b) => order(a) - order(b)).map(f => c + f),
    'main.js',
  ];
}
function order(f) { return ['paint', 'story', 'action', 'chapter'].findIndex(p => f.startsWith(p)); }

const template = fs.readFileSync(path.join(__dirname, 'src/index.html'), 'utf8');
const which = process.argv[2] ? [process.argv[2]] : Object.keys(CHAPTERS);
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
for (const n of which) {
  const code = scripts(n).map(f => `// ---- ${f}\n` + fs.readFileSync(path.join(__dirname, 'src/js', f), 'utf8')).join('\n');
  const inlined = template
    .replace('{{LOADING}}', CHAPTERS[n].loading)
    .replace('<!--SCRIPTS-->', () => `<script>\n${code.replace(/<\/script/gi, '<\\/script')}\n</script>`);
  fs.writeFileSync(path.join(__dirname, `dist/chapter${n}.artifact.html`), inlined);
  const standalone = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n${inlined.replace('<canvas', '</head>\n<body>\n<canvas')}\n</body>\n</html>\n`;
  fs.writeFileSync(path.join(__dirname, `dist/chapter${n}.html`), standalone);
  console.log(`chapter ${n}:`, (standalone.length / 1024).toFixed(0) + ' KB');
}
