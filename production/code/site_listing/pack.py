# pack.py CAR_DIR : site-size compressed copies (1123x794, q72) + data sheet, zipped as CAR_DIR_مضغوط.zip
import sys, glob, os, shutil, subprocess
from PIL import Image
c = sys.argv[1].rstrip('/'); out = c + '_مضغوط'
shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
R = 1123 / 794  # site frame ratio; images are center-cropped to it so nothing gets squeezed

def fit(im):
    w, h = im.size
    if w / h > R + 0.01:
        nw = int(h * R); l = (w - nw) // 2; im = im.crop((l, 0, l + nw, h))
    elif w / h < R - 0.01:
        nh = int(w / R); t = (h - nh) // 2; im = im.crop((0, t, w, t + nh))
    return im

for f in sorted(glob.glob(f'{c}/*.jpg')):
    im = Image.open(f).convert('RGB')
    if abs(im.size[0] / im.size[1] - R) > 0.01:
        im = fit(im).resize((2336, 1651), Image.LANCZOS); im.save(f, quality=93)
        print('cropped to site ratio:', f)
    im.resize((1123, 794), Image.LANCZOS).save(f'{out}/{os.path.basename(f)}', quality=72, optimize=True, progressive=True, subsampling=2)
for t in glob.glob(f'{c}/*.txt'): shutil.copy(t, out)
if os.path.exists(out + '.zip'): os.remove(out + '.zip')
subprocess.run(f'cd "{out}" && zip -q -r "../{os.path.basename(out)}.zip" .', shell=True, check=True)
print(out + '.zip', sum(os.path.getsize(f) for f in glob.glob(out + '/*')) // 1024, 'KB')
