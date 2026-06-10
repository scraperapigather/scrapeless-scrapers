"""Google Scholar via the Scrapeless Scraper API (scraper.google.scholar).

This actor is synchronous but FLAKY: it intermittently returns
{"code": 20500, "message": "scraping failed"}. Retry until the body has
"scholar_result".

Run:
    export SCRAPELESS_API_KEY=your_api_token_here
    python request.py
"""
import os
import json
import time
import requests

ENDPOINT = "https://api.scrapeless.com/api/v1/scraper/request"


def scrape_scholar(query: str, hl: str = "en", max_attempts: int = 6) -> dict:
    headers = {
        "Content-Type": "application/json",
        "x-api-token": os.environ["SCRAPELESS_API_KEY"],
    }
    payload = {"actor": "scraper.google.scholar", "input": {"q": query, "hl": hl}}
    for attempt in range(1, max_attempts + 1):
        resp = requests.post(ENDPOINT, headers=headers, json=payload, timeout=120)
        resp.raise_for_status()
        data = resp.json()
        # Success looks like {"metadata": ..., "scholar_result": ...}.
        if "scholar_result" in data:
            return data
        # Otherwise it's a transient {"code": 20500, ...}; retry.
        print(f"attempt {attempt}/{max_attempts} failed ({data}); retrying…")
        time.sleep(3)
    raise RuntimeError(f"scraper.google.scholar still failing after {max_attempts} attempts")


if __name__ == "__main__":
    data = scrape_scholar("transformer neural network")
    # The parsed academic results live under data["scholar_result"].
    print(json.dumps(data.get("scholar_result", data), indent=2, ensure_ascii=False))
