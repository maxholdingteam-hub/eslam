# Motion-graphics overlay library (9:16, black + gold)

Generated 2026-10-19 13:02. Base: `/tmp/claude-0/-home-user-eslam/0f5505b8-8bf4-57e7-9c4a-28493f9f4c64/lib/mg`. 36 assets: 27 Mixkit clips (all **Mixkit Stock Video Free License** - commercial/paid ads OK, no attribution) + 9 procedural assets rendered by `tools/procgen.py` (own work, no restrictions).

## Read this first

- **Licence trap:** most of Mixkit's classic black-background overlays (light leaks 48011/46236/46237/47259, gold 3D "awards" backgrounds 14154/19215/30547/32888, fire balls 38818/48288, embers 47356/47961, gold dust 46316/46392, smoke 45298/8461, film grain 26656/26657...) are under the **Mixkit Restricted License**: only a 720p preview, personal use only. They were screened and **excluded**. Note: `$D/vfx/hi/` from earlier work contains several of those restricted files (12746, 19215, 38818, 45298, 46236, 47356, 48011) - do not use them in paid ads (3465 there is free-licensed).
- Only clips offering a Full HD/4K download on their item page are free-licensed; that is what is here (licence verified per item page, see `license` in catalog).
- **Disk:** the shared disk hit 100% during the job, so untouched originals are **not stored** in `src/` (only metadata). `tools/fetch_src.sh [ids]` re-downloads the exact originals (direct CDN `download_url` in catalog). A few planned clips (99860, 99829, 50955, 1965, 3465, 683, 52309, 52304, 101021) were not processed - their URLs are in `tools/spec.json`; run `STREAM=1 python3 -I tools/process.py tools/spec.json <id>` when space allows (it streams the source, no raw download).

## Layout

```
v/<category>/<id>/<id>_<slug>_1080x1920.mp4   vertical 1080x1920 H.264 (crf 14-16, bt709), source fps
v/<category>/<id>/jpg/f_%05d.jpg               JPEG frame sequence (only for the priority picks, see catalog jpeg_sequence)
v/grain/proc_grain/grain_tile_0..7.png          seamless 512px grain tiles
viz/<category>.jpg                               contact sheets (5 frames + gold-boxed peak frame per clip)
meta/<id>.json                                   full per-clip analysis (also merged into catalog.json)
catalog.json                                     everything below, machine readable (incl. luma curves)
tools/                                           scraper, analysis, processing, procgen, viz, catalog, fetch_src
```

Vertical modes: `native` (source already 9:16), `rot` (90deg rotation of non-directional 16:9 material - no upscaling), `cover` (9:16 crop around the brightness centroid, upscaled 1.78x - only used for soft material), `band` (16:9 downscaled to 1440 wide, centre 1080 kept, anchored to the bottom, top 55% feathered to black - ground fog). Loopable clips have a 1 s crossfade baked in, so frame N-1 flows into frame 0.

## Ranked picks per category

### Light leaks / film burns

| # | id | file | fps / dur | peak / cut (s) | black | loop | blend | why |
|---|---|---|---|---|---|---|---|---|
| 1 | `proc_leak_burn_a` | `v/leak/proc_leak_burn_a/proc_leak_burn_a_1080x1920.mp4` + jpg | 60 / 2.0 | 1.0 (max 1.017) | 0.0 | no | screen | pure black outside the burn, 60 fps native, exact peak at 1.000 s (frame 60) - designed for the cut |
| 2 | `101440` | `v/leak/101440/101440_abstract-orange-glow_1080x1920.mp4` + jpg | 23.98 / 8.008 | 1.96, 6.46 (max 1.96) | 5.1 | yes | screen | organic warm orange/amber glow, lifted black crushed to ~5, seamless 8 s loop |
| 3 | `101437` | `v/leak/101437/101437_soothing-yellow-light-shapes_1080x1920.mp4` + jpg | 23.98 / 8.008 | 2.29, 6.51 (max 2.29) | 3.83 | yes | screen | soft amber light shapes, gentler than 101440 - good for interiors / slow beats |
| 4 | `101424` | `v/leak/101424/101424_vibrant-orange-lights_1080x1920.mp4` | 23.98 / 8.008 | 1.08, 7.3 (max 1.08) | 9.8 | yes | screen | native vertical, vibrant orange; strong burn feel |
| 5 | `proc_leak_burn_b` | `v/leak/proc_leak_burn_b/proc_leak_burn_b_1080x1920.mp4` + jpg | 60 / 1.6 | 0.8 (max 0.817) | 0.0 | no | screen | gold flare rising from the bottom-right corner, peak 0.8 s (frame 48) |
| 6 | `101422` | `v/leak/101422/101422_vertical-abstract-visuals_1080x1920.mp4` | 23.98 / 8.008 | 2.0, 6.3 (max 6.3) | 7.87 | yes | screen | native vertical, orange-red burn, more aggressive |
| 7 | `101429` | `v/leak/101429/101429_green-abstract-visualizer_1080x1920.mp4` | 23.98 / 8.008 | 0.92, 6.63 (max 6.63) | 1.35 | yes | screen | native vertical gold glow (yellow-green leaning - hue-rotate -12deg) |
| 8 | `101443` | `v/leak/101443/101443_flowing-gray-lights_1080x1920.mp4` | 23.98 / 8.008 | 0.96, 4.88 (max 4.88) | 0.0 | yes | screen | neutral grey light - tint to any exact gold with CSS |

### Flares, light sweeps, streaks

| # | id | file | fps / dur | peak / cut (s) | black | loop | blend | why |
|---|---|---|---|---|---|---|---|---|
| 1 | `proc_anamorphic_streak` | `v/flare/proc_anamorphic_streak/proc_anamorphic_streak_1080x1920.mp4` | 60 / 1.6 | 0.8 (max 0.8) | 0.0 | no | screen | gold anamorphic streak + ghosts on pure black, peak 0.8 s; stock had nothing licence-free |
| 2 | `proc_light_sweep` | `v/flare/proc_light_sweep/proc_light_sweep_1080x1920.mp4` | 60 / 1.0 | 0.5 (max 0.5) | 0.0 | no | screen | 1 s diagonal glint for logos / chrome / text |
| 3 | `proc_speed_streaks` | `v/flare/proc_speed_streaks/proc_speed_streaks_1080x1920.mp4` | 60 / 2.0 | - (max 0.233) | 0.0 | yes | screen | seamless 2 s speed-line loop for performance beats |

### Gold particles / dust / glitter / bokeh

| # | id | file | fps / dur | peak / cut (s) | black | loop | blend | why |
|---|---|---|---|---|---|---|---|---|
| 1 | `proc_gold_dust` | `v/particles/proc_gold_dust/proc_gold_dust_1080x1920.mp4` + jpg | 60 / 8.0 | - | 0.0 | yes | screen | seamless 8 s 60 fps gold dust motes on pure black - the default luxury particle layer |
| 2 | `99995` | `v/particles/99995/99995_shimmering-silver-confetti-falling-down_1080x1920.mp4` | 24.0 / 8.0 | 0.12, 3.12, 4.04, 5.46, 6.46, 7.83 | 3.0 | yes | screen | real shimmering confetti/glitter on black (silver -> tint gold); rich depth of field |
| 3 | `proc_gold_bokeh` | `v/particles/proc_gold_bokeh/proc_gold_bokeh_1080x1920.mp4` | 60 / 8.0 | - | 0.0 | yes | screen | seamless 8 s 60 fps soft gold bokeh discs on pure black |
| 4 | `99858` | `v/particles/99858/99858_vertical-shot-of-colorful-bokeh-lights-a_1080x1920.mp4` | 23.98 / 8.008 | 2.21 | 3.5 | yes | screen | native vertical warm bokeh (yellow/amber, some green/red) |
| 5 | `2866` | `v/particles/2866/2866_golden-glitters_1080x1920.mp4` | 29.97 / 8.008 | 4.0 | 7.78 | yes | screen | very sparse golden glints - subtle |

### Smoke / fog / haze

| # | id | file | fps / dur | peak / cut (s) | black | loop | blend | why |
|---|---|---|---|---|---|---|---|---|
| 1 | `51097` | `v/smoke/51097/51097_smoke-billowing-from-the-ground-with-a-b_1080x1920.mp4` + jpg | 23.98 / 5.589 | 0.13 (max 0.13) | 0.0 | no | screen | low ground-fog bank billowing then settling - put under the car |
| 2 | `1962` | `v/smoke/1962/1962_plume-of-smoke-in-lower-third_1080x1920.mp4` | 24.0 / 10.0 | 7.17 (max 7.17) | 0.0 | no | screen | smoke plume rising in the lower third (feathered band) - under-car reveal |
| 3 | `1961` | `v/smoke/1961/1961_smoke-on-a-black-background_1080x1920.mp4` | 24.0 / 10.0 | 5.33, 9.5 (max 5.33) | 71.3 | no | screen | smoke rolls in and covers the frame by ~5.3 s - smoke-out transition |
| 4 | `50957` | `v/smoke/50957/50957_a-thick-mist-twists-and-settles-on-a-dar_1080x1920.mp4` | 23.98 / 5.714 | 1.42 (max 1.42) | 0.0 | no | screen | thick mist twisting then settling on the floor (feathered band) |

### Sparks / embers

| # | id | file | fps / dur | peak / cut (s) | black | loop | blend | why |
|---|---|---|---|---|---|---|---|---|
| 1 | `681` | `v/sparks/681/681_gold-sparklers_1080x1920.mp4` | 23.98 / 8.008 | 0.33, 1.96, 2.92, 4.5, 7.22 | 3.5 | yes | screen | gold sparkler sparks raining on black - celebratory accent |
| 2 | `3460` | `v/sparks/3460/3460_fire-particles-on-dark-background_1080x1920.mp4` | 24.0 / 8.0 | 1.46 | 0.0 | yes | screen | drifting orange ember bokeh on black |
| 3 | `3463` | `v/sparks/3463/3463_sparks-of-fire-on-a-black-background_1080x1920.mp4` | 24.0 / 8.0 | 1.79, 4.79 | 0.0 | yes | screen | native vertical rising fire sparks |

### Film grain / dust & scratches

| # | id | file | fps / dur | peak / cut (s) | black | loop | blend | why |
|---|---|---|---|---|---|---|---|---|
| 1 | `proc_grain` | `v/grain/proc_grain/grain_tile_0.png` | 24 / 0.04 | - | None | yes | overlay | 8 seamless 512 px grain tiles (overlay/soft-light) |
| 2 | `proc_dust_scratches` | `v/grain/proc_dust_scratches/proc_dust_scratches_1080x1920.mp4` | 24 / 4.0 | - | 0.0 | yes | screen | film dust, hairs, short scratches on black, 24 fps loop |

### Ink / liquid matte transitions

| # | id | file | fps / dur | peak / cut (s) | black | loop | blend | why |
|---|---|---|---|---|---|---|---|---|
| 1 | `476` | `v/ink/476/476_expanding-white-ink_1080x1920.mp4` | 59.94 / 9.593 | 50% cover @ 2.96 | 0.0 | no | matte | white ink blooms from two drops to full frame, 60 fps - smooth organic reveal |
| 2 | `3993` | `v/ink/3993/3993_black-liquid-covering-a-green-screen_1080x1920.mp4` | 24.0 / 11.708 | 50% cover @ 3.42 | 0.0 | no | matte | black liquid covers then uncovers (keyed) - in/out wipe in one clip |
| 3 | `492` | `v/ink/492/492_expanding-black-ink-forming-oval_1080x1920.mp4` | 23.98 / 8.008 | 50% cover @ 0.5 | 0.0 | no | matte | ink forms a vertical oval - iris-style reveal |
| 4 | `508` | `v/ink/508/508_white-and-black-ink-underwater_1080x1920.mp4` | 23.98 / 8.008 | 50% cover @ 1.25 | 0.0 | no | matte | white ink spreading underwater - organic reveal |
| 5 | `505` | `v/ink/505/505_black-ink-splashing_1080x1920.mp4` | 23.98 / 8.008 | 50% cover @ 1.79 | 0.0 | no | matte | ink cloud splashes to full cover fast |
| 6 | `3997` | `v/ink/3997/3997_thick-black-liquid-covering-a-chroma-bac_1080x1920.mp4` | 24.0 / 11.083 | 50% cover @ 0.42 | 0.0 | no | matte | native vertical thick liquid cover (keyed) |
| 7 | `100018` | `v/ink/100018/100018_vertical-video-of-white-ink-injected-wit_1080x1920.mp4` | 23.98 / 10.01 | 50% cover @ 0.42 | 0.0 | no | matte | native vertical ink jet plume from below |
| 8 | `3998` | `v/ink/3998/3998_abstract-figures-reveal-a-green-screen_1080x1920.mp4` | 23.98 / 11.386 | 50% cover @ 2.96 | 0.0 | no | matte | native vertical abstract shapes open/close (keyed) |

### Abstract luxury backgrounds

| # | id | file | fps / dur | peak / cut (s) | black | loop | blend | why |
|---|---|---|---|---|---|---|---|---|
| 1 | `101010` | `v/bg/101010/101010_abstract-background-in-grayscale_1080x1920.mp4` | 23.98 / 10.01 | 0.13, 9.01 | 8.0 | yes | multiply-tint | grayscale satin -> gold silk via multiply |
| 2 | `101011` | `v/bg/101011/101011_abstract-gray-swirling-motion_1080x1920.mp4` | 23.98 / 10.01 | 0.13, 9.84 | 65.5 | yes | multiply-tint | grayscale satin swirl -> gold silk via multiply |
| 3 | `34488` | `v/bg/34488/34488_detailed-texture-of-a-smooth-marble-surf_1080x1920.mp4` | 23.98 / 8.008 | 4.67 | 76.0 | yes | multiply-tint | inverted marble = black marble with light veins -> gold veins |

## Using them in the HTML/Chromium (Playwright, 60 fps) renderer

**Frame mapping.** Renderer frame `f` at 60 fps -> time `t = f/60`. Source frame `k = floor(t * clip.vertical_fps + 1e-6)`; for loopable clips `k %= clip.vertical_frames`; for one-shots clamp to the last frame (or hide the layer). 24 fps material therefore holds each frame 2-3 renderer frames, exactly like film - do not interpolate.

**Getting frames.** Either use the provided `jpg/` sequences, or extract once per job:
```
ffmpeg -i v/leak/101437/101437_..._1080x1920.mp4 -q:v 2 -start_number 0 frames/101437/f_%05d.jpg   # screen/add layers
ffmpeg -i v/ink/476/476_..._1080x1920.mp4 -pix_fmt gray -start_number 0 frames/476/m_%05d.png        # mattes (keep PNG)
```
Seeking a `<video>` per frame (`video.currentTime = t` + `requestVideoFrameCallback`) also works but image sequences are deterministic.

**Blend modes (CSS).**
```html
<img class="fx" src="frames/101440/f_00047.jpg" style="position:absolute;inset:0;width:100%;height:100%;
     mix-blend-mode:screen; opacity:.85">             <!-- leaks, smoke, particles, sparks -->
<img ... style="mix-blend-mode:plus-lighter">         <!-- 'add': punchier sparks / speed streaks / flares -->
<div style="background:url(v/grain/proc_grain/grain_tile_3.png) repeat; background-position:137px 911px;
     mix-blend-mode:overlay; opacity:.18">            <!-- grain: new tile + random offset every 2-3 frames -->
```
Tint neutral/silver material to gold: `filter: sepia(1) saturate(2.2) hue-rotate(-12deg) brightness(1.05)`. Warm the yellow-green 101429: `hue-rotate(-12deg)`. If a lifted black shows, `filter: brightness(.96) contrast(1.08)` (blacks were already crushed for the `crush` clips).

**Mattes (ink/liquid).** White = ink/liquid coverage. Put the INCOMING shot on top and mask it:
```css
.incoming { -webkit-mask-image:url(frames/476/m_00123.png); mask-image:url(frames/476/m_00123.png);
            mask-mode:luminance; mask-size:cover; }
```
(Chromium supports `mask-mode: luminance`; alternatively use an SVG `<mask>` whose default mode is luminance.) Add a thin gold edge by blurring+thresholding the same matte (canvas) or just screen a soft leak on top during the wipe.

**Gold silk / marble cards.** `101010`, `101011` (grayscale satin) and `34488` (inverted marble) go OVER a gold gradient card with `mix-blend-mode: multiply` (gold where the satin is bright, black in the folds) - then put type on top.

**Suggested layer order (bottom -> top):** footage -> smoke/fog (screen; ground fog under the car, 60-90%) -> particles/bokeh (screen 30-70%) -> type/spec cards -> light leaks / flares (screen) -> letterbox bars -> dust & scratches (screen 25-40%) -> grain (overlay 12-20%) -> vignette.

## Timing advice
- **Leak transitions:** the cut goes on the leak's brightest frame. `proc_leak_burn_a`: cut at frame 60 (1.000 s; start the layer 60 frames before the cut). `proc_leak_burn_b`: cut at frame 48 (0.8 s). For the stock glows (101440/101437/101424/101422/101429/101443) use them as a 0.5-1.5 s opacity envelope: ramp opacity 0->1 over 8-12 frames, hold, cut when the layer is at max, ramp out over 15-25 frames - start the clip so one of its `peak_times` lands on the cut (e.g. 101440: start the layer 1.96 s before the cut).
- Put cuts/leaks on the music downbeat; anamorphic streak (`peak 0.8 s`) on the title hit; light sweep 0.2-0.4 s after a logo/title settles; speed streaks only during acceleration/spec beats.
- **Ink mattes:** the visual cut happens where coverage crosses 50% (table above); speed them up 1.25-2x by sampling every 2nd frame for snappier ads; 3993/3998 are in+out in one clip.
- **Smoke:** 1961 is fully covered from ~5.3 s (cut there). Ground fog 51097/50957 peak early - start them 0.5-1 s before the car reveal.
- Particles/bokeh/grain/dust: continuous at low opacity; never let particles cross Arabic headline type at full opacity (reduce to 30%).

## Gaps
- No licence-free stock anamorphic flares, film burns on pure black, film grain or dust/scratches on Mixkit free tier -> covered procedurally (`proc_*`, regenerate/vary with `tools/procgen.py`).
- Gold 3D "awards"/Islamic-pattern backgrounds and the best gold dust are all Restricted on Mixkit -> use `proc_gold_dust`/`proc_gold_bokeh` + gold-tinted satin (101010/101011) instead.
- Coverr search (light leak, lens flare, particles, gold, smoke, sparks, dust, film grain, ink, fog, abstract) returned lifestyle/AI-generated clips only - nothing usable as an overlay; none taken.
- Sparks are only 1080p sources cropped (slightly soft); 4K free versions exist only for the 101xxx glows / 99827-99833 bokeh.

## Motion-graphics ideas from the market
Browsed: Behance search (car commercial motion graphics; automotive kinetic typography) incl. a Saudi car-finance commercial ("He found the car. The price found him first." - chapter cards: The Price / The Turn / The Offer / 72 Hours), Geely E2 Reveal Show (LED dot-matrix type, countdown in boxes), Aston Martin Valhalla "MASTERY. DRIVEN." (dark set, haze, top light shafts, wide-tracked thin caps), Dubizzle Oman Motors (kinetic type, perspective grids, app mockups); Dribbble automotive HMI/cluster animations; Mixkit car category. Ten techniques to build procedurally:
1. **Chapter cards** ("01 - The Price") - numbered beat titles with a gold hairline that draws in; CSS `clip-path: inset()` line reveal + `scaleX` rule, Arabic/English pairs.
2. **Odometer price/spec counters** (0 -> 189,900 SAR, 0-100 in 6.2 s) - per-digit columns of 0-9 translated in Y with easeOutExpo and staggered stops; tabular numerals, gold gradient text.
3. **LED dot-matrix type / countdown** (Geely) - rasterise text to a low-res canvas, draw rounded squares per lit cell; light cells in a sweep or random order.
4. **Light-sweep glint on chrome/logo/type** - duplicate the text layer with a moving `linear-gradient` + `background-clip:text`, or screen `proc_light_sweep` masked by the text alpha.
5. **Volumetric shafts + haze** (Aston Martin look) - 2-3 blurred trapezoid gradients from the top at 10-20% screen, slowly breathing, over `51097`/`1962` fog; car rim-lit, everything else crushed.
6. **HMI gauge / spec dial** - SVG arc with `stroke-dashoffset` needle sweep, tick marks, glowing value; use for horsepower/torque/0-100.
7. **Perspective grid / road rush** - CSS 3D plane (`rotateX(70deg)`) with repeating gold lines scrolling, plus `proc_speed_streaks`; for performance beats.
8. **Split-screen panel wipes** - 2-3 vertical panels (interior/wheel/badge) sliding in with 4-6 frame stagger via `clip-path` keyframes; seams carry a 2 px gold hairline.
9. **Letterbox breathing** - bars animate from 2.39:1 to full 9:16 on the reveal (and back for the end card); bars sit above leaks, below grain.
10. **Text-as-window / type masking** - giant model name filled with the footage (`background-clip:text` with a video frame), then scale 1 -> 6 until the letters open into the full shot.
11. Bonus: **callout leader lines** (feature hotspots) - SVG path draw from a pulsing gold dot to a label; **impact frames** - 1-2 frame white/gold flash + 6 px shake + chromatic split on beat drops.
