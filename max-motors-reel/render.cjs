// Renders reel/reel.html frame by frame and encodes a 1080x1920 MP4.
// Usage:  node render.cjs                 -> out/max-motors-cinematic.mp4  (PAGE=reel for the laptop version)
//         node render.cjs --preview 0,3,7 -> stills at those seconds in out/preview/
// Needs: playwright (chromium) + ffmpeg. Serves this folder on a local port itself.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const { execFileSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'out');
const FPS = 30; let SECONDS = 15; const WORKERS = Number(process.env.WORKERS || 2);
const PAGE = process.env.PAGE || 'cinematic';   // reel (laptop) | cinematic
const args = process.argv.slice(2);
const previewIdx = args.indexOf('--preview');

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.wasm': 'application/wasm', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream' };
function serve() {
  const srv = http.createServer((req, res) => {
    const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => srv.listen(0, () => r(srv)));
}

async function openPage(browser, port) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto(`http://localhost:${port}/reel/${PAGE}.html`);
  await page.evaluate(() => window.__ready);
  SECONDS = await page.evaluate(() => window.__duration || 15);
  return page;
}

(async () => {
  const srv = await serve(), port = srv.address().port;
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

  if (previewIdx >= 0) {
    const secs = (args[previewIdx + 1] || '0,5,10,14').split(',').map(Number);
    const dir = path.join(OUT, 'preview'); fs.mkdirSync(dir, { recursive: true });
    const page = await openPage(browser, port);
    for (const s of secs) {
      await page.evaluate(f => window.__setFrame(f), Math.round(s * FPS));
      await page.screenshot({ path: path.join(dir, `t${s.toFixed(1).padStart(5, '0')}.jpg`), quality: 85 });
      console.log('preview', s);
    }
  } else {
    await (await openPage(browser, port)).close();   // reads the page's duration
    const total = FPS * SECONDS, dir = path.join(OUT, 'frames');
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    let done = 0; const t0 = Date.now();
    await Promise.all([...Array(WORKERS)].map(async (_, w) => {
      const page = await openPage(browser, port);
      for (let f = w; f < total; f += WORKERS) {
        await page.evaluate(f => window.__setFrame(f), f);
        await page.screenshot({ path: path.join(dir, `${String(f).padStart(5, '0')}.jpg`), quality: 92 });
        if (++done % 30 === 0) console.log(`${done}/${total} frames, ${((Date.now() - t0) / done / 1000).toFixed(2)}s/frame`);
      }
    }));
    const music = path.join(ROOT, 'audio', 'music.wav');
    const sfx = path.join(ROOT, 'audio', PAGE === 'cinematic' && fs.existsSync(music) ? 'music.wav' : 'intro.mp3');
    const mp4 = path.join(OUT, `max-motors-${PAGE}.mp4`);
    const ff = ['-y', '-framerate', String(FPS), '-i', path.join(dir, '%05d.jpg')];
    if (fs.existsSync(sfx)) ff.push('-i', sfx, '-filter_complex', `[1:a]${PAGE === 'cinematic' ? 'loudnorm=I=-14:TP=-1.5' : 'volume=0.6'},apad,atrim=0:${SECONDS}[a]`, '-map', '0:v', '-map', '[a]', '-c:a', 'aac', '-b:a', '160k');
    ff.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-t', String(SECONDS), mp4);
    execFileSync('ffmpeg', ff, { stdio: 'inherit' });
    console.log('wrote', mp4);
  }
  await browser.close(); srv.close();
})();
