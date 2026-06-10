import os
import shutil
import datetime
import zipfile
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKUP_DIR = os.path.join(os.path.dirname(BASE_DIR), "backups")
DB_FILE = os.path.join(BASE_DIR, "yaze_local.db")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")

def create_backup():
    """Creates a zip backup of the database and uploads."""
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = f"yazesym_backup_{timestamp}.zip"
    backup_path = os.path.join(BACKUP_DIR, backup_name)

    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
        logger.info(f"Created backup directory at {BACKUP_DIR}")

    try:
        with zipfile.ZipFile(backup_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # 1. Backup Database
            if os.path.exists(DB_FILE):
                zipf.write(DB_FILE, os.path.basename(DB_FILE))
                logger.info(f"Added database to backup: {DB_FILE}")
            else:
                logger.warning(f"Database file not found: {DB_FILE}")

            # 2. Backup Uploads
            if os.path.exists(UPLOADS_DIR):
                for root, dirs, files in os.walk(UPLOADS_DIR):
                    for file in files:
                        file_abs_path = os.path.join(root, file)
                        # Store relative path in zip
                        arcname = os.path.relpath(file_abs_path, os.path.dirname(UPLOADS_DIR))
                        zipf.write(file_abs_path, arcname)
                logger.info(f"Added uploads to backup: {UPLOADS_DIR}")
            else:
                logger.warning(f"Uploads directory not found: {UPLOADS_DIR}")

        logger.info(f"Successfully created backup: {backup_path}")
        return backup_path

    except Exception as e:
        logger.error(f"Backup failed: {e}")
        return None

def cleanup_old_backups(keep=10):
    """Keeps only the most recent 'keep' backups."""
    try:
        backups = [os.path.join(BACKUP_DIR, f) for f in os.listdir(BACKUP_DIR) if f.endswith(".zip")]
        backups.sort(key=os.path.getmtime, reverse=True)

        if len(backups) > keep:
            for old_backup in backups[keep:]:
                os.remove(old_backup)
                logger.info(f"Removed old backup: {old_backup}")
    except Exception as e:
        logger.error(f"Cleanup failed: {e}")

if __name__ == "__main__":
    path = create_backup()
    if path:
        cleanup_old_backups()
