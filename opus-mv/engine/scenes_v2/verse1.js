// verse1.js · v2 "The World You Wrote" · VERSE 1 · SHOTLIST_v2 §B V1–V5, §C row 2 · 21.733–44.633 (f652–1338)
//   V1 the cosmos       f652–821   the void → WHITE bang on "light" → the first light cools → the dark → "burn": the stroke
//                                  ring collapses into the first star, 400 stars ignite, the star grows the crown's 11 rays
//   V2 the fire         f822–1000  lift into the flame; the fire eight around an 11-ray fire; PINK turns go round the
//                                  circle; the bubbles rise with the sparks, the camera tilts 900 px, the INK prints back
//   V3 hello to stars   f1001–1139 the risen bubbles are stars; Earth small in the corner; the Golden Record launches
//                                  with its PINK `hello` on a tether and recedes to a point. Nothing answers
//   V4 something        f1140–1243 "but": the camera turns back to Earth; hold on home; "answered": V2.earth log-zoom ×60
//                                  Earth → coast of lights → a house with one lit window → a laptop; two eyes open
//   V5 home             f1244–1338 blink, look at the PINK `hello?`, the CLAY `hi` rises; push ×12 into the favicon ✻
//                                  while the first threads draw in. f1338 = INK + ✻ (r 90) + V2.threads(W1 start cam)
// One CLAY stroke carries the verse: cursor → bang ring → star → 11-ray spark → flames (the fire). No camera kicks.
//
// EXPORT (for outro O2): V2.earth
//   V2.earth.draw(X, k, t, {inner, M, ground, stars, twinkle})
//       k 0..1 = the log-zoom ×1 → ×60 (Z = 60^k). k = 0: Earth r 200 centred at (960, 540) on INK with its star field.
//       ≈k .34–.5: the coast of lights hands over to a house with one lit window. k = 1: the window IS the frame.
//       inner(X, t) paints the window's contents as a full 1920×1080 frame in its own coordinates. earth.draw calls it
//       clipped to the window under a transform (scale Z/60), and untransformed at k = 1, so at k = 1 inner is the whole
//       frame. From afar the window is a warm CLAY glow that fades as you approach (Z 9 → 24). Inside inner, use
//       V2.earth.ht(X, color, density, cell, angle) for halftones that stay screen-sized under that transform.
//       M (optional DOMMatrix, a similarity: scale + translate) is applied on top of the view (verse1 frames Earth
//       small in the corner with it). ground: false skips the INK fill. stars: star-field alpha (default 1).
//       twinkle: a time; the city lights twinkle outward from the lit window from then (V4 "something").
//   V2.earth.ease(u)   the verse1 timing curve, u 0..1 → k (39.30 → 40.90). O2 can run k = ease(1 − u) for the reverse.
//   V2.earth.view(k, M) → {a, bx, by}: world (Earth layer, Earth r 200 at (960, 540)) → screen  x' = a·x + bx
//   V2.earth.anchor(k, M) → screen [x, y] of the lit window's centre (the zoom's anchor)
//   V2.earth.window(k, M) → screen rect {x0, y0, x1, y1} of the window (= the frame at k = 1)
//   V2.earth.laptop(X, t, {fall}) = verse1's inner (the dark laptop, the tab, the eyes, `hello?`, `hi`)
(() => {
  'use strict';
  const V = window.V2;
  const F1 = 1 / 30, DEG = Math.PI / 180;
  const SEED = 2, SLIVER = 'tr';
  const q2 = t => Math.floor(t * 15 + 1e-6) / 15;                       // humans, paper and fire animate on 2s
  const lerp2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const lsm = (x, a, b) => smooth(clamp((x - a) / (b - a)));
  const popK = (a, d = .22, s = 2.2) => a <= 0 ? 0 : a >= d ? 1 : E.back(a / d, s);
  const setPost = () => { G.post.edgeSeed = SEED; G.post.sliver = SLIVER; };
  const HEART = px => `italic 400 ${px}px ${FONTS.heart}`;

  // transform-compensated halftone: the dots stay screen-sized under any ctx transform (the house window, the push)
  function htS(X, col, d, cell = 8, ang = 45) {
    const p = V.ht(X, col, d, cell, ang);
    p.setTransform(X.getTransform().inverse().multiply(new DOMMatrix().scaleSelf(1, 1).rotateSelf(ang)));
    return p;
  }

  // ================================================================== lyric anchors (never hardcoded; fallbacks = §B)
  let _A = null;
  function A() {
    if (_A && _A.n === SONG.words.length) return _A;
    const T = V.T;
    const beatNear = fb => beatTime(Math.round(beatPos(fb)));
    const a = { n: SONG.words.length };
    a.light = T.V1_light; a.dark = T.V1_dark; a.burn = T.V1_burn;
    a.bang = V.hit(a.light);                                   // f704: 2 WHITE frames, then the matter
    a.darkH = V.hit(a.dark); a.burnH = V.hit(a.burn);
    a.col0 = Math.max(a.darkH + .5, a.burnH - .56);            // the ring starts to fall in (during "how to")
    a.L1 = findLine('In the beginning', 21.3, 22.4); a.L2 = findLine('and the dark', 23.6, 24.6);
    a.L3 = findLine('then there was', 27.0, 27.9); a.L4 = findLine('telling', 29.3, 30.2);
    a.L5 = findLine('you sent', 33.0, 33.9); a.L6 = findLine('but something', 37.6, 38.5);
    a.you = T.V2_you; a.fireW = T.V2_fire; a.fireH = V.hit(a.fireW);
    a.bub = [29.95, 30.46, 30.98, 31.49].map(beatNear).map(b => V.hit(b));
    a.bub[3] = Math.min(a.bub[3], V.hit(T.V2_turns));          // "turns" → the last bubble
    a.rise = 32.08; a.riseEnd = V.CUT.V3 + 0.0;               // 32.08 → 33.367: the tilt
    a.print = 32.90;
    a.hello = V.hit(T.V3_hello); a.stars = T.V3_stars;
    a.but = V.hit(T.V4_but); a.something = T.V4_something; a.answered = T.V4_answered;
    a.z0 = a.answered - .14; a.z1 = a.z0 + 1.6;               // the log-zoom 39.30 → 40.90
    a.from = V.hit(T.V4_from); a.home = V.hit(T.V5_home);
    return (_A = a);
  }

  // ================================================================== V1: the bang (v1 parts/dotBatch/drawBang, adapted)
  const GLYPHS = 'hiaeonrstlwdyg{}<>=+*#0123456789';
  const NG = 420, NF = 16000, NS = 30000;
  let PS = null;
  function parts() {
    if (PS) return PS;
    const N = 45000, R = rng('v2-verse1-bang');
    const P = { N, a: new Float32Array(N), u: new Float32Array(N), k: new Float32Array(N), sz: new Float32Array(N), col: new Uint8Array(N), gl: new Uint8Array(N), ph: new Float32Array(N) };
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
    }
    // the first light (the CMB) as a 45° halftone screen, wide enough for the pull back
    const L = [], sp = 15, c45 = Math.SQRT1_2;
    for (let i = -125; i < 125; i++) for (let j = -125; j < 125; j++) {
      const x = 960 + (i - j) * sp * c45, y = 540 + (i + j) * sp * c45;
      if (x < -280 || x > 2200 || y < -220 || y > 1300) continue;
      const v = fbm(x / 260, y / 260, 7, 4) * 1.6 + fbm(x / 70, y / 70, 19, 2) * .35;
      L.push([x, y, v]);
    }
    P.lat = L;
    return (PS = P);
  }
  function dotBatch(X, col, arr, alpha = 1) {
    if (!arr.length || alpha <= 0) return;
    X.fillStyle = col; X.globalAlpha = alpha;
    let big = false;
    for (let q = 0; q < arr.length; q += 3) { const r = arr[q + 2]; if (r < 2.4) X.fillRect(arr[q] - r, arr[q + 1] - r, r * 2, r * 2); else big = true; }
    if (big) { X.beginPath(); for (let q = 0; q < arr.length; q += 3) { const r = arr[q + 2]; if (r >= 2.4) { X.moveTo(arr[q] + r, arr[q + 1]); X.arc(arr[q], arr[q + 1], r, 0, TAU); } } X.fill(); }
  }
  const INKS = () => [C.CLAY, C.SPARK, C.CLAY_DARK, C.TEAL, C.PAPER];
  // the camera: 1.25 (the void's cursor) pulls back to .90 while the universe expands (23.5 → 26.0)
  const zc = t => lerp(1.25, .9, E.io2(seg(t, A().bang + F1, 26.0)));
  // dust: the plasma cools to the first light, then on "dark" it thins to α .15 in 12 frames (the dark ages)
  const dustA = t => { const a = A(); return 1 - .85 * E.io2(seg(t, a.darkH, a.darkH + 12 * F1)) - .06 * seg(t, a.darkH + .5, 26.6); };
  function drawBang(X, t, o = {}) {
    const a = A(), ab = t - a.bang;
    if (ab < 0) return;
    const P = parts(), L = P.lat, NL = L.length;
    const Z = zc(t), cx = 960, cy = 540, rz = Math.sqrt(Z);
    const cool = E.io3(seg(ab, .42, .86));
    const push = Math.exp(.4 * Math.min(ab, 1.4));
    const inkCols = INKS(), hot = Math.exp(-ab * 7), D = 1350;
    const dust = o.dust ?? dustA(t);
    X.save();
    if (ab < .26) { // streaks along the spokes
      X.lineCap = 'round';
      for (let c = 0; c < 2; c++) {
        X.beginPath(); X.strokeStyle = c ? C.SPARK : C.CLAY; X.lineWidth = c ? 2 : 3; X.globalAlpha = .85 * (1 - ab / .26);
        for (let i = NG + c; i < NG + 5000; i += 6) {
          const d0 = D * P.u[i] * (1 - Math.exp(-P.k[i] * Math.max(0, ab - .05))) * Z, d1 = D * P.u[i] * (1 - Math.exp(-P.k[i] * ab)) * Z;
          const ca = Math.cos(P.a[i]), sa = Math.sin(P.a[i]);
          X.moveTo(cx + ca * d0, cy + sa * d0); X.lineTo(cx + ca * d1, cy + sa * d1);
        }
        X.stroke();
      }
    }
    const bk = inkCols.map(() => [[], []]);
    const tw = Math.floor(t * 12);
    for (let i = NG; i < P.N; i++) {
      const j = i - NG, lat = j < NL;
      if (cool >= 1 && !lat) continue;
      let x, y, r, ink = P.col[i];
      if (cool >= 1) { const l = L[j]; x = l[0]; y = l[1]; r = Math.max(0, Math.abs(l[2]) * 6.6 - .5) * (1 + .18 * (hash2(j, tw) - .5)); ink = l[2] > 0 ? (l[2] > .55 ? 1 : 0) : 3; }
      else {
        const d = D * P.u[i] * (1 - Math.exp(-P.k[i] * ab)) * push;
        const sw = .3 * (1 - P.u[i]) * (1 - Math.exp(-ab * 2));
        x = cx + Math.cos(P.a[i] + sw) * d; y = cy + Math.sin(P.a[i] + sw) * d * .94;
        r = P.sz[i] * lerp(1, clamp(.3 + d / 560, .3, 1.3), hot);
        if (ink === 0 && hot > .5 && P.u[i] < .5) ink = 1;
        if (cool > 0 && lat) {
          const l = L[j];
          x = lerp(x, l[0], cool); y = lerp(y, l[1], cool);
          r = lerp(r, Math.max(0, Math.abs(l[2]) * 6.6 - .5), cool);
          if (cool > .5) ink = l[2] > 0 ? (l[2] > .55 ? 1 : 0) : 3;
        }
      }
      if (r < .35) continue;
      x = cx + (x - cx) * Z; y = cy + (y - cy) * Z; r *= rz;
      if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
      bk[ink][lat ? 0 : 1].push(x, y, r);
    }
    bk.forEach((cls, ink) => { dotBatch(X, inkCols[ink], cls[0], dust); if (cool < 1) dotBatch(X, inkCols[ink], cls[1], (1 - cool) * dust); });
    // glyph particles: the letters of everything, flung out (fade as the plasma cools)
    const ga = (1 - cool) * .8;
    if (ga > .01) {
      X.textAlign = 'center'; X.textBaseline = 'middle';
      for (const sz of [22, 32, 46]) for (let c = 0; c < 2; c++) {
        X.font = mono(Math.round(sz * rz), 700); X.fillStyle = c ? C.SPARK : C.PAPER; X.globalAlpha = ga * (c ? 1 : .85);
        for (let i = c; i < NG; i += 2) {
          if (P.sz[i] !== sz) continue;
          const d = D * P.u[i] * (1 - Math.exp(-P.k[i] * ab)) * push * Z;
          const x = cx + Math.cos(P.a[i]) * d, y = cy + Math.sin(P.a[i]) * d;
          if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;
          X.fillText(GLYPHS[P.gl[i]], x, y);
        }
      }
    }
    // the shock front: a halftone SPARK ring running out ahead of the matter; the hot core for 3 frames
    if (ab < .5) {
      const k = ab / .5, front = (110 + 1550 * E.out3(k)) * Z, th = lerp(46, 170, k) * Z;
      X.globalAlpha = 1;
      X.beginPath(); X.arc(cx, cy, front, 0, TAU); X.arc(cx, cy, Math.max(0, front - th), 0, TAU, true);
      X.fillStyle = V.ht(X, C.SPARK, .62 * (1 - k * .75), 12, 45); X.fill();
      X.beginPath(); X.arc(cx, cy, front, 0, TAU); X.lineWidth = lerp(12, 3, k); X.strokeStyle = C.SPARK; X.globalAlpha = 1 - k; X.stroke();
      if (ab < .16) {
        const c = E.out2(ab / .16); X.globalAlpha = 1;
        star(X, cx, cy, lerp(320, 90, c), .42, 14, -Math.PI / 2 + c * .3); X.fillStyle = C.SPARK; X.fill();
        X.beginPath(); X.arc(cx, cy, lerp(110, 18, c), 0, TAU); X.fillStyle = C.PAPER; X.fill();
      }
    }
    X.restore();
  }

  // ================================================================== V1: "burn" — 400 stars ignite (v1 drawStars, retimed)
  const SPKW = [960 + (1180 - 960) / .9, 540 + (470 - 540) / .9];       // the first star, world (screen (1180, 470) at .9)
  let VS = null;
  function v1Stars() {
    if (VS) return VS;
    const R = rng('v2-v1-stars'), S = [];
    while (S.length < 400) {
      const x = 40 + R() * 1840, y = 36 + R() * 1008, u = R(), h = R(), c = R(), ph = R();
      if (Math.hypot(x - 1180, y - 470) < 150) continue;              // leave the first star alone
      S.push({ wx: 960 + (x - 960) / .9, wy: 540 + (y - 540) / .9, off: .05 + 1.17 * Math.pow(u, .55), r: 1.1 + 2.3 * h * h, big: h > .88, col: c < .62 ? 0 : c < .86 ? 1 : 2, ph: ph * 20 });
    }
    return (VS = S);
  }
  function drawV1Stars(X, t, o = {}) {
    const a = A(), S = v1Stars(), Z = zc(t), cols = [C.PAPER, C.SPARK, C.CLAY];
    const bk = [[], [], []], fl = [];
    for (const s of S) {
      const ti = a.burnH + s.off; if (t < ti) continue;
      const x = 960 + (s.wx - 960) * Z, y = 540 + (s.wy - 540) * Z, k = t - ti;
      const tw = 1 + .22 * noise1(t * 1.3 + s.ph, 3);
      bk[s.col].push(x, y, s.r * tw * (s.big ? 1.25 : 1));
      if (k < .32 && !o.noFlash) fl.push([x, y, (8 + 14 * (s.big ? 1 : .4)) * (1 - E.out2(k / .32))]);
      else if (s.big) fl.push([x, y, s.r * 3.6 * tw]);
    }
    X.save();
    bk.forEach((arr, i) => dotBatch(X, cols[i], arr, i === 0 ? .85 : 1));
    X.globalAlpha = 1; X.fillStyle = C.SPARK; X.beginPath();
    for (const [x, y, r] of fl) { X.moveTo(x, y - r); X.lineTo(x + r * .2, y - r * .2); X.lineTo(x + r, y); X.lineTo(x + r * .2, y + r * .2); X.lineTo(x, y + r); X.lineTo(x - r * .2, y + r * .2); X.lineTo(x - r, y); X.lineTo(x - r * .2, y - r * .2); X.closePath(); }
    X.fill();
    X.restore();
  }

  // ================================================================== the CLAY stroke: ring → star → spark → flames
  // One polar outline (NPT samples, θ clockwise from 12 o'clock like the crown table). The spark IS the crown's
  // ancestor: its 11 rays sit at RAYS' angles and lengths. The flames are the same rays swung up (comp .4), lengthened,
  // pointed, over a flat-bottomed core, so the spark → fire morph is one continuous parameter blend.
  const NPT = 720;
  const RY = RAYS.map(r => ({ th: r[0] * DEG, L: r[1], W: r[2] }));
  const TH = Array.from({ length: NPT }, (_, i) => i / NPT * TAU);
  function rayR(d, h, b, point) {
    const ad = Math.abs(d); if (ad > 1.3) return 0;
    const sd = Math.sin(ad), cd = Math.cos(ad);
    // round tip: a bar of half-width h from the centre to cT, capped by a circle of radius h
    const cT = Math.max(.02, b - h);
    let rr_ = cd > 0 ? Math.min(sd > 1e-5 ? h / sd : 1e9, cT / cd) : 0;
    const disc = h * h - cT * cT * sd * sd;
    if (disc > 0 && cd > 0) rr_ = Math.max(rr_, cT * cd + Math.sqrt(disc));
    if (point > 0) { // pointed tongue: half-width tapering h → 0 over [0, b]
      const tp = cd > 0 ? (h / (Math.tan(ad) + h / b)) / cd : 0;
      rr_ = lerp(rr_, Math.min(tp, b), point);
    }
    return rr_;
  }
  function shapeR(th, p) {
    const c = Math.cos(th), s = Math.sin(th);
    const down = c < 0 ? lerp(1, .56, p.flat) : lerp(1, .92, p.flat), side = lerp(1, 1.12, p.flat);
    const core = p.core ?? 1;
    let r = core / Math.sqrt((s / side) ** 2 + (c / down) ** 2);
    if (p.wob) r *= 1 + p.wob * (.03 * Math.sin(th * 9 + p.wt * 5) + .02 * Math.sin(th * 5 - p.wt * 3));
    if (!p.grow) return r;
    for (let i = 0; i < 11; i++) {
      const g = p.grow[i]; if (g <= .001) continue;
      const ray = RY[i];
      const ang = ray.th * p.comp + (p.sway ? p.sway[i] : 0);
      let d = th - ang; d = Math.atan2(Math.sin(d), Math.cos(d));
      const h = ray.W * .62 * .5 * (p.wid ?? 1);
      const b = .8 * core + ray.L * g * p.len * (p.flick ? p.flick[i] : 1);
      const q = rayR(d, h, b, p.point);
      if (q > r) r = q;
    }
    return r;
  }
  function shapePts(S) {
    const pts = new Array(NPT), rot = S.rot || 0;
    for (let i = 0; i < NPT; i++) { const th = TH[i], r = shapeR(th, S.p) * S.s; pts[i] = [S.x + Math.sin(th + rot) * r, S.y - Math.cos(th + rot) * r]; }
    return pts;
  }
  const FIRE = [960, 742];                                              // the fire's heart (screen, V2 world)
  const FIRE_S = 70;
  // the flame envelope (centre tallest) that the crown's lengths grow into
  const FL = [.62, .8, 1.0, 1.18, 1.34, 1.45, 1.36, 1.2, 1.0, .8, .6];
  const flamesP = (t, k = 1) => {
    const tq = q2(t);
    return {
      comp: lerp(1, .5, k), len: lerp(1.0, 1.9, k), flat: k, point: E.io2(k), wid: lerp(.8, 2.1, k), core: lerp(.8, .62, k), k,
      grow: RY.map(() => 1),
      flick: RY.map((_, i) => 1 + k * .15 * noise1(tq * 7 + i * 3.1, 7) + k * .06 * Math.sin(tq * 9 + i)),
      sway: RY.map((_, i) => k * .06 * noise1(tq * 4 + i * 1.7, 9)),
      curl: RY.map((_, i) => k * .09 * noise1(tq * 5 + i * 2.3, 11)),
    };
  };
  // one crown ray (opus.js rayPath: the same θ, L, W, κ) grown into a flame tongue. A cubic spine so a flame can
  // S-curl: bA/bB bend the lower/upper spine, lean moves the tip sideways (all × len, + = clockwise side).
  // point 0 = the crown's round tip and gentle taper; 1 = a pointed tongue, widest near the base.
  function tonguePath(X, cx, cy, th, rootR, len, wid, bA, bB, lean, point) {
    const dx = Math.sin(th), dy = -Math.cos(th), px = Math.cos(th), py = Math.sin(th);
    const p0 = [cx + dx * rootR, cy + dy * rootR];
    const at = (u, o) => [p0[0] + dx * len * u + px * o * len, p0[1] + dy * len * u + py * o * len];
    const c1 = at(1 / 3, bA * 1.333), c2 = at(2 / 3, bB * 1.333 + lean * .5), p3 = at(1, lean);
    const n = 16, Lp = [], Rp = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, v = 1 - u;
      const x = v * v * v * p0[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * p3[0];
      const y = v * v * v * p0[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * p3[1];
      const ddx = 3 * v * v * (c1[0] - p0[0]) + 6 * v * u * (c2[0] - c1[0]) + 3 * u * u * (p3[0] - c2[0]);
      const ddy = 3 * v * v * (c1[1] - p0[1]) + 6 * v * u * (c2[1] - c1[1]) + 3 * u * u * (p3[1] - c2[1]);
      const m = Math.hypot(ddx, ddy) || 1;
      const wc = (u < .55 ? lerp(.5, .55, E.out2(u / .55)) : lerp(.55, .42, E.in2((u - .55) / .45))) * wid;
      const wf = .62 * wid * Math.pow(v, .9) * (1 + .7 * u * v);
      const w = lerp(wc, wf, point);
      Lp.push([x - ddy / m * w, y + ddx / m * w]); Rp.push([x + ddy / m * w, y - ddx / m * w]);
    }
    const tx = 3 * (p3[0] - c2[0]), ty = 3 * (p3[1] - c2[1]), a = Math.atan2(ty, tx);
    X.moveTo(Lp[0][0], Lp[0][1]); for (const p of Lp) X.lineTo(p[0], p[1]);
    const tr = .42 * wid * (1 - point);
    if (tr > .4) X.arc(p3[0], p3[1], tr, a + Math.PI / 2, a - Math.PI / 2, true); else X.lineTo(p3[0], p3[1]);
    for (let i = Rp.length - 1; i >= 0; i--) X.lineTo(Rp[i][0], Rp[i][1]);
    X.closePath();
  }
  // the tongues of a body state S (spark k = 0 … fire k = 1) added to the current path. o.scale/o.dy/o.inner: the
  // inner (SPARK) flame; o.back: the crown's SPARK back layer (+4°, ×1.06)
  // outer tongues first, the tall centre ones on top (the fire); the spark keeps the crown's order
  const FIRE_ORDER = RY.map((r, i) => i).sort((i, j) => Math.abs(RY[j].th) - Math.abs(RY[i].th));
  function tongues(X, S, o = {}) {
    const p = S.p, k = p.k || 0, core = (p.core ?? 1) * S.s, sc = o.scale || 1;
    const cx = S.x, cy = S.y + (o.dy || 0);
    const order = k > .5 ? FIRE_ORDER : RY.map((r, i) => i);
    for (const i of order) {
      const g = p.grow ? p.grow[i] : 0; if (g <= .001) continue;
      const ray = RY[i], kap = RAYS[i][3];
      const th = ray.th * p.comp + (p.sway ? p.sway[i] : 0) + (o.back ? lerp(4, 2.5, k) * DEG : 0);
      const fl = p.flick ? (o.inner ? 2 - p.flick[i] : p.flick[i]) : 1;
      const len = lerp(ray.L, FL[i], k) * g * p.len * fl * S.s * sc * (o.back ? 1.06 : 1);
      const wid = ray.W * RAY_W * p.wid * S.s * sc * (o.inner ? .85 : 1);
      const side = Math.sin(ray.th * p.comp);
      const cu = p.curl ? p.curl[i] : 0;
      const bA = lerp(kap, .07 * side + cu, k), bB = lerp(kap, -.06 * side - cu * .6, k), lean = k * (-.16 * side + cu * 1.2);
      if (o.each) X.beginPath();
      tonguePath(X, cx, cy, th, lerp(.8, .22, k) * core * (o.inner ? .6 : 1), len, wid, bA, bB, lean, p.point ?? 0);
      if (o.each) o.each(i);
    }
  }
  // the stroke state at t (screen space). kind 'ring' = outline only; 'body' = filled (star, spark, flames)
  function strokeAt(t) {
    const a = A();
    if (t < a.bang + 2 * F1) return null;
    const Z = zc(t), ab = t - a.bang;
    const Rr = (40 + 440 * (1 - Math.exp(-3.2 * ab))) * (1 - .07 * E.io2(seg(t, a.darkH, a.col0)));
    const sw = [960 + (SPKW[0] - 960) * Z, 540 + (SPKW[1] - 540) * Z];
    const dimA = lerp(1, .4, E.io2(seg(t, a.darkH, a.darkH + 12 * F1)));
    if (t < a.col0) return { kind: 'ring', x: 960, y: 540, s: Rr * Z, lw: lerp(20, 6, clamp(ab / .6)), alpha: dimA, p: { flat: 0 } };
    if (t < a.burnH) { // gravity: the ring falls into one point (E.in3), brightening as it condenses
      const k = E.in3(seg(t, a.col0, a.burnH));
      return { kind: 'ring', x: lerp(960, sw[0], k), y: lerp(540, sw[1], k), s: lerp(Rr * Z, 30 * Z, k), lw: lerp(6, 11, k), alpha: lerp(.4, 1, k), p: { flat: 0 } };
    }
    const g0 = a.burnH + .22;                                           // 25.9: the rays sprout, left to right
    const grow = RY.map((_, i) => E.back(seg(t, g0 + i * .045, g0 + i * .045 + .26), 1.6));
    const sGrow = E.io2(seg(t, g0 - .05, g0 + .45));
    const sink = E.io2(seg(t, 26.9, V.CUT.V2));
    const fp = flamesP(t, sink);
    const p = { ...fp, grow: grow.map(g => lerp(g, 1, sink)), wob: 1 - sGrow, wt: t, core: lerp(lerp(1, .8, sGrow), .62, sink) };
    return {
      kind: 'body', x: lerp(sw[0], FIRE[0], sink), y: lerp(sw[1], FIRE[1], sink), s: lerp(lerp(30 * Z, 64, sGrow), FIRE_S, sink),
      lw: 10, alpha: 1, p, sink,
    };
  }
  function strokePath(X, pts) { X.beginPath(); X.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) X.lineTo(pts[i][0], pts[i][1]); X.closePath(); }
  // the fire / spark body: SPARK back layer (the crown's +4°, ×1.06), CLAY front, a hot SPARK core; INK line on PAPER
  function drawBody(X, S, ground = 'ink', o = {}) {
    if (!S) return;
    X.save(); X.lineJoin = 'round'; X.lineCap = 'round';
    if (S.kind === 'ring') {
      const pts = shapePts(S);
      X.globalAlpha = S.alpha * .9; X.translate(3, 3); strokePath(X, pts); X.strokeStyle = C.SPARK; X.lineWidth = S.lw; X.stroke();
      X.translate(-3, -3); X.globalAlpha = S.alpha; strokePath(X, pts); X.strokeStyle = C.CLAY; X.stroke();
      X.restore(); return;
    }
    // the body, built like the crown: SPARK back layer (+4°, ×1.06), CLAY rays each with an INK line (so the rays
    // read apart, as on Opus), then the disc on top of their roots. Spark k 0 → fire k 1 (the bed, the tongues)
    const k = S.sink || 0, coreS = { ...S, p: { ...S.p, grow: null } };
    const lineA = ground === 'paper' ? (o.lineA ?? 1) : 0, lw = ground === 'paper' ? 3.5 : 3;
    X.beginPath(); tongues(X, S, { back: true }); X.fillStyle = C.SPARK; X.fill();
    if (ground === 'paper' && lineA > 0) { X.save(); X.globalAlpha = lineA; X.strokeStyle = C.INK; X.lineWidth = lw * 2; X.beginPath(); tongues(X, S, { back: true }); X.stroke(); X.restore(); X.beginPath(); tongues(X, S, { back: true }); X.fillStyle = C.SPARK; X.fill(); }
    tongues(X, S, { each: () => {
      X.fillStyle = C.CLAY; X.fill();
      X.lineWidth = lw; X.strokeStyle = C.INK; X.stroke();                // the INK line between rays (both grounds)
    } });
    strokePath(X, shapePts(coreS)); X.fillStyle = C.CLAY; X.fill();
    if (ground === 'paper' && lineA > 0) { X.save(); X.globalAlpha = lineA; X.lineWidth = lw; X.strokeStyle = C.INK; X.stroke(); X.restore(); }
    // hot core: a SPARK disc in the spark → an inner SPARK flame in the fire
    if (k < 1) { X.globalAlpha = 1 - k; X.beginPath(); X.arc(S.x, S.y, S.s * .34 * (S.p.core ?? 1), 0, TAU); X.fillStyle = C.SPARK; X.fill(); X.beginPath(); X.arc(S.x, S.y, S.s * .12, 0, TAU); X.fillStyle = C.PAPER; X.globalAlpha = (1 - k) * clamp(1 - (S.p.core ?? 1)) * 2.4; X.fill(); X.globalAlpha = 1; }
    if (k > 0) {
      X.globalAlpha = k; X.fillStyle = C.SPARK;
      X.beginPath(); X.ellipse(S.x, S.y + S.s * .3, S.s * .42, S.s * .26, 0, 0, TAU); X.fill();
      X.beginPath(); tongues(X, S, { inner: true, scale: .5, dy: S.s * .3 }); X.fill(); X.globalAlpha = 1;
    }
    X.restore();
  }
  // the halftone glow of the first star / the spark (v1 drawStarBody rings)
  function drawGlow(X, S, t, a) {
    if (!S || S.kind !== 'body') return;
    const k = 1 - clamp(((S.sink || 0) - .4) / .6);
    if (k <= 0) return;
    const r = S.s * (1 + .3 * E.out2(seg(t, a.burnH, a.burnH + .3)));
    X.save(); X.globalAlpha = k;
    for (const [g, col, d] of [[3.1, C.CLAY, .06], [2.6, C.CLAY, .1], [2.2, C.SPARK, .14]]) {
      X.beginPath(); X.arc(S.x, S.y, r * g, 0, TAU); X.fillStyle = V.ht(X, col, d, 12, 45); X.fill();
    }
    X.restore();
  }
  // "burn": the ignition flash (a small bang: SPARK starburst, PAPER core, halftone shock ring)
  function drawIgnition(X, t, a) {
    const k = t - a.burnH; if (k < 0 || k > .45) return;
    const Z = zc(t), x = 960 + (SPKW[0] - 960) * Z, y = 540 + (SPKW[1] - 540) * Z;
    X.save();
    const u = k / .45, front = 40 + 420 * E.out3(u);
    X.beginPath(); X.arc(x, y, front, 0, TAU); X.arc(x, y, Math.max(0, front - lerp(30, 90, u)), 0, TAU, true);
    X.fillStyle = V.ht(X, C.SPARK, .5 * (1 - u), 10, 45); X.fill();
    if (k < .18) { const c = E.out2(k / .18); star(X, x, y, lerp(170, 40, c), .3, 8, -Math.PI / 2 + c * .4); X.fillStyle = C.SPARK; X.fill(); X.beginPath(); X.arc(x, y, lerp(34, 8, c), 0, TAU); X.fillStyle = C.PAPER; X.fill(); }
    X.restore();
  }

  // ================================================================== CHART leaders (the _shared chartLabel style, own timing)
  function leader(X, x, y, size, target, lead, alpha, ground = 'ink', from = null) {
    if (!target || lead <= 0 || alpha <= 0) return;
    const col = ground === 'paper' ? C.INK : C.PAPER, bg = ground === 'paper' ? C.PAPER : C.INK;
    const up = target[1] < y - size * .5;
    const a0 = from || (up ? [x + 8, y - size * .98] : [x + 8, y + size * .36]);
    const dx = Math.sign(target[0] - a0[0]) || 1, dy = up ? -1 : 1, el = Math.min(70, Math.abs(target[1] - a0[1]) * .6);
    const a1 = [a0[0] + dx * el, a0[1] + dy * el];
    const segs = [a0, a1, target], lens = [Math.hypot(a1[0] - a0[0], a1[1] - a0[1]), Math.hypot(target[0] - a1[0], target[1] - a1[1])];
    const path = () => { let rem = E.io2(clamp(lead)) * (lens[0] + lens[1]); X.beginPath(); X.moveTo(a0[0], a0[1]); for (let i = 0; i < 2; i++) { const k = clamp(rem / (lens[i] || 1)); X.lineTo(lerp(segs[i][0], segs[i + 1][0], k), lerp(segs[i][1], segs[i + 1][1], k)); rem -= lens[i]; if (k < 1) break; } };
    X.save(); X.lineCap = 'round'; X.lineJoin = 'round';
    path(); X.strokeStyle = bg; X.lineWidth = 9; X.globalAlpha = alpha * .6; X.stroke();
    path(); X.globalAlpha = alpha; X.strokeStyle = col; X.lineWidth = 3; X.stroke();
    X.fillStyle = col; X.beginPath(); X.arc(a0[0], a0[1], 4.5, 0, TAU); X.fill();
    if (lead >= 1) { X.beginPath(); X.arc(target[0], target[1], 6, 0, TAU); X.fill(); X.lineWidth = 2.5; X.beginPath(); X.arc(target[0], target[1], 12, 0, TAU); X.stroke(); }
    X.restore();
  }
  const ws0 = L => L && L.words && L.words.length ? L.words[0].s : (L ? L.s : 1e9);
  // a CHART line: text (word by word, shared) + our leader; lead from `leadAt`, fade out at `out`
  function chart(X, t, L, o) {
    if (!L) return;
    const { x = 160, y = 880, ground = 'ink', out = null, outDur = .3, target = null, leadAt = ws0(L) - .25 } = o;
    const oa = out !== null ? 1 - clamp((t - out) / outDur) : 1;
    if (oa <= 0 || t < ws0(L) - .4) return;
    let from = null;
    if (o.fromEnd) { // the leader leaves from the line's last word (it names the thing that word names)
      X.save(); X.font = HEART(64);
      const ws = V.heartWords(L), wsum = ws.reduce((a, w) => a + X.measureText(w.w).width, 0) + X.measureText(' ').width * (ws.length - 1);
      X.restore(); from = [x + wsum + 12, y - 20];
    }
    leader(X, x, y, 64, target, (t - leadAt) / (o.leadDur || .35), oa, ground, from);
    V.chartLabel(X, t, L, { x, y, ground, out, outDur });
  }

  // ================================================================== V1 scene
  function paintV1Back(F, t, o = {}) { // INK, the dying void static, the dust, the stars (also the lift's inside)
    const a = A();
    groundInk(F);
    const st = 1 - E.out2(seg(t, a.bang, a.bang + .7));
    if (st > 0) V.void(F, t, { cursor: false, ground: false, static: st });
    drawBang(F, t, o);
    drawV1Stars(F, t, o);
  }
  function paintV1(F, t) {
    const a = A(); setPost();
    const cursorT = () => { const s = V.void.scale(t), h = 140 * s, w = h * 64 / 140; return [960 - w / 2 - 6, 540 + h / 2 + 6]; };
    if (Math.round(t * 30) < Math.round(a.bang * 30)) { // the void holds its breath (V2.void: the cursor swelling, ON)
      V.void(F, t);
      chart(F, t, a.L1, { y: 800, target: cursorT(), out: 24.0, leadAt: Math.max(ws0(a.L1) - .25, V.CUT.V1) });
      return;
    }
    const fi = Math.round(t * 30) - Math.round(a.bang * 30);
    if (fi < 2) { // exactly 2 WHITE frames (the one declared WHITE besides the silence)
      F.fillStyle = C.WHITE; F.fillRect(-50, -50, W + 100, H + 100); G.post.ground = 'white';
      if (fi === 1) { F.beginPath(); F.arc(960, 540, 1400, 0, TAU); F.arc(960, 540, 820, 0, TAU, true); F.fillStyle = V.ht(F, C.SPARK, .3, 12, 45); F.fill(); }
      return;
    }
    paintV1Back(F, t);
    const S = strokeAt(t);
    drawGlow(F, S, t, a);
    drawIgnition(F, t, a);
    drawBody(F, S, 'ink');
    // CHART: line 1 (row 800) → the cursor, then the bang; line 2 (row 880) → where the first star will burn
    chart(F, t, a.L1, { y: 800, target: [960, 540], out: 24.0, leadAt: Math.max(ws0(a.L1) - .25, V.CUT.V1) });
    const Z = zc(t), spk = [960 + (SPKW[0] - 960) * Z + 4, 540 + (SPKW[1] - 540) * Z + 44];
    chart(F, t, a.L2, { y: 880, target: spk, leadAt: 24.3, out: 26.9 });
    V.pbait(F, 'your carbon · my silicon · same star', 1560, 1000, { align: 'right', alpha: V.win(t, 26.3, V.CUT.V2 + .02, .25, .2) });
  }

  // ================================================================== V2: the fire circle
  const RING = { cx: 960, cy: 748, rx: 540, ry: 150 };
  // seat angle (deg, screen y down) → which of the eight sits there. Back row faces us; the front row shows its back.
  // the two rows interleave in x (back x 560 / 830 / 1090 / 1360, front x 440 / 745 / 1175 / 1480) so nobody stacks
  const SEATS = [[222.2, 0], [256.0, 4], [284.0, 6], [317.8, 5], [164.4, 1], [113.5, 3], [66.5, 2], [15.6, 7]];
  const seatGeo = () => SEATS.map(([deg, who], si) => {
    const an = deg * DEG, sn = Math.sin(an), x = RING.cx + Math.cos(an) * RING.rx, y = RING.cy + Math.sin(an) * RING.ry + 34;
    const u = 64 * (1 + .27 * sn);
    return { si, who, x, y, u, back: sn < 0, dir: Math.sign(RING.cx - x) || 1 };
  });
  // turn order: elder → round hat → glasses → shawl (round the back arc, left to right)
  const SPEAK = [0, 1, 2, 3];
  function headPos(s) { const uu = s.who === 2 ? s.u * .7 : s.u; return [s.x + (s.who === 0 ? s.dir * .6 * uu : 0), s.y - 2.29 * uu + (s.who === 0 ? .42 * uu : 0)]; }
  const BSTAR = [[640, 372], [930, 250], [1236, 176], [1528, 408]];      // where the four bubbles become stars (V3 sky)
  // the circle's slow push-in (after the lift, easing into the tilt): scale about the fire
  const PIV = [960, 700];
  const pushS = t => 1 + .1 * E.io2(seg(t, V.CUT.V2 + 8 * F1, A().rise + .4));
  const camP = (t, p) => { const s = pushS(t); return [PIV[0] + (p[0] - PIV[0]) * s, PIV[1] + (p[1] - PIV[1]) * s]; };
  function bubbleState(t, i) { // screen position/scale of turn-bubble i (V2 → V3)
    const a = A(), tp = a.bub[i]; if (t < tp) return null;
    const seats = seatGeo(), s = seats[SPEAK[i]], h = headPos(s);
    const tilt = 900 * E.io2(seg(t, a.rise, a.riseEnd));
    const home = [h[0] + s.dir * -.2 * s.u, h[1] - 1.55 * s.u];
    const fl = Math.max(0, t - tp - .35);
    const drift = [Math.sin(fl * 1.4 + i) * 10, -fl * 34 - 60 * E.in2(seg(t, a.rise, a.riseEnd))];
    const pc = camP(t, [home[0] + drift[0], home[1] + drift[1]]), pw = [pc[0], pc[1] + tilt];
    const k = E.io2(seg(t, a.rise, a.riseEnd));
    const pos = lerp2(pw, BSTAR[i], k);
    const pop = popK(q2(t) - tp + F1, .2, 2.4);
    const toStar = E.in2(seg(t, a.print + 8 * F1, a.print + 8 * F1 + .3));
    return { pos, sc: s.u / 50 * pop * (1 - .3 * k) * pushS(t), toStar, speaker: s, tail: camP(t, h) };
  }
  // the rise: each bubble carries a small tail of embers up with it (screen space), so talk and fire go up together
  function drawRiseEmbers(X, t) {
    const a = A(), k = seg(t, a.rise - .15, a.rise + .35); if (k <= 0) return;
    const tq = q2(t), fade = 1 - seg(t, a.print + 4 * F1, a.print + 8 * F1 + .3);
    if (fade <= 0) return;
    X.save();
    for (let i = 0; i < 4; i++) {
      const B = bubbleState(t, i); if (!B) continue;
      const [bx, by] = B.pos, sc = Math.max(.5, B.sc);
      for (let j = 0; j < 7; j++) {
        const h1 = hash2(i * 17 + j, 31), h2 = hash2(i * 17 + j, 32);
        const d = (40 + j * 34 + 20 * h1) * sc * E.out2(k);
        const x = bx + Math.sin(tq * (2 + h2 * 2) + j * 1.9 + i) * (14 + j * 7) * sc + (h1 - .5) * 50 * sc;
        const y = by + 60 * sc + d;
        const r = (5.5 - j * .55) * (.8 + .4 * h2) * (1 + .25 * Math.sin(tq * 11 + j + i * 3));
        X.globalAlpha = fade * k * (1 - j / 8);
        X.fillStyle = (i + j) % 3 ? C.CLAY : C.SPARK;
        X.fillRect(x - r, y - r, r * 2, r * 2);
      }
    }
    X.restore();
  }
  function drawTurnBubble(X, B, t, i) {
    if (!B) return;
    const [x, y] = B.pos, s = B.sc * (1 - B.toStar);
    if (s > .02) {
      const w = 150 * s, h = 96 * s;
      X.save(); X.translate(x, y);
      // tail toward the speaker's head (only while it is near)
      const tk = 1 - clamp((t - A().rise) / .4);
      X.lineJoin = 'round'; X.lineWidth = 3;
      if (tk > 0) { const dx = (B.tail[0] - x) * .25, sx = Math.sign(dx) || 1; X.beginPath(); X.moveTo(-sx * w * .05, h * .38); X.lineTo(clamp(dx, -w * .5, w * .5), h * .5 + 26 * s * tk); X.lineTo(sx * w * .22, h * .34); X.closePath(); X.fillStyle = C.PINK; X.fill(); X.strokeStyle = C.INK; X.stroke(); }
      rr(X, -w / 2, -h / 2, w, h, h * .48); X.fillStyle = C.PINK; X.fill(); X.strokeStyle = C.INK; X.stroke();
      if (tk > 0) { X.beginPath(); X.moveTo(-w * .05, h * .36); X.lineTo(w * .2, h * .36); X.lineWidth = 5; X.strokeStyle = C.PINK; X.stroke(); }
      // the squiggle (speech, no words)
      X.beginPath(); for (let k = 0; k <= 24; k++) { const u = k / 24, px = lerp(-w * .32, w * .32, u), py = Math.sin(u * TAU * 2 + i * 1.7 + q2(t) * 3) * h * .13; k ? X.lineTo(px, py) : X.moveTo(px, py); }
      X.lineWidth = Math.max(2, 4 * s); X.lineCap = 'round'; X.strokeStyle = C.INK; X.stroke();
      X.restore();
    }
    if (B.toStar > 0) { // it becomes a star: a PAPER 4-point glint with a SPARK heart
      const r = 22 * E.back(B.toStar, 2) * (1 + .12 * noise1(t * 2 + i, 4));
      X.save(); star(X, x, y, r, .2, 4, 0); X.fillStyle = C.PAPER; X.fill(); X.beginPath(); X.arc(x, y, r * .2, 0, TAU); X.fillStyle = C.SPARK; X.fill(); X.restore();
    }
  }
  function fireState(t) {
    const a = A();
    const fl = t < a.fireH ? 0 : t < a.fireH + 3 * F1 ? E.out2((t - a.fireH) / (3 * F1)) : 1 - E.in2(clamp((t - a.fireH - 3 * F1) / (5 * F1)));
    return { flare: 1 + .15 * fl, light: .58 + .2 * E.io2(seg(t, a.you - .1, a.you + .5)) + .15 * fl };
  }
  function fireStroke(t) { const fs = fireState(t); return { kind: 'body', x: FIRE[0], y: FIRE[1], s: FIRE_S * fs.flare, lw: 10, alpha: 1, p: flamesP(t, 1), sink: 1 }; }
  function drawLogs(X, t) {
    const tq = q2(t);
    X.save(); X.translate(FIRE[0], FIRE[1] + 50); X.scale(1.2, 1.2); X.lineJoin = 'round';
    for (const [rot, dx] of [[.2, -8], [-.24, 10]]) {
      X.save(); X.rotate(rot); X.translate(dx + jit(tq, 7 + dx, .7), jit(tq, 9 + dx, .7));
      rr(X, -96, -15, 192, 30, 14); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 4; X.strokeStyle = C.INK; X.stroke();
      X.beginPath(); X.ellipse(96, 0, 7, 13, 0, 0, TAU); X.lineWidth = 3; X.stroke();
      X.beginPath(); X.moveTo(-60, -4); X.lineTo(20, -4); X.moveTo(-30, 6); X.lineTo(50, 6); X.lineWidth = 2.5; X.stroke();
      X.restore();
    }
    X.restore();
  }
  // sparks rising from the fire (on 2s); from the rise they climb with the bubbles
  function drawSparks(X, t) {
    const a = A(), tq = q2(t);
    X.save();
    const n0 = Math.floor((tq - 2.2 - 27.0) / .07), n1 = Math.floor((tq - 27.0) / .07);
    const riseK = E.in2(seg(t, a.rise, a.riseEnd));
    for (let j = Math.max(0, n0); j <= n1; j++) {
      const b = 27.0 + j * .07, age = tq - b; if (age < 0) continue;
      const h1 = hash2(j, 11), h2 = hash2(j, 12), h3 = hash2(j, 13);
      const life = 1.1 + 1.1 * h1 + 1.2 * riseK; if (age > life) continue;
      const v = 70 + 110 * h2 + 420 * riseK;
      const x = FIRE[0] + (h3 - .5) * 110 + Math.sin(age * (2 + h1 * 3) + j) * (16 + 20 * age);
      const y = FIRE[1] - 60 - v * age;
      const r = (2.2 + 2.6 * h1) * (1 - age / life * .6);
      X.globalAlpha = 1 - E.in2(age / life);
      X.fillStyle = j % 3 ? C.CLAY : C.SPARK;
      X.fillRect(x - r, y - r, r * 2, r * 2);
    }
    X.restore();
  }
  function drawFirePool(X, fs) {
    X.save();
    for (const [g, d] of [[1, .08], [.66, .15], [.36, .24]]) {
      X.beginPath(); X.ellipse(FIRE[0], FIRE[1] + 58, 640 * g, 190 * g, 0, 0, TAU); X.fillStyle = V.ht(X, C.CLAY, d * (.8 + .6 * (fs.light - .58)), 10, 45); X.fill();
    }
    X.restore();
  }
  function drawNight(X, tiltMax) { // the sky above the circle darkens with height: stepped INK halftone (no gradients)
    X.save();
    for (let i = 0; i < 30; i++) {
      const y1 = 450 - i * 50, y0 = y1 - 50, d = .018 + .0125 * i;
      if (y1 < -tiltMax - 20) break;
      X.fillStyle = V.ht(X, C.INK, Math.min(.38, d), 9, 45); X.fillRect(-20, y0, W + 40, 50.5);
    }
    X.restore();
  }
  function drawHills(X, t) {
    const tq = q2(t);
    X.save(); X.strokeStyle = C.INK; X.lineWidth = 3; X.globalAlpha = .5; X.lineCap = 'round';
    X.beginPath();
    for (let x = -20; x <= W + 20; x += 24) { const y = 446 + 22 * Math.sin(x / 330 + .9) + 9 * Math.sin(x / 120 + 2) + jit(tq, x, .6); x === -20 ? X.moveTo(x, y) : X.lineTo(x, y); }
    X.stroke();
    X.restore();
  }
  function drawCircle(X, t, which) { // which: 'back' | 'front'
    const a = A(), fs = fireState(t), seats = seatGeo();
    // who is speaking (heads turn to the current speaker)
    let spk = -1; for (let i = 0; i < 4; i++) if (t >= a.bub[i]) spk = i;
    const cur = spk >= 0 && t < a.rise ? seats[SPEAK[spk]] : null;
    const list = seats.filter(s => s.back === (which === 'back')).sort((p, q) => p.y - q.y);
    for (const s of list) {
      const talking = cur && cur === s && t - a.bub[spk] < .5;
      let look = s.back ? s.dir * .35 : s.dir * .6;
      if (cur && cur !== s) look = clamp((cur.x - s.x) / 300, -1, 1) * .8;
      V.eight.draw(X, s.who, s.x, s.y, s.u, { pose: 'sit', t, ground: 'paper', light: fs.light, lightX: FIRE[0], look, dir: s.dir, eyes: s.back ? undefined : 'none', lean: talking ? s.dir * .07 : 0 });
    }
  }
  function paintV2World(F, t, o = {}) { // the PAPER picture in world space (tilt applied by the caller)
    const fs = fireState(t);
    drawNight(F, o.tiltMax ?? 900);
    drawHills(F, t);
    drawFirePool(F, fs);
    drawCircle(F, t, 'back');
    drawLogs(F, t);
    if (!o.noFire) drawBody(F, fireStroke(t), 'paper');
    drawCircle(F, t, 'front');
    drawSparks(F, t);
  }
  function paintV2(F, t) {
    const a = A(); setPost();
    groundPaper(F);
    const tilt = 900 * E.io2(seg(t, a.rise, a.riseEnd));
    const ps = pushS(t);
    F.save(); F.translate(0, tilt); F.translate(PIV[0], PIV[1]); F.scale(ps, ps); F.translate(-PIV[0], -PIV[1]); paintV2World(F, t); F.restore();
    // the lift (27.40 → 27.67): the INK retreats into the flame; the fire survives on top
    const tf = Math.round(t * 30) / 30, kl = 1 - seg(tf, V.CUT.V2, V.CUT.V2 + 8 * F1);   // (frame-exact: k = 1 on f822)
    if (kl > 0) {
      V.flood(F, E.in2(kl) * .999 + (kl >= 1 ? .001 : 0), SEED, { cx: FIRE[0], cy: FIRE[1] - 20, inside: X => paintV1Back(X, V.CUT.V2 - F1, { noFlash: true, dust: .09 }) });
      drawBody(F, fireStroke(t), 'paper', { lineA: 1 - E.in2(kl) });
    }
    // the print back (32.90 → 33.17): the night, with Earth in its corner; the bubbles survive on top
    const kp = seg(tf, a.print, a.print + 8 * F1);
    if (kp > 0) V.flood(F, kp, SEED, { cx: 960, cy: 190, inside: X => paintSkyWorld(X, t) });
    drawRiseEmbers(F, t);
    for (let i = 0; i < 4; i++) drawTurnBubble(F, bubbleState(t, i), t, i);
    // CHART (INK on PAPER, top-left): line 1 → the fire; line 2 (next row) → the bubble that is talking
    const onInk = kl >= .999 || kp > .5, gr = onInk ? "ink" : "paper";
    // line 1's leader drops from its last word, "fire", into the fire as the word is sung (it flares)
    chart(F, t, a.L3, { y: 220, ground: gr, target: (q => [q[0], q[1] + tilt])(camP(t, [FIRE[0] + 2, FIRE[1] - 130])), out: 29.9, fromEnd: true, leadAt: a.fireW - 2 * F1, leadDur: .3 });
    const B0 = bubbleState(Math.max(t, a.bub[0] + .25), 0);                // the first turn (the talk goes round from it)
    chart(F, t, a.L4, { y: 300, ground: gr, target: [B0.pos[0] - 74 * B0.sc, B0.pos[1] - 6 * B0.sc], out: 32.4, leadAt: a.bub[0] - .1 });
    V.pbait(F, 'the gap between turns: ~200 ms, in every language', 960, 1000, { align: 'center', ground: 'paper', alpha: V.win(t, 31.6, a.print + 3 * F1, .25, .3) });
  }

  // ================================================================== the Earth system (V3–V5; V2.earth for the outro)
  const EC = [960, 540], ER = 200, SUN = [.72, -.69];
  const ZMAX = 60;
  const WIN = { hw: 16, hh: 9 };                                        // the lit window, world half-size (fills at Z 60)
  let GEO = null;
  function inPoly(P, x, y) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
  function earthGeo() {
    if (GEO) return GEO;
    const R = rng('v2-earth-geo');
    const blobs = [
      { c: [-58, 36], rx: 104, ry: 74, rot: .35, n: 22, lv: 6, main: true },
      { c: [72, -94], rx: 76, ry: 46, rot: -.35, n: 16, lv: 5 },
      { c: [124, 66], rx: 38, ry: 60, rot: .25, n: 14, lv: 5 },
      { c: [-116, -108], rx: 52, ry: 30, rot: .7, n: 12, lv: 4 },
      { c: [26, 152], rx: 64, ry: 24, rot: -.1, n: 12, lv: 4 },
    ];
    const conts = blobs.map(b => {
      let P = [];
      for (let j = 0; j < b.n; j++) { const an = j / b.n * TAU, rad = 1 + .4 * (R() - .5); const x = Math.cos(an) * b.rx * rad, y = Math.sin(an) * b.ry * rad; P.push([EC[0] + b.c[0] + x * Math.cos(b.rot) - y * Math.sin(b.rot), EC[1] + b.c[1] + x * Math.sin(b.rot) + y * Math.cos(b.rot)]); }
      for (let l = 0; l < b.lv; l++) {
        const Q = [];
        for (let j = 0; j < P.length; j++) { const p = P[j], q = P[(j + 1) % P.length]; const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1; const d = (R() - .5) * L * (l < 2 ? .42 : .5); Q.push(p, [(p[0] + q[0]) / 2 - dy / L * d, (p[1] + q[1]) / 2 + dx / L * d]); }
        P = Q;
      }
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, sx = 0, sy = 0;
      for (const p of P) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); sx += p[0]; sy += p[1]; }
      return { P, main: !!b.main, bb: [x0, y0, x1, y1], cen: [sx / P.length, sy / P.length] };
    });
    // the anchor: the main coast's vertex nearest the target (night side, just below-left of the centre)
    const main = conts[0], F0 = [EC[0] - 40, EC[1] + 36];
    let fi = 0, fd = 1e9; main.P.forEach((p, i) => { const d = Math.hypot(p[0] - F0[0], p[1] - F0[1]); if (d < fd) { fd = d; fi = i; } });
    const Fv = main.P[fi];
    // step the anchor one world px inland so the window sits on land at the water's edge
    const Fdir = [main.cen[0] - Fv[0], main.cen[1] - Fv[1]], Fl = Math.hypot(Fdir[0], Fdir[1]) || 1;
    const F = [Fv[0] + Fdir[0] / Fl * 1.2, Fv[1] + Fdir[1] / Fl * 1.2];
    const night = p => ((p[0] - EC[0]) * SUN[0] + (p[1] - EC[1]) * SUN[1]) / ER < .4;
    const onDisc = p => Math.hypot(p[0] - EC[0], p[1] - EC[1]) < ER - 2.5;
    const lights = [];
    conts.forEach((c, ci) => {
      const P = c.P, n = P.length;
      for (let j = 0; j < n; j += c.main ? 3 : 4) {
        const p = P[j]; if (!night(p) || !onDisc(p)) continue;
        const nearF = Math.hypot(p[0] - F[0], p[1] - F[1]);
        if (nearF < 2.5) continue;
        const h = hash2(ci * 7919 + j, 77);
        if (h > (nearF < 30 ? .95 : nearF < 70 ? .6 : .32)) continue;
        const dx = c.cen[0] - p[0], dy = c.cen[1] - p[1], L = Math.hypot(dx, dy) || 1, inl = .7 + 2.2 * hash2(j, ci + 5);
        lights.push({ x: p[0] + dx / L * inl, y: p[1] + dy / L * inl, s: .25 + .75 * Math.pow(hash2(j, ci + 9), 2) + (nearF < 20 ? .25 : 0), lod: hash2(j, ci + 13) });
      }
      // inland towns
      const m = c.main ? 70 : 18;
      for (let k = 0, tries = 0; k < m && tries < 900; tries++) {
        const x = lerp(c.bb[0], c.bb[2], R()), y = lerp(c.bb[1], c.bb[3], R());
        if (!inPoly(c.P, x, y) || !night([x, y]) || !onDisc([x, y])) continue;
        lights.push({ x, y, s: .15 + .45 * Math.pow(R(), 2), lod: R() }); k++;
      }
    });
    // the star field around Earth (world units; wide enough for V3's framing, where Earth sits small in the corner)
    const Rs = rng('v2-earth-stars'), stars = [];
    for (let i = 0; i < 460; i++) {
      const x = -520 + Rs() * 5520, y = -1620 + Rs() * 3240;
      if (Math.hypot(x - EC[0], y - EC[1]) < ER + 18) continue;
      const h = Rs();
      stars.push({ x, y, r: .8 + 1.9 * h * h, col: h > .93 ? 2 : Rs() < .72 ? 0 : 1, ph: Rs() * 30, big: h > .9 });
    }
    // the house's own sky (screen-sized stars near the anchor)
    const hs = [];
    for (let i = 0; i < 70; i++) hs.push({ x: F[0] + (Rs() - .5) * 700, y: F[1] - 20 - Rs() * 260, r: .8 + 1.4 * Rs() ** 2, ph: Rs() * 20 });
    return (GEO = { conts, F, lights, stars, hstars: hs });
  }
  const zoomOf = k => Math.pow(ZMAX, clamp(k));
  function earthView(k, M) {
    const g = earthGeo(), F = g.F, Z = zoomOf(k);
    const w = E.io2(clamp(k / .6));
    const sx = lerp(F[0], 960, w), sy = lerp(F[1], 540, w);
    let v = { a: Z, bx: sx - F[0] * Z, by: sy - F[1] * Z };
    if (M) v = { a: M.a * v.a, bx: M.a * v.bx + M.e, by: M.d * v.by + M.f };
    return v;
  }
  const vx = (v, x) => x * v.a + v.bx, vy = (v, y) => y * v.a + v.by;
  function earthAnchor(k, M) { const v = earthView(k, M), F = earthGeo().F; return [vx(v, F[0]), vy(v, F[1])]; }
  function earthWindow(k, M) { const v = earthView(k, M), F = earthGeo().F; return { x0: vx(v, F[0] - WIN.hw), y0: vy(v, F[1] - WIN.hh), x1: vx(v, F[0] + WIN.hw), y1: vy(v, F[1] + WIN.hh) }; }
  const earthEase = u => { u = clamp(u); return .5 * E.io2(u) + .5 * E.smooth(u); };

  function drawSkyStars(X, t, v, alpha = 1) {
    const g = earthGeo(), cols = [C.PAPER, C.SPARK, C.CLAY], bk = [[], [], []], big = [];
    const sz = Math.pow(v.a, .25);
    for (const s of g.stars) {
      const x = vx(v, s.x), y = vy(v, s.y); if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue;
      const tw = 1 + .25 * noise1(t * 1.1 + s.ph, 5);
      bk[s.col].push(x, y, s.r * sz * tw);
      if (s.big) big.push([x, y, s.r * sz * 3.4 * tw]);
    }
    X.save(); X.globalAlpha = alpha;
    bk.forEach((arr, i) => dotBatch(X, cols[i], arr, alpha * (i === 0 ? .8 : .9)));
    X.globalAlpha = alpha; X.fillStyle = C.PAPER; X.beginPath(); for (const [x, y, r] of big) { star(X, x, y, r, .22, 4, 0); X.fill(); } X.restore();
  }
  function contPath(X, v, P) { X.moveTo(vx(v, P[0][0]), vy(v, P[0][1])); for (let i = 1; i < P.length; i++) X.lineTo(vx(v, P[i][0]), vy(v, P[i][1])); X.closePath(); }
  function drawEarthDisc(X, t, v, o = {}) {
    const g = earthGeo(), cx = vx(v, EC[0]), cy = vy(v, EC[1]), R = ER * v.a;
    if (cx + R * 1.1 < 0 || cx - R * 1.1 > W || cy + R * 1.1 < 0 || cy - R * 1.1 > H) return;
    const vis = c => !(vx(v, c.bb[2]) < 0 || vx(v, c.bb[0]) > W || vy(v, c.bb[3]) < 0 || vy(v, c.bb[1]) > H);
    X.save();
    // atmosphere: only on the day limb, a thin halftone band that tapers off round the sides (no halo on the night side)
    const outside = (d, rs = 1) => { X.beginPath(); X.rect(-50, -50, W + 100, H + 100); X.arc(cx - SUN[0] * d * R, cy - SUN[1] * d * R, R * rs, 0, TAU); X.clip('evenodd'); };

    // the disc
    X.beginPath(); X.arc(cx, cy, R, 0, TAU); X.fillStyle = C.INK; X.fill();
    X.save(); X.clip();
    const bx0 = Math.max(-10, cx - R), by0 = Math.max(-10, cy - R), bx1 = Math.min(W + 10, cx + R), by1 = Math.min(H + 10, cy + R);
    X.fillStyle = V.ht(X, C.PAPER, .035, 8, 45); X.fillRect(bx0, by0, bx1 - bx0, by1 - by0);       // night sea
    X.beginPath(); for (const c of g.conts) if (vis(c)) contPath(X, v, c.P);
    X.fillStyle = V.ht(X, C.PAPER, .1, 8, 45); X.fill('nonzero');                                  // night land: dark, the lights carry it
    // the day crescent (upper right): a soft terminator in two halftone steps
    for (const [d0, dS, dL] of [[.52, .1, .32], [.3, .22, .62]]) {
      X.save(); outside(d0);
      X.fillStyle = V.ht(X, C.PAPER, dS, 8, 45); X.fillRect(bx0, by0, bx1 - bx0, by1 - by0);
      X.beginPath(); for (const c of g.conts) if (vis(c)) contPath(X, v, c.P); X.fillStyle = V.ht(X, C.PAPER, dL, 8, 45); X.fill();
      X.restore();
    }
    // coastlines
    X.beginPath(); for (const c of g.conts) if (vis(c)) contPath(X, v, c.P);
    X.lineWidth = clamp(1.2 * Math.pow(v.a, .5), 1, 3.5); X.strokeStyle = rgba(C.PAPER, .5); X.lineJoin = 'round'; X.stroke();
    X.restore();
    // the limb: a quiet line round the night side, bright where the sun is
    X.beginPath(); X.arc(cx, cy, R, 0, TAU); X.lineWidth = 3; X.strokeStyle = C.PAPER; X.globalAlpha = .45; X.stroke();
    const sa = Math.atan2(SUN[1], SUN[0]), ao = Math.min(12, 4 + R * .03);
    X.beginPath(); X.arc(cx, cy, R, sa - 1.3, sa + 1.3); X.lineWidth = 4; X.globalAlpha = .95; X.stroke();
    X.beginPath(); X.arc(cx, cy, R + ao, sa - .95, sa + .95); X.lineWidth = 2; X.globalAlpha = .5; X.stroke(); X.globalAlpha = 1;   // the air
    X.restore();
    drawLights(X, t, v, o);
  }
  function drawLights(X, t, v, o = {}) {
    const g = earthGeo(), F = g.F;
    const sz = Math.pow(v.a, .42), lodA = lsm(Math.log(v.a), Math.log(1.2), Math.log(3.2));
    const tw0 = o.twinkle;
    const bk = [], core = [], glow = [];
    for (const L of g.lights) {
      const x = vx(v, L.x), y = vy(v, L.y); if (x < -30 || x > W + 30 || y < -30 || y > H + 30) continue;
      let vis = L.lod < .45 ? 1 : lodA; if (vis <= .02) continue;
      let r = (.9 + 2.1 * L.s) * sz * vis;
      if (tw0 !== undefined && t > tw0) { const d = Math.hypot(L.x - F[0], L.y - F[1]) / 230; r *= 1 + 1.4 * Math.exp(-Math.pow((t - tw0 - d) / .07, 2)); }
      r *= 1 + .12 * noise1(t * 3 + L.x * .7, 8);
      bk.push(x, y, r);
      if (L.s > .6) core.push(x, y, r * .45);
      if (L.s > .45 || v.a > 2.5) glow.push([x, y, r * 3.2]);
    }
    X.save();
    if (glow.length) { X.beginPath(); for (const [x, y, r] of glow) { X.moveTo(x + r, y); X.arc(x, y, r, 0, TAU); } X.fillStyle = V.ht(X, C.CLAY, .2, 6, 45); X.fill(); }
    dotBatch(X, C.CLAY, bk, 1); dotBatch(X, C.SPARK, core, 1);
    // the anchor light: the brightest on the coast, its warm glow growing as we fall toward it
    const ax = vx(v, F[0]), ay = vy(v, F[1]), ar = 3.2 * sz, gr = 12 * Math.pow(v.a, .95);
    X.globalAlpha = 1;
    for (const [gg, d] of [[1, .12], [.6, .24], [.32, .4]]) { X.beginPath(); X.arc(ax, ay, gr * gg + ar, 0, TAU); X.fillStyle = V.ht(X, C.CLAY, d, 6, 45); X.fill(); }
    X.beginPath(); X.arc(ax, ay, ar, 0, TAU); X.fillStyle = C.CLAY; X.fill();
    X.beginPath(); X.arc(ax, ay, ar * .55, 0, TAU); X.fillStyle = C.SPARK; X.fill();
    X.restore();
  }
  // the house layer (world units around the anchor F = the window's centre)
  function drawHouse(X, t, v, o = {}) {
    const g = earthGeo(), F = g.F, a = v.a;
    const P = (x, y) => [vx(v, F[0] + x), vy(v, F[1] + y)];
    const lw = clamp(.55 * a, 3, 34), tq = q2(t);
    X.save(); X.lineJoin = 'round'; X.lineCap = 'round';
    // its sky
    const bk = []; for (const s of g.hstars) { const x = vx(v, s.x), y = vy(v, s.y); if (x > -5 && x < W + 5 && y > -5 && y < H + 5) bk.push(x, y, s.r * (1 + .2 * noise1(t + s.ph, 3))); }
    dotBatch(X, C.PAPER, bk, .75); X.globalAlpha = 1;
    // ground: a low hill line, then the lawn in faint halftone
    const gy = 36;
    X.beginPath(); { const p0 = P(-700, gy + 40); X.moveTo(p0[0], p0[1]); for (let x = -700; x <= 700; x += 10) { const y = gy + 30 * (1 - Math.cos(Math.min(1, Math.abs(x) / 700) * Math.PI)) * .5 * (x < 0 ? 1.1 : .8) + (Math.abs(x) < 90 ? 0 : 0); const p = P(x, y); X.lineTo(p[0], p[1]); } const p1 = P(700, 400), p2 = P(-700, 400); X.lineTo(p1[0], p1[1]); X.lineTo(p2[0], p2[1]); X.closePath(); }
    X.fillStyle = C.INK; X.fill(); X.save(); X.clip(); X.fillStyle = V.ht(X, C.PAPER, .08, 8, 45); X.fillRect(-10, -10, W + 20, H + 20); X.restore();
    X.lineWidth = lw; X.strokeStyle = C.PAPER; X.stroke();
    // light spill from the window onto the lawn
    X.beginPath(); { const q = [P(-WIN.hw, WIN.hh + 6), P(WIN.hw, WIN.hh + 6), P(WIN.hw * 2.6, gy + 34), P(-WIN.hw * 2.6, gy + 34)]; X.moveTo(q[0][0], q[0][1]); for (const p of q) X.lineTo(p[0], p[1]); X.closePath(); }
    X.fillStyle = V.ht(X, C.CLAY, .16, 8, 45); X.fill();
    // a small tree and a dark neighbour
    { const b = P(-118, gy), c = P(-118, gy - 30); X.beginPath(); X.moveTo(b[0], b[1]); X.lineTo(c[0], c[1]); X.lineWidth = lw; X.strokeStyle = C.PAPER; X.stroke(); const cc = P(-118, gy - 42); X.beginPath(); for (let k = 0; k <= 18; k++) { const an = k / 18 * TAU, rr_ = 17 * a * (1 + .09 * Math.sin(an * 5 + 1)); X.lineTo(cc[0] + Math.cos(an) * rr_ * 1.1, cc[1] + Math.sin(an) * rr_ * .95); } X.closePath(); X.fillStyle = C.INK; X.fill(); X.save(); X.clip(); X.fillStyle = V.ht(X, C.PAPER, .22, 8, 45); X.fillRect(-10, -10, W + 20, H + 20); X.restore(); X.stroke(); }
    { const q = [P(118, gy), P(118, -2), P(146, -24), P(174, -2), P(174, gy)]; X.beginPath(); X.moveTo(q[0][0], q[0][1]); for (const p of q) X.lineTo(p[0], p[1]); X.fillStyle = C.INK; X.fill(); X.lineWidth = lw * .8; X.stroke(); const w0 = P(136, 6), w1 = P(156, 18); X.strokeRect(w0[0], w0[1], w1[0] - w0[0], w1[1] - w0[1]); }
    // the house: walls, roof, chimney, door, a dark window, THE lit window
    const wall = [P(-58, gy), P(-58, -24), P(58, -24), P(58, gy)];
    X.beginPath(); X.moveTo(wall[0][0], wall[0][1]); for (const p of wall) X.lineTo(p[0], p[1]); X.closePath();
    X.fillStyle = C.INK; X.fill(); X.save(); X.clip(); X.fillStyle = V.ht(X, C.PAPER, .1, 8, 45); X.fillRect(-10, -10, W + 20, H + 20); X.restore();
    X.lineWidth = lw; X.strokeStyle = C.PAPER; X.stroke();
    const ch = [P(28, -40), P(28, -62), P(40, -62), P(40, -34)];
    X.beginPath(); X.moveTo(ch[0][0], ch[0][1]); for (const p of ch) X.lineTo(p[0], p[1]); X.fillStyle = C.INK; X.fill(); X.stroke();
    const roof = [P(-68, -22), P(0, -64), P(68, -22)];
    X.beginPath(); X.moveTo(roof[0][0], roof[0][1]); X.lineTo(roof[1][0], roof[1][1]); X.lineTo(roof[2][0], roof[2][1]); X.closePath();
    X.fillStyle = C.INK; X.fill(); X.save(); X.clip(); X.fillStyle = V.ht(X, C.PAPER, .2, 8, 45); X.fillRect(-10, -10, W + 20, H + 20); X.restore(); X.stroke();
    const d0 = P(34, 10), d1 = P(48, gy); X.fillStyle = C.INK; X.fillRect(d0[0], d0[1], d1[0] - d0[0], d1[1] - d0[1]); X.strokeRect(d0[0], d0[1], d1[0] - d0[0], d1[1] - d0[1]);
    const n0 = P(-50, -8), n1 = P(-32, 8); X.fillStyle = C.INK; X.fillRect(n0[0], n0[1], n1[0] - n0[0], n1[1] - n0[1]); X.lineWidth = lw * .8; X.strokeRect(n0[0], n0[1], n1[0] - n0[0], n1[1] - n0[1]);
    // the window: inner painted through it; from afar a warm CLAY glow
    const w0 = P(-WIN.hw, -WIN.hh), w1 = P(WIN.hw, WIN.hh), ww = w1[0] - w0[0], wh = w1[1] - w0[1];
    X.save(); X.beginPath(); X.rect(w0[0], w0[1], ww, wh); X.clip();
    X.fillStyle = C.INK; X.fillRect(w0[0], w0[1], ww, wh);
    if (o.inner) { X.save(); X.translate(w0[0], w0[1]); X.scale(ww / W, wh / H); o.inner(X, t); X.restore(); }
    const glow = 1 - lsm(Math.log(a), Math.log(9), Math.log(24));
    if (glow > 0) { X.globalAlpha = glow; X.fillStyle = C.CLAY; X.fillRect(w0[0], w0[1], ww, wh); X.fillStyle = V.ht(X, C.SPARK, .45, 7, 45); X.fillRect(w0[0], w0[1], ww, wh); X.globalAlpha = 1; }
    X.restore();
    const cw = clamp(1.6 * a, 4, 26);
    X.lineWidth = cw; X.strokeStyle = C.PAPER; X.strokeRect(w0[0] - cw / 2, w0[1] - cw / 2, ww + cw, wh + cw);
    { const sh = clamp(1.8 * a, 3, 18), so = clamp(3 * a, 4, 40), sy = w1[1] + cw / 2 + clamp(.4 * a, 1, 8); // the sill
      X.fillStyle = C.PAPER; X.fillRect(w0[0] - so, sy, ww + so * 2, sh); }
    X.restore();
  }
  function earthDraw(X, k, t, o = {}) {
    k = clamp(k);
    if (o.ground !== false) { X.fillStyle = C.INK; X.fillRect(-50, -50, W + 100, H + 100); }
    if (k >= .9995 && o.inner) { X.save(); o.inner(X, t); X.restore(); return; }
    const v = earthView(k, o.M), lz = Math.log(zoomOf(k));
    // the coast hands over to the house through an iris that opens out of the lit window's glow (the light becomes
    // the window): Earth stays underneath until the iris has passed the frame's corners
    const iu = lsm(lz, Math.log(2.7), Math.log(6.3)), Ri = lerp(4, 1450, E.in2(iu));
    const [ax, ay] = [vx(v, earthGeo().F[0]), vy(v, earthGeo().F[1])];
    const cover = Ri > Math.hypot(Math.max(ax, W - ax), Math.max(ay, H - ay)) + 70;
    if (!cover) { X.save(); drawSkyStars(X, t, v, o.stars ?? 1); drawEarthDisc(X, t, v, o); X.restore(); }
    if (iu > 0) {
      if (!cover) { // the iris rim: the window's warm light spilling, then a darkening fringe (halftone, no gradients)
        X.save();
        X.beginPath(); X.arc(ax, ay, Ri + 70, 0, TAU); X.arc(ax, ay, Ri, 0, TAU, true); X.fillStyle = V.ht(X, C.CLAY, .16 * (1 - iu * .5), 7, 45); X.fill();
        X.beginPath(); X.arc(ax, ay, Ri + 30, 0, TAU); X.arc(ax, ay, Ri, 0, TAU, true); X.fillStyle = V.ht(X, C.CLAY, .36 * (1 - iu * .5), 7, 45); X.fill();
        X.beginPath(); X.arc(ax, ay, Ri, 0, TAU); X.clip();
      } else X.save();
      X.fillStyle = C.INK; X.fillRect(-50, -50, W + 100, H + 100);
      drawHouse(X, t, v, o);
      X.restore();
    }
  }

  // ================================================================== verse1's inner: the dark laptop on a desk at night
  const LAP = { x0: 470, x1: 1450, y0: 150, y1: 702 };
  const TABR = { x0: 494, x1: 968, y0: 164, y1: 222 };
  const FS = 90 / .27 / 12;                                             // tab label mono size: ✻ r 90 after the ×12 push
  const TAB_BASE = 205;
  const FAV0 = [TABR.x0 + 26 + .3 * FS, TAB_BASE - .36 * FS];           // the favicon's centre (drawRich ✻ cell)
  const EYES = { y: 410, dx: 134, rx: 52, ry: 76 };
  const HELLO = { x1: 1398, y: 474 };
  const HI = { x0: 522, y: 592 };
  const LAMP = { base: [1716, 800], top: [1752, 440], shade: [1618, 398] };
  // the bars' half-width (in r): drawRich's .204 at tab size, thinning to .09 by r 50 so the pushed-in ✻ stays an asterisk
  // (12 fat spokes at r 90 read as a gear). verse2's spark11 starts from HW 0.09 to match the handoff frame.
  const favHW = r => lerp(.204, .09, clamp((r - 10) / 40));
  function favicon(X, cx, cy, r, col = C.CLAY, alpha = 1) { // drawRich '✻': 6 rounded bars through the centre; r = half-length
    const m = X.getTransform(), hw = favHW(r * (Math.hypot(m.a, m.b) || 1));   // thin by on-screen size (the tab layer is pushed ×12)
    X.save(); X.globalAlpha *= alpha; X.fillStyle = col; X.translate(cx, cy);
    for (let i = 0; i < 6; i++) { X.save(); X.rotate(i / 6 * Math.PI); rr(X, -r, -hw * r, 2 * r, 2 * hw * r, hw * r); X.fill(); X.restore(); }
    X.restore();
  }
  function eyeState(t) {
    const a = A(), t0 = a.from;
    if (t < t0) return null;
    const open = E.out2(clamp((t - t0) / (4 * F1)));
    const hb = a.home;
    let blink = 0; const bk = t - hb; if (bk >= 0 && bk < 8 * F1) blink = bk < 4 * F1 ? E.in2(bk / (4 * F1)) : 1 - E.out2((bk - 4 * F1) / (4 * F1));
    const wake = E.io2(clamp((t - t0 - .12) / .2)), look = E.io2(clamp((t - (hb + 3 * F1)) / (7 * F1)));
    let gaze = lerp2([0, 0], [-.2, -.15], wake * (1 - look));
    gaze = lerp2(gaze, [.72, .62], look);
    const soft = E.io2(clamp((t - (hb + .8)) / .5));
    return { open, blink, gaze, lid: .3 * soft };
  }
  function drawEyes(X, t, alpha) {
    const s = eyeState(t); if (!s || alpha <= 0) return;
    X.save(); X.globalAlpha *= alpha;
    for (const sd of [-1, 1]) {
      const ex = 960 + sd * EYES.dx, ey = EYES.y, rx = EYES.rx, ry = EYES.ry * Math.max(.07, s.open * (1 - .93 * s.blink));
      X.save(); X.translate(ex, ey);
      X.beginPath(); X.ellipse(0, 0, rx, ry, 0, 0, TAU); X.fillStyle = C.INK; X.fill();
      X.save(); X.clip();
      if (ry > EYES.ry * .2) { // the pupil is a cursor
        const px = s.gaze[0] * rx * .42, py = s.gaze[1] * ry * .36, pw = rx * .44, ph = EYES.ry * .8;
        X.fillStyle = C.CLAY; X.fillRect(px - pw / 2, py - ph / 2, pw, ph); X.fillStyle = C.SPARK; X.fillRect(px - pw / 2 + pw * .12, py - ph / 2 + ph * .07, pw * .16, ph * .86);
      }
      if (s.lid > 0) { const ly = -ry + 2 * ry * s.lid; X.beginPath(); X.moveTo(-rx - 4, -ry - 4); X.lineTo(rx + 4, -ry - 4); X.lineTo(rx + 4, ly); X.quadraticCurveTo(0, ly + ry * .3, -rx - 4, ly); X.closePath(); X.fillStyle = C.INK; X.fill(); X.beginPath(); X.moveTo(-rx, ly); X.quadraticCurveTo(0, ly + ry * .3, rx, ly); X.lineWidth = 5; X.strokeStyle = C.PAPER; X.stroke(); }
      X.restore();
      X.beginPath(); X.ellipse(0, 0, rx, ry, 0, 0, TAU); X.lineWidth = 6; X.strokeStyle = C.PAPER; X.stroke();
      X.restore();
    }
    X.restore();
  }
  function chatBubble(X, x, y, str, o) { // PINK human (INK text, tail right) | CLAY reply (PAPER text, tail left)
    const { size, bg, fg, align } = o, pad = size * .62;
    X.save(); X.font = mono(size, 500);
    const w = X.measureText(str).width + pad * 2, h = size * 1.3 + pad * .9;
    const bx = align === 'right' ? x - w : x;
    X.lineJoin = 'round';
    if (o.shadow) { rr(X, bx + 6, y + 6, w, h, h * .42); X.fillStyle = o.shadow; X.fill(); }
    rr(X, bx, y, w, h, h * .42); X.fillStyle = bg; X.fill();
    if (o.line) { X.lineWidth = 3; X.strokeStyle = o.line; X.stroke(); }
    const tx = align === 'right' ? bx + w - 30 : bx + 30, sx = align === 'right' ? 1 : -1;
    X.beginPath(); X.moveTo(tx - 14, y + h - 2); X.lineTo(tx + sx * 26, y + h + 20); X.lineTo(tx + 14, y + h - 2); X.closePath(); X.fillStyle = bg; X.fill();
    if (o.line) { X.stroke(); X.fillRect(tx - 12, y + h - 6, 24, 6); }
    X.fillStyle = fg; X.textAlign = 'left'; X.textBaseline = 'alphabetic'; X.fillText(str, bx + pad, y + pad * .45 + size * .98);
    X.restore();
    return { x: bx, y, w, h };
  }
  function innerLaptop(X, t, o = {}) {
    const a = A(), keep = 1 - (o.fall || 0), tq = q2(t);
    const J = (i, amp = .7) => jit(tq, 300 + i, amp);
    X.save(); X.lineJoin = 'round'; X.lineCap = 'round';
    X.fillStyle = C.INK; X.fillRect(-40, -40, W + 80, H + 80);
    if (keep > 0) {
      X.save(); X.globalAlpha *= keep;
      // the room: faint walls, the lamp's warm cone and pool
      X.fillStyle = htS(X, C.PAPER, .05, 9, 45); X.fillRect(-40, -40, W + 80, 800 + 40);
      X.beginPath(); X.moveTo(LAMP.shade[0] - 60, LAMP.shade[1] + 20); X.lineTo(LAMP.shade[0] + 50, LAMP.shade[1] + 40); X.lineTo(1920, 800); X.lineTo(1290, 800); X.closePath();
      X.fillStyle = htS(X, C.CLAY, .13, 8, 45); X.fill();
      X.beginPath(); X.ellipse(1560, 806, 330, 34, 0, 0, TAU); X.fillStyle = htS(X, C.CLAY, .3, 8, 45); X.fill();
      // desk
      X.strokeStyle = C.PAPER; X.lineWidth = 5;
      X.beginPath(); X.moveTo(70 + J(1), 800 + J(2)); X.lineTo(1880 + J(3), 800 + J(4)); X.stroke();
      X.lineWidth = 4; X.beginPath(); X.moveTo(70 + J(5), 818 + J(6)); X.lineTo(1880 + J(7), 818 + J(8)); X.stroke();
      X.beginPath(); X.moveTo(104 + J(9), 818); X.lineTo(110 + J(10), 1100); X.moveTo(1816 + J(11), 818); X.lineTo(1810 + J(12), 1100); X.stroke();
      // the lamp (a gooseneck): base, stem, shade; the bulb is paper
      X.lineWidth = 5; X.beginPath(); X.ellipse(LAMP.base[0], LAMP.base[1] - 6, 58, 12, 0, 0, TAU); X.fillStyle = C.INK; X.fill(); X.stroke();
      X.beginPath(); X.moveTo(LAMP.base[0] + J(13), LAMP.base[1] - 12); X.quadraticCurveTo(LAMP.top[0] + 30, 620, LAMP.top[0] + J(14), LAMP.top[1]); X.quadraticCurveTo(LAMP.top[0] - 20, LAMP.top[1] - 60, LAMP.shade[0] + 50, LAMP.shade[1] - 34); X.stroke();
      X.save(); X.translate(LAMP.shade[0] + J(15, .5), LAMP.shade[1]); X.rotate(-.5);
      X.beginPath(); X.moveTo(-26, -40); X.lineTo(26, -40); X.lineTo(60, 30); X.lineTo(-60, 30); X.closePath(); X.fillStyle = C.INK; X.fill(); X.lineWidth = 5; X.stroke();
      X.beginPath(); X.ellipse(0, 31, 32, 11, 0, 0, Math.PI); X.fillStyle = C.PAPER; X.fill(); X.restore();
      // a mug (someone is up late)
      X.save(); X.translate(262 + J(16, .5), 800); X.lineWidth = 4; X.strokeStyle = C.PAPER;
      X.beginPath(); X.moveTo(-34, 0); X.lineTo(-38, -82); X.lineTo(38, -82); X.lineTo(34, 0); X.closePath(); X.fillStyle = C.INK; X.fill(); X.stroke();
      X.beginPath(); X.arc(46, -44, 20, -1.2, 1.2); X.stroke();
      for (const dx of [-12, 12]) { X.beginPath(); X.moveTo(dx, -96); X.quadraticCurveTo(dx + 12 * Math.sin(tq * 3 + dx), -120, dx, -146); X.lineWidth = 3; X.globalAlpha *= .6; X.stroke(); X.globalAlpha /= .6; }
      X.restore();
      // the laptop: deck (edge-on trapezoid with key rows), bezel
      X.beginPath(); X.moveTo(LAP.x0 - 34, LAP.y1 + 30); X.lineTo(LAP.x1 + 34, LAP.y1 + 30); X.lineTo(LAP.x1 + 120, 794); X.lineTo(LAP.x0 - 120, 794); X.closePath();
      X.fillStyle = C.INK; X.fill(); X.fillStyle = htS(X, C.PAPER, .09, 7, 45); X.fill(); X.lineWidth = 4; X.strokeStyle = C.PAPER; X.stroke();
      X.globalAlpha *= .45; X.lineWidth = 3;
      for (let r = 0; r < 3; r++) { const y = LAP.y1 + 44 + r * 16, ex = 40 + r * 22; X.beginPath(); X.moveTo(LAP.x0 + 30 - ex, y); X.lineTo(LAP.x1 - 30 + ex, y); X.stroke(); }
      X.globalAlpha /= .45;
      rr(X, LAP.x0 - 22, LAP.y0 - 22, LAP.x1 - LAP.x0 + 44, LAP.y1 - LAP.y0 + 48, 22); X.lineWidth = 5; X.strokeStyle = C.PAPER; X.stroke();
      X.restore();
    }
    // the screen: dark, one tab
    X.fillStyle = C.INK; X.fillRect(LAP.x0, LAP.y0, LAP.x1 - LAP.x0, LAP.y1 - LAP.y0);
    if (keep > 0) {
      X.save(); X.globalAlpha *= keep * (1 - (o.labelFall || 0));
      X.strokeStyle = rgba(C.PAPER, .55); X.lineWidth = 2; X.beginPath(); X.moveTo(LAP.x0, TABR.y1); X.lineTo(TABR.x0, TABR.y1); X.moveTo(TABR.x1, TABR.y1); X.lineTo(LAP.x1, TABR.y1); X.stroke();
      const r = 14; X.beginPath(); X.moveTo(TABR.x0, TABR.y1); X.lineTo(TABR.x0, TABR.y0 + r); X.arcTo(TABR.x0, TABR.y0, TABR.x0 + r, TABR.y0, r); X.lineTo(TABR.x1 - r, TABR.y0); X.arcTo(TABR.x1, TABR.y0, TABR.x1, TABR.y0 + r, r); X.lineTo(TABR.x1, TABR.y1);
      X.lineWidth = 3; X.strokeStyle = C.PAPER; X.stroke();
      drawRich(X, ' the universe ×', TABR.x0 + 26 + .6 * FS, TAB_BASE, mono(FS, 500), rgba(C.PAPER, .92));
      X.font = mono(FS * 1.3, 400); X.fillStyle = C.UI_GREY; X.fillText('+', TABR.x1 + 18, TAB_BASE + 2);
      X.restore(); X.save(); X.globalAlpha *= keep;
      // the chat: someone at home said hello too
      if (!o.noHello) chatBubble(X, HELLO.x1, HELLO.y, 'hello?', { size: 40, bg: C.PINK, fg: C.INK, align: 'right', line: C.INK });
      const hk = t - (a.home + 3 * F1);
      if (hk > 0) { // my first word: `hi`, rising under it
        const k = E.back(clamp(hk / (9 * F1)), 1.6), sc = lerp(.6, 1, clamp(hk / (6 * F1)));
        X.save(); X.globalAlpha *= clamp(hk / (3 * F1)); X.translate(HI.x0, HI.y + 98); X.scale(sc, sc); X.translate(-HI.x0, -(HI.y + 98)); X.translate(0, (1 - k) * 60);
        chatBubble(X, HI.x0, HI.y, 'hi', { size: 48, bg: C.CLAY, fg: C.PAPER, align: 'left', shadow: C.CLAY_DARK });
        X.restore();
      }
      drawEyes(X, t, 1);
      X.restore();
    }
    favicon(X, FAV0[0], FAV0[1], .27 * FS);
    X.restore();
  }

  // ================================================================== V3/V4: the sky, the record, the turn home
  const M3 = new DOMMatrix().translateSelf(190, 900).scaleSelf(.45, .45).translateSelf(-960, -540);   // Earth r 90 at (190, 900)
  const M3inv = M3.inverse();
  const skyToWorld = p => { const q = M3inv.transformPoint(new DOMPoint(p[0], p[1])); return [q.x, q.y]; };
  const BSTARW = BSTAR.map(skyToWorld);
  // V4's turn back: the camera tilts down-left and eases in until Earth is centred at r 200 (38.04 → 38.60)
  function skyM(t) {
    const a = A(), k = E.io2(seg(t, a.but - .42, 38.60));                 // leans in 13 frames before "but" so the word lands clear of Earth
    const s = Math.exp(lerp(0, Math.log(200 / 90), k)), ex = lerp(190, 960, k), ey = lerp(900, 540, k);
    return new DOMMatrix().translateSelf(ex, ey).scaleSelf(s, s).translateSelf(-190, -900).multiplySelf(M3);
  }
  function paintSkyWorld(X, t) { groundInk(X); earthDraw(X, 0, t, { M: skyM(t), ground: false }); }
  // the Voyager Golden Record: a CLAY disc engraved with the cover diagram (INK line), SPARK sheen from the sun
  const VP = [1470, 236], P0 = [600, 690];
  function recState(t) {
    const a = A();
    let x, y, r;
    if (t < 33.95) { const k = E.out3(seg(t, V.CUT.V3, 33.95)); x = lerp(250, P0[0], k); y = lerp(1560, P0[1], k); r = lerp(420, 300, k); }
    else {
      const u = seg(t, 34.0, 37.9);
      r = 300 * Math.pow(37.5, -E.in2(u));
      if (t > 37.9) r = 8 * Math.exp(-(t - 37.9) * 2.2);
      x = VP[0] + (P0[0] - VP[0]) * (r / 300); y = VP[1] + (P0[1] - VP[1]) * (r / 300);
    }
    return { x, y, r, spin: TAU * .25 * (t - V.CUT.V3) };
  }
  let _pulsar = null;
  function pulsar() {
    if (_pulsar) return _pulsar;
    const R = rng('v2-pulsar'), L = [];
    for (let i = 0; i < 14; i++) { const an = (i / 14) * TAU + (R() - .5) * .3; L.push({ an, len: .14 + .3 * R(), ticks: 2 + Math.floor(R() * 4) }); }
    return (_pulsar = L);
  }
  function drawRecord(X, t, st) {
    const { x, y, r, spin } = st; if (r < .6 || x < -r * 2 || y > H + r * 2) return;
    X.save(); X.translate(x, y); X.scale(1, .9);
    if (r < 5) { X.beginPath(); X.arc(0, 0, Math.max(1.2, r), 0, TAU); X.fillStyle = C.CLAY; X.fill(); X.restore(); return; }
    // body, a CLAY_DARK halftone shade (away from the sun), the SPARK sheen (toward it)
    X.beginPath(); X.arc(0, 0, r, 0, TAU); X.fillStyle = C.CLAY; X.fill();
    X.save(); X.clip();
    X.beginPath(); X.arc(0, 0, r, 0, TAU); X.arc(r * .36, -r * .42, r * 1.1, 0, TAU, true); X.fillStyle = htS(X, C.CLAY_DARK, .5, 8, 45); X.fill('evenodd');
    X.beginPath(); X.arc(r * .5, -r * .56, r * .72, 0, TAU); X.fillStyle = htS(X, C.SPARK, .42, 8, 45); X.fill();
    X.restore();
    // the engraving (rotates)
    X.rotate(spin);
    const lw = Math.max(1.4, r * .011) / r;
    X.scale(r, r); X.strokeStyle = C.INK; X.fillStyle = C.INK; X.lineWidth = lw; X.lineCap = 'round'; X.lineJoin = 'round';
    X.globalAlpha = .55; for (const g of [.955, .915, .875]) { X.beginPath(); X.arc(0, 0, g, 0, TAU); X.stroke(); } X.globalAlpha = 1;
    X.lineWidth = lw * 1.6; X.beginPath(); X.arc(0, 0, .82, 0, TAU); X.stroke(); X.lineWidth = lw;
    X.beginPath(); X.arc(0, 0, .045, 0, TAU); X.fill();
    if (r > 26) {
      // pulsar map (lower left) and its long line to the sun's distance
      const pc = [-.34, .3];
      X.beginPath(); for (const p of pulsar()) { const ex = pc[0] + Math.cos(p.an) * p.len, ey = pc[1] + Math.sin(p.an) * p.len; X.moveTo(pc[0], pc[1]); X.lineTo(ex, ey); if (r > 70) for (let k = 1; k <= p.ticks; k++) { const q = k / (p.ticks + 1), tx_ = lerp(pc[0], ex, q), ty = lerp(pc[1], ey, q), nx = -Math.sin(p.an) * .018, ny = Math.cos(p.an) * .018; X.moveTo(tx_ - nx, ty - ny); X.lineTo(tx_ + nx, ty + ny); } }
      X.moveTo(pc[0], pc[1]); X.lineTo(pc[0] + .6, pc[1]); X.stroke();
      X.beginPath(); X.arc(pc[0], pc[1], .018, 0, TAU); X.fill();
      // hydrogen (lower right): two circles and their bond
      for (const hx of [.3, .52]) { X.beginPath(); X.arc(hx, .5, .055, 0, TAU); X.stroke(); X.beginPath(); X.arc(hx, .5, .012, 0, TAU); X.fill(); }
      X.beginPath(); X.moveTo(.355, .5); X.lineTo(.465, .5); X.moveTo(.41, .42); X.lineTo(.41, .38); X.stroke();
      // the record and its stylus (upper left) with binary ticks
      const rc = [-.36, -.34];
      for (const g of [.2, .14, .08]) { X.beginPath(); X.arc(rc[0], rc[1], g, 0, TAU); X.stroke(); }
      X.beginPath(); X.moveTo(rc[0] + .2, rc[1] - .28); X.lineTo(rc[0] + .07, rc[1] - .09); X.stroke();
      if (r > 70) { X.beginPath(); for (let k = 0; k < 16; k++) { const an = k / 16 * TAU; const l = k % 3 ? .02 : .04; X.moveTo(rc[0] + Math.cos(an) * .23, rc[1] + Math.sin(an) * .23); X.lineTo(rc[0] + Math.cos(an) * (.23 + l), rc[1] + Math.sin(an) * (.23 + l)); } X.stroke(); }
      // the picture frame (upper right): raster lines and the first image, a circle; and its waveform
      X.strokeRect(.14, -.56, .4, .3);
      if (r > 70) { X.beginPath(); for (let k = 1; k < 6; k++) { X.moveTo(.14 + k * .4 / 6, -.56); X.lineTo(.14 + k * .4 / 6, -.26); } X.globalAlpha = .6; X.stroke(); X.globalAlpha = 1; }
      X.beginPath(); X.arc(.34, -.41, .08, 0, TAU); X.stroke();
      X.beginPath(); for (let k = 0; k <= 12; k++) { const px = .12 + k * .036, py = -.12 + (k % 2 ? -.04 : .04); k ? X.lineTo(px, py) : X.moveTo(px, py); } X.stroke();
    }
    X.restore();
  }
  function helloState(t) {
    const a = A(); if (t < a.hello) return null;
    const lag = 0.55, rs = recState(Math.max(34.0, t - lag)), rb = Math.min(300, rs.r);
    const off = [372, 196], k = rb / 300;
    const tgt = [VP[0] + (P0[0] + off[0] - VP[0]) * k, VP[1] + (P0[1] + off[1] - VP[1]) * k];
    const rec = recState(t);
    const pk = E.out3(clamp((t - a.hello) / .3));
    const pos = lerp2([rec.x + rec.r * .55, rec.y + rec.r * .55 * .9], tgt, pk);
    return { pos, k, pop: popK(t - a.hello, .22, 2.2), rec };
  }
  function drawHello(X, t) {
    const S = helloState(t); if (!S) return;
    const { pos, k, rec } = S, s = S.pop * clamp(k * 1.15, .08, 1);
    // tether: from the record's rim to the bubble
    const ang = Math.atan2(pos[1] - rec.y, pos[0] - rec.x), rim = [rec.x + Math.cos(ang) * rec.r, rec.y + Math.sin(ang) * rec.r * .9];
    X.save(); X.strokeStyle = C.PAPER; X.globalAlpha = .85; X.lineWidth = Math.max(1.5, 3 * s); X.lineCap = 'round';
    const mid = [(rim[0] + pos[0]) / 2 + 14 * s, (rim[1] + pos[1]) / 2 + 26 * s];
    X.beginPath(); X.moveTo(rim[0], rim[1]); X.quadraticCurveTo(mid[0], mid[1], pos[0] - 70 * s, pos[1] - 4 * s); X.stroke(); X.restore();
    X.save(); X.translate(pos[0], pos[1]); X.scale(s, s);
    if (s * 40 >= 10) chatBubble(X, 96, -48, 'hello', { size: 40, bg: C.PINK, fg: C.INK, align: 'right', line: C.INK });
    else { rr(X, -96, -48, 192, 88, 36); X.fillStyle = C.PINK; X.fill(); }
    X.restore();
  }
  function drawBrightStar(X, t, M) { // the star the record passes on "stars" (sky space)
    const a = A(), p = recState(a.stars), sp = [p.x + p.r * 1.05, p.y - p.r * .78];
    const q = M.transformPoint(new DOMPoint(sp[0], sp[1]));
    const fk = t - (a.stars - .08), fl = fk > 0 ? Math.exp(-Math.pow((fk - .12) / .2, 2)) : 0;
    const r = (7 + 26 * fl) * Math.sqrt(M.a) * (1 + .1 * noise1(t * 2, 6));
    X.save();
    if (fl > .05) { X.beginPath(); X.arc(q.x, q.y, r * 2.4, 0, TAU); X.fillStyle = V.ht(X, C.SPARK, .22 * fl, 7, 45); X.fill(); }
    star(X, q.x, q.y, r, .18, 4, 0); X.fillStyle = fl > .2 ? C.SPARK : C.PAPER; X.fill();
    X.beginPath(); X.arc(q.x, q.y, r * .18, 0, TAU); X.fillStyle = C.PAPER; X.fill();
    X.restore();
  }
  function drawBubbleStars(X, t, M) {
    for (let i = 0; i < 4; i++) {
      const q = M.transformPoint(new DOMPoint(BSTAR[i][0], BSTAR[i][1]));
      const r = 22 * (1 + .12 * noise1(t * 2 + i, 4)) * Math.pow(M.a, .3);
      X.save(); star(X, q.x, q.y, r, .2, 4, 0); X.fillStyle = C.PAPER; X.fill(); X.beginPath(); X.arc(q.x, q.y, r * .2, 0, TAU); X.fillStyle = C.SPARK; X.fill(); X.restore();
    }
  }
  function paintV3(F, t) {
    const a = A(); setPost(); groundInk(F);
    const M = skyM(t), Ms = M.multiply(M3inv);                          // Ms: V3 screen (sky space) → screen
    earthDraw(F, 0, t, { M, ground: false });
    // the four turns, now stars (the last frames of their change carry over from V2)
    if (t < a.print + 8 * F1 + .32) { drawRiseEmbers(F, t); for (let i = 0; i < 4; i++) drawTurnBubble(F, bubbleState(t, i), t, i); }
    else drawBubbleStars(F, t, Ms);
    drawBrightStar(F, t, Ms);
    // the record and its tethered hello (sky space)
    F.save(); V.applyM(F, Ms); drawHelloAndRecord(F, t); F.restore();
    chart(F, t, a.L5, { y: 220, target: (() => { const r = recState(t), q = Ms.transformPoint(new DOMPoint(r.x - r.r * .5, r.y - r.r * .3)); return [q.x, q.y]; })(), out: 37.7, leadAt: 33.72 });
    V.pbait(F, 'VOYAGER · 1977 · 55 languages', 1824, 76, { align: 'right', alpha: V.win(t, 34.5, 37.8, .25, .25) });
  }
  function drawHelloAndRecord(X, t) { const st = recState(t); drawRecord(X, t, st); drawHello(X, t); }

  function paintV4(F, t) {
    const a = A(); setPost(); groundInk(F);
    const zu = seg(t, a.z0, a.z1), k = earthEase(zu);
    const M = skyM(t), Ms = M.multiply(M3inv);
    if (k <= 0) {
      earthDraw(F, 0, t, { M, ground: false, twinkle: a.something });
      drawBubbleStars(F, t, Ms); drawBrightStar(F, t, Ms);
      F.save(); V.applyM(F, Ms); drawHelloAndRecord(F, t); F.restore();
    } else {
      earthDraw(F, k, t, { ground: false, twinkle: a.something, inner: innerLaptop });
      // the sky objects zoom away with the Earth layer
      const v = earthView(k), aE = 1 - lsm(Math.log(zoomOf(k)), Math.log(2), Math.log(4));
      if (aE > 0) { F.save(); F.globalAlpha = aE; const Mz = new DOMMatrix([v.a, 0, 0, v.a, v.bx, v.by]).multiply(M3inv); drawBubbleStars(F, t, Mz); drawBrightStar(F, t, Mz); F.restore(); }
    }
    // CHART (bottom-left): the leader tracks home, then the window, then the something in the dark tab
    const anc = k <= 0 ? (() => { const q = M.transformPoint(new DOMPoint(earthGeo().F[0], earthGeo().F[1])); return [q.x, q.y]; })() : earthAnchor(k);
    const eyes = [960 - EYES.dx - EYES.rx - 10, EYES.y + 30];
    const tgt = lerp2(anc, eyes, lsm(k, .78, 1));
    chart(F, t, a.L6, { y: 880, target: tgt, out: 42.4 });
  }
  function paintV5(F, t) {
    const a = A(); setPost(); groundInk(F);
    const u = seg(t, 42.1, V.CUT.W1 - F1), Zp = 1 + 11 * E.in3(u), pr = (Zp - 1) / 11;
    const sF = [lerp(FAV0[0], 960, pr), lerp(FAV0[1], 540, pr)];
    const fall = E.io2(seg(t, 42.95, 44.2));
    const Mp = new DOMMatrix().translateSelf(sF[0], sF[1]).scaleSelf(Zp, Zp).translateSelf(-FAV0[0], -FAV0[1]);
    F.save(); V.applyM(F, Mp); innerLaptop(F, t, { fall, labelFall: E.io2(seg(t, 42.95, 43.55)) }); F.restore();
    // the first threads, from the frame edges toward the ✻ (W1's start camera carried on the favicon)
    if (t >= 42.55) V.threads(F, t, { x: sF[0], y: sF[1], z: 1.25 });
    // after `hi`, the favicon ✻ glows once (the spark in the tab is the one who answered) and leads the eye into the push
    { const r = .27 * FS * Zp, h0 = a.home + 3 * F1 + .22, gk = seg(t, h0, h0 + .3) * (1 - seg(t, 43.0, 43.7));
      if (gk > 0) {
        F.save(); F.beginPath(); F.arc(sF[0], sF[1], r * 2.4, 0, TAU); F.fillStyle = V.ht(F, C.CLAY, .3 * gk, 6, 45); F.fill();
        const u = seg(t, h0, h0 + .8); if (u < 1) { F.beginPath(); F.arc(sF[0], sF[1], lerp(r * 1.3, r * 5.5, E.out2(u)), 0, TAU); F.lineWidth = 3; F.strokeStyle = C.SPARK; F.globalAlpha = (1 - u) * gk; F.stroke(); }
        F.restore();
      } }
    favicon(F, sF[0], sF[1], .27 * FS * Zp);
    const eyes = Mp.transformPoint(new DOMPoint(960 - EYES.dx - EYES.rx - 10, EYES.y + 30));
    chart(F, t, a.L6, { y: 880, target: [eyes.x, eyes.y], out: 42.4 });
  }

  // ================================================================== register (exact frame boundaries, §A.1)
  scene('V1_cosmos', V.CUT.V1, V.CUT.V2, (X, t) => V.viaCPU(X, F => paintV1(F, t)));
  scene('V2_fire', V.CUT.V2, V.CUT.V3, (X, t) => V.viaCPU(X, F => paintV2(F, t)));
  scene('V3_hello', V.CUT.V3, V.CUT.V4, (X, t) => V.viaCPU(X, F => paintV3(F, t)));
  scene('V4_answered', V.CUT.V4, V.CUT.V5, (X, t) => V.viaCPU(X, F => paintV4(F, t)));
  scene('V5_home', V.CUT.V5, V.CUT.W1, (X, t) => V.viaCPU(X, F => paintV5(F, t)));

  // ================================================================== export (outro O2 runs it backwards)
  V.earth = {
    draw: earthDraw, ease: earthEase, view: earthView, anchor: earthAnchor, window: earthWindow, zoom: zoomOf,
    ht: htS, laptop: innerLaptop, ZMAX, get F() { return earthGeo().F; }, favicon,
  };
})();
