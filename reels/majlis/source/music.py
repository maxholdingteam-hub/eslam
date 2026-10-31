import numpy as np, wave
SR=48000; T=23.0; N=int(SR*T); t=np.arange(N)/SR
L=np.zeros(N); R=np.zeros(N)
def lp(x,a):  # one-pole lowpass
    y=np.empty_like(x); s=0.0
    for i in range(len(x)): s+=a*(x[i]-s); y[i]=s
    return y
def note(f): return 440*2**((f-69)/12)
beat=0.95; t0=0.3
# pad chords (Dm, Bb, Gm, A) per bar of 4 beats
chords=[[50,57,62,65],[46,53,58,62],[43,50,55,58],[45,52,57,61]]
pad=np.zeros(N)
bar=4*beat
for b in range(7):
    st=t0+b*bar-0.3 if b else 0; en=min(T,t0+(b+1)*bar+0.4)
    i0,i1=int(max(0,st)*SR),int(en*SR); tt=np.arange(i1-i0)/SR
    env=np.minimum(1,tt/0.6)*np.minimum(1,(en-max(0,st)-tt)/0.6)
    for m in chords[b%4]:
        f=note(m)
        for det in (-0.12,0.12):
            ph=2*np.pi*f*2**(det/12)*tt
            pad[i0:i1]+=env*(np.sin(ph)+0.3*np.sin(2*ph)+0.12*np.sin(3*ph))*0.05
pad=lp(pad,0.08)
# Karplus-Strong plucks (oud-like) melody in D hijaz
def pluck(f,dur,amp):
    n=int(dur*SR); p=int(SR/f); buf=np.random.uniform(-1,1,p); out=np.zeros(n)
    for i in range(n):
        out[i]=buf[i%p]; buf[i%p]=0.996*0.5*(buf[i%p]+buf[(i+1)%p])
    return out*amp
mel=[(62,0),(63,0.5),(66,1),(67,1.5),(69,2),(67,3),(66,3.5),(63,4),(62,5),(69,6),(70,6.5),(69,7),(67,7.5),(66,8),(63,9),(62,10),(66,11),(67,11.5),(69,12),(72,13),(70,13.5),(69,14),(67,15),(66,16),(63,17),(62,18),(62,20)]
pl=np.zeros(N)
for m,bt in mel:
    s=t0+bt*beat+beat*2  # start after intro
    if s>T-1: continue
    x=pluck(note(m),1.6,0.32); i=int(s*SR); j=min(N,i+len(x)); pl[i:j]+=x[:j-i]
# frame drum: doum on beat 1 & 3, tek on offbeats
dr=np.zeros(N)
def hit(s,f0,dec,amp,noise=0.0):
    n=int(0.5*SR); tt=np.arange(n)/SR
    f=f0*(1+1.5*np.exp(-tt*40)); x=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*dec)
    if noise: x+=noise*np.random.randn(n)*np.exp(-tt*60)
    i=int(s*SR); j=min(N,i+n)
    if i<N: dr[i:j]+=amp*x[:j-i]
k=0; tb=t0+2*beat
while tb<T-3.6:
    pos=k%8
    if pos in (0,4): hit(tb,62,9,0.55)
    if pos in (3,6,7): hit(tb,190,28,0.18,0.25)
    k+=1; tb+=beat/2
# swells at cuts
for c in (4.1,7.9,11.7,15.5,19.3):
    i=int((c-0.9)*SR); n=int(0.9*SR); tt=np.arange(n)/SR
    sw=np.random.randn(n)*(tt/0.9)**2*0.05; sw=lp(sw,0.05)*3
    dr[i:i+n]+=sw
mix=pad+pl+dr
# master fade
fade=np.minimum(1,t/1.2)*np.minimum(1,(T-t)/2.0)
mix*=fade
# simple stereo: plucks slightly right, pad wide via delay
d=int(0.012*SR)
L=mix+0.0; R=np.concatenate([np.zeros(d),mix[:-d]])*0.9+0.1*mix
st=np.stack([L,R],1); st/=np.max(np.abs(st))*1.12
w=wave.open('music.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype('<i2').tobytes()); w.close()
print('ok')
