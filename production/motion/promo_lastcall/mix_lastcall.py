# Mix for promo_lastcall: VO lines + music (~0.12) + split-flap / chime / whoosh SFX, loudnorm -14
import subprocess,os
D=os.path.dirname(os.path.abspath(__file__));P=lambda *a:os.path.join(D,*a)
DUR=28.8;OUT='/home/user/eslam/MaxMotors_Ads/MaxMotors_Promo_LastCall.mp4'
VO=[('l1',1.55),('l2',6.55),('l3',8.9),('l4',14.9),('l5',18.1),('l6',22.2)]
FLAP=P('sfx','sfx_flap.mp3');CH=P('sfx','sfx_chime.mp3');WH=P('sfx','whoosh_2142.mp3');HIT=P('sfx','hit_3163.wav')
# (time, source offset, length, volume, extra filter)
FL=[(0.1,0.8,1.15,2.4,''),(4.1,0.75,2.0,1.6,''),(8.9,1.1,0.5,1.8,''),(9.82,1.6,0.5,1.8,''),(10.64,1.25,0.5,1.8,''),
    (12.45,0.9,0.5,1.6,''),(13.0,1.7,0.45,1.6,''),(13.55,1.4,0.55,1.6,''),(18.15,0.85,0.9,2.0,''),
    (20.8,0.8,1.25,1.4,',lowpass=f=1400')]  # last one = printer feed
WHS=[3.75,8.35,12.25,14.65,17.55,20.55,26.2]
ins=['-i',P('vid.mp4')];f=[];tags=[];n=1
def inp(path,pre=None):
    global n
    ins.extend((pre or [])+['-i',path]);n+=1;return n-1
for k,t in VO:
    i=inp(P('vo',k+'.mp3'));ms=int(t*1000);f.append(f'[{i}:a]highpass=f=80,acompressor=threshold=-18dB:ratio=2.5:attack=5:release=80,adelay={ms}|{ms}[v{i}]');tags.append(f'[v{i}]')
i=inp(P('mus.mp3'));f.append(f'[{i}:a]atrim=0:{DUR},volume=0.12,afade=t=in:d=0.6,afade=t=out:st={DUR-2.2}:d=2.2[m]');tags.append('[m]')
i=inp(CH);ms=1250;f.append(f'[{i}:a]atrim=0:1.7,afade=t=out:st=0.9:d=0.8,volume=0.32,adelay={ms}|{ms}[c]');tags.append('[c]')
for t,ss,L,vol,ex in FL:
    i=inp(FLAP);ms=int(t*1000)
    f.append(f'[{i}:a]atrim={ss}:{ss+L},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={L-0.12}:d=0.12,volume={vol}{ex},adelay={ms}|{ms}[f{i}]');tags.append(f'[f{i}]')
for t in WHS:
    i=inp(WH);ms=max(0,int((t-0.2)*1000));f.append(f'[{i}:a]volume=0.3,adelay={ms}|{ms}[w{i}]');tags.append(f'[w{i}]')
for t,vol in [(14.7,0.22),(26.3,0.22)]:
    i=inp(HIT);ms=int(t*1000);f.append(f'[{i}:a]volume={vol},adelay={ms}|{ms}[h{i}]');tags.append(f'[h{i}]')
f.append(''.join(tags)+f'amix=inputs={len(tags)}:duration=longest:normalize=0,atrim=0:{DUR},alimiter=limit=0.9:level=disabled[ao]')
WAV=P('mix_pre.wav')
r=subprocess.run(['ffmpeg','-v','error','-y',*ins,'-filter_complex',';'.join(f),'-map','[ao]','-t',str(DUR),'-ar','48000',WAV],capture_output=True,text=True);assert r.returncode==0,r.stderr
# two-pass loudnorm to -14 LUFS
import json,re
m=subprocess.run(['ffmpeg','-i',WAV,'-af','loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
j=json.loads(m[m.rindex('{'):m.rindex('}')+1])
g=-14.0-float(j['input_i'])  # linear gain to -14 LUFS, then a peak limiter for -1.5 dBTP headroom
ln=f"aresample=192000,volume={g+2.3:.2f}dB,alimiter=limit=0.84:attack=2:release=60:level=disabled,aresample=48000"
print('gain dB',round(g,2))
cmd=['ffmpeg','-v','error','-y','-i',P('vid.mp4'),'-i',WAV,'-af',ln,'-map','0:v','-map','1:a','-t',str(DUR),
     '-c:v','libx264','-crf','20','-preset','slow','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',OUT]
r=subprocess.run(cmd,capture_output=True,text=True);print(OUT,r.returncode,r.stderr[-500:])
