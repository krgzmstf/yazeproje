"""
Regulation / legal document model.
"""

import enum

from sqlalchemy import Boolean, Enum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class RegulationCategory(str, enum.Enum):
    BUILDING_CODE = "building_code"
    ZONING = "zoning"
    ENVIRONMENTAL = "environmental"
    SAFETY = "safety"
    ACCESSIBILITY = "accessibility"
    ENERGY = "energy"
    OTHER = "other"


class Regulation(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "regulations"

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    slug: Mapped[str] = mapped_column(String(550), unique=True, index=True, nullable=False)
    category: Mapped[RegulationCategory] = mapped_column(
        Enum(RegulationCategory, name="regulation_category"), nullable=False
    )
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    official_gazette_no: Mapped[str | None] = mapped_column(String(100), nullable=True)
    effective_date: Mapped[str | None] = mapped_column(String(10), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    def __repr__(self) -> str:
        return f"<Regulation {self.title}>"
