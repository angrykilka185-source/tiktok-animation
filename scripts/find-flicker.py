#!/usr/bin/env python3
"""Find single-frame flicker in a rendered video: a frame that differs from both neighbours while the neighbours agree
(so it is not a cut). Looks at the backgrounds (below the HUD, above the captions), whole frame and 6×4 tiles, so one
flickering house counts too. usage: python3 scripts/find-flicker.py out/rayon-2.mp4  (expected: 0 flicker frames)"""
import subprocess, sys, numpy as np
W, H = 108, 192
path = sys.argv[1]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
# look only above the captions and below the HUD (backgrounds), y 14%..58%
top = F[:, int(H * 0.14):int(H * 0.58), :]
hits = []
for k in range(1, len(top) - 1):
    a, b, c = top[k - 1], top[k], top[k + 1]
    d_ab = np.abs(b - a).mean(); d_ac = np.abs(c - a).mean(); d_bc = np.abs(c - b).mean()
    # regional: max over 6x4 tiles so a small flickering house counts
    tiles = lambda x, y: max(np.abs(x[i:i + 16, j:j + 18] - y[i:i + 16, j:j + 18]).mean() for i in range(0, x.shape[0] - 15, 16) for j in range(0, W - 17, 18))
    if d_ab > 2.5 and d_bc > 2.5 and d_ac < 0.5 * min(d_ab, d_bc):
        hits.append((k, round(d_ab, 1), round(d_ac, 1)))
    else:
        t_ab = tiles(b, a); t_bc = tiles(c, b); t_ac = tiles(c, a)
        if t_ab > 12 and t_bc > 12 and t_ac < 0.4 * min(t_ab, t_bc):
            hits.append((k, round(t_ab, 1), round(t_ac, 1)))
print(len(F), 'frames;', len(hits), 'flicker frames')
for h in hits[:60]:
    print(f"frame {h[0]} ({h[0] / 30:.2f}s) diff {h[1]} vs neighbours {h[2]}")
