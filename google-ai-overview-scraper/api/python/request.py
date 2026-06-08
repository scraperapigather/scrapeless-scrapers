"""Google AI Overview via the Scrapeless Scraper API (scraper.overview).

Run:
    export SCRAPELESS_API_KEY=your_api_token_here
    python request.py
"""
import os
import json
import requests

ENDPOINT = "https://api.scrapeless.com/api/v2/scraper/execute"


def scrape_overview(prompt: str, country: str = "US") -> dict:
    resp = requests.post(
        ENDPOINT,
        headers={
            "Content-Type": "application/json",
            "x-api-token": os.environ["SCRAPELESS_API_KEY"],
        },
        json={"actor": "scraper.overview", "input": {"prompt": prompt, "country": country}},
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


if __name__ == "__main__":
    data = scrape_overview("what is a proxy server", "US")
    # Not every query surfaces an AI Overview. When Google does not, the API
    # returns {"status": "failed", "message": "execution failed"} — re-phrase the
    # prompt to a more informational query (e.g. "what is X", "how does X work").
    if data.get("status") != "success":
        raise SystemExit(f"No AI Overview for this query/geo: {data.get('message')}")
    print(json.dumps(data["task_result"], indent=2, ensure_ascii=False))
