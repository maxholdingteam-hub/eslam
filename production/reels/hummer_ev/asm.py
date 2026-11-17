import subprocess
X=0.35
segs=[('s1',0,5),('s2',0.3,3),('s3',0.5,3.5),('s4',0.5,4),('s6',0.5,3),('s5',0,5),('endc',0,3.5)]
st=[];t=0
for i,(k,a,d) in enumerate(segs): st.append(t); t+=d-X
total=t+X
ins=[];f=[]
for i,(k,a,d) in enumerate(segs):
    ins+=['-ss',str(a),'-t',str(d),'-i',f'{k}.mp4']
    f.append(f'[{i}:v]fps=30,setpts=PTS-STARTPTS,format=yuv420p[v{i}];[{i}:a]aresample=44100,asetpts=PTS-STARTPTS[a{i}]')
pv='v0';pa='a0'
for i in range(1,len(segs)):
    f.append(f'[{pv}][v{i}]xfade=transition=fade:duration={X}:offset={st[i]:.3f}[vx{i}];[{pa}][a{i}]acrossfade=d={X}[ax{i}]'); pv=f'vx{i}';pa=f'ax{i}'
T=[('t1',st[0]+0.8,st[0]+3.6),('t2',st[0]+3.8,st[1]+0.2),('t3',st[1]+0.3,st[2]+0.2),('t4',st[2]+0.3,st[3]+0.2),('t5',st[3]+0.4,st[4]+0.2),('t6',st[4]+0.3,st[5]+0.1),('t7',st[5]+0.3,st[5]+2.5),('t8',st[5]+2.7,st[6]+0.2)]
n=len(segs)
for j,(k,a,b) in enumerate(T):
    ins+=['-loop','1','-t',f'{total:.2f}','-i',f'tx/{k}.png']
    f.append(f'[{n+j}:v]format=rgba,fade=t=in:st={a:.2f}:d=0.3:alpha=1,fade=t=out:st={b-0.3:.2f}:d=0.3:alpha=1[o{j}];[{pv}][o{j}]overlay=0:0:enable=\'between(t,{a:.2f},{b:.2f})\'[vo{j}]'); pv=f'vo{j}'
m=n+len(T)
ins+=['-ss','12','-t',f'{total:.2f}','-i','/tmp/mmw/vid/m733.mp3']
f.append(f'[{pa}]volume=0.9[amb];[{m}:a]volume=0.32,afade=t=in:d=1.5,afade=t=out:st={total-2.5:.2f}:d=2.5[mu]')
tags=['[amb]','[mu]']
for i,s in enumerate(st[1:]):
    ins+=['-i','/tmp/mmw/th/sfx/2142.mp3']; ms=int((s-0.15)*1000); f.append(f'[{m+1+i}:a]adelay={ms}|{ms},volume=0.16[w{i}]'); tags.append(f'[w{i}]')
f.append(''.join(tags)+f'amix=inputs={len(tags)}:duration=first:normalize=0,alimiter=limit=0.9:level=disabled,loudnorm=I=-14:TP=-1.5[ao]')
out='/home/user/eslam/MaxMotors_Reels/MaxMotors_HummerEV_SilentBeast.mp4'
r=subprocess.run(['ffmpeg','-v','error','-y',*ins,'-filter_complex',';'.join(f),'-map',f'[{pv}]','-map','[ao]','-t',f'{total:.2f}','-c:v','libx264','-crf','19','-preset','slow','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',out],capture_output=True,text=True)
print(r.stderr[-800:], total)
