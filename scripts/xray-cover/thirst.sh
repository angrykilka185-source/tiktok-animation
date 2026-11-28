#!/usr/bin/env bash
# Builds public/covers/xray-thirst.jpg — the X-ray picture of the «жажда» covers (src/covers/ZhazhdaXray.tsx): the person
# of the other covers seen from the side (TotalSegmentator s1380, CC BY 4.0), the jaw open in a dry gasp, one arm stretched
# out with an open hand towards a glass of water that stands just out of reach.
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
python3 -I "$HERE/stage_hr.py" "$DATA/s1380" "$WORK/thirst_hr.npz" "$HERE/thirst_hr.json"                                  # person from the side (≈3 min)
python3 -I "$HERE/stage_reach.py" "$WORK/thirst_hr.npz" "$WORK/thirst_reach.npz" "$HERE/thirst.json" "$HERE/thirst_hr.json"  # forearm, hand (≈5 min)
python3 -I "$HERE/stage_glass.py" "$WORK/thirst_reach.npz" "$WORK/thirst_glass.npz" "$HERE/thirst.json" "$HERE/thirst_hr.json"  # the glass of water
python3 -I "$HERE/stage_cutout.py" "$WORK/thirst_glass.npz" "$HERE/tone_bear.json" "$WORK/xray-thirst.png"
python3 -I -c "import sys; from PIL import Image; Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2], quality=93, subsampling=0, optimize=True)" \
  "$WORK/xray-thirst.png" "$HERE/../../public/covers/xray-thirst.jpg"
echo "public/covers/xray-thirst.jpg updated"
