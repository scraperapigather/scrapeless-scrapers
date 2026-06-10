// Google Scholar via the Scrapeless Scraper API (scraper.google.scholar).
// This actor is synchronous but FLAKY: it intermittently returns
// {"code":20500,"message":"scraping failed"}. Retry until the body has scholar_result.
//   export SCRAPELESS_API_KEY=your_api_token_here
//   node request.mjs
const ENDPOINT = "https://api.scrapeless.com/api/v1/scraper/request";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function scrapeScholar(query, { hl = "en", maxAttempts = 6 } = {}) {
  const headers = {
    "Content-Type": "application/json",
    "x-api-token": process.env.SCRAPELESS_API_KEY,
  };
  const body = JSON.stringify({
    actor: "scraper.google.scholar",
    input: { q: query, hl },
  });
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const resp = await fetch(ENDPOINT, { method: "POST", headers, body });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
    const data = await resp.json();
    // Success looks like { metadata, scholar_result }.
    if (data.scholar_result) return data;
    // Otherwise it's a transient { code: 20500, ... }; retry.
    console.error(`attempt ${attempt}/${maxAttempts} failed (${JSON.stringify(data)}); retrying…`);
    await sleep(3000);
  }
  throw new Error(`scraper.google.scholar still failing after ${maxAttempts} attempts`);
}

const data = await scrapeScholar("transformer neural network");
// The parsed academic results live under data.scholar_result.
console.log(JSON.stringify(data.scholar_result ?? data, null, 2));
