# Toyota Highlander 2026 mix (highlander26/film.json): client music pick #1 Mixkit 587 "Discover" cut on downbeats, text only (no VO),
# frame-accurate SFX from lib/sfx
import sys, os, json, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, f'{D}/lib/sfx'); import sfxlib
SR = 48000; DUR = 59.5; N = int((DUR + 4) * SR)


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

# ---- music (client pick #1): Mixkit 587 "Discover": A 0.90 -> ad 0 (swell 12.945 = 12.05) .. 19.226 |
#      B 27.26 -> ad 18.33 (hit 31.544 = 22.61, full orchestra 37.907 = 28.98) .. 60.941 | C 131.158 -> ad 52.01 (outro)
M = rd(f'{D}/lib/music/587.wav')
def mseg(ad0, tr0, tr1, fin, fout, pre=0.02):
    a = int((tr0 - pre) * SR); b = int(tr1 * SR); put(mus, ad0 - pre, M[a:b], 0, fin, fout)
mseg(0.0, 0.90, 19.226 + 0.02, 0.3, 0.06, pre=0.0)
mseg(18.33, 27.26, 60.941 + 0.02, 0.06, 0.06)
mseg(52.01, 131.158, 142.0, 0.06, 0.3)
tt = np.arange(N) / SR; mus *= np.clip((DUR - 0.1 - tt) / 2.5, 0, 1)[:, None]
mus *= np.float32(10 ** (-1.0 / 20))

P = lambda t, e, **k: sfxlib.place(fx, t, e, **k)
H = lambda t, e, **k: sfxlib.place(hit, t, e, **k)
R, HIT, DROP, ENG, END, LOGO = 12.05, 22.61, 28.98, 52.01, 54.82, 55.3
# morning: soft air, gentle whooshes on the cuts, the hybrid badge glints
bed(amb, 0.0, 9.9, sfxlib.get('desert_wind', 0)[0], 0.0, -27, 1.5, 0.5)
for i, c in enumerate([3.00, 5.40]): P(c, ('whoosh_short', i), align='peak', gain_db=-22)
P(7.23, ('whoosh_medium', 1), align='peak', gain_db=-19); P(7.6, ('sparkle', 1), align='peak', gain_db=-22)
P(8.60, ('whip_pan', 0), align='peak', gain_db=-20); P(8.95, ('light_switch', 0), align='peak', gain_db=-16)
P(9.93, ('whoosh_short', 2), align='peak', gain_db=-19); P(10.6, ('car_passby', 0), align='peak', gain_db=-17)
P(R - 0.02, ('riser_2s', 0), align='peak', gain_db=-16); P(R - 0.03, ('reverse_swell', 1), align='peak', gain_db=-17)
# reveal on the swell
H(R, ('hit_soft', 0), align='peak', gain_db=-9); H(R, ('sub_boom', 0), align='peak', gain_db=-10)
P(R + 0.5, ('car_passby', 0), align='peak', gain_db=-13); P(R + 0.3, ('logo_sting', 1), align='peak', gain_db=-21)
P(14.90, ('whoosh_medium', 0), align='peak', gain_db=-17); P(15.6, ('car_passby', 1), align='peak', gain_db=-14)
P(16.60, ('whoosh_short', 1), align='peak', gain_db=-17); P(17.2, ('car_passby', 0), align='peak', gain_db=-15, vary=0.5, seed=3)
# the road to AlUla
P(18.33, ('wind_whoosh', 3), align='peak', gain_db=-17); bed(amb, 18.33, 22.6, sfxlib.get('sand_gust', 0)[0], 0.0, -20, 0.3, 0.5)
P(20.40, ('whoosh_medium', 1), align='peak', gain_db=-17); P(21.3, ('car_passby', 0), align='peak', gain_db=-12)
P(HIT - 0.02, ('reverse_swell', 0), align='peak', gain_db=-16)
H(HIT, ('hit_heavy', 0), align='peak', gain_db=-9); H(HIT, ('sub_boom', 1), align='peak', gain_db=-10)
for i, t in enumerate([22.86, 23.11, 23.36]): P(t, ('ui_pop', 0), align='peak', gain_db=-20, vary=0.6, seed=i)
P(25.40, ('wind_whoosh', 1), align='peak', gain_db=-18); bed(amb, 25.4, 29.0, sfxlib.get('desert_wind', 2)[0], 1.0, -21, 0.4, 0.4)
P(DROP - 0.02, ('riser_2s', 1), align='peak', gain_db=-15)
# full orchestra: impact, the counter runs with the engine, dust and gravel
H(DROP, ('hit_heavy', 3), align='peak', gain_db=-6); H(DROP, ('sub_boom', 0), align='peak', gain_db=-7); H(DROP, ('braam', 1), align='onset', gain_db=-17, max_len=2.5, fade_out=1.0)
P(DROP + 0.1, ('gravel_spray', 0), align='onset', gain_db=-12); P(DROP + 0.3, ('tyre_gravel', 0), align='onset', gain_db=-14, max_len=2.5, fade_out=0.8)
c0, c1, last = DROP + 0.25, DROP + 0.25 + 1.9, -1
for f in range(int((c1 - c0) * 600) + 1):
    t = c0 + f / 600; vv = round(240 * (1 - (1 - (t - c0) / (c1 - c0)) ** 3)) // 10
    if vv != last: P(t, ('ui_tick_counter', 0), align='peak', gain_db=-23, vary=0.4, seed=f); last = vv
P(c1 - 0.05, ('engine_rev', 0), align='peak', gain_db=-11, max_len=2.0, fade_out=0.7); H(c1, ('hit_heavy', 0), align='peak', gain_db=-8)
P(31.80, ('whip_pan', 1), align='peak', gain_db=-17); P(32.0, ('gravel_spray', 1), align='onset', gain_db=-14)
P(33.20, ('whoosh_short', 0), align='peak', gain_db=-17); P(33.4, ('tyre_gravel', 1), align='onset', gain_db=-15, max_len=1.6, fade_out=0.6)
P(35.00, ('wind_whoosh', 2), align='peak', gain_db=-17); bed(amb, 35.0, 36.4, sfxlib.get('sand_gust', 1)[0], 0.0, -18, 0.2, 0.3)
for c in [36.40, 38.60]: P(c, ('whoosh_medium', 1), align='peak', gain_db=-17, vary=0.5, seed=int(c)); P(c + 0.9, ('car_passby', 0), align='peak', gain_db=-13, vary=0.6, seed=int(c * 3))
for i, t in enumerate([38.9, 39.2]): P(t, ('ui_pop', 0), align='peak', gain_db=-20, seed=20 + i)
P(40.60, ('wind_whoosh', 0), align='peak', gain_db=-17); bed(amb, 40.6, 44.6, sfxlib.get('sand_gust', 1)[0], 0.0, -19, 0.3, 0.4); P(41.2, ('tyre_gravel', 0), align='onset', gain_db=-17, max_len=2.5, fade_out=1.0)
# the camp, the last vista
P(44.60, ('wind_whoosh', 3), align='peak', gain_db=-18); bed(amb, 44.6, 47.0, sfxlib.get('desert_wind', 0)[0], 4.0, -24, 0.4, 0.4); bed(amb, 44.6, 47.0, peaknorm(EX('1330'), -3), 1.0, -12, 0.3, 0.4)
P(47.00, ('whoosh_medium', 0), align='peak', gain_db=-17); P(47.6, ('car_passby', 1), align='peak', gain_db=-13)
P(49.30, ('whoosh_short', 2), align='peak', gain_db=-17); P(49.6, ('sparkle', 2), align='peak', gain_db=-22)
P(ENG, ('whoosh_medium', 0), align='peak', gain_db=-15)
for i, t in enumerate([52.81, 53.06, 53.31]): P(t, ('ui_pop', 2 if i == 0 else 0), align='peak', gain_db=-19 if i == 0 else -21, seed=30 + i, vary=0.4)
P(END, ('swoosh_long', 0), align='peak', gain_db=-17)
P(LOGO, ('logo_impact', 0), align='peak', gain_db=-15); H(LOGO, ('sub_boom', 0), align='peak', gain_db=-7); H(LOGO, ('hit_heavy', 1), align='peak', gain_db=-11)
P(LOGO + 0.3, ('logo_sting', 2), align='peak', gain_db=-18)
for i, t in enumerate([55.2, 55.4, 55.6, 56.0]): P(t, ('ui_click', 1), align='peak', gain_db=-26, vary=0.5, seed=40 + i)

# ---- ducking under the voice
v = np.abs(vo).max(1); vs = np.convolve(v, np.ones(240) / 240, 'same'); e = np.zeros_like(vs); acc = 0.0
a_, r_ = 1 - np.exp(-1 / (0.03 * SR)), 1 - np.exp(-1 / (0.35 * SR))
for i in range(0, len(vs), 48):
    x = vs[i]; acc += (x - acc) * (1 - (1 - (a_ if x > acc else r_)) ** 48); e[i:i + 48] = acc
d = np.clip(e / 0.02, 0, 1)
dm, da, df, dh = (10 ** (-k * d / 20) for k in (10, 8, 6, 4))
mix = mus * dm[:, None] + amb * da[:, None] + fx * df[:, None] + hit * dh[:, None] + vo
mix = mix[:int(DUR * SR)] * np.clip((DUR - np.arange(int(DUR * SR)) / SR) / 0.5, 0, 1)[:, None] ** 0.5
os.makedirs(f'{D}/reg/out', exist_ok=True)
with wave.open(f'{D}/reg/out/highlander.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix * 0.6, -1, 1) * 32767).astype('<i2').tobytes())
if os.environ.get('STEMS'):
    np.save(f'{D}/scratchpad/hx2_vo.npy', vo[:int(DUR * SR)].mean(1)); np.save(f'{D}/scratchpad/hx2_bg.npy', (mix[:, :] - vo[:int(DUR * SR)]).mean(1))
print('ok highlander', DUR, 'peak', round(20 * np.log10(np.abs(mix * 0.6).max()), 2))
