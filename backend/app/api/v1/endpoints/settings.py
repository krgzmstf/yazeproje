# ──────────────────────────────────────────────────────────────────
# YAZE Proje API – Dynamic Site Settings Router
# ──────────────────────────────────────────────────────────────────
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Any, Dict

from app.core.database import get_db
from app.models.settings import SiteSetting
from app.models.user import UserRole
from app.api.v1.endpoints.auth import RoleChecker

router = APIRouter()
allow_admin = Depends(RoleChecker([UserRole.ADMIN]))


class SettingsBulkUpdate(BaseModel):
    settings: Dict[str, Any]


@router.get("/")
async def get_public_settings(db: AsyncSession = Depends(get_db)):
    """
    Get all public site settings as a flat key-value dictionary.
    Excludes private credentials and configurations.
    """
    try:
        result = await db.execute(select(SiteSetting).where(SiteSetting.is_public == True))
        settings_list = result.scalars().all()
        
        flat_settings = {}
        for item in settings_list:
            if item.value_json is not None:
                flat_settings[item.key] = item.value_json
            else:
                flat_settings[item.key] = item.value
        return flat_settings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ayarlar yüklenirken bir hata oluştu: {str(e)}"
        )


@router.get("/admin")
async def get_all_settings_for_admin(
    db: AsyncSession = Depends(get_db),
    _admin_user=allow_admin
):
    """
    Get all settings (including metadata like descriptions, groups) for the admin dashboard.
    """
    try:
        result = await db.execute(select(SiteSetting).order_by(SiteSetting.group, SiteSetting.key))
        return result.scalars().all()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ayarlar listelenirken hata oluştu: {str(e)}"
        )


@router.put("/bulk")
async def bulk_update_settings(
    payload: SettingsBulkUpdate,
    db: AsyncSession = Depends(get_db),
    _admin_user=allow_admin
):
    """
    Update multiple settings keys in a single transaction.
    Creates settings if they do not exist dynamically.
    """
    try:
        for key, val in payload.settings.items():
            result = await db.execute(select(SiteSetting).where(SiteSetting.key == key))
            setting = result.scalars().first()
            
            if not setting:
                # Dynamically create settings if they don't exist
                setting = SiteSetting(
                    key=key,
                    group="general",
                    is_public=True,
                    description=f"Dinamik ayar: {key}"
                )
                db.add(setting)
            
            # Determine if val is a JSON type or scalar
            if isinstance(val, (dict, list)):
                setting.value_json = val
                setting.value = None
            else:
                setting.value = str(val) if val is not None else None
                setting.value_json = None
                
        await db.commit()
        return {"status": "success", "message": "Ayarlar başarıyla kaydedildi."}
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ayarlar güncellenirken hata oluştu: {str(e)}"
        )
