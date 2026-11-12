// Renders launch.html sections to Instagram-ready JPEGs in ../out, named in posting order.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const dir = __dirname, out = path.join(dir, '..', 'out');
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:3400,height:2000}, deviceScaleFactor:1});
  await p.goto('file://' + path.join(dir, 'launch.html'), {waitUntil:'networkidle'});
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  const shots = {p1:'01-teaser-03', p2:'02-teaser-02', p3:'03-teaser-01', pano:'reveal-panorama', p7:'07-services', p8:'08-process', p9:'09-booking',
                 s1:'story-1-countdown', s2:'story-2-reveal', s3:'story-3-booking'};
  for (const [id, name] of Object.entries(shots))
    await p.locator('#' + id).screenshot({path: path.join(out, name + '.jpg'), type:'jpeg', quality:92});
  // the reveal is one canvas split into three posts, posted right piece first so the grid reads as one image
  await p.locator('#pano').scrollIntoViewIfNeeded();
  const box = await p.locator('#pano').boundingBox();
  for (const [name, x] of [['04-reveal-right', 2160], ['05-reveal-center', 1080], ['06-reveal-left', 0]])
    await p.screenshot({path: path.join(out, name + '.jpg'), type:'jpeg', quality:92, clip:{x: box.x + x, y: box.y, width:1080, height:1350}});
  await b.close();
})();
