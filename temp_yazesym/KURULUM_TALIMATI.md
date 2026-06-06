# YazeSYM Sunucu Kurulum Talimatı
**Sunucu:** 13.140.130.122 (Contabo VPS)  
**Domain:** yazesym.yazeproje.com  
**SSH:** root@13.140.130.122 / Şifre: Erdem231109Krgz

---

## ADIM 1 — DNS Kaydı (Domaine bakıyorsa atla)

`yazeproje.com` domaininin DNS panelinde (nereye kayıtlıysa — GoDaddy, Cloudflare vs.):

| Tip | İsim | Değer | TTL |
|-----|------|-------|-----|
| A | yazesym | 13.140.130.122 | 300 |

DNS yayılması 5-30 dakika sürer.

---

## ADIM 2 — Sunucuya Bağlan

```bash
ssh root@13.140.130.122
# Şifre: Erdem231109Krgz
```

---

## ADIM 3 — Dosyaları Sunucuya Yükle

Bu `deploy/` klasörünü sunucuya yükle:

```bash
# Lokal makineden (Windows'ta Git Bash veya WSL ile):
scp -r deploy/ root@13.140.130.122:/root/deploy/

# Proje kaynak kodunu da yükle:
scp -r backend/ root@13.140.130.122:/root/yazesym-src/backend/
scp -r whatsapp-service/ root@13.140.130.122:/root/yazesym-src/whatsapp-service/
```

**VEYA GitHub'dan çek:**
```bash
# Sunucuda:
git clone https://github.com/KULLANICI/yazesym.git /root/yazesym-src
```

---

## ADIM 4 — .env Dosyasını Düzenle

```bash
nano /root/deploy/.env.production
```

Şu değerleri güncelle:
- `DB_PASSWORD` — güçlü bir şifre yaz
- `SECRET_KEY` — uzun rastgele string (en az 32 karakter)
- `SMTP_KULLANICI` — Gmail adresi
- `SMTP_SIFRE` — Gmail App Password

---

## ADIM 5 — Deploy Script'i Çalıştır

```bash
chmod +x /root/deploy/deploy.sh
bash /root/deploy/deploy.sh
```

Script otomatik olarak:
- Docker kurar
- Nginx kurar
- Servisleri başlatır
- SSL sertifikası alır (certbot)

---

## ADIM 6 — Frontend (Vercel)

1. **GitHub'a push et:** frontend/ klasörünü GitHub'a yükle
2. **Vercel.com** → "New Project" → GitHub repoyu seç → `/frontend` dizini
3. **Environment Variables** ekle:
   ```
   VITE_API_URL = https://yazesym.yazeproje.com/api/v1
   ```
4. Deploy et

---

## Kontrol Komutları

```bash
# Servis durumları
docker compose -f /opt/yazesym/docker-compose.yml ps

# Backend logları
docker compose -f /opt/yazesym/docker-compose.yml logs -f backend

# Nginx durumu
systemctl status nginx

# SSL yenile
certbot renew --dry-run
```

---

## Sorun Giderme

**Backend başlamıyorsa:**
```bash
docker compose -f /opt/yazesym/docker-compose.yml logs backend
```

**Nginx hata veriyorsa:**
```bash
nginx -t
journalctl -u nginx -n 50
```

**SSL alınamıyorsa (DNS henüz yayılmadı):**
```bash
# DNS yayıldıktan sonra tekrar dene:
certbot --nginx -d yazesym.yazeproje.com
```
