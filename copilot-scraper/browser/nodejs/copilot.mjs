// Copilot scraper using the official @scrapeless-ai/sdk + puppeteer-core over CDP.
//
// Microsoft Copilot renders the chat composer as a contenteditable rich-text
// box, not a `<textarea>`, and streams the assistant turn token-by-token. The
// scraper:
//   1. Warms up on the homepage to clear the consent / region gate.
//   2. Focuses the composer, types the prompt, presses Enter.
//   3. Waits for the assistant answer bubble to stop growing.
//   4. Extracts the question (the submitted prompt), the answer (the last
//      assistant message bubble), and outbound citation `<a href>` links.

import { Scrapeless } from "@scrapeless-ai/sdk";
import puppeteer from "puppeteer-core";
import * as cheerio from "cheerio";

const DEFAULT_PROXY_COUNTRY = "US";
const DEFAULT_SESSION_TTL = 360;

const COMPOSER_SELECTOR = "textarea, [contenteditable='true'], [role='textbox']";
const ANSWER_SELECTOR =
  "[data-content='ai-message'], [data-testid='message-text'], div[class*='prose']";

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

async function withSessionRetry(fn, { retries = 2, label = "copilot" } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const { browserWSEndpoint } = await client().browser.create({
      proxyCountry: DEFAULT_PROXY_COUNTRY,
      sessionTTL: DEFAULT_SESSION_TTL,
    });
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

async function warmupCopilot(page) {
  await page.goto("https://copilot.microsoft.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 8000));
}

async function submitPrompt(page, prompt) {
  await page.waitForSelector(COMPOSER_SELECTOR, { timeout: 25000 });
  await page.click(COMPOSER_SELECTOR);
  await page.keyboard.type(prompt, { delay: 30 });
  await new Promise((r) => setTimeout(r, 800));
  await page.keyboard.press("Enter");
}

async function waitForAnswer(page, { timeoutMs = 60000 } = {}) {
  // The assistant bubble streams token-by-token. Bail once the last answer
  // bubble stops growing for ~3s or after the cap.
  const start = Date.now();
  let lastLen = 0;
  let lastChange = Date.now();
  while (Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 800));
    let len = 0;
    try {
      len = await page.evaluate((sel) => {
        const nodes = document.querySelectorAll(sel);
        const el = nodes[nodes.length - 1];
        return el ? (el.innerText || "").length : 0;
      }, ANSWER_SELECTOR);
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
    await warmupCopilot(page);
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

  // Question — Copilot has no on-page question heading; the submitted prompt
  // is the source of truth.
  const queryText = (prompt || "").replace(/\s+/g, " ").trim();

  // Answer — the last assistant bubble holds the streamed response.
  const answerNodes = $(ANSWER_SELECTOR);
  const answerNode = answerNodes.length ? answerNodes.eq(answerNodes.length - 1) : null;
  const answerText = answerNode ? answerNode.text().replace(/\s+/g, " ").trim() : "";

  // Citations — every external `<a href="http...">` that isn't a
  // Microsoft-internal link or layout chrome. Deduped on href.
  const seen = new Set();
  const citations = [];
  $("a[href^='http']").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (!href || seen.has(href)) return;
    if (/copilot\.microsoft\.com|bing\.com|microsoft\.com|go\.microsoft\.com|cloudflare\.com|gstatic\.com/i.test(href)) return;
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
