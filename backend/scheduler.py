"""APScheduler configuration and full data pipeline orchestration."""

from datetime import date, datetime

import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from config import SCHEDULE_HOUR, SCHEDULE_MINUTE
from enhancer import enhance_concepts
from models import Stock, Topic, UpdateLog
from scraper import scrape_all

scheduler = AsyncIOScheduler(timezone="Asia/Shanghai")


async def run_full_pipeline(db: AsyncSession) -> int:
    """Run the complete pipeline: scrape → enhance → persist.

    Args:
        db: Database session (committed externally).

    Returns:
        Number of topics processed.
    """
    today = date.today()

    # ── Step 1: Scrape ──────────────────────────────
    print(f"[Pipeline] Scraping hot concepts...")
    concepts = await scrape_all()  # Let scrape_all manage client with fallback
    print(f"[Pipeline] Scraped {len(concepts)} concepts")

    # ── Step 2: LLM Enhance ─────────────────────────
    print(f"[Pipeline] Enhancing with DeepSeek LLM...")
    enhanced = await enhance_concepts(concepts)
    print(f"[Pipeline] Enhanced {len(enhanced)} concepts")

    # ── Step 3: Persist ─────────────────────────────
    topics_count = 0

    for ec in enhanced:
        llm_result = ec.get("llm_result") or {}

        # Create topic
        topic = Topic(
            name=ec["name"],
            code=ec["code"],
            concept_explanation=llm_result.get("concept_explanation"),
            heat_rank=ec.get("heat_rank", topics_count + 1),
            up_down_pct=ec.get("up_down_pct"),
            leading_stock=ec.get("leading_stock"),
            upstream_desc=llm_result.get("upstream", {}).get("desc"),
            midstream_desc=llm_result.get("midstream", {}).get("desc"),
            downstream_desc=llm_result.get("downstream", {}).get("desc"),
            llm_raw_response=ec.get("llm_raw_response"),
            update_date=today,
        )
        db.add(topic)
        await db.flush()  # Get topic.id

        # Delete existing stocks for this topic (if re-running)
        await db.execute(delete(Stock).where(Stock.topic_id == topic.id))

        # Insert stocks from LLM result
        for level_key in ("upstream", "midstream", "downstream"):
            level_stocks = llm_result.get(level_key, {}).get("stocks", [])
            for s in level_stocks:
                stock = Stock(
                    topic_id=topic.id,
                    code=s.get("code", ""),
                    name=s.get("name", ""),
                    chain_level=level_key,
                    logic=s.get("logic", ""),
                )
                db.add(stock)

        topics_count += 1

    print(f"[Pipeline] Persisted {topics_count} topics to database")
    return topics_count


async def _daily_job():
    """Daily scheduled job: scrape + enhance + persist."""
    from database import async_session

    print(f"[Scheduler] Starting daily refresh job...")
    async with async_session() as db:
        today = date.today()

        # Create log
        log = UpdateLog(
            update_date=today,
            status="running",
            started_at=datetime.utcnow(),
        )
        db.add(log)
        await db.flush()

        try:
            count = await run_full_pipeline(db)
            log.status = "success"
            log.topics_count = count
            log.finished_at = datetime.utcnow()
            await db.commit()
            print(f"[Scheduler] Daily job completed: {count} topics")

        except Exception as e:
            log.status = "failed"
            log.error_msg = str(e)
            log.finished_at = datetime.utcnow()
            await db.commit()
            print(f"[Scheduler] Daily job failed: {e}")


def init_scheduler():
    """Register the daily job and start the scheduler."""
    scheduler.add_job(
        _daily_job,
        trigger="cron",
        hour=SCHEDULE_HOUR,
        minute=SCHEDULE_MINUTE,
        id="daily_scrape",
        name="Daily hot topic scrape and enhance",
    )
    scheduler.start()
    print(
        f"[Scheduler] Daily job registered at "
        f"{SCHEDULE_HOUR:02d}:{SCHEDULE_MINUTE:02d} (Asia/Shanghai)"
    )
