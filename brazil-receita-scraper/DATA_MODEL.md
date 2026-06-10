# Brazil Receita Federal (CPF) data model

Single source of truth for the response shape returned by the **`scraper.servicos.receita`** actor (the API surface under [`api/`](api/)). The actor drives Brazil's Receita Federal CPF *Consulta Situação Cadastral* form — `taxId` (CPF) + `data` (date of birth) — solving the page captcha for you and returning a parsed JSON object.

The actor normally returns this object **inline** in the POST response (HTTP 200); for slower renders it may return a `taskId` to poll.

## Result envelope

The fields actually observed on the captured `valid: false` run (see [`api/results/receita.json`](api/results/receita.json)):

| Field   | Type    | Required | Notes                                                                                       |
| ------- | ------- | -------- | ------------------------------------------------------------------------------------------- |
| taxId   | string  | yes      | the CPF echoed back, in the `xxx.xxx.xxx-xx` form it was submitted as                        |
| valid   | boolean | yes      | `true` when the CPF + date-of-birth pair matches a record at Receita Federal; otherwise `false` |
| message | string  | no       | Receita Federal status / error text. Present on the `valid: false` branch (e.g. "Data de nascimento … divergente …"). Portuguese, server-supplied. |

### `valid: true` branch (documented, not captured)

Per the [Scrapeless actor docs](https://apidocs.scrapeless.com/api-11954437), a matching CPF + date pair returns `valid: true` together with a richer envelope:

| Field      | Type     | Notes                                                          |
| ---------- | -------- | -------------------------------------------------------------- |
| valid      | boolean  | `true`                                                         |
| links      | object[] | array of `{ name, url, success }` for the fetched Receita pages |
| pages      | string[] | page identifiers (e.g. `"ConsultaPublicaExibir"`)              |
| s3         | string   | base S3 storage URL for the stored rendered page              |
| version    | number   | actor output version                                          |
| createdAt  | string   | ISO timestamp                                                 |
| updatedAt  | string   | ISO timestamp                                                 |

This branch is **deliberately not captured** in [`api/results/receita.json`](api/results/receita.json): forcing `valid: true` requires a real individual's matching CPF + date of birth, which is personal data protected under GDPR/LGPD/CCPA. The fixture instead uses a check-digit-valid **test CPF** (`111.444.777-35`) with a non-matching date, yielding the no-personal-data `valid: false` envelope above. No fields were trimmed — the real `valid: false` response carries no heavy fields (no raw HTML or base64 in the body).
