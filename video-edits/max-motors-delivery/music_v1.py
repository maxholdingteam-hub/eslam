import numpy as np, wave, sys
sr=48000; bpm=100; beat=60/bpm; L=23.0; n=int(sr*L); t=np.arange(n)/sr
out=np.zeros((n,2))
def lp(x,a):  # one-pole lowpass
    y=np.empty_like(x); s=0.0
    for i in range(len(x)): s+=a*(x[i]-s); y[i]=s
    return y
def note(f): return 440*2**((f-69)/12)
# chord progression (Am F C G) one per 2 bars
prog=[[57,60,64,69],[53,57,60,65],[48,55,60,64],[55,59,62,67]]
bar=4*beat; cl=2*bar
pad=np.zeros(n)
for ci in range(int(L/cl)+1):
    ch=prog[ci%4]; s=int(ci*cl*sr); e=min(n,int((ci+1)*cl*sr)+int(0.3*sr))
    if s>=n: break
    tt=np.arange(e-s)/sr
    env=np.minimum(1,tt/0.6)*np.minimum(1,np.maximum(0,(cl+0.3-tt)/0.5))
    for m in ch:
        for d in (-0.08,0.08):
            f=note(m)*2**(d/12)
            ph=np.random.rand()*6.28
            pad[s:e]+=env*(np.sin(2*np.pi*f*tt+ph)+0.3*np.sin(4*np.pi*f*tt+ph))*0.05
    # sub bass root
    f=note(ch[0]-24); be=np.exp(-((tt%beat))*1.2)
    pad[s:e]+=env*np.sin(2*np.pi*f*tt)*0.18*(0.6+0.4*be)
pad=lp(pad,0.12)
# drums: kick each beat, hats on 8ths, clap on 2&4 ; enter after intro (t>=6.3 soft hats, full after 9.85)
def kick(): 
    tt=np.arange(int(0.35*sr))/sr; return np.sin(2*np.pi*(48+90*np.exp(-tt*35))*tt)*np.exp(-tt*9)
def hat():
    tt=np.arange(int(0.06*sr))/sr; x=np.random.randn(len(tt)); x=x-lp(x,0.5); return x*np.exp(-tt*70)*0.25
def clap():
    tt=np.arange(int(0.2*sr))/sr; x=np.random.randn(len(tt)); x=x-lp(x,0.15); return x*np.exp(-tt*22)*0.35
dr=np.zeros(n); K,H,C=kick(),hat(),clap()
def add(sig,at,g):
    i=int(at*sr); j=min(n,i+len(sig)); dr[i:j]+=sig[:j-i]*g
k=0; tb=0.0
while tb<L-0.3:
    if tb>=9.85 and tb<19.1:
        add(K,tb,0.75)
        if k%2==1: add(C,tb,0.8)
    elif tb<6.3: add(K,tb,0.35) if k%4==0 else None
    else: add(K,tb,0.5) if k%2==0 else None
    if tb>=6.3 and tb<19.1:
        add(H,tb+beat/2,0.9); add(H,tb,0.5)
    k+=1; tb+=beat
mix=pad*1.0+dr*0.55
mix/=np.max(np.abs(mix))*1.1
# fade
f=np.ones(n); fo=int(1.2*sr); f[-fo:]=np.linspace(1,0,fo); mix*=f
st=np.stack([mix,mix],1)
# slight stereo: delay right channel 12ms on pad
d=int(0.012*sr); st[d:,1]=0.85*st[d:,1]+0.15*mix[:-d]
w=wave.open(sys.argv[1],'w'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((st*32767*0.9).astype(np.int16).tobytes()); w.close()
