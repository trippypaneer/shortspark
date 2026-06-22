const CACHE = 'shortspark-v1';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const net = fetch(e.request).then(r => {
        if (r.ok) {
          const cl = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, cl));
        }
        return r;
      }).catch(() => cached || new Response('Offline', { status: 503 }));
      return cached || net;
    })
  );
});
