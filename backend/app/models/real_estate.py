"""
Real estate listing and scraped market lead models.
"""

import enum
import uuid

from sqlalchemy import (
    Boolean,
    Enum,
    Float,
    Integer,
    String,
    Text,
)
from sqlalchemy import JSON as JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


# ── Real Estate Listings ─────────────────────────────────────────

class ListingType(str, enum.Enum):
    SALE = "sale"
    RENT = "rent"
    DAILY_RENT = "daily_rent"


class PropertyType(str, enum.Enum):
    APARTMENT = "apartment"
    VILLA = "villa"
    LAND = "land"
    OFFICE = "office"
    SHOP = "shop"
    WAREHOUSE = "warehouse"
    OTHER = "other"


class RealEstateListing(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "real_estate_listings"

    title: Mapped[str] = mapped_column(String(400), nullable=False)
    slug: Mapped[str] = mapped_column(String(450), unique=True, index=True, nullable=False)
    listing_type: Mapped[ListingType] = mapped_column(
        Enum(ListingType, name="listing_type"), nullable=False
    )
    property_type: Mapped[PropertyType] = mapped_column(
        Enum(PropertyType, name="property_type"), nullable=False
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="TRY", nullable=False)
    area_sqm: Mapped[float | None] = mapped_column(Float, nullable=True)
    room_count: Mapped[str | None] = mapped_column(String(20), nullable=True)  # e.g. "3+1"
    floor_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_floors: Mapped[int | None] = mapped_column(Integer, nullable=True)
    building_age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    heating_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    district: Mapped[str | None] = mapped_column(String(100), nullable=True)
    neighborhood: Mapped[str | None] = mapped_column(String(100), nullable=True)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    cover_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    gallery_urls: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    features: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    contact_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    def __repr__(self) -> str:
        return f"<RealEstateListing {self.title}>"


# ── Scraped Market Leads ─────────────────────────────────────────

class LeadSource(str, enum.Enum):
    SAHIBINDEN = "sahibinden"
    HEPSIEMLAK = "hepsiemlak"
    EMLAKJET = "emlakjet"
    OTHER = "other"


class ScrapedMarketLead(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "scraped_market_leads"

    source: Mapped[LeadSource] = mapped_column(
        Enum(LeadSource, name="lead_source"), nullable=False
    )
    external_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="TRY", nullable=False)
    location: Mapped[str | None] = mapped_column(String(500), nullable=True)
    area_sqm: Mapped[float | None] = mapped_column(Float, nullable=True)
    room_count: Mapped[str | None] = mapped_column(String(20), nullable=True)
    description_snippet: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    raw_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    is_processed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_relevant: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    def __repr__(self) -> str:
        return f"<ScrapedMarketLead {self.source.value}: {self.title[:40]}>"
