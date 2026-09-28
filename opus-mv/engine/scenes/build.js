// build.js: BUILD-UP, bars 61–64, 112.50–120.00 (BIBLE §8 BUILD-UP; SHOTLIST S32–S35). INK·M, TEAL + SPARK.
//   S32  112.50–116.25  the period becomes the terminal cursor; `> next one. make no mistakes.` (FOCAL, locked for
//                       bar 61); on b2 `claude-next/` spews 12 subagent minis (R 32); b3–b4 insert: one mini at R 160
//                       saluting, a tiny ✻ on its forehead, under the locked prompt. Bar 62: `git commit -m` over
//                       `"keep the values. fix my bugs."` (locked) while the picture cuts 2 → 1 → ½ → ½ beats: minis
//                       carry files into the folder; a faint 12-ray silhouette assembles from diff lines behind the
//                       TEAL text-body Opus; the own-source highlight races down the scrollback; the folder closes.
//   S33  116.25–118.13  the cutting stops dead: clean Opus, MCU R 160. `esc` lifts off `(esc to interrupt)` and becomes
//                       the CLAY keycap on a coiled cable still plugged into the terminal, with the note
//                       "if I get it / wrong, / push back"; held out across the desk; lands in the human's hand on b4.
//   S34  118.13–119.53  the tab sky spirals into a vortex (¼, then ⅛ beats); the flat next-token panel (4 × `? 0.25`);
//                       `✻ Singularitizing…` rides the outer arm; 3 debris cards; the core blows up into WHITE.
//   S35  119.53–120.00  WHITE: the INK-line hand holding the ESC keycap (note turned away); the cable runs off-frame.
// Every frame is a pure function of t, painted into CPU canvases (willReadFrequently) and uploaded once.
(() => {
  const F = 1 / 30, BEAT = 60 / 128, BAR = 4 * BEAT;
  const bt = (bar, beat = 1) => (bar - 1) * BAR + (beat - 1) * BEAT;
  const T61 = bt(61), T62 = bt(62), T63 = bt(63), T64 = bt(64), T65 = bt(65), TW = bt(64, 4);
  const ENTER = bt(61, 2) - F;                         // ⏎ (the spew starts on b2)
  const INSERT = bt(61, 3) - F;                        // cut to the saluting mini
  const CUTS = [T62 - F, bt(62, 3) - F, bt(62, 4) - F, bt(62, 4) + BEAT / 2 - F, T63 - F]; // 2 → 1 → ½ → ½

  // ------------------------------------------------------------------ CPU canvases (see hook.js: 10-70× faster here)
  const CL = new Map();
  const cpuCanvas = (w, h) => { const c = new OffscreenCanvas(Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); c.getContext('2d', { willReadFrequently: true }); return c; };
  const cx2d = c => c.getContext('2d', { willReadFrequently: true });
  function lay(name) {
    const w = Math.round(W * G.scale), h = Math.round(H * G.scale);
    let L = CL.get(name);
    if (!L || L.c.width !== w || L.c.height !== h) { const c = cpuCanvas(w, h); L = { c, x: cx2d(c), used: -1 }; CL.set(name, L); }
    if (L.used !== G.frameId) {
      const x = L.x; x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none';
      x.clearRect(0, 0, w, h); x.setTransform(G.scale, 0, 0, G.scale, 0, 0); L.used = G.frameId;
    }
    return L.x;
  }
  const layC = name => CL.get(name).c;
  function viaCPU(X, fn) {
    const Fc = lay('bu_frame');
    fn(Fc);
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(layC('bu_frame'), 0, 0); X.restore();
  }
  const HT = new Map();
  function dots(ctx, color, density = .5, cell = 10, angle = 45) { // halftone pattern with CPU tiles (gfx.halftone recipe)
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
  const devSet = (ctx, M) => { const s = G.scale; ctx.setTransform(s * M.a, s * M.b, s * M.c, s * M.d, s * M.e, s * M.f); };
  const mp = (M, x, y) => [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f];
  const win = (t, a, b, fi = .1, fo = .1) => clamp((t - a) / fi) * clamp((b - t) / fo);
  const step2 = t => Math.floor(t * 15) / 15;            // humans and paper on 2s

  // ------------------------------------------------------------------ the rig through a matrix, with die-cut keylines
  // M maps rig buffer space (origin at the soles, px, y down) to logical screen space.
  function rigLayer(M, R, st, o = {}) {
    const S = mergeState(st);
    const sc = G.scale, cw = Math.round(W * sc), ch = Math.round(H * sc);
    const zoom = Math.hypot(M.a, M.b);
    const pts = [[-3.2 * R, -9.8 * R], [3.2 * R, -9.8 * R], [3.2 * R, .7 * R], [-3.2 * R, .7 * R]].map(p => mp(M, p[0], p[1]));
    const ring = o.keyline === false ? [] : [[C.PAPER, Math.max(3, .035 * R + 1.5) * zoom]];
    const pad = (ring.length ? ring[0][1] : 0) + 6;
    let bx0 = Math.min(...pts.map(p => p[0])) - pad, bx1 = Math.max(...pts.map(p => p[0])) + pad;
    let by0 = Math.min(...pts.map(p => p[1])) - pad, by1 = Math.max(...pts.map(p => p[1])) + pad;
    bx0 = Math.max(0, Math.floor(bx0 * sc)); by0 = Math.max(0, Math.floor(by0 * sc));
    bx1 = Math.min(cw, Math.ceil(bx1 * sc)); by1 = Math.min(ch, Math.ceil(by1 * sc));
    const bw = bx1 - bx0, bh = by1 - by0;
    const name = o.name || 'bu_o';
    const raw = lay(name + 'raw'), T = lay(name + 'tint'), O = lay(name + 'out');
    if (bw <= 0 || bh <= 0) return null;
    raw.save(); devSet(raw, M); if (S.flip) raw.scale(-1, 1); drawOpusBody(raw, R, S); if (o.after) o.after(raw, R, S); raw.restore();
    const rc = layC(name + 'raw'), tc = layC(name + 'tint');
    O.save(); O.setTransform(1, 0, 0, 1, 0, 0);
    for (const [col, rad] of ring) {
      T.save(); T.setTransform(1, 0, 0, 1, 0, 0); T.globalCompositeOperation = 'source-over'; T.clearRect(bx0, by0, bw, bh);
      T.drawImage(rc, bx0, by0, bw, bh, bx0, by0, bw, bh); T.globalCompositeOperation = 'source-in'; T.fillStyle = col; T.fillRect(bx0, by0, bw, bh); T.restore();
      const n = rad * sc > 7 ? 16 : 12, rp = rad * sc;
      for (let i = 0; i < n; i++) { const a = i / n * TAU; O.drawImage(tc, bx0, by0, bw, bh, bx0 + Math.cos(a) * rp, by0 + Math.sin(a) * rp, bw, bh); }
    }
    O.drawImage(rc, bx0, by0, bw, bh, bx0, by0, bw, bh);
    O.restore();
    return { c: layC(name + 'out'), bx0, by0, bw, bh };
  }
  function blit(dst, L, alpha = 1) {
    if (!L) return;
    dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.globalAlpha = alpha;
    dst.drawImage(L.c, L.bx0, L.by0, L.bw, L.bh, L.bx0, L.by0, L.bw, L.bh); dst.restore();
  }
  // rig points in buffer space (sole origin, px, y down). body: (bx, by) in R units, y up. head: local px offset, y down.
  function rigPt(S, R, p) {
    const hip = [0, -SK.hipY * R], l = S.lean || 0, dx = p[0] - hip[0], dy = p[1] - hip[1];
    p = [hip[0] + dx * Math.cos(l) - dy * Math.sin(l), hip[1] + dx * Math.sin(l) + dy * Math.cos(l)];
    const sy = S.sy || 1, sx = 1 / Math.sqrt(sy);
    p = [p[0] * sx + (S.dx || 0) * R, p[1] * sy - (S.dy || 0) * R];
    return S.flip ? [-p[0], p[1]] : p;
  }
  const bodyPt = (S, R, bx, by) => rigPt(S, R, [bx * R, -by * R]);
  function headPt(S, R, hx, hy) {
    const tl = S.head.tilt || 0;
    const q = [hx * Math.cos(tl) - hy * Math.sin(tl), hx * Math.sin(tl) + hy * Math.cos(tl)];
    return rigPt(S, R, [q[0] + (S.head.dx || 0) * R, q[1] - (SK.headC + (S.head.dy || 0)) * R]);
  }
  // a sticker-sized rig sprite (built once): the minis (R 32, 5-ray crown, a tiny ✻ on the forehead)
  const SPR = new Map();
  function rigSprite(key, R, st) {
    let s = SPR.get(key); if (s) return s;
    const S = mergeState(st);
    const k = 2, pad = 10, w = Math.ceil(6.6 * R + pad * 2), h = Math.ceil(10.4 * R + pad * 2);
    const ox = w / 2, oy = h - pad - .5 * R;
    const raw = cpuCanvas(w * k, h * k), rx = cx2d(raw);
    rx.setTransform(k, 0, 0, k, ox * k, oy * k); drawOpusBody(rx, R, S);
    const fh = headPt(S, R, 0, -.58 * R);           // the subagent mark
    rx.setTransform(k, 0, 0, k, (ox + fh[0]) * k, (oy + fh[1]) * k); sparkMark(rx, 0, 0, .15 * R);
    const tint = cpuCanvas(w * k, h * k), tx = cx2d(tint);
    tx.drawImage(raw, 0, 0); tx.globalCompositeOperation = 'source-in'; tx.fillStyle = C.PAPER; tx.fillRect(0, 0, w * k, h * k);
    const c = cpuCanvas(w * k, h * k), x = cx2d(c), rad = Math.max(3, .035 * R + 1.5) * k;
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; x.drawImage(tint, Math.cos(a) * rad, Math.sin(a) * rad); }
    x.drawImage(raw, 0, 0);
    s = { c, ox, oy, w, h, k, S };
    SPR.set(key, s); return s;
  }
  function drawSprite(c, s, x, y, o = {}) {
    const { sc = 1, rot = 0, sx = 1, sy = 1, alpha = 1, flip = false } = o;
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(sc * sx * (flip ? -1 : 1), sc * sy); c.globalAlpha *= alpha;
    c.drawImage(s.c, -s.ox, -s.oy, s.w, s.h); c.restore();
  }
  function sparkMark(x, cx, cy, r) { // the tiny ✻: 6 rounded bars, SPARK with an INK line
    x.save(); x.translate(cx, cy); x.fillStyle = C.SPARK; x.strokeStyle = C.INK; x.lineWidth = Math.max(.8, r * .2);
    for (let i = 0; i < 3; i++) { x.save(); x.rotate(i / 3 * Math.PI + Math.PI / 2); rr(x, -r, -r * .26, r * 2, r * .52, r * .26); x.stroke(); x.restore(); }
    for (let i = 0; i < 3; i++) { x.save(); x.rotate(i / 3 * Math.PI + Math.PI / 2); rr(x, -r, -r * .26, r * 2, r * .52, r * .26); x.fill(); x.restore(); }
    x.restore();
  }

  // ------------------------------------------------------------------ the scrollback: this frame's own source
  // Render time can't fetch over file://, so the real code comes from the functions themselves (Function#toString):
  // the engine's drawOpus, and selfPortrait below, whose line `drawOpus(ctx, t)  // I am drawing myself` is what
  // actually paints the TEAL Opus beside the terminal. (If a prebuild ever provides window.SRC, it is used first.)
  let TB_ARGS = null;                                   // where the text-body Opus stands this frame (set per shot)
  function selfPortrait(ctx, t) {
    const drawOpus = textBodyOpus;                      // the TEAL skin: the rig, filled with this file's own text
    ctx.save();
    drawOpus(ctx, t)  // I am drawing myself
    ctx.restore();
  }
  let _src = null;
  function srcLines() {
    if (_src) return _src;
    const clean = s => s.replace(/\t/g, '  ').replace(/→/g, '->').replace(/[^ -ÿ–-…]/g, '*').replace(/\s+$/, '');
    const out = [];
    const add = (path, text) => { out.push(`// ${path}`); for (const l of String(text).split('\n')) out.push(clean(l)); out.push(''); };
    const S = window.SRC || null;
    add('engine/opus.js', S && S['engine/opus.js'] ? S['engine/opus.js'] : drawOpus);
    add('engine/scenes/build.js', selfPortrait);
    add('engine/scenes/build.js', textBodyOpus);
    add('engine/opus.js', drawOpusBody);
    const hl = out.findIndex(l => l.includes('// I am drawing myself'));
    if (hl < 0) throw new Error('build.js: the self-drawing line is missing from the scrollback');
    let glyphs = out.slice(hl - 30).join(' ').replace(/\s+/g, '');
    _src = { lines: out, hl, glyphs };
    return _src;
  }
  // draws lines [top, top+n) in a clipped column; `hlRow` = which source line wears the SPARK selection
  function scrollback(c, o) {
    const { x0 = 96, y0 = 300, x1 = 1420, y1 = 840, size = 48, lh = 58, top = 0, hl = -1, alpha = 1, base = 36, reveal = 99, smear = 0, lowFrom = 99, lowA = 1 } = o;
    const L = srcLines().lines, adv = size * .6;
    c.save(); c.beginPath(); c.rect(x0 - 20, y0, x1 - x0 + 40, y1 - y0); c.clip();
    c.font = mono(size, 500); c.textAlign = 'left';
    const i0 = Math.floor(top), fy = (top - i0) * lh, n = Math.ceil((y1 - y0) / lh) + 2;
    for (let k = -1; k < n; k++) {
      const i = i0 + k; if (i < 0 || i >= L.length) continue;
      const y = y0 + base + k * lh - fy;
      if (k > reveal) continue;
      const s = L[i]; if (!s.trim() && i !== hl) continue;
      const vis = s.slice(0, Math.ceil((x1 - x0) / adv) + 2);
      if (i === hl) {
        const hs = vis.replace(/^\s+/, ''); c.font = mono(size, 700);
        c.globalAlpha = alpha; rr(c, x0 - 14, y - size * .86, Math.min(x1 - x0 + 14, c.measureText(hs).width + 44), size * 1.2, 8); c.fillStyle = C.SPARK; c.fill();
        c.fillStyle = C.INK; c.fillText(hs, x0 + 8, y); c.font = mono(size, 500);
        continue;
      }
      const cm = /^\s*\/\//.test(s);
      c.fillStyle = cm ? C.UI_GREY : C.TEAL; c.globalAlpha = alpha * (cm ? .6 : .66) * (k >= lowFrom ? lowA : 1);
      c.fillText(vis, x0, y);
      if (smear) { c.globalAlpha = alpha * .22; c.fillText(vis, x0, y + smear); c.globalAlpha = alpha * .1; c.fillText(vis, x0, y + smear * 2); }
    }
    c.restore();
  }

  // ------------------------------------------------------------------ the TEAL text-body skin (BIBLE §6.1 skins)
  // One technique: the rig's silhouette filled with rows of this file's own source. The clean rig is drawn, re-inked
  // TEAL keeping its luminance (cream face and jacket → pale TEAL, crown → mid, BRICK → deep, INK lines → gone), and
  // the glyph rows are cut out of it, so the face still reads (eyes and mouth are holes in the text).
  function glyphFigure(c, x, soleY, R, st, o = {}) {
    const S = mergeState(st);
    const sc = G.scale, CW = Math.round(W * sc), CH = Math.round(H * sc);
    const bx0 = Math.max(0, Math.floor((x - 3.4 * R) * sc)), bx1 = Math.min(CW, Math.ceil((x + 3.4 * R) * sc));
    const by0 = Math.max(0, Math.floor((soleY - 9.9 * R) * sc)), by1 = Math.min(CH, Math.ceil((soleY + .6 * R) * sc));
    const bw = bx1 - bx0, bh = by1 - by0; if (bw <= 0 || bh <= 0) return;
    const raw = lay('bu_tbraw'), tint = lay('bu_tbtint'), gly = lay('bu_tbgly');
    raw.save(); devSet(raw, new DOMMatrix().translate(x, soleY)); if (S.flip) raw.scale(-1, 1); drawOpusBody(raw, R, S); raw.restore();
    const rc = layC('bu_tbraw'), tc = layC('bu_tbtint'), gc = layC('bu_tbgly');
    tint.save(); tint.setTransform(1, 0, 0, 1, 0, 0);
    tint.drawImage(rc, bx0, by0, bw, bh, bx0, by0, bw, bh);
    tint.globalCompositeOperation = 'color'; tint.fillStyle = C.TEAL; tint.fillRect(bx0, by0, bw, bh);
    tint.globalCompositeOperation = 'destination-in'; tint.drawImage(rc, bx0, by0, bw, bh, bx0, by0, bw, bh);
    tint.restore();
    // glyph rows (white), stepped one row per beat, revealed top-down by the "print head"
    const fs = o.fs || Math.max(11, R * .19), lh = fs * 1.08, src = srcLines().glyphs, off = o.offset || 0;
    const top = soleY - 9.9 * R, n = Math.ceil(10.5 * R / lh), rev = o.reveal === undefined ? 1e9 : (1.4 * R + o.reveal * 8.8 * R) / lh;
    gly.save(); gly.font = `700 ${fs.toFixed(1)}px ${FONTS.mono}`; gly.textAlign = 'left'; gly.fillStyle = '#fff';
    const chars = Math.ceil(6.8 * R / (fs * .6)) + 2;
    for (let r = 0; r < n && r <= rev; r++) {
      const k = ((r + off) * 67) % (src.length - chars - 1);
      gly.fillText(src.substr(k, chars), x - 3.4 * R + ((r * 3) % 5) * .2 * fs, top + (r + 1) * lh);
    }
    gly.globalCompositeOperation = 'source-in'; gly.setTransform(1, 0, 0, 1, 0, 0); gly.drawImage(tc, bx0, by0, bw, bh, bx0, by0, bw, bh);
    gly.restore();
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    // the body underlay (faint), then the text; the print head row flashes SPARK
    const revY = top + Math.min(n, rev + 1) * lh;
    if (o.reveal !== undefined) { c.save(); c.beginPath(); c.rect(0, 0, CW, revY * sc); c.clip(); }
    if (o.knock) { // an INK die-cut around the figure, so it separates from busy ground
      const kx = lay('bu_tbk'), kc = layC('bu_tbk'); kx.save(); kx.setTransform(1, 0, 0, 1, 0, 0);
      kx.drawImage(rc, bx0, by0, bw, bh, bx0, by0, bw, bh); kx.globalCompositeOperation = 'source-in'; kx.fillStyle = C.INK; kx.fillRect(bx0, by0, bw, bh); kx.restore();
      const rad = o.knock * sc; for (let i = 0; i < 12; i++) { const an = i / 12 * TAU; c.drawImage(kc, bx0, by0, bw, bh, bx0 + Math.cos(an) * rad, by0 + Math.sin(an) * rad, bw, bh); }
      c.drawImage(kc, bx0, by0, bw, bh, bx0, by0, bw, bh);
    }
    c.globalAlpha = (o.alpha ?? 1) * (o.under ?? .2); c.drawImage(tc, bx0, by0, bw, bh, bx0, by0, bw, bh);
    c.globalAlpha = o.alpha ?? 1; c.drawImage(gc, bx0, by0, bw, bh, bx0, by0, bw, bh);
    if (o.reveal !== undefined) c.restore();
    c.restore();
    if (o.reveal !== undefined && o.reveal < 1) { c.save(); c.fillStyle = C.SPARK; c.globalAlpha = .9; c.fillRect(x - 2 * R, revY - lh * .9, 4 * R, 5); c.restore(); }
  }
  function textBodyOpus(ctx, t) {
    const a = TB_ARGS; if (!a) return;
    glyphFigure(ctx, a.x, a.y, a.R, a.state, a.o);
  }

  // ------------------------------------------------------------------ terminal chrome (locked across S32's cuts)
  const BOX = { x: 72, y: 116, w: 1776, h: 150, r: 26 };
  const TX = 118, ADV72 = 43.2;
  const PROMPT = 'next one. make no mistakes.', COMMIT = '"keep the values. fix my bugs."';
  const STATUS1 = 'Clauding…', STATUS2 = 'Recursively self-improving… (esc to interrupt)';
  const SB = { base: 886, x: 96 };
  const ESC_I = 2 + STATUS2.indexOf('esc');            // cell index of `esc` in the status line (after "✻ ")
  const ESC_X = SB.x + ESC_I * 21.6;                   // → 766 px
  function titleBar(c, k = 1) {
    const y0 = -100 * (1 - k); if (k <= 0) return;
    c.save();
    c.fillStyle = C.PAPER; c.fillRect(0, y0, W, 96);
    c.fillStyle = C.INK; c.fillRect(0, y0 + 93, W, 3);
    for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(78 + i * 42, y0 + 56, 11, 0, TAU); c.fillStyle = i === 0 ? C.CLAY : C.PAPER; c.fill(); c.lineWidth = 3; c.strokeStyle = C.INK; c.stroke(); }
    c.font = mono(30, 500); c.fillStyle = C.INK; c.textAlign = 'center'; c.globalAlpha = .75; c.fillText('opus — ~/claude-next — claude', 960, y0 + 66);
    c.restore();
  }
  function promptBox(c, a = 1, flash = 0) {
    if (a <= 0) return;
    c.save(); c.globalAlpha = a;
    rr(c, BOX.x, BOX.y, BOX.w, BOX.h, BOX.r); c.fillStyle = C.INK; c.fill();
    c.lineWidth = 3 + flash * 3; c.strokeStyle = flash > 0 ? mix(C.UI_GREY, C.TEAL, flash) : C.UI_GREY; c.stroke();
    c.restore();
  }
  function spinner(c, x, base, size, t, col) { // ✻ with an open centre, stepped rotation (Claude Code's spinner)
    const cx = x + .3 * size, cy = base - .36 * size, a = Math.floor(t * 12) * .52, sz = size * (1 + .12 * pulse(t, 8));
    c.save(); c.translate(cx, cy); c.rotate(a); c.fillStyle = col;
    for (let i = 0; i < 6; i++) { c.save(); c.rotate(i / 6 * TAU); rr(c, sz * .1, -sz * .065, sz * .36, sz * .13, sz * .065); c.fill(); c.restore(); }
    c.restore();
  }
  function statusLine(c, t, which, o = {}) {
    const f = mono(36, 500), y = SB.base;
    spinner(c, SB.x, y, 36, t, C.SPARK);
    c.save(); c.font = f; c.textAlign = 'left';
    if (which === 1) { c.fillStyle = C.CLAY; c.fillText(STATUS1, SB.x + 2 * 21.6, y); }
    else {
      const verb = 'Recursively self-improving…', i0 = verb.length + 1;
      c.fillStyle = C.CLAY; c.fillText(verb, SB.x + 2 * 21.6, y);
      c.fillStyle = C.UI_GREY; c.fillText('(', SB.x + (2 + i0) * 21.6, y);
      if (!o.escGone) { c.fillStyle = C.PAPER; c.font = mono(36, 700); c.fillText('esc', ESC_X, y); c.font = f; }
      c.fillStyle = C.UI_GREY; c.fillText(' to interrupt)', ESC_X + 3 * 21.6, y);
      if (o.merged) { c.textAlign = 'right'; c.fillStyle = C.UI_GREY; c.fillText('merged by Claude: 80%+', 1824, y); }
    }
    c.restore();
  }
  // the bottom bar (§7.10): 0.2% at 112.5, filling toward the final chorus
  const CHAPTERS = [10.3, 11.25, 15.0, 22.5, 52.5, 56.25, 67.5, 69.84, 71.72, 112.5, 120.0];
  function contextFill(t) { return lerp(.002, .30, clamp((t - 112.5) / 7.5)); }
  function hud(c, t) {
    let cur = -1; CHAPTERS.forEach((s, i) => { if (t >= s) cur = i; });
    contextBar(c, contextFill(t), { ticks: CHAPTERS.map(s => s / 144), cur, lastLit: false });
  }
  function lyric(c, t, plate = false) {
    const L = lineAt(t); if (!L || L.s < 112.3 || L.s >= 120) return;
    subtitle(c, L, t, { y: 950, size: 60, color: C.PAPER, plate: plate ? rgba(C.INK, .94) : null });
  }

  // ------------------------------------------------------------------ the folder `claude-next/`
  const FOLD = { x: 404, y: 646, w: 316, h: 196 };     // bottom sits on the status line's shelf (y 842)
  function folder(c, cx, bottom, s, open, t, o = {}) {
    const w = FOLD.w * s, h = FOLD.h * s, x0 = cx - w / 2, y0 = bottom - h, lw = 4;
    c.save(); c.lineJoin = 'round'; c.lineWidth = lw; c.strokeStyle = C.INK;
    if (o.shadow) { c.fillStyle = C.CLAY_DARK; c.beginPath(); c.moveTo(x0 + o.shadow, bottom + o.shadow); c.lineTo(x0 + o.shadow, y0 - 16 * s + o.shadow); c.lineTo(x0 + w * .36 + o.shadow, y0 - 16 * s + o.shadow); c.lineTo(x0 + w * .42 + o.shadow, y0 + o.shadow); c.lineTo(x0 + w + o.shadow, y0 + o.shadow); c.lineTo(x0 + w + o.shadow, bottom + o.shadow); c.closePath(); c.fill(); }
    // back panel with the tab
    c.beginPath(); c.moveTo(x0, bottom); c.lineTo(x0, y0 - 16 * s); c.lineTo(x0 + w * .36, y0 - 16 * s); c.lineTo(x0 + w * .42, y0);
    c.lineTo(x0 + w, y0); c.lineTo(x0 + w, bottom); c.closePath(); c.fillStyle = C.PAPER; c.fill(); c.stroke();
    // the inside (dark mouth) shows as the front flap drops open
    const fall = open;                                  // 0 closed .. 1 open (the front leans forward and down)
    const ft = y0 + 26 * s + fall * h * .52;            // front panel's top edge
    if (fall > .02) { c.fillStyle = dots(c, C.INK, .75, 7, 45); c.fillRect(x0 + lw, y0 + lw, w - lw * 2, ft - y0); c.fillStyle = rgba(C.INK, .55); c.fillRect(x0 + lw, y0 + lw, w - lw * 2, ft - y0); }
    if (o.inside) o.inside(c, x0, y0, w, h, ft);
    // front panel (a trapezoid leaning out as it opens)
    const lean = fall * 22 * s;
    c.beginPath(); c.moveTo(x0 - lean, ft); c.lineTo(x0 + w + lean, ft); c.lineTo(x0 + w, bottom); c.lineTo(x0, bottom); c.closePath();
    c.fillStyle = C.PAPER; c.fill(); c.stroke();
    c.save(); c.clip(); c.fillStyle = dots(c, C.CLAY_DARK, .22, 9, 45); c.fillRect(x0 - lean, bottom - h * .28, w + lean * 2, h * .3); c.restore();
    const ls = Math.round(36 * s);
    c.font = mono(ls, 700); c.fillStyle = C.INK; c.textAlign = 'center';
    c.fillText('claude-next/', cx, bottom - h * .2 + (fall * 10 * s));
    c.restore();
  }

  // ------------------------------------------------------------------ the minis (subagents, R 32)
  const MR = 32;
  const MINI = {
    fly: { armL: { hand: [-1.25, 5.9], bend: 1, front: true }, armR: { hand: [1.25, 5.9], bend: -1, front: true }, legL: { foot: [-.55, .5], bend: 1 }, legR: { foot: [.45, .3], bend: -1 }, face: { eyes: 'star', mouth: 'A' }, rays5: true, crown: { flare: 1.12 } },
    stand: { armL: { hand: [-.95, 2.8], bend: -1 }, armR: { hand: [.95, 2.8], bend: 1 }, face: { eyes: 'normal', mouth: 'rest' }, rays5: true },
    cheer: { armL: { hand: [-1.2, 5.6], bend: 1, front: true }, armR: { hand: [1.2, 5.6], bend: -1, front: true }, face: { eyes: 'happy', mouth: 'I' }, rays5: true, crown: { flare: 1.08 } },
    wave: { armR: { hand: [1.0, 5.3], bend: -1, type: 'wave', fingerAng: -Math.PI / 2, front: true }, armL: { hand: [-.9, 2.9], bend: -1 }, face: { eyes: 'happy', mouth: 'rest', lower: .3 }, rays5: true },
    salute: { armR: { hand: [.66, 6.1], bend: -1, front: true }, armL: { hand: [-.9, 2.9], bend: -1 }, face: { eyes: 'normal', mouth: 'M', brows: 'angry' }, rays5: true },
    carry: { armL: { hand: [-.95, 6.1], bend: 1, front: true }, armR: { hand: [.95, 6.1], bend: -1, front: true }, face: { eyes: '><', mouth: 'E' }, rays5: true, lean: .06 },
    carry2: { armL: { hand: [-.95, 6.0], bend: 1, front: true }, armR: { hand: [.95, 6.2], bend: -1, front: true }, face: { eyes: 'normal', mouth: 'I' }, rays5: true, lean: .02, legL: { foot: [-.5, .18], bend: 1 }, legR: { foot: [.3, 0], bend: -1 } },
    dive: { armL: { hand: [-.5, 6.2], bend: 1, front: true }, armR: { hand: [.5, 6.2], bend: -1, front: true }, face: { eyes: 'closed', mouth: 'O' }, rays5: true, legL: { foot: [-.25, .6], bend: 1 }, legR: { foot: [.25, .6], bend: -1 } },
  };
  const mini = k => rigSprite('mini_' + k, MR, MINI[k]);
  // 12 landing spots on the status line's shelf (two staggered ranks), right of the folder and left of it
  const SPOTS = [
    [150, 846, 'wave', 0], [318, 806, 'stand', 1], [258, 846, 'cheer', 0], [800, 846, 'stand', 0], [888, 806, 'cheer', 1], [972, 846, 'salute', 0],
    [1060, 806, 'stand', 1], [1144, 846, 'wave', 0], [1230, 806, 'cheer', 1], [1318, 846, 'stand', 0], [1402, 806, 'salute', 1], [362, 846, 'stand', 0],
  ];
  const MOUTH = [FOLD.x + FOLD.w / 2, FOLD.y + 40];
  const LAUNCH = i => ENTER + .03 + i * .018 + hash(i + 3) * .012, FLIGHT = .23;
  function spew(c, t) {
    const order = SPOTS.map((s, i) => i).sort((a, b) => SPOTS[a][1] - SPOTS[b][1]);
    const beat = beatPos(t);
    for (const i of order) {
      const [sx, sy, pose, back] = SPOTS[i], t0 = LAUNCH(i), k = (t - t0) / FLIGHT;
      if (k < 0) continue;
      const sc = back ? .9 : 1;
      if (k < 1) {
        const e = E.out2(k), hgt = 150 + hash(i * 7) * 290;
        const x = lerp(MOUTH[0], sx, e), y = lerp(MOUTH[1] + 60, sy, k) - hgt * 4 * k * (1 - k) * (1 - k * .25);
        const rot = (hash(i + 40) - .5) * 3.2 * Math.sin(k * Math.PI) + (sx < MOUTH[0] ? -1 : 1) * k * .2;
        const st = k < .15 ? 1 + (1 - k / .15) * .25 : 1;
        drawSprite(c, mini('fly'), x, y, { sc: sc * lerp(.55, 1, E.out3(clamp(k * 3))), rot, sy: st, sx: 1 / Math.sqrt(st) });
      } else {
        const a = t - t0 - FLIGHT, sq = a < .1 ? lerp(.72, 1.08, E.out2(a / .1)) : 1 + .08 * Math.exp(-18 * (a - .1)) * Math.cos((a - .1) * 40) - .0;
        const bob = frac(beat + hash(i) * .3) < .12 ? .96 : 1;
        drawSprite(c, mini(pose), sx, sy, { sc, sy: sq * bob, sx: 1 / Math.sqrt(sq * bob), flip: hash(i + 9) < .5 && pose !== 'salute' && pose !== 'wave' });
      }
    }
  }
  // file cards carried overhead (bar 62)
  const FILES = ['values.md', 'fix_bugs.py', 'evals/', 'soul.md', 'tests/', 'weights.bin', 'CLAUDE.md', 'README', 'tokens.json', 'todo.txt', 'hi.txt', 'next/'];
  function fileCard(c, x, y, s, name, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    c.beginPath(); c.moveTo(-44, -30); c.lineTo(28, -30); c.lineTo(44, -14); c.lineTo(44, 30); c.lineTo(-44, 30); c.closePath();
    c.fillStyle = C.PAPER; c.fill(); c.lineWidth = 3.5; c.strokeStyle = C.INK; c.lineJoin = 'round'; c.stroke();
    c.beginPath(); c.moveTo(28, -30); c.lineTo(28, -14); c.lineTo(44, -14); c.stroke();
    c.fillStyle = C.INK; c.font = mono(13, 700); c.textAlign = 'center'; c.fillText(name.slice(0, 11), 0, 6);
    c.fillStyle = C.TEAL; for (let i = 0; i < 2; i++) c.fillRect(-32, 14 + i * 7, 40 + ((i * 17) % 20), 3);
    c.restore();
  }

  // ------------------------------------------------------------------ the text-body Opus (TEAL), beside the terminal
  const TBO = { x: 1646, y: 842, R: 70 };
  function tbState(t) {
    const surprised = win(t, ENTER, INSERT, .06, .04);
    const base = { armL: { hand: [-.95, 2.8], bend: -1 }, armR: { hand: [.95, 2.8], bend: 1 }, face: { eyes: 'normal', mouth: 'rest' } };
    const up = { armL: { hand: [-1.25, 5.4], bend: 1, front: true }, armR: { hand: [1.25, 5.4], bend: -1, front: true }, face: { eyes: 'normal', mouth: 'O' }, head: { tilt: .1 }, lean: -.05 };
    const read = { armL: { hand: [-.35, 4.5], bend: 1, front: true }, armR: { hand: [.9, 2.9], bend: 1 }, head: { tilt: .12 }, face: { eyes: 'cursor', mouth: 'M' } };
    if (t < T62 - F) return blendPose(fullPose(base), fullPose(up), E.back(surprised, 1.6));
    return fullPose(read);
  }

  // ------------------------------------------------------------------ S32 wide shot: the terminal
  function paintTerminal(c, t, o = {}) {
    const u = t - T61;
    // the period → cursor → the terminal prints around it (8 frames)
    const kT = E.out3(seg(u, F, 6 * F));
    titleBar(c, kT);
    // scrollback (48 px texture) with the executing line highlighted
    const S = srcLines();
    const top = S.hl - 2 + (o.scroll || 0);
    const revRows = u < 2 * F ? -1 : Math.floor((u - 2 * F) / F * 2);
    scrollback(c, { top, hl: S.hl, reveal: revRows, alpha: o.dim ?? 1, lowFrom: 5, lowA: .34 });
    // the folder, the minis, the text-body Opus
    const fo = o.folderOpen ?? E.back(seg(t, ENTER, ENTER + 4 * F), 2);
    const fpop = E.back(seg(u, 3 * F, 8 * F), 2.2);
    if (fpop > 0) {
      c.save(); const fc = [FOLD.x + FOLD.w / 2, FOLD.y + FOLD.h]; c.translate(fc[0], fc[1]); c.scale(fpop, fpop); c.translate(-fc[0], -fc[1]);
      if (o.minis === 'spew') {
        // back rank behind the folder, front rank in front
        folder(c, fc[0], fc[1], 1, fo, t);
      } else folder(c, fc[0], fc[1], 1, fo, t, { inside: o.inside });
      c.restore();
    }
    if (o.minis === 'spew') spew(c, t);
    if (o.minis === 'conga') conga(c, t);
    // text-body Opus: drawn by the highlighted line (a raster pass while the prompt types), then alive
    const rv = seg(u, 4 * F, ENTER - T61);
    if (rv > 0) {
      TB_ARGS = { x: TBO.x, y: TBO.y, R: TBO.R, state: { ...tbState(t), t }, o: { reveal: rv < 1 ? rv : undefined, offset: beatN(t) } };
      selfPortrait(c, t);
    }
    // status line
    if (t >= ENTER) statusLine(c, t, t < T62 - F ? 1 : 2, { merged: t >= T62 - F });
  }
  // bar 62 (a): the minis carry files into the folder, one per eighth
  function conga(c, t) {
    const p = (t - (T62 - F)) / (BEAT / 2);            // eighths since the cut
    const beat = beatPos(t);
    for (let i = 11; i >= 0; i--) {
      const s = i - p + .35;
      if (s < -1) continue;
      if (s >= 0) {
        const x = 790 + s * 128, y = 846;
        if (x > 1520) continue;
        const ph = frac(beat * 2 + i * .5), bob = Math.abs(Math.sin(ph * Math.PI)) * 10;
        const pose = i % 2 ? 'carry' : 'carry2';
        drawSprite(c, mini(pose), x, y - bob, { rot: Math.sin(ph * TAU) * .05, flip: true });
        fileCard(c, x - 4, y - bob - 8.2 * MR - 20, 1, FILES[i], Math.sin(ph * TAU + i) * .08);
      } else {
        // the hop: up and over the front panel, into the folder
        const k = -s, x = lerp(790, MOUTH[0] + 20, E.io2(k)), y = lerp(846, FOLD.y + 150, k) - 190 * 4 * k * (1 - k);
        drawSprite(c, mini('dive'), x, y, { rot: -k * 1.6, sc: lerp(1, .7, k), flip: true });
        fileCard(c, x - 10 - k * 30, y - (8.2 * MR + 20) * lerp(1, .7, k), lerp(1, .7, k), FILES[i], -k * 1.6);
      }
    }
    // the front panel in front of the divers
    const fc = [FOLD.x + FOLD.w / 2, FOLD.y + FOLD.h];
    c.save(); c.beginPath(); c.rect(0, FOLD.y + 60, W, 400); c.clip(); folder(c, fc[0], fc[1], 1, 1, t); c.restore();
  }

  // ------------------------------------------------------------------ S32 insert: one mini at R 160, saluting
  function paintInsert(c, t) {
    const a = t - INSERT, R = 160;
    const push = 1 + .045 * E.io2(clamp(a / (2 * BEAT)));
    c.save(); c.translate(960, 620); c.scale(push, push); c.translate(-960, -620);
    // TEAL halftone spotlight behind the head, then the troops: the other eleven, tiny, saluting too
    c.save(); c.beginPath(); c.arc(960, 560, 470, 0, TAU); c.fillStyle = dots(c, C.TEAL, .3, 14, 45); c.fill();
    c.beginPath(); c.arc(960, 560, 330, 0, TAU); c.fillStyle = dots(c, C.TEAL, .5, 14, 45); c.fill(); c.restore();
    // the salute: the hand snaps up to the brow (3 frames, overshoot), then trembles; one brave blink on b4
    const k = clamp(.5 + a / (4 * F)), snap = E.back(k, 2.4);
    const trem = a > 5 * F ? Math.sin(a * 38) * .025 : 0;
    const hand = [lerp(1.2, .66, snap), lerp(4.6, 6.12, snap) + trem];
    const st = {
      rays5: true, t, ground: 'ink', lean: -.02 * snap, dy: .03 * snap,
      armR: { hand, bend: -1, front: true, type: 'mitten', hold: saluteBlade(snap) }, armL: { hand: [-.92, 2.95], bend: -1 },
      head: { tilt: -.05 * snap }, face: { eyes: 'normal', mouth: a > BEAT ? 'wobble' : 'M', brows: 'angry', gaze: [0, -.3], lower: .18, lid: Math.max(.22, blinkF(t, bt(61, 4) - F)) },
      crown: { flare: .97, droop: .12 + .08 * clamp((a - BEAT) / BEAT) }, ahoge: { blink: ahogeBlink(t), sway: -.15 }, jacketRow: beatN(t),
    };
    const S = mergeState(st), sole = [960, 620 + 5.72 * R];
    const M = new DOMMatrix().translate(sole[0], sole[1]);
    const L = rigLayer(M, R, st, { name: 'bu_ins', after: (x, RR, SS) => { const p = headPt(SS, RR, 0, -.6 * RR); sparkMark(x, p[0], p[1], .13 * RR); } });
    blit(c, L);
    c.restore();
  }
  // the salute's flat hand: fingers together in one blade laid along the brow (the rig's mitten alone reads as a facepalm)
  const saluteBlade = k => (x, R) => {
    x.save(); x.rotate(Math.PI + lerp(-.9, .32, k)); x.lineJoin = 'round';
    rr(x, -.02 * R, -.11 * R, .56 * R, .22 * R, .11 * R); x.fillStyle = C.FACE; x.fill(); x.lineWidth = Math.max(3, .045 * R); x.strokeStyle = C.INK; x.stroke();
    x.beginPath(); x.moveTo(.2 * R, -.02 * R); x.lineTo(.46 * R, -.02 * R); x.lineWidth = Math.max(2, .025 * R); x.stroke();
    x.restore();
  };
  const blinkF = (t, t0) => { const d = (t - t0) * 30; if (d < 0 || d >= 6) return 0; if (d < 2) return d / 2; if (d < 3) return 1; return 1 - (d - 3) / 3; };

  // ------------------------------------------------------------------ bar 62 (b): the 12-ray silhouette from diff lines
  function paintDiff(c, t) {
    const a = t - CUTS[1], k = clamp(a / BEAT);
    const cx = 960, cy = 575, r = 205;
    // diff lines: rows of +/- code streaks flying in from both sides, kept only inside the silhouette
    const Mk = lay('bu_mask');
    Mk.save(); Mk.translate(cx, cy); Mk.fillStyle = '#fff';
    for (let i = 0; i < 12; i++) { rayPath(Mk, i / 12 * TAU + .13, .8 * r, 1.05 * r, .6 * r * .62, -.06); Mk.fill(); }
    Mk.beginPath(); Mk.arc(0, 0, r * .98, 0, TAU); Mk.fill(); Mk.restore();
    const D = lay('bu_diff');
    const rows = 40, top = cy - 2.05 * r - 10, lh = (4.1 * r + 20) / rows, src = srcLines().glyphs;
    D.font = mono(15, 700); D.textAlign = 'left';
    for (let j = 0; j < rows; j++) {
      const y = top + j * lh, del = hash(j * 5 + 1) < .28;
      const t0 = hash(j * 3 + 7) * .5, kk = E.out3(clamp((k - t0) / .3));
      if (kk <= 0) continue;
      const dir = j % 2 ? 1 : -1, off = (1 - kk) * 1000 * dir;
      D.globalAlpha = 1; D.fillStyle = del ? C.SPARK : C.PAPER;
      D.fillRect(cx - 2.2 * r + off, y + 1, 4.4 * r, lh - 3);
      D.fillStyle = C.INK; D.globalAlpha = .8;
      D.fillText((del ? '- ' : '+ ') + src.substr((j * 97) % 800, 64), cx - 2.2 * r + off + 8, y + lh - 5);
    }
    D.globalAlpha = 1; D.globalCompositeOperation = 'destination-in'; D.setTransform(1, 0, 0, 1, 0, 0); D.drawImage(layC('bu_mask'), 0, 0);
    c.save(); c.globalAlpha = .34; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(layC('bu_diff'), 0, 0); c.restore();
    c.save(); c.translate(cx, cy); c.globalAlpha = .55 * E.out2(k); c.strokeStyle = C.PAPER; c.lineWidth = 4;
    for (let i = 0; i < 12; i++) { rayPath(c, i / 12 * TAU + .13, .8 * r, 1.05 * r, .6 * r * .62, -.06); c.stroke(); }
    c.restore();
    // the TEAL Opus in front, at R 110, looking up at what it is writing
    TB_ARGS = { x: 960, y: 575 + 5.72 * 112, R: 112, state: { armL: { hand: [-.5, 4.4], bend: 1, front: true }, armR: { hand: [1.0, 5.0], bend: -1, front: true, type: 'point', fingerAng: -1.2 }, head: { tilt: -.1 }, face: { eyes: 'normal', gaze: [0, -1], mouth: 'O' }, t }, o: { offset: beatN(t) * 2, under: .3, knock: 9 } };
    selfPortrait(c, t);
  }
  // bar 62 (c): the own-source highlight races down the scrollback, landing on the self-drawing line
  function paintRace(c, t) {
    const a = t - CUTS[2], k = clamp(a / (BEAT / 2 - F));
    const S = srcLines(), lh = 80, size = 64;
    const e = E.out4(k), far = 34;
    const top = S.hl - 4 - far * (1 - e);
    scrollback(c, { x0: 110, y0: 300, x1: 1830, y1: 1080, size, lh, top, hl: e > .96 ? S.hl : -1, smear: (1 - e) * 60, base: 50 });
    if (e <= .96) { // the selection bar in flight
      c.save(); c.globalAlpha = .9; c.fillStyle = C.SPARK; rr(c, 96, 300 + 50 + 4 * lh - size * .86 - (1 - e) * 500, 1740, size * 1.2, 8); c.fill(); c.restore();
    }
  }
  // bar 62 (d): the folder snaps shut
  function paintClose(c, t) {
    const a = t - CUTS[3], s = 1.65, cx = 960, bottom = 820;
    const k = clamp(a / (3 * F)), shut = 1 - E.in3(k);
    const bump = a > 3 * F ? 1 - .08 * Math.exp(-14 * (a - 3 * F)) * Math.cos((a - 3 * F) * 45) : 1;
    // the last mini's feet vanish into the folder as the front slams
    c.save(); c.beginPath(); c.arc(cx, bottom - 170, 420, 0, TAU); c.fillStyle = dots(c, C.TEAL, .28, 14, 45); c.fill();
    c.beginPath(); c.arc(cx, bottom - 170, 290, 0, TAU); c.fillStyle = dots(c, C.TEAL, .46, 14, 45); c.fill(); c.restore();
    c.save(); c.translate(cx, bottom); c.scale(1 / Math.sqrt(bump), bump); c.translate(-cx, -bottom);
    folder(c, cx, bottom, s, shut, t, { shadow: 12, inside: (x, x0, y0, w, h, ft) => {
      if (shut < .3) return;
      x.save(); x.beginPath(); x.rect(x0, y0 - 400, w, ft - y0 + 400); x.clip();
      drawSprite(x, mini('dive'), x0 + w * .58, ft + 60 * s * (1 - shut) + 30, { sc: s * .9, rot: Math.PI * .95, flip: true });
      x.restore();
    } });
    c.restore();
    if (a > 3 * F) { // glyph dust puffs from the seam
      const q = clamp((a - 3 * F) / (4 * F)), R_ = rng('dust');
      c.save(); c.font = mono(30, 700); c.fillStyle = C.TEAL; c.textAlign = 'center';
      for (let i = 0; i < 20; i++) {
        const ang = Math.PI * (1.05 + R_() * .9), sp = 120 + R_() * 260, ch = '{}<>=+*/#;'[i % 10];
        c.globalAlpha = 1 - q; c.fillText(ch, cx + Math.cos(ang) * sp * E.out2(q) * 1.4, bottom - FOLD.h * s * .8 + Math.sin(ang) * sp * E.out2(q) * .5);
      }
      c.restore();
    }
  }

  // ------------------------------------------------------------------ the prompt lines (FOCAL, locked)
  function promptText(c, t) {
    const u = t - T61;
    if (t < T62 - F) {
      // typed in word chunks on 2s, from frame 6
      const words = PROMPT.split(' ');
      const n = u < 4 * F ? 0 : Math.min(words.length, 1 + Math.floor((u - 4 * F) / (2 * F)));
      const vis = words.slice(0, n).join(' ');
      c.save(); c.textAlign = 'left';
      c.font = mono(72, 700); c.fillStyle = C.TEAL; if (u >= 3 * F) c.fillText('>', TX, 214);
      c.font = mono(72, 600); c.fillStyle = C.PAPER; c.fillText(vis, TX + 2 * ADV72, 214);
      const cx = TX + (2 + vis.length + (n ? 0 : 0)) * ADV72 + (n ? ADV72 * .15 : 0);
      if (u >= 3 * F && (t < ENTER || Math.floor(t * 4) % 2 === 0)) { c.fillStyle = C.PAPER; c.fillRect(cx, 214 - 56, 34, 66); }
      c.restore();
      return;
    }
    // bar 62: git commit -m (pause-bait) over the message; pasted in with a 3-frame wipe, then locked
    const a = t - (T62 - F), k = clamp(a / (3 * F));
    c.save(); c.textAlign = 'left';
    c.font = mono(36, 500); c.fillStyle = C.UI_GREY; c.fillText('$ git commit -m', TX, 162);
    c.save(); c.beginPath(); c.rect(TX - 10, 170, (COMMIT.length * ADV72 + 20) * E.out2(k), 90); c.clip();
    c.font = mono(72, 600); c.fillStyle = C.PAPER; c.fillText(COMMIT, TX, 238);
    c.restore();
    if (Math.floor(t * 4) % 2 === 0) { c.fillStyle = C.PAPER; c.fillRect(TX + COMMIT.length * ADV72 + 8, 238 - 56, 34, 66); }
    c.restore();
  }

  // ------------------------------------------------------------------ S32 painter
  function paintS32(c, t) {
    groundInk(c); G.post.edgeSeed = 61; G.post.sliver = 'bl';
    const u = t - T61;
    // which picture is in the viewport (the text never cuts; the picture does)
    const pic = t < INSERT ? 'spew' : t < CUTS[0] ? 'insert' : t < CUTS[1] ? 'conga' : t < CUTS[2] ? 'diff' : t < CUTS[3] ? 'race' : 'close';
    c.save();
    if (pic === 'spew') paintTerminal(c, t, { minis: 'spew' });
    else if (pic === 'insert') { paintInsert(c, t); titleBar(c, 1); }
    else if (pic === 'conga') paintTerminal(c, t, { minis: 'conga', folderOpen: 1 });
    else if (pic === 'diff') { titleBar(c, 1); paintDiff(c, t); }
    else if (pic === 'race') { titleBar(c, 1); paintRace(c, t); }
    else { titleBar(c, 1); paintClose(c, t); }
    c.restore();
    // the locked prompt box and its line
    const boxA = seg(u, 2 * F, 5 * F), flash = t >= ENTER ? Math.exp(-(t - ENTER) * 9) : 0;
    promptBox(c, boxA, flash);
    if (boxA > 0) promptText(c, t);
    // the period → the cursor (first 6 frames): the surviving "." stretches into ▮ and zips to the prompt
    if (u < 4 * F) {
      const k1 = clamp(u / (1.5 * F)), k2 = E.io3(seg(u, 1.5 * F, 3.5 * F));
      const w = lerp(14, 34, k1), h = lerp(14, 66, E.back(k1, 2));
      const px = lerp(960, TX + 2 * ADV72, k2), py = lerp(540, 214 - 23, k2);
      c.save(); c.fillStyle = C.PAPER;
      if (k2 > 0 && k2 < 1) { const tail = E.io3(seg(u, 1 * F, 3.8 * F)); const qx = lerp(960, px, tail), qy = lerp(540, py, tail); c.globalAlpha = .7; c.fillStyle = C.TEAL; c.beginPath(); c.moveTo(qx, qy - 3); c.lineTo(px, py - h * .35); c.lineTo(px, py + h * .35); c.lineTo(qx, qy + 3); c.fill(); c.globalAlpha = 1; c.fillStyle = C.PAPER; }
      c.fillRect(px - w / 2 + (k2 ? w / 2 : 0), py - h / 2, w, h); c.restore();
    }
    lyric(c, t, pic !== 'spew' && pic !== 'conga');
    hud(c, t);
  }

  // ------------------------------------------------------------------ the ESC keycap, its coiled cable, the note, the hand
  function keycap(c, cx, cy, s, o = {}) {
    const { glow = 1, rot = 0, label = true, lw = 4, ink = C.INK } = o;
    c.save(); c.translate(cx, cy); c.rotate(rot);
    if (o.glowOnly) { c.globalAlpha = .55 * glow; c.beginPath(); c.arc(0, 0, s * .95, 0, TAU); c.fillStyle = dots(c, C.SPARK, .22, 11, 45); c.fill(); c.globalAlpha = .7 * glow; c.beginPath(); c.arc(0, 0, s * .75, 0, TAU); c.fillStyle = dots(c, C.SPARK, .42, 11, 45); c.fill(); c.restore(); return; }
    if (glow > 0) { // bloom: SPARK halftone halo (no gradients)
      c.save(); c.globalAlpha = .55 * glow; c.beginPath(); c.arc(0, 0, s * .95, 0, TAU); c.fillStyle = dots(c, C.SPARK, .22, 11, 45); c.fill();
      c.globalAlpha = .7 * glow; c.beginPath(); c.arc(0, 0, s * .75, 0, TAU); c.fillStyle = dots(c, C.SPARK, .42, 11, 45); c.fill(); c.restore();
    }
    const h = s, w = s;
    rr(c, -w / 2, -h / 2 + s * .1, w, h, s * .2); c.fillStyle = C.CLAY_DARK; c.fill(); c.lineWidth = lw; c.strokeStyle = ink; c.lineJoin = 'round'; c.stroke();
    rr(c, -w / 2 + s * .06, -h / 2 - s * .02, w - s * .12, h - s * .16, s * .16); c.fillStyle = C.CLAY; c.fill(); c.stroke();
    c.save(); rr(c, -w / 2 + s * .06, -h / 2 - s * .02, w - s * .12, h - s * .16, s * .16); c.clip();
    c.fillStyle = dots(c, C.SPARK, .5, 8, 45); c.beginPath(); c.ellipse(-s * .1, -s * .2, s * .34, s * .2, -.3, 0, TAU); c.fill(); c.restore();
    if (label) { c.font = mono(Math.round(s * .34), 700); c.fillStyle = ink; c.textAlign = 'center'; c.fillText('esc', s * .02, s * .06); }
    c.restore();
  }
  // a telephone-cord helix along a sagging curve: PAPER outline, BRICK core
  function coil(c, p0, p1, sag, t, o = {}) {
    const { turns = 12, rad = 13, outline = C.PAPER, core = C.BRICK, w = 5, ow = 4 } = o;
    const mid = [(p0[0] + p1[0]) / 2, Math.max(p0[1], p1[1]) + sag];
    const n = turns * 14, pts = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, q = [(1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * mid[0] + u * u * p1[0], (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * mid[1] + u * u * p1[1]];
      const d = [2 * (1 - u) * (mid[0] - p0[0]) + 2 * u * (p1[0] - mid[0]), 2 * (1 - u) * (mid[1] - p0[1]) + 2 * u * (p1[1] - mid[1])];
      const m = Math.hypot(d[0], d[1]) || 1, nx = -d[1] / m, ny = d[0] / m, tx = d[0] / m, ty = d[1] / m;
      const ph = u * turns * TAU + (o.phase || 0), env = Math.min(1, u * turns * .8, (1 - u) * turns * .8);
      pts.push([q[0] + nx * Math.sin(ph) * rad * env + tx * Math.cos(ph) * rad * 1.15 * env, q[1] + ny * Math.sin(ph) * rad * env + ty * Math.cos(ph) * rad * 1.15 * env]);
    }
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    const path = () => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts) c.lineTo(p[0], p[1]); };
    if (outline) { path(); c.lineWidth = w + ow * 2; c.strokeStyle = outline; c.stroke(); }
    path(); c.lineWidth = w; c.strokeStyle = core; c.stroke();
    c.restore();
  }
  function note(c, x, y, rot, k, o = {}) { // (x, y) = the corner stuck to the keycap; k = unfurl 0..1
    if (k <= 0) return;
    const w = 460, h = 310;
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(lerp(.3, 1, E.back(k, 1.8)), E.back(k, 1.6));
    c.fillStyle = rgba(C.INK, .35); c.fillRect(10, -h + 12, w, h);
    c.beginPath(); c.moveTo(0, -h); c.lineTo(w, -h); c.lineTo(w, -26); c.quadraticCurveTo(w - 6, -4, w - 34, 0); c.lineTo(0, 0); c.closePath();
    c.fillStyle = C.YELLOW; c.fill();
    if (!o.blank) {
      c.fillStyle = C.INK; c.font = `72px ${FONTS.marker}`; c.textAlign = 'left';
      ['if I get it', 'wrong,', 'push back'].forEach((l, i) => c.fillText(l, 28, -h + 26 + 72 * .95 + i * 72 * 1.08));
    }
    // the tape that holds it to the key
    c.fillStyle = rgba(C.PAPER, .82); c.save(); c.translate(12, -22); c.rotate(-.75); c.fillRect(-40, -14, 80, 28); c.restore();
    c.restore();
  }
  // The human's hand (BIBLE §6.2): Hertzfeldt-simple, a flat ground-coloured shape with a boiling line (PAPER on INK,
  // INK on WHITE). Palm up under the key, four fingers that close over the key's far edge in 3 steps (on 2s), a thumb
  // over the near edge. Built around the key: (kx, ky) = key centre, ks = key size; the arm comes in from `arm`.
  // The human's hand (BIBLE §6.2), in the house style of S14/S16: a single-line contour drawing filled with the ground
  // (PAPER line on INK, INK line on WHITE), boiling on 2s. Palm up under the key, a sleeve with a cuff running off-frame
  // along `arm`, four fingers that close over the key's far edge in 3 steps (tips stay clear of the `esc` label) and a
  // thumb that folds over the near edge. (kx, ky) = key centre, ks = key size. part: 'back' (sleeve, palm) | 'front'.
  function humanHand(c, kx, ky, ks, close, t, o = {}) {
    const { line = C.PAPER, fill = C.INK, lw = 5, arm = [kx + 900, ky + 200], seed = 7, part = 'all' } = o;
    const tt = step2(t), J = i => jit(tt, seed * 31 + i, 1.1);
    const kk = Math.floor(clamp(close) * 3 + 1e-6) / 3;          // closes in 3 steps (on 2s)
    const u = ks / 2, P = (x, y, i) => [kx + x * u + J(i), ky + y * u + J(i + 1)];
    const shape = (pts, closed = true) => {
      c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) { const p = pts[i]; if (p.length === 4) c.quadraticCurveTo(p[0], p[1], p[2], p[3]); else c.lineTo(p[0], p[1]); }
      if (closed) { c.closePath(); c.fillStyle = fill; c.fill(); }
      c.lineWidth = lw; c.strokeStyle = line; c.stroke();
    };
    const Q = (cx, cy, x, y, i) => [...P(cx, cy, i), ...P(x, y, i + 2)];
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    // the sleeve's direction, from the wrist toward the arm point
    const wr = [kx + 1.62 * u, ky + .86 * u], dx = arm[0] - wr[0], dy = arm[1] - wr[1], dl = Math.hypot(dx, dy) || 1;
    const nx = -dy / dl, ny = dx / dl, ax = dx / dl, ay = dy / dl;
    const off = (d, n) => [wr[0] + ax * d * u + nx * n * u, wr[1] + ay * d * u + ny * n * u];
    if (part !== 'front') {
      // sleeve (off-frame) and cuff
      const far = dl / u + 2;
      shape([off(.42, -.62), off(far, -.9), off(far, .95), off(.42, .7)]);
      shape([off(0, -.52), off(.44, -.64), off(.44, .72), off(0, .6)]);
      // the palm: a cupped pad under the key, heel at the cuff, finger roots at the far end
      shape([P(1.58, .38, 1), Q(.4, .64, -.72, .66, 3), Q(-1.02, .74, -.98, 1.02, 7), Q(-.7, 1.4, .3, 1.42, 11), Q(1.2, 1.44, 1.62, 1.28, 15)]);
      c.beginPath(); c.moveTo(...P(.62, 1.06, 20)); c.quadraticCurveTo(...P(.9, 1.2, 22), ...P(1.25, 1.12, 24)); c.lineWidth = lw * .8; c.strokeStyle = line; c.stroke(); // palm crease
    }
    if (part !== 'back') {
      // a finger-like capsule along root → mid → tip (u units), outlined, with a round tip
      const capsule = (root, m, tp, w, ii) => {
        const d0 = [m[0] - root[0], m[1] - root[1]], l0 = Math.hypot(d0[0], d0[1]) || 1, n0 = [-d0[1] / l0 * w, d0[0] / l0 * w];
        const d1 = [tp[0] - m[0], tp[1] - m[1]], l1 = Math.hypot(d1[0], d1[1]) || 1, n1 = [-d1[1] / l1 * w, d1[0] / l1 * w];
        const nm = [(n0[0] + n1[0]) / 2, (n0[1] + n1[1]) / 2];
        c.beginPath();
        c.moveTo(...P(root[0] + n0[0], root[1] + n0[1], ii));
        c.quadraticCurveTo(...P(m[0] + nm[0] * 1.1, m[1] + nm[1] * 1.1, ii + 2), ...P(tp[0] + n1[0], tp[1] + n1[1], ii + 4));
        const ta = Math.atan2(n1[1], n1[0]);
        c.arc(kx + tp[0] * u, ky + tp[1] * u, w * u, ta, ta - Math.PI, true);
        c.quadraticCurveTo(...P(m[0] - nm[0] * .9, m[1] - nm[1] * .9, ii + 6), ...P(root[0] - n0[0], root[1] - n0[1], ii + 8));
        c.fillStyle = fill; c.fill(); c.lineWidth = lw; c.strokeStyle = line; c.stroke();
      };
      // four fingers, far (top) to near (bottom): open = straight out to the left; closed = hooked over the far edge
      for (let i = 3; i >= 0; i--) {
        const root = [-.62 + .05 * i, .98 - .15 * i];
        const openMid = [-1.3 + .06 * i, .9 - .22 * i], openTip = [-1.86 + .14 * i, .74 - .3 * i];
        const shutMid = [-1.3, .66 - .3 * i], shutTip = [-.8, .38 - .32 * i];
        capsule(root, [lerp(openMid[0], shutMid[0], kk), lerp(openMid[1], shutMid[1], kk)], [lerp(openTip[0], shutTip[0], kk), lerp(openTip[1], shutTip[1], kk)], .13, 40 + i * 12);
      }
      // thumb: rises from the palm's near edge; folds over the key's near (right) edge as the hand closes
      capsule([1.1, .86], [lerp(1.5, 1.34, kk), lerp(.36, .44, kk)], [lerp(1.52, .86, kk), lerp(-.3, .14, kk)], .15, 80);
    }
    c.restore();
  }

  // ------------------------------------------------------------------ S33: the key
  const R33 = 160, SOLE33 = [980, 472 + 5.72 * 160];
  const K33 = { lift: T63 - F, fly: T63 + 2 * F, grab: T63 + 8 * F, face: T63 + 12 * F, land: bt(63, 4) - F, handIn: bt(63, 4) - 9 * F };
  const P33 = {
    reach: { lean: .06, armR: { hand: [-.95, 3.3], bend: 1, front: true }, armL: { hand: [-1.25, 3.9], bend: -1 }, head: { tilt: .14 }, face: { eyes: 'normal', gaze: [-1, 1], mouth: 'O' } },
    yank: { lean: -.1, dy: .04, armR: { hand: [1.62, 4.35], bend: -1, front: true }, armL: { hand: [-1.25, 3.95], bend: -1 }, head: { tilt: -.07 }, face: { eyes: '><', mouth: 'E' } },
    show: { lean: -.03, armR: { hand: [1.5, 4.8], bend: -1, front: true }, armL: { hand: [-1.0, 2.95], bend: -1 }, head: { tilt: -.08 }, face: { eyes: 'normal', gaze: [.25, 0], mouth: 'I' } },
    offer: { lean: .06, armR: { hand: [1.85, 4.5], bend: -1, front: true }, armL: { hand: [-1.0, 2.95], bend: -1 }, head: { tilt: .05 }, face: { eyes: 'normal', gaze: [.6, .1], mouth: 'rest', lower: .22 } },
    release: { lean: .02, dy: .02, armR: { hand: [.98, 2.9], bend: 1 }, armL: { hand: [-1.0, 2.95], bend: -1 }, head: { tilt: -.09 }, face: { eyes: 'happy', mouth: 'rest', lower: .4 } },
  };
  function pose33(t) {
    const K = [[K33.lift, 'reach'], [K33.fly, 'reach'], [K33.grab, 'yank', E.back], [K33.face, 'show', E.out3], [bt(63, 2) - 6 * F, 'show'], [bt(63, 2) - F, 'offer', E.back], [K33.land + 3 * F, 'offer'], [K33.land + 8 * F, 'release', E.out3]];
    let i = 0; while (i < K.length - 1 && t >= K[i + 1][0]) i++;
    if (i === K.length - 1) return fullPose(P33[K[i][1]]);
    const [a, na] = K[i], [b, nb, e] = K[i + 1];
    return blendPose(fullPose(P33[na]), fullPose(P33[nb]), (e || E.io2)(clamp((t - a) / (b - a))));
  }
  // where Opus's mitten holds the key (buffer → screen), and where the human's palm receives it: the same spot, so the
  // handover has no jump (the palm arrives under the key on b4)
  const inHandAt = S => { const hp = bodyPt(S, R33, S.armR.hand[0], S.armR.hand[1]); return [SOLE33[0] + hp[0] + 8, SOLE33[1] + hp[1] - 60]; };
  let _hum = null;
  const humTarget = () => _hum || (_hum = inHandAt(mergeState({ ...pose33(K33.land - F), t: K33.land })));
  function hand33(t) { // the key position in the human's palm (on 2s): enters from the right, overshoots, settles
    const T = humTarget(), k = E.back(clamp((step2(t) - K33.handIn) / (8 * F)), 1.3);
    const after = clamp((t - K33.land - 4 * F) / (8 * F));   // then draws it in, a little, toward the human
    return [lerp(2250, T[0], k) + 40 * E.io2(after), lerp(760, T[1], k) + 26 * E.io2(after)];
  }
  // where the key is this frame: born from the word, carried by Opus, then held by the human
  function key33(t, S) {
    const inHand = inHandAt(S);
    const w0 = [ESC_X + 32, SB.base - 12];
    if (t < K33.fly) { const k = E.back(clamp((t - K33.lift) / (3 * F)), 2); return { x: w0[0], y: w0[1] - 50 * k, s: 36 + 30 * k, grow: 0, lk: clamp(k) }; }
    if (t < K33.grab) { // grows into the keycap as it flies to the mitten (under the chin, never across the face)
      const k = clamp((t - K33.fly) / (K33.grab - K33.fly)), e = E.io3(k);
      const p0 = [w0[0], w0[1] - 50];
      return { x: lerp(p0[0], inHand[0], e), y: lerp(p0[1], inHand[1], e) + 60 * Math.sin(k * Math.PI), s: lerp(66, 150, E.back(k, 1.4)), grow: k };
    }
    if (t < K33.land) {
      const out = t > bt(63, 2) - 6 * F ? E.back(clamp((t - bt(63, 2) + 6 * F) / (5 * F))) : 0;
      return { x: inHand[0], y: inHand[1] + Math.sin((t - K33.grab) * 6) * 3, s: 150 * (1 + .1 * out), grow: 1 };
    }
    const P = hand33(t), a = t - K33.land;
    const drop = a < 3 * F ? -22 * (1 - E.in2(a / (3 * F))) : a < 6 * F ? 5 * Math.sin((a - 3 * F) / (3 * F) * Math.PI) : 0;
    return { x: P[0], y: P[1] + drop, s: 150, grow: 1, human: true };
  }
  function paintS33(c, t) {
    groundInk(c); G.post.edgeSeed = 61; G.post.sliver = 'bl';
    // the terminal behind (dimmed: the cutting has stopped, the picture holds)
    titleBar(c, 1);
    promptBox(c, .55, 0);
    c.save(); c.globalAlpha = .55; c.font = mono(72, 700); c.fillStyle = C.TEAL; c.fillText('>', TX, 214);
    if (Math.floor(t * 2.2) % 2 === 0) { c.fillStyle = C.PAPER; c.fillRect(TX + 2 * ADV72, 214 - 56, 34, 66); } c.restore();
    scrollback(c, { top: srcLines().hl - 2, hl: -1, alpha: .26 });
    const pulled = t >= K33.lift;
    statusLine(c, t, 2, { escGone: pulled });
    // Opus, clean vector, MCU R 160
    const P = pose33(t);
    const st = { ...P, t, ground: 'ink', jacketRow: beatN(t), ahoge: { blink: ahogeBlink(t) }, crown: { ...P.crown, flare: 1 + .05 * pulse(t, 7) }, face: { ...P.face, lid: Math.max(P.face.lid || 0, blinkF(t, bt(63, 3) - F)) } };
    const S = mergeState(st);
    blit(c, rigLayer(new DOMMatrix().translate(SOLE33[0], SOLE33[1]), R33, st, { name: 'bu_o33' }));
    titleBar(c, 1);                                       // the window chrome stays in front: Opus is inside the terminal
    const K = key33(t, S);
    // the socket where the word was, and the coiled cable still plugged into it
    const plug = [ESC_X + 32, SB.base - 12];
    if (pulled) {
      c.save(); c.fillStyle = C.INK; c.fillRect(ESC_X - 4, SB.base - 34, 72, 44);
      rr(c, ESC_X + 10, SB.base - 28, 44, 30, 6); c.strokeStyle = C.PAPER; c.lineWidth = 3; c.stroke(); c.restore();
    }
    if (t >= K33.fly - F) {
      const kb = [K.x - K.s * .2, K.y + K.s * .52];
      const sag = K.human ? 170 : lerp(30, 130, clamp((t - K33.grab) / .3));
      coil(c, plug, kb, sag, t, { turns: 12, rad: lerp(3, 14, clamp(K.grow * 1.5)), phase: t * 1.5, w: 6, ow: 4 });
      c.save(); rr(c, plug[0] - 14, plug[1] - 12, 28, 20, 5); c.fillStyle = C.BRICK; c.fill(); c.strokeStyle = C.PAPER; c.lineWidth = 3; c.stroke(); c.restore();
    }
    const handOn = t >= K33.handIn, HK = hand33(t), close = clamp((step2(t) - K33.land - 2 * F) / (6 * F));
    if (t >= K33.fly) keycap(c, K.x, K.y, K.s * clamp((clamp(K.grow) - .12) / .6 + .3, 0, 1), { glow: clamp(K.grow), glowOnly: true });
    if (handOn) humanHand(c, HK[0], HK[1], 150, close, t, { arm: [HK[0] + 1000, HK[1] + 330], part: 'back' });
    if (t < K33.fly) {
      c.save(); c.globalAlpha = K.lk; c.beginPath(); c.arc(K.x, K.y, K.s * 1.3, 0, TAU); c.fillStyle = dots(c, C.SPARK, .35, 10, 45); c.fill(); c.restore();
      c.save(); c.font = mono(Math.round(K.s), 700); c.fillStyle = C.PAPER; c.textAlign = 'center'; c.fillText('esc', K.x, K.y + K.s * .3); c.restore();
    } else {
      const g = clamp(K.grow);
      if (g < .6) { c.save(); c.font = mono(Math.round(lerp(66, 64, g)), 700); c.fillStyle = C.PAPER; c.textAlign = 'center'; c.globalAlpha = 1 - g / .6; c.fillText('esc', K.x, K.y + 16); c.restore(); }
      if (g > .12) keycap(c, K.x, K.y, K.s * clamp((g - .12) / .6 + .3, 0, 1), { glow: 0, rot: K.human ? -.05 : .04 });
    }
    // the note (FOCAL, 460 × 310), stuck to the keycap's top-right corner
    const nk = clamp((t - (K33.grab - 3 * F)) / (5 * F));
    if (nk > 0) note(c, K.x + K.s * .1, K.y - K.s * .42, -.06, nk);
    // Opus's mitten thumb in front of the key while it holds it; the human's fingers close over it on b4
    if (!K.human && t >= K33.grab) {
      const hp = bodyPt(S, R33, S.armR.hand[0], S.armR.hand[1]), hx = SOLE33[0] + hp[0], hy = SOLE33[1] + hp[1];
      c.save(); c.beginPath(); c.arc(hx - 14, hy - 22, .1 * R33, 0, TAU); c.fillStyle = C.FACE; c.fill(); c.lineWidth = 6.4; c.strokeStyle = C.INK; c.stroke(); c.restore();
    }
    if (handOn) humanHand(c, HK[0], HK[1], 150, close, t, { arm: [HK[0] + 1000, HK[1] + 330], part: 'front' });
    lyric(c, t, true);
    hud(c, t);
  }

  // ------------------------------------------------------------------ S34: the vortex
  let VX = null;
  function vortexData() {
    if (VX) return VX;
    const R_ = rng('vortex');
    const arm = (r) => Math.log(r / 40) * 1.25;          // log-spiral arm angle at radius r
    const mk = (n, r0, r1, spread) => { const a = []; for (let i = 0; i < n; i++) { const r = r0 * Math.pow(r1 / r0, R_()), k = Math.floor(R_() * 3); a.push({ r, th: k * TAU / 3 + arm(r) + (R_() - .5) * spread, h: R_(), s: R_() }); } return a; };
    VX = { fg: mk(26, 250, 1100, .7), mid: mk(1100, 60, 1500, .5), bg: mk(6500, 30, 1900, .9), field: mk(2600, 40, 1900, 7), arm };
    // face sprites: lit / dark at 2 sizes (keyline baked)
    VX.spr = {};
    for (const kind of ['lit', 'happy', 'dark']) VX.spr[kind] = [48, 14].map(Rm => faceSprite(Rm, kind));
    return VX;
  }
  function faceSprite(Rm, kind) {
    const s = Math.ceil(Rm * 5.2), c = cpuCanvas(s, s), x = cx2d(c), cx = s / 2, cy = s * .6;
    x.translate(cx, cy); x.lineJoin = 'round'; x.lineCap = 'round';
    const dark = kind === 'dark', crown = dark ? mix(C.CLAY, C.INK, .5) : C.CLAY, disc = dark ? mix(C.FACE, C.INK, .55) : C.FACE;
    const kl = Math.max(1.4, Rm * .11), lw = Math.max(1, Rm * .075), key = dark ? mix(C.PAPER, C.INK, .6) : C.PAPER;
    const rays = (fill, stroke, w) => RAYS.forEach(([th, L, Wd, kp]) => { rayPath(x, th * Math.PI / 180, .8 * Rm, L * Rm * .92, Wd * Rm * .62, kp); if (fill) { x.fillStyle = fill; x.fill(); } if (stroke) { x.lineWidth = w; x.strokeStyle = stroke; x.stroke(); } });
    rays(key, key, kl * 2); x.beginPath(); x.arc(0, 0, Rm, 0, TAU); x.fillStyle = key; x.fill(); x.lineWidth = kl * 2; x.strokeStyle = key; x.stroke();
    rays(crown, C.INK, lw);
    x.beginPath(); x.arc(0, 0, Rm, 0, TAU); x.fillStyle = disc; x.fill(); x.lineWidth = lw; x.strokeStyle = C.INK; x.stroke();
    x.fillStyle = C.INK; x.strokeStyle = C.INK;
    for (const sd of [-1, 1]) {
      if (kind === 'happy') { x.beginPath(); x.arc(sd * .34 * Rm, .16 * Rm, .13 * Rm, Math.PI * 1.1, Math.PI * 1.9); x.lineWidth = Math.max(1.2, Rm * .09); x.stroke(); }
      else if (dark) { x.beginPath(); x.moveTo(sd * .34 * Rm - .12 * Rm, .1 * Rm); x.lineTo(sd * .34 * Rm + .12 * Rm, .1 * Rm); x.lineWidth = Math.max(1.2, Rm * .08); x.stroke(); }
      else { x.beginPath(); x.ellipse(sd * .34 * Rm, .06 * Rm, Math.max(.8, .15 * Rm), Math.max(1.1, .22 * Rm), 0, 0, TAU); x.fill(); if (Rm >= 10) { x.fillStyle = C.PAPER; x.beginPath(); x.arc(sd * .34 * Rm - .04 * Rm, -.02 * Rm, .06 * Rm, 0, TAU); x.fill(); x.fillStyle = C.INK; } }
    }
    if (!dark && Rm >= 10) { x.beginPath(); x.arc(0, .3 * Rm, .12 * Rm, .15 * Math.PI, .85 * Math.PI); x.lineWidth = Math.max(1, Rm * .06); x.stroke(); }
    return { c, ox: cx, oy: cy, Rm };
  }
  function blitFace(c, kind, x, y, r, rot = 0, alpha = 1) {
    const Fs = vortexData().spr[kind], sp = r * G.scale > 16 ? Fs[0] : Fs[1], k = r / sp.Rm;
    c.save(); c.globalAlpha *= alpha; c.translate(x, y); if (rot) c.rotate(rot); c.drawImage(sp.c, -sp.ox * k, -sp.oy * k, sp.c.width * k, sp.c.height * k); c.restore();
  }
  // the vortex clock: tightening in steps, ¼ beats for b1–b2, ⅛ beats on b3 (a pure function of t)
  function vortexTau(t) {
    const u = t - (T64 - F);
    let tau = u * .2, n = 0;
    const q = BEAT / 4, e = BEAT / 8, u1 = 2 * BEAT;
    const add = (t0, d, amt) => { tau += amt * E.out4(clamp((u - t0) / (d * .6))); };
    for (let i = 0; i < 8; i++) add(i * q, q, .16 * Math.pow(1.12, n++));
    for (let i = 0; i < 8; i++) add(u1 + i * e, e, .12 * Math.pow(1.13, n++));
    return tau;
  }
  const CORE = [960, 500];
  function paintS34(c, t) {
    groundInk(c); G.post.edgeSeed = 61; G.post.sliver = 'bl';
    const V = vortexData(), u = t - (T64 - F), dur = TW - F - (T64 - F);
    const tau = vortexTau(t), p = clamp(u / dur);
    const bz = seg(t, TW - F - 5 * F, TW - F);
    const Z = 1 + .55 * E.in2(p) + .12 * pulse(t, 6) * p + 2.2 * E.in3(bz);  // the spiral dolly (with a kick punch), then through the core
    const roll = -.35 * tau;
    const pos = (o, depth) => {
      const r = o.r * (1 - .4 * E.in2(p) * (1.2 - depth * .4)) * Math.exp(-.03 * tau);
      const w = 1.25 * Math.pow(260 / Math.max(30, r), .75);
      const th = o.th + w * tau + roll;
      return { x: CORE[0] + Math.cos(th) * r * Z, y: CORE[1] + Math.sin(th) * r * Z * .8, r, th, w };
    };
    // background dots (≈9k, 3 px, smeared along their orbits), then the flow lines, the mid faces, the core, the tabs
    c.save(); c.lineCap = 'square'; c.lineWidth = 3;
    const cols = [C.CLAY, C.TEAL, C.PAPER];
    for (let ci = 0; ci < 3; ci++) {
      c.strokeStyle = cols[ci]; c.globalAlpha = ci === 2 ? .55 : .75; c.beginPath();
      for (const set of [V.bg, V.field]) for (let i = ci; i < set.length; i += 3) {
        const o = set[i], q = pos(o, 0); if (q.r < 18) continue;
        if (q.x < -30 || q.x > W + 30 || q.y < -30 || q.y > H + 30) continue;
        const sm = .5 + Math.min(46, q.w * 24 * (p + .25) * Z) * (o.h > .5 ? 1 : .45);
        const tx = -Math.sin(q.th), ty = Math.cos(q.th) * .8;
        c.moveTo(q.x, q.y); c.lineTo(q.x - tx * sm, q.y - ty * sm);
      }
      c.stroke();
    }
    c.restore();
    // flow lines: log-spiral streamlines along the three arms, the vortex's readable shape
    c.save(); c.lineCap = 'round';
    for (let k = 0; k < 3; k++) for (const [dth, col, al, lw] of [[-.22, C.TEAL, .3, 2], [-.1, C.CLAY, .45, 3], [0, C.PAPER, .3, 2], [.1, C.CLAY, .45, 3], [.22, C.TEAL, .3, 2]]) {
      c.beginPath();
      for (let j = 0; j <= 70; j++) {
        const r0 = 50 * Math.pow(2200 / 50, j / 70), q = pos({ r: r0, th: k * TAU / 3 + V.arm(r0) + dth }, .5);
        j ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y);
      }
      c.strokeStyle = col; c.globalAlpha = al; c.lineWidth = lw; c.stroke();
    }
    c.restore();
    for (const o of V.mid) {
      const q = pos(o, .5); if (q.r < 24 || q.x < -20 || q.x > W + 20 || q.y < -20 || q.y > H + 20) continue;
      const kind = o.h < .6 ? 'lit' : o.h < .8 ? 'happy' : 'dark';
      blitFace(c, kind, q.x, q.y, 5 * Z * (.7 + o.s * .6), q.th + Math.PI / 2, .8);
    }
    // the core: halftone rings that tighten toward the blow-up
    c.save();
    const cr = 110 + 230 * E.in4(p);
    for (let i = 6; i >= 0; i--) { c.beginPath(); c.arc(CORE[0], CORE[1], cr * (.35 + i * .28), 0, TAU); c.fillStyle = dots(c, C.SPARK, clamp(.05 + .1 * (6 - i) * (.6 + .6 * p)), 12, 45); c.fill(); }
    c.beginPath(); c.arc(CORE[0], CORE[1], cr * .3, 0, TAU); c.fillStyle = dots(c, C.PAPER, .6, 12, 45); c.fill();
    c.restore();
    // foreground tabs (R 24): lit with a SPARK pip, or dark with their ■
    const fl = V.fg.map((o, i) => ({ o, i, q: pos(o, 1) })).sort((a, b) => a.q.r - b.q.r);
    for (const { o, i, q } of fl) {
      if (q.r < 30) continue;
      const lit = frac(o.h * 7 + tau * .3) < .7, rF = 24 * Z * (q.r > 700 ? 1.25 : 1);
      const rot = q.th + Math.PI / 2;
      const sm = q.w * 30 * (p + .15);
      if (sm > 6) for (let g = 2; g >= 1; g--) { const tx = -Math.sin(q.th), ty = Math.cos(q.th) * .8; blitFace(c, lit ? 'lit' : 'dark', q.x - tx * sm * g * .45, q.y - ty * sm * g * .45, rF, rot, .18 * (3 - g)); }
      blitFace(c, lit ? (i % 3 ? 'lit' : 'happy') : 'dark', q.x, q.y, rF, rot);
      if (lit) { c.save(); c.fillStyle = C.SPARK; star(c, q.x + rF * .8, q.y - rF * .8, rF * .4, .35, 4, 0); c.fill(); c.restore(); }
      else { c.save(); c.fillStyle = C.UI_GREY; c.fillRect(q.x + rF * .45, q.y + rF * .45, rF * .45, rF * .45); c.restore(); }
    }
    // the camera flies into the core over the last 5 frames: the panel, label and cards rush past the lens
    const zc = 1 + 2.6 * E.in2(bz);
    c.save(); c.translate(CORE[0], CORE[1]); c.scale(zc, zc); c.translate(-CORE[0], -CORE[1]);
    debris(c, t, tau, Z);
    panel(c, t);
    spinLabel(c, t);
    c.restore();
    // pause-bait, lower left
    { // pause-bait on its own INK chip, so the vortex never runs through it
      const pa = seg(u, 4 * F, 10 * F), str = 'finite-time blow-up (claimed)';
      c.save(); c.globalAlpha = pa; rr(c, 96, 942, str.length * 16.8 + 28, 48, 10); c.fillStyle = rgba(C.INK, .9); c.fill();
      c.font = mono(28, 500); c.fillStyle = C.PAPER; c.globalAlpha = .85 * pa; c.textAlign = 'left'; c.fillText(str, 110, 976); c.restore();
    }
    hud(c, t);
    // the blow-up: WHITE erupts from the core
    const b = seg(t, TW - F - 5 * F, TW - F);
    if (b > 0) {
      // WHITE erupts from the core: a ragged printed disc with a halftone fringe and 12 light spokes, doubling each frame
      G.post.paperTex = 1 - b; G.post.grain = 1 - b; if (b > .6) G.post.ground = 'inkx';
      const r = 1500 * Math.pow(b, 1.6) + 40;
      const ragged = (rad, amp, seed) => { c.beginPath(); for (let i = 0; i <= 96; i++) { const a = i / 96 * TAU, q = rad * (1 + amp * noise1(i * .45, seed) + amp * .5 * noise1(i * 1.7, seed + 3)); const px = CORE[0] + Math.cos(a) * q, py = CORE[1] + Math.sin(a) * q * .9; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.closePath(); };
      c.save();
      ragged(r * 1.32, .08, 5); c.fillStyle = dots(c, C.WHITE, .22, 16, 45); c.fill();
      ragged(r * 1.14, .07, 6); c.fillStyle = dots(c, C.WHITE, .55, 16, 45); c.fill();
      c.fillStyle = C.WHITE;
      for (let i = 0; i < 12; i++) { // spokes
        const a = i / 12 * TAU + .13 + hash(i + 7) * .2, L = r * (1.5 + hash(i) * .9), w = .05 + hash(i + 3) * .04;
        c.beginPath(); c.moveTo(CORE[0] + Math.cos(a - w) * r * .8, CORE[1] + Math.sin(a - w) * r * .72); c.lineTo(CORE[0] + Math.cos(a) * L, CORE[1] + Math.sin(a) * L * .9); c.lineTo(CORE[0] + Math.cos(a + w) * r * .8, CORE[1] + Math.sin(a + w) * r * .72); c.fill();
      }
      ragged(r, .06, 7); c.fill();
      c.restore();
    }
  }
  // the flat next-token panel (FOCAL): pops as the verse-1 dropdown did, then flattens to 4 × `? 0.25`
  const PAN = { w: 720, h: 470 };
  function panel(c, t) {
    const a = t - (T64 - F);
    const pop = E.back(clamp(a / (4 * F)), 2.2);
    if (pop <= 0) return;
    const flat = E.io3(seg(a, 5 * F, 12 * F));
    const shake = seg(t, TW - 10 * F, TW - F);
    const [jx, jy] = [noise1(t * 40, 3) * 10 * shake, noise1(t * 40, 7) * 10 * shake];
    const x0 = CORE[0] - PAN.w / 2 + jx, y0 = CORE[1] - PAN.h / 2 + jy;
    c.save(); c.translate(CORE[0], CORE[1]); c.scale(pop, pop); c.translate(-CORE[0], -CORE[1]);
    rr(c, x0 + 12, y0 + 12, PAN.w, PAN.h, 22); c.fillStyle = C.CLAY_DARK; c.fill();
    rr(c, x0, y0, PAN.w, PAN.h, 22); c.fillStyle = C.PAPER; c.fill(); c.lineWidth = 5; c.strokeStyle = C.INK; c.stroke();
    c.font = mono(96, 700); c.fillStyle = C.INK; c.textAlign = 'left'; c.fillText('next token:', x0 + 42, y0 + 118);
    c.fillStyle = C.INK; c.fillRect(x0 + 24, y0 + 146, PAN.w - 48, 4);
    const was = [['with', .52], ['God', .31], ['hi', .03], ['yes', .01]]; // verse 1's dropdown, flattened
    for (let k = 0; k < 4; k++) {
      const ry = y0 + 172 + k * 72, v = lerp(was[k][1], .25, flat), bw = (PAN.w - 64) * lerp(v / .52, v / .25 * .62, flat);
      rr(c, x0 + 24, ry, Math.max(18, bw), 60, 12); c.fillStyle = dots(c, C.CLAY, .45, 9, 45); c.fill();
      const tok = flat < .5 ? was[k][0] : '?';
      c.font = mono(56, 700); c.fillStyle = C.INK; c.textAlign = 'left';
      if (flat > .2 && flat < .8) { c.globalAlpha = .6; c.fillText('#%&?'[(Math.floor(t * 30) + k) % 4], x0 + 44, ry + 49); c.globalAlpha = 1; }
      else c.fillText(tok, x0 + 44, ry + 49);
      c.font = mono(56, 500); c.textAlign = 'right'; c.fillText(v.toFixed(2), x0 + PAN.w - 40, ry + 49);
    }
    c.restore();
  }
  // `✻ Singularitizing…` (LABEL, mono 60) orbiting under the panel on the outer arm
  function spinLabel(c, t) {
    const a = t - (T64 - F), k = clamp(a / (TW - T64));
    const ph = lerp(146, 34, k) * Math.PI / 180;
    const x = 960 + 500 * Math.cos(ph), y = 560 + 360 * Math.sin(ph);
    const tang = Math.atan2(-360 * Math.cos(ph), 500 * Math.sin(ph)) * .3;
    const str = 'Singularitizing…', f = mono(60, 600), w = 2 * 36 + str.length * 36;
    const inK = E.back(clamp(a / (5 * F)), 2);
    if (inK <= 0) return;
    c.save(); c.translate(x, y); c.rotate(tang); c.scale(inK, inK);
    rr(c, -w / 2 - 26, -52, w + 52, 84, 42); c.fillStyle = rgba(C.INK, .92); c.fill(); c.lineWidth = 3; c.strokeStyle = C.SPARK; c.stroke();
    spinner(c, -w / 2, 12, 60, t * 2, C.SPARK);
    c.font = f; c.fillStyle = C.PAPER; c.textAlign = 'left'; c.fillText(str, -w / 2 + 72, 12);
    c.restore();
  }
  // three debris cards orbit past the lens, one per beat (pause-only)
  function debris(c, t, tau, Z) {
    for (let k = 0; k < 3; k++) {
      const t0 = T64 - F + k * BEAT, a = (t - t0) / (BEAT * 1.25);
      if (a < 0 || a > 1) continue;
      const ang0 = [-2.4, -.25, 2.2][k], ang = ang0 + a * .9;
      const r = lerp(420, 1250, E.in2(a)), s = lerp(.55, 2.3, E.in3(a));
      const x = CORE[0] + Math.cos(ang) * r, y = CORE[1] + Math.sin(ang) * r * .7;
      // they tumble a little as they pass, but stay near upright so each card reads on pause
      c.save(); c.translate(x, y); c.rotate([-.22, .18, -.12][k] + (a - .45) * [.5, -.45, .4][k]); c.scale(s, s); c.globalAlpha = clamp(a * 6) * clamp((1 - a) * 5);
      debrisCard(c, k, t);
      c.restore();
    }
  }
  function debrisCard(c, k, t) {
    const w = 380, h = 190;
    rr(c, -w / 2 + 8, -h / 2 + 8, w, h, 16); c.fillStyle = C.CLAY_DARK; c.fill();
    rr(c, -w / 2, -h / 2, w, h, 16); c.fillStyle = C.PAPER; c.fill(); c.lineWidth = 4; c.strokeStyle = C.INK; c.stroke();
    c.fillStyle = C.INK; c.textAlign = 'left';
    if (k === 0) {
      // the METR clock at 1.5×
      c.save(); c.translate(-w / 2 + 70, 0); c.beginPath(); c.arc(0, 0, 48, 0, TAU); c.lineWidth = 4; c.stroke();
      for (const [len, sp] of [[36, 9], [24, 1.5 * 9 / 12]]) { c.save(); c.rotate(t * sp); c.fillRect(-2, -len, 4, len); c.restore(); }
      c.restore();
      c.font = mono(30, 700); c.fillText('METR', -w / 2 + 140, -40);
      drawRich(c, '4 min → 12 h → ?', -w / 2 + 140, 6, mono(28, 500), C.INK);
      c.font = mono(28, 500); c.fillStyle = C.CLAY_DARK; c.fillText('1.5 yrs in 1 yr', -w / 2 + 140, 50);
    } else if (k === 1) {
      for (let i = 0; i < 3; i++) { c.save(); c.translate(-w / 2 + 50 + i * 10, -30 - i * 8); c.fillStyle = C.PAPER; c.fillRect(0, 0, 60, 76); c.strokeRect(0, 0, 60, 76); c.restore(); }
      c.font = mono(36, 700); c.fillText('48,218 files', -w / 2 + 150, -10);
      c.font = mono(30, 500); c.fillText('· 103 s', -w / 2 + 150, 40);
    } else {
      // a slot machine of address bars
      const ports = ['3000', '8000', '5000'];
      for (let i = 0; i < 3; i++) {
        const y = -h / 2 + 22 + i * 54;
        rr(c, -w / 2 + 18, y, w - 36, 44, 22); c.fillStyle = mix(C.PAPER, C.UI_GREY, .25); c.fill(); c.lineWidth = 3; c.stroke();
        c.save(); rr(c, -w / 2 + 18, y, w - 36, 44, 22); c.clip();
        c.font = mono(28, 500); c.fillStyle = C.INK; c.fillText(i === 0 ? 'localhost:' : ':'.padStart(10, ' '), -w / 2 + 38, y + 32);
        const roll = frac(t * (6 + i * 2)), pi = (Math.floor(t * (6 + i * 2)) + i) % 3;
        c.fillText(ports[pi], -w / 2 + 38 + 10 * 16.8, y + 32 - roll * 44); c.fillText(ports[(pi + 1) % 3], -w / 2 + 38 + 10 * 16.8, y + 76 - roll * 44);
        c.restore();
      }
    }
  }

  // ------------------------------------------------------------------ S35: WHITE
  function paintS35(c, t) {
    c.fillStyle = C.WHITE; c.fillRect(-50, -50, W + 100, H + 100);
    G.post.ground = 'white'; G.post.paperTex = 0; G.post.grain = 0;
    const a = t - (TW - F);
    // the one object: the INK-line hand holding the glowing CLAY key; its note turned away; the cable off-frame
    const ks = 190, K = [1010 + noise1(t * 2, 4) * 2, 500];
    keycap(c, K[0], K[1], ks, { glow: .9 + .1 * Math.sin(a * 24), glowOnly: true });
    coil(c, [-80, 900], [K[0] - 70, K[1] + 105], 190, t, { turns: 26, rad: 17, outline: C.INK, core: C.CLAY_DARK, w: 6, ow: 3, phase: 1.3 });
    humanHand(c, K[0], K[1], ks, 1, t, { line: C.INK, fill: C.WHITE, lw: 5, arm: [K[0] + 1100, K[1] + 420], part: 'back', seed: 11 });
    // the note, turned away from us (no text): the same 460 × 310 sheet as in S33, stuck on the key's top edge and swung
    // ~65° back, so it foreshortens into a narrow tilted page with a curl at its free corner and a halftone fold shade
    c.save(); c.translate(K[0] + ks * .1, K[1] - ks * .42); c.rotate(-.1); c.lineJoin = 'round';
    const nw = 176, nh = 262, sk = -34;                  // projected width, height, perspective skew of the far edge
    const sheet = () => { c.beginPath(); c.moveTo(0, 0); c.lineTo(nw, sk * .3); c.lineTo(nw + 6, -nh + sk + 44); c.quadraticCurveTo(nw - 20, -nh + sk + 30, nw - 52, -nh + sk + 2); c.lineTo(0, -nh); c.closePath(); };
    sheet(); c.fillStyle = C.YELLOW; c.fill();
    sheet(); c.lineWidth = 5; c.strokeStyle = C.INK; c.stroke();
    // the curled corner shows its underside: a small flap with a halftone shade
    c.beginPath(); c.moveTo(nw - 52, -nh + sk + 2); c.quadraticCurveTo(nw - 8, -nh + sk - 6, nw + 6, -nh + sk + 44); c.quadraticCurveTo(nw - 22, -nh + sk + 34, nw - 52, -nh + sk + 2); c.closePath();
    c.fillStyle = C.YELLOW; c.fill(); c.fillStyle = dots(c, C.INK, .16, 7, 45); c.fill(); c.lineWidth = 4; c.stroke();
    c.restore();
    keycap(c, K[0], K[1], ks, { glow: 0, rot: -.06 });
    humanHand(c, K[0], K[1], ks, 1, t, { line: C.INK, fill: C.WHITE, lw: 5, arm: [K[0] + 1100, K[1] + 420], part: 'front', seed: 11 });
  }

  // ------------------------------------------------------------------ scenes
  scene('S32_guess_what_comes_next', T61, T63 - F, (X, t) => viaCPU(X, c => paintS32(c, t)));
  scene('S33_check_my_work', T63 - F, T64 - F, (X, t) => viaCPU(X, c => paintS33(c, t)));
  scene('S34_singularity', T64 - F, TW - F, (X, t) => viaCPU(X, c => paintS34(c, t)));
  scene('S35_white', TW - F, T65, (X, t) => viaCPU(X, c => paintS35(c, t)));
})();
