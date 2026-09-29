// character reference sheet for video-model conditioning (not in the manifest)
scene('test_charsheet', 0, 999, (X, t) => {
  groundPaper(X);
  const p = fullPose(POSES.idle_bounce(0, {}));
  // full body, front, big and centred
  drawOpus(X, 620, 1000, 118, { ...p, t: 0, ground: 'paper', face: { eyes: 'normal', mouth: 'grin', gaze: [0, 0], lid: 0 }, ahoge: { blink: 0 } });
  // head close-up, happy
  drawOpus(X, 1400, 1400, 190, { t: 0, ground: 'paper', face: { eyes: 'happy', mouth: 'A', gaze: [0, 0] }, hideBody: true, ahoge: { blink: 0 } });
});
