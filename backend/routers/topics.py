"""Topic-related API routes."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models import Stock, Topic
from schemas import (
    DatesResponse,
    StockOut,
    TopicBrief,
    TopicDetail,
    TopicListResponse,
)

router = APIRouter(prefix="/api/v1", tags=["topics"])


@router.get("/topics", response_model=TopicListResponse)
async def list_topics(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    date_filter: date | None = Query(None, alias="date"),
    db: AsyncSession = Depends(get_db),
):
    """List topics with pagination, ordered by heat_rank."""
    # Determine which date to use
    if date_filter:
        query_date = date_filter
    else:
        # Latest date
        result = await db.execute(
            select(func.max(Topic.update_date))
        )
        query_date = result.scalar()
        if not query_date:
            return TopicListResponse(topics=[], total=0, page=page, page_size=page_size)

    # Count
    count_q = select(func.count(Topic.id)).where(Topic.update_date == query_date)
    total = (await db.execute(count_q)).scalar() or 0

    # Fetch page
    q = (
        select(Topic)
        .where(Topic.update_date == query_date)
        .order_by(Topic.heat_rank.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    result = await db.execute(q)
    topics = result.scalars().all()

    return TopicListResponse(
        topics=[TopicBrief.model_validate(t) for t in topics],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/topics/hot", response_model=list[TopicBrief])
async def hot_topics(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Get today's hottest topics (top N)."""
    result = await db.execute(
        select(func.max(Topic.update_date))
    )
    latest_date = result.scalar()
    if not latest_date:
        return []

    q = (
        select(Topic)
        .where(Topic.update_date == latest_date)
        .order_by(Topic.heat_rank.asc())
        .limit(limit)
    )
    result = await db.execute(q)
    topics = result.scalars().all()
    return [TopicBrief.model_validate(t) for t in topics]


@router.get("/topics/{topic_id}", response_model=TopicDetail)
async def topic_detail(
    topic_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get full topic detail with stocks grouped by chain level."""
    q = (
        select(Topic)
        .where(Topic.id == topic_id)
        .options(selectinload(Topic.stocks))
    )
    result = await db.execute(q)
    topic = result.scalar_one_or_none()

    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    detail = TopicDetail.model_validate(topic)

    # Group stocks by chain level
    upstream = []
    midstream = []
    downstream = []
    for s in topic.stocks:
        so = StockOut.model_validate(s)
        if s.chain_level == "upstream":
            upstream.append(so)
        elif s.chain_level == "midstream":
            midstream.append(so)
        elif s.chain_level == "downstream":
            downstream.append(so)

    detail.upstream_stocks = upstream
    detail.midstream_stocks = midstream
    detail.downstream_stocks = downstream

    return detail


@router.get("/stocks/{stock_code}", response_model=dict)
async def stock_info(
    stock_code: str,
    db: AsyncSession = Depends(get_db),
):
    """Get stock info with its topic affiliations and logic."""
    q = (
        select(Stock)
        .where(Stock.code == stock_code)
        .options(selectinload(Stock.topic))
    )
    result = await db.execute(q)
    stocks = result.scalars().all()

    if not stocks:
        raise HTTPException(status_code=404, detail="Stock not found")

    return {
        "code": stock_code,
        "name": stocks[0].name,
        "topics": [
            {
                "topic_id": s.topic.id,
                "topic_name": s.topic.name,
                "chain_level": s.chain_level,
                "logic": s.logic,
            }
            for s in stocks
        ],
    }


@router.get("/dates", response_model=DatesResponse)
async def available_dates(
    db: AsyncSession = Depends(get_db),
):
    """Get list of dates that have topic data (for history lookup)."""
    result = await db.execute(
        select(Topic.update_date).distinct().order_by(Topic.update_date.desc()).limit(30)
    )
    dates = [row[0] for row in result.all()]
    return DatesResponse(dates=dates)
