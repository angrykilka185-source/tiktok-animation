#!/bin/bash
# usage: scripts/sheet.sh out.png frame1 frame2 ...  (renders the full video at given frames, 0.4 scale)
out=$1; shift
mkdir -p out/frames
for fr in "$@"; do npx remotion still PapaVakhta out/frames/$fr.png --frame=$fr --scale=0.4 --log=error & done; wait
python3 - "$out" "$@" <<'PY'
import sys
from PIL import Image
out=sys.argv[1]; frs=sys.argv[2:]
ims=[Image.open(f'out/frames/{f}.png') for f in frs]
w=ims[0].width; h=ims[0].height
o=Image.new('RGB',(w*len(ims),h))
for i,im in enumerate(ims): o.paste(im,(i*w,0))
o.save(out)
PY
