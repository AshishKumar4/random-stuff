#!/usr/bin/env python3
"""Render a composition (tools/musiclib Song) to a guide demo:
  guide_inst.wav   - all non-vocal tracks through FluidSynth (GM soundfont)
  guide_vocal.wav  - robot guide singer: espeak-ng words, re-pitched/re-timed with WORLD
                     to the exact melody notes, so a cover model hears lyrics on the melody
  guide_mix.wav    - both, loudness-normalised
  guide_lead.wav   - instrumental + the melody on a synth lead (no words)
  melody.json      - note/syllable/section timeline (seconds) for the video

usage: render_guide.py composition.py OUTDIR
The composition file must define build() -> musiclib.Song.
"""
import importlib.util, json, os, re, subprocess, sys, tempfile
import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.dirname(__file__))
import musiclib  # noqa: E402

SF2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'
SR = 44100


def load_song(path):
    spec = importlib.util.spec_from_file_location('composition', path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m.build()


def fluid(midi, wav, gain=0.6):
    subprocess.run(['fluidsynth', '-ni', '-g', str(gain), '-r', str(SR), '-F', wav, SF2, midi],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    y, _ = sf.read(wav)
    return y if y.ndim == 2 else np.stack([y, y], 1)


def midi_without(song, keep, path):
    import copy
    s2 = copy.copy(song)
    s2.tracks = {k: v for k, v in song.tracks.items() if keep(k)}
    s2.write_midi(path)


_KOKORO = None
_KCACHE = {}


def tts_word(word, voice='af_heart', speed=0.85):
    """Natural isolated-word TTS (Kokoro-82M); falls back to espeak-ng."""
    global _KOKORO
    key = (word.lower(), voice)
    if key in _KCACHE:
        return _KCACHE[key]
    try:
        if _KOKORO is None:
            from kokoro import KPipeline
            _KOKORO = KPipeline(lang_code='a')
        parts = [a.numpy() if hasattr(a, 'numpy') else np.asarray(a) for _, _, a in _KOKORO(word, voice=voice, speed=speed)]
        y = np.concatenate(parts).astype(np.float64)
        _KCACHE[key] = (y, 24000)
        return _KCACHE[key]
    except Exception as e:  # noqa
        print('kokoro failed, espeak fallback:', e)
        return tts_word_espeak(word)


def tts_word_espeak(word, voice='en-us+f4', speed=120):
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
        p = f.name
    subprocess.run(['espeak-ng', '-v', voice, '-s', str(speed), '-w', p, word], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    y, sr = sf.read(p)
    os.unlink(p)
    return y.astype(np.float64), sr


def sing_word(word, notes, fs=SR, voice='af_heart'):
    """notes: list of (dur_s, midi) for each syllable/melisma note of the word."""
    import pyworld as pw
    import librosa
    y, sr = tts_word(word, voice)
    y = librosa.resample(y, orig_sr=sr, target_sr=fs)
    # trim silence
    thr = 0.02 * np.max(np.abs(y) + 1e-9)
    idx = np.where(np.abs(y) > thr)[0]
    if len(idx):
        y = y[max(0, idx[0] - 200): idx[-1] + 200]
    fp = 5.0
    f0, t = pw.harvest(y, fs, frame_period=fp, f0_floor=70, f0_ceil=800)
    sp = pw.cheaptrick(y, f0, t, fs)
    ap = pw.d4c(y, f0, t, fs)
    total = sum(d for d, _ in notes)
    n_out = max(4, int(round(total * 1000 / fp)))
    src_idx = np.linspace(0, len(f0) - 1, n_out)
    lo = np.floor(src_idx).astype(int)
    hi = np.minimum(lo + 1, len(f0) - 1)
    w = (src_idx - lo)[:, None]
    sp2 = sp[lo] * (1 - w) + sp[hi] * w
    ap2 = ap[lo] * (1 - w) + ap[hi] * w
    voiced = (f0[lo] > 0) | (f0[hi] > 0)
    # sustain vowels: widen voicing to cover long notes (espeak words are short)
    tgt = np.zeros(n_out)
    k = 0
    for d, p in notes:
        n = int(round(d * 1000 / fp))
        hz = 440.0 * 2 ** ((p - 69) / 12)
        seg = np.full(n, hz)
        if d > 0.35:  # gentle delayed vibrato on long notes
            tt = np.arange(n) * fp / 1000
            seg *= 2 ** ((0.25 * np.clip((tt - 0.2) / 0.3, 0, 1) * np.sin(2 * np.pi * 5.5 * tt)) / 12)
        tgt[k:k + n] = seg[: max(0, min(n, n_out - k))]
        k += n
    tgt[k:] = tgt[k - 1] if k > 0 else 220
    # portamento between notes
    sm = np.convolve(np.log(tgt + 1e-6), np.ones(7) / 7, mode='same')
    tgt = np.exp(sm)
    f0o = np.where(voiced, tgt, 0.0)
    out = pw.synthesize(np.ascontiguousarray(f0o), np.ascontiguousarray(sp2), np.ascontiguousarray(ap2), fs, fp)
    fade = min(len(out), 441)
    out[-fade:] *= np.linspace(1, 0, fade)
    return out


def guide_vocal(song, total_s, voice='af_heart'):
    tl = song.timeline()
    buf = np.zeros(int((total_s + 2) * SR))
    # group syllables into words: a syllable ending with '-' continues into the next
    words, cur = [], None
    for v in tl['vocal']:
        syl = v['syl']
        notes = [(song.seconds(n['d']), n['p']) for n in v['notes']]
        if cur is None:
            cur = {'text': '', 'start': v['start'], 'notes': []}
        cur['text'] += syl.rstrip('-')
        cur['notes'] += notes
        if not syl.endswith('-'):
            words.append(cur)
            cur = None
    for w in words:
        text = re.sub(r"[^A-Za-z' ]", '', w['text']) or 'la'
        try:
            y = sing_word(text, w['notes'], voice=voice)
        except Exception as e:  # noqa
            print('sing fail', text, e)
            continue
        i = int(w['start'] * SR)
        buf[i:i + len(y)] += y[: len(buf) - i]
    m = np.max(np.abs(buf)) + 1e-9
    return buf / m * 0.8


def norm_lufs(y, target=-14.0):
    import pyloudnorm as pyln
    meter = pyln.Meter(SR)
    l = meter.integrated_loudness(y)
    y = pyln.normalize.loudness(y, l, target)
    peak = np.max(np.abs(y))
    if peak > 0.98:
        y = y / peak * 0.98
    return y


def main():
    comp, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    song = load_song(comp)
    tl = song.timeline()
    with open(os.path.join(out, 'melody.json'), 'w') as f:
        json.dump(tl, f, indent=1)
    song.write_midi(os.path.join(out, 'full.mid'))
    total = tl['duration']
    midi_without(song, lambda k: k != 'vocal_guide', os.path.join(out, 'inst.mid'))
    inst = fluid(os.path.join(out, 'inst.mid'), os.path.join(out, 'guide_inst.wav'))
    midi_without(song, lambda k: True, os.path.join(out, 'lead.mid'))
    lead = fluid(os.path.join(out, 'lead.mid'), os.path.join(out, '_lead_raw.wav'))
    sf.write(os.path.join(out, 'guide_lead.wav'), norm_lufs(lead), SR)
    os.unlink(os.path.join(out, '_lead_raw.wav'))
    voc = guide_vocal(song, total)
    sf.write(os.path.join(out, 'guide_vocal.wav'), voc, SR)
    n = max(len(inst), len(voc))
    mix = np.zeros((n, 2))
    mix[:len(inst)] += inst
    mix[:len(voc), 0] += voc * 0.9
    mix[:len(voc), 1] += voc * 0.9
    mix = mix[: int((total + 1.5) * SR)]
    sf.write(os.path.join(out, 'guide_mix.wav'), norm_lufs(mix), SR)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(out, 'guide_mix.wav'), '-b:a', '192k',
                    os.path.join(out, 'guide_mix.mp3')], check=True)
    print(json.dumps({'duration': total, 'sections': [(s['name'], round(s['start'], 2)) for s in tl['sections']],
                      'syllables': len(tl['vocal'])}))


if __name__ == '__main__':
    main()
