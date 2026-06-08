# Google AI Overview Scraper

Extract Google's **AI Overview** (AIO) — the AI-generated answer block at the top of the SERP — as structured JSON: the answer body (markdown + plain text), the cited sources panel, the related-search sources, sponsored placements, and shopping flags. Powered by the Scrapeless **`scraper.overview`** actor.

## Surfaces

- **[api](api/)** — the Scraper API HTTP request method (`POST /api/v2/scraper/execute`, actor `scraper.overview`). curl · [python](api/python/) · [node](api/nodejs/).

This actor is API-only — there is no separate browser surface; the Scraper API renders, geo-routes, and parses the AIO server-side.

## Quick start

```bash
export SCRAPELESS_API_KEY=your_api_token_here   # https://app.scrapeless.com/passport/register
bash api/curl/overview.sh
```

See [`DATA_MODEL.md`](DATA_MODEL.md) for the response schema and [`api/README.md`](api/README.md) for the full request/response reference.

## Companion actors

The AI Overview is one Google AI surface. Pair it with `scraper.aimode` (the [Google AI Mode tab](../google-ai-mode-scraper/)) and `scraper.google.search` (the [organic SERP](../google-scraper/)) — same account, same `x-api-token` — for full coverage of Google's AI-augmented search.

## Fair Use & Legal Disclaimer

See [DISCLAIMER.md](../DISCLAIMER.md) for the full text.

## Powered by Scrapeless

- 🌐 Website: https://www.scrapeless.com
- 🧭 Scraping Browser: https://www.scrapeless.com/en/product/scraping-browser
- 📚 API docs: https://apidocs.scrapeless.com
- 📝 Blog: https://www.scrapeless.com/en/blog
- 💬 Discord: https://discord.gg/VU2vtbq7Q2
- ✈️ Telegram: https://t.me/scrapeless
- 🚀 Free signup: https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers
