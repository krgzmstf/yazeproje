import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Eye, Newspaper, ArrowRight, Bell } from "lucide-react";
import { getNews, getAnnouncements, AutomatedNews, Announcement } from "@/lib/api";

const sourceLabels: Record<string, string> = {
  resmi_gazete: "Resmi Gazete",
  csbe: "Çevre ve Şehircilik Bak.",
  tmmob: "TMMOB",
  custom_rss: "Sektörel Haber",
  manual: "YAZE Haber",
};

interface PageProps {
  searchParams: Promise<{ limit?: string }>;
}

export default async function NewsPortalPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const limit = resolvedParams.limit ? parseInt(resolvedParams.limit) : 12;

  let news: AutomatedNews[] = [];
  let announcements: Announcement[] = [];
  let errorMsg = "";

  try {
    const results = await Promise.allSettled([
      getNews({ limit }),
      getAnnouncements({ limit: 8 }),
    ]);
    
    news = results[0].status === "fulfilled" ? results[0].value : [];
    announcements = results[1].status === "fulfilled" ? results[1].value : [];
  } catch (error) {
    console.error("Failed to load news portal contents:", error);
    errorMsg = "Haber ve duyurular yüklenirken bir hata oluştu.";
  }

  return (
    <div className="bg-navy min-h-screen text-cream pt-12 pb-24 select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
            Haber & Duyuru Portalı
          </span>
          <h1 className="font-playfair text-3xl md:text-5xl font-bold text-cream mt-3">
            Yerel Gelişmeler & İlanlar
          </h1>
          <div className="w-16 h-1 bg-gold mx-auto mt-5 rounded-full" />
          <p className="text-sm text-cream/70 mt-4 leading-relaxed font-light">
            Gölbaşı Belediyesi imar duyuruları, Çevre Şehircilik Bakanlığı askı ilanları ve en güncel sektörel haberler.
          </p>
        </div>

        {/* Loading/Error state */}
        {errorMsg && (
          <div className="text-center py-12 bg-navy-dark border border-gold/15 rounded-xl max-w-xl mx-auto mb-12">
            <p className="text-sm text-gold">{errorMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Columns (2/3): News Aggregator */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center space-x-2 text-gold border-b border-gold/10 pb-3 mb-6">
              <Newspaper className="w-5 h-5" />
              <h2 className="font-playfair text-xl md:text-2xl font-bold">Haber Arşivi</h2>
            </div>

            {news.length === 0 && !errorMsg && (
              <div className="text-center py-16 bg-navy-dark border border-gold/15 rounded-xl">
                <p className="text-sm text-cream/60">Yayınlanmış güncel haber bulunmamaktadır.</p>
              </div>
            )}

            {news.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {news.map((item) => {
                  const dateStr = item.published_at
                    ? new Date(item.published_at).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "";
                  
                  return (
                    <Link
                      key={item.id}
                      href={`/news/${item.slug}`}
                      className="group bg-navy-dark border border-gold/15 hover:border-gold rounded-xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-gold/5"
                    >
                      {/* Cover Image */}
                      <div className="relative h-48 w-full bg-navy">
                        <Image
                          src={item.cover_image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80"}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized={true}
                        />
                        <div className="absolute top-3 left-3 z-20">
                          <span className="text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 bg-navy-dark/95 text-gold border border-gold/25 rounded-md">
                            {sourceLabels[item.source] || item.source}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-playfair font-bold text-cream text-base group-hover:text-gold transition-colors duration-300 line-clamp-2 leading-snug mb-2">
                            {item.title}
                          </h3>
                          {item.summary && (
                            <p className="text-xs text-cream/70 font-light leading-relaxed line-clamp-3">
                              {item.summary}
                            </p>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between text-[10px] text-cream/50 mt-4 border-t border-gold/5 pt-3">
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gold/60" />
                            <span>{dateStr}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3.5 h-3.5 text-gold/60" />
                            <span>{item.view_count}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column (1/3): Announcements List (İmar/Askı İlanları) */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-gold border-b border-gold/10 pb-3 mb-6">
              <Bell className="w-5 h-5" />
              <h2 className="font-playfair text-xl md:text-2xl font-bold">Askı İlanları & Duyurular</h2>
            </div>

            {announcements.length === 0 && !errorMsg && (
              <div className="text-center py-16 bg-navy-dark border border-gold/15 rounded-xl">
                <p className="text-sm text-cream/60">Yayında ilan bulunmamaktadır.</p>
              </div>
            )}

            {announcements.length > 0 && (
              <div className="space-y-4">
                {announcements.map((ann) => {
                  const dateStr = ann.published_at
                    ? new Date(ann.published_at).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "";

                  return (
                    <div
                      key={ann.id}
                      className="bg-navy-dark border border-gold/10 p-5 rounded-xl flex flex-col justify-between hover:border-gold/30 transition-colors shadow-md relative"
                    >
                      {ann.is_pinned && (
                        <div className="absolute top-4 right-4">
                          <span className="text-[7px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gold/10 text-gold border border-gold/25 rounded">
                            Önemli
                          </span>
                        </div>
                      )}
                      
                      <div className="pr-12">
                        <span className="text-[9px] text-gold/80 font-semibold block mb-1">
                          {dateStr}
                        </span>
                        <h3 className="font-playfair font-bold text-cream text-sm leading-snug line-clamp-2 mb-3">
                          {ann.title}
                        </h3>
                      </div>

                      {ann.content && (
                        <p className="text-xs text-cream/60 font-light leading-relaxed line-clamp-2 mb-4">
                          {ann.content}
                        </p>
                      )}

                      <div className="border-t border-gold/5 pt-3 flex justify-end">
                        <span className="text-[10px] uppercase font-bold text-gold hover:text-gold-light transition-colors flex items-center space-x-1 cursor-pointer">
                          <span>Detayları Oku</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
