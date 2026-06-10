# Brazil CNPJ — Scraper API (HTTP request method)

Resolve a Brazilian **CNPJ** into the official Receita Federal company record with one HTTP request to the Scrapeless **Scraper API** — no browser to drive. This surface maps to the **`scraper.solucoes`** actor, which runs the federal *Comprovante de Inscrição e de Situação Cadastral* (cnpjreva) consultation.

- **Endpoint:** `POST https://api.scrapeless.com/api/v1/scraper/request`
- **Auth:** header `x-api-token: $SCRAPELESS_API_KEY` ([get a key](https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers))
- **Actor:** `scraper.solucoes` (Receita Federal CNPJ lookup; no browser or anti-bot handling needed on your side)

## Request

```json
{
  "actor": "scraper.solucoes",
  "input": { "taxId": "33000167000101" }
}
```

| input field | required | description |
| --- | --- | --- |
| `taxId` | yes | a 14-digit Brazilian CNPJ (digits only, no dots/slash/dash). Invalid numbers return `{"code":10108,"message":"invalid cnpj"}`. |

## Response

The lookup is **two-step**:

**1) The POST returns a manifest** — a validity flag plus a pointer to the stored record:

```json
{
  "taxId": "33000167000101",
  "valid": true,
  "links": [
    { "name": "comprovante.json", "url": "scrapeless.data.solucoes/33000167000101/<version>/comprovante.json", "success": true }
  ],
  "pages": ["comprovante"],
  "version": 1781025949,
  "s3": "https://storage-s3.scrapeless.com/scrapeless-scraper-data/"
}
```

In practice the manifest comes back **inline** (HTTP 200). For slower renders the actor may instead return `{"taskId":"…"}`; poll `GET https://api.scrapeless.com/api/v1/scraper/result/{taskId}` until `state` is no longer `processing`, then read the same manifest.

**2) Fetch the company record** from the manifest by concatenating `s3` + `links[0].url`:

```
GET https://storage-s3.scrapeless.com/scrapeless-scraper-data/scrapeless.data.solucoes/33000167000101/<version>/comprovante.json
```

That `comprovante.json` is the **parsed company record** — legal name, trade name, registration status, primary/secondary CNAE activities, legal nature, address, phone, email, and share capital (see [`results/cnpj.json`](results/cnpj.json) for the full field set captured from a live run, and [`../DATA_MODEL.md`](../DATA_MODEL.md) for every field).

The `curl` / `python` / `nodejs` clients here do both steps for you (submit, poll if needed, then fetch the S3 record).

> **Encoding note:** accented Portuguese arrives double-encoded (each UTF-8 byte rendered as Latin-1), so `Extração` reads as `ExtraÃ§Ã£o`. Recover it with `s.encode("latin-1").decode("utf-8")` (Python) or `Buffer.from(s, "latin1").toString("utf8")` (Node). The fixture preserves the raw form.

## Run it

```bash
export SCRAPELESS_API_KEY=your_api_token_here

bash curl/cnpj.sh        # curl (submits, polls if needed, fetches the record)
python python/request.py # python
node nodejs/request.mjs  # node
```

## Fixtures

- [`results/cnpj.json`](results/cnpj.json) — the real Receita Federal `comprovante` record from a live `taxId: "33000167000101"` (Petrobras) run. Nothing trimmed; accents kept in their raw double-encoded form.

## Fair Use & Legal Disclaimer

See [the repo DISCLAIMER](../../DISCLAIMER.md). Educational reference only — review the target service's Terms of Service and `robots.txt`, never enrich or redistribute personal data protected under Brazil's LGPD (or GDPR/CCPA), and throttle requests.

## Powered by Scrapeless

- 🌐 Website: https://www.scrapeless.com
- 🧭 Scraping Browser: https://www.scrapeless.com/en/product/scraping-browser
- 📚 API docs: https://apidocs.scrapeless.com
- 📝 Blog: https://www.scrapeless.com/en/blog
- 💬 Discord: https://discord.gg/VU2vtbq7Q2
- ✈️ Telegram: https://t.me/scrapeless
- 🚀 Free signup: https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers
