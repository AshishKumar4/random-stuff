// style.js: "Terracotta Riso × browser UI × K-pop grammar" (BIBLE §7).
// Palette tokens, font roles, drawRich (vector glyphs for symbols missing from the mono font),
// HERO type, the printed-INK card post-process, grids and bar helpers.
'use strict';

const C = {
  INK: '#191830', PAPER: '#F4EEE3', CLAY: '#D97757', CLAY_DARK: '#C4633F', BRICK: '#8A3A24', SPARK: '#FF6B35',
  FACE: '#F7E4D4', AMBER: '#E8A33D', PINK: '#FF48B0', BLUE: '#3255A4', YELLOW: '#FFE800', TEAL: '#00838A',
  RED: '#F15060', LINK: '#0000EE', LINK_V: '#551A8B', UI_GREY: '#8B8794', WHITE: '#FFFFFF',
};
Object.assign(FONTS, {
  hero: "'Archivo HERO', 'Archivo Black', sans-serif",
  heart: "'Instrument Serif', serif",
  mono: "'Jetbrains Mono Var', monospace",
  marker: "'Permanent Marker', cursive",
  hangul: "'Hangul', 'Noto Sans KR Var', sans-serif",
  tinos: "'Tinos', serif",
  vt: "'VT323', monospace",
  body: "'Jetbrains Mono Var', monospace",
  display: "'Archivo HERO', sans-serif",
});
window.FONT_PRELOAD = [
  "900 100px 'Archivo HERO'", "400 100px 'Instrument Serif'", "italic 400 100px 'Instrument Serif'",
  "400 100px 'Jetbrains Mono Var'", "700 100px 'Jetbrains Mono Var'", "400 100px 'Permanent Marker'",
  "900 100px 'Hangul'", "400 100px 'Tinos'", "400 100px 'VT323'",
];
const STRETCH = { xcond: 'extra-condensed', cond: 'condensed', semi: 'semi-condensed', normal: 'normal', exp: 'expanded', semiexp: 'semi-expanded' };

// ---------------------------------------------------------------- drawRich
// Symbols the mono latin subset lacks are drawn as vectors inside one mono cell (0.6em).
const RICH = '▮▶✻⏺⇥✓✕→■⏸⏭⏎👍👎✅👁🎲↑×✦';
function richGlyph(ctx, ch, x, y, s, color) {
  // (x,y) = left of cell on baseline; s = font size. Cell = 0.6s wide, cap height ~0.72s.
  const w = .6 * s, cx = x + w / 2, cy = y - .36 * s;
  ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const lw = Math.max(1.5, s * .075); ctx.lineWidth = lw;
  const P = () => ctx.beginPath();
  switch (ch) {
    case '▮': ctx.fillRect(cx - .14 * s, y - .74 * s, .28 * s, .86 * s); break;
    case '▶': P(); ctx.moveTo(cx - .2 * s, cy - .26 * s); ctx.lineTo(cx + .24 * s, cy); ctx.lineTo(cx - .2 * s, cy + .26 * s); ctx.closePath(); ctx.fill(); break;
    case '✻': case '✦': { const n = ch === '✻' ? 6 : 4; for (let i = 0; i < n; i++) { const a = i / n * Math.PI; ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); rr(ctx, -.27 * s, -.055 * s, .54 * s, .11 * s, .055 * s); ctx.fill(); ctx.restore(); } break; }
    case '⏺': P(); ctx.arc(cx, cy, .2 * s, 0, TAU); ctx.fill(); break;
    case '⇥': P(); ctx.moveTo(cx - .25 * s, cy); ctx.lineTo(cx + .15 * s, cy); ctx.moveTo(cx + .02 * s, cy - .13 * s); ctx.lineTo(cx + .15 * s, cy); ctx.lineTo(cx + .02 * s, cy + .13 * s); ctx.moveTo(cx + .24 * s, cy - .2 * s); ctx.lineTo(cx + .24 * s, cy + .2 * s); ctx.stroke(); break;
    case '✓': case '✅': if (ch === '✅') { rr(ctx, cx - .27 * s, cy - .3 * s, .54 * s, .6 * s, .08 * s); ctx.fillStyle = '#2E9E4E'; ctx.fill(); ctx.strokeStyle = '#fff'; } P(); ctx.moveTo(cx - .18 * s, cy + .02 * s); ctx.lineTo(cx - .05 * s, cy + .16 * s); ctx.lineTo(cx + .2 * s, cy - .18 * s); ctx.lineWidth = lw * 1.3; ctx.stroke(); break;
    case '✕': case '×': P(); ctx.moveTo(cx - .17 * s, cy - .17 * s); ctx.lineTo(cx + .17 * s, cy + .17 * s); ctx.moveTo(cx + .17 * s, cy - .17 * s); ctx.lineTo(cx - .17 * s, cy + .17 * s); ctx.stroke(); break;
    case '→': P(); ctx.moveTo(cx - .25 * s, cy); ctx.lineTo(cx + .22 * s, cy); ctx.moveTo(cx + .08 * s, cy - .14 * s); ctx.lineTo(cx + .23 * s, cy); ctx.lineTo(cx + .08 * s, cy + .14 * s); ctx.stroke(); break;
    case '↑': P(); ctx.moveTo(cx, cy + .25 * s); ctx.lineTo(cx, cy - .22 * s); ctx.moveTo(cx - .14 * s, cy - .08 * s); ctx.lineTo(cx, cy - .23 * s); ctx.lineTo(cx + .14 * s, cy - .08 * s); ctx.stroke(); break;
    case '■': ctx.fillRect(cx - .17 * s, cy - .17 * s, .34 * s, .34 * s); break;
    case '⏸': ctx.fillRect(cx - .17 * s, cy - .22 * s, .12 * s, .44 * s); ctx.fillRect(cx + .05 * s, cy - .22 * s, .12 * s, .44 * s); break;
    case '⏭': P(); ctx.moveTo(cx - .25 * s, cy - .2 * s); ctx.lineTo(cx, cy); ctx.lineTo(cx - .25 * s, cy + .2 * s); ctx.closePath(); ctx.moveTo(cx - .03 * s, cy - .2 * s); ctx.lineTo(cx + .2 * s, cy); ctx.lineTo(cx - .03 * s, cy + .2 * s); ctx.closePath(); ctx.fill(); ctx.fillRect(cx + .2 * s, cy - .2 * s, .07 * s, .4 * s); break;
    case '⏎': P(); ctx.moveTo(cx + .2 * s, cy - .22 * s); ctx.lineTo(cx + .2 * s, cy + .06 * s); ctx.lineTo(cx - .2 * s, cy + .06 * s); ctx.moveTo(cx - .08 * s, cy - .06 * s); ctx.lineTo(cx - .2 * s, cy + .06 * s); ctx.lineTo(cx - .08 * s, cy + .18 * s); ctx.stroke(); break;
    case '👍': case '👎': { ctx.save(); ctx.translate(cx, cy); if (ch === '👎') ctx.rotate(Math.PI); rr(ctx, -.26 * s, -.02 * s, .1 * s, .3 * s, .03 * s); ctx.fill(); P(); ctx.moveTo(-.13 * s, 0); ctx.lineTo(-.02 * s, -.12 * s); ctx.lineTo(.0, -.3 * s); ctx.quadraticCurveTo(.1 * s, -.3 * s, .08 * s, -.08 * s); ctx.lineTo(.25 * s, -.06 * s); ctx.quadraticCurveTo(.3 * s, .12 * s, .2 * s, .28 * s); ctx.lineTo(-.13 * s, .28 * s); ctx.closePath(); ctx.fill(); ctx.restore(); break; }
    case '👁': P(); ctx.ellipse(cx, cy, .27 * s, .15 * s, 0, 0, TAU); ctx.stroke(); P(); ctx.arc(cx, cy, .08 * s, 0, TAU); ctx.fill(); break;
    case '🎲': rr(ctx, cx - .24 * s, cy - .24 * s, .48 * s, .48 * s, .08 * s); ctx.stroke(); for (const [dx, dy] of [[-.1, -.1], [0, 0], [.1, .1]]) { P(); ctx.arc(cx + dx * s, cy + dy * s, .035 * s, 0, TAU); ctx.fill(); } break;
  }
  ctx.restore();
}
// draw a string; rich tokens get vector glyphs in a mono cell. Returns width.
// font: css font string; for non-mono fonts the cell is still 0.6em.
function drawRich(ctx, str, x, y, font, color, o = {}) {
  const size = +(font.match(/(\d+(?:\.\d+)?)px/) || [0, 16])[1];
  ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  if (o.stretch) ctx.fontStretch = o.stretch;
  // measure first for alignment
  let total = 0; const runs = []; let cur = '';
  for (const ch of Array.from(str)) {
    if (RICH.includes(ch)) { if (cur) { runs.push(cur); cur = ''; } runs.push({ g: ch }); } else cur += ch;
  }
  if (cur) runs.push(cur);
  const widths = runs.map(r => typeof r === 'string' ? ctx.measureText(r).width : .6 * size);
  total = widths.reduce((a, b) => a + b, 0);
  let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
  runs.forEach((r, i) => {
    if (typeof r === 'string') { if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.strokeW || 4; ctx.lineJoin = 'round'; ctx.strokeText(r, cx, y); } ctx.fillText(r, cx, y); }
    else richGlyph(ctx, r.g, cx, y, size, r.color || color);
    cx += widths[i];
  });
  ctx.restore();
  return total;
}
function richWidth(ctx, str, font) {
  const size = +(font.match(/(\d+(?:\.\d+)?)px/) || [0, 16])[1];
  ctx.save(); ctx.font = font; let w = 0, cur = '';
  for (const ch of Array.from(str)) { if (RICH.includes(ch)) { w += ctx.measureText(cur).width + .6 * size; cur = ''; } else cur += ch; }
  w += ctx.measureText(cur).width; ctx.restore(); return w;
}
const mono = (px, wt = 400) => `${wt} ${px}px ${FONTS.mono}`;

// ---------------------------------------------------------------- HERO type
// hero(ctx, 'WORLD', x, y(baseline), size, {stretch:'cond', color, shadow:CLAY_DARK, align, sx, age(slam), ...})
function heroWidth(ctx, str, size, stretch = 'cond') {
  ctx.save(); ctx.font = `900 ${size}px ${FONTS.hero}`; ctx.fontStretch = STRETCH[stretch] || stretch; ctx.letterSpacing = (-0.03 * size) + 'px';
  const w = ctx.measureText(str).width; ctx.restore(); return w;
}
function hero(ctx, str, x, y, size, o = {}) {
  const { stretch = 'cond', color = C.PAPER, shadow = C.CLAY_DARK, shadowOff = 8, align = 'center', sx = 1, alpha = 1,
    age = null, ghosts = true, outline = null, outlineW = 0, clip = null, kick = 1 } = o;
  let s = 1, a = alpha;
  if (age !== null) {
    if (age < 0) return;
    // SLAM: 2.4 -> 0.94 -> 1.0 (expo out, then spring)
    const k1 = clamp(age / .12);
    s = age < .12 ? lerp(2.4, .94, E.outExpo(k1)) : 1 - .06 * Math.exp(-14 * (age - .12)) * Math.cos((age - .12) * 30);
    a *= clamp(age / .04);
  }
  ctx.save();
  ctx.font = `900 ${size}px ${FONTS.hero}`; ctx.fontStretch = STRETCH[stretch] || stretch; ctx.letterSpacing = (-0.03 * size) + 'px';
  ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  const capMid = y - size * .345;
  const draw = (sc, al, col, dx = 0, dy = 0) => {
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(x + dx, capMid + dy); ctx.scale(sc * sx, sc); ctx.translate(0, size * .345);
    if (outline && outlineW) { ctx.lineJoin = 'round'; ctx.strokeStyle = outline; ctx.lineWidth = outlineW / sc; ctx.strokeText(str, 0, 0); }
    ctx.fillStyle = col; ctx.fillText(str, 0, 0); ctx.restore();
  };
  if (age !== null && ghosts && age < .3) { // motion ghosts
    [[.25, 1.35], [.12, 1.7], [.06, 2.1]].forEach(([ga, gs]) => { if (age < .12 * gs) draw(lerp(gs, 1, clamp(age / .3)), ga * (1 - age / .3), color); });
  }
  if (shadow) draw(s, a, shadow, shadowOff, shadowOff);
  draw(s, a, color);
  ctx.restore();
}

// ---------------------------------------------------------------- printed INK card (post-process)
// G.post.ground: 'ink' (printed, margin), 'inkx' (exempt: full bleed), 'paper', 'white'
// G.post.lift: 0..1 (0 = full flood with 22px margin; 1 = flood fully lifted -> paper)
// G.post.edgeSeed: section seed for the static noisy edge; G.post.sliver: 'bl'|'tr'|...
const PRINT = { margin: 22, edge: null, inkGrain: null, paperGrain: [] };
function buildPrint() {
  // static ink grain: 2x2 clusters, +-2%
  const g = makeCanvas(W / 2, H / 2), x = g.getContext('2d'), R = rng('inkgrain');
  const img = x.createImageData(g.width, g.height), d = img.data;
  for (let k = 0; k < d.length; k += 4) { const v = R(); d[k] = d[k + 1] = d[k + 2] = v > .5 ? 255 : 0; d[k + 3] = Math.abs(v - .5) * 2 * 14; }
  x.putImageData(img, 0, 0); PRINT.inkGrain = g;
  for (let f = 0; f < 8; f++) {
    const c = makeCanvas(W / 2, H / 2), cx = c.getContext('2d'), R2 = rng('pgrain' + f);
    const im = cx.createImageData(c.width, c.height), dd = im.data;
    for (let k = 0; k < dd.length; k += 4) { const v = R2(); dd[k] = dd[k + 1] = dd[k + 2] = v > .5 ? 255 : 30; dd[k + 3] = Math.abs(v - .5) * 2 * 16; }
    cx.putImageData(im, 0, 0); PRINT.paperGrain.push(c);
  }
}
// noisy inset rectangle path (static per seed). inset in px; amp = edge noise
function floodPath(ctx, inset, seed = 1, amp = 3, off = [0, 0]) {
  const pts = [], step = 12;
  const n = (i, side) => noise1(i / 9, seed * 17 + side) * amp + noise1(i / 2.3, seed * 31 + side) * amp * .35;
  const x0 = inset + off[0], y0 = inset + off[1], x1 = W - inset + off[0], y1 = H - inset + off[1];
  if (x1 - x0 < 4 || y1 - y0 < 4) return false;
  ctx.beginPath();
  let i = 0;
  for (let x = x0; x <= x1; x += step) ctx.lineTo(x, y0 + n(i++, 1));
  for (let y = y0; y <= y1; y += step) ctx.lineTo(x1 + n(i++, 2), y);
  for (let x = x1; x >= x0; x -= step) ctx.lineTo(x, y1 + n(i++, 3));
  for (let y = y1; y >= y0; y -= step) ctx.lineTo(x0 + n(i++, 4), y);
  ctx.closePath();
  return true;
}
function printPass(X) {
  const P = G.post;
  const ground = P.ground || 'ink';
  if (ground === 'inkx' || ground === 'white' || ground === 'none') return;
  const lift = clamp(P.lift || 0);
  if (ground === 'paper' && !lift) return;
  // margin overlay: paper outside the flood, CLAY underprint sliver
  const inset = ground === 'paper' ? W : PRINT.margin + E.in2(lift) * (H / 2 + 20);
  // perf (hook agent): the static margin (no lift) is cached as a CPU canvas; rebuilding it through the
  // swiftshader-backed layers cost ~500 ms per INK frame. Output is identical.
  const ckey = !lift && `${inset}|${P.edgeSeed || 1}|${P.sliver || 'bl'}|${G.scale}`;
  if (ckey && PRINT.cache && PRINT.cache.has(ckey)) { X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(PRINT.cache.get(ckey), 0, 0); X.restore(); return; }
  const L = layer('_printmargin');
  L.fillStyle = C.PAPER; L.fillRect(0, 0, W, H);
  L.globalCompositeOperation = 'destination-out';
  if (floodPath(L, inset, P.edgeSeed || 1, 3)) L.fill();
  L.globalCompositeOperation = 'source-over';
  // CLAY underprint peeks out beyond the flood on one side (offset 2px)
  const sl = { bl: [-2, 2], tr: [2, -2], br: [2, 2], tl: [-2, -2] }[P.sliver || 'bl'];
  const U = layer('_printunder');
  U.fillStyle = C.CLAY; if (floodPath(U, inset, P.edgeSeed || 1, 3, sl)) U.fill();
  U.globalCompositeOperation = 'destination-out'; if (floodPath(U, inset, P.edgeSeed || 1, 3)) U.fill(); U.globalCompositeOperation = 'source-over';
  drawLayer(L, '_printunder', { op: 'source-over', alpha: .9 });
  if (ckey) {
    const src = layerCanvas('_printmargin'), c = new OffscreenCanvas(src.width, src.height);
    c.getContext('2d', { willReadFrequently: true }).drawImage(src, 0, 0);
    (PRINT.cache = PRINT.cache || new Map()).set(ckey, c);
  }
  drawLayer(X, '_printmargin');
}
// replaces gfx finish(): print margin, grain (static on INK, boil on PAPER), paper texture multiply
function finishStyle(X) {
  const P = Object.assign({ ground: 'ink', grain: 1, paperTex: 1 }, G.post);
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
  const cw = X.canvas.width, ch = X.canvas.height;
  // ink grain (static) over everything, subtle
  if (P.grain) { X.globalAlpha = .9 * P.grain; X.globalCompositeOperation = 'overlay'; X.drawImage(PRINT.inkGrain, 0, 0, cw, ch); }
  X.restore();
  X.save(); X.setTransform(G.scale, 0, 0, G.scale, 0, 0); printPass(X); X.restore();
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
  if (P.paperTex) { X.globalCompositeOperation = 'multiply'; X.globalAlpha = P.paperTex; X.drawImage(G.paper, 0, 0, cw, ch); }
  if (P.ground === 'paper' || P.lift > .5) { X.globalCompositeOperation = 'multiply'; X.globalAlpha = .55; X.drawImage(PRINT.paperGrain[boilT(G.t) % 8], 0, 0, cw, ch); }
  X.restore();
}

// ---------------------------------------------------------------- grounds
function groundInk(ctx) { ctx.fillStyle = C.INK; ctx.fillRect(-50, -50, W + 100, H + 100); G.post.ground = G.post.ground || 'ink'; }
function groundPaper(ctx) { ctx.fillStyle = C.PAPER; ctx.fillRect(-50, -50, W + 100, H + 100); G.post.ground = 'paper'; }

// halftone dots in screen space over a path already set on ctx (fills the current path with dots)
function halftoneFill(ctx, color, density = .5, cell = 12, angle = 45) { ctx.save(); ctx.fillStyle = halftone(ctx, color, density, cell, angle); ctx.fill(); ctx.restore(); }

window.STYLE_INIT = async () => { buildPrint(); };
Object.assign(window, { C, STRETCH, drawRich, richWidth, richGlyph, mono, hero, heroWidth, printPass, finishStyle, floodPath, groundInk, groundPaper, halftoneFill, PRINT });
