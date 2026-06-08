"""Perplexity answer via the Scrapeless Scraper API (scraper.perplexity).

Run:
    export SCRAPELESS_API_KEY=your_api_token_here
    python request.py
"""
import os
import json
import requests

ENDPOINT = "https://api.scrapeless.com/api/v2/scraper/execute"


def scrape_perplexity(prompt: str, country: str = "US", web_search: bool = True) -> dict:
    resp = requests.post(
        ENDPOINT,
        headers={
            "Content-Type": "application/json",
            "x-api-token": os.environ["SCRAPELESS_API_KEY"],
        },
        json={
            "actor": "scraper.perplexity",
            "input": {"prompt": prompt, "country": country, "web_search": web_search},
        },
        timeout=180,
    )
    resp.raise_for_status()
    return resp.json()


if __name__ == "__main__":
    data = scrape_perplexity("What are the main differences between residential and datacenter proxies?")
    # `task_result` is the parsed structured answer; `status` is "success" when the run completed.
    print(json.dumps(data["task_result"], indent=2, ensure_ascii=False))
