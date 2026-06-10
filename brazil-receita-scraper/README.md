# Brazil Receita Federal (CPF) scraper

Brazil [Receita Federal](https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublica.asp) CPF *Consulta Situação Cadastral* (registration-status) lookup powered by [Scrapeless](https://www.scrapeless.com/). **API-only** — one HTTP request drives the Scrapeless **`scraper.servicos.receita`** actor, which solves the page captcha for you and returns a parsed JSON object. See [`DATA_MODEL.md`](DATA_MODEL.md) for the response shape.

## What it scrapes

You pass a **CPF** (Brazilian individual taxpayer ID) plus the holder's **date of birth**; the actor queries the Receita Federal CPF status service and returns whether the pair is valid, along with the Receita status message.

## Actor

| | |
| --- | --- |
| Actor | `scraper.servicos.receita` |
| Mode | asynchronous-capable (returns the parsed object inline in practice; may hand back a `taskId` to poll) |
| Endpoint | `POST https://api.scrapeless.com/api/v1/scraper/request` |
| Input | `{ "taxId": "xxx.xxx.xxx-xx", "data": "DD/MM/AAAA" }` (+ optional top-level `proxy`) |

## Surface

This actor has **no browser scraper** — it is API-only.

| Surface | Path |
| --- | --- |
| API (curl / Python / Node.js) | [`api/`](api/) |

## Run

```bash
export SCRAPELESS_API_KEY=your_api_token_here

bash api/curl/receita.sh       # curl
python api/python/request.py   # python
node api/nodejs/request.mjs    # node
```

## Fixtures

- [`api/results/receita.json`](api/results/receita.json) — parsed object from a live run (a no-personal-data `valid: false` envelope; see [`api/README.md`](api/README.md) for why).

## Fair Use & Legal Disclaimer

See [the repo DISCLAIMER](../DISCLAIMER.md) and [`api/README.md`](api/README.md). Educational reference only. **This actor touches personal taxpayer data (CPF)** — never use it to collect, store, or redistribute another person's CPF, date of birth, or registration status. Personal data is protected under GDPR/LGPD/CCPA.
