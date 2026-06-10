# Google AI Mode — Scraper API (HTTP request method)

The fastest way to pull a Google AI Mode answer: one HTTP request to the Scrapeless **Scraper API**, no browser to drive. This surface maps to the **`scraper.aimode`** actor — you send a search-style prompt, Scrapeless runs it through Google's AI Mode, and you get back the AI overview as text, markdown, and HTML plus its citations as a structured `task_result`.

- **Endpoint:** `POST https://api.scrapeless.com/api/v2/scraper/execute`
- **Auth:** header `x-api-token: $SCRAPELESS_API_KEY` ([get a key](https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers))
- **Actor:** `scraper.aimode` (search-style prompt-in, AI overview + citations out)

## Request

```json
{
  "actor": "scraper.aimode",
  "input": {
    "prompt": "best running shoes 2026",
    "country": "US"
  }
}
```

| input field | required | description |
| --- | --- | --- |
| `prompt` | yes | the search-style query to send to Google AI Mode |
| `country` | yes | country/region for the run (e.g. `US`) |

## Response

```json
{
  "status": "success",
  "task_id": "625bdf1c-caa2-4e6b-96bf-493e3700d9c2",
  "task_result": {
    "result_text": "### 🏆 The Top Picks Across Categories …",
    "result_md": "### 🏆 The Top Picks Across Categories …",
    "result_html": "<div> … rendered AI overview … </div>",
    "citations": [ { "title": "…", "url": "…" } ],
    "raw_url": "https://www.google.com/async/…"
  }
}
```

- `status` is `"success"` when the run completed; `task_id` identifies the run.
- `task_result` is the **parsed structured answer** — use it directly (see [`results/chat.json`](results/chat.json) for the captured field set; the heavy `result_html` is trimmed there for readability).
- `result_text`/`result_md` are the AI overview as plain text and markdown; `result_html` is the rendered block, `citations` are the sources it linked, and `raw_url` is the underlying Google AI Mode request.

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

- [`results/chat.json`](results/chat.json) — `task_result` from a live `scraper.aimode` run.

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
