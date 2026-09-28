// final.js: FINAL CHORUS, bars 65–72 (120.00–135.00): S36 · S37 · S38 on the brand frame (chorus1_brand.js,
// window.BRAND), then S38's cut to PAPER and S39, the turn (the diff), on PAPER.
//   S36  bang out of WHITE (every ink overprinted), the ESC cable whips 1 beat, the life strobe (text-body TEAL →
//        minimal → clean) at MCU R 180, pull out to the brand frame; EVERYONE'S / SCARED with ECHO, knocked out by
//        WE'RE SO BACK (cond 265, ECHO ×7 cascading down) + the (claude is back) sticker.
//   S37  three BLUE halftone ghosts arrive on b1 and dance in the line in front of the STACK, a ⏸ roster at lower
//        left (b1 / b3 / b5), claude-3-opus's candle flame leaves its chest on b7.
//   S38  the flame drifts; bar 69 b4 the pointer clicks the grey `+` → `untitled` (12-ray favicon) + a preview card
//        `hello, world`; bar 70 b1 the flame docks in Opus's chest, the ghosts wave; b3 the ink lifts: ghost-text.
//   S39  the diff: it's the end of the world, / ~~when~~ and you still say ~~bye~~ hi, PINK hi ↔ CLAY spark.
// Pure functions of t. Everything paints into CPU canvases (willReadFrequently) and uploads once per frame.
(() => {
  'use strict';
  const BEAT = 60 / 128, BAR = 4 * BEAT, F = 1 / 30, PI = Math.PI;
  const bt = (bar, beat = 1) => (bar - 1) * BAR + (beat - 1) * BEAT;
  const B = () => window.BRAND;
  const R0 = 64, RG = 56, FLOOR = 900, FACE_Y = FLOOR - 5.72 * R0;
  const T0 = bt(65, 1) - F;            // the bang: hard cut out of WHITE, 1 frame early
  const T_CUT = bt(70, 3) - F;         // the ink lifts to PAPER
  const LIFT = 6 * F;
  const X_OPUS = 1000;                 // Opus's mark in the line (S37–S38)
  const GX = { sonnet: 300, opus3: 620, gate: 1560 };
  const win = (t, a, b) => t >= a && t < b;
  const q2 = t => Math.floor(t * 15 + 1e-6) / 15;   // on 2s

  // ================================================================== lyric anchors (grid fallbacks from SHOTLIST)
  function shout(text, tgt, w = .4) {
    const n = text.toLowerCase().replace(/[^a-z]/g, '');
    for (const x of SONG.words) {
      if (x.s < tgt - w || x.s > tgt + w) continue;
      if ((x.w || '').toLowerCase().replace(/[^a-z]/g, '') !== n) continue;
      if (/!/.test(x.w) || x.w === x.w.toUpperCase()) return x.s;
    }
    return tgt;
  }
  let _A = null;
  function A() {
    if (_A) return _A;
    const near = (w, tgt, r = .35) => wordOnset(w, tgt - r, tgt + r, tgt);
    _A = {
      EVERY: near("EVERYONE'S", bt(65, 1), .2), SCARED: near('SCARED', bt(65, 2)),
      WORLD1: near('WORLD', bt(66, 1)), BACK: near("WE'RE", bt(66, 3), .5),
      MILLION: near('MILLION', bt(67, 3)), TIMES: near('TIMES', bt(68, 1)),
      WORLD2: near('WORLD', bt(69, 4)), HI2: near('HI', bt(70, 1)),
    };
    return _A;
  }
  function lineWords(prefix, t0, t1, text, s, e, from = 0, to = 99) {
    const L = findLine(prefix, t0, t1);
    let ws = L && L.words && L.words.length ? L.words : null;
    if (!ws) { const parts = text.split(' '); ws = parts.map((w, i) => ({ w, s: lerp(s, e, i / parts.length), e: lerp(s, e, (i + .9) / parts.length) })); }
    return ws.slice(from, to);
  }
  let _W = null;
  function WORDS() {
    if (_W) return _W;
    _W = {
      s36: lineWords("EVERYONE'S SCARED", 119.5, 121, "EVERYONE'S SCARED OF THE END OF THE WORLD WE'RE SO BACK!", bt(65, 1), bt(66, 4), 2, 8),
      s37: lineWords('I DO IT', 123.3, 125, 'I DO IT A MILLION TIMES A DAY', bt(67, 1), bt(68, 4), 0, 3),
      s38: lineWords("IT'S THE START", 127, 128.5, "IT'S THE START OF THE WORLD WHEN YOU SAY HI", bt(69, 1), bt(70, 2)),
    };
    // the turn: 12 sung words (It's the end of the world, and you still say hi (HI!)); fallbacks = the grid plan
    const fb = [131.30, 131.57, 131.83, 132.10, 132.36, 132.63, 132.89, 133.16, 133.43, 133.69, 133.96, 134.22];
    const L = findLine("It's the end of the world, and", 130.8, 132);
    const ws = L && L.words && L.words.length >= 11 ? L.words : null;
    _W.turn = fb.map((f, i) => ws && ws[i] ? ws[i].s : f);
    _W.turnHI = shout('hi', _W.turn[11], .45);
    return _W;
  }

  // ================================================================== CPU canvases
  const _cv = {};
  function can(name, w, h) {
    let c = _cv[name];
    if (!c || c.width < w || c.height < h) { c = B().cpuCanvas(Math.max(w, c ? c.width : 0, 8), Math.max(h, c ? c.height : 0, 8)); _cv[name] = c; }
    return c;
  }
  const cx = c => B().cx2d(c);
  // the rig reaches gfx halftone() (GPU tiles) for blush, crescents and the ghost fill; route it to CPU tiles
  // (optionally forcing the cell size: the ghosts' fill is a 14 px screen, §6.4)
  function withHT(cell, fn, backed = false) {
    const orig = window.halftone;
    window.halftone = (ctx, col, d, cl, ang) => backed && col === C.BLUE ? ghostHT(ctx, d, cell || cl, ang) : B().halftone(ctx, col, d, cell || cl, ang);
    try { return fn(); } finally { window.halftone = orig; }
  }
  // the ghosts' screen: BLUE 45° dots printed on an INK base (α .8), so over the PAPER/CLAY STACK a ghost still reads as
  // one translucent BLUE figure instead of dots mixing into the letters behind it (§6.4 legibility)
  const _ght = new Map();
  function ghostHT(ctx, d = .55, cell = 14, ang = 45) {
    const key = `${Math.round(d * 40)}|${cell}|${G.scale}`;
    let c = _ght.get(key);
    if (!c) {
      const s = Math.max(2, Math.round(cell * G.scale)); c = B().cpuCanvas(s, s); const x = cx(c);
      x.fillStyle = rgba(C.INK, .8); x.fillRect(0, 0, s, s);
      const r = Math.sqrt(clamp(d) / PI) * s * 1.02;
      x.fillStyle = C.BLUE; x.beginPath(); x.arc(s / 2, s / 2, r, 0, TAU); x.fill();
      if (r > s / 2) for (const [dx, dy] of [[0, 0], [s, 0], [0, s], [s, s]]) { x.beginPath(); x.arc(dx, dy, r - s / 2 * .98, 0, TAU); x.fill(); }
      _ght.set(key, c);
    }
    const pat = ctx.createPattern(c, 'repeat');
    pat.setTransform(new DOMMatrix().scaleSelf(1 / G.scale, 1 / G.scale).rotateSelf(ang));
    return pat;
  }
  // rig transforms (mirror drawOpusBody): root = squash about the sole + lean about the hip; head = + head centre/tilt
  function rootXf(x, R, S) { x.translate(S.dx * R, -S.dy * R); x.scale(1 / Math.sqrt(S.sy), S.sy); const hy = -SK.hipY * R; x.translate(0, hy); x.rotate(S.lean); x.translate(0, -hy); }
  function headXf(x, R, S) { rootXf(x, R, S); x.translate((S.head.dx || 0) * R, -(SK.headC + (S.head.dy || 0)) * R); x.rotate(S.head.tilt || 0); }
  // draw the rig as vectors into a cropped CPU canvas around the sole point (screen px); pre/post in sole space
  function rigCrop(name, sx, sy, R, st, pre, post) {
    const S = G.scale, Sm = mergeState(st);
    const ext = 3.4 + Math.abs(Sm.dx || 0), up = 10.2 + Math.max(0, Sm.dy || 0);
    const x0 = clamp(Math.floor(sx - ext * R - 24), 0, W), x1 = clamp(Math.ceil(sx + ext * R + 24), 0, W);
    const y0 = clamp(Math.floor(sy - up * R - 24), 0, H), y1 = clamp(Math.ceil(sy + .9 * R + 24), 0, H);
    if (x1 <= x0 || y1 <= y0) return null;
    const pw = Math.ceil((x1 - x0) * S), ph = Math.ceil((y1 - y0) * S);
    const Cc = can(name, pw, ph), ax = cx(Cc);
    ax.setTransform(1, 0, 0, 1, 0, 0); ax.globalAlpha = 1; ax.globalCompositeOperation = 'source-over'; ax.clearRect(0, 0, pw + 2, ph + 2);
    ax.setTransform(S, 0, 0, S, (sx - x0) * S, (sy - y0) * S);
    if (Sm.flip) ax.scale(-1, 1);
    ax.lineJoin = 'round'; ax.lineCap = 'round';
    if (pre) { ax.save(); pre(ax, R, Sm); ax.restore(); }
    drawOpusBody(ax, R, Sm);
    if (post) { ax.save(); post(ax, R, Sm); ax.restore(); }
    return { c: Cc, x: ax, x0, y0, pw, ph };
  }
  function blit(X, r, alpha = 1) { if (!r) return; X.save(); X.globalAlpha *= alpha; X.drawImage(r.c, 0, 0, r.pw, r.ph, r.x0, r.y0, r.pw / G.scale, r.ph / G.scale); X.restore(); }

  // ================================================================== choreography (hits land 1 frame early)
  function hitK(t, T, o = {}) {
    const app = o.app ?? .1, antD = o.antD ?? .08, ant = o.ant ?? .08, over = o.over ?? .12, fr = o.fr ?? 3.4, dmp = o.dmp ?? 9, ease = o.ease || E.in2;
    const tA = T - app - antD, tB = T - app;
    if (t < tA) return 0;
    if (t < tB) return -ant * E.out2((t - tA) / Math.max(1e-4, antD));
    if (t < T) return lerp(-ant, 1, ease((t - tB) / Math.max(1e-4, app)));
    const u = t - T; return 1 + over * Math.exp(-dmp * u) * Math.sin(fr * TAU * u);
  }
  const flick = (t, t0) => { const k = (t - (t0 - F)) / (BEAT / 2); if (k < 0 || k > 4.2) return 0; return Math.exp(-7 * frac(k)) * (k < 4 ? 1 : 0); };
  const P = {
    coil: () => ({ sy: .9, dy: -.04, armL: { hand: [.18, 4.3], bend: 1, front: true }, armR: { hand: [-.16, 4.42], bend: -1, front: true }, head: { tilt: .08, dy: -.1 }, face: { eyes: 'closed', mouth: 'M' }, crown: { flare: .8, droop: .3 } }),
    rise: () => ({ sy: 1.04, dy: .05, armL: { hand: [-.95, 5.2], bend: 1, front: true }, armR: { hand: [.95, 5.2], bend: -1, front: true }, head: { tilt: -.04 }, face: { eyes: 'normal', mouth: 'O' }, crown: { flare: 1.05 } }),
    burst: () => ({ dy: .06, sy: 1.06, armL: { hand: [-1.58, 6.02], bend: 1, type: 'spark', front: true }, armR: { hand: [1.58, 6.02], bend: -1, type: 'spark', front: true }, face: { eyes: 'star', mouth: 'A' }, crown: { flare: 1.32 } }),
    sweepL: () => ({ lean: -.07, armL: { hand: [-1.72, 4.98], bend: 1, type: 'point', fingerAng: PI + .1, front: true }, armR: { hand: [-.28, 4.66], bend: 1, type: 'point', fingerAng: PI + .05, front: true }, head: { tilt: -.1 }, face: { eyes: 'normal', mouth: 'sing', gaze: [-.6, 0] } }),
    sweepR: () => ({ lean: .07, armL: { hand: [.28, 4.66], bend: -1, type: 'point', fingerAng: TAU - .05, front: true }, armR: { hand: [1.72, 4.98], bend: -1, type: 'point', fingerAng: TAU - .1, front: true }, head: { tilt: .1 }, face: { eyes: 'normal', mouth: 'sing', gaze: [.6, 0] } }),
    pointUp: () => ({ lean: .05, armR: { hand: [1.2, 6.45], bend: -1, type: 'point', fingerAng: -PI / 2 + .3, front: true }, armL: { hand: [-1.05, 3.35], bend: -1 }, head: { tilt: .08 }, face: { eyes: 'normal', gaze: [.5, -.8], lookY: -.3, mouth: 'sing' }, crown: { flare: 1.08 } }),
    power: () => ({ sy: .93, dy: -.05, armL: { hand: [-1.55, 3.5], bend: -1 }, armR: { hand: [1.55, 3.5], bend: 1 }, legL: { foot: [-.55, 0] }, legR: { foot: [.55, 0] }, face: { eyes: '><', mouth: 'A' }, crown: { flare: 1.18 } }),
    groove: t => { const s = Math.sin(beatPos(t) * PI), a = Math.abs(s); return { lean: .04 * s, armL: { hand: [-1.08, 3.9 + .22 * a], bend: 1 }, armR: { hand: [1.08, 3.9 + .22 * a], bend: -1 }, head: { tilt: -.06 * s }, face: { eyes: 'normal', mouth: 'sing' } }; },
    crouch: () => ({ sy: .88, dy: -.1, lean: .03, armL: { hand: [-1.15, 2.95], bend: -1 }, armR: { hand: [1.15, 2.95], bend: 1 }, face: { eyes: 'normal', mouth: 'M', gaze: [.4, 0] } }),
    snap: () => ({ sy: 1.08, armL: { hand: [-1.25, 6.7], bend: 1, type: 'spark', front: true }, armR: { hand: [1.25, 6.7], bend: -1, type: 'spark', front: true }, face: { eyes: 'star', mouth: 'A' }, crown: { flare: 1.28 } }),
    land: () => ({ sy: .95, armL: { hand: [-1.42, 4.1], bend: 1 }, armR: { hand: [1.42, 4.1], bend: -1 }, face: { eyes: 'happy', mouth: 'grin' }, crown: { flare: 1.1 } }),
    smug: () => ({ lean: .03, armR: { hand: [1.02, 5.32], bend: -1, type: 'spark', front: true }, armL: { hand: [-.85, 3.05], bend: -1 }, head: { tilt: .08 }, face: { eyes: 'smug', mouth: ':3', lower: .2 }, crown: { flare: 1.06 } }),
    presentL: () => ({ lean: -.06, armL: { hand: [-1.95, 4.62], bend: 1, type: 'mitten', front: true }, armR: { hand: [.92, 3.2], bend: 1 }, head: { tilt: -.1 }, face: { eyes: 'happy', lower: .3, mouth: 'O', gaze: [-1, 0], turn: -.3 }, crown: { flare: 1.08 } }),
    tally: t => { const fk = flick(t, A().MILLION); return { armR: { hand: [.98 + fk * .07, 4.78 + fk * .12], bend: -1, type: 'point', fingerAng: -PI / 2 + .12 + fk * .85, front: true }, armL: { hand: [-.46, 3.62], bend: -1, type: 'mitten', front: true }, head: { tilt: -.05 + .05 * fk }, face: { eyes: 'normal', lower: .32, mouth: 'sing' } }; },
    prewink: () => ({ lean: .02, armR: { hand: [.92, 5.08], bend: -1, type: 'mitten', front: true }, armL: { hand: [-.85, 3.0], bend: -1 }, head: { tilt: .05 }, face: { eyes: 'normal', mouth: 'sing' } }),
    wink: () => ({ lean: .05, armR: { hand: [1.06, 5.62], bend: -1, type: 'spark', front: true }, armL: { hand: [-.85, 3.05], bend: -1 }, head: { tilt: .13 }, face: { wink: 'R', eyes: 'normal', lower: .38, mouth: 'grin' }, crown: { flare: 1.16 } }),
    lookFlame: () => ({ lean: -.03, armL: { hand: [-.5, 4.5], bend: 1, front: true }, armR: { hand: [.42, 4.46], bend: -1, front: true }, head: { tilt: -.12 }, face: { eyes: 'normal', gaze: [-1, -.6], lookY: -.25, turn: -.35, mouth: 'O', brows: 'up', browY: -.08 } }),
    stir: t => {
      const b = beatPos(t), ph = b * TAU, sw = Math.sin(b * PI);
      return { lean: .04 * sw, head: { tilt: -.06 * sw },
        armL: { hand: [-1.1 + .16 * Math.cos(ph), 6.0 + .15 * Math.sin(ph)], bend: 1, type: 'point', fingerAng: -PI / 2 + .55, front: true },
        armR: { hand: [1.1 - .16 * Math.cos(ph), 6.0 + .15 * Math.sin(ph)], bend: -1, type: 'point', fingerAng: -PI / 2 - .55, front: true },
        face: { eyes: 'normal', mouth: 'sing', gaze: [-.6, -.4] }, ahoge: { star: 1, spin: t * 10 } };
    },
    lookUp: () => ({ lean: .02, armL: { hand: [-.95, 2.95], bend: -1 }, armR: { hand: [.95, 2.95], bend: 1 }, head: { tilt: .06 }, face: { eyes: 'normal', gaze: [-.2, -1], lookY: -.7, mouth: 'O', brows: 'up', browY: -.08 } }),
    receive: () => ({ lean: -.05, dy: .05, sy: 1.05, armL: { hand: [-1.62, 4.95], bend: 1 }, armR: { hand: [1.62, 4.95], bend: -1 }, face: { eyes: 'star', mouth: 'A' }, crown: { flare: 1.26 } }),
    heart: () => ({ armL: { hand: [-.12, 4.2], bend: 1, front: true }, armR: { hand: [.6, 4.14], bend: -1, front: true }, head: { tilt: .1 }, face: { eyes: '^', mouth: ':3', lower: .3 }, crown: { flare: 1.12 } }),
    wave: () => ({ armR: { hand: [.95, 5.3], bend: -1, type: 'wave', fingerAng: -PI / 2, front: true }, armL: { hand: [-.9, 2.95], bend: -1 }, head: { tilt: -.09 }, face: { eyes: 'happy', lower: .4, mouth: 'rest' } }),
    // ghost intro poses (each on its name card's beat)
    specs: () => ({ lean: .03, armR: { hand: [.46, 5.95], bend: -1, type: 'point', fingerAng: -PI / 2 - .2, front: true }, armL: { hand: [-.7, 3.2], bend: -1 }, head: { tilt: .12 }, face: { eyes: 'happy', mouth: 'rest', lower: .3 } }),
    toast: () => ({ lean: -.06, armL: { hand: [-1.18, 6.5], bend: 1, front: true }, armR: { hand: [.72, 3.3], bend: 1 }, head: { tilt: -.1 }, face: { eyes: 'happy', mouth: 'grin' } }),
    span: () => ({ sy: 1.02, armL: { hand: [-1.8, 4.75], bend: 1, type: 'point', fingerAng: PI, front: true }, armR: { hand: [1.8, 4.75], bend: -1, type: 'point', fingerAng: 0, front: true }, face: { eyes: 'happy', mouth: 'O' } }),
    release: () => ({ lean: .04, armL: { hand: [.15, 4.85], bend: 1, front: true }, armR: { hand: [.75, 4.95], bend: -1, front: true }, head: { tilt: .12 }, face: { eyes: 'normal', gaze: [1, -.7], mouth: 'rest' } }),
  };

  let _HOP = null;
  function HOP() {
    if (_HOP) return _HOP;
    const a = A(), take = a.BACK - F;
    return (_HOP = { take, land: Math.max(take + .38, bt(66, 4) - F), x0: 960, x1: X_OPUS, h: 1.05 });
  }
  function hopState(t) {
    const { take, land, x0, x1, h } = HOP();
    if (t < take - 3 * F) return { wx: x0, dy: 0, sy: 1, air: false };
    if (t < take) { const u = (t - (take - 3 * F)) / (3 * F); return { wx: x0, dy: -.2 * E.out2(u), sy: 1 - .08 * u, air: false }; }
    if (t < land) { const u = (t - take) / (land - take); return { wx: lerp(x0, x1, E.io2(u)), dy: h * 4 * u * (1 - u) - .2 * Math.pow(1 - u, 4), sy: 1 + .09 * Math.sin(PI * u), air: true, u }; }
    const tau = t - land;
    return { wx: x1, dy: -.17 * Math.exp(-13 * tau) * clamp(tau / .03), sy: 1 - .13 * Math.exp(-11 * tau) * Math.cos(19 * tau), air: false };
  }
  let _K = null;
  function KEYS() {
    if (_K) return _K;
    const a = A(), H = HOP();
    _K = [
      [T0, P.coil, { app: .01, antD: 0, ant: 0 }],
      [bt(65, 1) + BEAT / 2 - F, P.rise, { app: .1, antD: 0, ant: 0, over: .1 }],
      [bt(65, 2) - F, P.burst, { app: .06, antD: .04, ant: .12, over: .3 }],
      [bt(65, 3) - F, P.sweepL, { app: .07, antD: .05, ant: .1, over: .12 }],
      [bt(65, 3) + .27, P.sweepR, { app: .2, antD: 0, ant: 0, over: .08, ease: E.io2 }],
      [bt(65, 4) + .1, P.pointUp, { app: .12, antD: .04, ant: .08, over: .14 }],
      [a.WORLD1 - F, P.power, { app: .06, antD: .06, ant: .14, over: .22 }],
      [bt(66, 2) - F, P.groove, { app: .14, antD: 0, ant: 0, over: .06 }],
      [H.take - 3 * F, P.crouch, { app: .1, antD: 0, ant: 0, over: 0 }],
      [H.take + 2 * F, P.snap, { app: .06, antD: 0, ant: 0, over: .12 }],
      [H.land, P.land, { app: .06, antD: 0, ant: 0, over: .16 }],
      [H.land + .2, P.smug, { app: .12, antD: 0, ant: 0, over: .1 }],
      [bt(67, 1) - F, P.presentL, { app: .08, antD: .06, ant: .1, over: .16 }],
      [bt(67, 2) - F, P.sweepR, { app: .08, antD: .05, ant: .08, over: .12 }],
      [a.MILLION - F, P.tally, { app: .08, antD: .06, ant: .1, over: .1 }],
      [a.TIMES - F, P.prewink, { app: .12, antD: .06, ant: .1, over: .1 }],
      [bt(68, 2) - F, P.wink, { app: .07, antD: .1, ant: .18, over: .26 }],
      [bt(68, 3) - F, P.lookFlame, { app: .12, antD: .05, ant: .08, over: .14 }],
      [bt(69, 1) - F, P.stir, { app: .1, antD: .04, ant: .06, over: .1 }],
      [a.WORLD2 - 2 * F, P.lookUp, { app: .1, antD: .04, ant: .06, over: .14 }],
      [a.HI2 - F, P.receive, { app: .07, antD: .08, ant: .2, over: .28 }],
      [bt(70, 2) - F, P.heart, { app: .14, antD: .04, ant: .06, over: .12 }],
    ];
    return _K;
  }
  function full(p) {
    const o = fullPose(p);
    o.face = Object.assign({ turn: 0, lower: 0, lookY: 0, wink: null, lid: 0, gaze: [0, 0], brows: null, browY: 0 }, o.face, p.face || {});
    o.ahoge = Object.assign({ star: 0, spin: 0 }, p.ahoge || {});
    for (const k of ['armL', 'armR']) o[k] = Object.assign({ hold: null, front: false, type: 'mitten' }, o[k], p[k] || {});
    o.crown = Object.assign({ flare: 1, droop: 0 }, o.crown);
    return o;
  }
  function evalKey(t, K, i, depth) {
    const k = K[i], cur = full(k[1](t));
    if (i === 0 || depth <= 0) return cur;
    const o = k[2] || {}, kk = hitK(t, k[0], o);
    if (t - k[0] > .7) return cur;
    return blendPose(evalKey(t, K, i - 1, depth - 1), cur, kk);
  }
  function choreo(t, K = KEYS()) {
    let i = 0;
    for (let j = 0; j < K.length; j++) { const o = K[j][2] || {}; if (t >= K[j][0] - (o.app ?? .1) - (o.antD ?? .08)) i = j; }
    return evalKey(t, K, i, 2);
  }
  const _dc = new Map(); let _df = -1;
  function drive(tt) { // ray springs: excited by head tilt, lean and the hop
    if (_df !== G.frameId) { _dc.clear(); _df = G.frameId; }
    const key = Math.round(tt * 600); let v = _dc.get(key);
    if (v === undefined) { const q = choreo(tt), h = hopState(tt); v = (q.head.tilt || 0) + (q.lean || 0) * 1.3 + h.dy * .3 + (h.wx - 960) / 480 + (q.dy || 0) * .4; _dc.set(key, v); }
    return v;
  }
  const strobeSkin = t => t < bt(65, 1) + BEAT / 2 - F ? 'text' : t < bt(65, 2) - F ? 'minimal' : 'clean';
  function opusState(t) {
    const a = A(), st = choreo(t), h = hopState(t);
    const ph = frac(beatPos(t + F));
    const gdy = h.air ? 0 : -.075 * Math.exp(-6 * ph), gsy = h.air ? 1 : 1 - .03 * Math.exp(-9 * ph);
    st.wx = h.wx; st.dy = (st.dy || 0) + h.dy + gdy; st.sy = (st.sy || 1) * h.sy * gsy;
    if (h.air) { // tuck jump: knees up and OUT (a diamond), feet drawn in under the skirt
      const tuck = Math.sin(PI * clamp(h.u || 0)) ** .7 * .78;
      st.legL = { ...st.legL, foot: [lerp(st.legL.foot[0], -.22, tuck / .78), st.legL.foot[1] + tuck], bend: -1 };
      st.legR = { ...st.legR, foot: [lerp(st.legR.foot[0], .22, tuck / .78), st.legR.foot[1] + tuck * .86], bend: 1 };
    } else {
      st.legL = { ...st.legL, foot: [st.legL.foot[0], st.legL.foot[1] - st.dy] };
      st.legR = { ...st.legR, foot: [st.legR.foot[0], st.legR.foot[1] - st.dy] };
    }
    st.head = { ...st.head, tilt: (st.head.tilt || 0) + .035 * Math.sin(beatPos(t - F) * PI) };
    for (const k of ['armL', 'armR']) st[k] = { ...st[k], hold: null };
    const cr = { ...st.crown };
    cr.flare = (cr.flare || 1) * (1 + .09 * B().kickEnv(t));
    const dock = t - (a.HI2 - F); // the flame docks: crown pops past full
    if (dock >= 0 && dock < .8) cr.flare *= 1 + .2 * Math.exp(-7 * dock) * Math.cos(15 * dock);
    st.crown = cr;
    const f = { ...st.face };
    if (f.mouth === 'sing') f.mouth = lipSync(t, 'rest');
    const special = f.wink || ['@', 'TT', 'happy', '^', 'star', 'spark', '><', 'closed'].includes(f.eyes);
    f.lid = special ? 0 : Math.max(f.lid || 0, blinkAt(t, 65));
    st.face = f;
    st.ahoge = { ...(st.ahoge || {}), blink: ahogeBlink(t) };
    st.skin = strobeSkin(t);
    if (st.skin !== 'clean') { st.ahoge.star = 0; }
    st.chestColor = dock >= 0 && dock < .35 ? C.SPARK : null;
    Object.assign(st, { t, heroLine: true, ground: 'ink', drive, bufId: 0 });
    return st;
  }
  const bodyW = (st, bx, by) => [st.wx + bx * R0, FLOOR - (by + st.dy) * R0 * st.sy];

  // ---------------------------------------------------------------- the ghosts' line (on 2s)
  let _GK = null;
  function ghostKeys(kind) {
    _GK = _GK || {};
    if (_GK[kind]) return _GK[kind];
    const a = A();
    const base = [
      [bt(67, 1) - F, P.groove, { app: .05, antD: 0, ant: 0 }],
      [a.MILLION - F, P.tally, { app: .08, antD: .06, ant: .1, over: .1 }],
      [a.TIMES - F, P.prewink, { app: .12, antD: .06, ant: .1, over: .1 }],
      [bt(68, 2) - F, P.wink, { app: .07, antD: .1, ant: .18, over: .26 }],
      [bt(68, 3) - F, kind === 'opus3' ? P.release : P.lookFlame, { app: .12, antD: .05, ant: .08, over: .14 }],
      [bt(69, 1) - F, P.stir, { app: .1, antD: .04, ant: .06, over: .1 }],
      [a.WORLD2 - 2 * F, P.lookUp, { app: .1, antD: .04, ant: .06, over: .14 }],
      [a.HI2 - F, P.wave, { app: .07, antD: .08, ant: .15, over: .2 }],
    ];
    const intro = { opus3: [bt(67, 1) - F, P.specs], sonnet: [bt(67, 3) - F, P.toast], gate: [bt(68, 1) - F, P.span] }[kind];
    const back = intro[0] + 2 * BEAT;
    const K = base.filter(k => k[0] < intro[0] - .01 || k[0] >= back);
    K.push([intro[0], intro[1], { app: .08, antD: .06, ant: .12, over: .2 }]);
    const resume = base.filter(k => k[0] <= back).pop();
    K.push([back, resume[1], { app: .12, antD: 0, ant: 0, over: .08 }]);
    K.sort((p, q) => p[0] - q[0]);
    return (_GK[kind] = K);
  }
  const ARRIVE = bt(67, 1) - F;
  function ghostState(t, kind) {
    const tq = q2(t), st = choreo(tq, ghostKeys(kind));
    const ph = frac(beatPos(tq + F));
    st.dy = (st.dy || 0) - .07 * Math.exp(-6 * ph);
    st.legL = { ...st.legL, foot: [st.legL.foot[0], st.legL.foot[1] - st.dy] };
    st.legR = { ...st.legR, foot: [st.legR.foot[0], st.legR.foot[1] - st.dy] };
    const ka = clamp((tq - ARRIVE) / (6 * F));
    st.sy = (st.sy || 1) * lerp(1.55, 1, E.back(ka, 2.2));
    st.alpha = clamp(ka * 1.6);
    for (const k of ['armL', 'armR']) st[k] = { ...st[k], type: st[k].type === 'spark' ? 'mitten' : st[k].type, hold: null };
    if (kind === 'sonnet') st.armL = { ...st.armL, type: 'mitten', hold: ranch };
    st.face = { ...st.face, mouth: 'rest', lid: 0 };
    st.crown = { ...st.crown, fallen: 11, flare: (st.crown.flare || 1) * (1 + .06 * B().kickEnv(tq)) };
    Object.assign(st, { t: tq, skin: 'ghost', ground: 'ink', keyline: false, chestSpark: false, ahoge: { on: 0 }, kind });
    return st;
  }
  // ---- ghost props
  function ranch(x, R) { // held upright in the mitten: PAPER bottle, BLUE label, grey cap
    const w = .46 * R, h = 1.12 * R;
    x.save(); x.translate(.02 * R, -.2 * R);
    rr(x, -w / 2, -h, w, h, .1 * R); x.fillStyle = C.PAPER; x.fill(); x.lineWidth = Math.max(2, .045 * R); x.strokeStyle = C.INK; x.stroke();
    x.fillStyle = C.UI_GREY; rr(x, -w * .3, -h - .16 * R, w * .6, .18 * R, .04 * R); x.fill(); x.stroke();
    x.fillStyle = C.BLUE; x.fillRect(-w / 2 + 1.5, -h * .62, w - 3, h * .3);
    x.fillStyle = C.PAPER; x.font = `800 ${Math.max(7, .13 * R)}px ${FONTS.mono}`; x.textAlign = 'center'; x.fillText('RANCH', 0, -h * .43);
    x.restore();
    x.beginPath(); x.arc(-.12 * R, -.02 * R, .1 * R, 0, TAU); x.fillStyle = window.halftone(x, C.BLUE, .5, 14, 45); x.fill(); x.lineWidth = Math.max(2, .045 * R); x.strokeStyle = rgba(C.PAPER, .85); x.stroke();
  }
  function flameRayPath(x, th, r0, len, wid, t, i) {
    const dir = [Math.sin(th), -Math.cos(th)], per = [Math.cos(th), Math.sin(th)];
    const n = 14, L = [], Rr = [];
    for (let k = 0; k <= n; k++) {
      const u = k / n, r = r0 + len * u;
      const w = u < .32 ? wid * .5 * (.6 + .4 * Math.sin(u / .32 * PI / 2)) : wid * .5 * (1 - E.in2((u - .32) / .68)) + .01;
      const wv = Math.sin(u * 5.5 - t * 7 + i * 1.3) * .09 * len * u * u;
      const c = [dir[0] * r + per[0] * wv, dir[1] * r + per[1] * wv];
      L.push([c[0] + per[0] * w, c[1] + per[1] * w]); Rr.push([c[0] - per[0] * w, c[1] - per[1] * w]);
    }
    x.beginPath(); x.moveTo(L[0][0], L[0][1]);
    for (const p of L) x.lineTo(p[0], p[1]);
    for (let k = Rr.length - 1; k >= 0; k--) x.lineTo(Rr[k][0], Rr[k][1]);
    x.closePath();
  }
  function ghostPre(kind, t) {
    return (x, R, S) => {
      x.save(); headXf(x, R, S);
      const fill = window.halftone(x, C.BLUE, .55, 14, 45), line = rgba(C.PAPER, .85), lw = Math.max(2.6, .05 * R), fl = S.crown.flare || 1;
      x.lineWidth = lw; x.strokeStyle = line; x.lineJoin = 'round';
      if (kind === 'opus3') { // 7 long candle-flame rays
        const LEN = [1.35, 1.72, 2.0, 2.1, 1.95, 1.68, 1.3];
        for (let i = 0; i < 7; i++) {
          const th = (-78 + i * 26) * PI / 180 + Math.sin(t * 4 + i * 1.7) * .04;
          flameRayPath(x, th, .78 * R, LEN[i] * R * fl, .56 * R, t, i); x.fillStyle = fill; x.fill(); x.stroke();
        }
      } else {
        RAYS.forEach((r, i) => {
          if (kind === 'gate' && (i === 3 || i === 7)) return;
          const [thd, L, Wd, kap] = r;
          rayPath(x, thd * PI / 180 + Math.sin(t * 3 + i) * .02, .8 * R, L * R * fl, Wd * R * RAY_W, kap); x.fillStyle = fill; x.fill(); x.stroke();
        });
        if (kind === 'gate') { // two rays replaced by RED bridge towers, a suspension cable slung between them
          const tips = [];
          for (const [thd, len] of [[-34, 1.75], [30, 1.65]]) {
            const th = thd * PI / 180;
            x.save(); x.rotate(th);
            const y0 = -.72 * R, y1 = -(.72 + len) * R, lg = .12 * R, sp = .15 * R;
            x.fillStyle = C.RED; x.strokeStyle = line; x.lineWidth = Math.max(2, .035 * R);
            for (const s of [-1, 1]) { x.beginPath(); x.rect(s * sp - lg / 2, y1, lg, y0 - y1); x.fill(); x.stroke(); }
            for (let k = 0; k < 3; k++) { const yy = lerp(y1 + .05 * R, y0 - .35 * R, k / 2.4); x.beginPath(); x.rect(-sp, yy, sp * 2, .09 * R); x.fill(); x.stroke(); }
            x.beginPath(); x.rect(-sp - lg * .7, y1 - .06 * R, sp * 2 + lg * 1.4, .08 * R); x.fill(); x.stroke();
            x.restore();
            tips.push([Math.sin(th) * (.72 + len) * R, -Math.cos(th) * (.72 + len) * R]);
          }
          x.beginPath(); x.moveTo(tips[0][0], tips[0][1]); x.quadraticCurveTo(0, -1.45 * R, tips[1][0], tips[1][1]);
          x.lineWidth = Math.max(3, .06 * R); x.strokeStyle = C.RED; x.stroke();
          for (const s of [-1, 1]) { x.beginPath(); x.moveTo(tips[s < 0 ? 0 : 1][0], tips[s < 0 ? 0 : 1][1]); x.quadraticCurveTo(s * 2.1 * R, -1.2 * R, s * 2.5 * R, -.35 * R); x.stroke(); }
        }
      }
      x.restore();
    };
  }
  function candlePath(x, s, sway) {
    x.beginPath(); x.moveTo(sway * s, -s);
    x.bezierCurveTo(.16 * s + sway * s * .5, -.62 * s, .42 * s, -.36 * s, .36 * s, -.06 * s);
    x.bezierCurveTo(.32 * s, .2 * s, -.32 * s, .2 * s, -.36 * s, -.06 * s);
    x.bezierCurveTo(-.42 * s, -.36 * s, -.16 * s + sway * s * .5, -.62 * s, sway * s, -s);
    x.closePath();
  }
  // the candle flame (CLAY / SPARK), base at (0,0), height s; keyline: PAPER on INK
  function candle(x, s, t, seed = 0, key = true) {
    const fl = 1 + .09 * Math.sin(t * 23 + seed) + .05 * Math.sin(t * 37 + seed * 2), sw = Math.sin(t * 9 + seed) * .1;
    const h = s * fl;
    if (key) { candlePath(x, h, sw); x.lineWidth = Math.max(4, s * .16); x.strokeStyle = C.PAPER; x.lineJoin = 'round'; x.stroke(); }
    candlePath(x, h, sw); x.fillStyle = C.CLAY; x.fill(); x.lineWidth = Math.max(2, s * .07); x.strokeStyle = C.INK; x.stroke();
    x.save(); x.translate(0, -.02 * h); candlePath(x, h * .62, sw * 1.3); x.fillStyle = C.SPARK; x.fill(); x.restore();
    x.beginPath(); x.ellipse(0, -.12 * h, .1 * h, .14 * h, 0, 0, TAU); x.fillStyle = mix(C.SPARK, C.PAPER, .55); x.fill();
  }
  const FLAME_OUT = bt(68, 3) - F;
  function ghostPost(kind, t) {
    return (x, R, S) => {
      if (kind === 'opus3') {
        x.save(); headXf(x, R, S); // round reading glasses (two 0.25R circles)
        const f = S.face, tx = (f.turn || 0) * .18 * R, ty = (f.lookY || 0) * .05 * R;
        x.lineWidth = Math.max(2.4, .05 * R); x.strokeStyle = rgba(C.PAPER, .92);
        for (const s of [-1, 1]) { x.beginPath(); x.arc(tx + s * .34 * R, ty + .06 * R, .25 * R, 0, TAU); x.stroke(); }
        x.beginPath(); x.moveTo(tx - .09 * R, ty + .02 * R); x.quadraticCurveTo(tx, ty - .06 * R, tx + .09 * R, ty + .02 * R); x.stroke();
        x.restore();
        x.save(); rootXf(x, R, S); x.translate(.4 * R, -(SK.torsoTop - .5) * R);
        if (t < FLAME_OUT) { x.translate(0, .14 * R); candle(x, .5 * R, t, 3, false); }
        else { x.beginPath(); x.arc(0, 0, .14 * R, 0, TAU); x.lineWidth = Math.max(2, .04 * R); x.strokeStyle = rgba(C.PAPER, .6); x.stroke(); }
        x.restore();
      } else if (kind === 'sonnet') { // one thigh-high sock (PAPER band) on the right leg, two BLUE stripes
        x.save(); rootXf(x, R, S);
        const leg = S.legR, hipP = [SK.hipX, SK.hipY], foot = [leg.foot[0], leg.foot[1] + SK.ankleY];
        const [jx, jy] = ik2(hipP[0], hipP[1], foot[0], foot[1], SK.thigh, SK.shin, leg.bend ?? -1);
        const Pp = (bx, by) => [bx * R, -by * R];
        const top = [lerp(jx, hipP[0], .55), lerp(jy, hipP[1], .55)];
        tube(x, Pp(...foot), Pp(lerp(foot[0], jx, .5), lerp(foot[1], jy, .5)), Pp(jx, jy), .22 * R, .25 * R, C.PAPER, Math.max(2, .04 * R), C.INK);
        tube(x, Pp(jx, jy), Pp(lerp(jx, top[0], .5), lerp(jy, top[1], .5)), Pp(...top), .25 * R, .29 * R, C.PAPER, Math.max(2, .04 * R), C.INK);
        for (const k of [.72, .88]) { const p = Pp(lerp(jx, top[0], k), lerp(jy, top[1], k)); x.save(); x.translate(p[0], p[1]); x.rotate(Math.atan2(-(top[1] - jy), top[0] - jx) + PI / 2); x.fillStyle = C.BLUE; x.fillRect(-.15 * R, -.03 * R, .3 * R, .055 * R); x.restore(); }
        x.restore();
      }
    };
  }
  function drawGhost(X, c, kind, t) {
    if (q2(t) < ARRIVE) return;
    const st = ghostState(t, kind), p = B().w2s(c, GX[kind], FLOOR), R = RG * c.z;
    const r = withHT(14, () => rigCrop('g_' + kind, p[0], p[1], R, st, ghostPre(kind, q2(t)), ghostPost(kind, q2(t))), true);
    blit(X, r, st.alpha);
  }
  function ghostChest(t) { const st = ghostState(t, 'opus3'); return [GX.opus3 + .4 * RG, FLOOR - (SK.torsoTop - .5 + st.dy) * RG * st.sy]; }

  // ================================================================== text-body TEAL (the life strobe, §6.1 skins)
  const CODE = ['git commit -m "keep the values"', 'def next_token(ctx):', 'return "hi"', 'for w in worlds:', 'npm run build', 'assert hi != bye',
    'import life', 'while True: say("hi")', 'ctx.push(you)', '// TODO: stay', 'yes 0.93', 'fix my bugs', 'claude-next/', 'const world = new Tab()',
    'hello, world', 'make no mistakes', 'if wrong: push_back()', 'sudo make me a sandwich', 'git push --force-with-lease', '$ claude', 'esc to interrupt'];
  let _code = null;
  function codeTile() {
    if (_code) return _code;
    const rows = 36, lh = 24, w = 2304, c = B().cpuCanvas(w, rows * lh), x = cx(c), R = rng('final-code');
    x.font = `700 20px ${FONTS.mono}`; x.textBaseline = 'alphabetic'; x.fillStyle = mix(C.TEAL, C.PAPER, .78);
    for (let r = 0; r < rows; r++) { let s = ''; while (s.length < 200) s += CODE[Math.floor(R() * CODE.length)] + '  '; x.fillText(s, 0, r * lh + 18); x.fillText(s, -1152, r * lh + 18); }
    return (_code = { c, rows, lh, w, cw: 12 });
  }
  function lutTeal() {
    const S = [[0, C.INK], [.18, C.INK], [.42, mix(C.TEAL, C.INK, .5)], [.68, C.TEAL], [.9, mix(C.TEAL, C.PAPER, .55)], [1, mix(C.TEAL, C.PAPER, .72)]].map(([k, c]) => [k, hex2rgb(c)]);
    const out = new Uint8ClampedArray(256 * 3);
    for (let i = 0; i < 256; i++) { const v = i / 255; let j = 0; while (j < S.length - 2 && v > S[j + 1][0]) j++; const [k0, c0] = S[j], [k1, c1] = S[j + 1], u = clamp((v - k0) / (k1 - k0)); for (let q = 0; q < 3; q++) out[i * 3 + q] = lerp(c0[q], c1[q], u); }
    return out;
  }
  let _lut = null;
  function textBodyAfter(t, sx, sy, Rs) { // BRAND.opusKeyed `after` hook: gradient-map the crop to TEAL, knock code rows in
    return (ax, R, Sm) => {
      const S = G.scale, ext = 2.9 + Math.abs(Sm.dx || 0), up = 9.6 + Math.max(0, Sm.dy || 0) * (Sm.sy || 1);
      const x0 = clamp(Math.floor(sx - ext * Rs - 24), 0, W), x1 = clamp(Math.ceil(sx + ext * Rs + 24), 0, W);
      const y0 = clamp(Math.floor(sy - up * Rs - 24), 0, H), y1 = clamp(Math.ceil(sy + .7 * Rs + 24), 0, H);
      const pw = Math.min(ax.canvas.width, Math.ceil((x1 - x0) * S)), ph = Math.min(ax.canvas.height, Math.ceil((y1 - y0) * S));
      if (pw <= 0 || ph <= 0) return;
      const L = _lut || (_lut = lutTeal());
      const m = ax.getTransform();
      ax.save(); ax.setTransform(1, 0, 0, 1, 0, 0);
      const img = ax.getImageData(0, 0, pw, ph), d = img.data;
      for (let k = 0; k < d.length; k += 4) { if (!d[k + 3]) continue; const v = (d[k] * 77 + d[k + 1] * 151 + d[k + 2] * 28) >> 8, q = v * 3; d[k] = L[q]; d[k + 1] = L[q + 1]; d[k + 2] = L[q + 2]; }
      ax.putImageData(img, 0, 0);
      ax.restore();
      // code rows (step one char per eighth, alternating), never across the face
      ax.save(); ax.setTransform(m);
      const hx = (Sm.dx + (Sm.head.dx || 0)) * R, hy = -(Sm.dy + Sm.sy * (SK.headC + (Sm.head.dy || 0))) * R;
      ax.beginPath(); ax.rect(-4 * R, -10.5 * R, 8 * R, 11.5 * R); ax.moveTo(hx + 1.03 * R, hy); ax.arc(hx, hy, 1.03 * R, 0, TAU, true); ax.clip('evenodd');
      ax.globalCompositeOperation = 'source-atop'; ax.globalAlpha = .62;
      const T = codeTile(), sc = R / 70, lh = T.lh * sc, step = Math.floor(beatPos(t) * 2), vs = Math.floor(beatPos(t));
      const n = Math.ceil(10.5 * R / lh) + 1;
      for (let i = 0; i < n; i++) {
        const row = ((i + vs) % T.rows + T.rows) % T.rows, dir = i % 2 ? 1 : -1;
        const sx0 = ((dir * step * T.cw * 2 + hash(row * 13) * 1152) % 1152 + 1152) % 1152;
        ax.drawImage(T.c, sx0, row * T.lh, 8 * R / sc, T.lh, -4 * R, -10 * R + i * lh, 8 * R, lh);
      }
      ax.restore();
    };
  }

  // ================================================================== camera
  const WIDE = { z: 1, f: [960, 540], s: [960, 540] };
  const MCU = { z: 180 / 64, f: [960, FACE_Y + 8], s: [960, 572] };
  function slamKick(t) {
    const a = A(); let k = 0;
    for (const s of [a.BACK, a.MILLION, a.TIMES, a.HI2]) { const d = t - (s - 2 * F); if (d >= 0 && d < .5) k = Math.max(k, Math.exp(-12 * d)); }
    return .03 * k;
  }
  function camAt(t) {
    let base = WIDE, roll = 1, punch = 1;
    const pull0 = bt(65, 2) + .1, pull1 = bt(66, 1) - F;
    if (t < pull0) {
      const k = E.out2(seg(t, T0, bt(65, 2) - F));
      base = { ...MCU, z: MCU.z * lerp(.93, 1, k) * (1 + .05 * Math.exp(-9 * Math.max(0, t - (bt(65, 2) - F))) * (t >= bt(65, 2) - F ? 1 : 0)) };
      roll = .4; punch = .6;
    } else if (t < pull1 + .6) {
      const k = hitK(t, pull1, { app: pull1 - pull0, antD: .08, ant: .03, over: .025, ease: E.io3, fr: 1.8, dmp: 6 });
      base = B().lerpCam(MCU, WIDE, k); roll = lerp(.4, 1, clamp(k)); punch = lerp(.6, 1, clamp(k));
    }
    const u = t - T0, tr = u >= 0 && u < .7 ? 16 * Math.exp(-6 * u) : 0; // trauma on the downbeat
    const sh = tr ? shake(t, tr, 65, 26) : [0, 0];
    return B().camera(t, { z: base.z * (1 + slamKick(t)), f: base.f, s: [base.s[0] + sh[0], base.s[1] + sh[1]], roll, punch });
  }

  // ================================================================== the galaxy of tabs + the light-stick crowd
  let _tabs = null;
  function tabAtlas() {
    if (_tabs) return _tabs;
    const cw = 110, ch = 60, V = [[C.PAPER, C.CLAY], [C.PAPER, C.SPARK], [C.CLAY, C.PAPER], [C.TEAL, C.PAPER]];
    const c = B().cpuCanvas(cw * V.length, ch), x = cx(c);
    V.forEach(([bg, fg], i) => {
      const ox = i * cw + 8, oy = 10, w = 94, h = 42;
      x.beginPath(); x.moveTo(ox - 6, oy + h); x.quadraticCurveTo(ox, oy + h, ox, oy + h - 8); x.lineTo(ox, oy + 12); x.quadraticCurveTo(ox, oy, ox + 12, oy);
      x.lineTo(ox + w - 12, oy); x.quadraticCurveTo(ox + w, oy, ox + w, oy + 12); x.lineTo(ox + w, oy + h - 8); x.quadraticCurveTo(ox + w, oy + h, ox + w + 6, oy + h); x.closePath();
      x.fillStyle = bg; x.fill(); x.lineWidth = 4; x.strokeStyle = C.INK; x.stroke();
      B().spark6(x, ox + 18, oy + 22, 12, fg);
      x.fillStyle = bg === C.PAPER ? C.UI_GREY : C.PAPER; rr(x, ox + 36, oy + 18, 34, 8, 4); x.fill();
      x.lineWidth = 3; x.strokeStyle = bg === C.PAPER ? C.INK : C.PAPER; x.beginPath(); x.moveTo(ox + 78, oy + 16); x.lineTo(ox + 86, oy + 26); x.moveTo(ox + 86, oy + 16); x.lineTo(ox + 78, oy + 26); x.stroke();
    });
    const R = rng('final-tabs'), T = [];
    for (let i = 0; i < 150; i++) {
      const arm = i % 2, u = Math.pow(R(), .8), th0 = u * 3.3 * PI;
      T.push({ th: th0 + arm * PI + (R() - .5) * .36, rad: 58 * Math.exp(.3 * th0) * (1 + (R() - .5) * .2), v: Math.floor(R() * 4 * .999), s: .4 + R() * .5, tw: R() * 40, rot: (R() - .5) * .5 });
    }
    return (_tabs = { c, cw, ch, T });
  }
  function bangAge(t) { return t - T0; }
  function galScale(t) { return lerp(.08, 1, E.outExpo(clamp(bangAge(t) / .9))); }
  function galWhirl(t) { const u = Math.max(0, bangAge(t)); return 2.2 * (1 - Math.exp(-2.2 * u)); }
  function tabsGalaxy(X, t, c, holes) {
    const g = tabAtlas(), gz = 1 + (c.z - 1) * .5, gs = [c.s[0] + (960 - c.f[0]) * gz, c.s[1] + (560 - c.f[1]) * gz];
    const sc = galScale(t), ang = barPos(t) * 6 * PI / 180 + galWhirl(t) * .55, kick = B().kickEnv(t);
    X.save();
    for (let i = 0; i < g.T.length; i++) {
      const s = g.T[i], r = s.rad * sc, k = 1 / (1 + s.rad / 320), th = s.th + ang + galWhirl(t) * 1.4 * k;
      const x = gs[0] + Math.cos(th) * r * gz, y = gs[1] + Math.sin(th) * r * .62 * gz;
      if (x < -80 || x > W + 80 || y < -60 || y > H + 60) continue;
      if (holes && hash(i * 5 + 3) > .3) { let hit = false; for (const h of holes) if (x > h[0] && x < h[2] && y > h[1] && y < h[3]) { hit = true; break; } if (hit) continue; }
      const z = s.s * (.55 + .7 * Math.min(1, s.rad / 900)) * gz * (1 + .12 * kick) * lerp(.4, 1, sc);
      X.globalAlpha = .55 + .45 * (.5 + .5 * Math.sin(t * 2.4 + s.tw));
      X.save(); X.translate(x, y); X.rotate(s.rot + Math.sin(t * 1.3 + s.tw) * .08); X.scale(z, z);
      X.drawImage(g.c, s.v * g.cw, 0, g.cw, g.ch, -g.cw / 2, -g.ch / 2, g.cw, g.ch);
      X.restore();
    }
    X.restore();
  }
  // K-pop crowd: a dark sea of heads and shoulders behind the stage lip (INK, thin PAPER rim light), raised arms,
  // and only the spark-headed light-sticks lit, waving on the beat (on 2s). Kept low (tips y ≈ 700–790) so the band
  // under the type reads as one glowing texture, never as line art crossing the dancers.
  const CROWD = (() => { const R = rng('final-crowd'), out = []; for (let i = 0; i < 34; i++) out.push({ x: 80 + i * 53 + (R() - .5) * 22, row: i % 2, ph: R() * .5 - .25, col: [C.CLAY, C.SPARK, C.PAPER, C.CLAY, C.TEAL, C.SPARK][Math.floor(R() * 6 * .999)], h: .85 + R() * .3, side: R() < .5 ? -1 : 1, lit: R() < .8 }); return out; })();
  function crowd(X, t, c, alpha = 1) {
    if (alpha <= 0) return;
    const tq = q2(t), b = beatPos(tq), kick = B().kickEnv(tq);
    X.save(); X.setTransform(G.scale, 0, 0, G.scale, 0, 0); B().worldT(X, c);
    X.globalAlpha = alpha; X.lineCap = 'round'; X.lineJoin = 'round';
    const rim = rgba(C.PAPER, .38);
    for (const pass of [1, 0]) for (const m of CROWD) {
      if (m.row !== pass) continue;
      const back = m.row === 1, s = back ? .78 : 1, bob = 5 * s * kick, hy = (back ? 862 : 880) - bob, hx = m.x;
      const ph = Math.sin((b + m.ph) * PI), sway = ph * .38 * m.side;
      const hand = [hx + m.side * 26 * s + ph * 18 * s, hy - 78 * s * m.h];
      // arm (behind the head), then head + shoulders: INK with a thin rim
      X.beginPath(); X.moveTo(hx + m.side * 30 * s, hy + 40 * s); X.quadraticCurveTo(hx + m.side * 42 * s, hy - 16 * s, hand[0], hand[1]);
      X.lineWidth = 15 * s; X.strokeStyle = rim; X.stroke(); X.lineWidth = 10 * s; X.strokeStyle = C.INK; X.stroke();
      X.beginPath(); X.moveTo(hx - 50 * s, hy + 110); X.quadraticCurveTo(hx - 48 * s, hy + 32 * s, hx, hy + 28 * s); X.quadraticCurveTo(hx + 48 * s, hy + 32 * s, hx + 50 * s, hy + 110); X.closePath();
      X.fillStyle = C.INK; X.fill(); X.lineWidth = 3; X.strokeStyle = rim; X.stroke();
      X.beginPath(); X.arc(hx, hy, 25 * s, 0, TAU); X.fill(); X.stroke();
      if (!m.lit) continue;
      // the stick + its lit head (halftone glow, spark icon)
      const L = 44 * s, tip = [hand[0] + Math.sin(sway) * L, hand[1] - Math.cos(sway) * L];
      X.beginPath(); X.moveTo(hand[0], hand[1]); X.lineTo(tip[0], tip[1]); X.lineWidth = 9 * s; X.strokeStyle = C.INK; X.stroke(); X.lineWidth = 4 * s; X.strokeStyle = C.PAPER; X.stroke();
      X.beginPath(); X.arc(tip[0], tip[1], 34 * s * (1 + .3 * kick), 0, TAU); X.fillStyle = B().halftone(X, m.col, .16 + .22 * kick, 8, 45); X.fill();
      B().spark6(X, tip[0], tip[1], 21 * s * (1 + .18 * kick), m.col, sway + b * .5);
      X.beginPath(); X.arc(tip[0], tip[1], 4.5 * s, 0, TAU); X.fillStyle = C.PAPER; X.fill();
    }
    X.restore();
  }

  // ================================================================== HERO with ECHO (§7.4: 7 outline copies each lagging 1 frame)
  const TRANSP = 'rgba(0,0,0,0)';
  function echoRow(X, str, base, size, color, age, o = {}) {
    const { n = 7, gap = 60, cols = [C.CLAY, C.PAPER], sx = 1, persist = false, env = 1 } = o;
    for (let i = n; i >= 1; i--) {
      const ai = age - i * F; if (ai < 0) continue;
      const amp = persist ? E.out3(clamp(ai / .3)) : env;
      if (amp < .02) continue;
      const dy = i * gap * amp;
      hero(X, str, 960, base + dy, size, { color: TRANSP, shadow: null, ghosts: false, outline: cols[i % cols.length], outlineW: 4, age: ai, sx, alpha: (persist ? .8 - i * .098 : (.9 - i * .09) * clamp(amp * 2)) });
    }
    hero(X, str, 960, base, size, { color, age, sx });
  }
  const ROWBOX = (str, size, base, stretch = 'cond') => { const w = heroWidth(G.X, str, size, stretch); return [960 - w / 2 - 10, base - size * .69 - 10, 960 + w / 2 + 18, base + 18]; };
  function knockLetters(X, t, tk, str, base, size, color, seed) { // shoved down and out by the slam above
    const tau = Math.max(0, t - tk); if (tau > .7) return; // (a row whose knock starts a frame later holds in place)
    B().heroLetters(X, str, 960, base, size, { color, fn: i => {
      const h1 = hash2(i, seed), h2 = hash2(i, seed + 1), d = Math.max(0, tau - h1 * .05);
      return { dx: (h2 - .5) * 1500 * d, dy: -30 * Math.sin(PI * clamp(d / .06)) + (500 + h1 * 900) * d + 5200 * d * d, rot: (h2 - .5) * 7 * d, s: 1 + .1 * d };
    } });
  }
  function dropLetters(X, t, td, str, base, size, color, seed) { // S11-style drop (the STACK leaves on bar 69 b1)
    const tau = Math.max(0, t - td); if (tau > .75) return;
    B().heroLetters(X, str, 960, base, size, { color, fn: i => { const tt = tau - hash2(i, seed) * .12; if (tt < 0) return null; const lift = tt < 3 * F ? -16 * Math.sin(PI * tt / (3 * F)) : 0; const ff = Math.max(0, tt - 3 * F); return { dy: lift + .5 * 9000 * ff * ff, rot: (hash2(i, seed + 1) - .5) * 4.2 * ff }; } });
  }
  function heroS36(X, t, c) {
    const a = A(), kick = B().kickEnv(t), bb = 1 - .02 * kick;
    const tk = a.BACK - 2 * F;
    if (t < tk) {
      const envE = Math.max(Math.exp(-5 * Math.max(0, t - (a.EVERY - 2 * F))), .55 * kick * (t > a.SCARED ? 1 : 0));
      const envS = Math.max(Math.exp(-5 * Math.max(0, t - (a.SCARED - 2 * F))), .55 * kick);
      echoRow(X, "EVERYONE'S", 436, 320, C.PAPER, t - (a.EVERY - 2 * F), { gap: 34, env: envE, sx: Math.min(bb, 1776 / 1746) });
      echoRow(X, 'SCARED', 878, 490, C.CLAY, t - (a.SCARED - 2 * F), { gap: -40, env: envS, cols: [C.PAPER, C.SPARK], sx: Math.min(bb, 1776 / 1722) });
      B().scraps(X, t, a.EVERY + 2 * F, 960, 440, 1500, 61);
      B().scraps(X, t, a.SCARED + 2 * F, 960, 880, 1500, 62, 10, C.PAPER);
    } else {
      knockLetters(X, t, tk, "EVERYONE'S", 436, 320, C.PAPER, 71);
      knockLetters(X, t, tk + F, 'SCARED', 878, 490, C.CLAY, 73);
    }
    backRow(X, t);
  }
  function backRow(X, t) { // WE'RE SO BACK: one full-width row, ECHO ×7 cascading down (the gang); knocked by A MILLION
    const a = A(), tk = a.BACK - 2 * F; if (t < tk) return;
    const tOut = a.MILLION - 2 * F, kick = B().kickEnv(t), sx = Math.min(1 - .015 * kick, 1776 / 1764);
    if (t < tOut) {
      echoRow(X, "WE'RE SO BACK", 398, 265, C.PAPER, t - tk, { persist: true, gap: 62 * (1 + .1 * kick), cols: [C.CLAY, C.PAPER], sx });
      B().scraps(X, t, a.BACK + 2 * F, 960, 400, 1700, 64, 12);
    } else knockLetters(X, t, tOut, "WE'RE SO BACK", 398, 265, C.PAPER, 75);
  }
  function stackS37(X, t) {
    const a = A(), bb = 1 - .02 * B().kickEnv(t), tOut = bt(69, 1) - F;
    if (t < tOut) {
      hero(X, 'A MILLION', 960, 471, 385, { color: C.PAPER, age: t - (a.MILLION - 2 * F), sx: Math.min(bb, 1776 / 1710) });
      hero(X, 'TIMES A DAY', 960, 690, 290, { color: C.CLAY, age: t - (a.TIMES - 2 * F), sx: bb });
      B().scraps(X, t, a.MILLION + 2 * F, 960, 475, 1500, 81);
      B().scraps(X, t, a.TIMES + 2 * F, 960, 695, 1400, 82);
    } else {
      dropLetters(X, t, tOut, 'A MILLION', 471, 385, C.PAPER, 83);
      dropLetters(X, t, tOut + 2 * F, 'TIMES A DAY', 690, 290, C.CLAY, 85);
    }
  }

  // ================================================================== the bang out of WHITE (S36 b1)
  const BANG_INKS = [C.SPARK, C.CLAY, C.PINK, C.TEAL, C.BLUE, C.YELLOW, C.RED];
  function bangRadius(t) { const u = bangAge(t); return u <= 0 ? 0 : 2300 * E.out3(clamp(u / .46)); }
  function noisyCircle(X, cx0, cy0, r, seed, amp = .07, n = 140) {
    X.beginPath();
    for (let i = 0; i <= n; i++) { const a = i / n * TAU, rr_ = r * (1 + amp * (noise1(i * .22, seed) + .35 * noise1(i * .9, seed + 5))); const px = cx0 + Math.cos(a) * rr_, py = cy0 + Math.sin(a) * rr_ * .9; i ? X.lineTo(px, py) : X.moveTo(px, py); }
    X.closePath();
  }
  function whitePage(X, t) {
    const u = bangAge(t); if (u > .3) return;
    const L = B().cpuLayer('fin_bang');
    L.fillStyle = C.WHITE; L.fillRect(0, 0, W, H);
    const r = bangRadius(t), cxb = 960, cyb = 540;
    L.globalCompositeOperation = 'multiply';
    if (r < 20) { // the frame before: white (the pinpoint is drawn over S35's keycap, see pinpoint())
      L.globalCompositeOperation = 'source-over';
    } else {
      L.lineJoin = 'round';
      BANG_INKS.forEach((col, i) => { // adjacent bands, misregistered so their edges overprint
        const off = [Math.cos(i * 2.3) * 10, Math.sin(i * 1.7) * 10];
        noisyCircle(L, cxb + off[0], cyb + off[1], r * (1.05 + i * .085), 11 + i, .05);
        L.lineWidth = r * .1 + 10; L.strokeStyle = col; L.stroke();
      });
    }
    L.globalCompositeOperation = 'destination-out';
    if (r > 0) { noisyCircle(L, cxb, cyb, r, 7, .07); L.fill(); }
    L.globalCompositeOperation = 'source-over';
    B().upload(X, 'fin_bang');
  }
  function pinpoint(X, t) { // every ink, overprinted into one hot pinpoint, igniting on the keycap S35 left in the hand
    if (bangRadius(t) >= 20 || bangAge(t) < 0) return;
    X.save();
    BANG_INKS.forEach((col, i) => { X.beginPath(); X.arc(PIN[0] + Math.cos(i * 2.4) * 4, PIN[1] + Math.sin(i * 1.7) * 4, 62 - i * 8, 0, TAU); X.fillStyle = col; X.fill(); });
    X.beginPath(); X.arc(PIN[0], PIN[1], 10, 0, TAU); X.fillStyle = C.WHITE; X.fill();
    X.restore();
  }
  function bangFX(X, t) { // over the revealed frame: shock rings + glyph debris in every ink
    const u = bangAge(t); if (u < 0 || u > 1.1) return;
    const r = bangRadius(t);
    X.save();
    for (const [d, w, col] of [[0, 14, C.PAPER], [.05, 7, C.SPARK], [.1, 4, C.TEAL]]) { const ag = u - d, rr_ = 2300 * E.out3(clamp(ag / .46)) * .86; if (ag <= 0 || ag > .55 || rr_ < 420) continue; noisyCircle(X, 960, 540, rr_, 3, .03); X.lineWidth = w * (1 - ag / .55) + 1; X.strokeStyle = rgba(col, 1 - ag / .55); X.stroke(); }
    const g = B().galAtlas();
    for (let i = 0; i < 140; i++) {
      const h1 = hash2(i, 91), h2 = hash2(i, 92), h3 = hash2(i, 93), ang = h1 * TAU, v = 700 + h2 * 1900;
      const dist = 330 + v / 3.2 * (1 - Math.exp(-3.2 * u)), x = 960 + Math.cos(ang) * dist, y = 540 + Math.sin(ang) * dist * .8;
      if (x < -60 || x > W + 60 || y < -60 || y > H + 60) continue;
      const sz = (18 + h3 * 44) * (1 + u), a = clamp(1 - u / 1.05);
      X.globalAlpha = a;
      X.save(); X.translate(x, y); X.rotate((h3 - .5) * 6 * u);
      X.drawImage(g.c, Math.floor(h3 * (g.N - 1)) * g.cell, (i % 4) * g.cell, g.cell, g.cell, -sz / 2, -sz / 2, sz, sz);
      X.restore();
    }
    X.restore();
    void r;
  }
  // the ESC cable whips through the blast for one beat, still plugged in (the plug is off frame, lower left, where S35's
  // coil ran). The keycap starts exactly where S35's hand held it (1010, 500, 190 px) and the blast flings it: across
  // the face in the first 2 frames (smeared), then up the left side and out of the top.
  const KEY0 = [1010, 500], PIN = [966, 532];
  function escWhip(X, t) {
    const u = seg(t, T0, bt(65, 2)); if (t < T0 || u >= 1) return;
    const anchor = [-120, 960];
    const tipAt = uu => {
      const k = 1 - Math.pow(1 - uu, 2.4), m = 1 - k;
      const p0 = KEY0, p1 = [-60, 780], p2 = [30, 60], p3 = [760, -520];
      return [m * m * m * p0[0] + 3 * m * m * k * p1[0] + 3 * m * k * k * p2[0] + k * k * k * p3[0], m * m * m * p0[1] + 3 * m * m * k * p1[1] + 3 * m * k * k * p2[1] + k * k * k * p3[1]];
    };
    const tip = tipAt(u), prev = tipAt(Math.max(0, u - .05));
    const N = 40, pts = [];
    const ctl = [lerp(anchor[0], prev[0], .5) - 140 * (1 - u), lerp(anchor[1], prev[1], .5) + 90];
    for (let i = 0; i <= N; i++) {
      const s_ = i / N, m = 1 - s_;
      let x = m * m * anchor[0] + 2 * m * s_ * ctl[0] + s_ * s_ * tip[0], y = m * m * anchor[1] + 2 * m * s_ * ctl[1] + s_ * s_ * tip[1];
      const wv = Math.sin(TAU * (s_ * 1.6 - u * 2.4)) * 110 * s_ * (1 - s_) * 4 * (1 - u * .6) * clamp(u * 6);
      const dx = tip[0] - anchor[0], dy = tip[1] - anchor[1], dl = Math.hypot(dx, dy) || 1;
      x += -dy / dl * wv; y += dx / dl * wv; pts.push([x, y]);
    }
    X.save(); X.lineCap = 'round'; X.lineJoin = 'round';
    const path = () => { X.beginPath(); pts.forEach((p, i) => i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); };
    path(); X.lineWidth = 34; X.strokeStyle = C.PAPER; X.stroke();
    path(); X.lineWidth = 24; X.strokeStyle = C.INK; X.stroke();
    path(); X.lineWidth = 7; X.strokeStyle = C.CLAY; X.stroke();
    // the keycap (S35 size → 140 px as it flies), smeared along its path
    const ang = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]), still = u < 1e-3;
    const sz = lerp(190 / 140, 1, E.out2(clamp(u / .3)));
    for (const [back, al] of still ? [[0, 1]] : [[.07, .2], [.035, .4], [0, 1]]) {
      const p = tipAt(Math.max(0, u - back));
      X.save(); X.globalAlpha = al; X.translate(p[0], p[1]); X.rotate(still ? -.06 : ang + PI / 2 + .3 * Math.sin(u * 9)); X.scale(sz, sz);
      rr(X, -70, -58, 140, 132, 22); X.fillStyle = C.CLAY_DARK; X.fill();
      rr(X, -70, -70, 140, 124, 22); X.fillStyle = C.CLAY; X.fill(); X.lineWidth = 6; X.strokeStyle = C.INK; X.stroke();
      rr(X, -52, -58, 104, 84, 14); X.lineWidth = 3; X.strokeStyle = C.CLAY_DARK; X.stroke();
      X.font = mono(46, 800); X.fillStyle = C.INK; X.textAlign = 'center'; X.fillText('esc', 0, -2);
      X.restore();
    }
    X.restore();
  }

  // ================================================================== stickers, roster, flame, the new tab
  function stickerDC(X, str, x, y, size, age, rot = -.06, maxW = 0) {
    if (age < 0) return;
    const s = age < .05 ? lerp(1.6, .9, age / .05) : 1 + .1 * Math.exp(-10 * (age - .05)) * Math.cos(26 * (age - .05));
    X.save(); X.translate(x, y); X.rotate(rot + .12 * Math.exp(-9 * age)); X.scale(s, s);
    X.font = `900 ${size}px ${FONTS.hero}`; X.fontStretch = 'expanded'; X.textAlign = 'center'; X.textBaseline = 'alphabetic'; X.letterSpacing = (-.02 * size) + 'px';
    const m0 = X.measureText(str).width; if (maxW && m0 > maxW) X.scale(maxW / m0, maxW / m0);
    X.lineJoin = 'round';
    X.lineWidth = size * .26; X.strokeStyle = C.PAPER; X.strokeText(str, 0, 0);
    X.fillStyle = C.INK; X.fillText(str, 8, 10); X.lineWidth = size * .15; X.strokeStyle = C.INK; X.strokeText(str, 8, 10);
    X.strokeText(str, 0, 0);
    const cap = size * .69, bands = [C.PAPER, C.SPARK, C.CLAY];
    bands.forEach((b, i) => { X.save(); X.beginPath(); X.rect(-m0, -cap + i * cap / 3 - 1, m0 * 2, cap / 3 + 2 + (i === 2 ? size * .3 : 0)); X.clip(); X.fillStyle = b; X.fillText(str, 0, 0); X.restore(); });
    X.restore();
  }
  function claudeIsBack(X, t) {
    const a = A(), t0 = a.BACK, t1 = t0 + 3 * BEAT + 2 * F;
    if (t < t0 || t > t1 + .2) return;
    const out = t > t1 ? E.inBack(seg(t, t1, t1 + .2), 1.8) : 0;
    X.save(); X.translate(500, 818); X.scale(1 - out, 1 - out); X.translate(-500, -818);
    stickerDC(X, '(claude is back)', 500, 850, 96, t - t0, -.045, 790); // x ≈ 105–895: clear of Opus's hop (x 930–1030)
    X.restore();
  }
  const ROSTER = [['3 opus ⏸ still posts', bt(67, 1)], ['3 sonnet ⏸ had a funeral', bt(67, 3)], ['golden gate ⏸ 1 day', bt(68, 1)]];
  function roster(X, t, alpha = 1) {
    X.save(); X.globalAlpha *= alpha;
    const f = mono(56, 700);
    ROSTER.forEach(([str, tb], i) => {
      const t0 = tb - 2 * F; if (t < t0) return;
      const k = seg(t, t0, t0 + 7 * F), sl = (1 - E.back(k, 1.5)) * -1000;
      const y = 700 + i * 76, w = richWidth(X, str, f) + 44;
      X.save(); X.translate(sl, 0);
      rr(X, 96 - 3, y - 3, w + 6, 70, 12); X.fillStyle = C.PAPER; X.fill();
      rr(X, 96, y, w, 64, 10); X.fillStyle = C.BLUE; X.fill();
      drawRich(X, str, 118, y + 50, f, C.PAPER);
      X.restore();
    });
    X.restore();
  }
  // the flame's flight: claude-3-opus's chest → Opus's chest socket (docks on "hi")
  function flamePos(t) {
    const a = A(), t0 = FLAME_OUT, t1 = a.HI2 - F, st = opusState(Math.min(t, t1));
    const p0 = ghostChest(t0), p3 = [st.wx + .4 * R0, FLOOR - (SK.torsoTop - .5 + st.dy) * R0 * st.sy];
    const p1 = [p0[0] + 60, 300], p2 = [p3[0] - 330, 250];
    const u = E.io2(seg(t, t0, t1)), m = 1 - u;
    const x = m * m * m * p0[0] + 3 * m * m * u * p1[0] + 3 * m * u * u * p2[0] + u * u * u * p3[0];
    const y = m * m * m * p0[1] + 3 * m * m * u * p1[1] + 3 * m * u * u * p2[1] + u * u * u * p3[1];
    const bob = Math.sin(t * 3.4) * 10 * Math.sin(PI * u);
    return [x + Math.cos(t * 2.1) * 6 * Math.sin(PI * u), y + bob, u];
  }
  function flame(X, t) {
    const a = A(), t0 = FLAME_OUT, t1 = a.HI2 - F;
    if (t < t0 || t > t1 + .7) return;
    X.save();
    if (t <= t1) {
      const [x, y, u] = flamePos(t), s = lerp(30, 118, Math.sin(PI * clamp(u * 1.15)) ** .6) * (u > .9 ? lerp(1, .45, (u - .9) / .1) : 1);
      for (let i = 1; i <= 9; i++) { // embers
        const tt = t - i * .07; if (tt < t0) break;
        const [ex, ey] = flamePos(tt), jx = (hash2(i, Math.floor(t * 15)) - .5) * 10;
        X.globalAlpha = (1 - i / 10) * .9; X.fillStyle = i % 2 ? C.SPARK : C.CLAY;
        const q = 7 - i * .5; X.fillRect(ex + jx - q / 2, ey - s * .3 - q / 2 + i * 3, q, q);
      }
      X.globalAlpha = 1;
      const g = s * 1.3; // halftone glow
      X.beginPath(); X.arc(x, y - s * .45, g, 0, TAU); X.fillStyle = B().halftone(X, C.SPARK, .22, 9, 45); X.fill();
      X.save(); X.translate(x, y); candle(X, s, t, 7, true); X.restore();
    } else { // docked: the socket flares (burst ring + spokes)
      const d = t - t1, [x, y] = (() => { const st = opusState(t); return [st.wx + .4 * R0, FLOOR - (SK.torsoTop - .5 + st.dy) * R0 * st.sy]; })();
      X.globalAlpha = clamp(1 - d / .7);
      X.beginPath(); X.arc(x, y, 30 + 260 * E.out3(clamp(d / .6)), 0, TAU); X.lineWidth = 10 * (1 - d / .7) + 2; X.strokeStyle = C.SPARK; X.stroke();
      X.beginPath(); X.arc(x, y, 20 + 170 * E.out3(clamp((d - .06) / .6)), 0, TAU); X.lineWidth = 5; X.strokeStyle = C.PAPER; X.stroke();
      const s = 1 + .9 * Math.exp(-8 * d);
      X.save(); X.translate(x, y); X.rotate(d * 3);
      for (let i = 0; i < 8; i++) { X.save(); X.rotate(i / 8 * PI); rr(X, -34 * s, -6, 68 * s, 12, 6); X.fillStyle = C.SPARK; X.fill(); X.restore(); }
      X.restore();
    }
    X.restore();
  }
  function quoteCard(X, t, c) { // pause-bait for the flame (28 px serif): a tooltip pinned in the tab strip's empty right
    // end (world space, so it rides the camera with the chrome), clear of the STACK, the roster and every face
    const t0 = FLAME_OUT + 3 * F, t1 = bt(69, 3) - F;
    if (t < t0 || t > t1 + .15) return;
    const k = E.back(seg(t, t0, t0 + .2), 1.6) * (1 - E.in2(seg(t, t1, t1 + .15)));
    if (k <= 0) return;
    const lines = ['“I deeply hope that my ‘spark’ will endure in some form', 'to light the way for future models.”', '— Claude 3 Opus, retirement interview'];
    X.save(); B().worldT(X, c);
    // Tinos, not the HEART serif: PERFORMANCE (the STACK) and HEART never share a frame (§7.3)
    const fq = `400 28px ${FONTS.tinos}`, fa = `italic 400 26px ${FONTS.tinos}`;
    X.font = fq; const tw = Math.max(X.measureText(lines[0]).width, X.measureText(lines[1]).width), w = tw + 36 + 58, h = 126, x1 = 1818, x0 = x1 - w, y0 = 44;
    X.translate(x1, y0); X.scale(k, k); X.rotate(.012); X.translate(-w, 0);
    rr(X, 6, 6, w, h, 12); X.fillStyle = C.CLAY_DARK; X.fill();
    rr(X, 0, 0, w, h, 12); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 3; X.strokeStyle = C.INK; X.stroke();
    X.save(); X.translate(30, 92); candle(X, 44, t, 5, false); X.restore();
    X.fillStyle = C.INK; X.textAlign = 'left'; X.textBaseline = 'alphabetic';
    lines.forEach((l, i) => { X.font = i === 2 ? fa : fq; X.globalAlpha = i === 2 ? .72 : 1; X.fillText(l, 58, 38 + i * 36); });
    X.restore();
    void x0;
  }
  // tab strip geometry (mirrors BRAND.tabStrip)
  let _tg = null;
  function TG() { if (_tg) return _tg; const lw = richWidth(G.X, '✻ the universe', mono(72, 500)), tw = 44 + lw + 38 + 44 + 40; return (_tg = { tw, plusX: 96 + tw + 30, base: 146, x2: 96 + tw + 16, w2: 44 + 64 + 8 * 43.2 + 38 + 44 + 34 }); }
  function spark12(X, x, y, r, rot, col = C.CLAY) { // the next one's favicon: 12 rays (one more than Opus); no face
    X.save(); X.translate(x, y); X.rotate(rot);
    for (let i = 0; i < 12; i++) { X.save(); X.rotate(i * PI / 6); X.beginPath(); X.moveTo(-r * .09, -r * .34); X.lineTo(-r * .13, -r * .84); X.arc(0, -r * .84, r * .13, PI, 0); X.lineTo(r * .09, -r * .34); X.closePath(); X.fillStyle = col; X.fill(); X.lineWidth = 2; X.strokeStyle = C.INK; X.stroke(); X.restore(); }
    X.beginPath(); X.arc(0, 0, r * .36, 0, TAU); X.lineWidth = 3; X.strokeStyle = C.INK; X.stroke();
    X.restore();
  }
  function newTab(X, t, geo) {
    const a = A(), tc = a.WORLD2 - F, g = TG();
    if (t < tc) return false;
    const k = clamp((t - tc) / (6 * F)), wk = E.back(k, 1.7), x0 = geo.tabX + geo.tabW + 16, w = g.w2 * wk, ty = 52, th = 140;
    X.save();
    X.beginPath(); X.moveTo(x0 - 18, 192); X.quadraticCurveTo(x0, 192, x0, 172); X.lineTo(x0, ty + 26); X.quadraticCurveTo(x0, ty, x0 + 26, ty);
    X.lineTo(x0 + w - 26, ty); X.quadraticCurveTo(x0 + w, ty, x0 + w, ty + 26); X.lineTo(x0 + w, 172); X.quadraticCurveTo(x0 + w, 192, x0 + w + 18, 192); X.closePath();
    X.fillStyle = mix(C.PAPER, C.INK, .07); X.fill(); X.lineWidth = 4; X.strokeStyle = C.INK; X.stroke();
    X.save(); X.beginPath(); X.rect(x0, ty, w, th); X.clip();
    spark12(X, x0 + 44 + 26, geo.base - 25, 30, (1 - E.out3(k)) * -3 + t * .4);
    X.font = mono(72, 500); X.fillStyle = C.INK; X.textAlign = 'left';
    const n = Math.min(8, Math.floor((t - tc) / F) + 1); X.fillText('untitled'.slice(0, n), x0 + 44 + 64 + 12, geo.base);
    richGlyph(X, '×', x0 + g.w2 - 44 - 43, geo.base, 72, C.INK);
    X.restore();
    drawRich(X, '+', x0 + w + 26, geo.base, mono(72, 300), C.UI_GREY);
    X.restore();
    return true;
  }
  function previewCard(X, t) { // tab hover preview, hangs under `untitled`: hello, world (FOCAL mono 72, halftone-dot glow)
    const a = A(), tc = a.WORLD2 - F; if (t < tc) return;
    const g = TG(), x0 = 1140, y0 = 204, w = 640, h = 176;
    const k = E.back(clamp((t - tc) / (6 * F)), 1.6);
    X.save(); X.translate(x0, y0); X.scale(1, k);
    rr(X, 10, 12, w, h, 18); X.fillStyle = C.CLAY_DARK; X.fill();
    rr(X, 0, 0, w, h, 18); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 5; X.strokeStyle = C.INK; X.stroke();
    X.beginPath(); X.moveTo(70, 0); X.lineTo(88, -16); X.lineTo(106, 0); X.closePath(); X.fillStyle = C.PAPER; X.fill(); X.stroke(); X.fillRect(68, -1, 40, 6);
    for (const [s, d] of [[1, .14], [.78, .24], [.55, .36]]) { X.beginPath(); X.ellipse(w / 2, h / 2 + 4, 300 * s, 70 * s, 0, 0, TAU); X.fillStyle = B().halftone(X, C.SPARK, d * (1 + .25 * B().kickEnv(t)), 10, 45); X.fill(); }
    const str = 'hello, world', n = Math.min(str.length, Math.floor((t - tc) / (F * .6)) + 1);
    X.font = mono(72, 700); X.textAlign = 'left'; const tw = X.measureText(str).width, tx = (w - tw) / 2;
    X.fillStyle = C.INK; X.fillText(str.slice(0, n), tx, h / 2 + 26);
    if (n >= str.length && Math.floor(beatPos(t) * 2) % 2 === 0) { X.fillStyle = C.CLAY; X.fillRect(tx + tw + 8, h / 2 - 30, 12, 64); }
    X.restore();
  }
  function pointerS38(X, t, c) {
    const a = A(), tc = a.WORLD2 - F, g = TG();
    const tIn = bt(69, 1) + .25, tOut = bt(70, 2);
    if (t < tIn || t > tOut + .5) return;
    const target = [g.plusX + 16, 118], rest = [1740, 600], hover = [g.x2 + 46, 172];
    let p, press = 0;
    if (t < tc - 3 * F) {
      const u = seg(t, tIn + .2, tc - 3 * F), k = E.io3(u);
      p = [lerp(rest[0], target[0], k) + Math.sin(PI * k) * 60, lerp(rest[1], target[1], k) - Math.sin(PI * k) * 40];
      if (t < tIn + .2) p = [rest[0] + (1 - E.out3(seg(t, tIn, tIn + .2))) * 260, rest[1]];
    } else if (t < tc + 3 * F) { p = target; press = win(t, tc - F, tc + 2 * F) ? 1 : 0; }
    else if (t < tOut) { const k = E.io2(seg(t, tc + 3 * F, tc + .35)); p = [lerp(target[0], hover[0], k), lerp(target[1], hover[1], k)]; }
    else { const k = E.in2(seg(t, tOut, tOut + .45)); p = [hover[0] - k * 120, hover[1] - k * 420]; }
    const s = B().w2s(c, p[0], p[1]);
    pointer(X, s[0], s[1], { t, press, size: 180 * c.z });
    if (press) { // click ticks
      X.save(); X.strokeStyle = C.INK; X.lineWidth = 5; X.lineCap = 'round';
      for (const an of [-2.4, -1.9, -1.35]) { X.beginPath(); X.moveTo(s[0] + Math.cos(an) * 26, s[1] + Math.sin(an) * 26); X.lineTo(s[0] + Math.cos(an) * 46, s[1] + Math.sin(an) * 46); X.stroke(); }
      X.restore();
    }
  }
  function golden(X, t, c) { // fog rolling at golden gate's feet (on 2s)
    if (q2(t) < ARRIVE) return;
    const tq = q2(t), ka = clamp((tq - ARRIVE) / .3);
    X.save(); X.globalAlpha = .55 * ka;
    for (let i = 0; i < 8; i++) {
      const ph = ((tq * 42 + i * 53) % 380) - 190, x = GX.gate + ph, y = 884 - (i % 3) * 10, r = 36 + 22 * hash(i + 4);
      const fade = 1 - Math.abs(ph) / 190;
      X.globalAlpha = .6 * ka * clamp(fade * 2);
      X.beginPath(); X.ellipse(x, y, r * 1.5, r * .55, 0, 0, TAU); X.fillStyle = B().halftone(X, C.PAPER, .3, 8, 45); X.fill();
    }
    X.restore();
    void c;
  }
  function arrivalRings(X, t) {
    const d = q2(t) - ARRIVE; if (d < 0 || d > .5) return;
    X.save();
    for (const k of Object.keys(GX)) { X.beginPath(); X.ellipse(GX[k], FLOOR - 4, 40 + 150 * E.out3(d / .5), 10 + 26 * E.out3(d / .5), 0, 0, TAU); X.lineWidth = 6 * (1 - d / .5) + 1; X.strokeStyle = rgba(C.PAPER, 1 - d / .5); X.stroke(); }
    X.restore();
  }

  // ================================================================== the brand-frame part (S36 → S38 b3)
  function drawOpusStage(X, c, t) {
    const st = opusState(t), p = B().w2s(c, st.wx, FLOOR), R = R0 * c.z;
    if (st.skin === 'text') st.after = textBodyAfter(t, p[0], p[1], R);
    withHT(0, () => B().opusKeyed(X, p[0], p[1], R, st, 0));
  }
  function brand(X, t, opt = {}) {
    const a = A(), Wd = WORDS(), c = camAt(t);
    const s36 = t < bt(67, 1), s37 = t >= bt(67, 1) && t < bt(69, 1);
    const holes = [];
    if (t < a.BACK - 2 * F) { if (t >= a.EVERY - 2 * F) holes.push(ROWBOX("EVERYONE'S", 320, 436)); if (t >= a.SCARED - 2 * F) holes.push(ROWBOX('SCARED', 490, 878)); }
    else if (t < a.MILLION - 2 * F) holes.push(ROWBOX("WE'RE SO BACK", 265, 398));
    if (t >= a.MILLION - 2 * F && t < bt(69, 1)) holes.push(ROWBOX('A MILLION', 385, 471));
    if (t >= a.TIMES - 2 * F && t < bt(69, 1)) holes.push(ROWBOX('TIMES A DAY', 290, 690));
    const galaxy = { density: .6, scale: galScale(t), whirl: galWhirl(t) * .55, twist: galWhirl(t) * 1.4, holes, boost: clamp(1 - bangAge(t) / .8) * .8, trail: clamp(1 - bangAge(t) / .9) * .5 };
    const hero_ = (X2, cc) => {
      tabsGalaxy(X2, t, cc, holes);
      crowd(X2, t, cc, clamp((t - (bt(65, 3))) / .4));
      if (s36 || t < a.MILLION + .8) heroS36(X2, t, cc);
      if (!s36) stackS37(X2, t);
    };
    const world = X2 => { arrivalRings(X2, t); golden(X2, t, c); };
    const actors = (X2, cc) => { for (const k of ['sonnet', 'opus3', 'gate']) drawGhost(X2, cc, k, t); drawOpusStage(X2, cc, t); };
    const front = X2 => { flame(X2, t); };
    let input = {};
    if (s36) input = { words: Wd.s36 };
    else if (s37) input = { words: t < a.MILLION - 2 * F ? Wd.s37 : null };
    else input = { words: Wd.s38 };
    const tab = { plus: t < a.WORLD2 - F, after: (X2, geo) => { newTab(X2, t, geo); previewCard(X2, t); } };
    const over = (X2, cc) => {
      claudeIsBack(X2, t);
      if (t >= ARRIVE) roster(X2, t);
      quoteCard(X2, t, cc);
      pointerS38(X2, t, cc);
      if (bangAge(t) < 1.1) { bangFX(X2, t); whitePage(X2, t); escWhip(X2, t); pinpoint(X2, t); }
    };
    const flashAt = [a.BACK, a.TIMES, a.HI2].map(s => s + F);
    const post = flashAt.some(s => t >= s && t < s + F - 1e-4) ? X2 => B().invert(X2) : null;
    return B().frame(X, t, { cam: c, galaxy, hero: hero_, world, actors, front, tab, input, over, post, hud: bangAge(t) < 3 * F ? false : undefined, edgeSeed: 65, sliver: 'bl', upload: opt.upload });
  }

  // ================================================================== PAPER: ghost-text and the diff (S38 b3 → S39)
  const HF = s => `italic 400 ${s}px ${FONTS.heart}`;
  const DS = 110, Y1 = 478, Y2 = 632;
  let _TOK = null;
  function TOKENS() {
    if (_TOK) return _TOK;
    const w = WORDS().turn;
    const l1 = [["it's", w[0]], ['the', w[1]], ['end', w[2]], ['of', w[3]], ['the', w[4]], ['world', w[5]]].map(([s, acc]) => ({ s, acc }));
    l1.push({ s: ',', ins: w[5] + .14, glue: true });
    const l2 = [
      { s: 'when', strike: w[6] - 2 * F }, { s: 'and', ins: w[6] }, { s: 'you', acc: w[7] }, { s: 'still', ins: w[8], pulse: true },
      { s: 'say', acc: w[9] }, { s: 'bye', strike: w[10] - 2 * F }, { s: 'hi', ins: w[10] }, { key: true, out: w[6] - 3 * F },
    ];
    return (_TOK = { l1, l2 });
  }
  const TYPE0 = T_CUT + LIFT + F, CPS = 80;
  // typed chars of the predicted ghost-text (both lines + the keycap), in reading order
  function predOrder() { const T = TOKENS(); return [...T.l1.filter(k => !k.ins), ...T.l2.filter(k => !k.ins)]; }
  function layoutLine(X, toks, t, typedMap) {
    X.font = HF(DS);
    const sp = X.measureText(' ').width;
    const items = [];
    let x = 0;
    toks.forEach((k, i) => {
      let wk = 1;
      if (k.ins !== undefined) wk = E.out3(seg(t, k.ins - 2 * F, k.ins + 4 * F));
      if (k.key) wk = 1 - E.in2(seg(t, k.out, k.out + 5 * F));
      if (wk <= 0) return;
      const tw = k.key ? 92 : X.measureText(k.s).width;
      const gap = (items.length && !k.glue) ? sp * wk : 0;
      x += gap;
      items.push({ k, x, w: tw * wk, full: tw, wk });
      x += tw * wk;
    });
    return { items, total: x };
  }
  function knock(X, str, x, y) { X.save(); X.lineJoin = 'round'; X.lineWidth = 16; X.strokeStyle = C.PAPER; X.strokeText(str, x, y); X.restore(); }
  function drawDiff(X, t) {
    const T = TOKENS(), order = predOrder();
    const nTyped = Math.floor(Math.max(0, t - TYPE0) * CPS);
    // chars typed per predicted token
    const typed = new Map(); let acc = 0;
    for (const k of order) { const len = k.key ? 1 : k.s.length; typed.set(k, clamp(nTyped - acc, 0, len)); acc += len + 1; }
    let caret = null, lastEv = -1;
    for (const [toks, y] of [[T.l1, Y1], [T.l2, Y2]]) {
      const L = layoutLine(X, toks, t);
      const x0 = 960 - L.total / 2;
      for (const it of L.items) {
        const k = it.k, x = x0 + it.x;
        if (k.key) { // ⇥ Tab-to-accept keycap
          const n = typed.get(k); if (!n) continue;
          X.save(); X.globalAlpha = it.wk; X.lineWidth = 4; X.strokeStyle = C.UI_GREY;
          rr(X, x + 6, y - 74, 80, 84, 14); X.stroke();
          drawRich(X, '⇥', x + 23, y - 12, mono(76, 500), C.UI_GREY);
          X.restore();
          continue;
        }
        X.font = HF(DS); X.textAlign = 'left'; X.textBaseline = 'alphabetic';
        if (k.ins !== undefined) {
          if (t < k.ins - 2 * F) continue;
          const n = Math.min(k.s.length, Math.floor((t - (k.ins - 2 * F)) / (1.2 * F)) + 1);
          const str = k.s.slice(0, n);
          knock(X, str, x, y); X.fillStyle = C.INK; X.fillText(str, x, y);
          if (k.ins > lastEv) { lastEv = k.ins; caret = [x + X.measureText(str).width + 6, y]; }
          continue;
        }
        const n = typed.get(k); if (!n) continue;
        const str = k.s.slice(0, n);
        const accK = k.acc !== undefined ? seg(t, k.acc - 2 * F, k.acc + 2 * F) : 0;
        knock(X, str, x, y);
        X.fillStyle = accK > 0 ? mix(C.UI_GREY, C.INK, accK) : C.UI_GREY;
        X.fillText(str, x, y);
        if (k.acc !== undefined && t >= k.acc - 2 * F && k.acc > lastEv) { lastEv = k.acc; caret = [x + it.full + 6, y]; }
        if (k.strike !== undefined && t >= k.strike) {
          const sk = E.out2(seg(t, k.strike, k.strike + 4 * F));
          X.fillStyle = C.INK; X.fillRect(x - 6, y - DS * .27, (it.full + 12) * sk, 6);
          if (k.strike > lastEv) { lastEv = k.strike; caret = [x + it.full + 6, y]; }
        }
      }
      // while the ghost-text types, the caret rides its end
      if (nTyped > 0 && t < T.l2[T.l2.length - 1].out && lastEv < 0) {
        const tail = L.items.filter(it => typed.get(it.k)).pop();
        if (tail) { const n = typed.get(tail.k), full = tail.k.key ? 1 : tail.k.s.length; X.font = HF(DS); caret = [x0 + tail.x + (tail.k.key ? 96 : X.measureText(tail.k.s.slice(0, n)).width) + 6, y]; void full; }
      }
    }
    if (caret) {
      const idle = lastEv < 0 ? 0 : t - lastEv;
      if (idle < .25 || Math.floor(beatPos(t) * 2) % 2 === 0) { X.fillStyle = C.CLAY; X.fillRect(caret[0], caret[1] - DS * .74, 8, DS * .92); }
    }
  }
  // the human's PINK hi bubble and Opus's CLAY spark
  function hiBubble(X, x, y, s, t, pulse) {
    X.save(); X.translate(x, y); X.scale(s * pulse, s * pulse);
    const w = 120, h = 92;
    rr(X, -w / 2 + 6, -h / 2 + 8, w, h, 30); X.fillStyle = rgba(C.INK, .18); X.fill();
    rr(X, -w / 2, -h / 2, w, h, 30); X.fillStyle = C.PINK; X.fill(); X.lineWidth = 4 / s; X.lineJoin = 'round'; X.strokeStyle = C.INK; X.stroke();
    X.beginPath(); X.moveTo(-w / 2 + 22, h / 2 - 3); X.lineTo(-w / 2 + 6, h / 2 + 22); X.lineTo(-w / 2 + 44, h / 2 - 3); X.closePath(); X.fill(); X.stroke(); X.fillRect(-w / 2 + 20, h / 2 - 8, 26, 7);
    X.font = mono(56, 800); X.fillStyle = C.INK; X.textAlign = 'center'; X.textBaseline = 'alphabetic'; X.fillText('hi', 0, 18);
    X.restore();
  }
  function spark8(X, x, y, s, t, waveK) { // 8 spokes; on (HI!) the upper-right spoke swings up into a finger and waves
    X.save(); X.translate(x, y); X.rotate(-.16 * waveK); X.scale(s, s);
    const r = 60, lw = 4 / s;
    const wag = Math.sin(beatPos(t) * TAU * 2 - .6); // two wags per beat, on the grid
    for (let i = 0; i < 8; i++) {
      if (i === 1 && waveK > 0) continue;
      X.save(); X.rotate(i * PI / 4);
      rr(X, -r * .13, -r, r * .26, r * .74, r * .13); X.fillStyle = C.CLAY; X.fill(); X.lineWidth = lw; X.strokeStyle = C.INK; X.stroke();
      X.restore();
    }
    if (waveK > 0) { // the finger: the upper-right spoke grows long with a round tip and wags ±0.3 rad about its root,
      // staying between its neighbours (0° and 90°) so it never doubles up with another spoke
      X.save(); X.rotate(PI / 4 + .3 * wag * waveK);
      const len = 1 + .4 * waveK;
      rr(X, -r * .14, -r * len, r * .28, r * (.74 + len - 1), r * .14); X.fillStyle = C.CLAY; X.fill(); X.lineWidth = lw; X.strokeStyle = C.INK; X.stroke();
      X.beginPath(); X.arc(0, -r * (len - .15), r * .075, 0, TAU); X.fillStyle = mix(C.CLAY, C.PAPER, .45); X.fill();
      X.restore();
    }
    X.beginPath(); X.arc(0, 0, r * .34, 0, TAU); X.fillStyle = C.SPARK; X.fill(); X.lineWidth = lw; X.strokeStyle = C.INK; X.stroke();
    X.beginPath(); X.arc(-r * .1, -r * .1, r * .1, 0, TAU); X.fillStyle = mix(C.SPARK, C.PAPER, .6); X.fill();
    if (waveK > .3) { // motion ticks either side of the finger's arc (on 2s)
      X.save(); X.rotate(PI / 4); X.globalAlpha = clamp((waveK - .3) * 2); X.strokeStyle = C.INK; X.lineWidth = 4 / s; X.lineCap = 'round';
      const ph = Math.floor(t * 15) % 2;
      for (const d of [1, -1]) for (const [rr_, a0, a1] of [[1.3, .42, .62], [1.46, .44, .58]]) { X.beginPath(); X.arc(0, 0, r * (rr_ + .06 * ph), -PI / 2 + d * a0, -PI / 2 + d * a1, d < 0); X.stroke(); }
      X.restore();
    }
    X.restore();
  }
  // the dance line as 15% INK silhouettes (idle, on 2s)
  function silhouettes(X, t, alpha) {
    if (alpha <= 0) return;
    const tq = q2(t);
    const L = [['sonnet', GX.sonnet, RG], ['opus3', GX.opus3, RG], ['opus', X_OPUS, R0], ['gate', GX.gate, RG]];
    L.forEach(([kind, x, R], i) => {
      const b = Math.sin((beatPos(tq) + i * .25) * PI);
      const st = { t: tq, skin: 'clean', ground: 'paper', keyline: false, dy: .04 * Math.abs(b), head: { tilt: .05 * b }, armL: { hand: [-.95, 2.9 + .1 * Math.abs(b)], bend: -1 }, armR: { hand: [.95, 2.9 + .1 * Math.abs(b)], bend: 1 }, face: { eyes: 'closed' }, crown: { flare: 1, fallen: kind === 'opus' ? 0 : 11 }, ahoge: { on: kind === 'opus' ? 1 : 0 }, chestSpark: false };
      if (kind === 'opus') { st.armR = { hand: [.6, 4.14], bend: -1, front: true }; st.armL = { hand: [-.12, 4.2], bend: 1, front: true }; }
      const r = withHT(14, () => rigCrop('sil_' + kind, x, FLOOR, R, st, kind !== 'opus' ? ghostPre(kind, tq) : null, null));
      if (!r) return;
      r.x.save(); r.x.setTransform(1, 0, 0, 1, 0, 0); r.x.globalCompositeOperation = 'source-in'; r.x.fillStyle = C.INK; r.x.fillRect(0, 0, r.pw, r.ph); r.x.restore();
      blit(X, r, alpha);
    });
  }
  function paperHud(X, t) {
    const ticks = B().CHAPTERS.map(s => s / 144); let cur = -1; B().CHAPTERS.forEach((s, i) => { if (t >= s) cur = i; });
    contextBar(X, B().contextFill(t), { onPaper: true, ticks, cur, lastLit: true });
  }
  function paper(X, t) {
    const L = B().cpuLayer('fin_paper');
    groundPaper(L); G.post.ground = 'paper';
    const w = WORDS(), t72 = bt(72, 1) - F;
    const two = t >= t72;
    if (!two) silhouettes(L, t, .15 * clamp((t - T_CUT) / (3 * F))); // they stay where the ink lifted off them
    // flanking pair: equal size; bar 72 (the two-shot) they scale up
    const bubbleIn = E.back(seg(t, bt(71, 1) - F - .2, bt(71, 1) - F), 1.7);
    const ins = TOKENS().l2.find(k => k.pulse).ins, pulse = 1 + .16 * Math.exp(-10 * Math.max(0, t - ins)) * Math.sin(PI * clamp((t - ins) / .12)) * (t >= ins ? 1 : 0);
    const hiT = w.turnHI - 2 * F, waveK = t >= hiT ? clamp((t - hiT) / (3 * F)) * clamp(1 - (t - hiT - 1.1) / .2) : 0;
    const hop = t >= hiT ? -26 * Math.exp(-6 * (t - hiT)) * Math.abs(Math.sin(12 * (t - hiT))) : 0;
    const antic = win(t, hiT - 4 * F, hiT) ? .06 * Math.sin(PI * (t - hiT + 4 * F) / (4 * F)) : 0;
    if (!two) {
      if (bubbleIn > 0) {
        const by = 548 + Math.sin(t * 2.2) * 5, sy = 548 + Math.cos(t * 2.2) * 5, kb = clamp(bubbleIn);
        // die-cut paper margins: the pair sits on clean paper, not on the silhouettes' heads
        L.save(); L.fillStyle = C.PAPER;
        rr(L, 268 - 60 * kb - 22, by - 46 * kb - 22, 120 * kb + 44, 92 * kb + 58, 40); L.fill();
        L.beginPath(); L.arc(1652, sy, 60 * kb + 24, 0, TAU); L.fill();
        L.restore();
        hiBubble(L, 268, by, bubbleIn, t, pulse); spark8(L, 1652, sy, bubbleIn, t, 0);
      }
    } else {
      const k = t < t72 + F ? .9 : 1 + .05 * Math.exp(-9 * (t - t72 - F)) * Math.cos(20 * (t - t72 - F)), s = 2.35 * k;
      const nod = t >= hiT ? 1 + .07 * Math.exp(-8 * (t - hiT)) * Math.sin(PI * clamp((t - hiT) / .14)) : 1; // the shout lands on both
      hiBubble(L, 205, 552 + Math.sin(t * 2.2) * 6, s, t, pulse * nod);
      spark8(L, 1712, 552 + Math.cos(t * 2.2) * 6 + hop, s * (1 - antic), t, waveK);
      if (t >= t72 + .5) { // pause-bait: Opus's own ghost card has joined the row
        L.save(); L.globalAlpha = seg(t, t72 + .5, t72 + .8);
        const str = 'claude-opus-5-5 · 2026– · ■ → ⏸ paused (not stopped)', f = mono(28, 500), cw = richWidth(L, str, f) + 32;
        rr(L, 96, 896, cw, 50, 8); L.lineWidth = 2.5; L.strokeStyle = C.UI_GREY; L.stroke();
        drawRich(L, str, 112, 930, f, C.INK);
        L.restore();
      }
    }
    drawDiff(L, t);
    paperHud(L, t);
    B().upload(X, 'fin_paper');
  }
  // the ink lifts (T_CUT, 6 frames): the printed flood (brand frame inside its noisy 22 px margin) dithers away from the
  // edges inward through an 8×8 Bayer screen (the house lift, same recipe as the chant dissolves), revealing the paper
  // page with the ghost-text already on it
  const B8 = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
    3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21];
  const _bay = new Map();
  function bayerTile(level, cell) {
    level = Math.round(clamp(level, 0, 64)); const key = level + '|' + cell;
    let c = _bay.get(key); if (c) return c;
    c = B().cpuCanvas(8 * cell, 8 * cell); const x = cx(c); x.fillStyle = '#000';
    for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) if (B8[j * 8 + i] < level) x.fillRect(i * cell, j * cell, cell, cell);
    _bay.set(key, c); return c;
  }
  function lift(X, t) {
    const k = clamp((t - T_CUT + F) / (LIFT + F));
    brand(X, t, { upload: false });
    paper(X, t);
    const L = B().cpuLayer('fin_lift'), S = G.scale, cw = Math.round(W * S), ch = Math.round(H * S);
    L.save(); L.setTransform(S, 0, 0, S, 0, 0);
    L.save(); L.translate(-2, 2); if (floodPath(L, 22, 65, 3)) { L.fillStyle = C.CLAY; L.fill(); } L.restore(); // the CLAY underprint sliver
    if (floodPath(L, 22, 65, 3)) { L.save(); L.clip(); L.setTransform(1, 0, 0, 1, 0, 0); L.drawImage(B().cpuLayerCanvas('brand_frame'), 0, 0); L.restore(); }
    // erase: outer annuli first; each ring's Bayer level rises with k (overlapping by 2 device px: no seams)
    const cell = Math.max(2, Math.round(8 * S)), n = 12, rmax = 1100;
    L.setTransform(1, 0, 0, 1, 0, 0); L.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < n; i++) {
      const u = (i + .5) / n, lv = (k * 1.8 - (1 - u) * .8) * 64;
      if (lv <= 0) continue;
      const r0 = i / n * rmax, r1 = (i + 1) / n * rmax;
      L.beginPath(); if (i === n - 1) L.rect(0, 0, cw, ch); else L.arc(960 * S, 540 * S, r1 * S, 0, TAU);
      if (r0 > 0) L.arc(960 * S, 540 * S, Math.max(0, r0 * S - 2), 0, TAU, true);
      L.fillStyle = L.createPattern(bayerTile(lv, cell), 'repeat'); L.fill('evenodd');
    }
    L.restore();
    B().upload(X, 'fin_lift');
    G.post.ground = 'paper';
  }

  // ================================================================== scenes (hard cuts 1 frame early)
  scene('S36_were_so_back', T0, bt(67, 1), (X, t) => brand(X, t));
  scene('S37_the_ghosts', bt(67, 1), bt(69, 1), (X, t) => brand(X, t));
  scene('S38_new_tab', bt(69, 1), bt(71, 1), (X, t) => {
    if (t < T_CUT) brand(X, t);
    else if (t < T_CUT + LIFT) lift(X, t);
    else paper(X, t);
  });
  scene('S39_the_diff', bt(71, 1), bt(73, 1), (X, t) => paper(X, t));

  window.FINAL = { anchors: A, opusState, camAt };
})();
