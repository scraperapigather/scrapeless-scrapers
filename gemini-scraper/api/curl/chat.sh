#!/usr/bin/env bash
# Gemini answer via the Scrapeless Scraper API (scraper.gemini).
# Requires: SCRAPELESS_API_KEY in the environment.
set -euo pipefail

: "${SCRAPELESS_API_KEY:?set SCRAPELESS_API_KEY (https://app.scrapeless.com/passport/register)}"

curl -sS -X POST https://api.scrapeless.com/api/v2/scraper/execute \
  -H "Content-Type: application/json" \
  -H "x-api-token: ${SCRAPELESS_API_KEY}" \
  -d '{
    "actor": "scraper.gemini",
    "input": { "prompt": "What are the best web scraping tools?", "country": "US" }
  }'
# The response is { status, task_id, task_result }. Pipe to: | jq '.task_result'  for the answer.
