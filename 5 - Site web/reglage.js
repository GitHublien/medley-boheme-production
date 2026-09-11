/* ═══════════════════════════════════════════════════════════════════════════
   LE MODE RÉGLAGE — « je te montre, tu notes » (11 septembre 2026)

   Mickaël : « le problème, c'est que toi, tu n'arrives pas à voir où c'est que je
   veux. Est-ce que je peux te montrer ? Peut-être mettre des lignes. »

   Voilà : sur SON téléphone, du doigt, il déplace la barre, il pose des lignes
   d'or là où il veut que ça s'arrête, il règle la taille. Tout est mesuré en
   direct, et un bouton copie le résultat en clair, à me coller.

   On l'allume en ajoutant ?reglage=1 à l'adresse d'une page. Il ne se charge
   jamais autrement : le site normal ne porte pas une ligne de ce fichier.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  const $ = (t, p) => { const e = document.createElement(t); if (p) Object.assign(e.style, p); return e; };
  const R = e => { const b = e.getBoundingClientRect(); return { g:Math.round(b.left), d:Math.round(b.right), h:Math.round(b.top), b:Math.round(b.bottom), l:Math.round(b.width), ht:Math.round(b.height) }; };

  /* ── les marges que le téléphone réserve (appareil photo, barre du bas) ── */
  const sonde = $('div', { position:'fixed', left:'0', top:'0', pointerEvents:'none', opacity:'0',
    padding:'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)' });
  document.body.appendChild(sonde);
  const cs = getComputedStyle(sonde);
  const SYS = { haut:parseFloat(cs.paddingTop)||0, bas:parseFloat(cs.paddingBottom)||0,
                gauche:parseFloat(cs.paddingLeft)||0, droite:parseFloat(cs.paddingRight)||0 };
  sonde.remove();

  /* ── ce qu'on peut déplacer : la barre, et les lignes qu'il pose ───────── */
  const nav = document.querySelector('.nav');
  const bas = document.querySelector('.bas');
  const bouges = {};          /* ce qu'il a changé, en clair */
  const lignes = [];

  /* ── la zone interdite : là où le téléphone mange l'écran ──────────────── */
  if (SYS.haut){
    const z = $('div', { position:'fixed', left:'0', right:'0', top:'0', height:SYS.haut+'px',
      background:'repeating-linear-gradient(45deg, rgba(255,60,60,.22) 0 8px, transparent 8px 16px)',
      borderBottom:'1px dashed rgba(255,80,80,.7)', zIndex:'99990', pointerEvents:'none' });
    const t = $('div', { position:'absolute', right:'6px', bottom:'2px', font:'600 10px system-ui',
      color:'#ff8a8a', letterSpacing:'.05em' }); t.textContent = 'appareil photo · ' + SYS.haut + ' px';
    z.appendChild(t); document.body.appendChild(z);
  }
  if (SYS.gauche){
    const z = $('div', { position:'fixed', left:'0', top:'0', bottom:'0', width:SYS.gauche+'px',
      background:'repeating-linear-gradient(45deg, rgba(255,60,60,.22) 0 8px, transparent 8px 16px)',
      borderRight:'1px dashed rgba(255,80,80,.7)', zIndex:'99990', pointerEvents:'none' });
    document.body.appendChild(z);
  }

  /* ── rendre la barre déplaçable au doigt ───────────────────────────────── */
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
      el.style.transition = 'none';
    }, true);
    el.addEventListener('pointermove', e => {
      if (!d0) return;
      e.preventDefault();
      const x = Math.round(base.x + (e.clientX - d0.x)), y = Math.round(base.y + (e.clientY - d0.y));
      el.style.left = x + 'px'; el.style.top = y + 'px';
      el.style.right = 'auto'; el.style.bottom = 'auto';
      el.style.transform = 'none'; el.style.translate = 'none'; el.style.margin = '0';
      bouges[nom] = { gauche:x, haut:y };
      redire();
    }, true);
    const fin = () => { d0 = null; };
    el.addEventListener('pointerup', fin, true);
    el.addEventListener('pointercancel', fin, true);
  }
  deplacable(nav, 'la barre');
  deplacable(bas, 'la barre du bas');

  /* ── poser une ligne d'or, et la faire glisser ─────────────────────────── */
  function poser(sens){
    const horiz = sens === 'h';
    const l = $('div', { position:'fixed', zIndex:'99992', touchAction:'none',
      background:'linear-gradient(90deg,#f1d27a,#d4af37)', boxShadow:'0 0 10px rgba(212,175,55,.8)' });
    if (horiz){ Object.assign(l.style, { left:'0', right:'0', height:'3px', top:Math.round(innerHeight/2)+'px', cursor:'ns-resize' }); }
    else      { Object.assign(l.style, { top:'0', bottom:'0', width:'3px', left:Math.round(innerWidth/2)+'px', cursor:'ew-resize' }); }
    /* une poignée large : on n'attrape pas un trait de 3 pixels avec un doigt */
    const p = $('div', { position:'absolute', background:'transparent' });
    if (horiz) Object.assign(p.style, { left:'0', right:'0', top:'-16px', height:'35px' });
    else       Object.assign(p.style, { top:'0', bottom:'0', left:'-16px', width:'35px' });
    l.appendChild(p);
    const et = $('div', { position:'absolute', font:'700 11px system-ui', color:'#1a1408',
      background:'linear-gradient(180deg,#f4d97f,#c9a13a)', padding:'2px 7px', borderRadius:'999px', whiteSpace:'nowrap' });
    if (horiz) Object.assign(et.style, { right:'8px', top:'6px' });
    else       Object.assign(et.style, { top:'8px', left:'6px' });
    l.appendChild(et);
    document.body.appendChild(l);
    const no = lignes.length + 1;
    const obj = { no, sens:horiz?'horizontale':'verticale', ou:horiz?Math.round(innerHeight/2):Math.round(innerWidth/2) };
    lignes.push(obj);
    const dire = () => { et.textContent = (horiz ? 'ligne ' + no + ' · y = ' : 'ligne ' + no + ' · x = ') + obj.ou; redire(); };
    dire();
    let actif = false;
    l.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); actif = true; l.setPointerCapture(e.pointerId); }, true);
    l.addEventListener('pointermove', e => {
      if (!actif) return; e.preventDefault();
      if (horiz){ obj.ou = Math.round(e.clientY); l.style.top = obj.ou + 'px'; }
      else      { obj.ou = Math.round(e.clientX); l.style.left = obj.ou + 'px'; }
      dire();
    }, true);
    l.addEventListener('pointerup', () => { actif = false; }, true);
    return l;
  }

  /* ── un curseur pour une mesure ────────────────────────────────────────── */
  function curseur(nom, min, max, valeur, quand){
    const r = $('label', { display:'grid', gap:'2px', font:'500 11px system-ui', color:'#f2ede1' });
    const t = $('span'); const i = document.createElement('input');
    i.type = 'range'; i.min = min; i.max = max; i.value = valeur; i.style.width = '100%'; i.style.accentColor = '#d4af37';
    const dire = () => { t.textContent = nom + ' : ' + i.value + ' px'; bouges[nom] = i.value + ' px'; redire(); };
    i.addEventListener('input', () => { quand(+i.value); dire(); });
    t.textContent = nom + ' : ' + valeur + ' px';
    r.append(t, i); return r;
  }

  /* ── le panneau ────────────────────────────────────────────────────────── */
  const pan = $('div', { position:'fixed', zIndex:'99999', left:'8px', right:'8px', bottom:'8px',
    background:'rgba(10,9,8,.95)', border:'1px solid rgba(212,175,55,.5)', borderRadius:'16px',
    padding:'10px 12px', backdropFilter:'blur(16px)', boxShadow:'0 16px 50px rgba(0,0,0,.7)',
    display:'grid', gap:'7px', maxHeight:'62vh', overflowY:'auto' });
  const titre = $('div', { font:'700 12px system-ui', color:'#f1d27a', letterSpacing:'.08em' });
  titre.textContent = 'MODE RÉGLAGE — montre-moi';
  const info = $('div', { font:'500 11px/1.45 system-ui', color:'#bcb4a2' });
  const boutons = $('div', { display:'flex', gap:'6px', flexWrap:'wrap' });
  function bouton(txt, quand, plein){
    const b = document.createElement('button');
    b.textContent = txt;
    Object.assign(b.style, { flex:'1 1 auto', padding:'9px 10px', borderRadius:'999px', border:'1px solid rgba(212,175,55,.5)',
      background: plein ? 'linear-gradient(180deg,#f4d97f,#c9a13a)' : 'rgba(212,175,55,.1)',
      color: plein ? '#1a1408' : '#f1d27a', font:'600 12px system-ui', cursor:'pointer' });
    b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); quand(); });
    return b;
  }

  function redire(){
    const l = [];
    l.push('Écran : ' + innerWidth + ' × ' + innerHeight + (innerWidth > innerHeight ? ' (couché)' : ' (debout)'));
    l.push('Marges du téléphone : haut ' + SYS.haut + ', bas ' + SYS.bas + ', gauche ' + SYS.gauche + ', droite ' + SYS.droite);
    if (nav){ const r = R(nav); l.push('Barre : gauche ' + r.g + ', haut ' + r.h + ', droite ' + r.d + ', bas ' + r.b + ' (' + r.l + '×' + r.ht + ')'); }
    if (bas && getComputedStyle(bas).display !== 'none'){ const r = R(bas); l.push('Barre du bas : haut ' + r.h + ', bas ' + r.b); }
    lignes.forEach(o => l.push('Ligne ' + o.no + ' (' + o.sens + ') : ' + o.ou));
    Object.keys(bouges).forEach(k => {
      const v = bouges[k];
      l.push('→ ' + k + ' : ' + (typeof v === 'object' ? 'gauche ' + v.gauche + ', haut ' + v.haut : v));
    });
    info.textContent = l.join('\n');
    info.style.whiteSpace = 'pre-line';
  }

  boutons.append(
    bouton('─ ligne', () => poser('h')),
    bouton('│ ligne', () => poser('v')),
    bouton('Tout effacer', () => { document.querySelectorAll('[data-ligne]').forEach(e => e.remove()); location.reload(); }),
  );
  const boutons2 = $('div', { display:'flex', gap:'6px' });
  boutons2.append(
    bouton('📋 Copier pour Claude', async () => {
      const t = 'RÉGLAGES — ' + new Date().toLocaleString('fr-FR') + '\n' + location.pathname.split('/').pop() + '\n\n' + info.textContent;
      try { await navigator.clipboard.writeText(t); alert('Copié. Colle-le dans la conversation.'); }
      catch(e){ const z = document.createElement('textarea'); z.value = t; document.body.appendChild(z); z.select(); document.execCommand('copy'); z.remove(); alert('Copié.'); }
    }, true),
    bouton('Quitter', () => { location.search = location.search.replace(/[?&]reglage=1/, '') || ''; }),
  );

  /* les curseurs qui servent vraiment : où la barre s'arrête, sa taille */
  const reglages = $('div', { display:'grid', gap:'6px' });
  if (nav){
    const d = getComputedStyle(nav);
    reglages.append(
      curseur('distance du haut', 0, 140, Math.round(nav.getBoundingClientRect().top), v => { nav.style.top = v + 'px'; nav.style.bottom = 'auto'; }),
      curseur('largeur de la barre', 60, Math.round(innerWidth), Math.round(nav.getBoundingClientRect().width), v => { nav.style.width = v + 'px'; nav.style.maxWidth = 'none'; }),
      curseur('marge intérieure', 0, 30, Math.round(parseFloat(d.paddingTop) || 0), v => { nav.style.padding = v + 'px'; }),
      curseur('espace entre les ronds', 0, 30, Math.round(parseFloat(d.gap) || 0), v => { nav.style.gap = v + 'px'; }),
    );
  }

  pan.append(titre, boutons, reglages, info, boutons2);
  document.body.appendChild(pan);
  document.body.classList.add('reglageActif');
  redire();
  addEventListener('resize', redire);

  /* on empêche la navigation pendant le réglage : un doigt sur la barre déplace, il n'ouvre pas */
  document.addEventListener('click', e => {
    if (nav && nav.contains(e.target) && document.body.classList.contains('reglageActif')){ e.preventDefault(); e.stopPropagation(); }
  }, true);
})();
