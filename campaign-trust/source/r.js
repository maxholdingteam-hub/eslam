const { chromium } = require('playwright');
(async()=>{const d=process.argv[2],sc=+process.argv[3]||1;const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:sc});p.on('pageerror',e=>console.log('ERR',e.message));p.on('requestfailed',r=>console.log('FAIL',r.url()));
await p.goto('file://'+d+'/c.html',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);
const els=await p.$$('section');const fs=require('fs');for(const e of els){const set=await e.getAttribute('data-set'),i=await e.getAttribute('data-i');fs.mkdirSync(`${d}/out/${set}`,{recursive:true});
await e.screenshot({path:`${d}/out/${set}/${set}-${String(i).padStart(2,'0')}.jpg`,type:'jpeg',quality:sc>1?90:80});}
console.log('slides',els.length);await b.close();})();
