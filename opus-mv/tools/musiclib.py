"""Tiny composition DSL -> MIDI (+ note/syllable timeline for a guide vocal).

A composition is plain Python that builds a Song:

    s = Song(bpm=120, key='A minor')
    s.section('Intro', bars=4, energy=3)
    s.chords('Intro', 'Am7 | Fmaj7 | C | G', inst='pad')          # one chord per bar ('|'), '.' holds
    s.drums('Chorus', {'kick': 'x...x...x...x...', 'snare': '....x.......x...'})
    s.melody('Chorus', "E5/1 D5/.5 C5/.5 ...", lyric="I am made of you")  # pitch/beats, '_' = rest
    s.bass('Verse 1', 'A1/1 A1/.5 _/.5 ...')
    s.write_midi('guide.mid'); s.write_timeline('melody.json')

Pitches: scientific names (C#4, Bb3) or MIDI ints. Durations in beats.
Syllables: the lyric string is split on spaces and hyphens ("ev-ery-thing");
each non-rest note takes the next syllable, '~' in the note list (e.g. "C5~/1")
continues the previous syllable (melisma) instead of consuming a new one.
"""
import json, math, re
import pretty_midi

NOTE_RE = re.compile(r'^([A-Ga-g])([#b]?)(-?\d)$')
PC = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}

GM = {  # handy General MIDI programs (0-based)
    'piano': 0, 'epiano': 4, 'bell': 14, 'glock': 9, 'musicbox': 10, 'marimba': 12,
    'organ': 16, 'guitar': 25, 'eguitar': 27, 'bass': 38, 'synthbass': 38, 'fingerbass': 33,
    'strings': 48, 'slowstrings': 49, 'synthstrings': 50, 'choir': 52, 'voice': 53,
    'brass': 61, 'synthbrass': 62, 'lead_square': 80, 'lead_saw': 81, 'lead_calliope': 82,
    'lead_voice': 85, 'lead_fifths': 86, 'lead_basslead': 87, 'pad': 88, 'warm_pad': 89,
    'poly_pad': 90, 'choir_pad': 91, 'bowed_pad': 92, 'metal_pad': 93, 'halo_pad': 94,
    'sweep_pad': 95, 'fx_crystal': 98, 'fx_atmos': 99, 'fx_bright': 100, 'fx_scifi': 103,
    'pluck': 45, 'harp': 46, 'timpani': 47,
}
DRUM = {'kick': 36, 'kick2': 35, 'snare': 38, 'clap': 39, 'rim': 37, 'hat': 42, 'ohat': 46,
        'phat': 44, 'crash': 49, 'ride': 51, 'tom1': 50, 'tom2': 47, 'tom3': 43, 'shaker': 70,
        'tamb': 54, 'cowbell': 56, 'snap': 39, 'china': 52, 'splash': 55}

CHORD_Q = {
    '': [0, 4, 7], 'maj': [0, 4, 7], 'm': [0, 3, 7], 'min': [0, 3, 7], 'dim': [0, 3, 6], 'aug': [0, 4, 8],
    '7': [0, 4, 7, 10], 'maj7': [0, 4, 7, 11], 'm7': [0, 3, 7, 10], 'm9': [0, 3, 7, 10, 14],
    'maj9': [0, 4, 7, 11, 14], 'add9': [0, 4, 7, 14], 'madd9': [0, 3, 7, 14], 'sus2': [0, 2, 7],
    'sus4': [0, 5, 7], '6': [0, 4, 7, 9], 'm6': [0, 3, 7, 9], '9': [0, 4, 7, 10, 14], 'm11': [0, 3, 7, 10, 14, 17],
    '7sus4': [0, 5, 7, 10], 'dim7': [0, 3, 6, 9], 'm7b5': [0, 3, 6, 10], '5': [0, 7],
}


def pitch(p):
    if isinstance(p, int):
        return p
    m = NOTE_RE.match(p.strip())
    if not m:
        raise ValueError(f'bad pitch {p!r}')
    n, acc, octv = m.groups()
    v = PC[n.upper()] + (1 if acc == '#' else -1 if acc == 'b' else 0)
    return 12 * (int(octv) + 1) + v


def chord_notes(sym, octave=4):
    """'F#m7/C#' -> midi notes, bass note. Voiced close from root in given octave."""
    sym = sym.strip()
    bass = None
    if '/' in sym:
        sym, b = sym.split('/')
        bass = b
    m = re.match(r'^([A-G][#b]?)(.*)$', sym)
    root, q = m.groups()
    if q not in CHORD_Q:
        raise ValueError(f'unknown chord quality {q!r} in {sym}')
    r = pitch(f'{root}{octave}')
    notes = [r + i for i in CHORD_Q[q]]
    bn = pitch(f'{bass or root}{2}')
    return notes, bn


def voice_lead(prev, notes, lo=52, hi=76):
    """Move chord tones by octaves to stay near the previous voicing (smooth pads)."""
    if not prev:
        return notes
    c = sum(prev) / len(prev)
    out = []
    for n in notes:
        best = min((n + 12 * k for k in range(-3, 4) if lo <= n + 12 * k <= hi), key=lambda x: abs(x - c), default=n)
        out.append(best)
    return sorted(set(out))


class Song:
    def __init__(self, bpm, key='C major', beats_per_bar=4, title=''):
        self.bpm = bpm
        self.key = key
        self.bpb = beats_per_bar
        self.title = title
        self.sections = []           # (name, start_bar, bars, energy, note)
        self.tracks = {}             # name -> dict(program, is_drum, notes=[(start_beat, dur, pitch, vel)])
        self.vocal = []              # dicts: t (beats), d, p, syl, section, line
        self.markers = []

    # ---- time
    @property
    def spb(self):
        return 60.0 / self.bpm

    def section(self, name, bars, energy=5, note=''):
        start = sum(s[2] for s in self.sections)
        self.sections.append((name, start, bars, energy, note))
        return start

    def sec(self, name):
        for s in self.sections:
            if s[0] == name:
                return s
        raise KeyError(name)

    def beat0(self, name):
        return self.sec(name)[1] * self.bpb

    @property
    def total_beats(self):
        return sum(s[2] for s in self.sections) * self.bpb

    def seconds(self, beat):
        return beat * self.spb

    # ---- tracks
    def track(self, name, inst='piano', drum=False):
        if name not in self.tracks:
            prog = GM.get(inst, inst if isinstance(inst, int) else 0)
            self.tracks[name] = {'program': prog, 'drum': drum, 'notes': []}
        return self.tracks[name]

    def note(self, track, beat, dur, p, vel=90):
        self.tracks[track]['notes'].append((beat, dur, pitch(p), vel))

    def chords(self, section, prog, inst='warm_pad', track=None, octave=4, vel=70, rhythm=None,
               bass_track=None, bass_inst='synthbass', bass_rhythm=None, bass_vel=95, repeat=1, lo=52, hi=76):
        """prog: 'Am7 | F | C . | G' — '|' separates bars, space-separated chords split the bar evenly,
        '.' holds previous chord. rhythm: list of (beat_offset, dur) within each chord span; default sustain."""
        track = track or f'chords_{inst}'
        self.track(track, inst)
        if bass_track:
            self.track(bass_track, bass_inst)
        b0 = self.beat0(section)
        bars = [b.split() for b in prog.split('|')] * repeat
        prev = None
        cur = None
        for bi, bar in enumerate(bars):
            n = len(bar)
            span = self.bpb / n
            for ci, sym in enumerate(bar):
                t = b0 + bi * self.bpb + ci * span
                if sym != '.':
                    cur = sym
                if cur is None or cur == '_':
                    continue
                notes, bn = chord_notes(cur, octave)
                notes = voice_lead(prev, notes, lo, hi)
                prev = notes
                for (off, d) in (rhythm or [(0, span)]):
                    if off >= span:
                        continue
                    for p in notes:
                        self.note(track, t + off, min(d, span - off), p, vel)
                if bass_track:
                    for (off, d) in (bass_rhythm or [(0, span)]):
                        if off >= span:
                            continue
                        self.note(bass_track, t + off, min(d, span - off), bn, bass_vel)

    def drums(self, section, patterns, bars=None, steps_per_beat=4, vel=100, track='drums', fill_last=None):
        """patterns: {'kick': 'x...x...', ...}; 'x'=hit, 'X'=accent, 'o'=ghost, '.'=rest.
        Pattern length is looped over the section. fill_last: patterns for the final bar."""
        self.track(track, 0, drum=True)
        name, sb, nb, *_ = self.sec(section)
        nb = bars or nb
        b0 = sb * self.bpb
        step = 1.0 / steps_per_beat
        total_steps = int(nb * self.bpb * steps_per_beat)
        for inst, pat in patterns.items():
            pat = pat.replace(' ', '').replace('|', '')
            for i in range(total_steps):
                last_bar = i >= total_steps - self.bpb * steps_per_beat
                src = pat
                if fill_last and last_bar and inst in fill_last:
                    src = fill_last[inst].replace(' ', '').replace('|', '')
                    ch = src[(i - (total_steps - self.bpb * steps_per_beat)) % len(src)]
                elif fill_last and last_bar and fill_last and inst not in fill_last and fill_last.get('_mute_others'):
                    continue
                else:
                    ch = src[i % len(src)]
                if ch in 'xXo':
                    v = {'x': vel, 'X': min(127, vel + 20), 'o': int(vel * .45)}[ch]
                    self.tracks[track]['notes'].append((b0 + i * step, step * .9, DRUM[inst], v))

    def line(self, section, spec, track='lead', inst='lead_saw', vel=95, offset_beats=0):
        """Instrumental line: 'A4/1 C5/.5 _/.5 ...' relative to section start."""
        self.track(track, inst)
        t = self.beat0(section) + offset_beats
        for tok in spec.split():
            p, d = tok.split('/')
            d = float(d)
            if p not in ('_', '-'):
                self.note(track, t, d * 0.95, p.rstrip('~'), vel)
            t += d
        return t

    def melody(self, section, spec, lyric='', offset_beats=0, track='vocal_guide', inst='lead_voice', vel=100, line_id=None):
        """Sung melody. Returns end beat. Also records syllable timeline for guide vocal & video."""
        self.track(track, inst)
        syls = [s for s in re.split(r'[\s]+|(?<=-)', lyric.replace('-', '- ')) if s.strip()]
        syls = [s.strip() for s in syls]
        si = 0
        t = self.beat0(section) + offset_beats
        for tok in spec.split():
            p, d = tok.split('/')
            d = float(d)
            if p in ('_', '-'):
                t += d
                continue
            cont = p.endswith('~')
            p = p.rstrip('~')
            self.note(track, t, d * 0.97, p, vel)
            if cont and self.vocal:
                self.vocal[-1]['notes'].append({'t': t, 'd': d, 'p': pitch(p)})
            else:
                syl = syls[si] if si < len(syls) else '?'
                si += 1
                self.vocal.append({'t': t, 'd': d, 'p': pitch(p), 'syl': syl, 'section': section,
                                   'line': line_id if line_id is not None else lyric,
                                   'notes': [{'t': t, 'd': d, 'p': pitch(p)}]})
            t += d
        if si != len(syls):
            print(f'WARNING [{section}] "{lyric}": {len(syls)} syllables but {si} notes')
        return t

    # ---- output
    def write_midi(self, path):
        pm = pretty_midi.PrettyMIDI(initial_tempo=self.bpm)
        for name, tr in self.tracks.items():
            inst = pretty_midi.Instrument(program=tr['program'], is_drum=tr['drum'], name=name)
            for (b, d, p, v) in tr['notes']:
                s = self.seconds(b)
                inst.notes.append(pretty_midi.Note(velocity=int(max(1, min(127, v))), pitch=int(p), start=s, end=s + max(0.02, self.seconds(d))))
            pm.instruments.append(inst)
        pm.write(path)

    def timeline(self):
        return {
            'title': self.title, 'bpm': self.bpm, 'key': self.key, 'beats_per_bar': self.bpb,
            'duration': self.seconds(self.total_beats),
            'sections': [{'name': n, 'start': self.seconds(sb * self.bpb), 'end': self.seconds((sb + nb) * self.bpb),
                          'bars': nb, 'energy': e, 'note': note} for (n, sb, nb, e, note) in self.sections],
            'vocal': [{**v, 'start': self.seconds(v['t']), 'end': self.seconds(v['notes'][-1]['t'] + v['notes'][-1]['d'])} for v in self.vocal],
        }

    def write_timeline(self, path):
        with open(path, 'w') as f:
            json.dump(self.timeline(), f, indent=1)
