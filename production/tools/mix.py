import subprocess,re,sys
def mix(vid,vo,mus,mss,D,sc,pops,stamps,out,muvol):
    O=0.3
    ins=['-i',vid,'-i',vo,'-ss',str(mss),'-t',str(D),'-i',mus];f=[]
    f.append(f'[1:a]adelay=300|300,acompressor=threshold=-18dB:ratio=2.5:attack=5:release=80,highpass=f=80[vo]')
    f.append(f'[2:a]volume={muvol},afade=t=in:d=1,afade=t=out:st={D-2}:d=2[mu]');tags=['[vo]','[mu]'];n=[3]
    def add(fl,ts,vol):
        for t in ts:
            ins.extend(['-i',fl]);ms=int((t+O)*1000);f.append(f'[{n[0]}:a]adelay={ms}|{ms},volume={vol}[x{n[0]}]');tags.append(f'[x{n[0]}]');n[0]+=1
    add('/tmp/mmw/th/sfx/2142.mp3',[t-0.12 for t in sc],0.18);add('/tmp/mmw/th/sfx/3163.wav',pops,0.2);add(stamps[0],stamps[1],stamps[2])
    f.append(''.join(tags)+f'amix=inputs={len(tags)}:duration=longest:normalize=0,atrim=0:{D},alimiter=limit=0.9:level=disabled,loudnorm=I=-14:TP=-1.5[ao]')
    r=subprocess.run(['ffmpeg','-v','error','-y',*ins,'-filter_complex',';'.join(f),'-map','0:v','-map','[ao]','-t',str(D),'-c:v','libx264','-crf','21','-preset','slow','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',out],capture_output=True,text=True);print(out,r.stderr[-300:])
# video 1
h=open('/tmp/mmw/mdx/ad.html').read(); E=re.findall(r"\['([A-K])',([\d.]+),'(\w+)'",h)
mix('/tmp/mmw/mdx/vid.mp4','/tmp/mmw/mdx/vo/vo0.mp3','/tmp/mmw/rr/mus/744.mp3',8,38.5,[2.94,6.64,10.1,14.4,17.3,20.98,24.66,27.8,31.4],
 sorted(set(float(a) for s,a,an in E if an in('pop','slideR','slideL','drop'))),('/tmp/mmw/th/sfx/546.mp3',sorted(set(float(a) for s,a,an in E if an=='stamp')),0.4),
 '/home/user/eslam/MaxDesign/MaxDesign_Explainer_3Mistakes.mp4',0.13)
# video 2
h=open('/tmp/mmw/md2/ad.html').read(); A=re.findall(r"\['(s\d\w*)',([\d.]+),'(\w+)'\]",h)
mix('/tmp/mmw/md2/vid.mp4','/tmp/mmw/md2/vo/vo0.mp3','/tmp/mmw/rr/mus/470.mp3',0,30,[3.04,5.38,10.16,15.02,18.66,22.4],
 sorted(set(float(a) for s,a,an in A if an in('pop','drop','slideR','slideL','rise') and not s.startswith(('s4l','s6l')))),('/tmp/mmw/th/sfx/2142.mp3',sorted(set(float(a) for s,a,an in A if an=='wipe')),0.1),
 '/home/user/eslam/MaxDesign/MaxDesign_Motion_FromIdeaToHandover.mp4',0.15)
