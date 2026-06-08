// Google AI Overview via the Scrapeless Scraper API (scraper.overview).
//   export SCRAPELESS_API_KEY=your_api_token_here
//   node request.mjs
const ENDPOINT = "https://api.scrapeless.com/api/v2/scraper/execute";

export async function scrapeOverview(prompt, country = "US") {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-token": process.env.SCRAPELESS_API_KEY,
    },
    body: JSON.stringify({ actor: "scraper.overview", input: { prompt, country } }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

const data = await scrapeOverview("what is a proxy server", "US");
// Not every query surfaces an AI Overview; when Google does not, the API returns
// { status: "failed", message: "execution failed" }. Re-phrase to an informational query.
if (data.status !== "success") {
  throw new Error(`No AI Overview for this query/geo: ${data.message}`);
}
console.log(JSON.stringify(data.task_result, null, 2));
