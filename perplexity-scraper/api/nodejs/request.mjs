// Perplexity answer via the Scrapeless Scraper API (scraper.perplexity).
//   export SCRAPELESS_API_KEY=your_api_token_here
//   node request.mjs
const ENDPOINT = "https://api.scrapeless.com/api/v2/scraper/execute";

export async function scrapePerplexity(prompt, country = "US", webSearch = true) {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-token": process.env.SCRAPELESS_API_KEY,
    },
    body: JSON.stringify({
      actor: "scraper.perplexity",
      input: { prompt, country, web_search: webSearch },
    }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

const data = await scrapePerplexity("What are the main differences between residential and datacenter proxies?");
// `task_result` is the parsed structured answer; `status` is "success" when the run completed.
console.log(JSON.stringify(data.task_result, null, 2));
