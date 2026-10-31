"""Build the Max Motors reel: cut speech, grade, captions, logo motion, end card, music."""
import subprocess, os, json
C = '/home/user/eslam/montage/clips/'
W = '/tmp/mm/'
OUT = '/home/user/eslam/montage/'
FONTS = [p for p in __import__('glob').glob('/root/.claude/plugins/synced/*/majed-video/video-ad-editor/motion/fonts')][0]
F = {'21': C+'92e331fe-IMG_0121.MOV', '22': C+'f0b432a7-IMG_0122.MOV',
     '23': C+'b834d882-IMG_0123.MOV', '16': C+'cb469a1b-IMG_0116.MOV'}
INTRO, ENDC = 1.3, 3.2
# (audio clip, a_in, a_out, video clip, v_in, captions [(rel_start, text, gold)])
P = [
 ('23', 0.03, 3.24, '21', 0.45, [(0, 'تم اليوم تسليم', 0), (1.41, 'سيارة أكسنت', 1), (2.41, 'بحمد الله', 0)]),
 ('23', 3.76, 6.04, '16', 0.45, [(0, 'من شركة', 0), (0.68, 'ماكس موتورز', 1), (1.78, 'للسيارات', 0)]),
 ('21', 3.50, 5.20, '21', 3.50, [(0, 'وتم شحنها الحين', 0), (1.15, 'للعميل', 1)]),
 ('23', 6.70, 7.88, '23', 6.70, [(0, 'خدمتنا الأونلاين', 1)]),
 ('23', 8.30, 10.42, '23', 7.88, [(0, 'توصل لك سيارتك', 0), (1.33, 'لباب بيتك', 1)]),
 ('22', 0.10, 2.68, '22', 0.10, [(0, 'ماكس موتورز', 1), (0.92, 'تخدمك وين ما كنت', 0)]),
]
GRADE = ("hqdn3d=1.5:1.5:4:4,eq=contrast=1.12:brightness=0.03:saturation=1.22:gamma=1.06,"
         "curves=m='0/0 0.25/0.22 0.75/0.80 1/1',unsharp=5:5:0.5,vignette=PI/5")
def sh(c): subprocess.run(c, shell=True, check=True)

# 1) pieces: graded video with slow push-in + cleaned voice
segs, t, caps = [], INTRO, []
for i, (ac, a0, a1, vc, v0, cp) in enumerate(P):
    d = a1 - a0; out = f'{W}p{i}.mp4'
    z = f"scale=w='1080*(1.04+0.04*t/{d})':h=-2:eval=frame,crop=1080:1920"
    sh(f"ffmpeg -v error -y -ss {v0} -t {d} -i {F[vc]} -ss {a0} -t {d} -i {F[ac]} "
       f"-filter_complex \"[0:v]fps=30,scale=1080:1920,setsar=1,{GRADE},{z},format=yuv420p[v];"
       f"[1:a]aresample=48000,highpass=f=90,afftdn=nf=-32,acompressor=threshold=-22dB:ratio=3:attack=5:release=120,"
       f"equalizer=f=3200:t=q:w=1:g=2.5,afade=t=in:d=0.02,afade=t=out:st={d-0.03}:d=0.03,"
       f"aformat=channel_layouts=stereo[a]\" -map [v] -map [a] -c:v libx264 -crf 15 -preset fast -c:a pcm_s16le -t {d} {out}")
    for k, (rs, txt, g) in enumerate(cp):
        re = cp[k+1][0] if k+1 < len(cp) else d
        caps.append((t+rs, t+re, txt, g))
    segs.append(out); t += d
BODY_END = t; T = t + ENDC
print('body ends', BODY_END, 'total', T)

# 2) intro (black + logo) and end card (blurred last frame)
sh(f"ffmpeg -v error -y -f lavfi -i color=c=0x050505:s=1080x1920:r=30:d={INTRO} -f lavfi -i anullsrc=r=48000:cl=stereo "
   f"-t {INTRO} -c:v libx264 -crf 15 -pix_fmt yuv420p -c:a pcm_s16le {W}intro.mp4")
last = segs[-1]
sh(f"ffmpeg -v error -y -sseof -0.1 -i {last} -frames:v 1 {W}lastf.png")
sh(f"ffmpeg -v error -y -loop 1 -framerate 30 -t {ENDC} -i {W}lastf.png -f lavfi -i anullsrc=r=48000:cl=stereo "
   f"-filter_complex \"[0:v]scale=1080:1920,gblur=sigma=28,eq=brightness=-0.32:saturation=0.6,format=yuv420p[v]\" "
   f"-map [v] -map 1:a -t {ENDC} -c:v libx264 -crf 15 -c:a pcm_s16le {W}end.mp4")
with open(W+'list.txt', 'w') as f:
    for s in [W+'intro.mp4'] + segs + [W+'end.mp4']: f.write(f"file '{s}'\n")
sh(f"ffmpeg -v error -y -f concat -safe 0 -i {W}list.txt -c:v libx264 -crf 15 -preset fast -c:a pcm_s16le {W}base.mov")

# 3) ASS: captions + end-card text
def ts(x):
    h = int(x//3600); m = int(x % 3600//60); s = x % 60
    return f"{h}:{m:02d}:{s:05.2f}"
GOLD, WHITE = '&H2BB5E6&', '&HFFFFFF&'   # BGR: #E6B52B
ass = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1920", "WrapStyle: 2", "",
       "[V4+ Styles]",
       "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
       "Style: Cap,Tajawal Black,96,&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,1,0,0,0,100,100,0,0,1,6,4,5,60,60,0,0",
       "Style: Small,Tajawal,46,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,2,2,5,60,60,0,0",
       "Style: Num,Inter,128,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,1,0,0,0,100,100,4,0,1,3,4,5,60,60,0,0",
       "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
for s, e, txt, g in caps:
    col = GOLD if g else WHITE
    ass.append(f"Dialogue: 1,{ts(s)},{ts(e)},Cap,,0,0,0,,{{\\pos(540,1340)\\c{col}\\fscx70\\fscy70\\alpha&H60&"
               f"\\t(0,110,\\fscx108\\fscy108\\alpha&H00&)\\t(110,200,\\fscx100\\fscy100)}}{txt}")
E = BODY_END
ev = [  # end card text
 (E+0.55, T, 'Small', f"\\pos(540,1110)\\c{GOLD}\\fad(250,0)\\fscx90\\t(0,300,\\fscx100)", 'الرقم الموحد'),
 (E+0.70, T, 'Num', "\\pos(540,1230)\\fad(200,0)\\fscx60\\fscy60\\t(0,220,\\fscx104\\fscy104)\\t(220,320,\\fscx100\\fscy100)", '920018915'),
 (E+1.00, T, 'Small', "\\pos(540,1380)\\fad(300,0)\\fs40", 'maxmotors.sa'),
 (E+1.25, T, 'Small', f"\\pos(540,1480)\\fad(300,0)\\c{GOLD}\\fs50", 'تخدمك وين ما كنت'),
]
for s, e, st, tag, txt in ev:
    ass.append(f"Dialogue: 2,{ts(s)},{ts(e)},{st},,0,0,0,,{{{tag}}}{txt}")
# gold lines framing the number
ass.append(f"Dialogue: 0,{ts(E+0.6)},{ts(T)},Small,,0,0,0,,{{\\an7\\pos(0,0)\\c{GOLD}\\bord0\\shad0\\p1\\fad(200,0)"
           f"\\clip(240,1310,840,1316)\\t(0,500,\\clip(240,1310,840,1316))}}m 240 1310 l 840 1310 840 1316 240 1316{{\\p0}}")
open(W+'caps.ass', 'w').write('\n'.join(ass) + '\n')

# 4) overlays: intro logo (scale-in + glow), corner bug, end-card logo
LI = W+'logo_full.png'; LM = W+'logo_m.png'
fc = (
 f"[0:v]ass={W}caps.ass:fontsdir={FONTS}[b];"
 # intro logo: 0.15s→ scales from 60% to 100%, fades, then flashes out
 f"[1:v]format=rgba,scale=w='760*min(1,0.6+0.4*min(1,t/0.55))':h=-1:eval=frame[li];"
 f"[b][li]overlay=x='(W-w)/2':y='(H-h)/2-80':enable='between(t,0.1,{INTRO})':eval=frame[b1];"
 # corner bug
 f"[2:v]format=rgba,scale=150:-1,colorchannelmixer=aa=0.85[lb];"
 f"[b1][lb]overlay=x=W-w-50:y=90:enable='between(t,{INTRO},{BODY_END})'[b2];"
 # end-card logo scale-in
 f"[3:v]format=rgba,scale=w='620*min(1,0.55+0.45*min(1,(t-{E})/0.5))':h=-1:eval=frame[le];"
 f"[b2][le]overlay=x='(W-w)/2':y='560-h/2':enable='gte(t,{E+0.05})':eval=frame,"
 f"fade=t=in:st=0:d=0.25,fade=t=out:st={T-0.35}:d=0.35[v]"
)
sh(f"ffmpeg -v error -y -i {W}base.mov -loop 1 -framerate 30 -i {LI} -loop 1 -framerate 30 -i {LM} -loop 1 -framerate 30 -i {LI} "
   f"-filter_complex \"{fc.replace(chr(10),'')}\" -map [v] -map 0:a -t {T} -c:v libx264 -crf 16 -preset medium -pix_fmt yuv420p "
   f"-c:a aac -b:a 192k -movflags +faststart {W}reel_nomusic.mp4")

# 5) music + master
sh(f"python3 {W}music.py {W}bg-audio.wav {T} {INTRO} {E}")
json.dump({'T': T, 'E': E, 'caps': caps}, open(W+'timeline.json', 'w'), ensure_ascii=False, indent=1)
print('done', T)
