// Amazon product via the Scrapeless Scraper API (scraper.amazon).
//   export SCRAPELESS_API_KEY=your_api_token_here
//   node request.mjs
const ENDPOINT = "https://api.scrapeless.com/api/v1/scraper/request";

export async function scrapeAmazon(action, url) {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-token": process.env.SCRAPELESS_API_KEY,
    },
    body: JSON.stringify({ actor: "scraper.amazon", input: { action, url } }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

const data = await scrapeAmazon("product", "https://www.amazon.com/dp/B09B8V1LZ3");
// `result` is the parsed structured object; `html` is the full rendered page.
console.log(JSON.stringify(data.result ?? {}, null, 2));
