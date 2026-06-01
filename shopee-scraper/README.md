# Shopee scraper

> **Status: Preview.** Shopee enforces strong anti-bot protection; the product/search selectors here are illustrative and the committed `results/*.json` are schema-valid samples **pending live verification**. The shape in [`DATA_MODEL.md`](DATA_MODEL.md) is the stable contract.

[shopee.co.th](https://shopee.co.th/) scraper powered by [Scrapeless](https://www.scrapeless.com/). Every surface drives a Scrapeless cloud [Scraping Browser](https://www.scrapeless.com/en/scraping-browser) and emits identical JSON shapes — see [`DATA_MODEL.md`](DATA_MODEL.md).

## Surfaces

Available surfaces live under [`browser/`](browser/) — pick whichever fits your stack:

| Surface | Path | Built on |
| --- | --- | --- |
| Python | [`browser/python`](browser/python/) | official `scrapeless` SDK + Playwright over CDP |
| Node.js | [`browser/nodejs`](browser/nodejs/) | official `@scrapeless-ai/sdk` + puppeteer-core over CDP |
| CLI | [`browser/cli`](browser/cli/) | `scrapeless-scraping-browser` CLI + in-page `eval` |
| MCP | [`browser/mcp`](browser/mcp/) | Scrapeless MCP server — conversational, no code |

## Functions

| Python | Node.js |
| --- | --- |
| `scrape_product` | `scrapeProduct` |
| `scrape_search` | `scrapeSearch` |

## Run

```bash
export SCRAPELESS_API_KEY=sk_...

# Python
cd browser/python && SAVE_TEST_RESULTS=true python run.py

# Node.js
cd browser/nodejs && SAVE_TEST_RESULTS=true node run.mjs

# CLI — copy the step-by-step commands from browser/cli/README.md
```

## Fixtures

- [`browser/nodejs/results/product.json`](browser/nodejs/results/product.json)
- [`browser/nodejs/results/search.json`](browser/nodejs/results/search.json)

## API request method

> **Note:** the endpoint and `x-api-token` auth below are confirmed working against the live API. The example `action` and `url` are **illustrative** — a live call with this exact body returns `invalid request url host`, so substitute the host and `action` documented for `scraper.shopee` in the [Scrapeless API docs](https://apidocs.scrapeless.com).

Shopee also maps to the Scrapeless Scraper actor API. Instead of driving a browser, you can
POST a single request to the actor endpoint and receive the parsed payload back. This is the
exact request from the official API docs:

```
POST https://api.scrapeless.com/api/v1/scraper/request
Content-Type: application/json
x-api-token: <SCRAPELESS_API_KEY>
```

Body:

```json
{
  "actor": "scraper.shopee",
  "input": {
    "action": "shopee.rcmd",
    "url": "https://shopee.co.th/api/v4/shop/rcmd_items?bundle=shop_page_category_tab_main&item_card_use_scene=category_product_list_topsales&limit=30&offset=0&shop_id=1195212398&sort_type=13"
  }
}
```

### curl

```bash
curl -X POST "https://api.scrapeless.com/api/v1/scraper/request" \
  -H "Content-Type: application/json" \
  -H "x-api-token: $SCRAPELESS_API_KEY" \
  -d '{
    "actor": "scraper.shopee",
    "input": {
      "action": "shopee.rcmd",
      "url": "https://shopee.co.th/api/v4/shop/rcmd_items?bundle=shop_page_category_tab_main&item_card_use_scene=category_product_list_topsales&limit=30&offset=0&shop_id=1195212398&sort_type=13"
    }
  }'
```

### Python (requests)

```python
import os
import requests

resp = requests.post(
    "https://api.scrapeless.com/api/v1/scraper/request",
    headers={
        "Content-Type": "application/json",
        "x-api-token": os.environ["SCRAPELESS_API_KEY"],
    },
    json={
        "actor": "scraper.shopee",
        "input": {
            "action": "shopee.rcmd",
            "url": "https://shopee.co.th/api/v4/shop/rcmd_items?bundle=shop_page_category_tab_main&item_card_use_scene=category_product_list_topsales&limit=30&offset=0&shop_id=1195212398&sort_type=13",
        },
    },
)
print(resp.json())
```

## Fair Use & Legal Disclaimer

This repository is **educational reference material** that demonstrates how Scrapeless powers web data collection. The example programs are not intended for production scraping. Before scraping any site, review its Terms of Service and `robots.txt`, never collect personal data protected under GDPR/CCPA, never redistribute entire datasets that may be protected by database rights, and throttle requests so a target site is never degraded. Consult a lawyer if you are unsure whether a use case is lawful. Scrapeless accepts no liability for how these examples are used.

## Powered by Scrapeless

- 🌐 Website: https://www.scrapeless.com
- 🧭 Scraping Browser: https://www.scrapeless.com/en/scraping-browser
- 📚 API docs: https://apidocs.scrapeless.com
- 📝 Blog: https://www.scrapeless.com/en/blog
- 🚀 Free signup: https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers
