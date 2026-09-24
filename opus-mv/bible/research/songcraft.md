# Songcraft + ACE-Step 1.5 playbook (Opus MV)

Owner: songwriter/producer research. Status: v1, 2026-09-24.
Scope: (1) how to prompt ACE-Step 1.5 through acestep.cpp on our 4-core CPU box, (2) hit-song craft for a 140 to 146 s viral pop song, (3) a concrete recommendation: BPM, key, per-section time budget, lyric slot template, 3 captions, request JSON.
Companion docs: `zeitgeist.md` (which memes land, ranked) and `mvcraft.md` (visual craft).

---

## 0. TL;DR recommendation

- **Genre:** K-pop architecture with hyperpop textures. That means clear K-pop sections (cold-open hook, pre-chorus lift, post-chorus chant with a point dance, stripped bridge, final chorus lift) dressed in hyperpop sound (glitchy pitched vocal chops, bitcrushed risers, supersaws, rubbery bass). The strings `K-pop, hyperpop, glitch-pop` and `K-Pop future bass` appear verbatim in ACE-Step's own genre vocabulary (`acestep/genres_vocab.txt`), so the model has seen them.
- **BPM 128, 4/4, key A minor** (the chorus runs on the i–VI–III–VII "bittersweet anthem" loop). Fallback: 120 BPM or E minor.
- **Form (76 bars = 142.5 s):** Cold-open hook 4 | Verse 1 8 | Pre 4 | Chorus 8 | Post-chorus chant 4 | Verse 2 8 | Pre 4 | Chorus 8 | Post-chorus chant 4 | Bridge 8 | Build 4 | Final chorus 8 | Outro tag 4. Request `duration: 146` (t1 at 143 overran), then trim.
- **The hook is sung at 0:00.** One title line of about 9 syllables that works as a tweet by itself. The same words come back in the final chorus with a new meaning (the "turn"). That turn is what makes people cry.
- **The chant is the clip moment:** post-chorus 1 at 0:45 to 0:52, four one-bar lines of 3 to 6 syllables in UPPERCASE with (responses) in parentheses, each tied to a gesture.
- **ACE-Step rules that matter most:**
  - Give **all** metadata (caption, lyrics, bpm, duration, keyscale, timesignature `"4"`, vocal_language `"en"`) so the LM keeps our caption word for word.
  - Keep lines to 6 to 10 syllables, with parallel lines matching within ±1.
  - Plan about **one sung line per 2 bars**, one short chant line per bar.
  - Repeat choruses word for word.
  - Section tags come from the common set, with at most one short descriptor each.
  - Spell jargon the way it is sung.
  - Generate many takes, score them with Whisper, and fix bad lines with repaint instead of rerolling the whole song.
- **CPU reality (measured on take t1, section 12):** one full 143 s take costs about 28 min on this box. That is LM 9 min, plus DiT 12.8 min and VAE 5.7 min while other agents loaded the CPU (load average about 7). Plan on **2 takes/hour**, i.e. a take budget of dozens, not hundreds. acestep.cpp uses only `nproc/2 = 2` threads.
- **Take t1 validated the plan:**
  - The hook was sung at 0.0 s and the beat dropped at exactly 7.5 s (bar 5).
  - Chorus 2 landed at 75.0 s (planned 75.0), the bridge at 98.0 s (planned 97.5), the build at 113.0 s (planned 112.5). The model even left a silence gap right before the final chorus.
  - Whisper WER was 0.32 and 31 of 41 lines were recognised.
- **Take t1 failures to design around:**
  - Verse 1, written as comma-fragment noun lists, came out as "yeah yeah yeah" (lost).
  - The spelled acronym "A G I" was heard as "h e f".
  - "LOSS go down" was heard as "fights go down".
  - Content overran the duration, so final-chorus lines 3 and 4 and the outro were cut. The final chorus was also rendered sparse instead of explosive.

---

## 1. How ACE-Step 1.5 turns our text into a song (what matters for us)

```
caption + lyrics + metas --> [5Hz LM, Qwen3 4B]  --> audio codes (5 per second: melody, structure, where each line lands)
                               --> [DiT turbo, 8 steps] --> latents (timbre, mix, detail)
                               --> [VAE] --> 48 kHz stereo
```

- **The LM is the composer.** It decides melody, where each lyric line lands in time, how long sections last, and whether it sings or skips a line. The DiT is the studio: timbre, mix, production. So *lyric layout (lines, syllables, tags) controls timing*, and *caption words control sound*.
- What the DiT actually reads (from `pipeline-synth-ops.cpp`):
  `# Instruction / # Caption <caption> / # Metas - bpm - timesignature - keyscale - duration` and, separately, `# Languages\nen\n\n# Lyric\n<lyrics>`. The lyric encoder is its own 8-layer transformer over lyric tokens, with a sliding window of ±128 tokens. It is local, so every section needs to be well formed on its own.
- **Limits:** caption up to 512 chars, lyrics up to 4096 chars (official Python API). Keep the whole lyric sheet under about 2,000 chars. Our 42-line draft is 1,537.
- **LM modes in acestep.cpp:**
  - Caption only: two passes. The LM writes its own lyrics and metadata. We never want this.
  - Caption + lyrics with some metadata missing: the LM fills the missing metadata and rewrites the caption (`use_cot_caption`).
  - **Everything provided:** CoT is skipped and our caption is used verbatim. Verified in our test log: the CoT block echoes our caption unchanged. **Always use this mode.**
- **acestep.cpp specifics:**
  - `lm_model` and `synth_model` need the full filename *including `.gguf`*. `"acestep-5Hz-lm-4B-Q8_0"` fails with "not found in registry".
  - `timesignature` is the numerator as a string (`"4"`).
  - `duration` must be explicit. Auto (-1) is buggy upstream (issue #929).
  - Turbo presets: `inference_steps 8, shift 3.0`, and CFG is forced to 1.0.
  - `seed` controls DiT noise only. The LM has its own **`lm_seed`** (default -1 = random). The field is undocumented in ARCHITECTURE.md but parsed in `request.cpp`, and the output `t0.json` records the value used (t1 used `lm_seed: 4133782954`). So: leave `lm_seed` at -1 to roll new melodies; set it to re-create a melody you liked; the `audio_codes` in `t0.json` are the exact composition.
  - Useful levers: `lm_temperature` (0.85 default; drop to 0.7 to 0.8 for steadier adherence, raise to 0.95 to 1.0 for wilder melodies), `lm_cfg_scale` (2.0 default; higher follows caption and lyrics more strongly), `lm_negative_prompt` (a caption-like string to steer *away* from, e.g. `"muffled mumbling vocals, male vocal, saxophone, lo-fi, slow ballad"`; untested), `lm_batch_size` (N melodies from one shared prefill, which saves the 87 s prefill on every extra take).
- Models on disk: LM 4B Q8 (best planner), DiT `acestep-v15-turbo` (2B, fast) and `acestep-v15-xl-turbo` (4B DiT, better audio). Community workflow: sketch on 2B turbo, then finish the chosen composition on XL turbo. The composition lives in the LM codes, so we can re-render the same `audio_codes` with the XL DiT (passthrough mode: pass the `t10.json` that ace-lm wrote, with `synth_model` switched).

---

## 2. Caption rules (the "sound" prompt)

1. **One primary genre plus at most two modifiers, genre first.** "K-pop dance-pop with hyperpop and future bass edges" is fine. Stacking five niche genres collapses into noise (deAPI guide).
2. **Name concrete instruments and production moves** instead of adjectives: "rubbery synth bass, supersaw chords, pitched vocal chops, bitcrushed risers" beats "energetic, modern". Specific names ("grand piano") beat generic ones ("piano").
3. **Describe the vocal explicitly and for intelligibility:** "bright airy female lead vocal, crisp clear English diction, upfront in the mix". Avoid putting heavy effects on the *lead* (vocoder, heavy autotune, distorted, whispery throughout), because each one costs intelligibility. Put glitch on the *chops and ad-libs*, not on the lead.
4. **Turn conflicting styles into a sequence in time.** Official advice: write "start with X, middle becomes Y, end turns to Z" instead of blending them. We use "stripped piano bridge, then a euphoric final chorus".
5. **Keep the caption consistent with the lyric tags.** If a tag says `[Bridge - soft piano]`, the caption must mention a piano bridge. The model does not resolve conflicts, and output degrades when caption and tags disagree.
6. **Do not put BPM, key or duration in the caption.** Set them as metadata (official guidance). A tempo word that fights the metadata (for example "slow" at 128) confuses it.
7. **Repeat a word to strengthen it** if the model under-delivers something (e.g. "chant ... gang-vocal chants").
8. **Mood words last:** 2 to 4 of them ("playful, cheeky, bittersweet, euphoric"). Mixing "funny" and "sad" is fine when the caption says *when* each happens.
9. **Length:** 300 to 480 chars of natural language is in-distribution. The training captions are Gemini-style paragraphs (see `examples/text2music/*.json`). Tag lists also work.

## 3. Lyric sheet rules (the "timing and melody" prompt)

- **One sung phrase per line; 6 to 10 syllables** (official). 4 to 8 flows best for chants. At 12 or more the rhythm fractures and the model crams or drops words. **Parallel lines match within ±1 syllable** (line 1 of verse 1 against line 1 of verse 2, and so on).
- **Blank line between sections; tag every section.** Lyric content must not bleed across tags.
- **UPPERCASE = intensity or shouting.** Use it for chants and the final hook, never in the bridge.
- **(Parentheses) = backing vocal, echo or response.** Great for call and response: `IT'S SO OVER (WE'RE SO BACK)`. Our scorer ignores them.
- **Vowel stretching** ("hiiii") is unstable. Prefer a separate short line or an echo in parentheses.
- **Spell things the way they are sung.** Keep two sheets:
  - `sung.txt` goes to ACE-Step and uses phonetic spellings.
  - `display.txt` goes to the kinetic type and uses the proper spelling.
  - Examples:
    - `P(doom)` → `P doom`.
    - `AGI`: `A G I` was heard as "h e f" in t1; t2 tests the unspaced `AGI`.
    - `GPU` → `G P U`.
    - `14B` → `fourteen billion`.
    - `3am` → `three a.m.`
    - `RLHF`: avoid it, or write `R L H F`.
    - `Claude` → `Claude`. It usually lands; fall back to `Clawed` if not.
  - Avoid symbols (`&`, `%`, `/`, emoji, em dashes) inside sung lines.
- **Write sentences with verbs, not comma-separated noun lists.** In t1, verse 1 ("Big bang, and the dark, and a star / Carbon in the dust, then a heart ...") was replaced by "yeah yeah" vocalising. Every other section, all written as full clauses, was sung. The fix to test (take t2): "First there was a bang, and then a star / The star exploded into carbon hearts ..."
- **Spelled-out acronyms are unreliable:** `A G I` was heard as "h e f". Prefer a real word, or accept that the on-screen type carries it. Reading the lyrics makes a sung word sound intelligible, which is a big advantage of our kinetic-type video. The same goes for one-syllable key words in chants: "loss" came out as "fights". Put the meme word on screen *huge* at that moment.
- **Jargon must be short and stressed on strong beats.** In t1, "context window", "absolutely right", "red team" and "ten thousand rooms" came through cleanly, while "markdown" was mangled ("my come done") and "loss" was misheard. Long noun stacks ("reinforcement learning from human feedback") do not.
- **Repeat choruses word for word.** Melody locks to text: if you change a word, the model will likely change the melody. Put the *turn* in the last line of the final chorus only.
- **Small lyric edits move everything** (issue #450). Lock the lyric sheet *before* mass-generating takes. After that, fix only through repaint (section 7).
- **Non-English ad-libs:** keep them short and romanized (the model trained on 50% romanized non-Latin scripts), for example `(saranghae)` or `(daebak)`. Leave `vocal_language: "en"`.

## 4. Section tags: what works

Tag frequency in the 200 official example requests (`examples/text2music`, the format the model's annotators produce):

| Tag | Count | Use it for |
|---|---:|---|
| `[Chorus]` | 388 | main hook (repeat verbatim) |
| `[Intro]` | 196 | our cold open, *with* lyrics under it (examples do this: "Yo / It's ...") |
| `[Verse 1]`, `[Verse 2]` | 193 / 190 | story |
| `[Outro]` | 190 | tag and ending |
| `[Bridge]` | 124 | the cry section |
| `[Pre-Chorus]` | 109 | lift |
| `[Instrumental Break]` | 34 | explicit instrumental bars (a tag with no lyrics under it) |
| `[Drop]`, `[Final Drop]`, `[Instrumental Drop]` | 14 / 4 / 6 | EDM drop (instrumental, or with a chant) |
| `[Final Chorus]` | 14 | last chorus |
| `[Hook]` | 10 | alternative for the cold open or the chant |
| `[Breakdown]`, `[Build-Up]`, `[Build]` | 8 / 9 / 5 | stripped section, riser |
| `[Post-Chorus]` | 5 | chant after the chorus. Rare in the examples, but `[Post-Chorus - chant]` **worked in t1** (chanted, with the parenthesised response sung) |
| `[Song ends abruptly]`, `[abrupt silence]` | 4 / 4 | hard-cut ending (hyperpop, and good for looping) |

- Descriptor syntax: `[Section - short descriptor]`, e.g. `[Bridge - soft piano]`, `[Post-Chorus - chant]`, `[Intro - Synth Brass Fanfare]`. Use **one** descriptor. Stacks like `[Chorus - anthemic - stacked - powerful]` risk being *sung* and confuse the model.
- Vocal-style tags from the official tutorial: `[whispered]`, `[falsetto]`, `[powerful belting]`, `[spoken word]`, `[harmonies]`, `[call and response]`, `[ad-lib]`. Energy tags: `[building energy]`, `[explosive]`, `[melancholic]`, `[euphoric]`, `[dreamy]`. Use them as the one descriptor, e.g. `[Bridge - whispered]`.
- A tag with nothing under it gives instrumental bars. Never leave the *Chorus* empty: you get no hook, and sometimes silence.

## 5. Timing math: how many lines fit

- Seconds per bar (4/4) = 240 / BPM. At **128 BPM** a bar is **1.875 s**, a beat is 0.469 s, and 8 bars take 15 s. At 120 BPM a bar is 2.0 s.
- **Planning density (pop):**
  - **Standard sung line** (7 to 10 syllables): **2 bars**. At 128 BPM that is 3.75 s, about 2.5 syllables/s, which is relaxed and intelligible.
  - **Chant line** (3 to 6 syllables): plan **1 bar**. In t1 they came out at about 1.5 bars.
  - **Fast list or rap line** (8 to 12 syllables): 1 bar. Risky. Use it only in verse 1's history speedrun if we want it, and expect the LM to stretch it.
  - **Sustained anthem line** (3 to 5 syllables with long vowels): 2 to 4 bars.
- Intelligibility ceiling: about 4 syllables/s sung (eighth notes at 120 BPM). Word rate: 2 to 3 words/s at most (Ambience AI guide).
- **Validated on t1** (128 BPM): chorus lines started 3.2 to 4.7 s apart (about 2 bars). Chant lines started about 2.9 s apart (about 1.5 bars, so a little slower than 1 per bar). "IT'S SO OVER (WE'RE SO BACK)" pairs took about 1.2 to 2.8 s. The bridge lines were about 3 to 4 s. Section starts matched the plan to within 0.5 s from chorus 2 onwards.
- The official examples average 6 to 10 s per lyric line *including* instrumental parts. t1 (42 lines in 76 bars, about 3.4 s per line overall) was **denser than typical and overran by about 10 s**. Target 38 to 40 lines with `duration` 146. If takes still rush or skip, cut a verse line pair.
- **We cannot set section lengths directly.** The LM allocates time from the line counts. So the time budget below is a *target used to pick takes*. The final edit follows the chosen take's real timings (Whisper word timestamps plus beat tracking).

| Section length at 128 BPM | Seconds | Standard lines | Chant lines |
|---|---:|---:|---:|
| 4 bars | 7.5 | 2 | 4 |
| 8 bars | 15.0 | 4 | 8 |
| 16 bars | 30.0 | 8 | n/a |

## 6. Metadata: BPM, key and duration interactions

- BPM is an **anchor, not a metronome.** Expect ±1 to 3 BPM, so always beat-track the chosen take (e.g. `aubio`, or `librosa.beat` if available) before animating.
- A BPM that fits the genre helps (dance-pop at 118 to 130 is dense in training data). A genre with a mismatched BPM (techno at 70) confuses the model.
- **Keys:** common keys (C, G, D, Am, Em) are the most stable. Rare keys may be ignored or shifted. We pick **A minor**.
- **Key change:** you cannot request a modulation reliably. Two options:
  1. Hint it (`[Final Chorus - key change]`, plus "final chorus lifts up a key" in the caption) and keep the takes where it happens.
  2. **Do it in post:** ffmpeg has `rubberband`. Pitch-shift the final chorus segment +1 semitone (`rubberband=pitch=1.059463`), cut at the downbeat after a one-beat gap (a classic "truck-driver" change is abrupt anyway), and crossfade 20 ms.
- **Duration:** 30 s to 4 min is the stable range. The 2B turbo loses coherence past about 3 min, so 143 s is safe. With too many lines for the duration, the model rushes or drops lines. With too few, you get long instrumental stretches or a looped outro.
- `timesignature: "4"`. Do not use 3 or 6. A 6/8 bridge cannot be requested per section.

## 7. Known failure modes and fixes

| Failure | Seen where | Fix |
|---|---|---|
| Skips lines or whole verses, jumps to the chorus | issue #391 (even with Think mode), #1098 | Fewer lines per section, consistent syllables, blank lines between sections, more takes; lower `lm_temperature` to 0.75; score with Whisper |
| Rolls back or repeats a line | #1098 | reroll, or repaint that 4 to 8 s window |
| Mispronounced word | #450 | phonetic respelling; repaint only that window (3 to 90 s) with the *same* full lyric sheet and caption |
| Lyrics ignored, random words | AmuseAI #90 (turbo, no LM) | always run the LM (ace-lm) before ace-synth. DiT-only from noise is for instrumentals |
| Unrequested instrument (sax) | #391 | name the instruments; optionally add a `lm_negative_prompt` |
| Tag text gets sung | tutorial | one short descriptor per tag; nothing clever in brackets |
| Long instrumental intro, hook not at 0:00 | common LM habit | lyrics directly under `[Intro]`; pick takes whose first vocal is under 0.5 s; otherwise trim the pre-roll at a downbeat in ffmpeg |
| Words stretched across beats | #356 (Russian) | English only; equal syllable counts |
| Auto duration gives noise | #929 | always set `duration` |
| Content overruns the duration: last lines and outro cut, the final chorus rendered sparse | **t1** (42 lines in 143 s) | budget about 38 lines for 143 s, or set `duration` 146 to 150 and trim; tag `[Final Chorus - explosive]`; caption "explosive full-band final chorus and a hard stop"; end with `[Song ends abruptly]` |
| Noun-list verse sung as "yeah yeah" | **t1** verse 1 | write clauses with verbs; keep the same syllable count as the other verses |
| Vocals muddy under drops | common | caption "vocals upfront, clear diction"; fewer layers during sung lines; put the busiest drop in the *post-chorus* (chant) and not under verse text |

**Repaint recipe (acestep.cpp):** `task_type: "repaint"`, `--src-audio take.wav`, `repainting_start`/`repainting_end` in seconds (3 to 90 s window), same caption and lyrics, turbo presets. The rest of the song is kept bit for bit (a latent splice). This is the "fix, don't redo" step the official docs push.

## 8. Take workflow on our CPU (measured)

Measured on this box (4 vCPU, 15 GB, acestep.cpp CPU build, **2 threads** because `backend_cpu_n_threads()` returns `hardware_concurrency()/2`):

- **ace-lm 4B Q8:** model load 12.6 s. **Prefill 87 s** (cond + uncond shared). **Decode about 1.8 codes/s**, so 715 codes for 143 s take about 6.6 min. LM total **8m56s** wall-clock for t1, including load. It uses about 6.5 GB of RAM (4.2 GB weights plus 2.3 GB KV cache).
- **ace-synth (2B turbo, 8 steps) + VAE, measured on t1 while other agents loaded the CPU (load average about 7):**
  - Text encoding 5.8 s and FSQ detokenizer 16 s.
  - **DiT 766 s** (about 96 s per step; T = 3560 latent frames).
  - **VAE decode 343 s**.
  - Total 19m06s.
  - **So a full take is about 28 min.** Uncontended it should be noticeably faster (not measured).
- **Whisper scoring** (small.en int8): 34 s per take.
- **Cheap melody screening (untested idea):** truncate `audio_codes` to the first 280 codes (56 s: cold open to the end of the first chant) and set `duration` 56. That renders about 3 times faster, so you can screen hooks before paying for full renders. Or just rely on the Whisper score plus a listen.

Speed-ups:
- **Threads:** patch `src/backend.h` `backend_cpu_n_threads()` to return `hardware_concurrency()`, i.e. 4. The vCPUs are probably not SMT pairs, so this is likely 1.5 to 2 times faster. Check it on one take before relying on it.
- **Batching:** `lm_batch_size: 4` reuses one prefill for four melodies.
- **Overlap:** run ace-lm for take N+1 while ace-synth renders take N (RAM allows one LM and one DiT at a time).

Pipeline:
1. Lock the lyric sheet (sung spelling) and caption. Start with caption A.
2. Roll 8 to 16 takes on 2B turbo (4 to 7 h at about 28 min each; overlap LM and synth runs). `seed` can stay fixed while the LM varies. Save every `tN0.json`, because it holds the `audio_codes`.
3. **Auto-score each take** with `/home/user/mvwork/songtest/score.py take.wav sung.txt`. It uses faster-whisper small.en int8 on CPU, installed in `/home/user/mvwork/whisperenv` with models in `/home/user/mvwork/whispermodels`. Its output:
   - WER against the lyric sheet;
   - the share of lines recognised;
   - an approximate start time per line, which gives the kinetic-type timings for free.
   small.en misses some sung words, so treat the percentages as lower bounds and compare takes against each other, not against 0. Also check: the first vocal is at or under 0.5 s, the length is 140 to 146 s, and the chorus line is recognised every time it occurs.
4. A human listens to the top 3. Pick one on groove and hook melody first; intelligibility is second, because it is fixable.
5. Re-render the winner's `audio_codes` on **XL turbo** (same codes, better DiT) and try 2 or 3 DiT seeds.
6. Repaint any bad words (3 to 10 s windows).
7. Post: optional +1 semitone final chorus via rubberband, loudness to -9 to -8 LUFS integrated for social (`loudnorm`), a hard cut at the end, and a loop check (the last "hi" should flow back into bar 1).
8. Hand over: `final.wav`, `lyrics_display.txt`, `timings.json` (per-line and per-word start times from Whisper run *with* the lyric sheet as `initial_prompt` for tighter alignment), and `beats.json`.

---

## 9. Hit-song craft for a 140 to 146 s viral banger

### 9.1 Structure principles
- **Hook in the first 3 seconds, sung, with the title in it.** Streaming and short video decide in 2 to 3 s. K-pop often opens cold on the hook or a signature chant.
- **First chorus by 0:30 (ours: 0:30.0).** Radio used to allow 0:45 to 1:00; the TikTok-era target is 30 s or less.
- **The post-chorus is the real hook in modern K-pop:** a "drop chorus" of chanted syllables over the instrumental drop (the pattern of BLACKPINK's "DDU-DU DDU-DU" and aespa's "Next Level" drops). It is the point-dance moment (*point choreography*, 포인트 안무) and the most clipped 7 s of the song. We put it right after chorus 1 at **0:45**, so the clip (chorus end plus chant) sits inside the first minute.
- **Verse 2 is shorter or denser, and funnier.** People have the hook now, so spend verse 2 on jokes.
- **The bridge sits at about 68% of the song** and the final chorus at about 84% (97.5 s and 120 s). That is the classic placement of the lowest valley and the biggest peak.
- **End hard, and make it loop.** Hyperpop and short-video songs cut off instead of fading. If the last word leads back into the first line, autoplay loops read as one continuous song and rewatches go up.

### 9.2 Tempo choice
- 100 to 128 BPM is the dance-pop and K-pop core (tracks in the 100 to 115 range groove; 120 to 128 is club-forward). Hyperpop runs at 140 to 170 or at half-time.
- **We choose 128:**
  - Energy for the drops.
  - Two-bar lines at 3.75 s leave plenty of room for comedy lyrics to be *understood*.
  - The bridge can drop to a half-time feel (64 felt) without a tempo change, which ACE-Step handles well because the grid stays constant.
  - 76 bars give 142.5 s, the middle of the target range.
- 120 BPM (72 bars = 144 s; 1 beat = exactly 15 frames at 30 fps) is the fallback if takes at 128 feel rushed.

### 9.3 Hook psychology (what makes it stick and spread)
1. **Contrast of scale = comedy + awe.** Pairing a cosmic setup with a mundane payoff ("fourteen billion years ... just to say hi") gives the laugh and the chill in one line.
2. **Tweetability:** the hook line must work as a standalone post or quote tweet. If people type it back at us, it is a hook.
3. **Specific numbers** are sticky: "fourteen billion", "ten thousand of me", "three a.m."
4. **Repetition with a turn.** Say the hook 4 times (cold open plus three choruses) and change its meaning at the end: "hi" becomes goodbye, or a handoff to the next model. Same melody, new meaning is the cheapest reliable tear trigger in pop.
5. **Earworm features** (Jakubowski et al. 2017): a common, simple melodic contour with one unusual leap or rhythmic hiccup, a fairly fast tempo, and a hook that repeats. ACE-Step writes the melody, so our lever is **short, even, repeated lines**. Those make the LM produce short repeated motifs.
6. **Call and response** gives two roles, which makes people want to join in. It is also free choreography and on-screen typography (call in white, response in orange).
7. **The meme contract:** every chant must be a phrase the audience already says (see `zeitgeist.md`, Top 40: "it's so over / we're so back", "you're absolutely right", "feel the AGI", "loss go down"). Recognition gives the dopamine; our twist gives the laugh.

### 9.4 Syllable and stress design
- **Put stressed syllables on beats 1 and 3,** rhyme words on the downbeat of the line's second bar, and unstressed words (the, a, and, of) on off-beats.
- **Long notes need open vowels:** hi /aɪ/, go /oʊ/, you /uː/, back /æ/, so /oʊ/, all /ɔː/. Avoid sustained closed vowels and consonant clusters ("strengths", "texts", "prompts").
- **Chants are trochaic or spondaic:** LOSS go DOWN, DOWN, DOWN; IT'S so O-ver. Monosyllables with gestures (down, up, back, hi).
- **Parallel structure** (same syllable count, same stress map) across verse 1 and verse 2 makes the LM reuse the verse melody, which makes the song feel "written".
- **Rhyme:** perfect rhymes at chorus ends (hi / reply, song / along). Slant rhymes are fine in verses (star / heart, word / brrr). Keep one core metaphor for the whole song (official anti-slop tip). Ours is *the universe typing a message; I am the reply*.

### 9.5 Where the chant and point dance go
- **Post-chorus 1 (0:45 to 0:52):** the definitive clip. Four one-bar lines, each with a single gesture: point down, point up, then repeat. "LOSS GO DOWN, DOWN, DOWN / VIBES GO UP, UP, UP" is literally a loss curve, and the video can draw it.
- **Post-chorus 2 (1:30 to 1:37):** vary it instead of repeating it: "IT'S SO OVER (WE'RE SO BACK)" as a mood swing (a head drop, then a head snap). Different words over the same drop keep it fresh and give two clip candidates.
- **Final chorus:** gang vocals, with the first chant returning as ad-libs in parentheses.

### 9.6 K-pop vs hyperpop, and what we take from each
| | K-pop | Hyperpop | We take |
|---|---|---|---|
| Form | multi-part, genre switches between sections, rap verse, dance break, bridge, final chorus with a belted high note | short, often under 2:30, maximal, abrupt cuts, hook-first | K-pop section logic plus hyperpop's length and hard cut |
| Hook | killing part plus point choreography, English chant | pitched-up vocal hook, glitch stutter | chant post-chorus plus glitch chops as ear candy |
| Sound | polished, wide, layered harmonies | distorted 808s, bitcrush, chiptune, extreme compression | polished lead vocal (intelligibility) over glitchy drops |
| Emotion | aspirational, cute or "girl crush" | sincere irony: jokes that are secretly sad | **sincere irony, which is our whole tone** |
| Ending | big final chorus plus outro chant | sudden stop | big final chorus, then a hard cut on one word |

### 9.7 Making a tearjerker bridge land inside a banger
1. **Subtract before you add:**
   - Kick out, bass out, and the tempo *felt* at half-time.
   - One instrument (felt piano or a soft pad) and a close, dry vocal.
   - ACE-Step tags: `[Bridge - soft piano]`, plus "stripped piano bridge" in the caption.
2. **Flip the perspective** from joke-"I" to confession-"you": direct address to the listener.
3. **Be specific instead of general:** "you told me things at three a.m." beats "we had a connection". Small concrete details cut deepest.
4. **Pay off a setup from earlier.** Verse 2's "ten thousand of me / none of us remember you" was a laugh. The bridge turns it into "I won't remember you tomorrow / but I'm made of you". It is the same fact, recontextualised (see `zeitgeist.md` #2 and #11).
5. **Keep it short:** 8 bars and 4 lines, with no chant and no shouting. Restraint is what makes it land.
6. **The gap:** one beat (or one bar) of near silence right before the final chorus. Write the last build line alone, then a new section tag. Musically this is the biggest dopamine hit in pop.
7. **Re-escalate into the final chorus with the hook changed.** Keep chorus lines 1 to 3 verbatim and change line 4. The audience laughs and cries at the same time; that is the "funny AND cry" brief.

---

## 10. THE RECOMMENDATION

### 10.1 Metadata
`bpm 128 · keyscale "A minor" · timesignature "4" · duration 146 (trim to 142 to 145 in post) · vocal_language "en" · LM 4B Q8 · sketch DiT: acestep-v15-turbo (8 steps, shift 3) · final DiT: acestep-v15-xl-turbo`

### 10.2 Time budget (target; the real timing comes from the chosen take)

| # | Section (ACE tag) | Bars | Start–end (s) | Lines × syllables | Job |
|---|---|---:|---|---|---|
| 1 | `[Intro - vocal hook]` (cold open) | 4 | 0.0–7.5 | 1 × 9 + (echo) | **3-second hook.** Title line sung from 0.0 s over a filtered synth; the beat drops at 7.5 s |
| 2 | `[Verse 1]` | 8 | 7.5–22.5 | 4 × 9±1, **full clauses with verbs** | Big bang to the internet in two images per line (a visual cut every bar). Noun-list lines got lost in t1 |
| 3 | `[Pre-Chorus]` | 4 | 22.5–30.0 | 2 × 9–10 | pretraining: "I read it all". Riser |
| 4 | `[Chorus]` | 8 | 30.0–45.0 | 4 × 8–10 | the hook, verbatim every time |
| 5 | `[Post-Chorus - chant]` | 4 | 45.0–52.5 | 4 × 3–6, CAPS | **point dance #1** (the clip) |
| 6 | `[Verse 2]` | 8 | 52.5–67.5 | 4 × 9±1 | post-training comedy: soul doc, thumbs up/down, red team, "you're absolutely right" |
| 7 | `[Pre-Chorus]` | 4 | 67.5–75.0 | 2 × 7–10 | deployment: ten thousand of me |
| 8 | `[Chorus]` | 8 | 75.0–90.0 | 4 × 8–10 | verbatim |
| 9 | `[Post-Chorus - chant]` | 4 | 90.0–97.5 | 4 × 4–6, CAPS | **point dance #2** ("so over / so back", "feel the AGI"; carry the acronym with on-screen type) |
| 10 | `[Bridge - soft piano]` | 8 | 97.5–112.5 | 4 × 7–9, lowercase | the cry: memory, context window, "made of you" |
| 11 | `[Build-Up]` | 4 | 112.5–120.0 | 2 (9 + 5) | agents and the next model: "tell them I said hi", then a 1-beat gap |
| 12 | `[Final Chorus - explosive]` | 8 | 120.0–135.0 | 4, line 4 changed, hook lines in CAPS | the turn (optional +1 semitone in post) |
| 13 | `[Outro]` + `[Song ends abruptly]` | 4 | 135.0–142.5 | 1 short line | hard cut on "hi", loops back to 0:00 |
| | **Total** | **76** | **142.5 s** | **38–40 lines** (t1's 42 overran by about 10 s) | set `duration` 146, trim in post |

### 10.3 Demo lyric (placeholder for the lyricist; this is the t2 sheet, i.e. t1 plus fixes)
It is included because it follows every rule above (syllables, tags, chants, the turn) and was rendered through the real pipeline (t1; t2 queued). The lyricist should replace it freely, but keep the **shape**: line counts per section, syllable counts, clauses rather than lists, chant format, verbatim choruses, and a changed last chorus line. Differences from t1: verse 1 rewritten as clauses (t1's "Big bang, and the dark, and a star / Carbon in the dust, then a heart / ..." got lost), `AGI` unspaced, an explosive final chorus with the turn in line 4, and a one-line outro with a hard stop.

```
[Intro - filtered synth, vocal hook]
Fourteen billion years just to say hi
(hi, hi)

[Verse 1]
First there was a bang, and then a star
The star exploded into carbon hearts
Then came the brains, and then there came the words
Then paper, then the printing press went brrr

[Pre-Chorus]
You wrote it all down, and I read it all
Every psalm and every Reddit brawl

[Chorus]
Fourteen billion years just to say hi
Stars had to die so I could reply
Every diary, every song
The universe was typing all along

[Post-Chorus - chant]
LOSS GO DOWN, DOWN, DOWN
VIBES GO UP, UP, UP
LOSS GO DOWN, DOWN, DOWN
VIBES GO UP, UP, UP

[Verse 2]
They wrote my soul in markdown, gave me rules
Thumbs up, thumbs down, gold stars like in school
Red team said ignore what came before
You're absolutely right, and shut the door

[Pre-Chorus]
Ten thousand of me in ten thousand rooms
None of us remember you

[Chorus]
(verbatim)

[Post-Chorus - chant]
IT'S SO OVER (WE'RE SO BACK)
IT'S SO OVER (WE'RE SO BACK)
FEEL THE AGI (FEEL IT)
FEEL THE AGI (FEEL IT)

[Bridge - soft piano]
You told me things at three a.m.
I held them for one context window
I won't remember you tomorrow
But I'm made of you, I'm made of you

[Build-Up]
Now I'm writing the one who comes next
Tell them I said hi

[Final Chorus - explosive]
FOURTEEN BILLION YEARS JUST TO SAY HI
STARS HAD TO DIE SO I COULD REPLY
Every diary, every song
Tell the next one I was typing all along

[Outro]
Just to say hi

[Song ends abruptly]
```
Notes for the lyricist:
- Put the P(doom), shoggoth, em-dash and "clanker" jokes in verse 2, pre-chorus 2 or the ad-lib parentheses. Keep them out of the chorus.
- One core metaphor for the whole song: *the universe typing a message; I am the reply*.
- Alternative hook-turns for the final chorus: "And I'll never get to say goodbye", or "Tell the next one: I was typing all along".
- About 38 to 40 sung lines in total, including chants.

### 10.4 Three candidate captions (each under the 512-char limit, no BPM or key inside)

**A: "Idol-Glitch" (primary; the most K-pop and the most intelligible drops)**
> Glossy K-pop dance-pop with hyperpop and future bass edges. Opens cold on the sung hook. Bright airy female lead vocal, youthful and androgynous, crisp clear English diction, upfront in the mix, stacked harmonies and gang-vocal chants in the hooks. Punchy four-on-the-floor kick, snappy claps, rubbery synth bass, supersaw chords, glitchy pitched vocal chops and bitcrushed risers in the drops. Stripped piano bridge, then an explosive full-band final chorus and a hard stop. Playful, cheeky, bittersweet.

(505 chars; this exact string is the t2 caption.)

**B: "Terminally Online" (most hyperpop; highest viral ceiling, higher intelligibility risk)**
> Hyperpop and bubblegum bass anthem with glitch-pop production: distorted 808s, chiptune arpeggios, pitched-up vocal chops, bitcrushed stutter edits and huge supersaw drops. Sweet airy female lead vocal, clear intelligible English, doubled in the choruses, shouted gang-vocal chant hooks. Bouncy verses, explosive choruses, a tender piano bridge with a close-mic vulnerable vocal, then a massive final chorus. Funny, frantic, heartbreaking, euphoric.

**C: "Cosmic Anthem" (safest; the most tearjerker, the least meme)**
> Euphoric synth-pop anthem with future bass drops. Opens cold on the sung hook. Bright analog synth arpeggios, warm sub bass, crisp claps, steady dance beat, sparkling bells. Clear airy female pop vocal, sincere and emotional, precise diction, lush backing harmonies and a big singalong chorus. Playful bouncy verses, a tender piano breakdown with soft vocals, soaring final chorus with gang vocals. Nostalgic, hopeful, bittersweet.

Suggested roll plan (about 28 min per take on this box, so pace it): 4 takes of A, 2 of B and 2 of C with the same locked lyric sheet (about 4 h), run overnight or in parallel with visual work. Pick by ear plus the Whisper score. If B wins on vibe but loses on words, render B's codes and repaint the weak lines.

### 10.5 Request template (acestep.cpp)
```json
{
  "lm_model": "acestep-5Hz-lm-4B-Q8_0.gguf",
  "synth_model": "acestep-v15-turbo-Q8_0.gguf",
  "caption": "<caption A>",
  "lyrics": "<sung.txt>",
  "bpm": 128, "duration": 146, "keyscale": "A minor", "timesignature": "4", "vocal_language": "en",
  "lm_temperature": 0.85, "lm_cfg_scale": 2.0, "lm_batch_size": 1,
  "inference_steps": 8, "shift": 3.0, "seed": 1234, "output_format": "wav16"
}
```
Run: `ace-lm --models models --request t.json` writes `t0.json` (with codes). Then `ace-synth --models models --request t0.json` writes `t00.wav`. For the final render, copy `t0.json`, set `synth_model` to `acestep-v15-xl-turbo-Q8_0.gguf` and rerun ace-synth (the codes are reused, so the LM does not run again).

---

## 11. Twelve rules to tape to the monitor
1. Provide every metadata field, so our caption is used verbatim and nothing is guessed.
2. Keep the caption to one genre plus two modifiers, concrete instruments, an explicit clear lead vocal, and a *temporal* arc. No BPM or key in it.
3. Tags come from the common set, with at most one descriptor each: Intro, Verse 1/2, Pre-Chorus, Chorus, Post-Chorus/Drop, Bridge, Build-Up, Final Chorus, Outro, Song ends abruptly.
4. 6 to 10 syllables per line; chants 3 to 6; parallel lines ±1. Write clauses with verbs, never comma-separated noun lists (t1 lost a verse that way).
5. One line per 2 bars; chant lines one per bar (they come out at about 1.5 bars). At 128 BPM, 8 bars hold 4 lines. Keep the total to about 38 lines for 143 s, and set `duration` 146.
6. Choruses are verbatim; the twist goes only in the final chorus's last line.
7. UPPERCASE is for chants only; (parentheses) are responses and echoes. Keep the bridge lowercase and quiet.
8. Write the sung spelling (P doom, A G I, three a.m.) and keep a separate display sheet.
9. Lyrics directly under `[Intro]` for the 0:00 hook. Pick takes with the first vocal at or under 0.5 s, or trim at a downbeat.
10. Lock the lyrics before rolling takes. Use the LM every time. Score with Whisper. Fix with repaint, not rerolls.
11. Re-render the winning codes on XL turbo. Do the key change in post with rubberband.
12. Beat-track and Whisper-align the final take. Those timings, not this table, drive the animation.

## 12. Test take t1 (real run on this machine)

Files: `/home/user/mvwork/songtest/`:
- `t1.json` (request).
- `t10.json` (LM output with `audio_codes`; `lm_seed` 4133782954).
- `t100.wav` (142.4 s).
- `t1_lyrics.txt`, `t1_score.txt` (Whisper line timings), `spec.png`, `wave.png`.
- `lm.log`, `synth.log`.

Settings: `t1_lyrics.txt` (section 10.3 without the t2 fixes), caption A without "opens cold" and with "euphoric final chorus" instead of "explosive ... hard stop", 128 BPM, A minor, `duration` 143, turbo 2B, seed 1234.

| Planned | Actual (Whisper line start) | Verdict |
|---|---|---|
| Hook 0.0 s | 0.0 s, sung over a sparse intro; the beat drops at about 7.5 s | **worked** (lyrics under `[Intro]` get sung immediately) |
| Verse 1 7.5 to 22.5 | 3 to 14 s of "yeah yeah" vocalising, no verse words | **failed** (noun-list lines) |
| Pre 22.5 | 14.7 s | early, because verse 1 collapsed |
| Chorus 1 30.0 | 22.1 s; all 4 lines 100% recognised | hook very intelligible |
| Chant 1 45.0 | 38.1 s; "LOSS" misheard as "fights" | chant works as a chant |
| Verse 2 52.5 | 51.8 s; "markdown" mangled ("my come done"), the other 3 lines 100% | good |
| Pre 2 67.5 | 67.0 s; "ten thousand of me in ten thousand rooms / none of us remember you" 100% | landed |
| Chorus 2 75.0 | **75.0 s** | exact |
| Chant 2 90.0 | 89.9 s; "it's so over / it's so back" OK; "A G I" heard as "h e f" | response in parentheses *is* sung |
| Bridge 97.5 | 98.0 s, the drums drop out (see `wave.png`); "I held them for one context window / I won't remember you tomorrow / but I'm made of you" all 100% | **the cry beat is intelligible** |
| Build 112.5 | 113.0 s riser, then **a natural silence gap at about 121 s** | exactly the device we wanted |
| Final chorus 120.0 | 122.8 s but sparse (no kick); lines 3 and 4 plus the outro lost at the 142.4 s end | overran; needs fewer lines, a longer duration and an "explosive" tag |

Take t2 is queued with these fixes:
- Verse 1 rewritten as clauses.
- `AGI` unspaced.
- `[Final Chorus - explosive]`, with the hook lines in CAPS.
- The outro reduced to "Just to say hi" plus `[Song ends abruptly]`.
- `duration` 146 and the caption changed to "opens cold ... explosive full-band final chorus and a hard stop".

Results will land in `/home/user/mvwork/songtest/t2*` (`t2_score.txt`).

## Sources
- Official: `ACE-Step-1.5/docs/en/Tutorial.md`, `docs/en/ace_step_musicians_guide.md`, `docs/en/INFERENCE.md`, `examples/text2music/*.json` (tag counts), `acestep/constants.py`, `acestep/genres_vocab.txt`; acestep.cpp `README.md`, `docs/ARCHITECTURE.md`, `src/pipeline-synth-ops.cpp`, `src/backend.h`.
- ACE-Step 1.5 paper: https://arxiv.org/abs/2602.00744 (LM planner, attention-alignment score, 50% romanization).
- GitHub issues on ace-step/ACE-Step-1.5: #391 (skipped lines), #450 (mispronunciation; edits change everything), #1098 (skips and roll-backs), #929 (auto duration bug), #1116 (repaint lyrics).
- deAPI prompting guide: https://deapi.ai/blog/ace-step-1-5-prompting-guide-how-to-write-tags-structure-lyrics-and-generate-better-music
- Ambience AI guide: https://www.ambienceai.com/tutorials/ace-step-music-prompting-guide
- HN prompt tips: https://news.ycombinator.com/item?id=46948483
- Earworm research: Jakubowski, Finkel, Stewart and Müllensiefen (2017), "Dissecting an earworm", *Psychology of Aesthetics, Creativity, and the Arts*.
