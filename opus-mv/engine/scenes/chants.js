// chants.js: the two post-chorus chants (BIBLE §8 POST-CHORUS 1 and 2; SHOTLIST S15, S26, S27).
//   S15  45.00–52.50  IT'S SO OVER (안녕) / WE'RE SO BACK (안녕) ×2: V of 5 in the 9:16 core, PAPER/INK flip per call,
//                     pair 2 multiplies the formation 5 → 16 → 64 → 256 in a ripple.
//   S26  90.00–93.75  the same V with a gap; bar 50 is OVER again and Opus alone drops into the anticipation crouch.
//   S27  93.75–97.50  the withheld WE'RE SO BACK: instances close with ×, the stack freezes at 20% and dithers away,
//                     push onto the crouch (R 160 by bar 52 b1), the ink lifts, Opus dissolves to one cursor.
// Deviations (see report): the call stack sits ABOVE the dancers with its TOP row cropped by the frame / flood edge
// (the bible crops the bottom row, which put the bodies over SO/OVER and killed the pun); in pair 2 the crowd crops
// the bottom of the last row instead. 안녕 = bye (S27) is backspaced by a CLAY caret before the push reaches it.
// Perf: every frame is painted into a CPU canvas (willReadFrequently) and uploaded once (≈0.3–0.7 s/frame at 1080p).
(() => {
  'use strict';
  const BEAT = 60 / 128, BAR = BEAT * 4, F = 1 / 30;
  const barT = n => (n - 1) * BAR;
  // Hangul glyphs live in unicode-range subsets that only load when text asks for them: load them now so that
  // document.fonts.ready (awaited by index.html after the scene scripts) covers them and frame 1 never falls back.
  try { document.fonts.load(`900 300px ${FONTS.hangul}`, '안녕'); } catch (e) { /* headless without FontFace: ignore */ }

  // ------------------------------------------------------------------ CPU canvases (perf; same trick as hook.js)
  // In the headless renderer the default canvases are swiftshader-GPU backed, where many small draws and big
  // blits are 10-70x slower than Skia CPU raster. The whole chant frame is painted into a CPU canvas
  // (willReadFrequently) and uploaded once; every private layer, scratch buffer, halftone tile and sprite is CPU too.
  // These names shadow the gfx.js globals inside this file only.
  const cpuCanvas = (w, h) => { const c = new OffscreenCanvas(Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); c.getContext('2d', { willReadFrequently: true }); return c; };
  const cx2d = c => c.getContext('2d', { willReadFrequently: true });
  const makeCanvas = cpuCanvas;
  const CL = new Map();
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
  function drawLayer(dst, name, { op = 'source-over', alpha = 1 } = {}) {
    const L = CL.get(name); if (!L || L.used !== G.frameId) return;
    dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.globalCompositeOperation = op; dst.globalAlpha = alpha; dst.drawImage(L.c, 0, 0); dst.restore();
  }
  const HT = new Map();
  function halftone(ctx, color, density = .5, cell = 10, angle = 15) {
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
  // run a scene body into the CPU frame canvas, then upload once to the main canvas
  function viaCPU(X, fn) {
    const Fx = layer('ch_frame');
    fn(Fx);
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(CL.get('ch_frame').c, 0, 0); X.restore();
  }

  // ------------------------------------------------------------------ lyric onsets (never hardcoded)
  // Each bar: [pickup, downbeat word, punch word, response] = [IT'S, SO, OVER, (ahn] / [WE'RE, SO, BACK, (ahn].
  // As sung (composition A): IT'S / WE'RE is a 16th pickup, SO lands ON the downbeat, OVER / BACK on beat 2 and the
  // (ahn-YOUNG!) answer on beat 3-and. The timeline carries the answer as "(ahn" + "young!)", and its onset snapping
  // can give the pickup and SO the same start: SO is kept at least 3 frames after the pickup and, when it is that
  // close to the bar line, locked to the downbeat it is sung on. All-or-nothing per bar: if the timeline doesn't carry
  // the bar's words in order, the whole bar falls back to the composition's rhythm, so the choreography never tears.
  const WORDS = { over: ["IT'S", 'SO', 'OVER'], back: ["WE'RE", 'SO', 'BACK'] };
  const _ons = new Map();
  function onsets(n, kind, resp = true) {
    const key = `${n}${kind}${resp}`; if (_ons.has(key)) return _ons.get(key);
    const T = barT(n), list = WORDS[kind];
    const w0 = findWord(list[0], T - .4, T + .15), w1 = w0 && findWord(list[1], w0.s - .01, T + .4);
    const w2 = w1 && findWord(list[2], Math.max(w1.s, T) + .15, T + 2 * BEAT);
    const w3 = resp && w2 ? (findWord('ahn', w2.s + .3, T + BAR - .05) || findWord('안녕', w2.s + .3, T + BAR - .05)) : null;
    let out;
    if (w0 && w1 && w2 && (w3 || !resp)) {
      let so = Math.max(w1.s, w0.s + 3 * F);
      if (Math.abs(so - T) < .12) so = T;
      out = [w0.s, so, w2.s, resp ? w3.s : T + 3 * BEAT]; // (no answer: where it would have been, the end of the held OVER)
    } else out = [T - BEAT / 4, T, T + BEAT, resp ? T + 2.5 * BEAT : T + 3 * BEAT];
    _ons.set(key, out);
    return out;
  }

  // ------------------------------------------------------------------ small utilities
  const B8 = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
    3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21];
  const _bayer = new Map();
  function bayerCanvas(level, cell) { // opaque where the Bayer rank < level (0..64); device-pixel cells
    level = Math.round(clamp(level, 0, 64)); const key = level + '|' + cell;
    let c = _bayer.get(key); if (c) return c;
    c = makeCanvas(8 * cell, 8 * cell); const x = c.getContext('2d'); x.fillStyle = '#000';
    for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) if (B8[j * 8 + i] < level) x.fillRect(i * cell, j * cell, cell, cell);
    _bayer.set(key, c); return c;
  }
  // erase a layer ctx with an ordered-dither mask. level(r) per annulus around (cx, cy) (logical px), or uniform.
  function bayerErase(L, level, o = {}) {
    const cell = Math.max(2, Math.round((o.cell || 6) * G.scale));
    L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.globalCompositeOperation = 'destination-out';
    const cw = L.canvas.width, ch = L.canvas.height;
    if (typeof level === 'number') {
      if (level > 0) { L.fillStyle = L.createPattern(bayerCanvas(level, cell), 'repeat'); L.fillRect(0, 0, cw, ch); }
    } else {
      const { cx, cy, rmax, n = 10 } = o, s = G.scale;
      for (let i = 0; i < n; i++) { // annulus i spans r in [i, i+1] * rmax / n ; last ring runs to infinity
        const r0 = i / n * rmax, r1 = (i + 1) / n * rmax, lv = level((i + .5) / n);
        if (lv <= 0) continue;
        L.beginPath(); if (i === n - 1) L.rect(0, 0, cw, ch); else L.arc(cx * s, cy * s, r1 * s, 0, TAU);
        // rings overlap by 2 device px: abutting anti-aliased edges would each keep a sliver of ink and leave
        // faint concentric seams on the drained paper
        if (r0 > 0) L.arc(cx * s, cy * s, Math.max(0, r0 * s - 2), 0, TAU, true);
        L.fillStyle = L.createPattern(bayerCanvas(lv, cell), 'repeat'); L.fill('evenodd');
      }
    }
    L.restore();
  }
  // noisy flood rectangle (same noise recipe as the print margin, so the edge reads as the same ink)
  function noisyRect(ctx, x0, y0, x1, y1, seed, amp = 3) {
    const step = 12; let i = 0;
    const n = (k, side) => noise1(k / 9, seed * 17 + side) * amp + noise1(k / 2.3, seed * 31 + side) * amp * .35;
    ctx.beginPath();
    for (let x = x0; x <= x1; x += step) ctx.lineTo(x, y0 + n(i++, 1));
    for (let y = y0; y <= y1; y += step) ctx.lineTo(x1 + n(i++, 2), y);
    for (let x = x1; x >= x0; x -= step) ctx.lineTo(x, y1 + n(i++, 3));
    for (let y = y1; y >= y0; y -= step) ctx.lineTo(x0 + n(i++, 4), y);
    ctx.closePath();
  }
  // flood coverage 0 (paper) .. 1 (full INK flood to the 22 px margin) from a list of print/lift flips
  function coverage(t, FL) {
    let cur = FL.init;
    for (const f of FL.list) {
      if (t < f.s) break;
      const u = clamp((t - f.s) / f.d);
      if (u < 1) return f.to > cur ? lerp(cur, f.to, E.out3(u)) : lerp(cur, f.to, E.in2(u));
      cur = f.to;
    }
    return cur;
  }
  // paint the ground for coverage k; returns the style ground for the characters ('ink' | 'paper')
  function paintGround(X, k, seed) {
    if (k >= .999) { X.fillStyle = C.INK; X.fillRect(-50, -50, W + 100, H + 100); G.post.ground = 'ink'; G.post.lift = 0; return 'ink'; }
    groundPaper(X);
    if (k <= .001) return 'paper';
    // the flood's edge retreats inward (lift) / advances outward (print) with a halftone fringe; below k .4 the
    // remaining ink is only dots that thin out, so a lift never ends as a tiny solid box
    const s = lerp(.3, 1, k), hw = (W / 2 - 22) * s, hh = (H / 2 - 22) * s, x0 = 960 - hw, x1 = 960 + hw, y0 = 540 - hh, y1 = 540 + hh;
    const solid = clamp((k - .4) / .6), dots = clamp(k / .4);
    X.save();
    const band = (o, dens) => { noisyRect(X, x0 - o, y0 - o, x1 + o, y1 + o, seed, 3 + o * .08); X.fillStyle = halftone(X, C.INK, dens, 12, 45); X.fill(); };
    band(110 * solid + 30, .14 * dots); band(56 * solid + 14, .32 * dots);
    if (solid > 0) {
      const ins = (1 - solid) * 60;
      X.save(); X.translate(-2, 2); noisyRect(X, x0 + ins, y0 + ins, x1 - ins, y1 - ins, seed); X.fillStyle = C.CLAY; X.fill(); X.restore();
      noisyRect(X, x0 + ins, y0 + ins, x1 - ins, y1 - ins, seed); X.fillStyle = C.INK; X.fill();
    } else band(0, .6 * dots);
    X.restore();
    return k > .5 ? 'ink' : 'paper';
  }

  // chant 2's lift: the flood dithers away from the edges inward (the chant-2 dissolve), leaving drained paper
  function paintLiftDither(X, kl, seed) {
    groundPaper(X);
    const L = layer('ch_flood');
    L.save(); L.translate(-2, 2); noisyRect(L, 22, 22, W - 22, H - 22, seed); L.fillStyle = C.CLAY; L.fill(); L.restore();
    noisyRect(L, 22, 22, W - 22, H - 22, seed); L.fillStyle = C.INK; L.fill();
    bayerErase(L, u => (kl * 1.8 - (1 - u) * .8) * 64, { cx: 960, cy: 540, rmax: 1100, n: 12, cell: 8 });
    drawLayer(X, 'ch_flood');
    return kl < .5 ? 'ink' : 'paper';
  }

  // ------------------------------------------------------------------ camera (world -> screen)
  function makeCam(ax = 960, ay = 540, z = 1, sx = ax, sy = ay) {
    return { ax, ay, z, sx, sy, p: (x, y) => [(x - ax) * z + sx, (y - ay) * z + sy], apply(X) { X.translate(sx, sy); X.scale(z, z); X.translate(-ax, -ay); } };
  }
  // HERO impact punch: +3% on each syllable, fast in, spring out
  function punch(t, times) {
    let v = 0;
    for (const ts of times) { const a = t - ts; if (a < -F || a > .6) continue; const k = a < 0 ? (a + F) / F * .5 : Math.exp(-7 * a) * Math.cos(a * 18); v = Math.max(v, k); }
    return v;
  }

  // ------------------------------------------------------------------ choreography (R units, body space, y up)
  // A pose is a flat record; strings snap one third into a transition (expression swaps land on 1s).
  const P0 = { dy: 0, crouch: 0, sy: 1, lean: 0, hTilt: 0, hDy: 0, lx: -.9, ly: 2.85, rx: .9, ry: 2.85, flare: 1, droop: 0, lower: 0, gx: 0, gy: 0, wav: 0, lid: 0, blush: .8,
    eyes: 'normal', mouth: 'sing', lt: 'mitten', rt: 'mitten', lf: 0, rf: 0, brows: null, trem: 0, knee: 1, palm: 0 };
  // the 안녕 wave: identical after OVER and after BACK (that is the joke)
  // the hand is raised above the cheek line and opens into a palm (fingers fanned) so it reads as a wave, not a mic
  const WAVE = { ...P0, hTilt: -.07, hDy: .02, lx: -.82, ly: 3.0, rx: 1.46, ry: 6.02, rf: 1, flare: 1.05, lower: .4, eyes: 'happy', mouth: 'sing', wav: 1, knee: 1, palm: 1 };
  const K = { // key poses (partial; resolved on top of the previous key)
    RISE: { palm: 0, dy: .1, crouch: 0, sy: 1.04, lean: 0, hTilt: -.1, hDy: .05, lx: -1.05, ly: 3.35, rx: 1.05, ry: 3.35, rf: 0, flare: 1.06, droop: 0, lower: 0, eyes: 'normal', brows: 'angry', wav: 0, knee: 1 },
    SLUMP1: { dy: 0, crouch: .1, sy: .93, lean: .05, hTilt: .26, hDy: -.3, lx: -.7, ly: 2.1, rx: .66, ry: 2.15, flare: .95, droop: .6, eyes: 'closed', brows: 'angry', knee: -.25 },
    SLUMP2: { crouch: .2, sy: .91, lean: -.07, hTilt: -.26, hDy: -.38, lx: -.84, ly: 1.95, rx: .56, ry: 2.05, droop: .8, knee: -.38 },
    SLUMP3: { crouch: .3, sy: .88, lean: .08, hTilt: .32, hDy: -.46, lx: -.58, ly: 1.7, rx: .68, ry: 1.65, droop: 1, flare: .9, eyes: 'TT', knee: -.45 },
    DIP: { palm: 0, crouch: .16, sy: .95, hDy: -.12, lean: 0 },
    CROUCH: { palm: 0, dy: 0, crouch: .24, sy: .9, lean: 0, hTilt: 0, hDy: -.14, lx: -.34, ly: 4.5, rx: .34, ry: 4.5, lf: 1, rf: 1, lt: 'mitten', rt: 'mitten', flare: .9, droop: 0, lower: 0, eyes: '><', brows: 'up', wav: 0, knee: 1 },
    BURST: { dy: .12, crouch: 0, sy: 1.12, hTilt: 0, hDy: .08, lx: -1.32, ly: 5.8, rx: 1.32, ry: 5.8, lt: 'spark', rt: 'spark', lf: 1, rf: 1, flare: 1.2, eyes: 'star', brows: null },
    PUMP: { dy: .22, sy: 1.06, lx: -1.12, ly: 6.75, rx: 1.12, ry: 6.75, hTilt: .08, flare: 1.14 },
    LAND1: { dy: 0, sy: .95, crouch: .06 },
    VARMS: { dy: .26, crouch: 0, sy: 1.1, lx: -1.95, ly: 6.2, rx: 1.95, ry: 6.2, hTilt: -.07, flare: 1.24 },
    LAND2: { dy: 0, sy: .93, crouch: .08 },
    // chant 2: Opus alone drops into the anticipation crouch and holds it
    HOPE: { palm: 0, dy: 0, crouch: .22, sy: .94, lean: 0, hTilt: 0, hDy: -.1, lx: -.33, ly: 4.52, rx: .33, ry: 4.52, lf: 1, rf: 1, lt: 'mitten', rt: 'mitten', flare: 1, droop: 0, lower: 0, eyes: 'normal', mouth: 'O', brows: 'angry', gx: 0, gy: -.2, wav: 0, trem: .3, knee: 1 },
    HOPE_UP: { crouch: .18, hDy: -.06, gy: -1, gx: 0, flare: 1.06, brows: 'angry', mouth: 'O' },
    HOPE_LENS: { gy: 0, gx: 0, flare: 1, mouth: 'M' },
    DEFLATE: { crouch: .26, sy: .92, hDy: -.16, hTilt: .05, lx: -.58, ly: 2.95, rx: .56, ry: 3.0, lf: 0, rf: 0, droop: .35, flare: .97, brows: 'angry', mouth: '._.', trem: 0 },
    HOLD_SLUMP: { palm: 0, crouch: .14, sy: .91, hTilt: .26, hDy: -.36, droop: .9, eyes: 'closed', knee: -.45 },
  };
  const f = F, E8 = BEAT / 2;
  // o = [pickup, SO (downbeat), OVER/BACK (beat 2), (ahn (beat 3-and)]. Hits land 3 frames early and settle on the syllable.
  // OVER: rise on the pickup, then three hits down, one per sung syllable (SO / O- / -VER), then the 안녕 wave.
  const seqOver = o => [[o[1] - 6 * f, 3 * f, K.RISE, E.out2], [o[1] - 3 * f, 6 * f, K.SLUMP1, E.back], [o[2] - 3 * f, 6 * f, K.SLUMP2, E.back],
    [o[2] + E8 - 3 * f, 7 * f, K.SLUMP3, E.back], [o[3] - 5 * f, 2 * f, K.DIP, E.out2], [o[3] - 3 * f, 7 * f, WAVE, E.back]];
  // BACK: fists at the chin on the pickup, SO bursts into spark hands, BACK throws the V, the same 안녕 wave.
  const seqBack = o => [[o[1] - 7 * f, 4 * f, K.CROUCH, E.out3], [o[1] - 3 * f, 6 * f, K.BURST, E.back], [o[1] + 5 * f, 3 * f, K.LAND1, E.in3],
    [o[2] - 3 * f, 6 * f, K.VARMS, E.back], [o[2] + E8 - 2 * f, 5 * f, K.PUMP, E.back], [o[2] + E8 + 3 * f, 3 * f, K.LAND2, E.in3],
    [o[3] - 5 * f, 2 * f, K.DIP, E.out2], [o[3] - 3 * f, 7 * f, WAVE, E.back]];

  function blendP(a, b, k) {
    const o = {};
    for (const key in b) { const va = a[key], vb = b[key]; o[key] = (typeof vb === 'number' && typeof va === 'number') ? va + (vb - va) * k : (k < .34 ? va : vb); }
    return o;
  }
  // build a resolved, time-sorted key track from sequences
  function track(seqs, base = WAVE) {
    const keys = seqs.flat().sort((a, b) => a[0] - b[0]);
    let res = { ...base };
    return { base, keys: keys.map(([s, d, pose, ease]) => { res = { ...res, ...pose }; return { s, d, res, ease }; }) };
  }
  function evalTrack(tr, t) {
    let prev = tr.base, cur = tr.base;
    for (const k of tr.keys) {
      if (t < k.s) break;
      const u = (t - k.s) / k.d;
      cur = u >= 1 ? k.res : blendP(prev, k.res, k.ease(clamp(u)));
      prev = k.res;
    }
    return cur;
  }
  // full pose with follow-through: head lags 2 frames, hands lag 3 (BIBLE §6.1 rig timing)
  function poseAt(tr, t) {
    const b = evalTrack(tr, t), h = evalTrack(tr, t - 2 * F), a = evalTrack(tr, t - 3 * F);
    return { ...b, hTilt: h.hTilt, hDy: h.hDy, lx: a.lx, ly: a.ly, rx: a.rx, ry: a.ry, lt: a.lt, rt: a.rt, lf: a.lf, rf: a.rf, palm: a.palm };
  }
  // pose record -> drawOpus state
  function toState(p, t, gr, tr, seed) {
    const bp = beatPos(t);
    const wig = p.wav * Math.sin(TAU * 2 * bp); // palm-out wave on the eighths
    const bob = p.wav * .05 * Math.abs(Math.sin(Math.PI * bp));
    const bendL = p.ly > 5.3 ? 1 : -1, bendR = p.ry > 5.3 ? -1 : 1;
    const mouth = p.mouth === 'sing' ? lipSync(t, 'rest') : p.mouth;
    return {
      t, ground: gr, dy: p.dy - p.crouch + bob, sy: p.sy * (1 + .014 * p.trem * Math.sin(TAU * t / 1.7)), lean: p.lean,
      head: { tilt: p.hTilt + wig * .03, dy: p.hDy },
      armL: { hand: [p.lx, p.ly], bend: bendL, type: p.lt, front: !!p.lf },
      armR: { hand: [p.rx + wig * .2, p.ry - Math.abs(wig) * .06], bend: bendR, type: p.rt, front: !!p.rf, hold: p.palm > .5 ? openPalm(wig) : undefined },
      legL: { foot: [-.36, p.crouch], bend: -p.knee }, legR: { foot: [.36, p.crouch], bend: p.knee }, // knee < 0: knock-kneed slump
      face: { eyes: p.eyes, mouth, lower: p.lower, brows: p.brows, gaze: [p.gx, p.gy], lid: Math.max(p.lid, blinkAt(t, seed)), blush: p.blush },
      // the crown kicks on every beat; not in the chant-2 silence (the audio is gated from ≈95.6)
      crown: { flare: p.flare * (1 + .06 * (t > 95.6 && t < 98 ? 0 : pulse(t, 8))), droop: p.droop, tremble: p.trem },
      ahoge: { blink: ahogeBlink(t) },
      drive: tr ? (u => { const q = evalTrack(tr, u - 2 * F); return q.hTilt + q.hDy * .6 + q.lean * .8 - q.crouch * .3; }) : null,
    };
  }
  // open palm for the 안녕 wave (drawn in hand-local px by the rig's `hold` hook): four fanned fingers and a thumb
  // tucked behind the palm disc, the whole hand wagging from the wrist on the eighths
  function openPalm(wig) {
    return (x, R) => {
      const lw = Math.max(1.6, .04 * R), r = .2 * R;
      x.save(); x.rotate(wig * .28); x.lineJoin = 'round'; x.lineWidth = lw; x.strokeStyle = C.INK; x.fillStyle = C.FACE;
      for (const a of [-.56, -.19, .18, .54]) { x.save(); x.rotate(a); rr(x, -.06 * R, -r - .16 * R, .12 * R, .28 * R, .06 * R); x.fill(); x.stroke(); x.restore(); }
      x.save(); x.rotate(-1.35); rr(x, -.06 * R, -r - .09 * R, .12 * R, .2 * R, .06 * R); x.fill(); x.stroke(); x.restore();
      x.beginPath(); x.arc(0, 0, r * 1.04, 0, TAU); x.fill(); x.stroke();
      x.restore();
    };
  }
  // where the head is (R units above the sole, x offset) for the floating PINK bubble
  function headOf(p) { const hy = (5.72 + p.hDy) * p.sy + p.dy - p.crouch; return [Math.sin(p.lean) * (hy - 2.55), hy]; }

  // ------------------------------------------------------------------ figure compositing (die-cut rings, bubbles)
  const _scr = {};
  function scratch(id, w, h) {
    let s = _scr[id];
    if (!s || s.c.width < w || s.c.height < h) { const c = makeCanvas(Math.max(w, s ? s.c.width : 0), Math.max(h, s ? s.c.height : 0)); s = _scr[id] = { c, x: c.getContext('2d') }; }
    s.x.setTransform(1, 0, 0, 1, 0, 0); s.x.globalCompositeOperation = 'source-over'; s.x.globalAlpha = 1; s.x.filter = 'none';
    s.x.clearRect(0, 0, s.c.width, s.c.height); return s;
  }
  function pinkBubble(x, cx, cy, R, gr) { // x: ctx in logical units; (cx, cy) bubble centre
    const w = 1.0 * R, h = .66 * R, lw = Math.max(1.5, .07 * R);
    x.save(); x.lineJoin = 'round';
    rr(x, cx - w / 2, cy - h / 2, w, h, h * .45);
    x.moveTo(cx + w * .12, cy + h / 2 - 1); x.lineTo(cx + w * .3, cy + h / 2 + h * .45); x.lineTo(cx + w * .34, cy + h / 2 - 1);
    x.fillStyle = C.PINK; x.fill(); x.lineWidth = lw; x.strokeStyle = C.INK; x.stroke();
    x.restore();
  }
  // render a figure (Opus rig + optional bubble) into a scratch canvas with die-cut rings.
  // rings: [[colour, radius px], ...] outer first. Returns {c, w, h, ox, oy, res} (device px; ox, oy = sole point).
  function composeFigure(id, R, st, rings, bubble, res) {
    // tight bounds: spark hands at ±2.4R, crown swoop, bubble ~9.5R above the sole, ring margin
    const w = Math.ceil(6.4 * R * res + 28), h = Math.ceil(10.8 * R * res + 28);
    const ox = Math.round(w / 2), oy = h - Math.ceil(.6 * R * res + 12);
    const S = scratch('fig' + id, w, h);
    // the rig straight into the CPU scratch (drawOpus would go through a GPU buffer and read it back)
    const S0 = mergeState({ ...st, keyline: false });
    S.x.setTransform(res, 0, 0, res, 0, 0); S.x.translate(ox / res, oy / res); if (S0.flip) S.x.scale(-1, 1);
    S.x.save(); drawOpusBody(S.x, R, S0); S.x.restore();
    S.x.setTransform(res, 0, 0, res, 0, 0);
    if (bubble) pinkBubble(S.x, ox / res + bubble[0] * R, oy / res - bubble[1] * R, R, st.ground);
    if (!rings || !rings.length) return { c: S.c, w, h, ox, oy, res };
    const O = scratch('figo' + id, w, h), T = scratch('tint', w, h);
    for (const [col, rad] of rings) {
      T.x.globalCompositeOperation = 'source-over'; T.x.clearRect(0, 0, w, h); T.x.drawImage(S.c, 0, 0);
      T.x.globalCompositeOperation = 'source-in'; T.x.fillStyle = col; T.x.fillRect(0, 0, w, h);
      const r = rad * res;
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; O.x.drawImage(T.c, 0, 0, w, h, Math.cos(a) * r, Math.sin(a) * r, w, h); }
    }
    O.x.drawImage(S.c, 0, 0);
    return { c: O.c, w, h, ox, oy, res };
  }
  // blit a composed figure with its sole at screen (x, y) (logical), scaled by k about a pivot `up` R above the sole
  function blitFigure(ctx, fig, x, y, o = {}) {
    const { k = 1, alpha = 1, pivot = 0, slices = 0, sliceSeed = 0 } = o;
    if (k <= .001 || alpha <= 0) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha;
    const s = G.scale, dx = x * s, dy = y * s, pv = pivot * s;
    const dw = fig.w * k, dh = fig.h * k, px = dx - fig.ox * k, py = dy - pv - (fig.oy - pv) * k;
    if (!slices) ctx.drawImage(fig.c, 0, 0, fig.w, fig.h, px, py, dw, dh);
    else for (let i = 0; i < slices; i++) { // slice-displace glitch
      const sy0 = fig.h * i / slices, sh = fig.h / slices, off = (hash2(i, sliceSeed) - .5) * fig.w * .35 * k;
      ctx.drawImage(fig.c, 0, sy0, fig.w, sh, px + off, py + sy0 * k, dw, sh * k);
    }
    ctx.restore();
  }

  // crowd sprites (pre-rendered per pose-frame; crowds > 8 blit these)
  const _spr = new Map();
  function sprite(key, R, st, ink, bubble) {
    let s = _spr.get(key); if (s) return s;
    if (_spr.size > 140) _spr.clear();
    const fig = composeFigure(9, R, st, ink ? [[C.PAPER, Math.max(2, .05 * R + 1)]] : [], bubble, G.scale);
    const c = makeCanvas(fig.w, fig.h); c.getContext('2d').drawImage(fig.c, 0, 0, fig.w, fig.h, 0, 0, fig.w, fig.h);
    s = { ...fig, c }; _spr.set(key, s); return s;
  }

  // ------------------------------------------------------------------ formation (perspective wedge; V of 5 at the front)
  const HOR = 500, FLOOR = 1055, SPX = 164, R_OP = 56, R_IN = 46;
  // framing (world -> screen): pair 1 and chant 2 sit close on the lead, waist-up (R_OP·Z1 ≈ 84 px, boots below the
  // frame); pair 2 cranes back as the formation multiplies so the 256 wedge reads, the lead still in front at R ≈ 62.
  const Z1 = 1.5, SY1 = 1188, Z2 = 1.1, SY2 = 1096;
  const LCAM = { ax: 960, ay: 540, z: 1, sx: 960, sy: 540, p: (x, y) => [x, y], apply() {} }; // lamps hang in screen space
  const zRow = r => 1 + .25 * r;
  function slot(r, c) { const z = zRow(r); return { r, c, x: 960 + c * SPX * (1 + .07 * Math.max(0, r - 2)) / z, y: HOR + (FLOOR - HOR) / z, R: (r === 0 ? R_OP : R_IN) / z, z }; }
  const isV = (r, c) => r <= 2 && Math.abs(c) === r;
  const STAGE_ROWS = [2, 3, 7, 15]; // 5 (V) -> 16 -> 64 -> 256
  const stageOf = (r, c) => isV(r, c) ? 0 : r <= 3 ? 1 : r <= 7 ? 2 : 3;
  const CROWD = (() => { // every non-V slot of the 256 wedge, with its spawn stage and parent (nearest earlier slot)
    const all = [];
    for (let r = 0; r <= 15; r++) for (let c = -r; c <= r; c++) all.push({ ...slot(r, c), st: stageOf(r, c) });
    for (const d of all) {
      if (d.st === 0) continue;
      let best = null, bd = 1e9;
      for (const e of all) { if (e.st >= d.st) continue; const q = (e.x - d.x) ** 2 + ((e.y - d.y) * 2) ** 2; if (q < bd) { bd = q; best = e; } }
      d.parent = best;
    }
    return all.filter(d => d.st > 0).sort((a, b) => b.r - a.r || Math.abs(b.c) - Math.abs(a.c));
  })();
  const V5 = [[2, -2], [2, 2], [1, -1], [1, 1], [0, 0]].map(([r, c]) => slot(r, c)); // back to front, Opus last
  const rippleDelay = (r, c) => .016 * r + .006 * Math.abs(c);
  const BUBBLE = [-.5, 3.05]; // bubble offset from the head (R units): up-left, clear of the cursor ahoge

  // ------------------------------------------------------------------ type
  // The call is a justified two-row block in the 9:16 core, sized to the sung rhythm: row 1 carries the pickup and the
  // downbeat (IT'S SO / WE'RE SO, sung as one gesture), row 2 the punch word on beat 2 (OVER / BACK, the biggest type).
  // Each row is sized to the same 548 px column (≤ 560 with breathing), so both calls print as the same block. Nothing
  // is cropped by the frame: the block sits above the dancers and the front crowns overlap only the punch word's feet.
  const COLW = 548, ROW_GAP = 30, BLOCK_BASE = 448;
  const CALLS = { over: [["IT'S", 'SO'], 'OVER'], back: [["WE'RE", 'SO'], 'BACK'] };
  const _hw = new Map();
  const heroW = (X, s, z) => { const k = s + z; if (!_hw.has(k)) _hw.set(k, heroWidth(X, s, z, 'xcond')); return _hw.get(k); };
  const _lay = {};
  function callLayout(X, kind) {
    if (_lay[kind]) return _lay[kind];
    const [[a, b], p] = CALLS[kind], r1 = a + ' ' + b;
    const s1 = Math.floor(COLW * 100 / heroW(X, r1, 100)), s2 = Math.floor(COLW * 100 / heroW(X, p, 100));
    const y2 = BLOCK_BASE, y1 = Math.round(y2 - .69 * s2 - ROW_GAP);
    const wA = heroW(X, a, s1), wB = heroW(X, b, s1), wR = heroW(X, r1, s1), x0 = 960 - wR / 2;
    const words = [{ str: a, size: s1, x: x0 + wA / 2, y: y1, w: wA, row: 0 }, { str: b, size: s1, x: x0 + wR - wB / 2, y: y1, w: wB, row: 0 },
      { str: p, size: s2, x: 960, y: y2, w: heroW(X, p, s2), row: 1 }];
    return (_lay[kind] = { words, rowW: [wR, words[2].w], top: y1 - .69 * s1, cy: (y1 - .69 * s1 + y2) / 2 });
  }
  function drawCall(X, t, bar, alpha = 1) {
    const o = bar.o, kind = bar.kind === 'back' ? 'back' : 'over', Lay = callLayout(X, kind);
    const col = kind === 'back' ? C.PAPER : C.INK;
    const tDrop = o[3] - 5 * F; // falls during the dip, so 안녕 lands on a clear sky
    Lay.words.forEach((w, k) => {
      const age = t - (o[k] - 2 * F); if (age < 0) return;
      // breathe on the beat about the column centre, clamped so a row never passes 560 px
      const sx = Math.min(560 / Lay.rowW[w.row], .975 + .045 * pulse(t, 6));
      let x = 960 + (w.x - 960) * sx, y = w.y, rot = 0;
      const dd = t - tDrop - (w.row ? 0 : F); // gravity drop-away, the punch word first, 6 frames to clear the frame
      if (dd > 0) { y += 30000 * dd * dd + 1500 * dd; rot = (hash(k + bar.n * 7) - .5) * dd * 2.4; x += (hash(k + 3 + bar.n * 7) - .5) * dd * 500; if (y - w.size > 1200) return; }
      X.save(); X.globalAlpha *= alpha; X.translate(x, y); X.rotate(rot);
      hero(X, w.str, 0, 0, w.size, { stretch: 'xcond', color: col, shadow: C.CLAY_DARK, shadowOff: w.row ? 8 : 6, sx, age });
      X.restore();
      scraps(X, t, o[k] - 2 * F + .05, x, y, w.w * .9, bar.n * 13 + k, kind === 'back' ? [C.PAPER, C.CLAY] : [C.INK, C.CLAY]);
    });
  }
  // 6-10 paper scraps kicked off a slam
  function scraps(X, t, t0, cx, cy, wd, seed, cols) {
    const a = t - t0; if (a < 0 || a > .75) return;
    X.save();
    for (let i = 0; i < 8; i++) {
      const h1 = hash2(seed, i), h2 = hash2(seed, i + 50), h3 = hash2(seed, i + 99);
      const side = i % 2 ? 1 : -1;
      const x = cx + side * (wd * .35 + h1 * wd * .2) + side * (220 + h2 * 380) * a, y = cy - 40 - h3 * 120 + (-520 - h1 * 420) * a + 2400 * a * a;
      const s = 7 + h2 * 11, al = 1 - (a / .75) ** 2;
      X.globalAlpha = al; X.fillStyle = cols[i % cols.length];
      X.save(); X.translate(x, y); X.rotate(a * (h3 - .5) * 22 + h1 * 6);
      X.beginPath(); X.moveTo(-s, -s * .5); X.lineTo(s * .8, -s * .7); X.lineTo(s, s * .4); X.lineTo(-s * .6, s * .6); X.closePath(); X.fill();
      X.restore();
    }
    X.restore();
  }
  // 안녕 (Noto Sans KR 900, 300 px, CLAY with an INK outline) above the heads + mono 96 gloss
  function drawAnnyeong(X, t, tIn, tOut, gloss, gr) {
    const a = t - tIn; if (a < 0 || t > tOut + 3 * F) return;
    const out = clamp((t - tOut) / (3 * F));
    const s = E.back(clamp(a / (7 * F)), 2.4) * (1 - E.inBack(out) * .95), al = out >= 1 ? 0 : 1;
    const rot = -.035 + (1 - E.out3(clamp(a / .3))) * -.14;
    X.save(); X.globalAlpha *= al;
    X.save(); X.translate(960, 336); X.rotate(rot); X.scale(s, s);
    X.font = `900 300px ${FONTS.hangul}`; X.textAlign = 'center'; X.textBaseline = 'alphabetic'; X.lineJoin = 'round';
    if (gr === 'ink') { // die-cut PAPER keyline around the INK outline and the shadow (the sticker reads on INK)
      X.strokeStyle = C.PAPER; X.lineWidth = 30; X.strokeText('안녕', 0, 0);
      X.lineWidth = 14; X.strokeText('안녕', 9, 9); X.fillStyle = C.PAPER; X.fillText('안녕', 9, 9);
    }
    X.fillStyle = C.CLAY_DARK; X.fillText('안녕', 9, 9);
    X.lineWidth = 16; X.strokeStyle = C.INK; X.strokeText('안녕', 0, 0);
    X.fillStyle = C.CLAY; X.fillText('안녕', -2, -2);
    X.restore();
    // gloss types on, one character per frame, 2 frames after the pop
    const n = Math.floor((a - 2 * F) * 30) + 1;
    if (n > 0) {
      const str = gloss.slice(0, Math.min(gloss.length, n));
      X.font = mono(96, 600); X.textAlign = 'center'; X.textBaseline = 'alphabetic';
      const full = X.measureText(gloss).width;
      X.fillStyle = gr === 'ink' ? C.PAPER : C.INK; X.textAlign = 'left';
      X.fillText(str, 960 - full / 2, 450);
    }
    X.restore();
  }

  // ------------------------------------------------------------------ stage light (INK calls only: PAPER halftone beams)
  // two paper-cut stage lamps hang at the top corners: off and drooping on OVER (PAPER), on and aimed on BACK (INK)
  const LAMPS = [{ x: 250, y: 118, side: -1 }, { x: 1670, y: 118, side: 1 }];
  function lampAim(L, t, k, flips) {
    const base = Math.atan2(770 - L.y, 960 - L.x); // aimed at the lead's chest
    let wob = 0; for (const f of flips) { const a = t - f; if (a > 0 && a < 1) wob += Math.exp(-6 * a) * Math.sin(a * 26) * .14; }
    return base + (1 - k) * .42 * -L.side + wob * -L.side + Math.sin(beatPos(t) * Math.PI * .5 + (L.side > 0 ? Math.PI : 0)) * .05 * k;
  }
  function lamps(X, t, cam, k, on, flips) {
    const ink = k > .5, line = ink ? C.PAPER : C.INK, tt = Math.floor(t * 12) / 12;
    // beams first (they sit behind everything), from each lens
    if (on > 0) for (const L of LAMPS) {
      const ang = lampAim(L, t, k, flips), [px, py] = cam.p(L.x, L.y), z = cam.z;
      const lx = px + Math.cos(ang) * 62 * z, ly = py + Math.sin(ang) * 62 * z, len = 1700 * z;
      X.save(); X.globalAlpha *= on;
      [[.19, .05], [.12, .085], [.065, .14]].forEach(([spread, dens]) => { // nested wedges: denser dots at the core of the beam
        X.beginPath(); X.moveTo(lx + Math.cos(ang + 1.57) * 30 * z, ly + Math.sin(ang + 1.57) * 30 * z);
        X.lineTo(lx + Math.cos(ang + spread) * len, ly + Math.sin(ang + spread) * len);
        X.lineTo(lx + Math.cos(ang - spread) * len, ly + Math.sin(ang - spread) * len);
        X.lineTo(lx + Math.cos(ang - 1.57) * 30 * z, ly + Math.sin(ang - 1.57) * 30 * z); X.closePath();
        X.fillStyle = halftone(X, C.PAPER, dens * (1 + .5 * pulse(t, 5)), 14, 45); X.fill();
      });
      X.restore();
    }
    for (const L of LAMPS) {
      const ang = lampAim(L, t, k, flips), [px, py] = cam.p(L.x, L.y), z = cam.z, J = i => jit(tt, L.side * 50 + i, .7);
      X.save(); X.lineJoin = 'round'; X.lineCap = 'round'; X.strokeStyle = line;
      X.lineWidth = 7 * z; X.beginPath(); X.moveTo(px + J(1), -20); X.lineTo(px + J(2), py - 46 * z); X.stroke(); // hanging rod
      X.translate(px, py); X.scale(z, z);
      X.lineWidth = 6; X.beginPath(); X.moveTo(-46, -8); X.lineTo(-46 + J(3), -46); X.lineTo(46 + J(4), -46); X.lineTo(46, -8); X.stroke(); // yoke
      X.rotate(ang);
      X.beginPath(); X.moveTo(-58 + J(5), -30); X.lineTo(52, -44 + J(6)); X.lineTo(60, -44); X.lineTo(60, 44); X.lineTo(52 + J(7), 44); X.lineTo(-58, 30 + J(8)); X.closePath();
      X.fillStyle = C.INK; X.fill(); X.lineWidth = 5; X.stroke();
      X.lineWidth = 4; for (let i = 0; i < 3; i++) { X.beginPath(); X.moveTo(-40 + i * 22, -26 - i * 4); X.lineTo(-40 + i * 22, 26 + i * 4); X.stroke(); } // fins
      X.beginPath(); X.ellipse(64, 0, 13, 44, 0, 0, TAU);
      X.fillStyle = on > .5 ? C.CLAY : mix(C.UI_GREY, C.INK, .3); X.fill(); X.lineWidth = 5; X.stroke();
      if (on > .5) { X.fillStyle = C.SPARK; X.beginPath(); X.ellipse(66, 0, 6, 26, 0, 0, TAU); X.fill(); }
      X.restore();
    }
  }
  // the lead's pool of light: a halftone floor ellipse at the boots (below the frame when it is framed waist-up) and a
  // halftone halo on the backdrop behind its crown, so the centre of the formation always reads first
  function floorSpot(X, cam, gr, w = 340, halo = 1) {
    const [x, y] = cam.p(960, FLOOR + 4);
    X.save(); X.beginPath(); X.ellipse(x, y, w * cam.z, 56 * cam.z, 0, 0, TAU);
    X.fillStyle = gr === 'ink' ? halftone(X, C.CLAY, .3, 12, 45) : halftone(X, C.INK, .13, 12, 45); X.fill();
    if (halo > 0) {
      const [hx, hy] = cam.p(960, FLOOR - 5.6 * R_OP), r = 3.1 * R_OP * cam.z;
      X.globalAlpha *= halo;
      X.beginPath(); X.arc(hx, hy, r, 0, TAU); X.fillStyle = gr === 'ink' ? halftone(X, C.CLAY, .2, 12, 45) : halftone(X, C.INK, .085, 12, 45); X.fill();
      X.beginPath(); X.arc(hx, hy, r * .74, 0, TAU); X.fillStyle = gr === 'ink' ? halftone(X, C.CLAY, .2, 12, 45) : halftone(X, C.INK, .06, 12, 45); X.fill();
    }
    X.restore();
  }

  // ------------------------------------------------------------------ draw one dancer (V member) at a slot
  function drawDancer(X, cam, d, tr, t, gr, id, o = {}) {
    const p = o.pose || poseAt(tr, t);
    const st = toState(p, t, gr, tr, 11 + id * 7);
    const [x, y] = cam.p(d.x, d.y), R = d.R * cam.z;
    const hd = headOf(p), bub = o.bubble === false ? null : [hd[0] + BUBBLE[0], hd[1] + BUBBLE[1]];
    // die-cut: on INK the PAPER keyline (INK core in front of PAPER type); on PAPER a PAPER ring that only shows over INK letters
    const kl = Math.max(3, .035 * R + 1.5);
    const rings = o.noRing ? [] : gr === 'ink' ? [[C.PAPER, 3.5 + kl], [C.INK, 3.5]] : [[C.PAPER, kl + 1]];
    const fig = composeFigure(id, R, st, rings, bub, G.scale);
    blitFigure(o.ctx || X, fig, x, y, o.blit || {});
    return { x, y, R, p };
  }

  // ================================================================== S15 (chant 1)
  const C1 = (() => {
    const bars = [{ n: 25, kind: 'over', gloss: '(= bye)' }, { n: 26, kind: 'back', gloss: '(= hi)' }, { n: 27, kind: 'over', gloss: '(= bye)' }, { n: 28, kind: 'back', gloss: '(= hi)' }];
    return { bars, t0: barT(25) - F, t1: barT(29) };
  })();
  let _c1 = null;
  function c1Data() { // resolved lazily (SONG.words is ready by the first frame)
    if (_c1) return _c1;
    const bars = C1.bars.map(b => ({ ...b, o: onsets(b.n, b.kind) }));
    const tr = track(bars.map(b => (b.kind === 'over' ? seqOver : seqBack)(b.o)));
    // the first lift rides the S14 whip-pan (the INK page leaves frame left, see the scene), so the flips start at bar 26
    const FL = { init: 0, list: bars.slice(1).map(b => ({ s: b.o[0] - 6 * F, d: 4 * F, to: b.kind === 'back' ? 1 : 0 })) };
    const slams = bars.flatMap(b => b.o.slice(0, 4));
    const b27 = bars[2].o;
    const stageT = [0, b27[1] - 2 * F, b27[2] - 2 * F, barT(27) + 2 * BEAT - 2 * F]; // 5 -> 16 -> 64 -> 256 on SO, OVER and beat 3
    return (_c1 = { bars, tr, FL, slams, stageT, pair2: bars[2].o[0] - 6 * F, flipT: [C1.t0 + 2 * F, ...FL.list.map(f => f.s + f.d)] });
  }

  scene('S15_chant_so_over_so_back', C1.t0, C1.t1, (X0, t) => viaCPU(X0, X => {
    const D = c1Data();
    G.post.edgeSeed = 25; G.post.sliver = 'bl';
    const k = coverage(t, D.FL), gr = paintGround(X, k, 25);
    // camera: locked on the lead (waist-up) for pair 1, one crane back across bar 27 as the formation multiplies;
    // +3% punch on every syllable; the whip-pan from S14 lands in the first 4 frames
    const land = clamp((t - C1.t0) / (4 * F)), wx = (1 - E.out3(land)) * 340;
    const pz = 1 + .03 * punch(t, D.slams);
    const kc = E.io2(seg(t, D.stageT[1] - 3 * F, D.stageT[3] + 10 * F));
    const cam = makeCam(960, FLOOR, lerp(Z1, Z2, kc) * pz, 960 + wx, lerp(SY1, SY2, kc));
    // S14's INK page exits left with the pan (its noisy flood edge and CLAY sliver) as the paper stage arrives
    if (land < 1) {
      const edge = wx * 1.7 - 300;
      if (edge > -40) {
        X.save(); X.translate(-2, 2); noisyRect(X, -80, 22, edge, H - 22, 25); X.fillStyle = C.CLAY; X.fill(); X.restore();
        noisyRect(X, -80, 22, edge, H - 22, 25); X.fillStyle = C.INK; X.fill();
      }
    }
    lamps(X, t, LCAM, k, gr === 'ink' ? 1 : 0, D.flipT);
    floorSpot(X, cam, gr, t > D.stageT[1] ? 560 : 340, 1 - kc * .5);
    // pair 2: the crowd multiplies behind the type (ripple of per-dancer time offsets)
    if (t >= D.stageT[1] - .05) drawCrowd(X, t, cam, D, gr);
    // calls behind the dancers (screen space: only the punch moves them)
    X.save(); X.translate(960 + wx, 540); X.scale(pz, pz); X.translate(-960, -540);
    for (const b of D.bars) if (t >= b.o[0] - 2 * F && t < b.o[3] + .6) drawCall(X, t, b);
    X.restore();
    // the V of 5: Opus at the apex, instances behind
    const ripple = t >= D.pair2;
    V5.forEach((d, i) => {
      const tl = t - (ripple ? rippleDelay(d.r, d.c) : 0);
      drawDancer(X, cam, d, D.tr, tl, gr, i, { bubble: d.r === 0 ? false : undefined });
    });
    // responses: 안녕 above the heads + gloss
    D.bars.forEach((b, i) => {
      const next = D.bars[i + 1];
      drawAnnyeong(X, t, b.o[3] - 2 * F, next ? next.o[0] - 6 * F : C1.t1 + 1, b.gloss, gr);
    });
    // the S14 whip-pan lands: motion smear trailing right while the frame decelerates (same 4-subframe recipe)
    if (land < 1) {
      const span = 255 * (1 - land) ** 3, fc = CL.get('ch_frame').c, Sx = scratch('whip', fc.width, fc.height);
      Sx.x.drawImage(fc, 0, 0);
      X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
      for (let i = 1; i < 4; i++) { X.globalAlpha = .38 / i; X.drawImage(Sx.c, 0, 0, fc.width, fc.height, span * i / 4 * G.scale, 0, fc.width, fc.height); }
      X.restore();
    }
  }));

  function drawCrowd(X, t, cam, D, gr) {
    const ink = gr === 'ink';
    for (const d of CROWD) {
      const ts = D.stageT[d.st] + .012 * (d.r - STAGE_ROWS[d.st - 1]) + .004 * Math.abs(d.c);
      const u = (t - ts) / .2; if (u <= 0) continue;
      const kk = E.back(clamp(u), 2.2), mv = E.out3(clamp(u * 1.3));
      const px = lerp(d.parent.x, d.x, mv), py = lerp(d.parent.y, d.y, mv), R = lerp(d.parent.R, d.R, mv) * cam.z;
      const [sx, sy] = cam.p(px, py);
      if (sx < -80 || sx > W + 80) continue;
      const tl = t - rippleDelay(d.r, d.c), fk = Math.round(tl * 30), tq = fk / 30;
      const lod = R > 24 ? 40 : 20;
      const key = `${fk}|${lod}|${ink ? 1 : 0}`;
      const spr = sprite(key, lod, (() => { const p = poseAt(D.tr, tq); const st = toState(p, tq, gr, D.tr, 5); st.face.lid = 0; st._p = p; return st; })(), ink,
        (() => { const p = evalTrack(D.tr, tq - 4 * F); const h = headOf(p); return [h[0] + BUBBLE[0], h[1] + BUBBLE[1]]; })());
      blitFigure(X, spr, sx, sy, { k: kk * R / lod, pivot: 0 });
    }
  }

  // ================================================================== S26 + S27 (chant 2)
  const T49 = barT(49), T51 = barT(51), T52 = barT(52), T53 = barT(53);
  const CLOSE = [{ slot: [2, 2], t: T51 + BEAT }, { slot: [1, -1], t: T51 + 1.5 * BEAT }, { slot: [1, 1], t: T51 + 2 * BEAT }]; // × on eighths
  const GAP = slot(2, -2), DOT_UP = 5.4, DOT_R = .34; // residue dot: at face height, 0.34 R
  let _c2 = null;
  function c2Data() {
    if (_c2) return _c2;
    const b49 = { n: 49, kind: 'over', gloss: '(= bye)', o: onsets(49, 'over') };
    const b50 = { n: 50, kind: 'over', o: onsets(50, 'over', false), noResp: true };
    const o50 = b50.o;
    const base = [seqOver(b49.o), seqOver(o50).slice(0, 4)];
    const trInst = track([...base, [[o50[3] - 2 * F, 12 * F, K.HOLD_SLUMP, E.io2]]]);
    const S = T51 - 3 * F;
    const trOp = track([...base, [[o50[3] - 5 * F, 3 * F, { ...K.DIP, eyes: 'normal' }, E.out2], [o50[3] - 2 * F, 7 * F, K.HOPE, E.back],
      [S, 5 * F, K.HOPE_UP, E.out3], [T51 + BEAT * 1.1, 16 * F, K.HOPE_LENS, E.io2],
      [T52 + BEAT - 2 * F, 14 * F, K.DEFLATE, E.io2], [T52 + BEAT * 1.75, 2 * F, { eyes: 'cursor', mouth: 'M' }, E.lin]]]);
    const FL = { init: 1, list: [{ s: T49 - 2 * F, d: 3 * F, to: 0 }, { s: T51 - 6 * F, d: 4 * F, to: 1 }, { s: T52 - 3 * F, d: 8 * F, to: 0 }] };
    const slams = [...b49.o, ...o50.slice(0, 3)];
    return (_c2 = { b49, b50, trInst, trOp, FL, slams, flipT: FL.list.map(f => f.s + f.d) });
  }
  const DISSOLVE = [T52 + 2 * BEAT - F, T52 + 2 * BEAT + 13 * F]; // Opus dithers away to one cursor
  // chant 2 opens on chant 1's framing (Z1), then pushes onto the crouching lead: R 168 by bar 52 b1
  function c2Cam(t) {
    const e = E.io2(seg(t, T51 - F, T52)), z = lerp(Z1, 3.0, e) * (1 + .045 * E.out2(seg(t, T52, T53)));
    const faceY = FLOOR - (5.72 - .3 - .1) * R_OP * .94, faceY1 = SY1 + (faceY - FLOOR) * Z1;
    return makeCam(960, faceY, z, 960, lerp(faceY1, 470, e));
  }

  function paintChant2(X, t) {
    const D = c2Data();
    G.post.edgeSeed = 49; G.post.sliver = 'bl';
    const k = coverage(t, D.FL), kl = seg(t, T52 - 3 * F, T52 + 5 * F);
    const gr = kl > 0 && kl < 1 ? paintLiftDither(X, kl, 49) : paintGround(X, k, 49);
    const push = c2Cam(t);
    const z = push.z * (1 + .03 * punch(t, D.slams));
    const cam = makeCam(push.ax, push.ay, z, push.sx, push.sy);
    // bar 51: the lamps try to come on for the BACK that never comes: two weak flickers, then dark
    const fl = t >= T51 - F && t < T51 + 6 * F ? [0, .9, .15, 0, .6, 0, 0][Math.floor((t - T51 + F) * 30)] || 0 : 0;
    if (t < T52 + 5 * F) lamps(X, t, LCAM, k, fl, D.flipT.slice(0, 1));
    floorSpot(X, cam, gr, t < T51 ? 340 : 300, 1 - seg(t, T51 - F, T51 + 6 * F));
    // the gap in the V: a grey dot where an instance should be (the residue lifts with the ink)
    const resA = 1 - seg(t, T52 - 3 * F, T52 + 5 * F);
    if (resA > 0) { const [gx, gy] = cam.p(GAP.x, GAP.y - DOT_UP * GAP.R); X.save(); X.globalAlpha = resA; X.fillStyle = C.UI_GREY; X.beginPath(); X.arc(gx, gy, DOT_R * GAP.R * cam.z, 0, TAU); X.fill(); X.restore(); }
    if (t >= T51 - 3 * F) withheldBack(X, t);
    // calls (bars 49, 50)
    const pz = 1 + .03 * punch(t, D.slams);
    X.save(); X.translate(960, 540); X.scale(pz, pz); X.translate(-960, -540);
    for (const b of [D.b49, D.b50]) if (t >= b.o[0] - 2 * F && t < b.o[3] + .6) drawCall(X, t, b);
    X.restore();
    // instances (3), closing one by one on eighths
    V5.slice(0, 4).forEach((d, i) => {
      if (d.r === GAP.r && d.c === GAP.c) return;
      const cl = CLOSE.find(c => c.slot[0] === d.r && c.slot[1] === d.c);
      closingInstance(X, cam, d, D.trInst, t, gr, i, cl.t, resA);
    });
    // Opus (dithers away at the end, leaving one cursor)
    const opus = V5[4];
    const bare = gr === 'paper' && t >= T52; // nothing behind Opus on the drained paper: no die-cut ring needed
    if (t < DISSOLVE[0]) drawDancer(X, cam, opus, D.trOp, t, gr, 4, { bubble: false, noRing: bare });
    else if (t < DISSOLVE[1]) {
      const L = layer('ch_opus');
      const info = drawDancer(X, cam, opus, D.trOp, t, gr, 4, { bubble: false, ctx: L, noRing: bare });
      const kd = seg(t, DISSOLVE[0], DISSOLVE[1]);
      const [fx, fy] = faceCenter(cam, opus, info.p);
      bayerErase(L, u => (kd * 1.75 - (1 - u) * .75) * 64, { cx: fx, cy: fy, rmax: 5.2 * info.R, n: 12, cell: 7 });
      drawLayer(X, 'ch_opus');
    }
    // response for bar 49 only (bar 50 has none)
    drawAnnyeong(X, t, D.b49.o[3] - 2 * F, D.b50.o[0] - 6 * F, D.b49.gloss, gr);
    if (t >= T51 - 3 * F) withheldFront(X, t, cam);
  }
  function faceCenter(cam, d, p) { const hy = (5.72 + p.hDy) * p.sy + p.dy - p.crouch; return cam.p(d.x + Math.sin(p.lean) * (hy - 2.55) * d.R, d.y - hy * d.R); }

  // × then a 5-frame mini implosion (2 bulge, 3 suck-in, slice on the last 2), leaving a grey dot
  function closingInstance(X, cam, d, tr, t, gr, id, tc, resA = 1) {
    const fr = (t - tc) * 30;
    const p = poseAt(tr, t), hd = headOf(p);
    const cxW = d.x, cyW = d.y - DOT_UP * d.R; // implosion centre (the face: it closes like an eye, to a grey dot)
    const [cx, cy] = cam.p(cxW, cyW), R = d.R * cam.z;
    if (fr >= 5) { // grey dot residue
      const a = E.back(clamp((fr - 5) / 4), 3);
      if (resA > 0) { X.save(); X.globalAlpha = resA; X.fillStyle = C.UI_GREY; X.beginPath(); X.arc(cx, cy, DOT_R * R * a, 0, TAU); X.fill(); X.restore(); }
      return;
    }
    const L = fr >= -1 ? { k: fr < 2 ? 1 + .07 * E.out2(clamp((fr + 1) / 3)) : 1.07 * (1 - E.in2(clamp((fr - 2) / 3))), slices: fr >= 3 ? 7 : 0 } : { k: 1, slices: 0 };
    const [x, y] = cam.p(d.x, d.y);
    const st = toState(p, t, gr, tr, 11 + id * 7);
    const kl = Math.max(3, .035 * R + 1.5);
    const rings = gr === 'ink' ? [[C.PAPER, 3.5 + kl], [C.INK, 3.5]] : [[C.PAPER, kl + 1]];
    const fig = composeFigure(id, R, st, rings, fr < -1 ? [hd[0] + BUBBLE[0], hd[1] + BUBBLE[1]] : null, G.scale);
    blitFigure(X, fig, x, y, { k: L.k, pivot: DOT_UP * R, slices: L.slices, sliceSeed: id * 9 + Math.floor(fr) });
    // reversed particle paths into the centre
    if (fr >= 0) {
      X.save(); const u = clamp(fr / 5);
      for (let i = 0; i < 16; i++) {
        const a = hash2(id, i) * TAU, r0 = (1.6 + hash2(id, i + 40) * 2.6) * R * (1 - E.in2(u));
        X.fillStyle = i % 3 ? C.CLAY : (gr === 'ink' ? C.PAPER : C.INK);
        X.beginPath(); X.arc(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * .9, Math.max(2, .09 * R * (1 - u * .5)), 0, TAU); X.fill();
      }
      X.restore();
    }
    // the × (tab close) over the head, RED on the click frames
    const xa = t - (tc - 5 * F);
    if (xa >= 0 && fr < 3) {
      const [hx, hy] = cam.p(d.x + (hd[0] + 1.05) * d.R, d.y - (hd[1] + 1.45) * d.R);
      const s = .36 * R * E.back(clamp(xa / (3 * F)), 3), red = fr >= -2 && fr < 0;
      X.save(); X.translate(hx, hy); X.lineCap = 'round';
      for (const [col, lw] of [[gr === 'ink' ? C.INK : C.PAPER, Math.max(15, .34 * R)], [red ? C.RED : (gr === 'ink' ? C.PAPER : C.INK), Math.max(8, .18 * R)]]) {
        X.strokeStyle = col; X.lineWidth = lw; X.beginPath(); X.moveTo(-s, -s); X.lineTo(s, s); X.moveTo(s, -s); X.lineTo(-s, s); X.stroke();
      }
      X.restore();
    }
  }

  // S27: the WE'RE / SO / BACK stack starts to slam in, freezes at 20% and Bayer-dithers away; 안녕 = bye once.
  // Both sit BEHIND Opus in the sky it is looking at, so the push brings the crown up in front of them.
  const WH = { tS: T51 - 2 * F, cy: 190 };
  WH.tFreeze = WH.tS + 2 * F; WH.tDith = T51 + .4 * BEAT; WH.tGone = WH.tDith + 8 * F; WH.tA = WH.tGone - F; WH.tAo = T51 + 2.35 * BEAT;
  function withheldBack(X, t) {
    const { tS, tFreeze, tDith, tGone, tA, tAo, cy } = WH;
    if (t >= tS && t < tGone) {
      const L = layer('ch_stack');
      const age = Math.min(t, tFreeze) - tS, frozen = t >= tFreeze, glitch = frozen && t < tFreeze + 3 * F;
      const Lay = callLayout(X, 'back');
      L.save(); L.translate(960, cy); L.scale(.2, .2); L.translate(-960, -Lay.cy);
      Lay.words.forEach((w, i) => {
        L.save(); if (glitch) L.translate((hash2(w.row, Math.floor(t * 30)) - .5) * 160, 0); // slice-displace, per row
        hero(L, w.str, w.x, w.y, w.size, { stretch: 'xcond', color: C.PAPER, shadow: C.CLAY_DARK, shadowOff: w.row ? 8 : 6, age });
        L.restore();
      });
      L.restore();
      if (t >= tDith) bayerErase(L, E.in2(seg(t, tDith, tGone)) * 64, { cell: 5 });
      if (glitch) { // chroma split: a CLAY copy of the frozen stack shoved sideways
        const T = scratch('stk_tint', L.canvas.width, L.canvas.height);
        T.x.drawImage(L.canvas, 0, 0); T.x.globalCompositeOperation = 'source-in'; T.x.fillStyle = C.CLAY; T.x.fillRect(0, 0, L.canvas.width, L.canvas.height);
        X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(T.c, 0, 0, L.canvas.width, L.canvas.height, 8 * G.scale, -2 * G.scale, L.canvas.width, L.canvas.height); X.restore();
      }
      drawLayer(X, 'ch_stack');
    }
    // 안녕 = bye, once. It is typed out of the ink, then backspaced (1 char per frame) before the push brings the
    // crown up into it: the caret eats `= bye`, then 녕, then 안.
    if (t >= tA && t < tAo + 12 * F) {
      const pop = E.back(clamp((t - tA) / (6 * F)), 2);
      const del = t < tAo ? 0 : Math.floor((t - tAo) * 30) + 1, G1 = ' = bye';
      const gl = G1.slice(0, Math.max(0, G1.length - del)), hs_ = ['안녕', '안', ''][clamp(del - G1.length, 0, 2)];
      X.save(); X.translate(960, cy); X.scale(pop, pop);
      X.font = `900 110px ${FONTS.hangul}`; const w1 = X.measureText('안녕').width, wh = X.measureText(hs_).width;
      X.font = mono(96, 600); const w2 = X.measureText(G1).width, wg = X.measureText(gl).width;
      const x0 = -(w1 + w2) / 2, y = 36;
      X.font = `900 110px ${FONTS.hangul}`; X.textAlign = 'left'; X.lineJoin = 'round';
      if (hs_) {
        X.strokeStyle = C.PAPER; X.lineWidth = 16; X.strokeText(hs_, x0, y);
        X.fillStyle = C.CLAY_DARK; X.fillText(hs_, x0 + 5, y + 5);
        X.lineWidth = 8; X.strokeStyle = C.INK; X.strokeText(hs_, x0, y); X.fillStyle = C.CLAY; X.fillText(hs_, x0, y);
      }
      X.font = mono(96, 600); X.fillStyle = C.PAPER; if (gl) X.fillText(gl, x0 + w1, y - 4);
      if (t >= tAo - 4 * F) { // the caret arrives a beat-fraction early, then eats the line
        const cxr = x0 + (gl ? w1 + wg : wh) + 8;
        X.fillStyle = C.CLAY; X.fillRect(cxr, y - 84, 14, 100);
      }
      X.restore();
    }
  }
  // after the lift: Rafa's small window far off, and the lone cursor Opus leaves behind
  function withheldFront(X, t, cam) {
    if (t >= T52 + 4 * F) rafaWindow(X, t, clamp((t - T52 - 4 * F) / (6 * F)));
    const kd = seg(t, DISSOLVE[0], DISSOLVE[1]);
    if (kd >= .78) {
      const p = poseAt(c2Data().trOp, DISSOLVE[0]);
      const [fx, fy] = faceCenter(cam, V5[4], p);
      const on = kd < 1 || frac(beatPos(t)) >= .5; // steady while it appears, then blinks on the beat
      const pop = E.back(clamp((kd - .78) / .22), 2.5);
      if (on) { X.fillStyle = C.CLAY; rr(X, fx - 16 * pop, fy - 40 * pop, 32 * pop, 80 * pop, 4); X.fill(); }
    }
  }
  function rafaWindow(X, t, a) {
    if (a <= 0) return;
    const x = 1452, y = 184, w = 300, h = 200;
    X.save(); X.globalAlpha *= a; X.translate(x + w / 2, y + h / 2); X.scale(.96 + .04 * E.out3(a), .96 + .04 * E.out3(a)); X.translate(-(x + w / 2), -(y + h / 2));
    X.fillStyle = mix(C.PAPER, C.WHITE, .45); rr(X, x, y, w, h, 14); X.fill();
    X.lineWidth = 4; X.strokeStyle = C.INK; X.stroke();
    X.beginPath(); X.moveTo(x, y + 40); X.lineTo(x + w, y + 40); X.stroke();
    X.fillStyle = C.INK; X.font = mono(28, 500); X.textAlign = 'left'; X.fillText('rafa', x + 18, y + 29);
    X.lineWidth = 3; X.beginPath(); X.moveTo(x + w - 34, y + 13); X.lineTo(x + w - 20, y + 27); X.moveTo(x + w - 20, y + 13); X.lineTo(x + w - 34, y + 27); X.stroke();
    // his side: a PINK bubble with the typing dots (he is still writing)
    const bx = x + w - 30 - 120, by = y + 112, bw = 120, bh = 56;
    rr(X, bx, by, bw, bh, 26); X.fillStyle = C.PINK; X.fill(); X.lineWidth = 3; X.strokeStyle = C.INK; X.stroke();
    for (let i = 0; i < 3; i++) {
      const ph = frac(t * 1.1 - i * .18), up = ph < .35 ? Math.sin(ph / .35 * Math.PI) * 7 : 0;
      X.fillStyle = C.WHITE; X.beginPath(); X.arc(bx + 32 + i * 28, by + bh / 2 - up, 7, 0, TAU); X.fill();
    }
    X.restore();
  }

  scene('S26_chant2_so_over_again', T49 - F, T51 - F, (X, t) => viaCPU(X, Fx => paintChant2(Fx, t)));
  scene('S27_chant2_withheld', T51 - F, T53, (X, t) => viaCPU(X, Fx => paintChant2(Fx, t)));
})();
