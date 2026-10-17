// usage: node render.mjs stills <t1,t2,...> <outdir>
//        node render.mjs film <out.mp4>
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { spawn } from 'child_process';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || '/opt/node22/lib/node_modules/playwright');
const root = path.dirname(new URL(import.meta.url).pathname);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
const server = http.createServer((q, r) => {
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); } });
}).listen(0);
const port = server.address().port;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', e => console.error('pageerror', e));
page.on('console', m => console.log('console', m.text()));
await page.goto(`http://localhost:${port}/index.html`);
await page.evaluate(() => window.ready);
const [mode, a, b] = process.argv.slice(2);
if (mode === 'stills') {
  fs.mkdirSync(b, { recursive: true });
  for (const t of a.split(',').map(Number)) {
    await page.evaluate(t => window.seek(t), t);
    await page.screenshot({ path: path.join(b, `t${t.toFixed(2).padStart(5, '0')}.png`) });
  }
} else if (mode === 'film') {
  const fps = 60, sub = Number(process.env.SUB || 4), dur = 15;
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(fps * sub), '-i', '-',
    '-vf', `tmix=frames=${sub}:weights=1,select='not(mod(n\\,${sub}))',setpts=N/${fps}/TB`, '-r', String(fps),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-preset', 'slow', a], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = dur * fps * sub;
  for (let k = 0; k < n; k++) {
    // sample subframes inside each frame interval
    const t = (Math.floor(k / sub) + (k % sub + 0.5) / sub - 0.5) / fps;
    await page.evaluate(t => window.seek(t), Math.max(0, t));
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (k % 240 === 0) console.log('frame', k / sub);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
await browser.close(); server.close();
