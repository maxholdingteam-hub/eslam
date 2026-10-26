# Composite an official Mazda cutout into a dusk photo of the Max Holding showroom.
#   python3 mz_comp.py <bg> <car.png> <out> <left_x> <bottom_y> <width>
# Dusk = soft blue sky fill + warm facade glow from behind: cool the paint, compress contrast,
# warm rim along the roofline, soft ambient-occlusion shadow (no hard sun), contact shadow at the tyres.
import sys, os, numpy as np, cv2
from PIL import Image
bg_p, car_p, out_p = sys.argv[1:4]; lx, by, w = map(float, sys.argv[4:7])
E = lambda k, d: float(os.environ.get(k, d))
bg = np.asarray(Image.open(bg_p).convert('RGB')).astype(np.float32) / 255
car = Image.open(car_p).convert('RGBA'); car = car.crop(car.getbbox())
s = w / car.width; car = car.resize((int(car.width * s), int(car.height * s)), Image.LANCZOS)
c = np.asarray(car).astype(np.float32) / 255; rgb, a = c[..., :3], c[..., 3:]
H, W = bg.shape[:2]; ch, cw = a.shape[:2]; x0, y0 = int(lx), int(by - ch)
yy = np.linspace(0, 1, ch)[:, None, None]
lum = rgb.mean(2, keepdims=True)
rgb = lum + (rgb - lum) * E('SAT', 0.85)                                      # dusk desaturates a little
rgb = rgb * np.array([E('WR', 0.93), E('WG', 0.96), E('WB', 1.04)]) * E('EXP', 0.80) * (1 - E('FALL', 0.22) * yy)
rgb = (rgb - 0.4) * E('CON', 0.92) + 0.4
# warm glow from the lit facade, strongest on the upper edges of the body (alpha top band)
al = a[..., 0]; top = np.zeros_like(al)
cols = np.argmax(al > 0.5, axis=0)
for x in range(cw):
    if al[:, x].max() > 0.5:
        t = cols[x]; top[t:t + int(ch * 0.12), x] = np.linspace(1, 0, min(int(ch * 0.12), ch - t))
top = cv2.GaussianBlur(top, (0, 0), ch * 0.01)[..., None]
rgb = rgb + top * np.array([0.16, 0.12, 0.05]) * E('RIM', 1.0)
rgb = np.clip(rgb, 0, 1)
# shadows: the ground line runs through the two lowest tyre contacts; everything between the body's
# lower edge and that line sits in the car's own shade (dark core), plus a wide soft occlusion around it
yb = np.array([np.max(np.nonzero(al[:, x] > 0.5)[0]) if al[:, x].max() > 0.5 else -1 for x in range(cw)])
valid = np.nonzero(yb >= 0)[0]
from scipy.signal import find_peaks
pk, _ = find_peaks(np.where(yb >= 0, yb, 0), prominence=ch * 0.03, distance=max(1, int(cw * 0.1)))
pk = [x for x in pk if yb[x] > ch * 0.75] or [valid[0] + np.argmax(yb[valid])]
pk = sorted(pk); fx, rx = pk[0], pk[-1]
gl = lambda x: np.interp(x, pk, [yb[i] for i in pk])
core = np.zeros((H, W), np.float32); amb = np.zeros((H, W), np.float32)
pad = int((rx - fx) * 0.08)
for x in range(max(valid[0], fx - pad), min(valid[-1], rx + pad) + 1):
    X = x0 + x
    if not 0 <= X < W or yb[x] < 0: continue
    g = gl(x); fade = min(1.0, (x - (fx - pad)) / max(1, pad * 2), ((rx + pad) - x) / max(1, pad * 2))
    t = int(y0 + min(yb[x], g) - ch * 0.01); bt = int(y0 + g + ch * E('DEPTH', 0.012))
    core[max(0, t):min(H, bt), X] = fade
    amb[max(0, int(y0 + g - ch * 0.03)):min(H, int(y0 + g + ch * 0.05)), X] = 1
core = cv2.GaussianBlur(core, (0, 0), w * 0.007)
amb = cv2.GaussianBlur(amb, (0, 0), w * 0.035)
out = bg * (1 - np.clip(E('SH', 0.78) * core + E('AMB', 0.35) * amb, 0, 0.88))[..., None]
# match the phone photo: a touch of softness and sensor noise
rgb = cv2.GaussianBlur(rgb, (0, 0), E('BLUR', 0.6)); a = cv2.GaussianBlur(a[..., 0], (0, 0), 0.8)[..., None]
rgb = np.clip(rgb + np.random.default_rng(3).normal(0, E('NOISE', 0.012), rgb.shape), 0, 1)
yv, xv = slice(max(0, y0), min(H, y0 + ch)), slice(max(0, x0), min(W, x0 + cw))
sa = a[yv.start - y0: yv.stop - y0, xv.start - x0: xv.stop - x0]; sr = rgb[yv.start - y0: yv.stop - y0, xv.start - x0: xv.stop - x0]
out[yv, xv] = out[yv, xv] * (1 - sa) + sr * sa
Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).save(out_p, quality=95)
print('ok', out_p, cw, ch)
