#!/bin/bash
set -e
V=$(dirname "$0"); cd "$V"
P="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p"
ffmpeg -y -loglevel error -t 5 -i vb0.mp4 -t 5 -i vb1.mp4 -t 5 -i vb2.mp4 \
 -loop 1 -framerate 30 -t 3.6 -i bend.png \
 -loop 1 -t 3.8 -i b1.png -loop 1 -t 3.8 -i b2.png -loop 1 -t 3.8 -i b3.png \
 -filter_complex "
 [0:v]$P,trim=0:5,setpts=PTS-STARTPTS[a];[1:v]$P,trim=0:5,setpts=PTS-STARTPTS[b];[2:v]$P,trim=0:5,setpts=PTS-STARTPTS[c];
 [3:v]scale=1188:2112,zoompan=z='1+0.0006*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,trim=0:3.6,setpts=PTS-STARTPTS,format=yuv420p[e];
 [a][b]xfade=transition=fadewhite:duration=0.4:offset=4.6[ab];[ab][c]xfade=transition=fadewhite:duration=0.4:offset=9.2[abc];[abc][e]xfade=transition=fade:duration=0.4:offset=13.8[base];
 [4:v]format=rgba,fade=in:st=0:d=0.35:alpha=1,fade=out:st=3.45:d=0.35:alpha=1,setpts=PTS+0.5/TB[o1];
 [5:v]format=rgba,fade=in:st=0:d=0.35:alpha=1,fade=out:st=3.45:d=0.35:alpha=1,setpts=PTS+5.1/TB[o2];
 [6:v]format=rgba,fade=in:st=0:d=0.35:alpha=1,fade=out:st=3.45:d=0.35:alpha=1,setpts=PTS+9.7/TB[o3];
 [base][o1]overlay=0:0:eof_action=pass[v1];[v1][o2]overlay=0:0:eof_action=pass[v2];[v2][o3]overlay=0:0:eof_action=pass,format=yuv420p[out]" \
 -map "[out]" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 30 b_silent.mp4
ffmpeg -y -loglevel error -i b_silent.mp4 -f lavfi -t 17.4 -i anullsrc=r=48000:cl=stereo -c:v copy -c:a aac -shortest -movflags +faststart video2.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 video2.mp4
