"""
Architecture project and project phase models.
"""

import enum
import uuid

from sqlalchemy import (
    Boolean,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy import JSON as JSONB, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ProjectStatus(str, enum.Enum):
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"


class ProjectCategory(str, enum.Enum):
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"
    INDUSTRIAL = "industrial"
    INFRASTRUCTURE = "infrastructure"
    RENOVATION = "renovation"
    URBAN_PLANNING = "urban_planning"
    INTERIOR_DESIGN = "interior_design"
    LANDSCAPE = "landscape"


class ArchitectureProject(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "architecture_projects"

    title: Mapped[str] = mapped_column(String(300), nullable=False)
    slug: Mapped[str] = mapped_column(String(350), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[ProjectCategory] = mapped_column(
        Enum(ProjectCategory, name="project_category"), nullable=False
    )
    status: Mapped[ProjectStatus] = mapped_column(
        Enum(ProjectStatus, name="project_status"),
        default=ProjectStatus.DRAFT,
        nullable=False,
    )
    client_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    location: Mapped[str | None] = mapped_column(String(500), nullable=True)
    area_sqm: Mapped[float | None] = mapped_column(Float, nullable=True)
    budget_try: Mapped[float | None] = mapped_column(Float, nullable=True)
    start_date: Mapped[str | None] = mapped_column(String(10), nullable=True)
    end_date: Mapped[str | None] = mapped_column(String(10), nullable=True)
    cover_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    gallery_urls: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    meta_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    meta_description: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # ── Relationships ────────────────────────────────────────────
    phases: Mapped[list["ProjectPhase"]] = relationship(
        "ProjectPhase", back_populates="project", cascade="all, delete-orphan", lazy="selectin"
    )
    comments: Mapped[list["Comment"]] = relationship(
        "Comment",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="selectin",
        foreign_keys="Comment.project_id",
    )

    def __repr__(self) -> str:
        return f"<ArchitectureProject {self.title}>"


class PhaseStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DELAYED = "delayed"


class ProjectPhase(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "project_phases"

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("architecture_projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[PhaseStatus] = mapped_column(
        Enum(PhaseStatus, name="phase_status"),
        default=PhaseStatus.NOT_STARTED,
        nullable=False,
    )
    progress_pct: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    start_date: Mapped[str | None] = mapped_column(String(10), nullable=True)
    end_date: Mapped[str | None] = mapped_column(String(10), nullable=True)

    # ── Relationships ────────────────────────────────────────────
    project: Mapped["ArchitectureProject"] = relationship(
        "ArchitectureProject", back_populates="phases"
    )

    def __repr__(self) -> str:
        return f"<ProjectPhase {self.name}>"
