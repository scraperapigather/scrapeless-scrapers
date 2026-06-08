// Google AI Mode answer via the Scrapeless Scraper API (scraper.aimode).
//   export SCRAPELESS_API_KEY=your_api_token_here
//   node request.mjs
const ENDPOINT = "https://api.scrapeless.com/api/v2/scraper/execute";

export async function scrapeAimode(prompt, country = "US") {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-token": process.env.SCRAPELESS_API_KEY,
    },
    body: JSON.stringify({
      actor: "scraper.aimode",
      input: { prompt, country },
    }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

const data = await scrapeAimode("best running shoes 2026");
// `task_result` is the parsed structured answer; `status` is "success" when the run completed.
console.log(JSON.stringify(data.task_result, null, 2));
