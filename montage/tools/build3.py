"""Max Motors reel v3 — clean & classy: natural speech cuts with breathing room, no FX, calm captions,
soft logo intro, dip-to-black end card. Output without music: reel3_nomusic.mp4"""
import subprocess, glob
C = '/home/user/eslam/montage/clips/'
W = '/tmp/mm/'
FONTS = glob.glob('/root/.claude/plugins/synced/*/majed-video/video-ad-editor/motion/fonts')[0]
F = {'21': C+'92e331fe-IMG_0121.MOV', '22': C+'f0b432a7-IMG_0122.MOV',
     '23': C+'b834d882-IMG_0123.MOV', '16': W+'16_stab.mp4'}
LEN = {'21': 6.0, '22': 7.37, '23': 10.8, '16': 3.27}
INTRO, ENDC, PAD_IN, PAD_OUT = 1.6, 3.6, 0.08, 0.14
# audio clip, speech in/out, video clip, video in, caption chunks [(rel_start, text, gold)]
P = [
 ('23', 0.03, 3.22, '21', 0.40, [(0, 'تم اليوم تسليم', 0), (1.41, 'سيارة أكسنت', 0), (2.41, 'بحمد الله', 0)]),
 ('23', 3.78, 6.02, '16', 0.30, [(0, 'من شركة', 0), (0.66, 'ماكس موتورز', 1), (1.76, 'للسيارات', 0)]),
 ('21', 3.52, 5.18, '21', 3.40, [(0, 'وتم شحنها الحين', 0), (1.13, 'للعميل', 0)]),
 ('23', 6.72, 7.84, '23', 6.60, [(0, 'خدمتنا الأونلاين', 0)]),
 ('23', 8.33, 10.38, '22', 3.40, [(0, 'توصل لك سيارتك', 0), (1.31, 'لباب بيتك', 0)]),
 ('22', 0.12, 3.05, '22', 0.10, [(0, 'ماكس موتورز', 1), (0.92, 'تخدمك وين ما كنت', 0)]),
]
GRADE = ("hqdn3d=1.5:1.5:4:4,eq=contrast=1.08:brightness=0.025:saturation=1.12:gamma=1.04,"
         "unsharp=5:5:0.4,vignette=PI/6")
def sh(c): subprocess.run(c, shell=True, check=True)

pieces, caps, t = [], [], INTRO
for i, (ac, s0, s1, vc, v0, cp) in enumerate(P):
    a0 = max(0, s0 - PAD_IN); a1 = s1 + PAD_OUT; d = a1 - a0
    v0 = max(0.05, min(v0, LEN[vc] - d - 0.1))
    fin = "fade=t=in:st=0:d=0.3," if i == 0 else ""
    fout = f"fade=t=out:st={d-0.3}:d=0.3," if i == len(P)-1 else ""
    z = f"scale=w='1080*(1.03+0.03*t/{d})':h=-2:eval=frame,crop=1080:1920"
    sh(f"ffmpeg -v error -y -ss {v0} -t {d+0.1} -i {F[vc]} -ss {a0} -t {d} -i {F[ac]} "
       f"-filter_complex \"[0:v]fps=30,scale=1080:1920,setsar=1,{GRADE},{z},{fin}{fout}format=yuv420p[v];"
       f"[1:a]aresample=48000,highpass=f=80,afftdn=nr=8:nf=-40,acompressor=threshold=-20dB:ratio=2:attack=10:release=200,"
       f"afade=t=in:d=0.06,afade=t=out:st={d-0.08}:d=0.08,aformat=channel_layouts=stereo[a]\" "
       f"-map [v] -map [a] -t {d} -c:v libx264 -crf 15 -preset fast -c:a pcm_s16le {W}q{i}.mov")
    for k, (rs, txt, g) in enumerate(cp):
        re_ = cp[k+1][0] + PAD_IN if k+1 < len(cp) else d - 0.05
        caps.append((t + rs + PAD_IN - 0.04, t + re_ - 0.04, txt, g))
    pieces.append(f'{W}q{i}.mov'); t += d
E = t; T = E + ENDC
print('end card at', round(E, 2), 'total', round(T, 2))

sh(f"ffmpeg -v error -y -f lavfi -i color=c=black:s=1080x1920:r=30:d={INTRO} -f lavfi -i anullsrc=r=48000:cl=stereo "
   f"-t {INTRO} -c:v libx264 -crf 15 -pix_fmt yuv420p -c:a pcm_s16le {W}intro3.mov")
sh(f"ffmpeg -v error -y -ss 0.5 -i {pieces[-1]} -frames:v 1 {W}lastf3.png")
sh(f"ffmpeg -v error -y -loop 1 -framerate 30 -t {ENDC} -i {W}lastf3.png -f lavfi -i anullsrc=r=48000:cl=stereo "
   f"-filter_complex \"[0:v]scale=1080:1920,gblur=sigma=30,eq=brightness=-0.38:saturation=0.5,fade=t=in:d=0.4,format=yuv420p[v]\" "
   f"-map [v] -map 1:a -t {ENDC} -c:v libx264 -crf 15 -c:a pcm_s16le {W}end3.mov")
open(W+'list3.txt', 'w').write(''.join(f"file '{s}'\n" for s in [W+'intro3.mov'] + pieces + [W+'end3.mov']))
sh(f"ffmpeg -v error -y -f concat -safe 0 -i {W}list3.txt -c:v libx264 -crf 15 -preset fast -c:a pcm_s16le {W}base3.mov")

def ts(x): return f"{int(x//3600)}:{int(x%3600//60):02d}:{x%60:05.2f}"
GOLD = '&H4FC4E8&'
ass = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1920", "WrapStyle: 2", "",
       "[V4+ Styles]",
       "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
       "Style: Cap,IBM Plex Sans Arabic,74,&H00FFFFFF,&H00FFFFFF,&H50000000,&H78000000,1,0,0,0,100,100,0,0,1,2,3,5,60,60,0,0",
       "Style: Small,IBM Plex Sans Arabic,44,&H00FFFFFF,&H00FFFFFF,&H64000000,&H78000000,0,0,0,0,100,100,0,0,1,1,2,5,60,60,0,0",
       "Style: Num,Inter,120,&H00FFFFFF,&H00FFFFFF,&H64000000,&H78000000,1,0,0,0,100,100,3,0,1,1,3,5,60,60,0,0",
       "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
for s, e, txt, g in caps:
    col = f"\\c{GOLD}" if g else ""
    ass.append(f"Dialogue: 1,{ts(s)},{ts(e)},Cap,,0,0,0,,{{\\pos(540,1450){col}\\fad(90,60)\\blur0.6}}{txt}")
ev = [
 (E+0.9, T, 'Small', f"\\pos(540,1125)\\c{GOLD}\\fad(400,0)\\fs54", 'الرقم الموحد'),
 (E+1.0, T, 'Num', "\\pos(540,1240)\\fad(400,0)", '920018915'),
 (E+1.3, T, 'Small', "\\pos(540,1370)\\fad(400,0)\\fs38\\alpha&H30&", 'maxmotors.sa'),
]
for s, e, st, tag, txt in ev: ass.append(f"Dialogue: 2,{ts(s)},{ts(e)},{st},,0,0,0,,{{{tag}}}{txt}")
ass.append(f"Dialogue: 0,{ts(E+1.1)},{ts(T)},Small,,0,0,0,,{{\\an7\\pos(0,0)\\c{GOLD}\\bord0\\shad0\\p1\\fad(400,0)}}"
           f"m 380 1312 l 700 1312 700 1315 380 1315{{\\p0}}")
open(W+'caps3.ass', 'w').write('\n'.join(ass) + '\n')

LI = W+'logo_full.png'; LM = W+'logo_m.png'
fc = (
 f"[0:v]ass={W}caps3.ass:fontsdir={FONTS}[b];"
 f"[1:v]format=rgba,scale=w='700*(0.94+0.06*min(1,t/1.4))':h=-1:eval=frame,"
 f"fade=t=in:st=0.15:d=0.5:alpha=1,fade=t=out:st={INTRO-0.45}:d=0.4:alpha=1[li];"
 f"[b][li]overlay=x='(W-w)/2':y='(H-h)/2-60':enable='lt(t,{INTRO})':eval=frame[b1];"
 f"[2:v]format=rgba,scale=120:-1,colorchannelmixer=aa=0.7[lb];"
 f"[b1][lb]overlay=x=W-w-56:y=110:enable='between(t,{INTRO+0.3},{E-0.3})'[b2];"
 f"[3:v]format=rgba,scale=560:-1,fade=t=in:st={E+0.3}:d=0.6:alpha=1[le];"
 f"[b2][le]overlay=x='(W-w)/2':y='600-h/2':enable='gte(t,{E})',fade=t=out:st={T-0.5}:d=0.5,format=yuv420p[v]"
)
sh(f"ffmpeg -v error -y -i {W}base3.mov -loop 1 -framerate 30 -i {LI} -loop 1 -framerate 30 -i {LM} -loop 1 -framerate 30 -i {LI} "
   f"-filter_complex \"{fc}\" -map [v] -map 0:a -t {T} -c:v libx264 -crf 16 -preset medium -c:a aac -b:a 192k {W}reel3_nomusic.mp4")
print('done', round(T, 2))
