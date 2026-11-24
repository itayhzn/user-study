# Caption study (branch `dch`)

Blinded pairwise study: a photo, two descriptions of it (A/B, differences highlighted), and
A / Tie / B on fluency, accuracy and correct details. One description is always DCH; the other
is the Cut-only text (`cut`), the original caption (`orig`) or the strong LLM repair (`llm`).

1. `python scripts/build_study.py` rebuilds `images/manifest.json` and `images/photos/`
   (60 captions, 30 COCO and 30 AMBER, a fixed random sample of the judged panel).
2. Create a **new** Google Sheet, deploy `google-apps-script/Code.gs` as a web app, and put its
   URL in `config.json` (`googleAppsScriptUrl`). Until then, answers are downloaded as JSON.
3. `python scripts/serve.py`, or any static host. Give every rater a personal link with a
   running number: `.../?r=1`, `?r=2`, `?r=3`, ... Three consecutive numbers cover every
   (caption, opponent) pair once, six cover it twice (needed for agreement). No rater sees a
   caption twice; a rater gets 47 to 51 questions. Pairs with identical texts are never shown
   and count as ties in the analysis.
4. `python scripts/analyze_study.py responses.csv` (or the downloaded JSON files).

Answers live in memory until the last page: reloading the page restarts the session.
