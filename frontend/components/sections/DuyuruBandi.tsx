import React from "react";
import { Megaphone } from "lucide-react";
import { Announcement } from "@/lib/api";

interface DuyuruBandiProps {
  announcements?: Announcement[];
}

export default function DuyuruBandi({ announcements }: DuyuruBandiProps) {
  const fallbackAnnouncements = [
    "Duyuru: Gölbaşı imar planı güncellemeleri yayınlandı. Detaylar için Mimarlık ofisimizle iletişime geçebilirsiniz.",
    "Kampanya: Gayrimenkul portföyümüzde Gölbaşı Mogan gölü manzaralı yeni villalar satışa açıldı!",
    "Yazılım: YazeSYM Emlak Analiz Modülü v1.0.4 güncellemesi ile yerel ilan siteleri veri toplama hızı %40 artırıldı.",
    "Belediye İlanı: Gölbaşı Belediyesi çevre düzenleme ihalesi sonuçları haber portalımızda yayınlandı.",
  ];

  const items = announcements && announcements.length > 0
    ? announcements.map(a => `${a.title}`)
    : fallbackAnnouncements;

  return (
    <div className="bg-gold text-navy-dark py-2 overflow-hidden border-y border-gold-dark/30 select-none relative z-10 flex items-center">
      {/* Label */}
      <div className="bg-navy-dark text-gold font-bold text-xs uppercase px-4 py-1 flex items-center space-x-1.5 z-20 shadow-md">
        <Megaphone className="w-3.5 h-3.5 animate-pulse" />
        <span>Duyurular</span>
      </div>

      {/* Marquee Content */}
      <div className="relative flex overflow-x-hidden flex-1 items-center">
        <div className="animate-marquee whitespace-nowrap flex space-x-12 text-xs font-semibold uppercase tracking-wider py-1">
          {items.map((text, idx) => (
            <span key={idx} className="mx-4 flex items-center">
              <span>{text}</span>
              <span className="ml-12 text-navy-dark/40">•</span>
            </span>
          ))}
          {/* Duplicate for infinite loop */}
          {items.map((text, idx) => (
            <span key={idx + 100} className="mx-4 flex items-center">
              <span>{text}</span>
              <span className="ml-12 text-navy-dark/40">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
