"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("kvkk_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("kvkk_consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("kvkk_consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 left-4 right-4 md:left-8 md:right-auto md:max-w-md bg-navy-dark/95 border border-gold/30 rounded-xl shadow-2xl p-5 z-50 text-cream animate-fade-in-up backdrop-blur-md">
      <div className="flex items-start space-x-3.5">
        <ShieldCheck className="w-6 h-6 text-gold flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-xs text-gold uppercase tracking-wider mb-1">
            KVKK & Çerez Politikası
          </h4>
          <p className="text-[11px] text-cream/80 leading-relaxed">
            Size daha iyi bir deneyim sunabilmek amacıyla çerezler kullanıyoruz. Sitemizi kullanarak çerez kullanımını kabul etmiş olursunuz.
            Detaylı bilgi için{" "}
            <Link href="#" className="underline text-gold hover:text-gold-light">
              Aydınlatma Metnini
            </Link>{" "}
            inceleyebilirsiniz.
          </p>
          <div className="flex items-center space-x-3 mt-4">
            <button
              onClick={handleAccept}
              className="bg-gold hover:bg-gold-light text-navy-dark text-[11px] font-semibold px-4 py-2 rounded transition-colors duration-200"
            >
              Kabul Et
            </button>
            <button
              onClick={handleDecline}
              className="bg-cream/10 hover:bg-cream/20 text-cream/95 text-[11px] font-medium px-4 py-2 rounded transition-colors duration-200"
            >
              Reddet
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-cream/50 hover:text-gold transition-colors"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
