/* ═══════════════════════════════════════════════════════════════════════════
   LE LECTEUR VIDÉO DE L'APPLICATION (11 septembre 2026)

   Mickaël : « il y a le message "glisser le machin pour sortir du plein écran".
   Ça prouve qu'on est sur un site, tu comprends, quand je vois ça. Et il y a les
   trois petits points pour télécharger la vidéo. Est-ce qu'il n'y aurait pas une
   autre méthode ? »

   Oui, et la voici. Deux choses le trahissaient, et aucune ne venait de nous :
     • le message de glissement est posé par Android dès qu'une page demande le
       VRAI plein écran du système. On ne peut ni l'enlever ni le masquer.
     • les trois points et « télécharger » sont dessinés par Chrome, parce qu'on
       lui laissait faire les boutons (`<video controls>`).

   La réponse : on ne demande plus jamais le plein écran du système, et on dessine
   nos propres boutons. L'application EST déjà en plein écran ; une vidéo qui
   remplit l'écran est donc en plein écran, sans que le système ait son mot à dire.

   Résultat : aucun message, aucun menu à trois points, aucun téléchargement
   possible — et une barre de progression en or où l'on se promène au doigt,
   ce à quoi il tient.

   ⚠️ Sur iPhone, Safari impose son propre lecteur dès qu'une vidéo passe en
   grand. On ne peut rien y faire : c'est une règle d'Apple, pas un oubli.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const mm = (s) => { const m = Math.floor(s / 60), r = Math.floor(s % 60); return m + ':' + (r < 10 ? '0' : '') + r; };

  /* ── la scène : un fond noir qui prend tout, et rien d'autre ──────────── */
  const scene = document.createElement('div');
  scene.className = 'vScene';
  scene.innerHTML =
      '<button class="vRetour" aria-label="Revenir"><i></i><i></i></button>'
    + '<div class="vCadre"><video class="vFilm" playsinline preload="metadata"></video></div>'
    + '<div class="vTourne"><div class="vTel">\u{1F4F1}</div>'
    +   '<div class="vTourneT">Tourne ton téléphone</div>'
    +   '<div class="vTourneS">La vidéo se regarde en <b>mode paysage</b></div></div>'
    + '<div class="vBarre">'
    +   '<button class="vJouer" aria-label="Lecture"></button>'
    +   '<span class="vTemps">0:00</span>'
    +   '<div class="vRail"><div class="vFait"></div><i class="vBoule"></i></div>'
    +   '<span class="vFin">0:00</span>'
    + '</div>';
  document.body.appendChild(scene);

  const film   = scene.querySelector('.vFilm');
  const jouer  = scene.querySelector('.vJouer');
  const rail   = scene.querySelector('.vRail');
  const fait   = scene.querySelector('.vFait');
  const temps  = scene.querySelector('.vTemps');
  const fin    = scene.querySelector('.vFin');
  let origine  = null;          /* la vignette d'où l'on vient */

  /* ── ouvrir / fermer ──────────────────────────────────────────────────── */
  /* ─── LE PAYSAGE, D'OFFICE ─────────────────────────────────────────────
     Mickaël : « je veux qu'elle se mette automatiquement en mode paysage. C'est
     très important, parce que sinon c'est complètement débile, on voit presque
     rien. » Dans l'application installée, Android accepte qu'on lui demande de
     tourner. Dans un simple navigateur, il refuse — alors on invite, avec le
     même petit téléphone qui pivote que dans le film d'ouverture. */
  function demanderPaysage(){
    try {
      const o = screen.orientation;
      if (o && o.lock) return o.lock('landscape').catch(() => {});
    } catch(e){}
    return Promise.resolve();
  }
  function rendreOrientation(){
    try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch(e){}
  }
  const enPaysage = () => innerWidth > innerHeight;
  function juger(){ scene.classList.toggle('aTourner', !enPaysage()); }
  addEventListener('resize', juger);
  addEventListener('orientationchange', () => setTimeout(juger, 200));

  function ouvrir(src, depart){
    origine = depart || null;
    if (film.getAttribute('src') !== src){ film.setAttribute('src', src); film.load(); }
    document.body.classList.add('vOuvert');
    scene.classList.add('la');
    demanderPaysage().then(() => setTimeout(juger, 250));
    juger();
    film.play().catch(() => {});
    dessiner();
    montrerBarre();
  }
  function fermer(){
    film.pause();
    rendreOrientation();
    scene.classList.remove('la');
    document.body.classList.remove('vOuvert');
    /* on rend la place à la vignette, au temps où on l'a laissée */
    if (origine){ try { origine.currentTime = film.currentTime; } catch(e){} }
  }
  scene.querySelector('.vRetour').addEventListener('click', fermer);
  scene.addEventListener('click', e => { if (e.target === scene) fermer(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && scene.classList.contains('la')) fermer(); });

  /* un glissement vers le bas ferme aussi : le geste qu'il connaît déjà */
  let y0 = null;
  scene.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; }, { passive:true });
  scene.addEventListener('touchend', e => {
    if (y0 === null) return;
    const dy = (e.changedTouches[0].clientY - y0);
    y0 = null;
    if (dy > 90 && !rail.contains(e.target)) fermer();
  }, { passive:true });

  /* ─── LA BARRE NE CACHE PLUS LA VIDÉO ──────────────────────────────────
     Mickaël : « le lecteur cache la vidéo. » En paysage la vidéo remplit tout,
     donc la barre se posait forcément dessus. Elle s'efface maintenant au bout
     de trois secondes, et un doigt n'importe où sur l'image la rappelle. */
  let cacher = null;
  function montrerBarre(){
    scene.classList.remove('sansBarre');
    clearTimeout(cacher);
    cacher = setTimeout(() => { if (!film.paused) scene.classList.add('sansBarre'); }, 3000);
  }
  scene.querySelector('.vCadre').addEventListener('click', e => {
    e.stopPropagation();
    if (scene.classList.contains('sansBarre')) montrerBarre();
    else { clearTimeout(cacher); scene.classList.add('sansBarre'); }
  });

  /* ── les boutons ──────────────────────────────────────────────────────── */
  jouer.addEventListener('click', () => { film.paused ? film.play() : film.pause(); montrerBarre(); });
  film.addEventListener('play',  () => { scene.classList.add('joue'); montrerBarre(); });
  film.addEventListener('pause', () => { scene.classList.remove('joue'); montrerBarre(); });
  film.addEventListener('ended', () => scene.classList.remove('joue'));
  film.addEventListener('loadedmetadata', dessiner);
  film.addEventListener('timeupdate', dessiner);

  function dessiner(){
    const d = film.duration || 0, t = film.currentTime || 0;
    fait.style.width = (d ? (t / d) * 100 : 0) + '%';
    temps.textContent = mm(t);
    fin.textContent = d ? mm(d) : '0:00';
  }

  /* ── se promener dans la vidéo, au doigt ──────────────────────────────── */
  let glisse = false;
  const viser = x => {
    const r = rail.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (x - r.left) / r.width));
    if (film.duration) film.currentTime = p * film.duration;
    fait.style.width = (p * 100) + '%';
  };
  rail.addEventListener('pointerdown', e => { glisse = true; montrerBarre(); rail.setPointerCapture(e.pointerId); viser(e.clientX); });
  rail.addEventListener('pointermove', e => { if (glisse) viser(e.clientX); });
  rail.addEventListener('pointerup',   () => { glisse = false; });
  rail.addEventListener('pointercancel', () => { glisse = false; });

  /* ── on prend la main sur toutes les vidéos de la page ────────────────── */
  function adopter(v){
    if (v.closest('.vScene') || v.dataset.adopte) return;
    v.dataset.adopte = '1';
    v.removeAttribute('controls');
    v.setAttribute('playsinline', '');
    v.setAttribute('controlsList', 'nodownload noplaybackrate noremoteplayback');
    v.setAttribute('disablepictureinpicture', '');
    v.style.cursor = 'pointer';
    /* une pastille de lecture posée par-dessus, pour dire qu'on peut toucher */
    const coeur = v.parentElement;
    if (coeur && !coeur.querySelector('.vAppel')){
      coeur.style.position = coeur.style.position || 'relative';
      const p = document.createElement('button');
      p.className = 'vAppel'; p.setAttribute('aria-label', 'Regarder en grand');
      coeur.appendChild(p);
      p.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); v.pause(); ouvrir(v.currentSrc || v.src, v); });
    }
    v.addEventListener('click', e => { e.preventDefault(); v.pause(); ouvrir(v.currentSrc || v.src, v); });
  }
  const balayer = () => document.querySelectorAll('video').forEach(adopter);
  balayer();
  /* les pages qui ajoutent des vidéos plus tard sont servies aussi */
  new MutationObserver(balayer).observe(document.documentElement, { childList:true, subtree:true });
})();
