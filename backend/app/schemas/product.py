from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.models.product import SoftwareProductCategory


class SoftwareProductBase(BaseModel):
    name: str
    slug: str | None = None
    category: SoftwareProductCategory
    short_description: str | None = None
    description: str | None = None
    features: dict | None = None
    price: float | None = None
    currency: str = "TRY"
    is_free: bool = False
    download_url: str | None = None
    demo_url: str | None = None
    cover_image_url: str | None = None
    screenshots: dict | None = None
    version: str | None = None
    is_published: bool = False
    is_featured: bool = False
    sort_order: int = 0


class SoftwareProductCreate(SoftwareProductBase):
    pass


class SoftwareProductResponse(SoftwareProductBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
