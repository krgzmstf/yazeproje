from fastapi import APIRouter, Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import decode_token, create_access_token, verify_password
from app.models.user import User, UserRole
from app.schemas.user import UserLogin, Token, UserResponse

router = APIRouter()
security_scheme = HTTPBearer()


# ── Dependency: Get Current User ──────────────────────────────────────
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Geçersiz yetkilendirme bilgisi (sub bulunamadı).",
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Oturum süresi dolmuş veya geçersiz token.",
        )
    
    import uuid
    try:
        uuid_user_id = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz kullanıcı ID formatı.",
        )
    
    # Query user from DB
    result = await db.execute(select(User).where(User.id == uuid_user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kullanıcı bulunamadı.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kullanıcı hesabı aktif değil.",
        )
    return user


# ── Dependency: Check Roles ───────────────────────────────────────────
class RoleChecker:
    def __init__(self, allowed_roles: list[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role == UserRole.ADMIN:
            return current_user  # Admin has access to all roles
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu işlemi gerçekleştirmek için yetkiniz yok.",
            )
        return current_user


# ── Endpoints ──────────────────────────────────────────────────────────
@router.post("/login", response_model=Token)
async def login(
    payload: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Login endpoint. Returns JWT access token and user info.
    """
    # Find user by email
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalars().first()
    
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-posta adresi veya şifre hatalı.",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hesabınız askıya alınmıştır.",
        )
        
    # Generate token
    access_token = create_access_token(
        subject=str(user.id),
        extra_claims={"role": user.role.value}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current logged in user details.
    """
    return current_user
