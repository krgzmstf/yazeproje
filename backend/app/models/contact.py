"""
Contact, newsletter subscriber, and SMS subscriber models.
"""

import enum
import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, String, Text, Uuid as UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


# ── Contact Messages ─────────────────────────────────────────────

class ContactMessageStatus(str, enum.Enum):
    UNREAD = "unread"
    READ = "read"
    REPLIED = "replied"
    ARCHIVED = "archived"


class ContactMessage(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "contact_messages"

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    subject: Mapped[str] = mapped_column(String(300), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ContactMessageStatus] = mapped_column(
        Enum(ContactMessageStatus, name="contact_message_status"),
        default=ContactMessageStatus.UNREAD,
        nullable=False,
    )
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Relationships ────────────────────────────────────────────
    user: Mapped["User | None"] = relationship("User", back_populates="contact_messages")

    def __repr__(self) -> str:
        return f"<ContactMessage from={self.email} subject={self.subject[:30]}>"


# ── Newsletter Subscribers ───────────────────────────────────────

class NewsletterSubscriber(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "newsletter_subscribers"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verification_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    unsubscribe_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)

    def __repr__(self) -> str:
        return f"<NewsletterSubscriber {self.email}>"


# ── SMS Subscribers ──────────────────────────────────────────────

class SmsSubscriber(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "sms_subscribers"

    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verification_code: Mapped[str | None] = mapped_column(String(10), nullable=True)

    def __repr__(self) -> str:
        return f"<SmsSubscriber {self.phone}>"
