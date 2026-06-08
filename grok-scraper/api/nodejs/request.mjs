// Grok answer via the Scrapeless Scraper API (scraper.grok).
//   export SCRAPELESS_API_KEY=your_api_token_here
//   node request.mjs
const ENDPOINT = "https://api.scrapeless.com/api/v2/scraper/execute";

export async function scrapeGrok(prompt, country = "US", mode = "MODEL_MODE_AUTO") {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-token": process.env.SCRAPELESS_API_KEY,
    },
    body: JSON.stringify({
      actor: "scraper.grok",
      input: { prompt, country, mode },
    }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

const data = await scrapeGrok("What is the best lightweight proxy rotation strategy for web scraping?");
// `task_result` is the parsed structured answer; `status` is "success" when the run completed.
console.log(JSON.stringify(data.task_result, null, 2));
