#!/usr/bin/env bash
# Builds public/covers/xray-bear.jpg — the X-ray picture of the bear covers (src/covers/MedvedXray.tsx): the same open
# CT scan as the coffin cover (TotalSegmentator s1380, CC BY 4.0), arms lowered, and a bear paw built from bone shapes.
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
python3 -I "$HERE/stage_hr.py" "$DATA/s1380" "$WORK/hrb.npz" "$HERE/hr_bear.json"                          # person (≈1.5 min)
python3 -I "$HERE/stage_paw.py" "$WORK/hrb.npz" "$WORK/paw.npz" "$HERE/paw.json" "$HERE/hr_bear.json"    # the paw (≈2 min)
python3 -I "$HERE/stage_cutout.py" "$WORK/paw.npz" "$HERE/tone_bear.json" "$WORK/xray-bear.png"
python3 -I -c "import sys; from PIL import Image; Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2], quality=93, subsampling=0, optimize=True)" \
  "$WORK/xray-bear.png" "$HERE/../../public/covers/xray-bear.jpg"
echo "public/covers/xray-bear.jpg updated"
