# Google Scholar — Scraper API (HTTP request method)

The fastest way to pull Google Scholar data: one HTTP request to the Scrapeless **Scraper API**, no browser to drive. This surface maps to the **`scraper.google.scholar`** actor and returns a parsed academic search result (organic papers with citations, authors, publication info, related searches, and pagination).

- **Endpoint:** `POST https://api.scrapeless.com/api/v1/scraper/request`
- **Auth:** header `x-api-token: $SCRAPELESS_API_KEY` ([get a key](https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers))
- **Actor:** `scraper.google.scholar` (Google Scholar SERP; no browser or anti-bot handling needed on your side)

## Request

```json
{
  "actor": "scraper.google.scholar",
  "input": { "q": "transformer neural network", "hl": "en" }
}
```

| input field | required | description |
| --- | --- | --- |
| `q` | yes | the search query string |
| `hl` | no | interface language (e.g. `en`); defaults to English |

## Response

The actor responds **synchronously** — the POST body already carries the parsed result under `scholar_result`, alongside a Scrapeless `metadata` envelope that points at the stored raw HTML:

```json
{
  "metadata": { "engine": "google.scholar", "rawUrl": "https://api.scrapeless.com/storage/…html" },
  "scholar_result": {
    "search_information": { "total_results": 1130000, "time_taken_displayed": 0.13, "query_displayed": "transformer neural network" },
    "organic_result": [
      {
        "position": 1,
        "title": "Transformer in convolutional neural networks",
        "result_id": "Xhupwy48-swJ",
        "link": "https://…/Liu2.pdf",
        "snippet": "…",
        "publication_info": { "summary": "Y Liu, G Sun… - arXiv …, 2021", "author": [ { "name": "Y Liu", "author_id": "UB3doCoAAAAJ" } ] },
        "resources": [ { "title": "[PDF] kuleuven.be", "file_format": "[PDF]", "link": "https://…/Liu2.pdf" } ],
        "inline_links": { "cited_by": { "total": 112, "cites_id": "14770184099463764830" } }
      }
    ],
    "related_search": [ { "query": "…", "link": "https://scholar.google.com/scholar?…" } ],
    "pagination": { "current": 1, "next": "https://scholar.google.com/scholar?start=10&…" }
  }
}
```

- `scholar_result` is the **parsed structured object** — use it directly (see [`results/scholar.json`](results/scholar.json) for the full field set captured from a live run).
- `metadata.rawUrl` is a stored copy of the rendered HTML if you want to parse fields the actor does not surface.

> **Heads up — this actor is flaky.** It intermittently returns `{"code":20500,"message":"scraping failed"}` instead of a result. Retry the request (the clients here loop up to ~6 times) until you get a body containing `scholar_result`. The captured fixture landed on the 3rd attempt.

## Run it

```bash
export SCRAPELESS_API_KEY=your_api_token_here

# curl
bash curl/scholar.sh

# python
python python/request.py

# node
node nodejs/request.mjs
```

## Fixtures

- [`results/scholar.json`](results/scholar.json) — parsed `scholar_result` from a live `q: "transformer neural network"` run (full, untrimmed: 10 organic results, 8 related searches).

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
