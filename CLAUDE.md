# Max Motors / Max Design — content playbook

Marketing content for **Max Motors** (Saudi car dealer) and its sister brand **Max Design** (interior and architectural design and build). The user writes in Arabic; reply in Egyptian Arabic. Captions and voiceovers are in Saudi dialect.

## Standing rules (from the client)
- Keep the look realistic.
- **Max Motors end card:** logo and the unified number **920018915** only, nothing else.
- **Max Design number:** **0579277975**.
- **Campaign messaging:** "كاش أو تمويل" only. No prices and no offers.
- **Don't repeat:** use a new style, assets and music in every video.
- **Captions:** always deliver a caption with every video, and a cover when asked.
- **Presenter:** use Abu Turki (Max Motors' presenter) instead of AI people. **Update: never say or write his name** (not in voiceover, on-screen text, tags or captions); keep using his photos as usual. His reference photo is `production/tools/abu_turki_ref.png`; new expressions are made with Higgsfield edits. He has to approve the edited expressions.
- **Site listings:** skip any car with no interior photo. When the source is a competitor such as Emad Al-Din, use their photos as a design reference only: generate new images in our template and never take their logos, plates or watermarks.

## Voiceover (important)
- **Approved voice: the presenter's own cloned voice, with his consent.** It is a Higgsfield custom voice ("Max Motors Presenter (Saudi)", `voice_type element`, `voice_id fe647dd5-fc13-478b-bd36-524972f8c876`), cloned from his real Saudi voice in the Kashta reel (`production/tools/presenter_voice_ref.mp3`).
  - **Engine:** `text2speech_v2 --variant elevenlabs --voice_id <id> --voice_type element --prompt "<text>"`. This gives the best dialect.
  - **Engines not to use:** Seed Audio is weak in Arabic, and MiniMax drops words.
  - **Rejected generic voices:** Marcus, Omar and MiniMax mispronounced Saudi dialect. Don't use them.
- **Writing the script:**
  - Short lines.
  - Avoid foreign loanwords (البودي, تشيّك…), and avoid «تدوّر», which comes out as «تتدوّر».
  - Avoid ق where you can.
- **Every line:**
  - Generate 2 takes per line, as separate clips.
  - Check them with whisper medium and pick the cleanest.
- **Before publishing:** the client should listen to the result.
- **Current client preference (latest):** the voice from the 16–17 Nov videos, Marcus (ElevenLabs v4, `6f98d3dd-324f-4845-8c28-c1d1647a06cd`), with every word checked. Splice in any phrase that comes out wrong. The client disliked the cloned voice and the presenter's real desk photo, so use his halftone paper cut-outs only (the 16–17 Nov explainer style). Videos without voiceover are still allowed. Give each line 1.5–2.5 s of reading time and put a SFX under every scene change.

## Team (AI agents in `.claude/agents/`)
For any large request, start with `head-of-marketing`: it plans, delegates and gives final approval with the checklist.

| Agent | Role |
| --- | --- |
| `head-of-marketing` | The head: plans, delegates, reviews against the rules |
| `content-strategist` | Ideas, hooks, trends, weekly publishing calendar |
| `copywriter` | Saudi-dialect on-screen text, scripts, captions |
| `voice-producer` | Voiceover in the approved voice, pronunciation checks |
| `motion-editor` | Builds and renders the video, mixes the audio |
| `designer` | Covers, posters, cut-out assets, presenter expressions |
| `listings-specialist` | Site listing photo packs |
| `media-buyer` | Paid campaign planning (does not spend without approval) |
| `ads-manager` | Campaign tracking and weekly reports |
| `data-analyst` | Account performance analysis and market research |

## Tools (`production/tools/`)
| File | What it does |
| --- | --- |
| `gen.sh NAME ASPECT PROMPTFILE REFS...` | Generates an image with gpt_image_2_6 (Higgsfield CLI) |
| `key.py` | Removes a green #00FF00 background |
| `cut.py` | Cuts out the presenter (rembg birefnet-portrait) with a halftone look and a white border |
| `rec.js page.html out.mp4 secs fps [times]` | Records an HTML page that exposes `window.render(t)` into a video, or into frames for review |
| `shot2.js` | HTML → transparent PNG |
| `mix.py` | Mixes voiceover, music and SFX with loudnorm -14 |
| `poll.sh` | Waits for Higgsfield jobs to finish |
| `sp.py` | Splices a voiceover phrase |
| `carcut.py SRC NAME CROP [color]` | Cuts a car out of a site-listing image (removes the template's gold M logo), halftone by default or `color` |
| `sfx/`, `music/` | Sound library. All the older tracks have been used; generate new music with `elevenlabs_music_v2_5` (Higgsfield, `--force_instrumental true`) |

- **Higgsfield CLI** is sometimes slow. Submit with `--json` without `--wait`, then use `poll.sh`.

## Project files
- Every video lives in `production/motion/<name>/` (`ad.html`, `cover.html`, `as/`, `voiceover.mp3`).
- **The explainer series (paper cut-outs).** It used to be called «أبو تركي يختصرها»; new episodes use the tag «نختصرها لك» without his name:
  - Ep. 1, 3 questions: `explainer_3questions`
  - Ep. 2, cash or finance: `explainer_cash_or_finance`
  - Ep. 3, 5 checks before you drive off: `abuturki_ep3_5checks`
  - Ep. 4, first week (part 2): `abuturki_ep4_firstweek`
  - Special (promo), why Max Motors: `abuturki_special_whymaxmotors`
  - Special (promo), guess the car from its silhouette: `abuturki_special_guessthecar`
  - Challenge: 6-second quiz (5 zoomed details, countdown, score): `abuturki_quiz_6seconds`
- **Promo, 4 steps on a board-game road map (no name):** `promo_4steps_roadmap`
- **Promo, chalkboard menu «وش تطلب اليوم؟» (color car cut-outs, own music):** `promo_menu`
- **Promo, chat with voice notes in the presenter's cloned voice:** `promo_chat_voicenotes`
- **Promo «نداء أخير», airport split-flap board (made by the agent team):** `promo_lastcall`
- **Promo «صح ولا غلط؟», 4 myths with stamps, in the series' paper cut-out style (Marcus voice):** `promo_trueorfalse`
- **Promo «قطاع الشركات», company fleets: cars for management, sites and staff buses, cash or corporate finance (paper cut-outs, Marcus voice):** `promo_companies`
- **Promo «وجهتك: سيارتك الجديدة», realistic in-car navigation screen with turn banners and cards (Marcus voice as the nav voice; not paper cut-outs):** `promo_navigation`
- **Promo «نتيجة البحث», light search-engine UI: typed questions, suggestions, first result Max Motors (Marcus voice):** `promo_search`
- **Reel «كم واحد يصيدها؟», real Riyadh KAFD photo + car sticker, 920018915 hidden on a building, zoom reveal (no voice; from a TikTok trend):** `promo_hiddennumber`
- **Reel «مهمة جديدة», open-world game loading-screen style (GTA 6 trend, original art, no game logos), objectives checklist:** `promo_mission_gta`
- **Reel cards trend: presenter (Higgsfield, from his ref photo; Kling 3.0 Turbo clips) swipes our كاش/تمويل cards, car appears. Needs his approval before publishing. Printable cards + shoot plan for a real version in `production/shoots/trend_cards/`:** `trend_cards_reveal`
- **Finished videos:** `MaxMotors_Ads/`, `MaxMotors_Reels/`, `MaxDesign/`.
- **Site listings:** `MaxMotors_Site_Listings/<Brand>/<Model>` (full quality), a `_مضغوط` folder (compressed) and a zip, plus `بيانات_السيارة.txt`.
