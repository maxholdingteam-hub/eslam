const { chromium } = require('playwright');
(async()=>{const S=process.argv[2];const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1040,height:220}});
await pg.goto('file://'+S+'/mg/plate.html');await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(600);
await pg.screenshot({path:S+'/mg/plate.png',omitBackground:true});
await pg.setViewportSize({width:708,height:548});await pg.setContent(`<body style="margin:0;background:#0a0a0a"><img src="file://${S}/mg/logo.svg" style="width:700px;filter:drop-shadow(0 0 18px #f0953f)"></body>`);await pg.waitForTimeout(300);
await pg.screenshot({path:S+'/mg/logo_prev.png'});await b.close();})();
