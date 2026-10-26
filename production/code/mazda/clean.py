# remove the parked car (left edge) from each showroom photo at half resolution: rembg finds it, LaMa fills it
import numpy as np, cv2, sys
from PIL import Image
from rembg import remove, new_session
from simple_lama_inpainting import SimpleLama
s = new_session('isnet-general-use'); lama = SimpleLama()
# car boxes at half-res (2142x2856), read off the previews
box = {'IMG_4567': (0, 1480, 900, 2200), 'IMG_4568': (0, 1420, 960, 2050), 'IMG_4569': (0, 1450, 860, 2070)}
for k, (x0, y0, x1, y1) in box.items():
    im = Image.open(k + '.jpg').convert('RGB'); im = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
    a = np.array(im); crop = im.crop((x0, y0, x1, y1))
    al = np.array(remove(crop, session=s))[..., 3]
    n, lab, st, _ = cv2.connectedComponentsWithStats((al > 60).astype(np.uint8)); kk = 1 + np.argmax(st[1:, 4])
    m = np.zeros(a.shape[:2], np.uint8); m[y0:y1, x0:x1] = (lab == kk).astype(np.uint8) * 255
    # include the dark shadow band under the car
    ys, xs = np.where(m > 0); bot = ys.max(); m[bot - 40:bot + 45, xs.min():xs.max()] = 255
    m = cv2.dilate(m, np.ones((31, 31), np.uint8))
    X0, Y0, X1, Y1 = 0, max(0, y0 - 350), min(a.shape[1], x1 + 450), min(a.shape[0], y1 + 300)
    out = lama(Image.fromarray(a[Y0:Y1, X0:X1]), Image.fromarray(m[Y0:Y1, X0:X1]))
    out = np.array(out)[:Y1 - Y0, :X1 - X0]
    a[Y0:Y1, X0:X1] = np.where(m[Y0:Y1, X0:X1, None] > 0, out, a[Y0:Y1, X0:X1])
    Image.fromarray(a).save(k + '_clean.png'); Image.fromarray(m).save(k + '_mask.png'); print(k, im.size)
