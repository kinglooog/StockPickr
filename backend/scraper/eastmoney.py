"""EastMoney concept board data scraper.

Uses curl subprocess because Python HTTP libraries have SSL/proxy issues
in this environment, while curl works reliably.
"""

import asyncio
import json
import time
from typing import Any
from urllib.parse import urlencode

from config import HOT_TOPICS_COUNT, JUNK_CONCEPT_NAMES

BASE_URL = "https://push2.eastmoney.com/api/qt/clist/get"

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"

MAX_RETRIES = 3


async def _curl_get(url: str) -> dict:
    """Make HTTP GET via curl subprocess, return parsed JSON."""
    last_err = None
    for attempt in range(MAX_RETRIES):
        try:
            proc = await asyncio.create_subprocess_exec(
                "curl", "-s", "--max-time", "20",
                "-H", f"User-Agent: {UA}",
                "-H", "Referer: https://quote.eastmoney.com/",
                url,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await proc.communicate()
            if proc.returncode != 0:
                raise RuntimeError(f"curl exit {proc.returncode}: {stderr.decode()}")
            return json.loads(stdout)
        except Exception as e:
            last_err = e
            if attempt < MAX_RETRIES - 1:
                wait = 2 ** attempt
                print(f"[Scraper] Retry {attempt+1}/{MAX_RETRIES} after {wait}s: {e}")
                await asyncio.sleep(wait)
    raise last_err


async def fetch_hot_concepts(count: int | None = None) -> list[dict[str, Any]]:
    """Fetch top concept boards ranked by price change percentage."""
    count = count or HOT_TOPICS_COUNT

    params = {
        "pn": "1", "pz": str(count), "po": "1", "np": "1",
        "ut": "bd1d9ddb04089700cf9c27f6f7426281",
        "fltt": "2", "invt": "2", "fid": "f3",
        "fs": "m:90+t:3",
        "fields": "f2,f3,f4,f12,f14,f104,f105,f128,f140,f136",
        "_": str(int(time.time() * 1000)),
    }
    url = f"{BASE_URL}?{urlencode(params)}"
    data = await _curl_get(url)

    diff = data.get("data", {}).get("diff")
    if not diff:
        return []

    return [
        {
            "name": item.get("f14", ""),
            "code": item.get("f12", ""),
            "up_down_pct": item.get("f3"),
            "leading_stock": item.get("f128", ""),
            "leading_stock_code": item.get("f140", ""),
            "rise_count": item.get("f104", 0),
            "fall_count": item.get("f105", 0),
            "market_cap": item.get("f136", 0),
        }
        for item in diff
        if item.get("f14", "") not in JUNK_CONCEPT_NAMES
    ]


async def fetch_concept_stocks(concept_code: str) -> list[dict[str, Any]]:
    """Fetch constituent stocks for a given concept board."""
    params = {
        "pn": "1", "pz": "50", "po": "0", "np": "1",
        "ut": "bd1d9ddb04089700cf9c27f6f7426281",
        "fltt": "2", "invt": "2", "fid": "f3",
        "fs": f"b:{concept_code}+f:!50",
        "fields": "f2,f3,f12,f14,f20,f21,f115",
        "_": str(int(time.time() * 1000)),
    }
    url = f"{BASE_URL}?{urlencode(params)}"
    data = await _curl_get(url)

    diff = data.get("data", {}).get("diff")
    if not diff:
        return []

    return [
        {
            "code": item.get("f12", ""),
            "name": item.get("f14", ""),
            "up_down_pct": item.get("f3"),
            "market_cap": item.get("f20"),
            "pe_ratio": item.get("f115"),
        }
        for item in diff
    ]


async def scrape_all() -> list[dict[str, Any]]:
    """Scrape hot concepts and their constituent stocks."""
    concepts = await fetch_hot_concepts()

    async def fetch_one(rank: int, concept: dict) -> dict:
        stocks = await fetch_concept_stocks(concept["code"])
        concept["heat_rank"] = rank
        concept["stocks"] = stocks
        print(f"[Scraper] {concept['name']}: {len(stocks)} stocks")
        return concept

    tasks = [fetch_one(i + 1, c) for i, c in enumerate(concepts)]
    return list(await asyncio.gather(*tasks))
