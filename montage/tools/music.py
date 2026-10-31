"""Synthesize an original cinematic trap bed. usage: music.py out.wav total_sec intro_sec end_start"""
import numpy as np, wave, sys
SR = 48000
T, INTRO, END = float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4])
N = int(SR * (T + 1.5))
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)
BPM = 100; B = 60 / BPM

def add(sig, t, g=1.0, pan=0.0):
    i = int(t * SR); n = min(len(sig), N - i)
    if n <= 0: return
    L[i:i+n] += sig[:n] * g * (1 - max(pan, 0)); R[i:i+n] += sig[:n] * g * (1 + min(pan, 0))

def env(n, d): return np.exp(-np.arange(n) / SR / d)
def lp(x, fc):
    a = np.exp(-2*np.pi*fc/SR); y = np.zeros_like(x); s = 0.0
    for i in range(len(x)): s = (1-a)*x[i] + a*s; y[i] = s
    return y
def hp(x, fc): return x - lp(x, fc)

def kick(g=1.0):
    n = int(0.5*SR); t = np.arange(n)/SR
    f = 45 + 110*np.exp(-t/0.04); ph = 2*np.pi*np.cumsum(f)/SR
    return np.tanh(2.2*np.sin(ph)*env(n, 0.18))*g
def clap():
    n = int(0.35*SR); x = rng.standard_normal(n)
    e = np.zeros(n)
    for o in (0, 0.012, 0.024): e[int(o*SR):] += env(n-int(o*SR), 0.03 if o < 0.02 else 0.12)
    return hp(lp(x*e, 3500), 700)*0.5
def hat(d=0.03):
    n = int(0.12*SR); return hp(rng.standard_normal(n), 7000)*env(n, d)*0.22
def boom():
    n = int(3.0*SR); t = np.arange(n)/SR
    f = 30 + 60*np.exp(-t/0.15); s = np.sin(2*np.pi*np.cumsum(f)/SR)*env(n, 0.9)
    nz = lp(rng.standard_normal(n), 900)*env(n, 0.5)*0.6
    return np.tanh(1.8*(s + nz))
def riser(d):
    n = int(d*SR); t = np.arange(n)/SR
    x = hp(rng.standard_normal(n), 2500)*(t/d)**2*0.35
    return x
def note(freq, d, kind='pad'):
    n = int(d*SR); t = np.arange(n)/SR
    if kind == 'pad':
        s = sum(np.sin(2*np.pi*freq*k*(1+det)*t)/k for k in (1, 2, 3) for det in (-0.004, 0.004))
        a = np.minimum(1, t/0.6)*np.minimum(1, (d-t)/0.6)
        return lp(s*a, 1400)*0.06
    if kind == '808':
        s = np.sin(2*np.pi*freq*t + 0.6*np.sin(2*np.pi*freq*2*t)*env(n, 0.1))
        return np.tanh(1.6*s*env(n, 0.9)*np.minimum(1, (d-t)/0.05))*0.45
    if kind == 'pluck':
        s = np.sign(np.sin(2*np.pi*freq*t))*env(n, 0.12)
        return lp(s, 2600)*0.05

hz = lambda m: 440*2**((m-69)/12)
prog = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [55, 60, 64]), (55, [55, 59, 62])]  # Am F C G

add(boom(), 0.0, 0.9)                        # logo impact
add(riser(INTRO), 0.0, 0.5)
t = INTRO; bar = 0
while t < END:
    root, chord = prog[bar % 4]
    for m in chord: add(note(hz(m), 4*B+0.6), t, 1.0, 0.0)
    add(note(hz(root-24), 1.6*B, '808'), t); add(note(hz(root-24), 1.2*B, '808'), t+2.5*B)
    for k, m in enumerate([chord[0]+12, chord[1]+12, chord[2]+12, chord[1]+12]*2):
        add(note(hz(m), 0.3, 'pluck'), t + k*B/2, 1.0, 0.4 if k % 2 else -0.4)
    for q in (0, 1.75, 2.5): add(kick(), t + q*B)
    for q in (1, 3): add(clap(), t + q*B, 0.9)
    for h in range(8): add(hat(0.05 if h % 2 else 0.025), t + h*B/2, 1.0, 0.3)
    if bar % 2: [add(hat(), t + 3*B + j*B/6, 0.7, -0.3) for j in range(6)]
    t += 4*B; bar += 1
add(riser(0.8), END-0.8, 0.6)
add(boom(), END, 1.0)
for m in prog[0][1]: add(note(hz(m), 3.2), END, 1.3)

# simple stereo reverb (FFT convolution with decaying noise)
ir_n = int(1.6*SR); ir = rng.standard_normal((2, ir_n))*env(ir_n, 0.45)*0.02
def conv(x, h):
    m = len(x)+len(h); f = 1 << (m-1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, f)*np.fft.rfft(h, f), f)[:len(x)]
L, R = L + conv(L, ir[0]), R + conv(R, ir[1])
st = np.stack([L, R], 1)[:int(T*SR)]
fo = int(1.2*SR); st[-fo:] *= np.linspace(1, 0, fo)[:, None]
st = np.tanh(st/np.max(np.abs(st))*1.2)*0.85
w = wave.open(sys.argv[1], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st*32767).astype(np.int16).tobytes()); w.close()
print('music ok', T)
