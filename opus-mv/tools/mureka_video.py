#!/usr/bin/env python3
"""Seedance video through the Mureka API (/v1/video/generate). Key as in mureka.py.

Music chain (a shot of a Mureka song, optionally lip-synced to it, with character reference images):
  mureka_video.py music --song-id ID --start MS --end MS --character URL [--character URL2] [--lip-sync]
                        [--background URL] --prompt "..." [--resolution 480p|720p] [--ratio 16:9] --out DIR/name
Video chain (any multimodal content):
  mureka_video.py video --prompt "..." [--image URL --role reference_image|first_frame] [--audio URL]
                        [--duration 5] [--resolution 480p] [--ratio 16:9] [--no-audio] --out DIR/name
  mureka_video.py query TASK_ID --out DIR/name
Images, audio and video must be publicly reachable URLs (raw.githubusercontent.com works for this repo).
Writes <out>.mp4 and <out>.json, and prints the balance change.
"""
import argparse, json, os, sys, time, urllib.request
sys.path.insert(0, os.path.dirname(__file__))
from mureka import req  # noqa: E402

MODEL = 'doubao-seedance-2-5-260628'


def balance():
    return req('GET', '/v1/account/billing').get('balance')


def wait(task_id, out):
    t0 = time.time()
    while True:
        q = req('GET', '/v1/video/query/' + task_id)
        st = q.get('status')
        if st == 'succeeded':
            break
        if st in ('failed', 'cancelled', 'expired'):
            raise RuntimeError(f'video task {st}: {json.dumps(q.get("error"))}')
        print(f'  {int(time.time() - t0)}s {st}', file=sys.stderr)
        time.sleep(10)
    os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
    json.dump(q, open(out + '.json', 'w'), indent=1)
    c = q.get('content') or {}
    url = c.get('video_url') or (c.get('video') or {}).get('url') if isinstance(c, dict) else None
    if not url:
        for v in (c.values() if isinstance(c, dict) else []):
            if isinstance(v, str) and v.startswith('http'):
                url = v
    if url:
        urllib.request.urlretrieve(url, out + '.mp4')
        print(f'{out}.mp4  {q.get("duration")}s  {q.get("resolution", "")}')
    else:
        print('no video url in response; see', out + '.json')
    return q


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['music', 'video', 'query']); ap.add_argument('arg', nargs='?')
    ap.add_argument('--song-id'); ap.add_argument('--upload-audio-id'); ap.add_argument('--start', type=int); ap.add_argument('--end', type=int)
    ap.add_argument('--character', action='append', default=[]); ap.add_argument('--background'); ap.add_argument('--lip-sync', action='store_true')
    ap.add_argument('--prompt', default=''); ap.add_argument('--image', action='append', default=[]); ap.add_argument('--role', default='reference_image')
    ap.add_argument('--audio'); ap.add_argument('--duration', type=int, default=5); ap.add_argument('--resolution', default='480p')
    ap.add_argument('--ratio', default='16:9'); ap.add_argument('--no-audio', action='store_true'); ap.add_argument('--model', default=MODEL)
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    b0 = balance()
    if a.cmd == 'query':
        wait(a.arg, a.out)
    else:
        body = {'model': a.model, 'resolution': a.resolution, 'ratio': a.ratio, 'watermark': False}
        if a.cmd == 'music':
            if a.song_id: body['song_id'] = a.song_id
            if a.upload_audio_id: body['upload_audio_id'] = a.upload_audio_id
            body.update({'audio_start': a.start, 'audio_end': a.end, 'lip_sync': a.lip_sync, 'show_lyrics_subtitle': False,
                         'character': a.character, 'prompt': a.prompt})
            if a.background: body['background'] = a.background
        else:
            content = [{'type': 'text', 'text': a.prompt}]
            for u in a.image:
                content.append({'type': 'image_url', 'image_url': {'url': u}, 'role': a.role})
            if a.audio:
                content.append({'type': 'audio_url', 'audio_url': {'url': a.audio}, 'role': 'reference_audio'})
            body.update({'content': content, 'duration': a.duration, 'generate_audio': not a.no_audio})
        json.dump(body, open(a.out + '.request.json', 'w'), indent=1)
        t = req('POST', '/v1/video/generate', body)
        print('task', t.get('id'), t.get('status'), file=sys.stderr)
        wait(t['id'], a.out)
    b1 = balance()
    print(f'balance {b0} -> {b1} (cost {b0 - b1} credits = ${(b0 - b1) / 100:.2f})')


if __name__ == '__main__':
    main()
