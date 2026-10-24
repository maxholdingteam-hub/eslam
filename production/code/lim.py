import numpy as np, wave, sys
from scipy.ndimage import maximum_filter1d, uniform_filter1d
from scipy.signal import resample_poly
src, dst, gain_db, ceil = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
w = wave.open(src); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32).reshape(-1, 2) / 32768
x = x * 10 ** (gain_db / 20)
up = resample_poly(x, 4, 1, axis=0)                                   # true-peak detection at 4x
pk = np.abs(up).max(1).reshape(-1, 4).max(1)[:len(x)]
look = int(0.005 * sr); pk = maximum_filter1d(pk, size=2 * look + 1)
g = np.minimum(1, ceil / np.maximum(pk, 1e-9)); g = uniform_filter1d(g, size=look)
rel = 1 / int(0.1 * sr); g2 = np.empty_like(g); g2[0] = g[0]
for i in range(1, len(g)): g2[i] = min(g[i], g2[i - 1] + (1 - g2[i - 1]) * rel * 3)
y = x * g2[:, None]
with wave.open(dst, 'wb') as o:
    o.setnchannels(2); o.setsampwidth(2); o.setframerate(sr); o.writeframes((np.clip(y, -1, 1) * 32767).astype('<i2').tobytes())
