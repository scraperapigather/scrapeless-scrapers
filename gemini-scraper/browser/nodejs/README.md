# Gemini — Node.js surface

ESM Gemini scraper built on the official [`@scrapeless-ai/sdk`](https://www.npmjs.com/package/@scrapeless-ai/sdk) + puppeteer-core over CDP.

## Authentication

Gemini requires a signed-in Google account. Set `SCRAPELESS_PROFILE_ID` to a Scrapeless profile that has been signed into Google once — the session is created with `profileId` + `profilePersist` so the login is reused. Without it the run lands on the sign-in page and `answer_text` comes back empty. See [`../../DATA_MODEL.md`](../../DATA_MODEL.md).

## Install

```bash
npm install
```

## Run

```bash
export SCRAPELESS_API_KEY=sk_...
export SCRAPELESS_PROFILE_ID=...            # profile signed into a Google account
node run.mjs                                # print to stdout
SAVE_TEST_RESULTS=true node run.mjs         # write to results/*.json
```

## Test

```bash
SCRAPELESS_API_KEY=sk_... SCRAPELESS_PROFILE_ID=... npm test
```

Validates output against [`../../DATA_MODEL.md`](../../DATA_MODEL.md) via zod.
