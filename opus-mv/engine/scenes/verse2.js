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
  function lock(word, a, b, fb) { const w = findWord(word, a, b); if (!w) return fb; const s = snap16(w.s); return Math.abs(s - fb) <= E16 + 1e-6 ? s : fb; }
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
      return { c, period: w1, f: r.f };
    });
    return _strips;
  }

  // world layout (S16 wide)
  const BC = [1060, 830], BR = [520, 360];            // body blob centre / radii (the bottom runs off-frame)
  const TAG = { x: 1090, y: 540, w: 450, h: 318, rot: -4 * Math.PI / 180 };
  const FACE_L = [100, 58], FACE_r = 60;              // the tag's :) in tag-local px (from the tag centre)
  // tentacle definitions (deterministic)
  let _sh = null;
  function shog() {
    if (_sh) return _sh;
    const R = rng('v2-shoggoth');
    const tents = [];
    const N = 34;
    for (let i = 0; i < N; i++) {
      const back = i < 16;
      // fan over the upper half; back ones reach the frame edges, front ones stay low and sideways
      let a;
      if (back) a = lerp(-Math.PI * 1.06, Math.PI * .06, (i + R() * .7) / 16);
      else { const side = i % 2 ? 1 : -1; a = side > 0 ? lerp(-.55, .35, R()) : lerp(-Math.PI + .55, -Math.PI - .35, R()); }
      const ra = back ? lerp(-.2, .2, R()) + a : a;
      const rootK = back ? .55 + R() * .25 : .78 + R() * .15;
      const root = [BC[0] + Math.cos(ra) * BR[0] * rootK, BC[1] + Math.sin(ra) * BR[1] * rootK];
      const L = back ? 560 + R() * 520 : 300 + R() * 330;
      tents.push({
        i, back, root, a, L, w0: back ? 70 + R() * 50 : 84 + R() * 46, wt: back ? 9 : 11,
        bend: (R() - .5) * 1.4, curl: (R() < .5 ? 1 : -1) * (1.2 + R() * 1.6),
        f1: 1.1 + R() * 1.3, f2: 2.3 + R() * 1.7, p1: R() * TAU, p2: R() * TAU, amp: 40 + R() * 60,
        reg: Math.floor(R() * REGS.length), speed: 60 + R() * 70, off: R() * 3000,
      });
    }
    // eyes: on the body (mostly) and a few on the front tentacles
    const eyes = [];
    for (let k = 0; k < 26; k++) {
      let u, v, tries = 0;
      do { u = lerp(-.92, .92, R()); v = lerp(-.88, .15, R()); tries++; }
      while (tries < 40 && (u * u + v * v > .8 || (Math.abs(u * BR[0] + BC[0] - TAG.x) < TAG.w * .62 && Math.abs(v * BR[1] + BC[1] - TAG.y) < TAG.h * .66) || eyes.some(e => Math.hypot((e.u - u) * BR[0], (e.v - v) * BR[1]) < 70)));
      eyes.push({ u, v, r: 16 + R() * 26, seed: k, font: k % 4 });
    }
    // close-up: three fat tentacles rising from the bottom edge, in front of Opus's torso
    const front2 = [[760, 1240, -1.25, 700, 1], [1560, 1260, -1.95, 640, -1], [1180, 1330, -1.62, 420, 1]].map(([x, y, a, L, cs], j) => ({
      i: 60 + j, back: false, root: [x, y], a, L, w0: 150, wt: 16, bend: .35 * cs, curl: 1.9 * cs,
      f1: 1.2 + j * .3, f2: 2.6 + j * .4, p1: j * 2.1, p2: j * 1.3, amp: 30, reg: [2, 5, 6][j], speed: 90, off: j * 700 }));
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
    fillDev(ctx, devPattern(ctx, T.back ? mix(C.INK, C.PAPER, .5) : C.PAPER, T.back ? .05 : .085, 14, 45, T.back ? mix(C.INK, '#000000', .18) : C.INK));
    strokeDev(ctx, T.back ? mix(C.INK, C.PAPER, .38) : C.PAPER, (T.back ? 2.6 : 3.4) * Math.max(1, zoom * .8));
    // text ribbon
    const S = strips()[T.reg], sc = G.scale;
    const scroll = (q2(t) * T.speed + T.off) * 2;                   // text flows toward the tip
    let src = 0;
    ctx.save(); ctx.globalAlpha *= T.back ? .42 : .92;
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], hd = wAt(p.s) * .66, ds = pts[i + 1].s - p.s;
      const srcW = ds * STRIP_H / hd;
      const sx = (((src - scroll) % S.period) + S.period) % S.period;
      src += srcW;
      if (hd * zoom < 5) continue;
      const ca = Math.cos(p.a), sa = Math.sin(p.a);
      ctx.setTransform(sc * (M.a * ca + M.c * sa), sc * (M.b * ca + M.d * sa), sc * (M.c * ca - M.a * sa), sc * (M.d * ca - M.b * sa),
        sc * (M.a * p.x + M.c * p.y + M.e), sc * (M.b * p.x + M.d * p.y + M.f));
      ctx.drawImage(S.c, sx, 0, Math.min(srcW + 2, S.c.width - sx), STRIP_H, -ds / 2 - .6, -hd / 2, ds + 1.2, hd);
    }
    ctx.restore();
  }
  // the body: noisy blob, INK with a PAPER dot screen, text mass inside, eyes
  function bodyPath(ctx, t, o) {
    const tt = q2(t), n = 16, pts = [];
    const sy = o.sy || 1, sx = o.sx || 1;
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU;
      const r = 1 + .07 * noise1(i * 1.7 + tt * .8, 3) + .05 * Math.sin(a * 3 + tt * 1.3);
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
    ctx.globalAlpha *= .3;
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
    ctx.scale(1, Math.max(.08, open));
    // ring shape varies a touch per "font": round (mono), oval (serif), squarish (marker), heavy (hero)
    const ry = R * [1, 1.12, .95, 1.05][fontK], rx = R * [1, .9, 1.02, 1.08][fontK], th = R * [.3, .22, .34, .42][fontK];
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
    const ticks = RAYS.map(ry => { const th = ry[0] * Math.PI / 180, j = (R() - .5) * .08; return [[cx + Math.sin(th + j) * r * 1.16, cy - Math.cos(th + j) * r * 1.16], [cx + Math.sin(th) * r * (1.16 + ry[1] * .45), cy - Math.cos(th) * r * (1.16 + ry[1] * .45)]]; });
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
        if (i === 4) { const n = S.ticks.length, f = kk * n, j = Math.min(n - 1, Math.floor(f)), u = f - j; tip = [lerp(S.ticks[j][0][0], S.ticks[j][1][0], clamp(u * 1.3)), lerp(S.ticks[j][0][1], S.ticks[j][1][1], clamp(u * 1.3))]; }
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
    ctx.fillText('Claude', FACE_L[0] - FACE_r * .55, FACE_L[1] + 30);
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
  // tip = screen point of the marker tip; ang = direction from the tip to the hand; s = scale
  function markerHand(ctx, tip, ang, s, t, down = true) {
    const tq = q2(t), J = i => jit(tq, 300 + i, .9);
    ctx.save(); ctx.setTransform(G.scale, 0, 0, G.scale, 0, 0);
    ctx.translate(tip[0], tip[1]); ctx.rotate(ang); ctx.scale(s, s);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const lw = 4.5 / s;
    // forearm (sleeve): two lines off-frame, a cuff
    ctx.beginPath(); ctx.moveTo(215, -52 + J(1)); ctx.quadraticCurveTo(520, -86, 1400, -120); ctx.lineTo(1400, 150); ctx.quadraticCurveTo(520, 120, 225, 62 + J(2)); ctx.closePath();
    ctx.fillStyle = C.INK; ctx.fill(); ctx.strokeStyle = C.PAPER; ctx.lineWidth = lw; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(250, -58); ctx.quadraticCurveTo(262, 4, 256, 66); ctx.stroke();
    // the marker: CLAY body, PAPER line, felt tip at the origin
    const lift = down ? 0 : -10;
    ctx.save(); ctx.translate(0, lift);
    ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(22, -12); ctx.lineTo(22, 12); ctx.closePath(); ctx.fillStyle = C.CLAY; ctx.fill(); ctx.strokeStyle = C.PAPER; ctx.lineWidth = lw * .8; ctx.stroke();
    rr(ctx, 20, -17, 190, 34, 12); ctx.fillStyle = C.CLAY; ctx.fill(); ctx.strokeStyle = C.PAPER; ctx.lineWidth = lw; ctx.stroke();
    ctx.fillStyle = C.CLAY_DARK; ctx.fillRect(150, -15, 12, 30);
    ctx.restore();
    // the hand: a closed single-line fist around the marker, thumb and index finger over it
    ctx.beginPath();
    ctx.moveTo(78 + J(3), -18);
    ctx.bezierCurveTo(70, -52, 118, -74, 160 + J(4), -70);
    ctx.bezierCurveTo(205, -66, 232, -40, 230, -6);
    ctx.bezierCurveTo(228, 34, 205, 64, 160 + J(5), 66);
    ctx.bezierCurveTo(118, 68, 92, 48, 84, 22);
    ctx.closePath();
    ctx.fillStyle = C.INK; ctx.fill(); ctx.strokeStyle = C.PAPER; ctx.lineWidth = lw; ctx.stroke();
    // index finger reaching along the marker, thumb tip over it, knuckle lines
    ctx.beginPath(); ctx.moveTo(150, -26); ctx.bezierCurveTo(118, -30, 76, -26, 56 + J(6), -18); ctx.bezierCurveTo(44, -14, 46, 4, 60, 4); ctx.bezierCurveTo(84, 4, 110, 0, 134, 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(140, 44); ctx.bezierCurveTo(116, 42, 88, 30, 76 + J(7), 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(176, -48); ctx.quadraticCurveTo(184, -36, 178, -24); ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------------ paper-cut chairs (Human: / Assistant:)
  function chair(ctx, x, floor, s, label, t, o = {}) {
    const tq = q2(t), J = i => jit(tq, (o.seed || 1) * 50 + i, .8);
    const flip = o.flip ? -1 : 1;
    ctx.save(); ctx.translate(x, floor); ctx.scale(s * flip, s); ctx.rotate(o.rot || 0);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const line = o.line || C.INK, lw = 4 / s;
    // back legs, seat, front legs, backrest
    ctx.fillStyle = mix(C.PAPER, C.INK, .22); ctx.strokeStyle = line; ctx.lineWidth = lw;
    rr(ctx, 70 + J(1), -250, 20, 250, 6); ctx.fill(); ctx.stroke();
    rr(ctx, -96 + J(2), -250, 20, 250, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.PAPER;
    ctx.beginPath(); ctx.moveTo(-130 + J(3), -262); ctx.lineTo(118, -262 + J(4)); ctx.lineTo(132, -236); ctx.lineTo(-138, -236 + J(5)); ctx.closePath(); ctx.fill(); ctx.stroke();
    rr(ctx, -130 + J(6), -236, 22, 236, 7); ctx.fill(); ctx.stroke();
    rr(ctx, 104 + J(7), -236, 22, 236, 7); ctx.fill(); ctx.stroke();
    // backrest (a rounded card with the label), posts
    rr(ctx, 84, -560, 20, 300, 7); ctx.fill(); ctx.stroke();
    ctx.restore();
    // label card drawn upright in screen space (never mirrored)
    const bx = x + flip * 96 * s, by = floor - 520 * s;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(-.03 * flip + jit(tq, (o.seed || 1) * 50 + 9, .004));
    const f = mono(Math.round(46 * s / .9), 600); ctx.font = f;
    const tw = ctx.measureText(label).width, pw = tw + 60 * s, ph = 96 * s;
    rr(ctx, -pw / 2, -ph / 2, pw, ph, 16 * s); ctx.fillStyle = C.PAPER; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = line; ctx.stroke();
    ctx.fillStyle = C.INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, 3 * s);
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
      X.fillStyle = rgba(C.INK, .88); rr(X, 72, y - 70, w + 60, 96, 14); X.fill();
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
    const bodyK = { sy: 1 - .07 * boing(t, tm.slap, 1, 20, 6), sx: 1 + .04 * boing(t, tm.slap, 1, 20, 6) };
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
      const push = lerp(1, 1.12, E.io2(seg(t, T29 - F, tm.face)));
      const kick = 1 + .03 * Math.exp(-12 * Math.max(0, t - tm.slap)) * (t >= tm.slap ? 1 : 0);
      const z = push * kick;
      const cx = lerp(1000, TAG.x + 40, E.io2(seg(t, T29, tm.face))), cy = lerp(560, TAG.y + 10, E.io2(seg(t, T29, tm.face)));
      const [shx, shy] = t >= tm.slap ? shake(t, 7 * Math.exp(-10 * (t - tm.slap)), 4) : [0, 0];
      const M = camM(cx, cy, z, 960 + shx, 540 + shy);
      const grow = lerp(.55, 1, E.out3(seg(t, T29 - F, T29 + BEAT * 1.2)));
      shoggothScene(Fr, t, M, { grow });
      // chairs slide in (bar 29 b1 → b2), land with a bounce
      const ck = seg(t, T29 + F, bt(29, 2) - F), cb = E.back(ck, 1.6);
      Fr.save(); devSet(Fr, M);
      chair(Fr, lerp(-260, 250, cb), 1010, .9, 'Human:', t, { seed: 1, rot: -.05 * boing(t, bt(29, 2) - F, 1, 18, 6) });
      chair(Fr, lerp(2180, 1860, cb), 1010, .9, 'Assistant:', t, { seed: 2, flip: true, rot: .05 * boing(t, bt(29, 2) - F, 1, 18, 6) });
      Fr.restore();
      // the tag (slap) + marker drawing
      const tg = drawTag(Fr, M, t);
      if (t >= tm.slap && t < tm.slap + .6) scraps(Fr, mp(M, TAG.x, TAG.y), t - tm.slap, 7, [C.PAPER, C.RED]);
      // the hand: enters on bar 29 b4, draws, leaves
      if (tg && t >= tm.draw0 - BEAT * 1.1 && t < tm.face) {
        const S = faceStrokes();
        const enter = E.out3(seg(q2(t), tm.draw0 - BEAT * 1.05, tm.draw0 - F));
        const leave = E.in3(seg(q2(t), tm.draw0 + 5.8 * E8, tm.face - F));
        const tip0 = tg.tip || mp(tg.m, S.disc[0][0], S.disc[0][1]);
        const off = (1 - enter) * 900 + leave * 700;
        const tip = [tip0[0] + off * .55, tip0[1] + off * .85];
        const z = Math.hypot(M.a, M.b);
        markerHand(Fr, tip, .98 + .05 * Math.sin(q2(t) * 9), .92 * z, t, tg.down);
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
    shoggothScene(Fr, t, M, { lookAt: faceW, murmurs: false, grow: 1 });
    const popF = 3;                                                   // frames of puff before the vector pops out
    if (fr < popF) {
      drawTag(Fr, M, tm.face - F * .5, { puff: E.out2(fr / popF) });
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
    const ks = RAYS.map((_, i) => E.back(clamp((ra - .015 * i) / .16), 2.6));
    const soles = [HEADC[0], HEADC[1] + 5.72 * R];
    const crouch = seg(t, T31 - 5 * F, T31 - F);                    // anticipation of the hop into the chair
    const st = {
      t, ground: 'ink', nameTag: true, sy: 1 - .1 * E.io2(crouch), dy: -.12 * crouch,
      face: { eyes: 'normal', gaze: [0, 0], mouth: fr < 8 ? 'O' : 'rest', lid: Math.max(blinkF(t, tm.face + 7 * F), fr < 4 ? .3 : 0), lower: fr >= 9 ? .25 : 0 },
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

  // expose for sibling scenes (the S17 pour-back)
  window.V2 = { shog, spine, drawTentacle, TM };
})();
