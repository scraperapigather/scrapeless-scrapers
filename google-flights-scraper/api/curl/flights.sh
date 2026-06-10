#!/usr/bin/env bash
# Google Flights via the Scrapeless Scraper API (scraper.google.flights).
# Synchronous: the POST response IS the parsed flights object.
# Round trip (type "1") requires return_date.
# Requires: SCRAPELESS_API_KEY in the environment.
set -euo pipefail

: "${SCRAPELESS_API_KEY:?set SCRAPELESS_API_KEY (https://app.scrapeless.com/passport/register)}"

curl -sS -X POST https://api.scrapeless.com/api/v1/scraper/request \
  -H "Content-Type: application/json" \
  -H "x-api-token: ${SCRAPELESS_API_KEY}" \
  -d '{
    "actor": "scraper.google.flights",
    "input": {
      "departure_id": "LHR",
      "arrival_id": "JFK",
      "outbound_date": "2026-06-20",
      "return_date": "2026-06-27",
      "type": "1"
    }
  }'
# The response is the parsed flights object under "flights_result"
# (best_flights, other_flights, price_insights, airports). Pipe to: | jq '.flights_result'
