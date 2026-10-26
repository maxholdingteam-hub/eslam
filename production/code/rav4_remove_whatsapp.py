# remove the WhatsApp pill from the RAV4 end card and lift "maxmotors.sa" into its place
import sys, numpy as np
W, H, F0 = 1080, 1920, 2150          # end card is on screen from frame 2150 (35.83 s)
Y0, Y1, X0, X1 = 1515, 1768, 240, 840  # pill + site text area
SY0, SY1, DY = 1678, 1752, -108        # site text rows, moved up by DY
n = W * H * 3; i = 0
inp, out = sys.stdin.buffer, sys.stdout.buffer
while True:
    b = inp.read(n)
    if len(b) < n: break
    f = np.frombuffer(b, np.uint8).reshape(H, W, 3)
    if i >= F0:
        f = f.astype(np.float32)
        top, bot = f[Y0 - 1, X0:X1], f[Y1, X0:X1]
        k = np.linspace(0, 1, Y1 - Y0)[:, None, None]
        plate = top * (1 - k) + bot * k
        site = f[SY0:SY1, X0:X1].copy(); bg = plate[SY0 - Y0:SY1 - Y0]
        a = np.clip((site.mean(2, keepdims=True) - bg.mean(2, keepdims=True)) / 60, 0, 1)
        f[Y0:Y1, X0:X1] = plate
        r0 = SY0 + DY - Y0; seg = f[Y0 + r0:Y0 + r0 + (SY1 - SY0), X0:X1]
        f[Y0 + r0:Y0 + r0 + (SY1 - SY0), X0:X1] = seg * (1 - a) + site * a
        f = np.clip(f + 0.5, 0, 255).astype(np.uint8)
    out.write(f.tobytes()); i += 1
