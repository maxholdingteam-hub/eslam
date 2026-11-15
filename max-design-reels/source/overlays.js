// Renders the transparent text overlays (reel layers and post layers) to source/ov/*.png
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:1080, height:1920}});
  for (const room of ['s1','s2','s3']) for (const kind of ['hook','reveal','end','p1','p2','p3']){
    if (kind === 'end' && room !== 's1') continue;           // one shared end card
    if (kind === 'p3' && room !== 's1') continue;            // one shared closing slide layer
    await p.goto('file://' + path.join(__dirname, 'overlays.html') + `?room=${room}&kind=${kind}`, {waitUntil:'networkidle'});
    await p.waitForFunction(() => window.__ready); await p.evaluate(() => document.fonts.ready);
    const name = kind === 'end' || kind === 'p3' ? kind : `${room}-${kind}`;
    await p.locator('#layer').screenshot({path: path.join(__dirname, 'ov', name + '.png'), omitBackground:true});
  }
  await b.close();
})();
