# Google Scholar scraper

[scholar.google.com](https://scholar.google.com/) scraper powered by [Scrapeless](https://www.scrapeless.com/). This actor is **API-only** — one HTTP request to the Scrapeless **Scraper API**, no browser to drive. It maps to the **`scraper.google.scholar`** actor and returns a parsed academic search result (organic papers with citations, authors, publication info, related searches, and pagination) — see [`DATA_MODEL.md`](DATA_MODEL.md).

## Surface

| Surface | Path | Maps to |
| --- | --- | --- |
| Scraper API (HTTP) | [`api/`](api/) | `scraper.google.scholar` actor |

## Run

```bash
export SCRAPELESS_API_KEY=your_api_token_here

# curl
bash api/curl/scholar.sh

# python
python api/python/request.py

# node
node api/nodejs/request.mjs
```

See [`api/README.md`](api/README.md) for the endpoint, auth, request JSON, input table, response shape, and run steps.

## Fixtures

- [`api/results/scholar.json`](api/results/scholar.json) — parsed `scholar_result` captured from a live `q: "transformer neural network"` run.

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
