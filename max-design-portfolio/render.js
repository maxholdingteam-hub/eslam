const { chromium } = require('playwright');
const [,,html,pdf,shots]=process.argv;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+html,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
if(shots){const n=await p.$$eval('section',s=>s.length);const els=await p.$$('section');
 for(let i=0;i<n;i++){await els[i].screenshot({path:`${shots}/s${String(i+1).padStart(2,'0')}.jpg`,quality:60,type:'jpeg'});}}
await p.pdf({path:pdf,width:'1920px',height:'1080px',printBackground:true,preferCSSPageSize:true});
await b.close();})();
