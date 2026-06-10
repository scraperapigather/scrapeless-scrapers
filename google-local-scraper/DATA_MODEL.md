# Google Local data model

The real response shape returned by `scraper.google.search` with `input: { "q": "…", "tbm": "lcl" }`. Captured live from `q: "coffee shops in San Francisco"` — the parsed object is flattened at the **top level** of the POST response, alongside a `metadata` envelope. See [`api/results/local.json`](api/results/local.json) for the captured fixture.

## Top level

| Field | Type | Notes |
| --- | --- | --- |
| `local_results` | object | `{ "places": [...] }` — the local pack listings |
| `suggested_searches` | object[] | Google's filter chips ("Open now", "Top rated", …) |
| `pagination` | object | present but **empty** (`{}`) for the local pack |
| `search_information` | object | query echo + result-state metadata |
| `metadata` | object | Scrapeless envelope: `{ "engine": "google.search", "rawUrl": "…html" }` |

## `local_results.places[]`

One entry per business in the local pack (20 in the captured run).

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `position` | int | yes | 1-indexed rank within the local pack |
| `title` | string | yes | Business name |
| `type` | string | no | Primary category (note: leading space, e.g. `" Coffee shop"`) |
| `rating` | float | no | Star rating (e.g. `4.9`) |
| `reviews` | int | no | Review count as an integer |
| `reviews_original` | string | no | Review count as rendered, e.g. `"(588)"` |
| `price` | string | no | Price tier symbol, e.g. `"$"` |
| `address` | string | no | Street address, e.g. `"1410 Lombard St"` |
| `phone` | string | no | **Noisy in this run** — carried the price band (e.g. `" $1–10 "`) rather than a phone number |
| `hours` | string | no | **Noisy in this run** — carried `rating(reviews)` (e.g. `"4.9(588) "`) |
| `extensions` | string[] | no | Highlighted review snippet(s) (leading whitespace preserved) |
| `thumbnail` | string | no | Inline `data:image/jpeg;base64,…` image — **trimmed in the fixture** (see below) |
| `gps_coordinates` | object | no | `{ "latitude": 0, "longitude": 0 }` — both `0` in this run |
| `place_id` | string | no | Empty string in this run |
| `place_id_search` | string | no | Empty string in this run |
| `lsig` | string | no | Empty string in this run |

## `suggested_searches[]`

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | Chip label, e.g. `"Open now"`, `"Top rated"` |
| `q` | string | Suggested query text |
| `link` | string | Google search URL for the suggestion |
| `uds` | string | Google `uds` token (empty in this run) |
| `thumbnail` | string | Empty in this run |

## `search_information`

| Field | Type | Notes |
| --- | --- | --- |
| `query_displayed` | string | Echoed query, e.g. `"coffee shops in San Francisco"` |
| `organic_results_state` | string | e.g. `"Results for exact spelling"` |
| `total_results` | int | `0` in this run |
| `time_taken_displayed` | string | empty in this run |

## Trims applied to the fixture

- Each `places[].thumbnail` is a real inline JPEG ~4–5 KB of base64 (≈95 KB across the 20 places). In [`api/results/local.json`](api/results/local.json) each thumbnail is truncated to its `data:image/jpeg;base64,` prefix plus a `…<base64 trimmed>` marker. Every other field — including all 20 places — is the verbatim live capture.

## Field-quality caveats (observed, not fabricated)

The actor's local-pack parser occasionally **shifts values between columns**: in this capture `phone` held the price band and `hours` held `rating(reviews)`. Treat `phone`/`hours` as best-effort and prefer the dedicated `rating`, `reviews`, and `price` fields, which were accurate. `place_id`, `gps_coordinates`, and `lsig` came back empty/zero for this query — they may populate for other queries but were not present here.
