"""Sheets'teki yanlis kategorileri yeniden hesapla ve guncelle."""

import gspread
import os
from auth import get_credentials
from categorizer import categorize
from dotenv import load_dotenv

load_dotenv()

creds = get_credentials()
client = gspread.authorize(creds)
sp = client.open_by_key(os.getenv("GOOGLE_SHEET_ID"))
ws = sp.worksheet("Email Kategorileri")

rows = ws.get_all_records()
headers = ws.row_values(1)

kat_col = headers.index("Kategori") + 1
onc_col = headers.index("Öncelik") + 1
gon_col = headers.index("Gönderen") + 1
kon_col = headers.index("Konu") + 1
ozet_col = headers.index("İçerik Özet") + 1

fixed = 0
for i, row in enumerate(rows, start=2):
    if row["Kategori"] != "DIGER":
        continue

    gonderen = str(row.get("Gönderen", ""))
    konu = str(row.get("Konu", ""))
    ozet = str(row.get("İçerik Özet", ""))

    result = categorize(subject=konu, snippet=ozet, sender=gonderen, headers={})

    if result.category != "DIGER":
        ws.update_cell(i, kat_col, result.category)
        ws.update_cell(i, onc_col, result.priority)
        print(f"Duzeltildi: {konu[:40]} -> {result.category}")
        fixed += 1

print(f"\nToplam {fixed} mail duzeltildi.")
