import React from "react";
import {
  Map,
  Compass,
  Key,
  Bot,
  Globe,
  FileText,
  LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Map,
  Compass,
  Key,
  Bot,
  Globe,
  FileText
};

const defaultQuickMenuItems = [
  {
    icon: Compass,
    title: "Öne Çıkan Projeler",
    desc: "Mimari projelerimiz ve inşaat ruhsat süreçlerimiz.",
    link: "/projects",
  },
  {
    icon: Key,
    title: "Emlak Vitrini",
    desc: "Satılık, kiralık lüks daire ve yatırım arsaları.",
    link: "/listings",
  },
  {
    icon: Map,
    title: "Gölbaşı Kent Rehberi",
    desc: "Gölbaşı Belediyesi CBS imar durum sorgulama.",
    link: "https://cbs.ankaragolbasi.bel.tr/Golbasieimar/#/",
  },
  {
    icon: Globe,
    title: "ABB Kent Rehberi",
    desc: "Ankara Büyükşehir Belediyesi Kent Bilgi Sistemi.",
    link: "https://kentrehberi.ankara.bel.tr/",
  },
  {
    icon: FileText,
    title: "TKGM Parsel Sorgu",
    desc: "Tapu ve Kadastro Genel Müdürlüğü parsel sorgulama.",
    link: "https://parselsorgu.tkgm.gov.tr/",
  },
  {
    icon: Bot,
    title: "YazeSYM",
    desc: "Yapay zeka emlak robotu takip modülü.",
    link: "https://yazesym.yazeproje.com",
  },
];

interface QuickMenuGridProps {
  settings?: Record<string, any>;
}

export default function QuickMenuGrid({ settings = {} }: QuickMenuGridProps) {
  const quickMenuItems = settings.quick_menu_items || defaultQuickMenuItems;

  return (
    <section id="quick-menu" className="relative z-20 -mt-16 sm:-mt-20 lg:-mt-24 w-full select-none bg-transparent pb-12 pt-0 border-none">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* 6'lı Saydam Menü Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickMenuItems.map((item: any, idx: number) => {
            const Icon = typeof item.icon === "string" ? (iconMap[item.icon] || Compass) : item.icon;
            return (
              <a
                key={idx}
                href={item.link}
                target={item.link.startsWith("http") ? "_blank" : undefined}
                rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group relative transition-all duration-300 hover:-translate-y-2 flex flex-col items-center text-center p-5 md:p-6 bg-white/85 hover:bg-white/95 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-navy-dark/10 transition-all duration-300"
              >
                {/* Icon */}
                <div className="flex items-center justify-center mb-3 transition-all duration-300 transform group-hover:-translate-y-1 text-gold group-hover:drop-shadow-[0_0_12px_rgba(212,175,55,0.6)]">
                  <Icon className="w-9 h-9" />
                </div>
                
                {/* Title & Desc */}
                <h3 className="font-playfair font-bold text-navy-dark text-sm mb-2 group-hover:text-navy transition-colors duration-200">
                  {item.title}
                </h3>
                <p className="text-[11px] text-navy-light/80 leading-relaxed font-normal px-1">
                  {item.desc}
                </p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
