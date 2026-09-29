#!/usr/bin/env python3
"""Compare the sung melody of two vocal tracks (e.g. my guide vocal vs a take's separated vocals):
pyin pitch -> semitones -> DTW alignment (tempo-invariant) -> % of aligned voiced frames within 1 st
after the best global transposition (octave-folded). usage: contour_compare.py A.wav B.wav [--a0 s --a1 s --b0 s --b1 s]"""
import argparse
import numpy as np, librosa


def track(p, t0, t1):
    y, sr = librosa.load(p, sr=16000, offset=t0, duration=None if t1 is None else t1 - t0)
    f0, vf, _ = librosa.pyin(y, fmin=90, fmax=1000, sr=sr, frame_length=1024, hop_length=320)
    m = librosa.hz_to_midi(f0)
    return m[vf & ~np.isnan(m)]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('a'); ap.add_argument('b')
    for k in ('a0', 'b0'): ap.add_argument('--' + k, type=float, default=0)
    for k in ('a1', 'b1'): ap.add_argument('--' + k, type=float, default=None)
    a = ap.parse_args()
    A = track(a.a, a.a0, a.a1); B = track(a.b, a.b0, a.b1)
    best = None
    for sh in np.arange(-24, 24.5, .5):
        D, wp = librosa.sequence.dtw(A[None, :], B[None, :] + sh, metric='euclidean', subseq=False)
        d = np.abs(A[wp[:, 0]] - (B[wp[:, 1]] + sh))
        d = np.minimum(d, np.abs(d - 12))  # forgive octave slips
        sc = np.mean(d <= 1)
        if best is None or sc > best[0]:
            best = (sc, sh, np.median(d))
    print(f'within 1 st: {best[0]:.0%}  median err {best[2]:.2f} st  transposition {best[1]:+.1f} st  ({len(A)} vs {len(B)} voiced frames)')


if __name__ == '__main__':
    main()
