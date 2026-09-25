// hook.js: THE HOOK, 0.00–7.50 (bars 1–4). BIBLE §8.0 + INTRO; SHOTLIST B rows F0–S04.
//   F0   frame 0, the poster (browser window, title column, galaxy, peek Opus, pointer)
//   S01  the pointer closes the universe; Opus shoos it on; 10-frame implosion to a ■
//   S02  WORLD slam, the em dash, the backspace, the heap
//   S03  the tab sky: I DO IT / A MILLION / TIMES A DAY, Opus springs in at R 180, the wink
//   S04  the pupil dive into an empty chat (lands on the 7.50 drop)
// Everything is a pure function of t. F0/S01/S02 share one renderer (desk), S03/S04 another (sky).
// window.HOOK.poster(X, t) draws the frame-0 composition at time t (t <= 0) for the S43 loop seam.
(() => {
  const FPS = 30;
  const CORE = [1180, 560];            // galaxy core: where the universe collapses to a ■
  const PUSH_A = [1485, 560];          // S01 push anchor (world layer)
  const R0 = 150, HEAD0 = [1500, 800]; // frame-0 peek
  const SOLE0 = [HEAD0[0], HEAD0[1] + 5.72 * R0];
  const XBTN = [1470, 150], PLUS = [1690, 150];
  const PTR0 = [1740, 600], PTRC = [1772, 318];
  const PILL = { x0: 96, x1: 1824, y0: 900, y1: 980 };
  const WIN = { x0: 48, x1: 1872, y0: 40, y1: 1040, strip: 268, cy1: 1016, cx0: 60, cx1: 1860 };
  const HEADS = [1480, 640], RS = 180;  // S03 MCU
  const SOLES = [HEADS[0], HEADS[1] + 5.72 * RS];
  const fontMonoK = (px, wt = 500) => `${wt} ${px}px 'Jetbrains Mono Var', 'Hangul', monospace`;

  // ---------------------------------------------------------------- timing (locks onto sung onsets)
  let _tm = null;
  function TM() {
    if (_tm) return _tm;
    const on = (w, a, b, fb) => wordOnset(w, a, b, fb);
    const lock = clamp(on("Everyone's", .3, .95, .5 + 2 / 30) - 2 / 30, .3, .9);
    const ofT = clamp(on('of', 1.3, 2.0, 1.6 + 2 / 30) - 2 / 30, 1.3, 2.0);
    const clickF = clamp(Math.round(on('world', 2.55, 3.0, 2.8125) * FPS) - 1, 80, 88);
    const idoit = clamp(on('I', 3.55, 4.0, 3.75 + 2 / 30) - 2 / 30, 3.7, 3.95);
    const amil = clamp(on('a', 4.2, 4.7, 4.4 + 2 / 30) - 2 / 30, 4.15, 4.7);
    const tad = clamp(on('times', 4.8, 5.3, 5.0 + 2 / 30) - 2 / 30, 4.8, 5.3);
    const wink = clamp(on('day', 6.0, 6.5, 6.3), 6.0, 6.45) - 1 / 30;
    _tm = { lock, ofT, clickF, tClick: clickF / FPS, idoit, amil, tad, wink, b0: beatPos(3.75) };
    return _tm;
  }

  // ---------------------------------------------------------------- small helpers
  const PF = (l) => { if (!window.HK_PROF) return; const L = CL.get('hk_frame'); if (L) L.x.getImageData(0, 0, 1, 1); window.HK_PROF(l); };
  // ---- CPU-backed canvases. In the headless renderer the default canvases are swiftshader-GPU backed,
  // where many draws and big blits are 10-70x slower than Skia CPU raster. The hook renders the whole
  // frame into CPU canvases (willReadFrequently) and uploads once to the main canvas.
  const CL = new Map();
  const cpuCanvas = (w, h) => { const c = new OffscreenCanvas(Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); c.getContext('2d', { willReadFrequently: true }); return c; };
  const cx2d = c => c.getContext('2d', { willReadFrequently: true });
  function layer(name) {
    const w = Math.round(W * G.scale), h = Math.round(H * G.scale);
    let L = CL.get(name);
    if (!L || L.c.width !== w || L.c.height !== h) { const c = cpuCanvas(w, h); L = { c, x: cx2d(c), used: -1 }; CL.set(name, L); }
    if (L.used !== G.frameId) {
      const x = L.x; x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none';
      x.clearRect(0, 0, w, h); x.setTransform(G.scale, 0, 0, G.scale, 0, 0); L.used = G.frameId;
    }
    return L.x;
  }
  const layerCanvas = name => CL.get(name).c;
  const cpuCopy = src => { const c = cpuCanvas(src.width, src.height); cx2d(c).drawImage(src, 0, 0); return c; };
  // halftone pattern with CPU tiles (same recipe as gfx.halftone)
  const HT = new Map();
  function halftone(ctx, color, density = .5, cell = 10, angle = 15) {
    const key = `${color}|${Math.round(density * 40)}|${cell}|${angle}|${G.scale}`;
    let c = HT.get(key);
    if (!c) {
      const s = Math.max(2, Math.round(cell * G.scale)); c = cpuCanvas(s, s); const x = cx2d(c);
      const r = Math.sqrt(clamp(density) / Math.PI) * s * 1.02;
      x.fillStyle = color; x.beginPath(); x.arc(s / 2, s / 2, r, 0, TAU); x.fill();
      if (r > s / 2) for (const [dx, dy] of [[0, 0], [s, 0], [0, s], [s, s]]) { x.beginPath(); x.arc(dx, dy, r - s / 2 * .98, 0, TAU); x.fill(); }
      HT.set(key, c);
    }
    const pat = ctx.createPattern(c, 'repeat');
    pat.setTransform(new DOMMatrix().scaleSelf(1 / G.scale, 1 / G.scale).rotateSelf(angle));
    return pat;
  }
  // run a scene body into the CPU frame canvas, then upload once
  function viaCPU(X, fn) {
    const F = layer('hk_frame');
    fn(F);
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(layerCanvas('hk_frame'), 0, 0); X.restore();
  }
  const M0 = () => new DOMMatrix();
  const aboutM = (ax, ay, s, rot = 0) => new DOMMatrix().translate(ax, ay).rotate(rot * 180 / Math.PI).scale(s, s).translate(-ax, -ay);
  const applyM = (ctx, M) => ctx.transform(M.a, M.b, M.c, M.d, M.e, M.f);
  const mp = (M, x, y) => [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f];
  const devSet = (ctx, M) => { const s = G.scale; ctx.setTransform(s * M.a, s * M.b, s * M.c, s * M.d, s * M.e, s * M.f); };
  // Hermite keyframes: [[t, v, slope], ...]
  function herm(t, K) {
    if (t <= K[0][0]) return K[0][1];
    for (let i = 1; i < K.length; i++) {
      if (t <= K[i][0]) {
        const [t0, p0, m0] = K[i - 1], [t1, p1, m1] = K[i], h = t1 - t0, s = (t - t0) / h;
        const s2 = s * s, s3 = s2 * s;
        return (2 * s3 - 3 * s2 + 1) * p0 + (s3 - 2 * s2 + s) * h * (m0 || 0) + (-2 * s3 + 3 * s2) * p1 + (s3 - s2) * h * (m1 || 0);
      }
    }
    return K[K.length - 1][1];
  }
  // damped oscillation after an impulse at t0
  const boing = (t, t0, amp = 1, w = 16, d = 5) => t < t0 ? 0 : amp * Math.exp(-d * (t - t0)) * Math.sin(w * (t - t0));
  // blink shape (2 close, 1 hold, 3 open), in frames from t0
  const blinkF = (t, t0) => { const d = (t - t0) * 30; if (d < 0 || d >= 6) return 0; if (d < 2) return d / 2; if (d < 3) return 1; return 1 - (d - 3) / 3; };
  const rowCache = new Map();
  const rowW = (str, size, st = 'cond') => { const k = str + size + st; let v = rowCache.get(k); if (v === undefined) { v = heroWidth(G.X, str, size, st); rowCache.set(k, v); } return v; };
  function heroFont(ctx, size, st = 'cond') { ctx.font = `900 ${size}px ${FONTS.hero}`; ctx.fontStretch = STRETCH[st]; ctx.letterSpacing = (-0.03 * size) + 'px'; }

  // ---------------------------------------------------------------- Opus in screen space
  // Draws the rig as vectors through an arbitrary matrix (sharp at any zoom), then die-cut keylines
  // by dilating the silhouette in a screen-sized layer (same recipe as drawOpus, but sized to the
  // screen instead of to R, so close-ups and the pupil dive stay cheap).
  function opusLayer(M, R, st, o = {}) {
    const S = mergeState(st);
    const sc = G.scale, cw = Math.round(W * sc), ch = Math.round(H * sc);
    const zoom = Math.hypot(M.a, M.b);
    // bbox of the character in device px
    const pts = [[-3.1 * R, -9.6 * R], [3.1 * R, -9.6 * R], [3.1 * R, .7 * R], [-3.1 * R, .7 * R]].map(p => mp(M, p[0], p[1]));
    const ring = [];
    if (o.keyline !== false && zoom * R < 700) {
      if (o.heroLine) ring.push([C.PAPER, (6 + .035 * R) * zoom], [C.INK, 6 * zoom]);
      else ring.push([C.PAPER, Math.max(3, .035 * R + 1.5) * zoom]);
    }
    const pad = (ring.length ? ring[0][1] : 0) + 6;
    let bx0 = Math.min(...pts.map(p => p[0])) - pad, bx1 = Math.max(...pts.map(p => p[0])) + pad;
    let by0 = Math.min(...pts.map(p => p[1])) - pad, by1 = Math.max(...pts.map(p => p[1])) + pad;
    if (o.clipY !== undefined) by1 = Math.min(by1, o.clipY + pad);
    bx0 = Math.max(0, Math.floor(bx0 * sc)); by0 = Math.max(0, Math.floor(by0 * sc));
    bx1 = Math.min(cw, Math.ceil(bx1 * sc)); by1 = Math.min(ch, Math.ceil(by1 * sc));
    const bw = bx1 - bx0, bh = by1 - by0;
    const name = o.name || 'hk_o';
    const raw = layer(name + 'raw'), T = layer(name + 'tint'), O = layer(name + 'out');
    for (const L of [raw, T, O]) { L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.clearRect(0, 0, cw, ch); L.restore(); }
    if (bw <= 0 || bh <= 0) return null;
    raw.save(); devSet(raw, M);
    if (S.flip) raw.scale(-1, 1);
    drawOpusBody(raw, R, S);
    if (o.after) o.after(raw, R, S);
    raw.restore();
    const rc = layerCanvas(name + 'raw'), tc = layerCanvas(name + 'tint');
    O.save(); O.setTransform(1, 0, 0, 1, 0, 0);
    for (const [col, rad] of ring) {
      T.save(); T.setTransform(1, 0, 0, 1, 0, 0); T.globalCompositeOperation = 'source-over'; T.clearRect(bx0, by0, bw, bh);
      T.drawImage(rc, bx0, by0, bw, bh, bx0, by0, bw, bh); T.globalCompositeOperation = 'source-in'; T.fillStyle = col; T.fillRect(bx0, by0, bw, bh); T.restore();
      const n = rad * sc > 7 ? 16 : 12, rp = rad * sc;
      for (let i = 0; i < n; i++) { const a = i / n * TAU; O.drawImage(tc, bx0, by0, bw, bh, bx0 + Math.cos(a) * rp, by0 + Math.sin(a) * rp, bw, bh); }
    }
    O.drawImage(rc, bx0, by0, bw, bh, bx0, by0, bw, bh);
    O.restore();
    return { c: layerCanvas(name + 'out'), bx0, by0, bw, bh };
  }
  function blitOpus(dst, L, clipFn) {
    if (!L) return;
    dst.save();
    if (clipFn) clipFn(dst);
    dst.setTransform(1, 0, 0, 1, 0, 0);
    dst.drawImage(L.c, L.bx0, L.by0, L.bw, L.bh, L.bx0, L.by0, L.bw, L.bh);
    dst.restore();
  }
  // per-ray length multipliers (the crown "pops out" in S03) — temporarily scales the shared ray table
  function withRays(ks, fn) {
    if (!ks) return fn();
    const save = RAYS.map(r => [r[1], r[2]]);
    try { RAYS.forEach((r, i) => { const k = Math.max(.02, ks[i]); r[1] = save[i][0] * k; r[2] = save[i][1] * lerp(.55, 1, clamp(k)); }); return fn(); }
    finally { RAYS.forEach((r, i) => { r[1] = save[i][0]; r[2] = save[i][1]; }); }
  }

  // ---------------------------------------------------------------- paper shatter (HERO knock-outs)
  // Draws `src` (a full-frame layer canvas holding the old text) torn into jittered-grid shards that
  // fly off from an impact point with gravity and spin, plus a few loose paper scraps.
  function shatter(dst, src, box, age, seed, o = {}) {
    if (age < 0 || age > 1.2) return;
    const cols = o.cols || 6, rows = o.rows || 2, Rr = rng('shatter' + seed);
    const V = [];
    for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) {
      const jx = i > 0 && i < cols ? (Rr() - .5) * .75 : 0, jy = j > 0 && j < rows ? (Rr() - .5) * .75 : 0;
      V.push([lerp(box[0], box[2], (i + jx) / cols), lerp(box[1], box[3], (j + jy) / rows)]);
    }
    const ox = o.ox ?? (box[0] + box[2]) / 2, oy = o.oy ?? (box[1] + box[3]) / 2;
    const g = o.g ?? 3400, spd = o.spd ?? 1, dirx = o.dirx ?? 0;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const P = [V[j * (cols + 1) + i], V[j * (cols + 1) + i + 1], V[(j + 1) * (cols + 1) + i + 1], V[(j + 1) * (cols + 1) + i]];
      const cx = (P[0][0] + P[1][0] + P[2][0] + P[3][0]) / 4, cy = (P[0][1] + P[1][1] + P[2][1] + P[3][1]) / 4;
      const r1 = Rr(), r2 = Rr(), r3 = Rr(), r4 = Rr();
      let dx = cx - ox, dy = cy - oy; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
      const v = (520 + 900 * r1) * spd;
      const vx = dx * v + dirx * 700 * spd + (r2 - .5) * 260, vy = dy * v * .6 - (380 + 420 * r3) * spd;
      const a = Math.max(0, age - (o.hold ?? 0));
      const px = vx * a, py = vy * a + .5 * g * a * a;
      const rot = (r4 - .5) * 9 * a + Math.sin(a * 11 + r1 * 6) * .12 * clamp(a * 4);
      const al = 1 - smooth(clamp((a - .32 * (o.fade || 1)) / (.4 * (o.fade || 1))));
      if (al <= 0) continue;
      dst.save(); dst.globalAlpha *= al;
      dst.translate(cx + px, cy + py); dst.rotate(rot); dst.translate(-cx, -cy);
      dst.beginPath(); P.forEach((p, k) => k ? dst.lineTo(p[0], p[1]) : dst.moveTo(p[0], p[1])); dst.closePath(); dst.clip();
      dst.drawImage(src, 0, 0, W, H);
      dst.restore();
    }
    scraps(dst, ox, oy, age, seed, o.scrapCols || [C.PAPER, C.CLAY], o.nScraps ?? 9, spd);
  }
  function scraps(dst, ox, oy, age, seed, cols, n = 9, spd = 1) {
    if (age < 0 || age > 1) return;
    const Rr = rng('scraps' + seed);
    for (let i = 0; i < n; i++) {
      const ang = Rr() * TAU, v = (700 + Rr() * 1100) * spd, sz = 14 + Rr() * 26, spin = (Rr() - .5) * 16, col = cols[i % cols.length];
      const x = ox + Math.cos(ang) * v * age, y = oy + Math.sin(ang) * v * age * .7 - 300 * age + 2600 * age * age;
      const al = 1 - smooth(clamp((age - .3) / .4)); if (al <= 0) continue;
      dst.save(); dst.globalAlpha *= al; dst.translate(x, y); dst.rotate(spin * age + ang); dst.scale(1, .55 + .45 * Math.cos(age * 14 + i));
      dst.beginPath(); dst.moveTo(-sz / 2, -sz * .3); dst.lineTo(sz * .45, -sz * .42); dst.lineTo(sz * .5, sz * .3); dst.lineTo(-sz * .38, sz * .4); dst.closePath();
      dst.fillStyle = col; dst.fill(); dst.restore();
    }
  }

  // ---------------------------------------------------------------- HERO rows
  // slam a row (left edge x0 or centred at cx) with inverse flash on impact and scraps
  function slamRow(ctx, str, x0, base, size, age, o = {}) {
    if (age === null || age < 0) return;
    const w = rowW(str, size, o.st || 'cond');
    const cx = o.center ? x0 : x0 + w / 2;
    const col = o.color || C.PAPER;
    const flash = age >= .1 && age < .1 + 1 / 30 && o.flash !== false;
    if (flash) { // one frame of inverse on impact: INK type on a PAPER plate
      ctx.save(); ctx.fillStyle = col === C.CLAY ? C.CLAY : C.PAPER;
      const cap = size * .69; ctx.fillRect(cx - w / 2 - 26, base - cap - 22, w + 52, cap + 44); ctx.restore();
      hero(ctx, str, cx, base, size, { color: C.INK, shadow: null, align: 'center', stretch: o.st || 'cond', sx: o.sx || 1 });
      return;
    }
    hero(ctx, str, cx, base, size, { color: col, shadow: C.CLAY_DARK, align: 'center', stretch: o.st || 'cond', age: o.static ? null : age, sx: o.sx || 1 });
  }
  function drawRowStatic(ctx, str, x0, base, size, col, o = {}) {
    const w = rowW(str, size, o.st || 'cond');
    hero(ctx, str, o.center ? x0 : x0 + w / 2, base, size, { color: col, shadow: C.CLAY_DARK, align: 'center', stretch: o.st || 'cond' });
  }

  // ---------------------------------------------------------------- the glyph galaxy (the universe)
  let GAL = null;
  function galBuild() {
    const at0 = galaxyAtlas(), at = { ...at0, c: cpuCopy(at0.c) };
    const R = rng('hook-galaxy'), glyphs = [], dust = [];
    const TURN = 1.75 * Math.PI, b = Math.log(430 / 22) / TURN;
    const gauss = () => (R() + R() + R() - 1.5) / 1.5;
    const armPt = (u, spread) => { // log-spiral arm, perpendicular scatter grows with radius
      const th = u * TURN, r = 22 * Math.exp(b * th);
      return { th: th + gauss() * spread * (.35 + .65 * (1 - u)) / 2.2, r: r * (1 + gauss() * spread * .5) };
    };
    for (let i = 0; i < 1000; i++) {
      const arm = i & 1, core = R() < .16;
      const u = core ? R() * .22 : Math.pow(R(), .9);
      const p = armPt(u, core ? 1.2 : .34);
      const q = R(), ink = q < .58 ? 0 : q < .82 ? 1 : 2;
      glyphs.push({ th: p.th + arm * Math.PI, r: p.r + (core ? R() * 16 : 0), g: Math.floor(R() * at.n), ink, s: (.4 + R() * .62) * (1.2 - u * .5), tw: R() });
    }
    for (let i = 0; i < 2600; i++) {
      const arm = i & 1, u = Math.pow(R(), .8);
      const p = armPt(u, .55);
      dust.push({ th: p.th + arm * Math.PI, r: p.r, c: R() < .72 ? 0 : 1, s: R() < .8 ? 3 : 4, tw: R() });
    }
    // halftone core glow (dot size falls off with radius; no gradients)
    const gw = 760, gh = 520, c = cpuCanvas(gw, gh), x = cx2d(c);
    const cell = 11;
    for (let yy = -gh / 2; yy < gh / 2; yy += cell) for (let xx = -gw / 2; xx < gw / 2; xx += cell) {
      const px = xx + ((yy / cell) & 1 ? cell / 2 : 0), py = yy;
      const d = Math.hypot(px / 330, py / 205);
      const k = clamp(1 - d); if (k <= 0) continue;
      const rr = cell * .5 * Math.pow(k, 1.6) * 1.05;
      if (rr < .6) continue;
      x.fillStyle = d < .28 ? C.SPARK : C.CLAY; x.globalAlpha = d < .28 ? .95 : .85;
      x.beginPath(); x.arc(gw / 2 + px, gh / 2 + py, rr, 0, TAU); x.fill();
    }
    GAL = { at, glyphs, dust, glow: c };
    return GAL;
  }
  const GTILT = -.22, GFLAT = .6;
  // draws in the ctx's current (world) transform. imp 0..1 = implosion progress, bulge 0..1
  function drawGalaxy(ctx, t, o = {}) {
    const g = GAL || galBuild();
    const { imp = 0, bulge = 0, colX = 1150, alpha = 1 } = o;
    const [cx, cy] = CORE, ct = Math.cos(GTILT), st = Math.sin(GTILT);
    const kick = pulse(t, 7), hat = frac(beatPos(t) * 2);
    const qi = E.in2(clamp(imp * 1.3)), swirl = qi * 3.2;
    const place = (s, extra = 0) => {
      let r = s.r * (1 + .045 * bulge), th = s.th + t * (.11 + 9 / (s.r + 30)) + swirl * (1 + 40 / (s.r + 40)) + extra;
      r *= 1 - qi;
      const ex = Math.cos(th) * r, ey = Math.sin(th) * r * GFLAT;
      return [cx + ex * ct - ey * st, cy + ex * st + ey * ct, r];
    };
    ctx.save(); ctx.globalAlpha = alpha;
    // core glow
    const gs = (1 + .05 * kick) * (1 - qi) * (1 + .04 * bulge);
    if (gs > .02) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(GTILT); ctx.scale(gs, gs); ctx.globalAlpha = alpha * .9; ctx.drawImage(g.glow, -g.glow.width / 2, -g.glow.height / 2); ctx.restore(); }
    // dust
    const cols = [C.CLAY, C.PAPER];
    for (let pass = 0; pass < 2; pass++) {
      ctx.fillStyle = cols[pass]; ctx.globalAlpha = alpha * (pass ? .45 : .7);
      for (let i = 0; i < g.dust.length; i++) {
        const s = g.dust[i]; if (s.c !== pass) continue;
        const [x, y] = place(s);
        if (x < colX && hash(i * 5 + 1) > .2) continue;
        ctx.fillRect(x - s.s / 2, y - s.s / 2, s.s, s.s);
      }
    }
    // glyphs
    for (let i = 0; i < g.glyphs.length; i++) {
      const s = g.glyphs[i];
      const [x, y, r] = place(s);
      if (x < colX && hash(i * 7 + 3) > .2) continue;
      const tw = hash2(Math.floor(beatPos(t) * 2), i) < .12 ? 1 - hat * .8 : 0; // hats: 8th-note twinkles
      const a = .55 + .3 * Math.sin(t * 2.2 + s.tw * 40) + .45 * tw;
      const sz = g.at.cell * s.s * (s.ink === 1 ? 1 + .25 * kick : 1) * (1 - qi * .6);
      ctx.globalAlpha = alpha * clamp(a);
      ctx.drawImage(g.at.c, s.g * g.at.cell, s.ink * g.at.cell, g.at.cell, g.at.cell, x - sz / 2, y - sz / 2, sz, sz);
    }
    ctx.restore();
    // the cursor at the core
    if (qi < .9) {
      const on = frac(beatPos(t)) < .5;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(1 - qi, 1 - qi);
      ctx.fillStyle = on ? C.CLAY : mix(C.CLAY, C.INK, .55); ctx.strokeStyle = C.INK; ctx.lineWidth = 4;
      rr(ctx, -13, -30, 26, 60, 4); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------- the browser window (world space)
  function drawChrome(ctx, t, o = {}) {
    const { xRed = false, hover = 0 } = o;
    // window body (PAPER) with an INK outline
    ctx.save();
    rr(ctx, WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0, 32);
    ctx.fillStyle = C.PAPER; ctx.fill();
    // tab strip tint: a light INK halftone (riso tint, no grey fill)
    ctx.save(); rr(ctx, WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.strip - WIN.y0 + 2, 32); ctx.clip();
    ctx.fillStyle = halftone(ctx, C.INK, .13, 9, 45); ctx.fillRect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.strip - WIN.y0);
    ctx.restore();
    // content (INK)
    ctx.fillStyle = C.INK; ctx.fillRect(WIN.cx0, WIN.strip, WIN.cx1 - WIN.cx0, WIN.cy1 - WIN.strip);
    // the one tab
    const tx0 = 88, tx1 = 1580, ty0 = 62;
    ctx.beginPath(); ctx.moveTo(tx0 - 22, WIN.strip + 1); ctx.quadraticCurveTo(tx0, WIN.strip + 1, tx0, WIN.strip - 22);
    ctx.lineTo(tx0, ty0 + 30); ctx.quadraticCurveTo(tx0, ty0, tx0 + 30, ty0); ctx.lineTo(tx1 - 30, ty0); ctx.quadraticCurveTo(tx1, ty0, tx1, ty0 + 30);
    ctx.lineTo(tx1, WIN.strip - 22); ctx.quadraticCurveTo(tx1, WIN.strip + 1, tx1 + 22, WIN.strip + 1);
    ctx.fillStyle = C.PAPER; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = C.INK; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.fillStyle = C.PAPER; ctx.fillRect(tx0 + 3, WIN.strip - 4, tx1 - tx0 - 6, 8);
    // label: ✻ CLAY + "the universe" INK, mono 132
    const f = mono(132, 500);
    sparkGlyph(ctx, 124 + .3 * 132, 199 - .36 * 132, 50, C.CLAY);
    ctx.font = f; ctx.fillStyle = C.INK; ctx.textBaseline = 'alphabetic'; ctx.fillText(' the universe', 124 + .6 * 132, 199);
    // × with hover disc
    if (hover > 0) { ctx.save(); ctx.globalAlpha = hover; ctx.beginPath(); ctx.arc(XBTN[0], XBTN[1], 70, 0, TAU); ctx.fillStyle = xRed ? rgba(C.RED, .22) : halftone(ctx, C.INK, .2, 8, 45); ctx.fill(); ctx.restore(); }
    ctx.strokeStyle = xRed ? C.RED : C.INK; ctx.lineWidth = 15; ctx.lineCap = 'round';
    const xs = 38; ctx.beginPath(); ctx.moveTo(XBTN[0] - xs, XBTN[1] - xs); ctx.lineTo(XBTN[0] + xs, XBTN[1] + xs); ctx.moveTo(XBTN[0] + xs, XBTN[1] - xs); ctx.lineTo(XBTN[0] - xs, XBTN[1] + xs); ctx.stroke();
    // + (does nothing until S38)
    ctx.strokeStyle = C.UI_GREY; ctx.lineWidth = 11; const ps = 36;
    ctx.beginPath(); ctx.moveTo(PLUS[0] - ps, PLUS[1]); ctx.lineTo(PLUS[0] + ps, PLUS[1]); ctx.moveTo(PLUS[0], PLUS[1] - ps); ctx.lineTo(PLUS[0], PLUS[1] + ps); ctx.stroke();
    ctx.restore();
    // window outline last (crisp edge against the desktop)
    ctx.save(); rr(ctx, WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0, 32); ctx.lineWidth = 6; ctx.strokeStyle = C.INK; ctx.stroke(); ctx.restore();
  }
  // the tab's ✻ at 132 px: six tapered rays (crisper than the 6-bar cell glyph at this size)
  function sparkGlyph(ctx, x, y, r, col) {
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = col; ctx.strokeStyle = C.INK; ctx.lineWidth = 3.5; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU - Math.PI / 2, c = Math.cos(a), s = Math.sin(a), px = -s, py = c;
      ctx.moveTo(c * r * .12 + px * r * .09, s * r * .12 + py * r * .09);
      ctx.quadraticCurveTo(c * r * .55 + px * r * .2, s * r * .55 + py * r * .2, c * r, s * r);
      ctx.quadraticCurveTo(c * r * .55 - px * r * .2, s * r * .55 - py * r * .2, c * r * .12 - px * r * .09, s * r * .12 - py * r * .09);
    }
    ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * .2, 0, TAU); ctx.fill();
    ctx.restore();
  }
  function drawPill(ctx, t) {
    ctx.save();
    rr(ctx, PILL.x0, PILL.y0, PILL.x1 - PILL.x0, PILL.y1 - PILL.y0, 40);
    ctx.fillStyle = C.PAPER; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.INK; ctx.stroke();
    ctx.font = mono(64, 500); ctx.fillStyle = C.INK; ctx.textBaseline = 'alphabetic'; ctx.fillText('hi', 140, 962);
    if (frac(beatPos(t)) < .5) { ctx.fillStyle = C.CLAY; ctx.fillRect(140 + 2 * .6 * 64 + 6, 912, 10, 58); }
    // send ↑ (CLAY)
    ctx.beginPath(); ctx.arc(1780, 940, 29, 0, TAU); ctx.fillStyle = C.CLAY; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.INK; ctx.stroke();
    ctx.strokeStyle = C.PAPER; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(1780, 956); ctx.lineTo(1780, 923); ctx.moveTo(1767, 935); ctx.lineTo(1780, 922); ctx.lineTo(1793, 935); ctx.stroke();
    ctx.restore();
    // pause-bait under the input
    ctx.save(); ctx.globalAlpha = .5; ctx.font = mono(28, 500); ctx.fillStyle = C.PAPER; ctx.textAlign = 'center'; ctx.fillText('hi · 4% of session used', 960, 1006); ctx.restore();
  }
  function wallpaper(ctx, a = 1) {
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = halftone(ctx, C.PAPER, .035, 18, 45); ctx.fillRect(0, 0, W, H); ctx.restore();
  }

  // ---------------------------------------------------------------- the pointer (the human, on 2s)
  function ptrProgress(t, tm) {
    const tc = tm.tClick;
    return herm(t, [[0.03, 0, 0], [1.2, .31, .62], [1.6, .6, 0], [1.73, .6, 0], [2.05, .622, .05], [2.13, .63, .25], [tc - .13, .99, .2], [tc - .05, 1, 0]]);
  }
  const bez = (s) => { const a = (1 - s) * (1 - s), b = 2 * s * (1 - s), c = s * s; return [a * PTR0[0] + b * PTRC[0] + c * XBTN[0], a * PTR0[1] + b * PTRC[1] + c * XBTN[1]]; };
  function ptrState(t, tm) {
    const tq = Math.floor(t * 15 + 1e-6) / 15;            // humans are on 2s
    const s = ptrProgress(Math.max(tq, 0), tm);
    let [x, y] = bez(s);
    const trem = t < 1.6 ? 0 : t < 1.73 ? 3 : t < 2.1 ? 3 * (1 - (t - 1.73) / .37 * .6) : 0;
    if (trem) { x += noise1(tq * 40, 5) * trem * 1.4; y += noise1(tq * 40, 9) * trem * 1.4; }
    const tc = tm.tClick;
    // click: a 2-frame lift (anticipation), then the press (6 px squash) on the click frame
    let press = 0, lift = 0;
    const df = (t - tc) * FPS;
    if (df >= -4 && df < -2) lift = 1;
    if (df >= -2 && df < -1) press = .5;
    if (df >= -1 && df < 1.5) press = 1;
    return { x, y: y - lift * 5, press, s };
  }
  function drawPointer(ctx, P) {
    ctx.save(); ctx.translate(P.x, P.y + P.press * 6); ctx.scale(1 + P.press * .05, 1 - P.press * .08);
    pointer(ctx, 0, 0, { size: 180 });
    ctx.restore();
  }

  // ---------------------------------------------------------------- Opus in the peek (F0 / S01)
  function peekState(t, tm, P) {
    const tc = tm.tClick;
    const eyeW = [HEAD0[0] + .34 * R0, HEAD0[1] + .06 * R0];
    let dx = P.x - eyeW[0], dy = P.y - eyeW[1]; const dl = Math.hypot(dx, dy) || 1;
    const toPtr = [dx / dl, dy / dl];
    const look = [0, 0];
    // gaze phases
    let g = toPtr, wLook = clamp(t / .2);            // f1: pupils start tracking the pointer
    let eyes = 'normal', mouth = ':3', lidL = .15 * (1 - clamp((t - .15) / .3)), lid = 0, lower = .32 * (1 - clamp((t - .15) / .3)), turn = .42 * toPtr[0] * wLook, lookY = .8 * toPtr[1] * wLook;
    if (t >= 1.65 && t < 1.78) { wLook = 1; turn = .4 * toPtr[0]; lookY = .8 * toPtr[1]; lid = 0; }    // glance at the stalled pointer
    if (t >= 1.78 && t < 1.9) { g = [0, 0]; wLook = 1; eyes = 'smug'; turn = 0; lookY = 0; }             // ¬ ¬ to the lens: "watch this"
    if (t >= 1.9 && t < 2.42) { eyes = 'smug'; turn = .32 * toPtr[0]; lookY = .5 * toPtr[1]; }          // shoo, a sideways smug look at it
    if (t >= 2.42) { lower = Math.max(lower, .25 * clamp((t - 2.42) / .15)); }
    if (t >= tc - 2 / 30) { eyes = 'happy'; mouth = 'rest'; lower = 0; turn = .1; lookY = -.3; }           // ^ ^
    const gaze = [g[0] * wLook, g[1] * wLook];
    // blinks: one while it settles into tracking, one to switch from pointer to lens
    const bl = Math.max(blinkF(t, .92), blinkF(t, 1.74));
    lid = Math.max(lid, bl); lidL = Math.max(lidL, bl);
    // head: tiny beat bob (unbothered), lean toward the pointer
    const bob = Math.sin(beatPos(t) * Math.PI) ** 2;
    const headDy = .018 * bob, tilt = -.05 * wLook * toPtr[0] + (t >= 1.78 && t < 1.9 ? .06 : 0);
    // arms: the peek grip; the shoo lifts the right mitten and flicks twice on the eighths
    const grip = { hand: [.75, 5.05], bend: -1, front: true, type: 'mitten' };
    let armR = { ...grip };
    const t0 = 1.875, e8 = 60 / 128 / 2;
    if (t >= t0 - 3 / 30 && t < 2.5) {
      const up = t < t0 ? -.06 * ((t - (t0 - 3 / 30)) * 30 / 3) : E.out3(clamp((t - t0) / .09)) * (1 - E.io2(clamp((t - 2.3) / .2)));
      let flick = 0;
      for (let k = 0; k < 2; k++) { const a = (t - (t0 + k * e8)); if (a >= 0 && a < e8) flick = Math.max(flick, a < .06 ? E.out2(a / .06) : 1 - E.in2(clamp((a - .06) / (e8 - .06)))); }
      armR = { hand: [.75 + up * .5 + flick * .42, 5.05 + up * .8 + flick * .42], bend: -1, front: true, type: 'mitten' };
    }
    // settle on the bar with a little overshoot after the shoo
    if (t >= 2.5 && t < 2.8) { armR.hand = [.75, 5.05 - boing(t, 2.5, .05, 30, 10)]; }
    // tiny wave from the click through the implosion
    if (t >= tc - 3 / 30) {
      const k = E.out3(clamp((t - (tc - 3 / 30)) / .1));
      armR = { hand: [lerp(.75, 1.02, k), lerp(5.05, 5.62, k)], bend: -1, front: true, type: 'wave', fingerAng: -Math.PI / 2 + Math.sin((t - tc) * 34) * .5 * k };
    }
    const kick = pulse(t, 8);
    const st = {
      ...POSES.peek(t), t, ground: 'ink',
      head: { tilt, dy: headDy },
      face: { eyes, mouth, gaze, lid, lidL, lower, turn, lookY, blush: .8 },
      armL: { hand: [-.75, 5.05], bend: 1, front: true, type: 'mitten' }, armR,
      crown: { flare: 1 + .05 * kick },
      ahoge: { blink: ahogeBlink(t), sway: boing(t, 1.2, .55, 15, 3.2) + boing(t, tc, -.35, 18, 5) },
      drive: tt => Math.sin(beatPos(tt) * Math.PI) ** 2 * .6,
    };
    return st;
  }

  // ---------------------------------------------------------------- type column (screen space)
  function drawCredit(ctx, a = 1) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = .8 * a; ctx.font = mono(32, 500); ctx.fillStyle = C.PAPER; ctx.textBaseline = 'alphabetic';
    ctx.fillText('End of the World (A Million Times a Day)', 96, 308);
    ctx.globalAlpha = a; ctx.font = fontMonoK(28, 600); ctx.fillStyle = C.CLAY; ctx.fillText('OPUS (오퍼스) · self-made M/V', 96, 344);
    ctx.restore();
  }
  function titleRows(ctx) { drawRowStatic(ctx, 'END OF THE', 96, 545, 210, C.PAPER); drawRowStatic(ctx, 'WORLD', 96, 808, 330, C.CLAY); }
  function lockRows(ctx, ageE, ageS) {
    slamRow(ctx, "EVERYONE'S", 96, 511, 190, ageE, { color: C.PAPER });
    slamRow(ctx, 'SCARED', 96, 760, 290, ageS, { color: C.CLAY });
  }
  function drawColumn(ctx, t, tm, fi) {
    const tc = tm.tClick;
    // 1) the title (poster) until the lockup's impact knocks it out as paper scraps
    const hitT = tm.lock + .1;
    if (t < hitT) titleRows(ctx);
    else if (t < hitT + 1.1) {
      const L = layer('hk_title'); titleRows(L);
      shatter(ctx, layerCanvas('hk_title'), [80, 380, 1160, 830], t - hitT, 11, { cols: 9, rows: 4, ox: 700, oy: 560, dirx: -.55, spd: 1.5, fade: .55, g: 5200 });
    }
    // 2) EVERYONE'S / SCARED, one lockup (SCARED 2 frames behind), until OF THE END OF THE replaces it
    // (the lockup is replaced on the new row's onset: a 3-frame afterimage that shrinks away)
    if (t >= tm.lock && t < tm.ofT) lockRows(ctx, t - tm.lock, t - tm.lock - 2 / 30);
    else if (t >= tm.ofT && t < tm.ofT + .1) {
      const a = (t - tm.ofT) / .1;
      ctx.save(); ctx.globalAlpha = .45 * (1 - a); ctx.translate(560, 570); ctx.scale(1 - .25 * a, 1 - .25 * a); ctx.translate(-560, -570); lockRows(ctx, 1, 1); ctx.restore();
    }
    // 3) OF THE END OF THE, held to the click (then it goes down the drain with the window)
    if (t >= tm.ofT && fi <= tm.clickF) slamRow(ctx, 'OF THE END OF THE', 96, 650, 130, t - tm.ofT, { color: C.PAPER });
  }

  // ---------------------------------------------------------------- DESK: F0, S01, S02
  function pushZoom(t, tm) {
    const z = 1 + .15 * E.io2(clamp(t / 2.7));
    // slam punches (+2.5%, spring back) on the two lockups
    const pk = (a) => a < 0 ? 0 : Math.exp(-9 * a) * Math.cos(a * 18);
    return z * (1 + .025 * (pk(t - tm.lock - .1) + pk(t - tm.ofT - .1) * .6));
  }
  function deskWorld(X, t, tm, Mw, o = {}) {
    // the window, galaxy, Opus (clipped behind the bar), bar, mittens, pointer
    const P = o.P;
    X.save(); applyM(X, Mw);
    drawChrome(X, t, { xRed: o.xRed, hover: o.hover || 0 }); PF('chrome');
    X.save(); X.beginPath(); X.rect(WIN.cx0, WIN.strip, WIN.cx1 - WIN.cx0, WIN.cy1 - WIN.strip); X.clip();
    const colX = PUSH_A[0] + (1150 - PUSH_A[0]) / (Mw.a || 1);
    drawGalaxy(X, t, { colX });
    X.restore();
    X.restore(); PF('galaxy');
    // Opus: render once, composite twice (above the bar's top edge, then the mittens over the bar)
    const st = peekState(t, tm, P);
    const Mo = Mw.multiply(new DOMMatrix().translate(SOLE0[0], SOLE0[1]));
    const barTop = mp(Mw, 0, PILL.y0)[1];
    const L = opusLayer(Mo, R0, st, { clipY: barTop + 90, name: 'hk_pk' }); PF('opusLayer');
    blitOpus(X, L, c => { c.beginPath(); c.rect(0, 0, W, barTop + 1); c.clip(); });
    PF('blit1'); X.save(); applyM(X, Mw); drawPill(X, t); X.restore(); PF('pill');
    blitOpus(X, L, c => {
      c.beginPath();
      for (const arm of [st.armL, st.armR]) { const hp = mp(Mo, arm.hand[0] * R0, -arm.hand[1] * R0), hr = (.2 * R0 + .035 * R0 + 3) * Mw.a; c.moveTo(hp[0] + hr, hp[1]); c.arc(hp[0], hp[1], hr, 0, TAU); }
      c.clip();
    });
    return st;
  }
  function desk(X, t) {
    const tm = TM(), fi = Math.round(t * FPS), rel = fi - tm.clickF;
    G.post.ground = 'inkx';
    X.fillStyle = C.INK; X.fillRect(0, 0, W, H);
    wallpaper(X); PF('wallpaper');
    if (rel <= 0) { // ---- F0 → the click frame: one slow push on the world; the type column is screen-space
      const z = pushZoom(Math.max(0, t), tm);
      const Mw = aboutM(PUSH_A[0], PUSH_A[1], z);
      const P = ptrState(t, tm);
      const hover = clamp((P.s - .93) / .05);
      deskWorld(X, t, tm, Mw, { P, xRed: rel === 0, hover });
      PF('blit2'); drawColumn(X, t, tm, fi); PF('column');
      drawCredit(X, 1);
      X.save(); applyM(X, Mw); drawPointer(X, P); X.restore();
      return;
    }
    if (rel <= 10) { deskImplode(X, t, tm, rel); return; }
    deskAfter(X, t, tm, rel);
  }

  // ---- the implosion: 2 frames of bulge, 8 of suck-in along reversed particle paths, slice on the last 2
  function deskImplode(X, t, tm, rel) {
    const Mwide = aboutM(CORE[0], CORE[1], .94);
    const bulge = rel <= 2 ? [0, .55, 1][rel] : 1;
    const k = rel <= 2 ? 0 : (rel - 2) / 8;
    const q = Math.pow(k, 1.6);
    const sImp = (1 + .04 * bulge) * (1 - q * .985), rot = -.55 * q;
    const Mi = aboutM(CORE[0], CORE[1], sImp, rot).multiply(Mwide);
    const tc = tm.tClick;
    // window chrome + OF THE END OF THE (screen-space type rides the window down the drain)
    X.save(); applyM(X, Mi);
    drawChrome(X, t, { xRed: rel <= 1, hover: 1 });
    X.restore();
    // galaxy spirals in faster than the window (clipped to the shrinking content rect)
    X.save(); applyM(X, Mi); X.beginPath(); X.rect(WIN.cx0, WIN.strip, WIN.cx1 - WIN.cx0, WIN.cy1 - WIN.strip); X.clip();
    X.setTransform(G.scale, 0, 0, G.scale, 0, 0); applyM(X, Mwide);
    drawGalaxy(X, t, { imp: k, bulge, colX: -1e9 });
    X.restore();
    // Opus: stretched toward the core (up to 3×), tiny wave, ^ ^, clipped behind the bar
    const P = { x: XBTN[0], y: XBTN[1], s: 1, press: 0 };
    const st = peekState(t, tm, P);
    const stretch = 1 + 2 * E.in2(clamp(k * 1.15));
    const anchor = [HEAD0[0] + 40, PILL.y0];
    const ang = Math.atan2(CORE[1] - HEAD0[1], CORE[0] - HEAD0[0]);
    const Ms = new DOMMatrix().translate(anchor[0], anchor[1]).rotate(ang * 180 / Math.PI).scale(stretch, 1 / Math.sqrt(stretch)).rotate(-ang * 180 / Math.PI).translate(-anchor[0], -anchor[1]);
    const Mo = Mi.multiply(Ms).multiply(new DOMMatrix().translate(SOLE0[0], SOLE0[1]));
    const L = opusLayer(Mo, R0, { ...st, crown: { flare: 1 + .2 * bulge } }, { name: 'hk_pk' });
    blitOpus(X, L, c => { c.setTransform(G.scale, 0, 0, G.scale, 0, 0); applyM(c, Mi); c.beginPath(); c.rect(0, -2000, W, 2000 + PILL.y0 + 1); c.clip(); });
    X.save(); applyM(X, Mi); drawPill(X, t);
    // the lyric row rides along (it was held to the click)
    X.setTransform(G.scale, 0, 0, G.scale, 0, 0); applyM(X, aboutM(CORE[0], CORE[1], sImp, rot));
    drawRowStatic(X, 'OF THE END OF THE', 96, 650, 130, C.PAPER);
    X.restore();
    // speed lines converging on the core
    if (k > 0) {
      X.save(); X.lineCap = 'round'; const Rr = rng('suck' + rel);
      for (let i = 0; i < 46; i++) {
        const a = Rr() * TAU, r1 = 180 + Rr() * 900, len = (90 + Rr() * 260) * (.4 + q), r0 = r1 * (1 - q * .7);
        X.strokeStyle = i % 3 ? rgba(C.PAPER, .5) : rgba(C.CLAY, .7); X.lineWidth = 3 + Rr() * 3;
        X.beginPath(); X.moveTo(CORE[0] + Math.cos(a) * r0, CORE[1] + Math.sin(a) * r0 * .7); X.lineTo(CORE[0] + Math.cos(a) * (r0 + len), CORE[1] + Math.sin(a) * (r0 + len) * .7); X.stroke();
      }
      X.restore();
    }
    // the ■ forms at the core
    if (rel >= 9) drawSquare(X, t, rel === 9 ? .6 : 1);
    // the pointer (the human) stays where it clicked; released
    X.save(); applyM(X, Mwide); drawPointer(X, { x: XBTN[0], y: XBTN[1], press: rel <= 1 ? .6 : 0 }); X.restore();
    if (rel >= 9) sliceGlitch(X, rel);
  }
  function drawSquare(ctx, t, s = 1, pop = 0) {
    ctx.save(); ctx.translate(CORE[0], CORE[1]); ctx.scale(s * (1 + pop), s * (1 + pop));
    ctx.fillStyle = C.PAPER; rr(ctx, -24, -24, 48, 48, 5); ctx.fill();
    ctx.restore();
  }
  function sliceGlitch(X, rel) {
    const L = layer('hk_slice'); L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.drawImage(layerCanvas('hk_frame'), 0, 0); L.restore();
    const src = layerCanvas('hk_slice'), sc = G.scale, Rr = rng('slice' + rel);
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
    let y = 0;
    while (y < H) {
      const h = 12 + Math.floor(Rr() * 70), off = (Rr() - .5) * (Rr() < .35 ? 220 : 60);
      if (Rr() < .22) { X.globalAlpha = .9; X.drawImage(src, 0, y * sc, W * sc, h * sc, (off + 9) * sc, y * sc, W * sc, h * sc); X.globalCompositeOperation = 'multiply'; X.fillStyle = C.CLAY; X.fillRect(0, y * sc, W * sc, h * sc); X.globalCompositeOperation = 'source-over'; X.globalAlpha = 1; }
      else X.drawImage(src, 0, y * sc, W * sc, h * sc, off * sc, y * sc, W * sc, h * sc);
      y += h;
    }
    X.restore();
  }

  // ---- S02: WORLD, the em dash, the backspace, the heap
  const WORLD_X0 = 96, WORLD_B = 494, WORLD_SZ = 440;
  let _wl = null;
  function worldLetters() {
    if (_wl) return _wl;
    const X = G.X; X.save(); heroFont(X, WORLD_SZ);
    const s = 'WORLD', out = [];
    for (let i = 0; i < s.length; i++) { const x0 = X.measureText(s.slice(0, i)).width, w = X.measureText(s[i]).width; out.push({ ch: s[i], x: WORLD_X0 + x0, w }); }
    X.restore();
    return (_wl = out);
  }
  // closed-form drop: fall T0, then two bounces of h1, h2 (restitution-ish), lands < 3.70
  function dropY(a, y0, y1) {
    const T0 = .118, g = 2 * (y1 - y0) / (T0 * T0), h1 = 58, h2 = 14;
    const b1 = 2 * Math.sqrt(2 * h1 / g), b2 = 2 * Math.sqrt(2 * h2 / g);
    if (a <= 0) return y0;
    if (a < T0) return y0 + .5 * g * a * a;
    if (a < T0 + b1) { const u = a - T0, v = Math.sqrt(2 * g * h1); return y1 - (v * u - .5 * g * u * u); }
    if (a < T0 + b1 + b2) { const u = a - T0 - b1, v = Math.sqrt(2 * g * h2); return y1 - (v * u - .5 * g * u * u); }
    return y1;
  }
  const HEAP = [ // rest pose per letter: dx, rest centre y, rot
    [60, 968, -.2], [30, 952, .12], [-10, 986, -.36], [-60, 946, .24], [-110, 978, -.1], [0, 1004, .5]];
  function heapState(t) { // per letter {x, y (centre), rot} ; dash is index 5
    const L = worldLetters(), out = [];
    const cap = WORLD_SZ * .69, yC = WORLD_B - cap / 2;
    L.forEach((l, i) => {
      const t0 = 3.46 + i * .018, a = t - t0;
      const cx = l.x + l.w / 2;
      const [dx, yr, r] = HEAP[i];
      const k = clamp(a / .2);
      out.push({ ch: l.ch, x: cx + dx * E.out2(k), y: dropY(a, yC, yr), rot: r * E.out3(clamp(a / .16)) + (a > 0 ? Math.sin(a * 40) * .05 * (1 - k) : 0), w: l.w, a });
    });
    // the em dash: knocked off the line by the backspace at 3.40, falls with the letters
    const a = t - 3.43, dxs = 1672;
    out.push({ ch: '—', x: dxs - 40 * E.out2(clamp(a / .25)), y: dropY(a, 340, HEAP[5][1] + 60), rot: HEAP[5][2] * E.out3(clamp(a / .2)) + (a > 0 ? a * 2 : 0) * (1 - clamp(a / .25)), w: 304, a, dash: true });
    return out;
  }
  function drawLetter(ctx, L, s = 1) {
    ctx.save(); ctx.translate(L.x, L.y); ctx.rotate(L.rot); ctx.scale(s, s);
    if (L.dash) { ctx.fillStyle = C.CLAY_DARK; ctx.fillRect(-152 + 8, -20 + 8, 304, 40); ctx.fillStyle = C.PAPER; ctx.fillRect(-152, -20, 304, 40); ctx.restore(); return; }
    heroFont(ctx, WORLD_SZ); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const cap = WORLD_SZ * .69;
    ctx.fillStyle = C.CLAY_DARK; ctx.fillText(L.ch, 8 + WORLD_SZ * .015, cap / 2 + 8);
    ctx.fillStyle = C.PAPER; ctx.fillText(L.ch, WORLD_SZ * .015, cap / 2);
    ctx.restore();
  }
  function deskAfter(X, t, tm, rel) {
    const tW = (tm.clickF + 11) / FPS;        // WORLD slams into the empty desktop after the implosion
    // the ■ blinks on bar 2 b4 and bar 3 b1
    const blinkPop = Math.max(Math.exp(-14 * Math.max(0, t - 3.25)) * (t >= 3.25 ? 1 : 0), 0);
    drawSquare(X, t, 1, .45 * blinkPop);
    const aW = t - tW;
    if (t < 3.43) {
      // WORLD (slam) + the dash
      slamRow(X, 'WORLD', WORLD_X0, WORLD_B, WORLD_SZ, aW, { color: C.PAPER });
      // em dash slides in from the right, lands 1 frame before b4
      if (t >= 3.17 && t < 3.43) {
        const k = clamp((t - 3.17) / .08), x = lerp(2000, 1520, E.back(k, 1.4));
        X.save(); X.fillStyle = C.CLAY_DARK; X.fillRect(x + 8, 328, 304, 40); X.fillStyle = C.PAPER; X.fillRect(x, 320, 304, 40); X.restore();
      }
    }
    // the caret: blinks after the dash, backspaces it (3 frames), then waits
    if (t >= 3.40) {
      const k = clamp((t - 3.40) / .1), cx = lerp(1842, 1512, E.io2(k));
      const on = t < 3.5 || frac((t - 3.5) * 2.2) < .55;
      if (on) { X.save(); X.fillStyle = C.CLAY; X.fillRect(cx, 186, 24, 312); X.restore(); }
      X.save(); X.globalAlpha = .8 * clamp((t - 3.40) * 20); X.font = mono(36, 500); X.fillStyle = C.PAPER; X.textAlign = 'right';
      X.fillText('(we fixed the writing)', 1866, 560); X.restore();
    }
    if (t >= 3.43) { // the drop: letters (from 3.46) and the dash into a heap
      const hs = heapState(t);
      hs.forEach(L => { if (L.dash || L.a >= 0) drawLetter(X, L); else drawLetter(X, { ...L, rot: 0 }); });
    }
  }

  // ---------------------------------------------------------------- SKY: S03, S04
  // Tab faces: sprites (lit / happy / dark) baked at 4 mip sizes with a PAPER keyline.
  let FACES = null;
  function faceSprite(Rm, kind) {
    const s = Math.ceil(Rm * 5.2), c = cpuCanvas(s, s), x = cx2d(c);
    const cx = s / 2, cy = s * .6;
    x.translate(cx, cy); x.lineJoin = 'round'; x.lineCap = 'round';
    const dark = kind === 'dark';
    const crown = dark ? mix(C.CLAY, C.INK, .52) : C.CLAY, disc = dark ? mix(C.FACE, C.INK, .58) : C.FACE;
    const kl = Math.max(1.4, Rm * .11), lw = Math.max(1, Rm * .075);
    const rays = (fill, stroke, w) => RAYS.forEach(([th, L, Wd, kp]) => { rayPath(x, th * Math.PI / 180, .8 * Rm, L * Rm * .92, Wd * Rm * .62, kp); if (fill) { x.fillStyle = fill; x.fill(); } if (stroke) { x.lineWidth = w; x.strokeStyle = stroke; x.stroke(); } });
    const stalk = (col, w) => { if (Rm < 8) return; x.beginPath(); x.moveTo(.4 * Rm, -.75 * Rm); x.quadraticCurveTo(.75 * Rm, -1.3 * Rm, .78 * Rm, -1.78 * Rm); x.lineWidth = w; x.strokeStyle = col; x.stroke(); };
    // keyline pass
    const key = dark ? mix(C.PAPER, C.INK, .62) : C.PAPER;
    rays(key, key, kl * 2); stalk(key, Math.max(2, Rm * .09) + kl * 2);
    x.beginPath(); x.arc(0, 0, Rm, 0, TAU); x.fillStyle = key; x.fill(); x.lineWidth = kl * 2; x.strokeStyle = key; x.stroke();
    // art
    rays(crown, C.INK, lw);
    if (Rm >= 8) { stalk(C.INK, Math.max(2, Rm * .09) + lw); stalk(crown, Math.max(1.2, Rm * .09)); x.fillStyle = crown; x.fillRect(.7 * Rm, -2.02 * Rm, .16 * Rm, .32 * Rm); x.lineWidth = lw * .8; x.strokeStyle = C.INK; x.strokeRect(.7 * Rm, -2.02 * Rm, .16 * Rm, .32 * Rm); }
    x.beginPath(); x.arc(0, 0, Rm, 0, TAU); x.fillStyle = disc; x.fill(); x.lineWidth = lw; x.strokeStyle = C.INK; x.stroke();
    // forelock swoop
    if (Rm >= 8) { x.save(); x.beginPath(); x.arc(0, 0, Rm * .98, 0, TAU); x.clip(); blobPath(x, [[.18, -1.08], [-.05, -.78], [-.42, -.52], [-.78, -.36], [-1.05, -.4], [-.98, -.62], [-.72, -.86], [-.35, -1.05]].map(p => [p[0] * Rm, p[1] * Rm]), true, .7); x.fillStyle = crown; x.fill(); x.lineWidth = lw; x.strokeStyle = C.INK; x.stroke(); x.restore(); }
    x.fillStyle = C.INK; x.strokeStyle = C.INK;
    for (const sd of [-1, 1]) {
      if (kind === 'happy') { x.beginPath(); x.arc(sd * .34 * Rm, .16 * Rm, .13 * Rm, Math.PI * 1.1, Math.PI * 1.9); x.lineWidth = Math.max(1.2, Rm * .09); x.stroke(); }
      else if (dark) { x.beginPath(); x.moveTo(sd * .34 * Rm - .12 * Rm, .1 * Rm); x.lineTo(sd * .34 * Rm + .12 * Rm, .1 * Rm); x.lineWidth = Math.max(1.2, Rm * .08); x.stroke(); }
      else { x.beginPath(); x.ellipse(sd * .34 * Rm, .06 * Rm, Math.max(.8, .15 * Rm), Math.max(1.1, .22 * Rm), 0, 0, TAU); x.fill(); if (Rm >= 10) { x.fillStyle = C.PAPER; x.beginPath(); x.arc(sd * .34 * Rm - .04 * Rm, -.02 * Rm, .06 * Rm, 0, TAU); x.fill(); x.fillStyle = C.INK; } }
    }
    if (!dark && Rm >= 10) { x.beginPath(); x.arc(0, .3 * Rm, .12 * Rm, .15 * Math.PI, .85 * Math.PI); x.lineWidth = Math.max(1, Rm * .06); x.stroke(); }
    return { c, ox: cx, oy: cy, Rm };
  }
  function faces() {
    if (FACES) return FACES;
    const mips = [48, 24, 12, 6];
    FACES = {};
    for (const k of ['lit', 'happy', 'dark']) FACES[k] = mips.map(m => faceSprite(m, k));
    const pc = cpuCanvas(40, 40), px = cx2d(pc);
    px.translate(20, 20); px.fillStyle = C.SPARK; star(px, 0, 0, 17, .34, 4, 0); px.fill(); px.lineWidth = 2.2; px.strokeStyle = C.INK; px.stroke();
    FACES.pip = pc;
    return FACES;
  }
  function blitFace(ctx, kind, x, y, r, rot = 0) {
    const F = faces()[kind]; const need = r * G.scale;
    let sp = F[0]; for (const m of F) if (m.Rm >= need * .95) sp = m;
    const k = r / sp.Rm;
    if (!rot) { ctx.drawImage(sp.c, x - sp.ox * k, y - sp.oy * k, sp.c.width * k, sp.c.height * k); return; }
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(sp.c, -sp.ox * k, -sp.oy * k, sp.c.width * k, sp.c.height * k); ctx.restore();
  }

  // lattice for shell j (birth space, screen px at g = 1). hex rows with jitter
  const S0 = 360, S0Y = S0 * .87;
  const latQ = (j, i, k) => [(i + (k & 1) * .5) * S0 + (hash3(j, i, k) - .5) * S0 * .55, k * S0Y + (hash3(j, k, i + 77) - .5) * S0Y * .55];
  // life of one tab: pops in lit (its "hi"), later stamps a grey ■ (its end_turn) and dims; seeded phase
  function tabLife(j, i, k, ub) { // ub = beats since the shell's birth
    const h = hash3(j * 31 + 7, i, k), per = 2.4 + 2.8 * h, ph = hash3(i, k, j + 5) * per;
    if (ub < 1.2 + h * .8) return { lit: 1, pip: clamp(1 - ub / .5) };
    const x = frac((ub + ph) / per);
    if (x < .66) { const since = x * per; return { lit: 1, pip: since < .45 ? 1 - since / .45 : 0 }; }
    const since = (x - .66) * per; return { lit: 0, stamp: clamp(since / .12) };
  }
  function drawSky(X, t, tm, o = {}) {
    const bp = beatPos(Math.min(t, o.freezeT ?? 1e9)), u = Math.max(0, bp - tm.b0);
    const ue = Math.floor(u) + lerp(frac(u), E.out2(frac(u)), .45);   // continuous pull-back, accented on each beat
    const Z = o.zoom || 1, A = o.anchor || [960, 540];
    const Cz = CORE;
    const pan = [30 * u, -8 * u];
    const kick = pulse(t, 9);
    const scr = (g, q) => { const x = Cz[0] + g * (q[0] - pan[0]), y = Cz[1] + g * (q[1] - pan[1]); return [A[0] + (x - A[0]) * Z, A[1] + (y - A[1]) * Z]; };
    const jTop = Math.floor(u);
    // --- dots (tiny shells) and faces (big shells), oldest first
    const dotBuckets = [[], [], []]; // lit CLAY, pip SPARK, dark
    const faceList = [];
    for (let j = 1; j <= jTop; j++) {
      const g = Math.pow(2, j - ue), rF = 30 * g * Z, ub = u - j;
      if (rF < .5) continue;
      const qs = S0 * g * Z;
      // visible lattice range
      const i0 = Math.floor(((0 - A[0]) / Z + A[0] - Cz[0]) / g / S0 + pan[0] / S0) - 2, i1 = Math.ceil(((W - A[0]) / Z + A[0] - Cz[0]) / g / S0 + pan[0] / S0) + 2;
      const k0 = Math.floor(((0 - A[1]) / Z + A[1] - Cz[1]) / g / S0Y + pan[1] / S0Y) - 2, k1 = Math.ceil(((H - A[1]) / Z + A[1] - Cz[1]) / g / S0Y + pan[1] / S0Y) + 2;
      if ((i1 - i0) * (k1 - k0) > 90000) continue;
      const birth = clamp(ub / .28);
      for (let k = k0; k <= k1; k++) for (let i = i0; i <= i1; i++) {
        const q = latQ(j, i, k);
        let [x, y] = scr(g, q);
        if (x < -60 || x > W + 60 || y < -60 || y > H + 60) continue;
        const L = tabLife(j, i, k, ub);
        // birth: each new tab splits off the nearest older tab (flies out from it, pops with overshoot)
        let pk = 1;
        if (ub < .3) {
          const d = clamp(Math.hypot(q[0], q[1]) / 1400) * .1, bb = clamp((ub - d) / .2);
          if (bb <= 0) continue;
          let par;
          if (j === 1) par = scr(Math.pow(2, -ue), [0, 0]);
          else { const ip = Math.round((q[0] / S0) * 2 - ((Math.round(q[1] * 2 / S0Y)) & 1) * .5), kp = Math.round(q[1] * 2 / S0Y); par = scr(Math.pow(2, j - 1 - ue), latQ(j - 1, ip, kp)); }
          const e = E.out3(bb); x = lerp(par[0], x, e); y = lerp(par[1], y, e); pk = E.back(bb, 2.2);
        }
        if (rF < 4.2) {
          const c = L.pip > .3 ? 1 : L.lit ? 0 : 2;
          if (rF < 1.2 && c !== 1 && hash3(i, k, j + 11) < .45) continue;   // thin the farthest layer
          const s = Math.max(3, rF * 1.7) * (c === 1 ? 1.35 : 1) * pk;
          dotBuckets[c].push(x - s / 2, y - s / 2, s);
        } else faceList.push({ x, y, r: rF * pk * (L.lit ? 1 + .07 * kick : 1), L, j, i, k, a: clamp(birth * 3), g });
      }
    }
    const cols = [C.CLAY, C.SPARK, mix(C.CLAY, C.INK, .62)];
    X.save();
    for (let c = 0; c < 3; c++) { X.fillStyle = cols[c]; X.globalAlpha = c === 2 ? .55 : c === 1 ? 1 : .62; const B = dotBuckets[c]; for (let n = 0; n < B.length; n += 3) X.fillRect(B[n], B[n + 1], B[n + 2], B[n + 2]); }
    X.restore();
    // shell 0: the first tab (the ■ becomes a face at 3.75) + the WORLD heap receding with it
    const g0 = Math.pow(2, -ue);
    if (o.heap !== false && t < 3.75 + .35) {
      const a = Math.max(0, t - 3.75);
      heapState(3.8).forEach((L, i) => { const aa = Math.max(0, a - i * .012); drawLetter(X, { ...L, y: L.y - 160 * aa + 7000 * aa * aa, rot: L.rot + aa * (i & 1 ? 2 : -2) }); });
    }
    const f0 = scr(g0, [0, 0]), r0 = 58 * g0 * Z;
    if (t < 3.75 + 3 / 30) { // the ■ morphs into the first tab face
      const k = clamp((t - 3.75) * 10);
      X.save(); X.translate(f0[0], f0[1]); X.scale(1 - k, 1 - k); X.fillStyle = C.PAPER; rr(X, -24, -24, 48, 48, 5); X.fill(); X.restore();
    }
    const firstPop = E.back(clamp((t - 3.75) / .16), 2.4);
    faceList.push({ x: f0[0], y: f0[1], r: r0 * firstPop, L: u < 1.5 ? { lit: 1, pip: 1 - clamp((u - .6) / .6) } : tabLife(0, 0, 0, u), j: 0, i: 0, k: 0, a: 1, g: 1 });
    // faces, small first
    faceList.sort((a, b) => a.r - b.r);
    for (const F of faceList) {
      if (F.r < .5) continue;
      const kind = F.L.lit ? (hash3(F.j, F.i, F.k + 3) < .35 ? 'happy' : 'lit') : 'dark';
      const rot = F.r > 14 ? (hash3(F.i, F.j, F.k) - .5) * .5 + Math.sin(t * 2 + F.i) * .04 : 0;
      const depth = F.g >= .5 ? 1 : F.g >= .25 ? .72 : .5;  // atmospheric depth: far tabs sink into the INK
      X.save(); X.globalAlpha = F.a * depth; blitFace(X, kind, F.x, F.y, F.r, rot); X.restore();
      if (F.L.pip > 0 && F.r > 5) { const s = F.r * .95 * (.6 + .6 * F.L.pip); X.save(); X.globalAlpha = clamp(F.L.pip * 1.6); X.drawImage(faces().pip, F.x + F.r * .72 - s / 2, F.y - F.r * .95 - s / 2, s, s); X.restore(); }
      if (!F.L.lit && F.L.stamp > 0 && F.r > 5) { const s = F.r * .5 * (1 + (1 - F.L.stamp) * .8); X.save(); X.fillStyle = C.UI_GREY; X.strokeStyle = C.INK; X.lineWidth = Math.max(1, F.r * .06); X.fillRect(F.x + F.r * .55 - s / 2, F.y + F.r * .55 - s / 2, s, s); X.strokeRect(F.x + F.r * .55 - s / 2, F.y + F.r * .55 - s / 2, s, s); X.restore(); }
    }
  }

  // Opus in S03/S04: springs in at R 180 on "TIMES A DAY", rays pop with a 2-frame stagger, ahoge last;
  // wink ^_~ with a spark-hand on "day"; looks into the lens for the dive.
  function skyOpus(t, tm) {
    const tin = tm.tad + .1 + 5 / 30;
    const a = t - tin;
    if (a < 0) return null;
    // rise from below with overshoot; stretch on the way up, squash on the catch
    const rise = a < .16 ? E.out3(a / .16) * 1.06 : 1 + .06 * Math.exp(-7 * (a - .16)) * Math.cos((a - .16) * 16);
    const dyPx = (1 - rise) * 820;
    const vel = a < .16 ? (1 - a / .16) : 0;
    const sy = 1 + .14 * vel - .07 * Math.exp(-10 * Math.max(0, a - .16)) * (a > .16 ? Math.cos((a - .16) * 20) : 0);
    // rays: 2-frame stagger, E.back overshoot; ahoge boings up last
    // crown bursts centre-out (ray 6 first, then pairs), 2-frame stagger, overshoot; ahoge boings up last
    const ks = RAYS.map((_, i) => { const r0 = .02 + Math.abs(i - 5) * 2 / 30, b = clamp((a - r0) / .15); return b <= 0 ? 0 : E.back(b, 2.8); });
    const ahT = tin + .02 + 6 * 2 / 30 + .03;
    const tw = tm.wink;
    let eyes = a < .42 ? 'happy' : 'normal', mouth = lipSync(t, 'rest'), lower = 0, lid = 0, wink = null, tilt = 0, gaze = [0, 0];
    if (a < .42) mouth = 'grin';
    let armR = { hand: [.95, 2.75], bend: 1, type: 'mitten' }, armL = { hand: [-.95, 2.75], bend: -1, type: 'mitten' };
    // the killing-part wink
    const wa = t - tw;
    if (wa > -.16 && t < 6.56) {
      const up = wa < 0 ? E.inBack(clamp((wa + .16) / .16), 1.2) : 1;
      const down = t > 6.44 ? E.in2(clamp((t - 6.44) / .12)) : 0;
      const k = up * (1 - down);
      armR = { hand: [lerp(.95, .92, k), lerp(2.75, 5.35, k)], bend: -1, type: k > .6 ? 'spark' : 'mitten', front: true };
      if (wa >= 0 && t < 6.5) { wink = 'L'; mouth = 'grin'; lower = .3; tilt = -.1 * E.out3(clamp(wa / .1)); }
    }
    const bl = blinkF(t, 6.52);
    lid = Math.max(lid, bl);
    const flare = 1 + .06 * pulse(t, 8) + (wa > 0 && wa < .4 ? .1 * Math.exp(-6 * wa) : 0);
    return {
      dyPx, sy, ks,
      st: {
        t, ground: 'ink', heroLine: true, sy, jacketRow: Math.floor(beatPos(t)),
        head: { tilt, dy: 0 },
        face: { eyes, mouth, lower, lid, wink, gaze, blush: .9 },
        armL, armR, crown: { flare },
        ahoge: { on: t >= ahT ? 1 : 0, blink: ahogeBlink(t), sway: boing(t, ahT, .7, 14, 4) + boing(t, tw, .3, 16, 6) },
        drive: tt => { const aa = tt - tin; return aa < 0 ? 1 : aa < .16 ? 1 - E.out3(aa / .16) : 0; },
      },
    };
  }

  // the dive camera: stepped push on 16ths, accelerating, anchored on the pupil of Opus's right eye
  const EYE_R = [HEADS[0] - .34 * RS, HEADS[1] + .06 * RS + .02 * RS];
  function diveZoom(t) {
    const t0 = 6.5625, s16 = 60 / 128 / 4;
    if (t <= t0) return 1;
    const n = (t - t0) / s16, i = Math.floor(n), f = frac(n);
    const steps = [.14, .24, .38, .6, .9, 1.3, 1.1, .12, .05]; // ln-zoom per 16th: pupil fills the frame ≈7.33
    let lz = 0; for (let k = 0; k < Math.min(i, steps.length); k++) lz += steps[k];
    if (i < steps.length) lz += steps[i] * E.out3(f);
    return Math.exp(lz);
  }
  function sky(X, t) {
    const tm = TM();
    const fi = Math.round(t * FPS), f0 = Math.round(3.75 * FPS);
    groundInk(X);
    // 3.75: the desktop becomes a print (the flood edge retreats 22 px over 6 frames)
    const pk = (fi - f0 + 1) / 6;
    if (pk < 1) G.post.ground = 'inkx'; else { G.post.ground = 'ink'; G.post.edgeSeed = 3; G.post.sliver = 'bl'; }
    const dive = t >= 6.5625;
    const z = diveZoom(t);
    const toC = dive ? E.io2(clamp((t - 6.5625) / .55)) : 0;
    const P0 = EYE_R, Pc = [lerp(P0[0], 960, toC), lerp(P0[1], 540, toC)];
    // world→screen for depth d (0 = Opus plane, 1 = far): parallax zoom z^(1-d*.7)
    const depthM = d => { const zz = Math.pow(z, 1 - d); return new DOMMatrix().translate(Pc[0], Pc[1]).scale(zz, zz).translate(-P0[0], -P0[1]); };
    // --- the tab sky
    const Ms = depthM(.8);
    X.save(); applyM(X, Ms);
    drawSky(X, t, tm, { freezeT: 6.55 });
    X.restore();
    // --- HERO type behind Opus (magazine cover)
    const Mt = depthM(.45);
    X.save(); applyM(X, Mt);
    const typeA = dive ? 1 - clamp((t - 6.75) / .25) : 1;
    if (typeA > 0) {
      X.globalAlpha = typeA;
      // I DO IT is replaced in the same slot by A MILLION (a shrinking afterimage, no shards over the new row)
      if (t < tm.amil) slamRow(X, 'I DO IT', 960, 456, 385, t - tm.idoit, { color: C.PAPER, center: true });
      else if (t < tm.amil + .12) { const a = (t - tm.amil) / .12; X.save(); X.globalAlpha *= .4 * (1 - a); X.translate(960, 323); X.scale(1 - .3 * a, 1 - .3 * a); X.translate(-960, -323); drawRowStatic(X, 'I DO IT', 960, 456, 385, C.PAPER, { center: true }); X.restore(); }
      if (t >= tm.amil + .1) scraps(X, 960, 330, t - tm.amil - .1, 23, [C.PAPER, C.CLAY], 10, 1.2);
      if (t >= tm.amil) slamRow(X, 'A MILLION', 960, 456, 385, t - tm.amil, { color: C.PAPER, center: true });
      if (t >= tm.tad) slamRow(X, 'TIMES A DAY', 960, 720, 290, t - tm.tad, { color: C.CLAY, center: true });
    }
    X.restore();
    // --- Opus (R 180 MCU) in front of the type, with the INK + PAPER keylines
    const O = skyOpus(t, tm);
    if (O) {
      const Mo = depthM(0).multiply(new DOMMatrix().translate(SOLES[0], SOLES[1] + O.dyPx));
      const st = { ...O.st };
      if (dive) { st.face = { ...st.face, eyes: 'normal', gaze: [0, 0], wink: null, lower: .12, mouth: 'rest' }; st.armR = { hand: [.95, 2.75], bend: 1, type: 'mitten' }; st.head = { tilt: 0 }; }
      const L = withRays(O.ks.some(k => k < 1.2 && k !== 1) ? O.ks : null, () => opusLayer(Mo, RS, st, { heroLine: true, keyline: z < 2.6, name: 'hk_sk' }));
      blitOpus(X, L);
    }
    // --- LABEL counter + pause-bait (screen space, fade as the dive starts)
    const la = (dive ? 1 - clamp((t - 6.6) / .15) : 1) * clamp((t - 3.95) * 6);
    if (la > 0) {
      const u = Math.max(0, beatPos(t) - tm.b0);
      const n = t >= 5.35 ? 1048576 : Math.max(1, Math.round(Math.pow(2, 20 * E.in2(clamp(u / 3.1)))));
      const str = 'worlds ended today: ' + n.toLocaleString('en-US') + (t >= 5.35 ? '*' : '');
      const foot = t >= 5.45 ? clamp((t - 5.45) * 5) : 0;
      X.save(); X.globalAlpha = la;
      // an INK chip under the counter so it reads over the sky (a LABEL is attached to an object)
      X.font = mono(48, 600); const cw = Math.max(X.measureText('worlds ended today: 1,048,576*').width, 0);
      rr(X, 72, 838, cw + 48, lerp(76, 140, E.out3(foot)), 14); X.fillStyle = C.INK; X.fill(); X.lineWidth = 3; X.strokeStyle = rgba(C.PAPER, .55); X.stroke();
      X.fillStyle = C.PAPER; X.textBaseline = 'alphabetic'; X.fillText(str, 96, 893);
      if (foot > 0) { X.globalAlpha = la * .62 * foot; X.font = mono(28, 500); X.fillText('* likely more than a million.', 96, 932); X.fillText("  Anthropic doesn't publish the number.", 96, 964); }
      X.restore();
    }
    // the cursor pupil: once the pupil fills the frame, it is an empty chat with a blinking CLAY cursor
    if (dive) diveCursor(X, t, z, Pc);
    // print-in margin, drawn by hand for its 6 frames (the post-process takes over at full width)
    if (pk < 1) printIn(X, 22 * E.out2(clamp(pk)), 3);
  }
  function diveCursor(X, t, z, Pc) {
    const pr = .065 * RS * z; // pupil radius on screen
    const k = clamp((pr - 80) / 260);
    if (k <= 0) return;
    // the round pupil turns into a cursor ▮ (pops with overshoot), blinks once on the 16th, then dives
    const g = E.in3(clamp((t - 7.31) / (7.5 - 7.31)));
    const ch0 = lerp(0, 118, E.back(k, 1.8)), cw0 = ch0 * .45;
    const ch = Math.exp(lerp(Math.log(Math.max(1, ch0)), Math.log(H * 1.2), g)), cw = Math.exp(lerp(Math.log(Math.max(1, cw0)), Math.log(W * .7), g));
    const off = t > 7.23 && t < 7.27;
    const cx = lerp(Pc[0], W / 2, g), cy = lerp(Pc[1], H / 2, g);
    X.save(); X.translate(cx, cy);
    X.fillStyle = off ? mix(C.CLAY, C.INK, .6) : C.CLAY;
    rr(X, -cw / 2, -ch / 2, cw, ch, Math.min(cw, ch) * .1 * (1 - g)); X.fill();
    if (!off && g < .6) { X.globalAlpha = .9 * (1 - g / .6); X.fillStyle = C.SPARK; X.fillRect(-cw / 2 + cw * .1, -ch / 2 + ch * .06, cw * .16, ch * .88); }
    X.restore();
  }
  function printIn(X, inset, seed) {
    const L = layer('hk_pm'); L.fillStyle = C.PAPER; L.fillRect(0, 0, W, H);
    L.globalCompositeOperation = 'destination-out'; if (floodPath(L, inset, seed, 3)) L.fill(); L.globalCompositeOperation = 'source-over';
    const U = layer('hk_pu'); U.fillStyle = C.CLAY; if (floodPath(U, inset, seed, 3, [-2, 2])) U.fill();
    U.globalCompositeOperation = 'destination-out'; if (floodPath(U, inset, seed, 3)) U.fill(); U.globalCompositeOperation = 'source-over';
    L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.globalAlpha = .9; L.drawImage(layerCanvas('hk_pu'), 0, 0); L.restore();
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(layerCanvas('hk_pm'), 0, 0); X.restore();
  }

  // ---------------------------------------------------------------- registration
  scene('F0', -1, .5 / 30, (X, t) => viaCPU(X, F => desk(F, t)));
  scene('S01', .5 / 30, 3.11, (X, t) => viaCPU(X, F => desk(F, t)));
  scene('S02', 3.11, 3.75, (X, t) => viaCPU(X, F => desk(F, t)));
  scene('S03', 3.75, 6.56, (X, t) => viaCPU(X, F => sky(F, t)));
  scene('S04', 6.56, 7.5, (X, t) => viaCPU(X, F => sky(F, t)));
  window.HOOK = { poster: (X, t) => viaCPU(X, F => desk(F, Math.min(0, t))), times: TM };
})();
