#!/usr/bin/env bash
# Builds public/covers/xray-a.jpg — the X-ray picture of the «Погребённым заживо» cover (src/covers/ZakopanXray.tsx).
# Needs python3 with numpy, scipy, nibabel, matplotlib and pillow (pip install numpy scipy nibabel matplotlib pillow).
# The CT scan (TotalSegmentator, subject s1380, CC BY 4.0) is downloaded from the PyVista example-data mirror.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
DATA="${DATA:-/tmp/xray-cover-data}"
WORK="${WORK:-/tmp/xray-cover-work}"
mkdir -p "$DATA" "$WORK"
if [ ! -f "$DATA/s1380/ct.nii.gz" ]; then
  curl -sL --retry 3 -o "$DATA/s1380.zip" https://raw.githubusercontent.com/pyvista/data/master/Data/whole_body_ct/s1380.zip
  unzip -q -o "$DATA/s1380.zip" -d "$DATA"
fi
python3 -I "$HERE/stage_hr.py" "$DATA/s1380" "$WORK/hr.npz" "$HERE/hr.json"                       # CT -> frame (≈1 min)
python3 -I "$HERE/stage_hands.py" "$WORK/hr.npz" "$WORK/hands.npz" "$HERE/hands.json" "$HERE/hr.json"  # hands (≈4 min)
python3 -I "$HERE/stage_final.py" "$WORK/hands.npz" "$HERE/hr.json" "$HERE/coffin.json" "$WORK/xray.png"
python3 -I -c "import sys; from PIL import Image; Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2], quality=93, subsampling=0, optimize=True)" \
  "$WORK/xray.png" "$HERE/../../public/covers/xray-a.jpg"
echo "public/covers/xray-a.jpg updated"
