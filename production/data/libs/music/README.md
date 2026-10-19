# Max Motors - music library for 9:16 car reels

Curated from **Mixkit** (Stock Music Free License: online / social / paid digital ads OK, no attribution, no account;
**not allowed for TV or radio broadcast**, no re-registering on Content-ID - full text in `LICENSE_mixkit_music.txt`).
**Exception - section 6** (Arabic epic for the Saudi Hilux brief) adds 4 tracks from **OpenTracks** (ex DOVA-SYNDROME; free, no credit,
ads AND TV commercials OK - `LICENSE_opentracks.txt`) and 1 from **FreePD** (public domain - `LICENSE_freepd.txt`); ids `ot_*` / `fpd_*`.
All tracks instrumental by Mixkit metadata (Mixkit has no vocal tag) - **give each pick a 10 s listen for vocal chops before use.**
Rankings come from metadata + signal analysis (structure, hits, endings, loudness, scale), not from listening.

Files: `catalog.json` (all 56 analysed tracks, every field; non-Mixkit metadata from `extra_meta.json`), `<id>.wav` (48 kHz stereo, 29 shortlisted tracks),
`viz/<id>.png` (waveform + RMS + beats + hits + sections + windows + splice bars + mel spectrogram),
`analysis/<id>.json` (raw), `analyze.py` (reusable analyser), `build_catalog.py`, source mp3s in `../../dl/music_src/`.

How to read a window: `start-end` in track seconds; "hit +4.1s" = the strongest hit/drop lands 4.1 s into the reel (product reveal).
"natural ending" = the window ends on the track's own final hit; otherwise fade the last 2-3 s (or put an impact SFX on the logo).
**Splice** = two-part music edit: play A, butt-cut on a downbeat (6-10 ms crossfade) to B, which ends on the real ending -
use it when you want both the drop-reveal and a clean musical ending. All master levels differ: normalise to about -14 LUFS (quiet ones flagged).


## Quick picks per ad type

| Ad | Pick | Why / how to cut |
|---|---|---|
| (a) Rugged SUV / 4x4 (e.g. Hilux desert) | **1150 "No Warning"** - 45 s: 63.26-108.26 (reveal on the drop at +4.37 s, ends on its own final hit) | Riser -> huge drop exactly on the reveal, powerful/determined. For a desert/Arabic flavour use **829 "Feast From The East"** (60 s splice: A 29.05-42.70 + B 73.92-120.27, reveal on the drop at +4.1 s) or the tension bed **1071 "Oscar el Asesino"** (70 s: 66.89-136.89, natural end). Pure-drums alternative: **677** start 53.99 (silence -> biggest hit at +3.99 s). |
| (b) Luxury sedan | **587 "Discover"** - 30 s: 27.26-57.26 (piano/strings build, reveal on the drop at +4.28 s); 60 s splice A 33.61-58.11 + B 86.01-121.51 | Elegant piano/strings + pulse, wide dynamics. Alt: **598** 45 s 180.28-225.28 (silence -> re-entry reveal, ends on own fade; add a sub boom) or **470 "Golden Storm"** 70 s 11.04-81.04 for a sleek modern-luxury EV look. |
| (c) Sporty / youth | **1183 "Karma"** - 30 s: 8.61-38.61 (reveal on the drop 12.64 s) or 3.28-33.28 (reveal on the stab at 7.0 s); splice to the ending A 2.79-18.04 + B 110.14-124.89 | Confident/powerful EDM with stab intro and two drops. Trap alternatives: **370 "Sparta"** 60 s 43.47-103.47 (ends on own fade), **318 "Thunder"** start 14.81 (808 drop at 19.25). |
| (d) Family / value | **834 "It's Love"** - 60 s: 34.92-94.92 (reveal on the drop at +4.35 s AND natural ending - best window found) | Uplifting, clean, modern. Alt: **173 "Better Times are Coming"** 70 s 27.68-97.68 (natural end), **33 "Motivating Mornings"** start 7.98 (drop 12.1 s). |

Hilux-desert note: the Mixkit catalogue has no real oud/qanun-led track; the most Middle-Eastern sounding options (by scale analysis
= augmented-second / hijaz colour, plus titles/tags) are 829, 1071, 460, 357, 233, 126. 829 is the only one that combines that colour with a
proper build -> drop and a clean ending, so it is the first choice for an Arabic-fusion desert cut; 1150/846/677 if the brief is pure power.
**If the client wants Arabic AND epic (Saudi Hilux brief), use section 6 instead** - #1 ot_13971 60 s 104.81-164.81, #2 ot_20880 56.5 s 92.24-148.72.

## 1. Epic / trailer hybrid (SUV, 4x4, power)

**#1 - 1150 "No Warning"** (Michael Ramir C.; 113 s, 110.4 BPM, -17.5 LUFS, key F minor) - Powerful/Determined action hybrid; long riser into a massive drop at 67.6 s; 45 s window lands the reveal ON the drop and ends on the natural final hit. Quiet master (-17.5 LUFS): normalise.
  - 30s **63.28-93.28** (hit +4.35s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 63.81-82.64 + B 95.72-106.89 (reveal +3.82s, natural end)
  - 45s **63.26-108.26** (hit +4.37s; natural ending; fade 2.0s) / splice A 13.63-50.17 + B 97.91-106.37 (reveal +3.8s, natural end)
  - 60s **13.07-73.07** (hit +4.35s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 13.63-39.26 + B 71.73-106.09 (reveal +3.8s, natural end)
  - 70s **13.08-83.08** (hit +4.35s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 13.63-71.73 + B 93.54-105.45 (reveal +3.8s, natural end)

**#2 - 846 "I Won't surrender"** (Michael Ramir C.; 114 s, 108.1 BPM, -14.4 LUFS, key B minor) - Trailer Music genre: brass + big drums, tension build to drop 67.8 s, final hit rings at 111.7 s. Classic SUV/power trailer feel.
  - 30s **63.21-93.21** (hit +4.55s; no natural end - fade last 2-3 s; fade 2.5s)
  - 45s **63.21-108.21** (hit +4.55s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 24.29-56.46 + B 100.94-113.77 (reveal +3.94s, natural end)
  - 60s **29.93-89.93** (hit +3.93s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 29.93-70.04 + B 94.23-114.11 (reveal +3.94s, natural end)
  - 70s **29.93-99.93** (hit +3.93s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 20.82-56.46 + B 78.88-113.24 (reveal +4.04s, natural end)

**#3 - 677 "Epical Drums 02"** (Grigoriy Nuzhny; 123 s, 120.1 BPM, -17.0 LUFS, key B minor) - Pure trailer percussion (taiko/war drums). 1 s silence then the strongest hit at 57.98 s = perfect product reveal (start 53.99). Quiet (-17 LUFS).
  - 30s **53.99-83.99** (hit +3.99s; no natural end - fade last 2-3 s; fade 2.5s)
  - 45s **53.99-98.99** (hit +3.99s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 5.99-25.99 + B 92.00-116.99 (reveal +4.01s, natural end)
  - 60s **56.01-116.01** (no strong hit at +3.5-4.6 s; natural ending; fade 2.0s) / splice A 5.99-35.99 + B 86.00-115.99 (reveal +4.01s, natural end)
  - 70s **5.99-75.99** (hit +4.01s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 5.99-43.99 + B 84.00-116.00 (reveal +4.01s, natural end)

**#4 - 552 "Masking the Masters"** (Eugenio Mininni; 220 s, 100.0 BPM, -13.0 LUFS, key D major) - Orchestral-hybrid (strings + electronic pulse), long build into drop 69.1 s; splices to its ringing ending at 208 s. Also works as premium/tech luxury.
  - 30s **64.86-94.86** (hit +4.23s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 64.88-83.48 + B 198.67-210.07 (reveal +4.21s, natural end)
  - 45s **64.89-109.89** (hit +4.2s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 64.88-93.08 + B 193.88-210.67 (reveal +4.21s, natural end)
  - 60s **64.89-124.89** (hit +4.2s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 64.88-93.08 + B 179.49-211.29 (reveal +4.21s, natural end)
  - 70s **64.89-134.89** (hit +4.2s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 64.88-76.28 + B 153.08-211.68 (reveal +4.21s, natural end)

**#5 - 706 "Games Music"** (Grigoriy Nuzhny; 118 s, 140.0 BPM, -8.7 LUFS, key B minor) - Loud trailer-drum hybrid (-8.7 LUFS), stutter-stop section 70-84 s full of hits; natural ringing end 110.6 s.
  - 30s **36.87-66.87** (hit +4.28s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 37.30-48.01 + B 94.31-113.60 (reveal +3.85s, natural end)

**#6 - 76 "Epic Games"** (Ahjay Stelino; 99 s, 105.0 BPM, -12.2 LUFS, key E minor) - Film-score brass/strings + drums, build 11-21 s; serious/heroic. Ends soft.
  - 30s **16.01-46.01** (hit +4.55s; no natural end - fade last 2-3 s; fade 2.5s)

**#7 - 686 "Epical Drums 06"** (Grigoriy Nuzhny; 103 s, 145.0 BPM, -16.0 LUFS, key A major) - Trailer percussion with several build/drop cycles; quieter master.
  - 30s **43.85-73.85** (hit +4.13s; no natural end - fade last 2-3 s; fade 2.5s)

**#8 - 1122 "War Cry"** (Michael Ramir C.; 117 s, 80.0 BPM, -14.8 LUFS, key D minor) - Powerful heavy drums, serious; soft ending.
  - 30s **19.09-49.09** (hit +3.79s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 73.12-82.87 + B 91.87-112.12 (reveal +3.75s, natural end)


## 2. Luxury cinematic (premium sedans)

**#1 - 587 "Discover"** (Eugenio Mininni; 144 s, 85.8 BPM, -14.2 LUFS, key F major) - Piano/strings orchestral-pop with modern pulse; build 19-38 s into drop 37.9 s (reveal), big dynamic range (LRA 16.8). Most "premium sedan" track found.
  - 30s **27.26-57.26** (hit +4.28s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 33.61-43.99 + B 102.95-122.57 (reveal +4.3s, natural end)
  - 45s **27.26-72.26** (hit +4.28s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 33.61-58.11 + B 102.95-123.45 (reveal +4.3s, natural end)
  - 60s **27.26-87.26** (hit +4.28s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 33.61-58.11 + B 86.01-121.51 (reveal +4.3s, natural end)
  - 70s **27.26-97.26** (hit +4.28s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 33.61-66.58 + B 86.01-123.03 (reveal +4.3s, natural end)

**#2 - 598 "We Will Get It"** (Eugenio Mininni; 269 s, 154.1 BPM, -11.2 LUFS, key A# major) - Cinematic piano/strings (269 s); best moment = silence-gap then re-entry at 183.9 s; 45 s window 180.28-225.28 ends on its own fade. Thin low end: add a sub boom on the reveal.
  - 30s **180.28-210.28** (hit +3.6s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 179.88-199.48 + B 218.19-228.59 (reveal +3.99s, natural end)
  - 45s **180.28-225.28** (hit +3.6s; natural fade-out)
  - 60s **179.50-239.50** (hit +4.38s; natural fade-out)
  - 70s **179.50-249.50** (hit +4.38s; natural fade-out)

**#3 - 470 "Golden Storm"** (Diego Nava; 95 s, 127.4 BPM, -11.1 LUFS, key G minor) - EDM tagged Elegant/Fashion: clean intro -> drop 15.1 s, breakdown 30 s, second drop 43 s; sleek modern-luxury (EV / premium crossover).
  - 30s **11.04-41.04** (hit +4.05s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 41.09-59.99 + B 69.44-80.54 (reveal +4.24s, natural end)
  - 45s **41.09-86.09** (hit +4.24s; natural fade-out)
  - 60s **11.14-71.14** (hit +3.96s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 11.09-48.65 + B 58.10-80.54 (reveal +4.01s, natural end)
  - 70s **11.04-81.04** (hit +4.05s; natural fade-out)

**#4 - 31 "Dreaming Big"** (Ahjay Stelino; 110 s, 135.3 BPM, -12.3 LUFS, key D major) - Uplifting film score (piano/strings) climaxing at 73 s; 30 s window 69.08-99.08 rides the climax into its baked-in fade.
  - 30s **69.08-99.08** (hit +3.88s; natural fade-out)
  - 45s **58.43-103.43** (hit +4.44s; natural fade-out)
  - 60s **40.84-100.84** (hit +3.6s; natural fade-out)
  - 70s **31.95-101.95** (hit +3.61s; natural fade-out)

**#5 - 322 "Life's a Movie"** (Arulo; 121 s, 105.0 BPM, -19.3 LUFS, key F# major) - Piano/brass cinematic, builds to 73 s; very quiet master (-19.3 LUFS).
  - 30s **68.57-98.57** (hit +4.57s; natural fade-out)


## 3. Energetic electronic / sport / trap (sporty, youth)

**#1 - 1183 "Karma"** (Michael Ramir C.; 135 s, 127.7 BPM, -13.8 LUFS, key G minor) - EDM Confident/Powerful/Sports: stutter-stab intro, drop 12.6 s, second build 67-80 s and drop 79.9 s. Best youth/sport energy; reveal on the drop (start 8.61) or on the stab at 7.0 s (start 3.28).
  - 30s **3.28-33.28** (hit +3.72s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 8.66-23.66 + B 110.14-125.14 (reveal +3.98s, natural end)
  - 45s **3.28-48.28** (hit +3.72s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 8.66-29.29 + B 100.77-125.14 (reveal +3.98s, natural end)
  - 60s **3.28-63.28** (hit +3.72s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 8.66-61.16 + B 117.64-125.14 (reveal +3.98s, natural end)
  - 70s **3.28-73.28** (hit +3.72s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 8.66-61.16 + B 108.27-125.77 (reveal +3.98s, natural end)

**#2 - 370 "Sparta"** (Arulo; 104 s, 120.0 BPM, -16.3 LUFS, key A minor) - Dark trap "Sparta": slow intro -> big drop 32 s, stop/breakdown, build 72 s, drop 80 s. 60 s window 43.47-103.47 ends on its own fade.
  - 30s **43.47-73.47** (hit +4.5s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 27.97-39.97 + B 81.99-99.99 (reveal +4.0s, natural end)
  - 45s **43.49-88.49** (hit +4.48s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 27.97-61.97 + B 89.99-100.99 (reveal +4.0s, natural end)
  - 60s **43.47-103.47** (hit +4.5s; natural fade-out)
  - 70s **27.47-97.47** (hit +4.5s; natural fade-out)

**#3 - 318 "Thunder"** (Arulo; 101 s, 95.0 BPM, -14.6 LUFS, key G minor) - Trap "Thunder": heavy 808 drop at 19.25 s after a sparse intro, breakdown/build/drop 55-62 s. Strong low end (0.80).
  - 30s **14.81-44.81** (hit +4.43s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 56.51-69.76 + B 77.35-94.09 (reveal +4.1s, natural end)
  - 45s **14.81-59.81** (hit +4.43s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 15.45-29.34 + B 64.71-95.83 (reveal +3.8s, natural end)
  - 60s **15.50-75.50** (hit +3.75s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 26.18-64.71 + B 74.81-96.28 (reveal +4.11s, natural end)
  - 70s **15.50-85.50** (hit +3.75s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 15.45-26.82 + B 36.92-95.55 (reveal +3.8s, natural end)

**#4 - 369 "Need for speed"** (Arulo; 98 s, 140.0 BPM, -14.2 LUFS, key E minor) - Trap "Need for speed": drop 12.0 s, second drop 69 s, natural ringing end 95.8 s.
  - 30s **8.13-38.13** (hit +3.85s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 25.69-48.00 + B 89.13-96.83 (reveal +3.85s, natural end)
  - 45s **8.13-53.13** (hit +3.85s; no natural end - fade last 2-3 s; fade 2.5s)
  - 60s **7.71-67.71** (hit +4.27s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 9.85-48.00 + B 75.42-97.27 (reveal +3.84s, natural end)
  - 70s **8.13-78.13** (hit +3.85s; no natural end - fade last 2-3 s; fade 2.5s)

**#5 - 126 "Trap Electro Vibes"** (Alejandro Magaña (A. M.); 116 s, 93.5 BPM, -9.8 LUFS, key A# minor) - Aggressive electronic/DnB (93.5 BPM, 187 double-time), bright; lead uses a phrygian-dominant (oriental) scale - Arab-leaning sport crossover.
  - 30s **6.34-36.34** (hit +4.05s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 44.06-61.45 + B 100.08-112.69 (reveal +4.2s, natural end)

**#6 - 1153 "Protesting Robot"** (Michael Ramir C.; 110 s, 140.0 BPM, -16.3 LUFS, key G major) - EDM/grime futuristic, many short drops (8.6, 29, 43 s).
  - 30s **4.70-34.70** (hit +3.86s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 4.70-18.85 + B 92.57-108.41 (reveal +3.85s, natural end)

**#7 - 136 "Infected Mushroom Vibes"** (Alejandro Magaña (A. M.); 90 s, 145.0 BPM, -9.8 LUFS, key D# minor) - Psy-trance drive, compact 90 s, loud.
  - 30s **56.55-86.55** (hit +4.56s; natural ending; fade 1.1s) / splice A 3.99-19.73 + B 72.69-86.96 (reveal +4.15s, natural end)

**#8 - 1222 "Flopper"** (Michael Ramir C.; 113 s, 125.0 BPM, -16.7 LUFS, key A minor) - EDM/dubstep, drop 15.3 s; 45 s window ends naturally.
  - 30s **2.35-32.35** (hit +4.35s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 17.26-40.31 + B 101.75-108.70 (reveal +3.83s, natural end)


## 4. Arabic / Middle-Eastern fusion

**#1 - 829 "Feast From The East"** (Michael Ramir C.; 121 s, 123.0 BPM, -10.8 LUFS, key B major) - "Feast From The East": house groove + Middle-Eastern (double-harmonic/hijaz) melody and a darbuka-style percussion break 88-103 s; drop 33.2 s; 9 sections; ringing end 117.4 s. Best Arabic-fusion pick.
  - 30s **29.11-59.11** (hit +4.08s; no natural end - fade last 2-3 s; fade 2.5s)
  - 45s **29.11-74.11** (hit +4.08s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 29.05-40.75 + B 85.62-118.92 (reveal +4.13s, natural end)
  - 60s **29.11-89.11** (hit +4.08s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 29.05-42.70 + B 73.92-120.27 (reveal +4.13s, natural end)
  - 70s **29.11-99.11** (hit +4.08s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 29.05-48.55 + B 70.14-120.63 (reveal +4.13s, natural end)

**#2 - 460 "Arab Nights"** (Arulo; 105 s, 120.1 BPM, -10.5 LUFS, key D minor) - "Arab Nights": trap beat with Arabic-style melody, drop 15.2 s, build 41 s -> drop 47 s. Loud (-10.5). Mixkit tag "Quirky" - check vibe by ear.
  - 30s **11.01-41.01** (hit +4.24s; section end @41.23; fade 0.4s)
  - 45s **11.49-56.49** (hit +3.75s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 11.01-23.23 + B 63.24-96.01 (reveal +4.24s, natural end)
  - 60s **11.49-71.49** (hit +3.75s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 11.01-23.23 + B 47.23-95.00 (reveal +4.24s, natural end)
  - 70s **11.49-81.49** (hit +3.76s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 11.01-55.24 + B 69.23-95.00 (reveal +4.24s, natural end)

**#3 - 1071 "Oscar el Asesino"** (Michael Ramir C.; 140 s, 119.9 BPM, -17.9 LUFS, key G major) - World-fusion "Oscar el Asesino": strongest augmented-second (hijaz/double-harmonic) colour of all tracks; tense/dangerous, steady drive; quiet (-17.9) and fairly static. Desert 4x4 tension bed.
  - 30s **74.88-104.88** (hit +4.35s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 99.00-122.98 + B 130.98-137.00 (reveal +3.99s, natural end)
  - 45s **74.88-119.88** (hit +4.35s; no natural end - fade last 2-3 s; fade 2.5s)
  - 60s **76.85-136.85** (hit +4.39s; natural ending)
  - 70s **66.89-136.89** (hit +4.35s; natural ending)

**#4 - 357 "Head Bang"** (Arulo; 97 s, 148.0 BPM, -15.6 LUFS, key C# major) - Trap "Head Bang" with oriental-scale hook (score 0.135); intro -> drop 12.2 s. Mixkit tag "Quirky".
  - 30s **8.13-38.13** (hit +4.05s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 8.12-28.37 + B 85.14-94.88 (reveal +4.06s, natural end)
  - 45s **7.72-52.72** (hit +4.46s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 8.12-44.59 + B 86.75-95.27 (reveal +4.06s, natural end)
  - 60s **7.68-67.68** (hit +4.5s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 8.12-41.34 + B 68.92-95.69 (reveal +4.06s, natural end)
  - 70s **7.68-77.68** (hit +4.5s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 8.12-70.54 + B 86.75-94.32 (reveal +4.06s, natural end)

**#5 - 233 "Seduction"** (Arulo; 104 s, 154.0 BPM, -16.0 LUFS, key C major) - World "Seduction" (Mixkit Arabic tag), hijaz colour, sparse plucks + drums, build 44 -> drop 49.8 s; quiet (-16).
  - 30s **45.58-75.58** (hit +4.26s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 11.68-24.93 + B 82.58-99.33 (reveal +3.88s, natural end)

**#6 - 679 "Epical Drums 04"** (Grigoriy Nuzhny; 121 s, 83.5 BPM, -14.6 LUFS, key D major) - Mixkit-tagged Arabic orchestral-hybrid drums + brass (scale analysis reads diatonic); steady energy, 9 s ringing end. Good desert-drive bed.
  - 30s **82.80-112.80** (hit +3.6s; natural ending; fade 2.0s)

**#7 - 733 "Percussions 01"** (Lily J; 102 s, 98.0 BPM, -13.6 LUFS, key F# major) - World percussion bed with oriental colour (0.186); steady, few sections.
  - 30s **25.68-55.68** (hit +3.74s; no natural end - fade last 2-3 s; fade 2.5s)


## 5. Clean upbeat corporate-modern (family / value)

**#1 - 834 "It's Love"** (Michael Ramir C.; 97 s, 110.0 BPM, -11.5 LUFS, key A major) - Uplifting corporate electronica: intro -> build 31 s -> drop 39.3 s; 60 s window 34.92-94.92 = reveal on the drop AND natural ringing end (best-scored window in the library).
  - 30s **34.92-64.92** (hit +4.35s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 35.47-56.75 + B 85.10-93.82 (reveal +3.81s, natural end)
  - 45s **34.92-79.92** (hit +4.35s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 35.47-54.57 + B 67.65-93.55 (reveal +3.81s, natural end)
  - 60s **34.92-94.92** (hit +4.35s; natural ending)
  - 70s **0.77-70.77** (hit +3.6s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 0.37-56.75 + B 78.56-92.18 (reveal +4.0s, natural end)

**#2 - 173 "Better Times are Coming"** (Alejandro Magaña (A. M.); 100 s, 120.0 BPM, -12.3 LUFS, key B major) - Synth-pop/synthwave, confident: breakdown 25 s -> drop 32.1 s; 70 s window 27.68-97.68 ends naturally.
  - 30s **27.68-57.68** (hit +4.42s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 0.09-22.62 + B 90.62-98.09 (reveal +3.51s, natural end)
  - 45s **0.09-45.09** (hit +3.51s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 28.24-38.61 + B 62.61-97.23 (reveal +3.87s, natural end)
  - 60s **28.39-88.39** (hit +3.71s; section end @88.61; fade 0.4s) / splice A 28.24-58.61 + B 66.61-96.23 (reveal +3.87s, natural end)
  - 70s **27.68-97.68** (hit +4.42s; natural ending; fade 1.04s)

**#3 - 33 "Motivating Mornings"** (Ahjay Stelino; 96 s, 121.0 BPM, -9.9 LUFS, key F major) - Propulsive brass/bass upbeat: stutter intro -> drop 12.1 s; loud (-9.9).
  - 30s **7.98-37.98** (hit +4.15s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 7.92-31.72 + B 87.26-93.46 (reveal +4.21s, natural end)
  - 45s **7.92-52.92** (hit +4.21s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 7.92-37.67 + B 79.33-94.57 (reveal +4.21s, natural end)
  - 60s **7.98-67.98** (hit +4.15s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 7.92-31.72 + B 57.50-93.70 (reveal +4.21s, natural end)
  - 70s **7.98-77.98** (hit +4.15s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 7.92-37.67 + B 53.55-93.79 (reveal +4.21s, natural end)

**#4 - 1167 "Close Up"** (Michael Ramir C.; 95 s, 105.0 BPM, -16.0 LUFS, key A# major) - Futuristic tech underscore, drops 18 s & 73 s; 45 s window 46.34-91.34 ends naturally.
  - 30s **61.78-91.78** (hit +4.56s; natural ending; fade 1.64s) / splice A 14.35-27.49 + B 75.49-92.35 (reveal +4.01s, natural end)
  - 45s **46.34-91.34** (hit +4.01s; natural ending; fade 2.0s)
  - 60s **13.76-73.76** (hit +4.6s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 14.35-50.35 + B 68.63-92.62 (reveal +4.01s, natural end)
  - 70s **13.76-83.76** (hit +4.6s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 14.35-75.49 + B 84.64-93.50 (reveal +4.01s, natural end)

**#5 - 77 "Running Out of Time"** (Ahjay Stelino; 96 s, 130.0 BPM, -10.1 LUFS, key A minor) - Guitar corporate-motivational, steady.
  - 30s **57.21-87.21** (hit +3.68s; no natural end - fade last 2-3 s; fade 2.5s)

**#6 - 729 "Pop Track 03"** (Lily J; 97 s, 109.0 BPM, -10.9 LUFS, key E minor) - Playful electronic pop, steady.
  - 30s **0.09-30.09** (hit +4.35s; no natural end - fade last 2-3 s; fade 2.5s) / splice A 50.68-69.94 + B 83.15-93.89 (reveal +3.84s, natural end)

## 6. Arabic / Middle-Eastern EPIC (non-Mixkit) - Saudi Hilux brief (55-60 s, big drop on the reveal, proud/heroic)

Licences differ from the rest of the library: `ot_*` = OpenTracks licence (free, no credit, commercial incl. online ads and TV
commercials; no Content-ID registration, no political/religious use - `LICENSE_opentracks.txt`); `fpd_*` = public domain (`LICENSE_freepd.txt`).
"oriental" = `tonal.oriental_score` (hijaz / double-harmonic colour; Mixkit's best were 1071 0.20, 733 0.19, 829 0.12). Instruments come from
the composers' own tags/notes - none of these was checked by ear, and none names oud/qanun/ney explicitly. **Listen before pitching.**
Custom 55-60 s cuts are in `catalog.json` -> `custom_windows`.

**#1 - ot_13971 "熱砂を駆ける" (Racing Across the Burning Sands)** (Yosame Yu, OpenTracks; 167 s, 151 BPM, -11.1 LUFS, G major with B-hijaz lines, oriental 0.01 overall / +0.13 in parts)
Composer: "Arabian-atmosphere orchestral piece"; tags bright, powerful, intense, epic, ethnic instruments, strings, percussion. Most heroic/proud of the set,
constant high energy (LRA 5). Drops 91.2 / 124.6 / 145.4 s, big hit 109.2, final hit rings at 163.6.
  - 60s **104.81-164.81** (reveal hit +4.42 s; natural ringing end) - best ready-made cut in the whole library for this brief
  - 55s 110.3-165.6 (late reveal: build 116.6 -> drop 124.6 at +14.3 s; natural end)

**#2 - ot_20880 "太陽の絨毯、砂漠の彼方" (Carpet of the Sun, Beyond the Desert)** (Addpico, OpenTracks; 150 s, 94 BPM, -8.9 LUFS, Hijaz on D / Nawa-Athar on G, oriental 0.28 = highest in the library, +0.17..0.33 in every segment)
Composer: Arabian / Middle-East, **sitar lead** (may read slightly Indian - check by ear), strings, guitar, percussion; powerful, serious, epic, darker mood.
Hits 35.1 / 96.4 s, drops 55.9 / 117.1, soft stop 143.4 (no final hit - add an impact on the logo).
  - 56.5s **92.24-148.72** (reveal hit +4.13 s; second drop +24.9; music stops +51.2, tail)
  - 60s splice A 30.96-50.76 + B 104.36-144.57 (reveal +4.13 s, natural stop)

**#3 - ot_9389 "ルフの翼" (Wings of the Roc)** (corico, OpenTracks; 111 s, 113 BPM, -9.4 LUFS hot master, G minor, oriental -0.12 / +0.08 early)
Composer: "ethnic piece for an Arabian Nights story" (the Roc = Arabian Nights giant bird - ties in with the falcon). Best reveal of the set:
quiet section 36-56 s then a massive re-entry (hit 58.03), drop 80.6, final hit rings 106.9. Less hijaz than #1/#2.
  - 55.8s **54.01-109.80** (reveal hit +4.02 s; natural ringing end at +52.9)

**#4 - fpd_desert_conflict "Desert Conflict"** (FreePD, composer not tagged; 160 s, 120 BPM, -12.8 LUFS, hijaz/double-harmonic on A, oriental 0.17)
Public domain (safest licence). Driving, dense, strong low end; drop 16.7, biggest hit 90.69 after a calmer mid section, final hit rings 154.7.
  - 60s splice A 86.60-112.67 + B 122.68-156.61 (reveal +4.09 s, natural end) / 70s 86.14-156.14 continuous (reveal +4.55, natural end)

**#5 - ot_9922 "Battle - 砂漠" (Battle - Desert)** (lei, OpenTracks; 117 s, 110 BPM stated, -11.7 LUFS, D major, oriental -0.06 / +0.24 in the first 30 s)
Orchestral "Arabian RPG battle" (brass/strings/woodwinds/percussion, no ethnic instruments tagged - can sound video-game). Biggest dynamics (LRA 12.9):
long build 46.6 -> drop 61.5, build 81.1 -> drop 89.9; ends on a baked-in fade (106.8).
  - 60s **50.04-110.04** (late reveal: drop at +11.5 s after a 15 s build; fade end - add an impact on the logo)

Screened and rejected (OpenTracks): ot_12426 "Hannibal" (orchestral/choir, plainly diatonic), ot_23035 (static loud loop); tonal-only:
3194, 1405, 6586, 9825 (diatonic). FreePD (archive.org mirror, tonal-only): The Desert, Nomadic Sunset, East of Tunesia (33 s), Desert Fox,
Assassin, Kings Trailer, Rulers of Our Lands, Ancient Power of Serpents - all diatonic or too short. Mixkit 884, 947, 723 tonal-only: diatonic.

## Method / caveats
- 2026-10-19 Arabic-epic add-on (section 6): Pixabay could not be used (pixabay.com is behind a Cloudflare challenge; track pages and
  cdn.pixabay.com/audio URLs are not discoverable by web search). OpenTracks searched by keyword (中東, アラビア, アラビアン, オリエンタル,
  エキゾチック, ダラブッカ, 砂漠, ...: ~130 tracks), filtered on powerful/epic tags, 10 downloaded; FreePD via the archive.org mirror (9 downloaded);
  each screened with `--tonal-only`, then 15 s segment scores, then full analysis on the best. Source mp3s of the fully analysed ones are in
  `../../dl/music_src/` (ot_*/fpd_*); OpenTracks mp3s are 128-320 kbps (13971/9922 160 kbps), FreePD 320 kbps.
- Screened: 975 Mixkit tracks scraped (80 tag/genre/mood pages + page 2-5 + 36 search terms) -> ~60 metadata candidates
  (excluded religious titles e.g. "Jihad", "Shahada", "Praise the Lord"; holiday, comedy, horror, children, lo-fi) ->
  69 mp3s downloaded (~270 MB), 20 of them only key/scale-screened for Arabic colour, **49 fully analysed**, 24 shortlisted with WAVs.
- `analyze.py` (numpy/scipy/PIL only): log-mel spectral flux onsets; tempo by windowed autocorrelation + Ellis DP beat tracker
  (BPM > 160 folded to half-time, flagged in `tempo_fold`); downbeats = 4/4 phase with strongest kick accent (heuristic, check visually);
  hits = flux x local level jump x section-jump; sections = Foote novelty on beat-synchronous log-mel + loudness change, snapped to downbeats;
  ending = ring / hard / fade / soft from post-stop rhythm and decay; windows scored on reveal hit (main drop preferred), natural ending,
  build contrast, sustain, downbeat start; splices joined on downbeats with feature similarity >= 0.55;
  tonal = Krumhansl key + scale-set match (`oriental_score` > ~0.05 = hijaz / double-harmonic colour).
- Timestamps are identical in the mp3 and the WAV (verified: 0-sample lag).
- Not verified by ear: vocals, exact instrumentation, downbeat phase. Section labels are energy-based (intro/build/drop/high/mid/breakdown/outro).
- Re-run on a new file: `python3 -I analyze.py --viz <id or path>`; WAV only: `python3 -I analyze.py --wav-only <id>`;
  catalogue: `python3 -I build_catalog.py`. Scraped listing pages are archived in `pages_html.tgz` (extract to `pages/` for `parse_pages.py`).
