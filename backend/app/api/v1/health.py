"""
Health check endpoint.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Health check")
async def health_check():
    """Basic health check – confirms the API is running."""
    return {"status": "healthy", "service": "yaze-api"}


@router.get("/health/db", summary="Database health check")
async def health_check_db(db: AsyncSession = Depends(get_db)):
    """
    Extended health check – verifies database connectivity.
    """
    try:
        result = await db.execute(text("SELECT 1"))
        result.scalar()
        return {"status": "healthy", "database": "connected"}
    except Exception as exc:
        return {"status": "unhealthy", "database": str(exc)}
