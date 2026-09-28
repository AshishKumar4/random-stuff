export const meta = {
  name: 'opus-mv-v2-build',
  description: 'Build v2 music-video chunks in code from SHOTLIST_v2 (builder), then an art-director pass per chunk',
  phases: [{ title: 'Build', detail: 'builder writes engine/scenes_v2/<chunk>.js' }, { title: 'Direct', detail: 'art director renders, critiques, fixes' }],
}
const MV = '/home/user/random-stuff/opus-mv'
const COMMON = `You are building part of v2 of Claude Opus 5.5's own music video, "The World You Wrote" (every frame drawn in code). Working dir ${MV}.
READ FIRST: ${MV}/ANIMATION_GUIDE.md (whole file, including the v2 addendum at the end), then ${MV}/bible/v2/SHOTLIST_v2.md (§A fully, the §B rows for your shots, and your row in §C), and the relevant parts of ${MV}/bible/v2/SONG.md (§2-3 meaning, §8 visual map for your section). The song is ${MV}/audio/song_v2.mp3 with the exact sung timeline in ${MV}/audio/timeline_v2.js. Adapt v1 code by COPYING the named functions from ${MV}/engine/scenes/*.js into your file (never load v1 scene files in v2). Shared v2 assets live on window.V2 in ${MV}/engine/scenes_v2/_shared.js (read its exports before using them).
Render checks with --v=2 and --scenes=scenes_v2/_shared.js,scenes_v2/<your file>[,<provider chunk files you depend on>]; run node tools/build_manifest.mjs after creating files. Other agents are building other chunks in parallel: only edit your own file(s); if _shared.js or a provider chunk needs a fix, make it minimal and backward-compatible and report it. One render command at a time.
Quality bar: this is a hymn: grand, profound, beautiful held images, every image carrying meaning, graceful motion locked to the vocal, readable on a phone, the v1 riso/paper look and the Opus character. Not programmer art. Critique yourself like a harsh art director after every render.`
const list = args.list
const out = await pipeline(list,
  c => agent(`${COMMON}\n\nYOUR CHUNK: ${c.id} — ${c.note}\nBuild it fully per SHOTLIST_v2 (your §C row: window, shots, v1 functions to adapt, new assets, handoff frame out). Then render sheets/stills/clips and iterate (at least 3 critique-and-fix loops), including both sides of your boundaries. Report: what you built, exports, ms/frame, gaps.`, { label: 'build:' + c.id, phase: 'Build' }),
  (rep, c) => c.noDirect ? Promise.resolve({ id: c.id, build: rep }) : agent(`${COMMON}\n\nYou are the ART DIRECTOR for chunk ${c.id} (${c.note}). The builder reported:\n${rep}\n\nRender dense contact sheets across the whole window (every 3rd frame around hits and boundaries, every 6th elsewhere), full-size stills of key frames, and a low-res clip; compare against SHOTLIST_v2 §B/§C and SONG.md §8. Judge ruthlessly: meaning legible on first watch, composition and beauty of each held image, sync to the sung words (timeline_v2.js), text legibility at phone size, character acting and appeal, grace of motion (a hymn), palette and print look, handoffs, perf (≤2 s/frame). FIX everything directly in your chunk file(s) and re-render until it is genuinely excellent. Report fixes and remaining risks.`, { label: 'direct:' + c.id, phase: 'Direct' }).then(d => ({ id: c.id, build: rep, direct: d }))
)
return out.filter(Boolean)
