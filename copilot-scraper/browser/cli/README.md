# Copilot — CLI surface

Scrape Copilot answers from the command line with the
[`scrapeless-scraping-browser`](https://www.npmjs.com/package/scrapeless-scraping-browser)
CLI. One Scrapeless cloud session drives a real browser; the answer is extracted in-browser
with the CLI's `eval` subcommand. Output matches the `nodejs/` and `python/` surfaces — see
[`../../DATA_MODEL.md`](../../DATA_MODEL.md).

## 1. Install

```bash
npm install -g scrapeless-scraping-browser
```

`node` is also required — the steps below use it to pull values out of the CLI's JSON envelope and
to pass the prompt into the in-page typing helper (`jq` works too, if preferred).

## 2. Set your API key

```bash
export SCRAPELESS_API_KEY=sk_...      # sign up at https://app.scrapeless.com
```

## 3. Scrape an answer

Every scrape is the same four moves: open a session, navigate, wait for a stable marker, run an
in-page extractor. Unlike Perplexity, Copilot has no `?q=` deep link — the page renders an answer
only after a prompt is typed into the composer. The `nodejs/` surface types into Copilot's
contenteditable composer and presses Enter; the CLI surface exposes only `open` / `wait` / `eval`,
so it types the prompt with an in-page `eval` helper, then reads the answer back with a second
`eval`.

```bash
# open a cloud browser session — returns a task id in data.taskId
scrapeless-scraping-browser new-session --name copilot-cli --ttl 360 --proxy-country US --json
#   -> {"data":{"taskId":"<SID>"}}

SID=<SID>   # paste the taskId from above

# open Copilot and let the composer render
scrapeless-scraping-browser --session-id "$SID" open "https://copilot.microsoft.com/"

# wait for the chat composer to appear
scrapeless-scraping-browser --session-id "$SID" wait "textarea, [contenteditable='true'], [role='textbox']"

# type the prompt into the composer and submit it
PROMPT="top 3 smartphones in 2025, compare pricing across US marketplaces"
cat > submit.js <<JS
(function () {
  var box = document.querySelector("textarea, [contenteditable='true'], [role='textbox']");
  if (!box) return "no-composer";
  box.focus();
  var prompt = $PROMPT_JSON;
  if (box.tagName === "TEXTAREA") {
    box.value = prompt;
    box.dispatchEvent(new Event("input", { bubbles: true }));
  } else {
    document.execCommand("insertText", false, prompt);
  }
  var ev = new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true });
  box.dispatchEvent(ev);
  return "submitted";
})()
JS
# inject the prompt as a JSON literal so quoting is safe
PROMPT_JSON=$(node -e 'process.stdout.write(JSON.stringify(process.argv[1]))' "$PROMPT")
sed -i "s|\$PROMPT_JSON|$PROMPT_JSON|" submit.js
scrapeless-scraping-browser --session-id "$SID" eval "$(cat submit.js)" --json

# wait for the assistant answer bubble to render
scrapeless-scraping-browser --session-id "$SID" wait "[data-content='ai-message'], [data-testid='message-text'], div[class*='prose']"

# run the in-page extractor — its JSON comes back in data.result
# save the search extractor (a single expression returning a JSON string)
cat > search.js <<JS
// In-page extractor for a Copilot answer.
// Returns a JSON string — one Search (see ../../../DATA_MODEL.md).
// Mirrors \`parseSearch\` in ../nodejs/copilot.mjs. The question is the prompt
// that was submitted (Copilot has no on-page question heading); the answer is
// the last assistant message bubble.
JSON.stringify(
  (function () {
    var PROMPT = $PROMPT_JSON;
    var domainOf = function (url) {
      try {
        var host = new URL(url).hostname || "";
        if (host.indexOf("www.") === 0) host = host.slice(4);
        return host;
      } catch (e) {
        return "";
      }
    };

    var queryText = (PROMPT || "").replace(/\s+/g, " ").trim();

    var nodes = document.querySelectorAll(
      "[data-content='ai-message'], [data-testid='message-text'], div[class*='prose']"
    );
    var answerNode = nodes[nodes.length - 1];
    var answerText = (answerNode ? answerNode.textContent : "" || "")
      .replace(/\s+/g, " ")
      .trim();

    var seen = {};
    var citations = [];
    document.querySelectorAll("a[href^='http']").forEach(function (el) {
      var href = el.getAttribute("href") || "";
      if (!href || seen[href]) return;
      if (/copilot\.microsoft\.com|bing\.com|microsoft\.com|go\.microsoft\.com|cloudflare\.com|gstatic\.com/i.test(href)) return;
      seen[href] = true;
      var title = (el.textContent || "").replace(/\s+/g, " ").trim();
      citations.push({ url: href, domain: domainOf(href), title: title });
    });

    return {
      query: queryText,
      url: location.href,
      answer_text: answerText,
      citations: citations,
    };
  })()
)
JS
sed -i "s|\$PROMPT_JSON|$PROMPT_JSON|" search.js
scrapeless-scraping-browser --session-id "$SID" eval "$(cat search.js)" --json

# release the session when done
scrapeless-scraping-browser --session-id "$SID" close
```

`data.result` is one `Search` — the question is the submitted prompt, the answer is read from the
last assistant bubble:

```json
{
  "query": "top 3 smartphones in 2025, compare pricing across US marketplaces",
  "url": "https://copilot.microsoft.com/chats/8f2a1c6d-4b90-4e21-9c3a-7d51e0b2af44",
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
`parseSearch` in [`../nodejs/copilot.mjs`](../nodejs/copilot.mjs):

| Extractor | Returns |
| --- | --- |
| `search.js` | one `Search` |

Full field tables — types, which are required, where each comes from — are in
[`../../DATA_MODEL.md`](../../DATA_MODEL.md). Sample payloads are in
[`results/`](results/).
