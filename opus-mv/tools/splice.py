#!/usr/bin/env python3
"""Splice grid-locked takes (ACE-Step covers of the same guide share the 128 BPM clock) section by section.

usage: splice.py OUT.wav --takes A=a.wav B=b.wav P=p.wav --plan "A:0-97.5,P:97.5-112.5,A:112.5-144" [--xfade .06]
Each segment is level-matched (RMS over the segment) to the reference take's same segment (first take
listed), and joined with an equal-power crossfade centred just before each boundary so downbeats stay clean.
"""
import argparse
import numpy as np
import soundfile as sf


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out'); ap.add_argument('--takes', nargs='+', required=True); ap.add_argument('--plan', required=True)
    ap.add_argument('--xfade', type=float, default=.06); ap.add_argument('--match', type=float, default=1.0,
                    help='0..1 how strongly to level-match segments to the reference take')
    a = ap.parse_args()
    takes = {}
    sr = None
    for kv in a.takes:
        k, p = kv.split('=', 1)
        y, s = sf.read(p, always_2d=True)
        sr = sr or s
        assert s == sr, 'sample rates differ'
        takes[k] = y.astype(np.float64)
    ref = next(iter(takes.values()))
    n = max(len(v) for v in takes.values())
    for k in takes:
        if len(takes[k]) < n:
            takes[k] = np.vstack([takes[k], np.zeros((n - len(takes[k]), takes[k].shape[1]))])
    ref = next(iter(takes.values()))
    segs = []
    for part in a.plan.split(','):
        k, rng = part.split(':')
        t0, t1 = map(float, rng.split('-'))
        segs.append((k, t0, t1))
    out = np.zeros_like(ref)
    xf = int(a.xfade * sr)
    rms = lambda x: np.sqrt(np.mean(x ** 2) + 1e-12)
    for i, (k, t0, t1) in enumerate(segs):
        i0, i1 = int(t0 * sr), min(n, int(t1 * sr))
        y = takes[k]
        g = rms(ref[i0:i1]) / rms(y[i0:i1]) if k != list(takes)[0] else 1.0
        g = 1 + (g - 1) * a.match
        w = np.ones(n)
        # fade in over [i0 - xf, i0], fade out over [i1 - xf, i1]  (boundaries sit just before downbeats)
        if i > 0:
            a0 = max(0, i0 - xf)
            w[:a0] = 0
            w[a0:i0] = np.sin(np.linspace(0, np.pi / 2, i0 - a0)) ** 2 if i0 > a0 else 1
        else:
            w[:i0] = 0
        if i < len(segs) - 1:
            b0 = max(0, i1 - xf)
            w[b0:i1] = np.cos(np.linspace(0, np.pi / 2, i1 - b0)) ** 2
            w[i1:] = 0
        # shift so the incoming take is already at full level on the boundary sample
        out += y * g * w[:, None]
        print(f'{k}: {t0:7.2f}-{t1:7.2f}  gain {20 * np.log10(g):+.1f} dB')
    sf.write(a.out, out, sr, subtype='FLOAT')


if __name__ == '__main__':
    main()
