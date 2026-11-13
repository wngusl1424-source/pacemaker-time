// 앱 화면 파일만 저장해 두고 바로 띄워요. 일정 데이터는 여기 저장하지 않아요.
const V = 'pm-time-v2';
const ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
async function tell(msg) { (await self.clients.matchAll({ type: 'window' })).forEach(c => c.postMessage(msg)); }
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const nav = req.mode === 'navigate';
  const key = nav ? 'index.html' : req;
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(key);
    const net = fetch(req, { cache: 'no-cache' }).then(async r => {
      if (r && r.ok) {
        if (nav && hit) {
          const [a, b] = await Promise.all([hit.clone().text(), r.clone().text()]);
          await c.put(key, r.clone());
          if (a !== b) tell({ type: 'pm-updated' });
        } else await c.put(key, r.clone());
      }
      return r;
    }).catch(() => hit);
    if (hit) { e.waitUntil(net); return hit; }
    return net;
  }));
});
