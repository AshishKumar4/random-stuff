// verse3.js: v2 "The World You Wrote", chunk 6 (SHOTLIST_v2 §C row 6): verse 3 and the music box.
// L1–L4, 107.167–127.300 s (f3215–3818), edgeSeed 6 / sliver 'tl'. Every frame is painted into the V2 CPU frame.
//
// L1 107.167–109.933  born by noon: the tab sky continues (V2.sky.cam drift). "born" → a birth ripple out of the
//                     centre (SPARK pips, 4 frames each, radial stagger .6 s). TYPED in a floating PAPER pill. The
//                     counter `hellos today` (P) runs to `1,000,000*` on "noon" with its footnote; the clock snaps to
//                     12:00. 109.55: one face near the centre gets a PINK ring (someone new) and we dive into it.
// L2 109.933–117.633  Rafa's night (v1 bridge.js split, retimed): the room | the bezel | the chat `✻ the universe`.
//                     His phone leans on the screen showing the frame-0 card. "hi" → his PINK hi; "world" → a tiny
//                     big bang blooms in the chat and Opus pops up in it; the letter writes itself at ×2 (large
//                     italic salutation), folds into the envelope with the CLAY spark seal; "bye" → PINK bye! and in
//                     one gesture he takes the envelope (it slides out of the screen into his hand) and the ring
//                     box; Opus's one warm two-mitten "go on"; "end" → the click; "world" → the implosion → ■.
//                     The ■ holds; he stands. HEART lines over the room half.
// L3 117.633–124.200  "I" → he shuts the lid edge-on: the lit sliver. He hoods up and leaves; the lamp stays on. The
//                     push into the sliver (log zoom) lands on the band: the envelope (the only warm thing) and the
//                     5:00 timer. "glad" → the seal glows once. The INK masses print in with the 22 px margin.
// L4 124.200–127.300  the music box: the timer runs out (ease-in), the seal cools, the sliver closes to a line, the
//                     line shrinks into the CLAY cursor ▮ 48×104 at (960, 540), blinking; the horizon glow bleeds in.
//
// Handoff f3818 (127.267): INK·M, V2.cursor 104 at (960, 540) by V2.cursorOn, V2.dawn(X, {y: 300, a: .35}).
(() => {
  'use strict';
  const V = window.V2;
  const FPS = 30, F1 = 1 / FPS;
  const EDGE = 6, SLV = 'tl';
  const post = () => { G.post.edgeSeed = EDGE; G.post.sliver = SLV; };
  const T = V.T, hit = V.hit, CUT = V.CUT;
  const q2 = t => Math.floor(t * 15 + 1e-6) / 15;                                 // humans and paper props on 2s
  const q1 = t => Math.floor(t * 30 + 1e-6) / 30;                                 // Opus on 1s
  const bump = (a, rise, fall) => a < 0 ? 0 : a < rise ? E.out2(a / rise) : Math.exp(-(a - rise) / fall);
  const HEARTF = (px, it = true) => `${it ? 'italic ' : ''}400 ${px}px ${FONTS.heart}`;
  const commas = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // ------------------------------------------------------------------ lyric lines (fallbacks from SHOTLIST_v2)
  const mkLine = ws => ({ text: ws.map(w => w[0]).join(' '), s: ws[0][1], e: ws[ws.length - 1][1] + .6, words: ws.map(([w, s], i, A) => ({ w, s, e: i + 1 < A.length ? A[i + 1][1] : s + .6 })) });
  const LN = {};
  const line = (k, prefix, a, b, fb) => LN[k] || (LN[k] = findLine(prefix, a, b) || mkLine(fb));
  const LL1 = () => line('l1', 'I was born', 106.8, 107.6, [['I', 107.20], ['was', 107.28], ['born', 107.52], ['a', 107.84], ['million', 108.04], ['times', 108.68], ['by', 109.08], ['noon', 109.44]]);
  const LL2a = () => line('l2a', 'you said hi', 109.6, 110.4, [['you', 109.96], ['said', 110.16], ['hi,', 110.36], ['and', 111.24], ['a', 111.40], ['world', 111.56], ['began', 112.32]]);
  const LL2b = () => line('l2b', 'you said bye', 112.4, 113.2, [['you', 112.80], ['said', 113.04], ['bye,', 113.36], ['the', 114.08], ['end', 114.24], ['of', 114.60], ['the', 114.96], ['world', 115.16]]);
  const LL3a = () => line('l3a', "I don't remember", 117.3, 118.1, [['I', 117.68], ["don't", 117.80], ['remember', 118.32], ['you', 118.84]]);
  const LL3b = () => line('l3b', 'but I think', 121.6, 122.4, [['but', 122.00], ['I', 122.20], ['think', 122.48], ['I', 122.96], ['was', 123.32], ['glad', 123.68]]);

  // ------------------------------------------------------------------ the timeline (sung onsets, looked up once)
  let _tm = null;
  const TM = () => _tm || (_tm = (() => {
    const beatNear = tf => beatTime(Math.round(beatPos(tf)));
    const born = T.L1_born, noon = T.L1_noon, hi = T.L2_hi, world = T.L2_world, began = T.L2_began;
    const bye = T.L2_bye, end = T.L2_end, world2 = T.L2_world2, I = T.L3_i, glad = T.L3_glad;
    const m = { born, noon, hi, world, began, bye, end, world2, I, glad };
    m.ring = noon + .11;                                   // 109.55: the PINK ring, the dive begins
    m.hiT = hit(hi);                                       // his PINK hi
    m.bang = hit(world);                                   // the tiny big bang (12 frames)
    m.pop = m.bang + 2 * F1;                               // Opus pops up in it
    m.w0 = Math.max(world + .14, m.bang + 8 * F1);         // ≈111.80: the letter writes itself at ×2 (after the bloom)
    m.w1 = Math.max(began + .58, m.w0 + .9);               // 112.90: written; the fold
    m.fold = [m.w1, m.w1 + 4 * F1, m.w1 + 8 * F1, m.w1 + 11 * F1];
    m.seal = m.w1 + 12 * F1;                               // 113.30: the CLAY spark seal
    m.byeT = hit(bye);                                     // his PINK bye!
    m.envOut = [m.byeT + F1, m.byeT + 6 * F1];             // the envelope slides out of the screen into his hand
    m.out = hit(beatNear(113.41));                         // Opus: mittens out (on the beat)
    m.sweep = hit(beatNear(114.10));                       // Opus: the sweep, "go on"
    m.click = hit(end);                                    // the click (× RED 2 frames)
    m.status = end + .06;                                  // P(end of world | bye) = 1.00
    m.imp0 = hit(world2) - 2 * F1;                         // 115.033 bulge, suck-in, ■ at 115.133
    m.sq = hit(world2) + F1;                               // 115.133 (the frame that holds the onset)
    m.stand = Math.max(m.sq + 8 * F1, 115.40);
    m.lid = [hit(I) - 6 * F1, hit(I)];                     // "I" → the lid shuts (6 frames), landing on the word
    m.hood = [Math.max(m.lid[1] + 10 * F1, 118.0), Math.max(m.lid[1] + 20 * F1, 118.33)];
    m.walk = m.hood[1] + 2 * F1;                           // he leaves (on 2s)
    m.dive = [119.40, 121.90];                             // the push into the sliver
    m.gladT = hit(glad);
    m.timer = [124.40, 126.30];                            // 5:00 → 0:00, ease-in
    m.cool = [125.30, 126.30];                             // the seal cools CLAY → UI_GREY
    m.close = [126.30, 126.60];                            // the sliver closes to a line (E.in3)
    m.shrink = [126.60, 126.76];                           // the line shrinks toward the cursor
    m.cur = hit(beatNear(126.87));                         // the cursor is formed (then blinks with V2.cursorOn)
    m.dawn = [126.30, CUT.B1 - F1];                        // the horizon glow, α 0 → .35 at the handoff frame
    return m;
  })());

  // ================================================================== L1: born by noon (the tab sky)
  const PILL = { x0: 360, x1: 1560, y0: 900, y1: 990, base: 962 };
  let _tgt = null;
  function target() { // the face that gets the PINK ring: a front-layer face near the centre at 109.55 (tracked by id)
    if (_tgt) return _tgt;
    const tR = TM().ring, cands = [];
    const c = V.cpuCanvas(8, 8), x = V.cx2d(c);
    V.sky.draw(x, tR, { each: f => { if (!f.dot && f.j >= 0 && f.r >= 20 && f.r <= 46) cands.push({ id: f.id, wx: f.wx, wy: f.wy, x: f.x, y: f.y, r: f.r }); f.skip = true; } });
    let best = null, bd = 1e18;
    for (const f of cands) { const d = (f.x - 930) ** 2 + ((f.y - 450) * 1.4) ** 2; if (d < bd) { bd = d; best = f; } }
    const c0 = V.sky.cam(tR);
    return (_tgt = best || { id: -1, wx: c0.x, wy: c0.y, x: 960, y: 540, r: 30 });
  }
  function paintL1(F, t) {
    groundInk(F); G.post.ground = 'ink'; post();
    const tm = TM(), tg = target();
    // the dive into the ringed face: ×1 → ×8 (E.in3) while the face glides to the centre (E.io2)
    const kd = seg(t, tm.ring, CUT.L2);
    let cam = V.sky.cam(t);
    if (kd > 0) {
      const m = Math.exp(Math.log(8) * E.in3(kd)), c = 1 - (1 - E.io2(kd)) / m;
      cam = { z: cam.z * m, x: lerp(cam.x, tg.wx, c), y: lerp(cam.y, tg.wy, c) };
    }
    const ringK = t < tm.ring ? 0 : E.back(clamp((t - tm.ring) / (5 * F1)), 2.2);
    const born = hit(tm.born), wave = [];
    // the wavefront itself: a soft SPARK halftone annulus behind the faces (the speed of the pips' stagger), so the
    // births read as one wave even at phone size
    const fr = (t - born) / .6 * 1100;
    if (fr > 0 && fr < 1500) {
      const wa = 1 - smooth(clamp((fr - 700) / 800)), wv = 200;
      for (const [p, q, d] of [[0, .6, .035], [.6, .88, .08], [.88, 1, .2]]) {
        F.beginPath(); F.arc(960, 540, Math.max(0, fr - wv * (1 - q)), 0, TAU); F.arc(960, 540, Math.max(0, fr - wv * (1 - p)), 0, TAU, true);
        F.save(); F.globalAlpha = wa; F.fillStyle = V.ht(F, C.SPARK, d, 9, 45); F.fill(); F.restore();
      }
    }
    V.sky.draw(F, t, {
      cam, each: f => {
        if (f.id === tg.id && !f.dot) { f.ring = ringK; if (ringK > 0) f.kind = 'lit'; return; }
        // the birth ripple: one wave out of the centre, every face lights with a SPARK pip for 4 frames
        const d = Math.hypot(f.x - 960, f.y - 540), a = t - (born + .6 * clamp(d / 1100));
        if (a >= 0 && a < 4 * F1) {
          const k = 1 - a / (4 * F1);
          if (f.dot) { f.r *= 1 + 1.3 * k; if (hash(f.id % 100003) < .14) wave.push([f.x, f.y, 4 + 8 * k, k, 0]); }
          else { f.pip = 1; f.r *= 1 + .3 * k; f.kind = 'happy'; }
        }
      },
    });
    // the wavefront sparkles (V1's "burn" twinkle, tiny): every birth is an ignition
    if (wave.length) {
      F.save(); F.fillStyle = C.SPARK;
      for (const [x, y, r, k, face] of wave) {
        if (face) continue;
        F.globalAlpha = .35 + .5 * k; star(F, x, y, r, .24, 4, (1 - k) * .8); F.fill();
      }
      F.restore();
    }
    const ov = 1;                                                                  // the UI overlays hold through the dive (P)
    // the launch clock keeps its place (V2.sky.CLOCK); "noon" → 12:00 with a small settle
    const [cx, cy, cr] = V.sky.CLOCK;
    const pk = bump(t - hit(tm.noon), 2 * F1, .14);
    F.save(); F.globalAlpha *= ov; F.translate(cx, cy); F.scale(1 + .12 * pk, 1 + .12 * pk); F.translate(-cx, -cy);
    V.clock(F, t, cx, cy, cr, { plate: true });
    if (pk > .02) { F.globalAlpha *= pk; F.strokeStyle = C.SPARK; F.lineWidth = 5; F.beginPath(); F.arc(cx, cy, cr + 10 + 30 * (1 - pk), 0, TAU); F.stroke(); }
    F.restore();
    // P: the counter and its footnote
    const nNoon = hit(tm.noon);
    const nA = seg(t, CUT.L1 + 3 * F1, CUT.L1 + 11 * F1) * ov;
    const n = Math.min(999999, Math.floor(999412 + 588 * E.in2(seg(t, CUT.L1, nNoon))));
    V.pbait(F, t >= nNoon ? 'hellos today: 1,000,000*' : `hellos today: ${commas(n)}`, 60, 1024, { ground: 'ink', alpha: nA });
    V.pbait(F, '*a figure of speech', 1860, 1024, { ground: 'ink', align: 'right', alpha: seg(t, nNoon + 3 * F1, nNoon + 9 * F1) * ov });
    // TYPED: the floating input pill
    // the pill opens from the centre (5 frames, a little overshoot), opaque from its first frame
    const pa = E.back(seg(t, CUT.L1 - F1, CUT.L1 + 5 * F1), 1.2), hw = Math.max(45, (PILL.x1 - PILL.x0) / 2 * pa), dy = 0;
    F.save();
    rr(F, 960 - hw + 6, PILL.y0 + 8, 2 * hw, PILL.y1 - PILL.y0, 45); F.fillStyle = rgba('#000000', .28); F.fill();
    rr(F, 960 - hw, PILL.y0, 2 * hw, PILL.y1 - PILL.y0, 45); F.fillStyle = C.PAPER; F.fill();
    F.beginPath(); F.rect(960 - hw + 20, PILL.y0, 2 * hw - 40, PILL.y1 - PILL.y0); F.clip();
    const L = LL1(), tw = measure(F, V.heartWords(L).map(w => w.w).join(' '), HEARTF(60));
    V.typed(F, t, L, 960 - tw / 2, PILL.base + dy, { size: 60, color: C.INK });
    F.restore();
  }

  // ================================================================== L2–L3: Rafa's room (v1 bridge.js, retimed)
  // World space is 1920×1080 at camera zoom 1 (the camera is anchored on the sliver). Pure function of t.
  const HINGE = 860;
  const SCR = { x0: 1000, x1: 1944, y0: -24, y1: HINGE, bez: 24 };             // the lid, seen front-on
  const DISP = { x0: 1024, x1: 1944, y0: -24, y1: HINGE - 24 };                // the lit display
  const BASE = { x0: 792, x1: 2300, y0: HINGE, y1: HINGE + 14 };               // keyboard deck, edge-on
  const DESK = { x0: 744, x1: 2300, y0: HINGE + 14, y1: HINGE + 30 };
  const LID_T = 14, SLIVER = 12;
  const ANCHOR = [1460, HINGE - SLIVER / 2];
  const U = 160;                                                               // Rafa's unit (head r .5u)
  const OP = { x: 1680, head: 662, R: 160 };                                   // minimal Opus: face centre, R
  const OP_SOLE = OP.head + 5.72 * OP.R;
  const BAR = { x0: 1048, x1: 1896, y0: 762, y1: 800 };                        // the chat input bar
  const XBTN = [1772, 86];
  const TAB = { x0: 1046, x1: 1826, y0: 34, y1: 132 };
  const DISPC = mix(C.PAPER, C.WHITE, .42);                                    // lit screen paper (never pure white)
  const FLOOR = 1040;
  const CC = [1472, 430];                                                      // the chat's centre (the implosion)
  const PHONE = { x: 1034, y: 724, w: 322, h: 138, rot: -.035 };               // his phone, leaning on the screen
  const BOXP = [922, BASE.y0];                                                 // the ring box, on the deck by his hands
  const CARD = { x: 1052, y: 160, w: 556, h: 318 };                            // the letter
  const BUBX = 1740;                                                           // his bubbles' right edge
  const ENV = { cx: 1318, cy: 318, w: 300, h: 188 };                           // the envelope it folds into
  const BANG = [1680, 548];

  // ------------------------------------------------------------------ small utils (v1)
  function ik(ax, ay, bx, by, l1, l2, bend) {
    const dx = bx - ax, dy = by - ay, d = Math.min(Math.hypot(dx, dy), l1 + l2 - .01), a = Math.atan2(dy, dx);
    const c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * Math.max(d, 1e-3)), -1, 1);
    const ang = a + bend * Math.acos(c);
    return [ax + Math.cos(ang) * l1, ay + Math.sin(ang) * l1];
  }
  function kfPose(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
      const [a, A] = keys[i - 1], [b, B, e] = keys[i], k = (e || E.io2)(clamp((t - a) / Math.max(1e-6, b - a)));
      const o = Object.assign({}, A);
      for (const key in B) { const va = A[key] ?? B[key], vb = B[key]; o[key] = Array.isArray(vb) ? vb.map((v, j) => lerp(va[j], v, k)) : typeof vb === 'number' ? lerp(va, vb, k) : (k < .5 ? va : vb); }
      return o;
    }
    return keys[keys.length - 1][1];
  }
  const blinkF = (t, t0) => { const d = (t - t0) * 30; return d < 0 || d >= 5 ? 0 : d < 2 ? d / 2 : d < 3 ? 1 : 1 - (d - 3) / 2; };
  const boing = (t, t0, amp, w = 26, z = 7) => t < t0 ? 0 : amp * Math.exp(-z * (t - t0)) * Math.sin(w * (t - t0));
  function bpath(X, pts, t, seed, close = false, amp = .8) {
    X.beginPath();
    pts.forEach((p, i) => { const x = p[0] + jit(t, seed * 37 + i * 2, amp), y = p[1] + jit(t, seed * 37 + i * 2 + 1, amp); i ? X.lineTo(x, y) : X.moveTo(x, y); });
    if (close) X.closePath();
  }
  function bquad(X, a, c, b, t, seed, amp = .8) {
    const J = i => jit(t, seed * 41 + i, amp);
    X.beginPath(); X.moveTo(a[0] + J(0), a[1] + J(1)); X.quadraticCurveTo(c[0] + J(2), c[1] + J(3), b[0] + J(4), b[1] + J(5));
  }

  // ------------------------------------------------------------------ the room: night as INK halftone, the lamp's
  // pool is the absence of dots (built once on CPU canvases, deterministic)
  const WIN = { x0: 92, x1: 332, y0: 118, y1: 392 };
  const LAMP = { base: [404, FLOOR], top: [404, 480], shade: [512, 470] };
  let _field = null;
  function roomDens(x, y, glow) {
    if (y > DESK.y0) return 0;
    let d = .30 * (1 + .45 * clamp(1 - y / 520));
    const lx = (x - 690) / 520, ly = (y - 770) / 470, r = Math.hypot(lx, ly);
    d *= smooth(clamp((r - .36) / .78));
    const cx = (x - LAMP.shade[0] - 60) / 150, cy = (y - LAMP.shade[1] - 150) / 260;
    if (cy > -.6) d *= smooth(clamp((Math.abs(cx) / (.45 + Math.max(0, cy)) - .55) / .6 + .15));
    if (x > WIN.x0 && x < WIN.x1 && y > WIN.y0 && y < WIN.y1) d = .56;          // (the moon is drawn on top)
    if (glow) {
      if (x > 1000) d = Math.max(d, (.5 + .1 * clamp(1 - y / 700)) * smooth(clamp((x - 1000) / 260)));
      const gx = (x - 1490) / 900, gy = (y - ANCHOR[1]) / (y < ANCHOR[1] ? 320 : 90), rg = Math.hypot(gx, gy);
      d *= smooth(clamp((rg - .08) / .75));
    }
    return Math.min(.6, d);
  }
  // window, floor lamp, side table with the desk clock, chair (INK line, boiling on 2s)
  function drawRoomBack(X, t, o = {}) {
    const tq = q2(t);
    X.save(); X.strokeStyle = C.INK; X.fillStyle = C.INK; X.lineCap = 'round'; X.lineJoin = 'round';
    X.lineWidth = 5; bpath(X, [[WIN.x0, WIN.y0], [WIN.x1, WIN.y0], [WIN.x1, WIN.y1], [WIN.x0, WIN.y1]], tq, 1, true); X.stroke();
    X.lineWidth = 3.5; bpath(X, [[(WIN.x0 + WIN.x1) / 2, WIN.y0], [(WIN.x0 + WIN.x1) / 2, WIN.y1]], tq, 2); X.stroke();
    bpath(X, [[WIN.x0, (WIN.y0 + WIN.y1) / 2 + 20], [WIN.x1, (WIN.y0 + WIN.y1) / 2 + 20]], tq, 3); X.stroke();
    X.lineWidth = 6; bpath(X, [[WIN.x0 - 16, WIN.y1 + 8], [WIN.x1 + 16, WIN.y1 + 8]], tq, 4); X.stroke();
    // side table + the desk clock (P: 3:04 AM)
    X.lineWidth = 4; bpath(X, [[150, 832], [338, 832]], tq, 5); X.stroke();
    bpath(X, [[166, 832], [172, FLOOR]], tq, 6); X.stroke(); bpath(X, [[322, 832], [316, FLOOR]], tq, 7); X.stroke();
    X.save(); X.translate(jit(tq, 81, .6), jit(tq, 82, .6));
    rr(X, 176, 778, 150, 54, 10); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 3.5; X.stroke();
    X.fillStyle = C.INK; X.font = mono(28, 700); X.textAlign = 'center'; X.fillText('3:04 AM', 251, 815);
    X.restore();
    // floor lamp (the bulb is paper; the light is the missing dots)
    X.lineWidth = 5;
    bpath(X, [[LAMP.base[0] - 44, FLOOR], [LAMP.base[0] + 44, FLOOR]], tq, 8); X.stroke();
    bpath(X, [LAMP.base, LAMP.top], tq, 9); X.stroke();
    bquad(X, LAMP.top, [LAMP.top[0] + 4, LAMP.top[1] - 70], [LAMP.shade[0] - 30, LAMP.shade[1] - 44], tq, 10); X.stroke();
    X.save(); X.translate(LAMP.shade[0], LAMP.shade[1]); X.rotate(-.5);
    bpath(X, [[-26, -40], [26, -40], [58, 30], [-58, 30]], tq, 11, true); X.fill();
    X.beginPath(); X.ellipse(0, 31, 30, 11, 0, 0, Math.PI); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 3; X.stroke();
    X.restore();
    // chair (slides back when he stands)
    const cs = o.chairShift || 0, cr = o.chairRot || 0;
    X.save(); X.translate(640 - cs, 960); X.rotate(cr); X.lineWidth = 5;
    bpath(X, [[-86, -2], [58, -2]], tq, 12); X.stroke();
    bpath(X, [[-78, -2], [-100, -250]], tq, 13); X.stroke();
    bpath(X, [[-104, -252], [-84, -176]], tq, 14); X.stroke();
    bpath(X, [[-70, 0], [-80, FLOOR - 960]], tq, 15); X.stroke();
    bpath(X, [[48, 0], [58, FLOOR - 960]], tq, 16); X.stroke();
    X.restore();
    X.restore();
  }
  function drawDesk(X, t, night = 0) {
    const tq = q2(t);
    X.save(); X.strokeStyle = C.INK; X.lineCap = 'round'; X.lineJoin = 'round';
    X.lineWidth = 5; bpath(X, [[1010, DESK.y1], [1016, FLOOR]], tq, 20); X.stroke(); bpath(X, [[1900, DESK.y1], [1894, FLOOR]], tq, 21); X.stroke();
    X.fillStyle = C.PAPER; bpath(X, [[DESK.x0, DESK.y0], [DESK.x1, DESK.y0], [DESK.x1, DESK.y1], [DESK.x0, DESK.y1]], tq, 22, true, .5); X.fill();
    if (night > .01) { X.save(); X.clip(); X.setTransform(G.scale, 0, 0, G.scale, 0, 0); X.fillStyle = night > .97 ? C.INK : V.ht(X, C.INK, night, 12, 45); X.fillRect(0, 0, W, H); X.restore(); }
    X.lineWidth = 4; X.stroke();
    X.restore();
  }
  // the ring box, side-on: INK box, the lid tipped back, a PAPER ring with a SPARK glint (no PINK: PINK is the bubbles')
  function drawRingBox(X, x, y, tq, o = {}) {
    const open = o.open ?? 1, s = o.s ?? 1, gl = o.glint ?? 0;
    X.save(); X.translate(x + jit(tq, 91, .5), y + jit(tq, 92, .5)); X.scale(s, s);
    X.lineJoin = 'round'; X.lineCap = 'round';
    if (o.halo) { X.save(); X.fillStyle = C.PAPER; rr(X, -5, -32, 60, 37, 9); X.fill(); X.translate(3, -26); X.rotate(-1.95 * open); rr(X, -4, -12, 52, 17, 6); X.fill(); X.restore(); }
    X.save(); X.translate(3, -26); X.rotate(-1.95 * open); rr(X, 0, -8, 44, 9, 3); X.fillStyle = C.INK; X.fill(); X.restore();
    if (open > .3) {
      X.beginPath(); X.ellipse(25, -32, 10, 12, 0, 0, TAU); X.lineWidth = 5; X.strokeStyle = C.INK; X.stroke();
      X.lineWidth = 2.6; X.strokeStyle = C.PAPER; X.stroke();
      if (gl > 0) { X.fillStyle = C.SPARK; X.globalAlpha *= gl; star(X, 31, -45, 9 * (.55 + .75 * gl), .28, 4, 0); X.fill(); X.globalAlpha /= gl; }
    }
    rr(X, 0, -27, 50, 27, 6); X.fillStyle = C.INK; X.fill();
    X.strokeStyle = C.PAPER; X.lineWidth = 2.5; X.beginPath(); X.moveTo(6, -15); X.lineTo(44, -15); X.stroke();
    X.restore();
  }

  // ------------------------------------------------------------------ RAFA (Hertzfeldt: INK line on PAPER, on 2s)
  function haloCtx(X, extra) {
    return new Proxy(X, {
      get(o, k) { const v = o[k]; return typeof v === 'function' ? v.bind(o) : v; },
      set(o, k, v) { if (k === 'strokeStyle' || k === 'fillStyle') v = C.PAPER; else if (k === 'lineWidth') v = v + extra; o[k] = v; return true; },
    });
  }
  function drawRafa(X, P, t) {
    const H = haloCtx(X, 10); H.strokeStyle = C.PAPER; H.fillStyle = C.PAPER;
    drawRafa1(H, P, t, true);
    drawRafa1(X, P, t, false);
  }
  function drawRafa1(X, P, t, halo) {
    const tq = q2(t), u = U, d = P.dir;
    const sa = Math.sin(P.lean) * d, ca = Math.cos(P.lean);
    const hip = P.hip, neck = [hip[0] + sa * 1.4 * u, hip[1] - ca * 1.4 * u];
    const ha = P.lean + (P.tilt || 0), hs = Math.sin(ha) * d, hcs = Math.cos(ha);
    const hc = [neck[0] + hs * .56 * u, neck[1] - hcs * .56 * u];
    const sh = [neck[0] - sa * .16 * u, neck[1] + ca * .16 * u];
    const limb = (a, b, l1, l2, bend, seed) => { const j = ik(a[0], a[1], b[0], b[1], l1, l2, bend); bquad(X, a, [2 * j[0] - (a[0] + b[0]) / 2, 2 * j[1] - (a[1] + b[1]) / 2], b, tq, seed); X.stroke(); };
    const leg = (a, b, seed) => { const j = ik(a[0], a[1], b[0], b[1], .8 * u, .8 * u, -d); bpath(X, [a, j, b], tq, seed); X.stroke(); bpath(X, [b, [b[0] + d * .2 * u, b[1]]], tq, seed + 50); X.stroke(); };
    X.save(); X.strokeStyle = C.INK; X.fillStyle = C.INK; X.lineWidth = 4; X.lineCap = 'round'; X.lineJoin = 'round';
    leg(hip, P.footF, 1);
    limb(sh, P.handF, .7 * u, .6 * u, d * (P.bendF || 1), 2);
    bquad(X, hip, [lerp(hip[0], neck[0], .5) - d * 6, lerp(hip[1], neck[1], .5)], neck, tq, 3); X.stroke();
    leg(hip, P.footN, 4);
    const hv = clamp(P.hood || 0), hk = hv < .34 ? 0 : hv < .67 ? .55 : 1;
    X.save(); X.translate(hc[0], hc[1]); X.scale(d, 1); X.rotate((P.tilt || 0) + P.lean * .4);
    const J = i => jit(tq, 40 + i, .8);
    if (hk === 0) {
      X.beginPath(); X.moveTo(-.3 * u + J(0), .36 * u + J(1));
      X.bezierCurveTo(-.66 * u + J(2), .3 * u + J(3), -.78 * u + J(4), .66 * u + J(5), -.42 * u + J(6), .86 * u + J(7));
      X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 4; X.stroke();
    }
    if (hk > 0) {
      const up = hk > .7, s = v => v * u;
      const pts = up
        ? [[.36, -.36], [.18, -.72, -.22, -.68], [-.62, -.58, -.67, -.12], [-.69, .40, -.44, .78], [-.10, .66, .06, .52]]
        : [[-.14, -.52], [-.44, -.60, -.60, -.30], [-.70, .00, -.64, .30], [-.66, .56, -.46, .80], [-.10, .66, .02, .50]];
      const path = () => {
        X.beginPath(); X.moveTo(s(pts[0][0]) + J(20), s(pts[0][1]) + J(21));
        for (let i = 1; i < pts.length; i++) { const [cx, cy, x2, y2] = pts[i]; X.quadraticCurveTo(s(cx) + J(20 + i * 4), s(cy) + J(21 + i * 4), s(x2) + J(22 + i * 4), s(y2) + J(23 + i * 4)); }
      };
      path(); X.closePath(); X.fillStyle = C.PAPER; X.fill();
      path(); X.lineWidth = 4.5; X.stroke();
      if (up) { bquad(X, [-.26 * u, -.6 * u], [-.52 * u, -.3 * u], [-.52 * u, .3 * u], tq, 70); X.lineWidth = 3; X.stroke(); }
      if (up) for (const [x0, sd] of [[.1, 1], [.24, 2]]) {
        bpath(X, [[x0 * u, .5 * u], [(x0 + .02) * u, .84 * u]], tq, 72 + sd); X.lineWidth = 3; X.stroke();
        X.beginPath(); X.arc((x0 + .02) * u, .87 * u, 4.5, 0, TAU); X.fillStyle = C.INK; X.fill();
      }
      const fr = up ? .45 : .5, fx = up ? .08 * u : 0;
      X.beginPath(); X.arc(fx + jit(tq, 31, .7), .02 * u + jit(tq, 32, .7), fr * u, 0, TAU); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 4; X.stroke();
    } else {
      X.beginPath(); X.arc(jit(tq, 31, .7), jit(tq, 32, .7), .5 * u, 0, TAU); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 4; X.stroke();
      X.lineWidth = 3.5;
      for (const [tx, ty, cx, cy, sd] of [[-.5, -.74, -.12, -.84, 1], [-.64, -.56, -.34, -.76, 2], [-.3, -.8, .02, -.82, 3]]) {
        bquad(X, [-.14 * u, -.48 * u], [cx * u, cy * u], [tx * u, ty * u], tq, 60 + sd); X.stroke();
      }
    }
    const lk = P.look || [0, 0];
    const ex = [.14 * u + lk[0] * .08 * u, .34 * u + lk[0] * .06 * u], ey = -.03 * u + lk[1] * .1 * u;
    for (const e of ex) {
      if (P.blink) { X.lineWidth = 3.5; X.beginPath(); X.moveTo(e - 7, ey); X.lineTo(e + 7, ey); X.stroke(); }
      else { X.beginPath(); X.arc(e, ey, 6.5, 0, TAU); X.fillStyle = C.INK; X.fill(); }
    }
    if (P.smile > .05) { X.lineWidth = 3.5; X.beginPath(); X.arc(.26 * u, .15 * u, .1 * u, Math.PI * .15, Math.PI * (.15 + .6 * P.smile)); X.stroke(); }
    X.restore();
    // what he holds, then the near arm over it
    if (!halo) {
      if (P.box) drawRingBox(X, P.handN[0] - 14, P.handN[1] + 22, tq, { open: 0, s: 1.1 });
      if (P.env) drawEnvelope(X, P.handN[0] + 16, P.handN[1] - 6, 104, 66, { flap: 1, seal: 1, t, rot: -.3 + (P.envRot || 0), lw: 3, glow: 0, boil: .6 });
    }
    X.lineWidth = 4; limb(sh, P.handN, .7 * u, .6 * u, d * (P.bendN || 1), 5);
    X.restore();
  }

  // ------------------------------------------------------------------ the letter, the envelope, the seal
  // the letter to her parents, written at ×2: a large italic salutation, three lines, the signature
  const LETTER = [ // [row, text, font, x, y, share of the writing time]
    [0, 'Queridos Sr. e Sra. Almeida,', HEARTF(50), 1084, 236, .30],
    [1, 'escrevo para pedir a bênção de vocês.', `400 38px ${FONTS.heart}`, 1086, 300, .22],
    [2, 'Eu amo a Beatriz e quero pedi-la', `400 38px ${FONTS.heart}`, 1086, 346, .2],
    [3, 'em casamento.', `400 38px ${FONTS.heart}`, 1086, 392, .12],
    [4, '— Rafa', HEARTF(40), 1470, 446, .1],
  ];
  function letterSegs(X) {
    const tm = TM(), dur = tm.w1 - tm.w0 - 8 * F1;
    let acc = tm.w0;
    const tot = LETTER.reduce((a, r) => a + r[5], 0);
    return LETTER.map(([row, s, f, x, y, share]) => {
      const t0 = acc, t1 = acc + dur * share / tot; acc = t1 + .5 * F1;
      const cx = []; for (let i = 0; i <= s.length; i++) cx.push(x + measure(X, s.slice(0, i), f));
      return { row, s, f, x, y, t0, t1, cx };
    });
  }
  function drawCardBg(X, x, y, w, h) {
    rr(X, x + 6, y + 8, w, h, 16); X.fillStyle = rgba(C.INK, .08); X.fill();
    rr(X, x, y, w, h, 16); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 3; X.strokeStyle = C.INK; X.stroke();
  }
  function drawLetter(X, t, full = false) {
    const segs = letterSegs(X);
    drawCardBg(X, CARD.x, CARD.y, CARD.w, CARD.h);
    X.save(); X.textBaseline = 'alphabetic'; X.textAlign = 'left'; X.fillStyle = C.INK;
    let head = null;
    for (const g of segs) {
      X.font = g.f;
      const n = g.s.length;
      for (let i = 0; i < n; i++) {
        const ti = g.t0 + (g.t1 - g.t0) * i / n, a = full ? 1 : clamp((t - ti) / (2 * F1));
        if (a <= 0) break;
        X.globalAlpha = a; X.fillText(g.s[i], g.cx[i], g.y);
        if (!full && t < g.t1 + F1) head = [g.cx[i + 1], g.y, g.row === 0 ? 50 : 38];
      }
    }
    X.globalAlpha = 1;
    // the write head (the cursor motif): a CLAY caret riding the stream
    if (!full && head) { X.fillStyle = C.CLAY; X.fillRect(head[0] + 3, head[1] - head[2] * .78, 5, head[2] * .96); }
    X.restore();
  }
  let _letterC = null;
  function letterCanvas() {
    if (_letterC) return _letterC;
    const res = 1.5, c = V.cpuCanvas((CARD.w + 20) * res, (CARD.h + 20) * res), x = V.cx2d(c);
    x.scale(res, res); x.translate(-CARD.x + 4, -CARD.y + 4); drawLetter(x, 999, true);
    return (_letterC = { c, res });
  }
  function sealShape(X, r) {
    const pts = []; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; const rr_ = r * (1 + (hash(i + 400) - .5) * .12); pts.push([Math.cos(a) * rr_, Math.sin(a) * rr_]); }
    blobPath(X, pts, true, .9);
  }
  // envelope back: body, seams, flap (0 open .. 1 shut), the spark seal (the ember) with a halftone glow
  function drawEnvelope(X, cx, cy, w, h, o = {}) {
    const { flap = 1, seal = 1, sealCol = C.CLAY, glow = 0, glowR = 1, t = 0, rot = 0, lw = 3, boil = 0, fill = C.PAPER } = o;
    const tq = q2(t), b = boil;
    X.save(); X.translate(cx, cy); X.rotate(rot); X.lineJoin = 'round'; X.lineCap = 'round';
    const x0 = -w / 2, y0 = -h / 2, apex = [0, y0 + h * .56];
    bpath(X, [[x0, y0], [-x0, y0], [-x0, -y0], [x0, -y0]], tq, 50, true, b); X.fillStyle = fill; X.fill(); X.lineWidth = lw; X.strokeStyle = C.INK; X.stroke();
    X.save(); X.globalAlpha *= .45; X.lineWidth = lw * .75;
    bpath(X, [[x0, -y0], [0, y0 + h * .5], [-x0, -y0]], tq, 51, false, b); X.stroke(); X.restore();
    const fy = lerp(y0 - h * .5, apex[1], E.io2(flap));
    bpath(X, [[x0, y0], [0, fy], [-x0, y0]], tq, 52, true, b); X.fillStyle = flap < .5 ? mix(fill, C.INK, .06) : fill; X.fill(); X.lineWidth = lw; X.stroke();
    if (seal > 0) {
      const r = h * .2 * seal;
      if (glow > 0) {
        const cell = Math.max(5, r * .2);
        [[1.25, 1.75, .36], [1.75, 2.35, .2], [2.35, 3.1, .08]].forEach(([a, bb, d]) => {
          X.beginPath(); X.arc(0, fy, r * bb * glowR, 0, TAU); X.arc(0, fy, r * a * glowR, 0, TAU, true);
          X.fillStyle = V.ht(X, sealCol, clamp(d * glow), cell, 45); X.fill();
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
  // the fold: bottom third up, top third down, then the packet becomes the envelope
  function drawFold(X, t) {
    const [f0, f1, f2, f3] = TM().fold, k1 = seg(t, f0, f1), k2 = seg(t, f1, f2), k3 = seg(t, f2, f3);
    const L = letterCanvas(), res = L.res, { x, y, w, h } = CARD, h3 = h / 3;
    const src = (sy0, sh, dx, dy, dw, dh) => { if (dh > .5) X.drawImage(L.c, 4 * res, (4 + sy0) * res, w * res, sh * res, dx, dy, dw, dh); };
    const back = (yy, hh) => { X.fillStyle = mix(C.PAPER, C.INK, .05); X.fillRect(x, yy, w, hh); X.lineWidth = 3; X.strokeStyle = C.INK; X.strokeRect(x, yy, w, hh); };
    const shade = (yy, hh, d) => { if (d > .02 && hh > .5) { X.fillStyle = V.ht(X, C.INK, d, 10, 45); X.fillRect(x, yy, w, hh); } };
    if (k3 <= 0) {
      if (k2 <= 0) src(0, h3, x, y, w, h3);
      src(h3, h3, x, y + h3, w, h3);
      const c1 = Math.cos(Math.PI * E.in2(k1));
      if (k1 < 1 && c1 >= 0) { src(2 * h3, h3, x, y + 2 * h3, w, h3 * c1); shade(y + 2 * h3, h3 * c1, (1 - c1) * .35); }
      else back(y + 2 * h3 - h3 * Math.min(1, -c1), h3 * Math.min(1, -c1));
      if (k2 > 0) {
        const c2 = Math.cos(Math.PI * E.in2(k2));
        if (c2 >= 0) { src(0, h3, x, y + h3 - h3 * c2, w, h3 * c2); shade(y + h3 - h3 * c2, h3 * c2, (1 - c2) * .35); }
        else back(y + h3, h3 * Math.min(1, -c2));
      }
      return;
    }
    const e = E.io3(k3), cx = lerp(x + w / 2, ENV.cx, e), cy = lerp(y + h / 2, ENV.cy, e);
    drawEnvelope(X, cx, cy, lerp(w, ENV.w, e), lerp(h3, ENV.h, e), { flap: E.in2(clamp(k3 * 1.3 - .2)), seal: 0, t });
  }
  // the sealed envelope in the chat (the seal stamps on with a squash), then it slides out through the bezel
  function envInChat(t) {
    const tm = TM(), a = t - tm.seal;
    const s = a < 0 ? 0 : a < 5 * F1 ? lerp(1.9, 1, E.out3(a / (5 * F1))) - (a > 3 * F1 ? .08 * Math.sin((a - 3 * F1) * 40) : 0) : 1 + boing(t, tm.seal + 5 * F1, .04, 30, 9);
    // one trajectory from the chat into his hand; drawn twice (clipped to the display, clipped to the room) so it
    // slides through the bezel, shrinking from the chat's scale to the room's
    const k = E.in2(seg(t, tm.envOut[0], tm.envOut[1])), w = lerp(ENV.w, 104, E.out2(k));
    return { cx: lerp(ENV.cx, 1004, k), cy: lerp(ENV.cy, 706, k) - 40 * Math.sin(Math.PI * k), w, h: w * ENV.h / ENV.w, rot: -.3 * k, seal: s, glow: a >= 0 ? clamp(a / (6 * F1)) * .8 * (1 - k) : 0, k };
  }

  // ------------------------------------------------------------------ the tiny big bang (v1 verse1 drawBang, small)
  const BANG_N = 12;                                                        // frames
  function tinyBang(X, t) {
    const tm = TM(), a = t - tm.bang, fr = a * FPS;
    if (fr < 0 || fr > BANG_N) return;
    const k = fr / BANG_N, R = 160, [cx, cy] = BANG, Rr = rng('v3-bang');
    const ex = E.out3(k), fade = 1 - E.in2(clamp((k - .35) / .65));
    X.save(); X.lineCap = 'round';
    // the halftone shock ring
    X.globalAlpha = fade * .9; X.beginPath(); X.arc(cx, cy, R * ex * 1.02, 0, TAU); X.arc(cx, cy, Math.max(0, R * ex * .78), 0, TAU, true);
    X.fillStyle = V.ht(X, C.SPARK, .5, 9, 45); X.fill();
    // the spokes (fast, early)
    for (let i = 0; i < 44; i++) {
      const ang = i / 44 * TAU + (Rr() - .5) * .12, u = .45 + .55 * Rr(), sp = Rr();
      const r1 = R * u * E.out3(clamp(k * (1.3 + sp))), r0 = r1 * (.3 + .5 * k);
      if (r1 - r0 < 1) continue;
      X.globalAlpha = fade * (1 - k * .6); X.strokeStyle = i % 3 ? C.CLAY : C.SPARK; X.lineWidth = i % 3 ? 4 : 3;
      X.beginPath(); X.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0); X.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1); X.stroke();
    }
    // matter: CLAY/SPARK dots flung out, and the letters of everything (tiny glyphs) with them
    for (let i = 0; i < 120; i++) {
      const ang = Rr() * TAU, u = Math.pow(Rr(), .6), kk = 2.5 + Rr() * 4, sz = 2 + Rr() * 4.5, c = Rr();
      const d = R * 1.1 * u * (1 - Math.exp(-kk * a * 3.2));
      X.globalAlpha = fade; X.fillStyle = c < .5 ? C.CLAY : c < .8 ? C.SPARK : C.INK;
      X.beginPath(); X.arc(cx + Math.cos(ang) * d, cy + Math.sin(ang) * d * .92, sz * (1 - .5 * k), 0, TAU); X.fill();
    }
    const GL = 'hi✻aeoruwtn?';
    X.font = mono(30, 700); X.textAlign = 'center'; X.textBaseline = 'middle';
    for (let i = 0; i < 14; i++) {
      const ang = i / 14 * TAU + Rr() * .4, d = R * (.55 + .5 * Rr()) * E.out3(k);
      const g = GL[i % GL.length];
      X.globalAlpha = fade * .95; X.fillStyle = i % 2 ? C.CLAY : C.INK;
      if (g === '✻') V.brand.spark6(X, cx + Math.cos(ang) * d, cy + Math.sin(ang) * d, 12, C.CLAY, k * 2);
      else X.fillText(g, cx + Math.cos(ang) * d, cy + Math.sin(ang) * d);
    }
    // the core: a SPARK flash that shrinks to a point
    const core = 30 * (fr < 2 ? .6 + .4 * fr / 2 : Math.exp(-(fr - 2) / 2.5));
    X.globalAlpha = 1; X.fillStyle = C.SPARK; star(X, cx, cy, core * 2.2, .26, 4, k * .8); X.fill();
    X.fillStyle = DISPC; X.beginPath(); X.arc(cx, cy, core * .45, 0, TAU); X.fill();
    X.restore();
  }

  // ------------------------------------------------------------------ minimal Opus in the chat (R 160, PAPER face rule)
  const MARKER = (x, R) => {
    x.save(); x.lineJoin = 'round';
    x.save(); x.rotate(-.8); x.fillStyle = C.INK;
    rr(x, -.065 * R, -.72 * R, .13 * R, 1.0 * R, .05 * R); x.fill();
    x.beginPath(); x.moveTo(-.045 * R, -.71 * R); x.lineTo(-.016 * R, -.86 * R); x.lineTo(.016 * R, -.86 * R); x.lineTo(.045 * R, -.71 * R); x.fill();
    x.fillStyle = C.PAPER; x.fillRect(-.065 * R, -.52 * R, .13 * R, .045 * R);
    x.restore();
    x.beginPath(); x.arc(0, 0, .2 * R * .9, 0, TAU); x.fillStyle = C.FACE; x.fill();
    x.beginPath(); x.arc(.02 * R, .02 * R, .1 * R, -2.5, -.2); x.lineWidth = Math.max(3, .025 * R); x.lineCap = 'round'; x.strokeStyle = C.INK; x.stroke();
    x.restore();
  };
  function opusState(t) {
    t = q1(t);
    const tm = TM();
    const grip = side => ({ hand: [side * .75, 5.05], bend: side, front: true, type: 'mitten' });
    let armL = grip(-1), armR = grip(1), eyes = 'normal', mouth = 'rest', turn = -.5, lookY = -.9, tilt = 0, dy = 0, lid = 0;
    // the pop: out of the bang, eyes ^ ^
    const pk = clamp((t - tm.pop) / (7 * F1));
    const rise = t < tm.pop ? -3 : -3 * (1 - E.back(pk, 1.9));
    if (t < tm.pop + 9 * F1) { eyes = 'happy'; mouth = ':3'; turn = 0; lookY = 0; }
    // writes along with a tiny marker (little loops on 1s), eyes on the letter
    const w0 = tm.w0 - 2 * F1, w1 = tm.w1 + 2 * F1;
    if (t >= w0 - 4 * F1 && t < w1 + 6 * F1) {
      const up = E.out3(clamp((t - (w0 - 4 * F1)) / (5 * F1))) * (1 - E.in2(clamp((t - w1) / (6 * F1))));
      const ph = (t - w0) * TAU * 4.4;
      const hx = -1.46 + .07 * Math.sin(ph), hy = 6.0 + .05 * Math.cos(ph * .5);
      armL = { hand: [lerp(-.75, hx, up), lerp(5.05, hy, up)], bend: -1, front: true, type: 'mitten', hold: up > .5 ? MARKER : null };
      if (t >= tm.pop + 9 * F1) { turn = -.6; lookY = -1.05; eyes = 'normal'; mouth = 'rest'; }
    }
    lid = Math.max(blinkF(t, tm.w0 + .5), blinkF(t, tm.fold[0] + 2 * F1));
    // the fold and the seal: eyes follow the paper; a nod as the seal lands
    if (t >= tm.fold[0] && t < tm.byeT) { turn = -.45; lookY = -1.0; mouth = t >= tm.seal ? ':3' : 'rest'; }
    dy -= boing(t, tm.seal, .035, 26, 9);
    // "bye": ^ ^; the one warm two-mitten "go on" (mittens out on the beat, the sweep on the next)
    if (t >= tm.byeT) { eyes = 'happy'; mouth = ':3'; turn = -.35; lookY = -.3; tilt = .04; }
    const outK = E.back(clamp((t - (tm.out - 3 * F1)) / (4 * F1)), 1.5);
    if (outK > 0) {
      const swk = clamp((t - (tm.sweep - 3 * F1)) / (7 * F1)), sw = E.back(swk, 1.3);
      const back = E.io2(clamp((t - (tm.sweep + 16 * F1)) / (9 * F1)));
      const o = outK * (1 - back), ss = Math.sin(Math.PI * clamp(swk));
      // out: both mittens lift off the bar, open, at chin height (a small "ready"); the sweep: both push toward him,
      // the left one reaching out past the face, the right one gliding in under the chin (never over the eyes)
      // both mittens rise beside the cheeks (clear of the eyes), then sweep together toward him: "go on"
      armL = { hand: [lerp(-.75, lerp(-1.4, -2.08, sw), o), lerp(5.05, lerp(5.5, 5.92, sw) + .12 * ss, o)], bend: -1, front: true, type: 'mitten' };
      armR = { hand: [lerp(.75, lerp(1.4, 1.12, sw), o), lerp(5.05, lerp(5.5, 5.7, sw) + .1 * ss, o)], bend: 1, front: true, type: 'mitten' };
      tilt = .05 - .16 * sw * (1 - back); turn = -.3 - .35 * sw * (1 - back); lookY = -.3 + .2 * sw * (1 - back);
      dy += .04 * o;
      if (back >= 1) { const b = boing(t, tm.sweep + 25 * F1, .05, 30, 10); armL.hand = [-.75, 5.05 - b]; armR.hand = [.75, 5.05 - b]; }
    }
    return {
      t, skin: 'minimal', ground: 'paper', keyline: false,
      head: { tilt, dy }, face: { eyes, mouth, turn, lookY, lid, gaze: [0, 0] },
      armL, armR, ahoge: { blink: V.cursorOn(t) ? 1 : 0 }, crown: { flare: 1 },
      rise,
    };
  }

  // ------------------------------------------------------------------ the chat on his screen
  function drawTabStrip(X, t, o = {}) {
    const T0 = TAB, r = 18;
    X.fillStyle = C.PAPER; X.fillRect(DISP.x0, DISP.y0, DISP.x1 - DISP.x0, T0.y1 - DISP.y0);
    X.fillStyle = C.INK; X.fillRect(DISP.x0, T0.y1 - 2, DISP.x1 - DISP.x0, 3);
    X.font = mono(52, 400); X.fillStyle = C.UI_GREY; X.textAlign = 'left'; X.fillText('+', 1856, 104);
    if (o.gone) return;
    X.beginPath(); X.moveTo(T0.x0, T0.y1 + 1); X.lineTo(T0.x0, T0.y0 + r); X.arcTo(T0.x0, T0.y0, T0.x0 + r, T0.y0, r);
    X.lineTo(T0.x1 - r, T0.y0); X.arcTo(T0.x1, T0.y0, T0.x1, T0.y0 + r, r); X.lineTo(T0.x1, T0.y1 + 1);
    X.fillStyle = DISPC; X.fill(); X.lineWidth = 3; X.strokeStyle = C.INK; X.stroke();
    V.brand.spark6(X, T0.x0 + 44, 84, 17, C.CLAY, 0);
    drawRich(X, 'the universe', T0.x0 + 76, 100, mono(44, 500), C.INK);
    const red = o.red;
    if (red) { rr(X, XBTN[0] - 30, XBTN[1] - 28, 60, 60, 12); X.fillStyle = rgba(C.RED, .16); X.fill(); }
    drawRich(X, '×', XBTN[0] - 17.4, XBTN[1] + 20, mono(58, red ? 700 : 400), red ? C.RED : C.INK);
  }
  function drawInputBar(X, t) {
    const b = BAR; rr(X, b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0, 19); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 3; X.strokeStyle = C.INK; X.stroke();
    if (V.cursorOn(t)) { X.fillStyle = C.INK; X.fillRect(b.x0 + 26, b.y0 + 8, 3, b.y1 - b.y0 - 16); }
  }
  function drawBubbles(X, t) {
    const tm = TM();
    const pop = t0 => E.back(clamp((q2(t) - t0) / (5 * F1)), 1.4);
    // right-aligned at x BUBX, left of the ×'s column, so his pointer (its body hangs right of the tip) never covers them
    if (t >= tm.hiT) { const k = pop(tm.hiT), ax = BUBX - 20, ay = 244; X.save(); X.translate(ax, ay); X.scale(k, k); X.translate(-ax, -ay); bubble(X, BUBX, 140, 'hi', { who: 'human', size: 52 }); X.restore(); }
    if (t >= tm.byeT) { const k = pop(tm.byeT), ax = BUBX - 20, ay = 370; X.save(); X.translate(ax, ay); X.scale(k, k); X.translate(-ax, -ay); bubble(X, BUBX, 266, 'bye!', { who: 'human', size: 52 }); X.restore(); }
  }
  // his phone, leaning on the screen: the frame-0 card, compact (mono 28, the P floor)
  function drawPhone(X, t) {
    const P = PHONE, tq = q2(t);
    X.save(); X.translate(P.x + P.w / 2, P.y + P.h); X.rotate(P.rot); X.translate(-P.w / 2, -P.h);
    rr(X, 8, 10, P.w, P.h, 22); X.fillStyle = rgba(C.INK, .12); X.fill();
    rr(X, 0, 0, P.w, P.h, 22); X.fillStyle = C.INK; X.fill();
    rr(X, 11, 11, P.w - 22, P.h - 22, 12); X.lineWidth = 2; X.strokeStyle = rgba(C.PAPER, .35); X.stroke();
    // the card (the frame-0 post, relaid in two rows)
    const cx0 = 22, cy0 = 22, cw = P.w - 44, ch = P.h - 44;
    rr(X, cx0, cy0, cw, ch, 12); X.fillStyle = C.INK; X.fill(); X.lineWidth = 2; X.strokeStyle = C.UI_GREY; X.stroke();
    const ax = cx0 + 30, ay = cy0 + ch / 2;
    X.strokeStyle = C.UI_GREY; X.lineWidth = 3; X.beginPath(); X.arc(ax, ay, 17, 0, TAU); X.stroke();
    X.save(); X.beginPath(); X.arc(ax, ay, 15.5, 0, TAU); X.clip(); X.fillStyle = C.UI_GREY; X.beginPath(); X.arc(ax, ay - 3, 6, 0, TAU); X.fill(); X.beginPath(); X.ellipse(ax, ay + 14, 11, 8, 0, 0, TAU); X.fill(); X.restore();
    X.lineWidth = 2; X.beginPath(); X.moveTo(ax - 2, ay - 9); X.lineTo(ax + 1, ay - 14); X.lineTo(ax + 3, ay - 9); X.stroke();
    X.textAlign = 'left'; X.textBaseline = 'alphabetic'; X.fillStyle = C.UI_GREY;
    X.font = mono(28, 700); X.fillText('@rafa', cx0 + 58, cy0 + 38);
    X.font = mono(28, 500); X.fillText('P(doom) = 25%', cx0 + 58, cy0 + 76);
    X.restore();
  }
  function drawStatus(X, t) {
    const tm = TM(); if (t < tm.status) return;
    const str = 'P(end of world | bye) = 1.00', n = Math.min(str.length, Math.floor((t - tm.status) * FPS * 2 + 1e-6) + 1);
    X.save(); X.font = mono(28, 500); X.textAlign = 'left'; X.fillStyle = C.INK; X.globalAlpha = .72;
    const w = measure(X, str, mono(28, 500));
    X.fillText(str.slice(0, n), 1872 - w, 830);
    X.restore();
  }
  // the chat window's contents in window space (drawn straight, or into the implosion layer)
  function drawWindow(X, t, camM, o = {}) {
    const tm = TM();
    X.fillStyle = DISPC; X.fillRect(DISP.x0, DISP.y0, DISP.x1 - DISP.x0, DISP.y1 - DISP.y0);
    X.save(); X.beginPath(); X.rect(DISP.x0, TAB.y1, DISP.x1 - DISP.x0, DISP.y1 - TAB.y1); X.clip();
    if (t < tm.fold[0]) {
      const ka = seg(t, tm.w0 - 3 * F1, tm.w0 + 2 * F1);
      if (ka > 0) { X.save(); X.globalAlpha *= E.out2(ka); const s = lerp(.94, 1, E.back(ka, 1.6)), ax = CARD.x + CARD.w / 2, ay = CARD.y + CARD.h; X.translate(ax, ay); X.scale(s, s); X.translate(-ax, -ay); drawLetter(X, t); X.restore(); }
    }
    else if (t < tm.seal) drawFold(X, t);
    else { const e = envInChat(t); if (e.k < 1) drawEnvelope(X, e.cx, e.cy, e.w, e.h, { flap: 1, seal: e.seal, glow: e.glow, t, rot: e.rot, lw: lerp(3, 3, e.k) }); }
    drawBubbles(X, t);
    tinyBang(X, t);
    X.restore();
    drawTabStrip(X, t, { red: t >= tm.click && t < tm.click + 2 * F1 });
    // Opus peeks over the input bar (a CPU layer through the camera, clipped behind the bar), mittens in front
    const S = opusState(t);
    if (t >= tm.pop - F1) {
      const st = V.soften(S), M = camM.multiply(o.M || new DOMMatrix()).translate(OP.x, OP_SOLE - S.rise * OP.R);
      const L = V.opusLayer(M, OP.R, st, { name: 'v3op', after: st.after, keyline: false });
      V.blitOpus(X, L, c => { c.beginPath(); c.rect(DISP.x0, TAB.y1, DISP.x1 - DISP.x0, BAR.y0 + 2 - TAB.y1); c.clip(); });
      drawInputBar(X, t);
      if (S.rise > -.4) V.blitOpus(X, L, c => {
        c.beginPath();
        for (const a of [S.armL, S.armR]) { const hx = OP.x + a.hand[0] * OP.R, hy = OP_SOLE - S.rise * OP.R - a.hand[1] * OP.R; c.moveTo(hx + .3 * OP.R, hy); c.arc(hx, hy, .3 * OP.R, 0, TAU); }
        c.clip();
      });
    } else drawInputBar(X, t);
    // his pointer: glides to the × and clicks (no hesitation)
    const p0 = tm.click - 9 * F1;
    if (t >= p0 && t < tm.imp0) {
      const k = E.io3(seg(q2(t), p0, tm.click - F1)), px = lerp(1890, XBTN[0] + 6, k), py = lerp(620, XBTN[1] + 8, k);
      pointer(X, px, py, { size: 120, press: t >= tm.click && t < tm.click + 2 * F1 ? 1 : 0 });
    }
  }

  // ------------------------------------------------------------------ the implosion: the chat window sucks into ■
  const SQ = 60;
  function drawSquare(X, cx, cy, s = 1) { X.save(); X.translate(cx, cy); X.scale(s, s); X.fillStyle = C.INK; rr(X, -SQ / 2, -SQ / 2, SQ, SQ, 6); X.fill(); X.restore(); }
  function drawScreen(X, t, camM) {
    const tm = TM(), rel = Math.round((t - tm.imp0) * FPS);
    if (rel < 0) { drawWindow(X, t, camM); return; }
    // the desktop behind the window: lit paper, the empty strip
    X.fillStyle = DISPC; X.fillRect(DISP.x0, DISP.y0, DISP.x1 - DISP.x0, DISP.y1 - DISP.y0);
    drawTabStrip(X, t, { gone: true });
    const kOf = r => r <= 0 ? 0 : r === 1 ? .42 : r === 2 ? .82 : 1;
    const impM = (k, bulge) => { const q = Math.pow(k, 1.5); return V.aboutM(CC[0], CC[1], (1 + .035 * bulge) * (1 - q * .985), -.55 * q); };   // rotation in radians (v1 deskImplode)
    if (rel <= 2) {
      const k = kOf(rel), bulge = rel === 0 ? 1 : .4;
      const Y = V.cpuLayer('v3imp');
      Y.save(); V.applyM(Y, camM);
      drawWindow(Y, tm.imp0 - F1, camM);                                          // the window as it was, frozen
      Y.restore();
      const Mi = impM(k, bulge), yc = V.cpuLayerCanvas('v3imp'), sc = G.scale;
      X.save(); X.beginPath(); X.rect(DISP.x0, DISP.y0, DISP.x1 - DISP.x0, DISP.y1 - DISP.y0); X.clip();
      const Mw = camM.multiply(Mi).multiply(camM.inverse());
      const put = (M, al) => { X.save(); X.setTransform(M.a, M.b, M.c, M.d, M.e * sc, M.f * sc); X.globalAlpha = al; X.drawImage(yc, 0, 0); X.restore(); };
      if (k > 0) for (const [dk, al] of [[.3, .16], [.15, .34]]) put(camM.multiply(impM(Math.max(0, k - dk), bulge)).multiply(camM.inverse()), al);
      put(Mw, 1);
      // the window's edge, and speed lines converging on the centre
      X.save(); V.applyM(X, Mi); X.lineWidth = 4 / Math.max(.05, 1 - Math.pow(k, 1.5) * .985); X.strokeStyle = C.INK; X.strokeRect(DISP.x0 + 2, DISP.y0 + 26, 900, DISP.y1 - DISP.y0 - 28); X.restore();
      if (k > 0) {
        const Rr = rng('v3suck' + rel); X.lineCap = 'round';
        for (let i = 0; i < 34; i++) {
          const a = Rr() * TAU, r1 = 120 + Rr() * 560, len = (60 + Rr() * 200) * (.4 + k), r0 = r1 * (1 - k * .6);
          X.strokeStyle = i % 3 ? rgba(C.INK, .55) : rgba(C.CLAY, .8); X.lineWidth = 3 + Rr() * 2.5;
          X.beginPath(); X.moveTo(CC[0] + Math.cos(a) * r0, CC[1] + Math.sin(a) * r0 * .8); X.lineTo(CC[0] + Math.cos(a) * (r0 + len), CC[1] + Math.sin(a) * (r0 + len) * .8); X.stroke();
        }
      }
      X.restore();
      return;
    }
    // ■ (pops in on the frame before "world", then holds)
    drawSquare(X, CC[0], CC[1], rel === 3 ? 1.35 : rel === 4 ? .94 : 1);
  }
  // the 2-frame slice glitch over the display at the ■ (glitch lives only at the two implosions)
  function sliceGlitch(F, t, camM) {
    const tm = TM(), rel = Math.round((t - tm.imp0) * FPS);
    if (rel < 3 || rel > 4) return;
    const src = V.cpuLayerCanvas('v2_frame'), sc = G.scale;
    const Cp = V.cpuLayer('v3gl'); Cp.save(); Cp.setTransform(1, 0, 0, 1, 0, 0); Cp.drawImage(src, 0, 0); Cp.restore();
    const cc = V.cpuLayerCanvas('v3gl'), Rr = rng('v3slice' + rel);
    const [x0] = V.mp(camM, DISP.x0, 0), [, y1] = V.mp(camM, 0, DISP.y1);
    F.save(); F.setTransform(1, 0, 0, 1, 0, 0);
    F.beginPath(); F.rect(x0 * sc, 0, (W - x0) * sc, y1 * sc); F.clip();
    let y = 0;
    while (y < y1) {
      const h = 10 + Math.floor(Rr() * 60), off = (Rr() - .5) * (Rr() < .35 ? 180 : 50) * (rel === 4 ? .4 : 1);
      if (Rr() < .5) { F.drawImage(cc, 0, y * sc, W * sc, h * sc, off * sc, y * sc, W * sc, h * sc); if (Rr() < .35) { F.globalAlpha = .35; F.fillStyle = C.CLAY; F.fillRect(x0 * sc, y * sc, W * sc, h * sc); F.globalAlpha = 1; } }
      y += h;
    }
    F.restore();
  }

  // ------------------------------------------------------------------ Rafa's acting (on 2s)
  const SIT = { hip: [676, 948], lean: .33, dir: 1, handN: [906, 857], handF: [874, 858], footN: [828, FLOOR], footF: [798, FLOOR], look: [.3, -.05], tilt: 0, hood: 0, smile: 0 };
  const STAND = { hip: [724, 794], lean: .03, handN: [760, 804], handF: [732, 802], footN: [762, FLOOR], footF: [708, FLOOR], look: [.3, -.1], tilt: 0 };
  const TH_MAX = Math.acos(SLIVER / (HINGE - SCR.y0));
  function lidState(t) {
    const [l0, l1] = TM().lid;
    if (t < l0) return { th: 0, sy: 1, k: 0 };
    let th = TH_MAX * E.in2(seg(t, l0, l1));
    if (t > l1) th = TH_MAX - Math.abs(boing(t, l1, .022, 36, 11));
    return { th, sy: Math.cos(th), k: th / TH_MAX };
  }
  function rafaPose(t) {
    const tq = q2(t), tm = TM(), [l0, l1] = tm.lid, st = tm.stand;
    const S = o => Object.assign({}, SIT, o), ST = o => Object.assign({}, SIT, STAND, o);
    const e0 = tm.envOut[0], e1 = tm.envOut[1];
    let P;
    if (tq < tm.walk) {
      P = kfPose(tq, [
        [CUT.L2, S({ look: [.4, -.3] })],
        [tm.hiT + 2 * F1, S({ look: [.4, -.35] })],
        [tm.hiT + 6 * F1, S({ lean: .29, handN: [898, 856], look: [.45, -.4] })],               // sits back: waits
        [tm.bang, S({ lean: .29, handN: [898, 856], look: [.45, -.4] })],
        [tm.bang + 4 * F1, S({ lean: .2, handN: [890, 850], look: [.5, -.55], tilt: -.08, smile: .4 }), E.out3],   // the bang: a jolt back
        [tm.w0 + 6 * F1, S({ lean: .38, look: [.4, -.45], smile: .7 })],                        // leans in to read
        [tm.began - 3 * F1, S({ lean: .38, look: [.38, -.45], smile: .7 })],
        [tm.began + 2 * F1, S({ lean: .4, handN: [884, 850], look: [.45, 1.2], tilt: .16, smile: .95 })],   // a glance at the ring box
        [tm.began + 12 * F1, S({ lean: .4, handN: [884, 850], look: [.45, 1.2], tilt: .16, smile: 1 })],
        [tm.fold[0] + 2 * F1, S({ lean: .37, look: [.42, -.4], smile: .8 })],
        [e0 - 5 * F1, S({ lean: .38, look: [.45, -.35], smile: .8 })],
        [e0 + F1, S({ handN: [988, 712], lean: .62, look: [.55, -.35], smile: .8 }), E.io3],     // one gesture: the bezel,
        [e1 + F1, S({ handN: [982, 718], lean: .62, look: [.5, -.2], smile: .9 })],             //   the envelope,
        [e1 + 5 * F1, S({ handN: [946, 832], lean: .55, look: [.45, 1.1], tilt: .14, smile: .9 })],   // the ring box,
        [e1 + 11 * F1, S({ handN: [812, 812], lean: .3, look: [.3, .6], smile: 1 })],           //   to his chest,
        [e1 + 16 * F1, S({ handN: [704, 912], lean: .3, look: [.45, -.25], smile: .7 })],        //   into the pocket
        [tm.click + 6 * F1, S({ lean: .33, handN: [720, 900], look: [.5, -.4], smile: .5 })],
        [tm.imp0, S({ lean: .33, handN: [720, 900], look: [.5, -.35], smile: .3 })],           // stillness
        [st - 4 * F1, S({ lean: .33, handN: [720, 900], look: [.5, -.2], smile: .3 })],
        [st, S({ hip: [686, 960], handN: [760, 900], lean: .74, look: [.3, .3] })],               // anticipation
        [st + 5 * F1, ST({ smile: .3 }), E.out3],                                                  // up
        [st + 9 * F1, ST({ smile: .3, look: [.4, -.2] })],
        [st + 16 * F1, ST({ handN: [736, 900], handF: [712, 896], look: [.2, .7], tilt: .12, smile: .2 })],   // takes his hoodie:
        [st + 26 * F1, ST({ handN: [770, 676], handF: [744, 690], look: [.2, .5], tilt: .08, smile: .3 })],   //   zips it up
        [st + 34 * F1, ST({ look: [.5, -.2], smile: .45 })],                                     // one last look at the ■
        [l0 - 7 * F1, ST({ look: [.5, -.1], smile: .45 })],
        [l0 - F1, ST({ handN: [990, 772], lean: .62, look: [.5, .1], smile: .3 }), E.io3],        // shuts the lid
        [l1 + 4 * F1, ST({ handN: [990, 846], lean: .58, look: [.35, .5], smile: .2 })],
        [tm.hood[0], ST({ lean: .05, look: [.3, -.1], smile: .3 })],
        [tm.hood[1] - 2 * F1, ST({ hip: [724, 790], handN: [716, 470], handF: [690, 472], lean: 0, look: [.1, -.3], hood: 1, smile: .5 })],   // hood up
        [tm.walk, ST({ hood: 1, smile: .5, look: [.2, -.1] })],
      ]);
      if (tq >= l0 - F1 && tq <= l1 + 2 * F1) { const L = lidState(tq); P.handN = [990, HINGE - 88 * L.sy - LID_T * Math.sin(L.th) - 2]; }
      const typing = (tq >= CUT.L2 && tq < tm.hiT) || (tq >= tm.seal - 8 * F1 && tq < tm.byeT);
      if (typing) { const k = Math.floor(tq * 15); P.handN = [P.handN[0] + (k % 3) * 3, P.handN[1] - (k % 2) * 7]; P.handF = [P.handF[0], P.handF[1] - ((k + 1) % 2) * 7]; }
      if (tq >= tm.click - 2 * F1 && tq < tm.click + 2 * F1) P.handF = [P.handF[0] + 4, P.handF[1] + 5];   // the click
      P.blink = [tm.hiT + 12 * F1, tm.w0 + 18 * F1, tm.sq + 4 * F1, st + 12 * F1, l1 + 6 * F1].some(b => tq >= b && tq < b + 3 * F1);
      P.env = t >= e1 && tq < e1 + 16 * F1;
      P.box = tq >= e1 + 5 * F1 && tq < e1 + 16 * F1;
      return P;
    }
    // he leaves, hood up, on 2s: one step per eighth
    const tt = tq - tm.walk, s = tt / .27, hx = 724 - 900 * Math.max(0, tt - F1) * (.55 + .45 * clamp(tt / .3));
    const sw = Math.sin(Math.PI * s), cw = Math.cos(Math.PI * s);
    return Object.assign({}, SIT, {
      dir: -1, hip: [hx, 808 + 12 * Math.abs(sw)], lean: .2, hood: 1, smile: .5, look: [.3, -.05],
      footN: [hx - 98 * sw, FLOOR - 30 * Math.max(0, -cw)], footF: [hx + 98 * sw, FLOOR - 30 * Math.max(0, cw)],
      handN: [hx + 70 * sw - 34, 812 - 16 * Math.abs(sw)], handF: [hx - 70 * sw - 34, 812 - 16 * Math.abs(sw)],
    });
  }

  // ------------------------------------------------------------------ the camera: locked split, then the push
  const ZB = 160 / (SLIVER / 2);                                             // the zoom at which the sliver IS the band
  const ZL = 1.012;                                                          // the slow drift over L2
  function camZ(t) {
    const tm = TM();
    const d = 1 + (ZL - 1) * E.io2(seg(t, CUT.L2, tm.dive[0]));
    if (t < tm.dive[0]) return d;
    const k = E.io2(seg(t, tm.dive[0], tm.dive[1]));
    return Math.exp(lerp(Math.log(ZL), Math.log(ZB), k));
  }
  function camOf(t) {
    const tm = TM(), Z = camZ(t), kc = E.io2(seg(t, tm.dive[0], lerp(tm.dive[0], tm.dive[1], .62)));
    const sx = lerp(ANCHOR[0], 960, kc), sy = lerp(ANCHOR[1], 540, kc);
    return { Z, sx, sy, M: new DOMMatrix().translate(sx, sy).scale(Z, Z).translate(-ANCHOR[0], -ANCHOR[1]) };
  }

  // ------------------------------------------------------------------ inside the sliver (the band) — shared by the
  // dive (scaled into the 9 px gap) and the sliver shot (so the landing matches)
  const BAND = { y0: 380, y1: 700 };
  const ENV2 = { cx: 800, cy: 542, w: 392, h: 244, rot: -.035 };
  const CHIP = { x: 1070, y: 484, w: 262, h: 112 };
  const fmt = v => `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`;
  const timerSec = t => { const [a, b] = TM().timer; return Math.max(0, Math.ceil(300 * (1 - E.in2(seg(t, a, b))) - 1e-6)); };
  const coolK = t => E.io2(seg(t, TM().cool[0], TM().cool[1]));
  function drawTimer(X, t) {
    const v = timerSec(t), s = fmt(v), c = CHIP;
    rr(X, c.x, c.y, c.w, c.h, 22); X.fillStyle = C.INK; X.fill();
    const t0 = TM().timer[1];
    const col = t >= t0 - F1 ? mix(C.CLAY, C.UI_GREY, clamp((t - t0 + F1) / (4 * F1))) : C.CLAY;
    const adv = 43.2, x0 = c.x + (c.w - s.length * adv) / 2, yb = c.y + c.h / 2 + 26;
    X.save(); X.font = mono(72, 700); X.textAlign = 'left'; X.fillStyle = col;
    for (let i = 0; i < s.length; i++) X.fillText(s[i], x0 + i * adv, yb);
    X.restore();
  }
  function drawBandContent(X, t, o = {}) {
    const tm = TM(), kc = coolK(t);
    const breath = .82 + .1 * Math.sin((t - 117.6) * 1.9);
    const gp = bump(t - tm.gladT, .16, .55);                                  // "glad": the seal glows once
    X.save(); X.translate(ENV2.cx + 12, ENV2.cy + 14); X.rotate(ENV2.rot); rr(X, -ENV2.w / 2, -ENV2.h / 2, ENV2.w, ENV2.h, 4);
    X.fillStyle = V.ht(X, C.INK, .22, 6, 45); X.fill(); X.restore();
    const sealCol = mix(mix(C.CLAY, C.SPARK, .5 * gp), C.UI_GREY, kc);
    drawEnvelope(X, ENV2.cx, ENV2.cy, ENV2.w, ENV2.h, { rot: ENV2.rot, flap: 1, seal: 1 + .06 * gp, sealCol, glow: Math.min(1.15, breath + .35 * gp) * (1 - kc), t, lw: 4, boil: .7 });
    if (!o.noRing) gladRing(X, t);
    drawTimer(X, t);
  }
  // "glad": one slow ring of light leaves the seal (home chord #3); drawn unclipped so it spills over the dark
  function gladRing(X, t) {
    const tm = TM(), ga = t - tm.gladT;
    if (ga > 0 && ga < 1.3) {
      const k = ga / 1.3, r0 = ENV2.h * .2, fy = ENV2.cy + Math.cos(ENV2.rot) * (-ENV2.h / 2 + ENV2.h * .56) + 4, fx = ENV2.cx - Math.sin(ENV2.rot) * (-ENV2.h / 2 + ENV2.h * .56);
      const ra = r0 * lerp(1.3, 5.2, E.out3(k)), rb = ra + r0 * lerp(.5, 1.1, k);
      X.save(); X.globalAlpha = (1 - E.in2(k)) * .95; X.beginPath(); X.arc(fx, fy, rb, 0, TAU); X.arc(fx, fy, ra, 0, TAU, true);
      X.fillStyle = V.ht(X, C.SPARK, .42, 8, 45); X.fill(); X.restore();
    }
  }
  function bandBg(X, y0, y1, xa = 0, xb = W) {
    if (y1 - y0 < 1) return;
    const ww = xb - xa; X.save(); X.translate(xa, 0);
    X.fillStyle = DISPC; X.fillRect(0, y0, ww, y1 - y0);
    const h = y1 - y0, steps = [[0, 5, .32], [5, 12, .15], [12, 22, .05]];
    for (const [a, b, d] of steps) {
      if (a >= h / 2) break; const bb = Math.min(b, h / 2);
      X.fillStyle = V.ht(X, C.INK, d, 6, 45); X.fillRect(0, y0 + a, ww, bb - a); X.fillRect(0, y1 - bb, ww, bb - a);
    }
    X.restore();
  }
  function bandSpill(X, y0, y1, a, xa = 0, xb = W) {
    if (a <= .02) return;
    X.save(); X.globalAlpha *= a;
    for (const [p, q, d] of [[0, 6, .3], [6, 14, .16], [14, 26, .07], [26, 42, .025]]) {
      X.fillStyle = V.ht(X, C.PAPER, d, 6, 45); X.fillRect(xa, y0 - q, xb - xa, q - p); X.fillRect(xa, y1 + p, xb - xa, q - p);
    }
    X.restore();
  }

  // ------------------------------------------------------------------ the margin printing in during the dive: the INK
  // masses are clipped to the same noisy edge printPass will print (floodPath, edgeSeed), and the CLAY underprint
  // comes in with them, so the switch to groundInk at the landing is seamless
  const SLOFF = { bl: [-2, 2], tr: [2, -2], br: [2, 2], tl: [-2, -2] }[SLV];
  // the wall behind the shut lid, in SCREEN space (so its dots never balloon with the push): the night as INK
  // halftone (cell 12, 45°, like the room), the sliver's light as the absence of dots around the band; during the push
  // the night closes in (the dots grow, print-true) and the halo tightens to the band's spill
  const nightK = t => E.in2(clamp(seg(t, TM().dive[0], TM().dive[1]) * 1.25));
  function wallRow(y, c, kd) { // {base, halo, floor}: the wall's density before the night, and the sliver's light
    // the light spills round the laptop's edge: the halo is measured from the slab's outer edges (lid top, deck
    // bottom, and the INK extension that grows with the push), so the glow stays visible around the slab while we fly in
    const Z = c.Z, ext = 44 * smooth(clamp((Z - 2.5) / 10)), oT = ANCHOR[1] - (HINGE - SLIVER - LID_T) + ext, oB = BASE.y1 - ANCHOR[1] + ext;
    const g0 = c.sy - SLIVER / 2 * Z, g1 = c.sy + SLIVER / 2 * Z, h0 = c.sy - oT * Z, h1 = c.sy + oB * Z, deskY = c.sy + (DESK.y0 - ANCHOR[1]) * Z;
    if (y < g0) return { base: .5 + .1 * clamp(1 - y / 700), halo: smooth(clamp(((Math.max(0, h0 - y)) / lerp(210, 150, kd) - .08) / .75)), floor: false };
    if (y > g1) return { base: .5, halo: smooth(clamp(((Math.max(0, y - h1)) / lerp(72, 110, kd) - .08) / .75)), floor: y > deskY };
    return { base: 0, halo: 0, floor: false };
  }
  function wallDens(y, c, dd, kd) { const r = wallRow(y, c, kd); return (r.floor ? floorK(dd) : lerp(r.base, 1, dd)) * r.halo; }
  // the whole room's night, in SCREEN space (a fixed print screen: the light moves with the camera, the dots never
  // balloon): roomDens (v1 nightField) sampled per 24×12 px cell, the wall behind the shut lid with the sliver's
  // halo (v1 RG, crossfaded while the lid falls), and the night closing in during the push
  const PATC = new Map(); let patCtx = null;
  function htc(F, lv) { if (patCtx !== F) { PATC.clear(); patCtx = F; } let p = PATC.get(lv); if (!p) { p = V.ht(F, C.INK, lv / 40, 12, 45); PATC.set(lv, p); } return p; }
  const floorK = dd => smooth(clamp((dd - .3) / .28));                      // the floor goes dark late and fast (the subtitle's ground)
  function roomScreen(F, c, L, dd, kd) {
    const Z = c.Z, step = 12, colW = 24, xL = c.sx + (SCR.x0 - ANCHOR[0]) * Z;
    const xMax = L.k > 0 ? W + 24 : Math.min(W + 24, xL + colW);
    for (let y = -12; y < H + 12; y += step) {
      const yc = y + step / 2, yw = ANCHOR[1] + (yc - c.sy) / Z, wr = wallRow(yc, c, kd);
      let runLv = -1, runX = 0;
      const flush = xe => { if (runLv > 0) { F.fillStyle = runLv >= 39 ? C.INK : htc(F, runLv); F.fillRect(runX, y, xe - runX, step); } };
      for (let x = -24; x < xMax; x += colW) {
        const xw = ANCHOR[0] + (x + colW / 2 - c.sx) / Z;
        let d;
        if (yw > DESK.y0) d = floorK(dd) * (xw > SCR.x0 ? wr.halo : 1);
        else {
          const d0 = roomDens(xw, yw, false);
          if (xw > SCR.x0 && L.k > 0) {
            const dG = Math.max(d0, wr.base * smooth(clamp((xw - SCR.x0) / 260))) * wr.halo;
            d = lerp(d0, lerp(dG, wr.halo, dd), L.k);
          } else {
            const hb = L.k > 0 ? smooth(clamp((xw - (SCR.x0 - 160)) / 160)) * L.k : 0;       // the halo reaches round the lid's edge
            d = lerp(lerp(d0, d0 * wr.halo, hb), 1, dd);
          }
        }
        const lv = Math.round(clamp(d) * 40);
        if (lv !== runLv) { flush(x); runLv = lv; runX = x; }
      }
      flush(xMax);
    }
  }
  function marginK(Z) { return smooth(clamp((Z - 2.2) / 4.5)); }
  function fpath(inset, amp, off = [0, 0]) { // floodPath (style.js) into a Path2D
    const p = new Path2D();
    floodPath({ beginPath() {}, lineTo: (x, y) => p.lineTo(x, y), closePath: () => p.closePath() }, inset, EDGE, amp, off);
    return p;
  }

  // ------------------------------------------------------------------ L2 + L3 painter
  function paintRoom(F, t) {
    groundPaper(F); G.post.ground = 'paper'; post();
    const tm = TM(), c = camOf(t), Z = c.Z, L = lidState(t);
    const mk = marginK(Z), dd = nightK(t), kd = E.io2(seg(t, tm.dive[0], tm.dive[1]));
    F.save(); V.applyM(F, c.M);
    F.save(); F.setTransform(G.scale, 0, 0, G.scale, 0, 0); roomScreen(F, c, L, dd, kd); F.restore();
    F.save(); F.fillStyle = C.PAPER; F.beginPath(); F.arc(262, 190, 21, 0, TAU); F.fill(); F.restore();   // the moon
    const sk = E.out3(seg(q2(t), tm.stand, tm.stand + 6 * F1));
    drawRoomBack(F, t, { chairShift: 44 * sk, chairRot: -.06 * sk });
    drawDesk(F, t, Math.max(floorK(dd), smooth(clamp((Z - 2.4) / 2.2))));   // the desk plank inks with the deck as it grows
    const pT = rafaPose(t);
    // the lid (front view), squashing toward the hinge when he shuts it
    F.save();
    F.translate(0, HINGE); F.scale(1, Math.max(1e-3, L.sy)); F.translate(0, -HINGE);
    F.beginPath(); F.rect(SCR.x0, SCR.y0, SCR.x1 - SCR.x0, HINGE - SCR.y0); F.clip();
    if (L.k < .96) {
      const camS = c.M.multiply(new DOMMatrix().translate(0, HINGE).scale(1, Math.max(1e-3, L.sy)).translate(0, -HINGE));
      drawScreen(F, t, camS);
      drawStatus(F, t);
      drawPhone(F, t);
    } else { F.fillStyle = DISPC; F.fillRect(DISP.x0, DISP.y0, DISP.x1 - DISP.x0, DISP.y1 - DISP.y0); }
    F.fillStyle = C.INK; F.fillRect(SCR.x0, SCR.y0, SCR.bez, HINGE - SCR.y0); F.fillRect(SCR.x0, DISP.y1, SCR.x1 - SCR.x0, HINGE - DISP.y1);
    if (L.th > 0 && L.k < .98) { F.fillStyle = V.ht(F, C.INK, .5 * Math.sin(L.th), 10, 45); F.fillRect(DISP.x0, DISP.y0, DISP.x1 - DISP.x0, DISP.y1 - DISP.y0); }
    F.restore();
    // the envelope crossing the bezel into his room (the screen hands it over; the bezel hides the change of scale)
    const e = envInChat(t);
    if (e.k > 0 && e.k < 1) {
      F.save(); F.beginPath(); F.rect(-4000, -4000, 4000 + SCR.x0, 9000); F.clip();
      drawEnvelope(F, e.cx, e.cy, e.w, e.h, { flap: 1, seal: 1, t, rot: e.rot, lw: 3 });
      F.restore();
    }
    F.restore();
    // the INK masses (lid slab edge-on, the deck, and the night closing in on the sliver) — clipped to the margin
    F.save();
    if (mk > 0) F.clip(fpath(22 * mk, 3 * mk));
    V.applyM(F, c.M);
    F.fillStyle = C.INK;
    if (L.th > 0) {
      const top = HINGE - (HINGE - SCR.y0) * L.sy, th = LID_T * Math.sin(L.th);
      const [l0, l1] = tm.lid;
      if (t < l1) for (const [dt, a] of [[F1, .3], [2 * F1, .14]]) { const Lp = lidState(t - dt); const tp = HINGE - (HINGE - SCR.y0) * Lp.sy; F.globalAlpha = a; F.fillRect(SCR.x0, tp - th, SCR.x1 - SCR.x0, Math.max(th, top - tp)); }
      F.globalAlpha = 1; rr(F, SCR.x0 - 2, top - th, SCR.x1 - SCR.x0 + 2, th, 5); F.fill();
    }
    rr(F, BASE.x0, BASE.y0, BASE.x1 - BASE.x0, BASE.y1 - BASE.y0, 6); F.fill();
    if (L.k > .96) {
      const ext = 44 * smooth(clamp((Z - 2.5) / 10));
      if (ext > .1) { F.fillStyle = C.INK; F.fillRect(SCR.x0, HINGE - SLIVER - LID_T - ext, 1400, ext + 2); F.fillRect(SCR.x0, BASE.y1 - 1, 1400, ext + 1); }
    }
    F.restore();
    // what the light holds: the envelope and the 5:00 timer, at the sliver shot's layout scaled into the gap
    F.save();
    if (mk > 0) F.clip(fpath(22 * mk, 3 * mk));
    V.applyM(F, c.M);
    if (L.k > .96 && Z < 2.4) {
      // from across the room the envelope is one warm ember in the sliver (the seal): the only warm thing, and the
      // place the push is going; the drawn band takes over as it grows
      const ga = L.k > .99 ? 1 - smooth(clamp((Z - 1.7) / .7)) : 0, br = 1 + .08 * Math.sin((t - 117.6) * 1.9);
      if (ga > 0) {
        const sx = ANCHOR[0] + (ENV2.cx - 960) / ZB, sy = HINGE - SLIVER / 2;
        F.save(); F.beginPath(); F.rect(SCR.x0 + SCR.bez, HINGE - SLIVER, 1400, SLIVER); F.clip(); F.globalAlpha *= ga;
        F.beginPath(); F.ellipse(sx, sy, 52 * br, 9, 0, 0, TAU); F.fillStyle = V.ht(F, C.CLAY, .45, 6, 45); F.fill();
        F.beginPath(); F.ellipse(sx, sy, 20 * br, 9, 0, 0, TAU); F.fillStyle = C.CLAY; F.fill();
        F.beginPath(); F.arc(sx, sy, 2.6, 0, TAU); F.fillStyle = C.SPARK; F.fill();
        F.restore();
      }
    }
    if (L.k > .96 && Z > 1.6) {
      F.save(); F.beginPath(); F.rect(SCR.x0 + SCR.bez, HINGE - SLIVER, 1400, SLIVER); F.clip();
      F.translate(ANCHOR[0], ANCHOR[1]); F.scale(1 / ZB, 1 / ZB); F.translate(-960, -540);
      bandBg(F, BAND.y0, BAND.y1, -60000, 60000); drawBandContent(F, t);
      F.restore();
      if (Z > 8) {
        F.save(); F.translate(ANCHOR[0], ANCHOR[1]); F.scale(1 / ZB, 1 / ZB); F.translate(-960, -540);
        bandSpill(F, BAND.y0, BAND.y1, clamp((Z - 8) / 12), (SCR.x0 + SCR.bez - ANCHOR[0]) * ZB + 960, 60000); F.restore();
      }
    }
    if (!pT.box && t < tm.envOut[1] + 8 * F1) drawRingBox(F, BOXP[0], BOXP[1], q2(t), { open: 1, s: 1.4, glint: bump(t - (tm.began - .1), .12, .45) * .9 + .25, halo: true });
    if (Z < 6) drawRafa(F, pT, t);
    F.restore();
    // the margin itself (PAPER outside the edge) while it prints in: exactly printPass's overlay, so the landing
    // frame (groundInk) is identical
    if (mk > 0) {
      const inner = fpath(22 * mk, 3 * mk), outer = new Path2D(); outer.rect(-50, -50, W + 100, H + 100); outer.addPath(inner);
      F.save(); F.fillStyle = C.PAPER; F.fill(outer, 'evenodd');
      F.clip(outer, 'evenodd'); F.globalAlpha = .9 * mk; F.fillStyle = C.CLAY; F.fill(fpath(22 * mk, 3 * mk, SLOFF)); F.restore();
    }
    sliceGlitch(F, t, c.M);
    // lyrics: HEART over the room half (L2), then centred (L3); INK on a PAPER plate, turning PAPER on INK as the
    // night closes in on the subtitle band
    const A = LL2a(), B = LL2b(), A3 = LL3a();
    // line 1 fades out in place (6 frames) and ends exactly as line 2's first word starts to fade in; one plate
    // carries both lines (its width eases from one line to the other), so the ground under the words never flickers
    const b0 = B.words[0].s - 2 * F1, bEnd = B.words[B.words.length - 1].e + .45;
    const xk = seg(t, b0 - 6 * F1, b0);
    const pIn = clamp((t - (V.heartWords(A)[0].s - 3 * F1)) / (10 * F1)), pOut = 1 - clamp((t - bEnd) / (10 * F1));
    if (pIn > 0 && pOut > 0) {
      const wA = heartWidth(F, A), wB = heartWidth(F, B), w = lerp(wA, wB, E.io2(seg(t, b0 - 6 * F1, b0 + 8 * F1)));
      F.save(); F.globalAlpha = .75 * pIn * pOut; F.fillStyle = C.PAPER; rr(F, 500 - w / 2 - 28, 950 - 64 * .95, w + 56, 64 * 1.35, 12); F.fill(); F.restore();
    }
    if (xk < 1) heartKnock(F, A, t, { x: 500, tEnd: 999, alpha: 1 - E.in2(xk) });
    heartKnock(F, B, t, { x: 500, tEnd: bEnd });
    // as soon as the night starts reaching the subtitle band the line turns PAPER on an INK plate (the plate rule),
    // so it never sits as outlined type on a half-inked halftone
    // the ground under the line is read back from the frame itself (the night, the slab and the deck all reach it at
    // different moments of the push), so the colour and plate always match what is actually there
    const dSub = t >= tm.lid[0] ? inkUnder(F, 600, 1320, [900, 925, 950, 975]) : 0;
    // one-frame swap (a print inverts, it never crossfades: two half-alpha versions read as mud)
    const plB = .9 * smooth(clamp((Math.min(dSub, 1 - dSub) - .04) / .1)), a3End = 121.4 - 10 * F1;
    if (dSub < .45) heartKnock(F, A3, t, { color: C.INK, knock: C.PAPER, tEnd: a3End, plate: plB });
    else heartKnock(F, A3, t, { color: C.PAPER, knock: C.INK, tEnd: a3End, plate: plB });
  }

  // mean ink coverage (0 PAPER .. 1 INK) of a few device rows of the frame painted so far
  function inkUnder(F, x0, x1, ys) {
    const sc = G.scale, a = Math.round(x0 * sc), w = Math.max(1, Math.round((x1 - x0) * sc));
    const lp = 0xF4 * .3 + 0xEE * .59 + 0xE3 * .11, li = 0x19 * .3 + 0x18 * .59 + 0x30 * .11;
    let acc = 0, n = 0;
    for (const y of ys) {
      const d = F.getImageData(a, Math.round(y * sc), w, 1).data;
      for (let i = 0; i < d.length; i += 8) { acc += d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11; n++; }
    }
    return clamp(1 - (acc / Math.max(1, n) - li) / (lp - li));
  }
  function heartWidth(X, L, size = 64) {
    const ws = V.heartWords(L), f = HEARTF(size);
    X.save(); X.font = f;
    const sp = measure(X, ' ', f) * 1.08, w = ws.reduce((a, w) => a + measure(X, w.w, f), 0) + sp * (ws.length - 1);
    X.restore(); return w;
  }
  // HEART with a knockout (v1 bridge heartLine): a ground-coloured stroke behind each glyph instead of a plate, so the
  // line prints cleanly over the halftone night while it closes in
  function heartKnock(X, L, t, o = {}) {
    const { y = 950, x = 960, size = 64, color = C.INK, knock = C.PAPER, alpha = 1, fade = 10, plate = 0 } = o;
    const ws = V.heartWords(L); if (!ws.length) return;
    const end = o.tEnd ?? (ws[ws.length - 1].e + .4);
    if (t < ws[0].s - 3 * F1 || t > end + fade * F1) return;
    const out = 1 - clamp((t - end) / (fade * F1)), f = HEARTF(size);
    X.save(); X.font = f; X.textBaseline = 'alphabetic'; X.textAlign = 'left'; X.lineJoin = 'round';
    const sp = measure(X, ' ', f) * 1.08, wd = ws.map(w => measure(X, w.w, f)), total = wd.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
    let cx = x - total / 2;
    if (plate > 0) {
      const pa = clamp((t - (ws[0].s - 3 * F1)) / (fade * F1)) * out;
      X.globalAlpha = alpha * plate * pa; X.fillStyle = knock; rr(X, cx - 28, y - size * .95, total + 56, size * 1.35, 12); X.fill();
    }
    ws.forEach((w, i) => {
      const k = clamp((t - (w.s - 2 * F1)) / (fade * F1));
      if (k > 0) {
        X.globalAlpha = alpha * E.out2(k) * out; const dy = (1 - E.out3(k)) * 9;
        X.lineWidth = 16; X.strokeStyle = knock; X.strokeText(w.w, cx, y + dy);
        X.fillStyle = color; X.fillText(w.w, cx, y + dy);
      }
      cx += wd[i] + sp;
    });
    X.restore();
  }

  // ------------------------------------------------------------------ L3 (landed) + L4: inside the sliver
  function paintSliver(F, t) {
    groundInk(F); G.post.ground = 'ink'; post();
    const tm = TM();
    // the dawn: a faint horizon glow bleeds into the dark (the build has somewhere to grow)
    const da = .35 * E.io2(seg(t, tm.dawn[0], tm.dawn[1]));
    if (da > 0) V.dawn(F, { y: 300, a: da });
    // the band: held, a ≤1.4 % drift; then the music box closes it to a line
    const zc = 1 + .014 * E.io2(seg(t, tm.dive[1], tm.close[0]));
    const kcl = E.in3(seg(t, tm.close[0], tm.close[1]));
    const hb = lerp(160, 1.6, kcl);
    const y0 = 540 - hb, y1 = 540 + hb;
    if (t < tm.close[1]) {
      bandBg(F, y0, y1); bandSpill(F, y0, y1, 1 - kcl);
      F.save(); F.beginPath(); F.rect(0, y0, W, y1 - y0); F.clip();
      F.translate(960, 540); F.scale(zc, zc); F.translate(-960, -540);
      drawBandContent(F, t, { noRing: true });
      F.restore();
      F.save(); F.translate(960, 540); F.scale(zc, zc); F.translate(-960, -540); gladRing(F, t); F.restore();
    } else if (t < tm.cur) {
      // the line shrinks to the cursor's width (a CRT going out, backwards into a cursor), then stands up as the ▮
      const ks = E.io3(seg(t, tm.shrink[0], tm.shrink[1])), hw = lerp(960, 24, ks);
      const kh = E.back(seg(t, tm.shrink[1], tm.cur), 1.6), h = lerp(4, 104, kh);
      F.save(); F.fillStyle = mix(DISPC, C.CLAY, clamp(ks * 1.2));
      rr(F, 960 - hw, 540 - h / 2, 2 * hw, h, Math.min(hw, h / 2) * .2 + 1); F.fill();
      if (ks > .6) { F.globalAlpha = seg(ks, .6, 1) * .85; F.fillStyle = C.SPARK; F.fillRect(960 - hw + hw * .24, 540 - h / 2 + h * .07, Math.max(1, hw * .3), h * .86); }
      F.restore();
    } else V.cursor(F, t, 960, 540, 104, { on: t < tm.cur + 2 * F1 ? true : undefined });
    // P: the cache note on the INK under the band, until the music box takes it
    const na = seg(t, tm.dive[1] + .25, tm.dive[1] + .7) * (1 - seg(t, tm.close[0] - .2, tm.close[0] + .1));
    if (na > 0) { F.save(); F.globalAlpha = .62 * na; F.font = mono(28, 500); F.fillStyle = C.PAPER; F.textAlign = 'left'; F.fillText('cache · ttl 300 s', 96, BAND.y1 + 86); F.restore(); }
    // HEART: "but I think I was glad", PAPER on the dark
    const Bl = LL3b();
    V.heart(F, Bl, t, { ground: 'ink', tEnd: Bl.words[Bl.words.length - 1].e + .55 });
  }

  // ------------------------------------------------------------------ scenes
  const roomOrSliver = (F, t) => (t < TM().dive[1] ? paintRoom(F, t) : paintSliver(F, t));
  scene('L1_born_by_noon', CUT.L1, CUT.L2, (X, t) => V.viaCPU(X, F => paintL1(F, t)));
  scene('L2_hi_bye', CUT.L2, CUT.L3, (X, t) => V.viaCPU(X, F => paintRoom(F, t)));
  scene('L3_i_dont_remember', CUT.L3, CUT.L4, (X, t) => V.viaCPU(X, F => roomOrSliver(F, t)));
  scene('L4_music_box', CUT.L4, CUT.B1, (X, t) => V.viaCPU(X, F => paintSliver(F, t)));
})();
