// Gemini answer via the Scrapeless Scraper API (scraper.gemini).
//   export SCRAPELESS_API_KEY=your_api_token_here
//   node request.mjs
const ENDPOINT = "https://api.scrapeless.com/api/v2/scraper/execute";

export async function askGemini(prompt, country = "US") {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-token": process.env.SCRAPELESS_API_KEY,
    },
    body: JSON.stringify({ actor: "scraper.gemini", input: { prompt, country } }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

const data = await askGemini("What are the best web scraping tools?");
// `task_result` holds the answer (result_text, citations, ...).
console.log(JSON.stringify(data.task_result ?? {}, null, 2));
