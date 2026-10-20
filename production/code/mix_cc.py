# Toyota Corolla Cross mix (ccross26/film.json): client music pick #3 OpenTracks ot_9389 "Wings of the Roc" cut on downbeats, client's ElevenLabs MSA VO,
# frame-accurate SFX from lib/sfx
import sys, os, json, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, f'{D}/lib/sfx'); import sfxlib
SR = 48000; DUR = 52.6; N = int((DUR + 4) * SR)
VO_DIR = os.environ.get('VO_DIR', f'{D}/scratchpad/vo_cc')


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

# ---- music (client pick #3): ot_9389 "Wings of the Roc": A 44.547 -> ad 0 (re-entry hit 58.027 = 13.48) .. 74.257 |
#      B 78.495 -> ad 29.71 (drop 80.62 = 31.835) .. 91.22 | C 99.718 -> ad 42.435 (final hit 106.881 = 49.60, rings out)
M = rd(f'{D}/lib/music/ot_9389.wav')
def mseg(ad0, tr0, tr1, fin, fout, pre=0.02):
    a = int((tr0 - pre) * SR); b = int(tr1 * SR); put(mus, ad0 - pre, M[a:b], 0, fin, fout)
mseg(0.0, 44.547, 74.257 + 0.02, 0.8, 0.04, pre=0.0)
mseg(29.71, 78.495, 91.22 + 0.02, 0.04, 0.04)
mseg(42.435, 99.718, 110.5, 0.04, 0.3)
tt = np.arange(N) / SR; mus *= np.clip((DUR - 0.1 - tt) / 1.5, 0, 1)[:, None]
mus *= np.float32(10 ** (-6.0 / 20))                       # hot master (-9.4 LUFS)

# ---- VO: client's ElevenLabs MSA take (scratchpad/vo_cc/take1.mp3, split at its pauses into v1..v12)
VO_AT = {1: 0.4, 2: 4.3, 3: 8.0, 4: 13.7, 5: 16.6, 6: 23.4, 7: 29.2, 8: 32.05, 9: 36.7, 10: 41.0, 11: 45.0, 12: 49.5}   # 8: the number with the counter
hp = butter(2, 85, 'high', fs=SR, output='sos'); pres = butter(2, [2500, 6000], 'band', fs=SR, output='sos')
for k, t in VO_AT.items():
    p = f'{VO_DIR}/v{k}.wav'
    if not os.path.exists(p): continue
    x = rd(p).mean(1); x = sosfilt(hp, x); x = x + 0.25 * sosfilt(pres, x)
    e = np.sqrt(np.convolve(x ** 2, np.ones(480) / 480, 'same')) + 1e-6
    gr = np.minimum(0, (-26 - 20 * np.log10(e)) * (1 - 1 / 3)); gr = np.convolve(gr, np.ones(2400) / 2400, 'same'); x = x * 10 ** (gr / 20)
    sp = np.abs(x) > 0.01; x = x * (10 ** (-15.5 / 20) / np.sqrt((x[sp] ** 2).mean()))
    put(vo, t, verb(np.repeat(x[:, None], 2, 1).astype(np.float32), 0.6, 0.08, seed=k * 7))

P = lambda t, e, **k: sfxlib.place(fx, t, e, **k)
H = lambda t, e, **k: sfxlib.place(hit, t, e, **k)
R, HI, DROP, ENG, END, LOGO = 13.48, 19.064, 31.835, 44.56, 48.6, 49.598
# Jeddah morning: sea air, cuts on the downbeats
bed(amb, 0.0, 13.4, sfxlib.get('desert_wind', 0)[0], 0.0, -28, 1.5, 0.4)
P(4.238, ('whoosh_short', 0), align='peak', gain_db=-20); P(6.398, ('whoosh_medium', 1), align='peak', gain_db=-19); P(6.9, ('sparkle', 1), align='peak', gain_db=-22)
P(8.453, ('wind_whoosh', 2), align='peak', gain_db=-19); P(10.519, ('whip_pan', 0), align='peak', gain_db=-19)
P(11.4, ('engine_start', 0), align='onset', gain_db=-16, max_len=1.8, fade_out=0.6)
P(R - 0.02, ('riser_2s', 0), align='peak', gain_db=-14); P(R - 0.03, ('reverse_swell', 1), align='peak', gain_db=-15)
# the re-entry hit: Corniche
H(R, ('hit_heavy', 0), align='peak', gain_db=-6); H(R, ('sub_boom', 0), align='peak', gain_db=-8); H(R, ('braam', 3), align='peak', gain_db=-15, max_len=2.2, fade_out=1.0)
P(R + 0.5, ('car_passby', 0), align='peak', gain_db=-12); P(R + 0.3, ('logo_sting', 1), align='peak', gain_db=-20)
cuts = [16.939, HI, 21.189, 23.313, 25.426, 27.551]
kinds = [('whoosh_medium', 0), ('whip_pan', 1), ('whoosh_short', 2), ('whoosh_medium', 1), ('whip_pan', 3), ('whoosh_short', 1)]
for i, (c, k) in enumerate(zip(cuts, kinds)): P(c, k, align='peak', gain_db=-17 if i % 2 else -15, vary=0.5, seed=70 + i)
for t in [17.6, 21.9, 24.0]: P(t, ('car_passby', 0), align='peak', gain_db=-14, vary=0.6, seed=int(t * 10))
for i, t in enumerate([19.26, 19.51, 19.76, 25.74, 26.04]): P(t, ('ui_pop', 0), align='peak', gain_db=-20, vary=0.6, seed=i)
# up to Abha (cloud air), the drop at night
P(29.71, ('wind_whoosh', 3), align='peak', gain_db=-17); bed(amb, 29.71, 31.8, sfxlib.get('desert_wind', 1)[0], 2.0, -21, 0.3, 0.3)
P(DROP - 0.02, ('riser_2s', 1), align='peak', gain_db=-15)
H(DROP, ('hit_heavy', 3), align='peak', gain_db=-6); H(DROP, ('sub_boom', 0), align='peak', gain_db=-7); H(DROP, ('braam', 1), align='onset', gain_db=-16, max_len=2.5, fade_out=1.0)
P(DROP + 0.2, ('car_passby', 1), align='peak', gain_db=-11); P(DROP + 0.1, ('electric_hum', 3), align='onset', gain_db=-18, max_len=2.0, fade_out=0.8)
c0, c1, last = DROP + 0.25, DROP + 0.25 + 1.6, -1
for f in range(int((c1 - c0) * 600) + 1):
    t = c0 + f / 600; vv = int(258 * (1 - (1 - (t - c0) / (c1 - c0)) ** 3)) // 8
    if vv != last: P(t, ('ui_tick_counter', 0), align='peak', gain_db=-23, vary=0.4, seed=f); last = vv
H(c1, ('hit_heavy', 0), align='peak', gain_db=-8); P(c1, ('ui_data_blip', 0), align='peak', gain_db=-18)
for c in [33.948, 36.072, 38.197, 40.31]: P(c, ('whoosh_medium', 1), align='peak', gain_db=-17, vary=0.5, seed=int(c)); P(c + 0.8, ('car_passby', 0), align='peak', gain_db=-14, vary=0.6, seed=int(c * 3))
for i, t in enumerate([36.4, 36.7]): P(t, ('ui_pop', 0), align='peak', gain_db=-20, seed=20 + i)
P(40.9, ('light_switch', 0), align='peak', gain_db=-14); P(41.0, ('sparkle', 2), align='peak', gain_db=-21)
P(ENG, ('whoosh_medium', 0), align='peak', gain_db=-15)
for i, t in enumerate([45.36, 45.61, 45.86]): P(t, ('ui_pop', 2 if i == 0 else 0), align='peak', gain_db=-19 if i == 0 else -21, seed=30 + i, vary=0.4)
P(END, ('swoosh_long', 0), align='peak', gain_db=-17)
P(LOGO, ('logo_impact', 0), align='peak', gain_db=-16); H(LOGO, ('sub_boom', 0), align='peak', gain_db=-7); H(LOGO, ('hit_heavy', 1), align='peak', gain_db=-11)
P(LOGO + 0.3, ('logo_sting', 2), align='peak', gain_db=-18)

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
with wave.open(f'{D}/reg/out/ccross.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix * 0.6, -1, 1) * 32767).astype('<i2').tobytes())
if os.environ.get('STEMS'):
    np.save(f'{D}/scratchpad/hx2_vo.npy', vo[:int(DUR * SR)].mean(1)); np.save(f'{D}/scratchpad/hx2_bg.npy', (mix[:, :] - vo[:int(DUR * SR)]).mean(1))
print('ok ccross', DUR, 'peak', round(20 * np.log10(np.abs(mix * 0.6).max()), 2))
