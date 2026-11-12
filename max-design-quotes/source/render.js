// Prints the quotation to A4 PDFs (EN and AR) in ../out and warns if any page body overflows the letterhead.
const { chromium } = require('playwright');
const path = require('path');
const [file, base] = [process.argv[2] || 'q000295.html', process.argv[3] || 'Max-Design-Quotation-000295-Elevation'];
(async () => {
  const b = await chromium.launch();
  for (const lang of ['en', 'ar']){
    const p = await b.newPage();
    await p.goto('file://' + path.join(__dirname, file) + '?lang=' + lang, {waitUntil:'networkidle'});
    await p.waitForFunction(() => window.__ready); await p.evaluate(() => document.fonts.ready);
    if (await p.title() === 'CHECK TOTALS') throw new Error('totals do not add up');
    const over = await p.evaluate(() => [...document.querySelectorAll('.body')].map((b, i) => b.scrollHeight > b.clientHeight + 1 ? `page ${i + 1} overflows by ${b.scrollHeight - b.clientHeight}px` : '').filter(Boolean));
    if (over.length) console.log(lang, over.join('; '));
    await p.pdf({path: path.join(__dirname, '..', 'out', `${base}-${lang.toUpperCase()}.pdf`), format:'A4', printBackground:true, preferCSSPageSize:true});
    await p.close();
  }
  await b.close();
})();
