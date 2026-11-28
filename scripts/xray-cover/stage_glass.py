# Step 3 of the «жажда» X-ray cover: a glass of water on the picture of stage_reach.py — a tapered tumbler with a thick
# base. The walls go into the bone channel (thin glass is nearly invisible in a real radiograph, so its density is
# exaggerated: bright edges where the ray runs along the wall, a faint film over the faces), the water into the soft
# channel (also exaggerated, so that the water level shows against the empty upper part), plus a thin bright line at
# the water level (the meniscus). Positions in the frame's millimetres, like stage_reach.py.
# Usage: python3 -I stage_glass.py in.npz out.npz thirst.json hr.json
import sys, json, numpy as np
from scipy import ndimage as ndi

IN, OUT, POSE, FRAME = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
z = np.load(IN)
B_img, S_img = z['B'], z['S']
P = json.load(open(POSE))
F = json.load(open(FRAME))['frame']
G = 1.0 / F['px_per_mm']
CW, CH = F['W'], F['H']
CX0 = F['x_center_mm'] - (CW / 2) * G
CZ0 = F['z_top_mm'] - (CH - F['v_top']) * G
GB = np.zeros((CW, CH), np.float32)
GS = np.zeros((CW, CH), np.float32)

def project(sdf_fn, lo, hi, vox, dens):
    """Evaluate a shape in its bounding box (mm) on a grid of size vox, return its (x,z) projection."""
    lo = np.asarray(lo, float); hi = np.asarray(hi, float)
    f = max(1, int(round(G / vox)))
    vox = G / f
    ix0 = int(np.floor((lo[0] - CX0) / G)); ix1 = int(np.ceil((hi[0] - CX0) / G))
    iz0 = int(np.floor((lo[2] - CZ0) / G)); iz1 = int(np.ceil((hi[2] - CZ0) / G))
    xs = (CX0 + ix0 * G + (np.arange((ix1 - ix0) * f) + 0.5) * vox).astype(np.float32)
    zs = (CZ0 + iz0 * G + (np.arange((iz1 - iz0) * f) + 0.5) * vox).astype(np.float32)
    ys = (np.arange(lo[1], hi[1], vox) + vox / 2).astype(np.float32)
    step = max(1, int(3e6 / (len(xs) * len(zs))))
    acc = np.zeros((len(xs), len(zs)), np.float32)
    for j0 in range(0, len(ys), step):
        yy = ys[j0:j0 + step]
        Pg = np.stack(np.meshgrid(xs, yy, zs, indexing='ij'), -1)
        acc += dens(sdf_fn(Pg)).sum(axis=1) * vox
    acc = acc.reshape(ix1 - ix0, f, iz1 - iz0, f).mean(axis=(1, 3))
    return ix0, iz0, acc

def add(target, ix0, iz0, patch):
    x0, z0 = max(ix0, 0), max(iz0, 0)
    x1, z1 = min(ix0 + patch.shape[0], CW), min(iz0 + patch.shape[1], CH)
    if x1 > x0 and z1 > z0:
        target[x0:x1, z0:z1] += patch[x0 - ix0:x1 - ix0, z0 - iz0:z1 - iz0]

g = P['glass']
h0, y0, z0 = g['base_c']
HT, rb, rt, wl, bt = g['height'], g['r_base'], g['r_top'], g['wall'], g['base_thick']
zw = z0 + bt + (HT - bt) * g['fill']
def r_o(z):
    return rb + (rt - rb) * np.clip((z - z0) / HT, 0, 1)
def rho(p):
    return np.hypot(p[..., 0] - h0, p[..., 1] - y0)
def sd_glass(p):
    z = p[..., 2]
    d_o = rho(p) - r_o(z)
    d_i = rho(p) - (r_o(z) - wl)
    side_ = np.maximum.reduce([d_o, -d_i, z - (z0 + HT), z0 - z])
    base = np.maximum.reduce([d_o, z0 - z, z - (z0 + bt)])
    return np.minimum(side_, base)
def sd_water(p):
    z = p[..., 2]
    return np.maximum.reduce([rho(p) - (r_o(z) - wl), (z0 + bt) - z, z - zw])
def sd_line(p):  # a thin disc at the water level
    z = p[..., 2]
    return np.maximum.reduce([rho(p) - (r_o(z) - wl * 0.5), np.abs(z - zw) - g.get('line_mm', 1.2)])
lo = np.array([h0 - rt - 4, y0 - rt - 4, z0 - 4]); hi = np.array([h0 + rt + 4, y0 + rt + 4, z0 + HT + 4])
gv = g.get('vox', 0.4)
dens = lambda k: (lambda d: np.clip(0.5 - d / gv, 0, 1) * k)
for fn, k, tgt in ((sd_glass, g['glass_hu'], GB), (sd_line, g.get('line_hu', 0.0), GB), (sd_water, g['water_k'], GS)):
    if k:
        ix0, iz0, patch = project(fn, lo, hi, gv, dens(k))
        add(tgt, ix0, iz0, patch)
GS = ndi.gaussian_filter(GS, 0.8)
GB = ndi.gaussian_filter(GB, 0.7)
img = lambda arr: np.flipud(arr.T)
np.savez_compressed(OUT, B=B_img + img(GB), S=S_img + img(GS))
print('glass at', h0, z0, 'water level z', round(zw, 1), 'ok')
