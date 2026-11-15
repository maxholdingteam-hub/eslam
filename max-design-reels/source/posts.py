"""Builds the 4:5 carousel slides (1080x1350) for each room from the generated images and the text overlays."""
from PIL import Image, ImageDraw
import os
HERE = os.path.dirname(os.path.abspath(__file__)); GEN = os.path.join(HERE, '..', 'gen'); OV = os.path.join(HERE, 'ov'); OUT = os.path.join(HERE, '..', 'out', 'posts')
W, H = 1080, 1350

def fit(path, w=W, h=H):
    im = Image.open(path).convert('RGB'); r = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))

def over(base, layer):
    base = base.convert('RGBA'); base.alpha_composite(Image.open(os.path.join(OV, layer)).convert('RGBA')); return base.convert('RGB')

for room in ('s1', 's2', 's3'):
    over(fit(f'{GEN}/{room}-sketch.png'), f'{room}-p1.png').save(f'{OUT}/{room}-1-sketch.jpg', quality=92)
    over(fit(f'{GEN}/{room}-final.png'), f'{room}-p2.png').save(f'{OUT}/{room}-2-finished.jpg', quality=92)
    # before | after split: the site on the right (read first in Arabic), the finished room on the left
    half = W // 2
    raw, fin = fit(f'{GEN}/{room}-raw.png'), fit(f'{GEN}/{room}-final.png')
    split = fin.copy(); split.paste(raw.crop((half, 0, W, H)), (half, 0))
    d = ImageDraw.Draw(split); d.rectangle((half - 2, 0, half + 2, H), fill=(217, 180, 107))
    over(split, 'p3.png').save(f'{OUT}/{room}-3-before-after.jpg', quality=92)
print(sorted(os.listdir(OUT)))
