"""APScheduler configuration and full data pipeline orchestration."""

from datetime import date, datetime, timezone, timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from config import SCHEDULE_HOUR, SCHEDULE_MINUTE
from enhancer import enhance_concepts
from models import Stock, Topic, UpdateLog
from scraper import scrape_all

CN_TZ = timezone(timedelta(hours=8))

def now_cn() -> datetime:
    return datetime.now(CN_TZ).replace(tzinfo=None)

scheduler = AsyncIOScheduler(timezone="Asia/Shanghai")


async def run_full_pipeline(db: AsyncSession, force_llm: bool = False) -> int:
    """Run the complete pipeline: scrape → enhance → persist.

    Smart behavior:
    - Always scrape fresh market data (free)
    - Skip LLM for topics that already have chain analysis (save tokens)
    - Use `force_llm=True` to re-enhance all topics

    Returns:
        Number of topics processed.
    """
    today = date.today()
    now = now_cn()

    # ── Step 1: Scrape ──────────────────────────────
    print(f"[Pipeline] Scraping hot concepts...")
    concepts = await scrape_all()
    print(f"[Pipeline] Scraped {len(concepts)} concepts")

    # ── Step 2: Check which topics need LLM ──────────
    # Fetch existing topics for today that already have chain data
    result = await db.execute(
        select(Topic.code).where(
            Topic.update_date == today,
            Topic.concept_explanation.isnot(None),
            Topic.concept_explanation != "",
        )
    )
    enhanced_codes = {row[0] for row in result.all()}

    # Split: concepts needing LLM vs. already enhanced
    need_llm = []
    already_have = []
    for c in concepts:
        if c["code"] in enhanced_codes and not force_llm:
            already_have.append(c)
        else:
            need_llm.append(c)

    print(f"[Pipeline] {len(already_have)} concepts already have chain data (skipping LLM)")
    print(f"[Pipeline] {len(need_llm)} concepts need LLM enhancement")

    # ── Step 3: LLM Enhance (only for new) ───────────
    if need_llm:
        print(f"[Pipeline] Enhancing {len(need_llm)} concepts with DeepSeek...")
        enhanced_new = await enhance_concepts(need_llm)
    else:
        enhanced_new = []

    llm_results = {}  # code → llm_result
    for ec in enhanced_new:
        llm_results[ec["code"]] = ec.get("llm_result") or {}

    # ── Step 4: Persist ─────────────────────────────
    topics_count = 0

    # Process newly-enhanced concepts
    for ec in enhanced_new:
        await _save_topic(db, ec, llm_results.get(ec["code"], {}), today, now)
        topics_count += 1

    # Update market data for already-enhanced concepts
    for ec in already_have:
        await _update_market_data(db, ec, today)
        topics_count += 1

    print(f"[Pipeline] Persisted {topics_count} topics")
    return topics_count


async def _save_topic(db: AsyncSession, ec: dict, llm: dict, today: date, now: datetime):
    """Insert a new topic with full LLM data."""
    topic = Topic(
        name=ec["name"],
        code=ec["code"],
        concept_explanation=llm.get("concept_explanation"),
        heat_rank=ec.get("heat_rank", 0),
        up_down_pct=ec.get("up_down_pct"),
        leading_stock=ec.get("leading_stock"),
        upstream_desc=llm.get("upstream", {}).get("desc"),
        midstream_desc=llm.get("midstream", {}).get("desc"),
        downstream_desc=llm.get("downstream", {}).get("desc"),
        llm_raw_response=ec.get("llm_raw_response"),
        update_date=today,
        created_at=now,
    )
    db.add(topic)
    await db.flush()

    for level_key in ("upstream", "midstream", "downstream"):
        for s in llm.get(level_key, {}).get("stocks", []):
            db.add(Stock(
                topic_id=topic.id,
                code=s.get("code", ""),
                name=s.get("name", ""),
                chain_level=level_key,
                logic=s.get("logic", ""),
            ))


async def _update_market_data(db: AsyncSession, ec: dict, today: date):
    """Update only market data for an existing topic (keep chain analysis)."""
    result = await db.execute(
        select(Topic).where(
            Topic.code == ec["code"],
            Topic.update_date == today,
        )
    )
    topic = result.scalar_one_or_none()
    if topic:
        topic.heat_rank = ec.get("heat_rank", topic.heat_rank)
        topic.up_down_pct = ec.get("up_down_pct")
        topic.leading_stock = ec.get("leading_stock")
        topic.created_at = now_cn()  # bump time to show freshness


async def _daily_job():
    """Daily scheduled job: scrape + enhance + persist."""
    from database import async_session

    print(f"[Scheduler] Starting daily refresh job...")
    async with async_session() as db:
        today = date.today()

        log = UpdateLog(
            update_date=today,
            status="running",
            started_at=now_cn(),
        )
        db.add(log)
        await db.flush()

        try:
            count = await run_full_pipeline(db)
            log.status = "success"
            log.topics_count = count
            log.finished_at = now_cn()
            await db.commit()
            print(f"[Scheduler] Daily job completed: {count} topics")

        except Exception as e:
            log.status = "failed"
            log.error_msg = str(e)
            log.finished_at = now_cn()
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
