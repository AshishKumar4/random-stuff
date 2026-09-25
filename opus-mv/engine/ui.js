// ui.js: recurring set pieces (BIBLE §6.2, §6.3, §7.2, §7.10): the brand frame, the glyph galaxy,
// the context/seek bar, chat bubbles with ■ end_turn, the pointer, Hertzfeldt humans and hands,
// mini Opus faces for the tab sky, stickers, subtitles. All in 1920x1080 logical space.
'use strict';

// ---------------------------------------------------------------- lyric helpers (grid time)
// LYR: sung lines from the composition timeline: [{id, sec, text, s, e, words:[{w,s,e}]}]
function lyricAt(t, pad = .12) { return lineAt(t, pad); }
function lineText(L) { return L ? (L.display || L.text) : ''; }

// subtitle (§7.4 SUBTITLE): baseline y 950; current word scale 1.06 + CLAY underline
function subtitle(ctx, L, t, o = {}) {
  if (!L) return;
  const { y = 950, size = 60, fam = FONTS.mono, weight = 500, color = C.INK, plate = null, italic = false, x = W / 2, hold = .2, fadeIn = .1 } = o;
  const words = L.words || [];
  const a = clamp((t - (L.s - .07)) / fadeIn) * clamp((L.e + hold - t) / .07);
  if (a <= 0) return;
  const f = `${italic ? 'italic ' : ''}${weight} ${size}px ${fam}`;
  ctx.save(); ctx.globalAlpha *= a; ctx.font = f; ctx.textBaseline = 'alphabetic';
  const sp = ctx.measureText(' ').width;
  const ws = words.length ? words.map(w => w.d || w.w) : [lineText(L)];
  const widths = ws.map(s => ctx.measureText(s).width);
  const total = widths.reduce((p, q) => p + q, 0) + sp * (ws.length - 1);
  const maxW = o.maxW || 1500; const sc = total > maxW ? maxW / total : 1;
  ctx.translate(x, y); ctx.scale(sc, sc);
  if (plate) { ctx.fillStyle = plate; rr(ctx, -total / 2 - 28, -size * .95, total + 56, size * 1.35, 10); ctx.fill(); }
  let cx = -total / 2;
  ws.forEach((s, i) => {
    const w = words[i]; const on = w && t >= w.s - .04 && t <= w.e + .04;
    ctx.save(); ctx.translate(cx + widths[i] / 2, 0); if (on) ctx.scale(1.06, 1.06);
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.fillText(s, 0, 0);
    if (on) { ctx.fillStyle = C.CLAY; ctx.fillRect(-widths[i] / 2, size * .14, widths[i], Math.max(3, size * .07)); }
    ctx.restore(); cx += widths[i] + sp;
  });
  ctx.restore();
}

// ---------------------------------------------------------------- glyph galaxy (§7.2)
let _galaxy = null;
function galaxyAtlas() {
  if (_galaxy) return _galaxy;
  const glyphs = 'abcdefghijklmnopqrstuvwxyz0123456789{}<>=+*/#@&?!hi안녕✻'.split('');
  const inks = [C.CLAY, C.CLAY, C.CLAY, C.CLAY, C.CLAY, C.CLAY, C.CLAY, C.CLAY, C.CLAY, C.CLAY, C.CLAY, C.SPARK, C.SPARK, C.SPARK, C.SPARK, C.PAPER, C.PAPER, C.PAPER, C.TEAL, C.TEAL];
  const cell = 40, cols = glyphs.length, rows = inks.length;
  const c = makeCanvas(cols * cell, 4 * cell), x = c.getContext('2d');
  const uniq = [C.CLAY, C.SPARK, C.PAPER, C.TEAL];
  x.textAlign = 'center'; x.textBaseline = 'middle';
  uniq.forEach((col, r) => glyphs.forEach((g, i) => { x.fillStyle = col; x.font = (/[안녕]/.test(g) ? `900 30px ${FONTS.hangul}` : `600 30px ${FONTS.mono}`); if (g === '✻') richGlyph(x, '✻', i * cell + 8, r * cell + 32, 38, col); else x.fillText(g, i * cell + cell / 2, r * cell + cell / 2); }));
  const R = rng('galaxy'), stars = [];
  for (let i = 0; i < 3000; i++) {
    const arm = i % 2, u = Math.pow(R(), .7), th = u * 3.4 * Math.PI + arm * Math.PI + (R() - .5) * .5;
    const rad = 40 * Math.exp(.26 * th) * (1 + (R() - .5) * .25);
    const inkR = R(), ink = inkR < .55 ? 0 : inkR < .75 ? 1 : inkR < .9 ? 2 : 3;
    stars.push({ th, rad, g: Math.floor(R() * glyphs.length), ink, s: .35 + R() * .75, tw: R() });
  }
  _galaxy = { c, cell, stars, n: glyphs.length };
  return _galaxy;
}
// draw galaxy centred at (cx, cy); scale; density 0..1; rotation grows 6°/bar; kick brightens
function galaxy(ctx, t, cx = 960, cy = 560, o = {}) {
  const { scale = 1, density = 1, alpha = 1, rot = 0, holes = null } = o;
  const g = galaxyAtlas();
  const ang = barPos(t) * 6 * Math.PI / 180 + rot;
  const kick = 1 + .35 * pulse(t, 5);
  ctx.save(); ctx.globalAlpha *= alpha;
  for (let i = 0; i < g.stars.length; i++) {
    const s = g.stars[i];
    if (hash(i * 7 + 1) > density) continue;
    const th = s.th + ang, r = s.rad * scale;
    const x = cx + Math.cos(th) * r, y = cy + Math.sin(th) * r * .62;
    if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;
    if (holes && holes(x, y) && hash(i * 3) > .2) continue;
    const sz = g.cell * s.s * scale * .55 * (s.ink === 1 ? kick : 1);
    const tw = .55 + .45 * Math.sin(t * 3 + s.tw * 40);
    ctx.globalAlpha = alpha * tw;
    ctx.drawImage(g.c, s.g * g.cell, s.ink * g.cell, g.cell, g.cell, x - sz / 2, y - sz / 2, sz, sz);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- brand frame (§7.2)
// the chorus template. o.tabLabel, o.counter, o.subtitleLine (SONG line), o.caret
function brandTabStrip(ctx, t, o = {}) {
  const { y0 = 0, label = '✻ the universe', counter = null, plus = true, close = true, tabs = null } = o;
  ctx.save();
  ctx.fillStyle = C.PAPER; ctx.fillRect(0, y0, W, 192);
  // tab
  const f = mono(72, 500), tw = richWidth(ctx, label, f) + 190;
  ctx.fillStyle = C.PAPER; ctx.strokeStyle = C.INK; ctx.lineWidth = 4;
  rr(ctx, 96, y0 + 52, tw, 140 + 20, 28); ctx.fillStyle = mix(C.PAPER, C.WHITE, .5); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.PAPER; ctx.fillRect(98, y0 + 188, tw - 4, 12);
  drawRich(ctx, label, 140, y0 + 150, f, C.INK);
  if (close) drawRich(ctx, '×', 96 + tw - 90, y0 + 150, f, o.closeColor || C.INK);
  if (plus) drawRich(ctx, '+', 96 + tw + 40, y0 + 150, mono(72, 300), C.UI_GREY);
  if (counter) { ctx.font = mono(48, 500); ctx.fillStyle = C.INK; ctx.textAlign = 'right'; ctx.fillText(counter, W - 110, y0 + 140); }
  ctx.fillStyle = C.INK; ctx.fillRect(0, y0 + 190, W, 3);
  ctx.restore();
  return { tabX: 96, tabW: tw };
}
function brandInputBar(ctx, t, o = {}) {
  const { y0 = 900, h = 100, line = null, placeholder = 'Reply to Opus…' } = o;
  ctx.save();
  ctx.fillStyle = C.PAPER; ctx.fillRect(0, y0, W, h);
  ctx.fillStyle = C.INK; ctx.fillRect(0, y0, W, 3);
  if (line && t >= line.s - .1 && t <= line.e + .25) subtitle(ctx, line, t, { y: y0 + 50 + 18, size: 58, color: C.INK });
  else {
    ctx.font = mono(48, 400); ctx.fillStyle = C.UI_GREY; ctx.textAlign = 'left'; ctx.fillText(placeholder, 150, y0 + 66);
    if (Math.floor(t * 2.2) % 2 === 0) { ctx.fillStyle = C.CLAY; ctx.fillRect(122, y0 + 26, 12, 50); }
  }
  ctx.restore();
}
function brandRails(ctx) {
  ctx.save(); ctx.strokeStyle = C.PAPER; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(72, 192); ctx.lineTo(72, 900); ctx.moveTo(1848, 192); ctx.lineTo(1848, 900); ctx.stroke(); ctx.restore();
}
// spotlight halftone disc on the floor
function spotDisc(ctx, cx = 960, cy = 890, rx = 420, ry = 70, col = C.CLAY) {
  ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.fillStyle = halftone(ctx, col, .35, 14, 45); ctx.globalAlpha = .6; ctx.fill(); ctx.restore();
}

// ---------------------------------------------------------------- context bar (§7.10)
function contextBar(ctx, fill, o = {}) {
  const { onPaper = false, ticks = [], label = null, cur = -1, lastLit = false } = o;
  ctx.save();
  ctx.fillStyle = onPaper ? rgba(C.INK, .12) : rgba(C.PAPER, .18); ctx.fillRect(96, 1030, 1728, 8);
  ctx.fillStyle = onPaper ? rgba(C.INK, .5) : rgba(C.PAPER, .7); ctx.fillRect(96, 1030, 1728 * clamp(fill), 8);
  ticks.forEach((k, i) => { ctx.fillStyle = i === cur ? C.CLAY : (i === ticks.length - 1 && !lastLit) ? rgba(onPaper ? C.INK : C.PAPER, .3) : (onPaper ? C.INK : C.PAPER); ctx.fillRect(96 + 1728 * k - 2, 1026, 4, 16); });
  if (label) { ctx.font = mono(36, 500); ctx.textAlign = 'center'; ctx.fillStyle = onPaper ? C.INK : C.PAPER; drawRich(ctx, label, 960, 1010, mono(36, 500), onPaper ? C.INK : C.PAPER, { align: 'center' }); }
  ctx.restore();
}

// ---------------------------------------------------------------- chat bubbles
function bubble(ctx, x, y, text, o = {}) {
  const { who = 'human', size = 48, maxW = 900, pad = 26, endTurn = false, alpha = 1, align = who === 'human' ? 'right' : 'left', tail = true } = o;
  ctx.save(); ctx.globalAlpha *= alpha;
  const f = mono(size, 500); ctx.font = f;
  const lines = wrap(ctx, text, maxW - pad * 2);
  const w = Math.min(maxW, Math.max(...lines.map(l => richWidth(ctx, l, f))) + pad * 2), h = lines.length * size * 1.3 + pad * 1.4 + (endTurn ? size * .7 : 0);
  const bx = align === 'right' ? x - w : x, by = y;
  const bg = who === 'human' ? C.PINK : C.PAPER, fg = who === 'human' ? C.WHITE : C.INK;
  rr(ctx, bx, by, w, h, size * .55); ctx.fillStyle = bg; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.INK; ctx.stroke();
  if (tail) { ctx.beginPath(); const tx = align === 'right' ? bx + w - 30 : bx + 30; ctx.moveTo(tx - 14, by + h - 2); ctx.lineTo(tx + (align === 'right' ? 26 : -26), by + h + 22); ctx.lineTo(tx + 14, by + h - 2); ctx.fillStyle = bg; ctx.fill(); ctx.stroke(); ctx.fillRect(tx - 12, by + h - 6, 24, 6); }
  lines.forEach((l, i) => drawRich(ctx, l, bx + pad, by + pad + size * .95 + i * size * 1.3, f, fg));
  if (endTurn) drawRich(ctx, '■ end_turn', bx + pad, by + h - pad * .6, mono(Math.max(24, size * .5), 500), C.UI_GREY);
  ctx.restore();
  return { x: bx, y: by, w, h };
}

// ---------------------------------------------------------------- the pointer (the human's cursor)
function pointer(ctx, x, y, o = {}) {
  const { size = 180, tremble = 0, t = 0, press = 0, rot = 0 } = o;
  const dx = tremble ? noise1(t * 40, 5) * tremble : 0, dy = tremble ? noise1(t * 40, 9) * tremble : 0;
  ctx.save(); ctx.translate(x + dx, y + dy); ctx.rotate(rot); const s = size / 180 * (1 - press * .06); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 150); ctx.lineTo(38, 116); ctx.lineTo(64, 172); ctx.lineTo(90, 160); ctx.lineTo(64, 106); ctx.lineTo(110, 104); ctx.closePath();
  ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = C.PAPER; ctx.stroke(); ctx.fillStyle = C.INK; ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- Hertzfeldt humans (boil, on 2s)
function human(ctx, x, y, u, o = {}) {
  // (x,y) = feet; u = unit (head radius = .5u). o: {ground:'ink'|'paper', pose:{armL:[dx,dy], armR, legL, legR, lean}, t, hood, cowlick, eyes:'dot'|'closed', mouth}
  const { ground = 'paper', t = 0, seed = 1, hood = false, cowlick = false, lean = 0, look = 0 } = o;
  const tt = Math.floor(t * 15) / 15; // on 2s
  const col = ground === 'ink' ? C.PAPER : C.INK;
  const lw = ground === 'ink' ? 4 : 3;
  const J = (i, a = .8) => jit(tt, seed * 97 + i, a);
  const p = Object.assign({ armL: [-.55, .6], armR: [.55, .6], legL: [-.35, 0], legR: [.35, 0] }, o.pose || {});
  const hipY = -1.6 * u, neckY = -3.0 * u, headY = -3.55 * u;
  ctx.save(); ctx.translate(x, y); ctx.rotate(lean);
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const L = (a, b, c, i) => { ctx.beginPath(); ctx.moveTo(a[0] + J(i), a[1] + J(i + 1)); if (c) ctx.quadraticCurveTo(c[0] + J(i + 2), c[1] + J(i + 3), b[0] + J(i + 4), b[1] + J(i + 5)); else ctx.lineTo(b[0] + J(i + 4), b[1] + J(i + 5)); ctx.stroke(); };
  L([0, neckY], [0, hipY], null, 1);
  L([0, hipY], [p.legL[0] * u, p.legL[1] * u], [p.legL[0] * u * .5, hipY * .45], 10);
  L([0, hipY], [p.legR[0] * u, p.legR[1] * u], [p.legR[0] * u * .5, hipY * .45], 20);
  L([0, neckY + .15 * u], [p.armL[0] * u * 1.6, neckY + (1.3 - p.armL[1]) * u], [p.armL[0] * u, neckY + .7 * u], 30);
  L([0, neckY + .15 * u], [p.armR[0] * u * 1.6, neckY + (1.3 - p.armR[1]) * u], [p.armR[0] * u, neckY + .7 * u], 40);
  if (hood) { ctx.beginPath(); ctx.arc(J(50) - .12 * u, headY + J(51), .68 * u, Math.PI * .75, Math.PI * 1.95); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(J(60), headY + J(61), .5 * u, 0, TAU); if (ground === 'paper') { ctx.fillStyle = C.PAPER; ctx.fill(); } ctx.stroke();
  if (cowlick) { ctx.beginPath(); ctx.moveTo(-.1 * u, headY - .48 * u); ctx.lineTo(-.02 * u + J(70), headY - .72 * u); ctx.lineTo(.06 * u, headY - .52 * u); ctx.lineTo(.16 * u + J(71), headY - .74 * u); ctx.lineTo(.2 * u, headY - .46 * u); ctx.stroke(); }
  ctx.fillStyle = col;
  if (o.eyes !== 'none') for (const s of [-1, 1]) { if (o.eyes === 'closed') { ctx.beginPath(); ctx.arc(s * .11 * u + look * .12 * u, headY, .06 * u, 0, Math.PI); ctx.stroke(); } else { ctx.beginPath(); ctx.arc(s * .11 * u + look * .12 * u, headY - .02 * u, Math.max(2, .045 * u), 0, TAU); ctx.fill(); } }
  if (o.mouth) { ctx.beginPath(); ctx.arc(look * .1 * u, headY + .18 * u, .08 * u, .15 * Math.PI, .85 * Math.PI); ctx.stroke(); }
  if (o.hold) o.hold(ctx, u, p);
  ctx.restore();
}
// single-line hand (palm + four fingers) closing in steps; k 0 open .. 1 closed; for handovers
function stickHand(ctx, x, y, s, o = {}) {
  const { ground = 'ink', k = 0, rot = 0, t = 0, seed = 3 } = o;
  const col = ground === 'ink' ? C.PAPER : C.INK;
  const tt = Math.floor(t * 15) / 15; const J = i => jit(tt, seed * 31 + i, .8);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.strokeStyle = col; ctx.lineWidth = ground === 'ink' ? 5 : 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-1.6 * s + J(1), .1 * s); ctx.lineTo(-.3 * s + J(2), .05 * s + J(3)); ctx.stroke(); // wrist/arm
  ctx.beginPath(); ctx.moveTo(-.3 * s, -.45 * s); ctx.quadraticCurveTo(-.45 * s, .1 * s, -.25 * s, .5 * s); ctx.stroke(); // palm edge
  const kk = Math.floor(k * 3) / 3; // closes in 3 steps
  for (let i = 0; i < 4; i++) {
    const fy = lerp(-.4, .35, i / 3) * s, bend = kk * 1.6;
    ctx.beginPath(); ctx.moveTo(-.25 * s, fy); const ex = .55 * s * Math.cos(bend), ey = fy + .55 * s * Math.sin(bend) * .6;
    ctx.quadraticCurveTo(.2 * s + J(10 + i), fy + J(20 + i), ex, ey); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(-.2 * s, -.45 * s); ctx.quadraticCurveTo(.05 * s, -.8 * s + kk * .3 * s, .3 * s, -.7 * s + kk * .5 * s); ctx.stroke(); // thumb
  ctx.restore();
}

// ---------------------------------------------------------------- mini Opus face (tab sky, instances at small R)
function miniFace(ctx, x, y, r, o = {}) {
  const { lit = 1, dark = false, rays = 11, eyes = 'dot', pip = 0, stamp = 0 } = o;
  ctx.save(); ctx.translate(x, y);
  const col = dark ? mix(C.CLAY, C.INK, .75) : C.CLAY;
  ctx.fillStyle = col; ctx.strokeStyle = C.INK; ctx.lineWidth = Math.max(1, r * .06);
  const nR = rays === 5 ? [1, 3, 5, 7, 9] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  nR.forEach(i => { const [th, L, Wd, k] = RAYS[i]; rayPath(ctx, th * Math.PI / 180, .8 * r, L * r, Wd * r * RAY_W, k); ctx.fill(); if (r > 14) ctx.stroke(); });
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = dark ? mix(C.FACE, C.INK, .72) : C.FACE; ctx.fill(); if (r > 8) ctx.stroke();
  ctx.fillStyle = C.INK;
  if (!dark) for (const s of [-1, 1]) { if (eyes === 'happy') { ctx.beginPath(); ctx.arc(s * .34 * r, .12 * r, .12 * r, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = Math.max(1, r * .08); ctx.stroke(); } else { ctx.beginPath(); ctx.ellipse(s * .34 * r, .06 * r, Math.max(1, .13 * r), Math.max(1.2, .19 * r), 0, 0, TAU); ctx.fill(); } }
  if (pip > 0) { ctx.globalAlpha = pip; ctx.fillStyle = C.SPARK; star(ctx, r * .95, -r * .95, r * .45, .35, 4, 0); ctx.fill(); ctx.globalAlpha = 1; }
  if (stamp > 0) { ctx.globalAlpha = stamp; ctx.fillStyle = C.UI_GREY; ctx.fillRect(r * .6, r * .55, r * .5, r * .5); ctx.globalAlpha = 1; }
  ctx.restore();
}

// ---------------------------------------------------------------- stickers (§7.4 NONE): 3 flat riso bands + INK outline, Archivo expanded
function sticker(ctx, str, x, y, size, o = {}) {
  const { bands = [C.CLAY, C.SPARK, C.PAPER], rot = -.06, age = null, stretch = 'exp' } = o;
  let s = 1; if (age !== null) { if (age < 0) return; s = E.back(clamp(age / .22), 2.6); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `900 ${size}px ${FONTS.hero}`; ctx.fontStretch = STRETCH[stretch]; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = (-.02 * size) + 'px';
  ctx.lineJoin = 'round'; ctx.lineWidth = size * .16; ctx.strokeStyle = C.INK; ctx.strokeText(str, 0, 0);
  const m = ctx.measureText(str), cap = size * .69;
  bands.forEach((b, i) => { ctx.save(); ctx.beginPath(); ctx.rect(-m.width, -cap + i * cap / 3 - 1, m.width * 2, cap / 3 + 2 + (i === 2 ? size * .3 : 0)); ctx.clip(); ctx.fillStyle = b; ctx.fillText(str, 0, 0); ctx.restore(); });
  ctx.restore();
}

// sticky note (YELLOW, marker)
function stickyNote(ctx, x, y, w, h, lines, o = {}) {
  const { rot = -.03, size = 72, t = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = rgba(C.INK, .25); ctx.fillRect(8, 10, w, h);
  ctx.fillStyle = C.YELLOW; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = C.INK; ctx.font = `${size}px ${FONTS.marker}`; ctx.textAlign = 'left';
  lines.forEach((l, i) => ctx.fillText(l, 26, 26 + size * .95 + i * size * 1.08));
  ctx.restore();
}

Object.assign(window, { lyricAt, lineText, subtitle, galaxyAtlas, galaxy, brandTabStrip, brandInputBar, brandRails, spotDisc, contextBar, bubble, pointer, human, stickHand, miniFace, sticker, stickyNote });
