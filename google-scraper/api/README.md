# Google Search — Scraper API (HTTP request method)

The fastest way to pull Google SERP data: one HTTP request to the Scrapeless **Scraper API**, no browser to drive. This surface maps to the **`scraper.google.search`** actor and returns a parsed SERP object (organic results, ads, related searches, and more).

- **Endpoint:** `POST https://api.scrapeless.com/api/v1/scraper/request`
- **Auth:** header `x-api-token: $SCRAPELESS_API_KEY` ([get a key](https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers))
- **Actor:** `scraper.google.search` (Google web search SERP; no browser or anti-bot handling needed on your side)

## Request

```json
{
  "actor": "scraper.google.search",
  "input": { "q": "web scraping" }
}
```

| input field | required | description |
| --- | --- | --- |
| `q` | yes | the search query string |

## Response

The actor returns the **parsed SERP object directly** (the structured result is flattened at the top level), alongside a Scrapeless `metadata` envelope that points at the stored raw HTML:

```json
{
  "search_information": { "query_displayed": "web scraping", "organic_results_state": "Results for exact spelling" },
  "organic_results": [ { "position": 1, "title": "…", "link": "https://…", "snippet": "…" } ],
  "related_searches": [ { "query": "…", "link": "https://…" } ],
  "ads": [],
  "metadata": { "engine": "google.search", "rawUrl": "https://api.scrapeless.com/storage/…html" }
}
```

- The top-level object **is** the parsed structured result — use it directly (see [`results/search.json`](results/search.json) for the full field set captured from a live run).
- `metadata.rawUrl` is a stored copy of the rendered HTML if you want to parse fields the actor does not surface.

## Run it

```bash
export SCRAPELESS_API_KEY=your_api_token_here

# curl
bash curl/search.sh

# python
python python/request.py

# node
node nodejs/request.mjs
```

## Fixtures

- [`results/search.json`](results/search.json) — parsed SERP `result` from a live `q: "web scraping"` run.

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
