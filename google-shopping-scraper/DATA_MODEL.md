# Google Shopping data model

Single source of truth for the shape returned by the `scraper.google.search` actor when called with `input.tbm: "shop"`. Field names mirror the live response verbatim — see [`api/results/shopping.json`](api/results/shopping.json) for the captured run (`q: "mechanical keyboard"`, `hl: "en"`, `gl: "us"`).

This surface uses **one** Scrapeless actor over the sync Scraper API:

- `POST /api/v1/scraper/request` with `{ "actor": "scraper.google.search", "input": { "q": …, "tbm": "shop", "hl": …, "gl": … } }` — the `tbm: "shop"` input switches the SERP to Google's Shopping vertical (`udm=28`). The POST response **is** the parsed object (sync; no polling).

> **What the Shopping vertical surfaces.** For `tbm: "shop"` the actor returns the Shopping refinement rail (`refine_this_search`) and the `search_information` envelope, plus an empty `pagination` object and the `metadata` envelope. Product cards are **not** parsed into a dedicated array in this capture; `metadata.rawUrl` holds the rendered Shopping HTML if you need to extract individual listings yourself. No heavy fields were trimmed from the fixture (the parsed Shopping response carries no base64 favicons or inline HTML).

## Top-level object

| Field              | Type   | Required | Notes                                                                 |
| ------------------ | ------ | -------- | --------------------------------------------------------------------- |
| search_information | object | yes      | Query echo + result-state envelope (see below)                        |
| refine_this_search | array  | yes      | Shopping refinement chips — the vertical's filter rail (see below)    |
| pagination         | object | yes      | Pagination envelope; empty `{}` on the Shopping vertical              |
| metadata           | object | yes      | Scrapeless envelope: `engine` + `rawUrl` (stored rendered HTML)       |

## search_information

| Field                  | Type   | Required | Notes                                                            |
| ---------------------- | ------ | -------- | ---------------------------------------------------------------- |
| query_displayed        | string | yes      | The query Google echoed back (e.g. `mechanical keyboard`)        |
| organic_results_state  | string | yes      | Spelling/results state (e.g. `Results for exact spelling`)       |
| total_results          | int    | yes      | Parsed total-results count; `0` on the Shopping vertical capture |
| time_taken_displayed   | string | no       | Rendered "about X seconds" string; empty on the Shopping capture |

## refine_this_search (one per chip)

The Shopping vertical's refinement rail — each entry is a one-click filter (e.g. "Gaming", "Wireless", "Under $50", "Get it by Thu"). The captured run returned 15 chips.

| Field | Type   | Required | Notes                                                                              |
| ----- | ------ | -------- | ---------------------------------------------------------------------------------- |
| query | string | yes      | Chip label / refined query term                                                    |
| link  | string | yes      | Google Shopping URL for the refined search; carries `udm=28` plus a `shoprs` token |

## metadata

| Field  | Type   | Required | Notes                                                            |
| ------ | ------ | -------- | ---------------------------------------------------------------- |
| engine | string | yes      | Always `google.search` for this actor                            |
| rawUrl | string | yes      | Stored copy of the rendered Shopping HTML on Scrapeless storage  |
