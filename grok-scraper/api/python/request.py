"""Grok answer via the Scrapeless Scraper API (scraper.grok).

Run:
    export SCRAPELESS_API_KEY=your_api_token_here
    python request.py
"""
import os
import json
import requests

ENDPOINT = "https://api.scrapeless.com/api/v2/scraper/execute"


def scrape_grok(prompt: str, country: str = "US", mode: str = "MODEL_MODE_AUTO") -> dict:
    resp = requests.post(
        ENDPOINT,
        headers={
            "Content-Type": "application/json",
            "x-api-token": os.environ["SCRAPELESS_API_KEY"],
        },
        json={
            "actor": "scraper.grok",
            "input": {"prompt": prompt, "country": country, "mode": mode},
        },
        timeout=180,
    )
    resp.raise_for_status()
    return resp.json()


if __name__ == "__main__":
    data = scrape_grok("What is the best lightweight proxy rotation strategy for web scraping?")
    # `task_result` is the parsed structured answer; `status` is "success" when the run completed.
    print(json.dumps(data["task_result"], indent=2, ensure_ascii=False))
