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
# cinematic: braam hits + soft low pulse (heartbeat) + shimmer
dr=np.zeros(n)
def add(sig,at,g):
    i=int(at*sr); j=min(n,i+len(sig)); dr[i:j]+=sig[:j-i]*g
def braam(root):
    tt=np.arange(int(3.5*sr))/sr; x=np.zeros(len(tt))
    for m,g in ((root-24,1.0),(root-12,0.7),(root-5,0.4),(root,0.3)):
        f=note(m)
        for d in (-0.1,0,0.1):
            ph=2*np.pi*f*2**(d/12)*tt; x+=g*(2*((ph/(2*np.pi))%1)-1)*0.33
    x=lp(x,0.04)*np.minimum(1,tt/0.03)*np.exp(-tt*0.9)
    return x
def thump():
    tt=np.arange(int(0.5*sr))/sr; return np.sin(2*np.pi*(40+50*np.exp(-tt*30))*tt)*np.exp(-tt*7)
B=braam(57); T=thump()
for at,g in ((0.0,0.9),(3.15,0.7),(9.85,0.8),(19.14,1.0)): add(B,at,g)
tb=6.3
while tb<19.0:
    add(T,tb,0.55); add(T,tb+0.22,0.3); tb+=beat*2
# shimmer (high soft tones) in the middle
sh=np.zeros(n); tt=t
for m in (81,84,88):
    sh+=np.sin(2*np.pi*note(m)*tt)*0.012*(0.5+0.5*np.sin(2*np.pi*0.25*tt))
sh*=((t>9.85)&(t<19.1))
dr+=sh
mix=pad*0.9+dr*0.8
mix/=np.max(np.abs(mix))*1.1
# fade
f=np.ones(n); fo=int(1.2*sr); f[-fo:]=np.linspace(1,0,fo); mix*=f
st=np.stack([mix,mix],1)
# slight stereo: delay right channel 12ms on pad
d=int(0.012*sr); st[d:,1]=0.85*st[d:,1]+0.15*mix[:-d]
w=wave.open(sys.argv[1],'w'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((st*32767*0.9).astype(np.int16).tobytes()); w.close()
