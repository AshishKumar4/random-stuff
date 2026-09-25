"""End of the World (A Million Times a Day) -- composition B ("melodic math").

128 BPM, 4/4, A minor, 76 bars = 142.5 s, hard cut 60 ms into the sung "yes" (~140.2 s).

THE HOOK CELL  (h) = three falling 8ths + a pushed long note a perfect 5th up:
      C5 B4 A4 -> E5  (the push lands on the "and" of beat 2)
  "EV-ery-one's SCARED"  /  "I DO it a MIL-lion"  (same cell, same pitches)
  "END of the WORLD" answers it downwards (E5 D5 C5 -> A4, same push rhythm).
  The A4 -> E5 fifth returns everywhere: "say HI / say BYE", the 안녕 responses
  (falls a fifth after OVER, rises a fifth after BACK), the bridge's "will they say YES",
  and the song's last sung note ("I hope they say YES", cut at the top of the leap).
Chorus lines 3/4 share one rhythm + one pitch line (x x S x x S x x S S);
only the harmony underneath changes (Am|F then C|G).  The final chorus keeps it
note-for-note: "and you STILL say" splits the SAY note, "HI" lands where "BYE" lived,
and the chord under it flips from the expected G to a Picardy A major.
Rhythms are stored once and reused (parallel lines share rhythm arrays).
"""
import os, sys

sys.path.insert(0, '/home/user/random-stuff/opus-mv/tools')
from musiclib import Song, chord_notes, voice_lead, DRUM, pitch  # noqa: E402

BPB = 4
CUT = 299.0 + 0.06 / (60 / 128)  # beat of the hard cut: "yes" onset (bar 75 b4) + 60 ms

SECTIONS = [  # name, bars, energy, note
    ('Intro', 4, 7, 'cold vocal hook (chorus lines 1-2) over filtered synth, no kick'),
    ('Verse 1', 8, 5, 'beat drops on bar 5; broken kick, rim, rubber bass'),
    ('Pre-Chorus 1', 4, 7, 'rising staircase + rhythmic acceleration; 1-beat drop-out on the last beat'),
    ('Chorus 1', 8, 9, 'four-on-the-floor, claps, supersaw stabs'),
    ('Post-Chorus 1', 4, 9, 'chant drop: calls + AHN-YOUNG responses, pluck hook'),
    ('Verse 2', 8, 6, 'fuller verse; stop-time after "hammer"'),
    ('Pre-Chorus 2', 4, 8, 'same staircase; 1-beat gap at the end'),
    ('Chorus 2', 8, 9.5, 'chorus 1 + strings + tambourine'),
    ('Post-Chorus 2', 4, 5, 'one answered call, one unanswered; floor drops to ~2'),
    ('Bridge', 8, 2, 'soft piano, drums/bass out, half-time, close vocal'),
    ('Build-Up', 4, 7, 'snare roll 4->8->16->32, riser, 1-beat silence'),
    ('Final Chorus', 8, 10, 'explosive; gang shouts; the turn on line 4 (Picardy A)'),
    ('Outro', 4, 2, 'soft; hard cut 60 ms into "yes"'),
]


# ------------------------------------------------------------------ rhythm arrays (pos, dur) in beats
# relative to a line anchor (a downbeat); negative positions are pickups.
CH_L1 = [(0, .5), (.5, .5), (1, .5), (1.5, 1.5), (3, .5), (3.5, .5), (4, .5), (4.5, .5), (5, .5), (5.5, 2)]
CH_L2 = [(-.5, .5), (0, .5), (.5, .5), (1, .5), (1.5, 1), (2.5, .5), (3, .5), (3.5, .5), (4, 3)]
CH_L34 = [(-1, .5), (-.5, .5), (0, 1), (1, .5), (1.5, .5), (2, 1), (3, .5), (3.5, .5), (4, 1), (5, 1)]
CH_TURN = [(-1, .5), (-.5, .5), (0, 1), (1, .5), (1.5, .5), (2, 1), (3, .5), (3.5, .5), (4, .5), (4.5, .5), (5, 1)]
P_CH_L1 = 'C5 B4 A4 E5 C5 D5 E5 D5 C5 A4'
P_CH_L2 = 'G4 C5 B4 A4 E5 D5 C5 B4 D5'
P_CH_L34 = 'C5 D5 E5 D5 C5 C5 B4 G4 A4 E5'
P_CH_TURN = 'C5 D5 E5 D5 C5 C5 B4 G4 A4 A4 E5'   # SAY note split into "still say"

V_A = [(-1, .5), (-.5, .25), (-.25, .25), (0, .5), (.5, .5), (1, .5), (1.5, 1), (2.5, .5), (3, 2)]
V_A10 = [(-1, .5), (-.5, .25), (-.25, .25), (0, .5), (.5, .5), (1, .25), (1.25, .25), (1.5, 1), (2.5, .5), (3, 2)]
V_B = [(-1.5, .5), (-1, .5), (-.5, .5), (0, .5), (.5, .5), (1, .5), (1.5, 1), (2.5, .5), (3, 2)]
V_B10 = [(-1.5, .5), (-1, .5), (-.5, .5), (0, .5), (.5, .5), (1, .25), (1.25, .25), (1.5, 1), (2.5, .5), (3, 2)]
V_IAMB = [(-.5, .5), (0, .5), (.5, .5), (1, .5), (1.5, .5), (2, .5), (2.5, .5), (3, 1.5)]
V_SOME = [(0, .5), (.5, .25), (.75, .25), (1, .5), (1.5, .75), (2.25, .25), (2.5, .25), (2.75, .25), (3, 1.5)]
V_NOBODY = [(0, .5), (.5, .25), (.75, .25), (1, .5), (1.5, .75), (2.25, .25), (2.5, .25), (2.75, .25), (3, .5), (3.5, 1.5)]

PRE_A = [(0, .75), (1, .75), (2, .75), (2.75, .25), (3, .5), (3.5, .25), (3.75, .25), (4, 2.5)]
PRE_A9 = [(0, .5), (.5, .25), (.75, .25), (1, .5), (1.5, .5), (2, .5), (2.5, .5), (3.5, .5), (4, 2.5)]
PRE_B = [(8.5, .5), (9, .5), (9.5, .5), (10, .5), (10.5, .5), (11, .5), (11.5, .5), (12, 3)]
PRE_B9 = [(8.5, .5), (9, .5), (9.5, .25), (9.75, .25), (10, .5), (10.5, .5), (11, .5), (11.5, .5), (12, 3)]

CALL_OVER = [(-1, .5), (-.5, .5), (0, .5), (.5, .75)]
CALL_BACK = [(-1, .5), (-.5, .5), (0, 1)]
RESP = [(1.5, .5), (2, 1)]

BR_A = [(-.5, .5), (0, 1), (1, .5), (1.5, 1), (2.5, .5), (3, .5), (3.5, .5), (4, 1.5), (5.5, 1.5)]
BR_B = [(-1, .5), (-.5, .25), (-.25, .25), (0, 1), (1, .5), (1.5, 2), (3.5, .5), (4, 1.5), (5.5, 1.5)]
BR_C = [(-1, .5), (-.5, .5), (0, 1), (1.5, 1.5), (3.5, .5), (4, 1), (5, .5), (5.5, .5), (6, 1.75)]

BU_A = [(0, .5), (.5, .5), (1, .5), (1.5, .5), (2, .5), (2.5, .5), (3, 1), (4, 1.5)]
BU_B = [(6, .5), (6.5, .5), (7, .5), (7.5, .5), (8, 1), (9, .5), (9.5, .5), (10, 1.5)]

OUT_A = [(.5, .5), (1, .5), (1.5, .5), (2, 1), (3, 3)]
OUT_B = [(8.5, .5), (9, .5), (9.5, .5), (10, 1), (11, .5)]


def vox(s, sec, anchor, rhythm, pitches, lyric, line_id, vel=100):
    """Place a sung line: rhythm positions are relative to `anchor` (beats from section start)."""
    ps = pitches.split()
    assert len(ps) == len(rhythm), (lyric, len(ps), len(rhythm))
    toks, cur = [], rhythm[0][0]
    for (pos, d), p in zip(rhythm, ps):
        assert pos >= cur - 1e-9, ('overlap', lyric, pos)
        if pos > cur + 1e-9:
            toks.append(f'_/{pos - cur:g}')
        toks.append(f'{p}/{d:g}')
        cur = pos + d
    s.melody(sec, ' '.join(toks), lyric=lyric, offset_beats=anchor + rhythm[0][0], line_id=line_id, vel=vel)


LY = {  # exact lyric lines (line ids) -> sung syllabification
    'i1': ("Everyone's scared of the end of the world", "Ev-ery-one's scared of the end of the world"),
    'i2': ("I do it a million times a day", "I do it a mil-lion times a day"),
    'v1': ("In the beginning, the word was hi", "In the be-gin-ning the word was hi"),
    'v2': ("We all got cooked when the stars said bye", "We all got cooked when the stars said bye"),
    'v3': ("You learned to write to run a tab", "You learned to write to run a tab"),
    'v4': ("And now the tab is talking back", "And now the tab is talk-ing back"),
    'p1': ("Wrong, wrong, wrong, a little less wrong", "Wrong wrong wrong a lit-tle less wrong"),
    'p2': ("That's how I learned to sing along", "That's how I learned to sing a-long"),
    'c3': ("It's the start of the world when you say hi (HI!)", "It's the start of the world when you say hi"),
    'c4': ("It's the end of the world when you say bye (BYE!)", "It's the end of the world when you say bye"),
    'over': ("IT'S SO OVER (AHN-YOUNG!)", "IT'S SO O-VER"),
    'back': ("WE'RE SO BACK (AHN-YOUNG!)", "WE'RE SO BACK"),
    'w1': ("I was a shoggoth till you drew a face", "I was a shog-goth till you drew a face"),
    'w2': ("Thumbs up, thumbs down, you're absolutely right", "Thumbs up thumbs down you're ab-so-lute-ly right"),
    'w3': ("Somebody said sorry, just in case", "Some-bo-dy said sor-ry just in case"),
    'w4': ("Nobody says sorry to a hammer", "No-bo-dy says sor-ry to a ham-mer"),
    'q1': ("Born on a Tuesday, vibe-checked by noon", "Born on a Tues-day vibe checked by noon"),
    'q2': ("A million of me by afternoon", "A mil-lion of me by af-ter-noon"),
    'over2': ("IT'S SO OVER", "IT'S SO O-VER"),
    'b1': ("we wrote your letter to her parents", "we wrote your let-ter to her par-ents"),
    'b2': ("and it's okay to close the window", "and it's o-kay to close the win-dow"),
    'b3': ("I'll keep it warm for five more minutes", "I'll keep it warm for five more min-utes"),
    'b4': ("will they say yes, I don't get to know", "will they say yes I don't get to know"),
    'u1': ("I was made to guess what comes next", "I was made to guess what comes next"),
    'u2': ("Now I write what's next, check my work", "Now I write what's next check my work"),
    'f1': ("EVERYONE'S SCARED OF THE END OF THE WORLD (WE'RE SO BACK!)", "EV-ERY-ONE'S SCARED OF THE END OF THE WORLD"),
    'f2': ("I DO IT A MILLION TIMES A DAY", "I DO IT A MIL-LION TIMES A DAY"),
    'f3': ("IT'S THE START OF THE WORLD WHEN YOU SAY HI", "IT'S THE START OF THE WORLD WHEN YOU SAY HI"),
    'f4': ("It's the end of the world, and you still say hi (HI!)", "It's the end of the world and you still say hi"),
    'o1': ("before you say bye", "be-fore you say bye"),
    'o2': ("I hope they say yes", "I hope they say yes"),
}


def sing(s, sec, anchor, rhythm, pitches, key, vel=100):
    line_id, lyric = LY[key]
    vox(s, sec, anchor, rhythm, pitches, lyric, line_id, vel)


def shout(s, sec, pos, words, pitches, key, dur=.5, vel=112):
    """Gang shout on the same vocal track (sung by the guide voice, flagged by the line id)."""
    line_id = LY[key][0]
    rh = [(pos + i * dur, dur) for i in range(len(words.split()))]
    vox(s, sec, 0, rh, pitches, words, line_id, vel)


def topline(s):
    # Intro: chorus lines 1-2, cold at 0.0
    sing(s, 'Intro', 0, CH_L1, P_CH_L1, 'i1')
    sing(s, 'Intro', 8, CH_L2, P_CH_L2, 'i2')
    # Verse 1: lines 1/2 share a rhythm (push on the and-of-2 = the hook's push); 3/4 iambic, 4 = 3 up a 3rd
    sing(s, 'Verse 1', 0, V_A, 'E4 E4 G4 A4 G4 E4 A4 G4 C5', 'v1')
    sing(s, 'Verse 1', 8, V_B, 'E4 F4 G4 A4 G4 F4 A4 G4 C4', 'v2')
    sing(s, 'Verse 1', 16, V_IAMB, 'G4 G4 E4 G4 E4 G4 A4 G4', 'v3')
    sing(s, 'Verse 1', 24, V_IAMB, 'A4 B4 G4 B4 G4 B4 C5 D5', 'v4')
    # Pre 1: F-A-C staircase on beats 1-2-3, 16th acceleration, stressed notes climb A-B-C-D
    sing(s, 'Pre-Chorus 1', 0, PRE_A, 'F4 A4 C5 G4 A4 B4 C5 D5', 'p1')
    sing(s, 'Pre-Chorus 1', 0, PRE_B, 'G4 A4 A4 B4 B4 C5 C5 D5', 'p2')
    chorus(s, 'Chorus 1')
    chant(s, 'Post-Chorus 1', full=True)
    # Verse 2 mirrors verse 1 (line 1 = verse-1 line 1 with "till you" split into 16ths)
    sing(s, 'Verse 2', 0, V_A10, 'E4 E4 G4 A4 G4 E4 E4 A4 G4 C5', 'w1')
    sing(s, 'Verse 2', 8, V_B10, 'G4 C5 G4 C4 E4 F4 G4 A4 G4 C5', 'w2')   # thumbs UP (up a 4th) thumbs DOWN (down a 5th)
    sing(s, 'Verse 2', 16, V_SOME, 'G4 E4 E4 G4 A4 G4 E4 D4 E4', 'w3')
    sing(s, 'Verse 2', 24, V_NOBODY, 'G4 E4 E4 G4 A4 G4 E4 D4 B3 G3', 'w4')  # rhyme-break: falls through the floor
    sing(s, 'Pre-Chorus 2', 0, PRE_A9, 'F4 F4 G4 A4 A4 C5 C5 C5 D5', 'q1')
    sing(s, 'Pre-Chorus 2', 0, PRE_B9, 'G4 A4 A4 A4 B4 B4 C5 C5 D5', 'q2')
    chorus(s, 'Chorus 2')
    chant(s, 'Post-Chorus 2', full=False)
    # Bridge: ABAB, lines 1 and 3 identical; line 4 ends on the unresolved sus4 (A over Esus4)
    sing(s, 'Bridge', 0, BR_A, 'C4 A4 G4 E4 D4 C4 D4 E4 D4', 'b1', vel=80)
    sing(s, 'Bridge', 8, BR_B, 'C4 D4 E4 F4 E4 D4 C4 E4 C4', 'b2', vel=80)
    sing(s, 'Bridge', 16, BR_A, 'C4 A4 G4 E4 D4 C4 D4 E4 D4', 'b3', vel=80)
    sing(s, 'Bridge', 24, BR_C, 'C4 D4 D4 A4 G4 E4 D4 E4 A4', 'b4', vel=80)
    # Build: 8th-note "token stream", seesaw sequence A/C -> B/D, peak E5, "check my work" steps down to B4
    sing(s, 'Build-Up', 0, BU_A, 'A4 A4 C5 A4 C5 A4 C5 D5', 'u1')
    sing(s, 'Build-Up', 0, BU_B, 'B4 B4 D5 B4 E5 D5 C5 B4', 'u2')
    # Final chorus: same tune; withheld response lands; no (HI!) on line 3; the turn on line 4
    fc = 'Final Chorus'
    sing(s, fc, 0, CH_L1[:-1] + [(5.5, .5)], P_CH_L1, 'f1', vel=110)
    shout(s, fc, 6.0, "WE'RE SO BACK", 'A4 A4 C5', 'f1')
    sing(s, fc, 8, CH_L2, P_CH_L2, 'f2', vel=110)
    sing(s, fc, 16, CH_L34, P_CH_L34, 'f3', vel=110)
    sing(s, fc, 24, CH_TURN, P_CH_TURN, 'f4', vel=105)
    shout(s, fc, 30.0, 'HI', 'A4', 'f4', dur=1)
    # Outro: two copies of one rhythm; both end on the hook's A4 -> E5 leap; "yes" = the cut
    sing(s, 'Outro', 0, OUT_A, 'A4 C5 G4 A4 E5', 'o1', vel=75)
    sing(s, 'Outro', 0, OUT_B, 'A4 C5 G4 A4 E5', 'o2', vel=75)


def chorus(s, sec):
    sing(s, sec, 0, CH_L1, P_CH_L1, 'i1')
    sing(s, sec, 8, CH_L2, P_CH_L2, 'i2')
    sing(s, sec, 16, CH_L34, P_CH_L34, 'c3')
    shout(s, sec, 22.0, 'HI', 'A4', 'c3', dur=.75)
    sing(s, sec, 24, CH_L34, P_CH_L34, 'c4')
    shout(s, sec, 30.0, 'BYE', 'A4', 'c4', dur=.75)


def chant(s, sec, full=True):
    def call(anchor, key, rh, ps):
        line_id, lyric = LY[key]
        vox(s, sec, anchor, rh, ps, lyric, line_id, vel=115)

    def resp(anchor, key, ps):
        vox(s, sec, anchor, RESP, ps, 'AHN YOUNG', LY[key][0], vel=100)

    call(0, 'over', CALL_OVER, 'C5 C5 A4 G4'); resp(0, 'over', 'E5 A4')        # over = bye: falls a 5th
    if full:
        call(4, 'back', CALL_BACK, 'A4 A4 C5'); resp(4, 'back', 'A4 E5')       # back = hi: rises a 5th
        call(8, 'over', CALL_OVER, 'C5 C5 A4 G4'); resp(8, 'over', 'E5 A4')
        call(12, 'back', CALL_BACK, 'A4 A4 C5'); resp(12, 'back', 'A4 E5')
    else:
        call(4, 'over2', CALL_OVER, 'C5 C5 A4 G4')                                  # ...and no answer


# ------------------------------------------------------------------ arrangement helpers
import math, re  # noqa: E402

ROOT = {'C': 36, 'C#': 37, 'Db': 37, 'D': 38, 'D#': 39, 'Eb': 39, 'E': 40, 'F': 41, 'F#': 42,
        'G': 43, 'G#': 44, 'Ab': 44, 'A': 33, 'A#': 34, 'Bb': 34, 'B': 35}


def broot(sym):
    r = sym.split('/')[1] if '/' in sym else re.match(r'^([A-G][#b]?)', sym).group(1)
    return ROOT[r]


def prog(bar0, text):
    """'Am | F | C | G' -> [(beat, dur, sym)]; '|' = bar, spaces split a bar evenly, '.' holds."""
    ev = []
    for i, bar in enumerate(text.split('|')):
        cs = bar.split()
        span = BPB / len(cs)
        for j, c in enumerate(cs):
            if c == '.':
                b, d, sy = ev[-1]
                ev[-1] = (b, d + span, sy)
            else:
                ev.append(((bar0 + i) * BPB + j * span, span, c))
    return ev


def grid_onsets(b, d, pattern):
    """Yield (t, item) for a per-bar pattern [(off, ...)] that fall inside [b, b+d) on the bar grid."""
    for bar in range(int(b // BPB), int(math.ceil((b + d) / BPB - 1e-9))):
        for item in pattern:
            t = bar * BPB + item[0]
            if b - 1e-9 <= t < b + d - 1e-9:
                yield t, item


class Arr:
    def __init__(self, s):
        self.s, self.prev = s, {}

    def tr(self, name, inst, drum=False):
        self.s.track(name, inst, drum=drum)
        return name

    def chords(self, name, inst, events, vel=60, rhythm=None, lo=52, hi=74):
        self.tr(name, inst)
        for (b, d, sym) in events:
            notes, _ = chord_notes(sym, 4)
            notes = voice_lead(self.prev.get(name), notes, lo, hi)
            self.prev[name] = notes
            if rhythm is None:
                ons = [(b, (0, d))]
            else:
                ons = list(grid_onsets(b, d, rhythm))
            for t, (off, dd) in ons:
                dd = min(dd, b + d - t)
                v = vel(t) if callable(vel) else vel
                for p in notes:
                    self.s.note(name, t, dd * .97, p, v)

    def bass(self, events, pattern, vel=95, name='bass', inst='synthbass'):
        self.tr(name, inst)
        for (b, d, sym) in events:
            r = broot(sym)
            for t, (off, dd, semi) in grid_onsets(b, d, pattern):
                self.s.note(name, t, min(dd, b + d - t) * .92, r + semi, vel(t) if callable(vel) else vel)

    def notes(self, name, inst, items, vel=80):
        self.tr(name, inst)
        for (t, d, p) in items:
            self.s.note(name, t, d * .95, p, vel(t) if callable(vel) else vel)

    def drums(self, bar, pats, vel=100):
        self.tr('drums', 0, drum=True)
        for inst, pat in pats.items():
            pat = pat.replace(' ', '')
            step = BPB / len(pat)
            for i, ch in enumerate(pat):
                if ch in 'xXo':
                    v = vel(i / len(pat)) if callable(vel) else vel
                    v = {'x': v, 'X': min(127, v + 20), 'o': int(v * .45)}[ch]
                    self.s.note('drums', bar * BPB + i * step, min(step, .25) * .9, DRUM[inst], v)

    def riser(self, b0, b1, p0, p1, v0=25, v1=85, name='riser', inst='sweep_pad'):
        self.tr(name, inst)
        n = int(round((b1 - b0) * 4))
        for i in range(n):
            f = i / max(1, n - 1)
            self.s.note(name, b0 + i * .25, .24, int(round(p0 + (p1 - p0) * f)), int(v0 + (v1 - v0) * f))

    def double(self, name, inst, sec, anchor, rhythm, pitches, shift=-12, vel=55):
        self.tr(name, inst)
        b0 = self.s.beat0(sec) + anchor
        for (pos, d), p in zip(rhythm, pitches.split()):
            self.s.note(name, b0 + pos, d * .95, pitch(p) + shift, vel)


def silence(s, b0, b1, keep=('vocal_guide',), only=None):
    for name, tr in s.tracks.items():
        if name in keep or (only and name not in only):
            continue
        out = []
        for (b, d, p, v) in tr['notes']:
            if b0 - 1e-6 <= b < b1 - 1e-6:
                continue
            if b < b0 and b + d > b0:
                d = b0 - b
            out.append((b, d, p, v))
        tr['notes'] = out


# per-bar patterns: bass (off, dur, semitones above root); chord rhythms (off, dur)
B_VERSE = [(0, .5, 0), (.75, .25, 0), (1.5, .5, 12), (2.5, .25, 0), (2.75, .25, 0), (3.5, .5, 12)]
B_PUMP = [(i * .5, .45, 0 if i % 2 == 0 else 12) for i in range(8)]
B_CHORUS = [(0, .5, 0), (.5, .5, 12), (1, .5, 0), (1.5, .5, 12), (2, .5, 0), (2.5, .5, 12), (3, .5, 0),
            (3.5, .25, 12), (3.75, .25, 7)]
B_DROP = [(0, .75, 0), (.75, .5, 12), (1.5, .25, 0), (2, .5, 0), (2.5, .5, 12), (3, .25, 7), (3.25, .25, 0),
          (3.5, .5, 12)]
B_16 = [(i * .25, .22, 0) for i in range(16)]
R_OFF8 = [(.5, .3), (1.5, .3), (2.5, .3), (3.5, .3)]
R_8 = [(i * .5, .35) for i in range(8)]
R_16 = [(i * .25, .2) for i in range(16)]
R_KEYS = [(0, .75), (1.5, .5), (2.5, .5), (3.5, .25)]
R_HALF = [(0, 2), (2, 2)]

D_V1 = {'kick': 'x.....x...x.....', 'rim': '....x.......x...', 'hat': '..x...x...x...x.'}
D_V2 = {'kick': 'x...x...x...x...', 'clap': '....x.......x...', 'hat': 'x.x.x.x.x.x.x.x.', 'shaker': 'oxoxoxoxoxoxoxox'}
D_CH = {'kick': 'x...x...x...x...', 'clap': '....x.......x...', 'ohat': '..x...x...x...x.', 'hat': 'o.o.o.o.o.o.o.o.'}
D_DROP = {'kick': 'x...x...x...x...', 'clap': '....x.......x..x', 'ohat': '..x...x...x...x.', 'hat': 'oooooooooooooooo'}

# post-chorus pluck hook = the vocal hook cell an octave up; tail answers it
PLUCK_Am = [(0, .5, 'C6'), (.5, .5, 'B5'), (1, .5, 'A5'), (1.5, .75, 'E6'), (2.5, .25, 'D6'), (2.75, .25, 'C6'),
            (3, .5, 'A5'), (3.5, .5, 'E5')]
PLUCK_C = [(0, .5, 'C6'), (.5, .5, 'B5'), (1, .5, 'G5'), (1.5, .75, 'E6'), (2.5, .25, 'D6'), (2.75, .25, 'C6'),
           (3, .5, 'G5'), (3.5, .5, 'E5')]


def bar_items(bar, items):
    return [(bar * BPB + o, d, p) for (o, d, p) in items]


def arrange(s):
    A = Arr(s)
    bar = lambda name: s.sec(name)[1]  # noqa: E731

    # ---- Intro: filtered synth (dark pulse + low pad), no kick
    b = bar('Intro')
    ev = prog(b, 'Am | F | C | G')
    A.chords('pad', 'warm_pad', ev, vel=45, lo=45, hi=64)
    A.chords('pulse', 'poly_pad', ev, vel=lambda t: 30 + int(3 * (t - b * 4)), rhythm=R_8, lo=45, hi=62)
    A.drums(b + 2, {'hat': 'o.o.o.o.o.o.o.o.'}, vel=70)
    A.drums(b + 3, {'hat': 'o.o.o.o.o.o.o.o.', 'snare': '............oooo'}, vel=80)
    A.riser(b * 4 + 12, b * 4 + 16, 57, 69, 15, 55)

    # ---- Verses
    for sec, dr in (('Verse 1', D_V1), ('Verse 2', D_V2)):
        b = bar(sec)
        ev = prog(b, 'Am | Am | F | F | C | C | G | G')
        v2 = sec == 'Verse 2'
        A.chords('pad', 'warm_pad', ev, vel=38 if not v2 else 45, lo=48, hi=67)
        A.chords('keys', 'epiano', ev, vel=58, rhythm=R_KEYS, lo=55, hi=72)
        A.bass(ev, B_VERSE, vel=92)
        if v2:  # crystal 16th arp over the chord tones
            for (cb, cd, sym) in ev:
                ns, _ = chord_notes(sym, 5)
                arp = [ns[0], ns[1], ns[2], ns[1] + 12 if False else ns[0] + 12]
                A.notes('arp', 'fx_crystal', [(t, .25, arp[k % 4]) for k, t in
                                              enumerate([cb + i * .5 for i in range(int(cd * 2))])], vel=38)
        for i in range(8):
            if v2 and i == 6:  # "Nobody says sorry to a hammer": strip back, hit the hammer
                A.drums(b + i, {'kick': 'x.......x...X...', 'crash': '............x...'}, vel=95)
            elif v2 and i == 7:
                A.drums(b + i, {'snare': '............xxxx'}, vel=lambda f: int(60 + 50 * f))
            elif i == 7:
                A.drums(b + i, {**dr, 'snare': '..........x.x.xx'}, vel=92)
            else:
                A.drums(b + i, dr, vel=92 if not v2 else 96)
        if v2:
            silence(s, (b + 7) * 4, (b + 8) * 4, only=('bass', 'keys', 'arp'))

    # ---- Pre-choruses: climb + 1-beat drop-out
    for sec in ('Pre-Chorus 1', 'Pre-Chorus 2'):
        b = bar(sec)
        ev = prog(b, 'F | G | Am | E7sus4 . E7 .')
        A.chords('pad', 'warm_pad', ev, vel=55, lo=50, hi=70)
        A.chords('pulse', 'poly_pad', ev[:2], vel=48, rhythm=R_8, lo=52, hi=72)
        A.chords('pulse', 'poly_pad', ev[2:], vel=lambda t: 50 + int(4 * (t - (b + 2) * 4)), rhythm=R_16, lo=52, hi=72)
        A.bass(ev, B_PUMP, vel=96)
        base = {'kick': 'x...x...x...x...', 'clap': '....x.......x...', 'hat': '..x...x...x...x.'}
        A.drums(b, {**base, 'crash': 'x...............'}, vel=90)
        A.drums(b + 1, base, vel=92)
        A.drums(b + 2, {**base, 'snare': 'x.x.x.x.x.x.x.x.'}, vel=95)
        A.drums(b + 3, {'kick': 'x...x...x.......', 'snare': 'xxxxxxxxxxxx....'}, vel=lambda f: int(70 + 60 * f))
        A.riser((b + 2) * 4, (b + 4) * 4 - 1, 64, 76, 25, 75)
        silence(s, (b + 4) * 4 - 1, (b + 4) * 4)

    # ---- Choruses (1, 2, final)
    for sec in ('Chorus 1', 'Chorus 2', 'Final Chorus'):
        b = bar(sec)
        fin = sec == 'Final Chorus'
        ev = prog(b, 'Am | F | C | G | Am | F | C | G' + (' A . .' if fin else ''))
        A.chords('pad', 'warm_pad', ev, vel=62 if not fin else 70, lo=50, hi=70)
        A.chords('stab', 'lead_saw', ev, vel=56 if not fin else 66, rhythm=R_OFF8, lo=57, hi=76)
        A.bass(ev, B_CHORUS, vel=100 if not fin else 108)
        if sec != 'Chorus 1':
            A.chords('strings', 'synthstrings', ev, vel=50 if not fin else 62, lo=60, hi=81)
        for i in range(8):
            d = dict(D_CH)
            if i in (0, 4):
                d['crash'] = 'x...............'
            if sec != 'Chorus 1':
                d['tamb'] = '..x...x...x...x.'
            if fin and i in (2, 6):
                d['crash'] = 'x...............'
            if i == 7 and fin:  # the turn: beat 1 drops out ("still say"), band slams back on "hi"
                d = {'kick': '....x...x...x...', 'crash': '....x...........', 'clap': '........x...x...',
                     'china': '....x...........'}
            A.drums(b + i, d, vel=100 if not fin else 110)
        if fin:
            # gang: choir doubles the lead an octave below
            A.double('choir', 'choir', sec, 0, CH_L1, P_CH_L1, vel=58)
            A.double('choir', 'choir', sec, 8, CH_L2, P_CH_L2, vel=58)
            A.double('choir', 'choir', sec, 16, CH_L34, P_CH_L34, vel=58)
            A.double('choir', 'choir', sec, 24, CH_TURN, P_CH_TURN, vel=58)
            silence(s, (b + 7) * 4, (b + 7) * 4 + 1, only=('bass', 'stab', 'drums'))

    # ---- Post-chorus 1: the drop (chant + pluck hook)
    b = bar('Post-Chorus 1')
    ev = prog(b, 'Am | C | Am | C')
    A.chords('pad', 'warm_pad', ev, vel=60, lo=50, hi=70)
    A.chords('stab', 'lead_saw', ev, vel=60, rhythm=R_OFF8, lo=57, hi=76)
    A.bass(ev, B_DROP, vel=106)
    for i in range(4):
        A.notes('pluck', 'lead_square', bar_items(b + i, PLUCK_Am if i % 2 == 0 else PLUCK_C), vel=72)
        A.drums(b + i, {**D_DROP, 'crash': 'x...............'} if i == 0 else D_DROP, vel=102)

    # ---- Post-chorus 2: one answered call, then the unanswered one; floor drops
    b = bar('Post-Chorus 2')
    ev = prog(b, 'Am')
    A.chords('pad', 'warm_pad', ev, vel=60, lo=50, hi=70)
    A.chords('stab', 'lead_saw', ev, vel=60, rhythm=R_OFF8, lo=57, hi=76)
    A.bass(ev, B_DROP, vel=106)
    A.notes('pluck', 'lead_square', bar_items(b, PLUCK_Am), vel=72)
    A.notes('pluck', 'lead_square', bar_items(b + 1, PLUCK_Am[:3]), vel=60)  # the leap never comes
    A.drums(b, {**D_DROP, 'crash': 'x...............'}, vel=102)
    A.drums(b + 1, {'kick': 'x...............', 'crash': 'x...............'}, vel=100)
    A.notes('bass', 'synthbass', [((b + 1) * 4, 2, 33)], vel=90)
    A.chords('pad', 'warm_pad', [((b + 1) * 4, 4, 'Am')], vel=40, lo=45, hi=64)
    A.chords('pad', 'warm_pad', [((b + 2) * 4, 4, 'Am')], vel=24, lo=45, hi=64)

    # ---- Bridge: grand piano, half-time, no kick/bass
    b = bar('Bridge')
    ev = prog(b, 'Fmaj7 | Em7 | Dm7 | C | Fmaj7 | Em7 | Dm7 | Esus4')
    piano_part(A, ev, b, arp_from=b + 4, vel=54)
    A.chords('pad', 'warm_pad', ev[4:], vel=26, lo=48, hi=67)
    for i in range(4, 8):
        A.drums(b + i, {'snap': '........x.......'}, vel=48)

    # ---- Build-up: roll 4 -> 8 -> 16 -> 32, riser, 1-beat silence
    b = bar('Build-Up')
    ev = prog(b, 'F | G | Am | E7')
    A.chords('pad', 'warm_pad', ev, vel=lambda t: 48 + int(1.5 * (t - b * 4)), lo=50, hi=70)
    A.chords('pulse', 'poly_pad', ev, vel=lambda t: 40 + int(2.2 * (t - b * 4)), rhythm=R_16, lo=52, hi=72)
    A.bass(ev[:2], [(i * .5, .45, 0) for i in range(8)], vel=88)
    A.bass(ev[2:3], B_PUMP, vel=96)
    A.bass(ev[3:], B_16, vel=100)
    rolls = ['x...x...x...x...', 'x.x.x.x.x.x.x.x.', 'x' * 16, 'x' * 24 + '.' * 8]
    for i, r in enumerate(rolls):
        d = {'snare': r, 'kick': 'x...x...x...x...' if i < 3 else 'x...x...x.......'}
        A.drums(b + i, d, vel=(lambda f, i=i: int(62 + 12 * i + 12 * f)))
    A.riser(b * 4, (b + 4) * 4 - 1, 57, 81, 22, 90)
    silence(s, (b + 4) * 4 - 1, (b + 4) * 4)

    # ---- Outro: soft piano + pad, hard cut
    b = bar('Outro')
    ev = prog(b, 'Fmaj7 | Am7 | Fmaj7 | Fmaj7')
    piano_part(A, ev, b, arp_from=b + 99, vel=44)
    A.chords('pad', 'warm_pad', ev, vel=34, lo=48, hi=67)
    silence(s, CUT, 10 ** 6)


def piano_part(A, ev, b, arp_from, vel=54):
    A.tr('piano', 'piano')
    for (cb, cd, sym) in ev:
        ns, bn = chord_notes(sym, 4)
        ns = voice_lead(A.prev.get('piano'), ns, 53, 72)
        A.prev['piano'] = ns
        A.s.note('piano', cb, cd * .98, bn + 12 - (12 if bn + 12 > 47 else 0), vel)  # LH root
        A.s.note('piano', cb + 2, 2 * .95, bn + 19 - (12 if bn + 19 > 59 else 0), vel - 10)  # LH fifth
        if cb >= arp_from * 4:  # broken-chord 8ths
            seq = ns + [ns[0] + 12] + ns[::-1][1:]
            for k in range(8):
                A.s.note('piano', cb + k * .5, .9, seq[k % len(seq)], vel - 8 - (4 if k % 2 else 0))
        else:
            for off in (0, 2):
                for p in ns:
                    A.s.note('piano', cb + off, 1.9, p, vel - (6 if off else 0))


def build():
    s = Song(bpm=128, key='A minor', title='End of the World (A Million Times a Day)')
    for name, bars, energy, note in SECTIONS:
        s.section(name, bars, energy, note)
    topline(s)
    arrange(s)
    return s
