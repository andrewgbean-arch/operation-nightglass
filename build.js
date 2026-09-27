// Bundles src/ into single-file builds:
//   dist/index.html              standalone page (double-click to play)
//   dist/artifact.html           body-only variant for hosting inside a document skeleton
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'src/index.html'), 'utf8');
const inlined = src.replace(/<!--SCRIPTS-->[\s\S]*<!--\/SCRIPTS-->/, block => {
  const files = [...block.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
  const code = files.map(f => `// ---- ${f}\n` + fs.readFileSync(path.join(__dirname, 'src', f), 'utf8')).join('\n');
  return `<script>\n${code.replace(/<\/script/gi, '<\\/script')}\n</script>`;
});
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist/artifact.html'), inlined);
const standalone = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n${inlined.replace('<canvas', '</head>\n<body>\n<canvas')}\n</body>\n</html>\n`;
fs.writeFileSync(path.join(__dirname, 'dist/index.html'), standalone);
console.log('built', (standalone.length / 1024).toFixed(0) + ' KB');
