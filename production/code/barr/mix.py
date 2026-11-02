# music + SFX for the Barr (Hilux 2027) ad, 50.5 s; music drop lands on the 10 s reveal
import sys, wave, numpy as np
sys.path.insert(0, '/tmp/claude-0/-home-user-eslam/0f5505b8-8bf4-57e7-9c4a-28493f9f4c64/lib/sfx'); import sfxlib
SR = 48000; DUR = 50.5; N = int(DUR * SR)
def rd(p):
    w = wave.open(p); a = np.frombuffer(w.readframes(w.getnframes()), '<i2' if w.getsampwidth() == 2 else '<i4').astype(np.float32)
    a /= 32768.0 if w.getsampwidth() == 2 else 2147483648.0
    a = a.reshape(-1, w.getnchannels()); assert w.getframerate() == SR, w.getframerate(); return a
m = rd('/tmp/claude-0/-home-user-eslam/0f5505b8-8bf4-57e7-9c4a-28493f9f4c64/lib/music/ot_13971.wav')[int(3.44 * SR):][:N]
mus = np.zeros((N, 2), np.float32); mus[:len(m)] = m
fi = np.linspace(0, 1, int(1.2 * SR)); mus[:len(fi)] *= fi[:, None]
fo = int(2.5 * SR); mus[N - fo:] *= np.linspace(1, 0, fo)[:, None]
mus *= 10 ** (-3 / 20)
sfx = np.zeros((N, 2), np.float32)
P = lambda t, e, **k: sfxlib.place(sfx, t, e, **k)
P(0, 'desert_wind', align='start', gain_db=-16, max_len=10.5, fade_out=2)
P(10.0, 'reverse_swell', align='peak', gain_db=-10)
P(10.0, ('hit_heavy', 0), align='onset', gain_db=-6); P(10.0, 'sub_boom', align='onset', gain_db=-8)
P(12.5, 'whoosh_short', align='peak', gain_db=-12, vary=0.3, seed=1)
P(14.0, 'gravel_spray', align='onset', gain_db=-10)
P(16.0, 'whoosh_medium', align='peak', gain_db=-12, vary=0.3, seed=2)
P(18.0, 'offroad_rumble', align='start', gain_db=-12, max_len=3.2, fade_out=0.8)
P(18.0, 'tyre_gravel', align='onset', gain_db=-12)
P(21.0, 'whoosh_short', align='peak', gain_db=-13, vary=0.3, seed=3)
P(24.0, 'desert_wind', align='start', gain_db=-20, max_len=7, fade_out=2)
P(31.0, 'whoosh_medium', align='peak', gain_db=-14, vary=0.3, seed=4)
P(37.5, 'engine_start', align='onset', gain_db=-9)
P(38.7, 'turbo_whoosh', align='peak', gain_db=-12)
P(40.5, 'whoosh_medium', align='peak', gain_db=-11, seed=5)
P(40.8, 'card_drop', align='onset', gain_db=-14); P(41.9, 'card_drop', align='onset', gain_db=-14, vary=0.4, seed=6)
P(45.4, ('logo_impact', 0), align='onset', gain_db=-6)
for name, mix in [('music', mus + sfx * 0.9), ('sfx', sfx)]:
    x = np.clip(mix, -1, 1)
    with wave.open(f'/tmp/mmw/bar/mix_{name}.wav', 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype('<i2').tobytes())
print('ok')
