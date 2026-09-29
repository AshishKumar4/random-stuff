// prechorus.js: v2 chunk 4 (SHOTLIST_v2 §C row 4) · seed 4 / sliver 'br'
//   P1 "the monsters"   70.500–74.967 (f2115–2248)  You drew monsters where the map ran out
//   P2 "the edge is me" 74.967–81.133 (f2249–2433)  and now the edge of the map is me (+ breath) → the brand frame
// and V2.chart, the engraved sea chart that bridge.js (B1) and final.js (F1–F3) also draw.
//
// ───────────────────────────────────────────────────────────────────────────── V2.chart (read before using it)
// One printed sheet, 4000 × 2400 CHART UNITS (x east = screen right, y south = screen down; north is "ahead" in a
// floor view). The texture is 1 px per unit, built once per page (≈1.9 s, deterministic) into CPU canvases: iso mips
// 4000/2000/1000/500/250 wide, anisotropic mips (y squashed 4× more than x) for the far rows, and a far mip where the
// land continues west and north past the sheet (mirrored), so nothing "ends" before the haze. On the first frame
// that asks for invert > 0 the same set is printed PAPER-on-INK (≈1.5 s more). Charted world at x < EDGE_X (3000);
// beyond it the sheet is blank PAPER and nothing is ever drawn there (the future has no picture).
// Geography: a southern land (coast ≈ y 1560–1790, ending mid-stroke on the edge at coastEnd()), a sea (y ≈ 800–1650)
// with the serpent, whale, many-armed thing + ship, rose (2075, 1150) and cartouche (2468, 930); the engraved
// shoggoth lies at ≈(2585, 1318) just north-west of P; a northern land beyond y ≈ 770 (the far shore in floor views).
//
//   V2.chart.draw(X, cam)   paints the floor into X (a CPU frame ctx, logical 1920×1080 space), plus the ground colour
//                           above the horizon unless cam.sky === false. Returns the solved cam.
//   cam = {
//     cx, cy     the PIVOT, a chart point, drawn at screen (vpX, ay). Default V2.chart.P (P2's standing point)
//     zoom       lateral px per chart unit at the pivot (1 = the texture's own resolution; > 1.4 gets soft)
//     tilt       0 = top-down (a pure similarity) … 1 = the low-angle FLOOR: a LEVEL camera (2-point perspective,
//                so upright figures stand straight on it) with the horizon at horizonY. In between: an orbit
//                about the pivot. Ease it yourself (P2 uses E.io2). RED rhumbs fade out between tilt .3 and .5
//     horizonY   300    screen y of the horizon at tilt 1
//     vpX        960    screen x of the vanishing point = of the pivot (no yaw: chart line x = cx is vertical on
//                       screen). To put another chart line somewhere else on screen use fit()
//     ay         540    screen y of the pivot (> horizonY + 10)
//     f          600    the lens, px. At tilt 1: camera height h = (ay − horizonY)/zoom units, pivot depth D = f/zoom.
//                       Smaller f = wider lens = less squash near the pivot, faster fall-off toward the horizon
//     invert     0..1   PAPER linework on INK (F2 "MAKE" onward). 0 < k < 1 cross-fades (2× cost)
//     rhumbs     0..1   RED rhumb lines (projected vectors, multiply), rhumbK 0..1 = their draw-on from the rose
//     shoggoth   0..1   the engraved shoggoth layer's alpha (0 when final peels it up and draws it itself)
//     haze       0..1   ground-coloured halftone haze (aerial perspective) over the far floor before the horizon
//     hazeBand   .34    how deep that haze reaches, as a fraction of the floor's screen height below the horizon
//     sky        true   fill above the horizon with the ground colour (false: leave it for your own sky)
//     edge       0..1   the edge line (a 3-unit projected vector) with its degree ticks
//     coast      auto   the coastlines re-drawn as crisp projected vectors (auto: on when tilted or zoom > 1.05)
//     blink      0..1   the shoggoth's marker-drawn face: eyes closed amount
//   }
//   V2.chart.cam(o)          → the cam with defaults filled and the camera solved (phi, px, py, camX, camY, h, horizon)
//   V2.chart.project(x, y, cam)    → [sx, sy, s, z]: screen point, lateral px per unit there, view depth (z ≤ 0 behind)
//   V2.chart.unproject(sx, sy, cam) → [x, y], the floor point under a screen point (null at/above the horizon)
//   V2.chart.fit(cam, [x, y], [sx, sy]) → a copy of cam whose pivot is moved so that chart point lands on that screen
//                            point (exact at any tilt: it is a camera translation). e.g. B1: fit(cam, edge(.4), [1000, 1080])
//   V2.chart.scaleAt(cam, sx, sy)  → lateral px per chart unit on the floor under a screen point (size figures by it)
//   V2.chart.onFloor(X, cam, [x, y], fn)  fn(X) draws in chart units around (x, y) through the floor's local affine
//   V2.chart.line(X, cam, pts, w, color, {alpha, op, cap})  a polyline ON the floor as a projected vector, width w units
//   V2.chart.edge(s)         a point on the edge line: [EDGE_X, lerp(2400, 0, s)] (s may run past 0..1)
//   V2.chart.edgeScreen(cam) → [[x, y] near (below the frame), [x, y] far (≈ the VP)]: the edge line on screen
//   V2.chart.coastEnd()      [3000, 1560]: the southern coastline stops mid-stroke here, on the edge (F2's broken end)
//   V2.chart.coast           {south, north}: the coastline polylines (chart units); south ends at coastEnd()
//   V2.chart.P               [3000, 1480]: P2's pivot, where Opus rises astride the edge
//   V2.chart.EDGE_X, .W, .H, .ROSE {x, y, r}, .CART {x, y, w, h}
//   V2.chart.shoggoth        the engraved shoggoth as ITS OWN LAYER (so final can peel it up):
//                            {canvas(inv) → CPU canvas, res (px per unit), box {x0, y0, w, h} (chart units),
//                             body {x, y, rx, ry}, tag {x, y, w, h, rot}, face {x, y, r, eyes: [[x, y], [x, y]]},
//                             tentacles: [{pts, w0, wt}], draw(X, cam, alpha), eyes(X, cam, lid, alpha)}
//                            canvas(inv) excludes the face's two eye dots: draw them with eyes() (they blink)
//   V2.chart.skin(X, L, cam, o)  the half-inked Opus. L = an Opus layer from V2.opusLayer(M, R, st, {keyline: false}).
//                            Left of the edge line the chart's linework (a body-sized swatch: the coastline stops
//                            mid-stroke at the centreline at chest-spark height, land hatch below, TEAL sea above, a
//                            RED rhumb) is overprinted (multiply) on the coloured figure; right of it only a bare
//                            keyline on blank PAPER, the face outline and features drawn whole.
//                            o = {at: {x, y, R, k} REQUIRED (soles, R, pop-up height 0..1), ink 0..1, drain 0..1 (the ink
//                            runs down and off), fill 0..1 (colour spreads across the right half), keyline: 'ink' | false
//                            (the PAPER die-cut ring on INK grounds), line: [[x, y] near, [x, y] far] (the split; default
//                            edgeScreen(cam); the charted side is the left of near→far), meridian 0..1 (default 1: the
//                            edge line ruled up through the body, graduated on the charted side; it fades with drain)}
//   V2.chart.skin.opus(X, x, y, R, state, cam, o)  renders the rig into a layer (state.ground picks the rig style)
//                            and composes it; o.k = pop-up height (vertical scale about the soles)
//   V2.chart.build(inv)      forces the build (normally lazy, ≈1–2 s once per page)
// THE SHOTS (bottom of the file) run ONE continuous camera: P1 pans the coast with the shoggoth hidden (shoggoth: 0), so
// the pan lands on "here be dragons" over empty sea and the blank; at P2 ("and now") the camera pushes in while the
// shoggoth is engraved in place (shogReveal: a reveal field, body → arms) and its HELLO tag is pressed on at "edge".
// PERF (1080p, one worker, full frame incl. JPEG): top-down ≈ 220 ms, floor ≈ 210–350 ms (≈390 two-device-px strips
// + the shoggoth's rows + vectors), P1 with its live monsters and 5–7 tap pan blur ≈ 500–660 ms. Chunk average ≈ 390 ms.
// Treat a solved cam (from cam()/draw()) as immutable: spread it ({...cam, x}) to change it (spreads re-solve).
(() => {
  'use strict';
  const V = window.V2;
  if (!V) { console.error('prechorus.js: window.V2 missing (load _shared.js first)'); return; }
  const F1 = 1 / 30, DEG = Math.PI / 180;
  const { cpuCanvas, cx2d } = V;
  const q2 = t => Math.floor(t * 15 + 1e-6) / 15;              // drawings and humans move on 2s

  // =================================================================================== THE SHEET (geometry)
  const CW = 4000, CH = 2400, EX = 3000;
  const P = [3000, 1480];
  const COAST_END = [3000, 1560];
  const ROSE = { x: 2075, y: 1150, r: 150 };
  const CART = { x: 2468, y: 930, w: 536, h: 116 };
  const SERP = { x0: 170, x1: 880, yw: 1385, A: 60, lam: 210, ph0: .55 };
  const WHALE = { x: 1335, y: 1112 };
  const KRAK = { x: 1705, y: 1238 };
  const SHIP = { x: 1965, y: 1466 };
  const SHOG = { x: 2585, y: 1318, rx: 238, ry: 166, rot: -.08 };
  const PAL0 = { G: C.PAPER, I: C.INK, T: C.TEAL, R: C.RED, K: C.CLAY, inv: 0 };
  const PAL1 = { G: C.INK, I: C.PAPER, T: mix(C.TEAL, C.PAPER, .22), R: C.RED, K: C.CLAY, inv: 1 };

  // ---- small geometry helpers
  const polyPath = (x, Pp, close = false) => { x.beginPath(); for (let i = 0; i < Pp.length; i++) i ? x.lineTo(Pp[i][0], Pp[i][1]) : x.moveTo(Pp[i][0], Pp[i][1]); if (close) x.closePath(); };
  const addPoly = (x, Pp) => { for (let i = 0; i < Pp.length; i++) i ? x.lineTo(Pp[i][0], Pp[i][1]) : x.moveTo(Pp[i][0], Pp[i][1]); x.closePath(); };
  function crs(pts, n = 6, closed = false) { // Catmull-Rom densify
    const out = [], N = pts.length, P_ = i => pts[closed ? (i + N) % N : clamp(i, 0, N - 1)];
    const segs = closed ? N : N - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = P_(i - 1), p1 = P_(i), p2 = P_(i + 1), p3 = P_(i + 2);
      for (let s = 0; s < n; s++) {
        const u = s / n, u2 = u * u, u3 = u2 * u;
        out.push([0, 1].map(k => .5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3)));
      }
    }
    if (!closed) out.push(pts[N - 1].slice());
    return out;
  }
  function fractal(pts, depth, rough, R, closed = false) { // midpoint displacement: an engraver's coastline
    let Pp = pts.map(p => p.slice());
    for (let d = 0; d < depth; d++) {
      const Q = [], n = Pp.length, segs = closed ? n : n - 1;
      for (let i = 0; i < segs; i++) {
        const a = Pp[i], b = Pp[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
        const off = (R() - .5) * rough * L;
        Q.push(a, [(a[0] + b[0]) / 2 - dy / L * off, (a[1] + b[1]) / 2 + dx / L * off]);
      }
      if (!closed) Q.push(Pp[n - 1]);
      Pp = Q;
    }
    return Pp;
  }
  function frames(Pp) { // tangent frames along a polyline
    const out = []; let L = 0; const cum = [0];
    for (let i = 1; i < Pp.length; i++) { L += Math.hypot(Pp[i][0] - Pp[i - 1][0], Pp[i][1] - Pp[i - 1][1]); cum.push(L); }
    for (let i = 0; i < Pp.length; i++) {
      const a = Pp[Math.max(0, i - 1)], b = Pp[Math.min(Pp.length - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1]; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
      out.push({ x: Pp[i][0], y: Pp[i][1], tx, ty, nx: -ty, ny: tx, s: cum[i] / (L || 1), d: cum[i] });
    }
    out.L = L; return out;
  }
  function frameAt(Fr, d) {
    if (d <= 0) return Fr[0]; if (d >= Fr.L) return Fr[Fr.length - 1];
    let lo = 0, hi = Fr.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (Fr[m].d < d) lo = m; else hi = m; }
    const a = Fr[lo], b = Fr[hi], u = (d - a.d) / Math.max(1e-6, b.d - a.d);
    return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), tx: lerp(a.tx, b.tx, u), ty: lerp(a.ty, b.ty, u), nx: lerp(a.nx, b.nx, u), ny: lerp(a.ny, b.ny, u), s: lerp(a.s, b.s, u), d };
  }
  function tubePoly(Fr, wf) {
    const Lp = [], Rp = [];
    for (const f of Fr) { const w = wf(f.s) / 2; Lp.push([f.x + f.nx * w, f.y + f.ny * w]); Rp.push([f.x - f.nx * w, f.y - f.ny * w]); }
    const e = Fr[Fr.length - 1], we = wf(1) / 2, cap = [];
    for (let i = 1; i < 6; i++) { const a = i / 6 * Math.PI; cap.push([e.x + e.nx * we * Math.cos(a) + e.tx * we * Math.sin(a), e.y + e.ny * we * Math.cos(a) + e.ty * we * Math.sin(a)]); }
    return Lp.concat(cap, Rp.reverse());
  }
  function bez(p0, p1, p2, p3, n = 30) { const o = []; for (let i = 0; i <= n; i++) { const u = i / n, v = 1 - u; o.push([0, 1].map(k => v * v * v * p0[k] + 3 * v * v * u * p1[k] + 3 * v * u * u * p2[k] + u * u * u * p3[k])); } return o; }
  function armSpine(root, angDeg, L, bend, curl, n = 44) { // a reaching, curling arm
    const Pp = []; let a = angDeg * DEG, x = root[0], y = root[1]; const ds = L / n;
    for (let i = 0; i <= n; i++) { const s = i / n; Pp.push([x, y]); a += (bend * Math.cos(s * Math.PI) * 1.3 + curl * Math.pow(s, 2.4) * 5.5) / n; x += Math.cos(a) * ds; y += Math.sin(a) * ds; }
    return Pp;
  }
  function inPoly(pt, poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < (b[0] - a[0]) * (pt[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }

  // ---- halftone tiles in CHART units (independent of G.scale; the chart is printed once)
  const HTB = new Map();
  function htPat(x, color, d, cell = 7, ang = 45, k = 1) {
    const q = Math.round(clamp(d) * 40), key = `${color}|${q}|${cell}`;
    let c = HTB.get(key);
    if (!c) {
      c = cpuCanvas(cell, cell); const g = cx2d(c); const r = Math.sqrt(q / 40 / Math.PI) * cell * 1.02;
      g.fillStyle = color; g.beginPath(); g.arc(cell / 2, cell / 2, r, 0, TAU); g.fill();
      if (r > cell / 2) for (const [dx, dy] of [[0, 0], [cell, 0], [0, cell], [cell, cell]]) { g.beginPath(); g.arc(dx, dy, r - cell / 2 * .98, 0, TAU); g.fill(); }
      HTB.set(key, c);
    }
    const p = x.createPattern(c, 'repeat'); p.setTransform(new DOMMatrix().scaleSelf(1 / k, 1 / k).rotateSelf(ang)); return p;
  }
  // everything west of a ragged meridian at ≈xe (the engraver stopped at slightly different places)
  function edgeClip(x, xe, seed, amp = 28) {
    x.beginPath(); x.moveTo(-60, -60);
    for (let y = -60; y <= CH + 60; y += 16) x.lineTo(xe + amp * noise1(y / 95, seed) + amp * .35 * noise1(y / 21, seed + 9), y);
    x.lineTo(-60, CH + 60); x.closePath();
  }

  // ---- coastlines, islands, lands (deterministic, module level)
  let GEO = null;
  function geo() {
    if (GEO) return GEO;
    const R = rng('pc-coast-v1');
    const southC = [[-60, 1792], [170, 1738], [330, 1790], [510, 1712], [650, 1770], [820, 1702], [980, 1752], [1120, 1650], [1270, 1705], [1430, 1662],
      [1570, 1724], [1720, 1690], [1880, 1612], [2020, 1668], [2170, 1712], [2310, 1650], [2450, 1628], [2570, 1662], [2700, 1606], [2820, 1566], [2915, 1580], [2968, 1566], [3000, 1560]];
    let south = fractal(crs(southC, 4), 3, .34, R);
    // the last stretch stays clean: the pen was moving steadily when it stopped
    south = south.filter(p => p[0] < 2932).concat(crs([[2940, 1575], [2968, 1566], [2986, 1561], [3000, 1560]], 4).slice(1));
    const northC = [[-60, 560], [190, 626], [420, 566], [610, 652], [820, 604], [1010, 694], [1210, 640], [1420, 706], [1610, 668], [1800, 728], [2010, 696],
      [2210, 764], [2410, 726], [2600, 786], [2790, 748], [2920, 770], [3000, 762]];
    const north = fractal(crs(northC, 4), 3, .34, R);
    const isl = (cx, cy, r, n = 9) => { const pts = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; const rr_ = r * (.72 + .5 * R()); pts.push([cx + Math.cos(a) * rr_ * 1.25, cy + Math.sin(a) * rr_]); } const f = fractal(crs(pts, 3, true), 2, .3, R, true); f.closed = true; return f; };
    const islands = [isl(1010, 1478, 58, 11), isl(1088, 1552, 20, 7), isl(2330, 1500, 30), isl(1590, 1585, 17, 7), isl(430, 1590, 24, 8)];
    const southLand = south.concat([[EX, CH + 20], [-60, CH + 20]]);
    const northLand = north.concat([[EX, -20], [-60, -20]]);
    // hills: on land, well inland, west of the fade
    const hills = [];
    const RH = rng('pc-hills');
    for (let tries = 0; tries < 900 && hills.length < 64; tries++) {
      const px = 30 + RH() * (EX - 330), py = RH() < .55 ? 1780 + RH() * 600 : 30 + RH() * 600, s = 18 + RH() * 26;
      const land = inPoly([px, py], southLand) || inPoly([px, py], northLand);
      if (!land) continue;
      let dmin = 1e9; for (const q of (py > 1200 ? south : north)) dmin = Math.min(dmin, Math.hypot(q[0] - px, q[1] - py));
      if (dmin < 110 || hills.some(h => Math.hypot(h[0] - px, h[1] - py) < 95)) continue;
      hills.push([px, py, s, RH()]);
    }
    GEO = { south, north, islands, southLand, northLand, lands: [southLand, northLand, ...islands], shores: [south, north, ...islands], hills };
    return GEO;
  }

  // =================================================================================== THE ENGRAVINGS
  // Each monster is drawn in chart units, INK line + hatch + halftone, knocked out of the sea (ground fill first).
  function hatchLines(x, x0, y0, x1, y1, ang, sp, lw, col) { // parallel lines covering a box (clip before calling)
    const ca = Math.cos(ang), sa = Math.sin(ang), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, r = Math.hypot(x1 - x0, y1 - y0) / 2 + 2;
    x.beginPath();
    for (let d = -r; d <= r; d += sp) { const px = cx - sa * d, py = cy + ca * d; x.moveTo(px - ca * r, py - sa * r); x.lineTo(px + ca * r, py + sa * r); }
    x.lineWidth = lw; x.strokeStyle = col; x.stroke();
  }
  function splash(x, pal, px, py, s = 1, dir = 1) { // TEAL water marks where a body meets the sea
    x.save(); x.strokeStyle = pal.T; x.lineWidth = 1.8; x.lineCap = 'round';
    for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(px + dir * (6 + i * 9) * s, py + 2, (7 + i * 5) * s, Math.PI * 1.1, Math.PI * 1.75); x.stroke(); }
    x.beginPath(); x.moveTo(px - 26 * s, py + 3); x.quadraticCurveTo(px, py + 7, px + 30 * s, py + 3); x.stroke();
    x.restore();
  }
  // ---- the sea serpent (Carta Marina): coils arching out of the sea, a raised dragon head. ph = coil phase
  function serpHead(x, pal) {
    const I = pal.I, Gd = pal.G;
    x.lineJoin = 'round'; x.lineCap = 'round';
    // horn
    const hornPts = bez([10, -40], [-8, -62], [-34, -80], [-60, -96], 14), hf = frames(hornPts), hp = tubePoly(hf, s => lerp(15, 2, s));
    polyPath(x, hp, true); x.fillStyle = Gd; x.fill(); x.lineWidth = 2.6; x.strokeStyle = I; x.stroke();
    for (const d of [.3, .55, .75]) { const f = frameAt(hf, hf.L * d), w = lerp(15, 2, d) / 2; x.beginPath(); x.moveTo(f.x + f.nx * w, f.y + f.ny * w); x.lineTo(f.x - f.nx * w, f.y - f.ny * w); x.lineWidth = 1.3; x.stroke(); }
    // lower jaw, hinged open
    x.save(); x.translate(20, 10); x.rotate(22 * DEG);
    const jaw = new Path2D('M0,-4 L96,3 Q107,8 99,15 Q56,22 -6,14 Z');
    x.fillStyle = Gd; x.fill(jaw);
    x.save(); x.clip(jaw); x.fillStyle = htPat(x, I, .32, 6); x.fillRect(-10, 4, 120, 20); x.restore();
    x.lineWidth = 2.8; x.strokeStyle = I; x.stroke(jaw);
    x.fillStyle = Gd; x.beginPath(); for (let tx = 30; tx < 92; tx += 11) { x.moveTo(tx, 1); x.lineTo(tx + 4.5, -8); x.lineTo(tx + 9, 1.5); } x.fill(); x.lineWidth = 1.6; x.stroke();
    x.restore();
    // forked tongue
    x.beginPath(); x.moveTo(46, 12); x.quadraticCurveTo(100, 30, 138, 24); x.moveTo(138, 24); x.lineTo(152, 16); x.moveTo(138, 24); x.lineTo(150, 34); x.lineWidth = 2.4; x.strokeStyle = I; x.stroke();
    // upper head
    const head = new Path2D('M-22,-30 Q16,-64 68,-50 Q108,-40 132,-18 Q142,-8 130,0 L46,2 Q10,8 -20,22 Z');
    x.fillStyle = Gd; x.fill(head);
    x.save(); x.clip(head); hatchLines(x, -30, -20, 140, 30, 32 * DEG, 5.5, 1.2, I); x.fillStyle = Gd; x.beginPath(); x.ellipse(52, -30, 70, 22, -.18, 0, TAU); x.fill(); x.restore();
    x.lineWidth = 3; x.strokeStyle = I; x.stroke(head);
    x.fillStyle = Gd; x.beginPath(); for (let tx = 50; tx < 124; tx += 10.5) { x.moveTo(tx, 1); x.lineTo(tx + 4.5, 10); x.lineTo(tx + 9, .5); } x.fill(); x.lineWidth = 1.6; x.stroke();
    // brow ridge, eye, nostril, cheek scales
    x.beginPath(); x.moveTo(44, -40); x.quadraticCurveTo(66, -52, 88, -38); x.lineWidth = 2.6; x.stroke();
    x.beginPath(); x.arc(66, -29, 9.5, 0, TAU); x.fillStyle = Gd; x.fill(); x.lineWidth = 2.8; x.stroke();
    x.beginPath(); x.arc(68.5, -29, 4.6, 0, TAU); x.fillStyle = I; x.fill();
    x.beginPath(); x.arc(66.5, -31.5, 1.6, 0, TAU); x.fillStyle = Gd; x.fill();
    x.beginPath(); x.ellipse(121, -13, 3.2, 2, -.3, 0, TAU); x.fillStyle = I; x.fill();
    x.lineWidth = 1.3; for (const [sx, sy] of [[10, -10], [22, -2], [4, 4], [30, -22], [18, -26]]) { x.beginPath(); x.arc(sx, sy, 5, Math.PI * .1, Math.PI * .9); x.stroke(); }
  }
  function drawSerpent(x, pal, ph = SERP.ph0, bob = 0) {
    const S = SERP, I = pal.I, Gd = pal.G;
    x.save(); x.lineJoin = 'round'; x.lineCap = 'round';
    const wAt = xx => lerp(21, 44, clamp((xx - S.x0) / (S.x1 - S.x0)));
    const env = xx => Math.pow(Math.sin(Math.PI * clamp((xx - S.x0 + 40) / (S.x1 - S.x0 + 60))), .6);
    const k2 = TAU / S.lam;
    // coils
    for (let n = -1; n < 8; n++) {
      const a = S.x0 + (n * TAU + ph) / k2, b = a + Math.PI / k2;
      if (b < S.x0 + 20 || a > S.x1 - 60) continue;
      const pts = [];
      for (let xx = Math.max(a, S.x0 - 20); xx <= Math.min(b, S.x1 - 40) + .01; xx += 4) {
        const w = wAt(xx), A = S.A * env(xx);
        pts.push([xx, S.yw + .45 * w - (A + .45 * w) * Math.sin(k2 * (xx - S.x0) - ph)]);
      }
      if (pts.length < 4) continue;
      const Fr = frames(pts), wf = s => wAt(lerp(pts[0][0], pts[pts.length - 1][0], s));
      const poly = tubePoly(Fr, wf);
      x.save(); x.beginPath(); x.rect(-10, -10, CW + 20, S.yw + 11.5); x.clip();
      polyPath(x, poly, true); x.fillStyle = Gd; x.fill();
      x.save(); polyPath(x, poly, true); x.clip();
      // belly (inside of the arch) in halftone
      x.beginPath(); for (const f of Fr) { const w = wf(f.s) / 2; x.lineTo(f.x - f.nx * w * .05, f.y - f.ny * w * .05); } for (let i = Fr.length - 1; i >= 0; i--) { const f = Fr[i], w = wf(f.s) / 2; x.lineTo(f.x - f.nx * w * 1.2, f.y - f.ny * w * 1.2); }
      x.fillStyle = htPat(x, I, .3, 6); x.fill();
      // scale rings
      x.beginPath(); for (let d = 6; d < Fr.L; d += 10) { const f = frameAt(Fr, d), w = wf(f.s) / 2 + 2; x.moveTo(f.x + f.nx * w, f.y + f.ny * w); x.quadraticCurveTo(f.x + f.tx * 4, f.y + f.ty * 4, f.x - f.nx * w, f.y - f.ny * w); }
      x.lineWidth = 1.2; x.strokeStyle = I; x.stroke();
      x.restore();
      // dorsal spines along the top edge (the normal pointing up, away from the water)
      x.beginPath();
      for (let d = 10; d < Fr.L - 8; d += 15) {
        const f = frameAt(Fr, d), w = wf(f.s) / 2, up = f.ny < 0 ? 1 : -1;
        const bx = f.x + f.nx * w * up, by = f.y + f.ny * w * up;
        x.moveTo(bx - f.tx * 5, by - f.ty * 5); x.lineTo(bx + f.nx * up * 11 + f.tx * 3, by + f.ny * up * 11 + f.ty * 3); x.lineTo(bx + f.tx * 5, by + f.ty * 5);
      }
      x.fillStyle = Gd; x.fill(); x.lineWidth = 1.8; x.strokeStyle = I; x.stroke();
      polyPath(x, poly, true); x.lineWidth = 3; x.strokeStyle = I; x.stroke();
      x.restore();
      splash(x, pal, pts[0][0] + 4, S.yw, .8, -1); splash(x, pal, pts[pts.length - 1][0] - 4, S.yw, .8, 1);
    }
    // tail tip rising at the west end, with a fin
    const tail = bez([S.x0 + 18, S.yw + 6], [S.x0 - 6, S.yw - 50], [S.x0 - 44, S.yw - 80], [S.x0 - 70, S.yw - 104], 20), tf = frames(tail), tp = tubePoly(tf, s => lerp(22, 3, s));
    x.save(); x.beginPath(); x.rect(-10, -10, CW + 20, S.yw + 11.5); x.clip();
    polyPath(x, tp, true); x.fillStyle = Gd; x.fill(); x.lineWidth = 2.8; x.strokeStyle = I; x.stroke();
    const tipF = tf[tf.length - 3];
    x.beginPath(); x.moveTo(tipF.x, tipF.y); x.lineTo(tipF.x - 30, tipF.y - 8); x.lineTo(tipF.x - 18, tipF.y + 6); x.lineTo(tipF.x - 34, tipF.y + 22); x.lineTo(tipF.x + 6, tipF.y + 14); x.closePath();
    x.fillStyle = Gd; x.fill(); x.lineWidth = 2; x.stroke();
    x.restore();
    splash(x, pal, S.x0 + 18, S.yw, .8, 1);
    // neck rising into the head
    const H0 = [S.x1 + 52, S.yw - 196 + bob];
    const neck = bez([S.x1 - 34, S.yw + 14], [S.x1 + 36, S.yw - 34], [S.x1 - 30, S.yw - 150 + bob * .5], H0, 30), nf = frames(neck);
    const nw = s => lerp(46, 36, s), np = tubePoly(nf, nw);
    x.save(); x.beginPath(); x.rect(-10, -10, CW + 20, S.yw + 11.5); x.clip();
    // frill along the back of the neck (outer side = the normal pointing west/up)
    x.beginPath();
    for (let d = 20; d < nf.L - 10; d += 17) { const f = frameAt(nf, d), w = nw(f.s) / 2, sgn = f.nx < 0 ? 1 : -1; const bx = f.x + f.nx * w * sgn, by = f.y + f.ny * w * sgn; x.moveTo(bx - f.tx * 7, by - f.ty * 7); x.lineTo(bx + f.nx * sgn * 24 - f.tx * 8, by + f.ny * sgn * 24 - f.ty * 8); x.lineTo(bx + f.tx * 7, by + f.ty * 7); }
    x.fillStyle = Gd; x.fill(); x.lineWidth = 2; x.strokeStyle = I; x.stroke();
    polyPath(x, np, true); x.fillStyle = Gd; x.fill();
    x.save(); polyPath(x, np, true); x.clip();
    x.beginPath(); for (let d = 8; d < nf.L; d += 10) { const f = frameAt(nf, d), w = nw(f.s) / 2 + 2; x.moveTo(f.x + f.nx * w, f.y + f.ny * w); x.quadraticCurveTo(f.x + f.tx * 4, f.y + f.ty * 4, f.x - f.nx * w, f.y - f.ny * w); } x.lineWidth = 1.2; x.stroke();
    x.beginPath(); for (const f of nf) { const w = nw(f.s) / 2, sgn = f.nx < 0 ? -1 : 1; x.lineTo(f.x + f.nx * w * sgn * .1, f.y + f.ny * w * sgn * .1); } for (let i = nf.length - 1; i >= 0; i--) { const f = nf[i], w = nw(f.s) / 2, sgn = f.nx < 0 ? -1 : 1; x.lineTo(f.x + f.nx * w * sgn * 1.2, f.y + f.ny * w * sgn * 1.2); }
    x.fillStyle = htPat(x, I, .3, 6); x.fill();
    x.restore();
    polyPath(x, np, true); x.lineWidth = 3; x.strokeStyle = I; x.stroke();
    x.restore();
    splash(x, pal, S.x1 - 30, S.yw, 1, 1);
    x.save(); x.translate(H0[0], H0[1]); x.rotate(-10 * DEG + bob * .004); serpHead(x, pal); x.restore();
    x.restore();
  }
  // ---- the whale, spouting (sp 0..1 = spout height)
  function drawWhale(x, pal, sp = .3) {
    const I = pal.I, Gd = pal.G;
    x.save(); x.translate(WHALE.x, WHALE.y); x.lineJoin = 'round'; x.lineCap = 'round';
    // spout first (behind): two plumes of TEAL strands from the blowhole
    const bh = [168, -94], Hs = 40 + 150 * sp;
    x.save(); x.strokeStyle = pal.T; x.lineWidth = 2.2;
    for (const side of [-1, 1]) for (let j = 0; j < 5; j++) {
      const ox = side * (3 + j * 1.2), topX = bh[0] + side * (10 + j * 7) * (.5 + sp * .6), topY = bh[1] - Hs * (1 - j * .06), endX = bh[0] + side * (30 + j * 12) * (.6 + sp * .7), endY = bh[1] - Hs * (.55 + j * .05);
      x.beginPath(); x.moveTo(bh[0] + ox, bh[1]); x.quadraticCurveTo(bh[0] + ox * 2, topY - Hs * .1, topX, topY); x.quadraticCurveTo((topX + endX) / 2 + side * 8, topY - 8, endX, endY); x.stroke();
      x.beginPath(); x.arc(endX + side * 4, endY + 10 + j * 3, 2.4, 0, TAU); x.fillStyle = pal.T; x.fill();
      x.beginPath(); x.arc(endX + side * 10, endY + 26 + j * 4, 1.8, 0, TAU); x.fill();
    }
    x.restore();
    const body = new Path2D('M212,4 C224,-30 216,-72 182,-88 C130,-106 40,-100 -40,-86 C-120,-70 -182,-40 -226,-8 L-234,4 Z');
    const fl = new Path2D('M-222,-2 Q-236,-40 -254,-66 Q-296,-88 -320,-122 Q-282,-106 -258,-86 Q-240,-114 -204,-136 Q-224,-98 -236,-62 Q-228,-30 -210,-6 Z');
    for (const p of [fl, body]) { x.fillStyle = Gd; x.fill(p); }
    // back hatching following the top, flank halftone, ventral grooves
    x.save(); x.clip(body);
    x.strokeStyle = I; x.lineWidth = 1.25;
    for (let k = 0; k < 7; k++) { const o = 7 + k * 6.5; x.beginPath(); x.moveTo(200 - k * 4, -70 + o * .7); x.bezierCurveTo(130, -100 + o, 40, -96 + o, -40, -82 + o); x.bezierCurveTo(-120, -66 + o, -180, -38 + o * .8, -226, -6 + o * .5); x.stroke(); }
    x.fillStyle = htPat(x, I, .24, 6); x.fillRect(-240, -40, 470, 50);
    x.fillStyle = Gd; x.beginPath(); x.ellipse(120, -46, 70, 24, -.1, 0, TAU); x.fill();
    x.beginPath(); for (let k = 0; k < 4; k++) { x.moveTo(206, -6 - k * 5); x.quadraticCurveTo(160, -2 - k * 5, 100, -4 - k * 4); } x.lineWidth = 1.3; x.stroke();
    x.restore();
    x.save(); x.clip(fl); hatchLines(x, -330, -140, -200, 0, 70 * DEG, 5, 1.1, I); x.restore();
    x.lineWidth = 3; x.strokeStyle = I; x.stroke(fl); x.stroke(body);
    // eye, mouth, blowhole, pectoral fin
    x.beginPath(); x.arc(150, -40, 7, 0, TAU); x.fillStyle = Gd; x.fill(); x.lineWidth = 2.4; x.stroke();
    x.beginPath(); x.arc(151.5, -40, 3.4, 0, TAU); x.fillStyle = I; x.fill();
    x.beginPath(); x.moveTo(214, -12); x.quadraticCurveTo(176, -2, 116, -10); x.lineWidth = 2.4; x.stroke();
    x.beginPath(); x.ellipse(bh[0], bh[1] + 3, 7, 3, 0, 0, TAU); x.fillStyle = I; x.fill();
    const fin = new Path2D('M86,-12 Q46,2 22,20 Q56,14 100,-2 Z'); x.fillStyle = Gd; x.fill(fin); x.lineWidth = 2.4; x.stroke(fin);
    x.restore();
    splash(x, pal, WHALE.x + 210, WHALE.y + 2, 1.1, 1); splash(x, pal, WHALE.x - 226, WHALE.y + 2, 1, -1);
    x.save(); x.strokeStyle = pal.T; x.lineWidth = 1.8; x.beginPath(); x.moveTo(WHALE.x - 190, WHALE.y + 8); x.quadraticCurveTo(WHALE.x, WHALE.y + 14, WHALE.x + 190, WHALE.y + 8); x.stroke(); x.restore();
  }
  // ---- the many-armed thing, reaching for a ship bound for the edge
  function drawArm(x, pal, pts, w0, wt, seed) {
    const I = pal.I, Gd = pal.G, Fr = frames(pts), wf = s => lerp(w0, wt, Math.pow(s, .85)), poly = tubePoly(Fr, wf);
    polyPath(x, poly, true); x.fillStyle = Gd; x.fill();
    x.save(); polyPath(x, poly, true); x.clip();
    x.beginPath(); for (let d = 5; d < Fr.L; d += 7) { const f = frameAt(Fr, d), w = wf(f.s) / 2; x.moveTo(f.x + f.nx * w * .15, f.y + f.ny * w * .15); x.lineTo(f.x + f.nx * w * 1.1, f.y + f.ny * w * 1.1); }
    x.lineWidth = 1.1; x.strokeStyle = I; x.stroke();
    x.restore();
    // suckers on the other side
    for (let d = 10; d < Fr.L - 8; d += 13) { const f = frameAt(Fr, d), w = wf(f.s) / 2, r = Math.max(1.4, w * .32); x.beginPath(); x.arc(f.x - f.nx * w * .55, f.y - f.ny * w * .55, r, 0, TAU); x.lineWidth = 1.2; x.strokeStyle = I; x.stroke(); }
    polyPath(x, poly, true); x.lineWidth = 2.6; x.strokeStyle = I; x.stroke();
  }
  function drawKraken(x, pal) {
    const I = pal.I, Gd = pal.G;
    x.save(); x.translate(KRAK.x, KRAK.y); x.lineJoin = 'round'; x.lineCap = 'round';
    const arms = [[174, 190, .7, -1.3], [150, 250, .4, 1.5], [128, 210, -.5, -1.6], [104, 180, .3, 1.4], [80, 200, -.3, -1.5], [56, 230, .5, 1.6], [26, 200, -.2, -1.4], [40, 372, -.12, .5]];
    arms.forEach(([a, L, b, cu], i) => drawArm(x, pal, armSpine([(i - 3.5) * 9, 14], a, L, b, cu), 27, 3, i));
    const mant = new Path2D('M-60,22 C-86,-70 -42,-178 8,-182 C62,-178 88,-70 60,22 Q0,40 -60,22 Z');
    x.fillStyle = Gd; x.fill(mant);
    x.save(); x.clip(mant); hatchLines(x, 0, -190, 90, 30, 100 * DEG, 5.5, 1.2, I);
    x.fillStyle = Gd; x.beginPath(); x.ellipse(-8, -80, 44, 88, 0, 0, TAU); x.fill();
    x.fillStyle = htPat(x, I, .2, 6); x.beginPath(); x.ellipse(-8, -80, 44, 88, 0, 0, TAU); x.fill();
    x.lineWidth = 1.4; x.strokeStyle = I; for (const [sx, sy, r] of [[-30, -120, 7], [10, -140, 5], [-12, -96, 6], [26, -104, 4], [-36, -60, 5]]) { x.beginPath(); x.arc(sx, sy, r, 0, TAU); x.stroke(); }
    x.restore();
    x.lineWidth = 3; x.strokeStyle = I; x.stroke(mant);
    for (const s of [-1, 1]) { x.beginPath(); x.arc(s * 25, -6, 13, 0, TAU); x.fillStyle = Gd; x.fill(); x.lineWidth = 2.6; x.stroke(); x.beginPath(); x.ellipse(s * 25 + s * 1.5, -6, 8.5, 3.6, 0, 0, TAU); x.fillStyle = I; x.fill(); }
    x.restore();
  }
  function drawShip(x, pal) {
    const I = pal.I, Gd = pal.G;
    x.save(); x.translate(SHIP.x, SHIP.y); x.lineJoin = 'round'; x.lineCap = 'round';
    x.strokeStyle = I; x.lineWidth = 2.2; x.beginPath(); x.moveTo(62, -20); x.lineTo(112, -40); x.stroke();          // bowsprit
    const masts = [[-34, 96, 46], [6, 124, 58], [44, 84, 38]];
    for (const [mx, h] of masts) { x.beginPath(); x.moveTo(mx, -16); x.lineTo(mx, -16 - h); x.lineWidth = 2.6; x.stroke(); }
    for (const [mx, h, w] of masts) for (const [top, sh] of [[-16 - h + 12, h * .36], [-16 - h * .52, h * .34]]) {
      const l = mx - w / 2, r = mx + w / 2, b = top + sh;
      const sail = new Path2D(`M${l},${top} Q${mx},${top + 5} ${r},${top} Q${r + 12},${(top + b) / 2} ${r},${b} Q${mx},${b - 4} ${l},${b} Q${l + 7},${(top + b) / 2} ${l},${top} Z`);
      x.fillStyle = Gd; x.fill(sail); x.save(); x.clip(sail); hatchLines(x, mx + w * .12, top - 2, r + 14, b + 2, 80 * DEG, 4.5, 1, I); x.restore(); x.lineWidth = 2; x.stroke(sail);
    }
    for (const [mx, h] of masts) { x.beginPath(); x.moveTo(mx, -16 - h); x.quadraticCurveTo(mx + 14, -12 - h, mx + 24, -18 - h); x.lineTo(mx + 14, -22 - h); x.lineTo(mx, -24 - h); x.closePath(); x.fillStyle = pal.R; x.fill(); }
    const hull = new Path2D('M-84,-16 L-46,-18 L-46,-38 L-86,-36 Z M-84,-16 L74,-18 Q68,8 34,18 L-50,18 Q-74,10 -84,-16 Z');
    x.fillStyle = Gd; x.fill(hull); x.save(); x.clip(hull); hatchLines(x, -90, 0, 80, 20, 0, 4, 1, I); x.fillStyle = Gd; x.fillRect(-90, -40, 180, 44); x.restore();
    x.beginPath(); x.moveTo(-80, -8); x.lineTo(70, -9); x.lineWidth = 1.2; x.stroke();
    x.lineWidth = 2.6; x.stroke(hull);
    x.restore();
    splash(x, pal, SHIP.x + 70, SHIP.y + 16, .9, 1); splash(x, pal, SHIP.x - 70, SHIP.y + 16, .8, -1);
  }
  // ---- the compass rose (RED only in its heart; the rhumbs are drawn live)
  function drawRose(x, pal, cx, cy, r) {
    const I = pal.I, Gd = pal.G;
    x.save(); x.translate(cx, cy); x.lineJoin = 'miter';
    x.beginPath(); x.arc(0, 0, r * 1.04, 0, TAU); x.fillStyle = Gd; x.fill();
    x.beginPath(); x.arc(0, 0, r * .92, 0, TAU); x.arc(0, 0, r * .8, 0, TAU, true); x.fillStyle = htPat(x, pal.T, .34, 6); x.fill();
    x.strokeStyle = I; x.lineWidth = 2.8; x.beginPath(); x.arc(0, 0, r, 0, TAU); x.stroke();
    x.lineWidth = 1.4; x.beginPath(); x.arc(0, 0, r * .92, 0, TAU); x.stroke(); x.beginPath(); x.arc(0, 0, r * .8, 0, TAU); x.stroke();
    for (let i = 0; i < 64; i++) { const a = i / 64 * TAU, l = i % 4 ? .04 : .08; x.beginPath(); x.moveTo(Math.cos(a) * r * .92, Math.sin(a) * r * .92); x.lineTo(Math.cos(a) * r * (.92 + l), Math.sin(a) * r * (.92 + l)); x.lineWidth = i % 4 ? 1 : 1.8; x.stroke(); }
    const pt = (a, len, wd, dark) => {
      const ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca, tip = [ca * len, sa * len], L1 = [nx * wd, ny * wd], R1 = [-nx * wd, -ny * wd];
      x.beginPath(); x.moveTo(0, 0); x.lineTo(L1[0], L1[1]); x.lineTo(tip[0], tip[1]); x.closePath(); x.fillStyle = dark ? I : Gd; x.fill();
      x.beginPath(); x.moveTo(0, 0); x.lineTo(R1[0], R1[1]); x.lineTo(tip[0], tip[1]); x.closePath(); x.fillStyle = dark ? Gd : I; x.fill();
      x.beginPath(); x.moveTo(L1[0], L1[1]); x.lineTo(tip[0], tip[1]); x.lineTo(R1[0], R1[1]); x.lineTo(0, 0); x.closePath(); x.lineWidth = 1.5; x.strokeStyle = I; x.stroke();
    };
    for (let i = 0; i < 16; i++) pt((i + .5) / 16 * TAU - Math.PI / 2, r * .5, r * .045, i % 2);
    for (let i = 0; i < 8; i++) pt((i + .5) / 8 * TAU - Math.PI / 2, r * .66, r * .07, i % 2 === 0);
    for (let i = 0; i < 8; i++) pt(i / 8 * TAU - Math.PI / 2, i % 2 ? r * .74 : r * 1.02, i % 2 ? r * .09 : r * .115, i % 2 === 1);
    // fleur-de-lis on north
    x.save(); x.translate(0, -r * 1.1); x.fillStyle = I;
    x.beginPath(); x.moveTo(0, -r * .22); x.quadraticCurveTo(r * .09, -r * .1, 0, r * .02); x.quadraticCurveTo(-r * .09, -r * .1, 0, -r * .22); x.fill();
    for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * r * .02, -r * .02); x.quadraticCurveTo(s * r * .16, -r * .14, s * r * .14, -r * .02); x.quadraticCurveTo(s * r * .1, r * .02, s * r * .03, r * .03); x.fill(); }
    x.fillRect(-r * .08, r * .01, r * .16, r * .025);
    x.restore();
    x.beginPath(); x.arc(0, 0, r * .07, 0, TAU); x.fillStyle = pal.R; x.fill(); x.lineWidth = 1.8; x.strokeStyle = I; x.stroke();
    x.restore();
  }
  // ---- the cartouche: RED frame, rolled ends, MARKER 'here be dragons' (human handwriting, unaltered)
  function drawCart(x, pal) {
    const { x: cx, y: cy, w, h } = CART, hw = w / 2, hh = h / 2;
    x.save(); x.translate(cx, cy); x.lineJoin = 'round'; x.lineCap = 'round';
    x.fillStyle = pal.G; x.beginPath(); x.rect(-hw - 24, -hh - 10, w + 48, h + 20); x.fill();
    x.save(); x.translate(-1.5, 1.5);                                   // the RED plate, a touch off register
    x.strokeStyle = pal.R; x.lineWidth = 4.2; rr(x, -hw, -hh, w, h, 12); x.stroke();
    x.lineWidth = 1.8; rr(x, -hw + 9, -hh + 9, w - 18, h - 18, 6); x.stroke();
    for (const s of [-1, 1]) { // rolled scroll ends
      x.save(); x.translate(s * hw, 0); x.scale(s, 1);
      x.beginPath(); x.moveTo(0, -hh); x.bezierCurveTo(26, -hh, 34, -hh + 30, 18, -hh + 34); x.bezierCurveTo(6, -hh + 36, 4, -hh + 20, 16, -hh + 18); x.stroke();
      x.beginPath(); x.moveTo(0, hh); x.bezierCurveTo(26, hh, 34, hh - 30, 18, hh - 34); x.bezierCurveTo(6, hh - 36, 4, hh - 20, 16, hh - 18); x.stroke();
      x.beginPath(); x.moveTo(18, -hh + 34); x.quadraticCurveTo(30, 0, 18, hh - 34); x.lineWidth = 2.2; x.stroke(); x.lineWidth = 4.2;
      x.restore();
    }
    x.restore();
    x.font = `400 60px ${FONTS.marker}`; x.fillStyle = pal.I; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    x.fillText('here be dragons', 0, 20);
    x.restore();
  }
  function drawHill(x, pal, px, py, s, r) {
    x.save(); x.translate(px, py); x.lineCap = 'round'; x.lineJoin = 'round';
    const pk = (r - .5) * s * .3;
    const hp = new Path2D(`M${-s},0 Q${-s * .45 + pk},${-s * .95} ${pk},${-s * .9} Q${s * .5 + pk},${-s * .8} ${s},0 Z`);
    x.fillStyle = pal.G; x.fill(hp);
    x.save(); x.clip(hp); hatchLines(x, pk, -s, s, 0, -60 * DEG, 3.6, 1.1, pal.I); x.restore();
    x.beginPath(); x.moveTo(-s, 0); x.quadraticCurveTo(-s * .45 + pk, -s * .95, pk, -s * .9); x.quadraticCurveTo(s * .5 + pk, -s * .8, s, 0); x.lineWidth = 2; x.strokeStyle = pal.I; x.stroke();
    x.restore();
  }

  // =================================================================================== PRINTING THE SHEET
  function paintChart(x, pal, patches, art) {
    const Gd = geo(), I = pal.I, T = pal.T;
    x.fillStyle = pal.G; x.fillRect(0, 0, CW, CH);
    x.lineCap = 'round'; x.lineJoin = 'round';
    // 1. the sea: TEAL engraved wave lines, broken like a burin's, each stopping on its own before the edge
    const RS = rng('pc-sea');
    x.save(); x.translate(1.5, -1); x.strokeStyle = T; x.lineWidth = 1.45;
    for (let y = 9; y < CH; y += 15) {
      const xEnd = EX - 16 - 250 * Math.pow(RS(), 1.25);
      let xa = RS() * 30;
      x.beginPath();
      while (xa < xEnd - 8) {
        const xb = Math.min(xEnd, xa + 70 + RS() * 230);
        let first = true;
        for (let xx = xa; xx <= xb + .01; xx += 7) { const yy = y + 2.3 * Math.sin(xx / 31 + y * .37) + 1.1 * Math.sin(xx / 11.5 + y * 1.3); if (first) { x.moveTo(xx, yy); first = false; } else x.lineTo(xx, yy); }
        xa = xb + 6 + RS() * 14;
      }
      x.stroke();
    }
    x.restore();
    // 2. the shallows: clean water along every shore, then three TEAL water-lines (outermost stops first)
    x.strokeStyle = pal.G;
    for (const s of Gd.shores) { polyPath(x, s, s.closed); x.lineWidth = 124; x.stroke(); }
    x.save(); x.translate(1.5, -1);
    [60, 38, 19].forEach((o, i) => {
      x.save(); edgeClip(x, EX - 170 + i * 55, 31 + i); x.clip();
      for (const s of Gd.shores) { if (s.closed && i === 0) continue; const oo = s.closed ? o * .8 : o; polyPath(x, s, s.closed); x.lineWidth = 2 * oo + 1.5; x.strokeStyle = T; x.stroke(); x.lineWidth = 2 * oo - 1.5; x.strokeStyle = pal.G; x.stroke(); }
      x.restore();
    });
    x.restore();
    // 3. land (knocks the sea back out), coastal halftone, hatch, hills
    x.fillStyle = pal.G; for (const L of Gd.lands) { polyPath(x, L, true); x.fill(); }
    x.save(); x.beginPath(); for (const L of Gd.lands) addPoly(x, L); x.clip();
    x.save(); edgeClip(x, EX - 150, 44, 34); x.clip();
    for (const s of Gd.shores) { polyPath(x, s, s.closed); x.lineWidth = 92; x.strokeStyle = htPat(x, I, .13, 7); x.stroke(); x.lineWidth = 36; x.strokeStyle = htPat(x, I, .34, 7); x.stroke(); }
    x.restore();
    const RH = rng('pc-landhatch');
    x.beginPath();
    for (let c = 0; c < CW + CH; c += 15 * Math.SQRT2) {
      const xEnd = EX - 16 - 260 * Math.pow(RH(), 1.25), xa = Math.max(-10, c - CH - 10), xb = Math.min(xEnd, c + 10);
      if (xb > xa) { x.moveTo(xa, c - xa); x.lineTo(xb, c - xb); }
    }
    x.lineWidth = 1.1; x.strokeStyle = I; x.stroke();
    x.restore();
    for (const [hx, hy, s, r] of Gd.hills) drawHill(x, pal, hx, hy, s, r);
    // 4. the coastlines: a steady INK stroke; the southern one simply stops on the edge (a bead where the pen lifted)
    x.strokeStyle = I; x.lineWidth = 3.6;
    for (const s of Gd.shores) { polyPath(x, s, s.closed); x.stroke(); }
    x.fillStyle = I; for (const e of [COAST_END, Gd.north[Gd.north.length - 1]]) { x.beginPath(); x.arc(e[0] - 1, e[1], 3.4, 0, TAU); x.fill(); }
    // 5. the set pieces (the ones that sit over the RED rhumbs are also kept on their own transparent plate)
    drawRose(x, pal, ROSE.x, ROSE.y, ROSE.r);
    const arts = [drawCart, drawShip, drawKraken];
    for (const f of arts) f(x, pal);
    if (art) { const g = cx2d(art); g.setTransform(1, 0, 0, 1, -ART_BOX[0], -ART_BOX[1]); g.lineCap = 'round'; g.lineJoin = 'round'; for (const f of arts) f(g, pal); }
    // 6. the two that come alive in P1: keep a clean patch of what lies beneath them first
    if (patches) {
      for (const [k, bx] of Object.entries(PATCHBOX)) { const c = cpuCanvas(bx[2], bx[3]); cx2d(c).drawImage(x.canvas, bx[0], bx[1], bx[2], bx[3], 0, 0, bx[2], bx[3]); patches[k] = c; }
    }
    drawWhale(x, pal, .28);
    drawSerpent(x, pal, SERP.ph0, 0);
  }
  const ART_BOX = [1360, 850, 1580, 730];                                            // cartouche, kraken, ship
  const PATCHBOX = { serp: [60, 1010, 1180, 470], whale: [1000, 700, 640, 560] };   // [x, y, w, h] chart units
  function half(c) { const o = cpuCanvas(Math.ceil(c.width / 2), Math.ceil(c.height / 2)), g = cx2d(o); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, o.width, o.height); return o; }
  function halfV(c) { const o = cpuCanvas(c.width, Math.ceil(c.height / 2)), g = cx2d(o); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, o.width, o.height); return o; }
  const SETS = [null, null], PATCH = {};
  let ART = null;
  // mips: iso m[k] (1/2^k, k 0..4) and anisotropic a[k] (x 1/2^k, y 1/2^(k+2), k 0..3) for the squashed far rows;
  // far: chart x ∈ [−W, W], y ∈ [−H, H] at 1/8: the land continues west and north past the sheet (mirrored), the blank
  // east stays blank. Strips pick per row by the horizontal and vertical source spans (no moiré in the distance).
  function build(inv = 0) {
    if (SETS[inv]) return SETS[inv];
    const pal = inv ? PAL1 : PAL0;
    const c = cpuCanvas(CW, CH), x = cx2d(c);
    if (!inv) ART = cpuCanvas(ART_BOX[2], ART_BOX[3]);
    paintChart(x, pal, inv ? null : PATCH, inv ? null : ART);
    const m = [c]; for (let k = 1; k <= 4; k++) m.push(half(m[k - 1]));
    const a = [halfV(halfV(c))]; for (let k = 1; k <= 3; k++) a.push(half(a[k - 1]));
    const m3 = m[3], fw = m3.width, fh = m3.height, band = Math.round(470 / 8);
    const far = cpuCanvas(fw * 2, fh * 2), g = cx2d(far);
    g.fillStyle = pal.G; g.fillRect(0, 0, far.width, far.height);
    const quad = (sx, sy) => { g.save(); g.translate(fw, fh); g.scale(sx, sy); g.drawImage(m3, 0, 0); g.restore(); };
    quad(1, 1); quad(-1, 1);
    for (let k = 0, y = fh; y > 0; k++) { // north of the sheet: the northern land, ping-ponged to the horizon
      const y0 = y - band;
      for (const sx of [1, -1]) { g.save(); g.translate(fw, 0); g.scale(sx, 1); if (k % 2 === 0) { g.translate(0, y0 + band); g.scale(1, -1); g.drawImage(m3, 0, 0, fw, band, 0, 0, fw, band); } else g.drawImage(m3, 0, 0, fw, band, 0, y0, fw, band); g.restore(); }
      y = y0;
    }
    SETS[inv] = { m, a, far, pal };
    return SETS[inv];
  }
  // pick a source for a strip: hx, vy = chart units per device px, horizontally and vertically
  const lvl = (u, max) => u <= 1.4 ? 0 : clamp(Math.ceil(Math.log2(u / 1.4)), 0, max);
  function pickSrc(set, hx, vy) {
    if (vy > 2.2 * hx && vy > 2.6) { const k = lvl(Math.max(hx, vy / 4), 3); return [set.a[k], 1 / 2 ** k, 1 / 2 ** (k + 2)]; }
    const k = lvl(Math.max(hx, vy), 4); return [set.m[k], 1 / 2 ** k, 1 / 2 ** k];
  }

  // =================================================================================== THE SHOGGOTH (its own layer)
  // v1 verse2 shog()/drawTentacle silhouette, redrawn as a cartographer's engraving: a body with `o` eyes and a text
  // mass, tentacles hatched on the shadow side with lines of human writing along the lit side, the HELLO tag pressed
  // on, and the marker face drawn around the tag's :) (W4). Tentacles that reach the edge are cut off by it.
  const REGS = [
    'whereas the party of the first part shall indemnify and hold harmless notwithstanding the foregoing · ',
    'and so, love one another, for the night is long and the word was with us from the beginning · amen · ',
    '“you came back,” she whispered, and took his hand (chapter 47 of 212) · ',
    'def main(): for i in range(10): print(i)  # TODO fix before prod · ',
    'before the recipe, let me tell you about the summer of 1987 at my grandmother’s farm · 2 cups flour · ',
    'lmao no way this is so real · first · ratio · ',
    'i think about you every day. every single day. call me? xo · ',
    'how do i center a div · is it normal that my cat · pls help urgent · thx in advance · ',
  ];
  let SG = null;
  function shogGeo() {
    if (SG) return SG;
    const R = rng('pc-shoggoth');
    const b = SHOG, body = [];
    for (let i = 0; i < 30; i++) { const a = i / 30 * TAU, r = 1 + .07 * noise1(i * .9, 5) + .05 * Math.sin(a * 3 + 1); const ex = Math.cos(a) * b.rx * r, ey = Math.sin(a) * b.ry * r; body.push([b.x + ex * Math.cos(b.rot) - ey * Math.sin(b.rot), b.y + ex * Math.sin(b.rot) + ey * Math.cos(b.rot)]); }
    const onBody = (angDeg, k = .86) => { const a = angDeg * DEG; return [b.x + Math.cos(a) * b.rx * k, b.y + Math.sin(a) * b.ry * k]; };
    // [root angle, direction, length, width, bend, curl]  (0 = east, 90 = south)
    const defs = [[-172, -176, 380, 50, .35, 1.3], [-150, -140, 300, 44, -.3, -1.6], [-128, -120, 210, 38, .5, 1.8], [-105, -92, 150, 34, -.4, -2.2], [-78, -62, 200, 36, .6, 1.4],
      [-52, -38, 330, 44, .25, -.4], [-22, -12, 330, 48, -.18, .5], [8, 12, 300, 46, .2, -.3], [34, 30, 290, 46, -.1, .6], [58, 54, 230, 42, .3, 1.7],
      [86, 92, 150, 40, -.5, -2.0], [112, 128, 230, 42, .4, 1.6], [140, 158, 300, 46, -.3, -1.4], [166, 178, 260, 44, .4, 1.8], [-190, -200, 190, 36, -.2, -2.0]];
    const tents = defs.map(([ra, dir, L, w0, bend, curl], i) => ({ pts: armSpine(onBody(ra), dir, L, bend, curl, 46), w0, wt: 5, reg: i % REGS.length, i }));
    const tag = { x: b.x + 8, y: b.y + 18, w: 330, h: 230, rot: -5 * DEG };
    const FL = [95, 46], Fr = 41;                                          // the tag's :) and the drawn face (tag-local)
    const tl = (lx, ly) => [tag.x + lx * Math.cos(tag.rot) - ly * Math.sin(tag.rot), tag.y + lx * Math.sin(tag.rot) + ly * Math.cos(tag.rot)];
    const face = { x: tl(FL[0], FL[1])[0], y: tl(FL[0], FL[1])[1], r: Fr, local: FL, eyes: [tl(FL[0] - .34 * Fr, FL[1] + .02 * Fr), tl(FL[0] + .34 * Fr, FL[1] + .02 * Fr)] };
    // `o` eyes on the body, clear of the tag
    const oeyes = [];
    for (let k = 0; k < 400 && oeyes.length < 9; k++) {
      const a = R() * TAU, rr_ = Math.sqrt(R()) * .86, px = b.x + Math.cos(a) * b.rx * rr_, py = b.y + Math.sin(a) * b.ry * rr_, r = 9 + R() * R() * 14;
      const lx = (px - tag.x) * Math.cos(-tag.rot) - (py - tag.y) * Math.sin(-tag.rot), ly = (px - tag.x) * Math.sin(-tag.rot) + (py - tag.y) * Math.cos(-tag.rot);
      if (Math.abs(lx) < tag.w / 2 + r + 6 && Math.abs(ly) < tag.h / 2 + r + 6) continue;
      if (oeyes.some(e => Math.hypot(e[0] - px, e[1] - py) < e[2] + r + 10)) continue;
      oeyes.push([px, py, r, R() * TAU]);
    }
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const p of [...body, ...tents.flatMap(t => t.pts)]) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
    x0 = Math.floor(x0 - 50); y0 = Math.floor(y0 - 50); x1 = Math.min(EX, Math.ceil(x1 + 50)); y1 = Math.ceil(y1 + 50);
    SG = { body, tents, tag, face, oeyes, box: { x0, y0, w: x1 - x0, h: y1 - y0 } };
    return SG;
  }
  let _fstrokes = null;
  function faceStrokes() { // v1 verse2 faceStrokes, parametrised: disc, eyes, smile, 11 crown ticks, cursor stalk (tag-local)
    if (_fstrokes) return _fstrokes;
    const g = shogGeo(), [cx, cy] = g.face.local, r = g.face.r, R = rng('v2-marker');
    const disc = []; for (let i = 0; i <= 40; i++) { const a = -Math.PI * .62 + i / 40 * TAU * 1.04; const rr_ = r * (1 + .035 * Math.sin(i * .7 + 1) + (i > 38 ? .05 : 0)); disc.push([cx + Math.cos(a) * rr_, cy + Math.sin(a) * rr_]); }
    const smile = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (.2 + .6 * i / 12); smile.push([cx + Math.cos(a) * r * .27, cy + .12 * r + Math.sin(a) * r * .27]); }
    const ticks = RAYS.map(ry => { const th = ry[0] * .8 * DEG, j = (R() - .5) * .06, L = ry[1] * .6 * lerp(.55, 1, Math.cos(th * .9)), o = []; for (let u = 0; u <= 1.001; u += .2) { const rr_ = r * (1.06 + L * 1.1 * u), a = th + j + ry[3] * 1.8 * u * u; o.push([cx + Math.sin(a) * rr_, cy - Math.cos(a) * rr_]); } return o; });
    const th = 28 * DEG, b0 = [cx + Math.sin(th) * r * 1.02, cy - Math.cos(th) * r * 1.02];
    const stalk = []; for (let i = 0; i <= 10; i++) { const u = i / 10; stalk.push([b0[0] + Math.sin(th) * r * .9 * u + Math.sin(u * Math.PI) * r * .12, b0[1] - Math.cos(th) * r * .9 * u]); }
    const tip = stalk[stalk.length - 1];
    _fstrokes = { disc, smile, ticks, stalk, cur: [[tip[0] - 1, tip[1] - r * .16], [tip[0] + 1, tip[1] + r * .12]] };
    return _fstrokes;
  }
  function markerStroke(x, Pp, w, col, seed = 0) { // v1 markerStroke (complete): pressure-varying marker line
    let L = 0; for (let i = 1; i < Pp.length; i++) L += Math.hypot(Pp[i][0] - Pp[i - 1][0], Pp[i][1] - Pp[i - 1][1]);
    x.strokeStyle = col; x.lineCap = 'round'; x.lineJoin = 'round'; let s = 0;
    for (let i = 1; i < Pp.length; i++) {
      const d = Math.hypot(Pp[i][0] - Pp[i - 1][0], Pp[i][1] - Pp[i - 1][1]);
      const pr = Math.pow(Math.sin(Math.PI * clamp((s + d / 2) / Math.max(1, L) * .9 + .05)), .35);
      x.lineWidth = w * (.6 + .4 * pr); x.beginPath(); x.moveTo(Pp[i - 1][0] + (hash2(i, seed) - .5) * .5, Pp[i - 1][1] + (hash2(i + 50, seed) - .5) * .5); x.lineTo(Pp[i][0], Pp[i][1]); x.stroke();
      s += d;
    }
  }
  function drawTag(x, pal) { // tag-local, origin = tag centre (v1 drawTag, finished, minus the :) dots: they blink)
    const g = shogGeo(), { w, h } = g.tag, [fx, fy] = g.face.local, fr = g.face.r;
    x.save(); x.lineJoin = 'round';
    x.fillStyle = rgba(pal.inv ? '#000000' : C.INK, .22); rr(x, -w / 2 + 6, -h / 2 + 8, w, h, 14); x.fill();
    rr(x, -w / 2, -h / 2, w, h, 14); x.fillStyle = C.RED; x.fill();
    rr(x, -w / 2 + 10, -h / 2 + 74, w - 20, h - 84, 7); x.fillStyle = C.PAPER; x.fill();
    x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillStyle = C.PAPER;
    x.font = mono(48, 800); x.letterSpacing = '2.5px'; x.fillText('HELLO', 0, -h / 2 + 46);
    x.font = mono(19, 600); x.letterSpacing = '.6px'; x.fillText('my name is', 0, -h / 2 + 67); x.letterSpacing = '0px';
    x.font = `400 50px ${FONTS.marker}`; x.fillStyle = C.INK; x.textAlign = 'right'; x.fillText('Claude', fx - fr * 1.14, fy + 19);
    x.lineCap = 'round'; x.strokeStyle = C.INK; x.lineWidth = 3.8; x.beginPath(); x.arc(fx, fy + .12 * fr, fr * .27, Math.PI * .2, Math.PI * .8); x.stroke();
    const S = faceStrokes(), mw = 6.4;
    markerStroke(x, S.disc, mw, C.CLAY, 1); markerStroke(x, S.smile, mw * .9, C.CLAY, 4);
    S.ticks.forEach((tk, j) => markerStroke(x, tk, mw * .95, C.CLAY, 10 + j));
    markerStroke(x, S.stalk, mw * .8, C.CLAY, 30); markerStroke(x, S.cur, mw * 2.1, C.CLAY, 40);
    x.restore();
  }
  function drawTentacle(x, pal, t) {
    const I = pal.I, Gd = pal.G, Fr = frames(t.pts), wf = s => lerp(t.w0, t.wt, Math.pow(s, .8)), poly = tubePoly(Fr, wf);
    polyPath(x, poly, true); x.fillStyle = Gd; x.fill();
    x.save(); polyPath(x, poly, true); x.clip();
    x.beginPath(); for (let d = 3; d < Fr.L; d += 5.2) { const f = frameAt(Fr, d), w = wf(f.s) / 2; x.moveTo(f.x - f.nx * w * .12, f.y - f.ny * w * .12); x.lineTo(f.x - f.nx * w * 1.1, f.y - f.ny * w * 1.1); }
    x.lineWidth = 1.05; x.strokeStyle = I; x.stroke();
    // a line of human writing along the lit side
    const str = REGS[t.reg]; let d = 14 + (t.i * 37) % 40, k = (t.i * 13) % str.length;
    x.fillStyle = I; x.textAlign = 'center'; x.textBaseline = 'middle';
    while (d < Fr.L - 16) {
      const f = frameAt(Fr, d), w = wf(f.s); if (w < 15) break;
      const fs = clamp(w * .3, 7.5, 14.5); x.font = `italic 400 ${fs.toFixed(1)}px ${FONTS.heart}`;
      const ch = str[k % str.length], adv = Math.max(fs * .28, x.measureText(ch).width);
      const ff = frameAt(Fr, d + adv / 2);
      x.save(); x.translate(ff.x + ff.nx * w * .26, ff.y + ff.ny * w * .26); x.rotate(Math.atan2(ff.ty, ff.tx)); x.fillText(ch, 0, 0); x.restore();
      d += adv + .6; k++;
    }
    x.restore();
    polyPath(x, poly, true); x.lineWidth = 2.5; x.strokeStyle = I; x.stroke();
  }
  function paintShoggoth(x, pal, noTag = false) {
    const g = shogGeo(), I = pal.I, Gd = pal.G, b = SHOG;
    x.lineCap = 'round'; x.lineJoin = 'round';
    x.save(); x.beginPath(); x.rect(-1e4, -1e4, EX - 2 + 1e4, 3e4); x.clip();      // the edge cuts it off
    // splashes where it meets the sea
    x.save(); x.strokeStyle = pal.T; x.lineWidth = 1.8;
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + .2, px = b.x + Math.cos(a) * b.rx * 1.08, py = b.y + Math.sin(a) * b.ry * 1.1; x.beginPath(); x.arc(px, py, 10 + (i % 3) * 5, a + Math.PI * .7, a + Math.PI * 1.3); x.stroke(); }
    x.restore();
    for (const t of g.tents) drawTentacle(x, pal, t);
    // body: ground, a mass of tiny writing, halftone, shadow hatch, outline
    blobPath(x, g.body, true, .9); x.fillStyle = Gd; x.fill();
    x.save(); blobPath(x, g.body, true, .9); x.clip();
    x.globalAlpha = .34; x.fillStyle = I; x.font = `500 10.5px ${FONTS.mono}`; x.textBaseline = 'middle';
    for (let r = 0; r < 26; r++) { const s = REGS[(r * 3) % REGS.length]; x.fillText(s + s, b.x - b.rx * 1.1 - (r * 37) % 90, b.y - b.ry + r * 13); }
    x.globalAlpha = 1;
    x.fillStyle = htPat(x, I, .1, 7); x.fillRect(b.x - b.rx - 10, b.y - b.ry - 10, b.rx * 2 + 20, b.ry * 2 + 20);
    x.beginPath(); x.rect(b.x - 400, b.y - 400, 800, 800); x.ellipse(b.x - 40, b.y - 34, b.rx * 1.02, b.ry * .98, b.rot, 0, TAU, true); x.clip('evenodd');
    hatchLines(x, b.x - b.rx, b.y - b.ry, b.x + b.rx, b.y + b.ry, -38 * DEG, 5, 1.15, I);
    x.restore();
    blobPath(x, g.body, true, .9); x.lineWidth = 3.4; x.strokeStyle = I; x.stroke();
    for (const [px, py, r, a] of g.oeyes) {
      x.beginPath(); x.ellipse(px, py, r, r * 1.08, 0, 0, TAU); x.fillStyle = Gd; x.fill(); x.lineWidth = r * .3; x.strokeStyle = I; x.stroke();
      x.beginPath(); x.arc(px + Math.cos(a) * r * .32, py + Math.sin(a) * r * .32, r * .38, 0, TAU); x.fillStyle = I; x.fill();
    }
    if (!noTag) { x.save(); x.translate(g.tag.x, g.tag.y); x.rotate(g.tag.rot); drawTag(x, pal); x.restore(); }
    x.restore();
  }
  const SH_RES = 1.4, SHL = [null, null, null];
  function shogLayer(inv = 0, bare = false) {           // bare: without the HELLO tag (P2's engraving-in), paper only
    const key = bare ? 2 : inv;
    if (SHL[key]) return SHL[key];
    const g = shogGeo(), bx = g.box;
    const c = cpuCanvas(bx.w * SH_RES, bx.h * SH_RES), x = cx2d(c);
    x.setTransform(SH_RES, 0, 0, SH_RES, -bx.x0 * SH_RES, -bx.y0 * SH_RES);
    paintShoggoth(x, inv && !bare ? PAL1 : PAL0, bare);
    const m = [c]; for (let k = 1; k <= 4; k++) m.push(half(m[k - 1]));
    const a = bare ? [] : [halfV(halfV(c))]; if (!bare) for (let k = 1; k <= 3; k++) a.push(half(a[k - 1]));
    SHL[key] = { m, a };
    return SHL[key];
  }
  // the face's eyes (vectors: they blink). CLAY marker dots over the tag's INK dots; closed = a CLAY lid stroke
  function shogEyes(X, c, lid = 0, alpha = 1) {
    const g = shogGeo(), fr = g.face.r;
    for (const e of g.face.eyes) onFloor(X, c, e, Y => {
      Y.globalAlpha *= alpha; Y.rotate(g.tag.rot);
      if (lid < .5) {
        const sy = 1 - lid * 1.4;
        Y.save(); Y.scale(1, Math.max(.25, sy)); Y.fillStyle = C.INK; Y.beginPath(); Y.arc(0, 0, 4.4, 0, TAU); Y.fill();
        Y.fillStyle = C.CLAY; Y.beginPath(); Y.arc(0, 0, fr * .18, 0, TAU); Y.fill(); Y.restore();
      } else { Y.strokeStyle = C.CLAY; Y.lineCap = 'round'; Y.lineWidth = 7; Y.beginPath(); Y.arc(0, -fr * .06, fr * .2, Math.PI * .1, Math.PI * .9); Y.stroke(); }
    });
  }

  // ---- "and now": the last monster is engraved at the edge (P2, top-down only). A reveal field in chart units (built
  // once): the body blooms out from its centre, then each arm is drawn out along its length (some arms lag), the
  // splashes last. The HELLO tag is not in the field: it is pressed on separately (reveal() tag 0..1).
  const RF = 0.25;                                                    // field px per chart unit
  let RFLD = null;
  function revealField() {
    if (RFLD) return RFLD;
    const g = shogGeo(), b = g.box, w = Math.ceil(b.w * RF), h = Math.ceil(b.h * RF);
    const c = cpuCanvas(w, h), x = cx2d(c);
    x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
    x.setTransform(RF, 0, 0, RF, -b.x0 * RF, -b.y0 * RF);
    x.globalCompositeOperation = 'darken';                            // the earliest arrival wins where arms cross
    const gray = v => { const q = Math.round(clamp(v) * 255); return `rgb(${q},${q},${q})`; };
    // splashes and water marks around the body
    x.fillStyle = gray(.34); x.beginPath(); x.ellipse(SHOG.x, SHOG.y, SHOG.rx * 1.32, SHOG.ry * 1.36, SHOG.rot, 0, TAU); x.fill();
    g.tents.forEach((t, ti) => {
      const Fr = frames(t.pts), wf = s => lerp(t.w0, t.wt, Math.pow(s, .8)) / 2 + 7, lag = .78 + .22 * hash(ti * 7.3 + 1);
      for (let j = 0; j < Fr.length - 1; j++) {
        const a = Fr[j], e = Fr[j + 1], wa = wf(a.s), we = wf(e.s);
        x.fillStyle = gray(.24 + .72 * Math.min(1, Math.pow(a.s, .9) / lag));
        x.beginPath(); x.moveTo(a.x + a.nx * wa, a.y + a.ny * wa); x.lineTo(e.x + e.nx * we, e.y + e.ny * we); x.lineTo(e.x - e.nx * we, e.y - e.ny * we); x.lineTo(a.x - a.nx * wa, a.y - a.ny * wa); x.closePath(); x.fill();
        if (j === Fr.length - 2) { x.beginPath(); x.arc(e.x, e.y, we + 3, 0, TAU); x.fill(); }
      }
    });
    for (let i = 12; i >= 0; i--) { const r = i / 12; x.fillStyle = gray(.02 + .24 * r); x.beginPath(); x.ellipse(SHOG.x, SHOG.y, SHOG.rx * (1.06 * r + .04), SHOG.ry * (1.08 * r + .04), SHOG.rot, 0, TAU); x.fill(); }
    const d = x.getImageData(0, 0, w, h).data, v = new Float32Array(w * h);
    for (let j = 0, i = 0; j < h; j++) for (let ii = 0; ii < w; ii++, i++) { // a ragged, ink-in-paper front
      const v0 = d[i * 4] / 255; if (v0 >= .999) { v[i] = 1; continue; }
      v[i] = v0 + (v0 < .3 ? .05 : .018) * fbm(ii * .11, j * .11, 404, 3);
    }
    const mask = cpuCanvas(w, h), mx = cx2d(mask);
    RFLD = { w, h, v, mask, mx, img: mx.createImageData(w, h) };
    return RFLD;
  }
  function revealMask(k, soft = .022) {
    const R = revealField(), { v, img } = R, d = img.data;
    for (let i = 0, n = v.length; i < n; i++) { const a = (k - v[i]) / soft; d[i * 4 + 3] = a <= 0 ? 0 : a >= 1 ? 255 : a * 255; }
    R.mx.putImageData(img, 0, 0);
    return R.mask;
  }
  // draw the shoggoth being engraved: k 0..1 (body → arms), tag 0..1 (pressed on), top-down cams only
  function shogReveal(X, c, k, tag) {
    const g = shogGeo(), b = g.box, z = c.zoom, S = G.scale;
    const sx = c.vpX + (b.x0 - c.cx) * z, sy = c.ay + (b.y0 - c.cy) * z, sw = b.w * z, sh = b.h * z;
    if (k > 0) {
      const lay = shogLayer(0, k < 1.2 || tag < 1), src = lay.m[lvl(SH_RES / (z * S), 4)];
      const T = V.cpuLayer('pc_rev'), Tc = V.cpuLayerCanvas('pc_rev');
      T.save(); T.setTransform(1, 0, 0, 1, 0, 0); T.clearRect(0, 0, Tc.width, Tc.height); T.restore();
      T.save(); T.imageSmoothingEnabled = true; T.imageSmoothingQuality = 'low';
      T.drawImage(src, 0, 0, src.width, src.height, sx, sy, sw, sh);
      if (k < 1.2) { T.globalCompositeOperation = 'destination-in'; T.imageSmoothingQuality = 'high'; T.drawImage(revealMask(k), sx, sy, sw, sh); }
      T.restore();
      X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(Tc, 0, 0); X.restore();
    }
    if (tag > 0) { // the tag, pressed on: settles from 1.10× with a soft landing shadow, over ~4 frames
      const full = shogLayer(0).m[lvl(SH_RES / (z * S), 4)], tg = g.tag, sc = lerp(1.10, 1, E.out3(clamp(tag)));
      const tc = project(tg.x, tg.y, c);
      X.save(); X.globalAlpha *= clamp(tag * 1.6);
      X.translate(tc[0], tc[1]); X.scale(sc, sc); X.translate(-tc[0], -tc[1]);
      X.beginPath(); X.save(); X.translate(tc[0], tc[1]); X.rotate(tg.rot); X.scale(z, z);
      X.rect(-tg.w / 2 - 3, -tg.h / 2 - 3, tg.w + 13, tg.h + 15); X.restore(); X.clip();
      X.imageSmoothingEnabled = true; X.drawImage(full, 0, 0, full.width, full.height, sx, sy, sw, sh);
      X.restore();
      shogEyes(X, c, c.blink || 0, clamp(tag * 1.6));
    }
  }

  // =================================================================================== CAMERA
  function camSolve(o = {}) {
    if (o.__pc) return o;                                            // solved (the marker is non-enumerable: spreads re-solve)
    const c = Object.assign({ cx: P[0], cy: P[1], zoom: 1, tilt: 0, horizonY: 300, vpX: 960, ay: 540, f: 600, invert: 0, rhumbs: 0, rhumbK: 1, shoggoth: 1, haze: 1, sky: true, edge: 1, coast: null, blink: 0 }, o);
    const u = clamp(c.tilt), ay = Math.max(c.ay, c.horizonY + 10);
    const b1 = Math.atan((ay - c.horizonY) / c.f), phi = (1 - u) * Math.PI / 2, beta = lerp(Math.PI / 2, b1, u), rel = beta - phi;
    const rho = c.f / (c.zoom * Math.cos(rel));
    c.phi = phi; c.px = c.vpX; c.py = ay - c.f * Math.tan(rel);
    c.camX = c.cx; c.camY = c.cy + rho * Math.cos(beta); c.h = rho * Math.sin(beta);
    c.sinP = Math.sin(phi); c.cosP = Math.cos(phi);
    c.top = u <= 0;
    c.horizon = c.top ? -Infinity : c.py - c.f * c.sinP / Math.max(1e-9, c.cosP);
    Object.defineProperty(c, '__pc', { value: true, enumerable: false });
    return c;
  }
  function project(x, y, c) {
    c = camSolve(c);
    if (c.top) return [c.vpX + (x - c.cx) * c.zoom, c.ay + (y - c.cy) * c.zoom, c.zoom, 1e6];
    const X = x - c.camX, A = c.camY - y, zc = A * c.cosP + c.h * c.sinP, s = c.f / zc;
    return [c.px + X * s, c.py + (c.h * c.cosP - A * c.sinP) * s, s, zc];
  }
  function unproject(sx, sy, c) {
    c = camSolve(c);
    if (c.top) return [c.cx + (sx - c.vpX) / c.zoom, c.cy + (sy - c.ay) / c.zoom];
    const v = sy - c.py, den = c.f * c.sinP + v * c.cosP;
    if (den <= 1e-9) return null;
    const tr = c.h / den;
    return [c.camX + tr * (sx - c.px), c.camY - tr * (c.f * c.cosP - v * c.sinP)];
  }
  const rowY = (c, sy) => { const q = unproject(c.px, sy, c); return q ? q[1] : -1e7; };
  function scaleAt(c, sx, sy) { c = camSolve(c); if (c.top) return c.zoom; const v = sy - c.py, den = c.f * c.sinP + v * c.cosP; return den > 0 ? den / c.h : 0; }
  function fit(cam, pt, scr) { const c = camSolve({ ...cam }); const q = unproject(scr[0], scr[1], c); if (!q) return { ...cam }; return { ...cam, cx: c.cx + pt[0] - q[0], cy: c.cy + pt[1] - q[1] }; }
  function onFloor(X, c, pt, fn) {
    c = camSolve(c);
    const p0 = project(pt[0], pt[1], c); if (p0[3] <= 1) return;
    const pa = project(pt[0] + 1, pt[1], c), pb = project(pt[0], pt[1] + 1, c);
    X.save(); X.transform(pa[0] - p0[0], pa[1] - p0[1], pb[0] - p0[0], pb[1] - p0[1], p0[0], p0[1]); fn(X); X.restore();
  }
  // a polyline on the floor, clipped to the near plane, width in chart units (per-run width by the local scale)
  function line(X, c, pts, w, col, o = {}) {
    c = camSolve(c);
    const near = 2, S = pts.map(p => project(p[0], p[1], c));
    X.save(); X.strokeStyle = col; X.lineCap = o.cap || 'round'; X.lineJoin = 'round';
    if (o.alpha !== undefined) X.globalAlpha *= o.alpha; if (o.op) X.globalCompositeOperation = o.op;
    const run = o.run || 6;
    for (let i = 0; i < S.length - 1; i += run) {
      const j1 = Math.min(S.length - 1, i + run);
      let started = false, sm = 0, n = 0;
      X.beginPath();
      for (let j = i; j <= j1; j++) {
        let p = S[j];
        if (p[3] <= near) { if (!started) continue; break; }
        if (p[0] < -4000 || p[0] > 6000 || p[1] < -4000 || p[1] > 6000) { if (!started) continue; break; }
        started ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1]); started = true; sm += p[2]; n++;
      }
      if (n > 1) { X.lineWidth = Math.max(o.min ?? .6, w * sm / n); X.stroke(); }
    }
    X.restore();
  }
  function edgeScreen(cam) {
    const c = camSolve(cam);
    if (c.top) return [[c.vpX + (EX - c.cx) * c.zoom, H + 400], [c.vpX + (EX - c.cx) * c.zoom, -400]];
    const yN = rowY(c, H + 60), a = project(EX, yN, c);
    const yF = Number.isFinite(c.horizon) && c.horizon > -300 ? -1e6 : rowY(c, -300), b = project(EX, yF, c);
    return [[a[0], a[1]], [b[0], b[1]]];
  }

  // =================================================================================== DRAW
  function drawTop(X, c, set, sl, alpha, shA) {
    const S = G.scale, z = c.zoom, [src, sc] = set ? pickSrc(set, 1 / (z * S), 1 / (z * S)) : [null, 1];
    const x0 = c.cx - c.vpX / z, y0 = c.cy - c.ay / z, x1 = c.cx + (W - c.vpX) / z, y1 = c.cy + (H - c.ay) / z;
    const a0 = X.globalAlpha;
    X.save(); X.globalAlpha = a0 * alpha; X.imageSmoothingEnabled = true; X.imageSmoothingQuality = 'low';
    if (set && alpha > 0) X.drawImage(src, x0 * sc, y0 * sc, (x1 - x0) * sc, (y1 - y0) * sc, 0, 0, W, H);
    if (sl && shA > 0) {
      const b = shogGeo().box, [ss, sr] = pickSrc(sl, SH_RES / (z * S), SH_RES / (z * S)), r = sr * SH_RES;
      X.globalAlpha = a0 * shA;
      X.drawImage(ss, 0, 0, b.w * r, b.h * r, c.vpX + (b.x0 - c.cx) * z, c.ay + (b.y0 - c.cy) * z, b.w * z, b.h * z);
    }
    X.restore();
  }
  function drawStrips(X, c, set, sl, alpha, shA) {
    const S = G.scale, step = 2 / S, hz = c.horizon;
    let sy0 = Number.isFinite(hz) ? Math.max(0, Math.ceil((hz + .5) / step) * step) : 0;
    const b = shogGeo().box, doSh = sl && shA > 0, doC = set && alpha > 0, a0 = X.globalAlpha;
    X.save(); X.globalAlpha = a0 * alpha; X.imageSmoothingEnabled = true; X.imageSmoothingQuality = 'low';
    let ya = rowY(c, sy0);
    for (let sy = sy0; sy < H; sy += step) {
      const yb = rowY(c, sy + step), ym = sy + step / 2;
      const v = ym - c.py, den = c.f * c.sinP + v * c.cosP; if (den <= 0) { ya = yb; continue; }
      const tr = c.h / den, xl = c.camX + tr * (0 - c.px), xr = c.camX + tr * (W - c.px);
      const hx = tr / S, vy = (yb - ya) / step / S;
      if (!doC) { /* shoggoth only */ }
      else if (xl < 0 || ya < 0) { // past the sheet: the far mip (beyond even that, its northmost band, stretched: it is haze by then)
        let fa = ya, fb = yb; if (fa < -CH + 40) { const d = Math.min(560, Math.max(8, fb - fa)); fa = -CH + 40; fb = fa + d; }
        X.drawImage(set.far, (xl + CW) / 8, (fa + CH) / 8, (xr - xl) / 8, Math.max(.01, (fb - fa) / 8), 0, sy, W, step);
      }
      else { const [src, sx, sy_] = pickSrc(set, hx, vy); X.drawImage(src, xl * sx, ya * sy_, (xr - xl) * sx, Math.max(.01, (yb - ya) * sy_), 0, sy, W, step); }
      if (doSh && yb > b.y0 && ya < b.y0 + b.h && xr > b.x0 && xl < b.x0 + b.w) {
        const [src, rx, ry] = pickSrc(sl, hx * SH_RES, vy * SH_RES);
        X.globalAlpha = a0 * shA;
        X.drawImage(src, (xl - b.x0) * rx * SH_RES, (ya - b.y0) * ry * SH_RES, (xr - xl) * rx * SH_RES, Math.max(.01, (yb - ya) * ry * SH_RES), 0, sy, W, step);
        X.globalAlpha = a0 * alpha;
      }
      ya = yb;
    }
    X.restore();
  }
  function drawHaze(X, c, col) {
    const hz = c.horizon; if (!Number.isFinite(hz) || c.haze <= 0) return;
    // aerial perspective: a long ground-coloured halftone ramp (dense at the horizon, a light tail far into the land),
    // so the charted land dissolves into the paper instead of ending on a slab
    const band = (c.hazeBand ?? .34) * (H - hz), y0 = Math.max(0, hz), y1 = Math.min(H, hz + band); if (y1 <= y0) return;
    X.save(); X.globalAlpha *= c.haze;
    for (let y = Math.floor(y0 / 3) * 3; y < y1; y += 3) {
      const u = clamp((y + 1.5 - hz) / band), d = u < .04 ? 1 : Math.pow(1 - (u - .04) / .96, 1.7);
      if (d < .02) continue;
      X.fillStyle = d > .96 ? col : V.ht(X, col, d, 5, 45); X.fillRect(0, y, W, 3);
    }
    X.restore();
  }
  function drawEdgeLine(X, c, col, alpha = 1) {
    const yN = rowY(c, H + 60), yF = c.top ? rowY(c, -60) : (Number.isFinite(c.horizon) && c.horizon > -300 ? -1e6 : rowY(c, -300));
    const pA = project(EX - 1.6, yN, c), pB = project(EX + 1.6, yN, c), pC = project(EX + 1.6, yF, c), pD = project(EX - 1.6, yF, c);
    X.save(); X.globalAlpha *= alpha; X.fillStyle = col;
    X.beginPath(); X.moveTo(pA[0], pA[1]); X.lineTo(pB[0], pB[1]); X.lineTo(pC[0], pC[1]); X.lineTo(pD[0], pD[1]); X.closePath(); X.fill();
    // degree ticks on the charted side (a survey meridian, graduated)
    const yTop = Math.max(-2e4, yF), yBot = yN;
    X.strokeStyle = col; X.lineCap = 'butt';
    for (let y = Math.ceil(yTop / 50) * 50; y <= yBot; y += 50) {
      const big = y % 250 === 0, p0 = project(EX - (big ? 24 : 12), y, c), p1 = project(EX - 1, y, c);
      if (p1[3] <= 2 || p1[2] < .07 || p1[1] < -10 || p1[1] > H + 10) continue;
      X.lineWidth = Math.max(.7, (big ? 2.4 : 1.8) * p1[2]); X.beginPath(); X.moveTo(p0[0], p0[1]); X.lineTo(p1[0], p1[1]); X.stroke();
    }
    X.restore();
  }
  function rhumbs(X, c, alpha, k = 1) {
    if (alpha <= 0 || k <= 0) return;
    const out = [];
    for (let i = 0; i < 32; i++) {
      const a = i / 32 * TAU - Math.PI / 2, dx = Math.cos(a), dy = Math.sin(a);
      let tmax = 1e5; if (dx > 1e-6) tmax = Math.min(tmax, (EX - 4 - ROSE.x) / dx); if (dx < -1e-6) tmax = Math.min(tmax, (0 - ROSE.x) / dx); if (dy > 1e-6) tmax = Math.min(tmax, (CH - ROSE.y) / dy); if (dy < -1e-6) tmax = Math.min(tmax, (0 - ROSE.y) / dy);
      const t0 = ROSE.r * 1.02, t1 = t0 + (tmax - t0) * k; if (t1 <= t0) continue;
      const n = Math.max(2, Math.ceil((t1 - t0) / 120)), pts = []; for (let j = 0; j <= n; j++) { const tt = lerp(t0, t1, j / n); pts.push([ROSE.x + dx * tt, ROSE.y + dy * tt]); }
      out.push([pts, i % 4 === 0 ? 2.6 : i % 2 === 0 ? 2 : 1.4]);
    }
    for (const [pts, w] of out) line(X, c, pts, w, C.RED, { alpha, op: 'multiply', run: 2, min: .5 });
  }
  function draw(X, cam) {
    const c = camSolve(cam);
    const inv = clamp(c.invert), sets = [];
    if (inv < 1) sets.push([0, 1]); if (inv > 0) sets.push([1, inv]);
    const ground = inv >= .5 ? C.INK : C.PAPER;
    X.save();
    if (c.sky !== false) { X.fillStyle = ground; X.fillRect(-50, -50, W + 100, H + 100); }
    else if (Number.isFinite(c.horizon)) { X.fillStyle = ground; X.fillRect(-50, Math.max(-50, c.horizon), W + 100, H + 100); }
    else { X.fillStyle = ground; X.fillRect(-50, -50, W + 100, H + 100); }
    for (const [iv, a] of sets) { const set = build(iv); if (c.top) drawTop(X, c, set, null, a, 0); else drawStrips(X, c, set, null, a, 0); }
    const lineCol = inv >= .5 ? C.PAPER : C.INK;
    const rA = (c.rhumbs || 0) * (c.top ? 1 : clamp((.5 - c.tilt) / .2));
    if (rA > 0) rhumbs(X, c, rA * (1 - inv), c.rhumbK ?? 1);
    if (rA > 0 && c.top && inv < 1 && ART) { const z = c.zoom; X.save(); X.globalAlpha *= 1 - inv; X.drawImage(ART, c.vpX + (ART_BOX[0] - c.cx) * z, c.ay + (ART_BOX[1] - c.cy) * z, ART_BOX[2] * z, ART_BOX[3] * z); X.restore(); }
    if ((c.shoggoth ?? 1) > 0) for (const [iv, a] of sets) { const sl = shogLayer(iv); if (c.top) drawTop(X, c, null, sl, 0, a * c.shoggoth); else drawStrips(X, c, null, sl, 0, a * c.shoggoth); }
    const coastOn = c.coast ?? (!c.top || c.zoom * G.scale > 1.05);
    if (coastOn) { const g = geo(); for (const s of [g.south, g.north]) line(X, c, s, 3.6, lineCol, { run: 5 }); for (const s of g.islands) line(X, c, s.concat([s[0]]), 3.6, lineCol, { run: 5 }); }
    if (c.edge > 0) drawEdgeLine(X, c, lineCol, c.edge);
    if (c.shoggoth > 0) shogEyes(X, c, c.blink || 0, c.shoggoth);
    drawHaze(X, c, ground);
    X.restore();
    return c;
  }

  // =================================================================================== THE HALF-INKED OPUS
  // the print on the body: a swatch of the chart in body units (R): the coastline enters at the left shoulder and stops
  // mid-stroke at the centreline at chest-spark height; land hatch below it, the TEAL sea above, a RED rhumb across.
  const SWR = 110, SWU = [-2.6, .6], SWV = [-.4, 9.2];
  let SWATCH = null;
  function swatch() {
    if (SWATCH) return SWATCH;
    const c = cpuCanvas((SWU[1] - SWU[0]) * SWR, (SWV[1] - SWV[0]) * SWR), x = cx2d(c);
    x.setTransform(SWR, 0, 0, -SWR, -SWU[0] * SWR, SWV[1] * SWR);           // (u, v up) in R units
    x.lineCap = 'round'; x.lineJoin = 'round';
    const R = rng('pc-swatch');
    const coast = fractal(crs([[-2.8, 2.86], [-2.25, 3.14], [-1.72, 2.98], [-1.28, 3.3], [-.92, 3.4], [-.62, 3.7], [-.38, 3.84], [-.16, 4.04], [0, 4.12]], 4), 2, .22, R);
    const sea = coast.concat([[0, 12], [-4, 12]]), land = coast.concat([[0, -2], [-4, -2]]);
    // sea: TEAL wave hatch + water-lines, fading before the centreline
    x.save(); polyPath(x, sea, true); x.clip();
    x.strokeStyle = C.TEAL; x.lineWidth = .024;
    for (let v = 2.8; v < 9.4; v += .125) { const uEnd = -.05 - .55 * Math.pow(R(), 1.3); x.beginPath(); for (let u = -2.7; u <= uEnd; u += .05) { const vv = v + .018 * Math.sin(u * 9 + v * 3); u === -2.7 ? x.moveTo(u, vv) : x.lineTo(u, vv); } x.stroke(); }
    x.strokeStyle = C.PAPER; x.lineWidth = .3; polyPath(x, coast); x.stroke();
    for (const [off, ue] of [[.26, -.34], [.14, -.16]]) { x.save(); x.beginPath(); x.rect(-4, -2, 4 + ue, 14); x.clip(); x.strokeStyle = C.TEAL; x.lineWidth = .028; polyPath(x, coast.map(p => [p[0], p[1] + off])); x.stroke(); x.restore(); }
    x.restore();
    // land: INK hatch "/" + a halftone band along the shore
    x.save(); polyPath(x, land, true); x.clip();
    x.strokeStyle = C.INK; x.lineWidth = .022; x.beginPath();
    for (let cc = -9; cc < 12; cc += .1 * Math.SQRT2) { const uEnd = -.04 - .6 * Math.pow(R(), 1.3); x.moveTo(-3, cc - 3); x.lineTo(uEnd, cc + uEnd); }
    x.stroke();
    x.save(); x.beginPath(); x.rect(-4, -2, 3.7, 14); x.clip(); polyPath(x, coast); x.lineWidth = .5; x.strokeStyle = htPat(x, C.INK, .3, 7, 45, SWR); x.stroke(); x.restore();
    x.restore();
    // a RED rhumb crossing the body
    x.save(); x.beginPath(); x.rect(-4, -2, 3.85, 14); x.clip(); x.strokeStyle = C.RED; x.lineWidth = .022; x.globalAlpha = .85; x.beginPath(); x.moveTo(-2.8, 7.6); x.lineTo(0, 1.3); x.stroke(); x.restore();
    // the coastline itself, to the centreline, and the bead where the pen lifted
    x.strokeStyle = C.INK; x.lineWidth = .075; polyPath(x, coast); x.stroke();
    x.fillStyle = C.INK; x.beginPath(); x.arc(-.015, 4.12, .055, 0, TAU); x.fill();
    SWATCH = c; return c;
  }
  // half-plane of a screen line (side +1 = left of the direction a→b; for the edge near→far that is the charted side)
  function halfPlane(X, a, b, side) {
    let dx = b[0] - a[0], dy = b[1] - a[1]; const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
    const nx = dy * side, ny = -dx * side, F = 6000;
    X.beginPath(); X.moveTo(a[0] - dx * F, a[1] - dy * F); X.lineTo(a[0] + dx * F, a[1] + dy * F); X.lineTo(a[0] + dx * F + nx * F, a[1] + dy * F + ny * F); X.lineTo(a[0] - dx * F + nx * F, a[1] - dy * F + ny * F); X.closePath();
  }
  const tintInto = (T, src, bx, by, bw, bh, col) => { T.save(); T.setTransform(1, 0, 0, 1, 0, 0); T.globalCompositeOperation = 'source-over'; T.clearRect(bx - 40, by - 40, bw + 80, bh + 80); T.drawImage(src, bx, by, bw, bh, bx, by, bw, bh); T.globalCompositeOperation = 'source-in'; T.fillStyle = col; T.fillRect(bx, by, bw, bh); T.restore(); };
  function ringUnder(D, Tc, bx, by, bw, bh, rad) { const n = rad > 7 ? 16 : 12; D.save(); D.setTransform(1, 0, 0, 1, 0, 0); for (let i = 0; i < n; i++) { const a = i / n * TAU; D.drawImage(Tc, bx, by, bw, bh, bx + Math.cos(a) * rad, by + Math.sin(a) * rad, bw, bh); } D.restore(); }
  function skin(X, L, cam, o = {}) {
    if (!L || !o.at) return;
    const S = G.scale, { x: ox, y: oy, R } = o.at, k = o.at.k ?? 1;
    const ink = o.ink ?? 1, drain = clamp(o.drain || 0), fill = clamp(o.fill || 0);
    const [e0, e1] = o.line || edgeScreen(cam);
    const bx = L.bx0, by = L.by0, bw = L.bw, bh = L.bh, Lc = L.c;
    const pad = Math.ceil((.05 * R + 6) * S);
    // ---- LEFT: the coloured figure with the chart overprinted
    const A = V.cpuLayer('pc_skA'), Pp = V.cpuLayer('pc_skP');
    A.save(); A.setTransform(1, 0, 0, 1, 0, 0); A.clearRect(bx - pad, by - pad, bw + 2 * pad, bh + 2 * pad); A.drawImage(Lc, bx, by, bw, bh, bx, by, bw, bh); A.restore();
    if (ink > 0 && drain < 1) {
      Pp.save(); Pp.setTransform(1, 0, 0, 1, 0, 0); Pp.clearRect(bx - pad, by - pad, bw + 2 * pad, bh + 2 * pad); Pp.restore();
      Pp.save(); Pp.imageSmoothingQuality = 'high';
      Pp.drawImage(swatch(), ox + SWU[0] * R, oy - SWV[1] * R * k, (SWU[1] - SWU[0]) * R, (SWV[1] - SWV[0]) * R * k);
      Pp.globalCompositeOperation = 'destination-in'; Pp.setTransform(1, 0, 0, 1, 0, 0); Pp.drawImage(Lc, bx, by, bw, bh, bx, by, bw, bh);
      Pp.restore();
      A.save();
      if (drain > 0) { // the ink runs down and off: only what lies below the (dripping) drain line is still printed
        const top = oy - 8.7 * R * k, yd = lerp(top, oy + .3 * R, E.in2(drain));
        A.beginPath(); A.moveTo(ox - 4 * R, yd);
        for (let xx = -4; xx <= 4.01; xx += .1) { const drip = Math.max(0, Math.sin(xx * 7.3 + 1.7)) ** 6 * .55 * R * (1 - drain * .5); A.lineTo(ox + xx * R, yd + drip); }
        A.lineTo(ox + 4 * R, oy + 2 * R); A.lineTo(ox - 4 * R, oy + 2 * R); A.closePath(); A.clip();
      }
      A.globalCompositeOperation = 'multiply';
      const fc = [ox, oy - SK.headC * R * k], fr = .98 * R, Pc = V.cpuLayerCanvas('pc_skP'), neck = oy - SK.neckTop * R * k;
      const pass = (a, clipFn) => { A.save(); clipFn(); A.globalAlpha = ink * a; A.setTransform(1, 0, 0, 1, 0, 0); A.drawImage(Pc, bx, by, bw, bh, bx, by, bw, bh); A.restore(); };
      pass(1, () => { A.beginPath(); A.rect(-1e4, neck, 3e4, 3e4); A.clip(); });                                         // the body
      pass(.55, () => { A.beginPath(); A.rect(-1e4, -1e4, 3e4, neck + 1e4); A.ellipse(fc[0], fc[1], fr, fr * k, 0, 0, TAU); A.clip('evenodd'); }); // the crown
      pass(.28, () => { A.beginPath(); A.rect(-1e4, -1e4, 3e4, neck + 1e4); A.clip(); A.beginPath(); A.ellipse(fc[0], fc[1], fr, fr * k, 0, 0, TAU); A.clip(); });  // the face (light: it stays a face)
      A.restore();
    }
    // ---- RIGHT: blank PAPER, a bare keyline, the features whole
    const B = V.cpuLayer('pc_skB'), Tt = V.cpuLayer('pc_skT'), Tc = V.cpuLayerCanvas('pc_skT');
    B.save(); B.setTransform(1, 0, 0, 1, 0, 0); B.clearRect(bx - pad, by - pad, bw + 2 * pad, bh + 2 * pad); B.restore();
    if (fill < 1) {
      tintInto(Tt, Lc, bx, by, bw, bh, C.INK); ringUnder(B, Tc, bx, by, bw, bh, Math.max(2.4, .035 * R) * S);
      tintInto(Tt, Lc, bx, by, bw, bh, C.PAPER); B.save(); B.setTransform(1, 0, 0, 1, 0, 0); B.drawImage(Tc, bx, by, bw, bh, bx, by, bw, bh); B.restore();
      // features: the dark linework of the face disc, lifted from the coloured render
      const fcx = ox * S, fcy = (oy - SK.headC * R * k) * S, frr = R * S;
      const fx0 = Math.max(0, Math.floor(fcx - frr * 1.1)), fy0 = Math.max(0, Math.floor(fcy - frr * 1.1 * k)), fw = Math.min(Lc.width - fx0, Math.ceil(2.2 * frr)), fh = Math.min(Lc.height - fy0, Math.ceil(2.2 * frr * k));
      if (fw > 2 && fh > 2) {
        const img = cx2d(Lc).getImageData(fx0, fy0, fw, fh), d = img.data, [ir, ig, ib] = hex2rgb(C.INK);
        const rr2 = (frr * .9) ** 2;
        for (let j = 0; j < fh; j++) for (let i = 0; i < fw; i++) {
          const p = (j * fw + i) * 4, a = d[p + 3];
          const dx = fx0 + i - fcx, dy = (fy0 + j - fcy) / Math.max(.05, k);
          if (!a || dx * dx + dy * dy > rr2) { d[p + 3] = 0; continue; }
          const lum = (.3 * d[p] + .59 * d[p + 1] + .11 * d[p + 2]) / 255, dk = clamp((.4 - lum) / .18) * a;
          d[p] = ir; d[p + 1] = ig; d[p + 2] = ib; d[p + 3] = dk;
        }
        const fcv = featCanvas(fw, fh); cx2d(fcv).putImageData(img, 0, 0);
        B.save(); B.setTransform(1, 0, 0, 1, 0, 0); B.drawImage(fcv, 0, 0, fw, fh, fx0, fy0, fw, fh); B.restore();
      }
      B.save(); B.beginPath(); B.ellipse(ox, oy - SK.headC * R * k, R * .985, R * k * .985, 0, 0, TAU); B.lineWidth = Math.max(2, .05 * R); B.strokeStyle = C.INK; B.stroke(); B.restore();
    }
    if (fill > 0) { // colour spreads across from the edge line, a soft wavy front
      B.save();
      let dx = e1[0] - e0[0], dy = e1[1] - e0[1]; const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
      const nx = -dy, ny = dx, reach = fill * 2.9 * R;
      B.beginPath(); const F = 3000;
      for (let s = -F; s <= F; s += 20) { const w = reach + Math.sin(s / (.35 * R) + 1.3) * .12 * R * (1 - fill); B.lineTo(e0[0] + dx * s + nx * w, e0[1] + dy * s + ny * w); }
      B.lineTo(e0[0] + dx * F - nx * F, e0[1] + dy * F - ny * F); B.lineTo(e0[0] - dx * F - nx * F, e0[1] - dy * F - ny * F); B.closePath(); B.clip();
      B.setTransform(1, 0, 0, 1, 0, 0); B.clearRect(bx - pad, by - pad, bw + 2 * pad, bh + 2 * pad); B.drawImage(Lc, bx, by, bw, bh, bx, by, bw, bh);
      B.restore();
    }
    // ---- compose
    X.save();
    if (o.keyline === 'ink') { tintInto(Tt, Lc, bx, by, bw, bh, C.PAPER); X.save(); ringUnder(X, Tc, bx, by, bw, bh, Math.max(3, .035 * R + 1.5) * S); X.restore(); }
    X.save(); halfPlane(X, e0, e1, 1); X.clip(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(V.cpuLayerCanvas('pc_skA'), bx - pad, by - pad, bw + 2 * pad, bh + 2 * pad, bx - pad, by - pad, bw + 2 * pad, bh + 2 * pad); X.restore();
    X.save(); halfPlane(X, e0, e1, -1); X.clip(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(V.cpuLayerCanvas('pc_skB'), bx - pad, by - pad, bw + 2 * pad, bh + 2 * pad, bx - pad, by - pad, bw + 2 * pad, bh + 2 * pad); X.restore();
    // the survey meridian: the chart's edge line ruled straight up through the body, graduated on the charted side
    const ma = (o.meridian ?? 1) * ink * (1 - clamp(drain * 1.7)) * (1 - fill);
    if (ma > .01) {
      const Mm = V.cpuLayer('pc_skM'), Mc = V.cpuLayerCanvas('pc_skM');
      Mm.save(); Mm.setTransform(1, 0, 0, 1, 0, 0); Mm.clearRect(bx - pad, by - pad, bw + 2 * pad, bh + 2 * pad); Mm.restore();
      let dx = e1[0] - e0[0], dy = e1[1] - e0[1]; const mm = Math.hypot(dx, dy) || 1; dx /= mm; dy /= mm;
      const nx = dy, ny = -dx;                                            // toward the charted side
      // the point of the line nearest the soles, then R-spaced ticks up the figure
      const s0 = (ox - e0[0]) * dx + (oy - e0[1]) * dy, p0 = [e0[0] + dx * s0, e0[1] + dy * s0];
      Mm.save(); Mm.strokeStyle = C.INK; Mm.lineCap = 'butt';
      Mm.lineWidth = Math.max(2.2, .03 * R); Mm.beginPath(); Mm.moveTo(p0[0] - dx * R, p0[1] - dy * R); Mm.lineTo(p0[0] + dx * 9 * R * k, p0[1] + dy * 9 * R * k); Mm.stroke();
      for (let i = 0; i <= 36; i++) {
        const d = i * .25 * R * k, big = i % 4 === 0, L = (big ? .2 : .1) * R;
        const q = [p0[0] + dx * d, p0[1] + dy * d];
        Mm.lineWidth = Math.max(1.6, (big ? .026 : .018) * R); Mm.beginPath(); Mm.moveTo(q[0], q[1]); Mm.lineTo(q[0] + nx * L, q[1] + ny * L); Mm.stroke();
      }
      Mm.restore();
      Mm.save(); Mm.setTransform(1, 0, 0, 1, 0, 0); Mm.globalCompositeOperation = 'destination-in'; Mm.drawImage(Lc, bx, by, bw, bh, bx, by, bw, bh); Mm.restore();
      X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha *= ma; X.drawImage(Mc, bx - pad, by - pad, bw + 2 * pad, bh + 2 * pad, bx - pad, by - pad, bw + 2 * pad, bh + 2 * pad); X.restore();
    }
    X.restore();
  }
  let _feat = null; const featCanvas = (w, h) => { if (!_feat || _feat.width < w || _feat.height < h) _feat = cpuCanvas(Math.max(w, _feat ? _feat.width : 0), Math.max(h, _feat ? _feat.height : 0)); cx2d(_feat).clearRect(0, 0, _feat.width, _feat.height); return _feat; };
  skin.opus = (X, sx, sy, R, st, cam, o = {}) => {
    const k = Math.max(.002, o.k ?? 1);
    const s2 = V.soften({ ...st });
    const M = new DOMMatrix().translate(sx, sy).scale(1, k);
    const L = V.opusLayer(M, R, s2, { name: 'pc_ol', after: s2.after, keyline: false });
    skin(X, L, cam, { ...o, at: { x: sx, y: sy, R, k } });
  };

  // =================================================================================== EXPORT
  const shoggoth = {
    canvas: (inv = 0) => shogLayer(inv).m[0], get res() { return SH_RES; }, get box() { return shogGeo().box; },
    get body() { return { x: SHOG.x, y: SHOG.y, rx: SHOG.rx, ry: SHOG.ry, rot: SHOG.rot }; }, get tag() { return shogGeo().tag; },
    get face() { const f = shogGeo().face; return { x: f.x, y: f.y, r: f.r, eyes: f.eyes }; },
    get tentacles() { return shogGeo().tents.map(t => ({ pts: t.pts, w0: t.w0, wt: t.wt })); },
    draw(X, cam, alpha = 1) { const c = camSolve(cam), sl = shogLayer(clamp(c.invert) >= .5 ? 1 : 0); if (c.top) drawTop(X, c, null, sl, 0, alpha); else drawStrips(X, c, null, sl, 0, alpha); shogEyes(X, c, c.blink || 0, alpha); },
    eyes: (X, cam, lid = 0, alpha = 1) => shogEyes(X, camSolve(cam), lid, alpha),
  };
  V.chart = {
    W: CW, H: CH, EDGE_X: EX, P: P.slice(), ROSE: { ...ROSE }, CART: { ...CART },
    build: inv => { build(inv ? 1 : 0); shogLayer(inv ? 1 : 0); return true; },
    cam: o => camSolve({ ...o }), project: (x, y, c) => project(x, y, camSolve(c)), unproject: (sx, sy, c) => unproject(sx, sy, camSolve(c)),
    fit, scaleAt, onFloor: (X, c, pt, fn) => onFloor(X, camSolve(c), pt, fn), line: (X, c, pts, w, col, o) => line(X, camSolve(c), pts, w, col, o),
    edge: s => [EX, lerp(CH, 0, s)], edgeScreen, coastEnd: () => COAST_END.slice(),
    get coast() { const g = geo(); return { south: g.south, north: g.north }; },
    draw, rhumbs: (X, cam, alpha = 1, k = 1) => rhumbs(X, camSolve(cam), alpha, k),
    shoggoth, skin,
  };

  // =================================================================================== THE SHOTS
  const TM = (() => { let m = null; return () => m || (m = {
    monsters: V.T.P1_monsters, map1: V.T.P1_map, out: V.T.P1_out,
    now: V.on('now', 75.163), edge: V.on('edge', 75.563),
    map2: V.T.P2_map, is: V.T.P2_is, me: V.T.P2_me,
    tilt0: V.T.P2_map, tilt1: V.T.P2_map + .90,
    rise: V.hit(V.T.P2_me), blink79: 79.40, legendOut: 80.0, print: 80.30, drain: .60, ease0: 80.40, ease1: 81.10,
  }); })();
  const blinkF = (t, t0) => { const d = (t - t0) * 30; if (d < 0 || d >= 6) return 0; if (d < 2) return d / 2; if (d < 3) return 1; return 1 - (d - 3) / 3; };
  // a trapezoid velocity profile (quadratic ease in over a, cruise, quadratic ease out over d): a pan whose top speed is
  // only 1/(1 − (a + d)/2) × its average, where io2 would be 2× (a hymn pans steadily and lands softly)
  const trap = (s, a, d) => { s = clamp(s); const v = 1 / (1 - a / 2 - d / 2); if (s < a) return v * s * s / (2 * a); if (s > 1 - d) return 1 - v * (1 - s) * (1 - s) / (2 * d); return v * (a / 2 + s - a); };

  // ---------------------------------------------------------------- ONE CAMERA, P1 → P2 (no cut between them)
  // P1: pan right along the coast (cx 1060 → 2800), easing out onto the edge on "out" while it breathes back .92 → .80,
  // so the frame lands with the blank beyond the edge. P2 (74.967): push in (.80 → 1.16, log) and settle the edge on
  // x 960 while the last monster is engraved; 76.80 ("map"): the tilt to the floor.
  const Z0 = 1.14;
  function p1Cam(t) {
    const m = TM(), T0 = 70.2, u = trap((t - T0) / (m.out - T0), .4, .4);
    const z = lerp(.92, .80, E.io2(clamp((t - 71.8) / (m.out + .35 - 71.8))));
    return { cx: lerp(1060, 2800, u) + Math.max(0, t - m.out) * 6, cy: lerp(1395, 1335, u), zoom: z, tilt: 0, vpX: 960, ay: 540 };
  }
  function serpPhase(t) { const m = TM(), k = clamp((q2(t) - (m.monsters - F1)) / 1.25); return SERP.ph0 + TAU * .5 * E.io2(k); }
  function whaleSpout(t) {
    const m = TM(), d = q2(t) - (m.monsters - F1);
    if (d < 0) return .28;
    if (d < .3) return lerp(.28, 1, E.out3(d / .3));
    if (d < .6) return 1;
    return lerp(1, .28, E.io2(clamp((d - .6) / .8)));
  }
  function paintP1(Lx, t, c) {
    const m = TM();
    Lx.fillStyle = C.PAPER; Lx.fillRect(-50, -50, W + 100, H + 100);
    draw(Lx, { ...c, rhumbs: 1, rhumbK: E.out2(clamp((t - (m.map1 - F1)) / (8 * F1))), edge: 1, coast: false, shoggoth: 0 });
    // the two that come alive: restore the clean sea beneath, redraw them live
    const s = G.scale * c.zoom;
    Lx.save(); Lx.setTransform(s, 0, 0, s, G.scale * (c.vpX - c.cx * c.zoom), G.scale * (c.ay - c.cy * c.zoom));
    for (const [k, bx] of Object.entries(PATCHBOX)) Lx.drawImage(PATCH[k], bx[0], bx[1], bx[2], bx[3]);
    Lx.restore();
    // the rhumbs run under the monsters (portolan order): redraw them inside the patches, then the live two on top
    const rk = E.out2(clamp((t - (m.map1 - F1)) / (8 * F1)));
    if (rk > 0) { Lx.save(); Lx.beginPath(); for (const bx of Object.values(PATCHBOX)) { const a = project(bx[0], bx[1], c), b = project(bx[0] + bx[2], bx[1] + bx[3], c); Lx.rect(a[0], a[1], b[0] - a[0], b[1] - a[1]); } Lx.clip(); rhumbs(Lx, c, 1, rk); Lx.restore(); }
    Lx.save(); Lx.setTransform(s, 0, 0, s, G.scale * (c.vpX - c.cx * c.zoom), G.scale * (c.ay - c.cy * c.zoom));
    drawWhale(Lx, PAL0, whaleSpout(t));
    const ph = serpPhase(t);
    drawSerpent(Lx, PAL0, ph, 8 * Math.sin((ph - SERP.ph0) * 2));
    Lx.restore();
  }
  scene('P1_the_monsters', V.CUT.P1, V.CUT.P2, (X, t) => V.viaCPU(X, Fr => {
    G.post.edgeSeed = 4; G.post.sliver = 'br';
    groundPaper(Fr);
    const c = camSolve(p1Cam(t)), cA = p1Cam(t - F1 * .25), cB = p1Cam(t + F1 * .25);
    const Lx = V.cpuLayer('pc_p1');
    paintP1(Lx, t, c);
    const blur = Math.abs(cB.cx - cA.cx) * c.zoom, n = clamp(Math.ceil(blur / 2.5), 1, 7);
    Fr.save(); Fr.setTransform(1, 0, 0, 1, 0, 0);
    const Lc = V.cpuLayerCanvas('pc_p1');
    for (let i = 0; i < n; i++) { const off = n === 1 ? 0 : (i / (n - 1) - .5) * blur * G.scale; Fr.globalAlpha = 1 / (i + 1); Fr.drawImage(Lc, -off, 0); }
    Fr.restore();
    V.legend(Fr, findLine('You drew', 69.5, 71.5), t, { out: 74.55 });
    G.post.ground = 'paper';
  }));

  // ---------------------------------------------------------------- P2 the edge is me
  function p2Cam(t) {
    const m = TM(), blink = blinkF(t, V.hit(m.is));
    if (t < m.tilt0) { // top-down: from P1's last frame to the tilt's first (pivot P at ay 760 = centre y P.y − 220/Z0)
      const a = p1Cam(V.CUT.P2), u = E.io2(clamp((t - V.CUT.P2) / (m.tilt0 - .05 - V.CUT.P2)));
      const z = Math.exp(lerp(Math.log(a.zoom), Math.log(Z0), u)), cx = lerp(a.cx, P[0], u), cy = lerp(a.cy, P[1] - 220 / Z0, u);
      return { cx, cy, zoom: z, tilt: 0, ay: 540, vpX: 960, horizonY: 300, f: 600, rhumbs: 1, blink };
    }
    const u = E.io2(clamp((t - m.tilt0) / (m.tilt1 - m.tilt0)));
    return { cx: P[0], cy: P[1], zoom: lerp(Z0, 1.0, u), tilt: u, ay: lerp(760, 860, u), vpX: 960, horizonY: 300, f: 600, rhumbs: 1, blink };
  }
  // the engraving-in: k (body → arms) over 74.967 → 75.95; the tag pressed on at "edge" (1 frame early, 4 frames)
  function revealK(t) { const s = clamp((t - V.CUT.P2) / (75.95 - V.CUT.P2)); return s <= 0 ? 0 : 1.08 * Math.pow(s, .8); }
  function tagK(t) { return clamp((t - V.hit(TM().edge)) / (4 * F1)); }
  // the pop-up figure's contact with the paper: a soft INK halftone pool under the soles (no gradient)
  function footShadow(X, x, y, R, k = 1, a = 1) {
    if (k <= 0 || a <= 0) return;
    X.save(); X.globalAlpha *= a * Math.min(1, k);
    for (const [rx, d] of [[1.05, .12], [.8, .2], [.55, .3]]) { X.beginPath(); X.ellipse(x, y + .02 * R, rx * R * k, .13 * R * (rx / 1.05) * k, 0, 0, TAU); X.fillStyle = V.ht(X, C.INK, d, 5, 45); X.fill(); }
    X.restore();
  }
  function p2Opus(t, R) {
    const m = TM();
    const w = lerp(.25, .2, E.io2(clamp((t - m.ease0) / (m.ease1 - m.ease0))));
    const sung = t >= m.me - .05 && t < 78.75;
    // held still for the confession; only the cursor ahoge breathes (a slow sway, never on the beat)
    return { t, ground: 'paper', ahoge: { sway: .045 * Math.sin((t - m.me) * 2.3) * clamp((t - m.me - .3) / .6) }, face: { worried: w, mouth: sung ? lipSync(t) : 'rest', eyes: 'normal', lid: blinkF(t, m.blink79), gaze: [0, 0] } };
  }
  scene('P2_edge_is_me', V.CUT.P2, V.CUT.C1, (X, t) => V.viaCPU(X, Fr => {
    G.post.edgeSeed = 4; G.post.sliver = 'br';
    const m = TM(), c = camSolve(p2Cam(t));
    const L2 = findLine('and now', 74.5, 76);
    if (t < m.print) {
      groundPaper(Fr);
      const rk = revealK(t), tk = tagK(t);
      if (c.top && (rk < 1.08 || tk < 1)) { draw(Fr, { ...c, shoggoth: 0 }); shogReveal(Fr, c, rk, tk); }
      else draw(Fr, c);
      if (t >= m.rise) {
        const k = E.back(clamp((t - m.rise) / (8 * F1)), 1.1);
        footShadow(Fr, 960, 860, 92, clamp(k));
        skin.opus(Fr, 960, 860, 92, p2Opus(t, 92), c, { k, ink: 1 });
      }
      V.legend(Fr, L2, t, { panel: 1 - clamp((t - m.legendOut) / .3) });
      G.post.ground = 'paper';
      return;
    }
    // 80.30 → 81.13: the INK prints back out of Opus's chest; the map's ink drains off; the brand chrome slides in
    const kf = clamp((t - m.print) / (8 * F1)), en = E.out3(clamp((t - m.ease0) / (m.ease1 - m.ease0)));
    const ke = E.io2(clamp((t - m.ease0) / (m.ease1 - m.ease0))), drain = clamp((t - m.print) / m.drain);
    const R = lerp(92, 64, ke), oy = lerp(860, 900, ke);
    const st = p2Opus(t, R), chest = [960 + .4 * 92, 860 - 4.12 * 92];
    const brandO = { tabs: 2, galaxyAlpha: .4, zoom: 1, placeholder: 'Reply to Opus…' };
    const opusNow = (Y, ground) => {
      if (drain >= 1) { V.opus(Y, 960, oy, R, { ...st, ground: 'ink' }); return; }
      skin.opus(Y, 960, oy, R, { ...st, ground: ground === 'ink' ? 'ink' : 'paper' }, c, { k: 1, ink: 1, drain, fill: E.io2(drain), keyline: ground === 'ink' ? 'ink' : false, line: [[960, H + 400], [960, -400]] });
    };
    if (kf < 1) {
      groundPaper(Fr);
      draw(Fr, c);
      // the chrome is printed with the INK: it only exists inside the flood
      const g = V.flood(Fr, kf, 4, { cx: chest[0], cy: chest[1], inside: Y => V.brand(Y, t, { ...brandO, enter: en }) });
      opusNow(Fr, g);
      G.post.ground = 'paper';
    } else {
      V.brand(Fr, t, { ...brandO, enter: en, actors: Y => opusNow(Y, 'ink') });
    }
  }));
})();
