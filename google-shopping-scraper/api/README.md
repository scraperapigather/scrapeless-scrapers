# Google Shopping — Scraper API (HTTP request method)

The fastest way to pull Google Shopping data: one HTTP request to the Scrapeless **Scraper API**, no browser to drive. This surface maps to the **`scraper.google.search`** actor with `input.tbm: "shop"`, which selects Google's Shopping vertical (`udm=28`) and returns a parsed object (shopping refinement rail, search metadata, and more).

- **Endpoint:** `POST https://api.scrapeless.com/api/v1/scraper/request`
- **Auth:** header `x-api-token: $SCRAPELESS_API_KEY` ([get a key](https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers))
- **Actor:** `scraper.google.search` (the `tbm: "shop"` input switches the SERP to the Shopping vertical; no browser or anti-bot handling needed on your side)

## Request

```json
{
  "actor": "scraper.google.search",
  "input": { "q": "mechanical keyboard", "tbm": "shop", "hl": "en", "gl": "us" }
}
```

| input field | required | description |
| --- | --- | --- |
| `q` | yes | the product search query string |
| `tbm` | yes | set to `shop` to select the Google Shopping vertical (mapped to `udm=28`) |
| `hl` | recommended | interface language (e.g. `en`); the Shopping vertical returns `400 {"code":100429}` without a resolvable locale |
| `gl` | recommended | two-letter country for the storefront (e.g. `us`) |

## Response

The actor returns the **parsed Shopping-vertical object directly** (the structured result is flattened at the top level), alongside a Scrapeless `metadata` envelope that points at the stored raw HTML:

```json
{
  "search_information": { "query_displayed": "mechanical keyboard", "organic_results_state": "Results for exact spelling", "total_results": 0 },
  "refine_this_search": [ { "query": "Gaming", "link": "https://www.google.com/search?…&udm=28&shoprs=…" } ],
  "pagination": {},
  "metadata": { "engine": "google.search", "rawUrl": "https://api.scrapeless.com/storage/…html" }
}
```

- The top-level object **is** the parsed structured result — use it directly (see [`results/shopping.json`](results/shopping.json) for the full field set captured from a live run).
- `refine_this_search` is the Shopping vertical's refinement rail — each chip is a Shopping query whose `link` carries `udm=28` (the Shopping vertical) plus a `shoprs` filter token.
- `metadata.rawUrl` is a stored copy of the rendered Shopping page if you want to parse product cards or other fields the actor does not surface into a dedicated array.

## Run it

```bash
export SCRAPELESS_API_KEY=your_api_token_here

# curl
bash curl/shopping.sh

# python
python python/request.py

# node
node nodejs/request.mjs
```

## Fixtures

- [`results/shopping.json`](results/shopping.json) — parsed Shopping-vertical result from a live `q: "mechanical keyboard", tbm: "shop"` run.

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
