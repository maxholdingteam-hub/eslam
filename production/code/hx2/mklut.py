# desert grade LUTs (.cube 33^3): pull greens toward dry gold/olive, warm highlights, gentle S-curve
import numpy as np, colorsys, sys, os
N = 33
def make(name, green_to=38/360, gw=0.85, gsat=0.45, warm=0.06, con=0.10, sat=1.0, teal=0.0):
    g = np.linspace(0, 1, N); out = []
    for b in g:
        for gg in g:
            for r in g:
                h, s, v = colorsys.rgb_to_hsv(r, gg, b)
                hd = h * 360
                w = np.clip(1 - abs(hd - 110) / 70, 0, 1) ** 0.7 if s > 0.04 else 0      # greens 40..180 deg
                if w > 0:
                    h = (h + (green_to - h) * w * gw) % 1
                    s = s * (1 - gsat * w)
                s = min(1, s * sat)
                r2, g2, b2 = colorsys.hsv_to_rgb(h, s, v)
                # S-curve
                f = lambda x: x + con * (x - 0.5) * (1 - abs(2 * x - 1)) * 2 if True else x
                r2, g2, b2 = f(r2), f(g2), f(b2)
                lum = 0.3 * r2 + 0.59 * g2 + 0.11 * b2
                # warm highlights, slightly teal shadows
                r2 += warm * lum - teal * (1 - lum) * 0.5; b2 += -warm * 0.9 * lum + teal * (1 - lum); g2 += warm * 0.25 * lum
                out.append((min(1, max(0, r2)), min(1, max(0, g2)), min(1, max(0, b2))))
    with open(os.path.join(os.path.dirname(__file__), 'lut', name + '.cube'), 'w') as fo:
        fo.write(f'TITLE "{name}"\nLUT_3D_SIZE {N}\n'); fo.writelines('%.5f %.5f %.5f\n' % o for o in out)
make('desert')                                         # green landscapes -> dry gold
make('desert_strong', gw=0.95, gsat=0.6, warm=0.08)
make('warm', gw=0.0, gsat=0.0, warm=0.07, con=0.08)    # already-desert stock: just warm + contrast
make('night', gw=0.0, gsat=0.0, warm=-0.02, con=0.12, teal=0.05)
print('luts ok')
