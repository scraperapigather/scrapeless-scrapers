// Brazil Receita Federal CPF lookup via the Scrapeless Scraper API
// (scraper.servicos.receita). The actor solves the Receita captcha for you.
// It normally returns the parsed object inline; for slower renders it may hand
// back a taskId to poll instead — this client handles both modes.
//   export SCRAPELESS_API_KEY=your_api_token_here
//   node request.mjs
const ENDPOINT = "https://api.scrapeless.com/api/v1/scraper/request";
const RESULT_ENDPOINT = "https://api.scrapeless.com/api/v1/scraper/result";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function scrapeReceita(taxId, data, { pollSeconds = 6, maxPolls = 60 } = {}) {
  const headers = {
    "Content-Type": "application/json",
    "x-api-token": process.env.SCRAPELESS_API_KEY,
  };
  const payload = {
    actor: "scraper.servicos.receita",
    input: { taxId, data },
    proxy: { country: "US" },
  };
  const submit = await fetch(ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!submit.ok) throw new Error(`HTTP ${submit.status}: ${await submit.text()}`);
  const body = await submit.json();
  // A ready result comes back inline; otherwise poll the taskId.
  if (!body || typeof body !== "object" || !body.taskId) return body;
  for (let i = 0; i < maxPolls; i++) {
    const poll = await fetch(`${RESULT_ENDPOINT}/${body.taskId}`, { headers });
    if (!poll.ok) throw new Error(`HTTP ${poll.status}: ${await poll.text()}`);
    const data_resp = await poll.json();
    if (data_resp.state !== "processing") return data_resp;
    await sleep(pollSeconds * 1000);
  }
  throw new Error(`task ${body.taskId} still processing after ${maxPolls} polls`);
}

// taxId = CPF (xxx.xxx.xxx-xx); data = date of birth (DD/MM/AAAA).
// Check-digit-valid TEST CPF with a deliberately non-matching date, so the
// actor returns the no-personal-data "valid": false envelope.
const result = await scrapeReceita("111.444.777-35", "01/01/1990");
console.log(JSON.stringify(result, null, 2));
