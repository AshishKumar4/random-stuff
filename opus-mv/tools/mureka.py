#!/usr/bin/env python3
"""Mureka API client (https://platform.mureka.ai). Key is read from $MUREKA_API_KEY or
/home/user/mvwork/secrets/mureka_key (never stored in the repo).

  mureka.py billing
  mureka.py generate --lyrics-file L.txt --prompt-file P.txt --model mureka-9.5 --n 2 --out DIR/name
  mureka.py upload FILE --purpose reference|melody|audio|vocal|remix
  mureka.py region-edit --song-id ID --lyrics "..." --start MS --end MS --out DIR/name
  mureka.py query TASK_ID --out DIR/name
Each finished song i is saved as <out>_<i>.mp3 (+ .flac when available) and <out>.json (full task,
including lyrics_sections with word timestamps).
"""
import argparse, json, os, sys, time, urllib.request, urllib.error, uuid

API = 'https://api.mureka.ai'


def key():
    k = os.environ.get('MUREKA_API_KEY')
    if not k:
        with open('/home/user/mvwork/secrets/mureka_key') as f:
            k = f.read().strip()
    return k


def req(method, path, body=None, timeout=120, raw=None, ctype='application/json'):
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    r = urllib.request.Request(API + path, data=data, method=method,
                               headers={'Authorization': f'Bearer {key()}', **({'Content-Type': ctype} if data is not None else {})})
    try:
        with urllib.request.urlopen(r, timeout=timeout) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f'HTTP {e.code}: {e.read().decode(errors="replace")[:500]}')


def upload(path, purpose):
    b = uuid.uuid4().hex
    with open(path, 'rb') as f:
        content = f.read()
    parts = [f'--{b}\r\nContent-Disposition: form-data; name="purpose"\r\n\r\n{purpose}\r\n'.encode(),
             f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="{os.path.basename(path)}"\r\nContent-Type: audio/mpeg\r\n\r\n'.encode(),
             content, f'\r\n--{b}--\r\n'.encode()]
    return req('POST', '/v1/files/upload', raw=b''.join(parts), ctype=f'multipart/form-data; boundary={b}', timeout=300)


def wait(task_id, out, path='/v1/song/query/'):
    t0 = time.time()
    while True:
        q = req('GET', path + task_id)
        st = q.get('status')
        if st == 'succeeded':
            break
        if st in ('failed', 'timeouted', 'cancelled'):
            raise RuntimeError(f'task {st}: {q.get("failed_reason")}')
        print(f'  {int(time.time() - t0)}s {st}', file=sys.stderr)
        time.sleep(8)
    os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
    with open(out + '.json', 'w') as f:
        json.dump(q, f, indent=1, ensure_ascii=False)
    for c in q.get('choices', []):
        i = c.get('index', 0)
        for k, ext in (('url', 'mp3'), ('flac_url', 'flac'), ('wav_url', 'wav')):
            if c.get(k):
                urllib.request.urlretrieve(c[k], f'{out}_{i}.{ext}')
        print(f'{out}_{i}  {c.get("duration", 0) / 1000:.1f}s  song_id={c.get("id")}')
    return q


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['billing', 'generate', 'upload', 'query', 'region-edit', 'extend'])
    ap.add_argument('arg', nargs='?')
    ap.add_argument('--lyrics-file'); ap.add_argument('--lyrics'); ap.add_argument('--prompt-file'); ap.add_argument('--prompt')
    ap.add_argument('--model', default='mureka-9.5'); ap.add_argument('--n', type=int, default=2)
    ap.add_argument('--reference-id'); ap.add_argument('--melody-id'); ap.add_argument('--vocal-id'); ap.add_argument('--gender')
    ap.add_argument('--purpose', default='reference'); ap.add_argument('--out')
    ap.add_argument('--song-id'); ap.add_argument('--start', type=int); ap.add_argument('--end', type=int)
    a = ap.parse_args()
    if a.cmd == 'billing':
        print(json.dumps(req('GET', '/v1/account/billing')))
    elif a.cmd == 'upload':
        print(json.dumps(upload(a.arg, a.purpose)))
    elif a.cmd == 'query':
        wait(a.arg, a.out)
    elif a.cmd == 'generate':
        lyr = a.lyrics or open(a.lyrics_file).read().strip()
        body = {'lyrics': lyr, 'model': a.model, 'n': a.n}
        if a.melody_id:
            body['melody_id'] = a.melody_id
        else:
            pr = a.prompt or (open(a.prompt_file).read().strip() if a.prompt_file else None)
            if pr:
                body['prompt'] = pr
            if a.reference_id:
                body['reference_id'] = a.reference_id
            if a.vocal_id:
                body['vocal_id'] = a.vocal_id
        if a.gender:
            body['gender'] = a.gender
        t = req('POST', '/v1/song/generate', body)
        print('task', t['id'], file=sys.stderr)
        with open(a.out + '.request.json', 'w') as f:
            json.dump(body, f, indent=1, ensure_ascii=False)
        wait(t['id'], a.out)
    elif a.cmd == 'region-edit':
        body = {'song_id': a.song_id, 'lyrics': a.lyrics or open(a.lyrics_file).read().strip(), 'edit_start': a.start, 'edit_end': a.end}
        t = req('POST', '/v1/song/region-edit', body)
        print('task', t['id'], file=sys.stderr)
        wait(t['id'], a.out)


if __name__ == '__main__':
    main()
