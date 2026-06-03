from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from slugify import slugify

from app.core.database import get_db
from app.models.project import ArchitectureProject, ProjectCategory
from app.models.user import UserRole
from app.schemas.project import ArchitectureProjectResponse, ArchitectureProjectCreate
from app.api.v1.endpoints.auth import RoleChecker

router = APIRouter()
allow_architect_or_admin = Depends(RoleChecker([UserRole.ARCHITECT, UserRole.ADMIN]))


@router.get("/", response_model=list[ArchitectureProjectResponse])
async def get_projects(
    category: ProjectCategory | None = None,
    is_featured: bool | None = None,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all architecture projects, optionally filtered by category or featured status.
    Ordered by sort_order ascending, then created_at descending.
    """
    query = select(ArchitectureProject).where(ArchitectureProject.is_published == True)
    
    if category is not None:
        query = query.where(ArchitectureProject.category == category)
        
    if is_featured is not None:
        query = query.where(ArchitectureProject.is_featured == is_featured)
        
    query = query.order_by(ArchitectureProject.sort_order.asc(), ArchitectureProject.created_at.desc()).limit(limit)
    
    result = await db.execute(query)
    projects = result.scalars().all()
    return projects


@router.get("/{slug}", response_model=ArchitectureProjectResponse)
async def get_project_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a single architecture project by its slug.
    """
    query = select(ArchitectureProject).where(
        ArchitectureProject.slug == slug,
        ArchitectureProject.is_published == True
    )
    result = await db.execute(query)
    project = result.scalars().first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Proje bulunamadı.")
        
    return project


@router.post("/", response_model=ArchitectureProjectResponse, dependencies=[allow_architect_or_admin])
async def create_project(
    payload: ArchitectureProjectCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new architecture project. Protected (Admin / Architect).
    """
    base_slug = slugify(payload.title)
    slug = base_slug
    
    existing = await db.execute(select(ArchitectureProject).where(ArchitectureProject.slug == slug))
    counter = 1
    while existing.scalars().first():
        slug = f"{base_slug}-{counter}"
        existing = await db.execute(select(ArchitectureProject).where(ArchitectureProject.slug == slug))
        counter += 1
        
    db_project = ArchitectureProject(
        **payload.model_dump(exclude={"slug"}),
        slug=slug
    )
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return db_project


@router.put("/{id}", response_model=ArchitectureProjectResponse, dependencies=[allow_architect_or_admin])
async def update_project(
    id: str,
    payload: ArchitectureProjectCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing architecture project. Protected (Admin / Architect).
    """
    try:
        from uuid import UUID
        uuid_id = UUID(id)
        query = select(ArchitectureProject).where(ArchitectureProject.id == uuid_id)
    except ValueError:
        query = select(ArchitectureProject).where(ArchitectureProject.id == id)
        
    result = await db.execute(query)
    db_project = result.scalars().first()
    
    if not db_project:
        raise HTTPException(status_code=404, detail="Proje bulunamadı.")
        
    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"] is None:
        data.pop("slug")
        
    for key, value in data.items():
        setattr(db_project, key, value)
        
    await db.commit()
    await db.refresh(db_project)
    return db_project


@router.delete("/{id}", dependencies=[allow_architect_or_admin])
async def delete_project(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete an architecture project. Protected (Admin / Architect).
    """
    try:
        from uuid import UUID
        uuid_id = UUID(id)
        query = select(ArchitectureProject).where(ArchitectureProject.id == uuid_id)
    except ValueError:
        query = select(ArchitectureProject).where(ArchitectureProject.id == id)
        
    result = await db.execute(query)
    db_project = result.scalars().first()
    
    if not db_project:
        raise HTTPException(status_code=404, detail="Proje bulunamadı.")
        
    await db.delete(db_project)
    await db.commit()
    return {"message": "Proje başarıyla silindi."}
