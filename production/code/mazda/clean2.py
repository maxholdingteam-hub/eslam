# structure from a low-res LaMa fill, fine texture borrowed (high-pass) from clean ground in the same rows
import numpy as np, cv2
from PIL import Image
from simple_lama_inpainting import SimpleLama
lama = SimpleLama()
for k in ['IMG_4567', 'IMG_4568', 'IMG_4569']:
    im = Image.open(k + '.jpg').convert('RGB'); im = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
    a = np.array(im).astype(np.float32); m = np.array(Image.open(k + '_mask.png')) > 0
    ys, xs = np.where(m); Y0, Y1, X0, X1 = max(0, ys.min() - 300), min(a.shape[0], ys.max() + 300), 0, min(a.shape[1], xs.max() + 400)
    sub = a[Y0:Y1, X0:X1]; ms = m[Y0:Y1, X0:X1]
    f = 3; h, w = sub.shape[:2]; sm = (w // f, h // f)
    lo = lama(Image.fromarray(cv2.resize(sub, sm, interpolation=cv2.INTER_AREA).astype(np.uint8)), Image.fromarray((cv2.resize(ms.astype(np.uint8), sm, interpolation=cv2.INTER_NEAREST) * 255)))
    lo = cv2.resize(np.array(lo)[:sm[1], :sm[0]].astype(np.float32), (w, h), interpolation=cv2.INTER_CUBIC)
    # donor texture: same rows, shifted right past the mask
    sh = xs.max() - xs.min() + 60
    donor = a[Y0:Y1, X0 + sh:X1 + sh] if X1 + sh <= a.shape[1] else np.concatenate([a[Y0:Y1, X0 + sh:], a[Y0:Y1, :X1 + sh - a.shape[1]]], 1)
    hp = donor - cv2.GaussianBlur(donor, (0, 0), 3)
    fill = lo + hp * 0.9
    soft = cv2.GaussianBlur(ms.astype(np.float32), (0, 0), 6)[..., None]
    a[Y0:Y1, X0:X1] = sub * (1 - soft) + fill * soft
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(k + '_clean.png'); print(k)
