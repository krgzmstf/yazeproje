"""
Site settings and quick menu item models.
"""

from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy import JSON as JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class SiteSetting(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Key-value store for global site configuration.
    Examples: site_title, footer_text, social_links, hero_image_url, etc.
    """

    __tablename__ = "site_settings"

    key: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    value: Mapped[str | None] = mapped_column(Text, nullable=True)
    value_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    group: Mapped[str] = mapped_column(String(100), default="general", nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    def __repr__(self) -> str:
        return f"<SiteSetting {self.key}>"


class QuickMenuItem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Configurable quick-access menu items displayed on the frontend.
    """

    __tablename__ = "quick_menu_items"

    label: Mapped[str] = mapped_column(String(100), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    icon: Mapped[str | None] = mapped_column(String(100), nullable=True)
    target: Mapped[str] = mapped_column(String(10), default="_self", nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    parent_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

    def __repr__(self) -> str:
        return f"<QuickMenuItem {self.label}>"
