"""E-mail kategori ve öncelik tespiti."""

from __future__ import annotations
import re
from dataclasses import dataclass


# ── Kategoriler ───────────────────────────────────────────────────────────────

CATEGORIES = {
    "FATURA_ODEME":   "Fatura, ödeme bildirimi, banka ekstresi, vergi",
    "PROJE_IS":       "Müşteri talebi, proje teklifi, iş görüşmesi",
    "SOZLESME_HUKUK": "Sözleşme, imza, yasal bildirim, noter",
    "EKIP_ILETISIM":  "Takım içi yazışma, görev atama, durum güncellemesi",
    "TOPLANTI":       "Toplantı daveti, takvim etkinliği, randevu",
    "MUSTERI":        "Müşteri geri bildirimi, destek talebi, şikayet",
    "TEDARIKCI":      "Tedarikçi teklifi, sipariş onayı, kargo bildirimi",
    "BILDIRIM_OTO":   "Otomatik sistem bildirimi, uygulama uyarısı",
    "HABER_BULTEN":   "Abonelik maili, bülten, kampanya, reklam",
    "KISISEL":        "Kişisel yazışma, aile, arkadaş",
    "SPAM_PHISHING":  "İstenmeyen mail, şüpheli link, kimlik avı",
    "DIGER":          "Hiçbir kategoriye girmeyen mailler",
}

# ── Anahtar kelime eşleştirme ────────────────────────────────────────────────

_RULES: list[tuple[str, list[str]]] = [
    ("SPAM_PHISHING", [
        "kazandınız", "tebrikler ödül", "hemen tıkla", "şifrenizi doğrulayın",
        "hesabınız tehlikede", "winner", "lottery", "click here to claim",
        "urgent action required", "verify your account",
    ]),
    ("FATURA_ODEME", [
        "fatura", "invoice", "ödeme", "payment", "banka", "bank", "ekstre",
        "statement", "vergi", "tax", "receipt", "dekont", "tahsilat",
        "borç", "alacak", "iban",
    ]),
    ("SOZLESME_HUKUK", [
        "sözleşme", "contract", "agreement", "imza", "signature", "noter",
        "yasal", "legal", "dava", "mahkeme", "court", "bildirim",
    ]),
    ("TOPLANTI", [
        "toplantı", "meeting", "randevu", "appointment", "davet", "invite",
        "calendar", "takvim", "zoom", "teams", "google meet", "görüşme",
    ]),
    ("MUSTERI", [
        "müşteri", "client", "customer", "destek", "support", "şikayet",
        "complaint", "feedback", "geri bildirim", "talep", "request",
        "memnuniyet", "satisfaction",
    ]),
    ("TEDARIKCI", [
        "tedarikçi", "supplier", "vendor", "sipariş", "order", "kargo",
        "shipment", "delivery", "teslimat", "stok", "stock", "fiyat listesi",
    ]),
    ("PROJE_IS", [
        "proje", "project", "teklif", "proposal", "quote", "iş", "görev",
        "task", "deadline", "teslim tarihi", "milestone", "sprint",
    ]),
    ("EKIP_ILETISIM", [
        "ekip", "team", "departman", "department", "durum", "status",
        "güncelleme", "update", "atandı", "assigned", "tamamlandı", "done",
    ]),
    ("HABER_BULTEN", [
        "unsubscribe", "abonelikten", "bülten", "newsletter", "campaign",
        "kampanya", "duyuru", "announcement", "promosyon", "promotion",
        "haber", "news",
    ]),
    ("BILDIRIM_OTO", [
        "noreply", "no-reply", "donotreply", "do-not-reply",
        "otomatik", "automated", "system", "sistem", "alert", "uyarı",
        "notification", "bildirim",
    ]),
    ("KISISEL", [
        "sevgili", "merhaba", "selam", "nasılsın", "dear", "hi there",
        "hey", "hope you", "aile", "family",
    ]),
]

# ── Öncelik kuralları ────────────────────────────────────────────────────────

_HIGH_PRIORITY_KEYWORDS = [
    "acil", "urgent", "asap", "önemli", "kritik", "critical",
    "son tarih", "deadline", "son gün", "bugün", "today",
    "hemen", "immediately", "derhal",
]

_LOW_PRIORITY_CATEGORIES = {"HABER_BULTEN", "BILDIRIM_OTO", "SPAM_PHISHING"}


# ── Ana fonksiyonlar ─────────────────────────────────────────────────────────

@dataclass
class EmailResult:
    category: str
    priority: str        # YÜKSEK / ORTA / DÜŞÜK
    reply_needed: bool
    summary: str
    tags: list[str]


def categorize(subject: str, snippet: str, sender: str, headers: dict) -> EmailResult:
    text = f"{subject} {snippet} {sender}".lower()

    category = _detect_category(text, headers)
    priority = _detect_priority(text, category)
    reply_needed = _needs_reply(text, category)
    summary = _make_summary(subject, snippet)
    tags = _extract_tags(text, category)

    return EmailResult(
        category=category,
        priority=priority,
        reply_needed=reply_needed,
        summary=summary,
        tags=tags,
    )


_BILDIRIM_DOMAINS = [
    "@google.com", "@microsoft.com", "@azure.com", "@azuredevops.com",
    "@github.com", "@gitlab.com", "@jira.com", "@atlassian.com",
    "@slack.com", "@zoom.us", "@linkedin.com", "@twitter.com",
    "@facebook.com", "@instagram.com", "@apple.com", "@amazon.com",
    "@dropbox.com", "@notion.so", "@figma.com",
]

_KISISEL_ADDRESSES = [
    "krgzmstf@gmail.com", "msstfkrgz@gmail.com",
]


def _detect_category(text: str, headers: dict) -> str:
    # List-Unsubscribe header varsa → haber bülteni
    if headers.get("list-unsubscribe") or headers.get("list-id"):
        return "HABER_BULTEN"

    # Gönderici noreply mi?
    if re.search(r"no.?reply|do.?not.?reply", text):
        return "BILDIRIM_OTO"

    # Bilinen tech/servis domainleri → bildirim
    if any(domain in text for domain in _BILDIRIM_DOMAINS):
        return "BILDIRIM_OTO"

    # Kendi adresleri → kişisel
    if any(addr in text for addr in _KISISEL_ADDRESSES):
        return "KISISEL"

    # Anahtar kelime eşleştirme
    for category, keywords in _RULES:
        if any(kw in text for kw in keywords):
            return category

    return "DIGER"


def _detect_priority(text: str, category: str) -> str:
    if category in _LOW_PRIORITY_CATEGORIES:
        return "DÜŞÜK"
    if any(kw in text for kw in _HIGH_PRIORITY_KEYWORDS):
        return "YÜKSEK"
    if category in {"FATURA_ODEME", "SOZLESME_HUKUK", "MUSTERI"}:
        return "YÜKSEK"
    if category in {"PROJE_IS", "TOPLANTI", "EKIP_ILETISIM"}:
        return "ORTA"
    return "DÜŞÜK"


def _needs_reply(text: str, category: str) -> bool:
    no_reply_cats = {"HABER_BULTEN", "BILDIRIM_OTO", "SPAM_PHISHING"}
    if category in no_reply_cats:
        return False
    reply_keywords = [
        "yanıtlar mısınız", "geri dönebilir misiniz", "please reply",
        "let me know", "your feedback", "görüşünüzü", "onaylıyor musunuz",
        "please confirm", "confirm", "awaiting your response",
    ]
    return any(kw in text for kw in reply_keywords)


def _make_summary(subject: str, snippet: str) -> str:
    combined = f"{subject}. {snippet}".strip(". ")
    return combined[:200] if len(combined) > 200 else combined


def _extract_tags(text: str, category: str) -> list[str]:
    tags = [category.lower()]
    tag_map = {
        "fatura": "fatura", "invoice": "fatura",
        "sözleşme": "sözleşme", "contract": "sözleşme",
        "toplantı": "toplantı", "meeting": "toplantı",
        "proje": "proje", "project": "proje",
        "müşteri": "müşteri", "customer": "müşteri",
        "ödeme": "ödeme", "payment": "ödeme",
    }
    for keyword, tag in tag_map.items():
        if keyword in text and tag not in tags:
            tags.append(tag)
    return tags[:5]
