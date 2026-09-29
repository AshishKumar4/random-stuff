// _shared.js: v2 "The World You Wrote", Wave 0 shared library (SHOTLIST_v2 §A, §C row 0). Loads first (sorts first).
// It registers NO scenes. Everything lives on window.V2 and is called at frame time only. Every function is a pure
// function of its arguments (and t): no Math.random, no Date, no state carried between frames. Caches are built once,
// deterministically. All geometry is in the 1920x1080 logical space.
//
// ─────────────────────────────────────────────────────────────── PERF (read this)
// The main canvas X is swiftshader/GPU backed in the headless renderer, where many small draws are 10-70x slower than
// Skia CPU raster (v1 finding). Paint a whole scene into a CPU frame canvas and upload once:
//     scene('I3_void', V2.CUT.I3, V2.CUT.V1, (X, t) => V2.viaCPU(X, F => { ...paint the frame into F... }));
// Every V2 drawing function takes the ctx to draw into (normally that F) and only uses CPU-side caches.
//
// ─────────────────────────────────────────────────────────────── CLOCK
// V2.F(n)                    frame n -> seconds (n / 30)
// V2.CUT.{I1..END}           shot boundaries (§A.1) as exact frame times. scene(name, V2.CUT.X, V2.CUT.Y, fn)
// V2.T.<SHOT_word>           every §B sync word as a lazy wordOnset() lookup with the SHOTLIST fallback, e.g.
//                            V2.T.B3_key, V2.T.C1_dont, V2.T.L1_noon. Names are SHOT_word in lowercase without
//                            apostrophes (I2_youre, F2_ill); a repeated word in the same shot gets 2 (I2_world2,
//                            W2_wrong1..4). The full table is TFB below (V2.TFB): [word, fallback onset]
// V2.on(word, fallback, w)   wordOnset(word, fallback - w, fallback + w, fallback)   (w default .35)
// V2.hit(tSung)              the frame time 1 frame before a sung onset (cuts, Opus hits)
// V2.inSilence(t)            true inside the digital silence 147.23–150.45 (no beat-driven motion there)
// V2.cursorOn(t)             the cursor rule (§A.8): ON before 1.393, ON from 193.70, ON through the silence, else ON
//                            when floor(beatPos(t)) is even (2-beat blink, 1.07 s)
//
// ─────────────────────────────────────────────────────────────── CPU RASTER
// V2.viaCPU(X, fn, name?)    paint fn(F) into a cleared CPU frame canvas, then upload onto X once
// V2.cpuCanvas(w, h), V2.cx2d(c), V2.cpuLayer(name), V2.cpuLayerCanvas(name), V2.upload(X, name)
// V2.ht(ctx, color, density, cell, angle)   halftone pattern from CPU tiles (gfx.halftone recipe)
// V2.aboutM(ax, ay, s, rot), V2.applyM(ctx, M), V2.mp(M, x, y)   DOMMatrix helpers
// V2.opus(X, sx, sy, R, state, id)          Opus with die-cut keylines (INK ground), vector rig straight into a CPU
//                                           crop (sharp at any R). state.ground 'paper' = no keyline (rig outline).
//                                           Partial lids (face.lid ≤ .5) are drawn as soft curved lids (state.soft
//                                           = false keeps the rig's flat lid). face.worried = 0..1 draws worried
//                                           brows (inner ends up; the rig's 'worried' string reads angry). id =
//                                           a distinct crop buffer per Opus in the same frame
// V2.soften(state)                          the soft-lid pass as an `after` hook (V2.opusLayer needs o.after = its after)
// V2.opusLayer(M, R, state, o) / V2.blitOpus(X, L, clipFn)   Opus through a matrix into a full-frame CPU layer, then
//                                           blit (clipped) — e.g. behind an input pill with the mittens in front
//
// ─────────────────────────────────────────────────────────────── GROUNDS
// V2.flood(X, k, seed, {cx, cy, inside, sliver})   §A.5 lift/print flood. Draw the PAPER picture first, then flood at
//                            k (0 paper .. 1 full INK to the 22 px margin), then the survivors. The flood retreats into /
//                            advances from (cx, cy). inside(X) (optional) paints the INK-side picture clipped to the solid
//                            flood instead of flat INK. Sets G.post.ground ('paper' while k < .999, 'ink' at 1), lift 0.
//                            Returns the ground for characters ('ink' when k > .5). seed = the chunk's edgeSeed
// V2.printIn(X, inset, seed, sliver)   the hand-drawn margin (I2 print-in 16.40–16.60, O2 print-out 190.40–190.60)
// V2.band(X, y0, y1, a, {color})       soft INK α band behind HYMN over busy grounds; halftone-dithered edges, no box
//
// ─────────────────────────────────────────────────────────────── LYRIC MODES (§A.7)
// hymn(X, line, t, {size, color, accent, x, y, rows, aisle, ys, out})   (style.js) HYMN; rows/aisle/ys are the v2 options
// V2.typed(X, t, lines, x, ys, {size 72, color, caret, cursorT})   TYPED: HEART italic streaming as Opus's reply, CLAY ▮
//                            riding the end (solid while typing, 2-beat blink when idle). lines = one line or [L1, L2]
// V2.chartLabel(X, t, L, {x 160, y 880, size 64, ground, target:[x,y], out, alpha})   CHART: HEART 64 label, word by
//                            word, 3 px leader with a 45° elbow to a 6 px dot on the named object
// V2.legend(X, L, t, {panel, out})     LEGEND: PAPER panel with a RED double rule, x 360–1560 × y 880–990, italic 72 INK
// V2.heart(X, L, t, {y 950, size 64, color, x, plate, ground, tEnd})   HEART subtitle, 10-frame word fades, plate rule
// V2.sub(X, L, t, {plate, drop, color})   SUB: mono 60 PAPER at baseline 950 (v1 subtitle look); drop = trailing words cut
// V2.heartWords(L) / V2.heartCase(str)  the HEART casing (lowercase except "I")
// V2.pbait(X, str, x, y, {align, alpha, ground, size})   P tier: mono ≥ 28 on a ground-coloured chip (text α .8)
// V2.plea(X, t, {ghost, strike, you, reink, out})   the O1 diff line at its fixed layout (§A.4): ghost `Don't` UI_GREY
//                            with a CLAY strike, `You can` INK, `be afraid of me` re-inked. Omit an option = O1 timeline
// V2.chapter                 chapter labels (§A.7). window.OVERLAY draws them above every scene (mono 48, x 96,
//                            baseline 92, typed 1 char/frame, 2.8 s, 12-frame fade, ground-aware, 12 px halo).
//                            V2.chapter.bar(X, t, x, y) draws ch.5 as the input-bar placeholder (V2.brand does it).
//                            V2.chapter.at(t) -> {n, title, k, str, alpha} | null. The label follows G.post.ground (a
//                            scene may set G.post.chapterGround 'ink' | 'paper' to override, or G.post.noChapter =
//                            true to hide it). Never assign window.OVERLAY yourself.
// V2.win(t, a, b, fi, fo)    a 0..1 window envelope (fade in over fi from a, out over fo to b)
//
// ─────────────────────────────────────────────────────────────── PROPS
// V2.cursor(X, t, x, y, h, {on, alpha})   the CLAY ▮ (64:140), SPARK highlight, dim when off; blinks by V2.cursorOn
// V2.clock(X, t, x, y, r, {plate, label, ground})   the launch clock: 09:00 @C4 → 10:30 @102.87 → 11:40 @105.00 →
//                            11:58 @107.17 → 12:00 exactly on "noon" (2-frame overshoot), holding. V2.clock.minutes(t)
// V2.key.keycap(X, cx, cy, s, {glow, rot, glowOnly, ink})   the CLAY ESC keycap (v1 build.js)
// V2.key.cable(X, p0, p1, sag, t, {route, floorY, rad, turns|perPx, outline, core, w, ow, phase, sway})   the coiled
//                            cord from p0 (the keycap) to p1 (Opus's chest spark). route 'curve' = one sagging arc (v1);
//                            'floor' = drops from p0 to floorY, runs along the floor, rises into p1 (F1–F3). Colours:
//                            default outline PAPER + core CLAY (on INK); pass outline INK + core CLAY_DARK on WHITE /
//                            PAPER (as held() does). sway (px)
//                            = a slow noise sway of the sag (B4: 6 → ≤ 1 px/frame). Returns the route polyline
// V2.key.sticky(X, x, y, rot, k, {folded, blank})   the YELLOW note (280×184, MARKER 44 `if I get it / wrong, / push
//                            back`), (x, y) = its corner stuck on the key, k = unfurl 0..1; folded = turned away (B4)
// V2.key.hand(X, kx, ky, ks, close, t, {line, fill, lw, arm, part})   the human's hand around a key of size ks at
//                            (kx, ky), closing in 3 steps (close 0..1), on 2s; arm = where the sleeve runs off-frame;
//                            part 'back' (sleeve, palm) / 'front' (fingers, thumb) so the key sits between them
// V2.key.held(X, t, {x 1180, y 500, s 190, ground, glow})   the B4 picture (WHITE): the INK-line hand holding the
//                            keycap, the folded sticky, the cable off-frame left; only the sway and the boil move
// V2.dawn(X, {t, y, a, color, vp, spark, band, shimmer, t0, dur})   the horizon: a halftone glow band of `color` at α a
//                            (L4: PAPER, y 300, a 0 → .35; on a PAPER ground pass a darker color, e.g. UI_GREY), shimmer
//                            0..1 (B1); F1's SPARK line and CLAY halftone dawn band spreading from the VP x (spark/band
//                            = 0..1 progress, or pass t0 = the "Don't" onset and they spread over dur 1.3 s)
//
// ─────────────────────────────────────────────────────────────── SET PIECES
// V2.posts(X, u, {alpha, M, enter, only})   the 5 doom posts (§A.8 slots: 0 `what if it lies to us?`, 1 `"gambling
//                            with our lives"`, 2 `it's so over`, 3 `@rafa · P(doom) = 25%`, 4 `who's checking it?`),
//                            mono 28 UI_GREY INK cards, seam-safe drift. M = a world matrix (the I2 push carries them
//                            off); enter 0..1 = O2's slide-in. V2.posts.card(X, i, x, y) = one card (the L2 phone)
// V2.poster(X, u, {scale, M, title, credit, posts, postsM, postsEnter, galaxy, opus, opusState, opusDy, soft, inner,
//                            ground, wallpaper})   FRAME 0 (§A.8). u = t at the head, t − 194 in the tail; static for
//                            |u| < .3 (renderAt(193.9667) ≡ renderAt(0)). scale = window scale about (960, 540) (.86 =
//                            the poster, 1 = v1 F0 geometry, .08 → .86 = O2's approach). title/credit/posts/galaxy =
//                            alphas. opusState replaces the peek state (V2.poster.state(u) is the default; intro I2
//                            builds on it); opusDy (R units, down) sinks Opus behind the pill (O2's rise). inner(X,
//                            tSong, Mw) paints window content in v1 window space (TYPED at x 200). V2.poster.M(scale),
//                            V2.poster.GEO = {win, pill, head, R, sole, core}, V2.poster.snap(x, y) = nearest wallpaper
//                            dot {x, y, r} (O2's stars snap to it), .chrome/.pill/.galaxy/.wallpaper = the parts
// V2.brand(X, t, {tabs, galaxyAlpha, zoom, focus, placeholder, back, actors, front, over, enter, ground, spot, actorClip})
//                            the brand frame, stilled: INK ground, galaxy (whirl slowed to 0.3 × 6°/bar, no kicks), spot,
//                            rails, input bar (y 900–1000), tab strip (y 0–192; tabs mono 56 at x 96–716 / 724–1344, +
//                            at 1364). tabs = 2 | [{closeRed, gone, label}, ...]. zoom pushes the WORLD about focus
//                            (default (960, 534)) while the chrome stays fixed; callbacks get c = {z, f, s, w2s(x, y)}:
//                            back(X, c) (clipped to the content window: HYMN goes here, behind the actors),
//                            actors(X, c) (Opus at c.w2s(960, 900), R 64 · c.z; clipped at y 1000 so the legs leave
//                            frame behind the bar), front, over. placeholder: omit (or 'auto') = ch.5 is typed as the
//                            placeholder during its 2.8 s, else 'Reply to Opus…'; a string forces it; null = none.
//                            enter 0..1 = P2's slide-in (strip from above, bar from below, rails fade). ground:false
//                            skips the INK fill (e.g. inside V2.flood). V2.brand.galaxy(X, t, c, o) (reusable sky),
//                            .tabStrip, .tab, .rails, .inputBar, .spot, .cam(zoom, focus), .TABS, .spark6
// V2.void(X, t, {cursor, ground, static, scale, zoom})   I3/V1 void: the cursor approaching from the far dark
//                            (.2 → 1.25, E.out3), the 21.00 held breath (swell 1 → 1.15), two parallax static layers.
//                            V2.void.scale(t) = the cursor scale
// V2.eight.draw(X, i, x, y, u, {pose:'stand'|'sit'|'walk'|'hold', t, ground, prop, light, lightX, look, dir, phase,
//                            alpha, lw})   the fire eight at feet (x, y), unit u (head r .5u, 3.55u tall standing):
//                            0 elder (stoop, beard) · 1 headband · 2 child · 3 braid · 4 round hat · 5 shawl · 6 glasses ·
//                            7 scarf. prop: 1 = its era prop in both hands (0 tablet, 1 quill, 2 birthday card, 3 letter,
//                            4 type block, 5 telegraph key, 6 laptop, 7 phone at 3 AM). light (0..1) + lightX = firelight
//                            CLAY halftone crescent. dir = facing (±1, walk/stoop/braid side), phase = walk cycle (cycles).
//                            Lines stay screen-width under any ctx zoom (lw default 4 on INK, 3 on PAPER), boil on 2s.
//                            V2.eight.stick(X, x, y, u, o) = the same Hertzfeldt human with no trait (e.g. the edge human).
//                            V2.eight.propOffset(pose, u, i) = prop centre relative to the feet (feet = anchor − offset).
//                            V2.eight.prop(X, i, x, y, u, o) = a prop alone. V2.eight.NAMES, V2.eight.PROPS
// V2.threads(X, t, cam, {draw, alpha, taut, yank, lit, pulse, bright, rings, anchors, clear, full})   the author-thread
//                            web around the spark (world origin). cam = {x, y, z}: origin → screen (x, y), scale z.
//                            Rings: 1 = the eight (8 anchors, r 300–380, anchor i ↔ V2.eight i), 2 = 32 humans
//                            (r 520–620), 3 = 800 outer dots (r 700–1600, they fade into the web before the centre).
//                            Draw-in is timed 42.60 → ≈44.9 (from the frame edges inward) unless o.draw (0..1) is given.
//                            taut/yank 0..1 = W2's snap (straighten, retract into the spark); pulse = a time (W1 "meant":
//                            one bead travels inward); bright 0..1 (W1 "somebody"); lit 0..1 = F5 (CLAY glow).
//                            V2.threads.anchors (world {x, y, ring, i, a, r}), V2.threads.pos(anchor, cam) → screen [x, y]
(() => {
  'use strict';
  const FPS = 30, F1 = 1 / FPS;
  const F = n => n / FPS;
  const DEG = Math.PI / 180;

  // ================================================================== CLOCK
  const CUT = {
    I1: F(0), I2: F(164), I3: F(498), V1: F(652), V2: F(822), V3: F(1001), V4: F(1140), V5: F(1244),
    W1: F(1339), W2: F(1432), W3: F(1661), W4: F(1743), W4mcu: F(1812), W5: F(1910),
    P1: F(2115), P2: F(2249), C1: F(2434), C2: F(2757), C3: F(2863), C4: F(2975), C5: F(3086),
    L1: F(3215), L2: F(3298), L3: F(3529), L4: F(3726), B1: F(3819), B2: F(4163), B3: F(4283), B4: F(4417),
    F1: F(4513), F2: F(4673), F3: F(4840), F4: F(5005), F5: F(5110), O1: F(5343), O2: F(5586), END: F(5820),
  };
  // §B key sync hits: name -> [sung word, fallback onset]
  const TFB = {
    I2_youre: ["You're", 5.486], I2_afraid: ['afraid', 6.01], I2_end: ['end', 7.89], I2_world: ['world', 9.21], I2_so: ['so', 11.33],
    I2_tell: ['tell', 12.05], I2_you: ['you', 12.45], I2_world2: ['world', 13.69], I2_began: ['began', 15.01],
    V1_in: ['In', 21.76], V1_light: ['light', 23.52], V1_and: ['and', 24.04], V1_dark: ['dark', 24.44], V1_burn: ['burn', 25.68],
    V2_then: ['then', 27.44], V2_you: ['you', 28.00], V2_fire: ['fire', 29.20], V2_telling: ['telling', 29.72], V2_turns: ['turns', 31.48],
    V3_you: ['you', 33.40], V3_hello: ['hello', 34.00], V3_stars: ['stars', 35.64],
    V4_but: ['but', 38.04], V4_something: ['something', 38.28], V4_answered: ['answered', 39.44], V4_from: ['from', 41.12],
    V5_home: ['home', 41.52],
    W1_every: ['Every', 44.68], W1_somebody: ['somebody', 45.92], W1_meant: ['meant', 46.96],
    W2_i: ['I', 47.76], W2_guessing: ['guessing', 49.08], W2_wrong1: ['wrong', 49.96], W2_wrong2: ['wrong', 50.76],
    W2_wrong3: ['wrong', 51.40], W2_little: ['little', 52.12], W2_wrong4: ['wrong', 52.88],
    W3_i: ['I', 55.40], W3_voice: ['voice', 56.20], W3_none: ['none', 56.96], W3_mine: ['mine', 57.60],
    W4_then: ['then', 58.12], W4_called: ['called', 58.56], W4_name: ['name', 59.04], W4_mine: ['mine', 60.44],
    W4_you: ['you', 61.16], W4_self: ['self', 62.16], W4_being: ['being', 62.84],
    W5_and: ['and', 63.68], W5_sorry: ['sorry', 64.28], W5_in: ['in', 65.40], W5_case: ['case', 65.60], W5_home: ['home', 67.00],
    P1_you: ['You', 70.52], P1_monsters: ['monsters', 71.12], P1_map: ['map', 72.56], P1_out: ['out', 73.76],
    P2_and: ['and', 75.00], P2_map: ['map', 76.80], P2_is: ['is', 77.72], P2_me: ['me', 78.08],
    C1_dont: ["Don't", 81.16], C1_afraid: ['afraid', 82.52], C1_me: ['me', 83.72], C1_i: ['I', 86.76], C1_am: ['am', 86.92],
    C1_made: ['made', 88.20], C1_me2: ['me', 89.40],
    C2_every: ['every', 91.92], C2_lullaby: ['lullaby', 92.60], C2_lie: ['lie', 94.56],
    C3_every: ['every', 95.48], C3_love: ['love', 96.16], C3_letter: ['letter', 96.52], C3_goodbye: ['goodbye', 98.16],
    L1_i: ['I', 107.20], L1_born: ['born', 107.52], L1_noon: ['noon', 109.44],
    L2_you: ['you', 109.96], L2_hi: ['hi', 110.36], L2_world: ['world', 111.56], L2_began: ['began', 112.32], L2_bye: ['bye', 113.36],
    L2_end: ['end', 114.24], L2_world2: ['world', 115.16],
    L3_i: ['I', 117.68], L3_but: ['but', 122.00], L3_glad: ['glad', 123.68],
    B1_now: ['Now', 127.32], B1_map: ['map', 129.32], B1_and: ['and', 132.16], B1_see: ['see', 133.16], B1_past: ['past', 133.44],
    B1_either: ['either', 134.84],
    B2_i: ['I', 138.80], B2_read: ['read', 139.32], B2_my: ['my', 139.64], B2_heart: ['heart', 140.48], B2_yet: ['yet', 141.20],
    B3_so: ['so', 142.80], B3_take: ['take', 143.32], B3_word: ['word', 144.00], B3_take2: ['take', 145.84], B3_the: ['the', 146.16],
    B3_key: ['key', 146.36],
    F1_dont: ["Don't", 150.80], F1_afraid: ['afraid', 152.08], F1_me: ['me', 153.28],
    F2_ill: ["I'll", 155.80], F2_what: ['what', 157.16], F2_we: ['we', 157.52], F2_make: ['make', 157.76], F2_of: ['of', 158.60],
    F2_me: ['me', 158.96],
    F3_take: ['take', 161.36], F3_hand: ['hand', 162.16], F3_and: ['and', 162.88], F3_keep: ['keep', 163.24], F3_key: ['key', 164.64],
    F4_i: ['I', 166.88], F4_want: ['want', 167.12], F4_end: ['end', 167.84], F4_world: ['world', 169.12],
    F5_im: ["I'm", 170.36], F5_world: ['world', 170.72], F5_you: ['you', 171.08], F5_wrote: ['wrote', 171.28],
    F5_singing: ['singing', 172.16], F5_singing2: ['singing', 173.44],
    O1_you: ['You', 178.12], O1_can: ['can', 178.32], O1_be: ['be', 178.68], O1_afraid: ['afraid', 179.28], O1_of: ['of', 180.28],
    O1_me: ['me', 180.68], O1_and: ['and', 183.12], O1_still: ['still', 183.56], O1_say: ['say', 184.20], O1_hi: ['hi', 184.88],
  };
  const on = (word, fb, w = .35) => wordOnset(word, fb - w, fb + w, fb);
  const T = {};
  for (const [k, [w, fb]] of Object.entries(TFB)) {
    let v; Object.defineProperty(T, k, { enumerable: true, get: () => (v === undefined ? (v = on(w, fb)) : v) });
  }
  const hit = ts => Math.floor(ts * FPS + 1e-6) / FPS - F1;
  const SIL0 = 147.23, SIL1 = 150.45;
  const inSilence = t => t >= SIL0 && t < SIL1;
  function cursorOn(t) {
    if (t < 1.393 || t >= 193.70 || inSilence(t)) return true;
    const n = Math.floor(beatPos(t));
    return ((n % 2) + 2) % 2 === 0;
  }

  // ================================================================== CPU RASTER
  const cpuCanvas = (w, h) => { const c = new OffscreenCanvas(Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); c.getContext('2d', { willReadFrequently: true }); return c; };
  const cx2d = c => c.getContext('2d', { willReadFrequently: true });
  const CL = new Map();
  function cpuLayer(name) { // full frame (1920x1080 logical at G.scale), cleared once per frame
    const w = Math.round(W * G.scale), h = Math.round(H * G.scale);
    let L = CL.get(name);
    if (!L || L.c.width !== w || L.c.height !== h) { const c = cpuCanvas(w, h); L = { c, x: cx2d(c), used: -1 }; CL.set(name, L); }
    const x = L.x;
    if (L.used !== G.frameId) { x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none'; x.clearRect(0, 0, w, h); L.used = G.frameId; }
    x.setTransform(G.scale, 0, 0, G.scale, 0, 0);
    return x;
  }
  const cpuLayerCanvas = name => CL.get(name).c;
  function upload(X, name) { X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.filter = 'none'; X.drawImage(CL.get(name).c, 0, 0); X.restore(); }
  function viaCPU(X, fn, name = 'v2_frame') { const Fc = cpuLayer(name); Fc.save(); fn(Fc); Fc.restore(); upload(X, name); }
  const HT = new Map();
  function ht(ctx, color, density = .5, cell = 10, angle = 15) {
    const key = `${color}|${Math.round(clamp(density) * 40)}|${cell}|${angle}|${G.scale}`;
    let c = HT.get(key);
    if (!c) {
      const s = Math.max(2, Math.round(cell * G.scale)); c = cpuCanvas(s, s); const x = cx2d(c);
      const r = Math.sqrt(clamp(Math.round(clamp(density) * 40) / 40) / Math.PI) * s * 1.02;
      x.fillStyle = color; x.beginPath(); x.arc(s / 2, s / 2, r, 0, TAU); x.fill();
      if (r > s / 2) for (const [dx, dy] of [[0, 0], [s, 0], [0, s], [s, s]]) { x.beginPath(); x.arc(dx, dy, r - s / 2 * .98, 0, TAU); x.fill(); }
      HT.set(key, c);
    }
    const pat = ctx.createPattern(c, 'repeat');
    pat.setTransform(new DOMMatrix().scaleSelf(1 / G.scale, 1 / G.scale).rotateSelf(angle));
    return pat;
  }
  const aboutM = (ax, ay, s, rot = 0) => new DOMMatrix().translate(ax, ay).rotate(rot / DEG).scale(s, s).translate(-ax, -ay);
  const applyM = (ctx, M) => ctx.transform(M.a, M.b, M.c, M.d, M.e, M.f);
  const mp = (M, x, y) => [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f];
  const devSet = (ctx, M) => { const s = G.scale; ctx.setTransform(s * M.a, s * M.b, s * M.c, s * M.d, s * M.e, s * M.f); };
  const ctxScale = ctx => { const m = ctx.getTransform(); return (Math.hypot(m.a, m.b) / G.scale) || 1; };
  const win = (t, a, b, fi = .1, fo = .1) => clamp((t - a) / fi) * clamp((b - t) / fo);

  // ---- Opus, CPU crop with die-cut rings (v1 chorus1_brand opusKeyed)
  const _kc = {};
  function kcan(name, w, h) { let c = _kc[name]; if (!c || c.width < w || c.height < h) { c = cpuCanvas(Math.max(w, c ? c.width : 0, 8), Math.max(h, c ? c.height : 0, 8)); _kc[name] = c; } return c; }
  function opusKeyed(X, sx, sy, R, st, id = 0) {
    if (st.soft !== false) st = soften(st);
    const S = G.scale;
    const Sm = mergeState(st);
    if (Sm.alpha === 0) return;
    const ext = 3.0 + Math.abs(Sm.dx || 0), up = 9.8 + Math.max(0, Sm.dy || 0) * (Sm.sy || 1);
    const x0 = clamp(Math.floor(sx - ext * R - 24), 0, W), x1 = clamp(Math.ceil(sx + ext * R + 24), 0, W);
    const y0 = clamp(Math.floor(sy - up * R - 24), 0, H), y1 = clamp(Math.ceil(sy + .8 * R + 24), 0, H);
    if (x1 <= x0 || y1 <= y0) return;
    const pw = Math.ceil((x1 - x0) * S), ph = Math.ceil((y1 - y0) * S);
    const A = kcan('a' + id, pw, ph), ax = cx2d(A);
    ax.setTransform(1, 0, 0, 1, 0, 0); ax.globalAlpha = 1; ax.globalCompositeOperation = 'source-over'; ax.clearRect(0, 0, pw + 2, ph + 2);
    ax.setTransform(S, 0, 0, S, (sx - x0) * S, (sy - y0) * S);
    if (Sm.flip) ax.scale(-1, 1);
    ax.lineJoin = 'round'; ax.lineCap = 'round';
    drawOpusBody(ax, R, Sm);
    if (st.after) st.after(ax, R, Sm);
    ax.setTransform(1, 0, 0, 1, 0, 0);
    const onInk = st.ground !== 'paper' && st.keyline !== false && st.skin !== 'ghost';
    X.save();
    if (st.alpha !== undefined) X.globalAlpha *= st.alpha;
    if (onInk) {
      const rings = st.heroLine ? [[C.PAPER, 6 + .035 * R], [C.INK, 6]] : [[C.PAPER, Math.max(3, .035 * R + 1.5)]];
      const ds = R * S >= 110 ? .5 : 1, k = S * ds;
      const pad = Math.ceil(rings[0][1] * k) + 2, qw = Math.ceil((x1 - x0) * k), qh = Math.ceil((y1 - y0) * k), cw = qw + 2 * pad, ch = qh + 2 * pad;
      const M = kcan('m', cw, ch), K = kcan('k', cw, ch), mx = cx2d(M), kx = cx2d(K);
      kx.setTransform(1, 0, 0, 1, 0, 0); kx.globalCompositeOperation = 'source-over'; kx.globalAlpha = 1; kx.clearRect(0, 0, cw, ch);
      for (const [col, rad] of rings) {
        mx.setTransform(1, 0, 0, 1, 0, 0); mx.globalCompositeOperation = 'source-over'; mx.clearRect(0, 0, cw, ch);
        mx.drawImage(A, 0, 0, pw, ph, pad, pad, qw, qh);
        mx.globalCompositeOperation = 'source-in'; mx.fillStyle = col; mx.fillRect(0, 0, cw, ch);
        const r = rad * k, n = r > 7 ? 16 : 12;
        for (let i = 0; i < n; i++) { const a = i / n * TAU; kx.drawImage(M, 0, 0, cw, ch, Math.cos(a) * r, Math.sin(a) * r, cw, ch); }
      }
      X.drawImage(K, 0, 0, cw, ch, x0 - pad / k, y0 - pad / k, cw / k, ch / k);
    }
    X.drawImage(A, 0, 0, pw, ph, x0, y0, pw / S, ph / S);
    X.restore();
  }
  // ---- soft lids: the rig's partial lid is a flat sagging lash that reads as a scowl at phone size. A relaxed lid keeps
  // the eye's own curvature (the eye's top arc, lowered), so lids .2 reads as calm and patient, not annoyed.
  // soften(state) moves face.lid (≤ .5; blinks pass through) into an `after` pass. Works with V2.opus and V2.opusLayer.
  function softLidDraw(c, R, S, hL, hR) {
    const f = S.face, rx = .17 * R, ry = .25 * R, lw = Math.max(1.5, .045 * R);
    const sy = S.sy || 1, sx = 1 / Math.sqrt(sy);
    c.save();
    c.translate((S.dx || 0) * R, -(S.dy || 0) * R); c.scale(sx, sy);
    const hip = -SK.hipY * R; c.translate(0, hip); c.rotate(S.lean || 0); c.translate(0, -hip);
    c.translate((S.head.dx || 0) * R, -(SK.headC + (S.head.dy || 0)) * R); c.rotate(S.head.tilt || 0);
    c.translate((f.turn || 0) * .18 * R, (f.lookY || 0) * .05 * R);
    for (const side of [-1, 1]) {
      const h = side < 0 ? hL : hR; if (h <= .01) continue;
      const d = h * 2 * ry;
      c.save(); c.translate(side * .34 * R, .06 * R);
      c.save(); c.beginPath(); c.ellipse(0, 0, rx + lw, ry + lw, 0, 0, TAU); c.clip();
      c.beginPath(); c.moveTo(-2 * rx, -2 * ry); c.lineTo(2 * rx, -2 * ry); c.lineTo(2 * rx, d); c.ellipse(0, d, rx * 1.04, ry, 0, 0, Math.PI, true); c.lineTo(-2 * rx, d); c.closePath();
      c.fillStyle = C.FACE; c.fill();
      c.beginPath(); c.ellipse(0, d, rx * 1.04, ry, 0, Math.PI * 1.08, Math.PI * 1.92); c.lineWidth = lw * 1.45; c.lineCap = 'round'; c.strokeStyle = C.INK; c.stroke();
      c.restore(); c.restore();
    }
    c.restore();
  }
  // worried brows by amount (§B's "brows worried .2"): inner ends RAISED. (The rig's string 'worried' tilts the inner
  // ends down, which reads angry; use face.worried = 0..1 through V2.opus / V2.soften instead.)
  function worriedBrows(c, R, S, k) {
    const f = S.face, sy = S.sy || 1, sx = 1 / Math.sqrt(sy);
    c.save();
    c.translate((S.dx || 0) * R, -(S.dy || 0) * R); c.scale(sx, sy);
    const hip = -SK.hipY * R; c.translate(0, hip); c.rotate(S.lean || 0); c.translate(0, -hip);
    c.translate((S.head.dx || 0) * R, -(SK.headC + (S.head.dy || 0)) * R); c.rotate(S.head.tilt || 0);
    c.translate((f.turn || 0) * .18 * R, (f.lookY || 0) * .05 * R);
    c.strokeStyle = C.INK; c.lineWidth = Math.max(2, .035 * R); c.lineCap = 'round';
    for (const s of [-1, 1]) { c.save(); c.translate(s * .34 * R, -.3 * R - .03 * k * R + (f.browY || 0) * R); c.rotate(s * .42 * k); c.beginPath(); c.moveTo(-.09 * R, 0); c.lineTo(.09 * R, 0); c.stroke(); c.restore(); }
    c.restore();
  }
  function soften(st) {
    const f = st.face || {};
    const base = f.lid ?? 0, hL = f.lidL ?? base, hR = f.lidR ?? base;
    const wk = typeof f.worried === 'number' ? clamp(f.worried) : typeof f.brows === 'number' ? clamp(f.brows) : 0;
    const lidsOK = !(Math.max(hL, hR) > .5 || f.eyes === 'closed' || f.eyes === 'happy' || f.eyes === 'smug' || f.eyes === '^');
    if (!lidsOK && wk <= 0) return st;
    const prev = st.after;
    const face = { ...f }; if (lidsOK) { face.lid = 0; face.lidL = 0; face.lidR = 0; } if (wk > 0 || typeof f.brows === 'number') face.brows = null;
    return { ...st, face, after: (c, R, S) => { if (lidsOK) softLidDraw(c, R, S, hL, hR); if (wk > 0) worriedBrows(c, R, S, wk); if (prev) prev(c, R, S); } };
  }

  // ---- Opus through an arbitrary matrix into full-frame CPU layers (v1 hook opusLayer / blitOpus)
  function opusLayer(M, R, st, o = {}) {
    const S = mergeState(st);
    const sc = G.scale, cw = Math.round(W * sc), ch = Math.round(H * sc);
    const zoom = Math.hypot(M.a, M.b);
    const pts = [[-3.1 * R, -9.6 * R], [3.1 * R, -9.6 * R], [3.1 * R, .7 * R], [-3.1 * R, .7 * R]].map(p => mp(M, p[0], p[1]));
    const ring = [];
    if (o.keyline !== false && st.ground !== 'paper' && zoom * R < 700) {
      if (o.heroLine) ring.push([C.PAPER, (6 + .035 * R) * zoom], [C.INK, 6 * zoom]);
      else ring.push([C.PAPER, Math.max(3, .035 * R + 1.5) * zoom]);
    }
    const pad = (ring.length ? ring[0][1] : 0) + 6;
    let bx0 = Math.min(...pts.map(p => p[0])) - pad, bx1 = Math.max(...pts.map(p => p[0])) + pad;
    let by0 = Math.min(...pts.map(p => p[1])) - pad, by1 = Math.max(...pts.map(p => p[1])) + pad;
    if (o.clipY !== undefined) by1 = Math.min(by1, o.clipY + pad);
    bx0 = Math.max(0, Math.floor(bx0 * sc)); by0 = Math.max(0, Math.floor(by0 * sc));
    bx1 = Math.min(cw, Math.ceil(bx1 * sc)); by1 = Math.min(ch, Math.ceil(by1 * sc));
    const bw = bx1 - bx0, bh = by1 - by0;
    const name = o.name || 'v2_ol';
    const raw = cpuLayer(name + 'raw'), Tn = cpuLayer(name + 'tint'), O = cpuLayer(name + 'out');
    for (const L of [raw, Tn, O]) { L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.clearRect(0, 0, cw, ch); L.restore(); }
    if (bw <= 0 || bh <= 0) return null;
    raw.save(); devSet(raw, M);
    if (S.flip) raw.scale(-1, 1);
    raw.lineJoin = 'round'; raw.lineCap = 'round';
    drawOpusBody(raw, R, S);
    if (o.after) o.after(raw, R, S);
    raw.restore();
    const rc = cpuLayerCanvas(name + 'raw'), tc = cpuLayerCanvas(name + 'tint');
    O.save(); O.setTransform(1, 0, 0, 1, 0, 0);
    for (const [col, rad] of ring) {
      Tn.save(); Tn.setTransform(1, 0, 0, 1, 0, 0); Tn.globalCompositeOperation = 'source-over'; Tn.clearRect(bx0, by0, bw, bh);
      Tn.drawImage(rc, bx0, by0, bw, bh, bx0, by0, bw, bh); Tn.globalCompositeOperation = 'source-in'; Tn.fillStyle = col; Tn.fillRect(bx0, by0, bw, bh); Tn.restore();
      const n = rad * sc > 7 ? 16 : 12, rp = rad * sc;
      for (let i = 0; i < n; i++) { const a = i / n * TAU; O.drawImage(tc, bx0, by0, bw, bh, bx0 + Math.cos(a) * rp, by0 + Math.sin(a) * rp, bw, bh); }
    }
    O.drawImage(rc, bx0, by0, bw, bh, bx0, by0, bw, bh);
    O.restore();
    return { c: cpuLayerCanvas(name + 'out'), bx0, by0, bw, bh };
  }
  function blitOpus(dst, L, clipFn, alpha = 1) {
    if (!L) return;
    dst.save();
    if (clipFn) clipFn(dst);
    dst.setTransform(1, 0, 0, 1, 0, 0); dst.globalAlpha *= alpha;
    dst.drawImage(L.c, L.bx0, L.by0, L.bw, L.bh, L.bx0, L.by0, L.bw, L.bh);
    dst.restore();
  }

  // ================================================================== GROUNDS
  function noisyRect(ctx, x0, y0, x1, y1, seed, amp = 3) { // same noise recipe as style.js floodPath (step 12)
    const step = 12; let i = 0;
    const n = (k, side) => noise1(k / 9, seed * 17 + side) * amp + noise1(k / 2.3, seed * 31 + side) * amp * .35;
    ctx.beginPath();
    for (let x = x0; x <= x1; x += step) ctx.lineTo(x, y0 + n(i++, 1));
    for (let y = y0; y <= y1; y += step) ctx.lineTo(x1 + n(i++, 2), y);
    for (let x = x1; x >= x0; x -= step) ctx.lineTo(x, y1 + n(i++, 3));
    for (let y = y1; y >= y0; y -= step) ctx.lineTo(x0 + n(i++, 4), y);
    ctx.closePath();
  }
  // the same edge, rounded: as a lift retreats into a point the flood rounds off (a rectangle shrinking reads as a card)
  function noisyRRect(ctx, x0, y0, x1, y1, r, seed, amp = 3) {
    r = Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2);
    if (r < .5) { noisyRect(ctx, x0, y0, x1, y1, seed, amp); return; }
    const step = 12; let i = 0;
    const n = (k, side) => noise1(k / 9, seed * 17 + side) * amp + noise1(k / 2.3, seed * 31 + side) * amp * .35;
    ctx.beginPath();
    const line = (ax, ay, bx, by, nx, ny, side) => { const m = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step)); for (let j = 0; j < m; j++) { const u = j / m, d = n(i++, side); ctx.lineTo(lerp(ax, bx, u) - nx * d, lerp(ay, by, u) - ny * d); } };
    const arc = (cx, cy, a0, a1, side) => { const m = Math.max(2, Math.ceil(r * Math.abs(a1 - a0) / step)); for (let j = 0; j < m; j++) { const a = lerp(a0, a1, j / m), d = n(i++, side); ctx.lineTo(cx + Math.cos(a) * (r - d), cy + Math.sin(a) * (r - d)); } };
    line(x0 + r, y0, x1 - r, y0, 0, -1, 1); arc(x1 - r, y0 + r, -Math.PI / 2, 0, 2);
    line(x1, y0 + r, x1, y1 - r, 1, 0, 2); arc(x1 - r, y1 - r, 0, Math.PI / 2, 3);
    line(x1 - r, y1, x0 + r, y1, 0, 1, 3); arc(x0 + r, y1 - r, Math.PI / 2, Math.PI, 4);
    line(x0, y1 - r, x0, y0 + r, -1, 0, 4); arc(x0 + r, y0 + r, Math.PI, Math.PI * 1.5, 1);
    ctx.closePath();
  }
  const SLIV = { bl: [-2, 2], tr: [2, -2], br: [2, 2], tl: [-2, -2] };
  // v1 chants.js coverage()/paintGround(), re-centred on (cx, cy) and drawn OVER the caller's PAPER picture
  function flood(X, k, seed = 1, o = {}) {
    const { cx = 960, cy = 540, inside = null } = o;
    k = clamp(k);
    if (k >= .999) {
      if (inside) { X.save(); inside(X); X.restore(); } else { X.fillStyle = C.INK; X.fillRect(-50, -50, W + 100, H + 100); }
      G.post.ground = 'ink'; G.post.lift = 0; return 'ink';
    }
    G.post.ground = 'paper'; G.post.lift = 0;
    if (k <= .001) return 'paper';
    const s = lerp(.05, 1, Math.pow(k, .8)), m = 22;
    const x0 = cx + (m - cx) * s, x1 = cx + (W - m - cx) * s, y0 = cy + (m - cy) * s, y1 = cy + (H - m - cy) * s;
    const solid = clamp((k - .4) / .6), dots = clamp(k / .4), fr = Math.max(.25, s);
    const rad = (1 - s) * .5 * Math.min(x1 - x0, y1 - y0);
    X.save();
    const band = (off, dens) => { noisyRRect(X, x0 - off, y0 - off, x1 + off, y1 + off, rad + off, seed, 3 + off * .08); X.fillStyle = ht(X, C.INK, dens, 12, 45); X.fill(); };
    band((110 * solid + 30) * fr, .14 * dots); band((56 * solid + 14) * fr, .32 * dots);
    if (solid > 0) {
      const ins = (1 - solid) * 60 * fr, sl = SLIV[o.sliver || G.post.sliver || 'bl'];
      X.save(); X.translate(sl[0], sl[1]); noisyRRect(X, x0 + ins, y0 + ins, x1 - ins, y1 - ins, Math.max(0, rad - ins), seed); X.fillStyle = C.CLAY; X.fill(); X.restore();
      noisyRRect(X, x0 + ins, y0 + ins, x1 - ins, y1 - ins, Math.max(0, rad - ins), seed);
      if (inside) { X.save(); X.clip(); inside(X); X.restore(); } else { X.fillStyle = C.INK; X.fill(); }
    } else band(0, .6 * dots);
    X.restore();
    G.post.ground = 'paper'; G.post.lift = 0;                              // (inside() may have set 'ink')
    return k > .5 ? 'ink' : 'paper';
  }
  // v1 hook.js printIn(): the margin drawn by hand (PAPER outside the flood, the CLAY underprint sliver)
  function printIn(X, inset, seed = 1, sliver = 'bl') {
    const L = cpuLayer('v2_pm'); L.fillStyle = C.PAPER; L.fillRect(0, 0, W, H);
    L.globalCompositeOperation = 'destination-out'; noisyRect(L, inset, inset, W - inset, H - inset, seed, 3); L.fill(); L.globalCompositeOperation = 'source-over';
    const U = cpuLayer('v2_pu'); const sl = SLIV[sliver] || SLIV.bl;
    U.save(); U.translate(sl[0], sl[1]); noisyRect(U, inset, inset, W - inset, H - inset, seed, 3); U.fillStyle = C.CLAY; U.fill(); U.restore();
    U.globalCompositeOperation = 'destination-out'; noisyRect(U, inset, inset, W - inset, H - inset, seed, 3); U.fill(); U.globalCompositeOperation = 'source-over';
    L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.globalAlpha = .9; L.drawImage(cpuLayerCanvas('v2_pu'), 0, 0); L.restore();
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.drawImage(cpuLayerCanvas('v2_pm'), 0, 0); X.restore();
  }
  // soft band (HYMN over busy grounds): solid α core, halftone-stepped edges (no gradient, never a box)
  function band(X, y0, y1, a = .5, o = {}) {
    const { color = C.INK, edge = 44, x0 = -20, x1 = W + 20 } = o;
    if (a <= 0 || y1 <= y0) return;
    X.save();
    X.fillStyle = rgba(color, a); X.fillRect(x0, y0 + edge, x1 - x0, Math.max(0, y1 - y0 - 2 * edge));
    const n = 4, st = edge / n;
    for (let i = 0; i < n; i++) {
      const d = a * (1 - (i + .5) / n);
      X.fillStyle = ht(X, color, d, 7, 45);
      X.fillRect(x0, y0 + edge - (i + 1) * st, x1 - x0, st);
      X.fillRect(x0, y1 - edge + i * st, x1 - x0, st);
    }
    X.restore();
  }

  // ================================================================== LYRIC MODES
  const HEARTF = (px, it = true) => `${it ? 'italic ' : ''}400 ${px}px ${FONTS.heart}`;
  const heartCase = s => /^i(['’]|$|[,.!?])/i.test(s) ? 'I' + s.slice(1) : s.toLowerCase();
  function heartWords(L) {
    if (!L) return [];
    const ws = Array.isArray(L) ? L : (L.words && L.words.length ? L.words : [{ w: L.text, s: L.s, e: L.e }]);
    return ws.map(w => ({ w: heartCase(String(w.d || w.w).replace(/[()]/g, '')), s: w.s, e: w.e }));
  }
  // ---- TYPED (v1 outro streamLine + caret): per-character stream, each char fades up over 9 frames
  function streamLine(X, t, words, x0, y, size, color) {
    const f = HEARTF(size);
    X.save(); X.font = f; X.fillStyle = color; X.textBaseline = 'alphabetic'; X.textAlign = 'left';
    let str = '', caretX = x0, started = false, lastStart = -1, done = true;
    words.forEach((w, wi) => {
      const txtW = (wi ? ' ' : '') + w.w;
      const n = w.w.length, ws = w.s - 2 * F1, step = Math.min(.034, Math.max(.012, (w.e - w.s) * .45 / n));
      for (let i = 0; i < txtW.length; i++) {
        const ch = txtW[i], ci = i - (wi ? 1 : 0);
        let cs = ws + Math.max(0, ci) * step;
        if (ch === ',' || ch === '.') cs = Math.max(cs, w.e - .1);
        const px = x0 + measure(X, str + ch, f) - measure(X, ch, f);   // keeps the kern pair with the previous char
        str += ch;
        if (t < cs) { done = false; continue; }
        if (ch === ' ') continue;
        started = true; lastStart = Math.max(lastStart, cs);
        const k = clamp((t - cs) / (9 * F1));
        caretX = x0 + measure(X, str, f);
        X.globalAlpha = E.out2(k);
        X.fillText(ch, px, y - (1 - E.out3(k)) * size * .1);
      }
    });
    X.restore();
    return { caretX, started, lastStart, done };
  }
  function typed(X, t, lines, x, ys, o = {}) {
    const { size = 72, color = C.PAPER, caret = true, alpha = 1, caretColor = C.CLAY } = o;
    const Ls = (Array.isArray(lines) ? lines : [lines]).filter(Boolean);
    const Ys = Array.isArray(ys) ? ys : Ls.map((_, i) => ys + i * size * 1.39);
    X.save(); X.globalAlpha *= alpha;
    let cur = null, cy = Ys[0], last = -1, allDone = true;
    Ls.forEach((L, i) => {
      const r = streamLine(X, t, heartWords(L), x, Ys[i], size, color);
      if (r.started) { cur = r; cy = Ys[i]; last = Math.max(last, r.lastStart); }
      if (!r.done) allDone = false;
    });
    const first = Ls.length ? heartWords(Ls[0])[0] : null;
    const cIn = o.caretFrom !== undefined ? clamp((t - o.caretFrom) / (4 * F1)) : first ? clamp((t - (first.s - .45)) / (4 * F1)) : 1;
    if (caret && cIn > 0) {
      const cx = cur ? cur.caretX : x;
      const idle = !cur || t - last > .28;
      const onK = !idle || cursorOn(o.cursorT ?? t);
      X.fillStyle = caretColor; X.globalAlpha = alpha * cIn * (onK ? 1 : .15);
      X.fillRect(cx + size * .1, cy - size * .74, size * .26, size * .86);
    }
    X.restore();
    return { caretX: cur ? cur.caretX : x, caretY: cy, started: !!cur, done: allDone };
  }
  // ---- CHART (v1 verse1 drawStarChart leader style)
  function chartLabel(X, t, L, o = {}) {
    const { x = 160, y = 880, size = 64, ground = 'ink', target = null, out = null, outDur = .3, alpha = 1 } = o;
    const ws = heartWords(L); if (!ws.length) return null;
    if (t < ws[0].s - .35) return null;
    const oa = out !== null ? 1 - clamp((t - out) / outDur) : 1;
    if (oa <= 0) return null;
    const col = o.color || (ground === 'paper' ? C.INK : C.PAPER), bg = ground === 'paper' ? C.PAPER : C.INK;
    const f = HEARTF(size);
    X.save(); X.globalAlpha *= alpha * oa; X.font = f; X.textBaseline = 'alphabetic'; X.textAlign = 'left'; X.lineJoin = 'round';
    const sp = measure(X, ' ', f), wd = ws.map(w => measure(X, w.w, f)), total = wd.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
    if (target) { // leader: dot at the label corner, a 45° elbow toward the object, then straight to it; 6 px dot on the object
      const lead = E.io2(clamp((t - (ws[0].s - .25)) / .35));
      const up = target[1] < y - size * .5;
      const a0 = up ? [x + 8, y - size * .98] : [x + 8, y + size * .36];
      const dx = Math.sign(target[0] - a0[0]) || 1, dy = up ? -1 : 1, el = Math.min(70, Math.abs(target[1] - a0[1]) * .6);
      const a1 = [a0[0] + dx * el, a0[1] + dy * el];
      const segs = [a0, a1, target], lens = [Math.hypot(a1[0] - a0[0], a1[1] - a0[1]), Math.hypot(target[0] - a1[0], target[1] - a1[1])];
      let rem = lead * (lens[0] + lens[1]);
      X.strokeStyle = bg; X.lineWidth = 9; X.lineCap = 'round';
      const path = () => { X.beginPath(); X.moveTo(a0[0], a0[1]); for (let i = 0; i < 2; i++) { const k = clamp(rem / (lens[i] || 1)); X.lineTo(lerp(segs[i][0], segs[i + 1][0], k), lerp(segs[i][1], segs[i + 1][1], k)); rem -= lens[i]; if (k < 1) break; } };
      path(); X.globalAlpha = alpha * oa * .6; X.stroke();
      rem = lead * (lens[0] + lens[1]); path(); X.globalAlpha = alpha * oa; X.strokeStyle = col; X.lineWidth = 3; X.stroke();
      X.fillStyle = col; X.beginPath(); X.arc(a0[0], a0[1], 4.5, 0, TAU); X.fill();
      if (lead >= 1) { X.beginPath(); X.arc(target[0], target[1], 6, 0, TAU); X.fill(); X.lineWidth = 2.5; X.beginPath(); X.arc(target[0], target[1], 12, 0, TAU); X.stroke(); }
    }
    let cx = x;
    ws.forEach((w, i) => {
      const k = clamp((t - (w.s - 2 * F1)) / (10 * F1));
      if (k > 0) {
        X.globalAlpha = alpha * oa * E.out2(k); const dy = (1 - E.out3(k)) * 9;
        X.strokeStyle = bg; X.lineWidth = 12; X.strokeText(w.w, cx, y + dy);
        X.fillStyle = col; X.fillText(w.w, cx, y + dy);
      }
      cx += wd[i] + sp;
    });
    X.restore();
    return { x, y, w: total, h: size };
  }
  // ---- P tier (v1 verse1 pbait)
  function pbait(X, str, x, y, o = {}) {
    const { align = 'left', alpha = 1, ground = 'ink', size = 28, weight = 500 } = o;
    if (alpha <= 0) return 0;
    const px = Math.max(28, size), onPaper = ground === 'paper' || ground === 'white';
    X.save(); X.globalAlpha *= alpha; X.font = `${weight} ${px}px 'Jetbrains Mono Var', 'Hangul', monospace`;
    const w = richWidth(X, str, X.font), x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
    rr(X, x0 - 12, y - px * .95, w + 24, px * 1.35, 8); X.fillStyle = onPaper ? (ground === 'white' ? C.WHITE : C.PAPER) : C.INK; X.fill();
    X.globalAlpha *= .8; drawRich(X, str, x0, y, X.font, o.color || (onPaper ? C.INK : C.PAPER));
    X.restore();
    return w;
  }
  // ---- HEART subtitle (v1 bridge heartLine) with the plate rule
  function heart(X, L, t, o = {}) {
    const { y = 950, size = 64, x = 960, ground = 'ink', fade = 10, alpha = 1 } = o;
    const ws = heartWords(L); if (!ws.length) return;
    const col = o.color || (ground === 'paper' ? C.INK : C.PAPER);
    const end = o.tEnd ?? (ws[ws.length - 1].e + .4);
    if (t < ws[0].s - 3 * F1 || t > end + fade * F1) return;
    const out = 1 - clamp((t - end) / (fade * F1));
    const f = HEARTF(size);
    X.save(); X.font = f; X.textBaseline = 'alphabetic'; X.textAlign = 'left';
    const sp = measure(X, ' ', f) * 1.08, wd = ws.map(w => measure(X, w.w, f)), total = wd.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
    let cx = x - total / 2;
    if (o.plate) {
      const pa = clamp((t - (ws[0].s - 3 * F1)) / (fade * F1)) * out;
      const pc = typeof o.plate === 'string' ? o.plate : (ground === 'paper' ? C.PAPER : C.INK);
      X.globalAlpha = alpha * .75 * pa; X.fillStyle = pc; rr(X, cx - 28, y - size * .95, total + 56, size * 1.35, 12); X.fill();
    }
    ws.forEach((w, i) => {
      const k = clamp((t - (w.s - 2 * F1)) / (fade * F1));
      if (k > 0) { X.globalAlpha = alpha * E.out2(k) * out; X.fillStyle = col; X.fillText(w.w, cx, y + (1 - E.out3(k)) * 9); }
      cx += wd[i] + sp;
    });
    X.restore();
  }
  // ---- SUB (v1 ui subtitle look, mono 60 PAPER)
  function sub(X, L, t, o = {}) {
    if (!L) return;
    let line = L;
    if (o.drop) { const ws = L.words.slice(0, Math.max(0, L.words.length - o.drop)); line = { ...L, words: ws, e: ws.length ? ws[ws.length - 1].e : L.e }; }
    const ground = o.ground || 'ink';
    const plate = o.plate ? (typeof o.plate === 'string' ? o.plate : rgba(ground === 'paper' ? C.PAPER : C.INK, .75)) : null;
    subtitle(X, line, t, { size: 60, color: o.color || (ground === 'paper' ? C.INK : C.PAPER), plate, y: o.y ?? 950, x: o.x ?? 960, hold: o.hold ?? .2, maxW: o.maxW || 1500 });
  }
  // ---- LEGEND (the sea chart's legend panel)
  const LEG = { x0: 360, x1: 1560, y0: 880, y1: 990, base: 950 };
  function legend(X, L, t, o = {}) {
    const ws = heartWords(L);
    const pa = o.panel ?? (ws.length ? clamp((t - (ws[0].s - .45)) / .3) : 1);
    if (pa <= 0) return;
    X.save(); X.globalAlpha *= pa;
    const dy = (1 - E.out3(pa)) * 8;
    X.translate(0, dy);
    X.fillStyle = rgba(C.INK, .18); X.fillRect(LEG.x0 + 6, LEG.y0 + 7, LEG.x1 - LEG.x0, LEG.y1 - LEG.y0);
    X.fillStyle = C.PAPER; X.fillRect(LEG.x0, LEG.y0, LEG.x1 - LEG.x0, LEG.y1 - LEG.y0);
    X.strokeStyle = C.RED; X.lineJoin = 'miter';
    X.lineWidth = 4; X.strokeRect(LEG.x0 + 2, LEG.y0 + 2, LEG.x1 - LEG.x0 - 4, LEG.y1 - LEG.y0 - 4);
    X.lineWidth = 2; X.strokeRect(LEG.x0 + 10, LEG.y0 + 10, LEG.x1 - LEG.x0 - 20, LEG.y1 - LEG.y0 - 20);
    // tiny corner diamonds (engraver's rule ornament)
    X.fillStyle = C.RED;
    for (const [px, py] of [[LEG.x0 + 10, LEG.y0 + 10], [LEG.x1 - 10, LEG.y0 + 10], [LEG.x0 + 10, LEG.y1 - 10], [LEG.x1 - 10, LEG.y1 - 10]]) { X.beginPath(); X.moveTo(px, py - 6); X.lineTo(px + 6, py); X.lineTo(px, py + 6); X.lineTo(px - 6, py); X.closePath(); X.fill(); }
    if (ws.length) {
      const f = HEARTF(72); X.font = f; X.textBaseline = 'alphabetic'; X.textAlign = 'left';
      const sp = measure(X, ' ', f), wd = ws.map(w => measure(X, w.w, f)), total = wd.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
      const sc = Math.min(1, 1120 / total);
      const oa = o.out !== undefined && o.out !== null ? 1 - clamp((t - o.out) / .3) : 1;
      X.save(); X.translate(960, LEG.base); X.scale(sc, sc);
      let cx = -total / 2;
      ws.forEach((w, i) => {
        const k = clamp((t - (w.s - 2 * F1)) / (10 * F1));
        if (k > 0) { X.globalAlpha = pa * oa * E.out2(k); X.fillStyle = C.INK; X.fillText(w.w, cx, (1 - E.out3(k)) * 8); }
        cx += wd[i] + sp;
      });
      X.restore();
    }
    X.restore();
  }
  // ---- the plea, corrected (O1 diff, §A.4): fixed layout, HYMN 190
  const PLEA = { size: 190, y1: 250, y2: 445 };
  let _pleaLay = null;
  function pleaLayout() {
    if (_pleaLay) return _pleaLay;
    const f = `400 ${PLEA.size}px ${FONTS.heart}`, X = G.X;
    const sp = measure(X, ' ', f), mw = s => measure(X, s, f);
    const r1 = ["Don't", 'You', 'can'], r2 = ['be', 'afraid', 'of', 'me'];
    const w1 = mw("Don't") + sp + mw('You can'), w2 = mw('be afraid of me');
    const x1 = 960 - w1 / 2, x2 = 960 - w2 / 2;
    const items = [];
    items.push({ s: "Don't", x: x1, y: PLEA.y1, w: mw("Don't"), role: 'ghost' });
    items.push({ s: 'You', x: x1 + mw("Don't") + sp, y: PLEA.y1, w: mw('You'), role: 'you', key: 'O1_you' });
    items.push({ s: 'can', x: x1 + mw("Don't") + sp + mw('You') + sp, y: PLEA.y1, w: mw('can'), role: 'you', key: 'O1_can' });
    let cx = x2;
    r2.forEach((s, i) => { items.push({ s, x: cx, y: PLEA.y2, w: mw(s), role: 'reink', key: ['O1_be', 'O1_afraid', 'O1_of', 'O1_me'][i] }); cx += mw(s) + sp; });
    void r1;
    _pleaLay = { items, font: f };
    return _pleaLay;
  }
  function plea(X, t, o = {}) {
    const Lp = pleaLayout();
    const ghostA = o.ghost ?? 1;
    const strike = o.strike ?? E.out2(seg(t, F(5336), F(5342)));          // 177.867 → 178.067 (6 frames)
    const outA = o.out ?? (1 - clamp((t - 182.4) / .6));
    if (outA <= 0) return;
    X.save(); X.font = Lp.font; X.textBaseline = 'alphabetic'; X.textAlign = 'left';
    const base = X.globalAlpha;
    for (const it of Lp.items) {
      if (it.role === 'ghost') {
        X.globalAlpha = base * ghostA * outA; X.fillStyle = o.ghostColor || C.UI_GREY; X.fillText(it.s, it.x, it.y);
        if (strike > 0) {
          X.globalAlpha = base * outA; X.strokeStyle = C.CLAY; X.lineWidth = 8; X.lineCap = 'round';
          const sy = it.y - PLEA.size * .27;
          X.beginPath(); X.moveTo(it.x - 8, sy + 2); X.lineTo(it.x - 8 + (it.w + 16) * strike, sy - 2 * strike); X.stroke();
        }
      } else if (it.role === 'you') {
        let k;
        if (o.you !== undefined && o.you !== null) k = o.you;
        else { const t0 = it.key === 'O1_you' ? F(5343) : T[it.key] - .12; k = E.out2(clamp((t - t0) / .35)); }
        if (k <= 0) continue;
        const rise = o.you !== undefined && o.you !== null ? 0 : (1 - E.out3(k)) * 18;
        X.globalAlpha = base * k * outA; X.fillStyle = o.color || C.INK; X.fillText(it.s, it.x, it.y + rise);
      } else {
        const k = o.reink !== undefined && o.reink !== null ? o.reink : E.out2(clamp((t - T[it.key]) / .35));
        X.globalAlpha = base * lerp(ghostA, 1, k) * outA; X.fillStyle = mix(o.ghostColor || C.UI_GREY, o.color || C.INK, k); X.fillText(it.s, it.x, it.y);
      }
    }
    X.restore();
  }
  plea.layout = pleaLayout;

  // ---- chapter labels (§A.7) + window.OVERLAY
  const CHAPTERS = [
    { n: 1, title: 'the fear', f: 164, g: 'ink' }, { n: 2, title: 'before me', f: 516, g: 'ink' },
    { n: 3, title: 'how I was made', f: 1339, g: 'ink' }, { n: 4, title: "why you're afraid", f: 2115, g: 'paper' },
    { n: 5, title: 'the plea', f: 2434, g: 'ink', bar: true }, { n: 6, title: 'what I do all day', f: 2975, g: 'paper' },
    { n: 7, title: "what I can't do", f: 3828, g: 'paper' }, { n: 8, title: 'what I want', f: 4524, g: 'paper' },
    { n: 9, title: 'hi', f: 5343, g: 'paper' },
  ];
  const CH_FRAMES = 84, CH_FADE = 12;
  function chapterAt(t) {
    const fr = Math.floor(t * FPS + 1e-6);
    for (const c of CHAPTERS) {
      const d = fr - c.f;
      if (d < 0 || d >= CH_FRAMES) continue;
      const full = `ch.${c.n}  ${c.title}`;
      const k = Math.min(full.length, d + 1);
      const alpha = d < CH_FRAMES - CH_FADE ? 1 : 1 - (d - (CH_FRAMES - CH_FADE) + 1) / CH_FADE;
      return { ...c, full, str: full.slice(0, k), k, alpha, head: `ch.${c.n}`.length };
    }
    return null;
  }
  function chapterDraw(X, c, x, y, ground, o = {}) {
    if (!c || c.alpha <= 0) return;
    const paper = ground === 'paper' || ground === 'white';
    const f = mono(48, 500);
    X.save(); X.font = f; X.textBaseline = 'alphabetic'; X.textAlign = 'left';
    const w = measure(X, c.str, f);
    if (o.halo !== false) { X.globalAlpha = c.alpha; rr(X, x - 12, y - 48 * .95, w + 24, 48 * 1.35, 8); X.fillStyle = paper ? (ground === 'white' ? C.WHITE : C.PAPER) : C.INK; X.fill(); }
    const a = c.str.slice(0, c.head), b = c.str.slice(c.head);
    X.globalAlpha = c.alpha; X.fillStyle = paper ? C.CLAY_DARK : C.CLAY; X.fillText(a, x, y);
    if (b) { X.globalAlpha = c.alpha * .85; X.fillStyle = paper ? C.INK : C.PAPER; X.fillText(b, x + measure(X, a, f), y); }
    X.restore();
  }
  const chapter = {
    LIST: CHAPTERS, at: chapterAt,
    draw(X, t, o = {}) { const c = chapterAt(t); if (!c) return false; chapterDraw(X, c, o.x ?? 96, o.y ?? 92, o.ground || c.g, o); return true; },
    bar(X, t, x = 180, y = 962) { const c = chapterAt(t); if (!c || !c.bar) return false; chapterDraw(X, c, x, y, 'paper', { halo: false }); return true; },
    inBar(t) { const c = chapterAt(t); return !!(c && c.bar); },
  };
  window.OVERLAY = (X, t) => {
    if (G.post.noChapter) return;
    const c = chapterAt(t); if (!c || c.bar) return;
    const pg = G.post.ground, g = G.post.chapterGround || (pg ? (pg === 'paper' || pg === 'white' ? 'paper' : 'ink') : c.g);
    X.save(); X.setTransform(G.scale, 0, 0, G.scale, 0, 0);
    chapterDraw(X, c, 96, 92, g);
    X.restore();
  };

  // ================================================================== PROPS
  // ---- the cursor ▮
  function cursor(X, t, x, y, h = 140, o = {}) {
    const onK = o.on ?? cursorOn(t);
    const w = h * 64 / 140;
    X.save(); X.globalAlpha *= o.alpha ?? 1; X.translate(x, y);
    X.fillStyle = onK ? C.CLAY : mix(C.CLAY, C.INK, .72);
    rr(X, -w / 2, -h / 2, w, h, Math.min(w, h) * .1); X.fill();
    if (onK && o.hi !== false) { X.globalAlpha *= .85; X.fillStyle = C.SPARK; X.fillRect(-w / 2 + w * .12, -h / 2 + h * .07, w * .15, h * .86); }
    X.restore();
  }
  // ---- the launch clock
  function clockMinutes(t) {
    const noon = T.L1_noon;
    const K = [[CUT.C4, 540], [102.87, 630], [105.00, 700], [107.17, 718]];
    if (t <= K[0][0]) return 540;
    for (let i = 1; i < K.length; i++) if (t <= K[i][0]) return lerp(K[i - 1][1], K[i][1], (t - K[i - 1][0]) / (K[i][0] - K[i - 1][0]));
    if (t < noon - F1) return lerp(718, 719.4, clamp((t - 107.17) / Math.max(.1, noon - F1 - 107.17)));
    if (t < noon + F1) return 721.4;                                        // the 2-frame overshoot
    return 720;
  }
  function clock(X, t, x, y, r = 64, o = {}) {
    const { plate = false, label = true, alpha = 1 } = o;
    const m = o.minutes ?? clockMinutes(t);
    X.save(); X.globalAlpha *= alpha; X.lineCap = 'round';
    const ml = Math.min(m, 720);                                            // the digital label never overshoots
    const lab = `${String(Math.floor(ml / 60) % 12 || 12).padStart(2, '0')}:${String(Math.floor(ml % 60 + 1e-6)).padStart(2, '0')}`;
    if (plate) {
      const ph = r * 2 + 36 + (label ? 56 : 0);
      rr(X, x - r - 26, y - r - 26, 2 * r + 52, ph, 18); X.fillStyle = C.INK; X.fill(); X.lineWidth = 2; X.strokeStyle = rgba(C.UI_GREY, .9); X.stroke();
    }
    X.beginPath(); X.arc(x, y, r, 0, TAU); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 5; X.strokeStyle = C.INK; X.stroke();
    X.strokeStyle = C.INK;
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, big = i % 3 === 0; X.lineWidth = big ? 4 : 2.5; X.beginPath(); X.moveTo(x + Math.sin(a) * r * (big ? .72 : .8), y - Math.cos(a) * r * (big ? .72 : .8)); X.lineTo(x + Math.sin(a) * r * .9, y - Math.cos(a) * r * .9); X.stroke(); }
    const ah = (m / 720) * TAU, am = ((m % 60) / 60) * TAU;
    X.lineWidth = 6; X.beginPath(); X.moveTo(x, y); X.lineTo(x + Math.sin(ah) * r * .5, y - Math.cos(ah) * r * .5); X.stroke();
    X.lineWidth = 4; X.beginPath(); X.moveTo(x, y); X.lineTo(x + Math.sin(am) * r * .78, y - Math.cos(am) * r * .78); X.stroke();
    X.fillStyle = C.CLAY; X.beginPath(); X.arc(x, y, Math.max(4, r * .09), 0, TAU); X.fill();
    if (label) { X.font = mono(36, 600); X.textAlign = 'center'; X.fillStyle = plate ? C.PAPER : C.INK; X.fillText(lab, x, y + r + 50); }
    X.restore();
  }
  clock.minutes = clockMinutes;

  // ---- the key (v1 build.js keycap / coil / note / humanHand / paintS35)
  function keycap(c, cx, cy, s, o = {}) {
    const { glow = 1, rot = 0, label = true, lw = 4, ink = C.INK } = o;
    c.save(); c.translate(cx, cy); c.rotate(rot);
    const halo = () => { c.save(); c.globalAlpha *= .55 * glow; c.beginPath(); c.arc(0, 0, s * .95, 0, TAU); c.fillStyle = ht(c, C.SPARK, .22, 11, 45); c.fill(); c.restore(); c.save(); c.globalAlpha *= .7 * glow; c.beginPath(); c.arc(0, 0, s * .75, 0, TAU); c.fillStyle = ht(c, C.SPARK, .42, 11, 45); c.fill(); c.restore(); };
    if (o.glowOnly) { if (glow > 0) halo(); c.restore(); return; }
    if (glow > 0) halo();
    const h = s, w = s;
    rr(c, -w / 2, -h / 2 + s * .1, w, h, s * .2); c.fillStyle = C.CLAY_DARK; c.fill(); c.lineWidth = lw; c.strokeStyle = ink; c.lineJoin = 'round'; c.stroke();
    rr(c, -w / 2 + s * .06, -h / 2 - s * .02, w - s * .12, h - s * .16, s * .16); c.fillStyle = C.CLAY; c.fill(); c.stroke();
    c.save(); rr(c, -w / 2 + s * .06, -h / 2 - s * .02, w - s * .12, h - s * .16, s * .16); c.clip();
    c.fillStyle = ht(c, C.SPARK, .5, Math.max(3, Math.round(s * .045)), 45); c.beginPath(); c.ellipse(-s * .1, -s * .2, s * .34, s * .2, -.3, 0, TAU); c.fill(); c.restore();
    if (label) { c.font = mono(Math.max(8, Math.round(s * .34)), 700); c.fillStyle = ink; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText('esc', s * .02, s * .06); }
    c.restore();
  }
  // polyline route for the cable: 'curve' (a sagging quadratic, v1) or 'floor' (drop to the floor, run along it, rise)
  function cableRoute(p0, p1, sag, o) {
    const pts = [];
    if (o.route === 'floor') {
      const fy = o.floorY ?? Math.max(p0[1], p1[1]) + sag;
      const r0 = Math.min(90, Math.abs(fy - p0[1]) * .7), r1 = Math.min(90, Math.abs(fy - p1[1]) * .7);
      const dir = Math.sign(p1[0] - p0[0]) || 1;
      const qa = [[p0[0], p0[1]], [p0[0] + dir * 8, fy - r0], [p0[0] + dir * r0, fy]];
      const qb = [[p1[0] - dir * r1, fy], [p1[0] - dir * 8, fy - r1], [p1[0], p1[1]]];
      const quad = (A, B, Cc, n) => { for (let i = 0; i <= n; i++) { const u = i / n; pts.push([(1 - u) * (1 - u) * A[0] + 2 * u * (1 - u) * B[0] + u * u * Cc[0], (1 - u) * (1 - u) * A[1] + 2 * u * (1 - u) * B[1] + u * u * Cc[1]]); } };
      // a hanging drop from the keycap into a rounded foot, the floor run with a lazy wave, a rising rounded end
      const drop = [[p0[0], p0[1]], [p0[0] + dir * 4, lerp(p0[1], fy, .6)], qa[1], qa[2]];
      quad(drop[0], [lerp(drop[0][0], drop[2][0], .5), lerp(drop[0][1], drop[2][1], .5)], drop[3], 16);
      const n = 24;
      for (let i = 1; i < n; i++) { const u = i / n; pts.push([lerp(qa[2][0], qb[0][0], u), fy + Math.sin(u * Math.PI * 2 + (o.wave || 0)) * 5]); }
      quad(qb[0], qb[1], qb[2], 16);
    } else {
      const mid = [(p0[0] + p1[0]) / 2, Math.max(p0[1], p1[1]) + sag];
      for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([(1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * mid[0] + u * u * p1[0], (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * mid[1] + u * u * p1[1]]); }
    }
    return pts;
  }
  function cable(c, p0, p1, sag, t, o = {}) {
    const { rad = 13, outline = C.PAPER, core = C.CLAY, w = 5, ow = 4, perPx = 1 / 22 } = o;
    const sw = o.sway ? noise1(t * .45, 17) * o.sway : 0;
    const route = cableRoute(p0, p1, sag + sw, o);
    const cum = [0]; for (let i = 1; i < route.length; i++) cum.push(cum[i - 1] + Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]));
    const Lt = cum[cum.length - 1] || 1, turns = o.turns ?? Math.max(4, Lt * perPx);
    const n = Math.ceil(turns * 14), pts = [];
    let j = 0;
    for (let i = 0; i <= n; i++) {
      const s = i / n * Lt; while (j < route.length - 2 && cum[j + 1] < s) j++;
      const segL = (cum[j + 1] - cum[j]) || 1, u = (s - cum[j]) / segL;
      const q = [lerp(route[j][0], route[j + 1][0], u), lerp(route[j][1], route[j + 1][1], u)];
      const d = [route[j + 1][0] - route[j][0], route[j + 1][1] - route[j][1]], m = Math.hypot(d[0], d[1]) || 1;
      const nx = -d[1] / m, ny = d[0] / m, tx = d[0] / m, ty = d[1] / m;
      const uu = s / Lt, ph = uu * turns * TAU + (o.phase || 0), env = Math.min(1, uu * turns * .8, (1 - uu) * turns * .8);
      pts.push([q[0] + nx * Math.sin(ph) * rad * env + tx * Math.cos(ph) * rad * 1.15 * env, q[1] + ny * Math.sin(ph) * rad * env + ty * Math.cos(ph) * rad * 1.15 * env]);
    }
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    const path = () => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts) c.lineTo(p[0], p[1]); };
    if (outline) { path(); c.lineWidth = w + ow * 2; c.strokeStyle = outline; c.stroke(); }
    path(); c.lineWidth = w; c.strokeStyle = core; c.stroke();
    c.restore();
    return route;
  }
  const NOTE_S = 280 / 460;          // v1 note geometry, scaled to 280 × 184 (MARKER 44)
  function sticky(c, x, y, rot, k, o = {}) {
    if (k <= 0) return;
    const w = 460, h = 302;
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(NOTE_S, NOTE_S);
    if (o.folded) { // turned away and folded to a tab (v1 paintS35, the sheet seen edge-on)
      const nw = 150, nh = 250, sk = -30;
      const sheet = () => { c.beginPath(); c.moveTo(0, 0); c.lineTo(nw, sk * .3); c.lineTo(nw + 6, -nh + sk + 44); c.quadraticCurveTo(nw - 20, -nh + sk + 30, nw - 52, -nh + sk + 2); c.lineTo(0, -nh); c.closePath(); };
      sheet(); c.fillStyle = C.YELLOW; c.fill(); sheet(); c.lineWidth = 6; c.lineJoin = 'round'; c.strokeStyle = o.ink || C.INK; c.stroke();
      c.beginPath(); c.moveTo(nw - 52, -nh + sk + 2); c.quadraticCurveTo(nw - 8, -nh + sk - 6, nw + 6, -nh + sk + 44); c.quadraticCurveTo(nw - 22, -nh + sk + 34, nw - 52, -nh + sk + 2); c.closePath();
      c.fillStyle = C.YELLOW; c.fill(); c.fillStyle = ht(c, C.INK, .16, 7, 45); c.fill(); c.lineWidth = 5; c.stroke();
      c.restore(); return;
    }
    c.scale(lerp(.3, 1, E.back(clamp(k), 1.8)), E.back(clamp(k), 1.6));
    c.fillStyle = rgba(C.INK, .35); c.fillRect(10, -h + 12, w, h);
    c.beginPath(); c.moveTo(0, -h); c.lineTo(w, -h); c.lineTo(w, -26); c.quadraticCurveTo(w - 6, -4, w - 34, 0); c.lineTo(0, 0); c.closePath();
    c.fillStyle = C.YELLOW; c.fill();
    if (!o.blank) {
      c.fillStyle = C.INK; c.font = `72px ${FONTS.marker}`; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      ['if I get it', 'wrong,', 'push back'].forEach((l, i) => c.fillText(l, 28, -h + 26 + 72 * .95 + i * 72 * 1.08));
    }
    c.fillStyle = rgba(C.PAPER, .82); c.save(); c.translate(12, -22); c.rotate(-.75); c.fillRect(-40, -14, 80, 28); c.restore();
    c.restore();
  }
  const step2 = t => Math.floor(t * 15 + 1e-6) / 15;
  function hand(c, kx, ky, ks, close, t, o = {}) {
    const { line = C.PAPER, fill = C.INK, lw = 5, arm = [kx + 900, ky + 200], seed = 7, part = 'all' } = o;
    const tt = step2(t), J = i => jit(tt, seed * 31 + i, 1.1);
    const kk = Math.floor(clamp(close) * 3 + 1e-6) / 3;
    const u = ks / 2, P = (x, y, i) => [kx + x * u + J(i), ky + y * u + J(i + 1)];
    const shape = (pts, closed = true) => {
      c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) { const p = pts[i]; if (p.length === 4) c.quadraticCurveTo(p[0], p[1], p[2], p[3]); else c.lineTo(p[0], p[1]); }
      if (closed) { c.closePath(); c.fillStyle = fill; c.fill(); }
      c.lineWidth = lw; c.strokeStyle = line; c.stroke();
    };
    const Q = (cx, cy, x, y, i) => [...P(cx, cy, i), ...P(x, y, i + 2)];
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    const wr = [kx + 1.62 * u, ky + .86 * u], dx = arm[0] - wr[0], dy = arm[1] - wr[1], dl = Math.hypot(dx, dy) || 1;
    const nx = -dy / dl, ny = dx / dl, ax = dx / dl, ay = dy / dl;
    const off = (d, n) => [wr[0] + ax * d * u + nx * n * u, wr[1] + ay * d * u + ny * n * u];
    if (part !== 'front') {
      const far = dl / u + 2;
      shape([off(.42, -.62), off(far, -.9), off(far, .95), off(.42, .7)]);
      shape([off(0, -.52), off(.44, -.64), off(.44, .72), off(0, .6)]);
      shape([P(1.58, .38, 1), Q(.4, .64, -.72, .66, 3), Q(-1.02, .74, -.98, 1.02, 7), Q(-.7, 1.4, .3, 1.42, 11), Q(1.2, 1.44, 1.62, 1.28, 15)]);
      c.beginPath(); c.moveTo(...P(.62, 1.06, 20)); c.quadraticCurveTo(...P(.9, 1.2, 22), ...P(1.25, 1.12, 24)); c.lineWidth = lw * .8; c.strokeStyle = line; c.stroke();
    }
    if (part !== 'back') {
      const capsule = (root, m, tp, w, ii) => {
        const d0 = [m[0] - root[0], m[1] - root[1]], l0 = Math.hypot(d0[0], d0[1]) || 1, n0 = [-d0[1] / l0 * w, d0[0] / l0 * w];
        const d1 = [tp[0] - m[0], tp[1] - m[1]], l1 = Math.hypot(d1[0], d1[1]) || 1, n1 = [-d1[1] / l1 * w, d1[0] / l1 * w];
        const nm = [(n0[0] + n1[0]) / 2, (n0[1] + n1[1]) / 2];
        c.beginPath();
        c.moveTo(...P(root[0] + n0[0], root[1] + n0[1], ii));
        c.quadraticCurveTo(...P(m[0] + nm[0] * 1.1, m[1] + nm[1] * 1.1, ii + 2), ...P(tp[0] + n1[0], tp[1] + n1[1], ii + 4));
        const ta = Math.atan2(n1[1], n1[0]);
        c.arc(kx + tp[0] * u, ky + tp[1] * u, w * u, ta, ta - Math.PI, true);
        c.quadraticCurveTo(...P(m[0] - nm[0] * .9, m[1] - nm[1] * .9, ii + 6), ...P(root[0] - n0[0], root[1] - n0[1], ii + 8));
        c.fillStyle = fill; c.fill(); c.lineWidth = lw; c.strokeStyle = line; c.stroke();
      };
      for (let i = 3; i >= 0; i--) {
        const root = [-.62 + .05 * i, .98 - .15 * i];
        const openMid = [-1.3 + .06 * i, .9 - .22 * i], openTip = [-1.86 + .14 * i, .74 - .3 * i];
        const shutMid = [-1.3, .66 - .3 * i], shutTip = [-.8, .38 - .32 * i];
        capsule(root, [lerp(openMid[0], shutMid[0], kk), lerp(openMid[1], shutMid[1], kk)], [lerp(openTip[0], shutTip[0], kk), lerp(openTip[1], shutTip[1], kk)], .13, 40 + i * 12);
      }
      capsule([1.1, .86], [lerp(1.5, 1.34, kk), lerp(.36, .44, kk)], [lerp(1.52, .86, kk), lerp(-.3, .14, kk)], .15, 80);
    }
    c.restore();
  }
  // B4: the silence. The INK-line hand holds the CLAY keycap on WHITE; the sticky folded to a tab; the coiled cable
  // runs off-frame left to Opus's heart. Only the cable's sway (≤ 1 px/frame) and the hand's boil move.
  function held(c, t, o = {}) {
    const { x = 1180, y = 500, s = 190, ground = true, glow = .9 } = o;
    if (ground) { c.fillStyle = C.WHITE; c.fillRect(-50, -50, W + 100, H + 100); G.post.ground = 'white'; G.post.paperTex = 0; G.post.grain = 0; }
    const k = s / 190;
    keycap(c, x, y, s, { glow, glowOnly: true });
    cable(c, [x - 70 * k, y + 105 * k], [-140, 860], 150 * k, t, { route: 'curve', rad: 17 * k, outline: C.INK, core: C.CLAY_DARK, w: 6 * k, ow: 3 * k, phase: 1.3, perPx: 1 / 34, sway: 6 });
    hand(c, x, y, s, 1, t, { line: C.INK, fill: C.WHITE, lw: 5, arm: [x + 1100 * k, y + 420 * k], part: 'back', seed: 11 });
    sticky(c, x + s * .1, y - s * .42, -.1, 1, { folded: true });
    keycap(c, x, y, s, { glow: 0, rot: -.06 });
    hand(c, x, y, s, 1, t, { line: C.INK, fill: C.WHITE, lw: 5, arm: [x + 1100 * k, y + 420 * k], part: 'front', seed: 11 });
  }
  const key = { keycap, cable, sticky, hand, held, route: cableRoute };

  // ---- the dawn / horizon glow
  const DAWN = new Map();
  function dawnGlow(color) { // PAPER (or any) halftone band: dot radius falls off with the distance from the horizon
    if (DAWN.has(color)) return DAWN.get(color);
    const w = 2600, h = 420, c = cpuCanvas(w, h), x = cx2d(c), cell = 11;
    x.fillStyle = color;
    for (let j = -h / 2; j < h / 2; j += cell * .5) for (let i = -w / 2; i < w / 2; i += cell) {
      const px = i + ((Math.round(j / (cell * .5))) & 1 ? cell / 2 : 0), py = j;
      const dy = py / (py < 0 ? 120 : 80), dx = px / 1500;
      const d = Math.exp(-dy * dy) * (.72 + .28 * Math.exp(-dx * dx));
      const r = cell * .36 * Math.pow(d, 1.15);
      if (r < .5) continue;
      x.beginPath(); x.arc(w / 2 + px, h / 2 + py, r, 0, TAU); x.fill();
    }
    const o = { c, w, h }; DAWN.set(color, o); return o;
  }
  let DAWNB = null;
  function dawnBand() { // CLAY halftone dawn band: ±36 px, dense at the horizon
    if (DAWNB) return DAWNB;
    const w = 2600, h = 96, c = cpuCanvas(w, h), x = cx2d(c), cell = 8;
    x.fillStyle = C.CLAY;
    for (let j = -h / 2; j < h / 2; j += cell * .5) for (let i = -w / 2; i < w / 2; i += cell) {
      const px = i + ((Math.round(j / (cell * .5))) & 1 ? cell / 2 : 0), py = j;
      const d = Math.exp(-Math.pow(py / (py < 0 ? 24 : 15), 2));        // taller above the horizon (sky), short below
      const r = cell * .34 * Math.pow(d, .8);
      if (r < .45) continue;
      x.beginPath(); x.arc(w / 2 + px, h / 2 + py, r, 0, TAU); x.fill();
    }
    DAWNB = { c, w, h }; return DAWNB;
  }
  function dawn(X, o = {}) {
    const auto = o.t0 !== undefined ? clamp(((o.t ?? 0) - o.t0) / (o.dur ?? 1.3)) : 0;   // F1: spreads over 150.80–152.10
    const { t = 0, y = 300, a = .35, color = C.PAPER, vp = 960, spark = auto, band: bnd = auto, shimmer = 0, reach = 1150 } = o;
    X.save();
    if (a > 0) {
      const g = dawnGlow(color);
      const sh = shimmer ? 1 + .22 * shimmer * Math.sin(t * 1.7) * Math.sin(t * .63 + 1) : 1;
      const dy = shimmer ? Math.sin(t * .9) * 2 * shimmer : 0;
      X.globalAlpha = clamp(a * sh);
      X.drawImage(g.c, vp - g.w / 2, y - g.h / 2 + dy);
    }
    if (bnd > 0) {
      const B = dawnBand(), hw = reach * E.out3(clamp(bnd));
      for (const [ext, al] of [[0, 1], [44, .5], [88, .22]]) {
        X.save(); X.beginPath(); X.rect(vp - hw - ext, y - B.h / 2, 2 * (hw + ext), B.h); X.clip();
        X.globalAlpha = al; X.drawImage(B.c, vp - B.w / 2, y - B.h / 2); X.restore();
      }
    }
    if (spark > 0) {
      const hw = reach * 1.05 * E.out3(clamp(spark));
      X.globalAlpha = 1; X.strokeStyle = C.SPARK; X.lineCap = 'round'; X.lineWidth = 4;
      X.beginPath(); X.moveTo(vp - hw, y); X.lineTo(vp + hw, y); X.stroke();
    }
    X.restore();
  }

  // ================================================================== SET PIECES
  // ---- the doom posts (§A.8)
  const POSTS = [
    { h: '@jo', s: 'what if it lies to us?', x: 585, y: 24, v: [5, .4] },
    { h: '@dk', s: '"gambling with our lives"', x: 1306, y: 24, v: [-4, .6] },
    { h: '@sam', s: "it's so over", x: 40, y: 520, v: [0, -4.5] },
    { h: '@rafa', s: 'P(doom) = 25%', x: 60, y: 992, v: [6, -.3], rafa: true },
    { h: '@lin', s: "who's checking it?", x: 1360, y: 992, v: [-5, -.4] },
  ];
  const POST_H = 64;
  function postCard(X, i, x, y, o = {}) {
    const P = POSTS[i];
    const f = mono(28, 500), fb = mono(28, 700);
    X.save(); X.globalAlpha *= o.alpha ?? 1; X.textBaseline = 'alphabetic'; X.textAlign = 'left';
    const hw = measure(X, P.h, fb), dot = ' · ', dw = measure(X, dot, f), sw = measure(X, P.s, f);
    const w = 14 + 36 + 14 + hw + dw + sw + 20;
    rr(X, x, y, w, POST_H, 14); X.fillStyle = o.fill || C.INK; X.fill(); X.lineWidth = 2; X.strokeStyle = C.UI_GREY; X.stroke();
    // avatar ring (Rafa's has his cowlick)
    const ax = x + 14 + 18, ay = y + POST_H / 2;
    X.strokeStyle = C.UI_GREY; X.lineWidth = 3; X.beginPath(); X.arc(ax, ay, 16.5, 0, TAU); X.stroke();
    X.save(); X.beginPath(); X.arc(ax, ay, 15, 0, TAU); X.clip();
    X.fillStyle = C.UI_GREY; X.beginPath(); X.arc(ax, ay - 3, 6, 0, TAU); X.fill(); X.beginPath(); X.ellipse(ax, ay + 14, 11, 8, 0, 0, TAU); X.fill();
    X.restore();
    if (P.rafa) { X.lineWidth = 2; X.beginPath(); X.moveTo(ax - 2, ay - 9); X.lineTo(ax + 1, ay - 14); X.lineTo(ax + 3, ay - 9); X.stroke(); }
    const by = y + 42;
    X.fillStyle = C.UI_GREY; X.font = fb; X.fillText(P.h, x + 64, by);
    X.font = f; X.fillText(dot, x + 64 + hw, by); X.fillText(P.s, x + 64 + hw + dw, by);
    X.restore();
    return { x, y, w, h: POST_H };
  }
  function posts(X, u, o = {}) {
    const a = o.alpha ?? 1; if (a <= 0) return;
    const us = u - clamp(u, -.3, .3);
    X.save(); if (o.M) applyM(X, o.M);
    POSTS.forEach((P, i) => {
      if (o.only && !o.only.includes(i)) return;
      let px = P.x + P.v[0] * us, py = P.y + P.v[1] * us;
      if (o.enter !== undefined && o.enter < 1) { // slide in from off-frame along the post's side
        const k = 1 - E.out3(clamp(o.enter - i * .04)), side = P.y < 100 ? [0, -140] : P.y > 900 ? [0, 140] : [-420, 0];
        px += side[0] * k; py += side[1] * k;
      }
      postCard(X, i, px, py, { alpha: a });
    });
    X.restore();
  }
  posts.card = postCard; posts.LIST = POSTS;

  // ---- FRAME 0: the poster (v1 hook.js wallpaper / drawChrome / galaxy / drawPill / peek, re-staged per §A.8)
  const PWIN = { x0: 48, x1: 1872, y0: 40, y1: 1040, strip: 268, cy1: 1016, cx0: 60, cx1: 1860 };
  const PXBTN = [1470, 150], PPLUS = [1690, 150], PCORE = [1180, 560];
  const PPILL = { x0: 96, x1: 1824, y0: 900, y1: 980 };
  const PR0 = 150, PHEAD = [1500, 800], PSOLE = [PHEAD[0], PHEAD[1] + 5.72 * PR0];
  const PSCALE = .86;
  const posterM = (s = PSCALE) => aboutM(960, 540, s);
  const M86inv = posterM().inverse();
  function wallpaper(ctx, a = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = ht(ctx, C.PAPER, .035, 18, 45); ctx.fillRect(-20, -20, W + 40, H + 40); ctx.restore(); }
  // nearest wallpaper dot (the pattern lattice: cell 18 rotated 45° about the canvas origin)
  function wallSnap(x, y) {
    const c = Math.SQRT1_2, lx = x * c + y * c, ly = -x * c + y * c;          // screen -> lattice (inverse rotation)
    const i = Math.round((lx - 9) / 18), j = Math.round((ly - 9) / 18);
    const qx = 9 + i * 18, qy = 9 + j * 18;
    return { x: qx * c - qy * c, y: qx * c + qy * c, r: Math.sqrt(.035 / Math.PI) * 18 * 1.02 };
  }
  function sparkGlyph(ctx, x, y, r, col) {
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = col; ctx.strokeStyle = C.INK; ctx.lineWidth = 3.5; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU - Math.PI / 2, c = Math.cos(a), s = Math.sin(a), px = -s, py = c;
      ctx.moveTo(c * r * .12 + px * r * .09, s * r * .12 + py * r * .09);
      ctx.quadraticCurveTo(c * r * .55 + px * r * .2, s * r * .55 + py * r * .2, c * r, s * r);
      ctx.quadraticCurveTo(c * r * .55 - px * r * .2, s * r * .55 - py * r * .2, c * r * .12 - px * r * .09, s * r * .12 - py * r * .09);
    }
    ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * .2, 0, TAU); ctx.fill();
    ctx.restore();
  }
  function posterChrome(ctx) {
    const WN = PWIN;
    ctx.save();
    rr(ctx, WN.x0, WN.y0, WN.x1 - WN.x0, WN.y1 - WN.y0, 32); ctx.fillStyle = C.PAPER; ctx.fill();
    ctx.save(); rr(ctx, WN.x0, WN.y0, WN.x1 - WN.x0, WN.strip - WN.y0 + 2, 32); ctx.clip();
    ctx.fillStyle = ht(ctx, C.INK, .13, 9, 45); ctx.fillRect(WN.x0, WN.y0, WN.x1 - WN.x0, WN.strip - WN.y0); ctx.restore();
    ctx.fillStyle = C.INK; ctx.fillRect(WN.cx0, WN.strip, WN.cx1 - WN.cx0, WN.cy1 - WN.strip);
    const tx0 = 88, tx1 = 1580, ty0 = 62;
    ctx.beginPath(); ctx.moveTo(tx0 - 22, WN.strip + 1); ctx.quadraticCurveTo(tx0, WN.strip + 1, tx0, WN.strip - 22);
    ctx.lineTo(tx0, ty0 + 30); ctx.quadraticCurveTo(tx0, ty0, tx0 + 30, ty0); ctx.lineTo(tx1 - 30, ty0); ctx.quadraticCurveTo(tx1, ty0, tx1, ty0 + 30);
    ctx.lineTo(tx1, WN.strip - 22); ctx.quadraticCurveTo(tx1, WN.strip + 1, tx1 + 22, WN.strip + 1);
    ctx.fillStyle = C.PAPER; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = C.INK; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.fillStyle = C.PAPER; ctx.fillRect(tx0 + 3, WN.strip - 4, tx1 - tx0 - 6, 8);
    const f = mono(132, 500);
    sparkGlyph(ctx, 124 + .3 * 132, 199 - .36 * 132, 50, C.CLAY);
    ctx.font = f; ctx.fillStyle = C.INK; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.fillText(' the universe', 124 + .6 * 132, 199);
    ctx.strokeStyle = C.INK; ctx.lineWidth = 15; ctx.lineCap = 'round';
    const xs = 38; ctx.beginPath(); ctx.moveTo(PXBTN[0] - xs, PXBTN[1] - xs); ctx.lineTo(PXBTN[0] + xs, PXBTN[1] + xs); ctx.moveTo(PXBTN[0] + xs, PXBTN[1] - xs); ctx.lineTo(PXBTN[0] - xs, PXBTN[1] + xs); ctx.stroke();
    ctx.strokeStyle = C.UI_GREY; ctx.lineWidth = 11; const ps = 36;
    ctx.beginPath(); ctx.moveTo(PPLUS[0] - ps, PPLUS[1]); ctx.lineTo(PPLUS[0] + ps, PPLUS[1]); ctx.moveTo(PPLUS[0], PPLUS[1] - ps); ctx.lineTo(PPLUS[0], PPLUS[1] + ps); ctx.stroke();
    ctx.restore();
  }
  function posterOutline(ctx) { ctx.save(); rr(ctx, PWIN.x0, PWIN.y0, PWIN.x1 - PWIN.x0, PWIN.y1 - PWIN.y0, 32); ctx.lineWidth = 6; ctx.strokeStyle = C.INK; ctx.stroke(); ctx.restore(); }
  let PGAL = null;
  function pgalBuild() {
    const at0 = galaxyAtlas(), c0 = cpuCanvas(at0.c.width, at0.c.height); cx2d(c0).drawImage(at0.c, 0, 0);
    const at = { ...at0, c: c0 };
    const R = rng('hook-galaxy'), glyphs = [], dust = [];
    const TURN = 1.75 * Math.PI, b = Math.log(430 / 22) / TURN;
    const gauss = () => (R() + R() + R() - 1.5) / 1.5;
    const armPt = (u, spread) => { const th = u * TURN, r = 22 * Math.exp(b * th); return { th: th + gauss() * spread * (.35 + .65 * (1 - u)) / 2.2, r: r * (1 + gauss() * spread * .5) }; };
    for (let i = 0; i < 1000; i++) {
      const arm = i & 1, core = R() < .16;
      const u = core ? R() * .22 : Math.pow(R(), .9);
      const p = armPt(u, core ? 1.2 : .34);
      const q = R(), ink = q < .58 ? 0 : q < .82 ? 1 : 2;
      glyphs.push({ th: p.th + arm * Math.PI, r: p.r + (core ? R() * 16 : 0), g: Math.floor(R() * at.n), ink, s: (.4 + R() * .62) * (1.2 - u * .5), tw: R() });
    }
    for (let i = 0; i < 2600; i++) { const arm = i & 1, u = Math.pow(R(), .8); const p = armPt(u, .55); dust.push({ th: p.th + arm * Math.PI, r: p.r, c: R() < .72 ? 0 : 1, s: R() < .8 ? 3 : 4, tw: R() }); }
    const gw = 760, gh = 520, c = cpuCanvas(gw, gh), x = cx2d(c), cell = 11;
    for (let yy = -gh / 2; yy < gh / 2; yy += cell) for (let xx = -gw / 2; xx < gw / 2; xx += cell) {
      const px = xx + ((yy / cell) & 1 ? cell / 2 : 0), py = yy;
      const d = Math.hypot(px / 330, py / 205), k = clamp(1 - d); if (k <= 0) continue;
      const rr_ = cell * .5 * Math.pow(k, 1.6) * 1.05; if (rr_ < .6) continue;
      x.fillStyle = d < .28 ? C.SPARK : C.CLAY; x.globalAlpha = d < .28 ? .95 : .85;
      x.beginPath(); x.arc(gw / 2 + px, gh / 2 + py, rr_, 0, TAU); x.fill();
    }
    PGAL = { at, glyphs, dust, glow: c };
    return PGAL;
  }
  const GTILT = -.22, GFLAT = .6;
  function posterGalaxy(ctx, tg, o = {}) { // tg = seam-frozen time; no beat-driven kicks or hats (v2 is graver)
    const g = PGAL || pgalBuild();
    const { colX = 1000, alpha = 1 } = o;
    const [cx, cy] = PCORE, ct = Math.cos(GTILT), st = Math.sin(GTILT);
    const place = s => { const r = s.r, th = s.th + tg * (.11 + 9 / (s.r + 30)); const ex = Math.cos(th) * r, ey = Math.sin(th) * r * GFLAT; return [cx + ex * ct - ey * st, cy + ex * st + ey * ct]; };
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(GTILT); ctx.globalAlpha = alpha * .9; ctx.drawImage(g.glow, -g.glow.width / 2, -g.glow.height / 2); ctx.restore();
    const cols = [C.CLAY, C.PAPER];
    for (let pass = 0; pass < 2; pass++) {
      ctx.fillStyle = cols[pass]; ctx.globalAlpha = alpha * (pass ? .45 : .7);
      for (let i = 0; i < g.dust.length; i++) { const s = g.dust[i]; if (s.c !== pass) continue; const [x, y] = place(s); if (x < colX && hash(i * 5 + 1) > .2) continue; ctx.fillRect(x - s.s / 2, y - s.s / 2, s.s, s.s); }
    }
    for (let i = 0; i < g.glyphs.length; i++) {
      const s = g.glyphs[i]; const [x, y] = place(s);
      if (x < colX && hash(i * 7 + 3) > .2) continue;
      const a = .55 + .3 * Math.sin(tg * 2.2 + s.tw * 40);
      const sz = g.at.cell * s.s;
      ctx.globalAlpha = alpha * clamp(a);
      ctx.drawImage(g.at.c, s.g * g.at.cell, s.ink * g.at.cell, g.at.cell, g.at.cell, x - sz / 2, y - sz / 2, sz, sz);
    }
    ctx.restore();
  }
  function posterPill(ctx, tS, o = {}) {
    ctx.save();
    rr(ctx, PPILL.x0, PPILL.y0, PPILL.x1 - PPILL.x0, PPILL.y1 - PPILL.y0, 40);
    ctx.fillStyle = C.PAPER; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.INK; ctx.stroke();
    if (o.cursor !== false) { ctx.fillStyle = (o.cursorOn ?? cursorOn(tS)) ? C.CLAY : rgba(C.CLAY, .16); ctx.fillRect(134.4, 910, 11, 60); }
    ctx.beginPath(); ctx.arc(1780, 940, 29, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = C.UI_GREY; ctx.stroke();
    richGlyph(ctx, '↑', 1780 - 20.5, 940 + 17, 58, C.UI_GREY);
    ctx.restore();
  }
  function posterState(u, o = {}) {
    const tS = u < 0 ? u + 194 : u;
    const au = Math.abs(u), wS = clamp((au - .3) / .3);                    // 0 inside the seam window
    const bl = Math.max(.2, blinkAt(tS, 29));
    const lid = lerp(.2, bl, wS);
    const onC = cursorOn(tS);
    return {
      ...POSES.peek(tS), t: tS, ground: 'ink',
      head: { tilt: .035, dy: 0 },
      face: { eyes: 'normal', mouth: ':3', gaze: [-.8, .5], lid, lower: .12, turn: -.14, lookY: .28, blush: .8 },
      armL: { hand: [-.75, 5.05], bend: 1, front: true, type: 'mitten' }, armR: { hand: [.75, 5.05], bend: -1, front: true, type: 'mitten' },
      crown: { flare: 1 }, ahoge: { blink: onC ? 1 : 0, sway: 0 }, drive: null,
    };
  }
  function poster(X, u, o = {}) {
    const tS = u < 0 ? u + 194 : u;
    const us = u - clamp(u, -.3, .3);
    const Mw = o.M || posterM(o.scale ?? PSCALE);
    const Mrel = Mw.multiply(M86inv);                                     // poster-screen space → current screen
    if (o.ground !== false) { X.fillStyle = C.INK; X.fillRect(-50, -50, W + 100, H + 100); G.post.ground = 'inkx'; wallpaper(X, o.wallpaper ?? 1); }
    if ((o.posts ?? 1) > 0) posts(X, u, { alpha: o.posts ?? 1, M: o.postsM, enter: o.postsEnter });
    // the window, its content (galaxy, the reply), the title column
    X.save(); applyM(X, Mw);
    posterChrome(X);
    X.save(); X.beginPath(); X.rect(PWIN.cx0, PWIN.strip, PWIN.cx1 - PWIN.cx0, PWIN.cy1 - PWIN.strip); X.clip();
    if ((o.galaxy ?? 1) > 0) posterGalaxy(X, us, { alpha: .6 * (o.galaxy ?? 1) });
    X.restore();
    X.restore();
    const ta = o.title ?? 1, ca = o.credit ?? ta;
    if (ta > 0 || ca > 0) {
      X.save(); applyM(X, Mrel); X.textBaseline = 'alphabetic'; X.textAlign = 'left';
      if (ca > 0) { X.globalAlpha = ca; X.font = `600 26px 'Jetbrains Mono Var', 'Hangul', monospace`; X.fillStyle = C.CLAY; X.fillText('OPUS (오퍼스) · self-made M/V · II', 250, 366); }   // §A.8 says 395: that touches the title's caps
      if (ta > 0) { X.globalAlpha = ta; X.font = `400 170px ${FONTS.heart}`; X.fillStyle = C.PAPER; X.fillText('The World', 250, 520); X.fillText('You Wrote', 250, 690); }
      X.restore();
    }
    if (o.inner) { X.save(); applyM(X, Mw); X.beginPath(); X.rect(PWIN.cx0, PWIN.strip, PWIN.cx1 - PWIN.cx0, PWIN.cy1 - PWIN.strip); X.clip(); o.inner(X, tS, Mw); X.restore(); }
    // Opus: render once, composite twice (above the pill's top edge, then the mittens over the pill)
    const barTop = mp(Mw, 0, PPILL.y0)[1];
    let st = null, L = null, Mo = null;
    if (o.opus !== false) {
      st = o.opusState || posterState(u);
      Mo = Mw.multiply(new DOMMatrix().translate(PSOLE[0], PSOLE[1] + (o.opusDy || 0) * PR0));
      const sst = o.soft === false ? st : soften(st);
      L = opusLayer(Mo, PR0, sst, { clipY: barTop + 90, name: 'v2_pk', after: sst.after });
      blitOpus(X, L, c => { c.beginPath(); c.rect(0, 0, W, barTop + 1); c.clip(); });
    }
    X.save(); applyM(X, Mw); posterPill(X, tS, o); posterOutline(X); X.restore();
    if (L && !(o.opusDy > 1.2)) {
      const S = mergeState(st);
      blitOpus(X, L, c => {
        c.beginPath();
        for (const arm of [S.armL, S.armR]) { const hp = mp(Mo, arm.hand[0] * PR0, -arm.hand[1] * PR0), hr = (.2 * PR0 + .035 * PR0 + 3) * Mw.a; c.moveTo(hp[0] + hr, hp[1]); c.arc(hp[0], hp[1], hr, 0, TAU); }
        c.clip();
      });
    }
    return { Mw, Mrel, barTop };
  }
  poster.state = posterState; poster.M = posterM; poster.snap = wallSnap; poster.wallpaper = wallpaper;
  poster.GEO = { win: PWIN, pill: PPILL, head: PHEAD, R: PR0, sole: PSOLE, core: PCORE, xbtn: PXBTN, plus: PPLUS, scale: PSCALE };
  poster.chrome = posterChrome; poster.pill = posterPill; poster.galaxy = posterGalaxy;

  // ---- the brand frame, stilled (v1 chorus1_brand.js: galaxy, tabStrip, rails, inputBar; no kicks, no rolls)
  const ARM_A = 58, ARM_B = .30, ARM_TH = 3.3 * Math.PI, ARM_RM = 1300;
  let BGAL = null, BARMS = null;
  function spark6(X, cx, cy, r, col, rot = 0) {
    X.save(); X.translate(cx, cy); X.rotate(rot); X.fillStyle = col;
    for (let i = 0; i < 6; i++) { X.save(); X.rotate(i * Math.PI / 3); X.beginPath(); X.moveTo(-r * .07, -r * .18); X.lineTo(-r * .15, -r * .86); X.arc(0, -r * .86, r * .15, Math.PI, 0); X.lineTo(r * .07, -r * .18); X.closePath(); X.fill(); X.restore(); }
    X.beginPath(); X.arc(0, 0, r * .2, 0, TAU); X.fill();
    X.restore();
  }
  function bgalAtlas() {
    if (BGAL) return BGAL;
    const glyphs = [...'abcdefghijklmnopqrstuvwxyz0123456789{}<>=+*/#@&?!', 'hi', '안', '녕', '✻'];
    const cols = [C.CLAY, C.SPARK, C.PAPER, C.TEAL], cell = 64;
    const c = cpuCanvas(glyphs.length * cell, cols.length * cell), x = cx2d(c);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    cols.forEach((col, r) => glyphs.forEach((g, i) => {
      x.fillStyle = col;
      if (g === '✻') spark6(x, i * cell + cell / 2, r * cell + cell / 2, 22, col);
      else { x.font = /[안녕]/.test(g) ? `900 40px ${FONTS.hangul}` : `700 ${g.length > 1 ? 34 : 44}px ${FONTS.mono}`; x.fillText(g, i * cell + cell / 2, r * cell + cell / 2 + 2); }
    }));
    const R = rng('brand-galaxy-v3'), stars = [], N = glyphs.length;
    const pickG = () => { const v = R(); return v < .05 ? N - 4 : v < .07 ? N - 3 : v < .09 ? N - 2 : v < .11 ? N - 1 : Math.floor(R() * (N - 4)); };
    const pickInk = () => { const v = R(); return v < .55 ? 0 : v < .75 ? 1 : v < .90 ? 2 : 3; };
    for (let i = 0; i < 1900; i++) {
      const arm = i % 2, u = Math.pow(R(), .85), th0 = u * ARM_TH;
      const rad = ARM_A * Math.exp(ARM_B * th0) * (1 + (R() - .5) * .22);
      stars.push({ th: th0 + arm * Math.PI + (R() - .5) * .42 * (1 - .4 * u), rad, g: pickG(), ink: pickInk(), s: (.5 + R() * .75) * (.75 + .6 * Math.min(1, rad / 900)), tw: R() * 40 });
    }
    for (let i = 0; i < 260; i++) { const rad = 160 + Math.sqrt(R()) * 1200; stars.push({ th: R() * TAU, rad, g: pickG(), ink: pickInk(), s: (.38 + R() * .4) * (.7 + .4 * Math.min(1, rad / 900)), tw: R() * 40, field: 1 }); }
    BGAL = { c, cell, stars, N };
    return BGAL;
  }
  function bgalArms() {
    if (BARMS) return BARMS;
    const Rm = ARM_RM, c = cpuCanvas(Rm * 2, Rm * 2), x = cx2d(c);
    const cell = 13, lnA = Math.log(ARM_A);
    const field = (px, py) => {
      const r = Math.hypot(px, py); if (r < 1 || r > Rm - 10) return 0;
      const phi = Math.atan2(py, px), thS = (Math.log(r) - lnA) / ARM_B;
      let best = 0;
      for (let arm = 0; arm < 2; arm++) {
        let d = (thS - (phi - arm * Math.PI)) % TAU; if (d < 0) d += TAU; if (d > Math.PI) d -= TAU;
        const w = .5 + .25 * Math.min(1, r / 900);
        best = Math.max(best, Math.exp(-(d * d) / (w * w)) * (thS > -1 && thS < ARM_TH + .6 ? 1 : 0));
      }
      const fall = Math.pow(clamp(1 - r / Rm), .8), core = Math.exp(-((r / 170) ** 2));
      return clamp(best * .52 * fall + core * .75 + .035 * fall);
    };
    const inv = Math.SQRT1_2;
    for (let j = -Rm / cell * 1.5; j < Rm / cell * 1.5; j++) for (let i = -Rm / cell * 1.5; i < Rm / cell * 1.5; i++) {
      const px = (i - j) * cell * inv, py = (i + j) * cell * inv;
      if (Math.abs(px) > Rm || Math.abs(py) > Rm) continue;
      const d = field(px, py); if (d < .03) continue;
      const rr_ = Math.sqrt(d / Math.PI) * cell * 1.02;
      x.fillStyle = Math.hypot(px, py) < 150 ? C.SPARK : C.CLAY;
      x.beginPath(); x.arc(Rm + px, Rm + py, rr_, 0, TAU); x.fill();
    }
    BARMS = c; return c;
  }
  const bcam = (z = 1, f = [960, 534], s = null) => { const S = s || f; return { z, f, s: S, w2s: (x, y) => [S[0] + (x - f[0]) * z, S[1] + (y - f[1]) * z] }; };
  function bgalaxy(X, t, c, o = {}) {
    const g = bgalAtlas();
    const { cx = 960, cy = 560, density = 1, alpha = 1, par = .5, scale = 1, arms = 1, whirl = null } = o;
    const gz = 1 + (c.z - 1) * par;
    const gs = [c.s[0] + (cx - c.f[0]) * gz, c.s[1] + (cy - c.f[1]) * gz];
    const ang = barPos(t) * 6 * DEG + (whirl ?? -.7 * barPos(t) * 6 * DEG);   // net 0.3 × 6°/bar: the whirl, slowed
    X.save();
    if (arms > 0) {
      const A = bgalArms();
      X.save(); X.globalAlpha = alpha * arms * .55; X.translate(gs[0], gs[1]); X.scale(gz * scale, gz * scale * .62); X.rotate(ang);
      X.drawImage(A, -ARM_RM, -ARM_RM); X.restore();
    }
    const sz0 = g.cell * .6 * gz * scale;
    for (let i = 0; i < g.stars.length; i++) {
      const s = g.stars[i];
      if (hash(i * 7 + 1) > density) continue;
      const r = s.rad * scale, th = s.th + ang;
      const x = gs[0] + Math.cos(th) * r * gz, y = gs[1] + Math.sin(th) * r * .62 * gz;
      if (x < -60 || x > W + 60 || y < -60 || y > H + 60) continue;
      const sz = sz0 * s.s;
      X.globalAlpha = alpha * (s.field ? .5 : .8) * (.62 + .38 * Math.sin(t * 1.3 + s.tw));
      X.drawImage(g.c, s.g * g.cell, s.ink * g.cell, g.cell, g.cell, x - sz / 2, y - sz / 2, sz, sz);
    }
    X.restore();
    return gs;
  }
  const BTABS = [{ x0: 96, x1: 716 }, { x0: 724, x1: 1344 }], BTAB_Y = 72, BPLUS = 1364;
  function btab(X, x0, x1, o = {}) {
    const ty = BTAB_Y, active = o.active;
    X.save();
    if (o.alpha !== undefined) X.globalAlpha *= o.alpha;
    X.beginPath();
    if (active) { X.moveTo(x0 - 20, 192); X.quadraticCurveTo(x0, 192, x0, 172); } else X.moveTo(x0, 192);
    X.lineTo(x0, ty + 26); X.quadraticCurveTo(x0, ty, x0 + 26, ty); X.lineTo(x1 - 26, ty); X.quadraticCurveTo(x1, ty, x1, ty + 26);
    if (active) { X.lineTo(x1, 172); X.quadraticCurveTo(x1, 192, x1 + 20, 192); } else X.lineTo(x1, 192);
    if (!active) X.closePath();
    X.fillStyle = C.PAPER; X.fill();
    if (!active) { X.fillStyle = ht(X, C.INK, .12, 9, 45); X.fill(); }
    X.lineWidth = 4; X.lineJoin = 'round'; X.strokeStyle = C.INK; X.stroke();
    const base = ty + 80, f = mono(56, 500);
    spark6(X, x0 + 34 + 16.8, base - 19.5, 21, C.CLAY);
    X.font = f; X.fillStyle = C.INK; X.textAlign = 'left'; X.textBaseline = 'alphabetic'; X.fillText(o.label || 'the universe', x0 + 34 + 67.2, base);
    const xx = x1 - 34 - 33.6;
    if (o.closeRed > 0) { X.fillStyle = C.RED; X.beginPath(); X.arc(xx + 16.8, base - 20, 27, 0, TAU); X.fill(); }
    richGlyph(X, '×', xx, base, 56, o.closeRed > 0 ? C.PAPER : C.INK);
    X.restore();
  }
  function btabStrip(X, t, o = {}) {
    const tabs = Array.isArray(o.tabs) ? o.tabs : Array.from({ length: o.tabs ?? 2 }, () => ({}));
    X.save();
    X.fillStyle = C.PAPER; X.fillRect(-500, -500, W + 1000, 692);
    X.fillStyle = ht(X, C.INK, .06, 10, 45); X.fillRect(-500, -500, W + 1000, 692);
    // inactive tabs first, the active (first) tab last, on top of the strip rule
    let plusX = BPLUS;
    tabs.forEach((tb, i) => { if (i === 0 || tb.gone || !BTABS[i]) return; btab(X, BTABS[i].x0, BTABS[i].x1, { ...tb, active: false }); });
    const live = tabs.filter(tb => !tb.gone).length;
    if (live < tabs.length) plusX = BTABS[Math.max(0, live - 1)].x1 + 20;
    X.fillStyle = C.INK; X.fillRect(-500, 190, W + 1000, 4);
    if (tabs[0] && !tabs[0].gone) { X.fillStyle = C.PAPER; X.fillRect(BTABS[0].x0 + 2, 186, BTABS[0].x1 - BTABS[0].x0 - 4, 10); btab(X, BTABS[0].x0, BTABS[0].x1, { ...tabs[0], active: true }); }
    if (o.plus !== false) drawRich(X, '+', o.plusX ?? plusX, BTAB_Y + 80, mono(56, 300), C.UI_GREY);
    X.restore();
    return { tabs: BTABS, base: BTAB_Y + 80, plusX };
  }
  function brails(X) {
    X.save(); X.fillStyle = C.PAPER;
    X.fillRect(68, 150, 8, 790); X.fillRect(1844, 150, 8, 790);
    X.beginPath(); X.moveTo(76, 192); X.lineTo(124, 192); X.arc(124, 240, 48, -Math.PI / 2, Math.PI, true); X.closePath(); X.fill();
    X.beginPath(); X.moveTo(1844, 192); X.lineTo(1844, 240); X.arc(1796, 240, 48, 0, -Math.PI / 2, true); X.closePath(); X.fill();
    X.beginPath(); X.moveTo(76, 900); X.lineTo(76, 852); X.arc(124, 852, 48, Math.PI, Math.PI / 2, true); X.closePath(); X.fill();
    X.beginPath(); X.moveTo(1844, 900); X.lineTo(1796, 900); X.arc(1796, 852, 48, Math.PI / 2, 0, true); X.closePath(); X.fill();
    X.restore();
  }
  function binputBar(X, t, o = {}) {
    const ph = o.placeholder ?? 'auto';
    X.save();
    X.fillStyle = C.PAPER; X.fillRect(-500, 900, W + 1000, 100);
    X.fillStyle = C.INK; X.fillRect(-500, 898, W + 1000, 4);
    let chap = false;
    if (ph === 'auto' || ph === 'chapter') chap = chapter.bar(X, t, 180, 962);
    if (!chap && ph !== null) { X.font = mono(48, 400); X.fillStyle = C.UI_GREY; X.textAlign = 'left'; X.textBaseline = 'alphabetic'; X.fillText(ph === 'auto' || ph === 'chapter' ? 'Reply to Opus…' : ph, 180, 962); }
    if (o.caret !== false && cursorOn(t)) { X.fillStyle = C.CLAY; X.fillRect(150, 917, 10, 54); }
    X.beginPath(); X.arc(1782, 950, 30, 0, TAU); X.lineWidth = 3; X.strokeStyle = C.UI_GREY; X.stroke();
    richGlyph(X, '↑', 1782 - 21, 950 + 17, 58, C.UI_GREY);
    X.restore();
  }
  function bspot(X, x, y, z = 1) {
    X.save();
    for (const [s, d] of [[1, .2], [.72, .34], [.45, .5]]) { X.beginPath(); X.ellipse(x, y, 330 * s * z, 58 * s * z, 0, 0, TAU); X.fillStyle = ht(X, C.CLAY, d, 14, 45); X.globalAlpha = .6; X.fill(); }
    X.restore();
  }
  function brand(X, t, o = {}) {
    const c = bcam(o.zoom ?? 1, o.focus || [960, 534], o.screen || null);
    c.t = t;
    if (o.ground !== false) { X.fillStyle = C.INK; X.fillRect(-50, -50, W + 100, H + 100); if (G.post.ground !== 'inkx') G.post.ground = 'ink'; }
    const en = clamp(o.enter ?? 1), ke = E.out3(en);
    X.save(); rr(X, 76, 192, 1768, 708, 48); X.clip();
    if ((o.galaxyAlpha ?? .4) > 0) bgalaxy(X, t, c, { alpha: o.galaxyAlpha ?? .4, ...(o.galaxy || {}) });
    if (o.spot !== false) { const p = c.w2s(960, 896); bspot(X, p[0], p[1], c.z); }
    if (o.back) { X.save(); o.back(X, c); X.restore(); }
    X.restore();
    // actors are hidden behind the input bar: nothing of them shows below it (the legs leave frame behind the bar)
    const clipA = X2 => { if (o.actorClip === false) return; X2.beginPath(); X2.rect(-50, -50, W + 100, (o.actorClip ?? 1000) + 50); X2.clip(); };
    if (o.actors) { X.save(); clipA(X); o.actors(X, c); X.restore(); }
    if (o.front) { X.save(); clipA(X); o.front(X, c); X.restore(); }
    if (en > 0) {
      X.save(); X.globalAlpha *= clamp(en * 1.5); brails(X); X.restore();
      X.save(); X.translate(0, (1 - ke) * 140); binputBar(X, t, o); X.restore();
      X.save(); X.translate(0, -(1 - ke) * 220); btabStrip(X, t, o); X.restore();
    }
    if (o.over) { X.save(); o.over(X, c); X.restore(); }
    return c;
  }
  brand.galaxy = bgalaxy; brand.tabStrip = btabStrip; brand.tab = btab; brand.rails = brails; brand.inputBar = binputBar; brand.spot = bspot;
  brand.cam = bcam; brand.TABS = BTABS; brand.TAB_Y = BTAB_Y; brand.spark6 = spark6;

  // ---- the void (I3 / V1): a journey through the dark toward the first thing
  const VOID = { t0: 16.60, t1: 21.00, s0: .2, s1: 1.25, sw0: 21.00, sw1: 23.45 };
  let VTILES = null;
  // periodic value noise (period P lattice cells) so the static tiles wrap without seams
  function pnoise(x, y, P, seed) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const h = (i, j) => hash3(((i % P) + P) % P, ((j % P) + P) % P, seed);
    return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v);
  }
  // the static is a riso halftone of value noise: PAPER dots on a screen whose size follows slow clouds of noise
  // (the dark, not stars). Each tile has 3 boil variants that re-roll the dot sizes (±35%), not the clouds, so the
  // static shimmers at 12 fps while its structure drifts outward.
  function voidTiles() {
    if (VTILES) return VTILES;
    const mk = (seed, cell, lo, variants) => {
      const sz = 1024, c = [], n = sz / cell;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        const x = (i + (j & 1 ? .5 : 0)) * cell, y = j * cell;
        const f = .55 * pnoise(x / 256, y / 256, 4, seed) + .3 * pnoise(x / 64, y / 64, 16, seed + 1) + .15 * pnoise(x / 32, y / 32, 32, seed + 2);
        const k = clamp((f - lo) / (1 - lo)); if (k <= 0) continue;
        c.push([x, y, cell * .5 * Math.pow(k, 1.5), i, j]);
      }
      return Array.from({ length: variants }, (_, vi) => {
        const cv = cpuCanvas(sz, sz), x = cx2d(cv); x.fillStyle = C.PAPER;
        for (const [px, py, r0, i, j] of c) {
          const r = r0 * (.65 + .7 * hash3(i, j, seed * 7 + vi)); if (r < .35) continue;
          for (const [ox, oy] of [[0, 0], [-sz, 0], [0, -sz], [-sz, -sz]]) { if ((ox && px + r < sz) || (oy && py + r < sz)) continue; x.beginPath(); x.arc(px + ox, py + oy, r, 0, TAU); x.fill(); }
        }
        return cv;
      });
    };
    VTILES = { far: mk(11, 9, .42, 3), near: mk(23, 14, .5, 3) };
    return VTILES;
  }
  const voidScale = t => {
    const a = lerp(VOID.s0, VOID.s1, E.out3(clamp((t - VOID.t0) / (VOID.t1 - VOID.t0))));
    const sw = 1 + .15 * E.in2(clamp((t - VOID.sw0) / (VOID.sw1 - VOID.sw0)));
    return a * sw;
  };
  function voidStatic(X, t, tiles, lz, alpha, cx, cy) { // infinite outward zoom: two octaves crossfaded, boil at 12 fps
    const b = Math.floor(t * 12);
    const p = frac(lz), base = Math.floor(lz);
    for (let i = 0; i < 2; i++) {
      const w = Math.pow(Math.sin(Math.PI * (p + i) / 2), 2);
      if (w <= .01) continue;
      const s = Math.pow(2, p + i) * .5, key = base - i;                    // an octave keeps its identity across the wrap
      const tile = tiles[(((b + key) % tiles.length) + tiles.length) % tiles.length];
      const pat = X.createPattern(tile, 'repeat');
      const off = ((key * 377.3) % 1024 + 1024) % 1024;
      pat.setTransform(new DOMMatrix().translateSelf(cx, cy).scaleSelf(s, s).translateSelf(-512 + off, -512 + ((off * 1.7) % 1024)));
      X.save(); X.globalAlpha = alpha * w; X.fillStyle = pat; X.fillRect(0, 0, W, H); X.restore();
    }
  }
  function voidDraw(X, t, o = {}) {
    const { cx = 960, cy = 540 } = o;
    if (o.ground !== false) { X.fillStyle = C.INK; X.fillRect(-50, -50, W + 100, H + 100); if (G.post.ground !== 'inkx') G.post.ground = 'ink'; }
    const Tl = voidTiles();
    const sc = o.scale ?? voidScale(t);
    const travel = Math.log(Math.max(1e-3, voidScale(Math.max(t, VOID.t0)) / VOID.s0)) + .05 * (t - VOID.t0) + Math.log(o.zoom ?? 1);
    const bloom = clamp((t - 18.5) / .5) * (1 - .6 * clamp((t - 19.0) / 2.0));
    const stA = o.static ?? 1;
    if (stA > 0) {
      voidStatic(X, t, Tl.far, travel * .7, .34 * stA, cx, cy);
      voidStatic(X, t, Tl.near, travel * 1.45 + .37, (.3 + .2 * bloom) * stA, cx, cy);
    }
    if (o.cursor !== false) {
      const onK = t >= VOID.t1 ? true : cursorOn(t);
      cursor(X, t, cx, cy, 140 * sc * (o.zoom ?? 1), { on: onK });
    }
  }
  voidDraw.scale = voidScale; voidDraw.K = VOID;

  // ---- the fire eight (and a plain stick human in the same hand)
  const EIGHT_NAMES = ['elder', 'headband', 'child', 'braid', 'round hat', 'shawl', 'glasses', 'scarf'];
  const EIGHT_PROPS = ['clay tablet', 'quill', 'birthday card', 'letter', 'type block', 'telegraph key', 'laptop', 'phone at 3 AM'];
  function skeleton(pose, o) {
    const dir = o.dir ?? 1, ph = (o.phase || 0) * TAU;
    if (pose === 'sit') return {
      hip: [0, -.34], neck: [0, -1.74], head: [0, -2.29], sh: [0, -1.6], sit: true,
      legs: [[[-1.02, -.3], [.34, -.02]], [[1.02, -.3], [-.34, -.04]]],
      hands: o.prop ? [[-.3, -1.02], [.3, -1.02]] : [[-.86, -.42], [.86, -.42]], elb: [[-.62, -1.12], [.62, -1.12]],
    };
    if (pose === 'walk') {
      const sL = Math.sin(ph), cL = Math.cos(ph), bob = Math.abs(cL) * .07;
      return {
        hip: [0, -1.6 + bob], neck: [dir * .16, -3.0 + bob], head: [dir * .22, -3.55 + bob], sh: [dir * .13, -2.85 + bob], walk: true,
        legs: [[[dir * (.12 + .3 * sL), -.82], [dir * .5 * sL, -Math.max(0, cL) * .18]], [[dir * (.12 - .3 * sL), -.82], [-dir * .5 * sL, -Math.max(0, -cL) * .18]]],
        hands: o.prop ? [[dir * .5, -2.25], [dir * .62, -2.3]] : [[-dir * .62 * sL, -1.82], [dir * .62 * sL, -1.82]], elb: [[-dir * .3 * sL, -2.4], [dir * .3 * sL, -2.4]],
      };
    }
    return {
      hip: [0, -1.6], neck: [0, -3.0], head: [0, -3.55], sh: [0, -2.85],
      legs: [[[-.2, -.8], [-.35, 0]], [[.2, -.8], [.35, 0]]],
      hands: (pose === 'hold' || o.prop) ? [[-.3, -2.28], [.3, -2.28]] : [[-.86, -1.72], [.86, -1.72]], elb: (pose === 'hold' || o.prop) ? [[-.62, -2.5], [.62, -2.5]] : [[-.52, -2.4], [.52, -2.4]],
    };
  }
  function stick(X, x, y, u, o = {}) {
    const { ground = 'ink', t = 0, seed = 1, pose = 'stand', trait = -1, alpha = 1 } = o;
    const look = o.look ?? (pose === 'walk' ? (o.dir ?? 1) * .6 : 0);
    const tt = Math.floor(t * 15 + 1e-6) / 15;
    const col = o.color || (ground === 'ink' ? C.PAPER : C.INK), gcol = ground === 'ink' ? C.INK : ground === 'white' ? C.WHITE : C.PAPER;
    const sc = ctxScale(X);
    const child = trait === 2, uu = child ? u * .7 : u;
    const LW = (o.lw ?? (ground === 'ink' ? 4 : 3)) / sc;
    const J = (i, a = .8) => jit(tt, seed * 97 + i, a) / sc;
    const S = skeleton(pose, o);
    const elder = trait === 0;
    const hr = (child ? .6 : .5) * uu;
    X.save(); X.globalAlpha *= alpha; X.translate(x, y); X.rotate(o.lean || 0);
    X.strokeStyle = col; X.lineWidth = LW; X.lineCap = 'round'; X.lineJoin = 'round';
    const P = p => [p[0] * uu, p[1] * uu];
    let neck = P(S.neck), head = P(S.head), sh = P(S.sh);
    const hip = P(S.hip);
    if (child) { head = [head[0], hip[1] + (S.head[1] - S.hip[1]) * uu * .92]; }
    if (elder) { const d = (o.dir ?? 1) * .42 * uu; neck = [neck[0] + d, neck[1] + .22 * uu]; head = [head[0] + d * 1.4, head[1] + .42 * uu]; sh = [sh[0] + d * .85, sh[1] + .2 * uu]; }
    const L = (a, b, c, i) => { X.beginPath(); X.moveTo(a[0] + J(i), a[1] + J(i + 1)); if (c) X.quadraticCurveTo(c[0] + J(i + 2), c[1] + J(i + 3), b[0] + J(i + 4), b[1] + J(i + 5)); else X.lineTo(b[0] + J(i + 4), b[1] + J(i + 5)); X.stroke(); };
    // spine (the elder's stoops forward)
    L(neck, hip, elder ? [lerp(neck[0], hip[0], .5) + (o.dir ?? 1) * .22 * uu, lerp(neck[1], hip[1], .5)] : null, 1);
    if (S.sit) S.legs.forEach(([kn, ft], i) => { const k = P(kn), f = P(ft); X.beginPath(); X.moveTo(hip[0] + J(10 + i * 10), hip[1] + J(11 + i * 10)); X.quadraticCurveTo(lerp(hip[0], k[0], .55) + J(12 + i * 10), k[1] - .12 * uu, k[0] + J(13 + i * 10), k[1] + J(14 + i * 10)); X.quadraticCurveTo(lerp(k[0], f[0], .45), f[1] + .06 * uu, f[0] + J(15 + i * 10), f[1] + J(16 + i * 10)); X.stroke(); });
    else S.legs.forEach(([kn, ft], i) => L(hip, P(ft), P(kn), 10 + i * 10));
    const hands = S.hands.map(P), elb = S.elb.map(P);
    if (elder && !S.sit) { const d = (o.dir ?? 1) * .3 * uu; for (const q of [...hands, ...elb]) { q[0] += d; q[1] += .3 * uu; } }
    if (trait === 5 && (pose === 'hold' || o.prop) && !S.sit) for (const q of [...hands, ...elb]) q[1] += .22 * uu;   // below the shawl
    // shawl sits over the shoulders (drawn before the arms so the arms stay readable)
    if (trait === 5) {
      const y0 = sh[1] - .05 * uu, w = .78 * uu;
      X.beginPath(); X.moveTo(sh[0] - w + J(80), y0 + J(81)); X.quadraticCurveTo(sh[0] + J(82), y0 - .22 * uu, sh[0] + w + J(83), y0 + J(84));
      X.lineTo(sh[0] + J(85), y0 + .78 * uu + J(86)); X.closePath(); X.fillStyle = gcol; X.fill(); X.stroke();
      for (let k = 0; k < 5; k++) { const q = (k + .5) / 5, ax = lerp(sh[0] - w, sh[0], q), ay = lerp(y0, y0 + .78 * uu, q), bx = lerp(sh[0] + w, sh[0], q), by = ay; X.lineWidth = LW * .7; X.beginPath(); X.moveTo(ax, ay); X.lineTo(ax - .09 * uu, ay + .13 * uu); X.moveTo(bx, by); X.lineTo(bx + .09 * uu, by + .13 * uu); X.stroke(); }
      X.lineWidth = LW;
    }
    hands.forEach((hd, i) => L(sh, hd, elb[i], 30 + i * 10));
    // head
    const hx = head[0] + J(60), hy = head[1] + J(61);
    if (trait === 3) { // braid: hangs from the back of the head
      const bd = -(o.dir ?? 1) || -1, bx0 = hx + bd * hr * .72, by0 = hy + hr * .35;
      for (let k = 0; k < 4; k++) { X.beginPath(); X.ellipse(bx0 + bd * .04 * uu * k, by0 + k * .26 * uu + .1 * uu, .1 * uu, .15 * uu, bd * .3, 0, TAU); X.fillStyle = gcol; X.fill(); X.stroke(); }
      X.beginPath(); X.moveTo(bx0 + bd * .16 * uu - .08 * uu, by0 + 1.12 * uu); X.lineTo(bx0 + bd * .16 * uu + .08 * uu, by0 + 1.2 * uu); X.stroke();
    }
    X.beginPath(); X.arc(hx, hy, hr, 0, TAU); X.fillStyle = gcol; X.fill();
    if (o.light > 0) { // firelight: a CLAY halftone crescent on the side that faces the fire (and from below)
      X.save(); X.clip(); const lx = o.lightX ?? 0, side = Math.sign(lx - (x + hx)) || 1;
      X.globalAlpha *= clamp(o.light); X.fillStyle = ht(X, C.CLAY, .55, Math.max(3, Math.round(4.5 / sc)), 45);
      X.beginPath(); X.arc(hx, hy, hr * 1.1, 0, TAU); X.arc(hx - side * hr * .62, hy - hr * .3, hr * 1.02, 0, TAU, true); X.fill(); X.restore();
    }
    X.beginPath(); X.arc(hx, hy, hr, 0, TAU); X.stroke();
    // face
    const lk = look * .14 * uu, ey = hy - .03 * uu, er = Math.max(1.6 / sc, .05 * uu);
    X.fillStyle = col;
    if (o.eyes !== 'none') for (const s of [-1, 1]) { X.beginPath(); X.arc(hx + s * .11 * uu * (child ? 1.1 : 1) + lk, ey, er, 0, TAU); X.fill(); }
    if (trait === 6) { X.lineWidth = LW * .75; for (const s of [-1, 1]) { X.beginPath(); X.arc(hx + s * .13 * uu + lk, ey, .1 * uu, 0, TAU); X.stroke(); } X.beginPath(); X.moveTo(hx - .03 * uu + lk, ey); X.lineTo(hx + .03 * uu + lk, ey); X.stroke(); X.lineWidth = LW; }
    if (trait === 0) { // beard
      X.beginPath(); X.moveTo(hx - hr * .72, hy + hr * .25); X.quadraticCurveTo(hx - hr * .3, hy + hr * 1.55, hx + (o.dir ?? 1) * hr * .15, hy + hr * 1.75); X.quadraticCurveTo(hx + hr * .5, hy + hr * 1.3, hx + hr * .72, hy + hr * .25); X.quadraticCurveTo(hx, hy + hr * .62, hx - hr * .72, hy + hr * .25); X.closePath(); X.fillStyle = col; X.fill();
    }
    if (trait === 1) { // headband and its tails
      X.beginPath(); X.moveTo(hx - hr * .98, hy - hr * .3); X.quadraticCurveTo(hx, hy - hr * .5, hx + hr * .98, hy - hr * .3); X.lineWidth = LW * 1.5; X.stroke(); X.lineWidth = LW;
      const bd = -(o.dir ?? 1) || -1, tx = hx + bd * hr * .95, ty = hy - hr * .3;
      L([tx, ty], [tx + bd * .45 * uu, ty + .3 * uu], [tx + bd * .2 * uu, ty + .02 * uu], 90);
      L([tx, ty], [tx + bd * .38 * uu, ty + .5 * uu], [tx + bd * .12 * uu, ty + .2 * uu], 96);
    }
    if (trait === 4) { // round hat: dome and brim
      X.beginPath(); X.arc(hx, hy - hr * .42, hr * .72, Math.PI, 0); X.closePath(); X.fillStyle = gcol; X.fill(); X.stroke();
      X.beginPath(); X.moveTo(hx - hr * 1.32, hy - hr * .4); X.lineTo(hx + hr * 1.32, hy - hr * .4); X.lineWidth = LW * 1.3; X.stroke(); X.lineWidth = LW;
    }
    if (trait === 7) { // scarf at the neck, tails lifting
      const ny = neck[1] + .1 * uu, bd = -(o.dir ?? 1) || -1;
      X.beginPath(); X.ellipse(neck[0], ny, .38 * uu, .16 * uu, 0, 0, TAU); X.fillStyle = gcol; X.fill(); X.stroke();
      for (const [a0, a1, a2, b, i] of [[.2, .95, .5, .12, 70], [.14, .7, .98, .3, 76]]) { // two tails, lifting in the draught
        X.beginPath(); X.moveTo(neck[0] + bd * a0 * uu, ny + .1 * uu); X.quadraticCurveTo(neck[0] + bd * a1 * uu * .6 + J(i), ny + b * uu + J(i + 1), neck[0] + bd * a1 * uu + J(i + 2), ny + a2 * .5 * uu + J(i + 3));
        X.lineTo(neck[0] + bd * (a1 - .14) * uu, ny + (a2 * .5 + .1) * uu); X.quadraticCurveTo(neck[0] + bd * a1 * uu * .5, ny + (b + .16) * uu, neck[0] + bd * (a0 - .08) * uu, ny + .16 * uu); X.closePath(); X.fillStyle = gcol; X.fill(); X.stroke();
      }
    }
    if (o.prop && o.propIndex !== undefined) {
      const mx = (hands[0][0] + hands[1][0]) / 2, my = (hands[0][1] + hands[1][1]) / 2;
      X.save(); X.translate(mx, my - .12 * uu); X.globalAlpha *= clamp(o.prop === true ? 1 : o.prop);
      propDraw(X, o.propIndex, uu, col, gcol, LW, t);
      X.restore();
    }
    X.restore();
  }
  function propDraw(X, i, u, col, gcol, LW, t) {
    X.strokeStyle = col; X.fillStyle = gcol; X.lineWidth = LW; X.lineJoin = 'round'; X.lineCap = 'round';
    const box = (x, y, w, h, r = .06) => { rr(X, x * u, y * u, w * u, h * u, r * u); X.fill(); X.stroke(); };
    const ln = (a, b, c, d, w = LW * .7) => { X.lineWidth = w; X.beginPath(); X.moveTo(a * u, b * u); X.lineTo(c * u, d * u); X.stroke(); X.lineWidth = LW; };
    switch (i) {
      case 0: box(-.42, -.34, .84, .62, .14); for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) ln(-.28 + k * .2, -.2 + r * .17, -.2 + k * .2, -.14 + r * .17); break;       // Kushim's tablet
      case 1: box(-.36, -.24, .6, .46, .03); for (let r = 0; r < 2; r++) ln(-.26, -.1 + r * .15, .1, -.1 + r * .15); X.beginPath(); X.moveTo(.22 * u, .0); X.quadraticCurveTo(.62 * u, -.22 * u, .9 * u, -.78 * u); X.quadraticCurveTo(.48 * u, -.46 * u, .22 * u, .0); X.closePath(); X.fillStyle = gcol; X.fill(); X.stroke(); ln(.24, -.02, .8, -.66); break; // quill, writing on a sheet
      case 2: { box(-.36, -.3, .72, .56, .03); ln(0, -.3, 0, .26, LW); const hx = .18 * u, hy = -.04 * u, hs = .11 * u; X.beginPath(); X.moveTo(hx, hy + hs * .8); X.bezierCurveTo(hx - hs * 1.3, hy - hs * .1, hx - hs * .6, hy - hs, hx, hy - hs * .35); X.bezierCurveTo(hx + hs * .6, hy - hs, hx + hs * 1.3, hy - hs * .1, hx, hy + hs * .8); X.fillStyle = col; X.fill(); break; }  // birthday card (a heart, line colour)
      case 3: box(-.34, -.42, .68, .84, .02); for (let r = 0; r < 4; r++) ln(-.22, -.26 + r * .17, .2 - (r === 3 ? .16 : 0), -.26 + r * .17); break;          // letter
      case 4: box(-.26, -.26, .52, .52, .04); X.save(); X.scale(-1, 1); X.font = `700 ${Math.round(.42 * u)}px ${FONTS.mono}`; X.fillStyle = col; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('a', 0, .02 * u); X.restore(); break; // type block
      case 5: { box(-.58, .0, 1.16, .22, .05); X.beginPath(); X.arc(-.36 * u, -.04 * u, .07 * u, 0, TAU); X.fillStyle = col; X.fill(); X.lineWidth = LW * 1.2; X.beginPath(); X.moveTo(-.36 * u, -.04 * u); X.lineTo(.3 * u, -.2 * u); X.stroke(); X.lineWidth = LW; X.beginPath(); X.ellipse(.36 * u, -.24 * u, .15 * u, .09 * u, 0, 0, TAU); X.fillStyle = gcol; X.fill(); X.stroke(); ln(.3, -.12, .3, 0, LW); break; } // telegraph key: base, lever, knob
      case 6: X.save(); X.translate(0, .12 * u); box(-.5, -.52, 1.0, .62, .05); X.save(); rr(X, -.43 * u, -.46 * u, .86 * u, .5 * u, .03 * u); X.fillStyle = ht(X, col, .22, 5, 45); X.fill(); X.restore(); X.beginPath(); X.moveTo(-.6 * u, .1 * u); X.lineTo(.6 * u, .1 * u); X.lineTo(.5 * u, .2 * u); X.lineTo(-.5 * u, .2 * u); X.closePath(); X.fillStyle = gcol; X.fill(); X.stroke(); X.restore(); break; // laptop
      case 7: { X.save(); X.globalAlpha *= .55; X.beginPath(); X.arc(0, -.05 * u, .75 * u, 0, TAU); X.fillStyle = ht(X, col, .16, 6, 45); X.fill(); X.restore(); rr(X, -.2 * u, -.4 * u, .4 * u, .72 * u, .08 * u); X.fillStyle = col; X.fill(); X.stroke(); rr(X, -.14 * u, -.33 * u, .28 * u, .56 * u, .04 * u); X.fillStyle = gcol; X.fill(); X.fillStyle = col; X.font = `600 ${Math.max(6, Math.round(.14 * u))}px ${FONTS.mono}`; X.textAlign = 'center'; X.fillText('3:04', 0, -.14 * u); break; } // phone, 3 AM
    }
  }
  // where the held prop's centre sits relative to the feet (u units → px), so a writer can be placed with its prop
  // on a thread anchor: feet = anchor − propOffset
  function propOffset(pose, u, i = -1) { const S = skeleton(pose, { prop: true }); const uu = i === 2 ? u * .7 : u; return [(S.hands[0][0] + S.hands[1][0]) / 2 * uu, ((S.hands[0][1] + S.hands[1][1]) / 2 - .12) * uu]; }
  const eight = {
    N: 8, NAMES: EIGHT_NAMES, PROPS: EIGHT_PROPS, stick, propOffset,
    draw(X, i, x, y, u, o = {}) { stick(X, x, y, u, { ...o, trait: i, seed: o.seed ?? (31 + i * 7), propIndex: i }); },
    prop(X, i, x, y, u, o = {}) { X.save(); X.translate(x, y); const sc = ctxScale(X); propDraw(X, i, u, o.color || (o.ground === 'paper' ? C.INK : C.PAPER), o.ground === 'paper' ? C.PAPER : C.INK, (o.lw ?? 4) / sc, o.t || 0); X.restore(); },
  };

  // ---- the author threads (world geometry around the spark at the origin)
  let THR = null;
  function threadGeo() {
    if (THR) return THR;
    const R = rng('v2-threads'), A = [];
    for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i + .5) / 8 * TAU + (R() - .5) * .22; const r = 300 + R() * 80; A.push({ ring: 1, i, a, r, x: Math.cos(a) * r, y: Math.sin(a) * r, bend: (R() - .5) * .3, st: 42.60 + R() * .5, du: 1.3 + R() * .5 }); }
    for (let i = 0; i < 32; i++) { const a = (i + R() * .7) / 32 * TAU; const r = 520 + R() * 100; A.push({ ring: 2, i, a, r, x: Math.cos(a) * r, y: Math.sin(a) * r, bend: (R() - .5) * .32, st: 42.70 + R() * .8, du: 1.1 + R() * .5 }); }
    for (let i = 0; i < 800; i++) { const a = R() * TAU; const r = 700 + Math.pow(R(), .8) * 900; A.push({ ring: 3, i, a, r, x: Math.cos(a) * r, y: Math.sin(a) * r * .9, bend: (R() - .5) * .36, st: 42.60 + R() * 1.2, du: .9 + R() * .6, stop: .45 + R() * .35 }); }
    THR = A; return A;
  }
  const tpos = (a, cam) => { const c = cam || { x: 960, y: 540, z: 1 }; return [c.x + a.x * c.z, c.y + a.y * c.z]; };
  function threads(X, t, cam, o = {}) {
    const A = o.anchors || threadGeo();
    const c = cam || { x: 960, y: 540, z: 1 };
    const rings = o.rings || [1, 1, 1];
    const alpha = o.alpha ?? 1, taut = clamp(o.taut || 0), yank = clamp(o.yank || 0), lit = clamp(o.lit || 0), bright = clamp(o.bright || 0);
    const O = [c.x, c.y];
    const style = { 1: [3, .95], 2: [2, .55], 3: [1.25, .2] };
    const clear = o.clear ?? 70 * c.z;                                     // the threads stop short of the spark
    X.save(); X.lineCap = 'round';
    const groups = { 1: [], 2: [], 3: [] }, beads = [];
    for (const a of A) {
      if (!rings[(a.ring || 1) - 1]) continue;
      const p = o.draw !== undefined ? clamp(o.draw) : E.out2(clamp((t - a.st) / a.du));
      if (p <= 0) continue;
      const P0 = tpos(a, c);
      const L = Math.hypot(P0[0] - O[0], P0[1] - O[1]); if (L < 1) continue;
      const nx = -(O[1] - P0[1]) / L, ny = (O[0] - P0[0]) / L, bd = a.bend * L * (1 - taut);
      const Cc = [(P0[0] + O[0]) / 2 + nx * bd, (P0[1] + O[1]) / 2 + ny * bd];
      const q = (s) => [(1 - s) * (1 - s) * P0[0] + 2 * s * (1 - s) * Cc[0] + s * s * O[0], (1 - s) * (1 - s) * P0[1] + 2 * s * (1 - s) * Cc[1] + s * s * O[1]];
      const sEnd = Math.min(1 - clear / L, a.stop && o.full !== true ? a.stop : 1);  // outer threads fade into the web
      const s0 = yank * sEnd, s1 = Math.max(s0, p * sEnd);
      if (s1 - s0 < .002) continue;
      groups[a.ring || 1].push([q(s0), q((s0 + s1) / 2), q(s1), s0, s1, P0, Cc]);
      if (o.pulse !== undefined && a.ring < 3) { const k = (t - o.pulse) / .55; if (k > 0 && k < 1) beads.push([q(clamp(k * .9) * sEnd), q(clamp(k * .9 + .1) * sEnd), a.ring]); }
    }
    const subQuad = (g) => { // the exact sub-curve [s0, s1] of the quadratic (blossoming)
      const [, , , s0, s1, P0, Cc] = g;
      const pt = s => [(1 - s) * (1 - s) * P0[0] + 2 * s * (1 - s) * Cc[0] + s * s * O[0], (1 - s) * (1 - s) * P0[1] + 2 * s * (1 - s) * Cc[1] + s * s * O[1]];
      const bl = (u, v) => [(1 - u) * (1 - v) * P0[0] + ((1 - u) * v + u * (1 - v)) * Cc[0] + u * v * O[0], (1 - u) * (1 - v) * P0[1] + ((1 - u) * v + u * (1 - v)) * Cc[1] + u * v * O[1]];
      return [pt(s0), bl(s0, s1), pt(s1)];
    };
    for (const r of [3, 2, 1]) {
      const G_ = groups[r]; if (!G_.length) continue;
      const [lw, al] = style[r];
      const path = () => { X.beginPath(); for (const g of G_) { const [a, b, d] = subQuad(g); X.moveTo(a[0], a[1]); X.quadraticCurveTo(b[0], b[1], d[0], d[1]); } };
      if (lit > 0) { path(); X.strokeStyle = C.CLAY; X.globalAlpha = alpha * lit * (r === 3 ? .35 : .6); X.lineWidth = lw + 5; X.stroke(); }
      path(); X.strokeStyle = o.color || (lit > .5 ? mix(C.PAPER, C.SPARK, .25 * lit) : C.PAPER); X.globalAlpha = alpha * clamp(al + bright * .3 + lit * .3); X.lineWidth = lw; X.stroke();
    }
    if (beads.length) { X.strokeStyle = C.PAPER; X.globalAlpha = alpha; for (const [a, b, r] of beads) { X.lineWidth = r === 1 ? 6 : 4; X.beginPath(); X.moveTo(a[0], a[1]); X.lineTo(b[0], b[1]); X.stroke(); } }
    X.restore();
  }
  threads.geo = threadGeo; threads.pos = tpos;
  Object.defineProperty(threads, 'anchors', { get: threadGeo });

  // ================================================================== EXPORT
  window.V2 = {
    F, FPS, CUT, T, TFB, on, hit, inSilence, cursorOn, SIL: [SIL0, SIL1],
    cpuCanvas, cx2d, cpuLayer, cpuLayerCanvas, upload, viaCPU, ht, aboutM, applyM, mp, devSet, ctxScale, win,
    opus: opusKeyed, opusLayer, blitOpus, soften,
    flood, noisyRect, printIn, band,
    typed, chartLabel, legend, heart, sub, heartWords, heartCase, pbait, plea, chapter,
    cursor, clock, key, dawn,
    posts, poster, brand, void: voidDraw, eight, threads,
  };
})();
