"""
Product models: SoftwareProduct, ProductForSale.
"""

import enum

from sqlalchemy import Boolean, Enum, Float, Integer, String, Text
from sqlalchemy import JSON as JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


# ── Software Products (Digital / SaaS) ───────────────────────────

class SoftwareProductCategory(str, enum.Enum):
    CAD_TOOL = "cad_tool"
    PROJECT_MANAGEMENT = "project_management"
    BIM = "bim"
    CALCULATION = "calculation"
    VISUALIZATION = "visualization"
    OTHER = "other"


class SoftwareProduct(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "software_products"

    name: Mapped[str] = mapped_column(String(300), nullable=False)
    slug: Mapped[str] = mapped_column(String(350), unique=True, index=True, nullable=False)
    category: Mapped[SoftwareProductCategory] = mapped_column(
        Enum(SoftwareProductCategory, name="software_product_category"), nullable=False
    )
    short_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    features: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="TRY", nullable=False)
    is_free: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    download_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    demo_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    cover_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    screenshots: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    def __repr__(self) -> str:
        return f"<SoftwareProduct {self.name}>"


# ── Physical Products For Sale ───────────────────────────────────

class ProductForSale(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "products_for_sale"

    name: Mapped[str] = mapped_column(String(300), nullable=False)
    slug: Mapped[str] = mapped_column(String(350), unique=True, index=True, nullable=False)
    sku: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    short_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    discount_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="TRY", nullable=False)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    cover_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    gallery_urls: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    specifications: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # ── Relationships ────────────────────────────────────────────
    order_items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem", back_populates="product", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<ProductForSale {self.name}>"
