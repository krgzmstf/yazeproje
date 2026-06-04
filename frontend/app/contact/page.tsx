"use client";

import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { subscribe, submitContactMessage } from "@/lib/api";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      // Submit contact message details
      const res = await submitContactMessage({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject,
        message: formData.message,
      });

      if (res.id) {
        setSuccess(true);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        setErrorMsg("Mesaj kaydedilirken bir hata oluştu.");
      }
    } catch (error: any) {
      console.error("Contact form submit failed:", error);
      setErrorMsg("Bağlantı hatası. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-navy min-h-screen text-cream pt-12 pb-24 select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
            İletişim
          </span>
          <h1 className="font-playfair text-3xl md:text-5xl font-bold text-cream mt-3">
            Bizimle İletişime Geçin
          </h1>
          <div className="w-16 h-1 bg-gold mx-auto mt-5 rounded-full" />
          <p className="text-sm text-cream/70 mt-4 leading-relaxed font-light">
            Projeleriniz, gayrimenkul talepleriniz ve mühendislik çözümlerimiz hakkında bilgi almak için formu doldurabilirsiniz.
          </p>
        </div>

        {/* Contact Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column (5/12): Information details */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Premium Logo Showcase */}
            <div className="bg-navy-dark border border-gold/15 rounded-2xl p-8 flex flex-col items-center justify-center shadow-xl text-center">
              <div className="relative w-28 h-28 md:w-36 md:h-36 overflow-hidden rounded-2xl border-2 border-gold shadow-lg shadow-gold/25 bg-navy mb-4">
                <img
                  src="/images/logo.jpg?v=3"
                  alt="YAZE PROJE Logo"
                  className="object-cover w-full h-full"
                />
              </div>
              <h2 className="font-playfair text-xl md:text-2xl font-bold tracking-wider text-gold">YAZE PROJE</h2>
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.15em] text-gold-light/80 font-bold mt-1.5">
                MİMARLIK & GAYRİMENKUL & YAZILIM
              </span>
            </div>

            <div className="bg-navy-dark border border-gold/15 rounded-2xl p-6 md:p-8 shadow-xl space-y-8">
              
              <h2 className="font-playfair text-xl md:text-2xl font-bold text-gold border-b border-gold/10 pb-4">
                İletişim Bilgileri
              </h2>

              {/* Address */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gold/10 rounded-lg text-gold shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-cream text-sm">Merkez Ofis</h4>
                  <p className="text-xs text-cream/70 leading-relaxed mt-1">
                    Bahçelievler Mah. Cumhuriyet Cad. No:7/1,<br />
                    Gölbaşı, Ankara / Türkiye
                  </p>
                </div>
              </div>

              {/* Phones */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gold/10 rounded-lg text-gold shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-cream text-sm">Telefon Numaraları</h4>
                  <p className="text-xs text-cream/70 leading-relaxed mt-1">
                    Mobil: +90 (532) 176 0432<br />
                    Ofis: +90 (312) 484 00 00
                  </p>
                </div>
              </div>

              {/* Emails */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gold/10 rounded-lg text-gold shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-cream text-sm">E-posta Adresleri</h4>
                  <p className="text-xs text-cream/70 leading-relaxed mt-1">
                    ercang@yazeproje.com<br />
                    info@yazeproje.com
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gold/10 rounded-lg text-gold shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-cream text-sm">Çalışma Saatleri</h4>
                  <p className="text-xs text-cream/70 leading-relaxed mt-1">
                    Pazartesi - Cuma: 09:00 - 18:00<br />
                    Cumartesi: 10:00 - 14:00 (Pazar Kapalı)
                  </p>
                </div>
              </div>

            </div>

            {/* Simulated Luxury Styled map box */}
            <div className="relative h-60 w-full rounded-2xl overflow-hidden border border-gold/15 shadow-xl bg-navy-dark">
              {/* Overlay with stylish look */}
              <div className="absolute inset-0 bg-navy-dark/40 z-10 flex flex-col justify-end p-5">
                <span className="text-[9px] font-bold text-gold uppercase tracking-widest block mb-1">Ankara, Gölbaşı</span>
                <span className="text-xs text-cream font-semibold">Bahçelievler Mah. No: 7/1</span>
              </div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3066.685324546654!2d32.8055452!3d39.7891223!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d3509930f6a1e3%3A0xe4a1c5d944c693bf!2zR8O2bGJhxZ_EsywgQW5rYXJh!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str"
                width="100%"
                height="100%"
                style={{ border: 0, opacity: 0.6 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>

          {/* Right Column (7/12): Form */}
          <div className="lg:col-span-7 bg-navy-dark border border-gold/15 rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center space-x-2 text-gold border-b border-gold/10 pb-4 mb-6">
              <MessageSquare className="w-5 h-5" />
              <h2 className="font-playfair text-xl md:text-2xl font-bold">Teklif & İletişim Formu</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full name */}
                <div>
                  <label htmlFor="fullName" className="block text-[10px] uppercase font-bold text-cream/60 tracking-wider mb-2">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Adınız Soyadınız"
                    required
                    className="w-full bg-navy border border-gold/15 focus:border-gold rounded-lg px-4 py-3 text-sm text-cream placeholder-cream/40 outline-none transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-[10px] uppercase font-bold text-cream/60 tracking-wider mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ornek@mail.com"
                    required
                    className="w-full bg-navy border border-gold/15 focus:border-gold rounded-lg px-4 py-3 text-sm text-cream placeholder-cream/40 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-[10px] uppercase font-bold text-cream/60 tracking-wider mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="05XX XXX XX XX"
                    className="w-full bg-navy border border-gold/15 focus:border-gold rounded-lg px-4 py-3 text-sm text-cream placeholder-cream/40 outline-none transition-colors"
                  />
                </div>

                {/* Subject selection */}
                <div>
                  <label htmlFor="subject" className="block text-[10px] uppercase font-bold text-cream/60 tracking-wider mb-2">
                    İlgi Alanı / Konu
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full bg-navy border border-gold/15 focus:border-gold rounded-lg px-4 py-3 text-sm text-cream outline-none transition-colors appearance-none"
                  >
                    <option value="" disabled>Seçiniz</option>
                    <option value="yapi">Yapı & İnşaat</option>
                    <option value="mimarlik">Mimarlık & Tasarım</option>
                    <option value="gayrimenkul">Gayrimenkul Yatırımı</option>
                    <option value="yazilim">Yazılım Çözümleri</option>
                    <option value="diger">Diğer Konular</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-[10px] uppercase font-bold text-cream/60 tracking-wider mb-2">
                  Mesajınız
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Projeniz veya almak istediğiniz hizmet hakkında bilgi verin..."
                  required
                  className="w-full bg-navy border border-gold/15 focus:border-gold rounded-lg px-4 py-3 text-sm text-cream placeholder-cream/40 outline-none transition-colors resize-none"
                />
              </div>

              {/* Feedback messages */}
              {success && (
                <div className="flex items-center space-x-2 text-success bg-success/10 border border-success/30 px-4 py-3 rounded-lg text-xs md:text-sm animate-fade-in-up">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Mesajınız ve abonelik talebiniz başarıyla kaydedilmiştir. Teşekkürler!</span>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center space-x-2 text-error bg-error/10 border border-error/30 px-4 py-3 rounded-lg text-xs md:text-sm animate-fade-in-up">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-gold-dark via-gold to-gold-light hover:from-gold-light hover:to-gold-dark text-navy-dark font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg hover:shadow-gold/10 transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? "Gönderiliyor..." : "Mesaj Gönder"}</span>
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
