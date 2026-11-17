import subprocess,re
O=0.3
html=open('/tmp/mmw/dh/ad.html').read()
E=re.findall(r"\['([A-K])',([\d.]+),'(\w+)'",html)
sc=[3.48,6.8,9.38,14.52,20.9,23.74,31.58,34.6,39.3,40.76]
pops=sorted(set(float(a) for s,a,an in E if an in('pop','slideR','slideL')))
stamps=sorted(set(float(a) for s,a,an in E if an=='stamp'))
ins=['-i','/tmp/mmw/dh/vid.mp4','-i','/tmp/mmw/dh/vo0.mp3','-ss','0','-t','48','-i','/tmp/mmw/tm/m1150.mp3']; f=[]
f.append(f'[1:a]adelay={int(O*1000)}|{int(O*1000)},acompressor=threshold=-18dB:ratio=2.5:attack=5:release=80,highpass=f=80[vo]')
f.append('[2:a]volume=0.13,afade=t=in:d=1,afade=t=out:st=46:d=2[mu]'); tags=['[vo]','[mu]']; n=[3]
def add(fl,ts,vol):
    for t in ts:
        ins.extend(['-i',fl]); ms=int((t+O)*1000); f.append(f'[{n[0]}:a]adelay={ms}|{ms},volume={vol}[x{n[0]}]'); tags.append(f'[x{n[0]}]'); n[0]+=1
add('/tmp/mmw/th/sfx/2142.mp3',[t-0.12 for t in sc],0.18); add('/tmp/mmw/th/sfx/3163.wav',pops,0.22); add('/tmp/mmw/th/sfx/546.mp3',stamps,0.4)
f.append(''.join(tags)+f'amix=inputs={len(tags)}:duration=longest:normalize=0,atrim=0:48,alimiter=limit=0.9:level=disabled,loudnorm=I=-14:TP=-1.5[ao]')
out='/home/user/eslam/MaxMotors_Ads/MaxMotors_Explainer_3Questions.mp4'
r=subprocess.run(['ffmpeg','-v','error','-y',*ins,'-filter_complex',';'.join(f),'-map','0:v','-map','[ao]','-t','48','-c:v','libx264','-crf','21','-preset','slow','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',out],capture_output=True,text=True); print(r.stderr[-300:])
