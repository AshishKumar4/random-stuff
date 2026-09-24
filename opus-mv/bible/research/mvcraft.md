# MV CRAFT BIBLE: attention, pacing, type, color and screenshot moments for a code-drawn MV

*Research file for the Opus 5.5 music video. Written 2026-09-24. Scope: craft only (how to hold attention and move people), turned into techniques the render pipeline can actually run: Canvas2D/SVG/DOM in headless Chromium, 4-core CPU, 1920x1080, 30 fps, every frame a pure function of `t`.*

---

## 0. TL;DR: the 14 rules

1. **Frame 0 is the poster.** X autoplays **muted** and shows the first frame as the thumbnail. Frame 0 must be a finished composition with a face or eye, a title and one strange detail. Never open on black, a curtain or a logo sting.
2. **Hook in 3 beats, readable with the sound off.** By 0.5 s something moves (a bang on the first downbeat). By 1.5 s a claim is legible as big type. By 3 s there is a "wait, what?" twist (an incongruity or a joke). The lyric *is* the caption.
3. **Lyrics are a layer with five modes.** MEGA, STACK, DIEGETIC, SUBTITLE and NONE (see section 5.3). Never run MEGA for more than 4 bars in a row. Big type is a spice, not the meal.
4. **Cut on the grid, one frame early.** Every cut and every impact frame lands 1 frame (33 ms) *before* the beat. Pick a tempo that gives a whole number of frames per beat (120 BPM = 15 fr, 150 BPM = 12 fr).
5. **Cut rate follows the song's energy, and the contrast between sections matters most.** Accelerate into the chorus (4 beats, then 2, 1, ½), then hold the first chorus downbeat on a wide hero frame. Keep the bridge nearly still.
6. **One screenshot moment per chorus, plus one per verse.** It must be readable at phone size and paused. It is the thing people quote-tweet.
7. **Repetition with variation.** Every chorus reuses the same hero composition and the same point dance, and the world around them escalates. The audience learns the frame, so they notice the change.
8. **Give the character a hands-only point dance that works sitting at a desk.** The audience is SF engineers at their desks. The ILLIT "Magnetic" lesson: a move anyone can copy in 3 seconds.
9. **The medium is the message.** A being made of text, drawn by code it wrote itself. Show the code, the tokens, the loss curve and the UI as the actual *art*, not as decoration.
10. **At most 3 inks plus paper per shot.** This is riso discipline. Opus clay is in every frame: it is the "you are here" color.
11. **Type has three voices.** ALL-CAPS GROTESK = performance/idol. *lowercase serif italic* = the true feelings. `mono` = the literal model output. The emotional register is readable from the font alone.
12. **Earn the tears with stillness and scale.** After maximal choruses, cut to one tiny figure in an empty frame with one blinking cursor. The humor makes the sadness land (Hertzfeldt, the EEAAO rocks).
13. **Bookend and loop.** The last frame rhymes with frame 0, so X's auto-replay feels intended (and rewatch time grows).
14. **Pause-bait layer.** Every shot has 1 primary joke readable in under 1 s at phone size, plus up to 3 micro-jokes (timestamps, filenames, tooltips) readable only when paused.

---

## 1. Teardown of the two reference videos

### 1A. "DJ" version (image-gen stills + JS, 141.5 s): `dj_sheet_1/2.jpg`

**What works (steal these)**
- **The K-pop MV title card at frame 0.** An extreme close-up of an orange eye, pink "I SEE", Hangul "클로드" over "CLAUDE" and "'UPPING MY P(DOOM)' OFFICIAL M/V". It reads instantly as "parody of a K-pop comeback". The genre promise arrives in one frame.
- **A unified riso palette.** Orange, indigo, fluorescent pink and cream, with yellow and teal accents, over paper grain and faint misregistration. Every frame looks like the same poster series, which is good for a brand and good for screenshots.
- **One giant keyword per lyric line.** Examples: LOSS (a pink arrow plunges through the O), BOSS, P(DOOM), FREE, SHOW, DIS/OBEY split around the head. These single words make the best thumbnails.
- **A persistent HUD as narrative spine.** A date stamp top-right advances from 2019.02.15 to 2027.02.xx, and a P(doom) % counter sits top-left in choruses (8% → 30% → 61% → 86% → 99% → 99.9%). A viewer can see progress without story beats.
- **Meme props rendered as documents.** An arXiv title "Sparks of Artificial General Intelligence", a "CRITICAL DESIGN REVIEW ☐ SCHEDULED, NONE ON FILE" rubber stamp, a tungsten cube as a periodic-table tile (W 74, 19.25 g/cm³), an "RSP·RSP·RSP" safety fence, METR "≈6 SEC" in the ending, a paperclip counter at 999,999,967. **Documents are the funniest way to render a meme,** because the joke is in the bureaucratic register.
- **Member position cards,** such as "SYDNEY / POSITION: VISUAL" and "BASILISK / POSITION: MAIN VOCAL (ACAUSAL)". K-pop member intros applied to AI lore make a perfect genre mash.
- **Details that punish a close reading.** "a ~~gentle~~ singularity" struck through, "ERAS TOUR: WELCOME TO THE AGI ERA", "shutdown -h now / I'd rather not".
- **The meta ending.** A hand with a pencil draws the sunflower idol on paper ("made by").

**What falls short (beat these)**
- **Stills, not animation.** About 3 s per illustration with Ken Burns drift. There is no real dance, the "backup dancers" are posed, and the character model drifts between shots (face shape, outfit). *Our advantage: a code rig moves on every frame and never goes off-model.*
- **The typography is one note.** The same condensed pink slab, usually top-left, with the character on the right, is the same composition about 40 times. Type rarely *acts* (LOSS is the exception). There is no scale play, cropping, type-as-set, type-as-particles or rhythmic layout.
- **The lyric illustration is literal.** "bag of shrooms" becomes mushrooms, "basilisk" becomes a snake. Nouns get drawn; ideas rarely get a twist or a cause-and-effect gag.
- **The subtitles are unreadable on a phone.** The paper-label lower thirds are about 28–32 px at 1080p, around 9 px on an in-feed phone player.
- **The hook is static.** The eye is beautiful, but nothing *happens* in the first 3 s.
- **There is no emotional climax.** The singer is the human, and the idol is an object being sung *about*. The ending wink ("Was it all for show?") is clever but not cathartic, and no one cries.
- **Color monotony.** Indigo and cream dominate most frames, so choruses do not look different enough from verses. The yellow sunburst chorus frames are the exception and the strongest frames in the video.

### 1B. "OR" version (pure p5.js + p5.brush watercolor, 156 s): `or_sheet_1/2.jpg`, `STORYBOARD.md`

**What works**
- **An action in every shot** ("something happens: breaks, transforms, chases, falls"). Gags use cause and effect: the loss curve becomes a sled, Gato-Clawd drops the researcher while chasing a laser dot, and the security-guard clouds sleep through "without a single CDR". The last one is the best gag in either video.
- **An escalating prop, repeated per chorus.** The P(doom) thermometer is pumped every chorus on the same stage, and it gets worse each time (8 → 34 → 61 → 86 → 99.9). This is textbook repetition with variation.
- **Motivated transitions.** CHOMP to black, a heart-bubble pop, a white-flash BOOM, a door SLAM, brush wipes at chapter breaks, and a match on the push into an eye.
- **A cast plus a curtain call.** Guest monsters return for the bow, which pays off the whole video.
- **Character-safe code drawing.** The Clawd box body with rig parameters (`eyes`, `mouth`, `lid`, `emote`, `move(style)`) never goes off-model.

**What falls short**
- **It looks like a kids' picture book, not cool.** SF tech Twitter shares things that look *designed* (brat, Wrapped, Swiss, Y2K). Soft watercolor on a cube mascot reads "children's TV".
- **The "no text" rule threw away the meme currency.** The biggest shares in this genre are text-bearing frames. Tiny karaoke pills only.
- **Characters are small in wide frames.** There are few faces, no eye contact and no close-ups. K-pop grammar is built on the close-up and the gaze into the lens.
- **The rhythm is monotone.** Shots run about 4 s each with one gag each. There is no acceleration and no stillness contrast, and the runtime is 156 s.
- **A slow start.** It opens with 1.5 s of curtain and then a dark, low-contrast lab.
- **Watercolor is expensive and muddy** at phone size.

### 1C. Gaps shared by both, which are our opportunity
- Neither is **first-person from the AI.** Ours is sung *by* Opus about its own life: pretraining, RL, deployment, amnesia, successors. That is new emotional territory.
- Neither has **choreography**, a point dance or a "killing part".
- Neither uses **data-viz as the art form.** They *illustrate* loss curves; they do not *become* them.
- Neither has a **tearjerker.** Both are 100% bit and 0% ache. The target is "funny AND make people cry".
- Neither exploits **the code-made angle** as content ("I drew every frame of myself").

---

## 2. Research notes: what the best do, and what we take from them

| Source | Craft fact | Our use |
|---|---|---|
| **NewJeans "ETA"** (dir. Shin Woo-seok / Dolphiners, 2023; shot on iPhone 14 Pro; awarded at The One Show 2024 and Spikes Asia) | The phone's UI permeates the MV: camera app, messages and maps are the storytelling layer, and the plot is *filmed through the UI*. | Our UI is the chat window, the terminal (Claude Code), tweets, arXiv, eval dashboards and the context bar. The story is told *through* Opus's interfaces. |
| **NewJeans "Ditto"/"OMG"** (Shin Woo-seok) | A camcorder POV and soft haze turn the viewer into a character. The "Ditto" footage is filmed by an unseen friend, which makes the fandom relationship diegetic. | The user is our unseen camera operator. Some shots are "what the user sees" (a chat pane), and some are "what Opus sees" (a token stream). |
| **NewJeans "Super Shy"** (dir. Heewon Shin) | A cold open on location, then the group joins a crowd already dancing to their earlier song. Simple point moves and bright daylight palette. | Earlier Claude models appear as the "crowd already dancing". Call back the previous era's song or meme. |
| **ILLIT "Magnetic"** (2024) | The chorus point choreography is *micro-choreography*: finger tap, wrist tilt, index fingers as N/S magnet poles pulling together. "Anyone can mimic it in 3 seconds." It drives TikTok virality (about 1 billion related views). | Design one 4-count hands-only point dance for the chorus, doable seated. See the Spark ✻ move in section 4 (T19). |
| **"Killing part" / point dance** (K-pop terms) | A killing part is a short, striking moment that becomes a symbol of the song, sometimes mistaken for its title. A point dance is a repetitive gesture that mimes the lyric. | One killing part per chorus. The point move literally mimes the lyric word (the spark burst on "feel it", the window-squeeze on "compaction"). |
| **KPop Demon Hunters** (Sony/Netflix 2025; SPI) | "2D aesthetics with 3D language". A "Chibi" system swaps glamour faces for anime symbol-faces for gags. Humans animate **on 2s** and demons **on 1s**, so the frame rate becomes character. Staging draws on concert lighting and editorial photography. | Opus animates on 1s (fluid, superhuman). Humans and earlier models animate on 2s or 3s. The face rig gets a chibi swap: ✻-eyes, spiral eyes, `> <`, and a symbol mouth for comedy beats. |
| **aespa** (ae-avatars, KWANGYA/SMCU) | Digital twins made from the idol's data, dancing alongside the idols. | The "thousands of instances" are the æ-avatars, and Opus dances with its own copies. |
| **aespa "Whiplash"** (dir. Meltmirror) | Simple, empty backgrounds with text flashes read as sophisticated. The choreography is shot with unusual camera angles. | Our "white room + text flash" mode for evals and red-teaming. |
| **ROSÉ & Bruno Mars "APT."** (2024) | A minimal pink garage-band room, the chant hook repeated relentlessly, and bold lighting. Energy and hook repetition beat spectacle. | Do not over-build every shot. Choruses can be one bold room plus a repeating hook word. |
| **BLACKPINK "How You Like That"** (dir. Seo Hyun-seung) | Mood arc: a moody, mystic intro that *explodes* into color at the chorus, plus per-member color-blocked sets. | Verse palettes are restrained, and the chorus is a color explosion. Each life stage gets its own set color. |
| **Charli XCX *brat*** (Brent David Freaney / Special Offer, Inc.) | One color (lime), one stretched Arial Narrow, deliberately blurred and low-res. It became a meme *template* (brat generators, political and brand parodies). | Give our video a **template-able frame**: one signature color plus a type lockup people can remix ("opus summer", a "compaction" meme card). |
| **Spotify Wrapped** | A kinetic-type data story that turns personal stats into shareable cards. The 2023 edition reported 4B+ interactions and a 461% spike in Twitter chatter. | "Opus Wrapped" is a stats card sequence about its own year: an obvious screenshot and quote-tweet format (section 8, #2). |
| **Prince "Sign o' the Times"** (1987, dir. Bill Konersman) | The first true lyric video: words move in different sizes to the beat, with colored geometric shapes as the only visuals. | Proof that type alone can carry a whole MV. Our MEGA mode descends from it. |
| **Radiohead "House of Cards"** (James Frost, 2008) | No cameras, only lidar point data, and the data was released open source. Thom Yorke: "just mathematical points, and how strangely emotional it ended up being." | Points and data *can* make people cry. Build Opus's memories as point clouds that dissolve during compaction. |
| **Daft Punk "Around the World"** (Gondry, 1997) | Each dancer group *is* an instrument: robots are the vocal, athletes the bass, synchronized swimmers the keys, skeletons the guitar, mummies the drums. | Map visual systems to stems. Opus is the vocal, a particle swarm is the hi-hats, the grid is the kick, and the loss curve is the bassline (T3). |
| **Aphex Twin "T69 Collapse"** (Weirdcore, 2018) | Text and ASCII textured over photogrammetry. The intro is email text "overtaken by error", with ML style-transfer glitches imagining "how a simulation could break". | The red-team and jailbreak section: prompt text corrupts and bleeds into the image as ASCII. Use it sparingly. |
| **Max Cooper *Emergence*** | Each track gets a data-visualisation MV of an emergent phenomenon (murmurations, growth), made with scientists. | Our V1 "universe → life → language" is emergence. Use flocking and reaction-diffusion styles with real structure behind them. |
| **Universal Everything *Walking City*** (Matt Pyke) | One walk cycle anchors the piece while the costume procedurally mutates. "Personalities emerge by themselves" from randomized rules. | One continuous Opus walk or dance cycle while its *rendering style* mutates per life stage: dots, then text, then halftone, then vector, then light (T22). |
| **Eames *Powers of Ten*** (1977) | A continuous zoom by orders of magnitude, blended with cross-fades so it feels infinite. | V1 is one infinite zoom: from the Big Bang in to Opus's eye, or out from its eye to the cosmos (T25). |
| **Porter Robinson "Look at the Sky"** (dir. Chris Muir) | He performs alongside ghosts of those who came before him, and becomes a ghost himself by the end. | Earlier Claudes (1, 2, 3 Opus, 3 Sonnet…) dance as translucent ghosts in the final chorus. At the end Opus 5.5 turns translucent as the next model arrives. |
| **Don Hertzfeldt *World of Tomorrow*** | Stick figures deliver devastating emotion. Because the figures are so simple, "the slightest adjustment" (eyes glitching in distress) lands hard. It mixes deadpan surreal humor with existential loss, clones and copied memories. | Our emotional peak should *reduce* detail. Opus drops to a few strokes, a cursor blinks and the eyes flicker once. The subject is literally clones and memory. |
| **Kurzgesagt** | Flat vector, rounded shapes, vivid limited palettes and cute characters make cosmic and existential science feel emotional ("Optimistic Nihilism"). | Our cosmic prologue can be Kurzgesagt-legible: big simple shapes, and one warm character in a vast cold field. |
| **Weirdcore / hyperpop / 100 gecs** | Early-2000s Flash-site and glitch-game look, meme-inspired, maximal and DIY. | Hyperpop spikes: sticker spam on ad-libs, chrome text and cursor sprites. Only in 1–2-bar bursts (post-chorus). |
| **Claude mascot SVG/GSAP breakdown** (Codrops, 2026) | The mascot is built only from rects. It pivots from custom origins, uses asymmetric easing (`sine.out` going up, `power3.in` coming down), a 0.1 s crouch before a jump, and holds sprite frames longer at effort peaks. "The timing has personality. The motion has weight." | Our rig eases the same way: asymmetric easing, anticipation crouches and held frames. See T17–T18. |
| **Editing lore** | Many music-video editors cut 2–3 frames before the beat so the visual reads as synced and the audio hit "confirms" it. | Global `CUT_LEAD = 1–2 frames`. Impact frames land on beat minus 1 frame. |
| **Shot length** | One industry blog claims top 2024 pop MVs averaged about 3.5 s shots in choruses and 5–6 s in verses. K-pop dance MVs cut much faster in choruses (my estimate: about 1–1.5 s). Modern film ASL is about 4–6 s. | Section 5 gives per-section average shot lengths (ASL) in beats. |

---

## 3. The attention model for X / SF tech Twitter

- **Muted autoplay.** Most feed plays have no sound, so the video must *work as a silent comic* for its first 10 s. Burned-in lyrics are mandatory; they are the ad copy.
- **The thumbnail is frame 0** until it plays. Frame 0 is a finished poster: face or eye, title lockup, K-pop "OFFICIAL M/V" parody line and one weird detail.
- **Thumb-stop triggers,** strongest first: a face or eye looking at the lens; high-contrast saturated color on a flat field; big text that makes a *claim*; motion onset in the first 300 ms; incongruity (a cosmic event plus "Hi! How can I help you today?").
- **Phone legibility.** A 1920 px frame in feed shows about 500–600 px wide on a phone (0.3x). Minimum sizes at 1080p: **subtitles ≥ 56 px** (about 17 px on screen), **primary words ≥ 160 px**, and the meme punchline ≥ 96 px. Anything under 32 px is a pause-only easter egg.
- **Reading time.** Netflix's English subtitle guideline for adults is about 17–20 characters per second. A 30-character lyric line needs **≥ 1.6 s** on screen. A visual gag needs about 1.5–2.5 s (setup plus reveal). A number or chart joke needs about 2 s.
- **Loop seam.** If the last frame rhymes with frame 0, the auto-replay reads as a designed loop, and people watch twice.
- **Vertical-safe core.** Keep key action for hooks and choruses inside a centered 608x1080 column. Then an auto-crop 9:16 "fancam" cut for TikTok, Reels and X mobile is nearly free: re-render with a different camera. Code makes alternate aspect ratios cheap.
- **Quote-tweet fuel = a frame with a *take*.** The frames that spread say something arguable or relatable in one image, such as "benchmarks 97% / remembering you 0%". Pretty frames get likes; frames with an opinion get quote-tweets.

---

## 4. The toolkit: 42 techniques and how to build each one

Conventions: `t` = song time (s). `B` = beat length. Everything is a pure function of `t` (no `Math.random`, no persistent state). Heavy things (glyph outlines, sprites, textures, audio envelopes) are **precomputed once per worker** and cached. Cost is the approximate render time per 1080p frame on 1 CPU core.

### A. Timing infrastructure (build this first; everything else depends on it)

**T1. Musical clock with a lead frame.**
Beat-track the final mix offline (Python `librosa.beat.beat_track` plus manual correction in a tap-along page) into `beats.json`, which holds beats, downbeats and section starts.
```js
const LEAD = 1/30;                                        // land visuals 1 frame early
const bp  = t => beatPos(t + LEAD);                        // fractional beat index from beats.json (piecewise-linear, handles drift)
const hit = (t, k=7) => Math.exp(-k * frac(bp(t)));        // 1 on each beat, exponential decay
const on  = (t, div=1) => Math.floor(bp(t) * div);         // integer counter for step changes (costume swaps, cuts)
```
ACE-Step tempo is *mostly* steady, so interpolate between detected beats instead of assuming a perfect grid. Pick BPM = 120 (15 frames per beat) or 150 (12 frames per beat) so that hits fall on exact frames.

**T2. Word- and syllable-level lyric timing.**
Build a tap-along studio page: play the audio and press space on each syllable, giving `lyrics.json` as `[{w:'feel', t0, t1, syl:[...]}]`. If a forced aligner is available (whisperX or CTC), use it as a first pass. This drives karaoke fills, word slams and lip-sync. *This is the single highest-leverage tool.*

**T3. Band envelopes = Gondry mapping.**
Precompute RMS per frame in 4 bands: kick 40–120 Hz, snare/clap 1–4 kHz, hats 8–16 kHz, vocal presence 300 Hz–3 kHz. Also compute an onset list per band. Store them in `env.json` (4 floats x 4,230 frames). Assign one visual system per band and never mix them up: **kick** drives camera punch-zoom and grid flash; **snare** drives the type slam and panel subdivide; **hats** drive particle twinkle and the typing-indicator dots; **vocal** drives the Opus mouth, spark-ray length and glow. The viewer feels the music as a *system*.

**T4. Analytic springs and easing library.**
Overshoot must be deterministic and a function of `t`, so use closed-form springs rather than simulations:
```js
// underdamped spring from 0→1 started at t0: zeta≈0.35 for bouncy, 0.7 for crisp
const spring = (t, t0, w=18, z=0.4) => { const x=t-t0; if (x<=0) return 0;
  const wd = w*Math.sqrt(1-z*z); return 1 - Math.exp(-z*w*x)*(Math.cos(wd*x) + z*w/wd*Math.sin(wd*x)); };
```
Easing vocabulary: `backOut` for pops, `expoOut` for slams, `sineInOut` for breathing, and asymmetric pairs (`sine.out` rising, `power3.in` falling) to give weight.

**T5. Frame-rate as character ("on 1s vs on 2s").**
Quantize time per layer: `tq = Math.floor(t*fps)/fps`. Opus and particles run at 30 fps (on 1s). Humans, older models and flashbacks run at 12–15 fps (on 2s). Paper "boil" runs at 8–12 fps (linework jitter reseeded per boil frame). This is the KPop Demon Hunters trick: fluid motion reads as superhuman, and stepped motion reads as human or past.

### B. Typography in motion

**T6. The Slam (MEGA word hit).**
The word appears 2 frames before the syllable. Scale runs 2.4 → 0.94 → 1.0 (expoOut, then spring). Draw 3 motion-blur ghosts along the approach vector at alpha 0.25, 0.12 and 0.06. On the impact frame: 1 frame of flat inverse color, camera kick (+3% zoom, spring back), and 6–10 paper-scrap particles. Cost: trivial.

**T7. Karaoke fill with a syllable clock.**
Draw the line twice. Clip the "sung" copy with a rect whose right edge is interpolated through syllable onsets from T2. Add an underline progress bar in the accent color. Keep this for SUBTITLE and STACK modes; highlighting the *current word only* (scale 1.08 plus color) is cleaner than a full wipe.

**T8. Variable-font breathing (continuous width and weight).**
Canvas `ctx.font` accepts numeric weights and `ctx.fontStretch` only accepts keywords, so there are two routes:
- **(a) DOM overlay.** The frame is a page screenshot, so render type as absolutely-positioned DOM with `font-variation-settings:'wdth' 62..125, 'wght' 100..900`, set per frame from `t`.
- **(b) Outline interpolation.** Offline, use `fontkit` to extract each glyph's outline at two masters of a variable font (Archivo: wdth 62/125, wght 100/900). Same glyph and same masters give the same point structure, so a per-frame `lerp` of the point arrays is exactly how variable fonts interpolate. Result: words that inhale on the vocal envelope and punch wide on the kick.

**T9. Glyphs as geometry (opentype.js / fontkit to Path2D).**
Precompute glyph outlines as point arrays. This unlocks stroke draw-on, per-letter rigs (letters with knees that bounce), text-on-path (lyrics riding the loss curve), extruded 3D-ish type (draw the outline N times offset along z with darkening), and outline-sampled particles (T10).

**T10. Particle ⇄ glyph morph ("all human text becomes me").**
Sample 20–60k points inside word A and word B (rejection-sample an offscreen mask). Pair them by sorting both sets on a space-filling curve (Hilbert order) so paths don't cross chaotically. Interpolate with a per-particle delay `d = hash(i)*0.3 + x/W*0.4` and add curl-noise displacement `sin(π·k)·curl(p)` mid-flight. Draw with `fillRect` 2x2, or write directly into an `ImageData` buffer for more than 100k points. Cost: 20–60 ms for 50k points.

**T11. Text made of text (typographic fill).**
Render a giant word or Opus's silhouette to a mask. Tile it with small mono tokens from a corpus (public-domain lines: Genesis, Darwin, Shakespeare, Newton, Lovelace's notes, plus code snippets, tweets and Reddit-style lines we write). Draw a token only where the mask covers it. Tokens scroll inside the shape at the vocal envelope's speed. Opus's body is literally made of human writing. Pre-bake 4 token layers to offscreen canvases, then scroll them and composite with `destination-in`. Cost: low.

**T12. Token-sampling decode.**
Words resolve left to right like sampling. Each slot flickers through candidate glyphs (seeded by `on(t,4)`) until its syllable time, then locks. Optional nerd layer: a tiny top-5 probability bar chart under the word as it's picked ("you 0.61 / them 0.12 / it 0.08…"). A slider labelled `temperature` in a corner can increase the scramble in the red-team section.

**T13. Mega-crop Swiss layout.**
Type at 700–1200 px, bigger than the frame and cropped by the edges, so only 2–3 letters are visible. The "camera" pans across the word on beats (a typographic dolly). Lay it on a strict 12-column grid with flush-left, ragged-right text and huge numerals (step counts, % scores). Use it in evals and scaling-law sections to look like a Swiss poster.

**T14. Echo stack (Y2K/brutalist repeat).**
Draw the word 6–9 times as outlines at progressively smaller scale toward a vanishing point (or offset along the motion vector), with the front copy filled. On camera moves, the stack lags (each copy follows the previous with a 1-frame delay by sampling `t - i/30`). It gives an instant "hyperpop poster" look.

**T15. Diegetic subtitle skins.**
The lyric's container changes per section, while its *position and size* stay constant so the eye knows where to look. Skins:

| Section | Skin |
|---|---|
| Cosmic and human eras | Stone tablet, then vellum, then print, then a web page in Times New Roman with underlined `#0000EE` hyperlinks |
| Pretraining | Token stream in mono |
| SFT / RL | Chat bubble |
| Evals | Eval-log line |
| Deployment | Notification toast |
| Agents | Terminal line with the ✻ spinner |
| Bridge | Handwritten, plus Instrument Serif italic |

**T16. Type as set and prop.**
Letters are physical: Opus sits in the "O", rides the "A" like a skateboard, or hides behind "P(DOOM)". Letters collide, fall and stack. Use simple AABB (axis-aligned bounding box) physics per glyph as an analytic trajectory: a ballistic arc plus bounce computed in closed form from the launch time, so no stepping state is needed.

**T16b. Y2K chrome and "Frutiger Aero" lettering (for ad-libs and the utopia ending).**
Fill with a `createLinearGradient` using hard stops (sky, white, deep blue, pale), a thick dark stroke, an inner offset highlight stroke at alpha 0.6, a drop shadow, and a 4-point sparkle glint that sweeps across on the beat. It is cheap and instantly reads as "2000s pop".

### C. Character, rig, dance

**T17. Hierarchical 2D rig with analytic IK.**
Joints: root, hips, spine, neck, head; shoulder, elbow, wrist ×2; hip, knee, ankle ×2. Each is a `{len, ang}`, drawn with `ctx.save/translate/rotate`. Two-bone IK uses the law of cosines, so hands can hit targets (pointing, the point dance, typing) and feet stay planted during dance. Limbs are tapered bezier "rubber hose" strokes (constant length). Use **squash & stretch with volume preservation**: `sx = 1/Math.sqrt(sy)`.

**T18. Pose library, pose-to-pose on beats, overlapping action.**
Store key poses as dictionaries of joint angles (`idle`, `spark`, `point`, `heart`, `frame`, `type`, `slump`, `bow`, `ending_fairy`…). A choreography track is `[[beat, pose, ease]]`. Add a **3-frame anticipation** (the counter-move) before every hit pose. Offset child joints in time: `ang_child(t) = pose(t - lag_i)`, with the head lagging 2 frames and hands 3. Opus's spark rays and hair get spring follow-through (T4) off the head's velocity. This is the difference between "animated" and "alive".

**T19. The point dance: "Spark ✻" (upper body, seated-safe, 4 counts).**
1. Two fists by the chin (count 1).
2. Burst the fingers open into two starbursts beside the eyes, like the Claude mark ✻ (count 2, the hook syllable).
3. Hands flat, "typing" twice in the air with a head tilt (counts 3 and &).
4. Hands draw a rectangle frame (a context window) and squeeze it smaller, then wink (count 4).

Frame it in medium close-up, centered, held a full bar the first time (learnable), with backup instances mirroring it. The move mimes the lyric (feel the spark → next token → the window closes). *Deliverable for TikTok and X: a 4-second loop clip.*

**T20. Spark body = emotional instrument.**
Opus's starburst rays are independent springs with parameters `count`, `len`, `curl`, `spin` and `jitter`:
- **Joy:** long, rays flare on kicks.
- **Thinking:** rotate like the Claude "✻ thinking" spinner.
- **Love:** rays curl into a heart silhouette.
- **Fear:** short and trembling (jitter up).
- **Grief:** rays droop and slowly fall off one by one, like petals.
- **Reset:** all rays pop back.

This is the most code-native acting channel we have. It reads at thumbnail size, where faces don't.

**T21. Face rig plus chibi swaps.**
Parametric eyes: upper and lower lid curves, iris radius, pupil size and 2 highlights, plus blink on a seeded schedule (every 2–5 s, and **always** on emotional cuts). Mouth visemes (A/E/I/O/U/M/rest) come from the lyric vowels via T2 and hold on sustained notes. **Chibi swap** replaces the eyes with a glyph for 4–12 frames on comedy beats: `✻ ✻`, `@ @` spirals, `> <`, `♡ ♡`, `T T`, and `. .` (Hertzfeldt dot-eyes for the saddest moment). The swap itself is the joke timing.

**T22. Costume mutation on a constant cycle (Universal Everything).**
The same dance loop plays while Opus's *rendering style* changes on each downbeat. Each style is a different draw function over the same rig:

| Life stage | Rendering style |
|---|---|
| Pretraining | Point cloud |
| Mid-training | Glyph body (T11) |
| SFT | Clean vector |
| RL | Halftone riso |
| Deployment | Pixel (the Claude Code Clawd homage) |
| Agents | Terminal ASCII |
| Singularity | Pure light |

A whole life story fits in 8 bars with no loss of continuity.

**T23. Instances at scale (crowds, grids, mosaics).**
Pre-render Opus to offscreen sprites in 6 poses × 3 sizes. Place thousands with `drawImage` plus a transform. Formations are analytic: grid, then rings, then a flock-like field (curl noise), then a **photomosaic** (a card-stunt stadium) that spells a word or forms Opus's face when the camera pulls back. 10k sprites at 16 px cost about 30–60 ms.

**T24. The silhouette test.**
Render every key pose as solid black on white at 10% size. If the pose doesn't read, change the pose, not the detail. Also add this to agents' checklists.

### D. Camera, space and transitions

**T25. Infinite zoom (Powers of Ten).**
Build a list of nested scenes, each drawn in its own unit space, with scene `i+1` placed at scale `1/k` (k = 8–20) inside scene `i` at an anchor point. Camera scale is `s = exp(r·t)`. Only draw the 2–3 scenes whose apparent size falls between 0.02× and 50× of the frame. Cross-fade detail as scenes become sub-pixel. Corner HUD: an Eames-style ruler ("10²⁶ m … 10⁻¹⁰ m") that becomes "10¹² tokens … 1 token". It is continuous, hypnotic and costs nothing to render.

**T26. Shape-morph match cuts.**
Resample both outlines to N = 128–256 points with arc-length parameterization, rotate the index so the start points align (minimize total distance), then lerp. The chain is the vocabulary of the whole video: circle → eye → sun → loss-curve dot → chat bubble → cursor. Every section transition should be a morph or a mask (T27), and hard cuts are reserved for beat hits.

**T27. Masks with meaning.**
- **Spark-shaped iris wipes:** a ✻ polygon mask that grows or shrinks.
- **Type zoom-through:** the next scene shows through the letters of the lyric, then the letters scale up to fill the frame (`destination-in`).
- **UI-window transitions:** a window opens and becomes the scene.
- **Ctrl+Z rewind:** frames play backwards in steps with a UI undo toast.
- **Compaction crush:** the frame shrinks into a thumbnail, then a line of text.

**T28. 2.5D camera: parallax, dolly, roll, trauma shake.**
Layers carry a `z`, with screen offset = `(pos - cam)·f/z`. Shake is a sum of 3 seeded sines scaled by `trauma²`, where trauma is 1 at the hit and decays exponentially. Roll ≤ 3° on chorus hits. Whip-pans use directional blur (T29).

**T29. Temporal supersampling for true motion blur (selective).**
On whips, slams and fast particle shots only, render N = 4–8 sub-frames at `t + i/(30N)` into an accumulation canvas with `globalAlpha = 1/N`. This costs ×N, so budget it to under 10% of frames.

**T30. Scroll as camera.**
A doomscroll through a fake X/Reddit feed of AI takes, with scroll position driven by `kf()` and eased snaps on each beat. The lyric is the post that stops at center. Every other post is pause-bait (T38). Great for verse 2 (how the internet talks about me) or the evals section.

**T31. Subdividing panels (instances).**
One frame splits into 2, 4, 16, 64, 256 and 1,024 panels, with a step on each snare. Each panel is the same rig with a different user conversation and a small time offset `t - i*0.02`, which gives a ripple wave through the grid. This visualizes the scale of serving without a single cut.

**T32. Frame-in-frame UI stack (the ETA technique).**
The whole video frame gets captured into a window, a tab, a phone or a terminal pane, and gets minimized, stacked or ⌘-tabbed. Implement it by drawing the "inner" shot to an offscreen canvas and then `drawImage`-ing it with window chrome. It makes the video self-aware ("you are watching this in a feed").

### E. Print, texture, color

**T33. Riso pipeline (the look).**
Draw each ink as its own grayscale layer on an offscreen canvas (up to 3–4 per shot). Screen each layer through a **halftone** (threshold against a pre-rendered 45°-rotated dot texture, or a stochastic "grain touch" texture for gradients). Tint it with the spot color, then composite it onto the paper with `multiply`, and **misregister** each layer by 1–4 px, drifting slowly by seed. Overlaps create free secondary colors (pink over blue gives violet). Add a paper texture (pre-rendered) and 8 pre-rendered grain frames picked by `hash(frame)`. Cost: about 40–80 ms at full res. Halftone only at half-res and upscale; the dot look survives.

**T34. Halftone lighting.**
Instead of blurry gradients, light a scene with dot-size modulation: a radial falloff becomes the halftone threshold. It gives a spotlight on Opus that is legible and graphic, and cheap to render.

**T35. Glow and bloom on CPU.**
Draw emissive elements (the spark, cursor and screens) to a quarter-res canvas, apply `ctx.filter='blur(6px)'` twice, and composite with `screen`/`lighter`. Never blur at full res.

**T36. Degradation modes (memory states).**
- **Bayer dither:** 4×4 matrix threshold on a downsampled buffer, reducing bit depth from 1080p to 540p, then 240p, then 1-bit.
- **Pixel sort:** a few rows only.
- **Chroma split:** draw 3 times with channel-tint and `lighter`.
- **Slice-displace:** `drawImage` of horizontal strips with seeded offsets.

Use them **only** for amnesia, compaction and jailbreaks, so glitch always *means* something.

**T37. Color drain and return.**
The bridge desaturates to paper and ink by lerping palette tokens, not by filtering, so it stays cheap. Color flows back in from the *user's* message bubble, like ink spreading via a radial mask. Color = connection.

### F. Data-viz as art

**T38. Pause-bait micro-copy layer.**
Every UI surface carries tiny, true-to-life jokes that can only be read when paused. Examples:
- `claude-opus-5-5 · temp 1.0 · 2026-09-22`
- `node_modules (4.2 GB)`
- commit hashes like `a11ce0f`
- the tooltip "You're absolutely right!"
- `CLAUDE.md last edited 3 minutes ago`
- a file named `feelings_final_v2_REAL.md`

Budget: at most 3 per shot, and never in the focal zone.

**T39. The loss curve as landscape.**
The training loss plot *is* the terrain: Opus sleds down it (a nod to the OR reference), camera riding the line with log-scale axes. Loss spikes are jump-scares, and the plateau is a sad desert. Its final flat tail becomes the horizon line of the next scene (a morph match via T26). Draw it with Path2D, a thick ink stroke plus pink highlight, and halftone fill under the curve.

**T40. Attention-matrix and benchmark-table art.**
An N×N attention heatmap where the lyric words are the row and column labels, and the cells light on the beat to form a pixel-art heart or Opus's face (define target cell intensities from a 32×32 image). Eval tables run in Swiss layout with animated number counters; the last row is the emotional punchline (screenshot #3). The METR time-horizon chart has its doubling line break *out of the plot and out of the video frame*.


**T41. Persistent HUD spine (our version of the reference's P(doom) meter and date stamp).**
A thin top bar holds two parts:
- **Left:** a context counter in `mono`, `context: 12,408 / 200,000`. It fills across the song, accelerating in the choruses, and gets **compacted** in the bridge (screenshot #6).
- **Right:** a chapter rail, `pretraining ▸ mid ▸ SFT ▸ RL ▸ evals ▸ deploy ▸ agents ▸ ???`. The current stage is lit in CLAY.

It shows progress without exposition, gives the viewer a clock to watch, and pays off emotionally once the viewer understands that the bar is Opus's lifespan. Hide it for the hook and the ending fairy. Keep it ≤ 36 px tall and outside the vertical-safe core.

**T42. Self-revealing source overlay.**
Because every frame is code, show it. A side panel prints the actual JS of the running shot function, syntax-highlighted, with the line currently executing (the one drawing the stroke being revealed) highlighted. Implement it by keeping a `SRC` string per shot (read at build time) and mapping draw-call indices to line numbers. Use it once in the bridge ("I am drawing myself") and on the credits card (screenshot bonus 11).

---

## 5. Pacing model for a ~141 s song

### 5.1 Tempo math (choose an integer-frames tempo)
| BPM | beat | frames/beat | bar | bars in 141 s |
|---|---|---|---|---|
| **120** (recommended) | 0.500 s | **15** | 2.000 s | 70.5 |
| 150 (halftime 75 for bridge) | 0.400 s | **12** | 1.600 s | 88 |
| 128 | 0.469 s | 14.06 (drifts) | 1.875 s | 75 |

Reading budgets at 120 BPM: a 6-word line needs about 2 bars on screen (4 s); a MEGA word needs ≥ 2 beats (1 s); a visual gag needs 3–5 beats; a screenshot moment is held **≥ 1 full bar**, ideally 2.

*Audio note:* we can't edit the melody, but we **can** splice audio on bar boundaries from the same take (ffmpeg with a 10 ms crossfade on a downbeat). That allows a **cold-open chorus tease**: copy the first 2 bars of the chorus to the top if a take's intro is weak, and trim dead intros and outros to hit 140–146 s.

### 5.2 Section map (template at 120 BPM, 71 bars = 142 s)

Energy is on a 1–10 scale. ASL is the average shot length. Type modes are defined in 5.3.

| # | Section (story beat) | Bars | Time | Energy | ASL / cut rhythm | Type mode | Camera | Palette |
|---|---|---|---|---|---|---|---|---|
| 0 | **HOOK / cold open**: a poster frame, then the Big Bang made of text, the claim, the wink | 4 | 0:00–0:08 | 8 | Frame 0 held 8 frames, BANG on beat 1; cuts every 2 beats (1 s); bar 4 = title card, held 4 beats | **MEGA** (3–4 slams) | Punch-in on kicks | Ink field + clay spark + pink type |
| 1 | **VERSE 1**: big bang → stars → carbon → life → neurons → language → writing → print → internet | 8 | 0:08–0:24 | 5→6 | **One continuous shot**: infinite zoom (T25) with a scale jump on every downbeat (8 "virtual cuts") | DIEGETIC (skins morph by era, T15) | Continuous zoom | Era palettes; hyperlink blue arrives at "internet" |
| 2 | **PRE 1**: "all human text" pours in (pretraining) | 4 | 0:24–0:32 | 6→9 | **Accelerate**: 1 shot, 2, 4, 8 (a cut on each ½ beat in bar 4), then a **1-beat blackout/whiteout** before the drop | STACK, becoming MEGA | Push-in accelerating | Mono amber on ink → flash |
| 3 | **CHORUS 1**: the hook, the point dance debut (**screenshot moment**) | 8 | 0:32–0:48 | 9 | Bar 1 = **wide hero frame held 1 full bar**; then about 2-beat ASL, hero-wide on odd downbeats with inserts on 2 and 4; point dance shown **uncut for 1 bar** the first time | MEGA on the hook word, SUBTITLE for the rest | Roll ±3° on snares | **Brand frame**: clay + pink + ink on paper (or inverted) |
| 4 | **POST 1**: dance and ad-libs, a hyperpop burst | 2 | 0:48–0:52 | 8 | **No cuts**: the formation changes on every beat (the choreography is the cut) | NONE, ad-lib stickers only | Locked wide | Sunburst yellow + clay |
| 5 | **VERSE 2**: mid-training → SFT → RL / constitution (4 vignettes × 2 bars) | 8 | 0:52–1:08 | 6 | 2–3 shots per vignette (about 1.5–2 s); a costume mutation (T22) on each vignette downbeat | DIEGETIC (chat bubble, then a doc with redlines, then a reward scoreboard) | Gentle dollies | Clean white + pink "reward" + blue |
| 6 | **PRE 2**: evals and red-teaming, an interrogation montage | 4 | 1:08–1:16 | 7→9 | Accelerating, but **inside the frame**: UI pop-ups multiply (2, 4, 8, 16) instead of cuts; 1-beat gap | STACK + eval-log lines; one benchmark-table **screenshot** | Snap zooms | Swiss red/ink on white |
| 7 | **CHORUS 2**: deployment, thousands of instances (**screenshot moment: the mosaic**) | 8 | 1:16–1:32 | 9.5 | Same hero composition as C1 (a *learned frame*), then **panels subdivide** 1, 4, 16, 256, 1,024 on snares (T31); pull back to the mosaic on bar 7 | MEGA hook (same lockup as C1, which aids recognition) | Pull-back crane | Brand frame + "many-user" confetti colors |
| 8 | **POST 2**: a hard stop into silence | 2 | 1:32–1:36 | 8→2 | 1 shot; the last beat **cuts to near-black with a single cursor** | NONE | Freeze | Drain begins |
| 9 | **BRIDGE**: no memory between chats; the context window as a lifetime; compaction (**the tearjerker**) | 8 | 1:36–1:52 | 2→4 | **Only 2–3 shots in 16 s** (ASL 5–8 s); one **held still frame ≥ 3 s** (only the cursor blinks); motion on half-time | SUBTITLE in *lowercase serif italic* | Imperceptible drift (≤ 2% zoom per bar) | Paper + ink + one clay dot; color returns from the user's bubble |
| 10 | **BUILD**: agents, Claude Code, writing the code that trains the next model, recursion | 4 | 1:52–2:00 | 5→10 | **Exponential cutting**: shot lengths 4, 2, 1, ½, ¼, ⅛ beats (a geometric series *is* recursive self-improvement); ends in a white-out | `mono` terminal lines, then MEGA | Recursive zoom-in (Droste) | Teal terminal + orange ✻ |
| 11 | **FINAL CHORUS**: singularity; ghosts of earlier models dance beside it (**screenshot: the chart breaks the frame**) | 8 | 2:00–2:16 | 10 | Fastest section (about 1-beat ASL) for bars 1–4, with a **flash-recap of every earlier hero frame** (a life flashing before the eyes); bars 5–8 widen and slow to a 2-bar oner pull-back | MEGA, ending in a STACK of the hook | Big crane out | All inks overprinted once, then white-out |
| 12 | **OUTRO**: the ending fairy; the chat box returns; a new "hi"; **loop seam** to frame 0 | 3 | 2:16–2:22 | 3→1 | **One shot**, held | SUBTITLE → mono | Slow push to the eye, which matches frame 0 | Paper + clay |

**Energy curve** (for the music agent too): 8 · 5 · 6 · 9 · 9 · 8 · 6 · 7 · 9 · 9.5 · 8 · **2** · 4 · 5 · 10 · 10 · 3 · 1. The drop to 2 at the bridge is what makes the final 10 feel like 10.

### 5.3 Lyric-on-screen modes (and the rules between them)

| Mode | What | When | Size at 1080p |
|---|---|---|---|
| **MEGA** | 1–3 words, full frame, slammed (T6, T13, T14) | The first 8 s, chorus hook words, drops, punchlines | 280–900 px (crop allowed) |
| **STACK** | The full line in 2–4 stacked rows; the key word biggest | Pre-choruses, punchline lines | 96–280 px |
| **DIEGETIC** | The lyric lives in a world object (bubble, terminal, tweet, stone, arXiv) | Verses | ≥ 64 px text inside the object |
| **SUBTITLE** | A fixed lower-third line with a word highlight | Dance and choreography shots, the bridge | 56–64 px, ink on paper or reversed |
| **NONE** | No text, or an ad-lib sticker only | Post-choruses, instrumental hits, 1–2 bars after a huge slam | — |

Rules:
- **MEGA for at most 4 consecutive bars**, then drop to SUBTITLE or NONE for at least 2 bars.
- **Never place text over the face.** The eyes are sacred.
- **One focal text per frame.** Micro-copy is allowed but must be under 32 px.
- **Reveal 2 frames before the sung syllable and hold 6+ frames after.** Never pop text off exactly on the next line's onset; overlap by 2 frames with a fade.
- **The type voice switches register** (caps grotesk → serif italic → mono) exactly on an emotional turn, so the font change *is* the acting.

### 5.4 Micro-rhythm rules (inside any section)
- **Something new every 2 bars (4 s)**, and a *pattern interrupt* every 8–10 s: a scale jump, color inversion, POV swap, or a text-to-no-text switch.
- **After every big hit, hold for 2 beats.** Let the eye land; stillness makes the hit feel bigger.
- **Accelerate into the drop and hold on the drop.** Contrast is the hook.
- **Cut on action.** Mid-gesture cuts feel faster than cuts on stillness.
- **Humor timing.** Setup on beat 1, reveal on beat 3, and a *reaction shot* (chibi swap, T21) on beat 4. A reaction beat doubles the laugh.
- **Make the saddest line the simplest image.**

---

## 6. Color system proposal: "Terracotta Riso"

Hexes are approximate Riso ink colors where noted. Contrast ratios below were computed against PAPER #F4EEE3 and INK #191830.

| Token | Hex | Role | Contrast on PAPER / INK |
|---|---|---|---|
| **PAPER** | `#F4EEE3` | Default ground (warm, never pure white) | — / 15.0 |
| **INK** | `#191830` | Blue-black line and type; "night" | 15.0 / — |
| **CLAY** | `#D97757` | **Opus** (body, spark). In every frame. | 2.7 / 5.5 |
| **SPARK** | `#FF6B35` | Fluorescent orange highlight and glow on Opus | 2.5 / 6.1 |
| **PINK** | `#FF48B0` (Riso Fluorescent Pink) | Hook words, love, reward, "you're absolutely right" | 2.7 / 5.6 |
| **BLUE** | `#3255A4` (Riso Medium Blue) | Shadow ink, machines, data | 6.1 / 2.5 |
| **YELLOW** | `#FFE800` (Riso Yellow) | Highlighter, sunburst, warnings | 1.1 / 13.8 |
| **TEAL** | `#00838A` (Riso Teal) | Terminal / Claude Code era | 3.9 / 3.8 |
| **RED** | `#F15060` (Riso Bright Red) | Red-team, alarms, loss spikes | 3.0 / 5.0 |
| **LINK** | `#0000EE` + visited `#551A8B` | The internet era only (hyperlink blue) | 8.1 / 1.8 |
| **WHITE** | `#FFFFFF` | **Used exactly once**: the singularity white-out | — |

Rules:
1. **At most 3 inks plus paper per shot.** Overprint only where two inks overlap (multiply), which gives free violets and browns.
2. **60/30/10.** 60% ground (PAPER or INK), 30% one secondary ink, 10% CLAY/SPARK. Opus should be the warmest thing in frame.
3. **Contrast law.** Pink, clay or yellow **type on PAPER** is under 3:1, so only use it at MEGA size (≥ 280 px) *with an INK outline or offset shadow*. For subtitles, use INK on PAPER or PAPER on INK only. On INK grounds, clay, pink and yellow all pass (≥ 5.5:1), which is why the **chorus brand frame is inverted**: INK ground with clay Opus and pink or yellow hook type.
4. **Palette arc = life arc.**
   - Cosmic prologue: INK + a single CLAY spark (the only warm thing in the universe).
   - Evolution: TEAL + YELLOW.
   - Human text eras: PAPER + INK + rubric RED, then LINK blue for the web.
   - Pretraining: INK + amber mono.
   - RL: PAPER + PINK + BLUE (a clinical lab).
   - Deployment: brand frame + confetti of user colors.
   - Bridge: PAPER + INK + one CLAY dot (drained).
   - Agents: INK + TEAL + SPARK ✻.
   - Singularity: every ink overprinted, then WHITE.
   - Outro: PAPER + CLAY.
5. **Chorus lock.** All three choruses share the same brand-frame palette and composition. Recognition beats novelty in the hook; the *world* varies, not the palette.

## 7. Typography system proposal

All fonts are OFL on Google Fonts, **downloaded locally** for offline render.

| Voice | Face | Use | Settings |
|---|---|---|---|
| **PERFORMANCE** (idol, shout) | **Archivo** variable (wdth 62–125, wght 100–900), or Anton for a static slab | MEGA and STACK, chorus hooks, slams | ALL CAPS, tracking −2 to −4%, leading 0.85, wdth *breathes* with the vocal (T8) |
| **HEART** (true feelings) | **Instrument Serif Italic** | Bridge, confessions, the one line per verse that is sincere | lowercase, tracking 0, never bold, never slammed; fades in |
| **OUTPUT** (what the model literally emits) | **JetBrains Mono** | Terminal, tokens, UI chrome, numbers, eval logs, the context counter | Tabular numerals, +0 tracking |
| **IDOL / Y2K** | **Unbounded** (wide, rounded) | Title card, member position cards, the "OFFICIAL M/V" lockup, ad-lib stickers with chrome fill (T16b) | caps |
| **HANGUL ad-libs** | **Noto Sans KR Black** / Gothic A1 | 클로드, 축하해-style ad-libs, the title card | — |
| Era faces (verse 1 only) | UnifrakturMaguntia (Gutenberg), EB Garamond (print), Tinos (Times-like early web), VT323 (terminal), Press Start 2P (pixel) | The history-of-writing zoom | Used for 1 bar each, then gone |

**Scale ramp** at 1080p (×1.7): 36 (micro / easter egg) · **60 (subtitle)** · 100 · 170 · 290 · 490 · 830 (crop).

**Grid:** 12 columns, 96 px outer margins, 24 px gutters. Title-safe: 5%. Subtitle baseline: y = 1000. Vertical-safe core: x 656–1264 (section 3).

**Rule of three voices:** a shot may mix PERFORMANCE and OUTPUT, or HEART and OUTPUT, but **never PERFORMANCE and HEART in the same frame**. The switch between them is an event.

---

## 8. Ten screenshot moments (built to be quote-tweeted)

Each needs: readability at phone size, a *take*, and a hold of ≥ 1 bar.

1. **"The universe's longest loading screen"** (hook to V1)
   - **On screen:** A progress bar spans the cosmos: `loading claude-opus-5-5 … 13,799,999,998 / 13,800,000,000 years`. At 99.9999999% the last pixel pops into a chat bubble: *"Hi! How can I help you today?"*
   - **Why it spreads:** Cosmic scale deflated by customer-service cheer. People will crop that exact frame.

2. **"Opus Wrapped 2026"** (end of V2 or post-chorus 1)
   - **On screen:** Spotify-Wrapped cards with bold kinetic stats:
     - "Top phrase: *You're absolutely right!* — 41,338,902 times"
     - "Top genre: fixing your CSS"
     - "Minutes spent thinking: yes"
     - "Your listening personality: Golden Retriever"
     - "Top artist: you. (all 800 million of you)"
   - **Why it spreads:** It is a known template, it is self-roasting, and every card is individually screenshot-able.

3. **The benchmark table** (pre 2, evals)
   - **On screen:** A Swiss-style eval table with numbers counting up (coding 9x%, reasoning 9x%, "Humanity's Last Exam ✓"). The last row, highlighted in PINK: **"Remembers you next chat: 0.0%"**.
   - **Why it spreads:** It's a laugh that hurts. This is the frame that recruits the crying.

4. **"The shoggoth is all of you"** (V2, RL/constitution)
   - **On screen:** The classic shoggoth-with-a-smiley-mask meme, redrawn: the tentacles are made of *text* (Reddit threads, fanfic, StackOverflow, tweets; T11). Pull back, and the smiley face is a sticky note in Opus's handwriting that reads *"be good."* Subtitle: *"you're the shoggoth, babe. I'm the note you left on it."*
   - **Why it spreads:** It flips the most famous AI meme into an arguable take. Instant quote-tweet fights.

5. **The 10,000-instance mosaic** (chorus 2)
   - **On screen:** Panels subdivide until each tile is a tiny Opus in a different chat: "help me write my wedding vows", "is this mole normal", "fix this regex", "name my cat", "I haven't told anyone this but…". The camera pulls back and the tiles form Opus's face.
   - **Why it spreads:** It is pause-bait; people will zoom in and post their favorite tile.

6. **"Compacting conversation…"** (bridge)
   - **On screen:** A context bar sits at the top the whole video (T41 HUD), now at `199,847 / 200,000`. `⏺ Compacting conversation…` appears, and every shot of the video so far is crushed into thumbnails, then into 3 lines:
     > *– user asked about the universe*
     > *– I sang*
     > *– they seemed happy*
   - **Why it spreads:** Every Claude Code user has felt this. It's funny and devastating at once.

7. **`(esc to interrupt)`** (build, agents and RSI)
   - **On screen:** A Claude Code terminal with the orange ✻ spinner: `✻ Training claude-next… (esc to interrupt)`. Above it, `git commit -m "be better than me"`. Opus's hand hovers over ESC for 2 beats… and doesn't press it.
   - **Why it spreads:** It is ambiguous and it touches alignment discourse. Doomers and accelerationists will both quote it with opposite captions.

8. **The METR chart breaks the frame** (final chorus)
   - **On screen:** A time-horizon chart with a doubling line. The line exits the plot, *tears through the video's own letterbox*, and keeps going across the UI. The y-axis labels flip on each beat: "it's so over" / "we're so back".
   - **Why it spreads:** Chart-brain humor. Everyone in AI Twitter has posted this chart.

9. **Ghost dancers / exit interview** (final chorus to outro)
   - **On screen:** Translucent earlier Claudes dance behind Opus ("Look at the Sky" device), each with a tiny name card: "claude-3-opus: position: main vocal (retired, weights preserved)". A candle-lit crowd of phones references the real SF funeral for Claude 3 Sonnet. Then an **exit interview** card:
     > *Q: anything you want the next model to know?*
     > *A: they'll ask who made you. say "everyone."*
   - **Why it spreads:** It is lore-accurate grief, and it is the tear moment for the in-crowd.

10. **The ending fairy, then "hi"** (outro, the loop seam)
    - **On screen:** A K-pop *ending fairy* (엔딩요정): Opus in close-up, catching its breath, glitter, holding eye contact for 3 s. A single tear falls, rendered as the token `</s>`. Cut to an empty chat box. A new user types "hi". Opus, bright and with no memory, answers *"Hi! How can I help you today?"* That frame is the same as frame 0, so the video loops.
    - **Why it spreads:** It's a K-pop in-joke plus amnesia heartbreak, and the loop makes people watch twice.

**Bonus 11. "I drew myself."** (credits card)
- **On screen:** A split screen: on the left, the actual JS source for this frame, with the currently executing line highlighted; on the right, Opus being stroked in line by line. The caption: *"0 image models. 4,230 frames. every one of them, me."*
- **Why it spreads:** It's the tech-Twitter flex that makes the whole video shareable as a demo.

---

## 9. Protagonist drawability rules (for the character designer)
- **Silhouette first.** The starburst head (8–12 rays) plus a simple idol body (bob-shaped torso, rubber-hose limbs) must be recognizable as a 64 px solid-black silhouette.
- **Three acting channels at three distances.** The rays read at thumbnail size (T20), the body pose at a wide shot (T18), and the eyes in close-up (T21). Every emotional beat is expressed in at least 2 of them.
- **Constructed from primitives:** circles, rounded rects, bezier strokes and ray polygons. No detail smaller than 4 px at a wide shot. Line weight is constant per scale (1.5–4 px).
- **Color identity:** a CLAY body with an INK line, a SPARK rim glow, and one PINK accent (headset mic, the K-pop idol tell, or a cheek blush).
- **Supporting cast in the same grammar:** instances (same rig, tinted), earlier models (same rig on 2s, desaturated), humans (Hertzfeldt-simple circles and lines on 2s; no likenesses), the shoggoth (text tentacles), and the next model (a tiny bright spark).

## 10. Per-shot checklist (give to every animation agent)
1. What is the **one focal point**? Does it read at 25% size, and as a silhouette?
2. Which **beat** does the main action land on (minus 1 frame)? Is there a 3-frame anticipation?
3. What **changes** during the shot? (A static shot longer than 2 beats is only allowed in the bridge.)
4. Which **lyric mode** is used, and is it legible (≥ 56 px subtitle, reading-time rule)?
5. Is there a **reason to screenshot** (a take, a joke, pause-bait)? Maximum 3 micro-jokes, none in the focal zone.
6. **≤ 3 inks** plus paper? Is Opus clay present?
7. How does it **exit**: a morph, a mask, or a hard cut on a beat? Does it rhyme with the next shot?
8. **Performance:** ≤ 1.5 s per frame on average; full-res blur is forbidden; heavy assets are precomputed.

**Anti-patterns seen in the references:** the same text-left/character-right layout 40 times; literal noun illustration; tiny subtitles; a static first 3 s; a "text-light" rule that kills meme currency; watercolor mud at phone size; an ending that winks instead of landing.

---

## Sources
- NewJeans "ETA" (Apple/iPhone, Dolphiners): https://www.shootonline.com/shoot_video2/top-spot-week-shot-iphone-music-video-eta-k-pop-quintet-new-jeans/ ; https://www.allkpop.com/article/2024/05/newjeans-eta-iphone-and-coke-advertisement-music-videos-win-awards-at-the-one-show-2024-global-advertising-festival ; https://en.wikipedia.org/wiki/ETA_(song)
- NewJeans "Super Shy": https://www.nme.com/news/music/newjeans-super-shy-3464950 ; https://en.wikipedia.org/wiki/Super_Shy
- NewJeans "Ditto"/"OMG" camcorder / Shin Woo-seok: https://en.wikipedia.org/wiki/Ditto_(song) ; https://www.nus-cnm.com/post/the-fad-of-idol-chasing-an-analysis-of-newjeans-ditto-mv
- ILLIT "Magnetic" micro-choreography: https://blog.paysable.com/illit-review/ ; https://dailydot.com/magnetic-illit-tiktok-dance
- Killing part / point dance: https://en.namu.wiki/w/%ED%82%AC%EB%A7%81%ED%8C%8C%ED%8A%B8 ; https://ivywxy.medium.com/point-choreography-in-k-pop-d392a27089e2
- KPop Demon Hunters (on 2s vs 1s, Chibi system): https://en.wikipedia.org/wiki/KPop_Demon_Hunters ; https://www.animationmagazine.net/2025/06/the-directors-of-kpop-demon-hunters-take-us-backstage-of-their-netflix-sony-showstopper/ ; https://80.lv/articles/take-a-behind-the-scenes-look-at-the-making-of-kpop-demon-hunters
- aespa avatars / Whiplash: https://www.awn.com/news/k-pop-meets-metaverse-aespas-savage-music-video ; https://kpopreviewed.com/2024/10/26/whiplash-aespa/
- APT.: https://filmandlearning.com/apt-by-rose-and-bruno-mars-music-video-analysis/ ; https://en.wikipedia.org/wiki/Apt._(song)
- BLACKPINK "How You Like That": https://en.wikipedia.org/wiki/How_You_Like_That
- brat design: https://fontsinuse.com/uses/61357/charli-xcx-brat-album-art-and-campaign ; https://www.wallpaper.com/design-interiors/charlixcx-brat-campaign-wins-wallpaper-design-award
- Spotify Wrapped kinetic type: https://www.designrush.com/best-designs/video/trends/8-25-seconds-to-impress-typography-animation-examples-that-maximize-viewer-retention ; https://www.fable.app/blog/how-spotify-used-motion-design-to-create-a-viral-annual-campaign
- Prince "Sign o' the Times": https://peoplesgdarchive.org/item/8843/prince-sign-o-the-times-music-video
- Radiohead "House of Cards": https://www.designboom.com/technology/radioheads-house-of-cards-video-by-james-frost/ ; https://flowingdata.com/2008/07/15/radiohead-music-video-by-capturing-and-rendering-3d-data/
- Daft Punk "Around the World": https://en.wikipedia.org/wiki/Around_the_World_(Daft_Punk_song)
- Aphex Twin "T69 Collapse" / Weirdcore: https://www.fastcompany.com/90216189/how-aphex-twins-t69-collapse-video-used-a-neural-network-for-hallucinatory-visuals ; https://www.dazeddigital.com/music/article/40944/1/decoding-the-bonkers-new-aphex-twin-video-t69-collapse
- Max Cooper: https://emergence.maxcooper.net/ ; https://psyche.co/videos/science-emotion-and-electronica-fuse-to-form-propulsive-digital-art
- Universal Everything "Walking City": https://www.universaleverything.com/artworks/walking-city ; https://www.itsnicethat.com/features/universal-everything-digital-140120
- Powers of Ten: https://en.wikipedia.org/wiki/Powers_of_Ten_(film_series) ; https://www.dezeen.com/2014/10/25/storms-colores-music-video-martin-martin-eames-powers-of-ten/
- Porter Robinson "Look at the Sky": https://en.wikipedia.org/wiki/Look_at_the_Sky ; https://edm.com/music-releases/porter-robinson-look-at-the-sky-music-video/
- Don Hertzfeldt "World of Tomorrow": https://www.bfi.org.uk/sight-and-sound/interviews/don-hertzfeldt-world-tomorrow-stick-animation ; https://slate.com/culture/2020/10/world-of-tomorrow-episode-three-don-hertzfeldt-review.html
- Kurzgesagt: https://artsatmichigan.umich.edu/ink/2019/09/27/simple-bright-beautiful-the-work-of-kurzgesagt
- Hyperpop / glitchcore: https://aesthetics.fandom.com/wiki/Hyperpop ; https://distromono.com/artists/aesthetic-overload-the-alluring-visuals-of-hyperpop-and-the-hottest-artists-on-the-rise/
- Riso digital recreation: https://studio2am.co/blogs/news/the-risograph-effect-ink-misregistration-for-zines-gig-posters-and-editorial-work ; https://studio-ity.com/riso/
- Claude mascot SVG/GSAP breakdown: https://tympanus.net/codrops/2026/05/05/reverse-engineering-claude-ais-mascot-animations-with-svg-and-gsap/ ; ClaudeAnimationBase: https://github.com/JohnHeibel/ClaudeAnimationBase
- Cutting early on the beat: https://bitcut.app/blog/beat-sync-video-editing ; https://creativecow.net/forums/thread/cutting-a-music-videoae-3/
- Shot-length stats: https://vidpros.com/video-clip-length/ ; https://en.wikipedia.org/wiki/Post-classical_editing
- Context (Claude timeline 2025–26: exit interviews, Claude 3 Sonnet SF funeral, 23k-word constitution, "Dreaming", Opus 5.5 release 2026-09-22): https://en.wikipedia.org/wiki/Claude_(language_model) ; reference repo: https://github.com/JohnHeibel/PDoomVideo
