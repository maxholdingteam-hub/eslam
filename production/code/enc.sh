#!/bin/bash
# usage: enc.sh <frames_dir> <audio.wav> <out.mp4> [target_MB]
# two-pass x264 sized to the target so 1080x1920@60 gets every bit the size limit allows
set -e
F="$1"; A="$2"; O="$3"; MB="${4:-28.5}"
N=$(ls "$F" | grep -c '^f[0-9]*\.jpg$'); DUR=$(python3 -c "print($N/60)")
VB=$(python3 -c "print(int(($MB*8*1024*1024/$DUR - 192000)/1000))")
T=$(mktemp -d)
cd "$T"
ffmpeg -v error -y -framerate 60 -i "$F/f%05d.jpg" -vf "unsharp=5:5:0.25:5:5:0,format=yuv420p" -c:v libx264 -preset slower -tune film -profile:v high -level 4.2 -b:v ${VB}k -maxrate $((VB*2))k -bufsize $((VB*3))k -pass 1 -an -f mp4 /dev/null
ffmpeg -v error -y -framerate 60 -i "$F/f%05d.jpg" -i "$A" -map 0:v -map 1:a -vf "unsharp=5:5:0.25:5:5:0,format=yuv420p" -c:v libx264 -preset slower -tune film -profile:v high -level 4.2 -b:v ${VB}k -maxrate $((VB*2))k -bufsize $((VB*3))k -pass 2 -c:a aac -b:a 192k -shortest -movflags +faststart "$O"
cd /; rm -rf "$T"
echo "$O $(du -m "$O" | cut -f1)MB video ${VB}k"
