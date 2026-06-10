#!/usr/bin/env bash
# Google Scholar via the Scrapeless Scraper API (scraper.google.scholar).
# This actor is synchronous but FLAKY: it intermittently returns
# {"code":20500,"message":"scraping failed"}. Retry until the body has scholar_result.
# Requires: SCRAPELESS_API_KEY in the environment.
set -euo pipefail

: "${SCRAPELESS_API_KEY:?set SCRAPELESS_API_KEY (https://app.scrapeless.com/passport/register)}"

MAX_ATTEMPTS=6

for attempt in $(seq 1 "${MAX_ATTEMPTS}"); do
  RESP=$(curl -sS -X POST https://api.scrapeless.com/api/v1/scraper/request \
    -H "Content-Type: application/json" \
    -H "x-api-token: ${SCRAPELESS_API_KEY}" \
    -d '{
      "actor": "scraper.google.scholar",
      "input": { "q": "transformer neural network", "hl": "en" }
    }')

  case "${RESP}" in
    *'"scholar_result"'*)
      echo "${RESP}"   # parsed result: { metadata, scholar_result }
      exit 0 ;;
    *)
      echo "attempt ${attempt}/${MAX_ATTEMPTS} failed (${RESP}); retrying…" >&2
      sleep 3 ;;
  esac
done

echo "gave up after ${MAX_ATTEMPTS} attempts" >&2
exit 1
