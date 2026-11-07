# Official new-generation (9th gen) Hilux footage - findings (2026-10-19)

No video files were downloaded in full. The files are 0.6-8.8 GB each, and their licence terms block use in ads (see below). Every finding comes from keyframes fetched with HTTP range requests (1 frame/5 s for AU, 1/2 s for EU, 1/1 s for the EU 4K clip). Check sheet: `hilux_official_check_sheet.jpg` (also `sheet_eu4k.jpg`, `sheet_sr5.jpg`).

KSA reference look (specs.txt sec. 8): DC-Premium 4.0 has black over-fenders on all arches, 18in diamond-cut/gloss-black wheels, a new-gen face, **LHD**, no HYBRID/48V/BEV/GR/Rogue/SR5 badges, and is shown in desert.

## Sources found

| Source | Files (direct MP4) | Spec | Look vs KSA Premium | Usable? |
|---|---|---|---|---|
| Toyota Europe newsroom, "The all-new Toyota Hilux" (newsroom.toyota.eu/the-all-new-toyota-hilux/) | `2026_hilux_clip_4k1.mp4` (670 MB) | 3840x2160 25p, 64 s | New-gen face. Sulphur-yellow Invincible 48V + dark-grey car. Black over-fenders on the Invincible. **LHD** (EU). German "K-..." plates visible. Scenery all **green** (forest, meadow, mud). Ends on a Toyota logo card (62 s+). | Look partly matches (face, arches). Scenery is wrong, plates need masking, and an "INVINCIBLE" decal shows on the bed side in some shots. |
| same page | `2026_hiluxhybrid48v_invincible_sulphuryellow_b-roll_hd.mp4` (936 MB) | 1920x1080 25p, 615 s | Invincible 48V: "INVINCIBLE" bed decal (~50 s), HILUX door script, German plate K-HX 5533, interior shows **LHD** wheel (~554 s), green hills. | Reject for KSA unless decals and plates are masked; scenery is green. 1080p only. |
| same page | `2026_hiluxbev_highgrade_ashgrey_b-roll_hd.mp4` (893 MB) | 1920x1080 25p, 472 s | Ash-grey high-grade **BEV**. "BEV" tailgate badge (~408 s), plate K-UO 650E, green scenery, LHD. Front/side shots (e.g. ~326 s, ~367 s) look closest to the KSA Premium face. | BEV badge and electric context must be rejected or masked. Green scenery. |
| Toyota Australia Pressroom (pressroom.toyota.com.au, API search "Hilux") | 2025 HiLux SR5 (6.2 GB, 554 s), SR (2.8 GB), Rugged X (7.2 GB), Rogue (8.8 GB), Workmate (3.6 GB), Range (575 MB, 51 s), Pre-production (5.0 GB, 445 s); 2026 HiLux BEV SR5 (6.8 GB, HEVC), BEV SR (6.0 GB) | all 3840x2160 25p, ~90 Mbps | New-gen. SR5: white car, honeycomb grille, embossed TOYOTA tailgate, 18in black/machined wheel (~250 s), very close to the KSA face, wheels and rear. But **RHD**, Australian plates, SR5/Rogue/Rugged X/BEV grade badging, green/Australian-bush scenery (creeks, gravel roads; no sand dunes). Range video = green hills line-up. | Exterior-only shots with no badge or plate in view could be visually close. **Licence forbids ads** (below). |
| Toyota global newsroom (global.toyota/en/newsroom/toyota/43512628.html) | `20251110_04_01_en.mp4` (969 MB) | - | Stage speech by the Chief Branding Officer at the Bangkok premiere (not B-roll). Other video is YouTube-only. | No. |
| Toyota UK media site | Press pack PDFs only. The "Videos > Hilux (2026)" page returns "Nothing Found". | - | - | No. |
| toyota.com.sa (ALJ) | No video (VideoLink empty, see specs.txt sec. 9). | - | - | - |
| Toyota Thailand | No downloadable press video found (YouTube teasers only). | - | - | - |

## Usage terms printed on the sites

- **Toyota Australia Pressroom T&Cs** (copy in `au_pressroom_terms.txt`):
  - 2.2: "Access to all resources on Pressroom is restricted to editorial use only."
  - 8.3: "...the limited right to use and edit the Content for editorial use... You may not otherwise ... use it for any other purpose, including, but not limited to, advertising, marketing or promotions, without the prior written consent of the copyright holder."
  - **Not usable in this ad without written consent from TMCA.**
- **Toyota Europe newsroom** (Presspage): the page shows only "Copyright © Toyota 2026". No explicit licence. The material is press material for editorial use; treat it as not cleared for advertising.
- **global.toyota**: copyright Toyota Motor Corporation. Press use only.

## Usable seconds

**None are cleared for an ad.** If the client gets written permission from Toyota or ALJ, these are the visually closest exterior moments (approximate, from 1-5 s keyframe sampling; confirm frame by frame before cutting):

- EU 4K clip (LHD, green scenery):
  - 5-12 s: front 3/4 driving, yellow and grey. Plates visible: mask them.
  - 19-24 s: side and rear on a forest track.
  - 38 s: front 3/4 low angle on dirt.
  - 43-58 s: drone shots on a track (car small, plates not legible).
- EU BEV high grade (LHD):
  - ~326 s: grey side static.
  - ~367 s: front close-up with the TOYOTA band. Plate needs masking.
  - Avoid ~408 s (BEV badge).
- AU SR5 (RHD):
  - ~100 s: rear 3/4 with the embossed TOYOTA tailgate. HILUX badge visible; plate needs masking.
  - ~150 s: honeycomb grille macro (no plate, no badge, side-agnostic). This is the safest detail shot.
  - ~250 s: 18in wheel macro (side-agnostic).
  - Exteriors at 50, 350, 400 and 550 s show RHD only if the cabin is visible. All are green or bush scenery.
- **No official footage shows the car in a desert.** Desert context must come from the stock library plus the KSA official stills.
