# Email Agent — Çalışma Kuralları ve Kategorilendirme Rehberi

## 1. Genel Çalışma Akışı

```
Gmail API bağlantısı
        ↓
Gelen kutusu tarama (son N gün veya tümü)
        ↓
Her mail için kategori tespiti
        ↓
Google Sheets'e satır olarak kayıt
        ↓
Özet rapor
```

---

## 2. Gmail Bağlantısı İçin Gereksinimler

- **Google Cloud Console** üzerinde bir proje oluşturulmalı
- `gmail.readonly` OAuth 2.0 scope'u etkinleştirilmeli
- `credentials.json` dosyası alınmalı ve güvenli saklanmalı
- İlk çalıştırmada tarayıcı üzerinden yetkilendirme yapılmalı (`token.json` üretilir)
- Google Sheets yazma için ek scope: `spreadsheets` (okuma/yazma)

---

## 3. E-Mail Kategorileri

Her mail aşağıdaki kategorilerden **birine** atanır:

| Kategori | Açıklama | Örnek |
|----------|----------|-------|
| `İŞ` | İş teklifleri, proje talepleri, müşteri yazışmaları | "Fiyat teklifi istiyorum..." |
| `FİNANS` | Fatura, ödeme, banka bildirimi, vergi | "Faturanız hazır...", "Hesap ekstresi" |
| `HABER_BÜLTENİ` | Abonelik, kampanya, duyuru maylleri | Unsubscribe linki içerenler |
| `KİŞİSEL` | Aile, arkadaş, bireysel yazışmalar | Tanınan kişilerden gelen |
| `BİLDİRİM` | Sistem bildirimleri, otomatik mailler | "Şifreniz değiştirildi", "Giriş yapıldı" |
| `TOPLANTI` | Takvim davetleri, meeting talepleri | Google Calendar invite |
| `DESTEK` | Müşteri desteği, ticket, şikayet | Helpdesk, Zendesk mailleri |
| `SPAM` | İstenmeyen, şüpheli mailler | Bilmediğiniz kaynaklardan |
| `ARŞIV` | Önemsiz, bilgi amaçlı eski mailler | Receipt, onay mailleri |
| `DİĞER` | Hiçbir kategoriye girmeyen | — |

---

## 4. Her Mail İçin Toplanacak Alanlar (Google Sheets Sütunları)

| Sütun | Açıklama |
|-------|----------|
| `Tarih` | Mail gönderim tarihi (GG.AA.YYYY SS:DD) |
| `Gönderen` | Gönderici adı ve e-posta adresi |
| `Konu` | Mail konusu (Subject) |
| `Kategori` | Yukarıdaki kategorilerden biri |
| `Öncelik` | YÜKSEK / ORTA / DÜŞÜK |
| `Okundu mu?` | EVET / HAYIR |
| `Yanıt Gerekli mi?` | EVET / HAYIR |
| `Özet` | 1-2 cümlelik otomatik özet |
| `Etiketler` | Ek anahtar kelimeler (virgülle ayrılmış) |
| `Mail ID` | Gmail benzersiz ID (tekrar kayıt önlemek için) |

---

## 5. Öncelik Belirleme Kuralları

### YÜKSEK Öncelik
- Gönderici doğrudan adınızla hitap ediyor
- Konu "acil", "urgent", "önemli", "ASAP" içeriyor
- Yanıt için son tarih belirtilmiş
- Fatura veya ödeme gecikmesi bildirimi
- Müşteriden gelen ilk temas maili

### ORTA Öncelik
- İş ile ilgili ancak acil olmayan yazışmalar
- Toplantı davetleri
- Proje güncelleme mailleri

### DÜŞÜK Öncelik
- Haber bültenleri ve abonelikler
- Otomatik bildirimler
- Okundu bilgisi / teşekkür mailleri
- 30 günden eski mailler

---

## 6. Dikkat Edilecek Noktalar

### Güvenlik
- `credentials.json` ve `token.json` dosyaları **asla git'e eklenmemeli** (.gitignore)
- OAuth token'ı sadece yerel makinede saklanmalı
- Mailler hiçbir zaman üçüncü taraf servise gönderilmemeli

### Veri Kalitesi
- Aynı mail iki kez kaydedilmemeli → `Mail ID` sütunu ile kontrol
- Gönderici adresi `@` ile doğrulanmalı
- Boş konu satırı varsa `(Konusuz)` yazılmalı
- Çok uzun özetler 200 karakterle kısıtlanmalı

### Kategori Tespiti
- Konu satırı + ilk 500 karakter içerik birlikte analiz edilmeli
- `noreply@`, `no-reply@`, `donotreply@` → otomatik BİLDİRİM veya HABER_BÜLTENİ
- `List-Unsubscribe` header'ı varsa → HABER_BÜLTENİ
- Ek (attachment) varsa öncelik bir adım yükseltilmeli

---

## 7. Google Sheets Yapısı

**Sheet adı:** `Email Kategorileri`

**Satır 1:** Başlık satırı (sabit, dondurul)

**Sekme önerisi:**
- `Gelen Kutusu` — tüm mailler
- `Yanıt Bekleyenler` — Yanıt Gerekli = EVET olanlar
- `Finans` — FİNANS kategorisindekiler
- `Arşiv` — ARŞIV ve SPAM

---

## 8. Çalıştırma Sıklığı Önerisi

| Senaryo | Sıklık |
|---------|--------|
| İlk kurulum | Tüm geçmiş taranır |
| Günlük rutin | Her sabah 08:00 (son 24 saat) |
| Acil kontrol | İsteğe bağlı, son 1 saat |

---

## 9. Yapılacaklar Listesi (Kurulum için)

- [ ] Google Cloud Console'da proje aç
- [ ] Gmail API + Google Sheets API etkinleştir
- [ ] OAuth 2.0 credentials indir → `credentials.json`
- [ ] Python bağımlılıklarını kur: `google-auth`, `google-api-python-client`, `gspread`
- [ ] Google Sheet oluştur ve Sheet ID'yi kaydet
- [ ] İlk çalıştırmayla yetkilendirme yap
- [ ] Kategori kurallarını test et (10-20 mail üzerinde)
- [ ] Otomasyonu kur (Windows Task Scheduler veya cron)
