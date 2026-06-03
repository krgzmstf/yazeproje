"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Play } from "lucide-react";
import Link from "next/link";
import { ArchitectureProject } from "@/lib/api";

interface HeroProps {
  projects?: ArchitectureProject[];
  settings?: Record<string, any>;
}

export default function Hero({ projects, settings = {} }: HeroProps) {
  const defaultSlides = [
    {
      image: settings.hero_bg_image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80",
      title: settings.hero_title || "Estetik Mimarlık & Güçlü Mühendislik",
      subtitle: settings.site_title ? `${settings.site_title} MİMARLIK` : "YAZE PROJE MİMARLIK",
      desc: settings.hero_subtitle || "Ankara Gölbaşı merkezli, modern çizgileri sürdürülebilir yaşam alanlarıyla buluşturuyoruz. Arsa geliştirme ve bina projelerinizde profesyonel çözüm ortağınız.",
      btnPrimary: settings.hero_cta_text_1 || "Projelerimiz",
      btnPrimaryLink: settings.hero_cta_link_1 || "/projects",
      btnSecondary: settings.hero_cta_text_2 || "Teklif Al",
      btnSecondaryLink: settings.hero_cta_link_2 || "/contact",
    },
    {
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80",
      title: "Akıllı Yatırımlarla Geleceğinizi Şekillendirin",
      subtitle: "GAYRİMENKUL & TEKNOLOJİ",
      desc: "Yapay zeka tabanlı veri analiz yazılımlarımızla anlık piyasa takibi yapıyor, Gölbaşı bölgesindeki en karlı arsa ve gayrimenkul yatırım fırsatlarını sizlere sunuyoruz.",
      btnPrimary: "Emlak Vitrini",
      btnPrimaryLink: "/listings",
      btnSecondary: "Teknolojileri İncele",
      btnSecondaryLink: "/contact",
    },
  ];

  const slides = projects && projects.length > 0
    ? [
        ...defaultSlides,
        ...projects.slice(0, 2).map((proj) => ({
          image: proj.cover_image_url || defaultSlides[0].image,
          title: proj.title,
          subtitle: `PROJE / ${proj.category.toUpperCase()}`,
          desc: proj.description ? (proj.description.length > 180 ? proj.description.substring(0, 180) + "..." : proj.description) : "",
          btnPrimary: "Projeyi İncele",
          btnPrimaryLink: `/projects/${proj.slug}`,
          btnSecondary: "Tüm Projeler",
          btnSecondaryLink: "/projects",
        }))
      ]
    : defaultSlides;

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-navy-dark select-none">
      {/* Background Slideshow with Zoom effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1.0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Cover image */}
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[current].image})` }}
          />
          {/* Elegant Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/90 via-navy-dark/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-transparent opacity-80" />
        </motion.div>
      </AnimatePresence>

      {/* Slide Content */}
      <div className="absolute inset-0 flex items-center z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
          <div className="max-w-2xl text-cream">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Subtitle / Tag */}
                <span className="inline-block text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-gold border border-gold/30 px-3.5 py-1.5 rounded-full mb-6 bg-gold/5">
                  {slides[current].subtitle}
                </span>

                {/* Title */}
                <h1 className="font-playfair text-4xl md:text-6xl font-bold leading-tight tracking-wide mb-6">
                  {(slides[current].title as string).split(" & ").map((text: string, i: number) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="text-gold"> & </span>}
                      {text}
                    </React.Fragment>
                  ))}
                </h1>

                {/* Description */}
                <p className="text-sm md:text-base text-cream/80 font-light leading-relaxed mb-8 max-w-xl">
                  {slides[current].desc}
                </p>

                {/* Actions */}
                <div className="flex flex-wrap gap-4 items-center">
                  <Link
                    href={slides[current].btnPrimaryLink}
                    className="flex items-center space-x-2 bg-gradient-to-r from-gold-dark to-gold hover:from-gold hover:to-gold-light text-navy-dark font-bold text-xs md:text-sm px-7 py-3.5 rounded-full shadow-xl hover:shadow-gold/20 transition-all duration-300 hover:scale-105"
                  >
                    <span>{slides[current].btnPrimary}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={slides[current].btnSecondaryLink}
                    className="flex items-center space-x-2 bg-transparent hover:bg-cream/5 border border-cream/35 hover:border-cream text-cream font-semibold text-xs md:text-sm px-7 py-3.5 rounded-full transition-all duration-300"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-gold" />
                    <span>{slides[current].btnSecondary}</span>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full border border-cream/20 bg-navy-dark/40 hover:bg-gold text-cream hover:text-navy-dark transition-all duration-300 focus:outline-none hover:scale-110"
        aria-label="Önceki Slayt"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full border border-cream/20 bg-navy-dark/40 hover:bg-gold text-cream hover:text-navy-dark transition-all duration-300 focus:outline-none hover:scale-110"
        aria-label="Sonraki Slayt"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex space-x-2.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-1.5 rounded-full transition-all duration-500 focus:outline-none ${
              current === idx ? "w-8 bg-gold" : "w-2.5 bg-cream/40"
            }`}
            aria-label={`Slayt ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
