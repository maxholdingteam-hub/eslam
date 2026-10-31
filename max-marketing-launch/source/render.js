// Renders launch.html to Instagram-ready JPEGs in ../out, named in posting order.
// Serves this folder over a tiny local server so the 3D modules and logo pixels load.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const dir = __dirname, out = path.join(dir, '..', 'out');
const types = {'.html':'text/html', '.js':'text/javascript', '.webp':'image/webp', '.png':'image/png'};
const server = http.createServer((q, s) => {
  const f = path.join(dir, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e){ s.writeHead(404); s.end(); return; } s.writeHead(200, {'content-type': types[path.extname(f)] || 'application/octet-stream'}); s.end(d); });
}).listen(0, async () => {
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
  const p = await b.newPage({viewport:{width:3400,height:2000}, deviceScaleFactor:1});
  p.on('pageerror', e => console.log('pageerror', e.message));
  await p.goto(`http://localhost:${server.address().port}/launch.html`, {waitUntil:'networkidle'});
  await p.waitForFunction(() => window.__ready === true, null, {timeout:60000});
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  const shots = {p1:'01-teaser-03', p2:'02-teaser-02', p3:'03-teaser-01', pano:'reveal-panorama', p7:'07-services', p8:'08-process', p9:'09-booking',
                 s1:'story-1-countdown', s2:'story-2-reveal', s3:'story-3-booking'};
  for (const [id, name] of Object.entries(shots))
    await p.locator('#' + id).screenshot({path: path.join(out, name + '.jpg'), type:'jpeg', quality:92});
  // the reveal is one canvas split into three posts, posted right piece first so the grid reads as one image
  await p.locator('#pano').scrollIntoViewIfNeeded();
  const box = await p.locator('#pano').boundingBox();
  for (const [name, x] of [['04-reveal-right', 2160], ['05-reveal-center', 1080], ['06-reveal-left', 0]])
    await p.screenshot({path: path.join(out, name + '.jpg'), type:'jpeg', quality:92, clip:{x: box.x + x, y: box.y, width:1080, height:1350}});
  await b.close(); server.close();
});
