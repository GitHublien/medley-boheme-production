/* ═══════════════════════════════════════════════════════════════════════════
   LE MODE ESSAI DE LA VISITE — pour que Mickaël puisse me dire, sur place
   (12 septembre 2026)

   Mickaël : « j'ai un peu oublié ce qui était bien, parce que je ne peux pas
   revenir en arrière pour voir les problèmes. Il faudrait un truc de test pour
   voir point par point. Et t'expliquer les choses au fur et à mesure. M'arrêter,
   faire des pauses quand je le désire. »

   Il a raison, et c'était à moi d'y penser avant de lui faire regarder deux
   minutes et demie d'un bloc. Une visite qui se juge d'une traite ne se corrige
   pas : le temps d'arriver au bout, on a oublié le début.

   ★ CE QUE ÇA DONNE

   Une barre d'essai, en bas. Elle ne s'affiche QUE dans ce mode, jamais chez
   les chanteurs.

     ◀   ⏸   ▶      reculer, mettre en pause, avancer — arrêt par arrêt
     ↻              rejouer l'arrêt depuis le début
     ✎ Ça ne va pas  écrire ce qui cloche, ici, maintenant

   Chaque note est rangée avec le NUMÉRO DE L'ARRÊT et son nom. Je n'ai plus à
   deviner de quoi il parle : « arrêt 7, le menu — je n'ai rien vu, ça a glissé
   trop vite » est une phrase que je peux corriger.

   ★ COMMENT IL L'ALLUME

   Une seule fois : ?essai=1 au bout de l'adresse. Ensuite c'est retenu.
   Et un appui long sur « Revoir la visite guidée » l'allume ou l'éteint, pour
   qu'il n'ait jamais à retaper une adresse sur un téléphone.

   ★ COMMENT JE LIS SES NOTES

   Elles sont dans le téléphone (localStorage, « boheme-visite-notes »). Par le
   fil USB je les lis directement. Et le bouton « Envoyer à Mickaël » les met
   dans un message tout prêt, s'il préfère.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  if (!window.__visite) return;              /* la visite n'est pas là : rien à faire */
  const V = window.__visite;
  const CLE_NOTES = 'boheme-visite-notes';

  /* ── le décor de la barre d'essai ───────────────────────────────────────
     Elle vit AU-DESSUS de tout, même du voile : c'est la seule chose de
     l'écran qui doit rester touchable en permanence. */
  const style = document.createElement('style');
  style.textContent = `
    #vEssai{ position:fixed; z-index:200; left:0; right:0;
      bottom:calc(env(safe-area-inset-bottom) + 6px);
      display:flex; align-items:center; justify-content:center; gap:6px;
      padding:0 8px; pointer-events:none; }
    #vEssai > *{ pointer-events:auto; }
    #vEssai button{ border-radius:10px; cursor:pointer;
      border:1px solid rgba(212,175,55,.45); background:rgba(10,9,8,.96);
      color:#f1d27a; font:600 15px system-ui, sans-serif; padding:9px 11px;
      -webkit-tap-highlight-color:transparent; }
    #vEssai button:active{ background:rgba(212,175,55,.2); }
    #vEssai .quoi{ flex:1; min-width:0; font:600 11px/1.25 system-ui, sans-serif;
      color:#cbbf9c; background:rgba(10,9,8,.96); border:1px solid rgba(212,175,55,.28);
      border-radius:10px; padding:6px 9px; text-align:center;
      overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    #vEssai .quoi b{ color:#f1d27a; }
    #vEssai .defaut{ background:rgba(120,30,30,.95); border-color:rgba(255,120,120,.5); color:#ffd9d9; }
    /* la fiche pour écrire ce qui cloche */
    #vNote{ position:fixed; inset:0; z-index:210; display:none; place-items:center;
      background:rgba(4,4,4,.94); padding:6vw; }
    #vNote.la{ display:grid; }
    #vNote .fiche{ width:100%; max-width:30rem; display:grid; gap:.7rem;
      background:rgba(12,11,10,.98); border:1px solid rgba(212,175,55,.4);
      border-radius:1rem; padding:1.1rem; }
    #vNote h3{ margin:0; color:#f1d27a; font:600 1rem system-ui; }
    #vNote .ou{ color:#cbbf9c; font:400 .82rem system-ui; margin:0; }
    #vNote textarea{ width:100%; box-sizing:border-box; min-height:7.5rem; resize:vertical;
      background:#0a0908; color:#f2ead6; border:1px solid rgba(212,175,55,.35);
      border-radius:.6rem; padding:.7rem; font:400 1rem/1.45 system-ui;
      -webkit-user-select:text; user-select:text; }
    #vNote .gestes{ display:flex; gap:.5rem; }
    #vNote .gestes button{ flex:1; padding:.8rem; border-radius:999px; cursor:pointer;
      font:600 .95rem system-ui; border:1px solid rgba(212,175,55,.45); }
    #vNote .garder{ background:linear-gradient(180deg,#f4d97f,#c9a13a); color:#1a1408; }
    #vNote .annuler{ background:rgba(212,175,55,.08); color:#f1d27a; }
    /* la liste des notes déjà prises */
    #vNote .liste{ max-height:32vh; overflow:auto; display:grid; gap:.4rem; }
    #vNote .liste div{ font:400 .78rem/1.4 system-ui; color:#bcb4a2;
      background:rgba(255,255,255,.03); border-radius:.5rem; padding:.45rem .6rem; }
    #vNote .liste b{ color:#f1d27a; }
    /* l'ardoise : le texte de la phrase en cours */
    #vTexte{ position:fixed; z-index:199; left:8px; right:8px;
      bottom:calc(env(safe-area-inset-bottom) + 58px);
      max-height:5.2rem; overflow:auto; -webkit-overflow-scrolling:touch;
      background:rgba(8,7,6,.95); border:1px solid rgba(212,175,55,.28);
      border-radius:10px; padding:8px 11px;
      font:400 12px/1.45 system-ui, sans-serif; color:#ddd5c2;
      -webkit-user-select:text; user-select:text; }
    #vTexte.grand{ max-height:58vh; font-size:15px; line-height:1.6; color:#f2ead6;
      border-color:rgba(212,175,55,.5); }
    #vTexte:empty{ display:none; }`;
  document.head.appendChild(style);

  /* ── la barre ───────────────────────────────────────────────────────── */
  const barre = document.createElement('div');
  barre.id = 'vEssai'; barre.className = 'visiteGarde';
  barre.innerHTML =
      '<button class="prec" title="Arrêt précédent">◀</button>'
    + '<button class="pause" title="Pause">⏸</button>'
    + '<button class="rejouer" title="Rejouer cet arrêt">↻</button>'
    + '<div class="quoi">essai</div>'
    + '<button class="defaut" title="Noter un défaut">✎</button>'
    + '<button class="suiv" title="Arrêt suivant">▶</button>';
  document.body.appendChild(barre);

  const quoi = barre.querySelector('.quoi');
  const boutonPause = barre.querySelector('.pause');

  /* ── LE TEXTE DE CE QU'ELLE DIT ─────────────────────────────────────────
     Mickael : « il faudrait que je puisse voir le texte que tu mets a chaque
     fois. » Il se pose au-dessus de la barre, en petit, et suit les arrets. Un
     appui dessus l'agrandit pour lire tranquillement ; un second le replie.
     Le prenom y est remplace par le vrai, pour que ce soit exactement ce qu'il
     entend. */
  /* ⚠️ 12 septembre, 10 h — Mickael : « je ne veux pas le texte, ca pollue. Ils
     entendent bien. » L'ardoise n'apparait plus a l'ecran ; les textes restent
     lisibles dans le document a cote des sons, c'est la qu'il les relit. */
  const ardoise = document.createElement('div');
  ardoise.id = 'vTexte'; ardoise.className = 'visiteGarde';
  ardoise.style.display = 'none';
  document.body.appendChild(ardoise);
  ardoise.addEventListener('click', () => ardoise.classList.toggle('grand'));

  const PRENOMS = { adrien:'Adrien', stephanie:'Stéphanie', candice:'Candice',
                    mickael:'Mickaël', bry:'Bry', elie:'Élie' };
  let quiEstLa = '';
  try { quiEstLa = (new URLSearchParams(location.search).get('pour')
                 || localStorage.getItem('boheme-pour') || '').toLowerCase(); } catch(e){}

  let dernierTexte = '';
  function direLeTexte(){
    const t = window.TEXTES_VISITE || null;
    if (!t){ ardoise.style.display = 'none'; return; }
    const e = V.ou();
    const cle = (V.cle && V.cle(e.arret)) || '';
    let x = t[cle] || '';
    if (!x){ ardoise.textContent = '(pas de texte pour cet arrêt)'; return; }
    x = x.replace(/\{prénom\}/g, PRENOMS[quiEstLa] || 'toi');
    if (x !== dernierTexte){ ardoise.textContent = x; dernierTexte = x; ardoise.scrollTop = 0; }
  }

  /* ── la fiche de note ───────────────────────────────────────────────── */
  const fiche = document.createElement('div');
  fiche.id = 'vNote'; fiche.className = 'visiteGarde';
  fiche.innerHTML =
      '<div class="fiche">'
    +   '<h3>Qu\'est-ce qui ne va pas ?</h3>'
    +   '<p class="ou"></p>'
    +   '<textarea placeholder="Dicte ou écris… (le micro du clavier marche)"></textarea>'
    +   '<div class="gestes">'
    +     '<button class="garder">Garder cette note</button>'
    +     '<button class="annuler">Fermer</button>'
    +   '</div>'
    +   '<div class="gestes">'
    +     '<button class="partager">Envoyer toutes les notes</button>'
    +     '<button class="vider">Tout effacer</button>'
    +   '</div>'
    +   '<div class="liste"></div>'
    + '</div>';
  document.body.appendChild(fiche);

  const zone = fiche.querySelector('textarea');
  const liste = fiche.querySelector('.liste');

  const lireNotes = () => { try { return JSON.parse(localStorage.getItem(CLE_NOTES) || '[]'); }
                            catch(e){ return []; } };
  const ecrireNotes = (n) => { try { localStorage.setItem(CLE_NOTES, JSON.stringify(n)); } catch(e){} };

  function montrerLesNotes(){
    const n = lireNotes();
    liste.innerHTML = n.length
      ? n.map((x,i) => '<div><b>' + (i+1) + ' · arrêt ' + x.arret + ' — ' + x.nom + '</b><br>'
          + String(x.texte).replace(/</g,'&lt;') + '</div>').reverse().join('')
      : '<div>Aucune note pour l’instant.</div>';
  }

  /* ── ce qu'on voit dans la barre ────────────────────────────────────── */
  function rafraichir(){
    direLeTexte();
    const e = V.ou();
    quoi.innerHTML = '<b>' + (e.arret + 1) + '/' + e.total + '</b> · ' + e.nom;
    boutonPause.textContent = e.enPause ? '▶' : '⏸';
    boutonPause.title = e.enPause ? 'Reprendre' : 'Pause';
  }
  setInterval(rafraichir, 400);

  /* ── les gestes ─────────────────────────────────────────────────────── */
  barre.querySelector('.prec').addEventListener('click', () => { V.allerA(V.ou().arret - 1); rafraichir(); });
  barre.querySelector('.suiv').addEventListener('click', () => { V.allerA(V.ou().arret + 1); rafraichir(); });
  barre.querySelector('.rejouer').addEventListener('click', () => { V.allerA(V.ou().arret); rafraichir(); });
  boutonPause.addEventListener('click', () => { V.basculerPause(); rafraichir(); });

  barre.querySelector('.defaut').addEventListener('click', () => {
    const e = V.ou();
    if (!e.enPause) V.basculerPause();        /* on s'arrête pendant qu'il écrit */
    fiche.querySelector('.ou').textContent =
      'Arrêt ' + (e.arret + 1) + ' sur ' + e.total + ' — ' + e.nom
      + (e.paysage ? ' (téléphone couché)' : ' (téléphone debout)');
    zone.value = '';
    montrerLesNotes();
    fiche.classList.add('la');
    setTimeout(() => zone.focus(), 120);
  });

  fiche.querySelector('.garder').addEventListener('click', () => {
    const t = zone.value.trim();
    if (t){
      const e = V.ou(), n = lireNotes();
      n.push({ arret: e.arret + 1, nom: e.nom, texte: t,
               ecran: innerWidth + '×' + innerHeight,
               quand: new Date().toLocaleString('fr-FR') });
      ecrireNotes(n);
    }
    zone.value = '';
    montrerLesNotes();
    fiche.classList.remove('la');
  });
  fiche.querySelector('.annuler').addEventListener('click', () => fiche.classList.remove('la'));

  /* ── ME LES ENVOYER ─────────────────────────────────────────────────────
     Le chemin le plus sûr reste le câble : je lis notesDeLaVisite() tout seul.
     Mais s'il est loin de l'ordinateur, ce bouton ouvre le partage du téléphone
     — WhatsApp, un message, ce qu'il veut. Et si le partage n'existe pas, on
     recopie dans le presse-papier. */
  fiche.querySelector('.partager').addEventListener('click', async () => {
    const t = window.notesEnTexte();
    if (!t) return;
    const texte = 'Notes de la visite guidée (' + lireNotes().length + ') :\n\n' + t;
    try {
      if (navigator.share) { await navigator.share({ text: texte }); return; }
      await navigator.clipboard.writeText(texte);
      alert('Les notes sont copiées : colle-les où tu veux.');
    } catch(e){ /* il a annulé le partage : rien à faire */ }
  });
  fiche.querySelector('.vider').addEventListener('click', () => {
    if (confirm('Effacer toutes les notes ?')) { window.effacerLesNotes(); }
  });

  /* ── pour que je les récupère ───────────────────────────────────────────
     Trois chemins, du plus simple au plus sûr : le fil USB (je lis tout seul),
     le partage (il me les envoie), et l'affichage (il me les lit). */
  window.notesDeLaVisite = () => lireNotes();
  window.effacerLesNotes = () => { ecrireNotes([]); montrerLesNotes(); return 'notes effacées'; };
  window.notesEnTexte = () => lireNotes()
    .map(x => 'Arrêt ' + x.arret + ' (' + x.nom + ') — ' + x.texte).join('\n');

  rafraichir();
  console.log('MODE ESSAI DE LA VISITE : ◀ ⏸ ↻ ✎ ▶ en bas de l\'écran.');
})();
