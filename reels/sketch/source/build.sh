#!/bin/bash
set -e
cd "$(dirname "$0")"
V="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p"
ffmpeg -y -loglevel error -i c0.mp4 -i c1.mp4 -i c2.mp4 -loop 1 -framerate 30 -t 3.5 -i end.png \
 -loop 1 -t 2.6 -i hook.png -loop 1 -t 2.4 -i s1.png -loop 1 -t 2.4 -i s2.png -loop 1 -t 2.4 -i s3.png -i music.wav \
 -filter_complex "
 [0:v]$V,trim=0:6,setpts=PTS-STARTPTS[a];[1:v]$V,trim=0:6,setpts=PTS-STARTPTS[b];[2:v]$V,trim=0:6,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=0.5[c];
 [3:v]format=yuv420p,setsar=1,zoompan=z='1+0.0006*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,trim=0:3.5,setpts=PTS-STARTPTS[e];
 [a][b]xfade=transition=fadewhite:duration=0.3:offset=5.7[ab];
 [ab][c]xfade=transition=fadewhite:duration=0.3:offset=11.4[abc];
 [abc][e]xfade=transition=fade:duration=0.5:offset=17.6[base];
 [4:v]format=rgba,fade=in:st=0:d=0.3:alpha=1,fade=out:st=2.2:d=0.4:alpha=1,setpts=PTS+0.2/TB[o1];
 [5:v]format=rgba,fade=in:st=0:d=0.3:alpha=1,fade=out:st=2.0:d=0.4:alpha=1,setpts=PTS+3.0/TB[o2];
 [6:v]format=rgba,fade=in:st=0:d=0.3:alpha=1,fade=out:st=2.0:d=0.4:alpha=1,setpts=PTS+6.0/TB[o3];
 [7:v]format=rgba,fade=in:st=0:d=0.3:alpha=1,fade=out:st=2.0:d=0.4:alpha=1,setpts=PTS+11.7/TB[o4];
 [base][o1]overlay=0:0:eof_action=pass[v1];[v1][o2]overlay=0:0:eof_action=pass[v2];[v2][o3]overlay=0:0:eof_action=pass[v3];[v3][o4]overlay=0:0:eof_action=pass,format=yuv420p[out];
 [8:a]atrim=0:21.1[aud]" \
 -map "[out]" -map "[aud]" -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -movflags +faststart -t 21.1 ../MaxDesign-Sketch-to-Reality-Reel-9x16.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 ../MaxDesign-Sketch-to-Reality-Reel-9x16.mp4
