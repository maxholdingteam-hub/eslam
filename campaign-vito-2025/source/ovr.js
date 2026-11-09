// render transparent overlay PNG frames
const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{const [S,car,dir,stepS]=process.argv.slice(2); const cfg=require(S+'/mg/cfg2.js')[car]; fs.mkdirSync(dir,{recursive:true});
 const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1080,height:1920}});
 await pg.addInitScript(c=>{window.CFG=c},cfg); await pg.goto('file://'+S+'/mg/ov2.html'); await pg.evaluate(()=>window.ready()); await pg.waitForTimeout(800);
 const step=+(stepS||0); const fps=30; const N=step?Math.floor(cfg.total/step):cfg.total*fps;
 for(let i=0;i<N;i++){const t=step?i*step+step/2:i/fps; await pg.evaluate(t=>render(t),t); await pg.screenshot({path:`${dir}/${String(i).padStart(4,'0')}.png`,omitBackground:true});}
 await b.close();})();
