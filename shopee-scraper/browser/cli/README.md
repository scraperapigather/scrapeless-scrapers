# Shopee — CLI surface

Scrape Shopee product and search pages from the command line with the
[`scrapeless-scraping-browser`](https://www.npmjs.com/package/scrapeless-scraping-browser)
CLI. One Scrapeless cloud session drives a real browser; each page is extracted in-browser with the
CLI's `eval` subcommand. Output matches the `nodejs/` and `python/` surfaces — see
[`../../DATA_MODEL.md`](../../DATA_MODEL.md).

## 1. Install

```bash
npm install -g scrapeless-scraping-browser
```

`node` is also required — the steps below use it to pull values out of the CLI's JSON envelope
(`jq` works too, if preferred).

## 2. Set your API key

```bash
export SCRAPELESS_API_KEY=sk_...      # sign up at https://app.scrapeless.com
```

## 3. Scrape your first page

Every scrape is the same four moves: open a session, navigate, wait for a stable marker, run an
in-page extractor. Start with a product (PDP) page.

```bash
# open a cloud browser session — returns a task id in data.taskId
scrapeless-scraping-browser new-session --name shopee-cli --ttl 300 --proxy-country TH --json
#   -> {"data":{"taskId":"<SID>"}}

SID=<SID>   # paste the taskId from above

# navigate, then wait for the page body to render
scrapeless-scraping-browser --session-id "$SID" open "https://shopee.co.th/iPhone-Case-i.1195212398.22815998840"
scrapeless-scraping-browser --session-id "$SID" wait "body"

# run the in-page extractor — its JSON comes back in data.result
# save the product extractor (a single expression returning a JSON string)
cat > product.js <<'JS'
// In-page extractor for a Shopee product detail (PDP) page.
// Returns a JSON string — a single Product (see ../../../DATA_MODEL.md).
// The nodejs/ surface captures the pdp get_pn XHR live; the CLI can't hook
// network responses, so this reads the inline __INITIAL_STATE__ / __NEXT_DATA__
// blob Shopee hydrates the PDP from. Best-effort: if the page only exposes the
// XHR path, use the nodejs/ or python/ surface instead.
JSON.stringify(
  (function () {
    const url = location.href.split("?")[0];

    const idFromUrl = (u) => {
      if (!u) return "";
      const m = u.match(/i\.(\d+)\.(\d+)/);
      if (m) return m[2];
      return "";
    };
    const abs = (u) => {
      if (!u) return null;
      if (u.startsWith("//")) return "https:" + u;
      if (u.startsWith("http")) return u;
      return "https://shopee.co.th" + (u.startsWith("/") ? u : "/" + u);
    };
    const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));
    const imgUrl = (id) => {
      if (!id) return null;
      if (id.startsWith("http")) return id;
      return "https://down-th.img.susercontent.com/file/" + id;
    };
    const price = (v) => {
      if (v === null || v === undefined) return null;
      const n = Number(v) / 100000;
      if (!Number.isFinite(n) || n <= 0) return null;
      return "฿" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    const toFloat = (text) => {
      if (text === null || text === undefined) return null;
      if (typeof text === "number")
        return Number.isFinite(text) ? text : null;
      const m = String(text).replace(/[^0-9.]/g, "");
      if (!m) return null;
      const n = parseFloat(m);
      return Number.isNaN(n) ? null : n;
    };
    const toInt = (text) => {
      if (text === null || text === undefined) return null;
      if (typeof text === "number")
        return Number.isFinite(text) ? Math.trunc(text) : null;
      const m = String(text).replace(/[^0-9]/g, "");
      if (!m) return null;
      const n = parseInt(m, 10);
      return Number.isNaN(n) ? null : n;
    };

    // Locate the pdp data: scan a couple of known inline blobs for `item`.
    let data = null;
    const candidates = [
      window.__INITIAL_STATE__,
      window.__NEXT_DATA__ && window.__NEXT_DATA__.props,
      window.__STORE__,
      window.pdpData,
    ];
    for (const c of candidates) {
      if (c && typeof c === "object") {
        if (c.item) {
          data = c;
          break;
        }
        for (const v of Object.values(c)) {
          if (v && typeof v === "object" && v.item) {
            data = v;
            break;
          }
        }
        if (data) break;
      }
    }
    if (!data) {
      return {
        id: String(idFromUrl(url) || ""),
        url,
        title: "",
        brand: null,
        price: null,
        originalPrice: null,
        discount: null,
        currency: null,
        rating: null,
        reviews: null,
        images: [],
        seller: null,
        sellerUrl: null,
        availability: null,
        description: null,
        categories: [],
      };
    }

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
      const u = imgUrl(iid);
      if (u) imgs.push(u);
    }
    const images = uniq(imgs);

    const categories = (breadcrumb || [])
      .map((b) => b && (b.display_name || b.name))
      .filter(Boolean);

    const ratingSummary = item.item_rating || {};
    let reviewsVal = null;
    const rt = ratingSummary.rating_count;
    if (Array.isArray(rt) && rt.length) reviewsVal = rt[0];
    else if (typeof rt === "number") reviewsVal = rt;

    let availability = null;
    if (typeof item.stock === "number")
      availability = item.stock > 0 ? "In Stock" : "Out of Stock";

    const shopId = item.shopid || shop.shopid;

    return {
      id: String(idFromUrl(url) || item.itemid || ""),
      url,
      title: item.title || item.name || "",
      brand: (item.brand && (item.brand.name || item.brand)) || null,
      price: price(single),
      originalPrice: price(before),
      discount: typeof rebate === "number" && rebate ? "-" + rebate + "%" : null,
      currency: productPrice.currency || item.currency || null,
      rating: toFloat(ratingSummary.rating_star),
      reviews: toInt(reviewsVal),
      images,
      seller: shop.name || (shop.account && shop.account.username) || null,
      sellerUrl: shopId ? abs("/shop/" + shopId) : null,
      availability,
      description: item.description || null,
      categories,
    };
  })()
)
JS

scrapeless-scraping-browser --session-id "$SID" eval "$(cat product.js)" --json

# release the session when done
scrapeless-scraping-browser --session-id "$SID" close
```

`data.result` is a `Product` object — `product.js` reads the inline `__INITIAL_STATE__`
blob the PDP hydrates from:

```json
{
  "id": "22815998840",
  "url": "https://shopee.co.th/iPhone-Case-i.1195212398.22815998840",
  "title": "เคส iPhone 17 Pro Max MagSafe กันกระแทก ของแท้",
  "brand": "Apple",
  "price": "฿590.00",
  "originalPrice": "฿1,190.00",
  "discount": "-50%",
  "rating": 4.9,
  "reviews": 1284,
  "images": ["https://down-th.img.susercontent.com/file/sg-11134201-7rbk2-lp9c1d2e3f4g5h"],
  "seller": "Apple Flagship Store TH"
}
```

## 4. Scrape a search page

Reuse the same session — just `open` a search URL and wait for the product cards.

```bash
scrapeless-scraping-browser --session-id "$SID" open "https://shopee.co.th/search?keyword=iphone%20case"
scrapeless-scraping-browser --session-id "$SID" wait "li[data-sqe=item], div[data-sqe=item]"
# save the search extractor (a single expression returning a JSON string)
cat > search.js <<'JS'
// In-page extractor for a Shopee search results page.
// Returns a JSON string — a list of SearchResult (see ../../../DATA_MODEL.md).
JSON.stringify(
  (function () {
    const idFromUrl = (url) => {
      if (!url) return "";
      const m = url.match(/i\.(\d+)\.(\d+)/);
      if (m) return m[2];
      return "";
    };
    const toFloat = (text) => {
      if (text === null || text === undefined) return null;
      if (typeof text === "number")
        return Number.isFinite(text) ? text : null;
      const m = String(text).replace(/[^0-9.]/g, "");
      if (!m) return null;
      const n = parseFloat(m);
      return Number.isNaN(n) ? null : n;
    };
    const toInt = (text) => {
      if (text === null || text === undefined) return null;
      if (typeof text === "number")
        return Number.isFinite(text) ? Math.trunc(text) : null;
      const m = String(text).replace(/[^0-9]/g, "");
      if (!m) return null;
      const n = parseInt(m, 10);
      return Number.isNaN(n) ? null : n;
    };
    const text$ = (n) =>
      (n?.textContent || "").replace(/\s+/g, " ").trim() || null;

    const out = [];
    const seen = new Set();
    const cardSelectors = [
      "li[data-sqe='item']",
      "div[data-sqe='item']",
      "div[class*='shopee-search-item-result__item']",
      "div[class*='col-xs-2-4']",
    ];
    for (const sel of cardSelectors) {
      document.querySelectorAll(sel).forEach((card) => {
        const a = card.querySelector("a[href*='i.']");
        let href = a?.getAttribute("href") || "";
        if (href.startsWith("//")) href = "https:" + href;
        if (href.startsWith("/")) href = "https://shopee.co.th" + href;
        if (!href) return;
        const id = idFromUrl(href);
        if (!id || seen.has(id)) return;
        seen.add(id);

        const title =
          text$(
            card.querySelector(
              "[class*='line-clamp'], [class*='name'], div[class*='_10Wbs-']"
            )
          ) ||
          a?.getAttribute("title") ||
          text$(a) ||
          "";

        const imgEl = card.querySelector("img");
        const image =
          imgEl?.getAttribute("src") ||
          imgEl?.getAttribute("data-src") ||
          null;
        const price =
          text$(card.querySelector("[class*='price'], span[class*='ZEgDH9']")) ||
          null;
        const originalPrice =
          text$(
            card.querySelector("[class*='origin'], [class*='line-through']")
          ) || null;
        const discount =
          text$(
            card.querySelector("[class*='discount'], [class*='percent']")
          ) || null;
        const ratingEl = card.querySelector(
          "[class*='shopee-rating-stars__lit'], [class*='rating']"
        );
        let rating = toFloat(
          ratingEl?.getAttribute("style") || text$(ratingEl)
        );
        if (rating !== null && rating > 5) rating = rating / 20;
        if (rating !== null && rating > 5) rating = null;
        const reviews = toInt(
          text$(
            card.querySelector("[class*='sold'], [class*='review']")
          )
        );
        const location =
          text$(
            card.querySelector("[class*='location'], [class*='ZkPYTL']")
          ) || null;

        out.push({
          id,
          title,
          url: href,
          image:
            image && image.startsWith("//") ? "https:" + image : image,
          price,
          originalPrice,
          discount,
          rating,
          reviews,
          location,
        });
      });
    }
    return out;
  })()
)
JS

scrapeless-scraping-browser --session-id "$SID" eval "$(cat search.js)" --json
```

`data.result` is a list of `SearchResult`:

```json
[
  {
    "id": "22815998840",
    "title": "เคส iPhone 17 Pro Max MagSafe กันกระแทก ของแท้",
    "url": "https://shopee.co.th/iPhone-Case-i.1195212398.22815998840",
    "image": "https://down-th.img.susercontent.com/file/sg-11134201-7rbk2-lp9c1d2e3f4g5h_tn",
    "price": "฿590.00",
    "discount": "-50%",
    "rating": 4.9,
    "reviews": 1284,
    "location": "Bangkok"
  }
]
```

## 5. Output shape

Each `eval/*.js` file is a single expression that returns a JSON string, kept in lockstep with the
parsers in [`../nodejs/shopee.mjs`](../nodejs/shopee.mjs):

| Extractor | Returns |
| --- | --- |
| `product.js` | one `Product` |
| `search.js` | list of `SearchResult` |

Full field tables — types, which are required, where each comes from — are in
[`../../DATA_MODEL.md`](../../DATA_MODEL.md). Sample payloads are in
[`results/`](results/).
