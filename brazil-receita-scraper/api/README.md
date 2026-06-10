# Brazil Receita Federal (CPF) — Scraper API (HTTP request method)

Query Brazil's Receita Federal CPF *Consulta Situação Cadastral* (registration-status) service through the Scrapeless **Scraper API** — one HTTP request, no browser to drive and no captcha to solve yourself. This surface maps to the **`scraper.servicos.receita`** actor.

- **Endpoint:** `POST https://api.scrapeless.com/api/v1/scraper/request`
- **Auth:** header `x-api-token: $SCRAPELESS_API_KEY` ([get a key](https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers))
- **Actor:** `scraper.servicos.receita` (solves the Receita captcha; checks a CPF + date-of-birth pair against the Receita Federal database)

## Request

```json
{
  "actor": "scraper.servicos.receita",
  "input": { "taxId": "111.444.777-35", "data": "01/01/1990" },
  "proxy": { "country": "US" }
}
```

| field | required | description |
| --- | --- | --- |
| `input.taxId` | yes | Brazilian **CPF** (individual taxpayer ID) in `xxx.xxx.xxx-xx` format. A non-date value in `data` returns `{"code":10110,"message":"invalid data field"}`; a missing `taxId` returns `Input is missing the "taxId" field`. |
| `input.data` | yes | the CPF holder's **date of birth** (`data de nascimento`) in `DD/MM/AAAA` format. Missing it returns `Input is missing the "data" field`. |
| `proxy` | no | top-level (sibling of `input`) routing object per the actor docs, e.g. `{"country":"US"}`. |

## Response

`scraper.servicos.receita` normally returns the **parsed object inline** in the POST response (HTTP 200). For slower renders it may instead return `{"taskId":"…"}`; poll `GET https://api.scrapeless.com/api/v1/scraper/result/{taskId}` until `state` is no longer `processing`. The `curl/`, `python/`, and `nodejs/` clients here handle both modes.

The shape depends on whether the CPF + date pair matches a record:

```json
{
  "taxId": "111.444.777-35",
  "valid": false,
  "message": "Data de nascimento informada 01/01/1990 está divergente da constante na base de dados da Secretaria da Receita Federal do Brasil. …"
}
```

- `valid` is `false` when the pair does not match (the captured fixture). When it matches, the actor (per the [actor docs](https://apidocs.scrapeless.com/api-11954437)) returns `valid: true` plus a richer envelope (`links`, `pages`, `s3`, `version`, `createdAt`, `updatedAt`) — see [`DATA_MODEL.md`](../DATA_MODEL.md). That branch is **not** captured here by design (it surfaces a real person's data).
- See [`results/receita.json`](results/receita.json) for the full field set captured from a live run.

## Run it

```bash
export SCRAPELESS_API_KEY=your_api_token_here

# curl
bash curl/receita.sh

# python
python python/request.py

# node
node nodejs/request.mjs
```

## Fixtures

- [`results/receita.json`](results/receita.json) — the parsed object from a live run, using a check-digit-valid **test CPF** (`111.444.777-35`) paired with a deliberately non-matching date, so the response is the no-personal-data `valid: false` envelope. Nothing was trimmed — the real response carries no heavy fields.

## Fair Use & Legal Disclaimer

See [the repo DISCLAIMER](../../DISCLAIMER.md). Educational reference only — review the target site's Terms of Service and `robots.txt`, and throttle requests. **This actor touches personal taxpayer data (CPF).** Never use it to collect, store, or redistribute another person's CPF, date of birth, or registration status — that is personal data protected under GDPR/LGPD/CCPA. The fixture here intentionally uses a non-personal test CPF with a non-matching date so no individual's record is exposed.

## Powered by Scrapeless

- 🌐 Website: https://www.scrapeless.com
- 🧭 Scraping Browser: https://www.scrapeless.com/en/product/scraping-browser
- 📚 API docs: https://apidocs.scrapeless.com
- 📝 Blog: https://www.scrapeless.com/en/blog
- 💬 Discord: https://discord.gg/VU2vtbq7Q2
- ✈️ Telegram: https://t.me/scrapeless
- 🚀 Free signup: https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers
