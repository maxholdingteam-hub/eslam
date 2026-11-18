const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(2500);await p.evaluate(()=>document.fonts.ready);
await p.screenshot({path:process.argv[3],omitBackground:true});await b.close();})();
