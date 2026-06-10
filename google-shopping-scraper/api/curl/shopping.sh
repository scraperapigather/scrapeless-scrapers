#!/usr/bin/env bash
# Google Shopping via the Scrapeless Scraper API (scraper.google.search, tbm=shop).
# Requires: SCRAPELESS_API_KEY in the environment.
set -euo pipefail

: "${SCRAPELESS_API_KEY:?set SCRAPELESS_API_KEY (https://app.scrapeless.com/passport/register)}"

curl -sS -X POST https://api.scrapeless.com/api/v1/scraper/request \
  -H "Content-Type: application/json" \
  -H "x-api-token: ${SCRAPELESS_API_KEY}" \
  -d '{
    "actor": "scraper.google.search",
    "input": { "q": "mechanical keyboard", "tbm": "shop", "hl": "en", "gl": "us" }
  }'
# The response is the parsed Shopping-vertical object
# (search_information, refine_this_search shopping chips, pagination, metadata).
