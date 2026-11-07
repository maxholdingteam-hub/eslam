# paste an AI-harmonised crop back into the full photo: colour-match it on its border band, feather the edges
import sys, numpy as np, cv2
from PIL import Image
full_p, ai_p, out_p = sys.argv[1:4]; x0, y0, x1, y1 = map(int, sys.argv[4:8])
full = np.asarray(Image.open(full_p).convert('RGB')).astype(np.float32)
orig = full[y0:y1, x0:x1]; h, w = orig.shape[:2]
ai = cv2.resize(np.asarray(Image.open(ai_p).convert('RGB')).astype(np.float32), (w, h), interpolation=cv2.INTER_AREA)
b = 110; band = np.zeros((h, w), bool); band[:b] = band[-b:] = True; band[:, :b] = band[:, -b:] = True
band[:, :b] = False if x0 == 0 else band[:, :b]          # the left edge is the photo edge, not a seam
for c in range(3):                                         # mean/std match on the seam band
    o, a = orig[..., c][band], ai[..., c][band]
    ai[..., c] = (ai[..., c] - a.mean()) / (a.std() + 1e-6) * o.std() + o.mean()
m = np.ones((h, w), np.float32); f = 140
ramp = lambda n: np.clip(np.arange(n) / f, 0, 1)
m *= ramp(h)[:, None] * ramp(h)[::-1][:, None]
m *= (ramp(w)[None, :] if x0 > 0 else 1) * ramp(w)[::-1][None, :]
full[y0:y1, x0:x1] = orig * (1 - m[..., None]) + ai * m[..., None]
Image.fromarray(np.clip(full, 0, 255).astype(np.uint8)).save(out_p, quality=95); print('ok', out_p)
