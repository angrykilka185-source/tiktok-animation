#!/usr/bin/env python3
"""Find places where the sound stops abruptly (level falls by >16 dB within 40 ms from a loud level).
usage: python3 scripts/find-cutoffs.py video.mp4"""
import subprocess, sys
import numpy as np
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-vn', '-ac', '1', '-ar', '44100', '-f', 's16le', '-'], capture_output=True).stdout
x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
sr, hop = 44100, 441
env = np.array([20 * np.log10(max(1e-9, float(np.sqrt(np.mean(x[i:i + hop] ** 2))))) for i in range(0, len(x) - hop, hop)])
hits = []
for k in range(len(env) - 6):
    before = env[k]
    after = env[k + 2:k + 5].max()
    if before > -32 and before - after > 16:
        t = k * 0.01
        if not hits or t - hits[-1] > 0.3:
            hits.append(t)
print(f'{len(hits)} abrupt stops:', ' '.join(f'{t:.2f}s' for t in hits))
