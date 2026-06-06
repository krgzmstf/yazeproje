"""Gmail'den e-mail çekme."""

from __future__ import annotations
import base64
import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
from googleapiclient.discovery import build

from auth import get_credentials

load_dotenv()

MAX_EMAILS = int(os.getenv("MAX_EMAILS", 500))
DAYS_BACK = int(os.getenv("DAYS_BACK", 30))


def fetch_emails(days_back: int = DAYS_BACK, max_results: int = MAX_EMAILS) -> list[dict]:
    """Gmail'den son N günün maillerini çeker."""
    creds = get_credentials()
    service = build("gmail", "v1", credentials=creds)

    after_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y/%m/%d")
    query = f"after:{after_date}"

    print(f"→ Son {days_back} günün mailleri çekiliyor (maks {max_results})...")

    messages = []
    page_token = None

    while len(messages) < max_results:
        batch_size = min(100, max_results - len(messages))
        kwargs = {"userId": "me", "q": query, "maxResults": batch_size}
        if page_token:
            kwargs["pageToken"] = page_token

        result = service.users().messages().list(**kwargs).execute()
        batch = result.get("messages", [])
        messages.extend(batch)

        page_token = result.get("nextPageToken")
        if not page_token:
            break

    print(f"{len(messages)} mail bulundu.")
    emails = []

    for i, msg in enumerate(messages, 1):
        try:
            detail = service.users().messages().get(
                userId="me", id=msg["id"], format="metadata",
                metadataHeaders=["From", "Subject", "Date", "List-Unsubscribe", "List-Id"]
            ).execute()

            headers = {
                h["name"].lower(): h["value"]
                for h in detail.get("payload", {}).get("headers", [])
            }

            emails.append({
                "id": msg["id"],
                "sender": headers.get("from", ""),
                "subject": headers.get("subject", "(Konusuz)"),
                "date": _parse_date(headers.get("date", "")),
                "snippet": detail.get("snippet", ""),
                "is_read": "UNREAD" not in detail.get("labelIds", []),
                "has_attachment": _has_attachment(detail),
                "headers": headers,
            })

            if i % 50 == 0:
                print(f"  {i}/{len(messages)} islendi...")

        except Exception as e:
            print(f"  ⚠ Mail {msg['id']} atlandı: {e}")
            continue

    return emails


def _parse_date(date_str: str) -> str:
    """Mail tarihini GG.AA.YYYY SS:DD formatına çevirir."""
    if not date_str:
        return ""
    formats = [
        "%a, %d %b %Y %H:%M:%S %z",
        "%d %b %Y %H:%M:%S %z",
        "%a, %d %b %Y %H:%M:%S",
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str.strip()[:31], fmt)
            return dt.strftime("%d.%m.%Y %H:%M")
        except ValueError:
            continue
    return date_str[:20]


def _has_attachment(detail: dict) -> bool:
    parts = detail.get("payload", {}).get("parts", [])
    return any(p.get("filename") for p in parts)
