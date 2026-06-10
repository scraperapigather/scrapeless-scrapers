// Google Flights via the Scrapeless Scraper API (scraper.google.flights).
// Synchronous: the POST response IS the parsed flights object (no polling).
// Round trip (type "1") requires return_date.
//   export SCRAPELESS_API_KEY=your_api_token_here
//   node request.mjs
const ENDPOINT = "https://api.scrapeless.com/api/v1/scraper/request";

export async function scrapeGoogleFlights({
  departureId,
  arrivalId,
  outboundDate,
  returnDate,
  type = "1",
}) {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-token": process.env.SCRAPELESS_API_KEY,
    },
    body: JSON.stringify({
      actor: "scraper.google.flights",
      input: {
        departure_id: departureId,
        arrival_id: arrivalId,
        outbound_date: outboundDate,
        return_date: returnDate,
        type,
      },
    }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

const data = await scrapeGoogleFlights({
  departureId: "LHR",
  arrivalId: "JFK",
  outboundDate: "2026-06-20",
  returnDate: "2026-06-27",
  type: "1",
});
// The parsed flights object lives under "flights_result"
// (best_flights, other_flights, price_insights, airports).
console.log(JSON.stringify(data.flights_result ?? data, null, 2));
