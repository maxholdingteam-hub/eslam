import numpy as np, wave
SR=48000; T=23.5; N=int(SR*T); t=np.arange(N)/SR
B=0.5; rng=np.random.default_rng(7)
out=np.zeros(N)
def add(x,s,amp=1.0):
    i=int(s*SR); j=min(N,i+len(x))
    if i<N: out[i:j]+=amp*x[:j-i]
def lp(x,a):
    y=np.empty_like(x); s=0.0
    for i in range(len(x)): s+=a*(x[i]-s); y[i]=s
    return y
def kick():
    n=int(.45*SR); tt=np.arange(n)/SR; f=48+110*np.exp(-tt*28)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*7)
def hat(dec=55):
    n=int(.12*SR); tt=np.arange(n)/SR; x=rng.standard_normal(n); x=x-lp(x,.35)
    return x*np.exp(-tt*dec)*.5
def clap():
    n=int(.3*SR); tt=np.arange(n)/SR; x=rng.standard_normal(n); x=lp(x,.5)-lp(x,.08)
    env=np.exp(-tt*18)*(1+0.6*np.sin(2*np.pi*90*tt)**2)
    return x*env
K,H,C=kick(),hat(),clap()
def nf(m): return 440*2**((m-69)/12)
# progression per 2 bars (4s): Dm9, Bbmaj7, Gm9, A7sus
prog=[[50,57,60,64,65],[46,53,57,60,62],[43,50,53,57,58],[45,52,55,57,62]]
bass=[38,34,31,33]
END=20.0
for bar in range(int(T/2)+1):
    s0=bar*2.0
    for k in range(4):
        tb=s0+k*B
        if tb>=T: break
        if 1.0<=tb<END: add(K,tb,.9)                      # kick from 1s (after hook downbeat)
        if 2.0<=tb<END: add(H,tb+B/2,.35)                 # offbeat hats
        if 4.0<=tb<END and k in (1,3): add(C,tb,.45)      # claps on 2 & 4
        if 8.0<=tb<END: add(hat(90),tb+B/4,.15); add(hat(90),tb+3*B/4,.12)
# pads + bass per chord (4s)
pad=np.zeros(N); bs=np.zeros(N)
for c in range(6):
    s=c*4.0; e=min(T,s+4.0)
    if s>=T: break
    i0,i1=int(s*SR),int(e*SR); tt=np.arange(i1-i0)/SR
    env=np.minimum(1,tt/.25)*np.minimum(1,(e-s-tt)/.3)
    for m in prog[c%4]:
        f=nf(m+12)
        for d in (-.08,.08): pad[i0:i1]+=env*np.sin(2*np.pi*f*2**(d/12)*tt+ np.sin(2*np.pi*.3*tt))*.03
    # bass: pulsing 8ths
    fb=nf(bass[c%4])
    for k in range(8):
        a=s+k*B/2+0.25
        if a>=min(e,END): break
        n=int(.22*SR); tt2=np.arange(n)/SR
        x=(np.sin(2*np.pi*fb*tt2)+.35*np.sin(4*np.pi*fb*tt2))*np.exp(-tt2*9)
        i=int(a*SR); j=min(N,i+n); bs[i:j]+=x[:j-i]*.35
pad=lp(pad,.12)
# sidechain pump on pad
pump=np.ones(N)
for k in np.arange(1.0,END,B):
    i=int(k*SR); n=int(.35*SR); j=min(N,i+n); pump[i:j]=np.minimum(pump[i:j],.35+.65*(np.arange(j-i)/n))
mix=out+pad*pump+bs
# riser into end (18-20s) and impact at 20
n=int(2*SR); tt=np.arange(n)/SR; r=rng.standard_normal(n); r=r-lp(r,.02+.2*tt.mean())
add(r*(tt/2)**2*.25,18.0)
add(K*1.2,20.0); 
n=int(3*SR); tt=np.arange(n)/SR
add(np.sin(2*np.pi*nf(38)*tt)*np.exp(-tt*1.2)*.5,20.0)
for m in prog[0]: add(np.sin(2*np.pi*nf(m+12)*tt)*np.exp(-tt*.8)*.06,20.0)
mix=out*0+mix  # keep
mix=mix+0
fade=np.minimum(1,t/.3)*np.minimum(1,(T-t)/1.2)
mix=np.tanh(mix*1.3)*fade
d=int(.01*SR); L=mix; R=np.concatenate([np.zeros(d),mix[:-d]])*.85+.15*mix
st=np.stack([L,R],1); st/=np.max(np.abs(st))*1.1
w=wave.open('music.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype('<i2').tobytes()); w.close(); print('ok')
