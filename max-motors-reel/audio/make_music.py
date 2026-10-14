"""Synthesises the 30 s dark trap / cinematic track for the Max Motors reel.

120 BPM (beat = 0.5 s, bar = 2 s), A minor. Hits and whooshes land on the
same timestamps as the video cuts in reel/cinematic.html (CUTS below).
Run:  python3 audio/make_music.py   -> audio/music.wav
"""
import numpy as np
from scipy import signal
from scipy.io import wavfile
from pathlib import Path

SR = 44100
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)
verb_send = np.zeros(N)

BEAT = 0.5
DROP, OUTRO = 4.0, 24.0
CUTS = [6, 8, 12, 14, 14.5, 15, 15.5, 16, 18, 20, 22]
BIG = [DROP, 16.0, OUTRO]


def put(sig, at, gain=1.0, pan=0.0, verb=0.0):
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    a = (pan + 1) * np.pi / 4                      # equal-power pan, centre = unity
    L[i:i + len(sig)] += sig * np.cos(a) * 2 ** 0.5
    R[i:i + len(sig)] += sig * np.sin(a) * 2 ** 0.5
    if verb:
        verb_send[i:i + len(sig)] += sig * verb


def tt(d):
    return np.arange(int(d * SR)) / SR


def noise(d):
    return rng.standard_normal(int(d * SR))


def filt(x, kind, f):
    sos = signal.butter(2 if kind != 'band' else 2, f, btype=kind, fs=SR, output='sos')
    return signal.sosfilt(sos, x)


# ---------- instruments ----------
def kick():
    t = tt(0.55)
    f = 45 + 140 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 7)
    s[:200] += filt(noise(0.0046), 'high', 2000)[:200] * 0.4
    return np.tanh(s * 1.8)


def clap():
    t = tt(0.35)
    n = filt(noise(0.35), 'band', [900, 3200])
    e = np.zeros_like(t)
    for o in (0, 0.011, 0.022):
        e += np.where(t >= o, np.exp(-(t - o) * 55), 0) * 0.6
    e += np.exp(-t * 14) * 0.5
    return n * e * 0.9


def hat(open_=False):
    d = 0.22 if open_ else 0.05
    t = tt(d)
    return filt(noise(d), 'high', 7500) * np.exp(-t * (14 if open_ else 70))


def bass808(freq, d, glide_from=None):
    t = tt(d)
    f = np.full_like(t, freq)
    if glide_from:
        f = freq + (glide_from - freq) * np.exp(-t * 18)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    env = np.minimum(1, t / 0.005) * np.exp(-t * 0.9)
    env *= np.minimum(1, (d - t) / 0.03)
    return np.tanh(s * env * 2.4) * 0.9


def boom(d=2.6):
    t = tt(d)
    f = 30 + 55 * np.exp(-t * 6)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    hit = filt(noise(d), 'low', 1800) * np.exp(-t * 9) * 0.8
    return np.tanh((s + hit) * 1.5)


def whoosh(d=0.45):
    t = tt(d)
    env = np.sin(np.pi * (t / d) ** 1.6) ** 2
    return filt(noise(d), 'band', [500, 5000]) * env * 0.5


def riser(d):
    t = tt(d)
    n = filt(noise(d), 'band', [1500, 6000]) * (t / d) ** 3 * 0.3
    f = 120 * 2 ** (4 * (t / d) ** 1.4)
    tone = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * (t / d) ** 2 * 0.12
    return n + filt(tone, 'low', 4000)


def note(n):  # midi -> Hz
    return 440 * 2 ** ((n - 69) / 12)


def pad(chord, d):
    t = tt(d)
    s = np.zeros_like(t)
    for n in chord:
        for det in (-0.12, 0, 0.12):
            s += signal.sawtooth(2 * np.pi * note(n + det) * t + rng.uniform(0, 6))
    s = filt(s / (len(chord) * 3), 'low', 700)
    env = np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.4)
    return s * env


# ---------- arrangement ----------
CHORDS = [[45, 48, 52, 57], [45, 48, 52, 57], [41, 45, 48, 53], [43, 47, 50, 55]]   # Am Am F G
ROOTS = [33, 33, 29, 31]                                                              # A1 A1 F1 G1

# pad bed across the whole track (quieter in the intro, swells at outro)
for bar in range(15):
    at = bar * 2.0
    g = 0.3 if at < DROP else (0.32 if at < OUTRO else 0.4)
    put(pad(CHORDS[bar % 4], 2.3), at, g, verb=0.25)

# intro: riser into the drop, ticking hats in the 2nd half
put(riser(DROP), 0, 0.4, verb=0.2)
for k in range(8):
    put(hat(), 2.0 + k * 0.25, 0.18 + k * 0.03, pan=0.3)

# main groove 4 s .. 24 s (half-time trap)
kick_times = []
for bar in range(2, 12):
    b0 = bar * 2.0
    build = 14.0 <= b0 < 16.0
    # 808 + kick
    pattern = [0, 1.25] if not build else [0, 0.5, 1.0, 1.5]
    for i, p in enumerate(pattern):
        at = b0 + p
        kick_times.append(at)
        put(kick(), at, 0.95)
    root = note(ROOTS[bar % 4])
    put(bass808(root, 1.2, glide_from=None), b0, 0.75)
    put(bass808(root * (1.5 if bar % 2 else 1), 0.7, glide_from=root * 2), b0 + 1.25, 0.65)
    # clap on beat 3
    put(clap(), b0 + 1.0, 0.5, verb=0.35)
    # hats: 8ths with 16th / triplet rolls at bar ends
    for k in range(8):
        put(hat(), b0 + k * 0.25, 0.18 if k % 2 == 0 else 0.12, pan=0.25)
    if bar % 2 == 1:
        for k in range(6):
            put(hat(), b0 + 1.5 + k * (0.5 / 6), 0.1 + k * 0.012, pan=-0.25)
    if bar % 4 == 3:
        put(hat(True), b0 + 1.75, 0.25, pan=0.4)
    if build:  # snare roll into the second drop
        for k in range(16):
            put(clap(), b0 + k * 0.125, 0.1 + k * 0.02, verb=0.2)

# cuts: whoosh into each, boom on the big ones
for c in CUTS:
    put(whoosh(0.4), c - 0.36, 0.35, pan=rng.uniform(-0.5, 0.5), verb=0.15)
for c in BIG:
    put(boom(), c, 1.0, verb=0.4)
put(riser(2.0), 14.0, 0.35)

# outro: long 808, final soft hit
put(bass808(note(33), 4.5), OUTRO, 0.7)
put(clap(), OUTRO + 1.0, 0.5, verb=0.6)
put(boom(3.5), 27.0, 0.55, verb=0.5)

# ---------- mix ----------
# sidechain duck from kicks
duck = np.ones(N)
dt = tt(0.35)
curve = 1 - 0.45 * np.exp(-dt * 10)
for k in kick_times:
    i = int(k * SR); j = min(N, i + len(curve))
    duck[i:j] = np.minimum(duck[i:j], curve[: j - i])
L *= duck; R *= duck

# reverb: exponentially decaying stereo noise IR
ir_t = tt(2.2)
irL = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 2.6)
irR = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 2.6)
irL = filt(irL, 'low', 5000); irR = filt(irR, 'low', 5000)
irL /= np.abs(irL).sum() ** 0.5 * 12; irR /= np.abs(irR).sum() ** 0.5 * 12
L += signal.fftconvolve(verb_send, irL)[:N]
R += signal.fftconvolve(verb_send, irR)[:N]

mix = np.stack([L, R], 1)
mix = filt(mix.T, 'high', 28).T                    # clean sub rumble
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.6) / np.tanh(1.6)            # glue / loudness
fade = np.ones(N); fl = int(1.2 * SR); fade[-fl:] = np.linspace(1, 0, fl) ** 2
mix *= fade[:, None] * 0.92

out = Path(__file__).with_name('music.wav')
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print('wrote', out)
