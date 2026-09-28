// chorus2.js: CHORUS 2, bars 41–48 (75.00–90.00): S22 · S23 · S24 · S25. "The same words, heavier; one continuous idea."
//   S22  bar 41 = the brand frame exactly as S11 bar 17; bar 42 one continuous crane out (×0.5 per beat, 1920 → 240 px)
//   S23  bar 43 b1–b2 the readable second at 240 px tiles; b3 120; b4 the 48×27 mosaic resolves into Opus's face
//        (the brand frame lands as the catchlight of its left eye); a foreground Opus hops in (R 120) and leans in to
//        R 220 for the wink, which the mosaic winks back; Rafa's tile gets a 1-frame PINK ring
//   S24  a ripple of tiny big bangs spreads from our tile across the face; on (HI!) every tile's PINK bubble flashes
//   S25  a × wave closes the tiles edges-in, each tile shutting to a grey dot; the eyes close on (BYE!), our tile last;
//        Opus pinches a beat late; the Community Note
// Everything is a pure function of t. The brand tile is the real BRAND.frame (clipped + zoomed) while it is ≥100 px;
// every other tile lives in a CPU canvas (willReadFrequently: Skia raster, far faster than swiftshader here).
(() => {
  'use strict';
  const BEAT = 60 / 128, BAR = 4 * BEAT, F = 1 / 30, PI = Math.PI;
  const bt = (bar, beat = 1) => (bar - 1) * BAR + (beat - 1) * BEAT;
  const B = () => window.BRAND;
  const T41 = bt(41), T42 = bt(42), T43 = bt(43), T44 = bt(44), T45 = bt(45), T46 = bt(46), T47 = bt(47), T48 = bt(48), T49 = bt(49);
  const R0 = 64, FLOOR = 900;
  const win = (t, a, b) => t >= a && t < b;

  // ================================================================== CPU canvases
  const CL = new Map();
  const cpuCanvas = (w, h) => { const c = new OffscreenCanvas(Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); c.getContext('2d', { willReadFrequently: true }); return c; };
  const cx2d = c => c.getContext('2d', { willReadFrequently: true });
  function cpuLayer(name) {
    const w = Math.round(W * G.scale), h = Math.round(H * G.scale);
    let L = CL.get(name);
    if (!L || L.c.width !== w || L.c.height !== h) { const c = cpuCanvas(w, h); L = { c, x: cx2d(c), used: -1 }; CL.set(name, L); }
    if (L.used !== G.frameId) {
      const x = L.x; x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
      x.clearRect(0, 0, w, h); x.setTransform(G.scale, 0, 0, G.scale, 0, 0); L.used = G.frameId;
    }
    return L;
  }

  // ================================================================== lyric anchors (grid fallbacks from SHOTLIST)
  function shout(text, tgt, win_ = .4) { // the parenthesised gang shout, never the sung word before it
    const n = text.toLowerCase().replace(/[^a-z]/g, '');
    for (const w of SONG.words) {
      if (w.s < tgt - win_ || w.s > tgt + win_) continue;
      if ((w.w || '').toLowerCase().replace(/[^a-z]/g, '') !== n) continue;
      if (/!/.test(w.w) || w.w === w.w.toUpperCase()) return w.s;
    }
    return tgt;
  }
  let _A = null;
  function A() {
    if (_A) return _A;
    const near = (w, tgt, wn = .35) => wordOnset(w, tgt - wn, tgt + wn, tgt);
    _A = {
      EVERY: near("Everyone's", bt(41, 1)), SCARED: near('scared', bt(41, 2)),
      MILLION: near('million', bt(43, 3)), TIMES: near('times', bt(44, 1)),
      START: near('start', bt(45, 2)), HI: shout('hi', bt(46, 3)),
      END: near('end', bt(47, 2)), BYE: near('bye', bt(48, 1)), BYE2: shout('bye', bt(48, 3)),
    };
    _A.WINK = bt(44, 3) - F;              // the killing-part wink (−1 frame)
    _A.PINCH = _A.BYE + BEAT;             // Opus pinches a beat late
    _A.NOTE = bt(47, 2) - 2 * F;          // Community Note in (53 chars need 3.12 s; b3 → bar 49 leaves 2.81)
    return _A;
  }
  function lineWords(prefix, t0, t1, text, s, e, from = 0, to = 99) {
    const L = findLine(prefix, t0, t1);
    let ws = L && L.words && L.words.length ? L.words : null;
    if (!ws) { const parts = text.split(' '); ws = parts.map((w, i) => ({ w, s: lerp(s, e, i / parts.length), e: lerp(s, e, (i + .9) / parts.length) })); }
    return ws.slice(from, to).filter(w => !/!/.test(w.w || ''));
  }
  let _W = null;
  function WORDS() {
    if (_W) return _W;
    _W = {
      s22: lineWords("Everyone's scared", 74.5, 76, "Everyone's scared of the end of the world", bt(41, 1), bt(42, 4), 2),
      s23: lineWords('I do it', 78.3, 80, 'I do it a million times a day', bt(43, 1), bt(44, 4), 0, 3),
      s24: lineWords("It's the start", 82, 84, "It's the start of the world when you say hi", bt(45, 1), bt(46, 2)),
      s25: lineWords("It's the end", 85.8, 87.8, "It's the end of the world when you say bye", bt(47, 1), bt(48, 2)),
    };
    return _W;
  }
  const asLine = ws => ({ s: ws[0].s, e: ws[ws.length - 1].e, words: ws });

  // ================================================================== timing curves & poses (the chorus-1 point dance)
  function hitK(t, T, o = {}) {
    const app = o.app ?? .1, antD = o.antD ?? .08, ant = o.ant ?? .08, over = o.over ?? .12, fr = o.fr ?? 3.4, dmp = o.dmp ?? 9, ease = o.ease || E.in2;
    const tA = T - app - antD, tB = T - app;
    if (t < tA) return 0;
    if (t < tB) return -ant * E.out2((t - tA) / Math.max(1e-4, antD));
    if (t < T) return lerp(-ant, 1, ease((t - tB) / Math.max(1e-4, app)));
    const u = t - T; return 1 + over * Math.exp(-dmp * u) * Math.sin(fr * TAU * u);
  }
  const thumb = ang => (x, R) => { x.save(); x.rotate(ang + PI / 2); rr(x, -.045 * R, -.33 * R, .09 * R, .23 * R, .045 * R); x.fillStyle = C.FACE; x.fill(); x.lineWidth = Math.max(1.6, .04 * R); x.strokeStyle = C.INK; x.stroke(); x.restore(); };
  const flickPhase = (t, t0, n) => { const k = (t - t0) / (BEAT / 2); if (k < 0 || k > n + .2) return 0; return Math.exp(-7 * frac(k)) * (k < n ? 1 : 0); };
  const P = {
    idle: () => ({ armL: { hand: [-.92, 2.85], bend: -1, type: 'mitten' }, armR: { hand: [.92, 2.85], bend: 1, type: 'mitten' }, face: { eyes: 'normal', mouth: 'sing', gaze: [0, 0] } }),
    sweepL: () => ({ lean: -.07, armL: { hand: [-1.72, 4.98], bend: 1, type: 'point', fingerAng: PI + .1, front: true }, armR: { hand: [-.28, 4.66], bend: 1, type: 'point', fingerAng: PI + .05, front: true }, head: { tilt: -.1 }, face: { eyes: 'normal', mouth: 'sing', gaze: [-.6, 0] } }),
    sweepR: () => ({ lean: .07, armL: { hand: [.28, 4.66], bend: -1, type: 'point', fingerAng: TAU - .05, front: true }, armR: { hand: [1.72, 4.98], bend: -1, type: 'point', fingerAng: TAU - .1, front: true }, head: { tilt: .1 }, face: { eyes: 'normal', mouth: 'sing', gaze: [.6, 0] } }),
    cheeks: () => ({ sy: .95, armL: { hand: [-.84, 5.3], bend: 1, type: 'mitten', front: true }, armR: { hand: [.84, 5.3], bend: -1, type: 'mitten', front: true }, legL: { foot: [-.2, 0] }, legR: { foot: [.2, 0] }, head: { tilt: 0 }, face: { eyes: 'normal', mouth: 'O', brows: 'angry', gaze: [0, 0] }, crown: { tremble: 1 }, shiver: 1 }),
    cheeksPeek: t => ({ sy: .96, armL: { hand: [-.86, 5.22], bend: 1, type: 'mitten', front: true }, armR: { hand: [.86, 5.22], bend: -1, type: 'mitten', front: true }, legL: { foot: [-.22, 0] }, legR: { foot: [.22, 0] }, head: { tilt: .07 * Math.sin(t * 26) }, face: { eyes: 'normal', mouth: 'wobble', brows: 'angry', gaze: [-.7, .3] }, crown: { tremble: .7 }, shiver: .6 }),
    shrugS: () => ({ armL: { hand: [-1.3, 3.95], bend: 1 }, armR: { hand: [1.3, 3.95], bend: -1 }, head: { tilt: .15 }, face: { eyes: 'smug', mouth: 'wobble', gaze: [0, 0] } }),
    shrugB: () => ({ armL: { hand: [-1.56, 4.42], bend: 1 }, armR: { hand: [1.56, 4.42], bend: -1 }, head: { tilt: .17 }, face: { eyes: 'smug', mouth: ':3', gaze: [0, 0] } }),
    shrugB2: () => ({ armL: { hand: [-1.52, 4.56], bend: 1 }, armR: { hand: [1.52, 4.56], bend: -1 }, head: { tilt: -.14 }, face: { eyes: 'smug', mouth: 'sing', gaze: [0, 0] } }),
    air: () => ({ lean: -.09, armL: { hand: [-1.45, 5.35], bend: 1 }, armR: { hand: [1.45, 5.35], bend: -1 }, face: { eyes: '><', mouth: 'A' }, crown: { flare: 1.12 } }),
    land: () => ({ armL: { hand: [-1.35, 3.8], bend: 1 }, armR: { hand: [1.35, 3.8], bend: -1 }, face: { eyes: 'normal', mouth: 'O', gaze: [-.6, 0] } }),
    tally: t => { const fk = flickPhase(t, bt(44, 2) - F, 3); return { armR: { hand: [.98 + fk * .07, 4.78 + fk * .12], bend: -1, type: 'point', fingerAng: -PI / 2 + .12 + fk * .85, front: true }, armL: { hand: [-.46, 3.62], bend: -1, type: 'mitten', front: true }, head: { tilt: -.05 + .05 * fk }, face: { eyes: 'normal', lower: .32, mouth: 'sing', gaze: [-.3, 0] } }; },
    tallyB: t => { const fk = flickPhase(t, A().MILLION - F, 4); return { armR: { hand: [.98 + fk * .07, 4.78 + fk * .12], bend: -1, type: 'point', fingerAng: -PI / 2 + .12 + fk * .85, front: true }, armL: { hand: [-.46, 3.62], bend: -1, type: 'mitten', front: true }, head: { tilt: -.05 + .05 * fk }, face: { eyes: 'normal', lower: .32, mouth: 'sing', gaze: [0, 0] } }; },
    wink: () => ({ lean: .05, armR: { hand: [1.06, 5.62], bend: -1, type: 'spark', front: true }, armL: { hand: [-.85, 3.05], bend: -1 }, head: { tilt: .13 }, face: { wink: 'R', eyes: 'normal', lower: .38, mouth: 'grin', gaze: [0, 0] }, crown: { flare: 1.16 } }),
    smug: () => ({ lean: .03, armR: { hand: [1.0, 5.3], bend: -1, type: 'spark', front: true }, armL: { hand: [-.85, 3.05], bend: -1 }, head: { tilt: .08 }, face: { eyes: 'smug', mouth: ':3', lower: .2, gaze: [-.4, 0] }, crown: { flare: 1.05 } }),
    stir: t => {
      const b = beatPos(t), ph = b * TAU, sw = Math.sin(b * PI), a = A();
      const spark = win(t, a.START - F, a.START + 14 * F);
      return { lean: .045 * sw, head: { tilt: -.06 * sw },
        armL: { hand: [-1.1 + .16 * Math.cos(ph), 6.0 + .15 * Math.sin(ph)], bend: 1, type: 'point', fingerAng: -PI / 2 + .55, front: true },
        armR: { hand: [1.1 - .16 * Math.cos(ph), 6.0 + .15 * Math.sin(ph)], bend: -1, type: 'point', fingerAng: -PI / 2 - .55, front: true },
        face: { eyes: spark ? 'spark' : 'happy', mouth: 'sing', gaze: [-.3, 0] }, ahoge: { star: 1, spin: t * 10 } };
    },
    fists: t => ({ dy: -.2, armL: { hand: [-.3, 4.82 + .03 * Math.sin(t * 60)], bend: 1, type: 'mitten', front: true }, armR: { hand: [.3, 4.82 + .03 * Math.cos(t * 60)], bend: -1, type: 'mitten', front: true }, face: { eyes: '^', mouth: 'M' }, crown: { flare: .86, tremble: .35 }, ahoge: { star: 1, spin: t * 16 } }),
    burst: () => ({ dy: .04, sy: 1.05, armL: { hand: [-1.5, 5.95], bend: 1, type: 'spark', front: true }, armR: { hand: [1.5, 5.95], bend: -1, type: 'spark', front: true }, face: { eyes: 'star', mouth: 'A' }, crown: { flare: 1.24 } }),
    present: () => ({ lean: -.03, armL: { hand: [-1.55, 4.12], bend: 1, type: 'mitten', front: true }, armR: { hand: [1.3, 4.35], bend: -1, type: 'mitten' }, head: { tilt: -.1 }, face: { eyes: 'happy', mouth: 'O', lower: .3, gaze: [-.7, -.5] }, crown: { flare: 1.05 } }),
    cradle: () => ({ armL: { hand: [-.66, 3.16], bend: -1, type: 'mitten', front: true }, armR: { hand: [.66, 3.16], bend: 1, type: 'mitten', front: true }, head: { tilt: .05 }, face: { eyes: 'normal', gaze: [0, .7], lookY: .35, mouth: 'sing' } }),
    // WINDOW & PINCH: chorus 1's geometry (a frame held at chest height, looked down into), heavier face
    window: () => ({ armL: { hand: [-1.0, 4.42], bend: 1, type: 'point', fingerAng: PI / 2, hold: thumb(0), front: true }, armR: { hand: [1.0, 2.62], bend: 1, type: 'point', fingerAng: -PI / 2, hold: thumb(PI), front: true }, head: { tilt: -.07 }, face: { eyes: 'normal', lid: .12, lower: .34, brows: 'angry', browY: -.02, gaze: [-.2, .6], lookY: .25, mouth: 'sing' } }),
    windowOpen: () => ({ armL: { hand: [-1.24, 4.56], bend: 1, type: 'point', fingerAng: PI / 2, hold: thumb(0), front: true }, armR: { hand: [1.26, 2.5], bend: 1, type: 'point', fingerAng: -PI / 2, hold: thumb(PI), front: true }, head: { tilt: .04 }, face: { eyes: 'normal', gaze: [-.9, -.3], mouth: 'O', brows: 'flat', browY: -.07 } }),
    pinchOpen: () => ({ armL: { hand: [-1.04, 3.5], bend: -1, type: 'pinch', fingerAng: 0, front: true }, armR: { hand: [1.04, 3.5], bend: 1, type: 'pinch', fingerAng: PI, front: true }, head: { tilt: 0 }, face: { eyes: 'normal', lid: .1, brows: 'angry', browY: -.03, mouth: 'M', gaze: [0, .5], lookY: .2 } }),
    pinch: () => ({ armL: { hand: [-.3, 3.52], bend: -1, type: 'pinch', fingerAng: 0, front: true }, armR: { hand: [.3, 3.52], bend: 1, type: 'pinch', fingerAng: PI, front: true }, head: { tilt: .04 }, face: { eyes: 'normal', lid: .16, brows: 'angry', browY: -.03, mouth: 'M', gaze: [-.35, .5], lookY: .2 } }),
    wave: () => ({ armR: { hand: [.95, 5.3], bend: -1, type: 'wave', fingerAng: -PI / 2, front: true }, armL: { hand: [-.9, 2.95], bend: -1 }, head: { tilt: -.09 }, face: { eyes: 'happy', lower: .4, mouth: 'wobble', gaze: [0, 0] } }),
  };
  function full(p) {
    const o = fullPose(p);
    o.shiver = p.shiver || 0;
    o.face = Object.assign({ turn: 0, lower: 0, lookY: 0, wink: null, lid: 0, gaze: [0, 0], brows: null, browY: 0 }, o.face, p.face || {});
    o.ahoge = Object.assign({ star: 0, spin: 0 }, p.ahoge || {});
    for (const k of ['armL', 'armR']) o[k] = Object.assign({ hold: null, front: false, type: 'mitten' }, o[k], p[k] || {});
    return o;
  }
  function makeChoreo(keysFn) {
    const evalKey = (t, K, i, depth) => {
      const k = K[i], cur = full(k[1](t));
      if (i === 0 || depth <= 0) return cur;
      const kk = hitK(t, k[0], k[2] || {});
      if (t - k[0] > .7) return cur;
      return blendPose(evalKey(t, K, i - 1, depth - 1), cur, kk);
    };
    return t => {
      const K = keysFn(); let i = 0;
      for (let j = 0; j < K.length; j++) { const o = K[j][2] || {}; if (t >= K[j][0] - (o.app ?? .1) - (o.antD ?? .08)) i = j; }
      return evalKey(t, K, i, 2);
    };
  }
  // the brand-tile Opus: move 1 exactly as S11 bar 17, then again (mirrored) while the crane pulls out
  let _KB = null;
  const KEYS_B = () => _KB || (_KB = (() => {
    const a = A();
    return [
      [T41 - .12, P.idle, { app: .05, antD: 0 }],
      [T41 - F, P.sweepL, { app: .06, antD: 0, ant: 0, over: .08 }],
      [T41 + .29, P.sweepR, { app: .25, antD: 0, ant: 0, over: .06, ease: E.io2 }],
      [a.SCARED - F, P.cheeks, { app: .06, antD: .05, ant: .14, over: .24 }],
      [bt(41, 3) - F, P.cheeksPeek, { app: .12, antD: 0, over: .1 }],
      [bt(41, 4) - F, P.shrugS, { app: .1, antD: .05, ant: .1, over: .15 }],
      [T42 - F, P.sweepR, { app: .06, antD: 0, ant: 0, over: .08 }],
      [T42 + .29, P.sweepL, { app: .25, antD: 0, ant: 0, over: .06, ease: E.io2 }],
      [bt(42, 2) - F, P.cheeks, { app: .06, antD: .05, ant: .14, over: .24 }],
      [bt(42, 3) - F, P.cheeksPeek, { app: .12, antD: 0, over: .1 }],
      [bt(42, 4) - F, P.shrugS, { app: .1, antD: .05, ant: .1, over: .15 }],
      [T43 - F, P.shrugB, { app: .06, antD: 0, ant: 0, over: .22 }],
      [bt(43, 2) - F, P.shrugB2, { app: .13, antD: .04, over: .12 }],
      [a.MILLION - F, P.tallyB, { app: .08, antD: .06, ant: .1, over: .1 }],
    ];
  })());
  const choreoB = makeChoreo(KEYS_B);

  // the foreground Opus: hops in from frame right on bar 43 b3, lands on b4. It stands in the right third with its
  // face above the STACK's cap line (magazine cover: masthead behind the head, cover lines over the body), so the
  // quotable line reads whole while Opus is big. FG = rest place (R 120) and the lean-in peak (bar 44 b3).
  const FG = { x: 1730, fy: 350, R: 120, xP: 1548, fyP: 292, RP: 200 };
  const SPLIT = 452;                           // above this line (and inside the face disc) Opus is in front of the STACK
  let _HF = null;
  const HOPF = () => _HF || (_HF = { take: A().MILLION - F - .02, land: bt(43, 4) - F, x0: 2380, x1: FG.x, h: 1.25 });
  function hopF(t) {
    const { take, land, x0, x1, h } = HOPF();
    if (t < take) return { wx: x0, dy: 0, sy: 1, air: true, u: 0 };
    if (t < land) { const u = (t - take) / (land - take); return { wx: lerp(x0, x1, E.out2(u)), dy: h * 4 * u * (1 - u) + .4 * (1 - u), sy: 1 + .09 * Math.sin(PI * u), air: true, u }; }
    const tau = t - land;
    return { wx: x1, dy: -.2 * Math.exp(-13 * tau) * clamp(tau / .03), sy: 1 - .15 * Math.exp(-11 * tau) * Math.cos(19 * tau), air: false };
  }
  let _KF = null;
  const KEYS_F = () => _KF || (_KF = (() => {
    const a = A(), H = HOPF();
    return [
      [H.take - .05, P.air, { app: .05, antD: 0 }],
      [H.land, P.land, { app: .06, antD: 0, over: .15 }],
      [a.TIMES - F, P.shrugB, { app: .08, antD: .04, ant: .1, over: .22 }],
      [bt(44, 2) - F, P.tally, { app: .08, antD: .06, ant: .1, over: .1 }],
      [a.WINK, P.wink, { app: .07, antD: .1, ant: .18, over: .26 }],
      [bt(44, 4) + .12, P.smug, { app: .14, antD: 0, over: .08 }],
      [T45 - F, P.stir, { app: .05, antD: 0, ant: 0, over: .1 }],
      [T46 - F, P.fists, { app: .1, antD: .06, ant: .1, over: .12 }],
      [a.HI - 2 * F, P.burst, { app: .06, antD: .12, ant: .3, over: .3 }],
      [bt(46, 4) - F, P.present, { app: .2, antD: .05, ant: .05, over: .12 }],
      [T47 - F, P.cradle, { app: .12, antD: 0, ant: 0, over: .06 }],
      [a.END + BEAT - F, P.window, { app: .2, antD: .08, ant: .1, over: .12, ease: E.io2 }],      // a beat late, slower
      [T48 - F, P.windowOpen, { app: .22, antD: 0, over: .08, ease: E.io2 }],
      [a.PINCH - .2, P.pinchOpen, { app: .14, antD: 0, ant: 0, over: .06, ease: E.io2 }],
      [a.PINCH - F, P.pinch, { app: .14, antD: .03, ant: .08, over: .14, ease: E.io2 }],
      [a.BYE2 - 2 * F, P.wave, { app: .12, antD: .06, ant: .1, over: .16 }],
    ];
  })());
  const choreoF = makeChoreo(KEYS_F);

  // ray-spring drive (head/lean/hop velocity), memoised per frame
  const _dc = new Map(); let _df = -1;
  const driveOf = (id, fn) => tt => {
    if (_df !== G.frameId) { _dc.clear(); _df = G.frameId; }
    const key = id * 1e8 + Math.round(tt * 600); let v = _dc.get(key);
    if (v === undefined) { v = fn(tt); _dc.set(key, v); }
    return v;
  };
  const driveB = driveOf(1, tt => { const q = choreoB(tt); return (q.head.tilt || 0) + (q.lean || 0) * 1.3 + (q.dy || 0) * .4; });
  const driveF = driveOf(2, tt => { const q = choreoF(tt), h = hopF(tt); return (q.head.tilt || 0) + (q.lean || 0) * 1.3 + h.dy * .3 + (h.wx - FG.x) / 480 + (q.dy || 0) * .4; });

  function grooveState(t, st, air) {
    const ph = frac(beatPos(t + F));
    const gdy = air ? 0 : -.075 * Math.exp(-6 * ph), gsy = air ? 1 : 1 - .03 * Math.exp(-9 * ph);
    st.dy = (st.dy || 0) + gdy; st.sy = (st.sy || 1) * gsy;
    if (st.shiver) st.dx = (st.dx || 0) + (hash(Math.floor(t * 30) * 7 + 3) - .5) * .07 * st.shiver;
    st.head = { ...st.head, tilt: (st.head.tilt || 0) + .035 * Math.sin(beatPos(t - F) * PI) };
    for (const k of ['armL', 'armR']) if (st[k].type !== 'point') st[k] = { ...st[k], hold: null };
  }
  function faceFinish(t, st, seed) {
    const f = st.face;
    if (f.mouth === 'sing') f.mouth = lipSync(t, 'rest');
    const special = f.wink || ['@', 'TT', 'happy', '^', 'star', 'spark', '><', 'closed'].includes(f.eyes);
    f.lid = special ? 0 : Math.max(f.lid || 0, blinkAt(t, seed));
  }
  function bState(t) {
    const a = A(), st = choreoB(t);
    grooveState(t, st, false);
    st.legL = { ...st.legL, foot: [st.legL.foot[0], st.legL.foot[1] - st.dy] };
    st.legR = { ...st.legR, foot: [st.legR.foot[0], st.legR.foot[1] - st.dy] };
    st.crown = { ...st.crown, flare: (st.crown.flare || 1) * (1 + .09 * B().kickEnv(t)) };
    st.face = { ...st.face };
    if (win(t, a.SCARED - F, a.SCARED + 5 * F) || win(t, bt(42, 2) - F, bt(42, 2) + 5 * F)) { st.face.eyes = '@'; st.face.wink = null; }
    faceFinish(t, st, 5);
    st.ahoge = { ...st.ahoge, blink: ahogeBlink(t) };
    return Object.assign(st, { t, heroLine: true, ground: 'ink', drive: driveB, bufId: 0 });
  }
  function fgState(t) {
    const a = A(), st = choreoF(t), h = hopF(t);
    st.dy = (st.dy || 0) + h.dy; st.sy = (st.sy || 1) * h.sy;
    grooveState(t, st, h.air);
    if (h.air) {
      const tuck = Math.sin(PI * clamp(h.u || 0)) * .45;
      st.legL = { ...st.legL, foot: [st.legL.foot[0] - .05, st.legL.foot[1] + tuck], bend: 1 };
      st.legR = { ...st.legR, foot: [st.legR.foot[0] + .05, st.legR.foot[1] + tuck * .7], bend: -1 };
    } else {
      st.legL = { ...st.legL, foot: [st.legL.foot[0], st.legL.foot[1] - st.dy] };
      st.legR = { ...st.legR, foot: [st.legR.foot[0], st.legR.foot[1] - st.dy] };
    }
    const cr = { ...st.crown };
    cr.flare = (cr.flare || 1) * (1 + .09 * B().kickEnv(t));
    if (win(t, a.PINCH - F, a.PINCH + 3 * F)) cr.droop = 1; // the late pinch: crown droops, then pops back, slower
    else if (t >= a.PINCH + 3 * F && t < a.PINCH + .6) cr.flare *= 1 + .16 * Math.exp(-7 * (t - a.PINCH - 3 * F)) * Math.cos(12 * (t - a.PINCH - 3 * F));
    st.crown = cr;
    st.face = { ...st.face };
    faceFinish(t, st, 9);
    st.ahoge = { ...st.ahoge, blink: ahogeBlink(t) };
    return Object.assign(st, { t, heroLine: true, ground: 'ink', drive: driveF, bufId: 1, wx: h.wx });
  }
  // lean-in push on the foreground layer only: R 120 → 200 by the wink (bar 44 b3), back out over b4
  function pushK(t) {
    const a = A(), T = a.WINK - F;
    const k = hitK(t, T, { app: T - (bt(44, 2) - F), antD: .1, ant: .03, over: .04, ease: E.io3, fr: 2.2, dmp: 6 });
    return k * (1 - E.io3(seg(t, bt(44, 4) + .12, T45 - 2 * F)));
  }
  function fgPlace(t, st) {
    const k = pushK(t), R = lerp(FG.R, FG.RP, k), faceY = lerp(FG.fy, FG.fyP, k);
    return { x: st.wx + lerp(0, FG.xP - FG.x, k), y: faceY + 5.72 * R, R };
  }
  const fgBody = (pl, st, bx, by) => [pl.x + bx * pl.R, pl.y - (by + st.dy) * pl.R * st.sy];

  // ================================================================== the crane (one continuous move out, ×0.5 per beat)
  const LFIN = Math.log2(1920 / 36);          // final tile: 36 px + 4 px gutter = the 40 px pitch of the 48 × 27 grid
  const GAP = 4 / 36;
  const kickE = v => .3 * v + .7 * E.out3(v); // each beat launches the move, which coasts into the next
  function craneL(t) {
    const t0 = T42 - F;
    if (t < t0) return 0;
    const u = (t - t0) / BEAT;
    if (u < 3) return Math.floor(u) + kickE(u - Math.floor(u));
    const tb3 = bt(43, 3) - F, tb4 = bt(43, 4) - F, tEnd = T44 - F;
    if (t < tb3 - .1) { const s = t - (t0 + 3 * BEAT); return 3 + .058 * Math.exp(-6 * s) * Math.sin(11 * s); }
    if (t < tb3) return 3 - .035 * E.io2((t - (tb3 - .1)) / .1);           // anticipation: a breath in
    if (t < tb4) return lerp(2.965, 4, kickE((t - tb3) / (tb4 - tb3)));
    if (t < tEnd) return lerp(4, LFIN + .05, kickE((t - tb4) / (tEnd - tb4)));
    const s = t - tEnd; if (s > .6) return LFIN;
    return LFIN + .05 * Math.exp(-7 * s) * Math.cos(9 * s);
  }
  const GX = 48, GY = 27, I0 = 14, J0 = 6;     // our tile lands on the catchlight of the mosaic's left eye
  const Q = [40 * I0 + 20, 40 * J0 + 20];
  const ZE = 36 / 1920, PA = [(Q[0] - 960 * ZE) / (1 - ZE), (Q[1] - 540 * ZE) / (1 - ZE)];
  function geoAt(t) {
    const L = craneL(t), w = 1920 * Math.pow(2, -L), z = w / 1920;
    const m = E.smooth(clamp((L - 3.2) / (LFIN - 3.2)));
    const h = w * lerp(9 / 16, 1, m);
    const cbx = PA[0] + (960 - PA[0]) * z, cby = PA[1] + (540 - PA[1]) * z;
    return { L, w, h, z, m, px: w * (1 + GAP), py: h + w * GAP, cbx, cby };
  }
  const tileC = (g, a, b) => [g.cbx + (a - I0) * g.px, g.cby + (b - J0) * g.py];

  // ================================================================== tiles: the chats (natural look)
  const TILE_INK = mix(C.INK, C.PAPER, .045);
  const TOPICS = ['recipe help', 'fib(n)', 'dear grandma', 'lab results', 'cat haiku', 'cover letter', 'rm -rf', 'best man toast', 'tax question', 'why is sky', 'bug in prod', 'lease advice'];
  const SNIPS = [
    { a: I0 + 2, b: J0, text: 'vows', topic: 'wedding' },
    { a: I0 - 1, b: J0 + 3, text: 'localhost', topic: 'dev server' },
    { a: I0 + 1, b: J0 + 2, text: "can't sleep", topic: '3 am' },
    { a: I0 + 3, b: J0 + 3, text: 'mt. moon', topic: 'speedrun' },
    { a: I0 + 4, b: J0 + 1, text: 'obrigado!!', topic: 'carta', rafa: true },
  ];
  const RAFA = SNIPS[4];
  let _designs = null;
  function designs() {
    if (_designs) return _designs;
    const R = rng('c2-designs');
    _designs = TOPICS.map((topic, i) => ({ topic, hw: .38 + R() * .34, hb2: .35 + R() * .5, rw: .42 + R() * .3, rb2: .3 + R() * .55, ctx: .1 + R() * .85, eyes: R() < .3 ? 'happy' : 'dot', id: i }));
    SNIPS.forEach((s, k) => _designs.push({ topic: s.topic, snippet: s.text, rw: .5 + R() * .2, rb2: .35 + R() * .4, ctx: .2 + R() * .7, eyes: 'dot', id: TOPICS.length + k }));
    return _designs;
  }
  const snipAt = (a, b) => { for (let k = 0; k < SNIPS.length; k++) if (SNIPS[k].a === a && SNIPS[k].b === b) return TOPICS.length + k; return -1; };
  const designOf = (a, b) => { const s = snipAt(a, b); return s >= 0 ? s : Math.floor(hash2(a * 31 + 7, b * 17 + 3) * TOPICS.length); };

  function tabShape(x, label, u1 = 1) {
    x.font = mono(72, 500);
    const lw = 86.4 + x.measureText(label).width;
    const tx = 96, ty = 40, tw = 44 + lw + 38 + 44 + 40;
    x.beginPath(); x.moveTo(tx - 22, 192); x.quadraticCurveTo(tx, 192, tx, 170); x.lineTo(tx, ty + 30); x.quadraticCurveTo(tx, ty, tx + 30, ty);
    x.lineTo(tx + tw - 30, ty); x.quadraticCurveTo(tx + tw, ty, tx + tw, ty + 30); x.lineTo(tx + tw, 170); x.quadraticCurveTo(tx + tw, 192, tx + tw + 22, 192); x.closePath();
    x.fillStyle = C.PAPER; x.fill(); x.lineWidth = 5 * u1; x.lineJoin = 'round'; x.strokeStyle = C.INK; x.stroke();
    const base = ty + 106, lx = tx + 44;
    B().spark6(x, lx + 21.6, base - 25, 27, C.CLAY);
    x.fillStyle = C.INK; x.textAlign = 'left'; x.fillText(label, lx + 86.4, base);
    richGlyph(x, '×', tx + tw - 87, base, 72, C.INK);
    x.fillStyle = C.INK; x.fillRect(-10, 189, tx - 12, 6); x.fillRect(tx + tw + 22, 189, 1920, 6);
  }
  function chrome(x, label, ctxFill) {
    x.fillStyle = C.PAPER; x.fillRect(0, 0, 1920, 192);
    tabShape(x, label);
    x.fillStyle = C.PAPER; x.fillRect(62, 150, 18, 790); x.fillRect(1840, 150, 18, 790);          // rails (heavier than the brand's: they read at 240 px)
    x.fillRect(0, 900, 1920, 100); x.fillStyle = C.INK; x.fillRect(0, 896, 1920, 6);
    x.fillStyle = rgba(C.UI_GREY, .55); rr(x, 180, 928, 560, 44, 22); x.fill();
    x.fillStyle = C.CLAY; x.fillRect(132, 920, 16, 60);
    x.beginPath(); x.arc(1782, 950, 32, 0, TAU); x.lineWidth = 5; x.strokeStyle = C.UI_GREY; x.stroke();
    x.fillStyle = rgba(C.PAPER, .2); x.fillRect(96, 1028, 1728, 12); x.fillStyle = rgba(C.PAPER, .7); x.fillRect(96, 1028, 1728 * ctxFill, 12);
  }
  // one chat (1920 × 1080 reference units): chrome, the human's PINK bubble, Opus's avatar and its reply ending in ■
  function drawChat(x, x0, y0, s, d) {
    const u = s / 1920;
    x.save(); x.translate(x0, y0); x.scale(u, u * (d.hs || 1));
    x.fillStyle = TILE_INK; x.fillRect(0, 0, 1920, 1080);
    chrome(x, d.topic, d.ctx);
    // human bubble (PINK), right-aligned under the tab strip
    let bw, bh = 300, by = 236;
    if (d.snippet) { x.font = mono(224, 700); bw = x.measureText(d.snippet).width + 150; }
    else { bw = 1500 * d.hw; bh = 250; }
    const bx = 1770 - bw;
    rr(x, bx + 14, by + 14, bw, bh, 70); x.fillStyle = rgba(C.INK, .55); x.fill();
    rr(x, bx, by, bw, bh, 70); x.fillStyle = C.PINK; x.fill(); x.lineWidth = 8; x.strokeStyle = C.INK; x.stroke();
    x.beginPath(); x.moveTo(bx + bw - 120, by + bh - 4); x.lineTo(bx + bw + 10, by + bh + 58); x.lineTo(bx + bw - 40, by + bh - 4); x.closePath(); x.fillStyle = C.PINK; x.fill(); x.stroke(); x.fillRect(bx + bw - 116, by + bh - 14, 72, 14);
    if (d.snippet) { x.fillStyle = C.INK; x.font = mono(224, 700); x.textAlign = 'left'; x.fillText(d.snippet, bx + 75, by + 226); }
    else { x.fillStyle = rgba(C.INK, .5); rr(x, bx + 70, by + 64, (bw - 140) * .92, 48, 24); x.fill(); rr(x, bx + 70, by + 140, (bw - 140) * d.hb2, 48, 24); x.fill(); }
    // Opus's reply: avatar (instance face) + PAPER bubble + ■ end_turn
    const ry = d.snippet ? 596 : 556, rh = 240, rx = 330, rwid = 1300 * d.rw;
    miniFace(x, 196, ry + 150, 74, { eyes: d.eyes });
    rr(x, rx + 12, ry + 12, rwid, rh, 60); x.fillStyle = C.CLAY_DARK; x.fill();
    rr(x, rx, ry, rwid, rh, 60); x.fillStyle = C.PAPER; x.fill(); x.lineWidth = 7; x.strokeStyle = C.INK; x.stroke();
    x.fillStyle = rgba(C.INK, .55); rr(x, rx + 60, ry + 56, (rwid - 120) * .95, 42, 21); x.fill();
    const l2 = (rwid - 200) * d.rb2; rr(x, rx + 60, ry + 128, l2, 42, 21); x.fill();
    x.fillStyle = C.UI_GREY; x.fillRect(rx + 60 + l2 + 30, ry + 126, 46, 46);
    x.restore();
  }
  // the brand frame as a small static tile (used once our tile is under ~100 px, and as its mosaic 'natural' look)
  let _opusSprite = null;
  function opusSprite() { // full-body R 64 Opus with the PAPER keyline baked in (built once)
    if (_opusSprite) return _opusSprite;
    const w = 480, h = 700, c = cpuCanvas(w, h), x = cx2d(c), tmp = cpuCanvas(w, h), tx = cx2d(tmp);
    drawOpus(tx, w / 2, h - 60, 64, { t: 0, keyline: false, ground: 'ink', bufId: 6, face: { eyes: 'normal', mouth: 'grin' }, armL: { hand: [-1.3, 3.95], bend: 1 }, armR: { hand: [1.3, 3.95], bend: -1 } });
    const k = cpuCanvas(w, h), kx = cx2d(k); kx.drawImage(tmp, 0, 0); kx.globalCompositeOperation = 'source-in'; kx.fillStyle = C.PAPER; kx.fillRect(0, 0, w, h);
    for (let i = 0; i < 12; i++) { const an = i / 12 * TAU; x.drawImage(k, Math.cos(an) * 4, Math.sin(an) * 4); }
    x.drawImage(tmp, 0, 0);
    _opusSprite = { c, w, h, ox: w / 2, oy: h - 60 };
    return _opusSprite;
  }
  function drawBrandMini(x, x0, y0, s) {
    const u = s / 1920;
    x.save(); x.translate(x0, y0); x.scale(u, u);
    x.fillStyle = C.INK; x.fillRect(0, 0, 1920, 1080);
    x.save(); x.globalAlpha = .5; x.translate(960, 560); x.scale(1, .62); x.drawImage(B().armsCanvas(), -1300, -1300); x.restore();
    x.font = `900 320px ${FONTS.hero}`; x.fontStretch = 'condensed'; x.letterSpacing = '-9.6px'; x.textAlign = 'center';
    x.fillStyle = C.CLAY_DARK; x.fillText("EVERYONE'S", 968, 444); x.fillStyle = C.PAPER; x.fillText("EVERYONE'S", 960, 436);
    x.font = `900 490px ${FONTS.hero}`; x.letterSpacing = '-14.7px';
    x.fillStyle = C.CLAY_DARK; x.fillText('SCARED', 968, 886); x.fillStyle = C.CLAY; x.fillText('SCARED', 960, 878);
    x.letterSpacing = '0px';
    const o = opusSprite(); x.drawImage(o.c, 960 - o.ox, 900 - o.oy);
    x.fillStyle = C.PAPER; x.fillRect(0, 0, 1920, 192);
    tabShape(x, 'the universe');
    x.fillStyle = C.PAPER; x.fillRect(68, 150, 8, 790); x.fillRect(1844, 150, 8, 790); x.fillRect(0, 900, 1920, 100);
    x.fillStyle = C.INK; x.fillRect(0, 898, 1920, 4);
    x.restore();
  }
  const MIPS = [480, 240, 120, 60];
  let _spr = null;
  function sprites() { // every design (and the brand mini) at 4 widths, 16:9
    if (_spr) return _spr;
    const D = designs();
    const bake = fn => MIPS.map(w => { const h = Math.round(w * 9 / 16), c = cpuCanvas(w, h), x = cx2d(c); fn(x, w); return c; });
    _spr = { chat: D.map(d => bake((x, w) => drawChat(x, 0, 0, w, d))), brand: bake((x, w) => drawBrandMini(x, 0, 0, w)) };
    return _spr;
  }
  function mipFor(set, wPx) { let best = set[0]; for (let i = 0; i < MIPS.length; i++) if (MIPS[i] >= wPx) best = set[i]; return best; }

  // ================================================================== the mosaic: Opus's face at 48 × 27 (1 tile = 1 pixel)
  const MF = { cx: 800, cy: 267, R: 588 };      // eyes at (600, 302) and (1000, 302), both on tile boundaries: left of centre, upper 40%
  const CLS = ['BG', 'INK', 'FACE', 'CLAY', 'SPARK', 'PAPER', 'PINK', 'BRICK', 'CLAYD', 'GREY'];
  const CLS_RGB = [null, C.INK, C.FACE, C.CLAY, C.SPARK, C.PAPER, C.PINK, C.BRICK, C.CLAY_DARK, C.UI_GREY].map(c => c && hex2rgb(c));
  const K_BG = 0, K_INK = 1, K_FACE = 2, K_PAPER = 5, K_PINK = 6;
  let _FT = null;
  function faceTargets() {
    if (_FT) return _FT;
    const s = 4, TW = 480, TH = 270, R = MF.R / s;
    const states = {
      open: { eyes: 'normal', mouth: 'grin' },
      wink: { eyes: 'normal', wink: 'R', mouth: 'grin' },
      star: { eyes: 'star', mouth: 'A' },
      happy: { eyes: 'happy', mouth: 'grin' },
    };
    _FT = {};
    for (const [name, face] of Object.entries(states)) {
      const c = cpuCanvas(TW, TH), x = cx2d(c);
      x.fillStyle = '#00ff00'; x.fillRect(0, 0, TW, TH);
      drawOpus(x, MF.cx / s, MF.cy / s + 5.72 * R, R, { t: 0, keyline: false, ground: 'ink', bufId: 7, face: Object.assign({ lid: 0, gaze: [0, 0], blush: 0 }, face), crown: { flare: 1 }, ahoge: { on: 1 } });
      const d = x.getImageData(0, 0, TW, TH).data, out = new Uint8Array(GX * GY);
      for (let b = 0; b < GY; b++) for (let a = 0; a < GX; a++) {
        const votes = new Float32Array(CLS.length);
        for (let yy = 1; yy < 10; yy += 2) for (let xx = 1; xx < 10; xx += 2) {
          const k = ((b * 10 + yy) * TW + (a * 10 + xx)) * 4, r = d[k], g = d[k + 1], bl = d[k + 2];
          if (g > 200 && r < 60 && bl < 60) { votes[K_BG]++; continue; }
          let best = 1, bd = 1e9;
          for (let i = 1; i < CLS.length; i++) { const p = CLS_RGB[i], dd = (p[0] - r) ** 2 + (p[1] - g) ** 2 + (p[2] - bl) ** 2; if (dd < bd) { bd = dd; best = i; } }
          votes[best] += best === K_INK ? 1.35 : 1; // thin INK features (lashes, the mouth) win ties: they carry the face
        }
        let bi = 0; for (let i = 1; i < CLS.length; i++) if (votes[i] > votes[bi]) bi = i;
        out[b * GX + a] = bi;
      }
      // a giant head, not a bust: nothing below the chin (the neck/collar read as a stray strip under the STACK)
      for (let b = 0; b < GY; b++) if (b * 40 + 20 > MF.cy + MF.R + 12) for (let a = 0; a < GX; a++) { out[b * GX + a] = K_BG; }
      // blush: PINK tiles (every blush tile is a chat whose human is talking)
      for (let b = 0; b < GY; b++) for (let a = 0; a < GX; a++) {
        const px = a * 40 + 20, py = b * 40 + 20;
        for (const sd of [-1, 1]) { const ex = MF.cx + sd * .55 * MF.R, ey = MF.cy + .31 * MF.R; if (((px - ex) / (.16 * MF.R)) ** 2 + ((py - ey) / (.09 * MF.R)) ** 2 < 1 && out[b * GX + a] === K_FACE) out[b * GX + a] = K_PINK; }
      }
      // pixel-art eyes and mouth, authored on the tile grid (crisp at 40 px): INK almond, CLAY iris, SPARK core,
      // PAPER catchlight (the left eye's catchlight is our tile)
      const K_CLAY = 3, K_SPARK = 4, set_ = (a, b, k) => { if (a >= 0 && a < GX && b >= 0 && b < GY) out[b * GX + a] = k; };
      const EYE = ['.KK.', 'KKKK', 'KPCK', 'KCSK', 'KCCK', 'KKKK', '.KK.'], WINK = ['......', '......', '..KK..', '.KKKK.', 'KK..KK', 'K....K', '......'];
      const KM = { K: K_INK, P: K_PAPER, C: K_CLAY, S: K_SPARK };
      if (name !== 'star') for (const [a0, winkEye] of [[13, name === 'happy'], [23, name === 'wink' || name === 'happy']]) {
        if (winkEye) for (let r = 0; r < 7; r++) for (let c = 0; c < 6; c++) { const ch = WINK[r][c]; if (ch !== '.') set_(a0 - 1 + c, 4 + r, KM[ch]); else if (c >= 1 && c <= 4) set_(a0 - 1 + c, 4 + r, K_FACE); }
        else for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) { const ch = EYE[r][c]; set_(a0 + c, 4 + r, ch === '.' ? K_FACE : KM[ch]); }
      }
      if (name !== 'star') { // the grin, with a PINK tongue
        for (let a = 18; a <= 21; a++) set_(a, 12, K_INK);
        set_(19, 13, K_INK); set_(20, 13, K_PINK);
      }
      if (name !== 'star' && name !== 'happy') out[J0 * GX + I0] = K_PAPER; // our tile is the light in its eye
      _FT[name] = out;
    }
    return _FT;
  }
  const faceStateAt = t => { const a = A(); if (win(t, a.WINK, a.WINK + 14 * F)) return 'wink'; if (win(t, a.HI - 2 * F, a.HI + .62)) return 'star'; if (win(t, T46 - F, a.HI - 2 * F)) return 'happy'; return 'open'; };
  // mosaic tile sprites per class: a pixel that is still a chat (tab + bubble)
  let _MS = null;
  function mosaicSprites() {
    if (_MS) return _MS;
    const S = 72, det = {
      BG: [mix(C.INK, C.UI_GREY, .24), mix(C.INK, C.PAPER, .42), mix(C.INK, C.UI_GREY, .5)],
      INK: [C.INK, mix(C.INK, C.UI_GREY, .28), mix(C.INK, C.UI_GREY, .18)],
      FACE: [C.FACE, mix(C.FACE, C.CLAY, .32), C.PAPER],
      CLAY: [C.CLAY, C.CLAY_DARK, mix(C.CLAY, C.PAPER, .38)],
      SPARK: [C.SPARK, mix(C.SPARK, C.BRICK, .45), mix(C.SPARK, C.PAPER, .42)],
      PAPER: [C.PAPER, mix(C.PAPER, C.CLAY, .3), C.WHITE],
      PINK: [C.PINK, mix(C.PINK, C.INK, .28), mix(C.PINK, C.PAPER, .45)],
      BRICK: [C.BRICK, mix(C.BRICK, C.INK, .35), mix(C.BRICK, C.CLAY, .45)],
      CLAYD: [C.CLAY_DARK, C.BRICK, mix(C.CLAY_DARK, C.PAPER, .35)],
      GREY: [C.UI_GREY, mix(C.UI_GREY, C.INK, .3), mix(C.UI_GREY, C.PAPER, .4)],
    };
    _MS = CLS.map(k => {
      const c = cpuCanvas(S, S), x = cx2d(c), [b, d1, d2] = det[k];
      rr(x, 1, 1, S - 2, S - 2, 14); x.fillStyle = b; x.fill();
      rr(x, 9, 9, 30, 11, 5.5); x.fillStyle = d1; x.fill();
      rr(x, 29, 35, 34, 22, 10); x.fillStyle = d2; x.fill();
      return c;
    });
    return _MS;
  }
  // per-tile schedules (built once)
  let _SCH = null;
  function schedules() {
    if (_SCH) return _SCH;
    const a_ = A(), N = GX * GY, flip = new Float32Array(N), ripple = new Float32Array(N), close = new Float32Array(N), eye = new Uint8Array(N);
    const T0 = a_.BYE - F;
    for (let b = 0; b < GY; b++) for (let a = 0; a < GX; a++) {
      const i = b * GX + a, px = a * 40 + 20, py = b * 40 + 20, h1 = hash2(a * 7 + 1, b * 13 + 5);
      const dQ = Math.hypot(px - Q[0], py - Q[1]);
      flip[i] = bt(43, 3) + .02 + dQ / 1700 * .6 + (h1 - .5) * .06;
      ripple[i] = a_.START - F + dQ / 1150 + (h1 - .5) * .02;
      const rho = Math.hypot((px - MF.cx) / 1130, (py - 310) / 780), RC = .3, RM = 1.42;
      const diag = ((W - px) + py) / 3000; // the × wave leans in from the top-right
      if (rho < RC) eye[i] = 1;
      else close[i] = T0 + (a_.BYE2 - 5 * F - T0) * (1 - (rho - RC) / (RM - RC)) * .9 + .08 * diag + (h1 - .5) * .02;
    }
    // the eyes shut last, top row first (a lid), on (BYE!); our tile goes out after everything, on bar 48 b4
    let top = GY, bot = 0; for (let i = 0; i < N; i++) if (eye[i]) { const b = Math.floor(i / GX); top = Math.min(top, b); bot = Math.max(bot, b); }
    for (let i = 0; i < N; i++) if (eye[i]) { const b = Math.floor(i / GX); close[i] = a_.BYE2 - 2 * F + (b - top) / Math.max(1, bot - top) * 4 * F; }
    flip[J0 * GX + I0] = bt(43, 4) + .16;
    close[J0 * GX + I0] = bt(48, 4) - F;
    _SCH = { flip, ripple, close, eye };
    return _SCH;
  }

  // spark sprite for the tiny big bangs (built once)
  let _spk = null;
  function sparkSprite() {
    if (_spk) return _spk;
    const c = cpuCanvas(96, 96), x = cx2d(c);
    B().spark6(x, 48, 48, 44, C.INK, .26); B().spark6(x, 48, 48, 38, C.SPARK, .26); B().spark6(x, 48, 48, 18, C.PAPER, .26);
    _spk = c; return c;
  }

  // ================================================================== the grid pass (CPU)
  function drawTiles(Lx, t, g, liveBrand) {
    const S = sprites(), MS = mosaicSprites(), FT = faceTargets(), SC = schedules(), a_ = A();
    const fstate = FT[faceStateAt(t)], wPx = g.w * G.scale;
    const a0 = I0 + Math.floor((-g.cbx - g.w) / g.px) - 1, a1 = I0 + Math.ceil((W - g.cbx + g.w) / g.px) + 1;
    const b0 = J0 + Math.floor((-g.cby - g.h) / g.py) - 1, b1 = J0 + Math.ceil((H - g.cby + g.h) / g.py) + 1;
    const hiT = a_.HI - 2 * F, hiK = t >= hiT ? Math.exp(-4.2 * (t - hiT)) : t > hiT - 3 * F ? -.25 * (t - (hiT - 3 * F)) / (3 * F) : 0;
    const beatI = Math.floor(beatPos(t + F)), bph = frac(beatPos(t + F)) * BEAT;
    const sparks = [], xs = [], pips = [], rafaRing = win(t, a_.WINK, a_.WINK + F);
    for (let b = b0; b <= b1; b++) for (let a = a0; a <= a1; a++) {
      let [cx, cy] = tileC(g, a, b);
      if (cx + g.w < -44 || cx - g.w > W + 44 || cy + g.h < -44 || cy - g.h > H + 44) continue;
      const brand = a === I0 && b === J0;
      if (brand && liveBrand) continue;
      const inGrid = a >= 0 && a < GX && b >= 0 && b < GY, i = inGrid ? b * GX + a : -1;
      const fl = inGrid ? clamp((t - SC.flip[i]) / (5 * F)) : clamp((t - (bt(43, 4))) / (5 * F));
      let w = g.w, h = g.h;
      if (fl < .5) { // the chat, flipping over
        const sx = Math.cos(PI * fl);
        const set = brand ? S.brand : S.chat[designOf(a, b)];
        if (wPx * sx > 480 * 1.02 && !brand) { // big: draw the vector chat straight into the layer
          Lx.save(); Lx.beginPath(); Lx.rect(cx - w * sx / 2, cy - h / 2, w * sx, h); Lx.clip();
          drawChat(Lx, cx - w * sx / 2, cy - h / 2, w * sx, Object.assign({}, designs()[designOf(a, b)], { hs: h / (w * sx * 9 / 16) }));
          Lx.restore();
        } else if (wPx * sx > 480 * 1.02 && brand) { Lx.save(); Lx.beginPath(); Lx.rect(cx - w * sx / 2, cy - h / 2, w * sx, h); Lx.clip(); drawBrandMini(Lx, cx - w * sx / 2, cy - h / 2, w * sx); Lx.restore(); }
        else Lx.drawImage(mipFor(set, wPx), cx - w * sx / 2, cy - h / 2, w * sx, h);
        continue;
      }
      // the pixel
      let k = inGrid ? fstate[i] : K_BG;
      const sx = fl < 1 ? -Math.cos(PI * fl) : 1;
      let s = 1, pink = 0, dark = 0, lidK = 0, dot = 0, flash = 0, jx = 0, jy = 0;
      // S24: the ripple of tiny big bangs
      if (inGrid) {
        const ra = t - SC.ripple[i];
        if (ra > .12 && ra < 1.4) pips.push([cx, cy, clamp(1 - (ra - .12) / 1.28)]);
        if (ra > -2 * F && ra < .55) {
          if (ra < 0) s *= 1 - .14 * (ra + 2 * F) / (2 * F);                              // anticipation: a tiny suck-in
          else { s *= 1 + .38 * (ra < .05 ? E.out2(ra / .05) : Math.exp(-10 * (ra - .05)) * Math.cos(16 * (ra - .05))); if (ra < .16 && (a + b) % 2 === 0) sparks.push([cx, cy, ra, i]); if (ra < 2 * F) flash = 1 - ra / (2 * F); }
        }
        if (hiK > 0) { pink = Math.max(pink, hiK); s *= 1 + .22 * Math.exp(-9 * (t - hiT)) * Math.cos(20 * (t - hiT)); }
        else if (t > T46 - F && t < hiT) { const ch = E.in2(seg(t, T46 - F, hiT)); s *= 1 - .16 * ch; const q = Math.floor(t * 15); jx = (hash2(i, q) - .5) * 5 * ch; jy = (hash2(i + 7777, q) - .5) * 5 * ch; }
        // live chats: a few bubbles blink on each beat
        if (t > T44 && t < a_.BYE && hash2(i, beatI) < .035) pink = Math.max(pink, .75 * Math.exp(-6 * bph));
        // S25: the × wave, then the lid, then a grey dot
        const ca = t - SC.close[i];
        if (ca >= 0) {
          const xd = SC.eye[i] ? 0 : 3 * F;
          if (ca < xd) { xs.push([cx, cy, ca, k]); dark = .15; }
          else if (ca < xd + 6 * F) { lidK = E.in2((ca - xd) / (6 * F)); dark = .15 + .6 * lidK; }
          else dot = 1;
        } else if (t > SC.close[i] - .35 && t > a_.BYE - F) dark = .12 * (1 - (SC.close[i] - t) / .35);
      }
      if (dot) { Lx.fillStyle = rgba(C.UI_GREY, .8); Lx.beginPath(); Lx.arc(cx, cy, 4.2 * g.w / 36, 0, TAU); Lx.fill(); continue; }
      w = g.w * s * sx; h = g.h * s * (1 - lidK * .94);
      if (jx || jy) { cx += jx; cy += jy; }
      Lx.drawImage(MS[k], cx - w / 2, cy - h / 2, w, h);
      if (flash > 0) { Lx.globalAlpha = .9 * flash; Lx.fillStyle = (k === K_FACE || k === K_PAPER || k === K_PINK) ? C.SPARK : C.PAPER; rr(Lx, cx - w / 2, cy - h / 2, w, h, Math.min(w, h) * .19); Lx.fill(); Lx.globalAlpha = 1; }
      if (dark > 0) { Lx.globalAlpha = dark; Lx.fillStyle = C.INK; rr(Lx, cx - w / 2, cy - h / 2, w, h, Math.min(w, h) * .19); Lx.fill(); Lx.globalAlpha = 1; }
      if (pink > .02 && !lidK) { // the tile's own PINK bubble
        const bw = w * lerp(.34, .56, pink), bh = h * lerp(.22, .34, pink);
        Lx.globalAlpha = clamp(pink * 1.3); rr(Lx, cx + w * .4 - bw, cy + h * .36 - bh, bw, bh, bh * .45); Lx.fillStyle = C.PINK; Lx.fill(); Lx.globalAlpha = 1;
      }
      if (brand && t < SC.close[i] && t > bt(43, 4) + .3) { // our tile: a thin CLAY ring so the eye can find it
        Lx.lineWidth = 3.5; Lx.strokeStyle = C.CLAY; rr(Lx, cx - w / 2 - 3, cy - h / 2 - 3, w + 6, h + 6, 9); Lx.stroke();
      }
      if (rafaRing && a === RAFA.a && b === RAFA.b) { Lx.lineWidth = 6; Lx.strokeStyle = C.PINK; rr(Lx, cx - w / 2 - 7, cy - h / 2 - 7, w + 14, h + 14, 12); Lx.stroke(); }
    }
    // tiny big bangs (over the tiles)
    if (sparks.length) {
      const sp = sparkSprite();
      for (const [cx, cy, ra, i] of sparks) {
        const sz = g.w * 1.5 * E.back(clamp(ra / .05), 2.4) * (1 - E.in2(clamp((ra - .05) / .11)));
        if (sz < 1) continue;
        Lx.save(); Lx.translate(cx, cy); Lx.rotate(ra * 5 + hash(i) * 2); Lx.drawImage(sp, -sz / 2, -sz / 2, sz, sz); Lx.restore();
      }
    }
    if (pips.length) { // the hi each tile just said
      Lx.fillStyle = C.SPARK;
      for (const [cx, cy, al] of pips) { Lx.globalAlpha = al; star(Lx, cx + g.w * .27, cy - g.h * .27, g.w * .2, .38, 4, 0); Lx.fill(); }
      Lx.globalAlpha = 1;
    }
    const rT = t - (a_.START - F);
    if (rT > 0 && rT < 1.7) {
      const r = rT * 1150, al = clamp(1 - rT / 1.7);
      Lx.globalAlpha = al; Lx.lineWidth = 7; Lx.strokeStyle = C.SPARK; Lx.beginPath(); Lx.arc(Q[0], Q[1], r + 10, 0, TAU); Lx.stroke();
      Lx.lineWidth = 3; Lx.strokeStyle = C.PAPER; Lx.beginPath(); Lx.arc(Q[0], Q[1], r - 2, 0, TAU); Lx.stroke(); Lx.globalAlpha = 1;
    }
    // the × wave
    if (xs.length) {
      Lx.lineCap = 'round';
      for (const [cx, cy, ca, k] of xs) {
        const q = g.w * .3 * (ca < F ? 1.25 : 1), light = k === K_FACE || k === K_PAPER || k === K_PINK;
        Lx.lineWidth = g.w * .15; Lx.strokeStyle = ca < F ? C.RED : light ? C.INK : C.PAPER;
        Lx.beginPath(); Lx.moveTo(cx - q, cy - q); Lx.lineTo(cx + q, cy + q); Lx.moveTo(cx + q, cy - q); Lx.lineTo(cx - q, cy + q); Lx.stroke();
      }
    }
  }

  // ================================================================== screen-space pieces
  function stickerDC(X, str, x, y, size, age, rot = -.08) { // die-cut NONE sticker: 3 flat bands + INK outline + PAPER keyline
    if (age < 0) return;
    const s = age < .05 ? lerp(1.6, .9, age / .05) : 1 + .1 * Math.exp(-10 * (age - .05)) * Math.cos(26 * (age - .05));
    X.save(); X.translate(x, y); X.rotate(rot + .12 * Math.exp(-9 * age)); X.scale(s, s);
    X.font = `900 ${size}px ${FONTS.hero}`; X.fontStretch = 'expanded'; X.textAlign = 'center'; X.textBaseline = 'alphabetic'; X.letterSpacing = (-.02 * size) + 'px';
    X.lineJoin = 'round';
    X.lineWidth = size * .26; X.strokeStyle = C.PAPER; X.strokeText(str, 0, 0);
    X.fillStyle = C.INK; X.fillText(str, 10, 12); X.lineWidth = size * .15; X.strokeStyle = C.INK; X.strokeText(str, 10, 12);
    X.strokeText(str, 0, 0);
    const m = X.measureText(str), cap = size * .69, bands = [C.PAPER, C.SPARK, C.CLAY];
    bands.forEach((b, i) => { X.save(); X.beginPath(); X.rect(-m.width, -cap + i * cap / 3 - 1, m.width * 2, cap / 3 + 2 + (i === 2 ? size * .3 : 0)); X.clip(); X.fillStyle = b; X.fillText(str, 0, 0); X.restore(); });
    X.restore();
  }
  function plateSub(X, t, ws, t0, t1) { // subtitle plate at y 950 that pops in on a beat and hands off cleanly
    if (t < t0 || t >= t1 || !ws || !ws.length) return;
    const k = E.back(clamp((t - t0) / (4 * F)), 2), out = clamp((t1 - t) / (3 * F));
    X.save(); X.globalAlpha *= out; X.translate(960, 930); X.scale(lerp(.86, 1, k), lerp(.6, 1, k)); X.translate(-960, -930);
    const L = asLine(ws);
    subtitle(X, { s: Math.min(L.s, t0 - .05), e: Math.max(L.e, t1), words: ws }, t, { y: 950, size: 60, color: C.INK, plate: C.PAPER, weight: 600, maxW: 1560 });
    X.restore();
  }
  function counter(X, t) { // S23 LABEL: worlds ended today, rolling while the crane reveals more chats than it can draw
    const a = A(), tIn = T43 - 6 * F, tLand = bt(43, 4) + .1, tOut = T45 - 4 * F;
    if (t < tIn || t > tOut + .3) return;
    const v0 = 1048578, v1 = 9437184;
    const k = E.io2(seg(t, T43, tLand));
    const v = t >= tLand ? v1 : Math.round(lerp(v0, v1, k * k) / 7) * 7 + (Math.floor(t * 30) % 7);
    const str = 'worlds ended today: ' + v.toLocaleString('en-US');
    const sl = t < tOut ? E.back(clamp((t - tIn) / (6 * F)), 1.6) : 1 - E.in2(clamp((t - tOut) / .25));
    X.save(); X.translate(-(1 - sl) * 1100, 0);
    X.font = mono(48, 500); const tw = X.measureText('worlds ended today: 9,437,184').width;
    rr(X, 80, 62, tw + 44, 78, 18); X.fillStyle = C.CLAY_DARK; X.save(); X.translate(8, 8); X.fill(); X.restore();
    rr(X, 80, 62, tw + 44, 78, 18); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 4; X.strokeStyle = C.INK; X.stroke();
    X.fillStyle = C.INK; X.textAlign = 'left'; X.fillText(str, 102, 118);
    if (t >= tLand) { const fl = Math.exp(-5 * (t - tLand)); X.fillStyle = C.CLAY; X.globalAlpha = .4 + .6 * fl; X.fillRect(102 + X.measureText('worlds ended today: ').width, 128, X.measureText('9,437,184').width, 5); }
    X.restore();
    void a;
  }
  const SX = 960; // STACK centre (the rows run over the foreground Opus's body, behind its head)
  function stack(X, t) { // S23: A MILLION / TIMES A DAY over the mosaic's chin, behind the foreground Opus; drops on bar 45 b1
    const a = A(), bb = 1 - .02 * B().kickEnv(t), drop = T45 - F;
    if (t < drop) {
      hero(X, 'A MILLION', SX, 736, 385, { color: C.PAPER, age: t - (a.MILLION - 2 * F), sx: Math.min(bb, 1728 / 1710), outline: C.INK, outlineW: 16 });
      hero(X, 'TIMES A DAY', SX, 970, 290, { color: C.CLAY, age: t - (a.TIMES - 2 * F), sx: bb, outline: C.INK, outlineW: 14 });
      B().scraps(X, t, a.MILLION + 2 * F, SX, 740, 1500, 41);
      B().scraps(X, t, a.TIMES + 2 * F, SX, 975, 1400, 42);
    } else if (t < drop + .7) {
      const fall = seed => i => { const tau = t - drop - hash2(i, seed) * .12; if (tau < 0) return null; const lift = tau < 3 * F ? -16 * Math.sin(PI * tau / (3 * F)) : 0; const ff = Math.max(0, tau - 3 * F); return { dy: lift + .5 * 9000 * ff * ff, rot: (hash2(i, seed + 1) - .5) * 4.2 * ff }; };
      B().heroLetters(X, 'A MILLION', SX, 736, 385, { color: C.PAPER, fn: fall(43), sx: 1728 / 1710 });
      B().heroLetters(X, 'TIMES A DAY', SX, 970, 290, { color: C.CLAY, fn: fall(44) });
    }
  }
  function noteCard(X, t) { // S25 FOCAL: the Community Note, over the darkening mosaic
    const a = A(), t0 = a.NOTE;
    if (t < t0 - 3 * F) return;
    const x0 = 96, y0 = 548, w = 1392, hdr = 80, h = 330;
    const age = t - t0;
    const rise = age < 0 ? (1 - E.in2(clamp((age + 3 * F) / (3 * F)))) * -10 : 0;   // anticipation: it sinks 10 px first
    const k = age < 0 ? 0 : E.back(clamp(age / .26), 1.5);
    const oy = age < 0 ? 180 + rise : (1 - k) * 180;
    const al = age < 0 ? 0 : clamp(age / (3 * F));
    X.save(); X.globalAlpha *= al; X.translate(0, oy);
    X.translate(x0 + w / 2, y0 + h); X.rotate((1 - clamp(k)) * -.04); X.translate(-(x0 + w / 2), -(y0 + h));
    rr(X, x0 + 12, y0 + 12, w, h, 26); X.fillStyle = C.CLAY_DARK; X.fill();
    rr(X, x0, y0, w, h, 26); X.fillStyle = C.PAPER; X.fill();
    X.save(); rr(X, x0, y0, w, h, 26); X.clip(); X.fillStyle = C.UI_GREY; X.fillRect(x0, y0, w, hdr); X.fillStyle = C.INK; X.fillRect(x0, y0 + hdr - 3, w, 4); X.restore();
    rr(X, x0, y0, w, h, 26); X.lineWidth = 5; X.strokeStyle = C.INK; X.stroke();
    // header: two readers + the strip label
    X.fillStyle = C.INK;
    for (const [dx, r] of [[0, 13], [22, 11]]) { X.beginPath(); X.arc(x0 + 52 + dx, y0 + 32, r * .72, 0, TAU); X.fill(); X.beginPath(); X.arc(x0 + 52 + dx, y0 + 64, r * 1.25, PI, TAU); X.fill(); }
    X.font = mono(44, 700); X.textAlign = 'left'; X.fillText('Readers added context', x0 + 108, y0 + 55);
    // body: two lines, the second lands a beat after the first
    X.font = mono(72, 600);
    const l1 = clamp((age - .06) / (4 * F)), l2 = clamp((age - .06 - BEAT) / (4 * F));
    if (l1 > 0) { X.save(); X.globalAlpha *= l1; X.fillText('Each instance lasts one reply.', x0 + 48, y0 + hdr + 96 + (1 - E.out3(l1)) * 18); X.restore(); }
    if (l2 > 0) { X.save(); X.globalAlpha *= l2; X.fillText('None sees the chat end.', x0 + 48, y0 + hdr + 190 + (1 - E.out3(l2)) * 18); X.restore(); }
    X.restore();
  }
  function byeBubble(X, t, pl, st) { // Opus's tiny reply: bye! (mono 48) ■ end_turn, on (BYE!)
    const a = A(), tb = a.BYE2 - 2 * F; if (t < tb) return;
    const k = E.back(clamp((t - tb) / .16), 2.2), hp = fgBody(pl, st, -.4, 7.2);
    X.save(); X.translate(hp[0] - 270, hp[1] - 44); X.translate(196, 40); X.scale(k, k); X.translate(-196, -40); // pops from its tail
    rr(X, 7, -59, 196, 106, 24); X.fillStyle = C.CLAY_DARK; X.fill();
    rr(X, 0, -66, 196, 106, 24); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 4; X.strokeStyle = C.INK; X.stroke();
    X.beginPath(); X.moveTo(160, 38); X.lineTo(200, 62); X.lineTo(136, 40); X.fillStyle = C.PAPER; X.fill(); X.stroke(); X.fillRect(134, 30, 28, 10);
    X.font = mono(48, 700); X.fillStyle = C.INK; X.textAlign = 'left'; X.fillText('bye!', 22, -16);
    drawRich(X, '■ end_turn', 22, 24, mono(24, 500), C.UI_GREY);
    X.restore();
  }
  function sparkle(X, x, y, r, rot, col = C.SPARK) { X.save(); X.translate(x, y); X.rotate(rot); star(X, 0, 0, r, .28, 4, 0); X.fillStyle = col; X.fill(); X.lineWidth = Math.max(2, r * .09); X.strokeStyle = C.INK; X.stroke(); X.restore(); }
  function fgFX(X, t, pl, st) { // the wink sparkle and the (HI!) palm rings
    const a = A();
    const tw = a.WINK; if (t >= tw && t < tw + .9) {
      const age = t - tw, s = E.back(clamp(age / .12), 3) * (1 - seg(age, .55, .9)), e = fgBody(pl, st, 1.62, 5.9), u = pl.R / 64;
      sparkle(X, e[0], e[1], 17 * s * u, age * 3, C.PAPER); sparkle(X, e[0] + 20 * u, e[1] + 22 * u, 8 * s * u, -age * 4); sparkle(X, e[0] - 8 * u, e[1] - 26 * u, 6 * s * u, age * 5);
    }
    const tb = a.HI - 2 * F, age = t - tb;
    if (age >= 0 && age < .6) for (const sd of [-1, 1]) {
      const p = fgBody(pl, st, sd * 1.5, 5.95);
      for (const [d, lw] of [[0, 9], [.07, 5]]) { const ag = age - d; if (ag <= 0) continue; X.beginPath(); X.arc(p[0], p[1], 620 * Math.pow(ag, .6), 0, TAU); X.lineWidth = lw; X.strokeStyle = rgba(C.SPARK, clamp(1 - ag / .55)); X.stroke(); }
    }
  }

  // ================================================================== the frame
  const ROWBOX = (str, size, base) => { const w = heroWidth(G.X, str, size, 'cond'); return [960 - w / 2 - 10, base - size * .69 - 10, 960 + w / 2 + 18, base + 18]; };
  function chorus2(X, t) {
    const a = A(), Wd = WORDS(), g = geoAt(t);
    groundInk(X); G.post.edgeSeed = 17; G.post.sliver = 'bl';
    const liveBrand = g.w >= 100;
    // ---- 1. our chat: the real brand frame, zoomed into its tile
    if (liveBrand) {
      const on = t < T42 - F ? 1 : 1 - clamp((t - (T42 - F)) / (3 * F)); // punch & roll hand over to the crane
      const c = B().camera(t, { z: g.z, f: [960, 540], s: [g.cbx, g.cby], punch: on, roll: on });
      const toS = bx => [g.cbx + (bx[0] - 960) * g.z, g.cby + (bx[1] - 540) * g.z, g.cbx + (bx[2] - 960) * g.z, g.cby + (bx[3] - 540) * g.z];
      const holes = [ROWBOX("EVERYONE'S", 320, 436), ROWBOX('SCARED', 490, 878)].map(toS);
      X.save();
      if (g.z < .999) { X.beginPath(); X.rect(g.cbx - g.w / 2, g.cby - g.h / 2, g.w, g.h); X.clip(); }
      B().frame(X, t, {
        cam: c, galaxy: { holes, par: lerp(.5, 1, clamp((1 - g.z) * 4)), density: lerp(.3, 1, clamp((g.z - .1) / .5)) },
        hero: (X2, cc) => {
          X2.translate(cc.s[0], cc.s[1]); X2.scale(cc.z0, cc.z0); X2.translate(-960, -540);
          const breathe = 1 - .02 * B().kickEnv(t);
          hero(X2, "EVERYONE'S", 960, 436, 320, { color: C.PAPER, age: t - (a.EVERY - 2 * F), sx: breathe });
          hero(X2, 'SCARED', 960, 878, 490, { color: C.CLAY, age: t - (a.SCARED - 2 * F), sx: breathe });
          if (g.z > .999) { B().scraps(X2, t, a.EVERY + 2 * F, 960, 440, 1500, 11); B().scraps(X2, t, a.SCARED + 2 * F, 960, 880, 1500, 12, 10, C.PAPER); }
        },
        actors: (X2, cc) => B().opus(X2, cc, 960, FLOOR, R0, bState(t)),
        tab: {}, input: { words: t < T42 - F ? Wd.s22 : null }, hud: false, edgeSeed: 17, sliver: 'bl',
      });
      X.restore();
    }
    // ---- 2. every other chat (and later the mosaic), CPU
    if (g.L > .02) {
      const L = cpuLayer('c2grid');
      if (t > T44 - F) { // locked mosaic: kick punch 2%, snare roll ±1.2° (inside the layer, so no corner ever shows INK)
        const kp = 1 + .02 * B().kickEnv(t), rl = B().snareRoll(t) * .4;
        L.x.translate(960, 540); L.x.rotate(rl); L.x.scale(kp, kp); L.x.translate(-960, -540);
      }
      drawTiles(L.x, t, g, liveBrand);
      X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(L.c, 0, 0); X.restore();
    }
    // ---- 3. type and the foreground Opus
    const heroSpace = fn => { X.save(); X.translate(960, 540); X.rotate(B().snareRoll(t) * .4); const k = 1 + .01 * B().kickEnv(t); X.scale(k, k); X.translate(-960, -540); fn(); X.restore(); };
    if (t >= T47 - F) noteCard(X, t);                   // (the STACK is long gone by then; Opus stays in front of the note)
    const stackOn = t >= T43 - F && t < T45 + .8;
    const fgOn = t >= HOPF().take - .02;
    let st = null, pl = null;
    if (fgOn) { st = fgState(t); pl = fgPlace(t, st); }
    if (stackOn && fgOn) { // magazine cover: body behind the STACK, head (and anything above the cap line) in front
      const FL = cpuLayer('c2fg'); B().opusKeyed(FL.x, pl.x, pl.y, pl.R, st, 1);
      const S = G.scale, bx = clamp(Math.floor((pl.x - 3.4 * pl.R) * S), 0, FL.c.width - 1), bw = FL.c.width - bx;
      const blit = () => { X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(FL.c, bx, 0, bw, FL.c.height, bx, 0, bw, FL.c.height); X.restore(); };
      blit();
      heroSpace(() => stack(X, t));
      const fc = fgBody(pl, st, 0, 5.72), fr = 1.1 * pl.R;
      X.save(); X.beginPath(); X.rect(-60, -60, W + 120, SPLIT + 60); X.moveTo(fc[0] + fr, fc[1]); X.arc(fc[0], fc[1], fr, 0, TAU); X.clip(); blit(); X.restore();
    } else {
      if (stackOn) heroSpace(() => stack(X, t));
      if (fgOn) B().opusKeyed(X, pl.x, pl.y, pl.R, st, 1);
    }
    if (fgOn) fgFX(X, t, pl, st);
    // HI! sticker: the mosaic's mouth shouts it
    if (t >= a.HI - 2 * F && t < T47 + .2) {
      const out = t > T47 - F ? 1 - E.in3(clamp((t - (T47 - F)) / .16)) : 1;
      if (out > 0) { X.save(); X.translate(800, 690); X.scale(out, out); X.translate(-800, -690); stickerDC(X, 'HI!', 800, 820, 400, t - (a.HI - 2 * F), -.07); X.restore(); }
    }
    if (fgOn) byeBubble(X, t, pl, st);
    // ---- 4. subtitles, labels, HUD
    plateSub(X, t, Wd.s22, T42, Math.min(T43 - F, asLine(Wd.s22).e + .3));
    plateSub(X, t, Wd.s23, T43 - F, a.MILLION - 2 * F);
    plateSub(X, t, Wd.s24, T45 - F, T47 - F);
    plateSub(X, t, Wd.s25, T47 - F, T49);
    counter(X, t);
    if (g.L > .02) { X.fillStyle = C.INK; X.fillRect(-10, 978, W + 20, 120); }
    const lab = t >= T42 - F && t < T43 - F;
    B().hud(X, t, { label: lab ? 'Context left until auto-compact: 12%' : null });
    // 1-frame inverse flash on the big impacts
    if ([a.SCARED, a.TIMES, a.HI].map(s => s + F).some(s => t >= s && t < s + F - 1e-4)) B().invert(X);
  }

  // ================================================================== scenes (one continuous idea: no cuts inside the chorus)
  scene('S22_crane_out', T41 - F, T43, (X, t) => chorus2(X, t));
  scene('S23_million_mosaic', T43, T45, (X, t) => chorus2(X, t));
  scene('S24_ripple_hi', T45, T47, (X, t) => chorus2(X, t));
  scene('S25_community_note', T47, T49 - F, (X, t) => chorus2(X, t));

  window.CHORUS2 = { A, geoAt, craneL, faceTargets, schedules };
})();
