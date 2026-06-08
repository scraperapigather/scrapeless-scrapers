"""Amazon product via the Scrapeless Scraper API (scraper.amazon).

Run:
    export SCRAPELESS_API_KEY=your_api_token_here
    python request.py
"""
import os
import json
import requests

ENDPOINT = "https://api.scrapeless.com/api/v1/scraper/request"


def scrape_amazon(action: str, url: str) -> dict:
    resp = requests.post(
        ENDPOINT,
        headers={
            "Content-Type": "application/json",
            "x-api-token": os.environ["SCRAPELESS_API_KEY"],
        },
        json={"actor": "scraper.amazon", "input": {"action": action, "url": url}},
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


if __name__ == "__main__":
    data = scrape_amazon("product", "https://www.amazon.com/dp/B09B8V1LZ3")
    # `result` is the parsed structured object; `html` is the full rendered page.
    print(json.dumps(data.get("result", {}), indent=2, ensure_ascii=False))
