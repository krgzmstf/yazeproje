"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-navy-dark text-cream flex items-center justify-center p-6 select-none">
      <div className="max-w-md w-full text-center bg-navy border border-gold/25 rounded-2xl p-8 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="font-playfair text-4xl font-bold text-error mb-2">Hata Oluştu</h1>
        <h2 className="text-sm font-semibold mb-4 text-cream/90">Sistemde beklenmeyen bir sorun meydana geldi.</h2>
        <p className="text-xs text-cream/60 leading-relaxed mb-8">
          İşlem gerçekleştirilirken teknik bir aksaklık yaşandı. Lütfen sayfayı yenilemeyi veya daha sonra tekrar denemeyi seçin.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-gold-dark to-gold hover:from-gold hover:to-gold-light text-navy-dark font-bold text-xs px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Tekrar Dene</span>
        </button>
      </div>
    </div>
  );
}
