/* ═══════════════════════════════════════════════════════════════════════════
   LE NAVIGATEUR DE LA VISITE — pour tester arrêt par arrêt (12 septembre 2026)

   Mickaël, 17 h 20 : « je n'aime pas du tout le système de navigation. Refais-
   moi un vrai système qui m'aide vraiment, vraiment efficace. Je n'ai pas
   besoin des notes. L'aperçu, si, c'est important de l'avoir. »

   Ce qu'il y a :

     ☰  le SOMMAIRE : les 22 arrêts, numérotés et nommés, l'arrêt en cours
        surligné. On touche un nom, on y est, avec la voix. Sous la liste, le
        texte de la phrase en cours, en clair. Et les six prénoms : on change
        de personne en un appui, sans retaper d'adresse.
     ◀ ⏸ ▶  arrêt précédent, pause, arrêt suivant.
     ↻  rejouer cet arrêt.   ⓪  tout remettre à zéro (bouton rouge, visite
        jamais vue) et recharger, comme au premier jour.
     👁  voir comme les six : la visite entière, sans rien d'autre à l'écran.
        Pour revenir : appui long sur le logo Bohème.

   Ce fichier ne se charge QUE dans le mode essai (visite.js décide). Il n'y a
   plus de notes ni d'enregistrement de geste : l'ancien visite-essai.js reste
   sur le disque si un jour il en faut.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  if (!window.__visite) return;
  const V = window.__visite;

  const PRENOMS = { mickael:'Mickaël', bry:'Bry', adrien:'Adrien', elie:'Élie',
                    stephanie:'Stéphanie', candice:'Candice' };
  const VOIX_DE = { mickael:'Leda', bry:'Leda', adrien:'Leda', elie:'Leda',
                    stephanie:'Algenib', candice:'Algenib' };
  let qui = '';
  try { qui = (new URLSearchParams(location.search).get('pour')
            || localStorage.getItem('boheme-pour') || '').toLowerCase(); } catch(e){}

  const style = document.createElement('style');
  style.textContent = `
    /* ⚠️ LA REGLE (11 septembre) : une bande DURE, pleine largeur, trait d'or,
       jamais flottante, jamais devant les logos. Elle se pose au-dessus de la
       barre du bas (portrait) ou a droite de la colonne (paysage) : la position
       est mesuree sur l'ecran reel, a chaque rotation. */
    #vNavBarre{ position:fixed; z-index:200; left:0; right:0; bottom:0;
      display:flex; align-items:stretch; justify-content:center; gap:6px;
      padding:6px 8px; background:rgba(8,7,6,.97);
      border-top:1px solid rgba(212,175,55,.75);
      box-shadow:0 -1px 0 rgba(212,175,55,.25), 0 -10px 30px rgba(0,0,0,.5); }
    #vNavBarre[hidden], #vNav[hidden]{ display:none !important; }
    #vNavBarre button{ border-radius:12px; cursor:pointer; min-width:52px;
      border:1px solid rgba(212,175,55,.45); background:rgba(10,9,8,.96);
      color:#f1d27a; font:700 22px system-ui, sans-serif; padding:10px 12px;
      -webkit-tap-highlight-color:transparent; }
    #vNavBarre button:active{ background:rgba(212,175,55,.2); }
    #vNavBarre .ou{ flex:1; min-width:0; display:grid; align-content:center; gap:2px;
      background:rgba(10,9,8,.96); border:1px solid rgba(212,175,55,.45);
      border-radius:12px; padding:6px 10px; cursor:pointer; text-align:left;
      -webkit-tap-highlight-color:transparent; }
    #vNavBarre .ou b{ color:#f1d27a; font:700 15px system-ui, sans-serif; white-space:nowrap;
      overflow:hidden; text-overflow:ellipsis; }
    #vNavBarre .ou small{ color:#cbbf9c; font:600 11px system-ui, sans-serif; white-space:nowrap;
      overflow:hidden; text-overflow:ellipsis; }

    #vNav{ position:fixed; inset:0; z-index:210; background:rgba(4,4,4,.97);
      display:grid; grid-template-rows:auto auto 1fr auto auto; gap:10px;
      padding:calc(env(safe-area-inset-top) + 10px) 12px calc(env(safe-area-inset-bottom) + 10px);
      color:#f2ead6; font:400 14px/1.4 system-ui, sans-serif; }
    #vNav .tete{ display:flex; align-items:center; justify-content:space-between; gap:8px; }
    #vNav .tete h3{ margin:0; color:#f1d27a; font:700 17px system-ui; }
    #vNav .tete .voix{ color:#cbbf9c; font:600 12px system-ui; }
    #vNav .fermer{ border-radius:999px; border:1px solid rgba(212,175,55,.5);
      background:rgba(212,175,55,.1); color:#f1d27a; font:700 15px system-ui; padding:8px 14px; }
    #vNav .qui{ display:flex; flex-wrap:wrap; gap:6px; }
    #vNav .qui button{ border-radius:999px; padding:7px 12px; font:600 13px system-ui;
      border:1px solid rgba(212,175,55,.35); background:rgba(255,255,255,.04); color:#ddd5c2; }
    #vNav .qui button.la{ background:linear-gradient(180deg,#f4d97f,#c9a13a); color:#1a1408; border-color:transparent; }
    #vNav .liste{ overflow:auto; -webkit-overflow-scrolling:touch; display:grid; gap:4px;
      align-content:start; border-top:1px solid rgba(212,175,55,.2); border-bottom:1px solid rgba(212,175,55,.2);
      padding:6px 0; }
    #vNav .liste button{ display:flex; align-items:center; gap:10px; text-align:left; width:100%;
      border-radius:10px; padding:10px 12px; font:600 15px system-ui;
      border:1px solid transparent; background:rgba(255,255,255,.03); color:#e8e0cc;
      -webkit-tap-highlight-color:transparent; }
    #vNav .liste button i{ font-style:normal; color:#cbbf9c; min-width:2ch; text-align:right; }
    #vNav .liste button.la{ background:rgba(212,175,55,.16); border-color:rgba(212,175,55,.55); color:#f1d27a; }
    #vNav .texte{ max-height:26vh; overflow:auto; -webkit-overflow-scrolling:touch;
      background:rgba(255,255,255,.03); border:1px solid rgba(212,175,55,.25); border-radius:10px;
      padding:10px 12px; font:400 14px/1.5 system-ui; color:#ddd5c2;
      -webkit-user-select:text; user-select:text; }
    #vNav .texte:empty{ display:none; }
    #vNav .gestes{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
    #vNav .gestes button{ border-radius:12px; padding:12px 8px; font:700 14px system-ui;
      border:1px solid rgba(212,175,55,.45); background:rgba(10,9,8,.96); color:#f1d27a; }
    #vNav .gestes .zero{ border-color:rgba(255,120,120,.5); color:#ffd9d9; }
    @media (orientation:landscape){
      #vNav{ grid-template-columns:1fr 1fr; grid-template-rows:auto 1fr auto;
        grid-template-areas:"tete tete" "liste cote" "gestes gestes"; }
      #vNav .tete{ grid-area:tete; } #vNav .liste{ grid-area:liste; }
      #vNav .qui{ grid-area:cote; align-content:start; }
      #vNav .texte{ grid-area:cote; align-self:end; max-height:40vh; }
      #vNav .gestes{ grid-area:gestes; }
    }`;
  document.head.appendChild(style);

  /* ── la barre du bas ─────────────────────────────────────────────────── */
  const barre = document.createElement('div');
  barre.id = 'vNavBarre'; barre.className = 'visiteGarde';
  barre.innerHTML =
      '<button class="sommaire" title="Sommaire">☰</button>'
    + '<button class="prec" title="Arrêt précédent">◀</button>'
    + '<button class="pause" title="Pause">⏸</button>'
    + '<button class="suiv" title="Arrêt suivant">▶</button>'
    + '<div class="ou" role="button"><b>—</b><small>touche ☰ pour le sommaire</small></div>';
  document.body.appendChild(barre);

  /* la bande se range au-dessus de la barre du bas (debout) ou a droite de la
     colonne (couche) : on mesure, on ne suppose pas */
  function poserLaBande(){
    const bas = document.querySelector('.bas');
    const r = bas ? bas.getBoundingClientRect() : null;
    if (r && r.width > r.height){            /* debout : une barre en bas */
      barre.style.left = '0'; barre.style.right = '0';
      barre.style.bottom = Math.max(0, innerHeight - r.top) + 'px';
    } else if (r){                             /* couche : une colonne a gauche */
      barre.style.left = Math.round(r.right) + 'px'; barre.style.right = '0';
      barre.style.bottom = '0';
    } else { barre.style.left = '0'; barre.style.right = '0'; barre.style.bottom = '0'; }
  }
  poserLaBande();
  addEventListener('resize', () => setTimeout(poserLaBande, 350));
  [400, 1500, 4000].forEach(t => setTimeout(poserLaBande, t));

  /* ── le sommaire ─────────────────────────────────────────────────────── */
  const nav = document.createElement('div');
  nav.id = 'vNav'; nav.className = 'visiteGarde'; nav.hidden = true;
  nav.innerHTML =
      '<div class="tete"><div><h3>Sommaire de la visite</h3><div class="voix"></div></div>'
    +   '<button class="fermer">Fermer</button></div>'
    + '<div class="qui"></div>'
    + '<div class="liste"></div>'
    + '<div class="texte"></div>'
    + '<div class="gestes">'
    +   '<button class="rejouer">↻ Rejouer</button>'
    +   '<button class="apercu">👁 Comme les six</button>'
    +   '<button class="zero">⓪ À zéro</button>'
    + '</div>';
  document.body.appendChild(nav);

  const ou = barre.querySelector('.ou');
  const bPause = barre.querySelector('.pause');
  const liste = nav.querySelector('.liste');
  const texte = nav.querySelector('.texte');
  const voix = nav.querySelector('.voix');
  const quiZone = nav.querySelector('.qui');

  /* les six prénoms : un appui change de personne et recharge l'accueil */
  Object.keys(PRENOMS).forEach(k => {
    const b = document.createElement('button');
    b.textContent = PRENOMS[k]; if (k === qui) b.classList.add('la');
    b.addEventListener('click', () => {
      try { localStorage.setItem('boheme-pour', k); localStorage.setItem('boheme-visite-essai', '1'); } catch(e){}
      location.href = 'ACCUEIL — Bohème.html?pour=' + k + '&essai=1';
    });
    quiZone.appendChild(b);
  });
  voix.textContent = 'voix : ' + (VOIX_DE[qui] || 'Leda') + ' · pour ' + (PRENOMS[qui] || '?');

  /* la liste des arrêts, une fois */
  const total = V.ou().total;
  for (let k = 0; k < total; k++){
    const b = document.createElement('button');
    b.innerHTML = '<i>' + (k + 1) + '</i><span></span>';
    b.querySelector('span').textContent = (V.nom && V.nom(k)) || (V.cle && V.cle(k)) || ('Arrêt ' + (k + 1));
    b.addEventListener('click', () => { fermer(); V.allerA(k); rafraichir(); });
    liste.appendChild(b);
  }

  function texteDe(k){
    const t = window.TEXTES_VISITE || null; if (!t) return '';
    const cle = (V.cle && V.cle(k)) || '';
    return (t[cle] || '').replace(/\{prénom\}/g, PRENOMS[qui] || 'toi');
  }

  let dernier = -1;
  function rafraichir(){
    const e = V.ou();
    const enVisite = document.body.classList.contains('enVisite');
    ou.querySelector('b').textContent = enVisite ? (e.arret + 1) + ' / ' + e.total + ' · ' + e.nom : 'Visite non démarrée';
    ou.querySelector('small').textContent = enVisite ? 'touche ☰ pour le sommaire' : '▶ pour commencer, ☰ pour le sommaire';
    bPause.textContent = e.enPause ? '▶' : '⏸';
    if (e.arret !== dernier || !nav.hidden){
      dernier = e.arret;
      liste.querySelectorAll('button').forEach((b, i) => b.classList.toggle('la', enVisite && i === e.arret));
      texte.textContent = enVisite ? texteDe(e.arret) : '';
    }
  }
  setInterval(rafraichir, 400);

  function ouvrir(){ nav.hidden = false; rafraichir();
    const la = liste.querySelector('.la'); if (la) la.scrollIntoView({ block:'center' }); }
  function fermer(){ nav.hidden = true; }

  barre.querySelector('.sommaire').addEventListener('click', ouvrir);
  ou.addEventListener('click', ouvrir);
  nav.querySelector('.fermer').addEventListener('click', fermer);
  barre.querySelector('.prec').addEventListener('click', () => { V.allerA(V.ou().arret - 1); rafraichir(); });
  barre.querySelector('.suiv').addEventListener('click', () => {
    V.allerA(document.body.classList.contains('enVisite') ? V.ou().arret + 1 : 0); rafraichir(); });
  bPause.addEventListener('click', () => {
    if (!document.body.classList.contains('enVisite')){ V.allerA(0); } else V.basculerPause();
    rafraichir(); });
  nav.querySelector('.rejouer').addEventListener('click', () => { fermer(); V.allerA(V.ou().arret); rafraichir(); });
  nav.querySelector('.apercu').addEventListener('click', () => {
    fermer(); barre.hidden = true;
    if (typeof window.remettreLeRecuRouge === 'function') window.remettreLeRecuRouge();
    scrollTo(0, 0); V.allerA(0);
  });
  nav.querySelector('.zero').addEventListener('click', () => {
    try {
      if (typeof window.remettreLeBoutonRouge === 'function') window.remettreLeBoutonRouge();
      Object.keys(localStorage).filter(k => /boheme-(visite-vue|visite-ou|recu|prevenu|maj)/i.test(k))
        .forEach(k => localStorage.removeItem(k));
    } catch(e){}
    location.reload();
  });
  /* l'appui long sur le logo (dans visite.js) rappelle ceci pour ramener la barre */
  window.montrerLaBarreDEssai = () => { barre.hidden = false; };
  rafraichir();
})();
