"""
Scraper log model – tracks web scraping job executions.
"""

import enum

from sqlalchemy import Enum, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ScraperStatus(str, enum.Enum):
    STARTED = "started"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ScraperLog(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "scraper_logs"

    scraper_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    status: Mapped[ScraperStatus] = mapped_column(
        Enum(ScraperStatus, name="scraper_status"), nullable=False
    )
    target_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    items_found: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    items_new: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    items_updated: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    items_failed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    duration_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    log_details: Mapped[str | None] = mapped_column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<ScraperLog {self.scraper_name} {self.status.value}>"
