# The bear paw for the X-ray cover of «Каково это — умереть от лап медведя»: a big brown bear's front paw and forearm built
# from signed-distance bones with a cortical shell (thick radius and ulna, carpals, five digits), long hooked claws
# (a bony core inside a keratin sheath, kept in their own channel K), soft tissue of the paw and forearm; plus the soft
# tissue of the person's lowered upper arms (the CT has them raised). Projected straight into the frame.
# Usage: python3 -I stage_paw.py hr.npz paw.npz paw.json hr.json
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
B = np.zeros((CW, CH), np.float32)
S = np.zeros((CW, CH), np.float32)
rng = np.random.default_rng(7)

def nrm(v):
    v = np.asarray(v, float)
    return v / np.linalg.norm(v)

def sd_round_cone(p, a, b, r1, r2):
    ba = b - a
    l2 = ba @ ba
    rr = r1 - r2
    a2 = l2 - rr * rr
    il2 = 1.0 / l2
    pa = p - a
    y = pa @ ba
    zz = y - l2
    q = pa * l2 - y[..., None] * ba
    x2 = np.einsum('...i,...i->...', q, q)
    y2 = y * y * l2
    z2 = zz * zz * l2
    k = np.sign(rr) * rr * rr * x2
    d1 = np.sqrt(x2 + z2) * il2 - r2
    d2 = np.sqrt(x2 + y2) * il2 - r1
    d3 = (np.sqrt(np.maximum(x2 * a2 * il2, 0)) + y * rr) * il2 - r1
    return np.where(np.sign(zz) * a2 * z2 > k, d1, np.where(np.sign(y) * a2 * y2 < k, d2, d3))

def chain_sdf(p, nodes):
    d = None
    for (a, ra), (b, rb) in zip(nodes[:-1], nodes[1:]):
        di = sd_round_cone(p, a, b, ra, rb)
        d = di if d is None else np.minimum(d, di)
    return d

def bone_nodes(a, b, rb, rs, rh):
    a, b = np.asarray(a, float), np.asarray(b, float)
    prof = [(0.0, rb * 0.85), (0.07, rb), (0.28, rs * 1.12), (0.6, rs), (0.86, rh), (1.0, rh * 0.78)]
    return [(a + (b - a) * t, r) for t, r in prof]

def ellip_sdf(p, c, R, rad):
    # approximate SDF of an ellipsoid with centre c, rotation R (columns = axes), radii rad
    q = (p - c) @ R
    k0 = np.linalg.norm(q / rad, axis=-1)
    k1 = np.linalg.norm(q / (rad * rad), axis=-1)
    return k0 * (k0 - 1.0) / np.maximum(k1, 1e-9)

def project(sdf_fn, lo, hi, vox, dens):
    """Evaluate a bone in its bounding box (mm) on a grid of size vox, return its (x,z) projection added to B."""
    lo = np.asarray(lo, float); hi = np.asarray(hi, float)
    # align x/z to the canvas grid so that fine pixels nest in canvas pixels
    f = max(1, int(round(G / vox)))
    vox = G / f
    ix0 = int(np.floor((lo[0] - CX0) / G)); ix1 = int(np.ceil((hi[0] - CX0) / G))
    iz0 = int(np.floor((lo[2] - CZ0) / G)); iz1 = int(np.ceil((hi[2] - CZ0) / G))
    xs = (CX0 + ix0 * G + (np.arange((ix1 - ix0) * f) + 0.5) * vox).astype(np.float32)
    zs = (CZ0 + iz0 * G + (np.arange((iz1 - iz0) * f) + 0.5) * vox).astype(np.float32)
    ys = (np.arange(lo[1], hi[1], vox) + vox / 2).astype(np.float32)
    step = max(1, int(3e6 / (len(xs) * len(zs))))
    acc = np.zeros((len(xs), len(zs)), np.float32)
    for j0 in range(0, len(ys), step):  # chunk along y to bound memory
        yy = ys[j0:j0 + step]
        Pg = np.stack(np.meshgrid(xs, yy, zs, indexing='ij'), -1)
        d = sdf_fn(Pg)
        acc += dens(d).sum(axis=1) * vox
    # down-sample f x f fine pixels into canvas pixels
    acc = acc.reshape(ix1 - ix0, f, iz1 - iz0, f).mean(axis=(1, 3))
    return ix0, iz0, acc

def add(target, ix0, iz0, patch):
    x0, z0 = max(ix0, 0), max(iz0, 0)
    x1, z1 = min(ix0 + patch.shape[0], CW), min(iz0 + patch.shape[1], CH)
    if x1 > x0 and z1 > z0:
        target[x0:x1, z0:z1] += patch[x0 - ix0:x1 - ix0, z0 - iz0:z1 - iz0]

CORT, TRAB = P['cortex_hu'], P['trab_hu']
def shell(t, w, trab=None):
    tb = TRAB if trab is None else trab  # the inside: marrow in long-bone shafts, cancellous bone elsewhere
    def dens(d):
        outer = np.clip(0.5 - d / w, 0, 1)
        inner = np.clip(0.5 - (d + t) / w, 0, 1)
        return CORT * (outer - inner) + tb * inner
    return dens

def soft_dens(w):
    return lambda d: np.clip(0.5 - d / w, 0, 1) * 1.0

BP = np.zeros_like(B)  # procedural bones (blurred a little before adding, to match the CT sharpness)
SP_ = np.zeros_like(S)

def add_bone(nodes, t=0.9, vox=0.25, trab=None):
    pts = np.array([n[0] for n in nodes]); rmax = max(n[1] for n in nodes) + 1.5
    lo, hi = pts.min(0) - rmax, pts.max(0) + rmax
    ix0, iz0, patch = project(lambda p: chain_sdf(p, nodes), lo, hi, vox, shell(t, vox, trab))
    add(BP, ix0, iz0, patch)

def add_ellip(c, R, rad, t=0.7, vox=0.25, trab=None):
    rmax = max(rad) + 1.5
    lo, hi = np.asarray(c) - rmax, np.asarray(c) + rmax
    ix0, iz0, patch = project(lambda p: ellip_sdf(p, c, R, np.asarray(rad, float)), lo, hi, vox, shell(t, vox, trab))
    add(BP, ix0, iz0, patch)

def add_soft(sdf_fn, lo, hi, vox=1.0):
    ix0, iz0, patch = project(sdf_fn, lo, hi, vox, soft_dens(vox))
    add(SP_, ix0, iz0, patch)


K = np.zeros((CW, CH), np.float32)
def kdens(w):
    return lambda d: np.clip(0.5 - d / w, 0, 1) * 1.0
def add_k(nodes, vox=0.3):
    pts = np.array([n[0] for n in nodes]); rmax = max(n[1] for n in nodes) + 1.5
    ix0, iz0, patch = project(lambda p: chain_sdf(p, nodes), pts.min(0) - rmax, pts.max(0) + rmax, vox, kdens(vox))
    add(K, ix0, iz0, patch)

def bend(d, w, deg):
    wp = w - (w @ d) * d
    wp = wp / (np.linalg.norm(wp) + 1e-9)
    f = np.deg2rad(deg)
    return nrm(np.cos(f) * d - np.sin(f) * wp)

pw = P['paw']
W0 = np.array(pw['wrist'], float)
V = nrm(pw['v_dir'])
Wp = nrm(pw['w_plane'])
al = np.deg2rad(pw['roll_deg'])
Wd = nrm(np.cos(al) * Wp + np.sin(al) * np.array([0, 1.0, 0]))
U = nrm(np.cross(V, Wd))
SC = pw.get('scale', 1.0)  # the whole paw is scaled about the wrist
def at(u, v, w=0.0):
    return W0 + (u * U + v * V + w * Wd) * SC

# forearm: radius and ulna, thick, from the wrist back to the elbow (out of the frame)
fd = nrm(pw['forearm_dir'])
def lerp(a, b, t):
    return a + (b - a) * t
ro, uo = pw['radius_off'], pw['ulna_off']
ra = at(*ro); rb_ = ra + fd * pw['forearm_len'] + nrm(pw['bones_spread']) * pw['spread_mm']
ua = at(*uo); ub = ua + fd * (pw['forearm_len'] + 30) - nrm(pw['bones_spread']) * pw['spread_mm']
k_ = SC
add_bone([(lerp(ra, rb_, 0.0), 20 * k_), (lerp(ra, rb_, 0.06), 19 * k_), (lerp(ra, rb_, 0.2), 12.5 * k_), (lerp(ra, rb_, 0.6), 11.5 * k_), (lerp(ra, rb_, 0.95), 13 * k_), (lerp(ra, rb_, 1.0), 12 * k_)], t=2.6, vox=0.6, trab=pw['marrow'])
add_bone([(lerp(ua, ub, 0.0), 12 * k_), (lerp(ua, ub, 0.04), 13 * k_), (lerp(ua, ub, 0.2), 10.5 * k_), (lerp(ua, ub, 0.7), 11 * k_), (lerp(ua, ub, 0.95), 17 * k_), (lerp(ua, ub, 1.0), 15 * k_)], t=2.4, vox=0.6, trab=pw['marrow'])
# carpals
for (u, v, w, ru, rv, rw) in pw['carpals']:
    add_ellip(at(u, v, w), np.c_[U, V, Wd], (ru * SC, rv * SC, rw * SC), t=1.0, vox=0.4, trab=pw['carpal_trab'])
# digits: metacarpal and phalanges (flexing a little at each joint), then the claw
tips = []
for dg in pw['digits']:
    a = np.deg2rad(dg['fan_deg'])
    d = nrm(np.sin(a) * U + np.cos(a) * V)
    p = at(dg['base'][0], dg['base'][1], dg.get('w', 0.0))
    first = True
    for (L, r3, flex) in dg['bones']:
        d = bend(d, Wd, flex)
        q = p + d * L * SC
        add_bone(bone_nodes(p, q, *[r * SC for r in r3]), t=1.8 if first else 1.4, vox=0.35, trab=pw['digit_trab'])
        first = False
        p = q + d * pw['gap'] * SC
    # the claw: an arc curving towards the palm; the bony core inside the first part of the keratin sheath
    c = pw['claw']
    n = 14
    step = c['len'] * SC / n
    pts = [p.copy()]
    dd = d.copy()
    for i in range(n):
        dd = bend(dd, Wd, c['bend_deg'] / n)
        pts.append(pts[-1] + dd * step)
    rk = [(c['r0'] + (c['r1'] - c['r0']) * (i / n) ** 0.85) * SC for i in range(n + 1)]
    add_k([(pts[i], rk[i]) for i in range(n + 1)])
    nb = int(round(n * c['core_frac']))
    rc = [(c['core_r0'] + (c['core_r1'] - c['core_r0']) * (i / nb)) * SC for i in range(nb + 1)]
    add_bone([(pts[i], rc[i]) for i in range(nb + 1)], t=1.2, vox=0.3, trab=pw['core_trab'])
    tips.append(pts[-1])
    tip = pts[-1]
    print('CLAW TIP', dg['name'], round((tip[0] - CX0) / G - 0.5), round(CH - 1 - ((tip[2] - CZ0) / G - 0.5)))
    dg['_end'] = p.tolist()

# soft tissue: forearm, the paw, the digits
fo = [(at(0, -12), pw['r_fore'][0]), (at(0, -12) + fd * 200, pw['r_fore'][1]), (at(0, -12) + fd * 420, pw['r_fore'][2])]
pts = np.array([n_[0] for n_ in fo]); rm = max(n_[1] for n_ in fo) + 2
add_soft(lambda p, nodes=fo: chain_sdf(p, nodes), pts.min(0) - rm, pts.max(0) + rm, vox=1.2)
c0 = at(*pw['pad_c']); R = np.c_[U, V, Wd]
add_soft(lambda p: ellip_sdf(p, c0, R, np.array(pw['pad_r'], float) * SC), c0 - 110, c0 + 110, vox=0.8)
for dg in pw['digits']:
    a = np.deg2rad(dg['fan_deg'])
    d = nrm(np.sin(a) * U + np.cos(a) * V)
    p0 = at(dg['base'][0], dg['base'][1]) + d * dg['bones'][0][0] * 0.8 * SC
    p1 = np.array(dg['_end'])
    nodes = [(p0, pw['r_digit'][0] * SC), (p1, pw['r_digit'][1] * SC)]
    pts = np.array([n_[0] for n_ in nodes]); rm = pw['r_digit'][0] * SC + 3
    add_soft(lambda p, nodes=nodes: chain_sdf(p, nodes), pts.min(0) - rm, pts.max(0) + rm, vox=0.8)
# the person's lowered upper arms (turned like the person when the CT is seen from another side)
FR = json.load(open(FRAME))
TH = np.deg2rad(FR.get('view_deg', 0.0)); RC = FR.get('rot_center_mm', [0.0, 0.0])
def to_view(p):
    x, y, z = p
    h = RC[0] + (x - RC[0]) * np.cos(TH) + (y - RC[1]) * np.sin(TH)
    d = RC[1] - (x - RC[0]) * np.sin(TH) + (y - RC[1]) * np.cos(TH)
    return np.array([h, d, z], float)
for arm_ in P['upper_arms']:
    S_, E_ = to_view(np.array(arm_['shoulder'], float)), to_view(np.array(arm_['elbow'], float))
    nodes = [(S_, arm_['r'][0]), (lerp(S_, E_, 0.5), arm_['r'][1]), (E_, arm_['r'][2])]
    pts = np.array([n_[0] for n_ in nodes]); rm = max(arm_['r']) + 2
    add_soft(lambda p, nodes=nodes: chain_sdf(p, nodes), pts.min(0) - rm, pts.max(0) + rm, vox=1.2)

BP = ndi.gaussian_filter(BP, P['proc_blur_px'])
noise = ndi.gaussian_filter(rng.standard_normal(BP.shape).astype(np.float32), P.get('noise_blur', 1.2))
BP *= 1 + P.get('noise_k', 0.10) * noise / (noise.std() + 1e-6)
img = lambda arr: np.flipud(arr.T)
np.savez_compressed(OUT, B=B_img + img(BP), S=S_img + img(ndi.gaussian_filter(SP_, 1.0)), K=img(ndi.gaussian_filter(K, 0.6)), BP=img(BP))
print('ok', BP.max(), SP_.max(), K.max())
