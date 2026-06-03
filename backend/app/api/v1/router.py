from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.api.v1.endpoints.projects import router as projects_router
from app.api.v1.endpoints.listings import router as listings_router
from app.api.v1.endpoints.content import router as content_router
from app.api.v1.endpoints.contact import router as contact_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.upload import router as upload_router
from app.api.v1.endpoints.settings import router as settings_router
from app.api.v1.endpoints.products import router as products_router

api_router = APIRouter()

# Health endpoints
api_router.include_router(health_router)

# Auth endpoints
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])

# Domain endpoints
api_router.include_router(projects_router, prefix="/projects", tags=["Projects"])
api_router.include_router(listings_router, prefix="/listings", tags=["Listings"])
api_router.include_router(content_router, tags=["Content"])
api_router.include_router(contact_router, tags=["Contact"])
api_router.include_router(upload_router, prefix="/upload", tags=["Upload"])
api_router.include_router(settings_router, prefix="/settings", tags=["Settings"])
api_router.include_router(products_router, prefix="/software", tags=["Software Products"])
