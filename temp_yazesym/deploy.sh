#!/bin/bash
# YazeSYM Production Deploy Script
# Contabo Sunucu: 13.140.130.122
# Domain: yazesym.yazeproje.com

set -e

echo "======================================"
echo "  YazeSYM Production Deploy"
echo "======================================"

# ─── 1. Sistem güncelle ve gerekli paketleri kur
echo "[1/8] Sistem güncelleniyor..."
apt-get update -qq
apt-get install -y -qq curl git nginx certbot python3-certbot-nginx ufw

# ─── 2. Docker kur (yoksa)
if ! command -v docker &> /dev/null; then
    echo "[2/8] Docker kuruluyor..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    echo "[2/8] Docker zaten kurulu: $(docker --version)"
fi

# Docker Compose kontrolü
if ! docker compose version &> /dev/null; then
    echo "Docker Compose eklentisi kuruluyor..."
    apt-get install -y docker-compose-plugin
fi

# ─── 3. Proje klasörünü oluştur
echo "[3/8] Proje dizini hazırlanıyor..."
mkdir -p /opt/yazesym
cd /opt/yazesym

# ─── 4. .env dosyasını kopyala
echo "[4/8] .env dosyası kontrol ediliyor..."
if [ ! -f .env ]; then
    if [ -f /root/deploy/.env.production ]; then
        cp /root/deploy/.env.production .env
        echo "  .env kopyalandı"
    else
        echo "  UYARI: .env.production bulunamadı!"
        echo "  /opt/yazesym/.env dosyasını manuel oluşturun"
    fi
fi

# ─── 5. Docker image'ları çek / build et
echo "[5/8] Docker image'lar hazırlanıyor..."
# GitHub'dan çekme (repo varsa):
# docker compose -f /root/deploy/docker-compose.prod.yml pull

# Lokal build (dosyalar sunucudaysa):
if [ -d /root/yazesym-src ]; then
    cd /root/yazesym-src
    docker build -t yazesym-backend:latest ./backend
    docker build -t yazesym-whatsapp:latest ./whatsapp-service
    cd /opt/yazesym
fi

# ─── 6. Docker Compose başlat
echo "[6/8] Servisler başlatılıyor..."
cp /root/deploy/docker-compose.prod.yml /opt/yazesym/docker-compose.yml
docker compose up -d --force-recreate

echo "  Servisler başlatıldı, 15 saniye bekleniyor..."
sleep 15
docker compose ps

# ─── 7. Nginx yapılandır
echo "[7/8] Nginx yapılandırılıyor..."
cp /root/deploy/nginx-yazesym.conf /etc/nginx/sites-available/yazesym.yazeproje.com
ln -sf /etc/nginx/sites-available/yazesym.yazeproje.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# ─── 8. SSL sertifikası al (DNS kaydı yapılmışsa)
echo "[8/8] SSL sertifikası alınıyor..."
echo "  NOT: yazesym.yazeproje.com DNS kaydı 13.140.130.122'ye işaret etmeli!"
certbot --nginx -d yazesym.yazeproje.com --non-interactive --agree-tos -m yazeproje@gmail.com || {
    echo "  SSL alınamadı - DNS kaydı henüz yayılmamış olabilir"
    echo "  Sonra tekrar çalıştırın: certbot --nginx -d yazesym.yazeproje.com"
}

# ─── Firewall
echo "Firewall ayarlanıyor..."
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable

echo ""
echo "======================================"
echo "  DEPLOY TAMAMLANDI!"
echo "======================================"
echo "  Backend: https://yazesym.yazeproje.com/api/v1"
echo "  Health:  https://yazesym.yazeproje.com/health"
echo "  Docs:    https://yazesym.yazeproje.com/docs"
echo ""
echo "  Loglar: docker compose logs -f backend"
echo "======================================"
