"""Shopee product via the Scrapeless Scraper API (scraper.shopeev2).

This actor is asynchronous: the POST returns a taskId, then you poll for the result.

Run:
    export SCRAPELESS_API_KEY=your_api_token_here
    python request.py
"""
import os
import json
import time
import requests

ENDPOINT = "https://api.scrapeless.com/api/v1/scraper/request"
RESULT_ENDPOINT = "https://api.scrapeless.com/api/v1/scraper/result/{task_id}"


def scrape_shopee(url: str, poll_seconds: int = 6, max_polls: int = 60) -> dict:
    headers = {
        "Content-Type": "application/json",
        "x-api-token": os.environ["SCRAPELESS_API_KEY"],
    }
    submit = requests.post(
        ENDPOINT,
        headers=headers,
        json={"actor": "scraper.shopeev2", "input": {"url": url}},
        timeout=120,
    )
    submit.raise_for_status()
    body = submit.json()
    # A ready result may come back inline; otherwise poll the taskId.
    if "taskId" not in body:
        return body
    task_id = body["taskId"]
    for _ in range(max_polls):
        poll = requests.get(RESULT_ENDPOINT.format(task_id=task_id), headers=headers, timeout=120)
        poll.raise_for_status()
        data = poll.json()
        if data.get("state") != "processing":
            return data
        time.sleep(poll_seconds)
    raise TimeoutError(f"task {task_id} still processing after {max_polls} polls")


if __name__ == "__main__":
    url = (
        "https://shopee.sg/CotonSoft-UltraLux-Pillow-I-Washable-Pillow-I-Support-"
        "Pillow-I-Soft-Pillow-I-Hotel-Pillow-I-Fiber-Pillow-i.261548406.5654105940"
    )
    data = scrape_shopee(url)
    # `result` is the parsed structured object; `html` is the full rendered page.
    print(json.dumps(data.get("result", data), indent=2, ensure_ascii=False))
