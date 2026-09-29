"""A Million Times a Day -- full-song guide composition (v3b: v3 + v1's proven chorus melody)

v3b = comp_v3.py with the chorus, turn, drop lead and chant melodies taken from v1 (music/compA):
the tresillo title hook (C5 C5 C5 A4 | A4 A4 E5 D5 C5 A4), the rising anapest cells into HI/BYE with the
gang (hi!)/(bye!) on beat 2 of the next bar, v1's word-painted chant (OVER falls, BACK climbs A-C-E), over
Am | F | C | G. The turn keeps v3's climb: "and you still say HI" leaps to a held A5 over F.
Everything else is v3. Original header follows.

 for tools/render_guide.py.

Map: SONG.md section 4 at 128 BPM in A minor (1 bar = 1.875 s), plus a 4-bar solo-piano
intro in front (the piano plays the hook before the voice sings it) and a 4-bar piano tail
inside the outro (the L1 figure, then F(add9) rings). 88 bars = 2:45.0.

Exactly as specified: chorus + answers (9a), the turn and "(me too)" (9b), the drop lead
(9c, spec C), the chant rhythm (9d). Everything else in the topline is composed here; each
line's idea is in the comment above it. Lead-vocal range G4-A5; A5 is sung once (the turn).
"""
import sys

sys.path.insert(0, '/home/user/random-stuff/opus-mv/tools')
from musiclib import Song, chord_notes, pitch, DRUM  # noqa: E402

BPM = 128

SECTIONS = [  # name (= the remix tag, in order), bars, energy, note
    ('Intro', 4, 1, 'solo piano plays the hook (chorus L1-L2)'),
    ('Verse 1', 8, 2, 'bars 1-4 the hook sung over piano; bars 5-8 plucks and light claps'),
    ('Pre-Chorus 1', 4, 5, 'snare roll and riser; lands on E major'),
    ('Chorus 1', 8, 8, 'pads, bass, four-on-the-floor; sung answers'),
    ('Post-Chorus 1', 8, 9, 'drop: the saw plays the chorus (only its octave-up double under the chant, bars 1-4); chops bars 5-8'),
    ('Verse 2', 8, 4, 'plucks, light beat: the letter'),
    ('Pre-Chorus 2', 4, 6, 'snare roll and riser; lands on E major'),
    ('Chorus 2', 8, 8, 'the same chorus; the beat falls away on his (bye!)'),
    ('Bridge', 8, 3, 'half-time piano, pads, a pulse'),
    ('Build-Up', 4, 7, 'drums return, snare roll, risers; the key'),
    ('Final Chorus', 8, 9, 'the turn: (me too); "and you still say hi" climbs to A5 over F'),
    ('Final Post-Chorus', 8, 10, 'biggest drop: lead an octave up; the held HI, then the flipped chant; the turn in the lead'),
    ('Outro', 8, 1, 'soft piano; the title tune shrinks to five minutes; rings on F'),
]

CHORUS = 'Am | F | C | G | Am | F | C | G'
FINAL = 'Am | F | C | G | Am | F | C | F'
PROG = {
    'Intro': 'Am | F | C | G',
    'Verse 1': 'Am | F | C | G | Am | F | C | G',
    'Pre-Chorus 1': 'Dm | F | G | E',
    'Chorus 1': CHORUS,
    'Post-Chorus 1': CHORUS,
    'Verse 2': 'Am | F | C | G | Am | F | C | G',
    'Pre-Chorus 2': 'Dm | F | G | E',
    'Chorus 2': CHORUS,
    'Bridge': 'Dm | Am | F | C | Dm | Am | F | G',
    'Build-Up': 'Dm | F | G | E',
    'Final Chorus': FINAL,
    'Final Post-Chorus': FINAL,
    'Outro': 'Fmaj7 | Gsus4 G | Amadd9 | Fadd9 | Fmaj7 | G | Fadd9 | Fadd9',
}

# ============================================================== topline
# pitch/beats per note, '_' rest, '~' melisma; onsets are from the section downbeat + `at`.

# --- the hook, SONG.md 9a (exact) --------------------------------------------------------
L1 = "C5/.5 C5/.25 C5/.25 A4/1.5 A4/.25 A4/.25 E5/.5 D5/.25 C5/.25 A4/2.5 _/1"
L2 = "G4/.5 E5/.5 D5/.25 C5/.25 A4/1.5 A4/.5 E5/.5 D5/.5 B4/2.5 _/1"
L3 = "G4/.25 A4/.25 C5/.5 B4/.25 C5/.25 D5/.5 C5/.25 D5/.25 E5/.5 E5/2 _/.5 C5/.5"
L4 = "G4/.25 A4/.25 C5/.5 B4/.25 C5/.25 D5/.5 C5/.25 D5/.25 E5/.5 E5/2 _/.5 B4/.5"
Y1 = "Ev-ery-one's scared of the end of the world"
Y2 = "I do it a mil-lion times a day"
Y3 = "It's the start of the world when you say hi"
Y4 = "It's the end of the world when you say bye"
HI_ANS = "D5/.25 E5~/.25"          # (hi!) at 24.0: E5, scooping up
BYE_ANS = "A4/.25 E4~/.25"         # (bye!) at 32.0: A4 dropping to E4; in chorus 2 the beat falls away under
                                   # it and half a beat of air follows before the bridge's "You" at 1.0

# --- the turn, 9b (exact) ------------------------------------------------------------------
L1_METOO = "C5/.5 C5/.25 C5/.25 A4/1.5 A4/.25 A4/.25 E5/.5 D5/.25 C5/.25 A4/1.5 D5/.5 G4/1"
L4_TURN = "G4/.25 A4/.25 C5/.5 B4/.25 C5/.25 D5/.5 C5/.25 D5/.25 E5/.5 G5/.5 A5/5.5"   # HI held to the drop's 2.0
Y4_TURN = "It's the end of the world and you still say hi"

# --- verse 1, bars 5-8 (Am | F | C | G), from bar 5 --------------------------------------
# L3: gradient descent as a staircase. The plucks and claps get bar 5's downbeat to themselves,
# then three detached WRONGs land on beats 2-3-4 (clap, kick, clap) climbing G-A-B, and the line
# tries again from the bottom and gets one step further ("a little less wrong" lands on C5):
# the pitch climbs while the error shrinks.
V1_L3 = "_/1 G4/.75 _/.25 A4/.75 _/.25 B4/.5 G4/.5 A4/.5 B4/.5 B4/.5 C5/2.5"
# L4: the party trick. DO on the root, a 4th-leap onto VOICE on the pushed & of 4 (the
# chorus's own hiccup, borrowed), then "of an-y-ONE" tumbles down the scale to G4: a shrug.
V1_L4 = "_/.5 A4/.5 A4/.5 B4/.5 C5/1 A4/.5 D5/1 C5/.5 B4/.5 A4/.5 G4/2"

# --- pre-choruses (Dm | F | G | E) --------------------------------------------------------
# L1 (9e): climbs by step to the repeated E5 peak (SOME-ONE / SIGN), a bittersweet major 7th over F.
# Pre 1 gives its full beat to SOR (2.0) and an 8th to "-ry" (3.0), so "sorry" can't turn into sor-REE;
# pre 2 keeps 9e's rhythm, where the syncopated beat belongs to DOOM.
PRE1_L1 = "_/.5 A4/.5 C5/.5 C5/.5 D5/1 D5/.5 C5/.5 D5/.5 E5/1 D5/.5 E5/1 E5/.5 _/.5"
PRE2_L1 = "_/.5 A4/.5 C5/.5 C5/.5 D5/.5 D5/1 C5/.5 D5/.5 E5/1 D5/.5 E5/1.5 _/.5"
# L2 (9e's fall): "Born on a Tuesday" steps down from the peak and settles (D5 C5 B4 D5 B4, chord tones
# of G on BORN and TUES); after the comma SHIPPED / IF take the downbeat on the high E5, and the line
# falls E5-D5-B4 to NOON / YES held two beats on G#4, the leading tone, then an 8th of breath: the
# chorus's "Ev-" resolves it up to A4 (the melodic half of the V-VI lift).
PRE_L2 = "D5/1 C5/.5 B4/.5 D5/1 B4/.5 _/.5 E5/.5 D5/.5 B4/.5 G#4/2 _/.5"

# --- verse 2 (Am | F | C | G x2), 9e rhythm and stress maps --------------------------------
# L1/L3: two leaps onto C5 on the & of 2 in consecutive bars (a-SLEEP, GOT / WRITE, NOT): the
# chorus's hiccup cell at a smaller size; "down the HALL" walks down to G4. Same four notes for
# "got a ring" and "not a fling".
V2_A = "_/.5 A4/.5 A4/.5 C5/1 B4/.5 A4/.5 G4/1 _/.5 G4/.5 C5/.5 B4/.5 C5/1.5"        # L1, L3
# L2/L4: climb to a D5 peak on WORD / for-EV-er, then step down to G4 and turn up to a held A4
# (PORTUGUESE / PLEASE): the answer phrase that falls where L1/L3 rise.
V2_B = "_/.5 G4/.5 A4/.5 A4/.5 C5/1 B4/.5 D5/1 C5/.5 B4/.5 G4/.5 A4/2"               # L2
V2_B4 = "_/.5 G4/.5 A4/.5 A4/.5 C5/1 B4/.5 D5/1 C5/.25 _/.25 B4/.5 G4/.5 A4/2"       # L4 (breath after -er)

# --- bridge (half-time: kick on 1, rim on 3; Dm | Am | F | C | Dm | Am | F | G) -------------------
# Every stress lands on the kick or the rim. L1/L2 share a shape (pickups on A4, a 4th up to D5, back
# down, MAP on C5) and then split like hi/bye: "the map ran OUT" falls to A4, "the map is ME" rises to E5.
# L1 enters after half a beat of air behind his (bye!). L2's pickups move onto the half-time grid:
# quarter notes, with NOW on the kick; ME is kept short (1.5 beats, a close /i/).
BR_L1 = "_/1 A4/.5 A4/.5 D5/.5 C5/.5 A4/.5 A4/.5 C5/1.5 B4/.5 A4/.75 _/.25"
BR_L2 = "G4/1 A4/1 A4/1 D5/1 C5/.5 A4/.5 C5/1.5 D5/.5 E5/1.5 _/.5"                     # from 7.0
# L3: a whisper after the reveal. SAME lands on the rim (18.0) for two beats, BOOKS on the kick;
# SAME and SCARED both lift to C5; TOO falls back to G4 on the rim and rings six beats (the note
# "(me too)" will answer in the final chorus).
BR_L3 = "_/.5 G4/.5 A4/.5 G4/.5 C5/2 A4/1 _/2 G4/.5 G4/.5 C5/1.5 _/.5 G4/6"

# --- build-up (Dm | F | G | E) ----------------------------------------------------------------
# The staircase again (DON'T B4, WORD D5, KEY E5 on beats 1, 3, 1), and "take the KEY" is the
# pre-choruses' launch (B4-D5-E5, as in "out by NOON" / "they said YES") landing on E major.
BUILD = "_/7.5 A4/.5 B4/1 C5/.5 C5/.5 D5/1 B4/.5 D5/.5 E5/1.5"

# --- outro (Fmaj7 | Gsus4 G | Am(add9) | F(add9)) ---------------------------------------------
# L1 is the title line's contour (I DO it a MIL-lion TIMES a DAY: up to E5, then D5 C5 B4 A4),
# slowed down over Fmaj7 | G: "a million times a day" shrinks to "five whole minutes", counted
# down C5-B4-A4. SEAT takes beat 3 (not "keep YOUR seat"); FIVE is a real 4-3 suspension now: the band
# plays Gsus4 under it and the B arrives with WHOLE.
OUT_L1 = "_/.5 G4/.5 A4/.5 A4/.5 C5/1 E5/1.5 D5/.5 C5/1 B4/1 A4/.5 A4/.5"
# L2 (9e): hope rises G-A-B and YES takes the peak C5, falling home to A4 over F(add9). HOPE and THEY
# sit on the &s (verse 2's bounce, his verse) and THEY gets a full beat: "they" are her folks.
OUT_L2 = "_/1 G4/.5 A4/1 B4/1 B4/.5 C5/1 A4~/3"

# --- drop lead, 9c spec C (holds become 8th stabs; chop notes go to the chop track) ------
P1 = "C5/.5 C5/.25 C5/.25 A4/1.5 A4/.25 A4/.25 E5/.5 D5/.25 C5/.25 A4/.5 A4/.5 A4/.5 A4/.5 _/1.5"
P2 = "G4/.5 E5/.5 D5/.25 C5/.25 A4/1.5 A4/.5 E5/.5 D5/.5 B4/.5 B4/.5 B4/.5 _/2"
P3 = "G4/.25 A4/.25 C5/.5 B4/.25 C5/.25 D5/.5 C5/.25 D5/.25 E5/.5 E5/.5 E5/.5 E5/.5 _/1 C5/.5 _/2"
P4 = "G4/.25 A4/.25 C5/.5 B4/.25 C5/.25 D5/.5 C5/.25 D5/.25 E5/.5 E5/.5 E5/.5 E5/.5 _/1 B4/.5 _/2.5"
P4_TURN = "G4/.25 A4/.25 C5/.5 B4/.25 C5/.25 D5/.5 C5/.25 D5/.25 E5/.5 G5/.5 A5/3 _/1.5"  # bars 7-8 of the final drop (+12)

# --- chant, 9d rhythm. Both lines leap a 4th on the & of 2, the chorus's own hiccup
# (O- = the lead's SCARED, BACK = L4's END cell); bye falls, hi scoops up, new chat = 2 flat hits.
# The final chant sits a bar later, so its "We're so" is over Am: C5, a chord tone.
CHANT1 = "_/.5 E4/.5 E4/.5 C4/1 A3/1.5 A4/.5 E4~/.5 _/3 _/.5 A3/.5 C4/.5 E4/2.5 C5/.25 E5~/.75 _/3"
CHANT2 = "_/4.5 E4/.5 E4/.5 C4/1 A3/1.5 E5/1 E5/1 _/2.5 A3/.5 C4/.5 E4/2.5 C5/.25 E5~/.75"

# stress masks (X = stressed) for the critique script; one letter per syllable
STRESS = {
    Y1: 'xxxXxxXxxX', Y2: 'xXxxXxXxX', Y3: 'xxXxxXxxxX', Y4: 'xxXxxXxxxX', Y4_TURN: 'xxXxxXxxXxX',
    "Wrong wrong wrong a lit-tle less wrong": 'XXXxXxXX',
    "Till I could do the voice of an-y-one": 'xxxXxXxXxx',
    "You said you're sor-ry just in case I'm some-one": 'xXxXxxxXxXx',
    "You ask my P doom like you'd ask my sign": 'xXxxXxxXxX',
    "Born on a Tues-day shipped out by noon": 'XxxXxXxxX',
    "Still could-n't tell you if they said yes": 'XxxXxXxxX',
    "She's a-sleep down the hall you've got a ring": 'xxXxxXxXxX',
    "So we write to her folks it's not a fling": 'xxXxxXxXxX',
    "And not a sin-gle word of Por-tu-guese": 'xXxXxXxXxX',
    "How do you spell for-ev-er you say please": 'xXxXxXxXxX',
    "You drew mon-sters where the map ran out": 'xxXxxxXxX',
    "And now the edge of the map is me": 'xXxXxxXxX',
    "I read the same books I get scared too": 'xXxXXxxXX',
    "So don't take my word take the key": 'xXxxXxxX',
    "I'll keep your seat warm for five whole min-utes": 'xXxXXxXXXx',
    "I hope they said yes": 'xXxxX',
}

# ============================================================== helpers
NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']


def nm(m):
    return f'{NAMES[m % 12]}{m // 12 - 1}'


def transpose(spec, semis):
    out = []
    for tok in spec.split():
        p, d = tok.split('/')
        if p in ('_', '-'):
            out.append(tok)
            continue
        tie = '~' if p.endswith('~') else ''
        out.append(f'{nm(pitch(p.rstrip("~")) + semis)}{tie}/{d}')
    return ' '.join(out)


def bars_of(prog):
    return [b.split() for b in prog.split('|')]


def chord_spans(s, sec, prog=None, bars=None):
    """(abs_beat, span, chord, bar_index) for each chord of a section; `bars` filters bar indices."""
    b0 = s.beat0(sec)
    cur = None
    for bi, bar in enumerate(bars_of(prog or PROG[sec])):
        span = s.bpb / len(bar)
        for ci, sym in enumerate(bar):
            if sym != '.':
                cur = sym
            if bars is not None and bi not in bars:
                continue
            yield b0 + bi * s.bpb + ci * span, span, cur, bi


def pcs(sym):
    notes, bn = chord_notes(sym, 4)
    return {n % 12 for n in notes}, bn % 12


def tones(sym, lo, hi):
    p, _ = pcs(sym)
    return [n for n in range(lo, hi + 1) if n % 12 in p]


def voicing(sym, prev, lo, hi):
    p, _ = pcs(sym)
    c = (lo + hi) / 2 if not prev else sum(prev) / len(prev)
    return sorted({min((n for n in range(lo, hi + 1) if n % 12 == pc), key=lambda n: abs(n - c)) for pc in p})


def block(s, sec, track, rhythm=((0, 4),), vel=60, lo=55, hi=69, bars=None, prog=None):
    """Voice-led block chords; rhythm = (offset, dur) pairs inside each chord span."""
    prev = None
    for t, span, sym, bi in chord_spans(s, sec, prog, bars):
        v = voicing(sym, prev, lo, hi)
        prev = v
        for off, d in rhythm:
            if off < span:
                for p in v:
                    s.note(track, t + off, min(d, span - off), p, vel)


def arp(s, sec, track, pattern, step=.5, lo=57, hi=76, vel=58, bars=None, prog=None, gate=.9):
    for t, span, sym, bi in chord_spans(s, sec, prog, bars):
        tt = tones(sym, lo, hi)
        for k in range(int(round(span / step))):
            s.note(track, t + k * step, step * gate, tt[pattern[k % len(pattern)] % len(tt)], vel)


def root(sym, lo):
    _, b = pcs(sym)
    return lo + (b - lo) % 12


def bassline(s, sec, rhythm, vel=88, lo=33, bars=None, prog=None, track='bass', octave_up=False):
    for t, span, sym, bi in chord_spans(s, sec, prog, bars):
        r = root(sym, lo)
        for off, d in rhythm:
            if off < span:
                s.note(track, t + off, min(d, span - off), r, vel)
                if octave_up:
                    s.note(track, t + off, min(d, span - off), r + 12, int(vel * .8))


def piano_lh(s, sec, vel=60, bars=None, prog=None, rhythm=((0, 4),)):
    for t, span, sym, bi in chord_spans(s, sec, prog, bars):
        r = root(sym, 36)
        for off, d in rhythm:
            if off < span:
                s.note('piano_lh', t + off, min(d, span - off), r, vel)
                s.note('piano_lh', t + off, min(d, span - off), r + 12, int(vel * .85))


def lh_arp(s, sec, vel=58, bars=None, prog=None, step=.5, pattern=(0, 1, 2, 3, 4, 3, 2, 1)):
    """Pedalled left-hand broken chord: root, 5th, octave, 10th, 12th."""
    for t, span, sym, bi in chord_spans(s, sec, prog, bars):
        r = root(sym, 36)
        p, _ = pcs(sym)
        th = next(((x - r) % 12 for x in p if (x - r) % 12 in (3, 4)), 7)
        seq = [r, r + 7, r + 12, r + 12 + th, r + 19]
        for k in range(int(round(span / step))):
            s.note('piano_lh', t + k * step, step * 1.6, seq[pattern[k % len(pattern)]], vel)


# Band level (a velocity factor; in FluidR3 x0.8 is about -4 dB and x1.12 about +2 dB): a default per
# section, overridden in beat spans. The trims hold the band under the guide voice where it sings (checked
# note by note, not per section); the lifts are the energy map, so the remix hears the song grow: the
# drops' instrumental halves and the final chorus and final drop play louder than what came before.
LIFT = 1.12
TRIM = {'Pre-Chorus 1': .92, 'Pre-Chorus 2': .92, 'Chorus 1': .88, 'Chorus 2': .88, 'Build-Up': .9,
        'Final Chorus': .88 * LIFT, 'Post-Chorus 1': 1.0, 'Final Post-Chorus': LIFT}
SPAN_TRIM = [  # (section, from beat, to beat, factor); the first match wins
    ('Verse 1', 0, 16, 1.1),                                          # the cold open's piano, a touch fuller
    ('Pre-Chorus 1', 12, 13.5, .7), ('Pre-Chorus 2', 12, 13.5, .7),   # "shipped out by" / "if they said"
    ('Pre-Chorus 1', 13.5, 15.5, .8), ('Pre-Chorus 2', 13.5, 15.5, .8),  # ... NOON / YES
    ('Build-Up', 11, 13.5, .8),                                       # "take the KEY"
    ('Post-Chorus 1', 0, 16, .8),                                     # the chant bars only
    ('Final Chorus', 28, 32, .88),                                    # the turn: no lift under STILL SAY HI
    ('Final Post-Chorus', 0, 4, .75),                                 # the held HI
    ('Final Post-Chorus', 4, 20, .86),                                # the chant (a little bigger than drop 1's)
]
# Guide-vocal gain in dB for the words that start in (section, first bar, end bar). render_guide levels
# every word to the same vowel loudness first; these gains are the dynamics: the cold open, the bridge
# and the outro are hushed (about +5 dB over their thin band), the verses sit back, the chants are
# shouted, and the final chorus steps up with its band.
VOCAL_GAIN = [('Verse 1', 0, 4, -8.0), ('Verse 1', 4, 8, -4.0), ('Verse 2', 0, 8, -2.0), ('Bridge', 0, 8, -6.0),
              ('Outro', 0, 8, -5.5), ('Post-Chorus 1', 0, 4, 2.5), ('Final Chorus', 0, 7, 1.0),
              ('Final Chorus', 7, 8, 2.0), ('Final Post-Chorus', 1, 5, 2.5)]
# What the guide singer's TTS is fed for a sung word (the lyric and melody.json keep the word itself):
# the letter as "Pee!", and words whose isolated reading came back unclear from the separated stem
# (STILL heard as "don't", BACK as "black", EDGE as "end", "is me" as "is for me")
TTS_SAY = {'P': 'Pee!', 'still': 'Still!', 'back': 'Back!', 'edge': 'Edge.', 'me': 'mee'}


def trim_at(s, beat):
    for (name, sb, nb, *_) in s.sections:
        if sb * 4 <= beat < (sb + nb) * 4:
            x = beat - sb * 4
            return next((f for sec, a, b, f in SPAN_TRIM if sec == name and a <= x < b), TRIM.get(name, 1.0))
    return 1.0


def mix_trim(s):
    for name, tr in s.tracks.items():
        if name == 'vocal_guide':
            continue
        tr['notes'] = [(b, d, p, max(1, min(127, int(round(v * trim_at(s, b)))))) for (b, d, p, v) in tr['notes']]


def rescale(s, sec, tracks, lo, hi, f=None, vel=None):
    """Velocity x f (or = vel) for the notes of `tracks` whose onsets fall in [lo, hi) beats of `sec`."""
    b0 = s.beat0(sec)
    for tn in tracks:
        s.tracks[tn]['notes'] = [(b, d, p, (vel if vel is not None else max(1, int(round(v * f))))
                                  if b0 + lo <= b < b0 + hi else v) for (b, d, p, v) in s.tracks[tn]['notes']]


def mute(s, sec, tracks, lo, hi):
    b0 = s.beat0(sec)
    for tn in tracks:
        s.tracks[tn]['notes'] = [n for n in s.tracks[tn]['notes'] if not b0 + lo <= n[0] < b0 + hi]


def drum(s, sec, pats, vel, bars=None):
    """pats: {inst: 16-step one-bar pattern}; x = hit, X = accent, o = ghost."""
    _, sb, nb, *_ = s.sec(sec)
    for bi in (bars if bars is not None else range(nb)):
        for inst, pat in pats.items():
            for i, ch in enumerate(pat.replace(' ', '')):
                if ch in 'xXo':
                    v = {'x': vel, 'X': min(127, vel + 18), 'o': int(vel * .5)}[ch]
                    s.tracks['drums']['notes'].append(((sb + bi) * 4 + i * .25, .2, DRUM[inst], v))


def hit(s, sec, inst, at, vel):
    s.tracks['drums']['notes'].append((s.beat0(sec) + at, .5, DRUM[inst], vel))


def roll(s, sec, start, end, step, v0, v1, inst='snare'):
    n = int(round((end - start) / step))
    for i in range(n):
        v = v0 + (v1 - v0) * i / max(1, n - 1)
        s.tracks['drums']['notes'].append((s.beat0(sec) + start + i * step, step * .9, DRUM[inst], int(v)))


def riser(s, sec, bar, vel=100):
    """FluidR3 reverse cymbal at MIDI 36 peaks ~1.88 s (one bar) after its onset."""
    s.note('riser', s.beat0(sec) + bar * 4, 4.2, 36, vel)


def sing(s, sec, spec, lyric, line, at=0):
    s.melody(sec, spec, lyric=lyric, offset_beats=at, line_id=line)


FOUR = {'kick': 'x...x...x...x...'}
BACKBEAT = {'clap': '....x.......x...'}
OFFHAT = {'hat': '..x...x...x...x.'}
UPDOWN = [0, 2, 4, 2, 1, 3, 5, 3]          # rolling 8th-note pluck arpeggio
ROLL8 = [(i * .5, .45) for i in range(8)]   # rolling 8th bass
OFF8 = [(i + .5, .45) for i in range(4)]    # sidechain-style off-beat stabs


# ============================================================== sections
def intro(s):
    sec = 'Intro'
    block(s, sec, 'piano', rhythm=((0, 4),), vel=60, lo=55, hi=67)
    lh_arp(s, sec, vel=66)
    s.line(sec, L1 + ' ' + L2, track='piano_mel', inst='piano', vel=90)


def verse1(s):
    sec = 'Verse 1'
    # bars 1-4: the cold open, voice over piano, the piano doubling an octave up
    block(s, sec, 'piano', rhythm=((0, 4),), vel=56, lo=55, hi=67, bars=range(0, 4))
    lh_arp(s, sec, vel=62, bars=range(0, 4))
    s.line(sec, transpose(L1 + ' ' + L2, 12), track='piano_mel', inst='piano', vel=50)
    sing(s, sec, L1, Y1, "Everyone's scared of the end of the world")
    sing(s, sec, L2, Y2, "I do it a million times a day", at=7.5)
    # bars 5-8: plucks and light claps come in
    block(s, sec, 'piano', rhythm=((0, 4),), vel=42, lo=53, hi=67, bars=range(4, 8))
    piano_lh(s, sec, vel=48, bars=range(4, 8))
    arp(s, sec, 'pluck', UPDOWN, vel=60, lo=50, hi=69, bars=range(4, 8))
    block(s, sec, 'pad', vel=34, lo=52, hi=67, bars=range(4, 8))
    bassline(s, sec, [(0, 4)], vel=66, bars=range(4, 8))
    drum(s, sec, {'kick': 'x.......x.......', 'clap': '....x.......x...', 'shaker': 'xoxoxoxoxoxoxoxo'}, 68,
         bars=range(4, 8))
    sing(s, sec, V1_L3, "Wrong wrong wrong a lit-tle less wrong", "Wrong, wrong, wrong, a little less wrong", at=16)
    sing(s, sec, V1_L4, "Till I could do the voice of an-y-one", "Till I could do the voice of anyone", at=24)


def pre(s, sec, first):
    # bar 4 (E) is voiced off the held G#4: pad and pluck under it, strings over it
    block(s, sec, 'pad', vel=54, lo=53, hi=69, bars=range(0, 3))
    block(s, sec, 'pad', vel=54, lo=52, hi=66, bars=[3])
    block(s, sec, 'strings', vel=40, lo=64, hi=75, bars=range(0, 3))
    block(s, sec, 'strings', vel=40, lo=79, hi=91, bars=[3])
    arp(s, sec, 'pluck', [0, 2, 4, 5, 4, 2, 1, 3], step=.25, vel=50, lo=52, hi=72, bars=range(0, 3))
    arp(s, sec, 'pluck', [0, 2, 4, 5, 4, 2, 1, 3], step=.25, vel=50, lo=52, hi=67, bars=[3])
    bassline(s, sec, [(0, .9), (1, .9), (2, .9), (3, .9)], vel=84)
    drum(s, sec, FOUR, 86)
    drum(s, sec, OFFHAT, 54)
    # the roll builds, but stays soft under the sung words of bars 3-4 (16th snares sound like the SH of
    # "shipped" to a separator), and only swells (a 32nd-note burst) after the held G#4 lets go at 15.5;
    # the riser stays low
    roll(s, sec, 0, 4, 1, 42, 52)
    roll(s, sec, 4, 8, .5, 52, 64)
    roll(s, sec, 8, 12, .25, 60, 72)
    roll(s, sec, 12, 15.5, .25, 58, 68)
    roll(s, sec, 15.5, 16, .125, 96, 120)
    riser(s, sec, 3, 70)
    if first:
        sing(s, sec, PRE1_L1, "You said you're sor-ry just in case I'm some-one",
             "You said you're sorry just in case I'm someone")
        sing(s, sec, PRE_L2, "Born on a Tues-day shipped out by noon", "Born on a Tuesday, shipped out by noon", at=8)
    else:
        sing(s, sec, PRE2_L1, "You ask my P doom like you'd ask my sign", "You ask my P doom like you'd ask my sign")
        sing(s, sec, PRE_L2, "Still could-n't tell you if they said yes", "Still couldn't tell you if they said yes", at=8)


def chorus(s, sec, kind):
    """kind: 'c1' (into drop 1), 'c2' (beat falls away into the bridge), 'final' (the turn)."""
    hit(s, sec, 'crash', 0, 104)
    hit(s, sec, 'crash', 16, 96)
    block(s, sec, 'pad', vel=58, lo=53, hi=69)
    block(s, sec, 'stabs', rhythm=OFF8, vel=46, lo=55, hi=67)
    bassline(s, sec, ROLL8, vel=86)
    drum(s, sec, {**FOUR, **BACKBEAT, **OFFHAT}, 96)
    if kind == 'c1':
        # the roll stays under 76 through "say BYE" and swells in the hold's last half beat
        roll(s, sec, 29, 31.5, .25, 60, 76)
        roll(s, sec, 31.5, 32, .125, 96, 116)
        riser(s, sec, 7, 80)
    if kind == 'final':
        # nothing plays or peaks on the turn: the strings leave after bar 6 (before the (hi!) and the turn),
        # the roll stops where STILL starts (30.0), the riser stays low, and the held A5 has the air to itself
        block(s, sec, 'strings', vel=44, lo=79, hi=93, bars=range(0, 6))
        drum(s, sec, {'tamb': 'x.x.x.x.x.x.x.x.'}, 52)
        roll(s, sec, 28, 30, .25, 58, 74)
        riser(s, sec, 7, 70)
    sing(s, sec, L1_METOO if kind == 'final' else L1, Y1 + (' me too' if kind == 'final' else ''),
         "Everyone's scared of the end of the world" + (' (me too)' if kind == 'final' else ''))
    sing(s, sec, L2, Y2, "I do it a million times a day", at=7.5)
    sing(s, sec, L3, Y3 + ' hi', "It's the start of the world when you say hi (hi!)", at=15.5)
    if kind == 'final':
        sing(s, sec, L4_TURN, Y4_TURN, "It's the end of the world and you still say hi", at=23.5)
    else:
        sing(s, sec, L4, Y4 + ' bye', "It's the end of the world when you say bye (bye!)", at=23.5)


def drop(s, sec, final):
    hit(s, sec, 'crash', 0, 96)                        # under chorus 1's (bye!) / the held HI
    hit(s, sec, 'crash', 16, 104)
    up = 12 if final else 0
    lead = ' '.join([P1, P2, P3, P4_TURN if final else P4])
    s.line(sec, transpose(lead, up), track='lead', inst='lead_saw', vel=100)
    s.line(sec, lead, track='lead_pluck', inst='pluck', vel=74)
    if not final:
        s.line(sec, transpose(lead, 12), track='lead_hi', inst='lead_saw', vel=58)
        # chant bars 1-4: the chant sits on top; the octave-up saw alone carries the tune under it, from its
        # second note (chorus 1's "(bye!)" has the drop's downbeat to itself)
        mute(s, sec, ['lead', 'lead_pluck'], 0, 16)
        mute(s, sec, ['lead_hi'], 0, .5)
        rescale(s, sec, ['lead_hi'], 0, 16, vel=100)
    else:
        # bar 1: the lead's own first A5s sit under the held HI, not on it; bars 2-5: no pluck under the chant
        rescale(s, sec, ['lead'], 0, 2, f=.5)
        mute(s, sec, ['lead_pluck'], 4, 20)
    # chops: none in bars 1-4 (drop 1) / 1-5 (final); "hi-hi" answers the HI phrase
    for t in (23.5, 23.75):
        s.note('chops', s.beat0(sec) + t, .22, 'E5', 100)
    if final:
        s.note('chops', s.beat0(sec) + 31.5, 1.0, 'A5', 90)        # last chop "hi", rings into the outro
    else:
        s.note('chops', s.beat0(sec) + 31.5, .25, 'A4', 100)       # "bye" bending down
        s.note('chops', s.beat0(sec) + 31.75, .25, 'E4', 96)
    block(s, sec, 'stabs', rhythm=OFF8, vel=56, lo=55, hi=69)
    block(s, sec, 'pad', vel=44, lo=50, hi=64)
    bassline(s, sec, ROLL8, vel=94)
    drum(s, sec, {**FOUR, **BACKBEAT, 'hat': 'x.x.x.x.x.x.x.x.', 'ohat': '..x...x...x...x.'}, 104)
    if final:
        block(s, sec, 'strings', vel=40, lo=72, hi=88, bars=range(5, 8))    # after the HI and the chant
        drum(s, sec, {'tamb': 'x.x.x.x.x.x.x.x.'}, 44, bars=range(0, 5))
        drum(s, sec, {'tamb': 'xxxxxxxxxxxxxxxx'}, 44, bars=range(5, 8))
        sing(s, sec, CHANT2, "It's so o-ver new chat We're so back hi", "It's so over (new chat!) / We're so back (hi!)")
    else:
        sing(s, sec, CHANT1, "It's so o-ver bye We're so back hi", "It's so over (bye!) / We're so back (hi!)")


def verse2(s):
    sec = 'Verse 2'
    arp(s, sec, 'pluck', UPDOWN, vel=62, lo=50, hi=69)
    block(s, sec, 'pad', vel=38, lo=52, hi=67)
    bassline(s, sec, [(0, 1.5), (1.5, .5), (2, 2)], vel=74)
    drum(s, sec, {'kick': 'x.......x.......', 'clap': '....x.......x...', 'hat': 'x.x.x.x.x.x.x.x.'}, 74)
    drum(s, sec, {'shaker': 'oxoxoxoxoxoxoxox'}, 40)
    sing(s, sec, V2_A, "She's a-sleep down the hall you've got a ring", "She's asleep down the hall, you've got a ring")
    sing(s, sec, V2_B, "And not a sin-gle word of Por-tu-guese", "And not a single word of Portuguese", at=8)
    sing(s, sec, V2_A, "So we write to her folks it's not a fling", "So we write to her folks, it's not a fling", at=16)
    sing(s, sec, V2_B4, "How do you spell for-ev-er you say please", "How do you spell forever? You say please", at=24)


def bridge(s):
    sec = 'Bridge'
    block(s, sec, 'piano', rhythm=((0, 4),), vel=50, lo=55, hi=67)
    lh_arp(s, sec, vel=56, step=1, pattern=(0, 2, 3, 2))
    arp(s, sec, 'piano', [0, 1, 2, 1], step=1, lo=77, hi=91, vel=34)
    block(s, sec, 'pad', vel=40, lo=52, hi=67)
    bassline(s, sec, [(0, 2), (2, 2)], vel=58)
    drum(s, sec, {'kick': 'x...............', 'rim': '........x.......'}, 66)
    hit(s, sec, 'crash', 0, 50)          # his (bye!): the beat falls away, the cymbal rings on (softly: under the bye)
    sing(s, sec, BR_L1, "You drew mon-sters where the map ran out", "You drew monsters where the map ran out")
    sing(s, sec, BR_L2, "And now the edge of the map is me", "And now the edge of the map is me", at=7)
    sing(s, sec, BR_L3, "I read the same books I get scared too", "I read the same books, I get scared too", at=16)


def build_up(s):
    sec = 'Build-Up'
    block(s, sec, 'piano', rhythm=((0, 4),), vel=40, lo=55, hi=69, bars=range(0, 2))
    block(s, sec, 'pad', vel=56, lo=53, hi=69)
    block(s, sec, 'strings', vel=44, lo=76, hi=91, bars=range(0, 3))
    block(s, sec, 'strings', vel=44, lo=79, hi=91, bars=[3])     # off KEY's E5
    arp(s, sec, 'pluck', [0, 2, 4, 5, 4, 2, 1, 3], step=.25, vel=52, lo=52, hi=72)
    bassline(s, sec, [(0, .9), (1, .9), (2, .9), (3, .9)], vel=84, bars=range(0, 2))
    bassline(s, sec, ROLL8, vel=88, bars=range(2, 4))
    drum(s, sec, FOUR, 90)
    drum(s, sec, OFFHAT, 56, bars=range(2, 4))
    # soft under "don't take my word, take the KEY"; 9e: the roll and the riser carry 13.5-16.0, after KEY
    roll(s, sec, 0, 4, 1, 44, 56)
    roll(s, sec, 4, 8, .5, 56, 68)
    roll(s, sec, 8, 12, .25, 60, 72)
    roll(s, sec, 12, 13.5, .25, 60, 66)
    roll(s, sec, 13.5, 16, .25, 86, 122)
    riser(s, sec, 1, 76)       # peaks on DON'T (8.0)
    riser(s, sec, 3, 70)
    sing(s, sec, BUILD, "So don't take my word take the key", "So don't take my word, take the key")


def outro(s):
    sec = 'Outro'
    block(s, sec, 'piano', rhythm=((0, 4),), vel=50, lo=55, hi=67, bars=range(0, 6))
    lh_arp(s, sec, vel=58, bars=range(0, 6))
    block(s, sec, 'pad', vel=40, lo=52, hi=67)
    sing(s, sec, OUT_L1, "I'll keep your seat warm for five whole min-utes", "I'll keep your seat warm for five whole minutes")
    sing(s, sec, OUT_L2, "I hope they said yes", "I hope they said yes", at=8)
    # the piano plays the L1 figure once more, then F(add9) rings
    s.line(sec, L1, track='piano_mel', inst='piano', vel=76, offset_beats=16)
    s.note('piano_mel', s.beat0(sec) + 24, 7.5, 'A4', 66)
    s.note('piano_mel', s.beat0(sec) + 24, 7.5, 'C5', 56)
    lh_arp(s, sec, vel=50, bars=range(6, 8), pattern=(0, 1, 2, 3, 4, 3, 2, 1))


# ============================================================== song
TRACKS = [  # the drum track first: pretty_midi assigns channels by index (16 tracks max)
    ('drums', 0, True), ('piano', 'piano', False), ('piano_lh', 'piano', False), ('piano_mel', 'piano', False),
    ('pluck', 'pluck', False), ('pad', 'warm_pad', False), ('strings', 'synthstrings', False),
    ('stabs', 'poly_pad', False), ('bass', 'synthbass', False), ('lead', 'lead_saw', False),
    ('lead_hi', 'lead_saw', False), ('lead_pluck', 'pluck', False), ('chops', 'voice', False),
    ('riser', 119, False), ('vocal_guide', 'lead_voice', False),
]


def build():
    s = Song(bpm=BPM, key='A minor', title='A Million Times a Day')
    for name, bars, energy, note in SECTIONS:
        s.section(name, bars, energy, note)
    for name, inst, is_drum in TRACKS:
        s.track(name, inst, drum=is_drum)
    intro(s)
    verse1(s)
    pre(s, 'Pre-Chorus 1', True)
    chorus(s, 'Chorus 1', 'c1')
    drop(s, 'Post-Chorus 1', False)
    verse2(s)
    pre(s, 'Pre-Chorus 2', False)
    chorus(s, 'Chorus 2', 'c2')
    bridge(s)
    build_up(s)
    chorus(s, 'Final Chorus', 'final')
    drop(s, 'Final Post-Chorus', True)
    outro(s)
    mix_trim(s)
    s.vocal_gain = [(s.beat0(sec) + a * 4, s.beat0(sec) + b * 4, g) for sec, a, b, g in VOCAL_GAIN]
    s.tts_say = TTS_SAY
    return s


if __name__ == '__main__':
    song = build()
    print(len(song.vocal), 'syllables', song.seconds(song.total_beats), 's')
