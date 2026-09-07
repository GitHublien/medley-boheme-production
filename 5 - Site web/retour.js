/* ═══════════════════════════════════════════════════════════════════════════
   LE RETOUR AU SITE (7 septembre 2026, demandé par Mickaël)
   Sur toutes les pages qui ne sont pas le hall — le karaoké, le livre des textes,
   la fiche technique — un bouton discret et toujours visible ramène à l'accueil,
   en gardant le prénom. Sur téléphone, il se met en bas à gauche, sous le pouce,
   au-dessus de tout le reste. Rien d'autre n'est touché.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  if (window.__retourBoheme) return; window.__retourBoheme = true;
  const ici = decodeURIComponent(location.pathname.split('/').pop() || '');
  /* le hall a sa navigation ; le karaoké a déjà son bouton « Le site » dans la barre,
     et un bouton flottant y masquerait les commandes de lecture */
  if (/^ACCUEIL|^MISE EN|^DOCUMENTS|^VID|^CALENDRIER|^NOUVEAUT|^INSTALLER|^site\.html$|^KARAOKE/i.test(ici)) return;
  if (document.getElementById('btnSite')) return;
  const pour = new URLSearchParams(location.search).get('pour');
  const a = document.createElement('a');
  a.id = 'retourSite';
  a.href = 'ACCUEIL — Bohème.html' + (pour ? '?pour=' + encodeURIComponent(pour) : '');
  a.innerHTML = '<span>⌂</span> Le site';
  a.title = 'Revenir à l\'accueil : textes, mise en scène, documents, vidéos';
  const css = document.createElement('style');
  css.textContent = `
    #retourSite{ position:fixed; z-index:2147483000; left:14px; top:calc(14px + env(safe-area-inset-top));
      display:inline-flex; align-items:center; gap:.5rem; padding:.5rem .95rem .5rem .8rem;
      border-radius:999px; border:1px solid rgba(212,175,55,.55); background:rgba(12,11,10,.82);
      color:#f2ede1; font:400 14px/1 'Outfit',system-ui,sans-serif; letter-spacing:.02em;
      text-decoration:none; backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);
      box-shadow:0 10px 34px rgba(0,0,0,.55); transition:transform .5s cubic-bezier(.32,.72,0,1), background .5s; }
    #retourSite span{ color:#d4af37; font-size:1.05em; }
    #retourSite:hover{ background:rgba(212,175,55,.22); transform:translateX(2px); }
    #retourSite:active{ transform:scale(.97); }
    @media (max-width:700px) and (orientation:portrait){
      #retourSite{ top:auto; bottom:calc(14px + env(safe-area-inset-bottom)); left:14px; padding:.6rem 1.05rem .6rem .9rem; font-size:15px; }
    }
    @media (max-height:520px) and (orientation:landscape){
      #retourSite{ top:auto; bottom:10px; left:10px; padding:.4rem .8rem; font-size:12.5px; }
    }
    @media print{ #retourSite{ display:none } }`;
  const poser = () => {
    if (!document.body) return setTimeout(poser, 100);
    document.head.appendChild(css); document.body.appendChild(a);
  };
  poser();
})();
