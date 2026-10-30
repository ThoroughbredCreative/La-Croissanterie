// Production build: minifies index.html (HTML, inline CSS and JS) into dist/ and copies assets.
// Usage: npm install && npm run build      (index.html stays the readable source)
import fs from 'node:fs';
import { minify } from 'html-minifier-terser';

const src = fs.readFileSync('index.html', 'utf8');

// Compact the structured data, which the HTML minifier leaves untouched
const withLd = src.replace(/(<script type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/,
  (_, open, json, close) => open + JSON.stringify(JSON.parse(json)) + close);

const html = await minify(withLd, {
  collapseWhitespace: true,
  conservativeCollapse: false,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  useShortDoctype: true,
  sortAttributes: true,
  minifyCSS: { level: 1 },
  minifyJS: { compress: { passes: 2 }, mangle: true },
});

fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist/fonts', { recursive: true });
fs.writeFileSync('dist/index.html', html);
for (const f of fs.readdirSync('fonts')) fs.copyFileSync(`fonts/${f}`, `dist/fonts/${f}`);
for (const f of ['grain.png', 'apple-touch-icon.png']) fs.copyFileSync(f, `dist/${f}`);
if (fs.existsSync('img')) fs.cpSync('img', 'dist/img', { recursive: true });

console.log(`index.html ${src.length} -> ${html.length} bytes`);

// Remind the owner about anything still waiting for real data
const todo = [];
if (src.includes('lacroissanterie.example')) todo.push('live domain (canonical, Open Graph, structured data)');
if (/data-price=""/.test(src)) todo.push('menu prices (data-price)');
if (/data-close=""/.test(src)) todo.push('closing times (data-close)');
if (/footer-social" hidden><a href=""/.test(src)) todo.push('Facebook URL');
if (!fs.existsSync('img')) todo.push('photography (photo band is disabled)');
todo.push('share image og-image.jpg (upload to the live site)');
const ld = withLd.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1];
if (!ld.includes('"geo"')) todo.push('map coordinates ("geo" in structured data)');
console.warn('\nOWNER items still open:\n  - ' + todo.join('\n  - '));
