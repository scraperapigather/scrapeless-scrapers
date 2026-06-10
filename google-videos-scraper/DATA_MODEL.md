# Google Videos data model

Single source of truth for the parsed Videos object returned by the **`scraper.google.search`** actor when called with `input.tbm: "vid"`. Field names mirror the live response verbatim. The full capture lives at [`api/results/videos.json`](api/results/videos.json) (from a live `q: "how to scrape websites", tbm: "vid"` run).

This surface is served by the Scrapeless **Scraper API** — `POST /api/v1/scraper/request` with `{"actor": "scraper.google.search", "input": {"q": …, "tbm": "vid"}}`. The POST response **is** the parsed object (synchronous, no polling), flattened at the top level next to a `metadata` envelope.

> **Trimming:** none. The live response contained no oversized fields (no base64 images, no inline raw HTML), so `api/results/videos.json` is the complete, untrimmed capture. The rendered HTML is referenced — not embedded — via `metadata.rawUrl`.

## Top level

| Field                | Type     | Notes                                                              |
| -------------------- | -------- | ------------------------------------------------------------------ |
| `video_results`      | object[] | The Videos-tab results (one per video). See below.                 |
| `inline_videos`      | object[] | Compact list of the same videos (position + link only).            |
| `pagination`         | object   | Pagination block; `{}` (empty) on this single-page run.            |
| `search_information` | object   | Query metadata. See below.                                         |
| `metadata`           | object   | Scrapeless envelope: `engine` + `rawUrl` (stored rendered HTML).   |

## video_results — one per video

| Field            | Type   | Required | Notes                                                             |
| ---------------- | ------ | -------- | ----------------------------------------------------------------- |
| `position`       | int    | yes      | 1-indexed position in the Videos tab                              |
| `title`          | string | yes      | Video title                                                       |
| `link`           | string | yes      | Destination URL (e.g. a YouTube watch URL)                        |
| `displayed_link` | string | yes      | Breadcrumb-style displayed URL, e.g. `www.youtube.com › watch`    |
| `snippet`        | string | yes      | Description snippet text                                          |
| `duration`       | string | yes      | Runtime as shown, e.g. `21:39`                                    |
| `rich_snippet`   | object | yes      | Nested extension data — see below                                 |
| `video_link`     | string | no       | Thumbnail/preview asset URL (`encrypted-vtbn0.gstatic.com/video…`); present on 7 of 10 results in the capture |

### video_results[].rich_snippet

| Field                          | Type     | Notes                                                          |
| ------------------------------ | -------- | -------------------------------------------------------------- |
| `top.detected_extensions.date` | string   | Upload date, e.g. `Apr 11, 2024`                               |
| `top.extensions`               | string[] | Source/channel/date chips, e.g. `["YouTube", "Kunal Kushwaha", "Apr 11, 2024"]` |

## inline_videos — one per video

| Field      | Type   | Required | Notes                                  |
| ---------- | ------ | -------- | -------------------------------------- |
| `position` | int    | yes      | 1-indexed position                     |
| `link`     | string | yes      | Destination URL (YouTube watch URL)    |

## search_information

| Field                   | Type   | Notes                                                  |
| ----------------------- | ------ | ------------------------------------------------------ |
| `query_displayed`       | string | Query echoed back, e.g. `how to scrape websites`       |
| `organic_results_state` | string | e.g. `Results for exact spelling`                      |
| `total_results`         | int    | Total result count (`0` on this run)                   |
| `time_taken_displayed`  | string | Rendered timing string (empty on this run)             |

## metadata

| Field    | Type   | Notes                                                            |
| -------- | ------ | --------------------------------------------------------------- |
| `engine` | string | `google.search`                                                 |
| `rawUrl` | string | Stored copy of the rendered HTML — parse it for any unsurfaced fields |
