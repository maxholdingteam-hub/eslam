#!/bin/bash
# 4K compose: graded footage (base.mp4) + vignette + light grain, graphics layer (ovl/fNNNNN.png) on top, mix; 2-pass x264
#   compose.sh <audio.wav> <out_4k.mp4> [target_MB=95]  -> also writes <out>_1080.mp4 (28 MB)
set -e
H2=/tmp/claude-0/-home-user-eslam/0f5505b8-8bf4-57e7-9c4a-28493f9f4c64/reg/hx2
A="$1"; O="$2"; MB="${3:-95}"
N=$(ls $H2/ovl | grep -c '^f[0-9]*\.png$'); DUR=$(python3 -c "print($N/60)")
VB=$(python3 -c "print(int(($MB*8*1024*1024/$DUR - 256000)/1000))")
FG="[0:v]vignette=angle=0.62:mode=forward,noise=alls=3:allf=t[b];[1:v]format=rgba[o];[b][o]overlay=0:0:format=auto:shortest=1,format=yuv420p[v]"
T=$(mktemp -d); cd "$T"
nice ffmpeg -nostdin -v error -y -i $H2/base.mp4 -framerate 60 -i $H2/ovl/f%05d.png -filter_complex "$FG" -map "[v]" -frames:v $N \
  -c:v libx264 -preset slow -tune film -profile:v high -level 5.2 -b:v ${VB}k -maxrate $((VB*2))k -bufsize $((VB*3))k -pass 1 -an -f mp4 /dev/null
nice ffmpeg -nostdin -v error -y -i $H2/base.mp4 -framerate 60 -i $H2/ovl/f%05d.png -i "$A" -filter_complex "$FG" -map "[v]" -map 2:a -frames:v $N \
  -c:v libx264 -preset slow -tune film -profile:v high -level 5.2 -b:v ${VB}k -maxrate $((VB*2))k -bufsize $((VB*3))k -pass 2 -c:a aac -b:a 256k -shortest -movflags +faststart "$O"
cd /; rm -rf "$T"
echo "4k $(du -m "$O" | cut -f1)MB ${VB}k frames $N"
[ -n "$SKIP1080" ] && exit 0
# 1080 version for feeds that re-encode anyway (two-pass, ~28 MB)
O2="${O%.mp4}_1080.mp4"; VB2=$(python3 -c "print(int((27.5*8*1024*1024/$DUR - 192000)/1000))"); T=$(mktemp -d); cd "$T"
nice ffmpeg -nostdin -v error -y -i "$O" -vf "scale=1080:1920:flags=lanczos,unsharp=5:5:0.3:5:5:0" -c:v libx264 -preset slower -tune film -b:v ${VB2}k -maxrate $((VB2*2))k -bufsize $((VB2*3))k -pass 1 -an -f mp4 /dev/null
nice ffmpeg -nostdin -v error -y -i "$O" -vf "scale=1080:1920:flags=lanczos,unsharp=5:5:0.3:5:5:0" -c:v libx264 -preset slower -tune film -b:v ${VB2}k -maxrate $((VB2*2))k -bufsize $((VB2*3))k -pass 2 -c:a aac -b:a 192k -movflags +faststart "$O2"
cd /; rm -rf "$T"; echo "1080 $(du -m "$O2" | cut -f1)MB"
