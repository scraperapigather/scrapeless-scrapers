# Grok scraper

[grok.com](https://grok.com/) scraper powered by [Scrapeless](https://www.scrapeless.com/). Every surface drives a Scrapeless cloud [Scraping Browser](https://www.scrapeless.com/en/product/scraping-browser) and emits identical JSON shapes — see [`DATA_MODEL.md`](DATA_MODEL.md).

Grok is xAI's AI assistant. Conversation sessions require login, but **shared conversations** at `grok.com/share/<id>` are publicly readable — they render the full message log without authentication. This scraper targets that public surface.

## Status

**VERIFIED** — `grok.com/share/<id>` shared conversation pages load and return the full conversation transcript without authentication. Live results are in [`browser/nodejs/results/`](browser/nodejs/results/) and [`browser/python/results/`](browser/python/results/).

Stable anchors: `data-testid="user-message"` and `data-testid="assistant-message"` elements; page title follows the pattern `{topic} | Shared Grok Conversation`; `<meta name="description">` holds the first user prompt snippet.

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
| `scrape_share` | `scrapeShare` |

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

- [`browser/nodejs/results/share.json`](browser/nodejs/results/share.json)
- [`browser/python/results/share.json`](browser/python/results/share.json)

## Scraper API (no-code alternative)

The same data is also available through the Scrapeless **Scraper API** — one HTTP request, no browser to drive. This collection maps to the `scraper.grok` actor:

```bash
curl -X POST https://api.scrapeless.com/api/v1/scraper/request   -H "Content-Type: application/json"   -H "x-api-token: $SCRAPELESS_API_KEY"   -d '{
    "actor": "scraper.grok",
    "input": { "action": "<see API docs>" }
  }'
```

```python
import os, requests

resp = requests.post(
    "https://api.scrapeless.com/api/v1/scraper/request",
    headers={"x-api-token": os.environ["SCRAPELESS_API_KEY"]},
    json={"actor": "scraper.grok", "input": {"action": "<see API docs>"}},
)
resp.raise_for_status()
print(resp.json())
```

The exact `input.action` and field names for `scraper.grok` are listed in the [Scrapeless API docs](https://apidocs.scrapeless.com). Swap the `input` block for the actor's documented parameters.

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
