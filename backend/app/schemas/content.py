from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.models.content import NewsSource


# ── Automated News ─────────────────────────────────────────────────

class AutomatedNewsBase(BaseModel):
    title: str
    slug: str | None = None
    source: NewsSource
    source_url: str | None = None
    summary: str | None = None
    content: str | None = None
    cover_image_url: str | None = None
    tags: dict | None = None
    is_published: bool = True
    is_featured: bool = False
    published_at: str | None = None
    view_count: int = 0


class AutomatedNewsCreate(AutomatedNewsBase):
    pass


class AutomatedNewsResponse(AutomatedNewsBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Announcement ───────────────────────────────────────────────────

class AnnouncementBase(BaseModel):
    title: str
    slug: str | None = None
    content: str | None = None
    cover_image_url: str | None = None
    is_published: bool = False
    is_pinned: bool = False
    published_at: str | None = None


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementResponse(AnnouncementBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Event ──────────────────────────────────────────────────────────

class EventBase(BaseModel):
    title: str
    slug: str | None = None
    description: str | None = None
    location: str | None = None
    event_date: str | None = None
    event_end_date: str | None = None
    cover_image_url: str | None = None
    registration_url: str | None = None
    is_published: bool = False
    is_featured: bool = False
    max_attendees: int | None = None
    current_attendees: int = 0


class EventCreate(EventBase):
    pass


class EventResponse(EventBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
