# Real-recording SFX library (9:16 car ads, KSA)

180 files, 46 roles. All 48 kHz / stereo / 16-bit WAV, leading silence trimmed (5 ms pre-roll), normalised to -1 dBTP (4x oversampled).
Source: Mixkit (Mixkit Sound Effects Free License - commercial use incl. paid advertising, no attribution). Original 24-bit WAVs used except 5 files where only the 245 kbps mp3 preview was served (flagged `source_format` in catalog).

## Timing fields (catalog.json)
- `onset_t`: first sample above -30 dB re peak. `peak_t`: max 15 ms RMS = the sync point (cut/hit). `attack_ms`: onset to within 3 dB of max. `tail_t`: last frame above -40 dB.
- `default_align`: `peak` for builds/whooshes/swells/pass-bys, `onset` for hits/UI/foley. Rule of thumb at 30 fps: hits sync on the frame or 1 frame early; whoosh peaks on the first frame of the new shot.

## Usage
```python
import sys; sys.path.insert(0, '<D>/lib/sfx'); import sfxlib
sfxlib.place(out, t_cut, 'whoosh_short', align='peak', gain_db=-6, vary=0.4, seed=k)
sfxlib.place(out, t_hit, ('hit_heavy', 0), align='onset'); sfxlib.place(out, t_hit, 'sub_boom', align='onset', gain_db=-4)
sfxlib.place(out, 0, 'desert_wind', align='start', gain_db=-18, max_len=12, fade_out=2)
```
Contact sheets: `viz/<role>.png` (waveform + RMS dB, green=onset, red=peak_t, blue=tail_t, spectrogram strip).

## Transitions
### whoosh_short  -  align=peak on the cut (peak_t ~0.2-0.35 s after file start).
1. `whoosh_short/2637_fast-air-sweep.wav` - Fast air transition sweep (0.73 s, peak 0.335 s, attack 180 ms) - cleanest short air sweep, symmetric swell, no tone
2. `whoosh_short/174_fast-sweep.wav` - Fast sweep transition (0.81 s, peak 0.340 s, attack 199 ms) - tight bright sweep, very fast decay
3. `whoosh_short/1490_fast-whoosh.wav` - Fast whoosh transition (0.81 s, peak 0.710 s, attack 381 ms) - punchier whoosh with body
4. `whoosh_short/1488_hard-wind-woosh.wav` - Throw hard wind woosh (0.79 s, peak 0.060 s, attack 41 ms) - thrown-wind texture, more organic

### whoosh_medium  -  align=peak on the cut; start is ~peak_t earlier.
1. `whoosh_medium/1481_cinematic-swoosh.wav` - Cinematic swoosh (1.69 s, peak 0.680 s, attack 549 ms) - smooth cinematic swoosh with low body
2. `whoosh_medium/1469_flying-fast-swoosh.wav` - Flying fast swoosh (1.25 s, peak 0.370 s, attack 200 ms) - fast fly-by, slight doppler feel (also works as car speed accent)
3. `whoosh_medium/1493_swirling-whoosh.wav` - Swirling whoosh (2.45 s, peak 1.940 s, attack 1400 ms) - swirling, more motion
4. `whoosh_medium/1489_air-woosh.wav` - Air woosh (1.87 s, peak 0.655 s, attack 549 ms) - plain air, neutral

### swoosh_long  -  align=peak on the cut or the moment the car crosses frame centre.
1. `swoosh_long/1484_speeding-swoosh.wav` - Speeding swoosh (2.90 s, peak 0.565 s, attack 361 ms) - long speeding pass, strong low end, clear peak
2. `swoosh_long/167_long-air-swoosh.wav` - Long sweeping air swoosh (4.20 s, peak 0.810 s, attack 477 ms) - 4 s airy sweep, very clean
3. `swoosh_long/1474_windy-swoosh.wav` - Transition windy swoosh (2.93 s, peak 1.040 s, attack 642 ms) - windy organic pass
4. `swoosh_long/2705_vibrating-wind-pass.wav` - Vibrating wind passing by (4.62 s, peak 1.320 s, attack 910 ms) - vibrating wind pass, gritty

### reverse_swell  -  align=peak exactly on the cut (the swell stops dead there); trim/fade long tails after the cut.
1. `reverse_swell/1170_wind-swell-suck.wav` - Cinematic wind swell (9.36 s, peak 7.635 s, attack 4844 ms) - 9 s wind swell that sucks up to a hard stop at peak - classic pre-cut swell
2. `reverse_swell/1465_vacuum-swoosh.wav` - Vacuum swoosh transition (2.21 s, peak 1.480 s, attack 1261 ms) - short vacuum suck-in (2 s)
3. `reverse_swell/2608_air-zoom-vacuum.wav` - Air zoom vacuum (0.52 s, peak 0.330 s, attack 141 ms) - 1.3 s air zoom/vacuum into cut
4. `reverse_swell/2666_bass-double-swell.wav` - Bass double swell (8.51 s, peak 2.440 s, attack 1882 ms) - bass swell that peaks at 2.6 s then sustains (trim tail)

### whip_pan  -  align=peak on the whip-pan midpoint frame.
1. `whip_pan/2627_fast-swipe-zoom.wav` - Fast swipe zoom (0.78 s, peak 0.230 s, attack 126 ms) - 0.25 s bright swipe - best whip pan
2. `whip_pan/2124_air-break-swish.wav` - Golf shot breaking the air (0.48 s, peak 0.065 s, attack 29 ms) - golf-swing air break, crisp
3. `whip_pan/1487_dagger-woosh.wav` - Dagger woosh (0.28 s, peak 0.130 s, attack 56 ms) - dagger woosh, very short
4. `whip_pan/2142_quick-air-hit.wav` - Quick hit through air (0.74 s, peak 0.270 s, attack 183 ms) - quick air hit (mp3 preview only)

### glitch  -  align=onset 0-1 frame before the glitch frame.
1. `glitch/1031_glitch-short.wav` - Glitch short (0.74 s, peak 0.020 s, attack 10 ms) - clean 0.7 s digital stutter
2. `glitch/2595_small-electric-glitch.wav` - Small electric glitch (0.56 s, peak 0.230 s, attack 3 ms) - tiny electric glitch for text/logo flicker
3. `glitch/2942_system-break.wav` - System break (1.80 s, peak 0.065 s, attack 30 ms) - system break - glitch with crunch tail
4. `glitch/2946_virtual-quick-glitch.wav` - Virtual quick glitch (1.55 s, peak 1.245 s, attack 939 ms) - buzzing data glitch build
5. `glitch/1457_glitch-static.wav` - Glitch static (0.61 s, peak 0.380 s, attack 15 ms) - static burst

### paper_slide  -  align=onset at motion start, or peak on the landing.
1. `paper_slide/1530_paper-slide.wav` - Paper slide (0.52 s, peak 0.355 s, attack 304 ms) - paper slide with soft end thud
2. `paper_slide/2380_paper-quick-move.wav` - Paper quick movement (0.82 s, peak 0.340 s, attack 174 ms) - quick paper move
3. `paper_slide/2384_paper-quick-slice.wav` - Paper quick slice (0.34 s, peak 0.100 s, attack 68 ms) - 0.3 s paper slice
4. `paper_slide/1104_page-turn.wav` - Page turn single (0.45 s, peak 0.135 s, attack 81 ms) - single page turn

## Impacts
### hit_soft  -  align=onset on the impact frame (or 1 frame early for perceived sync).
1. `hit_soft/2498_body-into-sand.wav` - Body impact falling into the sand (0.96 s, peak 0.065 s, attack 18 ms) - soft sandy body thud, desert-friendly
2. `hit_soft/562_hand-drum-soft.wav` - Hand tribal drum (0.95 s, peak 0.010 s, attack 0 ms) - hand drum, warm
3. `hit_soft/2182_wood-hit.wav` - Wood hard hit (0.40 s, peak 0.050 s, attack 0 ms) - dry wood knock
4. `hit_soft/2161_air-hit.wav` - Air in a hit (0.39 s, peak 0.095 s, attack 32 ms) - air-in-a-hit puff

### hit_heavy  -  align=onset on the impact frame; layer a sub_boom under it.
1. `hit_heavy/563_drum-deep-impact.wav` - Drum deep impact (3.06 s, peak 0.025 s, attack 8 ms) - deep drum hit, 8 ms attack, clean 2 s tail
2. `hit_heavy/780_cinematic-impact-echo.wav` - Cinematic impact echo (7.24 s, peak 0.440 s, attack 50 ms) - cinematic hit with long echo tail
3. `hit_heavy/546_trailer-drum-hit.wav` - Cinematic mystery trailer drum hit (5.44 s, peak 0.145 s, attack 55 ms) - trailer drum hit (mp3 preview only)
4. `hit_heavy/2782_epic-impact-afar.wav` - Epic impact afar explosion (4.27 s, peak 0.160 s, attack 4 ms) - distant epic explosion-impact

### sub_boom  -  align=onset on the drop/cut; -3..-6 dB under music.
1. `sub_boom/553_trailer-bass-drum.wav` - Blockbuster trailer bass drum (7.37 s, peak 0.055 s, attack 10 ms) - 99% energy <120 Hz, trailer bass drum - the sub drop
2. `sub_boom/2294_drum-bass-sub.wav` - Drum bass hit (1.45 s, peak 0.040 s, attack 10 ms) - pure decaying sub sine-drum
3. `sub_boom/2299_short-bass-hit.wav` - Short bass hit (0.99 s, peak 0.045 s, attack 14 ms) - short tight bass hit
4. `sub_boom/1686_underground-boom.wav` - Underground explosion impact echo (3.84 s, peak 0.045 s, attack 11 ms) - underground boom with rumble

### hit_metal  -  align=onset on the hit frame.
1. `hit_metal/551_metallic-trailer-drum.wav` - Metallic cinematic drum trailer sound (5.73 s, peak 0.165 s, attack 43 ms) - metallic trailer drum, heavy low end
2. `hit_metal/1520_metallic-impact-whip.wav` - Metallic impact with whip (7.20 s, peak 0.260 s, attack 32 ms) - metal impact + whip crack, long ring
3. `hit_metal/783_submarine-metal.wav` - Submarine metal impact (7.76 s, peak 0.655 s, attack 19 ms) - submarine metal clang, huge
4. `hit_metal/836_forge-hammer.wav` - Hammer bounce in the forge (1.08 s, peak 0.080 s, attack 10 ms) - forge hammer, bright ring

### braam  -  align=onset on the title/hero reveal.
1. `braam/3111_warfare-horn-hit.wav` - Warfare horn trailer hit (9.10 s, peak 0.025 s, attack 8 ms) - horn hit with instant attack - closest to a real braam
2. `braam/713_horns-of-vengeance.wav` - Horns of vengeance (9.99 s, peak 1.105 s, attack 229 ms) - brass horns stab, longer
3. `braam/2291_eerie-trailer-horn.wav` - Eerie trailer horn transition (5.34 s, peak 0.055 s, attack 40 ms) - eerie horn transition
4. `braam/649_synth-braam.wav` - Movie trailer synth impact (5.36 s, peak 0.030 s, attack 16 ms) - synth braam/impact, sustained

### thump_low  -  align=onset on beat/text slam.
1. `thump_low/557_deep-drum-thump.wav` - Deep dark horror drum (2.63 s, peak 0.050 s, attack 14 ms) - deep drum thump, tight
2. `thump_low/556_deep-horror-drum.wav` - Deep horror drum (2.38 s, peak 0.070 s, attack 52 ms) - deep horror drum, longer
3. `thump_low/490_heart-beat.wav` - Human single heart beat (0.54 s, peak 0.030 s, attack 15 ms) - single heartbeat (2 thumps)
4. `thump_low/2079_ball-ground-thud.wav` - Gym ball hitting the ground (1.68 s, peak 0.040 s, attack 10 ms) - ball-on-ground thud, natural

### logo_sting  -  align=peak on the moment the logo fully resolves.
1. `logo_sting/2638_sweep-presentation.wav` - Magic transition sweep presentation (3.56 s, peak 1.090 s, attack 659 ms) - magic sweep that blooms into shimmer - logo reveal
2. `logo_sting/2586_magical-light-sweep.wav` - Magical light sweep (4.37 s, peak 1.515 s, attack 1108 ms) - light sweep, brighter
3. `logo_sting/3060_sparkle-hybrid.wav` - Sparkle hybrid transition (1.21 s, peak 0.220 s, attack 134 ms) - 1.2 s sparkle hybrid
4. `logo_sting/2589_light-energy.wav` - Shot light energy flowing (5.84 s, peak 1.565 s, attack 945 ms) - energy flow swell
5. `logo_sting/2912_futuristic-accent.wav` - Futuristic movie accent (2.48 s, peak 0.725 s, attack 124 ms) - futuristic accent with low body

### logo_impact  -  align=peak (the hit inside the build) on the logo slam.
1. `logo_impact/2900_logo-intro-impact.wav` - Movie logo intro impact (8.85 s, peak 4.625 s, attack 3593 ms) - 4.6 s build into logo hit, long tail - end card
2. `logo_impact/2897_logo-presentation-impact.wav` - Movie logo presentation impact (6.84 s, peak 4.085 s, attack 3826 ms) - 4.1 s build into impact
3. `logo_impact/2896_movie-intro-impact.wav` - Movie intro impact (7.78 s, peak 2.965 s, attack 2261 ms) - 3 s build into impact
4. `logo_impact/788_big-cinematic-impact.wav` - Big cinematic impact (6.75 s, peak 1.920 s, attack 1483 ms) - 2.2 s build big hit (mp3 preview only)

## Builds
### riser_1s  -  align=peak on the cut (riser ends on peak_t).
1. `riser_1s/792_fast-raiser.wav` - Cinematic fast raiser (1.01 s, peak 0.860 s, attack 573 ms) - native 1 s riser, clean
2. `riser_1s/790_trailer-riser.wav` - Cinematic trailer riser (1.04 s, peak 0.915 s, attack 634 ms) - trailer riser cut to its last 1 s
3. `riser_1s/2600_static-power-up.wav` - Electricity static power up (1.03 s, peak 0.680 s, attack 510 ms) - static power-up 0.7 s

### riser_2s  -  align=peak on the cut.
1. `riser_2s/790_trailer-riser.wav` - Cinematic trailer riser (2.04 s, peak 1.915 s, attack 1224 ms) - trailer riser cut to its last 1 s
2. `riser_2s/1170_wind-swell.wav` - Cinematic wind swell (2.35 s, peak 2.000 s, attack 473 ms) - 9 s wind swell that sucks up to a hard stop at peak - classic pre-cut swell
3. `riser_2s/2719_helicopter-riser.wav` - Cinematic riser helicopter engine (2.35 s, peak 2.000 s, attack 513 ms) - helicopter-engine riser, mechanical (car-friendly)

### riser_4s  -  align=peak on the cut.
1. `riser_4s/1170_wind-swell.wav` - Cinematic wind swell (4.35 s, peak 4.000 s, attack 1657 ms) - 9 s wind swell that sucks up to a hard stop at peak - classic pre-cut swell
2. `riser_4s/2719_helicopter-riser.wav` - Cinematic riser helicopter engine (4.35 s, peak 4.000 s, attack 1126 ms) - helicopter-engine riser, mechanical (car-friendly)
3. `riser_4s/2670_electronic-swell.wav` - Electronic swell noise (4.35 s, peak 4.000 s, attack 1820 ms) - electronic noise swell
4. `riser_4s/1144_space-stutter-riser.wav` - Short space stutter intro riser (4.35 s, peak 4.000 s, attack 2840 ms) - space stutter riser (mp3 preview)

### drone_tension  -  bed: align=start, duck under VO, fade out with max_len.
1. `drone_tension/2137_deep-machine-hum.wav` - Sci fi machine deep hum (30.00 s, peak 15.160 s, attack 824 ms) - deep machine hum bed (30 s)
2. `drone_tension/3199_room-tone.wav` - Cinematic room tone loop (12.38 s, peak 2.720 s, attack 72 ms) - cinematic room tone
3. `drone_tension/2298_bass-pulse.wav` - Mystwrious bass pulse (16.11 s, peak 1.575 s, attack 66 ms) - bass pulse bed (rhythmic)
4. `drone_tension/1177_deep-wind-hum.wav` - Deep cinematic wind hum (30.00 s, peak 11.470 s, attack 1258 ms) - deep wind hum bed

### clock_tick  -  bed: align=start; ticks are regular, slide so a tick hits the cut.
1. `clock_tick/1048_tick-tock-timer.wav` - Tick-tock clock timer (20.00 s, peak 9.510 s, attack 4 ms) - regular tick-tock 1 Hz-ish, clean
2. `clock_tick/1050_slow-tick-tock.wav` - Slow tick-tock clock timer (20.00 s, peak 14.010 s, attack 4 ms) - slow tick-tock
3. `clock_tick/1059_clock-close-up.wav` - Tick tock clock close up (11.60 s, peak 10.025 s, attack 20 ms) - close-up clock, very dry
4. `clock_tick/1045_tick-tock-timer2.wav` - Tick tock clock timer (16.00 s, peak 9.010 s, attack 999 ms) - tick-tock with mechanism

## Ui
### ui_click  -  align=onset on the frame the button/element changes.
1. `ui_click/1116_single-classic-click.wav` - Single classic click (0.12 s, peak 0.010 s, attack 0 ms) - single classic click, 0.12 s
2. `ui_click/2568_cool-click-tone.wav` - Cool interface click tone (0.12 s, peak 0.005 s, attack 0 ms) - click with tonal body
3. `ui_click/1124_plastic-bubble-click.wav` - Plastic bubble click (0.11 s, peak 0.015 s, attack 0 ms) - plastic bubble click
4. `ui_click/2577_device-click.wav` - Interface device click (0.20 s, peak 0.010 s, attack 3 ms) - device click

### ui_pop  -  align=onset on the first frame the element appears (scale-in start).
1. `ui_pop/2354_message-pop.wav` - Message pop alert (0.12 s, peak 0.025 s, attack 0 ms) - tiny clean pop (mp3 preview)
2. `ui_pop/3069_bubble-pop.wav` - Game balloon or bubble pop (0.13 s, peak 0.010 s, attack 3 ms) - bubble pop
3. `ui_pop/2364_hard-pop.wav` - Hard pop click (0.38 s, peak 0.045 s, attack 35 ms) - hard pop with tail
4. `ui_pop/2358_long-pop.wav` - Long pop (0.47 s, peak 0.030 s, attack 13 ms) - long pop

### ui_toggle  -  align=onset on the switch frame.
1. `ui_toggle/2582_quick-switch.wav` - Quick switch click (0.21 s, peak 0.010 s, attack 0 ms) - quick switch click
2. `ui_toggle/2585_switch-tap.wav` - On or off light switch tap (0.20 s, peak 0.005 s, attack 0 ms) - switch tap
3. `ui_toggle/1924_latch-click.wav` - Gate latch click (0.19 s, peak 0.040 s, attack 0 ms) - latch click, mechanical
4. `ui_toggle/2579_light-switch.wav` - Light switch sound (0.17 s, peak 0.065 s, attack 44 ms) - light-switch toggle

### ui_tick_counter  -  place one tick per counter step with align=onset; use vary=0.3 to avoid machine-gun repetition.
1. `ui_tick_counter/1125_soft-tick.wav` - Typewriter soft click (0.12 s, peak 0.015 s, attack 1 ms) - soft single tick - repeat per counter step
2. `ui_tick_counter/2541_key-tick.wav` - Single key press in a laptop (0.17 s, peak 0.035 s, attack 15 ms) - key tick, slightly brighter
3. `ui_tick_counter/1062_knob-spin-roll.wav` - Clock knob spin (0.64 s, peak 0.015 s, attack 0 ms) - knob spin = rolling counter texture
4. `ui_tick_counter/1053_ticking-counter.wav` - Ticking counter (6.46 s, peak 5.135 s, attack 85 ms) - continuous ticking counter

### ui_data_blip  -  align=onset on each data point/scan line appearing.
1. `ui_data_blip/3212_item-chirp.wav` - Item chirp (0.43 s, peak 0.015 s, attack 0 ms) - short chirp/blip
2. `ui_data_blip/2521_hitech-bleep.wav` - High tech bleep (0.59 s, peak 0.280 s, attack 45 ms) - high-tech bleep
3. `ui_data_blip/3119_tech-chip.wav` - Robotic technology chip (0.64 s, peak 0.085 s, attack 49 ms) - robotic chip blip
4. `ui_data_blip/2529_loading-scan.wav` - Sci fi loading operative system (2.63 s, peak 0.925 s, attack 1 ms) - loading/scan pattern 2.6 s
5. `ui_data_blip/3122_computer-calc.wav` - Technology computer calculations (1.88 s, peak 0.205 s, attack 94 ms) - computer calculation burst

### ui_typing  -  bed: align=start with the text animation; cut with max_len.
1. `ui_typing/1393_smartphone-typing.wav` - Smartphone typing (4.08 s, peak 2.255 s, attack 0 ms) - smartphone typing 4 s
2. `ui_typing/1376_device-typing.wav` - Typing on an electronic device (3.52 s, peak 2.740 s, attack 19 ms) - device typing
3. `ui_typing/2531_laptop-typing.wav` - Typing on a laptop keyboard (10.00 s, peak 1.495 s, attack 110 ms) - laptop typing (10 s)
4. `ui_typing/1363_digital-typewriter.wav` - Digital typewriter (1.74 s, peak 0.785 s, attack 0 ms) - digital typewriter

### camera_shutter  -  align=onset on the flash/freeze frame.
1. `camera_shutter/1433_lens-shutter.wav` - Camera lens shutter (0.44 s, peak 0.025 s, attack 15 ms) - lens shutter, crisp
2. `camera_shutter/1137_old-shutter-click.wav` - Old camera shutter click (0.17 s, peak 0.070 s, attack 15 ms) - old shutter click
3. `camera_shutter/1432_digital-shutter.wav` - Camera digital shutter (0.41 s, peak 0.300 s, attack 295 ms) - digital shutter
4. `camera_shutter/1430_hard-shutter.wav` - Camera shutter hard click (0.53 s, peak 0.045 s, attack 18 ms) - hard shutter

### card_drop  -  align=onset on the landing frame.
1. `card_drop/2001_card-placement.wav` - Poker card placement (0.17 s, peak 0.020 s, attack 9 ms) - card placement snap 0.17 s
2. `card_drop/2002_card-flick.wav` - Poker card flick (1.34 s, peak 0.200 s, attack 137 ms) - card flick
3. `card_drop/386_paper-drop.wav` - Newspaper falling to the floor (0.61 s, peak 0.160 s, attack 118 ms) - paper drop to floor
4. `card_drop/1529_slide-hit.wav` - Slide hit (0.54 s, peak 0.220 s, attack 170 ms) - slide + hit

### light_switch  -  align=onset on headlight-on / light-up frame.
1. `light_switch/1808_electric-switch.wav` - Electric switch (1.22 s, peak 0.165 s, attack 107 ms) - electric switch clunk with buzz - headlight-on
2. `light_switch/1891_pull-switch.wav` - Light pull switch (1.19 s, peak 0.410 s, attack 119 ms) - pull switch
3. `light_switch/3163_power-on-thunk.wav` - Sci fi engine short start (0.84 s, peak 0.015 s, attack 4 ms) - power-on thunk
4. `light_switch/2602_electronics-power-up.wav` - Electronics power up (4.61 s, peak 0.250 s, attack 79 ms) - electronics power-up hum (5 s)

### electric_hum  -  bed: align=start under glowing elements; fade in/out.
1. `electric_hum/2591_intense-hum.wav` - Intense electricity hum (20.00 s, peak 0.010 s, attack 0 ms) - intense electric hum bed
2. `electric_hum/910_electricity-buzz.wav` - Electricity buzz (12.23 s, peak 7.370 s, attack 743 ms) - electricity buzz
3. `electric_hum/2132_low-humming.wav` - Low electricity humming (18.36 s, peak 0.010 s, attack 5 ms) - low humming
4. `electric_hum/3201_charge-hum.wav` - Electric charge hum (0.78 s, peak 0.500 s, attack 369 ms) - charge hum 2.5 s

### sparkle  -  align=onset on the glint frame (gold accents).
1. `sparkle/871_fairy-sparkle.wav` - Fairy magic sparkle (1.04 s, peak 0.010 s, attack 0 ms) - bright fairy sparkle 1 s (gold glints)
2. `sparkle/3062_wand-sparkle.wav` - Magic wand sparkle (1.40 s, peak 0.170 s, attack 141 ms) - wand sparkle
3. `sparkle/3108_crystal-chime.wav` - Crystal chime (1.34 s, peak 0.170 s, attack 128 ms) - crystal chime
4. `sparkle/2352_glitter-particles.wav` - Magic glitter or particles (5.20 s, peak 1.020 s, attack 455 ms) - glitter particles 6 s

## Car
### engine_start  -  align=onset = crank start; catch happens at peak_t - put peak_t on the headlight/hero frame.
1. `engine_start/1535_car-ignition-idle.wav` - Car ignition (10.46 s, peak 1.115 s, attack 993 ms) - crank, catch, small blip, steady idle 10 s
2. `engine_start/1559_start-ignition.wav` - Car start ignition (4.58 s, peak 0.980 s, attack 770 ms) - crank + idle 4.8 s
3. `engine_start/1566_engine-start.wav` - Car engine start (2.20 s, peak 0.270 s, attack 185 ms) - short crank + catch 2.6 s
4. `engine_start/1561_start-idle-a.wav` - Cars starting (4.79 s, peak 0.660 s, attack 628 ms) - crank + idle (segment A)

### engine_rev  -  align=peak on the hero frame (peak = rev top).
1. `engine_rev/1561_start-rev-b.wav` - Cars starting (7.94 s, peak 1.215 s, attack 1081 ms) - start then strong rev at ~1.2-5 s (segment B)
2. `engine_rev/1560_start-rev.wav` - Transport car start (4.75 s, peak 2.775 s, attack 2267 ms) - start + rev blip (segment)
3. `engine_rev/1622_truck-accelerates.wav` - Truck accelerates (8.84 s, peak 6.855 s, attack 4706 ms) - truck pulling away, slow pitch rise
4. `engine_rev/1617_truck-accelerating.wav` - Truck accelerating (10.33 s, peak 7.585 s, attack 512 ms) - truck accelerating

### car_passby  -  align=peak when the car crosses frame centre.
1. `car_passby/1538_fast-drive-by.wav` - Fast car drive by (3.75 s, peak 1.215 s, attack 586 ms) - real doppler drive-by, peak at 1.2 s
2. `car_passby/1627_truck-highway-pass.wav` - Truck in highway passing by (17.93 s, peak 8.560 s, attack 6390 ms) - slow heavy highway pass (19 s)
3. `car_passby/1536_car-arriving.wav` - Old car arriving (10.35 s, peak 7.450 s, attack 4705 ms) - car arriving and stopping

### tyre_gravel  -  bed/pass: align=peak on closest moment.
1. `tyre_gravel/1608_gravel-road-pass.wav` - Bike passing by a gravel road (4.49 s, peak 2.505 s, attack 2102 ms) - tyres on gravel pass-by (bike) - crunchy, peaks mid
2. `tyre_gravel/1602_dirt-arrival.wav` - Small tractor arrival on dirt (20.66 s, peak 11.405 s, attack 8960 ms) - tractor arriving on dirt (engine + ground)

### gravel_spray  -  align=onset when wheels kick dirt.
1. `gravel_spray/1273_gravel-avalanche.wav` - Gravel stones small avalanche (1.20 s, peak 0.030 s, attack 20 ms) - gravel spray burst 1.2 s
2. `gravel_spray/1272_stone-avalanche.wav` - Small stone avalanche (2.82 s, peak 1.070 s, attack 948 ms) - stone avalanche 2.9 s
3. `gravel_spray/756_gravel-hit.wav` - Falling hit on gravel (0.99 s, peak 0.120 s, attack 51 ms) - hit on gravel
4. `gravel_spray/402_dirt-debris.wav` - Dirt debris falling (5.36 s, peak 0.290 s, attack 110 ms) - dirt debris falling
5. `gravel_spray/1494_sand-swish.wav` - Sand swish (1.65 s, peak 0.280 s, attack 170 ms) - sand swish (desert spray)

### offroad_rumble  -  bed: align=start, low under music.
1. `offroad_rumble/2753_tank-engine.wav` - Tank engine working (15.33 s, peak 4.645 s, attack 1630 ms) - tank engine rumble bed
2. `offroad_rumble/1621_truck-steady.wav` - Truck driving steady (9.60 s, peak 4.940 s, attack 250 ms) - truck driving steady
3. `offroad_rumble/1615_damaged-truck.wav` - Damaged truck driving (6.18 s, peak 3.370 s, attack 15 ms) - rough truck
4. `offroad_rumble/1553_atv-hum.wav` - ATV engine motor hum (20.00 s, peak 9.970 s, attack 9262 ms) - ATV hum

### door_close  -  align=onset on the door-shut frame (thud = peak_t, a few ms later).
1. `door_close/3129_car-door-close.wav` - Car door close (6.00 s, peak 0.145 s, attack 80 ms) - real car door close, heavy low thud
2. `door_close/1564_car-door-slam.wav` - Car door slam (0.62 s, peak 0.065 s, attack 40 ms) - car door slam, tight
3. `door_close/1862_heavy-door-thud.wav` - Refrigerator door close (1.60 s, peak 0.265 s, attack 239 ms) - fridge-door thud (premium soft close)
4. `door_close/196_door-hard-shut.wav` - Door hard shut (0.46 s, peak 0.110 s, attack 48 ms) - hard shut

### horn  -  align=onset; use sparingly.
1. `horn/718_car-horn.wav` - Car horn (0.56 s, peak 0.115 s, attack 28 ms) - single short car horn
2. `horn/1565_classic-horn.wav` - Classic car horn (0.46 s, peak 0.125 s, attack 19 ms) - classic horn
3. `horn/719_double-horn.wav` - Car double horn (0.82 s, peak 0.425 s, attack 271 ms) - double tap horn
4. `horn/717_small-horn.wav` - Small car horn (0.43 s, peak 0.015 s, attack 5 ms) - small car horn

### turbo_whoosh  -  align=peak on the gear shift / speed-ramp frame.
1. `turbo_whoosh/1458_steam-blowoff.wav` - Steam swoosh (1.62 s, peak 0.635 s, attack 365 ms) - steam swoosh - blow-off valve stand-in
2. `turbo_whoosh/2614_gamma-spool.wav` - Electric gamma ray whoosh (1.41 s, peak 0.995 s, attack 726 ms) - gamma whoosh - spool stand-in
3. `turbo_whoosh/1714_rocket-whoosh.wav` - Fast rocket whoosh (4.09 s, peak 0.885 s, attack 448 ms) - rocket whoosh, heavy
4. `turbo_whoosh/2650_spinning-whoosh.wav` - Engine slow spinning whoosh (5.91 s, peak 2.450 s, attack 1653 ms) - spinning engine whoosh

## Nature
### horse_neigh  -  align=onset on mouth-open frame, peak_t is the scream.
1. `horse_neigh/76_intense-stallion-neigh.wav` - Intense horse stallion neigh (2.32 s, peak 1.175 s, attack 458 ms) - intense stallion neigh, full
2. `horse_neigh/1762_stallion-neigh.wav` - Stallion horse neigh (2.79 s, peak 1.685 s, attack 686 ms) - stallion neigh
3. `horse_neigh/85_scared-neigh.wav` - Scared horse neighing (2.19 s, peak 1.100 s, attack 157 ms) - scared neigh
4. `horse_neigh/30_scared-stallion.wav` - Scared stallion horse (6.17 s, peak 0.670 s, attack 427 ms) - stallion with snorts (6 s)

### horse_snort  -  align=onset on head toss.
1. `horse_snort/80_hard-big-snort.wav` - Hard big horse snort (1.34 s, peak 0.320 s, attack 81 ms) - hard big snort
2. `horse_snort/75_stallion-snore.wav` - Horse stallion snore (1.13 s, peak 0.290 s, attack 65 ms) - stallion snore/snort

### horse_gallop  -  bed: align=start; slide so hoof hits match footfalls.
1. `horse_gallop/77_gallop-dirt.wav` - Horse fast gallop in the dirt (13.17 s, peak 0.955 s, attack 842 ms) - fast gallop on dirt 13 s
2. `horse_gallop/78_fast-walk-dirt.wav` - Horse fast walking on dirt ground (13.11 s, peak 1.325 s, attack 1144 ms) - fast walk on dirt
3. `horse_gallop/79_gallop-puddles.wav` - Horse gallop on puddles in the road (12.88 s, peak 12.495 s, attack 126 ms) - gallop on wet road

### desert_wind  -  bed: align=start, low level, fade with max_len.
1. `desert_wind/1158_desert-winds.wav` - Desert winds (30.00 s, peak 16.285 s, attack 2643 ms) - desert winds bed (30 s cut)
2. `desert_wind/1161_desertic-wind.wav` - Desertic wind (30.00 s, peak 21.345 s, attack 9424 ms) - desertic wind
3. `desert_wind/2495_desert-ambience.wav` - Desert ambience (30.00 s, peak 24.395 s, attack 9690 ms) - desert ambience
4. `desert_wind/1734_wild-land-wind.wav` - Wild land wind (20.09 s, peak 3.440 s, attack 3139 ms) - wild land wind

### sand_gust  -  align=peak on the dust burst.
1. `sand_gust/2494_sand-desert.wav` - Sand in the desert (5.44 s, peak 0.880 s, attack 457 ms) - sand blowing gust
2. `sand_gust/1494_sand-swish.wav` - Sand swish (1.65 s, peak 0.280 s, attack 170 ms) - sand swish (desert spray)
3. `sand_gust/2411_storm-wind.wav` - Storm wind (2.33 s, peak 1.270 s, attack 524 ms) - storm wind gust
4. `sand_gust/2413_dark-storm-wind.wav` - Dark storm wind (3.18 s, peak 0.480 s, attack 395 ms) - dark storm wind

### wind_whoosh  -  align=peak on the cut (natural, organic transition).
1. `wind_whoosh/1167_wind-passing.wav` - Swoosh wind passing (4.59 s, peak 1.040 s, attack 716 ms) - wind passing whoosh
2. `wind_whoosh/1168_woosh-wind.wav` - Woosh wind (3.12 s, peak 1.140 s, attack 532 ms) - woosh wind
3. `wind_whoosh/2606_wind-woosh.wav` - Wind woosh (3.73 s, peak 0.485 s, attack 357 ms) - wind woosh 4 s
4. `wind_whoosh/1471_cinematic-wind-swoosh.wav` - Cinematic wind swoosh (1.16 s, peak 0.260 s, attack 122 ms) - cinematic wind swoosh

## Gaps / caveats
- No real **tyre squeal / drift** recording with an ad-safe licence was reachable (Mixkit has none; Freesound needs login; Commons search hit rate limits). Role omitted - keep synth or source a licensed squeal.
- No **strong V8/SUV rev**: engine_rev picks are real car starts with a rev (1561 segment B, 1560 segment) and truck accelerations; usable but not a sports-car bark.
- **Car pass-by**: only one true close doppler drive-by (1538); 1627 is a slow heavy truck pass. No aggressive acceleration pass-by.
- **Turbo**: stand-ins (steam swoosh = blow-off, gamma whoosh = spool); no real turbo recording.
- **Tyre on gravel**: 1608 is a bike on gravel (convincing crunch), 1602 a tractor on dirt; no car-on-gravel recording.
- **Braam**: real horn/brass hits, not a modern synth braam (649 is the synth option).
- **Campfire**: not collected.
- Risers 1/2/4 s are cuts of real recordings ending on their natural peak (see `edits`), not separate recordings.
- Beds (drone, hum, wind, typing, ticks) were capped at 10-30 s with a 0.6 s fade-out; their `cleanliness` is low by nature (continuous sound).
