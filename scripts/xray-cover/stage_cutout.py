# Step 3 for an X-ray cut out on the white page (no coffin): one radiographic tone curve for soft tissue, bone and
# claw keratin, edge enhancement and film grain inside a clean, smoothed silhouette; white outside.
# Usage: python3 -I stage_cutout.py paw.npz tone.json xray.png
import sys, json, numpy as np
from scipy import ndimage as ndi
from PIL import Image

IN, TONE, OUT = sys.argv[1:4]
z = np.load(IN)
B, S = z['B'].astype(np.float32), z['S'].astype(np.float32)
K = z['K'].astype(np.float32) if 'K' in z.files else np.zeros_like(S)
T = json.load(open(TONE))
rng = np.random.default_rng(T.get('seed', 5))

ts = 1 - np.exp(-S / T['soft_lambda'])
tk = 1 - np.exp(-K / T['claw_lambda'])
tb = 1 - np.exp(-B / T['bone_lambda'])
val = T['film_base'] + T['soft_gain'] * ts + T['claw_gain'] * tk + T['bone_gain'] * tb ** T['bone_gamma'] * (1 - T['bone_soft_mix'] * ts)
blur = ndi.gaussian_filter(val, T['usm_sigma'])
val = val + T['usm_amount'] * (val - blur)
val = ndi.gaussian_filter(val, T['soften_px'])
val += T['grain'] * ndi.gaussian_filter(rng.standard_normal(val.shape).astype(np.float32), 0.7)
val = np.clip(val, 0, 1)

# the silhouette: smoothed tissue / claws / bone, no specks, no holes, a soft antialiased edge
m = (ndi.gaussian_filter(S, T['sil_sigma']) > T['sil_soft_mm']) | (ndi.gaussian_filter(K, 1.0) > T['sil_claw']) | (ndi.gaussian_filter(B, 2.0) > T['sil_bone'])
m = ndi.binary_opening(m, iterations=T['sil_open'])
lab, n = ndi.label(m)
if n > 1:
    sizes = ndi.sum(m, lab, range(1, n + 1))
    keep = np.isin(lab, 1 + np.where(sizes >= T['sil_min_px'])[0])
    m = keep
m = ndi.binary_fill_holes(m)
alpha = np.clip(ndi.gaussian_filter(m.astype(np.float32), T['sil_aa']) * 1.0, 0, 1)
img = val * alpha + 1.0 * (1 - alpha)
out = (np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)
Image.fromarray(out).convert('RGB').save(OUT)
print('saved', OUT)
