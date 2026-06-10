from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential

from app.core.config import get_settings


def _get_client() -> ChatCompletionsClient:
    settings = get_settings()
    return ChatCompletionsClient(
        endpoint=settings.AI_ENDPOINT,
        credential=AzureKeyCredential(settings.GITHUB_TOKEN),
    )


def _chat(system: str, user: str) -> str:
    settings = get_settings()
    client = _get_client()
    response = client.complete(
        messages=[SystemMessage(system), UserMessage(user)],
        temperature=0.7,
        top_p=1.0,
        model=settings.AI_MODEL,
    )
    return response.choices[0].message.content


def generate_lead_email(company_name: str, contact_name: str, service: str) -> str:
    system = (
        "Sen Türkçe yazan profesyonel bir satış uzmanısın. "
        "Kısa, samimi ve ikna edici satış emaili yazıyorsun. "
        "Email max 150 kelime olsun, konu satırı da ekle."
    )
    user = (
        f"Şirket: {company_name}\n"
        f"Yetkili: {contact_name}\n"
        f"Sunulan hizmet: {service}\n"
        "Bu şirkete yukarıdaki hizmeti sunmak için email yaz."
    )
    return _chat(system, user)


def generate_project_description(project_name: str, project_type: str, features: str) -> str:
    system = (
        "Sen bir web ajansının içerik yazarısın. "
        "Portföy sitesi için profesyonel Türkçe proje açıklaması yazıyorsun. "
        "Max 80 kelime, etkileyici ve net olsun."
    )
    user = (
        f"Proje adı: {project_name}\n"
        f"Proje türü: {project_type}\n"
        f"Özellikler: {features}\n"
        "Bu proje için portföy açıklaması yaz."
    )
    return _chat(system, user)


def analyze_contact_message(message: str) -> dict:
    system = (
        "Sen bir müşteri hizmetleri asistanısın. "
        "Gelen mesajı analiz edip JSON formatında şunu döndür: "
        '{"category": "...", "priority": "low/medium/high", "summary": "...", "suggested_reply": "..."} '
        "Kategoriler: teknik_destek, fiyat_teklifi, bilgi_talebi, sikayet, diger. "
        "Sadece JSON döndür, başka şey yazma."
    )
    return _chat(system, f"Müşteri mesajı: {message}")
