# Max Motors / Max Design — content playbook

Marketing content for **Max Motors** (Saudi car dealer) and its sister brand **Max Design** (interior and architectural design and build). The user writes in Arabic; reply in Egyptian Arabic. Captions and voiceovers are in Saudi dialect.

## Standing rules (from the client)
- Keep the look realistic.
- **Max Motors end card:** logo and the unified number **920018915** only, nothing else.
- **Max Design number:** **0579277975**.
- **Campaign messaging:** "كاش أو تمويل" only. No prices and no offers.
- **Don't repeat:** use a new style, assets and music in every video.
- **Captions:** always deliver a caption with every video, and a cover when asked.
- **Presenter:** use Abu Turki (Max Motors' presenter) instead of AI people. His reference photo is `production/tools/abu_turki_ref.png`; new expressions are made with Higgsfield edits. He has to approve the edited expressions.
- **Site listings:** skip any car with no interior photo. When the source is a competitor such as Emad Al-Din, use their photos as a design reference only: generate new images in our template and never take their logos, plates or watermarks.

## Voiceover (important)
- The TTS is ElevenLabs v4 through Higgsfield, voice Marcus (`6f98d3dd-324f-4845-8c28-c1d1647a06cd`). It is not a native Arabic voice.
- **Writing the script:**
  - Avoid foreign loanwords (البودي, تشيّك…).
  - Avoid ق where you can, or add diacritics (قَبْل).
- **Every take:**
  - Generate 2–3 takes.
  - Check them word by word with whisper medium, then check suspicious words in isolation in Arabic and in English.
  - Pick the cleanest take, and fix single errors by splicing in a re-recorded phrase (`sp.py`).
- **Before publishing:** the client should listen to the result. A real recording by Abu Turki is best.

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
| `sfx/`, `music/` | Sound library |

- **Higgsfield CLI** is sometimes slow. Submit with `--json` without `--wait`, then use `poll.sh`.

## Project files
- Every video lives in `production/motion/<name>/` (`ad.html`, `cover.html`, `as/`, `voiceover.mp3`).
- **The «أبو تركي يختصرها» series (explainer style, paper cut-outs):**
  - Ep. 1, 3 questions: `explainer_3questions`
  - Ep. 2, cash or finance: `explainer_cash_or_finance`
  - Ep. 3, 5 checks before you drive off: `abuturki_ep3_5checks`
  - Ep. 4, first week (part 2): `abuturki_ep4_firstweek`
  - Special (promo), why Max Motors: `abuturki_special_whymaxmotors`
- **Finished videos:** `MaxMotors_Ads/`, `MaxMotors_Reels/`, `MaxDesign/`.
- **Site listings:** `MaxMotors_Site_Listings/<Brand>/<Model>` (full quality), a `_مضغوط` folder (compressed) and a zip, plus `بيانات_السيارة.txt`.
