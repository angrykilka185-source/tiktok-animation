# Step 2 of the «жажда» X-ray cover (the person seen from the side, an arm stretched out towards a glass of water):
# the forearm and hand (outside the CT scan) built from signed-distance bones with a cortical shell, like stage_hands.py
# (the hand lies flat in the picture, the palm towards the viewer — the classic AP radiograph, fingers apart), the soft
# tissue of the reaching arm and of the arm that hangs. (The glass of water is the next stage, stage_glass.py.)
# Positions are in the frame's millimetres: x — the picture's horizontal axis, y — the depth (it does not matter, the
# projection runs along it), z — up; «world» points (the CT's own axes) are turned into the view like stage_paw.py does.
# Usage: python3 -I stage_reach.py hr.npz reach.npz reach.json hr.json
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
def shell(t, w):
    def dens(d):
        outer = np.clip(0.5 - d / w, 0, 1)
        inner = np.clip(0.5 - (d + t) / w, 0, 1)
        return CORT * (outer - inner) + TRAB * inner
    return dens

def soft_dens(w):
    return lambda d: np.clip(0.5 - d / w, 0, 1) * 1.0

BP = np.zeros_like(B)  # procedural bones (blurred a little before adding, to match the CT sharpness)
SP_ = np.zeros_like(S)

def add_bone(nodes, t=0.9, vox=0.25):
    pts = np.array([n[0] for n in nodes]); rmax = max(n[1] for n in nodes) + 1.5
    lo, hi = pts.min(0) - rmax, pts.max(0) + rmax
    ix0, iz0, patch = project(lambda p: chain_sdf(p, nodes), lo, hi, vox, shell(t, vox))
    add(BP, ix0, iz0, patch)

def add_ellip(c, R, rad, t=0.7, vox=0.25):
    rmax = max(rad) + 1.5
    lo, hi = np.asarray(c) - rmax, np.asarray(c) + rmax
    ix0, iz0, patch = project(lambda p: ellip_sdf(p, c, R, np.asarray(rad, float)), lo, hi, vox, shell(t, vox))
    add(BP, ix0, iz0, patch)

def add_soft(sdf_fn, lo, hi, vox=1.0):
    ix0, iz0, patch = project(sdf_fn, lo, hi, vox, soft_dens(vox))
    add(SP_, ix0, iz0, patch)

FR = json.load(open(FRAME))
TH = np.deg2rad(FR.get('view_deg', 0.0)); RC = FR.get('rot_center_mm', [0.0, 0.0])
def to_view(p):
    x, y, z = p
    h = RC[0] + (x - RC[0]) * np.cos(TH) + (y - RC[1]) * np.sin(TH)
    d = RC[1] - (x - RC[0]) * np.sin(TH) + (y - RC[1]) * np.cos(TH)
    return np.array([h, d, z], float)

H = P['hand']
for side in [s_ for s_ in ('left', 'right') if 'arm_' + s_ in P]:
    A = P['arm_' + side]
    E = np.array(A['elbow'], float)
    Sh = np.array(A['shoulder'], float)
    W = np.array(A['wrist'], float)
    ang = np.deg2rad(A['hand_deg'])  # finger direction, from +z towards +x
    V = np.array([np.sin(ang), 0, np.cos(ang)])
    thumb_sign = A['thumb_x_sign']  # +1: thumb towards +x
    U = np.array([np.cos(ang), 0, -np.sin(ang)]) * thumb_sign
    U = U if (U[0] * thumb_sign) > 0 else -U
    N = np.array([0, 1.0, 0])
    sc = H['scale']
    def at(u, v, w=0.0):
        return W + (u * U + v * V) * sc + w * N

    # forearm: radius (thumb side) and ulna (little-finger side)
    fdir = nrm(W - E)
    side_u = U  # thumb side at the wrist
    rad_a, rad_b = E + side_u * 9 + fdir * 6, at(8, -4)
    uln_a, uln_b = E - side_u * 6 - fdir * 14, at(-12, -3)
    def lerp(a, b, t):
        return a + (b - a) * t
    rad_nodes = [(lerp(rad_a, rad_b, 0.0), 9.5), (lerp(rad_a, rad_b, 0.05), 10.0), (lerp(rad_a, rad_b, 0.10), 6.2),
                 (lerp(rad_a, rad_b, 0.18), 7.2), (lerp(rad_a, rad_b, 0.55), 6.4), (lerp(rad_a, rad_b, 0.9), 9.5), (lerp(rad_a, rad_b, 1.0), 10.5)]
    uln_nodes = [(lerp(uln_a, uln_b, 0.0), 9.5), (lerp(uln_a, uln_b, 0.07), 11.0), (lerp(uln_a, uln_b, 0.16), 8.0),
                 (lerp(uln_a, uln_b, 0.4), 6.4), (lerp(uln_a, uln_b, 0.85), 5.2), (lerp(uln_a, uln_b, 0.97), 7.0), (lerp(uln_a, uln_b, 1.0), 6.0)]
    add_bone(rad_nodes, t=1.8, vox=0.5)
    add_bone(uln_nodes, t=1.8, vox=0.5)
    # extra width of the distal radius
    add_ellip(at(10, -6), np.c_[U, V, N], (13 * sc, 7 * sc, 9 * sc), t=1.0, vox=0.3)

    # carpals (ellipsoids)
    for (u, v, ru, rv, rw) in H['carpals']:
        add_ellip(at(u, v), np.c_[U, V, N], (ru * sc, rv * sc, rw * sc), t=0.7)
    # metacarpals and phalanges
    for f in H['fingers']:
        b0 = np.array(f['base'], float)
        a_mc = np.deg2rad(f['mc_deg']); dmc = np.array([np.sin(a_mc), np.cos(a_mc)])
        p0 = b0; p1 = p0 + dmc * f['mc_len']
        rb, rs, rh = f['mc_r']
        add_bone(bone_nodes(at(*p0), at(*p1), rb * sc, rs * sc, rh * sc), t=1.0)
        a_f = np.deg2rad(f['f_deg'] * A.get('spread', 1.0) + A.get('fdeg_add', {}).get(f['name'], 0.0)); dfi = np.array([np.sin(a_f), np.cos(a_f)])
        q = p1 + dfi * (f['gap'] + rh * 0.4)
        for k, (ln, r3) in enumerate(zip(f['ph_len'], f['ph_r'])):
            q1 = q + dfi * ln
            add_bone(bone_nodes(at(*q), at(*q1), r3[0] * sc, r3[1] * sc, r3[2] * sc), t=0.8)
            dfi = np.array([np.sin(a_f + np.deg2rad(f.get('curl', 0)) * (k + 1)), np.cos(a_f + np.deg2rad(f.get('curl', 0)) * (k + 1))])
            q = q1 + dfi * f['gap']
        f['tip'] = q.tolist()
        tip3 = at(*q)
        print('TIP', side, f['name'], round((tip3[0] - CX0) / G - 0.5), round(CH - 1 - ((tip3[2] - CZ0) / G - 0.5)))

    # soft tissue: upper arm, forearm, palm, fingers
    up = [(Sh, A['r_upper'][0]), (lerp(Sh, E, 0.5), A['r_upper'][1]), (E, A['r_upper'][2])]
    fo = [(E, A['r_fore'][0]), (lerp(E, W, 0.55), A['r_fore'][1]), (W - fdir * 6, A['r_fore'][2])]
    for nodes in (up, fo):
        pts = np.array([n[0] for n in nodes]); rm = max(n[1] for n in nodes) + 2
        add_soft(lambda p, nodes=nodes: chain_sdf(p, nodes), pts.min(0) - rm, pts.max(0) + rm, vox=1.0)
    c = at(-1, 46, 4); R = np.c_[U, V, N]
    add_soft(lambda p: ellip_sdf(p, c, R, np.array([40.0, 52.0, 14.0]) * sc), c - 60, c + 60, vox=0.7)
    for f in H['fingers']:
        b0 = np.array(f['base'], float)
        a_mc = np.deg2rad(f['mc_deg']); p1 = b0 + np.array([np.sin(a_mc), np.cos(a_mc)]) * f['mc_len']
        tip = np.array(f['tip'])
        nodes = [(at(*p1, 3), f['soft_r'] * sc), (at(*tip, 3), f['soft_r'] * 0.8 * sc)]
        pts = np.array([n[0] for n in nodes]); rm = f['soft_r'] + 3
        add_soft(lambda p, nodes=nodes: chain_sdf(p, nodes), pts.min(0) - rm, pts.max(0) + rm, vox=0.6)

def lerp3(a, b, t):
    return a + (b - a) * t
# the arm that hangs: a sleeve of soft tissue (shoulder → elbow → on down)
for hg in P.get('hang', []):
    S_, E_ = to_view(np.array(hg['shoulder'], float)), to_view(np.array(hg['elbow'], float))
    W_ = E_ + nrm(E_ - S_) * hg.get('fore_len', 250)
    nodes = [(S_, hg['r'][0]), (lerp3(S_, E_, 0.5), hg['r'][1]), (E_, hg['r'][2]), (W_, hg['r'][3])]
    pts = np.array([n_[0] for n_ in nodes]); rm = max(hg['r']) + 2
    add_soft(lambda p, nodes=nodes: chain_sdf(p, nodes), pts.min(0) - rm, pts.max(0) + rm, vox=1.2)

BP = ndi.gaussian_filter(BP, P['proc_blur_px'])
# trabecular mottle on the procedural bones
noise = ndi.gaussian_filter(rng.standard_normal(BP.shape).astype(np.float32), 1.2)
BP *= 1 + 0.10 * noise / (noise.std() + 1e-6)
B += BP
S += ndi.gaussian_filter(SP_, 1.0) * P['arm_soft_k']
img = lambda arr: np.flipud(arr.T)
np.savez_compressed(OUT, B=B_img + img(B), S=S_img + img(S), BP=img(BP), SP=img(ndi.gaussian_filter(SP_, 1.0) * P['arm_soft_k']))
print('ok', BP.max(), SP_.max())
