import React from "react";
import Link from "next/link";
import { Download, ExternalLink, HelpCircle, Laptop, Cpu, Layers, CheckCircle } from "lucide-react";
import { getSoftwareProducts, SoftwareProduct } from "@/lib/api";

// Fallback products in case backend isn't loaded or fails
const fallbackProducts: SoftwareProduct[] = [
  {
    id: "f1",
    name: "YazeSYM",
    slug: "yazesym",
    category: "calculation",
    short_description: "Mühendislik yapısal analiz ve simülasyon yazılımı.",
    description: "YazeSYM, inşaat ve yapı mühendisleri için geliştirilmiş, deprem yükleri ve yapısal analizleri uluslararası yönetmeliklere uygun olarak gerçekleştiren gelişmiş bir simülasyon aracıdır.",
    price: 15000,
    currency: "TRY",
    is_free: false,
    version: "v1.2.0",
    is_published: true,
    is_featured: true,
    sort_order: 1,
    download_url: null,
    demo_url: "https://demo.yazeproje.com/yazesym",
    cover_image_url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
    screenshots: null,
    features: null,
    created_at: "",
    updated_at: ""
  },
  {
    id: "f2",
    name: "yaze_metraj",
    slug: "yaze-metraj",
    category: "calculation",
    short_description: "Hızlı metraj çıkartma ve yaklaşık maliyet hesaplama aracı.",
    description: "yaze_metraj, projelerinizdeki beton, demir, kalıp ve diğer tüm yapı elemanlarının metrajlarını CAD çizimleri üzerinden otomatik çıkartarak yaklaşık maliyet hesaplama süreçlerinizi dakikalar içerisine indirger.",
    price: 8500,
    currency: "TRY",
    is_free: false,
    version: "v2.0.4",
    is_published: true,
    is_featured: true,
    sort_order: 2,
    download_url: null,
    demo_url: "https://demo.yazeproje.com/yazemetraj",
    cover_image_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    screenshots: null,
    features: null,
    created_at: "",
    updated_at: ""
  },
  {
    id: "f3",
    name: "Ynot",
    slug: "ynot",
    category: "project_management",
    short_description: "Mimar ve mühendisler için akıllı not alma ve şantiye takip uygulaması.",
    description: "Ynot, şantiyede ve ofiste ekip içi iletişimi koordine eden, anlık not alma, görev atama ve şantiye fotoğraf/doküman arşivleme özelliklerine sahip akıllı proje yönetim platformudur.",
    price: 0,
    currency: "TRY",
    is_free: true,
    version: "v1.0.1",
    is_published: true,
    is_featured: true,
    sort_order: 3,
    download_url: null,
    demo_url: "https://ynot.yazeproje.com",
    cover_image_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    screenshots: null,
    features: null,
    created_at: "",
    updated_at: ""
  },
  {
    id: "f4",
    name: "yaze otel",
    slug: "yaze-otel",
    category: "other",
    short_description: "Modern otel, rezidans ve konaklama işletim otomasyon sistemi.",
    description: "yaze otel, konuk giriş-çıkış takibi, oda rezervasyon yönetimi, faturalandırma ve temizlik koordinasyonunu tek ekrandan sunan, bulut tabanlı modern bir otel otomasyon çözümüdür.",
    price: 12000,
    currency: "TRY",
    is_free: false,
    version: "v3.1.0",
    is_published: true,
    is_featured: true,
    sort_order: 4,
    download_url: null,
    demo_url: "https://otel.yazeproje.com",
    cover_image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    screenshots: null,
    features: null,
    created_at: "",
    updated_at: ""
  }
];

const categoryLabels: Record<string, string> = {
  cad_tool: "CAD & Çizim",
  project_management: "Proje Yönetimi",
  bim: "BIM Modelleme",
  calculation: "Hesaplama & Metraj",
  visualization: "Görselleştirme",
  other: "Otomasyon & SaaS"
};

export default async function SoftwarePage() {
  let products: SoftwareProduct[] = [];
  try {
    products = await getSoftwareProducts();
  } catch (error) {
    console.error("Failed to load software products. Using fallback data.", error);
    products = fallbackProducts;
  }

  // Ensure all 4 required fallback items are included if database list is empty
  if (products.length === 0) {
    products = fallbackProducts;
  }

  return (
    <div className="bg-navy-dark min-h-screen text-cream select-none pt-12 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
        
        {/* Banner Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] block">
            DİJİTAL ÇÖZÜMLER & YAZILIM MAĞAZASI
          </span>
          <h1 className="font-playfair text-3xl md:text-5xl font-bold tracking-tight text-cream">
            Hazır Yazılım Ürünlerimiz
          </h1>
          <div className="w-16 h-0.5 bg-gold mx-auto my-4" />
          <p className="text-xs md:text-sm text-cream/70 leading-relaxed font-light">
            Emlak, mimarlık ve yapı sektörü için geliştirdiğimiz pratik ve yenilikçi masaüstü yazılımları, 
            hesaplama araçları ve SaaS platformlarımızı tek bir çatı altında inceleyin ve indirin.
          </p>
        </div>

        {/* Software Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((product) => {
            const hasDownload = !!product.download_url;
            return (
              <div 
                key={product.id}
                className="bg-navy border border-gold/15 hover:border-gold/30 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group"
              >
                
                {/* Upper Half */}
                <div>
                  {/* Image banner */}
                  <div className="relative h-56 bg-navy-dark overflow-hidden border-b border-gold/10">
                    <img 
                      src={product.cover_image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent opacity-80" />
                    
                    {/* Category and Version Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 bg-navy/85 backdrop-blur-sm border border-gold/25 rounded-full text-[9px] font-bold text-gold uppercase tracking-wider">
                        {categoryLabels[product.category] || product.category}
                      </span>
                      {product.version && (
                        <span className="px-3 py-1 bg-gold/15 backdrop-blur-sm border border-gold/30 rounded-full text-[9px] font-bold text-cream">
                          {product.version}
                        </span>
                      )}
                    </div>

                    {/* Price Tag */}
                    <div className="absolute bottom-4 right-4 bg-navy-dark/90 backdrop-blur border border-gold/10 px-4 py-1.5 rounded-lg shadow-lg">
                      <span className="text-[9px] uppercase tracking-wider text-cream/45 block">LİSANS BEDELİ</span>
                      <span className="text-xs font-bold text-gold">
                        {product.is_free ? "ÜCRETSİZ" : `${product.price?.toLocaleString("tr-TR")} ${product.currency}`}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 md:p-8 space-y-4">
                    <div className="flex items-center space-x-2">
                      <h2 className="font-playfair text-xl md:text-2xl font-bold text-cream tracking-wide group-hover:text-gold transition-colors">
                        {product.name}
                      </h2>
                    </div>
                    
                    <p className="text-xs text-cream/70 leading-relaxed font-light">
                      {product.description || product.short_description}
                    </p>

                    {/* Core bullet features if category matches calculation */}
                    <div className="space-y-2 pt-2 border-t border-gold/5">
                      <div className="flex items-center space-x-2.5 text-[11px] text-cream/60">
                        <CheckCircle className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span>Sınırsız Kullanım Yetkisi</span>
                      </div>
                      <div className="flex items-center space-x-2.5 text-[11px] text-cream/60">
                        <CheckCircle className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span>Türkçe Dil Desteği & Teknik Kılavuz</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons Block */}
                <div className="p-6 md:p-8 pt-0 border-t border-gold/5 bg-navy-dark/30 flex flex-wrap gap-4 items-center justify-between">
                  {/* Left: Demo details */}
                  {product.demo_url ? (
                    <a
                      href={product.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1.5 text-xs text-cream/60 hover:text-gold transition-colors font-medium"
                    >
                      <span>Web Demosu</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <div className="text-[10px] text-cream/40 italic flex items-center space-x-1">
                      <Laptop className="w-3.5 h-3.5" />
                      <span>Masaüstü Uygulama</span>
                    </div>
                  )}

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-2">
                    {hasDownload ? (
                      <a
                        href={product.download_url!}
                        download
                        className="flex items-center space-x-2 bg-gradient-to-r from-gold-dark to-gold hover:from-gold hover:to-gold-dark text-navy-dark px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-gold/5"
                      >
                        <Download className="w-3.5 h-3.5 shrink-0" />
                        <span>Programı İndir</span>
                      </a>
                    ) : (
                      <Link
                        href="/contact"
                        className="flex items-center space-x-2 bg-navy border border-gold/20 hover:border-gold text-cream hover:text-gold px-5 py-2.5 rounded-lg text-xs font-bold transition-all"
                      >
                        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>İletişime Geçin</span>
                      </Link>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>

        {/* Technical Notice Banner */}
        <div className="bg-navy border border-gold/10 rounded-2xl p-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl" />
          <div className="space-y-1.5 text-center md:text-left">
            <h4 className="font-playfair font-bold text-gold text-sm tracking-wider uppercase">Özel Yazılım Talepleri</h4>
            <p className="text-xs text-cream/70 leading-relaxed font-light">
              Şirketinize veya projelerinize özel otomasyon, veri toplama robotu veya CAD eklenti geliştirme talepleriniz için ekibimizle iletişime geçebilirsiniz.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3 bg-gradient-to-r from-gold-dark to-gold text-navy-dark font-bold text-xs rounded-lg shadow-lg hover:shadow-gold/15 whitespace-nowrap"
          >
            Bize Yazın
          </Link>
        </div>

      </div>
    </div>
  );
}
