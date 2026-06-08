# Amazon — Scraper API (HTTP request method)

The fastest way to pull Amazon data: one HTTP request to the Scrapeless **Scraper API**, no browser to drive. This surface maps to the **`scraper.amazon`** actor and returns both the rendered `html` and a parsed `result` object.

- **Endpoint:** `POST https://api.scrapeless.com/api/v1/scraper/request`
- **Auth:** header `x-api-token: $SCRAPELESS_API_KEY` ([get a key](https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers))
- **Actor:** `scraper.amazon` (covers Amazon product, search, and reviews; Rufus is a gated, signed-in surface)

## Request

```json
{
  "actor": "scraper.amazon",
  "input": { "action": "product", "url": "https://www.amazon.com/dp/B09B8V1LZ3" }
}
```

| input field | required | description |
| --- | --- | --- |
| `action` | yes | `product`, `search`, or `reviews` |
| `url` | yes | the Amazon URL for the chosen action (a product/dp URL, a search URL, or a reviews URL) |

## Response

```json
{
  "html": "<!doctype html> … rendered page …",
  "metadata": { "rawUrl": "https://api.scrapeless.com/storage/…html", "type": "product" },
  "result": { "asin": "B09B8V1LZ3", "title": "…", "final_price": "$49.99", "rating": …, "reviews_count": … }
}
```

- `result` is the **parsed structured object** — use it directly (see [`results/product.json`](results/product.json) for the full field set captured from a live run).
- `html` is the full rendered page if you want to parse fields the actor does not surface.
- `metadata.rawUrl` is a stored copy of the rendered HTML.

## Run it

```bash
export SCRAPELESS_API_KEY=your_api_token_here

# curl
bash curl/product.sh

# python
python python/request.py

# node
node nodejs/request.mjs
```

## Fixtures

- [`results/product.json`](results/product.json) — parsed `result` from a live `action: product` run.

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
