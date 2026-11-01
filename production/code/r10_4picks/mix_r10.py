# Four-picks reel: music Mixkit 1150 "No Warning" (real drums/bass) from 63.26 s, drop on 4.37; SFX on the cuts
import sys, os, wave, numpy as np
D = '/tmp/claude-0/-home-user-eslam/0f5505b8-8bf4-57e7-9c4a-28493f9f4c64'
sys.path.insert(0, f'{D}/lib/sfx'); import sfxlib
SR = 48000; DUR = 19.0; N = int((DUR + 3) * SR)
def rd(p):
    with wave.open(p) as w: a = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768; a = a.reshape(-1, w.getnchannels())
    return a if a.shape[1] == 2 else np.repeat(a, 2, 1)
def put(buf, t, x, g=0.0, fin=0.0, fout=0.0):
    x = x.copy(); n = len(x)
    if fin: k = int(fin * SR); x[:k] *= np.linspace(0, 1, k)[:, None]
    if fout: k = int(fout * SR); x[-k:] *= np.linspace(1, 0, k)[:, None]
    i = int(t * SR); m = min(len(x), len(buf) - i); buf[i:i + m] += x[:m] * np.float32(10 ** (g / 20))
mus = np.zeros((N, 2), np.float32); fx = np.zeros_like(mus)
M = rd(f'{D}/lib/music/1150.wav'); a = int(63.26 * SR); put(mus, 0, M[a:a + int(DUR * SR)], -3, 0.05, 1.5)
mus *= float(os.environ.get('MUSIC', 1))
P = lambda t, e, **k: sfxlib.place(fx, t, e, **k)
for i, t in enumerate([0.55, 1.09, 1.64, 2.18, 2.73, 3.28, 3.82]): P(t, ('whip_pan', i % 2), align='peak', gain_db=-20, vary=.4, seed=i)
P(4.30, ('riser_2s', 1), align='peak', gain_db=-16); P(4.37, ('hit_heavy', 3), align='peak', gain_db=-9); P(4.37, ('sub_boom', 0), align='peak', gain_db=-9)
for i, t in enumerate([6.55, 8.47, 10.65]): P(t, ('hit_heavy', i % 2), align='peak', gain_db=-13, seed=20 + i); P(t, ('whoosh_medium', i % 2), align='peak', gain_db=-17, seed=30 + i)
for i, t in enumerate([5.46, 7.64, 9.56, 11.74]): P(t, ('whoosh_short', i % 2), align='peak', gain_db=-19, seed=40 + i)
P(12.83, ('swoosh_long', 0), align='peak', gain_db=-16); P(13.3, ('ui_pop', 2), align='peak', gain_db=-17)
P(14.6, ('reverse_swell', 1), align='peak', gain_db=-17); P(15.1, ('logo_impact', 0), align='peak', gain_db=-12); P(15.1, ('sub_boom', 0), align='peak', gain_db=-9)
P(15.9, ('logo_sting', 2), align='peak', gain_db=-19)
mix = (mus + fx)[:int(DUR * SR)]; mix *= np.clip((DUR - np.arange(len(mix)) / SR) / .6, 0, 1)[:, None] ** .5
g = 10 ** (-1.5 / 20) / np.abs(mix).max()
with wave.open(os.environ['OUT'], 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix * g, -1, 1) * 32767).astype('<i2').tobytes())
print('ok', os.environ['OUT'])
