# Grok — Scraper API (HTTP request method)

The fastest way to pull a Grok answer: one HTTP request to the Scrapeless **Scraper API**, no browser to drive. This surface maps to the **`scraper.grok`** actor — you send a prompt, Scrapeless runs it through Grok (xAI), and you get back the full answer plus its web and X search citations as a structured `task_result`.

- **Endpoint:** `POST https://api.scrapeless.com/api/v2/scraper/execute`
- **Auth:** header `x-api-token: $SCRAPELESS_API_KEY` ([get a key](https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers))
- **Actor:** `scraper.grok` (prompt-in, structured-answer-out — no shared-conversation URL needed)

## Request

```json
{
  "actor": "scraper.grok",
  "input": {
    "prompt": "What is the best lightweight proxy rotation strategy for web scraping?",
    "country": "US",
    "mode": "MODEL_MODE_AUTO"
  }
}
```

| input field | required | description |
| --- | --- | --- |
| `prompt` | yes | the question or instruction to send to Grok |
| `country` | yes | country/region for the run (e.g. `US`); `JP` and `TW` are not available |
| `mode` | yes | reasoning mode: `MODEL_MODE_FAST`, `MODEL_MODE_EXPERT`, or `MODEL_MODE_AUTO` |

## Response

```json
{
  "status": "success",
  "task_id": "1693f5f6-ca63-4d66-a8d7-1ef301b33b1c",
  "task_result": {
    "user_query": "What is the best lightweight proxy rotation strategy for web scraping?",
    "full_response": "**Best lightweight strategy: Sticky round-robin with a small proxy pool + backoff.** …",
    "follow_up_suggestions": [ "…" ],
    "web_search_results": [ { "title": "…", "url": "…", "preview": "…" } ],
    "x_search_results": [ … ],
    "footnotes": { "018426": { "card_type": "WEBSITE", "id": "018426", "url": "…" } },
    "tool_usages": [ … ],
    "conversation": { "conversation_id": "…", "title": "…" }
  }
}
```

- `status` is `"success"` when the run completed; `task_id` identifies the run.
- `task_result` is the **parsed structured answer** — use it directly (see [`results/chat.json`](results/chat.json) for the full field set captured from a live run).
- `full_response` is Grok's complete answer text; `web_search_results` and `x_search_results` carry the sources it cited.

## Run it

```bash
export SCRAPELESS_API_KEY=your_api_token_here

# curl
bash curl/chat.sh

# python
python python/request.py

# node
node nodejs/request.mjs
```

## Fixtures

- [`results/chat.json`](results/chat.json) — `task_result` from a live `scraper.grok` run.

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
