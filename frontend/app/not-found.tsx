"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-dark text-cream flex items-center justify-center p-6 select-none">
      <div className="max-w-md w-full text-center bg-navy border border-gold/25 rounded-2xl p-8 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="font-playfair text-6xl font-bold text-gold mb-2">404</h1>
        <h2 className="font-playfair text-xl font-bold mb-4">Sayfa Bulunamadı</h2>
        <p className="text-xs text-cream/70 leading-relaxed mb-8">
          Aradığınız sayfa silinmiş, ismi değiştirilmiş veya geçici olarak kullanım dışı kalmış olabilir. Lütfen ana sayfaya dönmeyi deneyin.
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-gold-dark to-gold hover:from-gold hover:to-gold-light text-navy-dark font-bold text-xs px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
        >
          <Home className="w-4 h-4" />
          <span>Ana Sayfaya Dön</span>
        </Link>
      </div>
    </div>
  );
}
