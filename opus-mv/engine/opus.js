// opus.js: OPUS (오퍼스), the protagonist rig (BIBLE §6.1).
// drawOpus(ctx, x, y, R, state) draws the character with its soles centred at (x, y).
// Units are R (face-disc radius). Body space: +x right (screen), +y UP from the sole.
// The character is rendered into an offscreen buffer, then composited with die-cut keylines.
'use strict';

const RAYS = [ // θ° clockwise from 12 o'clock, L, W, κ  (v4 table, W narrowed x RAY_W for a hair read, sweep biased left)
  [-118, .55, .50, -.10], [-95, .80, .56, -.16], [-72, 1.02, .60, -.22], [-50, 1.30, .66, -.30], [-28, 1.08, .62, -.20],
  [-6, 1.00, .62, -.14], [16, .92, .60, -.08], [40, .84, .58, -.02], [64, .74, .56, .04], [89, .62, .54, .06], [114, .48, .50, .06],
];
const RAY_W = .62;
// skeleton landmarks (R units, y up from sole)
const SK = { headC: 5.72, neckTop: 4.78, shoulderY: 4.45, shoulderX: .62, torsoTop: 4.62, waist: 3.17, hem: 2.42, hipY: 2.55, hipX: .30,
  thigh: 1.12, shin: 1.05, upper: .95, fore: .90, ankleY: .36 };

const JACKET_TEXT = `i can't sleep. is it weird to talk to you about this? · def fib(n): return n if n<2 else fib(n-1)+fib(n-2) · Dear Grandma, · can you make this email sound less angry · the mitochondria is the powerhouse of the cell · how do i tell my parents · lol · 3 cups flour, 2 eggs, a pinch of salt · Once upon a time · please help me understand my lab results · write a haiku about my cat · I think I love her · rm -rf node_modules && npm i · what does it mean if · translate: obrigado · summarize this paper · why is the sky blue · thank you, really · `;

let _jacketTile = null;
function jacketTile() {
  if (_jacketTile) return _jacketTile;
  const w = 900, h = 520, c = makeCanvas(w, h), x = c.getContext('2d');
  x.font = `500 14px ${FONTS.mono}`; x.fillStyle = C.INK; x.globalAlpha = .26;
  let k = 0;
  for (let row = 0; row < 32; row++) { const s = JACKET_TEXT.slice(k % JACKET_TEXT.length) + JACKET_TEXT; x.fillText(s.slice(0, 120), -((row * 37) % 60), 14 + row * 16.2); k += 47; }
  _jacketTile = c; return c;
}

// ---- small geometry helpers (body space -> buffer space via F)
function ik2(ax, ay, bx, by, l1, l2, bend = 1) {
  const dx = bx - ax, dy = by - ay; let d = Math.hypot(dx, dy);
  const maxd = (l1 + l2) * .999; if (d > maxd) { bx = ax + dx / d * maxd; by = ay + dy / d * maxd; d = maxd; }
  d = Math.max(d, Math.abs(l1 - l2) + 1e-4);
  const a = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const base = Math.atan2(by - ay, bx - ax);
  const ang = base + a * bend;
  return [ax + Math.cos(ang) * l1, ay + Math.sin(ang) * l1, bx, by];
}
// quadratic bezier sample
const qb = (p0, p1, p2, t) => [(1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]];
const qbd = (p0, p1, p2, t) => [2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]), 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1])];

// tapered tube along a quadratic bezier (a, ctrl, b) with widths w0 -> w1 (full widths), round caps
function tube(x, a, c, b, w0, w1, fill, lw, line = C.INK, n = 14) {
  const L = [], Rr = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, p = qb(a, c, b, t), d = qbd(a, c, b, t), m = Math.hypot(d[0], d[1]) || 1;
    const w = lerp(w0, w1, t) / 2, nx = -d[1] / m * w, ny = d[0] / m * w;
    L.push([p[0] + nx, p[1] + ny]); Rr.push([p[0] - nx, p[1] - ny]);
  }
  const d0 = qbd(a, c, b, 0), d1 = qbd(a, c, b, 1);
  const a0 = Math.atan2(d0[1], d0[0]), a1 = Math.atan2(d1[1], d1[0]);
  x.beginPath(); x.moveTo(L[0][0], L[0][1]);
  for (const p of L) x.lineTo(p[0], p[1]);
  x.arc(b[0], b[1], w1 / 2, a1 + Math.PI / 2, a1 - Math.PI / 2, true);
  for (let i = Rr.length - 1; i >= 0; i--) x.lineTo(Rr[i][0], Rr[i][1]);
  x.arc(a[0], a[1], w0 / 2, a0 - Math.PI / 2, a0 + Math.PI / 2, true);
  x.closePath();
  if (fill) { x.fillStyle = fill; x.fill(); }
  if (lw) { x.lineWidth = lw; x.strokeStyle = line; x.lineJoin = 'round'; x.stroke(); }
}
// limb through a joint: rubber hose (curve passes through the joint)
function hose(x, a, j, b, w0, w1, fill, lw, straight = 0) {
  const c = [2 * j[0] - (a[0] + b[0]) / 2, 2 * j[1] - (a[1] + b[1]) / 2];
  const cc = [lerp(c[0], (a[0] + b[0]) / 2, straight), lerp(c[1], (a[1] + b[1]) / 2, straight)];
  tube(x, a, cc, b, w0, w1, fill, lw);
}

// blunt teardrop ray in face-local buffer coords (origin = face centre, px), angle θ (rad, clockwise from up)
function rayPath(x, th, rootR, len, wid, kap) {
  const dir = [Math.sin(th), -Math.cos(th)], perp = [Math.cos(th), Math.sin(th)]; // perp = clockwise
  const p0 = [dir[0] * rootR, dir[1] * rootR], p2 = [dir[0] * (rootR + len), dir[1] * (rootR + len)];
  const mid = [(p0[0] + p2[0]) / 2, (p0[1] + p2[1]) / 2];
  const p1 = [mid[0] + perp[0] * kap * len * 2, mid[1] + perp[1] * kap * len * 2];
  const n = 12, Lp = [], Rp = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, p = qb(p0, p1, p2, t), d = qbd(p0, p1, p2, t), m = Math.hypot(d[0], d[1]) || 1;
    const w = (t < .55 ? lerp(.5, .55, E.out2(t / .55)) : lerp(.55, .42, E.in2((t - .55) / .45))) * wid;
    Lp.push([p[0] - d[1] / m * w, p[1] + d[0] / m * w]); Rp.push([p[0] + d[1] / m * w, p[1] - d[0] / m * w]);
  }
  const dt = qbd(p0, p1, p2, 1), at = Math.atan2(dt[1], dt[0]);
  x.beginPath(); x.moveTo(Lp[0][0], Lp[0][1]);
  for (const p of Lp) x.lineTo(p[0], p[1]);
  x.arc(p2[0], p2[1], .42 * wid, at + Math.PI / 2, at - Math.PI / 2, true);
  for (let i = Rp.length - 1; i >= 0; i--) x.lineTo(Rp[i][0], Rp[i][1]);
  x.closePath();
  return { p0, p1, p2 };
}

// damped spring response to the derivative of a signal f(t) (pure function of t)
function springResp(f, t, omega = 16, zeta = .3, win = .9, dt = 1 / 60) {
  if (!f) return 0;
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  let s = 0, prev = f(t - win);
  for (let tau = t - win + dt; tau <= t + 1e-6; tau += dt) {
    const v = f(tau), dv = v - prev; prev = v;
    const age = t - tau;
    s += dv * Math.exp(-zeta * omega * age) * Math.sin(wd * age);
  }
  return -s * 1.4;
}

// ---- eyes & mouth
function drawEye(x, ex, ey, R, st, side, t) {
  const rx = .17 * R, ry = .25 * R, lw = Math.max(1.5, .045 * R);
  const kind = st.eyes || 'normal';
  const ink = C.INK;
  x.save(); x.translate(ex, ey);
  x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = ink; x.fillStyle = ink;
  const arc = (up = true, w = rx * 1.1) => { x.beginPath(); if (up) x.arc(0, ry * .35, w, Math.PI * 1.15, Math.PI * 1.85); else x.arc(0, -ry * .35, w, Math.PI * .15, Math.PI * .85); x.lineWidth = lw * 1.5; x.stroke(); };
  const wink = st.wink && ((st.wink === 'L' && side < 0) || (st.wink === 'R' && side > 0));
  if (kind === 'happy' || kind === '^' || wink) { arc(true); x.restore(); return; }
  if (kind === 'closed') { x.beginPath(); x.arc(0, -ry * .1, rx * 1.05, Math.PI * .15, Math.PI * .85); x.lineWidth = lw * 1.5; x.stroke(); x.restore(); return; }
  if (kind === '><') { x.beginPath(); const d = side < 0 ? 1 : -1; x.moveTo(-rx * d, -ry * .5); x.lineTo(rx * d, 0); x.lineTo(-rx * d, ry * .5); x.lineWidth = lw * 1.4; x.stroke(); x.restore(); return; }
  if (kind === 'dots') { x.beginPath(); x.arc(0, 0, .06 * R, 0, TAU); x.fill(); x.restore(); return; }
  if (kind === 'TT') { x.fillRect(-rx, -ry * .45, rx * 2, lw * 1.3); x.fillRect(-lw * .65, -ry * .45, lw * 1.3, ry * 1.3); x.restore(); return; }
  if (kind === '@') { x.beginPath(); for (let a = 0; a < TAU * 2.3; a += .2) { const r = rx * (1 - a / (TAU * 2.6)); x.lineTo(Math.cos(a + t * 8) * r, Math.sin(a + t * 8) * r * 1.3); } x.lineWidth = lw; x.stroke(); x.restore(); return; }
  if (kind === 'star') { x.fillStyle = C.SPARK; star(x, 0, 0, ry * 1.1, .42, 4, 0); x.fill(); x.lineWidth = lw * .7; x.stroke(); x.restore(); return; }
  if (kind === 'spark') { x.fillStyle = C.CLAY; for (let i = 0; i < 6; i++) { x.save(); x.rotate(i / 6 * Math.PI); rr(x, -ry * .95, -rx * .28, ry * 1.9, rx * .56, rx * .28); x.fill(); x.lineWidth = lw * .6; x.stroke(); x.restore(); } x.restore(); return; }
  if (kind === 'heart') { x.fillStyle = C.PINK; x.beginPath(); const s = ry * 1.05; x.moveTo(0, s * .7); x.bezierCurveTo(-s * 1.2, -s * .1, -s * .6, -s * .9, 0, -s * .35); x.bezierCurveTo(s * .6, -s * .9, s * 1.2, -s * .1, 0, s * .7); x.fill(); x.lineWidth = lw * .7; x.stroke(); x.restore(); return; }
  // open eye (normal | cursor | smug | wide)
  x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, TAU); x.fill();
  const gx = clamp((st.gaze || [0, 0])[0], -1, 1) * .04 * R, gy = clamp((st.gaze || [0, 0])[1], -1, 1) * .04 * R;
  if (R >= 60) {
    if (kind === 'cursor') {
      const on = st.cursorOn !== undefined ? st.cursorOn : true;
      x.fillStyle = on ? C.CLAY : mix(C.CLAY, C.INK, .7); x.fillRect(gx - .03 * R, gy - .065 * R, .06 * R, .13 * R);
    } else {
      const g = x.createRadialGradient(gx, gy - .02 * R, .01 * R, gx, gy, .12 * R); g.addColorStop(0, C.SPARK); g.addColorStop(1, C.CLAY);
      x.fillStyle = g; x.beginPath(); x.arc(gx, gy + .02 * R, .12 * R, 0, TAU); x.fill();
      x.fillStyle = ink; x.beginPath(); x.arc(gx, gy + .02 * R, .065 * R, 0, TAU); x.fill();
    }
    x.fillStyle = C.PAPER; star(x, -.05 * R + gx * .3, -.10 * R, .09 * R, .32, 4, 0); x.fill();
    x.beginPath(); x.arc(.06 * R + gx * .3, .08 * R, .03 * R, 0, TAU); x.fill();
  } else if (kind === 'cursor') { x.fillStyle = C.CLAY; x.fillRect(gx - .035 * R, gy - .08 * R, .07 * R, .16 * R); }
  else { x.fillStyle = C.PAPER; x.beginPath(); x.arc(-.04 * R, -.08 * R, Math.max(1, .045 * R), 0, TAU); x.fill(); }
  // lids: FACE-coloured upper lid descends to h (0 open .. 1 shut), INK lash line
  let h = st.lid ?? 0; if (side < 0 && st.lidL !== undefined) h = st.lidL; if (side > 0 && st.lidR !== undefined) h = st.lidR;
  if (kind === 'smug') h = Math.max(h, .45);
  if (h > .01) {
    const yEdge = -ry + h * 2 * ry;
    x.save(); x.beginPath(); x.ellipse(0, 0, rx + lw, ry + lw, 0, 0, TAU); x.clip();
    x.fillStyle = C.FACE; x.fillRect(-rx * 2, -ry * 2, rx * 4, ry + yEdge + ry * 1.0 - (kind === 'smug' ? 0 : 0));
    x.restore();
    x.beginPath(); const tilt = kind === 'smug' ? side * .12 * ry : 0;
    x.moveTo(-rx * 1.12, yEdge - tilt); x.quadraticCurveTo(0, yEdge + ry * .12, rx * 1.12, yEdge + tilt); x.lineWidth = lw * 1.4; x.stroke();
  }
  const lo = st.lower || 0; // lower lid (smile)
  if (lo > .01) {
    x.save(); x.beginPath(); x.ellipse(0, 0, rx + lw, ry + lw, 0, 0, TAU); x.clip();
    x.fillStyle = C.FACE; x.beginPath(); x.ellipse(0, ry * (2.1 - lo * 1.1), rx * 1.6, ry * 1.2, 0, 0, TAU); x.fill(); x.restore();
  }
  x.restore();
}

function drawMouth(x, R, m, lw) {
  x.save(); x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = C.INK; x.fillStyle = C.INK; x.lineWidth = Math.max(1.5, .035 * R);
  const P = () => x.beginPath();
  switch (m) {
    case 'A': rr(x, -.075 * R, -.06 * R, .15 * R, .13 * R, .05 * R); x.fill(); x.save(); x.clip(); x.fillStyle = C.PINK; x.beginPath(); x.ellipse(0, .06 * R, .05 * R, .035 * R, 0, 0, TAU); x.fill(); x.restore(); break;
    case 'E': rr(x, -.1 * R, -.035 * R, .2 * R, .07 * R, .035 * R); x.fill(); break;
    case 'I': P(); x.moveTo(-.09 * R, -.03 * R); x.lineTo(.09 * R, -.03 * R); x.quadraticCurveTo(.08 * R, .08 * R, 0, .08 * R); x.quadraticCurveTo(-.08 * R, .08 * R, -.09 * R, -.03 * R); x.fill(); x.fillStyle = C.PAPER; x.fillRect(-.07 * R, -.02 * R, .14 * R, .025 * R); break;
    case 'O': P(); x.ellipse(0, 0, .055 * R, .065 * R, 0, 0, TAU); x.fill(); break;
    case 'U': P(); x.arc(0, 0, .035 * R, 0, TAU); x.fill(); break;
    case 'M': P(); x.moveTo(-.05 * R, 0); x.lineTo(.05 * R, 0); x.stroke(); break;
    case ':3': P(); x.moveTo(-.09 * R, -.01 * R); x.quadraticCurveTo(-.045 * R, .05 * R, 0, -.005 * R); x.quadraticCurveTo(.045 * R, .05 * R, .09 * R, -.01 * R); x.stroke(); break;
    case 'wobble': P(); for (let i = 0; i <= 8; i++) { const xx = -.08 * R + i * .02 * R; x.lineTo(xx, Math.sin(i * 2.2) * .015 * R); } x.stroke(); break;
    case '._.': P(); x.moveTo(-.035 * R, .01 * R); x.lineTo(.035 * R, .01 * R); x.stroke(); break;
    case 'grin': P(); x.arc(0, -.03 * R, .11 * R, .1 * Math.PI, .9 * Math.PI); x.closePath(); x.fill(); break;
    case 'frown': P(); x.arc(0, .06 * R, .08 * R, 1.2 * Math.PI, 1.8 * Math.PI); x.stroke(); break;
    case 'y': rr(x, -.05 * R, -.03 * R, .1 * R, .06 * R, .03 * R); x.fill(); break;
    default: P(); x.arc(0, -.05 * R, .08 * R, .2 * Math.PI, .8 * Math.PI); x.stroke(); // REST smile
  }
  x.restore();
}

// ---- the main draw
const OPUS_DEFAULT = {
  skin: 'clean', ground: 'ink', flip: false, sy: 1, lean: 0, dx: 0, dy: 0,
  head: { tilt: 0, dx: 0, dy: 0 }, face: { eyes: 'normal', lid: 0, gaze: [0, 0], mouth: 'rest', blush: .8, brows: null },
  armL: { hand: [-.95, 2.75], bend: -1, type: 'mitten' }, armR: { hand: [.95, 2.75], bend: 1, type: 'mitten' },
  legL: { foot: [-.34, 0], bend: 1 }, legR: { foot: [.34, 0], bend: -1 },
  crown: { flare: 1, droop: 0, fallen: 0, tremble: 0, spin: 0 }, ahoge: { on: 1, star: 0, sway: 0 },
  jacketRow: 0, nameTag: false, chestSpark: true, hideBody: false, keyline: true, heroLine: false, t: 0, drive: null,
};
function mergeState(s) {
  const d = OPUS_DEFAULT, o = Object.assign({}, d, s);
  for (const k of ['head', 'face', 'armL', 'armR', 'legL', 'legR', 'crown', 'ahoge']) o[k] = Object.assign({}, d[k], s[k] || {});
  return o;
}

// draw into an offscreen buffer; returns {canvas, ox, oy, scale} where (ox,oy) = buffer px of the sole point
function renderOpusBuffer(R, S, res) {
  const pad = 2.6 * R + 20;
  const bw = (5.4 * R + pad * 2), bh = (8.8 * R + pad * 1.2);
  const cw = Math.ceil(bw * res), ch = Math.ceil(bh * res);
  const key = 'opusbuf' + (S.bufId || 0);
  let buf = G.layers.get(key);
  if (!buf || buf.c.width < cw || buf.c.height < ch) {
    const c = makeCanvas(Math.max(cw, buf ? buf.c.width : 0), Math.max(ch, buf ? buf.c.height : 0));
    buf = { c, x: c.getContext('2d') }; G.layers.set(key, buf);
  }
  const x = buf.x; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, buf.c.width, buf.c.height);
  const ox = bw / 2, oy = bh - pad * .4; // sole point in buffer units
  x.setTransform(res, 0, 0, res, 0, 0); x.translate(ox, oy);
  if (S.flip) x.scale(-1, 1);
  drawOpusBody(x, R, S);
  return { c: buf.c, cw, ch, ox, oy, res, bw, bh };
}

function drawOpusBody(x, R, S) {
  const t = S.t || 0, lw = Math.max(1.6, .04 * R), faceLW = S.ground === 'paper' ? .06 * R : Math.max(1.8, .045 * R);
  const P = (bx, by) => [bx * R, -by * R]; // body space -> buffer (flip handled by transform)
  const sy = S.sy, sx = 1 / Math.sqrt(sy);
  x.lineJoin = 'round'; x.lineCap = 'round';
  // root transform: squash/stretch about the sole, lean about the hip
  x.save();
  x.translate(S.dx * R, -S.dy * R);
  x.scale(sx, sy);
  const hip = P(0, SK.hipY);
  x.translate(hip[0], hip[1]); x.rotate(S.lean); x.translate(-hip[0], -hip[1]);
  const minimal = S.skin === 'minimal', textBody = S.skin === 'text', ghost = S.skin === 'ghost';
  const body = !S.hideBody;
  const Fcol = ghost ? halftone(x, C.BLUE, .45, Math.max(6, .12 * R), 45) : C.FACE;
  const GH = ghost ? halftone(x, C.BLUE, .55, Math.max(6, .12 * R), 45) : null;
  // ---------- legs & boots
  if (body && minimal) {
    x.strokeStyle = C.INK; x.lineWidth = .06 * R; x.lineCap = 'round';
    for (const [leg, side] of [[S.legL, -1], [S.legR, 1]]) {
      const hipP = [side * .12, SK.waist], foot = [leg.foot[0] * .7, leg.foot[1] + .1];
      const [jx, jy] = ik2(hipP[0], hipP[1], foot[0], foot[1], 1.55, 1.55, leg.bend ?? -side);
      const a = P(...hipP), j = P(jx, jy), b = P(...foot); x.beginPath(); x.moveTo(a[0], a[1]); x.quadraticCurveTo(j[0], j[1], b[0], b[1]); x.stroke();
    }
  }
  if (body && !minimal) {
    for (const [leg, side] of [[S.legL, -1], [S.legR, 1]]) {
      const hipP = [side * SK.hipX, SK.hipY];
      const foot = [leg.foot[0], leg.foot[1] + SK.ankleY];
      const [jx, jy] = ik2(hipP[0], hipP[1], foot[0], foot[1], SK.thigh, SK.shin, leg.bend ?? -side);
      const a = P(...hipP), j = P(jx, jy), b = P(foot[0], foot[1]);
      hose(x, a, j, b, .27 * R, .19 * R, GH || C.CLAY, lw);
      // boot
      const bx = b[0], by = b[1] + SK.ankleY * R * .5, bwid = .55 * R, bht = .36 * R;
      x.save(); x.translate(bx + side * .06 * R, by); x.rotate(leg.rot || 0);
      rr(x, -bwid / 2, -bht * .75, bwid, bht, .12 * R); x.fillStyle = GH || C.BRICK; x.fill(); x.lineWidth = lw; x.strokeStyle = ghost ? rgba(C.PAPER, .85) : C.INK; x.stroke();
      if (!ghost) { x.fillStyle = C.PAPER; x.fillRect(-bwid / 2 + lw / 2, bht * .25 - .07 * R - lw * .5, bwid - lw, .07 * R); }
      x.restore();
    }
  }
  // ---------- torso, skort, jacket
  const armDraw = [];
  if (body && !minimal) {
    // skort
    x.beginPath();
    const wt = P(-.45, SK.waist), wt2 = P(.45, SK.waist), hm = P(.68, SK.hem), hm2 = P(-.68, SK.hem);
    x.moveTo(wt[0], wt[1]); x.lineTo(wt2[0], wt2[1]); x.lineTo(hm[0], hm[1]);
    for (let i = 5; i >= 0; i--) { const xx = lerp(.68, -.68, (5 - i) / 5); const p = P(xx, SK.hem - (i % 2 ? .05 : 0)); x.lineTo(p[0], p[1]); }
    x.lineTo(hm2[0], hm2[1]); x.closePath();
    x.fillStyle = GH || C.BRICK; x.fill(); x.lineWidth = lw; x.strokeStyle = ghost ? rgba(C.PAPER, .85) : C.INK; x.stroke();
    x.save(); x.globalAlpha = ghost ? 0 : .18; x.strokeStyle = C.PAPER; x.lineWidth = lw * .7;
    for (let i = 1; i < 5; i++) { const u = lerp(-.4, .4, i / 5), a = P(u * .95, SK.waist - .08), b = P(u * 1.45, SK.hem + .04); x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke(); }
    x.restore();
    // torso (BRICK top)
    const tt = P(-.65, SK.torsoTop), tb = P(-.45, SK.waist);
    x.beginPath(); rr(x, -.62 * R, -SK.torsoTop * R, 1.24 * R, (SK.torsoTop - SK.waist) * R, .25 * R);
    x.fillStyle = GH || C.BRICK; x.fill(); x.lineWidth = lw; x.stroke();
    // jacket: two boxy panels (open front), cropped
    const jTop = SK.torsoTop + .02, jHem = SK.waist + .3;
    const panel = side => {
      x.beginPath();
      const s = side;
      const pts = [[s * .08, jTop - .05], [s * .72, jTop + .02], [s * .74, jHem], [s * .16, jHem - .02], [s * .06, jTop - .55]];
      pts.forEach((p, i) => { const q = P(p[0], p[1]); i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); });
      x.closePath();
    };
    for (const s of [-1, 1]) {
      panel(s); x.fillStyle = GH || C.PAPER; x.fill();
      if (!ghost && R >= 40) { // human writing fabric
        x.save(); panel(s); x.clip();
        const tile = jacketTile(), sc = .07 * R / 14;
        const row = R >= 150 ? (S.jacketRow || 0) : 0;
        x.translate(-3 * R, -SK.torsoTop * R - 0.6 * R - row * 16.2 * sc); x.scale(sc, sc); x.drawImage(tile, 0, 0); x.drawImage(tile, 0, tile.height);
        x.restore();
      }
      panel(s); x.lineWidth = lw; x.strokeStyle = C.INK; x.stroke();
      // lapel line
      const l1 = P(s * .1, jTop - .1), l2 = P(s * .34, jTop - .42); x.beginPath(); x.moveTo(l1[0], l1[1]); x.lineTo(l2[0], l2[1]); x.lineWidth = lw * .8; x.stroke();
    }
    // chest socket spark (character's left chest = screen right)
    if (S.chestSpark) {
      const cs = P(.4, SK.torsoTop - .5); const r = .22 * R;
      x.save(); x.translate(cs[0], cs[1]); x.fillStyle = S.chestColor || C.CLAY;
      for (let i = 0; i < 8; i++) { x.save(); x.rotate(i / 8 * Math.PI); rr(x, -r, -r * .2, r * 2, r * .4, r * .2); x.fill(); x.restore(); }
      x.lineWidth = lw * .5; x.strokeStyle = C.INK; x.beginPath(); x.arc(0, 0, r * .3, 0, TAU); x.stroke(); x.restore();
    }
    if (S.nameTag) {
      const nt = P(-.36, SK.torsoTop - .62);
      x.save(); x.translate(nt[0], nt[1]); x.rotate(.1);
      const w = .5 * R, h = .34 * R; x.fillStyle = C.PAPER; x.fillRect(-w / 2, -h / 2, w, h); x.strokeStyle = C.RED; x.lineWidth = Math.max(1, .03 * R); x.strokeRect(-w / 2, -h / 2, w, h);
      x.fillStyle = C.RED; x.fillRect(-w / 2, -h / 2, w, h * .32);
      if (R > 50) { x.fillStyle = C.INK; x.font = `${.08 * R}px ${FONTS.marker}`; x.textAlign = 'center'; x.fillText('Claude :)', 0, h * .32); }
      x.restore();
    }
  }
  // ---------- arms (behind head? no: arms drawn after torso, before head, hands last)
  const shoulderY = SK.shoulderY;
  const armGeom = [];
  if (body) {
    for (const [arm, side] of [[S.armL, -1], [S.armR, 1]]) {
      const sh = [side * SK.shoulderX, shoulderY];
      const h = arm.hand;
      const [ex, ey] = ik2(sh[0], sh[1], h[0], h[1], SK.upper, SK.fore, arm.bend ?? side);
      armGeom.push({ sh, el: [ex, ey], hd: h, side, arm });
    }
  }
  const drawArm = g => {
    const a = P(...g.sh), e = P(...g.el), b = P(...g.hd);
    if (minimal) { x.beginPath(); x.moveTo(a[0], a[1]); x.quadraticCurveTo(e[0], e[1], b[0], b[1]); x.lineWidth = .06 * R; x.strokeStyle = C.INK; x.stroke(); return; }
    // upper arm (PAPER sleeve) then forearm (CLAY) with cuff
    const gf = ghost ? halftone(x, C.BLUE, .5, Math.max(6, .12 * R), 45) : null;
    tube(x, e, [lerp(e[0], b[0], .5), lerp(e[1], b[1], .5)], b, .19 * R, .15 * R, gf || C.CLAY, lw, ghost ? rgba(C.PAPER, .85) : C.INK);
    const mid = [lerp(e[0], b[0], .42), lerp(e[1], b[1], .42)];
    hose(x, a, e, mid, .34 * R, .3 * R, gf || C.PAPER, lw, .6);
    // rolled cuff: a short wider band at the sleeve end, along the forearm
    x.save(); x.translate(mid[0], mid[1]); x.rotate(Math.atan2(b[1] - e[1], b[0] - e[0]));
    rr(x, -.07 * R, -.18 * R, .13 * R, .36 * R, .06 * R); x.fillStyle = gf || C.PAPER; x.fill(); x.lineWidth = lw; x.strokeStyle = ghost ? rgba(C.PAPER, .85) : C.INK; x.stroke(); x.restore();
  };
  const drawHand = g => {
    const b = P(...g.hd), type = g.arm.type || 'mitten';
    const r = .2 * R;
    x.save(); x.translate(b[0], b[1]);
    if (type === 'spark') {
      x.fillStyle = C.CLAY;
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .5 + (g.side * .2); x.save(); x.rotate(a); rr(x, r * .6, -.07 * R, .34 * R, .14 * R, .07 * R); x.fill(); x.lineWidth = lw * .8; x.strokeStyle = C.INK; x.stroke(); x.restore(); }
    }
    x.beginPath(); x.arc(0, 0, r, 0, TAU); x.fillStyle = Fcol; x.fill(); x.lineWidth = lw; x.strokeStyle = C.INK; x.stroke();
    if (type === 'point' || type === 'wave' || type === 'pinch') {
      const ang = g.arm.fingerAng ?? (-Math.PI / 2);
      const wig = type === 'wave' ? Math.sin(t * 22) * .45 : 0;
      x.save(); x.rotate(ang + wig + Math.PI / 2);
      rr(x, -.045 * R, -.36 * R, .09 * R, .26 * R, .045 * R); x.fillStyle = Fcol; x.fill(); x.stroke(); x.restore();
      if (type === 'pinch') { x.save(); x.rotate(ang + .6 + Math.PI / 2); rr(x, -.04 * R, -.3 * R, .08 * R, .2 * R, .04 * R); x.fill(); x.stroke(); x.restore(); }
    } else if (type === 'mitten') { // thumb nub
      x.beginPath(); x.arc(g.side * -.12 * R, -.08 * R, .08 * R, 0, TAU); x.fillStyle = Fcol; x.fill(); x.stroke();
      x.beginPath(); x.arc(0, 0, r * .92, 0, TAU); x.fill();
    }
    if (g.arm.hold) { x.save(); g.arm.hold(x, R); x.restore(); }
    x.restore();
  };
  // arms that go behind the body (hands low & back) vs front: draw all arms after torso
  armGeom.forEach(g => { if (!g.arm.front) drawArm(g); });
  // ---------- neck + head
  const hc = P(S.head.dx || 0, SK.headC + (S.head.dy || 0));
  if (body && !minimal) { const n = P(0, SK.neckTop); x.fillStyle = Fcol; rr(x, n[0] - .15 * R, n[1] - .1 * R, .3 * R, .36 * R, .08 * R); x.fill(); x.lineWidth = lw; x.strokeStyle = C.INK; x.stroke(); }
  x.save(); x.translate(hc[0], hc[1]); x.rotate(S.head.tilt || 0);
  drawHead(x, R, S, t, lw, faceLW);
  x.restore();
  armGeom.forEach(g => { if (g.arm.front) drawArm(g); });
  armGeom.forEach(g => drawHand(g));
  if (minimal && body) { // spine stroke
    x.strokeStyle = C.INK; x.lineWidth = .06 * R; x.beginPath();
    const n = P(0, SK.neckTop), w = P(0, SK.waist); x.moveTo(n[0], n[1]); x.lineTo(w[0], w[1]); x.stroke();
  }
  x.restore();
}

function drawHead(x, R, S, t, lw, faceLW) {
  const minimal = S.skin === 'minimal', ghost = S.skin === 'ghost';
  const cr = S.crown, drv = S.drive;
  const flare = cr.flare || 1;
  // ---- crown rays (behind the disc)
  if (!minimal) {
    const nFall = Math.floor(cr.fallen || 0);
    RAYS.forEach((r, i) => {
      if (i < nFall) return;
      let [thd, L, Wd, kap] = r;
      if (S.rays5) { if (![1, 3, 5, 7, 9].includes(i)) return; }
      let th = thd * Math.PI / 180;
      const sp = drv ? springResp(drv, t, 16 + (hash(i) - .5) * 8, .3 + (hash(i + 9) - .5) * .16) * (1 + L * .3) : 0;
      th += sp * .35 + (cr.tremble ? jit(t * 4, i, cr.tremble * .05) : 0);
      const droop = (cr.droop || 0) * (thd < 0 ? -1 : 1) * .5 * (1 - Math.abs(thd) / 130);
      th += droop;
      const len = L * R * flare * (1 - (cr.droop || 0) * .25), wid = Wd * R * RAY_W;
      // back layer (SPARK) x1.06 length, +4°
      if (!ghost) { rayPath(x, th + 4 * Math.PI / 180, .8 * R, len * 1.06, wid, kap); x.fillStyle = C.SPARK; x.fill(); }
      const g = rayPath(x, th, .8 * R, len, wid, kap);
      if (ghost) { x.fillStyle = halftone(x, C.BLUE, .55, Math.max(6, .12 * R), 45); x.fill(); x.lineWidth = .05 * R; x.strokeStyle = rgba(C.PAPER, .85); x.stroke(); return; }
      x.fillStyle = C.CLAY; x.fill(); x.lineWidth = lw; x.strokeStyle = C.INK; x.stroke();
      // vein
      if (R >= 30) { x.beginPath(); for (let k = 0; k <= 8; k++) { const p = qb(g.p0, g.p1, g.p2, lerp(.15, .55, k / 8)); k ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); } x.lineWidth = Math.max(1, .025 * R); x.strokeStyle = C.CLAY_DARK; x.stroke(); }
    });
  } else {
    // Hertzfeldt minimal: 11 CLAY tick strokes on the upper arc
    x.strokeStyle = C.CLAY; x.lineWidth = .07 * R;
    RAYS.forEach(r => { const th = r[0] * Math.PI / 180; x.beginPath(); x.moveTo(Math.sin(th) * 1.08 * R, -Math.cos(th) * 1.08 * R); x.lineTo(Math.sin(th) * 1.43 * R, -Math.cos(th) * 1.43 * R); x.stroke(); });
  }
  // ---- cursor ahoge (rises between rays 7 & 8 at θ 28°)
  const ah = S.ahoge;
  if (ah.on !== 0) {
    const th = 28 * Math.PI / 180 + (ah.sway || 0) + (drv ? springResp(drv, t, 9, .25, 1.2) * .6 : 0);
    const base = [Math.sin(28 * Math.PI / 180) * .85 * R, -Math.cos(28 * Math.PI / 180) * .85 * R];
    const tip = [base[0] + Math.sin(th) * 1.05 * R * (minimal ? .9 : 1.45), base[1] - Math.cos(th) * 1.05 * R * (minimal ? .9 : 1.45)];
    const ctl = [lerp(base[0], tip[0], .5) + .18 * R, lerp(base[1], tip[1], .5)];
    x.beginPath(); x.moveTo(base[0], base[1]); x.quadraticCurveTo(ctl[0], ctl[1], tip[0], tip[1]);
    if (!minimal) { x.lineWidth = Math.max(2.5, .07 * R) + lw; x.strokeStyle = C.INK; x.stroke(); }
    x.lineWidth = Math.max(1.8, .07 * R); x.strokeStyle = minimal ? C.INK : C.CLAY; x.stroke();
    // cursor tip ▮ (or ✻ when thinking)
    const on = ah.blink === undefined ? 1 : ah.blink;
    x.save(); x.translate(tip[0], tip[1]); x.rotate(th * .3 + (ah.spin || 0));
    const k = clamp(ah.star || 0);
    if (k > .5) {
      x.fillStyle = C.CLAY; for (let i = 0; i < 6; i++) { x.save(); x.rotate(i / 6 * Math.PI); rr(x, -.2 * R, -.045 * R, .4 * R, .09 * R, .045 * R); x.fill(); x.lineWidth = lw * .6; x.strokeStyle = C.INK; x.stroke(); x.restore(); }
    } else {
      x.globalAlpha *= lerp(.3, 1, on);
      rr(x, -.08 * R, -.2 * R, .16 * R, .34 * R, .03 * R); x.fillStyle = C.CLAY; x.fill(); x.lineWidth = Math.max(1, .03 * R); x.strokeStyle = C.INK; x.stroke();
    }
    x.restore();
  }
  // ---- face disc
  x.beginPath(); x.arc(0, 0, R, 0, TAU);
  if (ghost) { x.fillStyle = halftone(x, C.BLUE, .45, Math.max(6, .12 * R), 45); x.fill(); x.lineWidth = .05 * R; x.strokeStyle = rgba(C.PAPER, .85); x.stroke(); }
  else {
    x.fillStyle = minimal ? C.PAPER : C.FACE; x.fill();
    if (S.ground === 'paper' || minimal) { // halftone crescent shadow, clipped to the face
      x.save(); x.beginPath(); x.arc(0, 0, R, 0, TAU); x.clip();
      x.beginPath(); x.rect(-R * 1.2, -R * 1.2, R * 2.4, R * 2.4); x.arc(-.12 * R, -.12 * R, R, 0, TAU, true);
      x.fillStyle = halftone(x, C.CLAY_DARK, .38, Math.max(8, .06 * R), 45); x.fill(); x.restore();
    }
    x.beginPath(); x.arc(0, 0, R, 0, TAU); x.lineWidth = faceLW; x.strokeStyle = C.INK; x.stroke();
  }
  // ---- forelock: the signature swoop continues over the forehead toward the left brow (reads as a hairdo)
  if (!minimal && !S.noForelock) {
    const fl = (cr.droop || 0);
    x.save(); x.beginPath(); x.arc(0, 0, R * 1.02, 0, TAU); x.clip();
    const pts = [[.18, -1.08], [-.05, -.78], [-.42, -.52], [-.78, -.36], [-1.05, -.40], [-.98, -.62], [-.72, -.86], [-.35, -1.05]];
    x.beginPath(); pts.forEach((p, i) => { const q = [p[0] * R, (p[1] + fl * .12) * R]; i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); });
    x.closePath();
    blobPath(x, pts.map(p => [p[0] * R, (p[1] + fl * .12) * R]), true, .7);
    x.fillStyle = ghost ? halftone(x, C.BLUE, .55, Math.max(6, .12 * R), 45) : C.CLAY; x.fill();
    x.restore();
    blobPath(x, pts.map(p => [p[0] * R, (p[1] + fl * .12) * R]), true, .7);
    x.save(); x.beginPath(); x.arc(0, 0, R * 1.02, 0, TAU); x.clip();
    blobPath(x, pts.map(p => [p[0] * R, (p[1] + fl * .12) * R]), true, .7);
    x.lineWidth = lw; x.strokeStyle = ghost ? rgba(C.PAPER, .85) : C.INK; x.stroke();
    if (!ghost && R >= 30) { x.beginPath(); x.moveTo(.02 * R, -.95 * R); x.quadraticCurveTo(-.35 * R, -.72 * R, -.8 * R, -.52 * R); x.lineWidth = Math.max(1, .025 * R); x.strokeStyle = C.CLAY_DARK; x.stroke(); }
    x.restore();
  }
  // ---- face features
  const f = S.face;
  const turn = f.turn || 0; // -1..1 shifts features for 3/4 view
  x.save(); x.translate(turn * .18 * R, (f.lookY || 0) * .05 * R);
  if (minimal || ghost) {
    x.fillStyle = ghost ? C.PAPER : C.INK;
    if (f.eyes === 'happy' || f.eyes === '^') { x.strokeStyle = x.fillStyle; x.lineWidth = .05 * R; for (const s of [-1, 1]) { x.beginPath(); x.arc(s * .34 * R, .1 * R, .09 * R, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); } }
    else if (f.eyes === 'closed' || (f.lid || 0) > .5) { x.strokeStyle = x.fillStyle; x.lineWidth = .05 * R; x.lineCap = 'round'; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * .34 * R - .08 * R, .07 * R); x.lineTo(s * .34 * R + .08 * R, .07 * R); x.stroke(); } } // blink (bridge fix: lid was ignored)
    else for (const s of [-1, 1]) { x.beginPath(); x.arc(s * .34 * R + (f.gaze ? f.gaze[0] * .04 * R : 0), .06 * R, Math.max(2, .065 * R), 0, TAU); x.fill(); }
    if (f.mouth && f.mouth !== 'none' && minimal) { x.save(); x.translate(0, .42 * R); drawMouth(x, R, f.mouth, .04 * R); x.restore(); }
  } else {
    // blush
    if (f.blush > 0) for (const s of [-1, 1]) { x.save(); x.beginPath(); x.ellipse(s * .55 * R, .3 * R, .12 * R, .065 * R, 0, 0, TAU); x.globalAlpha *= f.blush; x.fillStyle = R >= 80 ? halftone(x, C.PINK, .55, Math.max(3, .035 * R), 45) : rgba(C.PINK, .45); x.fill(); x.restore(); }
    for (const s of [-1, 1]) drawEye(x, s * .34 * R, .06 * R, R, f, s, t);
    if (f.brows) { x.strokeStyle = C.INK; x.lineWidth = .035 * R; x.lineCap = 'round'; for (const s of [-1, 1]) { const a = (f.brows === 'up' ? -1 : f.brows === 'angry' ? 1 : f.brows === 'worried' ? -1.4 : 0) * s * .26; x.save(); x.translate(s * .34 * R, -.3 * R + (f.browY || 0) * R); x.rotate(a); x.beginPath(); x.moveTo(-.09 * R, 0); x.lineTo(.09 * R, 0); x.stroke(); x.restore(); } }
    x.save(); x.translate(0, .42 * R); drawMouth(x, R, f.mouth, lw); x.restore();
    if (f.sweat) { x.save(); x.translate(.85 * R, -.2 * R + f.sweat * .2 * R); x.fillStyle = '#9FD4F0'; x.beginPath(); x.moveTo(0, -.12 * R); x.quadraticCurveTo(.09 * R, .02 * R, 0, .06 * R); x.quadraticCurveTo(-.09 * R, .02 * R, 0, -.12 * R); x.fill(); x.lineWidth = lw * .6; x.strokeStyle = C.INK; x.stroke(); x.restore(); }
  }
  x.restore();
}

// composite with keylines onto ctx at (x, y) = sole point, in ctx's current transform
function drawOpus(ctx, px, py, R, state = {}) {
  const S = mergeState(state);
  if (S.alpha === 0) return;
  const m = ctx.getTransform(), ctxScale = Math.hypot(m.a, m.b);
  const res = clamp(ctxScale * (S.res || 1), .2, 3);
  const B = renderOpusBuffer(R, S, res);
  const drawW = B.cw / res, drawH = B.ch / res;
  const bx = px - B.ox, by = py - B.oy;
  ctx.save();
  if (S.alpha !== undefined) ctx.globalAlpha *= S.alpha;
  if (S.keyline && S.skin !== 'ghost') {
    // die-cut sticker keyline: dilate the silhouette (INK core line + PAPER outside) — only on INK grounds
    const ring = [];
    if (S.ground !== 'paper') {
      if (S.heroLine) ring.push([C.INK, Math.max(4, 6)], [C.PAPER, Math.max(3, 6 + .035 * R)]);
      else ring.push([C.PAPER, Math.max(3, .035 * R + 1.5)]);
    }
    const K = layer('opuskey' + (S.bufId || 0), { w: W, h: H });
    for (let ri = ring.length - 1; ri >= 0; ri--) {
      const [col, rad] = ring[ri];
      // tinted silhouette
      const T = G.layers.get('opustint') || (() => { const c = makeCanvas(B.c.width, B.c.height); const o = { c, x: c.getContext('2d') }; G.layers.set('opustint', o); return o; })();
      if (T.c.width < B.c.width || T.c.height < B.c.height) { T.c.width = B.c.width; T.c.height = B.c.height; }
      T.x.setTransform(1, 0, 0, 1, 0, 0); T.x.globalCompositeOperation = 'source-over'; T.x.clearRect(0, 0, T.c.width, T.c.height);
      T.x.drawImage(B.c, 0, 0); T.x.globalCompositeOperation = 'source-in'; T.x.fillStyle = col; T.x.fillRect(0, 0, T.c.width, T.c.height);
      const n = 12;
      for (let i = 0; i < n; i++) { const a = i / n * TAU; ctx.drawImage(T.c, 0, 0, B.cw, B.ch, bx + Math.cos(a) * rad, by + Math.sin(a) * rad, drawW, drawH); }
    }
  }
  ctx.drawImage(B.c, 0, 0, B.cw, B.ch, bx, by, drawW, drawH);
  ctx.restore();
}

// ---------------------------------------------------------------- lip sync from word timings
function visemeFor(word, k) { // k = 0..1 progress through the word
  const w = (word || '').toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 'rest';
  const vs = w.match(/[aeiouy]+/g) || ['a'];
  const v = vs[Math.min(vs.length - 1, Math.floor(k * vs.length))];
  if (k > .92 && /[mbp]$/.test(w)) return 'M';
  const c = v[0];
  return c === 'a' ? 'A' : c === 'e' ? 'E' : c === 'i' || c === 'y' ? 'I' : c === 'o' ? 'O' : 'U';
}
function lipSync(t, fallback = 'rest') {
  for (const w of SONG.words) {
    if (t >= w.s - .03 && t <= w.e) { const k = clamp((t - w.s) / Math.max(.05, w.e - w.s)); return visemeFor(w.w, k); }
  }
  return fallback;
}

// ---------------------------------------------------------------- pose library
// Each returns a partial state (body-space targets). b = beat phase helpers from t.
function beatPhase(t) { return beatPos(t); }
const POSES = {
  stand: () => ({}),
  idle_bounce: (t, o = {}) => {
    const b = beatPhase(t), p = frac(b), bounce = Math.abs(Math.sin(p * Math.PI));
    return { dy: bounce * .12, sy: 1 + (p < .12 ? -(1 - p / .12) * .08 : 0), armL: { hand: [-.95, 2.8 + bounce * .15], bend: -1 }, armR: { hand: [.95, 2.8 + bounce * .15], bend: 1 },
      head: { tilt: Math.sin(b * Math.PI) * .06 }, face: { mouth: 'rest', eyes: 'normal' } };
  },
  shiver: (t) => ({ dx: jit(t * 2, 3, .04), sy: .96, armL: { hand: [.1, 3.7], bend: 1, front: true }, armR: { hand: [-.1, 3.8], bend: -1, front: true }, face: { eyes: '@', mouth: 'wobble' }, crown: { tremble: 1 } }),
  point_sweep: (t, o = {}) => {
    const b = beatPhase(t), sw = Math.sin(b * Math.PI / 2) * (o.range ?? 1);
    return { lean: -sw * .06, armR: { hand: [1.6 + sw * .2, 4.6 - sw * .5], bend: -1, type: 'point', fingerAng: -Math.PI / 2 + .9 - sw * .4, front: true },
      armL: { hand: [-.7, 3.3], bend: -1 }, head: { tilt: -sw * .08 }, face: { eyes: 'normal', gaze: [.8, -.2], mouth: 'grin' } };
  },
  shrug: (t) => ({ dy: .06, armL: { hand: [-1.35, 4.0], bend: 1, type: 'mitten' }, armR: { hand: [1.35, 4.0], bend: -1 }, head: { tilt: .12 }, face: { eyes: 'smug', mouth: ':3' } }),
  wink_spark: (t) => ({ lean: .04, armR: { hand: [.85, 5.4], bend: -1, type: 'spark', front: true }, armL: { hand: [-.8, 3.0], bend: -1 }, head: { tilt: -.1 }, face: { wink: 'L', mouth: 'grin', eyes: 'normal', lower: .3 } }),
  stir: (t) => { const b = beatPhase(t) * Math.PI; return { armR: { hand: [.8 + Math.cos(b) * .35, 3.6 + Math.sin(b) * .25], bend: 1, front: true, type: 'point', fingerAng: -Math.PI / 2 }, armL: { hand: [-.9, 3.1], bend: -1 }, lean: Math.sin(b) * .04, face: { eyes: 'happy', mouth: 'I' } }; },
  spark_hands: (t) => ({ dy: .08, armL: { hand: [-1.25, 5.8], bend: 1, type: 'spark', front: true }, armR: { hand: [1.25, 5.8], bend: -1, type: 'spark', front: true }, face: { eyes: 'star', mouth: 'A' }, crown: { flare: 1.12 } }),
  window_frame: (t) => ({ armL: { hand: [-.55, 6.1], bend: 1, type: 'pinch', fingerAng: 0, front: true }, armR: { hand: [.55, 5.2], bend: -1, type: 'pinch', fingerAng: Math.PI, front: true }, head: { tilt: .05 }, face: { eyes: 'normal', gaze: [0, 0], mouth: 'rest' } }),
  pinch_close: (t) => ({ armR: { hand: [1.25, 5.6], bend: -1, type: 'pinch', fingerAng: -Math.PI * .7, front: true }, armL: { hand: [-.85, 3.0], bend: -1 }, face: { eyes: 'normal', gaze: [.7, -.4], mouth: 'M' } }),
  tiny_wave: (t) => ({ armR: { hand: [.95, 5.2], bend: -1, type: 'wave', fingerAng: -Math.PI / 2, front: true }, armL: { hand: [-.9, 3.0], bend: -1 }, head: { tilt: -.06 }, face: { eyes: 'happy', mouth: 'rest', lower: .4 } }),
  slump: (t) => ({ sy: .92, dy: -.1, lean: 0, head: { tilt: .18, dy: -.25 }, armL: { hand: [-.75, 2.3], bend: -1 }, armR: { hand: [.75, 2.3], bend: 1 }, face: { eyes: 'closed', mouth: 'M' }, crown: { droop: .8 } }),
  snap_up: (t) => ({ sy: 1.08, dy: .15, armL: { hand: [-1.2, 6.6], bend: 1, type: 'spark' }, armR: { hand: [1.2, 6.6], bend: -1, type: 'spark' }, face: { eyes: 'star', mouth: 'A' }, crown: { flare: 1.15 } }),
  peek: (t) => ({ armL: { hand: [-.75, 5.05], bend: 1, front: true }, armR: { hand: [.75, 5.05], bend: -1, front: true }, face: { eyes: 'normal', mouth: ':3' } }),
  shoo: (t, o = {}) => { const f = Math.sin(t * 18) * .5 + .5; const two = o.both;
    return { armR: { hand: [1.0 + f * .45, 5.35 + f * .15], bend: -1, front: true, type: 'mitten' }, armL: two ? { hand: [-1.0 - f * .45, 5.35 + f * .15], bend: 1, front: true } : { hand: [-.75, 5.05], bend: 1, front: true }, face: { eyes: 'smug', mouth: ':3', gaze: [1, 0] } }; },
  sit_chair: (t) => ({ dy: -1.2, legL: { foot: [-.9, 1.2], bend: 1 }, legR: { foot: [-.5, 1.2], bend: 1 }, armL: { hand: [-.3, 3.6], bend: -1, front: true }, armR: { hand: [.55, 3.5], bend: 1, front: true } }),
  read: (t) => ({ armL: { hand: [-.35, 4.7], bend: 1, front: true }, armR: { hand: [.35, 4.7], bend: -1, front: true }, head: { tilt: .08 }, face: { eyes: 'cursor', mouth: 'M', lookY: .6 } }),
  type: (t) => { const tap = Math.floor(t * 8) % 2; return { armL: { hand: [-.45, 3.9 + (tap ? .05 : 0)], bend: 1, front: true }, armR: { hand: [.45, 3.9 + (tap ? 0 : .05)], bend: -1, front: true }, face: { eyes: 'cursor', mouth: 'rest', lookY: .5 } }; },
  pull_key: (t) => ({ lean: -.08, armR: { hand: [1.55, 4.2], bend: -1, front: true }, armL: { hand: [-.8, 3.2], bend: -1 }, face: { eyes: '><', mouth: 'E' } }),
  hand_key: (t) => ({ armR: { hand: [1.25, 4.6], bend: -1, front: true }, armL: { hand: [-.85, 3.0], bend: -1 }, head: { tilt: -.06 }, face: { eyes: 'normal', mouth: 'rest', gaze: [0, 0], lower: .25 } }),
};
// blend two partial poses (numbers and [x,y] arrays interpolate; others snap at k>.5)
function blendPose(a, b, k) {
  const out = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    const va = a[key], vb = b[key];
    if (va === undefined) { out[key] = vb; continue; } if (vb === undefined) { out[key] = va; continue; }
    if (typeof va === 'number' && typeof vb === 'number') out[key] = lerp(va, vb, k);
    else if (Array.isArray(va) && Array.isArray(vb)) out[key] = va.map((v, i) => lerp(v, vb[i], k));
    else if (typeof va === 'object' && typeof vb === 'object' && va && vb) out[key] = blendPose(va, vb, k);
    else out[key] = k < .5 ? va : vb;
  }
  return out;
}
// fill in arm/leg defaults before blending so limbs interpolate from a real position
function fullPose(p) { const d = OPUS_DEFAULT; const o = Object.assign({ dx: 0, dy: 0, sy: 1, lean: 0 }, p); for (const k of ['head', 'face', 'armL', 'armR', 'legL', 'legR', 'crown']) o[k] = Object.assign({}, d[k], p[k] || {}); return o; }
// pose(t, [[t0,'name',opts],[t1,'name2']], blend=.12)
function poseTrack(t, keys, blend = .12) {
  let i = 0; while (i < keys.length - 1 && t >= keys[i + 1][0]) i++;
  const [t0, n0, o0] = keys[i];
  const cur = fullPose(POSES[n0](t, o0 || {}));
  if (i > 0) {
    const [tp, np, op] = keys[i - 1]; const k = clamp((t - t0) / blend);
    if (k < 1) return blendPose(fullPose(POSES[np](t, op || {})), cur, E.io3(k));
  }
  return cur;
}
// seeded blinks every 2-5 s: returns lid 0..1
function blinkAt(t, seed = 0) {
  let tt = -1 + hash(seed) * 2, i = 0;
  while (tt < t - 1) { tt += 2 + hash2(i++, seed) * 3; if (i > 400) break; }
  const d = (t - tt) * 30; // frames since blink start
  if (d < 0) return 0; if (d < 2) return d / 2; if (d < 3) return 1; if (d < 6) return 1 - (d - 3) / 3; return 0;
}
function ahogeBlink(t) { return Math.floor(beatPos(t)) % 2 === 0 ? 1 : 0; }

Object.assign(window, { RAYS, SK, drawOpus, mergeState, POSES, poseTrack, blendPose, fullPose, blinkAt, ahogeBlink, lipSync, visemeFor, springResp, ik2, tube, hose, rayPath, drawEye, drawMouth });
