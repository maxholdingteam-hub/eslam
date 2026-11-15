#!/usr/bin/env bash
# Assembles one 9:16 reel per room: lines draw on the site (clip a) -> sketch becomes the room (clip b)
# -> hold on the finished room -> end card. Text layers from source/ov fade in and out on top.
# Usage: source/reel.sh s1   (expects gen/clips/<room>-a.mp4 and <room>-b.mp4)
set -euo pipefail
room=$1
cd "$(dirname "$0")/.."
A=gen/clips/$room-a.mp4; B=gen/clips/$room-b.mp4
da=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$A")
db=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$B")
hold=1.6; endlen=2.2
T=$(echo "$da + $db + $hold + $endlen" | bc -l)
rev_in=$(echo "$da + $db - 0.6" | bc -l)            # second line appears as the room finishes
end_in=$(echo "$da + $db + $hold" | bc -l)
fit="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30"
ffmpeg -v error -y -i "$A" -i "$B" \
  -loop 1 -t "$T" -i source/ov/$room-hook.png -loop 1 -t "$T" -i source/ov/$room-reveal.png -loop 1 -t "$T" -i source/ov/end.png \
  -f lavfi -t "$T" -i anullsrc=r=44100:cl=stereo \
  -filter_complex "
    [0:v]$fit[a];[1:v]$fit[b];[a][b]concat=n=2:v=1[ab];
    [ab]tpad=stop_mode=clone:stop_duration=$(echo "$hold + $endlen" | bc -l)[base];
    [2:v]format=rgba,fade=t=in:st=0.15:d=0.35:alpha=1,fade=t=out:st=$(echo "$da - 0.5" | bc -l):d=0.4:alpha=1[h];
    [3:v]format=rgba,fade=t=in:st=$rev_in:d=0.5:alpha=1,fade=t=out:st=$(echo "$end_in - 0.3" | bc -l):d=0.3:alpha=1[r];
    [4:v]format=rgba,fade=t=in:st=$end_in:d=0.5:alpha=1[e];
    [base][h]overlay=format=auto[v1];[v1][r]overlay=format=auto[v2];[v2][e]overlay=format=auto,format=yuv420p[v]" \
  -map "[v]" -map 5:a -t "$T" -c:v libx264 -preset slow -crf 18 -profile:v high -movflags +faststart -c:a aac -b:a 128k \
  out/reels/max-design-$room.mp4
echo "out/reels/max-design-$room.mp4  ${T}s"
