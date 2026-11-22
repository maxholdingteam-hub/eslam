const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('http://localhost:8790/cover.html');await p.waitForTimeout(2500);await p.evaluate(()=>document.fonts.ready);
const n=await p.evaluate(()=>D.length);
for(let i=0;i<n;i++){await p.evaluate(x=>window.render(x),i);await p.waitForTimeout(150);await p.screenshot({path:`out/${i}.jpg`,type:'jpeg',quality:92});}
await b.close();console.log('done',n)})();
