# python3 dl.py <name> : download every image URL of <name>_urls.json, keep the big ones, make a contact sheet
import json, sys, os, hashlib, subprocess, concurrent.futures as cf
from PIL import Image, ImageDraw
n = sys.argv[1]; os.makedirs(n, exist_ok=True)
us = json.load(open(n + '_urls.json'))
def get(u):
    f = f'{n}/{hashlib.md5(u.encode()).hexdigest()[:10]}'
    subprocess.run(['curl', '-sSL', '-m', '60', '-A', 'Mozilla/5.0', '-o', f, u], capture_output=True)
    try:
        im = Image.open(f); w, h = im.size
        if w * h < 900 * 500: os.remove(f); return None
        ext = {'JPEG': 'jpg', 'PNG': 'png', 'WEBP': 'webp', 'AVIF': 'avif'}.get(im.format, 'img'); os.rename(f, f + '.' + ext)
        return (f + '.' + ext, w, h, im.mode, u)
    except Exception:
        if os.path.exists(f): os.remove(f)
        return None
with cf.ThreadPoolExecutor(12) as ex: res = [r for r in ex.map(get, us) if r]
# drop pixel-identical duplicates (same image at several sizes keeps the largest)
res.sort(key=lambda r: -r[1] * r[2]); keep = []; sigs = []
for r in res:
    s = Image.open(r[0]).convert('L').resize((16, 9)).tobytes()
    if any(sum(abs(a - b) for a, b in zip(s, t)) < 16 * 9 * 6 for t in sigs): os.remove(r[0]); continue
    sigs.append(s); keep.append(r)
json.dump(keep, open(n + '_keep.json', 'w'), indent=0)
W, H, c = 300, 190, 6; rows = (len(keep) + c - 1) // c
sh = Image.new('RGB', (W * c, (H + 14) * max(rows, 1)), (70, 70, 70)); d = ImageDraw.Draw(sh)
for i, r in enumerate(keep):
    im = Image.open(r[0]).convert('RGBA'); im.thumbnail((W, H)); x, y = (i % c) * W, (i // c) * (H + 14)
    sh.paste(im, (x, y), im); d.text((x + 2, y + H), f'{i} {r[1]}x{r[2]} {r[3]}', fill='white')
sh.save(n + '_sheet.jpg'); print(n, len(keep))
