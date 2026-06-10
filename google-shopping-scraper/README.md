# Google Shopping scraper

Google **Shopping vertical** scraper — the product-search surface Google shows under the Shopping tab (`udm=28`) — powered by [Scrapeless](https://www.scrapeless.com/). API-only: one HTTP request to the `scraper.google.search` actor with `tbm: "shop"`, no browser to drive.

## What it scrapes

The Shopping vertical for a product query like `mechanical keyboard`: Google's Shopping refinement rail (one-click filter chips such as "Gaming", "Wireless", "Under $50", "Get it by Thu"), each linking to a `udm=28` Shopping search, plus the `search_information` envelope (query echo, results state). See the response shape in [`DATA_MODEL.md`](DATA_MODEL.md).

- **Actor:** `scraper.google.search`
- **Mode:** synchronous — the POST response **is** the parsed Shopping object
- **Selector:** `input.tbm = "shop"` (pair with `hl` + `gl` for a resolvable locale)

## Surface

| Surface | Path |
| --- | --- |
| Scraper API (HTTP) | [`api/`](api/) — curl, Python, and Node.js clients + a live fixture |

## Run

```bash
export SCRAPELESS_API_KEY=your_api_token_here

# curl
bash api/curl/shopping.sh

# python
python api/python/request.py

# node
node api/nodejs/request.mjs
```

See [`api/README.md`](api/README.md) for the endpoint, auth, input table, and response shape.

## Fair Use & Legal Disclaimer

See [the repo DISCLAIMER](../DISCLAIMER.md). Educational reference only — review the target site's Terms of Service and `robots.txt`, never collect personal data protected under GDPR/CCPA, and throttle requests.

## Powered by Scrapeless

- 🌐 Website: https://www.scrapeless.com
- 🧭 Scraping Browser: https://www.scrapeless.com/en/product/scraping-browser
- 📚 API docs: https://apidocs.scrapeless.com
- 📝 Blog: https://www.scrapeless.com/en/blog
- 💬 Discord: https://discord.gg/VU2vtbq7Q2
- ✈️ Telegram: https://t.me/scrapeless
- 🚀 Free signup: https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers
