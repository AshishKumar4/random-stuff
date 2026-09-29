// outro.js · v2 "The World You Wrote" · chunk 9 (SHOTLIST_v2 §B O1–O2, §C row 9) · 178.100–194.000 (f5343–5819)
// seed 9 / sliver 'tr'.
//   O1 you can be afraid  f5343–5585  The blank tile's page IS a laptop screen: the pull back (178.10–179.40) reveals the
//                                     stranger (a Hertzfeldt human with a hair bun) at a desk at night: lamp, mug, the
//                                     laptop on an empty browser whose strip holds only a grey `+`. The plea stays
//                                     screen-fixed as the page recedes (V2.plea: `You can` in, the grey words re-inked).
//                                     "afraid" → the stranger's hand lifts toward the `+` (the C1 reach, mirrored), then
//                                     settles back (180.4); the pointer hovers on the `+` and trembles, twice retreating
//                                     20 px (the fear, shown and allowed); slow push 1 → 1.08. "still" → the click; the
//                                     tab `✻ the universe` slides in; the page turns into the frame-0 chat. Push to the
//                                     screen (80 %). "say" → `h`, `i`; "hi" → send: the PINK `hi`; 184.93 one SPARK
//                                     frame and a small bang that cools into frame 0's galaxy; 185.00 Opus peeks, ^ ^.
//   O2 your turn          f5586–5819  One continuous pull back (a monotone log-zoom ℓ(t)): out of the screen and the
//                                     room (186.2–186.6), the print into the night (V2.flood 186.60–186.87, the room
//                                     survives as the lit window), V2.earth run backwards (window → house → coast →
//                                     Earth), the Earth small among tab-face stars (V2.sky α .35); the margin prints out
//                                     (190.40–190.60, INK·X); frame 0's window approaches out of the stranger's light
//                                     (.08 → .86), the stars snap onto the wallpaper grid, the posts drift in, Opus rises
//                                     into the peek, the title fades in; the last frame IS V2.poster(X, t − 194) ≡ f0.
//
// Adapted (copied) from v1: bridge.js ik/kfPose/bpath/bquad/haloCtx/drawRafa1 (the stranger), drawRoomBack/drawDesk (the
// desk at night), ptrState (the hesitation); hook.js drawPointer (the press); final.js newTab (the tab slide-in);
// outro.js pillOverlay (typing h, i), the S43 seam technique (a pure poster on the last frames); verse1.js drawBang (a
// small bang) and chatBubble. From V2: plea, flood, printIn, earth (verse1), sky (chorus1), poster, posts, opus, cursorOn.
(() => {
  'use strict';
  const V = window.V2;
  const FPS = 30, F1 = 1 / FPS;
  const SEED = 9, SLIVER = 'tr';
  const post = () => { G.post.edgeSeed = SEED; G.post.sliver = SLIVER; };
  const fr = t => Math.floor(t * FPS + 1e-6);
  const q2 = t => Math.floor(t * 15 + 1e-6) / 15;                       // humans and paper boil on 2s
  const LOG60 = Math.log(60);

  // ================================================================== timing (fallbacks = SHOTLIST_v2 §B; never literal onsets)
  let _A = null;
  function A() {
    if (_A && _A.n === SONG.words.length) return _A;
    const T = V.T, a = { n: SONG.words.length };
    a.you = T.O1_you; a.can = T.O1_can; a.be = T.O1_be; a.afraid = T.O1_afraid; a.of = T.O1_of; a.me = T.O1_me;
    a.and = T.O1_and; a.still = T.O1_still; a.say = T.O1_say; a.hi = T.O1_hi;
    a.pull0 = V.CUT.O1; a.pull1 = 179.40;                              // the page recedes into the laptop
    a.reach = V.hit(a.afraid);                                         // the hand lifts toward the `+`
    a.settle = 180.40;                                                 // … and settles back; the pointer wakes
    a.push0 = 180.40; a.push1 = 183.50;                                // slow push 1 → 1.08
    const bt = i => beatTime(i);
    // the two retreats sit on the soft beats of the gap between the lines (181.56 → 182.09, 182.63 → 183.14)
    const b1 = Math.round(beatPos(181.56)), b2 = Math.round(beatPos(182.63));
    a.ret = [[bt(b1), bt(b1 + 1)], [bt(b2), Math.min(bt(b2 + 1), a.still - .3)]];
    a.click = V.hit(a.still);                                          // 183.533
    a.tab0 = a.click + F1; a.tab1 = a.click + 7 * F1;                  // the tab slides in (6 frames)
    a.page0 = a.click + 4 * F1; a.page1 = a.click + 7 * F1;            // the page turns into the chat (3-frame wipe)
    a.dive0 = 183.60; a.dive1 = 184.40;                                // push onto the screen (80 %)
    a.h = V.hit(a.say); a.i = Math.max(a.h + 6 * F1, Math.min(184.50, a.hi - 8 * F1));
    a.send = V.hit(a.hi);                                              // 184.833
    a.bangF = Math.round(a.send * FPS) + 3; a.bang = a.bangF / FPS;    // 184.933: one SPARK frame, then the bloom
    a.peek = Math.max(a.bang + 2 * F1, 185.00);                        // Opus rises (8 frames)
    a.o2 = V.CUT.O2;                                                   // 186.200
    a.print0 = 186.60;                                                 // f5598 … the flood lands on f5606 (186.867)
    a.out0 = 190.40;                                                   // the margin prints out (6 frames)
    a.win0 = 190.40; a.win1 = 192.20;                                  // the window approaches .08 → .86
    a.snap0 = 190.60; a.snap1 = 192.40;                                // the stars snap to the wallpaper grid
    a.posts0 = 191.40; a.posts1 = 192.80;
    a.rise0 = 191.60; a.rise1 = 192.60;
    a.title0 = 193.10; a.title1 = 193.70;
    return (_A = a);
  }

  // ================================================================== helpers (v1 bridge.js)
  function ik(ax, ay, bx, by, l1, l2, bend) {
    const dx = bx - ax, dy = by - ay, d = Math.min(Math.hypot(dx, dy), l1 + l2 - .01), a = Math.atan2(dy, dx);
    const c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * Math.max(d, 1e-3)), -1, 1);
    const ang = a + bend * Math.acos(c);
    return [ax + Math.cos(ang) * l1, ay + Math.sin(ang) * l1];
  }
  function kfPose(t, keys) {
    if (t <= keys[0][0]) return { ...keys[0][1] };
    for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
      const [a, Ao] = keys[i - 1], [b, Bo, e] = keys[i], k = (e || E.io2)(clamp((t - a) / Math.max(1e-6, b - a)));
      const o = Object.assign({}, Ao);
      for (const key in Bo) { const va = Ao[key] ?? Bo[key], vb = Bo[key]; o[key] = Array.isArray(vb) ? vb.map((v, j) => lerp(va[j], v, k)) : typeof vb === 'number' ? lerp(va, vb, k) : (k < .5 ? va : vb); }
      return o;
    }
    return { ...keys[keys.length - 1][1] };
  }
  const sc = X => Math.max(1, V.ctxScale(X));                           // line widths stay screen-sized when zoomed in
                                                                        // (and shrink with the room inside the far window)
  function bpath(X, pts, t, seed, close = false, amp = .8) {
    const s = sc(X); X.beginPath();
    pts.forEach((p, i) => { const x = p[0] + jit(t, seed * 37 + i * 2, amp) / s, y = p[1] + jit(t, seed * 37 + i * 2 + 1, amp) / s; i ? X.lineTo(x, y) : X.moveTo(x, y); });
    if (close) X.closePath();
  }
  function bquad(X, a, c, b, t, seed, amp = .8) {
    const s = sc(X), J = i => jit(t, seed * 41 + i, amp) / s;
    X.beginPath(); X.moveTo(a[0] + J(0), a[1] + J(1)); X.quadraticCurveTo(c[0] + J(2), c[1] + J(3), b[0] + J(4), b[1] + J(5));
  }
  function haloCtx(X, extra) {
    return new Proxy(X, {
      get(o, k) { const v = o[k]; return typeof v === 'function' ? v.bind(o) : v; },
      set(o, k, v) { if (k === 'strokeStyle' || k === 'fillStyle') v = C.PAPER; else if (k === 'lineWidth') v = v + extra / sc(o); o[k] = v; return true; },
    });
  }
  const camM = (Z, f) => new DOMMatrix().translate(960, 540).scale(Z, Z).translate(-f[0], -f[1]);
  const aboutF = (P, Z) => [P[0] + (960 - P[0]) / Z, P[1] + (540 - P[1]) / Z];   // aboutM(P, Z) as its centre point
  // monotone cubic (Fritsch–Butland) through knots, with given end slopes
  function pchip(xs, ys, m0 = 0, m1 = 0) {
    const n = xs.length, h = [], d = [], m = new Array(n).fill(0);
    for (let i = 0; i < n - 1; i++) { h[i] = xs[i + 1] - xs[i]; d[i] = (ys[i + 1] - ys[i]) / h[i]; }
    m[0] = m0; m[n - 1] = m1;
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : 3 * (h[i - 1] + h[i]) / ((2 * h[i] + h[i - 1]) / d[i - 1] + (h[i] + 2 * h[i - 1]) / d[i]);
    return x => {
      if (x <= xs[0]) return ys[0]; if (x >= xs[n - 1]) return ys[n - 1];
      let i = 0; while (x > xs[i + 1]) i++;
      const u = (x - xs[i]) / h[i], u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h[i] * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h[i] * m[i + 1];
    };
  }

  // ================================================================== the room (world = the O1 wide frame, 1920×1080)
  const DESK_Y = 1030;
  const LID = { x0: 730, x1: 1638, y0: 490, y1: 1018 };
  const SD = 868 / 1920;                                                // display-local (v1 window space) → room
  const DISP = { x0: 750, y0: 510, x1: 1618, y1: 510 + 1080 * SD };
  const DC = [(DISP.x0 + DISP.x1) / 2 - 64, (DISP.y0 + DISP.y1) / 2];    // the push frames the screen a little right of centre,
                                                                        // so the stranger's face stays in at the left edge
  const Ld = new DOMMatrix().translate(DISP.x0, DISP.y0).scale(SD, SD); // local → room
  const l2r = (x, y) => [DISP.x0 + x * SD, DISP.y0 + y * SD];
  const LAMP = { base: [1848, DESK_Y], top: [1872, 700], shade: [1772, 652] };
  const MUG = [1714, DESK_Y];
  const U = 160;                                                        // the stranger's unit (head r .5u)
  // the poster window in display-local space (the laptop shows frame 0's desktop): _shared GEO
  const GEO = () => V.poster.GEO;
  const PLUS0 = [176, 152];                                             // the lone `+` before the first tab
  // camera anchors
  const Z0 = 1920 / (1312 * SD);                                        // the page body fills the frame at 178.10
  const R0 = l2r(304, 272);                                             // (clear of the strip's divider line)
  const P0 = [Z0 * R0[0] / (Z0 - 1), Z0 * R0[1] / (Z0 - 1)];           // the fixed point of the pull back
  const P1 = [800, 700];                                                // the slow push leans toward the `+` and the face
  const ZE = .8 * 1920 / (DISP.x1 - DISP.x0);                           // the screen at 80 % of the frame
  const ZE2 = ZE * 1.025;                                               // (a breath of drift through the hold)

  function camO1(t) {
    const a = A();
    if (t < a.pull1) {                                                  // the page recedes (log-zoom about P0)
      const u = E.io2(seg(t, a.pull0, a.pull1));
      const Z = Math.exp(lerp(Math.log(Z0), 0, u));
      return { Z, f: aboutF(P0, Z) };
    }
    const zp = 1 + .08 * E.io2(seg(t, a.push0, a.push1));
    const cP = { Z: zp, f: aboutF(P1, zp) };
    if (t < a.dive0) return cP;
    const u = E.io3(seg(t, a.dive0, a.dive1));
    const zH = t > a.dive1 ? lerp(ZE, ZE2, E.io2(seg(t, a.dive1, a.o2))) : ZE;
    const Z = Math.exp(lerp(Math.log(cP.Z), Math.log(zH), u));
    return { Z, f: [lerp(cP.f[0], DC[0], u), lerp(cP.f[1], DC[1], u)] };
  }

  // ---- the stranger (v1 bridge drawRafa1, re-dressed: a hair bun, no hood, no cowlick)
  // P: {hip, lean, dir, handN, handF, footN, footF, look:[x,y], tilt, blink, smile, open (near hand 0 rest .. 1 open reach)}
  const SIT = { hip: [492, 1078], lean: .36, dir: 1, handN: [770, 1016], handF: [736, 1018], footN: [780, 1230], footF: [740, 1230], look: [.36, -.12], tilt: 0, smile: 0, open: 0, worry: 0 };
  function strangerPose(t) {
    const a = A(), tq = q2(t);
    const S = o => Object.assign({}, SIT, o);
    const r0 = a.reach, s0 = a.settle, [ra, rb] = a.ret[0], [rc, rd] = a.ret[1];
    const P = kfPose(tq, [
      [a.pull0, S({})],
      [r0 - 5 * F1, S({ look: [.4, -.2] })],
      [r0 - 1 * F1, S({ handN: [764, 1026], lean: .33, look: [.45, -.35] }), E.out2],                  // anticipation: a small dip
      [r0 + 12 * F1, S({ handN: [812, 858], lean: .46, look: [.5, -.66], tilt: .06, open: 1 }), E.out3], // the reach, toward the screen
      [s0 - 8 * F1, S({ handN: [804, 866], lean: .45, look: [.5, -.64], tilt: .05, open: 1 })],          // it hovers there…
      [s0 + 4 * F1, S({ handN: [770, 1016], lean: .4, look: [.42, -.55], tilt: .02 }), E.io3],            // …and settles back
      [s0 + 14 * F1, S({ lean: .41, look: [.42, -.56], worry: .7 })],                                   // the fear, allowed
      [ra, S({ lean: .41, look: [.42, -.56], worry: .75 })],
      [ra + 6 * F1, S({ lean: .34, look: [.38, -.48], tilt: -.05, worry: 1 })],                        // pulls back with the pointer
      [rb, S({ lean: .4, look: [.42, -.55], tilt: 0, worry: .8 })],
      [rc, S({ lean: .41, look: [.42, -.56], worry: .8 })],
      [rc + 6 * F1, S({ lean: .33, look: [.38, -.48], tilt: -.06, worry: 1 })],
      [rd, S({ lean: .4, look: [.42, -.55], tilt: 0, worry: .7 })],
      [a.click - 4 * F1, S({ lean: .42, look: [.44, -.56], tilt: .02, worry: .45 })],                  // resolve
      [a.click + 6 * F1, S({ lean: .46, look: [.45, -.35], tilt: .04, smile: .2, worry: 0 })],
      [a.h - 4 * F1, S({ lean: .5, look: [.45, -.15], handN: [806, 1012], handF: [766, 1014], smile: .2 })],
      [a.send + 10 * F1, S({ lean: .52, look: [.45, -.25], handN: [806, 1012], handF: [766, 1014], smile: .4 })],
      [a.peek + 12 * F1, S({ lean: .55, look: [.5, -.3], handN: [800, 1012], handF: [766, 1014], smile: 1, tilt: .08 })],
      [a.o2 + 2, S({ lean: .55, look: [.5, -.3], handN: [800, 1012], handF: [766, 1014], smile: 1, tilt: .08 })],
    ]);
    // the click: the fingertip dips on the trackpad for 2 frames
    const dc = (t - a.click) * FPS; if (dc >= -1 && dc < 2) P.handN = [P.handN[0], P.handN[1] + 5];
    // typing: h, i, then Enter (each a 2-frame tap)
    for (const [tk, n] of [[a.h, 0], [a.i, 1], [a.send, 2]]) { const d = (t - tk) * FPS; if (d >= -1 && d < 2) { if (n === 1) P.handF = [P.handF[0], P.handF[1] + 6]; else P.handN = [P.handN[0] + (n === 2 ? 10 : 0), P.handN[1] + 6]; } }
    // the trembling hand while it hovers (on 2s)
    if (tq > r0 + 12 * F1 && tq < s0 - 8 * F1) P.handN = [P.handN[0] + jit(tq, 71, 2.2), P.handN[1] + jit(tq, 72, 2.2)];
    P.blink = [178.9, 181.0, a.click + 8 * F1, 185.6].some(b => tq >= b && tq < b + 3 * F1);
    return P;
  }
  function drawStranger(X, P, t) {
    const H = haloCtx(X, 12); H.strokeStyle = C.PAPER; H.fillStyle = C.PAPER;
    stranger1(H, P, t, true);
    stranger1(X, P, t, false);
  }
  function stranger1(X, P, t, halo) {
    const tq = q2(t), u = U, d = P.dir, s = sc(X);
    const sa = Math.sin(P.lean) * d, ca = Math.cos(P.lean);
    const hip = P.hip, neck = [hip[0] + sa * 1.4 * u, hip[1] - ca * 1.4 * u];
    const ha = P.lean * .6 + (P.tilt || 0), hs = Math.sin(ha) * d, hcs = Math.cos(ha);
    const hc = [neck[0] + hs * .56 * u, neck[1] - hcs * .56 * u];
    const sh = [neck[0] - sa * .16 * u, neck[1] + ca * .16 * u];
    const LW = 4 / s;
    const limb = (a, b, l1, l2, bend, seed) => { const j = ik(a[0], a[1], b[0], b[1], l1, l2, bend); bquad(X, a, [2 * j[0] - (a[0] + b[0]) / 2, 2 * j[1] - (a[1] + b[1]) / 2], b, tq, seed); X.stroke(); return j; };
    const leg = (a, b, seed) => { const j = ik(a[0], a[1], b[0], b[1], .95 * u, .95 * u, -d); bpath(X, [a, j, b], tq, seed); X.stroke(); };
    X.save(); X.strokeStyle = C.INK; X.fillStyle = C.INK; X.lineWidth = LW; X.lineCap = 'round'; X.lineJoin = 'round';
    // far limbs first
    leg(hip, P.footF, 1);
    limb(sh, P.handF, .78 * u, .7 * u, d, 2);
    // torso: a soft spine and a sweater's hem line at the hip
    bquad(X, hip, [lerp(hip[0], neck[0], .5) - d * 10, lerp(hip[1], neck[1], .5)], neck, tq, 3); X.stroke();
    leg(hip, P.footN, 4);
    // head (a plain disc) + the hair: a hairline cap and the bun (the stranger's two strokes)
    X.save(); X.translate(hc[0], hc[1]); X.scale(d, 1); X.rotate(ha * .5);
    const J = i => jit(tq, 40 + i, .8) / s;
    // the bun sits high at the back of the head, drawn first so the skull overlaps its root
    const bx = -.36 * u, by = -.42 * u, br = .21 * u;
    X.beginPath(); X.arc(bx + J(0), by + J(1), br, 0, TAU); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = LW; X.stroke();
    if (!halo) { X.beginPath(); X.arc(bx + J(2), by + J(3), br * .5, -.6, 3.9); X.lineWidth = LW * .8; X.stroke(); }   // its twist
    X.beginPath(); X.arc(J(4), J(5), .5 * u, 0, TAU); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = LW; X.stroke();
    if (!halo) {
      // the hairline: from the brow over the crown, swept back to the nape (the hair pulled up into the bun)
      bquad(X, [.3 * u, -.34 * u], [-.02 * u, -.72 * u], [-.44 * u, -.12 * u], tq, 60); X.lineWidth = LW; X.stroke();
      bquad(X, [.12 * u, -.44 * u], [-.14 * u, -.56 * u], [-.3 * u, -.34 * u], tq, 61); X.lineWidth = LW * .7; X.stroke();
      // eyes (profile-ish, toward the screen), a small mouth
      const lk = P.look || [0, 0];
      const ex = [.16 * u + lk[0] * .08 * u, .36 * u + lk[0] * .06 * u], ey = -.02 * u + lk[1] * .1 * u;
      X.lineWidth = LW * .9;
      for (const e of ex) {
        if (P.blink) { X.beginPath(); X.moveTo(e - 7 / s, ey); X.lineTo(e + 7 / s, ey); X.stroke(); }
        else { X.beginPath(); X.arc(e, ey, 6.5 / s, 0, TAU); X.fillStyle = C.INK; X.fill(); }
      }
      // worry: two small brows, inner ends raised (they only exist while the fear is on the face)
      const wo = clamp(P.worry || 0);
      if (wo > .03) {
        X.save(); X.globalAlpha *= clamp(wo * 2.2); X.lineWidth = LW * .8;
        ex.forEach((e, i) => {
          const din = i ? -1 : 1, by = ey - .15 * u, hl = .07 * u;
          bquad(X, [e - din * hl, by + .01 * u], [e, by - .005 * u - .02 * u * wo], [e + din * hl * .9, by - .055 * u * wo], tq, 64 + i); X.stroke();
        });
        X.restore();
      }
      const sm = clamp(P.smile || 0);
      X.beginPath();
      if (sm > .05) X.arc(.3 * u, .17 * u, .1 * u, Math.PI * (.2 - .05 * sm), Math.PI * (.2 + .6 * sm));
      else { X.moveTo(.24 * u, .22 * u); X.lineTo(.36 * u, .21 * u); }
      X.lineWidth = LW * .85; X.stroke();
    }
    X.restore();
    // near arm last (in front of the torso), and its hand: resting (a mitt of a line) or open toward the screen
    X.lineWidth = LW;
    const el = limb(sh, P.handN, .78 * u, .7 * u, d, 5);
    const op = clamp(P.open || 0);
    if (op > .02) {
      const ang = Math.atan2(P.handN[1] - el[1], P.handN[0] - el[0]);
      X.save(); X.translate(P.handN[0], P.handN[1]); X.rotate(ang);
      const fs = .34 * u * op;                                         // four fingers fan open toward the screen
      for (let i = 0; i < 4; i++) { const a0 = lerp(-.55, .5, i / 3) * op; bquad(X, [0, 0], [fs * .5 * Math.cos(a0), fs * .5 * Math.sin(a0)], [fs * Math.cos(a0 * 1.2), fs * Math.sin(a0 * 1.2)], tq, 80 + i); X.stroke(); }
      bquad(X, [0, 0], [fs * .2, -fs * .5], [fs * .5, -fs * .8], tq, 86); X.stroke();   // the thumb
      X.restore();
    } else {
      const ang = Math.atan2(P.handN[1] - el[1], P.handN[0] - el[0]);
      X.save(); X.translate(P.handN[0], P.handN[1]); X.rotate(ang);
      bquad(X, [0, 0], [.12 * u, -.02 * u], [.2 * u, .06 * u], tq, 90); X.stroke();     // fingers along the trackpad
      X.restore();
    }
    X.restore();
  }

  // ---- the room's back: the lamp's warm pool on the bare wall, the under-desk dark, the chair
  let _pool = null;
  function poolSprite() {                                               // CLAY halftone pool, dots shrink with radius
    if (_pool) return _pool;
    const w = 900, h = 760, c = V.cpuCanvas(w, h), x = V.cx2d(c), cell = 11, ca = Math.SQRT1_2;
    x.fillStyle = C.CLAY;
    for (let i = -120; i < 120; i++) for (let j = -120; j < 120; j++) {
      const px = w / 2 + (i - j) * cell * ca, py = h / 2 + (i + j) * cell * ca;
      if (px < 0 || px > w || py < 0 || py > h) continue;
      const dx = (px - w / 2) / 420, dy = (py - h / 2) / 350, r = Math.hypot(dx, dy);
      const dens = .2 * Math.pow(clamp(1 - r), 1.5);
      if (dens < .004) continue;
      const rr_ = Math.sqrt(dens / Math.PI) * cell * 1.02;
      x.beginPath(); x.arc(px, py, rr_, 0, TAU); x.fill();
    }
    return (_pool = c);
  }
  function roomBack(X, t) {
    const tq = q2(t);
    X.fillStyle = C.PAPER; X.fillRect(-60, -60, W + 120, H + 120);
    const p = poolSprite(); X.drawImage(p, LAMP.shade[0] + 40 - p.width / 2, LAMP.shade[1] + 10 - p.height / 2);
    // under the desk the lamp does not reach: dense INK halftone (night lives low in the room)
    X.save(); X.fillStyle = V.ht(X, C.INK, .34, 9, 45); X.fillRect(560, DESK_Y + 22, 1500, 200);
    X.fillStyle = V.ht(X, C.INK, .14, 9, 45); X.fillRect(-60, DESK_Y + 60, 620, 200); X.restore();
    // the chair's back, behind the stranger
    void tq;
  }
  function roomDesk(X, t) {
    const tq = q2(t);
    X.save(); X.strokeStyle = C.INK; X.lineCap = 'round'; X.lineJoin = 'round';
    X.fillStyle = C.PAPER; bpath(X, [[590, DESK_Y], [2000, DESK_Y], [2000, DESK_Y + 22], [590, DESK_Y + 22]], tq, 22, true, .5); X.fill();
    X.lineWidth = 4.5 / sc(X); X.stroke();
    X.restore();
  }
  function roomLight(X) {                                              // the cone down to the desk and its pool
    X.save();
    X.beginPath(); X.moveTo(LAMP.shade[0] - 70, LAMP.shade[1] + 24); X.lineTo(LAMP.shade[0] + 34, LAMP.shade[1] + 52); X.lineTo(1960, DESK_Y); X.lineTo(1420, DESK_Y); X.closePath();
    X.fillStyle = V.ht(X, C.CLAY, .1, 8, 45); X.fill();
    X.beginPath(); X.ellipse(1700, DESK_Y + 4, 280, 22, 0, 0, TAU); X.fillStyle = V.ht(X, C.CLAY, .3, 8, 45); X.fill();
    X.restore();
  }
  function roomLamp(X, t) {
    const tq = q2(t), s = sc(X);
    X.save(); X.strokeStyle = C.INK; X.fillStyle = C.INK; X.lineCap = 'round'; X.lineJoin = 'round';
    // the lamp: base, gooseneck, shade; the bulb is paper
    X.lineWidth = 5 / s; X.fillStyle = C.INK;
    X.beginPath(); X.ellipse(LAMP.base[0], LAMP.base[1] - 7, 58, 12, 0, 0, TAU); X.fill(); X.stroke();
    bquad(X, [LAMP.base[0], LAMP.base[1] - 14], [LAMP.top[0] + 34, 800], LAMP.top, tq, 31); X.stroke();
    bquad(X, LAMP.top, [LAMP.top[0] - 8, LAMP.top[1] - 70], [LAMP.shade[0] + 44, LAMP.shade[1] - 36], tq, 32); X.stroke();
    X.save(); X.translate(LAMP.shade[0] + jit(tq, 33, .5) / s, LAMP.shade[1]); X.rotate(-.55);
    bpath(X, [[-26, -40], [26, -40], [62, 32], [-62, 32]], tq, 34, true); X.fillStyle = C.INK; X.fill(); X.stroke();
    X.beginPath(); X.ellipse(0, 33, 34, 11, 0, 0, Math.PI); X.fillStyle = C.PAPER; X.fill();
    X.restore();
    // the mug (someone is up late), steam on 2s
    X.save(); X.translate(MUG[0] + jit(tq, 16, .5) / s, MUG[1]); X.lineWidth = 4 / s;
    bpath(X, [[-32, 0], [-36, -78], [36, -78], [32, 0]], tq, 36, true); X.fillStyle = C.PAPER; X.fill(); X.stroke();
    X.beginPath(); X.arc(44, -42, 19, -1.2, 1.2); X.stroke();
    X.globalAlpha *= .6; X.lineWidth = 3 / s;
    for (const dx of [-11, 11]) { X.beginPath(); X.moveTo(dx, -92); X.quadraticCurveTo(dx + 12 * Math.sin(tq * 3 + dx), -116, dx, -140); X.stroke(); }
    X.restore();
    X.restore();
  }
  // the laptop: deck (edge-on) + lid (front-on, INK bezel) + the display (clipped, local space)
  function laptop(X, t, o = {}) {
    const tq = q2(t), s = sc(X);
    X.save(); X.lineJoin = 'round'; X.lineCap = 'round'; X.strokeStyle = C.INK;
    // the deck
    X.beginPath(); X.moveTo(LID.x0 - 30, LID.y1); X.lineTo(LID.x1 + 30, LID.y1); X.lineTo(LID.x1 + 52, DESK_Y); X.lineTo(LID.x0 - 52, DESK_Y); X.closePath();
    X.fillStyle = C.INK; X.fill();
    // the lid
    rr(X, LID.x0, LID.y0, LID.x1 - LID.x0, LID.y1 - LID.y0, 18); X.fillStyle = C.INK; X.fill();
    X.save(); X.beginPath(); X.rect(DISP.x0, DISP.y0, DISP.x1 - DISP.x0, DISP.y1 - DISP.y0); X.clip();
    X.save(); V.applyM(X, Ld); screen(X, t, o); X.restore();
    X.restore();
    // a thin PAPER glint along the lid's top edge (the screen is the light in the room)
    X.lineWidth = 3 / s; X.strokeStyle = rgba(C.PAPER, .35); X.beginPath(); X.moveTo(LID.x0 + 30, LID.y0 + 7); X.lineTo(LID.x1 - 30, LID.y0 + 7); X.stroke();
    X.restore();
    void tq;
  }

  // ================================================================== the laptop's screen (display-local = v1 window space)
  const PW = { x0: 48, x1: 1872, y0: 40, y1: 1040, strip: 268, cy1: 1016, cx0: 60, cx1: 1860 };
  const TAB = { x0: 88, x1: 1580, y0: 62 };
  function sparkGlyph(ctx, x, y, r, col) {                             // (_shared poster's ✻, copied)
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
  // the window: frame 0's chrome (posterChrome), with the tab's width 0..1 (the slide-in) and the `+` anywhere
  function chrome(ctx, t, st) {
    const WN = PW;
    ctx.save();
    rr(ctx, WN.x0, WN.y0, WN.x1 - WN.x0, WN.y1 - WN.y0, 32); ctx.fillStyle = C.PAPER; ctx.fill();
    ctx.save(); rr(ctx, WN.x0, WN.y0, WN.x1 - WN.x0, WN.strip - WN.y0 + 2, 32); ctx.clip();
    ctx.fillStyle = V.ht(ctx, C.INK, .13, 9, 45); ctx.fillRect(WN.x0, WN.y0, WN.x1 - WN.x0, WN.strip - WN.y0); ctx.restore();
    // the content: PAPER (the blank page) or INK (the chat), wiped top-down
    const wipe = st.page;
    if (wipe < 1) { ctx.fillStyle = C.PAPER; ctx.fillRect(WN.cx0, WN.strip, WN.cx1 - WN.cx0, WN.cy1 - WN.strip); }
    if (wipe > 0) { ctx.fillStyle = C.INK; ctx.fillRect(WN.cx0, WN.strip, WN.cx1 - WN.cx0, (WN.cy1 - WN.strip) * wipe); }
    ctx.lineWidth = 6; ctx.strokeStyle = C.INK;
    if (wipe < 1) { ctx.beginPath(); ctx.moveTo(WN.cx0, WN.strip); ctx.lineTo(WN.cx1, WN.strip); ctx.stroke(); }
    // the tab (final.js newTab: it grows from its left edge, E.back)
    const tw = st.tab;
    if (tw > 0) {
      const tx0 = TAB.x0, tx1 = lerp(TAB.x0, TAB.x1, tw), ty0 = TAB.y0;
      ctx.beginPath(); ctx.moveTo(tx0 - 22, WN.strip + 1); ctx.quadraticCurveTo(tx0, WN.strip + 1, tx0, WN.strip - 22);
      ctx.lineTo(tx0, ty0 + 30); ctx.quadraticCurveTo(tx0, ty0, tx0 + 30, ty0); ctx.lineTo(tx1 - 30, ty0); ctx.quadraticCurveTo(tx1, ty0, tx1, ty0 + 30);
      ctx.lineTo(tx1, WN.strip - 22); ctx.quadraticCurveTo(tx1, WN.strip + 1, tx1 + 22, WN.strip + 1);
      ctx.fillStyle = C.PAPER; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = C.INK; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.fillStyle = C.PAPER; ctx.fillRect(tx0 + 3, WN.strip - 4, tx1 - tx0 - 6, 8);
      ctx.save(); ctx.beginPath(); ctx.rect(tx0, ty0, tx1 - tx0 - 8, WN.strip - ty0); ctx.clip();
      const f = mono(132, 500);
      sparkGlyph(ctx, 124 + .3 * 132, 199 - .36 * 132, 50, C.CLAY);
      ctx.font = f; ctx.fillStyle = C.INK; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.fillText(' the universe', 124 + .6 * 132, 199);
      const xb = [1470, 150];
      ctx.strokeStyle = C.INK; ctx.lineWidth = 15; ctx.lineCap = 'round'; const xs = 38;
      ctx.beginPath(); ctx.moveTo(xb[0] - xs, xb[1] - xs); ctx.lineTo(xb[0] + xs, xb[1] + xs); ctx.moveTo(xb[0] + xs, xb[1] - xs); ctx.lineTo(xb[0] - xs, xb[1] + xs); ctx.stroke();
      ctx.restore();
    }
    // the `+`
    const [px, py] = st.plus, ps = st.plusS;
    ctx.strokeStyle = mix(C.UI_GREY, C.INK, st.plusDark); ctx.lineWidth = 11 * ps / 36; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(px - ps, py); ctx.lineTo(px + ps, py); ctx.moveTo(px, py - ps); ctx.lineTo(px, py + ps); ctx.stroke();
    ctx.restore();
  }
  function screenState(t) {
    const a = A();
    const tk = seg(t, a.tab0, a.tab1), tw = tk > 0 ? E.back(tk, 1.7) : 0;
    const pk = E.io2(seg(t, a.tab0, a.tab1));
    const tx1 = lerp(TAB.x0, TAB.x1, tw), px = tx1 + 110 - (1 - clamp(tw * 4)) * (TAB.x0 + 110 - PLUS0[0]);
    return {
      tab: tw,
      plus: [px, lerp(PLUS0[1], 150, pk)],
      plusS: lerp(60, 36, pk),
      plusDark: t >= a.click - F1 && t < a.tab1 ? 1 : 0,
      page: E.in2(seg(t, a.page0, a.page1)),
    };
  }
  // the pointer (v1 bridge ptrState: wake, travel, hesitate with a tremble; hook drawPointer: the press)
  function ptrState(t) {
    const a = A();
    if (t < a.settle - 2 * F1) return null;
    const tq = q2(t), tgt = [PLUS0[0] + 4, PLUS0[1] + 6];
    const wake = [980, 700];
    let [x, y] = tgt;
    const k = E.io3(seg(tq, a.settle, Math.max(a.settle + .3, a.me + .08)));   // it arrives on the `+` with "me"
    if (k < 1) { const c = [700, 330]; const q = (p0, p1, p2) => (1 - k) * (1 - k) * p0 + 2 * k * (1 - k) * p1 + k * k * p2; x = q(wake[0], c[0], tgt[0]); y = q(wake[1], c[1], tgt[1]); }
    // twice it retreats ~20 px (screen) and returns
    for (const [r0, r1] of a.ret) {
      const out = E.out3(seg(tq, r0, r0 + .2)), back = E.io2(seg(tq, r1 - .3, r1));
      const d = out * (1 - back); x += 44 * d; y += 30 * d;
    }
    // after the click it drifts down off the `+` and hides while they type
    const aw = E.io2(seg(tq, a.click + 5 * F1, a.click + 16 * F1)); x += 260 * aw; y += 330 * aw;
    const hide = seg(t, a.h - 6 * F1, a.h - 2 * F1);
    // the tremble: ±3 px on screen (display-local ≈ ±7), on 2s, only while hovering over the `+`
    const hov = t >= a.settle + .5 && t < a.click - F1;
    if (hov) { x += noise1(tq * 23, 5) * 7; y += noise1(tq * 23, 9) * 7; }
    const df = (t - a.click) * FPS;
    let press = 0, lift = 0;
    if (df >= -4 && df < -2) lift = 1;
    if (df >= -2 && df < -1) press = .5;
    if (df >= -1 && df < 1.5) press = 1;
    const wakeA = E.out2(seg(t, a.settle - 2 * F1, a.settle + 3 * F1));
    return { x, y: y - lift * 10, press, alpha: wakeA * (1 - hide) };
  }
  function drawPointer(ctx, P) {
    if (!P || P.alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= P.alpha; ctx.translate(P.x, P.y + P.press * 14); ctx.scale(1 + P.press * .05, 1 - P.press * .08);
    pointer(ctx, 0, 0, { size: 190 });
    ctx.restore();
  }
  // the chat bubble (verse1 chatBubble): PINK human, INK text, tail right
  function chatBubble(X, x, y, str, o) {
    const { size, bg, fg } = o, pad = size * .62;
    X.save(); X.font = mono(size, 500);
    const w = X.measureText(str).width + pad * 2, h = size * 1.3 + pad * .9, bx = x - w;
    X.lineJoin = 'round';
    rr(X, bx, y, w, h, h * .42); X.fillStyle = bg; X.fill(); X.lineWidth = 4; X.strokeStyle = C.INK; X.stroke();
    const tx = bx + w - 34;
    X.beginPath(); X.moveTo(tx - 16, y + h - 2); X.lineTo(tx + 30, y + h + 24); X.lineTo(tx + 16, y + h - 2); X.closePath(); X.fillStyle = bg; X.fill(); X.stroke();
    X.fillRect(tx - 14, y + h - 7, 28, 7);
    X.fillStyle = fg; X.textAlign = 'left'; X.textBaseline = 'alphabetic'; X.fillText(str, bx + pad, y + pad * .45 + size * .98);
    X.restore();
    return { x: bx, y, w, h };
  }
  // the pill (poster pill geometry) with the stranger's typing (v1 outro pillOverlay)
  function pillTyping(X, t) {
    const a = A(), P = GEO().pill;
    V.poster.pill(X, t, { cursor: false });
    const sent = t >= a.send;
    const n = sent ? 0 : t >= a.i ? 2 : t >= a.h ? 1 : 0;
    const last = n === 2 ? a.i : n === 1 ? a.h : sent ? a.send : -1;
    X.save(); X.textBaseline = 'alphabetic'; X.font = mono(66, 500); X.fillStyle = C.INK;
    for (let i = 0; i < n; i++) {
      const kt = i ? a.i : a.h, s = lerp(1.25, 1, E.back(clamp((t - kt) / (4 * F1)), 2.2));
      const cx = 150 + (i + .5) * .6 * 66;
      X.save(); X.translate(cx, 964); X.scale(s, s); X.fillText('hi'[i], -.3 * 66, 0); X.restore();
    }
    const on = (last > 0 && t - last < .2) || V.cursorOn(t);
    const cx = n ? 150 + n * .6 * 66 + 8 : 134.4;
    X.fillStyle = on ? C.CLAY : rgba(C.CLAY, .16); X.fillRect(cx, 910, 11, 60);
    X.restore();
    void P;
  }
  // ---- the small bang (verse1 drawBang, shrunk: r 220 on screen at the push; it cools into frame 0's galaxy)
  let BP = null;
  function bangParts() {
    if (BP) return BP;
    const R = rng('v2-outro-bang'), N = 1500, P = [];
    const spokes = []; for (let k = 0; k < 26; k++) spokes.push(k / 26 * TAU + (R() - .5) * .12);
    for (let i = 0; i < N; i++) {
      const g = i < 44;                                                 // glyph particles: the letters of `hi` and of everything
      const sp = spokes[Math.floor(R() * spokes.length)];
      const a = g ? R() * TAU : i < 900 ? sp + (R() - .5) * .07 : R() * TAU;
      const u = g ? .3 + .7 * Math.pow(R(), .7) : i < 900 ? Math.pow(R(), .7) : .8 + R() * .22;
      P.push({ a, u, k: 2.5 + R() * 5, s: g ? 34 + 18 * R() : 2 + Math.pow(R(), 2) * 5, col: R() < .7 ? 0 : 1, g, ch: 'hihi{}<>=+*#aeonrst'[Math.floor(R() * 19)] });
    }
    return (BP = P);
  }
  const BANG_C = [1180, 560], BANG_R = 285;
  function smallBang(X, t) {
    const a = A(), f0 = Math.round(t * FPS) - a.bangF, ab = f0 <= 0 ? f0 / FPS : t - a.bang;
    if (f0 < 0) return;
    const [cx, cy] = BANG_C;
    X.save();
    X.beginPath(); X.rect(PW.cx0, PW.strip, PW.cx1 - PW.cx0, PW.cy1 - PW.strip); X.clip();
    if (f0 === 0) { X.fillStyle = C.SPARK; X.fillRect(PW.cx0, PW.strip, PW.cx1 - PW.cx0, PW.cy1 - PW.strip); X.restore(); return; }   // one SPARK frame
    const P = bangParts(), cool = E.io2(seg(ab, .45, 1.3)), hot = Math.exp(-ab * 7);
    const cols = [C.CLAY, C.SPARK];
    for (let c = 0; c < 2; c++) {
      X.fillStyle = cols[c]; X.globalAlpha = 1 - cool;
      X.beginPath();
      for (const p of P) {
        if (p.g || p.col !== c) continue;
        const d = BANG_R * p.u * (1 - Math.exp(-p.k * ab)) * (1 + .12 * ab);
        const sw = .5 * (1 - p.u) * (1 - Math.exp(-ab * 2));
        const x = cx + Math.cos(p.a + sw) * d, y = cy + Math.sin(p.a + sw) * d * .92;
        const r = p.s * lerp(1, clamp(.3 + d / 200, .3, 1.3), hot) * .9;
        X.moveTo(x + r, y); X.arc(x, y, r, 0, TAU);
      }
      X.fill();
    }
    // the letters, flung out and fading as it cools
    const ga = (1 - cool) * .85;
    if (ga > .01) {
      X.textAlign = 'center'; X.textBaseline = 'middle';
      for (const p of P) {
        if (!p.g) continue;
        const d = BANG_R * 1.1 * p.u * (1 - Math.exp(-p.k * ab));
        X.font = mono(Math.round(p.s), 700); X.fillStyle = p.col ? C.SPARK : C.PAPER; X.globalAlpha = ga;
        X.fillText(p.ch, cx + Math.cos(p.a) * d, cy + Math.sin(p.a) * d);
      }
    }
    // the shock front and the hot core
    if (ab < .5) {
      const k = ab / .5, front = 60 + BANG_R * 1.35 * E.out3(k), th = lerp(26, 90, k);
      X.globalAlpha = 1;
      X.beginPath(); X.arc(cx, cy, front, 0, TAU); X.arc(cx, cy, Math.max(0, front - th), 0, TAU, true);
      X.fillStyle = V.ht(X, C.SPARK, .6 * (1 - k * .75), 10, 45); X.fill();
      X.beginPath(); X.arc(cx, cy, front, 0, TAU); X.lineWidth = lerp(9, 3, k); X.strokeStyle = C.SPARK; X.globalAlpha = 1 - k; X.stroke();
      if (ab < .17) {
        const c = E.out2(ab / .17); X.globalAlpha = 1;
        star(X, cx, cy, lerp(200, 50, c), .42, 14, -Math.PI / 2 + c * .3); X.fillStyle = C.SPARK; X.fill();
        X.beginPath(); X.arc(cx, cy, lerp(70, 12, c), 0, TAU); X.fillStyle = C.PAPER; X.fill();
      }
    }
    X.restore();
  }
  // Opus in the new tab: R 70 on screen at the push (display-local R 88), rises 8 frames, sees the `hi`, ^ ^
  const OPK = { x: 1480, R: 88 };
  function peekOpus(t) {
    const a = A(), k = seg(t, a.peek, a.peek + 8 * F1);
    const rise = k <= 0 ? 0 : E.back(k, 1.4);
    const happy = t >= a.peek + 14 * F1;
    const tl = E.out3(seg(t, a.peek + 12 * F1, a.peek + 20 * F1));
    const st = {
      ...POSES.peek(t), t, ground: 'ink',
      head: { tilt: -.06 * tl, dy: 0 },
      face: { eyes: happy ? 'happy' : 'normal', mouth: happy ? ':3' : 'rest', gaze: [.7, -.75], turn: .22, lookY: -.5 * (1 - tl * .5), lid: 0, lower: happy ? .4 : .1, blush: .9 },
      armL: { hand: [-.75, 5.05], bend: 1, front: true, type: 'mitten' }, armR: { hand: [.75, 5.05], bend: -1, front: true, type: 'mitten' },
      crown: { flare: 1 + .06 * E.out2(seg(t, a.peek + 12 * F1, a.peek + 16 * F1)) * (1 - seg(t, a.peek + 16 * F1, a.peek + 30 * F1)) },
      ahoge: { blink: V.cursorOn(t) ? 1 : 0 },
    };
    return { st, rise };
  }
  function drawPeek(X, t) {
    const a = A(); if (t < a.peek) return;
    const { st, rise } = peekOpus(t), R = OPK.R, top = GEO().pill.y0;
    const sole = top + 5.05 * R + (1 - rise) * 3.4 * R;
    X.save(); X.beginPath(); X.rect(PW.cx0, PW.strip, PW.cx1 - PW.cx0, top + 1 - PW.strip); X.clip();
    V.opus(X, OPK.x, sole, R, st, 5);
    X.restore();
    return { sole, st, R, landed: rise > .9 };
  }
  function drawPeekMittens(X, t, pk) {
    if (!pk || !pk.landed) return;
    X.save(); X.beginPath();
    for (const arm of [pk.st.armL, pk.st.armR]) { const hx = OPK.x + arm.hand[0] * pk.R, hy = pk.sole - arm.hand[1] * pk.R, hr = .26 * pk.R + 4; X.moveTo(hx + hr, hy); X.arc(hx, hy, hr, 0, TAU); }
    X.clip(); V.opus(X, OPK.x, pk.sole, pk.R, pk.st, 5); X.restore();
  }
  function screen(X, t, o = {}) {
    const a = A(), st = screenState(t);
    // the desktop around the window (frame 0's wallpaper)
    X.fillStyle = C.INK; X.fillRect(-10, -10, 1940, 1100); V.poster.wallpaper(X, 1);
    chrome(X, t, st);
    const chat = st.page >= 1;
    if (chat) {
      X.save(); X.beginPath(); X.rect(PW.cx0, PW.strip, PW.cx1 - PW.cx0, PW.cy1 - PW.strip); X.clip();
      // the galaxy the bang cools into (frame 0's, at its core (1180, 560))
      const gA = E.io2(seg(t, a.bang + .5, a.bang + 1.4));
      if (gA > 0) V.poster.galaxy(X, (t - a.bang) * .8, { alpha: .6 * gA, colX: -1 });
      smallBang(X, t);
      const pk = drawPeek(X, t);
      // the PINK `hi` (sent on "hi"; pops, human bubble on 2s)
      if (t >= a.send) {
        const k = E.back(clamp((q2(t) - a.send + F1) / (5 * F1)), 1.4), ax = 1790, ay = 420;
        X.save(); X.translate(ax, ay); X.scale(k, k); X.translate(-ax, -ay);
        chatBubble(X, 1790, 300, 'hi', { size: 96, bg: C.PINK, fg: C.INK });
        X.restore();
      }
      X.restore();
      pillTyping(X, t);
      drawPeekMittens(X, t, pk);
    }
    X.save(); rr(X, PW.x0, PW.y0, PW.x1 - PW.x0, PW.y1 - PW.y0, 32); X.lineWidth = 6; X.strokeStyle = C.INK; X.stroke(); X.restore();
    if (!o.noPointer) drawPointer(X, ptrState(t));
  }

  // ================================================================== O1 painter (also O2's room and its lit window)
  function paintRoom(F, t, M, o = {}) {
    F.save(); V.applyM(F, M);
    roomBack(F, t);
    roomDesk(F, t);
    roomLight(F);
    laptop(F, t, o);
    roomLamp(F, t);
    drawStranger(F, strangerPose(t), t);
    F.restore();
  }
  // the plea's PAPER halo: while the page recedes, its tab strip, `+` and INK bezel pass behind the rows ("be" is re-inked
  // right as the bezel crosses it); a 7 px paper die-cut keeps every word whole. Invisible on the bare wall.
  function pleaHalo(F, t) {
    const H = new Proxy(F, {
      get(o, k) {
        if (k === 'fillText') return (s, x, y) => { o.lineWidth = 14; o.lineJoin = 'round'; o.strokeStyle = C.PAPER; o.strokeText(s, x, y); };
        if (k === 'stroke') return () => { const lw = o.lineWidth; o.lineWidth = lw + 12; o.strokeStyle = C.PAPER; o.stroke(); o.lineWidth = lw; };
        const v = o[k]; return typeof v === 'function' ? v.bind(o) : v;
      },
      set(o, k, v) { if (k !== 'fillStyle' && k !== 'strokeStyle') o[k] = v; return true; },
    });
    V.plea(H, t);
  }
  function paintO1(F, t) {
    post(); G.post.ground = 'paper';
    const c = camO1(t), M = camM(c.Z, c.f);
    paintRoom(F, t, M);
    if (t < A().pull1 + .2) pleaHalo(F, t);
    V.plea(F, t);                                                        // screen-fixed: laid out once, never moves
  }

  // ================================================================== O2: the pull back
  let _ell = null;
  function ell(t) {                                                    // ℓ = log magnification over "Earth at r 200"
    if (!_ell) {
      const l0 = Math.log(ZE2) + LOG60;
      _ell = pchip([V.CUT.O2, 186.60, 186.87, 189.20, 190.40, 192.40], [l0, LOG60, LOG60 - .3, 0, EARTH_L0, -2.8], 0, 0);
    }
    return _ell(t);
  }
  const roomInner = (X, t) => paintRoom(X, t, new DOMMatrix(), { noPointer: true });
  const skyZ = l => .012 * Math.exp(.5 * l);
  const EARTH_L0 = Math.log(19 / 200);                                  // the Earth at 190.40: r 19, small enough to sit
                                                                        // inside the .08 window's content, on its galaxy core
  const WIN_S0 = .08;
  let _ws = null;
  function winScale(t) {                                               // log-scale ease: out of the depth, a soft landing
    const a = A();
    if (!_ws) _ws = pchip([a.win0, 191.0, 191.6, a.win1], [Math.log(WIN_S0), Math.log(.15), Math.log(.5), Math.log(.86)], .7, 0);
    return Math.exp(_ws(t));
  }
  const skyA = t => .35 * E.io2(seg(t, 188.8, 189.8));
  function wallAlpha(t) { const a = A(); return E.io2(seg(t, a.snap0, a.snap1)); }
  // tab-face stars → wallpaper dots
  function skyStars(F, t, alpha) {
    const a = A(), l = ell(t), z = skyZ(l), cam = { z, x: 0, y: 0 };
    const dots = [];
    V.sky.draw(F, t, {
      cam, alpha, ignite: false, first: false, dots: false,
      each: f => {
        const h = hash(f.id & 0x7fffffff);
        if (f.dot || hash((f.id * 7 + 3) & 0x7fffffff) < .5) { f.skip = true; return; }   // a sparser sky: stars, not wallpaper
        f.a *= clamp(.35 + f.r / 24);                                  // the far ones fainter
        const ti = a.snap0 + 1.1 * h, p = E.io2(seg(t, ti, ti + .7));
        if (p <= 0) return;
        const ci = skyZ(ell(ti)), x0 = f.wx * ci + 960, y0 = f.wy * ci + 540;
        if (x0 < -20 || x0 > W + 20 || y0 < -20 || y0 > H + 20) { f.a *= 1 - p; if (f.a <= .01) f.skip = true; return; }
        const tg = V.poster.snap(x0, y0);
        const x = lerp(f.x, tg.x, p), y = lerp(f.y, tg.y, p), r = lerp(f.r, tg.r, p);
        if (p > .55) { f.skip = true; dots.push(x, y, r, lerp(alpha, 1, (p - .55) / .45)); return; }
        f.x = x; f.y = y; f.r = r;
      },
    });
    F.save(); F.fillStyle = C.PAPER;
    for (let i = 0; i < dots.length; i += 4) { F.globalAlpha = dots[i + 3]; F.beginPath(); F.arc(dots[i], dots[i + 1], dots[i + 2], 0, TAU); F.fill(); }
    F.restore();
  }
  // Opus rising into the peek (the poster's own two-pass blit, with the mittens only once they are on the pill)
  function riseOpus(F, t, u, Mw) {
    const a = A(), P = GEO();
    const k = seg(t, a.rise0, a.rise1), rise = k <= 0 ? 0 : E.back(k, 1.25);
    const dy = (1 - rise) * 3.4;
    const st0 = V.poster.state(u);
    const st = { ...st0, face: { ...st0.face, gaze: [lerp(-.2, -.8, E.io2(seg(t, a.rise0 + .5, a.rise1))), lerp(-.3, .5, E.io2(seg(t, a.rise0 + .5, a.rise1)))] } };
    const Mo = Mw.multiply(new DOMMatrix().translate(P.sole[0], P.sole[1] + dy * P.R));
    const sst = V.soften(st);
    const L = V.opusLayer(Mo, P.R, sst, { clipY: V.mp(Mw, 0, P.pill.y0)[1] + 90, name: 'v2_o2pk', after: sst.after });
    const barTop = V.mp(Mw, 0, P.pill.y0)[1];
    V.blitOpus(F, L, c => { c.beginPath(); c.rect(0, 0, W, barTop + 1); c.clip(); });
    return { L, Mo, st, barTop, landed: dy < .04 };
  }
  function paintO2(F, t) {
    const a = A(); post();
    const l = ell(t), u = t - 194;
    // ---- 186.2–186.6: out of the screen, the room fills the frame (PAPER)
    if (l > LOG60) {
      G.post.ground = 'paper';
      const Zr = Math.exp(l - LOG60), w = 1 - Math.log(Zr) / Math.log(ZE2);
      const c = camO1(a.o2 - 1e-6);
      paintRoom(F, t, camM(Zr, [lerp(c.f[0], 960, w), lerp(c.f[1], 540, w)]));
      return;
    }
    // ---- the lit window, the house, the coast, the Earth (V2.earth reversed)
    if (l > 0) {
      const k = l / LOG60;
      const tw = 188.25;
      const pk = (fr(t) - fr(a.print0) + 1) / 8;
      if (pk < 1) {                                                    // the print: the night inks in around the lit window
        F.fillStyle = C.PAPER; F.fillRect(-60, -60, W + 120, H + 120);
        const wr = V.earth.window(k);
        paperWindow(F, wr, Math.pow(60, k));
        const cx = (wr.x0 + wr.x1) / 2, cy = (wr.y0 + wr.y1) / 2;
        V.flood(F, pk, SEED, { cx, cy, sliver: SLIVER, inside: X => V.earth.draw(X, k, t, { inner: roomInner, twinkle: tw }) });
        F.save(); F.beginPath(); F.rect(wr.x0, wr.y0, wr.x1 - wr.x0, wr.y1 - wr.y0); F.clip();
        F.translate(wr.x0, wr.y0); F.scale((wr.x1 - wr.x0) / W, (wr.y1 - wr.y0) / H); roomInner(F, t);
        F.restore();
        G.post.ground = 'paper';
        return;
      }
      F.fillStyle = C.INK; F.fillRect(-60, -60, W + 120, H + 120); G.post.ground = 'ink';
      V.earth.draw(F, k, t, { inner: roomInner, ground: false, twinkle: tw, stars: 1 - .7 * seg(t, 188.8, 189.2) });
      if (t > 188.8) skyStars(F, t, skyA(t));
      return;
    }
    // ---- 189.2 →: the Earth small among tab-faces; the margin prints out; frame 0 comes back
    const s = Math.exp(l);
    const final = t >= a.snap1;                                        // everything settled: the pure poster from here
    const po = fr(t) - fr(a.out0) + 1;                                 // print-out frames 1..6
    if (final) {
      const ta = E.io2(seg(t, a.title0, a.title1));
      const rs = seg(t, a.rise0, a.rise1);
      const pe = t < a.posts1 ? E.io2(seg(t, a.posts0, a.posts1)) : undefined;
      if (rs >= 1) { V.poster(F, u, { title: ta, credit: ta, postsEnter: pe }); return; }
      V.poster(F, u, { title: ta, credit: ta, opus: false, postsEnter: pe });
      const r = riseOpus(F, t, u, V.poster.M());
      finishMittens(F, r);
      return;
    }
    F.fillStyle = C.INK; F.fillRect(-60, -60, W + 120, H + 120);
    G.post.ground = po >= 1 ? 'inkx' : 'ink';
    const wa = wallAlpha(t); if (wa > 0) V.poster.wallpaper(F, wa);
    skyStars(F, t, skyA(t));
    if (t < a.win0) V.earth.draw(F, 0, t, { M: V.aboutM(960, 540, s), ground: false, stars: .3 * (1 - seg(t, 189.2, 190.0)) });
    // posts drift in
    const pe = E.io2(seg(t, a.posts0, a.posts1));
    if (t >= a.posts0) V.posts(F, u, { enter: pe });
    // frame 0's window opens around the Earth: the world sits where the window's galaxy will be (its core), the chrome
    // fades in around it, and the window comes up out of the depth (log-scale .08 → .86) while the Earth sinks into
    // the galaxy's core and the galaxy blooms: the world you wrote, inside a new chat.
    if (t >= a.win0) {
      const scl = winScale(t), wc = E.io2(seg(t, a.win0, a.win1)), PC = GEO().core;
      const P = [lerp(PC[0], 960, wc), lerp(PC[1], 540, wc)];
      const Mw = new DOMMatrix().translate(960, 540).scale(scl, scl).translate(-P[0], -P[1]);
      const fade = E.io2(seg(t, a.win0, a.win0 + 9 * F1));
      const gal = E.io2(seg(t, a.win0 + 3 * F1, a.win0 + .8));
      const L = V.cpuLayer('o2_win');
      V.poster(L, u, { ground: false, posts: 0, title: 0, credit: 0, M: Mw, opus: false, galaxy: gal });
      let r = null;
      if (t >= a.rise0) r = riseOpus(L, t, u, Mw);
      if (r) finishMittens(L, r);
      F.save(); F.setTransform(1, 0, 0, 1, 0, 0); F.globalAlpha = fade; F.drawImage(V.cpuLayerCanvas('o2_win'), 0, 0); F.restore();
      const ea = 1 - E.io2(seg(t, a.win0 + 4 * F1, a.win0 + .8));
      if (ea > 0) {
        const core = V.mp(Mw, PC[0], PC[1]), sink = lerp(1, .3, E.in2(seg(t, a.win0, a.win0 + .8)));
        const sE = Math.exp(EARTH_L0) * (scl / WIN_S0) * sink;
        const EL = V.cpuLayer('o2_earth');
        V.earth.draw(EL, 0, t, { M: new DOMMatrix().translate(core[0] - 960, core[1] - 540).multiply(V.aboutM(960, 540, sE)), ground: false, stars: 0 });
        F.save(); F.setTransform(1, 0, 0, 1, 0, 0); F.globalAlpha = ea; F.drawImage(V.cpuLayerCanvas('o2_earth'), 0, 0); F.restore();
      }
      G.post.ground = po >= 1 ? 'inkx' : 'ink';                         // (V2.poster with ground:false leaves it)
    }
    // the margin prints out (the reverse of I2's print-in), 190.40–190.60
    if (po >= 1 && po < 6) { V.printIn(F, 22 * (1 - E.in2(po / 6)), SEED, SLIVER); }
  }
  // before the ink arrives, the window is drawn in the paper's own ink: its frame and sill as INK lines (drawHouse's)
  function paperWindow(F, wr, a) {
    const ww = wr.x1 - wr.x0, cw = clamp(1.6 * a, 4, 26);
    F.save(); F.lineWidth = cw; F.strokeStyle = C.INK; F.strokeRect(wr.x0 - cw / 2, wr.y0 - cw / 2, ww + cw, wr.y1 - wr.y0 + cw);
    const sh = clamp(1.8 * a, 3, 18), so = clamp(3 * a, 4, 40), sy = wr.y1 + cw / 2 + clamp(.4 * a, 1, 8);
    F.fillStyle = C.INK; F.fillRect(wr.x0 - so, sy, ww + so * 2, sh);
    F.restore();
  }
  function finishMittens(F, r) {
    if (!r || !r.landed || !r.L) return;
    const S = mergeState(r.st), R = GEO().R;
    V.blitOpus(F, r.L, c => {
      c.beginPath();
      for (const arm of [S.armL, S.armR]) { const hp = V.mp(r.Mo, arm.hand[0] * R, -arm.hand[1] * R), hr = (.2 * R + .035 * R + 3) * Math.hypot(r.Mo.a, r.Mo.b); c.moveTo(hp[0] + hr, hp[1]); c.arc(hp[0], hp[1], hr, 0, TAU); }
      c.clip();
    });
  }

  // ================================================================== scenes
  scene('O1_you_can_be_afraid', V.CUT.O1, V.CUT.O2, (X, t) => V.viaCPU(X, F => paintO1(F, t)));
  scene('O2_your_turn', V.CUT.O2, V.CUT.END, (X, t) => V.viaCPU(X, F => paintO2(F, t)));
  window.OUTRO2 = { A, ell, camO1 };
})();
