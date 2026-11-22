#!/usr/bin/env python3
"""Find where every line of the script starts in a voice-over, by its pauses (no speech recognition).

The script is cut into short text phrases at its punctuation; the recording is cut into speech phrases at its
pauses. A narrator (and ElevenLabs even more so) pauses where the text has a full stop, a dash, a colon, often
a comma — and almost never inside a phrase. So the two sequences are aligned with dynamic programming: runs of
text phrases are matched to runs of speech phrases by their spoken length (syllable-weighted letters), and the
pauses are checked against the punctuation: no pause between two lines or two sentences costs much, a pause in
the middle of a phrase costs much, a comma may go either way. Hundreds of anchors instead of 78 line lengths,
which keeps an expressive voice (slow here, fast there, long dramatic pauses) on track.

align_lines(segs, texts) -> [(k, j)] speech phrases k..j-1 of every line (a speech phrase that holds the end of
one line and the start of the next is split at the estimated moment: segs is changed in place).
"""
import math
import re

import numpy as np

from word_timing import weight

DASHES = ('—', '–', '-')
# the shortest pause expected after a phrase of this kind (s), and the price of no pause at all
MIN_PAUSE = {'line': 0.35, 'sent': 0.25, 'colon': 0.12, 'dash': 0.1, 'comma': 0.0}
NO_PAUSE = {'line': 4.0, 'sent': 1.2, 'colon': 0.4, 'dash': 0.3, 'comma': 0.08}


def text_phrases(texts):
    """[(line index, weight, kind)] in order; kind = what ends the phrase"""
    out = []
    for li, text in enumerate(texts):
        toks = text.replace('*', '').split()
        cur = 0.0
        for t, tok in enumerate(toks):
            if tok in DASHES:
                if cur > 0:
                    out.append([li, cur, 'dash'])
                    cur = 0.0
                continue
            cur += weight(tok)
            last = t == len(toks) - 1
            end = tok.rstrip('»"\')')
            kind = None
            if last:
                kind = 'line'
            elif end.endswith(('.', '!', '?', '…')):
                kind = 'sent'
            elif end.endswith(':'):
                kind = 'colon'
            elif end.endswith((',', ';')):
                kind = 'comma'
            if kind and cur > 0:
                out.append([li, cur, kind])
                cur = 0.0
        if cur > 0:
            out.append([li, cur, 'line'])
    return out


CHUNK_GAP = 0.25  # pauses shorter than this are inside a word or a phrase


def chunks_of(segs):
    """runs of speech phrases separated by real pauses: [(first seg, last seg + 1, start, end, speech)]"""
    out = []
    for q, (a, b) in enumerate(segs):
        if out and a - out[-1][3] < CHUNK_GAP:
            k, _, s0, _, sp = out[-1]
            out[-1] = (k, q + 1, s0, b, sp + (b - a))
        else:
            out.append((q, q + 1, a, b, b - a))
    return out


def _dp(ch, P, rate_of):
    n, m = len(P), len(ch)
    gaps = [ch[q + 1][2] - ch[q][3] for q in range(m - 1)]
    SD = np.concatenate(([0.0], np.cumsum([c[4] for c in ch])))
    INF = 1e18
    dp = np.full((n + 1, m + 1), INF)
    bk = {}
    dp[0, 0] = 0.0
    for p in range(n):
        for s in range(m):
            base = dp[p, s]
            if base >= INF:
                continue
            w = 0.0
            inner_t = 0.0
            for a in range(1, 7):
                if p + a > n:
                    break
                if a > 1:
                    k_prev = P[p + a - 2][2]
                    inner_t += 6.0 if k_prev == 'line' else NO_PAUSE[k_prev]
                    if inner_t > 8:
                        break
                w += P[p + a - 1][1]
                kind = P[p + a - 1][2]
                exp = w * rate_of(p + a - 1)
                inner_s = 0.0
                for b in range(1, 6):
                    if s + b > m:
                        break
                    if a > 1 and b > 1:
                        break
                    if b > 1:
                        inner_s += 0.8 + 2.0 * gaps[s + b - 2]
                    sp = SD[s + b] - SD[s]
                    c = 2.0 * math.log(sp / exp) ** 2 + inner_t + inner_s
                    if s + b < m:
                        g = gaps[s + b - 1]
                        if kind == 'line':
                            c += max(0.0, 0.45 - g) * 2
                        elif kind == 'comma' and g > 0.7:
                            c += (g - 0.7) * 0.5
                    v = base + c
                    if v < dp[p + a, s + b]:
                        dp[p + a, s + b] = v
                        bk[(p + a, s + b)] = (p, s)
    if dp[n, m] >= INF:
        raise ValueError('the recording does not follow the script')
    runs, key = [], (n, m)
    while key != (0, 0):
        p, s = bk[key]
        runs.append((p, key[0], s, key[1]))
        key = (p, s)
    runs.reverse()
    return runs, float(dp[n, m])


def align_lines(segs, texts, log=print):
    P = text_phrases(texts)
    ch = chunks_of(segs)
    W = sum(x[1] for x in P)
    rate = sum(c[4] for c in ch) / W
    runs, score = _dp(ch, P, lambda q: rate)
    # the voice speeds up and slows down: a local rate per line (median of the lines around), and once more
    L = len(texts)
    for _ in range(2):
        lw = [0.0] * L
        ls = [0.0] * L
        for p0, p1, s0, s1 in runs:
            sp = sum(ch[q][4] for q in range(s0, s1))
            tw = sum(P[q][1] for q in range(p0, p1))
            for q in range(p0, p1):
                lw[P[q][0]] += P[q][1]
                ls[P[q][0]] += sp * P[q][1] / tw
        lr = [ls[i] / lw[i] if lw[i] else rate for i in range(L)]
        sm = [float(np.median(lr[max(0, i - 2):i + 3])) for i in range(L)]
        runs, score = _dp(ch, P, lambda q: sm[P[q][0]])
    log(f'aligned {len(P)} text phrases to {len(ch)} spoken chunks (score {score:.1f})')
    # every line starts with the chunk that holds its first phrase; a chunk shared by two lines is split
    starts = {}
    for p0, p1, s0, s1 in runs:
        for q in range(p0, p1):
            li = P[q][0]
            if li in starts:
                continue
            if q == p0:
                starts[li] = ('chunk', s0)
            else:
                k0, k1, a, b, _ = ch[s0]
                tw = sum(P[z][1] for z in range(p0, p1))
                acc = sum(P[z][1] for z in range(p0, q))
                starts[li] = ('split', s0, a + (b - a) * acc / tw)
    first = []
    for i in range(L):
        v = starts[i]
        if v[0] == 'chunk':
            first.append(ch[v[1]][0])
        else:
            t = v[2]
            log(f'  line {i + 1} starts without a pause at {t:.2f}s')
            k0, k1 = ch[v[1]][0], ch[v[1]][1]
            q = next((z for z in range(k0, k1) if segs[z][0] >= t - 0.15), k1 - 1)
            first.append(q)
    groups = [(first[i], first[i + 1] if i + 1 < L else len(segs)) for i in range(L)]
    return groups, score
