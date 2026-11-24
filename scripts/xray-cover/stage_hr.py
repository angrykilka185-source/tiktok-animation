# Step 1 of the X-ray cover — the CT part, rendered straight into the 1920x1080 frame (super-resolved):
#   1) the CT (TotalSegmentator s1380, CC BY 4.0) is edited on its own 1.5 mm grid: the table removed, the raised arms cut
#      away above smoothly rounded shoulders, the jaw opened (the lower face turned about the jaw joint);
#   2) it is resampled with cubic splines on a fine grid and projected front-to-back; soft and bone densities go through
#      steep sigmoids of the interpolated HU, so skin and bone edges come out crisp instead of 1.5 mm blocky.
# Output: npz with B (bone path, HU*mm) and S (soft path, water-mm) in frame pixels (row = v, col = u).
# Usage: python3 -I stage_hr.py <dir with ct.nii.gz and segmentations/> hr.npz hr.json
import sys, json, numpy as np, nibabel as nib
from scipy import ndimage as ndi
from matplotlib.path import Path as MPath
from multiprocessing import Pool

D, OUT, POSE = sys.argv[1], sys.argv[2], sys.argv[3]
P = json.load(open(POSE))
F = P['frame']
VX = 1.5
a = np.asarray(nib.load(f'{D}/ct.nii.gz').dataobj).astype(np.float32)
NX, NY, NZ = a.shape

def seg(n):
    return np.asarray(nib.load(f'{D}/segmentations/{n}.nii.gz').dataobj) > 0

# ---- body without the table
body = a > -400
lab, n = ndi.label(body)
body = lab == (1 + int(np.argmax(ndi.sum(body, lab, range(1, n + 1)))))
for z in range(NZ):
    body[:, :, z] = ndi.binary_fill_holes(body[:, :, z])

# ---- cut the raised arms: keep the head and neck, round the shoulders
X = np.arange(NX)[:, None, None].astype(np.float32)
Z = np.arange(NZ)[None, None, :].astype(np.float32)
xc, nh = P['head_x_vox'], P['neck_half']
e = np.clip(np.abs(X - xc) - nh, 0, None)
zsh = np.where(X < xc, P['shoulder_z'][0], P['shoulder_z'][1]).astype(np.float32)
zmax = zsh - P['shoulder_lin'] * e - P['shoulder_quad'] * e * e
keep = ((e == 0) | (Z <= zmax)) & (np.abs(X - xc) <= P['trunk_half'])
body &= np.broadcast_to(keep, body.shape)

# ---- the head: only tissue close to the skull (drops the scanner visor in front of the forehead and the raised arm
#      that touches the head); nothing dense in the head region except the skull and the upper neck vertebrae
skm = seg('skull')
z0h = P['head_z0']
vert = np.zeros(a.shape, bool)
for v in ['C1', 'C2', 'C3', 'C4', 'C5']:
    vert |= seg('vertebrae_' + v)
vert = ndi.binary_dilation(vert, iterations=2)
skd = ndi.binary_dilation(skm, iterations=2)
junk = np.zeros(a.shape, bool)
junk[:, :, z0h:] = (a[:, :, z0h:] > 200) & ~skd[:, :, z0h:] & ~vert[:, :, z0h:]
a = np.where(junk, 30.0, a)
del junk

# ---- the humeri: drop the raised ones, put the left one back lowered along the side (and its mirror on the right)
hL = ndi.binary_dilation(seg('humerus_left'), iterations=1)
hR = ndi.binary_dilation(seg('humerus_right'), iterations=1)
hum_hu = np.where(hL, a, -1000.0).astype(np.float32)
a = np.where((hL | hR) & body, 40.0, a)
hu = np.where(body, a, -1000.0).astype(np.float32)
del a
pts = np.argwhere(hL).astype(float) * VX
cen = pts.mean(0)
_, _, vt = np.linalg.svd(pts - cen, full_matrices=False)
t = (pts - cen) @ vt[0]
e0, e1 = pts[t < t.min() + 25].mean(0), pts[t > t.max() - 25].mean(0)
prox, dist_end = (e0, e1) if e0[2] < e1[2] else (e1, e0)
def rot_between(a0, b0):
    a0 = a0 / np.linalg.norm(a0); b0 = b0 / np.linalg.norm(b0)
    v = np.cross(a0, b0); cth = float(np.dot(a0, b0))
    K = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
    return np.eye(3) + K + K @ K * (1 / (1 + cth))
R = rot_between(dist_end - prox, np.array(P['humerus_dir_left'], float))
R_Rm = rot_between(dist_end - prox, np.array(P['humerus_dir_right'], float) * np.array([-1.0, 1.0, 1.0]))
SL = prox
SR = np.array(P['shoulder_right_mm'], float)
xm = P['mirror_x_mm']
RT = R.T
# left: p_in = R^T (p_out - SL) + prox
M_L = RT; off_L = (prox - RT @ SL) / VX
new_L = ndi.affine_transform(hum_hu, M_L, offset=off_L, order=1, cval=-1000.0)
# right: mirror about x = xm and shift to the right shoulder, then the same pose
Fm = np.diag([-1.0, 1.0, 1.0])
tt = np.array([2 * xm, SL[1] - SR[1], SL[2] - SR[2]])
RTr = R_Rm.T
M_R = RTr @ Fm; off_R = (RTr @ (tt - SL) + prox) / VX
new_R = ndi.affine_transform(hum_hu, M_R, offset=off_R, order=1, cval=-1000.0)
del hum_hu
for nb in (new_L, new_R):
    hu = np.where(nb > hu, nb, hu)
del new_L, new_R
eR = R_Rm @ (dist_end - prox); eR[0] = -eR[0]
print('ARMS', json.dumps({'shoulder_left': SL.round(1).tolist(), 'elbow_left': (SL + R @ (dist_end - prox)).round(1).tolist(),
      'shoulder_right': SR.round(1).tolist(), 'elbow_right': (SR + eR).round(1).tolist()}))

# ---- open the jaw: the lower face (mandible + chin, lips, tongue) turns about the jaw joint
yy, zz = np.meshgrid(np.arange(NY), np.arange(NZ), indexing='ij')
inside = MPath(np.array(P['piece_poly'], float)).contains_points(np.c_[yy.ravel(), zz.ravel()]).reshape(NY, NZ)
spine = np.zeros(hu.shape, bool)
for v in ['C1', 'C2', 'C3', 'C4']:
    spine |= seg('vertebrae_' + v)
spine = ndi.binary_dilation(spine, iterations=2)
piece = np.broadcast_to(inside[None], hu.shape) & body & ~spine
th = np.deg2rad(P['jaw_deg'])
c, s = np.cos(th), np.sin(th)
M = np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
piv = np.array([0, P['tmj_yz'][0], P['tmj_yz'][1]], float)
off = piv - M @ piv
rot = ndi.affine_transform(np.where(piece, hu, -1000.0).astype(np.float32), M, offset=off, order=1, cval=-1000.0)
rmask = ndi.affine_transform(piece.astype(np.float32), M, offset=off, order=1, cval=0.0) > 0.5
# what the piece leaves: the open mouth is air in the middle, the stretched cheeks are soft tissue at the sides
xs = np.abs(np.arange(NX)[:, None, None] - xc)
vac_hu = np.where(xs < P['mouth_half_vox'], -850.0, 20.0).astype(np.float32)
hu = np.where(piece, np.broadcast_to(vac_hu, hu.shape), hu)
hu = np.where(rmask, rot, hu)
del rot, rmask, piece

# ---- one smooth outline (front view) for head, neck and shoulders: the skull (with the opened jaw) padded by the
#      scalp, a neck column, a trapezius slope and a rounded deltoid over each humeral head
bone2d = ((hu > 250) & (np.arange(NZ)[None, None, :] >= P['head_bone_z'])).any(axis=1)
pad = ndi.distance_transform_edt(~bone2d, sampling=VX) < P['head_pad_mm']
xs2 = np.arange(NX)[:, None].astype(np.float32); zs2 = np.arange(NZ)[None, :].astype(np.float32)
dxn = np.abs(xs2 - xc)
neck2d = (dxn < P['neck_half2']) & (zs2 < P['neck_top'])
e2 = np.clip(dxn - P['neck_half2'], 0, None)
zsh2 = P['junction_z'] - P['sh_lin'] * e2 - P['sh_quad'] * e2 * e2
trunk2d = (zs2 <= zsh2) & (dxn <= P['trunk_half'])
delt = np.zeros_like(trunk2d)
for (hx, hz) in P['humeral_heads_vox']:
    delt |= (xs2 - hx) ** 2 + (zs2 - hz) ** 2 < P['deltoid_r_vox'] ** 2
sil = pad | neck2d | trunk2d | delt
sil = ndi.gaussian_filter(sil.astype(np.float32), P['sil_smooth']) > 0.5
hu = np.where(sil[:, None, :], hu, -1000.0).astype(np.float32)

# ---- crop and prefilter for cubic sampling
x_lo, x_hi = 0, NX
y_lo, y_hi = P['y_vox_range']
z_lo, z_hi = P['z_vox_range']
sub = np.ascontiguousarray(hu[x_lo:x_hi, y_lo:y_hi, z_lo:z_hi])
del hu
COEF = ndi.spline_filter(sub, order=3, output=np.float32, mode='nearest')

s_px = F['px_per_mm']
def xmm(u):
    return F['x_center_mm'] + (u + 0.5 - F['W'] / 2) / s_px
def zmm(v):
    return F['z_top_mm'] - (v + 0.5 - F['v_top']) / s_px
U0, U1, V0, V1 = P['ct_region_px']
us = np.arange(U0, U1)
xv = (xmm(us) / VX - x_lo).astype(np.float32)
ys_mm = np.arange(P['y_mm_range'][0], P['y_mm_range'][1], P['dy_mm'])
yv = (ys_mm / VX - y_lo).astype(np.float32)
DY = P['dy_mm']
SB = P['soft_sig']; BB = P['bone_sig']

def rows(vr):
    out_b = np.zeros((len(vr), len(us)), np.float32)
    out_s = np.zeros((len(vr), len(us)), np.float32)
    for i, v in enumerate(vr):
        zv = np.float32(zmm(v) / VX - z_lo)
        Xg, Yg = np.meshgrid(xv, yv, indexing='ij')
        coords = np.stack([Xg, Yg, np.full_like(Xg, zv)])
        h = ndi.map_coordinates(COEF, coords, order=3, prefilter=False, mode='nearest')
        ind_s = 1 / (1 + np.exp(-(h - SB[0]) / SB[1]))
        ind_b = 1 / (1 + np.exp(-(h - BB[0]) / BB[1]))
        out_s[i] = (ind_s * np.clip((h + 1000) / 1000, 0, 1.15)).sum(axis=1) * DY
        out_b[i] = (ind_b * np.clip(h - 100, 0, 3000)).sum(axis=1) * DY
    return vr[0], out_b, out_s

vs = np.arange(V0, V1)
chunks = [vs[i:i + 12] for i in range(0, len(vs), 12)]
B = np.zeros((F['H'], F['W']), np.float32)
S = np.zeros((F['H'], F['W']), np.float32)
with Pool(4) as pool:
    for v0, ob, os_ in pool.imap_unordered(rows, chunks):
        B[v0:v0 + ob.shape[0], U0:U1] = ob
        S[v0:v0 + os_.shape[0], U0:U1] = os_
np.savez_compressed(OUT, B=B, S=S)
print('done', B.max(), S.max())
