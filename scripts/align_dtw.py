#!/usr/bin/env python3
"""Where every word of the script is in a voice-over — without speech recognition or a downloaded model.

The text is turned into the sound it should make, in broad classes that are easy to hear in any voice:
vowels (voiced, loud), hissing consonants (с ш щ ч ц ф х з ж: noise above 3.5 kHz), sonorants (м н л р й в:
voiced, quieter), stops (a short closure) and pauses (at the punctuation). The recording is measured the same
way, frame by frame (40 ms): loudness, hiss, voicing. Dynamic time warping then lines the predicted track up
with the measured one along the whole recording (within a band around the straight line), so every word —
and every line start — gets a time. The hiss pattern of Russian («шесть», «сосуды», «спасательный») is a strong
fingerprint, and the pauses fix the rest.

align(audio, sr, texts) -> {'lines': [(start, end)], 'words': [[(word, start, end)]]}
"""
import math
import re

import numpy as np

from word_timing import num_words

HOP = 0.04
VOW = set('аеёиоуыэюя')
HISS = set('сшщчцфхзж')
SON = set('мнлрйв')
STOP = set('пткбдг')
PAUSE = {'line': 0.55, 'sent': 0.45, 'colon': 0.3, 'dash': 0.25, 'comma': 0.12, 'ell': 0.45}
# class -> predicted [silence, hiss, voicing]
PRED = {'V': (0.0, 0.0, 1.0), 'F': (0.0, 1.0, 0.1), 'N': (0.0, 0.0, 0.65), 'S': (0.6, 0.15, 0.1), 'P': (1.0, 0.0, 0.0)}
UNIT = {'V': 1.0, 'F': 0.85, 'N': 0.55, 'S': 0.5}


def spoken_word(tok):
    t = tok.lower().replace('*', '')
    t = re.sub(r'\d+', lambda m: ' ' + num_words(int(m.group(0))) + ' ', t)
    return re.sub(r'[^а-яё ]', '', t)


def text_track(texts):
    """phones: list of (class, units or seconds for 'P'), and for every word the index of its first/last phone"""
    phones, words = [], []
    for li, text in enumerate(texts):
        toks = text.replace('*', '').split()
        lw = []
        for t, tok in enumerate(toks):
            if tok in ('—', '–', '-'):
                if phones and phones[-1][0] != 'P':
                    phones.append(['P', PAUSE['dash']])
                continue
            sw = spoken_word(tok)
            first = len(phones)
            for ch in sw:
                if ch in VOW:
                    phones.append(['V', UNIT['V']])
                elif ch in HISS:
                    phones.append(['F', UNIT['F'] * (1.25 if ch == 'щ' else 1.0)])
                elif ch in SON:
                    phones.append(['N', UNIT['N']])
                elif ch in STOP:
                    phones.append(['S', UNIT['S']])
            lw.append((tok, first, max(first, len(phones) - 1)))
            end = tok.rstrip('»"\')')
            last = t == len(toks) - 1
            kind = 'line' if last else 'ell' if end.endswith('…') else 'sent' if end.endswith(('.', '!', '?')) else 'colon' if end.endswith(':') else 'comma' if end.endswith((',', ';')) else None
            if kind:
                phones.append(['P', PAUSE[kind]])
        words.append(lw)
    return phones, words


def audio_track(audio, sr):
    win = int(0.04 * sr)
    hop = int(HOP * sr)
    nfft = 4096  # >= 2 windows: the autocorrelation does not wrap around
    x = audio.astype(np.float64)
    frames = np.lib.stride_tricks.sliding_window_view(x, win)[::hop]
    f = np.fft.rfftfreq(nfft, 1 / sr)
    lag0, lag1 = int(sr / 400), int(sr / 70)
    E, hiss, vo = [], [], []
    for c in range(0, len(frames), 1500):
        fr = frames[c:c + 1500]
        X = np.abs(np.fft.rfft(fr * np.hanning(win), nfft, axis=1)) ** 2
        tot = X[:, (f > 80) & (f < 8000)].sum(axis=1) + 1e-12
        lo = X[:, (f > 100) & (f < 3000)].sum(axis=1) + 1e-12
        hi = X[:, (f > 3500) & (f < 10000)].sum(axis=1) + 1e-12
        E.append(10 * np.log10(tot))
        hiss.append(10 * np.log10(hi / lo))
        r = np.fft.irfft(X, nfft, axis=1)[:, :lag1 + 1]
        vo.append(np.clip(r[:, lag0:lag1 + 1].max(axis=1) / (r[:, 0] + 1e-12), 0, 1))
    E = np.concatenate(E)
    hiss = np.concatenate(hiss)
    vo = np.concatenate(vo)
    E = E - np.percentile(E, 99)
    sil = 1 / (1 + np.exp((E + 32) / 3))
    fric = (1 - sil) / (1 + np.exp(-(hiss + 2) / 2.5))
    voi = (1 - sil) * vo * (1 - fric)
    return np.stack([sil, fric, voi], axis=1)


def dtw_band(A, B, band, lam=0.05):
    """A: audio frames x 3, B: text frames x 3. Path cost with a Sakoe-Chiba band around the straight line.
    Returns for every text frame the audio frame it is matched to (first match)."""
    n, m = len(A), len(B)
    W = np.array([1.0, 1.6, 0.8])
    slope = m / n
    INF = 1e18
    D_prev = None
    lo_prev = 0
    back = []  # per row: (lo, from_diag flag array, run start array)
    for i in range(n):
        c = int(i * slope)
        lo = max(0, c - band)
        hi = min(m, c + band + 1)
        Cr = (((A[i][None, :] - B[lo:hi]) ** 2) * W).sum(axis=1) + lam
        if i == 0:
            D = np.cumsum(Cr) if lo == 0 else np.full(hi - lo, INF)
            back.append((lo, np.zeros(hi - lo, bool), np.zeros(hi - lo, np.int32)))
            D_prev, lo_prev = D, lo
            continue
        # M[j] = min(D_prev[j] + lam (vertical), D_prev[j-1] (diagonal)) on this row's columns
        idx = np.arange(lo, hi)
        up = np.full(hi - lo, INF)
        dg = np.full(hi - lo, INF)
        k = idx - lo_prev
        ok = (k >= 0) & (k < len(D_prev))
        up[ok] = D_prev[k[ok]] + lam
        k2 = k - 1
        ok2 = (k2 >= 0) & (k2 < len(D_prev))
        dg[ok2] = D_prev[k2[ok2]]
        M = np.minimum(up, dg)
        diag = dg <= up
        S = np.cumsum(Cr)
        Sprev = np.concatenate(([0.0], S[:-1]))
        val = M - Sprev
        run = np.minimum.accumulate(val)
        pos = np.arange(len(val))
        start = np.maximum.accumulate(np.where(val <= run + 1e-9, pos, 0))
        D = S + run
        back.append((lo, diag, start.astype(np.int32)))
        D_prev, lo_prev = D, lo
    # backtrack from the last cell
    i, j = n - 1, m - 1
    match = np.full(m, -1, dtype=np.int64)
    while i >= 0:
        lo, diag, start = back[i]
        jj = j - lo
        t = start[jj]  # the horizontal run in row i covers columns lo+t .. j
        for q in range(lo + t, j + 1):
            match[q] = i
        j = lo + t
        if i == 0:
            break
        j = j - 1 if diag[t] else j
        i -= 1
    # columns never visited (should not happen) take the previous value
    for q in range(m):
        if match[q] < 0:
            match[q] = match[q - 1] if q else 0
    return match


def align(audio, sr, texts, band_s=25.0, log=print):
    phones, words = text_track(texts)
    A = audio_track(audio, sr)
    speech = float((A[:, 0] < 0.5).sum()) * HOP
    units = sum(u for c, u in phones if c != 'P')
    pauses = sum(u for c, u in phones if c == 'P')
    sec_per_unit = max(0.02, (len(A) * HOP - pauses) / units)
    # text frames
    rows, ph_first = [], []
    for c, u in phones:
        dur = u if c == 'P' else u * sec_per_unit
        k = max(1, int(round(dur / HOP)))
        ph_first.append(len(rows))
        rows.extend([PRED[c]] * k)
    B = np.array(rows, dtype=np.float64)
    log(f'dtw: {len(A)} audio frames, {len(B)} text frames, speech {speech:.0f}s, {sec_per_unit * 1000:.0f} ms per sound unit')
    match = dtw_band(A, B, int(band_s / HOP))
    t_of = lambda ph: match[ph_first[ph]] * HOP
    out_words, out_lines = [], []
    for lw in words:
        ws = [(w, t_of(a), t_of(b) + HOP) for w, a, b in lw]
        out_words.append(ws)
        out_lines.append((ws[0][1], ws[-1][2]))
    return {'lines': out_lines, 'words': out_words}
