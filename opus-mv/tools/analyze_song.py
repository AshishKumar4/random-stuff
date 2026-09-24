#!/usr/bin/env python3
"""Objective 'ears' for a generated song.

Since the author can't listen, every take is scored with measurable proxies:
  - SongEval aesthetic model (coherence, memorability, vocal naturalness,
    structure clarity, musicality; 1-5 scale, trained on musician ratings)
  - lyric intelligibility: Whisper transcript of the demucs vocal stem vs the
    intended lyrics (word error rate + word timestamps for the video timeline)
  - tempo / beat grid stability, loudness (LUFS), clipping
  - energy curve + spectrogram PNG for visual inspection

usage: analyze_song.py AUDIO [--lyrics lyrics.txt] [--out DIR] [--no-songeval]
       [--no-sep] [--whisper large-v3]
"""
import argparse, json, os, re, subprocess, sys, time
import numpy as np

SONGEVAL_DIR = '/home/user/mvwork/SongEval'


def load(path, sr=44100):
    import librosa
    y, sr = librosa.load(path, sr=sr, mono=False)
    if y.ndim == 1:
        y = np.stack([y, y])
    return y, sr


def loudness(y, sr):
    import pyloudnorm as pyln
    meter = pyln.Meter(sr)
    lufs = meter.integrated_loudness(y.T)
    peak = float(np.max(np.abs(y)))
    clip = float(np.mean(np.abs(y) > 0.999))
    return {'lufs': round(float(lufs), 2), 'peak': round(peak, 4), 'clip_frac': clip}


def rhythm(mono, sr):
    import librosa
    tempo, beats = librosa.beat.beat_track(y=mono, sr=sr, units='time')
    tempo = float(np.atleast_1d(tempo)[0])
    ibi = np.diff(beats)
    stab = float(np.std(ibi) / np.mean(ibi)) if len(ibi) > 4 else None
    return {'tempo': round(tempo, 2), 'n_beats': int(len(beats)), 'ibi_cv': stab,
            'beats': [round(float(b), 3) for b in beats]}


def energy_curve(mono, sr, hop_s=0.5):
    import librosa
    hop = int(sr * hop_s)
    rms = librosa.feature.rms(y=mono, frame_length=hop * 2, hop_length=hop)[0]
    db = 20 * np.log10(rms + 1e-6)
    return [round(float(v), 1) for v in db]


def separate(path, out):
    stem_dir = os.path.join(out, 'htdemucs', os.path.splitext(os.path.basename(path))[0])
    voc = os.path.join(stem_dir, 'vocals.wav')
    if not os.path.exists(voc):
        subprocess.run([sys.executable, '-m', 'demucs', '--two-stems=vocals', '-n', 'htdemucs',
                        '-o', out, path], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return voc, os.path.join(stem_dir, 'no_vocals.wav')


def norm_words(s):
    s = s.lower().replace('’', "'")
    s = re.sub(r'\[[^\]]*\]', ' ', s)          # section tags
    s = re.sub(r'\([^)]*\)', ' ', s)            # ad-libs in parens are optional
    s = re.sub(r"[^a-z0-9' ]+", ' ', s)
    return s.split()


def wer(ref, hyp):
    import numpy as np
    r, h = ref, hyp
    d = np.zeros((len(r) + 1, len(h) + 1), dtype=np.int32)
    d[:, 0] = np.arange(len(r) + 1)
    d[0, :] = np.arange(len(h) + 1)
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + (r[i - 1] != h[j - 1]))
    return float(d[len(r), len(h)] / max(1, len(r)))


def transcribe(vocals, model_name, lyrics_text=None):
    from faster_whisper import WhisperModel
    model = WhisperModel(model_name, device='cpu', compute_type='int8', cpu_threads=os.cpu_count())
    prompt = None
    segs, info = model.transcribe(vocals, language='en', word_timestamps=True, vad_filter=True,
                                  beam_size=5, condition_on_previous_text=False, initial_prompt=prompt)
    words, text = [], []
    for s in segs:
        text.append(s.text)
        for w in (s.words or []):
            words.append({'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3), 'p': round(w.probability, 3)})
    return ' '.join(text).strip(), words


def songeval(path):
    sys.path.insert(0, SONGEVAL_DIR)
    cwd = os.getcwd()
    os.chdir(SONGEVAL_DIR)
    try:
        import torch, librosa
        from hydra.utils import instantiate
        from omegaconf import OmegaConf
        from safetensors.torch import load_file
        from muq import MuQ
        global _SE
        if '_SE' not in globals():
            cfg = OmegaConf.load('config.yaml')
            model = instantiate(cfg.generator).eval()
            model.load_state_dict(load_file('ckpt/model.safetensors'), strict=False)
            muq = MuQ.from_pretrained('OpenMuQ/MuQ-large-msd-iter').eval()
            _SE = (model, muq)
        model, muq = _SE
        wav, _ = librosa.load(path, sr=24000)
        with torch.no_grad():
            x = torch.tensor(wav).unsqueeze(0)
            out = muq(x, output_hidden_states=True)
            feat = out['hidden_states'][6]
            scores = model(feat).squeeze(0)
        names = ['coherence', 'musicality', 'memorability', 'clarity', 'naturalness']  # order from SongEval eval.py
        vals = [round(float(v), 3) for v in scores]
        return dict(zip(names, vals)) | {'mean': round(float(np.mean(vals)), 3)}
    finally:
        os.chdir(cwd)


def plot(mono, sr, energy, out_png, words=None, title=''):
    import librosa, librosa.display
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    fig, ax = plt.subplots(2, 1, figsize=(22, 7), sharex=True, gridspec_kw={'height_ratios': [3, 1]})
    S = librosa.amplitude_to_db(np.abs(librosa.stft(mono[: sr * 400], n_fft=2048, hop_length=1024)), ref=np.max)
    librosa.display.specshow(S, sr=sr, hop_length=1024, x_axis='time', y_axis='log', ax=ax[0], cmap='magma')
    ax[0].set_title(title)
    t = np.arange(len(energy)) * 0.5
    ax[1].plot(t, energy, color='k')
    ax[1].set_ylabel('RMS dB')
    if words:
        for w in words[::4]:
            ax[1].text(w['s'], min(energy) + 2, w['w'], fontsize=6, rotation=90)
    ax[1].set_xticks(np.arange(0, t[-1] + 1, 5))
    ax[1].grid(alpha=.3)
    plt.tight_layout()
    plt.savefig(out_png, dpi=70)
    plt.close(fig)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('audio')
    ap.add_argument('--lyrics')
    ap.add_argument('--out')
    ap.add_argument('--whisper', default='large-v3')
    ap.add_argument('--no-songeval', action='store_true')
    ap.add_argument('--no-sep', action='store_true')
    ap.add_argument('--no-asr', action='store_true')
    a = ap.parse_args()
    out = a.out or os.path.splitext(a.audio)[0] + '_analysis'
    os.makedirs(out, exist_ok=True)
    t0 = time.time()
    y, sr = load(a.audio)
    mono = y.mean(0)
    res = {'file': a.audio, 'duration': round(y.shape[1] / sr, 2)}
    res['loudness'] = loudness(y, sr)
    res['rhythm'] = rhythm(mono, sr)
    energy = energy_curve(mono, sr)
    res['energy_db_0p5s'] = energy
    if not a.no_songeval:
        try:
            res['songeval'] = songeval(a.audio)
        except Exception as e:
            res['songeval_error'] = repr(e)
    words = None
    if not a.no_asr:
        voc = a.audio
        if not a.no_sep:
            voc, inst = separate(a.audio, out)
            res['stems'] = {'vocals': voc, 'instrumental': inst}
        text, words = transcribe(voc, a.whisper)
        res['transcript'] = text
        res['words'] = words
        if a.lyrics:
            ref = norm_words(open(a.lyrics).read())
            hyp = norm_words(text)
            res['wer'] = round(wer(ref, hyp), 3)
            res['n_ref_words'] = len(ref)
            res['n_hyp_words'] = len(hyp)
    plot(mono, 22050 if False else sr, energy, os.path.join(out, 'overview.png'), words, os.path.basename(a.audio))
    res['elapsed_s'] = round(time.time() - t0, 1)
    with open(os.path.join(out, 'analysis.json'), 'w') as f:
        json.dump(res, f, indent=1)
    brief = {k: res.get(k) for k in ['duration', 'loudness', 'songeval', 'songeval_error', 'wer', 'elapsed_s']}
    brief['tempo'] = res['rhythm']['tempo']
    brief['ibi_cv'] = res['rhythm']['ibi_cv']
    print(json.dumps(brief))


if __name__ == '__main__':
    main()
