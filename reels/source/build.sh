#!/bin/bash
set -e
R=$(dirname "$0"); cd "$R"
V="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p"
ffmpeg -y -loglevel error \
 -ss 0 -t 6 -i c0.mp4 -ss 0 -t 5 -i c1.mp4 -ss 0 -t 4.5 -i c2.mp4 -ss 0 -t 5 -i c3.mp4 \
 -loop 1 -framerate 30 -t 3.5 -i t6.png \
 -loop 1 -t 1.9 -i t1.png -loop 1 -t 3.8 -i t2.png -loop 1 -t 4.0 -i t3.png -loop 1 -t 3.6 -i t4.png -loop 1 -t 3.7 -i t5.png \
 -filter_complex "
 [0:v]$V,trim=0:6,setpts=PTS-STARTPTS,tpad=start_duration=1.8:start_mode=clone[a];
 [1:v]$V,trim=0:5,setpts=PTS-STARTPTS[b];
 [2:v]$V,trim=0:4.5,setpts=PTS-STARTPTS[c];
 [3:v]$V,trim=0:5,setpts=PTS-STARTPTS[d];
 [4:v]scale=1188:2112,zoompan=z='1+0.0006*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,trim=0:3.5,setpts=PTS-STARTPTS,setsar=1,format=yuv420p[e];
 [a][b]xfade=transition=fadewhite:duration=0.4:offset=7.4[ab];
 [ab][c]xfade=transition=fade:duration=0.4:offset=12.0[abc];
 [abc][d]xfade=transition=fadewhite:duration=0.4:offset=16.1[abcd];
 [abcd][e]xfade=transition=fade:duration=0.4:offset=20.7[base];
 [5:v]format=rgba,fade=in:st=0:d=0.35:alpha=1,fade=out:st=1.55:d=0.35:alpha=1,setpts=PTS+0.15/TB[o1];
 [6:v]format=rgba,fade=in:st=0:d=0.3:alpha=1,fade=out:st=3.4:d=0.4:alpha=1,setpts=PTS+3.4/TB[o2];
 [7:v]format=rgba,fade=in:st=0:d=0.4:alpha=1,fade=out:st=3.6:d=0.4:alpha=1,setpts=PTS+7.8/TB[o3];
 [8:v]format=rgba,fade=in:st=0:d=0.4:alpha=1,fade=out:st=3.2:d=0.4:alpha=1,setpts=PTS+12.3/TB[o4];
 [9:v]format=rgba,fade=in:st=0:d=0.4:alpha=1,fade=out:st=3.3:d=0.4:alpha=1,setpts=PTS+16.8/TB[o5];
 [base][o1]overlay=0:0:eof_action=pass[v1];[v1][o2]overlay=0:0:eof_action=pass[v2];[v2][o3]overlay=0:0:eof_action=pass[v3];
 [v3][o4]overlay=0:0:eof_action=pass[v4];[v4][o5]overlay=0:0:eof_action=pass,format=yuv420p[out]" \
 -map "[out]" -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -movflags +faststart -r 30 reel_silent.mp4
ffmpeg -y -loglevel error -i reel_silent.mp4 -f lavfi -t 24.2 -i anullsrc=r=48000:cl=stereo -c:v copy -c:a aac -shortest -movflags +faststart reel.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 reel.mp4
