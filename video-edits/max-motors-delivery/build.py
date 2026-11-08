#!/usr/bin/env python3
"""Max Motors — Geely Emgrand delivery reel (9:16, 1080x1920, 30fps).

Usage: python3 build.py <clips_dir> <assets_dir> <out_dir>
  clips_dir : folder with IMG_0333..IMG_0342.MOV
  assets_dir: folder with music.wav, whoosh.wav, boom.wav, riser.wav and ov/*.png
"""
import subprocess, sys, os

CLIPS, ASSETS, OUT = sys.argv[1:4]
TMP = os.path.join(OUT, "_tmp")
os.makedirs(TMP, exist_ok=True)
FPS = 30

# Cinematic look: teal shadows / warm highlights, soft contrast curve, film grain, 2 black bars
GRADE = ("curves=r='0/0.02 0.5/0.52 1/0.97':g='0/0.035 0.5/0.50 1/0.95':b='0/0.085 0.5/0.47 1/0.90',"
         "eq=contrast=1.12:saturation=0.90:gamma=0.95,"
         "colorbalance=rs=-0.05:bs=0.07:rh=0.07:bh=-0.05,"
         "vignette=PI/4.5,unsharp=5:5:0.3,noise=alls=6:allf=t,"
         "drawbox=x=0:y=0:w=iw:h=150:color=black:t=fill,"
         "drawbox=x=0:y=ih-150:w=iw:h=150:color=black:t=fill")

# (clip, src_start, out_dur, speed, zoom_from, zoom_to, extra)  speed<1 = blended slow motion
SHOTS = [
    ("IMG_0340", 0.30, 1.10, 0.60, 1.12, 1.00, ",fade=t=in:d=0.35"),           # grille close-up, slow-mo
    ("IMG_0338", 1.80, 1.15, 0.60, 1.00, 1.07, ""),                            # hood + lights, slow-mo
    ("IMG_0334", 0.00, 0.90, 0.70, 1.00, 1.07, ""),                            # tail light, slow-mo
    ("IMG_0341", 5.40, 3.15, 1.00, 1.00, 1.08, ",fade=t=in:d=0.3:color=white"),  # reveal: Mr. Mohammed
    ("IMG_0341", 8.70, 2.06, 1.00, 1.00, 1.03, ""),                            # question (synced)
    ("IMG_0341", 10.76, 1.49, 1.00, 1.16, 1.19, ""),                           # answer punch-in (synced)
    ("IMG_0337", 1.60, 2.40, 0.75, 1.00, 1.06, ",fade=t=in:d=0.3"),            # walks to car, slow-mo
    ("IMG_0342", 0.85, 2.66, 1.00, 1.00, 1.05, ""),                            # gets in (synced)
    ("IMG_0342", 3.82, 2.43, 1.00, 1.08, 1.12, ""),                            # in the seat (synced)
    ("IMG_0337", 8.60, 1.80, 0.80, 1.00, 1.06, ""),                            # exterior pan, slow-mo
    ("IMG_0339", 3.50, 2.46, 1.00, 1.12, 1.00, ",gblur=sigma=14,eq=brightness=-0.16,fade=t=in:d=0.4"),
]

DIALOG = [  # (clip, src_start, src_end, out_at)
    ("IMG_0341", 0.45, 2.70, 0.00),
    ("IMG_0341", 3.20, 7.25, 2.25),
    ("IMG_0341", 8.70, 12.25, 6.30),
    ("IMG_0342", 0.85, 3.51, 12.25),
    ("IMG_0342", 3.82, 6.25, 14.91),
]

CAPS = [  # (png, start, end)
    ("tag", 0.00, 3.15), ("c01", 0.05, 1.10), ("c02", 1.10, 2.25), ("c03", 2.25, 3.15),
    ("c04", 3.15, 5.40), ("c05", 3.85, 4.75), ("c06", 4.75, 5.59), ("c07", 5.59, 6.30),
    ("q01", 6.30, 8.36), ("c08", 8.36, 9.04), ("c09", 9.04, 9.85),
    ("c10", 12.25, 13.20), ("c11", 13.40, 14.91), ("c12", 14.91, 16.07), ("c13", 16.07, 17.34),
    ("end", 19.30, 21.60),
]

SFX = [  # (file, at, gain_db)
    ("boom", 0.00, -3), ("whoosh", 0.75, -15), ("whoosh", 1.85, -15), ("whoosh", 2.70, -8),
    ("boom", 3.15, -6), ("whoosh", 9.40, -9), ("boom", 9.85, -9),
    ("riser", 17.55, -9), ("boom", 19.14, -2),
]


def run(cmd):
    subprocess.run(cmd, check=True)


# 1) render each shot
seg_files = []
total = 0.0
for i, (clip, ss, dur, sp, z0, z1, extra) in enumerate(SHOTS):
    frames = round(dur * FPS)
    total += frames / FPS
    f = os.path.join(TMP, f"s{i:02d}.mp4")
    z = f"clip({z0}+({z1}-{z0})*t/{dur},{min(z0, z1)},{max(z0, z1)})"
    slow = f"minterpolate=fps={FPS}:mi_mode=blend," if sp < 1 else f"fps={FPS},"
    vf = (f"format=yuv420p,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,"
          f"setpts=PTS/{sp},{slow}"
          f"scale=w='2*trunc(1080*{z}/2)':h=-2:eval=frame,crop=1080:1920,"
          f"{GRADE}{extra},format=yuv420p,setsar=1")
    run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", str(ss), "-t", str(dur * sp + 0.2),
         "-i", os.path.join(CLIPS, clip + ".MOV"), "-vf", vf, "-frames:v", str(frames), "-an",
         "-c:v", "libx264", "-preset", "medium", "-crf", "16", f])
    seg_files.append(f)
print("video length", round(total, 3))

lst = os.path.join(TMP, "list.txt")
with open(lst, "w") as fh:
    fh.writelines(f"file '{s}'\n" for s in seg_files)
base = os.path.join(TMP, "base.mp4")
run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst,
     "-c", "copy", base])

# 2) overlays
inputs = ["-i", base]
fc = []
last = "[0:v]"
for k, (png, a, b) in enumerate(CAPS, start=1):
    inputs += ["-loop", "1", "-t", str(total), "-i", os.path.join(ASSETS, "ov", png + ".png")]
    fade = 0.25 if png in ("end", "q01", "c04", "tag") else 0.08
    fc.append(f"[{k}:v]format=rgba,fade=t=in:st={a}:d={fade}:alpha=1,"
              f"fade=t=out:st={max(a, b - fade)}:d={fade}:alpha=1[o{k}]")
    fc.append(f"{last}[o{k}]overlay=0:0:enable='between(t,{a},{b})'[v{k}]")
    last = f"[v{k}]"
# fade from black at the start, fade to black at the end
fc.append(f"{last}fade=t=in:st=0:d=0.15,fade=t=out:st={total - 0.4}:d=0.4,format=yuv420p[vout]")

# 3) audio
ai = len(CAPS) + 1
alabels = []
for j, (clip, a, b, at) in enumerate(DIALOG):
    inputs += ["-ss", str(a), "-t", str(b - a), "-i", os.path.join(CLIPS, clip + ".MOV")]
    fc.append(f"[{ai}:a]aformat=sample_rates=48000:channel_layouts=stereo,"
              f"afade=t=in:d=0.03,afade=t=out:st={b - a - 0.04}:d=0.04,"
              f"adelay={int(at * 1000)}|{int(at * 1000)}[d{j}]")
    alabels.append(f"[d{j}]")
    ai += 1
fc.append("".join(alabels) + f"amix=inputs={len(alabels)}:normalize=0,"
          "highpass=f=90,afftdn=nf=-25,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,"
          "loudnorm=I=-15:TP=-1.5:LRA=7,asplit=2[dlg][key]")

inputs += ["-i", os.path.join(ASSETS, "music.wav")]
fc.append(f"[{ai}:a]volume=-4dB,atrim=0:{total}[mus]")
ai += 1
fc.append("[mus][key]sidechaincompress=threshold=0.03:ratio=9:attack=20:release=350:makeup=1[musd]")

slabels = []
for j, (name, at, g) in enumerate(SFX):
    inputs += ["-i", os.path.join(ASSETS, name + ".wav")]
    fc.append(f"[{ai}:a]volume={g}dB,adelay={int(at * 1000)}|{int(at * 1000)}[x{j}]")
    slabels.append(f"[x{j}]")
    ai += 1
fc.append("[dlg][musd]" + "".join(slabels) + f"amix=inputs={2 + len(slabels)}:normalize=0,"
          f"atrim=0:{total},afade=t=out:st={total - 0.6}:d=0.6,alimiter=limit=0.89[aout]")

final = os.path.join(OUT, "MaxMotors-Emgrand-Delivery-Cinematic-9x16.mp4")
run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *inputs, "-filter_complex", ";".join(fc),
     "-map", "[vout]", "-map", "[aout]", "-c:v", "libx264", "-preset", "slow", "-crf", "18",
     "-profile:v", "high", "-pix_fmt", "yuv420p", "-r", str(FPS), "-c:a", "aac", "-b:a", "192k",
     "-movflags", "+faststart", "-t", str(total), final])
print("done", final)
