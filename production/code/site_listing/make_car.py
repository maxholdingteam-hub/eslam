# one maxmotors.sa listing set: 4 exterior on the studio backdrop + up to 6 interior, numbered like the site
# usage: python3 make_car.py OUTDIR NAME ext:path[:scale] ... int:path ...
import sys, os, subprocess
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
out, name, items = sys.argv[1], sys.argv[2], sys.argv[3:]
os.makedirs(out, exist_ok=True)
W, H = 2246, 1588
for k, it in enumerate(items, 1):
    kind, rest = it.split(':', 1)
    parts = rest.split('@'); src = parts[0]; scale = parts[1] if len(parts) > 1 and parts[1] else '0.70'
    env = {**os.environ, 'U2NET_HOME': '/root/.rembg/models'}
    if len(parts) > 2: env['PLBOX'] = parts[2]
    elif 'PLBOX' in env: del env['PLBOX']
    dst = f'{out}/{name}_{k:02d}.jpg'
    if kind == 'ext':
        subprocess.run(['python3', f'{HERE}/listing.py', src, dst, scale], check=True, env=env, capture_output=True)
    else:  # interior: centre-crop to the site's 1123:794 frame
        im = Image.open(src).convert('RGB'); r = W / H
        if im.width / im.height > r: nw = int(im.height * r); im = im.crop(((im.width - nw) // 2, 0, (im.width + nw) // 2, im.height))
        else: nh = int(im.width / r); im = im.crop((0, (im.height - nh) // 2, im.width, (im.height + nh) // 2))
        im.resize((W, H), Image.LANCZOS).save(dst, quality=93)
    print(dst)
