#!/usr/bin/env python3
"""Richer, wider, more dynamic mix of v1 from its own stems (no synthesized notes, so nothing can
clash with what the take actually plays). Same take, same beat and pace.

  vocals : de-muddied, air shelf, plate reverb send; in choruses/final a doubled layer
           (±7 cent detune via tiny resample, 14/22 ms, panned L/R) for a stacked chorus
  drums  : parallel saturation (punch), kick sub shelf, hat air
  bass   : sub reinforcement + soft-clipped harmonics so the low end reads on phones
  other  : mid/side widen, low-mid cleanup
  whole  : section automation (verses/bridge breathe, choruses/final lift) for dynamic range
usage: enrich_v1.py STEMS_DIR OUT.wav   (stems at their native sample rate)
"""
import sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve, resample

LOUD = [(30.0, 45.0), (45.0, 52.5), (75.0, 90.0), (90.0, 96.0), (120.0, 135.0)]


def main():
    d, out_path = sys.argv[1:3]
    st, sr = {}, None
    for k in ('vocals', 'drums', 'bass', 'other'):
        x, sr = sf.read(f'{d}/{k}.wav', always_2d=True)
        st[k] = x.astype(np.float64)
    n = min(len(v) for v in st.values())
    st = {k: v[:n] for k, v in st.items()}
    S = lambda t: int(round(t * sr))
    bq = lambda kind, f, o=2: butter(o, f, kind, fs=sr, output='sos')
    filt = lambda x, kind, f, o=2: sosfilt(bq(kind, f, o), x, axis=0)
    t = np.arange(n) / sr

    def mask(regions, ramp=.2):
        m = np.zeros(n)
        for a, b in regions:
            m[S(a):S(b)] = 1
        k = S(ramp); return np.convolve(m, np.ones(k) / k, mode='same')

    loud = mask(LOUD)

    # vocals
    v = st['vocals'] - .2 * filt(st['vocals'], 'bandpass', [200, 400]) + .22 * filt(st['vocals'], 'highpass', 9000)
    mono = v.mean(1)
    def shifted(cents, delay_ms):
        r = 2 ** (cents / 1200); m2 = resample(mono, int(len(mono) / r))[:n]
        m2 = np.pad(m2, (S(delay_ms / 1000), 0))[:n]
        return np.pad(m2, (0, n - len(m2)))
    dbl = np.stack([shifted(+7, 14), shifted(-7, 22)], 1) * .32 * loud[:, None]
    L = S(1.8); ir_t = np.arange(L) / sr
    ir = np.random.default_rng(7).standard_normal((L, 2)) * np.exp(-ir_t / .45)[:, None]
    ir = filt(ir, 'highpass', 400); ir /= np.sqrt((ir ** 2).sum(0))
    send = filt(v, 'highpass', 300)
    plate = np.stack([fftconvolve(send[:, c], ir[:, c])[:n] for c in range(2)], 1) * .16
    vocals = v * 1.05 + dbl + plate

    # drums
    dr = st['drums']
    sat = np.tanh(dr * 3.0) / 3.0
    drums = dr + .45 * sat + .35 * filt(dr, 'lowpass', 75) + .22 * filt(dr, 'highpass', 9000)

    # bass
    b = st['bass']
    harm = filt(np.tanh(filt(b, 'lowpass', 200) * 4) / 4, 'bandpass', [120, 600])
    bass = b + .3 * filt(b, 'lowpass', 65) + .35 * harm

    # other
    o = st['other'] - .18 * filt(st['other'], 'bandpass', [250, 500])
    mid = o.mean(1); side = (o[:, 0] - o[:, 1]) / 2 * 1.35
    other = np.stack([mid + side, mid - side], 1) + .1 * filt(o, 'highpass', 10000)

    mix = vocals + drums + bass + other
    mix = filt(mix, 'highpass', 24)

    # section automation (dB), smoothed
    pts = [(0, -1.5), (7.5, -3.0), (22.5, -1.5), (30.0, 0.8), (52.5, -3.0), (67.5, -1.5), (75.0, 0.8),
           (96.0, -1.0), (97.5, -4.0), (112.5, -1.5), (120.0, 1.5), (135.0, -1.5), (1e9, -1.5)]
    g = np.zeros(n)
    for (t0, d0), (t1, _) in zip(pts, pts[1:]):
        g[(t >= t0) & (t < t1)] = d0
    k = S(.3); g = np.convolve(np.pad(g, (k, k), mode='edge'), np.ones(k) / k, mode='same')[k:-k]
    mix *= (10 ** (g / 20))[:, None]
    mix /= np.abs(mix).max() / .8
    sf.write(out_path, mix.astype(np.float32), sr, subtype='FLOAT')
    print('ok', n / sr, sr)


if __name__ == '__main__':
    main()
