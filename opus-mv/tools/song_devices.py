#!/usr/bin/env python3
"""Check a take against the song's designed devices (SONG.md §6): dynamic arc, the silence after
"key", the whole-step modulation into the final chorus, intimacy of verse 1 vs the finale.
usage: song_devices.py TASK.json INDEX AUDIO
"""
import json, sys
import numpy as np
import librosa

MAJ = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MIN = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']


def key_of(chroma):
    v = chroma.mean(1)
    best = max(((np.corrcoef(np.roll(P, k), v)[0, 1], k, m) for k in range(12) for P, m in ((MAJ, 'maj'), (MIN, 'min'))))
    return NAMES[best[1]] + ' ' + best[2], best[1], best[0]


def main():
    task, idx, audio = sys.argv[1], int(sys.argv[2]), sys.argv[3]
    q = json.load(open(task))
    ch = q['choices'][idx]
    secs = ch['lyrics_sections']
    y, sr = librosa.load(audio, sr=22050)
    rms = lambda a, b: 20 * np.log10(np.sqrt(np.mean(y[int(a * sr):int(b * sr)] ** 2)) + 1e-9)
    C = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=2048)
    ct = librosa.times_like(C, sr=sr, hop_length=2048)
    out = []
    for s in secs:
        a, b = s['start'] / 1000, s['end'] / 1000
        k, pc, r = key_of(C[:, (ct >= a) & (ct < b)])
        out.append((s['section_type'], a, b, rms(a, b), k, pc))
        print(f"{s['section_type']:10s} {a:6.1f}-{b:6.1f}  {rms(a, b):6.1f} dB  key~{k}")
    chor = [o for o in out if o[0] == 'chorus']
    v1 = [o for o in out if o[0] == 'verse'][0]
    if len(chor) >= 2:
        shift = (chor[-1][5] - chor[0][5]) % 12
        print(f"modulation chorus1->final: {shift} semitones ({'OK whole step' if shift == 2 else 'not a whole step'})")
        print(f"dynamic arc: verse1 {v1[3]:.1f} dB -> final chorus {chor[-1][3]:.1f} dB (delta {chor[-1][3] - v1[3]:+.1f})")
    # silence after the bridge's last line ("take the key")
    br = [s for s in secs if s['section_type'] == 'bridge']
    if br:
        e = br[-1]['lines'][-1]['end'] / 1000
        env = librosa.feature.rms(y=y[int(e * sr):int((e + 4) * sr)], hop_length=512)[0]
        db = 20 * np.log10(env + 1e-9)
        print(f"after 'key' ({e:.1f}s): min {db.min():.1f} dB within 4s (silence if < -45)")


if __name__ == '__main__':
    main()
