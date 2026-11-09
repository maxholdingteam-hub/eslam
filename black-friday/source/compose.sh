#!/bin/bash
# usage: compose.sh <overlay_frames_dir> <clipA> <clipB> <chips> <out.mp4> <sfxdir>
set -e
OV=$1; A=$2; B=$3; CH=$4; OUT=$5; X=$6
CUT=6.2; END=10.2; T=$(mktemp -d)
V="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1"
"$(dirname "$0")/sfx.sh" $T/sfx.wav $CUT $END $CH "$X"
ffmpeg -v error -y -i "$A" -i "$B" -framerate 30 -i "$OV/f%05d.png" -i $T/sfx.wav -filter_complex "
 [0:v]setpts=PTS*1.25,$V,trim=0:$CUT,setpts=PTS-STARTPTS[a];
 [1:v]setpts=PTS*1.4,$V,trim=0:6.8,setpts=PTS-STARTPTS[b];
 [a][b]concat=n=2:v=1:a=0,format=yuv420p[bg];
 [bg][2:v]overlay=0:0:format=auto,format=yuv420p[v]" \
 -map "[v]" -map 3:a -t 13 -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$OUT"
ffmpeg -v error -y -ss 4.8 -i "$OUT" -frames:v 1 -q:v 2 "${OUT%.mp4}-cover.jpg"
rm -rf $T
