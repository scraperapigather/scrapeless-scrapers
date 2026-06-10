// Brazil CNPJ lookup via the Scrapeless Scraper API (scraper.solucoes).
// Two steps:
//   1. POST the CNPJ -> a manifest (returned inline, or via a taskId you poll).
//   2. Fetch the company record (comprovante.json) from the manifest's S3 link.
//   export SCRAPELESS_API_KEY=your_api_token_here
//   node request.mjs
const ENDPOINT = "https://api.scrapeless.com/api/v1/scraper/request";
const RESULT_ENDPOINT = "https://api.scrapeless.com/api/v1/scraper/result";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Recover Receita Federal text that arrives double-encoded (UTF-8 bytes as Latin-1).
// "ExtraÃ§Ã£o" -> "Extração". Walks objects/arrays; leaves clean strings untouched.
export function deepUnmojibake(value) {
  if (typeof value === "string") {
    try {
      return Buffer.from(value, "latin1").toString("utf8");
    } catch {
      return value;
    }
  }
  if (Array.isArray(value)) return value.map(deepUnmojibake);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepUnmojibake(v)]));
  }
  return value;
}

export async function lookupCnpj(taxId, { pollSeconds = 4, maxPolls = 60 } = {}) {
  const headers = {
    "Content-Type": "application/json",
    "x-api-token": process.env.SCRAPELESS_API_KEY,
  };
  const submit = await fetch(ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ actor: "scraper.solucoes", input: { taxId } }),
  });
  if (!submit.ok) throw new Error(`HTTP ${submit.status}: ${await submit.text()}`);
  let manifest = await submit.json();

  // The manifest may come back inline, or behind a taskId to poll.
  if (manifest.taskId) {
    let done = false;
    for (let i = 0; i < maxPolls; i++) {
      const poll = await fetch(`${RESULT_ENDPOINT}/${manifest.taskId}`, { headers });
      if (!poll.ok) throw new Error(`HTTP ${poll.status}: ${await poll.text()}`);
      manifest = await poll.json();
      if (manifest.state !== "processing") {
        done = true;
        break;
      }
      await sleep(pollSeconds * 1000);
    }
    if (!done) throw new Error(`task still processing after ${maxPolls} polls`);
  }

  if (!manifest.valid) throw new Error(`lookup failed: ${JSON.stringify(manifest)}`);

  // Resolve the stored record: s3 base + first link url.
  const recordUrl = manifest.s3 + manifest.links[0].url;
  const record = await fetch(recordUrl);
  if (!record.ok) throw new Error(`HTTP ${record.status}: ${await record.text()}`);
  return record.json();
}

// Petróleo Brasileiro S.A. — Petrobras
const data = await lookupCnpj("33000167000101");
// Raw record keeps Receita Federal's double-encoded accents (see DATA_MODEL.md);
// pass through deepUnmojibake(data) if you want clean Portuguese text.
console.log(JSON.stringify(data, null, 2));
