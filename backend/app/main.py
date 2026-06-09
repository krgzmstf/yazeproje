"""
YAZE Proje API – FastAPI application entry point.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis

from app.core.config import get_settings
from app.api.v1.router import api_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup / shutdown lifecycle hooks."""
    # ── Startup ──────────────────────────────────────────────────
    import logging
    logger = logging.getLogger(__name__)
    
    # Initialize Redis for Caching
    try:
        redis = aioredis.from_url(settings.REDIS_URL, encoding="utf8", decode_responses=True)
        FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
        logger.info("FastAPI Cache initialized with Redis.")
    except Exception as e:
        logger.error(f"Failed to initialize FastAPI Cache: {e}")

    try:
        from app.models.base import Base
        from app.core.database import engine, async_session_factory
        from app.core.seed import seed_database
        
        logger.info("Initializing database tables...")
        async with engine.begin() as conn:
            import app.models  # noqa: F401
            await conn.run_sync(Base.metadata.create_all)
            
        logger.info("Running database seeding...")
        async with async_session_factory() as session:
            await seed_database(session)
            
    except Exception as e:
        logger.error(f"Error during database startup initialization: {e}", exc_info=True)

    yield
    # ── Shutdown ─────────────────────────────────────────────────
    from app.core.database import engine
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "YAZE Yapı Mimarlık Mühendislik – Backend API.\n\n"
        "Architecture, construction, real estate, and engineering services platform."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ── CORS Middleware ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# ── Static Files (Uploads) ───────────────────────────────────────
from fastapi.staticfiles import StaticFiles
import os

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount(f"{settings.API_V1_PREFIX}/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ── Root ─────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "YAZE Proje API'ye hoş geldiniz!",
        "docs": "/docs",
        "version": settings.APP_VERSION,
    }
