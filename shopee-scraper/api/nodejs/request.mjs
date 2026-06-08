// Shopee product via the Scrapeless Scraper API (scraper.shopeev2).
// This actor is asynchronous: the POST returns a taskId, then you poll for the result.
//   export SCRAPELESS_API_KEY=your_api_token_here
//   node request.mjs
const ENDPOINT = "https://api.scrapeless.com/api/v1/scraper/request";
const RESULT_ENDPOINT = "https://api.scrapeless.com/api/v1/scraper/result";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function scrapeShopee(url, { pollSeconds = 6, maxPolls = 60 } = {}) {
  const headers = {
    "Content-Type": "application/json",
    "x-api-token": process.env.SCRAPELESS_API_KEY,
  };
  const submit = await fetch(ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ actor: "scraper.shopeev2", input: { url } }),
  });
  if (!submit.ok) throw new Error(`HTTP ${submit.status}: ${await submit.text()}`);
  const body = await submit.json();
  // A ready result may come back inline; otherwise poll the taskId.
  if (!body.taskId) return body;
  for (let i = 0; i < maxPolls; i++) {
    const poll = await fetch(`${RESULT_ENDPOINT}/${body.taskId}`, { headers });
    if (!poll.ok) throw new Error(`HTTP ${poll.status}: ${await poll.text()}`);
    const data = await poll.json();
    if (data.state !== "processing") return data;
    await sleep(pollSeconds * 1000);
  }
  throw new Error(`task ${body.taskId} still processing after ${maxPolls} polls`);
}

const url =
  "https://shopee.sg/CotonSoft-UltraLux-Pillow-I-Washable-Pillow-I-Support-" +
  "Pillow-I-Soft-Pillow-I-Hotel-Pillow-I-Fiber-Pillow-i.261548406.5654105940";
const data = await scrapeShopee(url);
// `result` is the parsed structured object; `html` is the full rendered page.
console.log(JSON.stringify(data.result ?? data, null, 2));
