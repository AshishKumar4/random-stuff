// pre1.js: PRE-CHORUS 1, bars 13–16 (22.50–30.00). Pretraining ▸ mid-training, replayed at 1× as a DRAMATIZATION.
//   S09 "Wrong, wrong, wrong, a little less wrong": THE WRONG STAIRCASE. Three RED riso stamps slam on b1/b2/b3 into a
//        descending stack that is a loss curve; the AMBER text-body cloud (formless Opus) tumbles down the steps. Bar 14:
//        the camera pulls back to the chart, the staircase keeps going (ever-smaller WRONGs) into the power-law tail,
//        `✓-ish`; a river of the internet pours through a funnel that hangs over the cloud; a hardcover's spine is
//        sliced and its pages fan into token pills.
//   S10 "That's how I learned to sing along": the cloud bursts into glyphs that condense into Opus's text-body
//        silhouette; the karaoke line with a CLAY ball landing half a beat ahead; bar 16 the fill runs past the last
//        word and becomes the universe's longest loading bar, collapses CRT-style to a pixel and pops (b3) into
//        "Hi! How can I help you today? ■ end_turn"; b4 near-blackout; the bubble docks where S11 picks it up.
// Perf: every frame is painted into CPU-backed canvases (willReadFrequently) and uploaded once (see hook.js).
(() => {
  'use strict';
  const BEAT = 60 / 128, BAR = BEAT * 4, F = 1 / 30;
  const bt = (bar, b = 1) => (bar - 1) * BAR + (b - 1) * BEAT;
  const T13 = bt(13), T14 = bt(14), T15 = bt(15), T16 = bt(16), T17 = bt(17);
  const EDGE = 13;
  const OVER = mix(C.RED, C.INK, .24);          // riso overprint: RED over RED
  const RED_SH = mix(C.RED, C.INK, .58);        // second-hit offset of the stamp
  const BODY = C.AMBER;
  const PILL_BG = mix(C.INK, C.AMBER, .22);

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
  function blitLayer(dst, name, alpha = 1) { dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.globalAlpha *= alpha; dst.drawImage(layerCanvas(name), 0, 0); dst.restore(); }
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
  function viaCPU(X, fn) {
    const Fr = layer('p1_frame');
    fn(Fr);
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(layerCanvas('p1_frame'), 0, 0); X.restore();
  }

  // ------------------------------------------------------------------ lyric timing (locks onto sung onsets)
  function wrongs() {
    const w1 = findWord('wrong', T13 - .3, T13 + .22, T13);
    const w2 = findWord('wrong', w1.s + .15, bt(13, 2) + .25, bt(13, 2));
    const w3 = findWord('wrong', w2.s + .15, bt(13, 3) + .25, bt(13, 3));
    // the first stamp is already mid-slam on the cut frame (22.467): it starts no later than 1 frame before the cut
    return [{ ...w1, hit: Math.min(w1.s - 2 * F, T13 - 2 * F) }, w2, w3];
  }
  function lessWrong(w3) {
    const a = findWord('a', w3.s + .1, T14 + .3, bt(13, 4));
    const li = findWord('little', a.s, T14 + .5, bt(13, 4.25));
    const le = findWord('less', li.s + .05, bt(14, 3), bt(13, 4.5));
    const wr = findWord('wrong', le.s, bt(14, 4) + .2, T14);   // the aligner can give "less" and "wrong" one onset
    return [a, li, le, wr];
  }
  // the cut into S09 lands 1 frame before the first sung WRONG (the singer comes in ahead of bar 13), never later
  // than the grid cut; the stamp is already slamming on the cut frame
  const S9_T0 = (() => { const w = findWord('wrong', T13 - .3, T13 + .22, T13); return Math.min(T13 - F, Math.floor((w.s - F) * 30 + 1e-6) / 30 - 1e-4); })();
  // the FOCAL `▶ 1×` caption hands the subtitle line to `a little less wrong` on its first sung word (bar 13 b4 in the
  // take), not on the grid's bar 14 b1
  const lyricIn = lw => Math.min(T14, lw[0].s) - F;
  const slamAt = w => w.hit ?? w.s - 2 * F;      // HERO slams 2 frames before the syllable
  const impactAt = w => slamAt(w) + .12;         // scale reaches 1 (hero() SLAM curve)
  // karaoke words: the sung line in bar 15 (composed on eighths: that's how I learned to sing a-|long, "long" on bar 16
  // b1). A provisional timeline that spreads the line deep into bar 16 is squeezed back so "along" starts by bar 15 b4.5.
  function karaokeWords() {
    const L = findLine("That's how", T14, T15 + 1.2);
    let ws = L && L.words && L.words.length ? L.words.map(w => ({ d: w.d || w.w, s: w.s, e: w.e })) : null;
    // on-screen spellings come from the line's lyric text (the sung syllables and the display line are all lowercase:
    // "i" → "I"); the first word is lowercased below
    const disp = L ? String(L.text || L.display || '').split(/\s+/).filter(Boolean) : [];
    if (ws && disp.length === ws.length) ws.forEach((w, i) => { w.d = disp[i].replace(/[.,!?]+$/, ''); });
    if (!ws) ws = ["that's", 'how', 'I', 'learned', 'to', 'sing', 'along'].map((d, i) => ({ d, s: T15 + (i + 1) * BEAT / 2, e: T15 + (i + 2) * BEAT / 2 - .03 }));
    const lastMax = T16 - BEAT / 2 + .06, last = ws[ws.length - 1];
    if (last.s > lastMax) { const a = ws[0].s, k = (T16 - BEAT / 2 - a) / (last.s - a); ws = ws.map(w => ({ d: w.d, s: a + (w.s - a) * k, e: a + (w.e - a) * k })); }
    ws = ws.map(w => ({ ...w, e: Math.min(w.e, w.s + BEAT * .9) }));   // the fill crosses a held word in < 1 beat
    ws[0].d = ws[0].d.charAt(0).toLowerCase() + ws[0].d.slice(1);
    return ws;
  }

  // ------------------------------------------------------------------ prose tiles (text-body texture, built once)
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
    const mk = (col, seed) => {
      const c = cpuCanvas(w, rows * lh), x = cx2d(c), R = rng(seed);
      x.font = `700 20px ${FONTS.mono}`; x.textBaseline = 'alphabetic'; x.fillStyle = col;
      for (let r = 0; r < rows; r++) {
        let s = ''; while (s.length < 200) s += PROSE[Math.floor(R() * PROSE.length)] + (R() < .55 ? ' · ' : '  ');
        x.globalAlpha = .72 + R() * .28; x.fillText(s, 0, r * lh + 18); x.fillText(s, -12 * 192, r * lh + 18);
      }
      return c;
    };
    _tiles = { amber: mk(C.AMBER, 'pre1-a'), ink: mk(C.INK, 'pre1-a'), rows, lh, w, cw: 12 };
    return _tiles;
  }
  // rows of prose covering [x0,x0+w]×[y0,y0+h] (current transform). Rows step one char per eighth note in alternating
  // directions (never continuous: sub-10 px moving texture turns into macroblocks after the encoder).
  function textRows(ctx, x0, y0, w, h, t, tile, sc = 1, seed = 0) {
    const T = tiles(), lh = T.lh * sc, step = Math.floor(beatPos(t) * 2), vshift = Math.floor(beatPos(t));
    const n = Math.ceil(h / lh) + 1;
    for (let i = 0; i < n; i++) {
      const row = ((i + vshift + seed) % T.rows + T.rows) % T.rows;
      const dir = (i + seed) % 2 ? 1 : -1;
      let sx = ((dir * step * T.cw * 2 + hash(row * 13 + seed) * T.w) % 1152 + 1152) % 1152;
      let dx = x0, need = w / sc;
      while (need > 0) {
        const take = Math.min(need, T.w - sx);
        ctx.drawImage(tile, sx, row * T.lh, take, T.lh, dx, y0 + i * lh, take * sc, lh);
        dx += take * sc; need -= take; sx = 0;
      }
    }
  }

  // ------------------------------------------------------------------ distress texture for the rubber stamps
  let _distress = null;
  function distress() {
    if (_distress) return _distress;
    const s = 512, c = cpuCanvas(s, s), x = cx2d(c), R = rng('pre1-distress');
    x.fillStyle = '#000';
    for (let i = 0; i < 520; i++) { const r = .8 + Math.pow(R(), 3) * 7; x.globalAlpha = .5 + R() * .5; x.beginPath(); x.arc(R() * s, R() * s, r, 0, TAU); x.fill(); }
    x.lineCap = 'round'; x.strokeStyle = '#000';
    for (let i = 0; i < 26; i++) { const y = R() * s, x0 = R() * s, l = 30 + R() * 140; x.globalAlpha = .25 + R() * .35; x.lineWidth = .8 + R() * 2.2; x.beginPath(); x.moveTo(x0, y); x.lineTo(x0 + l, y + (R() - .5) * 6); x.stroke(); }
    _distress = c; return c;
  }

  // ------------------------------------------------------------------ S09 world layout (world = bar-13 frame coords)
  let LAY = null;
  function layout(ctx) {
    if (LAY) return LAY;
    const pre = s => [1, 2, 3, 4, 5].map(i => heroWidth(ctx, 'WRONG'.slice(0, i), s, 'cond'));
    const P = [515, 330, 210].map(pre);
    const st = [];
    const x1 = 118;
    st.push({ size: 515, x: x1, w: P[0][4], top: 248 });
    st.push({ size: 330, x: x1 + P[0][0], w: P[1][4], top: 520 });            // left edge in W1's W|R gap
    st.push({ size: 210, x: st[1].x + P[1][1], w: P[2][4], top: 712 });        // left edge in W2's R|O gap
    // the staircase keeps going in bar 14: ever smaller WRONGs, sixteenth notes, converging on the power-law tail
    let prev = st[2];
    for (let k = 1; k <= 8; k++) {
      const size = 210 * Math.pow(.64, k), pcap = .69 * prev.size;
      const s = { size, x: prev.x + prev.w + 4 * Math.pow(.64, k), w: P[2][4] * size / 210, top: prev.top + .62 * pcap, casc: k };
      st.push(s); prev = s;
    }
    st.forEach(s => { s.base = s.top + .69 * s.size; s.gap = Math.max(3, .034 * s.size); });
    const last = st[st.length - 1];
    const tail = { x0: last.x + last.w, y0: last.top - last.gap, yInf: last.top + 16, len: 1250 };
    LAY = { st, tail };
    return LAY;
  }
  const tailY = (L, x) => L.tail.yInf - (L.tail.yInf - L.tail.y0) * Math.exp(-Math.max(0, x - L.tail.x0) / 230);
  const S1 = .54, O1 = [50, 292];                    // pulled-back view (bar 14)

  function stampTimes(ws) {
    const out = [slamAt(ws[0]), slamAt(ws[1]), slamAt(ws[2])];
    for (let i = 3; i < LAY.st.length; i++) out.push(T14 - 2 * F + (i - 3) * BEAT / 4);
    return out;
  }

  // ------------------------------------------------------------------ S09 view: pull-back + WRONG punches + trauma shake
  function view(t, ws) {
    const kp = E.io3(seg(t, T14 - .02, T14 + .66));
    const ant = t < T14 ? .012 * E.in2(seg(t, T14 - 4 * F, T14)) : 0;   // 4-frame push-in before the pull-back
    const s = lerp(1, S1, kp), ox = lerp(0, O1[0], kp), oy = lerp(0, O1[1], kp);
    let z = 1 + ant, sx = 0, sy = 0;
    ws.forEach((w, i) => {
      const a = t - impactAt(w);
      if (a >= 0 && a < 1.2) {
        z += .03 * Math.exp(-9 * a) * Math.cos(a * 16) * (i === 0 ? 1.25 : 1);
        const tr = Math.exp(-6 * a), [a1, a2] = shake(t, 20 * tr * tr * (i ? .75 : 1), 31 + i, 22);
        sx += a1; sy += a2;
      }
    });
    return { s, ox, oy, z, sx, sy, kp };
  }
  function w2s(V, x, y) {
    const X_ = V.ox + x * V.s, Y_ = V.oy + y * V.s;
    return [960 + (X_ - 960) * V.z + V.sx, 540 + (Y_ - 540) * V.z + V.sy];
  }
  function applyView(X, V) { X.translate(960 + V.sx, 540 + V.sy); X.scale(V.z, V.z); X.translate(-960, -540); X.translate(V.ox, V.oy); X.scale(V.s, V.s); }
  const cloudScreenK = V => lerp(1, V.s, .45) * V.z;                 // the cloud keeps more of its size in the pull-back
  const cloudWorldW = (V, w) => w * cloudScreenK(V) / (V.s * V.z);

  // ------------------------------------------------------------------ S09 chart pieces (world coords)
  function axes(X, t, V, a) {
    const lw = 3.5 / (V.s * V.z);
    X.save(); X.strokeStyle = C.PAPER; X.lineCap = 'round'; X.lineWidth = lw;
    X.globalAlpha *= a * lerp(.28, .7, V.kp);
    X.beginPath(); X.moveTo(64, -120); X.lineTo(64, 1000); X.stroke();
    for (let y = 0; y < 1000; y += 120) { X.beginPath(); X.moveTo(64, y); X.lineTo(64 + 14 / V.s, y); X.stroke(); }
    X.globalAlpha = a * .7 * V.kp;
    X.beginPath(); X.moveTo(64, 1000); X.lineTo(3500, 1000); X.stroke();
    for (let x = 64 + 240; x < 3500; x += 240) { X.beginPath(); X.moveTo(x, 1000); X.lineTo(x, 1000 - 14 / V.s); X.stroke(); }
    X.restore();
  }

  function pill(X, x, y, str, sc, col = C.AMBER, alpha = 1) {
    X.save(); X.globalAlpha *= alpha; X.translate(x, y); X.scale(sc, sc);
    X.font = `700 22px ${FONTS.mono}`; const w = X.measureText(str).width + 24;
    rr(X, -w / 2, -18, w, 36, 18); X.fillStyle = PILL_BG; X.fill(); X.lineWidth = 3.5; X.strokeStyle = col; X.stroke();
    X.fillStyle = col; X.textAlign = 'center'; X.fillText(str, 0, 8); X.restore();
  }
  const TOKS = ['the', ' cat', 'ing', 'Once', ' upon', '{', 'def', 'lol', ' is', '.', ' love', ' you', 'er', ' of', ' hi', 'Dear', '()', ' the', ' end', '\\n'];
  // the internet, paper-cut: book pages, feed posts, code, token pills (PAPER + INK, boil on 12s)
  function feedItem(X, i, x, y, rot, sc, t) {
    X.save(); X.translate(x, y); X.rotate(rot); X.scale(sc, sc);
    const kind = i % 4, j = k => jit(t, i * 17 + k, 1.2);
    X.lineWidth = 3; X.strokeStyle = C.INK; X.lineJoin = 'round';
    if (kind === 0) { // book page
      X.fillStyle = C.PAPER; X.beginPath(); X.moveTo(-34 + j(1), -44 + j(2)); X.lineTo(34 + j(3), -44 + j(4)); X.lineTo(34 + j(5), 44 + j(6)); X.lineTo(-34 + j(7), 44 + j(8)); X.closePath(); X.fill();
      X.fillStyle = rgba(C.INK, .55); for (let l = 0; l < 6; l++) X.fillRect(-24, -32 + l * 12, l === 5 ? 30 : 48, 5);
    } else if (kind === 1) { // feed post
      X.fillStyle = C.PAPER; rr(X, -52 + j(1), -30 + j(2), 104, 60, 8); X.fill();
      X.fillStyle = C.INK; X.beginPath(); X.arc(-34, -12, 9, 0, TAU); X.fill();
      X.fillStyle = rgba(C.INK, .55); X.fillRect(-18, -16, 56, 6); X.fillRect(-40, 4, 80, 5); X.fillRect(-40, 15, 58, 5);
    } else if (kind === 2) { // code
      X.fillStyle = C.PAPER; X.font = `800 34px ${FONTS.mono}`; X.textAlign = 'center'; X.fillText(['{ }', '</>', 'fn()', '[ ]'][(i >> 2) % 4], 0, 12);
    } else pill(X, 0, 0, TOKS[i % TOKS.length], 1.1);
    X.restore();
  }

  // the funnel hangs over the cloud and follows it (lagged), so the pour never misses: everything goes into the model
  function cloudTopWorld(t, ws) {
    const tr = cloudTrack(t, ws), V = view(t, ws);
    return [tr.pos[0], tr.pos[1] - .62 * cloudWorldW(V, tr.w)];
  }
  function funnelAt(t, ws) {
    let sx = 0, sy = 0, sw = 0;
    for (let k = 0; k < 8; k++) { const wk = Math.exp(-k * .45), p = cloudTopWorld(t - k * .045, ws); sx += p[0] * wk; sy += p[1] * wk; sw += wk; }
    sx /= sw; sy /= sw;
    const kp = view(t, ws).kp, spout = sy - 150 - 330 * (1 - kp);   // bar 13: hung high (only the drips show); the pull-back reveals it
    return { x: sx, spout, neck: spout - 68, top: spout - 298, rx: 250, ry: 36 };
  }
  function funnel(X, t, f, a) {
    const J = k => jit(t, 900 + k, 1.1);
    X.save(); X.globalAlpha *= a;
    const cone = () => { X.beginPath(); X.moveTo(f.x - f.rx + J(1), f.top + J(2)); X.lineTo(f.x - 24 + J(3), f.neck); X.lineTo(f.x - 20, f.spout - 10); X.quadraticCurveTo(f.x, f.spout + 8, f.x + 20, f.spout - 10); X.lineTo(f.x + 24 + J(4), f.neck); X.lineTo(f.x + f.rx + J(5), f.top + J(6)); X.closePath(); };
    cone(); X.fillStyle = C.PAPER; X.fill();
    X.save(); cone(); X.clip(); X.fillStyle = halftone(X, C.INK, .42, 12, 45); X.beginPath(); X.moveTo(f.x + 40, f.top); X.lineTo(f.x + f.rx + 20, f.top); X.lineTo(f.x + 30, f.spout + 20); X.lineTo(f.x + 6, f.spout + 20); X.closePath(); X.fill();
    X.strokeStyle = C.INK; X.lineWidth = 5; X.beginPath(); X.moveTo(f.x - 26, f.neck + 2); X.lineTo(f.x + 26, f.neck + 2); X.stroke(); X.restore();
    X.beginPath(); X.ellipse(f.x, f.top, f.rx + 2, f.ry, 0, 0, TAU); X.fillStyle = C.PAPER; X.fill();
    X.beginPath(); X.ellipse(f.x, f.top + 3, f.rx - 14, f.ry - 10, 0, 0, TAU); X.fillStyle = C.INK; X.fill();
    X.restore();
  }
  // the pour: the internet (pages, posts, code, token pills) falls from above the frame in a column that narrows into
  // the funnel's mouth and drops INTO it (clipped at the rim). The column hangs off the funnel with a height lag, so it
  // sways after it instead of sliding rigidly.
  function river(X, t, ws, f, V, a) {
    if (a <= 0) return;
    const yTop = (-150 - V.oy) / V.s;
    X.save(); X.beginPath(); X.rect(-2000, yTop - 400, 8000, f.top - yTop + 400); X.clip();
    for (let i = 0; i < 18; i++) {
      const per = 1.25 + hash(i * 7) * .3, ph = frac((t - T13) / per + i / 18 + hash(i * 3) * .04);
      const k = .3 * ph + .7 * ph * ph;                                   // gravity
      const lagX = funnelAt(t - (1 - ph) * .45, ws).x;
      const side = (hash(i * 11) - .5) * 2, sp = side * lerp(f.rx * 1.3, f.rx * .35, k);
      const x = lerp(lagX, f.x, k) + sp, y = lerp(yTop, f.top + 34, k);
      const rot = (hash(i * 5) - .5) * 1.4 + side * ph * 1.1;
      X.save(); X.globalAlpha *= a * clamp(ph * 12);
      feedItem(X, i, x, y, rot, lerp(1.95, 1.2, k), t);
      X.restore();
    }
    X.restore();
  }
  // tokens dripping from the spout onto the cloud (the spout lags the cloud, so the drips curve in)
  function drip(X, t, f, ct, a) {
    if (a <= 0) return;
    for (let i = 0; i < 6; i++) {
      const ph = frac((t - T13) / .5 + i / 6), k = E.in2(ph);
      const y = lerp(f.spout, ct[1] + 10, k), x = lerp(f.x, ct[0], k) + Math.sin(i * 2.1 + ph * 3) * 10;
      pill(X, x, y, TOKS[((i * 7 + Math.floor((t - T13) / .5)) % TOKS.length + TOKS.length) % TOKS.length], .95, C.AMBER, a * (1 - ph * ph * ph));   // (t < T13 on the cut frame)
    }
  }

  // the hardcover (bar 14 b3): a single INK blade slices the spine; the pages fan out like wings into token pills
  function book(X, t, f, a) {
    const tb = bt(14, 3), tIn = tb - .5;
    if (t < tIn || a <= 0) return;
    const bw = 230, bh = 290, J = k => jit(t, 700 + k, 1.1);
    const land = tb - .16, kF = seg(t, tIn, land);
    let by = lerp(f.top - 1100, f.top - 8, E.in3(kF));                 // book bottom y
    if (t > land) by = f.top - 8 - 30 * Math.exp(-14 * (t - land)) * Math.abs(Math.sin((t - land) * 22));
    const bx = f.x + 30, rot0 = lerp(-.35, -.04, E.out2(kF));
    X.save(); X.globalAlpha *= a;
    if (t < tb) { // closed hardcover, spine facing left
      X.save(); X.translate(bx, by); X.rotate(rot0);
      X.beginPath(); X.moveTo(-bw / 2 + J(1), -bh + J(2)); X.lineTo(bw / 2 + J(3), -bh + J(4)); X.lineTo(bw / 2 + J(5), J(6)); X.lineTo(-bw / 2 + J(7), J(8)); X.closePath();
      X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 4; X.strokeStyle = C.INK; X.stroke();
      X.save(); X.clip(); X.fillStyle = halftone(X, C.INK, .32, 12, 45); X.fillRect(bw * .1, -bh, bw, bh); X.restore();
      X.fillStyle = C.INK; X.fillRect(-bw / 2 + 44, -bh + 64, bw - 84, 14); X.fillRect(-bw / 2 + 44, -bh + 92, bw - 130, 9);
      X.fillStyle = mix(C.PAPER, C.INK, .18); X.fillRect(-bw / 2, -bh, 34, bh);                      // spine
      X.fillStyle = C.INK; X.fillRect(-bw / 2, -bh + 34, 34, 9); X.fillRect(-bw / 2, -28, 34, 9);
      X.restore();
    } else {
      const k = t - tb;
      // spine strip falls away, spinning
      X.save(); X.translate(bx - bw / 2 + 17 - k * 140, by - bh / 2 + 1000 * k * k); X.rotate(-k * 5); X.globalAlpha *= clamp(1 - k * 2);
      X.fillStyle = mix(C.PAPER, C.INK, .18); X.fillRect(-17, -bh / 2, 34, bh); X.fillStyle = C.INK; X.fillRect(-17, -bh / 2 + 34, 34, 9); X.restore();
      // pages: fan out as wings (overshoot), then fly into the mouth as token pills
      const N = 12;
      for (let j = 0; j < N; j++) {
        const side = j % 2 ? 1 : -1, rank = (j >> 1) + 1;
        const fan = E.back(seg(k, 0, .16), 1.6) * side * (.14 + rank * .15);
        const tf = .17 + j * .022, kfly = E.in2(seg(k, tf, tf + .3));
        const px = bx + side * 10, py = by;
        X.save();
        if (kfly <= 0) {
          X.translate(px, py); X.rotate(fan);
          X.fillStyle = C.PAPER; X.fillRect(-bw * .42, -bh * .96, bw * .84, bh * .94); X.strokeStyle = C.INK; X.lineWidth = 3.5; X.strokeRect(-bw * .42, -bh * .96, bw * .84, bh * .94);
          X.fillStyle = rgba(C.INK, .5); for (let l = 0; l < 8; l++) X.fillRect(-bw * .32, -bh * .86 + l * 30, bw * (l === 7 ? .3 : .62), 6);
        } else {
          const sx0 = px + Math.sin(fan) * bh * .5, sy0 = py - Math.cos(fan) * bh * .5;
          const ex = f.x + (hash(j * 3) - .5) * 160, ey = f.top + 6;
          const x = lerp(sx0, ex, kfly), y = lerp(sy0, ey, kfly) - Math.sin(kfly * Math.PI) * 140;
          pill(X, x, y, TOKS[(j * 5 + 3) % TOKS.length], lerp(1.8, .9, kfly), C.AMBER, kfly > .92 ? (1 - kfly) / .08 : 1);
        }
        X.restore();
      }
    }
    // the blade: one INK stroke down the spine, PAPER edge, 3 frames
    const kb = seg(t, tb - 2 * F, tb + F);
    if (kb > 0 && kb < 1) {
      const x = bx - bw / 2 + 34, y = lerp(by - bh - 300, by + 90, E.in2(kb));
      X.save(); X.translate(x, y); X.fillStyle = C.INK; X.beginPath(); X.moveTo(-12, -480); X.lineTo(26, -480); X.lineTo(26, 0); X.lineTo(-12, 46); X.closePath(); X.fill();
      X.strokeStyle = C.PAPER; X.lineWidth = 7; X.beginPath(); X.moveTo(-12, -480); X.lineTo(-12, 46); X.stroke(); X.restore();
    }
    if (t >= tb && t < tb + 3 * F) { X.strokeStyle = C.PAPER; X.lineWidth = 9; X.globalAlpha *= 1 - (t - tb) / (3 * F); X.beginPath(); X.moveTo(bx - bw / 2 + 34, by - bh - 30); X.lineTo(bx - bw / 2 + 34, by + 30); X.stroke(); }
    X.restore();
  }

  // the stamps: RED riso rubber stamps, overprinting each other, distressed; the stack is the staircase.
  // Settled stamps are baked into world-space bitmaps (pure memo, small LRU); only live slams are drawn per frame.
  const CB = { x0: 70, y0: 160, w: 2880, h: 850 };
  const _stCache = new Map();
  function lru(key, build) {
    if (_stCache.has(key)) { const v = _stCache.get(key); _stCache.delete(key); _stCache.set(key, v); return v; }
    const v = build(); _stCache.set(key, v);
    while (_stCache.size > 6) _stCache.delete(_stCache.keys().next().value);
    return v;
  }
  const stampOne = (ctx, s, age, col, sh) => hero(ctx, 'WRONG', s.x + s.w / 2, s.base, s.size, { stretch: 'cond', color: col, shadow: sh, shadowOff: Math.max(2, s.size * .016), age, ghosts: age !== null });
  function stampCache(n, over = false) {       // first n stamps settled; over = tinted OVER (for the live overprint)
    return lru(n + (over ? 'o' : ''), () => {
      const c = cpuCanvas(CB.w, CB.h), x = cx2d(c);
      if (over) { x.drawImage(stampCache(n), 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = OVER; x.fillRect(0, 0, CB.w, CB.h); return c; }
      const tmp = cpuCanvas(CB.w, CB.h), y = cx2d(tmp);
      x.translate(-CB.x0, -CB.y0); y.translate(-CB.x0, -CB.y0);
      for (let i = 0; i < n; i++) {
        const st = LAY.st[i];
        if (i === 1 || i === 2) {
          y.save(); y.setTransform(1, 0, 0, 1, 0, 0); y.clearRect(0, 0, CB.w, CB.h); y.restore();
          stampOne(y, st, null, C.RED, RED_SH);
          y.globalCompositeOperation = 'source-atop'; for (let j = 0; j < i; j++) stampOne(y, LAY.st[j], null, OVER, null); y.globalCompositeOperation = 'source-over';
          x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(tmp, 0, 0); x.restore();
        } else stampOne(x, st, null, C.RED, RED_SH);
      }
      x.globalCompositeOperation = 'destination-out'; x.fillStyle = x.createPattern(distress(), 'repeat'); x.globalAlpha = .9;
      x.fillRect(CB.x0, CB.y0, CB.w, CB.h);
      return c;
    });
  }
  function stamps(X, t, V, ws, a) {
    const L = LAY, times = stampTimes(ws), N = L.st.length;
    let settled = 0; while (settled < N && t - times[settled] >= .6) settled++;
    if (settled > 0) { X.save(); X.globalAlpha *= a; X.drawImage(stampCache(settled), CB.x0, CB.y0); X.restore(); }
    const live = []; for (let i = settled; i < N; i++) if (t >= times[i]) live.push(i);
    if (!live.length) return;
    const Lv = layer('p1_live'); Lv.setTransform(X.getTransform());
    for (const i of live) stampOne(Lv, L.st[i], t - times[i], C.RED, RED_SH);
    if (settled > 0) { Lv.globalCompositeOperation = 'source-atop'; Lv.drawImage(stampCache(settled, true), CB.x0, CB.y0); }
    Lv.globalCompositeOperation = 'destination-out'; Lv.fillStyle = Lv.createPattern(distress(), 'repeat'); Lv.globalAlpha = .9;
    for (const i of live) { const st = L.st[i], age = t - times[i], k = age < .12 ? 2.6 : 1.2; Lv.fillRect(st.x + st.w / 2 - st.w * k / 2, st.base - st.size * .69 / 2 - st.size * k * .6, st.w * k, st.size * k * 1.2); }
    Lv.globalAlpha = 1; Lv.globalCompositeOperation = 'source-over';
    blitLayer(X, 'p1_live', a);
  }

  // the loss curve: a PAPER step line riding the stamp tops (risers sit in the letter gaps), then the power-law tail
  function curve(X, t, V, ws, a) {
    const L = LAY, times = stampTimes(ws), st = L.st;
    const segs = [];
    segs.push({ t0: times[0] + .1, d: 6 * F, pts: [[64, st[0].top - st[0].gap], [st[1].x, st[0].top - st[0].gap]] });
    for (let i = 1; i < st.length; i++) {
      const xr = st[i].x, xe = i + 1 < st.length ? st[i + 1].x : st[i].x + st[i].w;
      segs.push({ t0: times[i] + (i < 3 ? .1 : .05), d: (i < 3 ? 6 : 3) * F, pts: [[xr, st[i - 1].top - st[i - 1].gap], [xr, st[i].top - st[i].gap], [xe, st[i].top - st[i].gap]] });
    }
    const tp = []; for (let x = L.tail.x0; x <= L.tail.x0 + L.tail.len; x += 20) tp.push([x, tailY(L, x)]);
    segs.push({ t0: bt(14, 2) - 2 * F, d: 12 * F, pts: tp, ease: E.out3 });
    const lw = 6 / (V.s * V.z);
    const path = (ctx, pts, k) => {
      let tot = 0; const ls = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); ls.push(l); tot += l; }
      let rem = tot * k; ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length && rem > 0; i++) { const f_ = Math.min(1, rem / ls[i - 1]); ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f_), lerp(pts[i - 1][1], pts[i][1], f_)); rem -= ls[i - 1]; }
    };
    X.save(); X.globalAlpha *= a; X.lineCap = 'round'; X.lineJoin = 'round';
    for (const pass of [[C.INK, lw * 2.6], [C.PAPER, lw]]) {
      X.strokeStyle = pass[0]; X.lineWidth = pass[1]; X.beginPath();
      for (const sg of segs) { const k = (sg.ease || E.out2)(seg(t, sg.t0, sg.t0 + sg.d)); if (k > 0) path(X, sg.pts, k); }
      X.stroke();
    }
    X.restore();
  }

  // everything in world space; returns the funnel for the screen-space pieces
  function chart(X, t, V, ws, a = 1) {
    layout(X);
    const f = funnelAt(t, ws), ct = cloudTopWorld(t, ws);
    const kr = E.io2(seg(t, T14, T14 + .5));                 // the river and the funnel's body come in with the pull-back
    axes(X, t, V, a);
    stamps(X, t, V, ws, a);
    curve(X, t, V, ws, a);
    drip(X, t, f, ct, a);
    funnel(X, t, f, a);
    river(X, t, ws, f, V, a * kr);
    book(X, t, f, a);
    return f;
  }

  // ------------------------------------------------------------------ the text-body cloud (formless Opus, S09)
  const PUFFS = [[-.37, -.17, .16], [-.2, -.31, .2], [.02, -.39, .24], [.24, -.31, .2], [.41, -.17, .15], [-.02, -.15, .24], [-.25, -.11, .17], [.23, -.11, .17], [.52, -.07, .08], [-.53, -.07, .08]];
  function cloudCircles(t, w, grow = 1) {
    return PUFFS.map(([x, y, r], i) => {
      const b = 1 + .04 * Math.sin(t * 3.3 + i * 1.7) + .05 * pulse(t, 7) * (i % 2 ? 1 : .5);
      return [x * w, y * w, r * w * b * grow];
    });
  }
  function puffPath(ctx, circ, g = 0) { ctx.beginPath(); for (const [x, y, r] of circ) { ctx.moveTo(x + r + g, y); ctx.arc(x, y, r + g, 0, TAU); } }
  // cs: {x, y (screen, bottom centre), w (screen width), rot, sx, sy, eyes, mouth, gaze, lid, t, alpha, grow}
  function drawCloud(X, cs) {
    const { x, y, w, t } = cs;
    if (w < 2 || cs.alpha === 0) return;
    const circ = cloudCircles(t, w, cs.grow ?? 1), cy = -.26 * w, kl = Math.max(3, w * .02);
    X.save(); X.globalAlpha *= cs.alpha ?? 1;
    X.translate(x, y); X.translate(0, cy); X.rotate(cs.rot || 0); X.translate(0, -cy); X.scale(cs.sx || 1, cs.sy || 1);
    const floor = (g) => { X.beginPath(); X.rect(-w * 1.2, -w * 1.4, w * 2.4, w * 1.4 + g); X.clip(); };
    X.save(); floor(kl); puffPath(X, circ, kl); X.fillStyle = C.PAPER; X.fill(); X.restore();
    X.save(); floor(0); puffPath(X, circ, 0); X.clip();
    X.fillStyle = BODY; X.fillRect(-w * .8, -w * 1.1, w * 1.6, w * 1.12);
    // flat riso two-tone: a pale AMBER tint crescent on each puff (lit from top-left), under the prose so it stays legible
    X.fillStyle = mix(C.AMBER, C.PAPER, .42); for (const [px, py, pr] of circ) { X.beginPath(); X.arc(px - pr * .3, py - pr * .34, pr * .5, 0, TAU); X.fill(); }
    X.fillStyle = BODY; for (const [px, py, pr] of circ) { X.beginPath(); X.arc(px - pr * .12, py - pr * .1, pr * .56, 0, TAU); X.fill(); }
    X.fillStyle = halftone(X, mix(C.AMBER, C.INK, .35), .5, 8, 45); X.beginPath(); X.rect(-w * .8, -w * .2, w * 1.6, w * .22); X.fill();   // riso shade on the belly
    X.globalAlpha *= .8; textRows(X, -w * .7, -w * .8, w * 1.4, w * .82, t, tiles().ink, w / 290, 3); X.globalAlpha /= .8;
    X.restore();
    // face: cursor-pupil eyes (the tab's eyes from S08) and a singing mouth, on a clean AMBER patch so it reads
    const g = cs.gaze || [0, 0], fx = g[0] * .025 * w, fy = -.25 * w;
    X.save(); X.translate(fx, fy);
    X.beginPath(); X.ellipse(0, .04 * w, .27 * w, .15 * w, 0, 0, TAU); X.fillStyle = BODY; X.fill();
    const ex = .13 * w, rx = .062 * w, ry = .09 * w, lwF = Math.max(3, .017 * w);
    for (const sd of [-1, 1]) { X.save(); X.beginPath(); X.ellipse(sd * .235 * w, .075 * w, .05 * w, .027 * w, 0, 0, TAU); X.fillStyle = halftone(X, C.RED, .55, 5, 45); X.fill(); X.restore(); }
    X.lineCap = 'round'; X.lineJoin = 'round'; X.strokeStyle = C.INK; X.fillStyle = C.INK;
    for (const sd of [-1, 1]) {
      X.save(); X.translate(sd * ex, 0);
      if (cs.eyes === '><') { X.lineWidth = lwF * 1.5; X.beginPath(); X.moveTo(-sd * rx, -ry * .6); X.lineTo(sd * rx * .9, 0); X.lineTo(-sd * rx, ry * .6); X.stroke(); }
      else if (cs.eyes === '^^') { X.lineWidth = lwF * 1.6; X.beginPath(); X.arc(0, ry * .4, rx * 1.1, Math.PI * 1.12, Math.PI * 1.88); X.stroke(); }
      else {
        const h = clamp(cs.lid || 0), ryy = Math.max(1.5, ry * (1 - h * .92));
        X.beginPath(); X.ellipse(0, 0, rx, ryy, 0, 0, TAU); X.fill();
        if (h < .6) { X.fillStyle = cs.cursorOn === false ? mix(C.PAPER, C.INK, .5) : C.PAPER; X.fillRect(g[0] * rx * .3 - rx * .24, g[1] * ry * .25 - ry * .46, rx * .48, ry * .92 * (1 - h)); }
        X.fillStyle = C.INK;
      }
      X.restore();
    }
    X.translate(0, .1 * w);
    const m = cs.mouth || 'rest', mr = .034 * w;
    X.lineWidth = lwF;
    if (m === 'O' || m === 'U') { X.beginPath(); X.ellipse(0, 0, mr * (m === 'U' ? .6 : .9), mr * (m === 'U' ? .7 : 1.15), 0, 0, TAU); X.fill(); }
    else if (m === 'A' || m === 'E' || m === 'I') { rr(X, -mr * 1.3, -mr * .6, mr * 2.6, mr * (m === 'E' ? 1.0 : 1.6), mr * .8); X.fill(); }
    else if (m === 'M') { X.beginPath(); X.moveTo(-mr, 0); X.lineTo(mr, 0); X.stroke(); }
    else { X.beginPath(); X.arc(0, -mr * .9, mr * 1.2, .2 * Math.PI, .8 * Math.PI); X.stroke(); }
    X.restore();
    X.restore();
  }

  // where the cloud is: sits on W1 under the spout, tumbles down W2 and W3 (landing on the "and" after each WRONG),
  // hops down the bar-14 cascade on eighths, rolls along the tail.
  function cloudTrack(t, ws) {
    const L = LAY, st = L.st;
    const on = (i, dx) => [st[i].x + dx, st[i].top - 1];
    const P = [on(0, 842), on(1, 557), on(2, 352), on(3, st[3].w * .5), on(4, st[4].w * .5), on(5, st[5].w * .5)];
    const xEnd = L.tail.x0 - 150, Pend = [xEnd, tailY(L, xEnd) - L.st[L.st.length - 1].gap];
    const legs = [
      { a: 0, b: 1, t0: slamAt(ws[1]), t1: bt(13, 2.5), h: 110, spin: TAU },
      { a: 1, b: 2, t0: slamAt(ws[2]), t1: bt(13, 3.5), h: 90, spin: TAU },
      { a: 2, b: 3, t0: T14 - F, t1: bt(14, 1.5), h: 120, spin: 0 },
      { a: 3, b: 4, t0: bt(14, 1.5) + 2 * F, t1: bt(14, 2), h: 70, spin: 0 },
      { a: 4, b: 5, t0: bt(14, 2) + 2 * F, t1: bt(14, 2.5), h: 50, spin: 0 },
    ];
    const Wd = [260, 320, 350, 350, 350, 350];
    let pos = P[0], w = lerp(230, 260, E.out2(seg(t, T13, T13 + .3))), rot = 0, sx = 1, sy = 1, air = false, lastLand = -9, nextJump = legs[0].t0;
    for (let i = 0; i < legs.length; i++) {
      const g = legs[i];
      if (t >= g.t1) { pos = P[g.b]; w = Wd[g.b]; lastLand = g.t1; nextJump = legs[i + 1] ? legs[i + 1].t0 : 99; continue; }
      if (t >= g.t0) {
        const u = (t - g.t0) / (g.t1 - g.t0), pa = P[g.a], pb = P[g.b];
        pos = [lerp(pa[0], pb[0], E.out2(u) * .3 + u * .7), lerp(pa[1], pb[1], u * u) - g.h * Math.sin(u * Math.PI) * (1 - u * .4)];
        w = lerp(Wd[g.a], Wd[g.b], u); rot = g.spin * E.io2(u); air = true;
        sy = 1 + .12 * Math.sin(u * Math.PI); sx = 1 / Math.sqrt(sy);
      }
      break;
    }
    const r0 = bt(14, 2.5) + 2 * F, r1 = bt(14, 3) + .12;       // roll along the tail
    if (t >= r0) {
      const u = E.out3(seg(t, r0, r1)), x = lerp(P[5][0], Pend[0], u);
      pos = [x, x > L.tail.x0 ? tailY(L, x) - L.st[L.st.length - 1].gap : lerp(P[5][1], Pend[1], u)];
      rot = TAU * u; air = u < 1; lastLand = r1; nextJump = 99;
    }
    if (!air) {
      const a = t - lastLand;
      if (a >= 0 && a < .6) { sy = 1 - .26 * Math.exp(-11 * a) * Math.cos(a * 26); sx = 1 / Math.sqrt(sy); }
      const pre = nextJump - t; if (pre > 0 && pre < 3 * F) { sy = 1 - .16 * (1 - pre / (3 * F)); sx = 1 / Math.sqrt(sy); }
    }
    return { pos, w, rot, sx, sy, air, lastLand, P, Pend };
  }
  function cloudFace(t, ws, tr) {
    let eyes = 'cursor', gaze = [.6, .3], lid = blinkAt(t, 9);
    for (const w of ws) { const a = t - impactAt(w); if (a >= -F && a < 5 * F) eyes = '><'; }
    if (tr.air) eyes = '><';
    if (t > bt(14, 3) + .1) eyes = '^^';
    else if (t > T14 + .7) gaze = [.1, -1];           // looks up at the funnel
    let mouth = lipSync(t, 'rest');
    if (mouth === 'rest' && eyes === '><') mouth = 'E';
    const cursorOn = Math.floor(beatPos(t)) % 2 === 0;
    return { eyes, gaze, lid, mouth, cursorOn };
  }

  // ------------------------------------------------------------------ screen-space furniture
  // the bottom bar (§7.10): the video's own seekbar, continuous across both cuts. Until the pop it continues verse1's
  // log fill and chapter ticks (the pretraining tick, 22.5, is now current); it leaves while the karaoke bar becomes the
  // frame-filling loading bar (bar 16 b1) and comes back at the pop (29.06) emptied and restarted as context, with
  // chorus1_brand's ticks and fill, so both cuts match their neighbours exactly.
  const TICKS_V1 = [10.3, 11.25, 15.0, 22.5, 52.5, 60, 67.5, 71.25, 75, 112.5, 135].map(s => s / 144);
  const TICKS_CH = [10.3, 11.25, 15.0, 22.5, 52.5, 56.25, 67.5, 69.84, 71.72, 112.5, 120.0].map(s => s / 144);
  const POP = 29.06;
  function seekbar(X, t, a = 1) {
    if (a <= 0) return;
    let fill, ticks;
    if (t < POP) {
      const hi = wordOnset('hi', 9.9, 10.9, 10.28);
      fill = .05 * Math.log(1 + (t - hi) * 4) / Math.log(1 + (28.13 - 10.3) * 4); ticks = TICKS_V1;
    } else { fill = lerp(.01, .51, (t - POP) / (75 - POP)); ticks = TICKS_CH; }
    X.save(); X.globalAlpha *= a; contextBar(X, fill, { ticks, cur: 3 }); X.restore();
  }
  function chyron(X, t, a = 1) {
    if (a <= 0) return;
    X.save(); X.globalAlpha *= a;
    const x = 96, y = 46, cw = 48, ch = 34;
    const snap = t < S9_T0 + 7 * F ? E.back(seg(t, S9_T0, S9_T0 + 5 * F), 2.2) : 1;
    X.lineJoin = 'round'; X.lineWidth = 3; X.strokeStyle = C.UI_GREY; X.fillStyle = C.UI_GREY;
    rr(X, x, y + 10, cw, ch - 8, 4); X.stroke();
    X.save(); X.translate(x, y + 10); X.rotate(-(1 - snap) * .5); rr(X, 0, -10, cw, 9, 2); X.fill(); X.restore();
    X.fillStyle = C.INK; for (let i = 0; i < 3; i++) { X.save(); X.translate(x, y + 10); X.rotate(-(1 - snap) * .5); X.beginPath(); X.moveTo(8 + i * 14, -10); X.lineTo(14 + i * 14, -10); X.lineTo(10 + i * 14, -1); X.lineTo(4 + i * 14, -1); X.closePath(); X.fill(); X.restore(); }
    X.font = mono(36, 600); X.letterSpacing = '3px'; X.fillStyle = C.UI_GREY; X.textBaseline = 'alphabetic'; X.fillText('DRAMATIZATION', x + cw + 16, y + ch);
    X.restore();
  }
  function readout(X, t, ws) {
    const parts = [['loss 3.21', impactAt(ws[0])], [' → 2.64', impactAt(ws[1])], [' → 2.19', impactAt(ws[2])], [' → 1.84', bt(14, 2)]];
    let s = ''; for (const [p, t0] of parts) if (t >= t0) s += p;
    if (!s) return;
    if (t >= bt(14, 2.5)) { const n = Math.round(lerp(65536, 1048576, E.out3(seg(t, bt(14, 2.5), bt(14, 3.5))))); s += ' · step ' + n.toLocaleString('en-US'); }
    // under the chyron (top-left HUD block); the top-right belongs to the pour and the funnel
    X.save(); X.globalAlpha *= .8; drawRich(X, s, 98, 128, mono(28, 500), C.PAPER, { align: 'left' }); X.restore();
  }
  function axisLabels(X, t, V) {
    if (V.kp <= .05) return;
    X.save(); X.globalAlpha *= .75 * V.kp; X.font = mono(28, 500); X.fillStyle = C.PAPER;
    const [ax, ay] = w2s(V, 64, 1000);
    X.save(); X.translate(ax - 18, ay - 24); X.rotate(-Math.PI / 2); X.textAlign = 'left'; X.fillText('cross-entropy (vibes)', 0, 0); X.restore();
    X.textAlign = 'right'; X.fillText('tokens seen: yes', 1824, ay + 38);
    X.restore();
  }
  // FOCAL carried over from S08 (same plate and geometry as verse1's, badge in AMBER: no CLAY type beside the AMBER
  // cloud), held to bar 14 b1; then the LYRIC `a little less wrong` (mono 96, typed on as sung)
  function captions(X, t, lw, kIn) {
    // it drops out over 3 frames and is gone the frame the lyric starts typing (never two lines on the subtitle row)
    const tL = lyricIn(lw), out = seg(t, tL - 3 * F, tL);
    if (out < 1) {
      const f = mono(72, 500), full = '▶ 1× · don\'t remember this part either';
      X.save(); X.globalAlpha *= 1 - E.in2(out); X.translate(0, 26 * E.in2(out));
      const w = richWidth(X, full, f), x0 = 960 - w / 2;
      rr(X, x0 - 30, 950 - 70, w + 60, 96, 20); X.fillStyle = rgba(C.INK, .92); X.fill();
      // identical to verse1's caption across the cut: its badge cools CLAY → PAPER by 22.58 (no CLAY type once the
      // AMBER cloud has the frame), same source line
      const age = t - (bt(12, 4) - F);
      drawRich(X, '▶ 1×', x0, 950, f, mix(C.CLAY, C.PAPER, E.io2(seg(age, .3, .55))));
      drawRich(X, full.slice(4), x0 + richWidth(X, '▶ 1×', f), 950, f, C.PAPER);
      X.globalAlpha *= .62; X.font = mono(28, 500); X.fillStyle = C.PAPER; X.textAlign = 'center'; X.textBaseline = 'alphabetic'; X.fillText('(source: my system card)', 960, 1002);
      X.restore();
    }
    if (t < tL) return;
    const words = ['a', 'little', 'less', 'wrong'];
    const tEnd = Math.max(lw[3].e + .2, bt(14, 3.5)), tf = Math.min(tEnd, kIn - 4 * F), fade = seg(t, tf, tf + 4 * F);
    if (fade >= 1) return;
    const f = mono(96, 500), cw = 57.6, full = words.join(' '), x0 = 960 - full.length * cw / 2;
    X.save(); X.globalAlpha *= 1 - fade; X.translate(0, 20 * E.in2(fade)); X.font = f; X.textBaseline = 'alphabetic'; X.fillStyle = C.PAPER;
    // typed in sung order, never ahead of a word's onset, 2.5 chars per frame (a word never starts before the last one
    // has finished typing, so a timeline that crowds the words still reads left to right)
    let ci = 0, shown = 0, free = tL;
    words.forEach((wd, i) => {
      const on = Math.max(free, lw[i].s - F);
      free = on + (wd.length + 1) / 2.5 * F;
      const n = Math.min(wd.length, Math.floor((t - on) / F * 2.5) + 1);
      if (t >= on) { X.fillText(wd.slice(0, n), x0 + ci * cw, 950); shown = ci + n; }
      ci += wd.length + 1;
    });
    if (Math.floor(beatPos(t) * 2) % 2 === 0) X.fillRect(x0 + shown * cw + 8, 950 - 70, 30, 84);
    X.restore();
  }
  // ✓-ish: a PAPER marker check (stroke with falling pressure) and a hedge, over the knee of the curve
  function checkIsh(X, t, V, anchor) {
    const t0 = bt(14, 2) - F;
    if (t < t0) return;
    const [ax, ay] = w2s(V, anchor[0], anchor[1]);
    const k = E.out2(seg(t, t0, t0 + 7 * F));
    X.save(); X.translate(ax, ay); X.rotate(-.06);
    const pts = [[-40, -6], [-26, 8], [-12, 24], [4, 4], [26, -26], [52, -58]];
    const n = pts.length - 1, upto = k * n;
    X.lineCap = 'round'; X.lineJoin = 'round';
    for (let i = 0; i < n && i < upto; i++) {
      const f_ = Math.min(1, upto - i), a = pts[i], b = pts[i + 1];
      X.strokeStyle = C.PAPER; X.lineWidth = 14 - i * 1.3;
      X.beginPath(); X.moveTo(a[0], a[1]); X.lineTo(lerp(a[0], b[0], f_), lerp(a[1], b[1], f_)); X.stroke();
    }
    const ti = bt(14, 2.5) - F;
    if (t >= ti) {
      const s = E.back(seg(t, ti, ti + 6 * F), 2.4);
      X.translate(62, 4); X.scale(s, s); X.font = `60px ${FONTS.marker}`; X.fillStyle = C.PAPER; X.textBaseline = 'alphabetic'; X.fillText('-ish', 0, 0);
    }
    X.restore();
  }
  // over the flat tail, up and right of where the cloud comes to rest (never under its hops or its roll), clear of the
  // funnel: lands at screen (1690, 620) in the pulled-back view
  const checkAnchor = () => [(1690 - O1[0]) / S1, (620 - O1[1]) / S1];
  // one frame of negative on each WRONG impact (INK↔PAPER)
  function flash(X, t, V, ws) {
    for (let i = 0; i < 3; i++) {
      const fi = Math.round(impactAt(ws[i]) * 30);
      if (Math.round(t * 30) !== fi) continue;
      X.save(); X.fillStyle = C.PAPER; X.fillRect(-50, -50, W + 100, H + 100);
      applyView(X, V);
      for (let j = 0; j <= i; j++) { const s = LAY.st[j]; hero(X, 'WRONG', s.x + s.w / 2, s.base, s.size, { stretch: 'cond', color: C.INK, shadow: null }); }
      X.restore();
    }
  }

  // ------------------------------------------------------------------ karaoke line (screen space; end of S09 → S10)
  const KAR = { x0: 272, x1: 1648, y0: 880, y1: 978, base: 950, size: 64, r: 49 };
  function karLayout(ws) {
    const cw = .6 * KAR.size, full = ws.map(w => w.d).join(' '), left = 960 - full.length * cw / 2;
    let c = 0; const pos = ws.map(w => { const p = { l: left + c * cw, r: left + (c + w.d.length) * cw }; p.c = (p.l + p.r) / 2; c += w.d.length + 1; return p; });
    return { cw, full, left, pos };
  }
  function karFill(t, ws, K) {
    const n = ws.length;
    if (t < ws[0].s) return K.left - 10;
    for (let i = 0; i < n; i++) {
      if (t < ws[i].s) return K.pos[i - 1].r + 6;
      if (t <= ws[i].e) return lerp(K.pos[i].l - 6, K.pos[i].r + 6, seg(t, ws[i].s, ws[i].e));
    }
    return lerp(K.pos[n - 1].r + 6, KAR.x1, E.in2(seg(t, ws[n - 1].e, Math.max(ws[n - 1].e + .08, T16 - F))));
  }
  // the CLAY ball lands on each word half a beat before it is sung; after the last word it hops to the end of the bar
  // and keeps bouncing on eighths, waiting for a next word that never comes
  function ballAt(t, ws, K, tIn) {
    const lands = ws.map((w, i) => ({ t: w.s - BEAT / 2, x: K.pos[i].c }));
    lands.push({ t: Math.max(T16, lands[lands.length - 1].t + .2), x: KAR.x1 - 80 });
    const yRest = KAR.y0 - 22;
    if (t < lands[0].t) {   // pops up out of the capsule's left end (anticipation squash), then one hop onto the first word
      const tp = tIn + 4 * F, x0 = KAR.x0 + KAR.r, th = Math.max(tp + 3 * F, lands[0].t - .3);
      if (t < tp) return { on: false };
      const pop = E.back(seg(t, tp, tp + 4 * F), 2.4);
      if (t < th) { const pre = seg(t, th - 3 * F, th); return { nx: lands[0].x, x: x0, y: yRest, sq: .7 * pre, sc: pop, on: true }; }
      const u = seg(t, th, lands[0].t);
      return { nx: lands[0].x, x: lerp(x0, lands[0].x, u), y: yRest - 90 * 4 * u * (1 - u), sq: Math.exp(-(t - th) * 30) * .6, sc: pop, on: true };
    }
    let i = 0; while (i < lands.length - 1 && t >= lands[i + 1].t) i++;
    const a = lands[i], b = lands[i + 1];
    if (!b) { const ph = frac((t - a.t) / (BEAT / 2)); return { nx: a.x, x: a.x, y: yRest - 60 * 4 * ph * (1 - ph), sq: Math.exp(-ph * 14), on: true }; }
    const u = (t - a.t) / (b.t - a.t), d = Math.abs(b.x - a.x), hgt = 55 + d * .28, c = lands[i + 2] || b;
    return { nx: lerp(b.x, c.x, E.io3(clamp(u * 1.3))), x: lerp(a.x, b.x, u), y: yRest - hgt * 4 * u * (1 - u), sq: Math.max(Math.exp(-(t - a.t) * 30), Math.exp(-(b.t - t) * 40) * .5), on: true };
  }
  function drawBall(X, B) {
    if (!B.on) return;
    const r = 22, sy = 1 - .3 * B.sq, sx = 1 + .3 * B.sq, sc = B.sc ?? 1;
    if (sc <= .01) return;
    X.save(); X.translate(B.x, B.y + r * (1 - sy)); X.scale(sx * sc, sy * sc);
    X.beginPath(); X.arc(0, 0, r + 4, 0, TAU); X.fillStyle = C.PAPER; X.fill();
    X.beginPath(); X.arc(0, 0, r, 0, TAU); X.fillStyle = C.CLAY; X.fill(); X.lineWidth = 4; X.strokeStyle = C.INK; X.stroke();
    X.fillStyle = rgba(C.PAPER, .9); X.beginPath(); X.arc(-6, -7, 5, 0, TAU); X.fill();
    X.restore();
  }
  // capsule + fill + words; growth u (bar 16) turns the fill into the frame-filling loading bar
  function karaoke(X, t, ws, tIn, o = {}) {
    const K = karLayout(ws);
    const kIn = E.out3(seg(t, tIn, tIn + 6 * F));
    if (kIn <= 0) return K;
    const u = o.grow || 0;
    const kh = E.out2(clamp(u * 4)), kv = clamp((u - .25) / .75);     // chunks: full width on b1, then a third of the height per eighth
    const rx0 = lerp(KAR.x0, -40, kh), rx1 = lerp(KAR.x1, W + 40, kh);
    const ry0 = lerp(KAR.y0, -40, kv), ry1 = lerp(KAR.y1, H + 40, kv);
    const rad = KAR.r * (1 - clamp(u * 3));
    o.floodTop = u > 1e-3 ? new DOMPoint(0, ry0).matrixTransform(X.getTransform()).y : 1e9;   // device px
    X.save(); X.globalAlpha *= clamp(kIn * 1.5);
    const cx1 = lerp(KAR.x0 + 2 * KAR.r, KAR.x1, kIn);
    rr(X, KAR.x0, KAR.y0, cx1 - KAR.x0, KAR.y1 - KAR.y0, KAR.r); X.fillStyle = C.INK; X.fill();
    const fx = Math.min(karFill(t, ws, K), cx1);
    X.save(); rr(X, KAR.x0, KAR.y0, cx1 - KAR.x0, KAR.y1 - KAR.y0, KAR.r); X.clip();
    if (fx > KAR.x0) { X.fillStyle = C.AMBER; X.fillRect(KAR.x0, KAR.y0, fx - KAR.x0, KAR.y1 - KAR.y0); }
    X.restore();
    if (u > 1e-3) { rr(X, rx0, ry0, rx1 - rx0, ry1 - ry0, rad); X.fillStyle = C.AMBER; X.fill(); }
    if (u < .3) { X.save(); X.globalAlpha *= 1 - clamp(u / .3); rr(X, KAR.x0, KAR.y0, cx1 - KAR.x0, KAR.y1 - KAR.y0, KAR.r); X.lineWidth = 4; X.strokeStyle = C.PAPER; X.stroke(); X.restore(); }
    X.font = mono(KAR.size, 600); X.textBaseline = 'alphabetic';
    ws.forEach((w, i) => {
      const p = K.pos[i], ta = tIn + 2 * F + i * F;
      if (t < ta) return;
      const pop = E.back(seg(t, ta, ta + 5 * F), 2.2), cur = t >= w.s - .03 && t <= w.e + .03;
      const s = pop * (cur ? 1.07 : 1);
      X.save(); X.translate(p.c, KAR.base); X.scale(s, s); X.translate(-p.c, -KAR.base);
      X.fillStyle = C.PAPER; X.fillText(w.d, p.l, KAR.base);
      const cover = u > 1e-3 ? W : fx;
      if (cover > p.l) { X.save(); X.beginPath(); X.rect(p.l - 4, KAR.y0 - 20, cover - p.l + 4, KAR.y1 - KAR.y0 + 40); X.clip(); X.fillStyle = C.INK; X.fillText(w.d, p.l, KAR.base); X.restore(); }
      X.restore();
    });
    X.restore();
    return K;
  }

  // ------------------------------------------------------------------ text-body silhouette (S10)
  // The rig is drawn clean into a CPU layer, then gradient-mapped to an AMBER duotone (a riso two-colour print of
  // itself) with scrolling prose knocked into it; below the loading-bar flood edge it prints NEGATIVE (INK body, AMBER
  // linework and prose). PAPER die-cut keyline. Returns the silhouette sample points for the glyph morph.
  function lut(stops) {
    const out = new Uint8ClampedArray(256 * 3), S = stops.map(([k, c]) => [k, hex2rgb(c)]);
    for (let i = 0; i < 256; i++) {
      const v = i / 255; let j = 0; while (j < S.length - 2 && v > S[j + 1][0]) j++;
      const [k0, c0] = S[j], [k1, c1] = S[j + 1], u = clamp((v - k0) / (k1 - k0));
      for (let c = 0; c < 3; c++) out[i * 3 + c] = lerp(c0[c], c1[c], u);
    }
    return out;
  }
  let _luts = null;
  const LUTS = () => _luts || (_luts = {
    pos: lut([[0, C.INK], [.16, C.INK], [.34, mix(C.AMBER, C.INK, .5)], [.62, C.AMBER], [.95, mix(C.AMBER, C.PAPER, .62)], [1, mix(C.AMBER, C.PAPER, .7)]]),
    neg: lut([[0, mix(C.AMBER, C.PAPER, .35)], [.2, C.AMBER], [.34, mix(C.INK, C.AMBER, .3)], [.62, mix(C.INK, C.AMBER, .12)], [1, mix(C.INK, C.AMBER, .2)]]),
  });
  function drawTextBody(Fr, x, y, R, S, t, o = {}) {
    const m = Fr.getTransform(), sc = G.scale, zoom = Math.hypot(m.a, m.b);
    const cw = Math.round(W * sc), ch = Math.round(H * sc);
    const cs = [[x - 3.6 * R, y - 9.6 * R], [x + 3.6 * R, y - 9.6 * R], [x + 3.6 * R, y + .6 * R], [x - 3.6 * R, y + .6 * R]].map(p => new DOMPoint(p[0], p[1]).matrixTransform(m));
    const bx0 = clamp(Math.floor(Math.min(...cs.map(p => p.x))), 0, cw), by0 = clamp(Math.floor(Math.min(...cs.map(p => p.y))), 0, ch);
    const bx1 = clamp(Math.ceil(Math.max(...cs.map(p => p.x))), 0, cw), by1 = clamp(Math.ceil(Math.max(...cs.map(p => p.y))), 0, ch);
    const bw = bx1 - bx0, bh = by1 - by0;
    if (bw <= 0 || bh <= 0) return null;
    const St = mergeState({ ...S, t, keyline: false, ground: 'ink' });
    const M = layer('p1_M');
    M.save(); M.setTransform(m); M.translate(x, y); drawOpusBody(M, R, St); M.restore();
    const img = M.getImageData(bx0, by0, bw, bh), d = img.data;
    const split = clamp(Math.round((o.split ?? 1e9) - by0), 0, bh), Lp = LUTS().pos, Ln = LUTS().neg;
    const pts = [], stp = Math.max(2, Math.round(8 * sc));
    for (let j = 0; j < bh; j++) {
      const L = j >= split ? Ln : Lp, row = j * bw * 4, samp = j % stp === 0;
      for (let i = 0; i < bw; i++) {
        const k = row + i * 4; if (d[k + 3] === 0) continue;
        const v = (d[k] * 77 + d[k + 1] * 151 + d[k + 2] * 28) >> 8, q = v * 3;
        d[k] = L[q]; d[k + 1] = L[q + 1]; d[k + 2] = L[q + 2];
        if (samp && i % stp === 0 && d[k + 3] > 110) pts.push([(bx0 + i) / sc, (by0 + j) / sc]);
      }
    }
    const T = layer('p1_T'); T.putImageData(img, bx0, by0);
    // prose knocked into the body (never across the face)
    const hy = y - St.dy * R - St.sy * (5.72 + (St.head.dy || 0)) * R, hx = x + St.dx * R + (St.head.dx || 0) * R / Math.sqrt(St.sy);
    const hp = new DOMPoint(hx, hy).matrixTransform(m), hr = R * 1.02 * zoom;
    for (const neg of [false, true]) {
      const r0 = neg ? by0 + split : by0, r1 = neg ? by1 : by0 + split;
      if (r1 <= r0) continue;
      T.save(); T.setTransform(1, 0, 0, 1, 0, 0);
      T.beginPath(); T.rect(bx0, r0, bw, r1 - r0); T.clip();
      // the face hole is its own clip: in one evenodd path, a face outside this band's rect would flip to "inside"
      T.beginPath(); T.rect(0, 0, T.canvas.width, T.canvas.height); T.moveTo(hp.x + hr, hp.y); T.arc(hp.x, hp.y, hr, 0, TAU, true); T.clip('evenodd');
      T.globalCompositeOperation = 'source-atop'; T.globalAlpha = neg ? .9 : .72;
      T.setTransform(m); textRows(T, x - 3.6 * R, y - 9.6 * R, 7.2 * R, 10.2 * R, t, neg ? tiles().amber : tiles().ink, R / 66, 5);
      T.restore();
    }
    // die-cut PAPER keyline, then the print
    const K = layer('p1_K'); K.save(); K.setTransform(1, 0, 0, 1, 0, 0);
    K.drawImage(layerCanvas('p1_T'), bx0, by0, bw, bh, bx0, by0, bw, bh); K.globalCompositeOperation = 'source-in'; K.fillStyle = C.PAPER; K.fillRect(bx0, by0, bw, bh); K.restore();
    const kr = Math.max(3, .045 * R * zoom / sc) * sc, al = o.alpha ?? 1;
    const kc = layerCanvas('p1_K');
    // keyline + print composed at full opacity first, then faded as one piece (12 stacked keyline copies at partial
    // alpha would read as a grey ghost)
    const Cc = al < 1 ? layer('p1_C') : Fr;
    Cc.save(); Cc.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; Cc.drawImage(kc, bx0, by0, bw, bh, bx0 + Math.cos(a) * kr, by0 + Math.sin(a) * kr, bw, bh); }
    Cc.drawImage(layerCanvas('p1_T'), bx0, by0, bw, bh, bx0, by0, bw, bh);
    Cc.restore();
    if (al < 1 && al > 0) { const pad = Math.ceil(kr) + 2; Fr.save(); Fr.setTransform(1, 0, 0, 1, 0, 0); Fr.globalAlpha *= al; Fr.drawImage(layerCanvas('p1_C'), bx0 - pad, by0 - pad, bw + 2 * pad, bh + 2 * pad, bx0 - pad, by0 - pad, bw + 2 * pad, bh + 2 * pad); Fr.restore(); }
    return { pts };
  }

  // the cloud as it stands at the S09 → S10 handoff (screen space)
  function cloudAtHandoff() {
    const ws = wrongs(), V = view(T15 - F, ws); layout(G.X);
    const tr = cloudTrack(T15 - F, ws);
    const [sx, sy] = w2s(V, tr.pos[0], tr.pos[1]);
    return { x: sx, y: sy, w: tr.w * cloudScreenK(V) };
  }

  // ------------------------------------------------------------------ S09
  const kIn0 = lw => Math.max(bt(14, 4) - F, lw[3].e + .16);   // karaoke line enters on bar 14 b4 (after the lyric)
  function paintS09(X, t) {
    groundInk(X); G.post.edgeSeed = EDGE;
    layout(X);
    const ws = wrongs(), lw = lessWrong(ws[2]), V = view(t, ws);
    X.save(); applyView(X, V); chart(X, t, V, ws); X.restore();
    const tr = cloudTrack(t, ws);
    const [cx, cy] = w2s(V, tr.pos[0], tr.pos[1]);
    const face = cloudFace(t, ws, tr);
    const swell = t < S9_T0 + 7 * F ? lerp(.72, 1, E.back(seg(t, S9_T0, S9_T0 + 6 * F), 2)) : 1;   // the tab swells into the cloud
    drawCloud(X, { x: cx, y: cy, w: tr.w * cloudScreenK(V), rot: tr.rot, sx: tr.sx, sy: tr.sy, t, grow: swell, ...face });
    chyron(X, t);
    readout(X, t, ws);
    axisLabels(X, t, V);
    checkIsh(X, t, V, checkAnchor(tr));
    const kIn = kIn0(lw);
    captions(X, t, lw, kIn);
    if (t >= kIn) { const kw = karaokeWords(), K = karaoke(X, t, kw, kIn); drawBall(X, ballAt(t, kw, K, kIn)); }
    seekbar(X, t);
    flash(X, t, V, ws);
  }
  scene('S09_wrong_staircase', S9_T0, T15, (X, t) => viaCPU(X, Fr => paintS09(Fr, t)));

  // ------------------------------------------------------------------ S10
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  function calendar(X, t, a = 1) {
    const t0 = T15 + .14, t1 = bt(15, 2) - F, N = 15, fin = 2026 * 12 + 5;
    if (t < t0 || a <= 0) return;
    const tf = i => t0 + (t1 - t0) * (1 - Math.sqrt(1 - (i + 1) / N));      // flips decelerate into the hard stop
    let done = 0; while (done < N && t >= tf(done)) done++;
    const x = 1656, y = 42, w = 168, h = 132;
    const jolt = t >= t1 ? 7 * Math.exp(-12 * (t - t1)) * Math.cos((t - t1) * 40) : 0;
    const pop = E.back(seg(t, t0, t0 + 5 * F), 2);
    X.save(); X.globalAlpha *= a; X.translate(x + w / 2, y + jolt); X.scale(pop, pop); X.translate(-w / 2, 0);
    const page = (mo, age = 0) => {
      X.save(); X.globalAlpha *= 1 - age;
      X.translate(w / 2, 20); X.rotate(-age * .9); X.translate(-w / 2 + age * 40, -20 - age * 46);
      X.fillStyle = C.PAPER; X.fillRect(0, 20, w, h - 20);
      X.fillStyle = C.INK; X.textAlign = 'center'; X.font = mono(36, 700); X.fillText(MONTHS[mo % 12], w / 2, 70);
      X.font = mono(36, 500); X.fillText(String(Math.floor(mo / 12)), w / 2, 114); X.restore();
    };
    X.fillStyle = mix(C.PAPER, C.INK, .3); X.fillRect(5, 26, w, h - 20);            // the pad's edge
    page(fin - N + done);
    for (let i = done - 1; i >= Math.max(0, done - 3); i--) { const age = (t - tf(i)) / (4 * F); if (age < 1) page(fin - N + i, age); }
    X.fillStyle = C.UI_GREY; X.fillRect(0, 0, w, 22); X.fillStyle = C.INK; X.beginPath(); X.arc(40, 11, 5, 0, TAU); X.arc(w - 40, 11, 5, 0, TAU); X.fill();
    X.restore();
    if (t >= t1 - 2 * F) { X.save(); X.globalAlpha *= a * .78 * clamp((t - t1 + 2 * F) / (4 * F)); X.font = mono(28, 500); X.fillStyle = C.PAPER; X.textAlign = 'right'; X.fillText('knowledge cutoff', 1824, 212); X.restore(); }
  }
  // the karaoke mic (held under the chin, tilted to the mouth): drawn through the rig's hold() so it is printed in the
  // same AMBER duotone as the body
  const MIC = (x, R) => {   // the fist grips the handle: only the butt (below) and the grille (above) are drawn
    x.rotate(.42); x.lineJoin = 'round'; x.lineWidth = Math.max(3, .045 * R); x.strokeStyle = C.INK;
    x.beginPath(); x.moveTo(-.06 * R, .15 * R); x.lineTo(.06 * R, .15 * R); x.lineTo(.045 * R, .4 * R); x.lineTo(-.045 * R, .4 * R); x.closePath();
    x.fillStyle = C.BRICK; x.fill(); x.stroke();
    rr(x, -.085 * R, -.25 * R, .17 * R, .08 * R, .02 * R); x.fillStyle = C.BRICK; x.fill(); x.stroke();
    x.beginPath(); x.arc(0, -.37 * R, .15 * R, 0, TAU); x.fillStyle = C.PAPER; x.fill(); x.stroke();
    x.save(); x.clip(); x.lineWidth = Math.max(1.5, .022 * R);
    for (let i = -2; i <= 2; i++) { x.beginPath(); x.moveTo(i * .06 * R, -.55 * R); x.lineTo(i * .06 * R, -.2 * R); x.stroke(); x.beginPath(); x.moveTo(-.16 * R, -.37 * R + i * .06 * R); x.lineTo(.16 * R, -.37 * R + i * .06 * R); x.stroke(); }
    x.restore();
  };
  // sing-along pose (text-body Opus): sway on half notes, bob on beats, the pointing hand already on the next word
  function singPose(t, B, ws, hx, R, soles, z) {
    const b = beatPos(t), bob = Math.abs(Math.sin(b * Math.PI)), sw = Math.sin((b - .15) * Math.PI / 2);
    let mouth = 'rest', wi = -1, wAge = 9;
    ws.forEach((w, i) => { if (t >= w.s - .03) { wi = i; wAge = t - w.s; } });
    for (const w of ws) if (t >= w.s - .03 && t <= w.e) { mouth = visemeFor(w.d, seg(t, w.s, w.e)); break; }
    mouth = { E: 'A', I: 'grin', U: 'O' }[mouth] || mouth;     // belting: the rig's biggest open shapes read at R 88
    // every sung word lands in the body: a quick dip (squash) with a spring back, the head tipping side to side
    const hit = wi >= 0 && wAge < .4 ? Math.exp(-wAge * 16) * Math.cos(wAge * 30) : 0, side = wi % 2 ? 1 : -1;
    const gx = B && B.on ? clamp((B.x - hx) / 320, -1, 1) : .4;
    const shx = soles[0] + (.06 * sw + .62) * R * z, shy = soles[1] - 4.45 * R * z;
    const tx = B && B.nx !== undefined ? B.nx : 1200, ty = KAR.y0 + 30;
    const ang = Math.atan2(ty - shy, tx - shx), reach = 1.5;
    return {
      dx: .06 * sw, dy: .05 * bob, sy: 1 - .045 * hit + (frac(b) < .1 ? -.02 * (1 - frac(b) / .1) : 0),
      head: { tilt: .07 * sw + (wi >= 0 ? side * .07 * (1 - Math.exp(-wAge * 12)) : 0), dx: 0, dy: -.04 * hit },
      armL: { hand: [-.32 + .04 * sw, 4.5 + .05 * bob - .06 * hit], bend: -1, front: true, type: 'mitten', hold: MIC },
      armR: { hand: [.62 + Math.cos(ang) * reach, 4.45 - Math.sin(ang) * reach], bend: 1, front: true, type: 'point', fingerAng: ang },
      face: { eyes: 'cursor', gaze: [gx, .9], mouth, lid: blinkAt(t, 21), cursorOn: Math.floor(beatPos(t)) % 2 === 0 },
      crown: { flare: 1 + .06 * pulse(t, 8) },
    };
  }
  function paintS10(X, t) {
    groundInk(X); G.post.edgeSeed = EDGE;
    layout(X);
    const ws9 = wrongs(), lw = lessWrong(ws9[2]), kw = karaokeWords(), tIn = kIn0(lw);
    const T3 = bt(16, 3) - F, T4 = bt(16, 4);
    const Pp = [960, 540];       // the last pixel (CRT-off: the flood folds to a line, then to a dot)
    if (t < T3) {
      // bar 15 b1: the chart lets go (fades + sinks) while the cloud bursts into glyphs
      const kd = seg(t, T15, T15 + .26);
      if (kd < 1) {
        const V = view(T15 - F, ws9), tt = T15 - F + (t - T15) * .3;
        X.save(); X.globalAlpha = 1 - E.in2(kd); X.translate(0, 50 * E.in2(kd)); applyView(X, V); chart(X, tt, V, ws9); X.restore();
        X.save(); X.globalAlpha = 1 - E.out2(kd); readout(X, T15, ws9); axisLabels(X, T15, V);
        checkIsh(X, T15, V, checkAnchor(cloudTrack(T15 - F, ws9))); X.restore();
      }
      // bar 16: the fill runs past the last word, then the bar grows in chunks on eighths (overshoot) to fill the frame
      const chunks = [[T16 - F, .25], [bt(16, 1.5) - F, .5], [bt(16, 2) - F, .75], [bt(16, 2.5) - F, 1]];
      let u = 0; chunks.forEach(([c, v], i) => { if (t > c) u = lerp(i ? chunks[i - 1][1] : 0, v, E.back(seg(t, c, c + 4 * F), 1.3)); });
      const cV = E.in3(seg(t, T3 - 5 * F, T3 - 2 * F)), cH = E.in3(seg(t, T3 - 2 * F, T3 - F * .2));
      const z = 1 + .075 * E.io2(seg(t, T15, T16));          // camera: slow push in bar 15, held in bar 16
      const soles = [960, KAR.y0 - 2], R = 88;
      const furn = 1 - seg(u, .45, .7);                   // corner furniture bows out before the flood reaches it
      if (furn > 0) { chyron(X, t, furn); calendar(X, t, furn); }
      // halftone spotlight (karaoke stage)
      X.save(); X.globalAlpha = .55 * clamp((t - T15 - .3) / .25) * (1 - clamp(u * 2));
      X.beginPath(); X.moveTo(860, 0); X.lineTo(1060, 0); X.lineTo(1230, KAR.y0); X.lineTo(690, KAR.y0); X.closePath(); X.fillStyle = halftone(X, C.AMBER, .16, 14, 45); X.fill();
      // two stage beams from the top corners, crossing onto the singer; they swing on half notes (a sway, not a flicker)
      X.globalAlpha *= .62;
      for (const sd of [-1, 1]) {
        const sway = 46 * Math.sin((beatPos(t) / 2 + (sd > 0 ? .5 : 0)) * Math.PI), top = 960 + sd * 900, foot = 960 - sd * 60 + sway;
        X.beginPath(); X.moveTo(top - 70, -30); X.lineTo(top + 70, -30); X.lineTo(foot + 250, KAR.y0); X.lineTo(foot - 250, KAR.y0); X.closePath();
        X.fillStyle = halftone(X, C.AMBER, .09, 14, 45); X.fill();
      }
      X.restore();
      X.save();
      if (cV > 0) { X.translate(Pp[0], Pp[1]); X.scale(lerp(1, .012, cH), lerp(1, .018, cV)); X.translate(-Pp[0], -Pp[1]); }
      const kop = { grow: u }, K = karaoke(X, t, kw, tIn, kop);
      const B = ballAt(t, kw, K, tIn);
      // the singer
      X.save(); X.translate(soles[0], soles[1]); X.scale(z, z); X.translate(-soles[0], -soles[1]);
      const S = singPose(t, B, kw, soles[0], R, soles, z);
      if (t >= T16 - .05) {    // bar 16: the bar keeps going without it. It looks up at the flood, arms rise: whoa
        const k = E.back(seg(t, T16 - .05, T16 + .3), 1.4);
        S.face.gaze = [lerp(S.face.gaze[0], .2, k), lerp(.9, -1, k)]; S.face.eyes = 'normal';
        S.armL = { hand: [lerp(S.armL.hand[0], -1.45, k), lerp(S.armL.hand[1], 5.4, k)], bend: 1, type: 'mitten', front: true, hold: MIC };
        S.armR = { hand: [lerp(S.armR.hand[0], 1.45, k), lerp(S.armR.hand[1], 5.4, k)], bend: -1, front: true, type: 'spark' };
        S.face.mouth = 'O'; S.crown = { flare: 1 + .12 * k }; S.dy = .08 * k;
      }
      const kMorph = seg(t, T15, T15 + .56);
      const figA = E.io2(seg(t, T15 + .3, T15 + .52));
      const tb = drawTextBody(X, soles[0], soles[1], R, S, t, { alpha: figA, split: kop.floodTop ?? 1e9 });
      X.restore();
      // particle-to-glyph morph: the cloud bursts into glyphs that fly into the silhouette
      if (kMorph < 1 && tb && tb.pts.length) {
        const pts = tb.pts, n = Math.min(pts.length, 460);          // fewer, chunkier glyphs: a burst, not confetti
        const c0 = cloudAtHandoff(), circ = cloudCircles(T15, c0.w);
        X.save(); X.font = `800 30px ${FONTS.mono}`; X.textAlign = 'center'; X.textBaseline = 'middle';
        const glyphs = 'abcdefghijklmnopqrstuvwxyz.,;:{}()?!';
        X.globalAlpha = 1 - seg(t, T15 + .44, T15 + .56);
        for (let i = 0; i < n; i++) {
          const pc = circ[Math.floor(hash(i * 3 + 1) * circ.length)], an = hash(i * 5 + 2) * TAU, rd = Math.sqrt(hash(i * 7 + 3)) * pc[2];
          const sxp = c0.x + pc[0] + Math.cos(an) * rd, syp = c0.y + pc[1] + Math.sin(an) * rd;
          const d = hash(i * 11 + 4) * .16, k = E.io3(seg(t, T15 + d, T15 + d + .36));
          const [tx, ty] = pts[Math.floor(((i * 7919) % n) * pts.length / n)];
          const mx = (sxp + tx) / 2 + (hash(i * 13) - .5) * 90, my = Math.min(syp, ty) - 190 - hash(i * 17) * 70;
          const px_ = (1 - k) * (1 - k) * sxp + 2 * (1 - k) * k * mx + k * k * tx, py_ = (1 - k) * (1 - k) * syp + 2 * (1 - k) * k * my + k * k * ty;
          X.fillStyle = hash(i * 19) < .12 ? C.PAPER : C.AMBER;
          X.fillText(glyphs[Math.floor(hash(i * 23) * glyphs.length)], px_, py_);
        }
        X.restore();
      }
      drawBall(X, B);
      X.restore();
      if (cV > .6) { X.save(); X.fillStyle = C.PAPER; const lw_ = lerp(1840, 14, cH), lh = lerp(20, 10, cH); X.fillRect(Pp[0] - lw_ / 2, Pp[1] - lh / 2, lw_, lh); X.restore(); }
      seekbar(X, t, 1 - seg(t, T16 - F, T16 + 3 * F));
    } else {
      // b3: the last pixel pops into the first chat bubble; b4: near-blackout, bubble + cursor; it docks for S11
      const a = t - T3;
      if (a < 3 * F) { X.save(); X.fillStyle = C.PAPER; const s_ = lerp(14, 34, a / (3 * F)); X.fillRect(Pp[0] - s_ / 2, Pp[1] - s_ / 2, s_, s_); X.restore(); }
      if (a < 12 * F) { // pop ring
        const k = E.out3(seg(a, F, 12 * F));
        X.save(); X.globalAlpha = 1 - k; X.strokeStyle = C.PAPER; X.lineWidth = 10 * (1 - k) + 2; X.beginPath(); X.arc(Pp[0], Pp[1], 30 + k * 640, 0, TAU); X.stroke(); X.restore();
      }
      const sp = E.back(seg(a, F, 8 * F), 2.0);
      if (sp > 0) {
        // the shared bubble() at 72 px, centred; it docks exactly where chorus1's dockedBubble() holds it
        // (72 → 48 px about its bottom-left, which lands on (96, 890)) on the last visible frame before the cut
        const str = 'Hi! How can I help you today?';
        X.save(); X.font = mono(72, 500);
        const bw = X.measureText(str).width + 52, bh = 180.4, bx = 960 - bw / 2, by = 540 - bh / 2;
        X.restore();
        const td = T17 - F - 10 * F, ke = E.io3(seg(t, td, T17 - 2 * F));
        const ant = t > td - 4 * F && t < td ? -.03 * Math.sin(seg(t, td - 4 * F, td) * Math.PI) : 0;   // tiny inhale, then go
        const k = lerp(1, 48 / 72, ke) * (1 + ant), ax = lerp(bx, 96, ke), ay = lerp(by + bh, 890, ke);
        X.save();
        X.translate(ax, ay); X.scale(k, k); X.translate(-bx, -(by + bh));
        X.translate(960, 540); X.scale(sp, sp); X.translate(-960, -540);
        bubble(X, bx, by, str, { who: 'opus', size: 72, endTurn: true, maxW: 1420 });
        X.restore();
      }
      // the cursor, exactly where (and in phase with) S11's reply-box caret, so it rides the cut
      if (t >= T4 && Math.floor(beatPos(t) * 2) % 2 === 0) { X.fillStyle = C.CLAY; X.fillRect(132, 922, 10, 54); }
      seekbar(X, t, clamp((t - POP) / (3 * F)));
    }
  }
  scene('S10_sing_along', T15, T17, (X, t) => viaCPU(X, Fr => paintS10(Fr, t)));
})();
