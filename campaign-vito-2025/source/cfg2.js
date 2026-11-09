const T=(k,t,top=250)=>`<div class="txt" style="top:${top}px"><div data-d=".2" class="kick" data-ls=".55">${k}</div><div data-d=".35" class="sh" style="font-size:80px;font-weight:800;line-height:1.35;margin-top:14px;white-space:nowrap">${t}</div><div data-d=".55" class="line"></div></div>`;
const hook=(sub)=>`<div class="txt" style="top:240px"><div data-d="2.35" class="kick" data-ls=".55">MERCEDES-BENZ</div><div data-d="2.5" class="lat chrome sh" style="font-weight:800;font-size:132px;letter-spacing:.06em;line-height:1.15;margin-top:8px;white-space:nowrap">VITO 2025</div><div data-d="2.8" class="line"></div><div data-d="3.0" class="sh" style="font-size:46px;font-weight:500;margin-top:22px;color:#efe6d2">${sub}</div></div>`;
const A=[0,4.75,7.2,9.4,11.7,14.0,16.5,19.1];
const mk=l=>l.map((h,i)=>({a:A[i],b:A[i+1],html:h}));
const base={hits:[0.05,4.75,9.4,14.0,19.1,24.0],hookEnd:2.3,offerAt:19.1,endAt:24.0,total:30};
module.exports={
 car1:Object.assign({},base,{scenes:mk([hook('فئة VIP · أسود ملكي'),T('EXTERIOR','فخامة تليق بك'),T('INTERIOR','داخلية جلد فاخرة'),T('STARLIGHT','سقف النجوم'),T('VIP SEATS','كراسي كابتن VIP'),T('LOUNGE','صالون رجال الأعمال'),T('MAX MOTORS','الآن في ماكس موتورز')])}),
 car2:Object.assign({},base,{scenes:mk([hook('فئة VIP · أسود ملكي'),T('EXTERIOR','حضور فخم'),T('INTERIOR','خشب وجلد فاخر'),T('VIP TABLE','طاولة VIP'),T('AMBIENT','إضاءة محيطية'),T('LOUNGE','صالون رجال الأعمال'),T('MAX MOTORS','الآن في ماكس موتورز')])}),
};
