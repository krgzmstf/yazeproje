# 🏗️ YAZE Proje – yazeproje.com

**YAZE YAPI MİMARLIK MÜHENDİSLİK İNŞAAT TAAHHÜT SANAYİ VE TİCARET LİMİTED ŞİRKETİ**

Mimarlık, mühendislik, inşaat ve gayrimenkul hizmetleri sunan kurumsal web platformu.

---

## 📋 Proje Hakkında

YAZE Proje, şirketimizin tüm dijital ihtiyaçlarını karşılayan kapsamlı bir web platformudur:

- 🏠 **Mimari Projeler** – Tamamlanan ve devam eden proje portföyü
- 📰 **Otomatik Haber Sistemi** – Sektörel haberler ve mevzuat güncellemeleri
- 🏘️ **Gayrimenkul İlanları** – Satılık/kiralık emlak portföyü
- 📜 **Mevzuat Takibi** – İmar yönetmelikleri ve yapı kodları
- 💻 **Yazılım Ürünleri** – Mühendislik araçları ve yazılımlar
- 🛒 **E-Ticaret** – Ürün satışı ve sipariş yönetimi
- 📧 **İletişim & Bülten** – İletişim formları, e-posta ve SMS abonelik

---

## 🏢 Şirket Bilgileri

| Bilgi | Detay |
|-------|-------|
| **Şirket** | YAZE YAPI MİMARLIK MÜHENDİSLİK İNŞAAT TAAHHÜT SAN. VE TİC. LTD. ŞTİ. |
| **Adres** | Bahçelievler Mah. Cumhuriyet Cad. No:7/1, Gölbaşı, Ankara |
| **Telefon** | 0532 176 0432 |
| **E-posta** | ercang@yazeproje.com |
| **Web** | [yazeproje.com](https://yazeproje.com) |

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| **Backend** | Python 3.11, FastAPI, SQLAlchemy 2.0 (async), Pydantic v2 |
| **Veritabanı** | PostgreSQL 16, Redis 7 |
| **Frontend** | Next.js / React (planlanan) |
| **Altyapı** | Docker, Docker Compose, Nginx |
| **Kimlik Doğrulama** | JWT (python-jose), bcrypt |
| **E-posta** | aiosmtplib |
| **SMS** | Netgsm API |

---

## 📁 Proje Yapısı

```
yazeproje/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── health.py       # Sağlık kontrol endpointleri
│   │   ├── core/
│   │   │   ├── config.py           # Uygulama ayarları
│   │   │   ├── database.py         # Async SQLAlchemy bağlantısı
│   │   │   └── security.py         # JWT ve şifre yardımcıları
│   │   ├── models/
│   │   │   ├── base.py             # Temel model ve mixinler
│   │   │   ├── user.py             # Kullanıcı modeli
│   │   │   ├── project.py          # Mimari proje modelleri
│   │   │   ├── regulation.py       # Mevzuat modeli
│   │   │   ├── real_estate.py      # Gayrimenkul modelleri
│   │   │   ├── content.py          # Haber, yorum, duyuru, etkinlik
│   │   │   ├── product.py          # Yazılım ve fiziksel ürünler
│   │   │   ├── contact.py          # İletişim ve abonelik modelleri
│   │   │   ├── scraper.py          # Scraper log modeli
│   │   │   ├── settings.py         # Site ayarları ve menü
│   │   │   └── order.py            # Sipariş ve ödeme modelleri
│   │   └── main.py                 # FastAPI uygulama giriş noktası
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── nginx/
│   └── nginx.conf                  # Reverse proxy yapılandırması
├── docker-compose.yml              # Geliştirme ortamı
├── docker-compose.prod.yml         # Üretim ortamı geçersiz kılmaları
├── .gitignore
└── README.md
```

---

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Docker ve Docker Compose
- Git

### Kurulum

```bash
# 1. Depoyu klonlayın
git clone https://github.com/yazeproje/yazeproje.com.git
cd yazeproje

# 2. Ortam değişkenlerini ayarlayın
cp backend/.env.example backend/.env
# .env dosyasını düzenleyin ve gerçek değerleri girin

# 3. Geliştirme ortamını başlatın
docker compose up -d

# 4. API'yi kontrol edin
curl http://localhost:8000/api/v1/health
```

### Üretim Dağıtımı

```bash
# Üretim ortamı
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 📡 API Endpointleri

| Yöntem | Yol | Açıklama |
|--------|-----|----------|
| GET | `/` | API karşılama mesajı |
| GET | `/docs` | Swagger UI dökümantasyonu |
| GET | `/redoc` | ReDoc dökümantasyonu |
| GET | `/api/v1/health` | Sağlık kontrolü |
| GET | `/api/v1/health/db` | Veritabanı bağlantı kontrolü |

---

## 🗄️ Veritabanı Tabloları

- `users` – Kullanıcılar ve roller
- `architecture_projects` – Mimari projeler
- `project_phases` – Proje aşamaları
- `regulations` – Mevzuat ve yönetmelikler
- `real_estate_listings` – Gayrimenkul ilanları
- `scraped_market_leads` – Pazar araştırma verileri
- `automated_news` – Otomatik haberler
- `comments` – Yorumlar (iç içe)
- `announcements` – Duyurular
- `events` – Etkinlikler
- `software_products` – Yazılım ürünleri
- `products_for_sale` – Satılık ürünler
- `orders` – Siparişler
- `order_items` – Sipariş kalemleri
- `payment_transactions` – Ödeme işlemleri
- `contact_messages` – İletişim mesajları
- `newsletter_subscribers` – E-posta aboneleri
- `sms_subscribers` – SMS aboneleri
- `scraper_logs` – Scraper çalışma kayıtları
- `site_settings` – Site ayarları
- `quick_menu_items` – Hızlı menü öğeleri

---

## 📄 Lisans

Bu proje özeldir. Tüm hakları saklıdır. © 2026 YAZE YAPI MİMARLIK MÜHENDİSLİK
