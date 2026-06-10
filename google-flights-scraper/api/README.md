# Google Flights — Scraper API (HTTP request method)

The fastest way to pull Google Flights data: one HTTP request to the Scrapeless **Scraper API**, no browser to drive. This surface maps to the **`scraper.google.flights`** actor and returns a parsed flights object (best flights, other flights, price insights, and airports).

- **Endpoint:** `POST https://api.scrapeless.com/api/v1/scraper/request`
- **Auth:** header `x-api-token: $SCRAPELESS_API_KEY` ([get a key](https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers))
- **Actor:** `scraper.google.flights` (Google Flights round-trip search; no browser or anti-bot handling needed on your side)

## Request

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

| input field     | required | description |
| --------------- | -------- | ----------- |
| `departure_id`  | yes      | Origin airport IATA code (e.g. `LHR`) |
| `arrival_id`    | yes      | Destination airport IATA code (e.g. `JFK`) |
| `outbound_date` | yes      | Outbound date, `YYYY-MM-DD` |
| `return_date`   | yes (round trip) | Return date, `YYYY-MM-DD`. Required when `type` is `"1"` |
| `type`          | yes      | Trip type — `"1"` = round trip (confirmed). Round trip is the documented surface; `type` `"2"` (one-way) fails input validation without a `return_date`, so use round trip. |

## Response

The actor returns the **parsed flights object directly** under `flights_result`, alongside a Scrapeless `metadata` envelope:

```json
{
  "flights_result": {
    "best_flights": [
      {
        "flights": [
          {
            "departure_airport": { "name": "Heathrow Airport", "id": "LHR", "time": "2026-06-20 8:40" },
            "arrival_airport":   { "name": "Boston Logan International Airport", "id": "BOS", "time": "2026-06-20 11:34" },
            "duration": 474,
            "airline": "JetBlue",
            "flight_number": "B6 1621",
            "legroom": "32 in"
          }
        ],
        "layovers": [ { "duration": 270, "name": "Boston Logan International Airport", "id": "BOS", "overnight": false } ],
        "total_duration": 825,
        "carbon_emissions": { "this_flight": 600000, "typical_for_this_route": 327000, "difference_percent": 83 },
        "price": 1022,
        "departure_token": "WyJDalJJ…"
      }
    ],
    "other_flights": [ ... ],
    "price_insights": {
      "lowest_price": 726,
      "price_level": "normal",
      "typical_price_range": [660, 890],
      "price_history": [[1775775600, 907], [1775862000, 975]]
    },
    "airports": [ { "departure": [ ... ], "arrival": [ ... ] } ]
  },
  "metadata": { "engine": "google.flights", "rawUrl": "https://api.scrapeless.com/storage/…json" }
}
```

- `flights_result` **is** the parsed structured result — use it directly (see [`results/flights.json`](results/flights.json) for the full field set captured from a live run).
- Direct flights carry `layovers: null`; `departure_token` is an opaque base64 continuation token.
- `metadata.rawUrl` is a stored copy of the raw rendered JSON if you want fields the actor does not surface.

See [`../DATA_MODEL.md`](../DATA_MODEL.md) for the full field reference and the fixture trims.

## Run it

```bash
export SCRAPELESS_API_KEY=your_api_token_here

# curl
bash curl/flights.sh

# python
python python/request.py

# node
node nodejs/request.mjs
```

## Fixtures

- [`results/flights.json`](results/flights.json) — parsed `flights_result` from a live round-trip `LHR → JFK` run. Heavy fields are trimmed (base64 `departure_token`s shortened, `other_flights` cut to 2, `price_history` cut to 6); see [`../DATA_MODEL.md`](../DATA_MODEL.md).

## Fair Use & Legal Disclaimer

See [the repo DISCLAIMER](../../DISCLAIMER.md). Educational reference only — review the target site's Terms of Service and `robots.txt`, never collect personal data protected under GDPR/CCPA, and throttle requests.

## Powered by Scrapeless

- 🌐 Website: https://www.scrapeless.com
- 🧭 Scraping Browser: https://www.scrapeless.com/en/product/scraping-browser
- 📚 API docs: https://apidocs.scrapeless.com
- 📝 Blog: https://www.scrapeless.com/en/blog
- 💬 Discord: https://discord.gg/VU2vtbq7Q2
- ✈️ Telegram: https://t.me/scrapeless
- 🚀 Free signup: https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers
