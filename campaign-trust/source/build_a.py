import subprocess,sys
from PIL import Image
V=sys.argv[1];I='/home/user/eslam/max-design-site/img/'
SC=[('d015-057',3.0,'a1'),('013-049',3.0,'a2'),('017-072',3.0,'a3'),('019-084',2.6,'a4'),('024-107',3.2,'a5'),('030-121',3.0,'a6')]
def run(c): subprocess.run(c,shell=True,check=True)
parts=[]
for i,(img,d,ov) in enumerate(SC):
    w,h=Image.open(I+img+'.webp').size; H=round(1000*h/w/2)*2; y=(1920-H)//2+130
    n=int(d*30)
    f=(f"[0:v]split[b][f];[b]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=40:3,eq=brightness={'-0.62' if img.startswith('d') else '-0.32'}:saturation=0.75[bg];"
       f"[f]scale=3000:-2,zoompan=z='1+0.07*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1000x{H}:fps=30,pad=1008:{H+8}:4:4:color=0xD9B46B[fg];"
       f"[bg][fg]overlay=36:{y}[v];[v][1:v]overlay=0:0,format=yuv420p,trim=0:{d},setpts=PTS-STARTPTS")
    out=f"{V}/sa{i}.mp4"
    run(f"ffmpeg -y -loglevel error -loop 1 -framerate 30 -t {d} -i {I}{img}.webp -loop 1 -framerate 30 -t {d} -i {V}/{ov}.png -filter_complex \"{f}\" -c:v libx264 -crf 17 -preset medium -r 30 {out}")
    parts.append((out,d))
# end card
run(f"ffmpeg -y -loglevel error -loop 1 -framerate 30 -t 3.5 -i {V}/aend.png -vf \"scale=1188:2112,zoompan=z='1+0.0006*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,format=yuv420p,trim=0:3.5\" -c:v libx264 -crf 17 -r 30 {V}/saend.mp4")
parts.append((f"{V}/saend.mp4",3.5))
ins=' '.join(f'-i {p}' for p,_ in parts); fc=[];off=0;prev='0:v'
for k in range(1,len(parts)):
    off+=parts[k-1][1]-0.4 if k>1 else parts[0][1]-0.4
    tr='fadewhite' if k in (4,) else 'fade'
    fc.append(f"[{prev}][{k}:v]xfade=transition={tr}:duration=0.4:offset={off:.2f}[x{k}]");prev=f"x{k}"
total=sum(d for _,d in parts)-0.4*(len(parts)-1)
run(f"ffmpeg -y -loglevel error {ins} -f lavfi -t {total:.2f} -i anullsrc=r=48000:cl=stereo -filter_complex \"{';'.join(fc)}\" -map \"[{prev}]\" -map {len(parts)}:a -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a aac -shortest -movflags +faststart {V}/video1.mp4")
print('total',total)
