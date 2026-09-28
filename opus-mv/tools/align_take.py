#!/usr/bin/env python3
"""Align a generated take to the composition guide (grid time) with chroma + onset DTW.

Outputs a warp map [[grid_t, take_t], ...] (monotonic) and diagnostics:
  - how much of the guide is matched, local tempo ratio per section
  - melody adherence: vocal pitch (pyin on the take's vocal stem if given) vs the composed notes,
    evaluated through the warp.
usage: align_take.py GUIDE.wav TAKE.mp3 --melody melody.json [--vocals take_vocals.wav] [--out warp.json] [--png]
"""
import argparse, json
import numpy as np
import librosa


def feats(path, sr=22050, hop=512):
    y, _ = librosa.load(path, sr=sr, mono=True)
    ch = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop)
    on = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    on = on / (on.max() + 1e-9)
    ch = ch / (np.linalg.norm(ch, axis=0, keepdims=True) + 1e-9)
    F = np.vstack([ch, on[None, :ch.shape[1]] * .6])
    return F, len(y) / sr, hop / sr


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('guide'); ap.add_argument('take')
    ap.add_argument('--melody'); ap.add_argument('--vocals'); ap.add_argument('--out'); ap.add_argument('--png')
    a = ap.parse_args()
    G, gdur, hop = feats(a.guide)
    T, tdur, _ = feats(a.take)
    # subsample for DTW speed (~10 fps)
    k = 4
    Gs, Ts = G[:, ::k], T[:, ::k]
    D, wp = librosa.sequence.dtw(X=Gs, Y=Ts, metric='cosine', subseq=False, global_constraints=False)
    wp = wp[::-1] * k * hop
    cost = D[-1, -1] / len(wp)
    # monotone warp map sampled every 0.5 s of grid time
    gt, tt = wp[:, 0], wp[:, 1]
    grid = np.arange(0, gdur, .5)
    warp = []
    for g in grid:
        idx = np.where(gt <= g + 1e-6)[0]
        if len(idx) == 0:
            continue
        warp.append([round(float(g), 3), round(float(tt[idx[-1]]), 3)])
    res = {'guide_dur': gdur, 'take_dur': tdur, 'dtw_cost': float(cost), 'warp': warp}
    if a.melody:
        m = json.load(open(a.melody))
        secs = []
        W = np.array(warp)
        f = lambda g: float(np.interp(g, W[:, 0], W[:, 1]))
        for s in m['sections']:
            ts, te = f(s['start']), f(min(s['end'], gdur - .01))
            secs.append({'name': s['name'], 'grid': [round(s['start'], 2), round(s['end'], 2)], 'take': [round(ts, 2), round(te, 2)],
                         'ratio': round((te - ts) / max(.01, s['end'] - s['start']), 3)})
        res['sections'] = secs
        if a.vocals:
            yv, sr = librosa.load(a.vocals, sr=22050)
            f0, vf, _ = librosa.pyin(yv, fmin=150, fmax=900, sr=sr, frame_length=2048, hop_length=256)
            times = librosa.times_like(f0, sr=sr, hop_length=256)
            errs = []
            for v in m['vocal']:
                t0, t1 = f(v['start'] + .03), f(v['end'] - .03)
                sel = (times >= t0) & (times <= t1) & vf
                if sel.sum() < 3:
                    continue
                est = np.nanmedian(librosa.hz_to_midi(f0[sel]))
                d = (est - v['p'] + 6) % 12 - 6  # octave-folded semitone error
                errs.append(abs(d))
            errs = np.array(errs)
            res['pitch'] = {'n': int(len(errs)), 'within_1st': float(np.mean(errs <= 1)) if len(errs) else None,
                            'median_err': float(np.median(errs)) if len(errs) else None}
    if a.out:
        json.dump(res, open(a.out, 'w'), indent=1)
    if a.png:
        import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
        fig, ax = plt.subplots(figsize=(8, 6)); ax.plot(gt, tt, lw=1); ax.plot([0, gdur], [0, gdur], 'k--', lw=.5)
        ax.set_xlabel('guide (grid) s'); ax.set_ylabel('take s'); ax.grid(alpha=.3); plt.savefig(a.png, dpi=70)
    brief = {k: res[k] for k in ('guide_dur', 'take_dur', 'dtw_cost')}
    brief['pitch'] = res.get('pitch')
    print(json.dumps(brief))
    for s in res.get('sections', []):
        print(f"{s['name']:14s} grid {s['grid'][0]:6.1f}-{s['grid'][1]:6.1f}  take {s['take'][0]:6.1f}-{s['take'][1]:6.1f}  x{s['ratio']}")


if __name__ == '__main__':
    main()
