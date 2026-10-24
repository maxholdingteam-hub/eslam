# Toyota Raize mix (raize26/film.json): OpenTracks ot_13971 "Burning Sands" cut on downbeats, client's ElevenLabs MSA VO,
# frame-accurate SFX from lib/sfx
import sys, os, json, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, f'{D}/lib/sfx'); import sfxlib
SR = 48000; DUR = 50.8; N = int((DUR + 4) * SR)
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

# ---- music: ot_13971 "Burning Sands": A 100.83 -> ad 0 (hit 109.227 = 8.40) .. 116.62 | B 113.42 -> ad 15.79 (drop 124.62 = 26.99) .. 142.26 |
#      C 160.82 -> ad 44.63 (final hit 163.631 = 47.44, rings out)
M = rd(f'{D}/lib/music/ot_13971.wav')
def mseg(ad0, tr0, tr1, fin, fout, pre=0.02):
    a = int((tr0 - pre) * SR); b = int(tr1 * SR); put(mus, ad0 - pre, M[a:b], 0, fin, fout)
mseg(0.0, 100.83, 116.62 + 0.02, 0.5, 0.05, pre=0.0)
mseg(15.79, 113.42, 142.26 + 0.02, 0.05, 0.05)
mseg(44.63, 160.82, 166.9, 0.05, 0.3)
tt = np.arange(N) / SR; mus *= np.clip((DUR - 0.1 - tt) / 1.5, 0, 1)[:, None]
mus *= np.float32(10 ** (-7.5 / 20))

# ---- VO: client's ElevenLabs MSA take (scratchpad/vo_rz/take1.mp3, split at its pauses into v1..v10)
VO_AT = {1: 0.4, 2: 4.4, 3: 8.3, 4: 16.2, 5: 20.1, 6: 27.0, 7: 31.8, 8: 37.4, 9: 41.6, 10: 46.7}   # 3: "Toyota Raize" on the hit, 6: "97" on the drop
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
R, DROP, ENG, END, LOGO = 8.40, 26.99, 41.41, 46.44, 47.44
# dawn in the rose farms: mountain air, a whoosh on each cut
bed(amb, 0.0, 8.3, sfxlib.get('desert_wind', 0)[0], 0.0, -27, 1.5, 0.4)
P(4.10, ('whoosh_short', 0), align='peak', gain_db=-20); P(4.5, ('sparkle', 1), align='peak', gain_db=-23)
P(5.90, ('wind_whoosh', 2), align='peak', gain_db=-18)
P(R - 0.02, ('riser_2s', 0), align='peak', gain_db=-15); P(R - 0.03, ('reverse_swell', 1), align='peak', gain_db=-16)
H(R, ('hit_heavy', 0), align='peak', gain_db=-7); H(R, ('sub_boom', 0), align='peak', gain_db=-9)
P(R + 0.4, ('car_passby', 0), align='peak', gain_db=-13); P(R + 0.3, ('logo_sting', 1), align='peak', gain_db=-21)
cuts = [12.0, 14.0, 16.0, 18.0, 20.0, 22.4, 24.6]
kinds = [('whoosh_short', 1), ('whoosh_medium', 0), ('whip_pan', 1), ('whoosh_short', 2), ('whip_pan', 3), ('whoosh_medium', 1), ('wind_whoosh', 1)]
for i, (c, k) in enumerate(zip(cuts, kinds)): P(c, k, align='peak', gain_db=-17 if i % 2 else -15, vary=0.5, seed=90 + i)
P(12.4, ('light_switch', 0), align='peak', gain_db=-15); P(14.6, ('ui_click', 1), align='peak', gain_db=-18)
P(18.4, ('car_passby', 1), align='peak', gain_db=-16); P(20.5, ('car_passby', 0), align='peak', gain_db=-13)
for i, t in enumerate([20.35, 20.6, 20.85]): P(t, ('ui_pop', 0), align='peak', gain_db=-20, vary=0.6, seed=i)
P(DROP - 0.02, ('riser_2s', 1), align='peak', gain_db=-14)
H(DROP, ('hit_heavy', 3), align='peak', gain_db=-6); H(DROP, ('sub_boom', 0), align='peak', gain_db=-7); H(DROP, ('braam', 1), align='onset', gain_db=-16, max_len=2.2, fade_out=1.0)
P(DROP + 0.1, ('turbo_whoosh', 0), align='onset', gain_db=-12, max_len=1.6, fade_out=0.6)
c0, c1, last = DROP + 0.2, DROP + 0.2 + 1.3, -1
for f in range(int((c1 - c0) * 600) + 1):
    t = c0 + f / 600; vv = round(97 * (1 - (1 - (t - c0) / (c1 - c0)) ** 3)) // 4
    if vv != last: P(t, ('ui_tick_counter', 0), align='peak', gain_db=-23, vary=0.4, seed=f); last = vv
P(c1 - 0.05, ('engine_rev', 0), align='peak', gain_db=-12, max_len=1.8, fade_out=0.7); H(c1, ('hit_heavy', 0), align='peak', gain_db=-9)
for c in [29.40, 31.80, 34.20, 37.40]: P(c, ('whoosh_medium', 1), align='peak', gain_db=-17, vary=0.5, seed=int(c))
P(30.1, ('car_passby', 0), align='peak', gain_db=-15); P(32.3, ('car_passby', 1), align='peak', gain_db=-15)
for i, t in enumerate([32.15, 32.45]): P(t, ('ui_pop', 0), align='peak', gain_db=-20, seed=20 + i)
bed(amb, 34.2, 41.4, sfxlib.get('desert_wind', 1)[0], 2.0, -25, 0.5, 0.5)
P(ENG, ('reverse_swell', 1), align='peak', gain_db=-17)
for i, t in enumerate([42.21, 42.46]): P(t, ('ui_pop', 2 if i == 0 else 0), align='peak', gain_db=-20, seed=30 + i, vary=0.4)
P(END, ('swoosh_long', 0), align='peak', gain_db=-17)
P(LOGO, ('logo_impact', 0), align='peak', gain_db=-15); H(LOGO, ('sub_boom', 0), align='peak', gain_db=-7); H(LOGO, ('hit_heavy', 1), align='peak', gain_db=-11)
P(LOGO + 0.3, ('logo_sting', 2), align='peak', gain_db=-19)

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
with wave.open(f'{D}/reg/out/raize.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix * 0.5, -1, 1) * 32767).astype('<i2').tobytes())
if os.environ.get('STEMS'):
    np.save(f'{D}/scratchpad/hx2_vo.npy', vo[:int(DUR * SR)].mean(1)); np.save(f'{D}/scratchpad/hx2_bg.npy', (mix[:, :] - vo[:int(DUR * SR)]).mean(1))
print('ok raize', DUR, 'peak', round(20 * np.log10(np.abs(mix * 0.5).max()), 2))
