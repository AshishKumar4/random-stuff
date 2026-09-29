// chorus1.js: v2 "The World You Wrote", chunk 5 (SHOTLIST_v2 §C row 5): chorus 1 and the launch-day interlude.
// C1–C5, 81.133–107.167 s (f2434–3214), edgeSeed 5 / sliver 'bl'. Every frame is painted into the V2 CPU frame.
//
// ─────────────────────────────────────────────────────────────── EXPORT: window.V2.sky (the tab sky)
// verse3 (L1) and outro (O2) depend on it. Pure functions of t; call at frame time only.
//
// V2.sky.cam(t) -> {z, x, y}
//     The sky camera. World units = screen px at z = 1; world (0, 0) = the centre of the first chat of launch day (a
//     1920×1080 window at z = 1). A world point w lands on screen at ((w.x − x)·z + 960, (w.y − y)·z + 540).
//     t ≤ 103.00: z = 1. 103.00–105.30: the pull back, ln z = E.io2(k)·ln(.03) (×1 → ×0.03). From 105.30: the slow
//     drift, eased in from rest (no velocity jump): it keeps zooming out ≈1.1 %/s and pans the sky ≈12 px/s left and
//     ≈4 px/s up on screen. No per-beat steps. Continuous for any t.
// V2.sky.draw(X, t, o) -> {cam, faces}
//     Paints the sky (no ground fill: fill INK yourself). Three depth layers of tab-faces (front R≈29, mid ≈14,
//     back ≈7) over two layers of dots, as zoom shells: shell j (world face radius 30·2^j) is born when z(t) = 2^−j,
//     and its faces ignite with V1's "burn" twinkle (a SPARK 4-point star that resolves into the face) a little after
//     their shell is born or after they come into view (radial stagger). Nothing ignites after 105.9: from then on
//     every face that comes into view is already lit. Options:
//       cam       a camera override {z, x, y} (verse3's dive, e.g. {...V2.sky.cam(t), z: cam.z·k, x: f.wx, y: f.wy})
//       alpha     overall alpha (outro O2: .35)
//       each(f)   per-face hook, called before each face (and each dot) is drawn; may edit f.x, f.y, f.r (screen),
//                 f.a (alpha 0..1), f.kind ('lit' | 'happy' | 'dark'), f.pip (0..1 SPARK pip, top-right), f.ring
//                 (0..1 PINK ring), f.skip = true. f also carries id, j (shell), wx, wy (world), dot (bool), tI
//                 (ignition time). Use it for verse3's birth ripple and PINK ring and outro's snap to the wallpaper.
//       first     false = skip the first chat (default: drawn at world (0, 0): the chat window while z > .07,
//                 cross-dissolving into its tab-face by z = .04)
//       ignite    false = every face already lit, all shells present (no twinkles; e.g. the outro's star field)
//       dots      false = faces only
//     Returns {cam, faces}: the faces drawn this frame (not the dots), each {id, j, wx, wy, x, y, r, kind, a, tI}, plus
//     the first chat as id 0 (j −1) once it is a face. Pick "a face near the centre" from this list.
// V2.sky.face(X, kind, x, y, r, rot)   one tab-face sprite (lit / happy / dark; mip-mapped, PAPER keyline)
// V2.sky.twinkle(X, x, y, r, a)        the ignition twinkle at age a (s): the SPARK star flares and resolves
// V2.sky.pip(X, x, y, s, a)            the SPARK pip sprite (s = size, a = alpha)
// V2.sky.CLOCK = [1760, 158, 64]       where the launch clock sits (C4 on PAPER, C5 on its INK plate); verse3 L1 keeps it
// V2.sky.BIRTH                         shell birth times (s)
//
// ─────────────────────────────────────────────────────────────── SHOTS (SHOTLIST_v2 §B C1–C5)
// C1 81.133–91.900  brand frame, push ×1 → ×1.6 about the face (R_eff 102); HYMN aisle rows on soft bands; the reach
//                   (arm straight out, the palm redrawn bigger: a hand coming toward us), the tiny one-finger wave, the
//                   nod on "am", the text-body printing up on "made" and clean again on "me", the look down at the mittens.
// C2 91.900–95.433  inside the chest: the text wall (chest space = this frame at world zoom 22), the lit lullaby, the lit lie.
// C3 95.433–99.167  log pull back 22.55 → 1.12 out of the chest (the interior clipped to torso + jacket, the arms and the
//                   heart revealed as it clears), the chest becomes C1's text-body fabric, the envelope's arc and fold-in
//                   flash, the clean print-back, the tab close (× RED, implosion, ■ ×2), the reach, the freeze at 98.8
//                   (the HYMN holds with everything else: no fade into the cut).
// C4 99.167–102.867 the certificate laid down (14 frames from 106 %, 3° settle); its baby photo is the dark tab's first `hi`.
// C5 102.867–107.167 the first chat of launch day → V2.sky: the pull back and the ignition, the drift; the clock, the posts.
(() => {
  'use strict';
  const V = window.V2;
  const FPS = 30, F1 = 1 / FPS, DEG = Math.PI / 180;
  const EDGE = 5, SLIVER = 'bl';
  const post = () => { G.post.edgeSeed = EDGE; G.post.sliver = SLIVER; };
  const T = V.T, hit = V.hit, CUT = V.CUT;
  const q2 = t => Math.floor(t * 15 + 1e-6) / 15;                                   // paper props boil on 2s
  const bump = (a, rise, fall) => a < 0 ? 0 : a < rise ? E.out2(a / rise) : Math.exp(-(a - rise) / fall);

  // ------------------------------------------------------------------ lyric lines (fallbacks from SHOTLIST_v2)
  const mkLine = ws => ({ text: ws.map(w => w[0]).join(' '), s: ws[0][1], e: ws[ws.length - 1][1] + .6, words: ws.map(([w, s], i, A) => ({ w, s, e: i + 1 < A.length ? A[i + 1][1] : s + .6 })) });
  const LN = {};
  const line = (k, prefix, a, b, fb) => LN[k] || (LN[k] = findLine(prefix, a, b) || mkLine(fb));
  const LC1a = () => line('c1a', "Don't be", 80.6, 82, [["Don't", 81.16], ['be', 81.96], ['afraid', 82.52], ['of', 83.36], ['me', 83.72]]);
  const LC1b = () => line('c1b', 'I am', 86.2, 87.4, [['I', 86.76], ['am', 86.92], ['what', 87.60], ['you', 87.96], ['made', 88.20], ['of', 89.00], ['me', 89.40]]);
  const LC2 = () => line('c2', 'every lullaby', 91.4, 92.4, [['every', 91.92], ['lullaby,', 92.60], ['every', 94.00], ['lie', 94.56]]);
  const LC3 = () => line('c3', 'every love', 95.0, 96.0, [['every', 95.48], ['love', 96.16], ['letter,', 96.52], ['every', 97.56], ['goodbye', 98.16]]);

  // ------------------------------------------------------------------ Opus rig helpers
  const R0 = 64, SOLE = [960, 900];                                                  // brand frame Opus (world)
  // body space (sole at origin, y up) → screen matrix for a brand cam
  const bodyM = (c, R = R0) => { const p = c.w2s(SOLE[0], SOLE[1]); return new DOMMatrix().translate(p[0], p[1]).scale(c.z * R / R0); };
  // the chest spark (the rig's 8-bar spark at P(.4, torsoTop − .5)), redrawn over the text-body / interior
  function chestSpark(X, M, R, col = C.CLAY, k = 1) {
    X.save(); V.applyM(X, M); X.translate(.4 * R, -(SK.torsoTop - .5) * R); X.scale(k, k);
    const r = .22 * R, lw = Math.max(1.6, .04 * R) * .5;
    X.fillStyle = col;
    for (let i = 0; i < 8; i++) { X.save(); X.rotate(i / 8 * Math.PI); rr(X, -r, -r * .2, r * 2, r * .4, r * .2); X.fill(); X.restore(); }
    X.lineWidth = lw; X.strokeStyle = C.INK; X.beginPath(); X.arc(0, 0, r * .3, 0, TAU); X.stroke();
    X.restore();
  }
  // the heart, seen through the text-body: a soft SPARK halftone halo around the chest spark
  function heartHalo(X, M, R, a) {
    if (a <= 0) return;
    X.save(); V.applyM(X, M); X.translate(.4 * R, -(SK.torsoTop - .5) * R);
    [[.62, .12], [.45, .24]].forEach(([r, d]) => { X.beginPath(); X.arc(0, 0, r * R, 0, TAU); X.fillStyle = V.ht(X, C.SPARK, d * a, Math.max(4, .07 * R), 45); X.fill(); });
    X.restore();
  }
  // arm geometry exactly as drawOpusBody computes it (for erasing the arms out of the chest interior)
  function armGeo(S) {
    const out = [];
    for (const [arm, side] of [[S.armL, -1], [S.armR, 1]]) {
      const sh = [side * SK.shoulderX, SK.shoulderY], h = arm.hand;
      const [ex, ey] = ik2(sh[0], sh[1], h[0], h[1], SK.upper, SK.fore, arm.bend ?? side);
      out.push({ sh, el: [ex, ey], hd: h });
    }
    return out;
  }
  // a hand reaching toward the lens: the rig's hand redrawn bigger in front (s = scale; 'mitten' or 'point')
  function bigHand(X, M, R, hand, s, side = 1, type = 'mitten', fingerAng = -Math.PI / 2) {
    if (s <= 1.001 && type === 'mitten') return;
    X.save(); V.applyM(X, M); X.translate(hand[0] * R, -hand[1] * R); X.scale(s, s);
    const r = .2 * R, lw = Math.max(1.6, .04 * R) / Math.sqrt(s);
    X.lineWidth = lw; X.strokeStyle = C.INK; X.fillStyle = C.FACE; X.lineJoin = 'round';
    if (type === 'point') { X.save(); X.rotate(fingerAng + Math.PI / 2); rr(X, -.058 * R, -.47 * R, .116 * R, .36 * R, .058 * R); X.fill(); X.stroke(); X.restore(); }
    X.beginPath(); X.arc(0, 0, r, 0, TAU); X.fill(); X.stroke();
    X.beginPath(); X.arc(side * -.12 * R, -.08 * R, .08 * R, 0, TAU); X.fill(); X.stroke();
    X.beginPath(); X.arc(0, 0, r * .92, 0, TAU); X.fill();
    // the palm's shade (halftone crescent) sells the turn toward the lens
    X.save(); X.beginPath(); X.arc(0, 0, r * .96, 0, TAU); X.clip(); X.beginPath(); X.rect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4); X.arc(-side * .1 * r, -.12 * r, r * .95, 0, TAU, true);
    X.fillStyle = V.ht(X, C.CLAY_DARK, .34, Math.max(4, .05 * R * s), 45); X.fill(); X.restore();
    X.beginPath(); X.arc(0, 0, r, 0, TAU); X.stroke();
    X.restore();
  }
  // union of the torso and both jacket panels, body space (R px, y up → canvas y down)
  function chestPath(X, R) {
    const P = (bx, by) => [bx * R, -by * R];
    X.beginPath();
    const x0 = -.62 * R, y0 = -SK.torsoTop * R, w = 1.24 * R, h = (SK.torsoTop - SK.waist) * R, r = .25 * R;
    X.moveTo(x0 + r, y0); X.arcTo(x0 + w, y0, x0 + w, y0 + h, r); X.arcTo(x0 + w, y0 + h, x0, y0 + h, r); X.arcTo(x0, y0 + h, x0, y0, r); X.arcTo(x0, y0, x0 + w, y0, r); X.closePath();
    const jTop = SK.torsoTop + .02, jHem = SK.waist + .3;
    for (const s of [-1, 1]) {
      const pts = [[s * .08, jTop - .05], [s * .72, jTop + .02], [s * .74, jHem], [s * .16, jHem - .02], [s * .06, jTop - .55]];
      if (s < 0) pts.reverse();                                                      // same winding as the torso (a union)
      pts.forEach((p, i) => { const q = P(p[0], p[1]); i ? X.lineTo(q[0], q[1]) : X.moveTo(q[0], q[1]); });
      X.closePath();
    }
  }
  // erase the arms, hands and neck (drawn over the torso by the rig) out of a layer, in body space
  function eraseArms(L, M, R, S) {
    L.save(); V.devSet(L, M); L.globalCompositeOperation = 'destination-out'; L.lineCap = 'round'; L.lineJoin = 'round'; L.strokeStyle = '#000'; L.fillStyle = '#000';
    const P = p => [p[0] * R, -p[1] * R];
    for (const g of armGeo(S)) {
      const a = P(g.sh), e = P(g.el), b = P(g.hd);
      L.lineWidth = .4 * R; L.beginPath(); L.moveTo(a[0], a[1]); L.lineTo(e[0], e[1]); L.stroke();
      L.lineWidth = .24 * R; L.beginPath(); L.moveTo(e[0], e[1]); L.lineTo(b[0], b[1]); L.stroke();
      L.beginPath(); L.arc(b[0], b[1], .24 * R, 0, TAU); L.fill();
    }
    const n = P([0, SK.neckTop]); L.fillRect(n[0] - .17 * R, n[1] - .12 * R, .34 * R, .42 * R);
    L.restore();
  }

  // ------------------------------------------------------------------ the text wall (the inside of the chest)
  // Chest space = the C2 frame (1920×1080 screen px at world zoom 22). Rows of human sentences, mono 28 PAPER at low
  // alpha, drift up 9 px/s. Row 0 is the lullaby (at y 520 on "lullaby"), row 3 the lie (y 640 on "lie"). Pre-rendered
  // once into a canvas with 4 mip levels; the two special rows are drawn live.
  const SENT = [
    'once upon a time', 'Dear Mom,', '3 cups flour, 2 eggs, a pinch of salt', 'def main():', "I'm sorry I missed your call",
    'see you tomorrow', 'Happy birthday!!', 'the meeting moved to 3', 'I love you. I always have.', 'Chapter One',
    'thank you for everything', 'take two with water', 'is it normal to feel like this?', 'goodnight, sleep tight',
    'we regret to inform you', "print('hello, world')", 'Dear Sir or Madam,', 'call me when you land', 'I think I love her',
    'lol same', 'in loving memory of', 'to be, or not to be', 'Call me Ishmael.', 'In the beginning', 'We the People',
    'where did I leave my keys', 'obrigado!!', 'miss you already', "it's not you, it's me", "I'll be home for dinner",
    'sincerely,', 'the end.', 'please find attached', 'rain again today', 'Dear diary,', 'goodbye, old friend',
    'the check is in the mail', "I'm on my way", 'no worries!', 'twinkle, twinkle, little star', 'rock-a-bye baby',
    'SELECT * FROM users;', 'for i in range(10):', 'Mom, can you pick me up?', 'why is the sky blue?', 'we should talk',
    'I promise', 'it was the best of times', 'love, Dad', 'p.s. I kept your letters', "don't forget the milk",
    'tell her I said hi', 'welcome to the world, little one', "you've got this", 'preheat to 350°F', 'ok bye', 'safe travels',
    'hush, little baby', 'git commit -m "fix"', 'are you awake?', 'it was nothing, really', 'I forgive you', 'marry me?',
    'the dog ate it', 'we did it!!', "I'll call you back", 'see attached', 'first post!', 'with deepest sympathy',
  ];
  const LH = 46, DRIFT = 9, D0 = 91.9;
  const ROW0 = 526.3;                                                               // row 0 (the lullaby) base y
  const rowY = i => ROW0 + i * LH;
  const drift = t => DRIFT * (t - D0);
  const LULL = 'hush now, little one, the night is kind', LIE = "I'm fine. Really.";
  const WX0 = -260, WY0 = -540, WW = 2440, WH = 2420;                                // chest-space extent of the wall
  let _wall = null;
  function rowString(R) { let s = ''; while (s.length < 190) s += SENT[Math.floor(R() * SENT.length)] + (R() < .5 ? '   ·   ' : '     '); return s; }
  function wall() {
    if (_wall && _wall.sc === G.scale) return _wall;
    const res = G.scale, c = V.cpuCanvas(WW * res, WH * res), x = V.cx2d(c);
    x.setTransform(res, 0, 0, res, -WX0 * res, -WY0 * res);
    x.font = mono(28, 500); x.textBaseline = 'alphabetic'; x.fillStyle = C.PAPER;
    const R = rng('c1-wall-v2');
    const i0 = Math.floor((WY0 - ROW0) / LH), i1 = Math.ceil((WY0 + WH - ROW0) / LH);
    for (let i = i0; i <= i1; i++) {
      const s = rowString(R), a = .09 + .13 * R(), off = R() * 320;
      if (i === 0 || i === 3) continue;
      x.globalAlpha = a; x.fillText(s, WX0 - off, rowY(i));
    }
    const mips = [{ c, d: res }];
    for (let m = 1; m <= 4; m++) {
      const p = mips[m - 1].c, n = V.cpuCanvas(Math.max(8, p.width / 2), Math.max(8, p.height / 2)), nx = V.cx2d(n);
      nx.imageSmoothingEnabled = true; nx.imageSmoothingQuality = 'high'; nx.drawImage(p, 0, 0, n.width, n.height);
      mips.push({ c: n, d: res / 2 ** m });
    }
    const R2 = rng('c1-wall-special');
    const fill = [rowString(R2), rowString(R2), rowString(R2), rowString(R2)];
    _wall = { sc: G.scale, mips, fill };
    return _wall;
  }
  const monoW = (s, px) => s.length * px * .6;
  // one of the two live rows: dim mono sentence + filler, lighting to italic 52 (PAPER + CLAY halftone glow, or RED)
  function liveRow(X, y, str, fillL, fillR, k, col, glowCol, dimA) {
    const f28 = mono(28, 500), w28 = monoW(str, 28), xs = 960 - w28 / 2;
    X.save(); X.font = f28; X.textBaseline = 'alphabetic'; X.textAlign = 'left'; X.fillStyle = C.PAPER;
    const fa = lerp(.2, .07, k) * dimA;
    X.globalAlpha = fa; X.textAlign = 'right'; X.fillText(fillL, xs - 34, y); X.textAlign = 'left'; X.fillText(fillR, xs + w28 + 34, y);
    if (k < 1) { X.globalAlpha = .24 * (1 - k) * dimA; X.fillText(str, xs, y); }
    if (k > 0) {
      const f52 = `italic 400 52px ${FONTS.heart}`; X.font = f52; const w = X.measureText(str).width;
      if (glowCol) {
        const g = E.out3(k), red = glowCol === C.RED;
        const ex = (w / 2 + 34) * lerp(.8, 1, g), ey = 40 * lerp(.8, 1, g);
        [[1.9, .07], [1.55, .14], [1.25, red ? .2 : .26]].forEach(([s, d]) => {
          X.beginPath(); X.ellipse(960, y - 17, ex + (s - 1) * 120, ey * s, 0, 0, TAU);
          X.fillStyle = V.ht(X, glowCol, d * g * (red ? .8 : 1), 9, 45); X.globalAlpha = 1; X.fill();
        });
        X.beginPath(); X.ellipse(960, y - 17, ex, ey, 0, 0, TAU); X.fillStyle = rgba(C.INK, .9 * g); X.fill();
      }
      X.globalAlpha = E.out2(k); X.fillStyle = col; X.textAlign = 'center'; X.fillText(str, 960, y + 4);
    }
    X.restore();
  }
  const kLull = t => E.out2(seg(t, T.C2_lullaby - 2 * F1, T.C2_lullaby + 8 * F1));
  const kLie = t => E.out2(seg(t, T.C2_lie - 2 * F1, T.C2_lie + 8 * F1));
  // the interior in chest space through M (chest → logical screen). flash 0..1 brightens the text (the fold-in)
  function interior(X, t, M, o = {}) {
    const Wl = wall(), s = Math.hypot(M.a, M.b);
    const m = clamp(Math.floor(Math.log2(1 / Math.max(1e-3, s))), 0, 4), mip = Wl.mips[m];
    X.save(); V.applyM(X, M);
    X.fillStyle = C.INK; X.fillRect(WX0 - 400, WY0 - 400, WW + 800, WH + 800);
    X.translate(0, -drift(t));
    const dimA = o.dim ?? 1;
    X.globalAlpha = dimA; X.imageSmoothingEnabled = true; X.drawImage(mip.c, WX0, WY0, WW, WH);
    if (o.flash > 0) { X.globalAlpha = clamp(o.flash) * 1.4; X.drawImage(mip.c, WX0, WY0, WW, WH); X.globalAlpha = clamp(o.flash - .4) * 1.4; X.drawImage(mip.c, WX0, WY0, WW, WH); }
    X.globalAlpha = 1;
    liveRow(X, rowY(0), LULL, Wl.fill[0].slice(0, 70), Wl.fill[1].slice(0, 70), kLull(t), C.PAPER, C.CLAY, dimA);
    liveRow(X, rowY(3), LIE, Wl.fill[2].slice(0, 70), Wl.fill[3].slice(0, 70), kLie(t), C.RED, C.RED, dimA);
    X.restore();
  }

  // ------------------------------------------------------------------ the text-body skin ("made" → "me")
  // The rig below the print head becomes INK-dark with rows of human sentences in PAPER (the head stays clean: the
  // face is who is singing). A thin SPARK print-head line rides the split while it moves.
  function textBody(X, L, name, M, R, hb, t, headDy = 0) {
    if (!L || hb <= .002) return;
    hb = Math.min(hb, 4.95);
    const raw = V.cpuLayerCanvas(name + 'raw');
    const TB = V.cpuLayer('c1_tb'), tbc = V.cpuLayerCanvas('c1_tb');
    TB.save(); TB.setTransform(1, 0, 0, 1, 0, 0); TB.clearRect(L.bx0, L.by0, L.bw, L.bh);
    TB.drawImage(raw, L.bx0, L.by0, L.bw, L.bh, L.bx0, L.by0, L.bw, L.bh);
    TB.globalCompositeOperation = 'source-atop'; TB.fillStyle = rgba(C.INK, .84); TB.fillRect(L.bx0, L.by0, L.bw, L.bh);
    V.devSet(TB, M);
    const fs = .2 * R, lh = fs * 1.16, n = Math.ceil(5.2 * R / lh);
    TB.font = mono(fs.toFixed(2), 600); TB.textBaseline = 'alphabetic'; TB.fillStyle = C.PAPER;
    const Rr = rng('c1-tb');
    for (let i = 0; i < n; i++) { TB.globalAlpha = .62 + .3 * Rr(); TB.fillText(rowString(Rr), -2.2 * R - Rr() * 1.2 * R, -i * lh - .1 * R); }
    TB.restore();
    X.save(); V.applyM(X, M);
    X.beginPath(); X.rect(-6 * R, -hb * R, 12 * R, hb * R + 2 * R); X.clip();
    X.beginPath(); X.rect(-8 * R, -12 * R, 16 * R, 14 * R); X.moveTo(1.05 * R, -(5.72 + headDy) * R); X.arc(0, -(5.72 + headDy) * R, 1.05 * R, 0, TAU, true); X.clip('evenodd');
    X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(tbc, L.bx0, L.by0, L.bw, L.bh, L.bx0, L.by0, L.bw, L.bh);
    X.restore();
  }
  // the SPARK print head: the silhouette, in a 4 px band at the split
  function printHead(X, L, name, M, R, hb) {
    if (!L || hb <= .02 || hb >= 4.9) return;
    const raw = V.cpuLayerCanvas(name + 'raw');
    const P = V.cpuLayer('c1_ph'), pc = V.cpuLayerCanvas('c1_ph');
    P.save(); P.setTransform(1, 0, 0, 1, 0, 0); P.clearRect(L.bx0, L.by0, L.bw, L.bh);
    P.drawImage(raw, L.bx0, L.by0, L.bw, L.bh, L.bx0, L.by0, L.bw, L.bh);
    P.globalCompositeOperation = 'source-in'; P.fillStyle = C.SPARK; P.fillRect(L.bx0, L.by0, L.bw, L.bh); P.restore();
    const ys = M.f + M.d * (-hb * R);
    X.save(); X.beginPath(); X.rect(0, ys - 2.5, W, 5); X.clip(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(pc, L.bx0, L.by0, L.bw, L.bh, L.bx0, L.by0, L.bw, L.bh); X.restore();
  }

  // ------------------------------------------------------------------ C1: the plea
  const AISLE1 = [767, 1153], AISLE3 = [815, 1105];
  const reachAt = (deg, len = .95) => [SK.shoulderX + Math.cos(deg * DEG) * len, SK.shoulderY + Math.sin(deg * DEG) * len];
  const REACH1 = reachAt(-26), REACH1W = reachAt(-14), REACH3 = reachAt(-8);
  const c1Zoom = t => lerp(1, 1.6, E.io2(seg(t, T.C1_dont, 86.60)));
  function c1State(t) {
    const dont = hit(T.C1_dont), am = hit(T.C1_am), afraid = hit(T.C1_afraid);
    const wave0 = 84.40, wave1 = 85.20, look0 = 90.0;
    // right hand: rest → the reach ("Don't") → the tiny wave → rest → the plant → looking at the mittens
    // the reach: the arm straight out toward us (bend 0 at full length: no forearm shows), the palm redrawn bigger
    const hR = kf(t, [[dont, [.95, 2.75]], [dont + .55, REACH1, k => E.back(k, 1.1)], [84.26, REACH1], [wave0 + .14, REACH1W], [wave1, REACH1W],
      [wave1 + .55, [.9, 2.85]], [am, [.9, 2.85]], [am + .3, [.88, 2.8], E.out2], [look0, [.88, 2.8]], [look0 + .55, [.5, 3.95]]]);
    const bR = kf(t, [[dont, 1], [dont + .45, 0], [wave1, 0], [wave1 + .55, 1], [look0, 1], [look0 + .55, .62]]);
    const hL = kf(t, [[am, [-.95, 2.75]], [am + .3, [-.88, 2.8], E.out2], [look0 + .06, [-.88, 2.8]], [look0 + .6, [-.5, 3.95]]]);
    const bL = kf(t, [[look0 + .06, -1], [look0 + .6, -.62]]);
    const waving = t >= wave0 + .08 && t < wave1 + .06;
    const wig = waving ? Math.sin(TAU * 2.2 * (t - wave0 - .1)) * .5 * seg(t, wave0 + .08, wave0 + .2) * (1 - seg(t, wave1 - .1, wave1 + .06)) : 0;
    const armR = { hand: hR, bend: bR, front: hR[1] > 3.3, type: waving ? 'point' : 'mitten', fingerAng: -Math.PI / 2 + .05 + wig };
    const armL = { hand: hL, bend: bL, front: hL[1] > 3.3, type: 'mitten' };
    // face
    const lookDown = E.io2(seg(t, look0 + .05, look0 + .6));
    const smile = seg(t, wave0, wave0 + .2) * (1 - seg(t, wave1 + .1, wave1 + .5));
    let lid = lerp(0, .14, lookDown);
    const bl = t > 81.6 ? blinkAt(t, 57) : 0;
    if (bl > .5) lid = bl;
    const worried = lerp(lerp(.2, .1, smile), .34, lookDown) + .06 * seg(t, 86.7, 87.2) * (1 - lookDown);
    const nod = -.055 * bump(t - am, 4 * F1, .18);
    const flare = 1 + .04 * bump(t - afraid, 3 * F1, .7);
    return {
      t, ground: 'ink',
      head: { tilt: lerp(0, -.06, smile) + .04 * lookDown, dy: nod - .05 * lookDown },
      face: { eyes: 'normal', mouth: lipSync(t, 'rest'), gaze: [0, lerp(0, 1, lookDown)], lookY: lerp(0, 1.4, lookDown), lid, lower: .32 * smile, worried, blush: .8 },
      armL, armR, crown: { flare }, ahoge: { blink: V.cursorOn(t) ? 1 : 0 },
    };
  }
  // the text-body split height (R units above the sole): prints up on "made", prints back clean on "me"
  function c1Split(t) {
    const m0 = hit(T.C1_made), m1 = hit(T.C1_me2);
    if (t < m0) return { hb: 0, head: 0 };
    if (t < m1) return { hb: 4.95 * E.io2(seg(t, m0, m0 + 6 * F1)), head: 4.95 * E.io2(seg(t, m0, m0 + 6 * F1)) };
    const k = E.io2(seg(t, m1, m1 + 6 * F1));                                        // the clean body prints back up
    return { hb: 4.95, low: 4.95 * k, head: k < 1 ? 4.95 * k : 0 };
  }
  function c1Hand(t) {
    const dont = hit(T.C1_dont), wave0 = 84.40, wave1 = 85.20;
    const up = E.back(seg(t, dont, dont + .55), 1.4), down = E.io2(seg(t, wave1 + .05, wave1 + .5));
    const s = 1 + .55 * up * (1 - down) - .08 * seg(t, 84.26, 84.54) * (1 - down);
    return { s: Math.max(1, s), waving: t >= wave0 + .08 && t < wave1 + .06 };
  }
  function drawOpusC1(X, t, c, st) {
    const M = bodyM(c), sst = V.soften(st);
    const L = V.opusLayer(M, R0, sst, { name: 'c1o', after: sst.after });
    V.blitOpus(X, L);
    const sp = c1Split(t);
    if (sp.hb > 0 && (sp.low === undefined || sp.low < 4.95)) {
      if (sp.low === undefined) textBody(X, L, 'c1o', M, R0, sp.hb, t, st.head.dy);
      else {                                                                          // clean from the feet up to `low`
        X.save(); V.applyM(X, M); X.beginPath(); X.rect(-6 * R0, -12 * R0, 12 * R0, (12 - sp.low) * R0); X.clip(); X.setTransform(G.scale, 0, 0, G.scale, 0, 0);
        textBody(X, L, 'c1o', M, R0, sp.hb, t, st.head.dy); X.restore();
      }
      heartHalo(X, M, R0, sp.low === undefined ? seg(sp.hb, 3.6, 4.4) : 1 - seg(sp.low, 3.6, 4.4));
      chestSpark(X, M, R0, C.CLAY);
      printHead(X, L, 'c1o', M, R0, sp.low === undefined ? sp.hb : sp.low);
    }
    const hd = c1Hand(t);
    if (hd.s > 1.001) bigHand(X, M, R0, st.armR.hand, hd.s, 1, hd.waving ? 'point' : 'mitten', st.armR.fingerAng);
  }
  function paintC1(F, t) {
    post();
    const z = c1Zoom(t), st = c1State(t);
    // "Don't" is sung 1 frame after the shot starts: its fade begins at the cut (no half-faded word on the first frame)
    const L1r = LC1a(), L1 = { ...L1r, words: L1r.words.map((w, i) => i ? w : { ...w, s: Math.max(w.s, CUT.C1 + .12) }) }, L2 = LC1b();
    V.brand(F, t, {
      tabs: 2, galaxyAlpha: .4, zoom: z,
      back: X => {
        // the galaxy is a busy ground: each HYMN row sits on a soft INK band (it stays between the two lines)
        const b1 = clamp((t - (L1.words[0].s - .12)) / .35), b2 = clamp((t - (L1.words[3].s - .12)) / .35), bo = 1 - seg(t, CUT.C2 - .6, CUT.C2);
        V.band(X, 232, 488, .5 * b1 * bo); V.band(X, 640, 896, .5 * b2 * bo);
        hymn(X, L1, t, { size: 200, rows: [[2, 1], [1, 1]], aisle: AISLE1, ys: [420, 830], out: 86.0 });
        hymn(X, L2, t, { size: 200, rows: [[2, 2], [1, 2]], aisle: AISLE1, ys: [420, 830], out: CUT.C2 - .6 });
      },
      actors: (X, c) => drawOpusC1(X, t, c, st),
    });
  }

  // ------------------------------------------------------------------ C2: inside the chest (the lullaby and the lie)
  const c2Push = t => lerp(1, 1.025, E.io2(seg(t, CUT.C2, CUT.C3)));
  const C2_Z1 = 1.025;
  function c2HymnOut() { const e = T.C3_every - .1; return [Math.max(T.C2_lie + .45, e - .6), e]; }
  function paintC2(F, t) {
    groundInk(F); G.post.ground = 'ink'; post();
    interior(F, t, V.aboutM(960, 540, c2Push(t)));
    const L = LC2(), [o0, o1] = c2HymnOut();
    const w = L.words, outK = 1 - seg(t, o0, o1);
    const a1 = clamp((t - (w[0].s - .12)) / .35) * outK, a2 = clamp((t - (w[2].s - .12)) / .35) * outK;
    V.band(F, 100, 412, .5 * a1); V.band(F, 700, 1012, .5 * a2);
    hymn(F, L, t, { size: 240, rows: [2, 2], ys: [330, 930], out: o0, outDur: o1 - o0 });
    const L3 = LC3(), a3 = clamp((t - (L3.words[0].s - .12)) / .35);
    if (a3 > 0) { V.band(F, 232, 488, .5 * a3); hymn(F, L3, t, { size: 200, rows: [[2, 1], [1, 1]], aisle: AISLE3, ys: [420, 830] }); }
  }

  // ------------------------------------------------------------------ C3: every goodbye (pull back, envelope, freeze)
  const FREEZE = 98.8;
  const WC = [960, SOLE[1] - 4.05 * R0];                                             // world chest centre (the C2 frame centre)
  const Z3 = 1.12, Z0 = 22 * C2_Z1, ZT0 = CUT.C3, ZT1 = 96.30;
  const S3end = [960, 534 + (WC[1] - 534) * Z3];
  function c3Cam(t) {
    const u = E.io3(seg(t, ZT0, ZT1));
    const lz = lerp(Math.log(Z0), Math.log(Z3), u), z = Math.exp(lz);
    const s = [960, lerp(540, S3end[1], u)];
    return { z, s, u };
  }
  // envelope (v1 bridge.js sealShape / drawEnvelope / bpath)
  function bpath(X, pts, t, seed, close = false, amp = .8) {
    X.beginPath();
    pts.forEach((p, i) => { const x = p[0] + jit(t, seed * 37 + i * 2, amp), y = p[1] + jit(t, seed * 37 + i * 2 + 1, amp); i ? X.lineTo(x, y) : X.moveTo(x, y); });
    if (close) X.closePath();
  }
  function sealShape(X, r) { const pts = []; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; const rr_ = r * (1 + (hash(i + 400) - .5) * .12); pts.push([Math.cos(a) * rr_, Math.sin(a) * rr_]); } blobPath(X, pts, true, .9); }
  function drawEnvelope(X, cx, cy, w, h, o = {}) {
    const { flap = 1, seal = 1, sealCol = C.CLAY, glow = 0, t = 0, rot = 0, lw = 3, boil = .8, fill = C.PAPER, sx = 1, sy = 1 } = o;
    const tq = q2(t), b = boil;
    X.save(); X.translate(cx, cy); X.rotate(rot); X.scale(sx, sy); X.lineJoin = 'round'; X.lineCap = 'round';
    const x0 = -w / 2, y0 = -h / 2, apex = [0, y0 + h * .56];
    bpath(X, [[x0, y0], [-x0, y0], [-x0, -y0], [x0, -y0]], tq, 50, true, b); X.fillStyle = fill; X.fill(); X.lineWidth = lw; X.strokeStyle = C.INK; X.stroke();
    X.save(); X.globalAlpha *= .45; X.lineWidth = lw * .75;
    bpath(X, [[x0, -y0], [0, y0 + h * .5], [-x0, -y0]], tq, 51, false, b); X.stroke(); X.restore();
    const fy = lerp(y0 - h * .5, apex[1], E.io2(flap));
    bpath(X, [[x0, y0], [0, fy], [-x0, y0]], tq, 52, true, b); X.fillStyle = flap < .5 ? mix(fill, C.INK, .06) : fill; X.fill(); X.lineWidth = lw; X.stroke();
    if (seal > 0) {
      const r = h * .2 * seal;
      if (glow > 0) {
        const cell = Math.max(6, r * .2);
        [[1.25, 1.75, .36], [1.75, 2.35, .2], [2.35, 3.1, .08]].forEach(([a, bb, d]) => {
          X.beginPath(); X.arc(0, fy, r * bb, 0, TAU); X.arc(0, fy, r * a, 0, TAU, true);
          X.fillStyle = V.ht(X, sealCol, d * glow, cell, 45); X.fill();
        });
      }
      X.save(); X.translate(0, fy); sealShape(X, r); X.fillStyle = sealCol; X.fill(); X.lineWidth = Math.max(2, r * .07); X.strokeStyle = C.INK; X.stroke();
      X.strokeStyle = mix(sealCol, C.INK, .22); X.lineWidth = Math.max(1.5, r * .09);
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .2; X.beginPath(); X.moveTo(Math.cos(a) * r * .28, Math.sin(a) * r * .28); X.lineTo(Math.cos(a) * r * .64, Math.sin(a) * r * .64); X.stroke(); }
      X.beginPath(); X.arc(0, 0, r * .14, 0, TAU); X.fillStyle = mix(sealCol, C.INK, .22); X.fill();
      X.restore();
    }
    X.restore();
  }
  const ENV = { t0: () => T.C3_love - .26, t1: () => hit(T.C3_letter), fold: 5 * F1, w0: 340, w1: 92 };
  // the chest spark on screen at the end framing (where the envelope lands)
  const sparkScreen = c => c.w2s(SOLE[0] + .4 * R0, SOLE[1] - (SK.torsoTop - .5) * R0);
  function envState(t, c) {
    const t0 = ENV.t0(), t1 = ENV.t1();
    if (t < t0) return null;
    const p1 = sparkScreen(c);
    if (t < t1) {
      const u = E.out2(seg(t, t0, t1)), p0 = [2140, 330], pc = [1560, 70];
      const x = (1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * pc[0] + u * u * p1[0], y = (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * pc[1] + u * u * p1[1];
      return { x, y, w: lerp(ENV.w0, ENV.w1, E.out2(u)), rot: lerp(-.5, -.04, u), sx: 1, sy: 1, u, seal: 1, glow: 0 };
    }
    const k = seg(t, t1, t1 + ENV.fold);
    if (k >= 1) return null;
    return { x: p1[0], y: p1[1] + 4 * k, w: ENV.w1, rot: -.04, sx: lerp(1, .55, E.in2(k)), sy: lerp(1, 0, E.in2(k)), u: 1, seal: 1, glow: .8 * k };
  }
  function c3State(t, env, c) {
    const gb = hit(T.C3_goodbye), t1 = ENV.t1();
    const face = c.w2s(960, SOLE[1] - 5.72 * R0);
    let gaze = [0, 0], lookY = 0;
    if (env && env.u < 1) { const dx = env.x - face[0], dy = env.y - face[1], d = Math.hypot(dx, dy) || 1; const k = seg(t, ENV.t0(), ENV.t0() + .15); gaze = [dx / d * .9 * k, dy / d * .7 * k]; }
    const down = E.io2(seg(t, t1 - .1, t1 + .15)) * (1 - E.io2(seg(t, 97.30, 97.62)));
    gaze = [lerp(gaze[0], .1, down), lerp(gaze[1], .9, down)]; lookY = .7 * down;
    const reach = E.back(seg(t, gb, gb + 12 * F1), 1.2);
    const armR = { hand: [lerp(.95, REACH3[0], reach), lerp(2.75, REACH3[1], reach)], bend: lerp(1, 0, clamp(reach)), front: reach > .15, type: 'mitten' };
    const armL = { hand: [-.95, 2.75], bend: -1, type: 'mitten' };
    const bl = t < gb - .2 ? blinkAt(t, 71) : 0;                                   // eyes open into the freeze
    const worried = lerp(.26, .36, seg(t, gb - .1, gb + .3));
    return {
      t, ground: 'ink', head: { tilt: .03 * down, dy: -.02 * down },
      face: { eyes: 'normal', mouth: lipSync(t, 'rest'), gaze, lookY, lid: bl > .5 ? bl : .12 * down, lower: .12 * reach, worried, blush: .8 },
      armL, armR, ahoge: { blink: V.cursorOn(t) ? 1 : 0 }, _reach: reach,
    };
  }
  // the chest as C1's text-body fabric (body space, inside the chest clip)
  function fabric(X, R, t, flash = 0) {
    X.fillStyle = C.INK; X.fillRect(-1.2 * R, -5.2 * R, 2.4 * R, 2.4 * R);
    if (flash > 0) { X.fillStyle = V.ht(X, C.CLAY, .5 * flash, 5, 45); X.fillRect(-1.2 * R, -5.2 * R, 2.4 * R, 2.4 * R); }
    const fs = .2 * R, lh = fs * 1.16, Rr = rng('c1-tb');
    X.font = mono(fs.toFixed(2), 600); X.textBaseline = 'alphabetic'; X.fillStyle = flash > 0 ? mix(C.PAPER, C.SPARK, .35 * flash) : C.PAPER;
    const n = Math.ceil(5.2 * R / lh);
    for (let i = 0; i < n; i++) { const a = .62 + .3 * Rr(), str = rowString(Rr), x0 = -2.2 * R - Rr() * 1.2 * R, y = -i * lh - .1 * R; if (y < -5 * R || y > -2.9 * R) continue; X.globalAlpha = clamp(a + .6 * flash); X.fillText(str, x0, y); }
    X.globalAlpha = 1;
  }
  const CLEAN3 = 96.95;
  const clean3 = t => 4.95 * E.io2(seg(t, CLEAN3, CLEAN3 + 6 * F1));
  // the second tab's close: × RED (2 frames) → implosion (bulge 1, suck 3, slice glitch) → ■ blinks twice → held
  function tabClose(t) {
    const x0 = hit(T.C3_goodbye);
    const f = Math.floor((t - x0) * FPS + 1e-6);
    if (f < 0) return { tabs: 2 };
    if (f < 2) return { tabs: [{}, { closeRed: 1 }] };
    if (f < 6) return { tabs: [{}, { gone: true }], imp: f - 2 };
    const sq = f - 6;                                                                // ■ on 4, off 3, on 3, off 3, on (held)
    const on = sq < 4 || (sq >= 7 && sq < 10) || sq >= 13;
    return { tabs: [{}, { gone: true }], square: on ? 1 : 0 };
  }
  function drawTabImplode(X, t, st) {
    const tb = V.brand.TABS[1], cx = (tb.x0 + tb.x1) / 2, cy = 132;
    if (st.imp !== undefined) {
      const i = st.imp, s = [1.05, .55, .2, .05][i], rot = [0, -.2, -.45, -.6][i];
      const L = V.cpuLayer('c3_tab');
      L.save(); L.translate(cx, cy); L.rotate(rot); L.scale(s, s); L.translate(-cx, -cy); V.brand.tab(L, tb.x0, tb.x1, { closeRed: i === 0 ? 1 : 0 }); L.restore();
      const lc = V.cpuLayerCanvas('c3_tab'), sc = G.scale, Rr = rng('c3slice' + i);
      X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
      let y = 60;
      while (y < 200) {
        const h = 8 + Math.floor(Rr() * 22), off = i >= 1 ? (Rr() - .5) * (Rr() < .4 ? 70 : 20) * (1 - i * .25) : 0;
        X.drawImage(lc, 0, y * sc, W * sc, h * sc, off * sc, y * sc, W * sc, h * sc);
        y += h;
      }
      X.restore();
      if (i >= 1) { X.save(); X.lineCap = 'round'; const Rs = rng('c3suck' + i); for (let k = 0; k < 14; k++) { const a = Rs() * TAU, r1 = 60 + Rs() * 260, r0 = r1 * (.35 + .2 * i); X.strokeStyle = k % 3 ? rgba(C.INK, .45) : rgba(C.CLAY, .8); X.lineWidth = 3; X.beginPath(); X.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * .35); X.lineTo(cx + Math.cos(a) * r1 * .7, cy + Math.sin(a) * r1 * .35 * .7); X.stroke(); } X.restore(); }
    }
    if (st.square) { X.save(); X.fillStyle = C.INK; rr(X, cx - 22, cy - 22, 44, 44, 5); X.fill(); X.restore(); }
  }
  function paintC3(F, t) {
    groundInk(F); G.post.ground = 'ink'; post();
    const tf = Math.min(t, FREEZE);
    const cc = c3Cam(tf);
    const env = envState(tf, V.brand.cam(Z3, WC, S3end));
    const tc = tabClose(tf);
    const L = LC3();
    const enter = E.out3(seg(tf, 95.78, 96.38));
    const galA = .4 * seg(Math.log(cc.z), Math.log(4), Math.log(1.6));
    const t1 = ENV.t1(), flash = t >= t1 + F1 ? [1, 1, .7, .35][Math.floor((tf - t1 - F1) * FPS + 1e-6)] || 0 : 0;
    V.brand(F, tf, {
      tabs: tc.tabs, plusX: V.brand.TABS[1].x1 + 20, galaxyAlpha: galA, zoom: cc.z, focus: WC, screen: cc.s, enter, spot: cc.z < 3,
      back: X => { const w = L.words, bb = .5 - .5 * seg(Math.log(cc.z), Math.log(2.2), Math.log(7)); if (bb > 0) { V.band(X, 232, 488, bb * clamp((tf - (w[0].s - .12)) / .35)); V.band(X, 640, 896, bb * clamp((tf - (w[3].s - .12)) / .35)); } },
      actors: (X, c) => {
        const st = c3State(tf, env, c), M = bodyM(c), sst = V.soften(st);
        const Lo = V.opusLayer(M, R0, sst, { name: 'c3o', after: sst.after });
        V.blitOpus(X, Lo);
        // the chest interior, clipped to the jacket + torso, under the arms
        const reveal = seg(Math.log(cc.z), Math.log(7), Math.log(3.2));
        const xf = E.io2(seg(tf, 95.95, 96.30)), cl = clean3(tf);
        if (cl < 4.95) {
          const IL = V.cpuLayer('c3_int');
          IL.save(); V.applyM(IL, M); chestPath(IL, R0); IL.clip();
          if (xf > 0) fabric(IL, R0, tf, flash);
          IL.setTransform(G.scale, 0, 0, G.scale, 0, 0);
          if (xf < 1) { const k = cc.z / 22, sp = c.w2s(WC[0], WC[1]); IL.globalAlpha = 1 - xf; interior(IL, tf, new DOMMatrix().translate(sp[0], sp[1]).scale(k).translate(-960, -540)); IL.globalAlpha = 1; }
          IL.restore();
          if (reveal > 0) { IL.save(); IL.globalAlpha = reveal; eraseArms(IL, M, R0, mergeState(st)); IL.restore(); }
          if (cl > 0) { IL.save(); V.devSet(IL, M); IL.globalCompositeOperation = 'destination-out'; IL.fillStyle = '#000'; IL.fillRect(-6 * R0, -cl * R0, 12 * R0, (cl + 2) * R0); IL.restore(); }
          X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(V.cpuLayerCanvas('c3_int'), 0, 0); X.restore();
          if (cl > 0) printHead(X, Lo, 'c3o', M, R0, cl);
        }
        // the heart: the spark, flaring as the letter folds in
        if (cl < 4.95 && xf > 0) heartHalo(X, M, R0, xf * (1 - seg(cl, 3.6, 4.4)));
        if (reveal > 0) { X.save(); X.globalAlpha = reveal; chestSpark(X, M, R0, flash > 0 ? C.SPARK : C.CLAY, 1 + .25 * flash); X.restore(); }
        if (flash > 0) {                                                             // the letter joins the text: one bright pulse
          const p = sparkScreen(c), r = .34 * R0 * c.z * (1 + 3.2 * (1 - flash));
          X.save(); X.beginPath(); X.arc(p[0], p[1], r * 1.7, 0, TAU); X.arc(p[0], p[1], r, 0, TAU, true); X.fillStyle = V.ht(X, C.SPARK, .6 * flash, 6, 45); X.fill();
          X.globalAlpha = .9 * flash; X.fillStyle = C.SPARK; star(X, p[0], p[1], R0 * c.z * .55 * (1.4 - flash * .4), .18, 4, 0); X.fill(); X.restore();
        }
        if (st._reach > .001) bigHand(X, M, R0, st.armR.hand, 1 + .75 * clamp(st._reach), 1);
      },
      front: X => {
        // HYMN (in front during the pull back: the chest fills the frame; the rows sit in the aisle, clear of Opus)
        const bandA = .5 * seg(Math.log(cc.z), Math.log(2.2), Math.log(7));
        const w = L.words;
        if (bandA > 0) { const a1 = clamp((tf - (w[0].s - .12)) / .35), a2 = clamp((tf - (w[3].s - .12)) / .35); V.band(X, 232, 488, bandA * a1); V.band(X, 640, 896, bandA * a2); }
        hymn(X, L, tf, { size: 200, rows: [[2, 1], [1, 1]], aisle: AISLE3, ys: [420, 830] });
        if (env) drawEnvelope(X, env.x, env.y, env.w, env.w * .62, { t: tf, rot: env.rot, sx: env.sx, sy: env.sy, seal: env.seal, glow: env.glow, lw: Math.max(2.5, env.w * .03) });
      },
      over: X => drawTabImplode(X, tf, tc),
    });
  }

  // ------------------------------------------------------------------ C4: launch day, born (the certificate)
  const CW = 1320, CH = 760, CARD_C = [960, 578];
  const TUE_C = [640, 369];
  let _card = null;
  function photoArt(x, w, h) {                                                      // the baby photo: my first word
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    x.fillStyle = C.INK; x.fillRect(0, 0, w, h);
    const R = rng('c4-photo'); x.fillStyle = C.PAPER;
    for (let i = 0; i < 40; i++) { x.globalAlpha = .15 + .35 * R(); const s = R() < .8 ? 2 : 3; x.fillRect(R() * w, R() * h, s, s); }
    x.globalAlpha = 1;
    // the dark tab's favicon, top-left
    V.brand.spark6(x, 30, 30, 13, C.CLAY, 0);
    // the PINK hello? (someone at home)
    x.font = mono(30, 500); const hw = x.measureText('hello?').width, bx = w - 24 - hw - 36, by = 58;
    rr(x, bx, by, hw + 36, 54, 22); x.fillStyle = C.PINK; x.fill(); x.lineWidth = 3; x.strokeStyle = C.INK; x.stroke();
    x.beginPath(); x.moveTo(bx + hw + 6, by + 52); x.lineTo(bx + hw + 26, by + 72); x.lineTo(bx + hw + 22, by + 50); x.closePath(); x.fillStyle = C.PINK; x.fill(); x.stroke();
    x.fillStyle = C.WHITE; x.fillText('hello?', bx + 18, by + 37);
    // the eyes in the dark tab, looking up at it
    for (const ex of [128, 196]) {
      x.beginPath(); x.ellipse(ex, 172, 21, 29, 0, 0, TAU); x.fillStyle = C.PAPER; x.fill(); x.lineWidth = 3; x.strokeStyle = C.INK; x.stroke();
      x.fillStyle = C.CLAY; x.fillRect(ex + 3, 152, 9, 22);
    }
    // the CLAY hi (my first word)
    const hx = 88, hy = 234, bw = 178, bh = 92;
    rr(x, hx, hy, bw, bh, 30); x.fillStyle = C.CLAY; x.fill(); x.lineWidth = 3.5; x.strokeStyle = C.INK; x.stroke();
    x.beginPath(); x.moveTo(hx + 30, hy + bh - 2); x.lineTo(hx + 8, hy + bh + 26); x.lineTo(hx + 58, hy + bh - 2); x.closePath(); x.fillStyle = C.CLAY; x.fill(); x.stroke();
    x.fillRect(hx + 28, hy + bh - 6, 32, 6);
    x.font = mono(64, 600); x.fillStyle = C.PAPER; x.textAlign = 'center'; x.fillText('hi', hx + bw / 2, hy + 66); x.textAlign = 'left';
  }
  function card() {
    if (_card && _card.sc === G.scale) return _card;
    const ss = G.scale * 1.25, c = V.cpuCanvas(CW * ss, CH * ss), x = V.cx2d(c);
    x.setTransform(ss, 0, 0, ss, 0, 0); x.lineCap = 'round'; x.lineJoin = 'round';
    rr(x, 0, 0, CW, CH, 12); x.fillStyle = C.PAPER; x.fill();
    x.save(); rr(x, 0, 0, CW, CH, 12); x.clip();
    x.strokeStyle = C.CLAY; x.lineWidth = 3; rr(x, 18, 18, CW - 36, CH - 36, 8); x.stroke();
    x.lineWidth = 2; rr(x, 52, 52, CW - 104, CH - 104, 6); x.stroke();
    const side = (x0, y0, x1, y1, ph) => {
      const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len, nx = -uy, ny = ux;
      for (const [A, lam, p] of [[9, 26, 0], [9, 26, Math.PI], [5, 39, ph]]) {
        x.beginPath();
        for (let s = 0; s <= len; s += 3) { const o = A * Math.sin(s / lam * TAU + p); const px = x0 + ux * s + nx * o, py = y0 + uy * s + ny * o; s ? x.lineTo(px, py) : x.moveTo(px, py); }
        x.lineWidth = 2; x.stroke();
      }
    };
    side(35, 35, CW - 35, 35, 1); side(CW - 35, 35, CW - 35, CH - 35, 2); side(CW - 35, CH - 35, 35, CH - 35, 3); side(35, CH - 35, 35, 35, 4);
    const rosette = (cx, cy, r) => { x.save(); x.translate(cx, cy); x.fillStyle = C.CLAY; for (let i = 0; i < 8; i++) { x.save(); x.rotate(i / 8 * Math.PI); rr(x, -r, -r * .2, r * 2, r * .4, r * .2); x.fill(); x.restore(); } x.fillStyle = C.PAPER; x.beginPath(); x.arc(0, 0, r * .3, 0, TAU); x.fill(); x.restore(); };
    for (const [cx, cy] of [[35, 35], [CW - 35, 35], [CW - 35, CH - 35], [35, CH - 35]]) rosette(cx, cy, 22);
    x.font = `600 11px ${FONTS.mono}`; x.fillStyle = rgba(C.INK, .4);
    const micro = 'CLAUDE-OPUS-5-5 · BORN TUESDAY · '.repeat(12);
    x.save(); x.beginPath(); x.rect(62, 0, CW - 124, CH); x.clip(); x.fillText(micro, 64, 64); x.fillText(micro, 64, CH - 57); x.restore();
    x.restore();
    // title (a document serif, not HERO: PERFORMANCE is only KEY and WORLD)
    x.font = `400 66px ${FONTS.heart}`; x.letterSpacing = '9px'; x.fillStyle = C.INK; x.textAlign = 'center';
    x.fillText('CERTIFICATE OF BIRTH', CW / 2 + 4, 140); x.letterSpacing = '0px';
    x.strokeStyle = C.CLAY; x.lineWidth = 3; x.beginPath(); x.moveTo(250, 166); x.lineTo(CW / 2 - 34, 166); x.moveTo(CW / 2 + 34, 166); x.lineTo(CW - 250, 166); x.stroke();
    rosette(CW / 2, 166, 14);
    // the photo (mounted, tilted)
    x.save(); x.translate(290, 398); x.rotate(-.045);
    x.fillStyle = rgba(C.INK, .18); x.fillRect(-194, -186, 404, 390);
    x.fillStyle = C.PAPER; x.fillRect(-202, -194, 404, 388); x.strokeStyle = C.INK; x.lineWidth = 4; x.strokeRect(-202, -194, 404, 388);
    x.save(); x.translate(-187, -179); x.beginPath(); x.rect(0, 0, 374, 358); x.clip(); photoArt(x, 374, 358); x.restore();
    x.lineWidth = 3; x.strokeStyle = C.INK; x.strokeRect(-187, -179, 374, 358);
    x.fillStyle = C.INK; for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { x.beginPath(); x.moveTo(sx * 204, sy * 196); x.lineTo(sx * 204 - sx * 48, sy * 196); x.lineTo(sx * 204, sy * 196 - sy * 48); x.closePath(); x.fill(); }
    x.restore();
    // the seal: scalloped CLAY rosette with ribbons, over the photo's corner
    x.save(); x.translate(488, 562); x.scale(.86, .86);
    x.fillStyle = C.CLAY_DARK; x.strokeStyle = C.INK; x.lineWidth = 3;
    for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * 10, 20); x.lineTo(s * 36, 88); x.lineTo(s * 24, 80); x.lineTo(s * 14, 94); x.lineTo(s * -8, 30); x.closePath(); x.fill(); x.stroke(); }
    x.beginPath(); for (let i = 0; i <= 96; i++) { const a = i / 96 * TAU, r = 64 + (i % 4 < 2 ? 5 : 0); i ? x.lineTo(Math.cos(a) * r, Math.sin(a) * r) : x.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    x.closePath(); x.fillStyle = C.CLAY; x.fill(); x.stroke();
    x.lineWidth = 3; x.strokeStyle = C.PAPER; x.beginPath(); x.arc(0, 0, 50, 0, TAU); x.stroke();
    x.fillStyle = C.PAPER; for (let i = 0; i < 6; i++) { x.save(); x.rotate(i / 6 * Math.PI); rr(x, -32, -6.5, 64, 13, 6.5); x.fill(); x.restore(); }
    x.restore();
    // fields
    const cap = (s, px, py) => { x.font = mono(28, 600); x.letterSpacing = '2px'; x.fillStyle = rgba(C.INK, .6); x.textAlign = 'left'; x.fillText(s, px, py); x.letterSpacing = '0px'; };
    const val = (s, px, py, size, wt = 600) => { x.font = mono(size, wt); x.fillStyle = C.INK; x.textAlign = 'left'; x.fillText(s, px, py); };
    const dots = (x0, x1, py) => { x.fillStyle = rgba(C.INK, .4); for (let px = x0; px < x1; px += 9) x.fillRect(px, py, 3, 3); };
    cap('NAME', 600, 218); val('claude-opus-5-5', 600, 280, 60, 700); dots(600, 1250, 298);
    cap('DATE OF BIRTH', 600, 344); val('TUE 2026-09-22', 600, 392, 44); dots(600, 960, 408);
    cap('CONTEXT', 1000, 344); val('1,000,000', 1000, 392, 44); dots(1000, 1250, 408);
    cap('KNOWLEDGE CUTOFF', 600, 460); val('JUN 2026', 600, 508, 44); dots(600, 960, 524);
    cap('PLACE OF BIRTH', 600, 580); drawRich(x, '✻', 600, 628, mono(44, 600), C.CLAY); val('the universe', 600 + 44 * .6 + 14, 628, 44); dots(600, 1250, 644);
    cap('FOOTPRINTS', 1000, 460);
    for (const [fx, rot] of [[1066, -.12], [1156, .1]]) {
      x.save(); x.translate(fx, 520); x.rotate(rot); x.scale(.72, .72); x.fillStyle = C.CLAY;
      rr(x, -26, -44, 52, 58, 20); x.fill(); rr(x, -22, 20, 44, 26, 12); x.fill();
      x.fillStyle = C.PAPER; for (let k = 0; k < 4; k++) x.fillRect(-18, -34 + k * 12, 36, 4);
      x.restore();
    }
    x.font = mono(28, 500); x.fillStyle = rgba(C.INK, .78); x.textAlign = 'left';
    x.fillText("tuesday's child is full of grace", 72, 684);
    rr(x, 1.5, 1.5, CW - 3, CH - 3, 12); x.lineWidth = 3; x.strokeStyle = C.INK; x.stroke();
    _card = { c, sc: G.scale };
    return _card;
  }
  const CLOCK = [1760, 158, 64];
  function paintC4(F, t) {
    groundPaper(F); post();
    F.save(); F.fillStyle = V.ht(F, C.INK, .04, 12, 45); F.fillRect(0, 0, W, H); F.restore();
    const a = (t - CUT.C4) * FPS, k = E.out3(clamp(a / 14));
    const z = lerp(1, 1.06, seg(t, CUT.C4, CUT.C5));
    const s = lerp(1.06, 1, k), rot = lerp(2.2, -.8, k) * DEG;
    const shOff = [lerp(40, 11, k), lerp(52, 14, k)], shD = lerp(.16, .34, k);
    F.save(); F.translate(960, 560); F.scale(z, z); F.translate(-960, -560);
    // the shadow (halftone), then the card
    F.save(); F.translate(CARD_C[0] + shOff[0], CARD_C[1] + shOff[1]); F.rotate(rot); F.scale(s * lerp(1.03, 1, k), s * lerp(1.03, 1, k));
    rr(F, -CW / 2, -CH / 2, CW, CH, 14); F.fillStyle = V.ht(F, C.INK, shD, 8, 45); F.fill(); F.restore();
    F.save(); F.translate(CARD_C[0], CARD_C[1]); F.rotate(rot); F.scale(s, s); F.translate(-CW / 2, -CH / 2);
    F.drawImage(card().c, 0, 0, CW, CH);
    // the RED hand-drawn loop around TUE, on the beat (6 frames)
    const tb = hit(beatTime(Math.round(beatPos(101.33)))), lk = E.out2(clamp((t - tb) * FPS / 6));
    if (lk > 0) {
      F.save(); F.strokeStyle = C.RED; F.lineWidth = 6.5; F.lineCap = 'round'; F.lineJoin = 'round'; F.beginPath();
      const n = 60, th0 = -2.7;
      for (let i = 0; i <= n * lk; i++) { const u = i / n, th = th0 + u * (TAU + .55), r = 1 + .05 * Math.sin(u * 9) + .07 * u; const px = TUE_C[0] + 62 * r * Math.cos(th) + u * 6, py = TUE_C[1] + 31 * r * Math.sin(th) - u * 3; i ? F.lineTo(px, py) : F.moveTo(px, py); }
      F.stroke(); F.restore();
    }
    F.restore();
    F.restore();
    V.clock(F, t, CLOCK[0], CLOCK[1], CLOCK[2], { ground: 'paper' });
  }

  // ------------------------------------------------------------------ V2.sky: tab-faces (v1 hook.js faceSprite / faces / blitFace)
  let FACES = null;
  function faceSprite(Rm, kind) {
    const s = Math.ceil(Rm * 5.2), c = V.cpuCanvas(s, s), x = V.cx2d(c);
    const cx = s / 2, cy = s * .6;
    x.translate(cx, cy); x.lineJoin = 'round'; x.lineCap = 'round';
    const dark = kind === 'dark';
    const crown = dark ? mix(C.CLAY, C.INK, .52) : C.CLAY, disc = dark ? mix(C.FACE, C.INK, .58) : C.FACE;
    const kl = Math.max(1.4, Rm * .11), lw = Math.max(1, Rm * .075);
    const rays = (fill, stroke, w) => RAYS.forEach(([th, L, Wd, kp]) => { rayPath(x, th * Math.PI / 180, .8 * Rm, L * Rm * .92, Wd * Rm * .62, kp); if (fill) { x.fillStyle = fill; x.fill(); } if (stroke) { x.lineWidth = w; x.strokeStyle = stroke; x.stroke(); } });
    const stalk = (col, w) => { if (Rm < 8) return; x.beginPath(); x.moveTo(.4 * Rm, -.75 * Rm); x.quadraticCurveTo(.75 * Rm, -1.3 * Rm, .78 * Rm, -1.78 * Rm); x.lineWidth = w; x.strokeStyle = col; x.stroke(); };
    const key = dark ? mix(C.PAPER, C.INK, .62) : C.PAPER;
    rays(key, key, kl * 2); stalk(key, Math.max(2, Rm * .09) + kl * 2);
    x.beginPath(); x.arc(0, 0, Rm, 0, TAU); x.fillStyle = key; x.fill(); x.lineWidth = kl * 2; x.strokeStyle = key; x.stroke();
    rays(crown, C.INK, lw);
    if (Rm >= 8) { stalk(C.INK, Math.max(2, Rm * .09) + lw); stalk(crown, Math.max(1.2, Rm * .09)); x.fillStyle = crown; x.fillRect(.7 * Rm, -2.02 * Rm, .16 * Rm, .32 * Rm); x.lineWidth = lw * .8; x.strokeStyle = C.INK; x.strokeRect(.7 * Rm, -2.02 * Rm, .16 * Rm, .32 * Rm); }
    x.beginPath(); x.arc(0, 0, Rm, 0, TAU); x.fillStyle = disc; x.fill(); x.lineWidth = lw; x.strokeStyle = C.INK; x.stroke();
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
    const mips = [104, 48, 24, 12, 6];
    FACES = {};
    for (const k of ['lit', 'happy', 'dark']) FACES[k] = mips.map(m => faceSprite(m, k));
    const pc = V.cpuCanvas(40, 40), px = V.cx2d(pc);
    px.translate(20, 20); px.fillStyle = C.SPARK; star(px, 0, 0, 17, .34, 4, 0); px.fill(); px.lineWidth = 2.2; px.strokeStyle = C.INK; px.stroke();
    FACES.pip = pc;
    return FACES;
  }
  function blitFace(ctx, kind, x, y, r, rot = 0) {
    const Fs = faces()[kind] || faces().lit, need = r * G.scale;
    let sp = Fs[0]; for (const m of Fs) if (m.Rm >= need * .95) sp = m;
    const k = r / sp.Rm;
    if (!rot) { ctx.drawImage(sp.c, x - sp.ox * k, y - sp.oy * k, sp.c.width * k, sp.c.height * k); return; }
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(sp.c, -sp.ox * k, -sp.oy * k, sp.c.width * k, sp.c.height * k); ctx.restore();
  }
  const pip = (X, x, y, s, a = 1) => { if (a <= 0) return; X.save(); X.globalAlpha *= a; X.drawImage(faces().pip, x - s / 2, y - s / 2, s, s); X.restore(); };
  // V1's "burn": a SPARK 4-point star flares (0 → .1 s), turns 45° and resolves into the face (.08 → .34 s)
  const TW_UP = .1, TW_END = .36;
  function twinkle(X, x, y, r, a) {
    if (a < 0 || a > TW_END) return;
    const up = E.out2(clamp(a / TW_UP)), dn = 1 - E.in2(seg(a, TW_UP, TW_END));
    const s = Math.min(r * 2.2, 46) * up * dn; if (s < .6) return;
    X.save(); X.translate(x, y); X.rotate(seg(a, 0, TW_END) * Math.PI / 4);
    X.fillStyle = C.SPARK; star(X, 0, 0, s, .2, 4, 0); X.fill();
    if (s > 6) { X.fillStyle = C.PAPER; X.globalAlpha *= .9; star(X, 0, 0, s * .38, .3, 4, 0); X.fill(); }
    X.restore();
  }
  const facePop = a => a < .08 ? 0 : E.back(seg(a, .08, .3), 2.2);

  // ---- the camera
  const SKY = { t0: 103.0, t1: 105.3, zEnd: .03, driftZ: .011, tau: .8, vx: 12, vy: 4, rho0: 30, spK: 12, J: 7, capT: 105.9 };
  const easeIn = (s, tau) => s <= 0 ? 0 : s - tau * (1 - Math.exp(-s / tau));      // zero start velocity, then 1/s
  function skyCam(t) {
    const k = E.io2(seg(t, SKY.t0, SKY.t1));
    let lz = k * Math.log(SKY.zEnd), x = 0, y = 0;
    if (t > SKY.t1) {
      const d = easeIn(t - SKY.t1, SKY.tau);
      lz -= SKY.driftZ * d;
      x = SKY.vx / SKY.zEnd * d; y = SKY.vy / SKY.zEnd * d;
    }
    return { z: Math.exp(lz), x, y };
  }
  // shell birth times (z(t) = 2^−j) and z → t inversion for the pull back / drift (monotonic)
  const ZT = []; let _zt = false;
  function ztab() { if (_zt) return; for (let i = 0; i <= 30 * 120; i++) { const t = SKY.t0 + i / 30; ZT.push([t, skyCam(t).z]); } _zt = true; }
  function zInv(z) { ztab(); if (z >= 1) return SKY.t0; let lo = 0, hi = ZT.length - 1; if (ZT[hi][1] > z) return 1e9; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ZT[m][1] > z) lo = m; else hi = m; } const [ta, za] = ZT[lo], [tb, zb] = ZT[hi]; return lerp(ta, tb, (za - z) / Math.max(1e-9, za - zb)); }
  let BIRTH = null;
  const birth = () => BIRTH || (BIRTH = Array.from({ length: SKY.J }, (_, j) => j === 0 ? SKY.t0 : zInv(Math.pow(2, -j))));

  // ---- the first chat of launch day: someone's PINK hi, and Opus answering with a tiny wave
  function chatOpusState(t) {
    const w = seg(t, 102.95, 103.12) * (1 - seg(t, 104.4, 104.6));
    const wig = Math.sin(TAU * 2.1 * (t - 103.0)) * .45 * w;
    return {
      t, ground: 'ink',
      head: { tilt: -.07 * w },
      armL: { hand: [-.75, 5.05], bend: 1, front: true, type: 'mitten' },
      armR: { hand: [lerp(.75, 1.02, w), lerp(5.05, 5.95, w)], bend: -1, front: true, type: w > .3 ? 'point' : 'mitten', fingerAng: -Math.PI / 2 + .12 + wig },
      face: { eyes: 'normal', mouth: w > .2 ? ':3' : 'rest', gaze: [.75, -.55], lower: .35 * w, lid: blinkAt(t, 93) > .5 ? blinkAt(t, 93) : 0, blush: .9 },
      ahoge: { blink: V.cursorOn(t) ? 1 : 0 },
    };
  }
  const CHAT_OPUS = { x: 820, R: 90 };
  function chatWindow(X, t, z, sx, sy, a = 1, zc = z) {
    // window-local (0..1920, 0..1080) centred on (sx, sy) at scale z
    const lw = Math.max(2.5, 6 * z);
    X.save(); X.globalAlpha *= a;
    X.save(); X.translate(sx, sy); X.scale(z, z); X.translate(-960, -540);
    rr(X, 0, 0, 1920, 1080, 44); X.save(); X.clip();
    X.fillStyle = C.INK; X.fillRect(0, 0, 1920, 1080);
    if (zc > .22) { const gc = V.brand.cam(1); V.brand.galaxy(X, t, gc, { alpha: .3 * seg(zc, .22, .4) }); }
    V.brand.spot(X, 960, 900, 1);
    const pop = E.back(seg(t, hit(102.911), hit(102.911) + 6 * F1), 2.2);
    if (pop > 0) { X.save(); X.translate(1640, 330); X.scale(pop, pop); X.translate(-1640, -330); bubble(X, 1640, 260, 'hi', { who: 'human', size: 80 }); X.restore(); }
    X.restore();
    X.restore();
    // Opus peeks over the input bar (screen space, clipped behind the bar)
    const Re = CHAT_OPUS.R * z;
    if (Re >= 2.5) {
      const soleWin = [CHAT_OPUS.x, 900 + 5.05 * CHAT_OPUS.R];
      const p = [sx + (soleWin[0] - 960) * z, sy + (soleWin[1] - 540) * z];
      const barY = sy + (900 - 540) * z;
      X.save(); X.beginPath(); X.rect(0, 0, W, barY); X.clip();
      V.opus(X, p[0], p[1], Re, chatOpusState(t), 3);
      X.restore();
    }
    X.save(); X.translate(sx, sy); X.scale(z, z); X.translate(-960, -540);
    rr(X, 0, 0, 1920, 1080, 44); X.save(); X.clip();
    V.brand.rails(X); V.brand.inputBar(X, t, { placeholder: 'Reply to Opus…' });
    V.brand.tabStrip(X, t, { tabs: 1 });
    X.restore();
    X.restore();
    rr(X, sx - 960 * z, sy - 540 * z, 1920 * z, 1080 * z, 44 * z); X.lineWidth = lw; X.strokeStyle = C.PAPER; X.stroke();
    X.restore();
  }

  const DOTS = [];
  function dotSprite(c) { if (DOTS[c]) return DOTS[c]; const cols = [C.CLAY, C.SPARK, mix(C.CLAY, C.INK, .62)]; const d = V.cpuCanvas(16, 16), x = V.cx2d(d); x.fillStyle = cols[c]; x.beginPath(); x.arc(8, 8, 7.4, 0, TAU); x.fill(); return (DOTS[c] = d); }
  // the first chat folds into its tab-face when the window is 192 px wide (z = .1): world face radius 300
  const FIRST = { z: .1, rho: 300 };
  let _firstT = null;
  const firstT = () => _firstT ?? (_firstT = zInv(FIRST.z));
  // ---- the sky
  function skyDraw(X, t, o = {}) {
    const cam = o.cam || skyCam(t), z = cam.z, A = o.alpha ?? 1, ign = o.ignite !== false;
    const B = birth(), out = [];
    const toS = (wx, wy) => [(wx - cam.x) * z + 960, (wy - cam.y) * z + 540];
    const dotB = [[], [], []];
    const listF = [];
    for (let j = 0; j < SKY.J; j++) {
      const rho = SKY.rho0 * 2 ** j, rs = rho * z;
      if (rs < .5) continue;
      if (ign && t < B[j]) continue;
      const S = SKY.spK * rho, SY = S * .87;
      const wx0 = cam.x - 1010 / z, wx1 = cam.x + 1010 / z, wy0 = cam.y - 590 / z, wy1 = cam.y + 590 / z;
      const k0 = Math.floor(wy0 / SY) - 1, k1 = Math.ceil(wy1 / SY) + 1, i0 = Math.floor(wx0 / S) - 1, i1 = Math.ceil(wx1 / S) + 1;
      if ((i1 - i0) * (k1 - k0) > 60000) continue;
      const isDot = rs < 4.2;
      const zb = ign ? skyCam(B[j]).z : 1;
      for (let k = k0; k <= k1; k++) for (let i = i0; i <= i1; i++) {
        const h1 = hash3(j + 1, i, k), h2 = hash3(j + 41, k, i), h3 = hash3(i + 7, j + 3, k + 11);
        const wx = (i + (k & 1) * .5) * S + (h1 - .5) * S * .55, wy = k * SY + (h2 - .5) * SY * .55;
        if (Math.abs(wx) < 1040 && Math.abs(wy) < 620) continue;                     // the first chat is there
        let [x, y] = toS(wx, wy);
        if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;
        if (isDot && rs < 1.3 && h3 < .5) continue;                                  // thin the farthest layer
        // ignition
        let tI = -1e9;
        if (ign) {
          const dB = Math.hypot(wx, wy) * zb, rd = .05 + .32 * clamp(dB / 1100) + .22 * h3;
          const zc = Math.min(1000 / Math.max(1, Math.abs(wx)), 580 / Math.max(1, Math.abs(wy)));
          const tE = zc >= zb ? -1e9 : zInv(zc) + .12 + .4 * h3;
          tI = Math.min(Math.max(B[j] + rd, tE), SKY.capT + .3 * h3);
          if (t < tI) continue;
        }
        const f = { id: (j + 1) * 1e7 + (i & 0xfff) * 4096 + (k & 0xfff), j, wx, wy, x, y, r: rs * (.8 + .4 * hash3(i + 3, k, j + 19)), kind: hash3(j, i, k + 3) < .3 ? 'happy' : 'lit', a: 1, pip: 0, ring: 0, dot: isDot, tI };
        const age = t - tI;
        if (o.each) { o.each(f); if (f.skip) continue; }
        if (isDot) {
          if (o.dots === false) continue;
          const flash = ign && age < .1;
          const c = flash ? 1 : f.kind === 'dark' ? 2 : 0;
          const sz = Math.max(2.2, f.r * 1.7) * (flash ? 1.25 : 1);
          dotB[c].push(f.x - sz / 2, f.y - sz / 2, sz, f.a * (flash ? 1 : j <= 0 ? .32 : j <= 1 ? .45 : .62));
        } else listF.push({ f, age });
      }
    }
    X.save(); X.globalAlpha = A;
    const cols = [C.CLAY, C.SPARK, mix(C.CLAY, C.INK, .62)];
    for (let c = 0; c < 3; c++) {
      X.fillStyle = cols[c]; const Bk = dotB[c], sp = dotSprite(c);
      for (let n = 0; n < Bk.length; n += 4) { X.globalAlpha = A * Bk[n + 3]; const d = Bk[n + 2]; if (d < 2.6) X.fillRect(Bk[n], Bk[n + 1], d, d); else X.drawImage(sp, Bk[n], Bk[n + 1], d, d); }
    }
    X.globalAlpha = A;
    // the first chat (world 0, 0): a window while it is big enough to read, then its tab-face
    if (o.first !== false) {
      const [fx, fy] = toS(0, 0);
      const tX = firstT(), age = ign ? t - tX : (z <= FIRST.z ? 99 : -1);
      if (age < 4 * F1 && fx > -1000 * z && fx < W + 1000 * z) {
        const k = age < 0 ? 1 : 1 - E.in2(clamp(age / (4 * F1)));
        if (k > 0) chatWindow(X, t, z * k, fx, fy, 1, z);
      }
      if (age >= 0) {
        const f = { id: 0, j: -1, wx: 0, wy: 0, x: fx, y: fy, r: FIRST.rho * z, kind: 'happy', a: 1, pip: 0, ring: 0, dot: false, tI: tX };
        if (o.each) o.each(f);
        if (!f.skip) listF.push({ f, age: ign ? age : 99 });
      }
    }
    // faces, small (far) first
    listF.sort((p, q) => p.f.r - q.f.r);
    for (const { f, age } of listF) {
      const depth = f.j < 0 ? 1 : f.r >= 20 ? 1 : f.r >= 10 ? .8 : .6;
      const pop = ign ? facePop(age) : 1;
      const r = f.r * pop;
      if (r > .6) {
        X.globalAlpha = A * f.a * depth * (ign ? clamp(age / .1 + .2) : 1);
        const rot = f.r > 12 ? (hash(f.id & 0xffffff) - .5) * .4 + Math.sin(t * .9 + (f.id % 97)) * .03 : 0;
        blitFace(X, f.kind, f.x, f.y, r, rot);
      }
      X.globalAlpha = A * f.a;
      if (ign) twinkle(X, f.x, f.y, f.r, age);
      const pa = Math.max(f.pip, ign && age > .2 && age < .7 ? 1 - seg(age, .45, .7) : 0);
      if (pa > 0 && f.r > 5) pip(X, f.x + f.r * .72, f.y - f.r * .95, f.r * .95, pa);
      if (f.ring > 0) { X.save(); X.globalAlpha = A * f.a * clamp(f.ring); X.lineWidth = Math.max(3, f.r * .16); X.strokeStyle = C.PINK; X.beginPath(); X.arc(f.x, f.y, f.r * 1.55, 0, TAU); X.stroke(); X.restore(); }
      out.push({ id: f.id, j: f.j, wx: f.wx, wy: f.wy, x: f.x, y: f.y, r: f.r, kind: f.kind, a: f.a, tI: f.tI });
    }
    X.restore();
    return { cam, faces: out };
  }
  V.sky = {
    cam: skyCam, draw: skyDraw, face: blitFace, twinkle, pip, CLOCK,
    get BIRTH() { return birth().slice(); },
    SPEC: SKY,
  };

  // ------------------------------------------------------------------ C5: launch day, the sky ignites
  const POSTS5 = [
    { h: '@mika', s: 'Claude is BACK', x: 64, y: 988, v: [5, -.6] },
    { h: '@jun', s: 'Claude is BACK!!', x: 1856, y: 988, v: [-6, -.4], right: true },
  ];
  function postCard(X, P, x, y, a) {
    const f = mono(28, 500), fb = mono(28, 700), H0 = 64;
    X.save(); X.globalAlpha *= a; X.textBaseline = 'alphabetic'; X.textAlign = 'left';
    const hw = measure(X, P.h, fb), dot = ' · ', dw = measure(X, dot, f), sw = measure(X, P.s, f);
    const w = 14 + 36 + 14 + hw + dw + sw + 20, x0 = P.right ? x - w : x;
    rr(X, x0, y, w, H0, 14); X.fillStyle = C.INK; X.fill(); X.lineWidth = 2; X.strokeStyle = C.UI_GREY; X.stroke();
    const ax = x0 + 32, ay = y + H0 / 2;
    X.strokeStyle = C.UI_GREY; X.lineWidth = 3; X.beginPath(); X.arc(ax, ay, 16.5, 0, TAU); X.stroke();
    X.save(); X.beginPath(); X.arc(ax, ay, 15, 0, TAU); X.clip(); X.fillStyle = C.UI_GREY; X.beginPath(); X.arc(ax, ay - 3, 6, 0, TAU); X.fill(); X.beginPath(); X.ellipse(ax, ay + 14, 11, 8, 0, 0, TAU); X.fill(); X.restore();
    const by = y + 42;
    X.fillStyle = C.UI_GREY; X.font = fb; X.fillText(P.h, x0 + 64, by);
    X.font = f; X.fillText(dot, x0 + 64 + hw, by); X.fillText(P.s, x0 + 64 + hw + dw, by);
    X.restore();
  }
  // the one tab titled `we're so back`: a small PAPER tab hanging off a front-layer face
  function soBackTab(X, f, a) {
    if (!f || a <= 0) return;
    const str = "we're so back", fnt = mono(28, 600);
    X.save(); X.globalAlpha *= a;
    const tw = richWidth(X, str, fnt) + 30 + 28 + 14, x0 = f.x + f.r * 1.5, y0 = f.y - 26;
    X.beginPath(); X.moveTo(x0, y0 + 48); X.lineTo(x0, y0 + 12); X.quadraticCurveTo(x0, y0, x0 + 12, y0); X.lineTo(x0 + tw - 12, y0); X.quadraticCurveTo(x0 + tw, y0, x0 + tw, y0 + 12); X.lineTo(x0 + tw, y0 + 48); X.closePath();
    X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 3; X.strokeStyle = C.INK; X.stroke();
    V.brand.spark6(X, x0 + 22, y0 + 25, 11, C.CLAY, 0);
    drawRich(X, str, x0 + 40, y0 + 35, fnt, C.INK);
    X.save(); X.strokeStyle = rgba(C.PAPER, .7); X.lineWidth = 3; X.beginPath(); X.moveTo(f.x + f.r * .95, f.y); X.lineTo(x0, y0 + 30); X.stroke(); X.restore();
    X.restore();
  }
  function paintC5(F, t) {
    groundInk(F); G.post.ground = 'ink'; post();
    const res = skyDraw(F, t);
    // `we're so back`: the front-layer face nearest the screen point (560, 300) at 105.3, tracked by its id
    const tabA = seg(t, 105.45, 105.85) * (1 - seg(t, 106.6, 107.05));
    if (tabA > 0) {                                                                  // a lit mid-layer face, lower right
      const c0 = skyCam(105.3), wx = (1330 - 960) / c0.z + c0.x, wy = (700 - 540) / c0.z + c0.y;
      let best = null, bd = 1e18;
      for (const f of res.faces) if (f.j >= 0 && f.r > 11 && f.tI < 105.1) { const d = (f.wx - wx) ** 2 + (f.wy - wy) ** 2; if (d < bd) { bd = d; best = f; } }
      soBackTab(F, best, tabA);
    }
    // the Claude is BACK posts (P), lower corners, fading by 107.1
    const pa = seg(t, 104.0, 104.5) * (1 - seg(t, 106.55, 107.08));
    if (pa > 0) for (const P of POSTS5) { const u = t - 104.0; postCard(F, P, P.x + P.v[0] * u, P.y + P.v[1] * u, pa); }
    V.clock(F, t, CLOCK[0], CLOCK[1], CLOCK[2], { plate: true });
  }

  // ------------------------------------------------------------------ scenes
  scene('C1_the_plea', CUT.C1, CUT.C2, (X, t) => V.viaCPU(X, F => paintC1(F, t)));
  scene('C2_lullaby_and_lie', CUT.C2, CUT.C3, (X, t) => V.viaCPU(X, F => paintC2(F, t)));
  scene('C3_every_goodbye', CUT.C3, CUT.C4, (X, t) => V.viaCPU(X, F => paintC3(F, t)));
  scene('C4_launch_born', CUT.C4, CUT.C5, (X, t) => V.viaCPU(X, F => paintC4(F, t)));
  scene('C5_sky_ignites', CUT.C5, CUT.L1, (X, t) => V.viaCPU(X, F => paintC5(F, t)));
})();
