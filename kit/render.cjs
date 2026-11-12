// usage: node render.cjs page.html out_dir t1,t2,...   |   node render.cjs page.html out.mp4 --from 0 --to 10 [--fps 30] [--w 720 --h 1280]
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const a = process.argv.slice(2), flag = (n, d) => { const i = a.indexOf('--' + n); return i < 0 ? d : a[i + 1]; };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.json': 'application/json', '.css': 'text/css' };
const root = process.cwd();
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(d); } }); });
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const port = srv.address().port;
  const W = +flag('w', 720), H = +flag('h', 1280);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message)); pg.on('console', m => { if (['error', 'warning'].includes(m.type())) errs.push(m.type() + ' ' + m.text()); });
  await pg.goto(`http://127.0.0.1:${port}/${a[0]}?w=${W}&h=${H}`); await pg.waitForFunction('window.__ready===true', null, { timeout: 60000 });
  await pg.evaluate(() => document.fonts.ready);
  const shot = async (t, png) => { await pg.evaluate(t => window.frame(t), t); return pg.screenshot(png ? { type: 'png' } : { type: 'jpeg', quality: 93 }); };
  if (flag('from') == null) { fs.mkdirSync(a[1], { recursive: true }); for (const t of a[2].split(',').map(Number)) { const t0 = Date.now(); fs.writeFileSync(path.join(a[1], 't_' + t.toFixed(2).padStart(5, '0') + '.png'), await shot(t, true)); console.log('t=' + t, Date.now() - t0, 'ms'); } }
  else {
    const fps = +flag('fps', 30), from = +flag('from'), to = +flag('to'), n = Math.round((to - from) * fps), i0 = Math.round(from * fps);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', a[1]], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((res, rej) => ff.on('close', c => c ? rej(new Error('ffmpeg ' + c)) : res())); const t00 = Date.now();
    for (let f = 0; f < n; f++) { const buf = await shot((i0 + f) / fps, false); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 30 === 0) process.stdout.write(`\r${f}/${n} ${((Date.now() - t00) / (f + 1) / 1000).toFixed(2)}s/f`); }
    ff.stdin.end(); await done; console.log();
  }
  if (errs.length) console.log([...new Set(errs)].slice(0, 8).join('\n')); await b.close(); srv.close();
})();
