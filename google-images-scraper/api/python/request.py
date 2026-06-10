"""Google Images via the Scrapeless Scraper API (scraper.google.search, tbm=isch).

Run:
    export SCRAPELESS_API_KEY=your_api_token_here
    python request.py
"""
import os
import json
import requests

ENDPOINT = "https://api.scrapeless.com/api/v1/scraper/request"


def scrape_google_images(query: str) -> dict:
    resp = requests.post(
        ENDPOINT,
        headers={
            "Content-Type": "application/json",
            "x-api-token": os.environ["SCRAPELESS_API_KEY"],
        },
        json={"actor": "scraper.google.search", "input": {"q": query, "tbm": "isch"}},
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


if __name__ == "__main__":
    data = scrape_google_images("golden retriever")
    # google.search flattens the parsed result at the top level;
    # `data["result"]` falls back to the whole response.
    print(json.dumps(data.get("result", data), indent=2, ensure_ascii=False))
