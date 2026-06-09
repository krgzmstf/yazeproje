from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from slugify import slugify
from fastapi_cache.decorator import cache

from app.core.database import get_db
from app.models.real_estate import RealEstateListing, ListingType, PropertyType
from app.models.user import UserRole
from app.schemas.real_estate import RealEstateListingResponse, RealEstateListingCreate
from app.api.v1.endpoints.auth import RoleChecker

router = APIRouter()
allow_agent_or_admin = Depends(RoleChecker([UserRole.AGENT, UserRole.ADMIN]))


@router.get("/", response_model=list[RealEstateListingResponse])
@cache(expire=60)
async def get_listings(
    listing_type: ListingType | None = None,
    property_type: PropertyType | None = None,
    is_featured: bool | None = None,
    min_lat: float | None = None,
    max_lat: float | None = None,
    min_lng: float | None = None,
    max_lng: float | None = None,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all real estate listings, optionally filtered by type, property_type, featured or map bounds.
    """
    query = select(RealEstateListing)
    
    # Non-published items are hidden from public, except if the user is authenticated in management.
    # To keep things simple, we return published items for public page.
    query = query.where(RealEstateListing.is_published == True)
    
    if listing_type is not None:
        query = query.where(RealEstateListing.listing_type == listing_type)
        
    if property_type is not None:
        query = query.where(RealEstateListing.property_type == property_type)
        
    if is_featured is not None:
        query = query.where(RealEstateListing.is_featured == is_featured)

    # Coordinate boundaries
    if min_lat is not None:
        query = query.where(RealEstateListing.latitude >= min_lat)
    if max_lat is not None:
        query = query.where(RealEstateListing.latitude <= max_lat)
    if min_lng is not None:
        query = query.where(RealEstateListing.longitude >= min_lng)
    if max_lng is not None:
        query = query.where(RealEstateListing.longitude <= max_lng)
        
    query = query.order_by(RealEstateListing.created_at.desc()).limit(limit)
    
    result = await db.execute(query)
    listings = result.scalars().all()
    return listings


@router.get("/admin", response_model=list[RealEstateListingResponse], dependencies=[allow_agent_or_admin])
async def get_all_listings_for_admin(
    db: AsyncSession = Depends(get_db)
):
    """
    Get all real estate listings (including drafts) for management panel.
    """
    query = select(RealEstateListing).order_by(RealEstateListing.created_at.desc())
    result = await db.execute(query)
    listings = result.scalars().all()
    return listings


@router.get("/{slug}", response_model=RealEstateListingResponse)
async def get_listing_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a single real estate listing by its slug.
    """
    query = select(RealEstateListing).where(
        RealEstateListing.slug == slug,
        RealEstateListing.is_published == True
    )
    result = await db.execute(query)
    listing = result.scalars().first()
    
    if not listing:
        raise HTTPException(status_code=404, detail="Gayrimenkul ilanı bulunamadı.")
        
    # Increment view count
    listing.view_count += 1
    await db.commit()
    await db.refresh(listing)
    
    return listing


@router.post("/", response_model=RealEstateListingResponse, dependencies=[allow_agent_or_admin])
async def create_listing(
    payload: RealEstateListingCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new real estate listing. Protected (Admin / Agent).
    """
    # Slug generation
    base_slug = slugify(payload.title)
    slug = base_slug
    
    # Check uniqueness
    existing = await db.execute(select(RealEstateListing).where(RealEstateListing.slug == slug))
    counter = 1
    while existing.scalars().first():
        slug = f"{base_slug}-{counter}"
        existing = await db.execute(select(RealEstateListing).where(RealEstateListing.slug == slug))
        counter += 1
        
    db_listing = RealEstateListing(
        **payload.model_dump(exclude={"slug"}),
        slug=slug
    )
    db.add(db_listing)
    await db.commit()
    await db.refresh(db_listing)
    return db_listing


@router.put("/{id}", response_model=RealEstateListingResponse, dependencies=[allow_agent_or_admin])
async def update_listing(
    id: str,
    payload: RealEstateListingCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing real estate listing. Protected (Admin / Agent).
    """
    # Try finding by UUID
    try:
        from uuid import UUID
        uuid_id = UUID(id)
        query = select(RealEstateListing).where(RealEstateListing.id == uuid_id)
    except ValueError:
        query = select(RealEstateListing).where(RealEstateListing.id == id)
        
    result = await db.execute(query)
    db_listing = result.scalars().first()
    
    if not db_listing:
        raise HTTPException(status_code=404, detail="Gayrimenkul ilanı bulunamadı.")
        
    data = payload.model_dump(exclude_unset=True)
    # Don't update slug unless specifically requested, or keep it consistent
    if "slug" in data and data["slug"] is None:
        data.pop("slug")
        
    for key, value in data.items():
        setattr(db_listing, key, value)
        
    await db.commit()
    await db.refresh(db_listing)
    return db_listing


@router.delete("/{id}", dependencies=[allow_agent_or_admin])
async def delete_listing(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a real estate listing. Protected (Admin / Agent).
    """
    try:
        from uuid import UUID
        uuid_id = UUID(id)
        query = select(RealEstateListing).where(RealEstateListing.id == uuid_id)
    except ValueError:
        query = select(RealEstateListing).where(RealEstateListing.id == id)
        
    result = await db.execute(query)
    db_listing = result.scalars().first()
    
    if not db_listing:
        raise HTTPException(status_code=404, detail="Gayrimenkul ilanı bulunamadı.")
        
    await db.delete(db_listing)
    await db.commit()
    return {"message": "İlan başarıyla silindi."}
