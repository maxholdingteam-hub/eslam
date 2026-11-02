# maxmotors.sa listing image: car photo -> cutout -> black/gold studio backdrop with glossy reflection (2246x1588)
import sys, os, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageFilter
from rembg import remove, new_session
S = new_session('isnet-general-use')
src, dst = sys.argv[1], sys.argv[2]
W, H = 2246, 1588
bg = Image.open('' + __import__('os').path.join(__import__('os').path.dirname(__file__), 'backdrop.png') + '').convert('RGB').resize((W, H), Image.LANCZOS)
car = Image.open(src).convert('RGBA')
# official cutouts already carry alpha; real photos go through rembg
cut = car if np.asarray(car)[..., 3].min() < 10 else remove(car.convert('RGB'), session=S, post_process_mask=True)
# keep only the car: drop stray background blobs rembg left behind (largest connected piece + anything touching it)
from scipy import ndimage as _nd
_a = np.asarray(cut).copy(); _m = _a[..., 3] > 60
_lab, _n = _nd.label(_nd.binary_dilation(_m, iterations=6))
if _n > 1:
    _sz = _nd.sum(_m, _lab, range(1, _n + 1)); _keep = _lab == (1 + int(np.argmax(_sz)))  # largest
    _a[..., 3] = np.where(_keep, _a[..., 3], 0); cut = Image.fromarray(_a)
a = np.asarray(cut)[..., 3]; ys, xs = np.where(a > 110)
cut = cut.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
cw = int(W * float(sys.argv[3]) if len(sys.argv) > 3 else W * 0.70)
ch = int(cut.height * cw / cut.width)
if ch > H * 0.56: ch = int(H * 0.56); cw = int(cut.width * ch / cut.height)
cut = cut.resize((cw, ch), Image.LANCZOS)
import plate_swap, os as _o
if _o.environ.get('PLATE', '1') == '1' and not _o.environ.get('PLBOX'):
    cut, found = plate_swap.swap(cut); print('plate', found)
x0 = (W - cw) // 2; bottom = int(H * 0.775); y0 = bottom - ch
if _o.environ.get('PLBOX'):  # manual plate box (fractions of the final frame) -> paste onto the cutout so the reflection shows it too
    _b = [float(v) for v in _o.environ['PLBOX'].split(',')]
    _px = [int(_b[0] * W) - x0, int(_b[1] * H) - y0, int(_b[2] * W) - x0, int(_b[3] * H) - y0]
    _p = plate_swap.PLATE.resize((_px[2] - _px[0], _px[3] - _px[1]), Image.LANCZOS)
    _al = np.asarray(cut)[..., 3].copy(); cut.alpha_composite(_p, (_px[0], _px[1]))
    _c = np.asarray(cut).copy(); _c[..., 3] = np.maximum(_al, _c[..., 3]); cut = Image.fromarray(_c)
out = bg.copy().convert('RGBA')
# reflection
ref = cut.transpose(Image.FLIP_TOP_BOTTOM).filter(ImageFilter.GaussianBlur(2))
ra = np.asarray(ref).astype(np.float32); fade = np.clip(1 - np.arange(ch) / (ch * 0.55), 0, 1) ** 1.6
ra[..., 3] *= 0.30 * fade[:, None]; ra[..., :3] *= 0.85
out.alpha_composite(Image.fromarray(ra.astype(np.uint8)), (x0, bottom - 4))
# contact shadow
sh = Image.new('L', (W, H), 0); import PIL.ImageDraw as D
d = D.Draw(sh); d.ellipse((x0 + cw * 0.04, bottom - ch * 0.07, x0 + cw * 0.96, bottom + ch * 0.05), fill=200)
sh = sh.filter(ImageFilter.GaussianBlur(ch * 0.03))
out = Image.composite(Image.new('RGBA', (W, H), (0, 0, 0, 255)), out, sh.point(lambda v: int(v * 0.85)))
# car + faint warm rim from the backdrop glow
out.alpha_composite(cut, (x0, y0))
out = out.convert('RGB')
out.save(dst, quality=94)
print(dst, cw, ch)
