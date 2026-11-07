const {chromium}=require('playwright');
(async()=>{const [,,src,out,lang]=process.argv;const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1200,height:1700}});
await p.goto('file://'+src,{waitUntil:'networkidle'});
if(lang==='ar')await p.click('#langBtn');
await p.emulateMedia({media:'screen'});
await p.addStyleTag({content:`
 *{animation:none!important;transition:none!important}
 .rv{opacity:1!important;transform:none!important}
 nav,.glow,.scroll-hint,.mmenu{display:none!important}
 .atmo{position:absolute!important;height:100%}
 html,body{background:#06102a!important}
 .hero{min-height:auto!important;padding-top:70px!important}
 section{padding:70px 0!important}
 .card,.job,.a,.tool,.c-card,.stat,.bar,.proj,.mock,.edu>div,.sec-head,.about-grid>*{break-inside:avoid;page-break-inside:avoid}
 .sec-head{break-after:avoid}
 .marquee{display:none!important}
 *,*::before,*::after{box-shadow:none!important;text-shadow:none!important;filter:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
 .portrait .ring{-webkit-mask:none!important;mask:none!important;background:none!important;border:2px solid #d6af5c;padding:0!important}
 .atmo::after,.card::before{display:none!important}
 .chip{background:#0d1d44!important}
 .portrait .photo{box-shadow:none!important;outline:1px solid rgba(214,175,92,.35)}
 html[lang="ar"]{--serif:"IBM Plex Sans Arabic",sans-serif!important}
 html[lang="ar"] h2 em,html[lang="ar"] .job h4,html[lang="ar"] h1 .gold{font-weight:700!important}
 h1 .gold,.photo.mono span:last-child{background:none!important;-webkit-background-clip:border-box!important;background-clip:border-box!important;color:#e2bf72!important}
 .job{padding:26px 0!important}
 .contact h2{font-size:96px!important}
`});
await p.evaluate(()=>{document.querySelectorAll('.fill').forEach(f=>f.style.width=f.dataset.w+'%');document.querySelectorAll('[data-count]').forEach(e=>e.textContent=e.dataset.count);document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager')});
await p.waitForTimeout(1500);
await p.pdf({path:out,width:'1200px',height:'1697px',printBackground:true,margin:{top:'0',bottom:'0',left:'0',right:'0'}});
await b.close();})();
