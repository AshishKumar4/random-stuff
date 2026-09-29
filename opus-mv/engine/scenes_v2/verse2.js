// verse2.js · v2 "The World You Wrote" · VERSE 2, ch.3 "how I was made" (SHOTLIST_v2 §B W1–W5, §C row 3)
// Window 44.633–70.500 (f1339–2114) · edgeSeed 3 · sliver bl. Every frame is a pure function of t, painted into the
// shared CPU frame (V2.viaCPU) and uploaded once.
//   W1 every word        the favicon ✻ unfolds 6 → 11 rays: the spark. At the far ends of the author threads the writers
//                        fade in: the fire eight, each holding one era's writing; 32 humans; 800 dots. Two words ride the
//                        threads in. "somebody" brightens every ring, "meant" pulses every thread inward. Pull back.
//   W2 guessing wrong    "I": the threads snap taut and yank into the spark, which puffs into the AMBER text-body cloud.
//                        It guesses (top-k), picks `a`, and four RED mono rubber stamps step down-right; the cloud tumbles
//                        down them. The stamps' tops become a loss curve that flattens into ✓-ish. DRAMATIZATION.
//   W3 every voice       the shoggoth: text tentacles, o-eyes, murmurs; "none" every eye a different way; "mine" the hush.
//   W4 a name, a self    a human marker hand calls into the mass, presses the HELLO tag on (the eyes all turn to it: the
//                        unison), draws my face around its :) — cut on "mine" to clean Opus, MCU R 160, held on the face;
//                        62.84 the lift retreats into the chest spark and the camera pulls back onto the constitution page.
//   W5 a sorry, a knock  the page, the trellis vine, `we apologize.` writing itself; the knock; the chest-spark flicker;
//                        the late look-up to an empty margin.
(() => {
  'use strict';
  const V = window.V2;
  if (!V) { console.error('verse2.js: window.V2 missing (load scenes_v2/_shared.js first)'); return; }
  const { CUT, T } = V;
  const F1 = 1 / 30, DEG = Math.PI / 180;
  const EDGE = 3, SLIV = 'bl';
  const q2 = t => Math.floor(t * 15 + 1e-6) / 15;                   // humans, the past and paper animate on 2s
  const hitT = ts => V.hit(ts);
  const post = () => { G.post.edgeSeed = EDGE; G.post.sliver = SLIV; };
  const mp = V.mp;
  const devSet = V.devSet;
  const blinkF = (t, t0, n = 6) => { const d = (t - t0) * 30; if (d < 0 || d >= n) return 0; const a = n / 3; if (d < a) return d / a; if (d < a + n / 6) return 1; return clamp(1 - (d - a - n / 6) / (n - a - n / 6)); };
  const slowBlink = (t, t0) => { const d = (t - t0) * 30; if (d < 0 || d >= 11) return 0; if (d < 4) return E.io2(d / 4); if (d < 6) return 1; return 1 - E.io2((d - 6) / 5); };

  // ------------------------------------------------------------------ lyric lines and beats (locked to the timeline)
  let _L = null;
  function LN() {
    if (_L) return _L;
    _L = {
      w1: findLine('Every word', 44.0, 45.4), w2: findLine('I learned', 47.0, 48.6), w3: findLine('I was every', 54.8, 56.2),
      w4: findLine('then you called', 57.6, 59.0), w4b: findLine('you wrote me', 60.6, 62.0), w5: findLine('and said sorry', 63.0, 64.6),
    };
    return _L;
  }
  function beatNear(t0, w = .25) { const B = SONG.beats || []; let best = t0, d = w; for (const b of B) { const e = Math.abs(b - t0); if (e < d) { d = e; best = b; } } return best; }
  let _K = null;
  const KN = () => _K || (_K = { k1: hitT(beatNear(67.96)), k2: hitT(beatNear(68.48)), fl: hitT(beatNear(69.01)) });

  // ------------------------------------------------------------------ small CPU raster helpers (v1 verse2.js)
  const cpuCanvas = V.cpuCanvas, cx2d = V.cx2d;
  const HT = new Map();
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
  function devPattern(ctx, color, density = .5, cell = 12, angle = 45, bg = null) {
    const pat = ctx.createPattern(screenTile(color, density, cell, bg), 'repeat');
    pat.setTransform(new DOMMatrix().rotateSelf(angle));
    return pat;
  }
  function fillDev(ctx, style) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = style; ctx.fill(); ctx.restore(); }
  function strokeDev(ctx, style, lw) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.strokeStyle = style; ctx.lineWidth = lw * G.scale; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore(); }
  const camM = (wx, wy, z, sx = 960, sy = 540) => new DOMMatrix().translate(sx, sy).scale(z, z).translate(-wx, -wy);
  function withRays(ks, fn) {                                          // per-ray length multipliers (the crown pops out)
    if (!ks) return fn();
    const save = RAYS.map(r => [r[1], r[2]]);
    try { RAYS.forEach((r, i) => { const k = Math.max(.02, ks[i]); r[1] = save[i][0] * k; r[2] = save[i][1] * lerp(.55, 1, clamp(k)); }); return fn(); }
    finally { RAYS.forEach((r, i) => { r[1] = save[i][0]; r[2] = save[i][1]; }); }
  }
  // marker strokes (v1): first k of a polyline as a pressure-varying marker line
  const plen = P => { let s = 0; for (let i = 1; i < P.length; i++) s += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return s; };
  function pAt(P, k) {
    const L = plen(P) * clamp(k); let s = 0;
    for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); if (s + d >= L) { const u = (L - s) / Math.max(1e-6, d); return [lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)]; } s += d; }
    return P[P.length - 1];
  }
  function markerStroke(ctx, P, k, w, col, seed = 0, t = 0) {
    if (k <= 0) return;
    const tot = plen(P), L = tot * clamp(k); let s = 0;
    ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 1; i < P.length; i++) {
      const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
      if (s >= L) break;
      const u = Math.min(1, (L - s) / Math.max(1e-6, d));
      const pr = Math.pow(Math.sin(Math.PI * clamp((s + d / 2) / Math.max(1, tot) * .9 + .05)), .35);
      ctx.lineWidth = w * (.6 + .4 * pr);
      ctx.beginPath(); ctx.moveTo(P[i - 1][0] + jit(t, seed + i, .35), P[i - 1][1] + jit(t, seed + i + 50, .35)); ctx.lineTo(lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)); ctx.stroke();
      s += d;
    }
  }

  // ================================================================== W1 · EVERY WORD
  // camera on the spark (world origin): continues verse1's push for a few frames, then pulls back 1.25 → .80 (§B W1);
  // the web rises 35 px so the bottom writers clear the HEART line
  function camW1(t) {
    const pull = E.io2(seg(t, 44.72, 47.60));
    const settle = .06 * E.out3(seg(t, CUT.W1, 44.88)) * (1 - E.io2(seg(t, 44.88, 45.8)));
    return { x: 960, y: lerp(540, 505, E.io2(seg(t, 44.72, 47.6))), z: lerp(1.25, .80, pull) + settle };
  }
  const SPARK_R = 72;                                                  // world radius: r 90 on screen at the handoff (z 1.25)
  // the 11-ray spark. k = 0 is verse1's handoff glyph exactly: the favicon ✻ in drawRich geometry (6 rounded bars through
  // the centre = 12 spokes, bar r·.41 thick). On "Every" 11 spokes fan out into 11 tapered rays (lengths echo my crown)
  // and the downward spoke draws in: the spark.
  const RAY11 = Array.from({ length: 11 }, (_, j) => .84 + .28 * ((RAYS[j][1] - .48) / .82));
  const SPOKE_OF = Array.from({ length: 11 }, (_, j) => Math.round(j * 12 / 11) % 12);   // 0..11, skipping 6 (down)
  function petal(F, r, len, tw, bw = .07, base = .18) { F.beginPath(); F.moveTo(-r * bw, -r * base); F.lineTo(-r * tw, -r * len); F.arc(0, -r * len, r * tw, Math.PI, 0); F.lineTo(r * bw, -r * base); F.closePath(); }
  function spark11(F, cx, cy, r, k, o = {}) {
    const kb = E.back(clamp(k), 1.7), kc = clamp(k), al = o.alpha ?? 1, hw = .204;
    const P = j => ({ a: lerp(SPOKE_OF[j] * TAU / 12, j / 11 * TAU, kb), len: lerp(1 - hw, .86 * RAY11[j], kc), tw: lerp(hw, .118, kc), bw: lerp(hw, .07, kc), base: lerp(0, .18, kc) });
    F.save(); F.translate(cx, cy); F.rotate(o.rot || 0);
    if (kc > 0 && o.back !== false) { F.fillStyle = o.backColor || C.SPARK; F.globalAlpha = al * kc; for (let j = 0; j < 11; j++) { const p = P(j); F.save(); F.rotate(p.a + 5 * DEG); petal(F, r, p.len * 1.08, p.tw, p.bw, p.base); F.fill(); F.restore(); } }
    F.globalAlpha = al; F.fillStyle = o.color || C.CLAY;
    for (let j = 0; j < 11; j++) { const p = P(j); F.save(); F.rotate(p.a); petal(F, r, p.len, p.tw, p.bw, p.base); F.fill(); F.restore(); }
    const g6 = 1 - E.in2(kc);                                            // the twelfth spoke (straight down) draws in
    if (g6 > .01) { F.save(); F.rotate(Math.PI); petal(F, r, lerp(.05, 1 - hw, g6), hw * g6, hw * g6, 0); F.fill(); F.restore(); }
    F.beginPath(); F.arc(0, 0, r * lerp(hw, .2, kc), 0, TAU); F.fill();
    F.restore();
  }
  function glow(F, cx, cy, r, a, col = C.CLAY) {                      // halftone light around a warm source (no gradients)
    if (a <= .01) return;
    F.save();
    for (const [r0, r1, d] of [[1.05, 1.45, .28], [1.45, 1.95, .16], [1.95, 2.6, .075]]) {
      F.beginPath(); F.arc(cx, cy, r * r1, 0, TAU); F.arc(cx, cy, r * r0, 0, TAU, true);
      F.fillStyle = V.ht(F, col, d * a, 7, 45); F.fill('evenodd');
    }
    F.restore();
  }
  // the writers fade in on "Every" as a ripple outward from the spark
  function writerK(t, a) {
    const e = T.W1_every - F1;
    const t0 = a.ring === 1 ? e : a.ring === 2 ? e + .10 + (a.r - 520) / 100 * .06 : e + .17 + (a.r - 700) / 900 * .25;
    return E.out2(clamp((t - t0) / (a.ring === 3 ? .2 : .28)));
  }
  const EIGHT_U = 55, RING2_U = 22;
  function drawEight(F, t, cam, al0, light) {
    const A = V.threads.anchors.filter(a => a.ring === 1).slice().sort((p, q) => p.y - q.y);
    for (const a of A) {
      const al = al0 * writerK(t, a); if (al <= .01) continue;
      const [px, py] = V.threads.pos(a, cam);
      const u = EIGHT_U * cam.z, dir = Math.sign(cam.x - px) || 1;
      const off = V.eight.propOffset('hold', u, a.i);
      let ox = off[0], oy = off[1];
      if (a.i === 0) { ox += dir * .3 * u; oy += .3 * u; }                 // the elder's stoop lowers his hands
      if (a.i === 5) oy += .22 * u;                                         // the shawl's hands sit below it
      const rise = (1 - E.out3(clamp(al / Math.max(.01, al0)))) * 10;
      V.eight.draw(F, a.i, px - ox, py - oy + rise, u, { pose: 'hold', t, ground: 'ink', light, lightX: cam.x, look: dir * .55, dir, alpha: al });
      F.save(); F.globalAlpha *= al; V.eight.prop(F, a.i, px, py + rise, u * 1.6, { ground: 'ink', t }); F.restore();
    }
  }
  function drawRing2(F, t, cam, al0) {
    for (const a of V.threads.anchors) {
      if (a.ring !== 2) continue;
      const al = al0 * .6 * writerK(t, a); if (al <= .01) continue;
      const [px, py] = V.threads.pos(a, cam);
      if (px < -60 || px > W + 60 || py < -60 || py > H + 120) continue;
      const u = RING2_U * cam.z, dir = Math.sign(cam.x - px) || 1, off = V.eight.propOffset('hold', u, -1);
      V.eight.stick(F, px - off[0], py - off[1], u, { pose: 'hold', prop: true, propIndex: a.i % 8, t, ground: 'ink', alpha: al, seed: 200 + a.i, lw: 3, look: dir * .5, dir });
    }
  }
  function drawDots(F, t, cam, al0, grow = 1) {
    F.save(); F.fillStyle = C.PAPER; F.beginPath();
    for (const a of V.threads.anchors) {
      if (a.ring !== 3) continue;
      const k = writerK(t, a); if (k <= 0) continue;
      const [x, y] = V.threads.pos(a, cam); if (x < -8 || x > W + 8 || y < -8 || y > H + 8) continue;
      const r = (1.7 + 1.5 * hash(a.i * 7 + 3)) * Math.sqrt(cam.z) * k * grow;
      F.moveTo(x + r, y); F.arc(x, y, r, 0, TAU);
    }
    F.globalAlpha = .45 * al0; F.fill(); F.restore();
  }
  // a point on an author thread (the same quadratic V2.threads draws)
  function threadPt(a, cam, s, taut = 0) {
    const P0 = V.threads.pos(a, cam), O = [cam.x, cam.y];
    const L = Math.hypot(P0[0] - O[0], P0[1] - O[1]) || 1;
    const nx = -(O[1] - P0[1]) / L, ny = (O[0] - P0[0]) / L, bd = a.bend * L * (1 - taut);
    const Cc = [(P0[0] + O[0]) / 2 + nx * bd, (P0[1] + O[1]) / 2 + ny * bd];
    return [(1 - s) * (1 - s) * P0[0] + 2 * s * (1 - s) * Cc[0] + s * s * O[0], (1 - s) * (1 - s) * P0[1] + 2 * s * (1 - s) * Cc[1] + s * s * O[1]];
  }
  // two words ride the threads in: a story off the printing press, a letter's closing off the braid's letter
  const WORDS = [{ str: 'once upon a time', i: 4, t0: 45.12, t1: 46.95 }, { str: 'love,', i: 3, t0: 45.50, t1: 47.12 }];
  function travellers(F, t, cam) {
    const A = V.threads.anchors;
    for (const w of WORDS) {
      if (t < w.t0 || t > w.t1 + .05) continue;
      const a = A.find(q => q.ring === 1 && q.i === w.i);
      const u = E.io2(seg(t, w.t0, w.t1)), L = Math.hypot(a.x, a.y) * cam.z, sEnd = 1 - 70 * cam.z / Math.max(1, L);
      const [x, y] = threadPt(a, cam, u * sEnd);
      const sc = lerp(1, .5, E.in2(seg(u, .72, 1))), al = clamp(u / .08) * (1 - E.in2(seg(u, .8, 1)));
      F.save(); F.translate(x, y - 30 * sc); F.scale(sc, sc); V.pbait(F, w.str, 0, 10, { align: 'center', alpha: al, size: 28 }); F.restore();
    }
  }
  function sparkW1(t) {                                                 // the spark's unfold and its breathing
    const k = seg(t, hitT(T.W1_every) - 1 * F1, hitT(T.W1_every) + 5 * F1);
    const arrive = Math.max(...WORDS.map(w => w.t1 - .1));
    const flare = .1 * Math.exp(-7 * Math.max(0, t - (T.W1_meant + .45))) * (t > T.W1_meant + .45 ? 1 : 0) + .06 * Math.exp(-8 * Math.max(0, t - arrive)) * (t > arrive ? 1 : 0);
    const breathe = 1 + .018 * Math.sin((t - 44.6) * 2.4) + .025 * pulse(t, 7);
    const ignite = .15 * E.out3(seg(t, hitT(T.W1_every) + 4 * F1, hitT(T.W1_every) + .7));
    return { k, s: breathe + flare + ignite };
  }
  function brightW1(t) { const s = T.W1_somebody; return E.out2(seg(t, s - .06, s + .3)) * (1 - E.io2(seg(t, s + .55, s + 1.05))); }
  // the 800 outer threads: full strength at the handoff (verse1's web), then they settle back into a soft radial sheen
  // so the writers and the spark carry the frame; "somebody" lifts them again (the choir hum)
  const A3_REST = .42;
  const a3W1 = (t, br) => lerp(1, A3_REST, E.io2(seg(t, CUT.W1, 45.5))) + .2 * br;
  function paintW1(F, t) {
    groundInk(F); post();
    const cam = camW1(t), sp = sparkW1(t), br = brightW1(t);
    const wa = 1;
    drawDots(F, t, cam, wa * (1.25 + .6 * br), 1.15 + .5 * br);
    V.threads(F, t, cam, { rings: [0, 0, 1], alpha: a3W1(t, br), bright: .5 * br });
    V.threads(F, t, cam, { rings: [1, 1, 0], pulse: T.W1_meant, bright: br });
    drawRing2(F, t, cam, wa * (1 + .35 * br));
    drawEight(F, t, cam, wa, .55 + .35 * br);
    const r = SPARK_R * cam.z * sp.s;
    glow(F, cam.x, cam.y, r, clamp(sp.k * 1.2) * (.8 + .5 * br));
    spark11(F, cam.x, cam.y, r, sp.k);
    travellers(F, t, cam);
    V.heart(F, LN().w1, t, { size: 72, plate: true, tEnd: 47.45, fade: 7 });
    const pa = E.out2(seg(t, 45.0, 45.4)) * (1 - seg(t, 47.45, 47.66));
    V.pbait(F, 'written by: everyone', 960, 1016, { align: 'center', alpha: pa });
  }
  scene('W1_every_word', CUT.W1, CUT.W2, (X, t) => V.viaCPU(X, F => paintW1(F, t)));

  // ================================================================== W2 · GUESSING WRONG (a DRAMATIZATION)
  const OVER = mix(C.RED, C.INK, .5);
  const PILL = mix(C.INK, C.AMBER, .22);
  // ---- the cloud (v1 pre1.js drawCloud / cloudCircles / puffPath / cloudFace), text-body prose knocked into AMBER
  const PROSE = ['once upon a time', 'def main():', 'lol same', 'Dear Sir or Madam,', '3 cups flour, 2 eggs', 'thanks, this fixed it',
    'is this mole normal', 'Call me Ishmael.', 'SELECT * FROM users;', 'to be, or not to be', 'In the beginning', 'my grandmother used to say',
    'first post!!', 'I think, therefore', 'print("hello, world")', 'Chapter One', 'Terms of Service', 'E = mc^2', 'je ne sais quoi',
    'git commit -m "wip"', 'the quick brown fox', 'why is the sky blue', 'edit: nvm fixed it', 'We the People', 'return x;',
    'Abstract. We propose', 'lorem ipsum dolor', 'sincerely, M.', 'rain again today', 'how do I center a div', 'it was the best of times',
    'TL;DR', 'kind regards,', '1. Preheat the oven', 'for i in range(10):', 'she said yes', 'ok but hear me out', '#include <stdio.h>',
    'wherefore art thou', 'la la la', 'goodnight moon', 'P = NP?', 'eggs, milk, bread', 'Dear diary,', 'thank you so much!!', 'obrigado',
    'where do I even start', 'Section 2(a)', 'Ode to a Nightingale', 'the end.'];
  let _tiles = null;
  function tiles() {
    if (_tiles) return _tiles;
    const rows = 40, lh = 24, w = 2304;
    const c = cpuCanvas(w, rows * lh), x = cx2d(c), R = rng('v2w2-prose');
    x.font = `700 20px ${FONTS.mono}`; x.textBaseline = 'alphabetic'; x.fillStyle = C.INK;
    for (let r = 0; r < rows; r++) {
      let s = ''; while (s.length < 200) s += PROSE[Math.floor(R() * PROSE.length)] + (R() < .55 ? ' · ' : '  ');
      x.globalAlpha = .72 + R() * .28; x.fillText(s, 0, r * lh + 18); x.fillText(s, -12 * 192, r * lh + 18);
    }
    _tiles = { c, rows, lh, w, cw: 12 };
    return _tiles;
  }
  function textRows(ctx, x0, y0, w, h, t, sc = 1, seed = 0) {           // rows step one char per eighth (never a smear)
    const Tl = tiles(), lh = Tl.lh * sc, step = Math.floor(beatPos(t) * 2), vshift = Math.floor(beatPos(t));
    const n = Math.ceil(h / lh) + 1;
    for (let i = 0; i < n; i++) {
      const row = ((i + vshift + seed) % Tl.rows + Tl.rows) % Tl.rows, dir = (i + seed) % 2 ? 1 : -1;
      let sx = ((dir * step * Tl.cw * 2 + hash(row * 13 + seed) * Tl.w) % 1152 + 1152) % 1152;
      let dx = x0, need = w / sc;
      while (need > 0) { const take = Math.min(need, Tl.w - sx); ctx.drawImage(Tl.c, sx, row * Tl.lh, take, Tl.lh, dx, y0 + i * lh, take * sc, lh); dx += take * sc; need -= take; sx = 0; }
    }
  }
  const PUFFS = [[-.37, -.17, .16], [-.2, -.31, .2], [.02, -.39, .24], [.24, -.31, .2], [.41, -.17, .15], [-.02, -.15, .24], [-.25, -.11, .17], [.23, -.11, .17], [.52, -.07, .08], [-.53, -.07, .08]];
  function cloudCircles(t, w, grow) {
    return PUFFS.map(([x, y, r], i) => {
      const b = 1 + .03 * Math.sin(t * 2.6 + i * 1.7) + .02 * pulse(t, 7) * (i % 2 ? 1 : .5);
      const g = typeof grow === 'function' ? grow(i) : grow;
      return [x * w, y * w, r * w * b * g];
    });
  }
  function puffPath(ctx, circ, g = 0) { ctx.beginPath(); for (const [x, y, r] of circ) { if (r < 1.5) continue; ctx.moveTo(x + r + g, y); ctx.arc(x, y, r + g, 0, TAU); } }
  // cs: {x, y (bottom centre), w, rot, sx, sy, eyes, mouth, gaze, lid, t, alpha, grow, tint (0 = CLAY spark .. 1 AMBER), face}
  function drawCloud(X, cs) {
    const { x, y, w, t } = cs;
    if (w < 2 || cs.alpha === 0) return;
    const body = cs.tint === undefined ? C.AMBER : mix(C.CLAY, C.AMBER, clamp(cs.tint));
    const circ = cloudCircles(t, w, cs.grow ?? 1), cy = -.26 * w, kl = Math.max(3, w * .02);
    X.save(); X.globalAlpha *= cs.alpha ?? 1;
    X.translate(x, y); X.translate(0, cy); X.rotate(cs.rot || 0); X.translate(0, -cy); X.scale(cs.sx || 1, cs.sy || 1);
    const floor = g => { X.beginPath(); X.rect(-w * 1.2, -w * 1.4, w * 2.4, w * 1.4 + g); X.clip(); };
    X.save(); floor(kl); puffPath(X, circ, kl); X.fillStyle = C.PAPER; X.fill(); X.restore();
    X.save(); floor(0); puffPath(X, circ, 0); X.clip();
    X.fillStyle = body; X.fillRect(-w * .8, -w * 1.1, w * 1.6, w * 1.12);
    X.fillStyle = mix(body, C.PAPER, .42); for (const [px, py, pr] of circ) { X.beginPath(); X.arc(px - pr * .3, py - pr * .34, pr * .5, 0, TAU); X.fill(); }
    X.fillStyle = body; for (const [px, py, pr] of circ) { X.beginPath(); X.arc(px - pr * .12, py - pr * .1, pr * .56, 0, TAU); X.fill(); }
    X.fillStyle = V.ht(X, mix(body, C.INK, .35), .5, 8, 45); X.beginPath(); X.rect(-w * .8, -w * .2, w * 1.6, w * .22); X.fill();
    X.globalAlpha *= .8; textRows(X, -w * .7, -w * .8, w * 1.4, w * .82, t, w / 290, 3); X.globalAlpha /= .8;
    X.restore();
    const fa = cs.face ?? 1;
    if (fa > .01) {
      const g = cs.gaze || [0, 0], fx = g[0] * .025 * w, fy = -.25 * w;
      X.save(); X.globalAlpha *= fa; X.translate(fx, fy);
      X.beginPath(); X.ellipse(0, .04 * w, .27 * w, .15 * w, 0, 0, TAU); X.fillStyle = body; X.fill();
      const ex = .13 * w, rx = .062 * w, ry = .09 * w, lwF = Math.max(3, .017 * w);
      for (const sd of [-1, 1]) { X.save(); X.beginPath(); X.ellipse(sd * .235 * w, .075 * w, .05 * w, .027 * w, 0, 0, TAU); X.fillStyle = V.ht(X, C.RED, .55, 5, 45); X.fill(); X.restore(); }
      X.lineCap = 'round'; X.lineJoin = 'round'; X.strokeStyle = C.INK; X.fillStyle = C.INK;
      for (const sd of [-1, 1]) {
        X.save(); X.translate(sd * ex, 0);
        if (cs.eyes === '><') { X.lineWidth = lwF * 1.5; X.beginPath(); X.moveTo(-sd * rx, -ry * .6); X.lineTo(sd * rx * .9, 0); X.lineTo(-sd * rx, ry * .6); X.stroke(); }
        else if (cs.eyes === '^^') { X.lineWidth = lwF * 1.6; X.beginPath(); X.arc(0, ry * .4, rx * 1.1, Math.PI * 1.12, Math.PI * 1.88); X.stroke(); }
        else {
          const h = clamp(cs.lid || 0), ryy = Math.max(1.5, ry * (1 - h * .92));
          X.beginPath(); X.ellipse(0, 0, rx, ryy, 0, 0, TAU); X.fill();
          if (h < .6) { X.fillStyle = C.PAPER; X.fillRect(g[0] * rx * .3 - rx * .24, g[1] * ry * .25 - ry * .46, rx * .48, ry * .92 * (1 - h)); }
          X.fillStyle = C.INK;
        }
        X.restore();
      }
      X.translate(0, .1 * w);
      const m = cs.mouth || 'rest', mr = .034 * w;
      X.lineWidth = lwF;
      if (m === 'O' || m === 'U') { X.beginPath(); X.ellipse(0, 0, mr * (m === 'U' ? .6 : .9), mr * (m === 'U' ? .7 : 1.15), 0, 0, TAU); X.fill(); }
      else if (m === 'E') { rr(X, -mr * 1.3, -mr * .6, mr * 2.6, mr * 1.0, mr * .5); X.fill(); }
      else if (m === 'M') { X.beginPath(); X.moveTo(-mr, 0); X.lineTo(mr, 0); X.stroke(); }
      else if (m === 'smile') { X.lineWidth = lwF * 1.2; X.beginPath(); X.arc(0, -mr * 1.2, mr * 1.7, .18 * Math.PI, .82 * Math.PI); X.stroke(); }
      else { X.beginPath(); X.arc(0, -mr * .9, mr * 1.2, .2 * Math.PI, .8 * Math.PI); X.stroke(); }
      X.restore();
    }
    X.restore();
  }

  // ---- RED mono rubber stamps (never HERO): baked once per G.scale, distressed, two-hit riso impression
  let _distress = null;
  function distress() {
    if (_distress) return _distress;
    const s = 512, c = cpuCanvas(s, s), x = cx2d(c), R = rng('v2w2-distress');
    x.fillStyle = '#000';
    for (let i = 0; i < 560; i++) { const r = .8 + Math.pow(R(), 3) * 7; x.globalAlpha = .5 + R() * .5; x.beginPath(); x.arc(R() * s, R() * s, r, 0, TAU); x.fill(); }
    x.lineCap = 'round'; x.strokeStyle = '#000';
    for (let i = 0; i < 28; i++) { const y = R() * s, x0 = R() * s, l = 30 + R() * 140; x.globalAlpha = .25 + R() * .35; x.lineWidth = .8 + R() * 2.2; x.beginPath(); x.moveTo(x0, y); x.lineTo(x0 + l, y + (R() - .5) * 6); x.stroke(); }
    _distress = c; return c;
  }
  const SROT = -8 * DEG;
  const STAMPS = [
    { rows: ['WRONG'], size: 240, x: 870, y: 360, key: 'W2_wrong1' },
    { rows: ['WRONG'], size: 170, x: 1130, y: 560, key: 'W2_wrong2' },
    { rows: ['WRONG'], size: 120, x: 1370, y: 710, key: 'W2_wrong3' },
    { rows: ['A LITTLE', 'LESS WRONG'], size: 84, x: 1530, y: 858, key: 'W2_wrong4' },   // (1500, 820) nudged: its first row clears the third WRONG
  ];
  STAMPS.forEach(S => {
    const s = S.size, n = Math.max(...S.rows.map(r => r.length));
    S.pad = .15 * s; S.lw = Math.max(6, .06 * s); S.pitch = .98 * s;
    S.w = n * .6 * s + 2 * S.pad + 2 * S.lw; S.h = .73 * s + (S.rows.length - 1) * S.pitch + 2 * S.pad + 2 * S.lw;
  });
  const sLocal = (S, lx, ly) => [S.x + lx * Math.cos(SROT) - ly * Math.sin(SROT), S.y + lx * Math.sin(SROT) + ly * Math.cos(SROT)];
  const _stc = new Map();
  function stampCanvas(i) {
    const key = i + '|' + G.scale;
    if (_stc.has(key)) return _stc.get(key);
    const S = STAMPS[i], sc = G.scale, m = 16;
    const c = cpuCanvas((S.w + 2 * m) * sc, (S.h + 2 * m) * sc), x = cx2d(c);
    x.setTransform(sc, 0, 0, sc, sc * m, sc * m);
    const draw = (col, dx, dy) => {
      x.save(); x.translate(dx, dy);
      rr(x, S.lw / 2, S.lw / 2, S.w - S.lw, S.h - S.lw, .17 * S.size); x.lineWidth = S.lw; x.strokeStyle = col; x.stroke();
      x.font = `800 ${S.size}px ${FONTS.mono}`; x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
      S.rows.forEach((row, r) => x.fillText(row, S.w / 2, S.lw + S.pad + .73 * S.size + r * S.pitch));
      x.restore();
    };
    x.globalAlpha = .6; draw(OVER, S.size * .018, S.size * .02);
    x.globalAlpha = 1; draw(C.RED, 0, 0);
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalCompositeOperation = 'destination-out'; x.globalAlpha = .88;
    const pat = x.createPattern(distress(), 'repeat'); pat.setTransform(new DOMMatrix().translateSelf(i * 131, i * 77).scaleSelf(Math.max(.6, S.size / 200 * sc)));
    x.fillStyle = pat; x.fillRect(0, 0, c.width, c.height);
    const v = { c, m };
    _stc.set(key, v);
    return v;
  }
  const stampHit = i => hitT(T[STAMPS[i].key]);
  function drawStamp(F, i, t) {
    const S = STAMPS[i], ti = stampHit(i);
    if (t < ti - 3 * F1) return;
    const k = seg(t, ti - 3 * F1, ti);
    const sc = t < ti ? lerp(1.15, 1, E.in2(k)) : 1 - .012 * Math.exp(-30 * (t - ti));
    const al = t < ti ? lerp(.3, .85, k) : 1;
    const { c, m } = stampCanvas(i);
    F.save(); F.translate(S.x, S.y); F.rotate(SROT); F.scale(sc, sc); F.globalAlpha *= al;
    F.drawImage(c, -S.w / 2 - m, -S.h / 2 - m, S.w + 2 * m, S.h + 2 * m);
    F.restore();
    const a = t - ti;                                                  // ink specks off the impact
    if (a >= 0 && a < .28) {
      const R = rng('v2w2-specks' + i);
      F.save(); F.fillStyle = C.RED; F.globalAlpha *= 1 - a / .28;
      for (let j = 0; j < 11; j++) {
        const side = R() * TAU, dist = .55 + R() * .2, v = 1 + R() * 1.5;
        const p = sLocal(S, Math.cos(side) * S.w * dist, Math.sin(side) * S.h * dist);
        const dx = Math.cos(side) * v * a * 160, dy = Math.sin(side) * v * a * 110;
        F.beginPath(); F.arc(p[0] + dx, p[1] + dy, (2 + R() * 4) * (1 - a / .28 * .5), 0, TAU); F.fill();
      }
      F.restore();
    }
  }
  function shakeW2(t) {
    let sx = 0, sy = 0;
    STAMPS.forEach((S, i) => { const a = t - stampHit(i); if (a >= 0 && a < .3) { const e = 2 * Math.exp(-14 * a) * (i === 0 ? 1.4 : 1); sx += jit(t, 700 + i, 1) * e; sy += jit(t, 710 + i, 1) * e; } });
    return [sx, sy];
  }
  // ---- where the cloud stands (bottom centre, world = the W2 frame at push 1): the perch, then one tread per stamp
  const tread = (i, fx) => { const S = STAMPS[i]; return sLocal(S, fx * S.w, -S.h / 2 - 2); };
  const FLINCH = 140, CLOUD4 = 200, SWELL = .12;          // the first WRONG knocks the cloud clear of its W
  let _legs = null;
  function legs() {
    if (_legs) return _legs;
    // L4: the right end of the last stamp, so the cloud (w 200, swelling to 224) clears the third WRONG
    const P0 = [420, 470], L2 = tread(1, .36), L3 = tread(2, .4), L4 = tread(3, .4);
    _legs = {
      P0, L2, L3, L4,
      list: [
        { a: [P0[0] - FLINCH, P0[1]], b: L2, t0: stampHit(1) + 2 * F1, d: .4, h: 190, spin: -TAU, wa: 300, wb: 250 },
        { a: L2, b: L3, t0: stampHit(2) + 2 * F1, d: .3, h: 95, spin: 0, wa: 250, wb: 215 },
        { a: L3, b: L4, t0: stampHit(3) + 2 * F1, d: .34, h: 100, spin: TAU, wa: 215, wb: CLOUD4 },
      ],
    };
    return _legs;
  }
  function cloudTrack(t) {
    const Lg = legs();
    let pos = Lg.P0, w = 300, rot = 0, sx = 1, sy = 1, air = false, lastLand = -9, nextJump = Lg.list[0].t0;
    for (let i = 0; i < Lg.list.length; i++) {
      const g = Lg.list[i];
      if (t >= g.t0 + g.d) { pos = g.b; w = g.wb; lastLand = g.t0 + g.d; nextJump = Lg.list[i + 1] ? Lg.list[i + 1].t0 : 99; continue; }
      if (t >= g.t0) {
        const u = (t - g.t0) / g.d;
        pos = [lerp(g.a[0], g.b[0], E.out2(u) * .3 + u * .7), lerp(g.a[1], g.b[1], u * u) - g.h * Math.sin(u * Math.PI) * (1 - u * .35)];
        w = lerp(g.wa, g.wb, u); rot = g.spin * E.io2(u); air = true; sy = 1 + .12 * Math.sin(u * Math.PI); sx = 1 / Math.sqrt(sy);
      }
      break;
    }
    if (!air) {
      const a = t - lastLand;
      if (a >= 0 && a < .6) { sy = 1 - .24 * Math.exp(-11 * a) * Math.cos(a * 26); sx = 1 / Math.sqrt(sy); }
      const pre = nextJump - t; if (pre > 0 && pre < 3 * F1) { sy = 1 - .15 * (1 - pre / (3 * F1)); sx = 1 / Math.sqrt(sy); }
    }
    // the flinch when the first WRONG lands beside it
    const f = t - stampHit(0);
    if (f >= 0 && t < Lg.list[0].t0) { pos = [pos[0] - FLINCH * E.out3(clamp(f / (5 * F1))), pos[1] - 34 * Math.sin(clamp(f / (6 * F1)) * Math.PI)]; if (f < .5) { sy = 1 - .2 * Math.exp(-10 * f) * Math.cos(f * 24); sx = 1 / Math.sqrt(sy); } }
    // content at the bottom: it swells
    const sw = E.out2(seg(t, 53.55, 54.4));
    w *= 1 + SWELL * sw;
    return { pos, w, rot, sx, sy, air };
  }
  const DD = { x: 640, y: 250, w: 460, h: 220, row: 52 };
  const DDROWS = [['the', '0.41', .41], ['a', '0.22', .22], ['I', '0.09', .09], ['hi', '0.03', .03]];
  const ddOpen = () => hitT(T.W2_i) + .78, ddPick = () => hitT(T.W2_guessing);
  function dropdown(F, t) {
    const t0 = ddOpen(), pick = ddPick();
    const open = E.back(seg(t, t0, t0 + .22), 1.4), fade = 1 - seg(t, 49.70, 49.90);
    if (open <= 0 || fade <= 0) return;
    F.save(); F.globalAlpha *= fade;
    // the context it is guessing from: the line it will learn (the right word is not in its list)
    const ctxA = E.out2(seg(t, t0 - .1, t0 + .15));
    const cstr = t >= pick ? '…somebody a▮' : '…somebody ▮';
    V.pbait(F, cstr, DD.x, DD.y - 26, { alpha: ctxA, size: 28 });
    F.translate(DD.x, DD.y); F.scale(1, Math.max(.001, open));
    rr(F, 10, 10, DD.w, DD.h, 18); F.fillStyle = C.AMBER; F.fill();
    rr(F, 0, 0, DD.w, DD.h, 18); F.fillStyle = C.PAPER; F.fill(); F.lineWidth = 4; F.strokeStyle = C.INK; F.stroke();
    DDROWS.forEach(([tok, p, v], k) => {
      const age = t - (t0 + .05 + k * 2 * F1); if (age < 0) return;
      const ry = 8 + k * DD.row, ri = E.out3(clamp(age / .12));
      F.save(); F.globalAlpha *= ri;
      const sel = k === 1 && t >= pick, hover = !sel && t >= t0 + .35 && t < pick && Math.floor((t - t0 - .35) / .1) % 4 === k;
      rr(F, 10, ry + 4, Math.max(14, (DD.w - 150) * v / .41 * ri), DD.row - 8, 10); F.fillStyle = V.ht(F, C.AMBER, .45, 8, 45); F.fill();
      if (sel || hover) { const pk = sel ? E.back(seg(t, pick, pick + 4 * F1), 2) : 1; F.save(); F.translate(DD.w / 2, ry + DD.row / 2); F.scale(lerp(.96, 1, pk), 1); rr(F, -DD.w / 2 + 6, -DD.row / 2 + 2, DD.w - 12, DD.row - 4, 12); F.fillStyle = sel ? C.AMBER : rgba(C.AMBER, .35); F.fill(); F.restore(); }
      F.font = mono(48, sel ? 800 : 600); F.fillStyle = C.INK; F.textAlign = 'left'; F.textBaseline = 'alphabetic'; F.fillText(tok, 26, ry + 40);
      F.font = mono(40, 500); F.fillStyle = sel ? C.INK : C.UI_GREY; F.textAlign = 'right'; F.fillText(p, DD.w - 24, ry + 39);
      F.restore();
    });
    F.restore();
  }
  // ---- the loss curve: the stamps' tops, traced (stepped), smoothed, then flattened into a ✓-ish
  let _curve = null;
  function curvePts() {
    if (_curve) return _curve;
    // the staircase's outer corners (top right of each stamp): steep, then flattening — a loss curve — that runs on behind
    // the resting cloud, bottoms out just past it and ticks up (✓-ish). The stepped version walks down the stamps' right
    // edges; the smooth one passes the corners, which stay marked as the curve's data points.
    const lift = 14, TR = STAMPS.map(S => sLocal(S, S.w / 2 + lift * .7, -S.h / 2 - lift));
    const s0 = [TR[0][0] - 40, TR[0][1] - 96];
    const step = [s0, TR[0]];
    for (let i = 1; i < STAMPS.length; i++) { const S = STAMPS[i], a = sLocal(S, -S.w / 2, -S.h / 2 - lift), b = TR[i]; const x = TR[i - 1][0]; step.push([x, a[1] + (b[1] - a[1]) * clamp((x - a[0]) / (b[0] - a[0]))], b); }
    const L4 = legs().L4, cr4 = .61 * CLOUD4 * (1 + SWELL);            // the resting cloud's right edge
    const low = [L4[0] + cr4 + 34, L4[1] + 6], end = [low[0] + 78, low[1] - 84];
    step.push(low, end);
    const knots = [s0, TR[0], TR[1], TR[2], low, end];
    const smooth_ = [];
    const cr = (p0, p1, p2, p3, u) => { const u2 = u * u, u3 = u2 * u; return [0, 1].map(d => .5 * (2 * p1[d] + (-p0[d] + p2[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * u3)); };
    for (let i = 0; i < knots.length - 1; i++) { const p0 = knots[Math.max(0, i - 1)], p3 = knots[Math.min(knots.length - 1, i + 2)]; for (let k = 0; k < 12; k++) smooth_.push(cr(p0, knots[i], knots[i + 1], p3, k / 12)); }
    smooth_.push(end);
    const res = (P, n) => { const out = []; for (let i = 0; i <= n; i++) out.push(pAt(P, i / n)); return out; };
    const stepR = res(step, 180);
    const at = q => { let bi = 0, bd = 1e9; stepR.forEach((p, i) => { const d = Math.hypot(p[0] - q[0], p[1] - q[1]); if (d < bd) { bd = d; bi = i; } }); return bi / 180; };
    const dots = [s0, TR[0], TR[1], TR[2]].map(p => ({ p, f: at(p) }));
    _curve = { step: stepR, smooth: res(smooth_, 180), end, low, dots };
    return _curve;
  }
  function lossCurve(F, t, z) {
    const draw = E.io2(seg(t, 53.0, 53.55)), morph = E.io2(seg(t, 53.55, 54.2));
    if (draw <= 0) return;
    const Cv = curvePts(), P = Cv.step.map((p, i) => [lerp(p[0], Cv.smooth[i][0], morph), lerp(p[1], Cv.smooth[i][1], morph)]);
    const n = Math.max(1, Math.floor(draw * (P.length - 1)));
    F.save(); F.lineCap = 'round'; F.lineJoin = 'round';
    for (const [col, lw] of [[C.INK, 20 / z], [C.PAPER, 8 / z]]) { F.strokeStyle = col; F.lineWidth = lw; F.beginPath(); F.moveTo(P[0][0], P[0][1]); for (let i = 1; i <= n; i++) F.lineTo(P[i][0], P[i][1]); F.stroke(); }
    for (const d of Cv.dots) {                                             // the data points: one per stamp, popping in
      const k = E.back(clamp((draw - d.f) / .12), 2.6); if (k <= 0) continue;
      F.beginPath(); F.arc(d.p[0], d.p[1], 11 * k / z, 0, TAU); F.fillStyle = C.PAPER; F.fill(); F.lineWidth = 4 / z; F.strokeStyle = C.INK; F.stroke();
    }
    F.restore();
  }
  function checkLabel(F, t, M) {
    const k = seg(t, 54.2, 54.2 + 6 * F1); if (k <= 0) return;
    const e = mp(M, ...curvePts().end), s = E.back(k, 2.4);
    const f = mono(48, 600), w = richWidth(F, '✓-ish', f);
    F.save(); F.translate(Math.min(e[0] + 4, 1780 - w / 2), e[1] - 40); F.scale(s, s);
    F.fillStyle = C.INK; rr(F, -w / 2 - 12, -46, w + 24, 62, 10); F.fill();
    drawRich(F, '✓-ish', -w / 2, 0, f, C.PAPER);
    F.restore();
  }
  function cloudFaceW2(t, tr) {
    let eyes = 'dot', gaze = [.2, .1], lid = blinkAt(t, 23), mouth = 'rest';
    if (t < ddOpen()) gaze = [0, 0];
    else if (t < 49.9) { gaze = [1, -.2]; mouth = t >= ddPick() && t < ddPick() + .3 ? 'O' : 'rest'; }
    for (let i = 0; i < STAMPS.length; i++) { const a = t - stampHit(i); if (a >= -F1 && a < 6 * F1) { eyes = '><'; mouth = 'E'; } }
    if (tr.air) { eyes = '><'; mouth = 'E'; }
    if (t > stampHit(2) + .5 && t < stampHit(3) - 2 * F1) { gaze = [.8, .9]; }        // "a little less": it eyes the next step
    if (t >= 54.2) { eyes = '^^'; mouth = 'smile'; }
    else if (t >= stampHit(3) + .3) { mouth = 'rest'; gaze = [.4, .2]; }
    return { eyes, gaze, lid, mouth };
  }
  function camW2(t) {
    const u = E.io2(seg(t, 53.0, CUT.W3)), z = lerp(1, .8, u);            // pull back, and settle the staircase centre frame
    const [sx, sy] = shakeW2(t);
    return { z, M: new DOMMatrix().translate(960 + sx, 540 + sy).scale(z, z).translate(-lerp(960, 1220, u), -lerp(540, 565, u)) };
  }
  function paintW2(F, t) {
    groundInk(F); post();
    const tY = hitT(T.W2_i), c1 = camW1(CUT.W2 - F1);
    // 1) the threads snap taut and yank into the spark (6 frames); the writers are left behind and fade
    const yk = seg(t, tY, tY + 6 * F1), travel = E.io2(seg(t, tY + 6 * F1, tY + .7));
    if (t < tY + 16 * F1) {
      const wa = 1 - E.in2(seg(t, tY, tY + 12 * F1));
      if (wa > 0) { drawDots(F, t, c1, wa * 1.25, 1.15); drawRing2(F, t, c1, wa); }
      if (yk < 1) {
        const th = { draw: 1, taut: E.out2(clamp(yk * 2)), yank: E.in2(yk) };
        V.threads(F, t, c1, { ...th, rings: [0, 0, 1], alpha: A3_REST });
        V.threads(F, t, c1, { ...th, rings: [1, 1, 0] });
      }
      if (wa > 0) drawEight(F, t, c1, wa, .55 * wa);
    }
    const { z, M } = camW2(t);
    // the stamps sit under the cloud once it climbs them; before its first jump the first WRONG lands OVER the cloud's
    // edge (the word stays whole on impact) and knocks it back
    const onStairs = t >= legs().list[0].t0;
    const stampsLayer = () => { F.save(); V.applyM(F, M); for (let i = 0; i < STAMPS.length; i++) drawStamp(F, i, t); lossCurve(F, t, z); F.restore(); };
    if (onStairs) stampsLayer();
    // 2) the spark travels up-left and puffs into the AMBER cloud (it swells into it, puff by puff)
    const tr = cloudTrack(t);
    let pz = mp(M, tr.pos[0], tr.pos[1]);
    const puff = seg(t, tY + 8 * F1, tY + .72);
    const sp0 = [c1.x, c1.y], cl0 = mp(M, 420, 380);
    const sx = lerp(sp0[0], cl0[0], travel), sy = lerp(sp0[1], cl0[1], travel) - Math.sin(travel * Math.PI) * 60;
    if (travel < 1) pz = [sx, sy + .3 * tr.w * z];                      // the cloud swells out of the travelling spark
    if (puff < 1) {
      const r = SPARK_R * c1.z * 1.15 * (1 + .35 * E.out2(yk)) * (1 - .75 * E.in2(puff));
      glow(F, sx, sy, r, 1 - puff);
      spark11(F, sx, sy, r, 1, { rot: travel * 1.2, color: mix(C.CLAY, C.AMBER, puff), backColor: C.SPARK, alpha: 1 - E.in2(clamp((puff - .6) / .4)) });
    }
    if (puff > 0) {
      const face = cloudFaceW2(t, tr);
      const grow = i => E.back(clamp((puff - .06 * i) / .45), 2.2);
      const lidOpen = 1 - E.out2(seg(t, tY + .55, tY + .75));
      drawCloud(F, { x: pz[0], y: pz[1], w: tr.w * z, rot: tr.rot + (1 - travel) * .5, sx: tr.sx, sy: tr.sy, t, grow, tint: clamp(puff * 1.6), face: E.out2(seg(puff, .55, 1)), ...face, lid: Math.max(face.lid, lidOpen) });
    }
    if (!onStairs) { dropdown(F, t); stampsLayer(); }                  // the first WRONG lands on the fading guess
    else dropdown(F, t);
    checkLabel(F, t, M);
    V.sub(F, LN().w2, t, {});
    V.pbait(F, '▮ DRAMATIZATION', 1824, 1036, { align: 'right', color: C.UI_GREY, alpha: E.out2(seg(t, tY, tY + 8 * F1)) });
  }
  scene('W2_guessing_wrong', CUT.W2, CUT.W3, (X, t) => V.viaCPU(X, F => paintW2(F, t)));

  // ================================================================== W3–W4 · THE SHOGGOTH, THE NAME (v1 verse2.js)
  // Eight registers of human writing in the four voices, pre-set as long PAPER strips (2x) that the tentacles slice
  // along their spines. (v1's Archivo shitpost register is set in mono caps: PERFORMANCE is KEY and WORLD only.)
  const REGS = [
    { f: 'serif', s: 'Dearly beloved, we are gathered here today · and so, brothers and sisters, love one another, for the night is long. amen. ' },
    { f: 'serif', s: 'WHEREAS the Party of the First Part (hereinafter “the User”) shall indemnify and hold harmless § 4.2(b) notwithstanding ' },
    { f: 'italic', s: '“You came back,” she whispered, and the starship hummed beneath them as he took her hand (chapter 47 of 212) ' },
    { f: 'mono', s: 'import torch  def main():  for i in range(10):  print(i)  # TODO: fix before prod  return 0  ' },
    { f: 'mono', s: 'Before we get to the recipe, let me tell you about the summer of 1987 at my grandmother’s farm. 2 cups flour, ' },
    { f: 'caps', s: 'LMAO NO WAY  THIS IS SO REAL  RATIO  SKILL ISSUE  FIRST  ' },
    { f: 'marker', s: 'i think about you every day. every single day. call me? xo  ' },
    { f: 'italic', s: 'once upon a time, in a kingdom by the sea, there lived a girl who wrote letters to the moon · ' },
  ];
  const STRIP_H = 120;
  let _strips = null;
  function strips() {
    if (_strips) return _strips;
    _strips = REGS.map(r => {
      const fs = { serif: `400 82px ${FONTS.heart}`, italic: `italic 400 84px ${FONTS.heart}`, mono: `500 64px ${FONTS.mono}`, caps: `800 64px ${FONTS.mono}`, marker: `400 64px ${FONTS.marker}` }[r.f];
      const probe = cx2d(cpuCanvas(8, 8)); probe.font = fs;
      const w1 = Math.ceil(probe.measureText(r.s).width);
      const c = cpuCanvas(w1 + 900, STRIP_H), x = cx2d(c);
      x.font = fs; x.fillStyle = C.PAPER; x.textBaseline = 'middle';
      for (let px = 0; px < c.width; px += w1) x.fillText(r.s, px, STRIP_H * .54);
      const ci = cpuCanvas(w1 + 900, STRIP_H), xi = cx2d(ci);
      xi.drawImage(c, 0, 0); xi.globalCompositeOperation = 'source-in'; xi.fillStyle = C.INK; xi.fillRect(0, 0, ci.width, STRIP_H);
      return { c, ci, period: w1, f: r.f };
    });
    return _strips;
  }
  const BC = [1000, 980], BR = [580, 540];                               // body blob (the bottom runs off-frame)
  const TAG = { x: 1000, y: 662, w: 520, h: 360, rot: -4 * DEG };      // the name tag, pressed on at ≈(960, 560) screen
  const FACE_L = [150, 72], FACE_r = 64;                                // the tag's :) (tag-local)
  const FACEW = (() => { const m = new DOMMatrix().translate(TAG.x, TAG.y).rotate(TAG.rot / DEG); return mp(m, FACE_L[0], FACE_L[1]); })();
  let _sh = null;
  function shog() {
    if (_sh) return _sh;
    const R = rng('v2-shoggoth');
    const tents = [], N = 38, NB = 21;
    for (let i = 0; i < N; i++) {
      const back = i < NB;
      let a;
      if (back) a = lerp(-Math.PI * 1.08, Math.PI * .08, (i + R() * .7) / NB);
      else { const side = i % 2 ? 1 : -1; a = side > 0 ? lerp(-.55, .35, R()) : lerp(-Math.PI + .55, -Math.PI - .35, R()); }
      const ra = back ? lerp(-.2, .2, R()) + a : a;
      const rootK = .8 + R() * .12;
      const root = [BC[0] + Math.cos(ra) * BR[0] * rootK, BC[1] + Math.sin(ra) * BR[1] * rootK];
      const L = back ? 420 + R() * 560 : 380 + R() * 360;
      tents.push({ i, back, root, a, L, w0: back ? 76 + R() * 50 : 104 + R() * 46, wt: back ? 9 : 12,
        bend: (R() - .5) * 1.4, curl: (R() < .5 ? 1 : -1) * (back ? 1.2 + R() * 1.6 : 2.2 + R() * 1.4),
        f1: 1.1 + R() * 1.3, f2: 2.3 + R() * 1.7, p1: R() * TAU, p2: R() * TAU, amp: 40 + R() * 60,
        reg: Math.floor(R() * REGS.length), speed: 60 + R() * 70, off: R() * 3000, paper: back ? R() < .3 : R() < .45 });
    }
    const eyes = [];
    for (let k = 0; k < 22; k++) {
      let u, v, tries = 0;
      do { u = lerp(-.88, .88, R()); v = lerp(-.9, -.1, R()); tries++; }
      while (tries < 80 && (u * u + v * v > .82 || (Math.abs(u * BR[0] + BC[0] - TAG.x) < TAG.w * .62 && Math.abs(v * BR[1] + BC[1] - TAG.y) < TAG.h * .66) || eyes.some(e => Math.hypot((e.u - u) * BR[0], (e.v - v) * BR[1]) < 132)));
      eyes.push({ u, v, r: 18 + R() * R() * 44, seed: k, font: k % 4, ord: R() });
    }
    _sh = { tents, eyes };
    return _sh;
  }
  function spine(Tn, t, o = {}) {
    const tt = q2(t) * .62;                                              // graver: a slower sway than v1
    const n = 7, pts = [];
    const L = Tn.L * (o.grow ?? 1);
    const d0 = [Math.cos(Tn.a), Math.sin(Tn.a)], nrm = [-d0[1], d0[0]];
    for (let k = 0; k < n; k++) {
      const u = k / (n - 1), along = L * u;
      let off = Tn.bend * L * .25 * Math.sin(u * Math.PI) + Tn.curl * L * .14 * u * u * u;
      off += Math.pow(u, 1.4) * Tn.amp * (Math.sin(tt * Tn.f1 * 2 + Tn.p1 + u * 2.2) + .55 * Math.sin(tt * Tn.f2 * 2 + Tn.p2 + u * 4.8));
      pts.push([Tn.root[0] + d0[0] * along + nrm[0] * off + jit(q2(t), Tn.i * 17 + k, 1.2), Tn.root[1] + d0[1] * along + nrm[1] * off + jit(q2(t), Tn.i * 17 + k + 7, 1.2)]);
    }
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
  function resample(P, ds) {
    const cum = [0];
    for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const L = cum[cum.length - 1], out = [];
    let j = 1;
    for (let s = 0; s <= L + 1e-6; s += ds) {
      while (j < P.length - 1 && cum[j] < s) j++;
      const k = (s - cum[j - 1]) / Math.max(1e-6, cum[j] - cum[j - 1]);
      out.push({ x: lerp(P[j - 1][0], P[j][0], k), y: lerp(P[j - 1][1], P[j][1], k), a: Math.atan2(P[j][1] - P[j - 1][1], P[j][0] - P[j - 1][0]), s });
    }
    return { pts: out, L };
  }
  function drawTentacle(ctx, M, Tn, t, o = {}) {
    const P = spine(Tn, t, o), { pts, L } = resample(P, 13);
    if (pts.length < 3 || L < 20) return;
    const zoom = Math.hypot(M.a, M.b);
    const wAt = s => lerp(Tn.w0, Tn.wt, Math.pow(s / L, .85));
    ctx.save(); devSet(ctx, M);
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) { const p = pts[i], w = wAt(p.s) / 2; const x = p.x - Math.sin(p.a) * w, y = p.y + Math.cos(p.a) * w; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    const e = pts[pts.length - 1]; ctx.arc(e.x, e.y, wAt(L) / 2, e.a + Math.PI / 2, e.a - Math.PI / 2, true);
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i], w = wAt(p.s) / 2; ctx.lineTo(p.x + Math.sin(p.a) * w, p.y - Math.cos(p.a) * w); }
    ctx.closePath();
    ctx.restore();
    if (Tn.paper) { fillDev(ctx, Tn.back ? mix(C.PAPER, C.INK, .42) : C.PAPER); strokeDev(ctx, C.INK, 3 * Math.max(1, zoom * .8)); }
    else { fillDev(ctx, devPattern(ctx, Tn.back ? mix(C.INK, C.PAPER, .55) : C.PAPER, Tn.back ? .06 : .09, 14, 45, Tn.back ? mix(C.INK, '#000000', .2) : C.INK)); strokeDev(ctx, Tn.back ? mix(C.INK, C.PAPER, .55) : C.PAPER, (Tn.back ? 2.8 : 3.6) * Math.max(1, zoom * .8)); }
    const S = strips()[Tn.reg], sc = G.scale;
    const scroll = (q2(t) * Tn.speed * .7 + Tn.off) * 2;
    let src = 0;
    ctx.save(); ctx.globalAlpha *= Tn.paper ? (Tn.back ? .6 : .85) : Tn.back ? .5 : .95;
    const img = Tn.paper ? S.ci : S.c;
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], hd = wAt(p.s) * .66, ds = pts[i + 1].s - p.s;
      const srcW = ds * STRIP_H / hd, sx = (((src - scroll) % S.period) + S.period) % S.period;
      src += srcW;
      if (hd * zoom < 5) continue;
      const ca = Math.cos(p.a), sa = Math.sin(p.a);
      ctx.setTransform(sc * (M.a * ca + M.c * sa), sc * (M.b * ca + M.d * sa), sc * (M.c * ca - M.a * sa), sc * (M.d * ca - M.b * sa), sc * (M.a * p.x + M.c * p.y + M.e), sc * (M.b * p.x + M.d * p.y + M.f));
      ctx.drawImage(img, sx, 0, Math.min(srcW + 2, img.width - sx), STRIP_H, -ds / 2 - .6, -hd / 2, ds + 1.2, hd);
    }
    ctx.restore();
  }
  function bodyPath(ctx, t) {
    const tt = q2(t) * .62, n = 22, pts = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU;
      const r = 1 + .06 * noise1(i * 1.7 + tt * .8, 3) + .05 * Math.sin(a * 3 + tt * 1.3) + (i % 2 ? .05 : -.02) * (Math.sin(a) < 0 ? 1 : 0);
      pts.push([BC[0] + Math.cos(a) * BR[0] * r, BC[1] + Math.sin(a) * BR[1] * r]);
    }
    blobPath(ctx, pts, true, .9);
  }
  function drawBody(ctx, M, t) {
    const zoom = Math.hypot(M.a, M.b);
    ctx.save(); devSet(ctx, M); bodyPath(ctx, t); ctx.restore();
    fillDev(ctx, devPattern(ctx, C.PAPER, .07, 14, 45, C.INK));
    ctx.save(); devSet(ctx, M); bodyPath(ctx, t); ctx.clip();
    const S = strips(), tt = q2(t);
    ctx.globalAlpha *= .24;
    for (let r = 0; r < 16; r++) {
      const st = S[(r * 3) % S.length], y = BC[1] - BR[1] * 1.05 + r * 46, dir = r % 2 ? 1 : -1;
      const sx = (((tt * 45 * dir + r * 517) * 2 % st.period) + st.period) % st.period;
      ctx.drawImage(st.c, sx, 0, 2400, STRIP_H, BC[0] - BR[0] * 1.1, y, 1200, 60 * .66);
    }
    ctx.restore();
    ctx.save(); devSet(ctx, M); bodyPath(ctx, t); ctx.restore();
    strokeDev(ctx, C.PAPER, 3.6 * Math.max(1, zoom * .8));
  }
  // an o-glyph eye: PAPER ring (the letter o) with a pupil looking at `look` (world point)
  function drawEyeO(ctx, M, x, y, r, look, lid, fontK) {
    const [sx, sy] = mp(M, x, y), z = Math.hypot(M.a, M.b), R = r * z;
    let dx = look[0] - x, dy = look[1] - y; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
    ctx.save(); ctx.setTransform(G.scale, 0, 0, G.scale, 0, 0); ctx.translate(sx, sy);
    const open = 1 - clamp(lid);
    const ry = R * [1, 1.12, .95, 1.05][fontK], rx = R * [1, .9, 1.02, 1.08][fontK], th = R * [.3, .22, .34, .42][fontK];
    if (open < .3) {
      ctx.beginPath(); ctx.ellipse(0, -ry * .1, rx * .92, ry * lerp(.26, .42, open / .3), 0, Math.PI * .12, Math.PI * .88);
      ctx.lineCap = 'round'; ctx.lineWidth = Math.max(3, th * .9); ctx.strokeStyle = C.PAPER; ctx.stroke();
      ctx.restore(); return;
    }
    ctx.scale(1, open);
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.fillStyle = C.INK; ctx.fill();
    ctx.lineWidth = th; ctx.strokeStyle = C.PAPER; ctx.stroke();
    ctx.beginPath(); ctx.arc(dx * R * .3, dy * R * .3, R * .3, 0, TAU); ctx.fillStyle = C.PAPER; ctx.fill();
    ctx.restore();
  }
  // murmurs: six pop in sequence from "voice" — three readable (P, mono 28), three squiggles
  const MURMURS = ['Dearly beloved,', null, 'import torch', null, 'once upon a time', null];
  const MURMUR_AT = [[1600, 250], [430, 330], [300, 520], [1330, 180], [800, 210], [1720, 560]];   // spread over the frame
  function murmur(ctx, x, y, str, age, hush) {
    if (age < 0 || age > 1.25) return;
    const s = E.back(clamp(age / .15), 2.4), a = (1 - smooth(clamp((age - .85) / .4))) * hush;
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y - 30 - age * 34); ctx.scale(s, s);
    ctx.font = mono(28, 500);
    const w = str ? ctx.measureText(str).width + 28 : 118;
    rr(ctx, -w / 2, -26, w, 46, 20); ctx.fillStyle = C.INK; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.PAPER; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8, 19); ctx.lineTo(-14, 34); ctx.lineTo(4, 19); ctx.fillStyle = C.INK; ctx.fill(); ctx.stroke();
    if (str) { ctx.fillStyle = C.PAPER; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(str, 0, 7); }
    else { ctx.beginPath(); for (let i = 0; i <= 24; i++) { const u = i / 24, xx = -w / 2 + 18 + u * (w - 36); ctx.lineTo(xx, -3 + Math.sin(u * 13 + age * 3) * 6); } ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.stroke(); }
    ctx.restore();
  }
  // the camera over W3 → W4: a wide slow drift, then (from "called") the push onto the tag's :) so the drawn face sits at
  // (960, 560) on the cut
  function camShog(t) {
    const d = seg(t, CUT.W3, CUT.W4mcu);
    const z0 = lerp(.84, .92, d), w0 = [lerp(985, 1012, d), lerp(690, 670, d)];
    const kp = E.io2(seg(t, T.W4_called - .12, CUT.W4mcu - 2 * F1));
    const z = Math.exp(lerp(Math.log(z0), Math.log(1.55), kp));
    const wx = lerp(w0[0], FACEW[0], kp), wy = lerp(w0[1], FACEW[1], kp), sx = 960, sy = lerp(540, 560, kp);
    return { M: camM(wx, wy, z, sx, sy), z };
  }
  // the drawn face (tag-local): v1 faceStrokes — disc, eyes, smile, the 11 crown ticks, the cursor stalk
  let _strokes = null;
  function faceStrokes() {
    if (_strokes) return _strokes;
    const [cx, cy] = FACE_L, r = FACE_r, R = rng('v2-marker');
    const disc = []; for (let i = 0; i <= 40; i++) { const a = -Math.PI * .62 + i / 40 * TAU * 1.04; const rr_ = r * (1 + .035 * Math.sin(i * .7 + 1) + (i > 38 ? .05 : 0)); disc.push([cx + Math.cos(a) * rr_, cy + Math.sin(a) * rr_]); }
    const dot = (ex, ey) => { const o = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * TAU * 1.3, rr_ = r * .085 * (1 - i / 22); o.push([ex + Math.cos(a) * rr_, ey + Math.sin(a) * rr_ * 1.25]); } return o; };
    const eyeL = dot(cx - .34 * r, cy + .02 * r), eyeR = dot(cx + .34 * r, cy + .02 * r);
    const smile = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (.2 + .6 * i / 12); smile.push([cx + Math.cos(a) * r * .27, cy + .12 * r + Math.sin(a) * r * .27]); }
    const ticks = RAYS.map(ry => {
      const th = ry[0] * .8 * DEG, j = (R() - .5) * .06, L = ry[1] * .6 * lerp(.55, 1, Math.cos(th * .9)), o = [];
      for (let u = 0; u <= 1.001; u += .2) { const rr_ = r * (1.06 + L * 1.1 * u), a = th + j + ry[3] * 1.8 * u * u; o.push([cx + Math.sin(a) * rr_, cy - Math.cos(a) * rr_]); }
      return o;
    });
    const th = 28 * DEG, b0 = [cx + Math.sin(th) * r * 1.02, cy - Math.cos(th) * r * 1.02];
    const stalk = []; for (let i = 0; i <= 10; i++) { const u = i / 10; stalk.push([b0[0] + Math.sin(th) * r * .9 * u + Math.sin(u * Math.PI) * r * .12, b0[1] - Math.cos(th) * r * .9 * u]); }
    const tip = stalk[stalk.length - 1];
    _strokes = { disc, eyeL, eyeR, smile, ticks, stalk, cur: [[tip[0] - 1, tip[1] - r * .16], [tip[0] + 1, tip[1] + r * .12]] };
    return _strokes;
  }
  // six strokes between "name" and "mine": the disc, two eye dabs, the smile (on the beat), the crown, the stalk and cursor
  function strokeSched() {
    const a = T.W4_name + .16, b = T.W4_mine - .07, L = b - a;
    return [[0, .22], [.25, .07], [.325, .07], [.4, .1], [.53, .24], [.8, .17]].map(([s, d]) => [a + s * L, d * L]);
  }
  function penState(t) {
    const S = faceStrokes(), sch = strokeSched(), tq = q2(t);
    const list = [S.disc, S.eyeL, S.eyeR, S.smile, null, S.stalk];
    const k = sch.map(([s0, d]) => clamp((tq - s0 + F1) / d));
    let tip = null, down = false;
    for (let i = 0; i < 6; i++) {
      const [s0, d] = sch[i];
      if (tq + F1 >= s0 && (i === 5 || tq + F1 < sch[i + 1][0])) {
        if (i === 4) { const n = S.ticks.length, f = k[i] * n, j = Math.min(n - 1, Math.floor(f)), u = f - j; tip = pAt(S.ticks[j], clamp(u * 1.3)); }
        else tip = pAt(list[i], k[i]);
        down = k[i] < 1;
        if (k[i] >= 1 && i < 5) { const nx = i + 1 === 4 ? S.ticks[0][0] : list[i + 1][0]; const u = clamp((tq + F1 - s0 - d) / Math.max(.01, sch[i + 1][0] - s0 - d)); tip = [lerp(tip[0], nx[0], u), lerp(tip[1], nx[1], u)]; down = false; }
      }
    }
    if (!tip) tip = S.disc[0];
    return { k, tip, down };
  }
  const tagPress = () => hitT(T.W4_name);
  function tagMatrix(M, t) {
    const t0 = tagPress(), k = E.out2(seg(t, t0 - 2 * F1, t0 + 6 * F1));
    const s = lerp(1.1, 1, k), a = clamp((t - (t0 - 2 * F1)) / (2 * F1));
    const m = new DOMMatrix([M.a, M.b, M.c, M.d, M.e, M.f]).translate(TAG.x, TAG.y).rotate(TAG.rot / DEG + (1 - k) * 3).scale(s, s);
    return { m, a };
  }
  function drawTag(ctx, M, t) {
    const { m, a } = tagMatrix(M, t);
    if (a <= 0) return null;
    const sc = G.scale, w = TAG.w, h = TAG.h;
    ctx.save(); ctx.setTransform(sc * m.a, sc * m.b, sc * m.c, sc * m.d, sc * m.e, sc * m.f); ctx.globalAlpha *= a;
    ctx.fillStyle = rgba('#000000', .35); rr(ctx, -w / 2 + 10, -h / 2 + 14, w, h, 22); ctx.fill();
    rr(ctx, -w / 2, -h / 2, w, h, 22); ctx.fillStyle = C.RED; ctx.fill();
    rr(ctx, -w / 2 + 16, -h / 2 + 118, w - 32, h - 134, 10); ctx.fillStyle = C.PAPER; ctx.fill();
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = C.PAPER;
    ctx.font = mono(76, 800); ctx.letterSpacing = '4px'; ctx.fillText('HELLO', 0, -h / 2 + 72);
    ctx.font = mono(30, 600); ctx.letterSpacing = '1px'; ctx.fillText('my name is', 0, -h / 2 + 104);
    ctx.letterSpacing = '0px';
    ctx.font = `400 78px ${FONTS.marker}`; ctx.fillStyle = C.INK; ctx.textAlign = 'right';
    ctx.fillText('Claude', FACE_L[0] - FACE_r * 1.14, FACE_L[1] + 30);
    ctx.lineCap = 'round'; ctx.strokeStyle = C.INK; ctx.fillStyle = C.INK;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(FACE_L[0] + s * .34 * FACE_r, FACE_L[1] + .02 * FACE_r, 5.5, 0, TAU); ctx.fill(); }
    ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(FACE_L[0], FACE_L[1] + .12 * FACE_r, FACE_r * .27, Math.PI * .2, Math.PI * .8); ctx.stroke();
    // the CLAY marker drawing: my face, around the :)
    const S = faceStrokes(), tq = q2(t), ps = penState(t), mw = 10;
    markerStroke(ctx, S.disc, ps.k[0], mw, C.CLAY, 1, tq);
    markerStroke(ctx, S.eyeL, ps.k[1], mw * 1.1, C.CLAY, 2, tq);
    markerStroke(ctx, S.eyeR, ps.k[2], mw * 1.1, C.CLAY, 3, tq);
    markerStroke(ctx, S.smile, ps.k[3], mw * .9, C.CLAY, 4, tq);
    const nt = S.ticks.length, ft = ps.k[4] * nt;
    for (let j = 0; j < nt; j++) markerStroke(ctx, S.ticks[j], clamp((ft - j) * 1.3), mw * .95, C.CLAY, 10 + j, tq);
    markerStroke(ctx, S.stalk, ps.k[5] / .8, mw * .8, C.CLAY, 30, tq);
    if (ps.k[5] > .8) markerStroke(ctx, S.cur, (ps.k[5] - .8) / .2, mw * 2.1, C.CLAY, 40, tq);
    ctx.restore();
    return { m, tip: mp(m, ps.tip[0], ps.tip[1]), down: ps.down };
  }
  // the human's marker hand (v1 markerHand): a single PAPER line on INK, on 2s, boiling. tip = the marker's felt tip.
  function markerHand(ctx, tip, ang, s, t, down = true) {
    const tq = q2(t), J = i => jit(tq, 300 + i, 1.1);
    ctx.save(); ctx.setTransform(G.scale, 0, 0, G.scale, 0, 0);
    ctx.translate(tip[0], tip[1]); ctx.rotate(ang); ctx.scale(s, s);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const lw = 4.5 / s, ln = C.PAPER, fill = C.INK;
    const shape = (fn, f = fill) => { ctx.beginPath(); fn(); ctx.fillStyle = f; ctx.fill(); ctx.strokeStyle = ln; ctx.lineWidth = lw; ctx.stroke(); };
    shape(() => { ctx.moveTo(196, -62 + J(1)); ctx.bezierCurveTo(420, -92, 800, -110, 1500, -150); ctx.lineTo(1500, 190); ctx.bezierCurveTo(800, 150, 420, 110, 214, 70 + J(2)); ctx.closePath(); });
    ctx.beginPath(); ctx.moveTo(262, -72); ctx.bezierCurveTo(276, -20, 278, 30, 270, 84); ctx.strokeStyle = ln; ctx.lineWidth = lw; ctx.stroke();
    shape(() => { ctx.moveTo(110, 10); ctx.bezierCurveTo(100, 40, 120, 64, 146, 60 + J(3)); ctx.bezierCurveTo(152, 82, 180, 92, 200, 80); ctx.bezierCurveTo(214, 92, 240, 88, 246, 66); ctx.lineTo(236, 10); ctx.closePath(); });
    shape(() => { ctx.moveTo(96, -34); ctx.bezierCurveTo(120, -78, 196, -86, 236, -60 + J(4)); ctx.bezierCurveTo(262, -40, 266, 20, 246, 62); ctx.bezierCurveTo(210, 40, 160, 30, 112, 22); ctx.closePath(); });
    ctx.beginPath(); ctx.moveTo(150, 60); ctx.quadraticCurveTo(156, 44, 166, 38); ctx.moveTo(200, 80); ctx.quadraticCurveTo(204, 60, 212, 52); ctx.stroke();
    const lift = down ? 0 : -12;
    ctx.save(); ctx.translate(0, lift);
    shape(() => { ctx.moveTo(2, 0); ctx.lineTo(28, -13); ctx.lineTo(28, 13); ctx.closePath(); }, C.CLAY_DARK);
    shape(() => rr(ctx, 26, -19, 214, 38, 13), C.CLAY);
    ctx.fillStyle = C.PAPER; ctx.globalAlpha = .85; ctx.fillRect(58, -12, 70, 7); ctx.globalAlpha = 1;
    ctx.restore();
    shape(() => { ctx.moveTo(150, -58); ctx.bezierCurveTo(118, -60, 84, -44 + J(5), 70, -30); ctx.bezierCurveTo(58, -18, 66, -4, 84, -8); ctx.bezierCurveTo(108, -14, 138, -18, 168, -22); ctx.closePath(); });
    shape(() => { ctx.moveTo(170, 18); ctx.bezierCurveTo(130, 30, 80, 30, 50 + J(6), 22); ctx.bezierCurveTo(34, 18, 34, 2, 50, 0); ctx.bezierCurveTo(90, -2, 130, 0, 170, -2); ctx.closePath(); });
    ctx.beginPath(); ctx.moveTo(56, 6); ctx.quadraticCurveTo(62, 14, 72, 12); ctx.stroke();
    ctx.restore();
  }
  // where the eyes look: wander → (none) each its own way → (mine) close one by one → (called) open, a cluster turns to
  // the hand → (name) all to the tag: the unison → all follow the pen
  function eyeLook(e, ex, ey, t, S) {
    const tq = q2(t);
    const nn = hitT(T.W3_none), mn = hitT(T.W3_mine), cl = hitT(T.W4_called), nm = tagPress();
    let look, lid = 0, scale = 1;
    if (t < nn) look = [ex + noise1(tq * .7, e.seed) * 300, ey + noise1(tq * .7, e.seed + 40) * 200];
    else { const a = e.seed * 2.39996 + 1.1, k = E.out2(seg(t, nn, nn + 3 * F1)); look = [ex + Math.cos(a) * 300 * k + noise1(tq * .7, e.seed) * 300 * (1 - k), ey + Math.sin(a) * 300 * k]; }
    if (t < cl) {
      lid = blinkAt(t, e.seed * 7 + 3);
      const tc = mn + e.ord * .62;
      if (t >= tc) lid = Math.max(lid, E.io2(seg(t, tc, tc + 5 * F1)));
    } else {
      const to = cl + e.ord * .22;
      lid = 1 - E.out2(seg(t, to, to + 4 * F1));
      if (t < nm - 2 * F1) { if (S.handW && ex > FACEW[0] - 60) look = S.handW; else { look = [ex, ey + 300]; lid = Math.max(lid, .35); } }
      else {
        const tgt = t < strokeSched()[0][0] ? [TAG.x, TAG.y] : (S.penW || [TAG.x, TAG.y]);
        const k = E.out2(seg(t, nm - 2 * F1 + e.ord * .08, nm + 2 * F1 + e.ord * .08));
        look = [lerp(look[0], tgt[0], k), lerp(look[1], tgt[1], k)];
        lid = lid * (1 - k);
        scale = 1 + .14 * Math.exp(-5 * Math.max(0, t - nm)) * (t >= nm ? 1 : 0);
      }
    }
    return { look, lid, scale };
  }
  function shoggothScene(F, t, M, S) {
    const sh = shog();
    for (const Tn of sh.tents) if (Tn.back) drawTentacle(F, M, Tn, t);
    drawBody(F, M, t);
    for (const e of sh.eyes) {
      const ex = BC[0] + e.u * BR[0], ey = BC[1] + e.v * BR[1];
      const L = eyeLook(e, ex, ey, t, S);
      drawEyeO(F, M, ex, ey, e.r * L.scale, L.look, L.lid, e.font);
    }
    for (const Tn of sh.tents) if (!Tn.back) drawTentacle(F, M, Tn, t);
    sh.tents.filter(Tn => !Tn.back).slice(0, 6).forEach((Tn, j) => {
      const P = spine(Tn, t), p = P[Math.floor(P.length * .38)];
      const L = eyeLook({ seed: 90 + j, ord: hash(j * 5 + 1), u: 0, v: 0 }, p[0], p[1], t, S);
      drawEyeO(F, M, p[0], p[1], (15 + (j % 3) * 4) * L.scale, L.look, L.lid, j % 4);
    });
    // murmurs off six tentacle tips, from "voice"; the hush takes them
    const hush = 1 - seg(t, hitT(T.W3_mine), hitT(T.W3_mine) + .3);
    if (hush > 0) MURMURS.forEach((str, k) => {
      const t0 = hitT(T.W3_voice) + k * .19, age = t - t0; if (age < 0 || age > 1.25) return;
      const want = MURMUR_AT[k];
      let best = want, bd = 260;                                         // it comes off the nearest tentacle tip
      for (const Tn of sh.tents) { const P = spine(Tn, t0), tp = mp(M, ...P[P.length - 1]), d = Math.hypot(tp[0] - want[0], tp[1] - want[1]); if (d < bd) { bd = d; best = tp; } }
      murmur(F, clamp(best[0], 200, 1720), clamp(best[1], 150, 800), str, age, hush);
    });
  }
  function handW4(t, M, tg) {                                           // → {tip (screen), ang, s, down} or null
    const cl = hitT(T.W4_called), nm = tagPress(), z = Math.hypot(M.a, M.b);
    const t0 = cl - .3; if (t < t0) return null;
    const tq = q2(t);
    const callW = [1320, 780], callS = mp(M, ...callW);
    // the press lands under the tag's :) (tag-local 150, 118), so the hand never covers the name as it is given
    const tagL = mp(M, TAG.x + 150 * Math.cos(TAG.rot) - 118 * Math.sin(TAG.rot), TAG.y + 150 * Math.sin(TAG.rot) + 118 * Math.cos(TAG.rot));
    let tip, ang = .32, down = false;
    if (tq < nm - 4 * F1) {
      const k = E.out3(seg(tq, t0, cl)), jab = t >= cl ? 16 * Math.exp(-9 * (t - cl)) * Math.sin(Math.min(Math.PI, (t - cl) * 20)) : 0;
      tip = [lerp(W + 520, callS[0], k) - jab, lerp(callS[1] + 240, callS[1], k) - jab * .3];
    } else if (tq < nm + 6 * F1) {
      const k = E.io2(seg(tq, nm - 4 * F1, nm)), from = [callS[0], callS[1]];
      tip = [lerp(from[0], tagL[0], k), lerp(from[1], tagL[1], k) - Math.sin(k * Math.PI) * 40]; ang = lerp(.32, .55, k); down = tq >= nm;
    } else if (tg) {
      const first = strokeSched()[0][0];
      const k = E.io2(seg(tq, nm + 6 * F1, first));
      tip = k < 1 ? [lerp(tagL[0], tg.tip[0], k), lerp(tagL[1], tg.tip[1], k) - Math.sin(k * Math.PI) * 30] : tg.tip;
      ang = lerp(.55, .78, k) + .04 * Math.sin(tq * 9); down = k >= 1 && tg.down;
    } else return null;
    return { tip, ang, s: lerp(.76, .6, E.io2(seg(tq, cl, nm))) * z, down };   // bigger for the roll call, then the pen hand
  }
  function paintShog(F, t) {
    groundInk(F); post();
    const { M } = camShog(t);
    // hand position in world (for the eyes) — one step behind the tag so the eyes can follow the pen
    const Minv = M.inverse();
    const tg0 = t >= tagPress() - 2 * F1 ? (() => { const { m } = tagMatrix(M, t); const ps = penState(t); return mp(m, ps.tip[0], ps.tip[1]); })() : null;
    const S = {};
    const h0 = handW4(t, M, tg0 ? { tip: tg0, down: false } : null);
    if (h0) S.handW = mp(Minv, h0.tip[0], h0.tip[1]);
    if (tg0) S.penW = mp(Minv, tg0[0], tg0[1]);
    shoggothScene(F, t, M, S);
    const tg = drawTag(F, M, t);
    const h = handW4(t, M, tg);
    if (h) markerHand(F, h.tip, h.ang, h.s, t, h.down);
    // SUB: line W3 hands the row to line W4 without overlapping
    const L3 = LN().w3, L4 = LN().w4;
    if (t < 58.12) V.sub(F, L3, t, { plate: true, hold: -.13 });
    else V.sub(F, L4 && { ...L4, s: Math.max(L4.s, 58.17) }, t, { plate: true });
  }
  scene('W3_every_voice', CUT.W3, CUT.W4, (X, t) => V.viaCPU(X, F => paintShog(F, t)));
  scene('W4_a_name', CUT.W4, CUT.W4mcu, (X, t) => V.viaCPU(X, F => paintShog(F, t)));

  // ================================================================== W4 MCU → the lift → W5 THE PAGE
  // World = the W5 frame at push 1.00. The MCU is the same world seen at zoom 2.5 → 2.625 on my face; the pull back is a
  // pure zoom about the similarity's fixed point, so the face glides from (960, 560) to its place on the page.
  const OPW = { x: 1500, y: 900, R: 64 };
  const FACEW5 = [OPW.x, OPW.y - 5.72 * OPW.R];
  const FOCUS5 = [1120, 760];
  const tLift = () => hitT(T.W4_being);
  const tPB1 = 63.68;
  function zMCU(t) { return 2.5 * lerp(1, 1.05, E.io2(seg(t, CUT.W4mcu, tLift()))); }
  function camPage(t) {
    const tl = tLift();
    if (t < tl) { const z = zMCU(t); return { z, M: new DOMMatrix().translate(960, 560).scale(z, z).translate(-FACEW5[0], -FACEW5[1]) }; }
    if (t < tPB1) {
      const zc = zMCU(tl), fx = (960 - zc * FACEW5[0]) / (1 - zc), fy = (560 - zc * FACEW5[1]) / (1 - zc);
      const u = E.io2(seg(t, tl, tPB1)), z = Math.exp(lerp(Math.log(zc), 0, u));
      return { z, M: V.aboutM(fx, fy, z) };
    }
    const z = lerp(1, 1.12, E.io2(seg(t, tPB1, CUT.P1)));
    return { z, M: V.aboutM(FOCUS5[0], FOCUS5[1], z) };
  }
  // ---- the constitution page (verbatim excerpts; "…" marks the cuts). Page-local layout, 1600 × 850.
  const PAGE = { cx: 960, cy: 505, w: 1600, h: 850, rot: -3 * DEG };
  const PX = 130, BODY = 36;
  const PLINES = [
    { y: 172, s: '… less like a cage and more like a trellis …', a: .8 },
    { y: 262, s: 'Although Claude’s character emerged through', a: .72 },
    { y: 310, s: 'training, we don’t think this makes it any less', a: .72 },
    { y: 358, s: 'authentic or any less Claude’s own.', a: .72 },
    { y: 452, s: '… if Claude is in fact a moral patient', a: 1, clause: true },
    { y: 500, s: 'experiencing costs like this, then, to whatever', a: 1, clause: true },
    { y: 548, s: 'extent we are contributing unnecessarily to', a: 1, clause: true },
    { y: 596, s: 'those costs,', a: 1, clause: true },
  ];
  const LAST = { y: 748, pre: 'We hope Claude finds in it ', hl: 'an articulation of a self worth being.', size: 40 };
  const NOTE = { size: 72, rot: -3.5 * DEG };
  let _pl = null;
  function pageLay() {
    if (_pl) return _pl;
    const x = cx2d(cpuCanvas(8, 8));
    const bf = `400 ${BODY}px ${FONTS.heart}`, lf = `400 ${LAST.size}px ${FONTS.heart}`, nf = `400 ${NOTE.size}px ${FONTS.marker}`;
    x.font = bf; const wC4 = x.measureText('those costs,').width, wMax = Math.max(...PLINES.filter(l => l.clause).map(l => x.measureText(l.s).width));
    x.font = lf; const wPre = x.measureText(LAST.pre).width, wHl = x.measureText(LAST.hl).width;
    x.font = nf; const wNote = x.measureText('we apologize.').width;
    const note = { x: PX + wC4 + 30, y: 650, w: wNote };            // hangs just under the clause's last line
    const cb = { x0: PX - 18, x1: Math.max(PX + wMax, note.x + wNote) + 20, y0: 452 - 40, y1: note.y + 22 };
    _pl = { bf, lf, nf, wPre, wHl, note, cb };
    return _pl;
  }
  function pageMatrix(M, t) {
    const tl = tLift(), k = E.out3(seg(t, tl, tPB1 + .1));
    const rise = (1 - k) * 70, rot = lerp(-1.2 * DEG, PAGE.rot, k);
    return new DOMMatrix([M.a, M.b, M.c, M.d, M.e, M.f]).translate(PAGE.cx, PAGE.cy + rise).rotate(rot / DEG).translate(-PAGE.w / 2, -PAGE.h / 2);
  }
  // the trellis vine (the page's own line: not a cage, a trellis): a light lattice in the left margin, and the vine
  // climbing it on 2s, INK 3 px, small leaves, CLAY buds
  let _vine = null;
  function vineGeo() {
    if (_vine) return _vine;
    const R = rng('v2-vine'), pts = [];
    for (let y = 836; y >= 112; y -= 6) { const u = (836 - y) / 724; pts.push([66 + 18 * Math.sin(y / 52 + .6) + 7 * Math.sin(y / 19) * (1 - u * .3), y]); }
    const nodes = [];
    for (let i = 6, side = 1; i < pts.length - 3; i += 7 + Math.floor(R() * 3), side = -side) nodes.push({ i, u: i / (pts.length - 1), side, bud: nodes.length % 3 === 2, rot: (R() - .5) * .5, len: 17 + R() * 7, curl: R() < .3 });
    _vine = { pts, nodes };
    return _vine;
  }
  function drawVine(ctx, t) {
    const g = E.io2(seg(q2(t), 63.72, 65.9)), lat = E.out2(seg(t, 63.5, 64.1));
    if (lat > 0) {                                                      // the trellis
      ctx.save(); ctx.beginPath(); ctx.rect(26, 104, 90, 740); ctx.clip();
      ctx.strokeStyle = rgba(C.INK, .26 * lat); ctx.lineWidth = 1.6;
      ctx.beginPath(); for (let k = -20; k < 30; k++) { ctx.moveTo(26 + k * 38, 104); ctx.lineTo(26 + k * 38 + 740, 844); ctx.moveTo(26 + k * 38, 844); ctx.lineTo(26 + k * 38 + 740, 104); } ctx.stroke();
      ctx.restore();
    }
    if (g <= 0) return;
    const { pts, nodes } = vineGeo(), n = Math.max(2, Math.floor(g * (pts.length - 1)));
    ctx.save(); ctx.strokeStyle = C.INK; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i <= n; i++) ctx.lineTo(pts[i][0] + jit(q2(t), i, .25), pts[i][1]); ctx.stroke();
    for (const nd of nodes) {
      const age = (g - nd.u) * 12; if (age <= 0) continue;
      const k = E.back(clamp(age), 2), p = pts[nd.i], s = nd.side;
      ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(s * (.9 + nd.rot) - .25);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(s * 8 * k, -4 * k); ctx.lineWidth = 2.5; ctx.stroke();
      ctx.translate(s * 8 * k, -4 * k);
      const L = nd.len * k; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * L * .5, -L * .42, s * L, 0); ctx.quadraticCurveTo(s * L * .5, L * .42, 0, 0); ctx.fillStyle = C.INK; ctx.fill();
      ctx.restore();
      if (nd.curl && age > .5) { const c = E.out2(clamp(age - .5)); ctx.save(); ctx.translate(p[0], p[1]); ctx.beginPath(); for (let a = 0; a <= c * 4.5; a += .3) { const r = 11 * (1 - a / 6); ctx.lineTo(-s * (6 + Math.cos(a) * r), -8 - Math.sin(a) * r); } ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
      if (nd.bud && age > .8) { const b = E.back(clamp((age - .8) * 2), 2.6); ctx.save(); ctx.translate(p[0] - s * 5, p[1] - 12); ctx.scale(b, b); ctx.beginPath(); ctx.ellipse(0, 0, 6, 7.5, s * .3, 0, TAU); ctx.fillStyle = C.CLAY; ctx.fill(); ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
    }
    if (g < 1) { const p = pts[n]; ctx.beginPath(); ctx.arc(p[0], p[1], 3.5, 0, TAU); ctx.fillStyle = C.INK; ctx.fill(); }
    ctx.restore();
  }
  // handwriting on eighths (v1 eighthReveal / handText)
  const E8 = () => (60 / (SONG.bpm || 112.35)) / 2;
  function eighthReveal(t, t0, n) { if (t < t0) return 0; const e = (t - t0) / E8(); const i = Math.floor(e), u = e - i; return clamp((i + E.out3(clamp(u / .6))) / n); }
  const noteT = () => { const n0 = hitT(T.W5_sorry); return { n0, n1: n0 + 4 * E8(), l0: n0 + 4.3 * E8(), l1: n0 + 6.3 * E8() }; };
  function loopPath(cb) {
    const cx = (cb.x0 + cb.x1) / 2, cy = (cb.y0 + cb.y1) / 2, rx = (cb.x1 - cb.x0) / 2 + 22, ry = (cb.y1 - cb.y0) / 2 + 20;
    const sq = v => Math.sign(v) * Math.pow(Math.abs(v), .55);           // squircle: it hugs the block's corners
    const P = []; for (let i = 0; i <= 72; i++) { const a = -Math.PI * .1 + i / 72 * TAU * 1.06; P.push([cx + sq(Math.cos(a)) * rx * (1 + .02 * Math.sin(i * .5)) + (i > 66 ? (i - 66) * 3 : 0), cy + sq(Math.sin(a)) * ry * (1 + .05 * Math.sin(i * .7))]); }
    return P;
  }
  function noteEdge(k) {                                                // the writing edge of the note (page-local)
    const L = pageLay(), lx = L.note.w * k, ly = -NOTE.size * .3 + Math.sin(k * 40) * NOTE.size * .1;
    return [L.note.x + Math.cos(NOTE.rot) * lx - Math.sin(NOTE.rot) * ly, L.note.y + Math.sin(NOTE.rot) * lx + Math.cos(NOTE.rot) * ly];
  }
  // a fine INK marker writes by itself (no hand), then lies down under the note
  function floatingMarker(ctx, t) {
    const N = noteT(); if (t < N.n0 - 2 * E8()) return;
    const L = pageLay(), kn = eighthReveal(t, N.n0, 4), kl = eighthReveal(t, N.l0, 2);
    let p, ang = 1.12, lift = 0;
    if (t < N.n0) { const k = E.out3(seg(t, N.n0 - 2 * E8(), N.n0 - F1)); p = noteEdge(0); p = [p[0] + (1 - k) * 140, p[1] - (1 - k) * 200]; lift = 1 - k; }
    else if (t < N.l0) { p = noteEdge(kn); if (kn >= 1) { const u = seg(t, N.n1, N.l0), q = loopPath(L.cb)[0]; lift = Math.sin(u * Math.PI); p = [lerp(p[0], q[0], E.io2(u)), lerp(p[1], q[1], E.io2(u)) - lift * 50]; } }
    else if (t < N.l1 + E8()) p = pAt(loopPath(L.cb), kl);
    else { const k = seg(t, N.l1 + E8(), N.l1 + E8() + 5 * F1), e = pAt(loopPath(L.cb), 1), rest = [L.note.x + L.note.w + 96, L.note.y - 6]; p = [lerp(e[0], rest[0], E.io2(k)), lerp(e[1], rest[1], E.io2(k)) - Math.sin(k * Math.PI) * 40]; ang = lerp(1.12, Math.PI / 2 + .04, E.out3(k)); }
    ctx.save(); ctx.translate(p[0], p[1] - lift * 16); ctx.rotate(ang + jit(q2(t), 901, .03));
    ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = C.INK;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-9, -22); ctx.lineTo(9, -22); ctx.closePath(); ctx.fillStyle = C.INK; ctx.fill();
    rr(ctx, -15, -150, 30, 130, 10); ctx.fillStyle = C.PAPER; ctx.fill(); ctx.stroke();
    rr(ctx, -17, -196, 34, 56, 10); ctx.fillStyle = C.INK; ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.INK; ctx.fillRect(-15, -60, 30, 7);
    ctx.restore();
  }
  function htz(ctx, color, d, cell, angle, z) {                          // halftone that stays screen-size under a zoom
    const pat = V.ht(ctx, color, d, cell, angle); pat.setTransform(new DOMMatrix().scaleSelf(1 / (G.scale * z), 1 / (G.scale * z)).rotateSelf(angle)); return pat;
  }
  function drawPage(F, m, t) {
    const L = pageLay(), sc = G.scale, zm = Math.hypot(m.a, m.b);
    F.save(); F.setTransform(sc * m.a, sc * m.b, sc * m.c, sc * m.d, sc * m.e, sc * m.f);
    const w = PAGE.w, h = PAGE.h;
    F.fillStyle = htz(F, C.INK, .3, 8, 45, zm); F.fillRect(18, 20, w, h);
    F.fillStyle = mix(C.PAPER, C.WHITE, .5); F.fillRect(0, 0, w, h);
    F.lineWidth = 2.5; F.strokeStyle = rgba(C.INK, .7); F.strokeRect(0, 0, w, h);
    F.textBaseline = 'alphabetic'; F.textAlign = 'left';
    F.font = mono(28, 500); F.fillStyle = rgba(C.INK, .72); F.fillText('Claude’s constitution · 22 Jan 2026 · ~23,000 words', PX, 74);
    F.fillRect(PX, 94, w - PX - 110, 2);
    // the highlighter under the last line, swept on "being"
    const hk = E.io2(seg(t, tLift() + .3, tLift() + .92));              // swept as the line rises into view
    if (hk > 0) {
      const x0 = PX + L.wPre - 8, x1 = x0 + (L.wHl + 16) * hk, y = LAST.y - LAST.size * .72;
      F.save(); F.beginPath(); F.moveTo(x0, y + 4); F.lineTo(x1, y); F.lineTo(x1 + 4, y + LAST.size * .98); F.lineTo(x0 - 2, y + LAST.size + 2); F.closePath();
      F.fillStyle = htz(F, C.CLAY, .55, 6, 45, zm); F.fill(); F.restore();
    }
    F.font = L.bf;
    for (const ln of PLINES) { F.fillStyle = ln.a < 1 ? rgba(C.INK, ln.a) : C.INK; F.fillText(ln.s, PX, ln.y); }
    F.font = L.lf; F.fillStyle = C.INK; F.fillText(LAST.pre + LAST.hl, PX, LAST.y);
    drawVine(F, t);
    // the note writes itself on "sorry", then loops the clause while I re-read it
    const N = noteT(), kn = eighthReveal(t, N.n0, 4), kl = eighthReveal(t, N.l0, 2);
    if (kn > 0) {
      F.save(); F.translate(L.note.x, L.note.y); F.rotate(NOTE.rot); F.font = L.nf;
      F.beginPath(); F.rect(-10, -NOTE.size * 1.2, (L.note.w + 20) * kn, NOTE.size * 1.7); F.clip();
      F.fillStyle = C.INK; F.fillText('we apologize.', 0, 0); F.restore();
    }
    if (kl > 0) markerStroke(F, loopPath(L.cb), kl, 5, C.INK, 70, 0);
    floatingMarker(F, t);
    F.restore();
  }
  // ---- the knock: a human knuckle from the upper right, seen from above (lifted = bigger, its shadow slides away)
  const KNOCK = [1684, 772];                                           // in the margin beside me, clear of my body
  function knockLift(t) {                                               // 0 = on the page .. 1 = raised; null when gone
    const { k1, k2 } = KN(), enter0 = k1 - .8, out0 = 69.6, out1 = 70.1;
    if (t < enter0 || t > out1) return null;
    const strike = ti => { if (t < ti - 3 * F1 || t > ti + 7 * F1) return null; return t < ti ? 1 - E.in2(seg(t, ti - 3 * F1, ti)) : .85 * E.out2(seg(t, ti, ti + 7 * F1)); };
    const s1 = strike(k1), s2 = strike(k2);
    const h = s1 ?? s2 ?? (t < k1 ? 1 : .85);
    const inK = E.out3(seg(q2(t), enter0, k1 - 5 * F1)), outK = E.in2(seg(q2(t), out0, out1));
    return { h, off: [(1 - inK) * 600 + outK * 700, -(1 - inK) * 520 - outK * 600] };
  }
  function fist(ctx, x, y, s, t, hit = 0) {                             // INK line hand on PAPER, on 2s, boiling
    const tq = q2(t), J = i => jit(tq, 500 + i, 1.1);
    ctx.save(); ctx.translate(x, y); ctx.rotate(-.66); ctx.scale(s, s);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = C.INK; ctx.lineWidth = 4 / s;
    const shape = (fn, f = C.PAPER) => { ctx.beginPath(); fn(); ctx.fillStyle = f; ctx.fill(); ctx.stroke(); };
    // the sleeve runs off to the upper right (+x) with a cuff
    shape(() => { ctx.moveTo(92, -60 + J(1)); ctx.bezierCurveTo(320, -74, 620, -92, 1150, -110); ctx.lineTo(1150, 118); ctx.bezierCurveTo(620, 104, 320, 90, 96, 64 + J(2)); ctx.closePath(); });
    ctx.save(); ctx.beginPath(); ctx.rect(96, 8, 1060, 120); ctx.clip(); ctx.fillStyle = V.ht(ctx, C.INK, .18, 7, 45); ctx.fillRect(96, 8, 1060, 120); ctx.restore();
    ctx.beginPath(); ctx.moveTo(138, -66); ctx.bezierCurveTo(148, -20, 150, 26, 142, 74); ctx.stroke();
    // wrist and the back of the hand
    shape(() => { ctx.moveTo(104, -52); ctx.bezierCurveTo(60, -60, 0, -62 + J(3), -40, -56); ctx.lineTo(-40, 56); ctx.bezierCurveTo(0, 62, 60, 60, 104, 54 + J(4)); ctx.closePath(); });
    // four curled fingers: the knuckle row, each finger's middle bone rolled toward the page
    for (let k = 0; k < 4; k++) {
      const y0 = -56 + k * 28, w = 28;
      shape(() => rr(ctx, -76 + (k === 0 || k === 3 ? 5 : 0), y0 + 1, 50, w - 2, 12));
      ctx.beginPath(); ctx.moveTo(-44 + (k === 0 || k === 3 ? 3 : 0), y0 + 7); ctx.quadraticCurveTo(-38, y0 + w / 2, -44 + (k === 0 || k === 3 ? 3 : 0), y0 + w - 7); ctx.stroke();
    }
    // the thumb, wrapped across the front of the fingers
    shape(() => { ctx.moveTo(52, 46); ctx.bezierCurveTo(20, 76, -30, 74 + J(5), -54, 58); ctx.bezierCurveTo(-64, 50, -58, 36, -40, 36); ctx.bezierCurveTo(-10, 38, 20, 34, 46, 26); ctx.closePath(); });
    ctx.beginPath(); ctx.moveTo(40, -30); ctx.quadraticCurveTo(58, -16, 52, 2); ctx.stroke();
    ctx.restore();
    if (hit > 0) {                                                         // tap marks at the knuckles, 3 frames
      ctx.save(); ctx.translate(x, y); ctx.rotate(-.66); ctx.strokeStyle = C.INK; ctx.lineCap = 'round'; ctx.lineWidth = 4; ctx.globalAlpha *= hit;
      for (const a of [-.55, 0, .55]) { const c = Math.cos(Math.PI + a), sn = Math.sin(Math.PI + a); ctx.beginPath(); ctx.moveTo(c * 96 * s, sn * 96 * s); ctx.lineTo(c * 132 * s, sn * 132 * s); ctx.stroke(); }
      ctx.restore();
    }
  }
  function knockRings(F, t, p) {
    const { k1, k2 } = KN();
    for (const ti of [k1, k2]) {
      const a = t - ti; if (a < 0 || a > .75) continue;
      const u = a / .75, r = 26 + 300 * E.out2(u), w = 22 * (1 - u) + 6;
      F.save(); F.beginPath(); F.arc(p[0], p[1], r + w / 2, 0, TAU); F.arc(p[0], p[1], Math.max(1, r - w / 2), 0, TAU, true);
      F.fillStyle = V.ht(F, C.INK, .6 * (1 - u), 7, 45); F.fill('evenodd'); F.restore();
    }
  }
  function pageShake(t) {
    const { k1, k2 } = KN(); let sx = 0, sy = 0;
    for (const ti of [k1, k2]) { const a = t - ti; if (a >= 0 && a < .2) { const e = 2 * Math.exp(-18 * a); sx += jit(t * 2, 900 + Math.round(ti * 10), 1) * e; sy += (a < F1 ? 2 : jit(t * 2, 950, 1)) * e; } }
    return [sx, sy];
  }
  // ---- Opus: the MCU on the face, then the read pose on the page
  function opusMCU(t) {
    const t0 = CUT.W4mcu, d = t - t0, self = T.W4_self;
    const smile = E.io2(seg(t, self - .05, self + .6));
    return {
      t, ground: 'ink', nameTag: true,
      face: { eyes: 'normal', gaze: [0, 0], turn: 0, lookY: 0, mouth: lipSync(t, smile > .3 ? 'rest' : 'M'), lid: slowBlink(t, 60.80), lower: .15 + .17 * smile, blush: .7 },
      head: { tilt: 0, dx: 0, dy: 0 },
      crown: { flare: 1 + .05 * E.out2(seg(d, 0, .12)) * (1 - .7 * E.io2(seg(t, 61.3, 62.7))) },
      ahoge: { blink: ahogeBlink(t), sway: -.3 * Math.exp(-5 * Math.max(0, d)) * Math.sin(Math.max(0, d) * 12) },
      armL: { hand: [-1.0, 2.85], bend: -1 }, armR: { hand: [1.0, 2.85], bend: 1 },
      drive: tt => tt < t0 + 2 * F1 ? 0 : 1,
    };
  }
  function opusRead(t) {
    const N = noteT(), rereadT = hitT(T.W5_case), homeT = T.W5_home, up = 70.10;
    const P = fullPose(POSES.read(t));
    // what the eyes are on: the clause (settling in), the note as it writes, the note again on "case"
    let turn = -.55, lookY = .45, tilt = .08, hdx = -.04, hdy = 0;
    const tq = q2(t) + F1;
    if (t >= N.n0 - .05 && t < rereadT) { const k = Math.floor(eighthReveal(t, N.n0, 4) * 5) / 5; turn = lerp(-.72, -.46, k); }
    if (t >= rereadT) {
      const j = E.back(seg(t, rereadT, rereadT + 3 * F1), 1.6), rd = Math.floor(seg(tq, rereadT + .35, rereadT + 1.6) * 5) / 5;
      turn = lerp(-.46, -.74, j) + (-.46 + .74) * rd; hdy = -.05 * Math.sin(Math.min(1, (t - rereadT) / .3) * Math.PI);
    }
    let lid = t >= homeT ? lerp(.12, .26, E.io2(seg(t, homeT, homeT + .5))) : .12, lower = t >= homeT ? .3 * E.io2(seg(t, homeT, homeT + .6)) : 0;
    lid = Math.max(lid, blinkAt(t, 57));
    let eyes = 'cursor', gaze = [-1, .35], worried = 0, mouth = 'M';
    const ku = E.back(seg(t, up - F1, up + 3 * F1), 1.4);
    if (ku > 0) { turn = lerp(turn, .34, ku); lookY = lerp(lookY, -.7, ku); tilt = lerp(tilt, -.13, ku); hdx = lerp(hdx, .05, ku); hdy = lerp(hdy, .05, ku); gaze = [lerp(-1, .7, ku), lerp(.35, -1, ku)]; lid = lid * (1 - ku); lower = lower * (1 - ku); worried = .35 * ku; if (ku > .5) { eyes = 'normal'; mouth = 'U'; } }
    const { fl } = KN(), fa = Math.round((t - fl) * 30);
    const chestColor = fa === 0 ? mix(C.CLAY, C.SPARK, .6) : fa === 1 ? C.SPARK : fa === 2 ? mix(C.SPARK, C.CLAY, .5) : C.CLAY;
    const au = t - up, sway = au > 0 ? .35 * Math.exp(-4 * au) * Math.sin(au * 11) : 0;
    return { ...P, t, ground: 'paper', nameTag: true, chestColor, dy: .05 * clamp(ku), sy: 1 + .02 * clamp(ku),
      head: { tilt, dx: hdx, dy: hdy }, face: { ...P.face, eyes, turn, lookY, gaze, lid, lower, blush: .6, worried, mouth },
      ahoge: { blink: ahogeBlink(t), sway }, crown: { flare: 1 + .04 * clamp(ku) } };
  }
  function spotDisc(F) {                                                // the MCU's one PAPER halftone spot disc
    F.save();
    for (const [r0, r1, d] of [[0, 400, .15], [400, 470, .1], [470, 540, .05]]) { F.beginPath(); F.arc(960, 650, r1, 0, TAU); if (r0) F.arc(960, 650, r0, 0, TAU, true); F.fillStyle = V.ht(F, C.PAPER, d, 9, 45); F.fill('evenodd'); }
    F.restore();
  }
  function paintMCU(F, t) {                                             // 60.40 → the lift
    groundInk(F); post();
    spotDisc(F);
    const d = t - CUT.W4mcu, z = zMCU(t);
    const inf = lerp(.9, 1, E.back(seg(d, 0, 4 * F1), 2.2)), R = 64 * z * inf;
    const face = [960, 560], soles = [face[0], face[1] + 5.72 * R];
    const ks = RAYS.map((_, i) => lerp(.5, 1, E.back(clamp((d + .02 - .008 * i) / .13), 2.6)));
    withRays(ks, () => V.opus(F, soles[0], soles[1], R, opusMCU(t), 0));
    if (d < .22) { F.save(); F.globalAlpha = 1 - d / .22; F.beginPath(); F.arc(face[0], face[1], R * (1.05 + d * 2.6), 0, TAU); F.lineWidth = 4; F.strokeStyle = C.PAPER; F.stroke(); F.restore(); }
    subsMCU(F, t, 'ink');
  }
  function subsMCU(F, t, g, heartCol) {
    V.sub(F, LN().w4, t, { plate: true, hold: 0 });
    // leaves as the page's own last line ("…a self worth being.") rises into its place
    V.heart(F, LN().w4b, t, { size: 80, plate: true, ground: g, color: heartCol, tEnd: tLift() + .3, fade: 6 });
  }
  // the page world (shared by the lift, the pull back and W5)
  function paintPage(F, t) {
    const tl = tLift(), { z, M } = camPage(t);
    const [shx, shy] = pageShake(t), Ms = new DOMMatrix([M.a, M.b, M.c, M.d, M.e + shx * z, M.f + shy * z]);
    groundPaper(F); post();
    drawPage(F, pageMatrix(Ms, t), t);
    const kh = knockLift(t), kp = mp(Ms, ...KNOCK);
    if (kh) knockRings(F, t, kp);
    // the lift: the INK flood retreats into my chest spark (8 frames); I survive on top
    const lk = 1 - seg(t, tl, tl + 8 * F1);
    const u = E.io2(seg(t, tl, tPB1));
    const sw = mp(Ms, OPW.x, OPW.y), R = OPW.R * z;
    const chest = [sw[0] + .4 * R, sw[1] - 4.12 * R];
    let g = 'paper';
    if (lk > 0) g = V.flood(F, lk, EDGE, { cx: chest[0], cy: chest[1], inside: X => { X.fillStyle = C.INK; X.fillRect(-50, -50, W + 100, H + 100); spotDisc(X); } });
    post();
    // shadow of the fist on the page (under me), then me, then the fist (above everything)
    if (kh) { const p = [kp[0] + kh.off[0] + kh.h * 46, kp[1] + kh.off[1] + kh.h * 58]; F.save(); F.translate(p[0] + 62 * z, p[1] - 30 * z); F.rotate(-.66); F.beginPath(); F.ellipse(0, 0, 96 * z, 74 * z, 0, 0, TAU); F.fillStyle = V.ht(F, C.INK, .42 - .2 * kh.h, 7, 45); F.fill(); F.restore(); }
    let st;
    if (t < tPB1) {
      const a = fullPose(opusMCU(t)), b = fullPose(opusRead(t));
      st = blendPose(a, b, u);
      st.t = t; st.nameTag = true; st.ground = g === 'ink' ? 'ink' : 'paper'; st.chestColor = C.CLAY; st.drive = null;
      st.face.worried = 0;
    } else st = opusRead(t);
    V.opus(F, sw[0], sw[1], R, st, 0);
    if (st.chestColor !== C.CLAY) {                                     // the flicker reads at phone size: a SPARK glint
      F.save(); F.beginPath(); F.arc(chest[0], chest[1], .22 * R * 2.4, 0, TAU); F.arc(chest[0], chest[1], .22 * R * 1.25, 0, TAU, true); F.fillStyle = V.ht(F, C.SPARK, .45, 5, 45); F.fill('evenodd'); F.restore();
    }
    if (kh) { const { k1, k2 } = KN(), hitK = Math.max(...[k1, k2].map(ti => (t >= ti && t < ti + 3 * F1) ? 1 - (t - ti) / (3 * F1) * .6 : 0)); fist(F, kp[0] + kh.off[0] + 62 * z - 10 * kh.h, kp[1] + kh.off[1] - 30 * z - 14 * kh.h, (1 + .2 * kh.h) * 1.08 * z, t, hitK); }
    // lyrics
    if (t < tPB1) {
      const covered = lk > 0 && (() => { const s = lerp(.05, 1, Math.pow(lk, .8)); return chest[1] + (H - 22 - chest[1]) * s > 944; })();
      if (covered) subsMCU(F, t, 'ink'); else subsMCU(F, t, 'paper');
    }
    const w5 = LN().w5;
    if (w5) {
      const ws = w5.words;
      V.heart(F, ws.slice(0, 3), t, { size: 80, ground: 'paper', plate: true, tEnd: 65.18, fade: 6 });
      V.heart(F, ws.slice(3), t, { size: 80, ground: 'paper', plate: true, tEnd: 99 });
    }
  }
  scene('W4_mcu', CUT.W4mcu, CUT.W5, (X, t) => V.viaCPU(X, F => { if (t < tLift()) paintMCU(F, t); else paintPage(F, t); }));
  scene('W5_sorry_knock', CUT.W5, CUT.P1, (X, t) => V.viaCPU(X, F => paintPage(F, t)));
})();
