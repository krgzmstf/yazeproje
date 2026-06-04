from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


# ── Newsletter Subscriber ──────────────────────────────────────────

class NewsletterSubscriberCreate(BaseModel):
    email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", description="E-posta adresi")
    full_name: str | None = None


class NewsletterSubscriberResponse(BaseModel):
    id: UUID
    email: str
    full_name: str | None = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── SMS Subscriber ─────────────────────────────────────────────────

class SmsSubscriberCreate(BaseModel):
    phone: str = Field(..., pattern=r"^\+?[0-9]{10,15}$", description="Telefon numarası (örn: 05321234567 veya +905321234567)")
    full_name: str | None = None


class SmsSubscriberResponse(BaseModel):
    id: UUID
    phone: str
    full_name: str | None = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Generic Subscription Response (Both combined for simple frontend use) ──

class SubscriptionRequest(BaseModel):
    email: str | None = Field(None, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    phone: str | None = Field(None, pattern=r"^\+?[0-9]{10,15}$")
    full_name: str | None = None


# ── Contact Message ────────────────────────────────────────────────

class ContactMessageCreate(BaseModel):
    full_name: str = Field(..., max_length=255)
    email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    phone: str | None = Field(None, pattern=r"^\+?[0-9]{10,15}$")
    subject: str = Field(..., max_length=300)
    message: str = Field(...)


class ContactMessageResponse(BaseModel):
    id: UUID
    full_name: str
    email: str
    phone: str | None
    subject: str
    message: str
    status: str
    ip_address: str | None
    admin_notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

