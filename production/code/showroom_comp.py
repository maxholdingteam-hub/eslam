# Composite an official Accord cutout in front of the Max Holding showroom photo, matched to the scene's light.
#   python3 comp.py <bg> <car.png> <out> <cx> <bottom_y> <width> [night|day]
import sys, numpy as np
from PIL import Image, ImageFilter
bg_p, car_p, out_p = sys.argv[1:4]; cx, by, w = map(float, sys.argv[4:7]); mode = sys.argv[7] if len(sys.argv) > 7 else 'night'
bg = np.asarray(Image.open(bg_p).convert('RGB')).astype(np.float32) / 255
car = Image.open(car_p).convert('RGBA'); car = car.crop(car.getbbox())
s = w / car.width; car = car.resize((int(car.width * s), int(car.height * s)), Image.LANCZOS)
c = np.asarray(car).astype(np.float32) / 255; rgb, a = c[..., :3], c[..., 3:]
H, W = bg.shape[:2]; ch, cw = a.shape[:2]
x0, y0 = int(cx - cw / 2), int(by - ch)
# --- match the light: night = warm, dimmer, darker towards the sills; day = slightly warm, soft
yy = np.linspace(0, 1, ch)[:, None, None]
if mode == 'night':
    lum = rgb.mean(2, keepdims=True)
    rgb = rgb * np.array([1.0, 0.90, 0.74]) * 0.98 * (1.0 - 0.20 * yy)               # warm white balance, a touch darker low down
    rgb = (rgb - 0.45) * 1.12 + 0.45                                                  # keep the studio contrast
    rgb = rgb + np.clip(lum - 0.55, 0, 1) * np.array([0.50, 0.38, 0.12])              # speculars pick up the gold façade light
    top = np.clip(1 - yy * 2.4, 0, 1); rgb = rgb + top * np.array([0.09, 0.065, 0.02])
else:
    rgb = rgb * np.array([1.0, 0.97, 0.9]) * (1.0 - 0.12 * yy)
rgb = np.clip(rgb, 0, 1)
# --- ground shadow: a soft body shadow plus darker contact under the tyres (lowest 6% of the silhouette)
sh = np.zeros((H, W), np.float32)
body = Image.fromarray((a[..., 0] * 255).astype(np.uint8)).resize((cw, max(1, int(ch * 0.18))))
bm = np.asarray(body).astype(np.float32) / 255
sy = int(by - bm.shape[0] * 0.30)                    # shadow falls towards the camera (light is behind the car)
ys, xs = slice(max(0, sy), min(H, sy + bm.shape[0])), slice(max(0, x0), min(W, x0 + cw))
sh[ys, xs] = np.maximum(sh[ys, xs], bm[: ys.stop - ys.start, : xs.stop - xs.start])
sh = np.asarray(Image.fromarray((sh * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(w * 0.03))).astype(np.float32) / 255
low = np.zeros((H, W), np.float32); base = a[int(ch * 0.9):, :, 0]
ly = slice(y0 + int(ch * 0.9), y0 + ch); low[ly, xs] = base[: ly.stop - ly.start, : xs.stop - xs.start]
low = np.asarray(Image.fromarray((low * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(w * 0.008))).astype(np.float32) / 255
k = 0.82 if mode == 'night' else 0.5
out = bg * (1 - k * np.clip(sh * 0.85 + low, 0, 1))[..., None]
# --- soften the cutout to the photo's sharpness, add matching grain, comp
rgb_img = Image.fromarray((rgb * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.55))
rgb = np.asarray(rgb_img).astype(np.float32) / 255
a = np.asarray(Image.fromarray((a[..., 0] * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))).astype(np.float32)[..., None] / 255
rgb = np.clip(rgb + np.random.default_rng(1).normal(0, 0.012, rgb.shape), 0, 1)
yv, xv = slice(max(0, y0), min(H, y0 + ch)), slice(max(0, x0), min(W, x0 + cw))
sa = a[yv.start - y0: yv.stop - y0, xv.start - x0: xv.stop - x0]; sr = rgb[yv.start - y0: yv.stop - y0, xv.start - x0: xv.stop - x0]
out[yv, xv] = out[yv, xv] * (1 - sa) + sr * sa
Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).save(out_p, quality=95)
print('ok', out_p)
