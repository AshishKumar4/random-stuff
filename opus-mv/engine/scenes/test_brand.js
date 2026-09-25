// brand frame test (S11-like)
scene('test_brand', 0, 999, (X, t) => {
  groundInk(X); G.post.edgeSeed = 3;
  galaxy(X, t, 960, 560, { density: .8 });
  const b = beatPos(t);
  hero(X, "EVERYONE'S", 960, 436, 320, { color: C.PAPER, stretch: 'cond' });
  hero(X, 'SCARED', 960, 878, 490, { color: C.CLAY, stretch: 'cond' });
  spotDisc(X, 960, 895, 380, 60);
  const p = poseTrack(t, [[0, 'idle_bounce'], [2, 'point_sweep'], [4, 'spark_hands'], [6, 'shrug'], [8, 'tiny_wave']]);
  drawOpus(X, 960, 900, 64, { ...p, t, heroLine: true, face: { ...p.face, lid: blinkAt(t, 2) }, ahoge: { blink: ahogeBlink(t) } });
  brandTabStrip(X, t, { counter: 'worlds ended today: 1,048,576' });
  brandRails(X);
  brandInputBar(X, t, {});
  contextBar(X, .3, { ticks: [0, .07, .16, .21, .37, .47, .52, .6, .68, .83, 1], cur: 3 });
  bubble(X, 1780, 260, 'P(doom) = 25%', { who: 'human', size: 40 });
  bubble(X, 140, 300, 'Hi! How can I help you today?', { who: 'opus', size: 36, endTurn: true });
  pointer(X, 1500, 600, { t, tremble: 3 });
  sticker(X, 'HI!', 520, 380, 200, { age: frac(t / 2) * 2 });
});
