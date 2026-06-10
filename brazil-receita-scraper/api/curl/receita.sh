#!/usr/bin/env bash
# Brazil Receita Federal CPF "Consulta Situacao Cadastral" via the Scrapeless
# Scraper API (scraper.servicos.receita). The actor solves the Receita captcha
# for you. It normally returns the parsed object inline; for slower renders it
# may instead hand back a taskId to poll — this script handles both modes.
# Requires: SCRAPELESS_API_KEY in the environment.
set -euo pipefail

: "${SCRAPELESS_API_KEY:?set SCRAPELESS_API_KEY (https://app.scrapeless.com/passport/register)}"

# taxId = CPF in xxx.xxx.xxx-xx form; data = the holder's date of birth (DD/MM/AAAA).
# This is a check-digit-valid TEST CPF paired with a deliberately non-matching
# date, so the actor returns the no-personal-data "valid": false envelope.
TAX_ID="111.444.777-35"
DOB="01/01/1990"

REQ=$(printf '{"actor":"scraper.servicos.receita","input":{"taxId":"%s","data":"%s"},"proxy":{"country":"US"}}' "${TAX_ID}" "${DOB}")

RESP=$(curl -sS -X POST https://api.scrapeless.com/api/v1/scraper/request \
  -H "Content-Type: application/json" \
  -H "x-api-token: ${SCRAPELESS_API_KEY}" \
  -d "${REQ}")

# Async path: if the submit returned a taskId, poll until it leaves "processing".
TASK_ID=$(printf '%s' "${RESP}" | sed -n 's/.*"taskId":"\([^"]*\)".*/\1/p')
if [ -z "${TASK_ID}" ]; then
  echo "${RESP}"   # inline parsed object (taxId, valid, message[, ...])
  exit 0
fi

echo "taskId: ${TASK_ID}" >&2
while true; do
  RESP=$(curl -sS "https://api.scrapeless.com/api/v1/scraper/result/${TASK_ID}" \
    -H "x-api-token: ${SCRAPELESS_API_KEY}")
  case "${RESP}" in
    *'"state":"processing"'*) sleep 6 ;;
    *) echo "${RESP}"; break ;;
  esac
done
# The final response is the parsed Receita object. Pipe to: | jq
