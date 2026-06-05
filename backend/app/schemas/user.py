from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from app.models.user import UserRole


class UserBase(BaseModel):
    email: str
    full_name: str
    phone: str | None = None
    avatar_url: str | None = None
    role: UserRole = UserRole.SUBSCRIBER
    is_active: bool = True
    is_verified: bool = False
    bio: str | None = None


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    sub: str | None = None
    role: str | None = None


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    password: str


class UserProfileUpdate(BaseModel):
    full_name: str
    email: str
    phone: str | None = None
    password: str | None = None


class EmailVerifyRequest(BaseModel):
    email: str
    code: str


class ResendVerifyRequest(BaseModel):
    email: str


