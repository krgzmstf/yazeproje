import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.contact import NewsletterSubscriber, SmsSubscriber
from app.schemas.contact import SubscriptionRequest

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/subscriptions", status_code=status.HTTP_201_CREATED)
async def subscribe(
    request: SubscriptionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Subscribe to newsletter (via email) and/or SMS notifications.
    Saves to local database and logs the subscription details.
    """
    if not request.email and not request.phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="En az bir e-posta veya telefon numarası girilmelidir."
        )
        
    responses = {}
    
    # ── Newsletter Subscription ──────────────────────────────────
    if request.email:
        query = select(NewsletterSubscriber).where(NewsletterSubscriber.email == request.email)
        result = await db.execute(query)
        subscriber = result.scalars().first()
        
        if subscriber:
            if not subscriber.is_active:
                subscriber.is_active = True
                subscriber.full_name = request.full_name or subscriber.full_name
                logger.info(f"Newsletter subscriber reactivated: {request.email}")
            responses["email"] = "E-posta kaydı zaten mevcut (güncellendi)."
        else:
            subscriber = NewsletterSubscriber(
                email=request.email,
                full_name=request.full_name,
                is_active=True,
                is_verified=False  # Verification set to false until email activation is integrated
            )
            db.add(subscriber)
            logger.info(f"New newsletter subscription saved: {request.email} (Name: {request.full_name})")
            responses["email"] = "E-posta bültenine başarıyla kaydolundu."

    # ── SMS Subscription ─────────────────────────────────────────
    if request.phone:
        query = select(SmsSubscriber).where(SmsSubscriber.phone == request.phone)
        result = await db.execute(query)
        subscriber = result.scalars().first()
        
        if subscriber:
            if not subscriber.is_active:
                subscriber.is_active = True
                subscriber.full_name = request.full_name or subscriber.full_name
                logger.info(f"SMS subscriber reactivated: {request.phone}")
            responses["sms"] = "SMS aboneliği zaten mevcut (güncellendi)."
        else:
            subscriber = SmsSubscriber(
                phone=request.phone,
                full_name=request.full_name,
                is_active=True,
                is_verified=False
            )
            db.add(subscriber)
            logger.info(f"New SMS subscription saved: {request.phone} (Name: {request.full_name})")
            responses["sms"] = "SMS bültenine başarıyla kaydolundu."
            
    await db.commit()
    return {
        "status": "success",
        "message": "Abonelik kaydı tamamlandı.",
        "details": responses
    }


# ── Contact Messages Endpoints ────────────────────────────────────────

from app.models.contact import ContactMessage, ContactMessageStatus
from app.schemas.contact import ContactMessageCreate, ContactMessageResponse
from app.models.user import UserRole
from app.api.v1.endpoints.auth import RoleChecker

allow_admin_or_editor = Depends(RoleChecker([UserRole.ADMIN, UserRole.EDITOR]))
allow_admin = Depends(RoleChecker([UserRole.ADMIN]))


@router.post("/contact-messages", status_code=status.HTTP_201_CREATED, response_model=ContactMessageResponse)
async def submit_contact_message(
    payload: ContactMessageCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Submit a contact / quote request message. Saves it to the database.
    """
    db_msg = ContactMessage(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        subject=payload.subject,
        message=payload.message,
        status=ContactMessageStatus.UNREAD
    )
    db.add(db_msg)
    await db.commit()
    await db.refresh(db_msg)
    return db_msg


@router.get("/contact-messages", response_model=list[ContactMessageResponse], dependencies=[allow_admin_or_editor])
async def get_contact_messages(
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all contact messages. Protected (Admin / Editor).
    """
    query = select(ContactMessage).order_by(ContactMessage.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.delete("/contact-messages/{id}", dependencies=[allow_admin])
async def delete_contact_message(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a contact message. Protected (Admin only).
    """
    from uuid import UUID
    try:
        uuid_id = UUID(id)
        query = select(ContactMessage).where(ContactMessage.id == uuid_id)
    except ValueError:
        query = select(ContactMessage).where(ContactMessage.id == id)
        
    result = await db.execute(query)
    msg = result.scalars().first()
    if not msg:
        raise HTTPException(status_code=404, detail="Mesaj bulunamadı.")
    
    await db.delete(msg)
    await db.commit()
    return {"message": "Mesaj başarıyla silindi."}

