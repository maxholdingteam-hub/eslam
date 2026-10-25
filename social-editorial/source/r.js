const {chromium}=require('playwright');(async()=>{const d=process.argv[2],sc=+process.argv[3]||1;const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:sc});await p.goto('file://'+d+'/ed.html',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(600);
for(const el of await p.$$('section')){const id=await el.getAttribute('id');await el.screenshot({path:`${d}/out/${id}.jpg`,type:'jpeg',quality:sc>1?92:80});}await b.close()})();
