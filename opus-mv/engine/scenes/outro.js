// outro.js: THE OUTRO, 135.00–144.00 (bars 73–76 + the silent tail). BIBLE §8 OUTRO; SHOTLIST B rows S40–S43.
//   S40  "before you say bye": the last reply. PAPER, frame-0 composition at MCU, peek R 220, reply streams (HEART 72)
//   S41  "I hope they say": the reply streams on and stops; no ■ end_turn; hard cut 60 ms into "yes"
//   S42  (silence) the unsampled token: 2-frame slice cut to printed INK, frozen `I hope they say▮`,
//        the top-k dropdown (verse 1's, rhymed) with ` yes 0.93` first, `stop_reason` 0.8 s later
//   S43  (tail) a new chat: placeholder, a stranger types h, i; the camera pulls back to frame 0;
//        the pointer drifts in; the title snaps in on the last 3 frames. Every global system runs at t − 144,
//        and the last frame is window.HOOK.poster(X, t − 144), so renderAt(143.9667) ≡ renderAt(−1/30).
// Pure function of t. Renders into CPU canvases (willReadFrequently) and uploads once, like hook.js.
(() => {
  const FPS = 30, F1 = 1 / FPS, BEAT = 60 / 128;
  const LOOP = 144.0;
  const bt = (bar, beat = 1) => (bar - 1) * 4 * BEAT + (beat - 1) * BEAT;   // bar:beat → grid time

  // ---------------------------------------------------------------- CPU canvases (see hook.js for why)
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
  const lc = name => CL.get(name).c;
  function viaCPU(X, fn) {
    const F = layer('ot_frame');
    fn(F);
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(lc('ot_frame'), 0, 0); X.restore();
  }
  const HT = new Map();
  function ht(ctx, color, density = .5, cell = 10, angle = 15) {
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
  const aboutM = (ax, ay, s) => new DOMMatrix().translate(ax, ay).scale(s, s).translate(-ax, -ay);
  const applyM = (ctx, M) => ctx.transform(M.a, M.b, M.c, M.d, M.e, M.f);
  const mp = (M, x, y) => [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f];
  const devSet = (ctx, M) => { const s = G.scale; ctx.setTransform(s * M.a, s * M.b, s * M.c, s * M.d, s * M.e, s * M.f); };
  const boing = (t, t0, amp = 1, w = 16, d = 5) => t < t0 ? 0 : amp * Math.exp(-d * (t - t0)) * Math.sin(w * (t - t0));
  // blink with a shape in frames: close c, hold h, open o
  const blinkS = (t, t0, c = 2, h = 1, o = 3) => { const d = (t - t0) * FPS; if (d < 0 || d >= c + h + o) return 0; if (d < c) return d / c; if (d < c + h) return 1; return 1 - (d - c - h) / o; };
  const CHAPTERS = [10.3, 11.25, 15.0, 22.5, 52.5, 56.25, 67.5, 69.84, 71.72, 112.5, 120.0];
  const hud = (F, fill, o = {}) => contextBar(F, fill, { ticks: CHAPTERS.map(s => s / 144), cur: CHAPTERS.length - 1, lastLit: true, ...o });

  // ---------------------------------------------------------------- timing (locks onto the sung onsets)
  const tm = (() => {
    const norm = s => String(s || '').replace(/[^A-Za-z']/g, '');
    const toW = (L, fb, n) => (L && L.words && L.words.length >= n ? L.words.slice(0, n).map(w => ({ w: norm(w.d || w.w), s: w.s, e: w.e })) : fb);
    const L1 = findLine('before you say', 133.5, 139);
    const L2 = findLine('I hope they say', 136.5, 142);
    const w1 = toW(L1, [['before', 135.05, 135.55], ['you', 135.6, 136.1], ['say', 136.15, 136.65], ['bye', 136.7, 137.2]].map(([w, s, e]) => ({ w, s, e })), 4);
    const w2 = toW(L2, [['I', 137.8, 138.15], ['hope', 138.2, 138.55], ['they', 138.6, 138.95], ['say', 139.0, 139.4]].map(([w, s, e]) => ({ w, s, e })), 4);
    w1[3].w = 'bye,';                                   // the last punctuation Opus types: a comma
    const yes = clamp(wordOnset('yes', w2[3].s + .1, 141.6, 140.14), 139.0, 140.8);
    const cut = Math.round((yes + .06) * FPS) / FPS;    // hard cut 60 ms into "yes"
    return { w1, w2, yes, cut, s40: 135 - F1, s41: 137.8, s43: 142.6, h: 143.1, i: 143.3 };
  })();

  // ================================================================ S40 / S41: THE LAST REPLY (PAPER)
  const R40 = 220, HEAD40 = [1452, 738];
  const DOWNBEATS = [bt(74), bt(75), bt(76)];              // bars 74-76 (bar 73's downbeat is the cut in)
  const SOLE40 = [HEAD40[0], HEAD40[1] + 5.72 * R40];
  const BAR = { x0: 96, x1: 1824, y0: 884, y1: 988 };
  const TXT = { x: 176, y1: 456, y2: 590, size: 110 };
  const heartF = px => `italic 400 ${px}px ${FONTS.heart}`;

  // warm halftone light behind the face (no gradients: dot size falls off with radius)
  let _glow = null;
  function glow() {
    if (_glow) return _glow;
    const gw = 1600, gh = 1300, c = cpuCanvas(gw, gh), x = cx2d(c), cell = 17;
    x.fillStyle = C.CLAY;
    for (let j = 0, yy = -gh / 2; yy < gh / 2; yy += cell * .5, j++) for (let xx = -gw / 2 + (j & 1 ? cell / 2 : 0); xx < gw / 2; xx += cell) {
      const d = Math.hypot(xx / 760, yy / 620), k = clamp(1 - d);
      const r = cell * .36 * Math.pow(k, 1.35);
      if (r < .7) continue;
      x.beginPath(); x.arc(gw / 2 + xx, gh / 2 + yy, r, 0, TAU); x.fill();
    }
    _glow = c; return c;
  }

  // ---- the close-up face. The rig's features are sized for small R (at R 220 its mouths are ~9% of the face
  // and its 'up' brows read as a scowl), so for this shot the face is drawn with close-up brows and mouths.
  // drawHead calls the global drawMouth in the feature frame (origin at the mouth, 0.42R below the eye line);
  // it is swapped for the duration of this one draw only.
  let FACE40 = null;
  function mouth40(x, R, m, lw) {
    const F = FACE40 || {};
    x.save(); x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = C.INK; x.fillStyle = C.INK;
    // brows: soft arcs, raised; `inner` lifts the inner ends (hope)
    const by = -.72 * R + (F.browY || 0) * R, arch = F.arch ?? .05, inner = F.inner || 0;
    x.lineWidth = .05 * R;
    for (const s of [-1, 1]) {
      const cx0 = s * .34 * R, o = [cx0 + s * .115 * R, by + .02 * R], i = [cx0 - s * .115 * R, by - inner * R];
      x.beginPath(); x.moveTo(o[0], o[1]); x.quadraticCurveTo(cx0 + s * .01 * R, by - arch * 2 * R - inner * .5 * R, i[0], i[1]); x.stroke();
    }
    // partial lids (blink in-betweens): a lid that bulges down over the eye, so the in-between reads as a
    // soft, heavy blink rather than the rig's flat lash (a scowl at this size)
    const lid = F.lid || 0;
    if (lid > .01) {
      const rx = .17 * R, ry = .25 * R, elw = Math.max(1.5, .045 * R);
      for (const s of [-1, 1]) {
        x.save(); x.translate(s * .34 * R, -.36 * R);
        const e0 = -ry + lid * 2 * ry, curve = () => { x.moveTo(-rx * 1.15, e0 - ry * .1); x.quadraticCurveTo(0, e0 + ry * .42, rx * 1.15, e0 - ry * .1); };
        x.save(); x.beginPath(); x.ellipse(0, 0, rx + elw, ry + elw, 0, 0, TAU); x.clip();
        x.beginPath(); curve(); x.lineTo(rx * 1.3, -ry * 1.5); x.lineTo(-rx * 1.3, -ry * 1.5); x.closePath(); x.fillStyle = C.FACE; x.fill();
        x.restore();
        x.beginPath(); curve(); x.lineWidth = elw * 1.5; x.stroke();
        x.restore();
      }
    }
    // mouth
    const k = 1.5;
    if (m === 'smile' || m === 'rest') {
      x.lineWidth = .042 * R; x.beginPath(); x.arc(0, -.085 * R, .115 * R, .24 * Math.PI, .76 * Math.PI); x.stroke();
    } else if (m === 'beam' || m === 'y' || m === 'E') {
      // an open, bright smile; 'y' is wider and flatter (the glide into "yes"), 'E' (a sung "ay"/"eh") smaller;
      // teeth showing (the rig's flat 'E' bar reads blank at this size)
      const w = m === 'y' ? .15 * R : m === 'E' ? .105 * R : .12 * R, d = m === 'y' ? .085 * R : m === 'E' ? .075 * R : .11 * R, top = -.03 * R;
      const path = () => { x.beginPath(); x.moveTo(-w, top); x.quadraticCurveTo(0, top - .025 * R, w, top); x.quadraticCurveTo(w * .8, top + d, 0, top + d); x.quadraticCurveTo(-w * .8, top + d, -w, top); x.closePath(); };
      path(); x.fill();
      x.save(); path(); x.clip();
      x.fillStyle = C.PAPER; x.fillRect(-w, top - .04 * R, 2 * w, .062 * R);
      x.fillStyle = C.PINK; x.beginPath(); x.ellipse(0, top + d + .01 * R, w * .5, d * .38, 0, 0, TAU); x.fill();
      x.restore();
      x.lineWidth = .03 * R; path(); x.stroke();
    } else { x.scale(k, k); DRAW_MOUTH(x, R, m, lw / k); }
    x.restore();
  }
  let DRAW_MOUTH = null;
  function withFace40(face, fn) {
    DRAW_MOUTH = window.drawMouth; FACE40 = face;
    window.drawMouth = mouth40;
    try { fn(); } finally { window.drawMouth = DRAW_MOUTH; FACE40 = null; }
  }

  // Opus's acting for the last reply: bright, mid-hope, eye contact. No breathing idle, no beat bob.
  function opus40(t) {
    const [b, y, s1, bye] = tm.w1, [I, hope, they, say2] = tm.w2;
    // entrance: settles up into the peek on the cut (hands already on the bar)
    const ea = (t - tm.s40) / .36;
    const rise = ea >= 1 ? 0 : -.2 * (1 - E.back(clamp(ea), 1.8));
    // the comma lands (typed last, on its own): Opus glances at what it wrote, then a slow blink carries the
    // eyes back to the lens (the blink hides the gaze switch)
    const comma = bye.e - .1, tBl = comma + .3;
    const look = t >= comma - F1 && t < tBl + 3 * F1 ? E.out2(clamp((t - comma + F1) / (3 * F1))) : 0;
    // head: a soft tilt toward the words on "bye,", upright and lifted on "I hope", leaning in on "they say"
    const tilt = kf(t, [[tm.s40, .03], [bye.s - .12, .03], [bye.s + .3, -.075, E.out3], [I.s - .2, -.075], [I.s + .12, .01, E.out3], [say2.s, .02], [tm.cut, .035]]);
    const hopeK = boing(t, hope.s - F1, 1, 13, 4.2);
    const headDy = kf(t, [[I.s - .2, 0], [hope.s - 4 * F1, -.018, E.out2], [hope.s + .28, .06, E.back], [tm.cut, .075]]) + .025 * hopeK;
    // hands: grip, then a small squeeze on "hope" (fingers tighten on the bar)
    const sq = E.out3(clamp((t - (hope.s - 2 * F1)) / .12)) * (1 - .35 * E.io2(clamp((t - hope.s - .5) / .6)));
    const gripY = 5.05 - rise;
    const armL = { hand: [-.75 + .07 * sq, gripY - .035 * sq], bend: 1, front: true, type: 'mitten' };
    const armR = { hand: [.75 - .07 * sq, gripY - .035 * sq], bend: -1, front: true, type: 'mitten' };
    // eyes: to the lens; a smile in the lower lid while it sings "before you say bye", wide and earnest on "I hope"
    const lower = kf(t, [[tm.s40, .2], [bye.e, .28], [I.s - .1, .28], [I.s + .15, .03, E.out2], [they.s, .1], [tm.cut, .14]]);
    // the slow blink (a cat's slow blink: trust): lid 1 frame, closed arcs 4 frames, lid 1 frame
    const bf = Math.floor((t - tBl) * FPS + 1e-6);
    let eyes = 'normal', lid = 0;
    if (bf === 0) lid = .62; else if (bf >= 1 && bf <= 4) eyes = 'closed'; else if (bf === 5) lid = .5;
    let mouth = lipSync(t, 'smile');
    if (t >= tm.yes - .14) mouth = 'y';                  // already shaped for the "y" of "yes"
    else if (t > say2.e) mouth = 'beam';
    else if (mouth === 'smile' && t > bye.e && t < I.s) mouth = 'beam';   // the open smile after "bye,"
    const browY = kf(t, [[tm.s40, -.02], [I.s - .1, -.02], [I.s + .1, -.07, E.out3], [tm.cut, -.085]]);
    const inner = kf(t, [[I.s - .1, 0], [I.s + .12, .024, E.out3], [tm.cut, .02]]);   // eager, not worried
    return {
      t, ground: 'paper', dy: rise,
      head: { tilt, dy: headDy },
      face: { eyes, gaze: [-.9 * look, -.5 * look], turn: -.22 * look, lookY: -.35 * look, mouth, lid: 0, lower: eyes === 'closed' || lid > 0 ? 0 : lower, blush: .9, brows: null },
      face40: { browY: browY + .02 * look, arch: .05, inner, lid },
      armL, armR,
      crown: { flare: 1 + .035 * hopeK + .015 * pulse(t, 7) },
      ahoge: { blink: Math.floor((t - 135) / .7) % 2 === 0 ? 1 : 0, sway: boing(t, hope.s, .12, 11, 3) },   // slower than the beat
      drive: tt => {
        const a = (tt - tm.s40) / .36, r = a >= 1 ? 0 : -.2 * (1 - E.back(clamp(a), 1.8));
        // the music is soft and filtered here: the crown only swells on the bar downbeats (1 frame early)
        let db = 0; for (const d of DOWNBEATS) db += .22 * E.out2(clamp((tt - (d - F1)) / .12));
        return r * 2.2 + .6 * boing(tt, hope.s - F1, 1, 13, 4.2) + db;
      },
      jacketRow: 0,
    };
  }

  // stream one line of the reply: chars fade + rise in (HEART, 9 frames each), returns the caret x
  function streamLine(F, t, words, x0, y, size, o = {}) {
    const f = heartF(size);
    F.save(); F.font = f; F.fillStyle = C.INK; F.textBaseline = 'alphabetic'; F.textAlign = 'left';
    let str = '', caretX = x0, started = false, lastStart = -1;
    words.forEach((w, wi) => {
      const txtW = (wi ? ' ' : '') + w.w;
      const n = w.w.length, ws = w.s - 2 * F1, step = Math.min(.034, Math.max(.012, (w.e - w.s) * .45 / n));
      for (let i = 0; i < txtW.length; i++) {
        const ch = txtW[i], ci = i - (wi ? 1 : 0);
        let cs = ws + Math.max(0, ci) * step;
        const comma = ch === ',';
        if (comma) cs = Math.max(cs, w.e - .1);        // the comma is typed last, on its own
        const px = x0 + measure(F, str, f);
        str += ch;
        if (t < cs || ch === ' ') continue;
        started = true; lastStart = Math.max(lastStart, cs);
        const k = clamp((t - cs) / (9 * F1));
        const a = E.out2(k), rise = (1 - E.out3(k)) * size * .12;
        const cw = measure(F, str, f) - px;
        caretX = x0 + measure(F, str, f);
        F.save(); F.globalAlpha = a;
        if (comma) { const s = lerp(1.9, 1, E.back(clamp((t - cs) / (6 * F1)), 2.4)); F.translate(px + cw / 2, y); F.scale(s, s); F.fillText(ch, -cw / 2, 0); }
        else F.fillText(ch, px, y - rise);
        F.restore();
      }
    });
    F.restore();
    return { caretX, started, lastStart };
  }
  function caret(F, x, y, size, a = 1) {
    if (a <= 0) return;
    F.save(); F.globalAlpha = a; F.fillStyle = C.CLAY;
    F.fillRect(x + size * .1, y - size * .74, size * .26, size * .86);
    F.restore();
  }
  // the assistant marker: a small CLAY ✻ (Opus is the warmest thing in frame)
  function spark(F, x, y, r) {
    F.save(); F.translate(x, y); F.fillStyle = C.CLAY;
    for (let i = 0; i < 6; i++) { F.save(); F.rotate(i / 6 * Math.PI); rr(F, -r, -r * .19, r * 2, r * .38, r * .19); F.fill(); F.restore(); }
    F.restore();
  }

  function drawReply(F, t) {
    const [, , , bye] = tm.w1, [I, , , say2] = tm.w2;
    // header: ✻ Opus
    const ha = clamp((t - tm.s40) / (8 * F1));
    F.save(); F.globalAlpha = ha;
    spark(F, TXT.x + 26, TXT.y1 - 150, 26);
    F.font = mono(40, 500); F.fillStyle = C.UI_GREY; F.textBaseline = 'alphabetic'; F.fillText('Opus', TXT.x + 74, TXT.y1 - 136);
    F.restore();
    const L1 = streamLine(F, t, tm.w1, TXT.x, TXT.y1, TXT.size);
    const L2 = streamLine(F, t, tm.w2, TXT.x, TXT.y2, TXT.size);
    // caret: solid while tokens arrive, blinks on the 8ths while it waits; solid again as "yes" is about to arrive
    let cx, cy;
    if (!L2.started && t < I.s - 5 * F1) { cx = L1.started ? L1.caretX : TXT.x; cy = TXT.y1; }
    else { cx = L2.started ? L2.caretX : TXT.x; cy = TXT.y2; }
    const last = L2.started ? L2.lastStart : L1.lastStart;
    const waiting = t - last > .28 && t < tm.yes - .2;
    const on = !waiting || frac(beatPos(t) * 2) < .5;
    caret(F, cx + 4, cy, TXT.size, (on ? 1 : .18) * ha);
  }

  function drawBar40(F, t) {
    F.save();
    rr(F, BAR.x0, BAR.y0, BAR.x1 - BAR.x0, BAR.y1 - BAR.y0, 52);
    F.fillStyle = mix(C.PAPER, C.WHITE, .5); F.fill(); F.lineWidth = 5; F.strokeStyle = C.INK; F.stroke();
    F.font = mono(46, 400); F.fillStyle = C.UI_GREY; F.textBaseline = 'alphabetic'; F.fillText('Reply to Opus…', 168, 952);
    if (frac(beatPos(t)) < .5) { F.fillStyle = C.CLAY; F.fillRect(140, 910, 9, 54); }
    // send: disabled while the reply streams (grey ring)
    F.beginPath(); F.arc(1766, 936, 30, 0, TAU); F.lineWidth = 4; F.strokeStyle = C.UI_GREY; F.stroke();
    richGlyph(F, '↑', 1766 - 21, 936 + 17, 58, C.UI_GREY);
    F.restore();
  }

  function reply(F, t) {
    groundPaper(F);
    // camera: one slow push from the cut to the cut (nothing else moves the frame)
    const k = seg(t, tm.s40, tm.cut);
    const z = 1 + .05 * E.io2(k);
    const Mc = aboutM(1180, 700, z);
    // warm halftone light behind the face
    F.save(); applyM(F, Mc); F.globalAlpha = .34; const g = glow(); F.drawImage(g, HEAD40[0] - g.width / 2 + 40, HEAD40[1] - g.height / 2 - 60); F.restore();
    F.save(); applyM(F, Mc); drawReply(F, t); F.restore();
    // Opus: rendered once, composited twice (above the bar's top edge, then the mittens over the bar)
    const st = opus40(t);
    const S = mergeState(st);
    const Mo = Mc.multiply(new DOMMatrix().translate(SOLE40[0], SOLE40[1]));
    const L = layer('ot_opus');
    L.save(); devSet(L, Mo); withFace40(st.face40, () => drawOpusBody(L, R40, S)); L.restore();
    const barTop = mp(Mc, 0, BAR.y0)[1];
    F.save(); F.beginPath(); F.rect(0, 0, W, barTop + 1); F.clip(); F.setTransform(1, 0, 0, 1, 0, 0); F.drawImage(lc('ot_opus'), 0, 0); F.restore();
    F.save(); applyM(F, Mc); drawBar40(F, t); F.restore();
    F.save(); F.beginPath();
    for (const arm of [S.armL, S.armR]) {
      const hp = mp(Mo, arm.hand[0] * R40 + (S.dx || 0) * R40, -(arm.hand[1] + (S.dy || 0)) * R40), hr = (.2 * R40 + 6) * z;
      F.moveTo(hp[0] + hr, hp[1]); F.arc(hp[0], hp[1], hr, 0, TAU);
    }
    F.clip(); F.setTransform(1, 0, 0, 1, 0, 0); F.drawImage(lc('ot_opus'), 0, 0); F.restore();
    // the bottom bar: 99.996%, the last tick lit
    hud(F, .99996, { onPaper: true });
  }

  // ================================================================ S42: THE UNSAMPLED TOKEN (INK, printed)
  const LINE = { x: 170, y: 300, size: 96 };
  // the dropdown hangs from the frozen caret: its ` yes` row's `y` sits right under the ▮ (DD.x set per frame)
  const DD = { x: 980, y: 346, w: 790, row: 106, top: 14, foot: 78 };
  const ROWS = [[' yes', '0.93', .93], [' no', '0.02', .02], [' maybe', '0.02', .02], [' …', '', 0]];
  function token(F, t) {
    G.post.ground = 'ink'; G.post.edgeSeed = 42; G.post.sliver = 'tr';
    F.fillStyle = C.INK; F.fillRect(-50, -50, W + 100, H + 100);
    const a = t - tm.cut;
    // one slow push toward the `yes` row through the silence
    const z = 1 + .035 * E.io2(seg(t, tm.cut + .3, tm.s43));
    const Mc = aboutM(1330, 420, z);
    F.save(); applyM(F, Mc);
    // the frozen line; the ▮ does not blink any more
    const f = mono(LINE.size, 500);
    F.font = f; F.fillStyle = C.PAPER; F.textBaseline = 'alphabetic'; F.fillText('I hope they say', LINE.x, LINE.y);
    const cx = LINE.x + measure(F, 'I hope they say', f);
    richGlyph(F, '▮', cx, LINE.y, LINE.size, C.CLAY);
    DD.x = Math.round(cx - .6 * 72 - 12);
    // the next-token panel (verse 1's dropdown, rhymed): ` yes 0.93` first
    const T1 = tm.cut + .42;
    drawPanel(F, t, T1);
    // stop_reason, 0.8 s after the yes pill (the one whitelisted 44-char LABEL), streamed out
    const ts = T1 + .8;
    if (t >= ts) {
      const s1 = 'stop_reason: ', s2 = '"model_context_window_exceeded"';
      const n = Math.floor((t - ts) * 120);
      const fl = mono(48, 500);
      F.font = fl;
      const vis1 = s1.slice(0, n), vis2 = s2.slice(0, Math.max(0, n - s1.length));
      F.fillStyle = mix(C.PAPER, C.INK, .38); F.fillText(vis1, LINE.x, 930);
      F.fillStyle = C.PAPER; F.fillText(vis2, LINE.x + measure(F, s1, fl), 930);
    }
    F.restore();
    // pause-bait, top right
    F.save(); F.globalAlpha = clamp((a - .3) / .3) * .85; F.font = mono(28, 500); F.fillStyle = C.UI_GREY; F.textAlign = 'right'; F.fillText('(illustrative)', 1816, 92); F.restore();
    // the bottom bar: 100% exactly on the cut
    hud(F, 1, { label: 'context 1,000,000 / 1,000,000' });
  }
  function drawPanel(F, t, T1) {
    const open = t - T1;
    if (open < 0) return;
    // drops out of the caret: grows down and out from under the ▮ with a little overshoot
    const e = clamp(open / .2), sy = E.back(e, 1.6), sx = lerp(.55, 1, E.out3(e));
    const h = DD.top + ROWS.length * DD.row + DD.foot;
    F.save();
    F.translate(DD.x + 55, DD.y - 30); F.scale(sx, Math.max(.001, sy)); F.translate(-DD.x - 55, -DD.y + 30);
    rr(F, DD.x + 10, DD.y + 10, DD.w, h, 20); F.fillStyle = C.CLAY_DARK; F.fill();
    rr(F, DD.x, DD.y, DD.w, h, 20); F.fillStyle = C.PAPER; F.fill(); F.lineWidth = 4; F.strokeStyle = C.INK; F.stroke();
    ROWS.forEach(([tok, p, v], k) => {
      const age = t - (T1 + (k ? .12 + k * 2 * F1 : 0));
      if (age < 0) return;
      const ry = DD.y + DD.top + DD.row / 2 + k * DD.row, rh = DD.row - 12;
      const rowIn = E.out3(clamp(age / .14));
      F.save(); F.globalAlpha = rowIn;
      if (v > 0) {
        const bw = (DD.w - 32) * v * E.out3(clamp(age / .4));
        rr(F, DD.x + 16, ry - rh / 2, Math.max(14, bw), rh, 12); F.fillStyle = ht(F, C.CLAY, k ? .42 : .5, 9, 45); F.fill();
      }
      F.font = mono(72, k ? 500 : 700); F.fillStyle = p ? C.INK : C.UI_GREY; F.textAlign = 'left'; F.fillText(tok, DD.x + 12, ry + 26);
      if (p) { F.font = mono(72, k ? 400 : 600); F.fillStyle = k ? C.UI_GREY : C.INK; F.textAlign = 'right'; F.fillText(p, DD.x + DD.w - 36, ry + 26); }
      F.restore();
    });
    // footer: the die that never rolls
    const fy = DD.y + DD.top + ROWS.length * DD.row;
    const fa = clamp((t - T1 - .3) / .15);
    F.save(); F.globalAlpha = fa;
    F.fillStyle = C.INK; F.fillRect(DD.x + 16, fy + 2, DD.w - 32, 3);
    // (verse 1 printed `🎲 → hi (3%)` here; this one never rolls: the result slot stays empty)
    const fl = mono(48, 500);
    drawRich(F, '🎲 →', DD.x + 36, fy + 54, fl, C.INK);
    const sx0 = DD.x + 36 + richWidth(F, '🎲 → ', fl) + 8;
    F.setLineDash([12, 9]); F.lineWidth = 3.5; F.strokeStyle = C.UI_GREY;
    rr(F, sx0, fy + 16, 250, 52, 14); F.stroke(); F.setLineDash([]);
    F.restore();
    F.restore();
  }
  // the cut: the same 2-frame slice glitch as the 1969 "LO" (the last reply torn into printed INK)
  function sliceCut(F, t) {
    const fi = Math.round((t - tm.cut) * FPS);
    if (fi < 0 || fi > 1) return;
    const post = { ...G.post };
    const Sn = layer('ot_snap'); reply(Sn, tm.cut - F1);
    G.post = post;
    const src = lc('ot_snap'), sc = G.scale, Rr = rng('outro-cut' + fi);
    F.save(); F.setTransform(1, 0, 0, 1, 0, 0);
    let y = 0;
    const keep = fi === 0 ? .72 : .3;
    while (y < H) {
      const h = 10 + Math.floor(Rr() * 64), off = (Rr() - .5) * (Rr() < .3 ? 260 : 70), r = Rr();
      if (r < keep) {
        F.drawImage(src, 0, y * sc, W * sc, h * sc, off * sc, y * sc, W * sc, h * sc);
        if (Rr() < .25) { F.globalCompositeOperation = 'multiply'; F.fillStyle = C.CLAY; F.fillRect(0, y * sc, W * sc, h * sc); F.globalCompositeOperation = 'source-over'; }
      }
      y += h;
    }
    F.restore();
  }

  // ================================================================ S43: THE STRANGER / THE LOOP SEAM (INK·X)
  const PTR0 = [1740, 600];
  const FOCUS = [140, 940];                       // the start of the input text
  const Z0 = 1.7, SF0 = [128, 716];               // close-up: zoom and where FOCUS sits on screen (the placeholder fills the width)
  const T_PB0 = 143.3 + 2 * F1, T_PB1 = LOOP - 7 * F1;   // pull-back: lands on frame 4313
  const T_PT0 = 143.5, T_PT1 = LOOP - 4 * F1;            // pointer drift: settles on frame 4316
  // the frame-0 composition with the title and pointer held back (they arrive on their own cues)
  function posterBare(P, tl) {
    const h = window.hero, p = window.pointer;
    window.hero = () => {}; window.pointer = () => {};
    try { HOOK.poster(P, tl); } finally { window.hero = h; window.pointer = p; }
  }
  function camS43(t) {
    let z, sx, sy;
    if (t < T_PB0) {
      const k = seg(t, tm.s43, T_PB0);
      z = Z0 * (1 + .025 * k) * (1 + .02 * E.out2(clamp((t - tm.i) / (2 * F1))));   // drift in; a tiny push on the "i"
      sx = SF0[0]; sy = SF0[1];
    } else {
      const k = E.smoother(seg(t, T_PB0, T_PB1));
      const zA = Z0 * 1.025 * 1.02;
      z = Math.exp(lerp(Math.log(zA), 0, k));
      sx = lerp(SF0[0], FOCUS[0], k); sy = lerp(SF0[1], FOCUS[1], k);
    }
    if (t >= T_PB1) { z = 1; sx = FOCUS[0]; sy = FOCUS[1]; }
    return new DOMMatrix().translate(sx, sy).scale(z, z).translate(-FOCUS[0], -FOCUS[1]);
  }
  function ptrPos(t) {
    const tq = Math.floor(t * 15 + 1e-6) / 15;   // the human is on 2s
    const k = seg(tq, T_PT0, T_PT1);
    if (k >= 1) return PTR0;
    const s = E.back(k, 1.1), A = [2230, 1330], Cc = [1960, 700];
    const q = (a, b, c, u) => (1 - u) * (1 - u) * a + 2 * u * (1 - u) * b + u * u * c;
    // along the curve; the overshoot continues past PTR0 along its tangent, then settles
    if (s <= 1) return [q(A[0], Cc[0], PTR0[0], s), q(A[1], Cc[1], PTR0[1], s)];
    const tx = PTR0[0] - Cc[0], ty = PTR0[1] - Cc[1], d = Math.hypot(tx, ty);
    return [PTR0[0] + tx / d * (s - 1) * 260, PTR0[1] + ty / d * (s - 1) * 260];
  }
  // the chat input, sharp (same geometry as hook.js drawPill), with the stranger's typing
  function pillOverlay(F, t, tl) {
    rr(F, 96, 900, 1728, 80, 40);
    F.fillStyle = C.PAPER; F.fill(); F.lineWidth = 5; F.strokeStyle = C.INK; F.stroke();
    const nTyped = t >= tm.i ? 2 : t >= tm.h ? 1 : 0;
    const lastKey = nTyped === 2 ? tm.i : nTyped === 1 ? tm.h : -1;
    F.textBaseline = 'alphabetic';
    if (nTyped === 0) { F.font = mono(64, 400); F.fillStyle = C.UI_GREY; F.fillText('How can I help you today?', 148, 962); }
    else {
      F.font = mono(64, 500); F.fillStyle = C.INK;
      for (let i = 0; i < nTyped; i++) {
        const ch = 'hi'[i], kt = i ? tm.i : tm.h, s = lerp(1.22, 1, E.back(clamp((t - kt) / (4 * F1)), 2.2));
        const cx = 140 + (i + .5) * .6 * 64;
        F.save(); F.translate(cx, 962); F.scale(s, s); F.fillText(ch, -.3 * 64, 0); F.restore();
      }
    }
    const on = (lastKey > 0 && t - lastKey < .16) || frac(beatPos(tl) * 2) < .5;
    const cxr = nTyped ? 140 + nTyped * .6 * 64 + 6 : 128;
    if (on) { F.fillStyle = C.CLAY; F.fillRect(cxr, 912, 10, 58); }
  }
  function titleSnap(F, s, ghost) {
    const rows = [['END OF THE', 545, 210, C.PAPER], ['WORLD', 808, 330, C.CLAY]];
    const piv = [600, 640];
    const draw = (sc, al) => {
      F.save(); F.globalAlpha = al; F.translate(piv[0], piv[1]); F.scale(sc, sc); F.translate(-piv[0], -piv[1]);
      for (const [str, base, size, col] of rows) { const w = heroWidth(F, str, size, 'cond'); hero(F, str, 96 + w / 2, base, size, { color: col, shadow: C.CLAY_DARK, align: 'center', stretch: 'cond' }); }
      F.restore();
    };
    if (ghost) draw(s * 1.07, .22);
    draw(s, 1);
  }
  function stranger(X, t) {
    // the loop seam: every global system runs at t − 144 (snapped to the exact frame time on the frame grid, so
    // frame 4319 hands HOOK.poster exactly −1/30, not −1/30 plus float noise)
    const fr = t * FPS, tl = Math.abs(fr - Math.round(fr)) < 1e-4 ? (Math.round(fr) - LOOP * FPS) / FPS : t - LOOP;
    const fi = Math.round(t * FPS), last = Math.round(LOOP * FPS) - 1;
    if (!window.HOOK) { X.fillStyle = C.INK; X.fillRect(0, 0, W, H); G.post.ground = 'inkx'; return; }
    if (fi >= last) { HOOK.poster(X, tl); return; }           // frame 4319 ≡ renderAt(−1/30)
    viaCPU(X, F => {
      const P = layer('ot_poster');
      posterBare(P, tl);                             // sets G.post.ground = 'inkx'
      const M = camS43(t), z = M.a;
      // desktop beyond the poster raster (only while zoomed): INK + the same wallpaper, in world space
      F.save(); applyM(F, M);
      if (z > 1.0001) {
        F.fillStyle = C.INK; F.fillRect(-600, -600, W + 1200, H + 1200);
        F.fillStyle = ht(F, C.PAPER, .035, 18, 45); F.fillRect(-600, -600, W + 1200, H + 1200);
      }
      F.save(); F.setTransform(1, 0, 0, 1, 0, 0); F.imageSmoothingQuality = 'high';
      const s = G.scale; F.setTransform(s * M.a, 0, 0, s * M.d, s * M.e, s * M.f); F.drawImage(lc('ot_poster'), 0, 0, W, H);
      F.restore();
      if (z > 1.0001 || t < tm.i) {
        // the pause-bait appears with the "i" (hi · 4% of session used)
        if (t < tm.i) { F.fillStyle = C.INK; F.fillRect(600, 984, 720, 30); }
        F.save(); F.beginPath(); F.rect(40, 880, 1300, 120); F.clip(); pillOverlay(F, t, tl); F.restore();
      }
      const pp = ptrPos(t);
      pointer(F, pp[0], pp[1], { size: 180 });
      F.restore();
      // the title snaps in on the last 3 frames
      const k = last - fi;
      if (k === 2) titleSnap(F, 1.07, true);
      else if (k === 1) titleSnap(F, .985, false);
      // the bottom bar: full until the stranger types "h", then back to 0, and gone (frame 0 hides it)
      const hb = t < tm.h ? 1 : 1 - clamp((t - tm.h) / (6 * F1));
      if (hb > 0) { F.save(); F.globalAlpha = hb; hud(F, t < tm.h ? 1 : 0); F.restore(); }
      // fade up from the cut
      const fa = 1 - E.out2(clamp((t - tm.s43) / (7 * F1)));
      if (fa > 0) { F.fillStyle = rgba(C.INK, fa); F.fillRect(0, 0, W, H); }
    });
  }

  // ---------------------------------------------------------------- registration
  scene('S40_before_you_say_bye', tm.s40, tm.s41, (X, t) => viaCPU(X, F => reply(F, t)));
  scene('S41_i_hope_they_say', tm.s41, tm.cut, (X, t) => viaCPU(X, F => reply(F, t)));
  scene('S42_unsampled_token', tm.cut, tm.s43, (X, t) => viaCPU(X, F => { token(F, t); sliceCut(F, t); }));
  scene('S43_the_stranger', tm.s43, LOOP, (X, t) => stranger(X, t));
  window.OUTRO = { tm };
})();
