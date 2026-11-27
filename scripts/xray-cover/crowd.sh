#!/usr/bin/env bash
# Builds public/covers/xray-crowd.jpg — the X-ray picture of the «давка» covers (src/covers/DavkaXray.tsx): seven people
# pressed together, all made from the same open CT scan as the other covers (TotalSegmentator s1380, CC BY 4.0).
# Needs python3 with numpy, scipy, nibabel, matplotlib and pillow (pip install numpy scipy nibabel matplotlib pillow).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
DATA="${DATA:-/tmp/xray-cover-data}"
WORK="${WORK:-/tmp/xray-cover-work}"
mkdir -p "$DATA" "$WORK"
if [ ! -f "$DATA/s1380/ct.nii.gz" ]; then
  curl -sL --retry 3 -o "$DATA/s1380.zip" https://raw.githubusercontent.com/pyvista/data/master/Data/whole_body_ct/s1380.zip
  unzip -q -o "$DATA/s1380.zip" -d "$DATA"
fi
# four figures (≈1.5–2.5 min each): front-on and turned a quarter, each with the mouth open and closed. All are the
# coffin cover's person (arms cut above the shoulders, upper arms along the sides) framed down to the lower ribs;
# the turned ones keep only the scalp above the brows (the scanner's head holder would show beside the forehead)
python3 -I - "$HERE/crowd_hr.json" "$WORK" <<'PY'
import sys, json
base, work = sys.argv[1], sys.argv[2]
p = json.load(open(base))
turned = {'view_deg': 25, 'rot_center_mm': [243, 270], 'y_mm_range': [20, 520], 'z_vox_range': [170, 543],
          'ct_region_px': [0, 1100, 0, 1250], 'brow_z_vox': 455, 'brow_pad_mm': 11.0}
for name, over in [('front_open', {}), ('front', {'jaw_deg': 0}), ('turned_open', turned), ('turned', {**turned, 'jaw_deg': 0})]:
    q = json.loads(json.dumps(p))
    q.update(over)
    if name.startswith('turned'):
        q['frame']['H'] = 1250
    json.dump(q, open(f'{work}/crowd_{name}.json', 'w'))
PY
for f in front_open front turned_open turned; do
  python3 -I "$HERE/stage_hr.py" "$DATA/s1380" "$WORK/$f.npz" "$WORK/crowd_$f.json"
done
python3 -I "$HERE/stage_crowd.py" "$HERE/crowd.json" "$WORK/crowd.npz" "$WORK"   # lay them out, the middle one squeezed
python3 -I "$HERE/stage_cutout.py" "$WORK/crowd.npz" "$HERE/tone_bear.json" "$WORK/xray-crowd.png"
python3 -I -c "import sys; from PIL import Image; Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2], quality=93, subsampling=0, optimize=True)" \
  "$WORK/xray-crowd.png" "$HERE/../../public/covers/xray-crowd.jpg"
echo "public/covers/xray-crowd.jpg updated"
