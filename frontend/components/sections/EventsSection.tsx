import React from "react";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { Event } from "@/lib/api";

const months = [
  "OCA", "ŞUB", "MAR", "NİS", "MAY", "HAZ",
  "TEM", "AĞU", "EYL", "EKİ", "KAS", "ARA"
];

const parseEventDate = (dateStr?: string | null) => {
  if (!dateStr) return { day: "--", month: "---", time: "Belirtilmemiş" };
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { day: "??", month: "???", time: dateStr };
    
    const day = String(d.getDate()).padStart(2, "0");
    const month = months[d.getMonth()];
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const time = `${hours}:${minutes}`;
    
    return { day, month, time };
  } catch {
    return { day: "??", month: "???", time: dateStr || "Belirtilmemiş" };
  }
};

interface EventsSectionProps {
  events?: Event[];
}

export default function EventsSection({ events: apiEvents }: EventsSectionProps) {
  const fallbackEvents = [
    {
      day: "28",
      month: "MAY",
      title: "Gölbaşı Regional Zoning Workshop",
      time: "14:00 - 17:00",
      location: "Gölbaşı Belediyesi Konferans Salonu",
      desc: "Yazılım destekli kentsel tasarım ve imar analizlerinin sunulacağı teknik toplantı.",
    },
    {
      day: "02",
      month: "HAZ",
      title: "Gayrimenkul ve Yatırım Zirvesi 2026",
      time: "10:00 - 16:30",
      location: "Mogan Grand Plaza",
      desc: "Yapay zeka piyasa botlarının gayrimenkul danışmanlığındaki rolünün ele alınacağı konferans.",
    },
    {
      day: "15",
      month: "HAZ",
      title: "Sürdürülebilir Mimarlık ve Yeşil Yapılar Semineri",
      time: "13:30 - 15:30",
      location: "Yaze Smart Tower Seminer Salonu",
      desc: "Ekolojik malzeme kullanımı ve pasif ev tasarımları üzerine akademik ve teknik bilgilendirme.",
    },
  ];

  const items = apiEvents && apiEvents.length > 0
    ? apiEvents.map(e => {
        const { day, month, time } = parseEventDate(e.event_date);
        return {
          day,
          month,
          title: e.title,
          time: time,
          location: e.location || "Gölbaşı, Ankara",
          desc: e.description || "",
        };
      })
    : fallbackEvents;

  return (
    <section className="bg-cream py-24 border-b border-navy/5 select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-gold-dark">
              Sosyal & Etkinlik
            </span>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-navy-dark mt-2">
              Kültür & Bilgi Etkinlikleri
            </h2>
            <div className="w-16 h-1 bg-gold mt-4 rounded-full" />
          </div>
          <button className="flex items-center space-x-2 text-xs font-bold text-navy-dark hover:text-gold-dark mt-6 md:mt-0 transition-colors uppercase tracking-wider group">
            <span>Tüm Etkinlikler</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3'lü Etkinlik Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {items.map((event, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg border border-navy/5 p-6 hover:shadow-xl transition-shadow flex space-x-5"
            >
              {/* Date Box (Left Side) */}
              <div className="flex flex-col items-center justify-center bg-navy text-cream rounded-xl p-3 w-18 h-20 flex-shrink-0 border-b-4 border-gold">
                <span className="text-2xl font-bold font-playfair tracking-tight leading-none">
                  {event.day}
                </span>
                <span className="text-[10px] font-bold text-gold tracking-widest mt-1">
                  {event.month}
                </span>
              </div>

              {/* Event Info (Right Side) */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-playfair font-bold text-navy-dark text-md leading-snug mb-2 hover:text-gold-dark transition-colors cursor-pointer">
                    {event.title}
                  </h3>
                  <p className="text-[11px] text-navy-dark/65 line-clamp-2 leading-relaxed mb-4">
                    {event.desc}
                  </p>
                </div>

                <div className="space-y-1.5 text-[10px] text-navy-dark/70 border-t border-navy/5 pt-3">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-gold-dark" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold-dark" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
