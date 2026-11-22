// Max Motors PWA service worker: app shell precache, network-first data, cache-first images
const V = 'mm-v1';
const SHELL = ['./', 'index.html', 'styles.css', 'app.js', 'config.js', 'manifest.webmanifest', 'icons/logo.png', 'icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isImg = url.pathname.includes('/img/') || url.hostname.includes('gstatic');
  if (isImg) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(req, cp)); return res; })));
    return;
  }
  e.respondWith(fetch(req).then(res => { if (res.ok && (url.origin === location.origin || url.hostname.includes('googleapis'))) { const cp = res.clone(); caches.open(V).then(c => c.put(req, cp)); } return res; }).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
});
