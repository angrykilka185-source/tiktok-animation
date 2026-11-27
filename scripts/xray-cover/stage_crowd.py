# Step 2 of the crowd X-ray (the «давка» cover): several figures from stage_hr.py are laid side by side and pressed
# together on the cover's frame. Each figure is moved, scaled, tilted and (optionally) mirrored; the middle one can be
# squeezed across the chest.
# Two ways to put them together:
#   - "layers": true — each person is a separate cut-out radiograph (the film tone and the silhouette of
#     stage_cutout.py), laid back to front: whoever stands in front covers those behind, as in a photo of a crowd.
#     Figures further back can be blurred a little ("blur", px), as if out of focus. Output: the finished PNG.
#   - otherwise the X-ray paths add up where the bodies overlap (one radiograph of everybody at once — necks and
#     spines then show through the chests in front of them). Output: npz with B and S for stage_cutout.py.
# Usage: python3 -I stage_crowd.py crowd.json out.(png|npz) [figure dir] [tone.json]   (figure paths are relative
#        to the figure dir, by default the folder of crowd.json; the tone is needed for "layers")
import sys, os, json, numpy as np
from scipy import ndimage as ndi

CFG, OUT = sys.argv[1], sys.argv[2]
C = json.load(open(CFG))
base = sys.argv[3] if len(sys.argv) > 3 else os.path.dirname(os.path.abspath(CFG))
W, H = C['W'], C['H']
cache = {}
vv, uu = np.mgrid[0:H, 0:W].astype(np.float32)


def warp(f):
    """the figure's bone and soft paths on the frame"""
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
    b = fade * ndi.map_coordinates(b0, coords, order=1, cval=0.0).astype(np.float32)
    s_ = fade * ndi.map_coordinates(s0, coords, order=1, cval=0.0).astype(np.float32)
    if f.get('blur'):
        b, s_ = ndi.gaussian_filter(b, f['blur']), ndi.gaussian_filter(s_, f['blur'])
    return b, s_


def tone(b, s, T, rng):
    """stage_cutout.py's film tone and silhouette for one figure"""
    ts = 1 - np.exp(-s / T['soft_lambda'])
    tb = 1 - np.exp(-b / T['bone_lambda'])
    val = T['film_base'] + T['soft_gain'] * ts + T['bone_gain'] * tb ** T['bone_gamma'] * (1 - T['bone_soft_mix'] * ts)
    blur = ndi.gaussian_filter(val, T['usm_sigma'])
    val = val + T['usm_amount'] * (val - blur)
    val = ndi.gaussian_filter(val, T['soften_px'])
    val += T['grain'] * ndi.gaussian_filter(rng.standard_normal(val.shape).astype(np.float32), 0.7)
    val = np.clip(val, 0, 1)
    m = (ndi.gaussian_filter(s, T['sil_sigma']) > T['sil_soft_mm']) | (ndi.gaussian_filter(b, 2.0) > T['sil_bone'])
    m = ndi.binary_opening(m, iterations=T['sil_open'])
    lab, n = ndi.label(m)
    if n > 1:
        sizes = ndi.sum(m, lab, range(1, n + 1))
        m = np.isin(lab, 1 + np.where(sizes >= T['sil_min_px'])[0])
    m = ndi.binary_fill_holes(m)
    alpha = np.clip(ndi.gaussian_filter(m.astype(np.float32), T['sil_aa']), 0, 1)
    return val, alpha


if C.get('layers'):
    from PIL import Image
    T = json.load(open(sys.argv[4]))
    rng = np.random.default_rng(T.get('seed', 5))
    img = np.ones((H, W), np.float32)  # the white page
    for f in C['figures']:  # back to front
        val, alpha = tone(*warp(f), T, rng)
        img = val * alpha + img * (1 - alpha)
        print('figure', f.get('name', f['src']), 'placed')
    Image.fromarray((np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)).convert('RGB').save(OUT)
else:
    B = np.zeros((H, W), np.float32)
    S = np.zeros((H, W), np.float32)
    for f in C['figures']:
        b, s_ = warp(f)
        B += b
        S += s_
        print('figure', f.get('name', f['src']), 'placed')
    np.savez_compressed(OUT, B=B, S=S)
print('saved', OUT)
