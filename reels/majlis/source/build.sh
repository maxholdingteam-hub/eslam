#!/bin/bash
set -e
cd "$(dirname "$0")"
V="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p"
ffmpeg -y -loglevel error \
 -i c0.mp4 -i c1.mp4 -i c2.mp4 -i c3.mp4 -i c4.mp4 \
 -loop 1 -framerate 30 -t 3.5 -i t6.png \
 -loop 1 -t 3.9 -i t1.png -loop 1 -t 3.6 -i t2.png -loop 1 -t 3.6 -i t3.png -loop 1 -t 3.6 -i t4.png -loop 1 -t 3.6 -i t5.png \
 -i music.wav \
 -filter_complex "
 [0:v]$V,trim=0:4.5,setpts=PTS-STARTPTS[a];
 [1:v]$V,trim=0:4.2,setpts=PTS-STARTPTS[b];
 [2:v]$V,trim=0:4.2,setpts=PTS-STARTPTS[c];
 [3:v]$V,trim=0:4.2,setpts=PTS-STARTPTS[d];
 [4:v]$V,trim=0:4.2,setpts=PTS-STARTPTS[e];
 [5:v]scale=1080:1920,format=yuv420p,setsar=1,trim=0:3.5,setpts=PTS-STARTPTS[f];
 [a][b]xfade=transition=fade:duration=0.4:offset=4.1[ab];
 [ab][c]xfade=transition=fade:duration=0.4:offset=7.9[abc];
 [abc][d]xfade=transition=fade:duration=0.4:offset=11.7[abcd];
 [abcd][e]xfade=transition=fade:duration=0.4:offset=15.5[abcde];
 [abcde][f]xfade=transition=fade:duration=0.5:offset=19.3[base];
 [6:v]format=rgba,fade=in:st=0:d=0.4:alpha=1,fade=out:st=3.4:d=0.4:alpha=1,setpts=PTS+0.2/TB[o1];
 [7:v]format=rgba,fade=in:st=0:d=0.35:alpha=1,fade=out:st=3.2:d=0.35:alpha=1,setpts=PTS+4.3/TB[o2];
 [8:v]format=rgba,fade=in:st=0:d=0.35:alpha=1,fade=out:st=3.2:d=0.35:alpha=1,setpts=PTS+8.1/TB[o3];
 [9:v]format=rgba,fade=in:st=0:d=0.35:alpha=1,fade=out:st=3.2:d=0.35:alpha=1,setpts=PTS+11.9/TB[o4];
 [10:v]format=rgba,fade=in:st=0:d=0.35:alpha=1,fade=out:st=3.2:d=0.35:alpha=1,setpts=PTS+15.7/TB[o5];
 [base][o1]overlay=0:0:eof_action=pass[v1];[v1][o2]overlay=0:0:eof_action=pass[v2];[v2][o3]overlay=0:0:eof_action=pass[v3];
 [v3][o4]overlay=0:0:eof_action=pass[v4];[v4][o5]overlay=0:0:eof_action=pass,format=yuv420p[out];
 [11:a]atrim=0:22.8,afade=t=out:st=21.0:d=1.8[aud]" \
 -map "[out]" -map "[aud]" -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -movflags +faststart -t 22.8 ../MaxDesign-Majlis-Reel-9x16.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 ../MaxDesign-Majlis-Reel-9x16.mp4
