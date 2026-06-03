"""
User model – authentication, roles, profile info.
"""

import enum
import uuid

from sqlalchemy import Boolean, Enum, String, Text
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    ARCHITECT = "architect"
    AGENT = "agent"
    DEVELOPER = "developer"
    EDITOR = "editor"
    SUBSCRIBER = "subscriber"


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"),
        default=UserRole.SUBSCRIBER,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_login_ip: Mapped[str | None] = mapped_column(String(45), nullable=True)

    # ── Relationships ────────────────────────────────────────────
    comments: Mapped[list["Comment"]] = relationship(
        "Comment", back_populates="author", lazy="selectin"
    )
    contact_messages: Mapped[list["ContactMessage"]] = relationship(
        "ContactMessage", back_populates="user", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<User {self.email}>"
