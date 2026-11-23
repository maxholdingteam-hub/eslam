const { chromium } = require('playwright'); const { spawn } = require('child_process');
(async()=>{const [k,c,out,only]=process.argv.slice(2);const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto(`http://localhost:8791/reel.html?k=${k}&c=${encodeURIComponent(c)}`);await p.waitForTimeout(2500);await p.evaluate(()=>document.fonts.ready);
if(only){for(const t of only.split(',')){await p.evaluate(x=>window.render(x),+t);await p.screenshot({path:out.replace('.mp4',`_${t}.jpg`),type:'jpeg',quality:85});}await b.close();return;}
const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','30','-i','-','-c:v','libx264','-crf','17','-pix_fmt','yuv420p',out]);
for(let i=0;i<11.5*30;i++){await p.evaluate(x=>window.render(x),i/30);const buf=await p.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();})();
