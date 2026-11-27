# Step 2 of the crowd X-ray (the «давка» cover): several figures from stage_hr.py are laid side by side and pressed
# together on the cover's frame. Each figure is moved, scaled, tilted and (optionally) mirrored; the middle one can be
# squeezed across the chest. X-ray paths add up where the bodies overlap — the overlaps come out denser, as in a real
# radiograph of people pressed against each other.
# Output: npz with B (bone path) and S (soft path) in frame pixels, for stage_cutout.py.
# Usage: python3 -I stage_crowd.py crowd.json crowd.npz [figure dir]   (figure paths are relative to the figure dir,
#        by default the folder of crowd.json)
import sys, os, json, numpy as np
from scipy import ndimage as ndi

CFG, OUT = sys.argv[1], sys.argv[2]
C = json.load(open(CFG))
base = sys.argv[3] if len(sys.argv) > 3 else os.path.dirname(os.path.abspath(CFG))
W, H = C['W'], C['H']
B = np.zeros((H, W), np.float32)
S = np.zeros((H, W), np.float32)
cache = {}
for f in C['figures']:
    src = os.path.join(base, f['src'])
    if src not in cache:
        z = np.load(src)
        cache[src] = (z['B'].astype(np.float32), z['S'].astype(np.float32))
    b0, s0 = cache[src]
    # where the figure is: its midline x and the top of its head, in the source pixels (found in the render: the
    # first row with tissue, and the middle of the skull's bone below it) and on the frame
    if 'top_src' in f:
        cxs, tops = f['cx_src'], f['top_src']
    else:
        tops = int(np.where((s0 > 20).sum(axis=1) > 3)[0][0])
        head = b0[tops:tops + 300]
        cxs = float((head.sum(axis=0) * np.arange(b0.shape[1])).sum() / head.sum())
    sc = f['scale']  # frame pixels per source pixel
    th = np.deg2rad(f.get('tilt_deg', 0.0))  # + leans the head to the right
    piv = np.array(f.get('pivot', [f['x'], f['y_top'] + 300]), float)  # the tilt turns about this frame point
    vv, uu = np.mgrid[0:H, 0:W].astype(np.float32)
    # frame -> unrotated frame (about the pivot) -> source
    du, dv = uu - piv[0], vv - piv[1]
    c, s = np.cos(th), np.sin(th)
    ru = c * du + s * dv + piv[0]
    rv = -s * du + c * dv + piv[1]
    sx = (ru - f['x']) / sc
    sy = (rv - f['y_top']) / sc + tops
    if f.get('mirror', False):
        sx = -sx
    q = f.get('squeeze')
    if q:
        # narrower across the chest: k = 1 down to y0, easing to k at y1 and below (source rows under the head top)
        t = np.clip((sy - tops - q['y0']) / (q['y1'] - q['y0']), 0, 1)
        k = 1 - (1 - q['k']) * (t * t * (3 - 2 * t))
        sx = sx / k
    sx = sx + cxs
    coords = np.stack([sy, sx])
    # a figure whose render ends above the frame's bottom (one further back, smaller) fades out over its last rows
    # instead of ending in a straight seam
    fade = np.clip((b0.shape[0] - 1 - sy) / f.get('fade_px', 80), 0, 1).astype(np.float32)
    B += fade * ndi.map_coordinates(b0, coords, order=1, cval=0.0).astype(np.float32)
    S += fade * ndi.map_coordinates(s0, coords, order=1, cval=0.0).astype(np.float32)
    print('figure', f.get('name', f['src']), 'placed')
np.savez_compressed(OUT, B=B, S=S)
print('saved', OUT, B.max(), S.max())
