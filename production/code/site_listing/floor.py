# clean the floor of the LaMa backdrop: rebuild everything under the horizon as a glossy mirror of the glow
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
a = np.asarray(Image.open('bg_lama_2.png').convert('RGB')).astype(np.float32)
H, W, _ = a.shape
lum = a.mean(2); hz = int(np.argmax(lum[:, 200:900].mean(1)))
print('horizon', hz)
out = a.copy()
# base floor colour per row from the clean side strips
side = np.concatenate([a[:, :140], a[:, -140:]], 1).mean(1)          # (H,3)
for y in range(hz + 6, H):
    k = (y - hz) / (H - hz)
    mir = a[max(0, 2 * hz - y)]                                        # mirrored row above the horizon
    row = side[y][None, :] * 0.9 + gaussian_filter(mir, (25, 0)) * 0.22 * (1 - k) ** 1.5
    out[y] = row
# soft blend right under the line
for y in range(hz + 2, hz + 14):
    t = (y - hz - 2) / 12; out[y] = a[y] * (1 - t) + out[y] * t
# faint floor grain
rng = np.random.default_rng(1); g = gaussian_filter(rng.normal(0, 1, (H, W)), 1.2) * 2.2
out[hz + 6:] += g[hz + 6:, :, None]
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save('backdrop.png')
open('horizon.txt', 'w').write(str(hz))
