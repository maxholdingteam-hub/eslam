# Honda Accord 2025 reel (acc/reel.html), music only: OpenTracks ot_13971 (Arabian orchestral),
# frame-accurate SFX from lib/sfx
import sys, os, json, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, f'{D}/lib/sfx'); import sfxlib
SR = 48000; DUR = 27.5; N = int((DUR + 4) * SR)
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

# ---- music: ot_13971 from 104.83 s -> its big hit (109.23) lands on the reveal at 4.40, the drop (124.62) on 19.79
M = rd(f'{D}/lib/music/ot_13971.wav')
a = int(104.83 * SR); put(mus, 0.0, M[a:a + int(27.5 * SR)], 0, 0.2, 1.8)
mus *= np.float32(10 ** (-3.0 / 20))

P = lambda t, e, **k: sfxlib.place(fx, t, e, **k)
H = lambda t, e, **k: sfxlib.place(hit, t, e, **k)
REV, EXT, INT, PERF, SAFE, DROP, END = 4.40, 8.59, 11.79, 14.99, 18.19, 19.79, 22.99
# intro: the showroom lights swell, the reveal hits
P(3.0, ('reverse_swell', 1), align='peak', gain_db=-16, )
H(REV, ('hit_heavy', 0), align='peak', gain_db=-8); H(REV, ('sub_boom', 0), align='peak', gain_db=-9); P(REV + 0.5, ('sparkle', 1), align='peak', gain_db=-21)
cuts = [EXT, EXT + 0.8, EXT + 1.6, EXT + 2.4, INT, INT + 1.6, PERF, SAFE]
for i, c in enumerate(cuts): P(c, (('whoosh_short', 1), ('whip_pan', 1), ('whoosh_short', 2), ('whip_pan', 3), ('whoosh_medium', 0), ('swoosh_long', 0), ('whoosh_medium', 1), ('whip_pan', 1))[i], align='peak', gain_db=-17, vary=0.4, seed=40 + i)
for i in range(3): P(INT + 1.75 + i * 0.2, ('ui_pop', 0), align='peak', gain_db=-21, seed=50 + i)
for i in range(4): P(PERF + 0.55 + i * 0.4, ('ui_pop', 2 if i == 0 else 0), align='peak', gain_db=-19, seed=60 + i)
P(DROP - 0.02, ('riser_2s', 1), align='peak', gain_db=-15)
H(DROP, ('hit_heavy', 3), align='peak', gain_db=-7); H(DROP, ('sub_boom', 0), align='peak', gain_db=-8)
for i in range(3): P(DROP + 0.95 + i * 0.2, ('ui_pop', 0), align='peak', gain_db=-20, seed=70 + i)
P(END - 0.4, ('reverse_swell', 1), align='peak', gain_db=-17)
P(END + 0.1, ('logo_impact', 0), align='peak', gain_db=-13); H(END + 0.1, ('sub_boom', 0), align='peak', gain_db=-8)
P(END + 0.9, ('logo_sting', 2), align='peak', gain_db=-19)

mix = mus + fx + hit
mix = mix[:int(DUR * SR)] * np.clip((DUR - np.arange(int(DUR * SR)) / SR) / 0.6, 0, 1)[:, None] ** 0.5
g = 10 ** (-1.5 / 20) / np.abs(mix).max()
os.makedirs(f'{D}/reg/out', exist_ok=True)
with wave.open(f'{D}/reg/out/accord.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix * g, -1, 1) * 32767).astype('<i2').tobytes())
print('ok accord', DUR)
