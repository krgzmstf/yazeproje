"""Gmail ve Google Sheets OAuth 2.0 yetkilendirmesi."""

import os
from pathlib import Path

from dotenv import load_dotenv
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

load_dotenv()

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/spreadsheets",
]

CREDENTIALS_PATH = os.getenv("CREDENTIALS_PATH", "credentials/credentials.json")
TOKEN_PATH = os.getenv("TOKEN_PATH", "credentials/token.json")


def get_credentials() -> Credentials:
    """Mevcut token varsa yükle, yoksa tarayıcıda yetkilendirme yap."""
    creds = None

    if Path(TOKEN_PATH).exists():
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not Path(CREDENTIALS_PATH).exists():
                raise FileNotFoundError(
                    f"credentials.json bulunamadı: {CREDENTIALS_PATH}\n"
                    "Google Cloud Console'dan indirip credentials/ klasörüne koy."
                )
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
            creds = flow.run_local_server(port=0)

        Path(TOKEN_PATH).parent.mkdir(parents=True, exist_ok=True)
        with open(TOKEN_PATH, "w") as f:
            f.write(creds.to_json())
        print("Yetkilendirme tamamlandi, token kaydedildi.")

    return creds
