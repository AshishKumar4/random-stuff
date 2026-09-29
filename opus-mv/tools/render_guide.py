#!/usr/bin/env python3
"""Render a composition (tools/musiclib Song) to a guide demo:
  guide_inst.wav   - all non-vocal tracks through FluidSynth (GM soundfont)
  guide_vocal.wav  - robot guide singer: Kokoro (espeak-ng fallback) words, re-pitched/re-timed with
                     WORLD to the exact melody notes, so a cover model hears lyrics on the melody
  guide_mix.wav    - both, loudness-normalised
  guide_lead.wav   - instrumental + the melody on a synth lead (no words)
  melody.json      - note/syllable/section timeline (seconds) for the video

usage: render_guide.py composition.py OUTDIR
The composition file must define build() -> musiclib.Song. Optional attributes on the Song:
  song.vocal_gain = [(beat_from, beat_to, dB), ...]  gain for the words that start in each span
  song.tts_say    = {'P': 'pee', ...}                what the TTS is fed for a sung word

The singer (revised 2026-09-29 after the v3 guide review; it used to stretch whole words uniformly):
  - each syllable of the spoken word is found (its vowel peak at the sung pitch) and warped onto its own
    notes; a long note stretches only the vowel core, consonants and glides are never stretched (70% of
    their spoken length, less on a short note), so a held "hi" speaks on its beat and a held "yes" does
    not hiss for half a second;
  - the word's unvoiced onset and coda (s, st, sh, p, t, k, h ...) are spliced back from the spoken audio,
    because WORLD smears a plosive burst into a fricative;
  - the ~30-110 ms vowel-like blip Kokoro puts in front of a word's first consonant is cut
    ("(uh)still" -> "still", "(uh)back" -> "back");
  - every word is levelled to the same vowel loudness, then song.vocal_gain, through a per-word peak
    limiter, instead of keeping the TTS's own falling phrase-final energy;
  - Kokoro is seeded per word, so a render is repeatable.
"""
import importlib.util, json, os, re, subprocess, sys, tempfile, warnings
import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.dirname(__file__))
import musiclib  # noqa: E402

SF2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'
SR = 44100
FP = 5.0                 # WORLD frame period, ms
VOWEL_DBFS = -18.0       # RMS of each word's vowel frames at 0 dB gain
UNVOICED_ONSET = set('stkphfθʃʧ')   # misaki phonemes that start a word unvoiced
STOP_ONSET = set('ptkbdɡʧʤ')          # ... or with a stop closure


def load_song(path):
    spec = importlib.util.spec_from_file_location('composition', path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m.build()


def fluid(midi, wav, gain=0.6):
    """FluidSynth fast render, in float so a loud passage can pass full scale without clipping."""
    subprocess.run(['fluidsynth', '-ni', '-g', str(gain), '-r', str(SR), '-O', 'float', '-F', wav, SF2, midi],
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
    """Natural isolated-word TTS (Kokoro-82M): (audio, sr, phonemes); falls back to espeak-ng."""
    global _KOKORO
    key = (word.lower(), voice)
    if key in _KCACHE:
        return _KCACHE[key]
    try:
        if _KOKORO is None:
            with warnings.catch_warnings():   # torch deprecation notices from inside the Kokoro model code
                warnings.simplefilter('ignore')
                from kokoro import KPipeline
                _KOKORO = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M')
        import torch
        torch.manual_seed(0)                      # Kokoro's vocoder adds noise: seed it per word
        out = list(_KOKORO(word, voice=voice, speed=speed))
        y = np.concatenate([a.numpy() if hasattr(a, 'numpy') else np.asarray(a) for _, _, a in out]).astype(np.float64)
        _KCACHE[key] = (y, 24000, ''.join(ph for _, ph, _ in out))
        return _KCACHE[key]
    except Exception as e:  # noqa
        print('kokoro failed, espeak fallback:', e)
        y, sr = tts_word_espeak(word)
        return y, sr, None


def tts_word_espeak(word, voice='en-us+f4', speed=120):
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
        p = f.name
    subprocess.run(['espeak-ng', '-v', voice, '-s', str(speed), '-w', p, word], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    y, sr = sf.read(p)
    os.unlink(p)
    return y.astype(np.float64), sr


def _runs(mask):
    """[(start, end)) of the True runs of a boolean array."""
    d = np.diff(np.concatenate([[0], mask.astype(int), [0]]))
    return list(zip(np.where(d == 1)[0], np.where(d == -1)[0]))


def analyse(y, fs, ph):
    """WORLD analysis of one spoken word, with Kokoro's lead-in blip and the silent tail removed.
    Returns f0, sp, ap, per (periodic frames), e (low-band energy, dB re the word's peak), cut (ms)."""
    import pyworld as pw
    f0, t = pw.harvest(y, fs, frame_period=FP, f0_floor=70, f0_ceil=800)
    sp = pw.cheaptrick(y, f0, t, fs)
    ap = pw.d4c(y, f0, t, fs)
    fr = np.arange(sp.shape[1]) * fs / ((sp.shape[1] - 1) * 2)
    band = (fr >= 80) & (fr < 1500)
    per = (ap[:, band].mean(1) < 0.3) & (f0 > 0)          # periodic (voiced) frames
    e = 10 * np.log10(sp[:, band].sum(1) + 1e-20)         # low-band energy, where the vowels are
    e -= e.max()
    eb = 10 * np.log10(sp.sum(1) + 1e-20)                 # broadband energy (keeps a final /s/)
    eb -= eb.max()
    lo = 0
    # Kokoro's lead-in blip: a short voiced burst right at the start of a word that begins with a
    # consonant, then the consonant itself (unvoiced noise, or a stop's closure), then the real vowel.
    first = (ph or '').lstrip('ˈˌ')[:1]
    if first in UNVOICED_ONSET:                  # periodic burst, then an aperiodic gap
        runs = [r for r in _runs(per & (e > -30)) if r[1] - r[0] >= 2]
        if len(runs) >= 2:
            (a0, a1), (b0, _) = runs[0], runs[1]
            if a0 * FP <= 25 and (a1 - a0) * FP <= 130 and (b0 - a1) * FP >= 25:
                lo = a1
    if not lo and first in STOP_ONSET:           # loud burst, then the closure: a dip of 10 dB or more
        on = np.where(eb > -25)[0]
        if len(on) and on[0] * FP <= 25:
            a0 = on[0]
            a1 = a0 + 1
            while a1 < len(eb) and (a1 - a0) * FP <= 130 and eb[a1] > eb[a0:a1].max() - 8:
                a1 += 1
            win = eb[a1:a1 + 30]
            if (a1 - a0) * FP <= 130 and len(win) and win.min() < eb[a0:a1].max() - 10 \
                    and per[a0:a1].mean() > .6 and eb[a1:].max() > eb[a0:a1].max() - 3:
                lo = a1
    hi = len(f0)
    loud = np.where(eb > -40)[0]
    if len(loud):
        hi = min(hi, loud[-1] + 5)                       # drop the near-silent tail (keep 25 ms)
    return f0[lo:hi], sp[lo:hi], ap[lo:hi], per[lo:hi], e[lo:hi], lo * FP


def syllable_bounds(per, eh, m):
    """Split a spoken word's frames into m syllables at the energy dips between m vowel peaks (eh: energy at
    the sung pitch's harmonics, dB re the word's loudest frame). Of the candidate peaks, the most prominent
    set whose every syllable holds a real vowel (30 ms of voiced frames within 12 dB of the word's loudest)
    wins, so a click at the onset can't pose as a syllable. None if no such split exists."""
    from itertools import combinations
    from scipy.signal import find_peaks
    if m <= 1:
        return [0, len(eh)]
    x = np.where(per, eh, eh - 20)
    x = np.convolve(x, np.ones(5) / 5, mode='same')
    pk, prop = find_peaks(x, prominence=3, distance=8)
    cand = sorted([(pr, p) for p, pr in zip(pk, prop['prominences']) if per[p] and x[p] > -25], reverse=True)[:m + 3]
    best = None
    for combo in combinations(cand, m):
        ps = sorted(p for _, p in combo)
        b = [0] + [int(a + np.argmin(x[a:c])) for a, c in zip(ps, ps[1:])] + [len(eh)]
        if all(np.sum(per[a:c] & (eh[a:c] > -12)) >= 6 for a, c in zip(b, b[1:])):
            score = sum(pr for pr, _ in combo)
            if best is None or score > best[0]:
                best = (score, b)
    return best[1] if best else None


def harmonic_energy(sp, fs, hz):
    """Per-frame energy (dB re its max) of a spectral envelope sampled at the harmonics of `hz`:
    how loud each frame will be when it is re-sung at that pitch (a high note skips a low F1)."""
    step = fs / ((sp.shape[1] - 1) * 2)
    bins = [int(round(k * hz / step)) for k in range(1, max(2, int(5000 / hz) + 1))]
    x = 10 * np.log10(sp[:, bins].sum(1) + 1e-20)
    return x - x.max()


def warp_segment(per, eh, n_out):
    """Fractional source frames (0..n-1) for n_out output frames of one syllable, sung the way a singer
    times it: the vowel core (periodic frames within 6 dB of the syllable's loudest one at the sung pitch)
    takes the note, and everything else (consonants, glides, releases) is never stretched: it keeps 70% of
    its spoken length, or down to 40% when the note is short. Only a very short note squeezes the vowel."""
    n = len(eh)
    core = per & (eh > eh[per].max() - 6) if per.any() else np.zeros(n, bool)
    nv, rest = int(core.sum()), n - int(core.sum())
    if n < 2 or nv < 3:
        return np.linspace(0, n - 1, n_out)
    kr = 0.7
    if rest * kr + nv > n_out:
        kr = max(0.4, (n_out - nv) / max(rest, 1))
    kv = (n_out - rest * kr) / nv
    if kv < 0.5:
        return np.linspace(0, n - 1, n_out)
    dur = np.where(core, kv, kr)
    edges = np.concatenate([[0.0], np.cumsum(dur)])      # output position of each source-frame edge
    return np.clip(np.interp(np.arange(n_out) + 0.5, edges, np.arange(n + 1)) - 0.5, 0, n - 1)


def sing_word(word, notes, fs=SR, voice='af_heart', syl=None):
    """notes: list of (dur_s, midi) for each syllable/melisma note of the word; syl: the syllable
    number of each note (default: one note per syllable). Each syllable of the spoken word is
    time-warped onto its own notes. Returns (audio, vowel mask per sample) for levelling."""
    import pyworld as pw
    import librosa
    y, sr, ph = tts_word(word, voice)
    y = librosa.resample(y, orig_sr=sr, target_sr=fs)
    thr = 0.02 * np.max(np.abs(y) + 1e-9)
    idx = np.where(np.abs(y) > thr)[0]
    if len(idx):
        y = y[max(0, idx[0] - 200): idx[-1] + 200]
    f0, sp, ap, per, e, cut_ms = analyse(y, fs, ph)
    ns = [max(1, int(round(d * 1000 / FP))) for d, _ in notes]
    syl = list(range(len(notes))) if syl is None else list(syl)
    m = max(syl) + 1
    out_n = [sum(n for n, s in zip(ns, syl) if s == j) for j in range(m)]
    syl_hz = [440.0 * 2 ** ((np.average([p for (d, p), s in zip(notes, syl) if s == j],
                                    weights=[d for (d, p), s in zip(notes, syl) if s == j]) - 69) / 12)
          for j in range(m)]
    eh_word = harmonic_energy(sp, fs, float(np.average(syl_hz, weights=out_n)))
    bounds = syllable_bounds(per, eh_word, m)
    if bounds is None:                                   # can't find the syllables: warp the word whole
        bounds, out_n, syl_hz = [0, len(e)], [sum(out_n)], [float(np.average(syl_hz, weights=out_n))]
    # The word's unvoiced onset (s, st, sh, p, k, h ...) and its unvoiced coda (a final t, p, k, s ...) are
    # sung at their spoken rate and spliced back from the spoken audio itself: WORLD smears a plosive burst
    # into a fricative. A short note drops a stop's silent closure first (keeping 10 ms of it), then the
    # onset's start or the coda's tail.
    nsrc = len(f0)
    eb = 10 * np.log10(sp.sum(1) + 1e-20)

    def trimmed(idx, budget, keep_end):
        if len(idx) <= budget:
            return idx
        keep = np.ones(len(idx), bool)
        for a, b in _runs(eb[idx] < eb.max() - 35):
            keep[a + 2:b] = False
        idx = idx[keep]
        return idx[-budget:] if keep_end else idx[:budget]

    n_on = int(np.argmax(per)) if per.any() else 0      # leading unvoiced frames
    if n_on >= bounds[1] - 3 or n_on < 3:
        n_on = 0
    n_co = int(np.argmax(per[::-1])) if per.any() else 0   # trailing unvoiced frames
    if n_co < 3 or nsrc - n_co <= bounds[-2] + (n_on if len(bounds) == 2 else 0) + 3:
        n_co = 0
    on_idx = trimmed(np.arange(n_on), max(8, int(round(0.4 * out_n[0]))), True)
    co_idx = trimmed(np.arange(nsrc - n_co, nsrc), max(3, int(round(0.15 * out_n[-1]))), False)
    if out_n[-1] - len(co_idx) - (len(on_idx) if len(out_n) == 1 else 0) < 6:
        n_co, co_idx = 0, np.arange(0)
    segs = []
    for j, (b0, b1, no, h) in enumerate(zip(bounds, bounds[1:], out_n, syl_hz)):
        a = b0 + (n_on if j == 0 else 0)
        c = b1 - (n_co if j == len(out_n) - 1 else 0)
        o = no - (len(on_idx) if j == 0 else 0) - (len(co_idx) if j == len(out_n) - 1 else 0)
        segs.append(a + warp_segment(per[a:c], harmonic_energy(sp[a:c], fs, h), o))
    src = np.concatenate([on_idx.astype(float)] + segs + [co_idx.astype(float)])
    n_out = len(src)
    lo = np.floor(src).astype(int)
    hi = np.minimum(lo + 1, len(f0) - 1)
    w = (src - lo)[:, None]
    sp2 = sp[lo] * (1 - w) + sp[hi] * w
    ap2 = ap[lo] * (1 - w) + ap[hi] * w
    voiced = (f0[lo] > 0) | (f0[hi] > 0)
    tgt = np.zeros(n_out)
    k = 0
    for (d, p), n in zip(notes, ns):
        hz = 440.0 * 2 ** ((p - 69) / 12)
        seg = np.full(n, hz)
        if d > 0.35:  # gentle delayed vibrato on long notes
            tt = np.arange(n) * FP / 1000
            seg *= 2 ** ((0.25 * np.clip((tt - 0.2) / 0.3, 0, 1) * np.sin(2 * np.pi * 5.5 * tt)) / 12)
        tgt[k:k + n] = seg[:len(tgt[k:k + n])]
        k += n
    tgt[k:] = tgt[k - 1] if k > 0 else 220
    # portamento between notes
    sm = np.convolve(np.log(tgt + 1e-6), np.ones(7) / 7, mode='same')
    tgt = np.exp(sm)
    f0o = np.where(voiced, tgt, 0.0)
    # lift a syllable that comes out more than 3 dB under the word's strongest one (e.g. a close vowel
    # on a high note, which skips its low F1), judged at the sung pitch, with 30-ms ramps
    if len(bounds) > 2:
        step = fs / ((sp2.shape[1] - 1) * 2)
        kk = np.arange(1, 13)[None, :] * tgt[:, None] / step
        pw_ = np.take_along_axis(sp2, np.clip(np.round(kk).astype(int), 0, sp2.shape[1] - 1), 1)
        pw_ = (pw_ * (kk * step < 5000)).sum(1) + 1e-20
        edges = np.concatenate([[0], np.cumsum(out_n)])
        lev = []
        for a, b in zip(edges, edges[1:]):
            x = 10 * np.log10(pw_[a:b])
            lev.append(10 * np.log10(np.mean(10 ** (x[x > x.max() - 10] / 10))))
        boost = np.clip(max(lev) - 3 - np.array(lev), 0, 10)
        g = np.repeat(boost, np.diff(edges))
        g = np.convolve(np.pad(g, 3, mode='edge'), np.ones(7) / 7, mode='valid')
        sp2 = sp2 * 10 ** (g[:, None] / 10)
    out = pw.synthesize(np.ascontiguousarray(f0o), np.ascontiguousarray(sp2), np.ascontiguousarray(ap2), fs, FP)
    hop, a0 = FP * fs / 1000, cut_ms * fs / 1000

    def spoken(idx):
        mask = np.zeros(nsrc, bool)
        mask[idx] = True
        return np.concatenate([y[int(round(a0 + a * hop)):int(round(a0 + b * hop))] for a, b in _runs(mask)])

    # a spliced coda keeps its spoken balance against the vowel as it is now sung (a high note can sing a
    # vowel quieter than it was spoken; a final t or p comes down with it, never up). The onset keeps its
    # spoken level: it carries the word (the h of "hi" against "bye").
    vs = per & (eh_word > -6)
    vo_src = np.concatenate([y[int(round(a0 + a * hop)):int(round(a0 + b * hop))] for a, b in _runs(vs)]) if vs.any() else y
    fm = (f0o > 0) & (np.arange(n_out) >= len(on_idx))
    vo_out = out[fm[np.minimum((np.arange(len(out)) / hop).astype(int), n_out - 1)]] if fm.any() else out
    bal = float(np.clip(np.sqrt(np.mean(vo_out ** 2)) / (np.sqrt(np.mean(vo_src ** 2)) + 1e-12), 0.3, 1.0))
    xf = int(fs * .006)
    if len(on_idx):                                      # splice the spoken onset consonant back in
        seg = spoken(on_idx)
        L = min(len(seg), len(out))
        x = min(xf, L)
        if on_idx[0] > 0:
            seg[:x] *= np.linspace(0, 1, x)
        ramp = np.linspace(1, 0, x)
        out[:L - x] = seg[:L - x]
        out[L - x:L] = seg[L - x:L] * ramp + out[L - x:L] * (1 - ramp)
    if len(co_idx):                                      # ... and the spoken coda
        seg = spoken(co_idx) * bal
        L = min(len(seg), len(out) - int(len(on_idx) * hop))
        seg = seg[:L]
        x = min(xf, L)
        ramp = np.linspace(0, 1, x)
        st = len(out) - L
        out[st:st + x] = seg[:x] * ramp + out[st:st + x] * (1 - ramp)
        out[st + x:] = seg[x:]
    fade = min(len(out), 441)
    out[-fade:] *= np.linspace(1, 0, fade)
    # the levelling mask: the loud voiced part as sung (not the spliced onset, not a fricative)
    hop = int(fs * FP / 1000)
    fe = np.array([np.mean(out[i:i + hop] ** 2) for i in range(0, len(out), hop)]) + 1e-20
    vo = np.zeros(len(fe), bool)
    vo[:min(len(fe), n_out)] = (f0o > 0)[:len(fe)]
    vo[:len(on_idx) + 2] = False
    vo[max(0, n_out - len(co_idx) - 2):] = False
    if vo.sum() < 4:
        vo[:] = True
    loud = vo & (10 * np.log10(fe) > 10 * np.log10(fe[vo].max()) - 10)
    vmask = np.repeat(loud, hop)[:len(out)]
    vmask = np.pad(vmask, (0, len(out) - len(vmask)))
    return out, vmask


def limit(y, ceil=0.6):
    """A crude look-ahead peak limiter for one word, so a transient can't set the level of the whole vocal."""
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    need = np.minimum(1.0, ceil / (np.abs(y) + 1e-9))
    if need.min() >= 1.0:
        return y
    w = int(SR * .004)
    return y * np.minimum(uniform_filter1d(minimum_filter1d(need, w), w), 1.0)


def word_gain_db(song, beat):
    for a, b, g in getattr(song, 'vocal_gain', []) or []:
        if a <= beat < b:
            return g
    return 0.0


def guide_vocal(song, total_s, voice='af_heart'):
    tl = song.timeline()
    buf = np.zeros(int((total_s + 2) * SR))
    say = getattr(song, 'tts_say', {}) or {}
    # group syllables into words: a syllable ending with '-' continues into the next
    words, cur = [], None
    for v in tl['vocal']:
        syl = v['syl']
        notes = [(song.seconds(n['d']), n['p']) for n in v['notes']]
        if cur is None:
            cur = {'text': '', 'start': v['start'], 'beat': v['t'], 'notes': [], 'syl': []}
        cur['syl'] += [len(set(cur['syl']))] * len(notes)
        cur['text'] += syl.rstrip('-')
        cur['notes'] += notes
        if not syl.endswith('-'):
            words.append(cur)
            cur = None
    target = 10 ** (VOWEL_DBFS / 20)
    for w in words:
        text = re.sub(r"[^A-Za-z' ]", '', w['text']) or 'la'
        text = say.get(text, text)
        try:
            y, vmask = sing_word(text, w['notes'], voice=voice, syl=w['syl'])
        except Exception as e:  # noqa
            print('sing fail', text, e)
            continue
        core = y[vmask] if vmask.sum() > SR * .02 else y
        rms = np.sqrt(np.mean(core ** 2)) + 1e-9
        y = limit(y * (target / rms) * 10 ** (word_gain_db(song, w['beat']) / 20))
        i = int(w['start'] * SR)
        buf[i:i + len(y)] += y[: len(buf) - i]
    m = np.max(np.abs(buf)) + 1e-9
    return buf if m <= 0.95 else buf / m * 0.95


def norm_lufs(y, target=-14.0, ceil=0.98):
    """Integrated loudness to `target`, then a look-ahead peak limiter (5 ms, both channels linked) so a
    drum hit in a loud drop can't pull the whole file down; a final scale only if the limiter overshoots."""
    import pyloudnorm as pyln
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    meter = pyln.Meter(SR)
    l = meter.integrated_loudness(y)
    y = y * 10 ** ((target - l) / 20)     # pyloudnorm's normalize, without its pre-limiter clip notice
    a = np.max(np.abs(y), axis=1) if y.ndim == 2 else np.abs(y)
    if a.max() > ceil:
        w = int(SR * .005)
        g = uniform_filter1d(minimum_filter1d(np.minimum(1.0, ceil / (a + 1e-9)), 2 * w), w)
        y = y * (g[:, None] if y.ndim == 2 else g)
    peak = np.max(np.abs(y))
    if peak > ceil:
        y = y / peak * ceil
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
    # headroom: the band and the voice come down together (their balance is the composition's) when the
    # band's loudest moment would pass full scale in the 16-bit files
    head = min(1.0, 0.95 / (np.max(np.abs(inst)) + 1e-9))
    inst = inst * head
    sf.write(os.path.join(out, 'guide_inst.wav'), inst, SR, subtype='PCM_16')
    midi_without(song, lambda k: True, os.path.join(out, 'lead.mid'))
    lead = fluid(os.path.join(out, 'lead.mid'), os.path.join(out, '_lead_raw.wav'))
    sf.write(os.path.join(out, 'guide_lead.wav'), norm_lufs(lead), SR, subtype='PCM_16')
    os.unlink(os.path.join(out, '_lead_raw.wav'))
    voc = guide_vocal(song, total) * head
    sf.write(os.path.join(out, 'guide_vocal.wav'), voc, SR, subtype='PCM_16')
    n = max(len(inst), len(voc))
    mix = np.zeros((n, 2))
    mix[:len(inst)] += inst
    mix[:len(voc), 0] += voc * 0.9
    mix[:len(voc), 1] += voc * 0.9
    mix = mix[: int((total + 1.5) * SR)]
    sf.write(os.path.join(out, 'guide_mix.wav'), norm_lufs(mix), SR, subtype='PCM_16')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(out, 'guide_mix.wav'), '-b:a', '192k',
                    os.path.join(out, 'guide_mix.mp3')], check=True)
    print(json.dumps({'duration': total, 'sections': [(s['name'], round(s['start'], 2)) for s in tl['sections']],
                      'syllables': len(tl['vocal'])}))


if __name__ == '__main__':
    main()
