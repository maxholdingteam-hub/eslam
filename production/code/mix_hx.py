# Hilux 2027 cinematic film mix: Mixkit 1150 cut on downbeats (A/B/C), scratch Saudi VO with music ducking,
# frame-accurate SFX from lib/sfx (+ lib/sfx/extra: campfire, falcon, pour, crickets - Mixkit free SFX licence)
import sys, os, json, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, f'{D}/lib/sfx'); import sfxlib
SR = 48000; DUR = 61.5; N = int((DUR + 4) * SR)
C = json.load(open(f'{D}/reg/web/cars/hilux27/film.json'))


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
    i = int(round(t * SR)); m = min(len(x), len(buf) - i); buf[i:i + m] += x[:m]


def bed(buf, t0, t1, x, off=0.0, g=0.0, fin=0.5, fout=0.5):
    s = int(off * SR); seg = x[s:s + int((t1 - t0) * SR)]
    put(buf, t0, seg, g, fin, fout)


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

# ---- music: A (track 4.438 -> ad 0, reveal hit 17.427 lands on 13.0), B (quiet build 58.897 -> ad 37.010, drop 67.628
# lands on 45.741), C (97.907 -> ad 49.839, final hit 103.909 lands on 55.841 with the logo); downbeat butt-cuts
M = rd(f'{D}/lib/music/1150.wav')
def mseg(ad0, tr0, tr1, fin, fout, pre=0.0):
    a = int((tr0 - pre) * SR); b = int(tr1 * SR); put(mus, ad0 - pre, M[a:b], 0, fin, fout)
mseg(0.0, 4.438, 41.448 + 0.9, 0.9, 0.85)                       # A rings its last downbeat into the dip
mseg(37.010, 58.897, 71.726 + 0.02, 0.03, 0.04, pre=0.0)        # B
mseg(49.839, 97.907, 97.907 + (DUR - 49.839) + 0.5, 0.04, 0.0, pre=0.02)  # C
tt = np.arange(N) / SR; mus *= np.clip((DUR - 0.15 - tt) / 2.2, 0, 1)[:, None]

# ---- VO: scratch TTS lines, HPF + gentle compression + level match, small room
VO_AT = {1: 0.9, 2: 4.9, 3: 14.2, 4: 21.9, 5: 40.4, 6: 50.2, 7: 56.35}   # 7 = second half of l6 (the CTA), after the logo hit
hp = butter(2, 85, 'high', fs=SR, output='sos'); pres = butter(2, [2500, 6000], 'band', fs=SR, output='sos')
for k, t in VO_AT.items():
    x = rd(f'{D}/scratchpad/vo/l{min(k, 6)}.wav').mean(1)
    if k >= 6: x = x[:int(5.3 * SR)] if k == 6 else x[int(5.6 * SR):]
    if k >= 6: x = x * np.minimum(1, np.minimum(np.arange(len(x)), len(x) - np.arange(len(x))) / 480)
    x = sosfilt(hp, x); x = x + 0.25 * sosfilt(pres, x)
    e = np.sqrt(np.convolve(x ** 2, np.ones(480) / 480, 'same')) + 1e-6           # 10 ms rms
    edb = 20 * np.log10(e); gr = np.minimum(0, (-26 - edb) * (1 - 1 / 3)); gr = np.convolve(gr, np.ones(2400) / 2400, 'same')
    x = x * 10 ** (gr / 20)
    sp = np.abs(x) > 0.01; rms = np.sqrt((x[sp] ** 2).mean()); x = x * (10 ** (-17.5 / 20) / rms)
    x = np.repeat(x[:, None], 2, 1).astype(np.float32)
    put(vo, t, verb(x, 0.5, 0.07, seed=k))

# ---- SFX (times are ad seconds; cuts sit on music downbeats)
P = lambda t, e, **k: sfxlib.place(fx, t, e, **k)
H = lambda t, e, **k: sfxlib.place(hit, t, e, **k)
# opening: desert air, a gust of sand, the falcon call right on the cut
bed(amb, 0.0, 13.7, sfxlib.get('desert_wind', 0)[0], 0.0, -11, 0.6, 1.0)
P(1.25, ('sand_gust', 0), align='peak', gain_db=-19, pan=0.3)
P(4.269, ('whoosh_medium', 0), align='peak', gain_db=-15); P(4.269, ('wind_whoosh', 3), align='peak', gain_db=-19)
put(fx, 4.40, verb(EX(1277), 1.8, 0.32), -11, pan=-0.15)                       # hawk call as the falcon appears
put(amb, 6.9, EX(2697)[:int(2.6 * SR)], -6, 0.3, 0.8, pan=0.2)                   # wing beats
P(8.635, ('whoosh_short', 0), align='peak', gain_db=-20)
P(10.818, ('whoosh_short', 1), align='peak', gain_db=-18); P(10.85, ('sand_gust', 1), align='peak', gain_db=-21)
bed(amb, 10.8, 13.05, sfxlib.get('drone_tension', 1)[0], 0.0, -16, 0.8, 0.05)
# reveal 13.0: riser + vacuum swell into the flash, heavy hit / sub / braam with the music's biggest hit, the engine wakes
P(12.98, ('riser_2s', 0), align='peak', gain_db=-12); P(12.97, ('reverse_swell', 1), align='peak', gain_db=-14)
H(13.0, ('hit_heavy', 0), align='peak', gain_db=-5); H(13.0, ('sub_boom', 0), align='peak', gain_db=-7); H(13.0, ('braam', 0), align='peak', gain_db=-13, max_len=2.2, fade_out=1.0)
P(13.15, ('engine_start', 1), align='onset', gain_db=-12, max_len=4.2, fade_out=1.0)
P(14.0, ('logo_sting', 1), align='peak', gain_db=-19)                            # light sweep across the HILUX wordmark
P(13.4, ('sparkle', 3), align='onset', gain_db=-27)
bed(amb, 13.0, 30.6, sfxlib.get('desert_wind', 2)[0], 2.0, -21, 1.2, 1.0)
# dunes rear 17.366: whoosh + sand spray, three chip pops
P(17.366, ('whoosh_medium', 1), align='peak', gain_db=-15); P(17.55, ('gravel_spray', 1), align='onset', gain_db=-21); P(17.5, ('sand_gust', 0), align='peak', gain_db=-20)
for i, t in enumerate([18.0, 18.25, 18.5]): P(t, ('ui_pop', 0), align='peak', gain_db=-21, vary=0.6, seed=i)
# headlamp 21.731: whoosh, the LED wakes up
P(21.731, ('whoosh_short', 2), align='peak', gain_db=-17); P(21.86, ('light_switch', 3), align='peak', gain_db=-15); P(21.95, ('electric_hum', 3), align='onset', gain_db=-23)
P(22.2, ('ui_pop', 0), align='peak', gain_db=-21, seed=5, vary=0.6)
# wheel 23.914: whip + metal hit
P(23.914, ('whip_pan', 0), align='peak', gain_db=-15); H(23.93, ('hit_metal', 0), align='peak', gain_db=-16, max_len=1.0, fade_out=0.6)
P(24.4, ('ui_pop', 0), align='peak', gain_db=-21, seed=6, vary=0.6)
# dark hero 26.096 + 235 hp counter (26.4 -> 27.5): ticks, the engine revs into the landing, impact + stallion neigh
H(26.096, ('thump_low', 0), align='peak', gain_db=-10); P(26.096, ('whoosh_short', 3), align='peak', gain_db=-22)
bed(amb, 26.1, 30.5, sfxlib.get('drone_tension', 2)[0], 0.0, -18, 0.3, 0.5)
c0, c1, last = 26.4, 27.5, -1
for f in range(int((c1 - c0) * 600) + 1):
    t = c0 + f / 600; v = round(235 * (1 - (1 - (t - c0) / (c1 - c0)) ** 3)) // 10
    if v != last: P(t, ('ui_tick_counter', 0), align='peak', gain_db=-23, vary=0.4, seed=f); last = v
P(27.45, ('engine_rev', 0), align='peak', gain_db=-9, max_len=2.3, fade_out=0.7)
H(27.5, ('hit_heavy', 0), align='peak', gain_db=-7); H(27.5, ('sub_boom', 1), align='peak', gain_db=-8)
neigh = sfxlib.get('horse_neigh', 0); put(fx, 27.05, verb(neigh[0], 1.6, 0.25), -10)
P(27.6, ('sparkle', 2), align='peak', gain_db=-24)
# travellers 30.462: whoosh, desert wind back, chip pops
P(30.462, ('whoosh_medium', 0), align='peak', gain_db=-16, semitones=-1)
bed(amb, 30.3, 37.2, sfxlib.get('desert_wind', 1)[0], 3.0, -14, 0.8, 1.0)
for i, t in enumerate([31.0, 31.3]): P(t, ('ui_pop', 0), align='peak', gain_db=-21, vary=0.6, seed=10 + i)
P(34.827, ('wind_whoosh', 2), align='peak', gain_db=-17)
# night: dip into the fire (fire whoosh), crackles + night wind, the pour from frame 20 of the coffee shot, crickets under the stars
P(36.99, ('reverse_swell', 1), align='peak', gain_db=-18)
put(fx, 37.0, EX(1346), -14, 0.0, 0.8)
bed(amb, 37.0, 43.7, EX(1736), 4.0, -5, 0.5, 0.9)
bed(amb, 37.0, 43.5, peaknorm(EX(1330), -3), 2.0, -6, 0.4, 0.9)
put(fx, 40.0 + 0.63 - 0.30, EX(2826), 1, 0.05, 1.2)
bed(amb, 42.6, 45.72, EX(1789), 1.0, 4, 0.7, 0.03)
P(43.05, ('sparkle', 2), align='peak', gain_db=-25); P(44.3, ('sparkle', 1), align='peak', gain_db=-27, pan=0.4)
# drop 45.741: swell in, headlights on, massive hit; the flare streak sweeps through 46.6; idle rumble under the lights
P(45.72, ('riser_4s', 0), align='peak', gain_db=-15); P(45.72, ('reverse_swell', 3), align='peak', gain_db=-17)
H(45.741, ('light_switch', 0), align='peak', gain_db=-8); P(45.76, ('light_switch', 3), align='peak', gain_db=-14)
H(45.741, ('hit_heavy', 3), align='peak', gain_db=-7); H(45.741, ('sub_boom', 0), align='peak', gain_db=-7); H(45.741, ('braam', 3), align='peak', gain_db=-12, max_len=4.0, fade_out=1.2)
P(46.6, ('swoosh_long', 0), align='peak', gain_db=-15)
P(46.45, ('sparkle', 1), align='peak', gain_db=-22); P(46.75, ('hit_soft', 3), align='peak', gain_db=-18)
bed(amb, 46.0, 49.85, sfxlib.get('offroad_rumble', 1)[0], 2.0, -19, 0.8, 0.3)
# engines 49.839: whoosh, the car slides in, a pop per engine row
P(49.839, ('whoosh_medium', 0), align='peak', gain_db=-15); P(50.2, ('whoosh_short', 1), align='peak', gain_db=-21)
for i, t in enumerate([50.6, 50.85, 51.1]): P(t, ('ui_pop', 2 if i == 0 else 0), align='peak', gain_db=-19 if i == 0 else -21, seed=20 + i, vary=0.4)
# end card: the logo lands on the music's final hit 55.841, glint, then each line ticks in
P(55.841, ('logo_impact', 0), align='peak', gain_db=-19)
H(55.841, ('sub_boom', 1), align='peak', gain_db=-8); H(55.841, ('hit_heavy', 0), align='peak', gain_db=-9)
P(56.15, ('logo_sting', 2), align='peak', gain_db=-18)
for i, t in enumerate([55.8, 56.0, 56.2, 56.4, 56.6]): P(t, ('ui_click', 1), align='peak', gain_db=-26, vary=0.5, seed=30 + i)

# ---- ducking: music / ambience / small fx step back under the voice; impacts stay
v = np.abs(vo).max(1); a_ = 1 - np.exp(-1 / (0.03 * SR)); r_ = 1 - np.exp(-1 / (0.35 * SR))
e = np.zeros_like(v); acc = 0.0
vs = np.convolve(v, np.ones(240) / 240, 'same')
for i in range(0, len(vs), 48):                                     # 1 ms control rate
    x = vs[i]; acc += (x - acc) * (1 - (1 - (a_ if x > acc else r_)) ** 48); e[i:i + 48] = acc
d = np.clip(e / 0.02, 0, 1)
dm = 10 ** (-9 * d / 20); da = 10 ** (-7 * d / 20); df = 10 ** (-4 * d / 20); dh = 10 ** (-4 * d / 20)
mix = mus * 0.95 * dm[:, None] + amb * da[:, None] + fx * df[:, None] + hit * dh[:, None] + vo
mix = mix[:int(DUR * SR)]
mix *= np.clip((DUR - np.arange(len(mix)) / SR) / 0.5, 0, 1)[:, None] ** 0.5   # follows the final 0.5 s video dip
os.makedirs(f'{D}/reg/out', exist_ok=True)
with wave.open(f'{D}/reg/out/hx.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix * 0.6, -1, 1) * 32767).astype('<i2').tobytes())
print('ok hx', DUR, 'peak', round(20 * np.log10(np.abs(mix * 0.6).max()), 2))
if os.environ.get('STEMS'):
    bg = (mus * 0.95 * dm[:, None] + amb * da[:, None] + fx * df[:, None] + hit * dh[:, None])[:int(DUR * SR)]
    np.save(f'{D}/scratchpad/hx_vo.npy', vo[:int(DUR * SR)].mean(1)); np.save(f'{D}/scratchpad/hx_bg.npy', bg.mean(1))
