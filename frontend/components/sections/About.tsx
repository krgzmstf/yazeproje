"use client";

import React from "react";
import DynamicIcon from "@/components/ui/DynamicIcon";

interface AboutProps {
  settings?: Record<string, any>;
}

export default function About({ settings = {} }: AboutProps) {
  // Extract settings values with robust fallback defaults
  const aboutBadge = settings.about_badge || "Kurumsal";
  const aboutTitle = settings.about_title || "Geleceği Şekillendiren Projeler, Güvenle Atılan İmzalar";
  
  const aboutPara1 = settings.about_paragraph_1 || 
    "Yazeproje, kuruluşundan bu yana mühendislik, mimari ve proje yönetimi alanlarında yenilikçi, sürdürülebilir ve yüksek katma değerli çözümler sunmak amacıyla yola çıkmıştır. Sektördeki gelişmeleri yakından takip eden, dinamik ve uzman kadromuzla; ham bir fikri, estetik ve fonksiyonellikle harmanlayarak hayata geçiriyoruz.";
  
  const aboutPara2 = settings.about_paragraph_2 || 
    "Biz sadece projeler tasarlamıyor; modern yaşamın gereksinimlerine uygun, çevreye saygılı ve kalıcı yaşam alanlarının temellerini atıyoruz. Doğru analiz, titiz planlama ve zamanında teslim ilkelerimizle, iş ortaklarımızın ve müşterilerimizin güvenini en büyük sermayemiz olarak görüyoruz. Teknolojinin gücünü mühendislik etiğiyle birleştirerek, sektörde standartları belirleyen bir marka olma yolunda kararlılıkla ilerliyoruz.";

  const aboutImage = settings.about_image || 
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

  const aboutOfficeBadge = settings.about_office_badge || "Merkez Ofisimiz";
  const aboutOfficeAddress = settings.about_office_address || "Bahçelievler Mah. Cumhuriyet Cad., Gölbaşı / Ankara";

  // Mission & Vision
  const missionTitle = settings.mission_title || "Misyonumuz";
  const missionBadge = settings.mission_badge || "(Biz Ne Yapıyoruz?)";
  const missionDesc = settings.mission_desc || 
    "Mühendislik ve proje tasarımı alanında; uluslararası standartlarda, inovatif, güvenli ve çevre dostu çözümler üreterek topluma ve iş ortaklarımıza maksimum değer sağlamaktır. Müşteri odaklı yaklaşımımızla, her projede estetik ve tekniği en üst düzeyde buluşturmayı ve sürdürülebilir bir geleceğe katkıda bulunmayı görev ediniyoruz.";
  const missionIcon = settings.mission_icon || "Target";

  const visionTitle = settings.vision_title || "Vizyonumuz";
  const visionBadge = settings.vision_badge || "(Nereye Ulaşmak İstiyoruz?)";
  const visionDesc = settings.vision_desc || 
    "Yenilikçi teknolojileri ve modern mühendislik çözümlerini ilk uygulayan öncülerden biri olarak; kalitemizle ulusal ve uluslararası düzeyde parmakla gösterilen, sektörün en güvenilir ve en saygın proje partneri olmaktır. Future-proof (geleceğe hazır) projelerimizle, yarının dünyasını bugünden inşa etmeyi hedefliyoruz.";
  const visionIcon = settings.vision_icon || "Eye";

  // Quality Policy
  const qualityBadge = settings.quality_badge || "İlkelerimiz";
  const qualityTitle = settings.quality_title || "Kalite Politikamız";
  const qualityDesc = settings.quality_desc || 
    "Yazeproje olarak başarının ve kalıcılığın anahtarının, kaliteden ödün vermeyen bir çalışma disiplini olduğuna inanıyoruz. Taahhüt ettiğimiz kalite politikamızın temel sütunları:";

  const defaultPillars = [
    {
      title: "Uluslararası Standartlar",
      desc: "Tüm süreçlerimizde ulusal ve uluslararası mevzuatlara, standartlara ve mühendislik etiğine eksiksiz uyum sağlamak.",
      icon: "Award"
    },
    {
      title: "Müşteri Memnuniyeti",
      desc: "İş ortaklarımızın beklentilerini doğru analiz ederek, onlara sadece ihtiyaçlarını karşılayan değil, beklentilerinin ötesine geçen çözümler sunmak.",
      icon: "Heart"
    },
    {
      title: "Sürekli Gelişim",
      desc: "Teknolojik gelişmeleri yakından takip ederek iş süreçlerimizi, donanımımızı ve yetkinliklerimizi sürekli modernize etmek ve geliştirmek.",
      icon: "Zap"
    },
    {
      title: "Sıfır Hata & Güvenlik",
      desc: "Projelendirme aşamasından uygulama sürecine kadar tüm detaylarda \"sıfır hata\" felsefesiyle hareket ederek, güvenliği en üst seviyede tutmak.",
      icon: "ShieldCheck"
    },
    {
      title: "Sürdürülebilirlik",
      desc: "Kaynakları etkin ve verimli kullanarak, doğaya ve insana saygılı, kalıcı, sürdürülebilir, dayanıklı ve estetik eserler üretmek.",
      icon: "CheckCircle2"
    }
  ];

  // Load custom quality pillars list from JSON configuration if exists
  const qualityPillars = settings.quality_pillars && Array.isArray(settings.quality_pillars)
    ? settings.quality_pillars.map((p: any) => ({
        title: p.title || "",
        desc: p.desc || p.description || "",
        icon: p.icon || "HelpCircle"
      }))
    : defaultPillars;

  return (
    <section id="about" className="bg-navy-dark text-cream py-24 border-b border-gold/10 select-none relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-1/4 -left-64 w-96 h-96 bg-gold/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-gold/5 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-24">
        
        {/* ── SECTION 1: HAKKIMIZDA ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-gold block">
                {aboutBadge}
              </span>
              <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-cream leading-tight">
                {aboutTitle.split(", ")[0]}
                {aboutTitle.split(", ").length > 1 && (
                  <>
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold to-gold-dark">
                      {aboutTitle.split(", ").slice(1).join(", ")}
                    </span>
                  </>
                )}
              </h2>
            </div>
            <div className="w-16 h-1 bg-gold rounded-full" />
            
            <p className="text-cream/80 text-sm md:text-base leading-relaxed font-light">
              {aboutPara1}
            </p>
            
            <p className="text-cream/80 text-sm md:text-base leading-relaxed font-light">
              {aboutPara2}
            </p>
          </div>

          {/* Right Image Column */}
          <div className="lg:col-span-5 relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-gold-dark to-gold-light rounded-2xl blur opacity-35 group-hover:opacity-60 transition duration-500" />
            <div className="relative w-full h-[380px] md:h-[420px] rounded-xl overflow-hidden border border-gold/25 bg-navy">
              <img
                src={aboutImage}
                alt="Yaze Proje Architecture"
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-navy-dark/90 backdrop-blur-md rounded-lg border border-gold/15">
                <span className="text-[10px] font-bold text-gold uppercase tracking-wider block">{aboutOfficeBadge}</span>
                <span className="text-xs text-cream/90 font-semibold block mt-0.5">{aboutOfficeAddress}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: MİSYON & VİZYON ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <div className="group relative bg-navy/40 border border-gold/10 hover:border-gold rounded-xl p-8 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-14 h-14 rounded-lg bg-gold/10 group-hover:bg-gold text-gold group-hover:text-navy-dark flex items-center justify-center mb-6 transition-all duration-300 transform group-hover:rotate-6">
              <DynamicIcon name={missionIcon} className="w-7 h-7" />
            </div>
            <h3 className="font-playfair text-xl font-bold text-cream mb-3 group-hover:text-gold transition-colors">
              {missionTitle} <span className="text-xs text-gold font-light block mt-1">{missionBadge}</span>
            </h3>
            <p className="text-xs md:text-sm text-cream/70 leading-relaxed font-light">
              {missionDesc}
            </p>
          </div>

          {/* Vision Card */}
          <div className="group relative bg-navy/40 border border-gold/10 hover:border-gold rounded-xl p-8 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-14 h-14 rounded-lg bg-gold/10 group-hover:bg-gold text-gold group-hover:text-navy-dark flex items-center justify-center mb-6 transition-all duration-300 transform group-hover:rotate-6">
              <DynamicIcon name={visionIcon} className="w-7 h-7" />
            </div>
            <h3 className="font-playfair text-xl font-bold text-cream mb-3 group-hover:text-gold transition-colors">
              {visionTitle} <span className="text-xs text-gold font-light block mt-1">{visionBadge}</span>
            </h3>
            <p className="text-xs md:text-sm text-cream/70 leading-relaxed font-light">
              {visionDesc}
            </p>
          </div>
        </div>

        {/* ── SECTION 3: KALİTE POLİTİKAMIZ ──────────────────────────── */}
        <div className="space-y-12">
          {/* Subheader */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
              {qualityBadge}
            </span>
            <h3 className="font-playfair text-2xl md:text-3xl font-bold text-cream">
              {qualityTitle}
            </h3>
            <div className="w-12 h-0.5 bg-gold mx-auto" />
            <p className="text-xs text-cream/60 leading-relaxed font-light">
              {qualityDesc}
            </p>
          </div>

          {/* 5 pillars grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {qualityPillars.map((pillar, i) => (
              <div key={i} className="bg-navy-dark/65 border border-gold/10 rounded-lg p-5 hover:border-gold/30 hover:bg-navy-dark/90 transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="text-gold group-hover:scale-110 transition-transform">
                    <DynamicIcon name={pillar.icon} className="w-6 h-6" />
                  </div>
                  <h4 className="font-playfair text-sm font-bold text-cream tracking-wide group-hover:text-gold transition-colors">
                    {pillar.title}
                  </h4>
                  <p className="text-[11px] text-cream/60 leading-relaxed font-light">
                    {pillar.desc}
                  </p>
                </div>
                <div className="w-6 h-[1px] bg-gold/20 group-hover:w-full transition-all mt-4" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
