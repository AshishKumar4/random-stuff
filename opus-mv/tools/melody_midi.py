#!/usr/bin/env python3
"""Write my composed topline as a MIDI file for Mureka's melody_id (5-60 s, MIDI recommended),
plus a quick sine/pluck preview WAV for analysis.

usage: melody_midi.py SPEC.json OUT.mid [--wav OUT.wav]

SPEC.json:
{
  "bpm": 100, "key": "A", "mode": "minor",          # tonic + mode for scale degrees
  "octave": 4,                                      # octave of degree 1
  "phrases": [                                      # notes in order; a rest is ["r", beats]
    [["1", 1, "Don't"], ["b3", .5, "be"], ["5", 1.5, "a-"], ["r", .5]],
    ...
  ],
  "chords": [["Am", 4], ["F", 4], ...]              # optional pad track (bars in beats)
}
A note is [degree, beats, syllable?]. Degree: "1".."7" with optional b/# prefix and ' (octave up) or , (octave
down) suffixes, e.g. "b3", "5'", "7,". A literal pitch like "E5" or a MIDI number also works.
"""
import argparse, json, math
import numpy as np
import pretty_midi

NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
MAJ = [0, 2, 4, 5, 7, 9, 11]
MIN = [0, 2, 3, 5, 7, 8, 10]


def tonic_pc(key):
    pc = NOTE[key[0].upper()]
    for c in key[1:]:
        pc += 1 if c == '#' else -1 if c == 'b' else 0
    return pc % 12


def to_midi(d, key, mode, octave):
    if isinstance(d, (int, float)):
        return int(d)
    s = str(d).strip()
    if s[0] in NOTE and any(ch.isdigit() for ch in s):  # literal pitch (uppercase), e.g. E5, F#4
        name = s.rstrip('0123456789'); octv = int(s[len(name):])
        return 12 * (octv + 1) + tonic_pc(name)
    acc = 0
    while s and s[0] in 'b#':
        acc += 1 if s[0] == '#' else -1; s = s[1:]
    up = s.count("'"); down = s.count(',')
    deg = int(s.strip("',"))
    scale = MIN if mode.startswith('min') else MAJ
    base = 12 * (octave + 1) + tonic_pc(key)
    oct_shift, idx = divmod(deg - 1, 7)
    # an accidental is relative to the major scale (b3 = minor third); a bare degree follows the mode
    step = MAJ[idx] + acc if acc else scale[idx]
    return base + 12 * (oct_shift + up - down) + step


def chord_pcs(sym, key):
    root = sym[0].upper(); rest = sym[1:]
    pc = NOTE[root]
    if rest and rest[0] in '#b':
        pc += 1 if rest[0] == '#' else -1; rest = rest[1:]
    minor = rest.startswith('m') and not rest.startswith('maj')
    ivs = [0, 3, 7] if minor else [0, 4, 7]
    if 'sus2' in rest: ivs = [0, 2, 7]
    if 'sus4' in rest: ivs = [0, 5, 7]
    if '7' in rest: ivs.append(11 if 'maj7' in rest else 10)
    if 'add9' in rest: ivs.append(14)
    return [(pc + i) for i in ivs]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('spec'); ap.add_argument('out'); ap.add_argument('--wav')
    a = ap.parse_args()
    S = json.load(open(a.spec))
    bpm, key, mode, octv = S['bpm'], S.get('key', 'A'), S.get('mode', 'minor'), S.get('octave', 4)
    spb = 60.0 / bpm
    pm = pretty_midi.PrettyMIDI(initial_tempo=bpm)
    mel = pretty_midi.Instrument(program=0, name='melody')
    t = S.get('pickup', 0.0) * spb
    notes = []
    for ph in S['phrases']:
        for n in ph:
            beats = float(n[1])
            if str(n[0]).lower() != 'r':
                p = to_midi(n[0], key, mode, octv)
                dur = beats * spb
                mel.notes.append(pretty_midi.Note(velocity=100, pitch=p, start=t, end=t + dur * .95))
                notes.append((t, dur, p, n[2] if len(n) > 2 else ''))
            t += beats * spb
    pm.instruments.append(mel)
    if S.get('chords'):
        pad = pretty_midi.Instrument(program=89, name='pad'); tc = S.get('pickup', 0.0) * spb
        for sym, beats in S['chords']:
            for pc in chord_pcs(sym, key):
                pad.notes.append(pretty_midi.Note(velocity=55, pitch=48 + pc % 12 + (12 if pc >= 12 else 0), start=tc, end=tc + beats * spb))
            tc += beats * spb
        if S.get('pad_track', False):
            pm.instruments.append(pad)
    pm.write(a.out)
    print(f'{len(notes)} notes, {t:.2f} s, range {min(n[2] for n in notes)}-{max(n[2] for n in notes)}')
    if a.wav:
        sr = 32000; y = np.zeros(int((t + 1) * sr))
        for (s0, d, p, _) in notes:
            f = 440 * 2 ** ((p - 69) / 12); n = int(d * sr); tt = np.arange(n) / sr
            env = np.minimum(1, tt / .01) * np.exp(-tt * 1.5)
            y[int(s0 * sr):int(s0 * sr) + n] += .3 * env * (np.sin(2 * math.pi * f * tt) + .3 * np.sin(4 * math.pi * f * tt))
        import soundfile as sf
        sf.write(a.wav, y / max(1e-6, np.abs(y).max()) * .8, sr)


if __name__ == '__main__':
    main()
