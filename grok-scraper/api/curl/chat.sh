#!/usr/bin/env bash
# Grok answer via the Scrapeless Scraper API (scraper.grok).
# Requires: SCRAPELESS_API_KEY in the environment.
set -euo pipefail

: "${SCRAPELESS_API_KEY:?set SCRAPELESS_API_KEY (https://app.scrapeless.com/passport/register)}"

curl -sS -X POST https://api.scrapeless.com/api/v2/scraper/execute \
  -H "Content-Type: application/json" \
  -H "x-api-token: ${SCRAPELESS_API_KEY}" \
  -d '{
    "actor": "scraper.grok",
    "input": {
      "prompt": "What is the best lightweight proxy rotation strategy for web scraping?",
      "country": "US",
      "mode": "MODEL_MODE_AUTO"
    }
  }'
# The response is { status, task_id, task_result }. Pipe to: | jq '.task_result'  for the parsed answer.
