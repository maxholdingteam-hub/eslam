# Max Motors offers film (promo/video.html), music only: OpenTracks ot_9922 "Battle - desert" (client pick no. 1),
# frame-accurate SFX from lib/sfx
import sys, os, json, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, f'{D}/lib/sfx'); import sfxlib
SR = 48000; DUR = 34.0; N = int((DUR + 4) * SR)
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


EX = lambda n: rd(f'{D}/lib/sfx/extra/{n}_48.wav')
mus = np.zeros((N, 2), np.float32); vo = np.zeros_like(mus); amb = np.zeros_like(mus); fx = np.zeros_like(mus); hit = np.zeros_like(mus)

# ---- music: ot_9922 from 0.40 so its drop (10.40) lands on the ZERO slam at ad 10.0; fades under the end card
M = rd(f'{D}/lib/music/ot_9922.wav')
a = int(0.40 * SR); put(mus, 0.0, M[a:a + int(33.2 * SR)], 0, 0.3, 1.6)
mus *= np.float32(10 ** (-4.0 / 20))

P = lambda t, e, **k: sfxlib.place(fx, t, e, **k)
H = lambda t, e, **k: sfxlib.place(hit, t, e, **k)
CUTS = [3.2, 10.0, 15.5, 20.5, 25.5, 30.0]
# opening: logo glint
P(1.0, ('reverse_swell', 1), align='peak', gain_db=-18); H(1.3, ('hit_heavy', 0), align='peak', gain_db=-12); P(1.95, ('sparkle', 1), align='peak', gain_db=-20)
for i, c in enumerate(CUTS): P(c, (('whoosh_medium', 0), ('whip_pan', 1), ('wind_whoosh', 2), ('whoosh_short', 1), ('whip_pan', 3), ('whoosh_medium', 1))[i], align='peak', gain_db=-15, vary=0.4, seed=40 + i)
# zero admin fees: the zero grows, three cars arrive
H(3.4, ('sub_boom', 0), align='peak', gain_db=-10)
for i, t in enumerate([4.4, 4.9, 5.4]): P(t, ('car_passby', i % 2), align='peak', gain_db=-16, vary=0.5, seed=60 + i)
P(6.0, ('ui_pop', 0), align='peak', gain_db=-19)
# drop: ZERO letters slam, gold Prado enters
P(9.98, ('riser_2s', 1), align='peak', gain_db=-14)
H(10.0, ('hit_heavy', 3), align='peak', gain_db=-7); H(10.0, ('sub_boom', 0), align='peak', gain_db=-8)
for i in range(4): H(10.17 + i * 0.12, ('hit_heavy', i % 2), align='peak', gain_db=-15, vary=0.4, seed=70 + i)
P(11.2, ('car_passby', 0), align='peak', gain_db=-12)
# lowest margin: band drop, Camry crosses, figures
P(15.7, ('swoosh_long', 0), align='peak', gain_db=-18); P(16.9, ('car_passby', 1), align='peak', gain_db=-12)
for i, t in enumerate([17.5, 17.62, 17.74]): P(t, ('ui_pop', 0), align='peak', gain_db=-19, seed=80 + i)
# protection: the shield draws (shimmer), the Prado rises, two paint sheens (sparkle), three tiles pop
P(20.95, ('reverse_swell', 1), align='peak', gain_db=-19); P(21.5, ('whoosh_short', 2), align='peak', gain_db=-18)
P(22.15, ('sparkle', 1), align='peak', gain_db=-17); P(23.75, ('sparkle', 0), align='peak', gain_db=-18)
for i, t in enumerate([22.75, 22.97, 23.19]): P(t, ('ui_pop', 0), align='peak', gain_db=-19, seed=90 + i)
# services: diagonal, Land Cruiser, list
P(26.6, ('car_passby', 0), align='peak', gain_db=-12)
for i in range(4): P(27.2 + i * 0.3, ('ui_pop', 2 if i == 0 else 0), align='peak', gain_db=-19, seed=100 + i)
# arches, then the end card: logo impact rings out
P(30.6, ('car_passby', 1), align='peak', gain_db=-15)
P(31.5, ('reverse_swell', 1), align='peak', gain_db=-16)
LOGO = 31.85
P(LOGO, ('logo_impact', 0), align='peak', gain_db=-13); H(LOGO, ('sub_boom', 0), align='peak', gain_db=-7); H(LOGO, ('hit_heavy', 1), align='peak', gain_db=-10)
P(LOGO + 0.45, ('logo_sting', 2), align='peak', gain_db=-18)

mix = mus + amb + fx + hit
mix = mix[:int(DUR * SR)] * np.clip((DUR - np.arange(int(DUR * SR)) / SR) / 0.6, 0, 1)[:, None] ** 0.5
g = 10 ** (-1.5 / 20) / np.abs(mix).max()
os.makedirs(f'{D}/reg/out', exist_ok=True)
with wave.open(f'{D}/reg/out/promo.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix * g, -1, 1) * 32767).astype('<i2').tobytes())
print('ok promo', DUR)
