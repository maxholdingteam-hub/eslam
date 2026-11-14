# Land Cruiser vs Patrol reel (cmp/vs.html), music only: OpenTracks ot_20880 (Arabian, hijaz),
# frame-accurate SFX from lib/sfx
import sys, os, json, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
D = '/tmp/claude-0/-home-user-eslam/0f5505b8-8bf4-57e7-9c4a-28493f9f4c64'
sys.path.insert(0, f'{D}/lib/sfx'); import sfxlib
SR = 48000; DUR = 19.6; N = int((DUR + 4) * SR)
VO_DIR = os.environ.get('VO_DIR', f'{D}/scratchpad/vo_rz')


def rd(p):
    with wave.open(p) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768
        a = a.reshape(-1, w.getnchannels())
    return a if a.shape[1] == 2 else np.repeat(a, 2, 1)


def env(x, a=0.0, b=0.0):
    x = x.copy(); n = len(x)
    if a: k = min(n, int(a * SR)); x[:k] *= (0.5 - 0.5 * np.cos(np.linspace(0, np.pi, k)))[:, None]
    if b: k = min(n, int(b * SR)); x[-k:] *= (0.5 + 0.5 * np.cos(np.linspace(0, np.pi, k)))[:, None]
    return x


def put(buf, t, x, g=0.0, fin=0.0, fout=0.0, pan=0.0):
    x = env(x, fin, fout) * np.float32(10 ** (g / 20))
    if pan: x = x * np.array([min(1, 1 - pan), min(1, 1 + pan)], np.float32)
    i = int(round(t * SR))
    if i < 0: x = x[-i:]; i = 0
    m = min(len(x), len(buf) - i); buf[i:i + m] += x[:m]


def bed(buf, t0, t1, x, off=0.0, g=0.0, fin=0.5, fout=0.5):
    s = int(off * SR); put(buf, t0, x[s:s + int((t1 - t0) * SR)], g, fin, fout)


def verb(x, sec=1.4, mix=0.25, seed=3):
    r = np.random.default_rng(seed); n = int(sec * SR); t = np.arange(n) / SR
    ir = np.stack([r.standard_normal(n), r.standard_normal(n)], 1) * np.exp(-6.9 * t / sec)[:, None]
    ir = sosfilt(butter(2, 5000, 'low', fs=SR, output='sos'), ir, axis=0); ir /= np.sqrt((ir ** 2).sum(0))
    w = np.stack([fftconvolve(x[:, c], ir[:, c]) for c in range(2)], 1).astype(np.float32)
    y = np.zeros_like(w); y[:len(x)] = x
    return y * (1 - mix) + w * mix


def peaknorm(x, db=-1.0):
    return x * np.float32(10 ** (db / 20) / max(1e-9, np.abs(x).max()))


mus = np.zeros((N, 2), np.float32); fx = np.zeros_like(mus); hit = np.zeros_like(mus)

# ---- music: Mixkit 846 (real brass + drums) from 65.556 s -> its drop (67.756) lands on the VS slam at 2.20
M = rd(f'{D}/lib/music/846.wav')
a = int(65.556 * SR); put(mus, 0.0, M[a:a + int(19.6 * SR)], 0, 0.05, 1.6)
mus *= np.float32(10 ** (-4.0 / 20)) * float(os.environ.get('MUSIC', 1))

P = lambda t, e, **k: sfxlib.place(fx, t, e, **k)
H = lambda t, e, **k: sfxlib.place(hit, t, e, **k)
VS, R, Q, END = 2.20, [4.49, 6.73, 8.90, 11.20], 13.32, 15.34
for i, t in enumerate([0.0, 0.44, 0.97, 1.50]): P(t, ('whip_pan', i % 2), align='peak', gain_db=-17, vary=0.4, seed=10 + i)
H(0.08, ('hit_heavy', 1), align='peak', gain_db=-12)
P(VS - 0.05, ('riser_2s', 1), align='peak', gain_db=-17)
H(VS, ('hit_heavy', 3), align='peak', gain_db=-7); H(VS, ('sub_boom', 0), align='peak', gain_db=-8)
P(VS + 0.2, ('car_passby', 0), align='peak', gain_db=-14); P(VS + 0.3, ('car_passby', 1), align='peak', gain_db=-15)
for i, t in enumerate(R):
    P(t, ('whoosh_medium', i % 2), align='peak', gain_db=-15, vary=0.4, seed=20 + i)
    H(t + 0.64, ('hit_heavy', i % 2), align='peak', gain_db=-16, vary=0.3, seed=30 + i)
    H(t + 0.90, ('hit_heavy', (i + 1) % 2), align='peak', gain_db=-16, vary=0.3, seed=40 + i)
P(Q, ('swoosh_long', 0), align='peak', gain_db=-16); P(Q + 0.45, ('ui_pop', 2), align='peak', gain_db=-17)
for i in range(2): P(Q + 1.05 + i * 0.15, ('ui_pop', 0), align='peak', gain_db=-19, seed=50 + i)
P(END - 0.4, ('reverse_swell', 1), align='peak', gain_db=-17)
P(END + 0.1, ('logo_impact', 0), align='peak', gain_db=-12); H(END + 0.1, ('sub_boom', 0), align='peak', gain_db=-8)
P(END + 0.9, ('logo_sting', 2), align='peak', gain_db=-19)

mix = mus + fx + hit
mix = mix[:int(DUR * SR)] * np.clip((DUR - np.arange(int(DUR * SR)) / SR) / 0.6, 0, 1)[:, None] ** 0.5
g = 10 ** (-1.5 / 20) / np.abs(mix).max()
OUT = os.environ['OUT']
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix * g, -1, 1) * 32767).astype('<i2').tobytes())
print('ok', OUT, DUR)
