"""SQLAlchemy ORM models."""

import uuid
from datetime import date, datetime, timezone, timedelta

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

# China timezone
CN_TZ = timezone(timedelta(hours=8))


def now_cn() -> datetime:
    return datetime.now(CN_TZ).replace(tzinfo=None)


def gen_uuid() -> str:
    return str(uuid.uuid4())


class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(20), nullable=False)  # EastMoney concept code
    concept_explanation: Mapped[str | None] = mapped_column(Text)
    heat_rank: Mapped[int] = mapped_column(Integer, default=0)
    up_down_pct: Mapped[float | None] = mapped_column(Float)
    leading_stock: Mapped[str | None] = mapped_column(String(50))
    news_summary: Mapped[str | None] = mapped_column(Text)
    upstream_desc: Mapped[str | None] = mapped_column(Text)
    midstream_desc: Mapped[str | None] = mapped_column(Text)
    downstream_desc: Mapped[str | None] = mapped_column(Text)
    llm_raw_response: Mapped[str | None] = mapped_column(Text)
    update_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now_cn)

    stocks: Mapped[list["Stock"]] = relationship(
        "Stock", back_populates="topic", cascade="all, delete-orphan"
    )


class Stock(Base):
    __tablename__ = "stocks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    topic_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True
    )
    code: Mapped[str] = mapped_column(String(10), nullable=False)  # 6-digit stock code
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    chain_level: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # upstream / midstream / downstream
    logic: Mapped[str | None] = mapped_column(Text)
    market_cap: Mapped[float | None] = mapped_column(Float)  # 市值(亿)
    pe_ratio: Mapped[float | None] = mapped_column(Float)

    topic: Mapped["Topic"] = relationship("Topic", back_populates="stocks")


class UpdateLog(Base):
    __tablename__ = "update_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    update_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    status: Mapped[str] = mapped_column(
        String(20), default="pending"
    )  # pending / running / success / failed / partial
    topics_count: Mapped[int] = mapped_column(Integer, default=0)
    error_msg: Mapped[str | None] = mapped_column(Text)
    started_at: Mapped[datetime | None] = mapped_column(DateTime)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime)
