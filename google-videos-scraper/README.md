# Google Videos scraper

Google Videos (the `tbm=vid` search vertical) scraper powered by [Scrapeless](https://www.scrapeless.com/). One HTTP request to the Scrapeless **Scraper API** returns a parsed Videos object — video results, inline videos, and pagination — see [`DATA_MODEL.md`](DATA_MODEL.md).

- **Actor:** `scraper.google.search` (with `input.tbm: "vid"`)
- **Mode:** synchronous — the POST response **is** the parsed object, no polling.

## Scraper API

This collection is **API-only** (no browser to drive). Everything lives under [`api/`](api/):

| Surface | Path |
| --- | --- |
| curl | [`api/curl/videos.sh`](api/curl/videos.sh) |
| Python | [`api/python/request.py`](api/python/request.py) |
| Node.js | [`api/nodejs/request.mjs`](api/nodejs/request.mjs) |

See [`api/README.md`](api/README.md) for the endpoint, auth, request JSON, input table, and response shape.

## Run

```bash
export SCRAPELESS_API_KEY=your_api_token_here

bash api/curl/videos.sh          # curl
python api/python/request.py     # Python
node api/nodejs/request.mjs      # Node.js
```

## Fixtures

- [`api/results/videos.json`](api/results/videos.json) — parsed Videos result from a live `q: "how to scrape websites", tbm: "vid"` run.

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
