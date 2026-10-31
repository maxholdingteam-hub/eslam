// Screenshot all 5 slides (1080x1350) at 2x.   node shoot.js <out_dir>
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
(async () => {
  const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--force-color-profile=srgb'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  for (const d of ['0', '1', '2', '3', '4']) {
    await p.goto(`http://127.0.0.1:8775/p7/post.html?d=${d}`, { waitUntil: 'load' });
    await p.waitForFunction(() => document.body.dataset.ready);
    await p.screenshot({ path: `${out}/slide_${+d + 1}.png`, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
  }
  await b.close(); console.log('ok');
})();
