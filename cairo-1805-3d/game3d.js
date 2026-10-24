'use strict';
// ظلال القاهرة ١٨٠٥ — نسخة ثلاثية الأبعاد (Three.js)
(() => {
  const V3 = THREE.Vector3;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
  const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
  const dampAng = (a, b, k, dt) => a + angDiff(a, b) * (1 - Math.exp(-k * dt));
  const smooth = t => t * t * (3 - 2 * t);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const AR = '٠١٢٣٤٥٦٧٨٩';
  const toAr = n => String(n).replace(/\d/g, d => AR[d]);
  function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const R = mulberry32(1805);
  const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  const $ = id => document.getElementById(id);

  // ---------- المشهد ----------
  const canvas = $('game');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isTouch, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isTouch ? 1.5 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe6b88c, 45, 150);
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 500);
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.fov = w < h ? 75 : 62; camera.updateProjectionMatrix();
    hud.width = Math.round(w * hudDpr); hud.height = Math.round(h * hudDpr);
  }
  const hud = $('hud-canvas'), hctx = hud.getContext('2d');
  const hudDpr = Math.min(window.devicePixelRatio || 1, 2);
  window.addEventListener('resize', resize);

  const sunDir = new V3(-0.55, 0.42, -0.72).normalize();
  scene.add(new THREE.HemisphereLight(0xffe0b8, 0x8a6440, 0.7));
  const sun = new THREE.DirectionalLight(0xffc488, 1.75);
  sun.castShadow = true;
  const SM = isTouch ? 1024 : 2048;
  sun.shadow.mapSize.set(SM, SM);
  Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 160 });
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04;
  scene.add(sun); scene.add(sun.target);

  const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { sunDir: { value: sunDir } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 sunDir; varying vec3 vDir;
      void main(){ float h = vDir.y; vec3 top = vec3(0.34,0.47,0.70); vec3 hor = vec3(1.0,0.74,0.50); vec3 bot = vec3(0.86,0.64,0.46);
        vec3 c = mix(hor, top, smoothstep(0.0, 0.55, h)); if (h < 0.0) c = mix(hor, bot, smoothstep(0.0, -0.2, h));
        float s = max(dot(normalize(vDir), sunDir), 0.0); c += vec3(1.0,0.78,0.45) * pow(s, 400.0) * 2.0 + vec3(1.0,0.62,0.32) * pow(s, 8.0) * 0.35;
        gl_FragColor = vec4(c, 1.0); }`,
  }));
  scene.add(sky);

  // ---------- الخامات ----------
  function canvasTex(w, h, draw, repeat = true) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 4;
    return t;
  }
  function speckle(g, w, h, n, cols, s0, s1, a = 0.35) {
    for (let i = 0; i < n; i++) { g.globalAlpha = a * Math.random(); g.fillStyle = pick(cols); const s = s0 + Math.random() * (s1 - s0); g.fillRect(Math.random() * w, Math.random() * h, s, s); }
    g.globalAlpha = 1;
  }
  const sandTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#d6b483'; g.fillRect(0, 0, w, h); speckle(g, w, h, 1800, ['#b8935f', '#e8cc9e', '#a8834f'], 1, 4); });
  sandTex.repeat.set(40, 40);
  const plazaTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#8a7356'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < 8; y++) for (let x = 0; x < 4; x++) {
      const off = y % 2 ? 32 : 0; g.fillStyle = pick(['#cbb08a', '#c2a680', '#d3b994', '#bda07a']);
      g.fillRect((x * 64 + off) % w + 2, y * 32 + 2, 60, 28); if (x === 3 && off) g.fillRect(2 - 32 + 0, y * 32 + 2, 30, 28);
    }
    speckle(g, w, h, 600, ['#8a7356', '#e3cfae'], 1, 3);
  });
  plazaTex.repeat.set(10, 10);
  function wallTex(base, style) {
    return canvasTex(256, 224, (g, w, h) => {
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      speckle(g, w, h, 900, ['#00000022', '#ffffff', '#8a6a44'], 2, 9, 0.12);
      const grd = g.createLinearGradient(0, h - 50, 0, h); grd.addColorStop(0, 'rgba(90,60,30,0)'); grd.addColorStop(1, 'rgba(90,60,30,.35)'); g.fillStyle = grd; g.fillRect(0, h - 50, w, 50);
      g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, 0, w, 10);
      g.fillStyle = 'rgba(80,55,30,.25)'; g.fillRect(0, 10, w, 3);
      const cx = w / 2;
      if (style === 'arch') {
        g.fillStyle = 'rgba(255,240,215,.5)'; g.fillRect(cx - 34, 70, 68, 100); g.beginPath(); g.arc(cx, 70, 34, Math.PI, 0); g.fill();
        g.fillStyle = '#2e2116'; g.fillRect(cx - 26, 74, 52, 92); g.beginPath(); g.arc(cx, 74, 26, Math.PI, 0); g.fill();
        g.strokeStyle = '#6b4a2b'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, 50); g.lineTo(cx, 166); g.moveTo(cx - 26, 110); g.lineTo(cx + 26, 110); g.stroke();
      } else if (style === 'mash') {
        g.fillStyle = '#4a2f18'; g.fillRect(cx - 44, 56, 88, 116);
        g.strokeStyle = '#8a6036'; g.lineWidth = 2;
        for (let x = cx - 40; x <= cx + 40; x += 8) { g.beginPath(); g.moveTo(x, 60); g.lineTo(x, 168); g.stroke(); }
        for (let y = 60; y <= 168; y += 8) { g.beginPath(); g.moveTo(cx - 40, y); g.lineTo(cx + 40, y); g.stroke(); }
        g.fillStyle = '#5c3b1f'; g.fillRect(cx - 50, 50, 100, 8); g.fillRect(cx - 50, 170, 100, 8);
      } else {
        g.fillStyle = 'rgba(255,240,215,.45)'; g.fillRect(cx - 32, 64, 64, 96);
        g.fillStyle = '#2f5a4a'; g.fillRect(cx - 28, 68, 27, 88); g.fillRect(cx + 1, 68, 27, 88);
        g.strokeStyle = '#21423a'; g.lineWidth = 2; for (let y = 74; y < 156; y += 7) { g.beginPath(); g.moveTo(cx - 28, y); g.lineTo(cx + 28, y); g.stroke(); }
      }
    });
  }
  const roofTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#c9a77a'; g.fillRect(0, 0, w, h); speckle(g, w, h, 1500, ['#a8855a', '#ddc29c', '#8f6e48'], 2, 7, 0.25);
    g.strokeStyle = 'rgba(90,60,30,.25)'; g.lineWidth = 1; for (let i = 0; i < 6; i++) { g.beginPath(); let x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (Math.random() - 0.5) * 40; y += (Math.random() - 0.5) * 40; g.lineTo(x, y); } g.stroke(); }
  });
  const stoneTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#9c8466'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < 8; y++) for (let x = -1; x < 5; x++) { g.fillStyle = pick(['#d8c7a8', '#cdb994', '#e2d3b6', '#c8b28c']); g.fillRect(x * 64 + (y % 2) * 32 + 2, y * 32 + 2, 60, 28); }
    speckle(g, w, h, 700, ['#7a654a', '#f0e4cc'], 1, 3);
  });
  const woodTex = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#6b4626'; g.fillRect(0, 0, w, h); g.strokeStyle = '#4a2f18'; for (let x = 0; x < w; x += 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } });
  const latticeTex = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#3e2714'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a6036'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } });
  const hayTex = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#d9b44a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b8902e'; for (let i = 0; i < 200; i++) { g.globalAlpha = 0.6; const x = Math.random() * w, y = Math.random() * h, a = Math.random() * TAU; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 12, y + Math.sin(a) * 12); g.stroke(); } g.globalAlpha = 1; });
  function awningTex(c1) { return canvasTex(64, 64, (g, w, h) => { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#efe4cf' : c1; g.fillRect(i * 16, 0, 16, h); } }); }

  const matCache = new Map();
  function std(o) { return new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.9, metalness: 0 }, o)); }
  function col(c) { let m = matCache.get(c); if (!m) { m = std({ color: c }); matCache.set(c, m); } return m; }
  const M = {
    sand: std({ map: sandTex }), plaza: std({ map: plazaTex }), roof: std({ map: roofTex }), stone: std({ map: stoneTex }),
    walls: [std({ map: wallTex('#d8b98d', 'arch') }), std({ map: wallTex('#caa274', 'mash') }), std({ map: wallTex('#e3d0b0', 'shut') }), std({ map: wallTex('#c79f7a', 'arch') })],
    wood: std({ map: woodTex }), lattice: std({ map: latticeTex }), hay: std({ map: hayTex }),
    steel: std({ color: 0xc9ccd0, metalness: 0.85, roughness: 0.3 }), gold: std({ color: 0xd9a441, metalness: 0.7, roughness: 0.35 }),
    water: std({ color: 0x3f8fa0, roughness: 0.15, metalness: 0.2 }), palm: std({ color: 0x4f7a32, side: THREE.DoubleSide }), trunk: std({ color: 0x6b4a2a }),
  };

  // ---------- بناء الهندسة ----------
  class GB {
    constructor() { this.p = []; this.n = []; this.u = []; }
    quad(a, b, c, d, uv) { // a=أسفل شمال، b=أسفل يمين، c=أعلى يمين، d=أعلى شمال (من بره)
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      for (const [p, t] of [[a, uv[0]], [b, uv[1]], [c, uv[2]], [a, uv[0]], [c, uv[2]], [d, uv[3]]]) { this.p.push(p[0], p[1], p[2]); this.n.push(nx, ny, nz); this.u.push(t[0], t[1]); }
    }
    walls(x0, z0, x1, z1, y0, y1, tw = 1, th = 1, fitTiles = false) {
      const w = x1 - x0, d = z1 - z0;
      const tx = fitTiles ? w / Math.max(1, Math.round(w / tw)) : tw, tz = fitTiles ? d / Math.max(1, Math.round(d / tw)) : tw;
      const v0 = y0 / th, v1 = y1 / th;
      this.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [[0, v0], [d / tz, v0], [d / tz, v1], [0, v1]]);
      this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [[0, v0], [d / tz, v0], [d / tz, v1], [0, v1]]);
      this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [[0, v0], [w / tx, v0], [w / tx, v1], [0, v1]]);
      this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [[0, v0], [w / tx, v0], [w / tx, v1], [0, v1]]);
    }
    top(x0, z0, x1, z1, y, ts = 1) { this.quad([x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0], [[x0 / ts, z1 / ts], [x1 / ts, z1 / ts], [x1 / ts, z0 / ts], [x0 / ts, z0 / ts]]); }
    box(x0, y0, z0, x1, y1, z1, ts = 1) { this.walls(x0, z0, x1, z1, y0, y1, ts, ts); this.top(x0, z0, x1, z1, y1, ts); }
    mesh(mat, cast = true, recv = true) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2));
      g.computeBoundingSphere();
      const m = new THREE.Mesh(g, mat); m.castShadow = cast; m.receiveShadow = recv; scene.add(m); return m;
    }
  }

  // ---------- العالم ----------
  const STEP = 0.4;
  const boxes = [];
  function addCollider(x0, z0, x1, z1, h, climb = true, kind = 'house') { const b = { x0, z0, x1, z1, h, climb, kind, q: 0 }; boxes.push(b); return b; }
  const HC = 8, hashMap = new Map();
  const hkey = (cx, cz) => (cx + 100) * 1000 + (cz + 100);
  let qstamp = 0;
  function boxesIn(x0, z0, x1, z1) {
    qstamp++; const out = [];
    for (let cx = Math.floor(x0 / HC); cx <= Math.floor(x1 / HC); cx++) for (let cz = Math.floor(z0 / HC); cz <= Math.floor(z1 / HC); cz++) {
      const l = hashMap.get(hkey(cx, cz)); if (!l) continue;
      for (const b of l) if (b.q !== qstamp) { b.q = qstamp; out.push(b); }
    }
    return out;
  }
  function groundAt(x, z, y, r = 0.12) {
    let g = 0;
    for (const b of boxesIn(x - r, z - r, x + r, z + r)) if (x > b.x0 - r && x < b.x1 + r && z > b.z0 - r && z < b.z1 + r && b.h <= y + STEP && b.h > g) g = b.h;
    return g;
  }
  function collide(p, r, y) {
    let hit = null;
    for (const b of boxesIn(p.x - r - 0.1, p.z - r - 0.1, p.x + r + 0.1, p.z + r + 0.1)) {
      if (b.h <= y + STEP) continue;
      const cx = clamp(p.x, b.x0, b.x1), cz = clamp(p.z, b.z0, b.z1), dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
      if (d2 >= r * r) continue;
      if (d2 > 1e-8) { const d = Math.sqrt(d2); p.x = cx + dx / d * r; p.z = cz + dz / d * r; hit = { b, nx: dx / d, nz: dz / d }; }
      else {
        const l = p.x - b.x0, rr = b.x1 - p.x, t = p.z - b.z0, bt = b.z1 - p.z, m = Math.min(l, rr, t, bt);
        if (m === l) { p.x = b.x0 - r; hit = { b, nx: -1, nz: 0 }; } else if (m === rr) { p.x = b.x1 + r; hit = { b, nx: 1, nz: 0 }; }
        else if (m === t) { p.z = b.z0 - r; hit = { b, nx: 0, nz: -1 }; } else { p.z = b.z1 + r; hit = { b, nx: 0, nz: 1 }; }
      }
    }
    return hit;
  }
  function segBox(ax, ay, az, bx, by, bz, b) {
    let t0 = 0, t1 = 1; const o = [ax, ay, az], d = [bx - ax, by - ay, bz - az], lo = [b.x0, 0, b.z0], hi = [b.x1, b.h, b.z1];
    for (let i = 0; i < 3; i++) {
      if (Math.abs(d[i]) < 1e-9) { if (o[i] < lo[i] || o[i] > hi[i]) return false; continue; }
      let ta = (lo[i] - o[i]) / d[i], tb = (hi[i] - o[i]) / d[i]; if (ta > tb) { const s = ta; ta = tb; tb = s; }
      if (ta > t0) t0 = ta; if (tb < t1) t1 = tb; if (t0 > t1) return false;
    }
    return true;
  }
  function losClear(a, b) {
    for (const bx of boxesIn(Math.min(a.x, b.x), Math.min(a.z, b.z), Math.max(a.x, b.x), Math.max(a.z, b.z))) if (segBox(a.x, a.y, a.z, b.x, b.y, b.z, bx)) return false;
    return true;
  }

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), M.sand); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(40, 44), M.plaza); plaza.rotation.x = -Math.PI / 2; plaza.position.y = 0.01; plaza.receiveShadow = true; scene.add(plaza);

  const wallGB = [new GB(), new GB(), new GB(), new GB()], roofGB = new GB(), stoneGB = new GB(), woodGB = new GB(), latGB = new GB();
  const decor = []; // ديكور بسيط
  function addHouse(x0, z0, x1, z1, h) {
    const v = Math.floor(R() * wallGB.length);
    wallGB[v].walls(x0, z0, x1, z1, 0, h, 4, 3.5, true);
    roofGB.top(x0, z0, x1, z1, h, 4);
    const pt = 0.18, ph = 0.4;
    stoneGB.box(x0, h, z0, x1, h + ph, z0 + pt, 2); stoneGB.box(x0, h, z1 - pt, x1, h + ph, z1, 2);
    stoneGB.box(x0, h, z0, x0 + pt, h + ph, z1, 2); stoneGB.box(x1 - pt, h, z0, x1, h + ph, z1, 2);
    addCollider(x0, z0, x1, z1, h);
    if (h >= 5) for (const side of [0, 1, 2, 3]) {
      if (R() > 0.35) continue;
      const along = side < 2 ? x1 - x0 : z1 - z0; if (along < 3) continue;
      const c = 1 + R() * (along - 2), y0 = 3.7, y1 = 5.0, dd = 0.55, hw = 0.8;
      if (side === 0) { latGB.walls(x0 + c - hw, z1, x0 + c + hw, z1 + dd, y0, y1); woodGB.box(x0 + c - hw - 0.08, y1, z1, x0 + c + hw + 0.08, y1 + 0.15, z1 + dd + 0.08); woodGB.box(x0 + c - hw, y0 - 0.15, z1, x0 + c + hw, y0, z1 + dd); }
      if (side === 1) { latGB.walls(x0 + c - hw, z0 - dd, x0 + c + hw, z0, y0, y1); woodGB.box(x0 + c - hw - 0.08, y1, z0 - dd - 0.08, x0 + c + hw + 0.08, y1 + 0.15, z0); woodGB.box(x0 + c - hw, y0 - 0.15, z0 - dd, x0 + c + hw, y0, z0); }
      if (side === 2) { latGB.walls(x1, z0 + c - hw, x1 + dd, z0 + c + hw, y0, y1); woodGB.box(x1, y1, z0 + c - hw - 0.08, x1 + dd + 0.08, y1 + 0.15, z0 + c + hw + 0.08); woodGB.box(x1, y0 - 0.15, z0 + c - hw, x1 + dd, y0, z0 + c + hw); }
      if (side === 3) { latGB.walls(x0 - dd, z0 + c - hw, x0, z0 + c + hw, y0, y1); woodGB.box(x0 - dd - 0.08, y1, z0 + c - hw - 0.08, x0, y1 + 0.15, z0 + c + hw + 0.08); woodGB.box(x0 - dd, y0 - 0.15, z0 + c - hw, x0, y0, z0 + c + hw); }
    }
    const nj = Math.floor(R() * 3);
    for (let i = 0; i < nj; i++) decor.push({ t: R() < 0.6 ? 'jar' : 'crate', x: x0 + 0.8 + R() * (x1 - x0 - 1.6), z: z0 + 0.8 + R() * (z1 - z0 - 1.6), y: h });
  }
  function fillBlock(x0, z0, x1, z1) {
    const d = z1 - z0; let rows = [[z0, z1]];
    if (d >= 12) { const m = z0 + Math.round(d * (0.4 + R() * 0.2)), gap = R() < 0.3 ? 2 : 0; rows = [[z0, m - gap / 2], [m + gap / 2, z1]]; }
    for (const [rz0, rz1] of rows) {
      let x = x0;
      while (x < x1 - 0.01) {
        let w = 4 + Math.floor(R() * 4); if (x1 - x - w < 4) w = x1 - x;
        addHouse(x, rz0, x + w, rz1, pick([4.5, 5.5, 6.5, 7.5, 5.5, 6.5]));
        x += w; if (x < x1 - 6 && R() < 0.25) x += 2;
      }
    }
  }
  const BCOLS = [[-56, -40], [-36, -20], [20, 36], [40, 56]];
  const BROWS = [[-56, -40], [-36, -22], [-16, -1], [1, 16], [22, 36], [40, 56]];
  BCOLS.forEach(([x0, x1], ci) => BROWS.forEach(([z0, z1], ri) => { if (ci === 2 && ri === 1) return; fillBlock(x0, z0, x1, z1); }));
  for (const ri of [0, 1, 4, 5]) fillBlock(-14, BROWS[ri][0], 14, BROWS[ri][1]);

  // الأزهر والمئذنة
  const MOSQ = { x0: 20, z0: -36, x1: 33, z1: -22, h: 7 };
  stoneGB.walls(MOSQ.x0, MOSQ.z0, MOSQ.x1, MOSQ.z1, 0, MOSQ.h, 3, 3); roofGB.top(MOSQ.x0, MOSQ.z0, MOSQ.x1, MOSQ.z1, MOSQ.h, 4);
  for (let x = MOSQ.x0; x < MOSQ.x1; x += 1) { stoneGB.box(x + 0.2, 7, MOSQ.z0, x + 0.7, 7.6, MOSQ.z0 + 0.3, 1); stoneGB.box(x + 0.2, 7, MOSQ.z1 - 0.3, x + 0.7, 7.6, MOSQ.z1, 1); }
  for (let z = MOSQ.z0; z < MOSQ.z1; z += 1) { stoneGB.box(MOSQ.x0, 7, z + 0.2, MOSQ.x0 + 0.3, 7.6, z + 0.7, 1); }
  addCollider(MOSQ.x0, MOSQ.z0, MOSQ.x1, MOSQ.z1, MOSQ.h, true, 'mosque');
  woodGB.walls(MOSQ.x0 - 0.05, -30.5, MOSQ.x0, -27.5, 0, 3.4);
  const MIN = { x0: 33, z0: -36, x1: 36, z1: -33, h: 22, cx: 34.5, cz: -34.5 };
  stoneGB.walls(MIN.x0, MIN.z0, MIN.x1, MIN.z1, 0, 9, 3, 3);
  addCollider(MIN.x0, MIN.z0, MIN.x1, MIN.z1, MIN.h, true, 'minaret');
  addHouse(33, -33, 36, -22, 5);
  (function minaret() {
    const st = M.stone, light = col(0xeadfca);
    const add = (geo, mat, y) => { const m = new THREE.Mesh(geo, mat); m.position.set(MIN.cx, y, MIN.cz); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; };
    add(new THREE.CylinderGeometry(1.35, 1.5, 7, 8), light, 12.5);
    add(new THREE.CylinderGeometry(2.0, 1.4, 0.5, 8), st, 16.2);
    add(new THREE.CylinderGeometry(1.15, 1.25, 5.5, 8), light, 19.0);
    add(new THREE.CylinderGeometry(1.75, 1.75, 0.3, 8), st, 21.85);
    for (let i = 0; i < 4; i++) { const a = i * TAU / 4 + Math.PI / 4; const p = add(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 6), st, 23.3); p.position.x += Math.cos(a) * 1.3; p.position.z += Math.sin(a) * 1.3; }
    add(new THREE.ConeGeometry(1.6, 2.6, 8), light, 25.9);
    add(new THREE.SphereGeometry(0.22, 8, 6), M.gold, 27.4);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(4.6, 24, 12, 0, TAU, 0, Math.PI / 2), light); dome.position.set(26.5, 7, -29); dome.castShadow = true; scene.add(dome);
    const fin = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), M.gold); fin.position.set(26.5, 11.8, -29); scene.add(fin);
    for (const [x, z] of [[22, -24], [31, -24], [22, -34]]) { const d = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 8, 0, TAU, 0, Math.PI / 2), light); d.position.set(x, 7, z); d.castShadow = true; scene.add(d); }
  })();

  // الأسوار وباب القلعة
  const WALL_H = 10;
  for (const [x0, z0, x1, z1] of [[-62, -62, 62, -60], [-62, 60, -5, 62], [5, 60, 62, 62], [-62, -60, -60, 60], [60, -60, 62, 60]]) {
    stoneGB.box(x0, 0, z0, x1, WALL_H, z1, 3); addCollider(x0, z0, x1, z1, WALL_H, false, 'wall');
  }
  const GATE = new V3(0, 0, 58);
  for (const x of [-7, 7]) { stoneGB.box(x - 2.5, 0, 58.5, x + 2.5, 13, 63, 3); addCollider(x - 2.5, 58.5, x + 2.5, 63, 13, false, 'wall'); }
  woodGB.box(-4.5, 0, 60.5, 4.5, 7.5, 61.2, 1); addCollider(-4.5, 60.5, 4.5, 61.2, 7.5, false, 'wall');
  stoneGB.box(-5, 7.5, 60, 5, 10, 62, 3);
  // مدينة بعيدة ورا السور
  for (let i = 0; i < 70; i++) {
    const a = R() * TAU, r = 75 + R() * 60, x = Math.cos(a) * r, z = Math.sin(a) * r, w = 6 + R() * 10, d = 6 + R() * 10, h = 5 + R() * 9;
    wallGB[i % 4].walls(x, z, x + w, z + d, 0, h, 4, 3.5, true); roofGB.top(x, z, x + w, z + d, h, 4);
    if (R() < 0.12) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, h + 14, 8), col(0xeadfca)); m.position.set(x + w / 2, (h + 14) / 2, z + d / 2); scene.add(m); }
  }

  // السوق
  const STALLS = [];
  for (const sz of [-8, 8]) for (const sx of [-12, -6, 6, 12]) STALLS.push({ x: sx, z: sz });
  const awnMats = ['#b5523b', '#3f6e8c', '#5c7a3a', '#9a4f7a'].map(c => std({ map: awningTex(c), side: THREE.DoubleSide }));
  const goodsCols = [0xe08a2c, 0xc8432b, 0xe3c35a, 0x7a9a3a, 0x8c5a3c];
  STALLS.forEach((s, i) => {
    woodGB.box(s.x - 1.4, 0, s.z - 0.7, s.x + 1.4, 0.9, s.z + 0.7, 1);
    for (const [dx, dz] of [[-1.4, -0.7], [1.4, -0.7], [-1.4, 0.7], [1.4, 0.7]]) woodGB.box(s.x + dx - 0.05, 0, s.z + dz - 0.05, s.x + dx + 0.05, 2.4, s.z + dz + 0.05, 1);
    addCollider(s.x - 1.4, s.z - 0.7, s.x + 1.4, s.z + 0.7, 0.9, true, 'stall');
    const aw = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.0), awnMats[i % 4]); aw.position.set(s.x, 2.45, s.z); aw.rotation.x = -Math.PI / 2 + (s.z < 0 ? 0.25 : -0.25); aw.castShadow = true; scene.add(aw);
    for (let k = 0; k < 5; k++) { const g = new THREE.Mesh(new THREE.SphereGeometry(0.22, 7, 5), col(goodsCols[(i + k) % 5])); g.position.set(s.x - 1.1 + k * 0.55, 1.0, s.z); g.scale.y = 0.6; scene.add(g); }
  });
  (function fountain() {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.8, 0.7, 8), M.stone); b.position.set(0, 0.35, 0); b.castShadow = b.receiveShadow = true; scene.add(b);
    const w = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 0.1, 8), M.water); w.position.set(0, 0.68, 0); scene.add(w);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.6, 8), M.stone); c.position.set(0, 1.1, 0); c.castShadow = true; scene.add(c);
    addCollider(-1.5, -1.5, 1.5, 1.5, 0.7, true, 'fountain');
  })();
  // النخيل
  const palmPos = [[-18, -20], [18, -20], [-18, 20], [18, 20], [-18, 0.2], [18, -0.2], [-38, -10], [38, 12], [-17, 44], [17, -46], [-50, -38], [50, 38]];
  for (const [x, z] of palmPos) {
    const h = 6 + R() * 2.5;
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, h, 7), M.trunk); t.position.set(x, h / 2, z); t.rotation.z = (R() - 0.5) * 0.15; t.castShadow = true; scene.add(t);
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8 + R() * 0.3, leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 3.4), M.palm);
      leaf.geometry.translate(0, 1.7, 0); leaf.position.set(x, h, z); leaf.rotation.set(0, -a, 0); leaf.rotateX(1.05 + R() * 0.3); leaf.castShadow = true; scene.add(leaf);
    }
    addCollider(x - 0.3, z - 0.3, x + 0.3, z + 0.3, h, false, 'palm');
  }
  // عربيات القش
  const HAY = [[-38, -30], [-17, -45], [-12, -14], [38, -29.5], [17, 30], [-38, 30], [38, 46], [5, -19], [-50, 19], [50, -38], [-25, 38], [28, -19], [-38, 52]].map(([x, z]) => ({ x, z }));
  for (const h of HAY) {
    woodGB.box(h.x - 0.8, 0.35, h.z - 1.2, h.x + 0.8, 0.6, h.z + 1.2, 1);
    for (const [dx, dz] of [[-0.85, -0.7], [0.85, -0.7], [-0.85, 0.7], [0.85, 0.7]]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.1, 10), M.wood); wh.rotation.z = Math.PI / 2; wh.position.set(h.x + dx, 0.35, h.z + dz); scene.add(wh); }
    const hay = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 7), M.hay); hay.scale.set(0.85, 0.55, 1.25); hay.position.set(h.x, 0.75, h.z); hay.castShadow = hay.receiveShadow = true; scene.add(hay);
    h.mesh = hay;
  }
  // البيت الآمن
  const SAFE = new V3(-38.5, 0, 48);
  woodGB.walls(-40.05, 47.2, -40, 48.8, 0, 2.6);
  const lamp = new THREE.PointLight(0xffb55a, 1.4, 9, 2); lamp.position.set(-39.6, 2.9, 48); scene.add(lamp);
  const lampMesh = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd38a })); lampMesh.position.copy(lamp.position); scene.add(lampMesh);
  const safeRing = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.1, 32), new THREE.MeshBasicMaterial({ color: 0x7fb069, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
  safeRing.rotation.x = -Math.PI / 2; safeRing.position.set(SAFE.x, 0.05, SAFE.z); safeRing.visible = false; scene.add(safeRing);

  for (const d of decor) {
    if (d.t === 'jar') { const m = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), col(0x8a5a34)); m.scale.y = 1.2; m.position.set(d.x, d.y + 0.35, d.z); m.castShadow = true; scene.add(m); }
    else woodGB.box(d.x - 0.35, d.y, d.z - 0.35, d.x + 0.35, d.y + 0.6, d.z + 0.35, 1);
  }
  wallGB.forEach((g, i) => g.mesh(M.walls[i]));
  const roofMesh = roofGB.mesh(M.roof), stoneMesh = stoneGB.mesh(M.stone); woodGB.mesh(M.wood); latGB.mesh(M.lattice);
  const camBlockers = [...scene.children.filter(o => o.isMesh && o.geometry && o.geometry.attributes.uv && o.material && M.walls.includes(o.material)), roofMesh, stoneMesh];
  for (const b of boxes) for (let cx = Math.floor(b.x0 / HC); cx <= Math.floor(b.x1 / HC); cx++) for (let cz = Math.floor(b.z0 / HC); cz <= Math.floor(b.z1 / HC); cz++) {
    const k = hkey(cx, cz); if (!hashMap.has(k)) hashMap.set(k, []); hashMap.get(k).push(b);
  }

  // ---------- شبكة الطرق (A*) ----------
  const GO = -62, GN = 124, grid = new Uint8Array(GN * GN);
  for (let j = 0; j < GN; j++) for (let i = 0; i < GN; i++) {
    const x = GO + i + 0.5, z = GO + j + 0.5; let ok = 1;
    for (const b of boxesIn(x - 0.6, z - 0.6, x + 0.6, z + 0.6)) if (b.h > STEP && x > b.x0 - 0.45 && x < b.x1 + 0.45 && z > b.z0 - 0.45 && z < b.z1 + 0.45) { ok = 0; break; }
    grid[j * GN + i] = ok;
  }
  const gS = new Float32Array(GN * GN), came = new Int32Array(GN * GN), stampA = new Uint32Array(GN * GN), closedA = new Uint32Array(GN * GN);
  let gen = 0;
  const cellOf = (x, z) => [clamp(Math.floor(x - GO), 0, GN - 1), clamp(Math.floor(z - GO), 0, GN - 1)];
  function nearestCell(i, j) {
    if (grid[j * GN + i]) return [i, j];
    for (let r = 1; r < 6; r++) for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
      const a = i + di, b = j + dj; if (a >= 0 && b >= 0 && a < GN && b < GN && grid[b * GN + a]) return [a, b];
    }
    return null;
  }
  const DIRS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
  function findPath(x0, z0, x1, z1) {
    const s = nearestCell(...cellOf(x0, z0)), g = nearestCell(...cellOf(x1, z1)); if (!s || !g) return null;
    const start = s[1] * GN + s[0], goal = g[1] * GN + g[0];
    if (start === goal) return [new V3(x1, 0, z1)];
    gen++; const heap = [];
    const push = (f, i) => { heap.push([f, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break;[heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break;[heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
    const hf = i => { const dx = Math.abs(i % GN - g[0]), dz = Math.abs(((i / GN) | 0) - g[1]); return Math.max(dx, dz) + 0.414 * Math.min(dx, dz); };
    stampA[start] = gen; gS[start] = 0; came[start] = -1; push(hf(start), start);
    let it = 0;
    while (heap.length && it++ < 9000) {
      const [, cur] = pop(); if (cur === goal) break; if (closedA[cur] === gen) continue; closedA[cur] = gen;
      const ci = cur % GN, cj = (cur / GN) | 0;
      for (const [di, dj, c] of DIRS) {
        const ni = ci + di, nj = cj + dj; if (ni < 0 || nj < 0 || ni >= GN || nj >= GN) continue;
        const n = nj * GN + ni; if (!grid[n]) continue;
        if (di && dj && (!grid[cj * GN + ni] || !grid[nj * GN + ci])) continue;
        const ng = gS[cur] + c; if (stampA[n] !== gen || ng < gS[n]) { stampA[n] = gen; gS[n] = ng; came[n] = cur; push(ng + hf(n), n); }
      }
    }
    if (stampA[goal] !== gen) return null;
    const pts = []; let c = goal;
    while (c !== start && c !== -1) { pts.push(new V3(GO + c % GN + 0.5, 0, GO + ((c / GN) | 0) + 0.5)); c = came[c]; }
    pts.reverse();
    // تبسيط المسار
    const out = []; let prevDir = null;
    for (let i = 0; i < pts.length; i++) { const nx = pts[i + 1]; const dir = nx ? Math.round(Math.atan2(nx.z - pts[i].z, nx.x - pts[i].x) * 4 / Math.PI) : null; if (dir !== prevDir || !nx) out.push(pts[i]); prevDir = dir; }
    return out;
  }
  const walkCells = []; for (let j = 0; j < GN; j++) for (let i = 0; i < GN; i++) if (grid[j * GN + i]) { const x = GO + i + 0.5, z = GO + j + 0.5; if (Math.abs(x) < 58 && Math.abs(z) < 57) walkCells.push([x, z]); }

  // ---------- الصوت ----------
  const Sound = {
    ctx: null, muted: false,
    init() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      try { this.ctx = new AC(); } catch (e) { return; }
      const c = this.ctx;
      this.master = c.createGain(); this.master.gain.value = this.muted ? 0 : 0.7; this.master.connect(c.destination);
      this.music = c.createGain(); this.music.gain.value = 0.3; this.music.connect(this.master);
      this.sfx = c.createGain(); this.sfx.gain.value = 0.9; this.sfx.connect(this.master);
      const buf = c.createBuffer(1, c.sampleRate, c.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; this.noiseBuf = buf;
      [73.42, 110].forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; g.gain.value = i ? 0.035 : 0.06; o.connect(g); g.connect(this.music); o.start(); });
      this.nextNote = c.currentTime + 0.4; this.nextBeat = c.currentTime + 0.4; this.beatI = 0; this.mi = 4;
    },
    setMuted(m) { this.muted = m; if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.7, this.ctx.currentTime, 0.05); },
    tone(f, dur, { type = 'sine', vol = 0.2, to = null, delay = 0, bus = null, attack = 0.005 } = {}) {
      const c = this.ctx; if (!c) return; const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(bus || this.sfx); o.start(t); o.stop(t + dur + 0.05);
    },
    noise(dur, { vol = 0.3, freq = 1000, type = 'lowpass', q = 1, delay = 0, bus = null, to = null } = {}) {
      const c = this.ctx; if (!c) return; const t = c.currentTime + delay, s = c.createBufferSource(); s.buffer = this.noiseBuf;
      const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur); f.Q.value = q;
      const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(bus || this.sfx); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
    },
    pluck(f, t, vol) {
      const c = this.ctx, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
      o.type = 'sawtooth'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f * 1.004;
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(2400, t); lp.frequency.exponentialRampToValueAtTime(450, t + 0.6);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(this.music); o.start(t); o2.start(t); o.stop(t + 1.2); o2.stop(t + 1.2);
    },
    update(tension) {
      const c = this.ctx; if (!c || this.muted || c.state !== 'running') return; const now = c.currentTime;
      if (this.nextNote < now - 0.3) this.nextNote = now + 0.05; if (this.nextBeat < now - 0.3) this.nextBeat = now + 0.05;
      const scale = [146.83, 155.56, 185.0, 196.0, 220.0, 233.08, 261.63, 293.66, 311.13, 369.99, 392.0];
      while (this.nextNote < now + 0.15) {
        if (Math.random() > (tension ? 0.12 : 0.3)) { this.mi = clamp(this.mi + Math.floor(Math.random() * 5) - 2, 0, scale.length - 1); this.pluck(scale[this.mi], this.nextNote, tension ? 0.1 : 0.07); }
        this.nextNote += tension ? 0.16 : 0.32 + Math.random() * 0.25;
      }
      const pat = tension ? [1, 0, 2, 0, 2, 1, 0, 2] : [1, 0, 0, 2, 0, 0, 2, 0], len = tension ? 0.16 : 0.3;
      while (this.nextBeat < now + 0.15) {
        const b = pat[this.beatI % pat.length], dl = Math.max(0, this.nextBeat - now);
        if (b === 1) this.tone(95, 0.25, { to: 50, vol: tension ? 0.32 : 0.13, delay: dl, bus: this.music });
        if (b === 2) this.noise(0.06, { vol: tension ? 0.16 : 0.05, freq: 3000, type: 'highpass', delay: dl, bus: this.music });
        this.beatI++; this.nextBeat += len;
      }
    },
  };
  function sfx(n) {
    if (!Sound.ctx) return; const S = Sound;
    switch (n) {
      case 'swing': S.noise(0.18, { vol: 0.22, freq: 900, to: 3500, type: 'bandpass', q: 2 }); break;
      case 'heavy': S.noise(0.3, { vol: 0.3, freq: 400, to: 2500, type: 'bandpass', q: 1.5 }); break;
      case 'flesh': S.noise(0.12, { vol: 0.4, freq: 700 }); S.tone(110, 0.18, { type: 'square', vol: 0.12, to: 55 }); break;
      case 'clash': S.tone(1250, 0.35, { type: 'triangle', vol: 0.15 }); S.tone(1870, 0.3, { vol: 0.08 }); S.noise(0.08, { vol: 0.25, freq: 5000, type: 'highpass' }); break;
      case 'parry': S.tone(1500, 0.6, { type: 'triangle', vol: 0.2 }); S.tone(2240, 0.5, { vol: 0.1 }); S.noise(0.1, { vol: 0.3, freq: 6000, type: 'highpass' }); break;
      case 'kill': S.noise(0.2, { vol: 0.45, freq: 3000, to: 500, type: 'bandpass', q: 2 }); S.tone(90, 0.4, { type: 'sawtooth', vol: 0.15, to: 40, delay: 0.05 }); break;
      case 'hurt': S.tone(160, 0.2, { type: 'sawtooth', vol: 0.2, to: 70 }); S.noise(0.12, { vol: 0.35, freq: 600 }); break;
      case 'alert': S.tone(440, 0.16, { type: 'square', vol: 0.09 }); S.tone(660, 0.3, { type: 'square', vol: 0.09, delay: 0.12 }); break;
      case 'sus': S.tone(520, 0.12, { type: 'triangle', vol: 0.06, to: 720 }); break;
      case 'jump': S.noise(0.2, { vol: 0.12, freq: 600, to: 1800, type: 'bandpass' }); break;
      case 'land': S.noise(0.14, { vol: 0.22, freq: 380 }); break;
      case 'climb': S.noise(0.07, { vol: 0.08, freq: 1100, type: 'bandpass' }); break;
      case 'hay': S.noise(0.4, { vol: 0.25, freq: 2500, type: 'highpass' }); break;
      case 'arrow': S.noise(0.25, { vol: 0.12, freq: 4000, to: 1400, type: 'bandpass', q: 4 }); break;
      case 'sync': [293.66, 369.99, 440, 587.33].forEach((f, i) => S.tone(f, 1.8, { vol: 0.11, delay: i * 0.13, attack: 0.1 })); break;
      case 'win': [293.66, 369.99, 440, 587.33, 739.99].forEach((f, i) => S.tone(f, 1.2, { type: 'triangle', vol: 0.11, delay: i * 0.15 })); break;
      case 'fail': [293.66, 277.18, 220, 146.83].forEach((f, i) => S.tone(f, 0.8, { type: 'sawtooth', vol: 0.07, delay: i * 0.22 })); break;
      case 'leap': S.noise(1.0, { vol: 0.2, freq: 400, to: 3000, type: 'bandpass' }); break;
      case 'scream': S.tone(900, 0.4, { type: 'sawtooth', vol: 0.04, to: 600 }); break;
      case 'boom': S.tone(60, 0.6, { vol: 0.35, to: 30 }); S.noise(0.3, { vol: 0.3, freq: 200 }); break;
    }
  }

  // ---------- الشخصيات (هيكل وحركة) ----------
  const SKIN = 0xc08a5c;
  function mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; }
  const GEO = {
    torso: new THREE.CylinderGeometry(0.17, 0.21, 0.56, 8), sash: new THREE.CylinderGeometry(0.215, 0.215, 0.09, 8),
    head: new THREE.SphereGeometry(0.12, 10, 8), uarm: new THREE.CylinderGeometry(0.058, 0.05, 0.3, 6), larm: new THREE.CylinderGeometry(0.048, 0.04, 0.28, 6),
    hand: new THREE.SphereGeometry(0.05, 6, 5), uleg: new THREE.CylinderGeometry(0.085, 0.065, 0.46, 6), lleg: new THREE.CylinderGeometry(0.062, 0.05, 0.46, 6),
    foot: new THREE.BoxGeometry(0.1, 0.07, 0.24), skirtS: new THREE.CylinderGeometry(0.2, 0.32, 0.6, 10, 1, true), skirtL: new THREE.CylinderGeometry(0.21, 0.38, 0.88, 10, 1, true),
    blade: new THREE.BoxGeometry(0.035, 0.8, 0.012), hilt: new THREE.BoxGeometry(0.16, 0.03, 0.04), grip: new THREE.CylinderGeometry(0.02, 0.02, 0.14, 5),
    shaft: new THREE.CylinderGeometry(0.02, 0.02, 2.3, 5), tip: new THREE.ConeGeometry(0.045, 0.22, 5),
    hood: new THREE.SphereGeometry(0.145, 10, 8, 0, TAU, 0, Math.PI * 0.62), hoodTip: new THREE.ConeGeometry(0.09, 0.22, 6),
    turban: new THREE.SphereGeometry(0.19, 12, 8), bork: new THREE.CylinderGeometry(0.1, 0.12, 0.3, 8), borkFlap: new THREE.BoxGeometry(0.16, 0.3, 0.04),
    fez: new THREE.CylinderGeometry(0.08, 0.1, 0.13, 8), imma: new THREE.TorusGeometry(0.11, 0.05, 6, 12), cap: new THREE.SphereGeometry(0.125, 8, 6, 0, TAU, 0, Math.PI / 2.2),
    veil: new THREE.SphereGeometry(0.16, 10, 8), bow: new THREE.TorusGeometry(0.4, 0.015, 4, 12, Math.PI * 0.9), beard: new THREE.SphereGeometry(0.075, 6, 5),
  };
  const RIGS = {
    player: { robe: 0xece6d8, trim: 0xa32a22, pants: 0x3b3027, head: 'hood', weapon: 'sword', skirt: 'S', beard: true },
    guard: { robe: 0xa3302a, trim: 0x2f4a7a, pants: 0x2a2a3a, head: 'bork', weapon: 'spear', skirt: 'S', beard: true },
    swords: { robe: 0x8f2a24, trim: 0xc9a443, pants: 0x2a2a3a, head: 'bork', weapon: 'sword', skirt: 'S', beard: true },
    archer: { robe: 0x33496e, trim: 0xc9a443, pants: 0x2a2a2a, head: 'fez', weapon: 'bow', skirt: 'S', beard: true },
    target: { robe: 0x2f6b46, trim: 0xe0b04a, pants: 0x2a2018, head: 'turban', weapon: null, skirt: 'L', fat: 1.3, beard: true },
  };
  const CIV_ROBES = [0x7a6a55, 0x5d6b7a, 0x8c5a3c, 0x6f7d5a, 0xa08c6c, 0x4f5d6e, 0x9b7b5b, 0x6e4f6a, 0xb49a72];
  function civRig() {
    if (Math.random() < 0.35) return { robe: 0x1f1c22, trim: 0x1f1c22, pants: 0x1f1c22, head: 'veil', headC: 0x141218, skirt: 'L' };
    const head = pick(['imma', 'fez', 'cap', 'imma']);
    return { robe: pick(CIV_ROBES), trim: pick([0x5a4632, 0x3d3d3d, 0x6b4a2a]), pants: 0x3b3027, head, skirt: 'L', beard: Math.random() < 0.6 };
  }
  function makeRig(o) {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    const robe = col(o.robe), trim = col(o.trim), pants = col(o.pants), skin = col(SKIN);
    const hips = new THREE.Group(); hips.position.y = 0.95; body.add(hips);
    const spine = new THREE.Group(); hips.add(spine);
    const torso = mesh(GEO.torso, robe, spine, 0, 0.3, 0); if (o.fat) torso.scale.set(o.fat, 1, o.fat * 1.1);
    const sash = mesh(GEO.sash, trim, spine, 0, 0.05, 0); if (o.fat) sash.scale.set(o.fat, 1, o.fat * 1.1);
    const neck = new THREE.Group(); neck.position.y = 0.6; spine.add(neck);
    mesh(GEO.head, skin, neck, 0, 0.12, 0);
    if (o.beard) mesh(GEO.beard, col(0x2a1d14), neck, 0, 0.06, 0.07);
    const hc = o.headC != null ? col(o.headC) : null;
    switch (o.head) {
      case 'hood': { const h = mesh(GEO.hood, robe, neck, 0, 0.125, -0.01); h.rotation.x = -0.25; const t = mesh(GEO.hoodTip, robe, neck, 0, 0.2, -0.12); t.rotation.x = -2.2; break; }
      case 'turban': { const t = mesh(GEO.turban, col(0xf6f1e6), neck, 0, 0.21, 0); t.scale.y = 0.75; mesh(GEO.hand, col(0x2f6b46), neck, 0, 0.33, 0); mesh(GEO.hand, M.gold, neck, 0, 0.24, 0.17); break; }
      case 'bork': { mesh(GEO.bork, col(0xf1ece0), neck, 0, 0.32, 0); const f = mesh(GEO.borkFlap, col(0xf1ece0), neck, 0, 0.3, -0.13); f.rotation.x = 0.35; mesh(GEO.sash, M.gold, neck, 0, 0.19, 0).scale.set(0.55, 0.6, 0.55); break; }
      case 'fez': mesh(GEO.fez, col(0xb3261e), neck, 0, 0.25, 0); break;
      case 'imma': { const t = mesh(GEO.imma, col(0xefe8da), neck, 0, 0.2, 0); t.rotation.x = Math.PI / 2; mesh(GEO.cap, col(0xefe8da), neck, 0, 0.18, 0); break; }
      case 'cap': mesh(GEO.cap, col(0xe9e1d0), neck, 0, 0.16, 0); break;
      case 'veil': { const v = mesh(GEO.veil, hc, neck, 0, 0.13, -0.015); v.scale.set(1, 1.15, 1); break; }
    }
    const arm = side => {
      const a = new THREE.Group(); a.position.set(0.25 * side * (o.fat ? 1.2 : 1), 0.52, 0); spine.add(a);
      mesh(GEO.uarm, robe, a, 0, -0.15, 0);
      const e = new THREE.Group(); e.position.y = -0.3; a.add(e);
      mesh(GEO.larm, robe, e, 0, -0.14, 0);
      const hand = new THREE.Group(); hand.position.y = -0.3; e.add(hand); mesh(GEO.hand, skin, hand);
      return { a, e, hand };
    };
    const L = arm(1), Rr = arm(-1);
    const leg = side => {
      const l = new THREE.Group(); l.position.set(0.1 * side, 0, 0); hips.add(l);
      mesh(GEO.uleg, pants, l, 0, -0.23, 0);
      const k = new THREE.Group(); k.position.y = -0.46; l.add(k);
      mesh(GEO.lleg, pants, k, 0, -0.23, 0); mesh(GEO.foot, col(0x2b1d12), k, 0, -0.47, 0.05);
      return { l, k };
    };
    const LL = leg(1), RL = leg(-1);
    const sk = o.skirt === 'L' ? GEO.skirtL : GEO.skirtS;
    const skirtPivot = new THREE.Group(); hips.add(skirtPivot);
    const skirt = new THREE.Mesh(sk, new THREE.MeshStandardMaterial({ color: o.robe, roughness: 0.9, side: THREE.DoubleSide }));
    skirt.position.y = -sk.parameters.height / 2 + 0.05; skirt.castShadow = true; skirtPivot.add(skirt);
    if (o.fat) skirt.scale.set(o.fat, 1, o.fat);
    let weapon = null;
    if (o.weapon === 'sword') {
      weapon = new THREE.Group(); Rr.hand.add(weapon); weapon.rotation.x = Math.PI / 2;
      mesh(GEO.grip, col(0x3b2716), weapon, 0, 0, 0); mesh(GEO.hilt, M.gold, weapon, 0, 0.08, 0);
      const bl = mesh(GEO.blade, M.steel, weapon, 0, 0.48, 0); bl.rotation.z = 0.05;
    } else if (o.weapon === 'spear') {
      weapon = new THREE.Group(); Rr.hand.add(weapon); weapon.rotation.x = 0.15;
      mesh(GEO.shaft, col(0x5b3d22), weapon, 0, 0.6, 0); mesh(GEO.tip, M.steel, weapon, 0, 1.85, 0);
    } else if (o.weapon === 'bow') {
      weapon = new THREE.Group(); L.hand.add(weapon); weapon.rotation.set(0, Math.PI / 2, Math.PI / 2);
      const b = mesh(GEO.bow, col(0x6b4a2a), weapon, 0, 0, 0); b.rotation.z = -Math.PI * 0.45;
    }
    scene.add(root);
    return { root, body, hips, spine, neck, armL: L.a, armR: Rr.a, elL: L.e, elR: Rr.e, handR: Rr.hand, legL: LL.l, legR: RL.l, knL: LL.k, knR: RL.k, skirt: skirtPivot, weapon, P: null };
  }
  const POSE_KEYS = ['hy', 'by', 'tilt', 'sx', 'sy', 'nx', 'aLx', 'aLz', 'aRx', 'aRz', 'eL', 'eR', 'lLx', 'lRx', 'kL', 'kR'];
  function basePose() { return { hy: 0, by: 0, tilt: 0, sx: 0.03, sy: 0, nx: 0, aLx: 0.08, aLz: 0.12, aRx: 0.08, aRz: -0.12, eL: -0.2, eR: -0.3, lLx: 0, lRx: 0, kL: 0.05, kR: 0.05 }; }
  function poseFor(a) {
    const P = basePose(), ph = a.phase, t = a.t || 0;
    const walk = (run) => {
      const amp = run ? 0.95 : 0.5, sn = Math.sin(ph), cs = Math.cos(ph);
      P.lLx = sn * amp; P.lRx = -sn * amp;
      P.kL = Math.max(0, -cs) * (run ? 1.4 : 0.7) + 0.06; P.kR = Math.max(0, cs) * (run ? 1.4 : 0.7) + 0.06;
      P.aLx = -sn * amp * 0.8; P.aRx = sn * amp * 0.8; P.eL = run ? -1.3 : -0.3; P.eR = run ? -1.3 : -0.4;
      P.sx = run ? 0.28 : 0.06; P.hy = -Math.abs(cs) * (run ? 0.06 : 0.025);
    };
    switch (a.mode) {
      case 'idle': P.sx = 0.03 + Math.sin(a.time * 1.6) * 0.015; break;
      case 'walk': walk(false); break;
      case 'run': walk(true); break;
      case 'air': P.lLx = -0.8; P.kL = 1.3; P.lRx = 0.25; P.kR = 0.7; P.aLx = -1.6; P.aRx = -1.4; P.aLz = 0.7; P.aRz = -0.7; P.sx = 0.15; break;
      case 'fall': P.lLx = -0.3; P.kL = 0.5; P.lRx = 0.2; P.kR = 0.4; P.aLx = -2.6; P.aRx = -2.6; P.aLz = 1.2; P.aRz = -1.2; P.sx = -0.1; break;
      case 'climb': { const sn = Math.sin(ph); P.aLx = -2.7 + sn * 0.35; P.aRx = -2.7 - sn * 0.35; P.eL = -0.4; P.eR = -0.4; P.lLx = -0.9 + sn * 0.5; P.lRx = -0.9 - sn * 0.5; P.kL = 1.5; P.kR = 1.5; P.sx = -0.05; break; }
      case 'attack': {
        const sw = smooth(clamp((t - 0.2) / 0.3, 0, 1));
        if (a.combo % 2 === 0) { P.aRx = lerp(-2.6, -0.5, sw); P.aRz = lerp(-1.1, 0.8, sw); P.sy = lerp(0.7, -0.6, sw); }
        else { P.aRx = lerp(-1.5, -1.3, sw); P.aRz = lerp(1.0, -1.3, sw); P.sy = lerp(-0.6, 0.7, sw); }
        P.eR = -0.15; P.lLx = -0.55; P.kL = 0.45; P.lRx = 0.45; P.kR = 0.35; P.sx = 0.22; P.aLx = -0.4; P.aLz = 0.5; P.hy = -0.06; break;
      }
      case 'heavy': {
        const sw = smooth(clamp((t - 0.45) / 0.2, 0, 1));
        P.aRx = lerp(-3.1, -0.7, sw); P.aLx = lerp(-3.0, -0.8, sw); P.aRz = 0.25; P.aLz = -0.25; P.eR = P.eL = -0.2;
        P.sx = lerp(-0.25, 0.55, sw); P.lLx = -0.6; P.kL = 0.6; P.lRx = 0.5; P.kR = 0.4; P.hy = lerp(0, -0.15, sw); break;
      }
      case 'stab': {
        const sw = smooth(clamp((t - 0.35) / 0.15, 0, 1));
        P.aRx = lerp(-2.2, -1.3, sw); P.eR = lerp(-1.7, -0.1, sw); P.aRz = -0.1; P.aLx = -1.3; P.aLz = 0.2; P.eL = -0.6;
        P.sx = lerp(0.1, 0.45, sw); P.lLx = -0.7; P.kL = 0.7; P.lRx = 0.5; P.kR = 0.5; P.hy = -0.12; break;
      }
      case 'parry': P.aRx = -1.7; P.aRz = 0.6; P.eR = -1.1; P.sy = -0.35; P.aLx = -0.5; P.lLx = -0.35; P.kL = 0.4; P.lRx = 0.3; P.kR = 0.3; P.hy = -0.08; break;
      case 'dodge': P.tilt = smooth(t) * TAU; P.by = -0.45 * Math.sin(Math.PI * t); P.sx = 1.0; P.kL = P.kR = 1.7; P.lLx = P.lRx = -1.3; P.aLx = P.aRx = -1.2; P.eL = P.eR = -1.4; break;
      case 'hit': P.sx = -0.35; P.nx = -0.3; P.aLx = -0.7; P.aRx = -0.3; P.lLx = 0.3; P.kL = 0.3; break;
      case 'stun': P.sx = 0.55; P.nx = 0.4; P.aLx = 0.25; P.aRx = 0.25; P.eL = P.eR = -0.1; P.sy = Math.sin(a.time * 3) * 0.25; P.kL = P.kR = 0.5; P.lLx = P.lRx = -0.35; P.hy = -0.1; break;
      case 'windup': P.aRx = -2.6; P.aRz = -0.7; P.sx = -0.15; P.sy = 0.5; P.aLx = -0.6; P.lLx = -0.3; P.kL = 0.3; P.lRx = 0.35; break;
      case 'thrust': P.aRx = -2.0; P.eR = -1.6; P.sy = 0.6; P.aLx = -1.2; P.lLx = -0.3; P.lRx = 0.4; P.sx = -0.1; break;
      case 'strike': P.aRx = -1.0; P.aRz = 0.5; P.eR = 0; P.sy = -0.5; P.sx = 0.3; P.lLx = -0.6; P.kL = 0.5; P.lRx = 0.4; P.hy = -0.06; break;
      case 'draw': P.aLx = -1.57; P.aLz = 0.15; P.eL = 0; P.aRx = -1.57; P.aRz = 0.3; P.eR = -2.2; P.sy = -0.8; P.lLx = -0.2; P.lRx = 0.25; break;
      case 'dead': P.tilt = -Math.PI / 2 * smooth(clamp(t * 2.5, 0, 1)); P.by = 0.12 * smooth(clamp(t * 2.5, 0, 1)); P.aLx = -2.6; P.aRx = -2.4; P.aLz = 0.6; P.aRz = -0.8; P.lLx = -0.2; P.kL = 0.3; break;
      case 'carried': P.tilt = -Math.PI / 2; P.aLx = 0.4; P.aRx = 0.4; P.kL = 0.6; P.kR = 0.6; P.sx = 0.6; break;
      case 'sit': P.lLx = -1.5; P.lRx = -1.5; P.kL = P.kR = 1.6; P.hy = -0.45; P.sx = 0.15; P.aLx = -0.5; P.aRx = -0.5; P.eL = P.eR = -1.0; break;
      case 'pray': P.sx = 0.15; P.aLx = -1.3; P.aRx = -1.3; P.aLz = 0.35; P.aRz = -0.35; P.eL = P.eR = -1.2; break;
    }
    if (a.carry) { P.aLx = -2.9; P.aLz = 0.3; P.eL = -1.4; }
    if (a.sword && (a.mode === 'idle' || a.mode === 'walk' || a.mode === 'run')) { P.aRx = Math.min(P.aRx, -0.6); P.eR = -0.9; }
    return P;
  }
  function animateRig(rig, a, dt) {
    const T = poseFor(a);
    if (!rig.P) rig.P = Object.assign({}, T);
    const P = rig.P, k = a.snap ? 30 : 16;
    for (const key of POSE_KEYS) P[key] = key === 'tilt' && a.mode === 'dodge' ? T[key] : damp(P[key], T[key], k, dt);
    rig.hips.position.y = 0.95 + P.hy; rig.body.position.y = P.by; rig.body.rotation.x = P.tilt;
    rig.spine.rotation.x = P.sx; rig.spine.rotation.y = P.sy; rig.neck.rotation.x = P.nx;
    rig.armL.rotation.x = P.aLx; rig.armL.rotation.z = P.aLz; rig.armR.rotation.x = P.aRx; rig.armR.rotation.z = P.aRz;
    rig.elL.rotation.x = P.eL; rig.elR.rotation.x = P.eR;
    rig.legL.rotation.x = P.lLx; rig.legR.rotation.x = P.lRx; rig.knL.rotation.x = P.kL; rig.knR.rotation.x = P.kR;
    rig.skirt.rotation.x = (P.lLx + P.lRx) * 0.25 + Math.min(P.lLx, P.lRx) * 0.35;
  }

  // ---------- النصوص ----------
  const BARK = {
    sus: ['مين هناك؟', 'إنت يا واد!', 'استنى عندك…', 'فيه حاجة غريبة'],
    alert: ['امسكوه!', 'قاتل! قاتل!', 'يا عسكر! هنا!', 'ماتسيبوهوش!'],
    calm: ['يمكن كان خيال…', 'ولا حاجة', 'شكلي محتاج أنام'],
    giveup: ['راح فين ابن الحرام؟', 'فص ملح وداب', 'ارجعوا مكانكم'],
    found: ['جثة! فيه قاتل هنا!', 'يا ساتر… قتلوه!'],
    scream: ['الحقونا!', 'يا ساتر يا رب!', 'قتل! قتل!', 'اجروا!'],
    target: ['الإتاوة يا معلم… ماتتأخرش', 'الباشا مستني فلوسه', 'اللي مش هيدفع، دكانه هيتقفل', 'مش عايز أسمع أعذار'],
    civ: ['العيش غلي قوي السنة دي', 'سمعت إن المشايخ ناويين على الباشا؟', 'الدلاة نهبوا السوق امبارح', 'عمر مكرم بيقول الشعب مش هيسكت', 'محمد علي ده… راجل مش سهل', 'الضرايب كسرت ضهرنا'],
    fight: ['خد دي!', 'هتموت النهارده!', 'حاصروه!', 'مش هتفلت!'],
    roof: ['انزل يا جبان!', 'هاتوا الرماة!'],
  };

  // ---------- الحالة ----------
  const state = { phase: 'title', time: 0, objective: 'find', synced: false, targetKnown: false, eagleT: 0, timeScale: 1, slowT: 0, monoT: 0, calmT: 10, endT: 0, endKind: null, ambientT: 5, shake: 0, cine: null, alertN: 0, doorWarnT: 0 };
  let player, target, guards = [], civs = [], bodies = [], arrows = [], stats;
  const cam = { yaw: Math.PI, pitch: 0.28, dist: 4.2, pos: new V3(0, 10, 0), look: new V3() };

  class Actor {
    constructor(kind, rigOpts, x, z) {
      this.kind = kind; this.rig = makeRig(rigOpts); this.pos = new V3(x, groundAt(x, z, 50), z); this.vy = 0; this.yaw = 0; this.yawTo = 0;
      this.alive = true; this.r = 0.35; this.onGround = true; this.anim = { mode: 'idle', phase: Math.random() * 6, t: 0, time: 0, combo: 0 };
      this.path = null; this.pathI = 0; this.bark = null; this.speedNow = 0;
      this.rig.root.position.copy(this.pos);
    }
    remove() { scene.remove(this.rig.root); }
    face(x, z) { this.yawTo = Math.atan2(x - this.pos.x, z - this.pos.z); }
    move(dx, dz) { this.pos.x += dx; this.pos.z += dz; return collide(this.pos, this.r, this.pos.y); }
    say(text, t = 2.6) { this.bark = { text, t }; }
    sync(dt) {
      this.yaw = dampAng(this.yaw, this.yawTo, 10, dt);
      this.rig.root.position.copy(this.pos); this.rig.root.rotation.y = this.yaw;
      this.anim.time += dt; animateRig(this.rig, this.anim, dt);
      if (this.bark) { this.bark.t -= dt; if (this.bark.t <= 0) this.bark = null; }
    }
    followPath(speed, dt) {
      if (!this.path || this.pathI >= this.path.length) return true;
      const p = this.path[this.pathI], dx = p.x - this.pos.x, dz = p.z - this.pos.z, d = Math.hypot(dx, dz);
      if (d < 0.35) { this.pathI++; return this.pathI >= this.path.length; }
      const s = Math.min(d, speed * dt); this.move(dx / d * s, dz / d * s); this.yawTo = Math.atan2(dx, dz); this.speedNow = speed;
      return false;
    }
    goTo(x, z) { this.path = findPath(this.pos.x, this.pos.z, x, z); this.pathI = 0; return !!this.path; }
    walkAnim(dt, speed) {
      if (speed > 0.1) { this.anim.mode = speed > 3.2 ? 'run' : 'walk'; this.anim.phase += dt * (speed > 3.2 ? speed * 1.75 : speed * 2.6); }
      else this.anim.mode = 'idle';
    }
  }

  function newGame() {
    for (const a of [...guards, ...civs, ...bodies.map(b => b.actor)]) if (a) a.remove();
    if (player) player.remove(); if (target) target.remove();
    for (const ar of arrows) scene.remove(ar.mesh);
    guards = []; civs = []; bodies = []; arrows = [];
    stats = { time: 0, kills: 0, detections: 0, finishers: 0 };
    Object.assign(state, { time: 0, objective: 'find', synced: false, targetKnown: false, eagleT: 0, timeScale: 1, slowT: 0, monoT: 0, calmT: 10, endT: 0, endKind: null, ambientT: 5, shake: 0, cine: null, alertN: 0, doorWarnT: 0 });
    canvas.classList.remove('mono', 'eagle');
    safeRing.visible = false;

    player = new Actor('player', RIGS.player, -38, -56);
    Object.assign(player, { hp: 100, maxHp: 100, stam: 4, stamT: 0, state: 'move', stateT: 0, attackQ: false, combo: 0, comboT: 0, parryT: 0, iframes: 0, hurtT: 0, hidden: false, blend: false, sprint: false, climbB: null, climbN: null, pushT: 0, maxY: 0, carrying: null, regenT: 0, wasHidden: false });
    player.yaw = player.yawTo = 0; player.anim.sword = true;
    cam.yaw = 0; cam.pitch = 0.25;

    target = new Actor('target', RIGS.target, -10, -11);
    Object.assign(target, { state: 'walk', wi: 0, waitT: 0, sus: 0, hp: 40, maxHp: 40, stun: 0, range: 14, fov: 1.9, trail: [] });
    const mkGuard = (x, z, o = {}) => {
      const g = new Actor('guard', RIGS[o.look || 'guard'], x, z); delete o.look;
      Object.assign(g, { role: 'patrol', state: 'patrol', sus: 0, lastKnown: null, lostT: 0, susT: 0, searchT: 0, searchBase: 0, waitT: 0, hp: 100, maxHp: 100, stun: 0, stunT: 0, stunDecayT: 0, staggerT: 0, atk: { phase: 'none', t: 0, heavy: false }, atkCD: 1 + Math.random() * 2, fov: 1.9, range: 18, repathT: 0, route: null, wi: 1, shootT: 2, seen: false, inCombat: false }, o);
      guards.push(g); return g;
    };
    for (let i = 0; i < 2; i++) mkGuard(-11 - i, -12.5, { role: 'escort', escortIdx: i, look: 'swords' });
    const routes = [
      [[-38, -50], [-38, 50]], [[-17, -50], [-17, 50]], [[17, -50], [17, 50]], [[38, -50], [38, 50]],
      [[-50, -19], [50, -19]], [[-50, 19], [50, 19]], [[-10, -4], [10, -4], [10, 4], [-10, 4]], [[-50, -38], [50, -38]], [[-50, 38], [50, 38]],
    ];
    routes.forEach((route, i) => mkGuard(route[0][0], route[0][1], { route, look: i % 3 === 2 ? 'swords' : 'guard' }));
    for (const [x, z, f] of [[-3, 56.5, Math.PI], [3, 56.5, Math.PI], [18.3, -27, -Math.PI / 2], [18.3, -31, -Math.PI / 2]]) mkGuard(x, z, { role: 'post', home: new V3(x, 0, z), homeYaw: f, yaw: f, yawTo: f });
    for (const [x, z] of [[-28, -28], [28, 28], [-28, 28], [46, -10], [-46, 6], [8, -46]]) {
      const h = groundAt(x, z, 50);
      if (h < 3) continue;
      const g = mkGuard(x, z, { role: 'archer', look: 'archer', range: 26, hp: 60, maxHp: 60, home: new V3(x, h, z), homeYaw: Math.random() * TAU });
      g.pos.y = h; g.yaw = g.yawTo = g.homeYaw;
    }

    // الأهالي
    const mkCiv = (x, z, o = {}) => { const c = new Actor('civ', civRig(), x, z); Object.assign(c, { mode: 'wander', waitT: Math.random() * 3, speed: 1.1 + Math.random() * 0.4, homeYaw: 0 }, o); civs.push(c); return c; };
    for (const s of STALLS) for (const side of [-1, 1]) {
      const z = s.z + side * 1.5;
      for (let k = 0; k < (side < 0 ? 2 : 1); k++) { const c = mkCiv(s.x - 0.6 + k * 1.2 + (Math.random() - 0.5) * 0.3, z, { mode: 'idle', homeYaw: side < 0 ? 0 : Math.PI }); c.yaw = c.yawTo = c.homeYaw; }
    }
    for (let k = 0; k < 6; k++) { const c = mkCiv(21.5 + (k % 3) * 0.9, -29 + Math.floor(k / 3) * 1.4, { mode: 'idle', homeYaw: -Math.PI / 2, pose: k % 2 ? 'sit' : 'pray' }); c.yaw = c.yawTo = c.homeYaw; }
    for (let k = 0; k < 26; k++) { const [x, z] = pick(walkCells); mkCiv(x, z); }
    for (let k = 0; k < 8; k++) { const [x, z] = [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30]; if (grid[cellOf(x, z)[1] * GN + cellOf(x, z)[0]]) mkCiv(x, z); }
    updateHUD(true);
  }
  const TARGET_ROUTE = [[-8, -10.6, 6, 0], [8, -10.6, 6, 0], [13, 0, 0], [8, 10.6, 6, Math.PI], [-8, 10.6, 6, Math.PI], [-13, 0, 0]];

  // ---------- الإدخال ----------
  const keys = {};
  const input = { attack: false, heavy: false, dodge: false, parry: false, jump: false, action: false, eagle: false, jumpHeld: false };
  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (state.phase === 'play' && !e.repeat) {
      if (e.code === 'Space') { input.jump = true; }
      if (e.code === 'KeyC') input.dodge = true;
      if (e.code === 'KeyQ') input.parry = true;
      if (e.code === 'KeyF' || e.code === 'KeyE') input.action = true;
      if (e.code === 'KeyV') input.eagle = true;
      if (e.code === 'KeyJ') input.attack = true;
      if (e.code === 'KeyK') input.heavy = true;
    }
    if (!e.repeat && e.code === 'KeyM') toggleMute();
    if (!e.repeat && (e.code === 'Escape' || e.code === 'KeyP')) togglePause();
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', e => { keys[e.code] = false; });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; if (state.phase === 'play') togglePause(true); });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  canvas.addEventListener('mousedown', e => {
    if (state.phase !== 'play' || isTouch) return;
    if (document.pointerLockElement !== canvas && canvas.requestPointerLock) { try { const r = canvas.requestPointerLock(); if (r && r.catch) r.catch(() => { }); } catch (_) { } }
    if (e.button === 0) input.attack = true; else if (e.button === 2) input.heavy = true;
  });
  let dragLook = null;
  window.addEventListener('mousemove', e => {
    if (state.phase !== 'play' || isTouch) return;
    if (document.pointerLockElement === canvas) { cam.yaw -= e.movementX * 0.0032; cam.pitch = clamp(cam.pitch + e.movementY * 0.0028, -0.5, 1.2); }
  });
  // اللمس
  const joy = { id: null, bx: 0, by: 0, x: 0, y: 0 }, look = { id: null, lx: 0, ly: 0 };
  const touchEl = $('touch'), joyEl = $('joy'), knobEl = $('joy-knob');
  touchEl.addEventListener('pointerdown', e => {
    if (state.phase !== 'play') return;
    if (e.clientX < innerWidth * 0.42 && joy.id === null) {
      joy.id = e.pointerId; joy.bx = e.clientX; joy.by = e.clientY; joy.x = joy.y = 0;
      joyEl.style.left = (joy.bx - 60) + 'px'; joyEl.style.top = (joy.by - 60) + 'px'; joyEl.classList.add('on'); knobEl.style.transform = 'translate(0,0)';
    } else if (look.id === null) { look.id = e.pointerId; look.lx = e.clientX; look.ly = e.clientY; }
    try { touchEl.setPointerCapture(e.pointerId); } catch (_) { }
  });
  touchEl.addEventListener('pointermove', e => {
    if (e.pointerId === joy.id) {
      let dx = e.clientX - joy.bx, dy = e.clientY - joy.by; const d = Math.hypot(dx, dy), Rr = 52; if (d > Rr) { dx = dx / d * Rr; dy = dy / d * Rr; }
      joy.x = dx / Rr; joy.y = dy / Rr; knobEl.style.transform = `translate(${dx}px,${dy}px)`;
    } else if (e.pointerId === look.id) {
      cam.yaw -= (e.clientX - look.lx) * 0.006; cam.pitch = clamp(cam.pitch + (e.clientY - look.ly) * 0.005, -0.5, 1.2); look.lx = e.clientX; look.ly = e.clientY;
    }
  });
  const endTouch = e => { if (e.pointerId === joy.id) { joy.id = null; joy.x = joy.y = 0; joyEl.classList.remove('on'); } if (e.pointerId === look.id) look.id = null; };
  touchEl.addEventListener('pointerup', endTouch); touchEl.addEventListener('pointercancel', endTouch);
  const btn = (id, fn, up) => { const el = $(id); el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); Sound.init(); fn(); el.classList.add('down'); }); el.addEventListener('pointerup', () => { el.classList.remove('down'); if (up) up(); }); el.addEventListener('pointerleave', () => el.classList.remove('down')); };
  btn('b-attack', () => input.attack = true); btn('b-heavy', () => input.heavy = true); btn('b-dodge', () => input.dodge = true);
  btn('b-jump', () => { input.jump = true; input.jumpHeld = true; }, () => input.jumpHeld = false); btn('b-parry', () => input.parry = true);
  btn('b-action', () => input.action = true); btn('b-eagle', () => input.eagle = true);

  function moveInput() {
    let x = 0, y = 0, sprint = false;
    if (joy.id !== null) { x = joy.x; y = -joy.y; const m = Math.hypot(x, y); if (m < 0.12) return [0, 0, 0, false]; sprint = m > 0.92; return [x / m, y / m, Math.min(1, m), sprint]; }
    if (keys.KeyA || keys.ArrowLeft) x -= 1; if (keys.KeyD || keys.ArrowRight) x += 1; if (keys.KeyW || keys.ArrowUp) y += 1; if (keys.KeyS || keys.ArrowDown) y -= 1;
    const m = Math.hypot(x, y); if (!m) return [0, 0, 0, false];
    return [x / m, y / m, 1, !!(keys.ShiftLeft || keys.ShiftRight)];
  }

  // ---------- اللاعب ----------
  const GRAV = 20;
  function playerHit(dmg, from, heavy) {
    const p = player; if (!p.alive || state.phase !== 'play' || state.cine) return;
    if (p.iframes > 0) return;
    if (p.parryT > 0 && from && !heavy) { // صد ناجح
      sfx('parry'); slowMo(0.25, 0.45); state.shake = 0.25;
      from.stun = Math.min(from.maxHp, from.stun + 60); from.staggerT = 0.8; from.atk.phase = 'none';
      if (from.stun >= from.maxHp) stunGuard(from);
      p.state = 'move'; p.parryT = 0; return;
    }
    p.hp -= dmg; p.hurtT = 0.4; p.regenT = 0; state.shake = 0.35; sfx('hurt'); flash();
    if (p.state !== 'climb') { p.state = 'hit'; p.stateT = 0.32; }
    if (p.hp <= 0) { p.hp = 0; p.alive = false; p.state = 'dead'; p.anim.mode = 'dead'; p.anim.t = 0; state.endKind = 'dead'; state.endT = 2; sfx('fail'); }
  }
  function slowMo(scale, dur) { state.timeScale = scale; state.slowT = dur; }
  function camFwd() { return new V3(Math.sin(cam.yaw), 0, Math.cos(cam.yaw)); }
  function nearestHay(x, z, maxD) { let best = null, bd = maxD; for (const h of HAY) { const d = Math.hypot(h.x - x, h.z - z); if (d < bd) { bd = d; best = h; } } return best; }
  function inHay(x, z, y) { for (const h of HAY) if (Math.abs(x - h.x) < 0.75 && Math.abs(z - h.z) < 1.15 && y < 1.2) return h; return null; }
  function enemiesAlive() { const l = guards.filter(g => g.alive); if (target.alive) l.push(target); return l; }
  function lockTarget(maxD = 4) {
    const p = player; let best = null, bs = 1e9;
    const f = camFwd();
    for (const e of enemiesAlive()) {
      const dx = e.pos.x - p.pos.x, dz = e.pos.z - p.pos.z, d = Math.hypot(dx, dz);
      if (d > maxD || Math.abs(e.pos.y - p.pos.y) > 1.2) continue;
      const dot = (dx * f.x + dz * f.z) / (d || 1); const s = d - dot * 2;
      if (dot > -0.3 && s < bs) { bs = s; best = e; }
    }
    return best;
  }
  function computeContext() {
    const p = player; if (!p.alive || state.cine || state.phase !== 'play') return null;
    if (p.carrying) return { type: 'drop' };
    if (p.state === 'sync') { const h = nearestHay(p.pos.x, p.pos.z, 9); return h ? { type: 'leap', hay: h } : null; }
    let best = null, bd = 1e9;
    for (const e of enemiesAlive()) {
      const dx = e.pos.x - p.pos.x, dz = e.pos.z - p.pos.z, dh = Math.hypot(dx, dz), dy = p.pos.y - e.pos.y;
      let type = null;
      if (e.kind === 'guard' && e.stunT > 0 && dh < 2.6 && Math.abs(dy) < 1) type = 'finisher';
      else if (dy > 1.4 && dy < 14 && dh < (p.onGround ? 4.5 : 3.5) && (e.kind === 'target' || e.state !== 'alert' || !p.onGround)) type = 'airkill';
      else if (Math.abs(dy) < 0.8 && dh < (p.hidden ? 2.4 : 1.9)) {
        const facing = Math.abs(angDiff(e.yaw, Math.atan2(p.pos.x - e.pos.x, p.pos.z - e.pos.z))) < 1.2;
        if (e.kind === 'target' || e.state !== 'alert' || !e.seen || !facing) type = 'kill';
      }
      if (type) { const s = dh - (e.kind === 'target' ? 50 : 0) - (type === 'finisher' ? 20 : 0); if (s < bd) { bd = s; best = { type, e }; } }
    }
    if (best) return best;
    for (const b of bodies) if (!b.hidden && !b.carried && Math.hypot(b.actor.pos.x - p.pos.x, b.actor.pos.z - p.pos.z) < 1.6 && Math.abs(b.actor.pos.y - p.pos.y) < 0.8) return { type: 'carry', b };
    return null;
  }
  const CTX_LABEL = { kill: 'اغتيال', airkill: 'اغتيال جوي', finisher: 'إعدام', leap: 'قفزة الإيمان', carry: 'شيل الجثة', drop: 'ارمي الجثة' };

  function startCine(c) { state.cine = Object.assign({ t: 0 }, c); }
  function doAction(c) {
    const p = player; if (!c) return;
    if (c.type === 'leap') {
      p.state = 'cine'; sfx('leap');
      startCine({ kind: 'leap', dur: 1.4, from: p.pos.clone(), to: new V3(c.hay.x, 0.6, c.hay.z), hay: c.hay });
      return;
    }
    if (c.type === 'carry') { c.b.carried = true; p.carrying = c.b; c.b.actor.anim.mode = 'carried'; p.anim.carry = true; return; }
    if (c.type === 'drop') { dropBody(); return; }
    const e = c.e; p.anim.sword = true;
    if (c.type === 'kill') {
      p.state = 'cine'; e.cineLock = true; sfx('swing');
      startCine({ kind: 'kill', dur: 1.0, e, from: p.pos.clone(), slow: 0.55 });
    } else if (c.type === 'airkill') {
      p.state = 'cine'; e.cineLock = true; sfx('leap');
      startCine({ kind: 'air', dur: 0.95, e, from: p.pos.clone(), slow: 0.4 });
    } else if (c.type === 'finisher') {
      p.state = 'cine'; e.cineLock = true; sfx('heavy');
      startCine({ kind: 'finisher', dur: 1.3, e, from: p.pos.clone(), slow: 0.35 });
      state.monoT = 0.55; stats.finishers++;
    }
  }
  function updateCine(dt) {
    const c = state.cine, p = player; c.t += dt;
    const k = clamp(c.t / c.dur, 0, 1);
    if (c.kind === 'leap') {
      p.pos.x = lerp(c.from.x, c.to.x, smooth(k)); p.pos.z = lerp(c.from.z, c.to.z, smooth(k));
      p.pos.y = lerp(c.from.y, c.to.y, k * k) + Math.sin(Math.PI * k) * 2;
      p.anim.mode = k < 0.85 ? 'fall' : 'air'; p.anim.snap = false;
      p.yawTo = Math.atan2(c.to.x - c.from.x, c.to.z - c.from.z);
      if (k >= 1) { state.cine = null; p.state = 'move'; p.onGround = true; p.vy = 0; p.pos.y = 0; p.maxY = 0; sfx('hay'); }
      return;
    }
    const e = c.e;
    if (c.kind === 'air') {
      const to = new V3(e.pos.x - Math.sin(e.yaw) * 0.6, e.pos.y, e.pos.z - Math.cos(e.yaw) * 0.6);
      const kk = clamp(k / 0.55, 0, 1);
      p.pos.x = lerp(c.from.x, to.x, smooth(kk)); p.pos.z = lerp(c.from.z, to.z, smooth(kk));
      p.pos.y = lerp(c.from.y, to.y, kk * kk) + Math.sin(Math.PI * kk) * 0.8;
      p.face(e.pos.x, e.pos.z);
      p.anim.mode = kk < 1 ? 'air' : 'stab'; p.anim.t = clamp((k - 0.55) / 0.45 + 0.4, 0, 1);
      if (kk >= 1 && !c.hit) { c.hit = true; sfx('kill'); state.shake = 0.4; killEnemy(e, true); }
      if (state.timeScale > c.slow && !c.slowed) { slowMo(c.slow, 0.6); c.slowed = true; }
    } else if (c.kind === 'kill' || c.kind === 'finisher') {
      const dist0 = c.kind === 'kill' ? 0.75 : 1.0;
      const ang = Math.atan2(p.pos.x - e.pos.x, p.pos.z - e.pos.z);
      const to = new V3(e.pos.x + Math.sin(ang) * dist0, e.pos.y, e.pos.z + Math.cos(ang) * dist0);
      p.pos.x = damp(p.pos.x, to.x, 12, dt); p.pos.z = damp(p.pos.z, to.z, 12, dt);
      p.face(e.pos.x, e.pos.z); e.face(p.pos.x, p.pos.z);
      if (c.kind === 'kill') { p.anim.mode = 'stab'; p.anim.t = k; e.anim.mode = k > 0.45 ? 'hit' : e.anim.mode; }
      else { p.anim.mode = 'heavy'; p.anim.t = clamp(k * 1.2, 0, 1); e.anim.mode = 'stun'; }
      if (!c.slowed) { slowMo(c.slow, c.kind === 'kill' ? 0.5 : 0.8); c.slowed = true; }
      if (k > (c.kind === 'kill' ? 0.5 : 0.55) && !c.hit) { c.hit = true; sfx('kill'); state.shake = 0.3; killEnemy(e, true); }
    }
    if (k >= 1) { state.cine = null; p.state = 'move'; p.onGround = groundAt(p.pos.x, p.pos.z, p.pos.y) >= p.pos.y - 0.05; p.maxY = p.pos.y; p.vy = 0; }
  }
  function dropBody() {
    const p = player, b = p.carrying; if (!b) return;
    p.carrying = null; p.anim.carry = false; b.carried = false;
    const a = b.actor; a.pos.set(p.pos.x + Math.sin(p.yaw) * 0.8, 0, p.pos.z + Math.cos(p.yaw) * 0.8); a.pos.y = groundAt(a.pos.x, a.pos.z, p.pos.y + 0.5);
    a.anim.mode = 'dead'; a.anim.t = 1;
    const h = inHay(a.pos.x, a.pos.z, a.pos.y) || inHay(p.pos.x, p.pos.z, p.pos.y);
    if (h) { b.hidden = true; a.pos.set(h.x, 0.3, h.z); a.rig.root.visible = false; sfx('hay'); toast('الجثة استخبت في القش'); }
  }
  function updatePlayer(dt) {
    const p = player;
    if (p.hurtT > 0) p.hurtT -= dt;
    if (p.iframes > 0) p.iframes -= dt;
    if (p.parryT > 0) p.parryT -= dt;
    if (p.comboT > 0) p.comboT -= dt; else p.combo = 0;
    p.stamT += dt; if (p.stamT > 1.4 && p.stam < 4) { p.stam++; p.stamT = 0; }
    if (!p.alive) { p.anim.t += dt; return; }
    if (state.cine) { updateCine(dt); return; }
    const [ix, iy, m, sprintIn] = moveInput();
    const f = camFwd(), rx = -f.z, rz = f.x;
    let mx = f.x * iy + rx * ix, mz = f.z * iy + rz * ix;
    const ml = Math.hypot(mx, mz); if (ml > 0) { mx /= ml; mz /= ml; }
    const carrying = !!p.carrying;
    p.sprint = sprintIn && m > 0 && !carrying;
    const speed = carrying ? 1.6 : p.sprint ? 7 : 4.2 * (joy.id !== null ? clamp(m * 1.2, 0.35, 1) : 1);
    const consume = k => { const v = input[k]; input[k] = false; return v; };

    // صدارة الحالات
    if (p.state === 'climb') {
      const b = p.climbB;
      if (consume('jump')) { p.state = 'move'; p.onGround = false; p.vy = 6; p.knock = { x: p.climbN.x * 4.5, z: p.climbN.z * 4.5 }; p.yawTo = Math.atan2(p.climbN.x, p.climbN.z); sfx('jump'); return; }
      if (consume('dodge')) { p.state = 'move'; p.onGround = false; p.vy = 0; p.pos.x += p.climbN.x * 0.1; p.pos.z += p.climbN.z * 0.1; return; }
      const into = -(mx * p.climbN.x + mz * p.climbN.z);
      if (m > 0 && into > -0.2) {
        p.pos.y += 4.2 * dt; p.anim.phase += dt * 9; if (Math.random() < dt * 4) sfx('climb');
        // تحرك جانبي
        const side = mx * -p.climbN.z + mz * p.climbN.x;
        if (Math.abs(side) > 0.5) { p.pos.x += -p.climbN.z * side * 1.5 * dt; p.pos.z += p.climbN.x * side * 1.5 * dt; }
      }
      p.anim.mode = 'climb'; p.yawTo = Math.atan2(-p.climbN.x, -p.climbN.z);
      p.pos.x = clamp(p.pos.x, b.x0 - p.r - 0.02, b.x1 + p.r + 0.02); p.pos.z = clamp(p.pos.z, b.z0 - p.r - 0.02, b.z1 + p.r + 0.02);
      const stillOn = p.pos.x > b.x0 - p.r - 0.05 && p.pos.x < b.x1 + p.r + 0.05 && p.pos.z > b.z0 - p.r - 0.05 && p.pos.z < b.z1 + p.r + 0.05;
      if (p.pos.y >= b.h - 0.15) {
        p.pos.x -= p.climbN.x * 0.75; p.pos.z -= p.climbN.z * 0.75; p.pos.y = b.h; p.state = 'move'; p.onGround = true; p.vy = 0; p.maxY = b.h; sfx('land');
        if (b.kind === 'minaret') reachTop();
      } else if (!stillOn) { p.state = 'move'; p.onGround = false; p.vy = 0; }
      p.maxY = p.pos.y;
      return;
    }
    if (p.state === 'sync') {
      p.anim.mode = 'idle'; p.vy = 0;
      if (consume('jump')) { const h = nearestHay(p.pos.x, p.pos.z, 9); if (h) doAction({ type: 'leap', hay: h }); }
      if (m > 0) p.state = 'move';
      else return;
    }
    if (p.state === 'attack' || p.state === 'heavy' || p.state === 'parry' || p.state === 'dodge' || p.state === 'hit') {
      p.stateT -= dt; p.anim.t = clamp(1 - p.stateT / p.stateDur, 0, 1);
      if (p.state === 'dodge') { const s = 9 * Math.max(0, p.stateT / p.stateDur); p.move(p.dodgeDir.x * s * dt, p.dodgeDir.z * s * dt); }
      if ((p.state === 'attack' || p.state === 'heavy') && !p.didHit && p.anim.t >= (p.state === 'heavy' ? 0.55 : 0.42)) { p.didHit = true; meleeHit(p.state === 'heavy'); }
      if (p.state === 'attack' && p.stateT < 0.12 && consume('attack')) { startAttack(false); return; }
      if (p.stateT <= 0) { p.state = 'move'; }
      else { applyGravity(dt); return; }
    }
    // حركة عادية
    if (consume('eagle')) { if (state.eagleT <= 0) { state.eagleT = 7; sfx('sync'); revealByEagle(); } }
    if (consume('action')) { doAction(computeContext()); if (state.cine) return; }
    if (!carrying) {
      if (consume('attack') && p.onGround) { startAttack(false); return; }
      if (consume('heavy') && p.onGround && p.stam > 0) { startAttack(true); return; }
      if (consume('parry') && p.onGround) { p.state = 'parry'; p.stateT = p.stateDur = 0.42; p.parryT = 0.32; p.anim.mode = 'parry'; const t = lockTarget(5); if (t) p.face(t.pos.x, t.pos.z); return; }
      if (consume('dodge') && p.onGround && p.stam > 0) {
        p.stam--; p.stamT = 0; p.state = 'dodge'; p.stateT = p.stateDur = 0.5; p.iframes = 0.42; p.anim.mode = 'dodge'; p.anim.t = 0;
        p.dodgeDir = m > 0 ? { x: mx, z: mz } : { x: -Math.sin(p.yaw), z: -Math.cos(p.yaw) }; p.yawTo = Math.atan2(p.dodgeDir.x, p.dodgeDir.z); sfx('jump'); return;
      }
    } else { input.attack = input.heavy = input.parry = input.dodge = false; }
    const vx = mx * speed * (m > 0 ? 1 : 0), vz = mz * speed * (m > 0 ? 1 : 0);
    let hx = vx, hz = vz;
    if (!p.onGround) { if (p.knock) { hx = p.knock.x + vx * 0.3; hz = p.knock.z + vz * 0.3; } else { hx = (p.airV ? p.airV.x : 0) * 0.85 + vx * 0.25; hz = (p.airV ? p.airV.z : 0) * 0.85 + vz * 0.25; } }
    const hit = p.move(hx * dt, hz * dt);
    if (m > 0) p.yawTo = Math.atan2(mx, mz);
    p.speedNow = m > 0 ? speed : 0;
    // التسلق
    if (hit && m > 0 && hit.b.climb && !carrying) {
      const into = -(mx * hit.nx + mz * hit.nz);
      if (into > 0.6) { p.pushT += dt; if (p.pushT > (p.sprint || !p.onGround ? 0.02 : 0.18) && hit.b.h - p.pos.y > STEP) { p.state = 'climb'; p.climbB = hit.b; p.climbN = { x: hit.nx, z: hit.nz }; p.vy = 0; p.onGround = false; p.knock = null; p.pushT = 0; return; } }
      else p.pushT = 0;
    } else p.pushT = 0;
    if (p.onGround && consume('jump')) {
      p.vy = 6.3; p.onGround = false; p.airV = { x: vx, z: vz }; p.knock = null; p.maxY = p.pos.y; sfx('jump');
    }
    input.jump = false;
    applyGravity(dt);
    if (p.onGround) { p.airV = { x: vx, z: vz }; p.walkAnimP(dt); }
    else p.anim.mode = p.vy < -9 ? 'fall' : 'air';
  }
  function applyGravity(dt) {
    const p = player;
    const g = groundAt(p.pos.x, p.pos.z, p.pos.y);
    if (p.onGround) {
      if (p.pos.y - g > 0.45) { p.onGround = false; p.vy = 0; p.maxY = p.pos.y; }
      else p.pos.y = g;
    }
    if (!p.onGround) {
      p.vy -= GRAV * dt; p.pos.y += p.vy * dt; p.maxY = Math.max(p.maxY, p.pos.y);
      const g2 = groundAt(p.pos.x, p.pos.z, p.pos.y - p.vy * dt);
      if (p.pos.y <= g2) {
        p.pos.y = g2; p.onGround = true; p.knock = null;
        const fall = p.maxY - g2; p.vy = 0; p.maxY = g2;
        if (inHay(p.pos.x, p.pos.z, g2)) { sfx('hay'); }
        else if (fall > 8) { sfx('land'); playerHit(Math.round((fall - 8) * 11), null, true); if (fall > 17 && p.alive) playerHit(999, null, true); }
        else if (fall > 1.2) sfx('land');
      }
    }
  }
  Actor.prototype.walkAnimP = function (dt) {
    const s = this.speedNow;
    if (s > 0.1) { this.anim.mode = s > 5 ? 'run' : s > 3 ? 'run' : 'walk'; this.anim.phase += dt * (s > 3 ? s * 1.6 : s * 2.8); }
    else this.anim.mode = 'idle';
  };
  function startAttack(heavy) {
    const p = player, t = lockTarget(4.2);
    if (t) p.face(t.pos.x, t.pos.z); else p.yawTo = cam.yaw;
    if (t) { const d = Math.hypot(t.pos.x - p.pos.x, t.pos.z - p.pos.z); if (d > 1.6) { const s = Math.min(d - 1.4, 1.2); p.move((t.pos.x - p.pos.x) / d * s, (t.pos.z - p.pos.z) / d * s); } }
    p.didHit = false;
    if (heavy) { p.stam--; p.stamT = 0; p.state = 'heavy'; p.stateT = p.stateDur = 0.85; p.anim.mode = 'heavy'; sfx('heavy'); }
    else { p.state = 'attack'; p.stateT = p.stateDur = 0.48; p.anim.mode = 'attack'; p.anim.combo = p.combo; p.combo = (p.combo + 1) % 3; p.comboT = 1; sfx('swing'); }
    p.anim.t = 0;
  }
  function meleeHit(heavy) {
    const p = player; let any = false;
    for (const e of enemiesAlive()) {
      const dx = e.pos.x - p.pos.x, dz = e.pos.z - p.pos.z, d = Math.hypot(dx, dz);
      if (d > (heavy ? 2.6 : 2.3) || Math.abs(e.pos.y - p.pos.y) > 1) continue;
      if (Math.abs(angDiff(p.yaw, Math.atan2(dx, dz))) > 1.1) continue;
      any = true; damageEnemy(e, heavy ? 34 : (p.anim.combo === 2 ? 26 : 17), heavy ? 38 : 16, heavy);
    }
    if (any) { sfx(heavy ? 'flesh' : 'clash'); state.shake = heavy ? 0.25 : 0.12; }
  }
  function damageEnemy(e, dmg, stun, heavy) {
    if (e.kind === 'target') { e.hp -= dmg; if (e.hp <= 0) killEnemy(e); else targetFlee(); return; }
    if (e.stunT > 0) { e.hp -= dmg * 1.5; }
    else {
      const blocking = e.state === 'alert' && Math.random() < (heavy ? 0.1 : 0.35) && e.atk.phase === 'none' && e.role !== 'archer';
      if (blocking) { e.stun = Math.min(e.maxHp, e.stun + stun * 0.6); e.anim.mode = 'parry'; e.staggerT = 0.2; sfx('clash'); }
      else {
        e.hp -= dmg; e.stun = Math.min(e.maxHp, e.stun + stun);
        e.hitStreak = (e.hitStreak || 0) + 1;
        const interrupt = heavy || (!e.atk.heavy && Math.random() < 0.3);
        if (e.atk.phase === 'none' || interrupt) e.staggerT = heavy ? 0.6 : 0.16;
        if (interrupt && e.atk.phase !== 'none') { e.atk.phase = 'none'; attackers = Math.max(0, attackers - 1); }
        if (e.hitStreak >= 3 && e.role !== 'archer') { e.hitStreak = 0; e.staggerT = 0; e.atkCD = 0; } // يرد بعد ٣ ضربات
      }
    }
    e.stunDecayT = 2.5;
    if (e.state !== 'alert') { e.lastKnown = player.pos.clone(); setAlert(e); }
    if (e.hp <= 0) { killEnemy(e); return; }
    if (e.stun >= e.maxHp && e.stunT <= 0) stunGuard(e);
  }
  function stunGuard(e) { e.stunT = 3.5; e.atk.phase = 'none'; e.say('آه…', 1.2); }
  function killEnemy(e, silent) {
    if (!e.alive) return;
    e.alive = false; e.cineLock = false; e.anim.mode = 'dead'; e.anim.t = 0; e.atk && (e.atk.phase = 'none');
    if (e.kind === 'guard') stats.kills++;
    const b = { actor: e, found: false, hidden: false, carried: false };
    bodies.push(b);
    // شهود
    const eye = new V3(e.pos.x, e.pos.y + 1.0, e.pos.z);
    for (const g of guards) if (g.alive && g.state !== 'alert' && canSeePoint(g, eye, e.pos.y > 1 ? 'roof' : 'ground') >= 0) { b.found = true; g.lastKnown = player.pos.clone(); setAlert(g); }
    if (target.alive && e !== target && canSeePoint(target, eye, 'ground') >= 0) targetFlee();
    let screams = 0;
    for (const c of civs) {
      if (c.mode === 'flee' || c.pos.distanceTo(e.pos) > 12 || !losClear(new V3(c.pos.x, 1.6, c.pos.z), eye)) continue;
      civFlee(c, e.pos); if (screams < 2) { c.say(pick(BARK.scream)); screams++; }
    }
    if (screams) { sfx('scream'); for (const g of guards) if (g.alive && g.state !== 'alert' && g.state !== 'search' && g.pos.distanceTo(e.pos) < 18) startSearch(g, e.pos); }
    if (e === target) onTargetKilled();
  }
  function reachTop() {
    const p = player; p.state = 'sync';
    if (!state.synced) {
      state.synced = true; state.targetKnown = true; sfx('sync'); banner('تمت المزامنة', 'حسن آغا ظهر على البوصلة');
      startCine({ kind: 'sync', dur: 3.2 });
    }
  }

  // ---------- الرؤية والحراس ----------
  function canSeePoint(g, pt, tLevel) {
    const eye = new V3(g.pos.x, g.pos.y + 1.6, g.pos.z);
    const dx = pt.x - eye.x, dz = pt.z - eye.z, d = Math.hypot(dx, dz);
    const gRoof = g.pos.y > 1;
    const range = (!gRoof && tLevel === 'roof') ? 12 : g.range;
    if (d > range) return -1;
    if (d > 2.5 && Math.abs(angDiff(g.yaw, Math.atan2(dx, dz))) > g.fov / 2) return -1;
    if (!losClear(eye, pt)) return -1;
    return d;
  }
  function perceive(g, dt) {
    const p = player; g.seen = false;
    if (state.phase !== 'play' || !p.alive || g.cineLock) return;
    let d = -1;
    if (!p.hidden && p.state !== 'sync') d = canSeePoint(g, new V3(p.pos.x, p.pos.y + 1.2, p.pos.z), p.pos.y > 1 ? 'roof' : 'ground');
    if (d >= 0 && p.blend && d > (g.state === 'alert' ? 5 : 3)) d = -1;
    if (d >= 0) {
      g.seen = true; g.lastKnown = p.pos.clone();
      if (g.state === 'alert') g.lostT = 0;
      else {
        let rate = 0.85 * (1.3 - d / g.range);
        if (p.sprint) rate *= 1.8; if (p.state === 'climb' || !p.onGround) rate *= 1.6; if (p.carrying) rate *= 2.2; if (p.blend) rate *= 0.4;
        if (p.state === 'attack' || p.state === 'heavy') rate *= 3;
        if (p.pos.y > 1 && g.pos.y < 1) rate *= 1.25; if (g.state === 'search') rate *= 1.6; if (d < 3) rate += 1.3;
        g.sus = Math.min(1, g.sus + rate * dt);
        if (g.sus >= 1) setAlert(g);
        else if (g.sus > 0.3 && g.state !== 'suspicious' && g.state !== 'search') { g.state = 'suspicious'; g.susT = 0; g.path = null; g.say(pick(BARK.sus)); sfx('sus'); }
      }
    } else if (g.state !== 'alert') g.sus = Math.max(0, g.sus - 0.14 * dt);
    if (g.state !== 'alert') for (const b of bodies) {
      if (b.found || b.hidden || b.carried) continue;
      if (Math.abs(b.actor.pos.x - g.pos.x) > 14 || Math.abs(b.actor.pos.z - g.pos.z) > 14) continue;
      if (canSeePoint(g, new V3(b.actor.pos.x, b.actor.pos.y + 0.3, b.actor.pos.z), 'ground') >= 0) { b.found = true; g.say(pick(BARK.found)); sfx('sus'); startSearch(g, b.actor.pos); g.sus = Math.max(g.sus, 0.5); if (target.alive && target.pos.distanceTo(b.actor.pos) < 20) targetFlee(); break; }
    }
  }
  function setAlert(g, propagated) {
    if (!g.alive) return;
    const wasAny = guards.some(o => o.alive && o.state === 'alert');
    if (g.state !== 'alert') { g.state = 'alert'; g.sus = 1; g.lostT = 0; g.path = null; g.repathT = 0; if (!g.lastKnown) g.lastKnown = player.pos.clone(); if (!propagated || Math.random() < 0.4) g.say(pick(BARK.alert)); }
    if (!wasAny) { stats.detections++; sfx('alert'); }
    if (!propagated) for (const o of guards) if (o !== g && o.alive && o.state !== 'alert' && o.pos.distanceTo(g.pos) < 16) { o.lastKnown = g.lastKnown.clone(); setAlert(o, true); }
    if (target.alive && (g.role === 'escort' || g.pos.distanceTo(target.pos) < 14)) targetFlee();
  }
  function startSearch(g, pos) { g.state = 'search'; g.searchT = 7; g.searchBase = g.yaw; g.atk.phase = 'none'; g.lastKnown = pos.clone(); if (g.role !== 'archer') g.goTo(pos.x, pos.z); else g.path = null; }
  function updateGuard(g, dt) {
    if (!g.alive) { g.anim.t += dt; return; }
    g.speedNow = 0;
    if (g.cineLock) return;
    if (g.staggerT > 0) g.staggerT -= dt;
    if (g.stunDecayT > 0) g.stunDecayT -= dt; else g.stun = Math.max(0, g.stun - 8 * dt);
    if (g.stunT > 0) { g.stunT -= dt; g.anim.mode = 'stun'; if (g.stunT <= 0) g.stun = 0; return; }
    perceive(g, dt);
    switch (g.state) {
      case 'patrol': guardPatrol(g, dt); break;
      case 'suspicious':
        g.susT += dt; if (g.lastKnown) g.face(g.lastKnown.x, g.lastKnown.z);
        if (g.susT > 1.3 && g.role !== 'archer' && g.lastKnown) { g.repathT -= dt; if (g.repathT <= 0) { g.goTo(g.lastKnown.x, g.lastKnown.z); g.repathT = 1; } g.followPath(1.1, dt); }
        if (g.sus <= 0.02) { g.state = 'return'; g.path = null; if (Math.random() < 0.6) g.say(pick(BARK.calm)); }
        break;
      case 'alert': guardCombat(g, dt); break;
      case 'search': {
        let arrived = true; if (g.role !== 'archer' && g.path) arrived = g.followPath(2.4, dt);
        if (arrived) { g.searchT -= dt; g.yawTo = g.searchBase + Math.sin(state.time * 1.4 + g.pos.x) * 1.5; }
        const p = player;
        if (p.hidden && g.pos.distanceTo(p.pos) < 2.2 && (g.lastKnown.distanceTo(p.pos) < 2.5 || Math.random() < dt * 0.3)) { g.say('لقيتك!'); g.lastKnown = p.pos.clone(); setAlert(g); p.pos.x += 1.2; collide(p.pos, p.r, p.pos.y); }
        if (g.searchT <= 0) { g.state = 'return'; g.path = null; g.sus = 0; if (Math.random() < 0.7) g.say(pick(BARK.giveup)); }
        break;
      }
      case 'return':
        if (g.role === 'post' || g.role === 'archer') { if (g.role === 'post') { if (!g.path) g.goTo(g.home.x, g.home.z); if (g.followPath(1.4, dt)) { g.path = null; g.state = 'patrol'; } } else g.state = 'patrol'; }
        else if (g.role === 'escort') g.state = target.alive ? 'patrol' : (g.role = 'post', g.home = g.pos.clone(), g.homeYaw = g.yaw, 'patrol');
        else { g.path = null; g.state = 'patrol'; }
        break;
    }
    if (g.state !== 'alert') { g.atk.phase = 'none'; g.inCombat = false; }
    if (g.atk.phase === 'none' && g.staggerT <= 0) g.walkAnim(dt, g.speedNow);
    else if (g.staggerT > 0 && g.atk.phase === 'none') g.anim.mode = g.anim.mode === 'parry' ? 'parry' : 'hit';
  }
  function guardPatrol(g, dt) {
    if (g.role === 'post' || g.role === 'archer') {
      if (g.role === 'post' && Math.hypot(g.pos.x - g.home.x, g.pos.z - g.home.z) > 0.6) { if (!g.path) g.goTo(g.home.x, g.home.z); if (g.followPath(1.4, dt)) g.path = null; }
      else g.yawTo = g.homeYaw + Math.sin(state.time * 0.4 + g.pos.x) * 0.9;
      return;
    }
    if (g.role === 'escort') {
      if (!target.alive) { g.role = 'post'; g.home = g.pos.clone(); g.homeYaw = g.yaw; return; }
      const tr = target.trail, pt = tr[Math.max(0, tr.length - 1 - (8 + g.escortIdx * 6))];
      if (!pt) return;
      const dx = pt.x - g.pos.x, dz = pt.z - g.pos.z, d = Math.hypot(dx, dz);
      if (d > 12) { g.repathT -= dt; if (g.repathT <= 0 || !g.path) { g.goTo(target.pos.x, target.pos.z); g.repathT = 1; } g.followPath(3.5, dt); return; }
      if (d > 0.3) { const sp = Math.min(target.state === 'flee' ? 4 : 1.6, d * 2); g.move(dx / d * sp * dt, dz / d * sp * dt); g.yawTo = Math.atan2(dx, dz); g.speedNow = sp; }
      else g.yawTo = target.yaw;
      return;
    }
    if (g.waitT > 0) { g.waitT -= dt; g.yawTo = g.waitYaw + Math.sin(g.waitT * 2) * 0.9; return; }
    if (!g.path) { const [x, z] = g.route[g.wi]; if (!g.goTo(x, z)) { g.wi = (g.wi + 1) % g.route.length; g.waitT = 1; return; } }
    if (g.followPath(1.4, dt)) { g.path = null; g.waitT = 1.8; g.waitYaw = g.yaw; g.wi = (g.wi + 1) % g.route.length; }
  }
  let attackers = 0;
  function guardCombat(g, dt) {
    const p = player;
    if (!g.seen) g.lostT += dt;
    if (g.lostT > 4) { startSearch(g, g.lastKnown); return; }
    const dx = p.pos.x - g.pos.x, dz = p.pos.z - g.pos.z, d = Math.hypot(dx, dz), dy = p.pos.y - g.pos.y;
    if (g.seen) g.face(p.pos.x, p.pos.z);
    g.inCombat = d < 14;
    if (g.role === 'archer') {
      if (g.seen && d < 2 && Math.abs(dy) < 1) return meleeAI(g, dt, d, dx, dz);
      g.shootT -= dt; g.anim.mode = g.shootT < 0.8 ? 'draw' : 'idle';
      if (g.seen && g.shootT <= 0) { shootArrow(g); g.shootT = 2.2 + Math.random(); }
      return;
    }
    if (g.staggerT > 0) return;
    if (Math.abs(dy) < 1 && d < 3.2 && g.seen) return meleeAI(g, dt, d, dx, dz);
    if (g.atk.phase !== 'none') { g.atk.phase = 'none'; attackers = Math.max(0, attackers - 1); }
    g.repathT -= dt;
    if (g.repathT <= 0 || !g.path) { g.goTo(g.lastKnown.x, g.lastKnown.z); g.repathT = 0.5; }
    const arrived = g.followPath(5.2, dt);
    if (arrived && g.seen && dy > 1.2 && !g.bark && Math.random() < dt * 0.4) g.say(pick(BARK.roof));
  }
  function meleeAI(g, dt, d, dx, dz) {
    const a = g.atk, p = player;
    g.atkCD -= dt;
    if (a.phase === 'none') {
      if (d > 2.0) { const s = Math.min(3, d - 1.9); g.move(dx / d * s * dt, dz / d * s * dt); g.speedNow = s; }
      else if (d < 1.3) { g.move(-dx / d * 1.2 * dt, -dz / d * 1.2 * dt); g.speedNow = 1.2; }
      else { const side = (g.pos.x * 7 % 2 > 1) ? 1 : -1; g.move(-dz / d * 0.8 * side * dt, dx / d * 0.8 * side * dt); g.speedNow = 0.8; }
      if (g.atkCD <= 0 && d < 2.6 && (attackers < 2 || g.hitStreak === 0 && g.atkCD < -0.01) && p.alive) {
        a.phase = 'windup'; a.heavy = Math.random() < 0.22; a.t = a.heavy ? 1.0 : 0.65; attackers++;
        if (Math.random() < 0.3) g.say(pick(BARK.fight), 1.4);
      }
    } else if (a.phase === 'windup') {
      a.t -= dt; g.anim.mode = g.rig.weapon && RIGS.guard.weapon === 'spear' && g.rig === null ? 'thrust' : 'windup';
      if (a.t <= 0) {
        a.phase = 'strike'; a.t = 0.3; sfx(a.heavy ? 'heavy' : 'swing');
        if (d < 2.9 && Math.abs(angDiff(g.yaw, Math.atan2(p.pos.x - g.pos.x, p.pos.z - g.pos.z))) < 0.9 && Math.abs(p.pos.y - g.pos.y) < 1) playerHit(a.heavy ? 26 : 13, g, a.heavy);
      }
    } else if (a.phase === 'strike') {
      a.t -= dt; g.anim.mode = 'strike';
      if (a.t <= 0) { a.phase = 'none'; attackers = Math.max(0, attackers - 1); g.atkCD = 1.2 + Math.random() * 1.8; }
    }
  }
  const arrowGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.8, 4); arrowGeo.rotateX(Math.PI / 2);
  function shootArrow(g) {
    const p = player, from = new V3(g.pos.x, g.pos.y + 1.45, g.pos.z);
    const lead = new V3(p.pos.x + (p.airV ? p.airV.x : 0) * 0.3, p.pos.y + 1.1, p.pos.z + (p.airV ? p.airV.z : 0) * 0.3);
    const dir = lead.sub(from).normalize();
    const m = new THREE.Mesh(arrowGeo, col(0x3b2716)); m.position.copy(from); m.lookAt(from.clone().add(dir)); scene.add(m);
    arrows.push({ pos: from, vel: dir.multiplyScalar(32), life: 2, mesh: m }); sfx('arrow');
  }
  function updateArrows(dt) {
    const p = player;
    for (let i = arrows.length - 1; i >= 0; i--) {
      const a = arrows[i]; const old = a.pos.clone(); a.pos.addScaledVector(a.vel, dt); a.life -= dt; a.mesh.position.copy(a.pos);
      let dead = a.life <= 0 || !losClear(old, a.pos);
      const chest = new V3(p.pos.x, p.pos.y + 1.1, p.pos.z);
      if (!dead && p.alive && !p.hidden && chest.distanceTo(a.pos) < 0.55) { if (p.parryT > 0) sfx('clash'); else playerHit(12, null, false); dead = true; }
      if (dead) { scene.remove(a.mesh); arrows.splice(i, 1); }
    }
  }

  // ---------- الهدف ----------
  function targetFlee() {
    const t = target; if (!t.alive || t.state === 'flee') return;
    t.state = 'flee'; t.path = null; state.targetKnown = true; t.say('يا عسكر! احموني!');
    banner('حسن آغا بيهرب!', 'الحقه قبل ما يوصل باب القلعة');
  }
  function updateTarget(dt) {
    const t = target; if (!t.alive) { t.anim.t += dt; return; }
    t.speedNow = 0; if (t.cineLock) return;
    const p = player;
    if (t.state !== 'flee' && state.phase === 'play' && p.alive && !p.hidden) {
      let d = canSeePoint(t, new V3(p.pos.x, p.pos.y + 1.2, p.pos.z), p.pos.y > 1 ? 'roof' : 'ground');
      if (d >= 0 && p.blend && d > 3) d = -1;
      if (d >= 0) { t.sus += (0.5 * (1.3 - d / t.range) + (p.sprint ? 0.7 : 0) + (d < 3 ? 0.9 : 0)) * dt; if (t.sus > 0.35 && !t.bark) t.say('مين ده اللي بيبصلي؟'); if (t.sus >= 1) { targetFlee(); for (const g of guards) if (g.role === 'escort' && g.alive) { g.lastKnown = p.pos.clone(); setAlert(g, true); } } }
      else t.sus = Math.max(0, t.sus - 0.1 * dt);
    }
    if (t.state === 'flee') {
      if (!t.path) t.goTo(GATE.x, GATE.z);
      t.followPath(4.6, dt);
      if (Math.hypot(t.pos.x - GATE.x, t.pos.z - GATE.z) < 1.5 && !state.endKind) { state.endKind = 'escape'; state.endT = 1; sfx('fail'); }
    } else if (t.state === 'stop') {
      t.waitT -= dt; t.yawTo = t.stopYaw; if (!t.bark && Math.random() < dt * 0.3) t.say(pick(BARK.target));
      if (t.waitT <= 0) { t.state = 'walk'; t.wi = (t.wi + 1) % TARGET_ROUTE.length; t.path = null; }
    } else {
      if (!t.path) { const [x, z] = TARGET_ROUTE[t.wi]; t.goTo(x, z); }
      if (t.followPath(1.2, dt)) { t.path = null; const w = TARGET_ROUTE[t.wi]; if (w[2]) { t.state = 'stop'; t.waitT = w[2]; t.stopYaw = w[3]; } else t.wi = (t.wi + 1) % TARGET_ROUTE.length; }
    }
    const lt = t.trail[t.trail.length - 1]; if (!lt || lt.distanceTo(t.pos) > 0.25) { t.trail.push(t.pos.clone()); if (t.trail.length > 80) t.trail.shift(); }
    t.walkAnim(dt, t.speedNow);
    if (!state.targetKnown && p.pos.distanceTo(t.pos) < 14 && losClear(new V3(p.pos.x, p.pos.y + 1.6, p.pos.z), new V3(t.pos.x, 1.4, t.pos.z))) { state.targetKnown = true; banner('ده حسن آغا', 'العمامة الكبيرة والقفطان الأخضر'); }
  }
  function onTargetKilled() {
    state.objective = 'escape'; safeRing.visible = true;
    banner('حسن آغا مات', 'الإتاوة اتدفعت… بالدم');
    subtitle('حسن آغا: «فاكر إنك غيّرت حاجة؟ الباشا هيبعت غيري… والألباني اللي جاي أخطر مننا كلنا.»', 6);
    for (const g of guards) if (g.alive && g.role === 'escort' && g.state !== 'alert') startSearch(g, target.pos);
  }

  // ---------- الأهالي ----------
  function civFlee(c, from) {
    if (c.mode === 'flee') return; c.mode = 'flee'; c.path = null;
    for (let i = 0; i < 12; i++) { const [x, z] = pick(walkCells); if (Math.hypot(x - from.x, z - from.z) > 18 && Math.hypot(x - c.pos.x, z - c.pos.z) < 40) { c.goTo(x, z); break; } }
  }
  function updateCiv(c, dt) {
    c.speedNow = 0;
    switch (c.mode) {
      case 'idle': c.yawTo = c.homeYaw + Math.sin(state.time * 0.4 + c.pos.x) * 0.3; c.anim.mode = c.pose || 'idle'; return;
      case 'wander':
        if (c.waitT > 0) { c.waitT -= dt; break; }
        if (!c.path) { for (let i = 0; i < 6; i++) { const [x, z] = pick(walkCells); const dd = Math.hypot(x - c.pos.x, z - c.pos.z); if (dd > 6 && dd < 30) { c.goTo(x, z); break; } } if (!c.path) { c.waitT = 1; break; } }
        if (c.followPath(c.speed, dt)) { c.path = null; c.waitT = 2 + Math.random() * 5; }
        break;
      case 'flee':
        if (!c.path) { c.mode = 'wander'; c.waitT = 2; break; }
        if (c.followPath(4.5, dt)) { c.mode = 'wander'; c.path = null; c.waitT = 3; }
        break;
    }
    c.walkAnim(dt, c.speedNow);
  }
  function separate() {
    const list = [];
    if (player.alive && player.onGround && !state.cine && !player.hidden) list.push(player);
    for (const g of guards) if (g.alive && !g.cineLock) list.push(g);
    if (target.alive && !target.cineLock) list.push(target);
    for (const c of civs) list.push(c);
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j]; if (Math.abs(a.pos.y - b.pos.y) > 1) continue;
        const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z, min = 0.62;
        if (dx > min || dx < -min || dz > min || dz < -min) continue;
        const d2 = dx * dx + dz * dz; if (d2 >= min * min || d2 < 1e-6) continue;
        const d = Math.sqrt(d2), push = (min - d) * 0.5, nx = dx / d, nz = dz / d, wa = a === player ? 0.2 : 1;
        a.move(-nx * push * wa, -nz * push * wa); b.move(nx * push, nz * push);
      }
    }
  }
  function updatePlayerStatus() {
    const p = player;
    p.hidden = p.alive && p.onGround && !state.cine && !p.carrying && !!inHay(p.pos.x, p.pos.z, p.pos.y);
    if (p.hidden && !p.wasHidden) { sfx('hay'); }
    p.wasHidden = p.hidden; p.rig.root.visible = !p.hidden;
    p.blend = false;
    if (p.alive && p.onGround && p.pos.y < 0.5 && !p.sprint && !p.hidden && !p.carrying && p.state === 'move') {
      let n = 0; for (const c of civs) if (c.mode !== 'flee' && Math.abs(c.pos.x - p.pos.x) < 1.8 && Math.abs(c.pos.z - p.pos.z) < 1.8) n++;
      p.blend = n >= 2;
    }
    for (const h of HAY) h.mesh.scale.x = 0.85 + (p.hidden && inHay(p.pos.x, p.pos.z, p.pos.y) === h && p.speedNow > 0 ? Math.sin(state.time * 30) * 0.03 : 0);
  }
  function revealByEagle() { if (target.alive && target.pos.distanceTo(player.pos) < 50) { state.targetKnown = true; } }

  // ---------- التحديث ----------
  function update(dt, rdt) {
    state.time += dt;
    if (state.slowT > 0) { state.slowT -= rdt; if (state.slowT <= 0) state.timeScale = 1; }
    if (state.monoT > 0) { state.monoT -= rdt; canvas.classList.toggle('mono', state.monoT > 0); }
    if (state.eagleT > 0) { state.eagleT -= rdt; canvas.classList.toggle('eagle', state.eagleT > 0); }
    const play = state.phase === 'play';
    if (play) { stats.time += rdt; updatePlayer(dt); updatePlayerStatus(); }
    updateTarget(dt);
    for (const g of guards) updateGuard(g, dt);
    for (const c of civs) updateCiv(c, dt);
    updateArrows(dt);
    separate();
    // الجثة المحمولة
    if (player.carrying) { const a = player.carrying.actor; a.pos.set(player.pos.x - Math.sin(player.yaw) * 0.05, player.pos.y + 1.35, player.pos.z - Math.cos(player.yaw) * 0.05); a.yaw = a.yawTo = player.yaw + Math.PI / 2; }
    player.sync(dt); target.sync(dt);
    for (const g of guards) g.sync(dt); for (const c of civs) c.sync(dt);
    for (const b of bodies) if (b.actor !== target && !guards.includes(b.actor)) b.actor.sync(dt);
    if (!play) return;
    const p = player;
    state.alertN = guards.reduce((n, g) => n + (g.alive && g.state === 'alert' ? 1 : 0), 0);
    if (state.alertN) state.calmT = 0; else { state.calmT += dt; attackers = 0; }
    if (p.alive && p.hp < p.maxHp && state.calmT > 4) { p.regenT += dt; if (p.regenT > 0.5) { p.hp = Math.min(p.maxHp, p.hp + 4); p.regenT = 0; } }
    state.ambientT -= dt;
    if (state.ambientT <= 0) { state.ambientT = 6 + Math.random() * 4; const near = civs.filter(c => !c.bark && c.mode !== 'flee' && c.pos.distanceTo(p.pos) < 9); if (near.length) pick(near).say(pick(BARK.civ), 3.4); }
    if (state.objective === 'escape' && p.alive && Math.hypot(p.pos.x - SAFE.x, p.pos.z - SAFE.z) < 1.4 && p.pos.y < 0.5 && !state.endKind) {
      if (!state.alertN) { state.endKind = 'win'; state.endT = 0.4; sfx('win'); }
      else if (state.doorWarnT <= 0) { banner('فيه عسكر وراك!', 'ضيّعهم الأول قبل ما تدخل البيت'); state.doorWarnT = 4; }
    }
    if (state.doorWarnT > 0) state.doorWarnT -= dt;
    if (state.endKind) { state.endT -= rdt; if (state.endT <= 0) endGame(state.endKind); }
  }

  // ---------- الكاميرا ----------
  const ray = new THREE.Raycaster();
  function updateCamera(dt) {
    const p = player, play = state.phase === 'play' || state.phase === 'paused' || state.phase === 'end';
    if (!play) {
      const t = state.time * 0.04;
      camera.position.set(Math.cos(t) * 46, 26, Math.sin(t) * 46); camera.lookAt(0, 3, 0);
      return;
    }
    if (!isTouch && !document.pointerLockElement) { if (keys.KeyQ && false) { } }
    if (keys.ArrowLeft && !keys.KeyA) { }
    const c = state.cine;
    const tgt = new V3(p.pos.x, p.pos.y + 1.55, p.pos.z);
    let desired;
    if (c && c.kind === 'sync') {
      const a = cam.yaw + c.t * 1.6;
      desired = new V3(p.pos.x + Math.sin(a) * 9, p.pos.y + 4, p.pos.z + Math.cos(a) * 9);
      if (c.t >= c.dur) { state.cine = null; cam.yaw = a + Math.PI; }
      else c.t += dt;
    } else if (c && (c.kind === 'kill' || c.kind === 'finisher' || c.kind === 'air')) {
      const e = c.e, mid = new V3((p.pos.x + e.pos.x) / 2, (p.pos.y + e.pos.y) / 2 + 1.2, (p.pos.z + e.pos.z) / 2);
      const ang = Math.atan2(e.pos.x - p.pos.x, e.pos.z - p.pos.z) + Math.PI / 2 + 0.5;
      desired = new V3(mid.x + Math.sin(ang) * 3.2, mid.y + 0.7, mid.z + Math.cos(ang) * 3.2);
      tgt.copy(mid);
    } else {
      const combat = state.alertN > 0 && guards.some(g => g.alive && g.inCombat);
      const dist = combat ? 5.4 : p.state === 'climb' ? 5 : 4.2;
      cam.dist = damp(cam.dist, dist, 4, dt);
      const f = camFwd(), right = new V3(-f.z, 0, f.x);
      const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
      desired = new V3(tgt.x - f.x * cam.dist * cp, tgt.y + cam.dist * sp + 0.3, tgt.z - f.z * cam.dist * cp).addScaledVector(right, isTouch ? 0 : 0.55);
      tgt.addScaledVector(right, isTouch ? 0 : 0.55);
      // منع الكاميرا من دخول الحيطان
      const dir = desired.clone().sub(tgt), len = dir.length(); dir.normalize();
      ray.set(tgt, dir); ray.far = len;
      const hits = ray.intersectObjects(camBlockers, false);
      if (hits.length) desired = tgt.clone().addScaledVector(dir, Math.max(0.6, hits[0].distance - 0.25));
    }
    const k = c ? 6 : 14;
    camera.position.x = damp(camera.position.x, desired.x, k, dt); camera.position.y = damp(camera.position.y, desired.y, k, dt); camera.position.z = damp(camera.position.z, desired.z, k, dt);
    cam.look.lerp(tgt, 1 - Math.exp(-(c ? 6 : 18) * dt));
    camera.lookAt(cam.look);
    if (state.shake > 0) { state.shake = Math.max(0, state.shake - dt * 1.5); camera.position.x += (Math.random() - 0.5) * state.shake * 0.3; camera.position.y += (Math.random() - 0.5) * state.shake * 0.3; }
    if (!isTouch && keys.ArrowLeft) cam.yaw += dt * 2; if (!isTouch && keys.ArrowRight) cam.yaw -= dt * 2;
  }

  // ---------- الواجهة ----------
  const promptEl = $('prompt'), objEl = $('objective'), hpFill = $('hp-fill'), stamEl = $('stam'), statusEl = $('status'), actBtn = $('b-action');
  const hudCache = {};
  const setT = (el, k, v) => { if (hudCache[k] !== v) { hudCache[k] = v; el.textContent = v; } };
  function updateHUD(force) {
    if (force) for (const k in hudCache) delete hudCache[k];
    const p = player; if (!p) return;
    const hpw = Math.round(p.hp / p.maxHp * 100) + '%'; if (hudCache.hp !== hpw) { hudCache.hp = hpw; hpFill.style.width = hpw; }
    if (hudCache.st !== p.stam) { hudCache.st = p.stam; stamEl.innerHTML = '<i></i><i></i><i></i><i></i>'; [...stamEl.children].forEach((c, i) => c.classList.toggle('off', i >= p.stam)); }
    let st = 'مجهول', lv = 'calm';
    if (state.alertN) { st = 'مكشوف'; lv = 'alert'; }
    else if (p.hidden) { st = 'مستخبي'; lv = 'hidden'; }
    else if (p.blend) { st = 'وسط الناس'; lv = 'hidden'; }
    else if (guards.some(g => g.alive && (g.state === 'search' || g.state === 'suspicious'))) { st = 'مشتبه فيه'; lv = 'sus'; }
    setT(statusEl, 'stt', st); if (hudCache.lv !== lv) { hudCache.lv = lv; statusEl.dataset.level = lv; }
    let o;
    if (state.objective === 'escape') o = 'اهرب للبيت الآمن (العلامة الخضرا) — لازم ماحدش يكون وراك';
    else if (target.alive && target.state === 'flee') o = 'حسن آغا بيهرب على باب القلعة! الحقه';
    else if (state.targetKnown) o = 'اغتال حسن آغا — بيلم الإتاوات في سوق خان الخليلي';
    else o = 'اغتال حسن آغا — اطلع مئذنة الأزهر تكشف مكانه، أو دوّر عليه في السوق';
    setT(objEl, 'obj', o);
    const c = state.context;
    const label = c ? CTX_LABEL[c.type] : '';
    setT(promptEl.querySelector('span'), 'pr', label);
    const vis = c ? '1' : '0'; if (hudCache.pv !== vis) { hudCache.pv = vis; promptEl.classList.toggle('show', !!c); actBtn.classList.toggle('ready', !!c); }
    setT(actBtn.querySelector('span'), 'ab', label || 'فعل');
    const ec = state.eagleT > 0; if (hudCache.ec !== ec) { hudCache.ec = ec; $('b-eagle').classList.toggle('on', ec); }
    const jl = p.state === 'sync' ? 'قفزة' : 'نط'; setT($('b-jump').querySelector('span'), 'jl', jl);
  }
  const tmpV = new V3();
  function project(x, y, z) { tmpV.set(x, y, z).project(camera); if (tmpV.z > 1) return null; return [(tmpV.x + 1) / 2 * innerWidth, (1 - tmpV.y) / 2 * innerHeight]; }
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function drawHUD() {
    const g = hctx, W = innerWidth, Hh = innerHeight;
    g.setTransform(hudDpr, 0, 0, hudDpr, 0, 0); g.clearRect(0, 0, W, Hh);
    if (state.phase !== 'play') return;
    const p = player; g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const eagle = state.eagleT > 0;
    // مؤشرات الحراس
    for (const e of guards) {
      if (!e.alive) continue;
      const d = e.pos.distanceTo(p.pos); if (d > 45) continue;
      const s = project(e.pos.x, e.pos.y + 2.25, e.pos.z); if (!s) continue;
      if (eagle) { g.fillStyle = 'rgba(230,50,40,.9)'; g.beginPath(); g.moveTo(s[0], s[1] - 8); g.lineTo(s[0] + 6, s[1]); g.lineTo(s[0], s[1] + 8); g.lineTo(s[0] - 6, s[1]); g.fill(); }
      if (e.state === 'alert' && e.inCombat && d < 16) {
        const w = 56; g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(s[0] - w / 2, s[1] - 18, w, 5); g.fillStyle = '#d23a2a'; g.fillRect(s[0] - w / 2, s[1] - 18, w * Math.max(0, e.hp) / e.maxHp, 5);
        g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(s[0] - w / 2, s[1] - 11, w, 3); g.fillStyle = e.stunT > 0 ? '#fff' : '#f0c040'; g.fillRect(s[0] - w / 2, s[1] - 11, w * (e.stunT > 0 ? 1 : e.stun / e.maxHp), 3);
        if (e.atk.phase === 'windup') { g.fillStyle = e.atk.heavy ? '#ff3b2f' : '#ffb340'; g.beginPath(); g.arc(s[0], s[1] - 30, 7, 0, TAU); g.fill(); g.fillStyle = '#1b120a'; g.font = '800 11px Cairo, sans-serif'; g.fillText('!', s[0], s[1] - 29); }
        if (e.stunT > 0) { g.fillStyle = '#fff'; g.font = '800 12px Cairo, sans-serif'; g.fillText('مترنّح', s[0], s[1] - 30); }
      } else if (e.state === 'alert') { g.fillStyle = '#c0392b'; g.beginPath(); g.arc(s[0], s[1] - 8, 9, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.font = '800 13px Cairo, sans-serif'; g.fillText('!', s[0], s[1] - 7); }
      else if (e.sus > 0.02 || e.state === 'search' || e.state === 'suspicious') {
        const f = e.state === 'search' ? 1 : e.sus;
        g.fillStyle = 'rgba(20,12,6,.65)'; g.beginPath(); g.arc(s[0], s[1] - 8, 10, 0, TAU); g.fill();
        g.strokeStyle = f > 0.6 ? '#e8833a' : '#f3e3c0'; g.lineWidth = 3; g.beginPath(); g.arc(s[0], s[1] - 8, 7.5, -Math.PI / 2, -Math.PI / 2 + TAU * f); g.stroke();
      }
    }
    // علامات
    const marks = [];
    if (target.alive && (state.targetKnown || eagle)) marks.push({ x: target.pos.x, y: target.pos.y + 2.5, z: target.pos.z, c: '#ffd54f', big: true });
    if (state.objective === 'escape') marks.push({ x: SAFE.x, y: 2.5, z: SAFE.z, c: '#7fb069' });
    if (!state.synced) marks.push({ x: MIN.cx, y: 28.5, z: MIN.cz, c: 'rgba(224,169,74,.8)' });
    for (const m of marks) {
      const s = project(m.x, m.y, m.z); if (!s || s[0] < 0 || s[0] > W || s[1] < 0 || s[1] > Hh) continue;
      const b = Math.sin(state.time * 5) * 3; g.fillStyle = m.c;
      g.beginPath(); g.moveTo(s[0], s[1] + 9 + b); g.lineTo(s[0] - (m.big ? 8 : 6), s[1] - 4 + b); g.lineTo(s[0] + (m.big ? 8 : 6), s[1] - 4 + b); g.fill();
      const dm = Math.round(Math.hypot(m.x - p.pos.x, m.z - p.pos.z));
      g.fillStyle = '#f3e3c0'; g.font = '700 11px Cairo, sans-serif'; g.fillText(toAr(dm) + ' م', s[0], s[1] - 14 + b);
    }
    if (eagle) for (const h of HAY) { const s = project(h.x, 1.4, h.z); if (s && h.mesh.position.distanceTo(p.pos) < 40) { g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 1.5; g.strokeRect(s[0] - 9, s[1] - 9, 18, 18); } }
    // الكلام
    g.font = '600 13px Cairo, sans-serif';
    for (const e of [target, ...guards, ...civs]) {
      if (!e.bark || !e.alive || e.pos.distanceTo(p.pos) > 24) continue;
      const s = project(e.pos.x, e.pos.y + 2.55, e.pos.z); if (!s) continue;
      const w = g.measureText(e.bark.text).width + 16; g.globalAlpha = clamp(e.bark.t * 2, 0, 1);
      g.fillStyle = e.kind === 'guard' ? 'rgba(70,16,12,.85)' : e.kind === 'target' ? 'rgba(25,55,35,.9)' : 'rgba(22,14,8,.8)';
      rr(g, s[0] - w / 2, s[1] - 12, w, 24, 9); g.fill(); g.fillStyle = '#fbeed2'; g.fillText(e.bark.text, s[0], s[1] + 1); g.globalAlpha = 1;
    }
    // البوصلة
    const cw = Math.min(380, W - 140), cx = W / 2, cy = isTouch ? 64 : 22;
    g.fillStyle = 'rgba(15,9,4,.55)'; rr(g, cx - cw / 2, cy - 11, cw, 22, 11); g.fill();
    const span = Math.PI * 0.9;
    const cards = [['ج', 0], ['ش', Math.PI], ['ق', -Math.PI / 2], ['غ', Math.PI / 2]];
    g.save(); g.beginPath(); g.rect(cx - cw / 2, cy - 12, cw, 24); g.clip();
    for (let a = 0; a < TAU; a += Math.PI / 12) { const d = angDiff(cam.yaw, a); if (Math.abs(d) > span / 2) continue; const x = cx - d / span * cw; g.fillStyle = 'rgba(243,227,192,.35)'; g.fillRect(x - 0.5, cy - 4, 1, 8); }
    g.font = '800 12px Cairo, sans-serif';
    for (const [l, a] of cards) { const d = angDiff(cam.yaw, a); if (Math.abs(d) > span / 2) continue; g.fillStyle = '#f3e3c0'; g.fillText(l, cx - d / span * cw, cy + 1); }
    const cm = (x, z, c, r) => { const a = Math.atan2(x - p.pos.x, z - p.pos.z), d = angDiff(cam.yaw, a); const px = cx - clamp(d / span, -0.5, 0.5) * cw; g.fillStyle = c; g.beginPath(); g.arc(px, cy, r, 0, TAU); g.fill(); };
    for (const e of guards) if (e.alive && e.state === 'alert') cm(e.pos.x, e.pos.z, '#e53935', 3);
    for (const m of marks) cm(m.x, m.z, m.c, 5);
    g.restore();
    if (p.hurtT > 0) { g.fillStyle = `rgba(160,20,10,${p.hurtT * 0.45})`; g.fillRect(0, 0, W, Hh); }
    if (p.hp < 35 && p.alive) { const r = g.createRadialGradient(W / 2, Hh / 2, Math.min(W, Hh) * 0.3, W / 2, Hh / 2, Math.max(W, Hh) * 0.7); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, `rgba(150,15,10,${0.3 + Math.sin(state.time * 4) * 0.1})`); g.fillStyle = r; g.fillRect(0, 0, W, Hh); }
  }
  let bannerT = null;
  function banner(t, s) { const b = $('banner'); b.querySelector('b').textContent = t; b.querySelector('span').textContent = s || ''; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); clearTimeout(bannerT); bannerT = setTimeout(() => b.classList.remove('show'), 2800); }
  let subT = null; function subtitle(t, sec) { const el = $('subtitle'); el.textContent = t; el.classList.add('show'); clearTimeout(subT); subT = setTimeout(() => el.classList.remove('show'), sec * 1000); }
  function toast(t) { banner(t, ''); }
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
  function renderStory() { $('story-title').textContent = STORY[storyI][0]; $('story-text').textContent = STORY[storyI][1]; $('story-dots').innerHTML = STORY.map((_, i) => `<i class="${i === storyI ? 'on' : ''}"></i>`).join(''); $('story-next').textContent = storyI === STORY.length - 1 ? 'يلا' : 'التالي'; }
  function startPlay() {
    newGame(); state.phase = 'play'; showScreen(null);
    $('hud').classList.remove('hidden'); document.body.classList.toggle('touch', isTouch);
    camera.position.set(player.pos.x, 4, player.pos.z - 5); cam.look.set(player.pos.x, 1.5, player.pos.z);
    banner('القاهرة', 'ربيع ١٨٠٥');
  }
  function endGame(kind) {
    if (state.phase !== 'play') return;
    state.phase = 'end'; $('hud').classList.add('hidden'); if (document.exitPointerLock) document.exitPointerLock();
    canvas.classList.remove('mono', 'eagle');
    const e = $('screen-end'), mins = Math.floor(stats.time / 60), secs = Math.floor(stats.time % 60), time = toAr(mins) + ':' + toAr(String(secs).padStart(2, '0'));
    let title, text, extra = '';
    if (kind === 'win') {
      const rank = stats.detections === 0 ? 'شبح القاهرة' : stats.detections <= 2 ? 'ظل الحارة' : 'عاصفة الصحرا';
      title = 'تمت المهمة'; text = 'حسن آغا مات، ودكاكين خان الخليلي مش هتدفع إتاوة تاني… على الأقل لحد ما الباشا يبعت غيره.';
      extra = `<div class="stats"><div><b>${time}</b><span>الوقت</span></div><div><b>${toAr(stats.detections)}</b><span>مرات انكشفت</span></div><div><b>${toAr(stats.kills)}</b><span>حراس</span></div><div><b>${rank}</b><span>لقبك</span></div></div>
      <p class="teaser">بعد أيام، المشايخ خلعوا خورشيد باشا، وقعد محمد علي على كرسي الولاية باسم الشعب. بس جت رسالة للرابطة من الأزهر: «الألباني بيجمع المماليك في القلعة… وناوي على حاجة كبيرة.»<br><b>يتبع: القلعة ١٨١١</b></p>`;
    } else if (kind === 'dead') { title = 'فقدت المزامنة'; text = 'يوسف وقع في إيد الإنكشارية… والذكرى دي ماحصلتش كده. جرّب تاني: صد الضربة البرتقالي، واتفادى الحمرا.'; }
    else { title = 'الهدف هرب'; text = 'حسن آغا وصل باب القلعة واتحصّن جوه. المرة الجاية خليك بعيد عن عينه.'; }
    e.querySelector('h2').textContent = title; e.querySelector('.end-text').textContent = text; e.querySelector('.end-extra').innerHTML = extra; e.dataset.kind = kind;
    showScreen('screen-end');
  }
  function togglePause(force) {
    if (state.phase === 'play') { state.phase = 'paused'; showScreen('screen-pause'); if (document.exitPointerLock) document.exitPointerLock(); }
    else if (state.phase === 'paused' && force !== true) { state.phase = 'play'; showScreen(null); }
  }
  function toggleMute() { Sound.setMuted(!Sound.muted); document.body.classList.toggle('muted', Sound.muted); }
  const tap = (id, fn) => $(id).addEventListener('click', e => { e.preventDefault(); Sound.init(); fn(); });
  tap('btn-start', () => { storyI = 0; renderStory(); showScreen('screen-story'); state.phase = 'story'; });
  tap('story-next', () => { if (storyI < STORY.length - 1) { storyI++; renderStory(); } else { showScreen('screen-brief'); state.phase = 'brief'; } });
  tap('story-skip', () => { showScreen('screen-brief'); state.phase = 'brief'; });
  tap('btn-go', startPlay); tap('btn-resume', () => togglePause()); tap('btn-restart', startPlay); tap('btn-retry', startPlay);
  tap('btn-menu', () => { state.phase = 'title'; $('hud').classList.add('hidden'); newGame(); showScreen('screen-title'); });
  tap('btn-pause', () => togglePause()); tap('btn-sound', toggleMute); tap('btn-sound2', toggleMute);
  document.body.classList.toggle('touch', isTouch);

  // ---------- الحلقة ----------
  resize();
  newGame();
  let last = performance.now(), hudT = 0;
  function frame(now) {
    const rdt = Math.min(0.05, (now - last) / 1000); last = now;
    if (state.phase !== 'paused' && state.phase !== 'end') {
      const dt = rdt * state.timeScale;
      update(dt, rdt);
      if (state.phase === 'play') state.context = computeContext();
    }
    updateCamera(rdt);
    sky.position.copy(camera.position);
    const fp = state.phase === 'title' || state.phase === 'story' || state.phase === 'brief' ? new V3(0, 0, 0) : player.pos;
    sun.position.set(fp.x + sunDir.x * 70, fp.y + sunDir.y * 70, fp.z + sunDir.z * 70); sun.target.position.copy(fp);
    safeRing.material.opacity = 0.5 + Math.sin(state.time * 4) * 0.3;
    renderer.render(scene, camera);
    drawHUD();
    hudT -= rdt; if (state.phase === 'play' && hudT <= 0) { updateHUD(); hudT = 0.08; }
    Sound.update(state.phase === 'play' && state.alertN > 0);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__cairo3d = { state, get player() { return player; }, get target() { return target; }, get guards() { return guards; }, get civs() { return civs; }, cam, camera, startPlay, input, killEnemy, setAlert, keys,
    step(n, dt = 1 / 60) { for (let i = 0; i < n; i++) { update(dt * state.timeScale, dt); state.context = computeContext(); updateCamera(dt); } } };
})();
