import numpy as np, wave
SR=48000; T=21.0; N=int(SR*T); t=np.arange(N)/SR; rng=np.random.default_rng(3)
out=np.zeros(N)
def add(x,s,a=1.0):
    i=int(s*SR); j=min(N,i+len(x))
    if 0<=i<N: out[i:j]+=a*x[:j-i]
def lp(x,a):
    y=np.empty_like(x); s=0.0
    for i in range(len(x)): s+=a*(x[i]-s); y[i]=s
    return y
def nf(m): return 440*2**((m-69)/12)
def piano(m,d=2.5,a=.25):
    n=int(d*SR); tt=np.arange(n)/SR; f=nf(m)
    x=sum(np.sin(2*np.pi*f*h*tt)*np.exp(-tt*(1.2+h*.9))/h**1.3 for h in (1,2,3,4))
    return x*np.minimum(1,tt/.004)*a
# 80 bpm, beat .75s; chords Cmaj7 Am9 Fmaj7 G6 each 3s
prog=[[48,55,59,64],[45,52,55,59],[41,48,52,57],[43,50,55,59]]
mel=[76,74,72,71,72,74,76,79,77,76,74,72,71,72,74,72]
for c in range(7):
    s=c*3.0
    if s>=T-1: break
    ch=prog[c%4]
    add(piano(ch[0]-12,3.2,.35),s)
    for k,m in enumerate(ch[1:]): add(piano(m,2.8,.13),s+.02*k)
    for k in range(4):
        tb=s+k*.75
        if tb<T-2.5: add(piano(mel[(c*4+k)%len(mel)],1.6,.17),tb+.375)
# pad
pad=np.zeros(N)
for c in range(7):
    s=c*3.0; e=min(T,s+3.1); i0,i1=int(s*SR),int(e*SR); tt=np.arange(i1-i0)/SR
    env=np.minimum(1,tt/.6)*np.minimum(1,(e-s-tt)/.6)
    for m in prog[c%4]: pad[i0:i1]+=env*np.sin(2*np.pi*nf(m+12)*tt)*.025
out+=lp(pad,.1)
# pencil scratches at start of each scene, shimmer swell at transformation
for s0 in (0.0,5.7,11.4):
    for k in range(5):
        n=int(.18*SR); x=rng.standard_normal(n); x=x-lp(x,.3); x*=np.hanning(n)*.05
        add(x,s0+.25+k*.3)
    n=int(2.6*SR); tt=np.arange(n)/SR
    sh=sum(np.sin(2*np.pi*nf(m)*tt) for m in (84,88,91,95))*(np.sin(np.pi*tt/2.6)**2)*.02
    add(sh,s0+1.6)
fade=np.minimum(1,t/.4)*np.minimum(1,(T-t)/1.6)
mix=np.tanh(out*1.6)*fade
d=int(.014*SR); L=mix; R=np.concatenate([np.zeros(d),mix[:-d]])*.8+.2*mix
st=np.stack([L,R],1); st/=np.max(np.abs(st))*1.12
w=wave.open('music.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype('<i2').tobytes()); w.close(); print('ok')
