#!/usr/bin/env python3
"""Master the chosen take onto the storyboard's audio contract (BIBLE §4.2 post chain).

- chant-2 floor drop: fade to -18 dB (with a low-pass feel via a 1-pole LPF blend) from 95.6 to 97.45 s
- the WHITE beat: digital silence 119.53-120.00 s (8 ms fade out, 3 ms fade in on the bang)
- hard cut 60 ms into the sung "yes" (onset detected on the vocal stem near 140.16 s), 2 ms ramp
- pad with silence to 144.000 s
- loudness: -10 LUFS integrated, true-peak ceiling -1 dBTP (ffmpeg loudnorm, 2 pass)
usage: master.py take.wav vocals.wav OUT_DIR [--yes 140.16] [--no-white]
"""
import argparse, json, os, subprocess
import numpy as np
import soundfile as sf


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('take'); ap.add_argument('vocals'); ap.add_argument('out')
    ap.add_argument('--yes', type=float, default=140.16)
    ap.add_argument('--total', type=float, default=144.0)
    ap.add_argument('--lufs', type=float, default=-10.0)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    y, sr = sf.read(a.take, always_2d=True)
    y = y.astype(np.float64)
    n = lambda t: int(round(t * sr))

    def ramp(t0, t1, g0, g1):
        i0, i1 = n(t0), n(t1)
        y[i0:i1] *= np.linspace(g0, g1, max(1, i1 - i0))[:, None]

    # chant-2 floor drop
    i0, i1 = n(95.6), n(97.45)
    seg = y[i0:i1].copy()
    lp = np.zeros_like(seg); acc = np.zeros(seg.shape[1]); k = .08
    for i in range(len(seg)):
        acc += k * (seg[i] - acc); lp[i] = acc
    w = np.linspace(0, 1, len(seg))[:, None]
    y[i0:i1] = seg * (1 - w) + lp * w
    ramp(95.6, 97.45, 1.0, 10 ** (-18 / 20))
    ramp(97.45, 97.5, 10 ** (-18 / 20), 1.0)
    # the WHITE beat
    ramp(119.53 - .008, 119.53, 1, 0)
    y[n(119.53):n(120.0)] = 0
    ramp(120.0, 120.003, 0, 1)
    # hard cut into "yes"
    import librosa
    v, vsr = librosa.load(a.vocals, sr=22050, offset=a.yes - .6, duration=1.2)
    on = librosa.onset.onset_detect(y=v, sr=vsr, hop_length=128, units='time', backtrack=True) + a.yes - .6
    cand = [o for o in on if abs(o - a.yes) < .45]
    yes_on = min(cand, key=lambda o: abs(o - a.yes)) if cand else a.yes
    cut = yes_on + .06
    ramp(cut - .002, cut, 1, 0)
    y[n(cut):] = 0
    total = n(a.total)
    if len(y) < total:
        y = np.vstack([y, np.zeros((total - len(y), y.shape[1]))])
    y = y[:total]
    raw = os.path.join(a.out, 'song_premaster.wav')
    sf.write(raw, y, sr, subtype='FLOAT')
    # loudness (2-pass loudnorm), then trim to exact length
    p1 = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', f'loudnorm=I={a.lufs}:TP=-1.0:LRA=9:print_format=json', '-f', 'null', '-'],
                        capture_output=True, text=True).stderr
    js = json.loads(p1[p1.rfind('{'):p1.rfind('}') + 1])
    af = (f"loudnorm=I={a.lufs}:TP=-1.0:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
          f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,aresample=48000")
    wav = os.path.join(a.out, 'song.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', af, '-t', str(a.total), '-ar', '48000', '-c:a', 'pcm_s16le', wav], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '256k', os.path.join(a.out, 'song.mp3')], check=True)
    print(json.dumps({'yes_onset': round(float(yes_on), 3), 'cut': round(float(cut), 3), 'input_lufs': js['input_i'], 'target': a.lufs}))


if __name__ == '__main__':
    main()
