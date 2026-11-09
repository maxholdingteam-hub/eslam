#!/usr/bin/env python3
"""Max Motors — Geely Emgrand delivery reel (9:16, 1080x1920, 30fps), cinematic cut.

Usage: python3 build.py <clips_dir> <assets_dir> <out_dir> <music_file> [music_start_sec]
  clips_dir : folder with IMG_0333..IMG_0342.MOV
  assets_dir: folder with whoosh.wav, boom.wav, riser.wav and ov/*.png

Timeline is frame-exact: every shot length is in frames, and every on-camera shot takes its
video from the same source time as the dialog under it, so lips and words stay in sync.
"""
import subprocess, sys, os

CLIPS, ASSETS, OUT, MUSIC = sys.argv[1:5]
MUSIC_START = float(sys.argv[5]) if len(sys.argv) > 5 else 0.0
TMP = os.path.join(OUT, "_tmp")
os.makedirs(TMP, exist_ok=True)
FPS = 30

# Keep the iPhone's own colours: proper full->video range conversion, then only a light polish.
GRADE = "eq=contrast=1.04:saturation=1.07,unsharp=5:5:0.25"

# Dialog pieces (clip, src_start, src_end); silences between them are cut out.
DIALOG = {
    "D0": ("IMG_0341", 0.45, 2.70),     # narrator: "عندنا اليوم تسليم جيلي إمجراند"
    "D1": ("IMG_0341", 3.20, 7.25),     # "للعميل الأستاذ محمد، الله يبارك لك..."
    "D2": ("IMG_0341", 8.70, 12.2333),  # question + "الله يطول بعمرك، ولا غلطة"
}
DIALOG_AT = {"D0": 0.0, "D1": 2.25, "D2": 189 / FPS}

# (clip, src_start | ("sync", dialog_id), frames, speed, zoom_from, zoom_to, extra)
SHOTS = [
    ("IMG_0340", 0.30, 33, 0.60, 1.12, 1.00, ",fade=t=in:d=0.3"),            # grille close-up, slow-mo
    ("IMG_0338", 1.80, 34, 0.60, 1.00, 1.07, ""),                            # hood + lights, slow-mo
    ("IMG_0334", 0.00, 27, 0.70, 1.00, 1.07, ""),                            # tail light, slow-mo
    ("IMG_0341", ("sync", "D1"), 95, 1.0, 1.00, 1.06, ",fade=t=in:d=0.25:color=white"),  # Mohammed
    ("IMG_0341", ("sync", "D2"), 62, 1.0, 1.00, 1.03, ""),                   # question
    ("IMG_0341", ("sync", "D2"), 44, 1.0, 1.14, 1.17, ""),                   # answer, punch-in
    ("IMG_0337", 1.60, 72, 0.75, 1.00, 1.06, ",fade=t=in:d=0.25"),           # walks to car, slow-mo
    ("IMG_0342", 0.85, 80, 1.0, 1.00, 1.06, ""),                             # gets in (music only)
    ("IMG_0337", 8.60, 54, 0.80, 1.00, 1.06, ""),                            # exterior pan, slow-mo
    ("IMG_0339", 3.50, 74, 1.0, 1.12, 1.00, ",gblur=sigma=14,eq=brightness=-0.16,fade=t=in:d=0.4"),
]

LEAD = 0.07  # captions appear a hair before the word, like pro subtitles
CAPS = [  # (png, start, end) in output seconds, from word timestamps
    ("tag", 0.00, 3.13),
    ("c01", 0.00, 1.13), ("c02", 1.13, 2.25), ("c03", 2.25, 2.81), ("c04", 3.13, 5.30),
    ("c05", 3.85, 4.75), ("c06", 4.75, 5.33), ("c07", 5.33, 6.30),
    ("q01", 6.34, 8.36), ("c08", 8.36, 9.04), ("c09", 9.04, 9.83),
    ("end", 16.87, 19.1667),
]

SFX = [  # (file, at, gain_db)
    ("boom", 0.00, -6), ("whoosh", 2.70, -10), ("boom", 3.13, -9),
    ("whoosh", 9.38, -11), ("riser", 15.10, -12), ("boom", 16.70, -5),
]


def run(cmd):
    subprocess.run(cmd, check=True)


# 0) dialog sources as clean 48k stereo wavs (sample-accurate trims, no container seeking)
for clip in {c for c, _, _ in DIALOG.values()}:
    run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", os.path.join(CLIPS, clip + ".MOV"),
         "-vn", "-ac", "2", "-ar", "48000", os.path.join(TMP, clip + ".wav")])

# 1) render each shot
seg_files, frame_pos = [], 0
for i, (clip, src, frames, sp, z0, z1, extra) in enumerate(SHOTS):
    t_start = frame_pos / FPS
    if isinstance(src, tuple):  # same source moment as the dialog under it
        did = src[1]
        src = DIALOG[did][1] + (t_start - DIALOG_AT[did])
    dur = frames / FPS
    frame_pos += frames
    f = os.path.join(TMP, f"s{i:02d}.mp4")
    z = f"clip({z0}+({z1}-{z0})*t/{dur:.4f},{min(z0, z1)},{max(z0, z1)})"
    slow = f"minterpolate=fps={FPS}:mi_mode=blend," if sp < 1 else f"fps={FPS},"
    vf = (f"scale=1080:1920:force_original_aspect_ratio=increase:in_range=full:out_range=tv,format=yuv420p,crop=1080:1920,"
          f"setpts=PTS/{sp},{slow}"
          f"scale=w='2*trunc(1080*{z}/2)':h=-2:eval=frame,crop=1080:1920,"
          f"{GRADE}{extra},format=yuv420p,setsar=1")
    run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{src:.4f}", "-t", f"{dur * sp + 0.3:.4f}",
         "-i", os.path.join(CLIPS, clip + ".MOV"), "-vf", vf, "-frames:v", str(frames), "-an",
         "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-r", str(FPS),
         "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", f])
    seg_files.append(f)
total = frame_pos / FPS
print("video length", total)

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
    if png.startswith("c") or png == "q01":
        a, b = max(0.0, a - LEAD), b - LEAD
    inputs += ["-loop", "1", "-t", f"{total:.4f}", "-i", os.path.join(ASSETS, "ov", png + ".png")]
    fade = 0.25 if png in ("end", "q01", "c04", "tag") else 0.06
    fc.append(f"[{k}:v]format=rgba,fade=t=in:st={a:.3f}:d={fade}:alpha=1,"
              f"fade=t=out:st={max(a, b - fade):.3f}:d={fade}:alpha=1[o{k}]")
    fc.append(f"{last}[o{k}]overlay=0:0:enable='between(t,{a:.3f},{b:.3f})'[v{k}]")
    last = f"[v{k}]"
fc.append(f"{last}fade=t=in:st=0:d=0.15,fade=t=out:st={total - 0.4:.3f}:d=0.4,format=yuv420p[vout]")

# 3) audio, rendered in separate passes so no branch can end the mix early
#  3a) dialog: trims placed on the timeline, padded to full length, cleaned and levelled
dlg_in, dlg_fc = [], []
srcs = sorted({c for c, _, _ in DIALOG.values()})
for n, clip in enumerate(srcs):
    uses = [d for d, v in DIALOG.items() if v[0] == clip]
    dlg_in += ["-i", os.path.join(TMP, clip + ".wav")]
    dlg_fc.append(f"[{n}:a]asplit={len(uses)}" + "".join(f"[src_{d}]" for d in uses))
labels = []
for d, (clip, a, b) in DIALOG.items():
    at_ms = round(DIALOG_AT[d] * 1000)
    dlg_fc.append(f"[src_{d}]atrim={a}:{b},asetpts=PTS-STARTPTS,"
                  f"afade=t=in:d=0.02,afade=t=out:st={b - a - 0.03:.4f}:d=0.03,"
                  f"adelay={at_ms}|{at_ms}[d_{d}]")
    labels.append(f"[d_{d}]")
dlg_fc.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0,apad=whole_dur={total:.4f},"
              "highpass=f=90,afftdn=nf=-25,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,"
              f"loudnorm=I=-15:TP=-1.5:LRA=7,aresample=48000,atrim=0:{total:.4f}[o]")
dlg_wav = os.path.join(TMP, "dialog.wav")
run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *dlg_in, "-filter_complex", ";".join(dlg_fc),
     "-map", "[o]", "-ac", "2", "-ar", "48000", dlg_wav])

#  3b) music: real track, levelled, ducked under the dialog, faded in/out
mus_wav = os.path.join(TMP, "music_ducked.wav")
run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", str(MUSIC_START), "-t", f"{total + 1:.3f}",
     "-i", MUSIC, "-i", dlg_wav, "-filter_complex",
     f"[0:a]aformat=sample_rates=48000:channel_layouts=stereo,loudnorm=I=-17:TP=-2,aresample=48000,"
     f"apad=whole_dur={total:.4f},atrim=0:{total:.4f},asetpts=PTS-STARTPTS,afade=t=in:d=0.4,"
     f"afade=t=out:st={total - 1.5:.3f}:d=1.5[m];"
     "[m][1:a]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=400:makeup=1[o]",
     "-map", "[o]", "-ar", "48000", mus_wav])

#  3c) final mix: dialog + ducked music + sfx
inputs += ["-i", dlg_wav, "-i", mus_wav]
ai = len(CAPS) + 1
mix = [f"[{ai}:a]", f"[{ai + 1}:a]"]
ai += 2
for j, (name, at, g) in enumerate(SFX):
    inputs += ["-i", os.path.join(ASSETS, name + ".wav")]
    fc.append(f"[{ai}:a]aresample=48000,volume={g}dB,adelay={int(at * 1000)}|{int(at * 1000)}[x{j}]")
    mix.append(f"[x{j}]")
    ai += 1
fc.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:duration=first,"
          f"atrim=0:{total:.4f},alimiter=limit=0.89[aout]")

final = os.path.join(OUT, "MaxMotors-Emgrand-Delivery-Cinematic-9x16.mp4")
run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *inputs, "-filter_complex", ";".join(fc),
     "-map", "[vout]", "-map", "[aout]", "-c:v", "libx264", "-preset", "slow", "-b:v", "14M",
     "-maxrate", "18M", "-bufsize", "28M", "-profile:v", "high", "-pix_fmt", "yuv420p", "-r", str(FPS), "-color_range", "tv",
     "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
     "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-t", f"{total:.4f}", final])
print("done", final)
