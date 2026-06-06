"""Ana çalıştırıcı: Gmail → Kategorize → Google Sheets."""

from __future__ import annotations
import sys
from collections import Counter

from gmail_fetcher import fetch_emails
from categorizer import categorize
from sheets_writer import write_to_sheets


def run(days_back: int = 30, max_emails: int = 500, dry_run: bool = False) -> None:
    print("=" * 55)
    print("  YAZE Email Agent")
    print("=" * 55)

    # 1. Mailleri çek
    emails = fetch_emails(days_back=days_back, max_results=max_emails)
    if not emails:
        print("Hiç mail bulunamadı.")
        return

    # 2. Kategorize et
    print(f"\n→ {len(emails)} mail kategorize ediliyor...")
    rows = []
    for email in emails:
        result = categorize(
            subject=email["subject"],
            snippet=email["snippet"],
            sender=email["sender"],
            headers=email["headers"],
        )
        rows.append({
            **email,
            "category": result.category,
            "priority": result.priority,
            "reply_needed": result.reply_needed,
            "summary": result.summary,
            "tags": result.tags,
        })

    # 3. Özet rapor
    _print_report(rows)

    # 4. Sheets'e yaz
    if dry_run:
        print("\n[DRY RUN] Google Sheets'e yazılmadı.")
    else:
        print()
        write_to_sheets(rows)

    print("\n✓ Tamamlandı.")


def _print_report(rows: list[dict]) -> None:
    cat_counts = Counter(r["category"] for r in rows)
    pri_counts = Counter(r["priority"] for r in rows)
    reply_count = sum(1 for r in rows if r["reply_needed"])

    print("\n── Kategori Dağılımı ──────────────────────────")
    for cat, count in cat_counts.most_common():
        bar = "█" * min(count, 30)
        print(f"  {cat:<22} {count:>4}  {bar}")

    print("\n── Öncelik Dağılımı ───────────────────────────")
    for pri in ["YÜKSEK", "ORTA", "DÜŞÜK"]:
        count = pri_counts.get(pri, 0)
        print(f"  {pri:<10} {count:>4}")

    print(f"\n  Yanıt bekleyen: {reply_count} mail")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Gmail Email Agent")
    parser.add_argument("--days", type=int, default=30, help="Kaç günlük mail (varsayılan: 30)")
    parser.add_argument("--max", type=int, default=500, help="Maksimum mail sayısı (varsayılan: 500)")
    parser.add_argument("--dry-run", action="store_true", help="Sheets'e yazmadan sadece raporla")
    args = parser.parse_args()

    run(days_back=args.days, max_emails=args.max, dry_run=args.dry_run)
