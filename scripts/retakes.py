#!/usr/bin/env python3
"""Clean a voice-over recorded by a person before it is matched to the script (no speech recognition).

* non-speech phrases (a cough, a loud breath, a click) are found by voicing: speech has a pitch, noise has not;
* re-read paragraphs: the recording is cut into blocks at long pauses, and a block that sounds like the
  beginning of the next block (the same words: DTW on a log-mel spectrogram) is an earlier take of it
  and is left out — the last take of a paragraph is kept.

usage: python3 scripts/retakes.py recording.mp3      (prints what would be left out)
fit-voiceover.py uses clean_segments() with --retakes.
"""
import math
import subprocess
import sys
import tempfile
import os
import wave

import numpy as np

HOP = 0.04  # feature rate 25 Hz
BLOCK_GAP = 0.7  # a pause this long separates paragraphs (blocks)


def logmel(audio, sr, bands=24):
    win = int(0.032 * sr)
    hop = int(HOP * sr)
    nfft = 1 << (win - 1).bit_length()
    frames = [audio[i:i + win] for i in range(0, max(1, len(audio) - win), hop)]
    X = np.abs(np.fft.rfft(np.array(frames) * np.hanning(win), nfft, axis=1)) ** 2
    mel = lambda f: 2595 * np.log10(1 + f / 700)
    imel = lambda m: 700 * (10 ** (m / 2595) - 1)
    pts = imel(np.linspace(mel(80), mel(7600), bands + 2))
    bins = np.floor((nfft + 1) * pts / sr).astype(int)
    fb = np.zeros((bands, X.shape[1]))
    for b in range(bands):
        lo, c, hi = bins[b], bins[b + 1], bins[b + 2]
        fb[b, lo:c] = (np.arange(lo, c) - lo) / max(1, c - lo)
        fb[b, c:hi] = (hi - np.arange(c, hi)) / max(1, hi - c)
    F = np.log(X @ fb.T + 1e-6)
    return (F - F.mean(axis=0)) / (F.std(axis=0) + 1e-6)


def voicing(audio, sr, a, b):
    """share of the loud 40 ms frames of [a, b) seconds that have a pitch (70-400 Hz)"""
    win = int(0.04 * sr)
    lo, hi = int(sr / 400), int(sr / 70)
    loud = voiced = 0
    for i in range(int(a * sr), max(int(a * sr) + 1, int(b * sr) - win), win // 2):
        fr = audio[i:i + win].astype(np.float64)
        if len(fr) < win:
            break
        e = 20 * math.log10(max(1e-9, float(np.sqrt(np.mean((fr / 32768.0) ** 2)))))
        if e < -45:
            continue
        loud += 1
        fr = fr - fr.mean()
        r = np.fft.irfft(np.abs(np.fft.rfft(fr, 2 * win)) ** 2)[:win]
        if r[0] > 0 and r[lo:hi].max() / r[0] > 0.45:
            voiced += 1
    return voiced / loud if loud else 0.0


def dtw_prefix(A, B):
    """cost of aligning all of A with a prefix of B (open end), per step; rows are computed vectorised"""
    C = np.sqrt(((A[:, None, :] - B[None, :, :]) ** 2).mean(axis=2))
    n, m = C.shape
    # first row: horizontal moves only
    D = np.cumsum(C[0])
    L = np.arange(1, m + 1, dtype=float)
    for i in range(1, n):
        M = np.minimum(D, np.concatenate(([np.inf], D[:-1])))
        S = np.cumsum(C[i])
        Sprev = np.concatenate(([0.0], S[:-1]))
        D = S + np.minimum.accumulate(M - Sprev)
    best = np.inf
    for j in range(m):
        v = D[j] / (n + j + 1)
        if v < best:
            best = v
    return best


def clean_segments(audio, sr, segs, log=print):
    """returns the phrases to keep and a list of (start, end, why) left out"""
    out = []
    keep = []
    for a, b in segs:
        if b - a < 1.5 and voicing(audio, sr, a, b) < 0.15:
            out.append((a, b, 'noise'))
        else:
            keep.append([a, b])
    # blocks of phrases between long pauses
    blocks, cur = [], [0]
    for q in range(1, len(keep)):
        if keep[q][0] - keep[q - 1][1] >= BLOCK_GAP:
            blocks.append(cur)
            cur = []
        cur.append(q)
    blocks.append(cur)
    F = logmel(audio.astype(np.float64) / 32768.0, sr)
    fr = lambda t: min(len(F) - 1, int(t / HOP))

    def score(a0, a1, b0, b1):
        if (a1 - a0) > 1.25 * (b1 - b0) or a1 - a0 < 0.4:
            return None
        A = F[fr(a0):fr(a1) + 1]
        B = F[fr(b0):fr(min(b1, b0 + (a1 - a0) * 1.4 + 0.5)) + 1]
        return dtw_prefix(A, B)

    # candidates: every block, and the tails of a block that start after a pause inside it (a take broken off
    # right after the previous paragraph), each compared with the beginning of the next block
    cands = []
    for x in range(len(blocks) - 1):
        nb = blocks[x + 1]
        b0, b1 = keep[nb[0]][0], keep[nb[-1]][1]
        bl = blocks[x]
        for t in range(len(bl)):
            q = bl[t]
            if t > 0 and keep[q][0] - keep[bl[t - 1]][1] < 0.3:
                continue
            if len(bl) - t > 6:
                continue
            a0, a1 = keep[q][0], keep[bl[-1]][1]
            c = score(a0, a1, b0, b1)
            if c is not None:
                cands.append((c, bl[t:], a0, a1, t == 0))
    whole = [c for c, _, _, _, w in cands if w]
    if not whole:
        return keep, out
    med = float(np.median(whole))
    drop = set()
    for c, qs, a0, a1, w in sorted(cands, key=lambda z: z[0]):
        if c < 0.62 * med and not drop.intersection(qs):
            drop.update(qs)
            out.append((a0, a1, f'retake (sounds like the start of the next paragraph, score {c / med:.2f})'))
    near = sorted(c / med for c, qs, _, _, _ in cands if not drop.intersection(qs))[:3]
    log(f'retake check: {len(blocks)} paragraphs, {len([o for o in out if o[2] != "noise"])} retakes, {len([o for o in out if o[2] == "noise"])} noises; closest kept scores {", ".join(f"{v:.2f}" for v in near)}')
    return [s for q, s in enumerate(keep) if q not in drop], sorted(out)


def segments(wav_path):
    det = subprocess.run(['ffmpeg', '-i', wav_path, '-af', 'silencedetect=noise=-38dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True).stderr
    import re
    starts = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', det)]
    ends = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', det)]
    w = wave.open(wav_path)
    total = w.getnframes() / w.getframerate()
    segs, t = [], 0.0
    for s, e in zip(starts, ends):
        if s - t > 0.05:
            segs.append([t, s])
        t = e
    if total - t > 0.05:
        segs.append([t, total])
    return segs


if __name__ == '__main__':
    src = sys.argv[1]
    tmp = tempfile.mkdtemp()
    wav = os.path.join(tmp, 'vo.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ac', '1', '-ar', '44100', wav], check=True)
    w = wave.open(wav)
    audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)
    keep, out = clean_segments(audio, 44100, segments(wav))
    for a, b, why in out:
        print(f'  left out {a:7.2f}-{b:7.2f}s  {why}')
