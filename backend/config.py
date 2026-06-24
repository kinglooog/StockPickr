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

# Non-industry concept names to filter out (market categories, not real themes)
JUNK_CONCEPT_NAMES = {
    "昨日打二板以上表现", "历史新高", "科技风格",
    "百元股", "题材股", "近期新高", "昨曾涨停",
    "低价股", "微盘股", "大盘股", "中盘股",
}
