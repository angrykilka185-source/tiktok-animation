#!/bin/bash
# Render a heavy (3D) composition faster: P parts in parallel, each in its own browser (= its own GPU process, the
# bottleneck of CSS-3D scenes), with the faster software GL backend; the sound comes from a light audio-only
# composition (it would otherwise visit every 3D frame again); then the parts are joined and the sound is added.
# usage: scripts/render-parallel.sh <Composition> <AudioComposition> <out.mp4> [parts=3]
# e.g.   scripts/render-parallel.sh Rayon1 Rayon1Audio out/rayon-1.mp4
set -e
cd "$(dirname "$0")/.."
COMP=$1; AUD=$2; OUT=$3; P=${4:-3}
tmp=out/parallel-$COMP; rm -rf "$tmp"; mkdir -p "$tmp"
N=$(npx remotion compositions 2>/dev/null | awk -v c="$COMP" '$1==c {print $4}')
[ -n "$N" ] || { echo "no composition $COMP"; exit 1; }
step=$(( (N + P - 1) / P ))
pids=()
for i in $(seq 0 $((P-1))); do
  a=$(( i * step )); b=$(( (i+1) * step - 1 )); [ $b -ge $N ] && b=$((N-1))
  npx remotion render "$COMP" "$tmp/part$i.mp4" --frames=$a-$b --gl=${GL:-swangle} --concurrency=1 --muted --log=error > "$tmp/part$i.log" 2>&1 &
  pids+=($!)
done
npx remotion render "$AUD" "$tmp/audio.wav" --codec=wav --concurrency=1 --log=error
for p in "${pids[@]}"; do wait $p; done
for i in $(seq 0 $((P-1))); do echo "file '$PWD/$tmp/part$i.mp4'"; done > "$tmp/parts.txt"
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "$tmp/parts.txt" -c copy "$tmp/video.mp4"
ffmpeg -hide_banner -loglevel error -y -i "$tmp/video.mp4" -i "$tmp/audio.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest "$OUT"
echo "wrote $OUT ($N frames)"
