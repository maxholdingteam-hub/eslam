import numpy as np, os, sys
from PIL import Image
from rembg import remove, new_session
from scipy.ndimage import binary_dilation
from simple_lama_inpainting import SimpleLama
S = new_session('isnet-general-use'); L = SimpleLama()
for i in map(int, sys.argv[1:]):
    im = Image.open(f'dl/{i}.jpg').convert('RGB')
    m = np.asarray(remove(im, session=S, only_mask=True)) > 30
    ys, xs = np.where(m); bot = ys.max()
    ref = np.zeros_like(m); src = m[max(0, 2 * bot - m.shape[0]):bot][::-1]; ref[bot:bot + len(src)] = src
    # reflections are blurred/wider: dilate more
    mm = binary_dilation(m, iterations=14) | binary_dilation(ref, iterations=30)
    out = L(im, Image.fromarray((mm * 255).astype(np.uint8)))
    out.crop((0, 0) + im.size).save(f'bg_lama_{i}.png'); print(i)
