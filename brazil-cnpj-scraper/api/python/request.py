"""Brazil CNPJ lookup via the Scrapeless Scraper API (scraper.solucoes).

Two steps:
  1. POST the CNPJ -> a manifest (returned inline, or via a taskId you poll).
  2. Fetch the company record (comprovante.json) from the manifest's S3 link.

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


def _deep_unmojibake(value):
    """Recover Receita Federal text that arrives double-encoded (UTF-8 bytes as Latin-1).

    'ExtraÃ§Ã£o' -> 'Extração'. Walks dicts/lists; leaves clean strings untouched.
    """
    if isinstance(value, str):
        try:
            return value.encode("latin-1").decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            return value
    if isinstance(value, list):
        return [_deep_unmojibake(v) for v in value]
    if isinstance(value, dict):
        return {k: _deep_unmojibake(v) for k, v in value.items()}
    return value


def lookup_cnpj(tax_id: str, poll_seconds: int = 4, max_polls: int = 60) -> dict:
    headers = {
        "Content-Type": "application/json",
        "x-api-token": os.environ["SCRAPELESS_API_KEY"],
    }
    submit = requests.post(
        ENDPOINT,
        headers=headers,
        json={"actor": "scraper.solucoes", "input": {"taxId": tax_id}},
        timeout=120,
    )
    submit.raise_for_status()
    manifest = submit.json()

    # The manifest may come back inline, or behind a taskId to poll.
    if "taskId" in manifest:
        task_id = manifest["taskId"]
        for _ in range(max_polls):
            poll = requests.get(RESULT_ENDPOINT.format(task_id=task_id), headers=headers, timeout=120)
            poll.raise_for_status()
            manifest = poll.json()
            if manifest.get("state") != "processing":
                break
            time.sleep(poll_seconds)
        else:
            raise TimeoutError(f"task {task_id} still processing after {max_polls} polls")

    if not manifest.get("valid"):
        raise ValueError(f"lookup failed: {manifest}")

    # Resolve the stored record: s3 base + first link url.
    link = manifest["links"][0]["url"]
    record_url = manifest["s3"] + link
    record = requests.get(record_url, timeout=120)
    record.raise_for_status()
    return record.json()


if __name__ == "__main__":
    # Petróleo Brasileiro S.A. — Petrobras
    data = lookup_cnpj("33000167000101")
    # Raw record keeps Receita Federal's double-encoded accents (see DATA_MODEL.md);
    # pass through _deep_unmojibake(data) if you want clean Portuguese text.
    print(json.dumps(data, indent=2, ensure_ascii=False))
