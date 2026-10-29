// Screenshot the Friday post (1080x1350) at 2x.   node shoot.js <out.png>
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--force-color-profile=srgb'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
  await p.goto('http://127.0.0.1:8774/posts6/post.html', { waitUntil: 'load' });
  await p.waitForFunction(() => document.body.dataset.ready);
  await p.screenshot({ path: process.argv[2], clip: { x: 0, y: 0, width: 1080, height: 1350 } });
  await b.close();
})();
