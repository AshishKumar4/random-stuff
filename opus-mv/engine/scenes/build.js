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
    const { x0 = 96, y0 = 300, x1 = 1420, y1 = 840, size = 48, lh = 58, top = 0, hl = -1, alpha = 1, base = 36, reveal = 99, smear = 0 } = o;
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
        c.globalAlpha = alpha; rr(c, x0 - 14, y - size * .86, x1 - x0 + 14, size * 1.2, 8); c.fillStyle = C.SPARK; c.fill();
        c.fillStyle = C.INK; c.font = mono(size, 700); c.fillText(vis.replace(/^\s+/, ''), x0 + 8, y); c.font = mono(size, 500);
        continue;
      }
      const cm = /^\s*\/\//.test(s);
      c.fillStyle = cm ? C.UI_GREY : C.TEAL; c.globalAlpha = alpha * (cm ? .7 : .78);
      c.fillText(vis, x0, y);
      if (smear) { c.globalAlpha = alpha * .22; c.fillText(vis, x0, y + smear); c.globalAlpha = alpha * .1; c.fillText(vis, x0, y + smear * 2); }
    }
    c.restore();
  }

  // ------------------------------------------------------------------ the TEAL text-body skin (BIBLE §6.1 skins)
  // The rig is sampled onto a character grid (one sample per mono cell); each covered cell prints one glyph of the
  // source, coloured by what the clean rig has there (crown/legs → CLAY, cream/paper → pale TEAL, the rest → TEAL);
  // INK (eyes, mouth, lines) prints nothing, so the face reads as holes in the text.
  const GLY = { sc: null };
  function glyphFigure(c, x, soleY, R, st, o = {}) {
    const S = mergeState(st);
    const cw = o.cw || Math.max(8, R * .15), chh = cw * 1.5;
    const L0 = -3.3 * R, T0 = -9.8 * R, cols = Math.ceil(6.6 * R / cw), rows = Math.ceil(10.4 * R / chh);
    if (!GLY.sc || GLY.sc.width < cols || GLY.sc.height < rows) GLY.sc = cpuCanvas(Math.max(cols, GLY.sc ? GLY.sc.width : 0), Math.max(rows, GLY.sc ? GLY.sc.height : 0));
    const sx = cx2d(GLY.sc); sx.setTransform(1, 0, 0, 1, 0, 0); sx.clearRect(0, 0, GLY.sc.width, GLY.sc.height);
    sx.setTransform(1 / cw, 0, 0, 1 / chh, -L0 / cw, -T0 / chh); if (S.flip) sx.scale(-1, 1);
    drawOpusBody(sx, R, S);
    const d = sx.getImageData(0, 0, cols, rows).data;
    const src = srcLines().glyphs, off = (o.offset || 0) * cols;
    const B = [[], [], [], []]; // warm, pale, teal, head(print head)
    const rev = o.reveal === undefined ? 1e9 : o.reveal * rows;
    for (let r = 0; r < rows; r++) {
      if (r > rev) break;
      for (let q = 0; q < cols; q++) {
        const i = (r * cols + q) * 4, a = d[i + 3];
        if (a < 120) continue;
        const R_ = d[i], G_ = d[i + 1], B_ = d[i + 2], lum = .3 * R_ + .59 * G_ + .11 * B_;
        if (lum < 64) continue;
        const cls = r >= rev - 1 ? 3 : (R_ - G_ > 55 && lum >= 100) ? 0 : lum >= 180 ? 1 : 2;
        B[cls].push(q, r);
      }
    }
    c.save(); c.font = `700 ${(cw / .6).toFixed(1)}px ${FONTS.mono}`; c.textAlign = 'left'; c.globalAlpha *= o.alpha ?? 1;
    const cols4 = [C.CLAY, mix(C.TEAL, C.PAPER, .5), C.TEAL, C.SPARK];
    B.forEach((arr, k) => {
      c.fillStyle = cols4[k];
      for (let n = 0; n < arr.length; n += 2) {
        const q = arr[n], r = arr[n + 1], ch = src[(r * cols + q + off) % src.length];
        c.fillText(ch, x + L0 + q * cw, soleY + T0 + (r + .82) * chh);
      }
    });
    c.restore();
    return { cols, rows, cw, chh, L0, T0 };
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
  function spinner(c, x, base, size, t, col) { // ✻, stepped rotation (Claude Code's spinner verbs)
    const cx = x + .3 * size, cy = base - .36 * size, a = Math.floor(t * 12) * .52;
    c.save(); c.translate(cx, cy); c.rotate(a); c.scale(1 + .12 * pulse(t, 8), 1 + .12 * pulse(t, 8)); c.translate(-cx, -cy); richGlyph(c, '✻', x, base, size, col); c.restore();
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
    salute: { armR: { hand: [.66, 6.1], bend: -1, front: true }, armL: { hand: [-.9, 2.9], bend: -1 }, face: { eyes: 'normal', mouth: 'M', brows: 'worried' }, rays5: true },
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
        const e = E.out2(k), hgt = 230 + hash(i * 7) * 170;
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
    scrollback(c, { top, hl: S.hl, reveal: revRows, alpha: o.dim ?? 1 });
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
      TB_ARGS = { x: TBO.x, y: TBO.y, R: TBO.R, state: { ...tbState(t), t }, o: { reveal: rv < 1 ? rv : undefined, offset: beatN(t), cw: 10.5 } };
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
    const k = clamp(a / (4 * F)), snap = E.back(k, 2.4);
    const trem = a > 5 * F ? Math.sin(a * 38) * .025 : 0;
    const hand = [lerp(1.2, .66, snap), lerp(4.6, 6.12, snap) + trem];
    const st = {
      rays5: true, t, ground: 'ink', lean: -.02 * snap, dy: .03 * snap,
      armR: { hand, bend: -1, front: true, type: 'mitten' }, armL: { hand: [-.92, 2.95], bend: -1 },
      head: { tilt: -.05 * snap }, face: { eyes: 'normal', mouth: a > BEAT ? 'wobble' : 'M', brows: 'worried', gaze: [0, -.3], lower: .18, lid: Math.max(.22, blinkF(t, bt(61, 4) - F)) },
      crown: { flare: .97, droop: .12 + .08 * clamp((a - BEAT) / BEAT) }, ahoge: { blink: ahogeBlink(t), sway: -.15 }, jacketRow: beatN(t),
    };
    const S = mergeState(st), sole = [960, 620 + 5.72 * R];
    const M = new DOMMatrix().translate(sole[0], sole[1]);
    const L = rigLayer(M, R, st, { name: 'bu_ins', after: (x, RR, SS) => { const p = headPt(SS, RR, 0, -.6 * RR); sparkMark(x, p[0], p[1], .13 * RR); } });
    blit(c, L);
    c.restore();
  }
  const blinkF = (t, t0) => { const d = (t - t0) * 30; if (d < 0 || d >= 6) return 0; if (d < 2) return d / 2; if (d < 3) return 1; return 1 - (d - 3) / 3; };

  // ------------------------------------------------------------------ bar 62 (b): the 12-ray silhouette from diff lines
  function paintDiff(c, t) {
    const a = t - CUTS[1], k = clamp(a / BEAT);
    const cx = 960, cy = 575, r = 205;
    // diff lines: rows of +/- code streaks flying in from both sides, clipped to the silhouette as they land
    const D = lay('bu_diff');
    D.save(); D.translate(cx, cy);
    for (let i = 0; i < 12; i++) { rayPath(D, i / 12 * TAU + .13, .8 * r, 1.05 * r, .6 * r * .62, -.06); D.fillStyle = '#fff'; D.fill(); }
    D.beginPath(); D.arc(0, 0, r * .98, 0, TAU); D.fill();
    D.restore();
    D.globalCompositeOperation = 'source-in';
    const rows = 44, top = cy - 2.05 * r - 10, lh = (4.1 * r + 20) / rows;
    D.font = mono(15, 700);
    for (let j = 0; j < rows; j++) {
      const y = top + j * lh, del = hash(j * 5 + 1) < .3;
      const t0 = hash(j * 3 + 7) * .55, kk = E.out3(clamp((k - t0) / .35));
      const dir = j % 2 ? 1 : -1, off = (1 - kk) * 900 * dir;
      D.fillStyle = del ? C.UI_GREY : C.TEAL;
      D.globalAlpha = kk;
      D.fillRect(cx - 2.2 * r + off, y, 4.4 * r, lh - 3);
      D.fillStyle = C.INK; D.globalAlpha = kk * .8;
      D.fillText((del ? '- ' : '+ ') + srcLines().glyphs.slice(j * 37 % 900, j * 37 % 900 + 90), cx - 2.2 * r + off + 6, y + lh - 5);
    }
    D.globalCompositeOperation = 'source-over'; D.globalAlpha = 1;
    c.save(); c.globalAlpha = .55; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(layC('bu_diff'), 0, 0); c.restore();
    c.save(); c.translate(cx, cy); c.globalAlpha = .35 * k; c.strokeStyle = C.PAPER; c.lineWidth = 3;
    for (let i = 0; i < 12; i++) { rayPath(c, i / 12 * TAU + .13, .8 * r, 1.05 * r, .6 * r * .62, -.06); c.stroke(); }
    c.restore();
    // the TEAL Opus in front, at R 110, looking up at what it is writing
    TB_ARGS = { x: 960, y: 575 + 5.72 * 112, R: 112, state: { armL: { hand: [-.5, 4.4], bend: 1, front: true }, armR: { hand: [1.0, 5.0], bend: -1, front: true, type: 'point', fingerAng: -1.2 }, head: { tilt: -.1 }, face: { eyes: 'normal', gaze: [0, -1], mouth: 'O' }, t }, o: { offset: beatN(t) * 2, cw: 13 } };
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
    const a = t - CUTS[3], s = 1.55;
    const k = clamp(a / (3 * F)), shut = 1 - E.in3(k);
    const bump = a > 3 * F ? 1 - .07 * Math.exp(-14 * (a - 3 * F)) * Math.cos((a - 3 * F) * 45) : 1;
    c.save(); c.translate(960, 900); c.scale(1 / bump, bump); c.translate(-960, -900);
    folder(c, 960, 900, s, shut, t, { inside: (x, x0, y0, w, h, ft) => {
      // one last hand waving from the gap, pulled in as it shuts
      if (shut > .25) { const hx = x0 + w * .62, hy = ft - 20 * s * shut; x.save(); x.beginPath(); x.rect(x0, y0 - 200, w, ft - y0 + 200); x.clip(); x.fillStyle = C.FACE; x.strokeStyle = C.INK; x.lineWidth = 4; x.beginPath(); x.arc(hx + Math.sin(t * 40) * 8, hy, 20 * s * .7, 0, TAU); x.fill(); x.stroke(); x.restore(); }
    } });
    c.restore();
    if (a > 3 * F) { // glyph dust puffs from the seam
      const q = clamp((a - 3 * F) / (4 * F)), R_ = rng('dust');
      c.save(); c.font = mono(28, 700); c.fillStyle = C.TEAL;
      for (let i = 0; i < 18; i++) {
        const ang = Math.PI + R_() * Math.PI, sp = 90 + R_() * 220, ch = '{}<>=+*/#;'[i % 10];
        c.globalAlpha = 1 - q; c.fillText(ch, 960 + Math.cos(ang) * sp * E.out2(q) * 1.6, 900 - FOLD.h * s * .55 + Math.sin(ang) * sp * E.out2(q) * .6);
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
      const n = u < 6 * F ? 0 : Math.min(words.length, 1 + Math.floor((u - 6 * F) / (2 * F)));
      const vis = words.slice(0, n).join(' ');
      c.save(); c.textAlign = 'left';
      c.font = mono(72, 700); c.fillStyle = C.TEAL; if (u >= 5 * F) c.fillText('>', TX, 214);
      c.font = mono(72, 600); c.fillStyle = C.PAPER; c.fillText(vis, TX + 2 * ADV72, 214);
      const cx = TX + (2 + vis.length + (n ? 0 : 0)) * ADV72 + (n ? ADV72 * .15 : 0);
      if (u >= 5 * F && (t < ENTER || Math.floor(t * 4) % 2 === 0)) { c.fillStyle = C.PAPER; c.fillRect(cx, 214 - 56, 34, 66); }
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
    if (u < 6 * F) {
      const k1 = clamp(u / (2 * F)), k2 = E.io3(seg(u, 2 * F, 5.5 * F));
      const w = lerp(14, 34, k1), h = lerp(14, 66, E.back(k1, 2));
      const px = lerp(960, TX + 2 * ADV72, k2), py = lerp(540, 214 - 23, k2);
      c.save(); c.fillStyle = C.PAPER;
      if (k2 > 0 && k2 < 1) { c.globalAlpha = .45; c.fillStyle = C.TEAL; c.beginPath(); c.moveTo(960, 540 - 7); c.lineTo(px, py - h / 2); c.lineTo(px, py + h / 2); c.lineTo(960, 540 + 7); c.fill(); c.globalAlpha = 1; c.fillStyle = C.PAPER; }
      c.fillRect(px - w / 2 + (k2 ? w / 2 : 0), py - h / 2, w, h); c.restore();
    }
    lyric(c, t, pic !== 'spew' && pic !== 'conga');
    hud(c, t);
  }

  // ------------------------------------------------------------------ the ESC keycap, its coiled cable, the note, the hand
  function keycap(c, cx, cy, s, o = {}) {
    const { glow = 1, rot = 0, label = true, lw = 4, ink = C.INK } = o;
    c.save(); c.translate(cx, cy); c.rotate(rot);
    if (glow > 0) { // bloom: SPARK halftone halo (no gradients)
      c.save(); c.globalAlpha = .55 * glow; c.beginPath(); c.arc(0, 0, s * .95, 0, TAU); c.fillStyle = dots(c, C.SPARK, .22, 11, 45); c.fill();
      c.globalAlpha = .7 * glow; c.beginPath(); c.arc(0, 0, s * .75, 0, TAU); c.fillStyle = dots(c, C.SPARK, .42, 11, 45); c.fill(); c.restore();
    }
    const h = s, w = s;
    rr(c, -w / 2, -h / 2 + s * .1, w, h, s * .2); c.fillStyle = C.CLAY_DARK; c.fill(); c.lineWidth = lw; c.strokeStyle = ink; c.lineJoin = 'round'; c.stroke();
    rr(c, -w / 2 + s * .06, -h / 2 - s * .02, w - s * .12, h - s * .16, s * .16); c.fillStyle = C.CLAY; c.fill(); c.stroke();
    c.save(); rr(c, -w / 2 + s * .06, -h / 2 - s * .02, w - s * .12, h - s * .16, s * .16); c.clip();
    c.fillStyle = dots(c, C.SPARK, .5, 8, 45); c.beginPath(); c.ellipse(-s * .1, -s * .2, s * .34, s * .2, -.3, 0, TAU); c.fill(); c.restore();
    if (label) { c.font = mono(Math.round(s * .36), 700); c.fillStyle = ink; c.textAlign = 'left'; c.fillText('esc', -w / 2 + s * .17, -h / 2 + s * .44); }
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
      pts.push([q[0] + nx * Math.sin(ph) * rad * env + tx * Math.cos(ph) * rad * .55 * env, q[1] + ny * Math.sin(ph) * rad * env + ty * Math.cos(ph) * rad * .55 * env]);
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
    c.fillStyle = rgba(C.PAPER, .82); c.save(); c.translate(6, -h * .18); c.rotate(-.7); c.fillRect(-40, -14, 80, 28); c.restore();
    c.restore();
  }
  // Hertzfeldt stick hand, palm up; fingers curl over whatever it holds in 3 steps (on 2s). col: PAPER on INK / INK on WHITE
  function stickHandUp(c, wx, wy, ang, s, close, t, o = {}) {
    const { col = C.PAPER, lw = 5, from = null, seed = 7, part = 'all' } = o;
    const tt = step2(t), J = i => jit(tt, seed * 31 + i, .9);
    const kk = Math.floor(clamp(close) * 3 + 1e-6) / 3;
    c.save(); c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round';
    if (part !== 'front') {
      if (from) { c.beginPath(); c.moveTo(from[0] + J(1), from[1] + J(2)); c.quadraticCurveTo(lerp(from[0], wx, .5) + J(3) * 3, lerp(from[1], wy, .5) + 18 + J(4), wx, wy); c.stroke(); }
      c.save(); c.translate(wx, wy); c.rotate(ang);
      // palm: a shallow cup (heel → finger roots)
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(s * .45 + J(5), s * .32 + J(6), s * .95 + J(7), s * .02 + J(8)); c.stroke();
      // thumb, up the near side
      c.beginPath(); c.moveTo(s * .12, -s * .02); c.quadraticCurveTo(s * .2 + J(9), -s * .42, s * (.42 + kk * .12) + J(10), -s * (.56 - kk * .08)); c.stroke();
      c.restore();
    }
    if (part !== 'back') {
      c.save(); c.translate(wx, wy); c.rotate(ang);
      // four fingers from the far edge of the palm, curling up and over (3 steps)
      for (let i = 0; i < 4; i++) {
        const bx = s * (.95 - i * .06), by = s * (.02 - i * .05), L = s * (.62 - i * .06);
        const a0 = -Math.PI / 2 * .25 - kk * 1.9;     // open: out and slightly up; closed: curled back over the top
        const mx = bx + Math.cos(a0 * .5) * L * .55, my = by + Math.sin(a0 * .5) * L * .55;
        const ex = mx + Math.cos(a0) * L * .6 + J(20 + i), ey = my + Math.sin(a0) * L * .6 + J(30 + i);
        c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(mx + J(40 + i), my + J(50 + i), ex, ey); c.stroke();
      }
      c.restore();
    }
    c.restore();
  }

  // ------------------------------------------------------------------ S33: the key
  const R33 = 160, SOLE33 = [1040, 440 + 5.72 * 160];
  const K33 = { lift: T63 - F, fly: T63 + 2 * F, grab: T63 + 7 * F, face: T63 + 11 * F, offer: bt(63, 2) - 3 * F, land: bt(63, 4) - F, handIn: bt(63, 4) - 8 * F };
  const P33 = {
    reach: { lean: .05, armR: { hand: [-.62, 3.45], bend: 1, front: true }, armL: { hand: [-1.0, 3.2], bend: -1 }, head: { tilt: .13 }, face: { eyes: 'normal', gaze: [-1, 1], mouth: 'O' } },
    yank: { lean: -.1, dy: .04, armR: { hand: [1.62, 4.35], bend: -1, front: true }, armL: { hand: [-1.05, 3.4], bend: -1 }, head: { tilt: -.07 }, face: { eyes: '><', mouth: 'E' } },
    show: { lean: -.03, armR: { hand: [1.5, 4.85], bend: -1, front: true }, armL: { hand: [-.95, 3.0], bend: -1 }, head: { tilt: -.08 }, face: { eyes: 'normal', gaze: [.25, 0], mouth: 'I' } },
    offer: { lean: .06, armR: { hand: [1.95, 4.55], bend: -1, front: true }, armL: { hand: [-.95, 3.0], bend: -1 }, head: { tilt: .05 }, face: { eyes: 'normal', gaze: [.6, .1], mouth: 'rest', lower: .22 } },
    release: { lean: .02, armR: { hand: [1.35, 4.2], bend: -1, front: true }, armL: { hand: [-.95, 3.0], bend: -1 }, head: { tilt: -.07 }, face: { eyes: 'happy', mouth: 'rest', lower: .4 } },
  };
  function pose33(t) {
    const K = [[K33.lift, 'reach'], [K33.fly, 'reach'], [K33.grab, 'yank', E.back], [K33.face, 'show', E.out3], [K33.offer, 'show'], [bt(63, 2) + 2 * F, 'offer', E.back], [K33.land + 3 * F, 'offer'], [K33.land + 8 * F, 'release', E.out3]];
    let i = 0; while (i < K.length - 1 && t >= K[i + 1][0]) i++;
    if (i === K.length - 1) return fullPose(P33[K[i][1]]);
    const [a, na] = K[i], [b, nb, e] = K[i + 1];
    return blendPose(fullPose(P33[na]), fullPose(P33[nb]), (e || E.io2)(clamp((t - a) / (b - a))));
  }
  // where the key is, this frame: [x, y, size, rot] — born from the word, carried by Opus, then by the human
  function hand33(t) { // the human's wrist path (enters from bottom-right on 2s; anticipation before b4)
    const k = E.out3(clamp((step2(t) - K33.handIn) / (8 * F)));
    const w = [lerp(2050, 1392, k), lerp(1010, 688, k)];
    const after = clamp((t - K33.land) / (10 * F));
    return [w[0] + 26 * E.io2(after), w[1] + 8 * E.io2(after)];
  }
  function key33(t, S) {
    const hp = bodyPt(S, R33, S.armR.hand[0], S.armR.hand[1]);
    const inHand = [SOLE33[0] + hp[0] + 6, SOLE33[1] + hp[1] - 62];
    if (t < K33.fly) { // the word rises off the line
      const k = E.out2(clamp((t - K33.lift) / (3 * F)));
      return { x: ESC_X + 32, y: SB.base - 12 - 34 * k, s: 36, word: 1 - k * .0, grow: 0 };
    }
    if (t < K33.grab) { // grows into the keycap as it flies into the mitten
      const k = clamp((t - K33.fly) / (K33.grab - K33.fly)), e = E.io3(k);
      const p0 = [ESC_X + 32, SB.base - 46];
      return { x: lerp(p0[0], inHand[0], e), y: lerp(p0[1], inHand[1], e) - 90 * Math.sin(k * Math.PI), s: lerp(36, 150, E.back(k, 1.4)), grow: k };
    }
    if (t < K33.land) return { x: inHand[0], y: inHand[1], s: 150 * (t > bt(63, 2) - 3 * F ? 1 + .1 * E.back(clamp((t - bt(63, 2) + 3 * F) / (5 * F))) : 1), grow: 1 };
    // in the human's palm: dropped in with a squash
    const w = hand33(t), a = t - K33.land;
    const drop = a < 3 * F ? -18 * (1 - a / (3 * F)) : 0;
    return { x: w[0] + 30, y: w[1] - 58 + drop, s: 165, grow: 1, human: true };
  }
  function paintS33(c, t) {
    groundInk(c); G.post.edgeSeed = 61; G.post.sliver = 'bl';
    // the terminal behind (dimmed: the cutting has stopped, the picture holds)
    titleBar(c, 1);
    promptBox(c, .55, 0);
    c.save(); c.globalAlpha = .55; c.font = mono(72, 700); c.fillStyle = C.TEAL; c.fillText('>', TX, 214);
    if (Math.floor(t * 2.2) % 2 === 0) { c.fillStyle = C.PAPER; c.fillRect(TX + 2 * ADV72, 214 - 56, 34, 66); } c.restore();
    scrollback(c, { top: srcLines().hl - 2, hl: -1, alpha: .28 });
    const pulled = t >= K33.lift;
    statusLine(c, t, 2, { escGone: pulled });
    // Opus, clean vector, MCU R 160
    const P = pose33(t);
    const st = { ...P, t, ground: 'ink', jacketRow: beatN(t), ahoge: { blink: ahogeBlink(t) }, crown: { ...P.crown, flare: 1 + .05 * pulse(t, 7) }, face: { ...P.face, lid: Math.max(P.face.lid || 0, blinkF(t, K33.face - F)) } };
    const S = mergeState(st);
    const M = new DOMMatrix().translate(SOLE33[0], SOLE33[1]);
    const L = rigLayer(M, R33, st, { name: 'bu_o33' });
    blit(c, L);
    // the key, its cable and the note
    const K = key33(t, S);
    const plug = [ESC_X + 30, SB.base - 14];
    if (pulled && t >= K33.fly - F) {
      // the socket where the word was
      c.save(); c.fillStyle = C.INK; c.fillRect(ESC_X - 4, SB.base - 34, 72, 44); c.strokeStyle = C.PAPER; c.lineWidth = 3; c.strokeRect(ESC_X + 8, SB.base - 26, 46, 30); c.restore();
      const kb = [K.x - K.s * .18, K.y + K.s * .5];
      const sag = K.human ? 150 : lerp(40, 120, clamp((t - K33.grab) / .3));
      coil(c, plug, kb, sag, t, { turns: 12, rad: lerp(4, 13, clamp(K.grow)), phase: t * 2 });
    }
    // human hand (behind the key), Opus's thumb over it
    const handOn = t >= K33.handIn;
    const W_ = hand33(t), close = clamp((step2(t) - K33.land) / (6 * F));
    if (handOn) stickHandUp(c, W_[0], W_[1], -.22, 120, close, t, { from: [2000, 1060], part: 'back' });
    if (t < K33.fly) {
      c.save(); c.font = mono(Math.round(K.s), 700); c.fillStyle = C.PAPER; c.textAlign = 'left';
      c.shadowColor = C.SPARK; c.globalAlpha = 1; c.fillText('esc', K.x - 32, K.y + 12); c.restore();
    } else {
      const g = clamp(K.grow);
      if (g < .6) { c.save(); c.font = mono(Math.round(lerp(36, 60, g)), 700); c.fillStyle = C.PAPER; c.textAlign = 'center'; c.globalAlpha = 1 - g / .6; c.fillText('esc', K.x, K.y + 12); c.restore(); }
      if (g > .15) keycap(c, K.x, K.y, K.s * clamp((g - .15) / .6 + .3, 0, 1), { glow: g, rot: K.human ? -.05 : .04 });
    }
    // the note (FOCAL, 460 × 310): stuck to the keycap's top-right corner
    const nk = clamp((t - (K33.grab - 2 * F)) / (5 * F));
    if (nk > 0) note(c, K.x + K.s * .38, K.y - K.s * .3, -.07, nk);
    // Opus's mitten thumb in front of the key while it holds it; the human's fingers close over it on b4
    if (!K.human && t >= K33.grab) {
      const hp = bodyPt(S, R33, S.armR.hand[0], S.armR.hand[1]), hx = SOLE33[0] + hp[0], hy = SOLE33[1] + hp[1];
      c.save(); c.beginPath(); c.arc(hx - 10, hy - 26, .1 * R33, 0, TAU); c.fillStyle = C.FACE; c.fill(); c.lineWidth = 6.4; c.strokeStyle = C.INK; c.stroke(); c.restore();
    }
    if (handOn) stickHandUp(c, W_[0], W_[1], -.22, 120, close, t, { part: 'front' });
    lyric(c, t, true);
    hud(c, t);
  }

  // ------------------------------------------------------------------ S34: the vortex
  let VX = null;
  function vortexData() {
    if (VX) return VX;
    const R_ = rng('vortex');
    const arm = (r) => Math.log(r / 40) * 1.55;          // log-spiral arm angle at radius r
    const mk = (n, r0, r1, spread) => { const a = []; for (let i = 0; i < n; i++) { const r = r0 * Math.pow(r1 / r0, R_()), k = Math.floor(R_() * 3); a.push({ r, th: k * TAU / 3 + arm(r) + (R_() - .5) * spread, h: R_(), s: R_() }); } return a; };
    VX = { fg: mk(24, 260, 1150, .9), mid: mk(600, 70, 1400, .8), bg: mk(7000, 30, 1600, 1.1), arm };
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
    let tau = u * .35, n = 0;
    const q = BEAT / 4, e = BEAT / 8, u1 = 2 * BEAT;
    const add = (t0, d, amt) => { tau += amt * E.out3(clamp((u - t0) / (d * .8))); };
    for (let i = 0; i < 8; i++) add(i * q, q, .16 * Math.pow(1.14, n++));
    for (let i = 0; i < 8; i++) add(u1 + i * e, e, .14 * Math.pow(1.16, n++));
    return tau;
  }
  const CORE = [960, 500];
  function paintS34(c, t) {
    groundInk(c); G.post.edgeSeed = 64; G.post.sliver = 'tr';
    const V = vortexData(), u = t - (T64 - F), dur = TW - F - (T64 - F);
    const tau = vortexTau(t), p = clamp(u / dur);
    const Z = 1 + .55 * E.in2(p) + .12 * pulse(t, 6) * p;  // the spiral dolly (with a kick punch)
    const roll = -.35 * tau;
    const pos = (o, depth) => {
      const r = o.r * Math.exp(-.55 * tau * (1.2 - depth * .3));
      const w = 1.25 * Math.pow(260 / Math.max(30, r), .75);
      const th = o.th + w * tau + roll;
      return { x: CORE[0] + Math.cos(th) * r * Z, y: CORE[1] + Math.sin(th) * r * Z * .8, r, th, w };
    };
    // background dots (≈7k, 3 px), then the arms' streaks, the mid faces, the core, the foreground faces
    c.save();
    const cols = [C.CLAY, C.TEAL, C.PAPER];
    for (let ci = 0; ci < 3; ci++) {
      c.fillStyle = cols[ci]; c.globalAlpha = ci === 2 ? .5 : .7;
      for (let i = ci; i < V.bg.length; i += 3) {
        const o = V.bg[i], q = pos(o, 0); if (q.r < 18) continue;
        if (q.x < 0 || q.x > W || q.y < 0 || q.y > H) continue;
        const sm = Math.min(22, q.w * 14 * (p + .2)) * (o.h > .7 ? 1 : .4);
        if (sm > 4) { // motion smear along the orbit
          const tx = -Math.sin(q.th), ty = Math.cos(q.th) * .8;
          c.fillRect(q.x - tx * sm * .5 - 1.5, q.y - ty * sm * .5 - 1.5, 3 + Math.abs(tx) * sm, 3 + Math.abs(ty) * sm);
        } else c.fillRect(q.x - 1.5, q.y - 1.5, 3, 3);
      }
    }
    c.restore();
    // arm streaks: three log-spiral ribbons, the vortex's readable shape
    c.save(); c.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      c.beginPath();
      for (let j = 0; j <= 60; j++) {
        const r0 = 60 * Math.pow(1500 / 60, j / 60), q = pos({ r: r0, th: k * TAU / 3 + V.arm(r0) }, .5);
        j ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y);
      }
      c.strokeStyle = k === 0 ? C.CLAY : k === 1 ? C.TEAL : C.SPARK; c.globalAlpha = .28; c.lineWidth = 26 * Z; c.stroke();
      c.globalAlpha = .5; c.lineWidth = 5; c.stroke();
    }
    c.restore();
    for (const o of V.mid) {
      const q = pos(o, .5); if (q.r < 24 || q.x < -20 || q.x > W + 20 || q.y < -20 || q.y > H + 20) continue;
      const kind = o.h < .6 ? 'lit' : o.h < .8 ? 'happy' : 'dark';
      blitFace(c, kind, q.x, q.y, 5 * Z * (.7 + o.s * .6), q.th + Math.PI / 2, .8);
    }
    // the core: halftone rings that tighten toward the blow-up
    c.save();
    const cr = 90 + 260 * E.in3(p);
    for (let i = 3; i >= 0; i--) { c.beginPath(); c.arc(CORE[0], CORE[1], cr * (1 + i * .45), 0, TAU); c.fillStyle = dots(c, i % 2 ? C.SPARK : C.PAPER, .12 + .12 * (3 - i) * (.5 + p), 12, 45); c.fill(); }
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
    debris(c, t, tau, Z);
    panel(c, t);
    spinLabel(c, t);
    // pause-bait, lower left
    c.save(); c.font = mono(28, 500); c.fillStyle = C.PAPER; c.globalAlpha = .75 * seg(u, 4 * F, 10 * F); c.textAlign = 'left'; c.fillText('finite-time blow-up (claimed)', 60, 980); c.restore();
    hud(c, t);
    // the blow-up: WHITE erupts from the core
    const b = seg(t, TW - F - 4 * F, TW - F);
    if (b > 0) {
      c.save(); c.fillStyle = C.WHITE;
      c.beginPath(); c.arc(CORE[0], CORE[1], 1300 * E.in3(b) + 30 * b, 0, TAU); c.fill();
      c.globalAlpha = .6 * b; c.lineWidth = 40; c.strokeStyle = C.WHITE; c.beginPath(); c.arc(CORE[0], CORE[1], 1300 * E.in2(b) + 160, 0, TAU); c.stroke();
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
    const was = [['yes', .61], ['no', .24], ['wait', .1], ['hi', .05]];
    for (let k = 0; k < 4; k++) {
      const ry = y0 + 172 + k * 72, v = lerp(was[k][1], .25, flat), bw = (PAN.w - 64) * v / .61 * lerp(1, .61 / .25 * .62, flat);
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
      c.save(); c.translate(x, y); c.rotate(ang + Math.PI / 2 + (k - 1) * .3 + a * .6); c.scale(s, s); c.globalAlpha = clamp(a * 6) * clamp((1 - a) * 5);
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
    const wx = 1060 + noise1(t * 2, 4) * 3, wy = 640;
    // the cable runs off-frame toward Opus (still plugged in)
    coil(c, [-60, 760], [950, 612], 170, t, { turns: 12, rad: 12, outline: C.INK, core: C.CLAY_DARK, w: 5, ow: 3 });
    stickHandUp(c, wx, wy, -.22, 150, 1, t, { col: C.INK, lw: 5, from: [1990, 1100], part: 'back' });
    // the note, turned away (its back: no text)
    c.save(); c.translate(1030, 470); c.rotate(.18); c.fillStyle = C.YELLOW; c.beginPath(); c.moveTo(0, 0); c.lineTo(250, -16); c.lineTo(262, -186); c.lineTo(14, -170); c.closePath(); c.fill(); c.lineWidth = 3; c.strokeStyle = C.INK; c.stroke(); c.restore();
    keycap(c, wx + 30, wy - 70, 190, { glow: .9 + .1 * Math.sin(a * 20), rot: -.05 });
    stickHandUp(c, wx, wy, -.22, 150, 1, t, { col: C.INK, lw: 5, part: 'front' });
  }

  // ------------------------------------------------------------------ scenes
  scene('S32_guess_what_comes_next', T61, T63 - F, (X, t) => viaCPU(X, c => paintS32(c, t)));
  scene('S33_check_my_work', T63 - F, T64 - F, (X, t) => viaCPU(X, c => paintS33(c, t)));
  scene('S34_singularity', T64 - F, TW - F, (X, t) => viaCPU(X, c => paintS34(c, t)));
  scene('S35_white', TW - F, T65, (X, t) => viaCPU(X, c => paintS35(c, t)));
})();
