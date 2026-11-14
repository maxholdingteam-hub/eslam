# paste_plate.py IN OUT "x1,y1 x2,y2 x3,y3 x4,y4"  (corners TL TR BR BL as fractions of the image)
# warps the real MAX MOTORS plate onto the plate area of a generated image
import sys, os, numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
src, dst, q = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert('RGB'); W, H = im.size
quad = [(float(a) * W, float(b) * H) for a, b in (p.split(',') for p in q.split())]
pl = Image.open(os.path.join(HERE, 'plate.png')).convert('RGBA'); pw, ph = pl.size
def coeffs(dst_pts, src_pts):
    A = []; B = []
    for (x, y), (u, v) in zip(dst_pts, src_pts):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]; B += [u, v]
    return np.linalg.solve(np.array(A, float), np.array(B, float)).tolist()
c = coeffs(quad, [(0, 0), (pw, 0), (pw, ph), (0, ph)])
warp = pl.transform((W, H), Image.PERSPECTIVE, c, Image.BICUBIC)
im.paste(warp, (0, 0), warp); im.save(dst, quality=95); print(dst)
