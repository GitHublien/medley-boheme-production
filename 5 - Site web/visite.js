/* ═══════════════════════════════════════════════════════════════════════════
   LA VISITE GUIDÉE — l'application se présente elle-même (11 septembre 2026)

   Mickaël : « il faut qu'elle fasse les choses automatiquement. Il faut qu'il
   voie et qu'il ait juste à regarder, comme si c'était une vidéo. Vraiment
   interactif pour le coup. »

   ★ LA RÈGLE

   Il ne touche à rien. Les pages s'ouvrent seules, le menu se déroule seul, le
   projecteur se déplace seul. Trois exceptions, et trois seulement : le choix
   du départ, le bouton rouge (c'est à lui de décider), et tourner le téléphone.

   ★ POURQUOI C'EST POSSIBLE AUJOURD'HUI ET PAS HIER

   Parce que le site ne recharge plus ses pages (voir une-seule-page.js). Une
   voix peut donc parler pendant qu'on ouvre l'atelier, revenir à l'accueil,
   filer vers les textes — sans une seule coupure. Hier, chaque lien aurait
   tué la voix net.

   ★ LA MÉCANIQUE

   Une suite d'arrêts. Chaque arrêt dit : quel son jouer, quoi éclairer, quel
   geste faire avant, et combien de temps attendre. Le son commande le rythme :
   on passe à l'arrêt suivant quand la phrase est finie, jamais avant.

   ★ CE QUI NE DOIT JAMAIS ARRIVER

   Qu'on reste coincé. Si un son manque, si une page ne répond pas, si le doigt
   se pose sur l'écran — la visite continue, se met en pause proprement, ou se
   termine. Elle ne bloque personne, jamais.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const CLE_VUE = 'boheme-visite-vue';
  const DOSSIER = 'media/visite/';

  /* qui est là, et donc quelle voix lui parle */
  const VOIX_DE = { adrien:'leda', mickael:'leda', bry:'leda', elie:'leda',
                    stephanie:'charon', candice:'charon' };
  let qui = '';
  try { qui = (new URLSearchParams(location.search).get('pour')
            || localStorage.getItem('boheme-pour') || '').toLowerCase(); } catch(e){}
  const voix = VOIX_DE[qui] || 'leda';

  const sonCommun = n => DOSSIER + n + '--' + voix + '.mp3';
  const sonPerso  = n => DOSSIER + n + '--' + (qui || 'adrien') + '.mp3';

  /* ── les douze arrêts ─────────────────────────────────────────────────── */
  const ARRETS = [
    { son: sonPerso('01-bonjour'),        vise: null },
    { son: sonPerso('02-le-bouton-rouge'), vise: '.carteEssentiel .ceLigne:first-child',
      /* « demande » vient APRES la phrase : on ne coupe jamais la voix pour poser
         une question. C'est la deuxieme des trois exceptions — c'est lui qui
         decide, maintenant ou plus tard. */
      demande: { texte: 'Tu veux le faire maintenant ?',
                 oui: 'Je le fais maintenant', non: 'Plus tard',
                 fait: '.carteEssentiel .ceLigne:first-child a, .carteEssentiel .ceLigne:first-child button' } },
    { son: sonCommun('02b-mises-a-jour'), vise: '.carteEssentiel .ceLigne:last-child' },
    { son: sonCommun('03-musique'),       vise: '.nav .musique' },
    { son: sonCommun('04-barre-du-bas'),  vise: '.bas' },
    { son: sonCommun('05-atelier'),       vise: 'a[href*="KARAOKE"].tuile' },
    { son: sonCommun('06-textes'),        vise: 'a[href*="LIVRE"].tuile' },
    { son: sonCommun('07-menu'),          vise: '.voile nav', avant: 'ouvrirMenu' },
    { son: sonCommun('08-halo'),          vise: '.voile .legendeMenu' },
    { son: sonCommun('09-retour'),        vise: '.nav .marque', avant: 'fermerMenu' },
    { son: sonCommun('10-exemple'),       vise: null, avant: 'montrerCalendrier' },
    { son: sonCommun('11-paysage'),       vise: null, attend: 'paysage' },
    { son: sonPerso('12-la-fin'),         vise: null, avant: 'revenirAccueil' },
  ];

  /* ── les gestes que la visite fait elle-même ──────────────────────────── */
  const GESTES = {
    ouvrirMenu(){ document.body.classList.add('menu'); return 700; },
    fermerMenu(){ document.body.classList.remove('menu'); return 500; },
    montrerCalendrier(){
      const a = [...document.querySelectorAll('a[href]')]
        .find(x => /CALENDRIER/i.test(decodeURIComponent(x.getAttribute('href') || '')));
      if (a) a.click();
      apres(() => GESTES.revenirAccueil(), 4200);
      return 900;
    },
    revenirAccueil(){
      const a = document.querySelector('.nav .marque') || [...document.querySelectorAll('a[href]')]
        .find(x => /ACCUEIL/i.test(decodeURIComponent(x.getAttribute('href') || '')));
      if (a && !/ACCUEIL/i.test(decodeURIComponent(location.pathname))) a.click();
      return 900;
    },
  };

  /* ── le décor : le voile, le projecteur, la barre de passage ──────────── */
  const style = document.createElement('style');
  style.textContent = `
    #vVoile{ position:fixed; inset:0; z-index:150; background:rgba(4,4,4,.72);
      backdrop-filter:blur(2px); -webkit-backdrop-filter:blur(2px);
      opacity:0; pointer-events:none; transition:opacity .6s ease; }
    body.enVisite #vVoile{ opacity:1; pointer-events:auto; }
    #vProjecteur{ position:fixed; z-index:151; border-radius:1rem; pointer-events:none;
      box-shadow:0 0 0 3px rgba(241,210,122,.9), 0 0 0 9999px rgba(4,4,4,.72),
                 0 0 44px rgba(241,210,122,.55);
      opacity:0; transition:opacity .5s ease, all .75s cubic-bezier(.32,.72,0,1); }
    #vProjecteur.la{ opacity:1; }
    #vBarre{ position:fixed; z-index:153; left:0; right:0;
      bottom:calc(env(safe-area-inset-bottom) + 14px);
      display:flex; align-items:center; justify-content:center; gap:12px;
      opacity:0; transition:opacity .5s ease; pointer-events:none; }
    body.enVisite #vBarre{ opacity:1; pointer-events:auto; }
    #vBarre button{ border-radius:999px; border:1px solid rgba(212,175,55,.5);
      background:rgba(12,11,10,.92); color:#f1d27a; font:600 13px system-ui;
      padding:11px 20px; cursor:pointer; backdrop-filter:blur(12px); }
    #vBarre .vPrincipal{ background:linear-gradient(180deg,#f4d97f,#c9a13a); color:#1a1408; }
    #vPuces{ position:fixed; z-index:153; left:0; right:0;
      top:calc(env(safe-area-inset-top) + 8px); display:flex; justify-content:center; gap:5px;
      opacity:0; transition:opacity .5s; pointer-events:none; }
    body.enVisite #vPuces{ opacity:1; }
    #vPuces i{ width:5px; height:5px; border-radius:50%; background:rgba(255,255,255,.22); }
    #vPuces i.faite{ background:rgba(212,175,55,.65); }
    #vPuces i.ici{ background:#f1d27a; box-shadow:0 0 9px rgba(241,210,122,.9); }
    /* la carte d'entrée */
    #vEntree{ position:fixed; inset:0; z-index:160; display:none; place-items:center;
      background:rgba(4,4,4,.93); backdrop-filter:blur(16px); padding:8vw; }
    #vEntree.la{ display:grid; }
    #vEntree .carte{ max-width:30rem; text-align:center; display:grid; gap:1rem;
      background:rgba(12,11,10,.94); border:1px solid rgba(212,175,55,.4);
      border-radius:1.2rem; padding:1.8rem 1.6rem; box-shadow:0 24px 70px rgba(0,0,0,.7); }
    #vEntree h2{ font-family:var(--disp,Georgia,serif); color:#f1d27a; margin:0; font-size:1.5rem; }
    #vEntree p{ margin:0; color:#bcb4a2; font-size:.92rem; line-height:1.6; }
    #vEntree .son{ color:#f1d27a; font-weight:600; }
    #vEntree .gestes{ display:grid; gap:.5rem; margin-top:.4rem; }
    #vEntree button{ padding:.95rem 1.2rem; border-radius:999px; font:600 1rem system-ui;
      cursor:pointer; border:1px solid rgba(212,175,55,.5); }
    #vEntree .oui{ background:linear-gradient(180deg,#f4d97f,#c9a13a); color:#1a1408; }
    #vEntree .non{ background:rgba(212,175,55,.08); color:#f1d27a; }
    /* l'invite à tourner le téléphone */
    #vTourne{ position:fixed; inset:0; z-index:158; display:none; place-items:center;
      background:rgba(4,4,4,.95); text-align:center; }
    #vTourne.la{ display:grid; }
    #vTourne .tel{ font-size:64px; animation:vTourner 2s ease-in-out infinite; }
    @keyframes vTourner{ 0%,100%{ transform:rotate(0) } 50%{ transform:rotate(90deg) } }
    /* les deux petites boites : la question du bouton rouge, et la pause */
    #vDemande, #vPause{ position:fixed; inset:0; z-index:159; display:grid; place-items:center;
      background:rgba(4,4,4,.82); backdrop-filter:blur(10px); padding:8vw; }
    #vDemande .bulle, #vPause .bulle{ display:grid; gap:.7rem; text-align:center; max-width:22rem;
      background:rgba(12,11,10,.96); border:1px solid rgba(212,175,55,.4);
      border-radius:1.1rem; padding:1.4rem 1.3rem; box-shadow:0 20px 60px rgba(0,0,0,.7); }
    #vDemande p, #vPause p{ margin:0 0 .3rem; color:#f1d27a; font:600 1.05rem system-ui; }
    #vDemande button, #vPause button{ padding:.85rem 1.1rem; border-radius:999px; cursor:pointer;
      font:600 .95rem system-ui; border:1px solid rgba(212,175,55,.5); }
    #vDemande .oui, #vPause .oui{ background:linear-gradient(180deg,#f4d97f,#c9a13a); color:#1a1408; }
    #vDemande .non, #vPause .non{ background:rgba(212,175,55,.08); color:#f1d27a; }
    body.enVisite{ overflow:hidden; }`;
  document.head.appendChild(style);

  /* la classe « visiteGarde » dit a une-seule-page.js de ne jamais les balayer
     quand on change de page : la visite traverse tout le site sans se defaire. */
  const el = (id, html) => { const d = document.createElement('div'); d.id = id;
    d.className = 'visiteGarde';
    if (html) d.innerHTML = html; document.body.appendChild(d); return d; };
  const voile = el('vVoile');
  const proj  = el('vProjecteur');
  const puces = el('vPuces');
  const barre = el('vBarre', '<button class="vPasser">Passer la visite</button>');
  const tourne = el('vTourne',
    '<div><div class="tel">📱</div><div style="color:#f1d27a;font:600 20px system-ui;margin-top:14px">Tourne ton téléphone</div></div>');

  ARRETS.forEach(() => puces.appendChild(document.createElement('i')));

  /* ── le son ───────────────────────────────────────────────────────────── */
  const son = document.createElement('audio');
  son.preload = 'auto';
  son.setAttribute('data-visite', '1');
  document.body.appendChild(son);

  let ici = -1, arrete = false;

  /* ── LES HORLOGES DE LA VISITE ──────────────────────────────────────────
     Elle traverse les pages, donc elle ne peut pas se servir des minuteurs
     ordinaires : une-seule-page.js les fauche a chaque changement de page pour
     qu'aucune page ne laisse battre son coeur derriere elle. Elle emprunte
     donc les horloges d'origine, qui ne sont surveillees par personne. */
  const H = window.__horlogeHorsSurveillance || window;
  const apres = (f, ms) => H.setTimeout.call(window, f, ms);

  function eclairer(selecteur){
    const c = selecteur && document.querySelector(selecteur);
    if (!c){ proj.classList.remove('la'); return; }
    c.scrollIntoView({ behavior:'smooth', block:'center' });
    apres(() => {
      const r = c.getBoundingClientRect();
      proj.style.left = Math.max(6, r.left - 8) + 'px';
      proj.style.top = Math.max(6, r.top - 8) + 'px';
      proj.style.width = Math.min(innerWidth - 12, r.width + 16) + 'px';
      proj.style.height = Math.min(innerHeight - 12, r.height + 16) + 'px';
      proj.classList.add('la');
    }, 420);
  }

  function marquer(){
    [...puces.children].forEach((p, k) => {
      p.classList.toggle('ici', k === ici);
      p.classList.toggle('faite', k < ici);
    });
  }

  function finir(){
    arrete = true;
    try { son.pause(); } catch(e){}
    document.body.classList.remove('enVisite', 'menu');
    proj.classList.remove('la');
    tourne.classList.remove('la');
    try { localStorage.setItem(CLE_VUE, '1'); } catch(e){}
    rendreLaMusique();
  }

  /* ── LA MUSIQUE DU HALL, PENDANT QU'ON PARLE ───────────────────────────
     On ne clique surtout pas sur la note : un appui ouvre le panneau, il en
     faut deux pour eteindre, et on casserait l'etat du lecteur. On baisse le
     volume de la bande, tout simplement — et on le rend a la fin. Comme un
     fondu dans Reaper : la musique reste dessous, elle ne s'arrete pas. */
  let volumeGarde = null;
  const bandeDuHall = () => [...document.querySelectorAll('audio')]
    .find(a => a !== son && !a.paused);
  function baisserLaMusique(){
    const b = bandeDuHall();
    if (b && volumeGarde === null){ volumeGarde = b.volume; b.volume = Math.min(b.volume, 0.10); }
  }
  function rendreLaMusique(){
    const b = bandeDuHall();
    if (b && volumeGarde !== null) b.volume = volumeGarde;
    volumeGarde = null;
  }

  function attendre(quoi, apres){
    if (quoi === 'paysage'){
      if (innerWidth > innerHeight) return apres();
      tourne.classList.add('la');
      const voir = () => { if (innerWidth > innerHeight){
        tourne.classList.remove('la');
        removeEventListener('resize', voir); apres(apres, 500); } };
      addEventListener('resize', voir);
      /* on ne retient personne : au bout de vingt secondes, on continue */
      apres(() => { tourne.classList.remove('la'); removeEventListener('resize', voir); apres(); }, 20000);
      return;
    }
    apres();
  }

  /* ── LA QUESTION DU BOUTON ROUGE ────────────────────────────────────────
     Deux boutons, et la visite attend. S'il dit oui, on ouvre vraiment le
     message — puis la visite reprend d'elle-meme quand il revient. */
  function demander(d, apres){
    const boite = document.createElement('div');
    boite.className = 'visiteGarde'; boite.id = 'vDemande';
    boite.innerHTML = '<div class="bulle"><p>' + d.texte + '</p>'
      + '<button class="oui">' + d.oui + '</button>'
      + '<button class="non">' + d.non + '</button></div>';
    document.body.appendChild(boite);
    const partir = (ouvrir) => {
      boite.remove();
      if (ouvrir){ const c = document.querySelector(d.fait); if (c) c.click(); }
      apres(apres, ouvrir ? 2600 : 500);
    };
    boite.querySelector('.oui').addEventListener('click', () => partir(true));
    boite.querySelector('.non').addEventListener('click', () => partir(false));
    /* on ne retient personne : au bout de quinze secondes sans reponse, on passe */
    apres(() => { if (boite.isConnected) partir(false); }, 15000);
  }

  /* ── LE DOIGT QUI SE POSE ───────────────────────────────────────────────
     « Et si son doigt touche l'ecran pendant la visite — par reflexe, ou pour
     voir — la visite se met en pause et propose : on continue ? Elle ne lutte
     jamais contre lui. » Le voile, la barre et la question ne comptent pas :
     ce sont ses trois rendez-vous a lui. */
  let enPause = false, reprendre = null;
  function pauser(){
    if (enPause || arrete || !document.body.classList.contains('enVisite')) return;
    enPause = true;
    try { son.pause(); } catch(e){}
    const b = document.createElement('div');
    b.className = 'visiteGarde'; b.id = 'vPause';
    b.innerHTML = '<div class="bulle"><p>Visite en pause.</p>'
      + '<button class="oui">On continue</button>'
      + '<button class="non">J&rsquo;arrête là</button></div>';
    document.body.appendChild(b);
    /* ⚠️ LA BOITE NAIT SOUS SON DOIGT. Le meme geste qui la fait apparaitre
       envoie ensuite un clic au meme endroit — et ce point tombe pile sur un
       bouton. Elle se refermait donc dans la seconde, parfois sur « j'arrete
       la » (vu en essai le 11 septembre). Elle reste sourde une demi-seconde,
       le temps que le doigt se leve. */
    b.style.pointerEvents = 'none';
    apres(() => { b.style.pointerEvents = ''; }, 500);
    b.querySelector('.oui').addEventListener('click', () => {
      b.remove(); enPause = false; try { son.play(); } catch(e){}
    });
    b.querySelector('.non').addEventListener('click', () => { b.remove(); enPause = false; finir(); });
  }
  document.addEventListener('pointerdown', e => {
    if (!document.body.classList.contains('enVisite')) return;
    if (e.target.closest('#vBarre, #vDemande, #vPause, #vEntree, #vTourne')) return;
    pauser();
  }, true);

  function jouer(k){
    if (arrete) return;
    ici = k; marquer();
    if (k >= ARRETS.length) return finir();
    const a = ARRETS[k];
    const suite = () => {
      baisserLaMusique();   /* elle peut etre repartie apres un changement de page */
      eclairer(a.vise);
      son.src = a.son;
      /* ⚠️ LE VERROU. Sans lui, un son manquant declenche DEUX fois la suite —
         une fois par « onerror », une fois par le refus de « play » — et la
         visite saute un arret sur deux, ou pose la meme question trois fois.
         Vu en essai le 11 septembre. Un arret ne passe la main qu'une fois. */
      let passe = false;
      const suivant = () => {
        if (arrete || passe) return;
        passe = true;
        const aller = () => apres(() => jouer(k + 1), 900);
        if (a.demande) demander(a.demande, aller); else aller();
      };
      son.onended = suivant;
      /* si le son manque — fichier absent, réseau coupé — on n'attend pas : on
         laisse le temps de lire l'écran et on continue. La visite ne bloque jamais. */
      son.onerror = () => apres(suivant, 3500);
      son.play().catch(() => apres(suivant, 3500));
    };
    const d = a.avant && GESTES[a.avant] ? GESTES[a.avant]() : 0;
    if (a.attend) apres(() => attendre(a.attend, suite), d);
    else apres(suite, d);
  }

  /* ── la carte d'entrée ────────────────────────────────────────────────── */
  const entree = el('vEntree',
    '<div class="carte">'
    + '<h2>Bienvenue.</h2>'
    + '<p>Je peux te montrer l\'application en deux minutes — <b>tu n\'auras rien à toucher</b>.</p>'
    + '<p class="son">Monte le son de ton téléphone.</p>'
    + '<div class="gestes">'
    +   '<button class="oui">Oui, montre-moi</button>'
    +   '<button class="non">Non merci, je regarde seul</button>'
    + '</div></div>');

  function lancer(){
    entree.classList.remove('la');
    document.body.classList.add('enVisite');
    baisserLaMusique();
    jouer(0);
  }

  entree.querySelector('.oui').addEventListener('click', lancer);
  entree.querySelector('.non').addEventListener('click', () => {
    entree.classList.remove('la');
    try { localStorage.setItem(CLE_VUE, '1'); } catch(e){}
  });
  barre.querySelector('.vPasser').addEventListener('click', finir);
  voile.addEventListener('click', e => e.stopPropagation());

  /* on la propose à la toute première visite, sur l'accueil seulement */
  function proposer(){
    let vue = true;
    try { vue = localStorage.getItem(CLE_VUE) === '1'; } catch(e){}
    const surAccueil = /ACCUEIL/i.test(decodeURIComponent(location.pathname)) || location.pathname.endsWith('/');
    if (!vue && surAccueil) apres(() => entree.classList.add('la'), 1400);
  }
  proposer();

  /* et on peut la redemander, à tout moment */
  window.revoirLaVisite = () => { try { localStorage.removeItem(CLE_VUE); } catch(e){}
    arrete = false; entree.classList.add('la'); };
})();
