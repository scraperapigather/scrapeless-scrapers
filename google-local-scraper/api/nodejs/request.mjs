// Google local pack via the Scrapeless Scraper API (scraper.google.search, tbm=lcl).
//   export SCRAPELESS_API_KEY=your_api_token_here
//   node request.mjs
const ENDPOINT = "https://api.scrapeless.com/api/v1/scraper/request";

export async function scrapeLocal(query) {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-token": process.env.SCRAPELESS_API_KEY,
    },
    body: JSON.stringify({
      actor: "scraper.google.search",
      input: { q: query, tbm: "lcl" },
    }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

const data = await scrapeLocal("coffee shops in San Francisco");
// google.search flattens the parsed local pack at the top level;
// `data.result` falls back to the whole response.
console.log(JSON.stringify(data.result ?? data, null, 2));
