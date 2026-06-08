#!/usr/bin/env bash
# Google AI Overview via the Scrapeless Scraper API (scraper.overview).
# Requires: SCRAPELESS_API_KEY in the environment.
set -euo pipefail

: "${SCRAPELESS_API_KEY:?set SCRAPELESS_API_KEY (https://app.scrapeless.com/passport/register)}"

curl -sS -X POST https://api.scrapeless.com/api/v2/scraper/execute \
  -H "Content-Type: application/json" \
  -H "x-api-token: ${SCRAPELESS_API_KEY}" \
  -d '{
    "actor": "scraper.overview",
    "input": { "prompt": "what is a proxy server", "country": "US" }
  }'
# Returns { status, task_id, task_result }. Not every query surfaces an AI Overview;
# when Google does not, status is "failed" ("execution failed") — use an informational prompt.
# Pipe to: | jq '.task_result'  for the AIO body, sources, and shopping flags.
