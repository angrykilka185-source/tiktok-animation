#!/usr/bin/env python3
"""Voice an episode with ElevenLabs myself: one request per line of <part>/voice-lines.json (with the neighbouring
lines as context, so the intonation flows), joined with short pauses into ONE mp3 — the same kind of file the author
used to send from the ElevenLabs app. Then fit it as usual:  python3 scripts/fit-voiceover.py <out.mp3> --part <id>

usage: python3 scripts/tts-lines.py <voice_id> src/r1/voice-lines.json assets/rayon-1.mp3
       [--model eleven_v4] [--stability 0.5] [--similarity 0.75] [--pause 0.7] [--pitch -5]
--pitch N lowers (or raises) the finished voice by N semitones with the formants kept (ffmpeg rubberband): a premade
voice made deeper to come close to a library narrator the API key can't reach.
--cache DIR keeps every voiced line as DIR/<hash of voice, model, settings, text>.mp3 and reuses it: after a script
edit only the new or changed lines cost credits.
The key is injected by the session proxy (header xi-api-key) — it is never in this file or the repository.
Defaults = the settings of the author's last recording («Broken Future – Narrator», pvc, s50, sim75, v4).
"""
import hashlib
import json
import os
import shutil
import re
import subprocess
import sys
import tempfile


def arg(name, default):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


voice, lines_file, out = sys.argv[1], sys.argv[2], sys.argv[3]
model = arg('--model', 'eleven_v4')
stability = float(arg('--stability', '0.5'))
similarity = float(arg('--similarity', '0.75'))
pause = float(arg('--pause', '0.7'))
pitch = float(arg('--pitch', '0'))
cache = arg('--cache', '')
if cache:
    os.makedirs(cache, exist_ok=True)

cfg = json.load(open(lines_file, encoding='utf-8'))
texts = [re.sub(r'\*', '', l['text']) for l in cfg['lines'] if not l.get('reuse')]

tmp = tempfile.mkdtemp(prefix='tts-')
parts = []
for i, text in enumerate(texts):
    body = {
        'text': text,
        'model_id': model,
        'voice_settings': {'stability': stability, 'similarity_boost': similarity},
        'previous_text': ' '.join(texts[max(0, i - 2):i]) or None,
        'next_text': texts[i + 1] if i + 1 < len(texts) else None,
    }
    body = {k: v for k, v in body.items() if v is not None}
    dst = os.path.join(tmp, f'{i:02d}.mp3')
    key = hashlib.sha1(json.dumps([voice, model, stability, similarity, text], ensure_ascii=False).encode()).hexdigest()[:16]
    cached = os.path.join(cache, key + '.mp3') if cache else ''
    if cached and os.path.exists(cached):
        shutil.copy(cached, dst)
        parts.append(dst)
        print(f'{i + 1:02d}/{len(texts)}  (cache) {text[:52]}')
        continue
    for attempt in range(4):  # the API is sometimes slow: retry timeouts and 5xx
        code = subprocess.run(
            ['curl', '-sS', '-m', '240', '-o', dst, '-w', '%{http_code}', '-H', 'xi-api-key: proxy-injected', '-H', 'Content-Type: application/json', '-X', 'POST',
             f'https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128', '-d', json.dumps(body, ensure_ascii=False)],
            capture_output=True, text=True).stdout.strip()
        if code == '200' or (code.startswith('4') and code != '429'):
            break
        print(f'  line {i + 1}: HTTP {code}, retrying')
    if code != '200':
        sys.exit(f'line {i + 1}: HTTP {code}: {open(dst, encoding="utf-8", errors="replace").read()[:300]}')
    parts.append(dst)
    if cached:
        shutil.copy(dst, cached)
    print(f'{i + 1:02d}/{len(texts)}  {text[:60]}')

# join: each line, then `pause` seconds of silence
sil = os.path.join(tmp, 'sil.mp3')
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', str(pause), '-b:a', '128k', sil], check=True)
lst = os.path.join(tmp, 'list.txt')
with open(lst, 'w') as fh:
    for p in parts:
        fh.write(f"file '{p}'\nfile '{sil}'\n")
af = ['-af', f'rubberband=pitch={2 ** (pitch / 12):.5f}:formant=preserved'] if pitch else []
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, *af, '-ac', '1', '-ar', '44100', '-b:a', '128k', out], check=True)
print('wrote', out)
