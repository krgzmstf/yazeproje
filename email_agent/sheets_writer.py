"""Kategorize edilmiş mailleri Google Sheets'e yazar."""

from __future__ import annotations
import os

import gspread
from gspread.utils import rowcol_to_a1
from dotenv import load_dotenv

from auth import get_credentials

load_dotenv()

SHEET_ID = os.getenv("GOOGLE_SHEET_ID", "")
SHEET_NAME = os.getenv("SHEET_NAME", "Email Kategorileri")

HEADERS = [
    "Mail ID", "Tarih", "Gonderen", "Konu",
    "Kategori", "Kategori Aciklama", "Oncelik",
    "Okundu mu?", "Ek Var mi?", "Yanit Gerekli mi?",
    "Ozet", "Etiketler",
]

# Kategori renkleri (arka plan)
CATEGORY_COLORS = {
    "FATURA_ODEME":   {"red": 0.98, "green": 0.92, "blue": 0.60},
    "PROJE_IS":       {"red": 0.67, "green": 0.84, "blue": 0.90},
    "SOZLESME_HUKUK": {"red": 0.95, "green": 0.70, "blue": 0.70},
    "EKIP_ILETISIM":  {"red": 0.72, "green": 0.88, "blue": 0.80},
    "TOPLANTI":       {"red": 0.80, "green": 0.72, "blue": 0.92},
    "MUSTERI":        {"red": 0.98, "green": 0.80, "blue": 0.60},
    "TEDARIKCI":      {"red": 0.90, "green": 0.90, "blue": 0.70},
    "BILDIRIM_OTO":   {"red": 0.90, "green": 0.90, "blue": 0.90},
    "HABER_BULTEN":   {"red": 0.85, "green": 0.85, "blue": 0.85},
    "KISISEL":        {"red": 0.82, "green": 0.94, "blue": 0.82},
    "SPAM_PHISHING":  {"red": 0.95, "green": 0.60, "blue": 0.60},
    "DIGER":          {"red": 0.95, "green": 0.95, "blue": 0.95},
}

PRIORITY_COLORS = {
    "YUKSEK": {"red": 0.95, "green": 0.40, "blue": 0.40},
    "ORTA":   {"red": 0.98, "green": 0.80, "blue": 0.30},
    "DUSUK":  {"red": 0.70, "green": 0.90, "blue": 0.70},
}


def write_to_sheets(rows: list[dict]) -> None:
    if not SHEET_ID:
        raise ValueError("GOOGLE_SHEET_ID .env dosyasinda tanimli degil.")

    creds = get_credentials()
    client = gspread.authorize(creds)
    spreadsheet = client.open_by_key(SHEET_ID)
    sheet = _get_or_create_sheet(spreadsheet)

    existing_ids = _get_existing_ids(sheet)
    new_rows = [r for r in rows if r["id"] not in existing_ids]

    if not new_rows:
        print("Yeni mail yok, sheets guncel.")
        return

    print(f"-> {len(new_rows)} yeni mail yaziliyor...")

    start_row = len(sheet.get_all_values()) + 1
    values = [_to_row(r) for r in new_rows]
    sheet.append_rows(values, value_input_option="USER_ENTERED")

    print("Renklendirme yapiliyor...")
    _apply_colors(sheet, new_rows, start_row)

    print(f"{len(new_rows)} mail Google Sheets'e kaydedildi.")


def _get_or_create_sheet(spreadsheet: gspread.Spreadsheet) -> gspread.Worksheet:
    try:
        ws = spreadsheet.worksheet(SHEET_NAME)
    except gspread.WorksheetNotFound:
        ws = spreadsheet.add_worksheet(title=SHEET_NAME, rows=5000, cols=len(HEADERS))

    if not ws.get_all_values():
        ws.append_row(HEADERS, value_input_option="USER_ENTERED")
        _format_header(ws)

    return ws


def _format_header(ws: gspread.Worksheet) -> None:
    ws.format("A1:L1", {
        "backgroundColor": {"red": 0.20, "green": 0.40, "blue": 0.70},
        "textFormat": {
            "bold": True,
            "foregroundColor": {"red": 1.0, "green": 1.0, "blue": 1.0},
            "fontSize": 11,
        },
        "horizontalAlignment": "CENTER",
    })
    ws.freeze(rows=1)

    # Sutun genislikleri
    requests = [
        {"updateDimensionProperties": {
            "range": {"sheetId": ws.id, "dimension": "COLUMNS", "startIndex": i, "endIndex": i + 1},
            "properties": {"pixelSize": size},
            "fields": "pixelSize"
        }}
        for i, size in enumerate([160, 130, 200, 280, 140, 200, 80, 80, 80, 100, 300, 150])
    ]
    ws.spreadsheet.batch_update({"requests": requests})


def _apply_colors(ws: gspread.Worksheet, rows: list[dict], start_row: int) -> None:
    batch = []
    for i, row in enumerate(rows):
        row_num = start_row + i
        cat_color = CATEGORY_COLORS.get(row["category"], {"red": 1, "green": 1, "blue": 1})

        # Tum satir kategori rengi
        batch.append({
            "repeatCell": {
                "range": {
                    "sheetId": ws.id,
                    "startRowIndex": row_num - 1,
                    "endRowIndex": row_num,
                    "startColumnIndex": 0,
                    "endColumnIndex": len(HEADERS),
                },
                "cell": {
                    "userEnteredFormat": {
                        "backgroundColor": cat_color,
                        "textFormat": {"fontSize": 10},
                        "verticalAlignment": "MIDDLE",
                    }
                },
                "fields": "userEnteredFormat(backgroundColor,textFormat,verticalAlignment)",
            }
        })

        # Oncelik sutunu (G = index 6) ayri renk
        pri_key = row["priority"].replace("Ü", "U").replace("Ü", "U")
        pri_map = {"YÜKSEK": "YUKSEK", "ORTA": "ORTA", "DÜŞÜK": "DUSUK"}
        pri_key = pri_map.get(row["priority"], "DUSUK")
        pri_color = PRIORITY_COLORS.get(pri_key, {"red": 0.9, "green": 0.9, "blue": 0.9})

        batch.append({
            "repeatCell": {
                "range": {
                    "sheetId": ws.id,
                    "startRowIndex": row_num - 1,
                    "endRowIndex": row_num,
                    "startColumnIndex": 6,
                    "endColumnIndex": 7,
                },
                "cell": {
                    "userEnteredFormat": {
                        "backgroundColor": pri_color,
                        "textFormat": {"bold": True, "fontSize": 10},
                        "horizontalAlignment": "CENTER",
                    }
                },
                "fields": "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
            }
        })

    if batch:
        ws.spreadsheet.batch_update({"requests": batch})


def _get_existing_ids(sheet: gspread.Worksheet) -> set[str]:
    try:
        col = sheet.col_values(1)
        return set(col[1:])
    except Exception:
        return set()


def _to_row(r: dict) -> list:
    from categorizer import CATEGORIES
    return [
        r["id"],
        r["date"],
        r["sender"],
        r["subject"],
        r["category"],
        CATEGORIES.get(r["category"], ""),
        r["priority"],
        "EVET" if r["is_read"] else "HAYIR",
        "EVET" if r.get("has_attachment") else "HAYIR",
        "EVET" if r["reply_needed"] else "HAYIR",
        r["summary"],
        ", ".join(r["tags"]),
    ]
