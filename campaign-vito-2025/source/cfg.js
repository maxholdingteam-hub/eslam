const K=(t)=>`<div data-d=".12" class="lat" data-ls=".3" style="font:700 26px Syncopate;color:#f6d98a;letter-spacing:.3em">${t}</div>`;
const bandT=(k,t,s,top=330)=>`<div class="txt" style="top:${top}px">${K(k)}<div data-d=".22" class="sh" style="font-size:104px;font-weight:900;line-height:1.3;margin-top:6px">${t}</div><div data-d=".42" class="line" style="width:320px;margin-top:10px"></div></div><div class="txt" style="top:1450px"><div data-d=".55" class="sh" style="font-size:54px;font-weight:800;color:#efe2cf">${s}</div></div>`;
const fullT=(k,t,s)=>`<div class="txt" style="top:1250px">${K(k)}<div data-d=".22" class="sh" style="font-size:108px;font-weight:900;line-height:1.3;margin-top:6px">${t}</div><div data-d=".42" class="line" style="width:320px;margin-top:10px"></div><div data-d=".52" class="sh" style="font-size:48px;font-weight:700;color:#efe2cf;margin-top:18px">${s}</div></div>`;
const hook=(sub)=>`<div class="txt" style="top:250px"><div data-d=".5" class="lat" data-ls=".45" style="font:700 30px Syncopate;color:#f6d98a;letter-spacing:.4em">MERCEDES-BENZ</div><div data-d=".75" class="lat chrome sh" style="font-family:Unbounded;font-weight:900;font-size:124px;line-height:1.2;white-space:nowrap">VITO 2025</div><div data-d="1.1" class="line" style="width:420px;margin-top:6px"></div></div><div class="txt" style="top:1440px"><div data-d="1.4" class="sh" style="font-size:64px;font-weight:900">${sub}</div><div data-d="1.7" style="margin-top:22px"><span class="chip" style="font-size:44px;background:linear-gradient(180deg,#fbe08f,#c8962e);color:#140a01;border:0;padding:12px 40px">🔥 خصم قوي للكاش</span></div></div>`;
const A=[0,4.75,7.2,9.4,11.7,14.0,16.5,19.1];
function mk(list){return list.map((s,i)=>Object.assign({a:A[i],b:A[i+1]},s));}
const base={hits:[4.75,9.4,14.0,19.1,24.0],cuts:[7.2,11.7,16.5],offerAt:19.1,endAt:24.0,total:30,contact:''};
module.exports={
car1:Object.assign({},base,{offerImg:'c1_14',scenes:mk([
 {img:'c1_01',mode:'band',ar:1.6554,dy:110,z0:1.0,z1:1.12,html:hook('فخامة VIP بلون أسود ملكي')},
 {img:'c1_03',mode:'band',ar:1.6236,dy:110,z0:1.05,z1:1.15,px0:60,px1:-40,html:bandT('MAYBACH STYLE','واجهة مايباخ','شبك كروم عمودي · جنوط فاخرة')},
 {img:'c1_04',mode:'band',ar:1.6,dy:110,z0:1.0,z1:1.1,px0:-80,px1:80,html:bandT('VIP CABIN','مقصورة VIP','تجهيز خاص لرجال الأعمال')},
 {img:'c1_05',mode:'full',ar:1.5017,px0:350,px1:120,z0:1.0,z1:1.08,html:fullT('PREMIUM LEATHER','جلد كريمي فاخر','داخلية بتفاصيل راقية')},
 {img:'c1_09',mode:'full',ar:1.5017,px0:0,px1:0,py0:-40,py1:40,z0:1.05,z1:1.2,html:fullT('STARLIGHT ROOF','سقف النجوم','إضاءة مبهرة تخطف الأنظار')},
 {img:'c1_11',mode:'full',ar:1.5017,px0:-120,px1:120,z0:1.0,z1:1.1,html:fullT('CAPTAIN SEATS','كراسي كابتن','راحة بلا حدود في كل مشوار')},
 {img:'c1_12',mode:'full',ar:1.5017,px0:250,px1:-150,z0:1.02,z1:1.12,html:fullT('EXECUTIVE LOUNGE','صالون متنقل','كل رحلة… تجربة ملكية')},
])}),
car2:Object.assign({},base,{offerImg:'c2_10',scenes:mk([
 {img:'c2_01',mode:'band',ar:1.6504,dy:110,z0:1.0,z1:1.12,html:hook('أسود ملكي · داخلية بيضاء فاخرة')},
 {img:'c2_04',mode:'band',ar:1.6,dy:110,z0:1.0,z1:1.1,px0:80,px1:-80,html:bandT('ELEGANT DESIGN','حضور فخم','تصميم أنيق يلفت الأنظار')},
 {img:'c2_05',mode:'full',ar:1.036,px0:-150,px1:150,z0:1.0,z1:1.08,html:fullT('ROYAL INTERIOR','طارة خشب ملكية','جلد أبيض فاخر بلمسة كلاسيك')},
 {img:'c2_06',mode:'full',ar:1.3366,px0:-200,px1:150,z0:1.0,z1:1.1,html:fullT('DIAMOND STITCH','مقاعد جلد فاخرة','خياطة ماسية · راحة مطلقة')},
 {img:'c2_07',mode:'full',ar:1.9809,px0:500,px1:150,z0:1.0,z1:1.08,html:fullT('VIP TABLE','طاولة VIP','مكتبك المتنقل أينما ذهبت')},
 {img:'c2_08',mode:'full',ar:1.5017,px0:-250,px1:150,z0:1.02,z1:1.12,html:fullT('AMBIENT LIGHT','إضاءة محيطية','سقف مضيء بأجواء ساحرة')},
 {img:'c2_09',mode:'full',ar:1.5017,px0:200,px1:-150,z0:1.0,z1:1.1,html:fullT('EXECUTIVE LOUNGE','صالون رجال الأعمال','راحة… وخصوصية تامة')},
])}),
};
