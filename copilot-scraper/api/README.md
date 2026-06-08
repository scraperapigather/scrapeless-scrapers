# Copilot — Scraper API (HTTP request method)

The fastest way to pull a Microsoft Copilot answer: one HTTP request to the Scrapeless **Scraper API**, no browser to drive. This surface maps to the **`scraper.copilot`** actor and returns the answer text plus its citations and outbound links inside `task_result`.

- **Endpoint:** `POST https://api.scrapeless.com/api/v2/scraper/execute`
- **Auth:** header `x-api-token: $SCRAPELESS_API_KEY` ([get a key](https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers))
- **Actor:** `scraper.copilot` (submits a prompt to Copilot and returns the rendered answer)

## Request

```json
{
  "actor": "scraper.copilot",
  "input": { "prompt": "What are the best web scraping tools?", "country": "US", "mode": "smart" }
}
```

| input field | required | description |
| --- | --- | --- |
| `prompt` | yes | the question/instruction to send to Copilot |
| `country` | no | two-letter country code used for the session (e.g. `US`) |
| `mode` | yes | Copilot answer mode — `smart` (GPT-5) or `chat` |

## Response

```json
{
  "status": "success",
  "task_id": "…",
  "task_result": {
    "result_text": "Here are some of the best web scraping tools …",
    "citations": [ { "title": "…", "url": "https://…" } ],
    "links": [ "https://…" ],
    "mode": "smart",
    "prompt": "What are the best web scraping tools?"
  }
}
```

- `task_result` is the **answer payload** — use it directly (see [`results/chat.json`](results/chat.json) for the full field set captured from a live run).
- `result_text` is the markdown answer; `citations` are the cited sources and `links` are the deduped outbound URLs Copilot rendered.
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

- [`results/chat.json`](results/chat.json) — `task_result` from a live `scraper.copilot` run.

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
