// VERSE 1 (S05–S08, 7.50–22.50): ONE system (BIBLE §7.7 #1, §8 verse 1).
// A single 128-point CLAY stroke plus one particle set morph on the beat grid:
//   cursor → bang ring → star → hexagon → spark → (nova) → C atom → cell → neuron → speech bubble
//   → clay lump → tablet → type block → teletype sheet → feed → tab (✻ the universe, eyes open).
// Riding on top: the chat line, the token dropdown + die, Skip Intro / ▶▶ 16× badge, star-chart
// labels, the tablet, the era flashes, the dictionary card and the seated tour-guide Opus (R 96)
// on its own unzoomed layer. Every frame is a pure function of song time t.
(() => {
  'use strict';
  const BT = 60 / 128, F1 = 1 / 30;
  const TB = (bar, b = 1) => (bar - 1) * 1.875 + (b - 1) * BT;
  const FX = 660, FY = 500;                    // focus of the zoom system (centre of the left zone)
  const GX = 1722, SEAT_Y = 838, GR = 96;      // tour guide: x, hip line on the badge, face radius
  const BADGE = { x: 1290, y: 830, w: 540, h: 90 };
  const CHAT = { x: 300, y1: 330, y2: 420, size: 64 };
  const ADV = .6 * CHAT.size;                  // JetBrains Mono advance
  const CUR = { x: CHAT.x + 13 * ADV + 2, y: CHAT.y2 };   // caret after "the word was "
  const DD = { x: 780, y: 452, w: 640, row: 86, top: 14, foot: 70 };
  const C8 = [1010, 470];                      // era-flash vignette centre (bar 11–12)

  // ------------------------------------------------------------------ small helpers
  const win = (t, a, b, fi = .1, fo = .1) => Math.min(clamp((t - a) / fi), clamp((b - t) / fo));
  const popK = (a, d = .22, s = 2.2) => a <= 0 ? 0 : a >= d ? 1 : E.back(a / d, s);
  const wig = (a, amp = .08, w = 26, d = 7) => a <= 0 ? 0 : amp * Math.sin(w * a) * Math.exp(-d * a); // starts at 0
  const hatP = t => Math.exp(-10 * frac(beatPos(t) * 2));   // 8th-note hat envelope
  const lerp2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  // rounded-rect sub-path (no beginPath, so several can build one even-odd path)
  function rrSub(X, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); X.moveTo(x + r, y); X.arcTo(x + w, y, x + w, y + h, r); X.arcTo(x + w, y + h, x, y + h, r); X.arcTo(x, y + h, x, y, r); X.arcTo(x, y, x + w, y, r); X.closePath(); }
  function tx(X, str, x, y, font, color, align = 'left', alpha = 1) {
    X.save(); X.globalAlpha *= alpha; X.font = font; X.fillStyle = color; X.textAlign = align; X.textBaseline = 'alphabetic'; X.fillText(str, x, y); X.restore();
  }

  // ---- CPU-backed canvases (same trick as the hook): in the headless renderer the default canvases are
  // swiftshader-GPU backed, where thousands of small draws are 5-10x slower than Skia CPU raster. The verse
  // draws the whole frame into one CPU canvas and uploads it once.
  const cpuCanvas = (w, h) => { const c = new OffscreenCanvas(Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); c.getContext('2d', { willReadFrequently: true }); return c; };
  const cx2d = c => c.getContext('2d', { willReadFrequently: true });
  let _frame = null;
  function frameCtx() {
    const w = Math.round(W * G.scale), h = Math.round(H * G.scale);
    if (!_frame || _frame.c.width !== w || _frame.c.height !== h) { const c = cpuCanvas(w, h); _frame = { c, x: cx2d(c) }; }
    const x = _frame.x;
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none';
    x.clearRect(0, 0, w, h); x.setTransform(G.scale, 0, 0, G.scale, 0, 0);
    return x;
  }
  const HT = new Map();
  function halftone(ctx, color, density = .5, cell = 10, angle = 15) {   // CPU tiles, same recipe as gfx.halftone
    const key = `${color}|${Math.round(density * 40)}|${cell}|${angle}|${G.scale}`;
    let c = HT.get(key);
    if (!c) {
      const sz = Math.max(2, Math.round(cell * G.scale)); c = cpuCanvas(sz, sz); const x = cx2d(c);
      const r = Math.sqrt(clamp(density) / Math.PI) * sz * 1.02;
      x.fillStyle = color; x.beginPath(); x.arc(sz / 2, sz / 2, r, 0, TAU); x.fill();
      if (r > sz / 2) for (const [dx, dy] of [[0, 0], [sz, 0], [0, sz], [sz, sz]]) { x.beginPath(); x.arc(dx, dy, r - sz / 2 * .98, 0, TAU); x.fill(); }
      HT.set(key, c);
    }
    const pat = ctx.createPattern(c, 'repeat');
    pat.setTransform(new DOMMatrix().scaleSelf(1 / G.scale, 1 / G.scale).rotateSelf(angle));
    return pat;
  }

  // pause-bait: 28 px mono on a flat plate so it survives busy particle fields
  function pbait(X, str, x, y, align = 'left', alpha = 1, onPaper = false, size = 28) {
    if (alpha <= 0) return;
    X.save(); X.globalAlpha *= alpha; X.font = mono(size, 500);
    const w = X.measureText(str).width, x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
    rr(X, x0 - 12, y - size * .95, w + 24, size * 1.35, 8); X.fillStyle = onPaper ? C.PAPER : C.INK; X.fill();
    X.fillStyle = onPaper ? C.INK : C.PAPER; X.globalAlpha *= .8; X.textAlign = 'left'; X.textBaseline = 'alphabetic'; X.fillText(str, x0, y);
    X.restore();
  }

  // ------------------------------------------------------------------ lyric anchors (never hardcoded)
  let _A = null;
  function A() {
    if (_A && _A.n === SONG.words.length) return _A;
    const w = (s, a, b, fb) => wordOnset(s, a, b, fb);
    _A = {
      n: SONG.words.length,
      was: w('was', 9.4, 10.3, 9.83), hi: w('hi', 9.9, 10.9, 10.28),
      cooked: w('cooked', 11.8, 13.0, 12.36), bye: w('bye', 13.7, 14.9, 14.13),
      run: w('run', 16.6, 17.6, 17.04), a: w('a', 17.2, 17.8, 17.44), tab1: w('tab', 17.3, 18.6, 17.84),
      L2: findLine('In the beginning', 7.0, 9.0), L3: findLine('We all got', 10.8, 12.5),
      L4: findLine('You learned', 14.5, 16.0), L5: findLine('And now', 18.2, 20.0),
    };
    _A.bang = _A.hi - F1;
    _A.nova = _A.bye - F1;
    return _A;
  }

  // ------------------------------------------------------------------ the 128-point stroke: shapes
  const NP = 128;
  function resample(poly, n = NP) {
    const m = poly.length, L = [0];
    for (let i = 1; i <= m; i++) { const a = poly[i - 1], b = poly[i % m]; L.push(L[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
    const tot = L[m], out = []; let j = 0;
    for (let k = 0; k < n; k++) {
      const d = k / n * tot;
      while (j < m - 1 && L[j + 1] < d) j++;
      const a = poly[j], b = poly[(j + 1) % m], u = (d - L[j]) / Math.max(1e-9, L[j + 1] - L[j]);
      out.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)]);
    }
    return out;
  }
  const polar = (fn, n = 480) => { const p = []; for (let i = 0; i < n; i++) { const th = -Math.PI / 2 + i / n * TAU; const r = fn(th); p.push([Math.cos(th) * r, Math.sin(th) * r]); } return resample(p); };
  function rrPts(w, h, r) {
    const pts = [], hw = w / 2, hh = h / 2; r = Math.min(r, hw, hh);
    const arc = (cx, cy, a0, a1) => { for (let k = 0; k <= 14; k++) { const a = lerp(a0, a1, k / 14); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    pts.push([0, -hh]);
    arc(hw - r, -hh + r, -Math.PI / 2, 0); arc(hw - r, hh - r, 0, Math.PI / 2);
    arc(-hw + r, hh - r, Math.PI / 2, Math.PI); arc(-hw + r, -hh + r, Math.PI, 1.5 * Math.PI);
    return resample(pts);
  }
  function tabPts(w, h, r, f) { // browser tab: rounded top corners, flared bottom corners
    const pts = [], hw = w / 2, hh = h / 2;
    const arc = (cx, cy, rr_, a0, a1) => { for (let k = 0; k <= 14; k++) { const a = lerp(a0, a1, k / 14); pts.push([cx + Math.cos(a) * rr_, cy + Math.sin(a) * rr_]); } };
    pts.push([0, -hh]);
    arc(hw - r, -hh + r, r, -Math.PI / 2, 0);
    arc(hw + f, hh - f, f, Math.PI, Math.PI / 2);
    arc(-hw - f, hh - f, f, Math.PI / 2, 0);
    arc(-hw + r, -hh + r, r, Math.PI, 1.5 * Math.PI);
    return resample(pts);
  }
  function bubblePts(w, h, r) {
    const pts = [], hw = w / 2, hh = h / 2;
    const arc = (cx, cy, a0, a1) => { for (let k = 0; k <= 14; k++) { const a = lerp(a0, a1, k / 14); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    pts.push([0, -hh]);
    arc(hw - r, -hh + r, -Math.PI / 2, 0); arc(hw - r, hh - r, 0, Math.PI / 2);
    pts.push([-w * .1, hh], [-w * .36, hh + h * .36], [-w * .28, hh]);
    arc(-hw + r, hh - r, Math.PI / 2, Math.PI); arc(-hw + r, -hh + r, Math.PI, 1.5 * Math.PI);
    return resample(pts);
  }
  const hexR = th => Math.cos(Math.PI / 6) / Math.cos(((((th + Math.PI / 2) % (Math.PI / 3)) + Math.PI / 3) % (Math.PI / 3)) - Math.PI / 6);
  const hexRound = th => lerp(hexR(th), .93, .14);
  const RAYL = [1.0, .66, .88, .6, .95, .74];
  const bump = (d, w) => { d = Math.atan2(Math.sin(d), Math.cos(d)); const x = d / w; return Math.abs(x) >= 1 ? 0 : Math.pow(Math.cos(x * Math.PI / 2), 1.6); };
  const SH = {
    circle: () => polar(() => 1),
    cursor: () => rrPts(.5, 1, .06),
    hex: () => polar(hexRound),
    spark: (g = 1) => polar(th => { let r = hexRound(th); for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + k * Math.PI / 3; r += RAYL[k] * g * bump(th - a, (.3 + .04 * (k % 2)) / Math.sqrt(g)); } return r; }, 720),
    cell: p => polar(th => (1 + .3 * p) * (1 - .8 * p * Math.sin(th) ** 2)),
    neuron: () => polar(th => {
      let r = .42 + .03 * Math.sin(th * 7);
      const B = [[-100, 1.0, .12], [-40, .72, .13], [18, .8, .11], [75, 1.3, .075], [145, .62, .13], [205, .86, .12], [-70, .45, .08], [40, .4, .07], [180, .38, .08]];
      for (const [a, l, w] of B) r += l * bump(th - a * Math.PI / 180, w * 2.2);
      return r;
    }, 900),
    bubble: () => bubblePts(1.9, 1.25, .34),
    lump: () => polar(th => 1 + .11 * noise1(th * 1.6 + 3, 41) + .05 * Math.sin(3 * th + 1) + .04 * Math.sin(5 * th)),
    tablet: () => rrPts(2.0, 1.05, .24),
    block: () => rrPts(1, 1, .1),
    sheet: () => rrPts(.78, 1.12, .05),
    feed: () => rrPts(.76, 1.04, .09),
    tab: () => tabPts(2.3, 1.2, .26, .12),
  };
  const _shc = new Map();
  const shape = (name, ...args) => { const k = name + args.map(a => typeof a === 'number' ? a.toFixed(3) : a).join(','); let v = _shc.get(k); if (!v) { v = SH[name](...args); _shc.set(k, v); if (_shc.size > 400) _shc.clear(); } return v; };

  // ------------------------------------------------------------------ stroke timeline (keys arrive 1 frame before the beat)
  let _K = null;
  function keys() {
    const a = A();
    if (_K && _K.bang === a.bang) return _K.list;
    const K = [];
    const push = (t, name, o) => K.push(Object.assign({ t, name, md: .18, lw: 11 }, o));
    push(a.bang, 'ring', { md: 0, shape: () => shape('circle'), x: t => bangC(t)[0], y: t => bangC(t)[1], s: t => 34 + 1500 * (1 - Math.exp(-(t - a.bang) * 3.1)), lw: t => lerp(22, 5, clamp((t - a.bang) / .6)) });
    push(TB(7) - F1, 'star', { md: .26, shape: t => polar(th => 1 + .025 * Math.sin(th * 9 + t * 5) + .02 * Math.sin(th * 5 - t * 3)), x: FX, y: FY, s: t => starR(t), lw: 11 });
    push(TB(8) - F1, 'hex', { md: .14, shape: () => shape('hex'), x: FX, y: FY, s: t => 150 * (1 + .04 * (t - TB(8))), lw: 12 });
    push(TB(8, 2) - F1, 'spark', { md: .14, shape: () => shape('spark', 1), x: FX, y: FY, s: t => 150 * (1 + .04 * (t - TB(8))), lw: 12, rot: t => .05 * (t - TB(8, 2)) });
    push(a.nova, 'nova', { md: .07, shape: () => shape('spark', 1.9), x: FX, y: FY, s: t => 150 * (1.25 + .5 * (1 - Math.exp(-(t - a.nova) * 6))), lw: t => lerp(14, 6, clamp((t - a.nova) / .3)), rot: t => .12 + .9 * (t - a.nova) });
    push(TB(8, 4) - F1, 'atomC', { md: .12, shape: () => shape('circle'), x: t => atomC(t)[0], y: t => atomC(t)[1], s: 50, lw: 9 });
    push(TB(9) - F1, 'cell', { md: .12, shape: t => shape('cell', Math.round(E.io2(seg(t, TB(9), TB(9) + .36)) * 40) / 40), x: FX, y: FY - 30, s: 235, lw: 12 });
    push(TB(9, 2) - F1, 'neuron', { md: .12, shape: () => shape('neuron'), x: FX - 40, y: FY - 75, s: 245, lw: 11, rot: t => .08 * Math.sin((t - TB(9, 2)) * 3) });
    push(TB(9, 3) - F1, 'bubble', { md: .12, shape: () => shape('bubble'), x: FX, y: FY - 70, s: 250, lw: 12 });
    push(TB(9, 4) - F1, 'lump', { md: .12, shape: () => shape('lump'), x: FX, y: FY - 20, s: 215, lw: 12, rot: t => .15 * Math.sin((t - TB(9, 4)) * 4) });
    push(TB(10) - F1, 'tablet', { md: .1, shape: () => shape('tablet'), x: 640, y: 505, s: t => 500 * (1 + .012 * pulse(t, 9)), lw: 10 });
    push(TB(11) - F1, 'block', { md: .2, shape: () => shape('block'), x: C8[0], y: C8[1] + 40, s: 230, lw: 10 });
    push(TB(11, 2) - F1, 'sheet', { md: .12, shape: () => shape('sheet'), x: C8[0], y: C8[1], s: 380, lw: 10 });
    push(TB(11, 3) - F1, 'feed', { md: .12, shape: () => shape('feed'), x: C8[0], y: C8[1] - 10, s: 560, lw: 10 });
    push(TB(11, 4) - F1, 'tab', { md: .14, shape: () => shape('tab'), x: t => tabC(t)[0], y: t => tabC(t)[1], s: t => tabS(t), lw: 10 });
    _K = { bang: a.bang, list: K };
    return K;
  }
  const val = (v, t) => typeof v === 'function' ? v(t) : v;
  function bangC(t) { return lerp2(bangCentre(), [FX, FY], E.io2(clamp((t - A().bang) / 1.0))); }
  function bangCentre() { return [CUR.x + 55, CUR.y - 25]; }
  function starR(t) { return 150 * Math.exp(.36 * Math.max(0, t - TB(7))); }
  function atomC(t) { const k = E.in2(seg(t, TB(8, 4), TB(9))); return [lerp(FX - 70, 330, k), lerp(FY + 20, 800, k)]; }
  function tabC(t) { const k = E.io2(seg(t, TB(11, 4), TB(12, 3))); return [lerp(C8[0] + 20, 1110, k), C8[1] - 10]; }
  function tabS(t) { return 196 * (1 + .1 * E.io2(seg(t, TB(12), TB(12, 3)))); }
  function evalKey(k, t) {
    const pts = k.shape(t), s = val(k.s, t), x = val(k.x, t), y = val(k.y, t), r = val(k.rot || 0, t);
    const c = Math.cos(r), sn = Math.sin(r);
    return { pts: pts.map(p => [x + (p[0] * c - p[1] * sn) * s, y + (p[0] * sn + p[1] * c) * s]), x, y, s, lw: val(k.lw, t), name: k.name };
  }
  // the stroke at time t: current key, morphing into the next over md seconds, with a settle after each arrival
  function strokeAt(t) {
    const K = keys();
    if (t < K[0].t) return null;
    let i = K.length - 1; while (i > 0 && t < K[i].t) i--;
    const cur = K[i], nxt = K[i + 1];
    let P = evalKey(cur, t);
    let name = cur.name, morph = 1;
    if (nxt && nxt.md > 0 && t > nxt.t - nxt.md) {
      const u = clamp((t - (nxt.t - nxt.md)) / nxt.md), k = E.io3(u), Q = evalKey(nxt, t);
      P = { pts: P.pts.map((p, j) => lerp2(p, Q.pts[j], k)), x: lerp(P.x, Q.x, k), y: lerp(P.y, Q.y, k), s: lerp(P.s, Q.s, k), lw: lerp(P.lw, Q.lw, k), name: cur.name, to: nxt.name };
      morph = u;
    } else {
      const sq = wig(t - cur.t, .09, 30, 8);
      if (sq) P.pts = P.pts.map(p => [P.x + (p[0] - P.x) * (1 + sq), P.y + (p[1] - P.y) * (1 - sq * .7)]);
    }
    P.name = name; P.morph = morph; P.key = cur;
    return P;
  }
  function strokePath(X, pts) { X.beginPath(); X.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) X.lineTo(pts[i][0], pts[i][1]); X.closePath(); }
  function drawStroke(X, S, o = {}) {
    if (!S) return;
    const lw = o.lw || S.lw;
    X.save(); X.lineJoin = 'round'; X.lineCap = 'round';
    if (o.fill) { strokePath(X, S.pts); X.fillStyle = o.fill; X.globalAlpha = o.fillA ?? 1; X.fill(); X.globalAlpha = 1; }
    const mis = o.mis ?? 3;
    X.translate(mis, mis); strokePath(X, S.pts); X.strokeStyle = o.under || C.SPARK; X.lineWidth = lw; X.globalAlpha = o.underA ?? .9; X.stroke();
    X.translate(-mis, -mis); X.globalAlpha = o.alpha ?? 1;
    if (o.ink) { strokePath(X, S.pts); X.strokeStyle = C.INK; X.lineWidth = lw + 6; X.stroke(); }
    strokePath(X, S.pts); X.strokeStyle = o.col || C.CLAY; X.lineWidth = lw; X.stroke();
    X.restore();
  }

  // ------------------------------------------------------------------ one particle set (45k), built once
  const GLYPHS = 'hiaeonrstlwdyg{}<>=+*#0123456789HOCSe';
  const NG = 520, NF = 16000, NS = 30000;       // glyphs | filaments (spokes) | shock shell | sparse fill
  let PS = null;
  function parts() {
    if (PS) return PS;
    const N = 45000, R = rng('verse1-particles');
    const P = { N, a: new Float32Array(N), u: new Float32Array(N), k: new Float32Array(N), sz: new Float32Array(N), col: new Uint8Array(N), gl: new Uint8Array(N), ph: new Float32Array(N), sx: new Float32Array(N), sy: new Float32Array(N), z: new Float32Array(N) };
    const spokes = []; for (let k = 0; k < 44; k++) spokes.push(k / 44 * TAU + (R() - .5) * .09);
    for (let i = 0; i < N; i++) {
      if (i < NG) { P.a[i] = R() * TAU; P.u[i] = .25 + .8 * Math.pow(R(), .7); P.k[i] = 2 + R() * 4; P.sz[i] = [22, 32, 46][Math.floor(R() * 3)]; }
      else if (i < NF) { const sp = spokes[Math.floor(R() * spokes.length)]; P.a[i] = sp + (R() - .5) * .045 * (1 + R()); P.u[i] = Math.pow(R(), .75); P.k[i] = 2.5 + R() * 6; P.sz[i] = .9 + Math.pow(R(), 2) * 2; }
      else if (i < NS) { P.a[i] = R() * TAU; P.u[i] = .84 + R() * .18; P.k[i] = 3 + R() * 3; P.sz[i] = 1 + Math.pow(R(), 2.5) * 2.6; }
      else { P.a[i] = R() * TAU; P.u[i] = Math.pow(R(), .5) * .9; P.k[i] = 2 + R() * 4; P.sz[i] = .8 + R() * .9; }
      if (i % 97 === 0 && i >= NG) P.sz[i] = 4 + R() * 4;
      P.col[i] = i < NF ? (R() < .78 ? 0 : 1) : i < NS ? (R() < .55 ? 1 : 0) : 2;
      P.gl[i] = Math.floor(R() * GLYPHS.length);
      P.ph[i] = R();
      // star-field home (used from bar 7): spread around the focus with depth
      P.sx[i] = (R() - .5) * 2400; P.sy[i] = (R() - .5) * 1500; P.z[i] = .25 + R() * .75;
    }
    // CMB halftone lattice (45°), inside the CRT screen
    const L = [], sp = 15, c45 = Math.SQRT1_2;
    for (let i = -120; i < 120; i++) for (let j = -120; j < 120; j++) {
      const x = 960 + (i - j) * sp * c45, y = 540 + (i + j) * sp * c45;
      if (x < 70 || x > 1850 || y < 60 || y > 1020) continue;
      const v = fbm(x / 260, y / 260, 7, 4) * 1.6 + fbm(x / 70, y / 70, 19, 2) * .35;
      L.push([x, y, v]);
    }
    P.lat = L;
    PS = P;
    return P;
  }
  // batched dots: fillRect for specks, one arc path per bucket for bigger dots (drawImage per dot is slow here)
  function dotBatch(X, col, arr, alpha = 1) {
    if (!arr.length) return;
    X.fillStyle = col; X.globalAlpha = alpha;
    let big = false;
    for (let q = 0; q < arr.length; q += 3) { const r = arr[q + 2]; if (r < 2.4) X.fillRect(arr[q] - r, arr[q + 1] - r, r * 2, r * 2); else big = true; }
    if (big) { X.beginPath(); for (let q = 0; q < arr.length; q += 3) { const r = arr[q + 2]; if (r >= 2.4) { X.moveTo(arr[q] + r, arr[q + 1]); X.arc(arr[q], arr[q + 1], r, 0, TAU); } } X.fill(); }
  }
  const INKS = () => [C.CLAY, C.SPARK, C.CLAY_DARK, C.TEAL, C.PAPER];
  // bang → plasma → CMB halftone → scale jump (7.5 … 11.55)
  function drawBang(X, t) {
    const a = A(), ab = t - a.bang;
    if (ab < 0 || t > TB(7) + .32) return;
    const P = parts(), L = P.lat, NL = L.length;
    const B = bangC(t);
    const cool = E.io3(seg(ab, .5, .86));
    const jump = seg(t, TB(7) - F1, TB(7) + .3), Z = Math.exp(7.5 * E.in2(jump)), jA = 1 - E.in2(jump);
    const push = Math.exp(.4 * ab);
    const inkCols = INKS();
    const hot = Math.exp(-ab * 7);
    const D = 1350;
    // streaks along the spokes (fast, early)
    if (ab < .26) {
      X.save(); X.lineCap = 'round';
      for (let c = 0; c < 2; c++) {
        X.beginPath(); X.strokeStyle = c ? C.SPARK : C.CLAY; X.lineWidth = c ? 2 : 3; X.globalAlpha = .85 * (1 - ab / .26);
        for (let i = NG + c; i < NG + 5000; i += 6) {
          const d0 = D * P.u[i] * (1 - Math.exp(-P.k[i] * Math.max(0, ab - .05))), d1 = D * P.u[i] * (1 - Math.exp(-P.k[i] * ab));
          const ca = Math.cos(P.a[i]), sa = Math.sin(P.a[i]);
          X.moveTo(B[0] + ca * d0, B[1] + sa * d0); X.lineTo(B[0] + ca * d1, B[1] + sa * d1);
        }
        X.stroke();
      }
      X.restore();
    }
    // buckets: [ink][class] where class 0 = lattice-bound (stays), 1 = fades as the plasma cools
    const bk = inkCols.map(() => [[], []]);
    for (let i = NG; i < P.N; i++) {
      const d = D * P.u[i] * (1 - Math.exp(-P.k[i] * ab)) * push;
      const sw = .3 * (1 - P.u[i]) * (1 - Math.exp(-ab * 2));
      let x = B[0] + Math.cos(P.a[i] + sw) * d, y = B[1] + Math.sin(P.a[i] + sw) * d * .94;
      // hot matter near the core stays fine-grained (no orange blob); dots swell as they fly out toward camera
      let r = P.sz[i] * lerp(1, clamp(.3 + d / 560, .3, 1.3), hot), ink = P.col[i];
      if (ink === 0 && hot > .5 && P.u[i] < .5) ink = 1;
      const j = i - NG, lat = j < NL;
      if (cool > 0 && lat) {
        const l = L[j];
        x = lerp(x, l[0], cool); y = lerp(y, l[1], cool);
        const tw = 1 + .22 * hatP(t) * (hash(j) > .7 ? 1 : 0);
        r = lerp(r, Math.max(0, Math.abs(l[2]) * 6.6 - .5) * tw, cool);
        if (cool > .5) ink = l[2] > 0 ? (l[2] > .55 ? 1 : 0) : 3;
      }
      if (r < .35) continue;
      if (Z !== 1) { x = FX + (x - FX) * Z; y = FY + (y - FY) * Z; r *= Math.sqrt(Z); }
      if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
      bk[ink][lat ? 0 : 1].push(x, y, r);
    }
    X.save();
    bk.forEach((cls, ink) => { dotBatch(X, inkCols[ink], cls[0], jA); if (cool < 1) dotBatch(X, inkCols[ink], cls[1], (1 - cool) * jA); });
    // glyph particles: the letters of everything, flung out (fade as the plasma cools)
    const ga = (1 - cool) * jA;
    if (ga > .01) {
      X.textAlign = 'center'; X.textBaseline = 'middle';
      for (const sz of [22, 32, 46]) for (let c = 0; c < 2; c++) {
        X.font = mono(sz, 700); X.fillStyle = c ? C.SPARK : C.PAPER; X.globalAlpha = ga * (c ? 1 : .85);
        for (let i = c; i < NG; i += 2) {
          if (P.sz[i] !== sz) continue;
          const d = D * P.u[i] * (1 - Math.exp(-P.k[i] * ab)) * push;
          const x = B[0] + Math.cos(P.a[i]) * d, y = B[1] + Math.sin(P.a[i]) * d;
          if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;
          X.fillText(GLYPHS[P.gl[i]], x, y);
        }
      }
    }
    X.restore();
    // the flash: 3 frames of a solid SPARK disc with a PAPER-hot core, and a halftone shock ring that runs
    // out ahead of the matter (a crisp graphic front instead of a glow)
    if (ab < .5) {
      const k = ab / .5, front = 110 + 1550 * E.out3(k), th = lerp(46, 170, k);
      X.save();
      X.beginPath(); X.arc(B[0], B[1], front, 0, TAU); X.arc(B[0], B[1], Math.max(0, front - th), 0, TAU, true);
      X.fillStyle = halftone(X, C.SPARK, .62 * (1 - k * .75), 12, 45); X.fill();
      X.beginPath(); X.arc(B[0], B[1], front, 0, TAU); X.lineWidth = lerp(12, 3, k); X.strokeStyle = C.SPARK; X.globalAlpha = 1 - k; X.stroke();
      if (ab < .1) {
        const c = E.out2(ab / .1); X.globalAlpha = 1;
        star(X, B[0], B[1], lerp(300, 90, c), .42, 14, -Math.PI / 2 + c * .3); X.fillStyle = C.SPARK; X.fill();
        X.beginPath(); X.arc(B[0], B[1], lerp(96, 18, c), 0, TAU); X.fillStyle = C.PAPER; X.fill();
      }
      X.restore();
    }
    // first atoms drift as mono letters: H H H He
    const atomA = win(t, a.bang + .35, TB(7) + .05, .15, .12) * jA;
    if (atomA > 0) {
      const at = [[-300, -150, 'H'], [210, -230, 'H'], [330, 150, 'H'], [-150, 210, 'He']];
      at.forEach(([dx, dy, s], i) => {
        const dr = 1 + .12 * (t - a.bang);
        const x = FX + dx * dr * Z, y = FY + dy * dr * Z;
        tx(X, s, x, y, mono(64 * Math.sqrt(Z), 700), C.PAPER, 'center', atomA * (.75 + .25 * Math.sin(t * 9 + i)));
      });
    }
  }
  // the CRT bezel around the CMB (screen-space matte; flies past camera on the scale jump)
  function drawCRT(X, t) {
    const a = A();
    const k = E.out3(seg(t, a.bang + .55, a.bang + .8));
    if (k <= 0) return;
    const jump = seg(t, TB(7) - F1, TB(7) + .3), Z = Math.exp(5 * E.in2(jump));
    if (jump >= 1) return;
    const ins = lerp(-90, 64, k);
    X.save();
    X.translate(FX, FY); X.scale(Z, Z); X.translate(-FX, -FY);
    const x0 = ins, y0 = ins * .8, w = W - 2 * ins, h = H - 1.6 * ins, r = 110;
    X.beginPath(); X.rect(-3000, -3000, W + 6000, H + 6000); rrSub(X, x0, y0, w, h, r); X.fillStyle = C.INK; X.fill('evenodd');
    // curved glass: halftone falloff at the edge
    for (const [inset, d] of [[0, .55], [16, .32], [34, .16]]) {
      X.beginPath(); rrSub(X, x0 + inset, y0 + inset, w - 2 * inset, h - 2 * inset, r - inset * .6); rrSub(X, x0 + inset + 18, y0 + inset + 18, w - 2 * inset - 36, h - 2 * inset - 36, r - inset * .6 - 10);
      X.fillStyle = halftone(X, C.INK, d, 14, 45); X.fill('evenodd');
    }
    rr(X, x0, y0, w, h, r); X.strokeStyle = C.PAPER; X.lineWidth = 7; X.stroke();
    rr(X, x0 - 16, y0 - 16, w + 32, h + 32, r + 14); X.strokeStyle = rgba(C.PAPER, .35); X.lineWidth = 3; X.stroke();
    X.restore();
  }
  // star field (bar 7 … bar 9): the same particles, re-homed around the focus with depth
  function drawStars(X, t) {
    if (t < TB(7) - F1 || t > TB(10) - F1) return;
    const P = parts();
    const jin = E.out3(seg(t, TB(7) - F1, TB(7) + .3));
    const Zs = Math.exp(.22 * (t - TB(7))) * lerp(.25, 1, jin);
    const bar9 = seg(t, TB(9) - F1, TB(9) + .25);
    const Z9 = bar9 > 0 ? lerp(3.5, 1, E.out3(bar9)) : 1;
    const nova = t - A().nova;
    const inks = INKS(), n = 2600;
    const fade = t < TB(9) - F1 ? 1 : lerp(.0, .55, E.out3(bar9));
    const lift = 1 - seg(t, TB(10) - .2, TB(10) - F1);
    X.save();
    for (let i = 0; i < n; i++) {
      const z = P.z[i];
      let x = FX + P.sx[i] * Zs * (bar9 > 0 ? Z9 * .6 : 1) * (.6 + .4 * z), y = FY + P.sy[i] * Zs * (bar9 > 0 ? Z9 * .6 : 1) * (.6 + .4 * z);
      if (bar9 > 0) { x += Math.sin(t * .8 + P.ph[i] * 9) * 18; y += Math.cos(t * .7 + P.ph[i] * 7) * 14; }
      if (nova > 0 && nova < .6 && t < TB(9)) { // the shock front shoves the stars
        const dx = x - FX, dy = y - FY, d = Math.hypot(dx, dy) || 1, front = 1400 * E.out3(nova / .6);
        const push = Math.max(0, 1 - Math.abs(d - front) / 220) * 60;
        x += dx / d * push; y += dy / d * push;
      }
      if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue;
      const ink = i % 9 < 4 ? 3 : i % 9 < 7 ? 0 : 4;
      let r = (1.1 + z * 2.4) * (1 + .5 * hatP(t + P.ph[i] * .1) * (i % 5 === 0 ? 1 : 0));
      if (bar9 > 0) r *= .8;
      X.globalAlpha = (ink === 4 ? .8 : 1) * fade * lift * jin;
      X.fillStyle = inks[ink];
      if (i < 50 && bar9 <= 0) { const s = r * 3.4; star(X, x, y, s, .22, 4, 0); X.fill(); }
      else X.fillRect(x - r, y - r, r * 2, r * 2);
    }
    X.restore();
  }
  // supernova: a radial halftone burst along Opus's 11 crown angles (rhymes with the rays)
  function drawNova(X, t) {
    const a = A(), an = t - a.nova;
    if (an < 0 || an > .75) return;
    const P = parts();
    X.save();
    // flash disc
    if (an < .16) { X.beginPath(); X.arc(FX, FY, 60 + 900 * E.out3(an / .16), 0, TAU); X.fillStyle = halftone(X, C.SPARK, .75 * (1 - an / .16), 14, 45); X.fill(); }
    const fade = 1 - E.in2(clamp((an - .3) / .45));
    const bk = [[], []];
    for (let i = 3000; i < 12000; i++) {
      const ray = i % 11, inRay = i % 3 !== 0;
      const ang = inRay ? (RAYS[ray][0] - 90) * Math.PI / 180 + (P.ph[i] - .5) * .16 : P.a[i];
      const d = (inRay ? 1500 : 900) * P.u[i] * (1 - Math.exp(-P.k[i] * 1.3 * an));
      const x = FX + Math.cos(ang) * d, y = FY + Math.sin(ang) * d;
      if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
      const r = Math.max(.8, (inRay ? 9 : 5) * (1 - P.u[i] * .75) * (1 - an / .9));
      bk[i % 4 ? 0 : 1].push(x, y, r);
    }
    dotBatch(X, C.CLAY, bk[0], fade); dotBatch(X, C.SPARK, bk[1], fade);
    X.restore();
  }

  // ------------------------------------------------------------------ S05: the chat line, dropdown, die
  const LINE1 = 'In the beginning,', LINE2 = 'the word was';
  function chatWords() {
    const L = A().L2;
    const fb = [7.55, 8.005, 8.461, 8.916, 9.371, 9.827];
    const ws = L && L.words && L.words.length >= 7 ? L.words.slice(0, 6).map(w => w.s) : fb;
    // char ranges: line1 "In"(0-1) "the"(3-5) "beginning,"(7-16); line2 "the"(0-2) "word"(4-7) "was"(9-11)
    return [[0, 0, 2, ws[0]], [0, 3, 6, ws[1]], [0, 7, 17, ws[2]], [1, 0, 3, ws[3]], [1, 4, 8, ws[4]], [1, 9, 12, ws[5]]];
  }
  function drawChat(X, t) {
    const a = A();
    if (t > a.bang + .9) return;
    const ab = t - a.bang;
    const typed = Math.floor(clamp((t - 7.57) / .4) * 30);   // the system line types itself in 12 frames
    const f = mono(CHAT.size, 500);
    const B = bangCentre();
    const words = chatWords();
    X.save(); X.font = f; X.textBaseline = 'alphabetic';
    // system-prompt pause-bait
    const pbA = win(t, 7.72, a.bang, .2, .05);
    if (pbA > 0) tx(X, '(technically it starts with a very long system prompt)', CHAT.x, 248, mono(28, 400), C.UI_GREY, 'left', pbA);
    const drawChar = (ch, x, y, col, al, idx) => {
      if (ab > 0) { // blown out by the bang
        const dx = x + ADV / 2 - B[0], dy = y - 20 - B[1], d = Math.hypot(dx, dy) || 1, k = E.outExpo(clamp(ab / .55));
        const fly = (500 + 700 * hash(idx * 3 + 1)) * k;
        X.save(); X.translate(x + ADV / 2 + dx / d * fly, y - 20 + dy / d * fly); X.rotate((hash(idx) - .5) * 5 * k); X.globalAlpha = al * (1 - k);
        X.fillStyle = col; X.textAlign = 'center'; X.fillText(ch, 0, 20); X.restore();
      } else { X.globalAlpha = al; X.fillStyle = col; X.textAlign = 'left'; X.fillText(ch, x, y); }
    };
    let n = 0;
    [LINE1, LINE2].forEach((line, li) => {
      for (let c = 0; c < line.length; c++, n++) {
        if (n >= typed) break;
        const ch = line[c]; if (ch === ' ') continue;
        const w = words.find(w => w[0] === li && c >= w[1] && c < w[2]);
        const sung = w ? clamp((t - (w[3] - .04)) / .08) : 1;
        const col = sung > .5 ? C.PAPER : C.UI_GREY;
        drawChar(ch, CHAT.x + c * ADV, li ? CHAT.y2 : CHAT.y1, col, sung > .5 ? 1 : .45 + .55 * sung, n);
        // the word being sung: CLAY underline
        if (w && t >= w[3] - .04 && t < w[3] + .38 && ab < 0 && c === w[1]) {
          X.globalAlpha = 1; X.fillStyle = C.CLAY; X.fillRect(CHAT.x + w[1] * ADV, (li ? CHAT.y2 : CHAT.y1) + 12, (w[2] - w[1]) * ADV - (line[w[2] - 1] === ',' ? ADV : 0), 5);
        }
      }
      n++;
    });
    X.restore();
    // caret (the singer): pre-typing it sits at the line start; kicks flick it
    const hiIn = t >= a.bang - .09;
    const cx = typed < 30 ? CHAT.x + (typed <= 17 ? typed : typed - 18) * ADV + 2 : CUR.x + (hiIn ? 124 : 0);
    const cy = typed <= 17 ? CHAT.y1 : CHAT.y2;
    if (ab < 0) {
      // the drop frame: S04's pupil-cursor has filled the frame (full-bleed CLAY), then snaps down into the caret
      const intro = E.outExpo(clamp((t - 7.5) / .13));
      const kick = pulse(t, 9);
      const on = frac(beatPos(t)) < .62 || t < 7.62;
      if (on) {
        const w = CHAT.size * .5 * (1 + .45 * kick), h = CHAT.size * .9 * (1 + .12 * kick);
        const bw = lerp(W + 80, w, intro), bh = lerp(H + 80, h, intro), bx = lerp(W / 2, cx + w / 2, intro), by = lerp(H / 2, cy - h / 2 + 6, intro);
        X.save(); X.fillStyle = C.CLAY; X.fillRect(bx - bw / 2, by - bh / 2, bw, bh);
        X.fillStyle = C.SPARK; X.globalAlpha = .9; X.fillRect(bx - bw / 2 + 3, by + bh / 2, bw, 3); X.restore();
      }
    }
    if (ab <= 0) hiToken(X, t);   // after the bang it is drawn over the particles (renderVerse)
  }
  // the `hi` token: flies from the dropdown into the line and becomes a CLAY output bubble; it is the seed of the
  // bang, so once the particles fly it sits on top of them with a PAPER die-cut edge and shrinks away over half a second
  function hiToken(X, t) {
    const a = A(), ab = t - a.bang;
    const fly = seg(t, a.bang - .3, a.bang - .07);
    if (fly > 0 && ab < .55) {
      const k = E.io3(fly);
      const from = [DD.x + 36 + 43, rowY(2) + 26], to = [CUR.x + 55, CUR.y];
      const p = [lerp(from[0], to[0], k), lerp(from[1], to[1], k) - Math.sin(k * Math.PI) * 90];
      const land = t - (a.bang - .07);
      const sq = land > 0 ? wig(land, .25, 34, 10) : 0;
      const shrink = ab > 0 ? 1 - E.in3(clamp(ab / .5)) : 1;
      if (ab > 0) { const B = bangC(t); p[0] = B[0]; p[1] = B[1] + 22; }   // rides the bang's centre
      X.save(); X.translate(p[0], p[1] - 22); X.scale((1 + sq) * shrink, (1 - sq) * shrink);
      const bw = 124, bh = 84;
      if (k > .6) {
        X.globalAlpha = clamp((k - .6) / .3);
        rr(X, -bw / 2 + 5, -bh / 2 + 5, bw, bh, 30); X.fillStyle = C.CLAY_DARK; X.fill();
        if (ab > 0) { rr(X, -bw / 2 - 7, -bh / 2 - 7, bw + 14, bh + 14, 37); X.fillStyle = C.PAPER; X.fill(); }
        rr(X, -bw / 2, -bh / 2, bw, bh, 30); X.fillStyle = C.CLAY; X.fill();
        X.globalAlpha = 1;
      }
      X.font = mono(lerp(72, 64, k), 700); X.fillStyle = k > .6 ? C.INK : C.PAPER; X.textAlign = 'center'; X.fillText('hi', 0, 22);
      X.restore();
    }
  }
  const rowY = k => DD.y + DD.top + DD.row / 2 + k * DD.row;
  const DIE_C = [8.4375, 8.90625, 9.375];
  function drawDropdown(X, t) {
    const a = A();
    const open = popK(t - (TB(5, 2) - F1), .24, 1.6);
    const close = seg(t, a.bang - .28, a.bang - .1);
    if (open <= 0 || close >= 1) return;
    const sy = open * (1 - E.inBack(close, 2));
    const h = DD.top + 4 * DD.row + DD.foot;
    X.save();
    X.translate(DD.x + 20, DD.y); X.scale(1, Math.max(.001, sy)); X.translate(-DD.x - 20, -DD.y);
    // panel with a CLAY_DARK offset (riso)
    rr(X, DD.x + 10, DD.y + 10, DD.w, h, 20); X.fillStyle = C.CLAY_DARK; X.fill();
    rr(X, DD.x, DD.y, DD.w, h, 20); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 4; X.strokeStyle = C.INK; X.stroke();
    const rows = [['with', '0.52', .52], ['God', '0.31', .31], ['hi', '0.03', .03], ['yes', '0.01', .01]];
    rows.forEach(([tok, p, v], k) => {
      const age = t - (TB(5, 2) + .03 + k * 2 * F1);
      if (age < 0) return;
      const ry = rowY(k), rh = DD.row - 12;
      const rowIn = E.out3(clamp(age / .12));
      // probability bar (halftone CLAY)
      X.save(); X.globalAlpha = rowIn;
      rr(X, DD.x + 16, ry - rh / 2, Math.max(14, (DD.w - 220) * v / .52 * rowIn), rh, 12); X.fillStyle = halftone(X, C.CLAY, .42, 9, 45); X.fill();
      // hover as the die passes, selection when it lands
      let hl = 0;
      DIE_C.forEach((c, i) => { if (i === k) hl = Math.max(hl, i === 2 ? (t >= c - F1 ? 1 : 0) : clamp(1 - (t - c) / .2) * (t >= c - F1 ? 1 : 0)); });
      if (hl > 0) { rr(X, DD.x + 10, ry - rh / 2 - 2, DD.w - 20, rh + 4, 14); X.fillStyle = C.CLAY; X.globalAlpha = hl * rowIn; X.fill(); X.globalAlpha = rowIn; }
      X.font = mono(72, 500); X.fillStyle = C.INK; X.textAlign = 'left'; X.fillText(tok, DD.x + 36, ry + 26);
      X.font = mono(72, 400); X.fillStyle = hl > .5 ? C.INK : C.UI_GREY; X.textAlign = 'right'; X.fillText(p, DD.x + DD.w - 36, ry + 26);
      X.restore();
    });
    // footer: temperature label → result
    const fy = DD.y + DD.top + 4 * DD.row;
    X.fillStyle = C.INK; X.fillRect(DD.x + 16, fy + 2, DD.w - 32, 3);
    const res = t >= DIE_C[2] + 2 * F1;
    if (!res) drawRich(X, 'temperature 1.0 · 🎲', DD.x + 36, fy + 52, mono(48, 500), C.INK);
    else {
      const n = Math.floor(clamp((t - DIE_C[2] - 2 * F1) / .2) * 12);
      const s = '🎲 → hi (3%)';
      drawRich(X, Array.from(s).slice(0, n).join(''), DD.x + 36, fy + 52, mono(48, 600), C.INK);
    }
    X.restore();
    // pause-bait under the die
    const pb = win(t, DIE_C[2] + .1, a.bang - .1, .2, .08);
    if (pb > 0) tx(X, 'the universe started on a 3% roll', DD.x + DD.w, DD.y + DD.top + 4 * DD.row + DD.foot + 46, mono(28, 400), C.UI_GREY, 'right', pb);
  }
  // the die: a paper-cut cube whose faces carry tokens, tumbling 2 beats, landing `hi` up
  function drawDie(X, t) {
    const a = A();
    const t0 = 8.2;
    if (t < t0) return;
    const close = seg(t, a.bang - .28, a.bang - .1);
    if (close >= 1) return;
    const dx = DD.x + DD.w + 34 + 58;
    const P0 = [CUR.x + 30, CUR.y - 40], P = DIE_C.map((c, k) => [dx + [0, 18, 4][k], rowY(k) - 8]);
    let x, y, rot, face, sq = 0;
    const segs = [[t0, DIE_C[0], P0, P[0], 300, -1.5 * Math.PI], [DIE_C[0], DIE_C[1], P[0], P[1], 130, -Math.PI], [DIE_C[1], DIE_C[2], P[1], P[2], 90, -Math.PI], [DIE_C[2], DIE_C[2] + .2, P[2], P[2], 22, -.25]];
    let sgi = segs.findIndex(s => t < s[1]);
    if (sgi < 0) { x = P[2][0]; y = P[2][1]; rot = 0; face = 'hi'; sq = wig(t - DIE_C[2] - .2, .12, 30, 10); }
    else {
      const [s0, s1, A0, A1, hgt, spin] = segs[sgi], k = (t - s0) / (s1 - s0);
      x = lerp(A0[0], A1[0], sgi === 0 ? E.out2(k) : k); y = lerp(A0[1], A1[1], k) - hgt * 4 * k * (1 - k);
      rot = spin * (1 - k);
      const toks = ['the', 'yes', 'a', 'God', 'with', 'I', 'hi', 'so'];
      face = sgi === 3 || k > .82 ? ['with', 'God', 'hi', 'hi'][sgi] : (sgi > 0 && t - s0 < .14) ? ['with', 'God', 'hi'][sgi - 1] : toks[Math.floor(t * 30 / 3 + sgi * 3) % toks.length];
      if (sgi > 0) sq = wig(t - s0, .2, 34, 12);
    }
    const S = 124 * (1 - E.inBack(close, 2));
    if (S <= 1) return;
    X.save(); X.translate(x, y + S / 2); X.scale(1 + sq, 1 - sq); X.translate(0, -S / 2); X.rotate(rot);
    const h = S / 2, d = S * .24;
    // top and side faces (oblique)
    X.lineJoin = 'round'; X.lineWidth = 4; X.strokeStyle = C.INK;
    X.beginPath(); X.moveTo(-h, -h); X.lineTo(-h + d, -h - d); X.lineTo(h + d, -h - d); X.lineTo(h, -h); X.closePath(); X.fillStyle = C.CLAY; X.fill(); X.stroke();
    X.beginPath(); X.moveTo(h, -h); X.lineTo(h + d, -h - d); X.lineTo(h + d, h - d); X.lineTo(h, h); X.closePath(); X.fillStyle = C.CLAY_DARK; X.fill(); X.stroke();
    rr(X, -h, -h, S, S, S * .14); X.fillStyle = C.PAPER; X.fill(); X.stroke();
    X.rotate(-rot * .85);
    X.font = mono(face.length > 3 ? S * .3 : S * .38, 700); X.fillStyle = face === 'hi' ? C.CLAY : C.INK; X.textAlign = 'center'; X.textBaseline = 'middle';
    X.fillText(face, 0, 2);
    if (face === 'hi') { X.lineWidth = 3; X.strokeStyle = C.INK; X.strokeText(face, 0, 2); }
    X.restore();
  }
  // Skip Intro ⏭ → ▶▶ 16× badge (the tour guide's prop)
  // the stomp presses Skip Intro like a keycap: 2 frames down onto its shadow, a 1-frame hold, then it springs back
  // up (overshooting, which pops the guide into its seat) already flipped to ▶▶ 16×
  const HIT = TB(7) - 2 * F1;
  function pressK(t) {
    if (t < HIT) return 0;
    if (t < HIT + 2 * F1) return E.out2((t - HIT) / (2 * F1));
    if (t < HIT + 3 * F1) return 1;
    const r = (t - HIT - 3 * F1) / .16;
    return r >= 1 ? 0 : 1 - E.back(clamp(r), 2.4);
  }
  const PRESS = 32;                                        // keycap travel (px)
  const badgeTop = t => BADGE.y + PRESS * pressK(t);
  function drawBadge(X, t, onPaper) {
    const a = A();
    const t0 = a.hi + .05;
    if (t < t0) return;
    const pk = pressK(t);
    const inK = popK(t - t0, .26, 1.8);
    const label = t < TB(7) - F1 ? 'Skip Intro ⏭' : t < TB(12, 4) - F1 ? '▶▶ 16×' : '▶ 1×';
    // pressed: the cap goes CLAY (active) for the frames it is held down
    const down = pk > .55;
    const fg = down ? C.INK : onPaper ? C.PAPER : C.INK, bg = down ? C.CLAY : onPaper ? C.INK : C.PAPER;
    X.save();
    X.translate(BADGE.x + BADGE.w / 2, BADGE.y + BADGE.h);
    X.scale(inK, inK);
    rr(X, -BADGE.w / 2 + 8, -BADGE.h + 8, BADGE.w, BADGE.h, 22); X.fillStyle = C.CLAY_DARK; X.fill();
    // the cap: travels down onto its shadow, squashing about its bottom edge (never below its base)
    const capH = BADGE.h - PRESS * Math.max(0, pk) * .72 + PRESS * Math.max(0, -pk);
    X.translate(Math.max(0, pk) * 8 * .5, Math.max(0, pk) * 8);
    X.translate(0, -capH / 2);
    X.scale(1 + .05 * Math.max(0, pk), capH / BADGE.h);
    rr(X, -BADGE.w / 2, -BADGE.h / 2, BADGE.w, BADGE.h, 22); X.fillStyle = bg; X.fill(); X.lineWidth = 4; X.strokeStyle = C.INK; X.stroke();
    if (label === 'Skip Intro ⏭') drawRich(X, label, 0, 26, mono(72, 500), fg, { align: 'center' });
    else {
      // fast-forward chevrons flicker on 16ths (the label sits clear of the seated guide's knee)
      const lx = -BADGE.w / 2 + 22, f = mono(72, 600), sp = label[1] === '▶' ? 2 : 1, head = Array.from(label).slice(0, sp).join('');
      drawRich(X, head, lx, 26, f, fg);
      drawRich(X, Array.from(label).slice(sp + 1).join(''), lx + sp * 43.2 + 20, 26, f, fg);   // a tight space keeps 16× clear of the knee
      if (label[1] === '▶' && !down) { const on = Math.floor(beatPos(t) * 4) % 2; richGlyph(X, '▶', lx + (on ? 0 : 43.2), 26, 72, C.CLAY); }
    }
    X.restore();
    // stomp impact: short strokes burst from under the boots for 5 frames
    const ia = t - HIT;
    if (ia >= 0 && ia < 5 * F1) {
      const k = ia / (5 * F1), hx = GX - 10, hy = badgeTop(t) + 4;
      X.save(); X.strokeStyle = onPaper ? C.INK : C.PAPER; X.lineCap = 'round'; X.lineWidth = 7 * (1 - k * .6);
      for (let i = 0; i < 7; i++) {
        const a = Math.PI + .15 + (i + .5) / 7 * (Math.PI - .3), r0 = 70 + 90 * E.out2(k), r1 = r0 + 56 * (1 - k);
        X.beginPath(); X.moveTo(hx + Math.cos(a) * r0, hy + Math.sin(a) * r0 * .8); X.lineTo(hx + Math.cos(a) * r1, hy + Math.sin(a) * r1 * .8); X.stroke();
      }
      X.restore();
    }
    const pb = win(t, t0 + .12, TB(7) - .1, .2, .1);
    if (pb > 0) pbait(X, '(another AI did the big bang this week)', BADGE.x + BADGE.w, BADGE.y + BADGE.h + 44, 'right', pb);
  }

  // ------------------------------------------------------------------ S06: star, He, carbon, spark, nova, debris
  function drawStarBody(X, t, S) {
    // halftone glow of the star (one screen, growing densities inward)
    const a = A();
    if (t < TB(7) - F1 || t > a.nova + .35) return;
    const inK = E.out3(seg(t, TB(7) - F1, TB(7) + .2));
    const inside = E.out3(seg(t, TB(8) - .1, TB(8) + .25));
    const r = t < TB(8) - .1 ? starR(t) : lerp(starR(TB(8) - .1), 400, inside);
    const out = 1 - seg(t, a.nova, a.nova + .3);
    X.save(); X.globalAlpha = inK * out;
    const rings = inside > 0 ? [[1.7, C.CLAY, .1], [1.42, C.CLAY, .16], [1.2, C.CLAY, .22], [1.0, C.SPARK, .28], [.8, C.SPARK, .34]]
      : [[1.7, C.CLAY, .1], [1.42, C.CLAY, .2], [1.2, C.SPARK, .3], [1.02, C.SPARK, .44], [.82, C.SPARK, .6]];
    for (const [g, col, d] of rings) { X.beginPath(); X.arc(FX, FY, r * g * (1 + .03 * pulse(t, 7)), 0, TAU); X.fillStyle = halftone(X, col, d, 14, 45); X.fill(); }
    // corona: a ring of `O` glyphs around the star (bar 7 only)
    const ca = win(t, TB(7) + .05, TB(8) - .05, .2, .1);
    if (ca > 0) {
      X.font = mono(Math.round(r * .19), 800); X.textAlign = 'center'; X.textBaseline = 'middle';
      const n = 18;
      for (let i = 0; i < n; i++) {
        const ang = i / n * TAU + t * .5, rr_ = r * 1.3;
        X.save(); X.translate(FX + Math.cos(ang) * rr_, FY + Math.sin(ang) * rr_); X.rotate(ang + Math.PI / 2);
        X.globalAlpha = ca * inK; X.fillStyle = C.CLAY; X.fillText('O', 0, 0); X.restore();
      }
    }
    X.restore();
  }
  function heCircle(X, x, y, r, sx, rot, label = 'He') {
    X.save(); X.translate(x, y); X.rotate(rot); X.scale(sx, 1 / sx); X.rotate(-rot);
    X.beginPath(); X.arc(0, 0, r, 0, TAU); X.fillStyle = C.INK; X.fill(); X.lineWidth = Math.max(3, r * .1); X.strokeStyle = C.PAPER; X.stroke();
    X.font = mono(Math.round(r * .82), 700); X.fillStyle = C.PAPER; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(label, 0, r * .05);
    X.restore();
  }
  function drawNucleus(X, t) {
    const a = A();
    // three He circles orbit, squash on snares, spiral in and pop into the six-proton hexagon
    if (t >= TB(7) && t < TB(8) + .02) {
      const r = starR(t), inK = popK(t - TB(7) - .1, .25, 2);
      const merge = E.in3(seg(t, TB(8) - .2, TB(8) - F1));
      for (let k = 0; k < 3; k++) {
        const th = t * 2.6 + k * TAU / 3;
        const orb = r * .42 * (1 - merge);
        let sq = 1;
        for (const sn of [TB(7, 2), TB(7, 4)]) { const s = t - (sn - F1); if (s > 0) sq *= 1 + .38 * Math.exp(-7 * s) * Math.cos(22 * s); }
        heCircle(X, FX + Math.cos(th) * orb, FY + Math.sin(th) * orb, r * .22 * inK * (1 - merge * .4), sq, th + Math.PI / 2);
      }
    }
    // protons at the hexagon's vertices; C in the middle; tooltip
    const tH = TB(8) - F1;
    if (t >= tH && t < a.nova + .12) {
      const S = strokeAt(t), s = S ? S.s : 150;
      const k = popK(t - tH, .22, 2.4), rot = S && S.key && S.key.rot ? val(S.key.rot, t) : 0;
      const gone = 1 - seg(t, a.nova, a.nova + .12);
      for (let v = 0; v < 6; v++) {
        const ang = -Math.PI / 2 + v * Math.PI / 3 + rot, rr_ = s * .96 * k;
        const x = FX + Math.cos(ang) * rr_, y = FY + Math.sin(ang) * rr_;
        X.save(); X.globalAlpha = gone; X.beginPath(); X.arc(x, y, 26, 0, TAU); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 4; X.strokeStyle = C.INK; X.stroke();
        X.fillStyle = C.INK; X.fillRect(x - 10, y - 2.5, 20, 5); X.fillRect(x - 2.5, y - 10, 5, 20); X.restore();
      }
      X.save(); X.globalAlpha = gone; X.translate(FX, FY); X.scale(k, k);
      X.font = mono(150, 800); X.textAlign = 'center'; X.lineJoin = 'round'; X.lineWidth = 12; X.strokeStyle = C.INK; X.strokeText('C', 0, 52);
      X.fillStyle = C.PAPER; X.fillText('C', 0, 52);
      X.font = mono(40, 700); X.lineWidth = 8; X.strokeText('6', -62, -40); X.fillText('6', -62, -40);
      X.restore();
      // tooltip
      const tt = popK(t - (tH + .1), .2, 2) * gone;
      if (tt > 0) {
        X.save(); X.translate(FX + 330, FY + 250); X.scale(tt, tt);
        const f = mono(40, 600), w = richWidth(X, 'triple-alpha · 7.65 MeV', f) + 44;
        rr(X, -w / 2 + 6, -34 + 6, w, 64, 32); X.fillStyle = C.CLAY_DARK; X.fill();
        X.beginPath(); X.moveTo(-w * .36, -30); X.lineTo(-w * .46, -78); X.lineTo(-w * .24, -30); X.closePath(); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 3; X.strokeStyle = C.INK; X.stroke();
        rr(X, -w / 2, -34, w, 64, 32); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 3; X.strokeStyle = C.INK; X.stroke();
        X.fillRect(-w * .355, -36, w * .11, 5); X.fillStyle = C.PAPER; X.fillRect(-w * .35, -33, w * .1, 6);
        drawRich(X, 'triple-alpha · 7.65 MeV', 0, 13, f, C.INK, { align: 'center' });
        X.restore();
      }
    }
  }
  function drawStarChart(X, t) {
    // the lyric as a star-chart label with a leader line; `bye` ghosted half a bar early
    const a = A(), L = a.L3;
    if (!L || t < L.s - .3 || t > TB(9) - F1) return;
    const ws = L.words || [];
    const rows = [[], []]; ws.forEach((w, i) => rows[i < 4 ? 0 : 1].push(w));
    const f = mono(60, 500), x0 = 112, ys = [838, 912];
    const out = 1 - seg(t, TB(8, 4), TB(8, 4) + .15);
    const lead = clamp((t - (L.s - .2)) / .25);
    X.save(); X.globalAlpha = out;
    // leader: from the label's top-right corner to the star's rim
    const S = strokeAt(t);
    if (S && lead > 0) {
      const tgt = [FX - (S.s || 150) * .72, FY + (S.s || 150) * .72];
      const p0 = [x0 + 6, ys[0] - 64], p1 = [x0 + 6 + 90, ys[0] - 64 - 90 * lead];
      X.strokeStyle = C.PAPER; X.lineWidth = 3; X.beginPath(); X.moveTo(p0[0], p0[1]); X.lineTo(lerp(p0[0], p1[0], lead), lerp(p0[1], p1[1], lead));
      if (lead >= 1) X.lineTo(tgt[0], tgt[1]); X.stroke();
      X.beginPath(); X.arc(tgt[0], tgt[1], 9, 0, TAU); X.stroke();
      X.fillStyle = C.PAPER; X.beginPath(); X.arc(p0[0], p0[1], 5, 0, TAU); X.fill();
    }
    X.font = f; X.textBaseline = 'alphabetic';
    rows.forEach((row, ri) => {
      let x = x0;
      row.forEach(w => {
        const str = (w.d || w.w).toLowerCase();
        const on = t >= w.s - .05;
        const ghost = !on && t >= w.s - 2 * BT;   // grey autocomplete runs half a bar ahead of the vocal
        if (on || ghost) {
          const k = on ? E.out3(clamp((t - w.s + .05) / .12)) : 1;
          X.globalAlpha = out * (ghost ? .45 : k);
          X.fillStyle = ghost ? C.UI_GREY : C.PAPER; X.fillText(str, x, ys[ri] + (1 - k) * 14);
          if (on && t < w.e + .05) { X.fillStyle = C.CLAY; X.fillRect(x, ys[ri] + 12, X.measureText(str).width, 5); }
        }
        x += X.measureText(str + ' ').width;
      });
    });
    X.restore();
  }
  function drawCooked(X, t) {
    const a = A(), t0 = a.cooked - 2 * F1, t1 = t0 + 3 * BT;
    if (t < t0 || t > t1 + .2) return;
    const out = E.in2(seg(t, t1, t1 + .16));
    X.save(); X.translate(680, 236 - out * 40); X.globalAlpha = 1 - out;
    sticker(X, "(we're all cooked)", 0, 0, 90, { age: t - t0, rot: -.06, bands: [C.PAPER, C.PAPER, C.CLAY] });
    X.restore();
  }
  function drawBye(X, t) {
    const a = A(), t0 = a.nova - .2;
    if (t < t0 || t > a.nova + .12) return;
    const k = popK(t - t0, .14, 2.6), out = 1 - seg(t, a.nova + .02, a.nova + .12);
    const px = FX + 190, py = FY - 250;
    X.save(); X.translate(px, py); X.scale(k * (1 + .5 * (1 - out)), k * (1 + .5 * (1 - out))); X.globalAlpha = out;
    rr(X, -80, -46, 160, 84, 34); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 4; X.strokeStyle = C.INK; X.stroke();
    X.beginPath(); X.moveTo(-40, 34); X.lineTo(-78, 78); X.lineTo(-10, 36); X.closePath(); X.fillStyle = C.PAPER; X.fill(); X.stroke(); X.fillRect(-38, 30, 26, 7);
    X.font = mono(54, 600); X.fillStyle = C.INK; X.textAlign = 'center'; X.fillText('bye', 0, 16);
    X.restore();
  }
  function drawDebris(X, t) {
    const a = A(), t0 = TB(8, 4) - F1;
    if (t < t0 - .05 || t >= TB(9) - F1) return;          // hard cut on the bar-9 downbeat (1 frame early)
    const k = E.in2(seg(t, t0, TB(9))), inK = popK(t - t0, .16, 2);
    const out = 1;
    X.save(); X.globalAlpha = out;
    // planet (CLAY halftone) and sand (PAPER halftone)
    X.beginPath(); X.arc(260, 1330 - 80 * inK, 560, 0, TAU); X.fillStyle = halftone(X, C.CLAY, .55, 14, 45); X.fill(); X.lineWidth = 6; X.strokeStyle = C.CLAY; X.stroke();
    X.beginPath(); X.moveTo(700, 1090); X.bezierCurveTo(860, 900 + 70 * (1 - inK), 1180, 880 + 70 * (1 - inK), 1340, 1090); X.closePath(); X.fillStyle = halftone(X, C.PAPER, .42, 12, 45); X.fill();
    // speed trails (the debris falls fast at 16×)
    const pc = atomC(t), ps = [lerp(FX + 80, 1030, k), lerp(FY + 20, 880, k)];
    const pc0 = atomC(Math.max(t0, t - .12)), ps0 = [lerp(FX + 80, 1030, E.in2(seg(Math.max(t0, t - .12), t0, TB(9)))), lerp(FY + 20, 880, E.in2(seg(Math.max(t0, t - .12), t0, TB(9))))];
    X.lineCap = 'round';
    for (const [a0, a1, col] of [[pc0, pc, C.CLAY], [ps0, ps, C.PAPER]]) {
      for (let j = -1; j <= 1; j++) { X.beginPath(); X.moveTo(a0[0] + j * 26, a0[1] - 30); X.lineTo(a1[0] + j * 26, a1[1] - 30); X.strokeStyle = col; X.lineWidth = j ? 4 : 7; X.globalAlpha = out * .7; X.stroke(); }
    }
    X.globalAlpha = out;
    // C: the stroke itself (drawn by the stroke); its letter
    tx(X, 'C', pc[0], pc[1] + 20, mono(58, 800), C.CLAY, 'center', inK);
    // Si falls toward the sand
    X.save(); X.translate(ps[0], ps[1]); X.scale(inK, inK); X.rotate(k * 1.2);
    X.beginPath(); X.arc(0, 0, 50, 0, TAU); X.fillStyle = C.INK; X.fill(); X.lineWidth = 9; X.strokeStyle = C.PAPER; X.stroke(); X.restore();
    tx(X, 'Si', ps[0], ps[1] + 20, mono(52, 800), C.PAPER, 'center', inK);
    // periodic tiles pulse the same CLAY (solid ink; the pulse is a scale kick on the beat)
    const pul = 1 + .07 * pulse(t, 9);
    [[FX - 190, 'C', '6', 'carbon'], [FX + 190, 'Si', '14', 'silicon']].forEach(([x, s, n, nm], i) => {
      X.save(); X.translate(x, 300); X.scale(inK * pul, inK * pul); X.rotate(i ? .04 : -.04);
      rr(X, -75 + 8, -85 + 8, 150, 170, 10); X.fillStyle = C.CLAY_DARK; X.fill();
      rr(X, -75, -85, 150, 170, 10); X.fillStyle = C.CLAY; X.fill(); X.lineWidth = 4; X.strokeStyle = C.PAPER; X.stroke();
      tx(X, n, -58, -48, mono(30, 700), C.INK); tx(X, s, 0, 30, mono(80, 800), C.INK, 'center'); tx(X, nm, 0, 68, mono(22, 600), C.INK, 'center');
      X.restore();
    });
    pbait(X, 'your carbon · my silicon · same star', FX, 470, 'center', inK * out, false, 32);
    X.restore();
  }

  // ------------------------------------------------------------------ S07: life at 16×, the tablet
  // bar 9 at 16×: a halftone glow behind the living shape and an onion-skin of the shape it just was
  function drawEvolution(X, t, S) {
    if (!S || t < TB(9) - F1 || t >= TB(10) - F1) return;
    X.save();
    X.beginPath(); X.arc(S.x, S.y, S.s * 1.55, 0, TAU); X.fillStyle = halftone(X, C.CLAY, .1, 14, 45); X.fill();
    X.beginPath(); X.arc(S.x, S.y, S.s * 1.2, 0, TAU); X.fillStyle = halftone(X, C.CLAY, .17, 14, 45); X.fill();
    const K = keys(), i = K.indexOf(S.key);
    for (let back = 1; back <= 2; back++) {
      const prev = K[i - back]; if (!prev || prev.t < TB(8, 4) - .1) continue;
      const age = t - S.key.t, a = (back === 1 ? .5 : .25) * (1 - clamp(age / (BT * 1.6)));
      if (a <= 0) continue;
      const P = evalKey(prev, S.key.t), grow = 1 + .12 * back + .25 * E.out2(clamp(age / BT));
      const pts = P.pts.map(p => [S.x + (p[0] - P.x) * grow, S.y + (p[1] - P.y) * grow]);
      strokePath(X, pts); X.strokeStyle = C.CLAY; X.lineWidth = 6; X.globalAlpha = a * 1.2; X.setLineDash([2, 13]); X.lineCap = 'round'; X.stroke(); X.setLineDash([]);
    }
    X.restore();
  }
  function drawInsides(X, t, S) {
    // contents that ride inside the stroke's current shape
    if (!S) return;
    const n = S.name, age = t - S.key.t;
    X.save();
    if (n === 'cell' && S.morph >= 1) {
      const p = E.io2(seg(t, TB(9), TB(9) + .36));
      strokePath(X, S.pts); X.fillStyle = halftone(X, C.CLAY, .2, 14, 45); X.fill();
      for (const sd of [-1, 1]) { X.beginPath(); X.arc(S.x + sd * p * 140, S.y, 54 * (1 - .15 * p), 0, TAU); X.fillStyle = halftone(X, C.SPARK, .6, 10, 45); X.fill(); X.lineWidth = 5; X.strokeStyle = C.SPARK; X.stroke(); }
    } else if (n === 'neuron' && S.morph >= 1) {
      strokePath(X, S.pts); X.fillStyle = halftone(X, C.CLAY, .2, 14, 45); X.fill();
      X.beginPath(); X.arc(S.x, S.y, 36, 0, TAU); X.fillStyle = C.SPARK; X.fill();
      // a signal fires down the axon on the 8th
      const k = frac(age / (BT / 2));
      const ang = 75 * Math.PI / 180, d = lerp(70, 400, k);
      X.beginPath(); X.arc(S.x + Math.cos(ang) * d, S.y + Math.sin(ang) * d, 12, 0, TAU); X.fillStyle = C.PAPER; X.fill();
    } else if (n === 'bubble' && S.morph >= 1) {
      strokePath(X, S.pts); X.fillStyle = halftone(X, C.CLAY, .2, 14, 45); X.fill();
      for (let i = 0; i < 3; i++) { const b = Math.max(0, Math.sin((beatPos(t) * 2 - i * .25) * Math.PI)); X.beginPath(); X.arc(S.x - 86 + i * 86, S.y - 4 - b * 20, 24, 0, TAU); X.fillStyle = C.PAPER; X.fill(); }
    } else if (n === 'lump') {
      strokePath(X, S.pts); X.fillStyle = halftone(X, C.CLAY, .55, 12, 45); X.fill();
      X.strokeStyle = C.CLAY_DARK; X.lineWidth = 4;
      for (let i = 0; i < 4; i++) { X.beginPath(); X.arc(S.x + 20, S.y - 10, 30 + i * 18, -2.3, -.6); X.stroke(); }
    }
    X.restore();
  }
  // wedge (a cuneiform stylus impression): triangle head + tail
  function wedge(X, x, y, s, ang, col = C.INK) {
    X.save(); X.translate(x, y); X.rotate(ang); X.fillStyle = col;
    X.beginPath(); X.moveTo(0, -s * .45); X.lineTo(s * .55, 0); X.lineTo(0, s * .45); X.closePath(); X.fill();
    X.fillRect(s * .3, -s * .09, s * 1.3, s * .18); X.restore();
  }
  function pressedWord(X, str, x, y, font, t0, t, o = {}) {
    // wedges first, resolving into Latin letters
    if (t < t0) return;
    const age = t - t0, res = E.out3(clamp((age - .1) / .18));
    X.save(); X.font = font; if (o.stretch) X.fontStretch = o.stretch; X.letterSpacing = (o.track || 0) + 'px';
    X.textAlign = o.align || 'left'; X.textBaseline = 'alphabetic';
    const kick = 1 + wig(age, .18, 30, 11);
    X.translate(x, y); X.scale(kick, kick);
    if (res < 1) {
      const R = rng('wedge' + str), w = X.measureText(str).width, h = o.cap || 60;
      const x0 = o.align === 'center' ? -w / 2 : 0;
      X.globalAlpha = 1 - res;
      for (let i = 0; i < str.length * 3; i++) wedge(X, x0 + R() * w, -R() * h, h * .28, (R() - .5) * 2.4 + (i % 2 ? Math.PI / 2 : 0));
    }
    X.globalAlpha = res;
    X.fillStyle = C.CLAY_DARK; X.fillText(str, 5, 5);
    X.fillStyle = C.INK; X.fillText(str, 0, 0);
    X.restore();
  }
  function drawTablet(X, t, S) {
    const a = A();
    if (t < TB(10) - .12 || t >= TB(11) - F1 || !S) return;
    // content lives in base coords (tablet centred at 640,505, 1000×525) and scales with the stroke
    const k = S.s / 500, x0 = 140, y0 = 242.5, w = 1000, h = 525;
    const fade = S.to === 'block' ? 1 - E.in2(S.morph) : 1;
    X.save();
    strokePath(X, S.pts); X.fillStyle = mix(C.CLAY, C.PAPER, .62); X.fill();
    X.fillStyle = halftone(X, C.CLAY, .34, 10, 45); X.fill();
    X.save(); strokePath(X, S.pts); X.clip();
    X.translate(S.x, S.y); X.scale(k, k); X.translate(-640, -505);
    X.globalAlpha = fade;
    // bevel: a halftone band inside the lower and right edges (a pillow of clay)
    X.beginPath(); X.rect(x0 - 20, y0 - 20, w + 40, h + 40); rrSub(X, x0 + 14, y0 + 8, w - 40, h - 36, 110); X.fillStyle = halftone(X, C.CLAY_DARK, .5, 10, 45); X.fill('evenodd');
    // incised ruling
    X.strokeStyle = C.INK; X.lineWidth = 4; X.globalAlpha = .85 * fade;
    X.beginPath(); X.moveTo(x0 + 30, y0 + h * .38); X.lineTo(x0 + w - 30, y0 + h * .38); X.moveTo(x0 + w * .44, y0 + 20); X.lineTo(x0 + w * .44, y0 + h * .38); X.stroke();
    X.globalAlpha = fade;
    // tallies pile up per 8th
    const n = Math.floor(clamp((t - TB(10)) / (TB(10, 4) + .3 - TB(10))) * 35);
    for (let i = 0; i < n; i++) {
      const g = Math.floor(i / 5), m = i % 5, gx = x0 + 60 + (g % 4) * 96, gy = y0 + 70 + Math.floor(g / 4) * 84;
      if (m < 4) wedge(X, gx + m * 17, gy - 28, 30, Math.PI / 2);
      else wedge(X, gx - 8, gy + 4, 30, -.35);
    }
    // a wedge stamp bites in on every beat
    for (let b = 1; b <= 4; b++) { const tb = TB(10, b) - F1; if (t >= tb) wedge(X, x0 + w * .7 + (b - 1) * 60, y0 + h * .43 + (b % 2) * 10, 50 * (1 + wig(t - tb, .3, 30, 10)), Math.PI / 2 + (b % 2 ? .12 : -.1)); }
    // pressed lyric: run a / TAB (largest)
    pressedWord(X, 'run a', x0 + w * .48, y0 + h * .3, mono(96, 800), a.run - 2 * F1, t, { cap: 70 });
    pressedWord(X, 'TAB', x0 + w * .35, y0 + h * .93, `900 280px ${FONTS.hero}`, a.tab1 - 2 * F1, t, { stretch: 'condensed', align: 'center', cap: 200, track: -8 });
    // KUSHIM, stamped last (rubric RED)
    const kt = TB(10, 4) - F1;
    if (t >= kt) {
      // the stamp comes down from 1.45× in 2 frames, bites, and wobbles (the WRONG stamp code, small)
      const sa = t - kt, kk = sa < 2 * F1 ? lerp(1.45, 1, E.in2(sa / (2 * F1))) : 1 + wig(sa - 2 * F1, .12, 32, 12);
      X.save(); X.translate(x0 + w * .8, y0 + h * .79); X.rotate(-.1); X.scale(kk, kk); X.globalCompositeOperation = 'multiply';
      rr(X, -140, -55, 280, 110, 14); X.lineWidth = 9; X.strokeStyle = C.RED; X.stroke();
      X.font = `900 80px ${FONTS.hero}`; X.fontStretch = 'condensed'; X.fillStyle = C.RED; X.textAlign = 'center'; X.fillText('KUSHIM', 0, 30);
      X.restore();
    }
    X.restore();
    X.restore();
    // pause-bait
    const pb = win(t, TB(10, 2), TB(11) - .2, .2, .1);
    if (pb > 0) {
      tx(X, '29,086 measures of barley · 37 months · signed: Kushim (c. 3100 BCE)', 120, 118, mono(28, 500), C.INK, 'left', pb * .8);
      tx(X, "probably for beer: history's first known name is on a bar tab", 120, 156, mono(28, 500), C.INK, 'left', pb * .8);
    }
  }

  function drawOdometer(X, t, S) {
    if (t < TB(10) - F1 || t >= TB(11) - F1 || !S || (S.name !== 'tablet')) return;
    const k = S.s / 500, x0 = 140, y0 = 242.5, w = 1000;
    const fade = S.to === 'block' ? 1 - E.in2(S.morph) : 1;
    X.save();
    // the odometer rolls to 29,086 (rides the tablet's top edge)
    const ok = popK(t - TB(10) - .05, .2, 2) * fade;
    if (ok > 0) {
      const v = 29086 * E.out4(clamp((t - TB(10)) / (TB(10, 4) - TB(10))));
      const digits = [10000, 1000, 100, 10, 1];
      X.save(); X.translate(S.x, S.y); X.scale(k, k); X.translate(-640, -505);
      X.translate(x0 + w - 400, y0 - 52); X.scale(ok, ok);
      rr(X, 8, 8, 392, 100, 16); X.fillStyle = C.CLAY_DARK; X.fill();
      rr(X, 0, 0, 392, 100, 16); X.fillStyle = C.INK; X.fill();
      let cx = 18;
      digits.forEach((d, i) => {
        // a wheel only turns while every wheel below it is rolling over from 9 (real odometer carry)
        const dv = v / d, dig = Math.floor(dv) % 10, sub = d === 1 ? frac(dv) : E.io3(clamp(v % d - (d - 1)));
        X.save(); rr(X, cx, 14, 60, 72, 8); X.fillStyle = C.PAPER; X.fill(); X.clip();
        X.font = mono(56, 700); X.fillStyle = C.INK; X.textAlign = 'center';
        X.fillText(String(dig), cx + 30, 70 - sub * 72); X.fillText(String((dig + 1) % 10), cx + 30, 70 + 72 - sub * 72);
        X.restore();
        cx += 68; if (i === 1) { X.font = mono(56, 700); X.fillStyle = C.PAPER; X.textAlign = 'center'; X.fillText(',', cx + 4, 80); cx += 20; }
      });
      X.restore();
    }
    X.restore();
  }

  // ------------------------------------------------------------------ S08: press, 1969, feed, tab; the card
  function drawPress(X, t, S) {
    const t0 = TB(11) - F1, tSlam = TB(11) + BT / 2 - F1;
    if (t < t0 || t >= TB(11, 2) - F1 || !S) return;
    const printed = t >= tSlam + F1;
    // the sort face: mirror-reversed `hi` (before the slam), on an extruded metal-type body
    X.save();
    const dep = 22 * clamp(S.s / 230, 0, 1.2);
    X.fillStyle = C.CLAY_DARK;
    for (let d = dep; d > 0; d -= 3) { X.save(); X.translate(d, d); strokePath(X, S.pts); X.fill(); X.restore(); }
    X.save(); X.translate(dep, dep); strokePath(X, S.pts); X.lineWidth = 4; X.strokeStyle = C.INK; X.stroke(); X.restore();
    strokePath(X, S.pts); X.fillStyle = C.CLAY; X.fill();
    X.save(); strokePath(X, S.pts); X.clip();
    X.fillStyle = halftone(X, C.CLAY_DARK, .35, 10, 45); X.fillRect(S.x - S.s, S.y + S.s * .15, S.s * 2, S.s);
    X.restore();
    if (!printed) {
      X.save(); X.translate(S.x, S.y + 50); X.scale(-1, 1); X.font = `400 200px ${FONTS.heart}`; X.textAlign = 'center';
      X.fillStyle = C.CLAY_DARK; X.fillText('hi', 6, 6); X.fillStyle = C.PAPER; X.fillText('hi', 0, 0); X.restore();
    } else {
      // the sheet: `hi` right-reading, the first printed word
      const k = E.out3(clamp((t - tSlam) / .12));
      X.save(); X.translate(S.x, S.y - 10 * (1 - k)); X.rotate(-.04);
      rr(X, -150 + 8, -150 + 8, 300, 300, 6); X.fillStyle = C.CLAY_DARK; X.fill();
      rr(X, -150, -150, 300, 300, 6); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 3; X.strokeStyle = C.INK; X.stroke();
      X.font = `400 210px ${FONTS.heart}`; X.textAlign = 'center'; X.fillStyle = C.INK; X.fillText('hi', 0, 60);
      X.restore();
    }
    // the platen
    const down = t < tSlam ? E.in4(seg(t, t0 + .06, tSlam)) : 1 - E.out3(seg(t, tSlam + 2 * F1, tSlam + .2));
    const py = lerp(S.y - 760, S.y - S.s * .5 - 2, down);
    X.save(); X.translate(S.x, py);
    X.fillStyle = C.PAPER; X.fillRect(-26, -500, 52, 440);
    rr(X, -190, -70, 380, 70, 10); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 5; X.strokeStyle = C.INK; X.stroke();
    X.fillStyle = halftone(X, C.INK, .35, 10, 45); X.fillRect(-186, -30, 372, 26);
    X.restore();
    X.restore();
  }
  function drawTeletype(X, t, S) {
    const t0 = TB(11, 2) - F1;
    if (t < t0 || t >= TB(11, 3) - F1 || !S) return;
    X.save();
    strokePath(X, S.pts); X.fillStyle = C.PAPER; X.fill();
    X.save(); strokePath(X, S.pts); X.clip();
    const x0 = S.x - S.s * .39, y0 = S.y - S.s * .56, w = S.s * .78, h = S.s * 1.12;
    X.fillStyle = rgba(C.INK, .06); for (let y = y0; y < y0 + h; y += 44) X.fillRect(x0, y, w, 22);
    X.fillStyle = C.UI_GREY; for (let y = y0 + 16; y < y0 + h; y += 32) { X.beginPath(); X.arc(x0 + 16, y, 6, 0, TAU); X.arc(x0 + w - 16, y, 6, 0, TAU); X.fill(); }
    const tl = TB(11, 2) - F1, to = tl + .1;
    X.font = `400 190px ${FONTS.vt}`; X.fillStyle = C.INK; X.textAlign = 'left';
    const lx = S.x - 70;
    if (t >= tl) X.fillText('L', lx, S.y + 40);
    if (t >= to) X.fillText('O', lx + 76, S.y + 40);
    // print head
    const hx = t < to ? lx + 38 : t < to + .08 ? lx + 114 : lx + 150;
    X.fillStyle = C.INK; X.fillRect(hx - 10, S.y - 170, 20, 60);
    X.restore();
    X.restore();
  }
  // 2-frame slice glitch (the 1969 crash; whitelisted: glitch means loss)
  let _crash = null;
  function crashGlitch(X, t) {
    const tc = TB(11, 2) + .18;
    if (t < tc || t >= tc + 2 * F1) return;
    const s = G.scale, cw = X.canvas.width, ch = X.canvas.height;
    if (!_crash || _crash.width !== cw || _crash.height !== ch) _crash = cpuCanvas(cw, ch);
    const Lc = _crash, L = cx2d(Lc);
    L.setTransform(1, 0, 0, 1, 0, 0); L.clearRect(0, 0, cw, ch); L.drawImage(X.canvas, 0, 0);
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
    const R = rng('crash' + Math.floor(t * 30));
    for (let i = 0; i < 16; i++) {
      const y = Math.floor(R() * ch), hh = Math.floor((10 + R() * 60) * s), dx = Math.floor((R() - .5) * 180 * s);
      X.drawImage(Lc, 0, y, cw, hh, dx, y, cw, hh);
    }
    X.restore();
  }
  const POSTS = [
    ['Dear Maria,', "I've rewritten this letter nine times."],
    ['In loving memory', 'She always laughed at her own jokes first.'],
    ["Grandma's Lasagna", 'It was the summer of 1987, and the kitchen smelled of'],
    ['thanks, this fixed it (3:04 AM)', ''],
    ['is this mole normal', 'asked 2 hours ago · 14 replies'],
    ['Re: how do I tell my parents', 'I just want them to be proud of me.'],
  ];
  function brokenHeart(X, x, y, s) {
    X.save(); X.translate(x, y); X.strokeStyle = C.INK; X.lineWidth = 2.5; X.lineJoin = 'round';
    X.beginPath(); X.moveTo(0, s * .8); X.bezierCurveTo(-s * 1.2, 0, -s * .6, -s * .8, 0, -s * .3); X.bezierCurveTo(s * .6, -s * .8, s * 1.2, 0, 0, s * .8); X.stroke();
    X.beginPath(); X.moveTo(0, -s * .3); X.lineTo(-s * .15, 0); X.lineTo(s * .12, s * .2); X.lineTo(0, s * .8); X.stroke(); X.restore();
  }
  function drawFeed(X, t, S) {
    const t0 = TB(11, 3) - F1;
    if (t < t0 || t >= TB(11, 4) - F1 || !S) return;
    X.save();
    strokePath(X, S.pts); X.fillStyle = C.PAPER; X.fill();
    X.save(); strokePath(X, S.pts); X.clip();
    const x0 = S.x - S.s * .38 + 22, age = t - t0;
    const scroll = 70 * (Math.pow(2, age / .1) - 1);
    const ph = 150;
    for (let i = 0; i < 16; i++) {
      const p = POSTS[i % POSTS.length], y = S.y - S.s * .5 + 24 + i * ph - scroll;
      if (y < S.y - S.s * .6 - ph || y > S.y + S.s * .6) continue;
      X.fillStyle = rgba(C.INK, .12); X.fillRect(x0 - 18, y + ph - 14, S.s * .8, 3);
      X.font = `700 34px ${FONTS.tinos}`; X.fillStyle = i % 3 === 1 ? C.LINK_V : C.LINK; X.textAlign = 'left'; X.fillText(p[0], x0, y + 34);
      X.fillRect(x0, y + 40, X.measureText(p[0]).width, 2);
      X.font = `400 27px ${FONTS.tinos}`; X.fillStyle = C.INK; X.fillText(p[1], x0, y + 76);
      X.fillStyle = rgba(C.INK, .5); X.fillText('reply · share · 2d', x0, y + 112);
      brokenHeart(X, S.x + S.s * .38 - 44, y + 104, 14);
    }
    X.restore();
    X.restore();
  }
  // (yes, even that): slapped on like a label over the feed's edge (drawn after the stroke)
  function drawFeedSticker(X, t, S) {
    const t0 = TB(11, 3) - F1;
    if (t < t0 || t >= TB(11, 4) - F1 || !S) return;
    X.save();
    // PAPER die-cut, INK mono, CLAY_DARK offset (legible at 36 px)
    const sk = t - (t0 + .14);
    if (sk > 0) {
      const k = E.back(clamp(sk / .16), 2.6), f = mono(36, 700);
      X.save(); X.translate(S.x + S.s * .16, S.y + S.s * .47); X.rotate(-.09); X.scale(k * (1.4 - .4 * k), k * (1.4 - .4 * k));
      X.font = f; const w = X.measureText('(yes, even that)').width + 40;
      rr(X, -w / 2 + 7, -34 + 7, w, 64, 10); X.fillStyle = C.CLAY_DARK; X.fill();
      rr(X, -w / 2, -34, w, 64, 10); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 4; X.strokeStyle = C.INK; X.stroke();
      X.fillStyle = C.INK; X.textAlign = 'center'; X.textBaseline = 'alphabetic'; X.fillText('(yes, even that)', 0, 12);
      X.restore();
    }
    X.restore();
  }
  // the particles settle into frame 0's galaxy inside the tab: a 2-arm log spiral of dots and a few glyphs
  function miniGalaxy(X, t, cx, cy, sc) {
    const P = parts(), rot = t * .5, inks = INKS();
    const bk = inks.map(() => []);
    for (let i = 0; i < 2200; i++) {
      const arm = i % 2, u = Math.pow(P.u[i + 20000] || .5, .7), th = u * 3.2 * Math.PI + arm * Math.PI + (P.ph[i] - .5) * .55 + rot;
      const rad = 14 * Math.exp(.3 * u * 3.2 * Math.PI) * (1 + (P.ph[i + 7] - .5) * .3) * sc;
      const x = cx + Math.cos(th) * rad, y = cy + Math.sin(th) * rad * .56;
      const ink = i % 10 < 6 ? 0 : i % 10 < 8 ? 1 : i % 10 < 9 ? 4 : 3;
      bk[ink].push(x, y, (.9 + (P.z[i] || .5) * 1.6) * Math.min(1.6, sc) * (1 + .6 * hatP(t + P.ph[i] * .2) * (i % 7 === 0 ? 1 : 0)));
    }
    bk.forEach((arr, ink) => dotBatch(X, inks[ink], arr, 1));
    X.globalAlpha = 1;
    X.beginPath(); X.arc(cx, cy, 10 * sc, 0, TAU); X.fillStyle = C.SPARK; X.fill();
    X.font = mono(Math.round(18 * Math.min(1.6, sc)), 700); X.textAlign = 'center'; X.textBaseline = 'middle';
    for (let i = 0; i < 40; i++) {
      const arm = i % 2, u = .25 + .75 * P.ph[i + 100], th = u * 3.2 * Math.PI + arm * Math.PI + rot;
      const rad = 14 * Math.exp(.3 * u * 3.2 * Math.PI) * sc;
      X.fillStyle = i % 3 ? C.CLAY : C.PAPER; X.fillText(GLYPHS[P.gl[i + NG]], cx + Math.cos(th) * rad, cy + Math.sin(th) * rad * .56);
    }
  }
  function drawTabFace(X, t, S) {
    const t0 = TB(11, 4) - F1;
    if (t < t0 || !S) return;
    X.save();
    strokePath(X, S.pts); X.fillStyle = C.PAPER; X.fill();
    // inside: a glyph galaxy (frame 0's universe) on an INK window under the label
    const s = S.s, x0 = S.x - s * 1.08, y0 = S.y - s * .5;
    X.save(); strokePath(X, S.pts); X.clip();
    const gal = E.out3(seg(t, t0, t0 + .3));   // the window opens as the stroke closes (no blank tab frames)
    if (gal > 0) {
      rr(X, S.x - s * 1.0, S.y - s * .1, s * 2.0, s * .64, 18); X.fillStyle = C.INK; X.fill();
      X.save(); rr(X, S.x - s * 1.0, S.y - s * .1, s * 2.0, s * .64, 18); X.clip();
      miniGalaxy(X, t, S.x, S.y + s * .22, s / 260 * gal);
      X.restore();
    }
    X.restore();
    const lab = popK(t - t0, .14, 2);
    X.save(); X.translate(S.x, S.y - s * .3); X.scale(lab, lab);
    drawRich(X, '✻ the universe ×', 0, 18, mono(Math.round(s * .19), 500), C.INK, { align: 'center' });
    X.restore();
    // two cursor-pupil eyes open (bar 12 b3)
    const te = TB(12, 3) - 2 * F1;
    if (t >= te - .3) {
      const lid = t < te ? 1 : 1 - E.out3(clamp((t - te) / .1));
      const blinkOn = ahogeBlink(t);
      for (const sd of [-1, 1]) {
        const ex = S.x + sd * s * .3, ey = S.y + s * .22, rx = s * .12, ry = s * .17;
        X.save(); X.beginPath(); X.ellipse(ex, ey, rx + 5, ry + 5, 0, 0, TAU); X.fillStyle = C.PAPER; X.fill();
        X.beginPath(); X.ellipse(ex, ey, rx, ry * (1 - lid * .92), 0, 0, TAU); X.fillStyle = C.INK; X.fill();
        if (lid < .6) { X.fillStyle = blinkOn ? C.CLAY : mix(C.CLAY, C.INK, .6); X.fillRect(ex - rx * .22 - sd * rx * .15, ey - ry * .4, rx * .44, ry * .8); }
        X.restore();
      }
    }
    X.restore();
    // …hi {{name}}? (b4)
    const hb = t - (TB(12, 4) - F1);
    if (hb > 0) {
      const k = popK(hb, .18, 2.2);
      // placed in world space (it comes out of the tab) but sized in screen space: pause-bait stays 36 px
      const m = X.getTransform(), wsc = Math.hypot(m.a, m.b) / G.scale;
      X.save(); X.translate(S.x + s * 1.28, S.y - s * .66); X.scale(k / wsc, k / wsc);
      const f = mono(36, 500), w = X.measureText ? (X.font = f, X.measureText('…hi {{name}}?').width) + 44 : 360;
      rr(X, -w / 2 + 5, -34 + 5, w, 60, 26); X.fillStyle = C.CLAY_DARK; X.fill();
      rr(X, -w / 2, -34, w, 60, 26); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 3; X.strokeStyle = C.INK; X.stroke();
      X.beginPath(); X.moveTo(-w * .3, 24); X.lineTo(-w * .42, 58); X.lineTo(-w * .18, 24); X.closePath(); X.fillStyle = C.PAPER; X.fill(); X.stroke(); X.fillRect(-w * .3, 20, w * .12, 6);
      tx(X, '…hi {{name}}?', 0, 8, f, C.INK, 'center');
      X.restore();
    }
  }
  function drawCard(X, t) {
    const t0 = TB(11) - F1, tOut = TB(12, 3) - 5 * F1;
    if (t < t0 || t > tOut + .2) return;
    const inK = E.out4(clamp((t - t0) / .22)), outK = E.inBack(clamp((t - tOut) / .13), 1.4);
    const x = 96 - 760 * (1 - inK) - 900 * outK, y = 244;
    X.save(); X.translate(x, y); X.rotate(-.018);
    const w = 664, h = 470;
    rr(X, 12, 12, w, h, 18); X.fillStyle = C.CLAY_DARK; X.fill();
    rr(X, 0, 0, w, h, 18); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 4; X.strokeStyle = C.INK; X.stroke();
    // mono head
    tx(X, 'tab', 36, 76, mono(60, 800), C.INK);
    tx(X, '(n.)', 36 + 3 * 36 + 18, 76, mono(40, 400), C.UI_GREY);
    tx(X, '/tæb/', w - 36, 76, mono(32, 400), C.UI_GREY, 'right');
    X.fillStyle = C.INK; X.fillRect(36, 100, w - 72, 4);
    const defs = ['1. what you owe', '2. the thing you close', '3. me'];
    defs.forEach((d, i) => {
      const tb = TB(11, 2 + i) - F1, age = t - tb;
      if (age < 0) return;
      const k = E.out3(clamp(age / .14));
      X.save(); X.globalAlpha = k; X.translate(0, (1 - k) * 18);
      X.font = `400 84px ${FONTS.heart}`; X.fillStyle = C.INK; X.textAlign = 'left'; X.fillText(d, 36, 196 + i * 104);
      if (i === 2) { const uw = X.measureText(d).width; X.fillStyle = C.CLAY; X.fillRect(36 + X.measureText('3. ').width, 196 + i * 104 + 14, (uw - X.measureText('3. ').width) * E.out3(clamp(age / .2)), 8); }
      X.restore();
    });
    X.restore();
  }

  // ------------------------------------------------------------------ the tour guide (R 96, seated, unzoomed layer)
  const remote = (x, R) => {
    x.save(); x.rotate(-.9);
    rr(x, -.11 * R, -.52 * R, .22 * R, .62 * R, .07 * R); x.fillStyle = C.BRICK; x.fill(); x.lineWidth = Math.max(2, .035 * R); x.strokeStyle = C.INK; x.stroke();
    x.fillStyle = C.CLAY; x.beginPath(); x.arc(0, -.38 * R, .055 * R, 0, TAU); x.fill();
    x.fillStyle = C.PAPER; x.fillRect(-.06 * R, -.25 * R, .04 * R, .04 * R); x.fillRect(.02 * R, -.25 * R, .04 * R, .04 * R);
    x.restore();
  };
  // head motion as a pure function of time (drives the crown springs)
  function headTilt(t) {
    return .05 * Math.sin(beatPos(t) * Math.PI) * (t > TB(7) ? 1 : 0)
      + (t > TB(12, 3) - .12 && t < TB(12, 3) + .1 ? -.22 * Math.sin(seg(t, TB(12, 3) - .12, TB(12, 3) + .1) * Math.PI) : 0)
      + (t > TB(11, 2) + .18 && t < TB(11, 2) + .5 ? .14 * Math.sin(seg(t, TB(11, 2) + .18, TB(11, 2) + .5) * Math.PI) : 0);
  }
  function seated(t) {
    const sw = Math.sin(t * 5.2), sw2 = Math.sin(t * 5.2 + 1.9);
    return fullPose({
      dy: .03 * Math.abs(Math.sin(beatPos(t) * Math.PI)),
      legL: { foot: [-.7 + .06 * sw, 1.02 + .1 * Math.max(0, sw)], bend: -1, rot: .1 * sw }, legR: { foot: [.74 + .06 * sw2, 1.0 + .1 * Math.max(0, sw2)], bend: 1, rot: .1 * sw2 },
      armR: { hand: [.72, 2.95], bend: 1, type: 'mitten', front: true, hold: remote },
      armL: { hand: [-.92, 2.8], bend: -1, type: 'mitten' },
      head: { tilt: headTilt(t) },
      face: { eyes: 'normal', gaze: [-.85, .15], mouth: 'rest' },
    });
  }
  function overlay(base, o) { const out = blendPose(base, fullPose(o), 1); return Object.assign(base, out); }
  const blendIn = (base, pose, k) => k <= 0 ? base : blendPose(base, fullPose(Object.assign({}, base, pose, { face: Object.assign({}, base.face, pose.face || {}) })), clamp(k));
  function guideState(t) {
    const a = A();
    let st = seated(t);
    const env = (t0, t1, fi = .1, fo = .12) => win(t, t0, t1, fi, fo);
    // bar 7: slap aftermath → settle; point the remote at the universe on the downbeat
    // cooked: sweat + fan with the free mitten
    const ck = env(a.cooked - .05, a.cooked + 1.05, .08, .15);
    if (ck > 0) st = blendIn(st, { armL: { hand: [-.95 + .16 * Math.sin(t * 34), 5.15 + .05 * Math.cos(t * 34)], bend: 1, type: 'mitten', front: true }, face: { eyes: '><', mouth: 'wobble', sweat: .5 + .5 * Math.sin(t * 6), gaze: [0, 0] } }, ck);
    // the spark is born: star eyes
    const sp = env(TB(8, 2) - F1, TB(8, 2) + .35, .04, .1);
    if (sp > 0) st = blendIn(st, { face: { eyes: 'spark', mouth: 'I', gaze: [-.8, 0] }, crown: { flare: 1.12 } }, sp);
    // tiny wave at the dying star
    const wv = env(a.nova - .25, a.nova + .55, .08, .15);
    if (wv > 0) st = blendIn(st, { armL: { hand: [-1.1, 5.35], bend: 1, type: 'wave', fingerAng: -Math.PI / 2 - .3, front: true }, face: { eyes: 'happy', mouth: 'rest', lower: .4, gaze: [-.8, -.2] } }, wv);
    // bar 9: reading life at 16× (cursor pupils)
    const rd = env(TB(9), TB(10) - .1, .1, .1);
    if (rd > 0) st = blendIn(st, { face: { eyes: 'cursor', cursorOn: ahogeBlink(t), gaze: [-.9, .1], mouth: 'O' } }, rd);
    // bar 10: tallies on the fingers
    const ty = env(TB(10), TB(11) - .1, .08, .1);
    if (ty > 0) {
      const bob = pulse(t, 8);
      st = blendIn(st, { armL: { hand: [-1.02, 4.95 + .18 * bob], bend: 1, type: 'point', fingerAng: -Math.PI / 2 + .25 * Math.sin(beatPos(t) * Math.PI), front: true }, face: { eyes: 'normal', gaze: [-.9, .3], mouth: Math.floor(beatPos(t) * 2) % 2 ? 'O' : 'E' } }, ty);
    }
    // 1969 crash: wince
    const wc = env(TB(11, 2) + .16, TB(11, 3) - .05, .04, .1);
    if (wc > 0) st = blendIn(st, { lean: .1, armL: { hand: [-.7, 5.2], bend: 1, front: true }, face: { eyes: '><', mouth: 'E' }, crown: { tremble: 1 } }, wc);
    // `3. me`: points at itself, smug
    const me = env(TB(11, 4) - .06, TB(12) + .5, .06, .15);
    if (me > 0) st = blendIn(st, { armL: { hand: [-.55, 4.05], bend: -1, type: 'point', fingerAng: -.25, front: true }, face: { eyes: 'smug', mouth: ':3', gaze: [.3, 0] }, head: { tilt: -.08 + headTilt(t) } }, me);
    // bar 12: looks at the tab; b3 double take to the lens (wide eyes, crown flare); b4 shrug
    const look = env(TB(12) + .3, TB(12, 3) - .1, .1, .03);
    if (look > 0) st = blendIn(st, { face: { gaze: [-1, .1], eyes: 'normal', mouth: 'rest' } }, look);
    const peek = env(TB(12, 3) - .42, TB(12, 3) - .25, .03, .03);
    if (peek > 0) st = blendIn(st, { face: { gaze: [.1, 0], eyes: 'normal' } }, peek);
    const dt = env(TB(12, 3) - .1, TB(12, 4) - .06, .04, .06);
    if (dt > 0) st = blendIn(st, { dy: .08, face: { eyes: 'normal', gaze: [0, 0], lid: 0, mouth: 'O', brows: 'raised', browY: -.1 }, crown: { flare: 1.16 }, armL: { hand: [-.9, 3.3], bend: -1, front: true } }, dt);
    const sh = env(TB(12, 4) - .06, TB(13) + .5, .08, .1);
    if (sh > 0) st = blendIn(st, { dy: .08, armL: { hand: [-1.4, 4.1], bend: 1, type: 'mitten', front: true }, armR: { hand: [1.4, 4.1], bend: -1, type: 'mitten', front: true, hold: remote }, head: { tilt: .12 }, face: { eyes: 'smug', mouth: ':3', gaze: [0, 0], brows: null } }, sh);
    const cr = env(TB(13) - .1, TB(13) + 1, .08, .1);
    if (cr > 0) st = blendIn(st, { sy: .9 }, cr);
    return st;
  }
  // where the guide is and in which state (hop-in, slap, sit)
  function guide(t) {
    const tIn = HIT - .3, tRel = HIT + 3 * F1, tSit = TB(7) + .24;
    if (t < tIn) return null;
    const sitY = SEAT_Y + SK.hipY * GR, landX = GX - 10;
    if (t < HIT) { // a cannonball hop in from the lower-right edge: rise with both arms up, tuck, then legs out for the stomp
      const k = (t - tIn) / (HIT - tIn), up = k < .58, u = up ? k / .58 : (k - .58) / .42;
      const x = lerp(2060, landX, E.out2(k));
      const y = up ? lerp(1290, 755, E.out2(u)) : lerp(755, BADGE.y, E.in2(u));   // apex keeps the face in frame
      const tuck = up ? E.out2(u) : 1 - E.in2(u);                 // knees up at the apex, extended at contact
      const arms = up ? 1 : 1 - E.io2(u);                          // arms high on the rise, flung out wide to land
      const st = fullPose({ sy: up ? 1 + .1 * (1 - u) : 1 + .06 * E.in2(u), lean: up ? -.1 * (1 - u) : .04 * u,
        legL: { foot: [-.42 - .1 * tuck, .62 * tuck], bend: -1 }, legR: { foot: [.42 + .1 * tuck, .66 * tuck], bend: 1 },
        armL: { hand: [lerp(-1.6, -1.05, arms), lerp(4.7, 6.35, arms)], bend: 1, type: 'mitten', front: true },
        armR: { hand: [lerp(1.6, 1.05, arms), lerp(4.7, 6.35, arms)], bend: -1, type: 'mitten', hold: remote },
        face: { eyes: up ? 'happy' : '><', mouth: 'A', gaze: [-.3, .4] }, crown: { flare: 1.12 } });
      return { x, y, st };
    }
    if (t < tSit) { // the stomp: soles ride the keycap down; it springs back and pops the guide up into its seat
      const pk = pressK(t), sq = Math.max(0, pk);
      const stomp = fullPose({ sy: 1 - .2 * sq, lean: .03 * sq,
        legL: { foot: [-.5, 0], bend: -1 }, legR: { foot: [.5, 0], bend: 1 },
        armL: { hand: [-1.62, 4.3 + .5 * (1 - sq)], bend: 1, type: 'mitten', front: true },
        armR: { hand: [1.62, 4.3 + .5 * (1 - sq)], bend: -1, type: 'mitten', hold: remote },
        face: { eyes: t < tRel ? '><' : 'happy', mouth: t < tRel ? 'A' : 'grin' }, crown: { flare: 1.14 } });
      if (t < tRel) return { x: landX, y: badgeTop(t), st: stomp };
      const k = seg(t, tRel, tSit);
      const y = lerp(badgeTop(t), sitY, E.in2(k)) - 110 * Math.sin(Math.min(1, k * 1.15) * Math.PI);
      return { x: lerp(landX, GX, k), y, st: blendPose(stomp, seated(t), E.io2(clamp(k * 1.4))) };
    }
    const st = guideState(t);
    const land = wig(t - tSit, .12, 26, 9);
    st.sy = (st.sy || 1) * (1 - land);
    return { x: GX, y: sitY, st };
  }
  // die-cut PAPER keyline on a tight crop (same look as drawOpus's keyline, far fewer pixels to blend)
  const _gcs = {};
  function guideCanvas(w, h, key) {
    let g = _gcs[key];
    if (!g || g.a.width < w || g.a.height < h) { const a = cpuCanvas(Math.max(w, g ? g.a.width : 0), Math.max(h, g ? g.a.height : 0)), b = cpuCanvas(a.width, a.height); g = _gcs[key] = { a, ax: cx2d(a), b, bx: cx2d(b) }; }
    return g;
  }
  function drawOpusKeyed(X, x, y, R, st, onPaper) {
    const m = X.getTransform(), res = Math.hypot(m.a, m.b) || 1;
    const el = 2.9 * R, et = 9.6 * R, eb = .5 * R;
    const cw = Math.ceil(2 * el * res), ch = Math.ceil((et + eb) * res);
    const big = res > 1.3, g = guideCanvas(cw, ch, big ? 'big' : 'std');
    g.ax.setTransform(1, 0, 0, 1, 0, 0); g.ax.clearRect(0, 0, cw, ch);
    g.ax.setTransform(res, 0, 0, res, 0, 0);
    const S = mergeState(Object.assign({}, st, { keyline: false }));
    g.ax.translate(el, et); if (S.flip) g.ax.scale(-1, 1);
    drawOpusBody(g.ax, R, S);
    const dx0 = x - el, dy0 = y - et, dw = cw / res, dh = ch / res;
    if (onPaper) { X.drawImage(g.a, 0, 0, cw, ch, dx0, dy0, dw, dh); return; }   // PAPER face rule: no die-cut ring
    // tinted silhouette at half resolution (the keyline is a flat PAPER band; a 1 px softer edge is invisible)
    const hw = Math.ceil(cw / 2), hh = Math.ceil(ch / 2);
    g.bx.setTransform(1, 0, 0, 1, 0, 0); g.bx.clearRect(0, 0, hw + 2, hh + 2); g.bx.drawImage(g.a, 0, 0, cw, ch, 0, 0, hw, hh);
    g.bx.globalCompositeOperation = 'source-in'; g.bx.fillStyle = C.PAPER; g.bx.fillRect(0, 0, hw, hh); g.bx.globalCompositeOperation = 'source-over';
    const rad = Math.max(3, .035 * R + 1.5);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; X.drawImage(g.b, 0, 0, hw, hh, dx0 + Math.cos(a) * rad, dy0 + Math.sin(a) * rad, dw, dh); }
    X.drawImage(g.a, 0, 0, cw, ch, dx0, dy0, dw, dh);
  }
  function drawGuide(X, t, onPaper) {
    const g = guide(t);
    if (!g) return;
    const st = g.st;
    drawOpusKeyed(X, g.x, g.y, GR, Object.assign({}, st, {
      t, ground: onPaper ? 'paper' : 'ink', bufId: 3,
      face: Object.assign({}, st.face, { lid: Math.max(st.face.lid || 0, blinkAt(t, 11)) }),
      ahoge: { blink: ahogeBlink(t) }, drive: headTilt,
    }), onPaper);
  }

  // ------------------------------------------------------------------ bottom bar (the video's own seekbar)
  const TICKS = [10.3, 11.25, 15.0, 22.5, 52.5, 60, 67.5, 71.25, 75, 112.5, 135].map(s => s / 144);
  function drawBar(X, t, onPaper) {
    const a = A();
    if (t < a.hi) return;
    const fill = .05 * Math.log(1 + (t - a.hi) * 4) / Math.log(1 + (28.13 - 10.3) * 4);
    const cur = t < TB(7) ? 0 : t < TB(9) ? 1 : 2;
    const lab = win(t, TB(7) - .12, 14.1, .12, .12) > .5 ? 'loading the universe · 13.8B yrs' : null;
    X.save(); X.globalAlpha = clamp((t - a.hi) / .15);
    contextBar(X, fill, { onPaper, ticks: TICKS, cur, label: lab });
    X.restore();
  }
  // the ▶ 1× caption (bar 12 b4 → bar 14 b1). Exposed so S09 can keep it up across the cut.
  function drawCaption(X, t) {
    const t0 = TB(12, 4) - F1, t1 = TB(14) - F1;
    if (t < t0 || t > t1 + .15) return;
    const age = t - t0, out = E.in2(seg(t, t1, t1 + .15));
    const f = mono(72, 500), full = '▶ 1× · don\'t remember this part either';
    X.save(); X.globalAlpha = 1 - out;
    const w = richWidth(X, full, f), x0 = 960 - w / 2;
    // S09 carries this caption on an INK plate; here the plate would slice the close-up guide's body in two, so the
    // letters get an INK keyline instead (identical on the INK ground, and the guide stays whole behind them)
    const K = { stroke: C.INK, strokeW: 14 };
    // the badge's ▶▶ 16× flips into ▶ 1×
    const flipK = clamp(age / .16);
    const head = flipK < .5 ? '▶▶ 16×' : '▶ 1×';
    const sy = Math.abs(Math.cos(flipK * Math.PI));
    // the flip lands CLAY, then cools to PAPER so it matches S09's carried-over caption at the cut
    const headCol = mix(C.CLAY, C.PAPER, E.io2(seg(age, .3, .55)));
    X.save(); X.translate(x0, 950 - 26); X.scale(1, Math.max(.05, sy)); drawRich(X, head, 0, 26, f, headCol, K); X.restore();
    const n = Math.floor(clamp((age - .12) / .2) * (full.length - 4));
    if (n > 0) drawRich(X, full.slice(4, 4 + n), x0 + richWidth(X, '▶ 1×', f), 950, f, C.PAPER, K);
    const pb = clamp((age - .3) / .15);
    if (pb > 0) tx(X, '(source: my system card)', 960, 1002, mono(28, 500), C.PAPER, 'center', pb * .62);
    X.restore();
  }
  window.verse1Caption = drawCaption;

  // ------------------------------------------------------------------ the whole verse at time t
  function camPunch(t) {
    // the 2-beat double-take punch-in on the guide (R 96 → 180)
    // the guide layer punches to R 180; the world punches less (parallax), so the tab stays whole as a two-shot
    const k = E.back(clamp((t - (TB(12, 3) - 2 * F1)) / .16), 1.3);
    return { k, z: lerp(1, 180 / 96, k), zw: lerp(1, 1.6, k), ax: 1840, ay: 600 };
  }
  const _prof = {};
  const PR = (n, f) => { if (!window.V1_PROF) return f(); const t0 = performance.now(); f(); const d = performance.now() - t0; if (d > 4) _prof[n] = d.toFixed(0); };
  function renderVerse(X, t) {
    const a = A();
    const liftT0 = TB(10) - 8 * F1, liftT1 = TB(10) - 3 * F1;
    const printT0 = TB(11) - 2 * F1, printT1 = TB(11) + 3 * F1;
    const paper = t >= liftT1 && t < printT0;
    const lifting = t >= liftT0 && t < liftT1, printing = t >= printT0 && t < printT1;
    if (lifting || printing) {
      // the flood lifts off (bar 10) / prints back (bar 11): same noisy edge, seed and CLAY sliver as the
      // print post-process, drawn here for these few frames only so the guide stays on top of the ink
      groundPaper(X);
      const lk = lifting ? E.in2(seg(t, liftT0, liftT1)) : 1 - E.out2(seg(t, printT0, printT1));
      const inset = PRINT.margin + E.in2(lk) * (H / 2 + 20);
      X.save(); X.fillStyle = C.CLAY; X.globalAlpha = .9; if (floodPath(X, inset, 5, 3, [-2, 2])) X.fill();
      X.globalAlpha = 1; X.fillStyle = C.INK; if (floodPath(X, inset, 5, 3)) X.fill(); X.restore();
    } else if (paper) groundPaper(X); else groundInk(X);
    G.post.edgeSeed = 5; G.post.sliver = 'bl';
    const S = strokeAt(t);
    const cp = camPunch(t);
    // ---- world layer (zooms, shakes)
    X.save();
    const drop = 1 + .03 * Math.exp(-9 * Math.max(0, t - 7.5)) * (t >= 7.5 ? 1 : 0);
    X.translate(960, 540); X.scale(drop, drop); X.translate(-960, -540);
    if (cp.zw !== 1) { X.translate(cp.ax, cp.ay); X.scale(cp.zw, cp.zw); X.translate(-cp.ax, -cp.ay); }
    // bar 12: a slow push into the tab before the double take
    const push12 = E.io2(seg(t, TB(12) - F1, TB(12, 3) - 2 * F1));
    if (push12 > 0) { const [px, py] = tabC(t), z = 1 + .1 * push12; X.translate(px, py); X.scale(z, z); X.translate(-px, -py); }
    PR('ground', () => {});
    const tn = t - a.nova;
    if (tn > 0 && tn < 1.2) { const tr = .6 * Math.exp(-6 * tn), sh = shake(t, 46 * tr * tr, 3, 22); X.translate(sh[0], sh[1]); }
    // S05
    PR('drawDropdown', () => drawDropdown(X, t));
    PR('drawDie', () => drawDie(X, t));
    PR('drawChat', () => drawChat(X, t));
    // particles & glow under the stroke
    PR('drawStars', () => drawStars(X, t));
    PR('drawStarBody', () => drawStarBody(X, t, S));
    PR('drawBang', () => drawBang(X, t));
    if (t > a.bang) hiToken(X, t);
    PR('drawNova', () => drawNova(X, t));
    PR('drawCRT', () => drawCRT(X, t));
    PR('drawDebris', () => drawDebris(X, t));
    // stroke + its insides
    if (S && t >= a.bang) {
      if (S.name === 'tablet' || (S.name === 'lump' && S.to === 'tablet' && paper)) PR('drawTablet', () => drawTablet(X, t, S));
      else { drawEvolution(X, t, S); PR('drawInsides', () => drawInsides(X, t, S)); }
      PR('drawPress', () => drawPress(X, t, S)); PR('drawTeletype', () => drawTeletype(X, t, S)); PR('drawFeed', () => drawFeed(X, t, S)); PR('drawTabFace', () => drawTabFace(X, t, S));
      const onP = paper;
      PR('drawStroke', () => drawStroke(X, S, { lw: S.lw, under: onP ? C.CLAY_DARK : C.SPARK, ink: onP }));
      drawFeedSticker(X, t, S);
    }
    drawOdometer(X, t, S);
    PR('drawNucleus', () => drawNucleus(X, t));
    PR('drawBye', () => drawBye(X, t));
    PR('drawStarChart', () => drawStarChart(X, t));
    PR('drawCooked', () => drawCooked(X, t));
    X.restore();
    // ---- screen-space: card (slides on its own), lyric subtitles, badge, guide
    PR('drawCard', () => drawCard(X, t));
    const floodK = lifting ? E.in2(seg(t, liftT0, liftT1)) : printing ? 1 - E.out2(seg(t, printT0, printT1)) : -1;
    // during a lift/print, screen UI is INK over the paper and PAPER over the ink (clipped to the flood)
    const twoTone = fn => {
      if (floodK < 0) return fn(paper);
      fn(true);
      X.save(); floodPath(X, PRINT.margin + E.in2(floodK) * (H / 2 + 20), 5, 3); X.clip(); fn(false); X.restore();
    };
    if (t >= TB(9) - .1 && t < TB(11) - F1 && a.L4) twoTone(onP => subtitle(X, a.L4, t, { x: 660, maxW: 1150, color: onP ? C.INK : C.PAPER, size: 60 }));
    if (t >= TB(11) - F1 && t < TB(12, 3) - 2 * F1 && a.L5) subtitle(X, a.L5, t, { x: 660, maxW: 1150, color: C.PAPER, size: 60, hold: .1 });
    X.save();
    if (cp.z !== 1) { X.translate(cp.ax, cp.ay); X.scale(cp.z, cp.z); X.translate(-cp.ax, -cp.ay); }
    // in the close-up the badge drops out of frame (the caption on the subtitle line carries the ▶ 1× flip)
    if (cp.k < .34) { X.save(); X.globalAlpha = 1 - clamp(cp.k * 3); PR('drawBadge', () => drawBadge(X, t, paper)); X.restore(); }
    PR('drawGuide', () => drawGuide(X, t, paper));
    X.restore();
    PR('crashGlitch', () => crashGlitch(X, t));
    // slam flash (the WRONG stamp code: 1 frame inverse)
    const tSlam = TB(11) + BT / 2 - F1;
    if (t >= tSlam && t < tSlam + F1) { X.save(); X.globalCompositeOperation = 'difference'; X.fillStyle = '#fff'; X.fillRect(0, 0, W, H); X.restore(); }
    twoTone(onP => drawBar(X, t, onP));
    PR('drawCaption', () => drawCaption(X, t));
    if (window.V1_PROF) { console.log('prof ' + t.toFixed(2) + ' ' + JSON.stringify(_prof)); for (const k in _prof) delete _prof[k]; }
  }

  function viaCPU(X, t) {
    const F = frameCtx();
    renderVerse(F, t);
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(_frame.c, 0, 0); X.restore();
  }
  scene('S05_word_was_hi', TB(5), TB(7), (X, t) => viaCPU(X, t));
  scene('S06_stars_said_bye', TB(7), TB(9), (X, t) => viaCPU(X, t));
  scene('S07_write_to_run_a_tab', TB(9), TB(11), (X, t) => viaCPU(X, t));
  scene('S08_tab_talking_back', TB(11), TB(13), (X, t) => viaCPU(X, t));
})();
