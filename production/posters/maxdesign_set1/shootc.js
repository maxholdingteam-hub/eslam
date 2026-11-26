const {chromium}=require('playwright');
const C=[{slug:'cov_styles',grid:'1',tag:'تحدي',t:'نفس المجلس<br><b>وش تختار؟</b>'},{slug:'cov_tour',img:'t1_door.png',tag:'جولة',t:'جولة في بيت<br><b>من تصميمنا</b>'}];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
for(const x of C){await p.goto('http://localhost:8791/cover.html?'+new URLSearchParams(x),{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);await p.screenshot({path:'out/'+x.slug+'.jpg',type:'jpeg',quality:93});}
await b.close();console.log('ok')})();
