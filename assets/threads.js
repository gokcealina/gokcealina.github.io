/* Gokce Alina Inal — fragments of thin red orbits that keep reappearing down the page, often cut by the
   edge of the screen, so the page feels connected without one continuous line. Solid red only.
   Drawn as one SVG behind the content; each fragment draws itself in as it comes into view. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const RED = '#fe2a2c';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let svg = null, items = [], timer = 0;

  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const box = e => { const r = e.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; };
  const f = v => v.toFixed(1);
  // the same pattern on every visit
  function seeded(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function build() {
    if (document.body.classList.contains('modal')) return;
    const doc = document.documentElement, W = doc.clientWidth, H = innerHeight, small = W < 760;
    const main = document.getElementById('main'); if (!main) return;
    if (!svg) { svg = el('svg', { id: 'threads', 'aria-hidden': 'true', focusable: 'false' }); document.body.appendChild(svg); }
    svg.innerHTML = ''; items = [];
    // measure the page itself, not the lines: the page ends with the footer
    svg.style.height = '0px';
    const foot = document.querySelector('footer'), endEl = foot || main;
    const total = Math.ceil(endEl.getBoundingClientRect().bottom + scrollY);
    svg.setAttribute('width', W); svg.setAttribute('height', total); svg.setAttribute('viewBox', `0 0 ${W} ${total}`); svg.style.height = total + 'px';
    const defs = el('defs', {}, svg), g = el('radialGradient', { id: 'glow' }, defs);
    el('stop', { offset: '0', 'stop-color': RED, 'stop-opacity': '.8' }, g); el('stop', { offset: '1', 'stop-color': RED, 'stop-opacity': '0' }, g);

    const path = (d, op = 0.6) => { const p = el('path', { d, stroke: RED, 'stroke-opacity': op, pathLength: '1', class: 'draw' }, svg); return p; };
    const node = (pt, r = 3) => {
      const n = el('g', { class: 'node' }, svg);
      el('circle', { cx: f(pt.x), cy: f(pt.y), r: r * 4.2, fill: 'url(#glow)' }, n);
      el('circle', { cx: f(pt.x), cy: f(pt.y), r, fill: RED }, n);
      items.push({ e: n, y: pt.y });
    };
    const quad = (a, c, b, op) => { const p = path(`M${f(a.x)} ${f(a.y)}Q${f(c.x)} ${f(c.y)} ${f(b.x)} ${f(b.y)}`, op); items.push({ e: p, y: Math.min(a.y, b.y) }); return p; };
    const at = (p, t) => { const q = p.getPointAtLength(p.getTotalLength() * t); return { x: q.x, y: q.y }; };

    // the welcome: arcs around the portrait, as in the design
    const img = document.querySelector('.hero-figure img'), copy = document.querySelector('.hero-copy'), hero = document.querySelector('.hero');
    let y0 = H;
    if (img && copy && hero) {
      const F = box(img), C = box(copy), Hh = box(hero);
      y0 = Hh.y + Hh.h;
      if (!small) {
        const r1 = { x: F.x + F.w * 0.12, y: F.y + F.h * 0.12 };
        quad({ x: Math.max(8, F.x - F.w * 0.32), y: Math.max(Hh.y + 70, F.y - F.h * 0.06) }, { x: F.x - F.w * 0.02, y: F.y - F.h * 0.02 }, r1, 0.7); node(r1);
        const bp = quad({ x: F.x + F.w * 0.8, y: F.y + F.h * 0.5 }, { x: F.x + F.w * 0.96, y: F.y + F.h * 0.02 }, { x: C.x + C.w * 0.45, y: Math.max(Hh.y + 80, C.y - 70) }, 0.55);
        node(at(bp, 0.58));
        const r3 = { x: C.x - 120, y: C.y + C.h * 0.78 };
        quad({ x: F.x + F.w * 0.5, y: F.y + F.h * 0.98 }, { x: F.x + F.w, y: F.y + F.h * 0.99 }, r3, 0.6); node(r3);
      } else {
        const r3 = { x: W - 26, y: F.y + F.h * 0.62 };
        quad({ x: F.x + F.w * 0.35, y: F.y + F.h * 0.96 }, { x: W * 0.95, y: F.y + F.h * 0.98 }, r3, 0.6); node(r3, 2.6);
      }
    }

    // further down: pieces of large orbits whose centres lie off the screen, so only a slice shows,
    // reaching in from one side and leaving again; the side alternates as you go
    const rnd = seeded(58);
    let y = y0 + H * 0.2, side = 1;
    while (y < total - H * 0.25) {
      const left = side < 0;
      const r = W * (small ? 0.9 + rnd() * 0.6 : 0.5 + rnd() * 0.45);
      const reach = W * (small ? 0.16 + rnd() * 0.1 : 0.1 + rnd() * 0.12);
      const cx = left ? reach - r : W - reach + r, cy = y;
      const base = left ? 0 : Math.PI, span = (small ? 0.35 : 0.42) + rnd() * 0.3;
      const a0 = base - span * (0.7 + rnd() * 0.5), a1 = base + span * (0.7 + rnd() * 0.5);
      const P = a => ({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      const s = P(a0), e = P(a1);
      const p = path(`M${f(s.x)} ${f(s.y)}A${f(r)} ${f(r)} 0 0 1 ${f(e.x)} ${f(e.y)}`, 0.5 + rnd() * 0.15);
      items.push({ e: p, y: Math.min(s.y, e.y) });
      node(P(base + (rnd() - 0.4) * span * 0.9), small ? 2.6 : 3);
      // now and then a second, wider orbit nearby, so the pieces read as one system
      if (rnd() < 0.45) {
        const r2 = r * (1.25 + rnd() * 0.3), cx2 = left ? reach * 0.55 - r2 : W - reach * 0.55 + r2;
        const b0 = base - span * 0.8, b1 = base + span * 0.5;
        const Q = a => ({ x: cx2 + r2 * Math.cos(a), y: cy + H * 0.08 + r2 * Math.sin(a) });
        const s2 = Q(b0), e2 = Q(b1);
        const p2 = path(`M${f(s2.x)} ${f(s2.y)}A${f(r2)} ${f(r2)} 0 0 1 ${f(e2.x)} ${f(e2.y)}`, 0.35);
        items.push({ e: p2, y: Math.min(s2.y, e2.y) });
      }
      y += H * (0.75 + rnd() * 0.55); side = -side;
    }
    reveal();
  }
  function reveal() {
    const lim = scrollY + innerHeight * 0.92;
    items.forEach(it => { if (reduce || it.y < lim) it.e.classList.add('on'); });
  }
  const soon = () => { clearTimeout(timer); timer = setTimeout(build, 150); };
  addEventListener('scroll', reveal, { passive: true });
  addEventListener('resize', soon);
  addEventListener('load', soon);
  if (document.fonts) document.fonts.ready.then(soon);
  document.addEventListener('langchange', soon);
  if ('ResizeObserver' in window) new ResizeObserver(soon).observe(document.getElementById('main') || document.body);
  build();
})();
