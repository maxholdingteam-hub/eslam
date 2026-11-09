const { chromium } = require('playwright'); const {spawn}=require('child_process');
(async()=>{
 const [S,car,out,fromS,toS,stepS]=process.argv.slice(2); const cfg=require(S+'/mg/cfg.js')[car];
 const fps=30, from=+(fromS||0), to=+(toS||cfg.total), step=+(stepS||0);
 const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1080,height:1920}});
 await pg.addInitScript(c=>{window.CFG=c},cfg);
 await pg.goto('file://'+S+'/mg/ad.html'); await pg.evaluate(()=>window.ready()); await pg.waitForTimeout(800);
 if(step){ // stills
   for(let t=from;t<to;t+=step){await pg.evaluate(t=>render(t),t); await pg.screenshot({path:`${out}_${t.toFixed(2)}.jpg`,type:'jpeg',quality:80});}
   await b.close(); return; }
 const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',''+fps,'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p','-r',''+fps,out],{stdio:['pipe','inherit','inherit']});
 const N=Math.round((to-from)*fps); const t0=Date.now();
 for(let i=0;i<N;i++){const t=from+i/fps; await pg.evaluate(t=>render(t),t); const buf=await pg.screenshot({type:'jpeg',quality:93}); if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); if(i%150==0) console.error(car,i,'/',N,((Date.now()-t0)/1000).toFixed(0)+'s');}
 ff.stdin.end(); await new Promise(r=>ff.on('close',r)); await b.close();
})();
