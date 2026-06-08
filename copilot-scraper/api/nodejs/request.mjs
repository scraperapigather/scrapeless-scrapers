// Copilot answer via the Scrapeless Scraper API (scraper.copilot).
//   export SCRAPELESS_API_KEY=your_api_token_here
//   node request.mjs
const ENDPOINT = "https://api.scrapeless.com/api/v2/scraper/execute";

export async function askCopilot(prompt, country = "US", mode = "smart") {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-token": process.env.SCRAPELESS_API_KEY,
    },
    body: JSON.stringify({ actor: "scraper.copilot", input: { prompt, country, mode } }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

const data = await askCopilot("What are the best web scraping tools?");
// `task_result` holds the answer (result_text, citations, links, ...).
console.log(JSON.stringify(data.task_result ?? {}, null, 2));
