// node scrape.js <url> <out.json> : open an official page, scroll it, list every image URL with its rendered size
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
(async () => {
  const [,, url, out] = process.argv;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36' });
  const seen = new Set();
  p.on('response', r => { const ct = r.headers()['content-type'] || ''; if (ct.startsWith('image/')) seen.add(r.url()); });
  try { await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 }); } catch (e) { console.log('goto', e.message); }
  for (let i = 0; i < 40; i++) { await p.mouse.wheel(0, 900); await p.waitForTimeout(350); }
  await p.waitForTimeout(2000);
  const dom = await p.evaluate(() => {
    const o = [];
    document.querySelectorAll('img').forEach(i => o.push({ u: i.currentSrc || i.src, w: i.naturalWidth, h: i.naturalHeight, alt: i.alt, set: i.srcset || i.dataset.srcset || '' }));
    document.querySelectorAll('source').forEach(s => o.push({ u: '', set: s.srcset || s.dataset.srcset || '' }));
    document.querySelectorAll('*').forEach(e => { const bg = getComputedStyle(e).backgroundImage; if (bg && bg.startsWith('url(')) o.push({ u: bg.slice(5, -2), bg: 1 }); });
    return { title: document.title, imgs: o, links: [...document.querySelectorAll('a')].map(a => a.href).filter(h => h) };
  });
  dom.net = [...seen];
  fs.writeFileSync(out, JSON.stringify(dom, null, 1));
  console.log(dom.title, dom.imgs.length, dom.net.length);
  await b.close();
})();
