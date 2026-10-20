# Next Toyota model for the KSA dealer ad: official driving footage check (2026-10-20)

Candidates in priority order: Yaris, Raize, Highlander, Crown.
Method: KSA facts come from toyota.com.sa (EN) page data (Next.js `__NEXT_DATA__`, grade compare tables).
Footage was searched on the Toyota Europe newsroom, Toyota Australia Pressroom (JSON API), Toyota global newsroom, Toyota USA pressroom, Toyota Canada media site, Toyota Thailand and Middle East sources.
**No video was downloaded in full.** Keyframes were fetched with HTTP range requests (`lib/stock/tools/mp4_kf.py`, one I-frame every ~5 s, 2 s on short clips) or, where the server ignores Range (global.toyota), from a capped prefix of the stream (first 60-80 MB only).
Downloads were treated as untrusted (own folders, `python3 -I`). The work used `nice`. Work files are in `scratchpad/nm/` (about 40 MB).

## Contact sheets in this folder

| File | What |
|---|---|
| `ksa_reference_sheet.jpg` | toyota.com.sa hero, grade and exterior images for all 4 models (the reference look) |
| `highlander_eu_clips_sheet.jpg` | Toyota Europe Highlander: social-01, social-02, 45 s clip (1 frame / 2 s) |
| `highlander_eu_footage900s_sheet.jpg` | Toyota Europe Highlander 15-min footage (only 640x360) |
| `highlander_au_kluger_sheet.jpg` | Toyota Australia 2021 Kluger B-roll (= Highlander), 20 min |
| `highlander_ca_sheet.jpg` | Toyota Canada 2020 Highlander Hybrid Platinum + 2023 Highlander EXT B-roll |
| `crown_global_snowtest_sheet.jpg` | global.toyota Crown Crossover snow test clips (prefix only) |
| `crown_ca_c2c_sheet.jpg` | Toyota Canada 2023 Crown car-to-car B-rolls (Platinum Bronze bi-tone, Limited Heavy Metal, Platinum white) |
| `crown_ca_xle_sheet.jpg` | Toyota Canada 2023 Crown XLE white: car-to-car + exterior B-roll |
| `crown_ca_ltd_heavymetal_ext_sheet.jpg` | Toyota Canada 2023 Crown Limited Heavy Metal exterior B-roll |
| `crown_ca_ltd_broll_sheet.jpg` | Toyota Canada 2023 Crown Limited B-roll (10 min) |

---

## 1. KSA models on toyota.com.sa (EN), captured 2026-10-20

Hero image base: `https://edge.sitecorecloud.io/abdullatifj9343-aljmotorsb309-aljprod6e5f-d335/media/project/alj/alj-motors/toyota/toyota-ksa/vehicles/` (shortened to `…/` below). The site has **no video** for any of the 4 models (the YouTube ID fields are empty).

### Yaris: "Yaris 2026", **sedan only** (no hatchback on the KSA site)
- Page: https://www.toyota.com.sa/en/vehicles/yaris (title "Toyota Yaris 2026 - Stylish Economy Sedan")
- Body: 4-door sedan, 4425 x 1740 x 1480 mm. This is the DNGA-generation Yaris sedan, the Thai "Yaris ATIV" / Vios (2022+) body.
- Grades (SAR, incl. VAT): **Y** 66,987.50 / **Y Plus** 72,852.50 / **YX** 78,832.50
- Engine: **petrol only**: 1.3L 4-cyl DOHC Dual VVT-i, 97 hp @ 6000, 122 Nm @ 4200, CVT with sequential mode, 22.1 km/L, 40 L. **No hybrid.**
- Look: horizontal-bar grille with a "YARIS" plate, slim LED headlamps (all grades), 15in alloys (Y) or 16in (Y Plus, YX). Rear lamps are bulb (Y, Y Plus) or LED (YX). The "TOYOTA" lettering is on the boot lid.
- Hero: `…/passenger/yaris/herobanner/yaris-hero-banner/1870x850/yaris-1870x850.webp` (silver, studio). Driving still: `…/passenger/yaris/features26/desktop/exterior---desktop-view/yaris-2026_exterior-05_desktop-view_856x481.webp`

### Raize: "RAIZE 2026"
- Page: https://www.toyota.com.sa/en/vehicles/raize
- Grades: **XLE** SAR 68,827.50: 1.2L 3-cyl petrol, 87 hp, 113 Nm, CVT, FWD, 16in, halogen headlights + LED DRL. **Limited** SAR 75,497.50: 1.0L **turbo** 3-cyl, 97 hp, 140 Nm, CVT, FWD, 17in, LED headlights with sequential turn signals.
- **Petrol only, no hybrid.** It is the Daihatsu-built (DNGA) Raize in the ASEAN/LatAm spec, with the large hexagonal mesh grille and a "RAIZE" plate.
- Hero: `…/suv/raize/hero-banner/raize-2026.webp` (turquoise, city). Grade image: `…/suv/raize/grades/grade-selector/desktop-view/limited.webp`

### Highlander: "Highlander 2026" (image files still named 2025)
- Page: https://www.toyota.com.sa/en/vehicles/highlander
- Grades: **LE HEV 4X2** SAR 156,630 (FWD, 18in) / **GLE HEV 4X4** 173,535 / **GLE PLUS HEV 4x4** 182,045 (18in GLE design) / **LTD HEV 4X4** 212,635 (20in)
- Engine: **hybrid only**: 2.5L HEV 4-cyl, 240 hp combined, e-CVT. The 4X4 grades have AWD E-Four with Trail Mode. 4950 x 1930 x 1730 mm.
- Look: 4th generation (XU70). Big trapezoid gloss-black mesh grille with a chrome surround, a "HIGHLANDER" plate, LED headlights and DRL, and LED fog lamps on all grades.
- Hero: `…/suv/highlander/hero-banner/highlander-2025.webp` (grey, driving, city). Front: `…/suv/highlander/gallery/ltd/desktop-view/highlander-blrd-desktop-view_0005_limited_full_front_-143.webp`. Side: `…/suv/highlander/grades/grade-selector/desktop-view/limited_side_-14.webp`

### Crown: "Crown 2026" (the site title says "Luxury Sedan", but the body is the **Crown Crossover**)
- Page: https://www.toyota.com.sa/en/vehicles/crown
- Grades: **Prestige** SAR 158,355 and **Premium** 170,315: 2.5L hybrid, 218 hp combined, e-CVT, 26.1 km/L, 19in. **Majesta** 206,195: 2.4L **turbo hybrid** (Dual Boost / "Hybrid MAX"), 344 hp combined, 550 Nm, 6-speed AT, front and rear motors, 21in, HUD.
- All grades have LED head and tail lights and a panoramic roof. The site text describes AWD with a rear motor.
- Look: 16th-gen Crown Crossover. "Hammerhead" full-width LED DRL bar, black lower grille, full-width rear light bar, fastback crossover body. Colours shown: black, copper, massive grey, precious metal, red, white pearl.
- Hero: `…/passenger/crown/hero-banner/crown-2026.webp` (grey, car park). White: `…/passenger/crown/grades/prestige/exterior/desktop/white-pearl-731x411.webp`. Side: `…/passenger/crown/grades/grade-selector/desktop-view/prestige.webp`

---

## 2. Official footage found

### Yaris (KSA = DNGA sedan "Yaris ATIV")
**No official downloadable footage found.**
- Toyota Europe, Australia, Canada and the USA do not sell this body. Their "Yaris" is a different car (the hatch, GR Yaris or Yaris Cross). AU pressroom has "2020 Toyota Yaris" hatch, GR Yaris and Yaris Cross only.
- global.toyota: no Yaris ATIV page or video (the Yaris gallery only has the 2020 Japan hatch and a 14.7 MB parking-assist clip).
- Toyota Thailand (toyota.co.th/model/yarisativ): no video files. The video fields are empty; promotion is on YouTube only. Thailand also now sells the 1.5 HEV, a KSA mismatch.
- Indonesia, Philippines and Mexico (Vios / Yaris Sedán): no press download portal found. YouTube is blocked here ("Sign in to confirm you're not a bot").

### Raize
**No official downloadable footage found.**
- global.toyota Raize launch page (29251184, 2019) and the Japanese HEV page (36254806): images only, no mp4.
- AU, EU, CA and USA: Raize not sold, and there are no assets.
- Mexico and Indonesia: no press video portal found. Indonesia had a Jan-2026 facelift with GR-style aero, which may differ from the KSA car anyway.

### Highlander (KSA = XU70 hybrid). Face matches.

| Source | File (direct URL) | Spec | Size | Match |
|---|---|---|---|---|
| Toyota Europe newsroom, "Toyota launches refined 7-seater Highlander hybrid in Europe" (newsroom.toyota.eu/toyota-launches-refined-7-seater-highlander-hybrid-in-europe/) | https://content.presspage.com/uploads/1523/highlander-dpl-clip-h264-2.mp4 (same as `...-h264.mp4`) | 1920x1080 25p, 45.0 s, 20 Mbps | 117 MB | Yes. Silver hybrid, same grille as the KSA GLE/LTD, 20in two-tone wheels, **LHD**. Belgian plates (1-YUA-154, 1-XVO-...), Belgian farmland, green |
| same | https://content.presspage.com/uploads/1523/2020-toyota-highlander-social-01.mp4 | 1080p 25p, 21.8 s | 51 MB | Yes. Same shoot |
| same | https://content.presspage.com/uploads/1523/2020-toyota-highlander-social-02.mp4 | 1080p 25p, 23.6 s | 29 MB | Yes (mostly interior) |
| same | https://content.presspage.com/uploads/1523/highlander-dpl-footage-h264-low.mp4 | **640x360** 25p, 900 s | 246 MB | Full rushes of the same shoot, but only 360p (preview grade). Use it to find moments, not to cut |
| Toyota Australia Pressroom (API `POST https://pressroom.toyota.com.au/pressroom/toyota/api/search/GetMedia`, Query "Kluger") | https://cdn.tmca.rotorint.com/dam/pressroom-assets-prod/1623121521179-2021%20Toyota%20Kluger%20B-Roll%20V7.mp4 | 1920x1080 25p, 1192 s, 20 Mbps | 2.98 GB | Yes on the face (Kluger = Highlander XU70: Grande, GXL hybrid, GX petrol). **RHD**, AU plates, KLUGER badges |
| Toyota Canada media (media.toyota.ca, album "2020 Highlander Platinum Hybrid Exterior Ruby Flare Pearl B-roll") | https://toyotacanada.scene7.com/is/content/toyotacanada/2020_Highlander_Hybrid_Platinum_AWD_RubyFlarePearl_Exterior_B_ROLL | 1080p 29.97, 624 s, 5.4 Mbps (low bitrate) | 441 MB | **Partial.** US Platinum: chrome multi-bar grille, which differs from the KSA black mesh. "PLATINUM" and "HYBRID" badges (3:30-3:42). LHD, no front plate, Texas parks and old town. Good driving: 4:00-5:30 park road passes, 6:00-6:30 bridge and old town, 7:00-8:18 and 8:42-10:18 low tracking and approaches |
| Toyota Canada (album "2023 Toyota Highlander") | https://toyotacanada.scene7.com/is/content/toyotacanada/2023_Highlander_Turbo_Limited_CypressGreen_EXT_B_ROLL | 1080p 23.976, 288 s, 34 Mbps | 1.26 GB | **Partial / no.** 2.4 **Turbo petrol** Limited (not sold in KSA), US grille, "LIMITED AWD" badge (3:19-3:24). Mostly urban statics and slow rolls (Dallas); little real driving |
| Toyota Canada, others (not sampled) | `2020_Highlander_XLE_AWD_SilverMetallic_Exterior_B_ROLL` (205 s, 141 MB), `2020_Highlander_Platinum_AWD_MoonDust_Exterior_B_ROLL` (566 s, 396 MB), `2022_Toyota_Highlander_Bronze_Exterior_2` (125 s, 206 MB), `2023_Toyota_Highlander_2.4Turbo_Broll` (393 s, 108 MB) | all 1080p | | US/CA-spec (Hybrid/gas) |
| Toyota global newsroom | none for Highlander | | | |
| Toyota USA pressroom | blocked (Cloudflare "Just a moment", 403, also with headless Chromium) | | | |

No Highlander footage is 4K. Everything is 1080p at best.

**Best Highlander moments (approximate keyframe times; confirm frame by frame):**
- EU 45 s clip: 0:04 drone over a road; 0:07-0:09 head-on approach on a country road; 0:12-0:14 drone and approach through a village; 0:24-0:26 low head-on approach on a tree-lined road; **0:28 puddle splash off-road**; 0:31-0:33 gravel turn; 0:40-0:43 front 3/4 static. Plates are visible in most front/rear shots.
- EU social-01: 0:07 drone, 0:09 field pass at sunset, **0:14 splash**.
- AU Kluger: 7:49-8:19 city tracking; 8:25-8:55 coastal-road tracking; **9:55-10:16 dust on dirt (Grande, dark)**; 10:38-11:56 static waterfront Grande; **18:06-19:51 drone on a winding hill road at golden hour (GX silver; car small, plates not legible)**.
- Toyota Canada 2020 Hybrid Platinum: see the table (the face differs from KSA).
- Overall: the only exact-face 1080p material is the EU 45 s clip (green Belgian scenery, plates) and the AU Kluger (RHD). There are no desert shots.

### Crown (KSA = Crown Crossover 2.5 HEV / 2.4 Dual Boost). Face matches exactly.

| Source | File (direct URL) | Spec | Size | Match |
|---|---|---|---|---|
| **Toyota Canada media** (media.toyota.ca/en/albums/2023/2023-toyota-crown1.html; the footage is the North-American "2023 Toyota Crown" shoot in Nashville) | https://toyotacanada.scene7.com/is/content/toyotacanada/2023_Crown_Platinum_BronzeAgeBiTone_C2C_B_ROLL-1 | 1920x1080 23.976, 178 s, 34 Mbps | 762 MB | **Yes.** Platinum = 2.4 Hybrid MAX with 21in wheels = KSA Majesta. Bronze/black bi-tone. **LHD, no front plate** |
| same | https://toyotacanada.scene7.com/is/content/toyotacanada/2023_Crown_Limited_HeavyMetal_C2C_B-ROLL | 1080p 23.976, 209 s | 900 MB | **Yes.** Limited = 2.5 HEV, grey (KSA "massive grey"/"precious metal" look) |
| same | https://toyotacanada.scene7.com/is/content/toyotacanada/2023_Crown_Platinum_OxygenWhite_C2C_B_ROLL | 1080p 23.976, 232 s | 998 MB | **Yes.** White with black roof, 21in (the KSA white pearl is close; check the roof colour) |
| same | https://toyotacanada.scene7.com/is/content/toyotacanada/2023_Crown_XLE_OxygenWhite_C2C_B_ROLL | 1080p 23.976, 97 s | 410 MB | **Yes.** Mono white, 19in = KSA Prestige |
| same | https://toyotacanada.scene7.com/is/content/toyotacanada/2023_Crown_XLE_OxygenWhite_EXT_B-ROLL_1 | 1080p 23.976, 302 s | ~1.3 GB | Yes. Suburban statics + country-road passes |
| same | https://toyotacanada.scene7.com/is/content/toyotacanada/2023_Crown_Limited_HeavyMetal_EXT_B-ROLL | 1080p 23.976, 361 s | 1.57 GB | Yes. Avoid 1:33-1:39 ("LIMITED" and "AWD" badges) |
| same | https://toyotacanada.scene7.com/is/content/toyotacanada/2023_Toyota_Crown_Limited_B-Roll | 1080p 24, 589 s, 18 Mbps | 1.34 GB | Yes, but this is a **studio** B-roll (grey cyc, no driving). A small "Prototype vehicle shown..." disclaimer line sits at the bottom of many shots, so crop it. Best details: 1:28-1:38 grille macro, **3:48-4:13 headlight/DRL light-up**, **6:49-7:04 full-width rear light bar**, 7:10-7:45 side profile |
| same, not sampled (scene7 refuses Range on >1.9 GB files, 403) | `2023_Crown_Platinum_BronzeAgeBiTone_EXT_B-ROLL` (1.91 GB), `2023_Crown_Platinum_OxygenWhite_EXT_B-ROLL` (1.96 GB), `2023_Toyota_Crown_Platinum_B-Roll` (1.94 GB) | 1080p | | likely the same quality |
| same, interiors | `2023_Crown_Limited_HeavyMetal_INT_B-ROLL` (182 s), `2023_Crown_Platinum_INT_B-ROLL` (220 s), `2023_Crown_XLE_OxygenWhite_INT_B-ROLL_1` (125 s), `2023_Toyota_Crown_Platinum_Interior_B-Roll` (446 s) | 1080p | | US/CA interior, **LHD** |
| Toyota global newsroom, "World Premiere of the All-New Crown Series" (global.toyota/en/newsroom/toyota/37540641.html) | `https://global.toyota/pages/news/images/2022/07/15/1400/20220715_01_04.mp4` (cornering, 96 s, 229 MB), `_05` (drawing, 471 MB), `_06` (chasing, 202 s, 482 MB), `_07` (styling, 64.5 s, 154 MB), `20220715_01_01_en.mp4` (2.4 turbo hybrid system, 505 MB) | 1920x1080 29.97, 20 Mbps | | Correct body (Precious Bronze bi-tone RS), but **all on snow** in Hokkaido. No use for KSA. Server ignores Range, so only the first 60-80 MB of each was sampled |
| Toyota USA pressroom (album "2025 Toyota Crown": `2025_Crown_XLE_OxygenWhite_C2C_B_ROLL`, `2025_Crown_Platinum_OxygenWhite_C2C_B_ROLL`) | blocked by Cloudflare | | | Same family; Toyota Canada hosts the 2023 versions |
| Toyota Australia, Toyota Europe | no Crown Crossover video | | | |

No Crown footage is 4K. The best is 1080p 23.976 at ~34 Mbps (very clean, good for a 1080 or 9:16 crop).

**Best Crown moments (keyframe times, ±2 s; confirm frame by frame):**
- Platinum Bronze bi-tone C2C (Majesta look, 21in): 0:10-0:56 tracking front 3/4 on the Nashville bridge with skyline; **0:44 low front 3/4 hero** (full-res check: no plate, no badge in view); 1:24-1:58 head-on and front 3/4 tracking; 2:15-2:26 wheel and front macro on the move; 2:31-2:54 city streets.
- Limited Heavy Metal C2C (grey): 0:11-0:33 front 3/4 tracking; 0:44-1:12 bridge passes; 1:46-1:52 rolling wheel macro; 2:03-2:32 head-on approaches; 2:38-3:23 downtown.
- Platinum Oxygen White C2C: **1:36-1:42 low front 3/4 at speed** (full-res check at 1:37: clean, no plate, DRL bar lit); 0:11-1:31 bridge/skyline tracking; 2:26-3:51 downtown and park.
- XLE Oxygen White C2C (19in = Prestige): 0:11-1:36 bridge tracking; 1:25-1:30 rolling wheel.
- XLE White EXT: 0:11-1:44 suburban statics; 2:06-2:12 rear light bar + CROWN lettering; **3:26-4:56 country-road passes at golden hour** (sun flares 4:11-4:22).
- Limited Heavy Metal EXT: 0:10-1:27 statics; **1:51-2:07 night-ish DRL/headlight light-up**; 2:13-3:59 neighbourhood drive-bys; **4:05-5:55 winding country road passes, golden hour**. Avoid 1:33-1:39 (LIMITED / AWD badges).
- Avoid: the US "LIMITED"/"PLATINUM"/"AWD" badges. KSA uses Prestige/Premium/Majesta names, so keep badges out of frame or mask them. All shoots are green US city/park scenery: no desert.

---

## 3. Middle East sources
- toyota.com.sa (ALJ): no video files on any of the 4 model pages.
- No Toyota Middle East / Al-Futtaim / ALJ press-download portal with video was found (only news coverage on DriveArabia and Arab News).

---

## 4. Usage terms printed on each site

- **Toyota Australia Pressroom**: 2.2 "Access to all resources on Pressroom is restricted to editorial use only." 8.3: no use "for any other purpose, including, but not limited to, advertising, marketing or promotions, without the prior written consent of the copyright holder." (Full copy: `../hilux/au_pressroom_terms.txt`.)
- **Toyota global newsroom** (global.toyota/en/downloadable-assets/ "DOWNLOAD AGREEMENT"): "The Content may only be used for editorial or personal, non-commercial purposes, and may not be used for any commercial purposes, including, without limitation, advertising, marketing and merchandising." Page footer: "(C) TOYOTA MOTOR CORPORATION. All Rights Reserved."
- **Toyota USA pressroom** (pressroom.toyota.com/terms-agreements/, per search snippet; the site itself is Cloudflare-blocked here): materials are for editorial use only; "The use of these materials for advertising, marketing or any other commercial purpose is prohibited."
- **Toyota Europe newsroom** (Presspage): only "Copyright © Toyota". No licence is printed; it is press material, so treat it as editorial only.
- **Toyota Canada media site**: only "© 2026 Toyota Canada Inc." No licence is printed. It is a journalists' media site, and the clips are the same US-produced B-roll whose US terms forbid advertising.
- **toyota.com.sa**: (c) Abdul Latif Jameel Motors / Toyota, all rights reserved.

**None of this footage is cleared for a paid dealer ad.** Using it needs written permission from Toyota / ALJ (in KSA, ask ALJ Toyota marketing, who can usually obtain TMC/TMNA B-roll for dealer use).

---

## 5. Recommendation: do the **Crown** next

| Model | KSA MY / engines | Official moving footage | Face match | Strong driving shots |
|---|---|---|---|---|
| Yaris | 2026, sedan only, 1.3 petrol | none downloadable | - | - |
| Raize | 2026, 1.2 petrol / 1.0 turbo | none downloadable | - | - |
| Highlander | 2026, 2.5 HEV only | EU 1080p 45 s (+ 2 social clips), AU Kluger 1080p 20 min, CA 1080p (US face) | EU/AU yes; CA partial | some: EU approaches and splash, AU dust and drone. But plates or RHD everywhere |
| **Crown** | 2026, 2.5 HEV (Prestige, Premium) + 2.4 turbo HEV (Majesta) | **Toyota Canada: 4 car-to-car + 2 exterior + 1 studio B-roll, 1080p ~34 Mbps, ~25 min in total** | **Yes, exact** (same Crown Crossover; Platinum = Majesta, XLE = Prestige) | **Many**: tracking, approaches, passes, wheel macros, golden-hour country road, light-up details. LHD, no front plates |

Why Crown:
1. It is the only candidate with a large body of official, high-bitrate 1080p **driving** footage of the **exact KSA face**: LHD, no front plates, and grade-equivalent wheels (19in XLE = Prestige/Premium, 21in Platinum = Majesta).
2. Highlander is second. Its exact-face footage is either short (EU 45 s, Belgian plates) or RHD (AU Kluger), and the long Canada B-rolls show the US grille.
3. Yaris and Raize have no official downloadable footage at all, so they can't be done to the same standard.

Caveats for Crown: nothing is 4K (1080p only). All scenery is US city/park/countryside (no desert). Keep the US grade badges out of frame. **The licence is editorial only** (TMNA/TMC terms forbid advertising), so get written clearance from ALJ/Toyota before the ad runs. The 3 files over 1.9 GB (Platinum EXT ×2, Platinum B-roll) could not be range-sampled because scene7 returns 403; they are probably the same shoot.
