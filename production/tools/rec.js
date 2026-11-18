// node rec.js page.html out.mp4 seconds [fps] [onlyFramesCsv]
const { chromium } = require('playwright'); const { spawn } = require('child_process');
(async () => {
  const [page, out, secs, fpsArg, only] = process.argv.slice(2); const fps = +(fpsArg || 30); const N = Math.round(+secs * fps);
  const b = await chromium.launch({ args: ['--no-sandbox'] }); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + page); await p.waitForTimeout(2500); await p.evaluate(() => document.fonts.ready);
  if (only) { for (const t of only.split(',')) { await p.evaluate(x => window.render(x), +t); await p.screenshot({ path: out.replace('.mp4', `_${t}.jpg`), type: 'jpeg', quality: 85 }); } await b.close(); return; }
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', out]);
  for (let i = 0; i < N; i++) { await p.evaluate(x => window.render(x), i / fps); const buf = await p.screenshot({ type: 'jpeg', quality: 92 }); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('done', N);
})();
