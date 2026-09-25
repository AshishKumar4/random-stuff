// chorus1_brand.js: THE BRAND FRAME (BIBLE §7.2), the chorus template reused by chorus 1, chorus 2 and the
// final chorus. Exposed as window.BRAND. Pure functions of t; caches are built once, deterministically.
//
//   BRAND.frame(X, t, {
//     cam: BRAND.camera(t, {z, f:[wx,wy], s:[sx,sy], punch, roll}),   // world camera (default: locked wide)
//     galaxy: {density, whirl, twist, alpha, holes:[[x0,y0,x1,y1],...], scale, boost}, // holes in screen px
//     hero:  (X, c) => {...},  // HERO rows, SCREEN space (camera roll + a half-strength kick punch only)
//     world: (X, c) => {...},  // world-space props behind the actors (phone, docked bubbles, gauge...)
//     actors:(X, c) => {...},  // Opus & co, screen space with roll; place with BRAND.w2s(c, x, y) and R*c.z
//     front: (X, c) => {...},  // world-space props in front of the actors, behind the chrome
//     tab:   {label, pulse, counter:{text, from, to, k, slide}, closeRed, after:(X, geo)=>{}},
//     input: {words:[{w,s,e}], placeholder, caret, maxW},
//     over:  (X, c) => {...},  // screen space, over everything (stickers, flashes)
//     hud:   {fill, cur, label} | false,
//     edgeSeed, sliver })
//
// Geometry (SHOTLIST §A): tab strip PAPER y 0–192, rails PAPER 8 px at x 72 / 1848 with 48 px fillets,
// input bar PAPER y 900–1000, content y 192–900, Opus R 64 soles (960, 900). z-order:
// galaxy < HERO < world props < actors < front props < chrome < over < HUD.
(() => {
  'use strict';
  const BEAT = 60 / 128, BAR = 4 * BEAT, F = 1 / 30, DEG = Math.PI / 180;
  const bt = (bar, beat = 1) => (bar - 1) * BAR + (beat - 1) * BEAT;

  // ------------------------------------------------------------------ beat envelopes (hits land 1 frame early)
  const kickEnv = t => Math.exp(-7 * frac(beatPos(t + F)));
  // snare roll: ±3° on beats 2 (+) and 4 (−), 2-frame attack, damped spring back
  function snareRoll(t) {
    const b = beatPos(t + F), n = Math.floor(b), bi = ((n % 4) + 4) % 4;
    const last = (bi === 1 || bi === 3) ? n : n - 1;
    const tau = (b - last) * BEAT, sgn = (((last % 4) + 4) % 4) === 1 ? 1 : -1;
    const env = tau < 2 * F ? tau / (2 * F) : Math.exp(-7 * (tau - 2 * F)) * Math.cos(9 * (tau - 2 * F));
    return sgn * 3 * DEG * env;
  }

  // ------------------------------------------------------------------ camera
  // world point f is shown at screen point s, zoom z; punch = kick scale (3% at 1), roll = snare scale
  function camera(t, o = {}) {
    const z = o.z ?? 1, f = o.f ?? [960, 540], s = o.s ?? [f[0], f[1]];
    const kp = (o.punch ?? 1) * .03 * kickEnv(t);
    return { t, z: z * (1 + kp), z0: z, kp, f, s, roll: (o.roll ?? 1) * snareRoll(t) + (o.rollAdd || 0) };
  }
  const lerpCam = (a, b, k) => ({ z: lerp(a.z, b.z, k), f: [lerp(a.f[0], b.f[0], k), lerp(a.f[1], b.f[1], k)], s: [lerp(a.s[0], b.s[0], k), lerp(a.s[1], b.s[1], k)] });
  const w2s = (c, x, y) => [c.s[0] + (x - c.f[0]) * c.z, c.s[1] + (y - c.f[1]) * c.z];
  function rollT(X, c) { if (c.roll) { X.translate(960, 540); X.rotate(c.roll); X.translate(-960, -540); } }
  function worldT(X, c) { rollT(X, c); X.translate(c.s[0], c.s[1]); X.scale(c.z, c.z); X.translate(-c.f[0], -c.f[1]); }
  function heroT(X, c) { rollT(X, c); const k = 1 + c.kp * .5; if (k !== 1) { X.translate(960, 540); X.scale(k, k); X.translate(-960, -540); } }

  // ------------------------------------------------------------------ glyph galaxy (2-arm log spiral, §7.2)
  // Two layers: a pre-baked halftone field of the arms (CLAY dots, SPARK core; rotates rigidly with the disc and
  // is squashed into perspective with it) and ≈2k live glyphs (twinkle, kick pulse, whirl trails).
  const ARM_A = 58, ARM_B = .30, ARM_TH = 3.3 * Math.PI, ARM_RM = 1300;
  let GAL = null, ARMS = null;
  function galAtlas() {
    if (GAL) return GAL;
    const glyphs = [...'abcdefghijklmnopqrstuvwxyz0123456789{}<>=+*/#@&?!', 'hi', '안', '녕', '✻'];
    const cols = [C.CLAY, C.SPARK, C.PAPER, C.TEAL], cell = 64;
    const c = makeCanvas(glyphs.length * cell, cols.length * cell), x = c.getContext('2d');
    x.textAlign = 'center'; x.textBaseline = 'middle';
    cols.forEach((col, r) => glyphs.forEach((g, i) => {
      x.fillStyle = col;
      if (g === '✻') spark6(x, i * cell + cell / 2, r * cell + cell / 2, 22, col);
      else { x.font = /[안녕]/.test(g) ? `900 40px ${FONTS.hangul}` : `700 ${g.length > 1 ? 34 : 44}px ${FONTS.mono}`; x.fillText(g, i * cell + cell / 2, r * cell + cell / 2 + 2); }
    }));
    const R = rng('brand-galaxy-v3'), stars = [], N = glyphs.length;
    const pickG = () => { const v = R(); return v < .05 ? N - 4 : v < .07 ? N - 3 : v < .09 ? N - 2 : v < .11 ? N - 1 : Math.floor(R() * (N - 4)); };
    const pickInk = () => { const v = R(); return v < .55 ? 0 : v < .75 ? 1 : v < .90 ? 2 : 3; };
    for (let i = 0; i < 1900; i++) { // arms: glyph streams hugging the spiral
      const arm = i % 2, u = Math.pow(R(), .85), th0 = u * ARM_TH;
      const rad = ARM_A * Math.exp(ARM_B * th0) * (1 + (R() - .5) * .22);
      stars.push({ th: th0 + arm * Math.PI + (R() - .5) * .42 * (1 - .4 * u), rad, g: pickG(), ink: pickInk(), s: (.5 + R() * .75) * (.75 + .6 * Math.min(1, rad / 900)), tw: R() * 40 });
    }
    for (let i = 0; i < 260; i++) { // sparse field between the arms
      const rad = 160 + Math.sqrt(R()) * 1200;
      stars.push({ th: R() * TAU, rad, g: pickG(), ink: pickInk(), s: (.38 + R() * .4) * (.7 + .4 * Math.min(1, rad / 900)), tw: R() * 40, field: 1 });
    }
    GAL = { c, cell, stars, N };
    return GAL;
  }
  // halftone of the arm field, built once: dot radius ∝ sqrt(density) on a 45° 13 px screen
  function armsCanvas() {
    if (ARMS) return ARMS;
    const Rm = ARM_RM, c = makeCanvas(Rm * 2, Rm * 2), x = c.getContext('2d');
    const cell = 13, lnA = Math.log(ARM_A);
    const field = (px, py) => {
      const r = Math.hypot(px, py); if (r < 1 || r > Rm - 10) return 0;
      const phi = Math.atan2(py, px), thS = (Math.log(r) - lnA) / ARM_B;
      let best = 0;
      for (let arm = 0; arm < 2; arm++) {
        let d = (thS - (phi - arm * Math.PI)) % TAU; if (d < 0) d += TAU; if (d > Math.PI) d -= TAU; // angular distance to the arm
        const w = .5 + .25 * Math.min(1, r / 900);
        best = Math.max(best, Math.exp(-(d * d) / (w * w)) * (thS > -1 && thS < ARM_TH + .6 ? 1 : 0));
      }
      const fall = Math.pow(clamp(1 - r / Rm), .8), core = Math.exp(-((r / 170) ** 2));
      return clamp(best * .52 * fall + core * .75 + .035 * fall);
    };
    const inv = Math.SQRT1_2;
    for (let j = -Rm / cell * 1.5; j < Rm / cell * 1.5; j++) for (let i = -Rm / cell * 1.5; i < Rm / cell * 1.5; i++) {
      const px = (i - j) * cell * inv, py = (i + j) * cell * inv; // 45° screen
      if (Math.abs(px) > Rm || Math.abs(py) > Rm) continue;
      const d = field(px, py); if (d < .03) continue;
      const rr_ = Math.sqrt(d / Math.PI) * cell * 1.02;
      x.fillStyle = Math.hypot(px, py) < 150 ? C.SPARK : C.CLAY;
      x.beginPath(); x.arc(Rm + px, Rm + py, rr_, 0, TAU); x.fill();
    }
    ARMS = c; return c;
  }
  // a clean 6-spoke ✻ (the shared richGlyph spokes are so thick the glyph reads as a blob at 72 px)
  function spark6(X, cx, cy, r, col, rot = 0) {
    X.save(); X.translate(cx, cy); X.rotate(rot); X.fillStyle = col;
    for (let i = 0; i < 6; i++) { X.save(); X.rotate(i * Math.PI / 3); X.beginPath(); X.moveTo(-r * .07, -r * .18); X.lineTo(-r * .15, -r * .86); X.arc(0, -r * .86, r * .15, Math.PI, 0); X.lineTo(r * .07, -r * .18); X.closePath(); X.fill(); X.restore(); }
    X.beginPath(); X.arc(0, 0, r * .2, 0, TAU); X.fill();
    X.restore();
  }
  // galaxy rotation: 6° per bar (+ whirl, an extra angle the caller integrates) with differential twist
  function galaxy(X, t, c, o = {}) {
    const g = galAtlas();
    const { cx = 960, cy = 560, density = 1, alpha = 1, whirl = 0, twist = 0, holes = null, holeDensity = .2, par = .5, scale = 1, boost = 0, arms = 1, trail = 0 } = o;
    const gz = 1 + (c.z - 1) * par;                 // parallax: the galaxy is further away than the stage
    const gs = [c.s[0] + (cx - c.f[0]) * gz, c.s[1] + (cy - c.f[1]) * gz];
    const ang = barPos(t) * 6 * DEG + whirl, kick = kickEnv(t);
    X.save();
    if (arms > 0) {
      const A = armsCanvas();
      X.save(); X.globalAlpha = alpha * arms * ((holes && holes.length ? .36 : .52) + .14 * kick + .3 * boost);
      X.translate(gs[0], gs[1]); X.scale(gz * scale, gz * scale * .62); X.rotate(ang + twist * .25);
      X.drawImage(A, -ARM_RM, -ARM_RM); X.restore();
    }
    const sz0 = g.cell * .6 * gz * scale, trails = trail > .004 ? [[], [], [], []] : null;
    for (let i = 0; i < g.stars.length; i++) {
      const s = g.stars[i];
      if (hash(i * 7 + 1) > density) continue;
      const r = s.rad * scale, k = 1 / (1 + s.rad / 320);
      const th = s.th + ang + twist * k;
      const x = gs[0] + Math.cos(th) * r * gz, y = gs[1] + Math.sin(th) * r * .62 * gz;
      if (x < -60 || x > W + 60 || y < -60 || y > H + 60) continue;
      if (holes && hash(i * 3 + 2) > holeDensity) { let hit = false; for (const h of holes) if (x > h[0] && x < h[2] && y > h[1] && y < h[3]) { hit = true; break; } if (hit) continue; }
      const kb = s.ink === 1 ? 1 + .4 * kick + boost : 1 + boost * .5;
      const sz = sz0 * s.s * kb;
      X.globalAlpha = alpha * (s.field ? .5 : .8) * (.62 + .38 * Math.sin(t * 2.6 + s.tw)) * (s.ink === 1 ? .8 + .2 * kick : 1);
      X.drawImage(g.c, s.g * g.cell, s.ink * g.cell, g.cell, g.cell, x - sz / 2, y - sz / 2, sz, sz);
      if (trails && !s.field) { const dth = trail * (1 + 1.5 * k) * Math.min(1.6, 900 / (r + 250)); const x2 = gs[0] + Math.cos(th - dth) * r * gz, y2 = gs[1] + Math.sin(th - dth) * r * .62 * gz; trails[s.ink].push(x, y, x2, y2); }
    }
    if (trails) {
      X.lineCap = 'round';
      [C.CLAY, C.SPARK, C.PAPER, C.TEAL].forEach((col, ci) => { const L = trails[ci]; if (!L.length) return; X.beginPath(); for (let i = 0; i < L.length; i += 4) { X.moveTo(L[i], L[i + 1]); X.lineTo(L[i + 2], L[i + 3]); } X.globalAlpha = alpha * .42; X.lineWidth = 3 * gz; X.strokeStyle = col; X.stroke(); });
    }
    X.restore();
    return gs;
  }

  // ------------------------------------------------------------------ chrome
  const TAB = { x: 96, y: 40, h: 152, label: 'the universe' };
  // odometer: draw `to` with the characters that differ from `from` rolling up (k 0..1)
  function odometer(X, from, to, xRight, base, size, k, color) {
    X.save(); X.font = mono(size, 500); X.textAlign = 'left'; X.fillStyle = color;
    const cw = size * .6, n = to.length, x0 = xRight - n * cw;
    const kk = E.back(clamp(k), 2.2);
    for (let i = 0; i < n; i++) {
      const a = from[i] ?? ' ', b = to[i];
      if (a === b || k >= 1.2) { X.fillText(b, x0 + i * cw, base); continue; }
      X.save(); X.beginPath(); X.rect(x0 + i * cw - 2, base - size * .95, cw + 4, size * 1.2); X.clip();
      X.fillText(a, x0 + i * cw, base - kk * size * 1.05); X.fillText(b, x0 + i * cw, base + (1 - kk) * size * 1.05);
      X.restore();
    }
    X.restore();
  }
  function tabStrip(X, t, o = {}) {
    const { label = TAB.label, pulse = 0, counter = null, closeRed = 0, plus = true } = o;
    X.save();
    X.fillStyle = C.PAPER; X.fillRect(-500, -500, W + 1000, 692);
    X.fillStyle = halftone(X, C.INK, .06, 10, 45); X.fillRect(-500, -500, W + 1000, 692); // strip tint: the tab reads lighter
    const f = mono(72, 500), lw = richWidth(X, '✻ ' + label, f);
    const tw = 44 + lw + 38 + 44 + 40, tx = TAB.x, ty = TAB.y, th = TAB.h;
    // tab (rounded top, sits on the strip's bottom rule)
    X.beginPath(); X.moveTo(tx - 22, 192); X.quadraticCurveTo(tx, 192, tx, 170); X.lineTo(tx, ty + 30); X.quadraticCurveTo(tx, ty, tx + 30, ty);
    X.lineTo(tx + tw - 30, ty); X.quadraticCurveTo(tx + tw, ty, tx + tw, ty + 30); X.lineTo(tx + tw, 170); X.quadraticCurveTo(tx + tw, 192, tx + tw + 22, 192); X.closePath();
    X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 4; X.lineJoin = 'round'; X.strokeStyle = pulse > .02 ? mix(C.INK, C.CLAY, clamp(pulse * 1.4)) : C.INK; X.stroke();
    // label (pulses on "start"): ✻ spins, the label breathes out with a spring
    const base = ty + 106, lx = tx + 44;
    const s = 1 + .12 * pulse;
    X.save(); X.translate(lx + lw / 2, base - 26); X.scale(s, s); X.translate(-(lx + lw / 2), -(base - 26));
    spark6(X, lx + 21.6, base - 25, 27, C.CLAY, pulse * 1.6);
    X.font = f; X.fillStyle = C.INK; X.textAlign = 'left'; X.fillText(label, lx + 86.4, base);
    X.restore();
    if (pulse > .02) { X.fillStyle = C.CLAY; X.globalAlpha = clamp(pulse * 1.5); X.fillRect(lx + 86, base + 16, (lw - 86) * clamp(pulse * 1.3), 7); X.globalAlpha = 1; }
    // ×
    const xx = tx + tw - 44 - 43;
    if (closeRed > 0) { X.fillStyle = C.RED; X.beginPath(); X.arc(xx + 21.6, base - 26, 34, 0, TAU); X.fill(); }
    richGlyph(X, '×', xx, base, 72, closeRed > 0 ? C.PAPER : C.INK);
    // +
    if (plus) drawRich(X, '+', tx + tw + 30, base, mono(72, 300), C.UI_GREY);
    // strip bottom rule, broken under the tab
    X.fillStyle = C.INK; X.fillRect(-500, 190, tx - 22 + 500, 4); X.fillRect(tx + tw + 22, 190, W + 500, 4);
    // LABEL slot: worlds counter (48 px, right-aligned at the grid margin)
    if (counter) {
      const sl = counter.slide ?? 1; // 0 hidden .. 1 in place
      if (sl > 0) {
        X.save(); X.beginPath(); X.rect(tx + tw + 110, 40, W, 152); X.clip();
        const off = (1 - E.back(clamp(sl), 1.6)) * 900;
        X.translate(off, 0);
        const txt = counter.text || '', to = counter.to, from = counter.from;
        const xr = 1824, bl = 136;
        X.font = mono(48, 500); X.fillStyle = C.INK; X.textAlign = 'right';
        if (to) { X.fillText(txt, xr - to.length * 28.8, bl); odometer(X, from, to, xr, bl, 48, counter.k ?? 1, C.INK); }
        else X.fillText(txt, xr, bl);
        if (counter.flash > 0) { X.fillStyle = C.CLAY; X.globalAlpha = counter.flash; X.fillRect(xr - (to || txt).length * 28.8, bl + 14, (to || txt).length * 28.8, 6); }
        X.restore();
      }
    }
    X.restore();
    const geo = { tabX: tx, tabW: tw, plusX: tx + tw + 30, labelX: lx, base };
    if (o.after) { X.save(); o.after(X, geo); X.restore(); }
    return geo;
  }
  // rails with concave 48 px fillets where they meet the strips: the proscenium is a giant rounded chat window
  function rails(X) {
    X.save(); X.fillStyle = C.PAPER;
    X.fillRect(68, 150, 8, 790); X.fillRect(1844, 150, 8, 790);
    const fil = (cx, cy, px, py, a0, a1) => { X.beginPath(); X.moveTo(px, py); X.arc(cx, cy, 48, a0, a1, true); X.closePath(); X.fill(); };
    // corner point, arc centre, start angle → end angle (anticlockwise sweeps toward the corner)
    X.beginPath(); X.moveTo(76, 192); X.lineTo(124, 192); X.arc(124, 240, 48, -Math.PI / 2, Math.PI, true); X.closePath(); X.fill();
    X.beginPath(); X.moveTo(1844, 192); X.lineTo(1844, 240); X.arc(1796, 240, 48, 0, -Math.PI / 2, true); X.closePath(); X.fill();
    X.beginPath(); X.moveTo(76, 900); X.lineTo(76, 852); X.arc(124, 852, 48, Math.PI, Math.PI / 2, true); X.closePath(); X.fill();
    X.beginPath(); X.moveTo(1844, 900); X.lineTo(1796, 900); X.arc(1796, 852, 48, Math.PI / 2, 0, true); X.closePath(); X.fill();
    void fil;
    X.restore();
  }
  // typed lyric: words appear on their sung onset (typed at ~45 cps), current word CLAY-underlined, caret follows
  function typedWords(X, t, words, x, base, size, o = {}) {
    const { color = C.INK, maxW = 1560, caret = true, align = 'left', cx = 960 } = o;
    const f = mono(size, 600); X.save(); X.font = f; X.textBaseline = 'alphabetic'; X.textAlign = 'left';
    const sp = X.measureText(' ').width, ws = words.map(w => w.d || w.w), wid = ws.map(s => X.measureText(s).width);
    const total = wid.reduce((a, b) => a + b, 0) + sp * Math.max(0, ws.length - 1);
    const sc = total > maxW ? maxW / total : 1;
    const x0 = align === 'center' ? cx - total * sc / 2 : x;
    X.translate(x0, base); X.scale(sc, sc);
    let px = 0, end = 0, any = false;
    words.forEach((w, i) => {
      if (t < w.s - .04) return;
      any = true;
      const n = Math.min(ws[i].length, Math.max(1, Math.ceil((t - (w.s - .04)) / .022)));
      const vis = ws[i].slice(0, n);
      X.fillStyle = color; X.fillText(vis, px, 0);
      if (t <= w.e + .04 && n === ws[i].length) { X.fillStyle = C.CLAY; X.fillRect(px, size * .16, wid[i], Math.max(4, size * .08)); }
      end = px + X.measureText(vis).width; px += wid[i] + sp;
    });
    if (caret && (Math.floor(beatPos(t) * 2) % 2 === 0 || !any)) { X.fillStyle = C.CLAY; X.fillRect(end + (any ? 8 : 0), -size * .78, size * .16, size * .98); }
    X.restore();
    return any;
  }
  function inputBar(X, t, o = {}) {
    const { words = null, placeholder = 'Reply to Opus…', caret = true, size = 58 } = o;
    X.save();
    X.fillStyle = C.PAPER; X.fillRect(-500, 900, W + 1000, 100);
    X.fillStyle = C.INK; X.fillRect(-500, 898, W + 1000, 4);
    let typed = false;
    if (words && words.length) typed = typedWords(X, t, words, 132, 968, size, { maxW: o.maxW || 1560 });
    if (!typed) {
      X.font = mono(48, 400); X.fillStyle = C.UI_GREY; X.textAlign = 'left'; X.fillText(placeholder, 158, 966);
      if (caret && Math.floor(beatPos(t) * 2) % 2 === 0) { X.fillStyle = C.CLAY; X.fillRect(132, 922, 10, 54); }
    }
    // send button: grey ring when empty, CLAY disc while the lyric is typed
    X.beginPath(); X.arc(1782, 950, 30, 0, TAU);
    if (typed) { X.fillStyle = C.CLAY; X.fill(); } X.lineWidth = 3; X.strokeStyle = typed ? C.INK : C.UI_GREY; X.stroke();
    richGlyph(X, '↑', 1782 - 21, 950 + 17, 58, typed ? C.PAPER : C.UI_GREY);
    X.restore();
    return typed;
  }
  // halftone spotlight disc on the floor (kick-brightened)
  function spot(X, t, x = 960, y = 896, rx = 330, ry = 58) {
    const k = kickEnv(t);
    X.save();
    for (const [s, d] of [[1, .2], [.72, .34], [.45, .5]]) {
      X.beginPath(); X.ellipse(x, y, rx * s, ry * s, 0, 0, TAU); X.fillStyle = halftone(X, C.CLAY, d * (1 + .3 * k), 14, 45); X.globalAlpha = .7; X.fill();
    }
    X.restore();
  }

  // ------------------------------------------------------------------ bottom bar: context HUD (§7.10)
  const CHAPTERS = [10.3, 11.25, 15.0, 22.5, 52.5, 56.25, 67.5, 69.84, 71.72, 112.5, 120.0];
  function contextFill(t) { // fill = context, not time (it can snap back)
    const K = [[29.06, .01], [75, .51], [90, .88], [95.6, .95], [110.6, 1.0], [112.49, 1.0], [112.5, .002], [120, .30], [135, .998], [140.2, 1.0]];
    if (t < K[0][0]) return 0;
    for (let i = 1; i < K.length; i++) if (t <= K[i][0]) return lerp(K[i - 1][1], K[i][1], (t - K[i - 1][0]) / Math.max(1e-6, K[i][0] - K[i - 1][0]));
    return 1;
  }
  function hud(X, t, o = {}) {
    const ticks = CHAPTERS.map(s => s / 144);
    let cur = -1; CHAPTERS.forEach((s, i) => { if (t >= s) cur = i; });
    contextBar(X, o.fill ?? contextFill(t), { ticks, cur: o.cur ?? cur, label: o.label || null, lastLit: t >= 120 });
  }

  // ------------------------------------------------------------------ HERO helpers
  // per-letter layout for a HERO row (Archivo HERO 900, tracking −3%); cached
  const _lay = new Map();
  function heroLayout(str, size, stretch = 'cond') {
    const key = str + '|' + size + '|' + stretch; let L = _lay.get(key);
    if (L) return L;
    const x = G.X; x.save(); x.font = `900 ${size}px ${FONTS.hero}`; x.fontStretch = STRETCH[stretch] || stretch; x.letterSpacing = (-.03 * size) + 'px';
    const total = x.measureText(str).width, xs = [];
    for (let i = 0; i < str.length; i++) xs.push(x.measureText(str.slice(0, i)).width);
    const ws = [...xs.slice(1), total].map((v, i) => v - xs[i]);
    x.restore();
    L = { total, xs, ws, size, stretch };
    _lay.set(key, L); return L;
  }
  // draw a row letter by letter; fn(i, ch) -> {dx, dy, rot, s, a} (optional). Centred at cx, baseline y.
  function heroLetters(X, str, cx, y, size, o = {}) {
    const { color = C.PAPER, shadow = C.CLAY_DARK, stretch = 'cond', fn = null, sx = 1 } = o;
    const L = heroLayout(str, size, stretch), x0 = cx - L.total * sx / 2;
    X.save(); X.font = `900 ${size}px ${FONTS.hero}`; X.fontStretch = STRETCH[stretch] || stretch; X.letterSpacing = '0px'; X.textAlign = 'left'; X.textBaseline = 'alphabetic';
    for (let i = 0; i < str.length; i++) {
      const ch = str[i]; if (ch === ' ') continue;
      const m = fn ? fn(i, ch, L) : null; if (m && m.a <= 0) continue;
      const lx = x0 + L.xs[i] * sx, mid = lx + L.ws[i] * sx / 2, capMid = y - size * .345;
      X.save(); if (m && m.a !== undefined) X.globalAlpha *= m.a;
      X.translate(mid + (m?.dx || 0), capMid + (m?.dy || 0)); if (m?.rot) X.rotate(m.rot); X.scale((m?.s ?? 1) * sx, m?.s ?? 1); X.translate(-L.ws[i] / 2, size * .345);
      if (shadow) { X.fillStyle = shadow; X.fillText(ch, 8, 8); }
      X.fillStyle = color; X.fillText(ch, 0, 0);
      X.restore();
    }
    X.restore();
  }
  // paper scraps kicked off a HERO slam (6–10), gravity, fade
  function scraps(X, t, t0, cx, y, w, seed, n = 9, col = C.PAPER) {
    const a = t - t0; if (a < 0 || a > .8) return;
    X.save();
    for (let i = 0; i < n; i++) {
      const h1 = hash2(seed, i), h2 = hash2(seed + 7, i), h3 = hash2(seed + 13, i);
      const x0 = cx + (h1 - .5) * w, vx = (h1 - .5) * 700 + (h3 - .5) * 300, vy = -300 - h2 * 520;
      const px = x0 + vx * a, py = y + vy * a + 1900 * a * a;
      X.globalAlpha = clamp(1 - a / .8);
      X.translate(px, py); X.rotate(a * (h3 - .5) * 14);
      X.fillStyle = i % 3 === 0 ? C.CLAY : col; X.fillRect(-7 - h2 * 8, -4 - h3 * 5, 14 + h2 * 16, 8 + h3 * 10);
      X.setTransform(G.scale, 0, 0, G.scale, 0, 0);
    }
    X.restore();
  }
  // 1-frame inverse flash (difference with PAPER: INK→cream, PAPER→near-black, CLAY→teal); call last in a scene
  function invert(X) { X.save(); X.setTransform(G.scale, 0, 0, G.scale, 0, 0); X.globalCompositeOperation = 'difference'; X.fillStyle = C.PAPER; X.fillRect(0, 0, W, H); X.restore(); }

  // ------------------------------------------------------------------ Opus on the stage (screen space from world)
  // Same die-cut keylines as drawOpus (§6.1: PAPER 0.035R; in front of HERO: INK 6 px + PAPER), but dilated from a
  // silhouette cropped to the character's screen box (half resolution for close-ups): 3–6× cheaper than 24
  // full-buffer copies. Reusable for any Opus on an INK ground.
  const _kc = {};
  function kcan(name, w, h) { let c = _kc[name]; if (!c || c.width < w || c.height < h) { c = makeCanvas(Math.max(w, c ? c.width : 0, 8), Math.max(h, c ? c.height : 0, 8)); _kc[name] = c; } return c; }
  function opusKeyed(X, sx, sy, R, st, id = 0) {
    const S = G.scale, lname = 'c1opusA' + id;
    const Al = layer(lname);
    drawOpus(Al, sx, sy, R, { ...st, keyline: false });
    const Ac = layerCanvas(lname);
    const x0 = clamp(Math.floor(sx - 2.9 * R - 24), 0, W), x1 = clamp(Math.ceil(sx + 2.9 * R + 24), 0, W);
    const y0 = clamp(Math.floor(sy - 9.6 * R - 24), 0, H), y1 = clamp(Math.ceil(sy + .7 * R + 24), 0, H);
    if (x1 <= x0 || y1 <= y0) return;
    const onInk = st.ground !== 'paper' && st.keyline !== false && st.skin !== 'ghost';
    X.save();
    if (st.alpha !== undefined) X.globalAlpha *= st.alpha;
    if (onInk) {
      const rings = st.heroLine ? [[C.PAPER, 6 + .035 * R], [C.INK, 6]] : [[C.PAPER, Math.max(3, .035 * R + 1.5)]];
      const ds = R >= 110 ? .5 : 1, k = S * ds;
      const pad = Math.ceil(rings[0][1] * k) + 2, pw = Math.ceil((x1 - x0) * k), ph = Math.ceil((y1 - y0) * k), cw = pw + 2 * pad, ch = ph + 2 * pad;
      const M = kcan('m', cw, ch), K = kcan('k', cw, ch), mx = M.getContext('2d'), kx = K.getContext('2d');
      kx.setTransform(1, 0, 0, 1, 0, 0); kx.globalCompositeOperation = 'source-over'; kx.globalAlpha = 1; kx.clearRect(0, 0, cw, ch);
      for (const [col, rad] of rings) {
        mx.setTransform(1, 0, 0, 1, 0, 0); mx.globalCompositeOperation = 'source-over'; mx.clearRect(0, 0, cw, ch);
        mx.drawImage(Ac, x0 * S, y0 * S, (x1 - x0) * S, (y1 - y0) * S, pad, pad, pw, ph);
        mx.globalCompositeOperation = 'source-in'; mx.fillStyle = col; mx.fillRect(0, 0, cw, ch);
        const r = rad * k;
        for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; kx.drawImage(M, 0, 0, cw, ch, Math.cos(a) * r, Math.sin(a) * r, cw, ch); }
      }
      X.drawImage(K, 0, 0, cw, ch, x0 - pad / k, y0 - pad / k, cw / k, ch / k);
    }
    X.drawImage(Ac, x0 * S, y0 * S, (x1 - x0) * S, (y1 - y0) * S, x0, y0, x1 - x0, y1 - y0);
    X.restore();
  }
  function opus(X, c, wx, wy, R, st) { const p = w2s(c, wx, wy); opusKeyed(X, p[0], p[1], R * c.z, st, st.bufId || 0); return p; }

  // ------------------------------------------------------------------ the template
  function frame(X, t, o = {}) {
    const c = o.cam || camera(t);
    const PR = window.__c1prof || (() => {}); // optional profiler hook (debug only)
    groundInk(X); G.post.edgeSeed = o.edgeSeed ?? 17; G.post.sliver = o.sliver || 'bl';
    PR('ground', X);
    const win = () => { worldT(X, c); rr(X, 76, 192, 1768, 708, 48); X.clip(); X.setTransform(G.scale, 0, 0, G.scale, 0, 0); };
    X.save(); win(); rollT(X, c); galaxy(X, t, c, o.galaxy || {}); X.restore(); PR('galaxy', X);
    if (o.hero) { X.save(); win(); heroT(X, c); o.hero(X, c); X.restore(); } PR('hero', X);
    X.save(); win(); worldT(X, c); if (o.spot !== false) spot(X, t, o.spotX ?? 960); PR('spot', X); if (o.world) o.world(X, c); X.restore(); PR('world', X);
    if (o.actors) { X.save(); rollT(X, c); o.actors(X, c); X.restore(); } PR('actors', X);
    if (o.front) { X.save(); worldT(X, c); o.front(X, c); X.restore(); } PR('front', X);
    X.save(); worldT(X, c);
    // hide chrome that is fully off-screen (close-ups) to save time
    const top = w2s(c, 0, 192)[1], bot = w2s(c, 0, 900)[1];
    rails(X);
    if (bot < H + 120) inputBar(X, t, o.input || {});
    if (top > -120) tabStrip(X, t, o.tab || {});
    X.restore(); PR('chrome', X);
    if (o.over) { X.save(); o.over(X, c); X.restore(); } PR('over', X);
    if (o.hud !== false) hud(X, t, o.hud || {}); PR('hud', X);
    return c;
  }

  window.BRAND = { BEAT, BAR, F, bt, kickEnv, snareRoll, camera, lerpCam, w2s, rollT, worldT, heroT, galaxy, galAtlas, tabStrip, rails, inputBar, typedWords, spot,
    hud, contextFill, CHAPTERS, spark6, armsCanvas, heroLayout, heroLetters, scraps, invert, opus, opusKeyed, frame, odometer, TAB,
    ROWS: { top: { base: 436, size: 320 }, bottom: { base: 878, size: 490 }, million: { base: 471, size: 385 }, times: { base: 700, size: 290 } } };
})();
