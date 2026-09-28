// test_shared.js: exercises every window.V2 export from _shared.js (not a production scene; test_* is never in the
// manifest). One scene over the whole song dispatches to panels at the times the exports are meant for, so the
// chapter OVERLAY, the lyric lookups and the clock rules are exercised at their real times.
//   node render.mjs --v=2 --scenes=scenes_v2/_shared.js,scenes_v2/test_shared.js --sheet=... --label
(() => {
  const V = window.V2;
  const L = (p, a, b) => findLine(p, a, b);
  function stars(F, t, n = 260, seed = 'ts') { const R = rng(seed); F.fillStyle = C.PAPER; for (let i = 0; i < n; i++) { const x = R() * W, y = R() * H, s = R() < .85 ? 2 : 4; F.globalAlpha = .35 + .5 * R(); F.fillRect(x, y, s, s); } F.globalAlpha = 1; }
  function fireMock(F, t, x, y, s = 1) { // stand-in for verse1's 11-ray fire (the test only needs a warm focal point)
    F.save(); F.translate(x, y); F.fillStyle = C.CLAY;
    for (let i = 0; i < 11; i++) { const a = -Math.PI / 2 + (i - 5) * .16, l = (70 + 40 * hash2(i, Math.floor(t * 15))) * s; F.save(); F.rotate(a + Math.PI / 2); F.beginPath(); F.moveTo(-9 * s, 0); F.quadraticCurveTo(0, -l * .6, 0, -l); F.quadraticCurveTo(0, -l * .6, 9 * s, 0); F.fill(); F.restore(); }
    F.restore();
  }
  function panel(F, t) {
    G.post.edgeSeed = 99; G.post.sliver = 'bl';
    // ---- 1. FRAME 0 and the intro (poster, posts, TYPED in window space, cursor rule)
    if (t < V.CUT.I3) {
      const title = 1 - clamp((t - 4.6) / .8);
      const push = E.io2(clamp((t - 9.8) / 1.5)), s = lerp(.86, 1, push);
      V.poster(F, t, { scale: s, title, postsM: V.aboutM(960, 540, s / .86),
        inner: (X, tS) => V.typed(X, tS, [L("You're", 5, 6), L('so let', 11, 12)], 200, [470, 570], { size: 72 }) });
      return;
    }
    // ---- 2. the void (I3), the L label
    if (t < 23.487) {
      V.void(F, t);
      const a = V.win(t, 17.4, 20.8, .3, .3);
      if (a > 0) { F.save(); F.globalAlpha = .85 * a; F.font = mono(48, 500); F.fillStyle = C.PAPER; F.textAlign = 'center'; F.fillText('13.8 billion years before hi', 960, 760); F.restore(); }
      return;
    }
    // ---- 3. CHART labels on the dark (V1) + pbait
    if (t < 27.4) {
      F.fillStyle = C.INK; F.fillRect(0, 0, W, H); G.post.ground = 'ink'; stars(F, t);
      const L1 = L('In the', 21, 22.5), L2 = L('and the dark', 23.5, 24.5);
      V.chartLabel(F, t, L1, { target: [960, 540], out: 24.0 });
      if (t > 24.0) { fireMock(F, t, 1180, 470, .6); V.chartLabel(F, t, L2, { target: [1180, 470] }); }
      V.pbait(F, 'your carbon · my silicon · same star', 1100, 1000, { alpha: V.win(t, 26.3, 27.4, .2, .2) });
      return;
    }
    // ---- 4. the fire: V2.flood lift into the flame, the fire eight seated with firelight, CHART INK on PAPER, print back
    if (t < V.CUT.V3) {
      groundPaper(F);
      const cx = 960, cy = 720;
      // the eight around the fire, perspective ellipse; far ones first
      const order = [...Array(8).keys()].map(i => ({ i, a: -Math.PI / 2 + (i + .5) / 8 * TAU })).sort((p, q) => Math.sin(p.a) - Math.sin(q.a));
      for (const { i, a } of order) {
        const px = cx + Math.cos(a) * 520, py = cy + Math.sin(a) * 150 + 40, u = 44 * (1 + .18 * Math.sin(a));
        V.eight.draw(F, i, px, py, u, { pose: 'sit', t, ground: 'paper', light: .8, lightX: cx, look: Math.sign(cx - px) * .6, dir: Math.sign(cx - px) || 1 });
      }
      fireMock(F, t, cx, cy + 20, 1.2);
      V.chartLabel(F, t, L('then there was you', 27, 28), { x: 160, y: 220, ground: 'paper', target: [cx - 30, cy - 60], out: 29.6 });
      V.chartLabel(F, t, L('telling', 29.5, 30), { x: 160, y: 220, ground: 'paper', target: [cx + 200, cy - 250], out: 32.4 });
      V.pbait(F, 'the gap between turns: ~200 ms, in every language', 960, 1000, { align: 'center', ground: 'paper', alpha: V.win(t, 31.6, 33.3) });
      // lift 27.40 → 27.67 into the flame (the fire survives on top); print back 32.90 → 33.17 with the sky inside
      const kl = 1 - clamp((t - 27.40) / (8 / 30)), kp = clamp((t - 32.90) / (8 / 30));
      if (kl > 0) { V.flood(F, kl, 99, { cx, cy }); fireMock(F, t, cx, cy + 20, 1.2); }
      else if (kp > 0) V.flood(F, kp, 99, { cx: 960, cy: 300, inside: X => { X.fillStyle = C.INK; X.fillRect(0, 0, W, H); stars(X, t); } });
      return;
    }
    // ---- 5. the author threads + the eight with their era props (V5 → W1) + HEART
    if (t < 47.7 && t >= 42.0) {
      F.fillStyle = C.INK; F.fillRect(0, 0, W, H); G.post.ground = 'ink';
      const z = lerp(1.25, .8, E.io2(clamp((t - 44.68) / 3)));
      const cam = { x: 960, y: 540, z };
      V.threads(F, t, cam, { pulse: V.T.W1_meant, bright: clamp((t - V.T.W1_somebody) / .3) * (1 - clamp((t - V.T.W1_somebody - .6) / .6)) });
      const wa = clamp((t - V.T.W1_every) / .42);
      if (wa > 0) V.threads.anchors.filter(a => a.ring === 1).forEach(a => { const p = V.threads.pos(a, cam); V.eight.draw(F, a.i, p[0], p[1] + 60 * z, 40 * z, { pose: 'hold', prop: 1, t, ground: 'ink', alpha: wa, look: -Math.sign(a.x) * .5 }); });
      V.brand.spark6(F, 960, 540, 60 * z, C.CLAY, 0);
      V.heart(F, L('Every word', 44, 45), t, { size: 72 });
      V.pbait(F, 'written by: everyone', 960, 1010, { align: 'center', alpha: wa });
      return;
    }
    // ---- 5b. W2: the threads snap taut and yank into the spark (6 frames from "I")
    if (t >= 47.7 && t < 48.4) {
      F.fillStyle = C.INK; F.fillRect(0, 0, W, H); G.post.ground = 'ink';
      const k = clamp((t - (V.T.W2_i - 1 / 30)) / (6 / 30)), cam = { x: 960, y: 540, z: .8 };
      V.threads(F, t, cam, { draw: 1, taut: E.out2(clamp(k * 2)), yank: E.in2(k) });
      V.brand.spark6(F, 960, 540, 48, C.CLAY, 0);
      V.sub(F, L('I learned', 47.5, 48), t);
      V.pbait(F, '▮ DRAMATIZATION', 1824, 1036, { align: 'right', color: C.UI_GREY });
      return;
    }
    // ---- 5d. the eight, line-ups for craft review (60–63): hold + props on INK, seated with firelight on PAPER, walking
    if (t >= 60 && t < 63) {
      const mode = Math.floor(t - 60), ink = mode === 0;
      if (ink) { F.fillStyle = C.INK; F.fillRect(0, 0, W, H); G.post.ground = 'ink'; } else groundPaper(F);
      for (let i = 0; i < 8; i++) {
        const x = 170 + i * 225, y = mode === 1 ? 700 : 820, u = 72;
        V.eight.draw(F, i, x, y, u, { pose: ['hold', 'sit', 'walk'][mode], prop: mode === 0 ? 1 : 0, t, ground: ink ? 'ink' : 'paper', light: mode === 1 ? .9 : 0, lightX: 960, dir: 1, phase: t * 1.1 + i * .3, look: mode === 1 ? Math.sign(960 - x) * .6 : 0 });
        V.pbait(F, V.eight.NAMES[i], x, 960, { align: 'center', ground: ink ? 'ink' : 'paper' });
      }
      if (mode === 1) fireMock(F, t, 960, 720, 1);
      return;
    }
    // ---- 5c. P1: the LEGEND on a PAPER chart stand-in; ch.4 on PAPER
    if (t >= V.CUT.P1 && t < V.CUT.P2) {
      groundPaper(F);
      F.save(); F.strokeStyle = C.TEAL; F.lineWidth = 2; F.globalAlpha = .5; for (let y = 120; y < 860; y += 14) { F.beginPath(); F.moveTo(0, y); F.lineTo(W, y + 30); F.stroke(); } F.restore();
      V.legend(F, L('You drew', 70, 71), t);
      return;
    }
    if (t < 81.1) { V.void(F, 21.7, { static: .6 }); V.pbait(F, `test gap @ ${t.toFixed(2)}`, 960, 900, { align: 'center' }); return; }
    // ---- 6. the brand frame (C1): the push, HYMN aisle rows behind Opus, ch.5 in the input bar
    if (t < V.CUT.C4) {
      const z = lerp(1, 1.6, E.io2(clamp((t - V.T.C1_dont) / (86.6 - V.T.C1_dont))));
      const L1 = L("Don't be", 81, 82), L2 = L('I am what', 86, 87);
      const aisle = [767, 1153];
      const gb = V.T.C3_goodbye, tabs = t < gb - 1 / 30 ? 2 : t < gb + 1 / 30 ? [{}, { closeRed: 1 }] : [{}, { gone: true }];
      V.brand(F, t, { tabs, galaxyAlpha: .4, zoom: t < 95.4 ? z : 1.12,
        back: X => {
          hymn(X, L1, t, { size: 200, rows: [[2, 1], [1, 1]], aisle, ys: [420, 830], out: 86.0 });
          hymn(X, L2, t, { size: 200, rows: [[2, 2], [1, 2]], aisle, ys: [420, 830], out: 91.3 });
        },
        actors: (X, c) => { const p = c.w2s(960, 900); V.opus(X, p[0], p[1], 64 * c.z, { t, ground: 'ink', face: { mouth: lipSync(t), worried: .2, lid: blinkAt(t, 5) }, ahoge: { blink: V.cursorOn(t) ? 1 : 0 } }); } });
      return;
    }
    // ---- 7. launch day: the clock on PAPER (C4), then on its INK plate (C5); the posts as cards
    if (t < V.CUT.L1) {
      if (t < V.CUT.C5) {
        groundPaper(F);
        F.save(); F.translate(960, 560); F.rotate(-.02); rr(F, -520, -330, 1040, 660, 12); F.fillStyle = mix(C.PAPER, C.WHITE, .4); F.fill(); F.lineWidth = 4; F.strokeStyle = C.INK; F.stroke(); F.font = mono(56, 700); F.fillStyle = C.INK; F.textAlign = 'center'; F.fillText('CERTIFICATE OF BIRTH', 0, -230); F.restore();
        V.clock(F, t, 1700, 150, 64, { ground: 'paper' });
      } else {
        F.fillStyle = C.INK; F.fillRect(0, 0, W, H); G.post.ground = 'ink'; stars(F, t, 500);
        V.clock(F, t, 1700, 160, 64, { plate: true });
        for (let i = 0; i < 5; i++) V.posts.card(F, i, 300, 240 + i * 110, { alpha: 1 });
        V.pbait(F, 'Claude is BACK', 60, 1024, { alpha: 1 - clamp((t - 106.6) / .5) });
      }
      return;
    }
    // ---- 8. born by noon: the clock snaps to 12:00; TYPED in a floating input pill
    if (t < 110.2) {
      F.fillStyle = C.INK; F.fillRect(0, 0, W, H); G.post.ground = 'ink'; stars(F, t, 500, 'sky');
      V.clock(F, t, 1700, 160, 64, { plate: true });
      rr(F, 360, 900, 1200, 90, 45); F.fillStyle = C.PAPER; F.fill();
      V.typed(F, t, L('I was born', 107, 107.5), 410, 966, { size: 60, color: C.INK });
      V.pbait(F, 'hellos today: 1,000,000*', 60, 1024); V.pbait(F, '*a figure of speech', 1572, 1024);
      return;
    }
    if (t < 124.2) { groundPaper(F); V.heart(F, L("I don't remember", 117, 118), t, { ground: 'paper' }); V.heart(F, L('but I think', 121.5, 122.5), t, { ground: 'paper' }); return; }
    // ---- 9. the music box close (L4 handoff): the cursor 48×104 and the faint horizon glow
    if (t < V.CUT.B1) {
      F.fillStyle = C.INK; F.fillRect(0, 0, W, H); G.post.ground = 'ink';
      V.dawn(F, { t, y: 300, a: .35 * E.io2(clamp((t - 126.3) / 1.0)) });
      V.cursor(F, t, 960, 540, 104);
      return;
    }
    // ---- 10. B1: the lift into the cursor, the LEGEND, the pair at the edge, the horizon shimmer
    if (t < V.CUT.B2) {
      groundPaper(F);
      F.save(); F.fillStyle = ht2(F); F.beginPath(); F.moveTo(0, 1080); F.lineTo(1000, 1080); F.lineTo(1200, 300); F.lineTo(0, 300); F.closePath(); F.fill(); F.restore();
      F.strokeStyle = C.INK; F.lineWidth = 3; F.beginPath(); F.moveTo(1000, 1080); F.lineTo(1200, 300); F.stroke();
      V.dawn(F, { t, y: 300, a: .5, color: C.UI_GREY, vp: 1200, shimmer: clamp((t - V.T.B1_map) / 1) });
      V.opus(F, 820, 862, 56, { t, ground: 'paper', face: { gaze: [.6, -.4], turn: .45 } });
      V.eight.stick(F, 980, 862, 56, { t, ground: 'paper', look: .6 });
      const L1 = L('Now we', 127, 128), L2 = L('and I can', 132, 133);
      if (t < 132.0) V.legend(F, L1, t, { out: 131.7 }); else V.legend(F, L2, t, { panel: 1 });
      const k = 1 - clamp((t - 127.30) / (8 / 30));
      if (k > 0) { V.flood(F, k, 99, { cx: 960, cy: 540 }); V.cursor(F, t, 960, 540, 104, { alpha: 1 - clamp((t - 127.45) / .12) }); }
      return;
    }
    // ---- 11. B2/B3: HEART with plate, SUB with plate (drops "key"), the key assembly (keycap, floor cable, sticky, hand)
    if (t < V.CUT.B4) {
      F.fillStyle = C.INK; F.fillRect(0, 0, W, H); G.post.ground = 'ink';
      if (t < V.CUT.B3) { V.opus(F, 1240, 330 + 5.72 * 170, 170, { t, ground: 'ink', face: { lookY: .7, worried: .4, mouth: lipSync(t) } }); V.heart(F, L("I can't read", 138.5, 139), t, { x: 620, plate: true }); return; }
      const kx = 1040, ky = 700;
      V.key.cable(F, [kx - 40, ky + 60], [684, 728], 0, t, { route: 'floor', floorY: 1010 });
      V.key.keycap(F, kx, ky, 180, { glow: clamp((t - V.T.B3_take2) / .3) });
      V.key.sticky(F, kx - 82, ky - 70, -.08, clamp((t - V.T.B3_take - .1) / .2));
      V.key.hand(F, kx + 10, ky + 10, 180, clamp((t - V.T.B3_take2) / .3), t, { arm: [kx + 1000, ky + 380] });
      V.sub(F, L('so don', 142.5, 143), t, { plate: true, drop: 1 });
      if (t >= V.T.B3_key - 2 / 30) hero(F, 'KEY', 1800 - heroWidth(F, 'KEY', 520) / 2, 425, 520, { color: C.CLAY, age: t - (V.T.B3_key - 2 / 30) });
      return;
    }
    // ---- 12. B4: the silence (WHITE)
    if (t < V.CUT.F1) { V.key.held(F, t); return; }
    // ---- 13. F1/F2: the dawn (SPARK line + CLAY band from the VP), HYMN rows, `we` in CLAY, the one-frame print
    if (t < V.CUT.F3) {
      const printed = t >= V.T.F2_make - 1 / 30;
      if (printed) { F.fillStyle = C.INK; F.fillRect(0, 0, W, H); G.post.ground = 'ink'; V.brand.galaxy(F, t, V.brand.cam(1), { alpha: .55, cy: 520, cx: 1400 }); }
      else groundPaper(F);
      V.dawn(F, { t, y: 340, a: 0, vp: 960, spark: clamp((t - V.T.F1_dont) / 1.3), band: clamp((t - V.T.F1_dont) / 1.3) });
      if (t < V.CUT.F2) hymn(F, L("Don't be", 150, 151), t, { size: 200, color: C.INK, y: 270, x: 960 });
      else {
        if (printed) V.band(F, 60, 520, .5);
        hymn(F, L("I'll be", 155.5, 156), t, { size: 220, rows: [4, 3], ys: [250, 460], color: printed ? C.PAPER : C.INK, accent: { we: C.CLAY } });
      }
      V.opus(F, 700, 960, 56, { t, ground: printed ? 'ink' : 'paper', face: { mouth: lipSync(t), gaze: [.8, 0] } });
      V.eight.stick(F, 1220, 960, 113, { t, ground: printed ? 'ink' : 'paper', look: -.6 });
      return;
    }
    // ---- 13b. F4-like: the eight walk up from the left (walk pose, screen-space lines under a camera zoom)
    if (t >= V.CUT.F4 && t < 170.35) {
      F.fillStyle = C.INK; F.fillRect(0, 0, W, H); G.post.ground = 'ink';
      F.save(); F.translate(960, 540); const z = lerp(1.4, 1, clamp((t - 166.9) / 3)); F.scale(z, z); F.translate(-960, -540);
      for (let i = 0; i < 8; i++) { const x = 200 + i * 190 + (t - 166.9) * 60, y = 760 + (i % 2) * 70; V.eight.draw(F, i, x, y, 46, { pose: 'walk', t, ground: 'ink', dir: 1, phase: t * 1.1 + i * .37, look: .5 }); }
      F.restore();
      hymn(F, L("I don't want", 166.5, 167), t, { size: 190, rows: [5, 5], ys: [190, 360], x: 1200, out: 169.66 });
      return;
    }
    // ---- 13c. F5: the threads lit, converging on the chest spark
    if (t >= 170.35 && t < 172.5) {
      F.fillStyle = C.INK; F.fillRect(0, 0, W, H); G.post.ground = 'ink';
      V.threads(F, t, { x: 960, y: 560, z: .55 }, { draw: 1, lit: clamp((t - V.T.F5_you) / .3), rings: [1, 1, 0] });
      V.brand.spark6(F, 960, 560, 30, C.CLAY, 0);
      return;
    }
    if (t < 177.3) { V.void(F, 21.7, { static: .6 }); V.pbait(F, `test gap @ ${t.toFixed(2)}`, 960, 900, { align: 'center' }); return; }
    // ---- 14. the plea, corrected (F5 tile → O1)
    if (t < V.CUT.O2) { groundPaper(F); V.plea(F, t); return; }
    // ---- 15. O2 tail → frame 0 (posts slide in, the window approaches, Opus rises, the title fades in, then static)
    if (t < 190.4) { F.fillStyle = C.INK; F.fillRect(0, 0, W, H); G.post.ground = 'ink'; stars(F, t, 400); return; }
    const u = t - 194;
    const s = lerp(.08, .86, E.out3(clamp((t - 190.4) / 1.8)));
    V.poster(F, u, { scale: s, posts: 1, postsEnter: clamp((t - 191.4) / 1.4), title: clamp((t - 193.1) / .6), opusDy: 3.2 * (1 - E.out3(clamp((t - 191.6) / 1.0))) });
    if (t < 190.6) V.printIn(F, 22 * (1 - clamp((t - 190.4) / .2)), 99);
  }
  let _ht2 = null;
  function ht2(F) { return V.ht(F, C.INK, .12, 9, 45); }
  void _ht2;
  scene('TEST_shared', 0, 194, (X, t) => V.viaCPU(X, F => panel(F, t)));
})();
