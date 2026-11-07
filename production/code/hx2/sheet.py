# review sheets: footage mid-frame of every shot (prev/sNN.jpg) + graphics layer at the same time (prevo/t*.png)
import json, os, sys
from PIL import Image, ImageDraw
D = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
H2 = f'{D}/reg/hx2'; C = json.load(open(sys.argv[1])); out = sys.argv[2]; per = int(sys.argv[3]) if len(sys.argv) > 3 else 16
W, H = 360, 640; tiles = []
for i, s in enumerate(C['shots']):
    t = (round(s['t0'] * 60) + (round(s['t1'] * 60) - round(s['t0'] * 60)) // 2) / 60
    base = Image.open(f'{H2}/prev/s{i:02d}.jpg').convert('RGBA').resize((1080, 1920))
    ov = Image.open(f'{H2}/prevo/t{t:.2f}.png').convert('RGBA').resize((1080, 1920))
    base.alpha_composite(ov); im = base.convert('RGB').resize((W, H), Image.LANCZOS)
    d = ImageDraw.Draw(im); d.rectangle((0, 0, 92, 24), fill=(0, 0, 0)); d.text((6, 6), f'{i + 1:02d}  {t:.1f}s', fill=(255, 215, 140))
    tiles.append(im)
for p in range(0, len(tiles), per):
    chunk = tiles[p:p + per]; cols = 4; rows = (len(chunk) + cols - 1) // cols
    c = Image.new('RGB', (W * cols, H * rows), (18, 18, 18))
    for k, im in enumerate(chunk): c.paste(im, (W * (k % cols), H * (k // cols)))
    c.save(f'{out}_{p // per + 1}.jpg', quality=88); print(f'{out}_{p // per + 1}.jpg')
