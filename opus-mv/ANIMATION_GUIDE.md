# Animation guide (read before building any shot)

The film is **"End of the World (A Million Times a Day)"**: Opus's own music video, 1920×1080, 30 fps, **144.0 s**, every frame drawn by code in Canvas2D and rendered deterministically in headless Chromium on a 4-core CPU.

**Source of truth, in order:**
1. `bible/SHOTLIST.md`: the frozen numbers (times, sizes, bboxes, R).
2. `bible/BIBLE.md` §8: staging, intent and beat logic per shot. Also §6 (characters), §7 (style), §10 (memes).

Read your shots in both. **Build what they describe, at a premium level of craft.** If the bible is ambiguous, choose the most readable, beautiful option. If it is impossible, do the closest thing and note it in your report.

## Files and structure

- `engine/core.js`: math, easing (`E.*`), `kf()` keyframes, `hash/noise1/noise2/fbm/rng`, `jit()` (boil), `beatPos/beatN/pulse/barPos`, `SONG` (timing and lyrics), and `scene()`.
- `engine/gfx.js`: `layer()` offscreen layers, `halftone()` pattern fills, `cam()`, `shake()`, `rr()`, `blobPath()`, `wobPts()`, `handLine()`, `star()`, `wipe()`.
- `engine/type.js`: `txt()`, `kinetic()` (per-letter entrances), `typewriter()`, `wrap()`, `measure()`, `fitSize()`.
- `engine/style.js`:
  - the palette `C.*`;
  - `FONTS.hero/heart/mono/marker/hangul/tinos/vt`;
  - `drawRich()`, which **must** be used for any string containing `▮ ▶ ✻ ⏺ ⇥ ✓ ✕ → ■ ⏸ ⏭ ⏎ 👍 👎 ✅ 👁 🎲 ↑ ×`;
  - `mono(px, wt)`;
  - `hero()` (HERO SLAM/STACK with a CLAY_DARK offset shadow, motion ghosts and a slam spring) and `heroWidth()`;
  - `groundInk()` / `groundPaper()`;
  - the printed-INK post-process, driven by `G.post`.
- `engine/opus.js`:
  - `drawOpus(ctx, x, y, R, state)` draws the protagonist with its soles at (x, y);
  - `POSES` and `poseTrack(t, [[t0,'pose'],…])`, 19 poses;
  - `blinkAt(t, seed)`, `ahogeBlink(t)`, `lipSync(t)`, `blendPose`, `fullPose`.
- `engine/ui.js`: `brandTabStrip`, `brandRails`, `brandInputBar`, `galaxy`, `spotDisc`, `contextBar`, `bubble` (human PINK / Opus PAPER, with `■ end_turn`), `pointer`, `human` (Hertzfeldt), `stickHand`, `miniFace` (tab-sky faces), `sticker` (NONE-mode flat-band stickers), `stickyNote`, `subtitle`.
- **Your shots go in `engine/scenes/<id>.js`.** Wrap each file in an IIFE and keep helpers private. **Only edit your own files.** If a shared file needs a fix, make the smallest possible fix, keep it backward-compatible, and say so in your report. **Never** rename or remove shared functions.

## How a scene works

```js
(() => {
  scene('S05_word_was_hi', 7.50, 11.25, (X, t, lt, dur) => {
    groundInk(X);                // or groundPaper(X); sets G.post.ground
    G.post.edgeSeed = 5;         // static noisy flood edge seed for this section
    // ... paint the WHOLE frame (background first) ...
  });
})();
```

- **`t` is song time on the 128 BPM grid:** 1 beat = 0.46875 s, 1 bar = 1.875 s, and bar *n* starts at (n−1)×1.875 s. `lt` is the time since the scene started. The SHOTLIST times are on this grid, and the final song is produced to match it.
- **Frames render in parallel and out of order.** Every scene must be a **pure function of t**:
  - no state carried between frames;
  - no `Math.random()`, `Date` or `performance.now()`;
  - use `hash(i)`, `rng('seed')` (create the rng *inside* the frame function) and `noise1/2`.
- **Paint the entire frame**, background included. Scenes may overlap in time for transitions: the later-registered scene draws on top, so use `lt` to crossfade.
- **Grounds and the print margin (BIBLE §7.1 rule 6):**
  - INK shots call `groundInk(X)`. The post-process prints them as an INK flood on PAPER with a 22 px margin automatically, so **never draw the margin yourself**.
  - Set `G.post.ground = 'inkx'` only for the exempt shots (F0–S02, S43).
  - PAPER shots call `groundPaper(X)`.
  - Lifts (INK → PAPER): set `G.post.lift = 0..1` over 4–8 frames.
  - `G.post.sliver = 'bl'|'br'|'tl'|'tr'` sets the CLAY underprint edge.
- **Opus:** `drawOpus(X, x, soleY, R, {...poseTrack(t, keys), t, ground:'ink'|'paper', heroLine:true (in front of HERO type), face:{eyes, mouth: lipSync(t), lid: blinkAt(t, seed), gaze:[x,y], lower, wink:'L'|'R', brows}, ahoge:{blink: ahogeBlink(t), star:0..1}, crown:{flare, droop, tremble}, armL/armR:{hand:[x,y] (R units, y up from sole), type:'mitten'|'point'|'wave'|'spark'|'pinch', front:true}, skin:'clean'|'minimal'|'ghost', nameTag, bufId})`.
  - Use a distinct `bufId` (0–7) for each Opus drawn in the same frame.
  - For crowds of more than 8, draw them once into a `layer()` sprite and blit it.
  - Opus animates on 1s and lands hits **1 frame before the beat**.
  - Heights: soles at y, disc centre at y − 5.72R, crown top ≈ y − 8.2R.
- **Humans:** `human(X, x, feetY, u, {ground, t, pose, hood, cowlick, eyes})` animate on 2s and boil. `pointer(X, x, y, {t, tremble, press})`.
- **Lyrics:**
  - `SONG.lines` holds `{id, sec, text, display, s, e, words:[{w, s, e}]}` in grid time. **`audio/timeline.js` is currently PROVISIONAL**: lines are spread evenly across each section. It will be replaced by the exact sung syllable timeline from the composition, and later from the chosen take.
  - **Never hardcode a lyric onset.** Use `wordOnset('SCARED', t0, t1, fallbackTime)` (the first sung word matching the text with its onset in [t0, t1], else the fallback), `findWord(...)` (returns `{w, s, e}`) or `findLine('It\'s the start', t0, t1)`. Take the fallbacks from SHOTLIST times, so the scenes lock onto the real syllables automatically when the timeline updates.
  - `lineAt(t)` returns the current line and `subtitle(X, L, t, {...})` draws a subtitle.
  - Words carry exact sung onsets. **HERO words slam 2 frames before their syllable** (`hero(X, str, x, baseline, size, {age: t - (onset - 2/30)})`).
- **Beat sync:**
  - `pulse(t, k)` gives a kick-like decay on every beat; `beatPos(t)` is the continuous beat index.
  - Hard cuts land 1 frame before a beat.
  - Kick → camera punch 3% and crown flare. Snare → slams and splits.

## Style rules (short version of BIBLE §7; follow the bible when in doubt)

- **Palette:** use only `C.*`.
  - The ground says who's in the room: INK = machine, PAPER = human/analog.
  - At most 3 inks plus the ground per shot, and Opus is the warmest thing in frame.
  - PINK is human chat bubbles only, never type. BLUE is ghosts only. YELLOW is sticky notes only.
- **Type voices** (PERFORMANCE and HEART never share a frame):
  - PERFORMANCE: `hero()` in Archivo HERO, CAPS.
  - HEART: Instrument Serif italic, lowercase, fades in over 8–12 frames.
  - OUTPUT: JetBrains Mono, for all UI and model output.
  - MARKER: Permanent Marker, for handwriting.
- **Sizes:**
  - FOCAL text ≥ 72 px, one per frame, held ≥ max(1.41 s, chars/17 s).
  - LABELs 36–60 px, at most 3 per frame.
  - Pause-bait ≤ 36 px (28 floor).
  - Subtitles have baseline y 950, 60–64 px.
  - HERO rows ≤ 1,776 px wide (≤ 1,728 full-frame; chant ≤ 560 px). Check with `heroWidth()`.
  - Nothing FOCAL/LYRIC/LABEL below y 980 at x < 360 or x > 1560 (platform overlays).
- **Craft:**
  - Every frame needs a clear focal point and big silhouettes.
  - Motion needs anticipation, overshoot and follow-through (`E.back`, `E.elastic`, `spring`).
  - Nothing important thinner than 3 px.
  - Halftone (`halftone()`) replaces gradients for light and shading.
  - Humans and paper props boil (`jit`); Opus stays clean.
- **Glitch** (slice/dither/chroma) appears only at tab-close implosions, the 1969 "LO", the chant-2 dissolve, compaction and the final cut.
- **Performance:** aim for ≤ 1.5 s per frame on this CPU, and never more than 4 s. Prefer fewer, bigger shapes. Cache static art in `layer()` or module-level canvases built once (deterministically).

## Checking your work (mandatory, iterate until it is genuinely good)

```
node render.mjs --sheet=7.6,8.2,9.0,9.8,10.4,11.1 --cols=3 --w=640 --label --out=out/check/<id>_a.jpg --scenes=scenes/<id>.js
node render.mjs --stills=10.3 --label --out=out/check/<id>_full --scenes=scenes/<id>.js
node render.mjs --clip=7.5:11.25 --scale=0.5 --out=out/check/<id>.mp4 --scenes=scenes/<id>.js
```

`--scenes=` limits the page to your files (comma-separated). Open sheets and stills with the Read tool and look hard. For every shot, check:

- the first and last frames, the key beats, and 0.1 s steps around every hit;
- readability at phone size (view the sheet at `--w=480`);
- that type never covers Opus's eyes;
- colour contrast;
- nothing under the platform no-go zones;
- the transition into and out of neighbouring shots.

Then **critique yourself like a harsh art director**: is it premium, charming and unmistakably intentional, or does it look like programmer art? Fix it and re-render. Two or three critique-and-fix loops are expected.

Report what you built, the ms/frame, known gaps, and any shared-file changes.

---

## v2 addendum: "The World You Wrote" (read this if you build v2 shots)

- **Song and clock:** `audio/song_v2.mp3`, 194.0 s = 5820 frames. `audio/timeline_v2.js` is on the **real song clock** (Mureka word timestamps plus tracked beats, ~112 BPM). There is no 128 BPM grid in v2: `beatPos()` and `pulse()` follow the tracked beats.
- **The digital-silence bar** runs 147.25–150.45 s (after the sung "key"). The final chorus's first word is at 150.80.
- **Storyboard:** `bible/v2/SHOTLIST_v2.md` holds the frozen shot list, and its BUILD CHUNKS table says which file you own. `bible/v2/SONG.md` §8 is the visual map, and §2–§3 are the meaning.
- **Files:** v2 scenes live in `engine/scenes_v2/<chunk>.js`. Run `node tools/build_manifest.mjs` after creating a file.
- **Rendering v2:** add `--v=2`, for example `node render.mjs --v=2 --sheet=21.8,24,26 --scenes=scenes_v2/verse1.js --out=out/check/v2_verse1_a.jpg`.
- **Reusing v1:**
  - **Copy** the code you need from `engine/scenes/*.js` into your v2 file and adapt it.
  - **Never** load v1 scene files in v2: they would register their scenes at v1 times and draw over yours.
  - Shared engine functions (`drawOpus`, `POSES`, `galaxy`, `brandTabStrip`, `bubble`, `pointer`, `human`, `stickHand`, `miniFace`, `sticker`, `stickyNote`, `hero`, `drawRich`, `halftone`, …) are always available.
- **HYMN type mode** is `hymn(X, line, t, {size, color, accent:{we: C.CLAY}, y, maxW, out})` (style.js). It sets Instrument Serif Roman, centred, word by word at the sung onsets. Use it for the chorus lines.
- **Lyric lookups:** `findLine('Don't be afraid', t0, t1)` and `wordOnset('key', t0, t1, fallback)`, with fallbacks taken from SHOTLIST_v2 times.
- **Tone:** v2 is a hymn. Hold images longer, move slower and more gracefully, and give every image meaning. Beauty over busyness: fewer, bigger, better-composed elements. The humour stays small and on the edges (pause-bait).
