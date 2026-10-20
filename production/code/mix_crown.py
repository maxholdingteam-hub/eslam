# Hilux 2027 v2 mix (all real footage edit, film2.json): client music pick ot_20880 cut on downbeats, placeholder VO
# (scratchpad/vo3, replaced by the client's recorded VO later), frame-accurate SFX from lib/sfx (+ extra: falcon, splash, campfire, pour, crickets)
import sys, os, json, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, f'{D}/lib/sfx'); import sfxlib
SR = 48000; DUR = 61.5; N = int((DUR + 4) * SR)
VO_DIR = os.environ.get('VO_DIR', f'{D}/scratchpad/vo3')


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

# ---- music (client pick #2): Mixkit 846 "I Won't Surrender": A 21.04 -> ad 0 (silence 30.0 = 8.96, hit 33.866 = 12.83) .. 49.70 |
#      B 63.16 -> ad 28.66 (drop 67.76 = 33.26) .. 85.23 | C 107.29 -> ad 50.73 (final hit 111.70 = 55.14, rings out)
DUR = 58.6
M = rd(f'{D}/lib/music/846.wav')
def mseg(ad0, tr0, tr1, fin, fout, pre=0.02):
    a = int((tr0 - pre) * SR); b = int(tr1 * SR); put(mus, ad0 - pre, M[a:b], 0, fin, fout)
mseg(0.0, 21.04, 49.70 + 0.02, 0.6, 0.04, pre=0.0)
mseg(28.66, 63.16, 85.23 + 0.02, 0.04, 0.04)
mseg(50.73, 107.29, 114.2, 0.04, 0.3)
tt = np.arange(N) / SR; mus *= np.clip((DUR - 0.1 - tt) / 2.0, 0, 1)[:, None]
mus *= np.float32(10 ** (-1.5 / 20))
VO_AT = {}

P = lambda t, e, **k: sfxlib.place(fx, t, e, **k)
H = lambda t, e, **k: sfxlib.place(hit, t, e, **k)
R, DROP, ENG, LOGO = 12.83, 33.26, 50.73, 55.14
# Riyadh: low city air, a whoosh per cut, the night traffic hiss
bed(amb, 0.0, 8.9, sfxlib.get('drone_tension', 1)[0], 0.0, -17, 1.0, 0.4)
bed(amb, 7.18, 8.96, sfxlib.get('car_passby', 1)[0], 6.0, -15, 0.3, 0.2)
P(3.80, ('whoosh_medium', 1), align='peak', gain_db=-18); P(7.18, ('whoosh_short', 0), align='peak', gain_db=-18)
# the music drops to silence: the light bar wakes up
H(8.96, ('thump_low', 0), align='peak', gain_db=-12); P(9.05, ('electric_hum', 3), align='onset', gain_db=-16); P(10.0, ('light_switch', 0), align='peak', gain_db=-8)
P(10.02, ('light_switch', 3), align='peak', gain_db=-12); P(11.4, ('sparkle', 1), align='peak', gain_db=-22)
P(R - 0.02, ('riser_2s', 0), align='peak', gain_db=-13); P(R - 0.03, ('reverse_swell', 1), align='peak', gain_db=-15)
# reveal on the big hit
H(R, ('hit_heavy', 0), align='peak', gain_db=-5); H(R, ('sub_boom', 0), align='peak', gain_db=-7); H(R, ('braam', 3), align='peak', gain_db=-13, max_len=2.5, fade_out=1.0)
P(R + 0.4, ('car_passby', 0), align='peak', gain_db=-12); P(13.4, ('logo_sting', 1), align='peak', gain_db=-19)
cuts = [15.12, 17.41, 18.55, 19.54, 21.84, 24.12, 26.42, 28.66, 30.96]
kinds = [('whoosh_medium', 0), ('whip_pan', 0), ('hit_metal', 0), ('whoosh_short', 2), ('whoosh_medium', 1), ('whip_pan', 3), ('whoosh_short', 1), ('whoosh_medium', 0), ('reverse_swell', 1)]
for i, (c, k) in enumerate(zip(cuts, kinds)):
    if k[0] == 'hit_metal': H(c, k, align='peak', gain_db=-17, max_len=1.0, fade_out=0.5)
    else: P(c, k, align='peak', gain_db=-17 if i % 2 else -15, vary=0.5, seed=60 + i)
for t in [16.0, 20.4, 22.8, 25.0, 27.4, 29.6]: P(t, ('car_passby', 0), align='peak', gain_db=-14, vary=0.6, seed=int(t * 10))
bed(amb, 12.83, 33.2, sfxlib.get('offroad_rumble', 1)[0], 2.0, -24, 0.5, 0.3)
for i, t in enumerate([19.84, 20.09, 20.34, 24.42, 24.72]): P(t, ('ui_pop', 0), align='peak', gain_db=-20, vary=0.6, seed=i)
# drop: impact, 344 counts with the engine, lands hard
H(DROP, ('hit_heavy', 3), align='peak', gain_db=-6); H(DROP, ('sub_boom', 0), align='peak', gain_db=-7); H(DROP, ('braam', 1), align='onset', gain_db=-15, max_len=2.5, fade_out=1.0)
P(DROP + 0.7, ('swoosh_long', 0), align='peak', gain_db=-15)
c0, c1, last = DROP + 0.25, DROP + 0.25 + 1.9, -1
for f in range(int((c1 - c0) * 600) + 1):
    t = c0 + f / 600; vv = round(344 * (1 - (1 - (t - c0) / (c1 - c0)) ** 3)) // 12
    if vv != last: P(t, ('ui_tick_counter', 0), align='peak', gain_db=-23, vary=0.4, seed=f); last = vv
P(c1 - 0.05, ('engine_rev', 0), align='peak', gain_db=-9, max_len=2.2, fade_out=0.7); H(c1, ('hit_heavy', 0), align='peak', gain_db=-7); H(c1, ('sub_boom', 1), align='peak', gain_db=-8)
for c in [35.54, 37.78, 39.95, 42.25]: P(c, ('whoosh_medium', 1), align='peak', gain_db=-17, vary=0.5, seed=int(c)); P(c + 1.0, ('car_passby', 0), align='peak', gain_db=-13, vary=0.6, seed=int(c * 3))
for i, t in enumerate([38.08, 38.38]): P(t, ('ui_pop', 0), align='peak', gain_db=-20, seed=20 + i)
bed(amb, DROP, 44.4, sfxlib.get('desert_wind', 2)[0], 3.0, -24, 0.5, 0.4)
# Riyadh again, the bukhoor (coals crackle, a breath of smoke), the last pass
P(44.38, ('whoosh_medium', 0), align='peak', gain_db=-16); P(44.6, ('sparkle', 2), align='peak', gain_db=-22)
P(46.40, ('wind_whoosh', 3), align='peak', gain_db=-18); bed(amb, 46.4, 48.5, peaknorm(EX('1330'), -3), 2.0, -7, 0.2, 0.3)
P(48.43, ('whoosh_short', 0), align='peak', gain_db=-16); P(49.5, ('car_passby', 0), align='peak', gain_db=-11)
P(ENG, ('whoosh_medium', 0), align='peak', gain_db=-15)
for i, t in enumerate([51.53, 51.78, 52.03]): P(t, ('ui_pop', 2 if i == 0 else 0), align='peak', gain_db=-19 if i == 0 else -21, seed=30 + i, vary=0.4)
P(LOGO, ('logo_impact', 0), align='peak', gain_db=-16); H(LOGO, ('sub_boom', 0), align='peak', gain_db=-6); H(LOGO, ('hit_heavy', 1), align='peak', gain_db=-10)
P(55.45, ('logo_sting', 2), align='peak', gain_db=-18)
for i, t in enumerate([55.04, 55.24, 55.44, 55.84]): P(t, ('ui_click', 1), align='peak', gain_db=-26, vary=0.5, seed=40 + i)

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
with wave.open(f'{D}/reg/out/crown.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix * 0.6, -1, 1) * 32767).astype('<i2').tobytes())
if os.environ.get('STEMS'):
    np.save(f'{D}/scratchpad/hx2_vo.npy', vo[:int(DUR * SR)].mean(1)); np.save(f'{D}/scratchpad/hx2_bg.npy', (mix[:, :] - vo[:int(DUR * SR)]).mean(1))
print('ok crown', DUR, 'peak', round(20 * np.log10(np.abs(mix * 0.6).max()), 2))
