"""Max Motors reel v2: beat-snapped video cuts, word-by-word captions, zoom punch / flash / shake on hits,
synthesized SFX (whooshes + impacts), stabilized close-up, music + master."""
import subprocess, json, glob, wave
import numpy as np
C = '/home/user/eslam/montage/clips/'
W = '/tmp/mm/'
FONTS = glob.glob('/root/.claude/plugins/synced/*/majed-video/video-ad-editor/motion/fonts')[0]
F = {'21': C+'92e331fe-IMG_0121.MOV', '22': C+'f0b432a7-IMG_0122.MOV',
     '23': C+'b834d882-IMG_0123.MOV', '16': W+'16_stab.mp4'}
LEN = {'21': 6.0, '22': 7.37, '23': 10.8, '16': 3.27}
INTRO, ENDC, BPM = 1.2, 3.3, 100
B = 60 / BPM
# (audio clip, a_in, a_out, video clip, v_in, chunks[[(word, rel_start)...]], punch_words)
P = [
 ('23', 0.03, 3.24, '21', 0.40, [[('تم', 0), ('اليوم', .15), ('تسليم', .71)], [('سيارة', 1.41), ('أكسنت', 1.93)], [('بحمد', 2.41), ('الله', 2.75)]], ['أكسنت']),
 ('23', 3.76, 6.04, '16', 0.30, [[('من', .02), ('شركة', .14)], [('ماكس', .68), ('موتورز', 1.20)], [('للسيارات', 1.78)]], ['ماكس']),
 ('21', 3.50, 5.20, '21', 3.40, [[('وتم', .05), ('شحنها', .30), ('الحين', .80)], [('للعميل', 1.15)]], []),
 ('23', 6.70, 7.88, '23', 6.60, [[('خدمتنا', .02), ('الأونلاين', .50)]], ['الأونلاين']),
 ('23', 8.30, 10.42, '22', 3.40, [[('توصل', .05), ('لك', .40), ('سيارتك', .80)], [('لباب', 1.34), ('بيتك', 1.64)]], ['لباب']),
 ('22', 0.10, 2.68, '22', 0.10, [[('ماكس', .05), ('موتورز', .48)], [('تخدمك', .94), ('وين', 1.56), ('ما', 2.12), ('كنت', 2.28)]], ['ماكس']),
]
GRADE = ("hqdn3d=1.5:1.5:4:4,eq=contrast=1.12:brightness=0.03:saturation=1.22:gamma=1.06,"
         "curves=m='0/0 0.25/0.22 0.75/0.80 1/1',unsharp=5:5:0.5,vignette=PI/5")
def sh(c): subprocess.run(c, shell=True, check=True)
snap = lambda x: INTRO + round((x - INTRO) / B) * B

# audio timeline (speech, silences removed)
a_starts, t = [], INTRO
for p in P: a_starts.append(t); t += p[2] - p[1]
A_END = t
# video cuts snapped to the beat grid
vcuts = [INTRO] + [snap(a) for a in a_starts[1:]] + [snap(A_END + 0.15)]
E = vcuts[-1]; T = E + ENDC
print('audio end', round(A_END, 2), 'video cuts', [round(v, 2) for v in vcuts], 'T', round(T, 2))

# 1) video pieces (graded, slow push-in), audio pieces (cleaned voice)
vsegs = []
for i, p in enumerate(P):
    ac, a0, a1, vc, v0 = p[:5]
    d = vcuts[i+1] - vcuts[i]
    v0 = max(0.05, min(v0, LEN[vc] - d - 0.12))
    out = f'{W}v{i}.mp4'
    z = f"scale=w='1080*(1.04+0.05*t/{d})':h=-2:eval=frame,crop=1080:1920"
    sh(f"ffmpeg -v error -y -ss {v0} -t {d+0.1} -i {F[vc]} -filter_complex \"[0:v]fps=30,scale=1080:1920,setsar=1,{GRADE},{z},format=yuv420p[v]\" "
       f"-map [v] -an -t {d} -c:v libx264 -crf 15 -preset fast {out}")
    vsegs.append(out)
    da = a1 - a0
    sh(f"ffmpeg -v error -y -ss {a0} -t {da} -i {F[ac]} -af \"aresample=48000,highpass=f=90,afftdn=nf=-32,"
       f"acompressor=threshold=-22dB:ratio=3:attack=5:release=120,equalizer=f=3200:t=q:w=1:g=2.5,"
       f"afade=t=in:d=0.02,afade=t=out:st={da-0.03}:d=0.03\" -ac 1 -c:a pcm_s16le {W}a{i}.wav")

sh(f"ffmpeg -v error -y -f lavfi -i color=c=0x050505:s=1080x1920:r=30:d={INTRO} -c:v libx264 -crf 15 -pix_fmt yuv420p {W}intro_v.mp4")
sh(f"ffmpeg -v error -y -sseof -0.1 -i {vsegs[-1]} -frames:v 1 {W}lastf.png")
sh(f"ffmpeg -v error -y -loop 1 -framerate 30 -t {ENDC} -i {W}lastf.png -vf \"scale=1080:1920,gblur=sigma=28,"
   f"eq=brightness=-0.32:saturation=0.6,format=yuv420p\" -t {ENDC} -c:v libx264 -crf 15 {W}end_v.mp4")
with open(W+'vlist.txt', 'w') as f:
    for s in [W+'intro_v.mp4'] + vsegs + [W+'end_v.mp4']: f.write(f"file '{s}'\n")
sh(f"ffmpeg -v error -y -f concat -safe 0 -i {W}vlist.txt -c copy {W}vbase.mp4")

# 2) voice + SFX track (numpy)
SR = 48000; N = int((T + 0.5) * SR)
voice = np.zeros(N); sfx = np.zeros(N); rng = np.random.default_rng(3)
def rd(path):
    w = wave.open(path); return np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768
for i, s in enumerate(a_starts):
    x = rd(f'{W}a{i}.wav'); k = int(s * SR); voice[k:k+len(x)] += x
def lp(x, a):
    y = np.zeros_like(x); s = 0.0
    for i in range(len(x)): s = (1-a)*x[i] + a*s; y[i] = s
    return y
def whoosh(d=0.42):
    n = int(d*SR); tt = np.linspace(0, 1, n)
    x = rng.standard_normal(n); bright = lp(x, 0.5) - lp(x, 0.97)
    e = np.sin(np.pi * tt**1.6)**2
    return bright * e * 0.55
def impact():
    n = int(1.4*SR); tt = np.arange(n)/SR
    f = 38 + 90*np.exp(-tt/0.06)
    s = np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-tt/0.35)
    nz = lp(rng.standard_normal(n), 0.85) * np.exp(-tt/0.08) * 0.8
    return np.tanh(2*(s + nz)) * 0.7
def put(sig, at, g):
    k = int(at*SR); n = min(len(sig), N-k); sfx[k:k+n] += sig[:n]*g
for c in vcuts[1:-1]: w_ = whoosh(); put(w_, c - len(w_)/SR*0.7, 0.45)       # peak just before each cut
w_ = whoosh(0.6); put(w_, E - 0.6*0.7, 0.6)
put(impact(), INTRO, 0.55); put(impact(), E + 0.70, 0.6)
mix = np.clip(np.stack([voice + sfx*0.9, voice + sfx*0.9], 1), -1, 1)
ww = wave.open(W+'vox.wav', 'wb'); ww.setnchannels(2); ww.setsampwidth(2); ww.setframerate(SR)
ww.writeframes((mix[:int(T*SR)]*32767).astype(np.int16).tobytes()); ww.close()

# 3) captions: word-by-word highlight + end card
def ts(x):
    return f"{int(x//3600)}:{int(x%3600//60):02d}:{x%60:05.2f}"
GOLD, WHITE = '&H2BB5E6&', '&HFFFFFF&'
ass = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1920", "WrapStyle: 2", "",
       "[V4+ Styles]",
       "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
       "Style: Cap,Tajawal Black,100,&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,1,0,0,0,100,100,0,0,1,6,4,5,60,60,0,0",
       "Style: Small,Tajawal,46,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,2,2,5,60,60,0,0",
       "Style: Num,Inter,128,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,1,0,0,0,100,100,4,0,1,3,4,5,60,60,0,0",
       "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
hits = []   # zoom punches on keywords
chunks = []
for i, p in enumerate(P):
    base = a_starts[i]; dur = p[2] - p[1]
    for ci, ch in enumerate(p[5]):
        cs = base + ch[0][1]
        ce = base + (p[5][ci+1][0][1] if ci+1 < len(p[5]) else dur)
        chunks.append((cs, ce, ch, base))
        for wd, r in ch:
            if wd in p[6]: hits.append(base + r)
for cs, ce, ch, base in chunks:
    for wi, (wd, r) in enumerate(ch):
        s = base + r if wi else cs
        e = base + ch[wi+1][1] if wi+1 < len(ch) else ce
        parts = []
        for wj, (w2, _) in enumerate(ch):
            # libass lays out style runs left-to-right: give every word its own run (distinct colour)
            # and write them in reverse so the visual order reads correctly right-to-left.
            col = GOLD if wj == wi else '&HFFFF%02X&' % (255 - wj)
            parts.append(f"{{\\c{col}}}{w2}")
        anim = "\\fscx70\\fscy70\\alpha&H60&\\t(0,110,\\fscx106\\fscy106\\alpha&H00&)\\t(110,190,\\fscx100\\fscy100)" if wi == 0 else ""
        ass.append(f"Dialogue: 1,{ts(s)},{ts(e)},Cap,,0,0,0,,{{\\pos(540,1340){anim}}}{' '.join(reversed(parts))}")
ev = [
 (E+0.55, T, 'Small', f"\\pos(540,1110)\\c{GOLD}\\fad(250,0)", 'الرقم الموحد'),
 (E+0.70, T, 'Num', "\\pos(540,1230)\\fad(120,0)\\fscx55\\fscy55\\t(0,200,\\fscx106\\fscy106)\\t(200,320,\\fscx100\\fscy100)", '920018915'),
 (E+1.00, T, 'Small', "\\pos(540,1380)\\fad(300,0)\\fs40", 'maxmotors.sa'),
 (E+1.25, T, 'Small', f"\\pos(540,1480)\\fad(300,0)\\c{GOLD}\\fs50", 'تخدمك وين ما كنت'),
]
for s, e, st, tag, txt in ev: ass.append(f"Dialogue: 2,{ts(s)},{ts(e)},{st},,0,0,0,,{{{tag}}}{txt}")
ass.append(f"Dialogue: 0,{ts(E+0.75)},{ts(T)},Small,,0,0,0,,{{\\an7\\pos(0,0)\\c{GOLD}\\bord0\\shad0\\p1"
           f"\\clip(540,1310,540,1316)\\t(0,450,\\clip(240,1310,840,1316))}}m 240 1310 l 840 1310 840 1316 240 1316{{\\p0}}")
open(W+'caps2.ass', 'w').write('\n'.join(ass) + '\n')

# 4) beat FX on the picture (before text): zoom punch on cuts + keywords, flash on intro→body and end card, shake on number
punch = sorted(set([round(c, 3) for c in vcuts[1:-1]] + [round(h, 3) for h in hits]))
zexpr = '+'.join(f"0.075*exp(-(t-{p})/0.09)*gte(t,{p})" for p in punch)
flash = '+'.join(f"0.55*exp(-(t-{p})/0.07)*gte(t,{p})" for p in (INTRO, E))
shk = f"18*sin(t*95)*exp(-(t-{E+0.7})/0.12)*gte(t,{E+0.7})"
LI = W+'logo_full.png'; LM = W+'logo_m.png'
fc = (
 f"[0:v]scale=w='2*trunc(540*(1+{zexpr}))':h=-2:eval=frame,crop=1080:1920:x='(in_w-1080)/2+{shk}':y='(in_h-1920)/2',"
 f"eq=brightness='{flash}':eval=frame,setsar=1[p];"
 f"[p]ass={W}caps2.ass:fontsdir={FONTS}[b];"
 f"[2:v]format=rgba,scale=w='760*min(1,0.6+0.4*min(1,t/0.5))':h=-1:eval=frame[li];"
 f"[b][li]overlay=x='(W-w)/2':y='(H-h)/2-80':enable='between(t,0.08,{INTRO})':eval=frame[b1];"
 f"[3:v]format=rgba,scale=150:-1,colorchannelmixer=aa=0.85[lb];"
 f"[b1][lb]overlay=x=W-w-50:y=90:enable='between(t,{INTRO},{E})'[b2];"
 f"[4:v]format=rgba,scale=w='620*min(1,0.55+0.45*min(1,max(0,t-{E})/0.45))':h=-1:eval=frame[le];"
 f"[b2][le]overlay=x='(W-w)/2+{shk}':y='560-h/2':enable='gte(t,{E+0.03})':eval=frame,"
 f"fade=t=in:st=0:d=0.2,fade=t=out:st={T-0.35}:d=0.35,format=yuv420p[v]"
)
sh(f"ffmpeg -v error -y -i {W}vbase.mp4 -i {W}vox.wav -loop 1 -framerate 30 -i {LI} -loop 1 -framerate 30 -i {LM} "
   f"-loop 1 -framerate 30 -i {LI} -filter_complex \"{fc}\" "
   f"-map [v] -map 1:a -t {T} -c:v libx264 -crf 16 -preset medium -c:a aac -b:a 192k -movflags +faststart {W}reel2_nomusic.mp4")
sh(f"python3 {W}music.py {W}bg-audio.wav {T} {INTRO} {E}")
json.dump({'T': T, 'E': E, 'vcuts': vcuts, 'punch': punch}, open(W+'timeline2.json', 'w'), indent=1)
print('done', round(T, 2), 'punches', len(punch))
