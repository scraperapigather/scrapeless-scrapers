# Google Scholar data model

Single source of truth for the shape returned by the **`scraper.google.scholar`** actor. Field names mirror the live response verbatim (captured from a `q: "transformer neural network"`, `hl: "en"` run — see [`api/results/scholar.json`](api/results/scholar.json)).

This actor is **API-only** and **synchronous**: a single `POST` returns the parsed object directly. No browser, no polling. The actor is **flaky** — it intermittently returns `{"code":20500,"message":"scraping failed"}`; retry until you get `{ metadata, scholar_result }` (the live fixture landed on the 3rd attempt).

## Top level

| Field            | Type   | Notes                                                                 |
| ---------------- | ------ | --------------------------------------------------------------------- |
| `metadata`       | object | Scrapeless envelope — `engine` and `rawUrl` (stored rendered HTML)    |
| `scholar_result` | object | The parsed Google Scholar result (everything below lives here)        |

### metadata

| Field    | Type   | Notes                                                       |
| -------- | ------ | ----------------------------------------------------------- |
| `engine` | string | `"google.scholar"`                                          |
| `rawUrl` | string | URL to the stored rendered HTML if you want to re-parse it  |

## scholar_result

| Field                | Type     | Notes                                          |
| -------------------- | -------- | ---------------------------------------------- |
| `search_information` | object   | Query echo + result counts (see below)         |
| `organic_result`     | object[] | The academic results, 10 per page (see below)  |
| `related_search`     | object[] | "Related searches" suggestions                 |
| `pagination`         | object   | Current page + links to following pages         |

### search_information

| Field                  | Type   | Notes                                            |
| ---------------------- | ------ | ------------------------------------------------ |
| `total_results`        | int    | Approximate total hit count (e.g. `1130000`)     |
| `time_taken_displayed` | float  | Seconds Google reports the query took            |
| `query_displayed`      | string | The interpreted query string                     |

### organic_result[] — one per paper

| Field              | Type   | Required | Notes                                                                  |
| ------------------ | ------ | -------- | ---------------------------------------------------------------------- |
| `position`         | int    | yes      | 1-indexed position on the page                                         |
| `title`            | string | yes      | Paper title                                                            |
| `result_id`        | string | yes      | Scholar cluster id for the result                                      |
| `link`             | string | no       | Destination URL of the paper (may be absent for some entries)          |
| `snippet`          | string | no       | Snippet / abstract excerpt                                             |
| `publication_info` | object | no       | Citation line + parsed authors (see below)                             |
| `resources`        | object[] | no     | Available copies — `title`, `file_format` (e.g. `[PDF]`), `link`       |
| `inline_links`     | object | no       | Cited-by, related-pages, and versions links (see below)                |

#### organic_result[].publication_info

| Field     | Type     | Notes                                                                   |
| --------- | -------- | ----------------------------------------------------------------------- |
| `summary` | string   | The raw citation line (`authors - source, year - host`)                 |
| `author`  | object[] | Parsed authors, each `{ name, link, author_id }` (only linked authors)  |

#### organic_result[].inline_links

| Field                | Type   | Notes                                                                         |
| -------------------- | ------ | ----------------------------------------------------------------------------- |
| `cited_by`           | object | `{ link, total, cites_id }` — citation count + link to the citing papers      |
| `related_pages_link` | string | Link to "Related articles"                                                    |
| `versions`           | object | `{ total, link, cluster_id }`; `total`/`cluster_id` omitted when single-version |

### related_search[] — one per suggestion

| Field   | Type   | Notes                                       |
| ------- | ------ | ------------------------------------------- |
| `query` | string | Suggested follow-up query                   |
| `link`  | string | Scholar search URL for the suggestion       |

### pagination

| Field         | Type   | Notes                                                          |
| ------------- | ------ | -------------------------------------------------------------- |
| `current`     | int    | Current page number (1)                                        |
| `next`        | string | URL for the next page of results                               |
| `other_pages` | object | Map of page number → result URL (`"2"`…`"10"` in the fixture)  |

## Trims

None. The live response is compact (~19 KB) with no raw-HTML, base64, or binary fields embedded — the rendered HTML is referenced by URL only (`metadata.rawUrl`). [`api/results/scholar.json`](api/results/scholar.json) is the **full, untrimmed** capture (10 organic results, 8 related searches).
