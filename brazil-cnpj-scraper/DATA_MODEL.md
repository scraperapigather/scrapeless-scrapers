# Brazil CNPJ data model

Single source of truth for the shape returned by the **`scraper.solucoes`** actor (Receita Federal CNPJ / cnpjreva consultation). Field names mirror the actor output verbatim — they are the original Portuguese keys from the federal *comprovante*.

The lookup is **two-step**:

1. `POST /api/v1/scraper/request` with `input.taxId` returns a small **manifest** (validity flag + a pointer to the stored record).
2. The actual company record (`comprovante.json`) is fetched from the S3 URL named in the manifest.

The fixture under [`api/results/cnpj.json`](api/results/cnpj.json) is the **step-2 company record** from a live `taxId: "33000167000101"` (Petrobras) run.

## Manifest — the direct POST response

```json
{
  "taxId": "33000167000101",
  "valid": true,
  "createdAt": "2026-06-09T17:25:49.283Z",
  "updatedAt": "2026-06-09T17:25:49.283Z",
  "links": [
    { "name": "comprovante.json", "url": "scrapeless.data.solucoes/33000167000101/1781025949/comprovante.json", "success": true }
  ],
  "pages": ["comprovante"],
  "version": 1781025949,
  "s3": "https://storage-s3.scrapeless.com/scrapeless-scraper-data/"
}
```

| Field      | Type     | Required | Notes                                                                                  |
| ---------- | -------- | -------- | -------------------------------------------------------------------------------------- |
| taxId      | string   | yes      | The 14-digit CNPJ you submitted, echoed back                                           |
| valid      | bool     | yes      | `true` when the CNPJ passed validation and a record was produced                       |
| createdAt  | string   | yes      | ISO timestamp of the record build                                                      |
| updatedAt  | string   | yes      | ISO timestamp of the record build                                                      |
| links      | object[] | yes      | One entry per stored page; each `{ name, url, success }`. Concatenate `s3` + `url`      |
| pages      | string[] | yes      | Page names produced — currently `["comprovante"]`                                      |
| version    | int      | yes      | Build version (also embedded in the stored `url` path); changes on every fresh request |
| s3         | string   | yes      | Storage base URL; prepend to each `links[].url` to fetch the record                    |

In practice the POST returns this manifest **inline** (HTTP 200). The actor can also return `{"taskId":"…"}` for slower renders — in that case poll `GET /api/v1/scraper/result/{taskId}` until `state` is no longer `processing`, then read the same manifest. The `curl` / `python` / `nodejs` clients handle both modes and then resolve the S3 link.

If the CNPJ fails validation the POST returns `{"code":10108,"message":"invalid cnpj"}` instead of a manifest.

## Comprovante — the company record (`api/results/cnpj.json`)

| Field                             | Type            | Required | Notes                                                                                          |
| --------------------------------- | --------------- | -------- | ---------------------------------------------------------------------------------------------- |
| cnpj                              | string          | yes      | 14-digit unformatted CNPJ                                                                       |
| cnpjFormatado                     | string          | yes      | Masked/formatted CNPJ, e.g. `33.000.167/0001-01`                                                |
| tipoEstabelecimento               | string          | yes      | `MATRIZ` (headquarters) or `FILIAL` (branch)                                                    |
| dataAbertura                      | string          | yes      | Opening date, `dd/mm/yyyy`                                                                      |
| nomeEmpresarial                   | string          | yes      | Legal company name                                                                             |
| nomeFantasia                      | string          | no       | Trade name; may be empty                                                                        |
| porteDescricao                    | string          | yes      | Company size: `ME`, `EPP`, or `DEMAIS`                                                          |
| indicadorStatusDispensa           | null            | no       | Reserved; `null` in observed runs                                                               |
| cnaePrincipal                     | object          | yes      | Primary economic activity (CNAE) — see CNAE object below                                        |
| isAtiva                           | bool            | yes      | `true` when registration status is active                                                      |
| cnaesSecundarias                  | object[]        | yes      | Secondary economic activities; same CNAE shape; can be empty                                    |
| codigoNaturezaJuridica            | string          | yes      | Legal-nature code, e.g. `203-8`                                                                 |
| descricaoNaturezaJuridica         | string          | yes      | Legal-nature description, e.g. `Sociedade de Economia Mista`                                    |
| nomeLogradouro                    | string          | yes      | Street name                                                                                    |
| numero                            | string          | yes      | Street number (`SN` when none)                                                                  |
| complemento                       | string          | no       | Address complement; may be masked as `********`                                                 |
| cep                               | string          | yes      | Postal code, e.g. `20.031-170`                                                                  |
| bairro                            | string          | yes      | Neighborhood                                                                                    |
| municipio                         | string          | yes      | City                                                                                           |
| uf                                | string          | yes      | State (2-letter UF)                                                                             |
| nomeSituacaoEspecial              | string          | no       | Special-status name; masked `********` when none                                                |
| dataSituacaoEspecial              | string          | no       | Special-status date; masked `********` when none                                                |
| codigoSituacaoCadastral           | string          | yes      | Registration-status code (`2` = active)                                                         |
| dataSituacaoCadastral             | string          | yes      | Registration-status date, `dd/mm/yyyy`                                                          |
| descricaoMotivoSituacao           | string          | no       | Status reason; often a single space                                                            |
| numerosTelefone                   | string          | no       | Phone number(s)                                                                                |
| codigoOrgaoJurisdicao             | string          | no       | Jurisdiction agency code                                                                        |
| descricaoOrgaoJurisdicao          | string          | no       | Jurisdiction agency description                                                                 |
| indicadorMatriz                   | string          | yes      | `1` for headquarters                                                                            |
| email                             | string          | no       | Registered email                                                                               |
| descricaoEnteFederativoResponsavel| string          | no       | Responsible federal entity (for public bodies), e.g. `UNIÃO`                                    |
| descricaoSituacaoCadastral        | string          | yes      | Registration status text, e.g. `ATIVA`                                                          |
| valorCapitalSocial                | string          | yes      | Share capital in centavos (×100); `20543196049052` = R$ 205.431.960.490,52                      |
| valorCapitalSocialFormatado       | string          | yes      | Human-formatted share capital                                                                   |
| valorCapitalSocialExtenso         | string          | no       | Share capital spelled out in Portuguese                                                         |
| dataEmissaoConsulta               | string          | yes      | Consultation date, `dd/mm/yyyy`                                                                 |
| horaEmissaoConsulta               | string          | yes      | Consultation time                                                                              |
| houveErroNoServicoDispensa        | bool            | yes      | Whether the dispensation sub-service errored                                                    |
| njPermiteQsa                      | bool            | yes      | Whether the legal nature allows a QSA (partner/board listing)                                   |

### CNAE object (`cnaePrincipal` and each entry of `cnaesSecundarias`)

| Field        | Type           | Required | Notes                                                  |
| ------------ | -------------- | -------- | ------------------------------------------------------ |
| cnaeFormatada| string         | yes      | Formatted CNAE code + description                      |
| codigo       | string         | yes      | 7-digit CNAE code                                      |
| isDispensada | null           | no       | Reserved; `null` in observed runs                      |
| nome         | string         | yes      | Activity description                                   |

## Notes on the captured fixture

- **Real capture, not fabricated.** `api/results/cnpj.json` is the verbatim Petrobras record. No huge/binary fields are present, so **nothing was trimmed** — every field above is shown in the fixture.
- **Text encoding quirk (real).** Accented Portuguese arrives **double-encoded** from the upstream Receita Federal service: each UTF-8 byte is rendered as a Latin-1 character. So `Extração` appears as `ExtraÃ§Ã£o`, `gás` as `gÃ¡s`, `UNIÃO` as `UNIÃO`, etc. This is preserved as-is in the fixture (do not "fix" the data; capture what the actor returns). To recover clean accents, re-encode each string as Latin-1 and decode as UTF-8 — e.g. in Python `s.encode("latin-1").decode("utf-8")`, in Node `Buffer.from(s, "latin1").toString("utf8")`.
- **Privacy masking (real).** A few fields come back masked as `********` (e.g. `complemento`, `nomeSituacaoEspecial`, `dataSituacaoEspecial`) when the federal service withholds them.
