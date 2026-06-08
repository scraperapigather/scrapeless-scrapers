// ChatGPT answer via the Scrapeless Scraper API (scraper.chatgpt).
//   export SCRAPELESS_API_KEY=your_api_token_here
//   node request.mjs
const ENDPOINT = "https://api.scrapeless.com/api/v2/scraper/execute";

export async function askChatGPT(prompt, country = "US") {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-token": process.env.SCRAPELESS_API_KEY,
    },
    body: JSON.stringify({ actor: "scraper.chatgpt", input: { prompt, country } }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

const data = await askChatGPT("What are the best web scraping tools?");
// `task_result` holds the answer (result_text, content_references, links, ...).
console.log(JSON.stringify(data.task_result ?? {}, null, 2));
