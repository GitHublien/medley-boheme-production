/* ═══════════════════════════════════════════════════════════════════════════
   LE MODE RÉGLAGE — « je te montre, tu notes » (11 septembre 2026, refait à 6 h)

   Mickaël, après le premier essai : « il y a un truc énorme devant, je ne peux
   pas voir. La distance du haut, il faudrait aller plus loin. La marge intérieure,
   j'ai l'impression qu'elle ne marche pas. L'espace entre les ronds, je ne vois
   rien qui bouge. Et si je fais une ligne, il faut que je puisse l'effacer.
   Donne-moi beaucoup plus d'options. »

   Ce qui a changé :
   • Le panneau est REPLIÉ par défaut, derrière une petite pastille d'or. On
     l'ouvre, on règle, on le referme pour VOIR. Il ne couvre plus l'écran.
   • Onze réglages au lieu de quatre, et qui vont beaucoup plus loin (le haut
     va jusqu'en bas de l'écran).
   • Chaque réglage est posé en « important » : sinon le style du site gagnait et
     rien ne bougeait — c'était le cas de la marge et de l'espace entre les ronds.
   • Chaque ligne posée porte sa croix : on l'efface d'un doigt.

   On l'allume avec ?reglage=1 sur n'importe quelle page. Il se retient ensuite
   de page en page. Le site normal ne charge jamais une ligne de ce fichier.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const $ = (t, p) => { const e = document.createElement(t); if (p) Object.assign(e.style, p); return e; };
  const nb = v => Math.round(v);
  const cadre = e => { const b = e.getBoundingClientRect();
    return { g:nb(b.left), d:nb(b.right), h:nb(b.top), b:nb(b.bottom), l:nb(b.width), ht:nb(b.height) }; };
  /* ─── DEBOUT ET COUCHÉ SONT DEUX RÉGLAGES SÉPARÉS (11 sept, 7 h) ──────────
     Mickaël : « quand je touche au paysage, ça touche aussi au portrait, et ça
     je ne veux surtout pas. Il faut que ce soit deux choses totalement
     différentes. » Chaque réglage est donc rangé dans SON sens. Quand on tourne
     le téléphone, on efface tout ce qu'on avait posé et on remet celui de
     l'autre sens — les deux ne se mélangent jamais. */
  const SENS = () => (innerWidth > innerHeight ? 'couché' : 'debout');
  let sensActuel = SENS();
  const memo = { debout:new Map(), 'couché':new Map() };
  const clef = el => el === nav ? 'nav' : el === bas ? 'bas' : (el.dataset.reglageId ||
    (el.dataset.reglageId = 'e' + Math.random().toString(36).slice(2, 8)));
  const vus = new Map();          /* tout ce qu'on a touché, pour savoir quoi effacer */

  function pose(el, prop, val){
    if (!el) return;
    el.style.setProperty(prop, val, 'important');
    const m = memo[sensActuel], k = clef(el);
    if (!m.has(k)) m.set(k, { el, props:{} });
    m.get(k).props[prop] = val;
    if (!vus.has(k)) vus.set(k, { el, props:new Set() });
    vus.get(k).props.add(prop);
  }

  /* on efface tout ce qu'on a posé, puis on remet celui du sens demandé */
  function basculer(sens){
    vus.forEach(o => o.props.forEach(p => o.el.style.removeProperty(p)));
    sensActuel = sens;
    memo[sens].forEach(o => Object.keys(o.props).forEach(p => o.el.style.setProperty(p, o.props[p], 'important')));
  }

  /* ── les marges que le téléphone réserve (appareil photo, barre du bas) ── */
  const sonde = $('div', { position:'fixed', left:'0', top:'0', pointerEvents:'none', opacity:'0',
    padding:'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)' });
  document.body.appendChild(sonde);
  const c0 = getComputedStyle(sonde);
  const SYS = { haut:parseFloat(c0.paddingTop)||0, bas:parseFloat(c0.paddingBottom)||0,
                gauche:parseFloat(c0.paddingLeft)||0, droite:parseFloat(c0.paddingRight)||0 };
  sonde.remove();

  const nav = document.querySelector('.nav');
  const bas = document.querySelector('.bas');
  const marque = nav && nav.querySelector('.marque');
  const ronds = nav ? [...nav.querySelectorAll('.marque, .rond, .musique .mRond, .burger')] : [];
  const bouges = {};
  const lignes = [];

  /* ── les zones que le téléphone mange, en rouge hachuré ────────────────── */
  function zoneSysteme(style, texte){
    const z = $('div', Object.assign({ position:'fixed', zIndex:'99990', pointerEvents:'none',
      background:'repeating-linear-gradient(45deg, rgba(255,60,60,.20) 0 8px, transparent 8px 16px)' }, style));
    if (texte){ const t = $('div', { position:'absolute', right:'6px', bottom:'2px',
      font:'600 10px system-ui', color:'#ff8a8a' }); t.textContent = texte; z.appendChild(t); }
    document.body.appendChild(z); return z;
  }
  if (SYS.haut)   zoneSysteme({ left:'0', right:'0', top:'0', height:SYS.haut+'px',
                    borderBottom:'1px dashed rgba(255,80,80,.7)' }, 'appareil photo · ' + SYS.haut + ' px');
  if (SYS.gauche) zoneSysteme({ left:'0', top:'0', bottom:'0', width:SYS.gauche+'px',
                    borderRight:'1px dashed rgba(255,80,80,.7)' }, null);
  if (SYS.bas)    zoneSysteme({ left:'0', right:'0', bottom:'0', height:SYS.bas+'px',
                    borderTop:'1px dashed rgba(255,80,80,.7)' }, null);

  /* ── déplacer la barre au doigt ────────────────────────────────────────── */
  function deplacable(el, nom){
    if (!el) return;
    let d0 = null, base = null;
    el.style.touchAction = 'none';
    el.addEventListener('pointerdown', e => {
      if (!document.body.classList.contains('reglageActif')) return;
      e.preventDefault(); e.stopPropagation();
      el.setPointerCapture(e.pointerId);
      const b = el.getBoundingClientRect();
      d0 = { x:e.clientX, y:e.clientY }; base = { x:b.left, y:b.top };
      pose(el, 'transition', 'none');
    }, true);
    el.addEventListener('pointermove', e => {
      if (!d0) return;
      e.preventDefault();
      const x = nb(base.x + (e.clientX - d0.x)), y = nb(base.y + (e.clientY - d0.y));
      pose(el, 'left', x + 'px'); pose(el, 'top', y + 'px');
      pose(el, 'right', 'auto'); pose(el, 'bottom', 'auto');
      pose(el, 'transform', 'none'); pose(el, 'translate', 'none'); pose(el, 'margin', '0');
      bouges[nom + ' déplacée'] = 'gauche ' + x + ', haut ' + y;
      redire();
    }, true);
    const fin = () => { d0 = null; };
    el.addEventListener('pointerup', fin, true);
    el.addEventListener('pointercancel', fin, true);
  }
  deplacable(nav, 'la barre');
  deplacable(bas, 'la barre du bas');

  /* ── une ligne d'or, qu'on pose, qu'on glisse, qu'on efface ────────────── */
  function poser(horiz){
    const l = $('div', { position:'fixed', zIndex:'99992', touchAction:'none',
      background:'linear-gradient(90deg,#f1d27a,#d4af37)', boxShadow:'0 0 10px rgba(212,175,55,.85)' });
    const depart = horiz ? nb(innerHeight/2) : nb(innerWidth/2);
    if (horiz) Object.assign(l.style, { left:'0', right:'0', height:'3px', top:depart+'px' });
    else       Object.assign(l.style, { top:'0', bottom:'0', width:'3px', left:depart+'px' });
    /* une poignée large : un doigt n'attrape pas un trait de 3 pixels */
    const p = $('div', { position:'absolute', background:'transparent' });
    if (horiz) Object.assign(p.style, { left:'0', right:'0', top:'-18px', height:'39px' });
    else       Object.assign(p.style, { top:'0', bottom:'0', left:'-18px', width:'39px' });
    l.appendChild(p);
    /* l'étiquette, avec sa croix pour effacer CETTE ligne */
    const et = $('div', { position:'absolute', display:'flex', alignItems:'center', gap:'5px',
      font:'700 11px system-ui', color:'#1a1408', background:'linear-gradient(180deg,#f4d97f,#c9a13a)',
      padding:'3px 4px 3px 8px', borderRadius:'999px', whiteSpace:'nowrap' });
    if (horiz) Object.assign(et.style, { right:'10px', top:'7px' });
    else       Object.assign(et.style, { top:'10px', left:'7px' });
    const txt = $('span');
    const x = document.createElement('button');
    Object.assign(x.style, { width:'19px', height:'19px', borderRadius:'50%', border:'0', cursor:'pointer',
      background:'rgba(0,0,0,.35)', color:'#f4e3ae', font:'700 12px system-ui', lineHeight:'1', padding:'0' });
    x.textContent = '✕';
    et.append(txt, x); l.appendChild(et);
    document.body.appendChild(l);

    const obj = { no:lignes.length + 1, sens:horiz ? 'horizontale' : 'verticale', ou:depart, el:l };
    lignes.push(obj);
    const dire = () => { txt.textContent = 'ligne ' + obj.no + ' · ' + (horiz ? 'y = ' : 'x = ') + obj.ou; redire(); };
    obj.redire = dire;
    dire();

    x.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); }, true);
    x.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      l.remove();
      const k = lignes.indexOf(obj); if (k >= 0) lignes.splice(k, 1);
      lignes.forEach((o, i) => { o.no = i + 1; o.redire(); });
      redire();
    }, true);

    let actif = false;
    l.addEventListener('pointerdown', e => {
      if (e.target === x) return;
      e.preventDefault(); e.stopPropagation(); actif = true; l.setPointerCapture(e.pointerId);
    }, true);
    l.addEventListener('pointermove', e => {
      if (!actif) return; e.preventDefault();
      if (horiz){ obj.ou = nb(e.clientY); l.style.top = obj.ou + 'px'; }
      else      { obj.ou = nb(e.clientX); l.style.left = obj.ou + 'px'; }
      dire();
    }, true);
    l.addEventListener('pointerup', () => { actif = false; }, true);
  }

  /* ── un réglage : nom, bornes, ce qu'il fait ───────────────────────────── */
  const reglages = $('div', { display:'grid', gap:'5px' });
  function curseur(nom, min, max, valeur, quand, unite){
    const u = unite === undefined ? ' px' : unite;
    const r = $('label', { display:'grid', gap:'1px', font:'500 10.5px system-ui', color:'#f2ede1' });
    const t = $('span', { color:'#e8dcc0' });
    const i = document.createElement('input');
    i.type = 'range'; i.min = min; i.max = max; i.value = valeur;
    Object.assign(i.style, { width:'100%', accentColor:'#d4af37', height:'22px', margin:'0' });
    const dire = () => { t.textContent = nom + ' : ' + i.value + u;
      bouges['[' + sensActuel + '] ' + nom] = i.value + u; redire(); };
    i.addEventListener('input', () => { quand(+i.value); dire(); });
    t.textContent = nom + ' : ' + valeur + u;
    r.append(t, i); reglages.appendChild(r);
  }

  /* ── le panneau, replié par défaut ─────────────────────────────────────── */
  const pan = $('div', { position:'fixed', zIndex:'99999', left:'8px', right:'8px', bottom:'66px',
    background:'rgba(10,9,8,.92)', border:'1px solid rgba(212,175,55,.5)', borderRadius:'16px',
    padding:'9px 11px', backdropFilter:'blur(14px)', boxShadow:'0 16px 50px rgba(0,0,0,.7)',
    display:'none', gap:'6px', maxHeight:'52vh', overflowY:'auto' });
  const titre = $('div', { font:'700 11px system-ui', color:'#f1d27a', letterSpacing:'.08em' });
  titre.textContent = 'MODE RÉGLAGE — montre-moi';
  const info = $('div', { font:'500 10.5px/1.4 system-ui', color:'#bcb4a2', whiteSpace:'pre-line' });

  function bouton(txt, quand, plein){
    const b = document.createElement('button');
    b.textContent = txt;
    Object.assign(b.style, { flex:'1 1 auto', padding:'8px 9px', borderRadius:'999px',
      border:'1px solid rgba(212,175,55,.5)',
      background: plein ? 'linear-gradient(180deg,#f4d97f,#c9a13a)' : 'rgba(212,175,55,.1)',
      color: plein ? '#1a1408' : '#f1d27a', font:'600 11px system-ui', cursor:'pointer' });
    b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); quand(); });
    return b;
  }

  function redire(){
    const l = [];
    l.push('Écran : ' + innerWidth + ' × ' + innerHeight + (innerWidth > innerHeight ? ' (couché)' : ' (debout)'));
    l.push('Marges du téléphone : haut ' + SYS.haut + ' · bas ' + SYS.bas + ' · gauche ' + SYS.gauche + ' · droite ' + SYS.droite);
    if (nav){ const r = cadre(nav); l.push('Barre : gauche ' + r.g + ' · haut ' + r.h + ' · droite ' + r.d + ' · bas ' + r.b + '  (' + r.l + '×' + r.ht + ')'); }
    if (bas && getComputedStyle(bas).display !== 'none'){ const r = cadre(bas); l.push('Barre du bas : haut ' + r.h + ' · bas ' + r.b); }
    lignes.forEach(o => l.push('Ligne ' + o.no + ' (' + o.sens + ') : ' + o.ou));
    const k = Object.keys(bouges);
    if (k.length){ l.push('— ce que j\'ai réglé —'); k.forEach(n => l.push('  ' + n + ' : ' + bouges[n])); }
    info.textContent = l.join('\n');
  }

  const rangee1 = $('div', { display:'flex', gap:'5px' });
  rangee1.append(
    bouton('─ ligne', () => poser(true)),
    bouton('│ ligne', () => poser(false)),
    bouton('↶ dernière', () => { const o = lignes.pop(); if (o){ o.el.remove(); redire(); } }),
  );
  const rangee2 = $('div', { display:'flex', gap:'5px' });
  rangee2.append(
    bouton('📋 Copier pour Claude', async () => {
      const t = 'RÉGLAGES — ' + new Date().toLocaleString('fr-FR') + '\n'
              + decodeURIComponent(location.pathname.split('/').pop()) + '\n\n' + info.textContent;
      try { await navigator.clipboard.writeText(t); alert('Copié. Colle-le dans la conversation.'); }
      catch(e){ const z = document.createElement('textarea'); z.value = t;
        document.body.appendChild(z); z.select(); document.execCommand('copy'); z.remove(); alert('Copié.'); }
    }, true),
  );
  const rangee3 = $('div', { display:'flex', gap:'5px' });
  rangee3.append(
    bouton('Tout remettre', () => location.reload()),
    bouton('Quitter', () => {
      try { sessionStorage.removeItem('boheme-reglage'); } catch(e){}
      location.search = location.search.replace(/[?&]reglage=1/, '') || '';
    }),
  );

  /* ── les onze réglages, refabriqués à chaque changement de sens ────────── */
  function poserReglages(){
  reglages.textContent = '';
  if (nav){
    const d = getComputedStyle(nav);
    const r0 = nav.getBoundingClientRect();
    curseur('distance du haut', 0, nb(innerHeight), nb(r0.top),
      v => { pose(nav, 'top', v + 'px'); pose(nav, 'bottom', 'auto'); });
    curseur('distance de la gauche', -40, nb(innerWidth), nb(r0.left),
      v => { pose(nav, 'left', v + 'px'); pose(nav, 'right', 'auto');
             pose(nav, 'transform', 'none'); pose(nav, 'translate', 'none'); });
    curseur('largeur de la barre', 50, nb(innerWidth), nb(r0.width),
      v => { pose(nav, 'width', v + 'px'); pose(nav, 'max-width', 'none'); });
    curseur('hauteur de la barre', 40, nb(innerHeight), nb(r0.height),
      v => { pose(nav, 'height', v + 'px'); pose(nav, 'max-height', 'none'); });
    curseur('marge intérieure', 0, 60, nb(parseFloat(d.paddingTop) || 0),
      v => pose(nav, 'padding', v + 'px'));
    curseur('espace entre les ronds', 0, 60, nb(parseFloat(d.rowGap || d.gap) || 0),
      v => pose(nav, 'gap', v + 'px'));
    curseur('arrondi de la barre', 0, 60, nb(parseFloat(d.borderTopLeftRadius) || 0),
      v => pose(nav, 'border-radius', v + 'px'));
    curseur('taille des ronds', 20, 100, ronds[1] ? nb(ronds[1].getBoundingClientRect().height) : 46,
      v => ronds.forEach(e => {
        if (e.classList.contains('marque')) pose(e, 'height', v + 'px');
        else { pose(e, 'width', v + 'px'); pose(e, 'height', v + 'px'); }
      }));
    if (marque){
      const sp = marque.querySelector('span');
      if (sp) curseur('taille du mot « Bohème »', 0, 34,
        nb(parseFloat(getComputedStyle(sp).fontSize) || 16),
        v => { pose(sp, 'font-size', v + 'px'); pose(sp, 'display', v ? 'inline' : 'none');
               pose(sp, 'line-height', '1.3'); });
    }
    curseur('fond de la barre', 0, 100,
      nb((parseFloat((d.backgroundColor.match(/([\d.]+)\)$/) || [0, '1'])[1]) || 1) * 100),
      v => pose(nav, 'background', 'rgba(12,11,10,' + (v / 100) + ')'), ' %');
  }
  if (bas && getComputedStyle(bas).display !== 'none'){
    const rb = bas.getBoundingClientRect();
    curseur('barre du bas · distance du bas', 0, 300, nb(innerHeight - rb.bottom),
      v => { pose(bas, 'bottom', v + 'px'); pose(bas, 'top', 'auto'); });
  }
  }
  poserReglages();

  pan.append(titre, rangee1, reglages, info, rangee2, rangee3);
  document.body.appendChild(pan);

  /* ── la pastille : on ouvre, on règle, on referme pour VOIR ────────────── */
  let ouvert = false;
  const pastille = $('div', { position:'fixed', zIndex:'100000', right:'10px', bottom:'10px',
    width:'48px', height:'48px', borderRadius:'50%', display:'grid', placeItems:'center',
    background:'linear-gradient(180deg,#f4d97f,#c9a13a)', color:'#1a1408',
    font:'700 19px system-ui', boxShadow:'0 8px 28px rgba(0,0,0,.75)', cursor:'pointer',
    userSelect:'none' });
  const montrer = v => { ouvert = v; pan.style.display = v ? 'grid' : 'none'; pastille.textContent = v ? '✕' : '⚙'; };
  pastille.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); montrer(!ouvert); });
  document.body.appendChild(pastille);
  montrer(false);

  document.body.classList.add('reglageActif');
  redire();
  /* On surveille la rotation de TROIS façons : « resize » arrive parfois avant que
     le téléphone ait fini de tourner (mesuré le 11/09 : il annonçait encore
     « debout » alors que l'écran était déjà couché). La question posée au
     navigateur — est-on en paysage ? — est la seule qui ne se trompe jamais. */
  const verifier = () => {
    const s = SENS();
    if (s !== sensActuel){ basculer(s); poserReglages(); }
    redire();
  };
  addEventListener('resize', () => { verifier(); setTimeout(verifier, 250); });
  addEventListener('orientationchange', () => setTimeout(verifier, 250));
  matchMedia('(orientation: landscape)').addEventListener('change', () => setTimeout(verifier, 120));

  /* pendant le réglage, un doigt sur la barre la déplace — il n'ouvre pas la page */
  document.addEventListener('click', e => {
    if (nav && nav.contains(e.target) && document.body.classList.contains('reglageActif')){
      e.preventDefault(); e.stopPropagation();
    }
  }, true);
})();
