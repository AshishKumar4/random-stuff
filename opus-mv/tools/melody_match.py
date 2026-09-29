#!/usr/bin/env python3
"""How closely does a take sing my composed melody? Separates vocals (demucs), pitch-tracks them (pyin),
and compares the sung contour to the MIDI melody, transposition- and tempo-invariant (DTW on pitch
relative to each melody's median, in semitones). Can search a window of the take for the best match
(e.g. find where the chorus hook is sung).

usage: melody_match.py TAKE.(wav|mp3) MELODY.mid [--vocals vocals.wav] [--win SECONDS] [--hop 2]
prints: best window start, mean abs semitone error after best transposition, contour correlation,
and a note-by-note comparison of the sung notes vs mine.
"""
import argparse, os, subprocess, sys
import numpy as np
import librosa
import pretty_midi


def vocals_of(path, out_dir):
    stem = os.path.splitext(os.path.basename(path))[0]
    v = os.path.join(out_dir, 'htdemucs', stem, 'vocals.wav')
    if not os.path.exists(v):
        subprocess.run([sys.executable, '-m', 'demucs', '--two-stems', 'vocals', '-o', out_dir, path], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return v


def midi_curve(mid, hop):
    pm = pretty_midi.PrettyMIDI(mid)
    notes = sorted(pm.instruments[0].notes, key=lambda n: n.start)
    T = notes[-1].end
    t = np.arange(0, T, hop)
    f = np.full(len(t), np.nan)
    for n in notes:
        f[(t >= n.start) & (t < n.end)] = n.pitch
    return t, f, notes


def dtw_cost(a, b):
    n, m = len(a), len(b)
    D = np.full((n + 1, m + 1), np.inf); D[0, 0] = 0
    for i in range(1, n + 1):
        ai = a[i - 1]
        row = np.abs(ai - b)
        for j in range(1, m + 1):
            D[i, j] = row[j - 1] + min(D[i - 1, j], D[i, j - 1], D[i - 1, j - 1])
    return D[n, m] / (n + m)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('take'); ap.add_argument('mid'); ap.add_argument('--vocals'); ap.add_argument('--win', type=float)
    ap.add_argument('--hop', type=float, default=2.0); ap.add_argument('--sep-dir', default=None)
    ap.add_argument('--task', help='Mureka task JSON: align by sung word timestamps instead of DTW')
    ap.add_argument('--spec', help='melody_midi spec JSON (syllables; a syllable ending in - continues the word)')
    ap.add_argument('--section', default='chorus', help='section_type whose words to compare (first occurrence)')
    ap.add_argument('--choice', type=int, default=0)
    a = ap.parse_args()
    if a.task:
        return by_words(a)
    v = a.vocals or vocals_of(a.take, a.sep_dir or os.path.join(os.path.dirname(os.path.abspath(a.take)), 'sep'))
    y, sr = librosa.load(v, sr=16000, mono=True)
    H = 0.02
    f0, vf, _ = librosa.pyin(y, fmin=110, fmax=1000, sr=sr, frame_length=1024, hop_length=int(H * sr))
    sung = librosa.hz_to_midi(f0)
    sung[~vf] = np.nan
    tm, fm, notes = midi_curve(a.mid, H)
    L = len(fm)
    win = int((a.win or tm[-1] * 1.0) / H)
    best = None
    # downsample to 0.1 s for DTW speed; compare voiced frames only, relative to median
    ds = 5

    def prep(x):
        x = x[::ds]; x = x[~np.isnan(x)]
        return x - np.median(x) if len(x) else x
    mm = prep(fm)
    for s0 in np.arange(0, max(1, len(sung) - win + 1), int(a.hop / H)):
        seg = sung[s0:s0 + win]
        ss = prep(seg)
        if len(ss) < len(mm) * .4:
            continue
        c = dtw_cost(ss, mm)
        if best is None or c < best[0]:
            best = (c, s0 * H)
    if best is None:
        print('no voiced vocal found'); return
    c, st = best
    seg = sung[int(st / H):int(st / H) + win]
    # coarse note-level view: median sung pitch over each of my notes' spans (time-scaled to the window)
    scale = (len(seg) * H) / tm[-1]
    rel = []
    for n in notes:
        a0, a1 = int(n.start * scale / H), int(n.end * scale / H)
        p = np.nanmedian(seg[a0:a1]) if np.any(~np.isnan(seg[a0:a1])) else np.nan
        rel.append((n.pitch, p))
    mine = np.array([r[0] for r in rel], float); got = np.array([r[1] for r in rel], float)
    ok = ~np.isnan(got)
    shift = np.median(got[ok] - mine[ok]) if ok.any() else 0
    err = np.abs(got[ok] - shift - mine[ok])
    corr = np.corrcoef(got[ok], mine[ok])[0, 1] if ok.sum() > 2 else float('nan')
    print(f'best window starts {st:.1f}s  dtw {c:.2f} st/frame  note-level: mean |err| {err.mean():.2f} st, '
          f'within 1 st {np.mean(err <= 1):.0%}, contour r {corr:.2f}, transposition {shift:+.1f} st')
    print('mine: ' + ' '.join(pretty_midi.note_number_to_name(int(p)) for p in mine))
    print('sung: ' + ' '.join('--' if np.isnan(g) else pretty_midi.note_number_to_name(int(round(g - shift))) for g in got))


def by_words(a):
    import json
    q = json.load(open(a.task)); ch = q['choices'][a.choice]
    v = a.vocals or vocals_of(a.take, a.sep_dir or os.path.join(os.path.dirname(os.path.abspath(a.take)), 'sep'))
    y, sr = librosa.load(v, sr=16000, mono=True)
    H = 0.01
    f0, vf, _ = librosa.pyin(y, fmin=110, fmax=1000, sr=sr, frame_length=1024, hop_length=int(H * sr))
    sung = librosa.hz_to_midi(f0); sung[~vf] = np.nan
    S = json.load(open(a.spec))
    import importlib.util
    spec_ = importlib.util.spec_from_file_location('mm', os.path.join(os.path.dirname(__file__), 'melody_midi.py'))
    mm = importlib.util.module_from_spec(spec_); spec_.loader.exec_module(mm)
    words, cur = [], []
    for ph in S['phrases']:
        for n in ph:
            if str(n[0]).lower() == 'r':
                continue
            cur.append(mm.to_midi(n[0], S.get('key', 'A'), S.get('mode', 'minor'), S.get('octave', 4)))
            syl = n[2] if len(n) > 2 else ''
            if not syl.endswith('-'):
                words.append(cur); cur = []
    secs = [s for s in ch['lyrics_sections'] if s['section_type'] == a.section and s.get('lines')]
    if not secs:
        print('no such section'); return
    sw = [w for L in secs[0]['lines'] for w in L['words'] if w['text'].strip()]
    rows = []
    for k, notes in enumerate(words[:len(sw)]):
        s0 = sw[k]['start'] / 1000; s1 = sw[k + 1]['start'] / 1000 if k + 1 < len(sw) else s0 + .6
        s1 = min(s1, s0 + 1.5)
        for j, p in enumerate(notes):
            a0 = s0 + (s1 - s0) * j / len(notes); a1 = s0 + (s1 - s0) * (j + 1) / len(notes)
            seg = sung[int(a0 / H):int(a1 / H)]
            g = np.nanmedian(seg) if np.any(~np.isnan(seg)) else np.nan
            rows.append((sw[k]['text'].strip(), p, g))
    mine = np.array([r[1] for r in rows], float); got = np.array([r[2] for r in rows], float)
    ok = ~np.isnan(got)
    d = got[ok] - mine[ok]
    shift = 12 * np.round(np.median(d) / 12) + np.median(((d - 12 * np.round(np.median(d) / 12)) + 6) % 12 - 6)
    err = np.abs(got[ok] - shift - mine[ok])
    iv_m = np.diff(mine[ok]); iv_g = np.diff(got[ok])
    dir_ok = np.mean(np.sign(np.round(iv_m)) == np.sign(np.round(iv_g))) if len(iv_m) else float('nan')
    print(f'{a.section}: {len(rows)} notes, voiced {ok.mean():.0%}, mean |err| {err.mean():.2f} st, within 1 st {np.mean(err <= 1):.0%}, '
          f'contour direction agreement {dir_ok:.0%}, transposition {shift:+.1f} st')
    for (w, p, g) in rows:
        print(f'  {w:12s} mine {pretty_midi.note_number_to_name(int(p)):4s} sung {"--" if np.isnan(g) else pretty_midi.note_number_to_name(int(round(g - shift)))}')


if __name__ == '__main__':
    main()
