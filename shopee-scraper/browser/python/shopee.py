"""Shopee scraper using the official Scrapeless Python SDK + Playwright over CDP.

Shopee hydrates PDP fields client-side from an XHR to ``/api/v4/pdp/get_pn``.
The response holds ``data.item`` (title, price fields, images, stock, rating
summary), ``data.product_price``, ``data.shop_detailed`` and a breadcrumb under
``data.product_category``. We capture that XHR live; the SSR HTML is too sparse
to rely on.
"""

from __future__ import annotations

import asyncio
import json
import os
import re
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Optional

from parsel import Selector
from playwright.async_api import Response, async_playwright
from scrapeless import Scrapeless
from scrapeless.types import ICreateBrowser

DEFAULT_PROXY_COUNTRY = "TH"
DEFAULT_SESSION_TTL = 240
DEFAULT_HOST = "https://shopee.co.th"


@dataclass
class Product:
    id: str
    url: str
    title: str
    brand: Optional[str] = None
    price: Optional[str] = None
    originalPrice: Optional[str] = None
    discount: Optional[str] = None
    currency: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    images: List[str] = field(default_factory=list)
    seller: Optional[str] = None
    sellerUrl: Optional[str] = None
    availability: Optional[str] = None
    description: Optional[str] = None
    categories: List[str] = field(default_factory=list)


@dataclass
class SearchResult:
    id: str
    title: str
    url: str
    image: Optional[str] = None
    price: Optional[str] = None
    originalPrice: Optional[str] = None
    discount: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    location: Optional[str] = None


def _client() -> Scrapeless:
    if not os.environ.get("SCRAPELESS_API_KEY") and not os.environ.get("SCRAPELESS_KEY"):
        raise RuntimeError(
            "SCRAPELESS_API_KEY env var not set. Sign up at https://app.scrapeless.com"
        )
    if not os.environ.get("SCRAPELESS_API_KEY") and os.environ.get("SCRAPELESS_KEY"):
        os.environ["SCRAPELESS_API_KEY"] = os.environ["SCRAPELESS_KEY"]
    return Scrapeless()


def _text(s: Optional[str]) -> Optional[str]:
    if not s:
        return None
    cleaned = re.sub(r"\s+", " ", s).strip()
    return cleaned or None


def _to_float(s) -> Optional[float]:
    if s is None:
        return None
    if isinstance(s, (int, float)):
        return float(s)
    m = re.sub(r"[^0-9.]", "", str(s))
    if not m:
        return None
    try:
        return float(m)
    except ValueError:
        return None


def _to_int(s) -> Optional[int]:
    if s is None:
        return None
    if isinstance(s, (int, float)):
        return int(s)
    m = re.sub(r"[^0-9]", "", str(s))
    if not m:
        return None
    try:
        return int(m)
    except ValueError:
        return None


def _abs(url: Optional[str], host: str = DEFAULT_HOST) -> Optional[str]:
    if not url:
        return None
    if url.startswith("//"):
        return "https:" + url
    if url.startswith("http"):
        return url
    return host + (url if url.startswith("/") else "/" + url)


def _id_from_url(url: Optional[str]) -> str:
    if not url:
        return ""
    m = re.search(r"i\.(\d+)\.(\d+)", url)
    if m:
        return m.group(2)
    m2 = re.search(r"-i\.(\d+)\.(\d+)", url)
    if m2:
        return m2.group(2)
    return ""


def _img(image_id: Optional[str]) -> Optional[str]:
    if not image_id:
        return None
    if image_id.startswith("http"):
        return image_id
    return f"https://down-th.img.susercontent.com/file/{image_id}"


def _price(value) -> Optional[str]:
    # Shopee encodes prices as integers scaled by 100000.
    if value is None:
        return None
    try:
        n = float(value) / 100000.0
    except (TypeError, ValueError):
        return None
    if n <= 0:
        return None
    return f"฿{n:,.2f}"


def _uniq(seq):
    out, seen = [], set()
    for x in seq:
        if not x or x in seen:
            continue
        seen.add(x)
        out.append(x)
    return out


def parse_product_from_pdp(data: Dict[str, Any], url: str) -> Product:
    item = data.get("item") or {}
    product_price = data.get("product_price") or {}
    shop = data.get("shop_detailed") or data.get("shop") or {}
    breadcrumb = data.get("product_category") or data.get("breadcrumb") or []

    price_block = product_price.get("price") or {}
    single = price_block.get("single_value")
    before = (product_price.get("before_discount") or {}).get("single_value")
    rebate = product_price.get("rebate_percentage")

    images: List[str] = []
    for iid in item.get("images") or []:
        u = _img(iid)
        if u:
            images.append(u)
    images = _uniq(images)

    brand = None
    pb = item.get("brand")
    if isinstance(pb, dict):
        brand = pb.get("name")
    elif isinstance(pb, str):
        brand = pb

    categories = [
        b.get("display_name") or b.get("name")
        for b in (breadcrumb or [])
        if isinstance(b, dict) and (b.get("display_name") or b.get("name"))
    ]

    rating_summary = item.get("item_rating") or {}
    rating_val = rating_summary.get("rating_star")
    reviews_val = None
    rt = rating_summary.get("rating_count")
    if isinstance(rt, list) and rt:
        reviews_val = rt[0]
    elif isinstance(rt, (int, float)):
        reviews_val = rt

    stock = item.get("stock")
    availability = None
    if isinstance(stock, (int, float)):
        availability = "In Stock" if stock > 0 else "Out of Stock"

    shop_id = (item.get("shopid") or shop.get("shopid"))
    seller_url = _abs(f"/shop/{shop_id}") if shop_id else None

    return Product(
        id=str(_id_from_url(url) or item.get("itemid") or ""),
        url=url,
        title=item.get("title") or item.get("name") or "",
        brand=brand,
        price=_price(single),
        originalPrice=_price(before),
        discount=(f"-{rebate}%" if isinstance(rebate, (int, float)) and rebate else None),
        currency=product_price.get("currency") or item.get("currency"),
        rating=_to_float(rating_val),
        reviews=_to_int(reviews_val),
        images=images,
        seller=shop.get("name") or shop.get("account", {}).get("username") if isinstance(shop, dict) else None,
        sellerUrl=seller_url,
        availability=availability,
        description=item.get("description"),
        categories=categories,
    )


def parse_search(html: str) -> List[SearchResult]:
    sel = Selector(text=html)
    out: List[SearchResult] = []
    seen: set[str] = set()
    cards = [
        "li[data-sqe='item']",
        "div[data-sqe='item']",
        "div[class*='shopee-search-item-result__item']",
        "div[class*='col-xs-2-4']",
    ]
    for css in cards:
        for card in sel.css(css):
            href = card.css("a[href*='-i.']::attr(href), a[href*='i.']::attr(href)").get() or ""
            if href.startswith("//"):
                href = "https:" + href
            if href.startswith("/"):
                href = DEFAULT_HOST + href
            if not href:
                continue
            item_id = _id_from_url(href)
            if not item_id or item_id in seen:
                continue
            seen.add(item_id)
            title = _text(card.css("[class*='line-clamp']::text, [class*='name']::text, div[class*='_10Wbs-']::text").get()) or card.css("a::attr(title)").get() or _text(card.css("a::text").get()) or ""
            image = card.css("img::attr(src)").get() or card.css("img::attr(data-src)").get()
            if image and image.startswith("//"):
                image = "https:" + image
            price = _text(card.css("[class*='price']::text, span[class*='ZEgDH9']::text").get())
            original_price = _text(card.css("[class*='origin']::text, [class*='line-through']::text").get())
            discount = _text(card.css("[class*='discount']::text, [class*='percent']::text").get())
            rating = _to_float(_text(card.css("[class*='rating']::text, [class*='shopee-rating-stars__lit']::attr(style)").get()))
            if rating is not None and rating > 5:
                rating = rating / 20
            if rating is not None and rating > 5:
                rating = None
            reviews = _to_int(_text(card.css("[class*='sold']::text, [class*='review']::text").get()))
            location = _text(card.css("[class*='location']::text, [class*='shopee-search-item-result__item'] [class*='ZkPYTL']::text").get())
            out.append(SearchResult(
                id=item_id,
                title=title,
                url=href,
                image=image,
                price=price,
                originalPrice=original_price,
                discount=discount,
                rating=rating,
                reviews=reviews,
                location=location,
            ))
    return out


async def scrape_product(product_url: str) -> Product:
    client = _client()
    session = client.browser.create(ICreateBrowser(proxy_country=DEFAULT_PROXY_COUNTRY, session_ttl=DEFAULT_SESSION_TTL))
    async with async_playwright() as pw:
        browser = await pw.chromium.connect_over_cdp(session.browser_ws_endpoint)
        try:
            page = await browser.new_page()
            holder: Dict[str, Any] = {"body": None}

            async def _on_response(resp: Response) -> None:
                try:
                    if holder["body"]:
                        return
                    u = resp.url.lower()
                    if "/api/v4/pdp/get_pn" not in u and "/api/v4/item/get" not in u:
                        return
                    holder["body"] = await resp.text()
                except Exception:
                    pass

            page.on("response", lambda r: asyncio.create_task(_on_response(r)))
            await page.goto(product_url, wait_until="domcontentloaded", timeout=60000)
            for _ in range(60):
                if holder["body"]:
                    break
                await page.wait_for_timeout(500)
            if not holder["body"]:
                raise RuntimeError(
                    f"shopee: detail XHR (/api/v4/pdp/get_pn) never fired for {product_url}"
                )
            env = json.loads(holder["body"])
            data = (env or {}).get("data") or {}
            if not data.get("item"):
                raise RuntimeError("shopee: detail XHR payload missing item block")
            return parse_product_from_pdp(data, product_url)
        finally:
            try:
                await browser.close()
            except Exception:
                pass


async def scrape_search(query: str, max_pages: int = 1, host: str = DEFAULT_HOST) -> List[SearchResult]:
    client = _client()
    session = client.browser.create(ICreateBrowser(proxy_country=DEFAULT_PROXY_COUNTRY, session_ttl=DEFAULT_SESSION_TTL))
    results: List[SearchResult] = []
    async with async_playwright() as pw:
        browser = await pw.chromium.connect_over_cdp(session.browser_ws_endpoint)
        try:
            page = await browser.new_page()
            for p in range(0, max_pages):
                url = f"{host}/search?keyword={query.replace(' ', '%20')}&page={p}"
                await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                try:
                    await page.wait_for_selector("li[data-sqe='item'], div[data-sqe='item']", timeout=20000)
                except Exception:
                    pass
                try:
                    await page.evaluate(
                        "() => new Promise(r => { let y = 0; const i = setInterval(() => { window.scrollBy(0, 600); y += 600; if (y >= document.body.scrollHeight) { clearInterval(i); r(); } }, 120); })"
                    )
                    await page.wait_for_timeout(1500)
                except Exception:
                    pass
                html = await page.content()
                results.extend(parse_search(html))
        finally:
            try:
                await browser.close()
            except Exception:
                pass
    return results


def to_dict(obj: Any) -> Any:
    if hasattr(obj, "__dataclass_fields__"):
        return asdict(obj)
    if isinstance(obj, list):
        return [to_dict(x) for x in obj]
    if isinstance(obj, dict):
        return {k: to_dict(v) for k, v in obj.items()}
    return obj
