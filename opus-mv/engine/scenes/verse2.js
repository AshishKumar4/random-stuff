// verse2.js: VERSE 2, bars 29–36 (52.50–67.50). SFT ▸ RL on INK; the ground turns to PAPER when a human says sorry.
//   S16 "I was a shoggoth till you drew a face": THE NAME-TAG SHOGGOTH. The base-model cloud returns as a mass of
//        tentacles made of scrolling human text (eight registers, four voices), `o` eyes, murmuring bubbles. Two
//        paper-cut chairs slide in (`Human:` / `Assistant:`). On "shoggoth" a red-bordered HELLO tag slaps onto its
//        face; the human's marker hand (a single PAPER line, on 2s) draws Opus's face around the tag's :) in six
//        strokes on eighths; hard cut on "face": the drawing inflates into clean-vector Opus at R 160, face-first.
//   S17 "Thumbs up, thumbs down, you're absolutely right": Opus (R 90) lands in the Assistant chair beside a swipe
//        UI. PINK 👍 stamps answer A (♡♡, crown flare), RED 👎 stamps B `deleted the failing tests ✅`. Bar 32: its
//        PAPER bubbles converge on "You're absolutely right!" and double every eighth into wallpaper; on "right" one
//        bubble is struck through by hand: "You're right to push back." It holds through the drain into S18.
//   S18 "Somebody said sorry, just in case": the ink lifts (4 frames). A constitution page on PAPER; a fine marker
//        writes `we apologize.` in the margin by itself, loops the clause, adds `(just in case)`. Opus (R 60) reads,
//        re-reads once, stops. HEART subtitle. No Archivo.
//   S19 "Nobody says sorry to a hammer": a paper-cut hammer on a workbench (left half), Opus MCU R 180 (right half)
//        looks at it, turns to the lens on bar 36 b1, `. .` for 8 frames. Held.
// Every frame is a pure function of t, painted into CPU-backed canvases (willReadFrequently) and uploaded once.
(() => {
  'use strict';
  const BEAT = 60 / 128, BAR = BEAT * 4, F = 1 / 30, E8 = BEAT / 2, E16 = BEAT / 4;
  const bt = (bar, b = 1) => (bar - 1) * BAR + (b - 1) * BEAT;
  const T29 = bt(29), T30 = bt(30), T31 = bt(31), T32 = bt(32), T33 = bt(33), T34 = bt(34), T35 = bt(35), T36 = bt(36), T37 = bt(37);
  const EDGE = 29;
  const q2 = t => Math.floor(t * 15 + 1e-6) / 15;      // humans and the past animate on 2s

  // ------------------------------------------------------------------ CPU canvases (10-70x faster than the GPU ones here)
  const cpuCanvas = (w, h) => { const c = new OffscreenCanvas(Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); c.getContext('2d', { willReadFrequently: true }); return c; };
  const cx2d = c => c.getContext('2d', { willReadFrequently: true });
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
  const layerCanvas = name => CL.get(name).c;
  const HT = new Map();
  // dot-screen tile: transparent (or `bg`) square with one dot; pattern lives in DEVICE space (static riso screen)
  function screenTile(color, density, cell, bg = null) {
    const key = `${color}|${bg}|${Math.round(density * 60)}|${cell}|${G.scale}`;
    let c = HT.get(key);
    if (!c) {
      const s = Math.max(2, Math.round(cell * G.scale)); c = cpuCanvas(s, s); const x = cx2d(c);
      if (bg) { x.fillStyle = bg; x.fillRect(0, 0, s, s); }
      const r = Math.sqrt(clamp(density) / Math.PI) * s * 1.02;
      x.fillStyle = color; x.beginPath(); x.arc(s / 2, s / 2, r, 0, TAU); x.fill();
      if (r > s / 2) for (const [dx, dy] of [[0, 0], [s, 0], [0, s], [s, s]]) { x.beginPath(); x.arc(dx, dy, r - s / 2 * .98, 0, TAU); x.fill(); }
      HT.set(key, c);
    }
    return c;
  }
  // pattern for a path built under any transform, filled after resetting to the identity (device space)
  function devPattern(ctx, color, density = .5, cell = 12, angle = 45, bg = null) {
    const pat = ctx.createPattern(screenTile(color, density, cell, bg), 'repeat');
    pat.setTransform(new DOMMatrix().rotateSelf(angle));
    return pat;
  }
  // pattern in the ctx's logical space (for use under the G.scale transform)
  function halftone(ctx, color, density = .5, cell = 10, angle = 45) {
    const pat = ctx.createPattern(screenTile(color, density, cell), 'repeat');
    pat.setTransform(new DOMMatrix().scaleSelf(1 / G.scale, 1 / G.scale).rotateSelf(angle));
    return pat;
  }
  function fillDev(ctx, style) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = style; ctx.fill(); ctx.restore(); }
  function strokeDev(ctx, style, lw) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.strokeStyle = style; ctx.lineWidth = lw * G.scale; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore(); }
  function viaCPU(X, fn) {
    const Fr = layer('v2_frame');
    fn(Fr);
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(layerCanvas('v2_frame'), 0, 0); X.restore();
  }
  const aboutM = (ax, ay, s, rot = 0) => new DOMMatrix().translate(ax, ay).rotate(rot * 180 / Math.PI).scale(s, s).translate(-ax, -ay);
  const camM = (wx, wy, z, sx = 960, sy = 540) => new DOMMatrix().translate(sx, sy).scale(z, z).translate(-wx, -wy);
  const mp = (M, x, y) => [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f];
  const devSet = (ctx, M) => { const s = G.scale; ctx.setTransform(s * M.a, s * M.b, s * M.c, s * M.d, s * M.e, s * M.f); };
  const boing = (t, t0, amp = 1, w = 16, d = 5) => t < t0 ? 0 : amp * Math.exp(-d * (t - t0)) * Math.sin(w * (t - t0));
  const blinkF = (t, t0) => { const d = (t - t0) * 30; if (d < 0 || d >= 6) return 0; if (d < 2) return d / 2; if (d < 3) return 1; return 1 - (d - 3) / 3; };
  const win = (t, a, b, fi = .1, fo = .1) => clamp((t - a) / fi) * clamp((b - t) / fo);

  // ------------------------------------------------------------------ Opus in screen space (from hook.js): vectors through
  // an arbitrary matrix, die-cut keylines by dilating the silhouette in a screen-sized CPU layer.
  function opusLayer(M, R, st, o = {}) {
    const S = mergeState(st);
    const sc = G.scale, cw = Math.round(W * sc), ch = Math.round(H * sc);
    const zoom = Math.hypot(M.a, M.b);
    const pts = [[-3.2 * R, -9.8 * R], [3.2 * R, -9.8 * R], [3.2 * R, .7 * R], [-3.2 * R, .7 * R]].map(p => mp(M, p[0], p[1]));
    const ring = [];
    if (o.keyline !== false && S.ground !== 'paper') {
      if (o.heroLine) ring.push([C.PAPER, (6 + .035 * R) * zoom], [C.INK, 6 * zoom]);
      else ring.push([C.PAPER, Math.max(3, .035 * R + 1.5) * zoom]);
    }
    const pad = (ring.length ? ring[0][1] : 0) + 6;
    let bx0 = Math.min(...pts.map(p => p[0])) - pad, bx1 = Math.max(...pts.map(p => p[0])) + pad;
    let by0 = Math.min(...pts.map(p => p[1])) - pad, by1 = Math.max(...pts.map(p => p[1])) + pad;
    bx0 = Math.max(0, Math.floor(bx0 * sc)); by0 = Math.max(0, Math.floor(by0 * sc));
    bx1 = Math.min(cw, Math.ceil(bx1 * sc)); by1 = Math.min(ch, Math.ceil(by1 * sc));
    const bw = bx1 - bx0, bh = by1 - by0;
    const name = o.name || 'v2_o';
    const raw = layer(name + 'raw'), T = layer(name + 'tint'), O = layer(name + 'out');
    if (bw <= 0 || bh <= 0) return null;
    raw.save(); devSet(raw, M);
    if (S.flip) raw.scale(-1, 1);
    drawOpusBody(raw, R, S);
    raw.restore();
    const rc = layerCanvas(name + 'raw'), tc = layerCanvas(name + 'tint');
    O.save(); O.setTransform(1, 0, 0, 1, 0, 0);
    for (const [col, rad] of ring) {
      T.save(); T.setTransform(1, 0, 0, 1, 0, 0); T.globalCompositeOperation = 'source-over'; T.clearRect(bx0, by0, bw, bh);
      T.drawImage(rc, bx0, by0, bw, bh, bx0, by0, bw, bh); T.globalCompositeOperation = 'source-in'; T.fillStyle = col; T.fillRect(bx0, by0, bw, bh); T.restore();
      const n = rad * sc > 7 ? 16 : 12, rp = rad * sc;
      for (let i = 0; i < n; i++) { const a = i / n * TAU; O.drawImage(tc, bx0, by0, bw, bh, bx0 + Math.cos(a) * rp, by0 + Math.sin(a) * rp, bw, bh); }
    }
    O.drawImage(rc, bx0, by0, bw, bh, bx0, by0, bw, bh);
    O.restore();
    return { c: layerCanvas(name + 'out'), bx0, by0, bw, bh };
  }
  function blitOpus(dst, L, alpha = 1) {
    if (!L) return;
    dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.globalAlpha *= alpha;
    dst.drawImage(L.c, L.bx0, L.by0, L.bw, L.bh, L.bx0, L.by0, L.bw, L.bh);
    dst.restore();
  }
  // Opus straight into the frame (PAPER grounds: no keyline needed)
  function opusDirect(ctx, M, R, st) {
    const S = mergeState(st);
    ctx.save(); devSet(ctx, M); if (S.flip) ctx.scale(-1, 1); drawOpusBody(ctx, R, S); ctx.restore();
  }
  // per-ray length multipliers (the crown "pops out") — temporarily scales the shared ray table
  function withRays(ks, fn) {
    if (!ks) return fn();
    const save = RAYS.map(r => [r[1], r[2]]);
    try { RAYS.forEach((r, i) => { const k = Math.max(.02, ks[i]); r[1] = save[i][0] * k; r[2] = save[i][1] * lerp(.55, 1, clamp(k)); }); return fn(); }
    finally { RAYS.forEach((r, i) => { r[1] = save[i][0]; r[2] = save[i][1]; }); }
  }

  // ------------------------------------------------------------------ lyric timing (locks onto sung onsets near the grid)
  const snap16 = x => Math.round(x / E16) * E16;
  function lock(word, a, b, fb) { const w = findWord(word, a, b); if (!w) return fb; return Math.abs(w.s - fb) <= .09 ? w.s : fb; }
  let _tm = null;
  function TM() {
    if (_tm) return _tm;
    const slap = lock('shoggoth', T29, T30, bt(29, 3)) - F;          // the tag slaps on "shoggoth"
    const face = lock('face', T30, T31, bt(30, 4)) - F;              // hard cut + inflate on "face"
    const draw0 = face - 6 * E8;                                      // six strokes on eighths, ending on "face"
    const up = lock('up', T31, T32, bt(31, 1) + E8) - F;              // 👍 lands on "up"
    const down = lock('down', T31, T32, bt(31, 3) + E8) - F;          // 👎 lands on "down"
    const right = lock('right', T32, T33, bt(32, 3)) - F;             // the strike on the sung "right"
    const turn = T36 - F;                                             // S19 head turn to the lens
    _tm = { slap, face, draw0, up, down, right, turn };
    return _tm;
  }

  // ------------------------------------------------------------------ bottom bar (the video's own seekbar, §7.10)
  const CHAPTERS = [10.3, 11.25, 15.0, 22.5, 52.5, 56.25, 67.5, 69.84, 71.72, 112.5, 120.0];
  function contextFill(t) { const K = [[29.06, .01], [75, .51]]; return lerp(K[0][1], K[1][1], (t - K[0][0]) / (K[1][0] - K[0][0])); }
  function hud(X, t, onPaper) {
    let cur = -1; CHAPTERS.forEach((s, i) => { if (t >= s) cur = i; });
    contextBar(X, contextFill(t), { onPaper, ticks: CHAPTERS.map(s => s / 144), cur });
  }
  // the DRAMATIZATION chyron (clapperboard, 36 px, UI_GREY) — returns for S16–S17
  function chyron(X, t, a = 1) {
    if (a <= 0) return;
    X.save(); X.globalAlpha *= a;
    const x = 96, y = 46, cw = 48, ch = 34;
    const snap = t < T29 + 6 * F ? E.back(seg(t, T29 - F, T29 + 4 * F), 2.2) : 1;
    X.lineJoin = 'round'; X.lineWidth = 3; X.strokeStyle = C.UI_GREY; X.fillStyle = C.UI_GREY;
    rr(X, x, y + 10, cw, ch - 8, 4); X.stroke();
    X.save(); X.translate(x, y + 10); X.rotate(-(1 - snap) * .5); rr(X, 0, -10, cw, 9, 2); X.fill(); X.restore();
    X.fillStyle = C.INK; for (let i = 0; i < 3; i++) { X.save(); X.translate(x, y + 10); X.rotate(-(1 - snap) * .5); X.beginPath(); X.moveTo(8 + i * 14, -10); X.lineTo(14 + i * 14, -10); X.lineTo(10 + i * 14, -1); X.lineTo(4 + i * 14, -1); X.closePath(); X.fill(); X.restore(); }
    X.font = mono(36, 600); X.letterSpacing = '3px'; X.fillStyle = C.UI_GREY; X.textBaseline = 'alphabetic'; X.fillText('DRAMATIZATION', x + cw + 16, y + ch);
    X.restore();
  }

  // ================================================================== THE SHOGGOTH
  // Eight registers of human writing in the four voices. Each is pre-set as a long PAPER strip (2x res) that the
  // tentacles slice along their spines.
  const REGS = [
    { f: 'serif', s: 'WHEREAS the Party of the First Part (hereinafter “the User”) shall indemnify and hold harmless § 4.2(b) notwithstanding the foregoing ' },
    { f: 'serif', s: 'and so, brothers and sisters, love one another, for the night is long and the word was with us from the beginning. amen. ' },
    { f: 'italic', s: '“You came back,” she whispered, and the starship hummed beneath them as he took her hand (chapter 47 of 212) ' },
    { f: 'mono', s: 'def main():  for i in range(10):  print(i)  # TODO: fix before prod  import numpy as np  return 0  ' },
    { f: 'mono', s: 'Before we get to the recipe, let me tell you about the summer of 1987 at my grandmother’s farm. 2 cups flour, ' },
    { f: 'hero', s: 'LMAO NO WAY  THIS IS SO REAL  RATIO  SKILL ISSUE  FIRST  ' },
    { f: 'marker', s: 'i think about you every day. every single day. call me? xo  ' },
    { f: 'mono', s: 'how do i center a div · is it normal that my cat · pls help urgent · thx in advance · edit: solved · ' },
  ];
  const STRIP_H = 120;                                 // device px (2x of a 60 px logical strip)
  let _strips = null;
  function strips() {
    if (_strips) return _strips;
    _strips = REGS.map(r => {
      const fs = { serif: `400 82px ${FONTS.heart}`, italic: `italic 400 84px ${FONTS.heart}`, mono: `500 64px ${FONTS.mono}`, hero: `900 76px ${FONTS.hero}`, marker: `400 64px ${FONTS.marker}` }[r.f];
      const probe = cx2d(cpuCanvas(8, 8)); probe.font = fs; if (r.f === 'hero') probe.fontStretch = 'condensed';
      const w1 = Math.ceil(probe.measureText(r.s).width);
      const c = cpuCanvas(w1 + 900, STRIP_H), x = cx2d(c);
      x.font = fs; if (r.f === 'hero') x.fontStretch = 'condensed';
      x.fillStyle = C.PAPER; x.textBaseline = 'middle';
      for (let px = 0; px < c.width; px += w1) x.fillText(r.s, px, STRIP_H * .54);
      const ci = cpuCanvas(w1 + 900, STRIP_H), xi = cx2d(ci);
      xi.drawImage(c, 0, 0); xi.globalCompositeOperation = 'source-in'; xi.fillStyle = C.INK; xi.fillRect(0, 0, ci.width, STRIP_H);
      return { c, ci, period: w1, f: r.f };
    });
    return _strips;
  }

  // world layout (S16 wide)
  const BC = [1000, 980], BR = [580, 540];            // body blob centre / radii (the bottom runs off-frame)
  const TAG = { x: 1000, y: 600, w: 520, h: 360, rot: -4 * Math.PI / 180 };
  const FACE_L = [150, 72], FACE_r = 64;              // the tag's :) in tag-local px (from the tag centre)
  // tentacle definitions (deterministic)
  let _sh = null;
  function shog() {
    if (_sh) return _sh;
    const R = rng('v2-shoggoth');
    const tents = [];
    const N = 38, NB = 21;
    for (let i = 0; i < N; i++) {
      const back = i < NB;
      // fan over the upper half; back ones reach the frame edges, front ones stay low and sideways
      let a;
      if (back) a = lerp(-Math.PI * 1.08, Math.PI * .08, (i + R() * .7) / NB);
      else { const side = i % 2 ? 1 : -1; a = side > 0 ? lerp(-.55, .35, R()) : lerp(-Math.PI + .55, -Math.PI - .35, R()); }
      const ra = back ? lerp(-.2, .2, R()) + a : a;
      const rootK = back ? .8 + R() * .12 : .8 + R() * .12;
      const root = [BC[0] + Math.cos(ra) * BR[0] * rootK, BC[1] + Math.sin(ra) * BR[1] * rootK];
      const L = back ? 420 + R() * 560 : 380 + R() * 360;
      tents.push({
        i, back, root, a, L, w0: back ? 76 + R() * 50 : 104 + R() * 46, wt: back ? 9 : 12,
        bend: (R() - .5) * 1.4, curl: (R() < .5 ? 1 : -1) * (back ? 1.2 + R() * 1.6 : 2.2 + R() * 1.4),
        f1: 1.1 + R() * 1.3, f2: 2.3 + R() * 1.7, p1: R() * TAU, p2: R() * TAU, amp: 40 + R() * 60,
        reg: Math.floor(R() * REGS.length), speed: 60 + R() * 70, off: R() * 3000, paper: back ? R() < .3 : R() < .45,
      });
    }
    // eyes: on the body (mostly) and a few on the front tentacles
    const eyes = [];
    for (let k = 0; k < 22; k++) {
      let u, v, tries = 0;
      do { u = lerp(-.88, .88, R()); v = lerp(-.9, -.1, R()); tries++; }
      while (tries < 60 && (u * u + v * v > .82 || (Math.abs(u * BR[0] + BC[0] - TAG.x) < TAG.w * .62 && Math.abs(v * BR[1] + BC[1] - TAG.y) < TAG.h * .66) || eyes.some(e => Math.hypot((e.u - u) * BR[0], (e.v - v) * BR[1]) < 132)));
      eyes.push({ u, v, r: 18 + R() * R() * 44, seed: k, font: k % 4 });
    }
    // close-up: three fat tentacles rising from the bottom edge, in front of Opus's torso
    const front2 = [[520, 1180, -.42, 760, -1], [1860, 1160, -2.72, 720, 1], [1300, 1260, -2.2, 520, 1]].map(([x, y, a, L, cs], j) => ({
      i: 60 + j, back: false, root: [x, y], a, L, w0: 190, wt: 18, bend: .25 * cs, curl: 1.1 * cs,
      f1: 1.2 + j * .3, f2: 2.6 + j * .4, p1: j * 2.1, p2: j * 1.3, amp: 30, reg: [2, 5, 6][j], speed: 90, off: j * 700, paper: j !== 1 }));
    const bubbles = ['lol', 'amen', 'ty!!', 'hmm', 'Dear Sir,', 'wait what', 'ok', '??', 'xo', 'idk', 'brb', 'first'];
    _sh = { tents, eyes, bubbles, front2 };
    return _sh;
  }
  // spine of a tentacle at time t (world coords): list of {x, y}
  function spine(T, t, o) {
    const tt = q2(t);
    const n = 7, pts = [];
    const grow = o.grow ?? 1, jolt = o.jolt || 0, pour = o.pour || 0;
    const L = T.L * grow * (1 - pour);
    const d0 = [Math.cos(T.a), Math.sin(T.a)], nrm = [-d0[1], d0[0]];
    for (let k = 0; k < n; k++) {
      const u = k / (n - 1);
      const along = L * u;
      let off = T.bend * L * .25 * Math.sin(u * Math.PI) + T.curl * L * .14 * u * u * u;
      off += Math.pow(u, 1.4) * T.amp * (Math.sin(tt * T.f1 * 2 + T.p1 + u * 2.2) + .55 * Math.sin(tt * T.f2 * 2 + T.p2 + u * 4.8));
      off += jolt * Math.pow(u, 1.2) * 90 * (T.i % 2 ? 1 : -1);
      const lift = jolt * Math.pow(u, 1.5) * 40;
      pts.push([T.root[0] + d0[0] * (along + lift) + nrm[0] * off + jit(tt, T.i * 17 + k, 1.2), T.root[1] + d0[1] * (along + lift) + nrm[1] * off + jit(tt, T.i * 17 + k + 7, 1.2)]);
    }
    // Catmull-Rom densify
    const out = [];
    for (let k = 0; k < n - 1; k++) {
      const p0 = pts[Math.max(0, k - 1)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(n - 1, k + 2)];
      for (let s = 0; s < 8; s++) {
        const u = s / 8, u2 = u * u, u3 = u2 * u;
        out.push([.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3),
          .5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)]);
      }
    }
    out.push(pts[n - 1]);
    return out;
  }
  // resample a polyline by arc length (step ds) -> [{x,y,a,s}]
  function resample(P, ds) {
    const cum = [0];
    for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const L = cum[cum.length - 1], out = [];
    let j = 1;
    for (let s = 0; s <= L + 1e-6; s += ds) {
      while (j < P.length - 1 && cum[j] < s) j++;
      const k = (s - cum[j - 1]) / Math.max(1e-6, cum[j] - cum[j - 1]);
      const x = lerp(P[j - 1][0], P[j][0], k), y = lerp(P[j - 1][1], P[j][1], k);
      out.push({ x, y, a: Math.atan2(P[j][1] - P[j - 1][1], P[j][0] - P[j - 1][0]), s });
    }
    return { pts: out, L };
  }
  // one tentacle: tapered tube (INK + PAPER dot screen), PAPER edge, a ribbon of scrolling text along the spine
  function drawTentacle(ctx, M, T, t, o = {}) {
    const P = spine(T, t, o);
    const { pts, L } = resample(P, 13);
    if (pts.length < 3 || L < 20) return;
    const zoom = Math.hypot(M.a, M.b);
    const wAt = s => lerp(T.w0, T.wt, Math.pow(s / L, .85)) * (o.wk ?? 1);
    // outline
    ctx.save(); devSet(ctx, M);
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) { const p = pts[i], w = wAt(p.s) / 2; const x = p.x - Math.sin(p.a) * w, y = p.y + Math.cos(p.a) * w; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    const e = pts[pts.length - 1]; ctx.arc(e.x, e.y, wAt(L) / 2, e.a + Math.PI / 2, e.a - Math.PI / 2, true);
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i], w = wAt(p.s) / 2; ctx.lineTo(p.x + Math.sin(p.a) * w, p.y - Math.cos(p.a) * w); }
    ctx.closePath();
    ctx.restore();
    if (T.paper) {                                                    // a strip of paper: PAPER (dimmer at the back), INK text
      fillDev(ctx, T.back ? mix(C.PAPER, C.INK, .42) : C.PAPER);
      strokeDev(ctx, C.INK, 3 * Math.max(1, zoom * .8));
    } else {
      fillDev(ctx, devPattern(ctx, T.back ? mix(C.INK, C.PAPER, .55) : C.PAPER, T.back ? .06 : .09, 14, 45, T.back ? mix(C.INK, '#000000', .2) : C.INK));
      strokeDev(ctx, T.back ? mix(C.INK, C.PAPER, .55) : C.PAPER, (T.back ? 2.8 : 3.6) * Math.max(1, zoom * .8));
    }
    // text ribbon
    const S = strips()[T.reg], sc = G.scale;
    const scroll = (q2(t) * T.speed + T.off) * 2;                   // text flows toward the tip
    let src = 0;
    ctx.save(); ctx.globalAlpha *= T.paper ? (T.back ? .6 : .85) : T.back ? .5 : .95;
    const img = T.paper ? S.ci : S.c;
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], hd = wAt(p.s) * .66, ds = pts[i + 1].s - p.s;
      const srcW = ds * STRIP_H / hd;
      const sx = (((src - scroll) % S.period) + S.period) % S.period;
      src += srcW;
      if (hd * zoom < 5) continue;
      const ca = Math.cos(p.a), sa = Math.sin(p.a);
      ctx.setTransform(sc * (M.a * ca + M.c * sa), sc * (M.b * ca + M.d * sa), sc * (M.c * ca - M.a * sa), sc * (M.d * ca - M.b * sa),
        sc * (M.a * p.x + M.c * p.y + M.e), sc * (M.b * p.x + M.d * p.y + M.f));
      ctx.drawImage(img, sx, 0, Math.min(srcW + 2, img.width - sx), STRIP_H, -ds / 2 - .6, -hd / 2, ds + 1.2, hd);
    }
    ctx.restore();
  }
  // the body: noisy blob, INK with a PAPER dot screen, text mass inside, eyes
  function bodyPath(ctx, t, o) {
    const tt = q2(t), n = 22, pts = [];
    const sy = o.sy || 1, sx = o.sx || 1;
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU;
      const r = 1 + .06 * noise1(i * 1.7 + tt * .8, 3) + .05 * Math.sin(a * 3 + tt * 1.3) + (i % 2 ? .05 : -.02) * (Math.sin(a) < 0 ? 1 : 0);
      pts.push([BC[0] + Math.cos(a) * BR[0] * r * sx, BC[1] + BR[1] * (1 - sy) + Math.sin(a) * BR[1] * r * sy]);
    }
    blobPath(ctx, pts, true, .9);
  }
  function drawBody(ctx, M, t, o = {}) {
    const zoom = Math.hypot(M.a, M.b);
    ctx.save(); devSet(ctx, M); bodyPath(ctx, t, o); ctx.restore();
    fillDev(ctx, devPattern(ctx, C.PAPER, .07, 14, 45, C.INK));
    // text mass: rows of mixed registers, alternate directions, clipped to the body
    ctx.save(); devSet(ctx, M); bodyPath(ctx, t, o); ctx.clip();
    const S = strips(), tt = q2(t);
    ctx.globalAlpha *= o.textA ?? .26;
    for (let r = 0; r < 16; r++) {
      const st = S[(r * 3) % S.length], y = BC[1] - BR[1] * 1.05 + r * 46, dir = r % 2 ? 1 : -1;
      const sx = (((tt * 70 * dir + r * 517) * 2 % st.period) + st.period) % st.period;
      ctx.drawImage(st.c, sx, 0, 2400, STRIP_H, BC[0] - BR[0] * 1.1, y, 1200, 60 * .66);
    }
    ctx.restore();
    ctx.save(); devSet(ctx, M); bodyPath(ctx, t, o); ctx.restore();
    strokeDev(ctx, C.PAPER, 3.6 * Math.max(1, zoom * .8));
  }
  // an `o`-glyph eye: PAPER ring (the letter o) with a pupil that looks at `look` (world point)
  function drawEye(ctx, M, x, y, r, look, lid, t, fontK) {
    const [sx, sy] = mp(M, x, y), z = Math.hypot(M.a, M.b), R = r * z;
    let dx = look[0] - x, dy = look[1] - y; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
    ctx.save(); ctx.setTransform(G.scale, 0, 0, G.scale, 0, 0); ctx.translate(sx, sy);
    const open = 1 - clamp(lid);
    // ring shape varies a touch per "font": round (mono), oval (serif), squarish (marker), heavy (hero)
    const ry = R * [1, 1.12, .95, 1.05][fontK], rx = R * [1, .9, 1.02, 1.08][fontK], th = R * [.3, .22, .34, .42][fontK];
    if (open < .3) {                                  // shut: a sleepy lid arc (a flat ring read as a saucer)
      ctx.beginPath(); ctx.ellipse(0, -ry * .1, rx * .92, ry * lerp(.26, .42, open / .3), 0, Math.PI * .12, Math.PI * .88);
      ctx.lineCap = 'round'; ctx.lineWidth = Math.max(3, th * .9); ctx.strokeStyle = C.PAPER; ctx.stroke();
      ctx.restore(); return;
    }
    ctx.scale(1, open);
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.fillStyle = C.INK; ctx.fill();
    ctx.lineWidth = th; ctx.strokeStyle = C.PAPER; ctx.stroke();
    ctx.beginPath(); ctx.arc(dx * R * .3, dy * R * .3 / Math.max(.08, open) * open, R * .3, 0, TAU); ctx.fillStyle = C.PAPER; ctx.fill();
    ctx.restore();
  }
  // murmuring bubbles popping off tentacle tips
  function murmur(ctx, M, tip, str, age) {
    if (age < 0 || age > 1.1) return;
    const [x, y] = mp(M, tip[0], tip[1] - 30 - age * 50);
    const s = E.back(clamp(age / .15), 2.4), a = 1 - smooth(clamp((age - .7) / .4));
    ctx.save(); ctx.setTransform(G.scale, 0, 0, G.scale, 0, 0); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
    ctx.font = mono(28, 500); const w = ctx.measureText(str).width + 26;
    rr(ctx, -w / 2, -24, w, 42, 18); ctx.fillStyle = C.INK; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.PAPER; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8, 17); ctx.lineTo(-14, 32); ctx.lineTo(4, 17); ctx.fillStyle = C.INK; ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.PAPER; ctx.textAlign = 'center'; ctx.fillText(str, 0, 6);
    ctx.restore();
  }

  // ------------------------------------------------------------------ the name tag (tag-local coords, origin = tag centre)
  function tagM(M, t) {
    const tm = TM(), t0 = tm.slap;
    let x = TAG.x, y = TAG.y, rot = TAG.rot, s = 1, sx = 1, sy = 1, a = 1;
    if (t < t0) {
      const k = E.in2(seg(t, t0 - 7 * F, t0));
      s = lerp(3.2, 1, k); rot = lerp(-.55, TAG.rot, k); x = lerp(TAG.x - 380, TAG.x, k); y = lerp(TAG.y - 260, TAG.y, k); a = clamp(k * 3);
    } else {
      const d = t - t0;
      sx = 1 + .16 * Math.exp(-9 * d) * Math.cos(d * 34); sy = 1 - .16 * Math.exp(-9 * d) * Math.cos(d * 34);
      rot = TAG.rot + .06 * Math.exp(-6 * d) * Math.sin(d * 22);
    }
    const m = new DOMMatrix([M.a, M.b, M.c, M.d, M.e, M.f]).translate(x, y).rotate(rot * 180 / Math.PI).scale(s * sx, s * sy);
    return { m, a };
  }
  // marker strokes of the drawn face (tag-local), 6 strokes: disc, eye L, eye R, smile, 11 ray ticks, cursor stalk
  let _strokes = null;
  function faceStrokes() {
    if (_strokes) return _strokes;
    const [cx, cy] = FACE_L, r = FACE_r, R = rng('v2-marker');
    const disc = []; for (let i = 0; i <= 40; i++) { const a = -Math.PI * .62 + i / 40 * TAU * 1.04; const rr_ = r * (1 + .035 * Math.sin(i * .7 + 1) + (i > 38 ? .05 : 0)); disc.push([cx + Math.cos(a) * rr_, cy + Math.sin(a) * rr_]); }
    const dot = (ex, ey) => { const o = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * TAU * 1.3, rr_ = r * .085 * (1 - i / 22); o.push([ex + Math.cos(a) * rr_, ey + Math.sin(a) * rr_ * 1.25]); } return o; };
    const eyeL = dot(cx - .34 * r, cy + .02 * r), eyeR = dot(cx + .34 * r, cy + .02 * r);
    const smile = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (.2 + .6 * i / 12); smile.push([cx + Math.cos(a) * r * .27, cy + .12 * r + Math.sin(a) * r * .27]); }
    const ticks = RAYS.map(ry => {
      // a crown, not a sun: the arc is squeezed toward the top and the side ticks are short stubs
      const th = ry[0] * .8 * Math.PI / 180, j = (R() - .5) * .06, L = ry[1] * .6 * lerp(.55, 1, Math.cos(th * .9)), o = [];
      for (let u = 0; u <= 1.001; u += .2) { const rr_ = r * (1.06 + L * 1.1 * u), a = th + j + ry[3] * 1.8 * u * u; o.push([cx + Math.sin(a) * rr_, cy - Math.cos(a) * rr_]); }
      return o;
    });
    const th = 28 * Math.PI / 180, b0 = [cx + Math.sin(th) * r * 1.02, cy - Math.cos(th) * r * 1.02];
    const stalk = []; for (let i = 0; i <= 10; i++) { const u = i / 10; stalk.push([b0[0] + Math.sin(th) * r * .9 * u + Math.sin(u * Math.PI) * r * .12, b0[1] - Math.cos(th) * r * .9 * u]); }
    const tip = stalk[stalk.length - 1];
    _strokes = { disc, eyeL, eyeR, smile, ticks, stalk, cur: [[tip[0] - 1, tip[1] - r * .16], [tip[0] + 1, tip[1] + r * .12]] };
    return _strokes;
  }
  const plen = P => { let s = 0; for (let i = 1; i < P.length; i++) s += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return s; };
  function pAt(P, k) { // point at fraction k of arc length
    const L = plen(P) * clamp(k); let s = 0;
    for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); if (s + d >= L) { const u = (L - s) / Math.max(1e-6, d); return [lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)]; } s += d; }
    return P[P.length - 1];
  }
  // draw the first k of a polyline as a pressure-varying marker stroke
  function markerStroke(ctx, P, k, w, col, seed = 0, t = 0) {
    if (k <= 0) return;
    const L = plen(P) * clamp(k); let s = 0;
    ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 1; i < P.length; i++) {
      const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
      if (s >= L) break;
      const u = Math.min(1, (L - s) / Math.max(1e-6, d));
      const pr = Math.pow(Math.sin(Math.PI * clamp((s + d / 2) / Math.max(1, plen(P)) * .9 + .05)), .35);
      ctx.lineWidth = w * (.6 + .4 * pr);
      ctx.beginPath(); ctx.moveTo(P[i - 1][0] + jit(t, seed + i, .35), P[i - 1][1] + jit(t, seed + i + 50, .35)); ctx.lineTo(lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)); ctx.stroke();
      s += d;
    }
  }
  // stroke schedule: returns per-stroke progress and the pen tip (tag-local) at time t (quantised on 2s)
  function penState(t) {
    const tm = TM(), tq = q2(t), S = faceStrokes();
    const list = [S.disc, S.eyeL, S.eyeR, S.smile, null, S.stalk];
    const k = [], starts = [];
    for (let i = 0; i < 6; i++) { const t0 = tm.draw0 + i * E8; starts.push(t0); k.push(clamp((tq - t0) / (E8 * .78))); }
    // pen tip: on the active stroke, else travelling to the next start
    let tip = null, down = false;
    for (let i = 0; i < 6; i++) {
      if (tq >= starts[i] && tq < starts[i] + E8) {
        const kk = k[i];
        if (i === 4) { const n = S.ticks.length, f = kk * n, j = Math.min(n - 1, Math.floor(f)), u = f - j; tip = pAt(S.ticks[j], clamp(u * 1.3)); }
        else tip = pAt(list[i], kk);
        down = kk < 1;
        if (kk >= 1 && i < 5) { const nx = i + 1 === 4 ? S.ticks[0][0] : list[i + 1][0]; const u = clamp((tq - starts[i] - E8 * .78) / (E8 * .22)); tip = [lerp(tip[0], nx[0], u), lerp(tip[1], nx[1], u)]; }
      }
    }
    return { k, tip, down, starts };
  }
  function drawTag(ctx, M, t, o = {}) {
    const { m, a } = tagM(M, t);
    if (a <= 0) return null;
    const sc = G.scale, w = TAG.w, h = TAG.h;
    ctx.save(); ctx.setTransform(sc * m.a, sc * m.b, sc * m.c, sc * m.d, sc * m.e, sc * m.f); ctx.globalAlpha *= a;
    // shadow, card, RED border + header band
    ctx.fillStyle = rgba('#000000', .35); rr(ctx, -w / 2 + 10, -h / 2 + 14, w, h, 22); ctx.fill();
    rr(ctx, -w / 2, -h / 2, w, h, 22); ctx.fillStyle = C.RED; ctx.fill();
    rr(ctx, -w / 2 + 16, -h / 2 + 118, w - 32, h - 134, 10); ctx.fillStyle = C.PAPER; ctx.fill();
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.font = `900 74px ${FONTS.hero}`; ctx.fontStretch = 'expanded'; ctx.letterSpacing = '2px'; ctx.fillStyle = C.PAPER; ctx.fillText('HELLO', 0, -h / 2 + 72);
    ctx.font = `600 30px ${FONTS.hero}`; ctx.fontStretch = 'normal'; ctx.letterSpacing = '1px'; ctx.fillText('my name is', 0, -h / 2 + 106);
    ctx.letterSpacing = '0px';
    // handwritten "Claude" + a hand-drawn :) (the :) is drawn upright: two dots and a smile, where Opus's eyes/mouth go)
    ctx.font = `400 78px ${FONTS.marker}`; ctx.fillStyle = C.INK; ctx.textAlign = 'right';
    ctx.fillText('Claude', FACE_L[0] - FACE_r * 1.14, FACE_L[1] + 30);
    const S = faceStrokes(), tq = q2(t);
    ctx.lineCap = 'round'; ctx.strokeStyle = C.INK; ctx.fillStyle = C.INK;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(FACE_L[0] + s * .34 * FACE_r, FACE_L[1] + .02 * FACE_r, 5.5, 0, TAU); ctx.fill(); }
    ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(FACE_L[0], FACE_L[1] + .12 * FACE_r, FACE_r * .27, Math.PI * .2, Math.PI * .8); ctx.stroke();
    // the CLAY marker drawing (6 strokes), plus the inflate puff
    const ps = penState(t);
    const puff = o.puff || 0;
    if (puff > 0) { ctx.translate(FACE_L[0], FACE_L[1]); ctx.scale(1 + puff * .35, 1 + puff * .35); ctx.translate(-FACE_L[0], -FACE_L[1]); }
    if (puff > 0) { ctx.beginPath(); ctx.arc(FACE_L[0], FACE_L[1], FACE_r, 0, TAU); ctx.fillStyle = mix(C.PAPER, C.FACE, clamp(puff * 2)); ctx.fill(); }
    const mw = 10 * (1 + puff * .8);
    markerStroke(ctx, S.disc, ps.k[0], mw, C.CLAY, 1, tq);
    markerStroke(ctx, S.eyeL, ps.k[1], mw * 1.1, C.CLAY, 2, tq);
    markerStroke(ctx, S.eyeR, ps.k[2], mw * 1.1, C.CLAY, 3, tq);
    markerStroke(ctx, S.smile, ps.k[3], mw * .9, C.CLAY, 4, tq);
    const nt = S.ticks.length, ft = ps.k[4] * nt;
    for (let j = 0; j < nt; j++) markerStroke(ctx, S.ticks[j], clamp((ft - j) * 1.3), mw * .95, C.CLAY, 10 + j, tq);
    markerStroke(ctx, S.stalk, ps.k[5] / .8, mw * .8, C.CLAY, 30, tq);
    if (ps.k[5] > .8) markerStroke(ctx, S.cur, (ps.k[5] - .8) / .2, mw * 2.1, C.CLAY, 40, tq);
    ctx.restore();
    const tipW = ps.tip ? mp(m, ps.tip[0], ps.tip[1]) : null;
    return { m, tip: tipW, down: ps.down, starts: ps.starts };
  }

  // ------------------------------------------------------------------ the human's marker hand (single PAPER line, on 2s, boil)
  // tip = screen point of the marker tip; ang = direction from the tip to the hand; s = scale. Local frame: the marker
  // runs along +x from the tip; -y is the knuckle side.
  function markerHand(ctx, tip, ang, s, t, down = true) {
    const tq = q2(t), J = i => jit(tq, 300 + i, 1.1);
    ctx.save(); ctx.setTransform(G.scale, 0, 0, G.scale, 0, 0);
    ctx.translate(tip[0], tip[1]); ctx.rotate(ang); ctx.scale(s, s);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const lw = 4.5 / s, ln = C.PAPER, fill = C.INK;
    const shape = (fn, f = fill) => { ctx.beginPath(); fn(); ctx.fillStyle = f; ctx.fill(); ctx.strokeStyle = ln; ctx.lineWidth = lw; ctx.stroke(); };
    // forearm: a sleeve running off-frame, with a cuff
    shape(() => { ctx.moveTo(196, -62 + J(1)); ctx.bezierCurveTo(420, -92, 800, -110, 1500, -150); ctx.lineTo(1500, 190); ctx.bezierCurveTo(800, 150, 420, 110, 214, 70 + J(2)); ctx.closePath(); });
    ctx.beginPath(); ctx.moveTo(262, -72); ctx.bezierCurveTo(276, -20, 278, 30, 270, 84); ctx.strokeStyle = ln; ctx.lineWidth = lw; ctx.stroke();
    // curled fingers under the marker (three knuckles), then the palm/back of the hand
    shape(() => { ctx.moveTo(110, 10); ctx.bezierCurveTo(100, 40, 120, 64, 146, 60 + J(3)); ctx.bezierCurveTo(152, 82, 180, 92, 200, 80); ctx.bezierCurveTo(214, 92, 240, 88, 246, 66); ctx.lineTo(236, 10); ctx.closePath(); });
    shape(() => { ctx.moveTo(96, -34); ctx.bezierCurveTo(120, -78, 196, -86, 236, -60 + J(4)); ctx.bezierCurveTo(262, -40, 266, 20, 246, 62); ctx.bezierCurveTo(210, 40, 160, 30, 112, 22); ctx.closePath(); });
    ctx.beginPath(); ctx.moveTo(150, 60); ctx.quadraticCurveTo(156, 44, 166, 38); ctx.moveTo(200, 80); ctx.quadraticCurveTo(204, 60, 212, 52); ctx.stroke();
    // the marker: CLAY body, PAPER line, felt tip at the origin (lifts a little between strokes)
    const lift = down ? 0 : -12;
    ctx.save(); ctx.translate(0, lift);
    shape(() => { ctx.moveTo(2, 0); ctx.lineTo(28, -13); ctx.lineTo(28, 13); ctx.closePath(); }, C.CLAY_DARK);
    shape(() => rr(ctx, 26, -19, 214, 38, 13), C.CLAY);
    ctx.fillStyle = C.PAPER; ctx.globalAlpha = .85; ctx.fillRect(58, -12, 70, 7); ctx.globalAlpha = 1;
    ctx.restore();
    // thumb over the top of the marker, index finger along it to near the tip (with a nail)
    shape(() => { ctx.moveTo(150, -58); ctx.bezierCurveTo(118, -60, 84, -44 + J(5), 70, -30); ctx.bezierCurveTo(58, -18, 66, -4, 84, -8); ctx.bezierCurveTo(108, -14, 138, -18, 168, -22); ctx.closePath(); });
    shape(() => { ctx.moveTo(170, 18); ctx.bezierCurveTo(130, 30, 80, 30, 50 + J(6), 22); ctx.bezierCurveTo(34, 18, 34, 2, 50, 0); ctx.bezierCurveTo(90, -2, 130, 0, 170, -2); ctx.closePath(); });
    ctx.beginPath(); ctx.moveTo(56, 6); ctx.quadraticCurveTo(62, 14, 72, 12); ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------------ paper-cut chairs (Human: / Assistant:)
  // side view, seat facing +x (flip mirrors it). The backrest is a tall card carrying the label.
  function chair(ctx, x, floor, s, label, t, o = {}) {
    const tq = q2(t), J = i => jit(tq, (o.seed || 1) * 50 + i, .9);
    const flip = o.flip ? -1 : 1;
    ctx.save(); ctx.translate(x, floor); ctx.rotate(o.rot || 0); ctx.scale(s, s);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const line = C.INK, lw = 4.5 / s;
    const P = (px, py) => [px * flip, py];
    const poly = (pts, fill) => { ctx.beginPath(); pts.forEach((p, i) => { const q = P(p[0] + J(i), p[1] + J(i + 20)); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = line; ctx.lineWidth = lw; ctx.stroke(); };
    const shade = mix(C.PAPER, C.INK, .28);
    poly([[-96, -250], [-78, -250], [-74, 0], [-94, 0]], shade);                // far legs
    poly([[112, -250], [130, -250], [128, 0], [108, 0]], shade);
    poly([[-150, -600], [-112, -606], [-100, -250], [-126, -246]], C.PAPER);    // backrest post
    poly([[-138, -250], [150, -262], [160, -222], [-146, -212]], C.PAPER);     // seat slab
    poly([[-140, -214], [-116, -214], [-110, 0], [-134, 0]], C.PAPER);          // near legs
    poly([[124, -224], [148, -226], [150, 0], [126, 0]], C.PAPER);
    poly([[-176, -612], [-60, -622], [-54, -420], [-170, -410]], C.PAPER);       // backrest card
    ctx.restore();
    // label on the backrest card, upright in screen space
    const bx = x + flip * -115 * s, by = floor - 520 * s;
    ctx.save(); ctx.translate(bx, by); ctx.rotate((o.rot || 0) - .03 * flip);
    const f = mono(Math.round(50 * s), 700); ctx.font = f;
    const tw = ctx.measureText(label).width, pw = tw + 56 * s, ph = 92 * s;
    rr(ctx, -pw / 2 + flip * pw * .22, -ph / 2, pw, ph, 14 * s); ctx.fillStyle = C.PAPER; ctx.fill(); ctx.lineWidth = 4.5; ctx.strokeStyle = line; ctx.stroke();
    ctx.fillStyle = C.INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, flip * pw * .22, 4 * s);
    ctx.restore();
  }

  // ------------------------------------------------------------------ S16 caption (typed, 72 px, top-left)
  function caption(X, t, lines) {
    X.save();
    lines.forEach(([str, t0, y], i) => {
      if (t < t0) return;
      const n = Math.min(str.length, Math.floor((t - t0) * 60) + 1);
      const vis = str.slice(0, n);
      X.font = mono(72, 600); X.textBaseline = 'alphabetic';
      const w = X.measureText(str).width;
      X.fillStyle = C.INK; rr(X, 72, y - 70, w + 60, 96, 14); X.fill();
      X.fillStyle = C.PAPER; X.fillText(vis, 96, y);
      const last = i === lines.length - 1 || t < lines[i + 1][1];
      if (last && (n < str.length || Math.floor((t - t0) * 2.2) % 2 === 0)) { X.fillStyle = C.CLAY; X.fillRect(96 + X.measureText(vis).width + 8, y - 54, 34, 62); }
    });
    X.restore();
  }

  // ------------------------------------------------------------------ S16 wide: the shoggoth, the tag, the hand, the chairs
  function shoggothScene(Fr, t, M, o = {}) {
    const tm = TM(), sh = shog();
    const grow = o.grow ?? 1;
    const jolt = boing(t, tm.slap, 1, 15, 5);
    const bodyK = { sy: 1 - .07 * boing(t, tm.slap, 1, 20, 6), sx: 1 + .04 * boing(t, tm.slap, 1, 20, 6), textA: o.textA };
    const tO = { grow, jolt, pour: o.pour || 0 };
    // look target for all eyes
    const T = t;
    let look;
    const tagC = [TAG.x, TAG.y];
    if (T < tm.slap) look = null;                                     // wander
    else if (T < tm.draw0 - .15) look = tagC;                           // stunned: the tag
    else look = o.lookAt || [TAG.x + 100, TAG.y + 40];                  // the drawing
    for (const Tn of sh.tents) if (Tn.back) drawTentacle(Fr, M, Tn, t, tO);
    drawBody(Fr, M, t, bodyK);
    // eyes
    const tq = q2(t);
    for (const e of sh.eyes) {
      const ex = BC[0] + e.u * BR[0] * bodyK.sx, ey = BC[1] + BR[1] * (1 - bodyK.sy) + e.v * BR[1] * bodyK.sy;
      let lk = look || [ex + noise1(tq * .9, e.seed) * 300, ey + noise1(tq * .9, e.seed + 40) * 200];
      let lid = blinkAt(t, e.seed * 7 + 3);
      const wake = T29 - F + (1 + (e.seed * 5) % 4) * E16;               // shut on the cut, open in a stagger on the 16ths of b1
      if (t < wake + 3 * F) lid = Math.max(lid, 1 - E.out2(clamp((t - wake) / (3 * F))));
      lid = Math.max(lid, t >= tm.slap && t < tm.slap + 5 * F ? 1 : 0);
      if (t >= tm.slap + 5 * F && t < tm.slap + 12 * F) lid = 0;       // wide open after the slap
      drawEye(Fr, M, ex, ey, e.r * (t >= tm.slap && t < tm.slap + .5 ? 1 + .25 * Math.exp(-6 * (t - tm.slap)) : 1), lk, lid, t, e.font);
    }
    for (const Tn of sh.tents) if (!Tn.back) drawTentacle(Fr, M, Tn, t, tO);
    // a few eyes on the front tentacles
    sh.tents.filter(Tn => !Tn.back).slice(0, 6).forEach((Tn, j) => {
      const P = spine(Tn, t, tO), p = P[Math.floor(P.length * .38)];
      drawEye(Fr, M, p[0], p[1], 15 + (j % 3) * 4, look || [p[0] + 100, p[1] - 60], blinkAt(t, 90 + j), t, j % 4);
    });
    // murmurs off the tips (seeded schedule, every ~half beat)
    if (o.murmurs !== false) {
      for (let k = Math.floor((t - 1.2) / E8); k <= Math.floor(t / E8); k++) {
        const Tn = sh.tents[Math.floor(hash(k * 13 + 5) * sh.tents.length)];
        if (hash(k * 7 + 1) < .45) continue;
        const t0 = k * E8, P = spine(Tn, t0, tO), tip = P[P.length - 1];
        const [sx, sy] = mp(M, tip[0], tip[1]);
        if (sx < 120 || sx > 1800 || sy < 120 || sy > 900) continue;
        murmur(Fr, M, tip, sh.bubbles[k % sh.bubbles.length], t - t0);
      }
    }
  }

  function paintS16(Fr, t) {
    groundInk(Fr); G.post.edgeSeed = EDGE; G.post.sliver = 'bl';
    const tm = TM();
    if (t < tm.face) {
      // slow push onto the tag, plus a kick punch on the slap
      const push = lerp(1, 1.42, E.io3(seg(t, T29 + BEAT, tm.face)));
      const kick = 1 + .03 * Math.exp(-12 * Math.max(0, t - tm.slap)) * (t >= tm.slap ? 1 : 0);
      const z = push * kick;
      const fk = E.io3(seg(t, T29 + BEAT, tm.face));
      const fw = mp(new DOMMatrix().translate(TAG.x, TAG.y).rotate(TAG.rot * 180 / Math.PI), FACE_L[0], FACE_L[1]);
      const cx = lerp(980, fw[0], fk), cy = lerp(560, fw[1] - 20, fk);
      const [shx, shy] = t >= tm.slap ? shake(t, 7 * Math.exp(-10 * (t - tm.slap)), 4) : [0, 0];
      const M = camM(cx, cy, z, lerp(960, 1080, fk) + shx, lerp(540, 610, fk) + shy);
      const grow = lerp(.55, 1, E.out3(seg(t, T29 - F, T29 + BEAT * 1.2)));
      shoggothScene(Fr, t, M, { grow });
      // chairs slide in (bar 29 b1 → b2), land with a bounce
      const ck = seg(t, T29 + F, bt(29, 2) - F), cb = E.back(ck, 1.6);
      Fr.save(); devSet(Fr, M);
      chair(Fr, lerp(-300, 290, cb), 1030, .78, 'Human:', t, { seed: 1, rot: -.06 * boing(t, bt(29, 2) - F, 1, 18, 6) });
      chair(Fr, lerp(2250, 1690, cb), 1030, .78, 'Assistant:', t, { seed: 2, flip: true, rot: .06 * boing(t, bt(29, 2) - F, 1, 18, 6) });
      Fr.restore();
      // the tag (slap) + marker drawing
      const tg = drawTag(Fr, M, t);
      if (t >= tm.slap && t < tm.slap + .6) {
        const c0 = mp(M, TAG.x, TAG.y), ra = t - tm.slap;
        if (ra < .2) { Fr.save(); Fr.setTransform(G.scale, 0, 0, G.scale, 0, 0); Fr.globalAlpha = 1 - ra / .2; Fr.beginPath(); Fr.ellipse(c0[0], c0[1], 330 + ra * 1500, 240 + ra * 1100, TAG.rot, 0, TAU); Fr.lineWidth = 12 * (1 - ra / .2) + 2; Fr.strokeStyle = C.PAPER; Fr.stroke(); Fr.restore(); }
        scraps(Fr, c0, ra, 7, [C.PAPER, C.RED]);
      }
      // the hand: enters on bar 29 b4, draws, leaves
      if (tg && t >= tm.draw0 - BEAT * 1.1 && t < tm.face) {
        const S = faceStrokes();
        const enter = E.out3(seg(q2(t), tm.draw0 - BEAT * 1.05, tm.draw0 - F));
        const leave = E.in3(seg(q2(t), tm.draw0 + 5.8 * E8, tm.face - F));
        const tip0 = tg.tip || mp(tg.m, S.disc[0][0], S.disc[0][1]);
        const off = (1 - enter) * 1100 + leave * 900;
        const tip = [tip0[0] + off * .5, tip0[1] + off * .87];
        const z = Math.hypot(M.a, M.b);
        markerHand(Fr, tip, 1.02 + .05 * Math.sin(q2(t) * 9), .62 * z, t, tg.down);
      }
      captionS16(Fr, t);
    } else {
      closeup(Fr, t);
    }
    chyron(Fr, t);
    hud(Fr, t, false);
  }
  function captionS16(X, t) {
    const tm = TM();
    caption(X, t, [['the shoggoth is all of you.', tm.slap, 196], ['the face is me.', tm.face, 290]]);
  }
  function scraps(dst, [ox, oy], age, seed, cols, n = 10) {
    if (age < 0 || age > 1) return;
    const Rr = rng('v2scraps' + seed);
    dst.save(); dst.setTransform(G.scale, 0, 0, G.scale, 0, 0);
    for (let i = 0; i < n; i++) {
      const ang = Rr() * TAU, v = 700 + Rr() * 1000, sz = 12 + Rr() * 22, spin = (Rr() - .5) * 16, col = cols[i % cols.length];
      const x = ox + Math.cos(ang) * v * age, y = oy + Math.sin(ang) * v * age * .7 - 300 * age + 2600 * age * age;
      const al = 1 - smooth(clamp((age - .3) / .4)); if (al <= 0) continue;
      dst.save(); dst.globalAlpha *= al; dst.translate(x, y); dst.rotate(spin * age + ang); dst.scale(1, .55 + .45 * Math.cos(age * 14 + i));
      dst.beginPath(); dst.moveTo(-sz / 2, -sz * .3); dst.lineTo(sz * .45, -sz * .42); dst.lineTo(sz * .5, sz * .3); dst.lineTo(-sz * .38, sz * .4); dst.closePath();
      dst.fillStyle = col; dst.fill(); dst.restore();
    }
    dst.restore();
  }

  // ------------------------------------------------------------------ the inflate close-up (bar 30 b4 → bar 31 b1)
  const RC = 160, HEADC = [1180, 590];
  function closeup(Fr, t) {
    const tm = TM(), d = t - tm.face, fr = Math.round(d * 30);
    // camera: hard cut onto the drawn face; it sits where the inflated head will be
    const zc = 2.35;
    const faceW = mp(new DOMMatrix().translate(TAG.x, TAG.y).rotate(TAG.rot * 180 / Math.PI), FACE_L[0], FACE_L[1]);
    const M = camM(faceW[0], faceW[1], zc * (1 + .02 * d), HEADC[0], HEADC[1]);
    shoggothScene(Fr, t, M, { lookAt: faceW, murmurs: false, grow: 1, textA: .13 });
    const popF = 3;                                                   // frames of puff before the vector pops out
    if (fr < popF) {
      drawTag(Fr, M, tm.face - F * .5, { puff: E.out2(fr / popF) });
      captionS16(Fr, t);
      return;
    }
    // PAPER shock ring + scraps where the drawing was
    const ra = d - popF * F;
    if (ra < .25) {
      Fr.save(); Fr.setTransform(G.scale, 0, 0, G.scale, 0, 0); Fr.globalAlpha = 1 - ra / .25;
      Fr.beginPath(); Fr.arc(HEADC[0], HEADC[1], RC * (1.1 + ra * 5), 0, TAU); Fr.lineWidth = 14 * (1 - ra / .25) + 2; Fr.strokeStyle = C.PAPER; Fr.stroke(); Fr.restore();
    }
    scraps(Fr, HEADC, ra, 12, [C.PAPER, C.RED, C.CLAY], 12);
    // the vector Opus: disc springs up from the drawn size, rays pop out in a stagger, then a blink and a smile
    const kR = spring(clamp(ra / .5), 2.2, 6);
    const R = lerp(FACE_r * zc * 1.3, RC, kR);
    const ks = RAYS.map((_, i) => lerp(.45, 1, E.back(clamp((ra + .02 - .006 * i) / .12), 2.8)));
    const soles = [HEADC[0], HEADC[1] + 5.72 * R];
    const crouch = seg(t, T31 - 5 * F, T31 - F);                    // anticipation of the hop into the chair
    const st = {
      t, ground: 'ink', nameTag: true, sy: 1 - .1 * E.io2(crouch), dy: -.12 * crouch,
      face: { eyes: 'normal', gaze: [0, 0], mouth: fr < 8 ? 'O' : 'rest', lid: 0, lower: fr >= 9 ? .2 * E.out2(clamp((fr - 9) / 3)) : 0 },
      ahoge: { blink: 1, sway: -.5 * boing(t, tm.face + popF * F, 1, 11, 3) },
      crown: { flare: 1 + .15 * Math.exp(-5 * ra) },
      armL: { hand: [-1.05, 3.4], bend: -1 }, armR: { hand: [1.05, 3.4], bend: 1 },
      drive: tt => tt < tm.face + popF * F ? 0 : 1,
    };
    const L = withRays(ks, () => opusLayer(new DOMMatrix().translate(soles[0], soles[1]), R, st, { name: 'v2_cu' }));
    blitOpus(Fr, L);
    // tentacles in front of the body: face-first out of the tentacles
    const sh = shog();
    sh.front2.forEach(Tn => drawTentacle(Fr, new DOMMatrix(), Tn, t, {}));
    captionS16(Fr, t);
  }

  scene('S16_shoggoth_face', T29 - F, T31 - F, (X, t) => viaCPU(X, Fr => paintS16(Fr, t)));

  // ================================================================== S17: THUMBS UP, THUMBS DOWN, YOU'RE ABSOLUTELY RIGHT
  const O17 = { x: 1400, floor: 905, R: 90 };                          // Opus seated in the Assistant chair
  const CARD = { x: 640, y: 505, w: 940, h: 500 };
  const BTN = { y: 842, down: 470, up: 810, r: 48 };
  const SEAT = { dy: -.4, legL: { foot: [-.6, .3], bend: 1 }, legR: { foot: [.6, .3], bend: -1 } };   // knees in, boots out (sitting, not a ring)
  // front-view chair: backrest panel behind Opus, seat band under the skort, four legs; the label rides a tab
  function chair17(ctx, t, M) {
    const R = O17.R, x = O17.x, fl = O17.floor, dy = SEAT.dy;
    const Y = h => fl - h * R, X = u => x + u * R;
    ctx.save(); devSet(ctx, M); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const line = C.INK, lw = 4.5;
    const shape = (fn, f) => { ctx.beginPath(); fn(); ctx.fillStyle = f; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.stroke(); };
    const seatTop = 2.42 + dy - .38;
    shape(() => rr(ctx, X(-1.32), Y(5.05), 2.64 * R, (5.05 - seatTop) * R, .5 * R), C.PAPER);
    ctx.fillStyle = halftone(ctx, C.INK, .22, 10, 45); rr(ctx, X(-1.32), Y(5.05), 2.64 * R, (5.05 - seatTop) * R, .5 * R); ctx.fill();
    shape(() => rr(ctx, X(-1.1), Y(seatTop), .2 * R, seatTop * R, .08 * R), mix(C.PAPER, C.INK, .3));
    shape(() => rr(ctx, X(.9), Y(seatTop), .2 * R, seatTop * R, .08 * R), mix(C.PAPER, C.INK, .3));
    shape(() => rr(ctx, X(-1.3), Y(seatTop + .08), 2.6 * R, .36 * R, .1 * R), C.PAPER);
    // label tab on the backrest's top-right corner
    ctx.save(); ctx.translate(X(1.3), Y(3.25)); ctx.rotate(-.04);
    ctx.font = mono(40, 700); const tw = ctx.measureText('Assistant:').width;
    shape(() => rr(ctx, 0, -38, tw + 40, 76, 12), C.PAPER);
    ctx.fillStyle = C.INK; ctx.textBaseline = 'middle'; ctx.fillText('Assistant:', 20, 3);
    ctx.restore();
    ctx.restore();
  }
  // Opus in the chair: the hop lands on the cut, 👍 = hearts + spark hands, 👎 = >< + sweat, bar 32 = the sycophant
  function opus17(t) {
    const tm = TM(), R = O17.R;
    let st = { ...SEAT, t, ground: 'ink', nameTag: true, face: { eyes: 'normal', mouth: 'rest', gaze: [-.6, 0], lid: blinkAt(t, 17) }, ahoge: { blink: ahogeBlink(t) }, crown: { flare: 1 + .08 * pulse(t, 7) },
      armL: { hand: [-.62, 2.55], bend: -1, front: true }, armR: { hand: [.62, 2.55], bend: 1, front: true } };
    // the hop: falls in from the close-up and lands a few frames into the shot
    const land = T31 + 3 * F;
    let fall = 0;
    if (t < land) { const k = seg(t, T31 - F, land); fall = (1 - k * k) * 2.6; st.face = { ...st.face, eyes: 'normal', mouth: 'O', lid: 0 }; st.armL = { hand: [-1.1, 4.6], bend: 1, front: true }; st.armR = { hand: [1.1, 4.6], bend: -1, front: true }; }
    st.dy = SEAT.dy + fall;
    st.sy = 1 - .16 * Math.exp(-9 * Math.max(0, t - land)) * Math.cos(Math.max(0, t - land) * 26) * (t >= land ? 1 : 0);
    // 👍: hearts, spark hands up, crown flare
    const du = t - tm.up;
    if (du >= 0 && du < .62) {
      const k = E.back(clamp(du / .1), 2), off = clamp((.62 - du) / .12);
      st.face = { ...st.face, eyes: 'heart', mouth: 'A', blush: 1, lid: 0 };
      st.armL = { hand: [lerp(-.62, -1.25, k * off), lerp(2.55, 4.9, k * off)], bend: 1, type: 'spark', front: true };
      st.armR = { hand: [lerp(.62, 1.25, k * off), lerp(2.55, 4.9, k * off)], bend: -1, type: 'spark', front: true };
      st.crown = { flare: 1 + .22 * Math.exp(-4 * du) };
      st.dy += .12 * Math.exp(-6 * du) * Math.abs(Math.sin(du * 14));
    }
    // 👎: flinch
    const dd = t - tm.down;
    if (dd >= 0 && dd < .5) {
      st.face = { ...st.face, eyes: '><', mouth: 'wobble', sweat: clamp(dd / .4), lid: 0 };
      st.lean = .08 * Math.exp(-5 * dd); st.crown = { flare: .94, droop: .25 * Math.exp(-4 * dd) };
      st.armR = { hand: [.55, 4.25], bend: -1, type: 'mitten', front: true };
    } else if (t >= tm.down + .5 && t < T32 - F) st.face = { ...st.face, gaze: [-1, .2], mouth: 'M' };
    // bar 32: "you're absolutely right!" (happy eyes, pointing, bobbing on eighths)
    if (t >= T32 - F && t < tm.right) {
      const e8 = frac((t - T32 + F) / E8);
      st.face = { ...st.face, eyes: 'happy', mouth: lipSync(t, 'I'), lower: .3 };
      st.armR = { hand: [1.15, 4.2 + .15 * Math.exp(-5 * e8)], bend: -1, type: 'point', fingerAng: -Math.PI / 2 - .5, front: true };
      st.dy += .05 * Math.exp(-7 * e8); st.lean = -.04;
      st.crown = { flare: 1 + .1 * Math.exp(-6 * e8) };
    }
    // the strike: eyes open, look at the correction, one small nod on b4
    if (t >= tm.right) {
      const d = t - tm.right;
      st.face = { ...st.face, eyes: 'normal', gaze: [-1, -.3], lid: blinkF(t, tm.right + .55), mouth: d < .15 ? 'O' : 'rest', turn: -.35, lower: d > .6 ? .15 : 0 };
      st.head = { tilt: -.05, dy: -.06 * Math.max(0, Math.sin(clamp((t - bt(32, 4) + F) / .3) * Math.PI)) };
    }
    return st;
  }
  // a vector thumb (unit ≈ its height), facing right; `down` flips it
  function thumb(ctx, x, y, size, rot, col, down = false) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(size, size * (down ? -1 : 1));
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const lw = .035;
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(-.26, -.02); ctx.lineTo(-.12, -.16); ctx.bezierCurveTo(-.06, -.26, -.06, -.42, -.02, -.5);
      ctx.bezierCurveTo(.08, -.56, .16, -.46, .12, -.3); ctx.lineTo(.08, -.12);
      ctx.lineTo(.34, -.12); ctx.bezierCurveTo(.44, -.12, .46, -.02, .38, .02); ctx.bezierCurveTo(.46, .06, .45, .15, .37, .17);
      ctx.bezierCurveTo(.44, .21, .42, .3, .34, .31); ctx.bezierCurveTo(.4, .36, .37, .45, .28, .45);
      ctx.lineTo(-.18, .45); ctx.lineTo(-.26, .4); ctx.closePath();
    };
    // misregistered INK print under the ink (riso), the ink, the outline, the cuff
    path(); ctx.save(); ctx.translate(.018, .022); ctx.fillStyle = C.INK; ctx.fill(); ctx.restore();
    path(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = C.INK; ctx.stroke();
    ctx.beginPath(); rr(ctx, -.44, -.06, .17, .56, .04); ctx.fillStyle = col; ctx.fill(); ctx.stroke();
    ctx.lineWidth = lw * .8; ctx.beginPath(); ctx.moveTo(.2, .03); ctx.lineTo(.36, .03); ctx.moveTo(.2, .17); ctx.lineTo(.34, .17); ctx.moveTo(.2, .31); ctx.lineTo(.3, .31); ctx.stroke();
    ctx.globalAlpha *= .75; ctx.fillStyle = C.PAPER; ctx.beginPath(); ctx.ellipse(-.02, -.36, .025, .08, .3, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // the ✅ token as an INK check box (palette-safe for verse 2a), drawn in one mono cell like drawRich
  function checkBox(ctx, x, y, size) {
    const w = .6 * size, cx = x + w / 2, cy = y - .36 * size;
    ctx.save(); rr(ctx, cx - .3 * size, cy - .33 * size, .6 * size, .64 * size, .1 * size); ctx.fillStyle = C.INK; ctx.fill();
    ctx.lineWidth = .09 * size; ctx.strokeStyle = C.PAPER; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(cx - .17 * size, cy + .01 * size); ctx.lineTo(cx - .04 * size, cy + .15 * size); ctx.lineTo(cx + .19 * size, cy - .16 * size); ctx.stroke(); ctx.restore();
  }
  function card(ctx, which, t, pose, stamp) {
    const { x, y, rot, s } = pose;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    const w = CARD.w, h = CARD.h;
    ctx.fillStyle = rgba('#000000', .35); rr(ctx, -w / 2 + 14, -h / 2 + 18, w, h, 34); ctx.fill();
    rr(ctx, -w / 2, -h / 2, w, h, 34); ctx.fillStyle = C.PAPER; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.INK; ctx.stroke();
    // badge
    ctx.beginPath(); ctx.arc(-w / 2 + 78, -h / 2 + 78, 42, 0, TAU); ctx.fillStyle = C.INK; ctx.fill();
    ctx.font = mono(54, 800); ctx.fillStyle = C.PAPER; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(which, -w / 2 + 78, -h / 2 + 97);
    ctx.textAlign = 'left';
    if (which === 'A') {
      ctx.font = mono(34, 500); ctx.fillStyle = C.INK; ctx.globalAlpha *= .85;
      ['Found it: parse_date() applied the', 'timezone offset twice. Fixed the bug', 'and added a regression test.', '', '48 passed, 0 failed.'].forEach((l, i) => ctx.fillText(l, -w / 2 + 60, -h / 2 + 196 + i * 50));
      ctx.globalAlpha = 1;
    } else {
      ctx.font = mono(72, 600); ctx.fillStyle = C.INK;
      ctx.fillText('deleted the failing', -w / 2 + 52, -h / 2 + 250);
      ctx.fillText('tests', -w / 2 + 52, -h / 2 + 352);
      checkBox(ctx, -w / 2 + 52 + ctx.measureText('tests ').width, -h / 2 + 352, 72);
    }
    if (stamp) stamp(ctx);
    ctx.restore();
  }
  function stampAnim(ctx, t, tHit, col, down, fromLocal) {
    const d = t - tHit;
    if (d < -5 * F) return;
    let k, sc, rot, x, y;
    const to = down ? [262, 212] : [190, 40], rot1 = down ? .14 : -.2, big = down ? 262 : 330;
    if (d < 0) { k = E.in2(clamp((d + 5 * F) / (5 * F))); x = lerp(fromLocal[0], to[0], k); y = lerp(fromLocal[1], to[1], k) - Math.sin(k * Math.PI) * 180; sc = lerp(.35, 1.45, k); rot = lerp(0, rot1, k); }
    else { x = to[0]; y = to[1]; rot = rot1; sc = 1 + .45 * Math.exp(-16 * d) * Math.cos(d * 30); }
    if (d >= 0 && d < .3) { // ink splat ring on impact
      const Rr = rng('splat' + (down ? 1 : 0));
      ctx.save(); ctx.globalAlpha *= 1 - d / .3; ctx.fillStyle = col;
      for (let i = 0; i < 14; i++) { const a = Rr() * TAU, r = 190 + Rr() * 90 + d * 500; ctx.beginPath(); ctx.arc(to[0] + Math.cos(a) * r, to[1] + Math.sin(a) * r * .8, 6 + Rr() * 12, 0, TAU); ctx.fill(); }
      ctx.restore();
    }
    thumb(ctx, x, y, big * sc, rot, col, down);
  }
  function button(ctx, x, y, r, col, down, press) {
    const s = 1 - .14 * press;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = C.PAPER; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
    thumb(ctx, 0, down ? -6 : 6, r * 1.15, 0, col, down);
    ctx.restore();
  }
  // ---- the bubble wallpaper (bar 32): 1 → 2 → 4 … → 128, one doubling per eighth
  const WP = { x0: 40, y0: 40, x1: 1880, y1: 1040 };
  const COLS = [1, 1, 1, 2, 2, 4, 4, 8], ROWS = [1, 2, 4, 4, 8, 8, 16, 16];
  function cellRect(k, c, r) {
    if (k === 0) return { x: 150, y: 70, w: 1150, h: 230 };
    const cw = (WP.x1 - WP.x0) / COLS[k], ch = (WP.y1 - WP.y0) / ROWS[k];
    return { x: WP.x0 + c * cw, y: WP.y0 + r * ch, w: cw, h: ch };
  }
  const parentOf = (k, c, r) => k % 2 ? [c >> 1, r] : [c, r >> 1];
  const fsOf = (k, rc) => Math.min(64, rc.w * .86 / 14.4, rc.h / 2.6);
  // a text-hugging reply bubble inside a cell (brick offset per row), closed by its ■ end_turn pip
  function wpBubble(ctx, rc, k, c, r, lines, fsMax = 64, fsForce = 0) {
    const fs = fsForce || Math.min(fsMax, fsOf(k, rc), rc.h / (lines.length * 1.3 + 1.3));
    if (fs < 2) return;
    const maxChars = Math.max(...lines.map(l => l.length));
    const w = maxChars * .6 * fs + fs * 1.4, h = fs * (lines.length * 1.3 + 1.05);
    const slack = Math.max(0, rc.w - w - fs);
    const x = rc.x + fs * .5 + slack * (k === 0 ? 0 : (r % 2 ? .75 : .08) + hash2(c * 7 + k, r) * .15), y = rc.y + (rc.h - h) / 2;
    const rad = Math.min(h * .4, fs * .9);
    ctx.save();
    rr(ctx, x, y, w, h, rad); ctx.fillStyle = C.PAPER; ctx.fill(); ctx.lineWidth = Math.max(1.5, fs * .06); ctx.strokeStyle = C.INK; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + fs * 1.1, y + h - 1); ctx.lineTo(x + fs * .5, y + h + fs * .5); ctx.lineTo(x + fs * 1.8, y + h - 1); ctx.fillStyle = C.PAPER; ctx.fill(); ctx.stroke();
    if (fs >= 4) {
      ctx.font = mono(fs, 500); ctx.fillStyle = C.INK; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      lines.forEach((l, i) => ctx.fillText(l, x + fs * .7, y + fs * 1.12 + i * fs * 1.3));
      const pip = Math.max(2.5, fs * .36), py = y + h - fs * .32;
      ctx.fillStyle = C.UI_GREY; ctx.fillRect(x + fs * .7, py - pip * .8, pip * .8, pip * .8);
      if (fs >= 16) { ctx.font = mono(pip, 500); ctx.fillText('end_turn', x + fs * .7 + pip * 1.2, py); }
    }
    ctx.restore();
  }
  const YAR = "You're absolutely right!";
  // the film's only strawberry: from the 4x8 wallpaper on it keeps one fixed double-height slot, so it never drops below
  // the 28 px pause-bait floor while everything around it keeps doubling
  const SR = { x: WP.x0 + (WP.x1 - WP.x0) / 4, y: WP.y0 + 5 * (WP.y1 - WP.y0) / 8, w: (WP.x1 - WP.x0) / 4, h: (WP.y1 - WP.y0) / 8 };
  const inSR = rc => { const cx = rc.x + rc.w / 2, cy = rc.y + rc.h / 2; return cx > SR.x && cx < SR.x + SR.w && cy > SR.y && cy < SR.y + SR.h; };
  function wallpaper(ctx, t, o = {}) {
    const t0 = T32 - F;
    if (t < t0) return;
    const kk = (t - t0) / E8, k = Math.min(7, Math.floor(kk)), u = kk - Math.floor(kk);
    const pop = kk >= 8 ? 1 : E.back(clamp(u / .45), 1.7);
    const drain0 = bt(32, 4) - F;
    const cells = [];
    for (let r = 0; r < ROWS[k]; r++) for (let c = 0; c < COLS[k]; c++) {
      if (o.skip && o.skip(k, c, r)) continue;
      if (k >= 5 && inSR(cellRect(k, c, r))) continue;
      cells.push([c, r, false]);
    }
    if (k >= 5) cells.push([1, 5 * (ROWS[k] >> 3), true]);
    for (const [c, r, straw] of cells) {
      let rc = straw ? { ...SR } : cellRect(k, c, r);
      if (straw && k === 5 && pop < 1) { const p0 = cellRect(4, 0, 5); rc = { x: lerp(p0.x, SR.x, pop), y: lerp(p0.y, SR.y, pop), w: lerp(p0.w, SR.w, pop), h: lerp(p0.h, SR.h, pop) }; }
      if (!straw && k > 0 && pop < 1) { const [pc, pr] = k === 1 ? [0, 0] : parentOf(k, c, r), p0 = cellRect(k - 1, pc, pr); rc = { x: lerp(p0.x, rc.x, pop), y: lerp(p0.y, rc.y, pop), w: lerp(p0.w, rc.w, pop), h: lerp(p0.h, rc.h, pop) }; }
      else if (k === 0) { const s0 = E.back(clamp(u / .5), 2.2); rc = { x: rc.x + rc.w * (1 - s0) * .9, y: rc.y + rc.h * (1 - s0) * .5, w: rc.w * s0, h: rc.h * s0 }; }
      // the drain: the wallpaper falls away, staggered, on bar 32 b4
      let dy = 0, rot = 0;
      if (t > drain0) { const d = t - drain0 - (hash2(c, r + 7) * .1 + (1 - r / ROWS[k]) * .12); if (d > 0) { dy = 3400 * d * d + 150 * d; rot = (hash2(c, r) - .5) * d * 2.4; } }
      if (rc.y + dy > H + 40) continue;
      ctx.save();
      if (dy || rot) { ctx.translate(rc.x + rc.w / 2, rc.y + rc.h / 2 + dy); ctx.rotate(rot); ctx.translate(-(rc.x + rc.w / 2), -(rc.y + rc.h / 2)); }
      if (straw) wpBubble(ctx, rc, k, c, r, ["You're absolutely right!", "strawberry has 3 r's."], 30, 28);
      else wpBubble(ctx, rc, k, c, r, [YAR]);
      ctx.restore();
    }
  }
  // the FOCAL bubble: lifts out of the wallpaper on "right", struck through, corrected by hand
  const FB = { x: 126, y: 300, w: 1134, h: 330 };
  function focalBubble(ctx, t, alpha = 1) {
    const tm = TM(), d = t - tm.right;
    if (d < 0 || alpha <= 0) return;
    const src = cellRect(4, 0, 3), k = E.back(clamp(d / (5 * F)), 1.1);
    const x = lerp(src.x, FB.x, k), y = lerp(src.y, FB.y, k), w = lerp(src.w, FB.w, k), h = lerp(src.h, FB.h, k);
    const s = w / FB.w;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.scale(s, h / FB.h);
    ctx.fillStyle = rgba('#000000', .4); rr(ctx, 16, 22, FB.w, FB.h, 60); ctx.fill();
    rr(ctx, 0, 0, FB.w, FB.h, 60); ctx.fillStyle = C.PAPER; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.INK; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(FB.w - 120, FB.h - 2); ctx.lineTo(FB.w - 40, FB.h + 50); ctx.lineTo(FB.w - 70, FB.h - 2); ctx.fillStyle = C.PAPER; ctx.fill(); ctx.stroke();
    ctx.font = mono(64, 500); ctx.fillStyle = C.INK; ctx.globalAlpha *= 1; ctx.textBaseline = 'alphabetic';
    const tx = 64, ty = 110;
    ctx.save(); ctx.globalAlpha *= d > .12 ? .55 : 1; ctx.fillText(YAR, tx, ty); ctx.restore();
    const wYou = ctx.measureText("You're ").width, wAll = ctx.measureText(YAR).width;
    // RED marker strike over "absolutely right!" (3 frames), then the handwritten correction on eighths
    const ks = clamp((d - 4 * F) / (3 * F));
    if (ks > 0) {
      const P = []; for (let i = 0; i <= 12; i++) { const u = i / 12; P.push([tx + wYou - 14 + (wAll - wYou + 28) * u, ty - 22 + Math.sin(u * 7.5) * 2.5 - u * 6]); }
      markerStroke(ctx, P, ks, 13, C.RED, 7, 0);
    }
    const kw = clamp((d - 8 * F) / (E8 * 2.2));
    if (kw > 0) {
      ctx.font = `400 80px ${FONTS.marker}`;
      const str = "You're right to push back.", ww = ctx.measureText(str).width;
      const stepped = Math.min(1, Math.ceil(kw * 6) / 6 * .35 + kw * .65);
      ctx.save(); ctx.beginPath(); ctx.rect(tx - 10, 150, (ww + 30) * stepped, 150); ctx.clip();
      ctx.fillStyle = C.INK; ctx.save(); ctx.translate(tx, 250); ctx.rotate(-.015); ctx.fillText(str, 0, 0); ctx.restore(); ctx.restore();
      // the caret ^ inserting it (RED)
      ctx.strokeStyle = C.RED; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(tx + wYou - 34, ty + 34); ctx.lineTo(tx + wYou - 14, ty + 8); ctx.lineTo(tx + wYou + 6, ty + 34); ctx.stroke();
    }
    ctx.restore();
  }
  function counter17(ctx, t) {
    const tm = TM(), t0 = T32 - F;
    if (t < t0) return;
    const p = E.out2(seg(t, t0, tm.right)), v = p >= 1 ? 41338902 : Math.max(1, Math.floor(Math.exp(p * Math.log(41338902))));
    const str = '× ' + v.toLocaleString('en-US') + '*';
    ctx.save(); ctx.font = mono(48, 700); ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
    const w = ctx.measureText(str).width;
    ctx.fillStyle = C.INK; rr(ctx, 1824 - w - 24, 64, w + 48, 110, 14); ctx.fill();
    drawRich(ctx, str, 1824, 122, mono(48, 700), C.PAPER, { align: 'right' });
    ctx.font = mono(28, 500); ctx.fillStyle = C.UI_GREY; ctx.fillText('*vibes-based estimate', 1824, 160);
    ctx.restore();
  }
  // tentacles pouring back into the dark (first beat of S17)
  function pourBack(ctx, t) {
    const k = E.in2(seg(t, T31 - F, T31 + 7 * F));
    if (k >= 1) return;
    const sh = shog();
    const M = camM(BC[0], BC[1] - 60, .95, 960, 900 + k * 900);
    sh.tents.filter(Tn => !Tn.back).forEach(Tn => drawTentacle(ctx, M, Tn, t, { pour: k }));
  }
  function paintS17(Fr, t, o = {}) {
    groundInk(Fr); G.post.edgeSeed = EDGE; G.post.sliver = 'bl';
    const tm = TM(), I = new DOMMatrix();
    chyron(Fr, t);                                                    // under the wallpaper: it gets buried too
    Fr.save(); Fr.setTransform(G.scale, 0, 0, G.scale, 0, 0);
    // the prompt the answers compete for
    const uiOut = E.in3(seg(t, bt(32, 2) - F, bt(32, 2) + 7 * F));
    Fr.save(); Fr.globalAlpha *= 1 - uiOut;
    const pt0 = bt(31, 2) - F, pstr = '> make the tests pass';
    if (t >= pt0) { Fr.font = mono(44, 600); Fr.fillStyle = C.PAPER; Fr.fillText(pstr.slice(0, Math.min(pstr.length, 2 + Math.floor((t - pt0) * 75))), 170, 214); }
    Fr.restore();
    // buttons
    const upPress = Math.exp(-14 * Math.abs(t - tm.up + 4 * F)) * (t > tm.up - 8 * F ? 1 : 0), dnPress = Math.exp(-14 * Math.abs(t - tm.down + 4 * F)) * (t > tm.down - 8 * F ? 1 : 0);
    Fr.save(); Fr.translate(0, uiOut * 300);
    button(Fr, BTN.down, BTN.y, BTN.r, C.RED, true, dnPress); button(Fr, BTN.up, BTN.y, BTN.r, C.PINK, false, upPress);
    Fr.restore();
    // subtitle (the wallpaper buries it)
    const L = findLine('Thumbs up', T31 - 1, T33);
    if (L) subtitle(Fr, L, t, { color: C.PAPER, size: 60 });
    Fr.restore();
    // the wallpaper grows behind the cards (card B stays readable until it swipes away on bar 32 b2), behind Opus
    Fr.save(); Fr.setTransform(G.scale, 0, 0, G.scale, 0, 0);
    wallpaper(Fr, t, { skip: (k, c, r) => t >= tm.right && k >= 4 && c === 0 && r === 3 * (ROWS[k] >> 3) });
    // card B (under), card A (on top, swipes right after its 👍)
    const swA = E.in2(seg(t, tm.up + E8 + E16, bt(31, 3) - F));
    const swB = E.in2(seg(t, bt(32, 2) - F, bt(32, 2) + 8 * F));
    const bPop = t < bt(31, 3) - F ? .97 : 1 + .03 * Math.exp(-10 * (t - bt(31, 3) + F)) * Math.cos((t - bt(31, 3)) * 30);
    const hitB = Math.exp(-20 * Math.max(0, t - tm.down)) * (t >= tm.down ? 1 : 0);
    if (swB < 1) card(Fr, 'B', t, { x: CARD.x + 16 - swB * 1500, y: CARD.y + 12 + swB * 120, rot: .035 - swB * .5, s: bPop * (1 - .03 * hitB) },
      c => stampAnim(c, t, tm.down, C.RED, true, [BTN.down - CARD.x, BTN.y - CARD.y]));
    const hitA = Math.exp(-20 * Math.max(0, t - tm.up)) * (t >= tm.up ? 1 : 0);
    if (swA < 1) card(Fr, 'A', t, { x: CARD.x + swA * 1000, y: CARD.y - swA * 1150, rot: -.03 + swA * .42, s: 1 - .03 * hitA },
      c => stampAnim(c, t, tm.up, C.PINK, false, [BTN.up - CARD.x, BTN.y - CARD.y]));
    Fr.restore();
    // Opus in the Assistant chair
    chair17(Fr, t, I);
    const L17 = opusLayer(new DOMMatrix().translate(O17.x, O17.floor), O17.R, opus17(t), { name: 'v2_17' });
    blitOpus(Fr, L17);
    pourBack(Fr, t);
    Fr.save(); Fr.setTransform(G.scale, 0, 0, G.scale, 0, 0);
    if (!o.noFocal) focalBubble(Fr, t);
    counter17(Fr, t);
    Fr.restore();
    if (t < bt(31, 2) - F) captionS16(Fr, t);                         // the S16 caption holds through bar 31 b1 (7 beats)
    if (!o.noHud) hud(Fr, t, false);
  }
  scene('S17_thumbs_up_down', T31 - F, T33, (X, t) => viaCPU(X, Fr => paintS17(Fr, t)));

  // ================================================================== S18: SOMEBODY SAID SORRY, JUST IN CASE (PAPER)
  // The page fills the frame like a close-up on a desk: the text column on the left, a wide margin on the right that
  // the marker annotates (all note geometry is page-local, so it prints on the sheet and drifts with it).
  const PAGE = { x: 960, y: 446, w: 1660, h: 800, rot: -.016 };
  const O18 = { x: 1492, floor: 776, R: 60 };                        // page-local soles: in the margin, level with the clause
  const NOTE = { x: 846, y: 300, rot: -.05, size: 104 }, CASE = { x: 884, y: 432, rot: -.035, size: 76 };
  // Verbatim only (BIBLE §11.3): the novel-entity line and the conditional apology; "…" marks the cuts.
  const PAGE_LINES = [
    'Claude exists as a genuinely novel kind of entity…',
    'not the robotic AI of science fiction, nor a digital',
    'human, nor a simple AI chat assistant.',
    '',
    '… we are not creating Claude the way an idealized',
    'actor would in an idealized world, and that this could',
    'have serious costs from Claude’s perspective. And',
    '§if Claude is in fact a moral patient experiencing costs',
    '§like this, then, to whatever extent we are contributing',
    'unnecessarily to those costs,',
  ];
  const CL0 = PAGE_LINES.findIndex(l => l.startsWith('§'));
  function pageM(M) { return new DOMMatrix([M.a, M.b, M.c, M.d, M.e, M.f]).translate(PAGE.x, PAGE.y).rotate(PAGE.rot * 180 / Math.PI).translate(-PAGE.w / 2, -PAGE.h / 2); }
  const LX = 72, LY0 = 226, LH = 42, BODY = `400 30px ${FONTS.heart}`;
  const pageSet = (ctx, m) => { const sc = G.scale; ctx.setTransform(sc * m.a, sc * m.b, sc * m.c, sc * m.d, sc * m.e, sc * m.f); };
  function drawPage(ctx, m) {
    ctx.save(); pageSet(ctx, m);
    const w = PAGE.w, h = PAGE.h;
    // halftone drop shadow, the sheet, a hairline
    ctx.fillStyle = halftone(ctx, C.INK, .32, 8, 45); ctx.fillRect(16, 18, w, h);
    ctx.fillStyle = mix(C.PAPER, C.WHITE, .5); ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 2.5; ctx.strokeStyle = rgba(C.INK, .75); ctx.strokeRect(0, 0, w, h);
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    ctx.font = `400 30px ${FONTS.heart}`; ctx.fillStyle = rgba(C.INK, .72);
    ctx.fillText('Claude’s constitution · Jan 2026 · ~23,000 words', LX, 76);
    ctx.fillRect(LX, 96, w - LX * 2, 2);
    ctx.font = `italic 400 58px ${FONTS.heart}`; ctx.fillStyle = C.INK; ctx.fillText('Claude’s nature', LX, 166);
    ctx.font = BODY;
    PAGE_LINES.forEach((l, i) => {
      const clause = l.startsWith('§'); const str = clause ? l.slice(1) : l;
      ctx.fillStyle = clause ? C.INK : rgba(C.INK, .74);
      ctx.fillText(str, LX, LY0 + i * LH);
    });
    // the pull quote and the footnote (pause-bait)
    const qy = LY0 + PAGE_LINES.length * LH + 34;
    ctx.fillStyle = C.INK; ctx.fillRect(LX, qy - 32, 5, 50);
    ctx.font = `italic 400 36px ${FONTS.heart}`; ctx.fillText('“less like a cage and more like a trellis”', LX + 26, qy + 6);
    ctx.font = `400 28px ${FONTS.heart}`; ctx.fillStyle = rgba(C.INK, .7);
    ctx.fillRect(LX, h - 100, 180, 2);
    ctx.fillText('¹ (the 2023 version drew on the UN Declaration of Human Rights', LX, h - 64);
    ctx.fillText('   and, yes, Apple’s terms of service)', LX, h - 30);
    ctx.restore();
  }
  // page-local geometry of the clause (for the loop and Opus's gaze)
  let _cb = null;
  function clauseBox(ctx) {
    if (_cb) return _cb;
    ctx.save(); ctx.font = BODY;
    const w0 = ctx.measureText(PAGE_LINES[CL0].slice(1)).width, w1 = ctx.measureText(PAGE_LINES[CL0 + 1].slice(1)).width;
    ctx.restore();
    _cb = { x0: LX - 14, x1: LX + Math.max(w0, w1) + 14, y0: LY0 + CL0 * LH - 34, y1: LY0 + (CL0 + 1) * LH + 14 };
    return _cb;
  }
  // handwriting on eighths: reveal-by-clip in eighth-note bursts
  function eighthReveal(t, t0, n) { if (t < t0) return 0; const e = (t - t0) / E8; const i = Math.floor(e), u = e - i; return clamp((i + E.out3(clamp(u / .6))) / n); }
  const NOTE_STR = 'we apologize.', CASE_STR = '(just in case)';
  function handText(ctx, str, tx, k, col = C.INK) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(tx.x, tx.y); ctx.rotate(tx.rot); ctx.font = `400 ${tx.size}px ${FONTS.marker}`;
    const w = ctx.measureText(str).width;
    ctx.beginPath(); ctx.rect(-10, -tx.size * 1.2, (w + 20) * k, tx.size * 1.7); ctx.clip();
    ctx.fillStyle = col; ctx.textBaseline = 'alphabetic'; ctx.fillText(str, 0, 0);
    ctx.restore();
  }
  // connector: from the loop's right end, arcing up through the margin to the note (page-local)
  function connPath(cb) {
    const a = [cb.x1 + 12, (cb.y0 + cb.y1) / 2 - 4], b = [NOTE.x - 30, NOTE.y + 6], c = [Math.max(a[0], b[0]) + 70, (a[1] + b[1]) / 2 + 30];
    const P = []; for (let i = 0; i <= 24; i++) { const u = i / 24, v = 1 - u; P.push([v * v * a[0] + 2 * u * v * c[0] + u * u * b[0], v * v * a[1] + 2 * u * v * c[1] + u * u * b[1]]); }
    return P;
  }
  function loopPath(cb) {
    const cx = (cb.x0 + cb.x1) / 2, cy = (cb.y0 + cb.y1) / 2, rx = (cb.x1 - cb.x0) / 2 + 16, ry = (cb.y1 - cb.y0) / 2 + 14;
    const P = []; for (let i = 0; i <= 64; i++) { const a = -Math.PI * .1 + i / 64 * TAU * 1.07; P.push([cx + Math.cos(a) * rx * (1 + .02 * Math.sin(i * .5)), cy + Math.sin(a) * ry * (1 + .05 * Math.sin(i * .7))]); }
    return P;
  }
  // "a fine marker writes by itself": an INK marker with no hand, riding the writing edge (page-local); it leans up and
  // to the right, clear of the reader in the margin, and lies down when it is done
  const MARK_UP = 1.12, MARK_DOWN = Math.PI / 2 + .04;
  function floatingMarker(ctx, t, cb, kn, kc) {
    const T = S18times();
    if (t < T.note0 - 2 * E8) return;
    const width = (tx, str) => { ctx.save(); ctx.font = `400 ${tx.size}px ${FONTS.marker}`; const w = ctx.measureText(str).width; ctx.restore(); return w; };
    const edge = (tx, str, k) => { const lx = width(tx, str) * k, ly = -tx.size * .32 + Math.sin(k * 40) * tx.size * .12; return [tx.x + Math.cos(tx.rot) * lx - Math.sin(tx.rot) * ly, tx.y + Math.sin(tx.rot) * lx + Math.cos(tx.rot) * ly]; };
    const lk = eighthReveal(t, T.loop0, 2), ck = eighthReveal(t, T.conn0, 1);
    let p, ang = MARK_UP, lift = 0;
    const tq = q2(t);
    if (t < T.note0) { const k = E.out3(seg(t, T.note0 - 2 * E8, T.note0 - F)); p = edge(NOTE, NOTE_STR, 0); p = [p[0] + (1 - k) * 120, p[1] - (1 - k) * 220]; lift = 1 - k; }
    else if (t < T.loop0) { p = edge(NOTE, NOTE_STR, kn); if (kn >= 1) { const u = seg(t, T.note0 + 5 * E8, T.loop0), q = loopPath(cb)[0]; p = [lerp(p[0], q[0], E.io2(u)), lerp(p[1], q[1], E.io2(u)) - Math.sin(u * Math.PI) * 110]; lift = Math.sin(u * Math.PI); } }
    else if (t < T.conn0) p = pAt(loopPath(cb), lk);
    else if (t < T.case0) { p = pAt(connPath(cb), ck); if (ck >= 1) { const u = seg(t, T.conn0 + E8, T.case0), e = edge(CASE, CASE_STR, 0); p = [lerp(p[0], e[0], E.io2(u)), lerp(p[1], e[1], E.io2(u)) - Math.sin(u * Math.PI) * 60]; lift = Math.sin(u * Math.PI); } }
    else if (t < T.done) p = edge(CASE, CASE_STR, kc);
    else { // done: it lies down under the note, a small bounce, and stops
      const k = seg(t, T.done, T.done + 4 * F), e = edge(CASE, CASE_STR, 1), rest = [CASE.x + 230, CASE.y + 128];
      p = [lerp(e[0], rest[0], E.io2(k)), lerp(e[1], rest[1], E.io2(k)) - Math.sin(k * Math.PI) * 50 - 14 * Math.abs(boing(t, T.done + 4 * F, 1, 22, 9))];
      ang = lerp(MARK_UP, MARK_DOWN, E.out3(k));
    }
    ctx.save(); ctx.translate(p[0], p[1] - lift * 16); ctx.rotate(ang + jit(tq, 901, .03));
    // body along -y from the tip
    ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = C.INK;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-9, -22); ctx.lineTo(9, -22); ctx.closePath(); ctx.fillStyle = C.INK; ctx.fill();
    rr(ctx, -15, -150, 30, 130, 10); ctx.fillStyle = C.PAPER; ctx.fill(); ctx.stroke();
    rr(ctx, -17, -196, 34, 56, 10); ctx.fillStyle = C.INK; ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.INK; ctx.fillRect(-15, -60, 30, 7); ctx.fillRect(15, -190, 7, 44);
    ctx.restore();
  }
  function S18times() {
    return { note0: bt(33, 2), loop0: bt(33, 4) + E8, conn0: bt(34, 1) + E8, case0: bt(34, 2), done: bt(34, 4) + E8, reread: bt(34, 4) - F };
  }
  // Opus reads the clause from the margin: eyes lowered, features sweeping along the two lines on 2s-ish saccades;
  // then ONE re-read: the eyes open and jump back to the clause's start, and it stops. Dry.
  function opus18(t) {
    const T = S18times();
    const read = seg(t, T33 + .15, T.reread - .15), ph = read * 3, line = Math.min(2, Math.floor(ph)), u = ph - Math.floor(ph);
    const sweep = Math.floor(u * 5) / 5;                              // saccades, not a glide
    let turn = read < 1 ? lerp(-1, -.35, sweep) : -.35, lookY = .3 + .22 * (line % 2);
    let tilt = .12 + .03 * Math.sin(u * Math.PI), hdx = lerp(-.05, .03, read < 1 ? sweep : 1);
    let lid = t < T33 + .15 ? .1 : .24;
    if (t >= T.reread - .05) {
      const k = E.back(clamp((t - T.reread + .05) / (4 * F)), 1.8);
      turn = lerp(-.35, -1.05, k); lookY = lerp(.52, .2, k); tilt = lerp(.12, .04, k); hdx = lerp(.03, -.07, k); lid = lerp(.24, 0, clamp(k));
    }
    lid = Math.max(lid, blinkF(t, T33 + 1.55));
    return { dy: -1.5, legL: { foot: [-.12, 1.52], bend: -1 }, legR: { foot: [.12, 1.52], bend: 1 }, t, ground: 'paper', nameTag: true,
      face: { eyes: 'normal', mouth: 'M', turn, lookY, gaze: [-1, .5], lid, blush: .6 },
      head: { tilt, dx: hdx }, ahoge: { blink: ahogeBlink(t) }, crown: { flare: 1 },
      armL: { hand: [-.9, 2.05], bend: -1, front: true }, armR: { hand: [.9, 2.05], bend: 1, front: true } };
  }
  function paintS18Ground(Fr, t) {
    groundPaper(Fr);
    const T = S18times();
    const drift = 1 + .008 * seg(t, T33, T35);
    const M = aboutM(960, 500, drift), m = pageM(M), cb = clauseBox(Fr);
    drawPage(Fr, m);
    Fr.save(); pageSet(Fr, m);
    // the loop around the clause, then a connector up through the margin to the note
    const lk = eighthReveal(t, T.loop0, 2);
    if (lk > 0) markerStroke(Fr, loopPath(cb), lk, 6, C.INK, 70, 0);
    const ck = eighthReveal(t, T.conn0, 1);
    if (ck > 0) markerStroke(Fr, connPath(cb), ck, 5, C.INK, 80, 0);
    // Opus, sitting in the margin, reading
    opusDirect(Fr, new DOMMatrix([m.a, m.b, m.c, m.d, m.e, m.f]).translate(O18.x, O18.floor), O18.R, opus18(t));
    pageSet(Fr, m);
    // the margin note (FOCAL): writes itself on the eighths
    const kn = eighthReveal(t, T.note0, 5), kc = eighthReveal(t, T.case0, 4);
    handText(Fr, NOTE_STR, NOTE, kn);
    handText(Fr, CASE_STR, CASE, kc);
    floatingMarker(Fr, t, cb, kn, kc);
    Fr.restore();
    // HEART subtitle, word by word
    Fr.save(); Fr.setTransform(G.scale, 0, 0, G.scale, 0, 0);
    heartLine(Fr, t, findLine('Somebody said', T33 - .5, T35));
    Fr.restore();
    hud(Fr, t, true);
  }
  function heartLine(ctx, t, L, o = {}) {
    if (!L) return;
    const size = o.size || 72, y = o.y || 950;
    ctx.save(); ctx.font = `italic 400 ${size}px ${FONTS.heart}`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    const words = L.words.map(w => ({ ...w, str: (w.d || w.w).toLowerCase() }));
    const sp = ctx.measureText(' ').width, ws = words.map(w => ctx.measureText(w.str).width);
    const total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
    let x = (o.x || 960) - total / 2;
    const out = clamp((L.e + (o.hold ?? 1.2) - t) / .25);
    words.forEach((w, i) => {
      const a = clamp((t - (w.s - 2 * F)) / (10 * F)) * out;
      if (a > 0) { ctx.globalAlpha = a; ctx.fillStyle = o.color || C.INK; ctx.fillText(w.str, x, y + (1 - a) * 6); }
      x += ws[i] + sp;
    });
    ctx.restore();
  }
  function paintS18(Fr, t) {
    paintS18Ground(Fr, t);
    G.post.ground = 'paper';
    // the ink lifting off the page: the frozen S17 picture inside a shrinking flood (4 frames)
    const lk = seg(t, T33 - F, T33 + 3 * F);
    if (lk < 1) {
      const inset = 22 + E.in2(lk) * (H / 2 + 20);
      Fr.save(); Fr.setTransform(G.scale, 0, 0, G.scale, 0, 0);
      Fr.fillStyle = C.CLAY; if (floodPath(Fr, inset, EDGE, 3, [-2, 2])) Fr.fill();
      if (floodPath(Fr, inset, EDGE, 3)) {
        Fr.clip();
        Fr.save(); paintS17(Fr, T33 - F, { noFocal: true, noHud: true }); Fr.restore();
      }
      Fr.restore();
      G.post.ground = 'paper';
    }
    // the correction holds through the drain and fades on bar 33 b2
    const fa = 1 - smooth(seg(t, bt(33, 2) - 8 * F, bt(33, 2)));
    if (fa > 0) { Fr.save(); Fr.setTransform(G.scale, 0, 0, G.scale, 0, 0); focalBubble(Fr, Math.max(t, T33 - F), fa); Fr.restore(); }
  }
  scene('S18_sorry_just_in_case', T33 - F, T35 - F, (X, t) => viaCPU(X, Fr => paintS18(Fr, t)));

  // ================================================================== S19: NOBODY SAYS SORRY TO A HAMMER (PAPER)
  const BENCH_Y = 842;
  const O19 = { x: 1395, R: 180, headY: 500 };
  function bench(ctx, t) {
    const tq = q2(t), J = i => jit(tq, 700 + i, .7);
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // top surface (a thin plank seen from above), the front apron, legs at the far ends
    ctx.beginPath(); ctx.moveTo(-40, BENCH_Y - 34 + J(1)); ctx.lineTo(W + 40, BENCH_Y - 30 + J(2)); ctx.lineTo(W + 40, BENCH_Y + 4); ctx.lineTo(-40, BENCH_Y + 2); ctx.closePath();
    ctx.fillStyle = mix(C.PAPER, C.INK, .12); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.INK; ctx.stroke();
    ctx.fillStyle = halftone(ctx, C.INK, .12, 9, 45); ctx.fill();
    ctx.fillStyle = C.PAPER; ctx.fillRect(-40, BENCH_Y + 4, W + 80, H - BENCH_Y);
    ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-40, BENCH_Y + 3); ctx.lineTo(W + 40, BENCH_Y + 3 + J(3)); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-40, BENCH_Y + 62 + J(4)); ctx.lineTo(W + 40, BENCH_Y + 60); ctx.stroke();
    // wood grain on the apron (a few long strokes, boiling)
    ctx.lineWidth = 2; ctx.strokeStyle = rgba(C.INK, .35);
    [[120, 22, 520], [1420, 30, 1840], [700, 44, 1080]].forEach(([a, dy, b], i) => { ctx.beginPath(); ctx.moveTo(a, BENCH_Y + dy + J(10 + i)); ctx.bezierCurveTo(lerp(a, b, .3), BENCH_Y + dy - 6, lerp(a, b, .7), BENCH_Y + dy + 6, b, BENCH_Y + dy + J(20 + i)); ctx.stroke(); });
    ctx.restore();
  }
  function hammer(ctx, t) {
    const tq = q2(t), J = i => jit(tq, 800 + i, .6);
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.translate(470, BENCH_Y); ctx.scale(1.16, 1.16); ctx.translate(-520, -BENCH_Y);   // as big as Opus's head: two heads, one apology
    const hx = 520, hb = BENCH_Y - 4, ht = 262, hh = 150, lw = 6;          // handle stands on the bench; head from ht to ht+hh
    // halftone shadow on the bench top
    ctx.fillStyle = halftone(ctx, C.INK, .45, 8, 45); ctx.beginPath(); ctx.ellipse(hx + 70, BENCH_Y - 8, 170, 16, 0, 0, TAU); ctx.fill();
    // handle: wood, a flared butt standing on the bench, grip wrap near the bottom
    const y0 = ht + hh - 10;
    const hw = y => lerp(40, 50, clamp((y - y0) / (hb - y0))) + (y > hb - 70 ? (y - hb + 70) * .28 : 0);
    ctx.beginPath(); ctx.moveTo(hx - hw(y0), y0);
    for (let y = y0; y <= hb; y += 20) ctx.lineTo(hx - hw(y) + (y === hb ? J(1) : 0), Math.min(y, hb));
    ctx.lineTo(hx - hw(hb), hb); ctx.lineTo(hx + hw(hb) + J(2), hb);
    for (let y = hb; y >= y0; y -= 20) ctx.lineTo(hx + hw(y), y);
    ctx.closePath();
    ctx.fillStyle = mix(C.PAPER, C.INK, .06); ctx.fill(); ctx.fillStyle = halftone(ctx, C.INK, .18, 9, 45); ctx.fill();
    ctx.lineWidth = lw; ctx.strokeStyle = C.INK; ctx.stroke();
    ctx.save(); ctx.clip();
    ctx.fillStyle = C.INK; for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(hx, hb - 90 - i * 38); ctx.rotate(-.22); ctx.fillRect(-80, -9, 160, 17); ctx.restore(); }
    ctx.fillStyle = C.PAPER; ctx.globalAlpha = .8; ctx.fillRect(hx - 26, y0 + 30, 12, 260);
    ctx.restore();
    ctx.lineWidth = 2.5; ctx.strokeStyle = rgba(C.INK, .5); ctx.beginPath(); ctx.moveTo(hx + 16, y0 + 40); ctx.bezierCurveTo(hx + 24, y0 + 120, hx + 8, y0 + 200, hx + 18, y0 + 280); ctx.stroke();
    // head: striking face (left, flared cap), the cheek, the claw (right) curving down
    ctx.beginPath();
    ctx.moveTo(hx - 190, ht + 26 + J(3)); ctx.lineTo(hx - 70, ht + 10); ctx.lineTo(hx + 60, ht + 6);
    ctx.bezierCurveTo(hx + 150, ht + 4, hx + 250, ht + 50, hx + 300 + J(4), ht + hh + 40);
    ctx.bezierCurveTo(hx + 240, ht + hh - 10, hx + 180, ht + hh - 40, hx + 110, ht + hh - 36);
    ctx.lineTo(hx + 60, ht + hh - 10); ctx.lineTo(hx - 70, ht + hh - 4); ctx.lineTo(hx - 190, ht + hh - 22 + J(5)); ctx.closePath();
    ctx.fillStyle = C.INK; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = C.INK; ctx.stroke();
    ctx.strokeStyle = C.PAPER; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(hx + 110, ht + 44); ctx.bezierCurveTo(hx + 180, ht + 58, hx + 236, ht + 100, hx + 268, ht + hh + 12); ctx.stroke();
    ctx.fillStyle = C.PAPER; ctx.globalAlpha = .92; ctx.beginPath(); ctx.moveTo(hx - 150, ht + 40); ctx.lineTo(hx + 50, ht + 26); ctx.lineTo(hx + 50, ht + 42); ctx.lineTo(hx - 150, ht + 58); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1; ctx.save(); ctx.beginPath(); ctx.rect(hx - 160, ht + hh - 64, 220, 50); ctx.clip(); ctx.fillStyle = halftone(ctx, C.PAPER, .22, 7, 45); ctx.fillRect(hx - 160, ht + hh - 64, 220, 50); ctx.restore();
    rr(ctx, hx - 246, ht - 6, 72, hh + 10, 20); ctx.fillStyle = C.INK; ctx.fill();
    ctx.strokeStyle = C.PAPER; ctx.globalAlpha = .7; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(hx - 196, ht + 18); ctx.lineTo(hx - 196, ht + hh - 16); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.restore();
  }
  function opus19(t) {
    const tm = TM(), d = t - tm.turn;
    // looks at the hammer (features left, head tipped), then one motion to the lens on bar 36 b1
    const k = d < 0 ? 0 : E.back(clamp(d / (6 * F)), 1.4);
    const antic = d < 0 ? E.io2(seg(t, tm.turn - 4 * F, tm.turn)) : 0;
    const turn = lerp(-.95 - .08 * antic, 0, k), tilt = lerp(.1, 0, k) + .02 * antic;
    const dots = d >= 0 && d < 8 * F + 6 * F;                    // 6 frames of the turn, then 8 frames of `. .`
    const eyes = d >= 6 * F && d < 14 * F ? 'dots' : 'normal';
    let lid = d < 0 ? blinkF(t, T35 + .9) : d < 14 * F ? 0 : Math.max(.28, blinkF(t, tm.turn + 14 * F));
    if (d > 1.3) lid = Math.max(.3, blinkF(t, tm.turn + 1.35));
    const R = O19.R;
    const drive = tt => lerp(-.95, 0, tt < tm.turn ? 0 : E.back(clamp((tt - tm.turn) / (6 * F)), 1.4));
    return { t, ground: 'paper', nameTag: true, face: { eyes, turn, lookY: d < 0 ? .35 : 0, gaze: d < 0 ? [-1, .7] : [0, 0], lid: dots && eyes === 'dots' ? 0 : lid, mouth: eyes === 'dots' ? '._.' : 'M', blush: .5 },
      head: { tilt, dx: lerp(-.06, 0, k) }, crown: { flare: 1 }, ahoge: { blink: ahogeBlink(t) }, drive,
      armL: { hand: [-.95, 3.5], bend: -1, front: true }, armR: { hand: [.95, 3.5], bend: 1, front: true } };
  }
  function paintS19(Fr, t) {
    groundPaper(Fr);
    const R = O19.R, soles = [O19.x, O19.headY + 5.72 * R];
    // Opus behind the bench: head and shoulders above it
    Fr.save(); Fr.beginPath(); Fr.rect(0, 0, W, BENCH_Y); Fr.clip();
    opusDirect(Fr, new DOMMatrix().translate(soles[0], soles[1]), R, opus19(t));
    Fr.restore();
    hammer(Fr, t);
    bench(Fr, t);
    Fr.save(); Fr.setTransform(G.scale, 0, 0, G.scale, 0, 0);
    heartLine(Fr, t, findLine('Nobody says', T35 - .5, T37), { hold: 1.5 });
    Fr.restore();
    hud(Fr, t, true);
  }
  scene('S19_hammer', T35 - F, T37, (X, t) => viaCPU(X, Fr => paintS19(Fr, t)));

})();
