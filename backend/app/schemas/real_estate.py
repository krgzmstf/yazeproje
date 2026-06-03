from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.models.real_estate import ListingType, PropertyType


class RealEstateListingBase(BaseModel):
    title: str
    slug: str | None = None
    listing_type: ListingType
    property_type: PropertyType
    description: str | None = None
    price: float | None = None
    currency: str = "TRY"
    area_sqm: float | None = None
    room_count: str | None = None
    floor_number: int | None = None
    total_floors: int | None = None
    building_age: int | None = None
    heating_type: str | None = None
    city: str | None = None
    district: str | None = None
    neighborhood: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    cover_image_url: str | None = None
    gallery_urls: dict | None = None
    features: dict | None = None
    contact_name: str | None = None
    contact_phone: str | None = None
    is_featured: bool = False
    is_published: bool = False
    view_count: int = 0


class RealEstateListingCreate(RealEstateListingBase):
    pass


class RealEstateListingResponse(RealEstateListingBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
