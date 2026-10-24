'use strict';
// ظلال القاهرة ١٨٠٥ — نموذج لعبة تسلل واغتيال في القاهرة العثمانية
(() => {
  // ---------- أدوات ----------
  const T = 32;          // حجم البلاطة
  const H = 12;          // ارتفاع البيوت (منظور ٣/٤)
  const TOWER_Z = 56;    // ارتفاع شرفة المئذنة
  const MW = 60, MH = 44;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
  const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
  const toAr = n => String(n).replace(/\d/g, d => AR_DIGITS[d]);
  function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash2(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
  const shadeCache = new Map();
  function shade(hex, f) {
    const key = hex + f; let v = shadeCache.get(key); if (v) return v;
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    if (f < 1) { r *= f; g *= f; b *= f; } else { r += (255 - r) * (f - 1); g += (255 - g) * (f - 1); b += (255 - b) * (f - 1); }
    v = `rgb(${r | 0},${g | 0},${b | 0})`; shadeCache.set(key, v); return v;
  }

  // ---------- الخريطة ----------
  // . شارع  , بلاط  # بيت  M الأزهر  T مئذنة  W سور  ~ الخليج  = كوبري
  // S دكان  H عربية قش  F سبيل  P نخلة  G باب القلعة  D البيت الآمن
  const map = [], bid = [];
  for (let y = 0; y < MH; y++) { map.push(new Array(MW).fill('.')); bid.push(new Array(MW).fill(-1)); }
  let nextBid = 0;
  function fill(x0, y0, w, h, ch) {
    const id = (ch === '#' || ch === 'M') ? nextBid++ : -1;
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { map[y][x] = ch; bid[y][x] = id; }
  }
  function put(x, y, ch) { map[y][x] = ch; bid[y][x] = -1; }
  (function buildMap() {
    const rnd = mulberry32(1805);
    for (let x = 0; x < MW; x++) { put(x, 0, 'W'); put(x, MH - 1, 'W'); }
    for (let y = 0; y < MH; y++) { put(0, y, 'W'); put(MW - 1, y, 'W'); }
    fill(3, 1, 2, MH - 2, '~');
    for (const y of [15, 16, 17, 29, 30, 31, 39, 40, 41]) { put(3, y, '='); put(4, y, '='); }
    const COLS = [[7, 12], [14, 19], [23, 28], [30, 35], [38, 45], [49, 53], [55, 58]];
    const ROWS = [[3, 8], [10, 14], [18, 22], [24, 28], [32, 37]];
    COLS.forEach(([x0, x1], ci) => ROWS.forEach(([y0, y1], ri) => {
      if ((ci === 1 || ci === 2) && (ri === 2 || ri === 3)) return; // خان الخليلي
      if (ci === 4 && (ri === 1 || ri === 2)) return;               // الأزهر
      const w = x1 - x0 + 1, h = y1 - y0 + 1;
      if (rnd() < 0.5) { const s = 2 + Math.floor(rnd() * (w - 3)); fill(x0, y0, s, h, '#'); fill(x0 + s, y0, w - s, h, '#'); }
      else { const s = 2 + Math.floor(rnd() * (h - 3)); fill(x0, y0, w, s, '#'); fill(x0, y0 + s, w, h - s, '#'); }
    }));
    fill(14, 18, 15, 11, ',');
    fill(38, 10, 8, 13, 'M');
    fill(40, 13, 4, 7, ',');
    put(38, 16, ','); put(39, 16, ',');
    put(45, 11, 'T');
    put(42, 15, 'F');
    for (let y = 3; y <= 8; y++) put(10, y, '.');
    for (let x = 49; x <= 53; x++) put(x, 20, '.');
    for (let y = 32; y <= 37; y++) put(26, y, '.');
    fill(32, 25, 2, 3, '.'); put(32, 26, 'H');
    for (const y of [20, 26]) for (const x of [14, 17, 24, 27]) { put(x, y, 'S'); put(x + 1, y, 'S'); }
    put(21, 23, 'F');
    for (const [x, y] of [[1, 4], [1, 9], [2, 13], [1, 20], [2, 26], [1, 34], [2, 38], [14, 18], [28, 18], [14, 28], [28, 28]]) put(x, y, 'P');
    for (const [x, y] of [[6, 12], [22, 9], [13, 25], [36, 20], [46, 12], [29, 33], [48, 35], [37, 4], [5, 30], [57, 30], [54, 15], [2, 22]]) put(x, y, 'H');
    put(54, 6, 'D');
    for (let x = 55; x <= 58; x++) put(x, 42, 'G');
  })();

  const GROUND = new Set(['.', ',', '=', 'H', 'G', 'D']);
  const ROOF = new Set(['#', 'M']);
  const BLOCK_SIGHT = new Set(['#', 'M', 'T', 'W']);
  const TOWER_ONLY = new Set(['T', 'W']);
  const SHADOWER = new Set(['#', 'M', 'T', 'W']);
  const tileAt = (tx, ty) => (tx < 0 || ty < 0 || tx >= MW || ty >= MH) ? 'W' : map[ty][tx];
  const tileAtPx = (x, y) => tileAt(Math.floor(x / T), Math.floor(y / T));
  const walkGround = c => GROUND.has(c);
  const walkRoof = c => ROOF.has(c);
  const DOOR = { x: 54.5 * T, y: 6.5 * T };
  const GATE = { x: 56.5 * T, y: 42.5 * T };
  const MINARET = { x: 45.5 * T, y: 11.5 * T };

  // ---------- البحث عن طريق (A*) ----------
  const N = MW * MH;
  const gw = new Uint8Array(N);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) gw[y * MW + x] = GROUND.has(map[y][x]) ? 1 : 0;
  const gScore = new Float32Array(N), came = new Int32Array(N), stamp = new Uint32Array(N), closed = new Uint32Array(N);
  let gen = 0;
  const DIRS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
  function astar(sx, sy, gx, gy) {
    const start = sy * MW + sx, goal = gy * MW + gx;
    if (!gw[goal]) return null;
    if (start === goal) return [[gx, gy]];
    gen++;
    const heap = [];
    const hpush = (f, i) => { heap.push([f, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
    const hpop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
    const hFn = i => { const dx = Math.abs(i % MW - gx), dy = Math.abs(((i / MW) | 0) - gy); return Math.max(dx, dy) + 0.414 * Math.min(dx, dy); };
    stamp[start] = gen; gScore[start] = 0; came[start] = -1; hpush(hFn(start), start);
    let iter = 0;
    while (heap.length && iter++ < 4000) {
      const [, cur] = hpop();
      if (cur === goal) break;
      if (closed[cur] === gen) continue;
      closed[cur] = gen;
      const cx = cur % MW, cy = (cur / MW) | 0;
      for (const [dx, dy, cost] of DIRS) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue;
        const ni = ny * MW + nx;
        if (!gw[ni]) continue;
        if (dx && dy && (!gw[cy * MW + nx] || !gw[ny * MW + cx])) continue;
        const ng = gScore[cur] + cost;
        if (stamp[ni] !== gen || ng < gScore[ni]) { stamp[ni] = gen; gScore[ni] = ng; came[ni] = cur; hpush(ng + hFn(ni), ni); }
      }
    }
    if (stamp[goal] !== gen) return null;
    const path = []; let c = goal;
    while (c !== start && c !== -1) { path.push([c % MW, (c / MW) | 0]); c = came[c]; }
    return path.reverse();
  }
  function nearestGround(tx, ty) {
    if (gw[ty * MW + tx]) return [tx, ty];
    for (let r = 1; r <= 4; r++) {
      let best = null, bd = 1e9;
      for (let y = ty - r; y <= ty + r; y++) for (let x = tx - r; x <= tx + r; x++) {
        if (x < 0 || y < 0 || x >= MW || y >= MH || !gw[y * MW + x]) continue;
        const d = Math.hypot(x - tx, y - ty); if (d < bd) { bd = d; best = [x, y]; }
      }
      if (best) return best;
    }
    return null;
  }
  // البلاطات اللي توصلها من نقطة البداية (للأهالي)
  const streetTiles = [];
  (function () {
    const seen = new Uint8Array(N), q = [1 * MW + 6]; seen[q[0]] = 1;
    while (q.length) {
      const i = q.pop(), x = i % MW, y = (i / MW) | 0;
      if (map[y][x] === '.' || map[y][x] === ',') streetTiles.push([x, y]);
      for (const [dx, dy] of DIRS.slice(0, 4)) { const ni = (y + dy) * MW + x + dx; if (gw[ni] && !seen[ni]) { seen[ni] = 1; q.push(ni); } }
    }
  })();

  function los(x0, y0, x1, y1, blockSet) {
    const n = Math.ceil(dist(x0, y0, x1, y1) / 8);
    for (let i = 1; i < n; i++) { const t = i / n; if (blockSet.has(tileAtPx(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t))) return false; }
    return true;
  }

  // ---------- الصوت (مقام حجاز ودف) ----------
  const Sound = {
    ctx: null, muted: false,
    init() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      try { this.ctx = new AC(); } catch (e) { return; }
      const c = this.ctx;
      this.master = c.createGain(); this.master.gain.value = this.muted ? 0 : 0.7; this.master.connect(c.destination);
      this.music = c.createGain(); this.music.gain.value = 0.32; this.music.connect(this.master);
      this.sfx = c.createGain(); this.sfx.gain.value = 0.9; this.sfx.connect(this.master);
      const buf = c.createBuffer(1, c.sampleRate, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
      [73.42, 110].forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.value = i ? 0.04 : 0.07; o.connect(g); g.connect(this.music); o.start(); });
      this.nextNote = c.currentTime + 0.4; this.nextBeat = c.currentTime + 0.4; this.beatI = 0; this.mi = 4;
    },
    setMuted(m) { this.muted = m; if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.7, this.ctx.currentTime, 0.05); },
    tone(f, dur, { type = 'sine', vol = 0.2, to = null, delay = 0, bus = null, attack = 0.005 } = {}) {
      const c = this.ctx; if (!c) return; const t = c.currentTime + delay;
      const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
      if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(bus || this.sfx); o.start(t); o.stop(t + dur + 0.05);
    },
    noise(dur, { vol = 0.3, freq = 1000, type = 'lowpass', q = 1, delay = 0, bus = null, to = null } = {}) {
      const c = this.ctx; if (!c) return; const t = c.currentTime + delay;
      const s = c.createBufferSource(); s.buffer = this.noiseBuf;
      const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur); f.Q.value = q;
      const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(bus || this.sfx); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
    },
    pluck(f, t, vol) { // صوت قريب من العود
      const c = this.ctx, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
      o.type = 'sawtooth'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f * 1.004;
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(2400, t); lp.frequency.exponentialRampToValueAtTime(450, t + 0.6);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(this.music); o.start(t); o2.start(t); o.stop(t + 1.2); o2.stop(t + 1.2);
    },
    update(tension) {
      const c = this.ctx; if (!c || this.muted || c.state !== 'running') return;
      const now = c.currentTime;
      if (this.nextNote < now - 0.3) this.nextNote = now + 0.05;
      if (this.nextBeat < now - 0.3) this.nextBeat = now + 0.05;
      const scale = [146.83, 155.56, 185.0, 196.0, 220.0, 233.08, 261.63, 293.66, 311.13, 369.99, 392.0];
      while (this.nextNote < now + 0.15) {
        if (Math.random() > (tension ? 0.12 : 0.3)) {
          this.mi = clamp(this.mi + Math.floor(Math.random() * 5) - 2, 0, scale.length - 1);
          this.pluck(scale[this.mi], this.nextNote, tension ? 0.1 : 0.075);
        }
        this.nextNote += tension ? 0.17 : 0.32 + Math.random() * 0.25;
      }
      const pat = tension ? [1, 0, 2, 0, 2, 1, 0, 2] : [1, 0, 0, 2, 0, 0, 2, 0];
      const len = tension ? 0.16 : 0.3;
      while (this.nextBeat < now + 0.15) {
        const b = pat[this.beatI % pat.length], dl = Math.max(0, this.nextBeat - now);
        if (b === 1) this.tone(95, 0.25, { to: 50, vol: tension ? 0.32 : 0.14, delay: dl, bus: this.music });
        if (b === 2) this.noise(0.06, { vol: tension ? 0.16 : 0.06, freq: 3000, type: 'highpass', delay: dl, bus: this.music });
        this.beatI++; this.nextBeat += len;
      }
    },
  };
  function sfx(n) {
    if (!Sound.ctx) return;
    const S = Sound;
    switch (n) {
      case 'kill': S.noise(0.18, { vol: 0.4, freq: 3000, to: 600, type: 'bandpass', q: 2 }); S.tone(120, 0.25, { type: 'square', vol: 0.1, to: 50, delay: 0.05 }); break;
      case 'alert': S.tone(440, 0.16, { type: 'square', vol: 0.1 }); S.tone(660, 0.3, { type: 'square', vol: 0.1, delay: 0.12 }); break;
      case 'sus': S.tone(520, 0.12, { type: 'triangle', vol: 0.07, to: 720 }); break;
      case 'jump': S.noise(0.25, { vol: 0.13, freq: 600, to: 2000, type: 'bandpass' }); break;
      case 'land': S.noise(0.12, { vol: 0.2, freq: 400 }); break;
      case 'climb': S.noise(0.09, { vol: 0.12, freq: 900, type: 'bandpass' }); S.noise(0.09, { vol: 0.12, freq: 900, type: 'bandpass', delay: 0.16 }); break;
      case 'hay': S.noise(0.35, { vol: 0.22, freq: 2500, type: 'highpass' }); break;
      case 'hit': S.tone(180, 0.15, { type: 'sawtooth', vol: 0.18, to: 80 }); S.noise(0.1, { vol: 0.3, freq: 800 }); break;
      case 'clang': S.tone(1200, 0.3, { type: 'triangle', vol: 0.14 }); S.tone(1810, 0.25, { vol: 0.07 }); S.noise(0.08, { vol: 0.25, freq: 5000, type: 'highpass' }); break;
      case 'sync': [293.66, 369.99, 440, 587.33].forEach((f, i) => S.tone(f, 1.6, { vol: 0.11, delay: i * 0.12, attack: 0.08 })); break;
      case 'arrow': S.noise(0.2, { vol: 0.12, freq: 4000, to: 1500, type: 'bandpass', q: 4 }); break;
      case 'win': [293.66, 369.99, 440, 587.33, 739.99].forEach((f, i) => S.tone(f, 1.2, { type: 'triangle', vol: 0.11, delay: i * 0.15 })); break;
      case 'fail': [293.66, 277.18, 220, 146.83].forEach((f, i) => S.tone(f, 0.8, { type: 'sawtooth', vol: 0.07, delay: i * 0.22 })); break;
      case 'leap': S.noise(0.9, { vol: 0.2, freq: 400, to: 3000, type: 'bandpass' }); break;
      case 'scream': S.tone(900, 0.4, { type: 'sawtooth', vol: 0.04, to: 600 }); break;
    }
  }

  // ---------- النصوص ----------
  const BARK_SUS = ['مين هناك؟', 'إنت يا واد!', 'استنى عندك…', 'فيه حاجة غريبة'];
  const BARK_ALERT = ['امسكوه!', 'قاتل! قاتل!', 'يا عسكر! هنا!', 'ماتسيبوهوش!'];
  const BARK_CALM = ['يمكن كان خيال…', 'ولا حاجة', 'شكلي محتاج أنام'];
  const BARK_GIVEUP = ['راح فين ابن الحرام؟', 'فص ملح وداب', 'ارجعوا مكانكم'];
  const BARK_FOUND = ['جثة! فيه قاتل هنا!', 'يا ساتر… قتلوه!'];
  const BARK_SCREAM = ['الحقونا!', 'يا ساتر يا رب!', 'قتل! قتل!', 'اجروا!'];
  const BARK_TARGET = ['الإتاوة يا معلم… ماتتأخرش', 'الباشا مستني فلوسه', 'اللي مش هيدفع، دكانه هيتقفل', 'مش عايز أسمع أعذار'];
  const BARK_CIV = ['العيش غلي قوي السنة دي', 'سمعت إن المشايخ ناويين على الباشا؟', 'الدلاة نهبوا السوق امبارح', 'عمر مكرم بيقول الشعب مش هيسكت', 'محمد علي ده… راجل مش سهل', 'ربنا يستر على البلد دي', 'الضرايب كسرت ضهرنا', 'شفت العسكر عملوا إيه في الحسينية؟'];
  const BARK_GUARD = ['خليك صاحي… الأزهر بيغلي', 'الباشا عايز السوق هادي', 'لو شفت حد غريب، بلّغني'];
  const BARK_BUMP = ['حاسب يا أخ!', 'إيه ده؟ براحة!', 'ما تبص قدامك!'];
  const BARK_ROOF = ['انزل يا جبان!', 'هتنزل يعني هتنزل!'];

  // ---------- الألوان والشخصيات ----------
  const C = {
    sand: '#d9bb8b', sand2: '#d2b382', speck: 'rgba(120,85,45,.25)', plaza: '#cbb28c', plazaLine: 'rgba(120,90,55,.28)',
    water: '#3b7d8c', bridge: '#9a7650',
    roofs: ['#c99d63', '#b98f5a', '#d6b07a', '#a7814f', '#c3a173', '#bf9460'],
    mosque: '#e8dfcf', wall: '#8b6d4c',
  };
  const COLS = {
    player: { robe: '#ece6d8', trim: '#a32a22', head: 'hood', headC: '#f4efe4' },
    guard: { robe: '#a3302a', trim: '#2f4a7a', head: 'bork', headC: '#f1ece0', weapon: 'spear' },
    archer: { robe: '#33496e', trim: '#c9a443', head: 'fez', headC: '#b3261e', weapon: 'bow' },
    target: { robe: '#2f6b46', trim: '#e0b04a', head: 'turban', headC: '#f6f1e6' },
  };
  const CIV_ROBES = ['#7a6a55', '#5d6b7a', '#8c5a3c', '#6f7d5a', '#a08c6c', '#4f5d6e', '#9b7b5b', '#6e4f6a', '#b49a72'];
  function civCols() {
    if (Math.random() < 0.35) return { robe: Math.random() < 0.7 ? '#1f1c22' : '#2b2a3d', head: 'veil', headC: '#141218' };
    const head = pick(['imma', 'fez', 'imma', 'cap']);
    return { robe: pick(CIV_ROBES), head, headC: head === 'fez' ? '#a8322d' : head === 'cap' ? '#e9e1d0' : pick(['#efe8da', '#d8cbb2', '#e6dcc4']) };
  }

  // ---------- الحالة ----------
  const state = { phase: 'title', t: 0, time: 0, objective: 'find', synced: false, targetKnown: false, eagle: false, timeScale: 1, timeScaleT: 0, zoomMul: 1, syncT: 0, calmT: 10, endT: 0, endKind: null, ambientT: 4, shake: 0, doorWarnT: 0 };
  let player, target, guards, civs, bodies, arrows, effects, heat, stats;
  const cam = { x: 30 * T, y: 22 * T };

  function mkEnt(kind, tx, ty, extra) {
    return Object.assign({ kind, x: (tx + 0.5) * T, y: (ty + 0.5) * T, r: 7, facing: Math.PI / 2, faceTo: Math.PI / 2, level: 'ground', zOff: 0, alive: true, path: null, pathI: 0, moving: false, walkT: Math.random() * 5, bark: null }, extra);
  }
  function mkGuard(tx, ty, opts) {
    return mkEnt('guard', tx, ty, Object.assign({ state: 'patrol', role: 'patrol', sus: 0, lastKnown: null, lostT: 0, susT: 0, searchT: 0, searchBase: 0, waitT: 0, waitFace: 0, hp: 2, atk: { phase: 'none', t: 0 }, stagger: 0, swingT: 0, fov: 1.75, range: 6 * T, repathT: 0, route: null, wi: 1, shootT: 1, seenNow: false, cols: COLS.guard }, opts));
  }
  function mkArcher(route) {
    const [tx, ty] = route[0];
    return mkGuard(tx, ty, { role: 'archer', route, level: 'roof', zOff: H, hp: 1, fov: 1.9, range: 7.5 * T, cols: COLS.archer });
  }
  function mkCiv(x, y, extra) {
    return Object.assign({ kind: 'civ', x, y, r: 7, facing: Math.random() * TAU, faceTo: 0, level: 'ground', zOff: 0, alive: true, path: null, pathI: 0, moving: false, walkT: Math.random() * 5, bark: null, mode: 'wander', waitT: Math.random() * 3, speed: 34 + Math.random() * 10, cols: civCols(), seed: Math.random() * 10 }, extra);
  }

  const TARGET_ROUTE = [[21, 16, 0], [16, 21, 6], [26, 21, 6], [26, 24, 0], [16, 24, 0], [16, 27, 6], [26, 27, 6], [21, 30, 0], [34, 30, 0], [36, 24, 0], [36, 16, 0]];

  function newGame() {
    player = { kind: 'player', x: 6.5 * T, y: 1.6 * T, r: 7, facing: Math.PI / 2, level: 'ground', zOff: 0, anim: null, hp: 5, maxHp: 5, alive: true, push: 0, pushKey: '', hidden: false, blend: false, sprint: false, moving: false, walkT: 0, regenT: 0, hurtT: 0, vx: 0, vy: 0, swingT: 0, attackCool: 0, cols: COLS.player, wasHidden: false };
    guards = []; civs = []; bodies = []; arrows = []; effects = [];
    heat = 1; stats = { time: 0, kills: 0, detections: 0, synced: false };
    Object.assign(state, { objective: 'find', synced: false, targetKnown: false, eagle: false, timeScale: 1, timeScaleT: 0, zoomMul: 1, syncT: 0, calmT: 10, endT: 0, endKind: null, ambientT: 4, shake: 0, doorWarnT: 0 });
    eagleToggle = false;

    target = mkEnt('target', 21, 16, { state: 'walk', wi: 1, waitT: 0, sus: 0, range: 5.5 * T, fov: 1.8, trail: [], stopFace: -Math.PI / 2, cols: COLS.target, big: true, hp: 1 });
    for (let i = 0; i < 2; i++) guards.push(mkGuard(21, 15, { role: 'escort', escortIdx: i, x: 21.5 * T + (i ? 8 : -8), y: 15.2 * T }));

    const patrols = [
      [[21, 2], [21, 14]], [[6, 16], [35, 16]], [[10, 40], [50, 40]], [[47, 2], [47, 40]],
      [[6, 30], [45, 30]], [[8, 1], [52, 2]], [[16, 22], [26, 22], [26, 24], [16, 24]], [[36, 3], [36, 37]],
    ];
    for (const route of patrols) { const [tx, ty] = route[0]; guards.push(mkGuard(tx, ty, { route, wi: 1 })); }
    for (const [tx, ty, f] of [[56, 41, -Math.PI / 2], [57, 41, -Math.PI / 2], [37, 15, Math.PI], [37, 17, Math.PI]]) {
      guards.push(mkGuard(tx, ty, { role: 'post', home: { x: (tx + 0.5) * T, y: (ty + 0.5) * T }, homeFacing: f, facing: f, faceTo: f }));
    }
    guards.push(mkArcher([[31, 11], [34, 13]]));
    guards.push(mkArcher([[23, 33], [25, 36]]));
    guards.push(mkArcher([[44, 13], [44, 21]]));

    // الأهالي: زباين وتجار عند الدكاكين
    for (const y of [20, 26]) for (const x of [14, 17, 24, 27]) {
      const cx = (x + 1) * T;
      for (let k = 0; k < 3; k++) civs.push(mkCiv(cx + (k - 1) * 12 + Math.random() * 4, (y + 1.5) * T + Math.random() * 6, { mode: 'idle', homeFace: -Math.PI / 2 }));
      civs.push(mkCiv(cx, (y - 0.4) * T, { mode: 'idle', homeFace: Math.PI / 2 }));
    }
    for (let k = 0; k < 5; k++) civs.push(mkCiv((40.6 + k * 0.6) * T, (17.5 + (k % 2) * 0.7) * T, { mode: 'idle', homeFace: -Math.PI / 2 }));
    // جماعات ماشية مع بعض
    for (let gi = 0; gi < 8; gi++) {
      const [tx, ty] = pick(streetTiles);
      const leader = mkCiv((tx + 0.5) * T, (ty + 0.5) * T, { trail: [], followers: [] });
      civs.push(leader);
      const n = 2 + Math.floor(Math.random() * 2);
      for (let k = 1; k <= n; k++) { const f = mkCiv(leader.x, leader.y, { mode: 'follow', leader, idx: k, speed: leader.speed }); leader.followers.push(f); civs.push(f); }
    }
    for (let k = 0; k < 16; k++) { const [tx, ty] = pick(streetTiles); civs.push(mkCiv((tx + 0.5) * T, (ty + 0.5) * T)); }
    civs.forEach(c => { if (c.mode === 'idle') { c.facing = c.faceTo = c.homeFace; } });
    updateHUD(true);
  }

  // ---------- الحركة ----------
  function canStand(x, y, r, walk) {
    return walk(tileAtPx(x - r, y - r)) && walk(tileAtPx(x + r, y - r)) && walk(tileAtPx(x - r, y + r)) && walk(tileAtPx(x + r, y + r));
  }
  function moveEntity(e, dx, dy, walk) {
    let bx = 0, by = 0;
    if (dx) { if (canStand(e.x + dx, e.y, e.r, walk)) e.x += dx; else bx = Math.sign(dx); }
    if (dy) { if (canStand(e.x, e.y + dy, e.r, walk)) e.y += dy; else by = Math.sign(dy); }
    return [bx, by];
  }
  function setPathTo(e, gx, gy) {
    const g = nearestGround(clamp(Math.floor(gx / T), 0, MW - 1), clamp(Math.floor(gy / T), 0, MH - 1));
    if (!g) { e.path = null; return false; }
    e.path = astar(Math.floor(e.x / T), Math.floor(e.y / T), g[0], g[1]); e.pathI = 0;
    return !!e.path;
  }
  function followPath(e, speed, dt) {
    if (!e.path || e.pathI >= e.path.length) return true;
    const [tx, ty] = e.path[e.pathI];
    const gx = (tx + 0.5) * T, gy = (ty + 0.5) * T, dx = gx - e.x, dy = gy - e.y, d = Math.hypot(dx, dy);
    if (d < 4) { e.pathI++; return e.pathI >= e.path.length; }
    const step = Math.min(d, speed * dt);
    moveEntity(e, dx / d * step, dy / d * step, walkGround);
    e.faceTo = Math.atan2(dy, dx); e.moving = true;
    return false;
  }
  function moveToward(e, x, y, speed, dt, walk, stopAt = 0) {
    const dx = x - e.x, dy = y - e.y, d = Math.hypot(dx, dy);
    if (d <= stopAt + 0.5) return true;
    const step = Math.min(d - stopAt, speed * dt);
    moveEntity(e, dx / d * step, dy / d * step, walk || walkGround);
    e.faceTo = Math.atan2(dy, dx); e.moving = true;
    return false;
  }
  function turn(e, dt, rate = 7) { e.facing += angDiff(e.facing, e.faceTo) * Math.min(1, dt * rate); }
  function bark(e, text, t = 2.4) { e.bark = { text, t }; }

  // ---------- الإدخال ----------
  const keys = {};
  let actionQueued = false, eagleToggle = false;
  const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (state.phase === 'play' && !e.repeat && (e.code === 'KeyE' || e.code === 'Space')) actionQueued = true;
    if (!e.repeat && e.code === 'KeyM') toggleMute();
    if (!e.repeat && (e.code === 'Escape' || e.code === 'KeyP')) togglePause();
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', e => { keys[e.code] = false; });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; if (state.phase === 'play') togglePause(true); });

  const joy = { active: false, id: null, bx: 0, by: 0, x: 0, y: 0 };
  const joyEl = document.getElementById('joy'), knobEl = document.getElementById('joy-knob'), touchEl = document.getElementById('touch');
  touchEl.addEventListener('pointerdown', e => {
    if (state.phase !== 'play' || joy.active || e.clientX > innerWidth * 0.55) return;
    joy.active = true; joy.id = e.pointerId; joy.bx = e.clientX; joy.by = e.clientY; joy.x = joy.y = 0;
    joyEl.style.left = (joy.bx - 60) + 'px'; joyEl.style.top = (joy.by - 60) + 'px'; joyEl.classList.add('on');
    knobEl.style.transform = 'translate(0px,0px)';
    try { touchEl.setPointerCapture(e.pointerId); } catch (_) { }
  });
  touchEl.addEventListener('pointermove', e => {
    if (!joy.active || e.pointerId !== joy.id) return;
    let dx = e.clientX - joy.bx, dy = e.clientY - joy.by; const d = Math.hypot(dx, dy), R = 52;
    if (d > R) { dx = dx / d * R; dy = dy / d * R; }
    joy.x = dx / R; joy.y = dy / R;
    knobEl.style.transform = `translate(${dx}px,${dy}px)`;
  });
  const joyEnd = e => { if (e.pointerId !== joy.id) return; joy.active = false; joy.id = null; joy.x = joy.y = 0; joyEl.classList.remove('on'); };
  touchEl.addEventListener('pointerup', joyEnd); touchEl.addEventListener('pointercancel', joyEnd);

  function inputVec() {
    if (joy.active) { const m = Math.hypot(joy.x, joy.y); if (m < 0.15) return [0, 0, 0, false]; return [joy.x / m, joy.y / m, Math.min(1, m), m > 0.9]; }
    let x = 0, y = 0;
    if (keys.KeyA || keys.ArrowLeft) x -= 1; if (keys.KeyD || keys.ArrowRight) x += 1;
    if (keys.KeyW || keys.ArrowUp) y -= 1; if (keys.KeyS || keys.ArrowDown) y += 1;
    const m = Math.hypot(x, y); if (!m) return [0, 0, 0, false];
    return [x / m, y / m, 1, !!(keys.ShiftLeft || keys.ShiftRight)];
  }

  // ---------- اللاعب ----------
  function startAnim(a) { const p = player; p.anim = Object.assign({ t: 0, fx: p.x, fy: p.y, fz: p.zOff, arc: 0 }, a); }
  function updateAnim(dt) {
    const p = player, a = p.anim; a.t += dt;
    const k = clamp(a.t / a.dur, 0, 1);
    p.x = lerp(a.fx, a.tx, k); p.y = lerp(a.fy, a.ty, k);
    p.zOff = lerp(a.fz, a.tz, k) + a.arc * Math.sin(Math.PI * k);
    if (k >= 1) { p.anim = null; p.level = a.level; p.zOff = a.tz; if (a.done) a.done(); }
  }
  function axisTarget(sx, sy, tx, ty, walk) {
    // نقطة الوصول جوه البلاطة (tx,ty) في اتجاه الحركة
    const p = player, r = p.r + 1;
    let x = p.x, y = p.y;
    if (sx > 0) x = tx * T + r; else if (sx < 0) x = (tx + 1) * T - r;
    if (sy > 0) y = ty * T + r; else if (sy < 0) y = (ty + 1) * T - r;
    if (canStand(x, y, p.r, walk)) return [x, y];
    if (sx) y = (ty + 0.5) * T; else x = (tx + 0.5) * T;
    if (canStand(x, y, p.r, walk)) return [x, y];
    return null;
  }
  function tryEdge(sx, sy, sprint) {
    const p = player, tx = Math.floor(p.x / T), ty = Math.floor(p.y / T);
    const nx = tx + sx, ny = ty + sy, nc = tileAt(nx, ny);
    if (nc === 'T') { if (p.push > 0.2) startTowerClimb(nx, ny); return; }
    if (p.level === 'ground') {
      if (ROOF.has(nc) && p.push > (sprint ? 0.06 : 0.22)) {
        const pt = axisTarget(sx, sy, nx, ny, walkRoof);
        if (pt) { startAnim({ tx: pt[0], ty: pt[1], tz: H, arc: 4, dur: 0.4, level: 'roof' }); sfx('climb'); p.push = 0; }
      }
      return;
    }
    if (ROOF.has(nc)) return;
    for (let k = 2; k <= 3; k++) {
      const mid = tileAt(tx + sx * (k - 1), ty + sy * (k - 1)), c = tileAt(tx + sx * k, ty + sy * k);
      if (mid === 'W' || mid === 'T' || c === 'W' || c === 'T') break;
      if (ROOF.has(c)) {
        if (p.push > (sprint ? 0.03 : 0.14)) {
          const pt = axisTarget(sx, sy, tx + sx * k, ty + sy * k, walkRoof);
          if (pt) { startAnim({ tx: pt[0], ty: pt[1], tz: H, arc: 14, dur: 0.3 + 0.07 * k, level: 'roof', done: () => sfx('land') }); sfx('jump'); p.push = 0; }
        }
        return;
      }
    }
    if (GROUND.has(nc) && p.push > 0.3) {
      const pt = axisTarget(sx, sy, nx, ny, walkGround);
      if (pt) { startAnim({ tx: pt[0], ty: pt[1], tz: 0, arc: 6, dur: 0.32, level: 'ground', done: () => sfx('land') }); sfx('jump'); p.push = 0; }
    }
  }
  function startTowerClimb(nx, ny) {
    const p = player;
    p.towerFrom = { x: p.x, y: p.y, level: p.level, z: p.zOff };
    startAnim({ tx: (nx + 0.5) * T, ty: (ny + 0.5) * T, tz: TOWER_Z, dur: 1.1, level: 'tower', done: onTowerTop });
    sfx('climb'); p.push = 0;
  }
  function onTowerTop() {
    if (state.synced) return;
    state.synced = stats.synced = true; state.targetKnown = true; state.syncT = 3.2;
    sfx('sync'); showBanner('تمت المزامنة', 'حسن آغا ظهر على الخريطة');
  }
  function nearestHay(x, y, maxD) {
    let best = null, bd = maxD;
    for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++) if (map[ty][tx] === 'H') {
      const d = dist(x, y, (tx + 0.5) * T, (ty + 0.5) * T); if (d < bd) { bd = d; best = { x: (tx + 0.5) * T, y: (ty + 0.5) * T }; }
    }
    return best;
  }

  function updatePlayer(dt) {
    const p = player;
    if (p.swingT > 0) p.swingT -= dt;
    if (p.attackCool > 0) p.attackCool -= dt;
    if (p.hurtT > 0) p.hurtT -= dt;
    if (!p.alive) return;
    const ox = p.x, oy = p.y;
    if (p.anim) { updateAnim(dt); p.vx = (p.x - ox) / dt; p.vy = (p.y - oy) / dt; return; }
    const [ix, iy, m, sprintIn] = inputVec();
    const sprint = sprintIn && !state.eagle && m > 0;
    p.moving = m > 0; p.sprint = sprint;
    if (p.level === 'tower') {
      if (m > 0.3) { const f = p.towerFrom; startAnim({ tx: f.x, ty: f.y, tz: f.z, dur: 0.8, level: f.level }); sfx('climb'); }
      p.vx = p.vy = 0; return;
    }
    const speed = sprint ? 150 : 72 * (joy.active ? clamp(m * 1.25, 0.4, 1) : 1);
    const walk = p.level === 'ground' ? walkGround : walkRoof;
    const [bx, by] = moveEntity(p, ix * speed * dt, iy * speed * dt, walk);
    if (m > 0) { p.faceTo = Math.atan2(iy, ix); p.facing += angDiff(p.facing, p.faceTo) * Math.min(1, dt * 14); p.walkT += dt * (sprint ? 1.4 : 1); }
    let key = '', sx = 0, sy = 0;
    if (bx && Math.abs(ix) > 0.35) { sx = bx; key = 'x' + bx; } else if (by && Math.abs(iy) > 0.35) { sy = by; key = 'y' + by; }
    if (key) { if (key !== p.pushKey) { p.push = 0; p.pushKey = key; } p.push += dt; tryEdge(sx, sy, sprint); }
    else { p.push = 0; p.pushKey = ''; }
    p.vx = (p.x - ox) / dt; p.vy = (p.y - oy) / dt;
  }
  function updatePlayerStatus() {
    const p = player;
    p.hidden = p.alive && p.level === 'ground' && !p.anim && tileAtPx(p.x, p.y) === 'H';
    if (p.hidden && !p.wasHidden) sfx('hay');
    p.wasHidden = p.hidden;
    p.blend = false;
    if (p.alive && p.level === 'ground' && !p.sprint && !p.hidden && !p.anim) {
      let n = 0;
      for (const c of civs) if (c.mode !== 'flee' && Math.abs(c.x - p.x) < 32 && Math.abs(c.y - p.y) < 32 && dist(c.x, c.y, p.x, p.y) < 32) n++;
      p.blend = n >= 2;
    }
  }
  function hurtPlayer(n) {
    const p = player; if (!p.alive || state.phase !== 'play') return;
    p.hp -= n; p.hurtT = 0.45; p.regenT = 0; state.shake = 7; sfx('hit'); flash();
    if (p.hp <= 0) { p.hp = 0; p.alive = false; state.endT = 1.5; state.endKind = 'dead'; sfx('fail'); }
  }

  // ---------- الرؤية ----------
  function canSee(g, tx, ty, tLevel) {
    if (tLevel === 'tower') return -1;
    const d = dist(g.x, g.y, tx, ty);
    const elevated = g.level === 'roof' || tLevel !== 'ground';
    const range = (g.level === 'ground' && tLevel !== 'ground') ? 2.6 * T : g.range;
    if (d > range) return -1;
    if (d > 1.2 * T && Math.abs(angDiff(g.facing, Math.atan2(ty - g.y, tx - g.x))) > g.fov / 2) return -1;
    if (!los(g.x, g.y, tx, ty, elevated ? TOWER_ONLY : BLOCK_SIGHT)) return -1;
    return d;
  }
  function perceive(g, dt) {
    const p = player; g.seenNow = false;
    if (state.phase !== 'play' || !p.alive) return;
    let d = p.hidden ? -1 : canSee(g, p.x, p.y, p.level);
    if (d >= 0 && p.blend && d > (g.state === 'alert' ? 2.6 * T : 1.4 * T)) d = -1;
    if (d >= 0) {
      g.seenNow = true; g.lastKnown = { x: p.x, y: p.y };
      if (g.state === 'alert') g.lostT = 0;
      else {
        let rate = 0.9 * (1.3 - d / g.range);
        if (p.sprint) rate *= 2; if (p.anim) rate *= 1.7; if (p.blend) rate *= 0.4;
        if (p.level === 'roof' && g.level === 'ground') rate *= 1.3;
        if (g.state === 'search') rate *= 1.6;
        rate *= heat; if (d < 1.3 * T) rate += 1.4;
        g.sus = Math.min(1, g.sus + rate * dt);
        if (g.sus >= 1) setAlert(g);
        else if (g.sus > 0.3 && g.state !== 'suspicious' && g.state !== 'search') { g.state = 'suspicious'; g.susT = 0; g.path = null; bark(g, pick(BARK_SUS)); sfx('sus'); }
      }
    } else if (g.state !== 'alert') g.sus = Math.max(0, g.sus - 0.15 * dt);
    if (g.state !== 'alert') for (const b of bodies) {
      if (b.found || Math.abs(b.x - g.x) > 5 * T || Math.abs(b.y - g.y) > 5 * T) continue;
      if (canSee(g, b.x, b.y, b.level) >= 0) { b.found = true; onBodyFound(g, b); break; }
    }
  }
  function setAlert(g, propagated) {
    if (!g.alive) return;
    const wasAny = guards.some(o => o.alive && o.state === 'alert');
    if (g.state !== 'alert') {
      g.state = 'alert'; g.sus = 1; g.lostT = 0; g.path = null; g.repathT = 0;
      if (!g.lastKnown) g.lastKnown = { x: player.x, y: player.y };
      if (!propagated || Math.random() < 0.4) bark(g, pick(BARK_ALERT));
    }
    if (!wasAny) { stats.detections++; sfx('alert'); }
    if (!propagated) for (const o of guards) {
      if (o !== g && o.alive && o.state !== 'alert' && dist(o.x, o.y, g.x, g.y) < 7 * T) { o.lastKnown = { ...g.lastKnown }; setAlert(o, true); }
    }
    if (target.alive && (g.role === 'escort' || dist(g.x, g.y, target.x, target.y) < 6 * T)) targetFlee();
  }
  function startSearch(g, x, y) {
    g.state = 'search'; g.searchT = 6; g.searchBase = g.facing; g.atk.phase = 'none'; g.lostT = 0;
    g.lastKnown = { x, y };
    if (g.level === 'ground') setPathTo(g, x, y); else g.path = null;
  }
  function onBodyFound(g, b) {
    bark(g, pick(BARK_FOUND)); heat = Math.max(heat, 1.35); sfx('sus');
    startSearch(g, b.x, b.y); g.sus = Math.max(g.sus, 0.5);
    for (const o of guards) if (o !== g && o.alive && o.state !== 'alert' && o.state !== 'search' && dist(o.x, o.y, b.x, b.y) < 6 * T) startSearch(o, b.x, b.y);
    if (target.alive && dist(b.x, b.y, target.x, target.y) < 9 * T) targetFlee();
  }

  // ---------- الحراس ----------
  function updateGuard(g, dt) {
    if (!g.alive) return;
    g.moving = false;
    if (g.bark) { g.bark.t -= dt; if (g.bark.t <= 0) g.bark = null; }
    if (g.stagger > 0) g.stagger -= dt;
    if (g.swingT > 0) g.swingT -= dt;
    perceive(g, dt);
    switch (g.state) {
      case 'patrol': patrolBehavior(g, dt); break;
      case 'suspicious':
        g.susT += dt;
        if (g.lastKnown) g.faceTo = Math.atan2(g.lastKnown.y - g.y, g.lastKnown.x - g.x);
        if (g.susT > 1.2 && g.level === 'ground' && g.lastKnown) {
          g.repathT -= dt; if (g.repathT <= 0) { setPathTo(g, g.lastKnown.x, g.lastKnown.y); g.repathT = 0.8; }
          followPath(g, 30, dt);
        }
        if (g.sus <= 0.02) { g.state = 'return'; g.path = null; if (Math.random() < 0.6) bark(g, pick(BARK_CALM)); }
        break;
      case 'alert': alertBehavior(g, dt); break;
      case 'search': {
        let arrived = true;
        if (g.level === 'ground' && g.path) arrived = followPath(g, 72, dt);
        if (arrived) { g.searchT -= dt; g.faceTo = g.searchBase + Math.sin(state.time * 1.6 + g.x) * 1.4; }
        const p = player;
        if (p.hidden && dist(g.x, g.y, p.x, p.y) < 1.1 * T && (dist(g.lastKnown.x, g.lastKnown.y, p.x, p.y) < 1.3 * T || Math.random() < dt * 0.4)) {
          bark(g, 'لقيتك!'); g.lastKnown = { x: p.x, y: p.y }; setAlert(g);
          const a = Math.atan2(p.y - g.y, p.x - g.x);
          moveEntity(p, Math.cos(a) * 18, Math.sin(a) * 18, walkGround); moveEntity(p, -Math.sin(a) * 18, Math.cos(a) * 18, walkGround);
        }
        if (g.searchT <= 0) { g.state = 'return'; g.path = null; g.sus = 0; if (Math.random() < 0.7) bark(g, pick(BARK_GIVEUP)); }
        break;
      }
      case 'return': returnBehavior(g, dt); break;
    }
    if (g.state !== 'alert') g.atk.phase = 'none';
    turn(g, dt);
    if (g.moving) g.walkT += dt * (g.state === 'alert' ? 1.6 : 1);
  }
  function patrolBehavior(g, dt) {
    if (g.role === 'post') {
      if (dist(g.x, g.y, g.home.x, g.home.y) > 6) { if (!g.path) setPathTo(g, g.home.x, g.home.y); if (followPath(g, 44, dt)) g.path = null; }
      else g.faceTo = g.homeFacing + Math.sin(state.time * 0.7 + g.x * 0.1) * 0.7;
      return;
    }
    if (g.role === 'escort') return escortFollow(g, dt);
    if (g.waitT > 0) { g.waitT -= dt; g.faceTo = g.waitFace + Math.sin(g.waitT * 2.5) * 0.9; return; }
    if (g.role === 'archer') {
      const [wx, wy] = g.route[g.wi];
      if (moveToward(g, (wx + 0.5) * T, (wy + 0.5) * T, 32, dt, walkRoof)) { g.waitT = 2.2; g.waitFace = g.facing; g.wi = (g.wi + 1) % g.route.length; }
      return;
    }
    if (!g.path) { const [wx, wy] = g.route[g.wi]; setPathTo(g, (wx + 0.5) * T, (wy + 0.5) * T); if (!g.path) { g.waitT = 1; g.wi = (g.wi + 1) % g.route.length; return; } }
    if (followPath(g, 44, dt)) {
      g.path = null; g.waitT = 1.5; g.waitFace = g.facing; g.wi = (g.wi + 1) % g.route.length;
      if (Math.random() < 0.15 && dist(g.x, g.y, player.x, player.y) < 8 * T) bark(g, pick(BARK_GUARD));
    }
  }
  function returnBehavior(g, dt) {
    if (g.role === 'escort') {
      if (target.alive) { g.state = 'patrol'; return; }
      g.role = 'post'; g.home = { x: g.x, y: g.y }; g.homeFacing = g.facing;
    }
    if (g.role === 'post') {
      if (!g.path) setPathTo(g, g.home.x, g.home.y);
      if (followPath(g, 44, dt)) { g.path = null; g.state = 'patrol'; }
      return;
    }
    g.path = null; g.state = 'patrol';
  }
  function escortFollow(g, dt) {
    const t = target;
    if (!t.alive) { g.role = 'post'; g.home = { x: g.x, y: g.y }; g.homeFacing = g.facing; return; }
    const tr = t.trail, pt = tr[Math.max(0, tr.length - 1 - (9 + g.escortIdx * 7))];
    if (!pt) return;
    const d = dist(g.x, g.y, pt.x, pt.y);
    if (d > 5 * T) { g.repathT -= dt; if (g.repathT <= 0 || !g.path) { setPathTo(g, t.x, t.y); g.repathT = 1; } followPath(g, 110, dt); return; }
    if (d > 3) moveToward(g, pt.x, pt.y, t.state === 'flee' ? 110 : Math.min(70, 30 + d), dt);
    else g.faceTo = t.facing;
  }
  function alertBehavior(g, dt) {
    const p = player;
    if (!g.seenNow) g.lostT += dt;
    if (g.lostT > 3.5) { startSearch(g, g.lastKnown.x, g.lastKnown.y); return; }
    const d = dist(g.x, g.y, p.x, p.y);
    if (g.seenNow) g.faceTo = Math.atan2(p.y - g.y, p.x - g.x);
    if (g.role === 'archer') {
      if (!g.seenNow) return;
      if (d < 1.4 * T && p.level === 'roof') { meleeLogic(g, dt, d); return; }
      g.shootT -= dt;
      if (g.shootT <= 0) { shootArrow(g); g.shootT = 1.7 + Math.random() * 0.6; }
      return;
    }
    if (g.stagger > 0) return;
    if (g.seenNow && p.level === 'ground' && d < 1.4 * T) {
      if (d > 0.95 * T) moveToward(g, p.x, p.y, 80, dt);
      meleeLogic(g, dt, d);
      return;
    }
    g.atk.phase = g.atk.phase === 'cool' ? 'cool' : 'none';
    if (g.atk.phase === 'cool') { g.atk.t -= dt; if (g.atk.t <= 0) g.atk.phase = 'none'; }
    if (g.seenNow && p.level === 'ground' && d < 3 * T) { moveToward(g, p.x, p.y, 128, dt, walkGround, 0.9 * T); return; }
    g.repathT -= dt;
    if (g.repathT <= 0 || !g.path) { setPathTo(g, g.lastKnown.x, g.lastKnown.y); g.repathT = 0.4; }
    const arrived = followPath(g, 128, dt);
    if (arrived && g.seenNow && p.level !== 'ground' && !g.bark && Math.random() < dt * 0.5) bark(g, pick(BARK_ROOF));
  }
  function meleeLogic(g, dt, d) {
    const a = g.atk, p = player;
    if (g.stagger > 0) { a.phase = 'none'; return; }
    if (a.phase === 'none') { if (d < 1.3 * T) { a.phase = 'windup'; a.t = 0.55 + Math.random() * 0.2; } }
    else if (a.phase === 'windup') {
      a.t -= dt;
      if (a.t <= 0) {
        if (dist(g.x, g.y, p.x, p.y) < 1.55 * T && !p.anim && p.level === g.level) hurtPlayer(1);
        a.phase = 'cool'; a.t = 0.8 + Math.random() * 0.6; g.swingT = 0.2;
      }
    } else if (a.phase === 'cool') { a.t -= dt; if (a.t <= 0) a.phase = 'none'; }
  }
  function shootArrow(g) {
    const p = player, tx = p.x + p.vx * 0.25, ty = p.y + p.vy * 0.25, a = Math.atan2(ty - g.y, tx - g.x);
    arrows.push({ x: g.x, y: g.y, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, life: 1.4, a });
    sfx('arrow'); g.swingT = 0.2;
  }
  function updateArrows(dt) {
    const p = player;
    for (let i = arrows.length - 1; i >= 0; i--) {
      const a = arrows[i]; a.x += a.vx * dt; a.y += a.vy * dt; a.life -= dt;
      let dead = a.life <= 0 || TOWER_ONLY.has(tileAtPx(a.x, a.y));
      if (!dead && p.alive && !p.hidden && !p.anim && p.level !== 'tower' && dist(a.x, a.y, p.x, p.y) < 11) { hurtPlayer(1); dead = true; }
      if (dead) arrows.splice(i, 1);
    }
  }

  // ---------- الهدف ----------
  function targetFlee() {
    const t = target; if (!t.alive || t.state === 'flee') return;
    t.state = 'flee'; t.path = null; state.targetKnown = true;
    bark(t, 'يا عسكر! احموني!');
    showBanner('حسن آغا بيهرب!', 'الحقه قبل ما يوصل باب القلعة');
  }
  function updateTarget(dt) {
    const t = target; if (!t.alive) return;
    if (t.bark) { t.bark.t -= dt; if (t.bark.t <= 0) t.bark = null; }
    t.moving = false;
    const p = player;
    if (t.state !== 'flee' && state.phase === 'play' && p.alive) {
      let d = p.hidden ? -1 : canSee(t, p.x, p.y, p.level);
      if (d >= 0 && p.blend && d > 1.4 * T) d = -1;
      if (d >= 0) {
        t.sus += (0.55 * (1.3 - d / t.range) + (p.sprint ? 0.8 : 0) + (d < 1.5 * T ? 0.9 : 0)) * dt;
        if (t.sus > 0.35 && !t.bark) bark(t, 'مين ده اللي بيبصلي؟');
        if (t.sus >= 1) { targetFlee(); for (const g of guards) if (g.role === 'escort' && g.alive) { g.lastKnown = { x: p.x, y: p.y }; setAlert(g, true); } }
      } else t.sus = Math.max(0, t.sus - 0.1 * dt);
    }
    if (t.state === 'flee') {
      if (!t.path) setPathTo(t, GATE.x, GATE.y);
      followPath(t, 98, dt);
      if (dist(t.x, t.y, GATE.x, GATE.y) < 0.9 * T && state.phase === 'play' && !state.endKind) { state.endKind = 'escape'; state.endT = 0.6; sfx('fail'); }
    } else if (t.state === 'stop') {
      t.waitT -= dt; t.faceTo = t.stopFace;
      if (!t.bark && Math.random() < dt * 0.35) bark(t, pick(BARK_TARGET));
      if (t.waitT <= 0) { t.state = 'walk'; t.wi = (t.wi + 1) % TARGET_ROUTE.length; t.path = null; }
    } else {
      if (!t.path) { const [wx, wy] = TARGET_ROUTE[t.wi]; setPathTo(t, (wx + 0.5) * T, (wy + 0.5) * T); }
      if (followPath(t, 36, dt)) {
        t.path = null; const stop = TARGET_ROUTE[t.wi][2];
        if (stop) { t.state = 'stop'; t.waitT = stop; t.stopFace = -Math.PI / 2; } else t.wi = (t.wi + 1) % TARGET_ROUTE.length;
      }
    }
    const lt = t.trail[t.trail.length - 1];
    if (!lt || dist(lt.x, lt.y, t.x, t.y) > 4) { t.trail.push({ x: t.x, y: t.y }); if (t.trail.length > 80) t.trail.shift(); }
    turn(t, dt); if (t.moving) t.walkT += dt;
    if (!state.targetKnown && dist(p.x, p.y, t.x, t.y) < 7 * T && los(p.x, p.y, t.x, t.y, BLOCK_SIGHT)) { state.targetKnown = true; showBanner('ده حسن آغا', 'العمامة الكبيرة والقفطان الأخضر'); }
  }

  // ---------- الأهالي ----------
  function randomDest(c) {
    const cx = Math.floor(c.x / T), cy = Math.floor(c.y / T);
    for (let i = 0; i < 20; i++) { const [x, y] = pick(streetTiles); const m = Math.abs(x - cx) + Math.abs(y - cy); if (m > 3 && m < 16) return { x: (x + 0.5) * T, y: (y + 0.5) * T }; }
    return null;
  }
  function civFlee(c, fx, fy) {
    if (c.mode === 'flee') return;
    c.mode = 'flee'; c.path = null; c.leader = null;
    for (let i = 0; i < 15; i++) {
      const [x, y] = pick(streetTiles), px = (x + 0.5) * T, py = (y + 0.5) * T;
      if (dist(px, py, fx, fy) > 7 * T && dist(px, py, c.x, c.y) < 16 * T) { setPathTo(c, px, py); break; }
    }
    if (c.followers) { c.followers.forEach(f => civFlee(f, fx, fy)); c.followers = null; }
  }
  function updateCiv(c, dt) {
    if (c.bark) { c.bark.t -= dt; if (c.bark.t <= 0) c.bark = null; }
    c.moving = false;
    switch (c.mode) {
      case 'idle': c.faceTo = c.homeFace + Math.sin(state.time * 0.5 + c.seed) * 0.35; break;
      case 'wander':
        if (c.waitT > 0) { c.waitT -= dt; break; }
        if (!c.path) { const d = randomDest(c); if (d) setPathTo(c, d.x, d.y); if (!c.path) { c.waitT = 1; break; } }
        if (followPath(c, c.speed, dt)) { c.path = null; c.waitT = 1 + Math.random() * 4; }
        break;
      case 'follow': {
        const L = c.leader;
        if (!L || L.mode !== 'wander') { c.mode = 'wander'; c.leader = null; c.path = null; break; }
        const tr = L.trail, i = tr.length - 1 - c.idx * 6;
        if (i < 1) break;
        const pt = tr[i], prev = tr[i - 1], dx = pt.x - prev.x, dy = pt.y - prev.y, dl = Math.hypot(dx, dy) || 1;
        const side = (c.idx % 2 ? 1 : -1) * 7;
        const gx = pt.x - dy / dl * side, gy = pt.y + dx / dl * side;
        const d = dist(c.x, c.y, gx, gy);
        if (d > 4 * T) { c.mode = 'wander'; c.leader = null; L.followers = L.followers.filter(f => f !== c); break; }
        if (d > 3) moveToward(c, gx, gy, Math.min(c.speed * 1.4, 20 + d * 2), dt);
        else c.faceTo = L.facing;
        break;
      }
      case 'flee':
        if (!c.path) { c.mode = 'wander'; c.waitT = 2; break; }
        if (followPath(c, 105, dt)) { c.mode = 'wander'; c.path = null; c.waitT = 2 + Math.random() * 3; }
        break;
    }
    if (c.trail) { const lt = c.trail[c.trail.length - 1]; if (!lt || dist(lt.x, lt.y, c.x, c.y) > 4) { c.trail.push({ x: c.x, y: c.y }); if (c.trail.length > 40) c.trail.shift(); } }
    turn(c, dt, 5); if (c.moving) c.walkT += dt * (c.mode === 'flee' ? 1.6 : 1);
  }
  function separate() {
    const list = [];
    if (player.alive && player.level === 'ground' && !player.anim && !player.hidden) list.push(player);
    for (const g of guards) if (g.alive && g.level === 'ground') list.push(g);
    if (target.alive) list.push(target);
    for (const c of civs) list.push(c);
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j], dx = b.x - a.x, dy = b.y - a.y, min = a.r + b.r - 2;
        if (dx > min || dx < -min || dy > min || dy < -min) continue;
        const d2 = dx * dx + dy * dy; if (d2 >= min * min || d2 < 0.0001) continue;
        const d = Math.sqrt(d2), push = (min - d) * 0.5, nx = dx / d, ny = dy / d;
        const wa = a === player ? 0.25 : 1;
        moveEntity(a, -nx * push * wa, -ny * push * wa, walkGround); moveEntity(b, nx * push, ny * push, walkGround);
        if (a === player && player.sprint && b.kind === 'civ' && !b.bark && Math.random() < 0.4) bark(b, pick(BARK_BUMP), 1.6);
      }
    }
  }

  // ---------- الاغتيال والقتال ----------
  function computeContext() {
    const p = player; if (!p.alive || p.anim || state.phase !== 'play') return null;
    if (p.level === 'tower') { const hay = nearestHay(p.x, p.y, 5 * T); return hay ? { type: 'leap', hay } : null; }
    for (const g of guards) if (g.alive && g.atk.phase === 'windup' && g.level === p.level && dist(g.x, g.y, p.x, p.y) < 1.7 * T) return { type: 'counter', e: g };
    let best = null, bd = 1e9;
    const list = target.alive ? [target, ...guards] : guards;
    for (const e of list) {
      if (!e.alive) continue;
      const d = dist(e.x, e.y, p.x, p.y);
      let type = null;
      if (p.level === 'roof' && e.level === 'ground' && d < 1.9 * T) type = 'airkill';
      else if (p.level === e.level && d < (p.hidden ? 1.5 * T : 1.2 * T)) {
        const facingMe = Math.abs(angDiff(e.facing, Math.atan2(p.y - e.y, p.x - e.x))) < 1.3;
        type = (e.kind === 'guard' && e.state === 'alert' && e.seenNow && facingMe) ? 'attack' : 'kill';
      }
      if (type) { const score = d - (e.kind === 'target' ? 100 : 0); if (score < bd) { bd = score; best = { type, e }; } }
    }
    return best;
  }
  const CTX_LABEL = { kill: 'اغتيال', airkill: 'اغتيال جوي', attack: 'هجوم', counter: 'صد!', leap: 'قفزة الإيمان' };
  function performAction(c) {
    const p = player;
    if (!c) return;
    if (c.type === 'leap') {
      startAnim({ tx: c.hay.x, ty: c.hay.y, tz: 0, arc: 26, dur: 0.95, level: 'ground', done: () => sfx('hay') }); sfx('leap'); return;
    }
    const e = c.e, a = Math.atan2(e.y - p.y, e.x - p.x);
    p.facing = p.faceTo = a; p.swingT = 0.22;
    if (c.type === 'kill') {
      const tx = e.x - Math.cos(a) * 11, ty = e.y - Math.sin(a) * 11;
      const ok = canStand(tx, ty, p.r, p.level === 'roof' ? walkRoof : walkGround);
      startAnim({ tx: ok ? tx : p.x, ty: ok ? ty : p.y, tz: p.zOff, dur: 0.18, level: p.level, done: () => killEnemy(e) });
    } else if (c.type === 'airkill') {
      startAnim({ tx: e.x - Math.cos(a) * 6, ty: e.y - Math.sin(a) * 6, tz: 0, arc: 16, dur: 0.42, level: 'ground', done: () => { sfx('land'); killEnemy(e); } });
      sfx('jump');
    } else if (c.type === 'counter') {
      sfx('clang'); killEnemy(e);
    } else if (c.type === 'attack') {
      if (p.attackCool > 0) return;
      p.attackCool = 0.35; e.hp--; e.stagger = 0.55; e.atk.phase = 'none'; sfx('hit');
      moveEntity(e, Math.cos(a) * 10, Math.sin(a) * 10, e.level === 'roof' ? walkRoof : walkGround);
      if (e.hp <= 0) killEnemy(e);
    }
  }
  function killEnemy(e) {
    if (!e.alive) return;
    e.alive = false; if (e.atk) e.atk.phase = 'none';
    const lvl = e.level;
    bodies.push({ x: e.x, y: e.y, zOff: e.zOff, level: lvl, facing: e.facing, cols: e.cols, big: e.big, found: false, t: 0 });
    if (e.kind === 'guard') stats.kills++;
    sfx('kill'); state.shake = Math.max(state.shake, 3);
    for (let i = 0; i < 10; i++) effects.push({ x: e.x, y: e.y - e.zOff, vx: (Math.random() - 0.5) * 90, vy: (Math.random() - 0.5) * 90, life: 0.5 + Math.random() * 0.3 });
    const body = bodies[bodies.length - 1];
    for (const g of guards) if (g.alive && g.state !== 'alert' && canSee(g, e.x, e.y, lvl) >= 0) { body.found = true; g.lastKnown = { x: player.x, y: player.y }; setAlert(g); }
    if (target.alive && e !== target && canSee(target, e.x, e.y, lvl) >= 0) targetFlee();
    let screams = 0;
    for (const c of civs) {
      if (c.mode === 'flee' || dist(c.x, c.y, e.x, e.y) > 5 * T || !los(c.x, c.y, e.x, e.y, BLOCK_SIGHT)) continue;
      civFlee(c, e.x, e.y);
      if (screams < 2) { bark(c, pick(BARK_SCREAM)); screams++; }
    }
    if (screams) { sfx('scream'); for (const g of guards) if (g.alive && g.state !== 'alert' && g.state !== 'search' && dist(g.x, g.y, e.x, e.y) < 7 * T) startSearch(g, e.x, e.y); }
    if (e === target) onTargetKilled();
  }
  function onTargetKilled() {
    state.objective = 'escape'; state.timeScale = 0.3; state.timeScaleT = 1.4; heat = Math.max(heat, 1.4);
    showBanner('حسن آغا مات', 'الإتاوة اتدفعت… بالدم');
    showSubtitle('حسن آغا: «فاكر إنك غيّرت حاجة؟ الباشا هيبعت غيري… والألباني اللي جاي أخطر مننا كلنا.»', 6);
    for (const [tx, ty] of [[55, 41], [56, 40], [57, 40]]) { const g = mkGuard(tx, ty, { route: [[47, 40], [47, 20]], wi: 0 }); guards.push(g); startSearch(g, target.x, target.y); }
    for (const g of guards) if (g.alive && g.role === 'escort' && g.state !== 'alert') startSearch(g, target.x, target.y);
  }

  // ---------- التحديث ----------
  function update(dt, rdt) {
    state.time += dt;
    if (state.phase === 'play') stats.time += rdt;
    if (state.timeScaleT > 0) { state.timeScaleT -= rdt; if (state.timeScaleT <= 0) state.timeScale = 1; }
    const play = state.phase === 'play';
    if (play) {
      state.eagle = !!keys.KeyQ || eagleToggle;
      updatePlayer(dt);
      updatePlayerStatus();
    }
    updateTarget(dt);
    for (const g of guards) updateGuard(g, dt);
    for (const c of civs) updateCiv(c, dt);
    updateArrows(dt);
    separate();
    for (let i = effects.length - 1; i >= 0; i--) { const f = effects[i]; f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= 0.9; f.vy *= 0.9; f.life -= dt; if (f.life <= 0) effects.splice(i, 1); }
    for (const b of bodies) b.t += dt;
    if (!play) return;

    const p = player;
    if (actionQueued) { actionQueued = false; performAction(computeContext()); }
    if (state.eagle && target.alive && dist(p.x, p.y, target.x, target.y) < 14 * T && !state.targetKnown) { state.targetKnown = true; showBanner('عين الصقر', 'شايف حسن آغا'); }

    const alertN = guards.reduce((n, g) => n + (g.alive && g.state === 'alert' ? 1 : 0), 0);
    state.alertN = alertN;
    if (alertN) state.calmT = 0; else state.calmT += dt;
    if (p.alive && p.hp < p.maxHp && state.calmT > 5) { p.regenT += dt; if (p.regenT > 3) { p.hp++; p.regenT = 0; } }
    heat = Math.max(1, heat - dt * 0.004);

    state.ambientT -= dt;
    if (state.ambientT <= 0) {
      state.ambientT = 5 + Math.random() * 4;
      const near = civs.filter(c => !c.bark && c.mode !== 'flee' && dist(c.x, c.y, p.x, p.y) < 5 * T);
      if (near.length) bark(pick(near), pick(BARK_CIV), 3.2);
    }
    if (state.objective === 'escape' && p.alive && p.level === 'ground' && dist(p.x, p.y, DOOR.x, DOOR.y) < 0.8 * T && !state.endKind) {
      if (!alertN) { state.endKind = 'win'; state.endT = 0.3; sfx('win'); }
      else if (state.doorWarnT <= 0) { showBanner('فيه عسكر وراك!', 'ضيّعهم الأول قبل ما تدخل البيت'); state.doorWarnT = 4; }
    }
    if (state.doorWarnT > 0) state.doorWarnT -= dt;
    if (state.endKind) { state.endT -= rdt; if (state.endT <= 0) endGame(state.endKind); }
    if (state.syncT > 0) state.syncT -= rdt;
  }

  // ---------- الرسم ----------
  const canvas = document.getElementById('game'), gameCtx = canvas.getContext('2d');
  let ctx = gameCtx;
  let W = 0, VH = 0, dpr = 1, baseScale = 2;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; VH = innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(VH * dpr);
    baseScale = clamp(Math.sqrt(W * VH / (T * T * 250)), 0.9, 2.6);
  }
  window.addEventListener('resize', resize); resize();

  function ell(x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); ctx.fill(); }
  function circ(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  function line(x0, y0, x1, y1) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  function drawGroundTile(tx, ty, c) {
    const x = tx * T, y = ty * T, h = hash2(tx, ty);
    let base = c;
    if (c === 'S' || c === 'F') base = ',';
    else if (c === 'P') base = (tileAt(tx + 1, ty) === ',' || tileAt(tx - 1, ty) === ',' || tileAt(tx, ty + 1) === ',' || tileAt(tx, ty - 1) === ',') ? ',' : '.';
    else if (c === 'H' || c === 'D' || c === 'G') base = '.';
    if (base === '.') {
      ctx.fillStyle = h < 0.5 ? C.sand : C.sand2; ctx.fillRect(x, y, T, T);
      ctx.fillStyle = C.speck;
      ctx.fillRect(x + h * 28, y + hash2(ty, tx) * 28, 2, 2); ctx.fillRect(x + hash2(tx + 3, ty) * 28, y + hash2(tx, ty + 5) * 28, 3, 2);
    } else if (base === ',') {
      ctx.fillStyle = C.plaza; ctx.fillRect(x, y, T, T);
      ctx.fillStyle = C.plazaLine; ctx.fillRect(x, y, T, 1); ctx.fillRect(x, y + 16, T, 1);
      ctx.fillRect(x + (ty % 2 ? 0 : 16), y, 1, 16); ctx.fillRect(x + (ty % 2 ? 16 : 0), y + 16, 1, 16);
    } else if (base === '~') {
      ctx.fillStyle = C.water; ctx.fillRect(x, y, T, T);
      ctx.fillStyle = 'rgba(190,230,235,.35)';
      const o = (state.t * 9 + h * T) % T; ctx.fillRect(x + o * 0.7, y + 8 + h * 6, 7, 1.5); ctx.fillRect(x + ((o + 15) % T) * 0.8, y + 22, 6, 1.5);
    } else if (base === '=') {
      ctx.fillStyle = C.water; ctx.fillRect(x, y, T, T);
      ctx.fillStyle = C.bridge; ctx.fillRect(x, y + (tileAt(tx, ty - 1) === '=' ? 0 : 3), T, T - (tileAt(tx, ty - 1) === '=' ? 0 : 3) - (tileAt(tx, ty + 1) === '=' ? 0 : 3));
      ctx.fillStyle = 'rgba(60,35,15,.35)'; for (let i = 4; i < T; i += 6) ctx.fillRect(x + i, y, 1, T);
      ctx.fillStyle = '#6e5236';
      if (tileAt(tx, ty - 1) !== '=') ctx.fillRect(x, y + 2, T, 3);
      if (tileAt(tx, ty + 1) !== '=') ctx.fillRect(x, y + T - 5, T, 3);
    }
    if (base !== '~' && base !== '=') {
      ctx.fillStyle = 'rgba(60,30,10,.2)';
      if (SHADOWER.has(tileAt(tx - 1, ty))) ctx.fillRect(x, y, 12, T);
      if (SHADOWER.has(tileAt(tx, ty - 1))) ctx.fillRect(x, y, T, 5);
    }
    if (c === 'S') drawStall(tx, ty, x, y);
    else if (c === 'F') {
      ctx.fillStyle = '#bdb096'; circ(x + 16, y + 16, 14); ctx.fillStyle = '#d8ccb2'; circ(x + 16, y + 16, 12);
      ctx.fillStyle = '#4f9db0'; circ(x + 16, y + 16, 8.5);
      ctx.fillStyle = 'rgba(255,255,255,.6)'; const s = state.t * 2; circ(x + 16 + Math.cos(s) * 4, y + 16 + Math.sin(s) * 4, 1.4);
    } else if (c === 'H') drawHay(tx, ty, x, y);
    else if (c === 'P') { ctx.fillStyle = 'rgba(30,20,5,.25)'; ell(x + 22, y + 22, 13, 8); ctx.fillStyle = '#6b4a2a'; circ(x + 16, y + 16, 4); }
    else if (c === 'D') {
      ctx.fillStyle = '#2f5d3a'; ctx.fillRect(x + T - 7, y + 4, 7, 24); ctx.fillStyle = '#c9a443'; circ(x + T - 5, y + 16, 1.5);
      const g = ctx.createRadialGradient(x + T - 8, y + 6, 1, x + T - 8, y + 6, 18); g.addColorStop(0, 'rgba(255,200,90,.55)'); g.addColorStop(1, 'rgba(255,200,90,0)');
      ctx.fillStyle = g; ctx.fillRect(x - 6, y - 10, T + 6, T + 10);
    }
  }
  function drawStall(tx, ty, x, y) {
    const left = tileAt(tx - 1, ty) !== 'S', v = hash2(Math.floor(tx / 2), ty);
    const cA = ['#b5523b', '#3f6e8c', '#5c7a3a', '#9a4f7a'][Math.floor(v * 4)];
    ctx.fillStyle = '#7a5532'; ctx.fillRect(x + (left ? 3 : 0), y + 8, T - 3, 20);
    const goods = ['#e08a2c', '#c8432b', '#e3c35a', '#7a9a3a', '#8c5a3c'];
    for (let i = 0; i < 4; i++) { ctx.fillStyle = goods[Math.floor(hash2(tx * 3 + i, ty) * goods.length)]; ell(x + 6 + i * 6.5, y + 21, 3.2, 2.6); }
    for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#efe4cf' : cA; ctx.fillRect(x + (left ? 2 : 0) + i * 7.5, y - 2, 7.5, 13); }
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(x + (left ? 2 : 0), y + 11, T - 2, 2);
  }
  function drawHay(tx, ty, x, y) {
    const p = player, inside = p.hidden && Math.floor(p.x / T) === tx && Math.floor(p.y / T) === ty;
    const j = inside && p.moving ? Math.sin(state.t * 30) * 1 : 0;
    ctx.fillStyle = 'rgba(30,20,5,.25)'; ell(x + 19, y + 20, 14, 9);
    ctx.fillStyle = '#3d2a18'; ell(x + 4, y + 16, 3, 7); ell(x + 28, y + 16, 3, 7);
    ctx.fillStyle = '#7a5530'; ctx.fillRect(x + 4, y + 6, 24, 20);
    ctx.fillStyle = '#e3c25a'; ell(x + 16 + j, y + 15, 12, 9);
    ctx.strokeStyle = '#c9a43c'; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) { const a = hash2(tx + i, ty) * TAU; line(x + 16 + j, y + 15, x + 16 + j + Math.cos(a) * 10, y + 15 + Math.sin(a) * 7); }
    if (inside) { ctx.fillStyle = 'rgba(244,239,228,.85)'; ell(x + 16 + j, y + 13, 3.2, 2.4); }
    if (state.eagle) { ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.5; ctx.strokeRect(x + 3, y + 5, 26, 22); }
  }
  function drawRoofTile(tx, ty, c) {
    const x = tx * T, y = ty * T - H, id = bid[ty][tx];
    const base = c === 'M' ? C.mosque : C.roofs[id % C.roofs.length];
    const h = hash2(tx * 7 + 1, ty * 3 + 2);
    if (!ROOF.has(tileAt(tx, ty + 1))) {
      ctx.fillStyle = shade(base, 0.62); ctx.fillRect(x, y + T, T, H);
      if (c === 'M') { ctx.fillStyle = shade(base, 0.42); ctx.fillRect(x + 12, y + T + 4, 8, H - 4); circ(x + 16, y + T + 4, 4); }
      else if (h < 0.45) {
        ctx.fillStyle = '#5a3c22'; ctx.fillRect(x + 7, y + T + 1, 18, H - 2);
        ctx.strokeStyle = '#8a6440'; ctx.lineWidth = 0.8;
        for (let i = 10; i < 25; i += 3) line(x + i, y + T + 1, x + i, y + T + H - 1);
        line(x + 7, y + T + H / 2, x + 25, y + T + H / 2);
      } else if (h < 0.75) { ctx.fillStyle = '#3a2a1c'; ctx.fillRect(x + 13, y + T + 3, 6, H - 3); circ(x + 16, y + T + 3, 3); }
    }
    ctx.fillStyle = base; ctx.fillRect(x, y, T, T);
    const same = (ax, ay) => ay >= 0 && ay < MH && ax >= 0 && ax < MW && bid[ay][ax] === id && ROOF.has(map[ay][ax]);
    ctx.fillStyle = shade(base, 1.18);
    if (!same(tx, ty - 1)) ctx.fillRect(x, y, T, 3);
    if (!same(tx - 1, ty)) ctx.fillRect(x, y, 3, T);
    ctx.fillStyle = shade(base, 0.82);
    if (!same(tx, ty + 1)) ctx.fillRect(x, y + T - 3, T, 3);
    if (!same(tx + 1, ty)) ctx.fillRect(x + T - 3, y, 3, T);
    if (c === 'M') {
      ctx.fillStyle = shade(base, 0.9);
      if (!same(tx, ty - 1)) for (let i = 2; i < T; i += 8) ctx.fillRect(x + i, y - 3, 4, 4);
      return;
    }
    if (h < 0.07) { ctx.fillStyle = '#8a5a34'; circ(x + 10, y + 11, 4); circ(x + 19, y + 15, 4.5); ctx.fillStyle = '#3d2614'; circ(x + 10, y + 11, 1.6); circ(x + 19, y + 15, 1.8); }
    else if (h < 0.12) {
      ctx.strokeStyle = 'rgba(60,40,20,.6)'; ctx.lineWidth = 0.8; line(x + 3, y + 8, x + 29, y + 12);
      ['#e9e4d8', '#b8432f', '#3f6e8c'].forEach((cl, i) => { ctx.fillStyle = cl; ctx.fillRect(x + 6 + i * 8, y + 8.5 + i * 1.2, 5, 7); });
    } else if (h < 0.16) { ctx.fillStyle = '#8b6a43'; ctx.fillRect(x + 9, y + 9, 14, 14); ctx.strokeStyle = '#5e4429'; ctx.lineWidth = 1; ctx.strokeRect(x + 9.5, y + 9.5, 13, 13); line(x + 9, y + 9, x + 23, y + 23); }
    else if (h < 0.19) { const g = ctx.createRadialGradient(x + 13, y + 12, 1, x + 16, y + 16, 10); g.addColorStop(0, shade(base, 1.3)); g.addColorStop(1, shade(base, 0.8)); ctx.fillStyle = g; circ(x + 16, y + 16, 9); }
    else if (h < 0.22) { ctx.fillStyle = '#8e2b25'; ctx.fillRect(x + 6, y + 6, 20, 14); ctx.strokeStyle = '#d9a441'; ctx.lineWidth = 1; ctx.strokeRect(x + 8.5, y + 8.5, 15, 9); }
    else if (h < 0.25) { ctx.fillStyle = shade(base, 0.7); ctx.fillRect(x + 8, y + 8, 16, 11); ctx.fillStyle = '#3a2a1c'; ctx.fillRect(x + 10, y + 10, 12, 4); }
    else if (h < 0.28) { ctx.fillStyle = '#7a4a2a'; circ(x + 12, y + 20, 3.5); ctx.fillStyle = '#5c8a3a'; circ(x + 12, y + 18, 4.5); }
    else { ctx.fillStyle = 'rgba(80,50,20,.12)'; ctx.fillRect(x + h * 26, y + hash2(ty, tx) * 26, 3, 2); }
  }
  function drawWallTile(tx, ty) {
    const x = tx * T, y = ty * T - H;
    if (!SHADOWER.has(tileAt(tx, ty + 1)) && ty + 1 < MH) { ctx.fillStyle = shade(C.wall, 0.6); ctx.fillRect(x, y + T, T, H); }
    ctx.fillStyle = C.wall; ctx.fillRect(x, y, T, T);
    ctx.fillStyle = shade(C.wall, 1.15); for (let i = 3; i < T; i += 10) ctx.fillRect(x + i, y + 3, 5, 5);
    if (ty === MH - 1 && tx === 55) { // باب القلعة
      ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.moveTo(x + 8, y + T); ctx.lineTo(x + 8, y + 14); ctx.arc(x + 64, y + 14, 56, Math.PI, 0); ctx.lineTo(x + 120, y + T); ctx.fill();
      ctx.fillStyle = '#5e3f22'; ctx.fillRect(x + 20, y + 12, 88, T - 12);
      ctx.strokeStyle = '#3b2716'; ctx.lineWidth = 2; for (let i = 32; i < 108; i += 12) line(x + i, y + 12, x + i, y + T);
    }
  }
  function drawDecor(tx0, ty0, tx1, ty1) {
    // قبة الأزهر
    if (tx1 >= 38 && tx0 <= 45 && ty1 >= 18 && ty0 <= 23) {
      const cx = 42 * T, cy = 21 * T - H;
      const g = ctx.createRadialGradient(cx - 10, cy - 10, 4, cx, cy, 34); g.addColorStop(0, '#fbf6ec'); g.addColorStop(1, '#bfb29a');
      ctx.fillStyle = 'rgba(40,25,10,.25)'; ell(cx + 8, cy + 8, 32, 28);
      ctx.fillStyle = g; circ(cx, cy, 30); ctx.fillStyle = '#c9a443'; circ(cx, cy, 3);
      ctx.strokeStyle = 'rgba(150,135,110,.5)'; ctx.lineWidth = 1; for (let a = 0; a < TAU; a += TAU / 12) line(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6, cx + Math.cos(a) * 30, cy + Math.sin(a) * 30);
      for (const [dx, dy] of [[-2.6, 0], [2.6, 0]]) { const x = cx + dx * T, y = cy + dy * T; ctx.fillStyle = '#d8ccb6'; circ(x, y, 12); ctx.fillStyle = '#f2ebde'; circ(x - 3, y - 3, 7); }
    }
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
      const c = map[ty][tx];
      if (c === 'P') {
        const x = tx * T + 16, y = ty * T + 16 - 16, h = hash2(tx, ty) * TAU;
        for (let i = 0; i < 7; i++) {
          const a = h + i * TAU / 7, ex = x + Math.cos(a) * 17, ey = y + Math.sin(a) * 13;
          ctx.strokeStyle = '#2f5a26'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * 10, y + Math.sin(a) * 6 - 4, ex, ey); ctx.stroke();
          ctx.strokeStyle = '#5d8f3e'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * 10, y + Math.sin(a) * 6 - 4, ex, ey); ctx.stroke();
        }
        ctx.lineCap = 'butt'; ctx.fillStyle = '#4a3a1e'; circ(x, y, 3);
      } else if (c === 'T') {
        const x = tx * T + 16, y = ty * T + 16;
        ctx.fillStyle = 'rgba(40,25,10,.3)'; ell(x + 26, y + 14, 30, 7, 0.3);
        ctx.fillStyle = '#d9cfbc'; ctx.fillRect(x - 9, y - TOWER_Z, 18, TOWER_Z);
        ctx.fillStyle = '#b9ad95'; ctx.fillRect(x + 2, y - TOWER_Z, 7, TOWER_Z);
        ctx.fillStyle = '#e8dfcf'; ell(x, y - 24, 12, 5); ell(x, y - TOWER_Z, 12, 7);
        ctx.fillStyle = '#c9bea8'; ell(x, y - TOWER_Z, 8, 5);
        ctx.fillStyle = '#efe7d8'; ctx.beginPath(); ctx.moveTo(x - 6, y - TOWER_Z - 2); ctx.lineTo(x, y - TOWER_Z - 22); ctx.lineTo(x + 6, y - TOWER_Z - 2); ctx.fill();
        ctx.fillStyle = '#c9a443'; circ(x, y - TOWER_Z - 23, 2);
        if (!state.synced) { ctx.fillStyle = `rgba(224,169,74,${0.5 + Math.sin(state.t * 3) * 0.3})`; ctx.beginPath(); ctx.moveTo(x, y - TOWER_Z - 34); ctx.lineTo(x - 5, y - TOWER_Z - 42); ctx.lineTo(x + 5, y - TOWER_Z - 42); ctx.fill(); }
      }
    }
    // أعلام على باب القلعة
    if (ty1 >= MH - 2 && tx1 >= 54) for (const fx of [54.3, 59.6]) {
      const x = fx * T, y = (MH - 1) * T - H - 2;
      ctx.strokeStyle = '#3b2716'; ctx.lineWidth = 1.5; line(x, y, x, y - 22);
      ctx.fillStyle = '#b3261e'; const w = Math.sin(state.t * 4 + fx) * 2;
      ctx.beginPath(); ctx.moveTo(x, y - 22); ctx.lineTo(x + 14, y - 20 + w); ctx.lineTo(x, y - 12); ctx.fill();
      ctx.fillStyle = '#f3ede0'; circ(x + 5, y - 17.5, 2.2); ctx.fillStyle = '#b3261e'; circ(x + 6, y - 17.8, 1.8);
    }
  }

  function drawHead(c, s) {
    switch (c.head) {
      case 'hood':
        ctx.fillStyle = c.headC; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(0, -5); ctx.lineTo(0, 5); ctx.fill();
        circ(1, 0, 5.2); ctx.fillStyle = '#d6d0c2'; ell(-1, 0, 3, 3.6); ctx.fillStyle = '#2e2218'; ell(4.6, 0, 1.4, 2.8); break;
      case 'turban':
        ctx.fillStyle = c.headC; circ(1, 0, 6.6 * s); ctx.strokeStyle = '#d4cab6'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(1, 0, 4.5 * s, 0, TAU); ctx.stroke();
        ctx.fillStyle = '#2f6b46'; circ(1, 0, 2.4); ctx.fillStyle = '#e0b04a'; circ(4.2, 0, 1.4); break;
      case 'bork':
        ctx.fillStyle = c.headC; ell(-6, 0, 7.5, 3.4); circ(1, 0, 4.8); ctx.fillStyle = '#c9a443'; ell(1, 0, 2.2, 1.6); break;
      case 'fez': ctx.fillStyle = '#c99d78'; circ(1, 0, 4.4); ctx.fillStyle = c.headC; circ(1, 0, 3.6); ctx.fillStyle = '#1a1a1a'; circ(-0.6, 1.2, 1); break;
      case 'veil': ctx.fillStyle = c.headC; circ(1, 0, 4.9); ctx.fillStyle = 'rgba(90,100,150,.25)'; circ(0, -1.5, 2.5); break;
      case 'cap': ctx.fillStyle = '#8a6a4a'; circ(1, 0, 4.5); ctx.fillStyle = c.headC; circ(0.6, 0, 3.6); break;
      default: ctx.fillStyle = c.headC; circ(1, 0, 4.9); ctx.strokeStyle = 'rgba(120,100,70,.5)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(1, 0, 3.2, 0, TAU); ctx.stroke();
    }
  }
  function drawPerson(e, x, y, alpha = 1) {
    const c = e.cols, s = e.big ? 1.15 : 1;
    const fast = e.sprint || e.state === 'alert' || e.mode === 'flee' || (e.kind === 'target' && e.state === 'flee');
    const step = e.moving ? Math.sin(e.walkT * (fast ? 16 : 10)) : 0;
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(25,12,0,.28)'; ell(2.5, 3 + (e.zOff > 0 ? 2 : 0), 9 * s, 6.5 * s);
    ctx.rotate(e.facing);
    if (e.moving) { ctx.fillStyle = '#2b1d12'; ell(step * 4, -3.6 * s, 3, 2); ell(-step * 4, 3.6 * s, 3, 2); }
    if (c.weapon === 'spear') {
      const thrust = e.swingT > 0 ? 6 : (e.atk && e.atk.phase === 'windup' ? -3 : 0);
      ctx.strokeStyle = '#5b3d22'; ctx.lineWidth = 1.6; line(-7 + thrust, 7, 15 + thrust, 7);
      ctx.fillStyle = '#cfd3d6'; ctx.beginPath(); ctx.moveTo(15 + thrust, 4.8); ctx.lineTo(21 + thrust, 7); ctx.lineTo(15 + thrust, 9.2); ctx.fill();
    }
    ctx.fillStyle = c.robe; ell(0, 0, 6.5 * s, 8.6 * s);
    if (c.trim) { ctx.strokeStyle = c.trim; ctx.lineWidth = 1.8; line(-0.5, -8 * s, -0.5, 8 * s); }
    ctx.fillStyle = shade(c.robe, 0.82); ell(1.5, -7.2 * s, 3, 2.4); ell(1.5, 7.2 * s, 3, 2.4);
    if (c.weapon === 'bow') { ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(3, 0, 9, -1.1, 1.1); ctx.stroke(); ctx.strokeStyle = 'rgba(240,230,210,.7)'; ctx.lineWidth = 0.6; line(3 + Math.cos(-1.1) * 9, Math.sin(-1.1) * 9, 3 + Math.cos(1.1) * 9, Math.sin(1.1) * 9); }
    if (e === player && e.swingT > 0) { ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(4, 0, 13, -0.9, 0.9); ctx.stroke(); }
    drawHead(c, s);
    if (e.atk && e.atk.phase === 'windup') { ctx.strokeStyle = 'rgba(230,50,30,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 12, 0, TAU); ctx.stroke(); }
    ctx.restore();
  }
  function drawBody(b) {
    ctx.save(); ctx.translate(b.x, b.y - b.zOff);
    ctx.fillStyle = 'rgba(110,15,10,.75)'; circ(3, 2, Math.min(12, 3 + b.t * 8));
    ctx.rotate(b.facing + 0.6);
    ctx.fillStyle = b.cols.robe; ell(0, 0, 11, 6.5);
    ctx.fillStyle = b.cols.headC || '#e9e1d0'; circ(11, 0, b.big ? 5.5 : 4.4);
    ctx.restore();
  }
  function conePoly(g) {
    const pts = [], n = 16, blk = g.level === 'roof' ? TOWER_ONLY : BLOCK_SIGHT;
    for (let i = 0; i <= n; i++) {
      const a = g.facing - g.fov / 2 + g.fov * i / n, cs = Math.cos(a), sn = Math.sin(a);
      let r = 0; while (r < g.range) { r += 8; if (blk.has(tileAtPx(g.x + cs * r, g.y + sn * r))) { r -= 4; break; } }
      pts.push(g.x + cs * r, g.y + sn * r);
    }
    return pts;
  }
  function drawCone(g, mul) {
    const pts = conePoly(g), off = g.zOff;
    const col = g.state === 'alert' ? '230,60,40' : (g.state === 'suspicious' || g.state === 'search') ? '255,180,60' : '255,240,200';
    const a = (g.state === 'patrol' || g.state === 'return' ? 0.07 : 0.13) * mul;
    const grd = ctx.createRadialGradient(g.x, g.y - off, 4, g.x, g.y - off, g.range);
    grd.addColorStop(0, `rgba(${col},${a * 1.6})`); grd.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = grd; ctx.beginPath(); ctx.moveTo(g.x, g.y - off);
    for (let i = 0; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1] - off);
    ctx.closePath(); ctx.fill();
  }
  function glow(x, y, r, col) { const g = ctx.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, `rgba(${col},.95)`); g.addColorStop(0.45, `rgba(${col},.5)`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; circ(x, y, r); }

  function camScale() { return baseScale * state.zoomMul; }
  function w2s(x, y) { const s = camScale(); return [(x - cam.x) * s + W / 2, (y - cam.y) * s + VH / 2]; }

  function render(dt) {
    state.t += dt;
    const play = state.phase === 'play' || state.phase === 'paused' || state.phase === 'end';
    const p = player;
    // الكاميرا
    let zt = 1;
    if (p.level === 'tower' || (p.anim && p.anim.level === 'tower')) zt = 0.72;
    if (state.syncT > 0) zt = 0.5;
    state.zoomMul = lerp(state.zoomMul, zt, 1 - Math.exp(-dt * 2.5));
    if (play) {
      const k = 1 - Math.exp(-dt * 6);
      cam.x = lerp(cam.x, p.x, k); cam.y = lerp(cam.y, p.y - p.zOff, k);
    } else {
      cam.x = (30 + Math.sin(state.t * 0.05) * 10) * T; cam.y = (21 + Math.cos(state.t * 0.07) * 7) * T;
    }
    state.shake = Math.max(0, state.shake - dt * 25);
    const shx = (Math.random() - 0.5) * state.shake, shy = (Math.random() - 0.5) * state.shake;
    const s = camScale();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#2a1d12'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * (W / 2 - cam.x * s + shx), dpr * (VH / 2 - cam.y * s + shy));
    const vx0 = cam.x - W / 2 / s, vx1 = cam.x + W / 2 / s, vy0 = cam.y - VH / 2 / s, vy1 = cam.y + VH / 2 / s;
    const tx0 = Math.max(0, Math.floor(vx0 / T) - 1), tx1 = Math.min(MW - 1, Math.floor(vx1 / T) + 1);
    const ty0 = Math.max(0, Math.floor(vy0 / T) - 1), ty1 = Math.min(MH - 1, Math.floor((vy1 + TOWER_Z + 30) / T) + 1);
    const onScreen = (x, y, m = 40) => x > vx0 - m && x < vx1 + m && y > vy0 - m && y < vy1 + m + 20;

    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
      const c = map[ty][tx]; if (!ROOF.has(c) && c !== 'W' && c !== 'T') drawGroundTile(tx, ty, c);
    }
    if (state.objective === 'escape' && play) {
      const r = 14 + Math.sin(state.t * 4) * 3; ctx.strokeStyle = 'rgba(127,176,105,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(DOOR.x, DOOR.y, r, 0, TAU); ctx.stroke();
    }
    for (const b of bodies) if (b.level === 'ground' && onScreen(b.x, b.y)) drawBody(b);
    for (const g of guards) if (g.alive && g.level === 'ground' && onScreen(g.x, g.y, g.range)) drawCone(g, 1);
    const ents = [];
    for (const c of civs) if (onScreen(c.x, c.y)) ents.push(c);
    for (const g of guards) if (g.alive && g.level === 'ground' && onScreen(g.x, g.y)) ents.push(g);
    if (target.alive && onScreen(target.x, target.y)) ents.push(target);
    const pOnTop = p.level !== 'ground' || (p.anim && (p.zOff > H * 0.5 || p.anim.level !== 'ground'));
    if (play && p.alive && !p.hidden && !pOnTop) ents.push(p);
    ents.sort((a, b) => a.y - b.y);
    for (const e of ents) {
      if (e === p) { if (p.blend) { ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(p.x, p.y, 13, 0, TAU); ctx.stroke(); } drawPerson(p, p.x, p.y - p.zOff, p.blend ? 0.7 : 1); }
      else drawPerson(e, e.x, e.y);
    }
    if (play && !p.alive) drawBody({ x: p.x, y: p.y, zOff: 0, facing: p.facing, cols: p.cols, t: 1 });

    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
      const c = map[ty][tx];
      if (ROOF.has(c)) drawRoofTile(tx, ty, c);
      else if (c === 'W') drawWallTile(tx, ty);
      else if (c === 'T') { ctx.fillStyle = C.mosque; ctx.fillRect(tx * T, ty * T - H, T, T); ctx.fillStyle = shade(C.mosque, 0.62); ctx.fillRect(tx * T, ty * T + T - H, T, H); }
    }
    drawDecor(tx0, ty0, tx1, ty1);
    for (const b of bodies) if (b.level !== 'ground' && onScreen(b.x, b.y)) drawBody(b);
    for (const g of guards) if (g.alive && g.level === 'roof' && onScreen(g.x, g.y, g.range)) drawCone(g, 1);
    for (const g of guards) if (g.alive && g.level === 'roof' && onScreen(g.x, g.y)) drawPerson(g, g.x, g.y - g.zOff);
    if (play && p.alive && pOnTop) drawPerson(p, p.x, p.y - p.zOff);
    for (const a of arrows) { ctx.strokeStyle = '#3b2716'; ctx.lineWidth = 1.5; const ex = a.x - Math.cos(a.a) * 10, ey = a.y - Math.sin(a.a) * 10; line(ex, ey - 8, a.x, a.y - 8); ctx.fillStyle = '#ddd'; circ(a.x, a.y - 8, 1.4); }
    ctx.fillStyle = '#8e1a12'; for (const f of effects) { ctx.globalAlpha = clamp(f.life * 2, 0, 1); circ(f.x, f.y, 1.8); } ctx.globalAlpha = 1;

    if (state.eagle && play) {
      ctx.fillStyle = 'rgba(8,14,32,.62)'; ctx.fillRect(vx0 - 50, vy0 - 50, vx1 - vx0 + 100, vy1 - vy0 + 150);
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) if (map[ty][tx] === 'H') { ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.5; ctx.strokeRect(tx * T + 3, ty * T + 5, 26, 22); }
      for (const g of guards) if (g.alive && onScreen(g.x, g.y, g.range)) drawCone(g, 2.2);
      for (const c of civs) if (onScreen(c.x, c.y)) { ctx.fillStyle = 'rgba(150,170,200,.35)'; circ(c.x, c.y, 6); }
      for (const g of guards) if (g.alive && onScreen(g.x, g.y)) glow(g.x, g.y - g.zOff, 16, '230,50,40');
      if (target.alive) glow(target.x, target.y, 26, '255,200,70');
      glow(p.x, p.y - p.zOff, 14, '230,240,255');
    }
    drawScreenUI();
  }

  function drawScreenUI() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // جو الغروب
    const g = ctx.createLinearGradient(0, 0, W, VH);
    g.addColorStop(0, 'rgba(255,170,80,.10)'); g.addColorStop(1, 'rgba(50,20,70,.18)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, VH);
    const v = ctx.createRadialGradient(W / 2, VH / 2, Math.min(W, VH) * 0.35, W / 2, VH / 2, Math.max(W, VH) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(15,6,0,.5)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, VH);
    if (state.phase !== 'play' && state.phase !== 'paused') return;
    const p = player, s = camScale();
    ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const inView = (sx, sy) => sx > -20 && sx < W + 20 && sy > -20 && sy < VH + 20;

    for (const gd of guards) {
      if (!gd.alive) continue;
      const [sx, sy] = w2s(gd.x, gd.y - gd.zOff - 20 / s * 1.2 - 8);
      if (!inView(sx, sy)) continue;
      if (gd.state === 'alert') {
        ctx.fillStyle = '#c0392b'; circ(sx, sy, 9); ctx.fillStyle = '#fff'; ctx.font = '800 13px Cairo, sans-serif'; ctx.fillText('!', sx, sy + 1);
      } else if (gd.sus > 0.02 || gd.state === 'search' || gd.state === 'suspicious') {
        const f = gd.state === 'search' ? 1 : gd.sus;
        ctx.fillStyle = 'rgba(20,12,6,.7)'; circ(sx, sy, 9);
        ctx.strokeStyle = f > 0.6 ? '#e8833a' : '#f1dfb8'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(sx, sy, 7, -Math.PI / 2, -Math.PI / 2 + TAU * f); ctx.stroke();
        if (gd.state !== 'patrol') { ctx.fillStyle = '#ffe2b0'; ctx.font = '800 11px Cairo, sans-serif'; ctx.fillText('؟', sx, sy + 1); }
      }
    }
    // مؤشر الهدف أو البيت الآمن
    let obj = null, col = '#e0a94a';
    if (target.alive && state.targetKnown) obj = { x: target.x, y: target.y - 30 };
    else if (state.objective === 'escape') { obj = { x: DOOR.x, y: DOOR.y - 20 }; col = '#7fb069'; }
    else if (!state.synced) { obj = { x: MINARET.x, y: MINARET.y - TOWER_Z - 30 }; col = 'rgba(224,169,74,.6)'; }
    if (obj) {
      const [sx, sy] = w2s(obj.x, obj.y);
      const m = 34;
      if (sx > m && sx < W - m && sy > m + 60 && sy < VH - m) {
        if (obj.y !== MINARET.y - TOWER_Z - 30) {
          const b = Math.sin(state.t * 5) * 3;
          ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(sx, sy + 8 + b); ctx.lineTo(sx - 7, sy - 4 + b); ctx.lineTo(sx + 7, sy - 4 + b); ctx.fill();
        }
      } else {
        const cx = clamp(sx, m, W - m), cy = clamp(sy, m + 70, VH - m - (isTouch ? 150 : 0));
        const a = Math.atan2(sy - VH / 2, sx - W / 2);
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-6, -9); ctx.lineTo(-2, 0); ctx.lineTo(-6, 9); ctx.fill(); ctx.restore();
        const dm = Math.round(dist(p.x, p.y, obj.x, obj.y) / T * 3);
        ctx.fillStyle = '#f1dfb8'; ctx.font = '700 11px Cairo, sans-serif'; ctx.fillText(toAr(dm) + ' م', cx - Math.cos(a) * 22, cy - Math.sin(a) * 22);
      }
    }
    // الكلام
    ctx.font = '600 12px Cairo, sans-serif';
    const speakers = [target, ...guards, ...civs];
    for (const e of speakers) {
      if (!e.bark || !e.alive) continue;
      const [sx, sy] = w2s(e.x, e.y - (e.zOff || 0));
      const by = sy - 30;
      if (!inView(sx, by)) continue;
      const w = ctx.measureText(e.bark.text).width + 14;
      ctx.globalAlpha = clamp(e.bark.t * 2, 0, 1);
      ctx.fillStyle = e.kind === 'guard' ? 'rgba(70,16,12,.88)' : e.kind === 'target' ? 'rgba(25,55,35,.9)' : 'rgba(22,14,8,.82)';
      rr(sx - w / 2, by - 11, w, 22, 8); ctx.fill();
      ctx.fillStyle = '#fbeed2'; ctx.fillText(e.bark.text, sx, by + 1);
      ctx.globalAlpha = 1;
    }
    // تلميح الزرار
    const cx = computeContext(); state.context = cx;
    if (cx && !isTouch) {
      const ref = cx.e || p, [sx, sy] = w2s(ref.x, ref.y - (ref.zOff || 0));
      const label = 'E  ' + CTX_LABEL[cx.type];
      ctx.font = '800 12px Cairo, sans-serif';
      const w = ctx.measureText(label).width + 18;
      ctx.fillStyle = cx.type === 'counter' ? 'rgba(192,57,43,.95)' : 'rgba(224,169,74,.95)';
      rr(sx - w / 2, sy + 14, w, 22, 11); ctx.fill(); ctx.fillStyle = '#1b120a'; ctx.fillText(label, sx, sy + 25.5);
    }
    if (p.hurtT > 0) { ctx.fillStyle = `rgba(160,20,10,${p.hurtT * 0.5})`; ctx.fillRect(0, 0, W, VH); }
    if (p.hp <= 2 && p.alive) {
      const r = ctx.createRadialGradient(W / 2, VH / 2, Math.min(W, VH) * 0.3, W / 2, VH / 2, Math.max(W, VH) * 0.7);
      r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, `rgba(150,15,10,${0.25 + Math.sin(state.t * 4) * 0.1})`);
      ctx.fillStyle = r; ctx.fillRect(0, 0, W, VH);
    }
  }

  // ---------- واجهة اللعب ----------
  const $ = id => document.getElementById(id);
  const hud = $('hud'), hpEl = $('hp'), statusEl = $('status'), objEl = $('objective'), actBtn = $('btn-action'), eagleBtn = $('btn-eagle');
  const mini = $('minimap'), mctx = mini.getContext('2d');
  const MS = 3;
  mini.width = MW * MS; mini.height = MH * MS;
  const miniBg = document.createElement('canvas'); miniBg.width = mini.width; miniBg.height = mini.height;
  (function () {
    const m = miniBg.getContext('2d');
    const col = { '.': '#cdb187', ',': '#bba37f', 'H': '#cdb187', 'D': '#cdb187', 'G': '#cdb187', '#': '#8a6a45', 'M': '#e9e0cf', 'T': '#ffffff', 'W': '#3b2b1d', '~': '#3b7d8c', '=': '#9a7650', 'S': '#b5523b', 'F': '#4f9db0', 'P': '#4d7a3a' };
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { m.fillStyle = col[map[y][x]] || '#000'; m.fillRect(x * MS, y * MS, MS, MS); }
  })();
  function drawMinimap() {
    mctx.drawImage(miniBg, 0, 0);
    const p = player, k = MS / T;
    const s = camScale(), vw = W / s * k, vh = VH / s * k;
    mctx.strokeStyle = 'rgba(255,255,255,.5)'; mctx.lineWidth = 1; mctx.strokeRect(cam.x * k - vw / 2, cam.y * k - vh / 2, vw, vh);
    if (!state.synced) { mctx.fillStyle = '#e0a94a'; mctx.fillRect(MINARET.x * k - 2, MINARET.y * k - 2, 4, 4); }
    if (state.objective === 'escape') { mctx.fillStyle = '#7fb069'; mctx.beginPath(); mctx.arc(DOOR.x * k, DOOR.y * k, 3.5, 0, TAU); mctx.fill(); }
    for (const g of guards) if (g.alive && (g.state === 'alert' || state.eagle)) { mctx.fillStyle = g.state === 'alert' ? '#e53935' : '#ff8a65'; mctx.fillRect(g.x * k - 1.5, g.y * k - 1.5, 3, 3); }
    if (target.alive && state.targetKnown) { mctx.fillStyle = '#ffd54f'; mctx.beginPath(); mctx.arc(target.x * k, target.y * k, 3.5, 0, TAU); mctx.fill(); mctx.strokeStyle = '#1b120a'; mctx.stroke(); }
    mctx.fillStyle = '#ffffff'; mctx.beginPath(); mctx.arc(p.x * k, p.y * k, 3, 0, TAU); mctx.fill();
  }
  const hudCache = {};
  function setText(el, key, v) { if (hudCache[key] !== v) { hudCache[key] = v; el.textContent = v; } }
  function updateHUD(force) {
    if (force) for (const k in hudCache) delete hudCache[k];
    const p = player; if (!p) return;
    const hpKey = p.hp + '/' + p.maxHp;
    if (hudCache.hp !== hpKey) { hudCache.hp = hpKey; hpEl.innerHTML = ''; for (let i = 0; i < p.maxHp; i++) { const d = document.createElement('i'); if (i >= p.hp) d.className = 'off'; hpEl.appendChild(d); } }
    let st = 'مجهول', lv = 'calm';
    const anySearch = guards.some(g => g.alive && (g.state === 'search' || g.state === 'suspicious'));
    if (state.alertN) { st = 'مكشوف'; lv = 'alert'; }
    else if (p.hidden) { st = 'مستخبي'; lv = 'hidden'; }
    else if (p.blend) { st = 'وسط الناس'; lv = 'hidden'; }
    else if (anySearch) { st = 'مشتبه فيه'; lv = 'sus'; }
    else if (p.level === 'tower') { st = 'فوق المئذنة'; lv = 'hidden'; }
    setText(statusEl, 'st', st);
    if (hudCache.lv !== lv) { hudCache.lv = lv; statusEl.dataset.level = lv; }
    let o;
    if (state.objective === 'escape') o = 'اهرب للبيت الآمن في الحارة الشرقية — لازم ماحدش يكون وراك';
    else if (target.alive && target.state === 'flee') o = 'حسن آغا بيهرب على باب القلعة! الحقه';
    else if (state.targetKnown) o = 'اغتال حسن آغا — بيلم الإتاوات من دكاكين خان الخليلي';
    else o = 'اغتال حسن آغا — اطلع مئذنة الأزهر تكشف مكانه، أو دوّر عليه في خان الخليلي';
    setText(objEl, 'obj', o);
    const c = state.context;
    const label = c ? CTX_LABEL[c.type] : 'اغتيال';
    setText(actBtn.querySelector('span'), 'act', label);
    const cls = c ? (c.type === 'counter' ? 'ready danger' : 'ready') : '';
    if (hudCache.actc !== cls) { hudCache.actc = cls; actBtn.className = 'btn-round btn-action ' + cls; }
    const ec = state.eagle ? 'btn-round on' : 'btn-round';
    if (hudCache.ec !== ec) { hudCache.ec = ec; eagleBtn.className = ec; }
    drawMinimap();
  }

  let bannerT = null;
  function showBanner(title, sub) {
    const b = $('banner'); b.querySelector('b').textContent = title; b.querySelector('span').textContent = sub || '';
    b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
    clearTimeout(bannerT); bannerT = setTimeout(() => b.classList.remove('show'), 2800);
  }
  let subT = null;
  function showSubtitle(text, sec) { const el = $('subtitle'); el.textContent = text; el.classList.add('show'); clearTimeout(subT); subT = setTimeout(() => el.classList.remove('show'), sec * 1000); }
  function flash() { const f = $('flash'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }

  // ---------- الشاشات ----------
  const screens = ['screen-title', 'screen-story', 'screen-brief', 'screen-pause', 'screen-end'];
  function showScreen(id) { for (const s of screens) $(s).classList.toggle('hidden', s !== id); }
  const STORY = [
    ['القاهرة — ربيع ١٨٠٥', 'الوالي العثماني خورشيد باشا عاصر الناس ضرايب، وعساكر الدلاة بينهبوا الأسواق عيني عينك. البلد بتغلي.'],
    ['الأزهر بيتحرك', 'المشايخ والتجار ورا السيد عمر مكرم بيجهزوا يقلبوا على الباشا… والكل بيتكلم عن قائد ألباني اسمه محمد علي.'],
    ['أنا يوسف', 'ابن الصبّاغ. أبويا اتقتل قدام دكانه عشان رفض يدفع إتاوة لحسن آغا، جابي الباشا. من يومها وأنا في رابطة الخفاء.'],
    ['الليلة دي', 'حسن آغا بيلف على دكاكين خان الخليلي يلم الفلوس، ومعاه اتنين إنكشارية… بس مش هيوصل القلعة.'],
  ];
  let storyI = 0;
  function renderStory() {
    $('story-title').textContent = STORY[storyI][0]; $('story-text').textContent = STORY[storyI][1];
    $('story-dots').innerHTML = STORY.map((_, i) => `<i class="${i === storyI ? 'on' : ''}"></i>`).join('');
    $('story-next').textContent = storyI === STORY.length - 1 ? 'يلا' : 'التالي';
  }
  function startPlay() {
    newGame(); state.phase = 'play'; showScreen(null);
    hud.classList.remove('hidden'); document.body.classList.toggle('touch', isTouch);
    cam.x = player.x; cam.y = player.y;
    showBanner('خان الخليلي', 'القاهرة — ١٨٠٥');
  }
  function endGame(kind) {
    if (state.phase !== 'play') return;
    state.phase = 'end'; hud.classList.add('hidden'); joy.active = false; $('joy').classList.remove('on');
    const e = $('screen-end');
    const mins = Math.floor(stats.time / 60), secs = Math.floor(stats.time % 60);
    const time = toAr(mins) + ':' + toAr(String(secs).padStart(2, '0'));
    let title, text, extra = '';
    if (kind === 'win') {
      const rank = stats.detections === 0 ? 'شبح القاهرة' : stats.detections <= 2 ? 'ظل الحارة' : 'عاصفة الصحرا';
      title = 'تمت المهمة';
      text = 'حسن آغا مات، ودكاكين خان الخليلي مش هتدفع إتاوة تاني… على الأقل لحد ما الباشا يبعت غيره.';
      extra = `<div class="stats"><div><b>${time}</b><span>الوقت</span></div><div><b>${toAr(stats.detections)}</b><span>مرات انكشفت</span></div><div><b>${toAr(stats.kills)}</b><span>حراس</span></div><div><b>${rank}</b><span>لقبك</span></div></div>
      <p class="teaser">بعد أيام، المشايخ خلعوا خورشيد باشا، وقعد محمد علي على كرسي الولاية باسم الشعب. بس جت رسالة للرابطة من الأزهر: «الألباني بيجمع المماليك في القلعة… وناوي على حاجة كبيرة.»<br><b>يتبع: القلعة ١٨١١</b></p>`;
    } else if (kind === 'dead') { title = 'فقدت المزامنة'; text = 'يوسف وقع في إيد الإنكشارية… والذكرى دي ماحصلتش كده. جرّب تاني، وخليك في الضل.'; }
    else { title = 'الهدف هرب'; text = 'حسن آغا وصل باب القلعة واتحصّن جوه. المرة الجاية خليك بعيد عن عينه.'; }
    e.querySelector('h2').textContent = title; e.querySelector('.end-text').textContent = text; e.querySelector('.end-extra').innerHTML = extra;
    e.dataset.kind = kind;
    showScreen('screen-end');
  }
  function togglePause(force) {
    if (state.phase === 'play') { state.phase = 'paused'; showScreen('screen-pause'); }
    else if (state.phase === 'paused' && force !== true) { state.phase = 'play'; showScreen(null); }
  }
  function toggleMute() { Sound.setMuted(!Sound.muted); document.body.classList.toggle('muted', Sound.muted); }

  const tap = (id, fn) => $(id).addEventListener('click', e => { e.preventDefault(); Sound.init(); fn(); });
  tap('btn-start', () => { storyI = 0; renderStory(); showScreen('screen-story'); state.phase = 'story'; });
  tap('story-next', () => { if (storyI < STORY.length - 1) { storyI++; renderStory(); } else { showScreen('screen-brief'); state.phase = 'brief'; } });
  tap('story-skip', () => { showScreen('screen-brief'); state.phase = 'brief'; });
  tap('btn-go', startPlay);
  tap('btn-resume', () => togglePause());
  tap('btn-restart', startPlay);
  tap('btn-retry', startPlay);
  tap('btn-menu', () => { state.phase = 'title'; hud.classList.add('hidden'); newGame(); showScreen('screen-title'); });
  tap('btn-pause', () => togglePause());
  tap('btn-sound', toggleMute);
  tap('btn-sound2', toggleMute);
  const press = (id, fn) => $(id).addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); Sound.init(); fn(); });
  press('btn-action', () => { if (state.phase === 'play') actionQueued = true; });
  press('btn-eagle', () => { if (state.phase === 'play') eagleToggle = !eagleToggle; });
  document.body.classList.toggle('touch', isTouch);

  // ---------- الحلقة ----------
  newGame();
  let last = performance.now(), hudT = 0;
  function frame(now) {
    const rdt = Math.min(0.05, (now - last) / 1000); last = now;
    if (state.phase !== 'paused' && state.phase !== 'end') update(rdt * state.timeScale, rdt);
    render(rdt);
    hudT -= rdt;
    if (state.phase === 'play' && hudT <= 0) { updateHUD(); hudT = 0.08; }
    Sound.update(state.phase === 'play' && state.alertN > 0);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // للتجربة من الكونسول
  window.__cairo = { state, get player() { return player; }, get target() { return target; }, get guards() { return guards; }, get civs() { return civs; }, map, startPlay, COLS,
    // يرسم شخصية على كانفس تاني (لصفحة الشخصيات)
    drawPortrait(target, ent, x, y, scale) { ctx = target; ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); drawPerson(Object.assign({ facing: -Math.PI / 2, walkT: 0, moving: false, zOff: 0 }, ent), 0, 0); ctx.restore(); ctx = gameCtx; } };
})();
