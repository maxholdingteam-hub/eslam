# البر يناديك: build 2160x3840@60 video segments (AI shots, real stock, real Hilux driving from the earlier ad)
import subprocess, sys, os
OLD = '/tmp/claude-0/-home-user-eslam/0f5505b8-8bf4-57e7-9c4a-28493f9f4c64'
HX = '/home/user/eslam/MaxMotors_Toyota_Hilux_2027_Cinematic_Ad_4K_2160x3840.mp4'
AI = '/tmp/mmw/bar/ai'; OUT = '/tmp/mmw/bar/seg'
W, H = 2160, 3840
WARM = "colorbalance=rs=0.05:gs=0.0:bs=-0.06:rm=0.04:bm=-0.05,eq=saturation=1.05:contrast=1.03"
# green fields -> sun-dried tan: pull cyan out of greens, add magenta/red
DESERT = "selectivecolor=greens=-0.7 0.35 0.1 0:yellows=-0.35 0.12 0 0:cyans=-0.3 0.15 0 0," + WARM + ",eq=saturation=0.9"
CAP = f"crop=1728:3072:216:0,scale={W}:{H}:flags=lanczos"     # cut the old captions/watermark off the bottom
AIUP = f"scale={W}:{H}:flags=lanczos,unsharp=5:5:0.6,fps=60"
def zoom(d, z0=1.0, z1=1.06):
    return f"scale=w='trunc({W}*({z0}+({z1}-{z0})*t/{d})/2)*2':h='trunc({H}*({z0}+({z1}-{z0})*t/{d})/2)*2':eval=frame,crop={W}:{H}:'(iw-{W})/2':'(ih-{H})/2'"
def stock(src, ss, d, extra=''):
    return dict(src=src, ss=ss, d=d, vf=f"scale=-2:{H}:flags=lanczos,crop={W}:{H},fps=60," + zoom(d) + ',' + WARM + extra)
S = [  # name, source, in-point, duration, filter
    ('s01', stock(f'{OLD}/lib/stock/src/p_dunes/px11063830_2160.mp4', 2.0, 3.0)),
    ('s02', dict(src=f'{AI}/a02.mp4', ss=0, d=2.0, vf=AIUP + ',' + zoom(2.0, 1.0, 1.04))),
    ('s03', dict(src=f'{AI}/a03.mp4', ss=0.6, d=2.5, vf=AIUP)),
    ('s04', dict(src=f'{AI}/a04.mp4', ss=1.0, d=2.5, vf=AIUP)),
    ('s05a', dict(src=HX, ss=17.9, d=2.5, vf=CAP + ',fps=60,' + DESERT)),
    ('s05b', dict(src=HX, ss=46.0, d=1.5, vf=CAP + ',fps=60,' + DESERT)),
    ('s06', dict(src=HX, ss=24.3, d=2.0, vf=CAP + ',fps=60,' + DESERT)),
    ('s07', dict(src=HX, ss=26.85, d=2.0, vf=CAP + ',fps=60,' + DESERT)),
    ('s08', dict(src=HX, ss=28.1, d=3.0, vf=CAP + ',fps=60,' + DESERT)),
    ('s10', dict(src=f'{AI}/a10.mp4', ss=0.5, d=3.0, vf=AIUP)),
    ('s11', dict(src=f'{AI}/a11.mp4', ss=0.3, d=3.5, vf=AIUP)),
    ('s12', dict(src=f'{AI}/a12.mp4', ss=0.3, d=3.5, vf=AIUP)),
    ('s13', stock(f'{OLD}/lib/stock/src/p_stars/px5170522_2160.mp4', 2.0, 3.5)),
    ('s14', dict(src=f'{AI}/a14.mp4', ss=0.5, d=3.0, vf=AIUP)),
    ('s15', dict(src=HX, ss=16.6, d=1.2, vf=CAP + ',fps=60,' + DESERT + ',eq=brightness=-0.08:contrast=1.15')),
    ('s15b', dict(src=HX, ss=47.0, d=1.8, vf=CAP + ',fps=60,' + DESERT + ',eq=brightness=-0.05')),
]
only = set(sys.argv[1:])
for name, s in S:
    if only and name not in only: continue
    n = round(s['d'] * 60)
    r = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', str(s['ss']), '-i', s['src'], '-vf', s['vf'] + ',format=yuv420p', '-frames:v', str(n), '-an',
                        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '15', '-r', '60', f'{OUT}/{name}.mp4'], capture_output=True, text=True)
    print(name, n, 'FAIL ' + r.stderr[-400:] if r.returncode else 'ok', flush=True)
