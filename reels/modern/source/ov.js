const {chromium}=require('playwright');(async()=>{const d=process.argv[2];const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1080,height:1920}});await p.goto('file://'+d+'/ov.html',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
const ids=await p.$$eval('section',s=>s.map(x=>x.id));
for(const id of ids){await p.evaluate(id=>document.querySelectorAll('section').forEach(s=>s.style.display=s.id===id?'block':'none'),id);await p.waitForTimeout(200);
await p.screenshot({path:`${d}/${id}.png`,omitBackground:true,clip:{x:0,y:0,width:1080,height:1920}});}await b.close()})();
