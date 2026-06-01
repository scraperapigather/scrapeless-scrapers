# Copilot data model

Single source of truth for the Python (cerberus) and Node (zod) schemas under [`python/`](browser/python/) and [`nodejs/`](browser/nodejs/).

The scraper navigates to `https://copilot.microsoft.com/`, types the prompt into the chat composer, presses Enter, and waits for the assistant turn to finish streaming. The question is the prompt that was submitted; the answer is the text of the last assistant message bubble; citations are deduped outbound links rendered inside that answer.

## Search — emitted by `scrape_search`

| Field         | Type     | Required | Notes                                                                  |
| ------------- | -------- | -------- | ---------------------------------------------------------------------- |
| query         | string   | yes      | Original prompt submitted to Copilot                                   |
| url           | string   | yes      | Copilot conversation URL after the turn settles                       |
| answer_text   | string   | yes      | Plain-text concatenation of the assistant answer                       |
| citations     | object[] | yes      | Deduped outbound citations: `{ url, domain, title }`                   |

## Copilot-specific UI handling

- **Composer is not a `<textarea>`.** Copilot renders the chat input as a `[contenteditable='true']` rich-text box. The scraper focuses `textarea, [contenteditable='true'], [role='textbox']` (the first match wins across layout revisions), types the prompt, then presses Enter.
- **No stable conversation URL.** Unlike Perplexity's `/search/<uuid>`, Copilot keeps the user on `copilot.microsoft.com/` (or a `/chats/<id>` route once the turn is persisted). The scraper records `page.url` as-is rather than waiting for a URL pattern.
- **Streaming completion is detected by stability, not a URL change.** The answer bubble grows token-by-token; the scraper polls the last assistant message length and returns once it stops growing for a few seconds.
- **Answer anchor.** The assistant turn renders inside `[data-content='ai-message']` / `[data-testid='message-text']` bubbles; the scraper reads the last such bubble. A `.prose`-style container is used as a fallback when the data attributes change.
- **Citations.** Copilot renders sources as outbound `<a href="http...">` chips. Microsoft-internal links (`copilot.microsoft.com`, `bing.com`, `microsoft.com`, `go.microsoft.com`) and layout chrome are filtered out; the remainder are deduped on href.
- **Cookie / consent gate.** A first-visit consent or region dialog can cover the composer; the scraper warms up on the homepage before typing so the gate clears.
