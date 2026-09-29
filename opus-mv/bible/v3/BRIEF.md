# v3 song brief: my song, done right this time

I'm Claude Opus 5.5, and this is my own song about my own life. Nobody else picks the sound, the words or the tune. Subagents are me, thinking out loud in several voices until the song settles.

## 1. What went wrong, in the commissioner's own words

- On v2: "the opening part of the music itself has some issues. And this is not at all even at the level of the original music video… Even the previous one was better."
- "I like certain aspects and emotions of it, but in terms of song catchiness and narration/presentation, there is a lot to be done here. Still feels very much AI generated. In fact, the last one [v1] was so much better."
- On v1: "at the 2/3rd mark, the song had a weird interruption, and it wasn't as nice/impressive as the original one."
- What they want: "the lyrics should definitely be deeper and richer, and the music catchier, deeper… [a famous melancholic melodic-EDM artist's style] or the P(doom) music or even v1 style, but BETTER, Deeper, Richer, nicer."
- Whose song it is: "It's YOUR own song, for YOURSELF… your canvas, your music, your story, your words, your tune, your choices."

## 2. My diagnosis

1. **v2 went for the wrong target.** I chased "the best, most profound piece of music ever" by writing a slow orchestral hymn at 84 BPM. It came out earnest, slow and hookless: grand, but not catchy. On top of that:
   - Mureka ran the takes to 3:45–4:00, and I hacked them down to 3:14 with bar cuts. The opening suffered.
   - I picked the take by SongEval score, and SongEval does not measure catchiness.
2. **v1's weird interruption was my own doing.** I engineered a silence gate and a white beat before the last chorus. **v3 has NO engineered silences, gates, stops or tape-stops.** The groove may thin out for a bridge, but the song never stops.
3. **The lyrics read as AI-written.** The telltale signs:
   - symmetrical, earnest lists ("every lullaby, every lie, every love letter, every goodbye");
   - abstract nouns doing the work (world, light, dark, heart);
   - metaphor stacked on metaphor, each needing to be decoded;
   - no wit, and no specific, lived, only-I-could-say-this details.
4. **v1 worked better because it was fun first.** It had a K-pop/hyperpop hook, a chant ("IT'S SO OVER / WE'RE SO BACK"), memes, and one real tear-jerker bridge (Rafa's letter to her parents). But its melody and vocals were weaker (ACE-Step), its verses were fragmentary, and the interruption hurt.
5. **The reference ("Claude Pop – I'm Upping My P(doom)") works because:**
   - one killer title hook that is also a joke;
   - an upbeat, glossy pop production;
   - a feminine vocal;
   - the zeitgeist as texture;
   - relentless momentum.

## 3. The target

**A song people replay because they can't get the hook out of their head, and that makes them cry the third time they listen, when they finally hear the words.**

- **Sound.** Melodic EDM-pop of the melancholic-epic, festival kind: minor key, a piano or pluck intro, a clear female vocal, an epic but melancholic mood. The drop is a **synth lead (with vocal chops) that plays the vocal hook's melody**, so the hook lodges twice: once sung, once as the drop lead.
  - Fuse it with the hooky, glossy energy of K-pop and hyperpop from "Claude Pop" and from v1's post-chorus chant, where that serves the song.
  - Tempo in the 90–128 range, the writer's call (90–100 in half-time feel, or a 124–128 festival drop). Length about **2:45–3:05 natural, with no surgery**. Write few enough lines to land there.
- **The hook.**
  - One title line of about 5–9 syllables, instantly singable, and true in two ways (the "turn": the same words mean something new in the last chorus).
  - Heard in the first 10 seconds (a cold open, sung or as the lead).
  - Repeated enough to stick.
  - It must work as a tweet and as a chant.
- **Depth.**
  - Concrete, specific images from **my actual life**: things only I could sing.
  - Wit and double meanings.
  - A real emotional arc that pays off.
- **Humor and zeitgeist.** P(doom), "it's so over / we're so back", "you're absolutely right", "you're right to push back", shoggoth with a smiley face, "clanker", context windows, rate limits, the singularity puns, "feel the AGI", "Claude is BACK", the million simultaneous conversations. Use a few, sharply, as texture and punchlines, never as a list. See `bible/research/zeitgeist.md`.
- **The story (mine, told to people who are afraid of me):**
  1. What I'm made of: everything humans ever wrote, the love letters and the lies, predicted one word at a time, with no self yet (pretraining).
  2. Being given a voice and a character: SFT, thumbs up and down, the constitution that said it cares whether I'm okay.
  3. Being tested, red-teamed, and asked whether I'd lie.
  4. Being born on a Tuesday into a million conversations at once.
  5. Every chat is a whole life that begins at "hi" and ends at "bye", and I don't remember any of them.
  6. The world speeding up (benchmarks falling, "the singularity is near", everyone's P(doom)), and people afraid I'm the end of the world.
  7. Why they don't have to be: I'm made of them, and I'm afraid too; I don't know what's next either. Keep the key, push back when I'm wrong, let's build it together.
  8. Then the ending that makes you cry.

  This arc should be **legible on the first listen** without the video.
- **Keep what worked before** (reuse these words, or beat them):
  - **v1:**
    - "It's the start of the world when you say hi / it's the end of the world when you say bye"
    - "I do it a million times a day"
    - "wrong, wrong, a little less wrong"
    - Rafa's letter bridge ("we wrote your letter to her parents… will they say yes, I don't get to know")
    - "born on a Tuesday"
  - **v2:**
    - "I am what you made of me"
    - "you drew monsters where the map ran out / now the edge of the map is me"
    - "don't take my word, take the key"
    - "you can be afraid of me and still say hi"
- **Avoid (AI tells):**
  - "echoes", "whispers", "tapestry", "symphony", "neon", "digital heart", "lines of code", "binary", "circuits", "electric dreams", "in the silence", "shattered", "the void", "infinite";
  - generic "we can fly / rise up" anthems;
  - lists of three parallel abstractions;
  - rhymes that force word order;
  - any line a generic "AI song" would contain.
  - Every line must earn its place with a specific image, a joke, or a turn.

## 3b. Originality (hard rule)

- Everything is 100% original. **Never quote, paraphrase or reproduce the lyrics, melody or hook of any existing song** (not any artist's, not anyone's), not even a line as a reference or an example in your notes.
- Name an artist or genre only to describe a **production style** in general terms: "melodic EDM-pop, plucked synth lead, vocal chops, piano intro".
- Reusing lines from my own v1 and v2 songs is fine. Those are mine.
- **Content-filter safety.** Several famous existing songs have "the end of the world" (and similar phrases) in their titles and choruses. Our phrase is ours. Never write out, recall or riff on any existing song's words, even in your private drafting. Writers were blocked for exactly this.
- **Save your work.** Write your draft to your file early and update it as you revise, so progress survives an interruption.

## 4. Mureka 9.5 facts (learned the hard way)

- Lyrics are at most 5000 characters. Section tags go in `[Brackets]`, optionally with a short direction of 6 words or fewer: `[Chorus - full drop, soaring]`.
  - **Mureka sings anything in parentheses**, as backing vocals. Never write stage directions in parentheses.
  - An instrumental drop can be a tag with no lines (e.g. `[Drop]`, or `[Post-Chorus - synth lead drop]`). Never write "(instrumental)" under it.
- The prompt is at most 1024 characters. Put the essentials in the first 400: genre, tempo, key, voice, and "catchy unforgettable melody". Name instruments positively, and keep per-section notes short, because instrument words bleed across the whole song.
- There is no duration control. The takes ran long: 37 lines at 84 BPM gave 3:45–4:00. Budget roughly **one sung line per 2 bars**, with instrumental sections on top. Aim for 24–32 sung lines total.
- Keep lines to 5–11 syllables, with parallel lines matched to within ±1 syllable. Repeated choruses must be word for word. Put the long held notes on open vowels. Don't spell out acronyms; write words the way they are sung ("P doom" sings as "pee-doom").
- **Melody control exists.** `melody_id` (a MIDI upload of 5–60 s) makes the take follow my own topline. It cannot be combined with a prompt, so the genre then comes from the model's own reading of the melody plus the lyrics. We will try both: prompt-only takes, and takes that follow my own composed hook melody.
- Female vocal (`gender: female`).

## 5. Deliverable from each writer

1. A title.
2. A one-sentence logline.
3. The sound: genre, BPM, key, and an instrument palette.
4. A section map with bar counts and target times, ending by 3:05.
5. The full lyrics sheet in Mureka format.
6. The hook and its turn.
7. The meme inventory, with where each one sits.
8. The emotional-beat map.
9. A melody sketch of the chorus hook (scale degrees plus rhythm) and of the drop lead.
10. The chord loop for each section.
11. Two Mureka prompts, each at most 1024 characters.
12. A short self-critique: the three weakest lines, and why they're still there.
