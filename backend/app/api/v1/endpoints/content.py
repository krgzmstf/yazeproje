from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from slugify import slugify
from fastapi_cache.decorator import cache

from app.core.database import get_db
from app.models.content import AutomatedNews, Announcement, Event
from app.models.user import UserRole
from app.api.v1.endpoints.auth import RoleChecker
from app.schemas.content import (
    AutomatedNewsResponse,
    AnnouncementResponse,
    EventResponse,
    AutomatedNewsCreate,
    AnnouncementCreate,
    EventCreate,
)

router = APIRouter()
allow_editor_or_admin = Depends(RoleChecker([UserRole.EDITOR, UserRole.ADMIN]))


# ── Automated News ─────────────────────────────────────────────────

@router.get("/news", response_model=list[AutomatedNewsResponse])
@cache(expire=300)
async def get_news(
    is_featured: bool | None = None,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all published automated news articles.
    """
    query = select(AutomatedNews).where(AutomatedNews.is_published == True)
    
    if is_featured is not None:
        query = query.where(AutomatedNews.is_featured == is_featured)
        
    query = query.order_by(AutomatedNews.published_at.desc()).limit(limit)
    
    result = await db.execute(query)
    articles = result.scalars().all()
    return articles


@router.get("/news/admin", response_model=list[AutomatedNewsResponse], dependencies=[allow_editor_or_admin])
async def get_all_news_for_admin(
    db: AsyncSession = Depends(get_db)
):
    """
    Get all automated news articles (including drafts) for management panel.
    """
    query = select(AutomatedNews).order_by(AutomatedNews.published_at.desc())
    result = await db.execute(query)
    articles = result.scalars().all()
    return articles


@router.get("/news/{slug}", response_model=AutomatedNewsResponse)
async def get_news_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a single news article by its slug.
    """
    query = select(AutomatedNews).where(
        AutomatedNews.slug == slug,
        AutomatedNews.is_published == True
    )
    result = await db.execute(query)
    article = result.scalars().first()
    
    if not article:
        raise HTTPException(status_code=404, detail="Haber bulunamadı.")
        
    article.view_count += 1
    await db.commit()
    await db.refresh(article)
    
    return article


# ── Announcements ───────────────────────────────────────────────────

@router.get("/announcements", response_model=list[AnnouncementResponse])
@cache(expire=300)
async def get_announcements(
    is_pinned: bool | None = None,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all published announcements (İmar ve Askı İlanları).
    Ordered by is_pinned descending, then published_at descending.
    """
    query = select(Announcement).where(Announcement.is_published == True)
    
    if is_pinned is not None:
        query = query.where(Announcement.is_pinned == is_pinned)
        
    query = query.order_by(Announcement.is_pinned.desc(), Announcement.published_at.desc()).limit(limit)
    
    result = await db.execute(query)
    announcements = result.scalars().all()
    return announcements


@router.get("/announcements/admin", response_model=list[AnnouncementResponse], dependencies=[allow_editor_or_admin])
async def get_all_announcements_for_admin(
    db: AsyncSession = Depends(get_db)
):
    """
    Get all announcements (including drafts) for management panel.
    """
    query = select(Announcement).order_by(Announcement.is_pinned.desc(), Announcement.published_at.desc())
    result = await db.execute(query)
    announcements = result.scalars().all()
    return announcements


@router.get("/announcements/{slug}", response_model=AnnouncementResponse)
async def get_announcement_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a single announcement by its slug.
    """
    query = select(Announcement).where(
        Announcement.slug == slug,
        Announcement.is_published == True
    )
    result = await db.execute(query)
    announcement = result.scalars().first()
    
    if not announcement:
        raise HTTPException(status_code=404, detail="Duyuru bulunamadı.")
        
    return announcement


# ── Events ──────────────────────────────────────────────────────────

@router.get("/events", response_model=list[EventResponse])
@cache(expire=300)
async def get_events(
    is_featured: bool | None = None,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all published cultural events.
    Ordered by event_date ascending.
    """
    query = select(Event).where(Event.is_published == True)
    
    if is_featured is not None:
        query = query.where(Event.is_featured == is_featured)
        
    query = query.order_by(Event.event_date.asc()).limit(limit)
    
    result = await db.execute(query)
    events = result.scalars().all()
    return events


@router.get("/events/admin", response_model=list[EventResponse], dependencies=[allow_editor_or_admin])
async def get_all_events_for_admin(
    db: AsyncSession = Depends(get_db)
):
    """
    Get all events (including drafts) for management panel.
    """
    query = select(Event).order_by(Event.event_date.asc())
    result = await db.execute(query)
    events = result.scalars().all()
    return events


@router.get("/events/{slug}", response_model=EventResponse)
async def get_event_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a single event by its slug.
    """
    query = select(Event).where(
        Event.slug == slug,
        Event.is_published == True
    )
    result = await db.execute(query)
    event = result.scalars().first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı.")
        
    return event


# ── CRUD news endpoints ────────────────────────────────────────────────
@router.post("/news", response_model=AutomatedNewsResponse, dependencies=[allow_editor_or_admin])
async def create_news(
    payload: AutomatedNewsCreate,
    db: AsyncSession = Depends(get_db)
):
    base_slug = slugify(payload.title)
    slug = base_slug
    existing = await db.execute(select(AutomatedNews).where(AutomatedNews.slug == slug))
    counter = 1
    while existing.scalars().first():
        slug = f"{base_slug}-{counter}"
        existing = await db.execute(select(AutomatedNews).where(AutomatedNews.slug == slug))
        counter += 1
        
    db_news = AutomatedNews(
        **payload.model_dump(exclude={"slug"}),
        slug=slug
    )
    db.add(db_news)
    await db.commit()
    await db.refresh(db_news)
    return db_news


@router.put("/news/{id}", response_model=AutomatedNewsResponse, dependencies=[allow_editor_or_admin])
async def update_news(
    id: str,
    payload: AutomatedNewsCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        from uuid import UUID
        uuid_id = UUID(id)
        query = select(AutomatedNews).where(AutomatedNews.id == uuid_id)
    except ValueError:
        query = select(AutomatedNews).where(AutomatedNews.id == id)
        
    result = await db.execute(query)
    db_news = result.scalars().first()
    if not db_news:
        raise HTTPException(status_code=404, detail="Haber bulunamadı.")
        
    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"] is None:
        data.pop("slug")
        
    for key, value in data.items():
        setattr(db_news, key, value)
        
    await db.commit()
    await db.refresh(db_news)
    return db_news


@router.delete("/news/{id}", dependencies=[allow_editor_or_admin])
async def delete_news(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        from uuid import UUID
        uuid_id = UUID(id)
        query = select(AutomatedNews).where(AutomatedNews.id == uuid_id)
    except ValueError:
        query = select(AutomatedNews).where(AutomatedNews.id == id)
        
    result = await db.execute(query)
    db_news = result.scalars().first()
    if not db_news:
        raise HTTPException(status_code=404, detail="Haber bulunamadı.")
        
    await db.delete(db_news)
    await db.commit()
    return {"message": "Haber başarıyla silindi."}


# ── CRUD announcements endpoints ───────────────────────────────────────
@router.post("/announcements", response_model=AnnouncementResponse, dependencies=[allow_editor_or_admin])
async def create_announcement(
    payload: AnnouncementCreate,
    db: AsyncSession = Depends(get_db)
):
    base_slug = slugify(payload.title)
    slug = base_slug
    existing = await db.execute(select(Announcement).where(Announcement.slug == slug))
    counter = 1
    while existing.scalars().first():
        slug = f"{base_slug}-{counter}"
        existing = await db.execute(select(Announcement).where(Announcement.slug == slug))
        counter += 1
        
    db_ann = Announcement(
        **payload.model_dump(exclude={"slug"}),
        slug=slug
    )
    db.add(db_ann)
    await db.commit()
    await db.refresh(db_ann)
    return db_ann


@router.put("/announcements/{id}", response_model=AnnouncementResponse, dependencies=[allow_editor_or_admin])
async def update_announcement(
    id: str,
    payload: AnnouncementCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        from uuid import UUID
        uuid_id = UUID(id)
        query = select(Announcement).where(Announcement.id == uuid_id)
    except ValueError:
        query = select(Announcement).where(Announcement.id == id)
        
    result = await db.execute(query)
    db_ann = result.scalars().first()
    if not db_ann:
        raise HTTPException(status_code=404, detail="Duyuru bulunamadı.")
        
    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"] is None:
        data.pop("slug")
        
    for key, value in data.items():
        setattr(db_ann, key, value)
        
    await db.commit()
    await db.refresh(db_ann)
    return db_ann


@router.delete("/announcements/{id}", dependencies=[allow_editor_or_admin])
async def delete_announcement(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        from uuid import UUID
        uuid_id = UUID(id)
        query = select(Announcement).where(Announcement.id == uuid_id)
    except ValueError:
        query = select(Announcement).where(Announcement.id == id)
        
    result = await db.execute(query)
    db_ann = result.scalars().first()
    if not db_ann:
        raise HTTPException(status_code=404, detail="Duyuru bulunamadı.")
        
    await db.delete(db_ann)
    await db.commit()
    return {"message": "Duyuru başarıyla silindi."}


# ── CRUD events endpoints ──────────────────────────────────────────────
@router.post("/events", response_model=EventResponse, dependencies=[allow_editor_or_admin])
async def create_event(
    payload: EventCreate,
    db: AsyncSession = Depends(get_db)
):
    base_slug = slugify(payload.title)
    slug = base_slug
    existing = await db.execute(select(Event).where(Event.slug == slug))
    counter = 1
    while existing.scalars().first():
        slug = f"{base_slug}-{counter}"
        existing = await db.execute(select(Event).where(Event.slug == slug))
        counter += 1
        
    db_event = Event(
        **payload.model_dump(exclude={"slug"}),
        slug=slug
    )
    db.add(db_event)
    await db.commit()
    await db.refresh(db_event)
    return db_event


@router.put("/events/{id}", response_model=EventResponse, dependencies=[allow_editor_or_admin])
async def update_event(
    id: str,
    payload: EventCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        from uuid import UUID
        uuid_id = UUID(id)
        query = select(Event).where(Event.id == uuid_id)
    except ValueError:
        query = select(Event).where(Event.id == id)
        
    result = await db.execute(query)
    db_event = result.scalars().first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı.")
        
    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"] is None:
        data.pop("slug")
        
    for key, value in data.items():
        setattr(db_event, key, value)
        
    await db.commit()
    await db.refresh(db_event)
    return db_event


@router.delete("/events/{id}", dependencies=[allow_editor_or_admin])
async def delete_event(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        from uuid import UUID
        uuid_id = UUID(id)
        query = select(Event).where(Event.id == uuid_id)
    except ValueError:
        query = select(Event).where(Event.id == id)
        
    result = await db.execute(query)
    db_event = result.scalars().first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı.")
        
    await db.delete(db_event)
    await db.commit()
    return {"message": "Etkinlik başarıyla silindi."}
