# Perplexity — Scraper API (HTTP request method)

The fastest way to pull a Perplexity answer: one HTTP request to the Scrapeless **Scraper API**, no browser to drive. This surface maps to the **`scraper.perplexity`** actor — you send a prompt, Scrapeless runs it through Perplexity, and you get back the markdown answer plus its cited web sources and media as a structured `task_result`.

- **Endpoint:** `POST https://api.scrapeless.com/api/v2/scraper/execute`
- **Auth:** header `x-api-token: $SCRAPELESS_API_KEY` ([get a key](https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers))
- **Actor:** `scraper.perplexity` (prompt-in, answer-plus-citations-out)

## Request

```json
{
  "actor": "scraper.perplexity",
  "input": {
    "prompt": "What are the main differences between residential and datacenter proxies?",
    "country": "US",
    "web_search": true
  }
}
```

| input field | required | description |
| --- | --- | --- |
| `prompt` | yes | the question or instruction to send to Perplexity |
| `country` | yes | country/region for the run (e.g. `US`) |
| `web_search` | no | enable Perplexity's live web search enrichment (boolean) |

## Response

```json
{
  "status": "success",
  "task_id": "886a4eee-1620-443b-886f-3d0ce76db0c5",
  "task_result": {
    "prompt": "What are the main differences between residential and datacenter proxies?",
    "result_text": "Here are the main differences, succinctly: …",
    "related_prompt": [ "…" ],
    "web_results": [ { "name": "…", "url": "…", "snippet": "…" } ],
    "media_items": [ { "medium": "image", "url": "…", "source": "web" } ]
  }
}
```

- `status` is `"success"` when the run completed; `task_id` identifies the run.
- `task_result` is the **parsed structured answer** — use it directly (see [`results/chat.json`](results/chat.json) for the full field set captured from a live run).
- `result_text` is Perplexity's markdown answer; `web_results` carries the sources it cited and `media_items` any images, maps, or video it surfaced.

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

- [`results/chat.json`](results/chat.json) — `task_result` from a live `scraper.perplexity` run.

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
