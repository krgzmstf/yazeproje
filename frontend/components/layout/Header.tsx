"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ChevronDown, MessageSquare, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  desc?: string;
  image?: string;
  dropdown?: { name: string; href: string }[];
}

const defaultNavItems: NavItem[] = [
  {
    name: "Kurumsal",
    href: "/about",
    desc: "Mimarlık, gayrimenkul ve yazılım ürünlerimizi tek çatı altında buluşturan YAZE PROJE olarak Gölbaşı'nda geleceği inşa ediyoruz.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80",
    dropdown: [
      { name: "Hakkımızda", href: "/about" },
      { name: "Vizyon & Misyon", href: "/about" },
      { name: "Ekibimiz", href: "/about" },
      { name: "Kalite Politikamız", href: "/about" }
    ],
  },
  {
    name: "Mimarlık & Yapı",
    href: "/projects",
    desc: "Estetik çizgiler, modern mimari ve sürdürülebilir mühendislik çözümleri ile projelendirme ve arsa geliştirme süreçlerinizi yönetiyoruz.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80",
    dropdown: [
      { name: "Proje Üretimi", href: "/projects" },
      { name: "Arsa Geliştirme", href: "/projects" },
      { name: "Referans Projeler", href: "/projects" },
      { name: "İmar & Ruhsat Takibi", href: "/news" }
    ],
  },
  {
    name: "Gayrimenkul",
    href: "/listings",
    desc: "Gölbaşı bölgesindeki en geniş emlak ve arsa portföyüne, piyasa tarayıcı yapay zeka analizlerimizle en doğru yatırım kararlarını sunuyoruz.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80",
    dropdown: [
      { name: "Emlak Vitrini", href: "/listings" },
      { name: "Yatırımlık Arsalar", href: "/listings?property_type=land" },
      { name: "Piyasa Analiz Verileri", href: "/listings" },
      { name: "Değerleme Hizmetleri", href: "/listings" }
    ],
  },
  {
    name: "Yazılım Vitrini",
    href: "/software",
    desc: "Emlak piyasası için anlık ilan toplama robotları ve imar takip robotları ile sektöre dijital ve akıllı çözümler üretiyoruz.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
    dropdown: [
      { name: "YazeSYM", href: "https://yazeproje.com/yazesym" },
      { name: "yaze_metraj (Metraj Robotu)", href: "/software#yaze-metraj" },
      { name: "Hazır Yazılım Ürünleri", href: "/software" }
    ],
  },
  {
    name: "Haber Portalı",
    href: "/news",
    desc: "Gölbaşı Belediyesi, Çevre Şehircilik Bakanlığı ve yerel resmi ihalelerden anlık olarak çekilen plan askı ve yerel haber güncellemeleri.",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80",
    dropdown: [
      { name: "Yerel Haberler", href: "/news" },
      { name: "Belediye İlanları", href: "/news" },
      { name: "Kamu İhaleleri", href: "/news" }
    ],
  },
  { name: "İletişim", href: "/contact" },
];

interface HeaderProps {
  settings?: Record<string, any>;
}

export default function Header({ settings = {} }: HeaderProps) {
  const navItems = settings.nav_items || defaultNavItems;
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    checkLogin();
    
    // Listen for storage events (e.g. login/logout)
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const headerBgClass = isHome
    ? "absolute top-0 left-0 w-full z-40 bg-transparent border-b border-gold/15 text-cream select-none transition-all duration-300"
    : "sticky top-0 z-40 bg-[#050508]/95 backdrop-blur-md border-b border-gold/20 text-cream select-none transition-all duration-300";

  const topBarBgClass = isHome
    ? "w-full bg-transparent border-b border-gold/10 px-6 lg:px-16 py-2.5 hidden sm:flex justify-between items-center text-xs text-cream/70 select-none"
    : "w-full bg-[#030305] border-b border-gold/30 px-6 lg:px-16 py-2.5 hidden sm:flex justify-between items-center text-xs text-cream/70 select-none";

  return (
    <header className={headerBgClass}>
      {/* Utility Top Bar */}
      <div className={topBarBgClass}>
        {/* Left Side: Hızlı Menü */}
        <Link href="/#quick-menu" className="flex items-center space-x-2 hover:text-gold transition-colors font-semibold group">
          <span className="w-1.5 h-1.5 bg-gold rounded-full group-hover:scale-125 transition-transform animate-pulse" />
          <span>Hızlı Menü Portalı</span>
        </Link>
        
        {/* Right Side: Giriş Yap / Panel ve Teklif Al */}
        <div className="flex items-center space-x-6">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="hover:text-gold transition-colors font-semibold">
                Yönetim Paneli
              </Link>
              <span className="w-1 h-1 bg-gold/20 rounded-full" />
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.dispatchEvent(new Event("storage"));
                  window.location.href = "/dashboard/login";
                }}
                className="hover:text-red-400 transition-colors font-semibold cursor-pointer"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <Link href="/dashboard/login" className="hover:text-gold transition-colors font-semibold">
              Giriş Yap
            </Link>
          )}
          <span className="w-1 h-1 bg-gold/20 rounded-full" />
          <Link
            href="/contact"
            className="flex items-center space-x-1 bg-gold/10 hover:bg-gold text-gold hover:text-navy-dark px-3 py-0.5 rounded-full border border-gold/20 transition-all duration-300 font-semibold"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            <span>Teklif Al</span>
          </Link>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="w-full px-6 lg:px-16 h-28 flex items-center relative select-none">
        {/* Desktop Layout (Centered logo, split menus) */}
        <div className="hidden lg:flex items-center justify-between w-full h-full">
          
          {/* Left Menu (5/12 width) */}
          <nav className="flex items-center space-x-8 w-5/12 justify-end pr-12 h-full">
            {navItems.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="h-full flex items-center group/navitem static"
                onMouseEnter={() => item.dropdown && setActiveDropdown(idx)}
                onMouseLeave={() => item.dropdown && setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center space-x-1 text-base md:text-[17px] font-semibold hover:text-gold transition-colors duration-200"
                >
                  <span>{item.name}</span>
                  {item.dropdown && (
                    <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-300 ${activeDropdown === idx ? "rotate-180 text-gold" : ""}`} />
                  )}
                </Link>

                {/* Mega Menu Dropdown (Full Width, Sliding Down) */}
                {item.dropdown && activeDropdown === idx && (
                  <div className="absolute left-0 right-0 top-full w-full bg-[#030305]/75 backdrop-blur-xl border-t border-b border-gold/20 shadow-2xl z-50 animate-slide-down">
                    {/* Saydam Arka Plan Görseli */}
                    <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center mix-blend-overlay"></div>
                    <div className="max-w-7xl mx-auto px-6 lg:px-16 py-8 flex w-full gap-8 relative z-10">
                      {/* Left Column: Visual graphic & details */}
                      <div className="w-5/12 relative bg-navy overflow-hidden p-6 flex flex-col justify-end min-h-[220px] rounded-xl border border-gold/15">
                        <div className="absolute inset-0 z-0">
                          <Image
                            src={item.image || ""}
                            alt={item.name}
                            fill
                            className="object-cover opacity-20 transform scale-110 animate-float"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/70 to-transparent" />
                        </div>
                        <div className="relative z-10 text-cream">
                          <h4 className="font-playfair font-bold text-gold text-lg mb-1.5">{item.name}</h4>
                          <p className="text-xs text-cream/75 leading-relaxed font-light">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      {/* Right Column: Links list in grid */}
                      <div className="w-7/12 p-6 flex flex-col justify-center text-left">
                        <span className="text-[10px] font-bold text-gold/60 uppercase tracking-widest block mb-4 border-b border-gold/15 pb-2">
                          Bağlantılar
                        </span>
                        <div className="grid grid-cols-2 gap-4">
                          {item.dropdown.map((subItem, subIdx) => (
                            <Link
                              key={subIdx}
                              href={subItem.href}
                              target={subItem.href.startsWith("http") ? "_blank" : undefined}
                              rel={subItem.href.startsWith("http") ? "noopener noreferrer" : undefined}
                              className="flex items-center justify-between text-sm text-cream/80 hover:text-gold hover:translate-x-1.5 transition-all duration-200 group/link py-1 border-b border-gold/5"
                            >
                              <span>{subItem.name}</span>
                              <ArrowRight className="w-4 h-4 text-gold opacity-0 group-hover/link:opacity-100 transition-opacity" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Center Logo (2/12 width) */}
          <div className="flex flex-col items-center justify-center w-2/12 z-50">
            <Link href="/" className="flex flex-col items-center group relative text-center">
              <div className="relative w-20 h-20 md:w-24 md:h-24 overflow-hidden rounded-2xl border-2 border-gold shadow-lg shadow-gold/25 group-hover:border-gold-light group-hover:shadow-gold/45 transition-all duration-300 transform md:-mb-8 -mb-6 bg-[#030305]">
                <img
                  src={settings.logo_url || "/images/logo.jpg?v=3"}
                  alt={`${settings.site_title || "YAZE PROJE"} Logo`}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="font-playfair text-xl md:text-2xl font-bold tracking-wider text-gold group-hover:text-gold-light transition-colors duration-300 pt-7">
                {settings.site_title || "YAZE PROJE"}
              </span>
              <span className="text-[8px] md:text-[9px] uppercase tracking-[0.14em] text-gold-light/80 font-bold whitespace-nowrap pt-1">
                MİMARLIK & GAYRİMENKUL & YAZILIM
              </span>
            </Link>
          </div>

          {/* Right Menu (5/12 width) */}
          <nav className="flex items-center space-x-8 w-5/12 justify-start pl-12 h-full">
            {navItems.slice(3, 6).map((item, idx) => {
              const globalIdx = idx + 3;
              return (
                <div
                  key={globalIdx}
                  className="h-full flex items-center group/navitem static"
                  onMouseEnter={() => item.dropdown && setActiveDropdown(globalIdx)}
                  onMouseLeave={() => item.dropdown && setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="flex items-center space-x-1 text-base md:text-[17px] font-semibold hover:text-gold transition-colors duration-200"
                  >
                    <span>{item.name}</span>
                    {item.dropdown && (
                      <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-300 ${activeDropdown === globalIdx ? "rotate-180 text-gold" : ""}`} />
                    )}
                  </Link>

                  {/* Mega Menu Dropdown (Full Width, Sliding Down) */}
                  {item.dropdown && activeDropdown === globalIdx && (
                    <div className="absolute left-0 right-0 top-full w-full bg-[#030305]/75 backdrop-blur-xl border-t border-b border-gold/20 shadow-2xl z-50 animate-slide-down">
                      {/* Saydam Arka Plan Görseli */}
                      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center mix-blend-overlay"></div>
                      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-8 flex w-full gap-8 relative z-10">
                        {/* Left Column: Visual graphic & details */}
                        <div className="w-5/12 relative bg-navy overflow-hidden p-6 flex flex-col justify-end min-h-[220px] rounded-xl border border-gold/15">
                          <div className="absolute inset-0 z-0">
                            <Image
                              src={item.image || ""}
                              alt={item.name}
                              fill
                              className="object-cover opacity-20 transform scale-110 animate-float"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/70 to-transparent" />
                          </div>
                          <div className="relative z-10 text-cream">
                            <h4 className="font-playfair font-bold text-gold text-lg mb-1.5">{item.name}</h4>
                            <p className="text-xs text-cream/75 leading-relaxed font-light">
                              {item.desc}
                            </p>
                          </div>
                        </div>

                        {/* Right Column: Links list in grid */}
                        <div className="w-7/12 p-6 flex flex-col justify-center text-left">
                          <span className="text-[10px] font-bold text-gold/60 uppercase tracking-widest block mb-4 border-b border-gold/15 pb-2">
                            Bağlantılar
                          </span>
                          <div className="grid grid-cols-2 gap-4">
                            {item.dropdown.map((subItem, subIdx) => (
                              <Link
                              key={subIdx}
                              href={subItem.href}
                              target={subItem.href.startsWith("http") ? "_blank" : undefined}
                              rel={subItem.href.startsWith("http") ? "noopener noreferrer" : undefined}
                              className="flex items-center justify-between text-sm text-cream/80 hover:text-gold hover:translate-x-1.5 transition-all duration-200 group/link py-1 border-b border-gold/5"
                            >
                                <span>{subItem.name}</span>
                                <ArrowRight className="w-4 h-4 text-gold opacity-0 group-hover/link:opacity-100 transition-opacity" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Mobile Layout (Logo left, Hamburger right) */}
        <div className="lg:hidden flex justify-between items-center w-full h-full">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 overflow-hidden rounded-lg border border-gold bg-navy-dark">
              <img
                src={settings.logo_url || "/images/logo.jpg?v=3"}
                alt={`${settings.site_title || "YAZE PROJE"} Logo`}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-playfair text-base font-bold tracking-wide text-gold">
                {settings.site_title || "YAZE PROJE"}
              </span>
              <span className="text-[7px] uppercase tracking-wider text-gold-light/90 font-bold">
                MİMARLIK & GAYRİMENKUL & YAZILIM
              </span>
            </div>
          </Link>

          <button
            onClick={toggleMenu}
            className="p-2 text-cream hover:text-gold transition-colors focus:outline-none"
            aria-label="Menüyü Aç/Kapat"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden bg-navy-dark border-t border-gold/10 py-4 px-6 animate-fade-in-up">
          <div className="flex flex-col space-y-4">
            <Link
              href="/#quick-menu"
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold hover:text-gold py-1.5 border-b border-cream/5 flex items-center space-x-2 text-gold"
            >
              <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
              <span>Hızlı Menü Portalı</span>
            </Link>
            {navItems.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <Link
                  href={item.href}
                  onClick={() => !item.dropdown && setIsOpen(false)}
                  className="text-sm font-medium hover:text-gold py-1.5 border-b border-cream/5 flex justify-between items-center"
                >
                  <span>{item.name}</span>
                </Link>
                {item.dropdown && (
                  <div className="pl-4 py-2 flex flex-col space-y-2 border-l border-gold/20 mt-1">
                    {item.dropdown.map((subItem, subIdx) => (
                      <Link
                        key={subIdx}
                        href={subItem.href}
                        target={subItem.href.startsWith("http") ? "_blank" : undefined}
                        rel={subItem.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        onClick={() => setIsOpen(false)}
                        className="text-xs text-cream/75 hover:text-gold py-1"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center items-center border border-gold text-gold font-semibold text-xs py-3 rounded-md shadow-md transition-colors"
                  >
                    <span>Yönetim</span>
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      window.dispatchEvent(new Event("storage"));
                      setIsOpen(false);
                      window.location.href = "/dashboard/login";
                    }}
                    className="flex justify-center items-center border border-red-500/30 text-red-400 font-semibold text-xs py-3 rounded-md shadow-md transition-colors"
                  >
                    <span>Çıkış Yap</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/dashboard/login"
                  onClick={() => setIsOpen(false)}
                  className="flex justify-center items-center border border-gold text-gold font-semibold text-xs py-3 rounded-md shadow-md transition-colors"
                >
                  <span>Giriş Yap</span>
                </Link>
              )}
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="flex justify-center items-center space-x-2 bg-gold hover:bg-gold-light text-navy-dark font-semibold text-xs py-3 rounded-md shadow-md transition-colors"
              >
                <MessageSquare className="w-4.5 h-4.5" />
                <span>Teklif Al</span>
              </Link>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
