/* L'ouvrier de service : il rend le site installable comme une application, et il ne met
   RIEN en cache — sauf LA MUSIQUE, quand on le lui a demandé (7 septembre 2026).
   Les pages arrivent donc toujours fraîches (chaque mise à jour est immédiate), et les
   deux bandes, une fois gardées sur l'appareil par le bouton « Musique », sont servies
   d'ici : plus aucun aller-retour vers le serveur à chaque saut dans le morceau, et la
   musique marche même sans réseau. */
const CACHE_MUSIQUE = 'boheme-musique-v1';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (!/\/media\/bande-[^/]+\.mp3$/.test(url.pathname)) return;      // tout le reste : le réseau, comme avant
  e.respondWith((async () => {
    const cache = await caches.open(CACHE_MUSIQUE);
    const entier = await cache.match(url.href);
    if (!entier) return fetch(e.request);                            // pas gardée : le réseau
    const blob = await entier.blob();
    const total = blob.size;
    const range = e.request.headers.get('range');
    if (!range) return new Response(blob, { status: 200, headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': String(total), 'Accept-Ranges': 'bytes' } });
    /* le lecteur demande un morceau : on le découpe dans le fichier gardé */
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    let a = m && m[1] ? parseInt(m[1], 10) : 0;
    let b = m && m[2] ? parseInt(m[2], 10) : total - 1;
    if (m && !m[1] && m[2]) { a = Math.max(0, total - parseInt(m[2], 10)); b = total - 1; }
    b = Math.min(b, total - 1);
    if (a > b) return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + total } });
    const part = blob.slice(a, b + 1);
    return new Response(part, { status: 206, headers: {
      'Content-Type': 'audio/mpeg', 'Content-Length': String(part.size),
      'Content-Range': 'bytes ' + a + '-' + b + '/' + total, 'Accept-Ranges': 'bytes' } });
  })());
});
