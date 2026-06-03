"""
Content models: AutomatedNews, Comment, Announcement, Event.
"""

import enum
import uuid

from sqlalchemy import (
    Boolean,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    DateTime,
)
from sqlalchemy import JSON as JSONB, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


# ── Automated News ───────────────────────────────────────────────

class NewsSource(str, enum.Enum):
    RESMI_GAZETE = "resmi_gazete"
    CSBE = "csbe"
    TMMOB = "tmmob"
    CUSTOM_RSS = "custom_rss"
    MANUAL = "manual"


class AutomatedNews(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "automated_news"

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    slug: Mapped[str] = mapped_column(String(550), unique=True, index=True, nullable=False)
    source: Mapped[NewsSource] = mapped_column(
        Enum(NewsSource, name="news_source"), nullable=False
    )
    source_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    cover_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    tags: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    published_at: Mapped[str | None] = mapped_column(String(30), nullable=True)
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    def __repr__(self) -> str:
        return f"<AutomatedNews {self.title[:50]}>"


# ── Comments ─────────────────────────────────────────────────────

class CommentStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SPAM = "spam"


class Comment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "comments"

    author_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("architecture_projects.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    news_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("automated_news.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("comments.id", ondelete="CASCADE"),
        nullable=True,
    )
    guest_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    guest_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[CommentStatus] = mapped_column(
        Enum(CommentStatus, name="comment_status"),
        default=CommentStatus.PENDING,
        nullable=False,
    )
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)

    # ── Relationships ────────────────────────────────────────────
    author: Mapped["User"] = relationship("User", back_populates="comments")
    project: Mapped["ArchitectureProject"] = relationship(
        "ArchitectureProject", back_populates="comments"
    )
    replies: Mapped[list["Comment"]] = relationship(
        "Comment", back_populates="parent", lazy="selectin"
    )
    parent: Mapped["Comment | None"] = relationship(
        "Comment", back_populates="replies", remote_side="Comment.id"
    )

    def __repr__(self) -> str:
        return f"<Comment {self.id}>"


# ── Announcements ────────────────────────────────────────────────

class Announcement(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "announcements"

    title: Mapped[str] = mapped_column(String(400), nullable=False)
    slug: Mapped[str] = mapped_column(String(450), unique=True, index=True, nullable=False)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    cover_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    published_at: Mapped[str | None] = mapped_column(String(30), nullable=True)

    def __repr__(self) -> str:
        return f"<Announcement {self.title}>"


# ── Events ───────────────────────────────────────────────────────

class Event(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "events"

    title: Mapped[str] = mapped_column(String(400), nullable=False)
    slug: Mapped[str] = mapped_column(String(450), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(500), nullable=True)
    event_date: Mapped[str | None] = mapped_column(String(30), nullable=True)
    event_end_date: Mapped[str | None] = mapped_column(String(30), nullable=True)
    cover_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    registration_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    max_attendees: Mapped[int | None] = mapped_column(Integer, nullable=True)
    current_attendees: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    def __repr__(self) -> str:
        return f"<Event {self.title}>"
