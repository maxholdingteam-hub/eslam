const {chromium}=require('playwright');
const out=process.argv[2];
// id, kind, text
const items=[
 ["c01","cap","عندنا اليوم تسليم"],
 ["c02","big","جيلي إمجراند"],
 ["c03","cap","للعميل"],
 ["c04","name","الأستاذ محمد"],
 ["c05","cap","الله يبارك لك"],
 ["c06","cap","ويعطيك خيرها"],
 ["c07","cap","ويكفيك شرها"],
 ["q01","q","رأيك في ماكس موتورز؟"],
 ["c08","cap","الله يطول بعمرك"],
 ["c09","big","ولا غلطة"],
 ["c10","cap","الله يبارك له"],
 ["c11","cap","ويعطيه خيرها ويكفيه شرها"],
 ["c12","cap","الله يجزاك خير"],
 ["c13","cap","الله يعافيك"],
 ["end","end",""],
 ["tag","tag",""],
];
const css=`
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@600;800;900&family=Montserrat:wght@600;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;background:transparent;overflow:hidden}
body{font-family:'Cairo',sans-serif;direction:rtl;position:relative}
.cap{position:absolute;left:0;right:0;top:1540px;text-align:center}
.cap span{display:inline-block;font-weight:800;font-size:72px;color:#fff;line-height:1.25;padding:6px 34px 14px;
 text-shadow:0 4px 18px rgba(0,0,0,.85),0 0 2px #000;-webkit-text-stroke:2px rgba(0,0,0,.35)}
.big span{font-size:104px;color:#E9C46A;letter-spacing:0}
.name{position:absolute;right:70px;left:70px;top:1330px;text-align:center}
.name .l{display:inline-block;background:#E9C46A;color:#111;font-weight:900;font-size:78px;padding:6px 40px 16px;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.5)}
.name .s{display:block;margin-top:14px;font:600 34px 'Montserrat';letter-spacing:8px;color:#fff;text-shadow:0 2px 10px #000;direction:ltr}
.q{position:absolute;left:0;right:0;top:1390px;text-align:center}
.q span{display:inline-block;background:rgba(10,10,12,.72);border:2px solid #E9C46A;color:#fff;font-weight:800;font-size:60px;padding:10px 42px 20px;border-radius:60px}
.end{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.end .a{font-weight:900;font-size:150px;color:#fff;text-shadow:0 8px 40px rgba(0,0,0,.8)}
.end .line{width:220px;height:5px;background:#E9C46A;margin:18px 0 34px;border-radius:3px}
.end .b{font:800 64px 'Montserrat';letter-spacing:14px;color:#E9C46A;direction:ltr}
.end .c{font-weight:700;font-size:52px;color:#fff;margin-top:6px}
.tag{position:absolute;top:56px;left:0;right:0;text-align:center;font:800 34px 'Montserrat';letter-spacing:12px;color:#fff;direction:ltr;opacity:.92;text-shadow:0 2px 12px rgba(0,0,0,.8)}
.tag b{color:#E9C46A}
`;
function html(k,t){
 if(k==="cap")return `<div class="cap"><span>${t}</span></div>`;
 if(k==="big")return `<div class="cap big"><span>${t}</span></div>`;
 if(k==="name")return `<div class="name"><span class="l">${t}</span><span class="s">NEW OWNER</span></div>`;
 if(k==="q")return `<div class="q"><span>${t}</span></div>`;
 if(k==="end")return `<div class="end"><div class="a">ألف مبروك</div><div class="line"></div><div class="b">MAX MOTORS</div><div class="c">ماكس موتورز</div></div>`;
 if(k==="tag")return `<div class="tag"><b>MAX</b> MOTORS · DELIVERY</div>`;
}
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
for(const [id,k,t] of items){await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html(k,t)}</body></html>`,{waitUntil:'networkidle'});
await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:`${out}/${id}.png`,omitBackground:true});}
await b.close();})();
