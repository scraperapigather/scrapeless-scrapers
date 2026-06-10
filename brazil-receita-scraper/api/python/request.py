"""Brazil Receita Federal CPF lookup via the Scrapeless Scraper API
(scraper.servicos.receita).

The actor solves the Receita captcha for you. It normally returns the parsed
object inline; for slower renders it may hand back a taskId to poll instead —
this client handles both modes.

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


def scrape_receita(tax_id: str, data: str, poll_seconds: int = 6, max_polls: int = 60) -> dict:
    headers = {
        "Content-Type": "application/json",
        "x-api-token": os.environ["SCRAPELESS_API_KEY"],
    }
    payload = {
        "actor": "scraper.servicos.receita",
        "input": {"taxId": tax_id, "data": data},
        "proxy": {"country": "US"},
    }
    submit = requests.post(ENDPOINT, headers=headers, json=payload, timeout=180)
    submit.raise_for_status()
    body = submit.json()
    # A ready result comes back inline; otherwise poll the taskId.
    if not isinstance(body, dict) or "taskId" not in body:
        return body
    task_id = body["taskId"]
    for _ in range(max_polls):
        poll = requests.get(RESULT_ENDPOINT.format(task_id=task_id), headers=headers, timeout=180)
        poll.raise_for_status()
        data_resp = poll.json()
        if data_resp.get("state") != "processing":
            return data_resp
        time.sleep(poll_seconds)
    raise TimeoutError(f"task {task_id} still processing after {max_polls} polls")


if __name__ == "__main__":
    # taxId = CPF (xxx.xxx.xxx-xx); data = date of birth (DD/MM/AAAA).
    # Check-digit-valid TEST CPF with a deliberately non-matching date, so the
    # actor returns the no-personal-data "valid": false envelope.
    result = scrape_receita("111.444.777-35", "01/01/1990")
    print(json.dumps(result, indent=2, ensure_ascii=False))
