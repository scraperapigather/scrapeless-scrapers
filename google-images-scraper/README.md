# Google Images scraper

[Google Images](https://www.google.com/imghp) scraper powered by [Scrapeless](https://www.scrapeless.com/). One HTTP request to the Scrapeless **Scraper API** — no browser to drive — returns a parsed Images object and a stored copy of the fully rendered image page. See [`DATA_MODEL.md`](DATA_MODEL.md) for the exact response shape.

This folder is **API-only** (no browser surface). It maps to the **`scraper.google.search`** actor with `tbm: "isch"`, which switches Google search into the Images vertical.

## Surface

| Surface | Path | Built on |
| --- | --- | --- |
| Scraper API | [`api/`](api/) | `POST /api/v1/scraper/request`, actor `scraper.google.search` |

Each language entrypoint under [`api/`](api/) issues the same request:

| Language | Path |
| --- | --- |
| curl | [`api/curl/images.sh`](api/curl/images.sh) |
| Python | [`api/python/request.py`](api/python/request.py) |
| Node.js | [`api/nodejs/request.mjs`](api/nodejs/request.mjs) |

## Run

```bash
export SCRAPELESS_API_KEY=your_api_token_here

bash api/curl/images.sh        # curl
python api/python/request.py   # Python
node api/nodejs/request.mjs    # Node.js
```

## Fixtures

- [`api/results/images.json`](api/results/images.json) — parsed Images object from a live `q: "golden retriever", tbm: "isch"` run (base64 thumbnails trimmed).

## Fair Use & Legal Disclaimer

This repository is **educational reference material** that demonstrates how Scrapeless powers web data collection. The example programs are not intended for production scraping. Before scraping any site, review its Terms of Service and `robots.txt`, never collect personal data protected under GDPR/CCPA, never redistribute entire datasets that may be protected by database rights, and throttle requests so a target site is never degraded. Consult a lawyer if you are unsure whether a use case is lawful. Scrapeless accepts no liability for how these examples are used.

## Powered by Scrapeless

- 🌐 Website: https://www.scrapeless.com
- 🧭 Scraping Browser: https://www.scrapeless.com/en/product/scraping-browser
- 📚 API docs: https://apidocs.scrapeless.com
- 📝 Blog: https://www.scrapeless.com/en/blog
- 💬 Discord: https://discord.gg/VU2vtbq7Q2
- ✈️ Telegram: https://t.me/scrapeless
- 🚀 Free signup: https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers
