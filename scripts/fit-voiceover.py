#!/usr/bin/env python3
"""Fit a ready-made voice-over (one mp3 made in ElevenLabs from the script) to the video.

1. finds the phrases in the recording (pauses via ffmpeg silencedetect),
2. matches them to the lines of src/voice-lines.json (dynamic programming on lengths + pauses),
3. cuts every line into its own clip, shortens long pauses inside a line,
4. places each line at its moment in the video (speeding a line up only when it does not fit),
5. writes public/voice/<id>.mp3 and src/voice-timings.json (line positions + word timings for captions).

usage: python3 scripts/fit-voiceover.py path/to/voiceover.mp3            (part 1)
       python3 scripts/fit-voiceover.py path/to/voiceover.mp3 --part 2   (part 2)
Lines marked "reuse" (part 2 opening) are taken from part 1 and are not expected in the recording.
"""
import json
import math
import os
import re
import subprocess
import sys
import tempfile
import wave

import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
FPS = 30
PART = int(sys.argv[sys.argv.index('--part') + 1]) if '--part' in sys.argv else 1
PATHS = {
    1: {'lines': 'src/voice-lines.json', 'timeline': 'src/timeline.ts', 'out': 'public/voice', 'timings': 'src/voice-timings.json'},
    2: {'lines': 'src/p2/voice-lines.json', 'timeline': 'src/p2/timeline.ts', 'out': 'public/voice2', 'timings': 'src/p2/voice-timings.json'},
}[PART]
SHOT = [float(x) for x in re.search(r'SHOT_SECONDS = \[([^\]]+)\]', open(os.path.join(ROOT, PATHS['timeline']), encoding='utf-8').read()).group(1).split(',')]
TOTAL = round(sum(SHOT) * FPS)
MAX_INNER_GAP = 0.28  # longest pause kept inside a line (s)
LEAD = 0.5  # a line may start this much before its planned moment (s)
LATE = 1.0  # ...and end this much after the next line's planned moment (s)
GAP = 0.12  # minimal pause between lines (s)
MAX_TEMPO = 1.25
BASE_TEMPO = float(os.environ.get('BASE_TEMPO', '1.12'))  # gentle speed-up for the whole voice-over
SR = 44100


def shot_start(n):
    return sum(round(x * FPS) for x in SHOT[: n - 1])


def run(cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True)


def tts_text(text):
    return text.replace('*', '')


def main(src):
    cfg = json.load(open(os.path.join(ROOT, PATHS['lines']), encoding='utf-8'))
    reused = [l for l in cfg['lines'] if l.get('reuse')]
    lines = [l for l in cfg['lines'] if not l.get('reuse')]
    # the recording starts after the reused lines (taken from part 1)
    start_after = 0.0
    if reused:
        p1 = json.load(open(os.path.join(ROOT, 'src/voice-timings.json'), encoding='utf-8')).get('lines', {})
        for l in reused:
            t = p1.get(l['reuse'])
            if t:
                start_after = max(start_after, t['at'] / FPS + t['duration'])

    tmp = tempfile.mkdtemp()
    wav = os.path.join(tmp, 'vo.wav')
    run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ac', '1', '-ar', str(SR), wav])
    # loudness of the whole recording -> gain so the voice sits at about -16 LUFS
    meas = subprocess.run(['ffmpeg', '-i', src, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    lufs = float(re.findall(r'I:\s+(-?[0-9.]+) LUFS', meas)[-1])
    gain_db = max(-6.0, min(12.0, -16.0 - lufs))
    print(f'voice loudness {lufs:.1f} LUFS -> gain {gain_db:+.1f} dB')
    w = wave.open(wav)
    audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)
    total = len(audio) / SR

    # --- phrases -------------------------------------------------------------
    det = subprocess.run(['ffmpeg', '-i', wav, '-af', 'silencedetect=noise=-38dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', det)]
    ends = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', det)]
    segs, t = [], 0.0
    for s, e in zip(starts, ends):
        if s - t > 0.05:
            segs.append([t, s])
        t = e
    if total - t > 0.05:
        segs.append([t, total])
    gaps = [segs[k + 1][0] - segs[k][1] for k in range(len(segs) - 1)]

    # --- match phrases to lines -------------------------------------------------
    C = [len(re.sub(r'[^\w]', '', tts_text(l['text']))) for l in lines]
    n, m = len(segs), len(lines)
    rate = sum(e - s for s, e in segs) / sum(C)
    INF = 1e18
    dp = [[INF] * (n + 1) for _ in range(m + 1)]
    bk = [[-1] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = 0

    def cost(i, k, j):
        sp = sum(segs[q][1] - segs[q][0] for q in range(k, j))
        c = math.log(sp / (rate * C[i])) ** 2 * 4
        for q in range(k, j - 1):
            c += max(0, gaps[q] - 0.35) * 2
        if j < n:
            c += max(0, 0.45 - gaps[j - 1]) * 3
        return c

    for i in range(m):
        for k in range(n):
            if dp[i][k] >= INF:
                continue
            for j in range(k + 1, min(n, k + 8) + 1):
                if n - j < m - i - 1:
                    break
                v = dp[i][k] + cost(i, k, j)
                if v < dp[i + 1][j]:
                    dp[i + 1][j] = v
                    bk[i + 1][j] = k
    if dp[m][n] >= INF:
        sys.exit('could not match the recording to the script: is it the same text?')
    groups, j = [], n
    for i in range(m, 0, -1):
        k = bk[i][j]
        groups.append((k, j))
        j = k
    groups.reverse()

    # --- build one clip per line (long inner pauses shortened) -------------------
    clips = []
    for i, (k, j) in enumerate(groups):
        parts, offs = [], []
        pos = 0.0
        for q in range(k, j):
            a = max(0.0, segs[q][0] - 0.03)
            b = min(total, segs[q][1] + 0.05)
            if q > k:
                pause = min(gaps[q - 1], MAX_INNER_GAP)
                parts.append(np.zeros(int(pause * SR), dtype=np.float32))
                pos += pause
            chunk = audio[int(a * SR): int(b * SR)].copy()
            fade = min(len(chunk) // 4, int(0.01 * SR))
            if fade > 0:
                chunk[:fade] *= np.linspace(0, 1, fade)
                chunk[-fade:] *= np.linspace(1, 0, fade)
            offs.append((pos, pos + len(chunk) / SR))
            parts.append(chunk)
            pos += len(chunk) / SR
        clips.append({'pcm': np.concatenate(parts), 'segs': offs, 'dur': pos})

    # --- even out loudness between lines (a whisper may stay ~3 dB quieter) --------------
    def rms_db(x):
        x = x[np.abs(x) > 300] if np.any(np.abs(x) > 300) else x
        return 20 * math.log10(max(1e-6, float(np.sqrt(np.mean(x ** 2)))))
    levels = [rms_db(cl['pcm']) for cl in clips]
    ref = float(np.median(levels))
    for i, cl in enumerate(clips):
        diff = ref - levels[i]
        if lines[i].get('whisper'):
            diff -= 1.5
        cl['gain'] = max(-6.0, min(10.0, diff)) if abs(diff) > 1.5 else 0.0

    # --- schedule: each line near its planned moment ------------------------------
    desired = [(shot_start(l['shot']) + l['offset']) / FPS for l in lines]
    prev_end = start_after
    plan = []
    for i, cl in enumerate(clips):
        nxt = desired[i + 1] if i + 1 < m else TOTAL / FPS - 0.2
        tempo = BASE_TEMPO
        # start exactly on the planned moment; start earlier only if the line does not fit
        s = max(desired[i], prev_end + GAP, 0.0)
        if cl['dur'] / tempo > nxt + LATE - s - GAP:
            s = max(desired[i] - LEAD, prev_end + GAP, 0.0)
        avail = nxt + LATE - s - GAP
        if cl['dur'] / tempo > avail:
            tempo = min(MAX_TEMPO, cl['dur'] / max(avail, 0.1))
        dur = cl['dur'] / tempo
        plan.append((s, tempo, dur))
        prev_end = s + dur

    # --- export -----------------------------------------------------------------
    out_dir = os.path.join(ROOT, PATHS['out'])
    os.makedirs(out_dir, exist_ok=True)
    for f in os.listdir(out_dir):
        if f.endswith('.mp3'):
            os.remove(os.path.join(out_dir, f))
    timings = {'source': os.path.basename(src), 'lines': {}}
    for i, l in enumerate(lines):
        cl = clips[i]
        s, tempo, dur = plan[i]
        raw = os.path.join(tmp, f"{l['id']}.wav")
        ww = wave.open(raw, 'wb')
        ww.setnchannels(1)
        ww.setsampwidth(2)
        ww.setframerate(SR)
        ww.writeframes(np.clip(cl['pcm'], -32768, 32767).astype(np.int16).tobytes())
        ww.close()
        af = [f'volume={gain_db + cl["gain"]:.2f}dB', 'alimiter=limit=0.95']
        if tempo > 1.001:
            af.insert(0, f'atempo={tempo:.4f}')
        filt = ['-filter:a', ','.join(af)]
        run(['ffmpeg', '-v', 'error', '-y', '-i', raw, *filt, '-ar', str(SR), '-b:a', '160k', os.path.join(out_dir, f"{l['id']}.mp3")])

        # word timings: spread the words over the phrases by length
        text = tts_text(l['text'])
        words = text.split()
        wl = [len(re.sub(r'[^\w]', '', x)) or 1 for x in words]
        seg_len = [b - a for a, b in cl['segs']]
        tot_w, tot_s = sum(wl), sum(seg_len)
        out_words, acc = [], 0
        for wi, word in enumerate(words):
            frac0, frac1 = acc / tot_w, (acc + wl[wi]) / tot_w
            acc += wl[wi]

            def at(frac):
                target = frac * tot_s
                for (a, b), ln in zip(cl['segs'], seg_len):
                    if target <= ln + 1e-9:
                        return a + target
                    target -= ln
                return cl['segs'][-1][1]

            out_words.append({'w': word, 's': round(at(frac0) / tempo + 0.02, 3), 'e': round(at(frac1) / tempo, 3)})
        timings['lines'][l['id']] = {
            'text': text,
            'at': round(s * FPS),
            'tempo': round(tempo, 3),
            'duration': round(dur, 3),
            'words': out_words,
        }
        late = s - desired[i]
        print(f"{l['id']} {s:6.2f}s ({'+' if late >= 0 else ''}{late:.2f}) x{tempo:.2f} {dur:4.2f}s  {text}")
    json.dump(timings, open(os.path.join(ROOT, PATHS['timings']), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f"wrote {PATHS['out']}/*.mp3 and {PATHS['timings']}")


if __name__ == '__main__':
    args = [a for i, a in enumerate(sys.argv[1:]) if a != '--part' and (i == 0 or sys.argv[i] != '--part')]
    if not args:
        sys.exit(__doc__)
    main(args[0])
