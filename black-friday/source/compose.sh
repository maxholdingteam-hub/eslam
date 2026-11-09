#!/bin/bash
# usage: compose.sh <overlay_frames_dir> <clipA> <clipB> <chips> <out.mp4> <sfxdir> [music]
set -e
OV=$1; A=$2; B=$3; CH=$4; OUT=$5; X=$6; MU=$7
CUT=6.2; END=10.2; T=$(mktemp -d)
V="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1"
"$(dirname "$0")/sfx.sh" $T/sfx.wav $CUT $END $CH "$X"
if [ -n "$MU" ]; then ffmpeg -v error -y -i "$MU" -i $T/sfx.wav -filter_complex "[0:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:13,afade=t=in:d=0.05,afade=t=out:st=12.3:d=0.7,volume=0.8[m];[1:a]volume=0.7[s];[m][s]amix=inputs=2:normalize=0,alimiter=limit=0.9[a]" -map "[a]" $T/mix.wav && mv $T/mix.wav $T/sfx.wav; fi
ffmpeg -v error -y -i "$A" -i "$B" -framerate 30 -i "$OV/f%05d.png" -i $T/sfx.wav -filter_complex "
 [0:v]setpts=PTS*1.25,$V,trim=0:$CUT,setpts=PTS-STARTPTS[a];
 [1:v]setpts=PTS*1.4,$V,trim=0:6.8,setpts=PTS-STARTPTS[b];
 [a][b]concat=n=2:v=1:a=0,format=yuv420p[bg];
 [bg][2:v]overlay=0:0:format=auto,format=yuv420p[v]" \
 -map "[v]" -map 3:a -t 13 -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$OUT"
ffmpeg -v error -y -ss 4.8 -i "$OUT" -frames:v 1 -q:v 2 "${OUT%.mp4}-cover.jpg"
rm -rf $T
