const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const PNG = process.env.FMT === 'png';   // transparent overlay layer (film.html?layer=ovl)
(async () => {
  const [,, mode, out, ...rest] = process.argv;   // mode: preview t1 t2… | all fps
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-gl=angle', '--ignore-gpu-blocklist', '--force-color-profile=srgb', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: +(process.env.DSF || 1) });
  p.setDefaultTimeout(0); p.on('pageerror', e => console.log('PAGEERR', e.message));
  p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await p.goto('http://127.0.0.1:8774/' + (process.env.PAGE || 'reg.html?car=hilux'), { waitUntil: 'load', timeout: 90000 });
  await p.evaluate(() => window.ready);
  fs.mkdirSync(out, { recursive: true });
  const root = await p.$('#root');
  const times = mode === 'range' ? Array.from({ length: +rest[2] - +rest[1] }, (_, i) => (i + +rest[1]) / +rest[0]) : mode === 'all' ? Array.from({ length: Math.round((await p.evaluate(() => window.DUR)) * +rest[0]) }, (_, i) => i / +rest[0]) : rest.map(Number);
  const t0 = Date.now();
  for (let i = 0; i < times.length; i++) {
    await p.evaluate(t => window.renderAt(t), times[i]);
    const ext = PNG ? 'png' : 'jpg';
    const name = mode === 'range' ? `f${String(i + +rest[1]).padStart(5, '0')}.${ext}` : mode === 'all' ? `f${String(i).padStart(5, '0')}.${ext}` : `t${times[i].toFixed(2)}.${ext}`;
    await root.screenshot(PNG ? { path: `${out}/${name}`, type: 'png', omitBackground: true, timeout: 0 } : { path: `${out}/${name}`, type: 'jpeg', quality: +(process.env.JQ || 92), timeout: 0 });
    if (mode === 'all' && i % 60 === 0) console.log('frame', i, '/', times.length, ((Date.now() - t0) / (i + 1)).toFixed(0) + 'ms/f');
  }
  await b.close();
})();
