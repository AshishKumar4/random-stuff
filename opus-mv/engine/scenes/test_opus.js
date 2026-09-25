// character sheet for reviewing the Opus rig
scene('test_opus', 0, 999, (X, t) => {
  const page = Math.floor(t / 10);
  if (page === 0) { // poses on INK, R 64
    groundInk(X);
    const names = ['idle_bounce', 'point_sweep', 'shrug', 'wink_spark', 'spark_hands', 'tiny_wave', 'slump', 'snap_up', 'shoo', 'peek', 'window_frame', 'stir'];
    names.forEach((n, i) => {
      const x = 170 + (i % 6) * 316, y = i < 6 ? 520 : 1000;
      const p = fullPose(POSES[n](t, {}));
      drawOpus(X, x, y, 52, { ...p, t, ground: 'ink', face: { ...p.face, lid: blinkAt(t, i) }, ahoge: { blink: ahogeBlink(t) }, bufId: i % 2 });
      X.fillStyle = C.PAPER; X.font = mono(22); X.textAlign = 'center'; X.fillText(n, x, y + 30 - (i < 6 ? 0 : 50) + (i < 6 ? 0 : 0));
    });
  } else if (page === 1) { // big face expressions on PAPER + INK
    const exprs = ['normal', 'cursor', 'smug', 'happy', 'star', 'heart', 'dots', 'TT'];
    X.fillStyle = C.PAPER; X.fillRect(0, 0, W / 2, H); X.fillStyle = C.INK; X.fillRect(W / 2, 0, W / 2, H);
    G.post.ground = 'inkx';
    exprs.forEach((e, i) => {
      const x = 240 + (i % 4) * 480, y = i < 4 ? 480 : 1030; const onPaper = x < W / 2;
      drawOpus(X, x, y + 5.8 * 60 - 60, 60, { t, ground: onPaper ? 'paper' : 'ink', face: { eyes: e, mouth: ['rest', 'A', ':3', 'I', 'O', 'grin', '._.', 'wobble'][i], gaze: [.5, 0] }, hideBody: true, ahoge: { blink: ahogeBlink(t) }, bufId: i % 2 });
    });
  } else { // hero close-up R 220 on INK (brand-frame keyline) and minimal/ghost skins
    groundInk(X);
    drawOpus(X, 700, 1500, 200, { t, ground: 'ink', heroLine: true, face: { eyes: 'normal', gaze: [.3, -.2], mouth: lipSync(t, 'rest'), lid: blinkAt(t, 3) }, armR: { hand: [1.3, 5.5], bend: -1, type: 'spark', front: true }, ahoge: { blink: ahogeBlink(t) } });
    drawOpus(X, 1350, 900, 70, { t, skin: 'ghost', ground: 'ink' });
    drawOpus(X, 1700, 900, 70, { t, skin: 'minimal', ground: 'paper', face: { eyes: 'normal' } });
  }
});
