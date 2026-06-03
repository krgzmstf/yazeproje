import React from "react";
import { Newspaper, BellRing, Briefcase, Calendar, ArrowRight } from "lucide-react";
import { AutomatedNews, Announcement } from "@/lib/api";

interface NewsAggregationProps {
  news?: AutomatedNews[];
  announcements?: Announcement[];
}

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr || "";
  }
};

export default function NewsAggregation({ news: apiNews, announcements: apiAnnouncements }: NewsAggregationProps) {
  // Fallbacks
  const fallbackNews = [
    {
      date: "26 Mayıs 2026",
      title: "Gölbaşı Mogan Gölü Çevresinde Büyük Rekreasyon Projesi Başlıyor",
      desc: "Bakanlık ve belediye ortaklığında yürütülen sahil bandı genişletme projesinin detayları askıya çıktı.",
    },
    {
      date: "24 Mayıs 2026",
      title: "Ankara Gölbaşı Kentsel Dönüşüm Bilgilendirme Ofisi Açıldı",
      desc: "Vatandaşların imar ve hak sahipliği sorgulamalarını hızlıca yapabilmesi için yeni koordinasyon merkezi kuruldu.",
    },
    {
      date: "20 Mayıs 2026",
      title: "Gölbaşı Sanayi Sitesi Esnafına Enerji Desteği Paketi Tanıtıldı",
      desc: "Güneş enerjisi dönüşüm yatırımlarında uygulanacak teşvik ve hibe imkanları açıklandı.",
    },
  ];

  const fallbackAnnouncements = [
    {
      date: "25 Mayıs 2026",
      title: "İmar Planı Askı İlanı: Bahçelievler Mah. 1245 Ada 2 Parsel",
      desc: "1/1000 ölçekli uygulama imar planı değişikliği belediye binasında 30 gün süreyle askıya çıkarılmıştır.",
    },
    {
      date: "21 Mayıs 2026",
      title: "Çevre Şehircilik Bakanlığı Askı Duyurusu: Eymir Koruma Alanı",
      desc: "Özel çevre koruma bölgesi sınır revizyonu harita planları halkın görüşüne sunuldu.",
    },
    {
      date: "18 Mayıs 2026",
      title: "Emlak Vergisi 1. Taksit Ödemelerinde Son Gün Yaklaşıyor",
      desc: "Mayıs ayı sonu itibarıyla sona erecek emlak vergisi taksit ödemeleri internet üzerinden de yapılabiliyor.",
    },
  ];

  const fallbackTenders = [
    {
      date: "İhale Tarihi: 04 Haz 2026",
      title: "Gölbaşı Belediyesi Kültür Merkezi İnşaat Yapım İşi",
      desc: "Gölbaşı Merkez mahallelerine hitap edecek yeni çok amaçlı kültür merkezi inşaatı ihalesidir.",
    },
    {
      date: "İhale Tarihi: 08 Haz 2026",
      title: "Mogan Parkı Çevre Aydınlatması ve Solar Panel Montajı",
      desc: "Park içi aydınlatma direklerinin yenilenmesi ve yeşil enerji entegrasyonu projesidir.",
    },
    {
      date: "İhale Tarihi: 12 Haz 2026",
      title: "Yazılım Altyapısı ve Bulut Sunucu Kiralama Hizmeti",
      desc: "Belediye veri merkezi modernizasyonu ve siber güvenlik yazılımları temin ihalesidir.",
    },
  ];

  // Map news
  const newsItems = apiNews && apiNews.length > 0
    ? apiNews.slice(0, 3).map(n => ({
        date: formatDate(n.published_at),
        title: n.title,
        desc: n.summary || "",
      }))
    : fallbackNews;

  // Split announcements into normal announcements and tenders based on keyword
  const allApiAnnouncements = apiAnnouncements || [];
  
  const apiTenders = allApiAnnouncements.filter(
    a => a.title.toLowerCase().includes("ihale") || (a.content && a.content.toLowerCase().includes("ihale"))
  );
  
  const apiNormals = allApiAnnouncements.filter(
    a => !a.title.toLowerCase().includes("ihale") && !(a.content && a.content.toLowerCase().includes("ihale"))
  );

  const announcementItems = apiNormals.length > 0
    ? apiNormals.slice(0, 3).map(a => ({
        date: formatDate(a.published_at),
        title: a.title,
        desc: a.content || "",
      }))
    : fallbackAnnouncements;

  const tenderItems = apiTenders.length > 0
    ? apiTenders.slice(0, 3).map(t => ({
        date: `İhale/İlan Tarihi: ${formatDate(t.published_at)}`,
        title: t.title,
        desc: t.content || "",
      }))
    : fallbackTenders;

  return (
    <section className="bg-navy-dark py-24 border-b border-gold/10 select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
            Bilgi & Şeffaflık
          </span>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-cream mt-2">
            Haber, Duyuru & İhaleler
          </h2>
          <div className="w-16 h-1 bg-gold mx-auto mt-4 rounded-full" />
          <p className="text-sm text-cream/60 mt-4 leading-relaxed font-light">
            Gölbaşı Belediyesi, Bakanlıklar ve Resmi Gazete verilerinden botlarımızla çekilen anlık yerel haber, plan askısı ve ihale duyuruları.
          </p>
        </div>

        {/* 3-Column Aggregation Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Haberler */}
          <div className="bg-navy border border-gold/15 rounded-xl overflow-hidden flex flex-col justify-between shadow-xl">
            <div className="p-6 border-b border-gold/10 bg-gold/5 flex items-center space-x-3">
              <div className="p-2.5 bg-gold/10 text-gold rounded-lg">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-playfair font-bold text-cream text-lg">Yerel Haberler</h3>
                <span className="text-[10px] text-cream/40 uppercase tracking-wider">Otomatik Güncellenir</span>
              </div>
            </div>

            <div className="p-6 flex-1 divide-y divide-gold/10">
              {newsItems.map((item, idx) => (
                <div key={idx} className="py-4.5 first:pt-0 last:pb-0 group cursor-pointer">
                  <div className="flex items-center space-x-1.5 text-[10px] text-gold font-semibold mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </div>
                  <h4 className="font-semibold text-xs text-cream group-hover:text-gold transition-colors leading-snug mb-1.5">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-cream/60 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-navy-dark/40 border-t border-gold/10">
              <button className="w-full flex items-center justify-center space-x-2 text-[11px] font-bold text-gold hover:text-gold-light transition-colors uppercase tracking-wider py-1">
                <span>Tüm Haberler</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Column 2: Duyurular */}
          <div className="bg-navy border border-gold/15 rounded-xl overflow-hidden flex flex-col justify-between shadow-xl">
            <div className="p-6 border-b border-gold/10 bg-gold/5 flex items-center space-x-3">
              <div className="p-2.5 bg-gold/10 text-gold rounded-lg">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-playfair font-bold text-cream text-lg">İmar & Askı Duyuruları</h3>
                <span className="text-[10px] text-cream/40 uppercase tracking-wider">Resmi Gazete / Belediye</span>
              </div>
            </div>

            <div className="p-6 flex-1 divide-y divide-gold/10">
              {announcementItems.map((item, idx) => (
                <div key={idx} className="py-4.5 first:pt-0 last:pb-0 group cursor-pointer">
                  <div className="flex items-center space-x-1.5 text-[10px] text-gold font-semibold mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </div>
                  <h4 className="font-semibold text-xs text-cream group-hover:text-gold transition-colors leading-snug mb-1.5">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-cream/60 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-navy-dark/40 border-t border-gold/10">
              <button className="w-full flex items-center justify-center space-x-2 text-[11px] font-bold text-gold hover:text-gold-light transition-colors uppercase tracking-wider py-1">
                <span>Tüm Duyurular</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Column 3: İhaleler */}
          <div className="bg-navy border border-gold/15 rounded-xl overflow-hidden flex flex-col justify-between shadow-xl">
            <div className="p-6 border-b border-gold/10 bg-gold/5 flex items-center space-x-3">
              <div className="p-2.5 bg-gold/10 text-gold rounded-lg">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-playfair font-bold text-cream text-lg">İhale Takip Portalı</h3>
                <span className="text-[10px] text-cream/40 uppercase tracking-wider">Kamu İhale Kurumu</span>
              </div>
            </div>

            <div className="p-6 flex-1 divide-y divide-gold/10">
              {tenderItems.map((item, idx) => (
                <div key={idx} className="py-4.5 first:pt-0 last:pb-0 group cursor-pointer">
                  <div className="flex items-center space-x-1.5 text-[10px] text-gold font-semibold mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </div>
                  <h4 className="font-semibold text-xs text-cream group-hover:text-gold transition-colors leading-snug mb-1.5">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-cream/60 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-navy-dark/40 border-t border-gold/10">
              <button className="w-full flex items-center justify-center space-x-2 text-[11px] font-bold text-gold hover:text-gold-light transition-colors uppercase tracking-wider py-1">
                <span>Tüm İhaleler</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
