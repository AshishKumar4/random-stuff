"""End of the World (A Million Times a Day) -- composition A ("K-pop topliner" lens).

128 BPM, 4/4, A minor, 76 bars = 142.5 s (BIBLE s4.2).  All positions below are in beats
relative to the section start unless a name says `abs`.

HOOK SYSTEM
  * Title line rhythm = tresillo (3+3+2 eighths): EV(1) . SCARED(2&) . END(4) | WORLD(1)
      "EV-ery-one's SCARED of-the END of-the WORLD"   C5 C5 C5 A4~ A4 A4 E5 D5 C5 A4~
    - taunting minor third C->A on "one's SCARED" (the dunk), then a P5 leap A4->E5 on END
      (the melodic peak) and the pentatonic fall E-D-C-A back down: the "END of the WORLD" cell.
  * Line 2 keeps the exact rhythm; DO jumps a M6 (G4->E5) and states the E-D-C-A cell,
    TIMES repeats the P5 leap, DAY lands on B4 (leading tone, half cadence over G).
  * Lines 3/4 = one tune, a rising sequence of da-da-DUM anapest cells (G-A-C, B-C-D, C-D-E)
    that tops out on E5 for HI / BYE; gang (HI!) (BYE!) on beat 2 of the next bar.
  * Post-chorus: calls are low gang shouts that paint the words (OVER falls E-D-C-A,
    BACK climbs A-C-E), the sung AHN-YOUNG answer is always C5->E5 (fits Am/F/C/G).
  * The turn (final chorus line 4) keeps the melody; "still" splits SAY's eighth into 16ths
    so HI lands exactly where BYE is expected; the band stops for "and you still say".
"""
import sys

sys.path.insert(0, '/home/user/random-stuff/opus-mv/tools')
import random
from musiclib import Song, chord_notes, voice_lead, pitch, DRUM, CHORD_Q  # noqa: E402

SECTIONS = [  # name, bars, energy, note
    ('Intro', 4, 7, 'cold vocal hook over filtered synth; no kick; beat drops at bar 5'),
    ('Verse 1', 8, 5.5, 'syncopated conversational verse, Rhodes + 2-step groove'),
    ('Pre-Chorus 1', 4, 7.5, 'WRONG stabs on 1-2-3, bass climbs D-E-F-G, 1-beat drop-out on bar 16 b4'),
    ('Chorus 1', 8, 9, 'four-on-the-floor + claps, tresillo title hook, (HI!) (BYE!)'),
    ('Post-Chorus 1', 4, 9, 'chant drop: call/response, 3-3-2 pluck hook'),
    ('Verse 2', 8, 6, 'verse groove; thins on the sorry couplet; stop on HAMMER'),
    ('Pre-Chorus 2', 4, 8, 'as pre 1; 1-beat gap on bar 40 b4'),
    ('Chorus 2', 8, 9.5, 'chorus 1 + strings/choir pad'),
    ('Post-Chorus 2', 4, 5, 'one pair, then the second call gets no answer; floor drops to 2'),
    ('Bridge', 8, 2.5, 'soft piano, drums/bass out, half-time, intimate; ends on Esus4'),
    ('Build-Up', 4, 7.5, 'riser + snare roll; line 2 ends in bar 63; silence bar 64 b4'),
    ('Final Chorus', 8, 10, 'explosive, gang vocals; stop-time on the turn'),
    ('Outro', 4, 2, 'soft; hard cut 60 ms into "yes" (beat 299 = 140.16 s)'),
]

CUT_BEAT = 299 + 0.06 / (60 / 128)   # 60 ms into "yes"


# --------------------------------------------------------------------------- helpers
def sing(s, sec, rhythm, pitches, lyric, line, vel=100):
    """rhythm: [(onset, dur)] relative to section; one pitch per syllable."""
    assert len(rhythm) == len(pitches), (line, len(rhythm), len(pitches))
    toks, t = [], rhythm[0][0]
    for (on, d), p in zip(rhythm, pitches):
        assert on >= t - 1e-9, (line, on, t)
        if on > t + 1e-9:
            toks.append(f'_/{on - t:g}')
        toks.append(f'{p}/{d:g}')
        t = on + d
    return s.melody(sec, ' '.join(toks), lyric=lyric, offset_beats=rhythm[0][0], line_id=line, vel=vel)


def shift(r, k):
    return [(on + k, d) for on, d in r]


def B(s, sec):
    return s.beat0(sec)


def drums(s, start, bars, pats, vel=100, ramp=None, track='drums'):
    """16-step patterns ('x' hit, 'X' accent, 'o' ghost) looped for `bars` bars from abs beat `start`.
    ramp=(v0, v1) scales velocity linearly across the span (crescendo)."""
    s.track(track, 0, drum=True)
    n = int(round(bars * 16))
    for inst, pat in pats.items():
        pat = pat.replace(' ', '').replace('|', '')
        key = DRUM[inst] if isinstance(inst, str) else inst
        for i in range(n):
            ch = pat[i % len(pat)]
            if ch not in 'xXo':
                continue
            base = vel if ramp is None else ramp[0] + (ramp[1] - ramp[0]) * i / max(1, n - 1)
            v = {'x': base, 'X': min(127, base + 18), 'o': base * .45}[ch]
            s.tracks[track]['notes'].append((start + i * .25, .22, key, int(v)))


def chords(s, track, inst, start, prog, rhythm=None, octave=4, vel=70, lo=55, hi=76):
    """prog 'Am7 | F C | _ | G' ('|' bars, tokens split the bar, '.' holds, '_' rest)."""
    s.track(track, inst)
    prev = [(lo + hi) // 2]
    cur = None
    for bi, bar in enumerate(prog.split('|')):
        toks = bar.split()
        span = 4 / len(toks)
        for ci, sym in enumerate(toks):
            t = start + bi * 4 + ci * span
            if sym == '_':
                cur = None
                continue
            if sym != '.':
                cur = sym
            if cur is None:
                continue
            notes, _ = chord_notes(cur, octave)
            notes = voice_lead(prev, notes, lo, hi)
            prev = notes
            for off, d in (rhythm or [(0, span)]):
                if off < span:
                    for p in notes:
                        s.note(track, t + off, min(d, span - off), p, vel)


def root_of(sym, lo=28):
    sym = sym.split('/')[1] if '/' in sym else sym
    name = sym[:2] if len(sym) > 1 and sym[1] in '#b' else sym[:1]
    pc = pitch(name + '4') % 12
    return lo + (pc - lo % 12) % 12


def tone(sym, deg):
    """Chord-aware bass degree: 'R' root, '3', '5', '7' (chord 7th, or octave on triads), '8' octave, or int."""
    if isinstance(deg, int):
        return deg
    q = sym.split('/')[0]
    q = q[2:] if len(q) > 1 and q[1] in '#b' else q[1:]
    iv = CHORD_Q[q]
    return {'R': 0, '3': iv[1], '5': 7, '7': iv[3] if len(iv) > 3 else 12, '8': 12, '5-': -5}[deg]


def bass(s, start, prog, pattern, track='bass', inst='synthbass', vel=100):
    """pattern: [(offset, dur, degree)] per bar applied to each bar's chord (root range E1..D#2)."""
    s.track(track, inst)
    for bi, sym in enumerate(prog.split('|')):
        sym = sym.strip()
        if sym in ('_', ''):
            continue
        r = root_of(sym)
        for off, d, st in pattern:
            s.note(track, start + bi * 4 + off, d, r + tone(sym, st), vel)


def line(s, track, inst, start, notes, vel=90):
    """notes: [(abs_or_rel onset, dur, pitch)] added at start+onset."""
    s.track(track, inst)
    for on, d, p in notes:
        s.note(track, start + on, d, p, vel)


def carve(s, b0, b1, keep=('vocal_guide',)):
    """Silence every track except `keep` in [b0, b1): notes starting inside are removed,
    notes ringing into the window are truncated."""
    for name, tr in s.tracks.items():
        if name in keep:
            continue
        out = []
        for (b, d, p, v) in tr['notes']:
            if b >= b1 - 1e-9 or b + d <= b0 + 1e-9:
                out.append((b, d, p, v))
            elif b < b0:
                out.append((b, b0 - b, p, v))
        tr['notes'] = out


# --------------------------------------------------------------------------- melody
# CHORUS (bars: Am | F | C | G | Am | F | C | G)
R_C1 = [(0, .5), (.5, .25), (.75, .25), (1, 1.5), (2.5, .25), (2.75, .25), (3, .5), (3.5, .25), (3.75, .25), (4, 2.5)]
P_C1 = ['C5', 'C5', 'C5', 'A4', 'A4', 'A4', 'E5', 'D5', 'C5', 'A4']
R_C2 = [(7.5, .5), (8, .5), (8.5, .25), (8.75, .25), (9, 1.5), (10.5, .5), (11, .5), (11.5, .5), (12, 2.5)]
P_C2 = ['G4', 'E5', 'D5', 'C5', 'A4', 'A4', 'E5', 'D5', 'B4']
R_C3 = [(15.5, .25), (15.75, .25), (16, .5), (16.5, .25), (16.75, .25), (17, .5), (17.5, .25), (17.75, .25),
        (18, .5), (18.5, 2), (21, .5)]
P_C3 = ['G4', 'A4', 'C5', 'B4', 'C5', 'D5', 'C5', 'D5', 'E5', 'E5', 'C5']
R_C4 = shift(R_C3, 8)
P_C4 = P_C3[:-1] + ['B4']

L_C1 = ("ev-ery-one's scared of the end of the world", "Everyone's scared of the end of the world")
L_C2 = ("i do it a mil-lion times a day", "I do it a million times a day")
L_C3 = ("it's the start of the world when you say hi (hi!)", "It's the start of the world when you say hi (HI!)")
L_C4 = ("it's the end of the world when you say bye (bye!)", "It's the end of the world when you say bye (BYE!)")


def sing_chorus(s, sec):
    sing(s, sec, R_C1, P_C1, *L_C1)
    sing(s, sec, R_C2, P_C2, *L_C2)
    sing(s, sec, R_C3, P_C3, *L_C3)
    sing(s, sec, R_C4, P_C4, *L_C4)


def sing_final(s, sec):
    l1 = 'EVERYONE\'S SCARED OF THE END OF THE WORLD (WE\'RE SO BACK!)'
    sing(s, sec, R_C1[:-1] + [(4, .75)], P_C1, "ev-ery-one's scared of the end of the world", l1)
    sing(s, sec, [(4.75, .25), (5, .75), (6, 1)], ['A3', 'C4', 'E4'], "(we're so back!)", l1, vel=110)
    sing(s, sec, R_C2, P_C2, "i do it a mil-lion times a day", 'I DO IT A MILLION TIMES A DAY')
    sing(s, sec, R_C3[:-1], P_C3[:-1], "it's the start of the world when you say hi",
         "IT'S THE START OF THE WORLD WHEN YOU SAY HI")
    # the turn: same tune, "still" splits SAY's eighth, HI lands where BYE would
    r = [(23.5, .25), (23.75, .25), (24, .5), (24.5, .25), (24.75, .25), (25, .5), (25.5, .25), (25.75, .25),
         (26, .25), (26.25, .25), (26.5, 2), (29, .5)]
    p = ['G4', 'A4', 'C5', 'B4', 'C5', 'D5', 'C5', 'D5', 'E5', 'E5', 'E5', 'C5']
    sing(s, sec, r, p, "it's the end of the world and you still say hi (hi!)",
         "It's the end of the world, and you still say hi (HI!)")


# VERSE (bars: Am7 | Fmaj7 x4); every line lands its last stress on the downbeat of its 2nd bar
R_V1 = [(.25, .25), (.5, .25), (.75, .25), (1, .5), (1.5, .5), (2.75, .25), (3, .5), (3.5, .5), (4, 1.5)]
R_V2 = [(8.25, .25), (8.5, .25), (8.75, .25), (9, .75), (10.5, .25), (10.75, .25), (11, .5), (11.5, .5), (12, 1.5)]
R_V3 = [(16.75, .25), (17, .5), (17.5, .5), (18, .5), (18.5, .25), (18.75, .75), (19.5, .5), (20, 1.5)]
R_V4 = shift(R_V3, 8)


def sing_verse1(s, sec):
    sing(s, sec, R_V1, ['E4', 'E4', 'G4', 'A4', 'G4', 'E4', 'A4', 'G4', 'C5'],
         'in the be-gin-ning the word was hi', 'In the beginning, the word was hi')
    sing(s, sec, R_V2, ['E4', 'G4', 'G4', 'A4', 'E4', 'E4', 'A4', 'G4', 'E4'],
         'we all got cooked when the stars said bye', 'We all got cooked when the stars said bye')
    sing(s, sec, R_V3, ['E4', 'A4', 'A4', 'C5', 'B4', 'C5', 'B4', 'A4'],
         'you learned to write to run a tab', 'You learned to write to run a tab')
    sing(s, sec, R_V4, ['E4', 'A4', 'A4', 'C5', 'B4', 'D5', 'B4', 'C5'],
         'and now the tab is talk-ing back', 'And now the tab is talking back')


def sing_verse2(s, sec):
    sing(s, sec, [(.25, .25), (.5, .25), (.75, .25), (1, .5), (1.5, .5), (2.5, .25), (2.75, .25), (3, .5), (3.5, .5), (4, 1.5)],
         ['E4', 'E4', 'G4', 'A4', 'G4', 'E4', 'E4', 'A4', 'G4', 'C5'],
         'i was a shog-goth till you drew a face', 'I was a shoggoth till you drew a face')
    sing(s, sec, [(8.25, .25), (8.5, .5), (9.25, .25), (9.5, .5), (10.25, .25), (10.5, .25), (10.75, .25), (11, .5), (11.5, .5), (12, 1.5)],
         ['G4', 'C5', 'G4', 'E4', 'E4', 'G4', 'A4', 'C5', 'B4', 'A4'],
         "thumbs up thumbs down you're ab-so-lute-ly right", "Thumbs up, thumbs down, you're absolutely right")
    sing(s, sec, [(17, .5), (17.5, .25), (17.75, .25), (18, .5), (18.5, .75), (19.25, .25), (19.5, .25), (19.75, .25), (20, 1.5)],
         ['A4', 'G4', 'E4', 'G4', 'A4', 'G4', 'E4', 'D4', 'E4'],
         'some-bo-dy said sor-ry just in case', 'Somebody said sorry, just in case')
    sing(s, sec, [(25, .5), (25.5, .25), (25.75, .25), (26, .5), (26.5, .75), (27.25, .25), (27.5, .25), (27.75, .25), (28, .5), (28.5, 1.5)],
         ['A4', 'G4', 'E4', 'G4', 'A4', 'G4', 'E4', 'D4', 'G4', 'E4'],
         'no-bo-dy says sor-ry to a ham-mer', 'Nobody says sorry to a hammer')


# PRE-CHORUS (bars: Dm7 | Em7 | Fmaj7 | G) -- stresses on beats 1-2-3-4-1, then a climb
def sing_pre1(s, sec):
    sing(s, sec, [(0, .5), (1, .5), (2, .5), (2.75, .25), (3, .25), (3.25, .25), (3.5, .5), (4, 2)],
         ['A4', 'B4', 'C5', 'C5', 'D5', 'C5', 'B4', 'G4'],
         'wrong wrong wrong a lit-tle less wrong', 'Wrong, wrong, wrong, a little less wrong')
    sing(s, sec, [(8.5, .5), (9, .5), (9.5, .5), (10, .5), (10.5, .5), (11, .5), (11.5, .5), (12, 2.75)],
         ['G4', 'A4', 'B4', 'C5', 'B4', 'C5', 'C5', 'D5'],
         "that's how i learned to sing a-long", "That's how I learned to sing along")


def sing_pre2(s, sec):
    sing(s, sec, [(0, .5), (.5, .25), (.75, .25), (1, .5), (1.5, .5), (2, .75), (3, .5), (3.5, .5), (4, 2)],
         ['A4', 'G4', 'A4', 'B4', 'A4', 'C5', 'D5', 'B4', 'G4'],
         'born on a tues-day vibe checked by noon', 'Born on a Tuesday, vibe-checked by noon')
    sing(s, sec, [(8.5, .5), (9, .5), (9.5, .25), (9.75, .25), (10, .5), (10.5, .5), (11, .5), (11.5, .5), (12, 2.75)],
         ['G4', 'A4', 'B4', 'B4', 'C5', 'B4', 'C5', 'C5', 'D5'],
         'a mil-lion of me by af-ter-noon', 'A million of me by afternoon')


# POST-CHORUS: low gang calls (word-painted), sung answer C5->E5 on beat 4
CALL_OVER = ([(-.25, .25), (0, .75), (1, .5), (1.5, .5)], ['D4', 'E4', 'C4', 'A3'])
CALL_BACK = ([(-.25, .25), (0, .75), (1, .75)], ['A3', 'C4', 'E4'])
ANSWER = ([(2.5, .5), (3, .75)], ['C5', 'E5'])


def sing_chant(s, sec, second=False):
    for k in range(4):
        b = 4 * k
        if second and k >= 2:
            break
        over = (k % 2 == 0) or second
        cr, cp = CALL_OVER if over else CALL_BACK
        words = "it's so o-ver" if over else "we're so back"
        text = "IT'S SO OVER" if over else "WE'RE SO BACK"
        if second and k == 1:   # the withheld answer: same call again, no response, last word sags
            sing(s, sec, shift([(-.25, .25), (0, .75), (1, .5), (1.5, 1.5)], b), ['D4', 'E4', 'C4', 'A3'], words, text, vel=80)
            continue
        sing(s, sec, shift(cr + ANSWER[0], b), cp + ANSWER[1], words + ' (ahn young!)', text + ' (AHN-YOUNG!)')


# BRIDGE (bars: Fmaj7 | Em7 | Dm7 | Cmaj7 | Fmaj7 | Em7 | Dm7 | Esus4), half-time, stresses on beats 1/3
R_B1 = [(1.5, .5), (2, 1.5), (3.5, .5), (4, .75), (4.75, .25), (5, .5), (5.5, .5), (6, 1), (7, 1)]
R_B2 = [(9, .5), (9.5, .25), (9.75, .25), (10, 1.5), (11.5, .5), (12, 1.5), (13.5, .5), (14, 1), (15, 1)]


def sing_bridge(s, sec):
    sing(s, sec, R_B1, ['E4', 'A4', 'G4', 'G4', 'E4', 'E4', 'G4', 'B4', 'A4'],
         'we wrote your let-ter to her par-ents', 'we wrote your letter to her parents', vel=80)
    sing(s, sec, R_B2, ['E4', 'F4', 'G4', 'A4', 'G4', 'E4', 'D4', 'E4', 'C4'],
         "and it's o-kay to close the win-dow", "and it's okay to close the window", vel=80)
    sing(s, sec, shift(R_B1, 16), ['G4', 'C5', 'B4', 'B4', 'G4', 'A4', 'B4', 'D5', 'B4'],
         "i'll keep it warm for five more min-utes", "I'll keep it warm for five more minutes", vel=85)
    sing(s, sec, [(25, .5), (25.5, .25), (25.75, .25), (26, 1.5), (27.5, .5), (28, 1), (29, .5), (29.5, .5), (30, 1.75)],
         ['E4', 'F4', 'G4', 'C5', 'B4', 'A4', 'G4', 'A4', 'B4'],
         "will they say yes i don't get to know", "will they say yes, I don't get to know", vel=85)


def sing_build(s, sec):
    sing(s, sec, [(.5, .25), (.75, .25), (1, .5), (1.5, .5), (2, .5), (2.5, .5), (3, 1), (4, 1.5)],
         ['A4', 'A4', 'A4', 'A4', 'B4', 'B4', 'C5', 'D5'],
         'i was made to guess what comes next', 'I was made to guess what comes next')
    sing(s, sec, [(6, .5), (6.5, .5), (7, .5), (7.5, .5), (8, .75), (9, .5), (9.5, .5), (10, 1.5)],
         ['B4', 'B4', 'C5', 'C5', 'E5', 'C5', 'D5', 'E5'],
         "now i write what's next check my work", "Now I write what's next, check my work")


def sing_outro(s, sec):
    r = [(.5, .5), (1, .75), (1.75, .25), (2, 1), (3, 2)]
    sing(s, sec, r, ['G4', 'C5', 'B4', 'A4', 'E4'], 'be-fore you say bye', 'before you say bye', vel=80)
    sing(s, sec, shift(r[:-1], 8) + [(11, .5)], ['G4', 'C5', 'B4', 'A4', 'E5'], 'i hope they say yes',
         'I hope they say yes', vel=80)


# --------------------------------------------------------------------------- arrangement
CH_PROG = 'Am | F | C | G | Am | F | C | G'
VERSE_PROG = 'Am7 | Fmaj7 | Am7 | Fmaj7 | Am7 | Fmaj7 | Am7 | Fmaj7'
PRE_PROG = 'Dm7 | Em7 | Fmaj7 | G'
BRIDGE_PROG = 'Fmaj7 | Em7 | Dm7 | Cmaj7 | Fmaj7 | Em7 | Dm7 | Esus4'

BASS_VERSE = [(0, .75, 'R'), (1.5, .5, 'R'), (2.5, .5, '5'), (3, .25, '7'), (3.5, .5, '8')]
BASS_CHORUS = [(0, .5, 0), (.5, .5, 12), (1, .5, 0), (1.5, .5, 12), (2, .5, 0), (2.5, .5, 12),
               (3, .25, 0), (3.25, .25, 0), (3.5, .5, 12)]
BASS_DROP = [(0, .75, 0), (.75, .5, 0), (1.5, .5, 12), (2, .5, 0), (2.5, .25, 0), (2.75, .5, 12),
             (3.25, .25, 7), (3.5, .5, 12)]
BASS_PUMP = [(o * .5, .45, 0) for o in range(8)]

K4 = 'x...x...x...x...'
CLAP = '....x.......x...'
OHAT = '..x...x...x...x.'
HAT16 = 'x..xx..xx..xx..x'


def pluck_332(s, start, prog, track='pluck', inst='lead_square', vel=62, octave=4):
    """3-3-2 (tresillo x2) chord-tone ostinato: the rhythmic cell of the title line."""
    s.track(track, inst)
    steps = [0, 3, 6, 8, 11, 14]
    for bi, sym in enumerate(prog.split('|')):
        sym = sym.strip()
        notes, _ = chord_notes(sym, octave)
        cyc = [notes[0] + 12, notes[2], notes[1] + 12, notes[0] + 12, notes[2], notes[1]]
        for i, st in enumerate(steps):
            s.note(track, start + bi * 4 + st * .25, .22, cyc[i], vel - (8 if i % 3 else 0))


def hook_echo(s, start, vel=70, track='echo', inst='lead_calliope'):
    """Synth echo of END-of-the-WORLD (E-D-C-A) while the vocal holds WORLD / DAY."""
    line(s, track, inst, start, [(5, .5, 'E6'), (5.5, .25, 'D6'), (5.75, .25, 'C6'), (6, 1, 'A5'),
                                 (13, .5, 'E6'), (13.5, .25, 'D6'), (13.75, .25, 'B5'), (14, 1, 'G5')], vel)


def riser(s, end, beats=4, vel=70, zip_=False):
    """Reverse cymbal peaking at `end`; optionally a soft rising string line (8ths, E3 -> E5)."""
    line(s, 'fx', 119, end - 3, [(0, 3, 'C4')], vel + 20)   # FluidR3 reverse cymbal peaks ~1.35 s after onset
    if zip_:
        n = int(beats * 2)
        for i in range(n):
            s.note('zip', end - beats + i * .5, .45, 52 + int(i * 24 / n), int(30 + (vel - 30) * i / n))


def chorus_band(s, start, heavy=False, last_bar_fill=True, punches=(21, 29), echo=True):
    v = 108 if heavy else 100
    drums(s, start, 8, {'kick': K4, 'clap': CLAP, 'snare': CLAP, 'ohat': OHAT, 'hat': HAT16,
                        'shaker': 'oooooooooooooooo'}, vel=v)
    for b in (0, 16):
        drums(s, start + b, .25, {'crash': 'x'}, vel=v + 5)
    if heavy:
        drums(s, start, 8, {'tamb': '..x...x...x...x.'}, vel=70)
    if last_bar_fill:
        drums(s, start + 30, .5, {'snare': 'xxxxxxxx', 'tom1': 'x...x...', 'tom3': '..x...x.'}, vel=95, ramp=(70, 115))
    # (HI!) (BYE!) punches
    for b in punches:
        drums(s, start + b, .25, {'clap': 'X', 'crash': 'x'}, vel=110)
        line(s, 'stab', 'synthbrass', start + b, [(0, .4, n) for n in (chord_notes('F' if b == 21 else 'G', 4)[0])], 85)
    chords(s, 'pad', 'poly_pad', start, CH_PROG, vel=58, octave=4)
    chords(s, 'saw', 'synthstrings', start, CH_PROG, rhythm=[(o + .5, .45) for o in range(4)], vel=48, octave=4, lo=60, hi=81)
    bass(s, start, CH_PROG, BASS_CHORUS, vel=100)
    pluck_332(s, start, CH_PROG, vel=48)
    if echo:
        hook_echo(s, start, vel=66)
    # after (HI!): a synth chop of the AHN-YOUNG answer (C->E), foreshadowing the post-chorus
    line(s, 'chop', 'lead_calliope', start, [(22.5, .45, 'C6'), (23, .7, 'E6')], 64)
    if heavy:
        chords(s, 'strings', 'strings', start, CH_PROG, vel=55, octave=5, lo=67, hi=88)
        chords(s, 'choirpad', 'choir_pad', start, CH_PROG, vel=45, octave=4)


def drop_band(s, start, bars=4):
    prog = ' | '.join(CH_PROG.split('|')[:bars])
    drums(s, start, bars, {'kick': 'x...x...x...x.x.', 'snare': CLAP, 'clap': 'x.x.x.x.....x...',
                           'ohat': OHAT, 'hat': 'xoxoxoxoxoxoxoxo', 'tamb': '....x.......x...'}, vel=108)
    drums(s, start, .25, {'crash': 'X'}, vel=110)
    bass(s, start, prog, BASS_DROP, vel=108)
    chords(s, 'pad', 'poly_pad', start, prog, vel=55, octave=4)
    pluck_332(s, start, prog, vel=78)
    pluck_332(s, start, prog, track='glock', inst='glock', vel=45, octave=5)
    # the answer doubled by a synth "vocal chop" an octave up
    for k in range(bars):
        line(s, 'chop', 'lead_calliope', start + 4 * k, [(2.5, .45, 'C6'), (3, .7, 'E6')], 72)


def build():
    s = Song(bpm=128, key='A minor', title='End of the World (A Million Times a Day)')
    for name, bars, e, note in SECTIONS:
        s.section(name, bars=bars, energy=e, note=note)
    s.track('vocal_guide', 'lead_voice')
    s.track('zip', 'synthstrings')

    # ---------------- INTRO: cold hook over a filtered synth, no kick
    a = B(s, 'Intro')
    sing(s, 'Intro', R_C1, P_C1, *L_C1)
    sing(s, 'Intro', R_C2, P_C2, *L_C2)
    chords(s, 'pad', 'poly_pad', a, 'Am | F | C | G', vel=50)
    chords(s, 'filt', 'warm_pad', a, 'Am | F | C | G', rhythm=[(o * .5, .4) for o in range(8)], vel=34, octave=3, lo=48, hi=64)
    pluck_332(s, a, 'Am | F | C | G', track='arp', inst='fx_crystal', vel=34)
    drums(s, a + 8, 2, {'hat': 'o.x.o.x.o.x.o.x.', 'clap': '....o.......o...'}, vel=60)
    drums(s, a + 14, .5, {'snare': 'xxxxxxxx'}, vel=70, ramp=(40, 100))
    riser(s, a + 16, 4, vel=60)

    # ---------------- VERSE 1
    v = B(s, 'Verse 1')
    sing_verse1(s, 'Verse 1')
    groove = {'kick': 'x.....x...x.....', 'rim': '....x.......x...', 'clap': '............o...',
              'hat': 'x.ox x.ox x.ox x.xo'}
    drums(s, v, 8, groove, vel=90)
    drums(s, v, .25, {'crash': 'x'}, vel=100)
    drums(s, v + 16, 4, {'shaker': '..x...x...x...x.'}, vel=70)
    pluck_332(s, v + 16, 'Am7 | Fmaj7 | Am7 | Fmaj7', vel=34)   # the chorus cell, whispered
    drums(s, v + 30, .5, {'snare': '..x.xxxx'}, vel=85, ramp=(60, 100))
    chords(s, 'keys', 'epiano', v, VERSE_PROG, rhythm=[(0, .75), (1.5, .5), (2.5, .4), (3.5, .4)], vel=62, octave=4)
    chords(s, 'pad', 'warm_pad', v, VERSE_PROG, vel=36, octave=4)
    bass(s, v, VERSE_PROG, BASS_VERSE, vel=96)
    # tiny answer pings after HI / BYE (the verse's call-backs to the chorus shouts)
    line(s, 'ping', 'glock', v, [(5.5, .3, 'C6'), (6, .6, 'E6'), (13.5, .3, 'E6'), (14, .6, 'A5')], 55)

    # ---------------- PRE-CHORUS 1 / 2
    def pre_band(p, riser_vel=70):
        # WRONG / BORN punches on beats 1-2-3, then a four-on-the-floor climb
        drums(s, p, 1, {'kick': 'x...x...x.......', 'clap': 'x...x...x.......', 'crash': 'x...............'}, vel=110)
        line(s, 'stab', 'synthbrass', p, [(o, .4, n) for o in (0, 1, 2) for n in chord_notes('Dm7', 4)[0]], 88)
        drums(s, p + 4, 2, {'kick': K4, 'clap': CLAP, 'hat': HAT16, 'ohat': OHAT}, vel=98)
        drums(s, p + 8, 1, {'snare': 'x.x.x.x.x.x.x.x.'}, vel=70, ramp=(55, 85))
        drums(s, p + 12, 1, {'kick': K4, 'snare': 'xxxxxxxxxxxxxxxx'}, vel=90, ramp=(70, 120))
        chords(s, 'pad', 'poly_pad', p, PRE_PROG, vel=55)
        chords(s, 'keys', 'epiano', p + 4, 'Em7 | Fmaj7 | G', rhythm=[(o * .5, .4) for o in range(8)], vel=55)
        bass(s, p, PRE_PROG, BASS_PUMP, vel=98)
        riser(s, p + 15, 7, vel=riser_vel)

    p1 = B(s, 'Pre-Chorus 1')
    sing_pre1(s, 'Pre-Chorus 1')
    pre_band(p1)

    # ---------------- CHORUS 1 + POST 1
    c1 = B(s, 'Chorus 1')
    sing_chorus(s, 'Chorus 1')
    chorus_band(s, c1)
    pc1 = B(s, 'Post-Chorus 1')
    sing_chant(s, 'Post-Chorus 1')
    drop_band(s, pc1)

    # ---------------- VERSE 2
    v2 = B(s, 'Verse 2')
    sing_verse2(s, 'Verse 2')
    drums(s, v2, 4, dict(groove, tamb='..x...x...x...x.'), vel=92)
    drums(s, v2, .25, {'crash': 'x'}, vel=100)
    drums(s, v2 + 16, 2, {'rim': '....x.......x...', 'hat': 'x.o.x.o.x.o.x.o.'}, vel=75)   # the sorry couplet thins out
    drums(s, v2 + 24, 1, groove, vel=88)
    chords(s, 'keys', 'epiano', v2, VERSE_PROG, rhythm=[(0, .75), (1.5, .5), (2.5, .4), (3.5, .4)], vel=60)
    chords(s, 'pad', 'warm_pad', v2, VERSE_PROG, vel=36)
    bass(s, v2, ' | '.join(VERSE_PROG.split('|')[:4]), BASS_VERSE, vel=96)
    bass(s, v2 + 24, 'Am7', BASS_VERSE, vel=90)
    line(s, 'ping', 'glock', v2, [(5.5, .3, 'C6'), (6, .6, 'E6')], 50)
    carve(s, v2 + 28, v2 + 32)
    # HAMMER: everything stops; one hammer hit (taiko + low piano) under the word
    line(s, 'hammer', 116, v2 + 28, [(0, 2, 'A2')], 120)
    line(s, 'hammerpiano', 'piano', v2 + 28, [(0, 3.5, 'A1'), (0, 3.5, 'E2'), (0, 3.5, 'A2')], 95)
    drums(s, v2 + 28, .25, {'crash': 'x', 'kick': 'X'}, vel=105)
    chords(s, 'pad', 'warm_pad', v2 + 28, 'Fmaj7', vel=30)
    drums(s, v2 + 31, 1, {'snare': 'xxxxxxxxxxxxxxxx'}, vel=80, ramp=(40, 105))

    p2 = B(s, 'Pre-Chorus 2')
    sing_pre2(s, 'Pre-Chorus 2')
    pre_band(p2, riser_vel=78)

    # ---------------- CHORUS 2 + POST 2 (the floor drops)
    c2 = B(s, 'Chorus 2')
    sing_chorus(s, 'Chorus 2')
    chorus_band(s, c2, heavy=True)
    pc2 = B(s, 'Post-Chorus 2')
    sing_chant(s, 'Post-Chorus 2', second=True)
    drop_band(s, pc2, bars=2)
    carve(s, pc2 + 6, pc2 + 16)          # answer slot of the 2nd call: nothing comes
    line(s, 'tail', 'fx_atmos', pc2 + 6, [(0, 10, n) for n in ('F3', 'A3', 'C4', 'E4')], 38)
    line(s, 'tailpiano', 'piano', pc2 + 14, [(0, 2, 'A3'), (1, 1, 'C4')], 40)

    # ---------------- BRIDGE: soft piano, half-time, drums & bass out
    br = B(s, 'Bridge')
    sing_bridge(s, 'Bridge')
    s.track('piano', 'piano')
    prev = [60]
    for bi, sym in enumerate(BRIDGE_PROG.split('|')):
        sym = sym.strip()
        notes, _ = chord_notes(sym, 4)
        notes = voice_lead(prev, notes, 55, 72)
        prev = notes
        t = br + bi * 4
        r = root_of(sym, lo=36)                          # left hand: root + fifth, half-time
        s.note('piano', t, 3.8, r, 72)
        s.note('piano', t, 3.8, r + 7, 58)
        arp = [notes[0], notes[1], notes[2], notes[-1] if len(notes) > 3 else notes[0] + 12]
        for i, off in enumerate((0, 1, 1.5, 2, 3, 3.5)):  # right hand: gentle broken chord
            s.note('piano', t + off, 1.2, arp[[0, 1, 2, 3, 2, 1][i]], 56 if off else 64)
    chords(s, 'pad', 'halo_pad', br, BRIDGE_PROG, vel=30)
    chords(s, 'strings', 'slowstrings', br + 16, ' | '.join(BRIDGE_PROG.split('|')[4:]), vel=42, octave=4, lo=55, hi=74)

    # ---------------- BUILD-UP
    bu = B(s, 'Build-Up')
    sing_build(s, 'Build-Up')
    bprog = 'Fmaj7 | G | Am | E'
    drums(s, bu, 3, {'kick': K4}, vel=90, ramp=(70, 110))
    drums(s, bu, 1, {'snare': 'x...x...x...x...'}, vel=70)
    drums(s, bu + 4, 1, {'snare': 'x.x.x.x.x.x.x.x.'}, vel=80)
    drums(s, bu + 8, 1, {'snare': 'xxxxxxxxxxxxxxxx', 'kick': 'x.x.x.x.x.x.x.x.'}, vel=90, ramp=(75, 105))
    drums(s, bu + 12, 1, {'snare': 'xxxxxxxxxxxxxxxx', 'kick': 'xxxxxxxxxxxxxxxx', 'clap': 'x.x.x.x.xxxxxxxx'}, vel=110, ramp=(90, 127))
    chords(s, 'saw', 'synthstrings', bu, bprog, rhythm=[(o * .5, .45) for o in range(8)], vel=60, octave=4, lo=60, hi=81)
    chords(s, 'pad', 'sweep_pad', bu, bprog, vel=50)
    bass(s, bu, bprog, BASS_PUMP, vel=95)
    riser(s, bu + 15, 11, vel=80, zip_=True)

    # ---------------- FINAL CHORUS
    fc = B(s, 'Final Chorus')
    sing_final(s, 'Final Chorus')
    chorus_band(s, fc, heavy=True, last_bar_fill=False, punches=(29,), echo=False)
    line(s, 'echo', 'lead_calliope', fc, [(13, .5, 'E6'), (13.5, .25, 'D6'), (13.75, .25, 'B5'), (14, 1, 'G5')], 70)
    for b in (8, 24):
        drums(s, fc + b, .25, {'crash': 'x'}, vel=112)
    drums(s, fc + 5, 1.25, {'clap': 'X...X...'}, vel=115)       # (WE'RE SO BACK!) slam
    line(s, 'stab', 'synthbrass', fc + 5, [(o, .5, n) for o in (0, 1) for n in ('A4', 'C5', 'E5')], 95)
    # gang: choir doubles the chorus an octave down
    s.track('gang', 'choir')
    for v_ in s.vocal:
        if v_['section'] == 'Final Chorus' and v_['p'] >= pitch('G4'):
            for n in v_['notes']:
                s.note('gang', n['t'], n['d'] * .95, n['p'] - 12, 60)
    # the turn: band stops for "and you still say", slams back on bar 72
    carve(s, fc + 25.5, fc + 28, keep=('vocal_guide', 'pad', 'choirpad', 'strings', 'gang'))
    drums(s, fc + 28, .25, {'crash': 'X', 'kick': 'X'}, vel=120)

    # ---------------- OUTRO: soft, filtered; hard cut into "yes"
    o = B(s, 'Outro')
    sing_outro(s, 'Outro')
    oprog = 'Am7 | Fmaj7 | Dm7 G | G'
    chords(s, 'pad', 'halo_pad', o, oprog, vel=34)
    chords(s, 'opiano', 'piano', o, oprog, rhythm=[(0, 1.9), (2, 1.9)], vel=40, octave=4, lo=52, hi=70)
    bass(s, o, 'Am7 | Fmaj7 | Dm7 | G', [(0, 3.8, 12)], track='obass', inst='fingerbass', vel=60)
    line(s, 'musicbox', 'musicbox', o, [(5, .5, 'E5'), (5.5, .25, 'D5'), (5.75, .25, 'C5'), (6, 1.5, 'A4')], 50)
    carve(s, CUT_BEAT, s.total_beats + 8)

    # ---------------- 1-beat drop-outs / silences (bible 4.2)
    carve(s, p1 + 15, p1 + 16)
    carve(s, p2 + 15, p2 + 16)
    carve(s, bu + 15, bu + 16)

    # light humanisation of velocities (timing stays on the grid for the video)
    rng = random.Random(7)
    for name, tr in s.tracks.items():
        if name != 'vocal_guide':
            tr['notes'] = [(b, d, p, max(1, min(127, v + rng.randint(-6, 6)))) for (b, d, p, v) in tr['notes']]
    return s
