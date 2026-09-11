/* ═══════════════════════════════════════════════════════════════════════════
   UNE SEULE PAGE — pour que la musique ne s'arrête jamais (11 septembre 2026)

   Mickaël : « fais comme dans Reaper : en passant d'une page à l'autre, ça doit
   donner l'impression d'une seule et même musique, donc ça ne peut pas sauter.
   Et du coup ce sera peut-être même plus léger. »

   ★ LE PRINCIPE, ET POURQUOI ÇA MARCHE

   Jusqu'ici, toucher un lien tuait la page : le son mourait avec elle, et la
   page suivante devait tout reconstruire — le style, les images, le lecteur.
   D'où le saut, et d'où la lenteur.

   Maintenant, la page ne meurt plus. On va CHERCHER le contenu de la page
   demandée, et on remplace seulement ce qui change à l'intérieur. Le lecteur de
   musique, lui, n'est jamais touché : il continue de jouer, sans même savoir
   qu'on a changé de pièce. C'est exactement la méthode de Reaper — on ne
   recharge pas la table de mixage à chaque morceau.

   ★ CE QUI EST REMPLACÉ, ET CE QUI RESTE

   Remplacé : le contenu (tout ce qui suit la barre), le titre de l'onglet,
   l'adresse. Gardé : la barre du haut, la barre du bas, le menu, LE SON.

   ★ LES TROIS PRUDENCES

   1. Une page qui a ses propres scripts (l'atelier, le livre, le guide, la
      porte, le prénom) NE PASSE PAS par ici : on la charge normalement. Ces
      pages sont des mondes à part, et tenter de les coudre ici casserait tout.
   2. Le bouton « retour » du téléphone continue de marcher : chaque passage
      est inscrit dans l'historique.
   3. Si quoi que ce soit échoue — pas de réseau, page inattendue — on retombe
      sur le chargement normal. On ne reste jamais coincé.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  /* les pages qui gardent leur propre vie : on ne les coud pas */
  const APART = /KARAOKE|LIVRE|TUTORIEL|PORTE|PRENOM|index\.html|installer|diagnostic|fiche-technique|BIENVENUE/i;

  const estCousable = href => {
    try {
      const u = new URL(href, location.href);
      if (u.origin !== location.origin) return false;
      if (APART.test(decodeURIComponent(u.pathname))) return false;
      return /\.html$/i.test(u.pathname) || u.pathname.endsWith('/');
    } catch(e){ return false; }
  };
  /* on ne se coud que DEPUIS une page cousable : sinon on ne sait pas quoi remplacer */
  if (!estCousable(location.href)) return;

  const zone = () => document.querySelector('main') || document.body;

  /* un voile d'or très bref, le temps du remplacement : on voit qu'il se passe
     quelque chose, mais on n'attend jamais devant une page blanche */
  const style = document.createElement('style');
  style.textContent = `
    .enRoute{ position:fixed; left:0; right:0; top:0; height:2px; z-index:200;
      background:linear-gradient(90deg,#c9a13a,#f1d27a,#c9a13a);
      transform:scaleX(0); transform-origin:left; transition:transform .5s ease; }
    .enRoute.part{ transform:scaleX(.7); }
    .enRoute.fini{ transform:scaleX(1); opacity:0; transition:transform .2s, opacity .4s .2s; }
    .pageArrive{ animation:pageArrive .45s ease both; }
    @keyframes pageArrive{ from{ opacity:0; transform:translateY(10px) } to{ opacity:1; transform:none } }`;
  document.head.appendChild(style);
  const fil = document.createElement('div'); fil.className = 'enRoute';
  document.body.appendChild(fil);

  let enCours = null;
  /* le lecteur de musique demande : « est-ce que tu t'en occupes ? » Si oui, il
     ne descend pas le son : il n'y a pas de départ, donc rien à adoucir. */
  window.__pageUnique = href => estCousable(href);

  async function aller(href, viaHistorique){
    if (enCours) return;
    enCours = href;
    fil.className = 'enRoute part';
    try {
      const r = await fetch(href, { credentials:'same-origin' });
      if (!r.ok) throw new Error('réponse ' + r.status);
      const texte = await r.text();
      const neuve = new DOMParser().parseFromString(texte, 'text/html');

      /* ce qu'on garde de la page d'arrivée : son contenu et son titre */
      const corpsNeuf = neuve.querySelector('main') || neuve.body;
      if (!corpsNeuf) throw new Error('page sans contenu');

      /* on retire ce que le script commun fabrique : il est déjà là, vivant */
      corpsNeuf.querySelectorAll('.nav, .voile, .bas, footer, .musique, .mot, .vScene').forEach(e => e.remove());

      /* les styles propres à la nouvelle page, qui n'existent pas encore ici */
      neuve.querySelectorAll('head style, head link[rel="stylesheet"]').forEach(e => {
        const clef = e.outerHTML.slice(0, 140);
        if (![...document.head.children].some(x => x.outerHTML.slice(0, 140) === clef))
          document.head.appendChild(e.cloneNode(true));
      });

      /* le remplacement lui-même */
      const ici = zone();
      const garde = [...ici.children].filter(e =>
        e.classList && (e.classList.contains('nav') || e.classList.contains('voile')
          || e.classList.contains('bas') || e.classList.contains('musique')
          || e.classList.contains('enRoute') || e.classList.contains('mot')
          || e.tagName === 'FOOTER' || e.tagName === 'SCRIPT' || e.tagName === 'AUDIO'));
      [...ici.children].forEach(e => { if (!garde.includes(e)) e.remove(); });
      [...corpsNeuf.children].forEach(e => {
        if (e.tagName === 'SCRIPT') return;            /* on ne rejoue pas les scripts */
        ici.appendChild(document.importNode(e, true));
      });

      document.title = neuve.title || document.title;
      document.body.className = neuve.body.className || '';
      if (!viaHistorique) history.pushState({ cousu:1 }, '', href);

      /* la page d'arrivée doit revivre : images, apparitions, boutons */
      window.scrollTo(0, 0);
      ici.classList.add('pageArrive');
      setTimeout(() => ici.classList.remove('pageArrive'), 500);
      if (typeof window.reveillerLaPage === 'function') window.reveillerLaPage();
      document.dispatchEvent(new CustomEvent('boheme-page-changee'));

      fil.className = 'enRoute fini';
      setTimeout(() => { fil.className = 'enRoute'; }, 700);
    } catch(e){
      /* on ne reste jamais coincé : au moindre doute, la vieille méthode */
      location.href = href;
    } finally { enCours = null; }
  }

  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a || a.target || a.hasAttribute('download')) return;
    const h = a.getAttribute('href') || '';
    if (/^(#|javascript:|mailto:|tel:)/.test(h)) return;
    if (!estCousable(a.href)) return;
    e.preventDefault(); e.stopPropagation();
    aller(a.href, false);
  }, true);

  addEventListener('popstate', () => {
    if (estCousable(location.href)) aller(location.href, true);
  });
})();
