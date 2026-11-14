// motion-graphics renderers for film.html: each type has init(el, m) once and draw(el, m, lt, D, t) per frame
(() => {
  const MG = window.MG, R = () => `cars/${new URLSearchParams(location.search).get('car') || 'hilux27'}/`;
  const clamp = (v, a = 0, c = 1) => Math.min(c, Math.max(a, v)), prog = (t, a, c) => clamp((t - a) / (c - a));
  const E = { out: k => 1 - Math.pow(1 - k, 3), in: k => k * k * k, io: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2, sine: k => 0.5 - 0.5 * Math.cos(Math.PI * k),
    back: k => { const c = 1.6; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); } };
  const at = (t, a, c, e = 'out') => E[e](prog(t, a, c));
  const H = s => (s || '').replace(/<acc>/g, '<span class="acc">').replace(/<\/acc>/g, '</span>').replace(/\[([^\]]+)\]/g, '<span class="os">$1</span>');
  const q = (el, s) => el.querySelector(s), css = (el, o) => Object.assign(el.style, o);
  const dec = el => el.decode ? el.decode().catch(() => {}) : Promise.resolve();

  // big number counting up inside a drawing gauge arc, unit and a spec line under it
  MG.counter = {
    init(el, m) {
      el.innerHTML = `<svg class="full" viewBox="0 0 1080 1920" style="position:absolute;inset:0"><g class="arc"></g></svg>
        <div class="num" style="position:absolute;left:0;right:0;top:${m.y - 120}px;text-align:center;font:400 250px/1 Anton;letter-spacing:4px;direction:ltr;background:linear-gradient(#FFF6E2,#E8C27A 55%,#9C7436);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 10px 30px rgba(0,0,0,.6))"></div>
        <div class="u t2" style="position:absolute;left:0;right:0;top:${m.y + 150}px;text-align:center;font:900 70px Cairo;text-shadow:0 6px 30px #000">${H(m.unit)}</div>
        <div class="s" style="position:absolute;left:0;right:0;top:${m.y + 255}px;text-align:center;font:500 38px Tajawal;color:#E9E3D8;text-shadow:0 3px 18px #000">${H(m.sub || '')}</div>`;
    },
    draw(el, m, lt) {
      const kc = at(lt, m.c0 ?? 0.2, (m.c0 ?? 0.2) + (m.cnt ?? 1.1), 'out'), v = m.dec ? (m.num * kc).toFixed(m.dec) : Math.round(m.num * kc), cy = m.y + 5, r = 230;
      q(el, '.num').textContent = lt >= (m.c0 ?? 0.2) ? v : '';
      const a0 = 140, a1 = 400, aa = a0 + (a1 - a0) * kc, P = d => [540 + r * Math.cos(d * Math.PI / 180), cy + r * Math.sin(d * Math.PI / 180)];
      const arc = (d0, d1) => { const [x0, y0] = P(d0), [x1, y1] = P(d1); return `M${x0} ${y0} A${r} ${r} 0 ${d1 - d0 > 180 ? 1 : 0} 1 ${x1} ${y1}`; };
      let g = `<path d="${arc(a0, a1)}" style="fill:none;stroke:rgba(255,255,255,.12);stroke-width:10;stroke-linecap:round;opacity:${at(lt, 0, 0.3)}"/>`;
      if (kc > 0.01) g += `<path d="${arc(a0, aa)}" style="fill:none;stroke:var(--acc);stroke-width:10;stroke-linecap:round;filter:drop-shadow(0 0 14px var(--acc))"/>`;
      for (let i = 0; i <= 26; i++) { const d = a0 + (a1 - a0) * i / 26, [x0, y0] = P(d), rr = r - (i % 5 ? 22 : 34), x1 = 540 + rr * Math.cos(d * Math.PI / 180), y1 = cy + rr * Math.sin(d * Math.PI / 180);
        g += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" style="stroke:${i / 26 <= kc ? '#fff' : 'rgba(255,255,255,.25)'};stroke-width:${i % 5 ? 3 : 5};opacity:${at(lt, 0, 0.4)}"/>`; }
      q(el, '.arc').innerHTML = g;
      const ku = at(lt, (m.c0 ?? 0.2) + (m.cnt ?? 1.1) - 0.2, (m.c0 ?? 0.2) + (m.cnt ?? 1.1) + 0.25, 'out'), ks = at(lt, (m.c0 ?? 0.2) + (m.cnt ?? 1.1) + 0.1, (m.c0 ?? 0.2) + (m.cnt ?? 1.1) + 0.5, 'out');
      css(q(el, '.u'), { opacity: ku, transform: `translateY(${(1 - ku) * 24}px)` }); css(q(el, '.s'), { opacity: ks, transform: `translateY(${(1 - ks) * 24}px)` });
      const land = (m.c0 ?? 0.2) + (m.cnt ?? 1.1); return { fl: lt > land && lt < land + 0.12 ? 0.25 * (1 - (lt - land) / 0.12) : 0 };
    } };

  // model wordmark: the official logo (white) is revealed by a light blade, year tracks in, Arabic line under
  MG.title = {
    async init(el, m) {
      el.innerHTML = `<div class="lw" style="position:absolute;left:${540 - m.w / 2}px;top:${m.y}px;width:${m.w}px">
          <img class="lg" src="${R()}${m.logo}" alt="" style="width:100%;display:block;filter:invert(1) drop-shadow(0 8px 30px rgba(0,0,0,.6))">
          <div class="sw" style="position:absolute;inset:0;-webkit-mask:url(${R()}${m.logo}) center/100% 100% no-repeat;mask:url(${R()}${m.logo}) center/100% 100% no-repeat"></div></div>
        <div class="yr" style="position:absolute;left:0;right:0;top:${m.y + m.h + 34}px;text-align:center;font:400 64px Michroma;color:var(--acc);direction:ltr;letter-spacing:22px;padding-left:22px">${m.year || ''}</div>
        <div class="ar t3" style="position:absolute;left:0;right:0;top:${m.y + m.h + 130}px;text-align:center;font:900 54px Cairo;text-shadow:0 4px 24px #000">${H(m.ar || '')}</div>`;
      await dec(q(el, '.lg'));
    },
    draw(el, m, lt, D) {
      const k = at(lt, 0.0, 0.7, 'out'), out = 1 - at(lt, D - 0.35, D, 'in');
      css(q(el, '.lw'), { opacity: Math.min(k, out), transform: `scale(${1.12 - 0.12 * k})`, filter: k < 1 ? `blur(${(1 - k) * 12}px)` : '' });
      const s = prog(lt, 0.5, 1.4); q(el, '.sw').style.background = s > 0 && s < 1 ? `linear-gradient(105deg,rgba(255,255,255,0) ${-30 + 160 * s - 14}%,rgba(255,244,220,1) ${-30 + 160 * s}%,rgba(255,255,255,0) ${-30 + 160 * s + 14}%)` : 'none';
      const ky = at(lt, 0.5, 1.1, 'out'); css(q(el, '.yr'), { opacity: Math.min(ky, out), letterSpacing: `${22 + 40 * (1 - ky)}px` });
      const ka = at(lt, 0.8, 1.3, 'out'); css(q(el, '.ar'), { opacity: Math.min(ka, out), transform: `translateY(${(1 - ka) * 26}px)` });
      return { fl: lt < 0.1 ? 0.35 * (1 - lt / 0.1) : 0 };
    } };

  // spec chips popping in one after another
  MG.chips = {
    init(el, m) { el.innerHTML = `<div style="position:absolute;left:40px;right:40px;top:${m.y}px;text-align:center;direction:rtl;line-height:2.4">${m.items.map((c, i) => `<span class="chip" data-i="${i}" style="opacity:0">${H(c)}</span>`).join('')}</div>`; },
    draw(el, m, lt, D) { el.querySelectorAll('.chip').forEach((c, i) => { const k = at(lt, (m.s0 ?? 0.2) + i * (m.st ?? 0.22), (m.s0 ?? 0.2) + i * (m.st ?? 0.22) + 0.4, 'back'), o = 1 - at(lt, D - 0.3, D, 'in'); css(c, { opacity: clamp(k) * o, transform: `translateY(${(1 - k) * 30}px) scale(${0.85 + 0.15 * clamp(k, 0, 1.2)})` }); }); } };

  // anamorphic flare streak sweeping across the frame (a premium "light sweep" accent)
  MG.flare = {
    init(el, m) { el.innerHTML = `<div class="f" style="position:absolute;left:-600px;top:${m.y - 3}px;width:2280px;height:6px;background:linear-gradient(90deg,rgba(120,170,255,0),rgba(170,210,255,.9) 50%,rgba(120,170,255,0));filter:blur(2px);mix-blend-mode:screen"></div>
      <div class="g" style="position:absolute;top:${m.y - 120}px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,rgba(255,240,210,.85),rgba(255,200,120,.25) 35%,rgba(255,180,90,0) 70%);mix-blend-mode:screen"></div>`; },
    draw(el, m, lt, D) { const k = E.io(prog(lt, 0, D)), x = (m.x0 ?? -200) + ((m.x1 ?? 1280) - (m.x0 ?? -200)) * k, a = Math.sin(Math.PI * prog(lt, 0, D));
      css(q(el, '.g'), { left: (x - 120) + 'px', opacity: a }); css(q(el, '.f'), { opacity: a * 0.9 }); } };

  // versions: two official looks stacked, a label over each, title + note
  MG.versions = {
    async init(el, m) {
      el.innerHTML = `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 90% 60% at 50% 50%,#1b1d21,#060607)"></div>
        <div class="k tx" style="top:200px">${m.kicker || ''}</div><div class="tt tx t2" style="top:240px">${H(m.title)}</div>
        ${m.cars.map((c, i) => `<div class="lb${i}" style="position:absolute;left:0;right:0;top:${i ? 1060 : 430}px;text-align:center"><span style="display:inline-block;padding:12px 44px;border-radius:44px;background:${i ? 'var(--acc)' : '#f2efe8'};color:#111;font:900 50px Cairo">${H(c.label)}</span></div>
          <img class="cv${i}" src="${R()}${c.img}" alt="" style="position:absolute;width:880px">`).join('')}
        <div class="nt tx sp" style="top:1660px;font-size:32px;white-space:normal;padding:0 100px">${H(m.note || '')}</div>`;
      await Promise.all([0, 1].map(i => dec(q(el, '.cv' + i))));
    },
    draw(el, m, lt, D) {
      const kt = at(lt, 0.05, 0.5, 'out'); css(q(el, '.tt'), { opacity: kt, transform: `translateY(${(1 - kt) * 24}px)` }); css(q(el, '.k'), { opacity: kt });
      [[0, 500, 0.3, -1], [1, 1130, 0.75, 1]].forEach(([i, y, t0, dir]) => { const im = q(el, '.cv' + i), ch = 880 * im.naturalHeight / (im.naturalWidth || 1), k = at(lt, t0, t0 + 0.7, 'out');
        css(im, { left: (100 + dir * (1 - k) * 260 + dir * 12 * prog(lt, t0 + 0.7, D)) + 'px', top: (y + 500 - ch) + 'px', opacity: k, filter: 'drop-shadow(0 26px 22px rgba(0,0,0,.5))' });
        const kl = at(lt, t0 + 0.35, t0 + 0.75, 'back'); css(q(el, '.lb' + i), { opacity: clamp(kl), transform: `translateY(${(1 - kl) * 30}px) scale(${0.8 + 0.2 * kl})` }); });
      const kn = at(lt, 1.6, 2.0, 'out'); css(q(el, '.nt'), { opacity: kn });
    } };

  // engine line-up: the shown car once, then one glass row per engine (the shown one highlighted), title + note
  MG.engines = {
    async init(el, m) {
      const ry = m.ry ?? (m.img ? 1000 : 760), bg = m.dim ? `radial-gradient(ellipse 90% 60% at 50% 45%,rgba(8,8,9,${m.dim}),rgba(4,4,5,${Math.min(0.95, m.dim + 0.25)}))` : 'radial-gradient(ellipse 90% 60% at 50% 42%,#1b1d21,#060607)';
      el.innerHTML = `<div class="bgd" style="position:absolute;inset:0;background:${bg}"></div>
        <div class="k tx" style="top:${m.img ? 200 : 420}px">${m.kicker || ''}</div><div class="tt tx t2" style="top:${m.img ? 240 : 460}px">${H(m.title)}</div>
        ${m.img ? `<img class="cv" src="${R()}${m.img}" alt="" style="position:absolute;left:110px;top:420px;width:860px;filter:drop-shadow(0 30px 26px rgba(0,0,0,.6))">` : ''}
        ${m.rows.map((r, i) => `<div class="r${i}" style="position:absolute;left:90px;right:90px;top:${ry + i * 150}px;height:124px;border-radius:24px;display:flex;align-items:center;justify-content:space-between;padding:0 40px;box-sizing:border-box;direction:rtl;
          background:${i ? 'linear-gradient(90deg,rgba(20,22,25,.92),rgba(30,32,36,.85))' : 'linear-gradient(90deg,rgba(212,175,106,.28),rgba(212,175,106,.12))'};box-shadow:inset 0 0 0 ${i ? 1.5 : 2.5}px ${i ? 'rgba(255,255,255,.14)' : 'var(--acc)'}">
          <span style="font:900 44px Cairo;color:#fff">${H(r[0])}</span><span style="font:700 36px Tajawal;color:${i ? '#D9D3C9' : 'var(--acc)'}">${H(r[1])}</span></div>`).join('')}
        <div class="nt tx sp" style="top:${ry + m.rows.length * 150 + 10}px;font-size:32px">${H(m.note || '')}</div>`;
      if (m.img) await dec(q(el, '.cv'));
    },
    draw(el, m, lt, D) {
      const kt = at(lt, 0.05, 0.5, 'out'); css(q(el, '.tt'), { opacity: kt, transform: `translateY(${(1 - kt) * 24}px)` }); css(q(el, '.k'), { opacity: kt });
      css(q(el, '.bgd'), { opacity: at(lt, 0, 0.4, 'out') });
      const kc = at(lt, 0.15, 0.9, 'out'); if (m.img) css(q(el, '.cv'), { opacity: kc, transform: `translateX(${(1 - kc) * 220}px) scale(${0.96 + 0.04 * kc})` });
      m.rows.forEach((_, i) => { const k = at(lt, 0.7 + i * 0.25, 1.1 + i * 0.25, 'back'); css(q(el, '.r' + i), { opacity: clamp(k), transform: `translateX(${(1 - clamp(k)) * -60}px)` }); });
      css(q(el, '.nt'), { opacity: at(lt, 1.6, 2.0, 'out') });
    } };

  // end card: logo glint, CTA, call number, WhatsApp pill, site
  MG.end = {
    async init(el, m) {
      const bg = m.dim ? `radial-gradient(ellipse 80% 55% at 50% 42%,rgba(14,14,16,${m.dim}),rgba(4,4,5,${Math.min(0.97, m.dim + 0.2)}) 75%)` : 'radial-gradient(ellipse 80% 55% at 50% 42%,#17181c,#050506 75%)';
      el.innerHTML = `<div class="bgd" style="position:absolute;inset:0;background:${bg}"></div>
        <img class="lg" src="fx/mm_logo.png" alt="Max Motors" style="position:absolute;left:340px;top:420px;width:400px">
        <div class="sw" style="position:absolute;left:340px;top:420px;width:400px;height:325px;mix-blend-mode:screen;-webkit-mask:url(fx/mm_logo.png) center/contain no-repeat"></div>
        <div class="e1 tx t2" style="top:900px;font-size:66px">${H(m.name)}</div>
        <div class="e2 tx sp" style="top:1010px">${H(m.cta)}</div>
        <div class="e3 tx os" style="top:1090px;font:600 128px Oswald;letter-spacing:3px">920018915</div>
        <div class="e4" style="${m.wa === false ? 'visibility:hidden;' : ''}position:absolute;left:270px;top:1280px;width:540px;height:104px;border-radius:52px;background:var(--acc);display:flex;align-items:center;justify-content:center;gap:18px;color:#061018">
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#061018" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path></svg>
          <span class="os" style="font-size:56px;font-weight:700">0533393397</span></div>
        <div class="e5 tx os" style="top:${m.wa === false ? 1290 : 1420}px;font:600 42px Oswald;letter-spacing:3px;opacity:.85">maxmotors.sa</div>`;
      await dec(q(el, '.lg'));
    },
    draw(el, m, lt) {
      css(q(el, '.bgd'), { opacity: at(lt, 0, 0.5, 'out') });
      const lk = at(lt, 0.2, 1.0, 'out'); css(q(el, '.lg'), { opacity: lk, transform: `scale(${0.86 + 0.14 * lk})`, filter: `blur(${(1 - lk) * 8}px)` });
      const s = prog(lt, 0.9, 1.7); q(el, '.sw').style.background = s > 0 && s < 1 ? `linear-gradient(105deg,rgba(255,255,255,0) ${-20 + 140 * s - 15}%,rgba(255,250,235,.95) ${-20 + 140 * s}%,rgba(255,255,255,0) ${-20 + 140 * s + 15}%)` : 'none';
      [['e1', 0.9], ['e2', 1.1], ['e3', 1.3], ['e4', 1.5], ['e5', 1.7]].forEach(([c, a]) => { const k = at(lt, a, a + 0.45, 'out'); css(q(el, '.' + c), { opacity: k, transform: `translateY(${(1 - k) * 22}px)` }); });
    } };
})();
