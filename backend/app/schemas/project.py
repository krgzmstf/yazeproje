from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.models.project import ProjectCategory, ProjectStatus, PhaseStatus


# ── Project Phase Schemas ──────────────────────────────────────────

class ProjectPhaseBase(BaseModel):
    name: str
    description: str | None = None
    status: PhaseStatus = PhaseStatus.NOT_STARTED
    progress_pct: int = 0
    sort_order: int = 0
    start_date: str | None = None
    end_date: str | None = None


class ProjectPhaseCreate(ProjectPhaseBase):
    pass


class ProjectPhaseResponse(ProjectPhaseBase):
    id: UUID
    project_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Architecture Project Schemas ───────────────────────────────────

class ArchitectureProjectBase(BaseModel):
    title: str
    slug: str | None = None
    description: str | None = None
    category: ProjectCategory
    status: ProjectStatus = ProjectStatus.DRAFT
    client_name: str | None = None
    location: str | None = None
    area_sqm: float | None = None
    budget_try: float | None = None
    start_date: str | None = None
    end_date: str | None = None
    cover_image_url: str | None = None
    gallery_urls: dict | None = None
    is_featured: bool = False
    is_published: bool = False
    sort_order: int = 0
    meta_title: str | None = None
    meta_description: str | None = None


class ArchitectureProjectCreate(ArchitectureProjectBase):
    pass


class ArchitectureProjectResponse(ArchitectureProjectBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    phases: list[ProjectPhaseResponse] = []

    model_config = ConfigDict(from_attributes=True)
