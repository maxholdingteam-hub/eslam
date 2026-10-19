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

# ---- music: A 25.23 -> ad 0 (hits 35.10 reveal, 55.87 drop) .. 63.53 | B 89.05 -> ad 38.30 (big hit 96.37 = hero 45.62) .. 101.82 | C 137.57 -> ad 51.07 (stops 143.44 = logo 56.94)
M = rd(f'{D}/lib/music/ot_20880.wav')
def mseg(ad0, tr0, tr1, fin, fout, pre=0.02):
    a = int((tr0 - pre) * SR); b = int(tr1 * SR); put(mus, ad0 - pre, M[a:b], 0, fin, fout)
mseg(0.0, 25.23, 63.53 + 0.35, 0.25, 0.4, pre=0.0)      # A: lets the last downbeat ring into the dip
mseg(38.30, 89.05, 101.82 + 0.02, 0.06, 0.04)            # B
mseg(51.07, 137.57, 150.0, 0.04, 0.0)                     # C: natural soft stop + tail
tt = np.arange(N) / SR; mus *= np.clip((DUR - 0.1 - tt) / 3.0, 0, 1)[:, None]
mus *= np.float32(10 ** (-9.0 / 20))                      # loud master (-8.9 LUFS) -> sits under VO/SFX

# ---- VO (placeholder TTS or the client's recording: same file names v1..v8)
VO_AT = {'1': 0.7, '2': 5.5, '3': 12.2, '4a': 20.85, '4b': 33.5, '5': 36.45, '6': 40.7, '7': 51.9, '8': 57.5}   # 4a with the engine chips, 4b right after 235 lands
hp = butter(2, 85, 'high', fs=SR, output='sos'); pres = butter(2, [2500, 6000], 'band', fs=SR, output='sos')
for k, t in VO_AT.items():
    p = f'{VO_DIR}/v{k}.wav'
    if not os.path.exists(p): continue
    x = rd(p).mean(1); x = sosfilt(hp, x); x = x + 0.25 * sosfilt(pres, x)
    e = np.sqrt(np.convolve(x ** 2, np.ones(480) / 480, 'same')) + 1e-6
    gr = np.minimum(0, (-26 - 20 * np.log10(e)) * (1 - 1 / 3)); gr = np.convolve(gr, np.ones(2400) / 2400, 'same'); x = x * 10 ** (gr / 20)
    sp = np.abs(x) > 0.01; x = x * (10 ** (-15.5 / 20) / np.sqrt((x[sp] ** 2).mean()))
    put(vo, t, verb(np.repeat(x[:, None], 2, 1).astype(np.float32), 0.5, 0.07, seed=len(k) * 7 + ord(k[0])))

P = lambda t, e, **k: sfxlib.place(fx, t, e, **k)
H = lambda t, e, **k: sfxlib.place(hit, t, e, **k)
R, DROP, NIGHT, HERO, ENG, LOGO = 9.87, 30.64, 38.30, 45.62, 51.07, 56.94

# act 1: the falcon cries on frame 1, desert air, wings, the truck's engine grows out of the dust
put(fx, 0.08, verb(EX('fs575525'), 2.2, 0.35), -6)
bed(amb, 0.0, R + 0.4, sfxlib.get('desert_wind', 0)[0], 1.0, -12, 0.3, 0.6)
P(2.54, ('wind_whoosh', 3), align='peak', gain_db=-18); P(2.9, ('sand_gust', 0), align='peak', gain_db=-19, pan=0.3)
P(5.09, ('whoosh_short', 1), align='peak', gain_db=-21); P(5.6, ('sand_gust', 1), align='peak', gain_db=-22, pan=-0.3)
P(7.65, ('whoosh_short', 0), align='peak', gain_db=-20); put(fx, 7.75, EX('2702')[int(0.05 * SR):], -10, 0.02, 0.8, pan=0.2)
put(fx, 8.2, verb(EX('fs575524')[int(6.1 * SR):int(7.6 * SR)], 2.0, 0.4), -12, 0.02, 0.4, pan=-0.2)   # second, distant screech
P(8.93, ('whoosh_medium', 1), align='peak', gain_db=-17); bed(amb, 8.93, R, sfxlib.get('offroad_rumble', 1)[0], 2.0, -16, 0.3, 0.05)
P(R - 0.02, ('riser_2s', 0), align='peak', gain_db=-12); P(R - 0.03, ('reverse_swell', 1), align='peak', gain_db=-14)
# reveal on the music's big hit: impact + sub + braam, the truck tears past through the dust, the hero front roars
H(R, ('hit_heavy', 0), align='peak', gain_db=-5); H(R, ('sub_boom', 0), align='peak', gain_db=-7); H(R, ('braam', 0), align='peak', gain_db=-13, max_len=2.0, fade_out=0.9)
P(12.55, ('car_passby', 0), align='peak', gain_db=-9); P(12.6, ('gravel_spray', 1), align='onset', gain_db=-17); P(12.7, ('sand_gust', 0), align='peak', gain_db=-16)
P(10.9, ('logo_sting', 1), align='peak', gain_db=-19)
P(12.76, ('whoosh_short', 2), align='peak', gain_db=-17); P(13.3, ('engine_rev', 0), align='peak', gain_db=-11, max_len=2.4, fade_out=0.8)
bed(amb, 12.76, 15.31, sfxlib.get('offroad_rumble', 1)[0], 4.0, -17, 0.2, 0.2)
# montage: a whoosh / whip on every cut, terrain under each shot
cuts = [15.31, 15.95, 16.59, 17.86, 20.42, 22.96, 24.24, 25.53, 26.80, 28.07, 29.36]
kinds = [('whip_pan', 0), ('whoosh_short', 0), ('whoosh_short', 1), ('whoosh_medium', 0), ('whip_pan', 2), ('whoosh_short', 2), ('whoosh_short', 3),
         ('whip_pan', 0), ('whoosh_medium', 1), ('whoosh_short', 0), ('whip_pan', 3)]
for i, (c, k) in enumerate(zip(cuts, kinds)): P(c, k, align='peak', gain_db=-18 if i % 2 else -16, vary=0.5, seed=40 + i)
P(15.4, ('light_switch', 3), align='peak', gain_db=-17)                                  # LED headlamp
H(16.62, ('hit_metal', 0), align='peak', gain_db=-16, max_len=1.0, fade_out=0.5)          # TOYOTA grille
P(18.9, ('car_passby', 0), align='peak', gain_db=-11); P(19.0, ('gravel_spray', 0), align='onset', gain_db=-16)
P(20.5, ('engine_rev', 1), align='onset', gain_db=-14, max_len=2.4, fade_out=0.6); P(21.2, ('gravel_spray', 1), align='onset', gain_db=-18)
for i, t in enumerate([20.7, 20.95, 21.2]): P(t, ('ui_pop', 0), align='peak', gain_db=-20, vary=0.6, seed=i)
put(fx, 23.25, EX('1198'), -9); put(fx, 24.45, EX('1311'), -8); put(fx, 25.85, EX('1311'), -9, pan=0.2); put(fx, 27.3, EX('1198'), -12, pan=-0.2)
bed(amb, 26.80, 28.07, EX('1736'), 6.0, -14, 0.2, 0.2)
P(28.4, ('gravel_spray', 1), align='onset', gain_db=-16); P(29.5, ('engine_rev', 0), align='peak', gain_db=-14, max_len=1.4, fade_out=0.5)
# the drop: impact, the truck blasts past, 235 counts up with the engine, lands with an impact and the stallion
H(DROP, ('hit_heavy', 3), align='peak', gain_db=-6); H(DROP, ('sub_boom', 0), align='peak', gain_db=-7); H(DROP, ('braam', 3), align='peak', gain_db=-12, max_len=2.5, fade_out=1.0)
P(31.3, ('car_passby', 0), align='peak', gain_db=-9); P(31.35, ('sand_gust', 0), align='peak', gain_db=-15)
c0, c1, last = DROP + 0.3, DROP + 0.3 + 2.24, -1
for f in range(int((c1 - c0) * 600) + 1):
    t = c0 + f / 600; v = round(235 * (1 - (1 - (t - c0) / (c1 - c0)) ** 3)) // 10
    if v != last: P(t, ('ui_tick_counter', 0), align='peak', gain_db=-23, vary=0.4, seed=f); last = v
P(c1 - 0.05, ('engine_rev', 0), align='peak', gain_db=-9, max_len=2.2, fade_out=0.7)
H(c1, ('hit_heavy', 0), align='peak', gain_db=-7); H(c1, ('sub_boom', 1), align='peak', gain_db=-8)
put(fx, c1 - 0.42, verb(sfxlib.get('horse_neigh', 0)[0], 1.6, 0.25), -10)
P(c1 + 0.1, ('sparkle', 2), align='peak', gain_db=-24)
P(33.18, ('whoosh_medium', 0), align='peak', gain_db=-16); P(33.8, ('car_passby', 0), align='peak', gain_db=-13)
P(35.75, ('whip_pan', 0), align='peak', gain_db=-16); P(36.0, ('engine_rev', 1), align='onset', gain_db=-15, max_len=2.0, fade_out=0.6)
for i, t in enumerate([35.95, 36.25]): P(t + 0.1, ('ui_pop', 0), align='peak', gain_db=-20, vary=0.6, seed=10 + i)
P(37.03, ('whoosh_short', 1), align='peak', gain_db=-17); P(37.3, ('gravel_spray', 1), align='onset', gain_db=-18)
# night: dip, night wind + crickets, the camel's steps, coffee poured exactly on the pour, the fire's crackle and a whoosh of flame
P(NIGHT - 0.02, ('reverse_swell', 1), align='peak', gain_db=-16)
bed(amb, NIGHT, HERO, EX('1736'), 4.0, -8, 0.6, 0.3); bed(amb, NIGHT + 0.3, HERO, EX('1789'), 1.0, 2, 0.8, 0.05)
put(fx, 40.85, EX('2826')[int(0.3 * SR):], -1, 0.05, 0.5); put(fx, 42.2, EX('2826')[int(0.6 * SR):int(1.9 * SR)], -5, 0.05, 0.4)
put(fx, 43.39, EX('1346'), -14, 0.0, 0.6); bed(amb, 43.39, HERO + 0.2, peaknorm(EX('1330'), -3), 2.0, -4, 0.1, 0.2)
P(HERO - 0.02, ('riser_1s', 0), align='peak', gain_db=-14)
# hero on the second big hit: impact, lights, the flare sweep, the truck roars past on the road
H(HERO, ('hit_heavy', 3), align='peak', gain_db=-6); H(HERO, ('sub_boom', 0), align='peak', gain_db=-7); H(HERO, ('braam', 1), align='onset', gain_db=-15, max_len=2.5, fade_out=1.0)
H(HERO, ('light_switch', 0), align='peak', gain_db=-9); P(HERO + 0.7, ('swoosh_long', 0), align='peak', gain_db=-15)
P(HERO + 0.4, ('engine_rev', 0), align='onset', gain_db=-12, max_len=2.8, fade_out=0.8); bed(amb, HERO, 48.52, sfxlib.get('offroad_rumble', 1)[0], 6.0, -17, 0.2, 0.3)
P(46.25, ('sparkle', 1), align='peak', gain_db=-22); P(46.55, ('hit_soft', 3), align='peak', gain_db=-18)
P(48.52, ('wind_whoosh', 2), align='peak', gain_db=-17); bed(amb, 48.52, ENG + 0.5, sfxlib.get('desert_wind', 1)[0], 3.0, -15, 0.4, 0.6)
# engines line-up and the logo landing exactly where the music stops
P(ENG, ('whoosh_medium', 0), align='peak', gain_db=-15)
for i, t in enumerate([51.87, 52.12, 52.37]): P(t, ('ui_pop', 2 if i == 0 else 0), align='peak', gain_db=-19 if i == 0 else -21, seed=20 + i, vary=0.4)
bed(amb, ENG, DUR, sfxlib.get('desert_wind', 2)[0], 5.0, -22, 0.6, 2.0)
P(LOGO, ('logo_impact', 0), align='peak', gain_db=-18); H(LOGO, ('sub_boom', 0), align='peak', gain_db=-6); H(LOGO, ('hit_heavy', 1), align='peak', gain_db=-10)
P(57.2, ('logo_sting', 2), align='peak', gain_db=-18)
for i, t in enumerate([56.9, 57.1, 57.3, 57.5, 57.7]): P(t, ('ui_click', 1), align='peak', gain_db=-26, vary=0.5, seed=30 + i)

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
with wave.open(f'{D}/reg/out/hx2.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix * 0.6, -1, 1) * 32767).astype('<i2').tobytes())
if os.environ.get('STEMS'):
    np.save(f'{D}/scratchpad/hx2_vo.npy', vo[:int(DUR * SR)].mean(1)); np.save(f'{D}/scratchpad/hx2_bg.npy', (mix[:, :] - vo[:int(DUR * SR)]).mean(1))
print('ok hx2', DUR, 'peak', round(20 * np.log10(np.abs(mix * 0.6).max()), 2))
