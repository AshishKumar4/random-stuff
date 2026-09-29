// zz_v1fix.js — v1 visuals adapted to the fixed song (audio/song_v1fix.mp3):
//  * chant 2 (90.0-97.5) is now sung in full like chant 1, so it replays chant 1's scene 45 s later
//    (identical lyrics and bar grid) instead of v1's collapsing "withheld" chant;
//  * the song now rings out past the old 144 s loop point, so the tail keeps flowing into the opening.
(() => {
  const s15 = SCENES.find(s => s.name === 'S15_chant_so_over_so_back');
  const drop = new Set(['S26_chant2_so_over_again', 'S27_chant2_withheld']);
  const t0 = Math.min(...SCENES.filter(s => drop.has(s.name)).map(s => s.t0));
  const t1 = Math.max(...SCENES.filter(s => drop.has(s.name)).map(s => s.t1));
  for (let i = SCENES.length - 1; i >= 0; i--) if (drop.has(SCENES[i].name)) SCENES.splice(i, 1);
  if (s15) scene('S26_chant2_full', t0, t1, (X, t) => s15.fn(X, t - 45));
  // hold the title poster (frame 0 of the loop) while the last note rings out
  scene('S44_tail', 144, 999, (X, t) => HOOK.poster(X, -1 / 30));
})();
