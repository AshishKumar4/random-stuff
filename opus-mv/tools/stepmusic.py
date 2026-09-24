#!/usr/bin/env python3
"""Client for StepAudio 3 Music via StepFun's public Hugging Face Space proxy
(https://huggingface.co/spaces/stepfun-ai/StepAudio-3-Music). Free, shared credits,
so use sparingly: the Space allows ~6 submissions/minute globally.

  stepmusic.py song   --caption-file cap.txt --lyrics-file lyr.txt --out take.mp3
  stepmusic.py cover  --audio guide.mp3 --caption-file cap.txt --lyrics-file lyr.txt --out take.mp3
  stepmusic.py vocal  --audio vocal.mp3 --caption-file cap.txt [--lyrics-file ...] --out take.mp3
Set STEPFUN_API_KEY to call api.stepfun.com directly with your own key instead.
"""
import argparse, base64, json, os, sys, time
import urllib.request, urllib.error

SPACE = 'https://stepfun-ai-stepaudio-3-music.hf.space'
DIRECT = 'https://api.stepfun.com'


def post(path, body, timeout=240):
    key = os.environ.get('STEPFUN_API_KEY')
    base = DIRECT if key else SPACE
    data = json.dumps(body).encode()
    req = urllib.request.Request(base + path, data=data, method='POST',
                                 headers={'Content-Type': 'application/json', 'User-Agent': 'opus-mv/1.0',
                                          **({'Authorization': f'Bearer {key}'} if key else {})})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        txt = e.read().decode(errors='replace')
        raise RuntimeError(f'HTTP {e.code}: {txt[:400]}')


def b64file(p):
    with open(p, 'rb') as f:
        return base64.b64encode(f.read()).decode()


def run(task, caption, lyrics=None, audio=None, instrumental=False, out='take.mp3', extra=None):
    body = {'model_id': 'step-music', 'task': task, 'caption': caption, 'response_format': 'mp3',
            'sample_rate': 44100, 'bit_rate': 320}
    if task == 'music_cover':
        body['song_audio'] = b64file(audio)
    elif task == 'vocal_to_music':
        body['vocal_audio'] = b64file(audio)
    if instrumental:
        body['instrumental'] = True
    elif lyrics:
        body['lyrics'] = lyrics
    if extra:
        body.update(extra)
    for attempt in range(6):
        try:
            r = post('/v1/audio/music/submit', body)
            break
        except RuntimeError as e:
            if '429' in str(e):
                print('rate limited; waiting 30s', file=sys.stderr)
                time.sleep(30)
                continue
            raise
    tid = r.get('task_id')
    print('task', tid, file=sys.stderr)
    t0 = time.time()
    while True:
        time.sleep(5 if time.time() - t0 < 60 else 10)
        q = post('/v1/audio/music/query', {'task_id': tid}, timeout=60)
        st = q.get('status')
        if st == 'SUCCESS':
            break
        if st == 'FAILED':
            raise RuntimeError('task failed: ' + json.dumps(q)[:500])
        if time.time() - t0 > 900:
            raise RuntimeError('timeout')
        print(f'  {int(time.time() - t0)}s status={st}', file=sys.stderr)
    # find audio payload
    meta_path = os.path.splitext(out)[0] + '.json'

    def find_audio(o):
        if isinstance(o, dict):
            for k, v in o.items():
                if k in ('audio', 'audio_data', 'b64_audio', 'audio_base64') and isinstance(v, str) and len(v) > 1000:
                    return v
                r = find_audio(v)
                if r:
                    return r
        if isinstance(o, list):
            for v in o:
                r = find_audio(v)
                if r:
                    return r
        return None

    def strip(o):
        if isinstance(o, dict):
            return {k: (f'<{len(v)} chars>' if isinstance(v, str) and len(v) > 1000 else strip(v)) for k, v in o.items()}
        if isinstance(o, list):
            return [strip(v) for v in o]
        return o

    a = find_audio(q)
    with open(meta_path, 'w') as f:
        json.dump({'request': strip(body), 'response': strip(q), 'elapsed': time.time() - t0}, f, indent=1)
    if not a:
        url = json.dumps(q)
        raise RuntimeError('no audio in response: ' + url[:600])
    with open(out, 'wb') as f:
        f.write(base64.b64decode(a))
    print(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('mode', choices=['song', 'instrumental', 'cover', 'vocal'])
    ap.add_argument('--caption'); ap.add_argument('--caption-file')
    ap.add_argument('--lyrics-file'); ap.add_argument('--audio'); ap.add_argument('--out', required=True)
    ap.add_argument('--extra', help='json of extra body fields')
    a = ap.parse_args()
    cap = a.caption or open(a.caption_file).read().strip()
    lyr = open(a.lyrics_file).read().strip() if a.lyrics_file else None
    task = {'song': 'text_to_music', 'instrumental': 'text_to_music', 'cover': 'music_cover', 'vocal': 'vocal_to_music'}[a.mode]
    run(task, cap, lyr, a.audio, a.mode == 'instrumental', a.out, json.loads(a.extra) if a.extra else None)


if __name__ == '__main__':
    main()
