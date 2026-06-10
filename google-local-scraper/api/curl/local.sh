#!/usr/bin/env bash
# Google local pack via the Scrapeless Scraper API (scraper.google.search, tbm=lcl).
# Requires: SCRAPELESS_API_KEY in the environment.
set -euo pipefail

: "${SCRAPELESS_API_KEY:?set SCRAPELESS_API_KEY (https://app.scrapeless.com/passport/register)}"

curl -sS -X POST https://api.scrapeless.com/api/v1/scraper/request \
  -H "Content-Type: application/json" \
  -H "x-api-token: ${SCRAPELESS_API_KEY}" \
  -d '{
    "actor": "scraper.google.search",
    "input": { "q": "coffee shops in San Francisco", "tbm": "lcl" }
  }'
# The response is the parsed local pack object (local_results.places[], suggested_searches, …).
