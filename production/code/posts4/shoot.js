// Screenshot the Mazda Instagram posters (1080x1350) at 2x.   node shoot.js <out_dir> [design,...]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
(async () => {
  const [,, out, only] = process.argv;
  const designs = only ? only.split(',') : ['urus', 'rr', 'prado', 'patrol'];
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--force-color-profile=srgb'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  for (const d of designs) {
    await p.goto(`http://127.0.0.1:8774/posts4/post.html?d=${d}`, { waitUntil: 'load' });
    await p.waitForFunction(() => document.body.dataset.ready);
    await p.screenshot({ path: `${out}/MaxMotors_${d}.png`, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
    console.log('ok', d);
  }
  await b.close();
})();
