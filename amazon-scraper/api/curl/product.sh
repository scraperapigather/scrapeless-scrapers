#!/usr/bin/env bash
# Amazon product via the Scrapeless Scraper API (scraper.amazon).
# Requires: SCRAPELESS_API_KEY in the environment.
set -euo pipefail

: "${SCRAPELESS_API_KEY:?set SCRAPELESS_API_KEY (https://app.scrapeless.com/passport/register)}"

curl -sS -X POST https://api.scrapeless.com/api/v1/scraper/request \
  -H "Content-Type: application/json" \
  -H "x-api-token: ${SCRAPELESS_API_KEY}" \
  -d '{
    "actor": "scraper.amazon",
    "input": { "action": "product", "url": "https://www.amazon.com/dp/B09B8V1LZ3" }
  }'
# The response is { html, metadata, result }. Pipe to: | jq '.result'  for the parsed object.
