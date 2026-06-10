#!/usr/bin/env bash
# Google Images via the Scrapeless Scraper API (scraper.google.search, tbm=isch).
# Requires: SCRAPELESS_API_KEY in the environment.
set -euo pipefail

: "${SCRAPELESS_API_KEY:?set SCRAPELESS_API_KEY (https://app.scrapeless.com/passport/register)}"

curl -sS -X POST https://api.scrapeless.com/api/v1/scraper/request \
  -H "Content-Type: application/json" \
  -H "x-api-token: ${SCRAPELESS_API_KEY}" \
  -d '{
    "actor": "scraper.google.search",
    "input": { "q": "golden retriever", "tbm": "isch" }
  }'
# The response is the parsed Google Images object (search_information, suggested_searches
# with base64 thumbnails, and metadata.rawUrl pointing at the full rendered image page).
