"""Sheets'teki mailleri analiz et, yanlis kategorileri bul."""

import gspread
import os
from collections import Counter
from auth import get_credentials
from dotenv import load_dotenv

load_dotenv()

creds = get_credentials()
client = gspread.authorize(creds)
sp = client.open_by_key(os.getenv("GOOGLE_SHEET_ID"))
ws = sp.worksheet("Email Kategorileri")
rows = ws.get_all_records()

print(f"Toplam: {len(rows)} mail\n")

# DIGER kategorisindekiler
diger = [r for r in rows if r["Kategori"] == "DIGER"]
print(f"=== DIGER ({len(diger)} adet) - yanlis olabilir ===")
for r in diger[:15]:
    gonderen = str(r.get("Gönderen", ""))[:50]
    konu = str(r.get("Konu", ""))[:60]
    print(f"  Gonderen : {gonderen}")
    print(f"  Konu     : {konu}")
    print()

# YUKSEK oncelik ama BILDIRIM_OTO
yanlis = [r for r in rows if "KSEK" in str(r.get("Öncelik","")) and r.get("Kategori") == "BILDIRIM_OTO"]
print(f"=== YUKSEK+BILDIRIM ({len(yanlis)} adet) - oncelik yanlis olabilir ===")
for r in yanlis[:10]:
    gonderen = str(r.get("Gönderen", ""))[:50]
    konu = str(r.get("Konu", ""))[:60]
    print(f"  Gonderen : {gonderen}")
    print(f"  Konu     : {konu}")
    print()

# Kategori dagilimi
cats = Counter(r["Kategori"] for r in rows)
print("=== Kategori Dagilimi ===")
for cat, count in cats.most_common():
    print(f"  {cat:<22} {count:>4}")
