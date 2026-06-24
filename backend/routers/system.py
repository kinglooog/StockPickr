"""System routes — data refresh and update logs."""

from datetime import date, datetime, timezone, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Stock, Topic, UpdateLog
from schemas import RefreshResponse, UpdateLogOut
from scheduler import run_full_pipeline

CN_TZ = timezone(timedelta(hours=8))

def now_cn() -> datetime:
    return datetime.now(CN_TZ).replace(tzinfo=None)

router = APIRouter(prefix="/api/v1", tags=["system"])


@router.post("/refresh", response_model=RefreshResponse)
async def refresh_data(
    db: AsyncSession = Depends(get_db),
):
    """Manually trigger a full data refresh (scrape + LLM enhance + persist)."""
    now = now_cn()
    today = date.today()

    # Check if already running today
    result = await db.execute(
        select(UpdateLog).where(
            UpdateLog.update_date == today,
            UpdateLog.status == "running",
        )
    )
    if result.scalar_one_or_none():
        return RefreshResponse(
            status="conflict",
            message="A refresh is already running for today.",
            log_id="",
        )

    # Create log entry
    log = UpdateLog(
        update_date=today,
        status="running",
        started_at=now,
    )
    db.add(log)
    await db.flush()

    try:
        # Run the pipeline
        topics_count = await run_full_pipeline(db)

        log.status = "success"
        log.topics_count = topics_count
        log.finished_at = now_cn()

        return RefreshResponse(
            status="success",
            message=f"Successfully refreshed {topics_count} topics.",
            log_id=log.id,
        )

    except Exception as e:
        log.status = "failed"
        log.error_msg = str(e)
        log.finished_at = now_cn()
        await db.flush()

        return RefreshResponse(
            status="failed",
            message=f"Refresh failed: {e}",
            log_id=log.id,
        )


@router.get("/update-log", response_model=list[UpdateLogOut])
async def update_logs(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
):
    """Get recent update logs."""
    result = await db.execute(
        select(UpdateLog)
        .order_by(UpdateLog.started_at.desc())
        .limit(limit)
    )
    logs = result.scalars().all()
    return [UpdateLogOut.model_validate(log) for log in logs]
