# ChatGPT scraper

[chatgpt.com](https://chatgpt.com/) scraper powered by [Scrapeless](https://www.scrapeless.com/). Every surface drives a Scrapeless cloud [Scraping Browser](https://www.scrapeless.com/en/product/scraping-browser) and emits identical JSON shapes — see [`DATA_MODEL.md`](DATA_MODEL.md).

## Surfaces

Available surfaces live under [`browser/`](browser/) — pick whichever fits your stack:

| Surface | Path | Built on |
| --- | --- | --- |
| Python | [`browser/python`](browser/python/) | official `scrapeless` SDK + Playwright over CDP |
| Node.js | [`browser/nodejs`](browser/nodejs/) | official `@scrapeless-ai/sdk` + puppeteer-core over CDP |

The `cli/` surface covers single-turn `conversation` by reading the rendered DOM; the SSE-backed multi-turn `conversations` flow needs the `nodejs/` or `python/` surfaces — see [`browser/cli/README.md`](browser/cli/README.md).

## Functions

| Python | Node.js |
| --- | --- |
| `scrape_conversation` | `scrapeConversation` |
| `scrape_conversations` | `scrapeConversations` |

## Run

```bash
export SCRAPELESS_API_KEY=sk_...

# Python
cd browser/python && SAVE_TEST_RESULTS=true python run.py

# Node.js
cd browser/nodejs && SAVE_TEST_RESULTS=true node run.mjs

```

## Fixtures

- [`browser/nodejs/results/conversation.md`](browser/nodejs/results/conversation.md)
- [`browser/nodejs/results/conversations.json`](browser/nodejs/results/conversations.json)

## Scraper API (no-code alternative)

The same data is also available through the Scrapeless **Scraper API** — one HTTP request, no browser to drive. This collection maps to the `scraper.chatgpt` actor:

```bash
curl -X POST https://api.scrapeless.com/api/v1/scraper/request   -H "Content-Type: application/json"   -H "x-api-token: $SCRAPELESS_API_KEY"   -d '{
    "actor": "scraper.chatgpt",
    "input": { "action": "<see API docs>" }
  }'
```

```python
import os, requests

resp = requests.post(
    "https://api.scrapeless.com/api/v1/scraper/request",
    headers={"x-api-token": os.environ["SCRAPELESS_API_KEY"]},
    json={"actor": "scraper.chatgpt", "input": {"action": "<see API docs>"}},
)
resp.raise_for_status()
print(resp.json())
```

The exact `input.action` and field names for `scraper.chatgpt` are listed in the [Scrapeless API docs](https://apidocs.scrapeless.com). Swap the `input` block for the actor's documented parameters.

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
