# Stock library - Hilux 2027 KSA desert ad (9:16, 1080x1920, 60 fps)

`catalog.json` has one entry per kept clip. Each entry includes `best_segment`, `crop9x16_cx`/`crop4x5_cx` (centre x as a fraction of source width) and `supported_crops`. Contact sheets are in `viz/<need>.jpg`: 5 frames per clip, [SEG] marks frames inside the segment, the yellow box is the 9:16 crop and the cyan box is the 4:5 crop. Sources are under `src/<need>/`.

Licences:
- Mixkit clips: Mixkit Stock Video Free License (commercial use incl. ads, no attribution).
- Coverr clips: Coverr License, free 1080p rendition. Coverr's 4K "original" files are the paid Coverr+ tier, so they were not used.
- AI-generated and "premium" Coverr items were excluded.

Crop rule: 3840x2160 gives a full 9:16 at 0.89x (OK). 1920x1080 allows 4:5 at 1.25x (OK) but full 9:16 needs 1.78x (over the 1.4x limit). For 1080p clips, use 4:5 or a blurred background.

## Best pick per need

| Need | Best clip | Res | Segment | Crop | Why |
|---|---|---|---|---|---|
| 1 Dunes aerial | **mx4149** "Dunes in the Sahara" | 4K 30p | 5.0-11.0 s | 9:16 cx 0.52 | Golden knife-edge dune crest in low warm sun, very clean. It is a locked-off shot, not a drone shot. |
| 1 (alt, true drone) | cv_pink-desert-190 | 1080 30p | 12.3-18.3 s | 4:5 only | Real drone over a dune sea in pink dawn haze. |
| 2 Sun on horizon | **mx4432** | 1080 30p | 0.3-6.3 s | 4:5 (9:16 = 1.78x) | Huge sun disc on a flat black horizon: the iconic shot. |
| 2 (4K alt) | mx4444 | 4K 30p | 0.3-4.3 s (sun visible) | 9:16 cx 0.58 | Time-lapse, sun drops behind a rocky ridge. |
| 3 Wind / sand | **cv_kicking-the-sand-8670** | 1080 24p | 6.8-12.8 s | 4:5 | Backlit sand/dust kicked up low to the ground. Closest available, but not wind over a dune crest. |
| 4 Coffee pour | **mx513** | 4K 30p | 8.5-13.5 s | 9:16 cx 0.47 | Kettle pouring a hot drink over a dusk campfire, warm and cinematic. No dallah (enamel kettle). |
| 5 Falcon | **mx1706** | 4K 24p | 17-23 s | 9:16 cx 0.44 | Raptor silhouette soaring against blue sky; small in frame. Only ≥1080p bird of prey found. |
| 6 Campfire | **mx22730** | 4K 24p | 0.3-6.3 s | 9:16 cx 0.29 | Close flames on logs, black background. For sparks, alt Mixkit 3463 is native vertical 1080x1920 (not downloaded). |
| 7 Stars | **mx4148** | 4K 30p | 9.8-15.8 s | 9:16 cx 0.46 | Milky Way time-lapse over dark rocky peaks. Dark: lift in grade. |
| 8 People / camels | **mx4285** camels | 1080 24p | 0.5-6.0 s | 4:5 | Dromedaries walking past golden dunes. |
| 8 (people) | cv_travelers-in-the-desert-3525 | 1080 24p | 0.3-4.3 s | 4:5 | Tiny silhouettes on a dune ridge at dusk. Ethnicity not readable. |
| 9 Off-road | none downloaded | - | - | - | See gaps. Screened options: Mixkit 44622 (4K drone, white SUV with dust trail, car tiny, brand not legible), 40081 (4K drone dust trail), 40065 (tyre macro, Jeep-style, 1080 vertical). |

## Gaps (not found at ≥1080p on Mixkit or Coverr)

- **Falcon / falconry close-up**: none. Only distant soaring raptors (mx1706). Owls and eagles exist only at 720p or in forest/snow settings.
- **Wind blowing sand over dune crests (macro)**: none. Only kicked sand and static sand textures.
- **Gulf/Arab man in thobe/shemagh**: only 720p. Example: Mixkit 35590 "Arab walking on a sandy desert", 720p, would need 2.7x upscale. Silhouettes of non-identifiable people are the fallback.
- **Arabic coffee / dallah / finjan**: none. Only generic coffee pours (mx513 campfire kettle; mx43941 / mx236 4K studio pours).
- **Dune drone at sunrise/sunset in 4K**: none. 4K Mixkit desert aerials are flat playa/red-rock (USA/Mexico) or rocky terrain. True dune drone footage is Coverr 1080p only.
- **Off-road in sand dunes without branded vehicles**: Mixkit's 4K off-road set is mostly Jeep (brand-identifiable grille) on a dry lakebed. Drone shots (44622, 40081) keep the vehicle too small to identify. Not downloaded because the disk filled up and the wrap-up deadline came first.
- Disk note: the shared disk hit 100% during download (the filesystem has ~1 GB free). Optional alternates were therefore removed, and only the 1-2 best clips per need were kept (~550 MB).

## Official new Hilux footage

See `hilux/README.md`.

- Downloadable new-gen footage exists on two sites:
  - Toyota Europe newsroom: a 4K 64 s clip, plus 1080p B-rolls of the 48V Invincible and BEV. LHD, German plates, green scenery, INVINCIBLE/BEV badging.
  - Toyota Australia Pressroom: 4K B-rolls of SR, SR5, Rogue, Rugged X, Workmate, Pre-production and BEV. RHD, AU plates, bush/green scenery. The SR5 face, wheels and tailgate are very close to the KSA Premium.
- **None shows a desert, and none is cleared for advertising.** The AU T&Cs 2.2/8.3 restrict use to editorial and expressly exclude advertising without written consent. EU/global pages are copyright Toyota with press use only.
- No video exists on toyota.com.sa, and the UK site has no Hilux videos.

## Corolla Cross city set

Stock for the Max Motors **Toyota Corolla Cross Hybrid** 9:16 ad (theme: Riyadh, modern city life, quiet hybrid efficiency). These are atmosphere and life shots only; the car comes from official photos. Clips live in `src/cc_<need>/`, entries are in `catalog.json` (`need` = `cc_*`), contact sheets are in `viz/cc_<need>.jpg` (same legend as above: [SEG] = inside `best_segment`, yellow = 9:16 crop, cyan = 4:5 crop; native-vertical clips show the full frame as 9:16 and a centred 4:5 height crop). Raw analysis numbers are in `analysis_cc.json`.

Licences (recorded per clip in `catalog.json`):
- Mixkit: every clip's item page was checked on 2026-10-19 and says "Mixkit Stock Video Free License". None is marked Restricted or AI.
- Pexels: Pexels License (free for ads, no attribution). The pexels.com pages sit behind a Cloudflare challenge from this machine (curl and headless Chromium both stop at "Just a moment..."), so IDs came from web search and files from the official CDN (`videos.pexels.com/video-files/<id>/<id>-<w>_<h>_<fps>fps.mp4`, found with `tools/px_probe.sh`). All picked uploads are from 2021-2023, before Pexels had AI-generated content. Open each page URL once in a browser before final delivery to confirm.
- Coverr: screened (free 1080p only), but nothing beat the Mixkit/Pexels picks, so none was downloaded. Pixabay: site and API blocked (Cloudflare / needs a key), so it was not used.
- Checked at full resolution: no readable car badge in any pick. Non-car text to manage: a Google "G" on a tower in mx49845, and "CARPENTERS" and "110 Harbor Fwy" signs in mx4240 (see notes).

### Best pick per need

| Need | Best clip | Res / fps | Segment | Crop | Why |
|---|---|---|---|---|---|
| 1 Skyline | **mx49845** | 3840x2160 / 23.976 | 0.5-6.5 s | 9:16 cx 0.72 | Blue-hour drone gliding past lit glass towers: modern, premium, no famous landmark. Austin TX, not Riyadh. Keep the crop right to avoid a Google "G" sign; lift the dark grade. |
| 1 (Riyadh, alt) | px18511357 (see 6) | 1440x2560 / 30 | - | native 9:16 | The only real Riyadh skyline (KAFD) obtainable, but it is daytime. |
| 2 Light trails | **mx40687** | 3840x2160 / 23.976 | 0.75-6.75 s | 9:16 cx 0.46 | Blue-hour skyline plus soft white/red highway trails: city and motion in one calm frame. |
| 2 (alt) | mx4240 | 3840x2160 / 30 | 0.75-6.75 s | 9:16 cx 0.52 | Classic curving freeway streaks. Los Angeles: push in about 1.11x to drop the "CARPENTERS" and "Harbor Fwy" signs at the top. |
| 3 Night street | **mx44697** | 3840x2160 / 23.976 | 3.25-9.25 s | 9:16 cx 0.23 (any) | Slow, drifting multicolour city bokeh on black, brand-free; doubles as an overlay. |
| 3 (vertical) | mx44694 | 1080x1920 / 23.976 | 1.5-7.5 s | native 9:16 | Native-vertical warm avenue bokeh at 1.0x. |
| 4 Cafe | **mx41226** | 3840x2160 / 24 | 0.25-3.5 s (manual) | 9:16 cx 0.65 | Hand lifting a latte-art cup in a warm, dark cafe: the "hands with coffee" shot. A woman's face enters after 3.4 s. |
| 4 (alt) | mx42764 | 3840x2160 / 23.976 | 0.75-4.75 s | 9:16 cx 0.67 | Evening, warm light: a man holds and sips from a ceramic cup on a fire-pit terrace (friends-at-night mood). |
| 5 Family | **px6300822** | 3840x2160 / 25 | 1.5-7.5 s | 9:16 cx 0.51 | A family of four walking hand in hand through a park, filmed from behind with modest clothes. It is sunny afternoon, not dusk, so warm and darken it in the grade. |
| 5 (Gulf alt) | px13378577 | 2560x1440 / 59.94 | 6.25-12.25 s | 9:16 cx 0.47 (1.33x) | Woman in abaya and hijab walking a palm park path in low golden sun: the strongest cultural fit, but a single person. |
| 6 Morning | **mx1618** | 3840x2160 / 23.976 | 9.0-15.0 s | 9:16 cx 0.50 | Sunrise drone over a vast low-rise city in pink haze: a calm start, and the flat sprawl reads close to Riyadh. |
| 6 (Riyadh) | px18511357 | 1440x2560 / 30 | 12.25-18.25 s | native 9:16 (0.75x) | Real Riyadh skyline time-lapse with clouds over KAFD; bright morning or midday light. |
| 7 POV | **mx42038** | 3840x2160 / 23.976 | 0.25-6.25 s | 9:16 cx 0.45 | Night city drive through the windscreen with no dash or wheel in frame, so nothing to badge. |
| 7 (hands) | px8388280 | 2048x1080 / 25 | 22-28 s | 4:5 cx 0.21 (1.25x) | Hand on the steering wheel in blue night light, hub out of frame. 4:5 only; the 4096x2160 master (76 MB) gives full 9:16. |
| 8 Energy | **px12546765** | 2560x1440 / 60 | 0.75-6.75 s | 9:16 cx 0.50 (1.33x) | Blue/teal light-streak warp. Crush the navy background to black, then screen-blend. |

Screened but not downloaded (disk), all Mixkit Free License unless noted:
- Skyline: mx49874 (native-vertical 1080x1920 blue-hour tower, 6 s, 22 MB; downloaded then removed for disk), mx41374 (dusk aerial over a sprawling city, purple sky, 4K, 101 MB), mx49847 (night towers, 4K, 108 MB).
- Street: mx1177 (native-vertical 4K bokeh, 77 s, 387 MB).
- POV: mx50990 (4K night-drive hyperlapse with light streaks).
- Energy: mx4407 (4K white particles on black, 30 MB).
- Pexels: 34505476 "Kingdom Tower Illuminated at Night in Riyadh" (4K) and 32155017 "Aerial View of Riyadh Commercial Area". Both are new uploads whose file names can't be derived without the Pexels page or API. **Download these manually in a browser.** They are the closest match to need 1.

### Gaps

- **Riyadh at dusk or night, ideally a drone shot with Kingdom Centre or KAFD:** none downloadable. Mixkit and Coverr have no Riyadh or Saudi city footage. Mixkit's Gulf clips (Dubai) are 720p and mostly Burj Khalifa. Pexels has Kingdom Tower at night (34505476), but it needs a manual browser download (see above). The fallback is generic blue-hour towers (mx49845, Austin) or the daytime Riyadh time-lapse (px18511357).
- **Gulf skyline at night (non-Saudi, no famous landmark):** none at 1080p or higher on Mixkit or Coverr. Pexels Jeddah or Doha night clips were not found through search.
- **Light trails in a Gulf city:** none. The picks are Mexico-style (mx40687) and Los Angeles (mx4240) cities.
- **Saudi or Gulf family at dusk in a mall or park:** none. The family pick is a Western-looking family in daylight, filmed from behind, and the Gulf pick (px13378577) is a single woman. There is no mall footage with modest dress at 1080p or higher.
- **Cafe with Saudi or Arab people or Arabic coffee at night:** none at 1080p or higher. Mixkit's hijab cafe clips (49287, 49306, 49312) are 720p only.
- **Hands on a steering wheel at night in a city, in 4K and downloaded:** px8388280 is downloaded at 2048x1080 (4:5). For 9:16, get the 4096x2160 master (76 MB). It shows no city lights, just a blue night mood.
- **Clean energy overlay on pure black:** px12546765 has a dark-navy base, not black (crush it before a screen blend). There is no true teal particle-streak-on-black clip at 4K that was free and not AI.
- Disk: the cc set adds 599 MiB (628 MB) across 14 clips. Rejected candidates were only streamed as 360p previews, in scratch space, and deleted. Processing was single-frame grabs plus 4 fps decodes of the 360p previews, with no re-encoding.

Tools added: `tools/mx_search.py` (curl-only Mixkit search, no browser), `tools/px_probe.sh` (probes Pexels CDN renditions by ID), `tools/strips2.sh` (5-frame preview strips from low-res renditions), `tools/dl_cc.sh` + `dl_cc_list.txt` (download list for this set), and `tools/cc_analyze.py` (low-CPU analysis: segment, motion and crops from previews; sheets from 5 single-frame grabs).

## Premium desert set (4K)

Re-pick for the Hilux desert-spirit ad after the client rejected the first set (tiny falcon, flat dunes, weak angles), with the added brief for strong Saudi character (falconer, Arab men in thobe/ghutra, Arabic coffee). Clips are in `src/p_<need>/`, entries in `catalog.json` (`need` = `p_*`, plus an extra `upscale_2160x3840` field), contact sheets in `viz/p_<need>.jpg` (same legend: [SEG] = inside `best_segment`, yellow = 9:16 crop, cyan = 4:5), raw numbers in `analysis_p.json`.

Sources and licence:
- Every pick is **Pexels** (Pexels License: free for ads, no attribution; do not imply endorsement by identifiable people). pexels.com shows a Cloudflare "verify you are human" check from this machine, so pages could not be opened; files come from the official CDN `videos.pexels.com`. All picks are 2020-2023 uploads (IDs up to 19.75M), before Pexels carried AI-generated content. Open each `source_url` once in a browser before delivery.
- Mixkit and Coverr were re-searched (falcon, hawk, eagle, Arab, Saudi, Bedouin, dallah, Arabic coffee, camel, dunes): nothing at 1080p or above beat the Pexels picks (Mixkit raptor close-ups are 720p; Coverr has no falconry or Gulf people).
- How IDs were found: the public Pexels-400k title index (HuggingFace `jovianzm/Pexels-400k`, MIT, 18 MB parquet, IDs up to 19.37M) queried with `tools/pxq.py`, plus web search, plus scanning ID neighbours of good finds on the CDN (`tools/scan.sh`, same uploader batches). Renditions were probed with `tools/px_probe2.sh` (parallel, fixes px_probe.sh missing clips whose SD and 4K files have different fps).
- Pexels uploads from 2024 onward use CDN file names that cannot be derived from the ID (for example 26745835, 33399164), so they cannot be fetched from here.

4K-master caveat: the final video is 2160x3840. A 3840x2160 source gives a 9:16 crop of 1215x2160, so it needs 1.78x to fill 2160x3840 (fine for 1080x1920). Only `px8865368` is native vertical 4K. 1080p landscape picks need 3.56x for full 9:16 at 4K, so use them in 4:5 or as punched-in inserts.

### Best pick per need

| Need | Best clip | Res / fps | Segment | 9:16 crop | Why the angle works |
|---|---|---|---|---|---|
| 1 Falcon / falconer | **px10895820** | 1920x1080 / 25 | 15.75-21.75 s | cx 0.30 (4:5 better) | Hooded falconry raptor fills the frame against blue sky: the falconry hood is the strongest "Gulf falconry" symbol available. Harris-type hawk, not a saker. |
| 1 (eye close-up) | px4186980 | 1920x1080 / 25 | 3.4-6.9 s | cx 0.52 | Tilt up from jessed talons to a razor-sharp eye and beak. |
| 1 (landing) | px7668765 | 1920x1080 / 23.976 | 5.5-10.5 s | cx 0.55 | Bird swoops in and lands with wings fully spread on a perch, dark background. Red kites. |
| 2 Arab men | **px19448053** | 3840x2160 / 50 | 6.0-10.0 s | cx 0.58 (keyframe 0.55 -> 0.62) | Low-angle hero of a Gulf man in kandura and ghutra shading his eyes to scan the horizon. A Chevrolet Tahoe (badge) sits frame-left: keep the crop right of x 0.42 and skip 0-5 s. Midday light. Identifiable person. |
| 2 (silhouette) | px12119036 | 2560x1440 / 25 | 2.0-8.0 s | cx 0.64 | Big dusk silhouettes of a robed man and his camel on a sloping dune. |
| 2 (seated) | px5988892 | 3840x2160 / 25 | 3.5-9.5 s | cx 0.48 | Bedouin in white thawb seated on a dune at dusk, framed by palm fronds. Sinai look, no ghutra. |
| 3 Arabic coffee | **px6358277** | 1920x1080 / 29.97 | 0.3-6.3 s | cx 0.47 | Coffee poured into a gold dallah on a red Sadu rug in the desert, finjan lifted at 10-12 s. Hands only. A branded packet sits at the right edge, outside the crop. |
| 3 (man pouring) | px5988404 | 3840x2160 / 25 | 2.0-8.0 s | cx 0.48 | Man in thawb pours from a silver pot into a glass. It is tea, not a dallah. |
| 4 Dunes aerial | **px11063830** | 3840x2160 / 30 | 1.25-7.25 s | cx 0.84 | Drone skims a knife-edge crest toward a low sun: hard shadow side, flare, depth. |
| 4 (top-down) | px17629657 | 3840x2160 / 25 | 0.25-4.25 s | cx 0.50 | High drone over crescent dunes with long shadows. A camp appears after 4 s. |
| 4 (Saudi) | px19745264 | 3840x2160 / 59.94 | 1.0-7.0 s | cx 0.64 | Real Saudi dune field, telephoto on wind-cut ridges with deep shadows. |
| 5 Sand / wind | **px19745259** | 3840x2160 / 59.94 | 0.5-6.5 s | cx 0.50 | Saudi dune slope with backlit grains blowing through the foreground, golden dunes behind. |
| 5 (ripples, reveal) | px16905150 | 3840x2160 / 23.976 | 1.0-7.0 s (reveal 15-21 s) | cx 0.36 | Wind ripples, then the drone rises to a sunrise dune sea. |
| 5 (vertical) | px8865368 | 2160x4096 / 25 | 3.5-9.5 s | native 9:16 (0.94x) | Ripples running to a crest. The only native-vertical 4K pick. Soft light. |
| 6 Camels | **px14862729** | 1080x1920 / 30 | 1.0-7.0 s | native 9:16 (2.0x at 4K) | Caravan silhouetted on an orange sunset dune, a curving crest leading in. |
| 6 (sun disc) | px15405842 | 1920x1080 / 50 | 3.75-9.75 s | cx 0.55, pan with them | Man leading a camel across the horizon past the setting sun. |
| 7 Road | **px8865211** | 2560x1440 / 25 | 0.25-6.25 s | cx 0.50 | Low drone over an empty road half-buried by drifting sand. No vehicles. |
| 7 (top-down) | px8865372 | 2560x1440 / 25 | 0.25-6.25 s | cx 0.50 | Top-down road through sand with tyre tracks. |
| 8 Rocks | **px4361617** | 3840x2160 / 25 | 13.5-19.5 s | cx 0.53 | Low slider over red sand ripples to dark sandstone cliffs (Wadi Rum, AlUla-like). Midday light. |
| 8 (real AlUla) | px18819906 | 3840x2160 / 29.97 | 1.75-7.75 s | cx 0.50 | AlUla old town under sandstone cliffs, harsh daylight, graffiti at 12 s. |
| 9 Fire | **px4154532** | 3840x2160 / 23.976 | 0.3-4.8 s | cx 0.59 | Bonfire throwing sparks, then a tilt up to sparks and stars over mountains: a built-in fire-to-sky transition. |
| 9 (embers) | px5155376 | 3840x2160 / 25 | 2.75-8.75 s | cx 0.50 | Column of embers on night sky, an overlay-ready insert. |
| 10 Stars | **px5170522** | 3840x2160 / 29.97 | 0.25-6.25 s | cx 0.44 | Milky Way over a dark rocky ridge with a golden horizon glow. Only 6.6 s. |
| 10 (plain) | px9912641 | 2560x1440 / 23.976 | 5.25-11.25 s | cx 0.83 | Wide star time-lapse over a flat dry plain with a pink glow. The "4K" CDN file is really 1440p. |

### Gaps

- **Falcon / falconer:** no saker or peregrine on a glove, no Gulf falconer, no slow-motion take-off, and nothing above 1080p that is close and big. The picks are 1080p falconry hawks and kites. Pexels has only stills of Arab falconers. The 4K alternative px15505119 (Harris hawk perched against a wooden wall, static) was screened but not downloaded.
- **Arab men in thobe and ghutra at golden hour on a dune crest, 4K:** none fetchable. px19448053 has the right look but midday light and a branded SUV beside him. The rest are Sinai Bedouin or silhouettes. Pexels' newer Gulf uploads (for example 33399164 "Man in Traditional Attire Walking on Desert Dunes", UAE) cannot be fetched from here. **Download them manually in a browser.** Identifiable faces (19448053, 5988892, 5988404) must not appear to endorse the car.
- **Arabic coffee poured by a man in traditional dress, or a finjan handed over:** none. The dallah pour is 1080p, hands only. The 4K man-pouring shot is tea.
- **Saudi / Empty Quarter dune drone at golden hour in 4K:** none. The best crest drone (11063830) is not labelled Saudi, and the Saudi clips are telephoto.
- **Sand streaming off a crest in macro:** none. The closest is backlit blowing grains (19745259).
- **4K camel caravan:** none. The best caravan is 1080x1920 native vertical.
- **AlUla or Edge of the World by drone at golden hour:** none. The picks are a Wadi Rum ground slider and a daylight AlUla pan.
- **Road:** 1440p maximum.
- Manual-download candidates seen in search (2024-25 uploads, file names not derivable): 33399164 (man in traditional attire on dunes, UAE), 33110126 (desert sunset over dunes), 26745835 (dunes in the wind), 28676844 (coffee poured into small cups from a brass pot), 31697732 (drive through Riyadh desert).
- Disk: this set adds 589 MB (562 MiB) across 24 files. Screening used 360p previews and poster frames in scratch, which were deleted afterwards. Processing was single-frame grabs plus 4 fps decodes of the 360p previews, with no re-encoding.

Tools added: `tools/px_probe2.sh` (parallel Pexels CDN probe), `tools/scan.sh` (find sibling uploads by ID), `tools/pxq.py` (title search over the Pexels-400k parquet; needs `duckdb`, e.g. `pip install --target <scratch>/pylib duckdb`), `tools/p_analyze.py` (cc_analyze variant: adds `upscale_2160x3840`, writes `analysis_p.json`), and `tools/dl_p.sh` + `dl_p_list.txt` (download list for this set).
