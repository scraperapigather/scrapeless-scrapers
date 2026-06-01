// Gemini scraper using the official @scrapeless-ai/sdk + puppeteer-core over CDP.
//
// Gemini's web app requires a signed-in Google account and renders the
// input as a rich-text contenteditable, not a `<textarea>`. The scraper:
//   1. Creates the session with a Scrapeless profile (SCRAPELESS_PROFILE_ID)
//      that already carries the Google login cookies, so Gemini opens signed in.
//   2. Navigates to the Gemini app and focuses the contenteditable input.
//   3. Types the prompt, presses Enter, and waits for the answer to render.
//   4. Extracts the question (latest user turn), the answer (latest model
//      response block), and outbound citation `<a href>` links.
//
// The selectors below are illustrative — Gemini's authenticated DOM is not
// publicly inspectable, so they target the rich-text editor and the model
// response container by role/class and are refined against a live run.

import { Scrapeless } from "@scrapeless-ai/sdk";
import puppeteer from "puppeteer-core";
import * as cheerio from "cheerio";

const DEFAULT_PROXY_COUNTRY = "US";
const DEFAULT_SESSION_TTL = 360;

const TRANSIENT_NET_ERRORS = [
  "ERR_TUNNEL_CONNECTION_FAILED",
  "ERR_CONNECTION_CLOSED",
  "ERR_CONNECTION_RESET",
  "ERR_CONNECTION_REFUSED",
  "ERR_TIMED_OUT",
  "ERR_NETWORK_CHANGED",
  "ERR_EMPTY_RESPONSE",
  "ERR_PROXY_CONNECTION_FAILED",
  "Navigation timeout",
  "net::",
];

function isTransientError(err) {
  const msg = String(err?.message ?? err ?? "");
  return TRANSIENT_NET_ERRORS.some((s) => msg.includes(s));
}

function requireKey() {
  const k = process.env.SCRAPELESS_API_KEY ?? process.env.SCRAPELESS_KEY;
  if (!k) throw new Error("SCRAPELESS_API_KEY env var not set. Sign up at https://app.scrapeless.com");
  return k;
}

function client() {
  return new Scrapeless({ apiKey: requireKey() });
}

// Reuse a signed-in Google account via a Scrapeless profile. Gemini gates its
// app behind a Google login. SCRAPELESS_PROFILE_ID must point at a profile that
// has been signed in once; `profilePersist` saves and refreshes the login state
// across runs.
function createBrowserOptions() {
  const opts = {
    proxyCountry: DEFAULT_PROXY_COUNTRY,
    sessionTTL: DEFAULT_SESSION_TTL,
  };
  const profileId = process.env.SCRAPELESS_PROFILE_ID;
  if (profileId) {
    opts.profileId = profileId;
    opts.profilePersist = true;
  }
  return opts;
}

async function withSessionRetry(fn, { retries = 2, label = "gemini" } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const { browserWSEndpoint } = await client().browser.create(createBrowserOptions());
    let browser;
    try {
      browser = await puppeteer.connect({ browserWSEndpoint });
      const page = await browser.newPage();
      await page.setViewport({ width: 1366, height: 900 });
      return await fn(page, browser);
    } catch (e) {
      lastError = e;
      if (!isTransientError(e) && attempt > 0) throw e;
    } finally {
      try { await browser?.close(); } catch (_) {}
    }
    if (attempt < retries) await new Promise((r) => setTimeout(r, 4000 + attempt * 3000));
  }
  throw new Error(`${label}: giving up after ${retries + 1} attempts: ${lastError?.message ?? lastError}`);
}

async function warmupGemini(page) {
  await page.goto("https://gemini.google.com/app", { waitUntil: "domcontentloaded", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 8000));
}

async function submitPrompt(page, prompt) {
  await page.waitForSelector(
    "div.ql-editor[contenteditable='true'], [role='textbox'], [contenteditable='true']",
    { timeout: 25000 },
  );
  await page.click("div.ql-editor[contenteditable='true'], [role='textbox'], [contenteditable='true']");
  await page.keyboard.type(prompt, { delay: 30 });
  await new Promise((r) => setTimeout(r, 800));
  await page.keyboard.press("Enter");
}

async function waitForAnswer(page, { timeoutMs = 60000 } = {}) {
  // 1. URL settles on `/app/<id>`.
  const urlDeadline = Date.now() + 20000;
  while (Date.now() < urlDeadline) {
    if (/\/app\/[0-9a-z]{6,}/i.test(page.url())) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  // 2. Answer prose renders. Bail once it stops growing for ~3s or after the cap.
  const start = Date.now();
  let lastLen = 0;
  let lastChange = Date.now();
  while (Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 800));
    let len = 0;
    try {
      len = await page.evaluate(() => {
        const el = document.querySelector("message-content, .model-response-text, [class*='response-content']");
        return el ? (el.innerText || "").length : 0;
      });
    } catch (_) {}
    if (len !== lastLen) {
      lastLen = len;
      lastChange = Date.now();
    } else if (lastLen > 50 && Date.now() - lastChange >= 3000) {
      return;
    }
  }
}

// ---------------- scrape functions ----------------

export async function scrapeSearch(prompt) {
  return withSessionRetry(async (page) => {
    await warmupGemini(page);
    await submitPrompt(page, prompt);
    await waitForAnswer(page);
    const html = await page.content();
    const finalUrl = page.url();
    return parseSearch(html, prompt, finalUrl);
  }, { label: "scrape_search" });
}

// ---------------- parser ----------------

export function parseSearch(html, prompt, finalUrl) {
  const $ = cheerio.load(html);

  // Question — rendered in the latest user turn (`user-query` / a node whose
  // class contains `query-text`). Fall back to the submitted prompt.
  let queryText = $("user-query, [class*='query-text']").first().text().trim();
  if (!queryText) queryText = prompt;
  queryText = queryText.replace(/\s+/g, " ").trim();

  // Answer — the first model response block (`message-content` /
  // `.model-response-text`) holds the streamed response.
  const responseNode = $("message-content, .model-response-text").first();
  const answerText = responseNode.text().replace(/\s+/g, " ").trim();

  // Citations — every external `<a href="https?://...">` that isn't a
  // Google/Gemini-internal link or layout chrome. Deduped on href.
  const seen = new Set();
  const citations = [];
  $("a[href^='http']").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (!href || seen.has(href)) return;
    if (/gemini\.google\.com/.test(href)) return;
    if (/google\.com|gstatic\.com|googleusercontent\.com|youtube\.com/.test(href)) return;
    seen.add(href);
    const title = $(el).text().replace(/\s+/g, " ").trim();
    citations.push({
      url: href,
      domain: domainOf(href),
      title,
    });
  });

  return {
    query: queryText,
    url: finalUrl,
    answer_text: answerText,
    citations,
  };
}

function domainOf(url) {
  try {
    let host = new URL(url).hostname || "";
    if (host.startsWith("www.")) host = host.slice(4);
    return host;
  } catch {
    return "";
  }
}
