"""EastMoney concept board data scraper.

Fetches hot concept boards and their constituent stocks from EastMoney's public API.
"""

import asyncio
from typing import Any

import httpx
import httpcore

from config import HOT_TOPICS_COUNT


BASE_URL = "https://push2.eastmoney.com/api/qt/clist/get"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    ),
    "Referer": "https://quote.eastmoney.com/",
}

MAX_RETRIES = 3


async def _get_with_retry(client: httpx.AsyncClient, url: str, **kwargs) -> httpx.Response:
    """HTTP GET with retry on connection errors."""
    last_err = None
    for attempt in range(MAX_RETRIES):
        try:
            return await client.get(url, **kwargs)
        except (httpx.ConnectError, httpx.RemoteProtocolError, httpcore.ConnectError) as e:
            last_err = e
            if attempt < MAX_RETRIES - 1:
                wait = 2 ** attempt
                print(f"[Scraper] Retry {attempt+1}/{MAX_RETRIES} after {wait}s: {e}")
                await asyncio.sleep(wait)
    raise last_err


async def fetch_hot_concepts(
    client: httpx.AsyncClient, count: int | None = None
) -> list[dict[str, Any]]:
    """Fetch top concept boards ranked by price change percentage."""
    count = count or HOT_TOPICS_COUNT

    params = {
        "pn": "1",
        "pz": str(count),
        "po": "1",
        "np": "1",
        "ut": "bd1d9ddb04089700cf9c27f6f7426281",
        "fltt": "2",
        "invt": "2",
        "fid": "f3",
        "fs": "m:90+t:3",
        "fields": "f2,f3,f4,f12,f14,f104,f105,f128,f140,f136",
        "_": "1620000000000",
    }

    resp = await _get_with_retry(client, BASE_URL, params=params, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    if not data.get("data") or not data["data"].get("diff"):
        return []

    concepts = []
    for item in data["data"]["diff"]:
        concepts.append({
            "name": item.get("f14", ""),
            "code": item.get("f12", ""),
            "up_down_pct": item.get("f3"),
            "leading_stock": item.get("f128", ""),
            "leading_stock_code": item.get("f140", ""),
            "rise_count": item.get("f104", 0),
            "fall_count": item.get("f105", 0),
            "market_cap": item.get("f136", 0),
        })

    return concepts


async def fetch_concept_stocks(
    client: httpx.AsyncClient, concept_code: str
) -> list[dict[str, Any]]:
    """Fetch constituent stocks for a given concept board."""
    params = {
        "pn": "1",
        "pz": "50",
        "po": "0",
        "np": "1",
        "ut": "bd1d9ddb04089700cf9c27f6f7426281",
        "fltt": "2",
        "invt": "2",
        "fid": "f3",
        "fs": f"b:{concept_code}+f:!50",
        "fields": "f2,f3,f12,f14,f20,f21,f115",
        "_": "1620000000000",
    }

    resp = await _get_with_retry(client, BASE_URL, params=params, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    if not data.get("data") or not data["data"].get("diff"):
        return []

    stocks = []
    for item in data["data"]["diff"]:
        stocks.append({
            "code": item.get("f12", ""),
            "name": item.get("f14", ""),
            "up_down_pct": item.get("f3"),
            "market_cap": item.get("f20"),
            "pe_ratio": item.get("f115"),
        })

    return stocks


async def scrape_all(client: httpx.AsyncClient | None = None) -> list[dict[str, Any]]:
    """Scrape hot concepts and their constituent stocks.
    Tries with system proxy first, falls back to direct connection.

    Returns:
        List of concepts, each with a 'stocks' key.
    """
    if client is None:
        # Try with system proxy first
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                return await _do_scrape(client)
        except (httpx.ConnectError, httpx.RemoteProtocolError, httpcore.ConnectError) as e:
            print(f"[Scraper] Proxy failed ({e}), trying direct...")
            async with httpx.AsyncClient(trust_env=False, timeout=30) as client:
                return await _do_scrape(client)
    else:
        return await _do_scrape(client)


async def _do_scrape(client: httpx.AsyncClient) -> list[dict[str, Any]]:
    concepts = await fetch_hot_concepts(client)

    async def fetch_stocks_for_concept(rank: int, concept: dict) -> dict:
        stocks = await fetch_concept_stocks(client, concept["code"])
        concept["heat_rank"] = rank
        concept["stocks"] = stocks
        return concept

    tasks = [
        fetch_stocks_for_concept(i + 1, c) for i, c in enumerate(concepts)
    ]
    results = await asyncio.gather(*tasks)
    return list(results)
