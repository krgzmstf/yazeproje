from fastapi import APIRouter, Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import decode_token, create_access_token, verify_password, hash_password
from app.models.user import User, UserRole
from app.schemas.user import UserLogin, Token, UserResponse, UserCreate, ForgotPasswordRequest, ResetPasswordRequest
from app.core.email import send_email

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


@router.post("/register", response_model=UserResponse)
async def register(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user with default SUBSCRIBER role.
    """
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var.",
        )
    
    # Create new user
    new_user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        phone=payload.phone,
        role=UserRole.SUBSCRIBER,
        is_active=True,
        is_verified=False
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Initiate password reset flow by sending an email.
    """
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalars().first()
    
    if user:
        from datetime import timedelta
        token = create_access_token(
            subject=user.email,
            expires_delta=timedelta(minutes=15),
            extra_claims={"type": "password_reset"}
        )
        reset_link = f"http://localhost:1001/dashboard/reset-password?token={token}"
        
        # HTML Email template
        html_content = f"""
        <html>
            <body style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                <h2 style="color: #0f172a;">YAZE PROJE Şifre Sıfırlama Talebi</h2>
                <p>Hesabınız için bir şifre sıfırlama talebinde bulundunuz.</p>
                <p>Şifrenizi sıfırlamak için lütfen aşağıdaki bağlantıya tıklayın. Bu bağlantı 15 dakika geçerlidir:</p>
                <p style="margin: 30px 0;">
                    <a href="{reset_link}" style="background-color: #d97706; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Şifremi Sıfırla</a>
                </p>
                <p>Düğmeye tıklayamıyorsanız aşağıdaki adresi tarayıcınıza kopyalayabilirsiniz:</p>
                <p style="background-color: #f1f5f9; padding: 10px; border-radius: 4px; word-break: break-all;">{reset_link}</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                <p style="font-size: 11px; color: #64748b;">Bu talebi siz yapmadıysanız lütfen bu e-postayı dikkate almayın.</p>
            </body>
        </html>
        """
        await send_email(user.email, "YAZE Proje - Şifre Sıfırlama Talebi", html_content)
        
    return {
        "status": "success",
        "message": "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi."
    }


@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify reset token and update the user password.
    """
    try:
        claims = decode_token(payload.token)
        email = claims.get("sub")
        token_type = claims.get("type")
        
        if not email or token_type != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Geçersiz şifre sıfırlama tokeni."
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş."
        )
        
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kullanıcı bulunamadı."
        )
        
    user.password_hash = hash_password(payload.password)
    await db.commit()
    
    return {
        "status": "success",
        "message": "Şifreniz başarıyla sıfırlandı."
    }
