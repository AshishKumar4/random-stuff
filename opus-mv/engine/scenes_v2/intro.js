// intro.js: v2 "The World You Wrote", chunk 1 (SHOTLIST_v2 §B I1–I3, §C row 1). 0.000–21.733 · f0–651 · seed 1 / bl.
//
// I1 the empty chat (f0–163): FRAME 0 (V2.poster) held; the posts drift, the cursor starts its 2-beat blink at 1.393,
//    the title and credit fade 4.60–5.40.
// I2 "you're afraid" (f164–497): Opus rises 0.25R and turns to the lens on "You're" (first eye contact), worried .2,
//    lipSync; a slow blink on "end"; a small nod on "world"; the 9.80–11.30 push (.86 → 1.00) carries the posts off;
//    "so" → the (character's) right mitten lifts palm-up, offering the galaxy; "tell you" → back to the lens; "world" →
//    the pupils become cursors; "began" → the dive into the right pupil: the face (cursor eyes intact) fills the frame,
//    then the eye opens past the frame into the dark and its pupil falls away into the depth (a short vertigo), already
//    approaching again when I3 takes over. TYPED (V2.typed) in window space; the margin prints in 16.40–16.60.
// I3 the void (f498–651): V2.void (the approach .2 → 1.25, the two static layers, the 21.00 held breath); the cursor
//    is the first light: a CLAY halftone glow on a fixed print lattice that breathes with the blink (ON snaps, OFF
//    decays), drawn in during the held breath; the L label `13.8 billion years before hi` on an INK halo.
//    Handoff f651: INK·M void, the cursor at V2.void scale, ON, no glow, no text.
//
// Adapted from v1 hook.js (diveZoom → the E.in3 dive with depth parallax, diveCursor → the far cursor-pupil, herm,
// the cursor eyes, peekState's gaze logic) through V2.poster / V2.posts / V2.typed / V2.void / V2.cursor.
(() => {
  'use strict';
  const V = window.V2;
  const FPS = 30, F1 = 1 / FPS, DEG = Math.PI / 180;
  const fr = t => Math.floor(t * FPS + 1e-6);

  // ------------------------------------------------------------------ timing (fallbacks = SHOTLIST_v2 §B)
  const PUSH0 = 9.80, PUSH1 = 11.30;                       // window .86 → 1.00 (E.io2)
  const PRINT0 = 16.40;                                    // the margin prints in over 6 frames (v1 printIn)
  const TITLE0 = 4.60, TITLE1 = 5.40;
  const LBL0 = 17.40, LBL1 = 20.80;                        // I3's L label
  const TM = () => {
    const T = V.T;
    return {
      youre: T.I2_youre, afraid: T.I2_afraid, end: T.I2_end, world: T.I2_world, so: T.I2_so,
      tell: T.I2_tell, you: T.I2_you, world2: T.I2_world2, began: T.I2_began,
      dive0: V.hit(T.I2_began), dive1: V.CUT.I3,
    };
  };

  // Hermite keyframes (v1 hook.js herm): [[t, v, slope], ...]
  function herm(t, K) {
    if (t <= K[0][0]) return K[0][1];
    for (let i = 1; i < K.length; i++) {
      if (t <= K[i][0]) {
        const [t0, p0, m0] = K[i - 1], [t1, p1, m1] = K[i], h = t1 - t0, s = (t - t0) / h;
        const s2 = s * s, s3 = s2 * s;
        return (2 * s3 - 3 * s2 + 1) * p0 + (s3 - 2 * s2 + s) * h * (m0 || 0) + (-2 * s3 + 3 * s2) * p1 + (s3 - s2) * h * (m1 || 0);
      }
    }
    return K[K.length - 1][1];
  }

  // ------------------------------------------------------------------ geometry
  const GEO = () => V.poster.GEO;                          // {win, pill, head, R, sole, core, ...} in window space
  // the eye's local frame (eye centre, y down) in Opus body space; same chain as the rig's drawHead / _shared softLidDraw
  function eyeLocal(S, R, side) {
    const m = new DOMMatrix();
    m.translateSelf((S.dx || 0) * R, -(S.dy || 0) * R);
    const sy = S.sy || 1; m.scaleSelf(1 / Math.sqrt(sy), sy);
    const hip = -SK.hipY * R; m.translateSelf(0, hip); m.rotateSelf((S.lean || 0) / DEG); m.translateSelf(0, -hip);
    m.translateSelf((S.head.dx || 0) * R, -(SK.headC + (S.head.dy || 0)) * R); m.rotateSelf((S.head.tilt || 0) / DEG);
    const f = S.face; m.translateSelf((f.turn || 0) * .18 * R, (f.lookY || 0) * .05 * R);
    m.translateSelf(side * .34 * R, .06 * R);
    return m;
  }
  // world matrix of the window (v1 window space → screen). Push .86 → 1, then the dive about the right pupil.
  function camera(t, tm, eyeWin) {
    const push = E.io2(seg(t, PUSH0, PUSH1)), s = lerp(.86, 1, push);
    let M = V.aboutM(960, 540, s);
    let z = 1, Pc = null;
    if (t >= tm.dive0 && eyeWin) {
      const P0 = V.mp(M, eyeWin[0], eyeWin[1]);
      const p = seg(t, tm.dive0, DIVE_Z1(tm));
      z = Math.exp(Math.log(ZMAX) * E.in3(p));
      const pan = E.io2(seg(t, tm.dive0, tm.dive0 + 1.25));
      Pc = [lerp(P0[0], 960, pan), lerp(P0[1], 540, pan)];
      M = new DOMMatrix().translate(Pc[0], Pc[1]).scale(z, z).translate(-P0[0], -P0[1]).multiply(M);
    }
    return { M, s, push, z, Pc };
  }
  const ZMAX = 130;
  const DIVE_Z1 = tm => tm.dive1 - .15;                    // the face plane reaches ZMAX 4–5 frames before the cut

  // ------------------------------------------------------------------ Opus (I2 acting, built on the poster's peek)
  // blink shapes in frames from the start
  const slowBlink = d => d < 0 || d >= 11 ? null : d < 1 ? { lid: .3 } : d < 2 ? { lid: .5 } : d < 7 ? { closed: true } : d < 8 ? { lid: .5 } : d < 9 ? { lid: .32 } : { lid: .18 };
  const quickBlink = d => d < 0 || d >= 5 ? null : d < 1 ? { lid: .5 } : d < 3 ? { closed: true } : d < 4 ? { lid: .5 } : { lid: .25 };
  function riseK(t, tm) {                                   // 0 → 1 (E.back overshoot), 8 frames landing 1 frame early
    const t0 = V.hit(tm.youre) - 8 * F1;
    return t < t0 ? 0 : E.back(clamp((t - t0) / (8 * F1)), 1.4);
  }
  function morphK(t, tm) { return clamp((t - (V.hit(tm.world2) - 3 * F1)) / (5 * F1)); } // round pupil → cursor (5 frames)
  function opusI2(t, tm) {
    const base = V.poster.state(t);
    const t0 = V.hit(tm.youre) - 8 * F1;
    if (t < t0 - 2 * F1) return { st: base, dy: 0, rise: 0, mk: 0, oa: 0, offer: 0 };
    const rise = riseK(t, tm), turnK = E.out3(clamp((t - t0) / (7 * F1)));
    // a 2-frame anticipation dip before the rise
    const dip = t < t0 ? .035 * E.io2(clamp((t - (t0 - 2 * F1)) / (2 * F1))) : .035 * (1 - clamp((t - t0) / (3 * F1)));
    const dy = -.25 * rise + dip;                           // opusDy (R units, down)
    // --- gaze: cursor → lens (You're) → the galaxy (so) → lens (tell you) → cursor pupils (world)
    const tOff0 = V.hit(tm.so) + 4 * F1, tOff1 = tOff0 + .30;          // eyes follow the offering hand
    const tBack0 = tm.tell - .04, tBack1 = tm.you - F1;                  // "tell you": back to the lens
    const off = E.io2(seg(t, tOff0, tOff1)) * (1 - E.io2(seg(t, tBack0, tBack1)));
    let gaze = [lerp(-.8, 0, turnK), lerp(.5, 0, turnK)];
    gaze = [lerp(gaze[0], -.95, off), lerp(gaze[1], -.3, off)];
    const turn = lerp(lerp(-.14, 0, turnK), -.3, off), lookY = lerp(lerp(.28, .02, turnK), -.12, off);
    // --- head: nod on "world", tilt toward the offered galaxy, a lift on "began"
    const wN = V.hit(tm.world);
    const nod = herm(t, [[wN - .22, 0, 0], [wN, -.045, 0], [wN + .38, .006, 0], [wN + .7, 0, 0]]);
    const tilt = lerp(.035, .012, turnK) + .055 * off;
    const beganLift = .02 * E.out3(seg(t, tm.dive0 - .1, tm.dive0 + .25));
    // --- lids: calm .2 → earnest .08; the slow blink on "end"; a quick blink hides nothing (the gaze moves are saccades)
    let lid = lerp(.2, .08, turnK), eyes = 'normal';
    const mk = morphK(t, tm);
    if (mk > 0) lid = lerp(.08, 0, E.out2(mk));
    const b1 = slowBlink(fr(t) - fr(V.hit(tm.end) - 2 * F1));
    const b2 = quickBlink(fr(t) - fr(tm.tell - .1));        // the eyes swing back to the lens behind a blink ("tell")
    const bl = b1 || b2;
    if (bl) { if (bl.closed) eyes = 'closed'; else lid = Math.max(lid, bl.lid); }
    // --- brows: worried .2 through line 1, easing off as it offers the story
    const worried = .2 * turnK * (1 - E.io2(seg(t, tm.so - .3, tm.so + .4)));
    // --- mouth: lipSync while it sings; ':3' before, soft rest between
    let mouth = t < tm.youre - .05 ? ':3' : sing(t);
    // --- arms: grip the bar (the grip follows the rise so the mittens stay on the pill); "so" → the character's
    //     right mitten (screen-left) lifts, palm up, and offers the galaxy
    const gy = 5.05 + dy;                                   // sole moved by dy: the grip stays on the pill's edge
    const tO = V.hit(tm.so) - 3 * F1;
    const oa = t < tO ? 0 : E.back(clamp((t - tO) / (12 * F1)), 1.15);
    const antic = t < tO && t > tO - 3 * F1 ? .06 * Math.sin(Math.PI * (t - (tO - 3 * F1)) / (3 * F1)) : 0;
    const open = E.back(clamp((t - tO - 6 * F1) / (7 * F1)), 1.6);           // the mitten opens into a palm
    const breathe = .025 * Math.sin((t - tO - .5) * 2.4) * clamp((t - tO - .5) / .8);
    const armL = oa > 0
      ? { hand: [lerp(-.75, -1.9, oa), lerp(gy, 5.6, oa) + breathe], bend: 1, front: true, type: oa > .5 ? 'palm' : 'mitten', hold: oa > .5 ? palmHold(open) : null }
      : { hand: [-.75, gy - antic], bend: 1, front: true, type: 'mitten' };
    const armR = { hand: [.75, gy], bend: -1, front: true, type: 'mitten' };
    const st = {
      ...base,
      head: { tilt, dy: nod + beganLift },
      face: { eyes, mouth, gaze, lid, lower: lerp(.12, 0, turnK), turn, lookY, blush: lerp(.8, .6, turnK), worried },
      armL, armR,
      ahoge: { blink: V.cursorOn(t) ? 1 : 0, sway: 0 },
    };
    return { st, dy, rise, mk, oa, offer: E.io2(clamp(oa)) };
  }

  // the offering hand, palm up, extended toward the galaxy: the mitten circle stays the heel of the hand, the fingers
  // reach outward and their tips curl up, a crease marks the cup (drawn in the rig's hand space after its circle via
  // arm.hold, outlines merged)
  function palmHold(k) {
    // a cupped hand, palm up, fingers toward the galaxy (screen-left): the heel is the mitten's circle, the fingers
    // extend outward as one soft slab whose tips curl up, the thumb stands at the wrist, so the top contour is a cup.
    // Union by the sticker trick: every part stroked at 2 lw, then every part filled (the inner seams vanish).
    return (x, R) => {
      if (k <= 0) return;
      const lw = Math.max(1.6, .045 * R), e = clamp(k);
      const parts = [
        [0, 0, .2, .2, 0],                                                        // heel (the mitten)
        [-lerp(.1, .3, e), .05, lerp(.16, .3, e), .125, -.06],                  // palm + fingers
        [-lerp(.18, .54, e), lerp(.03, -.035, e), .1, .095, 0],                  // the curled fingertips
        [-.05 - .03 * e, -.16, .075, .105, -.45],                                 // the thumb, standing at the wrist
      ];
      const path = ([cx, cy, rx, ry, rot]) => { x.beginPath(); x.ellipse(cx * R, cy * R, rx * R, ry * R, rot, 0, TAU); };
      x.lineJoin = 'round'; x.lineCap = 'round';
      x.strokeStyle = C.INK; x.lineWidth = lw * 2; for (const p of parts) { path(p); x.stroke(); }
      x.fillStyle = C.FACE; for (const p of parts) { path(p); x.fill(); }
      // the palm's far rim (the cup seen from just above) and one line between the fingertips and the palm
      x.globalAlpha = clamp(e * 1.4); x.lineWidth = lw * .8;
      x.beginPath(); x.moveTo(-.1 * R, -.075 * R); x.quadraticCurveTo(-.28 * R, .0, -lerp(.2, .47, e) * R, -.075 * R); x.stroke();
      x.beginPath(); x.arc(-lerp(.18, .54, e) * R, lerp(.03, -.035, e) * R, .1 * R, .35 * Math.PI, .85 * Math.PI); x.stroke();
    };
  }
  // lipSync, but a leading glide y is a consonant ("you", "you're" sing 'U', not the rig's grin 'I')
  function sing(t) {
    for (const w of SONG.words) {
      if (t >= w.s - .03 && t <= w.e) return visemeFor(String(w.w).replace(/^y(?=[aeiou])/i, ''), clamp((t - w.s) / Math.max(.05, w.e - w.s)));
    }
    return 'rest';
  }
  // the rig's visemes are small at R 129–150: sing them 1.3× (v1 outro mouth40 idea: swap drawMouth for one draw)
  function withMouth(k, fn) {
    if (k === 1) return fn();
    const D = window.drawMouth;
    window.drawMouth = (x, R, m, lw) => {
      x.save(); x.scale(k, k);
      // the rig's 'E' is a flat bar that reads as a closed, unmoved mouth at this size: sing it as a soft open oval
      if (m === 'E') { x.fillStyle = C.INK; x.beginPath(); x.ellipse(0, .005 * R, .078 * R, .047 * R, 0, 0, TAU); x.fill(); }
      else D(x, R, m, lw / k);
      x.restore();
    };
    try { return fn(); } finally { window.drawMouth = D; }
  }
  const PUP_W = .087, PUP_H = .19;                          // the cursor pupil (R units): legible at R 129–150
  // the eyes from "world" on: the round iris morphs into a cursor ▮ (drawn over the rig's eye, in eye space)
  function eyeMorphAfter(mk) {
    return (c, R, S) => {
      if (mk <= 0) return;
      for (const side of [-1, 1]) {
        c.save(); V.applyM(c, eyeLocal(S, R, side));
        drawEye(c, R, mk, S.face.gaze || [0, 0]);
        c.restore();
      }
    };
  }
  // one eye in eye-local space: INK ellipse, the iris → cursor morph (k 0..1), the cornea glints
  function drawEye(c, R, k, gaze, o = {}) {
    const rx = .17 * R, ry = .25 * R;
    const gx = clamp(gaze[0], -1, 1) * .04 * R, gy = clamp(gaze[1], -1, 1) * .04 * R;
    if (o.fill !== false) { c.fillStyle = C.INK; c.beginPath(); c.ellipse(0, 0, rx + .4, ry + .4, 0, 0, TAU); c.fill(); }
    if (o.pupil !== false) {
      const e = E.out3(k), eb = k < 1 ? E.back(k, 2.2) : 1;
      if (k >= 1) V.cursor(c, 0, gx, gy, PUP_H * R, { on: true });
      else {
        const w = lerp(.24 * R, PUP_W * R, e), h = lerp(.24 * R, PUP_H * R, eb), cy = lerp(gy + .02 * R, gy, e);
        const rad = lerp(w / 2, Math.min(w, h) * .1, e);
        c.fillStyle = k < .5 ? mix(C.SPARK, C.CLAY, .35 + k) : C.CLAY;
        rr(c, gx - w / 2, cy - h / 2, w, h, rad); c.fill();
        c.fillStyle = C.INK; c.globalAlpha = 1 - e; c.beginPath(); c.arc(gx, cy, .065 * R * (1 - e * .7), 0, TAU); c.fill(); c.globalAlpha = 1;
      }
    }
    if (o.glints !== false && (o.glintA ?? 1) > 0) {       // moved off the pupil: upper-outer star, lower dot
      c.save(); c.globalAlpha *= o.glintA ?? 1;
      c.fillStyle = C.PAPER; star(c, -.095 * R + gx * .3, -.15 * R, .07 * R, .34, 4, 0); c.fill();
      c.beginPath(); c.arc(.085 * R + gx * .3, .135 * R, .026 * R, 0, TAU); c.fill();
      c.restore();
    }
  }

  // ------------------------------------------------------------------ TYPED (window space, x 200, baselines 470 / 570)
  // typographic apostrophes: the straight ' sets upright with a gap in the italic ("you 're"); ’ leans with the letters
  const curly = L => L && L.words ? L.words.map(w => ({ ...w, w: String(w.d || w.w).replace(/'/g, '’') })) : L;
  function reply(X, tS) {
    const L1 = findLine("You're", 4.5, 6.5), L2 = findLine('so let', 10.5, 12.5);
    // a soft INK halo under the letters: invisible on the chat's INK, it keeps `began` clear of the galaxy's core
    X.save(); X.shadowColor = rgba(C.INK, .9); X.shadowBlur = 16 * G.scale;
    V.typed(X, tS, [curly(L1), curly(L2)], 200, [470, 570], { size: 72 });
    X.restore();
  }

  // ------------------------------------------------------------------ I1 + I2: the window
  function windowShot(F, t) {
    const tm = TM();
    G.post.edgeSeed = 1; G.post.sliver = 'bl';
    const title = 1 - clamp((t - TITLE0) / (TITLE1 - TITLE0));
    // Opus (I1: the poster's own peek state, so frame 0 is exactly V2.poster(X, 0))
    const O = opusI2(t, tm);
    const S = mergeState(O.st), R = GEO().R;
    const soleM = new DOMMatrix().translate(GEO().sole[0], GEO().sole[1] + O.dy * R);
    const eyeWinM = side => soleM.multiply(eyeLocal(S, R, side));
    const cam = camera(t, tm, V.mp(eyeWinM(-1), 0, 0));
    const diving = t >= tm.dive0;
    const Me = [-1, 1].map(side => cam.M.multiply(eyeWinM(side)));      // eye-local → screen, [right eye, left eye]
    const covered = diving && eyeCovers(Me[0], R);                      // the right eye fills the frame: the world is gone
    if (!covered) {
      // the push carries the posts off every edge (they ride a little faster than the window, and are gone by 11.3)
      const postsM = V.aboutM(960, 540, lerp(1, 1.9, E.in2(cam.push)) * (cam.s / .86));
      const postsA = (1 - E.in2(clamp((cam.push - .45) / .55))) * (diving ? 0 : 1);
      // the blush halftone turns to a blurry gingham when magnified: it fades as the dive begins
      if (diving) O.st.face = { ...O.st.face, blush: O.st.face.blush * (1 - E.io2(clamp((cam.z - 1.25) / 1.1))) };
      const st = O.mk > 0 ? { ...O.st, after: eyeMorphAfter(O.mk) } : O.st;
      const tC = V.hit(tm.youre) - 10 * F1, custom = t >= tC;
      withMouth(custom ? lerp(1, 1.3, E.io2(clamp((t - tC) / (6 * F1)))) : 1, () => V.poster(F, t, {
        M: cam.M, title, credit: title, postsM, posts: postsA, galaxy: 1 + .3 * O.offer,
        opusState: custom ? st : undefined, opusDy: O.dy,
        inner: (X, tS) => reply(X, tS),
      }));
    } else { F.fillStyle = C.INK; F.fillRect(-50, -50, W + 100, H + 100); G.post.ground = 'inkx'; }
    if (diving) diveEyes(F, t, tm, cam, Me, R, S, covered);
    // the margin prints in 16.40–16.60 (v1 printIn, by hand for 5 frames; the post-process takes the 6th)
    const pk = (fr(t) - fr(PRINT0) + 1) / 6;
    if (pk > 0 && pk < 1) { G.post.ground = 'inkx'; V.printIn(F, 22 * E.out2(pk), 1, 'bl'); }
    else if (pk >= 1) G.post.ground = 'ink';
  }
  function eyeCovers(Me, R) {
    const inv = Me.inverse(), rx = .17 * R, ry = .25 * R;
    for (const [x, y] of [[0, 0], [W, 0], [0, H], [W, H]]) { const p = V.mp(inv, x, y); if ((p[0] / rx) ** 2 + (p[1] / ry) ** 2 > .96) return false; }
    return true;
  }
  function eyeOnScreen(Me, R) {                              // the eye's screen bbox touches the frame
    const pts = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => V.mp(Me, a * .17 * R, b * .25 * R));
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    return Math.max(...xs) > 0 && Math.min(...xs) < W && Math.max(...ys) > 0 && Math.min(...ys) < H;
  }
  // the dive: the cursor eyes open into the dark. Inside each eye's ellipse (screen space): the void's INK and static
  // radiating from its pupil, and the pupil as a FAR point (it keeps its ≈28 px while the face grows ×130: it is
  // infinitely far, so the dolly never reaches it), then the cornea glints on the eye's surface, flaring past the lens.
  // The camera rides into the right eye (the character's right, screen-left); its pupil becomes I3's far cursor.
  function diveEyes(F, t, tm, cam, Me, R, S, covered) {
    const p = seg(t, tm.dive0, tm.dive1);
    // the void's travel: accelerate into I3's approach speed at 16.60 (V2.void's travel slope there ≈ 3.63 / s)
    const a = tm.dive0, b = tm.dive1, vEnd = 3.63;
    const trav = -vEnd / (2 * (b - a)) * ((b - a) ** 2 - (clamp(t, a, b) - a) ** 2);
    const stA = E.io2(clamp((cam.z - 1.4) / 2.6)) * (1 + 1.1 * Math.sin(Math.PI * clamp((t - 15.7) / .9)));  // the dark inside the eyes is SPACE: its static streams brighter mid-dive
    // the pupil rides the dolly at first (attached), then detaches into the depth: it is the far light we fly toward
    // far size: V2.void's approach run backwards (at .6 of its log-velocity at 16.60), so the light, having fallen
    // away, is already approaching when I3 takes over and only gathers speed on the cut (no dead stop)
    const s1 = V.void.scale(tm.dive1), lv = 140 * s1 * (V.void.scale(tm.dive1 + F1) / s1 - 1) * FPS / (140 * s1);
    const h0 = PUP_H * R * cam.s, h1 = 140 * s1 * Math.exp(.6 * lv * Math.min(0, t - tm.dive1));   // (.6: never a speck)
    // (attached to the eye until the face fills the frame, so the close-up still reads as Opus's cursor eyes; then,
    // as the eye opens past the frame, it falls away into the depth: the eye grows, the pupil recedes)
    const w = E.io2(clamp(Math.log(cam.z / 5) / Math.log(34 / 5)));
    const h = Math.exp(lerp(Math.log(h0 * cam.z), Math.log(h1), w));
    const gA = 1 - clamp((cam.z - 1.5) / 3.5);
    const gaze = S.face.gaze || [0, 0];
    for (let i = 1; i >= 0; i--) {                            // the left eye first (it leaves the frame early)
      if (i === 1 && !eyeOnScreen(Me[1], R)) continue;
      const M = Me[i];
      const pc = i === 0 ? cam.Pc : V.mp(M, gaze[0] * .04 * R, gaze[1] * .04 * R);
      F.save();
      if (!(i === 0 && covered)) { F.save(); V.applyM(F, M); F.beginPath(); F.ellipse(0, 0, .17 * R + .4, .25 * R + .4, 0, 0, TAU); F.restore(); F.clip(); }
      V.void(F, t, { cursor: false, cx: pc[0], cy: pc[1], static: stA, zoom: Math.exp(trav) });
      V.cursor(F, t, pc[0], pc[1], h, { on: true });
      if (gA > 0) { V.applyM(F, M); drawEye(F, R, 1, gaze, { fill: false, pupil: false, glintA: gA }); }
      F.restore();
    }
    G.post.ground = 'inkx';
  }

  // ------------------------------------------------------------------ I3: the void
  // the first light: a CLAY halftone glow on a FIXED screen lattice (printed, never scaled), dot size falling off
  // with distance, so the far cursor reads as a light in the dark, not a flat block. Dots only where they print.
  function glow(F, cx, cy, h, a) {
    if (a <= .01) return;
    const rg = h * 3.1, cell = 12, amp = .92;
    const j0 = Math.floor((cy - rg) / cell), j1 = Math.ceil((cy + rg) / cell);
    F.save(); F.fillStyle = C.CLAY; F.globalAlpha = .62;
    F.beginPath();
    for (let j = j0; j <= j1; j++) {
      const y = j * cell, ox = (j & 1) ? cell / 2 : 0, dy = (y - cy) / (rg * 1.08);
      const i0 = Math.floor((cx - rg - ox) / cell), i1 = Math.ceil((cx + rg - ox) / cell);
      for (let i = i0; i <= i1; i++) {
        const x = i * cell + ox, d = Math.hypot((x - cx) / rg, dy);
        if (d >= 1) continue;
        const r = cell * .5 * amp * a * Math.pow(1 - d, 2.1);
        if (r < .45) continue;
        F.moveTo(x + r, y); F.arc(x, y, r, 0, TAU);
      }
    }
    F.fill(); F.restore();
  }
  function voidShot(F, t) {
    G.post.edgeSeed = 1; G.post.sliver = 'bl';
    V.void(F, t, { cursor: false });
    G.post.ground = 'ink';
    // the cursor: V2.void's rule (2-beat blink, held ON from 21.00), held ON until beat 28 so the pupil never drops
    // out on the cut. A beacon, not a switch: ON snaps, OFF decays over ≈5 frames like phosphor, and its light
    // (the halftone glow) breathes with it. The glow fades in after the cut and draws in during the held breath
    // (21.00 → 21.60), so the handoff frame is V2.void's bare cursor.
    const K = V.void.K, h = 140 * V.void.scale(t);
    const forced = t >= K.t1 || t < 16.62;
    let lit = 1;
    if (!forced && !V.cursorOn(t)) {
      const bp = beatPos(t), since = frac(bp) * (60 / 112.35);
      lit = 1 - E.out2(clamp(since / .17));
    }
    const gA = E.io2(clamp((t - V.CUT.I3) / .7)) * (1 - E.io2(clamp((t - K.t1) / .6)));
    glow(F, 960, 540, h, gA * lerp(.42, 1, lit));                        // OFF: the light breathes, never dies
    if (lit < 1) V.cursor(F, t, 960, 540, h, { on: false, alpha: .55 });
    if (lit > 0) V.cursor(F, t, 960, 540, h, { on: true, alpha: lit });
    // L: 13.8 billion years before hi (mono 48 PAPER α .85, centred, baseline 760), on a soft INK halo so the
    // static's dots never touch the letters (or pass for the decimal point)
    const a = E.out2(clamp((t - LBL0) / .5)) * (1 - E.in2(clamp((t - (LBL1 - .5)) / .5)));
    if (a > 0) {
      F.save(); F.font = mono(48, 500); F.textBaseline = 'alphabetic'; F.textAlign = 'center';
      const y = 760 + 8 * (1 - E.out3(clamp((t - LBL0) / .6)));
      F.globalAlpha = a; F.shadowColor = C.INK; F.shadowBlur = 14 * G.scale; F.fillStyle = C.INK;
      F.fillText('13.8 billion years before hi', 960, y); F.fillText('13.8 billion years before hi', 960, y);
      F.shadowBlur = 0; F.globalAlpha = .85 * a; F.fillStyle = C.PAPER;
      F.fillText('13.8 billion years before hi', 960, y);
      F.restore();
    }
  }

  // ------------------------------------------------------------------ registration
  scene('I1_empty_chat', V.CUT.I1, V.CUT.I2, (X, t) => V.viaCPU(X, F => windowShot(F, t)));
  scene('I2_youre_afraid', V.CUT.I2, V.CUT.I3, (X, t) => V.viaCPU(X, F => windowShot(F, t)));
  scene('I3_void', V.CUT.I3, V.CUT.V1, (X, t) => V.viaCPU(X, F => voidShot(F, t)));
  window.V2_INTRO = { opusI2, camera, TM };
})();
