// type.js: kinetic typography helpers. All sizes in logical px (1920x1080 space).
'use strict';

const FONTS = {}; // role -> css family, filled by the style bible (engine/style.js)
const _mcache = new Map();
function fontStr(size, fam = 'sans-serif', weight = 400, style = 'normal') { return `${style} ${weight} ${size}px ${fam}`; }
function measure(ctx, str, f, tracking = 0) {
  const k = f + '|' + tracking + '|' + str; let v = _mcache.get(k);
  if (v === undefined) { ctx.save(); ctx.font = f; ctx.letterSpacing = tracking + 'px'; v = ctx.measureText(str).width; ctx.restore(); _mcache.set(k, v); if (_mcache.size > 20000) _mcache.clear(); }
  return v;
}
// font size that makes str exactly `w` wide
function fitSize(ctx, str, w, fam, weight = 400, tracking = 0, style = 'normal') {
  const base = 100; const m = measure(ctx, str, fontStr(base, fam, weight, style), tracking * base / 100);
  return base * w / Math.max(1, m);
}

// draw text with common options
function txt(ctx, str, x, y, o = {}) {
  const { size = 60, fam = FONTS.body || 'sans-serif', weight = 400, style = 'normal', color = '#111', align = 'left', base = 'alphabetic',
    tracking = 0, stroke = null, strokeW = 0, alpha = 1, rot = 0, sx = 1, sy = 1, shadow = null, op = null } = o;
  ctx.save();
  ctx.translate(x, y); if (rot) ctx.rotate(rot); if (sx !== 1 || sy !== 1) ctx.scale(sx, sy);
  ctx.font = fontStr(size, fam, weight, style); ctx.letterSpacing = tracking + 'px';
  ctx.textAlign = align; ctx.textBaseline = base; ctx.globalAlpha *= alpha; if (op) ctx.globalCompositeOperation = op;
  if (shadow) { ctx.fillStyle = shadow.color; ctx.fillText(str, shadow.x, shadow.y); }
  if (stroke && strokeW) { ctx.lineJoin = 'round'; ctx.miterLimit = 2; ctx.strokeStyle = stroke; ctx.lineWidth = strokeW; ctx.strokeText(str, 0, 0); }
  if (color) { ctx.fillStyle = color; ctx.fillText(str, 0, 0); }
  ctx.restore();
}

// per-glyph layout of a string (with tracking); returns [{ch, x, w}] relative to the left edge
function glyphs(ctx, str, f, tracking = 0) {
  const out = []; let prev = 0;
  for (let i = 0; i < str.length; i++) {
    const w1 = measure(ctx, str.slice(0, i + 1), f, tracking);
    out.push({ ch: str[i], x: prev, w: w1 - prev, i });
    prev = w1;
  }
  return out;
}

// letter-by-letter animated text. age = seconds since the entrance began.
// mode: 'pop' | 'rise' | 'drop' | 'type' | 'scramble' | 'stretch' | 'spin'
function kinetic(ctx, str, x, y, age, o = {}) {
  const { size = 120, fam = FONTS.display || 'sans-serif', weight = 800, style = 'normal', color = '#111', align = 'left', tracking = 0,
    mode = 'pop', stagger = .035, dur = .45, stroke = null, strokeW = 0, shadow = null, exitAge = -1, exitDur = .3, exitMode = 'drop', seed = 0, jitter = 0, t = 0 } = o;
  const f = fontStr(size, fam, weight, style);
  const gl = glyphs(ctx, str, f, tracking);
  const total = measure(ctx, str, f, tracking);
  const x0 = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  ctx.save(); ctx.font = f; ctx.letterSpacing = '0px'; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.lineJoin = 'round';
  const SCR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$<>/\\';
  for (const g of gl) {
    if (g.ch === ' ') continue;
    const a = age - g.i * stagger;
    let k = clamp(a / dur), s = 1, dx = 0, dy = 0, r = 0, al = 1, ch = g.ch;
    if (a < 0) continue;
    if (mode === 'pop') { s = E.back(k, 2.2); al = clamp(k * 4); }
    else if (mode === 'rise') { dy = (1 - E.out4(k)) * size * .6; al = clamp(k * 2.5); }
    else if (mode === 'drop') { dy = -(1 - E.bounce(k)) * size * .9; }
    else if (mode === 'stretch') { s = 1; dy = 0; al = 1; }
    else if (mode === 'spin') { r = (1 - E.out3(k)) * 2.2 * (hash(g.i + seed) > .5 ? 1 : -1); s = E.back(k); }
    else if (mode === 'type') { if (k <= 0) continue; }
    else if (mode === 'scramble') { if (k < 1) ch = SCR[Math.floor(hash2(boilT(t) * 7 + g.i, seed) * SCR.length)]; }
    if (exitAge >= 0 && age > exitAge) {
      const e = clamp((age - exitAge - g.i * stagger * .5) / exitDur);
      if (exitMode === 'drop') { dy += E.in3(e) * size * 1.4; r += e * (hash(g.i + 5) - .5); al *= 1 - e * e; }
      else if (exitMode === 'fade') al *= 1 - e;
      else if (exitMode === 'up') { dy -= E.in3(e) * size; al *= 1 - e; }
      else if (exitMode === 'shrink') s *= 1 - E.in3(e);
    }
    if (al <= 0 || s <= 0) continue;
    if (jitter) { dx += jit(t, g.i * 3 + seed, jitter); dy += jit(t, g.i * 3 + 1 + seed, jitter); r += jit(t, g.i * 3 + 2 + seed, jitter * .01); }
    const cx = x0 + g.x + g.w / 2;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(cx + dx, y + dy); if (r) ctx.rotate(r); if (s !== 1) ctx.scale(s, s);
    if (shadow) { ctx.fillStyle = shadow.color; ctx.fillText(ch, -g.w / 2 + shadow.x, shadow.y); }
    if (stroke && strokeW) { ctx.strokeStyle = stroke; ctx.lineWidth = strokeW; ctx.strokeText(ch, -g.w / 2, 0); }
    if (color) { ctx.fillStyle = color; ctx.fillText(ch, -g.w / 2, 0); }
    ctx.restore();
  }
  ctx.restore();
  return total;
}

// word-synced line (karaoke). L = SONG line {text, s, e, words:[{w,s,e}]}; draws words that have started.
// styles: sung words fill with `color`, upcoming words in `ghost` (or hidden when ghost=null).
function karaoke(ctx, L, t, x, y, o = {}) {
  if (!L) return;
  const { size = 54, fam = FONTS.body || 'sans-serif', weight = 600, color = '#111', ghost = null, align = 'center', gap = .28, pop = true, maxW = 1600, hl = null, lead = .06 } = o;
  const f = fontStr(size, fam, weight);
  const words = L.words || [];
  const sp = measure(ctx, ' ', f) + size * (gap - .25);
  const widths = words.map(w => measure(ctx, w.d || w.w, f));
  const total = widths.reduce((a, b) => a + b, 0) + sp * Math.max(0, words.length - 1);
  let scale = total > maxW ? maxW / total : 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  let cx = align === 'center' ? -total / 2 : align === 'right' ? -total : 0;
  ctx.font = f; ctx.textBaseline = 'alphabetic';
  words.forEach((w, i) => {
    const a = t - (w.s - lead);
    const str = w.d || w.w;
    if (a >= 0) {
      const k = pop ? E.back(clamp(a / .18), 2.5) : 1;
      ctx.save(); ctx.translate(cx + widths[i] / 2, 0); ctx.scale(k, k);
      if (hl && t >= w.s && t <= w.e + .05) { ctx.fillStyle = hl; ctx.fillRect(-widths[i] / 2 - 6, -size * .82, widths[i] + 12, size * 1.05); }
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.fillText(str, 0, 0); ctx.restore();
    } else if (ghost) { ctx.fillStyle = ghost; ctx.textAlign = 'center'; ctx.fillText(str, cx + widths[i] / 2, 0); }
    cx += widths[i] + sp;
  });
  ctx.restore();
}

// typewriter with caret; returns visible string
function typewriter(ctx, str, x, y, age, o = {}) {
  const { cps = 28, size = 36, fam = FONTS.mono || 'monospace', weight = 400, color = '#111', caret = true, align = 'left', lineH = 1.3, maxW = 0 } = o;
  const n = Math.max(0, Math.floor(age * cps));
  const vis = str.slice(0, n);
  ctx.save(); ctx.font = fontStr(size, fam, weight); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  const lines = maxW ? wrap(ctx, vis, maxW) : vis.split('\n');
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * size * lineH));
  if (caret && Math.floor(age * 2.2) % 2 === 0) {
    const last = lines[lines.length - 1] || '';
    const cw = ctx.measureText(last).width;
    ctx.fillRect(x + (align === 'left' ? cw + 4 : 0), y + (lines.length - 1) * size * lineH - size * .8, size * .5, size * .95);
  }
  ctx.restore();
  return vis;
}
function wrap(ctx, str, maxW) {
  const out = [];
  for (const para of str.split('\n')) {
    let line = '';
    for (const w of para.split(' ')) { const tryL = line ? line + ' ' + w : w; if (ctx.measureText(tryL).width > maxW && line) { out.push(line); line = w; } else line = tryL; }
    out.push(line);
  }
  return out;
}

Object.assign(window, { FONTS, fontStr, measure, fitSize, txt, glyphs, kinetic, karaoke, typewriter, wrap });
