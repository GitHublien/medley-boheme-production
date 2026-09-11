/* ═══════════════════════════════════════════════════════════════════════════
   LE RETOUR AU SITE (7 septembre 2026, demandé par Mickaël)
   Sur toutes les pages qui ne sont pas le hall — l’atelier, le livre des textes,
   la fiche technique — un bouton discret et toujours visible ramène à l'accueil,
   en gardant le prénom. Sur téléphone, il se met en bas à gauche, sous le pouce,
   au-dessus de tout le reste. Rien d'autre n'est touché.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  if (window.__retourBoheme) return; window.__retourBoheme = true;
  const ici = decodeURIComponent(location.pathname.split('/').pop() || '');
  /* le hall a sa navigation ; l’atelier a déjà son bouton « Le site » dans la barre,
     et un bouton flottant y masquerait les commandes de lecture.

     ⚠️ 10 septembre — LE TUTORIEL EST EXCLU LUI AUSSI. Il recouvrait « ← Précédent »
     et rendait le bouton inutilisable au doigt. Plutôt que de lui chercher une place
     dans un écran déjà plein, Mickaël a tranché : « je me demande si on devrait le
     garder, je pense qu'il ne sert à rien — on a la possibilité d'aller à l'atelier,
     et à l'atelier il y a le logo qui permet d'aller sur le site. » C'est juste : la
     salle d'entraînement porte « ✕ Aller à l'atelier » dans son en-tête, toujours
     visible. On ne s'y enferme donc jamais, et plus rien ne recouvre rien.
     NE PAS le remettre ici. */
  if (/^ACCUEIL|^MISE EN|^DOCUMENTS|^VID|^CALENDRIER|^NOUVEAUT|^INSTALLER|^site\.html$|^KARAOKE|^TUTORIEL|^BIENVENUE/i.test(ici)) return;
  if (document.getElementById('btnSite')) return;
  const pour = new URLSearchParams(location.search).get('pour');
  const a = document.createElement('a');
  a.id = 'retourSite';
  a.href = 'ACCUEIL — Bohème.html' + (pour ? '?pour=' + encodeURIComponent(pour) : '');
  /* 11 septembre 2026 — Mickaël : « le site, ce ne sont plus les maisons que je
     veux, ce sont les flèches. » Le vrai pictogramme d'or, comme partout. */
  a.innerHTML = '<span class="picRetour"></span> Le site';
  a.title = 'Revenir à l\'accueil : textes, mise en scène, documents, vidéos';
  const css = document.createElement('style');
  css.textContent = `
  #retourSite .picRetour{ display:inline-block; width:1.1em; height:1.1em;
    vertical-align:-.18em; background:center/contain no-repeat
    url(site-images/icones-karaoke/retour.png);
    filter:drop-shadow(0 0 5px rgba(212,175,55,.4)); }
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
    /* ⚠️ Les rendez-vous d'ABORD, le premier essai ENSUITE : si le premier appel
       échoue (page à moitié construite, commandes pas encore posées), les lignes
       qui le suivent ne s'exécutent jamais — et le bouton ne se range plus du tout.
       C'est ce qui s'est passé le 10 septembre : la logique était bonne, elle
       n'était simplement jamais rappelée. */
    addEventListener('resize', ranger, { passive:true });
    addEventListener('orientationchange', () => setTimeout(ranger, 150), { passive:true });
    /* les pages posent souvent leurs commandes après coup : on revérifie */
    [0, 400, 1200, 2500].forEach(t => setTimeout(ranger, t));
    if (document.readyState !== 'complete') addEventListener('load', () => setTimeout(ranger, 300));
  };
  const ranger = () => { try { seRanger(); } catch(e){} };

  /* ═══ IL NE DOIT RECOUVRIR AUCUN AUTRE BOUTON (10 septembre 2026) ═══
     Mesuré sur le tutoriel, en 390×844 : « Le site » se posait EXACTEMENT sur
     « ← Précédent » et, comme il est au premier plan, c'est lui qu'on touchait.
     Le bouton « Précédent » du guide était donc inutilisable sur téléphone.
     Mickaël : « il ne faut jamais qu'il y ait un bouton qui soit sur les autres. »
     Désormais il regarde ce qu'il y a sous lui, et il monte tant qu'il gêne. */
  function seRanger(){
    a.style.top = ''; a.style.bottom = ''; a.style.transform = '';
    const genants = [...document.querySelectorAll('a, button, .btn, [role="button"]')].filter(e => {
      if (e === a || a.contains(e)) return false;
      const st = getComputedStyle(e);
      if (st.display === 'none' || st.visibility === 'hidden' || +st.opacity < .05) return false;
      /* seuls comptent ceux qui flottent : le reste défile et ne gêne jamais */
      let p = e, fixe = false;
      for (let i = 0; i < 6 && p; i++, p = p.parentElement)
        if (getComputedStyle(p).position === 'fixed'){ fixe = true; break; }
      if (!fixe) return false;
      const r = e.getBoundingClientRect();
      return r.width > 10 && r.height > 10;
    });
    const chevauche = () => {
      const r = a.getBoundingClientRect();
      return genants.find(e => {
        const c = e.getBoundingClientRect();
        return !(r.right < c.left || r.left > c.right || r.bottom < c.top || r.top > c.bottom);
      });
    };
    let obstacle = chevauche(), tours = 0;
    while (obstacle && tours++ < 6){
      const c = obstacle.getBoundingClientRect();
      /* on se range juste AU-DESSUS de ce qui gêne, avec dix pixels de marge */
      a.style.top = 'auto';
      a.style.bottom = Math.round(innerHeight - c.top + 10) + 'px';
      obstacle = chevauche();
    }
  }
  poser();
})();
