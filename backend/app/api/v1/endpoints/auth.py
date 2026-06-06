from fastapi import APIRouter, Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import decode_token, create_access_token, verify_password, hash_password
from app.models.user import User, UserRole
from app.schemas.user import (
    UserLogin, Token, UserResponse, UserCreate,
    ForgotPasswordRequest, ResetPasswordRequest, UserProfileUpdate,
    EmailVerifyRequest, ResendVerifyRequest, UserRoleUpdate, UserStatusUpdate
)
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
        
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hesabınız doğrulanmamıştır. Lütfen e-postanıza gönderilen doğrulama kodunu girerek hesabınızı aktifleştirin.",
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


@router.put("/me", response_model=UserResponse)
async def update_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update the current logged in user details (name, email, phone, password).
    """
    # Check if email is changing and is already in use
    if payload.email.lower() != current_user.email.lower():
        result = await db.execute(select(User).where(User.email == payload.email))
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var.",
            )
        current_user.email = payload.email.lower()

    current_user.full_name = payload.full_name
    current_user.phone = payload.phone
    
    if payload.password:
        validate_password_strength(payload.password)
        current_user.password_hash = hash_password(payload.password)
        
    await db.commit()
    await db.refresh(current_user)
    return current_user



def validate_password_strength(password: str) -> None:
    # 1. Length check
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Şifre en az 8 karakter uzunluğunda olmalıdır.",
        )
    # 2. Case checks (uppercase & lowercase)
    import re
    if not re.search(r"[a-z]", password) or not re.search(r"[A-Z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Şifre hem büyük hem küçük harf içermelidir.",
        )
    # 3. Digit check
    if not re.search(r"\d", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Şifre en az bir rakam içermelidir.",
        )
    # 4. Special character check
    if not re.search(r"[!@#$%^&*()_+={}\[\]|\\:;\"'<>,.?/~`-]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Şifre en az bir özel karakter içermelidir.",
        )
    # 5. zxcvbn score check
    import zxcvbn
    res = zxcvbn.zxcvbn(password)
    score = res.get("score", 0)
    if score < 3:
        feedback = res.get("feedback", {})
        warning = feedback.get("warning", "")
        suggestions = feedback.get("suggestions", [])
        
        msg = "Şifreniz tahmin edilebilir/zayıf bulundu. Lütfen daha karmaşık bir şifre seçin."
        if warning:
            msg += f" (Uyarı: {warning})"
        if suggestions:
            msg += f" Öneriler: {', '.join(suggestions)}"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg,
        )


@router.post("/register", response_model=UserResponse)
async def register(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user with default SUBSCRIBER role and send email verification code.
    """
    validate_password_strength(payload.password)
    import secrets
    from datetime import datetime, timedelta, timezone

    # Generate 6-digit random code
    verification_code = f"{secrets.randbelow(900000) + 100000}"
    verification_code_expires_at = datetime.utcnow() + timedelta(minutes=15)

    # Check if user already exists
    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    existing_user = result.scalars().first()
    
    if existing_user:
        if existing_user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var.",
            )
        else:
            # Overwrite unverified user registration details to allow re-registration
            existing_user.full_name = payload.full_name
            existing_user.password_hash = hash_password(payload.password)
            existing_user.phone = payload.phone
            existing_user.verification_code = verification_code
            existing_user.verification_code_expires_at = verification_code_expires_at
            existing_user.verification_attempts = 0
            user_to_send = existing_user
    else:
        # Create new user
        new_user = User(
            email=payload.email.lower(),
            password_hash=hash_password(payload.password),
            full_name=payload.full_name,
            phone=payload.phone,
            role=UserRole.SUBSCRIBER,
            is_active=True,
            is_verified=False,
            verification_code=verification_code,
            verification_code_expires_at=verification_code_expires_at,
            verification_attempts=0
        )
        db.add(new_user)
        user_to_send = new_user

    await db.commit()
    await db.refresh(user_to_send)

    # Send verification email
    html_content = f"""
    <html>
        <body style="font-family: sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                <h2 style="color: #0f172a; text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-top: 0;">YAZE PROJE</h2>
                <p style="font-size: 16px; line-height: 1.6;">Merhaba <strong>{user_to_send.full_name}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6;">YAZE Proje platformuna kayıt olduğunuz için teşekkür ederiz. Kayıt işleminizi tamamlamak için lütfen aşağıdaki 6 haneli doğrulama kodunu kullanın:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #d97706; background-color: #fef3c7; padding: 15px 30px; border-radius: 8px; border: 1px solid #fde68a;">
                        {verification_code}
                    </span>
                </div>
                <p style="font-size: 14px; color: #64748b; text-align: center;">Bu kod <strong>15 dakika</strong> geçerlidir. Güvenliğiniz için bu kodu kimseyle paylaşmayın.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                <p style="font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
                    Bu e-posta YAZE Proje kayıt doğrulaması için gönderilmiştir. Kayıt işlemini siz başlatmadıysanız lütfen bu e-postayı dikkate almayın.
                </p>
            </div>
        </body>
    </html>
    """
    
    email_sent = await send_email(user_to_send.email, "YAZE Proje - E-posta Doğrulama Kodu", html_content)
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Doğrulama kodu e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.",
        )

    return user_to_send


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
    validate_password_strength(payload.password)
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


@router.post("/verify-email")
async def verify_email(
    payload: EmailVerifyRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify a user's email using the 6-digit code sent.
    """
    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kullanıcı bulunamadı.",
        )
        
    if user.is_verified:
        return {
            "status": "success",
            "message": "E-posta adresi zaten doğrulanmış."
        }
        
    # Check brute-force attempts
    if user.verification_attempts >= 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Çok fazla başarısız deneme gerçekleştirdiniz. Lütfen yeni bir doğrulama kodu talep edin.",
        )
        
    # Increment attempts
    user.verification_attempts += 1
    await db.commit()
    
    # Check expiry
    from datetime import datetime
    now = datetime.utcnow()
    
    expires_at = user.verification_code_expires_at
        
    if not user.verification_code or expires_at < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doğrulama kodunun süresi dolmuş veya kod geçersiz. Lütfen yeni bir kod isteyin.",
        )
        
    if user.verification_code != payload.code:
        if user.verification_attempts >= 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Doğrulama kodu hatalı. 3 başarısız deneme sınırı aşıldı. Lütfen yeni bir kod isteyin.",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Doğrulama kodu hatalı. Kalan deneme hakkı: {3 - user.verification_attempts}",
        )
        
    # Verification successful!
    user.is_verified = True
    user.verification_code = None
    user.verification_code_expires_at = None
    user.verification_attempts = 0
    await db.commit()
    
    return {
        "status": "success",
        "message": "E-posta adresiniz başarıyla doğrulandı. Artık giriş yapabilirsiniz."
    }


@router.post("/resend-verification")
async def resend_verification(
    payload: ResendVerifyRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Resend verification email to an unverified user.
    """
    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kullanıcı bulunamadı.",
        )
        
    if user.is_verified:
        return {
            "status": "success",
            "message": "E-posta adresi zaten doğrulanmış."
        }
        
    import secrets
    from datetime import datetime, timedelta, timezone
    
    # Generate new code
    verification_code = f"{secrets.randbelow(900000) + 100000}"
    verification_code_expires_at = datetime.utcnow() + timedelta(minutes=15)
    
    user.verification_code = verification_code
    user.verification_code_expires_at = verification_code_expires_at
    user.verification_attempts = 0
    
    await db.commit()
    
    # HTML Email template
    html_content = f"""
    <html>
        <body style="font-family: sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                <h2 style="color: #0f172a; text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-top: 0;">YAZE PROJE</h2>
                <p style="font-size: 16px; line-height: 1.6;">Merhaba <strong>{user.full_name}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6;">Hesap doğrulaması için talep ettiğiniz yeni 6 haneli doğrulama kodunuz:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #d97706; background-color: #fef3c7; padding: 15px 30px; border-radius: 8px; border: 1px solid #fde68a;">
                        {verification_code}
                    </span>
                </div>
                <p style="font-size: 14px; color: #64748b; text-align: center;">Bu kod <strong>15 dakika</strong> geçerlidir. Güvenliğiniz için bu kodu kimseyle paylaşmayın.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                <p style="font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
                    Bu e-posta YAZE Proje kayıt doğrulaması için gönderilmiştir. Kayıt işlemini siz başlatmadıysanız lütfen bu e-postayı dikkate almayın.
                </p>
            </div>
        </body>
    </html>
    """
    
    email_sent = await send_email(user.email, "YAZE Proje - Yeni Doğrulama Kodu", html_content)
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Doğrulama kodu e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.",
        )
        
    return {
        "status": "success",
        "message": "Doğrulama kodu e-posta adresinize tekrar gönderildi."
    }


# ── Admin User Management Endpoints ────────────────────────────────────

@router.get("/users", response_model=list[UserResponse])
async def list_users(
    current_user: User = Depends(RoleChecker([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    """
    List all users in the system. Protected (Admin only).
    """
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()


@router.put("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    payload: UserRoleUpdate,
    current_user: User = Depends(RoleChecker([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a user's role. Protected (Admin only).
    """
    import uuid
    try:
        uuid_id = uuid.UUID(user_id)
        query = select(User).where(User.id == uuid_id)
    except ValueError:
        query = select(User).where(User.id == user_id)

    result = await db.execute(query)
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kullanıcı bulunamadı."
        )

    # Prevent admin from changing their own role to prevent lockout
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kendi rolünüzü değiştiremezsiniz."
        )

    user.role = payload.role
    await db.commit()
    await db.refresh(user)
    return user


@router.put("/users/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: str,
    payload: UserStatusUpdate,
    current_user: User = Depends(RoleChecker([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a user's active status. Protected (Admin only).
    """
    import uuid
    try:
        uuid_id = uuid.UUID(user_id)
        query = select(User).where(User.id == uuid_id)
    except ValueError:
        query = select(User).where(User.id == user_id)

    result = await db.execute(query)
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kullanıcı bulunamadı."
        )

    # Prevent admin from suspending themselves
    if user.id == current_user.id and not payload.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kendi hesabınızı askıya alamazsınız."
        )

    user.is_active = payload.is_active
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(RoleChecker([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a user from the system. Protected (Admin only).
    """
    import uuid
    try:
        uuid_id = uuid.UUID(user_id)
        query = select(User).where(User.id == uuid_id)
    except ValueError:
        query = select(User).where(User.id == user_id)

    result = await db.execute(query)
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kullanıcı bulunamadı."
        )

    # Prevent admin from deleting themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kendi hesabınızı silemezsiniz."
        )

    await db.delete(user)
    await db.commit()
    return {"message": "Kullanıcı başarıyla silindi."}
