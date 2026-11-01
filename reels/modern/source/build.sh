#!/bin/bash
set -e
cd "$(dirname "$0")"
V="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p"
ov(){ # idx start dur
 echo "[$1:v]format=rgba,fade=in:st=0:d=0.2:alpha=1,fade=out:st=$(echo "$3-0.2"|bc):d=0.2:alpha=1,setpts=PTS+$2/TB[o$1];"
}
ffmpeg -y -loglevel error \
 -i c0.mp4 -i c1.mp4 -i c2.mp4 -i c3.mp4 -i c4.mp4 \
 -loop 1 -framerate 30 -t 3.5 -i end.png \
 -loop 1 -t 1.95 -i hook.png -loop 1 -t 1.95 -i w1.png -loop 1 -t 3.9 -i w2.png -loop 1 -t 3.9 -i w3.png -loop 1 -t 3.9 -i w4.png -loop 1 -t 3.9 -i w5.png \
 -i music.wav \
 -filter_complex "
 [0:v]$V,trim=0:4,setpts=PTS-STARTPTS[a];[1:v]$V,trim=0:4,setpts=PTS-STARTPTS[b];[2:v]$V,trim=0:4,setpts=PTS-STARTPTS[c];
 [3:v]$V,trim=0:4,setpts=PTS-STARTPTS[d];[4:v]$V,trim=0:4,setpts=PTS-STARTPTS[e];
 [5:v]format=yuv420p,setsar=1,zoompan=z='1+0.0008*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,trim=0:3.5,setpts=PTS-STARTPTS[f];
 [a][b][c][d][e][f]concat=n=6:v=1:a=0,format=yuv420p[base];
 $(ov 6 0.05 1.95) $(ov 7 2.0 1.95) $(ov 8 4.0 3.9) $(ov 9 8.0 3.9) $(ov 10 12.0 3.9) $(ov 11 16.0 3.9)
 [base][o6]overlay=0:0:eof_action=pass[v6];
 [v6][o7]overlay=0:'if(between(t,2,2.35),(1-(t-2)/0.35)*90,0)':eof_action=pass[v7];
 [v7][o8]overlay=0:'if(between(t,4,4.35),(1-(t-4)/0.35)*90,0)':eof_action=pass[v8];
 [v8][o9]overlay=0:'if(between(t,8,8.35),(1-(t-8)/0.35)*90,0)':eof_action=pass[v9];
 [v9][o10]overlay=0:'if(between(t,12,12.35),(1-(t-12)/0.35)*90,0)':eof_action=pass[v10];
 [v10][o11]overlay=0:'if(between(t,16,16.35),(1-(t-16)/0.35)*90,0)':eof_action=pass,format=yuv420p[out];
 [12:a]atrim=0:23.5[aud]" \
 -map "[out]" -map "[aud]" -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -movflags +faststart -t 23.5 ../MaxDesign-Modern-Reel-9x16.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 ../MaxDesign-Modern-Reel-9x16.mp4
