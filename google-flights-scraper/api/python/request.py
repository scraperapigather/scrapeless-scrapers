"""Google Flights via the Scrapeless Scraper API (scraper.google.flights).

Synchronous: the POST response IS the parsed flights object (no polling).
Round trip (type "1") requires return_date.

Run:
    export SCRAPELESS_API_KEY=your_api_token_here
    python request.py
"""
import os
import json
import requests

ENDPOINT = "https://api.scrapeless.com/api/v1/scraper/request"


def scrape_google_flights(
    departure_id: str,
    arrival_id: str,
    outbound_date: str,
    return_date: str,
    trip_type: str = "1",
) -> dict:
    resp = requests.post(
        ENDPOINT,
        headers={
            "Content-Type": "application/json",
            "x-api-token": os.environ["SCRAPELESS_API_KEY"],
        },
        json={
            "actor": "scraper.google.flights",
            "input": {
                "departure_id": departure_id,
                "arrival_id": arrival_id,
                "outbound_date": outbound_date,
                "return_date": return_date,
                "type": trip_type,
            },
        },
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


if __name__ == "__main__":
    data = scrape_google_flights(
        departure_id="LHR",
        arrival_id="JFK",
        outbound_date="2026-06-20",
        return_date="2026-06-27",
        trip_type="1",
    )
    # The parsed flights object lives under "flights_result"
    # (best_flights, other_flights, price_insights, airports).
    print(json.dumps(data.get("flights_result", data), indent=2, ensure_ascii=False))
