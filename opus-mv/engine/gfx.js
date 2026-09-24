// gfx.js: canvas, offscreen layers, paper + riso ink compositing, grain, halftone, camera, wipes.
'use strict';

const W = 1920, H = 1080;
const G = { X: null, C: null, scale: 1, t: 0, layers: new Map(), inkOrder: [], paper: null, grain: [], dots: new Map(), post: {} };

function makeCanvas(w, h) { const c = new OffscreenCanvas(Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); return c; }

function gfxInit(canvas, scale = 1) {
  G.C = canvas; G.scale = scale;
  canvas.width = Math.round(W * scale); canvas.height = Math.round(H * scale);
  G.X = canvas.getContext('2d', { alpha: false });
  buildPaper(); buildGrain();
}

// ---- offscreen layers (same logical 1920x1080 space). Cleared at frame start when used.
function layer(name, { w = W, h = H } = {}) {
  let L = G.layers.get(name);
  if (!L) {
    const c = makeCanvas(w * G.scale, h * G.scale);
    const x = c.getContext('2d');
    L = { c, x, w, h, used: -1 };
    G.layers.set(name, L);
  }
  if (L.used !== G.frameId) {
    L.x.setTransform(1, 0, 0, 1, 0, 0); L.x.globalAlpha = 1; L.x.globalCompositeOperation = 'source-over'; L.x.filter = 'none';
    L.x.clearRect(0, 0, L.c.width, L.c.height);
    L.x.setTransform(G.scale, 0, 0, G.scale, 0, 0);
    L.used = G.frameId;
  }
  return L.x;
}
const layerCanvas = name => G.layers.get(name).c;
function drawLayer(dst, name, { x = 0, y = 0, op = 'source-over', alpha = 1 } = {}) {
  const L = G.layers.get(name); if (!L || L.used !== G.frameId) return;
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.globalCompositeOperation = op; dst.globalAlpha = alpha;
  dst.drawImage(L.c, x * G.scale, y * G.scale); dst.restore();
}

// ---- riso inks: draw each plate in its layer (any colour; usually the ink colour), then
// inks() multiplies them onto the frame with per-plate misregistration + ink grain.
function ink(name) { if (!G.inkOrder.includes(name)) G.inkOrder.push(name); return layer('ink:' + name); }
function inks(dst = G.X, { mis = 2.2, grain = .35 } = {}) {
  G.inkOrder.forEach((name, i) => {
    const L = G.layers.get('ink:' + name); if (!L || L.used !== G.frameId) return;
    // ink texture: knock out a little of the plate with grain (uneven drum pressure)
    if (grain > 0) {
      L.x.save(); L.x.setTransform(1, 0, 0, 1, 0, 0); L.x.globalCompositeOperation = 'destination-out'; L.x.globalAlpha = grain;
      L.x.drawImage(G.grain[(boilT(G.t) + i * 2) % G.grain.length], 0, 0, L.c.width, L.c.height); L.x.restore();
    }
    const a = hash2(boilT(G.t) >> 1, i * 7) * TAU;
    drawLayer(dst, 'ink:' + name, { x: Math.cos(a) * mis * (i ? 1 : .4), y: Math.sin(a) * mis * (i ? 1 : .4), op: 'multiply' });
  });
  G.inkOrder = [];
}

// ---- paper: warm sheet with mottling, fibres and specks. Built once (deterministic).
function buildPaper() {
  const s = .5; // half-res texture, upscaled (soft, cheap)
  const c = makeCanvas(W * s, H * s), x = c.getContext('2d');
  const img = x.createImageData(c.width, c.height), d = img.data;
  for (let j = 0; j < c.height; j++) for (let i = 0; i < c.width; i++) {
    const m = fbm(i / 90, j / 90, 3, 4) * 10 + fbm(i / 9, j / 9, 11, 2) * 4 + (hash2(i, j) - .5) * 8;
    const k = (j * c.width + i) * 4;
    d[k] = 250 + m; d[k + 1] = 248 + m; d[k + 2] = 243 + m * 1.1; d[k + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  const R = rng('paper-fibres');
  x.lineCap = 'round';
  for (let n = 0; n < 2600; n++) {
    const px = R() * c.width, py = R() * c.height, a = R() * TAU, l = 2 + R() * 9;
    x.strokeStyle = R() < .5 ? 'rgba(120,100,80,.10)' : 'rgba(255,255,255,.35)'; x.lineWidth = .35 + R() * .5;
    x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + 1) * l * .5, py + Math.sin(a + 1) * l * .5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
  }
  for (let n = 0; n < 500; n++) { x.fillStyle = `rgba(70,55,40,${.05 + R() * .12})`; x.beginPath(); x.arc(R() * c.width, R() * c.height, R() * .9 + .2, 0, TAU); x.fill(); }
  G.paper = c;
}

// animated grain frames (white noise, half res for a chunkier print grain)
function buildGrain(n = 6) {
  const s = .5;
  for (let f = 0; f < n; f++) {
    const c = makeCanvas(W * s, H * s), x = c.getContext('2d');
    const img = x.createImageData(c.width, c.height), d = img.data, R = rng('grain' + f);
    for (let k = 0; k < d.length; k += 4) { const v = R(); const a = v > .82 ? (v - .82) * 5.5 : 0; d[k] = d[k + 1] = d[k + 2] = 0; d[k + 3] = a * 255; }
    x.putImageData(img, 0, 0);
    G.grain.push(c);
  }
}

// full-frame finishing: paper multiply, grain, vignette. Scenes can tweak G.post per frame.
function finish(dst = G.X) {
  const P = Object.assign({ paper: 1, grain: .18, vignette: .22, warm: 0, lift: 0 }, G.post);
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0);
  const cw = dst.canvas.width, ch = dst.canvas.height;
  if (P.paper > 0) { dst.globalCompositeOperation = 'multiply'; dst.globalAlpha = P.paper; dst.drawImage(G.paper, 0, 0, cw, ch); }
  if (P.grain > 0) { dst.globalCompositeOperation = 'source-over'; dst.globalAlpha = P.grain; dst.drawImage(G.grain[boilT(G.t) % G.grain.length], 0, 0, cw, ch); }
  if (P.vignette > 0) {
    const g = dst.createRadialGradient(cw / 2, ch / 2, ch * .35, cw / 2, ch / 2, ch * .95);
    g.addColorStop(0, 'rgba(40,20,10,0)'); g.addColorStop(1, `rgba(40,20,10,${P.vignette})`);
    dst.globalCompositeOperation = 'multiply'; dst.globalAlpha = 1; dst.fillStyle = g; dst.fillRect(0, 0, cw, ch);
  }
  if (P.lift > 0) { dst.globalCompositeOperation = 'screen'; dst.globalAlpha = P.lift; dst.fillStyle = '#fff'; dst.fillRect(0, 0, cw, ch); }
  dst.restore();
}

// ---- halftone: dot-screen pattern fill. density 0..1 (dot coverage), cell px, angle deg
function halftone(ctx, color, density = .5, cell = 10, angle = 15) {
  const key = `${color}|${Math.round(density * 40)}|${cell}|${angle}`;
  let p = G.dots.get(key);
  if (!p) {
    const s = Math.max(2, Math.round(cell * G.scale));
    const c = makeCanvas(s, s), x = c.getContext('2d');
    const r = Math.sqrt(clamp(density) / Math.PI) * s * 1.02;
    x.fillStyle = color; x.beginPath(); x.arc(s / 2, s / 2, r, 0, TAU); x.fill();
    if (r > s / 2) { for (const [dx, dy] of [[0, 0], [s, 0], [0, s], [s, s]]) { x.beginPath(); x.arc(dx, dy, r - s / 2 * 0.98, 0, TAU); x.fill(); } }
    p = { c, angle };
    G.dots.set(key, p);
  }
  const pat = ctx.createPattern(p.c, 'repeat');
  const m = new DOMMatrix().scaleSelf(1 / G.scale, 1 / G.scale).rotateSelf(angle);
  pat.setTransform(m);
  return pat;
}

// ---- camera on any ctx: cam(ctx, cx, cy, zoom, rot) puts world (cx,cy) at screen centre
function cam(ctx, cx = W / 2, cy = H / 2, zoom = 1, rot = 0, sx = W / 2, sy = H / 2) {
  ctx.translate(sx, sy); ctx.rotate(rot); ctx.scale(zoom, zoom); ctx.translate(-cx, -cy);
}
const shake = (t, amp, seed = 0, freq = 24) => [noise1(t * freq, seed) * amp, noise1(t * freq, seed + 99) * amp];

// ---- basic shapes and hand-drawn paths
function rr(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
// smooth closed curve through points (Catmull-Rom -> bezier)
function blobPath(ctx, pts, closed = true, tension = .5) {
  const n = pts.length; if (n < 2) return;
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  const P = i => pts[closed ? (i + n) % n : clamp(i, 0, n - 1)];
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3,
      p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3, p2[0], p2[1]);
  }
  if (closed) ctx.closePath();
}
// wobbly (boiling) polygon/ellipse points
function wobPts(cx, cy, rx, ry, n = 24, amp = 0, t = 0, seed = 0, rot = 0) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = rot + i / n * TAU, j = amp ? 1 + jit(t, seed * 131 + i, amp) : 1;
    out.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
  }
  return out;
}
// hand-drawn line: slight bow + boil
function handLine(ctx, x1, y1, x2, y2, t = 0, seed = 0, amp = 1.5) {
  const mx = (x1 + x2) / 2 + jit(t, seed, amp * 2), my = (y1 + y2) / 2 + jit(t, seed + 1, amp * 2);
  ctx.beginPath(); ctx.moveTo(x1 + jit(t, seed + 2, amp), y1 + jit(t, seed + 3, amp)); ctx.quadraticCurveTo(mx, my, x2 + jit(t, seed + 4, amp), y2 + jit(t, seed + 5, amp));
}
function star(ctx, cx, cy, r, inner = .45, n = 5, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) { const rr_ = i % 2 ? r * inner : r, a = rot + i / (n * 2) * TAU; i ? ctx.lineTo(cx + Math.cos(a) * rr_, cy + Math.sin(a) * rr_) : ctx.moveTo(cx + Math.cos(a) * rr_, cy + Math.sin(a) * rr_); }
  ctx.closePath();
}

// ---- full-frame transitions (call at the end of a scene with k 0..1)
function wipe(ctx, kind, k, color = '#1b1b1b', o = {}) {
  if (k <= 0) return; k = clamp(k);
  ctx.save(); ctx.fillStyle = color;
  if (kind === 'iris') { const r = (1 - k) * Math.hypot(W, H) / 2; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(o.x ?? W / 2, o.y ?? H / 2, Math.max(0, r), 0, TAU, true); ctx.fill(); }
  else if (kind === 'bars') { const n = o.n || 8; for (let i = 0; i < n; i++) { const kk = clamp(k * 1.6 - i / n * .6); ctx.fillRect(0, i * H / n, W * E.io3(kk), H / n + 1); } }
  else if (kind === 'diag') { const x = lerp(-W * .6, W * 1.2, E.io3(k)); ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(x + H * .5, -10); ctx.lineTo(x - H * .1, H + 10); ctx.lineTo(-10, H + 10); ctx.fill(); }
  else if (kind === 'flash') { ctx.globalAlpha = k; ctx.fillRect(0, 0, W, H); }
  else { ctx.globalAlpha = k; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}

Object.assign(window, { W, H, G, makeCanvas, gfxInit, layer, layerCanvas, drawLayer, ink, inks, finish, halftone, cam, shake, rr, blobPath, wobPts, handLine, star, wipe });
