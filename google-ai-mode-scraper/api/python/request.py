"""Google AI Mode answer via the Scrapeless Scraper API (scraper.aimode).

Run:
    export SCRAPELESS_API_KEY=your_api_token_here
    python request.py
"""
import os
import json
import requests

ENDPOINT = "https://api.scrapeless.com/api/v2/scraper/execute"


def scrape_aimode(prompt: str, country: str = "US") -> dict:
    resp = requests.post(
        ENDPOINT,
        headers={
            "Content-Type": "application/json",
            "x-api-token": os.environ["SCRAPELESS_API_KEY"],
        },
        json={
            "actor": "scraper.aimode",
            "input": {"prompt": prompt, "country": country},
        },
        timeout=180,
    )
    resp.raise_for_status()
    return resp.json()


if __name__ == "__main__":
    data = scrape_aimode("best running shoes 2026")
    # `task_result` is the parsed structured answer; `status` is "success" when the run completed.
    print(json.dumps(data["task_result"], indent=2, ensure_ascii=False))
