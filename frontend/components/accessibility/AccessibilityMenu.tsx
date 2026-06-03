"use client";

import React, { useState, useEffect } from "react";
import { Eye, Check, RefreshCw, X, Type } from "lucide-react";

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);

  useEffect(() => {
    // Keyboard Shortcut (Ctrl + Y)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "y") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    // Apply styling classes to HTML / Body tag
    const html = document.documentElement;
    
    if (highContrast) {
      html.classList.add("high-contrast");
    } else {
      html.classList.remove("high-contrast");
    }

    if (largeText) {
      html.classList.add("large-text");
    } else {
      html.classList.remove("large-text");
    }

    if (dyslexicFont) {
      html.classList.add("dyslexia-font");
    } else {
      html.classList.remove("dyslexia-font");
    }

    if (highlightLinks) {
      html.classList.add("highlight-links");
    } else {
      html.classList.remove("highlight-links");
    }
  }, [highContrast, largeText, dyslexicFont, highlightLinks]);

  const handleReset = () => {
    setHighContrast(false);
    setLargeText(false);
    setDyslexicFont(false);
    setHighlightLinks(false);
  };

  return (
    <>
      {/* Floating Accessibility Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-36 md:bottom-24 right-6 z-50 bg-navy hover:bg-navy-light text-gold border border-gold/40 p-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center focus:outline-none"
        title="Erişilebilirlik Menüsü (Ctrl + Y)"
        aria-label="Erişilebilirlik Menüsünü Aç"
      >
        <Eye className="w-5.5 h-5.5" />
      </button>

      {/* Side Panel */}
      {isOpen && (
        <div className="fixed top-0 bottom-0 right-0 w-80 bg-navy-dark border-l border-gold/30 z-50 shadow-2xl text-cream p-6 flex flex-col justify-between animate-fade-in-up select-none">
          <div>
            <div className="flex justify-between items-center border-b border-gold/20 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <Eye className="w-5.5 h-5.5 text-gold" />
                <h3 className="font-playfair font-bold text-md text-gold">
                  Erişilebilirlik
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-cream/60 hover:text-gold transition-colors"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Contrast Option */}
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`w-full flex justify-between items-center p-3 rounded-lg border text-left text-xs font-semibold transition-all ${
                  highContrast
                    ? "bg-gold text-navy-dark border-gold"
                    : "bg-navy border-gold/20 hover:border-gold/50"
                }`}
              >
                <span>Yüksek Kontrast</span>
                {highContrast && <Check className="w-4 h-4" />}
              </button>

              {/* Text Size Option */}
              <button
                onClick={() => setLargeText(!largeText)}
                className={`w-full flex justify-between items-center p-3 rounded-lg border text-left text-xs font-semibold transition-all ${
                  largeText
                    ? "bg-gold text-navy-dark border-gold"
                    : "bg-navy border-gold/20 hover:border-gold/50"
                }`}
              >
                <span>Büyük Metin</span>
                {largeText && <Check className="w-4 h-4" />}
              </button>

              {/* Highlight Links Option */}
              <button
                onClick={() => setHighlightLinks(!highlightLinks)}
                className={`w-full flex justify-between items-center p-3 rounded-lg border text-left text-xs font-semibold transition-all ${
                  highlightLinks
                    ? "bg-gold text-navy-dark border-gold"
                    : "bg-navy border-gold/20 hover:border-gold/50"
                }`}
              >
                <span>Bağlantıları Vurgula</span>
                {highlightLinks && <Check className="w-4 h-4" />}
              </button>

              {/* Dyslexic Font Option */}
              <button
                onClick={() => setDyslexicFont(!dyslexicFont)}
                className={`w-full flex justify-between items-center p-3 rounded-lg border text-left text-xs font-semibold transition-all ${
                  dyslexicFont
                    ? "bg-gold text-navy-dark border-gold"
                    : "bg-navy border-gold/20 hover:border-gold/50"
                }`}
              >
                <span className="font-sans">Disleksi Dostu Yazı Tipi</span>
                {dyslexicFont && <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="border-t border-gold/20 pt-4 mt-6">
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center space-x-2 bg-cream/10 hover:bg-cream/20 text-cream text-xs font-semibold py-2.5 rounded-lg transition-colors border border-cream/10"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ayarları Sıfırla</span>
            </button>
            <p className="text-[10px] text-center text-cream/40 mt-3">
              Kısayol: Menüyü açmak için <kbd className="bg-navy border border-cream/20 px-1.5 py-0.5 rounded text-[9px]">Ctrl + Y</kbd> basın.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
