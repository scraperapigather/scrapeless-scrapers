# Shopee — Scraper API (HTTP request method)

Pull a Shopee product through the Scrapeless **Scraper API** — one HTTP request, no browser to drive. This surface maps to the **`scraper.shopeev2`** actor.

- **Endpoint:** `POST https://api.scrapeless.com/api/v1/scraper/request`
- **Auth:** header `x-api-token: $SCRAPELESS_API_KEY` ([get a key](https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers))
- **Actor:** `scraper.shopeev2`
- **Region:** Shopee storefronts are region-gated — use a supported domain such as `shopee.sg`. A `shopee.sg/<name>-i.<shopid>.<itemid>` product URL is the expected input.

## Request

```json
{
  "actor": "scraper.shopeev2",
  "input": { "url": "https://shopee.sg/<product-name>-i.<shopid>.<itemid>" }
}
```

| input field | required | description |
| --- | --- | --- |
| `url` | yes | a Shopee product URL on a supported storefront (e.g. `shopee.sg`). Unsupported regions return `{"code":20405,"message":"area not supported"}`. |

## Response

`scraper.shopeev2` may return the product payload **inline** in the POST response, or — for slower renders — a task to poll:

- **Inline:** the body carries Shopee's product-detail JSON under `data.data.item` (name, price, stock, rating, shop, categories, …).
- **Async:** the POST returns `{"taskId":"…"}` (HTTP 201); poll `GET https://api.scrapeless.com/api/v1/scraper/result/{taskId}` until `state` is no longer `processing`, then read the same `data.data.item` payload.

The `python/` and `nodejs/` clients here handle both modes. Prices are integers scaled ×100000 (e.g. `1420000` = 14.20 in the storefront currency).

## Run it

```bash
export SCRAPELESS_API_KEY=your_api_token_here

bash curl/product.sh        # curl (submits + polls)
python python/request.py    # python
node nodejs/request.mjs      # node
```

## Fixtures

- [`results/product.json`](results/product.json) — a compact, parsed view (name, price, stock, rating, shop location, categories) captured from a live `shopee.sg` product run.

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
