# Brazil CNPJ scraper

Brazilian **Receita Federal** company lookup powered by [Scrapeless](https://www.scrapeless.com/). Give it a 14-digit CNPJ (the company tax id) and the Scrapeless `scraper.solucoes` actor runs the federal *Comprovante de Inscrição e de Situação Cadastral* (cnpjreva) consultation and returns the full company registration record as JSON — see [`DATA_MODEL.md`](DATA_MODEL.md).

This actor is **API-only** (no browser surface). Everything lives under [`api/`](api/).

## Surface

| Surface | Path | Built on |
| --- | --- | --- |
| Scraper API | [`api/`](api/) | `POST /api/v1/scraper/request` → `scraper.solucoes` |

## What you get

One HTTP request resolves a CNPJ into the official Receita Federal *comprovante* — legal name (`nomeEmpresarial`), trade name (`nomeFantasia`), registration status (`descricaoSituacaoCadastral`), primary + secondary economic activities (`cnaePrincipal` / `cnaesSecundarias`), legal nature, full address, phone, email, and share capital.

## Run

```bash
export SCRAPELESS_API_KEY=your_api_token_here

# curl
bash api/curl/cnpj.sh

# python
python api/python/request.py

# node
node api/nodejs/request.mjs
```

See [`api/README.md`](api/README.md) for the endpoint, the input table, the two-step response shape, and fixtures.

## Fixtures

- [`api/results/cnpj.json`](api/results/cnpj.json) — the real Receita Federal record captured from a live `taxId: "33000167000101"` (Petróleo Brasileiro S.A. — Petrobras) run.

## Fair Use & Legal Disclaimer

This repository is **educational reference material** that demonstrates how Scrapeless powers web data collection. The example programs are not intended for production scraping. CNPJ records are public Receita Federal data, but before building on this actor review the source's Terms of Service, never enrich or redistribute personal data protected under Brazil's LGPD (or GDPR/CCPA), never redistribute entire datasets that may be protected by database rights, and throttle requests so a target service is never degraded. Consult a lawyer if you are unsure whether a use case is lawful. Scrapeless accepts no liability for how these examples are used.

## Powered by Scrapeless

- 🌐 Website: https://www.scrapeless.com
- 🧭 Scraping Browser: https://www.scrapeless.com/en/product/scraping-browser
- 📚 API docs: https://apidocs.scrapeless.com
- 📝 Blog: https://www.scrapeless.com/en/blog
- 💬 Discord: https://discord.gg/VU2vtbq7Q2
- ✈️ Telegram: https://t.me/scrapeless
- 🚀 Free signup: https://app.scrapeless.com/passport/register?utm_source=github&utm_medium=partnership&utm_campaign=scrapeless_scrapers
