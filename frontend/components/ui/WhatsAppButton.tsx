"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const handleWhatsAppRedirect = () => {
    window.open("https://wa.me/903124840000", "_blank");
  };

  return (
    <button
      onClick={handleWhatsAppRedirect}
      className="fixed bottom-20 md:bottom-8 right-6 z-50 bg-[#25D366] hover:bg-[#20ba59] text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group focus:outline-none"
      aria-label="WhatsApp üzerinden mesaj gönderin"
    >
      {/* Pulse Rings */}
      <span className="absolute -inset-0.5 rounded-full bg-[#25D366]/40 animate-ping opacity-75 group-hover:animate-none"></span>
      <MessageCircle className="w-6 h-6 relative z-10" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out whitespace-nowrap text-xs font-semibold relative z-10 pl-0 group-hover:pl-2">
        Hızlı Destek
      </span>
    </button>
  );
}
