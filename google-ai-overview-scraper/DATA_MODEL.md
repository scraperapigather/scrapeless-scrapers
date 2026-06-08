# Data Model — Google AI Overview (`scraper.overview`)

A successful call returns the canonical envelope `{ status, task_id, task_result }`. The fields below live in `task_result`.

## AIOverview (`task_result`)

| Field | Type | Description |
| --- | --- | --- |
| `content` | string | AI Overview body as **markdown**, with inline `[N]` citation refs and a footnote table of source URLs. |
| `rawtext` | string | The same body with citations and embedded media stripped — plain prose for embeddings / LLM prompts / index ingestion. |
| `source` | array\<Source\> | The AIO's **cited-sources** panel (the pages Google attributes the answer to). Count from this for GEO share-of-citation. |
| `web_source` | array\<Source\> | The **related-search** panel rendered beneath the AIO (same shape as `source`). |
| `ads` | array\<Ad\> | Sponsored placements that ran above the AIO for the same query. |
| `is_overview_shopping` | boolean | True when Google classified the AIO itself as shopping-oriented. |
| `is_shopping` | boolean | True when the underlying SERP carried a shopping module. |
| `purchase_link` | boolean | True when the AIO body contains at least one direct purchase link. |
| `products` | array\<Product\> \| null | Structured product list for shopping AIOs; `null` for many AIOs even when `is_shopping` is true — code defensively. |
| `metadata.rawUrl` | string | The equivalent `google.com/search?…` URL the actor used internally (audit / cross-check). |

## Source

| Field | Type | Description |
| --- | --- | --- |
| `title` | string | Source page title. |
| `url` | string | Source URL. |
| `website_name` | string | Display name of the source site. |
| `snippet` | string | Snippet shown with the citation (when present). |

## Notes

- Not every query surfaces an AI Overview. When Google does not, the API returns `{ "status": "failed", "message": "execution failed" }` — re-phrase to an informational query.
- AI Overviews are non-deterministic and drift over time; pin the `country` and a timestamp when capturing for monitoring, and treat the body as a sample. The cited-source set is more stable than the prose.
