#!/usr/bin/env python3
"""Word timings for the captions, measured on the fitted voice clips (no speech recognition).

Every line's clip is split into speech segments at its pauses. The words are matched to the
segments with dynamic programming: the expected length of a word comes from how it is spoken
(numbers and times are read out as words: "23:41" = "двадцать три сорок одна"), and pauses are
expected after punctuation. Inside a segment the words are spread by their spoken length.

usage: python3 scripts/word_timing.py --part g1     (re-times the clips in public/voice-g1/)
fit-voiceover.py calls word_timings() for every clip it writes.
"""
import json
import math
import os
import re
import subprocess
import sys

import numpy as np

SR = 16000
LEAD = 0.03  # captions light up a hair before the sound
VOWELS = set('аеёиоуыэюяaeiouy')
DASHES = ('—', '–', '-')
UNITS = ['ноль', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']
TEENS = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать']
TENS = {2: 'двадцать', 3: 'тридцать', 4: 'сорок', 5: 'пятьдесят', 6: 'шестьдесят', 7: 'семьдесят', 8: 'восемьдесят', 9: 'девяносто'}


def num_words(n):
    if n < 10:
        return UNITS[n]
    if n < 20:
        return TEENS[n - 10]
    if n < 100:
        return TENS[n // 10] + ('' if n % 10 == 0 else ' ' + UNITS[n % 10])
    return ' '.join(UNITS[int(d)] for d in str(n))


def spoken(token):
    t = token.lower()
    t = re.sub(r'(\d{1,2}):(\d{2})', lambda m: num_words(int(m.group(1))) + ' ' + (num_words(int(m.group(2))) if int(m.group(2)) >= 10 else 'ноль ' + UNITS[int(m.group(2))]), t)
    return re.sub(r'\d+', lambda m: ' ' + num_words(int(m.group(0))) + ' ', t)


def weight(token):
    letters = re.sub(r'[^a-zа-яё]', '', spoken(token))
    if not letters:
        return 0.0
    v = sum(ch in VOWELS for ch in letters)
    return max(1.6, 1.4 * v + (len(letters) - v))


def decode(path):
    raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def speech_segments(x):
    hop = SR // 100  # 10 ms frames, 20 ms windows
    n = max(1, (len(x) - 2 * hop) // hop)
    db = np.array([10 * math.log10(float(np.mean(x[i * hop:i * hop + 2 * hop] ** 2)) + 1e-12) for i in range(n)])
    sp = db > db.max() - 35
    segs, i = [], 0
    while i < n:
        if sp[i]:
            j = i
            while j < n and sp[j]:
                j += 1
            if segs and i - segs[-1][1] < 6:  # gaps under 60 ms are inside words
                segs[-1][1] = j
            else:
                segs.append([i, j])
            i = j
        else:
            i += 1
    # drop very short blips and breaths (much quieter than the words)
    segs = [s for s in segs if s[1] - s[0] >= 4 and db[s[0]:s[1]].max() > db.max() - 22]
    return [(a / 100, (b + 1) / 100) for a, b in segs] or [(0.0, len(x) / SR)]


def align(tokens, segs):
    """(start, end) in seconds for every token."""
    n, K = len(tokens), len(segs)
    w = [weight(t) for t in tokens]
    if sum(w) == 0:
        w = [1.0] * n
    brk = [bool(re.search(r'[.,!?…:;»]$', t)) or t in DASHES or (i + 1 < n and tokens[i + 1] in DASHES) for i, t in enumerate(tokens)]
    cw = np.concatenate([[0.0], np.cumsum(w)])
    sl = [b - a for a, b in segs]
    rate = sum(sl) / cw[-1]
    INF = float('inf')
    dp = [[INF] * (K + 1) for _ in range(n + 1)]
    back = {}
    dp[0][0] = 0.0
    for i in range(n):
        for k in range(K):
            if dp[i][k] == INF:
                continue
            for j in range(i + 1, n + 1):
                tw = cw[j] - cw[i]
                if tw <= 0:
                    continue
                speech, gapc = 0.0, 0.0
                for m in range(k + 1, K + 1):
                    speech += sl[m - 1]
                    if m - 1 > k:  # this group also spans the pause before segment m-1
                        gapc += 0.4 + 4 * (segs[m - 1][0] - segs[m - 2][1])
                    c = 4 * math.log(speech / (tw * rate)) ** 2 + gapc
                    if j < n and not brk[j - 1]:
                        c += 1.0  # a pause in the middle of a phrase
                    if dp[i][k] + c < dp[j][m]:
                        dp[j][m] = dp[i][k] + c
                        back[(j, m)] = (i, k)
    groups, j, m = [], n, K
    while (j, m) != (0, 0):
        i, k = back[(j, m)]
        groups.append((i, j, k, m))
        j, m = i, k
    times = [(0.0, 0.0)] * n
    for i, j, k, m in reversed(groups):
        parts = segs[k:m]
        plen = [b - a for a, b in parts]
        tot, tw = sum(plen), cw[j] - cw[i]

        def at(frac):
            target = frac * tot
            for (a, b), ln in zip(parts, plen):
                if target <= ln + 1e-9:
                    return a + target
                target -= ln
            return parts[-1][1]

        acc = 0.0
        for t in range(i, j):
            s0 = at(acc / tw)
            acc += w[t]
            times[t] = (s0, at(acc / tw))
    return times


def word_timings(path, text):
    tokens = text.split()
    times = align(tokens, speech_segments(decode(path)))
    return [{'w': t, 's': round(max(0.0, s - LEAD), 3), 'e': round(e, 3)} for t, (s, e) in zip(tokens, times)]


if __name__ == '__main__':
    part = sys.argv[sys.argv.index('--part') + 1] if '--part' in sys.argv else '1'
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    out_dir, tfile = {
        '1': ('public/voice', 'src/voice-timings.json'),
        '2': ('public/voice2', 'src/p2/voice-timings.json'),
        '3': ('public/voice3', 'src/p3/voice-timings.json'),
        '4': ('public/voice4', 'src/p4/voice-timings.json'),
        '5': ('public/voice5', 'src/p5/voice-timings.json'),
        '6': ('public/voice6', 'src/p6/voice-timings.json'),
        'g1': ('public/voice-g1', 'src/g1/voice-timings.json'),
        'g2': ('public/voice-g2', 'src/g2/voice-timings.json'),
    }[part]
    tpath = os.path.join(root, tfile)
    data = json.load(open(tpath, encoding='utf-8'))
    for lid, line in data['lines'].items():
        mp3 = os.path.join(root, out_dir, f'{lid}.mp3')
        if not os.path.exists(mp3):
            continue
        line['words'] = word_timings(mp3, line['text'])
        print(lid, ' '.join(f"{x['w']}@{x['s']:.2f}" for x in line['words']))
    json.dump(data, open(tpath, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('wrote', tfile)
