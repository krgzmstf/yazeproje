import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye, Globe } from "lucide-react";
import { getNewsBySlug } from "@/lib/api";

const sourceLabels: Record<string, string> = {
  resmi_gazete: "Resmi Gazete",
  csbe: "Çevre, Şehircilik ve İklim Değişikliği Bak.",
  tmmob: "TMMOB",
  custom_rss: "Sektörel Haber",
  manual: "YAZE Haber",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewsDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let article;
  try {
    article = await getNewsBySlug(slug);
  } catch (error) {
    console.error(`Error loading news article ${slug}:`, error);
  }

  if (!article) {
    return (
      <div className="bg-navy min-h-screen text-cream flex flex-col items-center justify-center pt-24 px-4 text-center">
        <h1 className="font-playfair text-3xl font-bold mb-4">Haber Bulunamadı</h1>
        <p className="text-sm text-cream/70 mb-8 max-w-md">
          Ulaşmaya çalıştığınız haber yayından kaldırılmış veya silinmiş olabilir.
        </p>
        <Link href="/news" className="btn bg-gold text-navy-dark px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all hover:scale-105">
          Tüm Haberlere Dön
        </Link>
      </div>
    );
  }

  const dateStr = article.published_at
    ? new Date(article.published_at).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="bg-navy min-h-screen text-cream pb-24 select-none">
      
      {/* Back navigation */}
      <div className="max-w-4xl mx-auto px-4 pt-12">
        <Link
          href="/news"
          className="flex items-center space-x-2 text-xs font-bold text-gold hover:text-gold-light mb-8 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Haber Portalına Dön</span>
        </Link>
      </div>

      <article className="max-w-4xl mx-auto px-4 space-y-8">
        
        {/* Header metadata */}
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold px-3.5 py-1.5 bg-navy-dark rounded-full border border-gold/15 shadow-md">
            {sourceLabels[article.source] || article.source}
          </span>
          
          <h1 className="font-playfair text-3xl md:text-5xl font-bold leading-tight text-cream">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-cream/60 border-b border-gold/10 pb-6 pt-2">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-gold" />
              <span>Yayınlanma: {dateStr}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Eye className="w-4 h-4 text-gold" />
              <span>Okunma: {article.view_count}</span>
            </div>
            {article.source_url && (
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 text-gold hover:underline font-semibold"
              >
                <Globe className="w-4 h-4" />
                <span>Orijinal Kaynağa Git</span>
              </a>
            )}
          </div>
        </div>

        {/* Feature/Cover Image */}
        <div className="relative h-96 md:h-[450px] w-full rounded-2xl overflow-hidden border border-gold/10 shadow-xl bg-navy-dark">
          <Image
            src={article.cover_image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80"}
            alt={article.title}
            fill
            priority
            className="object-cover"
            unoptimized={true}
          />
        </div>

        {/* News Content */}
        <div className="bg-navy-dark border border-gold/15 rounded-xl p-6 md:p-10 shadow-xl">
          {article.summary && (
            <p className="text-sm md:text-base font-semibold text-gold leading-relaxed border-l-4 border-gold pl-4 mb-8">
              {article.summary}
            </p>
          )}

          <div className="text-sm md:text-base text-cream/90 leading-relaxed font-light whitespace-pre-line space-y-6">
            {article.content || "Haber içeriği bulunmamaktadır."}
          </div>
        </div>

        {/* Tags section */}
        {article.tags && Object.keys(article.tags).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {Object.values(article.tags).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-navy-dark border border-gold/10 rounded text-cream/70"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

      </article>
    </div>
  );
}
