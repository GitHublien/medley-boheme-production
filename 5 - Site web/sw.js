/* L'ouvrier de service minimal : sa seule mission est de rendre le
   site installable comme une application. Il ne met RIEN en cache :
   chaque mise à jour du site arrive donc immédiatement. */
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => { e.waitUntil((async () => { try { await caches.delete('boheme-musique-v1'); } catch(err){} await self.clients.claim(); })()); });
self.addEventListener('fetch', () => {});
