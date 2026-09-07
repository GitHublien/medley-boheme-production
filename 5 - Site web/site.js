/* ═══════════════════════════════════════════════════════════════════════════
   LE SITE BOHÈME — le script commun (7 septembre 2026)
   Il fabrique la navigation (île, menu plein écran, barre du bas), révèle les
   blocs au défilement, anime les calques de l'ouverture, charge les images
   quand elles existent (et laisse un beau fond sinon), et fait suivre le lien
   personnel (?pour=…) de page en page.
   ═══════════════════════════════════════════════════════════════════════════ */
const VERSION_SITE = '07/09/2026 · 22h25';
(function(){
  const PAGES = [
    { f:'ACCUEIL — Bohème.html',        t:'Accueil',        g:'⌂', i:'maison', s:'le hall' },
    { f:'KARAOKE — Medley complet.html', t:'Karaoké',        g:'♪', i:'note', s:'la salle de travail' },
    { f:'LIVRE — Les textes du medley.html', t:'Textes',     g:'¶', i:'livre', s:'le livre, avec la musique' },
    { f:'MISE EN SCÈNE — Bohème.html',  t:'Mise en scène',  g:'◎', i:'scene', s:'qui est où, quand' },
    { f:'DOCUMENTS — Bohème.html',      t:'Documents',      g:'≡', i:'document', s:'à télécharger' },
    { f:'VIDÉOS — Bohème.html',         t:'Vidéos',         g:'▶', i:'lecture', s:'à regarder' },
    { f:'CALENDRIER — Bohème.html',     t:'Calendrier',     g:'✦', i:'etoile', s:'le rendez-vous' },
    { f:'NOUVEAUTÉS — Bohème.html',     t:'Nouveautés',     g:'◌', i:'nouveau', s:'ce qui a changé' },
    { f:'installer.html',               t:'Installer',      g:'⇩', i:'telecharger', s:'l\'application sur ton téléphone' },
  ];
  /* le prénom : dans le lien, sinon celui qu'on a gardé (application installée) */
  let pour = new URLSearchParams(location.search).get('pour');
  try { if (pour) localStorage.setItem('boheme-pour', pour); else pour = localStorage.getItem('boheme-pour') || null; } catch(e){}
  const suite = pour ? '?pour=' + encodeURIComponent(pour) : '';
  const ici = decodeURIComponent(location.pathname.split('/').pop() || '');
  const lien = p => encodeURI(p.f) + suite;

  /* ── la navigation ─────────────────────────────────────────────────── */
  const nav = document.createElement('div'); nav.className = 'nav';
  nav.innerHTML = '<a class="marque" href="' + lien(PAGES[0]) + '"><img src="icone-192.png" alt=""><span>Bohème</span></a>'
    + PAGES.slice(0, 7).map(p => '<a class="l' + (p.f === ici ? ' ici' : '') + '" href="' + lien(p) + '">' + p.t + '</a>').join('')
    + '<button class="burger" aria-label="Menu"><i></i><i></i></button>';
  const voile = document.createElement('div'); voile.className = 'voile';
  voile.innerHTML = '<nav>' + PAGES.map(p => '<a href="' + lien(p) + '"><span><i class="ico ico-' + p.i + '"></i>' + p.t + '</span><small>' + p.s + '</small></a>').join('') + '</nav>';
  const bas = document.createElement('div'); bas.className = 'bas';
  bas.innerHTML = [PAGES[0], PAGES[1], PAGES[2]].map(p => '<a class="' + (p.f === ici ? 'ici' : '') + '" href="' + lien(p) + '"><span class="ico ico-' + p.i + '"></span>' + p.t + '</a>').join('')
    + '<a class="menuBas" href="#"><span>≡</span>Menu</a>';
  document.body.prepend(nav, voile, bas);
  const basculer = () => document.body.classList.toggle('menu');
  nav.querySelector('.burger').addEventListener('click', basculer);
  bas.querySelector('.menuBas').addEventListener('click', e => { e.preventDefault(); basculer(); });
  voile.addEventListener('click', e => { if (e.target === voile) basculer(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('menu')) basculer(); });

  /* ── le pied de page ───────────────────────────────────────────────── */
  const pied = document.createElement('footer');
  pied.innerHTML = '<div class="page"><img src="site-assets/signature-blanc.png" alt="" onerror="this.remove()">'
    + '<div class="liens">' + PAGES.map(p => '<a href="' + lien(p) + '">' + p.t + '</a>').join('') + '</div>'
    + '<p>Bohème Production · Medley Starmania, Notre-Dame de Paris, Les Dix Commandements, Aimer · Palais des Festivals, Cannes, 4 octobre 2026</p></div>';
  document.body.appendChild(pied);


  /* ── les pictogrammes en or remplacent les petits signes des boutons ──── */
  const ICONES = { '→':'fleche', '↗':'fleche', '¶':'livre', '⟳':'maj', '✓':'coche', '✔':'coche', '✦':'etoile',
                   '⇩':'telecharger', '▶':'lecture', '♪':'note', '⌂':'maison', '◎':'scene', '◌':'nouveau' };
  /* les pages écrivent déjà leur pictogramme ; on ne traite que les boutons créés
     à la volée, sinon le signe s'afficherait une fraction de seconde avant d'être
     remplacé — c'est ce clignotement que Mickaël voyait au retour à l'accueil */
  document.querySelectorAll('.btn > b').forEach(b => {
    if (b.querySelector('.ico')) return;
    const n = ICONES[b.textContent.trim()];
    if (n){ const i = document.createElement('span'); i.className = 'ico ico-' + n; b.textContent = ''; b.appendChild(i); }
  });

  /* ── les liens internes gardent le prénom ──────────────────────────── */
  if (suite) document.querySelectorAll('a[href]').forEach(a => {
    const h = a.getAttribute('href');
    if (/^https?:|^#|^mailto:|^tel:/.test(h) || h.includes('?')) return;
    if (/\.html$/i.test(h)) a.setAttribute('href', h + suite);
  });

  /* ── les images : quand elles existent, elles arrivent en fondu ────── */
  /* L'IMAGE SUIT LA ROTATION (7 sept) : l'affiche verticale sur téléphone debout,
     l'horizontale dès qu'on couche le téléphone. Avant, elle était choisie une seule
     fois à l'ouverture : en tournant, on gardait la mauvaise, toute petite au milieu. */
  const debout = () => matchMedia('(max-width: 820px) and (orientation: portrait)').matches;
  function bonneImage(el){
    const p = el.getAttribute('data-img-portrait');
    return (p && debout()) ? p : el.getAttribute('data-img');
  }
  const aImages = [...document.querySelectorAll('[data-img]')];
  aImages.forEach(el => {
    const img = new Image();
    img.onload = () => {
      el.appendChild(img); requestAnimationFrame(() => img.classList.add('la'));
      /* l'affiche porte déjà son titre gravé : le texte de secours s'efface */
      const carte = el.closest('.monde, .ouverture, .tuile, .enTete'); if (carte) carte.classList.add('a-image');
    };
    img.onerror = () => {};       /* pas d'image : le fond dessiné reste */
    img.alt = ''; img.src = bonneImage(el);
    el._img = img;
  });
  function suivreRotation(){
    aImages.forEach(el => {
      if (!el._img || !el.getAttribute('data-img-portrait')) return;
      const veut = bonneImage(el);
      const a = document.createElement('a'); a.href = veut;     /* pour comparer des adresses complètes */
      if (el._img.src === a.href) return;
      el._img.src = veut;
    });
  }
  addEventListener('resize', suivreRotation, { passive: true });
  addEventListener('orientationchange', () => setTimeout(suivreRotation, 80), { passive: true });
  document.querySelectorAll('[data-video]').forEach(el => {
    const v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
    v.src = el.getAttribute('data-video');
    v.addEventListener('canplay', () => { el.appendChild(v); requestAnimationFrame(() => v.classList.add('la')); v.play().catch(() => {}); }, { once: true });
    v.addEventListener('error', () => {});
  });

  /* ── la révélation au défilement ───────────────────────────────────── */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add('vu'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  document.querySelectorAll('.rev').forEach(el => io.observe(el));

  /* ── l'ouverture : deux calques en parallaxe, par transform seulement ── */
  const fond = document.querySelector('.ouverture .fond, .enTete .fond');
  const texte = document.querySelector('.ouverture .texte');
  if (fond && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    let y = 0, demande = false;
    const peindre = () => { demande = false; fond.style.transform = 'translate3d(0,' + (y * .22) + 'px,0)'; if (texte) texte.style.transform = 'translate3d(0,' + (y * .08) + 'px,0)'; };
    addEventListener('scroll', () => { y = Math.min(scrollY, innerHeight * 1.2); if (!demande){ demande = true; requestAnimationFrame(peindre); } }, { passive: true });
  }

  /* l'ouvrier de service force le réseau pour les pages, le style et les scripts :
     sans lui, GitHub Pages fait garder les fichiers dix minutes et la mise à jour tourne en rond */
  if ('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').then(r => r.update()).catch(() => {});
  }

  /* ── LA MISE À JOUR, comme dans le karaoké : un petit mot qui répond ──
     Elle vérifie à l'ouverture, sans déranger, et dit toujours où on en est.
     Les nouveautés du jour allument une pastille sur les pages concernées. */
  const NOUVEAU = ['NOUVEAUTÉS — Bohème.html', 'DOCUMENTS — Bohème.html'];   /* ce qui a changé aujourd'hui */
  const mot = document.createElement('div'); mot.className = 'mot';
  document.body.appendChild(mot);
  let motMinuteur = null;
  function dire(html, duree){
    clearTimeout(motMinuteur); mot.innerHTML = html; mot.classList.add('la');
    if (duree) motMinuteur = setTimeout(() => mot.classList.remove('la'), duree);
  }
  mot.addEventListener('click', () => mot.classList.remove('la'));
  window.direBoheme = dire;

  async function chercherMaj(silencieux){
    if (!silencieux) dire('⟳ Je cherche s\'il y a du nouveau…', 0);
    try {
      /* la version vit dans site.js : c'est lui qu'on interroge, pas la page */
      const r = await fetch('site.js?verif=' + Date.now(), { cache: 'no-store' });
      const t = await r.text();
      const m = t.match(/const VERSION_SITE = '([^']+)'/);
      const enLigne = m ? m[1] : null;
      if (!enLigne){ if (!silencieux) dire('Je n\'ai pas pu vérifier. Réessaie dans un moment.', 5000); return; }
      if (enLigne === VERSION_SITE){
        try { sessionStorage.removeItem('boheme-maj-tentee'); } catch(e){}
        if (!silencieux) dire('✔ Tu as déjà la <b>dernière version</b>.<br><span class="pt">Version ' + VERSION_SITE + '</span>', 5000);
        return;
      }
      /* ─── LE GARDE-FOU (7 sept) ──────────────────────────────────────────
         On ne recharge qu'UNE fois pour une version donnée. Si le navigateur
         resert quand même l'ancien fichier, on ne recommence pas : on le dit. */
      let dejaTentee = null;
      try { dejaTentee = sessionStorage.getItem('boheme-maj-tentee'); } catch(e){}
      if (dejaTentee === enLigne){
        dire('La nouvelle version est prête, mais ton navigateur garde encore l\'ancienne en mémoire.<br>'
           + '<b>Ferme complètement l\'application, puis rouvre-la</b> : elle sera là.', 9000);
        return;
      }
      try { sessionStorage.setItem('boheme-maj-tentee', enLigne); } catch(e){}
      dire('🎉 Une <b>nouvelle version</b> est arrivée !<br>Je l\'installe…', 0);
      /* on vide aussi les caches de l'application avant de recharger */
      setTimeout(async () => {
        try { if (window.caches) for (const n of await caches.keys()) await caches.delete(n); } catch(e){}
        location.replace(location.pathname + '?maj=' + Date.now() + (pour ? '&pour=' + pour : ''));
      }, 1200);
    } catch(e){ if (!silencieux) dire('Pas de réseau pour l\'instant. Réessaie quand tu auras de la connexion.', 5000); }
  }
  window.chercherMajSite = chercherMaj;
  setTimeout(() => chercherMaj(true), 3500);

  /* la pastille rouge sur ce qui a changé, dans le menu et dans la barre du bas */
  /* une page « nouvelle » qu'on a OUVERTE dans cette version n'a plus de pastille : on note qu'on l'a vue */
  const vu = p => { try { return localStorage.getItem('boheme-vu-' + p) === VERSION_SITE; } catch(e){ return false; } };
  try { if (NOUVEAU.includes(ici)) localStorage.setItem('boheme-vu-' + ici, VERSION_SITE); } catch(e){}
  /* et quand tout a été vu, plus une seule pastille nulle part */
  window.toutEstVu = () => NOUVEAU.every(vu);
  function pastiller(){
    document.querySelectorAll('.nav a.l, .voile a, .bas a').forEach(a => {
      const h = decodeURIComponent((a.getAttribute('href') || '').split('?')[0]);
      if (NOUVEAU.includes(h) && !vu(h) && !a.querySelector('.pastille')){
        const i = document.createElement('i'); i.className = 'pastille'; i.title = 'du nouveau ici'; a.appendChild(i);
      }
    });
  }
  pastiller();

  /* ── le bouton « j'ai tout reçu » ───────────────────────────────────── */
  const recu = document.querySelector('[data-recu]');
  if (recu){
    const NUMERO = recu.getAttribute('data-recu');            /* le numéro WhatsApp de Mickaël, au format international sans + */
    const qui = pour ? pour.charAt(0).toUpperCase() + pour.slice(1) : '';
    const msg = encodeURIComponent((qui ? qui + ' : ' : '') + 'j\'ai bien reçu le site Bohème, tout s\'ouvre chez moi.');
    recu.setAttribute('href', NUMERO ? 'https://wa.me/' + NUMERO + '?text=' + msg : 'https://wa.me/?text=' + msg);
    recu.setAttribute('target', '_blank'); recu.setAttribute('rel', 'noopener');
  }
})();
