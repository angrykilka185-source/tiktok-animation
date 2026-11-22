#!/usr/bin/env python3
"""Which phrases of a voice-over belong to which line of the script — robust to an expressive voice.

The plain length of a line is a weak clue when the narrator slows down and speeds up (ElevenLabs v3/v4 do).
Two counts do not depend on the pace: the syllables (peaks of loudness in the vowel band) and the hissing
sounds (с ш щ ч ц ф х з ж: bursts of noise above 3.5 kHz). Every candidate group of speech phrases is scored
on its syllables, its hisses and (weakly) its length against the line's text, and on the pause after it
(a new line begins after a pause). Dynamic programming finds the best split of the whole recording.

match_lines(audio, sr, segs, texts, rate_hint) -> [(k, j)] phrase ranges per line, plus a report
"""
import math
import re

import numpy as np

from word_timing import num_words

VOW = set('аеёиоуыэюя')
HISS = set('сшщчцфхзж')


def spoken(text):
    t = text.lower().replace('*', '')
    t = re.sub(r'\d+', lambda m: ' ' + num_words(int(m.group(0))) + ' ', t)
    return re.sub(r'[^а-яё]', '', t)


def frame_feats(audio, sr, hop=0.01):
    """per 10 ms: loudness in the vowel band (dB) and hiss (dB of 3.5-10 kHz over 100-3000 Hz)"""
    win = int(0.03 * sr)
    h = int(hop * sr)
    nfft = 2048
    f = np.fft.rfftfreq(nfft, 1 / sr)
    x = audio.astype(np.float64)
    frames = np.lib.stride_tricks.sliding_window_view(x, win)[::h]
    vb, hs, en = [], [], []
    for c in range(0, len(frames), 4000):
        X = np.abs(np.fft.rfft(frames[c:c + 4000] * np.hanning(win), nfft, axis=1)) ** 2
        lo = X[:, (f > 100) & (f < 3000)].sum(axis=1) + 1e-12
        hi = X[:, (f > 3500) & (f < 10000)].sum(axis=1) + 1e-12
        band = X[:, (f > 300) & (f < 3000)].sum(axis=1) + 1e-12
        vb.append(10 * np.log10(band))
        hs.append(10 * np.log10(hi / lo))
        en.append(10 * np.log10(lo + hi))
    return np.concatenate(vb), np.concatenate(hs), np.concatenate(en)


def events(vb, hs, en, hop=0.01):
    """times of syllable nuclei and of hiss bursts"""
    top = np.percentile(en, 99)
    loud = en > top - 35
    v = np.convolve(vb, np.ones(5) / 5, mode='same')
    thr = np.percentile(v, 99) - 25
    nuc = []
    for i in range(1, len(v) - 1):
        if v[i] >= v[i - 1] and v[i] > v[i + 1] and v[i] > thr:
            lo = max(0, i - 12)
            if v[i] - v[lo:i].min() >= 2 and v[i] - v[i + 1:i + 13].min() >= 2:
                if nuc and i - nuc[-1] < 7:
                    if v[i] > v[nuc[-1]]:
                        nuc[-1] = i
                else:
                    nuc.append(i)
    hz = np.convolve(hs, np.ones(3) / 3, mode='same')
    on = (hz > -2) & loud
    hiss, i = [], 0
    while i < len(on):
        if on[i]:
            j = i
            while j < len(on) and on[j]:
                j += 1
            if j - i >= 4:  # 40 ms or longer
                if hiss and i - hiss[-1][1] < 6:
                    hiss[-1] = (hiss[-1][0], j)
                else:
                    hiss.append((i, j))
            i = j
        else:
            i += 1
    return np.array(nuc) * hop, np.array([(a + b) / 2 for a, b in hiss]) * hop


def match_lines(audio, sr, segs, texts, max_segs=26, log=print):
    vb, hs, en = frame_feats(audio, sr)
    nuc, hiss = events(vb, hs, en)
    n, m = len(segs), len(texts)
    dur = np.array([b - a for a, b in segs])
    cnt = lambda ev: np.array([((ev >= a - 0.02) & (ev <= b + 0.02)).sum() for a, b in segs], dtype=float)
    SN = np.concatenate(([0.0], np.cumsum(cnt(nuc))))
    SH = np.concatenate(([0.0], np.cumsum(cnt(hiss))))
    SD = np.concatenate(([0.0], np.cumsum(dur)))
    gaps = [segs[q + 1][0] - segs[q][1] for q in range(n - 1)]
    sp = [spoken(t) for t in texts]
    V = np.array([sum(ch in VOW for ch in s) for s in sp], dtype=float)
    H = np.array([sum(ch in HISS for ch in s) for s in sp], dtype=float)
    kv = SN[-1] / V.sum()
    kh = SH[-1] / H.sum()
    kd = SD[-1] / V.sum()
    log(f'lines by syllables and hisses: {int(SN[-1])} syllables found for {int(V.sum())} vowels, {int(SH[-1])} hisses for {int(H.sum())} letters')
    INF = 1e18

    def cost(i, k, j):
        ns, nh, d = SN[j] - SN[k], SH[j] - SH[k], SD[j] - SD[k]
        ev, eh, ed = V[i] * kv, H[i] * kh, V[i] * kd
        c = 3.0 * ((ns - ev) / math.sqrt(ev + 4)) ** 2 / 4  # syllables: count noise ~ sqrt
        c += 2.0 * ((nh - eh) / math.sqrt(eh + 3)) ** 2 / 4
        c += 1.0 * math.log(max(d, 0.05) / ed) ** 2
        if j < n:
            c += max(0.0, 0.32 - gaps[j - 1]) * 8  # a new line starts after a pause
        return c

    dp = np.full((m + 1, n + 1), INF)
    bk = np.full((m + 1, n + 1), -1, dtype=np.int64)
    dp[0, 0] = 0
    for i in range(m):
        for k in range(n):
            if dp[i, k] >= INF:
                continue
            for j in range(k + 1, min(n, k + max_segs) + 1):
                if n - j < m - i - 1:
                    break
                v = dp[i, k] + cost(i, k, j)
                if v < dp[i + 1, j]:
                    dp[i + 1, j] = v
                    bk[i + 1, j] = k
    groups, j = [], n
    for i in range(m, 0, -1):
        k = int(bk[i, j])
        groups.append((k, j))
        j = k
    groups.reverse()
    report = []
    for i, (k, j) in enumerate(groups):
        report.append((i, segs[k][0], segs[j - 1][1], (SN[j] - SN[k]) / (V[i] * kv), (SH[j] - SH[k]) / max(1.0, H[i] * kh), (SD[j] - SD[k]) / (V[i] * kd)))
    return groups, report
