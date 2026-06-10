# Google Images — Scraper API (HTTP request method)

The fastest way to pull Google Images data: one HTTP request to the Scrapeless **Scraper API**, no browser to drive. This surface maps to the **`scraper.google.search`** actor with `tbm: "isch"` (the Google Images vertical) and returns a parsed object plus a stored copy of the fully rendered image page.

- **Endpoint:** `POST https://api.scrapeless.com/api/v1/scraper/request`
- **Auth:** header `x-api-token: $SCRAPELESS_API_KEY` ([get a key](https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers))
- **Actor:** `scraper.google.search` (Google web search SERP; `tbm: "isch"` switches it to the Images vertical — no browser or anti-bot handling needed on your side)

## Request

```json
{
  "actor": "scraper.google.search",
  "input": { "q": "golden retriever", "tbm": "isch" }
}
```

| input field | required | description |
| --- | --- | --- |
| `q` | yes | the image search query string |
| `tbm` | yes | search vertical — `"isch"` selects Google Images |
| `hl` | no | UI language, e.g. `"en"` |
| `gl` | no | country/locale, e.g. `"us"` |
| `google_domain` | no | Google domain to hit, e.g. `".google.com"` |

## Response

The actor returns the **parsed Images object directly** (flattened at the top level), alongside a Scrapeless `metadata` envelope that points at the stored raw HTML:

```json
{
  "metadata": { "engine": "google.search", "rawUrl": "https://api.scrapeless.com/storage/…html" },
  "pagination": {},
  "search_information": { "query_displayed": "golden retriever", "organic_results_state": "Results for exact spelling", "total_results": 0, "time_taken_displayed": "" },
  "suggested_searches": [
    { "name": "Puppy", "q": "Puppy golden retriever", "link": "https://www.google.com/search?…&udm=2…", "uds": "", "thumbnail": "data:image/jpeg;base64,…" }
  ]
}
```

- The top-level object **is** the parsed structured result — use it directly (see [`results/images.json`](results/images.json) for the full field set captured from a live run).
- `suggested_searches` are the image-refinement chips Google renders above the grid; each carries a real `data:image/jpeg;base64` `thumbnail`.
- `metadata.rawUrl` is a stored copy of the fully rendered Google Images page (~1.2 MB, hundreds of image URLs) — fetch it if you need the full image grid the parsed object does not flatten.

> Note: for the `isch` vertical this actor surfaces the refinement chips (`suggested_searches`) plus the rendered page at `metadata.rawUrl`; it does not emit a flat `images_results` array. The base64 `thumbnail` values are trimmed in the fixture — see [`../DATA_MODEL.md`](../DATA_MODEL.md).

## Run it

```bash
export SCRAPELESS_API_KEY=your_api_token_here

# curl
bash curl/images.sh

# python
python python/request.py

# node
node nodejs/request.mjs
```

## Fixtures

- [`results/images.json`](results/images.json) — parsed Images object from a live `q: "golden retriever", tbm: "isch"` run (base64 thumbnails trimmed).

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
