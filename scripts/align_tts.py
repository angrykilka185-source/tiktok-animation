#!/usr/bin/env python3
"""Where every word of the script is in a voice-over — offline, no speech recognition model.

The way aeneas does it: the script is spoken by a plain local synthesizer (espeak-ng, word by word, with pauses
at the punctuation), so the position of every word in that synthetic track is known. Both tracks are turned
into MFCC frames (the shape of the sound, not the voice), and dynamic time warping lines them up: first coarse
over the whole recording, then fine in a narrow corridor around the coarse path. Every word of the script then
gets its time in the real recording.

usage: python3 scripts/align_tts.py voice.mp3 src/z1/voice-lines.json out.json
align(wav_path, texts) -> {'lines': [(start, end)], 'words': [[(word, start, end)]]}
needs: apt-get install espeak-ng
"""
import json
import os
import re
import subprocess
import sys
import tempfile
import wave

import numpy as np

SR = 16000
PAUSE = {'line': 0.45, 'sent': 0.35, 'colon': 0.2, 'dash': 0.18, 'comma': 0.1, 'ell': 0.35}


def read_wav(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float64) / 32768.0


def say(words, tmp, speed):
    """synthesise every word on its own (one espeak call for all: words separated by SSML breaks is unreliable,
    so each word is a line of its own and espeak is run once per word)"""
    out = []
    for k, w in enumerate(words):
        f = os.path.join(tmp, f'w{k}.wav')
        subprocess.run(['espeak-ng', '-v', 'ru', '-s', str(speed), '-w', f, w], check=True, capture_output=True)
        out.append(read_wav(f))
    return out


def tokens(text):
    toks = []
    for tok in text.replace('*', '').split():
        if tok in ('—', '–', '-'):
            if toks:
                toks[-1][1] = toks[-1][1] or 'dash'
            continue
        end = tok.rstrip('»"\')')
        kind = 'ell' if end.endswith('…') else 'sent' if end.endswith(('.', '!', '?')) else 'colon' if end.endswith(':') else 'comma' if end.endswith((',', ';')) else None
        word = re.sub(r'[«»"()]', '', tok).strip('.,!?…:;')
        toks.append([word, kind, tok])
    if toks:
        toks[-1][1] = 'line'
    return toks


def mfcc(x, hop=0.01, n=13):
    x = np.append(x[0], x[1:] - 0.97 * x[:-1])
    win = int(0.025 * SR)
    h = int(hop * SR)
    nfft = 512
    frames = np.lib.stride_tricks.sliding_window_view(x, win)[::h]
    P = np.abs(np.fft.rfft(frames * np.hamming(win), nfft, axis=1)) ** 2
    mel = lambda f: 2595 * np.log10(1 + f / 700)
    imel = lambda m: 700 * (10 ** (m / 2595) - 1)
    pts = imel(np.linspace(mel(60), mel(7600), 28))
    bins = np.floor((nfft + 1) * pts / SR).astype(int)
    fb = np.zeros((26, P.shape[1]))
    for b in range(26):
        lo, c, hi = bins[b], bins[b + 1], bins[b + 2]
        fb[b, lo:c] = (np.arange(lo, c) - lo) / max(1, c - lo)
        fb[b, c:hi] = (hi - np.arange(c, hi)) / max(1, hi - c)
    E = np.log(P @ fb.T + 1e-10)
    k = np.arange(26)
    dct = np.cos(np.pi / 26 * (k[None, :] + 0.5) * np.arange(n)[:, None])
    C = E @ dct.T
    C[:, 0] = E.mean(axis=1)  # loudness, normalised below
    D = np.gradient(C, axis=0)
    F = np.concatenate([C, D * 2], axis=1)
    return (F - F.mean(axis=0)) / (F.std(axis=0) + 1e-9)


def dtw_corridor(A, B, lo, hi):
    """A: rows (synthetic) x d, B: columns (recording) x d; row i may only use columns lo[i]..hi[i]-1
    (lo, hi non-decreasing). Returns for every row the first column on the best path."""
    n = len(A)
    INF = 1e18
    D_prev, lo_prev = None, 0
    diag_rows, start_rows = [], []
    for i in range(n):
        l, h = lo[i], hi[i]
        Cr = np.sqrt(((A[i][None, :] - B[l:h]) ** 2).mean(axis=1))
        if i == 0:
            D = np.cumsum(Cr) if l == 0 else np.full(h - l, INF)
            diag_rows.append(np.zeros(h - l, bool))
            start_rows.append(np.zeros(h - l, np.int32))
            D_prev, lo_prev = D, l
            continue
        idx = np.arange(l, h)
        k = idx - lo_prev
        up = np.full(h - l, INF)
        dg = np.full(h - l, INF)
        ok = (k >= 0) & (k < len(D_prev))
        up[ok] = D_prev[k[ok]]
        ok2 = (k - 1 >= 0) & (k - 1 < len(D_prev))
        dg[ok2] = D_prev[k[ok2] - 1]
        M = np.minimum(up, dg)
        S = np.cumsum(Cr)
        Sp = np.concatenate(([0.0], S[:-1]))
        val = M - Sp
        run = np.minimum.accumulate(val)
        pos = np.arange(len(val))
        start = np.maximum.accumulate(np.where(val <= run + 1e-9, pos, 0)).astype(np.int32)
        D = S + run
        diag_rows.append(dg <= up)
        start_rows.append(start)
        D_prev, lo_prev = D, l
    # back: row i holds columns lo[i]+start .. j
    first = np.zeros(n, dtype=np.int64)
    i, j = n - 1, hi[n - 1] - 1
    while i >= 0:
        l = lo[i]
        t = int(start_rows[i][j - l])
        first[i] = l + t
        if i == 0:
            break
        j = l + t - 1 if diag_rows[i][t] else l + t
        i -= 1
    return first


def speech_mask(x, hop=0.02):
    h = int(hop * SR)
    e = np.array([np.sqrt(np.mean(x[i:i + h] ** 2)) + 1e-9 for i in range(0, len(x) - h + 1, h)])
    db = 20 * np.log10(e)
    return (db > np.percentile(db, 99) - 38).astype(float)


def align(wav_path, texts, speed=None, log=print):
    rec = read_wav(wav_path)
    lines = [tokens(t) for t in texts]
    tmp = tempfile.mkdtemp()
    spd = speed or 150
    synth, bounds, pos = [], [], 0
    for li, l in enumerate(lines):
        f = os.path.join(tmp, f'l{li}.wav')
        txt = ' '.join(w[2] for w in l).replace('*', '')
        subprocess.run(['espeak-ng', '-v', 'ru', '-s', str(spd), '-w', f, txt], check=True, capture_output=True)
        c = read_wav(f)
        nz = np.where(np.abs(c) > 0.01)[0]
        c = c[max(0, nz[0] - 80): nz[-1] + 80] if len(nz) else c[:160]
        # words inside the line: spread by their letters (a rough guide; only the line borders are used)
        lets = [max(1, len(re.sub(r'[^а-яё0-9]', '', w[0].lower()))) for w in l]
        tot = sum(lets)
        acc, lb = 0, []
        for w, n in zip(l, lets):
            lb.append((w[2], (pos + len(c) * acc / tot) / SR, (pos + len(c) * (acc + n) / tot) / SR))
            acc += n
        bounds.append(lb)
        synth.append(c)
        pos += len(c)
        gap = int(PAUSE['line'] * SR)
        synth.append(np.zeros(gap))
        pos += gap
    S = np.concatenate(synth)
    log(f'tts: synthetic {len(S) / SR:.0f}s for a recording of {len(rec) / SR:.0f}s')
    A = mfcc(S, 0.02)
    B = mfcc(rec, 0.02)
    # speech / silence as a strong extra dimension: pauses must meet pauses
    ma, mb = speech_mask(S), speech_mask(rec)
    A = np.concatenate([A[:, 1:], 3.0 * ma[:len(A), None] if len(ma) >= len(A) else np.pad(3.0 * ma, (0, len(A) - len(ma)))[:, None]], axis=1)
    B = np.concatenate([B[:, 1:], 3.0 * mb[:len(B), None] if len(mb) >= len(B) else np.pad(3.0 * mb, (0, len(B) - len(mb)))[:, None]], axis=1)
    # coarse pass at 80 ms in a wide band around the straight line, then a fine pass at 20 ms around it
    Ac, Bc = A[::4], B[::4]
    n, m = len(Ac), len(Bc)
    band = int(45 / 0.08)
    c = (np.arange(n) * (m - 1) / max(1, n - 1)).astype(int)
    lo = np.clip(c - band, 0, m - 1)
    hi = np.clip(c + band + 1, 1, m)
    lo = np.minimum.accumulate(lo[::-1])[::-1]
    lo[0] = 0
    hi = np.maximum.accumulate(hi)
    hi[-1] = m
    coarse = dtw_corridor(Ac, Bc, lo, hi)
    n2, m2 = len(A), len(B)
    cc = np.interp(np.arange(n2) / 4, np.arange(n), coarse) * 4
    w2 = int(1.5 / 0.02)
    lo2 = np.clip(cc.astype(int) - w2, 0, m2 - 1)
    hi2 = np.clip(cc.astype(int) + w2 + 1, 1, m2)
    lo2 = np.minimum.accumulate(lo2[::-1])[::-1]
    lo2[0] = 0
    hi2 = np.maximum.accumulate(hi2)
    hi2[-1] = m2
    fine = dtw_corridor(A, B, lo2, hi2)
    to_rec = lambda t: fine[min(len(fine) - 1, int(t / 0.02))] * 0.02
    out_words = [[(w, to_rec(a), to_rec(b)) for w, a, b in lb] for lb in bounds]
    return {'lines': [(lw[0][1], lw[-1][2]) for lw in out_words], 'words': out_words, 'synthetic': len(S) / SR}


if __name__ == '__main__':
    wav, lj, out = sys.argv[1:4]
    texts = [l['text'] for l in json.load(open(lj, encoding='utf-8'))['lines']]
    res = align(wav, texts, speed=int(os.environ['SPEED']) if os.environ.get('SPEED') else None)
    json.dump(res, open(out, 'w'), ensure_ascii=False)
    for i, (a, b) in enumerate(res['lines']):
        print(f'{i + 1:3d} {a:7.2f}-{b:7.2f}  {texts[i][:60]}')


def subseq_dtw(T, R):
    """open-begin / open-end DTW of a template T (rows) inside R (columns), steps (1,1) (1,2) (2,1): the recording
    may run between half and twice the template's pace. Returns per end column: cost per step, start column."""
    n, m = len(T), len(R)
    INF = 1e18
    cost = lambda i: np.sqrt(((T[i][None, :] - R) ** 2).mean(axis=1))
    D1 = cost(0)  # row i-1
    L1 = np.ones(m)
    S1 = np.arange(m)
    D2 = np.full(m, INF)  # row i-2
    L2 = np.ones(m)
    S2 = np.arange(m)
    sh = lambda x, k, fill: np.concatenate((np.full(k, fill, dtype=x.dtype), x[:-k]))
    for i in range(1, n):
        Cr = cost(i)
        cands = [(sh(D1, 1, INF), sh(L1, 1, 1.0), sh(S1, 1, 0)),
                 (sh(D1, 2, INF), sh(L1, 2, 1.0), sh(S1, 2, 0)),
                 (sh(D2, 1, INF), sh(L2, 1, 1.0), sh(S2, 1, 0))]
        best = None
        for d, l, st in cands:
            r = d / l
            if best is None:
                best = [r, d, l, st]
            else:
                take = r < best[0]
                best = [np.where(take, r, best[0]), np.where(take, d, best[1]), np.where(take, l, best[2]), np.where(take, st, best[3])]
        D = best[1] + Cr
        L = best[2] + 1
        S = best[3]
        D2, L2, S2 = D1, L1, S1
        D1, L1, S1 = D, L, S
    return D1 / L1, S1


def locate_lines(wav_path, texts, guesses, window=25.0, speed=150, log=print):
    """every line on its own: its synthetic sound searched in the recording around the guessed start.
    returns per line [(start, end, score)] candidates, best first"""
    rec = read_wav(wav_path)
    B = mfcc(rec, 0.02)
    mb = speech_mask(rec)
    B = np.concatenate([B[:, 1:], 3.0 * np.pad(mb, (0, max(0, len(B) - len(mb))))[:len(B), None]], axis=1)
    tmp = tempfile.mkdtemp()
    out = []
    for li, text in enumerate(texts):
        f = os.path.join(tmp, f'l{li}.wav')
        subprocess.run(['espeak-ng', '-v', 'ru', '-s', str(speed), '-w', f, text.replace('*', '')], check=True, capture_output=True)
        c = read_wav(f)
        nz = np.where(np.abs(c) > 0.01)[0]
        c = c[max(0, nz[0] - 80): nz[-1] + 80]
        A = mfcc(c, 0.02)
        ma = speech_mask(c)
        A = np.concatenate([A[:, 1:], 3.0 * np.pad(ma, (0, max(0, len(A) - len(ma))))[:len(A), None]], axis=1)
        g0, g1 = guesses[li]
        a = max(0, int((g0 - window) / 0.02))
        b = min(len(B), int((g1 + window) / 0.02))
        score, st = subseq_dtw(A, B[a:b])
        # candidates: local minima of the end score, at least 1.5 s apart
        order = np.argsort(score)
        cands = []
        for j in order:
            if len(cands) >= 3:
                break
            if all(abs(j - k) > 75 for k, _, _ in cands):
                cands.append((j, st[j], score[j]))
        out.append([((a + s0) * 0.02, (a + j) * 0.02, float(sc)) for j, s0, sc in cands])
        log(f'{li + 1:3d} ' + '  '.join(f'{s:7.2f}-{e:7.2f} ({sc:.3f})' for s, e, sc in out[-1]))
    return out
