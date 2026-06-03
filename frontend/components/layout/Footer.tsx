"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Clock, ArrowUpRight, Map, BellRing, Compass, Layers } from "lucide-react";

interface FooterProps {
  settings?: Record<string, any>;
}

export default function Footer({ settings = {} }: FooterProps) {
  return (
    <footer className="bg-navy-dark text-cream border-t border-gold/10 pt-16 pb-20 md:pb-8 select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Top Section: Municipal Kent Rehberi & Duyuru Panosu Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 pb-12 border-b border-gold/25">
          
          {/* Link 1: Gölbaşı Belediyesi Kent Rehberi */}
          <a
            href="https://cbs.ankaragolbasi.bel.tr/Golbasieimar/#/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-4 bg-navy border border-gold/20 hover:border-gold p-5 rounded-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="p-3 bg-gold/10 group-hover:bg-gold text-gold group-hover:text-navy-dark rounded-lg transition-colors">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-playfair font-bold text-cream text-sm group-hover:text-gold transition-colors">
                Gölbaşı Kent Rehberi
              </h4>
              <p className="text-[10px] text-cream/50 mt-0.5">
                Gölbaşı Belediyesi Resmi Harita ve Parsel Sorgulama
              </p>
            </div>
          </a>

          {/* Link 2: Gölbaşı Belediyesi Duyuru Panosu */}
          <a
            href="https://www.ankaragolbasi.bel.tr/duyurular"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-4 bg-navy border border-gold/20 hover:border-gold p-5 rounded-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="p-3 bg-gold/10 group-hover:bg-gold text-gold group-hover:text-navy-dark rounded-lg transition-colors">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-playfair font-bold text-cream text-sm group-hover:text-gold transition-colors">
                Gölbaşı Duyuru Panosu
              </h4>
              <p className="text-[10px] text-cream/50 mt-0.5">
                Güncel İmar Askıları, Belediye Kararları ve İlanlar
              </p>
            </div>
          </a>

          {/* Link 3: Ankara Büyükşehir Kent Rehberi */}
          <a
            href="https://kentrehberi.ankara.bel.tr/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-4 bg-navy border border-gold/20 hover:border-gold p-5 rounded-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="p-3 bg-gold/10 group-hover:bg-gold text-gold group-hover:text-navy-dark rounded-lg transition-colors">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-playfair font-bold text-cream text-sm group-hover:text-gold transition-colors">
                Ankara B.Şehir Kent Rehberi
              </h4>
              <p className="text-[10px] text-cream/50 mt-0.5">
                Ankara Büyükşehir Belediyesi Coğrafi Bilgi Sistemi
              </p>
            </div>
          </a>

          {/* Link 4: TKGM Parsel Sorgulama */}
          <a
            href="https://parselsorgu.tkgm.gov.tr/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-4 bg-navy border border-gold/20 hover:border-gold p-5 rounded-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="p-3 bg-gold/10 group-hover:bg-gold text-gold group-hover:text-navy-dark rounded-lg transition-colors">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-playfair font-bold text-cream text-sm group-hover:text-gold transition-colors">
                TKGM Parsel Sorgu
              </h4>
              <p className="text-[10px] text-cream/50 mt-0.5">
                Tapu ve Kadastro Genel Müdürlüğü Parsel Sorgulama
              </p>
            </div>
          </a>

        </div>

        {/* Middle Section: Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-gold/10">
          
          {/* Column 1: Brand & Info */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 overflow-hidden rounded-md border border-gold/30 bg-navy">
                <img
                  src={settings.logo_url || "/images/logo.jpg?v=3"}
                  alt={`${settings.site_title || "YAZE PROJE"} Logo`}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-playfair text-lg font-bold tracking-wider text-gold">
                  {settings.site_title || "YAZE PROJE"}
                </span>
                <span className="text-[8px] uppercase tracking-[0.15em] text-cream/60 font-semibold">
                  MİMARLIK & GAYRİMENKUL & YAZILIM
                </span>
              </div>
            </Link>
            <p className="text-xs text-cream/70 leading-relaxed font-light">
              {settings.hero_subtitle || "Ankara Gölbaşı merkezli, modern mimari çözümler, akıllı kentsel dönüşüm, kazançlı gayrimenkul yatırımları ve geleceğin dijital yazılım vitrinini tek çatı altında sunan yenilikçi platform."}
            </p>

            {/* Social Media Links */}
            <div className="flex items-center space-x-2 pt-2">
              {settings.social_facebook && (
                <a
                  href={settings.social_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-gold/30 hover:border-gold flex items-center justify-center text-gold hover:bg-gold/15 transition-all duration-300"
                  aria-label="Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                  </svg>
                </a>
              )}
              {settings.social_twitter && (
                <a
                  href={settings.social_twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-gold/30 hover:border-gold flex items-center justify-center text-gold hover:bg-gold/15 transition-all duration-300"
                  aria-label="Twitter"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              {settings.social_instagram && (
                <a
                  href={settings.social_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-gold/30 hover:border-gold flex items-center justify-center text-gold hover:bg-gold/15 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              )}
              {settings.social_youtube && (
                <a
                  href={settings.social_youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-gold/30 hover:border-gold flex items-center justify-center text-gold hover:bg-gold/15 transition-all duration-300"
                  aria-label="YouTube"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
              {settings.social_linkedin && (
                <a
                  href={settings.social_linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-gold/30 hover:border-gold flex items-center justify-center text-gold hover:bg-gold/15 transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-playfair font-semibold text-gold text-sm tracking-wider uppercase border-b border-gold/10 pb-2">
              Hızlı Bağlantılar
            </h3>
            <ul className="space-y-2 text-xs text-cream/80">
              {["Hakkımızda", "Projelerimiz", "Gayrimenkul İlanları", "Yazılım Mağazası", "Belediye İlanları", "İletişim"].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href="#"
                    className="flex items-center space-x-1 hover:text-gold transition-colors group"
                  >
                    <span>{link}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-playfair font-semibold text-gold text-sm tracking-wider uppercase border-b border-gold/10 pb-2">
              Hizmetlerimiz
            </h3>
            <ul className="space-y-2 text-xs text-cream/80">
              {[
                "Mimari Tasarım & Projelendirme",
                "Arsa Geliştirme & Yapı Mühendisliği",
                "Gayrimenkul Yatırım Danışmanlığı",
                "KVKK Uyumlu Emlak Yazılımları",
                "Yerel Haber & İlan Takip Botları",
              ].map((service, idx) => (
                <li key={idx}>
                  <Link href="#" className="hover:text-gold transition-colors">
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-playfair font-semibold text-gold text-sm tracking-wider uppercase border-b border-gold/10 pb-2">
              İletişim Bilgileri
            </h3>
            <ul className="space-y-3.5 text-xs text-cream/80">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {settings.contact_address || "Bahçelievler Mah. Cumhuriyet Cad., Gölbaşı / Ankara"}
                </span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-gold" />
                <span>{settings.contact_phone || "0312 444 0 999"}</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-gold" />
                <span>{settings.contact_email || "info@yazeproje.com"}</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-gold" />
                <span>Pzt - Cmt: 09:00 - 19:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-[11px] text-cream/50">
          <p>{settings.footer_text || `© ${new Date().getFullYear()} YAZE PROJE. Tüm Hakları Saklıdır.`}</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-gold transition-colors">Gizlilik Politikası</Link>
            <span>•</span>
            <Link href="#" className="hover:text-gold transition-colors">Kullanım Koşulları</Link>
            <span>•</span>
            <Link href="#" className="hover:text-gold transition-colors">KVKK Aydınlatma Metni</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
