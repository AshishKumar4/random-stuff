#!/usr/bin/env python3
"""Tighten a take by removing whole bars of instrumental interlude, beat-snapped with equal-power
crossfades, and remap a Mureka task JSON's timestamps to the edited clock.

usage: edit_song.py IN.wav TASK.json INDEX OUT_DIR --cut 2.0-9.8 --cut 110.4-124.0 [--xfade .25] [--bars]
Each --cut a-b removes [a, b). With --bars, a and b snap to the nearest tracked downbeats (4-beat bars
estimated from the beat grid phase with the strongest onset energy). Writes OUT_DIR/song_edit.wav and
OUT_DIR/task_edit.json (same schema, times shifted, words inside cuts dropped), and prints the map.
"""
import argparse, copy, json, os
import numpy as np
import soundfile as sf


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('inp'); ap.add_argument('task'); ap.add_argument('index', type=int); ap.add_argument('out')
    ap.add_argument('--cut', action='append', default=[]); ap.add_argument('--xfade', type=float, default=.25)
    ap.add_argument('--bars', action='store_true'); ap.add_argument('--tail', type=float, help='end the song at this (edited) time with a fade')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    y, sr = sf.read(a.inp, always_2d=True)
    cuts = [tuple(map(float, c.split('-'))) for c in a.cut]
    if a.bars:
        import librosa
        mono = y.mean(1)
        yb = librosa.resample(mono, orig_sr=sr, target_sr=22050)
        _, beats = librosa.beat.beat_track(y=yb, sr=22050, units='time', tightness=120)
        env = librosa.onset.onset_strength(y=yb, sr=22050)
        et = librosa.times_like(env, sr=22050)
        strength = [sum(np.interp(beats[p::4], et, env)) for p in range(4)]
        down = beats[int(np.argmax(strength))::4]
        snap = lambda t: float(down[np.argmin(np.abs(down - t))])
        cuts = [(snap(c0), snap(c1)) for c0, c1 in cuts]
    cuts = sorted(c for c in cuts if c[1] > c[0])
    xf = int(a.xfade * sr)
    keep, pos = [], 0.0
    for c0, c1 in cuts:
        keep.append((pos, c0)); pos = c1
    keep.append((pos, len(y) / sr))
    out = None
    for (k0, k1) in keep:
        seg = y[int(k0 * sr):int(k1 * sr)].copy()
        if out is None:
            out = seg; continue
        n = min(xf, len(seg), len(out))
        w = np.linspace(0, np.pi / 2, n)[:, None]
        # the incoming segment starts xfade early (overlap the tail of the removed region's boundary)
        pre = y[max(0, int(k0 * sr) - n):int(k0 * sr)]
        if len(pre) == n:
            mixed = out[-n:] * np.cos(w) ** 2 + pre * np.sin(w) ** 2
            out = np.vstack([out[:-n], mixed, seg])
        else:
            out = np.vstack([out, seg])
    if a.tail:
        end = int(a.tail * sr); f = int(1.5 * sr)
        out = out[:end]; out[-f:] *= np.linspace(1, 0, f)[:, None] ** 2
    sf.write(os.path.join(a.out, 'song_edit.wav'), out, sr, subtype='FLOAT')

    def remap(t):  # original seconds -> edited seconds (None if inside a cut)
        shift = 0.0
        for c0, c1 in cuts:
            if t >= c1: shift += c1 - c0
            elif t >= c0: return None
        return t - shift

    q = json.load(open(a.task)); q2 = copy.deepcopy(q)
    ch = q2['choices'][a.index]
    for s in ch.get('lyrics_sections', []):
        for L in s.get('lines', []):
            for w in L.get('words', []):
                ns, ne = remap(w['start'] / 1000), remap(w['end'] / 1000)
                w['start'] = int(round(ns * 1000)) if ns is not None else -1
                w['end'] = int(round(ne * 1000)) if ne is not None else w['start']
            L['words'] = [w for w in L.get('words', []) if w['start'] >= 0]
            if L['words']:
                L['start'], L['end'] = L['words'][0]['start'], L['words'][-1]['end']
        s['lines'] = [L for L in s.get('lines', []) if L.get('words')]
        if s['lines']:
            s['start'] = min(s['start'] if remap(s['start'] / 1000) is None else int(remap(s['start'] / 1000) * 1000), s['lines'][0]['start'])
            s['end'] = s['lines'][-1]['end']
    ch['duration'] = int(len(out) / sr * 1000)
    q2['choices'] = [ch]
    json.dump(q2, open(os.path.join(a.out, 'task_edit.json'), 'w'), indent=1, ensure_ascii=False)
    print(json.dumps({'cuts': [[round(c0, 3), round(c1, 3)] for c0, c1 in cuts], 'duration': round(len(out) / sr, 2)}))


if __name__ == '__main__':
    main()
