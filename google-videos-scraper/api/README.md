# Google Videos — Scraper API (HTTP request method)

The fastest way to pull Google Videos data: one HTTP request to the Scrapeless **Scraper API**, no browser to drive. This surface maps to the **`scraper.google.search`** actor with `tbm: "vid"` and returns a parsed Videos object (video results, inline videos, and more).

- **Endpoint:** `POST https://api.scrapeless.com/api/v1/scraper/request`
- **Auth:** header `x-api-token: $SCRAPELESS_API_KEY` ([get a key](https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers))
- **Actor:** `scraper.google.search` (Google Videos SERP via `tbm: "vid"`; no browser or anti-bot handling needed on your side)

## Request

```json
{
  "actor": "scraper.google.search",
  "input": { "q": "how to scrape websites", "tbm": "vid" }
}
```

| input field | required | description |
| --- | --- | --- |
| `q` | yes | the search query string |
| `tbm` | yes | search vertical — `vid` selects the Videos tab |

## Response

The actor returns the **parsed Videos object directly** (the structured result is flattened at the top level), alongside a Scrapeless `metadata` envelope that points at the stored raw HTML:

```json
{
  "search_information": { "query_displayed": "how to scrape websites", "organic_results_state": "Results for exact spelling" },
  "video_results": [ { "position": 1, "title": "…", "link": "https://www.youtube.com/watch?v=…", "duration": "21:39", "snippet": "…" } ],
  "inline_videos": [ { "position": 1, "link": "https://www.youtube.com/watch?v=…" } ],
  "pagination": {},
  "metadata": { "engine": "google.search", "rawUrl": "https://api.scrapeless.com/storage/…html" }
}
```

- The top-level object **is** the parsed structured result — use it directly (see [`results/videos.json`](results/videos.json) for the full field set captured from a live run).
- `metadata.rawUrl` is a stored copy of the rendered HTML if you want to parse fields the actor does not surface.

## Run it

```bash
export SCRAPELESS_API_KEY=your_api_token_here

# curl
bash curl/videos.sh

# python
python python/request.py

# node
node nodejs/request.mjs
```

## Fixtures

- [`results/videos.json`](results/videos.json) — parsed Videos `result` from a live `q: "how to scrape websites", tbm: "vid"` run.

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
