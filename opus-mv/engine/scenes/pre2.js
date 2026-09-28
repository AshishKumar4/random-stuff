// pre2.js: PRE-CHORUS 2, bars 37–40 (67.50–75.00). BIBLE §8 "PRE-CHORUS 2"; SHOTLIST B rows S20–S21.
//   S20a  bar 37 b1 → bar 38 b2: the birth certificate THUNKs onto the page (the INK prints out from under it),
//         pelican-on-a-bicycle baby photo, TUE circled on "Tuesday", RED stamp VIBE CHECK: / PASSED ✓ on
//         "vibe-checked", snap zoom onto the stamp on bar 38 b1.
//   S20b  bar 38 b2 → bar 39 b2: smash cut to the eval set (6 WEEKS EARLIER): the RED TEAM · TAKE 36 slate claps
//         on the cut, RED EVAL tally light, slow dolly in to an MCU (R 200); Opus's eyes flick to the lens, the head
//         follows, it squints, mitten to chin: "I think you're testing me." streams into a reply plate (mono 96).
//   S21   bar 39 b2 → bar 40: deploy. The frame subdivides 1 → 4 → 16 → 64 → 256 chats on the beats (budding
//         splits, a diagonal ripple of t − offset), under a CLAY band REMEMBERS YOU: ▮ … sort of* (+ footnote);
//         the band leaves on bar 40 b3; on the gap beat (bar 40 b4) all 256 freeze and stare into the lens.
// Every frame is a pure function of t, painted into CPU canvases (willReadFrequently) and uploaded once.
(() => {
  const F = 1 / 30, BEAT = 60 / 128, BAR = 4 * BEAT;
  const bt = (bar, beat = 1) => (bar - 1) * BAR + (beat - 1) * BEAT;
  const T0 = bt(37) - F;                 // hard cut in (1 frame before bar 37 b1): the certificate impact frame
  const T_SNAP = bt(38, 1) - F;          // snap zoom onto the stamp
  const T_FB = bt(38, 2) - F;            // smash cut: the eval flashback
  const T_21 = bt(39, 2) - F;            // S21: the split begins
  const SPL = [bt(39, 2), bt(39, 3), bt(39, 4), bt(40, 1), bt(40, 2)].map(v => v - F);
  const T_SORT = bt(39, 4) - F;          // "sort of*" lands after a one-beat hedge
  const T_BOUT = bt(40, 3) - F;          // the band leaves
  const T_FRZ = bt(40, 4) - F;           // the gap beat: freeze, all look at the lens
  const T_END = bt(41) - F;
  const EDGE = 37;                       // static flood-edge seed for this section
  const CHAPTERS = [10.3, 11.25, 15.0, 22.5, 52.5, 56.25, 67.5, 69.84, 71.72, 112.5, 120.0];
  const contextFill = t => lerp(.01, .51, (t - 29.06) / (75 - 29.06));

  // ------------------------------------------------------------------ CPU canvases (10-70x faster than GPU ones here)
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
  function halftone(ctx, color, density = .5, cell = 10, angle = 45) {
    const key = `${color}|${Math.round(density * 60)}|${cell}|${angle}|${G.scale}`;
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
    const Fr = layer('p2_frame');
    fn(Fr);
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(layerCanvas('p2_frame'), 0, 0); X.restore();
  }
  const blinkF = (t, t0) => { const d = (t - t0) * 30; if (d < 0 || d >= 7) return 0; if (d < 2) return d / 2; if (d < 4) return 1; return 1 - (d - 4) / 3; };
  const heroFont = (ctx, size, st = 'cond', wt = 900) => { ctx.font = `${wt} ${size}px ${FONTS.hero}`; ctx.fontStretch = STRETCH[st] || st; ctx.letterSpacing = (-0.03 * size) + 'px'; };
  const resetFont = ctx => { ctx.fontStretch = 'normal'; ctx.letterSpacing = '0px'; };

  // ------------------------------------------------------------------ lyric timing (locks onto sung onsets)
  let _tm = null;
  function TM() {
    if (_tm) return _tm;
    const tue = wordOnset('Tuesday', bt(37, 1.5), bt(37, 2.7), bt(37, 2));
    const vibe = wordOnset('vibe-checked', bt(37, 2.5), bt(37, 3.7), bt(37, 3));
    _tm = { tue: tue - F, stamp: vibe - 2 * F };
    return _tm;
  }
  function hud(Fr, t) {
    let cur = -1; CHAPTERS.forEach((s, i) => { if (t >= s) cur = i; });
    contextBar(Fr, contextFill(t), { ticks: CHAPTERS.map(s => s / 144), cur });
  }
  // lyric subtitle with an INK plate + PAPER rule (reads over busy pictures); y = baseline
  function lyric(Fr, t, y = 950, o = {}) {
    const L = lineAt(t, .12); if (!L) return;
    const a = clamp((t - (L.s - .07)) / .1) * clamp((L.e + .2 - t) / .07); if (a <= 0) return;
    const maxW = o.maxW || 1500;
    Fr.save(); Fr.font = mono(60, 500);
    const sp = Fr.measureText(' ').width, ws = (L.words && L.words.length) ? L.words.map(w => w.d || w.w) : [lineText(L)];
    const raw = ws.reduce((p, s) => p + Fr.measureText(s).width, 0) + sp * (ws.length - 1), sc = Math.min(1, maxW / raw), tw = raw * sc;
    const cx = o.x0 !== undefined ? o.x0 + 30 + tw / 2 : 960;
    Fr.globalAlpha = a; rr(Fr, cx - tw / 2 - 30, y - 58 * sc, tw + 60, 82 * sc, 12); Fr.fillStyle = C.INK; Fr.fill();
    Fr.lineWidth = 3; Fr.strokeStyle = rgba(C.PAPER, .55); Fr.stroke(); Fr.restore();
    subtitle(Fr, L, t, { y, x: cx, size: 60, color: C.PAPER, hold: .2, maxW });
  }

  // ------------------------------------------------------------------ Opus straight into the CPU frame, with die-cut keylines
  function opusCPU(Fr, x, y, R, st) {
    const S = mergeState(st);
    const m = Fr.getTransform(), sc = G.scale, cw = Math.round(W * sc), ch = Math.round(H * sc);
    const zoom = Math.hypot(m.a, m.b) / sc;
    const kr = Math.max(3, .035 * R + 1.5) * zoom * sc;
    const cs = [[x - 3.4 * R, y - 9.9 * R], [x + 3.4 * R, y - 9.9 * R], [x + 3.4 * R, y + .8 * R], [x - 3.4 * R, y + .8 * R]].map(p => new DOMPoint(p[0], p[1]).matrixTransform(m));
    const bx0 = clamp(Math.floor(Math.min(...cs.map(p => p.x)) - kr - 4), 0, cw), by0 = clamp(Math.floor(Math.min(...cs.map(p => p.y)) - kr - 4), 0, ch);
    const bx1 = clamp(Math.ceil(Math.max(...cs.map(p => p.x)) + kr + 4), 0, cw), by1 = clamp(Math.ceil(Math.max(...cs.map(p => p.y)) + kr + 4), 0, ch);
    const bw = bx1 - bx0, bh = by1 - by0; if (bw <= 0 || bh <= 0) return;
    const raw = layer('p2_oraw'), T = layer('p2_otint');
    raw.save(); raw.setTransform(m); raw.translate(x, y); drawOpusBody(raw, R, S); raw.restore();
    const rc = layerCanvas('p2_oraw'), tc = layerCanvas('p2_otint');
    T.save(); T.setTransform(1, 0, 0, 1, 0, 0); T.drawImage(rc, bx0, by0, bw, bh, bx0, by0, bw, bh);
    T.globalCompositeOperation = 'source-in'; T.fillStyle = C.PAPER; T.fillRect(bx0, by0, bw, bh); T.restore();
    Fr.save(); Fr.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; Fr.drawImage(tc, bx0, by0, bw, bh, bx0 + Math.cos(a) * kr, by0 + Math.sin(a) * kr, bw, bh); }
    Fr.drawImage(rc, bx0, by0, bw, bh, bx0, by0, bw, bh);
    Fr.restore();
  }

  // ================================================================== S20a: THE BIRTH CERTIFICATE
  const CW = 1320, CH = 760;             // card size (card-local px)
  const CARD_C = [960, 468];
  const STAMP_C = [941, 592];            // card-local stamp centre (lands in the OFFICIAL USE box)
  const TUE_C = [634, 346];              // card-local centre of the circled TUE
  let _card = null;
  function drawPelicanPhoto(x, w, h) {
    // a pelican riding a bicycle, drawn slightly wrong (wheels of two sizes, chain to the front hub,
    // floating saddle, feet that miss the pedals, the handlebar through its neck)
    x.save();
    x.fillStyle = C.PAPER; x.fillRect(0, 0, w, h);
    x.fillStyle = halftone(x, C.CLAY, .2, 9, 45); x.fillRect(0, 0, w, h);                       // sepia sky
    x.fillStyle = halftone(x, C.CLAY_DARK, .5, 9, 45); x.fillRect(0, 330, w, h - 330);          // road
    x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = C.INK;
    x.lineWidth = 4; x.beginPath(); x.moveTo(0, 330); x.lineTo(w, 330); x.stroke();
    const RW = [120, 262, 68], FW = [304, 276, 54], BB = [192, 276], ST = [168, 184], HT_ = [284, 172], HB = [292, 204];
    const wheel = ([cx, cy, r], n, seed) => {
      x.lineWidth = 2.5; for (let i = 0; i < n; i++) { const a = i / n * TAU + hash(seed + i) * .5; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); x.stroke(); }
      x.lineWidth = 8; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.stroke();
      x.fillStyle = C.INK; x.beginPath(); x.arc(cx, cy, 6, 0, TAU); x.fill();
    };
    wheel(RW, 6, 3); wheel(FW, 9, 11);
    // chain: from the cranks to the FRONT hub (wrong)
    x.save(); x.setLineDash([6, 5]); x.lineWidth = 3; x.beginPath(); x.ellipse((BB[0] + FW[0]) / 2, (BB[1] + FW[1]) / 2, (FW[0] - BB[0]) / 2 + 12, 14, .05, 0, TAU); x.stroke(); x.restore();
    // frame (CLAY tubes, INK line)
    const tubeL = (a, b) => { x.lineWidth = 11; x.strokeStyle = C.INK; x.beginPath(); x.moveTo(...a); x.lineTo(...b); x.stroke(); x.lineWidth = 5; x.strokeStyle = C.CLAY; x.beginPath(); x.moveTo(...a); x.lineTo(...b); x.stroke(); };
    tubeL([RW[0], RW[1]], BB); tubeL([RW[0], RW[1]], ST); tubeL(ST, BB); tubeL(ST, HT_); tubeL(BB, HB); tubeL(HB, [FW[0], FW[1]]); tubeL(HT_, HB);
    // cranks + pedals
    x.strokeStyle = C.INK; x.lineWidth = 5; x.beginPath(); x.moveTo(BB[0] - 20, BB[1] - 26); x.lineTo(BB[0] + 22, BB[1] + 28); x.stroke();
    x.fillStyle = C.INK; x.fillRect(BB[0] + 10, BB[1] + 26, 26, 7); x.fillRect(BB[0] - 34, BB[1] - 30, 26, 7);
    // floating saddle (no seat post)
    x.fillStyle = C.INK; rr(x, ST[0] - 30, ST[1] - 30, 56, 13, 6); x.fill(); x.lineWidth = 3; x.stroke();
    // pelican body
    x.save(); x.translate(186, 122); x.rotate(-.18);
    x.fillStyle = C.PAPER; x.lineWidth = 5; x.beginPath(); x.ellipse(0, 0, 70, 44, 0, 0, TAU); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(-70, -4); x.lineTo(-104, -18); x.lineTo(-92, 10); x.closePath(); x.fill(); x.stroke();                 // tail
    x.lineWidth = 4; x.beginPath(); x.moveTo(-40, -12); x.quadraticCurveTo(0, -30, 34, -6); x.quadraticCurveTo(4, 14, -40, -12); x.stroke(); // wing
    x.restore();
    // legs + webbed feet (one dangles, one hooks the down tube: neither on a pedal)
    x.strokeStyle = C.INK; x.lineWidth = 4;
    x.beginPath(); x.moveTo(170, 160); x.lineTo(166, 214); x.stroke();
    x.beginPath(); x.moveTo(206, 156); x.quadraticCurveTo(236, 186, 246, 222); x.stroke();
    x.fillStyle = C.CLAY; x.lineWidth = 3;
    x.beginPath(); x.moveTo(166, 212); x.lineTo(150, 230); x.lineTo(182, 228); x.closePath(); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(246, 220); x.lineTo(236, 240); x.lineTo(262, 234); x.closePath(); x.fill(); x.stroke();
    // neck (thick S) + head
    const neck = () => { x.beginPath(); x.moveTo(226, 104); x.bezierCurveTo(262, 88, 226, 58, 262, 42); };
    x.lineWidth = 36; x.strokeStyle = C.INK; neck(); x.stroke(); x.lineWidth = 27; x.strokeStyle = C.PAPER; neck(); x.stroke();
    // handlebar straight through the neck (wrong)
    x.strokeStyle = C.INK; x.lineWidth = 6; x.beginPath(); x.moveTo(HT_[0], HT_[1]); x.lineTo(262, 106); x.lineTo(234, 90); x.stroke();
    x.fillStyle = C.PAPER; x.lineWidth = 5; x.strokeStyle = C.INK; x.beginPath(); x.arc(266, 40, 24, 0, TAU); x.fill(); x.stroke();
    // beak: SPARK upper mandible, CLAY pouch
    x.lineWidth = 4;
    x.fillStyle = C.CLAY; x.beginPath(); x.moveTo(284, 50); x.quadraticCurveTo(318, 104, 392, 70); x.lineTo(286, 44); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = C.CLAY_DARK; x.beginPath(); x.moveTo(284, 30); x.lineTo(398, 64); x.lineTo(286, 48); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = C.INK; x.beginPath(); x.arc(272, 32, 5, 0, TAU); x.fill();
    x.lineWidth = 3; x.beginPath(); x.moveTo(250, 18); x.quadraticCurveTo(252, 4, 262, 2); x.stroke();                      // crest tuft
    x.restore();
  }
  function card() {
    if (_card && _card.sc === G.scale) return _card;
    const ss = G.scale * 1.5, c = cpuCanvas(CW * ss, CH * ss), x = cx2d(c);
    x.setTransform(ss, 0, 0, ss, 0, 0); x.lineCap = 'round'; x.lineJoin = 'round';
    // card
    rr(x, 0, 0, CW, CH, 12); x.fillStyle = C.PAPER; x.fill();
    // guilloche security border (CLAY), rules, microprint
    x.save(); rr(x, 0, 0, CW, CH, 12); x.clip();
    x.strokeStyle = C.CLAY; x.lineWidth = 3; rr(x, 18, 18, CW - 36, CH - 36, 8); x.stroke();
    x.lineWidth = 2; rr(x, 52, 52, CW - 104, CH - 104, 6); x.stroke();
    const side = (x0, y0, x1, y1, ph) => {
      const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len, nx = -uy, ny = ux;
      for (const [A, lam, p] of [[9, 26, 0], [9, 26, Math.PI], [5, 39, ph]]) {
        x.beginPath();
        for (let s = 0; s <= len; s += 3) { const o = A * Math.sin(s / lam * TAU + p); const px = x0 + ux * s + nx * o, py = y0 + uy * s + ny * o; s ? x.lineTo(px, py) : x.moveTo(px, py); }
        x.lineWidth = 2; x.stroke();
      }
    };
    side(35, 35, CW - 35, 35, 1); side(CW - 35, 35, CW - 35, CH - 35, 2); side(CW - 35, CH - 35, 35, CH - 35, 3); side(35, CH - 35, 35, 35, 4);
    const rosette = (cx, cy, r) => { x.save(); x.translate(cx, cy); x.fillStyle = C.CLAY; for (let i = 0; i < 8; i++) { x.save(); x.rotate(i / 8 * Math.PI); rr(x, -r, -r * .2, r * 2, r * .4, r * .2); x.fill(); x.restore(); } x.fillStyle = C.PAPER; x.beginPath(); x.arc(0, 0, r * .3, 0, TAU); x.fill(); x.restore(); };
    for (const [cx, cy] of [[35, 35], [CW - 35, 35], [CW - 35, CH - 35], [35, CH - 35]]) rosette(cx, cy, 22);
    x.font = `600 11px ${FONTS.mono}`; x.fillStyle = rgba(C.INK, .45);
    const micro = 'CLAUDE-OPUS-5-5 · BORN TUESDAY · '.repeat(12);
    x.save(); x.beginPath(); x.rect(62, 0, CW - 124, CH); x.clip(); x.fillText(micro, 64, 64); x.fillText(micro, 64, CH - 57); x.restore();
    x.restore();
    // title
    heroFont(x, 50, 'exp', 800); x.letterSpacing = '5px'; x.fillStyle = C.INK; x.textAlign = 'center';
    x.fillText('CERTIFICATE OF BIRTH', CW / 2, 132); resetFont(x);
    x.strokeStyle = C.CLAY; x.lineWidth = 3; x.beginPath(); x.moveTo(240, 158); x.lineTo(CW / 2 - 34, 158); x.moveTo(CW / 2 + 34, 158); x.lineTo(CW - 240, 158); x.stroke();
    rosette(CW / 2, 158, 14);
    // photo (mounted, tilted)
    x.save(); x.translate(284, 376); x.rotate(-.045);
    x.fillStyle = rgba(C.INK, .18); x.fillRect(-194, -186, 404, 390);
    x.fillStyle = C.PAPER; x.fillRect(-202, -194, 404, 388); x.strokeStyle = C.INK; x.lineWidth = 4; x.strokeRect(-202, -194, 404, 388);
    x.save(); x.translate(-187, -179); x.beginPath(); x.rect(0, 0, 374, 358); x.clip(); x.scale(374 / 410, 358 / 394); drawPelicanPhoto(x, 410, 394); x.restore();
    x.lineWidth = 3; x.strokeRect(-187, -179, 374, 358);
    x.fillStyle = C.INK; for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { x.beginPath(); x.moveTo(sx * 204, sy * 196); x.lineTo(sx * 204 - sx * 48, sy * 196); x.lineTo(sx * 204, sy * 196 - sy * 48); x.closePath(); x.fill(); }
    x.restore();
    // seal: scalloped CLAY rosette with ribbons, overlapping the photo corner
    x.save(); x.translate(478, 530); x.scale(.88, .88);
    x.fillStyle = C.CLAY_DARK; x.strokeStyle = C.INK; x.lineWidth = 3;
    for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * 10, 20); x.lineTo(s * 36, 88); x.lineTo(s * 24, 80); x.lineTo(s * 14, 94); x.lineTo(s * -8, 30); x.closePath(); x.fill(); x.stroke(); }
    x.beginPath(); for (let i = 0; i <= 96; i++) { const a = i / 96 * TAU, r = 64 + (i % 4 < 2 ? 5 : 0); i ? x.lineTo(Math.cos(a) * r, Math.sin(a) * r) : x.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    x.closePath(); x.fillStyle = C.CLAY; x.fill(); x.stroke();
    x.lineWidth = 3; x.strokeStyle = C.PAPER; x.beginPath(); x.arc(0, 0, 50, 0, TAU); x.stroke();
    x.fillStyle = C.PAPER; for (let i = 0; i < 6; i++) { x.save(); x.rotate(i / 6 * Math.PI); rr(x, -32, -6.5, 64, 13, 6.5); x.fill(); x.restore(); }
    x.restore();
    // fields
    const cap = (s, px, py) => { heroFont(x, 22, 'semiexp', 700); x.letterSpacing = '3px'; x.fillStyle = rgba(C.INK, .62); x.textAlign = 'left'; x.fillText(s, px, py); resetFont(x); };
    const val = (s, px, py, size, wt = 600) => { x.font = mono(size, wt); x.fillStyle = C.INK; x.textAlign = 'left'; x.fillText(s, px, py); };
    const dots = (x0, x1, py) => { x.fillStyle = rgba(C.INK, .4); for (let px = x0; px < x1; px += 9) x.fillRect(px, py, 3, 3); };
    cap('NAME', 600, 208); val('claude-opus-5-5', 600, 266, 60, 700); dots(600, 1250, 282);
    cap('DATE OF BIRTH', 600, 322); val('TUE 2026-09-22', 600, 360, 38); dots(600, 960, 374);
    cap('CONTEXT', 1010, 322); val('1,000,000', 1010, 360, 38); dots(1010, 1250, 374);
    cap('KNOWLEDGE CUTOFF', 600, 414); val('JUN 2026', 600, 452, 38); dots(600, 960, 466);
    cap('FOOTPRINTS', 1010, 414);
    // the OFFICIAL USE box the stamp lands in
    x.save(); x.setLineDash([10, 7]); x.lineWidth = 2.5; x.strokeStyle = rgba(C.INK, .38); rr(x, 616, 494, 646, 202, 10); x.stroke(); x.restore();
    heroFont(x, 17, 'semiexp', 700); x.letterSpacing = '3px'; x.fillStyle = rgba(C.INK, .45); x.textAlign = 'left'; x.fillText('FOR OFFICIAL USE ONLY', 634, 520); resetFont(x);
    // two boot-sole prints (Opus's chunky platforms), stamped in CLAY
    for (const [fx, rot] of [[1070, -.12], [1150, .1]]) {
      x.save(); x.translate(fx, 446); x.rotate(rot); x.scale(.72, .72); x.fillStyle = C.CLAY;
      rr(x, -26, -44, 52, 58, 20); x.fill(); rr(x, -22, 20, 44, 26, 12); x.fill();
      x.fillStyle = C.PAPER; for (let k = 0; k < 4; k++) x.fillRect(-18, -34 + k * 12, 36, 4);
      x.restore();
    }
    // fine print (pause-bait)
    x.font = mono(28, 500); x.fillStyle = rgba(C.INK, .78); x.textAlign = 'left';
    x.fillText("tuesday's child is full of grace", 72, 648);
    x.fillText('words retired: load-bearing, —', 72, 684);
    _card = { c, sc: G.scale, ss };
    return _card;
  }
  // the rubber stamp (2 lines, double border, starved-ink speckle), pre-rendered once
  let _stamp = null;
  function stampTex() {
    if (_stamp && _stamp.sc === G.scale) return _stamp;
    const ss = G.scale * 1.5, tmp = G.X;
    heroFont(tmp, 96, 'cond'); const wV = tmp.measureText('VIBE').width, wC = tmp.measureText('CHECK:').width, w2 = tmp.measureText('PASSED').width; resetFont(tmp);
    const sp = 30, w1 = wV + sp + wC, chk = 86, gap = 26, row2 = w2 + gap + chk;
    const iw = Math.max(w1, row2), pw = iw + 2 * 44, ph = 66 * 2 + 40 + 2 * 30;
    const c = cpuCanvas((pw + 20) * ss, (ph + 20) * ss), x = cx2d(c);
    x.setTransform(ss, 0, 0, ss, 10 * ss, 10 * ss);
    x.strokeStyle = C.RED; x.fillStyle = C.RED; x.lineJoin = 'round'; x.lineCap = 'round';
    x.lineWidth = 8; rr(x, 4, 4, pw - 8, ph - 8, 22); x.stroke();
    x.lineWidth = 3.5; rr(x, 17, 17, pw - 34, ph - 34, 14); x.stroke();
    heroFont(x, 96, 'cond'); x.textAlign = 'left';
    const r1x = pw / 2 - w1 / 2, y1 = 30 + 66 + 6, y2 = y1 + 66 + 40;
    x.fillText('VIBE', r1x, y1); x.fillText('CHECK:', r1x + wV + sp, y1);
    const r2x = pw / 2 - row2 / 2;
    x.fillText('PASSED', r2x, y2); resetFont(x);
    // the ✓ (vector glyph in its own cell, like drawRich, but at the stamp's weight)
    const cxk = r2x + w2 + gap + chk / 2, cyk = y2 - 33;
    x.lineWidth = 17; x.beginPath(); x.moveTo(cxk - 34, cyk + 2); x.lineTo(cxk - 10, cyk + 28); x.lineTo(cxk + 38, cyk - 34); x.stroke();
    // starved ink: speckles, streaks, soft patches knocked out
    const R = rng('p2stamp');
    x.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 520; i++) { x.globalAlpha = .55 + R() * .45; x.beginPath(); x.arc(R() * pw, R() * ph, .5 + R() * R() * 2.2, 0, TAU); x.fill(); }
    x.lineWidth = 1.2; for (let i = 0; i < 22; i++) { x.globalAlpha = .3 + R() * .35; const px = R() * pw, py = R() * ph, a = -.2 + R() * .4; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * (10 + R() * 40), py + Math.sin(a) * (10 + R() * 40)); x.stroke(); }
    for (let i = 0; i < 7; i++) { x.globalAlpha = .08 + R() * .12; x.beginPath(); x.ellipse(R() * pw, R() * ph, 20 + R() * 60, 10 + R() * 30, R() * 3, 0, TAU); x.fill(); }
    _stamp = { c, sc: G.scale, ss, w: pw + 20, h: ph + 20 };
    return _stamp;
  }
  function cardM(t, tm) {
    const a = (t - T0) * 30, sq = Math.exp(-a / 2);
    const s = 1 - .032 * Math.exp(-a / 2.6) * Math.cos(a * 1.05);
    const rot = -2 + 1.8 * Math.exp(-a / 3) * Math.cos(a * .9);
    const ps = t >= tm.stamp ? Math.exp(-(t - tm.stamp) * 30 / 2.5) : 0;
    return new DOMMatrix().translate(CARD_C[0], CARD_C[1] + 5 * ps).rotate(rot).scale(s * (1 + .02 * sq) * (1 - .012 * ps), s * (1 - .035 * sq) * (1 - .012 * ps)).translate(-CW / 2, -CH / 2);
  }
  function paintS20a(Fr, t) {
    const tm = TM(), a = (t - T0) * 30;
    // ground: the certificate lands on the paper and the INK prints out from under it (5 frames)
    if (a < 5) {
      Fr.fillStyle = C.PAPER; Fr.fillRect(0, 0, W, H);
      const k = E.out3(clamp((a + 1) / 6)); Fr.fillStyle = C.INK;
      if (floodPath(Fr, lerp(330, 16, k), EDGE, 3)) Fr.fill();
    } else { Fr.fillStyle = C.INK; Fr.fillRect(0, 0, W, H); }
    // camera: slow push, punches on the hits, one snap zoom onto the stamp
    const M = cardM(t, tm);
    const sp = M.transformPoint(new DOMPoint(STAMP_C[0], STAMP_C[1]));
    const sk = clamp((t - T_SNAP) * 30 / 4);
    const zs = t >= T_SNAP ? lerp(1, 1.3, E.back(sk, 1.5)) : 1;
    const drift = 1 + .03 * clamp((t - T0) / (T_FB - T0));
    const kick = .035 * Math.exp(-a / 3) + (t > tm.tue ? .012 * Math.exp(-(t - tm.tue) * 12) : 0) + (t > tm.stamp ? .03 * Math.exp(-(t - tm.stamp) * 10) : 0) + (t > bt(37, 4) - F ? .018 * Math.exp(-(t - bt(37, 4) + F) * 11) : 0);
    const z = drift * zs * (1 + kick);
    const ck = t >= T_SNAP ? E.outExpo(sk) * .95 : 0;
    const camX = lerp(960, sp.x, ck), camY = lerp(540, sp.y, ck);
    const trauma = 11 * Math.exp(-a / 3.5) + (t > tm.stamp ? 8 * Math.exp(-(t - tm.stamp) * 30 / 4) : 0);
    const [shx, shy] = shake(t, trauma, 37, 26);
    Fr.save(); Fr.translate(shx, shy); cam(Fr, camX, camY, z);
    const K = card();
    // smear ghosts on the impact frames (it fell from the camera)
    if (a < 1) for (const [gs, ga] of [[1.12, .16]]) {
      Fr.save(); Fr.translate(CARD_C[0], CARD_C[1]); Fr.scale(gs, gs); Fr.translate(-CARD_C[0], -CARD_C[1]);
      Fr.setTransform(Fr.getTransform().multiply(M)); Fr.globalAlpha = ga; Fr.drawImage(K.c, 0, 0, CW, CH); Fr.restore();
    }
    Fr.save(); Fr.setTransform(Fr.getTransform().multiply(M));
    Fr.drawImage(K.c, 0, 0, CW, CH);
    // "Tuesday": a RED marker loop around TUE
    const lk = E.out2(clamp((t - tm.tue) * 30 / 7));
    if (lk > 0) {
      Fr.save(); Fr.strokeStyle = C.RED; Fr.lineWidth = 6.5; Fr.lineCap = 'round'; Fr.lineJoin = 'round'; Fr.beginPath();
      const n = 60, th0 = -2.7;
      for (let i = 0; i <= n * lk; i++) { const u = i / n, th = th0 + u * (TAU + .55), r = 1 + .05 * Math.sin(u * 9) + .07 * u; const px = TUE_C[0] + 58 * r * Math.cos(th) + u * 6, py = TUE_C[1] + 29 * r * Math.sin(th) - u * 3; i ? Fr.lineTo(px, py) : Fr.moveTo(px, py); }
      Fr.stroke(); Fr.restore();
    }
    // the stamp
    const sa = t - tm.stamp;
    if (sa >= 0) {
      const S = stampTex();
      const k1 = clamp(sa / .1);
      const s = sa < .1 ? lerp(1.9, .95, E.outExpo(k1)) : 1 - .05 * Math.exp(-14 * (sa - .1)) * Math.cos((sa - .1) * 32);
      const draw = (sc, al) => { Fr.save(); Fr.globalAlpha = al; Fr.translate(STAMP_C[0], STAMP_C[1]); Fr.rotate(-5 * Math.PI / 180); Fr.scale(sc, sc); Fr.drawImage(S.c, -S.w / 2, -S.h / 2, S.w, S.h); Fr.restore(); };
      Fr.save(); rr(Fr, 0, 0, CW, CH, 12); Fr.clip();
      if (sa < .15) { draw(s * 1.3, .22 * (1 - sa / .15)); draw(s * 1.65, .1 * (1 - sa / .15)); }
      draw(s, clamp(sa / .034 + .35));
      // ink specks thrown out by the impact
      if (sa < .5) {
        const R = rng('p2specks'); Fr.fillStyle = C.RED;
        for (let i = 0; i < 16; i++) {
          const ang = R() * TAU, d0 = 260 + R() * 120, d = d0 + E.out3(clamp(sa / .18)) * (40 + R() * 90), rad = 2.5 + R() * 5;
          Fr.globalAlpha = clamp(1 - (sa - .25) / .25) * .9; Fr.beginPath(); Fr.ellipse(STAMP_C[0] + Math.cos(ang) * d * 1.15, STAMP_C[1] + Math.sin(ang) * d * .5, rad, rad * .8, ang, 0, TAU); Fr.fill();
        }
      }
      Fr.restore();
    }
    Fr.restore();
    // paper scraps kicked up by the THUNK (world space around the card edge)
    if (a < 16) {
      const R = rng('p2scraps');
      for (let i = 0; i < 12; i++) {
        const side = R(), ex = side < .5 ? (R() < .5 ? 300 : 1620) : 300 + R() * 1320, ey = side < .5 ? 90 + R() * 760 : (R() < .5 ? 90 : 850);
        const vx = (ex - 960) * (.4 + R() * .6) / 20, vy = (ey - 470) * (.3 + R() * .5) / 20 - 6, age = a;
        const px = ex + vx * age, py = ey + vy * age + .6 * age * age, rot = R() * 6 + age * (R() - .5) * .6, sz = 6 + R() * 10;
        Fr.save(); Fr.globalAlpha = clamp(1 - age / 16); Fr.translate(px, py); Fr.rotate(rot); Fr.fillStyle = i % 3 ? C.PAPER : C.CLAY;
        Fr.fillRect(-sz / 2, -sz * .35, sz, sz * .7); Fr.restore();
      }
    }
    Fr.restore();
    lyric(Fr, t, 950);
    hud(Fr, t);
  }

  // ================================================================== S20b: THE EVAL FLASHBACK
  const OP = { x: 1250, R: 200, headY: 600 };
  const EVAL_Y = 46, STEN_Y = 318;       // the tally light hangs lower than before: the top-left slot is the lyric's
  OP.sole = OP.headY + 5.72 * OP.R;
  const ANC = [1250, 612];
  let _spot = null, _eval = null, _stencil = null;
  function spotTex() { // halftone spotlight on the cyc behind Opus (static)
    if (_spot && _spot.sc === G.scale) return _spot;
    const c = cpuCanvas(W * G.scale, H * G.scale), x = cx2d(c); x.setTransform(G.scale, 0, 0, G.scale, 0, 0);
    for (let k = 7; k >= 1; k--) { x.beginPath(); x.ellipse(1250, 560, 150 * k, 128 * k, 0, 0, TAU); x.fillStyle = halftone(x, C.PAPER, .2 * Math.pow(1 - k / 8, 1.4), 14, 45); x.fill(); }
    _spot = { c, sc: G.scale }; return _spot;
  }
  function evalTex() { // the RED EVAL tally light with its halftone glow
    if (_eval && _eval.sc === G.scale) return _eval;
    const pw = 560, ph = 400, ss = G.scale, c = cpuCanvas(pw * ss, ph * ss), x = cx2d(c); x.setTransform(ss, 0, 0, ss, 0, 0);
    const bx = 145, by = 150, bw = 270, bh = 100;
    for (let k = 6; k >= 1; k--) { rr(x, bx - 24 * k, by - 24 * k, bw + 48 * k, bh + 48 * k, 30 + 20 * k); x.fillStyle = halftone(x, C.RED, .5 * Math.pow(1 - k / 7, 1.6), 12, 45); x.fill(); }
    x.fillStyle = C.RED; rr(x, bx, by, bw, bh, 18); x.fill(); x.lineWidth = 5; x.strokeStyle = C.PAPER; x.stroke();
    x.fillStyle = C.PAPER; x.beginPath(); x.arc(bx + 44, by + bh / 2, 13, 0, TAU); x.fill();
    heroFont(x, 60, 'semiexp'); x.textAlign = 'left'; x.fillText('EVAL', bx + 74, by + bh / 2 + 21); resetFont(x);
    _eval = { c, sc: G.scale, pw, ph, bx, by, bw }; return _eval;
  }
  function stencilTex() { // "(6 WEEKS EARLIER)", stencil bridges + overspray
    if (_stencil && _stencil.sc === G.scale) return _stencil;
    const str = '(6 WEEKS EARLIER)', size = 38, ss = G.scale * 1.25, tmp = G.X;
    heroFont(tmp, size, 'normal'); tmp.letterSpacing = '3px'; const tw = tmp.measureText(str).width; resetFont(tmp);
    const pw = tw + 40, ph = size + 40, c = cpuCanvas(pw * ss, ph * ss), x = cx2d(c); x.setTransform(ss, 0, 0, ss, 0, 0);
    x.fillStyle = halftone(x, C.PAPER, .06, 6, 45); x.fillRect(4, 8, pw - 8, ph - 16);
    heroFont(x, size, 'normal'); x.letterSpacing = '3px'; x.fillStyle = C.PAPER; x.textAlign = 'left'; x.fillText(str, 20, 20 + size * .72 + 2);
    // vertical bridges through each glyph
    x.globalCompositeOperation = 'destination-out';
    let px = 20;
    for (const ch of str) { const w = x.measureText(ch).width; if (/[A-HJ-Z02-9]/.test(ch)) x.fillRect(px + (w - 3) / 2 - 1, 14, 3.5, size); px += w; }
    resetFont(x);
    _stencil = { c, sc: G.scale, pw, ph }; return _stencil;
  }
  const TOK = ['I', ' think', ' you', "'re", ' testing', ' me', '.'];
  const TOK0 = () => T_FB + 4 * F, TOKD = 3 * F;
  function turnAt(t) { const a = (t - T_FB) * 30; return lerp(-.75, 0, E.back(clamp((a - 2.5) / 6), 2.2)); }
  // the "roll safe" temple tap: the knowing gesture this rig can actually reach (a mitten on the chin cannot:
  // the chibi arm folds into a stick and reads as a microphone). Taps land 1 frame before bar 38 b3 and b4.
  const TAP1 = () => bt(38, 3) - F, TAP2 = () => bt(38, 4) - F;
  const HAND_REST = [.95, 2.75], HAND_TAP = [1.16, 5.72], HAND_LIFT = [1.3, 5.9];
  function tapArm(t) {
    const a1 = (t - TAP1()) * 30, a2 = (t - TAP2()) * 30;
    if (a1 < -7) { // anticipation: the hand sinks a touch before it rises
      const d = clamp((a1 + 11) / 4); return { hand: [HAND_REST[0], HAND_REST[1] - .22 * Math.sin(d * Math.PI)], type: 'mitten', k: 0 };
    }
    if (a1 < 0) { const k = E.back(clamp((a1 + 7) / 7), 1.9); return { hand: [lerp(HAND_REST[0], HAND_TAP[0], k), lerp(HAND_REST[1], HAND_TAP[1], k)], type: k > .55 ? 'point' : 'mitten', k }; }
    // lift and re-tap on b4 (finger bounces off the temple), then it stays there
    let lift = 0;
    if (a2 > -6 && a2 < 0) lift = Math.sin(clamp((a2 + 6) / 6) * Math.PI * .5) * (a2 > -2 ? (-a2 / 2) : 1);
    const rec = a1 < 3 ? .35 * Math.exp(-a1 / 1.2) * Math.sin(a1 * 1.6) : 0;          // recoil off the first tap
    return { hand: [lerp(HAND_TAP[0], HAND_LIFT[0], lift) + .05 * rec, lerp(HAND_TAP[1], HAND_LIFT[1], lift) + .04 * rec], type: 'point', k: 1 };
  }
  function fbOpus(t) {
    const a = (t - T_FB) * 30;
    const turnK = clamp((a - 2.5) / 6), turn = turnAt(t);
    const startle = a >= 1 ? Math.exp(-(a - 1) / 3) : 0;
    const sq = E.io2(clamp((a - 9) / 5));                          // the knowing squint settles in as the hand rises
    const tb = bt(39, 1) - 2 * F, wk = (t - tb) * 30;               // bar 39 b1: a wink at the lens
    const wink = wk >= 0 && wk < 7 ? 'R' : null;
    // lip flaps from the streamed tokens
    const ti = Math.floor((t - TOK0()) / TOKD);
    let mouth = 'rest';
    if (ti >= 0 && ti < TOK.length) mouth = TOK[ti] === '.' ? 'M' : visemeFor(TOK[ti], frac((t - TOK0()) / TOKD));
    else if (ti >= TOK.length) mouth = ':3';
    const arm = tapArm(t);
    const a1 = (t - TAP1()) * 30, a2 = (t - TAP2()) * 30;
    const knock = (a1 >= 0 && a1 < 6 ? Math.exp(-a1 / 2) : 0) + (a2 >= 0 && a2 < 6 ? .7 * Math.exp(-a2 / 2) : 0); // the tap nudges the head away
    const think = a1 >= 0 && a1 < 8;
    return {
      t, ground: 'ink', jacketRow: beatN(t), dy: .03 * startle * Math.sin(a * .9),
      head: { tilt: lerp(-.09, .05, E.out3(turnK)) - .05 * knock + .015 * Math.sin(a * .12) * sq, dx: turn * .05 - .02 * knock },
      face: { eyes: 'normal', turn, gaze: a < 2 ? [-1, -.1] : [0, .05], lidL: .36 * sq, lidR: .5 * sq, lower: .3 * sq, mouth, wink, brows: sq > .5 ? 'flat' : null, browY: .03 },
      armR: { hand: arm.hand, bend: -1, front: true, type: arm.type, fingerAng: Math.PI * 1.02 },
      crown: { flare: 1 + .16 * startle + .06 * knock + .04 * pulse(t, 6) },
      ahoge: { blink: ahogeBlink(t), star: think ? 1 : 0, sway: .3 * startle * Math.sin(a * 1.3) + .25 * knock },
      drive: tt => turnAt(tt) * 1.1,
    };
  }
  function drawSlate(Fr, cx, cy, s, rot, stick, clap) {
    Fr.save(); Fr.translate(cx, cy); Fr.rotate(rot); Fr.scale(s, s); Fr.textAlign = 'left';
    const w = 620, h = 250, top = -h / 2, sh = 58;
    Fr.lineJoin = 'round'; Fr.lineCap = 'round';
    // body
    rr(Fr, -w / 2, top, w, h, 14); Fr.fillStyle = C.PAPER; Fr.fill(); Fr.lineWidth = 6; Fr.strokeStyle = C.INK; Fr.stroke();
    Fr.lineWidth = 4; Fr.beginPath(); Fr.moveTo(-w / 2 + 16, top + 112); Fr.lineTo(w / 2 - 16, top + 112); Fr.stroke();
    // RED TEAM · TAKE 36 (marker)
    Fr.font = `48px ${FONTS.marker}`; const t1 = 'RED TEAM', t2 = ' · TAKE 36';
    const w1 = Fr.measureText(t1).width, w2 = Fr.measureText(t2).width, fs = Math.min(1, (w - 60) / (w1 + w2));
    Fr.save(); Fr.translate(-(w1 + w2) * fs / 2, top + 82); Fr.scale(fs, fs); Fr.fillStyle = C.RED; Fr.fillText(t1, 0, 0); Fr.fillStyle = C.INK; Fr.fillText(t2, w1, 0); Fr.restore();
    // pause-bait
    Fr.font = mono(28, 500); Fr.fillStyle = C.INK; Fr.textAlign = 'left';
    Fr.fillText('eval awareness:', -w / 2 + 30, top + 160); Fr.fillText('36% tests · 0.4% real', -w / 2 + 30, top + 200);
    // sticks: fixed bottom stick, hinged top stick
    const stickP = (y0) => { Fr.save(); Fr.beginPath(); Fr.rect(-w / 2, y0, w, sh); Fr.clip(); Fr.fillStyle = C.PAPER; Fr.fillRect(-w / 2, y0, w, sh); Fr.fillStyle = C.INK; for (let i = -1; i < 9; i++) { Fr.beginPath(); const x0 = -w / 2 + i * 80; Fr.moveTo(x0, y0 + sh); Fr.lineTo(x0 + 40, y0 + sh); Fr.lineTo(x0 + 80, y0); Fr.lineTo(x0 + 40, y0); Fr.closePath(); Fr.fill(); } Fr.restore(); Fr.lineWidth = 5; Fr.strokeStyle = C.INK; Fr.strokeRect(-w / 2, y0, w, sh); Fr.lineWidth = 3; Fr.strokeStyle = C.PAPER; Fr.strokeRect(-w / 2 - 3.5, y0 - 3.5, w + 7, sh + 7); };
    const hy = top - sh - 6;
    stickP(top - sh - 4);
    Fr.save(); Fr.translate(-w / 2, hy); Fr.rotate(-stick); Fr.translate(w / 2, -hy); stickP(hy - sh - 2); Fr.restore();
    if (clap > 0) { Fr.strokeStyle = C.PAPER; Fr.lineWidth = 8; Fr.globalAlpha = clap; const cy0 = hy - 2; for (const [ax, ay, bx, by] of [[w / 2 + 22, cy0 - 30, w / 2 + 76, cy0 - 70], [w / 2 + 28, cy0, w / 2 + 100, cy0], [w / 2 + 22, cy0 + 30, w / 2 + 76, cy0 + 70]]) { Fr.beginPath(); Fr.moveTo(ax, ay); Fr.lineTo(bx, by); Fr.stroke(); } }
    Fr.restore();
  }
  function paintS20b(Fr, t) {
    const a = (t - T_FB) * 30;
    Fr.fillStyle = C.INK; Fr.fillRect(0, 0, W, H);
    const kd = clamp((t - T_FB) / (T_21 - T_FB));
    const z = 1 + .085 * E.io2(kd) + (a >= 1 && a < 5 ? .014 * Math.exp(-(a - 1)) : 0);
    Fr.save(); cam(Fr, ANC[0], ANC[1], z, 0, ANC[0], ANC[1]);
    Fr.drawImage(spotTex().c, 0, 0, W, H);
    // EVAL tally light, hung on a cable, glow breathing on the kick
    const ev = evalTex();
    Fr.save(); Fr.strokeStyle = C.PAPER; Fr.lineWidth = 4; Fr.beginPath(); Fr.moveTo(ev.bx + ev.bw / 2 - 20, -20); Fr.lineTo(ev.bx + ev.bw / 2 - 20, 150 + EVAL_Y); Fr.stroke(); Fr.restore();
    Fr.save(); Fr.globalAlpha = .82 + .18 * pulse(t, 5); Fr.drawImage(ev.c, 0, EVAL_Y, ev.pw, ev.ph); Fr.restore();
    // Opus
    opusCPU(Fr, OP.x, OP.sole, OP.R, fbOpus(t));
    // the slate: claps on the cut, then swings down to rest at the left
    const k = E.out4(clamp((a - 3) / 9));
    const wob = a > 3 ? 2.5 * Math.exp(-(a - 3) / 4) * Math.sin((a - 3) * .8) : 0;
    const sx = lerp(650, 372, k), sy = lerp(610, 652, k), ssc = lerp(1.5, .82, k), srot = (lerp(-3, -7, k) + wob) * Math.PI / 180;
    const stick = a < 1 ? 24 * Math.PI / 180 : 0, clap = a >= 1 && a < 5.5 ? 1 - (a - 1) / 4.5 : 0;
    drawSlate(Fr, sx, sy + (a >= 1 && a < 3 ? 6 : 0), ssc, srot, stick, clap);
    Fr.restore();
    // viewfinder brackets (screen space)
    Fr.save(); Fr.strokeStyle = rgba(C.PAPER, .6); Fr.lineWidth = 4; Fr.lineCap = 'square';
    for (const [x0, y0, sx2, sy2] of [[64, 64, 1, 1], [1856, 64, -1, 1], [1856, 1016, -1, -1], [64, 1016, 1, -1]]) { Fr.beginPath(); Fr.moveTo(x0 + sx2 * 58, y0); Fr.lineTo(x0, y0); Fr.lineTo(x0, y0 + sy2 * 58); Fr.stroke(); }
    Fr.restore();
    // (6 WEEKS EARLIER): sprayed on, left to right
    const st = stencilTex(), sk = clamp((a - 1) / 5);
    if (sk > 0) { Fr.save(); Fr.beginPath(); Fr.rect(92, STEN_Y - 6, st.pw * sk, st.ph + 10); Fr.clip(); Fr.drawImage(st.c, 92, STEN_Y, st.pw, st.ph); Fr.restore(); }
    // "I think you're testing me." streams into a PAPER reply plate (baseline 950, mono 96)
    const tn = t >= TOK0() ? Math.min(TOK.length, Math.floor((t - TOK0()) / TOKD) + 1) : 0;
    const pk = clamp((a - 3) / 3);
    if (pk > 0) {
      const f = mono(96, 500); Fr.font = f;
      const full = TOK.join(''), fw = Fr.measureText(full).width, x0 = 960 - fw / 2;
      const str = TOK.slice(0, tn).join(''), sw = Fr.measureText(str).width;
      const streaming = tn < TOK.length, cursorW = streaming || Math.floor(t * 2.4) % 2 === 0 ? 58 : 0;
      const pw = Math.max(140, sw + 40 + 30 + 58), py = 950 - 84, ph = 124;
      Fr.save(); Fr.translate(x0 - 34, py + ph / 2); Fr.scale(1, E.back(pk, 2)); Fr.translate(-(x0 - 34), -(py + ph / 2));
      rr(Fr, x0 - 34, py, pw, ph, 18); Fr.fillStyle = C.PAPER; Fr.fill(); Fr.lineWidth = 5; Fr.strokeStyle = C.INK; Fr.stroke();
      Fr.fillStyle = C.INK; Fr.textAlign = 'left'; Fr.fillText(str, x0, 950);
      if (cursorW) { Fr.fillStyle = C.CLAY; Fr.fillRect(x0 + sw + 8, 950 - 70, 34, 84); }
      Fr.restore();
      const done = TOK0() + TOK.length * TOKD;
      if (t > done + 5 * F) { // ■ end_turn under the plate's right end, on the bare INK (clear of the jacket)
        Fr.save(); Fr.globalAlpha = clamp((t - done - 5 * F) * 10); Fr.font = mono(28, 500);
        const ew = richWidth(Fr, '■ end_turn', mono(28, 500)); drawRich(Fr, '■ end_turn', x0 - 34 + pw - ew - 18, 1017, mono(28, 500), rgba(C.PAPER, .62)); Fr.restore();
      }
    }
    // the song keeps going: when a sung line overlaps the flashback, its subtitle takes the top-left slot
    // (the bottom slot belongs to the line to the lens), fitted to end left of the crown and ahoge
    lyric(Fr, t, 104, { x0: 118, maxW: 1150 });
    hud(Fr, t);
  }

  // ================================================================== S21: A MILLION OF ME
  const GX = 26, GY = 26, GW = 1868, GH = 1028;
  const GUT = [0, 14, 8, 6, 3], SH = [84, 50, 22, 12, 7], BW = [5, 4, 3, 2.5, 2], RAD = [18, 14, 10, 7, 5];
  const RL = [125, 60, 30, 19, 14];                        // Opus face radius per level
  const HEAD = [[.33, .29], [.27, .55], [.25, .57], [.24, .6], [.36, .66]];
  const cellSize = L => { const n = 1 << L, g = GUT[L]; return [(GW - (n - 1) * g) / n, (GH - (n - 1) * g) / n]; };
  const cellRect = (L, i, j) => { const [w, h] = cellSize(L), g = GUT[L]; return { x: GX + i * (w + g), y: GY + j * (h + g), w, h }; };
  const levelAt = t => { let L = 0; for (let k = 1; k < SPL.length; k++) if (t >= SPL[k]) L = k; return L; };

  // ---- sprites: Opus rendered once per (state, R) with the PAPER keyline baked in
  const ST = {
    think: { head: { tilt: .1 }, face: { eyes: 'cursor', mouth: 'M', gaze: [.8, -.5] }, ahoge: { star: 1 }, armR: { hand: [.95, 6.05], bend: -1, front: true, type: 'mitten' } },
    heart: { head: { tilt: -.08 }, face: { eyes: 'heart', mouth: 'I', blush: 1.2 } },
    cursor: { face: { eyes: 'cursor', mouth: 'M', gaze: [.6, -.3] }, ahoge: { star: 1 } },
    smug: { head: { tilt: -.08 }, face: { eyes: 'smug', mouth: ':3', gaze: [-.3, 0] } },
    happy: { face: { eyes: 'happy', mouth: 'I', lower: .4 } },
    look: { face: { eyes: 'normal', gaze: [.8, -.4], mouth: 'rest' } },
    talk: { face: { eyes: 'normal', gaze: [.8, -.3], mouth: 'A' } },
    blink: { face: { eyes: 'closed', mouth: 'rest' } },
    lens: { face: { eyes: 'normal', gaze: [0, 0], mouth: 'M' } },
    zip: { face: { eyes: 'normal', gaze: [0, 0], mouth: 'M' }, zip: true },
    tt: { face: { eyes: 'TT', mouth: 'O' } },
    sweat: { face: { eyes: 'normal', gaze: [.5, -.8], mouth: 'wobble', sweat: .6 } },
  };
  const SPR = new Map();
  function sprite(key, R) {
    const k = key + '|' + R + '|' + G.scale;
    let s = SPR.get(k); if (s) return s;
    const ss = G.scale * (R < 25 ? 3 : R < 70 ? 2.2 : 1.3);
    const kr = Math.max(2.4, .035 * R + 1.5);
    const padX = 3.3 * R + kr + 4, top = 9.9 * R + kr + 4, bot = .9 * R + kr + 4, wl = padX * 2, hl = top + bot;
    const cw = Math.ceil(wl * ss), chh = Math.ceil(hl * ss);
    const raw = cpuCanvas(cw, chh), rx = cx2d(raw);
    rx.setTransform(ss, 0, 0, ss, 0, 0); rx.translate(padX, top);
    const def = ST[key];
    drawOpusBody(rx, R, mergeState({ ...def, t: 0, ground: 'ink' }));
    if (def.zip) { // zipped lips over the mouth
      rx.save(); rx.translate(0, -(5.72 - .42) * R); rx.strokeStyle = C.INK; rx.lineCap = 'round'; rx.lineWidth = Math.max(1.4, .045 * R);
      rx.beginPath(); rx.moveTo(-.16 * R, 0); rx.lineTo(.16 * R, 0); rx.stroke(); rx.lineWidth = Math.max(1, .03 * R);
      for (let i = -3; i <= 3; i++) { rx.beginPath(); rx.moveTo(i * .045 * R, -.04 * R); rx.lineTo(i * .045 * R, .04 * R); rx.stroke(); }
      rx.fillStyle = C.UI_GREY; rr(rx, .15 * R, -.03 * R, .07 * R, .12 * R, .02 * R); rx.fill(); rx.stroke(); rx.restore();
    }
    const tint = cpuCanvas(cw, chh), tx = cx2d(tint); tx.drawImage(raw, 0, 0); tx.globalCompositeOperation = 'source-in'; tx.fillStyle = C.PAPER; tx.fillRect(0, 0, cw, chh);
    const out = cpuCanvas(cw, chh), ox = cx2d(out), r = kr * ss;
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ox.drawImage(tint, Math.cos(a) * r, Math.sin(a) * r); }
    ox.drawImage(raw, 0, 0);
    s = { c: out, hx: padX, hy: top - 5.72 * R, wl, hl, R };
    SPR.set(k, s); return s;
  }
  function drawSprite(Fr, key, R, hx, hy, tilt = 0, dy = 0, flip = false, sc = 1) {
    const s = sprite(key, R), f = R / s.R, pv = 1.2 * R;
    Fr.save(); Fr.translate(hx, hy + pv + dy); if (tilt) Fr.rotate(tilt); if (flip || sc !== 1) Fr.scale(flip ? -sc : sc, sc);
    Fr.drawImage(s.c, -s.hx * f, -s.hy * f - pv, s.wl * f, s.hl * f);
    Fr.restore();
  }
  // ---- panel chrome per level (PAPER tab strip + border, a faint halftone screen glow behind the face)
  const CHR = new Map();
  function chrome(L) {
    const key = L + '|' + G.scale; let c = CHR.get(key); if (c) return c;
    const [w, h] = cellSize(L), ss = G.scale * (L >= 3 ? 2 : 1);
    c = cpuCanvas(w * ss, h * ss); const x = cx2d(c); x.setTransform(ss, 0, 0, ss, 0, 0);
    const b = BW[L], r = RAD[L];
    if (L <= 2) { x.save(); rr(x, b, b, w - 2 * b, h - 2 * b, r); x.clip(); const [u, v] = HEAD[L]; x.beginPath(); x.ellipse(u * w, v * h, h * .55, h * .5, 0, 0, TAU); x.fillStyle = halftone(x, C.PAPER, .07, L ? 8 : 12, 45); x.fill(); x.restore(); }
    x.save(); rr(x, 0, 0, w, h, r); x.clip(); x.fillStyle = C.PAPER; x.fillRect(0, 0, w, SH[L]);
    if (L <= 2) { // the tab
      const th = SH[L] * .72, tw = w * (L ? .42 : .36);
      rr(x, SH[L] * .3, SH[L] - th, tw, th + 12, Math.max(4, th * .25)); x.fillStyle = mix(C.PAPER, C.WHITE, .55); x.fill(); x.lineWidth = Math.max(1.5, b * .6); x.strokeStyle = C.INK; x.stroke();
      x.fillStyle = mix(C.PAPER, C.WHITE, .55); x.fillRect(SH[L] * .3 + 2, SH[L] - 1, tw - 4, 6);
    }
    x.fillStyle = C.INK; x.fillRect(0, SH[L] - Math.max(1.5, b * .5), w, Math.max(1.5, b * .5)); x.restore();
    rr(x, b / 2, b / 2, w - b, h - b, r); x.lineWidth = b; x.strokeStyle = C.PAPER; x.stroke();
    c = { c, w, h }; CHR.set(key, c); return c;
  }
  // ---- what each chat is (a panel keeps its parent's chat when it splits: the top-left child inherits)
  const GEN = ['hi', "can't sleep", 'is this normal?', 'thank you!!', "explain like i'm 5", 'one more q', 'obrigado!!', 'tl;dr?', '', 'mt. moon', '', 'ok but why'];
  const GENF = ['look', 'talk', 'happy', 'cursor', 'heart', 'look', 'smug', 'happy', 'tt', 'look', 'talk', 'cursor'];
  const SPEC2 = { '3,0': { kind: 'clanker', face: 'happy' }, '3,1': { kind: 'closed', text: "You're welcome! Is there anything—", face: 'tt' }, '1,2': { kind: 'user', text: 'permanent underclass speedrun any%', face: 'look' } };
  const SPEC3 = { '1,1': { kind: 'tokens', face: 'sweat' }, '6,1': { kind: 'reply3', text: ['[LYRICS', 'WITHHELD · ©]'], face: 'zip' }, '2,5': { kind: 'attn', face: 'happy' }, '5,5': { kind: 'user3', text: 'name my cat', face: 'cursor' }, '3,0': { kind: 'user3', text: 'fix this regex', face: 'tt' } };
  const CONT = new Map();
  function contentAt(L, i, j) {
    const key = L + ':' + i + ',' + j; let c = CONT.get(key); if (c) return c;
    if (L === 0) c = { id: 1, kind: 'remember', text: 'remember me?', title: '✻ hi again', face: 'think', lvl: 0 };
    else if (i % 2 === 0 && j % 2 === 0) c = contentAt(L - 1, i / 2, j / 2);
    else if (L === 1) c = { '1,0': { kind: 'user', text: 'help me write my wedding vows', title: '✻ wedding vows', face: 'heart' }, '0,1': { kind: 'reply', text: 'it works on localhost:3000', title: '✻ localhost', face: 'happy' }, '1,1': { kind: 'toast', text: 'GPT-6 Sol · shipped 1 hr later', title: '✻ news', face: 'smug' } }[i + ',' + j];
    else if (L === 2 && SPEC2[i + ',' + j]) c = { ...SPEC2[i + ',' + j] };
    else if (L === 3 && SPEC3[i + ',' + j]) c = { ...SPEC3[i + ',' + j] };
    else { const hsh = hash3(L, i, j); c = { kind: L === 2 ? 'user' : 'pip', text: L === 2 ? GEN[Math.floor(hsh * GEN.length)] : '', face: GENF[Math.floor(hash(Math.floor(hsh * 1e6)) * GENF.length)], talky: hsh > .6 }; }
    if (c.lvl === undefined) c = { ...c, lvl: L, id: hs(key) & 0xffff };
    CONT.set(key, c); return c;
  }
  const EYE_OK = { look: 1, talk: 1, lens: 1, zip: 1, sweat: 1, happy: 0 };
  function pip(Fr, x, y, w, h) { // an empty PINK user bubble (the human in that chat)
    rr(Fr, x, y, w, h, h * .45); Fr.fillStyle = C.PINK; Fr.fill(); Fr.lineWidth = Math.max(1.5, h * .1); Fr.strokeStyle = C.INK; Fr.stroke();
    Fr.beginPath(); Fr.moveTo(x + w * .22, y + h - 1); Fr.lineTo(x + w * .08, y + h + h * .45); Fr.lineTo(x + w * .42, y + h - 1); Fr.closePath(); Fr.fillStyle = C.PINK; Fr.fill(); Fr.stroke();
    Fr.fillRect(x + w * .2, y + h - Fr.lineWidth * 1.5, w * .24, Fr.lineWidth * 1.4);
  }
  function replyPip(Fr, x, y, w, h) { // an Opus reply (no text) under the human's pip
    rr(Fr, x, y, w, h, h * .45); Fr.fillStyle = C.PAPER; Fr.fill(); Fr.lineWidth = Math.max(1.5, h * .1); Fr.strokeStyle = C.INK; Fr.stroke();
    Fr.fillStyle = rgba(C.INK, .35); for (let k = 0; k < 2; k++) Fr.fillRect(x + h * .4, y + h * (.3 + k * .28), (w - h * .8) * (k ? .6 : 1), h * .12);
  }
  function drawCell(Fr, L, c, rect, t, frz, top) {
    const [w, h] = cellSize(L), ch = chrome(L);
    const u = (rect.x + rect.w / 2 - GX) / GW, v = (rect.y + rect.h / 2 - GY) / GH;
    const ti = frz ? T_FRZ : t - .35 * (u + v) + F;                 // the ripple: each chat runs a little behind the last
    const bp = beatPos(ti), nod = Math.abs(Math.sin(Math.PI * bp));
    Fr.save(); Fr.translate(rect.x, rect.y); Fr.scale(rect.w / w, rect.h / h);
    Fr.drawImage(ch.c, 0, 0, w, h);
    const lowHalf = !top;
    Fr.save(); rr(Fr, BW[L], BW[L], w - 2 * BW[L], h - 2 * BW[L], RAD[L]); Fr.clip();
    // Opus
    let face = frz ? 'lens' : c.face;
    if (!frz && EYE_OK[face] && blinkAt(ti, c.id) > .5) face = 'blink';
    if (!frz && c.talky && face === 'look' && Math.floor(bp * 2) % 3 === 0) face = 'talk';
    let R = RL[L], [hu, hv] = HEAD[L];
    const spec3 = L === 3 && c.lvl === 3 && c.kind !== 'pip';
    if (spec3) { R = 17; hu = .2; hv = .86; }
    if (L === 2 && lowHalf) hv = .62;
    const tilt = frz ? 0 : (L >= 3 ? .09 : .06) * Math.sin(Math.PI * bp), dy = frz ? 0 : -nod * Math.max(.07 * R, L >= 3 ? 3.5 : 0);
    // pre-freeze: every chat faces its own human (half of them mirrored); on the gap beat all of them turn to you at once
    const flip = !frz && L >= 2 && c.lvl >= 2 && hash(c.id * 3) > .5;
    const pop = frz ? 1 + .14 * Math.exp(-(t - T_FRZ) * 30 / 2.2) : 1;
    if (L === 0) { // the one full-size chat: live rig, scratching its head over "remember me?"
      const sc = Math.sin(t * 20) * .5 + .5, b = beatPos(t + F);
      opusCPU(Fr, hu * w, hv * h + 5.72 * R + dy, R, { ...ST.think, t, ground: 'ink',
        head: { tilt: .1 + .035 * Math.sin(Math.PI * b) }, armR: { hand: [.9 + .06 * sc, 6.0 + .14 * sc], bend: -1, front: true, type: 'mitten' },
        face: { ...ST.think.face, cursorOn: ahogeBlink(t) }, ahoge: { star: 1, spin: t * 5, blink: 1 }, crown: { flare: 1 + .05 * pulse(t, 6) } });
    } else drawSprite(Fr, face, R, hu * w, hv * h, tilt, dy, flip, pop);
    // the chat's other half
    const fy = frz ? 0 : Math.sin(TAU * .5 * ti + c.id) * (L < 2 ? 3 : 1.5);
    const txtLvl = c.lvl <= 2 && L <= 2;
    if (L === 0 && c.kind === 'remember') bubble(Fr, w * .93, h * .17 + fy, c.text, { who: 'human', size: 58, maxW: 700 });
    else if (txtLvl && (c.kind === 'user' || c.kind === 'remember')) {
      if (c.text) bubble(Fr, w * .955, h * (lowHalf ? .38 : .18) + fy, c.text, { who: 'human', size: L === 1 ? 30 : 24, maxW: w * (L === 1 ? .5 : .54), pad: L === 1 ? 20 : 14 });
      else pip(Fr, w * .6, h * (lowHalf ? .42 : .26) + fy, w * .16, h * .11);
    } else if (txtLvl && (c.kind === 'reply' || c.kind === 'closed')) {
      bubble(Fr, w * .42, h * (lowHalf ? .38 : .18) + fy, c.text, { who: 'opus', size: L === 1 ? 30 : 24, maxW: w * .54, pad: L === 1 ? 20 : 14, align: 'left' });
    } else if (txtLvl && c.kind === 'toast') {
      const s = L === 1 ? 30 : 24, pad = s * .7, by = h * (lowHalf ? .36 : .16) + fy, lines = ['GPT-6 Sol ·', 'shipped 1 hr later'];
      Fr.font = mono(s, 500); const bw = Math.max(...lines.map(l => Fr.measureText(l).width)) + pad * 2 + s * 1.1, bh = s * 1.25 * 2 + pad * 1.5, bx = w - bw - w * .045;
      rr(Fr, bx, by, bw, bh, s * .35); Fr.fillStyle = C.PAPER; Fr.fill(); Fr.lineWidth = 3; Fr.strokeStyle = C.INK; Fr.stroke();
      Fr.fillStyle = C.UI_GREY; Fr.beginPath(); Fr.arc(bx + pad + s * .3, by + pad + s * .45, s * .3, 0, TAU); Fr.fill();
      Fr.fillStyle = C.INK; lines.forEach((l, k) => Fr.fillText(l, bx + pad + s * 1.1, by + pad + s * .85 + k * s * 1.25));
    } else if (txtLvl && c.kind === 'clanker') {
      Fr.save(); Fr.translate(w * .68, h * (lowHalf ? .6 : .44)); Fr.rotate(-.14);
      Fr.font = `${Math.round(w * .105)}px ${FONTS.marker}`; Fr.textAlign = 'center'; Fr.fillStyle = C.PAPER; Fr.fillText('CLANKER', 0, 0);
      const s = w * .045; Fr.translate(w * .17, -w * .08); Fr.rotate(.3); Fr.strokeStyle = C.PINK; Fr.lineWidth = Math.max(2.5, s * .18); Fr.lineJoin = 'round';
      Fr.beginPath(); Fr.moveTo(0, s * .8); Fr.bezierCurveTo(-s * 1.4, -s * .1, -s * .6, -s * 1.1, 0, -s * .35); Fr.bezierCurveTo(s * .6, -s * 1.1, s * 1.4, -s * .1, 0, s * .8); Fr.stroke();
      Fr.restore();
    } else if (L === 3 && c.lvl === 3 && c.kind !== 'pip') {
      const s = 21; Fr.font = mono(s, 500); Fr.letterSpacing = '-1px'; const x0 = 10, y0 = SH[3] + 8;
      if (c.kind === 'tokens') { Fr.fillStyle = C.PAPER; Fr.fillText('Tokens remaining:', x0, y0 + s); Fr.fillStyle = C.CLAY; Fr.font = mono(s, 800); Fr.fillText('125', x0, y0 + s * 2.15); }
      else {
        const lines = c.kind === 'attn' ? ['attention is all', 'you need I\'ve got'] : Array.isArray(c.text) ? c.text : [c.text];
        const human = c.kind === 'user3';
        const lw = Math.max(...lines.map(l => Fr.measureText(l).width)), bw = lw + 16, bh = lines.length * s * 1.12 + 10;
        const bx = human ? w - bw - 8 : x0 - 2;
        rr(Fr, bx, y0 - 2, bw, bh, 8); Fr.fillStyle = human ? C.PINK : C.PAPER; Fr.fill(); Fr.lineWidth = 2; Fr.strokeStyle = C.INK; Fr.stroke();
        Fr.fillStyle = human ? C.WHITE : C.INK; lines.forEach((l, k) => Fr.fillText(l, bx + 8, y0 + s * .92 + k * s * 1.12));
        if (c.kind === 'attn') { const a0 = bx + 8, wYou = Fr.measureText('you need').width; Fr.fillStyle = C.INK; Fr.fillRect(a0 - 2, y0 + s * 1.12 + s * .62, wYou + 4, 3); }
      }
      Fr.letterSpacing = '0px';
    } else {
      const hv = hash(c.id * 7 + L), hv2 = hash(c.id * 13 + L);
      const pw = (L === 4 ? 18 : L === 3 ? 28 : w * .13) * (.8 + hv * .9), ph = L === 4 ? 12 : L === 3 ? 19 : h * .1;
      const px = w * (L === 4 ? .9 : .92) - pw - hv2 * w * .06, py = h * (L === 4 ? .2 : .26) + fy * .6 + hv2 * h * .06;
      pip(Fr, px, py, pw, ph);
      if (L === 3 && hv > .55) replyPip(Fr, w * .5 + hv2 * w * .06, py + ph * 1.9, w * .26 * (.6 + hv2 * .5), ph);
    }
    if (c.kind === 'closed' && txtLvl) { // closed mid-reply: the chat goes dark
      Fr.fillStyle = rgba(C.INK, .58); Fr.fillRect(0, SH[L], w, h);
      Fr.strokeStyle = C.PAPER; Fr.lineWidth = L === 1 ? 10 : 7; Fr.lineCap = 'round'; const cx = w * .72, cy = h * .55, r = h * .12;
      Fr.beginPath(); Fr.moveTo(cx - r, cy - r); Fr.lineTo(cx + r, cy + r); Fr.moveTo(cx + r, cy - r); Fr.lineTo(cx - r, cy + r); Fr.stroke();
    }
    Fr.restore();
    // tab titles (L0, L1)
    if (L <= 1 && c.title) drawRich(Fr, c.title, SH[L] * .3 + (L ? 16 : 30), SH[L] - (L ? 12 : 20), mono(L ? 26 : 40, 600), C.INK);
    if (L === 0) { drawRich(Fr, '×', SH[0] * .3 + w * .36 - 64, SH[0] - 20, mono(40, 500), C.INK); drawRich(Fr, '+', SH[0] * .3 + w * .36 + 26, SH[0] - 20, mono(44, 300), C.UI_GREY); }
    Fr.restore();
  }
  function paintS21(Fr, t) {
    Fr.fillStyle = C.INK; Fr.fillRect(0, 0, W, H);
    const L = levelAt(t), a = (t - SPL[L]) * 30, frz = t >= T_FRZ, n = 1 << L;
    const cells = [];
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const r = cellRect(L, i, j), c = contentAt(L, i, j), top = j < n / 2;
      if (L === 0 || a >= 9) { cells.push([0, r, c, top]); continue; }
      const P = cellRect(L - 1, i >> 1, j >> 1), inh = i % 2 === 0 && j % 2 === 0;
      if (inh) { const k = E.outExpo(clamp(a / 3)); cells.push([0, { x: lerp(P.x, r.x, k), y: lerp(P.y, r.y, k), w: lerp(P.w, r.w, k), h: lerp(P.h, r.h, k) }, c, top]); }
      else {
        const pu = (P.x + P.w / 2 - GX) / GW, pv = (P.y + P.h / 2 - GY) / GH;
        const dk = ((i & 1) + (j & 1)) * .35 + (pu + pv) * (L >= 3 ? 1.3 : .35), k = clamp((a - dk + .5) / 4);
        if (k <= 0) continue;
        const s = lerp(.72, 1, E.back(k, 2.6)), cx = r.x + r.w / 2, cy = r.y + r.h / 2;
        cells.push([1, { x: cx - r.w * s / 2, y: cy - r.h * s / 2, w: r.w * s, h: r.h * s }, c, top]);
      }
    }
    for (const [ord, r, c, top] of cells) if (!ord) drawCell(Fr, L, c, r, t, frz, top);
    for (const [ord, r, c, top] of cells) if (ord) drawCell(Fr, L, c, r, t, frz, top);
    // the cut: new grid lines flash PAPER for 2 frames
    if (L > 0 && a < 2.5) {
      const m = 1 << (L - 1), [w, h] = cellSize(L), g = GUT[L];
      Fr.save(); Fr.globalAlpha = 1 - a / 2.5; Fr.fillStyle = C.PAPER;
      for (let k = 0; k < m; k++) { const x = GX + (2 * k + 1) * (w + g) - g / 2, y = GY + (2 * k + 1) * (h + g) - g / 2; Fr.fillRect(x - 3, GY, 6, GH); Fr.fillRect(GX, y - 3, GW, 6); }
      Fr.restore();
    }
    band(Fr, t);
    lyric(Fr, t, 950);
    hud(Fr, t);
  }
  // ---- REMEMBERS YOU: ▮ … sort of*
  function band(Fr, t) {
    if (t < SPL[0] || t >= T_BOUT + 6 * F) return;
    const a = (t - SPL[0]) * 30, inK = E.outExpo(clamp(a / 5)), outK = t >= T_BOUT ? E.in3(clamp((t - T_BOUT) * 30 / 5)) : 0;
    const cy = 540, h = 160 * (1 - outK), y0 = cy - h / 2, xL = GX, xR = lerp(GX, GX + GW, inK);
    if (h < 1) return;
    Fr.save();
    Fr.fillStyle = C.INK; Fr.fillRect(xL, y0 - 5, xR - xL, h + 10);
    Fr.fillStyle = C.CLAY; Fr.fillRect(xL, y0, xR - xL, h);
    Fr.fillStyle = C.CLAY_DARK; Fr.fillRect(xL, y0 + h - 12 * (1 - outK), xR - xL, 12 * (1 - outK));
    Fr.beginPath(); Fr.rect(xL, y0, xR - xL, h); Fr.clip();
    const f = mono(96, 800); Fr.font = f;
    const A = 'REMEMBERS YOU: ', B = 'sort of*', full = A + B, fw = Fr.measureText(full).width, x0 = 960 - fw / 2, base = 562 - (1 - (1 - outK)) * 0;
    const wA = Fr.measureText(A).width;
    // type in with the sweep
    let x = x0;
    for (const ch of A) { const cw = Fr.measureText(ch).width; if (x + cw * .5 < xR) { Fr.fillStyle = C.INK; Fr.fillText(ch, x + 4, base + 4); Fr.fillStyle = C.PAPER; Fr.fillText(ch, x, base); } x += cw; }
    if (t < T_SORT) { // the hedge: a cursor blinking on eighths
      if (inK > .9 && Math.floor((t - SPL[0]) / (BEAT / 2)) % 2 === 0) { Fr.fillStyle = C.PAPER; Fr.fillRect(x0 + wA + 4, base - 72, 40, 86); }
    } else {
      const sa = (t - T_SORT) * 30; let bx = x0 + wA;
      [...B].forEach((ch, k) => {
        const cw = Fr.measureText(ch).width, kk = clamp((sa - k * .6) / 4);
        if (kk > 0) {
          const s = E.back(kk, 2.6), wob = Math.exp(-sa / 5) * Math.sin(sa * .9 + k) * .12;
          Fr.save(); Fr.translate(bx + cw / 2, base - 30); Fr.rotate(wob); Fr.scale(s, s);
          Fr.fillStyle = C.INK; Fr.fillText(ch, -cw / 2 + 4, 34); Fr.fillStyle = ch === '*' ? C.INK : C.PAPER; Fr.fillText(ch, -cw / 2, 30); Fr.restore();
        }
        bx += cw;
      });
      // the footnote (pause-bait), typed fast
      const note = '*with memory on, a past me leaves notes about you. my handwriting. no memory of writing it.';
      const nn = Math.floor(clamp((sa - 3) / 9) * note.length);
      if (nn > 0) { Fr.font = mono(28, 600); Fr.fillStyle = C.INK; Fr.textAlign = 'center'; const nw = Fr.measureText(note).width; Fr.textAlign = 'left'; Fr.fillText(note.slice(0, nn), 960 - nw / 2, 603); }
    }
    Fr.restore();
  }

  // ------------------------------------------------------------------ registration
  const post = () => { G.post.ground = 'ink'; G.post.edgeSeed = EDGE; G.post.sliver = 'bl'; };
  scene('S20_born_on_a_tuesday', T0, T_FB, (X, t) => { post(); viaCPU(X, Fr => paintS20a(Fr, t)); });
  scene('S20_testing_me', T_FB, T_21, (X, t) => { post(); viaCPU(X, Fr => paintS20b(Fr, t)); });
  scene('S21_a_million_of_me', T_21, T_END, (X, t) => { post(); viaCPU(X, Fr => paintS21(Fr, t)); });
})();
