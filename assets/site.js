/* Gokce Inal — v8 site script: one page, EN/TR, section constellations on the left, project details, media globe. */
(function () {
  'use strict';

  /* ---- settings to fill in ---- */
  const SITE = {
    email: 'inal.5@osu.edu',
    cv: 'assets/cv.pdf'     // add your CV here
  };

  const doc = document.documentElement;
  doc.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

  /* ---- toast ---- */
  let toastEl, toastT;
  function toast(msg, tr) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = doc.lang === 'tr' && tr ? tr : msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* ---- EN / TR: every text block carries its Turkish version in data-tr ---- */
  const store = { get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} } };
  const units = $$('[data-tr]'); units.forEach(el => { el._en = el.innerHTML; });
  const T = (en, tr) => doc.lang === 'tr' ? tr : en;
  function setLang(l) {
    doc.lang = l;
    units.forEach(el => { el.innerHTML = l === 'tr' ? el.dataset.tr : el._en; });
    $$('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === l ? 'true' : 'false'));
    if (menuBtn) menuBtn.textContent = nav && nav.classList.contains('open') ? T('Close', 'Kapat') : T('Menu', 'Menü');
    store.set('lang', l);
    document.dispatchEvent(new CustomEvent('langchange'));
  }

  /* ---- header: transparent at the top, solid once scrolled; mobile menu ---- */
  const head = $('.site-head');
  const onScroll = () => { if (head) head.classList.toggle('solid', scrollY > 24); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const menuBtn = $('.menu-btn'), nav = $('.nav');
  const closeMenu = () => { if (!nav || !nav.classList.contains('open')) return; nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = T('Menu', 'Menü'); document.body.style.overflow = ''; };
  if (menuBtn && nav) menuBtn.addEventListener('click', () => { const open = nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', open); menuBtn.textContent = open ? T('Close', 'Kapat') : T('Menu', 'Menü'); document.body.style.overflow = open ? 'hidden' : ''; });
  if (nav) nav.addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) closeMenu(); });
  $$('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  setLang(store.get('lang') || ((navigator.language || '').toLowerCase().startsWith('tr') ? 'tr' : 'en'));
  // one page: the menu item of the part being read is marked as current
  const pgs = $$('main > section.sec'), MAP = { research: 'research', speaking: 'speaking', media: 'media', about: 'about', contact: 'contact' };
  let curP = null;
  function markNav() {
    let cur = null; const line = innerHeight * 0.4;
    pgs.forEach(p => { if (p.getBoundingClientRect().top <= line) cur = p.id; });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = 'contact';
    const id = MAP[cur] || null; if (id === curP) return; curP = id;
    $$('.nav .top').forEach(a => { if (a.dataset.p === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  }
  addEventListener('scroll', markNav, { passive: true }); addEventListener('resize', markNav); markNav();

  /* ---- email + CV ---- */
  $$('[data-email]').forEach(el => {
    if (SITE.email) { el.innerHTML = ''; const a = document.createElement('a'); a.href = 'mailto:' + SITE.email; a.textContent = SITE.email; a.className = 'link'; el.appendChild(a); }
  });
  let cvOk = false;
  document.addEventListener('click', async e => {
    const a = e.target.closest('a[data-cv]'); if (!a || cvOk) return;
    e.preventDefault();
    try { const r = await fetch(SITE.cv, { method: 'HEAD' }); if (r.ok) { cvOk = true; location.href = SITE.cv; return; } } catch (_) {}
    toast('The CV will be posted here soon.', 'CV yakında burada olacak.');
  });

  /* ---- gentle reveal ---- */
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  } else $$('.reveal').forEach(el => el.classList.add('in'));

  /* ---- soft page transitions between our own pages ---- */
  $$('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || a.target === '_blank' || a.hasAttribute('data-cv') || !/\.html(#.*)?$/.test(href)) return;
    a.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || reduce) return;
      e.preventDefault(); document.body.classList.add('leaving'); setTimeout(() => { location.href = href; }, 240);
    });
  });
  addEventListener('pageshow', () => document.body.classList.remove('leaving'));

  /* ---------- star sprites shared by the constellations ---------- */
  function sprite(rgb, size, stops) { const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'), h = size / 2, r = g.createRadialGradient(h, h, 0, h, h, h); stops.forEach(([o, a]) => r.addColorStop(o, `rgba(${rgb},${a})`)); g.fillStyle = r; g.fillRect(0, 0, size, size); return c; }
  const STAR = sprite('255,250,244', 64, [[0, 1], [0.1, 0.9], [0.22, 0.38], [0.5, 0.08], [1, 0]]);

  /* ---------- section constellations: stars brighten one by one, then the lines are drawn ---------- */
  const circle = (cx, cy, r, n, a0 = 0, a1 = 6.2832) => Array.from({ length: n }, (_, i) => { const a = a0 + (a1 - a0) * i / (a1 - a0 > 6.28 ? n : n - 1); return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
  const ellipse = (cx, cy, rx, ry, rot, n, a0 = 0, a1 = 6.2832) => Array.from({ length: n }, (_, i) => { const a = a0 + (a1 - a0) * i / (a1 - a0 > 6.28 ? n : n - 1), x = rx * Math.cos(a), y = ry * Math.sin(a); return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; });
  const quad = (p0, c, p1, n) => Array.from({ length: n }, (_, i) => { const t = i / (n - 1), u = 1 - t; return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]]; });
  const dishA = ellipse(-0.12, -0.12, 0.62, 0.24, -0.62, 2, 0, Math.PI);
  const ICONS = {
    question: [{ pts: [[-0.8, 0.3], [-0.35, -0.45], [0.15, 0.05], [0.7, -0.6]] }, { pts: [[-0.35, -0.45], [-0.1, 0.62], [0.15, 0.05], [0.8, 0.4]] }, { pts: [[-0.8, 0.3], [-0.1, 0.62]], minor: 1 }, { pts: [[0.7, -0.6], [0.8, 0.4]], minor: 1 }],
    research: [{ pts: circle(-0.05, 0.05, 0.5, 11), closed: 1 }, { pts: ellipse(0, 0.05, 0.96, 0.3, -0.32, 13), closed: 1, minor: 1 }],
    publications: [{ pts: [[-0.04, -0.42], [-0.9, -0.54], [-0.9, 0.42], [-0.04, 0.56]] }, { pts: [[0.04, -0.42], [0.9, -0.54], [0.9, 0.42], [0.04, 0.56]] }, { pts: [[0, -0.42], [0, 0.56]], minor: 1 }],
    speaking: [{ pts: ellipse(0, -0.42, 0.27, 0.42, 0, 10), closed: 1 }, { pts: quad([-0.44, -0.38], [-0.44, 0.38], [0, 0.32], 5).concat(quad([0, 0.32], [0.44, 0.38], [0.44, -0.38], 5).slice(1)) }, { pts: [[0, 0.32], [0, 0.74]] }, { pts: [[-0.36, 0.74], [0.36, 0.74]] }],
    media: [{ pts: ellipse(-0.12, -0.12, 0.62, 0.24, -0.62, 10, 0, Math.PI) }, { pts: [dishA[0], [0.18, -0.52], dishA[1]] }, { pts: [[-0.06, 0.08], [0.08, 0.66]] }, { pts: [[-0.3, 0.78], [0.08, 0.66], [0.46, 0.78]] }, { pts: circle(0.18, -0.52, 0.3, 5, -1.6, -0.2), minor: 1 }],
    about: [{ pts: quad([-0.98, 0.02], [0, -0.82], [0.98, 0.02], 9) }, { pts: quad([-0.98, 0.02], [0, 0.74], [0.98, 0.02], 9) }, { pts: circle(0, 0.03, 0.32, 9), closed: 1 }],
    contact: [{ pts: [[-0.82, -0.5], [0.82, -0.5], [0.82, 0.5], [-0.82, 0.5]], closed: 1 }, { pts: [[-0.82, -0.5], [0, 0.1], [0.82, -0.5]] }]
  };
  function constellation(cv) {
    const def = ICONS[cv.dataset.icon]; if (!def) return;
    const sec = cv.closest('section') || cv;
    const nodes = [], edges = [];
    def.forEach(p => { const idx = p.pts.map(q => { let k = nodes.findIndex(n => Math.hypot(n[0] - q[0], n[1] - q[1]) < 0.02); if (k < 0) { nodes.push(q); k = nodes.length - 1; } return k; }); for (let i = 1; i < idx.length; i++) edges.push([idx[i - 1], idx[i], p.minor]); if (p.closed) edges.push([idx[idx.length - 1], idx[0], p.minor]); });
    const order = nodes.map((n, i) => i).sort((a, b) => (nodes[a][0] + nodes[a][1] * 0.6) - (nodes[b][0] + nodes[b][1] * 0.6));
    const rank = []; order.forEach((n, i) => rank[n] = i);
    const tw = nodes.map((_, i) => i * 1.7), N = nodes.length;
    const ctx = cv.getContext('2d'); let S = 0, f = 0, raf = 0, near = false;
    const fit = () => { const d = Math.min(2, devicePixelRatio || 1); S = cv.clientWidth; cv.width = cv.height = Math.round(S * d); ctx.setTransform(d, 0, 0, d, 0, 0); };
    // progress follows the section: 0 while it is below the fold, 1 once its top has risen to the upper third
    const target = () => { const r = sec.getBoundingClientRect(), vh = innerHeight; if (reduce) return 1; return innerWidth <= 960 ? clamp((vh * 1.15 - r.top) / (vh * 0.3)) : clamp((vh * 0.70 - r.top) / (vh * 0.45)); };   // on phones it is already drawing as the section arrives, and done by the time the icon is in view; on desktop it starts when the section's top passes the middle of the screen
    function draw(now) {
      const h = S / 2, k = S * 0.4, P = n => [h + n[0] * k, h + n[1] * k];
      ctx.clearRect(0, 0, S, S); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      // lines follow the stars, one after another
      const lp = sstep(0.56, 0.98, f) * edges.length; ctx.lineWidth = 1;
      edges.forEach(([a, b, minor], e) => { const u = clamp(lp - e); if (u <= 0) return; const A = P(nodes[a]), B = P(nodes[b]); ctx.strokeStyle = `rgba(250,246,242,${minor ? 0.3 : 0.62})`; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u); ctx.stroke(); });
      // each star brightens in turn where it already sits, with a faint four-point sparkle
      nodes.forEach((n, i) => {
        const l0 = 0.03 + (rank[i] / N) * 0.48, light = sstep(l0, l0 + 0.1, f), p = P(n), twk = 0.88 + 0.12 * Math.sin(now / 700 + tw[i]);
        const z = 5.6 + 7.5 * light;
        ctx.globalAlpha = (0.32 + 0.68 * light) * twk; ctx.drawImage(STAR, p[0] - z / 2, p[1] - z / 2, z, z);
        if (light > 0.02) { const Lh = 6.5 * light; ctx.globalAlpha = light * 0.35 * twk; ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(p[0] - Lh, p[1]); ctx.lineTo(p[0] + Lh, p[1]); ctx.moveTo(p[0], p[1] - Lh); ctx.lineTo(p[0], p[1] + Lh); ctx.stroke(); ctx.lineWidth = 1; }
      });
      ctx.globalAlpha = 1;
    }
    function loop(now) {
      // follow the scroll, but never faster than a full drawing in about three seconds, so each star can be seen arriving
      const dt = Math.min(0.05, (now - (loop.t || now)) / 1000); loop.t = now;
      const tg = target(), step = dt / (innerWidth <= 960 ? 1.4 : 3.2); f += clamp(tg - f, -step * 1.6, step); if (Math.abs(tg - f) < 0.0005) f = tg;
      draw(now);
      raf = near && !reduce ? requestAnimationFrame(loop) : 0;
    }
    fit(); f = target(); draw(performance.now());
    addEventListener('resize', () => { fit(); draw(performance.now()); });
    if (!('IntersectionObserver' in window)) { near = true; raf = requestAnimationFrame(loop); return; }
    new IntersectionObserver(es => es.forEach(en => { near = en.isIntersecting; if (near && !raf) raf = requestAnimationFrame(loop); }), { rootMargin: '20% 0px 20% 0px' }).observe(sec);
  }
  $$('canvas[data-icon]').forEach(constellation);

  /* ---- project details: open from the cards, the diagram or the menu; close with the button, Esc or a click outside ---- */
  const PROJ = ['lucid', 'llava-le', 'lumina', 'press-kit']; let openEl = null, lastFocus = null, pushed = false;
  try { history.scrollRestoration = 'manual'; } catch (_) {}
  function openProj(k, fromHistory) {
    const d = document.getElementById('p-' + k); if (!d) return;
    if (openEl && openEl !== d) openEl.hidden = true;
    if (!openEl) lastFocus = document.activeElement;
    d.hidden = false; d.scrollTop = 0; openEl = d;
    document.body.classList.add('modal'); requestAnimationFrame(() => { const c = $('.proj-close', d); if (c) c.focus({ preventScroll: true }); });
    if (!fromHistory) { try { history.pushState({ proj: k }, '', '#' + k); pushed = true; } catch (_) {} }
  }
  function hideProj() {
    if (!openEl) return; const y = scrollY; openEl.hidden = true; openEl = null; document.body.classList.remove('modal');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    window.scrollTo(0, y);   // carry on exactly where the reader was
  }
  function closeProj() { if (!openEl) return; if (pushed) { pushed = false; history.back(); } else { hideProj(); try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {} } }
  addEventListener('popstate', e => { const k = e.state && e.state.proj; if (k) openProj(k, true); else { pushed = false; hideProj(); } });
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]');
    if (o) { if (e.defaultPrevented) return; e.preventDefault(); openProj(o.dataset.open); return; }   // a drag on the talks loop is not a click
    const a = e.target.closest('a[href^="#"]'); const k = a && a.getAttribute('href').slice(1);
    if (a && PROJ.includes(k)) { e.preventDefault(); closeMenu(); openProj(k); return; }
    if (a && openEl && !openEl.contains(a)) { pushed = false; hideProj(); try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {} return; }   // a menu link while details are open
    if (e.target.closest('[data-close]') || (openEl && e.target === openEl)) closeProj();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && openEl) closeProj();
    const g = e.target.closest && e.target.closest('g[data-open]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openProj(g.dataset.open); }
    if (e.key === 'Tab' && openEl) { const f = $$('button, a[href], [tabindex="0"]', openEl).filter(x => x.offsetParent !== null); if (!f.length) return; const first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
  });
  { const k = (location.hash || '').slice(1); if (PROJ.includes(k)) { const r = document.getElementById('research'); if (r) r.scrollIntoView(); try { history.replaceState({ proj: k }, '', '#' + k); } catch (_) {} openProj(k, true); } }

  /* ---- multimodal pipeline explorer ---- */
  $$('[data-explorer]').forEach(box => {
    const svg = $('svg.pipe', box), buttons = $$('.modes button', box), panes = $$('.explain [data-mode]', box);
    const choose = m => {
      buttons.forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === m ? 'true' : 'false'));
      panes.forEach(p => p.hidden = p.dataset.mode !== m);
      if (!svg) return;
      $$('[data-node]', svg).forEach(g => { const on = g.dataset.node === m || g.dataset.core === '1'; g.classList.toggle('on', g.dataset.node === m); g.classList.toggle('dim', !on && g.dataset.input === '1'); });
      $$('[data-from]', svg).forEach(p => { const on = p.dataset.from === m || p.dataset.from === 'core'; p.classList.toggle('dim', !on); });
      $$('[data-pair]', svg).forEach(p => p.classList.toggle('dim', !p.dataset.pair.split(' ').includes(m)));
    };
    buttons.forEach(b => b.addEventListener('click', () => choose(b.dataset.mode)));
    choose(box.dataset.explorer);
  });

  /* ---- copy buttons ---- */
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    const el = document.getElementById(btn.dataset.copy); if (!el) return;
    const txt = el.innerText.trim();
    // the button itself says it worked; if the browser refuses, the address is selected and the visitor is told
    const was = btn.innerHTML, done = (en, tr) => { btn.textContent = T(en, tr); btn.classList.add('done'); clearTimeout(btn._t); btn._t = setTimeout(() => { btn.innerHTML = was; btn.classList.remove('done'); }, 2200); };
    try { await navigator.clipboard.writeText(txt); done('Copied ✓', 'Kopyalandı ✓'); toast('Copied', 'Kopyalandı'); }
    catch (_) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('Couldn’t copy. The address is selected: press Ctrl+C or ⌘C.', 'Kopyalanamadı. Adres seçildi: Ctrl+C veya ⌘C ile kopyalayın.'); }
  }));

  /* ---- contact: choose an intent, then write ---- */
  const form = $('form.msg');
  if (form) {
    const intents = $$('.intents button'), field = $('#intent', form), hint = $('#intent-hint');
    let picked = null;
    const pick = b => { picked = b; intents.forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); field.value = b.dataset.intent; if (hint) hint.textContent = T(b.dataset.hint, b.dataset.hintTr); };
    intents.forEach(b => b.addEventListener('click', () => pick(b)));
    const fromHash = h => { const k = (h || '').replace('#contact-', '').replace('#', ''); return intents.find(b => b.dataset.key === k); };
    pick(fromHash(location.hash) || intents[0]);
    document.addEventListener('click', e => { const a = e.target.closest('a[href^="#contact-"]'); if (a) { const b = fromHash(a.getAttribute('href')); if (b) pick(b); } });
    document.addEventListener('langchange', () => { if (picked) pick(picked); });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#name', form).value.trim(), from = $('#from', form).value.trim(), body = $('#body', form).value.trim();
      if (!name || !from || !body) { toast('Please add your name, email and a message.', 'Lütfen adınızı, e-postanızı ve mesajınızı yazın.'); return; }
      const subject = `[${field.value}] ${name}`;
      location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + '\n\n' + name + ' · ' + from)}`;
      toast('Your email app should open with the message ready to send.', 'E-posta uygulamanız mesaj hazır olarak açılacak.');
    });
  }
  /* ---- talks: the cards move along a loop, all at full light. The loop is exactly as wide as the stage,
          so a card sliding off one edge is already coming back in at the other: none leaves the screen.
          It moves slowly on its own; dragging or the arrows move it faster; hovering a card holds it. ---- */
  (function loop() {
    const box = $('.orbit'); if (!box) return;
    const stage = $('.orbit-stage', box), orig = $$('.tcard', box), n = orig.length, dotsEl = $('.o-dots', box);
    // a twin of every card carries the part that has wrapped round to the other edge
    const twins = orig.map(c => { const t = c.cloneNode(true); t.querySelectorAll('[data-tr]').forEach(x => x.removeAttribute('data-tr')); t.setAttribute('aria-hidden', 'true'); t.tabIndex = -1; t.classList.add('twin'); stage.appendChild(t); return t; });
    const all = orig.concat(twins);
    const AUTO = reduce ? 0 : 1 / 7;   // one card-step every seven seconds
    let pos = 0, vel = 0, queue = 0, hover = false, drag = null, visible = false, last = performance.now(), slow = 1;
    let Wd = 0, D = 0, P = 0, cw = 0, off = 0;
    orig.forEach(() => dotsEl.appendChild(document.createElement('span')));
    const dots = $$('span', dotsEl);
    const prevB = $('.o-prev', box), nextB = $('.o-next', box);
    function layout() {
      // on wide screens the loop runs from just left of the column to the right edge of the content, leaving the margin free
      const vw = document.documentElement.clientWidth, bl = box.getBoundingClientRect().left;
      if (vw > 960) { const cw0 = box.clientWidth; stage.style.marginLeft = '-40px'; stage.style.width = (cw0 + 40) + 'px'; prevB.style.left = '-28px'; nextB.style.left = (cw0 - 20) + 'px'; nextB.style.right = 'auto'; }
      else { stage.style.marginLeft = ''; stage.style.width = ''; prevB.style.left = ''; nextB.style.left = ''; nextB.style.right = ''; }
      Wd = stage.clientWidth; const narrow = Wd < 700;
      if (!narrow) { D = Wd / n; cw = Math.min(330, D - 22); P = Wd; off = (D - cw) / 2; }
      else { cw = Math.min(290, Wd * 0.78); D = cw + 16; P = D * n; off = (Wd - cw) / 2 - D; }
      all.forEach(c => { c.style.width = cw + 'px'; c.style.height = 'auto'; });
      const h = Math.max(...orig.map(c => c.offsetHeight));
      all.forEach(c => { c.style.height = h + 'px'; });
      stage.style.height = (h + 24) + 'px';
      box.style.setProperty('--stage-h', (h + 24) + 'px');
      place();
    }
    function place() {
      let centre = 0, best = 1e9;
      orig.forEach((c, i) => {
        const x = (((i - pos) * D) % P + P) % P + off;
        c.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
        twins[i].style.transform = `translate3d(${(x - P).toFixed(1)}px,0,0)`;
        const d = Math.abs(x + cw / 2 - Wd / 2); if (d < best) { best = d; centre = i; }
      });
      dots.forEach((d, i) => d.classList.toggle('on', i === centre));
    }
    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      slow += ((hover || drag ? 0 : 1) - slow) * Math.min(1, dt * 4);
      if (!drag) {
        const q = queue * Math.min(1, dt * 5); queue -= q;
        vel *= Math.exp(-dt * 2.5);
        pos += AUTO * slow * dt + vel * dt + q;
      }
      place();
      if (visible) requestAnimationFrame(tick);
    }
    const kick = () => { last = performance.now(); requestAnimationFrame(tick); };
    $('.o-prev', box).addEventListener('click', () => { queue -= 1; });
    $('.o-next', box).addEventListener('click', () => { queue += 1; });
    box.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { e.preventDefault(); queue -= 1; } if (e.key === 'ArrowRight') { e.preventDefault(); queue += 1; } });
    all.forEach(c => { c.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; }); c.addEventListener('pointerleave', () => { hover = false; }); c.addEventListener('focus', () => { hover = true; }); c.addEventListener('blur', () => { hover = false; }); });
    stage.addEventListener('pointerdown', e => { if (e.button !== 0) return; drag = { x: e.clientX, p: pos, moved: false, id: e.pointerId, lx: e.clientX, lt: performance.now(), v: 0 }; });
    addEventListener('pointermove', e => {
      if (!drag) return; const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 6 && !drag.moved) { drag.moved = true; try { stage.setPointerCapture(drag.id); } catch (_) {} }
      if (drag.moved) { const now = performance.now(), dtt = Math.max(1, now - drag.lt); drag.v = -(e.clientX - drag.lx) / D / (dtt / 1000); drag.lx = e.clientX; drag.lt = now; pos = drag.p - dx / D; }
    });
    addEventListener('pointerup', () => { if (!drag) return; const moved = drag.moved; vel = clamp(drag.v, -6, 6); drag = null; if (moved) { stage.dataset.dragged = '1'; setTimeout(() => delete stage.dataset.dragged, 60); } });
    all.forEach(c => c.addEventListener('click', e => { if (stage.dataset.dragged) e.preventDefault(); }));
    addEventListener('resize', layout); layout();
    addEventListener('load', layout); if (document.fonts) document.fonts.ready.then(layout);
    document.addEventListener('langchange', () => { twins.forEach((t, i) => { t.innerHTML = orig[i].innerHTML; t.querySelectorAll('[data-tr]').forEach(x => x.removeAttribute('data-tr')); }); setTimeout(layout, 30); });
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { const v = es[0].isIntersecting; if (v && !visible) { visible = true; kick(); } else visible = v; }).observe(box);
    else { visible = true; kick(); }
  })();

  /* ---- media: the news list and the globe that filters it (from v6) ---- */
  function coverage() {
    const list = $('#article-list'), cv = $('.globe canvas'), showing = $('#showing'), qEl = $('#news-q'), pills = $$('.pills button');
    if (!list || !window.PRESS) return;
    const C = window.COUNTRIES || {};
    const items = window.PRESS.slice();
    const groups = {}; items.forEach(it => { (groups[it.country] = groups[it.country] || []).push(it); });
    const order = Object.keys(groups).sort((a, b) => (b === 'US') - (a === 'US') || groups[b].length - groups[a].length);
    let sel = 'all';   // 'all', 'US', 'TR', 'INTL', or one country picked on the globe
    const cname = k => C[k] ? T(C[k][0], C[k][1]) : k;
    const norm = x => (x || '').toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');
        // pinned first, in this order, in every view; then Ohio State’s own pages, then the DPS meeting’s coverage, then the rest
    const PIN = ['aasnova.org', 'news.osu.edu', 'universetoday.com', 'scinexx.de', 'phys.org', 'evrimagaci.org'];
    const rank = it => { const p = PIN.findIndex(d => it.url.includes(d)); return p >= 0 ? p : /osu\.edu/.test(it.url) ? 10 : /aas(nova)?\.org|\bdps\b/i.test(it.url) ? 11 : 12; };
    const inSel = it => sel === 'all' || (sel === 'INTL' ? (it.country !== 'US' && it.country !== 'TR') : it.country === sel);
    function options() { if (qEl) qEl.placeholder = T('Search by country or outlet', 'Ülke ya da yayın organı ara'); pills.forEach(p => p.setAttribute('aria-pressed', p.dataset.f === sel ? 'true' : 'false')); }
    function render() {
      const q = norm(qEl ? qEl.value.trim() : '');
      const show = items.filter(it => inSel(it) && (!q || norm(it.title + ' ' + it.outlet + ' ' + (C[it.country] ? C[it.country][0] + ' ' + C[it.country][1] : '') + ' ' + it.country).includes(q)))
        .sort((a, b) => (rank(a) - rank(b)) || (order.indexOf(a.country) - order.indexOf(b.country)) || a.outlet.localeCompare(b.outlet));
      list.innerHTML = '';
      show.forEach(it => {
        const a = document.createElement('a'); a.className = 'article'; a.href = it.url; a.target = '_blank'; a.rel = 'noopener';
        a.innerHTML = `<div><h3></h3><span class="o"></span></div><span class="d">↗</span>`;
        a.querySelector('h3').textContent = it.title; a.querySelector('.o').textContent = it.outlet + ' · ' + cname(it.country);
        list.appendChild(a);
      });
      if (!show.length) { const p = document.createElement('p'); p.className = 'note'; p.textContent = T('Nothing matches that search.', 'Bu aramayla eşleşen haber yok.'); list.appendChild(p); }
      const picked = !['all', 'US', 'TR', 'INTL'].includes(sel);
      showing.textContent = picked ? T('Showing mentions from ', 'Gösterilen haberler: ') + cname(sel) : '';
      options(); if (draw) draw();
    }
    pills.forEach(p => p.addEventListener('click', () => { sel = p.dataset.f; render(); }));
    if (qEl) qEl.addEventListener('input', render);
    options();
    let draw = null;
    if (cv && window.LAND) {
      const ctx = cv.getContext('2d'), L = window.LAND, NL = L.length / 2;
      const lat = new Float32Array(NL), lon = new Float32Array(NL); for (let i = 0; i < NL; i++) { lat[i] = L[i * 2] / 573; lon[i] = L[i * 2 + 1] / 573; }
      let S = 0, rot = -95, tilt = 22, drag = null, auto = !reduce, last = performance.now(), markers = [];
      const fit = () => { const d = Math.min(2, devicePixelRatio || 1); S = cv.clientWidth; cv.width = cv.height = Math.round(S * d); ctx.setTransform(d, 0, 0, d, 0, 0); };
      const P = (la, lo) => { const r0 = rot * 0.017453, t0 = tilt * 0.017453, cl = Math.cos(la), dl = lo - r0; const x = cl * Math.sin(dl), y = Math.cos(t0) * Math.sin(la) - Math.sin(t0) * cl * Math.cos(dl), z = Math.sin(t0) * Math.sin(la) + Math.cos(t0) * cl * Math.cos(dl); return [x, y, z]; };
      draw = function () {
        const h = S / 2, R = S * 0.44; ctx.clearRect(0, 0, S, S);
        const g = ctx.createRadialGradient(h, h, R * 0.2, h, h, R * 1.05); g.addColorStop(0, 'rgba(159,227,255,.04)'); g.addColorStop(1, 'rgba(159,227,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(h, h, R * 1.05, 0, 6.283); ctx.fill();
        ctx.strokeStyle = 'rgba(159,227,255,.35)'; ctx.beginPath(); ctx.arc(h, h, R, 0, 6.283); ctx.stroke();
        ctx.strokeStyle = 'rgba(159,227,255,.1)';
        for (let la = -60; la <= 60; la += 30) { ctx.beginPath(); let on = false; for (let lo = -180; lo <= 180; lo += 4) { const p = P(la * 0.017453, lo * 0.017453); if (p[2] > 0) { on ? ctx.lineTo(h + p[0] * R, h - p[1] * R) : ctx.moveTo(h + p[0] * R, h - p[1] * R); on = true; } else on = false; } ctx.stroke(); }
        for (let lo = -180; lo < 180; lo += 30) { ctx.beginPath(); let on = false; for (let la = -90; la <= 90; la += 4) { const p = P(la * 0.017453, lo * 0.017453); if (p[2] > 0) { on ? ctx.lineTo(h + p[0] * R, h - p[1] * R) : ctx.moveTo(h + p[0] * R, h - p[1] * R); on = true; } else on = false; } ctx.stroke(); }
        ctx.fillStyle = 'rgb(159,227,255)';
        for (let i = 0; i < NL; i++) { const p = P(lat[i], lon[i]); if (p[2] <= 0) continue; ctx.globalAlpha = 0.18 + 0.55 * p[2]; ctx.fillRect(h + p[0] * R - 0.8, h - p[1] * R - 0.8, 1.6, 1.6); }
        ctx.globalAlpha = 1; markers = [];
        Object.keys(groups).forEach(k => {
          if (!k || !C[k]) return; const p = P(C[k][2] * 0.017453, C[k][3] * 0.017453); if (p[2] <= 0.05) return;
          const x = h + p[0] * R, y = h - p[1] * R, on = sel === k, n = groups[k].length;
          markers.push([x, y, k]);
          ctx.fillStyle = on ? '#fff' : 'rgba(254,42,44,1)'; ctx.beginPath(); ctx.arc(x, y, 3.5 + Math.min(4, n * 0.6), 0, 6.283); ctx.fill();
          ctx.strokeStyle = on ? 'rgba(255,255,255,.9)' : 'rgba(254,42,44,.7)'; ctx.beginPath(); ctx.arc(x, y, 9 + Math.min(5, n * 0.8), 0, 6.283); ctx.stroke();
          if (on) { ctx.fillStyle = 'rgba(236,232,225,.92)'; ctx.font = '11px "Geist Mono", ui-monospace, monospace'; const lb = cname(k), tw = ctx.measureText(lb).width; if (x + 14 + tw > S - 2) { ctx.textAlign = 'right'; ctx.fillText(lb, x - 14, y + 4); ctx.textAlign = 'left'; } else ctx.fillText(lb, x + 14, y + 4); }
        });
      };
      function loop(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now; if (auto && !drag) rot -= dt * 5; draw(); requestAnimationFrame(loop); }
      fit(); render(); requestAnimationFrame(loop);
      addEventListener('resize', () => { fit(); draw(); });
      cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, r: rot, t: tilt, moved: false }; cv.setPointerCapture(e.pointerId); });
      cv.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true; rot = drag.r - dx * 0.4; tilt = clamp(drag.t + dy * 0.3, -60, 60); });
      cv.addEventListener('pointerup', e => {
        const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        if (drag && !drag.moved) { const hit = markers.find(m => Math.hypot(m[0] - x, m[1] - y) < 16); if (hit) { sel = sel === hit[2] ? 'all' : hit[2]; auto = false; render(); if (innerWidth <= 960 && sel !== 'all') { const L = document.getElementById('showing') || document.getElementById('article-list'); if (L) L.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); } } }
        drag = null;
      });
    } else render();
    document.addEventListener('langchange', () => { options(); render(); });
    render();
  }
  coverage();
})();
