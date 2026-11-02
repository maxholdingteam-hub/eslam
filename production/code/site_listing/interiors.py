# batch: interior photos -> site frame (1123:794 crop) with the window view replaced by the studio backdrop
# usage: python3 interiors.py OUT1.jpg=SRC1 OUT2.jpg=+SRC2 ...   (prefix SRC with + to swap the window view; close-ups stay as shot)
import sys, os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import win_mask
BG = Image.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backdrop.png')).convert('RGB')
W, H = 2246, 1588
def frame(im):
    r = W / H
    if im.width / im.height > r: nw = int(im.height * r); im = im.crop(((im.width - nw) // 2, 0, (im.width + nw) // 2, im.height))
    else: nh = int(im.width / r); im = im.crop((0, (im.height - nh) // 2, im.width, (im.height + nh) // 2))
    return im.resize((W, H), Image.LANCZOS)
for job in sys.argv[1:]:
    dst, src = job.split('=', 1); raw = not src.startswith('+'); src = src.lstrip('+')
    im = frame(Image.open(src).convert('RGB'))
    if not raw:
        small = im.copy(); small.thumbnail((1280, 1280))
        m = win_mask.mask(small)
        m = nd.binary_fill_holes(m)
        if m.mean() > 0.45: m[:] = False   # implausible: more than half the frame
        lab, n = nd.label(m)
        if n:
            sizes = nd.sum(m, lab, range(1, n + 1)); m = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > m.size * 0.002])
        a = Image.fromarray((m * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR).filter(ImageFilter.GaussianBlur(2))
        bg = BG.resize((W, H), Image.LANCZOS)
        im = Image.composite(bg, im, a)
    im.save(dst, quality=93); print(dst, 'raw' if raw else 'win')
