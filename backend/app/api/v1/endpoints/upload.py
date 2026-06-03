# ──────────────────────────────────────────────────────────────────
# YAZE Proje API – Image Optimization & File Upload Router
# ──────────────────────────────────────────────────────────────────
import os
import uuid
import shutil
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request, status
from PIL import Image

from app.core.config import get_settings
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter()

# Allowed image extensions and mime types
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}
ALLOWED_IMAGE_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"}

# General file settings
MAX_FILE_SIZE_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


@router.post("/image", status_code=status.HTTP_201_CREATED)
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload and optimize an image:
    - Converts it to WebP format.
    - Compresses with quality=80.
    - Resizes down to max 1920px width if larger.
    - Saves it securely with a unique name.
    """
    # 1. Validate file extension
    _, ext = os.path.splitext(file.filename or "")
    ext = ext.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS or file.content_type not in ALLOWED_IMAGE_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Desteklenmeyen görsel formatı. İzin verilenler: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )

    # 2. Process image with Pillow
    try:
        # Read file into memory and open with Pillow
        image = Image.open(file.file)
        
        # Check size and resize if width > 1920px
        width, height = image.size
        if width > 1920:
            new_width = 1920
            new_height = int(height * (1920 / width))
            # Resampling using LANCZOS for high quality
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            logger.info(f"Resized image from {width}x{height} to {new_width}x{new_height}")

        # Ensure directory exists
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

        # Generate a unique secure filename with .webp extension
        filename = f"{uuid.uuid4().hex}.webp"
        file_path = os.path.join(settings.UPLOAD_DIR, filename)

        # Handle color modes (WebP supports RGB and RGBA)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGB")

        # Save with WebP compression (quality=80 is highly optimized)
        image.save(file_path, "WEBP", quality=80)
        logger.info(f"Saved optimized image to {file_path}")

        # Generate dynamic absolute URL
        # We parse the base_url from request to support dev/prod dynamically
        base_url = str(request.base_url).rstrip("/")
        # If running inside docker container proxied by Nginx, Nginx handles port 80/443. 
        # request.base_url might resolve to http://backend:8000 inside the internal network 
        # if proxy headers are not fully processed. 
        # But FastAPI with proxy headers (X-Forwarded-Host) or fallback to host header works.
        # To be safe, we return the relative path "/api/v1/uploads/{filename}" so the frontend 
        # can prepend its own API url, OR request.base_url.
        # Let's return both the absolute URL (based on request) and the relative path!
        # This gives the frontend total flexibility.
        relative_path = f"{settings.API_V1_PREFIX}/uploads/{filename}"
        absolute_url = f"{base_url}{relative_path}"

        return {
            "filename": filename,
            "relative_path": relative_path,
            "url": absolute_url,
            "original_name": file.filename,
            "size_saved": True
        }

    except Exception as e:
        logger.error(f"Image optimization/upload failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Görsel optimize edilirken ve kaydedilirken bir hata oluştu."
        )


@router.post("/file", status_code=status.HTTP_201_CREATED)
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a general file (documents, pdf, word, etc.):
    - Validates size limit.
    - Saves it securely.
    """
    # 1. Check file size limit
    # We read a chunk to determine size without loading entire file into memory
    size = 0
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0) # Reset to beginning

    if size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Dosya boyutu sınırı aşıldı. Maksimum: {settings.MAX_UPLOAD_SIZE_MB}MB"
        )

    try:
        # Secure unique filename
        _, ext = os.path.splitext(file.filename or "")
        filename = f"{uuid.uuid4().hex}{ext.lower()}"
        file_path = os.path.join(settings.UPLOAD_DIR, filename)

        # Ensure directory exists
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        logger.info(f"Saved file to {file_path}")

        base_url = str(request.base_url).rstrip("/")
        relative_path = f"{settings.API_V1_PREFIX}/uploads/{filename}"
        absolute_url = f"{base_url}{relative_path}"

        return {
            "filename": filename,
            "relative_path": relative_path,
            "url": absolute_url,
            "original_name": file.filename,
        }

    except Exception as e:
        logger.error(f"File upload failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Dosya sunucuya kaydedilirken bir hata oluştu."
        )
