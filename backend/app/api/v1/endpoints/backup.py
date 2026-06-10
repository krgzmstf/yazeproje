import gzip
import io
import os
import subprocess
import zipfile
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.api.v1.endpoints.auth import RoleChecker
from app.core.config import get_settings
from app.models.user import UserRole

router = APIRouter()
allow_admin = Depends(RoleChecker([UserRole.ADMIN]))
settings = get_settings()


@router.get("/database")
async def backup_database(_=allow_admin):
    """PostgreSQL dump → gzip sıkıştırılmış .sql.gz olarak indir (admin only)."""
    env = {**os.environ, "PGPASSWORD": settings.POSTGRES_PASSWORD}
    result = subprocess.run(
        [
            "pg_dump",
            "-h", settings.POSTGRES_HOST,
            "-U", settings.POSTGRES_USER,
            "-d", settings.POSTGRES_DB,
            "--no-password",
            "--clean",
            "--if-exists",
        ],
        capture_output=True,
        env=env,
        timeout=120,
    )
    if result.returncode != 0:
        raise HTTPException(500, detail=f"pg_dump hatası: {result.stderr.decode()[:500]}")

    compressed = gzip.compress(result.stdout, compresslevel=9)
    filename = f"yaze_db_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql.gz"
    return StreamingResponse(
        io.BytesIO(compressed),
        media_type="application/gzip",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/uploads")
async def backup_uploads(_=allow_admin):
    """Yüklenen dosyaları maksimum sıkıştırma ile .zip olarak indir (admin only)."""
    uploads_dir = "/app/uploads"
    buf = io.BytesIO()

    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for root, _, files in os.walk(uploads_dir):
            for fname in files:
                fpath = os.path.join(root, fname)
                arcname = os.path.relpath(fpath, uploads_dir)
                zf.write(fpath, arcname)

    buf.seek(0)
    filename = f"yaze_uploads_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/full")
async def backup_full(_=allow_admin):
    """Veritabanı + dosyaları tek .zip içinde indir (admin only)."""
    env = {**os.environ, "PGPASSWORD": settings.POSTGRES_PASSWORD}
    db_result = subprocess.run(
        [
            "pg_dump",
            "-h", settings.POSTGRES_HOST,
            "-U", settings.POSTGRES_USER,
            "-d", settings.POSTGRES_DB,
            "--no-password",
            "--clean",
            "--if-exists",
        ],
        capture_output=True,
        env=env,
        timeout=120,
    )
    if db_result.returncode != 0:
        raise HTTPException(500, detail=f"pg_dump hatası: {db_result.stderr.decode()[:500]}")

    buf = io.BytesIO()
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    uploads_dir = "/app/uploads"

    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        # Veritabanı dump
        zf.writestr(f"database/yaze_db_{ts}.sql", db_result.stdout)
        # Yüklenen dosyalar
        for root, _, files in os.walk(uploads_dir):
            for fname in files:
                fpath = os.path.join(root, fname)
                arcname = os.path.join("uploads", os.path.relpath(fpath, uploads_dir))
                zf.write(fpath, arcname)

    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=yaze_full_backup_{ts}.zip"},
    )


@router.get("/info")
async def backup_info(_=allow_admin):
    """Yedeklenecek içerik hakkında bilgi ver."""
    uploads_dir = "/app/uploads"
    file_count = 0
    total_size = 0
    for root, _, files in os.walk(uploads_dir):
        for fname in files:
            file_count += 1
            total_size += os.path.getsize(os.path.join(root, fname))

    return {
        "upload_file_count": file_count,
        "upload_total_mb": round(total_size / (1024 * 1024), 2),
        "database": settings.POSTGRES_DB,
    }
