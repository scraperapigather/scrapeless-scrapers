"""ChatGPT answer via the Scrapeless Scraper API (scraper.chatgpt).

Run:
    export SCRAPELESS_API_KEY=your_api_token_here
    python request.py
"""
import os
import json
import requests

ENDPOINT = "https://api.scrapeless.com/api/v2/scraper/execute"


def ask_chatgpt(prompt: str, country: str = "US") -> dict:
    resp = requests.post(
        ENDPOINT,
        headers={
            "Content-Type": "application/json",
            "x-api-token": os.environ["SCRAPELESS_API_KEY"],
        },
        json={"actor": "scraper.chatgpt", "input": {"prompt": prompt, "country": country}},
        timeout=180,
    )
    resp.raise_for_status()
    return resp.json()


if __name__ == "__main__":
    data = ask_chatgpt("What are the best web scraping tools?")
    # `task_result` holds the answer (result_text, content_references, links, ...).
    print(json.dumps(data.get("task_result", {}), indent=2, ensure_ascii=False))
