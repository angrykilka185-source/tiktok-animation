#!/usr/bin/env python3
"""Loudness of fitted voice clips, one value per video frame (0 = silence, ~1 = loud speech).
Phone scenes use it to make the voice-message bubble and the waveform move with the voice.

usage: python3 scripts/voice-env.py g2b g13 g17 g19   (reads public/voice-g2b/<id>.mp3, writes src/g2b/env.json)
"""
import json
import os
import subprocess
import sys

import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SR, FPS = 16000, 30


def envelope(path):
    raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    hop = SR // FPS
    rms = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop + 1, hop)])
    ref = np.percentile(rms[rms > 0.01], 90) if np.any(rms > 0.01) else 1.0
    return [round(float(min(1.3, v / ref)), 2) for v in rms]


if __name__ == '__main__':
    part, ids = sys.argv[1], sys.argv[2:]
    out = os.path.join(ROOT, 'src', part, 'env.json')
    data = {i: envelope(os.path.join(ROOT, 'public', f'voice-{part}', f'{i}.mp3')) for i in ids}
    json.dump(data, open(out, 'w'))
    print({k: len(v) for k, v in data.items()}, '->', out)
