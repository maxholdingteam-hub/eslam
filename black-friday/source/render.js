// node render.js <page.html> <outdir> [fps]  -> writes outdir/f00000.jpg ...
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const [page_, out, fpsArg] = process.argv.slice(2);
  const fps = +(fpsArg || 30);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.resolve(page_), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  const dur = await p.evaluate(() => window.DUR);
  const n = Math.round(dur * fps);
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.seek(t), i / fps);
    await p.screenshot({ path: path.join(out, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
  }
  await b.close();
  console.log('frames', n);
})();
