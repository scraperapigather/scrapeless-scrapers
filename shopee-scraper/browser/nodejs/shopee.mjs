// Shopee scraper using the official @scrapeless-ai/sdk + puppeteer-core over CDP.
//
// Shopee hydrates PDP fields client-side from an XHR to
//   /api/v4/pdp/get_pn
// The response holds `data.item` (title, images, stock, rating summary),
// `data.product_price`, `data.shop_detailed` and a breadcrumb under
// `data.product_category`. We capture that XHR live; the SSR HTML is too sparse
// to rely on.

import { Scrapeless } from "@scrapeless-ai/sdk";
import puppeteer from "puppeteer-core";
import * as cheerio from "cheerio";

const DEFAULT_PROXY_COUNTRY = "TH";
const DEFAULT_SESSION_TTL = 240;
const DEFAULT_HOST = "https://shopee.co.th";

function requireKey() {
  const k = process.env.SCRAPELESS_API_KEY ?? process.env.SCRAPELESS_KEY;
  if (!k) throw new Error("SCRAPELESS_API_KEY env var not set. Sign up at https://app.scrapeless.com");
  return k;
}

function client() {
  return new Scrapeless({ apiKey: requireKey() });
}

async function withBrowser(fn, { proxyCountry = DEFAULT_PROXY_COUNTRY, retries = 2, label = "navigation" } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const { browserWSEndpoint } = await client().browser.create({ proxyCountry, sessionTTL: DEFAULT_SESSION_TTL });
    let browser;
    try {
      browser = await puppeteer.connect({ browserWSEndpoint });
      return await fn(browser);
    } catch (e) {
      lastError = e;
      if (attempt === retries) break;
      await new Promise((r) => setTimeout(r, 4000 * Math.pow(1.5, attempt)));
    } finally {
      try { await browser?.close(); } catch (_) {}
    }
  }
  throw new Error(`${label}: giving up after ${retries + 1} attempts: ${lastError?.message ?? lastError}`);
}

// ---------------- helpers ----------------

function abs(url, host = DEFAULT_HOST) {
  if (!url) return null;
  if (url.startsWith("//")) return "https:" + url;
  if (url.startsWith("http")) return url;
  return host + (url.startsWith("/") ? url : "/" + url);
}

function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function idFromUrl(url) {
  if (!url) return "";
  const m = url.match(/i\.(\d+)\.(\d+)/);
  if (m) return m[2];
  return "";
}

function img(imageId) {
  if (!imageId) return null;
  if (imageId.startsWith("http")) return imageId;
  return `https://down-th.img.susercontent.com/file/${imageId}`;
}

// Shopee encodes prices as integers scaled by 100000.
function price(value) {
  if (value === null || value === undefined) return null;
  const n = Number(value) / 100000;
  if (!Number.isFinite(n) || n <= 0) return null;
  return `฿${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function toFloat(text) {
  if (text === null || text === undefined) return null;
  if (typeof text === "number") return Number.isFinite(text) ? text : null;
  const m = String(text).replace(/[^0-9.]/g, "");
  if (!m) return null;
  const n = parseFloat(m);
  return Number.isNaN(n) ? null : n;
}

function toInt(text) {
  if (text === null || text === undefined) return null;
  if (typeof text === "number") return Number.isFinite(text) ? Math.trunc(text) : null;
  const m = String(text).replace(/[^0-9]/g, "");
  if (!m) return null;
  const n = parseInt(m, 10);
  return Number.isNaN(n) ? null : n;
}

// ---------------- parsers ----------------

// Build a `Product` dict from the pdp `data` blob.
export function parseProductFromPdp(data, url) {
  const item = data.item || {};
  const productPrice = data.product_price || {};
  const shop = data.shop_detailed || data.shop || {};
  const breadcrumb = data.product_category || data.breadcrumb || [];

  const priceBlock = productPrice.price || {};
  const single = priceBlock.single_value;
  const before = (productPrice.before_discount || {}).single_value;
  const rebate = productPrice.rebate_percentage;

  const imgs = [];
  for (const iid of item.images || []) {
    const u = img(iid);
    if (u) imgs.push(u);
  }
  const images = uniq(imgs);

  const categories = (breadcrumb || [])
    .map((b) => b?.display_name || b?.name)
    .filter(Boolean);

  const ratingSummary = item.item_rating || {};
  const ratingVal = ratingSummary.rating_star;
  let reviewsVal = null;
  const rt = ratingSummary.rating_count;
  if (Array.isArray(rt) && rt.length) reviewsVal = rt[0];
  else if (typeof rt === "number") reviewsVal = rt;

  let availability = null;
  if (typeof item.stock === "number") availability = item.stock > 0 ? "In Stock" : "Out of Stock";

  const shopId = item.shopid || shop.shopid;

  return {
    id: String(idFromUrl(url) || item.itemid || ""),
    url,
    title: item.title || item.name || "",
    brand: (item.brand && (item.brand.name || item.brand)) || null,
    price: price(single),
    originalPrice: price(before),
    discount: typeof rebate === "number" && rebate ? `-${rebate}%` : null,
    currency: productPrice.currency || item.currency || null,
    rating: toFloat(ratingVal),
    reviews: toInt(reviewsVal),
    images,
    seller: shop.name || shop.account?.username || null,
    sellerUrl: shopId ? abs(`/shop/${shopId}`) : null,
    availability,
    description: item.description || null,
    categories,
  };
}

export function parseSearch(html) {
  const $ = cheerio.load(html);
  const out = [];
  const seen = new Set();

  const cards = [
    "li[data-sqe='item']",
    "div[data-sqe='item']",
    "div[class*='shopee-search-item-result__item']",
    "div[class*='col-xs-2-4']",
  ];
  for (const sel of cards) {
    $(sel).each((_, el) => {
      const card = $(el);
      const a = card.find("a[href*='i.']").first();
      let href = a.attr("href") || "";
      if (href.startsWith("//")) href = "https:" + href;
      if (href.startsWith("/")) href = DEFAULT_HOST + href;
      if (!href) return;
      const id = idFromUrl(href);
      if (!id || seen.has(id)) return;
      seen.add(id);

      const text$ = (n) => (n?.text?.() || "").replace(/\s+/g, " ").trim() || null;
      const title =
        text$(card.find("[class*='line-clamp'], [class*='name'], div[class*='_10Wbs-']").first()) ||
        a.attr("title") ||
        text$(a) ||
        "";

      const image =
        card.find("img").first().attr("src") ||
        card.find("img").first().attr("data-src") ||
        null;
      const priceText = text$(card.find("[class*='price'], span[class*='ZEgDH9']").first()) || null;
      const originalPrice = text$(card.find("[class*='origin'], [class*='line-through']").first()) || null;
      const discount = text$(card.find("[class*='discount'], [class*='percent']").first()) || null;
      let rating = toFloat(
        card.find("[class*='shopee-rating-stars__lit']").first().attr("style") ||
          text$(card.find("[class*='rating']").first()),
      );
      if (rating !== null && rating > 5) rating = rating / 20;
      if (rating !== null && rating > 5) rating = null;
      const reviews = toInt(text$(card.find("[class*='sold'], [class*='review']").first()));
      const location = text$(card.find("[class*='location'], [class*='ZkPYTL']").first()) || null;

      out.push({
        id,
        title,
        url: href,
        image: image && image.startsWith("//") ? "https:" + image : image,
        price: priceText,
        originalPrice,
        discount,
        rating,
        reviews,
        location,
      });
    });
  }
  return out;
}

// ---------------- scrape functions ----------------

export async function scrapeProduct(productUrl) {
  return withBrowser(async (browser) => {
    const page = await browser.newPage();
    const bodies = [];
    page.on("response", async (resp) => {
      try {
        const u = resp.url().toLowerCase();
        if (!u.includes("/api/v4/pdp/get_pn") && !u.includes("/api/v4/item/get")) return;
        const txt = await resp.text();
        if (txt) bodies.push(txt);
      } catch (_) {}
    });
    await page.goto(productUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    // The detail page makes 1–2 pdp calls during boot. Wait for one carrying
    // `item`, with up to 35s budget.
    const deadline = Date.now() + 35000;
    let data = null;
    while (Date.now() < deadline) {
      for (const body of bodies) {
        try {
          const env = JSON.parse(body);
          const d = env?.data || null;
          if (d && d.item) { data = d; break; }
        } catch (_) {}
      }
      if (data) break;
      await new Promise((r) => setTimeout(r, 500));
    }
    if (!data) {
      throw new Error(`shopee: detail XHR (/api/v4/pdp/get_pn) never returned an item block for ${productUrl}`);
    }
    return parseProductFromPdp(data, productUrl);
  }, { label: "scrape_product" });
}

export async function scrapeSearch(query, maxPages = 1, host = DEFAULT_HOST) {
  return withBrowser(async (browser) => {
    const page = await browser.newPage();
    const out = [];
    for (let p = 0; p < maxPages; p++) {
      const url = `${host}/search?keyword=${encodeURIComponent(query)}&page=${p}`;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      try { await page.waitForSelector("li[data-sqe='item'], div[data-sqe='item']", { timeout: 20000 }); } catch (_) {}
      try {
        await page.evaluate(async () => {
          await new Promise((r) => {
            let y = 0;
            const i = setInterval(() => {
              window.scrollBy(0, 600);
              y += 600;
              if (y >= document.body.scrollHeight) { clearInterval(i); r(); }
            }, 120);
          });
        });
      } catch (_) {}
      await new Promise((r) => setTimeout(r, 1500));
      const html = await page.content();
      out.push(...parseSearch(html));
    }
    return out;
  }, { label: "scrape_search" });
}
