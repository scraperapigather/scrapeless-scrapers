# Gemini — Python surface

Async Gemini scraper built on the official [`scrapeless`](https://pypi.org/project/scrapeless/) Python SDK + Playwright over CDP.

## Authentication

Gemini requires a signed-in Google account. Set `SCRAPELESS_PROFILE_ID` to a Scrapeless profile that has been signed into Google once — the session is created with `profile_id` + `profile_persist` so the login is reused. Without it the run lands on the sign-in page and `answer_text` comes back empty. See [`../../DATA_MODEL.md`](../../DATA_MODEL.md).

## Install

```bash
poetry install
poetry run playwright install chromium
```

## Run

```bash
export SCRAPELESS_API_KEY=sk_...
export SCRAPELESS_PROFILE_ID=...           # profile signed into a Google account
python run.py                              # print to stdout
SAVE_TEST_RESULTS=true python run.py       # write to results/*.json
```

## Test

```bash
SCRAPELESS_API_KEY=sk_... SCRAPELESS_PROFILE_ID=... poetry run pytest -v
```

Validates output against [`../../DATA_MODEL.md`](../../DATA_MODEL.md) via cerberus.
