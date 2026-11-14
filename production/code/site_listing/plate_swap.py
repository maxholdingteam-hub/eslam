# find a licence plate on a car cutout (white, text-filled rectangle in the lower body) and cover it with the Max Motors plate
import numpy as np, os
from PIL import Image
from scipy import ndimage as nd
PLATE = Image.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'plate.png')).convert('RGBA')
def find(cut):
    a = np.asarray(cut).astype(np.int16); H, W = a.shape[:2]
    rgb, al = a[..., :3], a[..., 3]
    mn, mx = rgb.min(2), rgb.max(2)
    white = (mn > 165) & (mx - mn < 40) & (al > 200)
    white[: int(H * 0.50)] = False; white[int(H * 0.93):] = False
    lab, n = nd.label(nd.binary_closing(white, iterations=2))
    best, bs = None, 0
    for i, sl in enumerate(nd.find_objects(lab), 1):
        ys, xs = sl; h, w = ys.stop - ys.start, xs.stop - xs.start
        if h < H * 0.025 or w < W * 0.04: continue
        r = w / h
        if not (1.4 < r < 6.0): continue
        if w * h > W * H * 0.035: continue
        comp = lab[sl] == i; fill = comp.mean()
        box = rgb[sl]; dark = (box.max(2) < 110).mean()          # characters inside the plate
        if fill < 0.45 or not (0.08 < dark < 0.45): continue
        cx = (xs.start + xs.stop) / 2 / W
        if not (0.12 < cx < 0.88): continue
        s = w * h * fill
        if s > bs: bs, best = s, (xs.start, ys.start, xs.stop, ys.stop)
    return best
def swap(cut):
    b = find(cut)
    if not b: return cut, False
    x0, y0, x1, y1 = b; w, h = x1 - x0, y1 - y0
    pw = int(w * 1.10); ph = max(int(h * 1.18), int(pw / 3.33 * 0.75))
    p = PLATE.resize((pw, ph), Image.LANCZOS)
    out = cut.copy(); out.alpha_composite(p, (x0 + w // 2 - pw // 2, y0 + h // 2 - ph // 2))
    return out, True

def paste_box(img, box):
    """manual: box = (x0,y0,x1,y1) as fractions of the final image"""
    W, H = img.size; x0, y0, x1, y1 = box
    w, h = int((x1 - x0) * W), int((y1 - y0) * H)
    p = PLATE.resize((w, h), Image.LANCZOS); out = img.convert('RGBA'); out.alpha_composite(p, (int(x0 * W), int(y0 * H)))
    return out.convert('RGB')
