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
    1: {'lines': 'src/voice-lines.json', 'timeline': 'src/timeline.ts', 'out': 'public/voice', 'timings': 'src/voice-timings.json', 'edit': 'src/edit.json'},
    2: {'lines': 'src/p2/voice-lines.json', 'timeline': 'src/p2/timeline.ts', 'out': 'public/voice2', 'timings': 'src/p2/voice-timings.json', 'edit': 'src/p2/edit.json'},
}[PART]
SHOT = [float(x) for x in re.search(r'SHOT_SECONDS = \[([^\]]+)\]', open(os.path.join(ROOT, PATHS['timeline']), encoding='utf-8').read()).group(1).split(',')]
TOTAL = round(sum(SHOT) * FPS)
MAX_INNER_GAP = 0.22  # longest pause kept inside a line (s)
LEAD = 0.5  # a line may start this much before its planned moment (s)
LATE = 1.0  # ...and end this much after the next line's planned moment (s)
GAP = 0.12  # minimal pause between lines (s)
MAX_TEMPO = 1.25
BASE_TEMPO = float(os.environ.get('BASE_TEMPO', '1.15'))  # gentle speed-up for the whole voice-over
# "pack" (default): lines follow each other without dead air and the picture is
# retimed to the voice (src/edit.json). "--anchor": old mode, lines wait for the picture.
PACK = '--anchor' not in sys.argv
LINE_GAP = 0.1  # pause between lines of the same shot (s)
SHOT_GAP = 0.2  # pause when the next line starts a new shot (s)
MIN_RATIO = 0.3  # the picture is never sped up more than 1/0.3 = 3.3x
END_HOLD = 1.6  # the end card stays this long after the last line (s)
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
    # The phrase borders come from a -38 dB silence gate, but soft word endings
    # ("пять", "три", breath, room decay) are quieter than that. Every phrase is
    # therefore extended until the sound really fades out (-56 dB), then faded.
    hop = int(0.01 * SR)
    env = np.array([20 * math.log10(max(1e-9, float(np.sqrt(np.mean((audio[i:i + hop] / 32768.0) ** 2))))) for i in range(0, len(audio), hop)])

    def level(t):
        k = int(t / 0.01)
        return env[k] if 0 <= k < len(env) else -120.0

    def ext_end(e, limit):
        t = e
        while t < min(limit, e + 0.45) and max(level(t), level(t + 0.01)) > -56:
            t += 0.01
        return min(limit, t + 0.05)

    def ext_start(s0, limit):
        t = s0
        while t > max(limit, s0 - 0.2) and level(t - 0.01) > -56:
            t -= 0.01
        return max(limit, t - 0.02)

    def fade(chunk, fin, fout):
        fi = min(len(chunk) // 3, int(fin * SR))
        fo = min(len(chunk) // 3, int(fout * SR))
        if fi > 0:
            chunk[:fi] *= np.linspace(0, 1, fi)
        if fo > 0:
            chunk[-fo:] *= np.linspace(1, 0, fo) ** 2
        return chunk

    clips = []
    for i, (k, j) in enumerate(groups):
        parts, offs = [], []
        pos = 0.0
        for q in range(k, j):
            prev_end = segs[q - 1][1] + 0.02 if q > 0 else 0.0
            next_start = segs[q + 1][0] - 0.02 if q + 1 < len(segs) else total
            a = ext_start(segs[q][0], prev_end)
            b = ext_end(segs[q][1], next_start)
            if q > k:
                # keep the real (quiet) pause, only shorten a long one
                pa = offs[-1][2]
                pause = max(0.0, min(a - pa, MAX_INNER_GAP))
                parts.append(np.zeros(int(pause * SR), dtype=np.float32))
                pos += pause
            chunk = fade(audio[int(a * SR): int(b * SR)].copy(), 0.008, 0.06)
            offs.append((pos, pos + len(chunk) / SR, b))
            parts.append(chunk)
            pos += len(chunk) / SR
        # a little silence at the end so the tempo filter never eats the last word
        parts.append(np.zeros(int(0.12 * SR), dtype=np.float32))
        clips.append({'pcm': np.concatenate(parts), 'segs': [(x, y) for x, y, _ in offs], 'dur': pos})

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

    # --- schedule ----------------------------------------------------------------
    desired = [(shot_start(l['shot']) + l['offset']) / FPS for l in lines]
    plan = []
    anchors = []  # (old time, new time) in seconds: how the picture is retimed
    if PACK:
        finale = len(SHOT)
        prev_end = start_after
        prev_old = prev_new = None
        if reused:
            p1 = json.load(open(os.path.join(ROOT, 'src/voice-timings.json'), encoding='utf-8')).get('lines', {})
            anchors.append((0.0, 0.0))
            for l in reused:
                t = p1.get(l['reuse'])
                if t:
                    o, n_ = (shot_start(l['shot']) + l['offset']) / FPS, t['at'] / FPS
                    if n_ > anchors[-1][1] and o > anchors[-1][0]:
                        anchors.append((o, n_))
            prev_old, prev_new = anchors[-1]
        for i, cl in enumerate(clips):
            tempo = BASE_TEMPO
            dur = cl['dur'] / tempo
            old = desired[i]
            shot = lines[i]['shot']
            first_of_shot = i == 0 or shot != lines[i - 1]['shot']
            # every shot ends when its voice ends: the next line (and the cut) follow right away
            st = prev_end + (SHOT_GAP if first_of_shot else LINE_GAP)
            if i > 0 and lines[i - 1].get('minDur'):
                st = max(st, plan[-1][0] + lines[i - 1]['minDur'])
            if prev_new is not None:
                st = max(st, prev_new + MIN_RATIO * (old - prev_old))
            if i == 0 and not reused:
                st = max(st, old)
            if first_of_shot:
                cut_old = shot_start(shot) / FPS
                lead = min(old - cut_old, 0.2)
                cut_new = st - lead if cut_old > 0 else 0.0
                if prev_new is not None:
                    cut_new = max(cut_new, prev_new + MIN_RATIO * (cut_old - prev_old))
                    st = max(st, cut_new + lead)
                if not anchors or (cut_old > anchors[-1][0] and cut_new > anchors[-1][1]):
                    anchors.append((cut_old, cut_new))
            if not anchors or (old > anchors[-1][0] and st > anchors[-1][1]):
                anchors.append((old, st))
            prev_old, prev_new = old, st
            plan.append((st, tempo, dur))
            prev_end = st + dur
        old_total = TOTAL / FPS
        new_total = prev_end + END_HOLD
        anchors.append((old_total, new_total))
        anchors.insert(0, (0.0, 0.0))
        clean = []
        for a, b in anchors:
            if not clean or (a > clean[-1][0] + 1e-6 and b > clean[-1][1] + 1e-6):
                clean.append((a, b))
        anchors = clean
        json.dump({'anchors': [[round(a * FPS, 2), round(b * FPS, 2)] for a, b in anchors], 'total': round(new_total * FPS)},
                  open(os.path.join(ROOT, PATHS['edit']), 'w', encoding='utf-8'), indent=1)
        print(f'packed: {old_total:.1f}s -> {new_total:.1f}s')
        def fwd(o):
            for (a, b), (c, d) in zip(anchors, anchors[1:]):
                if a <= o <= c:
                    return b + (o - a) * (d - b) / (c - a)
            return anchors[-1][1]
        for sh in range(1, len(SHOT) + 1):
            idx = [k for k, l in enumerate(lines) if l['shot'] == sh]
            if not idx:
                continue
            end_new = fwd(shot_start(sh + 1) / FPS) if sh < len(SHOT) else new_total
            voice_end = plan[idx[-1]][0] + plan[idx[-1]][2]
            print(f'  shot {sh:2d}: {fwd(shot_start(sh) / FPS):5.1f}-{end_new:5.1f}s, picture after the voice: {end_new - voice_end:+.2f}s')
    else:
        prev_end = start_after
        for i, cl in enumerate(clips):
            nxt = desired[i + 1] if i + 1 < m else TOTAL / FPS - 0.2
            tempo = BASE_TEMPO
            # start exactly on the planned moment; start earlier only if the line does not fit
            st = max(desired[i], prev_end + GAP, 0.0)
            if cl['dur'] / tempo > nxt + LATE - st - GAP:
                st = max(desired[i] - LEAD, prev_end + GAP, 0.0)
            avail = nxt + LATE - st - GAP
            if cl['dur'] / tempo > avail:
                tempo = min(MAX_TEMPO, cl['dur'] / max(avail, 0.1))
            dur = cl['dur'] / tempo
            plan.append((st, tempo, dur))
            prev_end = st + dur
        json.dump({'anchors': [[0, 0], [TOTAL, TOTAL]], 'total': TOTAL}, open(os.path.join(ROOT, PATHS['edit']), 'w', encoding='utf-8'), indent=1)

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
    args = [a for i, a in enumerate(sys.argv[1:]) if not a.startswith('--') and sys.argv[i] != '--part']
    if not args:
        sys.exit(__doc__)
    main(args[0])
