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
HOT_TOPICS_COUNT = int(os.getenv("HOT_TOPICS_COUNT", "20"))  # Top N concepts to track
LLM_CONCURRENCY = int(os.getenv("LLM_CONCURRENCY", "5"))  # Max concurrent LLM calls
