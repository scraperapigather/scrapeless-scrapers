# Google Flights scraper

[Google Flights](https://www.google.com/travel/flights) scraper powered by [Scrapeless](https://www.scrapeless.com/). This is an **API-only** surface — one HTTP request to the Scrapeless **Scraper API**, no browser to drive. It maps to the **`scraper.google.flights`** actor and returns a parsed flights object (best flights, other flights, price insights, airports) — see [`DATA_MODEL.md`](DATA_MODEL.md).

## Surface

| Surface | Path | Built on |
| --- | --- | --- |
| Scraper API | [`api/`](api/) | `POST /api/v1/scraper/request`, actor `scraper.google.flights` |

The [`api/`](api/) folder ships runnable curl, Python, and Node.js clients plus a real captured fixture.

## What it scrapes

A round-trip itinerary search between two airports. Provide IATA codes and dates and the actor returns ranked flight options with airlines, legs, layovers, durations, carbon emissions, and a `price_insights` block (lowest price, typical range, and price history).

```json
{
  "actor": "scraper.google.flights",
  "input": {
    "departure_id": "LHR",
    "arrival_id": "JFK",
    "outbound_date": "2026-06-20",
    "return_date": "2026-06-27",
    "type": "1"
  }
}
```

> **Round-trip is the confirmed surface.** `type: "1"` (round trip) requires `return_date`. See [`api/README.md`](api/README.md) for the full input table and response shape.

## Run

```bash
export SCRAPELESS_API_KEY=your_api_token_here

# curl
bash api/curl/flights.sh

# python
python api/python/request.py

# node
node api/nodejs/request.mjs
```

## Fixtures

- [`api/results/flights.json`](api/results/flights.json) — parsed `flights_result` from a live round-trip `LHR → JFK` run (heavy fields trimmed, see [`DATA_MODEL.md`](DATA_MODEL.md)).

## Fair Use & Legal Disclaimer

See [the repo DISCLAIMER](../DISCLAIMER.md). Educational reference only — review the target site's Terms of Service and `robots.txt`, never collect personal data protected under GDPR/CCPA, and throttle requests.

## Powered by Scrapeless

- 🌐 Website: https://www.scrapeless.com
- 🧭 Scraping Browser: https://www.scrapeless.com/en/product/scraping-browser
- 📚 API docs: https://apidocs.scrapeless.com
- 📝 Blog: https://www.scrapeless.com/en/blog
- 💬 Discord: https://discord.gg/VU2vtbq7Q2
- ✈️ Telegram: https://t.me/scrapeless
- 🚀 Free signup: https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers
