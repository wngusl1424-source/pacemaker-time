// 오디션 노트 화면 파일만 저장해 두고, 인터넷이 될 땐 항상 새 화면을 받아요. 기록은 여기 저장하지 않아요.
const V = 'an-app-v3';
const ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('an-app-') && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const nav = req.mode === 'navigate';
  const key = nav ? 'index.html' : req;
  e.respondWith(fetch(req, { cache: 'no-cache' }).then(r => {
    if (r && r.ok) { const cp = r.clone(); caches.open(V).then(c => c.put(key, cp)); }
    return r;
  }).catch(() => caches.open(V).then(c => c.match(key))));
});
