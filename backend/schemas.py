"""Pydantic response/request schemas."""

from datetime import date, datetime

from pydantic import BaseModel, Field


# ── Stock ────────────────────────────────────────────
class StockOut(BaseModel):
    id: str
    code: str
    name: str
    chain_level: str
    logic: str | None = None
    market_cap: float | None = None
    pe_ratio: float | None = None

    model_config = {"from_attributes": True}


# ── Topic ────────────────────────────────────────────
class TopicBrief(BaseModel):
    """Brief topic info for list display."""
    id: str
    name: str
    code: str
    heat_rank: int
    up_down_pct: float | None = None
    leading_stock: str | None = None
    news_summary: str | None = None
    update_date: date

    model_config = {"from_attributes": True}


class TopicDetail(BaseModel):
    """Full topic info with stocks grouped by chain level."""
    id: str
    name: str
    code: str
    concept_explanation: str | None = None
    heat_rank: int
    up_down_pct: float | None = None
    leading_stock: str | None = None
    news_summary: str | None = None
    upstream_desc: str | None = None
    midstream_desc: str | None = None
    downstream_desc: str | None = None
    update_date: date
    created_at: datetime
    upstream_stocks: list[StockOut] = Field(default_factory=list)
    midstream_stocks: list[StockOut] = Field(default_factory=list)
    downstream_stocks: list[StockOut] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class TopicListResponse(BaseModel):
    topics: list[TopicBrief]
    total: int
    page: int
    page_size: int


# ── Update Log ────────────────────────────────────────
class UpdateLogOut(BaseModel):
    id: str
    update_date: date
    status: str
    topics_count: int
    error_msg: str | None = None
    started_at: datetime | None = None
    finished_at: datetime | None = None

    model_config = {"from_attributes": True}


# ── Refresh ──────────────────────────────────────────
class RefreshResponse(BaseModel):
    status: str
    message: str
    log_id: str


# ── Dates ────────────────────────────────────────────
class DatesResponse(BaseModel):
    dates: list[date]
