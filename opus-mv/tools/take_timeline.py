#!/usr/bin/env python3
"""Map a sung take onto the storyboard grid.

Inputs: the composition timeline (audio/timeline source melody.json, grid time) and the take's
analysis.json (faster-whisper word timestamps on the vocal stem + tracked beats).
Output: audio/timeline.js with
  - words/lines in GRID time (the storyboard's clock; unchanged from the composition)
  - warp: [[take_t, grid_t], ...] monotonic anchors so renderAt(take_t) draws grid time
  - beats: the take's tracked beats converted to grid time (so pulse() lands on real beats)
  - duration: take length (video length)

Alignment: lyric tokens (composition order) vs transcript tokens, difflib matching, then the
longest monotonic chain of matched (grid, take) onset pairs; section boundaries are added from
neighbouring anchors; everything is smoothed and clamped to slopes in [0.4, 2.5].
usage: take_timeline.py melody.json analysis.json --audio ../audio/song.mp3 [--out audio/timeline.js] [--tail 3.8]
"""
import argparse, bisect, difflib, json, os, re
import numpy as np

sys_path = os.path.dirname(__file__)
import sys; sys.path.insert(0, sys_path)
from make_timeline import DISPLAY  # noqa


def norm(w):
    w = w.lower().replace('’', "'")
    return re.sub(r"[^a-z0-9']", '', w)


def lis_pairs(pairs):
    """longest chain strictly increasing in both coordinates"""
    pairs = sorted(pairs)
    n = len(pairs); best = [1] * n; prev = [-1] * n
    for i in range(n):
        for j in range(max(0, i - 60), i):
            if pairs[j][0] < pairs[i][0] and pairs[j][1] < pairs[i][1] and best[j] + 1 > best[i]:
                best[i] = best[j] + 1; prev[i] = j
    i = int(np.argmax(best)) if n else -1
    out = []
    while i >= 0:
        out.append(pairs[i]); i = prev[i]
    return out[::-1]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('melody'); ap.add_argument('analysis')
    ap.add_argument('--audio', default='../audio/song.mp3')
    ap.add_argument('--out', default=os.path.join(os.path.dirname(__file__), '..', 'audio', 'timeline.js'))
    ap.add_argument('--grid-end', type=float, default=144.0)
    ap.add_argument('--take-end', type=float, default=None)
    ap.add_argument('--identity', action='store_true', help='take shares the grid clock (e.g. an ACE cover); only report drift')
    a = ap.parse_args()
    m = json.load(open(a.melody)); A = json.load(open(a.analysis))
    # composition words (grid)
    comp = []
    cur = None
    for v in m['vocal']:
        syl = v['syl']
        if cur is None:
            cur = {'w': '', 's': v['start'], 'e': v['end'], 'sec': v['section'], 'line': v['line']}
        cur['w'] += syl.rstrip('-') if syl.endswith('-') else syl
        cur['e'] = v['end']
        if not syl.endswith('-'):
            comp.append(cur); cur = None
    take = [{'w': w['w'], 's': w['s'], 'e': w['e']} for w in A.get('words', [])]
    ca = [norm(w['w']) for w in comp]; ta = [norm(w['w']) for w in take]
    sm = difflib.SequenceMatcher(a=ca, b=ta, autojunk=False)
    pairs = []
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            g, t = comp[blk.a + k]['s'], take[blk.b + k]['s']
            if len(ca[blk.a + k]) >= 2:
                pairs.append((round(g, 3), round(t, 3)))
    chain = lis_pairs(pairs)
    take_end = a.take_end or A['duration']
    anchors = [(0.0, 0.0)] + chain + [(a.grid_end, take_end)]
    # clamp slopes
    clean = [anchors[0]]
    for g, t in anchors[1:]:
        g0, t0 = clean[-1]
        if g - g0 < .2:
            continue
        s = (t - t0) / (g - g0)
        if .4 <= s <= 2.5:
            clean.append((g, t))
    matched = len(chain)
    res = {'matched_words': matched, 'comp_words': len(comp), 'take_words': len(take)}
    drift = [t - g for g, t in chain]
    res['drift_median'] = float(np.median(drift)) if drift else None
    res['drift_p90'] = float(np.percentile(np.abs(drift), 90)) if drift else None
    # beats in grid time
    G = np.array([c[0] for c in clean]); T = np.array([c[1] for c in clean])
    to_grid = lambda t: float(np.interp(t, T, G))
    beats = [round(to_grid(b), 4) for b in A['rhythm']['beats']]
    warp = None if a.identity else [[round(t, 3), round(g, 3)] for g, t in clean]
    # timeline (grid words from the composition)
    words, lines = [], []
    for w in comp:
        d = DISPLAY.get(w['w'], w['w'])
        wd = {'w': w['w'], 'd': d, 's': round(w['s'], 3), 'e': round(w['e'], 3)}
        words.append(wd)
        if not lines or lines[-1]['text'] != w['line'] or lines[-1]['sec'] != w['sec'] or w['s'] - lines[-1]['e'] > 1.5:
            lines.append({'id': len(lines), 'sec': w['sec'], 'text': w['line'], 's': wd['s'], 'e': wd['e'], 'words': []})
        lines[-1]['words'].append(wd); lines[-1]['e'] = wd['e']
    for L in lines:
        L['display'] = ' '.join(x['d'] for x in L['words'])
    tl = {'bpm': m['bpm'], 'offset': 0, 'duration': round(take_end, 3), 'beats': beats if not a.identity else None, 'barPhase': 0,
          'sections': [{'name': s['name'], 'start': round(s['start'], 3), 'end': round(s['end'], 3), 'energy': s['energy']} for s in m['sections']],
          'words': words, 'lines': lines, 'audio': a.audio, 'warp': warp, 'align': res}
    with open(a.out, 'w') as f:
        f.write('// generated by tools/take_timeline.py (grid-time lyrics; warp maps take time -> grid time)\n')
        f.write('window.TIMELINE = ' + json.dumps(tl, ensure_ascii=False) + ';\n')
    print(json.dumps(res))
    for g, t in clean[::max(1, len(clean) // 25)]:
        print(f'grid {g:7.2f} -> take {t:7.2f}')


if __name__ == '__main__':
    main()
