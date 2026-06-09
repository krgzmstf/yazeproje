"""
YAZE Proje – Production Deploy Script
Sunucu: 13.140.130.122  /  Proje: /app/yazeproje/
"""

import os, stat, shutil, tempfile, pathlib, paramiko

# ── Bağlantı ──────────────────────────────────────────────────────────────────
HOST = "13.140.130.122"
USER = "root"
PASS = "Erdem231109Krgz"
REMOTE_PROJECT = "/app/yazeproje"
REMOTE_LEAD    = "/app/lead-system"

LOCAL_PROJECT  = r"D:\yazılım\yazeproje_live"
LOCAL_LEAD     = r"D:\yazılım\içerik\lead_system"


def connect():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=PASS, timeout=15)
    return client


def run(client, cmd, check=True):
    print(f"  $ {cmd}")
    _, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if out:
        print(f"    {out}")
    if err:
        print(f"    [stderr] {err}")
    return out


def upload_file(sftp, local_path, remote_path):
    """Tek dosyayı yükle; üst dizini otomatik oluştur."""
    remote_dir = "/".join(remote_path.split("/")[:-1])
    try:
        sftp.stat(remote_dir)
    except FileNotFoundError:
        # Recursive mkdir
        parts = remote_dir.split("/")
        current = ""
        for part in parts:
            if not part:
                continue
            current += "/" + part
            try:
                sftp.stat(current)
            except FileNotFoundError:
                sftp.mkdir(current)

    # Türkçe karakter içeren local_path varsa önce Temp'e kopyala
    safe_tmp = None
    if any(ord(c) > 127 for c in str(local_path)):
        safe_tmp = os.path.join(tempfile.gettempdir(), "yaze_deploy_" + pathlib.Path(local_path).name)
        shutil.copy2(local_path, safe_tmp)
        local_path = safe_tmp

    try:
        sftp.put(str(local_path), remote_path)
    finally:
        if safe_tmp and os.path.exists(safe_tmp):
            os.remove(safe_tmp)


def upload_dir(sftp, local_dir, remote_dir, skip=None):
    """Dizini recursive olarak yükle."""
    skip = skip or []
    for root, dirs, files in os.walk(local_dir):
        # Skip listesindeki dizinleri atla
        dirs[:] = [d for d in dirs if d not in skip]
        rel = os.path.relpath(root, local_dir).replace("\\", "/")
        remote_root = remote_dir if rel == "." else f"{remote_dir}/{rel}"
        for fname in files:
            local_file  = os.path.join(root, fname)
            remote_file = f"{remote_root}/{fname}"
            print(f"  upload: {remote_file}")
            upload_file(sftp, local_file, remote_file)


def main():
    print("=" * 60)
    print("YAZE PROJE DEPLOY")
    print("=" * 60)

    client = connect()
    sftp   = client.open_sftp()

    # ── 1. Lead System dosyaları ─────────────────────────────────
    print("\n[1/3] Lead System yükleniyor → /app/lead-system/")
    upload_dir(sftp, LOCAL_LEAD, REMOTE_LEAD, skip=["__pycache__", ".git", "venv", ".venv"])

    # ── 2. Yazeproje config dosyaları ────────────────────────────
    print("\n[2/3] Yazeproje config dosyaları yükleniyor...")
    files_to_upload = [
        (rf"{LOCAL_PROJECT}\nginx\nginx.prod.conf",     f"{REMOTE_PROJECT}/nginx/nginx.prod.conf"),
        (rf"{LOCAL_PROJECT}\docker-compose.prod.yml",   f"{REMOTE_PROJECT}/docker-compose.prod.yml"),
        (rf"{LOCAL_PROJECT}\docker-compose.yml",        f"{REMOTE_PROJECT}/docker-compose.yml"),
        (rf"{LOCAL_PROJECT}\frontend\app\dashboard\page.tsx",
         f"{REMOTE_PROJECT}/frontend/app/dashboard/page.tsx"),
        (rf"{LOCAL_PROJECT}\frontend\app\news\page.tsx",
         f"{REMOTE_PROJECT}/frontend/app/news/page.tsx"),
        (rf"{LOCAL_PROJECT}\frontend\components\sections\EventsSection.tsx",
         f"{REMOTE_PROJECT}/frontend/components/sections/EventsSection.tsx"),
        (rf"{LOCAL_PROJECT}\frontend\components\sections\NewsAggregation.tsx",
         f"{REMOTE_PROJECT}/frontend/components/sections/NewsAggregation.tsx"),
        (rf"{LOCAL_PROJECT}\frontend\components\sections\RealEstateCarousel.tsx",
         f"{REMOTE_PROJECT}/frontend/components/sections/RealEstateCarousel.tsx"),
        (rf"{LOCAL_PROJECT}\frontend\components\sections\FeaturedProjects.tsx",
         f"{REMOTE_PROJECT}/frontend/components/sections/FeaturedProjects.tsx"),
        (rf"{LOCAL_PROJECT}\frontend\components\sections\SubscriptionForm.tsx",
         f"{REMOTE_PROJECT}/frontend/components/sections/SubscriptionForm.tsx"),
        (rf"{LOCAL_PROJECT}\frontend\app\kvkk\page.tsx",
         f"{REMOTE_PROJECT}/frontend/app/kvkk/page.tsx"),
        (rf"{LOCAL_PROJECT}\frontend\app\listings\[slug]\page.tsx",
         f"{REMOTE_PROJECT}/frontend/app/listings/[slug]/page.tsx"),
        (rf"{LOCAL_PROJECT}\frontend\components\dashboard\SosyalMedyaPanel.tsx",
         f"{REMOTE_PROJECT}/frontend/components/dashboard/SosyalMedyaPanel.tsx"),
        (rf"{LOCAL_PROJECT}\frontend\package.json",
         f"{REMOTE_PROJECT}/frontend/package.json"),
    ]

    for local_f, remote_f in files_to_upload:
        if os.path.exists(local_f):
            print(f"  upload: {remote_f}")
            upload_file(sftp, local_f, remote_f)
        else:
            print(f"  skip (not found): {local_f}")

    # ── 3. Sunucuda container'ları yeniden başlat ────────────────
    print("\n[3/3] Container'lar yeniden başlatılıyor...")
    run(client, f"cd {REMOTE_PROJECT} && docker compose -f docker-compose.yml -f docker-compose.prod.yml pull lead-system 2>/dev/null || true")
    run(client, f"cd {REMOTE_PROJECT} && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --remove-orphans")
    run(client, f"cd {REMOTE_PROJECT} && docker compose -f docker-compose.yml -f docker-compose.prod.yml ps")

    sftp.close()
    client.close()

    print("\n✓ Deploy tamamlandı!")
    print("  Frontend değişiklikleri için git push yapılması gerekiyor (Vercel auto-deploy).")


if __name__ == "__main__":
    main()
