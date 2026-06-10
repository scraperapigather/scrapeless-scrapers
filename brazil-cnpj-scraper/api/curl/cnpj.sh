#!/usr/bin/env bash
# Brazil CNPJ lookup via the Scrapeless Scraper API (scraper.solucoes).
# Two steps: (1) submit the CNPJ -> manifest (inline, or poll a taskId);
#            (2) fetch the company record (comprovante.json) from the manifest's S3 link.
# Requires: SCRAPELESS_API_KEY in the environment.
set -euo pipefail

: "${SCRAPELESS_API_KEY:?set SCRAPELESS_API_KEY (https://app.scrapeless.com/passport/register)}"

TAX_ID="33000167000101"   # Petróleo Brasileiro S.A. — Petrobras

# 1) Submit the lookup.
RESP=$(curl -sS -X POST https://api.scrapeless.com/api/v1/scraper/request \
  -H "Content-Type: application/json" \
  -H "x-api-token: ${SCRAPELESS_API_KEY}" \
  -d "{\"actor\": \"scraper.solucoes\", \"input\": {\"taxId\": \"${TAX_ID}\"}}")

# 1b) If the actor returned a taskId, poll until it leaves "processing".
TASK_ID=$(printf '%s' "${RESP}" | sed -n 's/.*"taskId":"\([^"]*\)".*/\1/p')
if [ -n "${TASK_ID}" ]; then
  echo "taskId: ${TASK_ID}" >&2
  while true; do
    RESP=$(curl -sS "https://api.scrapeless.com/api/v1/scraper/result/${TASK_ID}" \
      -H "x-api-token: ${SCRAPELESS_API_KEY}")
    case "${RESP}" in
      *'"state":"processing"'*) sleep 4 ;;
      *) break ;;
    esac
  done
fi

# Bail out clearly on a validation error (e.g. {"code":10108,"message":"invalid cnpj"}).
case "${RESP}" in
  *'"valid":true'*) : ;;
  *) echo "lookup failed: ${RESP}" >&2; exit 1 ;;
esac

# 2) Build the record URL from the manifest (s3 base + first link url) and fetch it.
S3=$(printf '%s' "${RESP}" | sed -n 's/.*"s3":"\([^"]*\)".*/\1/p')
LINK=$(printf '%s' "${RESP}" | sed -n 's/.*"links":\[{"name":"[^"]*","url":"\([^"]*\)".*/\1/p')

echo "record: ${S3}${LINK}" >&2
curl -sS "${S3}${LINK}"
# The final response is the parsed company record (comprovante.json). Pipe to: | jq '.'
