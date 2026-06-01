# Gemini — CLI surface

Scrape Gemini answer pages from the command line with the
[`scrapeless-scraping-browser`](https://www.npmjs.com/package/scrapeless-scraping-browser)
CLI. One Scrapeless cloud session drives a real browser; the answer page is extracted in-browser
with the CLI's `eval` subcommand. Output matches the `nodejs/` and `python/` surfaces — see
[`../../DATA_MODEL.md`](../../DATA_MODEL.md).

## Authentication

Gemini requires a signed-in Google account. Create the session against a Scrapeless profile that has
been signed into Google once (`--profile-id <id>`), so the browser opens already logged in. Without a
signed-in profile the session lands on the Google sign-in page and the extractor returns an empty
answer. See [`../../DATA_MODEL.md`](../../DATA_MODEL.md).

## 1. Install

```bash
npm install -g scrapeless-scraping-browser
```

`node` is also required — the steps below use it to pull values out of the CLI's JSON envelope and
to type the prompt (`jq` works too, if preferred).

## 2. Set your API key

```bash
export SCRAPELESS_API_KEY=sk_...      # sign up at https://app.scrapeless.com
export SCRAPELESS_PROFILE_ID=...      # profile signed into a Google account
```

## 3. Scrape an answer page

Every scrape is the same moves: open a signed-in session, navigate, type the prompt into the
rich-text editor, wait for a stable marker, run an in-page extractor. Gemini renders the answer
inline in the conversation once the prompt is submitted.

```bash
# open a cloud browser session bound to the signed-in profile — returns a task id in data.taskId
scrapeless-scraping-browser new-session --name gemini-cli --ttl 360 --proxy-country US \
  --profile-id "$SCRAPELESS_PROFILE_ID" --profile-persist --json
#   -> {"data":{"taskId":"<SID>"}}

SID=<SID>   # paste the taskId from above

# open the Gemini app (signed in via the profile)
scrapeless-scraping-browser --session-id "$SID" open "https://gemini.google.com/app"

# type the prompt into the rich-text editor and submit
PROMPT="top 3 smartphones in 2025, compare pricing across US marketplaces"
scrapeless-scraping-browser --session-id "$SID" type "div.ql-editor[contenteditable='true']" "$PROMPT"
scrapeless-scraping-browser --session-id "$SID" press Enter

# wait for the model response to render
scrapeless-scraping-browser --session-id "$SID" wait "message-content"

# run the in-page extractor — its JSON comes back in data.result
# save the search extractor (a single expression returning a JSON string)
cat > search.js <<'JS'
// In-page extractor for a Gemini answer page (`/app/...`).
// Returns a JSON string — one Search (see ../../../DATA_MODEL.md).
// Mirrors `parseSearch` in ../nodejs/gemini.mjs. The question is read from the
// latest user turn; the answer from the first model response block.
JSON.stringify(
  (function () {
    const domainOf = (url) => {
      try {
        let host = new URL(url).hostname || "";
        if (host.startsWith("www.")) host = host.slice(4);
        return host;
      } catch (e) {
        return "";
      }
    };

    // Question — rendered in the latest user turn (`user-query` / a node whose
    // class contains `query-text`).
    let queryText = (
      document.querySelector("user-query, [class*='query-text']")?.textContent ?? ""
    )
      .replace(/\s+/g, " ")
      .trim();

    // Answer — the first model response block holds the response.
    const responseNode = document.querySelector("message-content, .model-response-text");
    const answerText = (responseNode?.textContent ?? "")
      .replace(/\s+/g, " ")
      .trim();

    // Citations — every external `<a href="http...">` that isn't a
    // Google/Gemini-internal link or layout chrome. Deduped on href.
    const seen = new Set();
    const citations = [];
    document.querySelectorAll("a[href^='http']").forEach((el) => {
      const href = el.getAttribute("href") || "";
      if (!href || seen.has(href)) return;
      if (/gemini\.google\.com/.test(href)) return;
      if (/google\.com|gstatic\.com|googleusercontent\.com|youtube\.com/.test(href))
        return;
      seen.add(href);
      const title = (el.textContent ?? "").replace(/\s+/g, " ").trim();
      citations.push({
        url: href,
        domain: domainOf(href),
        title,
      });
    });

    return {
      query: queryText,
      url: location.href,
      answer_text: answerText,
      citations,
    };
  })()
)
JS

scrapeless-scraping-browser --session-id "$SID" eval "$(cat search.js)" --json

# release the session when done
scrapeless-scraping-browser --session-id "$SID" close
```

`data.result` is one `Search` — the question is read from the latest user turn:

```json
{
  "query": "top 3 smartphones in 2025, compare pricing across US marketplaces",
  "url": "https://gemini.google.com/app/8f31c0a2d4e7b915",
  "answer_text": "Here are three of the strongest smartphones in 2025: ...",
  "citations": [
    { "url": "https://www.businessinsider.com/...", "domain": "businessinsider.com", "title": "..." }
  ]
}
```

If the answer hasn't finished streaming when `eval` runs, the extractor still returns the `Search`
shape with empty `answer_text` / `citations` — rerun if you need a fully settled answer.

## 4. Output shape

`search.js` is a single expression that returns a JSON string, kept in lockstep with
`parseSearch` in [`../nodejs/gemini.mjs`](../nodejs/gemini.mjs):

| Extractor | Returns |
| --- | --- |
| `search.js` | one `Search` |

Full field tables — types, which are required, where each comes from — are in
[`../../DATA_MODEL.md`](../../DATA_MODEL.md). Sample payloads are in
[`results/`](results/).
