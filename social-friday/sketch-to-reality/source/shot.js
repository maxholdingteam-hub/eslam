const {chromium}=require('playwright');(async()=>{const d=process.argv[2];const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
for(const [w,h,tag] of [[1080,1350,'post'],[1080,1920,'story']]){for(const m of ['real','sketch']){
const p=await b.newPage({viewport:{width:w,height:h}});p.on('console',m=>console.log(m.text()));p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(`file://${d}/scene.html?mode=${m}&w=${w}&h=${h}`,{waitUntil:'networkidle'});await p.waitForFunction(()=>document.title==='ready',{timeout:120000});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
await p.screenshot({path:`${d}/${m}_${tag}.png`});await p.close();}}
await b.close()})();
