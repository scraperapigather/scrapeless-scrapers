# Gemini data model

Single source of truth for the Python (cerberus) and Node (zod) schemas under [`python/`](python/) and [`nodejs/`](nodejs/).

The scraper navigates to `https://gemini.google.com/app`, types the prompt into the rich-text contenteditable input, presses Enter, and waits for the answer to render. The question is the prompt echoed in the latest user turn; the answer is the latest model response block; citations are deduped outbound `<a href>` elements that are not Google/Gemini-internal.

## Authentication requirement

Gemini's web app is gated behind a signed-in Google account — an anonymous session lands on the Google sign-in page and the scraper returns an empty `answer_text`. A signed-in browser context is therefore required.

We supply this through a **Scrapeless session profile**: a profile that already carries the Google login cookies. Set `SCRAPELESS_PROFILE_ID` to a profile you have signed into once, and the session is created with `profileId` + `profilePersist` so the login state is reused (and refreshed) across runs. See [the Scrapeless profiles docs](https://docs.scrapeless.com/en/scraping-browser/features/profiles). Without a signed-in profile, the run cannot reach an answer page.

## Search — emitted by `scrape_search`

| Field         | Type     | Required | Notes                                                                  |
| ------------- | -------- | -------- | ---------------------------------------------------------------------- |
| query         | string   | yes      | Original prompt submitted to Gemini                                    |
| url           | string   | yes      | Gemini conversation URL (`/app/<id>`)                                  |
| answer_text   | string   | yes      | Plain-text concatenation of the answer prose                           |
| citations     | object[] | yes      | Deduped outbound citations: `{ url, domain, title }`                   |
