// Screenshot every Max Motors offer design in feed (1080x1350) and story (1080x1920) at 2x.
//   node shoot.js <out_dir> [design,...]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
(async () => {
  const [,, out, only] = process.argv;
  const designs = only ? only.split(',') : ['admin', 'down', 'margin', 'protect', 'services', 'contact'];
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--force-color-profile=srgb'] });
  for (const [f, h] of [['feed', 1350], ['story', 1920]]) {
    const p = await b.newPage({ viewport: { width: 1080, height: h }, deviceScaleFactor: 2 });
    p.on('pageerror', e => console.log('PAGEERR', e.message));
    for (const d of designs) {
      await p.goto(`http://127.0.0.1:8774/promo/post.html?d=${d}&f=${f}`, { waitUntil: 'load' });
      await p.waitForFunction(() => document.body.dataset.ready);
      await p.screenshot({ path: `${out}/MaxMotors_${d}_${f}.png`, clip: { x: 0, y: 0, width: 1080, height: h } });
      console.log('ok', d, f);
    }
    await p.close();
  }
  await b.close();
})();
