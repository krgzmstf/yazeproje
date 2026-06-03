from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from slugify import slugify

from app.core.database import get_db
from app.models.product import SoftwareProduct
from app.models.user import UserRole
from app.api.v1.endpoints.auth import RoleChecker
from app.schemas.product import SoftwareProductCreate, SoftwareProductResponse

router = APIRouter()
allow_developer_or_admin = Depends(RoleChecker([UserRole.DEVELOPER, UserRole.ADMIN]))


@router.get("/", response_model=list[SoftwareProductResponse])
async def get_software_products(
    is_featured: bool | None = None,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all published software products.
    """
    query = select(SoftwareProduct).where(SoftwareProduct.is_published == True)
    
    if is_featured is not None:
        query = query.where(SoftwareProduct.is_featured == is_featured)
        
    query = query.order_by(SoftwareProduct.sort_order.asc(), SoftwareProduct.created_at.desc()).limit(limit)
    
    result = await db.execute(query)
    products = result.scalars().all()
    return products


@router.get("/admin", response_model=list[SoftwareProductResponse], dependencies=[allow_developer_or_admin])
async def get_all_software_products_for_admin(
    db: AsyncSession = Depends(get_db)
):
    """
    Get all software products (including unpublished ones) for management panel.
    """
    query = select(SoftwareProduct).order_by(SoftwareProduct.sort_order.asc(), SoftwareProduct.created_at.desc())
    result = await db.execute(query)
    products = result.scalars().all()
    return products


@router.get("/{slug}", response_model=SoftwareProductResponse)
async def get_software_product_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a single software product by its slug.
    """
    query = select(SoftwareProduct).where(
        SoftwareProduct.slug == slug,
        SoftwareProduct.is_published == True
    )
    result = await db.execute(query)
    product = result.scalars().first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Yazılım ürünü bulunamadı.")
        
    return product


@router.post("/", response_model=SoftwareProductResponse, status_code=status.HTTP_201_CREATED, dependencies=[allow_developer_or_admin])
async def create_software_product(
    payload: SoftwareProductCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new software product. Generates unique slug automatically.
    """
    base_slug = slugify(payload.name)
    slug = base_slug
    existing = await db.execute(select(SoftwareProduct).where(SoftwareProduct.slug == slug))
    counter = 1
    while existing.scalars().first():
        slug = f"{base_slug}-{counter}"
        existing = await db.execute(select(SoftwareProduct).where(SoftwareProduct.slug == slug))
        counter += 1
        
    db_product = SoftwareProduct(
        **payload.model_dump(exclude={"slug"}),
        slug=slug
    )
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product


@router.put("/{id}", response_model=SoftwareProductResponse, dependencies=[allow_developer_or_admin])
async def update_software_product(
    id: str,
    payload: SoftwareProductCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing software product by its ID (UUID).
    """
    try:
        from uuid import UUID
        uuid_id = UUID(id)
        query = select(SoftwareProduct).where(SoftwareProduct.id == uuid_id)
    except ValueError:
        query = select(SoftwareProduct).where(SoftwareProduct.id == id)
        
    result = await db.execute(query)
    db_product = result.scalars().first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Yazılım ürünü bulunamadı.")
        
    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"] is None:
        data.pop("slug")
        
    for key, value in data.items():
        setattr(db_product, key, value)
        
    await db.commit()
    await db.refresh(db_product)
    return db_product


@router.delete("/{id}", dependencies=[allow_developer_or_admin])
async def delete_software_product(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a software product by its ID (UUID).
    """
    try:
        from uuid import UUID
        uuid_id = UUID(id)
        query = select(SoftwareProduct).where(SoftwareProduct.id == uuid_id)
    except ValueError:
        query = select(SoftwareProduct).where(SoftwareProduct.id == id)
        
    result = await db.execute(query)
    db_product = result.scalars().first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Yazılım ürünü bulunamadı.")
        
    await db.delete(db_product)
    await db.commit()
    return {"message": "Yazılım ürünü başarıyla silindi."}
