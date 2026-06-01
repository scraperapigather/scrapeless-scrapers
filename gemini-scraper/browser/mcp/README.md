# Gemini — MCP surface

Scrape Gemini answer pages conversationally from any MCP-capable AI agent or client using the [Scrapeless MCP server](https://github.com/scrapeless-ai/scrapeless-mcp-server).
No code — the LLM drives a Scrapeless cloud browser through MCP tools and you ask for the fields
described in [`../../DATA_MODEL.md`](../../DATA_MODEL.md).

## Authentication

Gemini requires a signed-in Google account. Create the session against a Scrapeless profile that has
been signed into Google once (pass `profileId` with `profilePersist`), so the browser opens already
logged in. Without a signed-in profile the session lands on the Google sign-in page and the answer
comes back empty. See [`../../DATA_MODEL.md`](../../DATA_MODEL.md).

## 1. Install the scrapeless-mcp-server

Install the [`scrapeless-mcp-server`](https://github.com/scrapeless-ai/scrapeless-mcp-server) and add it from [`mcp.json`](mcp.json) to your MCP client:

```jsonc
{
  "mcpServers": {
    "scrapeless": {
      "command": "npx",
      "args": ["-y", "scrapeless-mcp-server"],
      "env": { "SCRAPELESS_KEY": "sk_..." }
    }
  }
}
```

Any MCP-capable AI agent or client works. Add the block above wherever your client stores its MCP servers. Two transports are available:

- **stdio** (shown above) — the client launches `npx -y scrapeless-mcp-server`.
- **HTTP** — agents that connect to a remote MCP URL can point at `https://api.scrapeless.com/mcp` with the header `x-api-token: sk_...`.

## 2. Set your API key

Use the key from [app.scrapeless.com](https://app.scrapeless.com) as `SCRAPELESS_KEY` in the config
above. Sign up there if you do not have one yet — new accounts include free Scraping Browser
runtime.

## 3. Scrape an answer page

Once the server is connected, ask in plain language. Open the Gemini app on a signed-in profile, type
the prompt into the rich-text editor, let it stream, then read it back:

```
Using the scrapeless tools, create a browser session with my signed-in profile
(profileId + profilePersist), open https://gemini.google.com/app, type the prompt
"top 3 smartphones in 2025, compare pricing across US marketplaces" into the
div.ql-editor[contenteditable='true'] input and press Enter, wait for the model
response (message-content) to render, and return one Search object from
../../DATA_MODEL.md: { query, url, answer_text, citations }.
```

`citations` should be the deduped outbound `<a href="http...">` links that are not Google or
Gemini-internal, each as `{ url, domain, title }`. The `query` is read from the latest user turn
(falling back to the prompt that was typed).

If the answer hasn't finished streaming, ask the model to wait a few seconds and re-read the page
before returning — otherwise `answer_text` / `citations` may come back empty.

## 4. Output shape

The MCP surface emits whatever shape you ask for. To stay aligned with the `cli/`, `nodejs/`, and
`python/` surfaces, ask for the `Search` fields documented in
[`../../DATA_MODEL.md`](../../DATA_MODEL.md). A sample payload is in [`results/`](results/).

## 5. Notes

- Tool arguments are camelCase (`sessionId`, `proxyCountry`, `profileId`); `browser_close` rejects snake_case.
- Per-call `proxyCountry` may be ignored — set the country at session creation if you need a
  specific locale for the answer.
- For repeatable, schema-validated output, use the `cli/`, `nodejs/`, or `python/` surfaces — the
  MCP surface is best for ad-hoc, conversational scraping.
