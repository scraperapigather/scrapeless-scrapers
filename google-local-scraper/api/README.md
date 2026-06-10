# Google Local — Scraper API (HTTP request method)

The fastest way to pull the Google **local pack** (the map-backed business listings): one HTTP request to the Scrapeless **Scraper API**, no browser to drive. This surface maps to the **`scraper.google.search`** actor with `tbm: "lcl"` and returns a parsed local object (places, ratings, addresses, suggested filters, and more).

- **Endpoint:** `POST https://api.scrapeless.com/api/v1/scraper/request`
- **Auth:** header `x-api-token: $SCRAPELESS_API_KEY` ([get a key](https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers))
- **Actor:** `scraper.google.search` (Google search SERP; `tbm: "lcl"` selects the Local pack — no browser or anti-bot handling needed on your side)

## Request

```json
{
  "actor": "scraper.google.search",
  "input": { "q": "coffee shops in San Francisco", "tbm": "lcl" }
}
```

| input field | required | description |
| --- | --- | --- |
| `q` | yes | the local search query string — include a city/locality for best results (e.g. `coffee shops in San Francisco`) |
| `tbm` | yes | set to `lcl` to select the Local pack instead of the web SERP |

> **Flaky note:** the Local pack can intermittently return `{"code":20500,"message":"scraping failed"}`. Retry a few times and/or add a more specific locality to the query — the captured fixture here came back on a retry with a city-qualified query.

## Response

The actor returns the **parsed local object directly** (the structured result is flattened at the top level), alongside a Scrapeless `metadata` envelope that points at the stored raw HTML:

```json
{
  "local_results": { "places": [ { "position": 1, "title": "…", "rating": 4.9, "reviews": 588, "type": " Coffee shop", "address": "1410 Lombard St", "thumbnail": "data:image/jpeg;base64,…" } ] },
  "search_information": { "query_displayed": "coffee shops in San Francisco", "organic_results_state": "Results for exact spelling" },
  "suggested_searches": [ { "name": "Open now", "q": "…", "link": "https://…" } ],
  "pagination": {},
  "metadata": { "engine": "google.search", "rawUrl": "https://api.scrapeless.com/storage/…html" }
}
```

- The top-level object **is** the parsed structured result — use it directly (see [`results/local.json`](results/local.json) for the full field set captured from a live run).
- `metadata.rawUrl` is a stored copy of the rendered HTML if you want to parse fields the actor does not surface.
- Each `places[].thumbnail` is an inline `data:image/jpeg;base64,…` blob; the fixture trims these (see [`../DATA_MODEL.md`](../DATA_MODEL.md)).

## Run it

```bash
export SCRAPELESS_API_KEY=your_api_token_here

# curl
bash curl/local.sh

# python
python python/request.py

# node
node nodejs/request.mjs
```

## Fixtures

- [`results/local.json`](results/local.json) — parsed local pack from a live `q: "coffee shops in San Francisco", tbm: "lcl"` run (20 places; thumbnail base64 trimmed).

## Fair Use & Legal Disclaimer

See [the repo DISCLAIMER](../../DISCLAIMER.md). Educational reference only — review the target site's Terms of Service and `robots.txt`, never collect personal data protected under GDPR/CCPA, and throttle requests.

## Powered by Scrapeless

- 🌐 Website: https://www.scrapeless.com
- 🧭 Scraping Browser: https://www.scrapeless.com/en/product/scraping-browser
- 📚 API docs: https://apidocs.scrapeless.com
- 📝 Blog: https://www.scrapeless.com/en/blog
- 💬 Discord: https://discord.gg/VU2vtbq7Q2
- ✈️ Telegram: https://t.me/scrapeless
- 🚀 Free signup: https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers
