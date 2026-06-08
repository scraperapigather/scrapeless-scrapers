#!/usr/bin/env bash
# Perplexity answer via the Scrapeless Scraper API (scraper.perplexity).
# Requires: SCRAPELESS_API_KEY in the environment.
set -euo pipefail

: "${SCRAPELESS_API_KEY:?set SCRAPELESS_API_KEY (https://app.scrapeless.com/passport/register)}"

curl -sS -X POST https://api.scrapeless.com/api/v2/scraper/execute \
  -H "Content-Type: application/json" \
  -H "x-api-token: ${SCRAPELESS_API_KEY}" \
  -d '{
    "actor": "scraper.perplexity",
    "input": {
      "prompt": "What are the main differences between residential and datacenter proxies?",
      "country": "US",
      "web_search": true
    }
  }'
# The response is { status, task_id, task_result }. Pipe to: | jq '.task_result'  for the parsed answer.
