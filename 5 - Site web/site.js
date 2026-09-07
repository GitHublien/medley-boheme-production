/* ═══════════════════════════════════════════════════════════════════════════
   LE SITE BOHÈME — le script commun (7 septembre 2026)
   Il fabrique la navigation (île, menu plein écran, barre du bas), révèle les
   blocs au défilement, anime les calques de l'ouverture, charge les images
   quand elles existent (et laisse un beau fond sinon), et fait suivre le lien
   personnel (?pour=…) de page en page.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const PAGES = [
    { f:'ACCUEIL — Bohème.html',        t:'Accueil',        g:'⌂', s:'le hall' },
    { f:'KARAOKE — Medley complet.html', t:'Karaoké',        g:'♪', s:'la salle de travail' },
    { f:'LIVRE — Les textes du medley.html', t:'Textes',     g:'¶', s:'le livre, avec la musique' },
    { f:'MISE EN SCÈNE — Bohème.html',  t:'Mise en scène',  g:'◎', s:'qui est où, quand' },
    { f:'DOCUMENTS — Bohème.html',      t:'Documents',      g:'≡', s:'à télécharger' },
    { f:'VIDÉOS — Bohème.html',         t:'Vidéos',         g:'▶', s:'à regarder' },
    { f:'CALENDRIER — Bohème.html',     t:'Calendrier',     g:'✦', s:'le rendez-vous' },
    { f:'NOUVEAUTÉS — Bohème.html',     t:'Nouveautés',     g:'◌', s:'ce qui a changé' },
    { f:'INSTALLER — Bohème.html',      t:'Installer',      g:'⇩', s:'l\'application sur ton téléphone' },
  ];
  const pour = new URLSearchParams(location.search).get('pour');
  const suite = pour ? '?pour=' + encodeURIComponent(pour) : '';
  const ici = decodeURIComponent(location.pathname.split('/').pop() || '');
  const lien = p => encodeURI(p.f) + suite;

  /* ── la navigation ─────────────────────────────────────────────────── */
  const nav = document.createElement('div'); nav.className = 'nav';
  nav.innerHTML = '<a class="marque" href="' + lien(PAGES[0]) + '"><img src="icone-192.png" alt=""><span>Bohème</span></a>'
    + PAGES.slice(0, 7).map(p => '<a class="l' + (p.f === ici ? ' ici' : '') + '" href="' + lien(p) + '">' + p.t + '</a>').join('')
    + '<button class="burger" aria-label="Menu"><i></i><i></i></button>';
  const voile = document.createElement('div'); voile.className = 'voile';
  voile.innerHTML = '<nav>' + PAGES.map(p => '<a href="' + lien(p) + '"><span>' + p.t + '</span><small>' + p.s + '</small></a>').join('') + '</nav>';
  const bas = document.createElement('div'); bas.className = 'bas';
  bas.innerHTML = [PAGES[0], PAGES[1], PAGES[2]].map(p => '<a class="' + (p.f === ici ? 'ici' : '') + '" href="' + lien(p) + '"><span>' + p.g + '</span>' + p.t + '</a>').join('')
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

  /* ── les liens internes gardent le prénom ──────────────────────────── */
  if (suite) document.querySelectorAll('a[href]').forEach(a => {
    const h = a.getAttribute('href');
    if (/^https?:|^#|^mailto:|^tel:/.test(h) || h.includes('?')) return;
    if (/\.html$/i.test(h)) a.setAttribute('href', h + suite);
  });

  /* ── les images : quand elles existent, elles arrivent en fondu ────── */
  const debout = matchMedia('(max-width: 700px) and (orientation: portrait)').matches;
  document.querySelectorAll('[data-img]').forEach(el => {
    /* sur téléphone debout, la version verticale de l'affiche si elle existe */
    const src = (debout && el.getAttribute('data-img-portrait')) || el.getAttribute('data-img');
    const img = new Image();
    img.onload = () => {
      el.appendChild(img); requestAnimationFrame(() => img.classList.add('la'));
      /* l'affiche porte déjà son titre gravé : le texte de secours s'efface */
      const carte = el.closest('.monde, .ouverture, .tuile, .enTete'); if (carte) carte.classList.add('a-image');
    };
    img.onerror = () => {};       /* pas d'image : le fond dessiné reste */
    img.alt = ''; img.src = src;
  });
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

  /* ── la mise à jour, sur le site aussi ──────────────────────────────── */
  (function(){
    const b = document.createElement('button'); b.className = 'btn doux maj';
    b.innerHTML = 'Mise à jour <b>⟳</b>';
    b.title = 'Va chercher la dernière version du site';
    b.onclick = async () => {
      b.innerHTML = 'Je cherche… <b>⟳</b>';
      try {
        const r = await fetch(location.pathname + '?verif=' + Date.now(), { cache: 'no-store' });
        const t = await r.text();
        const ici = document.documentElement.outerHTML.length, la = t.length;
        b.innerHTML = (Math.abs(ici - la) > 40) ? 'Nouvelle version ! <b>⟳</b>' : 'Tu as la dernière <b>✓</b>';
        if (Math.abs(ici - la) > 40) setTimeout(() => location.reload(true), 900);
        else setTimeout(() => { b.innerHTML = 'Mise à jour <b>⟳</b>'; }, 3000);
      } catch(e){ b.innerHTML = 'Pas de réseau <b>!</b>'; setTimeout(() => { b.innerHTML = 'Mise à jour <b>⟳</b>'; }, 3000); }
    };
    const poser = () => { const p = document.querySelector('footer .page'); if (p) p.insertBefore(b, p.querySelector('.liens')); else setTimeout(poser, 200); };
    setTimeout(poser, 60);
  })();

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
