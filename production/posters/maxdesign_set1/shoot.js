const {chromium}=require('playwright');const P=require('./posters.json');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350}});
for(const x of P){const u='http://localhost:8791/poster.html?'+new URLSearchParams(x).toString();await p.goto(u,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);await p.screenshot({path:'out/'+x.slug+'.jpg',type:'jpeg',quality:93});}
await b.close();console.log('done',P.length)})();
