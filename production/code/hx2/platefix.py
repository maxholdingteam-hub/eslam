# replace a (white) number plate with a black KSA-style "HILUX" plate, tracked per frame by its white quad
#   python3 platefix.py SRC SS DUR X0 Y0 X1 Y1 OUT     (initial plate box in source px at SS)
import subprocess, sys, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
src, ss, dur = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]); x0, y0, x1, y1 = map(int, sys.argv[4:8]); out = sys.argv[8]
W, H = map(int, subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout.strip().split(','))
fps = 25
dec = subprocess.Popen(['ffmpeg', '-nostdin', '-v', 'error', '-ss', str(ss), '-i', src, '-t', str(dur), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(fps), '-i', '-',
                        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '12', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
# replacement plate (black, thin silver rim, white HILUX), 4.7:1 like the KSA press photos
PW, PH = 940, 200
pl = Image.new('RGB', (PW, PH), (12, 12, 13)); d = ImageDraw.Draw(pl)
d.rounded_rectangle((3, 3, PW - 4, PH - 4), 22, outline=(150, 150, 152), width=6)
f = ImageFont.truetype('/tmp/claude-0/-home-user-eslam/0f5505b8-8bf4-57e7-9c4a-28493f9f4c64/reg/web/fonts/Michroma.woff2' if False else '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 120)
tw = d.textlength('HILUX', font=f); d.text(((PW - tw) / 2, 28), 'HILUX', font=f, fill=(236, 236, 236))
plate = np.asarray(pl)
box = np.array([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], np.float32); prev = box.copy(); n = 0


def order(p):
    s = p.sum(1); dd = np.diff(p, axis=1)[:, 0]
    return np.array([p[np.argmin(s)], p[np.argmin(dd)], p[np.argmax(s)], p[np.argmax(dd)]], np.float32)


tpl = None; scl = 1.0
while True:
    raw = dec.stdout.read(W * H * 3)
    if len(raw) < W * H * 3: break
    fr = np.frombuffer(raw, np.uint8).reshape(H, W, 3).copy(); g = cv2.cvtColor(fr, cv2.COLOR_RGB2GRAY)
    if tpl is None: tpl = g[y0:y1, x0:x1].astype(np.float32); tw0, th0 = x1 - x0, y1 - y0; mc = np.array([(x0 + x1) / 2, (y0 + y1) / 2])
    # 1) template match (translation + scale) near the last centre
    best = (-2, mc, scl)
    for sc in (scl * 0.95, scl, scl * 1.05):
        tw, th = max(8, int(tw0 * sc)), max(6, int(th0 * sc)); t = cv2.resize(tpl, (tw, th)); R = int(max(tw, th) * 0.9)
        ax, ay = int(max(0, mc[0] - tw / 2 - R)), int(max(0, mc[1] - th / 2 - R)); bx, by = int(min(W, mc[0] + tw / 2 + R)), int(min(H, mc[1] + th / 2 + R))
        win = g[ay:by, ax:bx].astype(np.float32)
        if win.shape[0] <= th or win.shape[1] <= tw: continue
        r = cv2.matchTemplate(win, t, cv2.TM_CCOEFF_NORMED); _, mv, _, ml = cv2.minMaxLoc(r)
        if mv > best[0]: best = (mv, np.array([ax + ml[0] + tw / 2, ay + ml[1] + th / 2]), sc)
    mv, mc, scl = best; tw, th = tw0 * scl, th0 * scl
    # 2) refine to the white quad inside the matched box (perspective)
    ax, ay = int(max(0, mc[0] - tw * 0.7)), int(max(0, mc[1] - th * 0.9)); bx, by = int(min(W, mc[0] + tw * 0.7)), int(min(H, mc[1] + th * 0.9))
    hsv = cv2.cvtColor(fr[ay:by, ax:bx], cv2.COLOR_RGB2HSV); m = ((hsv[..., 2] > 140) & (hsv[..., 1] < 80)).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)); cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    q = None
    if cs:
        k = max(cs, key=cv2.contourArea)
        if 0.45 * tw * th < cv2.contourArea(k) < 1.6 * tw * th:
            qq = order(cv2.boxPoints(cv2.minAreaRect(k)) + [ax, ay])
            if np.linalg.norm(qq.mean(0) - mc) < 0.3 * tw: q = qq
    if q is None: q = prev - prev.mean(0) + mc       # keep last shape, follow the match
    prev = 0.4 * prev + 0.6 * q if n else q
    n += 1
    # grow 7 % so no white rim survives, then warp the black plate in with a soft edge
    cen = prev.mean(0); qq = (prev - cen) * 1.07 + cen
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [PW, 0], [PW, PH], [0, PH]]), qq.astype(np.float32))
    warped = cv2.warpPerspective(plate, M, (W, H)); mask = cv2.warpPerspective(np.full((PH, PW), 255, np.uint8), M, (W, H))
    mask = cv2.GaussianBlur(mask, (5, 5), 0).astype(np.float32)[..., None] / 255
    fr = (fr * (1 - mask) + warped * mask).astype(np.uint8)
    enc.stdin.write(fr.tobytes())
enc.stdin.close(); enc.wait(); print('platefix', out, n, 'frames, last quad', prev.round(0).tolist())
