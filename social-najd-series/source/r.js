const {chromium}=require('playwright');(async()=>{const d=process.argv[2],f=process.argv[3]||'fri.html';const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1080,height:1350}});await p.goto('file://'+d+'/'+f,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
const ids=await p.$$eval('section',s=>s.map(x=>x.id));
for(const id of ids){await p.evaluate(id=>{document.querySelectorAll('section').forEach(s=>s.style.display=s.id===id?'block':'none');window.scrollTo(0,0)},id);
const h=await p.$eval('[id="'+id+'"]',e=>e.offsetHeight);await p.setViewportSize({width:1080,height:h});await p.waitForTimeout(500);
await p.screenshot({path:`${d}/out/${id}.jpg`,type:'jpeg',quality:92,clip:{x:0,y:0,width:1080,height:h}});}await b.close()})();
