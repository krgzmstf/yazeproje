"use client";

import React from "react";
import { Smartphone, CheckCircle, BellRing } from "lucide-react";

export default function AppBanner() {
  return (
    <section className="bg-cream py-20 overflow-hidden select-none relative">
      {/* Background shapes */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 rounded-full bg-gold/5 filter blur-3xl z-0" />
      <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-navy/5 filter blur-3xl z-0" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="bg-navy-dark border border-gold/25 rounded-2xl p-8 md:p-12 lg:p-16 text-cream shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Text Left */}
          <div className="max-w-2xl">
            <span className="inline-block text-[10px] font-bold text-gold uppercase tracking-[0.2em] border border-gold/30 px-3.5 py-1 rounded-full mb-6 bg-gold/5">
              Mobil Entegrasyon
            </span>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold leading-tight mb-4">
              YAZE Mobil Çok Yakında!
            </h2>
            <p className="text-sm text-cream/70 leading-relaxed font-light mb-8">
              Binalarınızın yapım aşamalarını, arsalarınızın son imar hareketlerini, güncel emlak fırsatlarını ve belediye duyurularını anlık bildirimlerle cebinizden takip edin.
            </p>

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 text-xs text-cream/85 mb-2">
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                <span>Anlık İmar Durumu ve Askı Bildirimleri</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                <span>Yapay Zeka Destekli Fırsat İlan Uyarıları</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                <span>Proje İlerleme ve Hakediş Durum Takibi</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                <span>Yerel Haberler ve İhale Özetleri</span>
              </div>
            </div>
          </div>

          {/* App Store Buttons Mock / Right Side */}
          <div className="flex flex-col items-center justify-center bg-navy/40 border border-gold/15 rounded-xl p-8 w-full lg:w-80 shadow-inner flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-4">
              <Smartphone className="w-7 h-7" />
            </div>
            <h3 className="font-playfair font-bold text-md text-gold text-center mb-2">
              Yayınlandığında Haber Ver
            </h3>
            <p className="text-[10px] text-cream/50 text-center mb-6 max-w-xs">
              Uygulamamız App Store ve Google Play Store'da aktif olduğunda ilk siz haberdar olun.
            </p>

            <button className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-gold-dark to-gold hover:from-gold hover:to-gold-light text-navy-dark font-bold text-xs py-3 rounded-lg shadow-lg hover:shadow-gold/20 transition-all duration-300">
              <BellRing className="w-4 h-4" />
              <span>Beni Bilgilendir</span>
            </button>
          </div>
          
        </div>
      </div>
    </section>
  );
}
