# Toyota Yaris 2026 mix (yaris26/film.json): client music pick #3 FreePD "Desert Conflict" cut on downbeats, client's ElevenLabs MSA VO,
# frame-accurate SFX from lib/sfx (+ extra: falcon screech/wings, campfire, crickets, coffee pour)
import sys, os, json, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, f'{D}/lib/sfx'); import sfxlib
SR = 48000; DUR = 52.8; N = int((DUR + 4) * SR)
VO_DIR = os.environ.get('VO_DIR', f'{D}/scratchpad/vo_yr')


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

# ---- music (client pick #3): FreePD "Desert Conflict": A 0.662 -> ad 0 (drop 16.672 = 16.01) .. 26.68 |
#      B 84.672 -> ad 26.02 (biggest hit 90.686 = 32.034) .. 100.682 | C 146.692 -> ad 42.03 (final hit 154.68 = 50.02, rings out)
M = rd(f'{D}/lib/music/fpd_desert_conflict.wav')
def mseg(ad0, tr0, tr1, fin, fout, pre=0.02):
    a = int((tr0 - pre) * SR); b = int(tr1 * SR); put(mus, ad0 - pre, M[a:b], 0, fin, fout)
mseg(0.0, 0.662, 26.68 + 0.02, 0.6, 0.06, pre=0.0)
mseg(26.02, 84.672, 100.682 + 0.02, 0.06, 0.06)
mseg(42.03, 146.692, 157.43, 0.06, 0.3)
tt = np.arange(N) / SR; mus *= np.clip((DUR - 0.1 - tt) / 1.5, 0, 1)[:, None]
mus *= np.float32(10 ** (-3.0 / 20))

# ---- VO: client's ElevenLabs MSA take (scratchpad/vo_yr/take1.mp3, split at its pauses into v1..v12)
VO_AT = {1: 0.4, 2: 3.5, 3: 7.4, 4: 10.9, 5: 15.95, 6: 22.35, 7: 28.65, 8: 32.03, 9: 37.1, 10: 42.1, 11: 45.3, 12: 49.15}   # 5: "Toyota" on the drop, 8: the number with the counter
hp = butter(2, 85, 'high', fs=SR, output='sos'); pres = butter(2, [2500, 6000], 'band', fs=SR, output='sos')
for k, t in VO_AT.items():
    p = f'{VO_DIR}/v{k}.wav'
    if not os.path.exists(p): continue
    x = rd(p).mean(1); x = sosfilt(hp, x); x = x + 0.25 * sosfilt(pres, x)
    e = np.sqrt(np.convolve(x ** 2, np.ones(480) / 480, 'same')) + 1e-6
    gr = np.minimum(0, (-26 - 20 * np.log10(e)) * (1 - 1 / 3)); gr = np.convolve(gr, np.ones(2400) / 2400, 'same'); x = x * 10 ** (gr / 20)
    sp = np.abs(x) > 0.01; x = x * (10 ** (-15.5 / 20) / np.sqrt((x[sp] ** 2).mean()))
    put(vo, t, verb(np.repeat(x[:, None], 2, 1).astype(np.float32), 0.7, 0.09, seed=k * 7))

P = lambda t, e, **k: sfxlib.place(fx, t, e, **k)
H = lambda t, e, **k: sfxlib.place(hit, t, e, **k)
R, HIT, ENG, END, LOGO = 16.01, 32.034, 44.015, 49.02, 50.02
# dawn: desert air, the falcon's screech and wings, the coffee
bed(amb, 0.0, 16.0, sfxlib.get('desert_wind', 0)[0], 0.0, -24, 1.5, 0.4)
put(fx, 1.2, verb(EX('fs575524')[int(0.0 * SR):int(1.2 * SR)], 2.0, 0.35), -14, 0.02, 0.4, pan=-0.2)
P(4.017, ('whip_pan', 0), align='peak', gain_db=-16); put(fx, 4.1, verb(EX('fs575525'), 2.2, 0.35), -8); put(fx, 4.3, EX('2702')[int(0.05 * SR):], -11, 0.02, 0.8, pan=0.2)
P(6.002, ('whoosh_short', 1), align='peak', gain_db=-19); put(fx, 6.1, EX('2826')[int(0.3 * SR):], -4, 0.05, 0.5); bed(amb, 6.0, 8.0, EX('1736'), 2.0, -16, 0.2, 0.2)
H(8.022, ('hit_soft', 0), align='peak', gain_db=-13); P(8.3, ('light_switch', 0), align='peak', gain_db=-14); P(8.5, ('sparkle', 1), align='peak', gain_db=-22)
P(10.019, ('whoosh_short', 2), align='peak', gain_db=-19); P(10.9, ('ui_click', 1), align='peak', gain_db=-18)
P(12.028, ('whip_pan', 3), align='peak', gain_db=-16); P(12.4, ('car_passby', 0), align='peak', gain_db=-17)
P(14.036, ('wind_whoosh', 2), align='peak', gain_db=-17); put(fx, 14.3, EX('2702')[int(0.05 * SR):], -13, 0.02, 0.8, pan=-0.2)
P(R - 0.02, ('riser_2s', 0), align='peak', gain_db=-14); P(R - 0.03, ('reverse_swell', 1), align='peak', gain_db=-15)
# the drop: reveal on the desert highway
H(R, ('hit_heavy', 0), align='peak', gain_db=-6); H(R, ('sub_boom', 0), align='peak', gain_db=-8); H(R, ('braam', 3), align='peak', gain_db=-16, max_len=2.2, fade_out=1.0)
P(R + 0.4, ('car_passby', 0), align='peak', gain_db=-11); put(fx, R + 0.15, verb(EX('fs575525'), 2.4, 0.4), -14, pan=0.3)
cuts = [20.015, 22.012, 24.021]
for i, c in enumerate(cuts): P(c, [('whip_pan', 1), ('whoosh_medium', 1), ('whoosh_short', 0)][i], align='peak', gain_db=-16, vary=0.5, seed=80 + i)
for i, t in enumerate([20.35, 20.6, 20.85]): P(t, ('ui_pop', 0), align='peak', gain_db=-20, vary=0.6, seed=i)
P(22.6, ('car_passby', 1), align='peak', gain_db=-15); P(24.5, ('sand_gust', 0), align='onset', gain_db=-20, max_len=1.5, fade_out=0.6)
# dusk at the camp: fire, crickets, coffee, sparks, then the big hit
bed(amb, 26.02, 32.0, EX('1736'), 4.0, -9, 0.4, 0.2); bed(amb, 26.3, 32.0, EX('1789'), 1.0, 0, 0.8, 0.1); bed(amb, 26.02, 32.0, peaknorm(EX('1330'), -3), 1.0, -7, 0.3, 0.2)
put(fx, 28.0, EX('2826')[int(0.6 * SR):int(1.9 * SR)], -5, 0.05, 0.4); P(30.025, ('wind_whoosh', 1), align='peak', gain_db=-18); put(fx, 30.3, EX('1346'), -15, 0.0, 0.6)
P(HIT - 0.02, ('riser_2s', 1), align='peak', gain_db=-13); P(HIT - 0.03, ('reverse_swell', 0), align='peak', gain_db=-15)
H(HIT, ('hit_heavy', 3), align='peak', gain_db=-5); H(HIT, ('sub_boom', 0), align='peak', gain_db=-6); H(HIT, ('braam', 1), align='onset', gain_db=-14, max_len=2.5, fade_out=1.0)
P(HIT + 0.15, ('car_passby', 1), align='peak', gain_db=-10)
c0, c1, last = HIT + 0.25, HIT + 0.25 + 1.6, -1
for f in range(int((c1 - c0) * 600) + 1):
    t = c0 + f / 600; vv = int(221 * (1 - (1 - (t - c0) / (c1 - c0)) ** 3)) // 7
    if vv != last: P(t, ('ui_tick_counter', 0), align='peak', gain_db=-23, vary=0.4, seed=f); last = vv
H(c1, ('hit_heavy', 0), align='peak', gain_db=-8); P(c1, ('ui_data_blip', 0), align='peak', gain_db=-18)
P(34.03, ('whoosh_medium', 0), align='peak', gain_db=-17); P(34.6, ('car_passby', 0), align='peak', gain_db=-15)
P(36.039, ('whip_pan', 2), align='peak', gain_db=-16); put(fx, 36.3, verb(EX('fs575524')[int(6.1 * SR):int(7.6 * SR)], 2.0, 0.4), -10, 0.02, 0.4, pan=0.2); put(fx, 36.5, EX('2702')[int(0.05 * SR):], -12, 0.02, 0.8)
P(38.024, ('whoosh_short', 1), align='peak', gain_db=-18); P(38.3, ('light_switch', 3), align='peak', gain_db=-15)
for i, t in enumerate([38.35, 38.65]): P(t, ('ui_pop', 0), align='peak', gain_db=-20, seed=20 + i)
P(40.033, ('whoosh_medium', 1), align='peak', gain_db=-17); P(40.6, ('car_passby', 0), align='peak', gain_db=-15)
# night under the stars
bed(amb, 42.03, 49.0, EX('1789'), 6.0, -2, 0.6, 0.5); bed(amb, 42.03, 49.0, peaknorm(EX('1330'), -3), 3.0, -12, 0.5, 0.4)
P(42.03, ('reverse_swell', 1), align='peak', gain_db=-18); P(42.4, ('sparkle', 2), align='peak', gain_db=-22)
P(ENG, ('whoosh_medium', 0), align='peak', gain_db=-15)
for i, t in enumerate([44.82, 45.07, 45.32]): P(t, ('ui_pop', 2 if i == 0 else 0), align='peak', gain_db=-19 if i == 0 else -21, seed=30 + i, vary=0.4)
P(END, ('swoosh_long', 0), align='peak', gain_db=-17)
P(LOGO, ('logo_impact', 0), align='peak', gain_db=-15); H(LOGO, ('sub_boom', 0), align='peak', gain_db=-7); H(LOGO, ('hit_heavy', 1), align='peak', gain_db=-11)
put(fx, LOGO + 0.1, verb(EX('fs575525'), 2.6, 0.45), -12); P(LOGO + 0.3, ('logo_sting', 2), align='peak', gain_db=-19)

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
with wave.open(f'{D}/reg/out/yaris.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix * 0.6, -1, 1) * 32767).astype('<i2').tobytes())
if os.environ.get('STEMS'):
    np.save(f'{D}/scratchpad/hx2_vo.npy', vo[:int(DUR * SR)].mean(1)); np.save(f'{D}/scratchpad/hx2_bg.npy', (mix[:, :] - vo[:int(DUR * SR)]).mean(1))
print('ok yaris', DUR, 'peak', round(20 * np.log10(np.abs(mix * 0.6).max()), 2))
