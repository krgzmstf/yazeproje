"use client";

import React from "react";
import Link from "next/link";
import { Home, Compass, Key, Newspaper, PhoneCall } from "lucide-react";

export default function MobileBottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-navy-dark border-t border-gold/20 text-cream/70 md:hidden select-none">
      <div className="flex justify-around items-center h-16 px-2">
        <Link
          href="/"
          className="flex flex-col items-center justify-center space-y-1 w-12 hover:text-gold transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px]">Ana Sayfa</span>
        </Link>
        <Link
          href="#"
          className="flex flex-col items-center justify-center space-y-1 w-12 hover:text-gold transition-colors"
        >
          <Compass className="w-5 h-5" />
          <span className="text-[9px]">Projeler</span>
        </Link>
        <Link
          href="#"
          className="flex flex-col items-center justify-center space-y-1 w-12 hover:text-gold transition-colors"
        >
          <Key className="w-5 h-5" />
          <span className="text-[9px]">Gayrimenkul</span>
        </Link>
        <Link
          href="#"
          className="flex flex-col items-center justify-center space-y-1 w-12 hover:text-gold transition-colors"
        >
          <Newspaper className="w-5 h-5" />
          <span className="text-[9px]">Haberler</span>
        </Link>
        <Link
          href="#"
          className="flex flex-col items-center justify-center space-y-1 w-12 hover:text-gold transition-colors"
        >
          <PhoneCall className="w-5 h-5" />
          <span className="text-[9px]">İletişim</span>
        </Link>
      </div>
    </div>
  );
}
