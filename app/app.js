(() => {
'use strict';
const C = window.MM_CONFIG || {};
const $ = (s, el = document) => el.querySelector(s);
const view = $('#view'), sheet = $('#sheet');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const BODY = {'suv':'SUV','سيدان':'سيدان','بيك اب':'بيك أب','فان':'فان','ميني فان':'ميني فان','كروس أوفر':'كروس أوفر','رياضية':'رياضية','هاتشباك':'هاتشباك'};
const bodyLabel = b => BODY[b] || b;
const norm = s => String(s || '').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/\s+/g,' ').trim();

// ---------- storage (best effort) ----------
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
let favs = new Set(store.get('mm_favs', []));
const saveFavs = () => store.set('mm_favs', [...favs]);

// ---------- data ----------
let CARS = [], BY_ID = {};
const ready = fetch('data/cars.json').then(r => r.json()).then(d => {
  CARS = d; d.forEach(c => { c._s = norm([c.brand, c.brandEn, c.model, c.modelEn, c.body, c.year, c.color].join(' ')); BY_ID[c.id] = c; });
});

// ---------- helpers ----------
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(() => t.hidden = true, 2200); }
function setTab(name) { document.querySelectorAll('.tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === name)); }
function card(c) {
  return `<article class="card"><a href="#/car/${esc(c.id)}">
    <div class="ph"><img loading="lazy" src="${esc(c.thumb)}" alt="${esc(c.brand + ' ' + c.model)}"></div>
    <div class="bd"><div class="b">${esc(c.brand)}</div><h3>${esc(c.model)}</h3>
    <div class="m">${esc([c.year, bodyLabel(c.body), c.seats && c.seats + ' مقاعد'].filter(Boolean).join(' · '))}</div>
    <div class="cf">كاش أو تمويل</div></div></a>
    <button class="heart ${favs.has(c.id) ? 'on' : ''}" data-fav="${esc(c.id)}" aria-label="أضف للمفضلة">♥</button></article>`;
}
function grid(list) { return list.length ? `<div class="grid">${list.map(card).join('')}</div>` : ''; }
function brands() {
  const m = new Map(); CARS.forEach(c => { const k = c.brand; if (!m.has(k)) m.set(k, { brand: k, en: c.brandEn, n: 0 }); m.get(k).n++; });
  return [...m.values()].sort((a, b) => b.n - a.n);
}
function params() { const q = location.hash.split('?')[1] || ''; return Object.fromEntries(new URLSearchParams(q)); }
function go(h) { location.hash = h; }

// ---------- views ----------
function Home() {
  setTab('home');
  const hero = BY_ID['Haval_H9'] || CARS[0];
  const bodies = Object.keys(BODY).filter(b => CARS.some(c => c.body === b));
  const latest = CARS.filter((c, i) => i % 7 === 0).slice(0, 8);
  view.innerHTML = `
  <section class="hero"><h1>سيارتك الجاية<br><span>تنتظرك</span></h1>
    <p>${CARS.length} سيارة من ${brands().length} ماركة تحت سقف واحد</p>
    <a class="pill" href="#/cars">تصفّح السيارات ←</a>
    ${hero ? `<img src="${esc(hero.images[0])}" alt="" style="border-radius:16px;margin-top:16px;margin-bottom:16px">` : ''}</section>
  <form class="search" role="search" id="hs"><span aria-hidden="true">🔍</span><input name="q" type="search" placeholder="دوّر بالماركة أو الموديل… مثل: كامري" aria-label="بحث"></form>
  <div class="sec"><h2>وش تبي؟</h2></div>
  <div class="chips">${bodies.map(b => `<a class="chip" href="#/cars?body=${encodeURIComponent(b)}">${esc(bodyLabel(b))}</a>`).join('')}</div>
  <div class="sec"><h2>الماركات</h2><a href="#/cars">الكل</a></div>
  <div class="brands">${brands().map(b => `<a class="bchip" href="#/cars?brand=${encodeURIComponent(b.brand)}">${esc(b.brand)}<small>${esc(b.en)} · ${b.n}</small></a>`).join('')}</div>
  <div class="banner" style="margin-top:22px"><h2>كاش أو تمويل</h2><p>اختار طريقة الدفع اللي تريحك، وفريقنا يتواصل معك ويكمّل الباقي.</p></div>
  <div class="sec"><h2>مختارات لك</h2><a href="#/cars">عرض الكل</a></div>
  ${grid(latest)}
  <a href="#/companies" class="banner" style="display:block"><h2>🏢 عندك شركة أو مؤسسة؟</h2><p>سيارات للإدارة، للمواقع، وباصات للموظفين — كاش أو تمويل للشركات. اطلب عرض أسطولك ←</p></a>`;
  $('#hs').onsubmit = e => { e.preventDefault(); const q = new FormData(e.target).get('q').trim(); go('#/cars' + (q ? '?q=' + encodeURIComponent(q) : '')); };
}

function Cars() {
  setTab('cars');
  const p = params(); const q = p.q || '', body = p.body || '', brand = p.brand || '';
  const bodies = Object.keys(BODY).filter(b => CARS.some(c => c.body === b));
  view.innerHTML = `
  <div class="filters">
    <form class="search" role="search" id="fs"><span aria-hidden="true">🔍</span><input name="q" type="search" value="${esc(q)}" placeholder="دوّر بالماركة أو الموديل" aria-label="بحث"></form>
    <div class="chips" id="bc"><button class="chip ${!body ? 'on' : ''}" data-body="">الكل</button>${bodies.map(b => `<button class="chip ${b === body ? 'on' : ''}" data-body="${esc(b)}">${esc(bodyLabel(b))}</button>`).join('')}</div>
    <div class="chips" style="margin-top:8px"><select class="chip" id="brandSel" aria-label="الماركة"><option value="">كل الماركات</option>${brands().map(b => `<option ${b.brand === brand ? 'selected' : ''} value="${esc(b.brand)}">${esc(b.brand)} (${b.n})</option>`).join('')}</select></div>
  </div>
  <div id="res"></div>`;
  const apply = () => {
    const nq = norm($('#fs [name=q]').value), nb = $('#bc .on')?.dataset.body || '', nbr = $('#brandSel').value;
    const list = CARS.filter(c => (!nq || nq.split(' ').every(w => c._s.includes(w))) && (!nb || c.body === nb) && (!nbr || c.brand === nbr));
    $('#res').innerHTML = `<p class="count">${list.length} سيارة</p>` + (grid(list) || `<div class="empty"><b>ما لقينا نتيجة</b>جرّب كلمة ثانية، أو كلّمنا ونوفّرها لك.<br><br><a class="btn dark" href="tel:${esc(C.phone)}">☎ ${esc(C.phone)}</a></div>`);
    const sp = new URLSearchParams(); if (nq) sp.set('q', $('#fs [name=q]').value.trim()); if (nb) sp.set('body', nb); if (nbr) sp.set('brand', nbr);
    history.replaceState(null, '', '#/cars' + (sp.toString() ? '?' + sp : ''));
  };
  $('#fs').onsubmit = e => { e.preventDefault(); apply(); $('#fs input').blur(); };
  $('#fs input').oninput = () => { clearTimeout(apply._t); apply._t = setTimeout(apply, 200); };
  $('#bc').onclick = e => { const b = e.target.closest('[data-body]'); if (!b) return; $('#bc .on')?.classList.remove('on'); b.classList.add('on'); apply(); };
  $('#brandSel').onchange = apply;
  apply();
}

function Car(id) {
  setTab('cars');
  const c = BY_ID[id];
  if (!c) { view.innerHTML = `<div class="empty"><b>السيارة غير موجودة</b><a class="pill" href="#/cars">رجوع للسيارات</a></div>`; return; }
  const specs = [['السنة', c.year], ['الهيكل', bodyLabel(c.body)], ['المقاعد', c.seats], ['القير', c.gear], ['الوقود', c.fuel], ['الدفع', c.drive], ['اللون', c.color], ['الفئة', c.trim], ['الحالة', c.status]].filter(x => x[1]);
  view.innerHTML = `
  <div class="rel"><button class="back" onclick="history.length>1?history.back():location.hash='#/cars'" aria-label="رجوع">→</button>
    <div class="gal" id="gal">${c.images.map((s, i) => `<img src="${esc(s)}" alt="${esc(c.brand + ' ' + c.model + ' صورة ' + (i + 1))}" ${i ? 'loading="lazy"' : ''}>`).join('')}</div>
    <div class="dots" id="dots">${c.images.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>
    <button class="heart ${favs.has(c.id) ? 'on' : ''}" data-fav="${esc(c.id)}" style="top:12px;left:12px;width:40px;height:40px" aria-label="أضف للمفضلة">♥</button></div>
  <section class="dt"><div class="b">${esc(c.brand)} · ${esc(c.brandEn)}</div><h1>${esc(c.model)} ${esc(c.year)}</h1>
    <div class="pay"><span>كاش ✔</span><span>تمويل ✔</span></div>
    <div class="specs">${specs.map(([k, v]) => `<div class="spec"><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>
    <p class="desc">${esc(c.desc)}</p>
    <button class="btn dark block" id="share" style="margin-top:8px">↗ شارك السيارة</button>
  </section>
  <div style="height:80px"></div>
  <div class="cta"><button class="btn gold" id="req">اطلبها: كاش أو تمويل</button><a class="btn dark" href="tel:${esc(C.phone)}" aria-label="اتصال">☎</a>${C.whatsapp ? `<a class="btn wa" href="${waLink('السلام عليكم، أبي أستفسر عن ' + c.brand + ' ' + c.model + ' ' + c.year)}" target="_blank" rel="noopener" aria-label="واتساب">واتساب</a>` : ''}</div>`;
  const gal = $('#gal');
  gal.onscroll = () => { const i = Math.round(Math.abs(gal.scrollLeft) / gal.clientWidth); document.querySelectorAll('#dots i').forEach((d, k) => d.classList.toggle('on', k === i)); };
  $('#req').onclick = () => leadForm(c);
  $('#share').onclick = async () => {
    const url = location.href, text = `${c.brand} ${c.model} ${c.year} — ماكس موتورز، كاش أو تمويل`;
    try { if (navigator.share) await navigator.share({ title: text, url }); else { await navigator.clipboard.writeText(url); toast('انسخ الرابط ✔'); } } catch {}
  };
}

function Fav() {
  setTab('fav');
  const list = CARS.filter(c => favs.has(c.id));
  view.innerHTML = `<div class="sec"><h2>المفضلة</h2></div>` + (grid(list) || `<div class="empty"><b>ما عندك سيارات محفوظة</b>اضغط ♥ على أي سيارة تعجبك وتلقاها هنا.<br><br><a class="pill" href="#/cars">تصفّح السيارات</a></div>`);
}

function Companies() {
  setTab('companies');
  view.innerHTML = `
  <div class="banner"><h2>🏢 قطاع الشركات</h2><p>سيارات للإدارة، سيارات للمواقع، وباصات لنقل الموظفين. والدفع؟ كاش أو تمويل للشركات — وفريقنا معك من الطلب إلى التسليم.</p></div>
  <form class="pad" id="cf" novalidate>
    ${field('company', 'اسم الشركة / المؤسسة', 'text', 'organization')}
    ${field('name', 'اسم المسؤول', 'text', 'name')}
    ${field('phone', 'رقم الجوال', 'tel', 'tel', '05XXXXXXXX')}
    ${field('city', 'المدينة', 'text', 'address-level2')}
    <label class="f"><span>نوع السيارات المطلوبة</span>
      <div class="chips" style="padding:0;flex-wrap:wrap" id="kinds">${['سيارات للإدارة', 'سيارات للمواقع', 'باصات للموظفين', 'سيارات تجارية'].map(k => `<button type="button" class="chip" data-k="${k}">${k}</button>`).join('')}</div></label>
    ${field('count', 'العدد التقريبي', 'number', 'off')}
    ${paySeg()}
    <label class="f"><span>ملاحظات (اختياري)</span><textarea class="inp" name="notes"></textarea></label>
    <button class="btn gold block" type="submit">أرسل الطلب</button>
  </form>`;
  $('#kinds').onclick = e => { const b = e.target.closest('[data-k]'); if (b) b.classList.toggle('on'); };
  $('#cf').onsubmit = e => {
    e.preventDefault(); const f = e.target; const d = Object.fromEntries(new FormData(f));
    d.kinds = [...f.querySelectorAll('#kinds .on')].map(b => b.dataset.k).join('، ');
    if (!validate(f, d, ['company', 'name', 'phone', 'city'])) return;
    submitLead({ type: 'شركات', ...d }, f);
  };
}

function Contact() {
  setTab('contact');
  const br = C.branches || [];
  view.innerHTML = `
  <div class="sec"><h2>تواصل معنا</h2></div>
  <div class="list">
    <a class="row" href="tel:${esc(C.phone)}"><span style="font-size:22px">☎</span><div>الرقم الموحد<small style="direction:ltr;text-align:right">${esc(C.phone)}</small></div><span class="go">←</span></a>
    ${C.whatsapp ? `<a class="row" href="${waLink('السلام عليكم')}" target="_blank" rel="noopener"><span style="font-size:22px">💬</span><div>واتساب<small>رد سريع</small></div><span class="go">←</span></a>` : ''}
  </div>
  <div class="sec"><h2>الفروع</h2></div>
  ${br.length ? `<div class="list">${br.map(b => `<a class="row" href="${esc(b.map || '#')}" target="_blank" rel="noopener"><span style="font-size:22px">📍</span><div>${esc(b.name)}<small>${esc([b.city, b.address, b.hours].filter(Boolean).join(' · '))}</small></div><span class="go">←</span></a>`).join('')}</div>`
    : `<div class="empty" style="padding:24px"><b>قريبًا</b>مواقع الفروع ومواعيد العمل.</div>`}
  <div class="sec"><h2>عن التطبيق</h2></div>
  <div class="list"><a class="row" href="#/privacy"><span style="font-size:22px">🔒</span><div>سياسة الخصوصية</div><span class="go">←</span></a></div>
  <p class="count" style="text-align:center;margin-top:24px">ماكس موتورز · كاش أو تمويل</p>`;
}

function Privacy() {
  setTab('contact');
  view.innerHTML = `<section class="pad" style="line-height:1.9"><h1 style="font-size:24px;margin-bottom:10px">سياسة الخصوصية</h1>
  <p>نجمع فقط البيانات اللي تدخلها بنفسك في نماذج الطلب (الاسم، رقم الجوال، المدينة، طريقة الدفع، والملاحظات) لغرض التواصل معك بخصوص طلبك.</p>
  <p>ما نبيع بياناتك ولا نشاركها مع أي جهة خارجية إلا بالقدر اللازم لإتمام طلبك (مثل جهة التمويل عند اختيارك التمويل وبموافقتك).</p>
  <p>المفضلة محفوظة على جهازك فقط.</p>
  <p>لطلب حذف بياناتك أو أي استفسار: <a href="tel:${esc(C.phone)}" style="color:var(--gold)">${esc(C.phone)}</a></p></section>`;
}

// ---------- forms ----------
function field(name, label, type = 'text', ac = 'on', ph = '') {
  return `<label class="f"><span>${label}</span><input class="inp" name="${name}" type="${type}" autocomplete="${ac}" ${ph ? `placeholder="${ph}"` : ''} ${type === 'tel' ? 'inputmode="tel" dir="ltr"' : ''} ${type === 'number' ? 'inputmode="numeric" min="1"' : ''}><div class="err" data-err="${name}"></div></label>`;
}
function paySeg() {
  return `<label class="f"><span>طريقة الدفع</span><div class="seg"><label><input type="radio" name="pay" value="كاش" checked><span>كاش</span></label><label><input type="radio" name="pay" value="تمويل"><span>تمويل</span></label></div></label>`;
}
function validate(f, d, req) {
  let ok = true; f.querySelectorAll('.err').forEach(e => e.textContent = '');
  req.forEach(k => { if (!String(d[k] || '').trim()) { ok = false; const e = f.querySelector(`[data-err="${k}"]`); if (e) e.textContent = 'مطلوب'; } });
  if (d.phone) { const p = d.phone.replace(/[\s-]/g, '').replace(/^\+?966/, '0'); if (!/^05\d{8}$/.test(p)) { ok = false; f.querySelector('[data-err="phone"]').textContent = 'اكتب رقم جوال صحيح يبدأ بـ 05'; } else d.phone = p; }
  if (!ok) f.querySelector('.err:not(:empty)')?.closest('label')?.querySelector('input')?.focus();
  return ok;
}
function leadForm(c) {
  openSheet(`<div><div class="grab"></div><h2>اطلب ${esc(c.brand + ' ' + c.model)}</h2><p class="sub">عبّ بياناتك وفريقنا يتواصل معك.</p>
  <form id="lf" novalidate>${field('name', 'الاسم', 'text', 'name')}${field('phone', 'رقم الجوال', 'tel', 'tel', '05XXXXXXXX')}${field('city', 'المدينة', 'text', 'address-level2')}${paySeg()}
  <label class="f"><span>ملاحظات (اختياري)</span><textarea class="inp" name="notes" placeholder="مثلاً: اللون المفضّل، وقت التواصل المناسب"></textarea></label>
  <button class="btn gold block" type="submit">أرسل الطلب</button></form></div>`);
  $('#lf').onsubmit = e => { e.preventDefault(); const f = e.target; const d = Object.fromEntries(new FormData(f)); if (!validate(f, d, ['name', 'phone', 'city'])) return; submitLead({ type: 'طلب سيارة', car: `${c.brand} ${c.model} ${c.year}`, carId: c.id, ...d }, f); };
}
function leadText(d) {
  const L = { type: 'النوع', car: 'السيارة', company: 'الشركة', name: 'الاسم', phone: 'الجوال', city: 'المدينة', kinds: 'المطلوب', count: 'العدد', pay: 'الدفع', notes: 'ملاحظات' };
  return 'طلب جديد من تطبيق ماكس موتورز\n' + Object.entries(L).filter(([k]) => d[k]).map(([k, l]) => `${l}: ${d[k]}`).join('\n');
}
function waLink(text) { return `https://wa.me/${encodeURIComponent(C.whatsapp)}?text=${encodeURIComponent(text)}`; }
async function submitLead(d, form) {
  const btn = form.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = 'جاري الإرسال…';
  d.at = new Date().toISOString();
  let sent = false;
  if (C.leadEndpoint) { try { const r = await fetch(C.leadEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); sent = r.ok; } catch {} }
  const box = form.closest('.sheet>div') || form;
  if (sent) { box.innerHTML = doneHTML('وصلنا طلبك ✔', 'فريق ماكس موتورز بيتواصل معك قريب على رقمك.'); return; }
  if (C.whatsapp) { window.open(waLink(leadText(d)), '_blank', 'noopener'); box.innerHTML = doneHTML('كمّل الإرسال في واتساب', 'فتحنا لك واتساب والرسالة جاهزة، اضغط إرسال.'); return; }
  box.innerHTML = doneHTML('خلّنا نكمّل بالاتصال', 'اتصل على الرقم الموحد ونخدمك مباشرة.', `<a class="btn gold block" href="tel:${esc(C.phone)}" style="margin-top:14px">☎ اتصل ${esc(C.phone)}</a>`);
}
function doneHTML(t, s, extra = '') { return `<div class="done"><div class="ok">✔</div><h2>${t}</h2><p class="sub">${s}</p>${extra}<button class="btn dark block" style="margin-top:10px" onclick="document.getElementById('sheet').hidden=true">تم</button></div>`; }
function openSheet(html) { sheet.innerHTML = html; sheet.hidden = false; sheet.querySelector('input')?.focus({ preventScroll: true }); }
sheet.addEventListener('click', e => { if (e.target === sheet) sheet.hidden = true; });
document.addEventListener('keydown', e => { if (e.key === 'Escape') sheet.hidden = true; });

// favorites (delegated)
document.addEventListener('click', e => {
  const h = e.target.closest('[data-fav]'); if (!h) return; e.preventDefault(); e.stopPropagation();
  const id = h.dataset.fav; if (favs.has(id)) { favs.delete(id); toast('انشالت من المفضلة'); } else { favs.add(id); toast('انضافت للمفضلة ♥'); }
  saveFavs(); document.querySelectorAll(`[data-fav="${CSS.escape(id)}"]`).forEach(b => b.classList.toggle('on', favs.has(id)));
  if (location.hash.startsWith('#/fav')) Fav();
});

// ---------- router ----------
function route() {
  sheet.hidden = true;
  const h = location.hash.replace(/^#/, '') || '/'; const path = h.split('?')[0];
  if (path.startsWith('/car/')) Car(decodeURIComponent(path.slice(5)));
  else if (path === '/cars') Cars();
  else if (path === '/fav') Fav();
  else if (path === '/companies') Companies();
  else if (path === '/contact') Contact();
  else if (path === '/privacy') Privacy();
  else Home();
  if (!path.startsWith('/cars') || !h.includes('?')) window.scrollTo(0, 0);
}
view.innerHTML = `<div class="grid" style="margin-top:16px">${'<div class="skeleton"></div>'.repeat(4)}</div>`;
ready.then(() => { window.addEventListener('hashchange', route); route(); })
     .catch(() => { view.innerHTML = `<div class="empty"><b>تعذّر التحميل</b>تأكد من الاتصال وحاول مرة ثانية.</div>`; });

if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
