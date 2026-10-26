const { chromium } = require('playwright');const fs=require('fs');
const [,,html,shots]=process.argv;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+html,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
const els=await p.$$('section');const links=[];
for(let i=0;i<els.length;i++){await els[i].screenshot({path:`${shots}/s${String(i+1).padStart(2,'0')}.jpg`,quality:86,type:'jpeg'});
 const L=await els[i].evaluate(sec=>{const r0=sec.getBoundingClientRect();return [...sec.querySelectorAll('[data-href]')].map(e=>{const r=e.getBoundingClientRect();return {href:e.dataset.href,x:r.left-r0.left,y:r.top-r0.top,w:r.width,h:r.height}})});
 links.push(L);}
fs.writeFileSync(shots+'/links.json',JSON.stringify(links));console.log(els.length,'slides',links.flat().length,'links');await b.close();})();
