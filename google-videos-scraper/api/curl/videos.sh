#!/usr/bin/env bash
# Google Videos via the Scrapeless Scraper API (scraper.google.search, tbm=vid).
# Requires: SCRAPELESS_API_KEY in the environment.
set -euo pipefail

: "${SCRAPELESS_API_KEY:?set SCRAPELESS_API_KEY (https://app.scrapeless.com/passport/register)}"

curl -sS -X POST https://api.scrapeless.com/api/v1/scraper/request \
  -H "Content-Type: application/json" \
  -H "x-api-token: ${SCRAPELESS_API_KEY}" \
  -d '{
    "actor": "scraper.google.search",
    "input": { "q": "how to scrape websites", "tbm": "vid" }
  }'
# The response is the parsed Videos object (video_results, inline_videos, pagination, …).
