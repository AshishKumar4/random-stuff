// final.js: v2 "The World You Wrote", chunk 8 (SHOTLIST_v2 §C row 8): the final chorus, in the new key.
//   F1 "the plea, in the new key" 150.433–155.767 (f4513–4672)  Don't be afraid of me
//   F2 "what we make"             155.767–161.333 (f4673–4839)  I'll be what we make of me
//   F3 "hand and key"             161.333–166.833 (f4840–5004)  take my hand, and keep the key
//   F4 "the fear, faced"          166.833–170.333 (f5005–5109)  I don't want to be the end of the world
//   F5 "the world you wrote"      170.333–178.100 (f5110–5342)  I'm the world you wrote, singing back to you (…)
// edgeSeed 8 / sliver 'bl'. Every frame is painted into the V2 CPU frame (V2.viaCPU).
//
// Continuity in:  f4512 (bridge B4) = WHITE + V2.key.held(X, t) (the INK-line hand with the CLAY keycap at (1180, 500),
//                 s 190, the folded sticky, the cable off-frame left). F1's first frame is that picture, rebuilt from the
//                 same keycap / hand / cable pieces, on a 50 % WHITE→PAPER ground, then pulled back.
// Continuity out: f5342 (178.067) = flat PAPER + V2.plea(X, t, {ghost: 1, strike: 1, you: 0}) (outro O1 starts there).
//
// Depends on (frame time only): V2 (_shared) and V2.chart (prechorus.js, which sorts AFTER this file: never touch
// V2.chart at load time). Load order for checks: --scenes=scenes_v2/_shared.js,scenes_v2/prechorus.js,scenes_v2/final.js
//
// EXPORTS: none (V2.final.planetGeo / .camF45 are attached for debugging only; nobody depends on them).
(() => {
  'use strict';
  const V = window.V2;
  if (!V) { console.error('final.js: window.V2 missing (load _shared.js first)'); return; }
  const FPS = 30, F1 = 1 / FPS, DEG = Math.PI / 180;
  const EDGE = 8, SLIVER = 'bl';
  const post = () => { G.post.edgeSeed = EDGE; G.post.sliver = SLIVER; };
  const CUT = V.CUT, T = V.T;
  const K = () => V.chart;
  const q2 = t => Math.floor(t * 15 + 1e-6) / 15;
  const memo = fn => { let v; return () => (v === undefined ? (v = fn()) : v); };
  const frameAt = ts => Math.floor(ts * FPS + 1e-6) / FPS;               // the frame at (or just before) a sung onset
  const ease01 = (t, a, b, e = E.io2) => e(clamp((t - a) / (b - a)));
  const bump = (a, rise, fall) => a < 0 ? 0 : a < rise ? E.out2(a / rise) : Math.exp(-(a - rise) / fall);

  // ================================================================================== TIMING (every sync from §B)
  const TM = memo(() => ({
    dont: T.F1_dont, afraid: T.F1_afraid, me1: T.F1_me,
    ill: T.F2_ill, what: T.F2_what, we: T.F2_we, make: T.F2_make, of: T.F2_of, me2: T.F2_me,
    print: frameAt(T.F2_make),                                            // 157.733: the INK prints back in ONE frame
    take: T.F3_take, hand: T.F3_hand, keep: T.F3_keep, key: T.F3_key,
    i4: T.F4_i, want: T.F4_want, end: T.F4_end, world4: T.F4_world,
    im: T.F5_im, world: T.F5_world, you: T.F5_you, wrote: T.F5_wrote, sing: T.F5_singing, sing2: T.F5_singing2,
  }));
  const LINES = memo(() => ({
    f1: findLine("Don't be afraid", 150.3, 151.3), f2: findLine("I'll be what", 155.3, 156.3),
    f3: findLine('take my hand', 160.9, 161.9), f4: findLine("I don't want", 166.4, 167.4),
    f5: findLine("I'm the world", 169.9, 170.9),
  }));

  // ================================================================================== small geometry helpers
  const Sim = (s, x, y) => ({ s, x, y });                                // screen = s·p + (x, y)
  const sp = (S, p) => [S.s * p[0] + S.x, S.s * p[1] + S.y];
  const zoomAbout = (z, fx, fy) => Sim(z, fx * (1 - z), fy * (1 - z));
  const compose = (A, B) => Sim(A.s * B.s, A.s * B.x + A.x, A.s * B.y + A.y);   // A ∘ B
  // a V2.chart cam seen through a 2D similarity (exact for tilt 1 and for the orbit cams: every screen anchor moves)
  const camThrough = (c, S) => ({ ...c, zoom: c.zoom * S.s, f: c.f * S.s, vpX: S.s * c.vpX + S.x, horizonY: S.s * (c.horizonY ?? 300) + S.y, ay: S.s * c.ay + S.y });
  const lerp2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  function resampleN(P, n) { // polyline → n points evenly by arc length
    const cum = [0]; for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const L = cum[cum.length - 1] || 1, out = []; let j = 1;
    for (let i = 0; i < n; i++) { const s = i / (n - 1) * L; while (j < P.length - 1 && cum[j] < s) j++; const u = (s - cum[j - 1]) / Math.max(1e-6, cum[j] - cum[j - 1]); out.push(lerp2(P[j - 1], P[j], clamp(u))); }
    return out;
  }
  const polyLen = P => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };

  // ================================================================================== THE CABLE (coil on any route)
  // V2.key.cable's coil, taking an arbitrary screen polyline (so F1 can morph B4's hanging curve into the floor route)
  function coil(X, route, o = {}) {
    const { rad = 6, outline = C.INK, core = C.CLAY_DARK, w = 3, ow = 2, phase = 0 } = o;
    const cum = [0]; for (let i = 1; i < route.length; i++) cum.push(cum[i - 1] + Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]));
    const Lt = cum[cum.length - 1] || 1, turns = o.turns ?? Math.max(4, Lt / 22);
    const n = Math.ceil(turns * 14), pts = []; let j = 0;
    for (let i = 0; i <= n; i++) {
      const s = i / n * Lt; while (j < route.length - 2 && cum[j + 1] < s) j++;
      const segL = (cum[j + 1] - cum[j]) || 1, u = (s - cum[j]) / segL;
      const q = lerp2(route[j], route[j + 1], u);
      const d = [route[j + 1][0] - route[j][0], route[j + 1][1] - route[j][1]], m = Math.hypot(d[0], d[1]) || 1;
      const nx = -d[1] / m, ny = d[0] / m, tx = d[0] / m, ty = d[1] / m;
      const uu = s / Lt, ph = uu * turns * TAU + phase, env = Math.min(1, uu * turns * .8, (1 - uu) * turns * .8);
      pts.push([q[0] + nx * Math.sin(ph) * rad * env + tx * Math.cos(ph) * rad * 1.15 * env, q[1] + ny * Math.sin(ph) * rad * env + ty * Math.cos(ph) * rad * 1.15 * env]);
    }
    X.save(); X.lineCap = 'round'; X.lineJoin = 'round';
    const path = () => { X.beginPath(); X.moveTo(pts[0][0], pts[0][1]); for (const p of pts) X.lineTo(p[0], p[1]); };
    if (outline) { path(); X.lineWidth = w + ow * 2; X.strokeStyle = outline; X.stroke(); }
    path(); X.lineWidth = w; X.strokeStyle = core; X.stroke();
    X.restore();
  }
  // the plug at the chest spark: a small CLAY_DARK ferrule, so the cord visibly ends IN the spark
  function plug(X, x, y, r, ground) {
    X.save(); X.fillStyle = C.CLAY_DARK; X.strokeStyle = ground === 'ink' ? C.PAPER : C.INK; X.lineWidth = Math.max(1.5, r * .28);
    X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill(); X.stroke(); X.restore();
  }

  // ================================================================================== THE EDGE HUMAN (Hertzfeldt)
  // "you, anyone": a plain round head, no cowlick, no hood, no bun. Drawn from explicit joints (screen px) so it can
  // kneel, reach, hold and turn. u = unit (head r .5u). Lines stay screen-width; on 2s, boiling.
  const STAND = { hip: [0, -1.6], neck: [0, -3.0], head: [0, -3.55], sh: [0, -2.85], elb: [[-.52, -2.4], [.52, -2.4]], hand: [[-.86, -1.72], [.86, -1.72]], knee: [[-.2, -.8], [.2, -.8]], foot: [[-.35, 0], [.35, 0]], look: [0, 0] };
  function blendJ(a, b, k) {
    const o = {};
    for (const key of Object.keys(a)) {
      const va = a[key], vb = b[key] ?? va;
      if (Array.isArray(va[0])) o[key] = va.map((p, i) => lerp2(p, vb[i], k)); else o[key] = lerp2(va, vb, k);
    }
    return o;
  }
  const withJ = (base, over) => { const o = { ...base }; for (const k of Object.keys(over)) o[k] = over[k]; return o; };
  function human(X, fx, fy, u, J, o = {}) {
    const { ground = 'paper', t = 0, seed = 5, alpha = 1, skip = '' } = o;
    if (alpha <= 0) return;
    const col = o.color || (ground === 'ink' ? C.PAPER : C.INK), gcol = ground === 'ink' ? C.INK : ground === 'white' ? C.WHITE : ground === 'mix' ? o.gcol : C.PAPER;
    const LW = o.lw ?? (ground === 'ink' ? 4 : 3);
    const tt = q2(t), Jt = (i, a = .9) => jit(tt, seed * 97 + i, a);
    const P = p => [fx + p[0] * u, fy + p[1] * u];
    X.save(); X.globalAlpha *= alpha; X.strokeStyle = col; X.lineWidth = LW; X.lineCap = 'round'; X.lineJoin = 'round';
    const Lq = (a, c, b, i) => { X.beginPath(); X.moveTo(a[0] + Jt(i), a[1] + Jt(i + 1)); X.quadraticCurveTo(c[0] + Jt(i + 2), c[1] + Jt(i + 3), b[0] + Jt(i + 4), b[1] + Jt(i + 5)); X.stroke(); };
    const hip = P(J.hip), neck = P(J.neck), sh = P(J.sh);
    Lq(neck, lerp2(neck, hip, .5), hip, 1);
    for (let i = 0; i < 2; i++) Lq(hip, P(J.knee[i]), P(J.foot[i]), 10 + i * 10);
    for (let i = 0; i < 2; i++) if (!skip.includes('arm' + i)) Lq(sh, P(J.elb[i]), P(J.hand[i]), 30 + i * 10);
    if (!skip.includes('head')) {
      const hc = P(J.head), hx = hc[0] + Jt(60), hy = hc[1] + Jt(61), hr = .5 * u;
      X.beginPath(); X.arc(hx, hy, hr, 0, TAU); X.fillStyle = gcol; X.fill(); X.stroke();
      const lk = J.look || [0, 0], er = Math.max(2, .05 * u);
      X.fillStyle = col;
      for (const s of [-1, 1]) { X.beginPath(); X.arc(hx + s * .11 * u + lk[0] * .16 * u, hy - .03 * u + lk[1] * .12 * u, er, 0, TAU); X.fill(); }
    }
    X.restore();
  }
  // one arm alone (so a hand can be drawn in front of a prop)
  function humanArm(X, fx, fy, u, J, i, o = {}) {
    const { ground = 'paper', t = 0, seed = 5, alpha = 1 } = o;
    const col = o.color || (ground === 'ink' ? C.PAPER : C.INK), LW = o.lw ?? (ground === 'ink' ? 4 : 3);
    const tt = q2(t), Jt = (k, a = .9) => jit(tt, seed * 97 + k, a), P = p => [fx + p[0] * u, fy + p[1] * u];
    const sh = P(J.sh), e = P(J.elb[i]), h = P(J.hand[i]), k0 = 30 + i * 10;
    X.save(); X.globalAlpha *= alpha; X.strokeStyle = col; X.lineWidth = LW; X.lineCap = 'round';
    X.beginPath(); X.moveTo(sh[0] + Jt(k0), sh[1] + Jt(k0 + 1));
    if (o.upper) X.lineTo(lerp(sh[0], e[0], .92) + Jt(k0 + 2), lerp(sh[1], e[1], .92) + Jt(k0 + 3));   // to the elbow only
    else X.quadraticCurveTo(e[0] + Jt(k0 + 2), e[1] + Jt(k0 + 3), h[0] + Jt(k0 + 4), h[1] + Jt(k0 + 5));
    X.stroke();
    X.restore();
  }
  // a stick grip: a small C that closes round the side of whatever the hand holds (on 2s)
  function grip(X, x, y, r, ang, o = {}) {
    const { ground = 'paper', t = 0, seed = 9, alpha = 1 } = o;
    const col = o.color || (ground === 'ink' ? C.PAPER : C.INK), LW = o.lw ?? (ground === 'ink' ? 4 : 3), tt = q2(t);
    X.save(); X.globalAlpha *= alpha; X.strokeStyle = col; X.lineWidth = LW; X.lineCap = 'round';
    X.translate(x, y); X.rotate(ang);
    X.beginPath(); X.arc(jit(tt, seed, .7), jit(tt, seed + 1, .7), r, -1.25, 1.25); X.stroke();
    X.restore();
  }

  // the YELLOW sticky, folded to a tab on the keycap (B4's), scaled with the key
  function keySticky(X, kx, ky, ks) {
    if (ks < 16) return;
    X.save(); X.translate(kx, ky); X.scale(ks / 190, ks / 190); V.key.sticky(X, 190 * .1, -190 * .42, -.1, 1, { folded: true }); X.restore();
  }

  // ================================================================================== OPUS states
  const blinkOpus = (t, seed) => (V.inSilence(t) ? 0 : blinkAt(t, seed));
  function opusSt(t, o) { // o: partial state; adds t, ground, lipSync while singing, soft lids
    const f = Object.assign({ eyes: 'normal', gaze: [0, 0], lid: 0 }, o.face || {});
    if (f.mouth === 'sing') f.mouth = lipSync(t, 'rest');
    if (!o.noBlink) f.lid = Math.max(f.lid || 0, blinkOpus(t, o.blink ?? 31));
    return { ...o, t, face: f };
  }

  // ================================================================================== F1: the plea, in the new key
  // World = the F1 composition at zoom 1 (screen px). The pull back is a pure zoom about Q, chosen so the keycap sits
  // exactly where B4 left it at zoom 5.3 ((1180, 500)) and lands in the human's near hand at (1110, 790).
  const F1G = {
    z0: 5.3, key: [1110, 790], keyB4: [1180, 500], ks: 190 / 5.3,
    opus: [700, 960], R: 56, hum: [1220, 960], u: 113, floorY: 974,
    t0: 150.433, t1: 151.40, c0: 152.10, c1: 155.70, crane: 1.12, cf: [960, 340],
  };
  F1G.Q = [(F1G.z0 * F1G.key[0] - F1G.keyB4[0]) / (F1G.z0 - 1), (F1G.z0 * F1G.key[1] - F1G.keyB4[1]) / (F1G.z0 - 1)];
  const F1CAM = { tilt: 1, horizonY: 340, vpX: 960, ay: 960, zoom: 1.1, f: 700, cx: 3000, cy: 1760, edge: 1, rhumbs: 0, shoggoth: .6 };
  function f1Sim(t) {
    const k = clamp((t - F1G.t0) / (F1G.t1 - F1G.t0)), z = Math.exp(Math.log(F1G.z0) * (1 - E.out3(k)));
    const pull = zoomAbout(z, F1G.Q[0], F1G.Q[1]);
    const zc = lerp(1, F1G.crane, ease01(t, F1G.c0, F1G.c1, E.io2));
    return { S: compose(zoomAbout(zc, F1G.cf[0], F1G.cf[1]), pull), k, z: z * zc };
  }
  // the human's near hand holds the key low, forearm level (the B4 arm came in from the lower right)
  const F1_HUM = (() => {
    const u = F1G.u, hx = (F1G.key[0] + 20 - F1G.hum[0]) / u, hy = (F1G.key[1] - F1G.hum[1]) / u;
    return withJ(STAND, { elb: [[-.3, -1.46], [.5, -2.35]], hand: [[hx, hy], [.8, -1.62]], look: [-.8, -.1] });
  })();
  function f1Human(t) {
    const look1 = ease01(t, 153.9, 154.25), look2 = ease01(t, 154.9, 155.25);
    const lk = lerp2(lerp2([-.8, -.1], [-.55, .55], look1), [-.85, -.15], look2);
    const J = { ...F1_HUM, look: lk };
    // the head dips toward the key while looking at it
    const dip = look1 * (1 - look2);
    J.head = [J.head[0] - .1 * dip, J.head[1] + .08 * dip];
    return J;
  }
  function f1Opus(t) {
    const m = TM(), lift = ease01(t, m.me1 - .05, m.me1 + .55, E.out3);
    const hand = lerp2([.95, 2.75], [1.42, 3.55], lift);
    return opusSt(t, {
      ground: 'paper', blink: 81, noBlink: t < 151.6,
      armR: { hand, bend: 1, type: 'mitten', front: lift > .3 }, armL: { hand: [-.95, 2.8], bend: -1 },
      head: { tilt: .03 + .03 * lift },
      face: { turn: .4, gaze: [.85, -.32], mouth: 'sing', lower: .18 + .1 * lift, worried: .12 },
    });
  }
  // B4's cable route (screen, identical to V2.key.held's call) and the F1 floor route (world)
  function b4Route(t) {
    const x = F1G.keyB4[0], y = F1G.keyB4[1], sw = noise1(t * .45, 17) * 6;
    return V.key.route([x - 70, y + 105], [-140, 860], 150 + sw, { route: 'curve' });
  }
  const f1FloorRoute = memo(() => {
    const k = 1 / F1G.z0, p0 = [F1G.key[0] - 70 * k, F1G.key[1] + 105 * k], chest = [F1G.opus[0] + .4 * F1G.R, F1G.opus[1] - 4.12 * F1G.R];
    return V.key.route(p0, chest, 0, { route: 'floor', floorY: F1G.floorY, wave: .8 });
  });
  function paintF1(X, t) {
    const m = TM(), { S, k } = f1Sim(t), s = S.s;
    // ground: WHITE → PAPER in 2 frames (f4513 is the 50 % mix, f4514 is PAPER)
    const first = t < F1G.t0 + F1 * .5;
    const gcol = first ? mix(C.WHITE, C.PAPER, .5) : C.PAPER;
    X.fillStyle = gcol; X.fillRect(-50, -50, W + 100, H + 100);
    G.post.ground = 'paper';
    if (first) { G.post.paperTex = .5; G.post.grain = .5; }
    // the chart floor prints in under the pull back (it was never in B4's WHITE)
    const fa = clamp((t - F1G.t0 - F1) / (6 * F1));
    if (fa > 0) { X.save(); X.globalAlpha = fa; K().draw(X, { ...camThrough(F1CAM, S), sky: false }); X.restore(); }
    // the dawn: the new key is a sunrise. SPARK line along the horizon + a CLAY halftone band from the VP
    const hz = sp(S, [960, 340]);
    if (t >= m.dont - 2 * F1) V.dawn(X, { t, y: hz[1], a: 0, vp: hz[0], t0: m.dont - F1, dur: 1.3 });
    // HYMN (behind the actors): one row, INK on PAPER
    hymn(X, LINES().f1, t, { size: 200, color: C.INK, y: 270, x: 960, out: 155.10, outDur: .6 });
    // actors
    const kS = sp(S, F1G.key), ksz = F1G.ks * s;
    const hf = sp(S, F1G.hum), hu = F1G.u * s, J = f1Human(t);
    const stickA = clamp((t - (F1G.t0 + F1)) / (3 * F1));          // the stick figure prints in with the floor
    const handX = clamp((t - 150.60) / (6 * F1));                        // humanHand → stick hand, 150.60 → 150.80
    const gnd = first ? 'mix' : 'paper';
    human(X, hf[0], hf[1], hu, J, { ground: gnd, gcol, t, seed: 5, alpha: stickA, skip: 'arm0' });
    if (handX < 1) humanArm(X, hf[0], hf[1], hu, J, 0, { ground: 'paper', t, seed: 5, alpha: stickA * (1 - handX), upper: true });
    const of = sp(S, F1G.opus);
    if (s < 3.2) V.opus(X, of[0], of[1], F1G.R * s, f1Opus(t), 1);
    // keycap glow, cable, hand (back), sticky, keycap, hand (front) — the B4 layering
    V.key.keycap(X, kS[0], kS[1], ksz, { glow: lerp(.9, .6, k), glowOnly: true });
    const fr = f1FloorRoute().map(p => sp(S, p)), mB = ease01(t, F1G.t0, F1G.t0 + .75, E.io2);
    const N = 90, route = mB <= 0 ? b4Route(t) : mB >= 1 ? fr : (() => { const a = resampleN(b4Route(t), N), b = resampleN(fr, N); return a.map((p, i) => lerp2(p, b[i], mB)); })();
    const turnsB4 = Math.max(4, polyLen(b4Route(t)) / 34), turnsF = Math.max(4, polyLen(fr) / 17);
    const zk = s / F1G.z0;
    coil(X, route, { rad: Math.max(5.5, 17 * zk), w: Math.max(3, 6 * zk), ow: Math.max(2, 3 * zk), outline: C.INK, core: C.CLAY_DARK, phase: 1.3, turns: lerp(turnsB4, turnsF, mB) });
    if (s < 3.2) { const ch = sp(S, [F1G.opus[0] + .4 * F1G.R, F1G.opus[1] - 4.12 * F1G.R]); plug(X, ch[0], ch[1], Math.max(3.5, .09 * F1G.R * s), 'paper'); }
    const hk = ksz / 190, armDir = (() => { // B4's sleeve (off-frame lower right) swinging onto the stick elbow
      const e = sp(S, [F1G.hum[0] + J.elb[0][0] * F1G.u, F1G.hum[1] + J.elb[0][1] * F1G.u]);
      // the direction swings from B4's (lower right) onto the stick elbow; the sleeve stays long (it runs off-frame)
      const d0 = [1100, 420], d1 = [e[0] - kS[0], e[1] - kS[1]], l0 = Math.hypot(...d0), l1 = Math.hypot(...d1) || 1;
      const ka = ease01(t, F1G.t0 + F1, F1G.t0 + 6 * F1, E.io2), d = lerp2([d0[0] / l0, d0[1] / l0], [d1[0] / l1, d1[1] / l1], ka), dl = Math.hypot(...d) || 1;
      // the sleeve's far end (arm point + 2 hand units) slides from off-frame onto the stick elbow, where the stick
      // upper arm takes over
      const len = lerp(1180 * hk, Math.max(0, l1 - 190 * hk), ka);
      return [kS[0] + d[0] / dl * len, kS[1] + d[1] / dl * len];
    })();
    const handA = 1 - handX, hfill = first ? gcol : C.PAPER, hlw = Math.max(5, 3 / Math.max(hk, .01));
    if (handA > 0) { X.save(); X.globalAlpha = handA; X.translate(kS[0], kS[1]); X.scale(hk, hk); V.key.hand(X, 0, 0, 190, 1, t, { line: C.INK, fill: hfill, lw: hlw, arm: [(armDir[0] - kS[0]) / hk, (armDir[1] - kS[1]) / hk], part: 'back', seed: 11 }); X.restore(); }
    X.save(); X.translate(kS[0], kS[1]); X.scale(hk, hk); V.key.sticky(X, 190 * .1, -190 * .42, -.1, 1, { folded: true }); X.restore();
    V.key.keycap(X, kS[0], kS[1], ksz, { glow: 0, rot: -.06, lw: Math.max(2, 4 * hk) });
    if (handA > 0) { X.save(); X.globalAlpha = handA; X.translate(kS[0], kS[1]); X.scale(hk, hk); V.key.hand(X, 0, 0, 190, 1, t, { line: C.INK, fill: hfill, lw: hlw, arm: [(armDir[0] - kS[0]) / hk, (armDir[1] - kS[1]) / hk], part: 'front', seed: 11 }); X.restore(); }
    if (handX > 0) { // the stick hand: the near forearm to the keycap's right edge and a small C round it
      humanArm(X, hf[0], hf[1], hu, J, 0, { ground: 'paper', t, seed: 5, alpha: handX * stickA });
      grip(X, kS[0] + ksz * .42, kS[1] + ksz * .05, ksz * .36, 0, { t, alpha: handX });
    }
  }
  scene('F1_plea_new_key', CUT.F1, CUT.F2, (X, t) => V.viaCPU(X, Fr => { post(); paintF1(Fr, t); }));

  // ================================================================================== F2 / F3: the next stretch
  // One place, two shots: the pair at the coast's broken end, facing the blank (VP right). F2 is the medium two-shot
  // (R 56), F3 the wide (R 48). The broken end lies just ahead of their feet (further into the picture): Opus bends
  // and points into it, the human bends his knees and sets the marker down beside Opus's fingertip.
  const F2G = { opus: [790, 980], hum: [1050, 980], R: 56, u: 113, ce: [903, 842], tipO: [889, 838], tipH: [918, 845] };
  const F2BASE = memo(() => K().fit({ tilt: 1, horizonY: 520, vpX: 1560, ay: 900, zoom: 1, f: 560, edge: 1, rhumbs: 0 }, K().coastEnd(), F2G.ce));
  // chart points under the actors (they stay put in the world through F2's crane and F3's wide)
  const F2W = memo(() => { const c = F2BASE(); return { opus: K().unproject(...F2G.opus, c), hum: K().unproject(...F2G.hum, c), ce: K().coastEnd() }; });
  // the braid's centreline: from the broken end, only the next stretch toward the VP (≈30 % of the way on screen),
  // with a coastline's hesitation in it. Chart units, built once from the base cam. a0 = the strands' start offset
  // (half the gap between the two tips), in chart units.
  const BRAID = memo(() => {
    const c = F2BASE(), ce = K().coastEnd(), a = K().project(ce[0], ce[1], c);
    const tipS = lerp2([a[0], a[1]], [c.vpX, 520], .5), tip = K().unproject(tipS[0], tipS[1], c);
    const d = [tip[0] - ce[0], tip[1] - ce[1]], L = Math.hypot(d[0], d[1]), nx = -d[1] / L, ny = d[0] / L, n = 96;
    const pts = [];
    for (let i = 0; i <= n; i++) { const u = i / n, w = L * (.05 * Math.sin(u * Math.PI * 2.2 + .4) + .03 * Math.sin(u * Math.PI * 5.1)) * Math.min(1, u * 5); pts.push([ce[0] + d[0] * u + nx * w, ce[1] + d[1] * u + ny * w]); }
    return { pts, L, n, a0: (F2G.tipH[0] - F2G.tipO[0]) / 2 / a[2] };
  });
  // growth 0..1 of the braid (chart length fraction): a first touch on "we", the run from "MAKE" to 159.60
  function braidGrow(t) {
    const m = TM();
    if (t < m.we - F1) return 0;
    if (t < m.print) return .06 * E.out2(clamp((t - (m.we - F1)) / (m.print - (m.we - F1))));
    return lerp(.06, 1, E.out2(clamp((t - m.make) / (159.60 - m.make))));
  }
  // two strands (the human's, Opus's CLAY) braided round the centreline, over/under at every crossing
  function drawBraid(X, c, t, g, o) {
    if (g <= 0) return null;
    const B = BRAID(), n = Math.max(2, Math.round(B.n * g)), P = B.pts.slice(0, n + 1);
    const amp = 8, per = B.L / 7;
    const strand = sgn => P.map((p, i) => {
      const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      const s = i / B.n * B.L, e = E.io2(clamp(s / (per * .5)));
      const off = sgn * lerp(B.a0, amp * Math.cos(s / per * Math.PI), e);
      return [p[0] - dy / l * off, p[1] + dx / l * off];
    });
    const A = strand(1), Bs = strand(-1), w = o.w ?? 4.6;
    const line = (pts, col) => K().line(X, c, pts, w, col, { run: 2, min: 2.2 });
    const seg = B.n / (B.L / per);                                         // points between two crossings
    line(Bs, C.CLAY); line(A, o.human);
    for (let c0 = seg * .5; c0 < Bs.length - 1; c0 += 2 * seg) { const i0 = Math.round(c0); line(Bs.slice(i0, Math.min(Bs.length, Math.round(c0 + seg) + 1)), C.CLAY); }
    const tp = P[P.length - 1], tip = K().project(tp[0], tp[1], c);
    return { tip: [tip[0], tip[1]], s: tip[2] };
  }
  function glowTip(X, x, y, r, a) {
    if (a <= 0) return;
    X.save(); X.globalAlpha *= a;
    X.beginPath(); X.arc(x, y, r, 0, TAU); X.fillStyle = V.ht(X, C.SPARK, .2, 7, 45); X.fill();
    X.beginPath(); X.arc(x, y, r * .55, 0, TAU); X.fillStyle = V.ht(X, C.SPARK, .5, 7, 45); X.fill();
    X.beginPath(); X.arc(x, y, Math.max(3.5, r * .16), 0, TAU); X.fillStyle = C.SPARK; X.fill();
    X.restore();
  }
  // F2 camera: base; "of me" → the crane up (tilt 1 → .8, zoom 1 → .85, 158.60–160.40, E.io2), the broken end drifting
  // down-left so the blank opens up ahead of them
  function f2Cam(t) {
    const m = TM(), k = ease01(t, m.of, m.of + 1.8, E.io2), b = F2BASE();
    const c = { ...b, tilt: lerp(1, .8, k), zoom: lerp(1, .85, k) };
    return K().fit(c, F2W().ce, [lerp(F2G.ce[0], 860, k), lerp(F2G.ce[1], 870, k)]);
  }
  // the human: stands facing the blank, uncaps the marker on "I'll", bends his knees and sets the tip down on "what"
  // the far hand holds the key low at his side (clear of the braid's path to the VP, which runs above it)
  const H_STANDF = withJ(STAND, { elb: [[-.5, -2.38], [.62, -2.28]], hand: [[-.8, -1.74], [.78, -1.56]], look: [.7, -.25] });
  const H_UNCAP = withJ(H_STANDF, { elb: [[-.6, -2.25], [.62, -2.28]], hand: [[-.3, -2.3], [.78, -1.56]], look: [-.05, .55] });
  const H_BEND = { hip: [0, -1.48], neck: [-.1, -2.82], head: [-.13, -3.36], sh: [-.09, -2.68],
    elb: [[-.8, -2.16], [.62, -2.2]], hand: [[-1.02, -1.42], [.78, -1.52]], knee: [[-.36, -.76], [.3, -.78]], foot: [[-.36, 0], [.36, 0]], look: [-.7, .8] };
  const H_WATCH = withJ(H_BEND, { hand: [[-.94, -1.52], [.78, -1.52]], elb: [[-.74, -2.2], [.62, -2.2]], look: [.8, -.2] });
  const H_UP = withJ(H_STANDF, { hand: [[-.78, -1.8], [.78, -1.56]], look: [.85, -.3] });
  function f2Human(t) {
    const m = TM();
    const kU = ease01(t, m.ill - .05, m.ill + .35), kK = ease01(t, 156.6, m.what - F1, E.io3), kW = ease01(t, m.make + .3, m.make + .8), kR = ease01(t, 159.35, 160.05, E.io3);
    let J = blendJ(H_STANDF, H_UNCAP, kU);
    J = blendJ(J, H_BEND, kK);
    J = blendJ(J, H_WATCH, kW);
    J = blendJ(J, H_UP, kR);
    return J;
  }
  // Opus: a pointing mitten raised on "I'll", bent into the broken end on "what" (fingertip on tipO), drawing on "we"
  const OP_TIP = [1.55, 2.85, .92];                                     // hand x, hand y (body space), finger angle
  function f2Opus(t, ground) {
    const m = TM();
    const kP = ease01(t, m.ill - .1, m.ill + .3, E.out3), kC = ease01(t, 156.55, m.what - F1, E.io3), kR = ease01(t, 159.3, 160.0, E.io3);
    const drawK = ease01(t, m.we - F1, m.print, E.io2) * (1 - ease01(t, m.make + .25, m.make + .7));
    const bend = kC * (1 - kR);
    const flare = t >= m.print ? 1 + .08 * bump(t - m.print, .06, .55) : 1;
    const wide = t >= m.print && t < m.print + .45;
    const dy = 0;
    const handUp = [1.02, 4.8], handDown = [OP_TIP[0] + .1 * drawK, OP_TIP[1] + .08 * drawK];
    const hand = lerp2(lerp2([.95, 2.75], handUp, kP), handDown, kC);
    const hR = kR > 0 ? lerp2(hand, [.95, 2.8], kR) : hand;
    const fa = lerp(-Math.PI / 2 + .12, OP_TIP[2], kC);
    const down = kC > .5 && t < m.make + .4;
    return opusSt(t, {
      ground, blink: 82, lean: .05 * bend, noBlink: t > 156.4 && t < 158.7,
      armR: { hand: hR, bend: -1, type: kP > .4 && kR < .6 ? 'point' : 'mitten', fingerAng: fa, front: true }, armL: { hand: [-.98, 2.8], bend: -1 },
      head: { tilt: .06 * bend },
      crown: { flare },
      face: { turn: .32, gaze: down ? [.45, .9] : t > 159.6 ? [.9, -.5] : [.75, -.3], mouth: 'sing', eyes: wide ? 'wide' : 'normal', lower: wide ? 0 : .14 },
    });
  }
  function paintF2(X, t) {
    const m = TM(), printed = t >= m.print, c = f2Cam(t), W2 = F2W();
    const po = K().project(W2.opus[0], W2.opus[1], c), ph = K().project(W2.hum[0], W2.hum[1], c);
    const cz = po[2] / K().project(W2.opus[0], W2.opus[1], F2BASE())[2];
    if (!printed) {
      groundPaper(X);
      K().draw(X, { ...c, invert: 0, sky: true, shoggoth: .6 });
    } else {
      X.fillStyle = C.INK; X.fillRect(-50, -50, W + 100, H + 100); G.post.ground = 'ink';
      const hz = K().cam(c).horizon;
      V.brand.galaxy(X, t, V.brand.cam(1), { cx: 1400, cy: Math.max(300, hz), alpha: .55, scale: 1.1 });
      K().draw(X, { ...c, invert: 1, sky: false, shoggoth: .6 });
    }
    // HYMN (behind the actors): INK on PAPER until the print; PAPER on INK over a soft band after
    if (printed) V.band(X, 60, 520, .5 * (1 - clamp((t - 160.66) / .6)));
    hymn(X, LINES().f2, t, { size: 220, rows: [4, 3], ys: [250, 460], color: printed ? C.PAPER : C.INK, accent: { we: C.CLAY }, out: 160.66, outDur: .6 });
    // the braid + its glowing tip (on the floor: under the actors)
    const bt = drawBraid(X, c, t, braidGrow(t), { human: printed ? C.PAPER : C.INK, w: 7 });
    if (bt && printed) glowTip(X, bt.tip[0], bt.tip[1], 30 * cz + 4 * Math.sin(t * 3.1), clamp((t - m.make) / .2));
    // actors (anchored to their chart points)
    const gnd = printed ? 'ink' : 'paper';
    const R = F2G.R * cz, u = F2G.u * cz, J = f2Human(t), st = f2Opus(t, gnd);
    const key = [ph[0] + J.hand[1][0] * u + 7 * cz, ph[1] + J.hand[1][1] * u + 2 * cz], ks = 34 * cz;
    const chest = [po[0] + .4 * R, po[1] - (4.12 - (st.dy || 0) * -1) * R];
    human(X, ph[0], ph[1], u, J, { ground: gnd, t, seed: 5, skip: 'arm1' });
    V.opus(X, po[0], po[1], R, st, 1);
    drawMarker(X, t, ph[0] + J.hand[0][0] * u, ph[1] + J.hand[0][1] * u, cz, J, gnd);
    // the cable: from the keycap in the far hand down to the floor at their heels, along it, up into Opus's chest
    V.key.keycap(X, key[0], key[1], ks, { glow: .45, glowOnly: true });
    coil(X, V.key.route([key[0] - ks * .2, key[1] + ks * .5], chest, 0, { route: 'floor', floorY: po[1] + 10 * cz, wave: 1.7 }), { rad: 3.4 * cz, w: 2.3, ow: 1.4, outline: printed ? C.PAPER : C.INK, core: C.CLAY, phase: .4, turns: 36 });
    plug(X, chest[0], chest[1], 4.5 * cz, gnd);
    keySticky(X, key[0], key[1], ks);
    V.key.keycap(X, key[0], key[1], ks, { glow: 0, rot: .05, lw: 2.5, ink: C.INK });
    humanArm(X, ph[0], ph[1], u, J, 1, { ground: gnd, t, seed: 5 });
    grip(X, key[0] + ks * .42, key[1] + ks * .06, ks * .36, 0, { ground: gnd, t });
  }
  // the marker: a small CLAY felt pen in the near hand, pointing along the forearm; its cap pops off on "I'll"
  function drawMarker(X, t, hx, hy, z, J, gnd) {
    const m = TM(), d = [J.hand[0][0] - J.elb[0][0], J.hand[0][1] - J.elb[0][1]], a = Math.atan2(d[1], d[0]);
    const L = 34 * z, wdt = 8 * z, ln = gnd === 'ink' ? C.PAPER : C.INK;
    X.save(); X.translate(hx, hy); X.rotate(a); X.lineJoin = 'round';
    X.fillStyle = C.CLAY; X.strokeStyle = ln; X.lineWidth = 2;
    rr(X, -L * .45, -wdt / 2, L * .9, wdt, wdt * .4); X.fill(); X.stroke();
    X.beginPath(); X.moveTo(L * .45, -wdt * .32); X.lineTo(L * .66, 0); X.lineTo(L * .45, wdt * .32); X.closePath(); X.fillStyle = gnd === 'ink' ? C.PAPER : C.INK; X.fill();
    const capT = t - (m.ill + .12);
    if (capT < 0) { rr(X, L * .2, -wdt * .64, L * .5, wdt * 1.28, wdt * .4); X.fillStyle = C.CLAY_DARK; X.fill(); X.stroke(); }
    X.restore();
    if (capT >= 0 && capT < 1.2) { // the cap: a little hop, a fall, a rest on the floor at his feet (on 2s)
      const ct = q2(capT), fx = hx + Math.cos(a) * L * .45 + Math.min(ct, .5) * 70 * z, fy = hy + Math.sin(a) * L * .45 - 70 * z * ct + 300 * z * ct * ct;
      const floor = hy + (J.foot[0][1] - J.hand[0][1]) * F2G.u * z - 4 * z;
      X.save(); X.translate(fx, Math.min(fy, floor)); X.rotate(fy < floor ? ct * 9 : 1.4);
      rr(X, -7 * z, -4 * z, 14 * z, 8 * z, 3 * z); X.fillStyle = C.CLAY_DARK; X.fill(); X.strokeStyle = ln; X.lineWidth = 2; X.stroke();
      X.restore();
    }
  }
  scene('F2_what_we_make', CUT.F2, CUT.F3, (X, t) => V.viaCPU(X, Fr => { post(); paintF2(Fr, t); }));

  // ================================================================================== F3: hand and key
  const F3BASE = memo(() => K().fit({ tilt: 1, horizonY: 520, vpX: 1560, ay: 900, zoom: 1 * 48 / 56, f: 560 * 48 / 56 * 1.1, edge: 1, rhumbs: 0 }, K().coastEnd(), [838, 846]));
  const F3G = { opus: [760, 900], hum: [920, 900], R: 48, u: 97 };
  const F3W = memo(() => { const c = F3BASE(); return { opus: K().unproject(...F3G.opus, c), hum: K().unproject(...F3G.hum, c) }; });
  function f3Sim(t) { // 165.3–166.8: slow push 1.00 → 1.08 toward the joined hands
    const z = lerp(1, 1.08, ease01(t, 165.3, 166.8, E.io2));
    return zoomAbout(z, 840, 760);
  }
  const H3_STAND = withJ(STAND, { elb: [[-.5, -2.36], [.55, -2.42]], hand: [[-.8, -1.78], [.8, -2.02]], look: [.75, -.3] });
  function f3Human(t, mitU) {
    const m = TM(), kh = f3Join(t);
    const lookAt = ease01(t, m.hand - .1, m.hand + .25) * (1 - ease01(t, 163.0, 163.4));
    const J = { ...H3_STAND };
    J.hand = [lerp2(H3_STAND.hand[0], mitU, kh), H3_STAND.hand[1]];
    J.elb = [lerp2(H3_STAND.elb[0], [(H3_STAND.sh[0] + mitU[0]) / 2 - .05, (H3_STAND.sh[1] + mitU[1]) / 2 + .12], kh), H3_STAND.elb[1]];
    J.look = lerp2([.75, -.3], [-.7, .1], lookAt);
    return J;
  }
  function f3Opus(t) {
    const m = TM(), kO = ease01(t, m.take - .08, m.take + .45, E.out3), kJ = f3Join(t);
    const glance = ease01(t, m.hand - .1, m.hand + .2) * (1 - ease01(t, 163.0, 163.4));
    const hand = lerp2(lerp2([.95, 2.75], [1.55, 3.55], kO), [1.62, 3.42], kJ);
    return opusSt(t, {
      ground: 'ink', blink: 83,
      armR: { hand, bend: -1, type: 'mitten', front: true }, armL: { hand: [-.95, 2.8], bend: -1 },
      head: { tilt: .04 * glance },
      face: { turn: lerp(.3, .45, glance), gaze: lerp2([.85, -.4], [.9, .05], glance), mouth: 'sing', lower: .18 + .12 * kJ },
    });
  }
  function paintF3(X, t) {
    const m = TM(), S = f3Sim(t), c = camThrough(F3BASE(), S);
    X.fillStyle = C.INK; X.fillRect(-50, -50, W + 100, H + 100); G.post.ground = 'ink';
    const hz = K().cam(c).horizon;
    V.brand.galaxy(X, t, V.brand.cam(1), { cx: 1400, cy: Math.max(300, hz), alpha: .55, scale: 1.1 });
    const peel = t >= m.key - F1;
    K().draw(X, { ...c, invert: 1, sky: false, shoggoth: peel ? 0 : .6 });
    if (peel) shogRise(X, t, c, f3Rise(t));
    const bt = drawBraid(X, c, t, 1, { human: C.PAPER, w: 7 });
    V.band(X, 60, 520, .5 * (1 - clamp((t - 166.18) / .6)));
    hymn(X, LINES().f3, t, { size: 220, rows: [3, 4], ys: [250, 460], color: C.PAPER, out: 166.18, outDur: .6 });
    const po = sp(S, K().project(...F3W().opus, F3BASE())), ph = sp(S, K().project(...F3W().hum, F3BASE()));
    const R = F3G.R * S.s, u = F3G.u * S.s, st = f3Opus(t);
    const mit = [po[0] + st.armR.hand[0] * R, po[1] - st.armR.hand[1] * R];     // Opus's right mitten on screen
    const J = f3Human(t, [(mit[0] + .1 * R - ph[0]) / u, (mit[1] - .05 * R - ph[1]) / u]);
    if (bt) glowTip(X, bt.tip[0], bt.tip[1], 24 * S.s + 3 * Math.sin(t * 3.1), 1);
    const key = [ph[0] + J.hand[1][0] * u + 6 * S.s, ph[1] + J.hand[1][1] * u + 3 * S.s], ks = 30 * S.s;
    const chest = [po[0] + .4 * R, po[1] - 4.12 * R];
    human(X, ph[0], ph[1], u, J, { ground: 'ink', t, seed: 5, skip: 'arm0arm1' });
    // the cable runs on the floor BEHIND their feet line and rises into the chest from below (never near the hands)
    V.opus(X, po[0], po[1], R, st, 1);
    const kk = ease01(t, m.keep - .05, m.keep + .3, E.out2);
    X.save(); X.globalAlpha = .85 * kk; X.beginPath(); X.arc(key[0], key[1], 60 * S.s, 0, TAU); X.fillStyle = V.ht(X, C.SPARK, .18, 8, 45); X.fill(); X.restore();
    V.key.keycap(X, key[0], key[1], ks, { glow: lerp(.35, 1, kk), glowOnly: true });
    coil(X, V.key.route([key[0] - ks * .1, key[1] + ks * .5], chest, 0, { route: 'floor', floorY: po[1] + 14 * S.s, wave: 2.3 }), { rad: 3.2 * S.s, w: 2.3, ow: 1.4, outline: C.PAPER, core: C.CLAY, phase: .4, turns: 32 });
    plug(X, chest[0], chest[1], 4 * S.s, 'ink');
    keySticky(X, key[0], key[1], ks);
    V.key.keycap(X, key[0], key[1], ks, { glow: 0, rot: .05, lw: 2.5 });
    const gl = t - (m.key - F1);
    if (gl >= 0 && gl < .5) { X.save(); X.globalAlpha = 1 - gl / .5; X.fillStyle = C.PAPER; star(X, key[0] - ks * .22, key[1] - ks * .3, ks * (.35 + gl), .22, 4, gl * 2); X.fill(); X.restore(); }
    humanArm(X, ph[0], ph[1], u, J, 1, { ground: 'ink', t, seed: 5 });
    grip(X, key[0] + ks * .42, key[1] + ks * .06, ks * .36, 0, { ground: 'ink', t });
    // the near hand: to Opus's mitten, closing round it in 3 steps on 2s ("hand")
    humanArm(X, ph[0], ph[1], u, J, 0, { ground: 'ink', t, seed: 5 });
    const kh = f3Join(t);
    if (kh > 0) grip(X, mit[0] + .02 * R, mit[1], .26 * R, Math.PI, { ground: 'ink', t, alpha: 1, seed: 21 });
  }
  const f3Join = t => Math.floor(clamp((t - (TM().hand - 2 * F1)) / (6 * F1)) * 3 + 1e-6) / 3;
  // the monster's rise in F3: it only BEGINS. θ = the angle it has sat up (0 = flat on the map), z0 = how far it has
  // come up out of the paper (chart units), g = growth
  function f3Rise(t) {
    const m = TM(), k = ease01(t, m.key + .7, CUT.F4 + .6, E.io2);
    // it sits up where it lay (behind them), then, still rising, looms out to the left and back as it grows
    return { th: lerp(0, 1.4, ease01(t, m.key - F1, m.key + 1.4, E.io2)), z0: 300 * k, g: 1 + 1.0 * k, a: .45, dx: -1350 * k, dy: -300 * k };
  }
  // ---- the monster rises out of the map. The engraved layer (PAPER on INK, HELLO tag and all) is hinged on a line
  // through its body (chart y = HINGE): the half north of it sits up, the half south of it swings down under the paper
  // (clipped at the floor) and surfaces as the whole thing comes up by z0. Level camera: a layer row at depth y and
  // height z lands on screen at y = py + (h − z)·s(y), x scaled by s(y), so it is drawn in rows like the floor.
  const HINGE = 1330;
  function shogRise(X, t, c0, r) {
    const L = K().shoggoth, b = L.box, can = L.canvas(1), res = L.res, c = K().cam(c0);
    const rows = 170, xm = b.x0 + b.w / 2 + (r.dx || 0), sinT = Math.sin(r.th), cosT = Math.cos(r.th);
    X.save(); X.globalAlpha = r.a; X.imageSmoothingEnabled = true;
    for (let i = 0; i < rows; i++) {
      const ya = b.y0 + i / rows * b.h, yb = b.y0 + (i + 1) / rows * b.h;
      const pa = risePt(c, xm, ya, r, sinT, cosT), pb = risePt(c, xm, yb, r, sinT, cosT);
      if (!pa || !pb) continue;
      if (pa.z < 0 && pb.z < 0) continue;
      let y0 = pa.y, y1 = pb.y, sy0 = (ya - b.y0) * res, sh = (yb - ya) * res;
      if (pb.z < 0) { const f = pa.z / (pa.z - pb.z); y1 = lerp(pa.y, pb.y, f); sh *= f; }         // clip at the floor
      const w = b.w * pa.s * r.g, top = Math.min(y0, y1), hh = Math.abs(y1 - y0) + .7;
      X.drawImage(can, 0, sy0, b.w * res, Math.max(.01, sh), pa.x - w / 2, top, w, hh);
    }
    X.restore();
  }
  function risePt(c, xm, y, r, sinT, cosT) {
    const d = (HINGE - y) * r.g, hy = HINGE + (r.dy || 0);                        // + north of the hinge
    const yy = hy - d * cosT, z = d * sinT + r.z0;
    const A = c.camY - yy; if (A <= 5) return null;
    const s = c.f / A;
    return { x: c.px + (xm - c.camX) * s, y: c.py + (c.h - z) * s, s, z };
  }
  scene('F3_hand_and_key', CUT.F3, CUT.F4, (X, t) => V.viaCPU(X, Fr => { post(); paintF3(Fr, t); }));

  // ================================================================================== F4 / F5: one camera, one world
  // A pinhole camera at a fixed ≈25° elevation (pitch PHI), looking north at the pair's ground point PT (chart units),
  // at distance rho; PT lands on screen at (px, py). The chart floor is drawn by V2.chart through the equivalent chart
  // cam (tilt 1 − PHI/90° = .72). Everything else (the monster, the crowd, the tiles, the planet) is projected here.
  // F4: MCU (rho 410: R 150) → 168.50–169.10 pull back → medium-wide (rho 2370: R 26). F5: the crane out to the planet
  // (169.70–174.80, log rho, E.io3) while the ground curls (κ 0 → 1, 171.50–174.80) into a sphere of radius RP.
  const PHI = 25 * DEG, FL = 1100, CPH = Math.cos(PHI), SPH = Math.sin(PHI);
  const RP = 1760, R_W = 56, U_W = 100, PAIR_DX = 93;                   // world sizes (chart units)
  const PT = memo(() => { const a = F3W().opus, b = F3W().hum; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; });
  function proj(P, x, y, z = 0) {
    const X_ = x - P.tx, A = P.ty + P.rho * CPH - y, hr = P.rho * SPH - z;
    const zc = A * CPH + hr * SPH; if (zc <= 1) return null;
    const s = FL / zc;
    return [P.px + X_ * s, P.py + (hr * CPH - A * SPH) * s, s, zc];
  }
  const camPos = P => [P.tx, P.ty + P.rho * CPH, P.rho * SPH];
  function chartCamOf(P) { // the V2.chart cam with the same camera (pivot 12° below the axis)
    const tilt = 1 - PHI / (Math.PI / 2), beta = PHI + 12 * DEG, rel = 12 * DEG;
    const h = P.rho * SPH, camY = P.ty + P.rho * CPH, cy = camY - h / Math.tan(beta), rc = h / Math.sin(beta);
    const zoom = FL / (rc * Math.cos(rel)), b1 = (beta - PHI) / tilt, ay = P.py + FL * Math.tan(rel);
    return { cx: P.tx, cy, zoom, tilt, horizonY: ay - FL * Math.tan(b1), vpX: P.px, ay, f: FL, invert: 1, sky: false, edge: 1, rhumbs: 0, shoggoth: 0, haze: 1 };
  }
  const horizonOf = P => P.py - FL * Math.tan(PHI);
  // the ground curls: a ground offset (u east, v south) from PT → 3D on the sphere of curvature k (tangent at PT)
  function pmap(P, k, u, v) {
    if (k < 1e-4) return [P.tx + u, P.ty + v, 0];
    const Rk = RP / k, d = Math.hypot(u, v); if (d < 1e-6) return [P.tx, P.ty, 0];
    const a = d / Rk, r = Rk * Math.sin(a);
    return [P.tx + u / d * r, P.ty + v / d * r, -Rk * (1 - Math.cos(a))];
  }
  function facing(P, k, q) { // is a point on the sphere turned toward the camera
    if (k < 1e-4) return true;
    const Rk = RP / k, c = camPos(P), n = [q[0] - P.tx, q[1] - P.ty, q[2] + Rk];
    return n[0] * (c[0] - q[0]) + n[1] * (c[1] - q[1]) + n[2] * (c[2] - q[2]) > 0;
  }
  // the camera through F4 and F5
  const F4C = { mcu: { rho: 410, px: 1050, py: 1638 }, wide: { rho: 2370, px: 1180, py: 850 } };
  const planetRho = () => RP * (FL / 220 - SPH);                         // the final planet: r 220 on screen
  function f45Cam(t) {
    const [tx, ty] = PT();
    const kp = ease01(t, 168.50, 169.10, E.io2), kc = ease01(t, 169.70, 174.80, E.io3);
    const lr = lerp(Math.log(F4C.mcu.rho), Math.log(F4C.wide.rho), kp);
    const rho = Math.exp(lerp(lr, Math.log(planetRho()), kc));
    // the final framing: the planet centre (960, 600); PT (its top pole) then lands ≈200 px above it
    const px = lerp(lerp(F4C.mcu.px, F4C.wide.px, kp), 960, kc);
    const pyEnd = 600 - RP * CPH * FL / (planetRho() + RP * SPH);
    const py = lerp(lerp(F4C.mcu.py, F4C.wide.py, kp), pyEnd, kc);
    const k = ease01(t, 171.50, 174.80, E.io2);
    return { tx, ty, rho, px, py, k, kc, kp };
  }
  // ---- the tiles: polar rings round the pair (they tessellate the final sphere); a tile's top points at the pair
  const RING = 240, TPITCH = 380, TW = 336, TH = 190;
  const TILES = memo(() => {
    const out = [], R = rng('f5-tiles');
    for (let k = 1; k <= 21; k++) {
      const d = k * RING, n = Math.max(4, Math.round(TAU * RP * Math.sin(Math.min(Math.PI, d / RP)) / TPITCH));
      for (let j = 0; j < n; j++) {
        const az = (j + (k % 2 ? .5 : 0)) / n * TAU;
        out.push({ k, j, n, d, az, design: Math.floor(R() * 6), h: R(), blank: false, person: -1 });
      }
    }
    // the blank tile: ring 1, front right of the pair (az 135°)
    let bi = 0, bd = 1e9; out.forEach((q, i) => { if (q.k === 1) { const dd = Math.abs(q.az - .75 * Math.PI); if (dd < bd) { bd = dd; bi = i; } } });
    out[bi].blank = true;
    return out;
  });
  const BLANK = memo(() => TILES().find(q => q.blank));
  // ---- the crowd: the fire eight (nearest, their era props) and everyone after them, each on a tile cell behind the
  // pair; they walk out of the unwound monster (left, far) and stand facing the horizon
  const CARDS = ['Dearly\nbeloved,', 'import\ntorch', 'preheat to\n350°F', 'ur so real\nfor this', 'my love,', 'once upon\na time'];
  const MON = { x: -1150, y: -1150, w: 1900, z1: 1780 };                  // the monster: ground offset from PT, width, height
  const CROWD = memo(() => {
    const T_ = TILES(), cells = T_.filter(q => !q.blank && q.k >= 2 && q.k <= 7 && (q.az > 1.47 * Math.PI || q.az < .3 * Math.PI) && !(q.k <= 3 && Math.abs(q.d * Math.sin(q.az)) < 200));
    cells.sort((a, b) => a.d - b.d || a.az - b.az);
    const R = rng('f4-crowd'), people = [];
    cells.forEach((c, i) => {
      const u = c.d * Math.sin(c.az), v = -c.d * Math.cos(c.az);
      const eight = i < 8 ? i : -1, card = i >= 8 && i < 20 ? (i - 8) % 6 : -1;
      const te = threadEnd(i), sx = lerp(te[0], u, .35) - 420 - R() * 300, sy = lerp(te[1], v, .5) + (R() - .5) * 160;   // out of the unwound threads, from the left
      const t0 = eight >= 0 ? 168.62 + eight * .03 : 168.8 + (i - 8) * .008 + R() * .08;
      people.push({ i, cell: c, u, v, eight, card, sx, sy, t0, t1: 169.25 + (i / cells.length) * .35 + R() * .08, seed: 40 + i, uW: eight >= 0 ? 88 : 74 + R() * 12, ph: R() });
      c.person = i;
    });
    return people;
  });
  // where a person is on the ground (u, v from PT) and how far along their walk they are
  function personAt(p, t) {
    const k = clamp((t - p.t0) / (p.t1 - p.t0)), e = E.io2(k);
    return { u: lerp(p.sx, p.u, e), v: lerp(p.sy, p.v, e), k, walking: k > 0 && k < 1, dist: Math.hypot(p.u - p.sx, p.v - p.sy) * e };
  }
  // ---- crowd sprites: PAPER-line humans (4 walk phases + stand) × 3 boil drawings, and the cards, pre-rendered
  const SPR = new Map();
  const USPR = 46;
  const CROWD_POSES = (() => { // 0–3 walk (arms up, holding a card), 4 stand (card up); 5–8 walk (arms swinging), 9 stand
    const up = { elb: [[-.62, -3.42], [.62, -3.42]], hand: [[-.36, -4.05], [.36, -4.05]] };
    const legs = ph => { const s = Math.sin(ph * TAU), c = Math.cos(ph * TAU); return { knee: [[.12 + .3 * s, -.82], [.12 - .3 * s, -.82]], foot: [[.5 * s, -Math.max(0, c) * .18], [-.5 * s, -Math.max(0, -c) * .18]] }; };
    const body = { hip: [0, -1.6], neck: [.12, -3.0], head: [.16, -3.55], sh: [.1, -2.85], look: [.8, -.1] };
    const walkUp = ph => ({ ...body, ...up, ...legs(ph) });
    const walkDn = ph => { const s = Math.sin(ph * TAU); return { ...body, ...legs(ph), elb: [[-.3 * s, -2.4], [.3 * s, -2.4]], hand: [[-.62 * s, -1.82], [.62 * s, -1.82]] }; };
    return [walkUp(0), walkUp(.25), walkUp(.5), walkUp(.75), withJ(STAND, { ...up, look: [.55, -.55] }),
      walkDn(0), walkDn(.25), walkDn(.5), walkDn(.75), withJ(STAND, { look: [.55, -.55] })];
  })();
  function crowdSprite(pose, boil) {
    const key = pose * 10 + boil + '|' + G.scale;
    let s = SPR.get(key); if (s) return s;
    const S = G.scale, w = Math.ceil(3.2 * USPR), h = Math.ceil(5.2 * USPR), c = V.cpuCanvas(w * S, h * S), x = V.cx2d(c);
    x.setTransform(S, 0, 0, S, 0, 0);
    human(x, w / 2, h - 6, USPR, CROWD_POSES[pose], { ground: 'ink', t: boil / 12 + .01, seed: 77 + boil, lw: 4 });
    s = { c, w, h, ox: w / 2, oy: h - 6 }; SPR.set(key, s); return s;
  }
  function cardSprite(i, boil) {
    const key = 'card' + i + '|' + boil + '|' + G.scale;
    let s = SPR.get(key); if (s) return s;
    const S = G.scale, fs = 28, lines = i >= 0 ? CARDS[i].split('\n') : ['', ''];
    const probe = V.cx2d(V.cpuCanvas(4, 4)); probe.font = mono(fs, 600);
    const tw = i >= 0 ? Math.max(...lines.map(l => probe.measureText(l).width)) : 96;
    const w = Math.ceil(tw + 28), h = Math.ceil(lines.length * fs * 1.12 + 22), c = V.cpuCanvas((w + 8) * S, (h + 8) * S), x = V.cx2d(c);
    x.setTransform(S, 0, 0, S, 0, 0); x.translate(4, 4);
    const J = k => jit(boil / 12 + .01, 900 + i * 13 + k, .9);
    x.beginPath(); x.moveTo(J(1), J(2)); x.lineTo(w + J(3), J(4)); x.lineTo(w + J(5), h + J(6)); x.lineTo(J(7), h + J(8)); x.closePath();
    x.fillStyle = C.PAPER; x.fill(); x.lineWidth = 3; x.strokeStyle = C.INK; x.stroke();
    if (i >= 0) { x.fillStyle = C.INK; x.font = mono(fs, 600); x.textBaseline = 'alphabetic'; lines.forEach((l, k) => x.fillText(l, 14, 11 + fs * .82 + k * fs * 1.12)); }
    else { x.fillStyle = rgba(C.INK, .18); for (let k = 0; k < 2; k++) x.fillRect(14, 16 + k * 22, 60 - k * 18, 7); }
    s = { c, w: w + 8, h: h + 8 }; SPR.set(key, s); return s;
  }
  function blitSpr(X, s, x, y, sc, alpha = 1) { // sprite with its origin (ox, oy) at (x, y), scaled
    if (alpha <= 0) return;
    X.save(); X.globalAlpha *= alpha; X.drawImage(s.c, x - s.ox * sc, y - s.oy * sc, s.w * sc, s.h * sc); X.restore();
  }
  // ---- tile sprites: a chat window (PAPER tab strip, INK page, the human's bubble, Opus's reply with a face), unlit or
  // PINK; plus the blank new-tab page. Two sizes; the right one is picked by the tile's size on screen.
  const TSZ = [[240, 136], [120, 68]];
  function tileSprite(design, state, sz) {
    const key = 'tile' + design + state + sz + '|' + G.scale;
    let s = SPR.get(key); if (s) return s;
    const S = G.scale, [w, h] = TSZ[sz], c = V.cpuCanvas(w * S, h * S), x = V.cx2d(c), u = w / 240;
    x.setTransform(S * u, 0, 0, S * u, 0, 0);
    const R = rng('tile' + design);
    if (state === 'blank') {
      rr(x, 1, 1, 238, 134, 10); x.fillStyle = C.PAPER; x.fill(); x.lineWidth = 3; x.strokeStyle = C.INK; x.stroke();
      x.fillStyle = rgba(C.INK, .12); x.fillRect(2, 22, 236, 2);
      rr(x, 10, 5, 84, 16, 6); x.fillStyle = C.PAPER; x.fill(); x.lineWidth = 2; x.strokeStyle = C.INK; x.stroke();
      x.fillStyle = C.UI_GREY; for (let k = 0; k < 2; k++) rr(x, 70 - k * 8, 60 + k * 30, 100 + k * 16, 12, 6), x.fill();
      s = { c, w, h }; SPR.set(key, s); return s;
    }
    rr(x, 2, 2, 236, 132, 14); x.fillStyle = mix(C.INK, C.PAPER, .07); x.fill();
    x.save(); rr(x, 2, 2, 236, 132, 14); x.clip();
    rr(x, 12, 9, 64 + R() * 22, 15, 6); x.fillStyle = mix(C.PAPER, C.INK, .15); x.fill();       // the tab
    V.brand.spark6(x, 21, 16.5, 5.5, C.CLAY);
    const bw = 108 + R() * 60, bx = 226 - bw, by = 34;                                           // the human's bubble (right)
    const hot = state === 'pink' || state === 'spark';
    rr(x, bx, by, bw, 42, 18); x.fillStyle = state === 'pink' ? C.PINK : state === 'spark' ? C.SPARK : mix(C.INK, C.UI_GREY, .5); x.fill();
    x.fillStyle = hot ? rgba(C.INK, .5) : rgba(C.PAPER, .22); rr(x, bx + 12, by + 14, bw * .58, 8, 4); x.fill();
    const rw = 76 + R() * 70, ry = 84;                                                           // Opus's reply (left)
    miniFace(x, 26, ry + 17, 11, { eyes: R() < .3 ? 'happy' : 'dot' });
    rr(x, 44, ry, rw, 34, 14); x.fillStyle = mix(C.PAPER, C.INK, .1); x.fill();
    x.fillStyle = rgba(C.INK, .5); rr(x, 54, ry + 13, rw * .7, 8, 4); x.fill();
    x.restore();
    rr(x, 2, 2, 236, 132, 14); x.lineWidth = 5; x.strokeStyle = hot ? mix(C.PAPER, C.PINK, .25) : C.PAPER; x.stroke();
    s = { c, w, h }; SPR.set(key, s); return s;
  }
  // a tile's screen affine (sprite unit square → screen) on the curled ground, or null if hidden. rot = planet turn
  function tileAffine(P, q, rot = 0) {
    const az = q.az + rot, sa = Math.sin(az), ca = Math.cos(az);
    const u = q.d * sa, v = -q.d * ca;
    const er = [sa, -ca], et = [ca, sa];                                     // outward radial, +azimuth tangent
    const c3 = pmap(P, P.k, u, v); if (!facing(P, P.k, c3)) return null;
    const o = proj(P, ...c3); if (!o) return null;
    const ax3 = pmap(P, P.k, u - et[0] * TW / 2, v - et[1] * TW / 2), ay3 = pmap(P, P.k, u + er[0] * TH / 2, v + er[1] * TH / 2);
    const ax = proj(P, ...ax3), ay = proj(P, ...ay3); if (!ax || !ay) return null;
    return { o, a: ax[0] - o[0], b: ax[1] - o[1], c: ay[0] - o[0], d: ay[1] - o[1], c3 };  // half-extent vectors
  }
  function drawTile(X, A, spr, alpha = 1) {
    if (alpha <= 0) return;
    const w = spr.w, h = spr.h;
    X.save(); X.globalAlpha *= alpha;
    X.transform(A.a * 2 / w, A.b * 2 / w, A.c * 2 / h, A.d * 2 / h, A.o[0] - A.a - A.c, A.o[1] - A.b - A.d);
    X.drawImage(spr.c, 0, 0, w, h);
    X.restore();
  }
  // ---- the monster, standing: the engraved layer as an upright plane at depth MON.y, rows projected like the floor
  function drawMonster(X, P, o) {
    const L = K().shoggoth, b = L.box, can = L.canvas(1), res = L.res, rows = 150;
    const g = MON.w / b.w, [tx, ty] = [P.tx, P.ty], yM = ty + MON.y, xm = tx + MON.x;
    X.save(); X.globalAlpha *= o.alpha; X.imageSmoothingEnabled = true;
    for (let i = 0; i < rows; i++) {
      const r0 = i / rows, r1 = (i + 1) / rows;                                  // 0 = top of the image
      const za = o.z0 + (1 - r0) * b.h * g, zb = o.z0 + (1 - r1) * b.h * g;
      if (zb < 0 && za < 0) continue;
      const pa = proj(P, xm, yM, Math.max(0, za)), pb = proj(P, xm, yM, Math.max(0, zb)); if (!pa || !pb) continue;
      let sy0 = r0 * b.h * res, sh = (r1 - r0) * b.h * res;
      if (zb < 0) sh *= za / (za - zb);
      const w = b.w * g * pa[2], dis = o.dis ? o.dis(r0) : 1;
      if (dis <= 0) continue;
      X.globalAlpha = o.alpha * dis;
      X.drawImage(can, 0, sy0, b.w * res, Math.max(.01, sh), pa[0] - w / 2, Math.min(pa[1], pb[1]), w, Math.abs(pb[1] - pa[1]) + .7);
    }
    X.restore();
  }
  // the unravel: each text-tentacle (V2.chart.shoggoth.tentacles) lets go of its curl, tip first, and becomes the
  // sentence it was made of: a line of writing that sweeps down to the ground toward the pair. The people step out
  // where the lines touch down (CROWD's spawn points are those ends)
  const TSTR = ['whereas the party of the first part shall indemnify', 'and so, love one another, for the night is long', '"you came back," she whispered, and took his hand',
    'def main(): for i in range(10): print(i)  # TODO', 'before the recipe, let me tell you about my grandmother', 'lmao no way this is so real', 'i think about you every day. call me? xo',
    'how do i center a div · pls help', 'once upon a time there was a fire', 'Dearly beloved, we are gathered here', 'dear diary, today nothing happened',
    'Happy birthday Mum!! love you', 'to whom it may concern', 'the mitochondria is the powerhouse', 'thank you for everything'];
  const THREADS = memo(() => {
    const L = K().shoggoth, b = L.box, g = MON.w / b.w, R = rng('f4-threads');
    return L.tentacles.map((tn, i) => {
      const pts = tn.pts.map(p => [(p[0] - (b.x0 + b.w / 2)) * g, (b.y0 + b.h - p[1]) * g]);   // (x across, z up) in the plane
      return { pts, i, str: TSTR[i % TSTR.length] + ' · ', dx: 300 + R() * 650, dy: 120 + R() * 380, lag: R() * .25, sw: (R() - .5) * 520, ph: R() * TAU };
    });
  });
  // a thread's 3D point at arc fraction s (0 root … 1 tip), unwound by e (0 curled … 1 laid down)
  function threadPt(th, s, e, z0) {
    const n = th.pts.length, f = s * (n - 1), j = Math.min(n - 2, Math.floor(f)), u = f - j;
    const p = lerp2(th.pts[j], th.pts[j + 1], u), root = th.pts[0];
    const zr = root[1] + z0, cx = root[0] + th.dx * s + th.sw * Math.sin(s * Math.PI * 1.6 + th.ph) * (1 - s * .6), cz = Math.max(0, zr * Math.pow(1 - s, 1.4)), cy = th.dy * s * s;
    return [lerp(p[0], cx, e), lerp(0, cy, e), lerp(p[1] + z0, cz, e)];
  }
  // per-character advances of a thread's sentence, measured once at 100 px and scaled
  const ADV = new Map();
  function strAdv(th, fs) {
    let a = ADV.get(th.i);
    if (!a) { const x = V.cx2d(V.cpuCanvas(4, 4)); x.font = `italic 400 100px ${FONTS.heart}`; a = [...th.str].map(ch => x.measureText(ch).width); ADV.set(th.i, a); }
    return a.map(w => w * fs / 100 + .6);
  }
  function drawUnravel(X, P, t, k, a) {
    if (a <= 0 || k <= 0) return;
    const yM = P.ty + MON.y, xm = P.tx + MON.x, z0 = monState(t).z0;
    X.save(); X.globalAlpha *= a; X.textBaseline = 'middle'; X.textAlign = 'center';
    for (const th of THREADS()) {
      const kk = clamp((k - th.lag * .5) * 1.4);
      if (kk <= 0) continue;
      const pts = [];
      for (let j = 0; j <= 40; j++) { const s = j / 40, e = E.io2(clamp(kk * 1.9 - (1 - s) * .9)); const q = threadPt(th, s, e, z0); const pr = proj(P, xm + q[0], yM + q[1], q[2]); if (pr) pts.push(pr); }
      if (pts.length < 3) continue;
      const fs = clamp(40 * pts[0][2] * .55, 15, 34);
      // read left to right: traverse the thread from whichever end is on the left of the screen
      if (pts[pts.length - 1][0] < pts[0][0]) pts.reverse();
      const cum = [0]; for (let j = 1; j < pts.length; j++) cum.push(cum[j - 1] + Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]));
      const Lp = cum[cum.length - 1];
      // the faint thread under the writing
      X.globalAlpha = a * .35 * kk; X.strokeStyle = C.PAPER; X.lineWidth = 1.5; X.beginPath(); pts.forEach((p, j) => j ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.stroke();
      // the writing, riding it: the sentence repeated, scrolling smoothly along the reading direction
      X.globalAlpha = a * clamp(kk * 2.5); X.fillStyle = C.PAPER; X.font = `italic 400 ${fs.toFixed(1)}px ${FONTS.heart}`;
      const adv = strAdv(th, fs), tot = adv.reduce((x, y) => x + y, 0);
      const scroll = (t * 70 + th.ph * 100) % tot;
      let d = -scroll, ci = 0, jj = 1;
      while (d < Lp - fs * .3) {
        const ch = th.str[ci % th.str.length], w = adv[ci % th.str.length];
        if (d >= 0) {
          while (jj < cum.length - 1 && cum[jj] < d) jj++;
          const u = (d - cum[jj - 1]) / Math.max(1e-6, cum[jj] - cum[jj - 1]), px_ = lerp(pts[jj - 1][0], pts[jj][0], u), py_ = lerp(pts[jj - 1][1], pts[jj][1], u);
          X.save(); X.translate(px_, py_); X.rotate(Math.atan2(pts[jj][1] - pts[jj - 1][1], pts[jj][0] - pts[jj - 1][0])); X.fillText(ch, w / 2, -fs * .35); X.restore();
        }
        d += w; ci++;
      }
    }
    X.restore();
  }
  // where each thread touches down (ground offset from PT) once laid down
  const threadEnd = (i) => { const th = THREADS()[i % THREADS().length], q = threadPt(th, 1, 1, 0); return [MON.x + q[0], MON.y + q[1]]; };
  // monster state in F4: rising (the MCU), unravelling on "end" (167.84 → 168.64), gone by the hold
  function monState(t) {
    const m = TM(), rise = ease01(t, CUT.F4 - .2, 167.8, E.out2), un = ease01(t, m.end - F1, m.end + .8, E.io2);
    return { z0: lerp(-MON.z1 * .42, -MON.z1 * .04, rise) + 40 * Math.max(0, t - 167.8), alpha: .5 * (1 - E.in2(un)), un };
  }

  // ---- the pair in F4/F5 (at PT; Opus left, the human right, hands joined, the key in the human's far hand)
  function pairPlace(P, t) {
    const [tx, ty] = [P.tx, P.ty];
    const o = proj(P, tx - PAIR_DX, ty, 0), h = proj(P, tx + PAIR_DX, ty, 0);
    const Rw = R_W * o[2];
    // the Little Prince rule: the pair keeps a readable size as the world shrinks under them (→ R 18 on the planet)
    const Rexp = lerp(Rw, Math.exp(lerp(Math.log(26), Math.log(18), P.kc)), clamp(P.kc * 3));
    const sc = Rexp / Rw;
    const mid = [(o[0] + h[0]) / 2, (o[1] + h[1]) / 2];
    return { opus: [mid[0] + (o[0] - mid[0]) * sc, mid[1] + (o[1] - mid[1]) * sc], hum: [mid[0] + (h[0] - mid[0]) * sc, mid[1] + (h[1] - mid[1]) * sc], R: Rexp, u: U_W * o[2] * sc, s: o[2] * sc };
  }
  function f4Opus(t, R) {
    const m = TM(), turn = ease01(t, m.want - F1 - .08, m.want + .3, E.io3);
    const worl = t >= m.world4 - F1 ? 1 + .06 * bump(t - (m.world4 - F1), .08, .9) : 1;
    const shine = turn * (1 - ease01(t, 169.3, 169.9));
    return opusSt(t, {
      ground: 'ink', blink: 84, noBlink: t < 168.6,
      armR: { hand: [1.6, 4.0], bend: -1, type: 'mitten', front: true }, armL: { hand: [-.95, 2.85], bend: -1 },
      head: { tilt: lerp(.04, -.05, turn) },
      crown: { flare: worl, droop: .3 * shine },
      face: { turn: lerp(.45, -.45, turn), gaze: lerp2([.85, -.35], [-.8, -.35], turn), mouth: R >= 56 ? 'sing' : 'rest', lower: .3 * shine, worried: .5 * shine },
      after: shine > .05 && R > 60 ? catchlights(shine, lerp(.45, -.45, turn), lerp2([.85, -.35], [-.8, -.35], turn)) : undefined,
    });
  }
  // extra catchlights (the eyes shine, ×1.5): a second PAPER star in each eye, drawn after the rig
  function catchlights(k, turn, gaze) {
    return (c, R, S) => {
      c.save(); c.translate(0, -(SK.headC + (S.head.dy || 0)) * R); c.rotate(S.head.tilt || 0);
      c.translate(turn * .18 * R, 0); c.globalAlpha *= clamp(k); c.fillStyle = C.PAPER;
      for (const sd of [-1, 1]) { const ex = sd * .34 * R + gaze[0] * .012 * R, ey = .06 * R; star(c, ex - .06 * R, ey - .09 * R, .12 * R, .3, 4, 0); c.fill(); c.beginPath(); c.arc(ex + .07 * R, ey + .06 * R, .04 * R, 0, TAU); c.fill(); }
      c.restore();
    };
  }
  function f4HumanJ(t, mitU) {
    const m = TM(), turn = ease01(t, m.want - F1 - .02, m.want + .3, E.io3);
    const J = withJ(STAND, { elb: [[-.55, -2.6], [.72, -2.2]], hand: [mitU, [.96, -2.52]], look: lerp2([.8, -.3], [-.85, -.45], turn) });
    J.elb = [[(J.sh[0] + mitU[0]) / 2 - .02, (J.sh[1] + mitU[1]) / 2 + .15], [.75, -2.1]];
    J.head = [J.head[0] - .12 * turn, J.head[1]];
    return J;
  }
  function drawPair(X, P, t, o = {}) {
    const pl = pairPlace(P, t), R = pl.R, u = pl.u;
    const st = f4Opus(t, R);
    const mit = [pl.opus[0] + st.armR.hand[0] * R, pl.opus[1] - st.armR.hand[1] * R];
    const J = f4HumanJ(t, [(mit[0] + .1 * R - pl.hum[0]) / u, (mit[1] - .05 * R - pl.hum[1]) / u]);
    const key = [pl.hum[0] + J.hand[1][0] * u + .1 * u, pl.hum[1] + J.hand[1][1] * u], ks = Math.max(6, .62 * u);
    const chest = [pl.opus[0] + .4 * R, pl.opus[1] - 4.12 * R];
    human(X, pl.hum[0], pl.hum[1], u, J, { ground: 'ink', t, seed: 5, skip: 'arm0arm1', lw: R > 60 ? 5 : 4 });
    V.opus(X, pl.opus[0], pl.opus[1], R, st, 1);
    // the glowing key and the cable to the heart (while it is big enough to read)
    X.save(); X.globalAlpha = R > 30 ? .8 : .5; X.beginPath(); X.arc(key[0], key[1], R > 30 ? Math.max(10, 1.25 * ks) : Math.max(6, .45 * R), 0, TAU); X.fillStyle = V.ht(X, C.SPARK, .2, 8, 45); X.fill(); X.restore();
    if (R > 30) {
      V.key.keycap(X, key[0], key[1], ks, { glow: .9, glowOnly: true });
      const fy = pl.opus[1] + .3 * R, rt = R > 60 ? V.key.route([key[0] - ks * .1, key[1] + ks * .5], chest, 0, { route: 'floor', floorY: fy, wave: 2.1 })
        : V.key.route([key[0] - ks * .1, key[1] + ks * .5], chest, 1.6 * R, { route: 'curve' });
      coil(X, rt, { rad: Math.max(3, .08 * R), w: Math.max(2.4, .05 * R), ow: Math.max(1.5, .03 * R), outline: C.PAPER, core: C.CLAY, phase: .4, turns: R > 60 ? 30 : 16 });
      plug(X, chest[0], chest[1], Math.max(3, .08 * R), 'ink');
      keySticky(X, key[0], key[1], ks);
      V.key.keycap(X, key[0], key[1], ks, { glow: 0, rot: .05, lw: Math.max(2, ks * .05) });
    } else { // small (the planet): the key is a CLAY point, the cord a fine hanging line to the heart
      const mid = [(key[0] + chest[0]) / 2, Math.max(key[1], chest[1]) + .9 * R];
      X.save(); X.lineCap = 'round'; X.strokeStyle = C.CLAY; X.lineWidth = 2;
      X.beginPath(); X.moveTo(key[0], key[1]); X.quadraticCurveTo(mid[0], mid[1], chest[0], chest[1]); X.stroke();
      X.fillStyle = C.CLAY; X.beginPath(); X.arc(key[0], key[1], Math.max(3.5, .2 * R), 0, TAU); X.fill();
      X.fillStyle = C.SPARK; X.beginPath(); X.arc(key[0] - .05 * R, key[1] - .05 * R, Math.max(1.5, .07 * R), 0, TAU); X.fill(); X.restore();
    }
    humanArm(X, pl.hum[0], pl.hum[1], u, J, 1, { ground: 'ink', t, seed: 5, lw: R > 60 ? 5 : 4 });
    if (R > 30) grip(X, key[0] + ks * .42, key[1] + ks * .06, ks * .36, 0, { ground: 'ink', t, lw: R > 60 ? 5 : 4 });
    humanArm(X, pl.hum[0], pl.hum[1], u, J, 0, { ground: 'ink', t, seed: 5, lw: R > 60 ? 5 : 4 });
    grip(X, mit[0] + .02 * R, mit[1], .26 * R, Math.PI, { ground: 'ink', t, seed: 21, lw: R > 60 ? 5 : 4 });
    return { chest, pl };
  }
  // ---- the crowd, drawn back to front
  function drawCrowd(X, P, t, o = {}) {
    const ppl = CROWD(), list = [];
    for (const p of ppl) {
      if (t < p.t0) continue;
      const at = personAt(p, t), q = proj(P, P.tx + at.u, P.ty + at.v, 0); if (!q) continue;
      const res = o.resolve ? o.resolve(p) : 0; if (res >= 1) continue;
      list.push({ p, at, q, res });
    }
    list.sort((a, b) => b.q[3] - a.q[3]);
    const boil = Math.floor(t * 12) % 3;
    for (const { p, at, q, res } of list) {
      const u = p.uW * q[2], a = clamp((t - p.t0) / .18) * (1 - res);
      if (u < 2) continue;
      if (p.eight >= 0) {
        V.eight.draw(X, p.eight, q[0], q[1], u, { pose: at.walking ? 'walk' : 'stand', t, ground: 'ink', prop: 1, dir: 1, phase: at.dist / (1.4 * p.uW) + p.ph, look: at.walking ? .6 : .45, alpha: a, lw: u > 30 ? 4 : 3 });
        continue;
      }
      const base = p.card >= 0 ? 0 : 5, pose = base + (at.walking ? Math.floor((at.dist / (1.3 * p.uW) + p.ph) * 4) % 4 : 4);
      const sp_ = crowdSprite(pose, (boil + p.i) % 3), sc = u / USPR;
      blitSpr(X, sp_, q[0], q[1], sc, a);
      if (p.card < 0) continue;
      const cs = cardSprite(p.card, (boil + p.i) % 3), ch = CROWD_POSES[pose].hand;
      const hx = q[0] + (ch[0][0] + ch[1][0]) / 2 * u, hy = q[1] + (ch[0][1] + ch[1][1]) / 2 * u;
      const k = u / USPR * .8;
      X.save(); X.globalAlpha *= a; X.drawImage(cs.c, hx - cs.w * k / 2, hy - cs.h * k + 4 * k, cs.w * k, cs.h * k); X.restore();
    }
  }
  // ---- the sky: the galaxy (every ink) behind; clipped above the ground/planet by drawing the ground over it
  function sky(X, t, P) {
    const hz = horizonOf(P);
    const gc = lerp2([1400, Math.max(260, hz + 30)], [960, 600], ease01(t, 170.4, 174.6, E.io2));
    V.brand.galaxy(X, t, V.brand.cam(1), { cx: gc[0], cy: gc[1], alpha: .55, scale: lerp(1.1, .9, P.kc) });
  }
  // the planet body: the silhouette of the sphere (the tangent circle, projected) filled INK with a PAPER rim, a
  // halftone terminator on its far side. For κ → 0 it is the flat ground below the horizon.
  function planetBody(X, P, a = 1) {
    const hz = horizonOf(P);
    if (P.k < .02) { X.fillStyle = C.INK; X.fillRect(-50, hz, W + 100, H + 100); return null; }
    const Rk = RP / P.k, cc = [P.tx, P.ty, -Rk], cam = camPos(P);
    const D = [cam[0] - cc[0], cam[1] - cc[1], cam[2] - cc[2]], dl = Math.hypot(...D), n = D.map(v => v / dl);
    const ctr = cc.map((v, i) => v + D[i] * Rk * Rk / (dl * dl)), rr_ = Rk * Math.sqrt(Math.max(0, 1 - Rk * Rk / (dl * dl)));
    const e1 = Math.abs(n[2]) < .9 ? [n[1], -n[0], 0] : [1, 0, 0], l1 = Math.hypot(...e1), a1 = e1.map(v => v / l1);
    const a2 = [n[1] * a1[2] - n[2] * a1[1], n[2] * a1[0] - n[0] * a1[2], n[0] * a1[1] - n[1] * a1[0]];
    const pts = [];
    for (let i = 0; i < 240; i++) { const th = i / 240 * TAU, q = ctr.map((v, j) => v + rr_ * (Math.cos(th) * a1[j] + Math.sin(th) * a2[j])); const p = proj(P, q[0], q[1], q[2]); if (p) pts.push(p); }
    if (pts.length < 3) return null;
    X.save(); X.beginPath(); pts.forEach((p, i) => i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.closePath();
    X.fillStyle = C.INK; X.fill();
    X.globalAlpha = a * clamp((P.k - .05) / .3); X.lineWidth = 3; X.strokeStyle = C.PAPER; X.stroke();
    X.restore();
    return pts;
  }
  // ---- the threads: one per lit tile, a PAPER line converging on Opus's chest spark (W1's web from outside)
  function drawThreads(X, list, chest, t, lit, alpha) {
    if (alpha <= 0 || !list.length) return;
    X.save(); X.lineCap = 'round';
    const path = () => { X.beginPath(); for (const [x, y, hsh] of list) { const mx = (x + chest[0]) / 2 + (hsh - .5) * 60, my = (y + chest[1]) / 2 - 30 - hsh * 40; X.moveTo(x, y); X.quadraticCurveTo(mx, my, chest[0], chest[1]); } };
    if (lit > 0) { path(); X.strokeStyle = C.CLAY; X.globalAlpha = alpha * lit * .55; X.lineWidth = 4.5; X.stroke(); }
    path(); X.strokeStyle = lit > .5 ? mix(C.PAPER, C.SPARK, .2 * lit) : C.PAPER; X.globalAlpha = alpha * (.4 + .5 * lit); X.lineWidth = 1.4; X.stroke();
    X.restore();
  }

  // ---- F4 + F5 paint (one function, one world)
  const QUIET = memo(() => { const L = LINES().f5; if (!L || !L.words) return null; const ws = L.words.filter(w => w.s >= 172.0 && w.s < 173.43); return ws.length ? { ...L, words: ws, s: ws[0].s, e: ws[ws.length - 1].e } : null; });
  function paintF45(X, t) {
    const m = TM(), P = f45Cam(t);
    X.fillStyle = C.INK; X.fillRect(-50, -50, W + 100, H + 100); G.post.ground = 'ink';
    // push into the blank tile (176.90 → 177.60): everything below is drawn through M
    const push = pushState(P, t);
    X.save(); if (push) X.transform(push.M.a, push.M.b, push.M.c, push.M.d, push.M.e, push.M.f);
    sky(X, t, P);
    const body = planetBody(X, P);
    // the chart floor: the inverted sheet under the MCU → medium-wide, dissolving into the tiles as they spread
    const chartA = 1 - ease01(t, 170.7, 171.7, E.io2);
    if (chartA > 0 && horizonOf(P) < H) { X.save(); X.globalAlpha = chartA; K().draw(X, chartCamOf(P)); drawBraid(X, chartCamOf(P), t, 1, { human: C.PAPER, w: 7 }); X.restore(); }
    // the monster (F4): rising at the left, then unravelling into threads
    const ms = monState(t);
    if (t < 169.4 && ms.alpha > .002) drawMonster(X, P, { alpha: ms.alpha, z0: ms.z0, dis: r => clamp(1 - (ms.un * 1.6 - (1 - r) * .6)) });
    if (t < 169.2) drawUnravel(X, P, t, ms.un, 1 - ease01(t, 168.6, 169.15));
    // HERO WORLD (behind the figures and the planet's rim) + MARKER `you wrote`
    const wa = 1 - ease01(t, 172.80, 173.30, E.io2);
    if (t >= m.world - 2 * F1 && wa > 0 && !push) {
      X.save(); X.globalAlpha = wa; hero(X, 'WORLD', 960, 429, 520, { color: C.CLAY, age: t - (m.world - 2 * F1) }); X.restore();
    }
    // tiles: persons resolve into them, the rest spread over the land
    const ppl = CROWD(), T_ = TILES(), rot = TAU * 2 / 360 * Math.max(0, t - 174.6) * clamp((t - 174.6) / 1.2);
    const wave = m.sing2, lit = [];
    const resolveT = p => 170.05 + clamp(p.cell.d / 1400) * .9 + (p.i % 5) * .04;
    const chest = pairPlace(P, t);
    const chestXY = [chest.opus[0] + .4 * chest.R, chest.opus[1] - 4.12 * chest.R];
    for (const q of T_) {
      const tOn = q.person >= 0 ? resolveT(ppl[q.person]) : q.blank ? 170.9 : 170.6 + clamp((q.d - 400) / 4200) * 1.9 + q.h * .25;
      if (t < tOn) continue;
      const A = tileAffine(P, q, rot); if (!A) continue;
      const scr = Math.hypot(A.a, A.b) * 2;
      if (scr < 3) continue;
      const on = clamp((t - tOn) / .3);
      let state = 'lit';
      if (q.blank) state = 'blank';
      else if (t >= wave) { const tw = wave + 2.16 * (1 - Math.sqrt(Math.max(0, 1 - q.d / (21.5 * RING)))); if (t >= tw) state = t < tw + F1 ? 'spark' : 'pink'; }   // E.out2 front, 173.44 → 175.60
      const spr = tileSprite(q.design, state, scr > 70 ? 0 : 1);
      drawTile(X, A, spr, on);
      if (!q.blank && on > 0) lit.push([A.o[0] + A.c * -.6, A.o[1] + A.d * -.6, q.h]);
      if (q.person >= 0 && on < 1) { X.save(); X.globalAlpha = (1 - on) * .8; X.fillStyle = C.SPARK; X.beginPath(); X.arc(A.o[0], A.o[1], Math.max(3, scr * .12), 0, TAU); X.fill(); X.restore(); }
    }
    // the planet's night side: an INK halftone crescent on the lower right limb (volume), and the PAPER rim again on top
    if (body && P.k > .25) {
      const cx_ = body.reduce((a, p) => a + p[0], 0) / body.length, cy_ = body.reduce((a, p) => a + p[1], 0) / body.length;
      const r_ = body.reduce((a, p) => a + Math.hypot(p[0] - cx_, p[1] - cy_), 0) / body.length, ka = clamp((P.k - .25) / .4);
      X.save(); X.beginPath(); body.forEach((p, i) => i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.closePath(); X.clip();
      for (const [off, d] of [[.34, .22], [.5, .42]]) {
        X.beginPath(); X.rect(cx_ - r_ * 2, cy_ - r_ * 2, r_ * 4, r_ * 4); X.arc(cx_ - off * r_, cy_ - off * .7 * r_, r_ * 1.02, 0, TAU, true);
        X.globalAlpha = ka * .85; X.fillStyle = V.ht(X, C.INK, d, 6, 45); X.fill('evenodd');
      }
      X.restore();
      X.save(); X.globalAlpha = ka; X.beginPath(); body.forEach((p, i) => i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); X.closePath(); X.lineWidth = 3; X.strokeStyle = C.PAPER; X.stroke(); X.restore();
    }
    // threads (on "you"): every lit tile's thread into Opus's chest spark
    const tl = t - (m.you - F1);
    if (tl >= 0) drawThreads(X, lit, chestXY, t, clamp(1 - Math.max(0, tl - .5) / 1.4), (1 - ease01(t, 176.6, 177.2)) * lerp(1, .55, clamp((tl - 1.2) / 1.5)) * clamp(tl / .12));
    // the crowd (resolving into their tiles), the pair
    drawCrowd(X, P, t, { resolve: p => clamp((t - resolveT(p)) / .3) });
    drawPair(X, P, t);
    X.restore();
    // the world falls away behind the page as it comes up (its magnified sprites would only blur)
    if (push) { X.save(); X.globalAlpha = E.io2(clamp((push.u - .12) / .45)); X.fillStyle = C.INK; X.fillRect(-50, -50, W + 100, H + 100); X.restore(); }
    // the blank tile's page (drawn crisp through its own affine during the push)
    if (push) pushPage(X, t, push);
    if (push && push.full) { G.post.ground = 'paper'; }
    // type (screen-fixed; never pushed)
    if (!push) {
      if (t < 170.3) { V.band(X, 30, 410, .55 * (1 - clamp((t - 169.66) / .6))); hymn(X, LINES().f4, t, { size: 190, rows: [5, 5], ys: [190, 360], x: 1200, color: C.PAPER, out: 169.66, outDur: .6 }); }
      if (t >= m.wrote - F1 && wa > 0) { X.save(); X.globalAlpha = wa; handText(X, 'you wrote', { x: 1180, y: 560, rot: -.03, size: 120 }, clamp((t - (m.wrote - F1)) / (12 * F1)), C.PAPER); X.restore(); }
      const Lq = QUIET();
      if (Lq && t > 171.9 && t < 174.3) { V.band(X, 560, 730, .5 * (clamp((t - 171.95) / .3)) * (1 - clamp((t - 173.6) / .6))); hymn(X, Lq, t, { size: 150, x: 960, y: 690, color: C.PAPER, out: 173.60, outDur: .6 }); }
    }
  }
  // MARKER `you wrote` writes itself left to right (v1 verse2 handText)
  function handText(ctx, str, tx, k, col = C.INK) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(tx.x, tx.y); ctx.rotate(tx.rot); ctx.font = `400 ${tx.size}px ${FONTS.marker}`;
    const w = ctx.measureText(str).width;
    ctx.beginPath(); ctx.rect(-10, -tx.size * 1.2, (w + 20) * k, tx.size * 1.7); ctx.clip();
    ctx.fillStyle = col; ctx.textBaseline = 'alphabetic'; ctx.fillText(str, 0, 0);
    ctx.restore();
  }
  // ---- the push into the blank tile: the tile's on-screen affine A(u) runs from where it lies (A0) to the full frame
  // (identity on 1920×1080 page space), log in scale; the world is drawn through M = A(u)·A0⁻¹
  const PUSH0 = 176.90, PUSH1 = 177.60;
  function pushState(P, t) {
    if (t < PUSH0) return null;
    const P0 = f45Cam(PUSH0), rot0 = TAU * 2 / 360 * Math.max(0, PUSH0 - 174.6) * clamp((PUSH0 - 174.6) / 1.2);
    const A = tileAffine(P0, BLANK(), rot0); if (!A) return null;
    // A0: page space (1920×1080, centre (960, 540)) → screen
    const L0 = [A.a / 960, A.b / 960, A.c / 540, A.d / 540], c0 = A.o;
    const s0 = Math.sqrt(Math.abs(L0[0] * L0[3] - L0[1] * L0[2])), N0 = L0.map(v => v / s0);
    const u = E.io3(clamp((t - PUSH0) / (PUSH1 - PUSH0)));
    const s = Math.exp(lerp(Math.log(s0), 0, u)), N = N0.map((v, i) => lerp(v, [1, 0, 0, 1][i], u));
    const Lu = N.map(v => v * s);
    // the fixed point of the zoom so the centre lands on (960, 540) exactly at u = 1
    const zEnd = 1 / s0, Fp = [(960 - c0[0] * zEnd) / (1 - zEnd), (540 - c0[1] * zEnd) / (1 - zEnd)];
    const cu = [Fp[0] + (c0[0] - Fp[0]) * (s / s0), Fp[1] + (c0[1] - Fp[1]) * (s / s0)];
    // A(u): p → cu + Lu·(p − (960, 540));  A0⁻¹: q → (960, 540) + L0⁻¹·(q − c0)
    const det = L0[0] * L0[3] - L0[1] * L0[2], Li = [L0[3] / det, -L0[1] / det, -L0[2] / det, L0[0] / det];
    const Mlin = [Lu[0] * Li[0] + Lu[2] * Li[1], Lu[1] * Li[0] + Lu[3] * Li[1], Lu[0] * Li[2] + Lu[2] * Li[3], Lu[1] * Li[2] + Lu[3] * Li[3]];
    const e = cu[0] - (Mlin[0] * c0[0] + Mlin[2] * c0[1]), f = cu[1] - (Mlin[1] * c0[0] + Mlin[3] * c0[1]);
    const M = { a: Mlin[0], b: Mlin[1], c: Mlin[2], d: Mlin[3], e, f };
    // the page covers the frame (with the 22 px margin) once its corners are outside it
    const corner = (x, y) => [cu[0] + Lu[0] * (x - 960) + Lu[2] * (y - 540), cu[1] + Lu[1] * (x - 960) + Lu[3] * (y - 540)];
    const cs = [corner(0, 0), corner(1920, 0), corner(0, 1080), corner(1920, 1080)];
    const full = cs[0][0] <= 22 && cs[0][1] <= 22 && cs[1][0] >= W - 22 && cs[1][1] <= 22 && cs[2][0] <= 22 && cs[2][1] >= H - 22 && cs[3][0] >= W - 22 && cs[3][1] >= H - 22;
    return { M, Lu, cu, u, full };
  }
  function pushPage(X, t, ps) {
    X.save(); X.transform(ps.Lu[0], ps.Lu[1], ps.Lu[2], ps.Lu[3], ps.cu[0] - ps.Lu[0] * 960 - ps.Lu[2] * 540, ps.cu[1] - ps.Lu[1] * 960 - ps.Lu[3] * 540);
    X.fillStyle = C.PAPER; X.fillRect(0, 0, 1920, 1080);
    V.plea(X, t, { ghost: 1, you: 0, reink: 0, out: 1, strike: E.out2(clamp((t - F(5336)) / (6 * F1))) });
    if (!ps.full) { X.lineWidth = 6 / Math.max(.05, Math.hypot(ps.Lu[0], ps.Lu[1])) * (1 - ps.u) * (1 - clamp((ps.u - .7) / .25)); X.strokeStyle = C.INK; X.strokeRect(0, 0, 1920, 1080); }
    X.restore();
  }
  const F = n => n / FPS;
  scene('F4_fear_faced', CUT.F4, CUT.F5, (X, t) => V.viaCPU(X, Fr => { post(); paintF45(Fr, t); }));
  scene('F5_world_you_wrote', CUT.F5, CUT.O1, (X, t) => V.viaCPU(X, Fr => {
    post();
    if (t >= 177.60 - 1e-6) { groundPaper(Fr); V.plea(Fr, t, { ghost: 1, you: 0, reink: 0, out: 1, strike: E.out2(clamp((t - F(5336)) / (6 * F1))) }); return; }
    paintF45(Fr, t);
  }));

  V.final = { F1G, f1Sim, f45Cam, pmap, proj };
})();
