/* A31 Board — Service Worker
   Strategi:
   - App shell (HTML/manifest/ikon) di-precache → app terbuka instan & offline.
   - Firebase SDK & database di-handle jaringan (Firebase punya cache offline sendiri).
*/
const CACHE = 'a31-board-v4';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png',
  './favicon.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Jangan cache trafik Firebase (auth, realtime db, google apis) — biarkan ke jaringan.
  if (/gstatic\.com|googleapis\.com|firebaseio\.com|firebase\.com|identitytoolkit|google\.com/.test(url.hostname)) {
    return; // default: network
  }

  // HTML/navigasi: network-first supaya update aplikasi langsung diterapkan saat online,
  // fallback ke cache saat offline.
  const isHTML = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');
  if (isHTML && url.origin === self.location.origin) {
    e.respondWith(
      fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match(req).then(c => c || caches.match('./index.html')))
    );
    return;
  }

  // Aset lokal lain (ikon, manifest): cache-first + update di belakang layar.
  e.respondWith(
    caches.match(req).then((cached) => {
      const fetching = fetch(req).then((res) => {
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
      return cached || fetching;
    })
  );
});
