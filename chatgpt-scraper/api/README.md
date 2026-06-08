# ChatGPT — Scraper API (HTTP request method)

The fastest way to pull a ChatGPT answer: one HTTP request to the Scrapeless **Scraper API**, no browser to drive. This surface maps to the **`scraper.chatgpt`** actor and returns the answer text plus its citations and web-search sources inside `task_result`.

- **Endpoint:** `POST https://api.scrapeless.com/api/v2/scraper/execute`
- **Auth:** header `x-api-token: $SCRAPELESS_API_KEY` ([get a key](https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers))
- **Actor:** `scraper.chatgpt` (submits a prompt to ChatGPT and returns the rendered answer)

## Request

```json
{
  "actor": "scraper.chatgpt",
  "input": { "prompt": "What are the best web scraping tools?", "country": "US" }
}
```

| input field | required | description |
| --- | --- | --- |
| `prompt` | yes | the question/instruction to send to ChatGPT |
| `country` | no | two-letter country code used for the session (e.g. `US`) |

## Response

```json
{
  "status": "success",
  "task_id": "f64f54a5-9c80-417b-8551-2144f81798c2",
  "task_result": {
    "result_text": "The “best” web scraping tool depends on … ([Use Apify][1])",
    "content_references": [ { "title": "…", "url": "https://…", "attribution": "…" } ],
    "links": [],
    "model": "gpt-5-5",
    "prompt": "What are the best web scraping tools?",
    "search_result": [],
    "web_search": []
  }
}
```

- `task_result` is the **answer payload** — use it directly (see [`results/chat.json`](results/chat.json) for the full field set captured from a live run).
- `result_text` is the markdown answer; `content_references` are the cited sources ChatGPT used.
- `status` is `success` on a completed run and `task_id` identifies the execution.

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

- [`results/chat.json`](results/chat.json) — `task_result` from a live `scraper.chatgpt` run.

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
