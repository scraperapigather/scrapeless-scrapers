# Amazon data model

Four object kinds are emitted:

- `search.json` → list of `SearchResult` (Amazon `ProductPreview`)
- `product.json` → list of `Product` (one per variant ASIN)
- `reviews.json` → list of `Review`
- `rufus.json` → list of `RufusAnswer` (one per question asked)

## SearchResult

| Field        | Type    | Required | Notes                                              |
| ------------ | ------- | -------- | -------------------------------------------------- |
| url          | string  | yes      | Canonical product URL (strip `?…` query)           |
| title        | string  | yes      | From `<h2 aria-label>` on the result card          |
| price        | string  | no       | Discounted / display price text e.g. `"$29.99"`    |
| real_price   | string  | no       | List / strikethrough price text                    |
| rating       | number  | no       | Float, e.g. `4.5`                                  |
| rating_count | number  | no       | Integer count of ratings                           |

## Product

| Field        | Type    | Required | Notes                                                                |
| ------------ | ------- | -------- | -------------------------------------------------------------------- |
| name         | string  | yes      | `#productTitle`                                                      |
| asin         | string  | yes      | `input[name=ASIN]`                                                   |
| style        | string  | no       | Selected variant dimension text                                      |
| description  | string  | no       | `#productDescription`                                                |
| stars        | string  | no       | `i[data-hook=average-star-rating]` text                              |
| rating_count | string  | no       | `span[data-hook=total-review-count]` text                            |
| features     | array   | yes      | Bullet list from `#feature-bullets li`                               |
| images       | array   | yes      | Large image URLs from `colorImages` / `imageGalleryData` JS state    |
| info_table   | object  | yes      | Key/value map from `#productDetails_detailBullets_sections1`         |

## Review

| Field              | Type    | Required | Notes                                            |
| ------------------ | ------- | -------- | ------------------------------------------------ |
| title              | string  | no       | `[data-hook=review-title]`                       |
| text               | string  | no       | `[data-hook=review-collapsed]`                   |
| location_and_date  | string  | no       | `[data-hook=review-date]`                        |
| verified           | boolean | yes      | True iff `[data-hook=avp-badge]` present         |
| rating             | number  | no       | Float parsed from `[data-hook=review-star-rating]` |

## RufusAnswer

Returned by `scrape_rufus(url, question)` — one element per question asked to Rufus, Amazon's AI shopping assistant. Rufus is opened on a product page; the question is typed and sent, and the streamed reply is parsed. **Preview:** Rufus is a gated feature requiring an eligible signed-in session, so the committed `rufus.json` is a schema-valid sample pending live verification.

| Field        | Type    | Required | Notes                                                                  |
| ------------ | ------- | -------- | ---------------------------------------------------------------------- |
| question     | string  | yes      | The question put to Rufus, echoed back verbatim                        |
| answer_text  | string  | yes      | Rufus's reply text from the assistant message bubble                   |
| product_refs | array   | yes      | List of `ProductRef` for products Rufus links in the answer            |

## ProductRef

Sub-object inside `RufusAnswer.product_refs` — one per `/dp/` link Rufus cites.

| Field | Type   | Required | Notes                                          |
| ----- | ------ | -------- | ---------------------------------------------- |
| asin  | string | yes      | 10-char ASIN parsed from the `/dp/<ASIN>` path |
| title | string | yes      | Anchor text of the cited product link          |
| url   | string | yes      | Canonical product URL (strip `?…` query)       |
