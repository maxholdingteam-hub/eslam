# Toyota Raize v2 mix (raize26/film.json from mkrz2.py), music only: OpenTracks ot_13971 "Burning Sands" cut on downbeats,
# frame-accurate SFX from lib/sfx
import sys, os, json, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, f'{D}/lib/sfx'); import sfxlib
SR = 48000; DUR = 47.6; N = int((DUR + 4) * SR)
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

# ---- music: ot_13971 "Burning Sands" runs straight 100.83 -> ad 0 (hit 109.227 = 8.40, drop 124.62 = 23.79) .. 142.26 = ad 41.43 |
#      C 160.82 -> ad 41.43 (final hit 163.631 = 44.24, rings out)
M = rd(f'{D}/lib/music/ot_13971.wav')
def mseg(ad0, tr0, tr1, fin, fout, pre=0.02):
    a = int((tr0 - pre) * SR); b = int(tr1 * SR); put(mus, ad0 - pre, M[a:b], 0, fin, fout)
mseg(0.0, 100.83, 142.26 + 0.02, 0.5, 0.05, pre=0.0)
mseg(41.43, 160.82, 166.9, 0.05, 0.3)
tt = np.arange(N) / SR; mus *= np.clip((DUR - 0.1 - tt) / 1.5, 0, 1)[:, None]
mus *= np.float32(10 ** (-4.0 / 20))

P = lambda t, e, **k: sfxlib.place(fx, t, e, **k)
H = lambda t, e, **k: sfxlib.place(hit, t, e, **k)
R, DROP, ENG, END, LOGO = 8.40, 23.79, 38.21, 43.24, 44.24
# dawn in the rose farms: mountain air, a whoosh into the Al Hada aerial
bed(amb, 0.0, 8.3, sfxlib.get('desert_wind', 0)[0], 0.0, -27, 1.5, 0.4)
P(4.10, ('wind_whoosh', 2), align='peak', gain_db=-18)
P(R - 0.02, ('riser_2s', 0), align='peak', gain_db=-15); P(R - 0.03, ('reverse_swell', 1), align='peak', gain_db=-16)
H(R, ('hit_heavy', 0), align='peak', gain_db=-7); H(R, ('sub_boom', 0), align='peak', gain_db=-9)
P(R + 0.4, ('car_passby', 0), align='peak', gain_db=-13); P(R + 0.3, ('logo_sting', 1), align='peak', gain_db=-21)
cuts = [12.0, 14.4, 16.8, 19.4, 21.6]
kinds = [('whoosh_short', 1), ('whoosh_medium', 0), ('whip_pan', 1), ('whoosh_short', 2), ('whip_pan', 3)]
for i, (c, k) in enumerate(zip(cuts, kinds)): P(c, k, align='peak', gain_db=-17 if i % 2 else -15, vary=0.5, seed=90 + i)
P(12.4, ('light_switch', 0), align='peak', gain_db=-15); P(15.0, ('ui_click', 1), align='peak', gain_db=-18)
P(17.3, ('car_passby', 1), align='peak', gain_db=-16); P(22.0, ('car_passby', 0), align='peak', gain_db=-13)
for i, t in enumerate([21.95, 22.2, 22.45]): P(t, ('ui_pop', 0), align='peak', gain_db=-20, vary=0.6, seed=i)
P(DROP - 0.02, ('riser_2s', 1), align='peak', gain_db=-14)
H(DROP, ('hit_heavy', 3), align='peak', gain_db=-6); H(DROP, ('sub_boom', 0), align='peak', gain_db=-7); H(DROP, ('braam', 1), align='onset', gain_db=-16, max_len=2.2, fade_out=1.0)
P(DROP + 0.1, ('turbo_whoosh', 0), align='onset', gain_db=-12, max_len=1.6, fade_out=0.6)
c0, c1, last = DROP + 0.2, DROP + 0.2 + 1.3, -1
for f in range(int((c1 - c0) * 600) + 1):
    t = c0 + f / 600; vv = round(97 * (1 - (1 - (t - c0) / (c1 - c0)) ** 3)) // 4
    if vv != last: P(t, ('ui_tick_counter', 0), align='peak', gain_db=-23, vary=0.4, seed=f); last = vv
P(c1 - 0.05, ('engine_rev', 0), align='peak', gain_db=-12, max_len=1.8, fade_out=0.7); H(c1, ('hit_heavy', 0), align='peak', gain_db=-9)
for c in [26.60, 29.40, 32.20, 34.80]: P(c, ('whoosh_medium', 1), align='peak', gain_db=-17, vary=0.5, seed=int(c))
for i, t in enumerate([26.95, 27.25]): P(t, ('ui_pop', 0), align='peak', gain_db=-20, seed=20 + i)
P(29.9, ('car_passby', 1), align='peak', gain_db=-16)
bed(amb, 29.4, 38.2, sfxlib.get('desert_wind', 1)[0], 2.0, -25, 0.5, 0.5)
P(ENG, ('reverse_swell', 1), align='peak', gain_db=-17)
for i, t in enumerate([39.01, 39.26]): P(t, ('ui_pop', 2 if i == 0 else 0), align='peak', gain_db=-20, seed=30 + i, vary=0.4)
P(END, ('swoosh_long', 0), align='peak', gain_db=-17)
P(LOGO, ('logo_impact', 0), align='peak', gain_db=-15); H(LOGO, ('sub_boom', 0), align='peak', gain_db=-7); H(LOGO, ('hit_heavy', 1), align='peak', gain_db=-11)
P(LOGO + 0.3, ('logo_sting', 2), align='peak', gain_db=-19)

mix = mus + amb + fx + hit
mix = mix[:int(DUR * SR)] * np.clip((DUR - np.arange(int(DUR * SR)) / SR) / 0.5, 0, 1)[:, None] ** 0.5
g = 10 ** (-1.5 / 20) / np.abs(mix).max()
os.makedirs(f'{D}/reg/out', exist_ok=True)
with wave.open(f'{D}/reg/out/raize2.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix * g, -1, 1) * 32767).astype('<i2').tobytes())
print('ok raize2', DUR)
