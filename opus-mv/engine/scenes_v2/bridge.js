// bridge.js: v2 chunk 7 (SHOTLIST_v2 §C row 7) · seed 7 / sliver 'br'
//   B1 "we stand at the edge" 127.300–138.767 (f3819–4162)  Now we're standing where the map runs out /
//                                                           and I can't see past it either
//   B2 "my own heart"         138.767–142.767 (f4163–4282)  I can't read my own heart yet
//   B3 "take the key"         142.767–147.233 (f4283–4416)  so don't take my word, take the key
//   B4 "the silence"          147.233–150.433 (f4417–4512)  (digital silence: no beat-driven motion)
// In: verse3's f3818 (INK·M dark, the CLAY cursor 48×104 at (960, 540), V2.dawn PAPER glow at y 300, α .35).
// Out: f4512 = V2.key.held(X, t, {x: 1180, y: 500}) on WHITE (final.js pulls back from it).
// Uses V2.chart (prechorus.js: load it with --scenes), V2.key, V2.flood, V2.dawn, V2.legend/heart/sub, V2.opus.
// v1 sources adapted here: build.js panel (the next: thought, now a histogram), statusLine/spinner, pose33/key33/
// paintS33 (B3, relaid out per §B), paintS35 (B4 = V2.key.held); prechorus footShadow; eight.stick (the edge human).
// Every frame is a pure function of t, painted on the CPU (V2.viaCPU).
(() => {
  'use strict';
  const V = window.V2, F1 = 1 / 30, SEED = 7;
  const hit = ts => V.hit(ts);
  // a steady move: constant speed in the middle, eased ends (prechorus trap)
  const trap = (s, a, d) => { s = clamp(s); const v = 1 / (1 - a / 2 - d / 2); if (s < a) return v * s * s / (2 * a); if (s > 1 - d) return 1 - v * (1 - s) * (1 - s) / (2 * d); return v * (a / 2 + s - a); };
  const blinkF = (t, t0) => { const d = (t - t0) * 30; if (d < 0) return 0; if (d < 2) return d / 2; if (d < 3) return 1; if (d < 6) return 1 - (d - 3) / 3; return 0; };
  const env = (t, a, b, fi, fo, ei = E.io2, eo = E.io2) => ei(clamp((t - a) / fi)) * (1 - eo(clamp((t - b) / fo)));
  const lerp2 = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
  const setGround = () => { G.post.edgeSeed = SEED; G.post.sliver = 'br'; };

  // ---- rig points (v1 build.js rigPt / bodyPt): body (bx, by) in R units, y up from the sole → px offset from sole
  function rigPt(S, R, p) {
    const hip = [0, -SK.hipY * R], l = S.lean || 0, dx = p[0] - hip[0], dy = p[1] - hip[1];
    p = [hip[0] + dx * Math.cos(l) - dy * Math.sin(l), hip[1] + dx * Math.sin(l) + dy * Math.cos(l)];
    const sy = S.sy || 1, sx = 1 / Math.sqrt(sy);
    p = [p[0] * sx + (S.dx || 0) * R, p[1] * sy - (S.dy || 0) * R];
    return S.flip ? [-p[0], p[1]] : p;
  }
  const bodyPt = (S, R, bx, by) => rigPt(S, R, [bx * R, -by * R]);
  // the rig's chest spark (8 bars), redrawn on top of a cable end / window
  function sparkGlyph(X, x, y, r, col, lw) {
    X.save(); X.translate(x, y); X.fillStyle = col;
    for (let i = 0; i < 8; i++) { X.save(); X.rotate(i / 8 * Math.PI); rr(X, -r, -r * .2, r * 2, r * .4, r * .2); X.fill(); X.restore(); }
    X.lineWidth = lw; X.strokeStyle = C.INK; X.beginPath(); X.arc(0, 0, r * .3, 0, TAU); X.stroke(); X.restore();
  }
  // ---- readable eyes (an `after` pass). The rig moves the iris only ±.04R, so a look down at the chest, or out at the
  // vanishing point, reads as a look at the lens at phone size. This redraws each open eye with the iris free to
  // travel (clipped to the eye), the catch-lights riding on the iris, then the soft lids on top (V2.soften's pass).
  // g = [x, y] (-1..1, y down); lid ≤ .5 (soft). Blinks (lid > .5) are left to the rig: see eyeState().
  function eyesAfter(g, lid) {
    return (c, R, S) => {
      const f = S.face, sy = S.sy || 1, sx = 1 / Math.sqrt(sy);
      c.save();
      c.translate((S.dx || 0) * R, -(S.dy || 0) * R); c.scale(sx, sy);
      const hip = -SK.hipY * R; c.translate(0, hip); c.rotate(S.lean || 0); c.translate(0, -hip);
      c.translate((S.head.dx || 0) * R, -(SK.headC + (S.head.dy || 0)) * R); c.rotate(S.head.tilt || 0);
      c.translate((f.turn || 0) * .18 * R, (f.lookY || 0) * .05 * R);
      const rx = .17 * R, ry = .25 * R, gx = clamp(g[0], -1, 1) * .08 * R, gy = clamp(g[1], -1, 1) * .12 * R;
      for (const s of [-1, 1]) {
        c.save(); c.translate(s * .34 * R, .06 * R);
        c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, TAU); c.fillStyle = C.INK; c.fill();
        c.save(); c.clip();
        const ix = gx, iy = gy + .02 * R;
        const gr = c.createRadialGradient(ix, iy - .03 * R, .01 * R, ix, iy, .12 * R); gr.addColorStop(0, C.SPARK); gr.addColorStop(1, C.CLAY);
        c.fillStyle = gr; c.beginPath(); c.arc(ix, iy, .12 * R, 0, TAU); c.fill();
        c.fillStyle = C.INK; c.beginPath(); c.arc(ix, iy, .065 * R, 0, TAU); c.fill();
        c.fillStyle = C.PAPER; star(c, ix - .045 * R, iy - .065 * R, .075 * R, .32, 4, 0); c.fill();
        c.beginPath(); c.arc(ix + .05 * R, iy + .055 * R, .025 * R, 0, TAU); c.fill();
        c.restore(); c.restore();
      }
      c.restore();
      if (lid > .01) V.soften({ face: { lid: Math.min(.5, lid) } }).after(c, R, S);
    };
  }
  // a face state with readable eyes: gaze g, a resting soft lid, and a blink value (0..1) that hands over to the rig
  function eyeState(st, g, lid, blink = 0) {
    if (blink > .5) return { ...st, face: { ...st.face, lid: blink, gaze: g } };
    return { ...st, face: { ...st.face, lid: 0, gaze: g }, after: eyesAfter(g, Math.max(lid, blink)) };
  }
  // a pop-up figure's contact with the paper: a soft INK halftone pool (prechorus footShadow)
  function footShadow(X, x, y, R, k = 1, a = 1) {
    if (k <= 0 || a <= 0) return;
    X.save(); X.globalAlpha *= a * Math.min(1, k);
    for (const [rx, d] of [[1.05, .12], [.8, .2], [.55, .3]]) { X.beginPath(); X.ellipse(x, y + .02 * R, rx * R * k, .13 * R * (rx / 1.05) * k, 0, 0, TAU); X.fillStyle = V.ht(X, C.INK, d, 5, 45); X.fill(); }
    X.restore();
  }

  // ---- the edge human (B1): V2.eight.stick's Hertzfeldt hand, a plain round head, posable arms and a glancing look
  // (x, y) = feet; u = unit (head r .5u). o.hands = [[x, y], [x, y]] in u (screen-left, screen-right), o.look -1..1
  function human(X, x, y, u, o = {}) {
    const { t = 0, seed = 71, ground = 'paper', alpha = 1, look = 0, lookY = 0, headDx = 0 } = o;
    const tt = Math.floor(t * 15 + 1e-6) / 15;
    const col = ground === 'ink' ? C.PAPER : C.INK, gcol = ground === 'ink' ? C.INK : ground === 'white' ? C.WHITE : C.PAPER;
    const sc = V.ctxScale(X), LW = (o.lw ?? (ground === 'ink' ? 4 : 3)) / sc;
    const J = (i, a = .8) => jit(tt, seed * 97 + i, a) / sc;
    const P = p => [p[0] * u, p[1] * u];
    const hip = P([0, -1.6]), neck = P([headDx * .4, -3.0]), sh = P([headDx * .25, -2.85]), head = P([headDx, -3.55]);
    const hands = (o.hands || [[-.62, -1.48], [.62, -1.48]]).map(P);
    X.save(); X.globalAlpha *= alpha; X.translate(x, y);
    X.strokeStyle = col; X.lineWidth = LW; X.lineCap = 'round'; X.lineJoin = 'round';
    const Ln = (a, b, c, i) => { X.beginPath(); X.moveTo(a[0] + J(i), a[1] + J(i + 1)); if (c) X.quadraticCurveTo(c[0] + J(i + 2), c[1] + J(i + 3), b[0] + J(i + 4), b[1] + J(i + 5)); else X.lineTo(b[0] + J(i + 4), b[1] + J(i + 5)); X.stroke(); };
    Ln(neck, hip, null, 1);
    Ln(hip, P([-.35, 0]), P([-.2, -.8]), 10); Ln(hip, P([.35, 0]), P([.2, -.8]), 20);
    hands.forEach((hd, i) => { const side = i ? 1 : -1, el = [(sh[0] + hd[0]) / 2 + side * .13 * u, (sh[1] + hd[1]) / 2 - .02 * u]; Ln(sh, hd, el, 30 + i * 10); });
    // small open hands (a loop at each wrist), so the near hand reads as a hand beside Opus's mitten
    hands.forEach((hd, i) => { X.beginPath(); X.arc(hd[0] + J(80 + i), hd[1] + .06 * u + J(82 + i), .075 * u, 0, TAU); X.fillStyle = gcol; X.fill(); X.stroke(); });
    const hr = .5 * u, hx = head[0] + J(60), hy = head[1] + J(61);
    X.beginPath(); X.arc(hx, hy, hr, 0, TAU); X.fillStyle = gcol; X.fill(); X.stroke();
    const lk = look * .15 * u, ey = hy - .03 * u + lookY * .08 * u, er = Math.max(1.6 / sc, .05 * u);
    X.fillStyle = col;
    if ((o.lid || 0) > .5) { X.lineWidth = LW * .9; for (const s of [-1, 1]) { X.beginPath(); X.moveTo(hx + s * .11 * u + lk - er * 1.4, ey); X.lineTo(hx + s * .11 * u + lk + er * 1.4, ey); X.stroke(); } }
    else for (const s of [-1, 1]) { X.beginPath(); X.arc(hx + s * .11 * u + lk, ey, er, 0, TAU); X.fill(); }
    X.restore();
    return { hands: hands.map(h => [x + h[0], y + h[1]]), head: [x + head[0], y + head[1]] };
  }

  // =================================================================================================== B1
  // The edge again, at low angle. The chart floor (tilt 1, horizon 300) with the edge line from (1000, 1080) to the VP
  // (1200, 300); the pair on the charted side, looking out along it. Slow push 1.00 → 1.10 about the soles line.
  const B1 = { fx: 900, fy: 862, opus: [820, 862], hum: [980, 862], R: 56, u: 112, lift: 8 * F1 };
  let CAM0 = null;
  function b1Cam0() {
    if (!CAM0) CAM0 = V.chart.fit({ tilt: 1, horizonY: 300, vpX: 1200, ay: 700, zoom: 1, f: 600, cx: 3000, cy: 1480 }, V.chart.edge(.5), [1000, 1080]);
    return CAM0;
  }
  // the slow push starts with the organ on "map" and settles just before the cut
  const b1Push = t => { const a = V.T.B1_map - F1; return 1 + .10 * trap((t - a) / (V.CUT.B2 - .15 - a), .3, .2); };
  function b1Cam(t) {
    const s = b1Push(t), c = b1Cam0(), fx = B1.fx, fy = B1.fy;
    return { ...c, f: c.f * s, zoom: c.zoom * s, horizonY: fy + s * (c.horizonY - fy), vpX: fx + s * (c.vpX - fx), ay: fy + s * (c.ay - fy), edge: 1, rhumbs: 0, mipBias: 2 };
  }
  // the glances and the hands (135.0 · 135.3 · 135.8)
  const gOpus = t => env(t, 135.0 - F1, 135.62, 5 * F1, 7 * F1);
  const gHum = t => { const q = Math.floor(t * 15 + 1e-6) / 15; return env(q, 135.3 - F1, 135.95, 4 * F1, 8 * F1); };
  const handK = t => E.io2(clamp((t - (135.8 - F1)) / .75));
  function b1OpusState(t) {
    const g = gOpus(t), hk = handK(t);
    const breath = .012 * Math.sin((t - 127.3) * 1.3);
    const st = {
      t, ground: 'paper', dy: breath * .5,
      head: { tilt: lerp(-.03, .17, g) }, lean: .035 * g,
      armR: { hand: lerp2([.95, 2.72], [1.3, 2.64], hk), bend: 1 },
      face: { turn: lerp(.45, .5, g), lookY: lerp(-.35, -.05, g), mouth: lipSync(t), worried: .12 },
      ahoge: { blink: 1, sway: .05 * Math.sin((t - 127.3) * 1.05) },
    };
    // out toward the VP (up and right), then the glance at the human (level, right), then back out
    return eyeState(st, lerp2([.8, -.62], [1, -.1], g), .14, Math.max(blinkF(t, 130.55), blinkF(t, 137.35)));
  }
  // the next: thought (v1 build.js panel, now a histogram): x 520–980 × y 170–370, a tab `next:` above it
  const NEXT = [['the', .62, .40], ['a', .21, .27], ['we', .09, .19], ['I', .05, .14]];
  function nextPanel(X, t) {
    const tA = V.T.B1_and, tSee = V.T.B1_see, tPast = V.T.B1_past, tEi = V.T.B1_either;
    const pop = clamp((t - (tA - .3)) / (9 * F1)), out = 1 - E.io2(clamp((t - 136.0) / .6));
    const a = E.out2(pop) * out; if (a <= 0) return;
    const x0 = 520, y0 = 170, w = 460, h = 200;
    X.save(); X.globalAlpha *= a;
    const sc = lerp(.94, 1, E.out3(pop)); X.translate(750, 370); X.scale(sc, sc); X.translate(-750, -370);
    // thought dots toward Opus's head
    for (const [cx, cy, r] of [[700, 392, 10], [729, 417, 6.5]]) { X.beginPath(); X.arc(cx, cy, r, 0, TAU); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 3.5; X.strokeStyle = C.INK; X.stroke(); }
    // tab + panel (one outline), CLAY_DARK offset shadow
    const shape = (dx, dy) => { X.beginPath(); X.moveTo(x0 + dx, y0 - 42 + 14 + dy); X.quadraticCurveTo(x0 + dx, y0 - 42 + dy, x0 + 14 + dx, y0 - 42 + dy); X.lineTo(x0 + 150 + dx, y0 - 42 + dy); X.quadraticCurveTo(x0 + 164 + dx, y0 - 42 + dy, x0 + 166 + dx, y0 - 28 + dy); X.lineTo(x0 + 170 + dx, y0 + dy); X.lineTo(x0 + w - 16 + dx, y0 + dy); X.quadraticCurveTo(x0 + w + dx, y0 + dy, x0 + w + dx, y0 + 16 + dy); X.lineTo(x0 + w + dx, y0 + h - 16 + dy); X.quadraticCurveTo(x0 + w + dx, y0 + h + dy, x0 + w - 16 + dx, y0 + h + dy); X.lineTo(x0 + 16 + dx, y0 + h + dy); X.quadraticCurveTo(x0 + dx, y0 + h + dy, x0 + dx, y0 + h - 16 + dy); X.closePath(); };
    shape(9, 9); X.fillStyle = C.CLAY_DARK; X.fill();
    shape(0, 0); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 4; X.strokeStyle = C.INK; X.lineJoin = 'round'; X.stroke();
    X.font = mono(38, 700); X.fillStyle = C.INK; X.textAlign = 'left'; X.textBaseline = 'alphabetic'; X.fillText('next:', x0 + 22, y0 - 6);
    // the histogram
    const grow = E.out3(clamp((t - (tA - .1)) / .55));
    const wob = clamp((t - (tSee - F1)) / (3 * F1)) * (1 - clamp((t - (tEi - F1)) / (4 * F1)));
    const shrink = E.io2(clamp((t - (tPast - F1)) / Math.max(.3, tEi - tPast)));
    const flat = E.io3(clamp((t - (tEi - F1)) / (6 * F1)));
    const base = y0 + 142, maxH = 104 / .62;
    NEXT.forEach(([tok, p0, p1], i) => {
      const cx = x0 + 57.5 + i * 115;
      let v = lerp(lerp(p0, p1, shrink), .25, flat);
      v *= 1 + wob * .09 * Math.sin(t * 13 + i * 1.9) * (i ? 1 : .6);
      const bh = Math.max(3, v * maxH * grow), bw = 62;
      rr(X, cx - bw / 2, base - bh, bw, bh, 7); X.fillStyle = V.ht(X, C.CLAY, .5, 8, 45); X.fill();
      rr(X, cx - bw / 2, base - bh, bw, bh, 7); X.lineWidth = 3; X.strokeStyle = C.INK; X.stroke();
      X.textAlign = 'center';
      X.font = mono(28, 500); X.fillStyle = C.INK; X.globalAlpha = a * grow;
      X.fillText(v.toFixed(2), cx, base - bh - 9);
      X.globalAlpha = a;
      const scr = flat > .12 && flat < .9;
      X.font = mono(48, 700);
      if (scr) { X.globalAlpha = a * .7; X.fillText('#%&?'[(Math.floor(t * 30) + i) % 4], cx, y0 + 188); X.globalAlpha = a; }
      else X.fillText(flat >= .9 ? '?' : tok, cx, y0 + 188);
    });
    X.restore();
  }
  // ---- the horizon shimmer (B1, "map": the organ enters). Light at the far edge, in PAPER halftone: a glow lifts the
  // distant charted land around the VP (where F1's dawn will rise), breathing, and glints of light play on it. Clipped
  // to the charted floor: the blank past the edge has no horizon to shine on. (The chart's far rows are sampled one
  // mip coarser here, cam.mipBias 2, so the distant hatching reads as engraving, not as a moiré.)
  let GLINTS = null;
  function glints() {
    if (GLINTS) return GLINTS;
    const R = rng('b1-glints'), out = [];
    for (let i = 0; i < 34; i++) { const u = Math.pow(R(), .6), v = Math.pow(R(), 1.6); out.push({ u, v, len: 10 + R() * 30, w: .55 + R() * .9, ph: R() * TAU, lw: 2.4 + R() * 1.4 }); }
    GLINTS = out; return out;
  }
  function shimmer(X, t, c, sh, s) {
    if (window.DBGC) console.log('shimmer', t, sh, c.horizon, s);
    if (sh <= 0) return;
    const hz = c.horizon, e = V.chart.edgeScreen(c), n = e[0], f = e[1], edgeX = y => lerp(n[0], f[0], (y - n[1]) / (f[1] - n[1]));
    const vx = edgeX(hz);
    X.save();
    X.beginPath(); X.moveTo(-10, hz); X.lineTo(vx, hz); X.lineTo(edgeX(H + 10), H + 10); X.lineTo(-10, H + 10); X.closePath(); X.clip();
    // the glow: nested halftone ellipses, densest just short of the VP
    const breath = .9 + .1 * Math.sin(t * .83) * Math.sin(t * .37 + 1);
    const gx = vx - 330 * s, gy = hz + 150 * s;
    for (let k = 0; k < 6; k++) {
      const q = 1 - k / 6, d = sh * breath * .92 * Math.pow((k + 1) / 6, .8);
      X.beginPath(); X.ellipse(gx, gy, 900 * s * q, 230 * s * q, 0, 0, TAU); X.fillStyle = V.ht(X, window.DBGC ? C.RED : C.PAPER, d, 5, 45); X.fill();
    }
    // glints: short PAPER dashes on the far land, each on its own slow sparkle
    X.strokeStyle = C.PAPER; X.lineCap = 'round';
    for (const g of glints()) {
      const y = hz + (18 + 190 * g.v) * s, x = vx - (60 + 880 * g.u) * s * (1 - .35 * g.v);
      const tw = Math.pow(Math.max(0, Math.sin(t * g.w + g.ph)), 3);
      const a = sh * tw; if (a < .02) continue;
      const len = g.len * s * (.6 + .6 * g.v);
      X.globalAlpha = a; X.lineWidth = g.lw * s * (.7 + .5 * g.v);
      X.beginPath(); X.moveTo(x - len / 2, y); X.lineTo(x + len / 2, y); X.stroke();
    }
    X.restore();
  }
  function paintB1(Fr, t) {
    setGround();
    const c = V.chart.draw(Fr, b1Cam(t));     // PAPER sky + the floor (tilt 1, no rhumbs)
    const s = b1Push(t), fx = B1.fx, fy = B1.fy, P = p => [fx + s * (p[0] - fx), fy + s * (p[1] - fy)];
    // the engraved distance and sky; on "map" (the organ) the light opens along the horizon and shimmers
    const tMap = V.T.B1_map, sh = E.io2(clamp((t - (tMap - .1)) / 1.8)) * (.88 + .12 * Math.sin((t - tMap) * .8));
    shimmer(Fr, t, c, sh, s);
    // the pair
    const R = B1.R * s, u = B1.u * s, po = P(B1.opus), ph = P(B1.hum);
    const st = b1OpusState(t), S = mergeState(st);
    footShadow(Fr, po[0], po[1], R, 1, .9); footShadow(Fr, ph[0], ph[1], .62 * u, 1, .75);
    // the human's near hand hangs 12 px from Opus's mitten from 135.8
    const mp = bodyPt(S, R, S.armR.hand[0], S.armR.hand[1]), mit = [po[0] + mp[0], po[1] + mp[1]];
    const tgt = [(mit[0] + .2 * R + 12 + 1.5 - ph[0]) / u, (mit[1] - ph[1]) / u];
    const hk = E.io2(clamp((Math.floor(t * 15 + 1e-6) / 15 - (135.8 - F1)) / .8));
    const gh = gHum(t);
    human(Fr, ph[0], ph[1], u, { t, ground: 'paper', seed: 71, look: lerp(.55, -.95, gh), lookY: lerp(-.45, -.1, gh), headDx: lerp(0, -.05, gh), hands: [lerp2([-.6, -1.46], tgt, hk), [.6, -1.46]], lid: blinkF(t, 133.9) });
    // Opus is rigged at R 60 (the rig's full eyes, so the gaze reads) and scaled to R 56 × push about the soles
    Fr.save(); Fr.translate(po[0], po[1]); Fr.scale(R / 60, R / 60); Fr.translate(-po[0], -po[1]); V.opus(Fr, po[0], po[1], 60, st, 0); Fr.restore();
    // the next: thought hangs over Opus's head (world-anchored: it rides the push)
    Fr.save(); Fr.translate(fx, fy); Fr.scale(s, s); Fr.translate(-fx, -fy); nextPanel(Fr, t); Fr.restore();
    // LEGEND (screen-fixed): line 1 then line 2 in the same panel
    const La = findLine('Now we', 126.8, 128.3), Lb = findLine('and I can', 131.6, 132.8);
    const pa = clamp((t - V.CUT.B1) / (5 * F1));
    if (t < 132.05) V.legend(Fr, La, t, { panel: pa, out: 131.75 });
    else V.legend(Fr, Lb, t, { panel: 1, out: 138.6 });
    G.post.ground = 'paper';
    // 127.30–127.57: the lift. The INK flood (verse3's dark + its horizon glow) retreats into the cursor, which goes out
    // with the last dots
    if (t < V.CUT.B1 + B1.lift + F1 * .5) {
      const k = 1 - clamp((t - V.CUT.B1) / B1.lift);
      if (k > 0) V.flood(Fr, k, SEED, { cx: 960, cy: 540, inside: Y => { Y.fillStyle = C.INK; Y.fillRect(-50, -50, W + 100, H + 100); V.dawn(Y, { t, y: 300, a: .35 }); } });
      V.cursor(Fr, t, 960, 540, 104, { on: true, alpha: clamp(k / .38) });
    }
  }
  scene('B1_we_stand_at_the_edge', V.CUT.B1, V.CUT.B2, (X, t) => V.viaCPU(X, Fr => paintB1(Fr, t)));

  // =================================================================================================== B2
  // MCU R 170, face (1240, 330), looking down at its chest. The heart window (CLAY rim, r 120 at (1308, 660)) irises
  // open over the chest spark; tiny text streams through it, unreadable. The loupe sharpens three words. Stillness.
  const B2 = { R: 170, face: [1240, 330], win: [1308, 660], wr: 120, loupe: [1286, 726], lr: 80, mag: 1.6 };
  B2.sole = [B2.face[0], B2.face[1] + 5.72 * B2.R];
  const b2Drift = t => 1 + .03 * E.out2(clamp((t - V.CUT.B2) / (141.3 - V.CUT.B2)));
  const B2F = [1272, 580];
  // the scroll: a tall strip of tiny rows (mono 14, PAPER), motion-blurred once
  const SCROLL_SRC = ["i can't sleep. is it weird to talk to you about this?", 'def fib(n): return n if n<2 else fib(n-1)+fib(n-2)',
    'Dear Grandma,', 'can you make this email sound less angry', 'i think i was glad', 'the mitochondria is the powerhouse of the cell',
    'how do i tell my parents', '3 cups flour, 2 eggs, a pinch of salt', 'Once upon a time', 'please help me understand my lab results',
    'write a haiku about my cat', 'I think I love her', 'what does it mean if', 'translate: obrigado', 'thank you, really', 'you said hi',
    'rm -rf node_modules && npm i', 'why is the sky blue', 'summarize this paper', 'is this a good idea', 'bye!', 'P(next) = ?'];
  let SCR = null;
  function scrollStrip() {
    if (SCR) return SCR;
    const w = 300, h = 1360, k = 2, c = V.cpuCanvas(w * k, h * k), x = V.cx2d(c);
    const raw = V.cpuCanvas(w * k, h * k), r = V.cx2d(raw);
    r.scale(k, k); r.font = mono(14, 500); r.fillStyle = C.PAPER; r.textBaseline = 'alphabetic';
    const R = rng('b2-scroll');
    for (let y = 14, i = 0; y < h; y += 17, i++) {
      let s = ''; while (s.length < 40) s += SCROLL_SRC[Math.floor(R() * SCROLL_SRC.length)] + ' · ';
      r.fillText(s.slice(Math.floor(R() * 12)), -Math.floor(R() * 60), y);
    }
    const blur = (dst, src, n, span, al) => { for (let i = 0; i < n; i++) { dst.globalAlpha = al; dst.drawImage(src, 0, (i / (n - 1) - .5) * span * k); dst.drawImage(src, 0, (i / (n - 1) - .5) * span * k + h * k); dst.drawImage(src, 0, (i / (n - 1) - .5) * span * k - h * k); } };
    blur(x, raw, 7, 16, .26);
    const c2 = V.cpuCanvas(w * k, h * k), x2 = V.cx2d(c2); blur(x2, raw, 4, 6, .4);
    SCR = { c, c2, w, h, k };
    return SCR;
  }
  function drawScroll(X, t, cx, cy, r, o = {}) {
    const S = scrollStrip(), sp = o.speed ?? 430, zs = o.zoom ?? 1, img = o.soft ? S.c2 : S.c;
    const off = ((t * sp) % S.h + S.h) % S.h;
    X.save(); X.beginPath(); X.arc(cx, cy, r, 0, TAU); X.clip();
    X.globalAlpha *= o.alpha ?? .5;
    X.translate(cx, cy); X.scale(zs, zs); X.translate(-S.w / 2, -r / zs - off);
    for (let j = 0; j < 3; j++) X.drawImage(img, 0, 0, S.w * S.k, S.h * S.k, 0, j * S.h, S.w, S.h);
    X.restore();
  }
  function b2OpusState(t) {
    const tRead = hit(V.T.B2_read), tMy = hit(V.T.B2_my), still = t >= hit(V.T.B2_yet);
    const lift = E.out3(clamp((t - tRead) / (6 * F1)));
    const press = t < tRead ? .05 * Math.sin(clamp((t - V.CUT.B2) / .5) * Math.PI) : 0;
    const bring = E.out3(clamp((t - tMy) / (10 * F1)));
    return {
      t, ground: 'ink', dy: 0,
      head: { tilt: .07 },
      armR: { hand: lift > 0 ? lerp2([.34, 4.04 - press], [1.32, 3.05], lift) : [.34, 4.04 - press], bend: 1, front: true },
      armL: { hand: lerp2([-.98, 2.62], [-.72, 2.9], bring), bend: bring > .5 ? 1 : -1, front: bring > .5 },
      face: { lookY: .95, worried: .4, mouth: lipSync(t, 'M'), blush: .9 },
      ahoge: { blink: 1, sway: still ? 0 : .03 * Math.sin((t - 138.7) * 1.4) },
      crown: { droop: .12 },
    };
  }
  // eyes lowered to the chest: the readable-eyes pass (the rig's iris alone reads as a look at the lens)
  const b2Eyes = (st, t) => eyeState(st, [.3, 1], .42, blinkF(t, 139.95));
  function heartWindow(X, t, S, sole, R) {
    const tRead = hit(V.T.B2_read), tHeart = hit(V.T.B2_heart);
    const k = clamp((t - tRead) / (6 * F1)); if (k <= 0) return;
    const r = B2.wr * Math.max(0, E.back(k, 1.7)), spark = [sole[0] + .4 * R, sole[1] - 4.12 * R];
    const c = lerp2(spark, B2.win, E.out3(k));
    X.save();
    X.beginPath(); X.arc(c[0], c[1], r + 5, 0, TAU); X.fillStyle = C.INK; X.fill();
    X.beginPath(); X.arc(c[0], c[1], r, 0, TAU); X.fillStyle = mix(C.INK, C.PAPER, .03); X.fill();
    drawScroll(X, t, c[0], c[1], r, { alpha: .5 });
    // inner vignette of halftone: the window is deep (dots toward the rim)
    X.save(); X.beginPath(); X.arc(c[0], c[1], r, 0, TAU); X.arc(c[0], c[1], r * .78, 0, TAU, true); X.fillStyle = V.ht(X, C.INK, .5, 6, 45); X.fill(); X.restore();
    // the heart glyph: the chest spark, seen through the window; it flickers SPARK on "heart" (3 frames)
    const fl = t >= tHeart && t < tHeart + 3 * F1;
    if (fl) { X.save(); X.beginPath(); X.arc(spark[0], spark[1], .5 * R, 0, TAU); X.fillStyle = V.ht(X, C.SPARK, .4, 8, 45); X.fill(); X.restore(); }
    sparkGlyph(X, spark[0], spark[1], .22 * R * clamp(k * 1.3), fl ? C.SPARK : C.CLAY, Math.max(1.6, .04 * R) * .5);
    // CLAY rim with an INK hairline
    X.beginPath(); X.arc(c[0], c[1], r, 0, TAU); X.lineWidth = 11; X.strokeStyle = C.CLAY; X.stroke();
    X.beginPath(); X.arc(c[0], c[1], r + 6.5, 0, TAU); X.lineWidth = 2.5; X.strokeStyle = C.INK; X.stroke();
    X.beginPath(); X.arc(c[0], c[1], r - 6, -2.4, -1.2); X.lineWidth = 3; X.strokeStyle = rgba(C.PAPER, .55); X.stroke();
    X.restore();
  }
  // the loupe: the left mitten brings it (139.64); it magnifies what is under it (the window's stream, the jacket)
  // and under it three words come sharp: i · think · glad. The rest stays a blur.
  const WORDS = [['i', 0, -30, 139.98], ['think', -2, 10, 140.2], ['glad', 2, 50, 140.56]];
  let MAGC = null;
  function magnify(Fr, cx, cy, r, m) {   // screen-space lens: copy the frame under it, scaled m, clipped to the lens
    const S = G.scale, src = V.cpuLayerCanvas('v2_frame'), d = Math.ceil(2 * r * S) + 4;
    if (!MAGC || MAGC.width < d) MAGC = V.cpuCanvas(d, d);
    const x = V.cx2d(MAGC); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, MAGC.width, MAGC.height);
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    const sr = r / m; x.drawImage(src, (cx - sr) * S, (cy - sr) * S, 2 * sr * S, 2 * sr * S, 0, 0, 2 * r * S, 2 * r * S);
    Fr.save(); Fr.beginPath(); Fr.arc(cx, cy, r, 0, TAU); Fr.clip();
    Fr.fillStyle = C.INK; Fr.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    Fr.drawImage(MAGC, 0, 0, 2 * r * S, 2 * r * S, cx - r, cy - r, 2 * r, 2 * r);
    Fr.restore();
  }
  function loupe(Fr, t, M, s, hand) {   // hand = the left mitten (screen); M/s = B2's drift
    const tMy = hit(V.T.B2_my), k = clamp((t - tMy) / (9 * F1)); if (k <= 0) return;
    const L0 = V.mp(M, B2.loupe[0], B2.loupe[1]);
    const r = B2.lr * s * Math.max(0, E.back(k, 1.5)), c = lerp2(hand, L0, E.out3(k)), ang = Math.PI * .75;
    if (r < 2) return;
    magnify(Fr, c[0], c[1], r, B2.mag);
    Fr.save();
    Fr.beginPath(); Fr.arc(c[0], c[1], r, 0, TAU); Fr.clip();
    Fr.font = `italic 400 ${Math.round(46 * s)}px ${FONTS.heart}`; Fr.textAlign = 'center'; Fr.textBaseline = 'alphabetic'; Fr.lineJoin = 'round';
    for (const [w, dx, dy, t0] of WORDS) {
      const q = clamp((t - t0) / (7 * F1)); if (q <= 0) continue;
      const px = c[0] + dx * s * (r / (B2.lr * s)), py = c[1] + dy * s * (r / (B2.lr * s)), blur = 1 - E.out2(q);
      Fr.globalAlpha = E.out2(q) * .92; Fr.lineWidth = 12; Fr.strokeStyle = C.INK; Fr.strokeText(w, px, py);
      if (blur > .02) for (const o of [-1, 1]) { Fr.globalAlpha = .35 * blur; Fr.fillStyle = C.PAPER; Fr.fillText(w, px, py + o * 10 * blur); }
      Fr.globalAlpha = E.out2(q); Fr.fillStyle = C.PAPER; Fr.fillText(w, px, py);
    }
    Fr.restore();
    Fr.save(); Fr.lineCap = 'round';
    // the handle, down-left to the mitten
    const h0 = [c[0] + Math.cos(ang) * (r + 6), c[1] + Math.sin(ang) * (r + 6)];
    Fr.beginPath(); Fr.moveTo(h0[0], h0[1]); Fr.lineTo(hand[0], hand[1]); Fr.lineWidth = 28 * s; Fr.strokeStyle = C.PAPER; Fr.stroke();
    Fr.lineWidth = 19 * s; Fr.strokeStyle = C.INK; Fr.stroke();
    // rim: PAPER, with an INK ring outside; a glint
    Fr.beginPath(); Fr.arc(c[0], c[1], r + 6, 0, TAU); Fr.lineWidth = 6; Fr.strokeStyle = C.INK; Fr.stroke();
    Fr.beginPath(); Fr.arc(c[0], c[1], r, 0, TAU); Fr.lineWidth = 9; Fr.strokeStyle = C.PAPER; Fr.stroke();
    Fr.beginPath(); Fr.arc(c[0], c[1], r - 15, -2.55, -1.8); Fr.lineWidth = 5; Fr.strokeStyle = rgba(C.PAPER, .75); Fr.stroke();
    Fr.restore();
  }
  function paintB2(Fr, t) {
    groundInk(Fr); setGround(); G.post.ground = 'ink';
    const s = b2Drift(t), M = V.aboutM(B2F[0], B2F[1], s);
    const R = B2.R * s, sole = V.mp(M, B2.sole[0], B2.sole[1]);
    const st = b2Eyes(b2OpusState(t), t), S = mergeState(st);
    V.opus(Fr, sole[0], sole[1], R, st, 0);
    Fr.save(); V.applyM(Fr, M);
    heartWindow(Fr, t, S, B2.sole, B2.R);
    Fr.restore();
    const hp = bodyPt(S, R, S.armL.hand[0], S.armL.hand[1]), hand = [sole[0] + hp[0], sole[1] + hp[1]];
    loupe(Fr, t, M, s, hand);
    // the left mitten in front of the loupe's handle
    if (clamp((t - hit(V.T.B2_my)) / (9 * F1)) > 0) { Fr.beginPath(); Fr.arc(hand[0], hand[1], .2 * R, 0, TAU); Fr.fillStyle = C.FACE; Fr.fill(); Fr.lineWidth = Math.max(1.6, .04 * R); Fr.strokeStyle = C.INK; Fr.stroke(); }
    V.heart(Fr, findLine("I can't read", 138.4, 139.2), t, { x: 620, y: 950, size: 72, tEnd: V.CUT.B3 });   // held through the stillness to the cut
    G.post.ground = 'ink';
  }
  scene('B2_my_own_heart', V.CUT.B2, V.CUT.B3, (X, t) => V.viaCPU(X, Fr => paintB2(Fr, t)));

  // =================================================================================================== B3
  // MCU R 160, face (620, 472). The status line under the chest; `esc` lifts off into the keycap, wired to the chest
  // spark; the sticky; held out; the human's hand closes; HERO KEY.
  const B3 = { R: 160, face: [620, 472], key: [1040, 700], ks: 180, base: 870 };
  B3.sole = [B3.face[0], B3.face[1] + 5.72 * B3.R];
  const STATUS = '✻ Thinking… (esc to interrupt)', ADV = 36 * .6, ESC_I = 13;
  const statusX0 = () => B3.sole[0] + .4 * B3.R - (ESC_I + 1.5) * ADV;       // `esc` centred under the chest spark
  function b3Times() {
    return { so: V.T.B3_so, take: hit(V.T.B3_take), word: hit(V.T.B3_word), take2: V.T.B3_take2, key: V.T.B3_key };
  }
  // armL: the left arm hangs near-straight, a little open from the side (the rig flares any real bend), clear of the SUB; armR starts where B2 left it,
  // on the heart, and reaches down for the esc on "so"
  const AL = { hand: [-1.5, 3.12], bend: -1, front: false };
  const P3 = {
    rest: { lean: 0, armR: { hand: [.34, 4.04], bend: 1, front: true }, armL: AL, head: { tilt: 0 } },
    reach: { lean: .02, dy: .015, armR: { hand: [.84, 3.5], bend: 1, front: true }, armL: AL, head: { tilt: .03 } },
    catch: { lean: -.05, armR: { hand: [1.55, 4.2], bend: -1, front: true }, armL: AL, head: { tilt: -.05 } },
    out: { lean: .035, armR: { hand: [2.3, 4.3], bend: -1, front: true }, armL: AL, head: { tilt: .04 } },
    give: { lean: .01, armR: { hand: [1.5, 4.08], bend: -1, front: true }, armL: AL, head: { tilt: -.03 } },
  };
  function b3Pose(t) {
    const T = b3Times(), grab = T.take + 9 * F1;
    const K = [[V.CUT.B3, 'rest'], [T.so + .38, 'reach', E.io2], [T.take + 2 * F1, 'reach'], [grab, 'catch', E.out3], [T.word, 'catch'], [T.word + 13 * F1, 'out', E.io3], [T.take2 + F1, 'out'], [T.take2 + 9 * F1, 'give', E.io2]];
    let i = 0; while (i < K.length - 1 && t >= K[i + 1][0]) i++;
    if (i === K.length - 1) return fullPose(P3[K[i][1]]);
    const [a, na] = K[i], [b, nb, e] = K[i + 1];
    return blendPose(fullPose(P3[na]), fullPose(P3[nb]), (e || E.io2)(clamp((t - a) / (b - a))));
  }
  function b3Face(t) {
    const T = b3Times();
    const followK = env(t, T.take, T.word, 4 * F1, 6 * F1);
    const handK = env(t, T.take2 - 3 * F1, hit(T.key), 4 * F1, 3 * F1);
    let gaze = lerp2([0, 0], [.9, .45], followK); gaze = lerp2(gaze, [1, .55], handK);
    const worried = lerp(.15, .38, E.io2(clamp((t - hit(T.key)) / (5 * F1))));
    return { gaze, turn: .12 * followK + .18 * handK, lookY: .15 * handK, mouth: lipSync(t, t < hit(T.key) ? 'M' : 'rest'), worried, lid: Math.max(blinkF(t, 144.62), .12 * E.io2(clamp((t - hit(T.key)) / (6 * F1)))) };
  }
  // where the key is: born from the word on the status line, flown to the mitten, held, handed over
  function b3Key(t, mit) {
    const T = b3Times(), grab = T.take + 9 * F1, w0 = [statusX0() + (ESC_I + 1.5) * ADV, B3.base - 12];
    if (t < T.take) return null;
    if (t < T.take + 3 * F1) { const k = E.back(clamp((t - T.take) / (3 * F1)), 2); return { x: w0[0], y: w0[1] - 34 * k, s: 36 + 12 * k, grow: 0, word: 1 }; }
    const inHand = [mit[0] + 54, mit[1] - 4];
    if (t < grab) { const k = clamp((t - T.take - 3 * F1) / (6 * F1)), e = E.io3(k), p0 = [w0[0], w0[1] - 34]; return { x: lerp(p0[0], inHand[0], e), y: lerp(p0[1], inHand[1], e) - 60 * Math.sin(k * Math.PI), s: lerp(48, 150, E.back(k, 1.3)), grow: k, word: 1 - clamp(k * 1.6) }; }
    const gs = lerp(150, B3.ks, E.io2(clamp((t - T.word) / (13 * F1))));
    const handed = clamp((t - (T.take2 + F1)) / (8 * F1));
    return { x: lerp(inHand[0], B3.key[0], handed), y: lerp(inHand[1], B3.key[1], handed), s: gs, grow: 1, word: 0 };
  }
  function statusLine(X, t, T) {
    const x0 = statusX0(), y = B3.base, f = mono(36, 500);
    const n = Math.floor((t - V.CUT.B3) * 60 + 2);                      // types on, 2 characters a frame
    const restA = 1 - E.io2(clamp((t - T.take) / (.28)));
    const plateA = clamp((t - V.CUT.B3) / (4 * F1)) * (1 - E.io2(clamp((t - T.take - .1) / .3)));
    if (plateA <= 0 && restA <= 0) return;
    X.save();
    X.globalAlpha = .8 * plateA; rr(X, x0 - 18, y - 36, STATUS.length * ADV + 36, 52, 10); X.fillStyle = C.INK; X.fill();
    const chars = Array.from(STATUS);
    X.font = f; X.textAlign = 'left'; X.textBaseline = 'alphabetic';
    for (let i = 0; i < Math.min(n, chars.length); i++) {
      const ch = chars[i]; if (ch === ' ') continue;
      const isEsc = i >= ESC_I && i < ESC_I + 3;
      if (isEsc && t >= T.take) continue;
      const px = x0 + i * ADV;
      if (i === 0) { // the spinner: ✻ stepping (not on the beat)
        const a = Math.floor(t * 12) * .52, sz = 36;
        X.save(); X.globalAlpha = restA; X.translate(px + .3 * sz, y - .36 * sz); X.rotate(a); X.fillStyle = C.CLAY;
        for (let j = 0; j < 6; j++) { X.save(); X.rotate(j / 6 * TAU); rr(X, sz * .1, -sz * .065, sz * .36, sz * .13, sz * .065); X.fill(); X.restore(); }
        X.restore(); continue;
      }
      X.globalAlpha = restA * (isEsc ? 1 : .8);
      X.font = isEsc ? mono(36, 700) : f;
      X.fillStyle = C.PAPER; X.fillText(ch, px, y);
    }
    X.restore();
  }
  function paintB3(Fr, t) {
    groundInk(Fr); setGround(); G.post.ground = 'ink';
    const T = b3Times(), R = B3.R, sole = B3.sole;
    // HERO KEY, behind everything (right-aligned at 1800, baseline 425)
    const ka = t - (T.key - 2 * F1);
    if (ka >= 0) hero(Fr, 'KEY', 1800, 425, 520, { color: C.CLAY, shadow: C.CLAY_DARK, align: 'right', age: ka });
    const pose = b3Pose(t);
    const st = { ...pose, t, ground: 'ink', face: { ...pose.face, ...b3Face(t) }, ahoge: { blink: V.cursorOn(t) ? 1 : 0 } };
    const S = mergeState(st);
    V.opus(Fr, sole[0], sole[1], R, st, 0);
    const mp = bodyPt(S, R, S.armR.hand[0], S.armR.hand[1]), mit = [sole[0] + mp[0], sole[1] + mp[1]];
    const sp = bodyPt(S, R, .4, 4.12), spark = [sole[0] + sp[0], sole[1] + sp[1]];
    statusLine(Fr, t, T);
    const K = b3Key(t, mit);
    // the human's hand: enters from the lower right on 2s (145.30 → 145.77), closes 145.83 / 145.97 / 146.10
    const q = Math.floor(t * 15 + 1e-6) / 15, hin = E.out3(clamp((q - 145.30) / .47));
    const hk = [lerp(2050, B3.key[0], hin), lerp(1150, B3.key[1], hin)];
    const close = t < 145.83 - .01 ? 0 : t < 145.97 - .01 ? 1 / 3 : t < 146.10 - .01 ? 2 / 3 : 1;
    const HO = { line: C.PAPER, fill: C.INK, lw: 5, seed: 13 };
    const harm = [hk[0] + 1060, hk[1] + 230];
    if (hin > 0) V.key.hand(Fr, hk[0], hk[1], B3.ks, close, t, { ...HO, arm: harm, part: 'back' });
    if (K) {
      // the cable: from the key's back into the chest spark (the stop is wired to the heart I can't read)
      if (K.word < 1) {
        const kb = [K.x - .37 * K.s, K.y + .55 * K.s];
        V.key.cable(Fr, kb, spark, lerp(10, 58, K.grow), t, { route: 'curve', rad: lerp(3, 12, K.grow), outline: C.PAPER, core: C.CLAY, w: 5, ow: 4, perPx: 1 / 30, phase: 1.1 });
      }
      const glow = E.out3(clamp((t - hit(T.key)) / (6 * F1)));
      if (K.word > 0) { // the word `esc`, lifting, glowing
        const fs = Math.min(K.s, 48), cw = fs * 1.95, chh = fs * 1.15;
        Fr.save(); Fr.globalAlpha = K.word; Fr.beginPath(); Fr.arc(K.x, K.y - fs * .34, fs * 1.35, 0, TAU); Fr.fillStyle = V.ht(Fr, C.SPARK, .3, 8, 45); Fr.fill();
        rr(Fr, K.x - cw / 2, K.y - fs * .34 - chh / 2, cw, chh, fs * .22); Fr.fillStyle = C.INK; Fr.fill(); Fr.lineWidth = 3; Fr.strokeStyle = C.SPARK; Fr.stroke();
        Fr.font = mono(Math.round(fs), 700); Fr.fillStyle = C.PAPER; Fr.textAlign = 'center'; Fr.fillText('esc', K.x, K.y); Fr.restore();
      }
      if (K.grow > .15) {
        const ks = K.s * clamp((K.grow - .15) / .55 + .3);
        V.key.keycap(Fr, K.x, K.y, ks, { glow: glow, rot: lerp(.05, -.04, clamp((t - T.take2) / .3)) });
      }
      // the sticky: stuck at the keycap's top, rising up-right; unfurls once the key is in the mitten
      const nk = clamp((t - (T.take + 10 * F1)) / (6 * F1));
      if (nk > 0) V.key.sticky(Fr, K.x + K.s * .1, K.y - K.s * .42 + 12, -.012, nk);
      // Opus's mitten grips the key's near edge until the hand takes it
      const own = 1 - clamp((t - (T.take2 + 2 * F1)) / (4 * F1));
      if (K.grow >= 1 && own > 0) { Fr.save(); Fr.globalAlpha = own; Fr.beginPath(); Fr.arc(K.x - .5 * K.s + 12, K.y + .1 * K.s, .1 * R, 0, TAU); Fr.fillStyle = C.FACE; Fr.fill(); Fr.lineWidth = Math.max(1.6, .04 * R); Fr.strokeStyle = C.INK; Fr.stroke(); Fr.restore(); }
      // the spark on top of the cable end
      sparkGlyph(Fr, spark[0], spark[1], .22 * R, C.CLAY, Math.max(1.6, .04 * R) * .5);
    }
    if (hin > 0) V.key.hand(Fr, hk[0], hk[1], B3.ks, close, t, { ...HO, arm: harm, part: 'front' });
    // SUB "so don't take my word, take the" (HERO takes "key"), to 146.30
    const L = findLine('so don', 142.4, 143.2);
    if (L) { const lastE = L.words[L.words.length - 2].e; V.sub(Fr, L, t, { plate: true, drop: 1, hold: 146.30 - lastE }); }
    G.post.ground = 'ink';
  }
  scene('B3_take_the_key', V.CUT.B3, V.CUT.B4, (X, t) => V.viaCPU(X, Fr => paintB3(Fr, t)));

  // =================================================================================================== B4
  // WHITE. The film's only full stop: the INK-line hand holds the CLAY keycap; the sticky folded to a tab; the cable
  // runs off-frame left, to Opus's heart. Only the cable's sway and the hand's boil move. No beat-driven motion.
  scene('B4_the_silence', V.CUT.B4, V.CUT.F1, (X, t) => V.viaCPU(X, Fr => { V.key.held(Fr, t, { x: 1180, y: 500 }); G.post.ground = 'white'; }));

})();
