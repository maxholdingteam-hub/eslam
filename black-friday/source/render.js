// node render.js <page.html?query> <outdir> [fps] [png]  -> frames f00000.(jpg|png); png = transparent overlay
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const [page_, out, fpsArg, fmt] = process.argv.slice(2);
  const fps = +(fpsArg || 30), png = fmt === 'png';
  fs.mkdirSync(out, { recursive: true });
  const [file, q] = page_.split('?');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + path.resolve(file) + (q ? '?' + q : ''), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  const dur = await p.evaluate(() => window.DUR);
  const n = Math.round(dur * fps);
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.seek(t), i / fps);
    const f = path.join(out, `f${String(i).padStart(5, '0')}.${png ? 'png' : 'jpg'}`);
    await p.screenshot(png ? { path: f, type: 'png', omitBackground: true } : { path: f, type: 'jpeg', quality: 92 });
  }
  await b.close();
  console.log('frames', n);
})();
