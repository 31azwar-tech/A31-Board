/* A31 Board — service worker
   Tugas: (1) cache shell agar bisa offline, (2) sinkron lencana ikon,
   (3) tangani klik notifikasi deadline. */

const CACHE = 'a31-board-v2';
const SHELL = ['./', './index.html'];

self.addEventListener('install', (e)=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));
});

self.addEventListener('activate', (e)=>{
  e.waitUntil((async ()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

/* Network-first untuk HTML, cache-first untuk sisanya (offline-friendly). */
self.addEventListener('fetch', (e)=>{
  const req=e.request;
  if(req.method!=='GET') return;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(r=>r||fetch(req)).catch(()=>caches.match('./index.html')));
});

/* Pesan dari halaman: perbarui angka lencana ikon aplikasi. */
self.addEventListener('message', (e)=>{
  const d=e.data||{};
  if(d.type==='badge' && 'setAppBadge' in self.navigator){
    if(d.count>0) self.navigator.setAppBadge(d.count).catch(()=>{});
    else          self.navigator.clearAppBadge().catch(()=>{});
  }
});

/* Klik notifikasi → fokuskan/ buka app. */
self.addEventListener('notificationclick', (e)=>{
  e.notification.close();
  const url=(e.notification.data && e.notification.data.url) || './';
  e.waitUntil((async ()=>{
    const all=await self.clients.matchAll({type:'window', includeUncontrolled:true});
    for(const c of all){ if('focus' in c){ await c.focus(); return; } }
    if(self.clients.openWindow) await self.clients.openWindow(url);
  })());
});
