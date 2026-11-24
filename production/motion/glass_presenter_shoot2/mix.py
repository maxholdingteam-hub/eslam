import json,subprocess,sys
vid,out=sys.argv[1],sys.argv[2]
ev=json.load(open('/tmp/mmw/g2/cfg.json'))['ev'];S='/home/user/eslam/production/tools/sfx/'
fx=[(S+'3163.wav',t,.28) for t in [ev['logo'],ev['choices'],ev['choices']+0.15,ev['choices']+0.3,ev['ask'],ev['app']]]+[(S+'2142.mp3',ev[k]-0.05,.2) for k in ['suv','sedan','pickup','all','site','num']]+[(S+'2142.mp3',ev['giant'],.4),(S+'2142.mp3',ev['giant_end']-0.45,.3),(S+'2142.mp3',ev['offer'],.25),(S+'2142.mp3',ev['end']-0.1,.35)]
D=ev['end']+2.5
inp=['-i',vid,'-i','/tmp/mmw/g2/speech.wav','-i','/tmp/mmw/g2/mus.mp3'];f=['[1:a]highpass=f=90,afftdn=nf=-25,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,volume=1.6[sp]',f'[2:a]atrim=0:{D},volume=0.17,afade=t=out:st={D-1.4}:d=1.3[mu]'];lab=''
for i,(p,t,v) in enumerate(fx):
    inp+=['-i',p];ms=int(t*1000);f.append(f'[{i+3}:a]adelay={ms}|{ms},volume={v}[s{i}]');lab+=f'[s{i}]'
f.append('[sp][mu]'+lab+f'amix=inputs={2+len(fx)}:normalize=0,loudnorm=I=-14:TP=-1.5,atrim=0:{D}[a]')
subprocess.run(['ffmpeg','-y','-v','error']+inp+['-filter_complex',';'.join(f),'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k',out],check=True);print('mixed',out)
