# Google Images data model

Single source of truth for the response shape captured from the `scraper.google.search` actor with `input: { "q": "golden retriever", "tbm": "isch" }`. Field names mirror the live response verbatim — see [`api/results/images.json`](api/results/images.json) for the captured fixture.

This surface uses **one** Scrapeless actor:

- `POST /api/v1/scraper/request` with `actor: "scraper.google.search"` and `tbm: "isch"` (the Google Images vertical; no anti-bot worry, no browser to drive).

The actor returns the parsed object flattened at the top level. For the `isch` vertical it surfaces the image-refinement chips (`suggested_searches`, each with a real base64 thumbnail) plus a stored copy of the fully rendered image page at `metadata.rawUrl`. It does **not** emit a flat `images_results` array — the full image grid lives in the rendered HTML at `metadata.rawUrl`.

## Top-level response

| Field                | Type   | Required | Notes                                                                   |
| -------------------- | ------ | -------- | ----------------------------------------------------------------------- |
| metadata             | object | yes      | Scrapeless envelope — see below                                         |
| pagination           | object | yes      | Pagination block; empty `{}` on the first Images page                   |
| search_information   | object | yes      | Query echo + result-state metadata — see below                          |
| suggested_searches   | array  | yes      | Image-refinement chips Google renders above the grid — see below        |

## metadata

| Field   | Type   | Required | Notes                                                                                     |
| ------- | ------ | -------- | ----------------------------------------------------------------------------------------- |
| engine  | string | yes      | Always `google.search` for this actor                                                     |
| rawUrl  | string | yes      | Stored copy of the fully rendered Google Images page (~1.2 MB, hundreds of image URLs)    |

## search_information

| Field                  | Type   | Required | Notes                                                                  |
| ---------------------- | ------ | -------- | ---------------------------------------------------------------------- |
| query_displayed        | string | yes      | The query Google echoed back (`"golden retriever"`)                    |
| organic_results_state  | string | yes      | Result-state label, e.g. `"Results for exact spelling"`                |
| total_results          | int    | yes      | Parsed total; `0` on the Images vertical (Google omits the count here) |
| time_taken_displayed   | string | no       | Render-time label when Google shows one; empty otherwise               |

## suggested_searches (one per refinement chip)

| Field      | Type   | Required | Notes                                                                                                   |
| ---------- | ------ | -------- | ------------------------------------------------------------------------------------------------------- |
| name       | string | yes      | Chip label, e.g. `"Puppy"`, `"Cute"`, `"Labrador"`, `"Wallpaper"`                                        |
| q          | string | yes      | The refined query the chip maps to, e.g. `"Puppy golden retriever"`                                      |
| link       | string | yes      | Full Google Images URL for the refined search (carries `udm=2`, the Images mode flag)                   |
| uds        | string | no       | Google `uds` refinement token; empty string when Google does not attach one                             |
| thumbnail  | string | yes      | Representative image as a `data:image/jpeg;base64,…` data URI                                            |

### Trimmed fields (heavy)

- `suggested_searches[].thumbnail` — each is a real `data:image/jpeg;base64` data URI ~1.5–2.2 KB. In [`api/results/images.json`](api/results/images.json) the base64 payload is **trimmed** to its first ~64 chars followed by a `<TRIMMED N base64 chars; real data:image/jpeg thumbnail>` marker. The structure and the leading bytes are from the real run; only the long base64 tail is cut.
- `metadata.rawUrl` points at the full rendered page (~1.2 MB of HTML containing the complete image grid). It is referenced by URL, not inlined in the fixture.
