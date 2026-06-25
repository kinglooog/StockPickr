"""Application configuration."""

import os
from pathlib import Path

from dotenv import load_dotenv

# Project root
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file
load_dotenv(BASE_DIR / ".env")

# Database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite+aiosqlite:///{BASE_DIR / 'stockpickr.db'}",
)

# DeepSeek API — set via environment or .env file
DEEPSEEK_API_KEY = os.getenv("STOCKPICKR_DEEPSEEK_KEY", "")
DEEPSEEK_BASE_URL = os.getenv(
    "STOCKPICKR_DEEPSEEK_BASE_URL",
    "https://api.deepseek.com",
)

# Scheduler
SCHEDULE_HOUR = int(os.getenv("SCHEDULE_HOUR", "16"))  # Default: 4pm after market close
SCHEDULE_MINUTE = int(os.getenv("SCHEDULE_MINUTE", "0"))

# Scraper
HOT_TOPICS_COUNT = int(os.getenv("HOT_TOPICS_COUNT", "20"))
LLM_CONCURRENCY = int(os.getenv("LLM_CONCURRENCY", "5"))

# Non-industry concept keywords to filter out
# Concepts matching any of these are market stats / style tags, not real themes
JUNK_PATTERNS = [
    "昨日", "涨停", "跌停", "连板", "首板", "打板", "触板",
    "新高", "新低", "走强", "走弱", "较弱", "较强",
    "微盘", "大盘", "中盘", "小盘", "百元", "低价", "高价",
    "重仓", "风格", "题材股", "预盈", "预亏",
    "融资融券", "转融券", "深股通", "沪股通", "创业板", "科创板",
    "富时", "MSCI", "标普", "道琼斯",
    "上证", "深证", "中证", "沪深300", "中证500",
]
