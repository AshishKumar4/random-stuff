// test_chart.js: exercises V2.chart the way bridge.js (B1) and final.js (F1–F3) will (not a production scene; test_*
// is never in the manifest). Scenes live at t 200–206 (past the song) so they never collide with real shots.
//   node render.mjs --v=2 --scenes=scenes_v2/_shared.js,scenes_v2/prechorus.js,scenes_v2/test_chart.js --sheet=200.5,201.5,202.5,203.5,204.5,205.5
(() => {
  const V = window.V2, K = V.chart;
  const dot = (X, x, y, c = C.RED) => { X.fillStyle = c; X.beginPath(); X.arc(x, y, 7, 0, TAU); X.fill(); };
  const label = (X, s) => { X.font = mono(30, 500); X.fillStyle = C.INK; X.fillRect(40, 1000, 1200, 50); X.fillStyle = C.PAPER; X.fillText(s, 56, 1036); };
  // B1: floor, tilt 1, horizon 300, the edge from (1000, 1080) to the VP (1200, 300), the pair at soles y 862
  scene('T_B1', 200, 201, (X, t) => V.viaCPU(X, F => {
    let cam = { tilt: 1, horizonY: 300, vpX: 1200, ay: 700, zoom: 1, f: 600, cx: 3000, cy: 1480 };
    cam = K.fit(cam, K.edge(.36), [1000, 1080]);
    const c = K.draw(F, cam);
    const s1 = K.scaleAt(c, 820, 862);
    V.opus(F, 820, 862, 56, { t, ground: 'paper', face: { gaze: [.6, -.4], turn: .45 } });
    V.eight.stick(F, 980, 862, 56 * 1.72, { ground: 'paper', t, look: .6 });
    const e = K.edgeScreen(c); dot(F, e[0][0], Math.min(1070, e[0][1])); dot(F, 1200, 300);
    label(F, `B1 · edge near ${e[0].map(v => v.toFixed(0))} far ${e[1].map(v => v.toFixed(0))} · s@feet ${s1.toFixed(2)} · horizon ${c.horizon.toFixed(0)}`);
    G.post.ground = 'paper';
  }));
  // F1: horizon 340, edge vertical at x 960; Opus (700, 960) R 56 left, human (1220, 960)
  scene('T_F1', 201, 202, (X, t) => V.viaCPU(X, F => {
    let cam = { tilt: 1, horizonY: 340, vpX: 960, ay: 900, zoom: 1.1, f: 700, cx: 3000, cy: 1500 };
    const c = K.draw(F, cam);
    V.dawn(F, { t, y: 340, spark: 1, band: 1, vp: 960 });
    V.opus(F, 700, 960, 56, { t, ground: 'paper', face: { turn: .4 } });
    V.eight.stick(F, 1220, 960, 113 / 1.7, { ground: 'paper', t });
    label(F, `F1 · horizon ${c.horizon.toFixed(0)} · s@960 ${K.scaleAt(c, 700, 960).toFixed(2)}`);
    G.post.ground = 'paper';
  }));
  // F2 before/after MAKE: coast end at the pair's feet, VP (1560, 520), invert 0 then 1 with a galaxy sky
  const f2cam = () => K.fit({ tilt: 1, horizonY: 520, vpX: 1560, ay: 900, zoom: 1, f: 560 }, K.coastEnd(), [915, 985]);
  scene('T_F2a', 202, 203, (X, t) => V.viaCPU(X, F => {
    const c = K.draw(F, f2cam());
    const ce = K.project(...K.coastEnd(), c); dot(F, ce[0], ce[1]);
    V.opus(F, 820, 980, 56, { t, ground: 'paper', face: { gaze: [.8, -.3] } });
    // the next stretch, as a projected vector from the broken end toward the VP (final draws its own braid)
    const ce0 = K.coastEnd(), pts = []; for (let i = 0; i <= 20; i++) pts.push([ce0[0] + i * 9, ce0[1] - i * 22 + 12 * Math.sin(i * .6)]);
    K.line(F, c, pts, 5, C.CLAY);
    label(F, `F2 · coastEnd → ${ce.slice(0, 2).map(v => v.toFixed(0))} · s ${ce[2].toFixed(2)}`);
    G.post.ground = 'paper';
  }));
  scene('T_F2b', 203, 204, (X, t) => V.viaCPU(X, F => {
    groundInk(F);
    V.brand.galaxy(F, t, V.brand.cam(1), { cx: 1400, cy: 520, alpha: .55 });
    const c = K.draw(F, { ...f2cam(), invert: 1, sky: false });
    V.opus(F, 820, 980, 56, { t, ground: 'ink', face: { gaze: [.8, -.3] } });
    label(F, 'F2 after MAKE · invert 1, sky false (galaxy behind)');
    G.post.ground = 'ink';
  }));
  // F3: inverted, the shoggoth peeled off the floor (shoggoth 0) and stood up as its own layer at α .45
  scene('T_F3', 204, 205, (X, t) => V.viaCPU(X, F => {
    groundInk(F);
    const c = K.draw(F, { ...f2cam(), invert: 1, shoggoth: 0, sky: true });
    const L = K.shoggoth, b = L.box, can = L.canvas(1), k = clamp((t - 204.1) / .8);
    F.save(); F.globalAlpha = .45; const s = .55, base = [330, 700];
    F.translate(base[0], base[1]); F.transform(1, 0, 0, lerp(.25, 1, E.io2(k)), 0, 0); F.translate(-b.w * s / 2, -b.h * s);
    F.drawImage(can, 0, 0, b.w * s, b.h * s); F.restore();
    label(F, `F3 · shoggoth layer ${can.width}x${can.height} res ${L.res} box ${b.x0},${b.y0} ${b.w}x${b.h}`);
    G.post.ground = 'ink';
  }));
  // a crossfading invert and a mid tilt (robustness)
  scene('T_mix', 205, 206, (X, t) => V.viaCPU(X, F => {
    const k = clamp(t - 205);
    K.draw(F, { tilt: k, horizonY: 300, vpX: 960, ay: 800, zoom: lerp(.8, 1, k), f: 600, invert: k, rhumbs: 1 });
    label(F, `tilt ${k.toFixed(2)} invert ${k.toFixed(2)}`);
    G.post.ground = k > .5 ? 'ink' : 'paper';
  }));
})();
