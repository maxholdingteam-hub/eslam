const { chromium } = require('playwright');
(async()=>{const d=process.argv[2],sc=+process.argv[3]||1;const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:sc});
await p.goto('file://'+d+'/posters.html',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
const names=['01-before-after','02-services','03-journey','04-start-today'];
const els=await p.$$('section');for(let i=0;i<els.length;i++){const r=i<4?'post-4x5':'story-9x16';
await els[i].screenshot({path:`${d}/out/${names[i%4]}_${r}.jpg`,type:'jpeg',quality:sc>1?92:85});}
await b.close();})();
