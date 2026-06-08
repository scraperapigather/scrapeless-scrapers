# Google AI Overview — Scraper API (HTTP request method)

Capture Google's **AI Overview** (the AI answer block at the top of the SERP) as structured JSON — one HTTP request, no browser to drive. This surface maps to the **`scraper.overview`** actor.

- **Endpoint:** `POST https://api.scrapeless.com/api/v2/scraper/execute`
- **Auth:** header `x-api-token: $SCRAPELESS_API_KEY` ([get a key](https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers))
- **Actor:** `scraper.overview` (Google AI Overview / AIO)

## Request

```json
{
  "actor": "scraper.overview",
  "input": { "prompt": "what is a proxy server", "country": "US" }
}
```

| input field | required | description |
| --- | --- | --- |
| `prompt` | yes | the Google query to fetch the AI Overview for |
| `country` | yes | ISO 3166-1 alpha-2 code (`US`, `GB`, `DE`, …); routes through matching residential egress so the AIO is the one a real user in that country sees |

## Response

Every successful call returns the `{ status, task_id, task_result }` envelope:

```json
{
  "status": "success",
  "task_id": "…",
  "task_result": {
    "content": "…AI Overview body as markdown with [N] citation refs…",
    "rawtext": "…same body, citations stripped…",
    "source": [ { "title": "…", "url": "https://…", "website_name": "…" } ],
    "web_source": [ /* related-search panel, same shape */ ],
    "ads": [ /* sponsored placements above the AIO */ ],
    "is_overview_shopping": false,
    "is_shopping": false,
    "purchase_link": false,
    "products": null,
    "metadata": { "rawUrl": "https://www.google.com/search?…" }
  }
}
```

- `content` is the AIO body as markdown with inline `[N]` citations; `rawtext` is the citation-stripped plain-text twin.
- `source` is the AIO's cited-sources panel (count from this for GEO share-of-citation); `web_source` is the related-search panel below it.
- `products` is populated for some shopping AIOs and `null` otherwise — code defensively (`task_result.get("products") or []`).

**Not every query surfaces an AI Overview.** When Google does not produce one for a query in a given geography, the API returns `{ "status": "failed", "message": "execution failed" }`. Use an informational prompt (`"what is X"`, `"how does X work"`); navigational or single-word queries usually do not trigger an AIO.

## Run it

```bash
export SCRAPELESS_API_KEY=your_api_token_here

bash curl/overview.sh        # curl
python python/request.py     # python
node nodejs/request.mjs        # node
```

## Fixtures

- [`results/overview.json`](results/overview.json) — the parsed `task_result` from a live `scraper.overview` run (heavy `result_html`/`raw_response` trimmed; `content`/`rawtext` excerpted).

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
