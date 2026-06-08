#!/usr/bin/env bash
# Shopee product via the Scrapeless Scraper API (scraper.shopeev2).
# This actor is asynchronous: the POST returns a taskId, then you poll for the result.
# Requires: SCRAPELESS_API_KEY in the environment.
set -euo pipefail

: "${SCRAPELESS_API_KEY:?set SCRAPELESS_API_KEY (https://app.scrapeless.com/passport/register)}"

URL="https://shopee.sg/CotonSoft-UltraLux-Pillow-I-Washable-Pillow-I-Support-Pillow-I-Soft-Pillow-I-Hotel-Pillow-I-Fiber-Pillow-i.261548406.5654105940"

# 1) Submit the task.
TASK_ID=$(curl -sS -X POST https://api.scrapeless.com/api/v1/scraper/request \
  -H "Content-Type: application/json" \
  -H "x-api-token: ${SCRAPELESS_API_KEY}" \
  -d "{\"actor\": \"scraper.shopeev2\", \"input\": {\"url\": \"${URL}\"}}" \
  | sed -n 's/.*"taskId":"\([^"]*\)".*/\1/p')

echo "taskId: ${TASK_ID}" >&2

# 2) Poll until the task leaves the "processing" state.
while true; do
  RESP=$(curl -sS "https://api.scrapeless.com/api/v1/scraper/result/${TASK_ID}" \
    -H "x-api-token: ${SCRAPELESS_API_KEY}")
  case "${RESP}" in
    *'"state":"processing"'*) sleep 6 ;;
    *) echo "${RESP}"; break ;;
  esac
done
# The final response carries the parsed product `result`. Pipe to: | jq '.result'
