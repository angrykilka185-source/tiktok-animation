# Step 3 of the X-ray cover: the coffin (wooden walls seen edge-on, lid and bottom boards, nails, side handles) around the
# projected body, one radiographic tone curve, edge enhancement and film grain; outside the coffin cut-out: white.
# Usage: python3 -I stage_final.py hands.npz hr.json coffin.json xray.png
import sys, json, numpy as np
from scipy import ndimage as ndi
from PIL import Image

IN, FRAME, COF, OUT = sys.argv[1:5]
z = np.load(IN)
B, S = z['B'].astype(np.float32), z['S'].astype(np.float32)
F = json.load(open(FRAME))['frame']
C = json.load(open(COF))
if 'SP' in z.files:  # the hands' soft tissue and bones can be lifted on their own (they are thin next to the head)
    S = S + (C.get('hand_soft_boost', 1.0) - 1.0) * z['SP'].astype(np.float32)
    B = B + (C.get('hand_bone_boost', 1.0) - 1.0) * z['BP'].astype(np.float32)
W, H, s = F['W'], F['H'], F['px_per_mm']
rng = np.random.default_rng(C.get('seed', 3))
u = np.arange(W)[None, :] + 0.5
v = np.arange(H)[:, None] + 0.5
X = F['x_center_mm'] + (u - W / 2) / s + 0 * v   # mm
Z = F['z_top_mm'] - (v - F['v_top']) / s + 0 * u

def poly_sdf(pts):
    pts = np.asarray(pts, float)
    d = np.full(X.shape, np.inf); sg = np.ones(X.shape)
    n = len(pts)
    for i in range(n):
        a, b = pts[i], pts[(i + 1) % n]
        e = b - a
        wx, wz = X - a[0], Z - a[1]
        t = np.clip((wx * e[0] + wz * e[1]) / (e @ e), 0, 1)
        qx, qz = wx - t * e[0], wz - t * e[1]
        d = np.minimum(d, np.hypot(qx, qz))
        c1 = Z >= a[1]; c2 = Z < b[1]; c3 = e[0] * wz > e[1] * wx
        flip = (c1 & c2 & c3) | (~c1 & ~c2 & ~c3)
        sg = np.where(flip, -sg, sg)
    return sg * d

def seg_sdf(a, b, r):
    a, b = np.asarray(a, float), np.asarray(b, float)
    e = b - a
    wx, wz = X - a[0], Z - a[1]
    t = np.clip((wx * e[0] + wz * e[1]) / (e @ e), 0, 1)
    return np.hypot(wx - t * e[0], wz - t * e[1]) - r

xc = C['axis_x_mm']
top, hw_top = C['head_z_mm'], C['head_half_mm']
zs, hw_sh = C['shoulder_z_mm'], C['shoulder_half_mm']
zf, hw_ft = C['foot_z_mm'], C['foot_half_mm']
inner = [(xc - hw_top, top), (xc + hw_top, top), (xc + hw_sh, zs), (xc + hw_ft, zf), (xc - hw_ft, zf), (xc - hw_sh, zs)]
d_in = poly_sdf(inner)           # < 0 inside the coffin
wall = C['wall_mm']
d_out = d_in - wall              # < 0 inside the outer outline

def aa(d, w=0.6):  # antialiased step: 1 inside (d < 0)
    return np.clip(0.5 - d * s / w, 0, 1)

in_box = aa(d_in)
in_outer = aa(d_out)
wall_m = in_outer - in_box       # the walls, edge-on

# wood grain: streaks along the boards (vertical in the lid and side walls, horizontal in the head board)
def streaks(sv, su, seed):
    r = np.random.default_rng(seed).standard_normal((H, W)).astype(np.float32)
    g = ndi.gaussian_filter(r, (sv, su))
    return g / (g.std() + 1e-6)
slow = ndi.gaussian_filter(np.random.default_rng(15).standard_normal((H, W)).astype(np.float32), 45)
slow /= slow.std() + 1e-6
gv = 0.55 * streaks(70, 1.8, 11) + 0.25 * streaks(16, 0.9, 12) + 0.45 * slow
gh = 0.55 * streaks(1.8, 70, 13) + 0.25 * streaks(0.9, 16, 14) + 0.45 * slow
head_board = (Z > top - 2) & (np.abs(X - xc) < hw_top + wall + 5)
grain = np.where(head_board, gh, gv)

# lid + bottom boards: a thin haze everywhere inside, with plank seams along the coffin
lid = C['lid_water_mm'] * (1 + C['lid_grain'] * gv) * in_outer
for sx in C['lid_seams_x_mm']:
    lid *= 1 - C['seam_depth'] * np.exp(-((X - (xc + sx)) * s / 2.2) ** 2) * in_box
walls = C['wall_gain'] * (1 + C['wall_grain'] * grain) * wall_m
# metal: nails (seen end-on), side handles with brackets — placed from the outline
def side_pt(t, sign, off):
    # point on the upper slanted side (head corner -> shoulder corner), pushed outwards by off (mm)
    a = np.array([xc + sign * hw_top, top]); b = np.array([xc + sign * hw_sh, zs])
    e = (b - a) / np.linalg.norm(b - a)
    n = np.array([e[1], -e[0]]) * (1 if sign > 0 else -1)
    if n[0] * sign < 0: n = -n
    return a + (b - a) * t + n * off, e, n
def low_pt(zq, sign, off):
    a = np.array([xc + sign * hw_sh, zs]); b = np.array([xc + sign * hw_ft, zf])
    t = (zs - zq) / (zs - zf)
    e = (b - a) / np.linalg.norm(b - a)
    n = np.array([e[1], -e[0]]);
    if n[0] * sign < 0: n = -n
    return a + (b - a) * t + n * off
nails = [(xc + dx, top + wall / 2) for dx in C['head_nails_dx']]
for sign in (-1, 1):
    nails += [tuple(side_pt(t, sign, wall / 2)[0]) for t in C['side_nails_t']]
    nails += [tuple(low_pt(zq, sign, wall / 2)) for zq in C['low_nails_z']]
handles = []
for sign in (-1, 1):
    t0, t1 = C['handle_t']
    p0, e, n = side_pt(t0, sign, wall); p1, _, _ = side_pt(t1, sign, wall)
    off = C['handle_off_mm']
    q0, q1 = p0 + n * off, p1 + n * off
    pl = C['plate_half_mm']
    handles.append({'a': q0, 'b': q1, 'brackets': [(p0, q0), (p1, q1)], 'plates': [(p0 - e * pl, p0 + e * pl), (p1 - e * pl, p1 + e * pl)]})
metal = np.zeros((H, W), np.float32)
def disc(cx, cz, r, soft=0.8):
    return np.clip(0.5 - (np.hypot(X - cx, Z - cz) - r) * s / soft, 0, 1)
for (nx, nz) in nails:
    metal += C['nail_core'] * disc(nx, nz, C['nail_r_mm']) + C['nail_head'] * disc(nx, nz, C['nail_head_r_mm'], 2.5)
handle = np.zeros((H, W), np.float32)   # coverage (for the cut-out)
hpath = np.zeros((H, W), np.float32)    # metal path: round bars are thicker in the middle
def bar(p, q, r, level=1.0):
    d = seg_sdf(p, q, r) + r                       # distance from the axis
    prof = np.sqrt(np.clip(1 - (d / r) ** 2, 0, 1))
    return aa(d - r), level * prof
for hdl in handles:
    for (p, q, r, lv) in [(hdl['a'], hdl['b'], C['bar_r_mm'], 1.0)] + [(p, q, C['bracket_r_mm'], 1.0) for (p, q) in hdl['brackets']] + \
            [(p, q, C['plate_r_mm'], C['plate_level']) for (p, q) in hdl['plates']]:
        cov, pr = bar(p, q, r, lv)
        handle = np.maximum(handle, cov)
        hpath = np.maximum(hpath, pr)
metal += C['handle_metal'] * hpath

# ---- radiographic tone
soft_path = S * in_box + lid
bone_path = B * in_box + metal
ts = 1 - np.exp(-soft_path / C['soft_lambda'])
tb = 1 - np.exp(-bone_path / C['bone_lambda'])
val = C['film_base'] + C['soft_gain'] * ts + walls + C['bone_gain'] * tb ** C['bone_gamma'] * (1 - C['bone_soft_mix'] * ts)
# edge enhancement like a digital radiograph, then a little blur and film grain
blur = ndi.gaussian_filter(val, C['usm_sigma'])
val = val + C['usm_amount'] * (val - blur)
val = ndi.gaussian_filter(val, C['soften_px'])
val += C['grain'] * ndi.gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), 0.7)
val = np.clip(val, 0, 1)

# ---- cut-out: a thin black film margin around the coffin (and its handles), white page outside
cut_d = np.minimum(d_out - C['margin_mm'], ndi.distance_transform_edt(handle < 0.5) / s - C['margin_mm'])
film = aa(cut_d, 1.0)
inside_x = np.clip(in_outer + handle, 0, 1)
img = np.where(inside_x > 0, val * inside_x + C['film_black'] * (1 - inside_x), C['film_black'])
img = img * film + 1.0 * (1 - film)
out = (np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)
Image.fromarray(out).convert('RGB').save(OUT)
print('saved', OUT)
