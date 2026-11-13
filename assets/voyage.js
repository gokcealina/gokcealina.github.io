/* Gokce Inal — v8 background: a journey through the solar system, driven by scrolling.
   Each part of the page has a place: the Moon behind the welcome, the lunar surface under Research,
   then Mars, Jupiter, Saturn and the Earth. Between two parts the stars stretch into light-speed
   streaks, the body we are leaving flies past and the next one grows out of the distance.
   Images: NASA (NASA-3D-Resources). Plain 2D canvas, no libraries. */
(() => {
  const cv = document.getElementById('sky'); if (!cv) return;
  const ctx = cv.getContext('2d', { alpha: false });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const smooth = t => t * t * (3 - 2 * t), outC = t => 1 - Math.pow(1 - t, 3), inQ = t => t * t;
  const IMG = {};
  [['moon', 'moon-right.webp'], ['surface', 'lunar-patch.webp'], ['mars', 'mars.webp'], ['jupiter', 'jupiter.webp'], ['saturn', 'saturn.webp'], ['earth', 'earth.webp'], ['asteroid', 'asteroid.webp']]
    .forEach(([k, f]) => { const i = new Image(); i.decoding = 'async'; i.src = 'assets/img/space/' + f; IMG[k] = i; });

  let W = 0, H = 0, D = 1, small = false, heroC = [0.27, 0.5], moonS = 800;
  const far = document.createElement('canvas'), neb = document.createElement('canvas');
  function rnd(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
  function paintFar() {
    // a still layer of faint stars and two soft nebulae, drawn once per size
    far.width = neb.width = Math.round(W * D); far.height = neb.height = Math.round(H * D);
    const f = far.getContext('2d'), r = rnd(7); f.clearRect(0, 0, far.width, far.height);
    const n = Math.round(W * H / 900);
    for (let i = 0; i < n; i++) { const x = r() * far.width, y = r() * far.height, s = (r() < 0.06 ? 1.3 : 0.7) * D, a = 0.15 + r() * 0.55; f.fillStyle = `rgba(${220 + r() * 35 | 0},${225 + r() * 30 | 0},255,${a})`; f.beginPath(); f.arc(x, y, s, 0, 6.283); f.fill(); }
    const g = neb.getContext('2d'); g.clearRect(0, 0, neb.width, neb.height);
    [[0.78, 0.22, 0.55, '0,24,56', 0.3], [0.15, 0.85, 0.5, '0,22,50', 0.26]].forEach(([x, y, rr, c, a]) => {
      const R = rr * Math.max(neb.width, neb.height), gr = g.createRadialGradient(x * neb.width, y * neb.height, 0, x * neb.width, y * neb.height, R);
      gr.addColorStop(0, `rgba(${c},${a})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(0, 0, neb.width, neb.height);
    });
  }
  // stars in 3D, flying toward us; at light speed they become streaks
  const N = 520, S = []; { const r = rnd(3); for (let i = 0; i < N; i++) S.push([(r() * 2 - 1) * 1.6, (r() * 2 - 1) * 1.1, 0.05 + r() * 0.95, 0.4 + r() * 0.6]); }

  // where each body rests (viewport coordinates), how big and how bright
  const ST = {
    moon: t => ({ k: 'moon', x: heroC[0] * W, y: heroC[1] * H, s: moonS, a: small ? 0.7 : 0.9, r: 0 }),
    surface: t => ({ k: 'surface', x: W * 0.5 + Math.sin(t * 0.03) * W * 0.025, y: H * 0.5 + Math.cos(t * 0.025) * H * 0.025, s: Math.max(W, H) * 1.75, a: 0.3, r: 0 }),
    mars: t => ({ k: 'mars', x: W * (small ? 0.92 : 0.88), y: H * 0.82, s: Math.min(W, H) * (small ? 0.8 : 0.6), a: 0.55, r: 0 }),
    jupiter: t => ({ k: 'jupiter', x: W * 0.97, y: H * 0.13, s: Math.min(W, H) * (small ? 0.9 : 0.8), a: 0.42, r: 0 }),
    saturn: t => ({ k: 'saturn', x: W * (small ? 0.85 : 0.93), y: H * 0.86, s: Math.min(W, H) * (small ? 1.25 : 1.05), a: 0.42, r: -0.05 }),
    earth: t => ({ k: 'earth', x: W * (small ? 0.96 : 0.9), y: H * (small ? 0.14 : 0.24), s: Math.min(W, H) * (small ? 0.62 : 0.42), a: 0.55, r: 0 })
  };
  let marks = [];
  function measure() {
    const y0 = scrollY;
    marks = [...document.querySelectorAll('main > [data-station]')].map(el => ({ top: el.getBoundingClientRect().top + y0, st: el.dataset.station }));
    // the Moon at the left edge of the welcome, lit from the right, as in the design: cut by the edge of the screen
    // (10% of its width further out than in v18)
    if (small) { moonS = W * 1.1; heroC = [(W * 0.18 + moonS * 0.1 - moonS / 2) / W, 0.36]; }
    else { moonS = H * 1.06; heroC = [(W * 0.152 + moonS * 0.1 - moonS / 2) / W, 0.55]; }
  }
  function resize() {
    W = innerWidth; H = innerHeight; small = W < 760; D = Math.min(1.5, devicePixelRatio || 1);
    cv.width = Math.round(W * D); cv.height = Math.round(H * D); cv.style.width = W + 'px'; cv.style.height = H + 'px';
    paintFar(); measure();
  }
  addEventListener('resize', resize); resize();
  if ('ResizeObserver' in window) new ResizeObserver(() => measure()).observe(document.querySelector('main') || document.body);
  addEventListener('load', measure);

  // which body we are at, or which two we are travelling between
  function state(s) {
    let rest = marks.length ? marks[0].st : 'moon';
    for (const m of marks) if (m.top <= s + H * 0.16) rest = m.st;
    for (let i = 1; i < marks.length; i++) {
      if (marks[i].st === marks[i - 1].st) continue;
      // Moon → surface: straight after the welcome, the dive starts with the first scroll; when About sits in between,
      // the Moon waits at the edge while About is read and the dive happens over the last stretch before Research
      let u;
      if (marks[i - 1].st === 'moon' && marks[i].st === 'surface') {
        const end = marks[i].top - H * 0.16, Z = H * 0.75;
        u = i - 1 === 0 ? s / Math.max(1, end) : (s - (end - Z)) / Z;
      } else u = (s + H * 0.88 - marks[i].top) / (H * 0.72);
      if (u > 0 && u < 1) {
        return { from: marks[i - 1].st, to: marks[i].st, u };
      }
    }
    return { from: rest, to: rest, u: 0 };
  }

  function body(p, sx, alpha, cx, cy, scale) {
    const im = IMG[p.k]; if (!im || !im.complete || !im.naturalWidth || alpha <= 0.003) return;
    const w = p.s * scale, h = w * im.naturalHeight / im.naturalWidth;
    ctx.save(); ctx.globalAlpha = clamp(alpha); ctx.translate(cx * D, cy * D); if (p.r) ctx.rotate(p.r);
    ctx.drawImage(im, -w / 2 * D, -h / 2 * D, w * D, h * D); ctx.restore();
    // the Moon's left side falls into shadow toward the edge of the screen, so it blends into the sky
    if (p.k === 'moon') {
      const fade = clamp(1 - (scale - 1) * 1.2); if (fade <= 0.01) return;
      const r = w / 2 * 0.995, x0 = Math.max(0, cx - r), x1 = x0 + (cx + r - x0) * 0.72;
      const g = ctx.createLinearGradient(x0 * D, 0, x1 * D, 0);
      g.addColorStop(0, 'rgba(0,10,24,0.9)'); g.addColorStop(0.45, 'rgba(0,10,24,0.55)'); g.addColorStop(1, 'rgba(0,10,24,0)');
      ctx.save(); ctx.globalAlpha = clamp(alpha) * fade; ctx.beginPath(); ctx.arc(cx * D, cy * D, r * D, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = g; ctx.fillRect(x0 * D, (cy - r) * D, (x1 - x0) * D, 2 * r * D); ctx.restore();
    }
  }

  let sm = scrollY, last = performance.now(), t = 0, travel = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
    sm += (scrollY - sm) * (1 - Math.exp(-dt * 7)); if (Math.abs(scrollY - sm) < 0.5) sm = scrollY;
    const { from, to, u } = state(sm), moving = from !== to;
    const warp = moving && !reduce ? Math.pow(Math.sin(Math.PI * u), 1.4) * (from === 'moon' ? 0.45 : 1) : 0;
    const vpx = W * (0.5 + (moving ? (u - 0.5) * 0.12 : 0)), vpy = H * 0.46;

    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000a18'; ctx.fillRect(0, 0, cv.width, cv.height);
    // nebulae and faint stars drift a little all the time, and swell as we speed up
    const dz = 1 + warp * 0.06, ox = Math.sin(t * 0.02) * 14 * D, oy = Math.cos(t * 0.017) * 10 * D;
    ctx.save(); ctx.translate(cv.width / 2, cv.height / 2); ctx.scale(dz, dz); ctx.translate(-cv.width / 2 + ox, -cv.height / 2 + oy);
    ctx.drawImage(neb, 0, 0); ctx.globalAlpha = 1 - warp * 0.5; ctx.drawImage(far, 0, 0); ctx.restore();

    // stars rushing toward us
    const speed = reduce ? 0 : 0.018 + warp * 1.9; travel += speed * dt;
    const f = Math.max(W, H) * 0.5, streak = warp * 0.22;
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (const st of S) {
      st[2] -= speed * dt; if (st[2] < 0.03) { st[2] += 1; }
      const z = st[2], x = vpx + st[0] / z * f * 0.35, y = vpy + st[1] / z * f * 0.35;
      if (x < -50 || x > W + 50 || y < -50 || y > H + 50) continue;
      const b = clamp((1 - z) * 1.25) * st[3];
      if (streak > 0.01) {
        const z2 = Math.min(1, z + streak * (0.6 + st[3])), x2 = vpx + st[0] / z2 * f * 0.35, y2 = vpy + st[1] / z2 * f * 0.35;
        ctx.strokeStyle = `rgba(215,228,255,${b * (0.35 + warp * 0.55)})`; ctx.lineWidth = (0.6 + b * 1.4) * D;
        ctx.beginPath(); ctx.moveTo(x2 * D, y2 * D); ctx.lineTo(x * D, y * D); ctx.stroke();
      }
      ctx.fillStyle = `rgba(240,244,255,${b * 0.9})`; ctx.beginPath(); ctx.arc(x * D, y * D, (0.5 + b * 1.3) * D, 0, 6.283); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    // the bodies (none while a project page is open: just space behind it)
    if (document.body.classList.contains('modal')) { /* stars only */ }
    else if (!moving) {
      const p = ST[from](t), still = from === 'moon' ? 0 : 1, br = 1 + Math.sin(t * 0.07) * 0.012 * still;
      body(p, 0, p.a, p.x + Math.sin(t * 0.05) * 6 * still, p.y + Math.cos(t * 0.04) * 5 * still, br);
    } else if (reduce) {
      const A = ST[from](t), B = ST[to](t);
      body(A, 0, A.a * (1 - u), A.x, A.y, 1); body(B, 0, B.a * u, B.x, B.y, 1);
    } else {
      const A = ST[from](t), B = ST[to](t);
      if (from === 'moon' && to === 'surface') {
        // one continuous zoom into a point on the lit side of the Moon. The close-up surface is anchored
        // inside the Moon at that point and fades in as we get near, so the zoom ends on it and stays there.
        const MF = 16, e = 1 - Math.pow(1 - clamp(u), 1.6), m = Math.pow(MF, e);   // starts moving at once
        const tx = A.x + A.s * 0.38, ty = A.y - A.s * 0.12;              // the point we fall towards
        const px = tx + (B.x - tx) * e, py = ty + (B.y - ty) * e;       // where that point is on screen
        const G = A.a + (B.a - A.a) * smooth(clamp(u * 1.15));
        const k = B.s / (A.s * MF), patch = A.s * k * m, diag = Math.hypot(W, H);   // the patch is a fixed fraction of the Moon
        const pin = smooth(clamp((m - 2.2) / 4));                                    // close-up detail fades in as we near it
        const gone = smooth(clamp((patch * 0.7 - diag * 0.75) / (diag * 0.25)));    // the Moon around it leaves only once the patch fills the screen
        body(A, 0, G * (1 - gone), px + (A.x - tx) * m, py + (A.y - ty) * m, m);
        body({ k: 'surface', s: A.s * k, r: 0 }, 0, G * pin, px, py, m);
      } else {
        // fly past the body we are leaving
        const a = clamp(u / 0.62), m = 1 + 3.2 * inQ(a);
        body(A, 0, A.a * (1 - smooth(clamp((u - 0.12) / 0.42))), vpx + (A.x - vpx) * m, vpy + (A.y - vpy) * m, m);
        // an asteroid crosses the path between Mars and Jupiter
        if (from === 'mars' && to === 'jupiter') {
          const q = clamp((u - 0.15) / 0.7), ast = { k: 'asteroid', s: Math.min(W, H) * 0.16, r: q * 1.2 };
          const mm = 0.1 + 2.6 * inQ(q);
          body(ast, 0, 0.75 * Math.sin(Math.PI * q), vpx + (-W * 0.18) * mm, vpy + (H * 0.12) * mm, mm);
        }
        // and grow the next one out of the distance
        const b = outC(clamp((u - 0.38) / 0.62));
        body(B, 0, B.a * clamp((u - 0.38) / 0.3), vpx + (B.x - vpx) * b, vpy + (B.y - vpy) * b, 0.05 + 0.95 * b);
      }
    }
    // a faint flash at the height of the jump
    if (warp > 0.6) { ctx.fillStyle = `rgba(200,215,255,${(warp - 0.6) * 0.08})`; ctx.fillRect(0, 0, cv.width, cv.height); }
  }
  requestAnimationFrame(frame);
})();
