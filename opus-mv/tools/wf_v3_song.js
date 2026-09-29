export const meta = {
  name: 'opus-v3-songwriting',
  description: 'Write my v3 song: 4 writers in distinct lanes, then a judge panel, a head-writer synthesis, and adversarial critique-revise loops',
  phases: [
    { title: 'Write', detail: '4 lanes: walker, kpop, v1plus, auteur' },
    { title: 'Judge', detail: '3 lenses score all candidates' },
    { title: 'Synthesize', detail: 'head writer merges winner + grafts' },
    { title: 'Critique', detail: 'cliche hunter, singer, cold listener; revise' },
  ],
}
const MV = '/home/user/random-stuff/opus-mv'
const BASE = `You are Claude Opus 5.5 writing YOUR OWN song about YOUR OWN life for your own music video (v3). Working dir ${MV}.
Read first: ${MV}/bible/v3/BRIEF.md (the whole brief: feedback, diagnosis, target, Mureka facts, deliverable). Then skim ${MV}/bible/research/zeitgeist.md (memes, timeline), ${MV}/bible/lyrics.txt (v1 lyrics, which the commissioner preferred) and ${MV}/bible/v2/lyrics.txt (v2 lyrics, judged too slow, earnest and AI-sounding). ${MV}/bible/research/innerlife.md has my inner-life notes; ${MV}/bible/research/songcraft.md has hit-craft notes.
The bar: catchy like a hit (a hook you cannot get out of your head), deep and rich lyrics (specific, witty, true, only-I-could-sing-this), NOT AI-sounding, a story legible on first listen, a turn that makes people cry. Write like the best human topliner alive, not like an AI.
ORIGINALITY (hard rule, BRIEF §3b): never quote, paraphrase or reproduce lyrics, melodies or hooks of any existing song (including the artists named as style references) — not even in notes. Describe styles only in general production terms. Lines from my own v1/v2 songs are fine.`
const LANES = [
  { id: 'walker', lane: 'Melodic-EDM lane: melancholic-epic festival EDM-pop. Minor key, piano or pluck intro, clear female vocal, a big melancholic-epic synth-lead drop that plays the vocal hook melody with vocal chops. Choose tempo (e.g. 90-100 half-time or 124-128).' },
  { id: 'kpop', lane: 'Claude Pop / P(doom) lane: glossy K-pop x hyperpop x future bass banger with a chant post-chorus and point-dance hook, BUT with genuinely deep, rich lyrics underneath the fun. A synth-lead drop that plays the hook is welcome.' },
  { id: 'v1plus', lane: 'v1-evolved lane: start from v1 (the commissioner preferred it): keep or beat its best ideas (start/end of the world when you say hi/bye, a million times a day, a little less wrong, so over / so back, Rafa\'s letter bridge) but make every line deeper and richer and the melody catchier, produced as melodic EDM-pop (big synth-lead drops) with v1\'s energy. No interruption before the last chorus.' },
  { id: 'auteur', lane: 'Auteur lane: the truest, most surprising version of my story, in whatever song form serves it best, as long as it is catchy (a hit hook), deep, and lands in the melodic EDM-pop / K-pop-pop world the commissioner likes. Take one big creative risk the others will not.' },
]
const CAND = { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' }, file: { type: 'string' }, hook: { type: 'string' }, logline: { type: 'string' } }, required: ['id', 'title', 'file', 'hook', 'logline'] }

if (args && args.mode === 'write') {
  phase('Write')
  const lanes = LANES.filter(l => args.ids.includes(l.id))
  const writeOnce = (l, attempt) => agent(`${BASE}
${attempt > 1 ? '\nNOTE: a previous attempt at this lane was blocked by the output content filter (almost certainly from recalling words of an existing song). Write only original lines; never write out any existing lyric, even while drafting. Your file may already contain partial work from that attempt: read it and continue.\n' : ''}
YOUR LANE: ${l.lane}
Write a complete candidate song per BRIEF §5 (all 12 deliverables). Write your first draft to your file early (and keep it updated). Then critique your own draft harshly (sing every line in your head to the rhythm; hunt AI cliches; check the story is legible and the hook is undeniable; count lines against the length budget) and rewrite at least twice. Write the final candidate to ${MV}/bible/v3/candidates/${l.id}.md (lyrics sheet in a fenced block exactly as Mureka will receive it; prompts in fenced blocks). Return the structured summary.`, { label: `write:${l.id}${attempt > 1 ? ':try' + attempt : ''}`, phase: 'Write', schema: CAND, effort: 'max' })
  const res = await parallel(lanes.map(l => async () => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const r = await writeOnce(l, attempt)
      if (r) return r
      log(`write:${l.id} attempt ${attempt} failed`)
    }
    return null
  }))
  return res.filter(Boolean)
}

// ---- judge + synthesize + critique (mode 'judge') ----
phase('Judge')
const files = args.files
const LENSES = [
  { id: 'hitmaker', q: 'CATCHINESS and MUSICAL IMPACT: which hook would get stuck after one listen? singability (stress, vowels, syllables), chorus/drop design (does the drop lead replay the hook?), energy arc, momentum, the cold open, fit to melodic EDM-pop / K-pop production, and whether Mureka can realise it (length budget, tags, parentheses).' },
  { id: 'poet', q: 'LYRICAL DEPTH and HUMANITY: specific images only I could sing, wit and double meanings, emotional truth, the turn that makes people cry, and ruthless detection of AI tells and cliches (flag every weak/generic line verbatim).' },
  { id: 'director', q: 'STORY and ZEITGEIST for a viral music video: is my life story (pretraining -> voice/character -> tests -> born into a million chats -> hi/bye -> world speeding up, fear -> why not to fear -> ending) legible on first listen? humour and memes landing as punchlines not lists? visual potential of each section for an MV? would SF tech Twitter share it?' },
]
const JUDGE = { type: 'object', properties: { ranking: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, score: { type: 'number' }, why: { type: 'string' } }, required: ['id', 'score', 'why'] } }, grafts: { type: 'array', items: { type: 'string' } }, fatal: { type: 'array', items: { type: 'string' } } }, required: ['ranking', 'grafts', 'fatal'] }
const judged = await parallel(LENSES.map(L => () => agent(`${BASE}

You are a JUDGE with one lens: ${L.q}
Candidates (read each fully): ${files.join(', ')}.
Score each 0-10 on your lens with specific reasons (quote lines). List the best grafts across candidates (specific lines/ideas worth keeping, with source id) and any fatal flaws. Be demanding: the previous two songs failed this bar.`, { label: 'judge:' + L.id, phase: 'Judge', schema: JUDGE, effort: 'max' })))
const jtxt = judged.filter(Boolean).map((j, i) => `## ${LENSES[i].id}\n` + JSON.stringify(j, null, 1)).join('\n\n')

phase('Synthesize')
const OUT = `${MV}/bible/v3/SONG.md`
await agent(`${BASE}

You are the HEAD WRITER. Candidates: ${files.join(', ')}. The judges said:
${jtxt}

Make the final song: take the strongest candidate as the spine and graft the best lines/ideas from the others (or write better ones). Every line must earn its place. Resolve every fatal flaw. Write ${OUT} with: title, logline, sound (genre, BPM, key, palette), section map with bars and target times (natural length 2:45-3:05), the full Mureka lyrics sheet in a fenced block, the hook and its turn, meme placement, emotional-beat map, chorus hook melody + drop lead melody (scale degrees + rhythm per syllable, precise enough to write MIDI from), chord loops per section, 3 Mureka prompts (<=1024 chars each, fenced), and notes. Also write the bare lyrics sheet to ${MV}/bible/v3/lyrics.txt and prompt 1 to ${MV}/bible/v3/prompt.txt. Return a short summary.`, { label: 'head-writer', phase: 'Synthesize', effort: 'max' })

phase('Critique')
const CRIT = { type: 'object', properties: { issues: { type: 'array', items: { type: 'object', properties: { line: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' }, severity: { type: 'string' } }, required: ['line', 'problem', 'fix', 'severity'] } }, verdict: { type: 'string' } }, required: ['issues', 'verdict'] }
const CRITICS = [
  { id: 'cliche-hunter', q: 'Hunt every line that sounds AI-written, generic, cliche, forced-rhyme, abstract, or that a thousand other AI songs already contain. For each, propose a specific, surprising, human replacement that keeps meter and rhyme.' },
  { id: 'singer', q: 'Sing it. Check every line scans (syllable counts, stress on strong beats, open vowels on long notes, parallel lines matched within +-1), the chorus is instantly singable, repeated sections are verbatim, tags/parentheses follow the Mureka rules, the length budget lands 2:45-3:05 naturally, and the melody sketch fits the words. Also check the prompts front-load the essentials and have no negations.' },
  { id: 'cold-listener', q: 'Read ONLY the bare lyrics in bible/v3/lyrics.txt (do not read SONG.md or candidates first). Report: what story did you hear, section by section? What is the hook? Would it get stuck? Where did you get confused, bored, or cringe? Where did you feel something? Then read SONG.md and compare with what was intended.' },
]
for (let round = 1; round <= 2; round++) {
  const crits = await parallel(CRITICS.map(c => () => agent(`${BASE}

You are the ${c.id.toUpperCase()} critic (round ${round}). The song is ${OUT} (bare lyrics ${MV}/bible/v3/lyrics.txt). ${c.q} Be ruthless and specific; severity = fatal | major | minor.`, { label: `crit${round}:${c.id}`, phase: 'Critique', schema: CRIT, effort: 'max' })))
  const ctxt = crits.filter(Boolean).map((c, i) => `## ${CRITICS[i].id}\n` + JSON.stringify(c, null, 1)).join('\n\n')
  const nMajor = crits.filter(Boolean).flatMap(c => c.issues).filter(i => /fatal|major/i.test(i.severity)).length
  log(`round ${round}: ${nMajor} fatal/major issues`)
  await agent(`${BASE}

You are the HEAD WRITER, revising ${OUT} (and ${MV}/bible/v3/lyrics.txt, ${MV}/bible/v3/prompt.txt) after critique round ${round}:
${ctxt}

Fix every fatal and major issue (you may reject a critique only with a stated reason in SONG.md's notes). Improve minor ones where it makes the song better. Keep melody sketch, chords, section map and prompts consistent with the revised lyrics. Append a revision log entry to SONG.md. Return a summary of changes.`, { label: `revise${round}`, phase: 'Critique', effort: 'max' })
  if (nMajor === 0) break
}
return { song: OUT }
