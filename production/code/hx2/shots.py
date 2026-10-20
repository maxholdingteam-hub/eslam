# 4K footage layer: every 'vid' shot of a film json -> graded 2160x3840 @60 segment, then one frame-exact concat
#   python3 shots.py <film.json> [only_idx,...]        -> reg/hx2/seg/sNN.mp4 + reg/hx2/base.mp4
# shot fields: src (path under D), ss (source in, s), t0/t1 (timeline, s), speed, fit 'full'|'band',
#   cx0/cx1 (crop centre x, 0..1 of source width), cy (0..1), z0/z1 (zoom ramp), mirror, lut (reg/hx2/lut/<name>.cube),
#   eq (extra ffmpeg filter string), fx ['punch'|'whipin'|'whipout'] (in-camera transitions), fz (band width factor), by (band centre y in 1920-space), mask [[x,y,w,h,t0,t1],...] (blur boxes, source px)
import json, os, subprocess, sys
D = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
H2 = f'{D}/reg/hx2'; W, HH, FPS = 2160, 3840, 60
PREV = bool(os.environ.get('PREVIEW')); C = json.load(open(sys.argv[1])); only = set(map(int, sys.argv[2].split(','))) if len(sys.argv) > 2 else None
os.makedirs(f'{H2}/seg', exist_ok=True)


def probe(p):
    o = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout.strip().split(',')
    return int(o[0]), int(o[1])


def frames(t0, t1):
    return round(t1 * FPS) - round(t0 * FPS)


def build(i, s):
    src = f"{D}/{s['src']}"; sw, sh = probe(src); n = frames(s['t0'], s['t1']); dur = n / FPS
    sp = s.get('speed', 1.0); z0, z1 = s.get('z0', 1.0), s.get('z1', s.get('z0', 1.0) * 1.05)
    ease = f"(0.5-0.5*cos(PI*min(t/{dur:.4f},1)))"
    Z = f"({z0}+({z1}-{z0})*{ease})"
    fx = s.get('fx', [])   # in-camera transitions: 'punch' (zoom punch-in), 'whipin'/'whipout' (horizontal motion-blur whip at the head/tail)
    if 'punch' in fx: Z = f"({Z}*(1+0.22*pow(max(0,1-t/0.28),2)))"
    pre = [f"setpts=(PTS-STARTPTS)/{sp}", f"fps={FPS}"]
    if s.get('mirror'): pre.append('hflip')
    for k, (mx, my, mw, mh, a, b) in enumerate(s.get('mask', [])):   # soft blur box over a plate/badge (source px, active a..b s of the shot)
        pre.append(f"split[m{k}a][m{k}b];[m{k}b]crop={mw}:{mh}:{mx}:{my},boxblur=24:3:10:3[m{k}c];[m{k}a][m{k}c]overlay={mx}:{my}:enable='between(t,{a},{b})'")
    lut = s.get('lut')
    post = ([f"lut3d={H2}/lut/{lut}.cube"] if lut else []) + ([s['eq']] if s.get('eq') else [])
    if 'punch' in fx: post.append("gblur=sigma=14:enable='lt(t,0.07)'")
    if 'whipin' in fx: post += ["avgblur=sizeX=60:sizeY=1:enable='lt(t,0.05)'", "avgblur=sizeX=28:sizeY=1:enable='between(t,0.05,0.1)'"]
    if 'whipout' in fx: post += [f"avgblur=sizeX=28:sizeY=1:enable='between(t,{dur - 0.1:.3f},{dur - 0.05:.3f})'", f"avgblur=sizeX=60:sizeY=1:enable='gt(t,{dur - 0.05:.3f})'"]
    if s.get('fit', 'full') == 'full':
        ch = sh; cw = int(sh * 9 / 16) // 2 * 2
        cx0, cx1 = s.get('cx0', 0.5), s.get('cx1', s.get('cx0', 0.5))
        X = f"max(0,min({sw - cw},({cx0}+({cx1}-{cx0})*{ease})*{sw}-{cw}/2))"
        cy = s.get('cy', 0.5)
        chain = pre + [f"crop={cw}:{ch}:'{X}':0",
                       f"scale=w='trunc({W}*{Z}/2)*2':h='trunc({HH}*{Z}/2)*2':eval=frame:flags=lanczos",
                       f"crop={W}:{HH}:'(iw-{W})/2':'(ih-{HH})*{cy}'"] + post
        vf = ','.join(chain)
    else:   # cinematic band: native-width 16:9 over a blurred, darkened copy
        fz = s.get('fz', 1.0); bw = int(W * fz) // 2 * 2; bh = int(bw * sh / sw) // 2 * 2; by = s.get('by', 960) * 2
        fg = f"scale=w='trunc({bw}*{Z}/2)*2':h='trunc({bh}*{Z}/2)*2':eval=frame:flags=lanczos,crop={min(bw, W)}:{bh}:'(iw-{min(bw, W)})/2':'(ih-{bh})/2'"
        vf = (','.join(pre) + f",split[a][b];[b]scale=540:960:force_original_aspect_ratio=increase,crop=540:960,boxblur=18:2,eq=brightness=-0.22:saturation=0.8,scale={W}:{HH}[bg];"
              f"[a]{fg}[fg];[bg][fg]overlay=(W-w)/2:{by}-h/2" + (',' + ','.join(post) if post else ''))
    out = f'{H2}/seg/s{i:02d}.mp4'
    cmd = ['nice', 'ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', str(s.get('ss', 0)), '-i', src, '-filter_complex', f'[0:v]{vf}[v]', '-map', '[v]', '-frames:v', str(n),
           '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '13', '-pix_fmt', 'yuv420p', '-r', str(FPS), out]
    if PREV:   # one frame from the middle of the shot, 1080x1920 jpg, for review sheets
        os.makedirs(f'{H2}/prev', exist_ok=True); out = f'{H2}/prev/s{i:02d}.jpg'
        cmd = ['nice', 'ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', str(s.get('ss', 0) + n / 2 / FPS * sp), '-i', src, '-filter_complex', f'[0:v]{vf},scale=1080:1920[v]', '-map', '[v]', '-frames:v', '1', '-q:v', '3', out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print('FAIL', i, r.stderr[-1500:]); sys.exit(1)
    print(f's{i:02d} {n}f {s["src"].split("/")[-1]} @{s.get("ss", 0)}', flush=True)


vids = [(i, s) for i, s in enumerate(C['shots']) if s.get('kind') == 'vid']
for i, s in vids:
    if only is None or i in only: build(i, s)
if PREV or os.environ.get('NOCONCAT'): sys.exit(0)
# frame-exact concat: shots must tile the timeline
with open(f'{H2}/seg/list.txt', 'w') as f:
    for i, s in vids: f.write(f"file 's{i:02d}.mp4'\n")
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{H2}/seg/list.txt', '-c', 'copy', f'{H2}/base.mp4'], check=True)
print('base', subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', f'{H2}/base.mp4'], capture_output=True, text=True).stdout.strip(), 'frames')
