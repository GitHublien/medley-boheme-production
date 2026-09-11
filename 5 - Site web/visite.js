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
  /* Chaque arret porte un nom : c'est ce que Mickael verra dans le mode essai,
     et c'est ce qui rendra ses notes utilisables. « Arret 7, le menu » se
     corrige ; « ca ne va pas » ne se corrige pas. */
  const ARRETS = [
    { son: sonPerso('01-bonjour'),        vise: null, nom: "L’accueil" },
    { son: sonPerso('02-le-bouton-rouge'), vise: '.carteEssentiel .ceLigne:first-child', nom: 'Le bouton rouge',
      /* « demande » vient APRES la phrase : on ne coupe jamais la voix pour poser
         une question. C'est la deuxieme des trois exceptions — c'est lui qui
         decide, maintenant ou plus tard. */
      demande: { texte: 'Tu veux le faire maintenant ?',
                 oui: 'Je le fais maintenant', non: 'Plus tard',
                 fait: '.carteEssentiel .ceLigne:first-child a, .carteEssentiel .ceLigne:first-child button' } },
    { son: sonCommun('02b-mises-a-jour'), vise: '.carteEssentiel .ceLigne:last-child', nom: 'Les mises à jour' },
    { son: sonCommun('03-musique'),       vise: '.nav .musique', nom: 'La musique' },
    { son: sonCommun('04-barre-du-bas'),  vise: '.bas', nom: 'La barre du bas' },
    { son: sonCommun('05-atelier'),       vise: 'a[href*="KARAOKE"].tuile', nom: "L’atelier" },
    { son: sonCommun('06-textes'),        vise: 'a[href*="LIVRE"].tuile', nom: 'Les textes' },
    { son: sonCommun('07-menu'),          vise: '.voile nav', avant: 'ouvrirMenu', nom: 'Le menu' },
    { son: sonCommun('08-halo'),          vise: '.voile .legendeMenu', nom: 'Le halo bleu' },
    { son: sonCommun('09-retour'),        vise: '.nav .marque', avant: 'fermerMenu', nom: 'Le retour' },
    { son: sonCommun('10-exemple'),       vise: null, avant: 'montrerCalendrier', nom: 'Un exemple' },
    { son: sonCommun('11-paysage'),       vise: null, attend: 'paysage', nom: 'Le paysage' },
    { son: sonPerso('12-la-fin'),         vise: null, avant: 'revenirAccueil', nom: 'La fin' },
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
    /* ⚠️ 11 septembre au soir — Mickael : « tout est flou, tout est en noir,
       il n'y a rien qu'on voie. » Il avait raison, et le defaut etait grossier :
       je peignais DEUX couches de noir. Le voile assombrissait toute la page —
       y compris la chose que je voulais montrer — et le projecteur en rajoutait
       une seconde par-dessus.

       Le bon dessin n'en a qu'une : le projecteur porte son propre noir, peint
       tout AUTOUR de lui par une ombre demesuree. L'interieur du cadre reste
       donc a sa vraie lumiere, sans que j'aie rien a toucher a la page. Le voile
       ne sert plus qu'a une chose, et il est transparent : arreter les doigts.
       Et plus aucun flou : on regarde la vraie application, pas une photo
       depolie. */
    /* ⚠️ 11 septembre au soir — L'IDEE DE MICKAEL, et elle est meilleure que la
       mienne : « pourquoi ne fais-tu pas avec des couleurs en degrade ? Tu
       eclaires vraiment ce qui represente. Ce n'est pas plus facile que de
       faire des carres ? »

       Si. C'est plus simple ET plus juste. Un cadre rectangulaire, c'est un
       objet de plus pose par-dessus la page — avec ses bords durs, ses coins
       qui ne collent a rien, et sa maniere de decouper de travers ce qui n'est
       pas un carre. Un projecteur, lui, ne pose rien : il eclaire. La lumiere
       s'eteint en douceur vers les bords, exactement comme une douche de scene,
       et l'or ne fait plus un trait mais une lueur.

       Une seule couche, donc, et c'est ce voile : un degre de noir partout,
       perce d'un halo doux la ou il faut regarder. Le centre et la taille du
       halo sont poses par la visite, en direct. */
    #vVoile{ position:fixed; inset:0; z-index:150;
      background:rgba(4,4,4,.86);
      opacity:0; pointer-events:none;
      transition:opacity .5s ease, background-position .6s cubic-bezier(.32,.72,0,1); }
    body.enVisite #vVoile{ opacity:1; pointer-events:auto; }
    #vProjecteur{ display:none; }
    /* ⚠️ « Aucun texte ne doit manger un autre texte. » Ce bouton se posait
       PILE sur la barre du bas et mangeait ATELIER et TEXTES (vu en image le
       11 septembre au soir). Il se tient maintenant AU-DESSUS d'elle — et pas
       a une hauteur devinee : on mesure la vraie barre et on se range dessus
       (--hBas, pose par la visite au demarrage et a chaque rotation). */
    #vBarre{ position:fixed; z-index:153; left:0; right:0;
      bottom:calc(env(safe-area-inset-bottom) + var(--hBas, 92px) + 14px);
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

  /* ── UN SEUL FIL, ET PAS DEUX ───────────────────────────────────────────
     ⚠️ 11 septembre au soir — Mickael : « des fois il y a deux fois la voix
     qui apparait. »

     Je n'ai pas cherche d'ou venait le doublon : je l'ai rendu impossible. Un
     double appui sur « oui », un « revoir la visite » pendant qu'elle tourne
     deja, une page qui revient — et deux deroules se mettaient a avancer en
     meme temps sur la meme bande, chacun poussant l'autre. On entendait des
     phrases qui se coupaient et se recouvraient.

     Desormais chaque depart porte un numero. Tout ce qui revient d'un depart
     perime — la fin d'une phrase, un minuteur, une reponse — est jete sans
     rien faire. Comme dans Reaper : une seule piste armee a la fois, et c'est
     vrai par construction, pas par correction. */
  let fil = 0;

  /* ── LES HORLOGES DE LA VISITE ──────────────────────────────────────────
     Elle traverse les pages, donc elle ne peut pas se servir des minuteurs
     ordinaires : une-seule-page.js les fauche a chaque changement de page pour
     qu'aucune page ne laisse battre son coeur derriere elle. Elle emprunte
     donc les horloges d'origine, qui ne sont surveillees par personne. */
  const H = window.__horlogeHorsSurveillance || window;
  const apres = (f, ms) => H.setTimeout.call(window, f, ms);

  /* ── OU SE POSE LA LUMIERE ──────────────────────────────────────────────
     ⚠️ 11 septembre au soir — Mickael : « je n'ai pas l'impression que ce soit
     au bon endroit que tu montres les choses. »

     C'etait vrai, et la cause etait bete : je mesurais la position de l'objet
     420 millisecondes apres avoir lance le defilement — alors qu'un defilement
     doux dure bien plus longtemps que ca, et davantage encore sur un telephone.
     Je mesurais donc une chose EN TRAIN DE BOUGER, et je posais le cadre la ou
     elle etait au passage, pas la ou elle s'arretait.

     Maintenant je ne devine plus : je regarde l'objet jusqu'a ce qu'il ne bouge
     plus (deux mesures identiques de suite), et c'est seulement la que je pose
     le cadre. Puis je continue a le suivre pendant qu'on parle de lui : si la
     page remue encore pour une raison quelconque, le cadre reste dessus. */
  /* ⚠️ DEUX HORLOGES A ETEINDRE, PAS UNE. La premiere guette l'objet jusqu'a
     ce qu'il s'immobilise ; la seconde le suit ensuite. Je n'eteignais que la
     seconde — la premiere de l'arret precedent continuait donc a tourner, se
     stabilisait en retard, et reposait le cadre sur l'ANCIEN objet. Tous les
     arrets finissaient par montrer la meme chose. */
  const estAncre = (e) => {
    for (let n = e; n && n !== document.body; n = n.parentElement)
      if (getComputedStyle(n).position === 'fixed') return true;
    return false;
  };
  let suivi = null, guette = null;
  function eteindreLesHorloges(){
    if (suivi){ clearInterval(suivi); suivi = null; }
    if (guette){ clearInterval(guette); guette = null; }
  }
  /* La douche de lumiere. On centre l'ellipse sur l'objet, on lui donne la
     taille de l'objet plus une marge, et on la laisse s'eteindre vers le noir.
     La fine bande d'or a 70 % fait l'ourlet chaud d'une vraie poursuite. */
  function poserSur(c){
    const r = c.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    /* le clair doit couvrir l'objet : il s'arrete a 62 % du rayon, donc on
       divise par 0,62 pour que l'objet tienne tout entier dans la lumiere */
    /* La lumiere doit serrer l'objet, pas inonder le voisinage : une premiere
       version debordait sur le menu et sur la carte rouge. Le clair s'arrete a
       55 % du rayon — on divise donc par 0,55 — et la marge reste petite. */
    const rx = Math.max(44, (r.width  / 2 + 16)) / 0.55;
    const ry = Math.max(38, (r.height / 2 + 14)) / 0.55;
    voile.style.background =
      'radial-gradient(ellipse ' + Math.round(rx) + 'px ' + Math.round(ry) + 'px at '
      + Math.round(cx) + 'px ' + Math.round(cy) + 'px, '
      + 'rgba(4,4,4,0) 0%, rgba(4,4,4,0) 55%, '
      + 'rgba(241,210,122,.18) 64%, '
      + 'rgba(4,4,4,.62) 78%, rgba(4,4,4,.9) 100%)';
    return r;
  }
  function eteindreLaLumiere(){ voile.style.background = 'rgba(4,4,4,.86)'; }
  function eclairer(selecteur){
    eteindreLesHorloges();
    const c = selecteur && document.querySelector(selecteur);
    /* rien a designer : on n'assombrit rien non plus. On regarde la vraie
       application, en pleine lumiere, pendant que la voix parle. */
    if (!c){ voile.style.background = 'transparent'; rangerLePasser(null); return; }
    /* ⚠️ UNE BARRE ANCREE NE DEFILE PAS. Le logo, la barre du bas, la note de
       la musique sont fixes a l'ecran : les « amener au centre » ne les bouge
       pas d'un pixel, mais ca fait defiler toute la page derriere — et la barre
       du haut se compacte au passage, ce qui deplace le logo APRES ma mesure.
       Le cadre tombait donc a cote. On ne defile que pour ce qui defile. */
    if (!estAncre(c)) c.scrollIntoView({ behavior:'smooth', block:'center' });
    let avant = null, stable = 0, tours = 0;
    const H2 = (window.__horlogeHorsSurveillance || window).setInterval;
    const montre = guette = H2.call(window, () => {
      const r = c.getBoundingClientRect();
      const ou = [r.left|0, r.top|0, r.width|0, r.height|0].join(',');
      stable = (ou === avant) ? stable + 1 : 0;
      avant = ou;
      tours++;
      /* deux mesures identiques : l'objet s'est arrete, on peut poser la lumiere.
         Et au bout de trois secondes on la pose de toute facon : on ne reste
         jamais bloque a attendre quelque chose qui ne s'immobilise pas. */
      if (stable >= 2 || tours > 30){
        clearInterval(montre); guette = null;
        const r2 = poserSur(c);
        rangerLePasser(r2);
        /* on continue a le suivre, doucement, tant qu'on parle de lui */
        suivi = H2.call(window, () => { if (c.isConnected) poserSur(c); else { clearInterval(suivi); suivi = null; } }, 250);
      }
    }, 100);
  }

  /* ⚠️ « Aucun texte ne doit manger un autre texte. » Le bouton « Passer la
     visite » vit en bas de l'ecran — et quand on montre la barre du bas, il se
     posait pile dessus et mangeait les mots ATELIER et TEXTES (vu en image le
     11 septembre). Des que la lumiere descend dans le bas de l'ecran, il monte
     en haut. Il ne disparait jamais : on ne retient personne. */
  /* on mesure la barre du bas pour se ranger au-dessus d'elle. En paysage il
     n'y en a pas (une colonne a gauche a la place) : la mesure vaut alors zero,
     et le bouton redescend naturellement. */
  function mesurerLaBarreDuBas(){
    const b = document.querySelector('.bas');
    const h = (b && getComputedStyle(b).display !== 'none') ? Math.round(b.getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty('--hBas', h + 'px');
  }
  addEventListener('resize', mesurerLaBarreDuBas);

  /* ⚠️ « Aucun texte ne doit manger un autre texte. » Ce bouton a mange trois
     choses avant de trouver sa place, et chaque fois c'est l'image qui me l'a
     appris, jamais le code :
       · la barre du bas et ses mots ATELIER, TEXTES ;
       · la carte rouge, quand je le faisais sauter en haut de l'ecran ;
       · la legende du halo bleu — celle qu'on etait justement en train de
         montrer, ce qui est le pire des trois.
     La regle est donc simple et generale : sa place ordinaire est au-dessus de
     la barre du bas ; et s'il touche ce que la lumiere designe, il se range
     juste AU-DESSUS de ce cadre. Jamais dedans, jamais par-dessus. */
  function rangerLePasser(r){
    barre.style.bottom = '';
    if (!r) return;
    const b = barre.getBoundingClientRect();
    const seTouchent = !(b.bottom < r.top - 6 || b.top > r.bottom + 6);
    if (seTouchent){
      const hautDuCadre = Math.max(0, r.top);
      barre.style.bottom = Math.max(12, innerHeight - hautDuCadre + 12) + 'px';
    }
  }

  function marquer(){
    [...puces.children].forEach((p, k) => {
      p.classList.toggle('ici', k === ici);
      p.classList.toggle('faite', k < ici);
    });
  }

  function finir(){
    arrete = true; fil++;   /* tout ce qui revient d'avant est desormais perime */
    try { son.onended = son.onerror = null; } catch(e){}
    try { son.pause(); } catch(e){}
    document.body.classList.remove('enVisite', 'menu');
    voile.style.background = 'transparent';
    eteindreLesHorloges();
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

  /* ⚠️ 12 septembre — LE PARAMETRE S'APPELAIT « apres », COMME LE MINUTEUR.
     Quand j'ai fait passer toute la visite aux horloges qui survivent aux
     changements de page, j'ai renomme chaque « setTimeout » en « apres » — y
     compris la ou « apres » etait deja le nom de la suite a jouer. La ligne
     « attendre un peu, puis continuer » s'est donc changee en « continuer tout
     de suite ». D'ou le defaut que Mickael a vu : ca partait sans lui.
     Les suites s'appellent « alors », maintenant. Deux noms, deux choses. */
  function attendre(quoi, alors){
    if (quoi === 'paysage'){
      if (innerWidth > innerHeight) return alors();
      tourne.classList.add('la');
      const voir = () => { if (innerWidth > innerHeight){
        tourne.classList.remove('la');
        removeEventListener('resize', voir); apres(alors, 500); } };
      addEventListener('resize', voir);
      /* on ne retient personne : au bout de vingt secondes, on continue */
      apres(() => { tourne.classList.remove('la'); removeEventListener('resize', voir); alors(); }, 20000);
      return;
    }
    alors();
  }

  /* ── LA QUESTION DU BOUTON ROUGE ────────────────────────────────────────
     ⚠️ 12 septembre — Mickael : « il faut que les paroles s'arretent tant qu'il
     n'a pas fait le choix. Pense a Ren'Py : il y a un choix a faire, hop. S'il
     n'a pas fait le choix, rien ne se met en marche. »

     Un choix qui se fait tout seul n'est pas un choix. Le compte a rebours de
     quinze secondes est supprime : la visite attend, aussi longtemps qu'il le
     faut, et rien d'autre ne se passe pendant ce temps.

     Et s'il part envoyer le message, on l'attend VRAIMENT — jusqu'a ce qu'il
     revienne sur l'application. Deux secondes et demie, c'etait le temps
     d'ouvrir WhatsApp, pas celui d'ecrire et de revenir. */
  function demander(d, alors){
    const boite = document.createElement('div');
    boite.className = 'visiteGarde'; boite.id = 'vDemande';
    boite.innerHTML = '<div class="bulle"><p>' + d.texte + '</p>'
      + '<button class="oui">' + d.oui + '</button>'
      + '<button class="non">' + d.non + '</button></div>';
    /* la voix se tait : on ne parle pas par-dessus un choix */
    try { son.pause(); } catch(e){}
    document.body.appendChild(boite);
    const partir = (ouvrir) => {
      boite.remove();
      /* ⚠️ 12 septembre — Mickael : « s'il fait le choix negatif, tu dis : ok,
         tu as fait ce choix. Par contre, quand tu le desireras, tu pourras
         avertir Mickael. » Les deux reponses ont droit a la meme consideration :
         « plus tard » est un choix, pas un echec, et on le lui dit. */
      if (!ouvrir) return repondre('02d-plus-tard', alors);
      const c = document.querySelector(d.fait);
      if (c) c.click();
      attendreSonRetour(() => repondre('02c-merci', alors));
    };
    boite.querySelector('.oui').addEventListener('click', () => partir(true));
    boite.querySelector('.non').addEventListener('click', () => partir(false));
    /* et AUCUN compte a rebours : tant qu'il n'a pas repondu, rien ne bouge. */
  }

  /* ── ON L'ATTEND VRAIMENT ───────────────────────────────────────────────
     Il est parti dans WhatsApp. Le telephone nous le dit : la page devient
     « cachee », puis « visible » quand il revient. On ne reprend pas une
     seconde avant — et s'il ne revient jamais, il n'y a rien a reprendre : la
     visite dort, elle ne tourne pas dans le vide. */
  function attendreSonRetour(alors){
    let parti = document.visibilityState === 'hidden', fini = false;
    const finir1 = () => { if (fini) return; fini = true;
      document.removeEventListener('visibilitychange', voir); alors(); };
    const voir = () => {
      if (document.visibilityState === 'hidden'){ parti = true; return; }
      if (parti) apres(finir1, 900);     /* le temps que l'ecran revienne */
    };
    document.addEventListener('visibilitychange', voir);
    /* s'il n'est pas sorti du tout — le partage s'est ouvert par-dessus sans
       quitter l'application, ou le telephone l'a refuse — on reprend au bout de
       huit secondes : on ne le laisse jamais devant un ecran mort. */
    apres(() => { if (!parti) finir1(); }, 8000);
  }

  /* ── LA REPONSE A SON CHOIX ─────────────────────────────────────────────
     Mickael : « il faudrait lui dire quand il a fait le choix. » Une phrase
     pour « je le fais maintenant », une autre pour « plus tard ». Ce sont les
     deux seules de toute la visite qui repondent a un geste — et aucune des
     deux ne reproche quoi que ce soit.

     Si le fichier n'est pas encore la, on enchaine sans rien dire : la visite
     ne bloque jamais sur un son manquant. */
  function repondre(quoi, alors){
    son.onended = son.onerror = null;
    let passe = false;
    const suite = () => { if (!passe){ passe = true; apres(alors, 700); } };
    son.src = sonCommun(quoi);
    son.onended = suite;
    son.onerror = () => apres(suite, 200);
    son.play().catch(() => apres(suite, 200));
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
    if (e.target.closest('#vBarre, #vDemande, #vPause, #vEntree, #vTourne, #vEssai, #vNote')) return;
    pauser();
  }, true);

  function jouer(k, monFil){
    if (arrete || monFil !== fil) return;   /* un depart perime ne joue rien */
    ici = k; marquer();
    if (k >= ARRETS.length) return finir();
    const a = ARRETS[k];
    const suite = () => {
      if (monFil !== fil) return;
      baisserLaMusique();   /* elle peut etre repartie apres un changement de page */
      eclairer(a.vise);
      son.src = a.son;
      /* ⚠️ LE VERROU. Sans lui, un son manquant declenche DEUX fois la suite —
         une fois par « onerror », une fois par le refus de « play » — et la
         visite saute un arret sur deux, ou pose la meme question trois fois.
         Vu en essai le 11 septembre. Un arret ne passe la main qu'une fois. */
      let passe = false;
      const suivant = () => {
        if (arrete || passe || monFil !== fil) return;
        passe = true;
        const aller = () => apres(() => jouer(k + 1, monFil), 900);
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
    /* un depart neuf annule tout ce qui pouvait encore tourner */
    fil++; arrete = false;
    try { son.pause(); son.onended = son.onerror = null; } catch(e){}
    mesurerLaBarreDuBas();
    entree.classList.remove('la');
    document.body.classList.add('enVisite');
    baisserLaMusique();
    jouer(0, fil);
  }

  entree.querySelector('.oui').addEventListener('click', lancer);
  entree.querySelector('.non').addEventListener('click', () => {
    entree.classList.remove('la');
    try { localStorage.setItem(CLE_VUE, '1'); } catch(e){}
  });
  barre.querySelector('.vPasser').addEventListener('click', finir);
  voile.addEventListener('click', e => e.stopPropagation());

  /* ── LE MODE ESSAI SE CHARGE-T-IL ? ─────────────────────────────────────
     ?essai=1 une seule fois, et c'est retenu : Mickael n'aura pas a retaper une
     adresse sur un telephone. ?essai=0 l'eteint. Et un appui long sur « Revoir
     la visite guidee », dans le menu, le bascule — c'est le chemin le plus
     court depuis son doigt. */
  const CLE_ESSAI = 'boheme-visite-essai';
  try {
    const d = new URLSearchParams(location.search).get('essai');
    if (d === '1') localStorage.setItem(CLE_ESSAI, '1');
    if (d === '0') localStorage.removeItem(CLE_ESSAI);
  } catch(e){}
  window.__modeEssai = () => { try { return localStorage.getItem(CLE_ESSAI) === '1'; } catch(e){ return false; } };
  window.basculerModeEssai = () => {
    let on = false;
    try {
      on = localStorage.getItem(CLE_ESSAI) !== '1';
      if (on) localStorage.setItem(CLE_ESSAI, '1'); else localStorage.removeItem(CLE_ESSAI);
    } catch(e){}
    return on ? 'mode essai ALLUMÉ — recharge la page' : 'mode essai éteint';
  };
  if (window.__modeEssai() && !document.querySelector('script[src="visite-essai.js"]')){
    const t = document.createElement('script'); t.src = 'visite-essai.js';
    document.body.appendChild(t);
  }

  /* on la propose à la toute première visite, sur l'accueil seulement */
  function proposer(){
    let vue = true;
    try { vue = localStorage.getItem(CLE_VUE) === '1'; } catch(e){}
    const surAccueil = /ACCUEIL/i.test(decodeURIComponent(location.pathname)) || location.pathname.endsWith('/');
    if (!vue && surAccueil) apres(() => entree.classList.add('la'), 1400);
  }
  proposer();

  /* ── LA PORTE DU MODE ESSAI ─────────────────────────────────────────────
     Mickael : « il faudrait un truc de test pour voir point par point, et
     t'expliquer les choses au fur et a mesure. M'arreter, faire des pauses
     quand je le desire. »

     La visite n'a pas besoin de savoir qu'on l'examine : elle expose trois
     gestes, et c'est tout. Le mode essai (visite-essai.js) s'en sert pour
     dessiner sa barre. Rien de tout cela n'existe chez les chanteurs. */
  window.__visite = {
    ou(){
      const a = ARRETS[ici] || {};
      return { arret: Math.max(0, ici), total: ARRETS.length,
               nom: a.nom || '—', enPause: enPause,
               paysage: innerWidth > innerHeight };
    },
    /* aller droit a un arret : on ferme ce qui trainait, on remet le decor
       dans l'etat ou cet arret le trouve, et on le joue depuis le debut. */
    allerA(k){
      k = Math.max(0, Math.min(ARRETS.length - 1, k));
      fil++; arrete = false; enPause = false;
      const p = document.querySelector('#vPause'); if (p) p.remove();
      const d = document.querySelector('#vDemande'); if (d) d.remove();
      try { son.pause(); son.onended = son.onerror = null; } catch(e){}
      eteindreLesHorloges();
      document.body.classList.add('enVisite');
      /* le menu doit etre ouvert pour les arrets qui parlent de lui, ferme
         pour les autres : sinon on eclaire quelque chose d'invisible. */
      const dansLeMenu = /^(7|8)$/.test(String(k));
      document.body.classList.toggle('menu', dansLeMenu);
      const monFil = fil;
      apres(() => jouer(k, monFil), dansLeMenu ? 450 : 120);
    },
    basculerPause(){
      if (enPause){
        const b = document.querySelector('#vPause'); if (b) b.remove();
        enPause = false;
        /* si l'arret n'a pas de son, on ne tente rien : sinon le navigateur se
           plaint d'une bande sans source (vu en essai). */
        if (son.src) son.play().catch(() => {});
      } else { pauser(); }
    },
  };

  /* et on peut la redemander, à tout moment */
  window.revoirLaVisite = () => {
    try { localStorage.removeItem(CLE_VUE); } catch(e){}
    /* on coupe net ce qui tournait peut-etre encore avant de reproposer */
    fil++; arrete = false;
    try { son.pause(); son.onended = son.onerror = null; } catch(e){}
    document.body.classList.remove('enVisite');
    eteindreLaLumiere();
    entree.classList.add('la');
  };
})();
