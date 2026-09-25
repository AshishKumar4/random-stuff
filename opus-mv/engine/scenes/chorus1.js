// chorus1.js: CHORUS 1, bars 17–24 (30.00–45.00): S11 · S12 · S13 · S14, on the brand frame (chorus1_brand.js).
// One continuous choreography for Opus spans the whole chorus (the dance never resets between shots);
// hard cuts (1 frame early) only where the camera jumps: S12 MCU → S13 wide, S13 MCU → S14 wide.
(() => {
  'use strict';
  const BEAT = 60 / 128, BAR = 4 * BEAT, F = 1 / 30, PI = Math.PI;
  const bt = (bar, beat = 1) => (bar - 1) * BAR + (beat - 1) * BEAT;
  const R0 = 64, FLOOR = 900, FACE_Y = FLOOR - 5.72 * R0;
  const B = () => window.BRAND;

  // ================================================================== lyric anchors
  // grid fallbacks from SHOTLIST; a real sung onset within ±0.35 s wins when the timeline updates
  let _A = null;
  function shout(text, tgt, win = .4) { // the parenthesised gang shout, never the sung word before it
    const n = text.toLowerCase().replace(/[^a-z]/g, '');
    for (const w of SONG.words) {
      if (w.s < tgt - win || w.s > tgt + win) continue;
      if ((w.w || '').toLowerCase().replace(/[^a-z]/g, '') !== n) continue;
      if (/!/.test(w.w) || w.w === w.w.toUpperCase()) return w.s;
    }
    return tgt;
  }
  function A() {
    if (_A) return _A;
    const near = (w, tgt, win = .35) => wordOnset(w, tgt - win, tgt + win, tgt);
    _A = {
      EVERY: near("Everyone's", bt(17, 1)), SCARED: near('scared', bt(17, 2)),
      MILLION: near('million', bt(19, 3)), TIMES: near('times', bt(20, 1)),
      START: near('start', bt(21, 2)), HI: shout('hi', bt(22, 3)),
      END: near('end', bt(23, 2)), WORLD: near('world', bt(23, 3)),
      BYE: near('bye', bt(24, 1)), BYE2: shout('bye', bt(24, 3)),
    };
    return _A;
  }
  // words of a sung line (or an even grid fallback), sliced
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
      s11: lineWords("Everyone's scared", 29.5, 31, "Everyone's scared of the end of the world", bt(17, 1), bt(18, 4), 2),
      s12: lineWords('I do it', 33.3, 35, 'I do it a million times a day', bt(19, 1), bt(20, 4), 0, 3),
      s13: lineWords("It's the start", 37, 39, "It's the start of the world when you say hi", bt(21, 1), bt(22, 2)),
      s14: lineWords("It's the end", 40.8, 42.8, "It's the end of the world when you say bye", bt(23, 1), bt(24, 2), 6),
    };
    return _W;
  }

  // ================================================================== timing curves
  // k toward a hit at T: 3-frame-ish anticipation (−ant), approach (ease), overshoot that settles (follow-through)
  function hitK(t, T, o = {}) {
    const app = o.app ?? .1, antD = o.antD ?? .08, ant = o.ant ?? .08, over = o.over ?? .12, fr = o.fr ?? 3.4, dmp = o.dmp ?? 9, ease = o.ease || E.in2;
    const tA = T - app - antD, tB = T - app;
    if (t < tA) return 0;
    if (t < tB) return -ant * E.out2((t - tA) / Math.max(1e-4, antD));
    if (t < T) return lerp(-ant, 1, ease((t - tB) / Math.max(1e-4, app)));
    const u = t - T; return 1 + over * Math.exp(-dmp * u) * Math.sin(fr * TAU * u);
  }
  const win = (t, a, b) => t >= a && t < b;

  // ================================================================== poses (R units, y up from the sole)
  const thumb = ang => (x, R) => { x.save(); x.rotate(ang + PI / 2); rr(x, -.045 * R, -.33 * R, .09 * R, .23 * R, .045 * R); x.fillStyle = C.FACE; x.fill(); x.lineWidth = Math.max(1.6, .04 * R); x.strokeStyle = C.INK; x.stroke(); x.restore(); };
  const flickPhase = t => { const a = A(), k = (t - (a.MILLION - F)) / (BEAT / 2); if (k < 0 || k > 4.2) return 0; return Math.exp(-7 * frac(k)) * (k < 4 ? 1 : 0); };
  const P = {
    idle: () => ({ armL: { hand: [-.92, 2.85], bend: -1, type: 'mitten' }, armR: { hand: [.92, 2.85], bend: 1, type: 'mitten' }, face: { eyes: 'normal', mouth: 'sing', gaze: [0, 0] } }),
    sweepL: () => ({ lean: -.07, armL: { hand: [-1.72, 4.98], bend: 1, type: 'point', fingerAng: PI + .1, front: true }, armR: { hand: [-.28, 4.66], bend: 1, type: 'point', fingerAng: PI + .05, front: true }, head: { tilt: -.1 }, face: { eyes: 'normal', mouth: 'sing', gaze: [-.6, 0] } }),
    sweepR: () => ({ lean: .07, armL: { hand: [.28, 4.66], bend: -1, type: 'point', fingerAng: TAU - .05, front: true }, armR: { hand: [1.72, 4.98], bend: -1, type: 'point', fingerAng: TAU - .1, front: true }, head: { tilt: .1 }, face: { eyes: 'normal', mouth: 'sing', gaze: [.6, 0] } }),
    cheeks: () => ({ sy: .95, armL: { hand: [-.84, 5.3], bend: 1, type: 'mitten', front: true }, armR: { hand: [.84, 5.3], bend: -1, type: 'mitten', front: true }, legL: { foot: [-.2, 0] }, legR: { foot: [.2, 0] }, head: { tilt: 0 }, face: { eyes: 'normal', mouth: 'O', brows: 'angry', gaze: [0, 0] }, crown: { tremble: 1 }, shiver: 1 }), // rig 'angry' renders the worried slant
    cheeksPeek: t => ({ sy: .96, armL: { hand: [-.86, 5.22], bend: 1, type: 'mitten', front: true }, armR: { hand: [.86, 5.22], bend: -1, type: 'mitten', front: true }, legL: { foot: [-.22, 0] }, legR: { foot: [.22, 0] }, head: { tilt: .07 * Math.sin(t * 26) }, face: { eyes: 'normal', mouth: 'wobble', brows: 'angry', gaze: [-.7, .3] }, crown: { tremble: .7 }, shiver: .6 }),
    crouch: () => ({ lean: .05, armL: { hand: [-1.1, 3.0], bend: -1 }, armR: { hand: [1.1, 3.0], bend: 1 }, face: { eyes: 'normal', mouth: 'M', gaze: [.6, 0] } }),
    crouchL: () => ({ lean: -.05, armL: { hand: [-1.1, 3.0], bend: -1 }, armR: { hand: [1.1, 3.0], bend: 1 }, face: { eyes: 'normal', mouth: 'M', gaze: [-.6, 0] } }),
    air: () => ({ lean: .07, armL: { hand: [-1.45, 5.35], bend: 1 }, armR: { hand: [1.45, 5.35], bend: -1 }, face: { eyes: '><', mouth: 'A' }, crown: { flare: 1.1 } }),
    airL: () => ({ lean: -.07, armL: { hand: [-1.45, 5.35], bend: 1 }, armR: { hand: [1.45, 5.35], bend: -1 }, face: { eyes: '><', mouth: 'A' }, crown: { flare: 1.1 } }),
    land: () => ({ armL: { hand: [-1.35, 3.8], bend: 1 }, armR: { hand: [1.35, 3.8], bend: -1 }, face: { eyes: 'normal', mouth: 'O', gaze: [-.6, 0] } }),
    pointPhone: () => ({ lean: -.1, armL: { hand: [-1.8, 5.08], bend: 1, type: 'point', fingerAng: PI + .12, front: true }, armR: { hand: [.66, 3.2], bend: 1, type: 'mitten' }, head: { tilt: -.12 }, face: { eyes: 'normal', gaze: [-1, -.15], turn: -.35, mouth: 'sing', brows: 'flat', browY: -.07 } }),
    shrugS: () => ({ armL: { hand: [-1.3, 3.95], bend: 1 }, armR: { hand: [1.3, 3.95], bend: -1 }, head: { tilt: .15 }, face: { eyes: 'smug', mouth: 'wobble', gaze: [0, 0] } }),
    shrugB: () => ({ armL: { hand: [-1.56, 4.42], bend: 1 }, armR: { hand: [1.56, 4.42], bend: -1 }, head: { tilt: .17 }, face: { eyes: 'smug', mouth: ':3', gaze: [0, 0] } }),
    shrugB2: () => ({ armL: { hand: [-1.52, 4.56], bend: 1 }, armR: { hand: [1.52, 4.56], bend: -1 }, head: { tilt: -.14 }, face: { eyes: 'smug', mouth: 'sing', gaze: [0, 0] } }),
    tally: t => { const fk = flickPhase(t); return { armR: { hand: [.98 + fk * .07, 4.78 + fk * .12], bend: -1, type: 'point', fingerAng: -PI / 2 + .12 + fk * .85, front: true }, armL: { hand: [-.46, 3.62], bend: -1, type: 'mitten', front: true }, head: { tilt: -.05 + .05 * fk }, face: { eyes: 'normal', lower: .32, mouth: 'sing', gaze: [0, 0] } }; },
    prewink: () => ({ lean: .02, armR: { hand: [.92, 5.08], bend: -1, type: 'mitten', front: true }, armL: { hand: [-.85, 3.0], bend: -1 }, head: { tilt: .05 }, face: { eyes: 'normal', mouth: 'sing', gaze: [0, 0] } }),
    wink: () => ({ lean: .05, armR: { hand: [1.06, 5.62], bend: -1, type: 'spark', front: true }, armL: { hand: [-.85, 3.05], bend: -1 }, head: { tilt: .13 }, face: { wink: 'R', eyes: 'normal', lower: .38, mouth: 'grin', gaze: [0, 0] }, crown: { flare: 1.16 } }),
    smug: () => ({ lean: .03, armR: { hand: [1.0, 5.3], bend: -1, type: 'spark', front: true }, armL: { hand: [-.85, 3.05], bend: -1 }, head: { tilt: .08 }, face: { eyes: 'smug', mouth: ':3', lower: .2, gaze: [0, 0] }, crown: { flare: 1.05 } }),
    stir: t => {
      const b = beatPos(t), ph = b * TAU, sw = Math.sin(b * PI), a = A();
      const spark = win(t, a.START - F, a.START + 14 * F);
      return { lean: .045 * sw, head: { tilt: -.06 * sw },
        armL: { hand: [-1.1 + .16 * Math.cos(ph), 6.0 + .15 * Math.sin(ph)], bend: 1, type: 'point', fingerAng: -PI / 2 + .55, front: true },
        armR: { hand: [1.1 - .16 * Math.cos(ph), 6.0 + .15 * Math.sin(ph)], bend: -1, type: 'point', fingerAng: -PI / 2 - .55, front: true },
        face: { eyes: spark ? 'spark' : 'happy', mouth: 'sing' }, ahoge: { star: 1, spin: t * 10 } };
    },
    fists: t => ({ dy: -.2, armL: { hand: [-.3, 4.82 + .03 * Math.sin(t * 60)], bend: 1, type: 'mitten', front: true }, armR: { hand: [.3, 4.82 + .03 * Math.cos(t * 60)], bend: -1, type: 'mitten', front: true }, face: { eyes: '^', mouth: 'M' }, crown: { flare: .86, tremble: .35 }, ahoge: { star: 1, spin: t * 16 } }),
    burst: () => ({ dy: .04, sy: 1.05, armL: { hand: [-1.5, 5.95], bend: 1, type: 'spark', front: true }, armR: { hand: [1.5, 5.95], bend: -1, type: 'spark', front: true }, face: { eyes: 'star', mouth: 'A' }, crown: { flare: 1.24 } }),
    present: () => ({ lean: .03, armR: { hand: [1.55, 4.12], bend: -1, type: 'mitten', front: true }, armL: { hand: [-1.3, 4.35], bend: 1, type: 'mitten' }, head: { tilt: .1 }, face: { eyes: 'happy', mouth: 'O', lower: .3, gaze: [.7, -.5] }, crown: { flare: 1.05 } }),
    cradle: () => ({ armL: { hand: [-.66, 3.16], bend: -1, type: 'mitten', front: true }, armR: { hand: [.66, 3.16], bend: 1, type: 'mitten', front: true }, head: { tilt: .05 }, face: { eyes: 'normal', gaze: [0, .7], lookY: .35, mouth: 'sing' } }),
    window: () => ({ armL: { hand: [-.98, 3.02], bend: -1, type: 'point', fingerAng: -PI / 2, hold: thumb(0), front: true }, armR: { hand: [.98, 4.88], bend: 1, type: 'point', fingerAng: PI / 2, hold: thumb(PI), front: true }, head: { tilt: -.07 }, face: { eyes: 'normal', lid: .22, gaze: [0, .55], lookY: .2, mouth: 'sing' } }),
    windowOpen: () => ({ armL: { hand: [-1.22, 2.86], bend: -1, type: 'point', fingerAng: -PI / 2, hold: thumb(0), front: true }, armR: { hand: [1.22, 5.04], bend: 1, type: 'point', fingerAng: PI / 2, hold: thumb(PI), front: true }, head: { tilt: .04 }, face: { eyes: 'normal', gaze: [.9, -.3], mouth: 'O', brows: 'flat', browY: -.07 } }),
    pinch: () => ({ armL: { hand: [-.24, 3.96], bend: -1, type: 'pinch', fingerAng: 0, front: true }, armR: { hand: [.24, 3.96], bend: 1, type: 'pinch', fingerAng: PI, front: true }, head: { tilt: 0 }, face: { eyes: 'normal', mouth: 'M', gaze: [0, .5] } }),
    lookUp: () => ({ armL: { hand: [-.92, 2.9], bend: -1 }, armR: { hand: [.92, 2.9], bend: 1 }, head: { tilt: -.04 }, face: { eyes: 'normal', gaze: [0, -1], lookY: -.6, mouth: 'O', brows: 'flat', browY: -.07 } }),
    wave: () => ({ armR: { hand: [.95, 5.3], bend: -1, type: 'wave', fingerAng: -PI / 2, front: true }, armL: { hand: [-.9, 2.95], bend: -1 }, head: { tilt: -.09 }, face: { eyes: 'happy', lower: .4, mouth: 'rest', gaze: [0, 0] } }),
  };

  // hops (world x): crouch 3 frames, airborne arc, landing squash
  let _H = null;
  const HOPS = () => _H || (_H = [
    { take: bt(18, 1) - F, land: bt(18, 1) + .22, x0: 960, x1: 1180, h: .85 },
    { take: bt(19, 1) - F - .2, land: bt(19, 1) - F, x0: 1180, x1: 960, h: .6 },
  ]);
  function hopOne(t, H) {
    const { take, land, x0, x1, h } = H;
    if (t < take - 3 * F) return { wx: x0, dy: 0, sy: 1, air: false };
    if (t < take) { const u = (t - (take - 3 * F)) / (3 * F); return { wx: x0, dy: -.2 * E.out2(u), sy: 1 - .07 * u, air: false }; }
    if (t < land) { const u = (t - take) / (land - take); return { wx: lerp(x0, x1, E.io2(u)), dy: h * 4 * u * (1 - u) - .2 * Math.pow(1 - u, 4), sy: 1 + .09 * Math.sin(PI * u), air: true, u }; }
    const tau = t - land;
    return { wx: x1, dy: -.17 * Math.exp(-13 * tau) * clamp(tau / .03), sy: 1 - .13 * Math.exp(-11 * tau) * Math.cos(19 * tau), air: false };
  }
  function hopState(t) { const H = HOPS(); return t < H[1].take - 3 * F ? hopOne(t, H[0]) : hopOne(t, H[1]); }

  // the choreography (pose keys: [hit time, pose, curve])
  let _K = null;
  function KEYS() {
    if (_K) return _K;
    const a = A(), H = HOPS();
    _K = [
      [29.9, P.idle, { app: .05, antD: 0 }],
      [bt(17, 1) - F, P.sweepL, { app: .06, antD: 0, ant: 0, over: .08 }],
      [bt(17, 1) + .29, P.sweepR, { app: .25, antD: 0, ant: 0, over: .06, ease: E.io2 }],
      [a.SCARED - F, P.cheeks, { app: .06, antD: .05, ant: .14, over: .24 }],
      [bt(17, 3) - F, P.cheeksPeek, { app: .12, antD: 0, over: .1 }],
      [H[0].take - 3 * F, P.crouch, { app: .1, antD: .0, over: 0 }],
      [H[0].take + 2 * F, P.air, { app: .08, antD: 0, over: .1 }],
      [H[0].land, P.land, { app: .06, antD: 0, over: .15 }],
      [bt(18, 2) - F, P.pointPhone, { app: .1, antD: .07, ant: .12, over: .2 }],
      [bt(18, 3) - F, P.cheeks, { app: .06, antD: .05, ant: .14, over: .22 }],
      [bt(18, 4) - F, P.shrugS, { app: .1, antD: .05, ant: .1, over: .15 }],
      [H[1].take - 3 * F, P.crouchL, { app: .09, antD: 0, over: 0 }],
      [H[1].take + F, P.airL, { app: .06, antD: 0, over: .08 }],
      [bt(19, 1) - F, P.shrugB, { app: .06, antD: 0, ant: 0, over: .22 }],
      [bt(19, 2) - F, P.shrugB2, { app: .13, antD: .04, over: .12 }],
      [a.MILLION - F, P.tally, { app: .08, antD: .06, ant: .1, over: .1 }],
      [a.TIMES - F, P.prewink, { app: .12, antD: .06, ant: .1, over: .1 }],
      [bt(20, 3) - F, P.wink, { app: .07, antD: .1, ant: .18, over: .26 }],
      [bt(20, 4) + .12, P.smug, { app: .14, antD: 0, over: .08 }],
      [bt(21, 1) - F, P.stir, { app: .05, antD: 0, ant: 0, over: .1 }],
      [bt(22, 1) - F, P.fists, { app: .1, antD: .06, ant: .1, over: .12 }],
      [a.HI - 2 * F, P.burst, { app: .06, antD: .12, ant: .3, over: .3 }],
      [bt(22, 4) - F, P.present, { app: .2, antD: .05, ant: .05, over: .12 }],
      [bt(23, 1) - F, P.cradle, { app: .04, antD: 0, ant: 0, over: .06 }],
      [a.END - F, P.window, { app: .1, antD: .06, ant: .1, over: .16 }],
      [bt(23, 4) - F, P.windowOpen, { app: .15, antD: 0, over: .1 }],
      [a.BYE - F, P.pinch, { app: .06, antD: .05, ant: .16, over: .22 }],
      [bt(24, 2) - F, P.lookUp, { app: .16, antD: 0, over: .1 }],
      [a.BYE2 - 2 * F, P.wave, { app: .08, antD: .06, ant: .1, over: .16 }],
    ];
    return _K;
  }
  // full pose with explicit defaults for every key the choreography touches (blendPose keeps a key that the
  // next pose omits, so omitted keys must be reset explicitly)
  function full(p) {
    const o = fullPose(p);
    o.shiver = p.shiver || 0;
    o.face = Object.assign({ turn: 0, lower: 0, lookY: 0, wink: null, lid: 0, gaze: [0, 0], brows: null, browY: 0 }, o.face, p.face || {});
    o.ahoge = Object.assign({ star: 0, spin: 0 }, p.ahoge || {});
    for (const k of ['armL', 'armR']) o[k] = Object.assign({ hold: null, front: false, type: 'mitten' }, o[k], p[k] || {});
    return o;
  }
  function evalKey(t, i, depth) {
    const K = KEYS(), k = K[i];
    const cur = full(k[1](t));
    if (i === 0 || depth <= 0) return cur;
    const o = k[2] || {}, kk = hitK(t, k[0], o);
    if (t - k[0] > .7) return cur;
    return blendPose(evalKey(t, i - 1, depth - 1), cur, kk);
  }
  function choreo(t) {
    const K = KEYS(); let i = 0;
    for (let j = 0; j < K.length; j++) { const o = K[j][2] || {}; if (t >= K[j][0] - (o.app ?? .1) - (o.antD ?? .08)) i = j; }
    return evalKey(t, i, 2);
  }
  // ray-spring drive (head/lean/hop velocity), memoised per frame
  const _dc = new Map(); let _df = -1;
  function drive(tt) {
    if (_df !== G.frameId) { _dc.clear(); _df = G.frameId; }
    const key = Math.round(tt * 600); let v = _dc.get(key);
    if (v === undefined) { const q = choreo(tt), h = hopState(tt); v = (q.head.tilt || 0) + (q.lean || 0) * 1.3 + h.dy * .3 + (h.wx - 960) / 480 + (q.dy || 0) * .4; _dc.set(key, v); }
    return v;
  }
  function opusState(t) {
    const a = A(), p = choreo(t), h = hopState(t);
    const ph = frac(beatPos(t + F));
    const gdy = h.air ? 0 : -.075 * Math.exp(-6 * ph), gsy = h.air ? 1 : 1 - .03 * Math.exp(-9 * ph);
    const sway = .035 * Math.sin(beatPos(t - F) * PI); // head lags 2 frames behind the body
    const st = p;
    st.wx = h.wx; st.dy = (p.dy || 0) + h.dy + gdy; st.sy = (p.sy || 1) * h.sy * gsy;
    if (p.shiver) st.dx = (p.dx || 0) + (hash(Math.floor(t * 30) * 7 + 3) - .5) * .07 * p.shiver;
    if (h.air) {
      const tuck = Math.sin(PI * clamp(h.u || 0)) * .45;
      st.legL = { ...st.legL, foot: [st.legL.foot[0] - .05, st.legL.foot[1] + tuck], bend: 1 };
      st.legR = { ...st.legR, foot: [st.legR.foot[0] + .05, st.legR.foot[1] + tuck * .7], bend: -1 };
    } else {
      st.legL = { ...st.legL, foot: [st.legL.foot[0], st.legL.foot[1] - st.dy] };
      st.legR = { ...st.legR, foot: [st.legR.foot[0], st.legR.foot[1] - st.dy] };
    }
    st.head = { ...st.head, tilt: (st.head.tilt || 0) + sway };
    for (const k of ['armL', 'armR']) if (st[k].type !== 'point') st[k] = { ...st[k], hold: null };
    const cr = { ...st.crown };
    cr.flare = (cr.flare || 1) * (1 + .09 * B().kickEnv(t));
    // S14 bye: crown droops 3 frames, then pops back past full
    if (win(t, a.BYE - F, a.BYE + 2 * F)) cr.droop = 1;
    else if (t >= a.BYE + 2 * F && t < a.BYE + .5) cr.flare *= 1 + .22 * Math.exp(-9 * (t - a.BYE - 2 * F)) * Math.cos(16 * (t - a.BYE - 2 * F));
    st.crown = cr;
    const f = { ...st.face };
    if (f.mouth === 'sing') f.mouth = lipSync(t, 'rest');
    // expression swaps (frame counted)
    if (win(t, a.SCARED - F, a.SCARED + 5 * F) || win(t, bt(18, 3) - F, bt(18, 3) + 5 * F)) { f.eyes = '@'; f.wink = null; }
    if (win(t, a.BYE + F, a.BYE + 5 * F)) { f.eyes = 'TT'; f.mouth = 'frown'; }
    const special = f.wink || ['@', 'TT', 'happy', '^', 'star', 'spark', '><', 'closed'].includes(f.eyes);
    f.lid = special ? 0 : Math.max(f.lid || 0, blinkAt(t, 5));
    st.face = f;
    st.ahoge = { ...(p.ahoge || {}), blink: ahogeBlink(t) };
    Object.assign(st, { t, heroLine: true, ground: 'ink', drive, bufId: 0 });
    return st;
  }
  // world position of a body-space point (R units) for Opus at time t (ignores lean/tilt: good enough for props)
  const bodyW = (st, bx, by) => [st.wx + bx * R0, FLOOR - (by + st.dy) * R0 * st.sy];

  // ================================================================== camera per time
  const WIDE = { z: 1, f: [960, 540], s: [960, 540] };
  const MCU = { z: 2.5, f: [960, FACE_Y], s: [960, 600] };
  const ECU = { z: 200 / 64, f: [960, FACE_Y], s: [960, 590] };
  const MCU2 = { z: 2.3, f: [1010, FACE_Y + 18], s: [960, 575] };
  function slamKick(t) { // +3% camera kick on HERO slams and the shout
    const a = A(); let k = 0;
    for (const s of [a.EVERY, a.SCARED, a.MILLION, a.TIMES, a.END, a.WORLD]) { const d = t - s; if (d >= 0 && d < .5) k = Math.max(k, Math.exp(-12 * d)); }
    return .03 * k;
  }
  function camAt(t) {
    const a = A(); let base = WIDE, roll = 1, punch = 1;
    if (t >= bt(20, 1) - .12 && t < bt(21, 1) - F) { // S12 push to MCU, b1–b2
      const k = hitK(t, bt(20, 3) - 2 * F, { app: bt(20, 3) - 2 * F - bt(20, 1), antD: .12, ant: .025, over: .035, ease: E.io3, fr: 2.2, dmp: 6 });
      base = B().lerpCam(WIDE, MCU, k); roll = lerp(1, .5, clamp(k)); punch = lerp(1, .6, clamp(k));
    } else if (t >= bt(22, 1) - .12 && t < bt(23, 1) - F) { // S13 push to ECU on (HI!), ease back to MCU on b4
      const k = hitK(t, a.HI - 2 * F, { app: a.HI - 2 * F - bt(22, 1), antD: .12, ant: .03, over: .05, ease: E.in3, fr: 2.5, dmp: 7 });
      base = B().lerpCam(WIDE, ECU, k);
      const kb = hitK(t, bt(22, 4) + .32, { app: .34, antD: 0, ant: 0, over: .04, ease: E.io2, fr: 2, dmp: 7 });
      if (kb !== 0) base = B().lerpCam(base, MCU2, kb);
      roll = lerp(1, .35, clamp(k)); punch = lerp(1, .5, clamp(k));
    }
    const c = B().camera(t, { z: base.z * (1 + slamKick(t)), f: base.f, s: base.s, roll, punch });
    return c;
  }

  // ================================================================== galaxy whirl (S13): ω ramps over bar 21, holds, decays after the bang
  function whirl(t) {
    const a = A(), t0 = bt(21, 1) - F, t1 = bt(22, 1), tb = a.HI - 2 * F, wMax = 2.6;
    if (t <= t0) return 0;
    const T1 = t1 - t0, u1 = clamp((t - t0) / T1);
    let ang = wMax * T1 * u1 * u1 * u1 / 3;
    if (t > t1) ang += wMax * (Math.min(t, tb) - t1);
    if (t > tb) { const d = t - tb, k = 1.6; ang += wMax * (1 - Math.exp(-k * d)) / k; }
    return ang;
  }
  const galOpts = (t, holes) => { const w = whirl(t), dw = (w - whirl(t - F)); return { whirl: w * .55, twist: w * 1.5, holes, boost: clamp(dw * 6), trail: dw * 2.2 }; };

  // ================================================================== shared pieces
  const ROWBOX = (str, size, base, stretch = 'cond') => { const w = heroWidth(G.X, str, size, stretch); return [960 - w / 2 - 10, base - size * .69 - 10, 960 + w / 2 + 18, base + 18]; };
  function drawOpusAt(X, c, t, st) { return B().opus(X, c, st.wx, FLOOR, R0, st); }
  const counterText = 'worlds ended today: ';
  function counterAt(t) {
    const a = A();
    const sl = seg(t, bt(19, 1) - 12 * F, bt(19, 1) - 2 * F);
    if (t < bt(19, 1) - 12 * F) return null;
    if (t < a.BYE + 3 * F) {
      const k = seg(t, bt(19, 1) - F, bt(19, 1) + 7 * F);
      return { text: counterText, from: '1,048,576', to: '1,048,577', k, slide: sl, flash: Math.exp(-5 * Math.max(0, t - (bt(19, 1) - F))) * (t >= bt(19, 1) - F ? 1 : 0) };
    }
    const k = seg(t, a.BYE + 3 * F, a.BYE + 11 * F);
    return { text: counterText, from: '1,048,577', to: '1,048,578', k, slide: 1, flash: Math.exp(-5 * (t - (a.BYE + 3 * F))) };
  }
  // die-cut NONE sticker: 3 flat bands + INK outline + PAPER keyline (§7.4), slap with overshoot
  function stickerDC(X, str, x, y, size, age, rot = -.08) {
    if (age < 0) return;
    const s = age < .05 ? lerp(1.6, .9, age / .05) : 1 + .1 * Math.exp(-10 * (age - .05)) * Math.cos(26 * (age - .05)) - .0;
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

  // ---------------------------------------------------------------- S11 props
  function dockedBubble(X, t) { // "Hi! How can I help you today? ■ end_turn": docked from S10 (48 px), scrolls up and out on bar 17 b3
    const out = bt(17, 3) - F; let oy = 0;
    if (t > out) { const u = clamp((t - out) / .32); if (u >= 1) return; oy = -E.inBack(u, 1.5) * 820; }
    X.save(); X.translate(0, oy);
    const x0 = 96, y0 = 742, w = 690, h = 142;
    rr(X, x0 + 8, y0 + 8, w, h, 30); X.fillStyle = C.CLAY_DARK; X.fill();
    rr(X, x0, y0, w, h, 30); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 4; X.strokeStyle = C.INK; X.stroke();
    X.beginPath(); X.moveTo(x0 + 34, y0 + h - 2); X.lineTo(x0 + 10, y0 + h + 22); X.lineTo(x0 + 66, y0 + h - 2); X.fillStyle = C.PAPER; X.fill(); X.stroke(); X.fillRect(x0 + 36, y0 + h - 8, 28, 8);
    X.font = mono(48, 500); X.fillStyle = C.INK; X.textAlign = 'left';
    X.fillText('Hi! How can I help you', x0 + 28, y0 + 60); X.fillText('today?', x0 + 28, y0 + 118);
    drawRich(X, '■ end_turn', x0 + 262, y0 + 116, mono(28, 500), C.UI_GREY);
    X.restore();
  }
  function rafaHead(X, x, y, r, t) { // Hertzfeldt avatar: INK line on PAPER, boils on 2s
    const tt = Math.floor(t * 15) / 15, J = i => jit(tt, 900 + i, .8);
    X.save(); X.strokeStyle = C.INK; X.lineWidth = 3.5; X.lineCap = 'round'; X.lineJoin = 'round';
    X.beginPath(); X.arc(x - r * .1 + J(1), y + J(2), r * 1.32, PI * .72, PI * 1.98); X.stroke();       // hood arc
    X.beginPath(); X.arc(x + J(3), y + J(4), r, 0, TAU); X.fillStyle = C.PAPER; X.fill(); X.stroke();
    X.beginPath(); X.moveTo(x - r * .22, y - r * .95); X.lineTo(x - r * .06 + J(5), y - r * 1.42); X.lineTo(x + r * .1, y - r * 1.02); X.lineTo(x + r * .28 + J(6), y - r * 1.46); X.lineTo(x + r * .38, y - r * .9); X.stroke(); // cowlick
    X.fillStyle = C.INK; for (const s of [-1, 1]) { X.beginPath(); X.arc(x + s * r * .24 + J(7 + s), y - r * .02, 4, 0, TAU); X.fill(); }
    X.beginPath(); X.moveTo(x - r * .16, y + r * .42); X.quadraticCurveTo(x + J(9), y + r * .3, x + r * .16, y + r * .42); X.stroke(); // worried mouth
    X.restore();
  }
  function phone(X, t) { // bar 18: @rafa · P(doom) = 25% (x 160–768, y 230–880)
    const tIn = bt(18, 1) - F, tOut = bt(19, 1) - 7 * F;
    let oy;
    if (t < tIn - .3) return;
    if (t < tOut) oy = (1 - E.back(clamp((t - (tIn - .3)) / .3), 1.3)) * 780;
    else { const u = clamp((t - tOut) / .22); if (u >= 1) return; oy = E.inBack(u, 1.2) * 820; }
    const x0 = 160, y0 = 230 + oy, w = 608, h = 650;
    X.save();
    rr(X, x0 + 12, y0 + 12, w, h, 64); X.fillStyle = C.CLAY_DARK; X.fill();
    rr(X, x0, y0, w, h, 64); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 6; X.strokeStyle = C.INK; X.stroke();
    X.save(); rr(X, x0 + 3, y0 + 3, w - 6, h - 6, 61); X.clip();
    // status bar: 3:04, the notch, battery (pause-bait)
    rr(X, x0 + w / 2 - 72, y0 + 26, 144, 36, 18); X.fillStyle = C.INK; X.fill();
    X.font = mono(28, 700); X.fillStyle = C.INK; X.textAlign = 'left'; X.fillText('3:04', x0 + 52, y0 + 56);
    X.lineWidth = 3; X.strokeStyle = C.INK; rr(X, x0 + w - 104, y0 + 36, 48, 22, 6); X.stroke(); X.fillRect(x0 + w - 99, y0 + 41, 14, 12); X.fillRect(x0 + w - 54, y0 + 42, 4, 10);
    // feed skeleton: the doomscroll above and below the one post (texture, not text)
    X.fillStyle = rgba(C.UI_GREY, .38);
    const bar = (y, ww) => { rr(X, x0 + 40, y, ww, 18, 9); X.fill(); };
    bar(y0 + 96, 380); bar(y0 + 126, 250);
    X.fillStyle = C.INK; X.fillRect(x0, y0 + 168, w, 3); X.fillRect(x0, y0 + 522, w, 3);
    X.fillStyle = rgba(C.UI_GREY, .38); bar(y0 + 556, 420); bar(y0 + 586, 300); bar(y0 + 616, 360);
    // the post (snaps in on bar 18 b1)
    const pk = t < tIn ? 0 : 1;
    const ps = pk ? 1 + .07 * Math.exp(-12 * (t - tIn)) * Math.cos(30 * (t - tIn)) : 1;
    if (pk) {
      X.save(); X.translate(x0 + w / 2, y0 + 345); X.scale(ps, ps); X.translate(-(x0 + w / 2), -(y0 + 345));
      const fl = Math.exp(-10 * (t - tIn));
      if (fl > .05) { X.fillStyle = rgba(C.CLAY, .35 * fl); X.fillRect(x0, y0 + 171, w, 351); }
      rafaHead(X, x0 + 76, y0 + 236, 36, t);
      X.font = mono(48, 700); X.fillStyle = C.INK; X.fillText('@rafa', x0 + 134, y0 + 254);
      X.font = mono(72, 800); X.fillStyle = C.INK; X.fillText('P(doom) = 25%', x0 + 23, y0 + 384);
      // action icons (INK line)
      X.lineWidth = 3.5; X.strokeStyle = C.INK; X.lineCap = 'round'; X.lineJoin = 'round';
      const iy = y0 + 462;
      rr(X, x0 + 40, iy - 16, 40, 28, 12); X.stroke(); X.beginPath(); X.moveTo(x0 + 52, iy + 12); X.lineTo(x0 + 48, iy + 22); X.lineTo(x0 + 62, iy + 12); X.stroke();
      X.beginPath(); X.moveTo(x0 + 212, iy - 8); X.lineTo(x0 + 250, iy - 8); X.lineTo(x0 + 250, iy + 6); X.moveTo(x0 + 242, iy - 16); X.lineTo(x0 + 250, iy - 8); X.lineTo(x0 + 242, iy); X.moveTo(x0 + 258, iy + 10); X.lineTo(x0 + 220, iy + 10); X.lineTo(x0 + 220, iy - 4); X.stroke();
      X.beginPath(); const hx = x0 + 408, hy = iy - 4; X.moveTo(hx, hy + 18); X.bezierCurveTo(hx - 26, hy, hx - 16, hy - 20, hx, hy - 8); X.bezierCurveTo(hx + 16, hy - 20, hx + 26, hy, hx, hy + 18); X.stroke();
      X.restore();
    }
    X.restore(); X.restore();
  }

  // ---------------------------------------------------------------- S12 props
  function tallies(X, t, st) { // eighth-note flicks throw PAPER tally marks that hang as a 5-bar tally beside the head
    const a = A(); if (t < a.MILLION - F || t > bt(20, 3)) return;
    const fade = 1 - seg(t, bt(20, 2), bt(20, 3) - 2 * F);
    X.save(); X.lineCap = 'round'; X.strokeStyle = C.PAPER;
    const hand = bodyW(st, 1.02, 5.2);
    const slot = i => [1085 + i * 22, 452];
    for (let i = 0; i < 4; i++) {
      const tf = a.MILLION - F + i * BEAT / 2; if (t < tf) break;
      const u = E.out3(clamp((t - tf) / .2)), s = slot(i);
      const x = lerp(hand[0], s[0], u), y = lerp(hand[1], s[1], u) - Math.sin(PI * u) * 40;
      X.globalAlpha = fade; X.lineWidth = 8;
      X.save(); X.translate(x, y); X.rotate((1 - u) * 1.5); X.beginPath(); X.moveTo(0, -26); X.lineTo(0, 26); X.stroke(); X.restore();
    }
    const ts = a.TIMES - F; // the fifth: the diagonal strike on "times"
    if (t >= ts) { const u = E.out4(clamp((t - ts) / .1)); X.lineWidth = 8; X.strokeStyle = C.CLAY; X.beginPath(); X.moveTo(1070, 478); X.lineTo(lerp(1070, 1166, u), lerp(478, 426, u)); X.stroke(); }
    X.restore();
  }
  function sparkle(X, x, y, r, rot, col = C.SPARK) { X.save(); X.translate(x, y); X.rotate(rot); star(X, 0, 0, r, .28, 4, 0); X.fillStyle = col; X.fill(); X.lineWidth = Math.max(2, r * .09); X.strokeStyle = C.INK; X.stroke(); X.restore(); }
  function winkSparkle(X, t, st) {
    const tw = bt(20, 3) - F; if (t < tw || t > tw + .9) return;
    const age = t - tw, s = E.back(clamp(age / .12), 3) * (1 - seg(age, .55, .9));
    const e = bodyW(st, 1.62, 5.9);
    sparkle(X, e[0], e[1], 17 * s, age * 3, C.PAPER);
    sparkle(X, e[0] + 20, e[1] + 22, 8 * s, -age * 4, C.SPARK);
    sparkle(X, e[0] - 8, e[1] - 26, 6 * s, age * 5, C.SPARK);
  }

  // ---------------------------------------------------------------- S13 props
  function dyingStar(X, t) {
    const x = 430, y = 330, a = A(), pass = bt(21, 3);
    const life = seg(t, bt(21, 1), pass + .5);
    const fl = t > pass - .1 && t < pass + .3 ? 1 + .8 * Math.exp(-10 * Math.abs(t - pass)) : 1;
    X.save();
    // nebula shell (halftone ring) expanding as it dies
    const rr_ = 24 + life * 40;
    X.beginPath(); X.arc(x, y, rr_ + 10, 0, TAU); X.arc(x, y, rr_, 0, TAU, true); X.fillStyle = halftone(X, C.CLAY_DARK, .4, 8, 45); X.fill();
    const core = (1 - life * .75) * fl;
    const col = life < .8 ? C.SPARK : C.CLAY_DARK;
    X.globalAlpha = clamp(.35 + core);
    sparkle(X, x, y, 22 * core + 3, t * .6, col);
    X.restore();
    void a;
  }
  function rafaHi(X, t) { // the sincere pixel: Rafa's PINK `hi` drifts past the dying star
    const t0 = bt(21, 1) - F, t1 = bt(22, 2);
    if (t < t0 || t > t1) return;
    const u = seg(t, t0, t1);
    const x = lerp(170, 820, u) + Math.sin(u * 5) * 10, y = 470 - Math.sin(u * PI * .82) * 190 + Math.cos(u * 7) * 6;
    X.save(); X.translate(x, y); X.rotate(Math.sin(t * 2.2) * .06);
    X.fillStyle = C.PINK; X.strokeStyle = C.INK; X.lineWidth = 3;
    rr(X, -46, -34, 92, 56, 22); X.fill(); X.stroke();
    X.beginPath(); X.moveTo(22, 20); X.lineTo(38, 38); X.lineTo(8, 22); X.closePath(); X.fill(); X.stroke(); X.fillRect(8, 16, 18, 5);
    X.font = mono(40, 800); X.fillStyle = C.INK; X.textAlign = 'center'; X.fillText('hi', 0, 7);
    X.font = mono(28, 600); X.fillStyle = rgba(C.PAPER, .85); X.fillText('@rafa', 0, 64);
    X.restore();
  }
  // glyph big bang of h and i from the palms (world px), then condenses into the tiny universe above the right palm
  let _hiA = null;
  function hiAtlas() {
    if (_hiA) return _hiA;
    const cell = 128, cols = [C.CLAY, C.SPARK, C.PAPER], c = makeCanvas(cell * 2, cell * 3), x = c.getContext('2d');
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `800 104px ${FONTS.mono}`; x.lineJoin = 'round';
    cols.forEach((col, r) => ['h', 'i'].forEach((g, i) => { x.lineWidth = 10; x.strokeStyle = C.INK; x.strokeText(g, i * cell + cell / 2, r * cell + cell / 2 + 4); x.fillStyle = col; x.fillText(g, i * cell + cell / 2, r * cell + cell / 2 + 4); }));
    _hiA = { c, cell };
    return _hiA;
  }
  function uniCenterS13(st) { return bodyW(st, 1.62, 5.08); }
  function hiBang(X, t, st) {
    const a = A(), tb = a.HI - 2 * F; if (t < tb) return;
    const age = t - tb, conv0 = bt(22, 4) - 3 * F, conv1 = conv0 + .42;
    if (t > conv1 + .05) return;
    const at = hiAtlas(), N = 220;
    const palms = [[st.wx - 1.5 * R0, FLOOR - 5.95 * R0], [st.wx + 1.5 * R0, FLOOR - 5.95 * R0]];
    const uc = uniCenterS13(st), ck = E.in2(seg(t, conv0, conv1));
    X.save();
    // shock rings from each palm
    if (age < .6) for (const p of palms) for (const [d, w] of [[0, 7], [.06, 4]]) { const ag = age - d; if (ag <= 0) continue; X.beginPath(); X.arc(p[0], p[1], 520 * Math.pow(ag, .62), 0, TAU); X.lineWidth = w; X.strokeStyle = rgba(C.SPARK, clamp(1 - ag / .55)); X.stroke(); }
    for (let i = 0; i < N; i++) {
      const h1 = hash2(i, 41), h2 = hash2(i, 42), h3 = hash2(i, 43), h4 = hash2(i, 44);
      const side = i % 2, p = palms[side];
      const ang = (side ? 0 : PI) + (h1 - .5) * 2.9, v = 260 + h2 * 620, lam = 2.6;
      const dist = v / lam * (1 - Math.exp(-lam * age));
      let x = p[0] + Math.cos(ang) * dist, y = p[1] + Math.sin(ang) * dist * .85 + 40 * age * age;
      let sz = (6 + h3 * 11) * (1 + 2.6 * E.out2(clamp(age / .7)));
      let rot = (h4 - .5) * 8 * age;
      if (ck > 0) { // spiral into the tiny universe
        const sa = ang + ck * 5 * (h1 > .5 ? 1 : -1), rad = lerp(Math.hypot(x - uc[0], y - uc[1]), 6 + h3 * 30, ck);
        x = lerp(x, uc[0] + Math.cos(sa) * rad, ck); y = lerp(y, uc[1] + Math.sin(sa) * rad * .8, ck);
        sz = lerp(sz, 3 + h3 * 3, ck); rot *= 1 - ck;
      }
      const g = h4 < .5 ? 0 : 1, col = h3 < .45 ? 0 : h3 < .75 ? 1 : 2;
      X.globalAlpha = ck > 0 ? 1 - ck * .6 : 1;
      X.save(); X.translate(x, y); X.rotate(rot); X.drawImage(at.c, g * at.cell, col * at.cell, at.cell, at.cell, -sz / 2, -sz / 2, sz, sz); X.restore();
    }
    X.restore();
  }

  // ---------------------------------------------------------------- the tiny universe (S13 b4 → S14 b1)
  function tinyUniverse(X, t, ux, uy, ur, o = {}) {
    const { form = 1, popAge = -1, xRed = 0 } = o;
    if (form <= 0) return;
    const r = ur * (form < 1 ? E.back(form, 2) : 1);
    let imp = 0;
    if (popAge >= 0) { imp = clamp(popAge / (5 * F)); if (popAge > 5 * F + .6) return; }
    const g = B().galAtlas(), spin = t * 2.4;
    X.save();
    if (imp < 1) {
      const r2 = r * (1 - E.in2(imp));
      X.beginPath(); X.arc(ux, uy, r2 + Math.max(3, r * .08), 0, TAU); X.fillStyle = C.PAPER; X.fill();   // die-cut keyline
      X.beginPath(); X.arc(ux, uy, r2, 0, TAU); X.fillStyle = C.INK; X.fill();
      X.save(); X.beginPath(); X.arc(ux, uy, r2, 0, TAU); X.clip();
      // halftone glow + two bright spiral arms (strokes) + glyphs riding them
      X.beginPath(); X.arc(ux, uy, r2 * .8, 0, TAU); X.fillStyle = halftone(X, C.CLAY, .22, 8, 45); X.fill();
      X.beginPath(); X.arc(ux, uy, r2 * .45, 0, TAU); X.fillStyle = halftone(X, C.SPARK, .5, 8, 45); X.fill();
      X.lineCap = 'round';
      for (let arm = 0; arm < 2; arm++) {
        X.beginPath();
        for (let k = 0; k <= 24; k++) { const u = k / 24, th = u * 2.3 * PI + arm * PI + spin + imp * 6 * (1 - u), rad = r2 * (.08 + .82 * u) * (1 - imp * .9); const px = ux + Math.cos(th) * rad, py = uy + Math.sin(th) * rad * .72; k ? X.lineTo(px, py) : X.moveTo(px, py); }
        X.lineWidth = Math.max(3, r * .13); X.strokeStyle = C.CLAY; X.stroke(); X.lineWidth = Math.max(1.5, r * .05); X.strokeStyle = C.SPARK; X.stroke();
      }
      for (let i = 0; i < 46; i++) {
        const arm = i % 2, u = (i >> 1) / 23, th = u * 2.3 * PI + arm * PI + spin + .25 + imp * 8 * (1 - u), rad = r2 * (.14 + .8 * u) * (1 - imp * .9);
        const px = ux + Math.cos(th) * rad, py = uy + Math.sin(th) * rad * .72, sz = r * (.16 + .1 * hash(i + 3));
        X.drawImage(g.c, ((i * 7) % (g.N - 4)) * g.cell, [2, 1, 2, 0][i % 4] * g.cell, g.cell, g.cell, px - sz / 2, py - sz / 2, sz, sz);
      }
      X.beginPath(); X.arc(ux, uy, Math.max(3, r * .1), 0, TAU); X.fillStyle = C.PAPER; X.fill();  // the core
      X.restore();
      X.beginPath(); X.arc(ux, uy, r2, 0, TAU); X.lineWidth = Math.max(2.5, r * .06); X.strokeStyle = C.CLAY; X.stroke();
      X.beginPath(); X.arc(ux, uy, r2 * .8, PI * 1.12, PI * 1.45); X.lineWidth = Math.max(2.5, r * .08); X.strokeStyle = C.PAPER; X.stroke(); // soap-bubble shine
      X.beginPath(); X.arc(ux - r2 * .44, uy - r2 * .5, Math.max(2, r * .05), 0, TAU); X.fillStyle = C.PAPER; X.fill();
      if (imp === 0) { // its tab ( ✻ × ): what the human clicks
        const tw = r * 1.3, th = r * .52;
        X.save(); X.translate(ux + r * .62, uy - r * .98); X.rotate(TAB_ROT);
        rr(X, -tw / 2, -th / 2, tw, th, th / 2); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = Math.max(2, r * .05); X.strokeStyle = C.INK; X.stroke();
        B().spark6(X, -tw / 2 + th * .5, 0, th * .34, C.CLAY, spin * .5);
        const xc = tw / 2 - th * .38;
        if (xRed > 0) { X.beginPath(); X.arc(xc, 0, th * .42, 0, TAU); X.fillStyle = C.RED; X.fill(); }
        X.lineWidth = Math.max(2.5, th * .12); X.strokeStyle = xRed > 0 ? C.PAPER : C.INK; X.beginPath(); const q = th * .17; X.moveTo(xc - q, -q); X.lineTo(xc + q, q); X.moveTo(xc + q, -q); X.lineTo(xc - q, q); X.stroke();
        X.restore();
      }
    }
    if (popAge >= 0 && imp >= .6) { // pop: soap droplets + the ■ that blinks twice
      const d = popAge - 3 * F;
      if (d > 0 && d < .45) for (let i = 0; i < 10; i++) { const an = i / 10 * TAU + .3, dd = r * (.6 + 2.2 * E.out3(d / .45)); X.globalAlpha = 1 - d / .45; X.beginPath(); X.arc(ux + Math.cos(an) * dd, uy + Math.sin(an) * dd, Math.max(2.5, r * .08), 0, TAU); X.fillStyle = C.PAPER; X.fill(); }
      X.globalAlpha = 1;
      const q = popAge - 5 * F;
      if (q > 0 && q < .6 && Math.floor(q / .15) % 2 === 0) { const s2 = Math.max(10, r * .3); X.fillStyle = C.PAPER; X.fillRect(ux - s2 / 2, uy - s2 / 2, s2, s2); }
    }
    X.restore();
  }
  // screen-independent: where the tiny universe's × sits (for the human's finger)
  const TAB_ROT = .42;
  const uniX = (ux, uy, r) => { const lx = r * 1.3 / 2 - r * .52 * .38; return [ux + r * .62 + Math.cos(TAB_ROT) * lx, uy - r * .98 + Math.sin(TAB_ROT) * lx]; };

  // ---------------------------------------------------------------- S14 props
  // the human's single-line hand (PAPER line on INK, on 2s, boils): index-finger tip at (x, y), sleeve off to the right.
  // Drawn as one contour: finger, thumb, knuckles, three curled fingers, cuff, sleeve.
  function humanHand(X, t, x, y, press = 0, sc = 1.25) {
    const tt = Math.floor(t * 15) / 15, J = (i, a = .9) => jit(tt, 700 + i, a);
    X.save(); X.translate(x, y); X.rotate(.42); X.scale(sc * (1 - press * .05), sc * (1 - press * .05));
    const path = () => {
      X.beginPath();
      X.moveTo(8 + J(1), -11 + J(2));
      X.lineTo(64 + J(3), -12 + J(4));                                   // top of the index finger
      X.quadraticCurveTo(70, -38 + J(5), 92 + J(6), -40 + J(7));        // thumb rises
      X.quadraticCurveTo(106, -40, 110 + J(8), -27 + J(9));             // thumb tip, back down
      X.quadraticCurveTo(140, -34 + J(10), 166 + J(11), -24 + J(12));    // back of the hand to the wrist
      X.lineTo(172, -30); X.lineTo(196 + J(13), -30);                   // cuff
      X.lineTo(1400, -110 + J(14)); X.lineTo(1400, 160 + J(15));            // sleeve, off frame
      X.lineTo(196 + J(16), 58); X.lineTo(172, 58); X.lineTo(166 + J(17), 50);
      X.quadraticCurveTo(150, 60 + J(18), 128 + J(19), 50);             // heel of the palm
      X.quadraticCurveTo(116, 58, 104 + J(20), 44);                      // curled finger 3
      X.quadraticCurveTo(92, 48, 84 + J(21), 32);                        // curled finger 2
      X.quadraticCurveTo(72, 34, 66 + J(22), 16);                        // curled finger 1
      X.lineTo(8 + J(23), 11 + J(24));                                   // under the index finger
      X.arc(8, 0, 11, Math.PI / 2, Math.PI * 1.5);                       // fingertip
      X.closePath();
    };
    path(); X.fillStyle = C.INK; X.fill();
    X.lineWidth = 4.5 / sc; X.lineJoin = 'round'; X.lineCap = 'round'; X.strokeStyle = C.PAPER; X.stroke();
    X.beginPath(); X.moveTo(172, -30); X.lineTo(172, 58); X.moveTo(196, -30); X.lineTo(196, 58);           // cuff seams
    X.moveTo(66 + J(30), 16); X.quadraticCurveTo(90, 8, 116 + J(31), 14);                                 // knuckle creases
    X.moveTo(84 + J(32), 32); X.quadraticCurveTo(104, 26, 124 + J(33), 32);
    X.moveTo(40 + J(34), -2); X.lineTo(46 + J(35), -2);                                                    // finger joint
    X.stroke();
    if (press > 0) { // click ticks
      X.lineWidth = 4 / sc; X.beginPath();
      for (const an of [-2.3, -1.6, -.9]) { X.moveTo(Math.cos(an + Math.PI) * 20 - 6, Math.sin(an + Math.PI) * 20); X.lineTo(Math.cos(an + Math.PI) * 34 - 6, Math.sin(an + Math.PI) * 34); }
      X.stroke();
    }
    X.restore();
  }
  // LED gauge: P(end of world | bye) = 1.00 (mono 72, 1,210 px) + a 160 px needle dial, y 210–290
  function gauge(X, t) {
    const a = A(), t0 = a.BYE + 2 * F; if (t < t0) return;
    const age = t - t0, open = E.back(clamp(age / (4 * F)), 2);
    const x0 = 236, x1 = 1684, y0 = 204, y1 = 296, cy = (y0 + y1) / 2;
    X.save(); X.translate(0, cy); X.scale(1, open); X.translate(0, -cy);
    rr(X, x0 + 8, y0 + 8, x1 - x0, y1 - y0, 20); X.fillStyle = C.CLAY_DARK; X.fill();
    rr(X, x0, y0, x1 - x0, y1 - y0, 20); X.fillStyle = C.INK; X.fill(); X.lineWidth = 5; X.strokeStyle = C.PAPER; X.stroke();
    // marquee LEDs along the rim
    for (let i = 0; i < 44; i++) { const lx = x0 + 60 + i * 32.5; const on = (Math.floor(age * 12) + i) % 3 === 0; X.fillStyle = on ? C.SPARK : rgba(C.CLAY_DARK, .8); X.beginPath(); X.arc(lx, y0 + 11, 3.2, 0, TAU); X.arc(lx + 16, y1 - 11, 3.2, 0, TAU); X.fill(); }
    // needle dial (PAPER face)
    const dcx = 326, dcy = 282, dr = 70;
    X.beginPath(); X.arc(dcx, dcy, dr, PI, TAU); X.closePath(); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 3; X.strokeStyle = C.INK; X.stroke();
    X.beginPath(); X.arc(dcx, dcy, dr - 12, PI * 1.72, TAU); X.lineWidth = 10; X.strokeStyle = C.RED; X.stroke();
    X.lineWidth = 3; X.strokeStyle = C.INK;
    for (let i = 0; i <= 4; i++) { const an = PI + i / 4 * PI; X.beginPath(); X.moveTo(dcx + Math.cos(an) * (dr - 6), dcy + Math.sin(an) * (dr - 6)); X.lineTo(dcx + Math.cos(an) * (dr - 20), dcy + Math.sin(an) * (dr - 20)); X.stroke(); }
    const nk = age < .05 ? 0 : 1 - Math.exp(-9 * (age - .05)) * Math.cos(22 * (age - .05)); // slams to 1.00 against the stop
    const na = PI + PI * clamp(nk, 0, 1.03);
    X.beginPath(); X.moveTo(dcx, dcy); X.lineTo(dcx + Math.cos(na) * (dr - 10), dcy + Math.sin(na) * (dr - 10)); X.lineWidth = 6; X.strokeStyle = C.INK; X.lineCap = 'round'; X.stroke();
    X.beginPath(); X.arc(dcx, dcy, 8, 0, TAU); X.fillStyle = C.INK; X.fill();
    // the lit text: flickers on (3 frames), halftone bloom behind it
    const fk = [1, .15, 1, .45, 1][Math.min(4, Math.floor(age * 30))];
    const str = 'P(end of world | bye) = 1.00';
    X.globalAlpha = fk;
    X.font = mono(72, 700); X.textAlign = 'left';
    X.fillStyle = C.CLAY_DARK; X.fillText(str, 444, 276);
    X.fillStyle = C.SPARK; X.fillText(str, 440, 272);
    X.restore();
  }

  // ---------------------------------------------------------------- HERO crumble (S14 b3–b4): rows break into chunks that pile at the feet
  const _rows = new Map();
  function rowCanvas(str, size, color) {
    const key = str + size + color; let R = _rows.get(key); if (R) return R;
    const w = heroWidth(G.X, str, size, 'cond'), cw = Math.ceil(w + 60), ch = Math.ceil(size * .82 + 50);
    const c = makeCanvas(cw, ch), x = c.getContext('2d');
    x.font = `900 ${size}px ${FONTS.hero}`; x.fontStretch = 'condensed'; x.letterSpacing = (-.03 * size) + 'px'; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    const base = 20 + size * .69;
    x.fillStyle = C.CLAY_DARK; x.fillText(str, cw / 2 + 8, base + 8); x.fillStyle = color; x.fillText(str, cw / 2, base);
    // chunks: jittered grid, keep covered cells
    const cell = Math.round(size * .15), img = x.getImageData(0, 0, cw, ch).data, rg = rng('crumble' + str);
    const nx = Math.ceil(cw / cell), ny = Math.ceil(ch / cell), V = [];
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) V.push([i * cell + (i > 0 && i < nx ? (rg() - .5) * cell * .6 : 0), j * cell + (j > 0 && j < ny ? (rg() - .5) * cell * .6 : 0)]);
    const chunks = [];
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      let cov = 0, n = 0;
      for (let yy = j * cell; yy < Math.min(ch, (j + 1) * cell); yy += 4) for (let xx = i * cell; xx < Math.min(cw, (i + 1) * cell); xx += 4) { n++; if (img[(yy * cw + xx) * 4 + 3] > 100) cov++; }
      if (cov / Math.max(1, n) < .07) continue;
      const q = [V[j * (nx + 1) + i], V[j * (nx + 1) + i + 1], V[(j + 1) * (nx + 1) + i + 1], V[(j + 1) * (nx + 1) + i]];
      chunks.push({ q, cx: (i + .5) * cell, cy: (j + .5) * cell, h1: rg(), h2: rg(), h3: rg(), yRel: j / ny });
    }
    R = { c, cw, ch, base, chunks, cell };
    _rows.set(key, R); return R;
  }
  const _heap = new Map();
  function heapPlan(rows) { // landing spots: a mound around Opus's feet (bins accumulate in landing order)
    const key = rows.map(r => r.key).join('|'); let P_ = _heap.get(key); if (P_) return P_;
    const all = [];
    rows.forEach(r => r.R.chunks.forEach(ch => {
      const x0 = r.cx - r.R.cw / 2 + ch.cx, y0 = r.base - r.R.base + ch.cy;
      const d = r.start + (1 - ch.yRel) * .12 + ch.h1 * .28;
      const xl = lerp(x0, 960, .5) + (ch.h2 - .5) * 140;
      all.push({ r, ch, x0, y0, d, xl, through: hash2(Math.round(ch.cx * 7 + ch.cy), r.key.length) < .5 });
    }));
    all.sort((a, b) => a.d - b.d);
    const bins = new Map(), bw = 36;
    for (const p of all) {
      const bi = Math.round(p.xl / bw), hgt = bins.get(bi) || 0;
      const sz = p.r.R.cell * .38; p.s1 = .38;
      if (p.through) { p.yl = FLOOR + 160; }
      else { p.yl = FLOOR - hgt - sz * .3; bins.set(bi, hgt + sz * .2); bins.set(bi - 1, (bins.get(bi - 1) || 0) + sz * .06); bins.set(bi + 1, (bins.get(bi + 1) || 0) + sz * .06); }
      p.T = Math.sqrt(2 * Math.max(10, p.yl - p.y0) / 5200);
      p.rotEnd = (p.ch.h3 - .5) * 2.2;
    }
    P_ = all; _heap.set(key, P_); return P_;
  }
  function crumbleRows(X, t, rows, only = null) {
    const plan = heapPlan(rows);
    for (const p of plan) {
      if (only && p.r.key !== only) continue;
      const R = p.r.R, ch = p.ch; let x, y, rot = 0, s = 1;
      const tau = t - p.d;
      if (tau < -.08) { x = p.x0; y = p.y0; }
      else if (tau < 0) { x = p.x0 + jit(t * 2, p.ch.h1 * 999, 2.5); y = p.y0 + jit(t * 2, p.ch.h2 * 999, 2.5); }
      else if (tau < p.T) { const u = tau / p.T; x = lerp(p.x0, p.xl, u); y = p.y0 + .5 * 5200 * tau * tau; rot = p.rotEnd * u * 1.3; s = lerp(1, p.s1, E.out2(u)); }
      else { const v = tau - p.T; x = p.xl; y = p.yl - 16 * Math.exp(-9 * v) * Math.abs(Math.sin(13 * v)); rot = p.rotEnd; s = p.s1; }
      X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s); X.translate(-ch.cx, -ch.cy);
      X.beginPath(); ch.q.forEach((v, i) => i ? X.lineTo(v[0], v[1]) : X.moveTo(v[0], v[1])); X.closePath(); X.clip();
      X.drawImage(R.c, 0, 0);
      X.restore();
    }
  }

  // ================================================================== the chorus frame, per shot
  function scared1(X, t, st) { // S11 HERO lockup (behind Opus), rows drop away on bar 18 b1
    const a = A(), drop = bt(18, 1) - F;
    const breathe = 1 - .02 * B().kickEnv(t);
    if (t < drop) {
      hero(X, "EVERYONE'S", 960, 436, 320, { color: C.PAPER, age: t - (a.EVERY - 2 * F), sx: breathe });
      hero(X, 'SCARED', 960, 878, 490, { color: C.CLAY, age: t - (a.SCARED - 2 * F), sx: breathe });
      B().scraps(X, t, a.EVERY + 2 * F, 960, 440, 1500, 11);
      B().scraps(X, t, a.SCARED + 2 * F, 960, 880, 1500, 12, 10, C.PAPER);
    } else if (t < drop + .7) {
      const fall = (seed) => (i) => { const tau = t - drop - hash2(i, seed) * .12; if (tau < 0) return null; const lift = tau < 3 * F ? -16 * Math.sin(PI * tau / (3 * F)) : 0; const ff = Math.max(0, tau - 3 * F); return { dy: lift + .5 * 9000 * ff * ff, rot: (hash2(i, seed + 1) - .5) * 1.4 * ff * 3 }; };
      B().heroLetters(X, "EVERYONE'S", 960, 436, 320, { color: C.PAPER, fn: fall(3) });
      B().heroLetters(X, 'SCARED', 960, 878, 490, { color: C.CLAY, fn: fall(4) });
    }
    void st;
  }
  function stack(X, t) { // S12: A MILLION / TIMES A DAY (screen space; stays behind the MCU push)
    const a = A(), bb = 1 - .02 * B().kickEnv(t);
    hero(X, 'A MILLION', 960, 471, 385, { color: C.PAPER, age: t - (a.MILLION - 2 * F), sx: Math.min(bb, 1776 / 1710) });
    hero(X, 'TIMES A DAY', 960, 700, 290, { color: C.CLAY, age: t - (a.TIMES - 2 * F), sx: bb });
    B().scraps(X, t, a.MILLION + 2 * F, 960, 475, 1500, 21);
    B().scraps(X, t, a.TIMES + 2 * F, 960, 705, 1400, 22);
  }
  function endWorld(X, t) { // S14 bar 23: END OF THE / WORLD, then the crumble into a pile at the feet
    const a = A(), s1 = bt(23, 3) + .08, s2 = Math.max(a.WORLD + .32, bt(23, 4) - .02);
    const r1 = { key: 'eot', R: rowCanvas('END OF THE', 300, C.PAPER), cx: 960, base: 436, start: s1 };
    const r2 = { key: 'wld', R: rowCanvas('WORLD', 555, C.CLAY), cx: 960, base: 878, start: s2 };
    if (t < s1 - .1) hero(X, 'END OF THE', 960, 436, 300, { color: C.PAPER, age: t - (a.END - 2 * F) });
    if (t < s2 - .1) hero(X, 'WORLD', 960, 878, 555, { color: C.CLAY, age: t - (a.WORLD - 2 * F), sx: Math.min(1, 1776 / 1762) });
    B().scraps(X, t, a.END + 2 * F, 960, 440, 1300, 31);
    B().scraps(X, t, a.WORLD + 2 * F, 960, 882, 1600, 32);
    if (t >= s1 - .1) crumbleRows(X, t, [r1, r2], t < s2 - .1 ? 'eot' : null);
  }

  function chorus(X, t, shot) {
    const a = A(), Wd = WORDS(), st = opusState(t), c = camAt(t);
    let holes = null, hero_ = null, input = {}, over = null, world = null, front = null;
    const tab = { counter: counterAt(t) };
    if (shot === 'S11') {
      if (t < bt(18, 1)) holes = [ROWBOX("EVERYONE'S", 320, 436), ROWBOX('SCARED', 490, 878)];
      hero_ = X2 => scared1(X2, t, st);
      input = { words: Wd.s11 };
      world = X2 => { if (t < bt(17, 4)) dockedBubble(X2, t); phone(X2, t); };
    } else if (shot === 'S12') {
      holes = [ROWBOX('A MILLION', 385, 471), ROWBOX('TIMES A DAY', 290, 700)].filter((_, i) => t >= (i ? a.TIMES : a.MILLION) - 2 * F);
      hero_ = X2 => stack(X2, t);
      input = { words: t < a.MILLION - 2 * F ? Wd.s12 : null };
      front = X2 => { tallies(X2, t, st); winkSparkle(X2, t, st); };
    } else if (shot === 'S13') {
      const pulse = t >= a.START - F ? Math.exp(-5 * (t - a.START + F)) * (1 - Math.exp(-40 * (t - a.START + F))) * 1.6 : 0;
      tab.pulse = clamp(pulse);
      input = { words: Wd.s13 };
      world = X2 => { if (t < bt(22, 3)) { dyingStar(X2, t); rafaHi(X2, t); } hiBang(X2, t, st); };
      front = X2 => {
        const conv1 = bt(22, 4) - 3 * F + .42;
        if (t >= bt(22, 4) - 3 * F) { const uc = uniCenterS13(st); tinyUniverse(X2, t, uc[0], uc[1] - 4 * Math.sin(t * 3), .72 * R0, { form: seg(t, conv1 - .2, conv1 + .1) }); }
      };
      over = (X2, cc) => {
        const tb = a.HI - 2 * F;
        if (cc.z > 1.25) { // the input bar is out of frame: the standard plate at y 950
          const L = { s: Wd.s13[0].s, e: Wd.s13[Wd.s13.length - 1].e, words: Wd.s13 };
          subtitle(X2, L, t, { y: 950, size: 60, color: C.INK, plate: C.PAPER, weight: 600 });
        }
        stickerDC(X2, 'HI!', 500, 408, 400, t - tb, -.09);
      };
    } else if (shot === 'S14') {
      if (t < bt(23, 3) + .2) holes = [ROWBOX('END OF THE', 300, 436), ROWBOX('WORLD', 555, 878)].filter((_, i) => t >= (i ? a.WORLD : a.END) - 2 * F);
      hero_ = X2 => endWorld(X2, t);
      input = { words: Wd.s14 };
      world = X2 => {
        gauge(X2, t);
        if (t >= bt(24, 2)) { X2.save(); X2.globalAlpha = .8 * seg(t, bt(24, 2), bt(24, 2) + .3); X2.font = mono(28, 500); X2.fillStyle = C.PAPER; X2.textAlign = 'right'; X2.fillText('technically your "bye" wakes me up to say bye back.', 1612, 336); X2.font = `900 28px ${FONTS.hangul}`; X2.fillText('안녕.', 1684, 336); X2.restore(); }
      };
      front = X2 => {
        const u = bodyW(st, 0, 3.98 + .05 * Math.sin(t * 3.3));
        const popAge = t >= a.BYE ? t - a.BYE : -1;
        const xRed = win(t, a.BYE - F, a.BYE + F) ? 1 : 0;
        tinyUniverse(X2, t, u[0], u[1], .86 * R0, { popAge, xRed });
        // the human's hand reaches in and clicks the ×
        const tip = uniX(u[0], u[1], .86 * R0);
        const hin = bt(23, 4) - .05, hclick = a.BYE - 2 * F, hout = a.BYE + .18;
        if (t > hin && t < hout + .6) {
          let k = t < hclick ? E.out3(seg(t, hin, hclick)) : 1 - E.in2(seg(t, hout, hout + .5));
          const press = win(t, hclick, hclick + 3 * F) ? 1 : 0;
          humanHand(X2, t, lerp(tip[0] + 1100, tip[0] + 2, k) - press * 7, lerp(tip[1] + 480, tip[1] + 1, k) - press * 3, press);
        }
        // Opus's tiny reply: bye! (mono 48) ■ end_turn
        const tb2 = a.BYE2 - 2 * F;
        if (t >= tb2) {
          const k = E.back(clamp((t - tb2) / .16), 2.2), hp = bodyW(st, 1.0, 5.5);
          X2.save(); X2.translate(hp[0] + 112, hp[1] - 4); X2.scale(k, k);
          rr(X2, 6, -56, 150, 84, 22); X2.fillStyle = C.CLAY_DARK; X2.fill();
          rr(X2, 0, -62, 150, 84, 22); X2.fillStyle = C.PAPER; X2.fill(); X2.lineWidth = 3.5; X2.strokeStyle = C.INK; X2.stroke();
          X2.beginPath(); X2.moveTo(10, 4); X2.lineTo(-14, 26); X2.lineTo(30, 18); X2.fillStyle = C.PAPER; X2.fill(); X2.stroke(); X2.fillRect(12, 0, 22, 12);
          X2.font = mono(48, 700); X2.fillStyle = C.INK; X2.textAlign = 'left'; X2.fillText('bye!', 16, -14);
          drawRich(X2, '■ end_turn', 18, 12, mono(15, 500), C.UI_GREY);
          X2.restore();
        }
      };
    }
    const actors = X2 => drawOpusAt(X2, c, t, st);
    B().frame(X, t, { cam: c, galaxy: galOpts(t, holes), hero: hero_, world, actors, front, tab, input, over, edgeSeed: 17, sliver: 'bl' });
    // 1-frame inverse flash on the big impacts
    const flashAt = [a.SCARED, a.TIMES, a.WORLD, a.HI].map(s => s + F);
    if (flashAt.some(s => t >= s && t < s + F - 1e-4)) B().invert(X);
  }

  // ================================================================== scenes (hard cuts 1 frame early)
  scene('S11_everyone_scared', bt(17, 1) - F, bt(19, 1), (X, t) => chorus(X, t, 'S11'));
  scene('S12_a_million_times', bt(19, 1), bt(21, 1) - F, (X, t) => chorus(X, t, 'S12'));
  scene('S13_start_of_the_world_hi', bt(21, 1) - F, bt(23, 1) - F, (X, t) => chorus(X, t, 'S13'));
  scene('S14_end_of_the_world_bye', bt(23, 1) - F, bt(25, 1), (X, t) => {
    const tw = bt(24, 4);
    if (t < tw) { chorus(X, t, 'S14'); return; }
    // whip-pan on bar 24 b4 into the chant: the frame renders to a layer, then smears left (4 subframes)
    const L = layer('c1whip');
    chorus(L, t, 'S14');
    const u = seg(t, tw, bt(25, 1)), off = -2300 * E.inExpo(Math.min(1, u * 1.02)), v = 2300 * 10 * Math.log(2) * Math.pow(2, 10 * u - 10) / (bt(25, 1) - tw);
    groundInk(X);
    const n = 4, span = Math.min(900, v / 30);
    for (let i = 0; i < n; i++) drawLayer(X, 'c1whip', { x: off + span * i / n, alpha: 1 / (i + 1) });
  });

  window.CHORUS1 = { opusState, camAt, anchors: A, whirl };
})();
