# Google Local scraper

Google **local pack** scraper — the map-backed business listings Google shows for "near me" / "in &lt;city&gt;" queries — powered by [Scrapeless](https://www.scrapeless.com/). API-only: one HTTP request to the `scraper.google.search` actor with `tbm: "lcl"`, no browser to drive.

## What it scrapes

The Local pack for a query like `coffee shops in San Francisco`: ranked places with name, category, star rating, review count, price band, street address, and a thumbnail, plus Google's suggested filter chips ("Open now", "Top rated", …). See the response shape in [`DATA_MODEL.md`](DATA_MODEL.md).

- **Actor:** `scraper.google.search`
- **Mode:** synchronous — the POST response **is** the parsed local object
- **Selector:** `input.tbm = "lcl"`

## Surface

| Surface | Path |
| --- | --- |
| Scraper API (HTTP) | [`api/`](api/) — curl, Python, and Node.js clients + a live fixture |

## Run

```bash
export SCRAPELESS_API_KEY=your_api_token_here

# curl
bash api/curl/local.sh

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
